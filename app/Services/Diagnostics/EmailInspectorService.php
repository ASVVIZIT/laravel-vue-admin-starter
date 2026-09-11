<?php

namespace App\Services\Diagnostics;

use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class EmailInspectorService
{
    /**
     * Полная проверка email без мутаций данных.
     */
    public function inspect(string $email): array
    {
        $result = [
            'email'         => $email,
            'valid_format'  => false,
            'mx_records'    => null,
            'domain'        => null,
            'registered'    => false,
            'user_id'       => null,
            'is_system'     => false,
            'system_role'   => null,
            'verified'      => false,
            'banned'        => false,
            'trashed'       => false,
            'status_type'   => null,
        ];

        // 1. Формат email
        $validator = Validator::make(['email' => $email], ['email' => 'required|email']);
        $result['valid_format'] = $validator->passes();

        if (!$result['valid_format']) {
            $result['mx_records'] = false;
            return $result;
        }

        // 2. Домен и MX-записи
        $domain = substr($email, strpos($email, '@') + 1);
        $result['domain'] = $domain;
        $result['mx_records'] = checkdnsrr($domain, 'MX');

        // 3. Поиск в системе
        $user = User::withTrashed()->where('email', $email)->first();

        if (!$user) {
            return $result;
        }

        $result['registered']  = true;
        $result['user_id']     = $user->id;
        $result['is_system']   = (bool) $user->is_system;
        $result['system_role'] = $user->system_role;
        $result['verified']    = !is_null($user->email_verified_at);
        $result['trashed']     = !is_null($user->deleted_at);

        // 4. Бан через login_attempts
        $result['banned'] = LoginAttempt::where('email', $email)
            ->where('is_banned', true)
            ->exists();

        // 5. Статус (как в userStatus.js)
        if ($result['trashed']) {
            $result['status_type'] = 'trashed';
        } elseif ($result['banned']) {
            $result['status_type'] = 'banned';
        } elseif (!$result['verified']) {
            $result['status_type'] = 'unverified';
        } else {
            $result['status_type'] = 'active';
        }

        return $result;
    }
}
