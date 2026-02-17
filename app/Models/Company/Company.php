<?php

namespace App\Models\Company; // Путь пространства имён соответствует папке

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Используем обновлённый путь к CompanyContactChannel
use App\Models\Company\CompanyContactChannel;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'address'
    ];

    public function contactChannels()
    {
        // Указываем полный путь к модели CompanyContactChannel
        return $this->hasMany(CompanyContactChannel::class, 'company_id');
    }
}
