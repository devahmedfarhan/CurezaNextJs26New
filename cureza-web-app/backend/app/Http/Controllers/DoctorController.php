<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class DoctorController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:20',
            
            // Personal Information
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'country' => 'required|string',
            'postal_code' => 'required|string',
            
            // Professional Information
            'medical_license_number' => 'required|string|unique:users',
            'license_issuing_state' => 'required|string',
            'license_issuing_country' => 'required|string',
            'license_issue_date' => 'required|date',
            'specialization' => 'required|string',
            'years_of_experience' => 'required|integer|min:0',
            'medical_school' => 'required|string',
            
            // Practice Information
            'practice_name' => 'required|string',
            'practice_address' => 'required|string',
            'practice_city' => 'required|string',
            'practice_state' => 'required|string',
            'practice_country' => 'required|string',
            'practice_postal_code' => 'required|string',
            'practice_email' => 'required|email',
            
            // Certifications
            'certifications' => 'required|array|min:1',
            'professional_affiliations' => 'required|array|min:1',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'doctor',
            'phone' => $validated['phone'],
            'doctor_status' => 'pending',
            
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'address' => $validated['address'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'country' => $validated['country'],
            'postal_code' => $validated['postal_code'],
            
            'medical_license_number' => $validated['medical_license_number'],
            'license_issuing_state' => $validated['license_issuing_state'],
            'license_issuing_country' => $validated['license_issuing_country'],
            'license_issue_date' => $validated['license_issue_date'],
            'specialization' => $validated['specialization'],
            'years_of_experience' => $validated['years_of_experience'],
            'medical_school' => $validated['medical_school'],
            
            'practice_name' => $validated['practice_name'],
            'practice_address' => $validated['practice_address'],
            'practice_city' => $validated['practice_city'],
            'practice_state' => $validated['practice_state'],
            'practice_country' => $validated['practice_country'],
            'practice_postal_code' => $validated['practice_postal_code'],
            'practice_email' => $validated['practice_email'],
            
            'certifications' => $validated['certifications'],
            'professional_affiliations' => $validated['professional_affiliations'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful. Your account is pending approval.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->role !== 'doctor') {
            throw ValidationException::withMessages([
                'email' => ['This account is not registered as a doctor.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'specialization' => 'nullable|string',
            'medical_license_number' => 'sometimes|string|unique:users,medical_license_number,' . $user->id,
            'consultation_fee' => 'nullable|numeric',
            'consultation_duration' => 'nullable|integer',
            'years_of_experience' => 'nullable|integer',
            'highest_qualification' => 'nullable|string',
            'degree_name' => 'nullable|string',
            'completion_year' => 'nullable|integer',
            'medical_school' => 'nullable|string',

            // KYC & Registration Details
            'medical_council_name' => 'nullable|string',
            'state_council_name' => 'nullable|string',
            'registration_date' => 'nullable|date',
            'license_expiry_date' => 'nullable|date',

            // AYUSH
            'ayush_id' => 'nullable|string',
            'ayush_system_type' => 'nullable|string',

            // Identity
            'identity_proof_type' => 'nullable|string',
            'identity_proof_number' => 'nullable|string',
            
            // Clinic
            'clinic_name' => 'nullable|string',
            'clinic_address' => 'nullable|string',
            'clinic_city' => 'nullable|string',
            'clinic_state' => 'nullable|string',
            'clinic_pincode' => 'nullable|string',
            'google_map_link' => 'nullable|string',
            'emergency_availability' => 'boolean',
            'max_consultations_per_day' => 'nullable|integer',

            // Banking
            'bank_account_holder' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_ifsc' => 'nullable|string',

            // Arrays
            'consultation_modes' => 'array',
            'languages_spoken' => 'array',
            'available_days' => 'array',
            'time_slots' => 'array',
            'education_history' => 'array',
            'secondary_specializations' => 'array',
            'areas_of_expertise' => 'array',
            'treatable_conditions' => 'array',

            // Files
            'profile_photo' => 'nullable|image|max:2048',
            'license_doc' => 'nullable|file|max:5120',
            'identity_proof' => 'nullable|file|max:5120',
            'ayush_document' => 'nullable|file|max:5120',
        ]);

        // Handle File Uploads
        $fileFields = [
            'profile_photo' => 'profile_photo_path', 
            'license_doc' => 'license_path', 
            'identity_proof' => 'identity_proof_path', 
            'ayush_document' => 'ayush_document_path'
        ];

        foreach ($fileFields as $inputKey => $dbColumn) {
            if ($request->hasFile($inputKey)) {
                $path = $request->file($inputKey)->store("uploads/doctors/{$user->id}", 'public');
                $validated[$dbColumn] = $path;
                unset($validated[$inputKey]); // Remove file object from validated data
            }
        }


        // Store updates in pending_updates column instead of applying directly
        $user->pending_updates = $validated;
        $user->save();

        return response()->json([
            'message' => 'Profile update request submitted for approval.',
            'user' => $user,
        ]);
    }

    public function dashboardSummary(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = (new \App\Services\DashboardAnalyticsService())->getDoctorDashboardStats($user->id);

        // 5. Today's Appointments or Recent Appointments
        $todayAppointments = \App\Models\Appointment::where('doctor_id', $user->id)
            ->with('patient:id,name')
            ->orderBy('appointment_date', 'asc')
            ->get()
            ->map(function ($appt) {
                return [
                    'id' => $appt->id,
                    'patient' => $appt->patient->name ?? 'Unknown Patient',
                    'time' => $appt->appointment_date ? $appt->appointment_date->format('h:i A') : 'N/A',
                    'type' => ucfirst($appt->consultation_type) . ' Consultation',
                    'status' => ucfirst($appt->status),
                ];
            });

        return response()->json([
            'summary' => $stats,
            'appointments' => $todayAppointments
        ]);
    }
}
