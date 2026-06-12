<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function generate(Request $request)
    {
        $type = $request->input('type', 'orders');
        $startDate = $request->input('start_date', Carbon::now()->subDays(30));
        $endDate = $request->input('end_date', Carbon::now());

        if ($type == 'orders') {
            $data = Order::with('user')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->latest()
                ->get();
        } elseif ($type == 'users') {
            $data = User::whereBetween('created_at', [$startDate, $endDate])
                ->latest()
                ->get();
        } else {
            $data = [];
        }

        return response()->json([
            'data' => $data,
            'meta' => [
                'type' => $type,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'count' => count($data)
            ]
        ]);
    }
}
