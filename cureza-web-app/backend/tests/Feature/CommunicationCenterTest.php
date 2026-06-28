<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use App\Models\SmtpSetting;
use App\Models\EmailTemplate;
use App\Models\EmailLog;
use App\Models\Subscriber;
use App\Services\Communication\CommunicationService;
use App\Jobs\SendEmailJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CommunicationCenterTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user for requests authentication
        $this->admin = User::factory()->create([
            'role' => 'super_admin',
            'email' => 'admin@cureza.in',
        ]);

        // Seed a default active SMTP provider globally (for all tests)
        SmtpSetting::create([
            'provider_name' => 'Hostinger Test SMTP',
            'host' => 'smtp.hostinger.com',
            'port' => 465,
            'username' => 'admin@cureza.in',
            'password' => 'secret',
            'encryption' => 'ssl',
            'sender_name' => 'Cureza',
            'sender_email' => 'admin@cureza.in',
            'is_active' => true,
        ]);
    }

    /** @test */
    public function system_can_create_smtp_provider_settings_via_api()
    {
        // Delete setup SMTP so we can test creating one as primary active
        SmtpSetting::truncate();

        $data = [
            'provider_name' => 'Test SMTP Mailer',
            'host' => 'smtp.mailtrap.io',
            'port' => 2525,
            'username' => 'test-user',
            'password' => 'secret-pass',
            'encryption' => 'tls',
            'sender_name' => 'Cureza Test',
            'sender_email' => 'sender@cureza.in',
            'timeout' => 30,
            'retry_count' => 3,
            'is_active' => true,
        ];

        // We mock the credential validation inside SmtpConfigurationService
        $this->mock(\App\Services\Communication\SmtpConfigurationService::class, function ($mock) {
            $mock->shouldReceive('validateCredentials')->once()->andReturn([
                'success' => true,
                'message' => 'Verified'
            ]);
        });

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/communication/smtp', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('communication_smtp_settings', [
            'provider_name' => 'Test SMTP Mailer',
            'host' => 'smtp.mailtrap.io',
        ]);

        // Verify password auto-encryption mutator
        $setting = SmtpSetting::first();
        $this->assertNotEquals('secret-pass', $setting->getRawOriginal('password'));
        $this->assertEquals('secret-pass', $setting->password); // decrypted via accessor
    }

    /** @test */
    public function email_template_blade_dynamic_compilation_works()
    {
        $template = EmailTemplate::create([
            'key' => 'auth.test_otp',
            'name' => 'Test OTP',
            'subject' => 'Verification Code: {{ $otp }}',
            'body' => '<h3>Welcome {{ $name }}</h3><p>Your OTP is {{ $otp }}.</p>',
            'theme' => 'light',
        ]);

        $variables = ['name' => 'Alice', 'otp' => '987654'];
        
        $compiledSubject = $template->compileSubject($variables);
        $compiledBody = $template->compile($variables);

        $this->assertEquals('Verification Code: 987654', $compiledSubject);
        $this->assertStringContainsString('Welcome Alice', $compiledBody);
        $this->assertStringContainsString('Your OTP is 987654', $compiledBody);
    }

    /** @test */
    public function central_communication_service_routes_and_queues_email_log()
    {
        Queue::fake();

        // Seed a template
        EmailTemplate::create([
            'key' => 'auth.login_otp',
            'name' => 'OTP',
            'subject' => 'OTP: {{ $otp }}',
            'body' => '<p>OTP Code: {{ $otp }}</p>',
        ]);

        $commService = app(CommunicationService::class);
        $log = $commService->send('client@example.com', 'Login OTP', 'auth.login_otp', ['otp' => '123456']);

        $this->assertDatabaseHas('communication_logs', [
            'id' => $log->id,
            'recipient' => 'client@example.com',
            'status' => 'queued',
        ]);

        Queue::assertPushed(SendEmailJob::class, function ($job) use ($log) {
            return $job->backoff() === [60, 300, 900]; // 1m, 5m, 15m retry intervals
        });
    }

    /** @test */
    public function newsletter_subscription_and_double_opt_in_works()
    {
        Queue::fake();

        // Seed templates
        EmailTemplate::create([
            'key' => 'newsletter.double_opt_in',
            'name' => 'Confirm Sub',
            'subject' => 'Confirm',
            'body' => '<p>Click here: {{ $verification_link }}</p>',
        ]);

        $response = $this->postJson('/api/public/newsletter/subscribe', [
            'email' => 'subscriber@test.com',
            'name' => 'Bob'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('communication_subscribers', [
            'email' => 'subscriber@test.com',
            'status' => 'pending',
        ]);

        $subscriber = Subscriber::where('email', 'subscriber@test.com')->first();
        $this->assertNotNull($subscriber->double_opt_in_token);

        // Verification redirect trigger
        $verifyResponse = $this->get("/api/newsletter/verify?token=" . $subscriber->double_opt_in_token);
        $verifyResponse->assertStatus(302); // Redirect to Next.js dashboard

        $subscriber->refresh();
        $this->assertEquals('subscribed', $subscriber->status);
        $this->assertNull($subscriber->double_opt_in_token);
    }
}
