<?php

namespace App\Models;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;

/**
 * Class Acl
 *
 * @package App
 *
 * Центральный реестр ролей и прав доступа приложения.
 * Все константы автоматически подхватываются методами permissions()/roles().
 */
final class Acl
{
    // ===== РОЛИ =====
    const ROLE_SUPER_ADMIN = 'superadmin';
    const ROLE_ADMIN = 'admin';
    const ROLE_MANAGER = 'manager';
    const ROLE_EDITOR = 'editor';
    const ROLE_USER = 'user';
    const ROLE_VISITOR = 'visitor';

    // ===== ПРАВА: МЕНЮ =====
    const PERMISSION_VIEW_MENU_ADMINISTRATOR = 'view menu administrator';
    const PERMISSION_VIEW_MENU_PERMISSION = 'view menu permission';
    const PERMISSION_VIEW_MENU_ELEMENT_UI = 'view menu element ui';
    const PERMISSION_VIEW_MENU_COMPONENTS = 'view menu components';
    const PERMISSION_VIEW_MENU_CHARTS = 'view menu charts';
    const PERMISSION_VIEW_MENU_GUIDE = 'view menu guide';
    const PERMISSION_VIEW_MENU_NESTED_ROUTES = 'view menu nested routes';
    const PERMISSION_VIEW_MENU_TABLE = 'view menu table';
    const PERMISSION_VIEW_MENU_ENTITY = 'view menu entity';
    const PERMISSION_VIEW_MENU_THEME = 'view menu theme';
    const PERMISSION_VIEW_MENU_CLIPBOARD = 'view menu clipboard';
    const PERMISSION_VIEW_MENU_EXCEL = 'view menu excel';
    const PERMISSION_VIEW_MENU_ZIP = 'view menu zip';
    const PERMISSION_VIEW_MENU_PDF = 'view menu pdf';
    const PERMISSION_VIEW_MENU_I18N = 'view menu i18n';
    const PERMISSION_VIEW_MENU_LANDING = 'view menu landing';
    const PERMISSION_VIEW_MENU_TRAINING = 'view menu training';
    const PERMISSION_VIEW_MENU_SMART_LIGHT = 'view menu smart light';

    // ===== ПРАВА: УПРАВЛЕНИЕ =====
    const PERMISSION_USER_MANAGE = 'manage user';
    const PERMISSION_USER_EDIT_MANAGE = 'manage user edit';
    const PERMISSION_USER_DELETE_MANAGE = 'manage user delete';
    const PERMISSION_CONFIRM_EMAIL = 'confirm user email'; // Подтверждение email по кнопке
    const PERMISSION_ENTITY_MANAGE = 'manage entity';
    const PERMISSION_ARTICLE_MANAGE = 'manage article';
    const PERMISSION_PERMISSION_MANAGE = 'manage permission';

    // ===== ПРАВА: LANDING BUILDER =====
    const PERMISSION_VIEW_LANDING = 'view landing';
    const PERMISSION_MANAGE_LANDING = 'manage landing';

    // ===== ПРАВА: SMARTLIGHT =====
    const PERMISSION_VIEW_SMART_LIGHT = 'view smart light';
    const PERMISSION_MANAGE_SMART_LIGHT = 'manage smart light';
    const PERMISSION_MANAGE_OWN_SMART_LIGHT = 'manage own smart light';

    // ===== ПРАВА: SOCIAL MEDIA LINKS =====
    const PERMISSION_VIEW_SOCIAL_MEDIA_LINKS = 'view social media links';
    const PERMISSION_MANAGE_SOCIAL_MEDIA_LINKS = 'manage social media links';
    const PERMISSION_MANAGE_OWN_SOCIAL_MEDIA_LINKS = 'manage own social media links';

    // ===== ПРАВА: TRAINING (ТРЕНИРОВКИ) =====
    const PERMISSION_VIEW_TRAINING = 'view training';
    const PERMISSION_MANAGE_TRAINING = 'manage training';
    const PERMISSION_MANAGE_OWN_TRAINING = 'manage own training';
    const PERMISSION_VIEW_TRAINING_STATS = 'view training stats';
    const PERMISSION_SHARE_TRAINING = 'share training';
    const PERMISSION_CREATE_TRAINING_LOG = 'create training log';

    // ===== 🔥 УНИКАЛЬНЫЕ ПРАВА: ТОЛЬКО ДЛЯ SUPERADMIN =====
    // Эти права НЕ выдаются обычному админу. Они определяют высший уровень доступа.
    const PERMISSION_MANAGE_SUPERADMIN = 'manage superadmin';          // Создание/удаление других супер-админов
    const PERMISSION_VIEW_SYSTEM_LOGS = 'view system logs';            // Просмотр системных логов и аудит-трейлов
    const PERMISSION_MANAGE_SYSTEM_SETTINGS = 'manage system settings'; // Глобальные настройки сайта (режим обслуживания и т.д.)

    /**
     * Получить все права доступа (кроме исключённых)
     */
    public static function permissions(array $exclusives = []): array
    {
        try {
            $class = new \ReflectionClass(__CLASS__);
            $constants = $class->getConstants();
            $permissions = Arr::where($constants, function($value, $key) use ($exclusives) {
                return !in_array($value, $exclusives) && Str::startsWith($key, 'PERMISSION_');
            });

            return array_values($permissions);
        } catch (\ReflectionException $exception) {
            return [];
        }
    }

    /**
     * Получить права, отвечающие за отображение меню
     */
    public static function menuPermissions(): array
    {
        try {
            $class = new \ReflectionClass(__CLASS__);
            $constants = $class->getConstants();
            $permissions = Arr::where($constants, function($value, $key) {
                return Str::startsWith($key, 'PERMISSION_VIEW_MENU_');
            });

            return array_values($permissions);
        } catch (\ReflectionException $exception) {
            return [];
        }
    }

    /**
     * Получить все роли системы
     */
    public static function roles(): array
    {
        try {
            $class = new \ReflectionClass(__CLASS__);
            $constants = $class->getConstants();
            $roles = Arr::where($constants, function($value, $key) {
                return Str::startsWith($key, 'ROLE_');
            });

            return array_values($roles);
        } catch (\ReflectionException $exception) {
            return [];
        }
    }
}
