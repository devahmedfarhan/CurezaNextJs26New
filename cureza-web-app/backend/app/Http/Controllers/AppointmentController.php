<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the doctor's appointments.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $appointments = Appointment::where('doctor_id', $user->id)
            ->with(['patient:id,name,email,phone', 'doctor:id,name,specialization'])
            ->orderBy('appointment_date', 'desc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Display a listing of unique patients for the doctor.
     */
    public function patients(Request $request)
    {
        $user = $request->user();
        
        // Find all appointments for this doctor, eager load patient user
        $appointments = Appointment::where('doctor_id', $user->id)
            ->with('patient')
            ->orderBy('appointment_date', 'desc')
            ->get();
            
        // Filter unique patients using a collection pipeline
        $patients = $appointments->map(function ($appt) {
            $patient = $appt->patient;
            if (!$patient) return null;
            
            // Try to find age
            $age = null;
            if ($patient->date_of_birth) {
                $age = \Carbon\Carbon::parse($patient->date_of_birth)->age;
            } elseif (isset($appt->patient_details['age'])) {
                $age = $appt->patient_details['age'];
            }
            
            // Try to find gender
            $gender = $patient->gender ?? ($appt->patient_details['gender'] ?? 'Unknown');
            
            return [
                'id' => $patient->id,
                'name' => $patient->name,
                'email' => $patient->email,
                'phone' => $patient->phone,
                'age' => $age,
                'gender' => $gender,
                'last_visit' => $appt->appointment_date,
            ];
        })
        ->filter()
        ->unique('id')
        ->values();

        return response()->json($patients);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after:now',
            'notes' => 'nullable|string',
            
            // Detailed Form Fields
            'consultation_type' => 'required|in:video,audio,chat',
            'is_follow_up' => 'boolean',
            'urgency_level' => 'required|in:normal,urgent',
            
            'health_concern' => 'required|array',
            'health_concern.primary_concern' => 'required|string',
            'health_concern.description' => 'required|string|min:10',
            'health_concern.since' => 'required|string',
            'health_concern.severity' => 'required|in:mild,moderate,severe',
            
            'medical_background' => 'required|array',
            'medical_background.medications' => 'nullable|string',
            'medical_background.conditions' => 'nullable|array',
            'medical_background.allergies' => 'nullable|string',
            'medical_background.past_consultation' => 'boolean',
            
            'preferred_slot' => 'nullable|string',
            'reschedule_allowed' => 'boolean',
            'consent_accepted' => 'required|accepted',
            
            'amount' => 'required|numeric',
            'payment_method' => 'nullable|string',

            'files.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB per file
        ]);

        $patientId = Auth::id();
        if (!$patientId) {
             return response()->json(['message' => 'Please login to book a consultation'], 401);
        }

        // Handle File Uploads
        $documentPaths = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('consultation_docs', 'public');
                $documentPaths[] = $path;
            }
        }

        $appointment = Appointment::create([
            'doctor_id' => $validated['doctor_id'],
            'patient_id' => $patientId,
            'appointment_date' => $validated['appointment_date'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
            
            'consultation_type' => $validated['consultation_type'],
            'is_follow_up' => $validated['is_follow_up'] ?? false,
            'urgency_level' => $validated['urgency_level'],
            'health_concern' => $validated['health_concern'],
            'medical_background' => $validated['medical_background'],
            'documents' => $documentPaths,
            'preferred_slot' => $validated['preferred_slot'] ?? null,
            'reschedule_allowed' => $validated['reschedule_allowed'] ?? true,
            'consent_accepted' => $validated['consent_accepted'],
            'amount' => $validated['amount'],
            'payment_status' => 'pending', // Payment would typically be handled via a separate hook
        ]);

        return response()->json([
            'message' => 'Consultation booked successfully. Please proceed to payment.',
            'appointment' => $appointment
        ], 201);
    }

    /**
     * Update the specified appointment status.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $appointment = Appointment::findOrFail($id);

        // Only the doctor or the patient can update the appointment
        if ($user->id !== $appointment->doctor_id && $user->id !== $appointment->patient_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $appointment->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Appointment status updated successfully',
            'appointment' => $appointment
        ]);
    }

    /**
     * Display the specified appointment.
     */
    public function show($id)
    {
        $appointment = Appointment::with(['doctor:id,name,specialization', 'patient:id,name,email,phone'])->findOrFail($id);
        
        // Authorization check
        $user = Auth::user();
        if ($user->id !== $appointment->doctor_id && $user->id !== $appointment->patient_id && $user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($appointment);
    }
    /**
     * Get unique patients for the authenticated doctor
     */

}
