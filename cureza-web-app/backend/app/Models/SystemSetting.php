<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'group',
        'is_secret'
    ];

    protected $casts = [
        'is_secret' => 'boolean'
    ];

    /**
     * Bootstrap the model and register Eloquent events.
     */
    protected static function booted()
    {
        static::saving(function ($setting) {
            // Encrypt secret value before saving to DB
            if ($setting->is_secret && !empty($setting->value)) {
                try {
                    // Try to decrypt first to avoid double encryption
                    Crypt::decryptString($setting->value);
                } catch (\Exception $e) {
                    // Decryption failed means it is a raw value, so we encrypt it
                    $setting->attributes['value'] = Crypt::encryptString($setting->value);
                }
            }
        });
    }

    /**
     * Get the decrypted value if the setting is marked as a secret.
     */
    public function getValueAttribute($value)
    {
        if ($this->is_secret && !empty($value)) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                // Return original value in case it is not encrypted or failed decryption
                return $value;
            }
        }
        return $value;
    }
}
