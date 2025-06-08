<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserTab extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'path',
        'tag_data'
    ];

    // Автоматическое преобразование JSON
    protected $casts = [
        'tag_data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
