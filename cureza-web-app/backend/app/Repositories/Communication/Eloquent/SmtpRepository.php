<?php

namespace App\Repositories\Communication\Eloquent;

use App\Models\SmtpSetting;
use App\Repositories\Communication\SmtpRepositoryInterface;
use Illuminate\Support\Collection;

class SmtpRepository implements SmtpRepositoryInterface
{
    public function all(): Collection
    {
        return SmtpSetting::orderBy('priority', 'asc')->get();
    }

    public function find(int $id): ?SmtpSetting
    {
        return SmtpSetting::find($id);
    }

    public function getActive(): ?SmtpSetting
    {
        return SmtpSetting::where('is_active', true)->orderBy('priority', 'asc')->first();
    }

    public function getBackup(int $excludeId = null): ?SmtpSetting
    {
        $query = SmtpSetting::where('is_backup', true);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        return $query->orderBy('priority', 'asc')->first();
    }

    public function create(array $data): SmtpSetting
    {
        // If this is set as active, optionally turn off others if only one SMTP is allowed to be active
        if (!empty($data['is_active']) && $data['is_active']) {
            SmtpSetting::where('is_active', true)->update(['is_active' => false]);
        }
        return SmtpSetting::create($data);
    }

    public function update(int $id, array $data): SmtpSetting
    {
        $setting = SmtpSetting::findOrFail($id);
        
        if (isset($data['is_active']) && $data['is_active']) {
            SmtpSetting::where('id', '!=', $id)->where('is_active', true)->update(['is_active' => false]);
        }
        
        $setting->update($data);
        return $setting;
    }

    public function delete(int $id): bool
    {
        $setting = SmtpSetting::findOrFail($id);
        return $setting->delete();
    }

    public function setActive(int $id): bool
    {
        SmtpSetting::where('is_active', true)->update(['is_active' => false]);
        return SmtpSetting::where('id', $id)->update(['is_active' => true]) > 0;
    }
}
