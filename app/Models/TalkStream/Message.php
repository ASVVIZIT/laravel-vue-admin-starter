<?php

namespace App\Models\TalkStream;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'from_id',
        'to_id',
        'content',
        'type',
        'read_at'
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_created_at',
        // 🔥 НОВОЕ (рука 2, для слота ⋮ в пузыре): время прочтения собеседником
        'formatted_read_at'
    ];

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
                if (!$this->created_at) {
                    return '';
                }

                $date = $this->created_at;

                if (!($date instanceof Carbon)) {
                    $date = Carbon::parse($this->created_at);
                }

                if ($date->isToday()) {
                    return $date->format('H:i:s');
                } elseif ($date->isYesterday()) {
                    return 'Вчера в ' . $date->format('H:i:s');
                } elseif ($date->isCurrentYear()) {
                    return $date->format('d M \в H:i:s');
                } else {
                    return $date->format('d.m.Y \в H:i:s');
                }
            }
        );
    }

    // 🔥 НОВОЕ (рука 2): форматированное время прочтения.
    // read_at nullable (миграция): если собеседник не читал — пустая строка,
    // слот ⋮ в MessageItem просто не отрисуется (v-if по непустоте в шаге 6).
    // Структура веток идентична formattedCreatedAt, чтобы UI-время выглядело единообразно.
    protected function formattedReadAt(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->read_at) {
                    return '';
                }

                $date = $this->read_at;

                if (!($date instanceof Carbon)) {
                    $date = Carbon::parse($this->read_at);
                }

                if ($date->isToday()) {
                    return $date->format('H:i:s');
                } elseif ($date->isYesterday()) {
                    return 'Вчера в ' . $date->format('H:i:s');
                } elseif ($date->isCurrentYear()) {
                    return $date->format('d M \в H:i:s');
                } else {
                    return $date->format('d.m.Y \в H:i:s');
                }
            }
        );
    }
}
