<?php

namespace App\Models\TalkStream;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class FriendRequest extends Model
{
    protected $table = 'friend_requests';
    public $timestamps = false; // Если в миграции нет timestamps, иначе true

    protected $fillable = ['user_id', 'friend_id', 'accepted', 'declined'];

    // Кто отправил запрос
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Кому отправлен запрос
    public function friend()
    {
        return $this->belongsTo(User::class, 'friend_id');
    }

    /**
     * Проверяет, являются ли пользователи друзьями (в любом направлении)
     */
    public static function areFriends(int $userId, int $friendId): bool
    {
        return self::where(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)
                ->where('friend_id', $friendId)
                ->where('accepted', true);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)
                ->where('friend_id', $userId)
                ->where('accepted', true);
        })->exists();
    }
}
