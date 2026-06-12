<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        // Customers can view their own orders
        if ($user->role === 'customer' && $user->id === $order->user_id) {
            return true;
        }

        // Sellers/vendors can view orders if they sold items in them
        if ($user->role === 'vendor' || $user->role === 'seller') {
            return $order->items()->where('seller_id', $user->id)->exists();
        }

        return false;
    }

    public function update(User $user, Order $order): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        // Sellers/vendors can update status if they sold items in the order
        if ($user->role === 'vendor' || $user->role === 'seller') {
            return $order->items()->where('seller_id', $user->id)->exists();
        }

        return false;
    }

    public function delete(User $user, Order $order): bool
    {
        return in_array($user->role, ['admin', 'super_admin']);
    }
}
