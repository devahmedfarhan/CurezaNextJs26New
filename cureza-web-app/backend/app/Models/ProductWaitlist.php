<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductWaitlist extends Model
{
    use HasFactory;

    protected $table = 'product_waitlists';

    protected $fillable = [
        'product_id',
        'user_id',
        'email',
        'phone',
        'notified',
    ];

    protected $casts = [
        'notified' => 'boolean',
    ];

    /**
     * Relationship with Product.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relationship with User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
