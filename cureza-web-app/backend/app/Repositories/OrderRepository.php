<?php

namespace App\Repositories;

use App\Models\Order;

class OrderRepository
{
    /**
     * Get a specific order by ID or order_number with relations.
     */
    public function find($id, array $relations = []): ?Order
    {
        return Order::with($relations)
            ->where('id', $id)
            ->orWhere('order_number', $id)
            ->first();
    }

    /**
     * Get orders for a specific seller.
     */
    public function getSellerOrders(int $sellerId, array $filters = [], int $perPage = 15)
    {
        $query = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->with([
            'user',
            'items' => function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId)->with('product.brand');
            }
        ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $status = strtolower($filters['status']);
            if ($status === 'delivered') {
                $query->whereIn('status', ['delivered', 'cod_reconciled']);
            } else {
                $query->where('status', $status);
            }
        }

        return $perPage === -1 ? $query->latest()->get() : $query->latest()->paginate($perPage);
    }

    /**
     * Get orders for a customer.
     */
    public function getCustomerOrders(int $userId, array $relations = ['items'])
    {
        return Order::where('user_id', $userId)->with($relations)->latest()->get();
    }

    /**
     * Get orders for admin.
     */
    public function getAdminOrders(array $filters = [], int $perPage = 15)
    {
        $query = Order::with(['items.seller', 'user', 'items.product.brand']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['seller_id'])) {
            $query->whereHas('items', function ($q) use ($filters) {
                $q->where('seller_id', $filters['seller_id']);
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        if (!empty($filters['product_id'])) {
            $query->whereHas('items', function ($q) use ($filters) {
                $q->where('product_id', $filters['product_id']);
            });
        }

        if (!empty($filters['brand_id'])) {
            $query->whereHas('items.product', function ($q) use ($filters) {
                $q->where('brand_id', $filters['brand_id']);
            });
        }

        return $perPage === -1 ? $query->latest()->get() : $query->latest()->paginate($perPage);
    }
}
