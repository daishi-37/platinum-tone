<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->alias([
            'subscribed' => \App\Http\Middleware\RequireSubscription::class,
            'admin'      => \App\Http\Middleware\AdminMiddleware::class,
        ]);
        // API専用アプリのため login ルートは存在しない。
        // 未認証ゲストをリダイレクトせず（route('login') の解決で500になるのを防ぐ）、
        // 後段の例外ハンドラで 401 JSON を返させる。
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API ルートは常に JSON で応答する（未認証時に login ルートへリダイレクトして
        // 500 になるのを防ぎ、401/403 を正しく返す）。
        $exceptions->shouldRenderJsonWhen(
            fn ($request, $throwable) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
