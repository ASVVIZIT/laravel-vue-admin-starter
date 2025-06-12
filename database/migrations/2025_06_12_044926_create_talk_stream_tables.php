<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTalkStreamTables extends Migration
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('from_id');
            $table->unsignedBigInteger('to_id');
            $table->text('content');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->foreign('from_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('to_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('calls', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('caller_id');
            $table->unsignedBigInteger('callee_id');
            $table->string('type')->default('video');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->foreign('caller_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('callee_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('friend_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('friend_id');
            $table->boolean('accepted')->default(false);
            $table->boolean('declined')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'friend_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('friend_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('friend_requests');
        Schema::dropIfExists('calls');
        Schema::dropIfExists('messages');
    }
}
