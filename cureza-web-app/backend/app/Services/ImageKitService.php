<?php

namespace App\Services;

use ImageKit\ImageKit;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ImageKitService
{
    protected $client;
    protected $publicKey;
    protected $privateKey;
    protected $urlEndpoint;

    public function __construct()
    {
        $this->publicKey = config('services.imagekit.public_key');
        $this->privateKey = config('services.imagekit.private_key');
        $this->urlEndpoint = config('services.imagekit.url_endpoint');

        if (class_exists(ImageKit::class) && !empty($this->privateKey)) {
            try {
                $this->client = new ImageKit(
                    $this->publicKey,
                    $this->privateKey,
                    $this->urlEndpoint
                );
            } catch (\Exception $e) {
                Log::error('ImageKit initialization error: ' . $e->getMessage());
            }
        }
    }

    /**
     * Upload a file to ImageKit
     * 
     * @param string|resource|\Illuminate\Http\UploadedFile $file
     * @param string $fileName
     * @param string $folder
     * @param array $tags
     * @return array
     */
    public function upload($file, string $fileName, string $folder = '/', array $tags = [])
    {
        // Normalize file content
        $fileContent = null;
        if ($file instanceof \Illuminate\Http\UploadedFile) {
            $fileContent = base64_encode(file_get_contents($file->getPathname()));
        } elseif (is_string($file) && !str_starts_with($file, 'data:') && filter_var($file, FILTER_VALIDATE_URL) === false) {
            if (file_exists($file)) {
                $fileContent = base64_encode(file_get_contents($file));
            } else {
                $fileContent = base64_encode($file);
            }
        } else {
            // base64 string or URL
            $fileContent = $file;
        }

        $folder = '/' . trim($folder, '/');

        if ($this->client) {
            try {
                $response = $this->client->uploadFiles([
                    'file' => $fileContent,
                    'fileName' => $fileName,
                    'folder' => $folder,
                    'tags' => $tags,
                    'useUniqueFileName' => true
                ]);

                if (isset($response->error) && $response->error) {
                    throw new \Exception($response->error->message ?? 'ImageKit upload error');
                }

                // Convert stdClass result to array
                $result = json_decode(json_encode($response->result), true);
                Log::info('ImageKit upload success:', $result);
                return $result;
            } catch (\Exception $e) {
                Log::error('ImageKit upload failed via SDK: ' . $e->getMessage() . '. Falling back to HTTP client.');
            }
        }

        // Direct HTTP client fallback upload
        return $this->uploadViaHttp($fileContent, $fileName, $folder, $tags);
    }

    /**
     * Delete a file from ImageKit
     * 
     * @param string $fileId
     * @return bool
     */
    public function delete(string $fileId): bool
    {
        if (empty($fileId)) {
            return false;
        }

        if ($this->client) {
            try {
                $response = $this->client->deleteFile($fileId);
                return true;
            } catch (\Exception $e) {
                Log::error('ImageKit delete failed via SDK: ' . $e->getMessage() . '. Falling back to HTTP client.');
            }
        }

        return $this->deleteViaHttp($fileId);
    }

    /**
     * Upload fallback using direct HTTP API
     */
    protected function uploadViaHttp($fileContent, string $fileName, string $folder, array $tags)
    {
        Log::info('Uploading via ImageKit HTTP API fallback');

        // Check if $fileContent is base64 string
        $binary = @base64_decode($fileContent, true);
        $payloadFile = ($binary !== false) ? $binary : $fileContent;

        $response = Http::withBasicAuth($this->privateKey, '')
            ->attach('file', $payloadFile, $fileName)
            ->post('https://upload.imagekit.io/api/v1/files/upload', [
                'fileName' => $fileName,
                'folder' => $folder,
                'tags' => implode(',', $tags),
                'useUniqueFileName' => 'true'
            ]);

        if ($response->failed()) {
            throw new \Exception('ImageKit HTTP upload failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Delete fallback using direct HTTP API
     */
    protected function deleteViaHttp(string $fileId): bool
    {
        Log::info('Deleting via ImageKit HTTP API fallback');

        $response = Http::withBasicAuth($this->privateKey, '')
            ->delete("https://api.imagekit.io/v1/files/{$fileId}");

        return $response->successful();
    }
}
