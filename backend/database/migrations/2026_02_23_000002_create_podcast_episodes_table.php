<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('podcast_episodes', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('episode_number');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('audio_url');          // ストレージの相対パス or 外部URL
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->string('thumbnail_url')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('podcast_episodes');
    }
};
