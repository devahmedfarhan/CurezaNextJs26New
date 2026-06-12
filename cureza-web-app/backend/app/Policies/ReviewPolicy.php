<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    /**
     * Determine if the user can view any reviews.
     */
    public function viewAny(User $user): bool
    {
        // Super admins can view all reviews
        if ($user->role === 'super_admin') {
            return true;
        }

        // Sellers can view their own reviews
        if ($user->role === 'seller') {
            return true;
        }

        // Customers can view their own reviews
        return $user->role === 'customer';
    }

    /**
     * Determine if the user can view the review.
     */
    public function view(User $user, Review $review): bool
    {
        // Super admins can view any review
        if ($user->role === 'super_admin') {
            return true;
        }

        // Sellers can view reviews for their products/brand
        if ($user->role === 'seller' && $review->seller_id === $user->id) {
            return true;
        }

        // Customers can view their own reviews
        return $user->role === 'customer' && $review->customer_id === $user->id;
    }

    /**
     * Determine if the user can create reviews.
     */
    public function create(User $user): bool
    {
        // Only customers can create reviews
        // Super admins can also create reviews manually
        return in_array($user->role, ['customer', 'super_admin']);
    }

    /**
     * Determine if the user can update the review.
     */
    public function update(User $user, Review $review): bool
    {
        // Only super admins can update reviews
        // Customers cannot edit their own reviews (business rule)
        return $user->role === 'super_admin';
    }

    /**
     * Determine if the user can delete the review.
     */
    public function delete(User $user, Review $review): bool
    {
        // Only super admins can delete reviews
        return $user->role === 'super_admin';
    }

    /**
     * Determine if the user can reply to the review.
     */
    public function reply(User $user, Review $review): bool
    {
        // Sellers can reply to their own product/brand reviews
        if ($user->role === 'seller' && $review->seller_id === $user->id) {
            return true;
        }

        // Super admins can reply to any review
        return $user->role === 'super_admin';
    }

    /**
     * Determine if the user can moderate (hide/show) the review.
     */
    public function moderate(User $user, Review $review): bool
    {
        // Only super admins can moderate reviews
        return $user->role === 'super_admin';
    }

    /**
     * Determine if the user can restore a soft-deleted review.
     */
    public function restore(User $user, Review $review): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Determine if the user can permanently delete the review.
     */
    public function forceDelete(User $user, Review $review): bool
    {
        return $user->role === 'super_admin';
    }
}
