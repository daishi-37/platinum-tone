<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\StripeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| プレフィックス: /api
| 認証: Sanctum（セッション / Cookie ベース SPA 認証）
|
| 認証不要ルート
*/
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
});

// 公開ブログ（認証不要）
Route::prefix('blog')->group(function () {
    Route::get('/',       [ContentController::class, 'publicPosts']);
    Route::get('/{slug}', [ContentController::class, 'publicPost']);
});

/*
|--------------------------------------------------------------------------
| 認証必須ルート
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/user',    [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::prefix('billing')->group(function () {
        Route::post('/checkout', [StripeController::class, 'checkout']);
        Route::post('/portal',   [StripeController::class, 'portal']);
    });

    /*
    |--------------------------------------------------------------------------
    | 会員限定コンテンツ（サブスクリプション必須）
    |--------------------------------------------------------------------------
    */
    Route::middleware('subscribed')->prefix('members')->group(function () {
        // レッスン動画
        Route::get('/lessons',     [ContentController::class, 'lessons']);
        Route::get('/lessons/{id}', [ContentController::class, 'lesson']);

        // Podcast
        Route::get('/podcast',        [ContentController::class, 'podcastEpisodes']);
        Route::get('/podcast/{id}',   [ContentController::class, 'podcastEpisode']);
        Route::get('/podcast/{id}/stream', [ContentController::class, 'podcastStream'])
            ->name('podcast.stream');

        // 会員限定ブログ
        Route::get('/blog',         [ContentController::class, 'membersPosts']);
        Route::get('/blog/{slug}',  [ContentController::class, 'membersPost']);
    });
});

/*
|--------------------------------------------------------------------------
| Stripe Webhook（認証不要・署名検証で保護）
|--------------------------------------------------------------------------
*/
Route::post('/billing/webhook', [StripeController::class, 'webhook']);
