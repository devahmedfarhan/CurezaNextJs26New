<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine whether the user can view any products.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the product.
     */
    public function view(User $user, Product $product): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        if ($user->role === 'vendor' || $user->role === 'seller') {
            return $user->id === $product->seller_id;
        }

        return $product->isActive();
    }

    /**
     * Determine whether the user can create products.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['vendor', 'seller', 'admin', 'super_admin']);
    }

    /**
     * Determine whether the user can update the product.
     */
    public function update(User $user, Product $product): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        return ($user->role === 'vendor' || $user->role === 'seller') && $user->id === $product->seller_id;
    }

    /**
     * Determine whether the user can delete the product.
     */
    public function delete(User $user, Product $product): bool
    {
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        return ($user->role === 'vendor' || $user->role === 'seller') && $user->id === $product->seller_id;
    }
}
