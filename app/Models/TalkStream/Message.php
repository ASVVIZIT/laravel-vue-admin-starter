<?php
namespace App\Models\TalkStream;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Message extends Model
{
    protected $table = 'messages';

    // ✅ ДОБАВЛЕНО 'type'
    protected $fillable = ['from_id', 'to_id', 'content', 'type', 'read_at'];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    protected $appends = ['formatted_created_at'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'from_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'to_id');
    }

    protected function formattedCreatedAt(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->created_at) return '';

                $date = Carbon::parse($this->created_at);
                $now = Carbon::now();

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
