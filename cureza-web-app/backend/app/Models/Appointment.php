<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'patient_id',
        'appointment_date',
        'status',
        'notes',
        'consultation_type',
        'is_follow_up',
        'urgency_level',
        'health_concern',
        'medical_background',
        'documents',
        'preferred_slot',
        'reschedule_allowed',
        'consent_accepted',
        'payment_status',
        'payment_method',
        'amount',
        'payment_id',
        'payment_details'
    ];

    protected $casts = [
        'appointment_date' => 'datetime',
        'is_follow_up' => 'boolean',
        'reschedule_allowed' => 'boolean',
        'consent_accepted' => 'boolean',
        'health_concern' => 'array',
        'medical_background' => 'array',
        'documents' => 'array',
        'payment_details' => 'array',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
