<?php

namespace App\Policies;

use App\Models\SellerProfile;
use App\Models\User;

class SellerProfilePolicy
{
    public function view(User $user, SellerProfile $profile): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        return $user->id === $profile->user_id;
    }

    public function update(User $user, SellerProfile $profile): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        return $user->id === $profile->user_id;
    }
}
