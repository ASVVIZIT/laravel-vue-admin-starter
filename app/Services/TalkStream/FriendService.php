<?php

namespace App\Services\TalkStream;

use App\Models\TalkStream\FriendRequest;

class FriendService
{
    /**
     * Проверяет, являются ли пользователи друзьями.
     * Исправленная логика OR/AND.
     */
    public static function areFriends(int $userId, int $friendId): bool
    {
        return FriendRequest::where(function ($query) use ($userId, $friendId) {
            // Вариант 1: User -> FriendRequest -> Accepted
            $query->where('user_id', $userId)
                ->where('friend_id', $friendId)
                ->where('accepted', true);
        })
            ->orWhere(function ($query) use ($userId, $friendId) {
                // Вариант 2: FriendRequest -> User -> Accepted
                $query->where('user_id', $friendId)
                    ->where('friend_id', $userId)
                    ->where('accepted', true);
            })
            ->exists();
    }
}
