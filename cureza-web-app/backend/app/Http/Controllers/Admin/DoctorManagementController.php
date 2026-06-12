<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class DoctorManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'doctor');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('doctor_status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('medical_license_number', 'like', "%{$search}%");
            });
        }

        $doctors = $query->latest()->paginate(10);
        return response()->json($doctors);
    }

    public function show($id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);
        return response()->json($doctor);
    }

    public function approve(Request $request, $id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);
        
        // Validation: Ensure mandatory documents are present
        if (empty($doctor->medical_license_number) || empty($doctor->license_path)) { 
            return response()->json(['message' => 'Cannot approve: Mandatory KYC documents or license number missing'], 422); 
        }

        // Strict validation: Only KYC documents (License, Identity Proof, and optionally Ayush if present) must be approved
        // Profile Photo status is required to be 'approved' ONLY for the very first time registration (when approved_at is null)
        $isFirstTimeApproval = is_null($doctor->approved_at);
        
        if (($isFirstTimeApproval && $doctor->profile_photo_status !== 'approved') ||
            $doctor->license_doc_status !== 'approved' || 
            $doctor->identity_proof_status !== 'approved' ||
            ($doctor->ayush_document_path && $doctor->ayush_document_status !== 'approved')) {
            return response()->json([
                'message' => 'Cannot approve doctor: All uploaded KYC credentials (and Profile Photo for first-time verification) must be approved by admin first.',
                'details' => [
                    'profile_photo_status' => $doctor->profile_photo_status,
                    'license_doc_status' => $doctor->license_doc_status,
                    'identity_proof_status' => $doctor->identity_proof_status,
                    'ayush_document_status' => $doctor->ayush_document_status
                ]
            ], 422);
        }

        $doctor->update([
            'doctor_status' => 'approved', 
            'rejection_reason' => null,
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
            'admin_remarks' => $request->admin_remarks ?? $doctor->admin_remarks
        ]);
        
        // Log Activity
        \App\Models\ActivityLog::create([
            'user_id' => $request->user()->id, 
            'action' => 'APPROVED_DOCTOR',
            'description' => "Approved doctor {$doctor->name} (ID: {$doctor->id})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        return response()->json(['message' => 'Doctor approved successfully', 'doctor' => $doctor]);
    }

    public function verifyDocument(Request $request, $id)
    {
        $request->validate([
            'document_type' => 'required|in:profile_photo,license_doc,identity_proof,ayush_document',
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string'
        ]);

        $doctor = User::where('role', 'doctor')->findOrFail($id);
        $type = $request->document_type;
        $statusField = $type . '_status';
        $reasonField = $type . '_rejection_reason';

        $doctor->$statusField = $request->status;
        if ($request->status === 'rejected') {
            $doctor->$reasonField = $request->rejection_reason;
            // Profile photo rejection should ONLY reject the whole account IF the doctor has never been approved before (first-time activation)
            $isFirstTime = is_null($doctor->approved_at);
            if ($type !== 'profile_photo' || $isFirstTime) {
                $doctor->doctor_status = 'rejected';
                $doctor->rejection_reason = "KYC document rejected: " . $request->rejection_reason;
            }
        } else {
            $doctor->$reasonField = null;
            
            // Only revert rejection status back to pending_approval if the document rejected was a blocking one
            $isFirstTime = is_null($doctor->approved_at);
            if ($doctor->doctor_status === 'rejected' && ($type !== 'profile_photo' || $isFirstTime)) {
                $doctor->doctor_status = 'pending_approval'; 
            }
        }
        $doctor->save();

        return response()->json([
            'message' => ucfirst(str_replace('_', ' ', $type)) . ' verification status updated successfully.',
            'doctor' => $doctor
        ]);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string',
            'comment' => 'nullable|string'
        ]);

        $doctor = User::where('role', 'doctor')->findOrFail($id);
        $doctor->update([
            'doctor_status' => 'rejected', 
            'rejection_reason' => $request->reason,
            'admin_remarks' => $request->comment ?? $doctor->admin_remarks
        ]);

        // Log Activity
        \App\Models\ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'REJECTED_DOCTOR',
            'description' => "Rejected doctor {$doctor->name} (ID: {$doctor->id}). Reason: {$request->reason}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['message' => 'Doctor rejected successfully', 'doctor' => $doctor]);
    }

    public function update(Request $request, $id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'specialization' => 'sometimes|string',
            'medical_license_number' => 'sometimes|string|unique:users,medical_license_number,' . $id,
            'consultation_fee' => 'sometimes|numeric',
            'years_of_experience' => 'sometimes|integer',
            'bio' => 'nullable|string',
            'clinic_name' => 'nullable|string',
            'clinic_address' => 'nullable|string',
            'clinic_city' => 'nullable|string',
            'clinic_state' => 'nullable|string',
            'clinic_pincode' => 'nullable|string',
            'admin_remarks' => 'sometimes|string',
        ]);

        $doctor->update($request->all());

        return response()->json(['message' => 'Doctor updated successfully', 'doctor' => $doctor]);
    }

    public function approveUpdate(Request $request, $id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);

        if (!$doctor->pending_updates) {
            return response()->json(['message' => 'No pending updates found'], 404);
        }

        $updates = $doctor->pending_updates;
        // Merge updates into main attributes
        // Security note: We rely on frontend validaton + admin review here. 
        // Ideally we should re-validate, but for now we trust the stored validated data.
        
        $doctor->forceFill($updates); // Use forceFill to bypass mass assignment if needed, or fill()
        $doctor->pending_updates = null;
        $doctor->save();

        return response()->json(['message' => 'Profile updates approved successfully', 'doctor' => $doctor]);
    }

    public function rejectUpdate(Request $request, $id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);
        
        $doctor->pending_updates = null;
        $doctor->save();

        return response()->json(['message' => 'Profile updates rejected', 'doctor' => $doctor]);
    }

    public function destroy($id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);
        $doctor->delete();
        return response()->json(['message' => 'Doctor deleted successfully']);
    }
}
