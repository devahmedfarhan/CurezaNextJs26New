<?php

namespace App\Repositories\Communication\Eloquent;

use App\Models\Subscriber;
use App\Repositories\Communication\SubscriberRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class SubscriberRepository implements SubscriberRepositoryInterface
{
    public function find(int $id): ?Subscriber
    {
        return Subscriber::find($id);
    }

    public function findByEmail(string $email): ?Subscriber
    {
        return Subscriber::where('email', $email)->first();
    }

    public function findByToken(string $token): ?Subscriber
    {
        return Subscriber::where('double_opt_in_token', $token)->first();
    }

    public function create(array $data): Subscriber
    {
        return Subscriber::create($data);
    }

    public function update(int $id, array $data): Subscriber
    {
        $subscriber = Subscriber::findOrFail($id);
        $subscriber->update($data);
        return $subscriber;
    }

    public function delete(int $id): bool
    {
        $subscriber = Subscriber::findOrFail($id);
        return $subscriber->delete();
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Subscriber::query()->orderBy('created_at', 'desc');

        // Exclude temporary CSV contacts from database listing
        $query->where(function ($q) {
            $q->whereNull('tags')
              ->orWhereJsonDoesntContain('tags->csv_temp', true);
        });

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['tag'])) {
            $tag = $filters['tag'];
            $query->whereJsonContains('tags', $tag);
        }

        if (!empty($filters['segment'])) {
            $segment = $filters['segment'];
            $query->whereJsonContains('segments', $segment);
        }

        return $query->paginate($perPage);
    }

    public function sync(string $email, array $data): Subscriber
    {
        $subscriber = Subscriber::where('email', $email)->first();
        if ($subscriber) {
            $subscriber->update($data);
            return $subscriber;
        }
        $data['email'] = $email;
        return Subscriber::create($data);
    }
}
