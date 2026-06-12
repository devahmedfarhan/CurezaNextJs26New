<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

class EncryptExistingData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:encrypt-existing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Encrypt existing plaintext columns in users and seller_profiles tables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database encryption migration...');

        // 1. Migrate Users Table
        $userColumns = [
            'phone',
            'medical_license_number',
            'bank_account_number',
            'bank_ifsc',
            'bank_account_holder',
            'address'
        ];

        $users = DB::table('users')->get();
        $this->info("Scanning " . $users->count() . " user records...");

        $userUpdates = 0;
        foreach ($users as $user) {
            $updates = [];
            foreach ($userColumns as $column) {
                if (isset($user->$column) && !is_null($user->$column) && $user->$column !== '') {
                    $value = $user->$column;
                    if (!$this->isEncrypted($value)) {
                        $updates[$column] = Crypt::encryptString($value);
                    }
                }
            }
            if (!empty($updates)) {
                DB::table('users')->where('id', $user->id)->update($updates);
                $userUpdates++;
            }
        }
        $this->info("Encrypted columns for {$userUpdates} user records.");

        // 2. Migrate Seller Profiles Table
        $profileColumns = [
            'pan_number',
            'gst_number',
            'aadhaar_number',
            'bank_account_number',
            'account_holder_name',
            'ifsc_code'
        ];

        $profiles = DB::table('seller_profiles')->get();
        $this->info("Scanning " . $profiles->count() . " seller profile records...");

        $profileUpdates = 0;
        foreach ($profiles as $profile) {
            $updates = [];
            foreach ($profileColumns as $column) {
                if (isset($profile->$column) && !is_null($profile->$column) && $profile->$column !== '') {
                    $value = $profile->$column;
                    if (!$this->isEncrypted($value)) {
                        $updates[$column] = Crypt::encryptString($value);
                    }
                }
            }
            if (!empty($updates)) {
                DB::table('seller_profiles')->where('id', $profile->id)->update($updates);
                $profileUpdates++;
            }
        }
        $this->info("Encrypted columns for {$profileUpdates} seller profile records.");

        $this->info('Database encryption migration completed successfully!');
    }

    /**
     * Check if a value is encrypted.
     */
    private function isEncrypted($value): bool
    {
        try {
            Crypt::decryptString($value);
            return true;
        } catch (DecryptException $e) {
            return false;
        }
    }
}
