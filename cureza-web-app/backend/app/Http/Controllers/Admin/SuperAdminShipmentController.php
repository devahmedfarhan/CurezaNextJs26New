<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;

class SuperAdminShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::with(['order', 'seller']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        $shipments = $query->latest()->paginate(20);

        return response()->json($shipments);
    }
}
