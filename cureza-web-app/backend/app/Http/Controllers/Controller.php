<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Store uploaded file securely with magic byte checking, UUID renaming, and S3 dynamic routing.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $folder
     * @param array $allowedMimes
     * @return string
     * @throws \InvalidArgumentException
     */
    protected function storeFileSecurely(\Illuminate\Http\UploadedFile $file, string $folder, array $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'])
    {
        // 1. Magic bytes validation (FileInfo checks MIME)
        $realMime = $file->getMimeType();
        if (!in_array($realMime, $allowedMimes)) {
            throw new \InvalidArgumentException('Forbidden file type: ' . $realMime);
        }

        // 2. Cryptographically secure UUID filename
        $extension = $file->guessExtension() ?? $file->getClientOriginalExtension();
        $filename = \Illuminate\Support\Str::uuid() . '.' . $extension;

        // 3. Isolated S3 storage dynamically routed via environment configuration
        $disk = env('FILESYSTEM_DISK') === 's3' ? 's3' : 'public';

        return $file->storeAs($folder, $filename, $disk);
    }
}
