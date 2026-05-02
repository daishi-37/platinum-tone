<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminBacktalkController;
use App\Http\Controllers\AdminBlogController;
use App\Http\Controllers\AdminPodcastController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminVoicedoorController;
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

// 公開Podcast（認証不要）
Route::prefix('podcast')->group(function () {
    Route::get('/files',          [ContentController::class, 'publicPodcastFiles']);
    Route::get('/stream/{filename}', [ContentController::class, 'publicPodcastStream']);
    Route::get('/',               [ContentController::class, 'publicPodcastEpisodes']);
    Route::get('/{id}',           [ContentController::class, 'publicPodcastEpisode']);
});

// 声優登竜門（認証不要・Apple Podcast）
Route::prefix('voicedoor')->group(function () {
    Route::get('/',      [ContentController::class, 'voicedoorEpisodes']);
    Route::get('/{id}',  [ContentController::class, 'voicedoorEpisode']);
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

        // 声優登竜門 裏トーク（Vimeo動画）
        Route::get('/podcast',           [ContentController::class, 'backtalkEpisodes']);
        Route::get('/podcast/{slug}',    [ContentController::class, 'backtalkEpisode']);

        // 会員限定ブログ
        Route::get('/blog',         [ContentController::class, 'membersPosts']);
        Route::get('/blog/{slug}',  [ContentController::class, 'membersPost']);
    });
});

/*
|--------------------------------------------------------------------------
| 管理者専用ルート
|--------------------------------------------------------------------------
*/
Route::post('/auth/admin-login', [AdminAuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/auth/logout', [AdminAuthController::class, 'logout']);

    // ブログ管理
    Route::post('/blog/slug-suggestion',    [AdminBlogController::class, 'slugSuggestion']);
    Route::get('/blog',                     [AdminBlogController::class, 'index']);
    Route::post('/blog',                    [AdminBlogController::class, 'store']);
    Route::get('/blog/{post}',              [AdminBlogController::class, 'show']);
    Route::put('/blog/{post}',              [AdminBlogController::class, 'update']);
    Route::delete('/blog/{post}',           [AdminBlogController::class, 'destroy']);

    // 裏トーク管理（Vimeo動画・会員限定）
    Route::post('/backtalk/slug-suggestion',   [AdminBacktalkController::class, 'slugSuggestion']);
    Route::get('/backtalk',                    [AdminBacktalkController::class, 'index']);
    Route::post('/backtalk',                   [AdminBacktalkController::class, 'store']);
    Route::get('/backtalk/{backtalk}',         [AdminBacktalkController::class, 'show']);
    Route::put('/backtalk/{backtalk}',         [AdminBacktalkController::class, 'update']);
    Route::delete('/backtalk/{backtalk}',      [AdminBacktalkController::class, 'destroy']);

    // ポッドキャスト管理
    Route::get('/podcast',                  [AdminPodcastController::class, 'index']);
    Route::post('/podcast',                 [AdminPodcastController::class, 'store']);
    Route::get('/podcast/{episode}',        [AdminPodcastController::class, 'show']);
    Route::put('/podcast/{episode}',        [AdminPodcastController::class, 'update']);
    Route::delete('/podcast/{episode}',     [AdminPodcastController::class, 'destroy']);

    // 声優登竜門管理（Apple Podcast・公開）
    Route::get('/voicedoor',                  [AdminVoicedoorController::class, 'index']);
    Route::post('/voicedoor',                 [AdminVoicedoorController::class, 'store']);
    Route::get('/voicedoor/{voicedoor}',      [AdminVoicedoorController::class, 'show']);
    Route::put('/voicedoor/{voicedoor}',      [AdminVoicedoorController::class, 'update']);
    Route::delete('/voicedoor/{voicedoor}',   [AdminVoicedoorController::class, 'destroy']);

    // ユーザー管理
    Route::get('/users',                    [AdminUserController::class, 'index']);
    Route::post('/users',                   [AdminUserController::class, 'store']);
    Route::get('/users/{user}',             [AdminUserController::class, 'show']);
    Route::put('/users/{user}',             [AdminUserController::class, 'update']);
    Route::delete('/users/{user}',          [AdminUserController::class, 'destroy']);
    Route::post('/users/{user}/stripe-portal', [AdminUserController::class, 'stripePortal']);
});

/*
|--------------------------------------------------------------------------
| Stripe Webhook（認証不要・署名検証で保護）
|--------------------------------------------------------------------------
*/
Route::post('/billing/webhook', [StripeController::class, 'webhook']);
