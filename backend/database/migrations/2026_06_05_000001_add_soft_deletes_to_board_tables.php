<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 掲示板の投稿・回答に論理削除（deleted_at）を追加。
     * 生徒側では非表示にしつつ、管理画面では証拠として残す。
     */
    public function up(): void
    {
        Schema::table('board_posts', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('board_answers', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('board_posts', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('board_answers', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
