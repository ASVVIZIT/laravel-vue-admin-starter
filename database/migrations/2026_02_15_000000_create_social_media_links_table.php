<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSocialMediaLinksTable extends Migration
{
    public function up()
    {
        Schema::create('social_media_links', function (Blueprint $table) {
            $table->id();
            $table->string('name', 300);
            $table->string('url', 1000); // Увеличен размер для полных URL
            $table->string('icon', 100);
            $table->text('description')->nullable();
            $table->integer('order_column')->default(0); // Используем order_column, т.к. order - зарезервированное слово
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('social_media_links');
    }
}
