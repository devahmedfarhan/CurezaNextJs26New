<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Appointment;

class PaymentController extends Controller
{
    private $key;
    private $secret;
    private $baseUrl = 'https://api.razorpay.com/v1';

    public function __construct()
    {
        $this->key = env('RAZORPAY_KEY');
        $this->secret = env('RAZORPAY_SECRET');
    }

    public function createRazorpayOrder(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
        ]);

        $appointment = Appointment::find($request->appointment_id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Amount in paise (100 paise = 1 INR)
        // Ensure we multiply by 100 and cast to integer
        $amount = (int) ($appointment->amount * 100);

        try {
            $response = Http::withBasicAuth($this->key, $this->secret)
                ->post($this->baseUrl . '/orders', [
                    'amount' => $amount,
                    'currency' => 'INR',
                    'receipt' => 'appt_' . $appointment->id,
                    'notes' => [
                        'appointment_id' => $appointment->id,
                        'patient_id' => $appointment->patient_id,
                        'doctor_id' => $appointment->doctor_id,
                    ]
                ]);

            if ($response->successful()) {
                $order = $response->json();
                
                // You might want to save the order_id in the appointment
                $appointment->payment_details = json_encode(['order_id' => $order['id']]);
                $appointment->save();

                return response()->json([
                    'order_id' => $order['id'],
                    'amount' => $order['amount'],
                    'currency' => $order['currency'],
                    'key' => $this->key // Send key to frontend
                ]);
            } else {
                Log::error('Razorpay Order Creation Failed', ['error' => $response->body()]);
                return response()->json(['message' => 'Failed to create payment order', 'details' => $response->json()], 500);
            }

        } catch (\Exception $e) {
            Log::error('Razorpay Error: ' . $e->getMessage());
            return response()->json(['message' => 'Internal server error during payment initialization'], 500);
        }
    }

    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required',
            'razorpay_payment_id' => 'required',
            'razorpay_signature' => 'required',
            'appointment_id' => 'required|exists:appointments,id'
        ]);

        $generatedSignature = hash_hmac('sha256', $request->razorpay_order_id . "|" . $request->razorpay_payment_id, $this->secret);

        if ($generatedSignature === $request->razorpay_signature) {
            // Payment successful
            $appointment = Appointment::find($request->appointment_id);
            $appointment->status = 'confirmed';
            $appointment->payment_status = 'paid';
            $appointment->payment_details = json_encode([
                'order_id' => $request->razorpay_order_id,
                'payment_id' => $request->razorpay_payment_id
            ]);
            $appointment->save();

            return response()->json(['message' => 'Payment successful', 'status' => 'success']);
        } else {
            return response()->json(['message' => 'Invalid signature', 'status' => 'failed'], 400);
        }
    }
}
