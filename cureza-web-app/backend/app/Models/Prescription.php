<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_number',
        'user_id',
        'doctor_id',
        'date',
        'patient_details',
        'vitals',
        'chief_complaints',
        'diagnosis',
        'medicines',
        'advice',
        'notes',
    ];

    protected $casts = [
        'patient_details' => 'array',
        'vitals' => 'array',
        'medicines' => 'array',
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
