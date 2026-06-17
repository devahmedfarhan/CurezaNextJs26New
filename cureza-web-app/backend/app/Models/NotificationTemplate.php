<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'flow',
        'channel',
        'subject',
        'content',
        'trigger_type',
        'delay_value',
        'delay_unit',
        'status',
        'whatsapp_template_name',
        'whatsapp_status',
        'variables',
    ];

    protected $casts = [
        'variables' => 'array',
        'delay_value' => 'integer',
    ];

    /**
     * Compile placeholders in template subject and body.
     */
    public function compile(array $placeholders): array
    {
        $subject = $this->subject;
        $content = $this->content;

        foreach ($placeholders as $key => $val) {
            $placeholder = '{{' . $key . '}}';
            if ($subject) {
                $subject = str_replace($placeholder, $val, $subject);
            }
            $content = str_replace($placeholder, $val, $content);
        }

        return [
            'subject' => $subject,
            'content' => $content,
        ];
    }
}
