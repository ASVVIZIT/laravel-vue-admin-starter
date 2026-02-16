<?php

namespace App\Models\SocialMediaLink;

use Illuminate\Database\Eloquent\Model;

class SocialMediaLink extends Model
{
    protected $fillable = ['name', 'url', 'icon', 'order_column', 'description'];

    protected $casts = [
        'order_column' => 'integer',
    ];

    // Указываем имя таблицы, если оно отличается от стандартного
    protected $table = 'social_media_links';

    // Указываем атрибут по умолчанию для order_column
    protected $attributes = [
        'order_column' => 0,
    ];
}
