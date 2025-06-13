<?php

namespace App\Models\TalkStream;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class FriendRequest extends Model
{
    protected $table = 'friend_requests';

    public $timestamps = false;

    protected $fillable = ['user_id', 'friend_id', 'accepted', 'declined'];

    // Кто отправил запрос (пользователь)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Кому был отправлен запрос (друг)
    public function friend()
    {
        return $this->belongsTo(User::class, 'friend_id');
    }


    public static function areFriends(int $userId, int $friendId): bool
    {
        return self::where([
            ['user_id', $userId],
            ['friend_id', $friendId],
            ['accepted', true]
        ])->orWhere([
            ['user_id', $friendId],
            ['friend_id', $userId],
            ['accepted', true]
        ])->exists();
    }
}
