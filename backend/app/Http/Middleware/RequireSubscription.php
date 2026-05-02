<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * サブスクリプション（trialing / active）を確認するミドルウェア
 * auth:sanctum と組み合わせて使用する
 */
class RequireSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'この機能はご利用いただけません。サブスクリプションが必要です。',
            ], 403);
        }

        // 管理者はサブスクリプション不要で全コンテンツにアクセス可能
        if ($user->is_admin) {
            return $next($request);
        }

        if (!in_array($user->subscription_status, ['trialing', 'active'])) {
            return response()->json([
                'message' => 'この機能はご利用いただけません。サブスクリプションが必要です。',
            ], 403);
        }

        return $next($request);
    }
}
