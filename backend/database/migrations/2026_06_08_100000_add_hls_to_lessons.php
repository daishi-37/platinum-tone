<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // URL識別子（AES-HLS配信ディレクトリ名にも使用）
            $table->string('slug')->nullable()->unique()->after('title');
            // AES-128 HLS 配信が準備済みか（zip アップロード成功でtrue）
            $table->boolean('hls_ready')->default(false)->after('thumbnail_url');
        });

        // 旧Vimeo方式との併存のため vimeo_id を nullable 化
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('vimeo_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'hls_ready']);
            $table->string('vimeo_id')->nullable(false)->change();
        });
    }
};
