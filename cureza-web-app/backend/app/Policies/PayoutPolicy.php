<?php

namespace App\Policies;

use App\Models\Payout;
use App\Models\User;

class PayoutPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['vendor', 'seller', 'admin', 'super_admin']);
    }

    public function view(User $user, Payout $payout): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        return ($user->role === 'vendor' || $user->role === 'seller') && $user->id === $payout->seller_id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['vendor', 'seller']);
    }

    public function update(User $user, Payout $payout): bool
    {
        return in_array($user->role, ['admin', 'super_admin']);
    }

    public function delete(User $user, Payout $payout): bool
    {
        return in_array($user->role, ['admin', 'super_admin']);
    }

    public function manage(User $user, Payout $payout): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        return ($user->role === 'vendor' || $user->role === 'seller') && $user->id === $payout->seller_id;
    }
}
