<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Q&A 回答。board_posts.type = 'question' のレコードにのみ紐づく。
     * 投稿・ユーザー削除時はカスケード削除。
     */
    public function up(): void
    {
        Schema::create('board_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('board_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index('post_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('board_answers');
    }
};
