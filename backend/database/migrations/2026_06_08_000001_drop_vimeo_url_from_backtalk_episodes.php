<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('backtalk_episodes', function (Blueprint $table) {
            // AES-HLS 配信に一本化したため Vimeo URL は廃止
            $table->dropColumn('vimeo_url');
        });
    }

    public function down(): void
    {
        Schema::table('backtalk_episodes', function (Blueprint $table) {
            $table->string('vimeo_url')->nullable()->after('description');
        });
    }
};
