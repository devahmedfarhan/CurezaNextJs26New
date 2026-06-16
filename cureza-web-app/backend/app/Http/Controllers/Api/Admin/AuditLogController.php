<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs.
     */
    public function index(Request $request)
    {
        // Require admin or superadmin
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = ActivityLog::with(['user' => function ($q) {
            $q->select('id', 'name', 'email', 'role');
        }]);

        // Filter by Stakeholder Type / Tab
        if ($request->has('role') && !empty($request->input('role'))) {
            $role = $request->input('role');
            if ($role === 'customer') {
                $query->whereHas('user', function ($q) {
                    $q->where('role', 'customer');
                });
            } elseif ($role === 'doctor') {
                $query->whereHas('user', function ($q) {
                    $q->where('role', 'doctor');
                });
            } elseif ($role === 'seller') {
                $query->whereHas('user', function ($q) {
                    $q->whereIn('role', ['seller', 'vendor']);
                });
            } elseif ($role === 'system') {
                $query->where(function ($q) {
                    $q->whereHas('user', function ($uq) {
                        $uq->whereIn('role', ['admin', 'super_admin']);
                    })->orWhereNull('user_id');
                });
            }
        }

        // Search functionality
        if ($request->has('search') && !empty($request->input('search'))) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Paginated results, ordered by latest
        $logs = $query->latest()->paginate(25);

        return response()->json($logs);
    }
}
