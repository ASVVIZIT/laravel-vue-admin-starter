<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Template as Template;

class ColumnTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'type',
        'label',
        'options',
        'order'
    ];

    protected $casts = [
        'options' => 'array'
    ];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }
}
