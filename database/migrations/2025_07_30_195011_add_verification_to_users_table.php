<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. Первичная верификация
            if (!Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('email');
            }

            // 2. Последняя перепроверка
            if (!Schema::hasColumn('users', 'email_reverified_at')) {
                $table->timestamp('email_reverified_at')->nullable()->after('email_verified_at');
            }

            // 3. Поля для смены email
            if (!Schema::hasColumn('users', 'pending_new_email')) {
                $table->string('pending_new_email')->nullable()->after('email_reverified_at');
            }
            if (!Schema::hasColumn('users', 'pending_email_token')) {
                $table->string('pending_email_token')->nullable()->after('pending_new_email');
            }
            if (!Schema::hasColumn('users', 'pending_email_expires_at')) {
                $table->timestamp('pending_email_expires_at')->nullable()->after('pending_email_token');
            }
            if (!Schema::hasColumn('users', 'old_email_confirmed')) {
                $table->boolean('old_email_confirmed')->default(false)->after('pending_email_expires_at');
            }

            // 4. НОВОЕ: Способ подтверждения каждого шага ('email' | 'admin' | null)
            //    Нужно для звёзд в таблице/профиле: зелёная = реально (письмо), синяя = системно (админ)
            if (!Schema::hasColumn('users', 'old_email_confirm_method')) {
                $table->string('old_email_confirm_method', 10)->nullable()->after('old_email_confirmed');
            }
            if (!Schema::hasColumn('users', 'new_email_confirm_method')) {
                $table->string('new_email_confirm_method', 10)->nullable()->after('old_email_confirm_method');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Откат в обратном порядке создания
            if (Schema::hasColumn('users', 'new_email_confirm_method')) {
                $table->dropColumn('new_email_confirm_method');
            }
            if (Schema::hasColumn('users', 'old_email_confirm_method')) {
                $table->dropColumn('old_email_confirm_method');
            }
            if (Schema::hasColumn('users', 'old_email_confirmed')) {
                $table->dropColumn('old_email_confirmed');
            }
            if (Schema::hasColumn('users', 'pending_email_expires_at')) {
                $table->dropColumn('pending_email_expires_at');
            }
            if (Schema::hasColumn('users', 'pending_email_token')) {
                $table->dropColumn('pending_email_token');
            }
            if (Schema::hasColumn('users', 'pending_new_email')) {
                $table->dropColumn('pending_new_email');
            }
            if (Schema::hasColumn('users', 'email_reverified_at')) {
                $table->dropColumn('email_reverified_at');
            }
            if (Schema::hasColumn('users', 'email_verified_at')) {
                $table->dropColumn('email_verified_at');
            }
        });
    }
};
