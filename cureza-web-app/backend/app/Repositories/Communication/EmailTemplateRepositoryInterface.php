<?php

namespace App\Repositories\Communication;

use App\Models\EmailTemplate;
use Illuminate\Support\Collection;

interface EmailTemplateRepositoryInterface
{
    public function all(): Collection;
    public function find(int $id): ?EmailTemplate;
    public function findByKey(string $key): ?EmailTemplate;
    public function create(array $data): EmailTemplate;
    public function update(int $id, array $data): EmailTemplate;
    public function delete(int $id): bool;
}
