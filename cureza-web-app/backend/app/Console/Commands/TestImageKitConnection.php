<?php

namespace App\Console\Commands;

use App\Services\ImageKitService;
use Illuminate\Console\Command;

class TestImageKitConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:test-connection';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test credentials and API connection to ImageKit.io';

    protected $imageKit;

    public function __construct(ImageKitService $imageKit)
    {
        parent::__construct();
        $this->imageKit = $imageKit;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing ImageKit.io credentials and connectivity...');
        $this->line('Endpoint: ' . config('services.imagekit.url_endpoint'));
        $this->line('Public Key: ' . config('services.imagekit.public_key'));
        
        if (empty(config('services.imagekit.private_key'))) {
            $this->error('ERROR: ImageKit Private Key is empty. Check your backend .env file.');
            return 1;
        }

        // 1x1 transparent pixel base64
        $pixelBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        $fileName = 'test_connection_pixel_' . time() . '.gif';

        $this->line('Attempting test upload (1x1 transparent GIF)...');

        try {
            $result = $this->imageKit->upload($pixelBase64, $fileName, '/test_connection', ['connection_test']);
            
            if (isset($result['url'])) {
                $this->info('SUCCESS: Upload completed successfully!');
                $this->info('Uploaded URL: ' . $result['url']);
                $this->info('File ID: ' . ($result['fileId'] ?? 'N/A'));

                if (isset($result['fileId'])) {
                    $this->line('Cleaning up test file from ImageKit...');
                    $deleted = $this->imageKit->delete($result['fileId']);
                    if ($deleted) {
                        $this->info('SUCCESS: Test file cleaned up and deleted from ImageKit storage.');
                    } else {
                        $this->warn('WARNING: Could not delete the test file. Please delete it manually from dashboard.');
                    }
                }
                
                return 0;
            }
        } catch (\Exception $e) {
            $this->error('ERROR: Connection or Upload failed!');
            $this->error($e->getMessage());
        }

        return 1;
    }
}
