<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Stripe\StripeClient;

class AdminUserController extends Controller
{
    public function __construct(private StripeClient $stripe) {}

    /**
     * ユーザー一覧
     * GET /api/admin/users
     */
    public function index(): JsonResponse
    {
        $users = User::orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'is_admin', 'subscription_status', 'email_verified_at', 'created_at']);

        return response()->json($users);
    }

    /**
     * ユーザー作成
     * POST /api/admin/users
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users'],
            'password' => ['required', Rules\Password::defaults()],
            'is_admin' => ['boolean'],
            'subscription_status' => ['in:none,trialing,active,past_due,cancelled'],
        ]);

        $user = User::create([
            'name'                => $data['name'],
            'email'               => $data['email'],
            'password'            => Hash::make($data['password']),
            'email_verified_at'   => now(),
            'is_admin'            => $data['is_admin'] ?? false,
            'subscription_status' => $data['subscription_status'] ?? 'none',
        ]);

        return response()->json($user, 201);
    }

    /**
     * ユーザー詳細
     * GET /api/admin/users/{id}
     */
    public function show(User $user): JsonResponse
    {
        return response()->json($user->makeVisible(['stripe_customer_id', 'stripe_subscription_id']));
    }

    /**
     * ユーザー更新
     * PUT /api/admin/users/{id}
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'nullable', Rules\Password::defaults()],
            'is_admin' => ['sometimes', 'boolean'],
            'subscription_status'    => ['sometimes', 'in:none,trialing,active,past_due,cancelled'],
            'stripe_customer_id'     => ['sometimes', 'nullable', 'string'],
            'stripe_subscription_id' => ['sometimes', 'nullable', 'string'],
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user->makeVisible(['stripe_customer_id', 'stripe_subscription_id']));
    }

    /**
     * ユーザー削除
     * DELETE /api/admin/users/{id}
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['message' => '削除しました。']);
    }

    /**
     * Stripe Customer Portal URL を発行してユーザーに送付するためのURLを返す
     * POST /api/admin/users/{id}/stripe-portal
     */
    public function stripePortal(User $user): JsonResponse
    {
        if (!$user->stripe_customer_id) {
            return response()->json(['message' => 'Stripeの顧客情報が登録されていません。'], 422);
        }

        $session = $this->stripe->billingPortal->sessions->create([
            'customer'   => $user->stripe_customer_id,
            'return_url' => config('app.frontend_url') . '/admin/users/' . $user->id,
        ]);

        return response()->json(['url' => $session->url]);
    }
}
