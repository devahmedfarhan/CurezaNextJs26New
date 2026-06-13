<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\SystemSetting;
use App\Services\SystemSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class SystemSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Clear cached settings before each test
        SystemSettingsService::clearCache();
    }

    /**
     * Test that secret settings are encrypted in the database.
     */
    public function test_system_settings_are_encrypted_in_database(): void
    {
        $setting = SystemSetting::create([
            'key' => 'test_secret_key',
            'value' => 'my-super-secret-value',
            'group' => 'email',
            'is_secret' => true,
        ]);

        // Raw database query must show encrypted value
        $rawDbValue = \Illuminate\Support\Facades\DB::table('system_settings')
            ->where('key', 'test_secret_key')
            ->value('value');

        $this->assertNotEquals('my-super-secret-value', $rawDbValue);
        $this->assertEquals('my-super-secret-value', Crypt::decryptString($rawDbValue));

        // Eloquent access must automatically decrypt it
        $this->assertEquals('my-super-secret-value', $setting->value);
    }

    /**
     * Test settings runtime config overrides Laravel defaults.
     */
    public function test_system_settings_override_laravel_configs(): void
    {
        SystemSetting::where('key', 'mail_host')->update(['value' => 'smtp.customdomain.com']);
        SystemSetting::where('key', 'mail_port')->update(['value' => '587']);
        SystemSetting::where('key', 'google_auth_enabled')->update(['value' => '1']);

        SystemSettingsService::clearCache();
        SystemSettingsService::loadToConfig();

        $this->assertEquals('smtp.customdomain.com', config('mail.mailers.smtp.host'));
        $this->assertEquals('587', config('mail.mailers.smtp.port'));
        $this->assertTrue(config('services.google.enabled'));
    }

    /**
     * Test public settings endpoint does not leak secrets.
     */
    public function test_public_settings_endpoint_does_not_leak_secrets(): void
    {
        $response = $this->getJson('/api/settings/public');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'google_auth_enabled',
            'google_client_id',
            'otp_enabled',
            'razorpay_enabled',
            'razorpay_key',
            'theme_primary_color',
            'theme_background_color',
            'theme_border_radius',
            'theme_font_heading',
            'theme_font_body',
            'homepage_section_order'
        ]);

        // Ensure sensitive fields are absent
        $response->assertJsonMissing(['google_client_secret']);
        $response->assertJsonMissing(['mail_password']);
        $response->assertJsonMissing(['razorpay_secret']);
    }

    /**
     * Test Google login endpoint verifies token via HTTP request and creates user.
     */
    public function test_google_login_validates_token_via_http_and_creates_user(): void
    {
        // Mock the Google Tokeninfo API response
        Http::fake([
            'oauth2.googleapis.com/tokeninfo*' => Http::response([
                'aud' => 'mock-google-client-id',
                'email' => 'google-user@example.com',
                'name' => 'Google User',
                'sub' => '1234567890',
            ], 200)
        ]);

        // Ensure google auth is mocked as enabled and client id is matched
        Config::set('services.google.enabled', true);
        Config::set('services.google.client_id', 'mock-google-client-id');

        $response = $this->postJson('/api/auth/google', [
            'credential' => 'valid-mocked-google-token',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'access_token',
            'token_type',
            'user' => [
                'id',
                'name',
                'email',
                'role',
            ]
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'google-user@example.com',
            'name' => 'Google User',
            'role' => 'customer',
        ]);
    }
}
