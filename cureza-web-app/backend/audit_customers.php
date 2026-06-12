<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "--- CUSTOMER AUDIT START ---\n";

// 1. Role Distribution
$roles = User::select('role', DB::raw('count(*) as total'))->groupBy('role')->get();
echo "Role Distribution:\n";
foreach ($roles as $role) {
    echo "- " . ($role->role ?? 'NULL') . ": " . $role->total . "\n";
}

// 2. Duplicates
$duplicates = User::select('email', DB::raw('count(*) as total'))
    ->groupBy('email')
    ->having('total', '>', 1)
    ->get();

if ($duplicates->count() > 0) {
    echo "CRITICAL: Found duplicate emails!\n";
    foreach ($duplicates as $dup) {
        echo "- " . $dup->email . " (" . $dup->total . ")\n";
    }
} else {
    echo "OK: No duplicate emails found.\n";
}

// 3. Soft Deletes Check
// Since we saw model doesn't have trait, we check if 'deleted_at' column exists in schema just in case
$hasDeletedAt = \Illuminate\Support\Facades\Schema::hasColumn('users', 'deleted_at');
echo "Soft Deletes Enabled: " . ($hasDeletedAt ? "YES" : "NO (Fix Required)") . "\n";

echo "--- CUSTOMER AUDIT END ---\n";
