<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class SmtpSetting extends Model
{
    protected $table = 'communication_smtp_settings';

    protected $fillable = [
        'provider_name',
        'host',
        'port',
        'username',
        'password',
        'encryption',
        'sender_name',
        'sender_email',
        'reply_to',
        'timeout',
        'retry_count',
        'max_emails_per_hour',
        'max_emails_per_day',
        'is_active',
        'is_backup',
        'priority',
        'notes'
    ];

    protected $casts = [
        'port' => 'integer',
        'timeout' => 'integer',
        'retry_count' => 'integer',
        'max_emails_per_hour' => 'integer',
        'max_emails_per_day' => 'integer',
        'is_active' => 'boolean',
        'is_backup' => 'boolean',
        'priority' => 'integer'
    ];

    /**
     * Bootstrap the model and register Eloquent events.
     */
    protected static function booted()
    {
        static::saving(function ($smtpSetting) {
            // Encrypt password before saving to DB
            if (!empty($smtpSetting->password)) {
                try {
                    // Try to decrypt first to avoid double encryption
                    Crypt::decryptString($smtpSetting->password);
                } catch (\Exception $e) {
                    // Decryption failed means it is a raw value, so we encrypt it
                    $smtpSetting->attributes['password'] = Crypt::encryptString($smtpSetting->password);
                }
            }
        });
    }

    /**
     * Get the decrypted password.
     */
    public function getPasswordAttribute($value)
    {
        if (!empty($value)) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                // Return original value in case it is not encrypted
                return $value;
            }
        }
        return $value;
    }
}
