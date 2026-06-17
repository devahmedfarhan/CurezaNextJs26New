<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    /**
     * Get the directory where backups are stored.
     */
    private function getBackupDir()
    {
        $dir = storage_path('app/backups');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }
        return $dir;
    }

    /**
     * Display a listing of backups.
     */
    public function index()
    {
        try {
            $dir = $this->getBackupDir();
            $files = File::files($dir);
            
            $backups = [];
            foreach ($files as $file) {
                if ($file->getExtension() === 'sqlite' || $file->getExtension() === 'sql') {
                    $backups[] = [
                        'name' => $file->getFilename(),
                        'size' => $this->formatBytes($file->getSize()),
                        'date' => date('Y-m-d H:i:s', $file->getMTime()),
                        'timestamp' => $file->getMTime()
                    ];
                }
            }

            // Sort by latest backup first
            usort($backups, function ($a, $b) {
                return $b['timestamp'] <=> $a['timestamp'];
            });

            return response()->json($backups);
        } catch (\Exception $e) {
            Log::error('Failed to list backups: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to list backups: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new manual database backup.
     */
    public function create()
    {
        try {
            $connection = config('database.default');
            
            if ($connection !== 'sqlite') {
                return response()->json([
                    'message' => 'Database backup is currently only supported for SQLite configurations.'
                ], 400);
            }

            $dbPath = config('database.connections.sqlite.database');
            
            if (!File::exists($dbPath)) {
                // Fallback to database_path('database.sqlite')
                $dbPath = database_path('database.sqlite');
            }

            if (!File::exists($dbPath)) {
                return response()->json([
                    'message' => 'Active SQLite database file not found at: ' . $dbPath
                ], 404);
            }

            $dir = $this->getBackupDir();
            $filename = 'cureza_db_backup_' . date('Y_m_d_His') . '.sqlite';
            $backupPath = $dir . DIRECTORY_SEPARATOR . $filename;

            // Copy SQLite database file to backups folder
            if (File::copy($dbPath, $backupPath)) {
                Log::info('Database backup created: ' . $filename);
                return response()->json([
                    'message' => 'Database backup created successfully.',
                    'backup' => [
                        'name' => $filename,
                        'size' => $this->formatBytes(File::size($backupPath)),
                        'date' => date('Y-m-d H:i:s', File::lastModified($backupPath))
                    ]
                ], 201);
            }

            return response()->json([
                'message' => 'Failed to copy database file.'
            ], 500);
        } catch (\Exception $e) {
            Log::error('Database backup failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create backup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a specific backup file.
     */
    public function download($filename)
    {
        try {
            // Sanitize filename to prevent directory traversal
            $filename = basename($filename);
            $dir = $this->getBackupDir();
            $path = $dir . DIRECTORY_SEPARATOR . $filename;

            if (!File::exists($path)) {
                return response()->json([
                    'message' => 'Backup file not found.'
                ], 404);
            }

            return response()->download($path);
        } catch (\Exception $e) {
            Log::error('Backup download failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to download backup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a specific backup file.
     */
    public function destroy($filename)
    {
        try {
            // Sanitize filename to prevent directory traversal
            $filename = basename($filename);
            $dir = $this->getBackupDir();
            $path = $dir . DIRECTORY_SEPARATOR . $filename;

            if (!File::exists($path)) {
                return response()->json([
                    'message' => 'Backup file not found.'
                ], 404);
            }

            if (File::delete($path)) {
                Log::info('Database backup deleted: ' . $filename);
                return response()->json([
                    'message' => 'Backup file deleted successfully.'
                ]);
            }

            return response()->json([
                'message' => 'Failed to delete backup file.'
            ], 500);
        } catch (\Exception $e) {
            Log::error('Backup deletion failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete backup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper to format file size in human readable bytes.
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
