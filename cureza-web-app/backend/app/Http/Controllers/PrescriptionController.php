<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Prescription;
use Illuminate\Support\Facades\View;

class PrescriptionController extends Controller
{
    // Get all prescriptions for the authenticated user
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'doctor') {
            // For Doctors: Show prescriptions ISSUED by them
            $prescriptions = Prescription::where('doctor_id', $user->id)
                ->with('user:id,name') // The 'user' relationship points to the patient
                ->latest('date')
                ->get()
                ->map(function ($p) {
                    return [
                        'type' => 'digital',
                        'id' => $p->id,
                        'prescription_number' => $p->prescription_number,
                        'date' => $p->date instanceof \Carbon\Carbon ? $p->date->format('Y-m-d') : $p->date,
                        'diagnosis' => $p->diagnosis,
                        'patient_name' => $p->user->name ?? ($p->patient_details['name'] ?? 'Unknown'),
                        'status' => 'Issued', // Static for now
                        'download_url' => url("/api/user/prescriptions/{$p->id}/download"),
                        'view_url' => "/doctor/dashboard/prescriptions/{$p->id}"
                    ];
                });
                
            return response()->json($prescriptions);

        } else {
            // For Patients: Show prescriptions RECEIVED by them
            $userId = $user->id;

            // 1. Doctor Prescriptions
            $doctorPrescriptions = Prescription::where('user_id', $userId)
                ->with('doctor:id,name')
                ->latest('date')
                ->get()
                ->map(function ($p) {
                    return [
                        'type' => 'digital',
                        'id' => $p->id,
                        'prescription_number' => $p->prescription_number,
                        'doctor' => $p->doctor,
                        'date' => $p->date instanceof \Carbon\Carbon ? $p->date->format('Y-m-d') : $p->date,
                        'diagnosis' => $p->diagnosis,
                        'patient_name' => $p->patient_details['name'] ?? 'Self',
                        'download_url' => url("/api/user/prescriptions/{$p->id}/download"),
                        'view_url' => "/dashboard/prescriptions/{$p->id}"
                    ];
                });

            // 2. Order Prescriptions / Requests
            $orderPrescriptions = \App\Models\OrderItem::whereHas('order', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->whereNotNull('patient_name')
                ->latest('created_at')
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => 'order',
                        'id' => $item->id,
                        'prescription_number' => 'ORD-' . $item->order_id . '-' . $item->id,
                        'doctor' => ['name' => 'Order Request'],
                        'date' => $item->created_at->format('Y-m-d'),
                        'diagnosis' => 'Product: ' . $item->product_name,
                        'patient_name' => $item->patient_name,
                        'download_url' => $item->prescription_path ? url("storage/" . $item->prescription_path) : null,
                        'view_url' => null // Could link to order details
                    ];
                });

            $all = $doctorPrescriptions->concat($orderPrescriptions)->sortByDesc('date')->values();

            return response()->json($all);
        }
    }

    // Get a single prescription details
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $query = Prescription::with('doctor');

        if ($user->role === 'doctor') {
            $query->where('doctor_id', $user->id);
        } else {
            $query->where('user_id', $user->id);
        }

        $prescription = $query->findOrFail($id);

        return response()->json($prescription);
    }

    // Store a new prescription (Consultation Record)
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Only doctors can issue prescriptions'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'patient_details' => 'required|array',
            'vitals' => 'nullable|array',
            'chief_complaints' => 'required|string',
            'diagnosis' => 'required|string',
            'medicines' => 'required|array',
            'advice' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $prescription = Prescription::create([
            'prescription_number' => 'RX-' . strtoupper(uniqid()),
            'user_id' => $validated['user_id'],
            'doctor_id' => $user->id,
            'date' => now(),
            'patient_details' => $validated['patient_details'],
            'vitals' => $validated['vitals'] ?? [],
            'chief_complaints' => $validated['chief_complaints'],
            'diagnosis' => $validated['diagnosis'],
            'medicines' => $validated['medicines'],
            'advice' => $validated['advice'] ?? '',
            'notes' => $validated['notes'] ?? '',
        ]);

        // If this was linked to an appointment, mark it as completed
        if (!empty($validated['appointment_id'])) {
            \App\Models\Appointment::where('id', $validated['appointment_id'])
                ->where('doctor_id', $user->id)
                ->update(['status' => 'completed']);
        }

        return response()->json([
            'message' => 'Consultation record saved successfully',
            'prescription' => $prescription
        ], 201);
    }

    // Download prescription as PDF
    public function download(Request $request, $id)
    {
        $user = $request->user();
        $prescription = Prescription::where(function($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('doctor_id', $user->id);
        })->findOrFail($id);

        $logoPath = public_path('storage/images/logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $type = pathinfo($logoPath, PATHINFO_EXTENSION);
            $data = file_get_contents($logoPath);
            $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('prescription', ['prescription' => $prescription, 'logo' => $logoBase64]);
        return $pdf->download('prescription-' . $prescription->prescription_number . '.pdf');
    }

    /**
     * Delete a prescription
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $prescription = Prescription::where('doctor_id', $user->id)->findOrFail($id);
        $prescription->delete();

        return response()->json(['message' => 'Prescription deleted successfully']);
    }

    /**
     * Duplicate a prescription
     */
    public function duplicate(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $original = Prescription::where('doctor_id', $user->id)->findOrFail($id);
        
        $newPrescription = $original->replicate();
        $newPrescription->prescription_number = 'RX-' . strtoupper(uniqid()); // New unique number
        $newPrescription->date = now(); // Update date to today
        $newPrescription->created_at = now();
        $newPrescription->updated_at = now();
        $newPrescription->save();

        return response()->json([
            'message' => 'Prescription duplicated successfully',
            'prescription' => $newPrescription
        ], 201);
    }

    /**
     * Get prescription history for a specific patient (for doctors)
     */
    public function patientHistory(Request $request, $patientId)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $prescriptions = Prescription::where('user_id', $patientId)
            ->where('doctor_id', $user->id) // Only prescriptions issued by THIS doctor
            ->latest('date')
            ->get();

        return response()->json($prescriptions);
    }

    /**
     * Get pending product prescription requests for the doctor
     * GET /api/doctor/prescription-requests
     */
    public function pendingProductPrescriptions(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = \App\Models\OrderItem::where('doctor_id', $user->id)
            ->whereNull('prescription_path')
            ->with(['order.user'])
            ->latest()
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'order_id' => $item->order_id,
                    'order_number' => $item->order->order_number ?? 'N/A',
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'patient_name' => $item->patient_name ?? 'N/A',
                    'patient_age' => $item->patient_age ?? 'N/A',
                    'patient_gender' => $item->patient_gender ?? 'N/A',
                    'health_concern' => $item->health_concern ?? 'N/A',
                    'date_requested' => $item->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json($requests);
    }

    /**
     * Approve and generate prescription for a product purchase request
     * POST /api/doctor/prescription-requests/{id}/approve
     */
    public function approveProductPrescription(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $orderItem = \App\Models\OrderItem::where('doctor_id', $user->id)
            ->where('id', $id)
            ->whereNull('prescription_path')
            ->firstOrFail();

        $validated = $request->validate([
            'diagnosis' => 'required|string',
            'chief_complaints' => 'nullable|string',
            'advice' => 'nullable|string',
            'notes' => 'nullable|string',
            'vitals' => 'nullable|array'
        ]);

        // Fetch patient user ID (fallback to order user ID or current user)
        $order = $orderItem->order;
        $patientUserId = $order ? $order->user_id : $user->id; // fallback if order has no user

        // Create the Prescription record
        $prescription = Prescription::create([
            'prescription_number' => 'RX-PRD-' . strtoupper(uniqid()),
            'user_id' => $patientUserId,
            'doctor_id' => $user->id,
            'date' => now(),
            'patient_details' => [
                'name' => $orderItem->patient_name ?? 'Patient',
                'age' => $orderItem->patient_age ?? 'N/A',
                'gender' => $orderItem->patient_gender ?? 'N/A',
                'phone' => $order->shipping_address_json['phone'] ?? 'N/A',
                'health_concern' => $orderItem->health_concern ?? 'N/A'
            ],
            'vitals' => $validated['vitals'] ?? [],
            'chief_complaints' => $validated['chief_complaints'] ?? $orderItem->health_concern ?? 'Requested for CBD/Marketplace Product',
            'diagnosis' => $validated['diagnosis'],
            'medicines' => [
                [
                    'name' => $orderItem->product_name,
                    'dosage' => 'As directed',
                    'frequency' => '1-0-1',
                    'duration' => '30 Days',
                    'instruction' => 'Marketplace CBD Product Purchase'
                ]
            ],
            'advice' => $validated['advice'] ?? 'Follow the standard usage guidelines.',
            'notes' => $validated['notes'] ?? 'Product prescription request approved.'
        ]);

        // Generate PDF
        $logoPath = public_path('storage/images/logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $type = pathinfo($logoPath, PATHINFO_EXTENSION);
            $data = file_get_contents($logoPath);
            $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('prescription', ['prescription' => $prescription, 'logo' => $logoBase64]);
        
        $pdfContent = $pdf->output();
        $filename = 'prescription-' . $prescription->prescription_number . '.pdf';
        $relativeFolder = 'uploads/prescriptions';
        
        // Ensure folder exists
        \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory($relativeFolder);
        
        $fullPath = $relativeFolder . '/' . $filename;
        \Illuminate\Support\Facades\Storage::disk('public')->put($fullPath, $pdfContent);

        // Update Order Item with prescription path
        $orderItem->update([
            'prescription_path' => $fullPath
        ]);

        return response()->json([
            'message' => 'Product prescription request approved and generated successfully',
            'prescription' => $prescription,
            'file_path' => $fullPath
        ]);
    }
}
