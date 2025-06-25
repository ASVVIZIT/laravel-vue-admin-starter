<?php
namespace App\Models\TalkStream;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = ['from_id', 'to_id', 'content', 'read_at'];
    protected $casts = [
        'read_at' => 'datetime',
    ];

    // Добавляем аксессор в массив модели
    protected $appends = ['formatted_created_at'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'from_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'to_id');
    }

    /**
     * Геттер для форматированной даты создания
     *
     * @return Attribute
     */
    protected function formattedCreatedAt(): Attribute
    {
        return Attribute::make(
            get: function () {
                $now = Carbon::now();
                $date = $this->created_at;

                if ($date->isToday()) {
                    return $date->format('H:i');
                } elseif ($date->isYesterday()) {
                    return 'Вчера в ' . $date->format('H:i');
                } elseif ($date->isCurrentYear()) {
                    return $date->format('d M \в H:i');
                } else {
                    return $date->format('d.m.Y \в H:i');
                }
            }
        );
    }
}
