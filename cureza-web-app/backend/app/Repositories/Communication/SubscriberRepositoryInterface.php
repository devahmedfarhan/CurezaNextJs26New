<?php

namespace App\Repositories\Communication;

use App\Models\Subscriber;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface SubscriberRepositoryInterface
{
    public function find(int $id): ?Subscriber;
    public function findByEmail(string $email): ?Subscriber;
    public function findByToken(string $token): ?Subscriber;
    public function create(array $data): Subscriber;
    public function update(int $id, array $data): Subscriber;
    public function delete(int $id): bool;
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function sync(string $email, array $data): Subscriber;
}
