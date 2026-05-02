<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voicedoor_episodes', function (Blueprint $table) {
            $table->text('apple_podcast_url')->change();
        });
    }

    public function down(): void
    {
        Schema::table('voicedoor_episodes', function (Blueprint $table) {
            $table->string('apple_podcast_url')->change();
        });
    }
};
