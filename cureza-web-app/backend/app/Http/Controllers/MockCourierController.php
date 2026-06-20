<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MockCourierController extends Controller
{
    /**
     * Get available pickup time slots.
     */
    public function getSlots()
    {
        $today = now()->format('Y-m-d');
        $tomorrow = now()->addDay()->format('Y-m-d');
        
        return response()->json([
            'slots' => [
                ['id' => 'slot_1', 'date' => $today, 'time' => '10:00 AM - 01:00 PM', 'label' => "Today ($today) 10:00 AM - 01:00 PM"],
                ['id' => 'slot_2', 'date' => $today, 'time' => '01:00 PM - 04:00 PM', 'label' => "Today ($today) 01:00 PM - 04:00 PM"],
                ['id' => 'slot_3', 'date' => $today, 'time' => '04:00 PM - 07:00 PM', 'label' => "Today ($today) 04:00 PM - 07:00 PM"],
                ['id' => 'slot_4', 'date' => $tomorrow, 'time' => '10:00 AM - 01:00 PM', 'label' => "Tomorrow ($tomorrow) 10:00 AM - 01:00 PM"],
                ['id' => 'slot_5', 'date' => $tomorrow, 'time' => '01:00 PM - 04:00 PM', 'label' => "Tomorrow ($tomorrow) 01:00 PM - 04:00 PM"],
            ]
        ]);
    }

    /**
     * Book shipment with courier and get AWB + charges.
     */
    public function book(Request $request)
    {
        $request->validate([
            'weight' => 'required|numeric|min:0.01',
            'dimensions_l' => 'required|integer|min:1',
            'dimensions_w' => 'required|integer|min:1',
            'dimensions_h' => 'required|integer|min:1',
            'pickup_slot' => 'required|string',
        ]);

        $awb = 'DEL' . rand(100000000, 999999999) . 'IN';
        
        // Calculate mock shipping charge: base ₹50 + ₹20 per kg
        $weight = (float) $request->weight;
        $charge = 50.00 + ($weight * 20.00);
        $charge = round($charge, 2);

        return response()->json([
            'success' => true,
            'tracking_number' => $awb,
            'courier_name' => 'Delhivery',
            'shipping_charge' => $charge,
            'estimated_delivery' => now()->addDays(3)->format('Y-m-d')
        ]);
    }
}
