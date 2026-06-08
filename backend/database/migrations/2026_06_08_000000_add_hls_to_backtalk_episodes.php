<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('backtalk_episodes', function (Blueprint $table) {
            // AES-128 HLS 配信が準備済みか（zip アップロード成功でtrue）
            $table->boolean('hls_ready')->default(false)->after('thumbnail_url');
        });

        // 旧Vimeo方式との併存のため vimeo_url を nullable 化
        Schema::table('backtalk_episodes', function (Blueprint $table) {
            $table->string('vimeo_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('backtalk_episodes', function (Blueprint $table) {
            $table->dropColumn('hls_ready');
            $table->string('vimeo_url')->nullable(false)->change();
        });
    }
};
