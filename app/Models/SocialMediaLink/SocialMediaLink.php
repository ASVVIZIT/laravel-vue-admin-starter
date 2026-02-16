<?php

namespace App\Models\SocialMediaLink;

use Illuminate\Database\Eloquent\Model;

class SocialMediaLink extends Model
{
    protected $fillable = ['name', 'url', 'icon', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];
}
