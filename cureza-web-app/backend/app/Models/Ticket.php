<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by_id',
        'created_by_role',
        'assigned_admin_id',
        'subject',
        'category',
        'priority',
        'status',
        'related_type',
        'related_id',
    ];

    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function related()
    {
        return $this->morphTo();
    }

    // Helper to get creator user instance (might need adjustment depending on how User model is structured for diff roles)
    // Assuming single User table for now as per previous checks
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function assignedAdmin()
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }
}
