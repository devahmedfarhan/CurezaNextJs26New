<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $fillable = [
        'user_id', 'balance', 'points', 'xp', 'last_checkin_at', 'checkin_streak',
        'referral_enabled', 'influencer_enabled', 'challenges_enabled'
    ];

    protected $casts = [
        'referral_enabled' => 'boolean',
        'influencer_enabled' => 'boolean',
        'challenges_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }
}
