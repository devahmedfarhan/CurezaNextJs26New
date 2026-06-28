<?php

namespace App\Repositories\Communication\Eloquent;

use App\Models\EmailTemplate;
use App\Repositories\Communication\EmailTemplateRepositoryInterface;
use Illuminate\Support\Collection;

class EmailTemplateRepository implements EmailTemplateRepositoryInterface
{
    public function all(): Collection
    {
        return EmailTemplate::all();
    }

    public function find(int $id): ?EmailTemplate
    {
        return EmailTemplate::find($id);
    }

    public function findByKey(string $key): ?EmailTemplate
    {
        return EmailTemplate::where('key', $key)->first();
    }

    public function create(array $data): EmailTemplate
    {
        return EmailTemplate::create($data);
    }

    public function update(int $id, array $data): EmailTemplate
    {
        $template = EmailTemplate::findOrFail($id);
        $template->update($data);
        return $template;
    }

    public function delete(int $id): bool
    {
        $template = EmailTemplate::findOrFail($id);
        return $template->delete();
    }
}
