<?php

namespace App\Repositories\Communication;

use App\Models\SmtpSetting;
use Illuminate\Support\Collection;

interface SmtpRepositoryInterface
{
    public function all(): Collection;
    public function find(int $id): ?SmtpSetting;
    public function getActive(): ?SmtpSetting;
    public function getBackup(int $excludeId = null): ?SmtpSetting;
    public function create(array $data): SmtpSetting;
    public function update(int $id, array $data): SmtpSetting;
    public function delete(int $id): bool;
    public function setActive(int $id): bool;
}
