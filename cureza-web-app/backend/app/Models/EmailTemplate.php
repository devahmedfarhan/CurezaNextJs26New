<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Blade;

class EmailTemplate extends Model
{
    protected $table = 'communication_templates';

    protected $fillable = [
        'key',
        'name',
        'subject',
        'body',
        'variables',
        'is_active',
        'theme'
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * Compile the email template body with variables using Blade rendering.
     */
    public function compile(array $variables = []): string
    {
        try {
            return Blade::render($this->body, $variables);
        } catch (\Exception $e) {
            // Fallback to simple mustache replacement if Blade compilation fails
            $body = $this->body;
            foreach ($variables as $key => $value) {
                if (is_scalar($value)) {
                    $body = str_replace(['{{ $' . $key . ' }}', '{{' . $key . '}}', '{{ ' . $key . ' }}'], (string)$value, $body);
                }
            }
            return $body;
        }
    }

    /**
     * Compile the subject line with variables.
     */
    public function compileSubject(array $variables = []): string
    {
        $subject = $this->subject;
        foreach ($variables as $key => $value) {
            if (is_scalar($value)) {
                $subject = str_replace(['{{ $' . $key . ' }}', '{{' . $key . '}}', '{{ ' . $key . ' }}'], (string)$value, $subject);
            }
        }
        return $subject;
    }
}
