<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Template as Template;

class TableRow extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'parent_id',
        'data',
        'order'
    ];

    protected $casts = [
        'data' => 'array'
    ];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class);
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

}
