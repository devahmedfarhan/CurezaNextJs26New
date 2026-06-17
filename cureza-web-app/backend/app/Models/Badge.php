<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'rule_type',
        'rule_value',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'rule_value' => 'integer',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_badges')
                    ->withPivot('unlocked_at')
                    ->withTimestamps();
    }
}
