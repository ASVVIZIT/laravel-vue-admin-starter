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
    main_role?: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sending' | 'delivered' | 'read' | 'failed';

export interface Message {
    id: number;
    from_id: number;
    to_id: number;
    content: string;
    type: MessageType;
    read_at?: string | null;
    created_at: string;
    sender?: User;
    formatted_created_at?: string;
    formatted_read_at?: string;
    is_mine?: boolean;
    isLocal?: boolean;
    status?: MessageStatus;
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

export interface ApiResponse<T> {
    status: string;
    data?: T;
    message?: string;
}

export interface WebSocketStatus {
    isConnected: boolean;
    error: string | null;
}

export type CallDataType = 'audio' | 'video';
export type CallDataStatus = 'pending' | 'active' | 'ended';

export interface CallData {
    id?: number;
    caller_id: number;
    callee_id: number;
    type: CallDataType;
    status?: CallDataStatus;
    started_at?: string;
    ended_at?: string;
}
