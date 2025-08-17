<?php
// app/Models/TableRow.php
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
        'order',
        'is_expanded'
    ];

    protected $casts = [
        'data' => 'array',
        'is_expanded' => 'boolean'
    ];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('order');
    }

}
