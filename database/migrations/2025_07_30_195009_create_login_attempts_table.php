<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLoginAttemptsTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('login_attempts')) {
            Schema::create('login_attempts', function (Blueprint $table) {
                $table->id();
                $table->string('ip_address', 45)->unique();
                $table->unsignedInteger('attempts')->default(0);
                $table->timestamp('last_attempt_at')->nullable();
                $table->boolean('banned')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('login_attempts');
    }
}
