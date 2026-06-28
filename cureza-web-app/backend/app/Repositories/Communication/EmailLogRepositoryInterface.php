<?php

namespace App\Repositories\Communication;

use App\Models\EmailLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface EmailLogRepositoryInterface
{
    public function find(int $id): ?EmailLog;
    public function create(array $data): EmailLog;
    public function update(int $id, array $data): EmailLog;
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function getAnalyticsSummary(): array;
}
