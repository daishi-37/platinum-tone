<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| メールアドレス確認ルート
|--------------------------------------------------------------------------
| User が MustVerifyEmail を実装しているため、登録時に送られるメール内の
| リンクがこのルートを指す。確認後はフロントエンド（Next.js）へリダイレクト。
*/
Route::get('/email/verify/{id}/{hash}', function (Request $request, string $id, string $hash) {
    $user = \App\Models\User::findOrFail($id);

    if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
        abort(403);
    }

    if (!$request->hasValidSignature()) {
        abort(403, 'リンクの有効期限が切れています。');
    }

    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new \Illuminate\Auth\Events\Verified($user));
    }

    $frontendUrl = config('app.frontend_url', 'http://localhost');
    return redirect($frontendUrl . '/dashboard?verified=1');
})->name('verification.verify');
