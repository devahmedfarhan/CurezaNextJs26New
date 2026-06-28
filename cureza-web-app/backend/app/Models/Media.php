<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    use SoftDeletes;

    protected $table = 'media';

    protected $fillable = [
        'file_id',
        'url',
        'thumbnail_url',
        'file_name',
        'folder_id',
        'width',
        'height',
        'size_bytes',
        'extension',
        'title',
        'alt_text',
        'caption',
        'description',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
        'width' => 'integer',
        'height' => 'integer',
        'size_bytes' => 'integer',
    ];

    /**
     * Get the folder that contains this media item.
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'folder_id');
    }
}
