<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DoctorOnboardingController extends Controller
{
    /**
     * Single Step Registration (Full payload + Files)
     */
    public function registerFull(Request $request)
    {
        // 1. Validation
        $request->validate([
            // Personal
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string',
            'bio' => 'nullable|string',
            'languages_spoken' => 'nullable|array',
            
            // Professional
            'specialization' => 'required|string',
            'years_of_experience' => 'required|integer|min:0',
            'consultation_fee' => 'required|numeric|min:0',
            'consultation_duration' => 'required|integer', 
            'consultation_modes' => 'nullable|array',
            'secondary_specializations' => 'nullable|array',
            'areas_of_expertise' => 'nullable|array',
            'treatable_conditions' => 'nullable|array',
            
            // Education
            'highest_qualification' => 'nullable|string',
            'degree_name' => 'nullable|string',
            'completion_year' => 'nullable|integer',
            'education_history' => 'nullable|array',
            'additional_certifications' => 'nullable|array',

            // Clinic
            'clinic_name' => 'required|string',
            'clinic_address' => 'required|string',
            'clinic_city' => 'required|string',
            'clinic_state' => 'nullable|string',
            'clinic_pincode' => 'required|string',
            'google_map_link' => 'nullable|string',
            'available_days' => 'required|array',
            'time_slots' => 'nullable|array',
            'break_times' => 'nullable|array',
            'timezone' => 'nullable|string',
            'emergency_availability' => 'nullable|boolean',
            'max_consultations_per_day' => 'nullable|integer',
            
            // Banking
            'bank_account_holder' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_ifsc' => 'nullable|string',

            // Documents (KYC)
            'medical_license_number' => 'required|string',
            'medical_council_name' => 'required|string',
            'state_council_name' => 'required|string',
            'registration_date' => 'required|date',
            'license_expiry_date' => 'required|date',
            'ayush_id' => 'nullable|string',
            'ayush_system_type' => 'nullable|string',
            'identity_proof_type' => 'nullable|string',
            'identity_proof_number' => 'nullable|string',
            
            // Files
            'ayush_document' => 'nullable|file|mimes:jpeg,png,pdf|max:10240',
            'profile_photo' => 'required|file|mimes:jpeg,png,jpg|max:5120',
            'license_doc' => 'required|file|mimes:jpeg,png,pdf|max:10240',
            'identity_proof' => 'required|file|mimes:jpeg,png,pdf|max:10240',
        ]);

        try {
            DB::beginTransaction();

            // 2. Create User
            $user = User::create([
                'name' => $request->first_name . ' ' . $request->last_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'role' => 'doctor',
                'doctor_status' => 'pending_verification',
                
                // Personal
                'gender' => $request->gender,
                'date_of_birth' => $request->date_of_birth,
                'bio' => $request->bio,
                'languages_spoken' => $request->languages_spoken ?? [],
                
                // Professional
                'specialization' => $request->specialization,
                'years_of_experience' => $request->years_of_experience,
                'consultation_fee' => $request->consultation_fee,
                'consultation_duration' => $request->consultation_duration,
                'consultation_modes' => $request->consultation_modes ?? [],
                'secondary_specializations' => $request->secondary_specializations ?? [],
                'areas_of_expertise' => $request->areas_of_expertise ?? [],
                'treatable_conditions' => $request->treatable_conditions ?? [],
                
                // Education
                'highest_qualification' => $request->highest_qualification,
                'degree_name' => $request->degree_name,
                'completion_year' => $request->completion_year,
                'education_history' => $request->education_history ?? [],
                'additional_certifications' => $request->additional_certifications ?? [],

                // Clinic
                'clinic_name' => $request->clinic_name,
                'clinic_address' => $request->clinic_address,
                'clinic_city' => $request->clinic_city,
                'clinic_state' => $request->clinic_state,
                'clinic_pincode' => $request->clinic_pincode,
                'google_map_link' => $request->google_map_link,
                'available_days' => $request->available_days,
                'time_slots' => $request->time_slots ?? [],
                'break_times' => $request->break_times ?? [],
                'timezone' => $request->timezone,
                'emergency_availability' => $request->emergency_availability ?? false,
                'max_consultations_per_day' => $request->max_consultations_per_day,
                
                // Banking
                'bank_account_holder' => $request->bank_account_holder,
                'bank_name' => $request->bank_name,
                'bank_account_number' => $request->bank_account_number,
                'bank_ifsc' => $request->bank_ifsc,

                // KYC
                'medical_license_number' => $request->medical_license_number,
                'medical_council_name' => $request->medical_council_name,
                'state_council_name' => $request->state_council_name,
                'registration_date' => $request->registration_date,
                'license_expiry_date' => $request->license_expiry_date,
                'ayush_id' => $request->ayush_id,
                'ayush_system_type' => $request->ayush_system_type,
                'identity_proof_type' => $request->identity_proof_type,
                'identity_proof_number' => $request->identity_proof_number,
                
                // Defaults/Extras
                'registration_source' => 'web',
                'registration_ip' => $request->ip(),
            ]);

            // 3. Handle File Uploads
            if ($request->hasFile('profile_photo')) {
                $path = $this->storeFileSecurely($request->file('profile_photo'), 'doctor_profile/' . $user->id);
                $user->profile_photo_path = $path;
            }
            if ($request->hasFile('license_doc')) {
                $path = $this->storeFileSecurely($request->file('license_doc'), 'doctor_kyc/' . $user->id);
                $user->license_path = $path;
            }
            if ($request->hasFile('identity_proof')) {
                $path = $this->storeFileSecurely($request->file('identity_proof'), 'doctor_kyc/' . $user->id);
                $user->identity_proof_path = $path;
            }
            if ($request->hasFile('ayush_document')) {
                $path = $this->storeFileSecurely($request->file('ayush_document'), 'doctor_kyc/' . $user->id);
                $user->ayush_document_path = $path;
            }
            
            // 4. Generate OTPs
            $emailOtp = rand(100000, 999999);
            $mobileOtp = rand(100000, 999999);
            $expiresAt = Carbon::now()->addMinutes(15);
            
            $user->email_otp = $emailOtp;
            $user->mobile_otp = $mobileOtp;
            $user->otp_expires_at = $expiresAt;
            $user->save();

            DB::commit();

            // 5. Response with Token & Dev OTP
            $token = $user->createToken('doctor_onboarding')->plainTextToken;

            return response()->json([
                'message' => 'Application submitted. Please verify OTP.',
                'user' => $user,
                'token' => $token,
                'dev_otp' => [
                    'email' => $emailOtp,
                    'mobile' => $mobileOtp
                ]
            ], 201);

        } catch (\InvalidArgumentException $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Doctor Registration Failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Verify OTP & Finalize
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'email_otp' => 'required',
            'mobile_otp' => 'required',
        ]);

        $user = $request->user();

        if (!$user) {
             return response()->json(['message' => 'User not found'], 404);
        }

        if (Carbon::now()->gt($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP expired'], 422);
        }

        if ($request->email_otp != $user->email_otp || $request->mobile_otp != $user->mobile_otp) {
            return response()->json(['message' => 'Invalid OTP(s)'], 422);
        }

        // Success: Move to PENDING_APPROVAL
        $user->update([
            'email_verified_at' => Carbon::now(),
            'mobile_verified_at' => Carbon::now(), // Assuming this column exists or we reuse email_verified_at logic implies verified
            'doctor_status' => 'pending_approval', 
            'email_otp' => null,
            'mobile_otp' => null,
            // Legal agreements
            'agreed_to_terms' => true,
            'agreed_to_telemedicine_guidelines' => true,
            'declaration_of_truth' => true,
        ]);

        // Notify Admins
        try {
            $admins = \App\Models\User::whereIn('role', ['admin', 'super_admin'])->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminAlertNotification(
                'doctor_registration',
                'New Doctor Registration',
                'Doctor ' . $user->name . ' has completed onboarding and is pending verification.',
                '/superadmin/dashboard/users/doctors/' . $user->id
            ));
        } catch (\Exception $e) {
            Log::error('Failed to send doctor onboarding notification to admins: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Application submitted successfully. Under review.',
            'user' => $user
        ]);
    }

    /**
     * Resend OTP
     */
    public function resendOTP(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $emailOtp = env('APP_ENV') === 'local' ? '123456' : (string) rand(100000, 999999);
        $mobileOtp = env('APP_ENV') === 'local' ? '123456' : (string) rand(100000, 999999);
        $expiresAt = Carbon::now()->addMinutes(10);

        $user->email_otp = $emailOtp;
        $user->mobile_otp = $mobileOtp;
        $user->otp_expires_at = $expiresAt;
        $user->save();

        // TODO: Send SMS/Email here

        return response()->json([
            'message' => 'OTP resent successfully.',
            'dev_otp' => [
                'email' => $emailOtp,
                'mobile' => $mobileOtp
            ]
        ]);
    }

    /**
     * Reupload rejected document
     */
    public function reuploadDocument(Request $request)
    {
        $request->validate([
            'document_type' => 'required|in:profile_photo,license_doc,identity_proof,ayush_document',
            'file' => 'required|file|max:10240'
        ]);

        $user = $request->user();
        $type = $request->document_type;
        $statusField = $type . '_status';
        $reasonField = $type . '_rejection_reason';

        // Adjust database field mapping if key is ayush_document vs ayush_document_path
        if ($type === 'ayush_document') {
            $statusField = 'ayush_document_status';
            $reasonField = 'ayush_document_rejection_reason';
        }

        // Allow reuploading if document is rejected OR if the user is explicitly choosing to update it (no strict restriction)
        // We will allow reupload for status that is 'rejected', 'pending', or 'approved' to make the "Update Document" flow seamless.
        // It will reset the state of that document back to pending and require re-verification.

        try {
            // Upload and store the file
            if ($type === 'profile_photo') {
                $path = $this->storeFileSecurely($request->file('file'), 'doctor_profile/' . $user->id);
                $user->profile_photo_path = $path;
            } else if ($type === 'license_doc') {
                $path = $this->storeFileSecurely($request->file('file'), 'doctor_kyc/' . $user->id);
                $user->license_path = $path;
            } else if ($type === 'identity_proof') {
                $path = $this->storeFileSecurely($request->file('file'), 'doctor_kyc/' . $user->id);
                $user->identity_proof_path = $path;
            } else if ($type === 'ayush_document') {
                $path = $this->storeFileSecurely($request->file('file'), 'doctor_kyc/' . $user->id);
                $user->ayush_document_path = $path;
            }
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        // Set status to pending and clear rejection reason
        $user->$statusField = 'pending';
        $user->$reasonField = null;

        // If the document uploaded is NOT the profile photo (only license_doc, identity_proof, or ayush_document affect approval state)
        // AND the doctor is currently NOT approved (status is rejected or draft or pending),
        // we can set the doctor_status back to pending_approval.
        // If the doctor is already APPROVED, uploading a profile photo should NOT revert their approved status.
        if ($type !== 'profile_photo') {
            if ($user->doctor_status !== 'approved') {
                if ($user->license_doc_status !== 'rejected' && 
                    $user->identity_proof_status !== 'rejected' &&
                    $user->ayush_document_status !== 'rejected') {
                    $user->doctor_status = 'pending_approval';
                    $user->rejection_reason = null;
                }
            }
        }

        $user->save();

        return response()->json([
            'message' => ucfirst(str_replace('_', ' ', $type)) . ' reuploaded successfully. Status is now pending review.',
            'user' => $user
        ]);
    }
}
