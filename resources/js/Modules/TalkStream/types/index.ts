// resources/js/Modules/TalkStream/types/index.ts

export interface User {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    roles?: string[];
}

export interface Contact extends User {
    is_online?: boolean;
    last_seen_at?: string;
}

export interface Message {
    id: number;
    from_id: number;
    to_id: number;
    content: string;
    type: 'text' | 'image' | 'file' | 'system';
    read_at?: string | null;
    created_at: string;
    sender?: User; // Подгружается в resource
    formatted_created_at?: string;
    is_mine?: boolean; // Вычисляемое поле для UI
}

export interface FriendRequest {
    id: number;
    user_id: number;
    friend_id: number;
    accepted: boolean | null;
    declined: boolean | null;
    created_at: string;
    user?: User;
    friend?: User;
}

// Универсальный тип ответа API (если используете responseSuccess/responseFailed)
export interface ApiResponse<T> {
    status: string;
    data?: T;
    message?: string;
}

export interface WebSocketStatus {
    isConnected: boolean;
    error: string | null;
}
