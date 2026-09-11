<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIsSystemToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_system')) {
                $table->boolean('is_system')->default(false)->after('email');
            }
            if (!Schema::hasColumn('users', 'system_role')) {
                $table->string('system_role', 30)->nullable()->after('is_system');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'system_role')) {
                $table->dropColumn('system_role');
            }
            if (Schema::hasColumn('users', 'is_system')) {
                $table->dropColumn('is_system');
            }
        });
    }
}
