<?php

namespace App\Models\TalkStream;

use Illuminate\Database\Eloquent\Model;

class FriendRequest extends Model
{
    protected $fillable = ['user_id', 'friend_id', 'accepted', 'declined'];

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
