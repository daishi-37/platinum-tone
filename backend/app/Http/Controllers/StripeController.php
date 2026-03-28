<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeController extends Controller
{
    public function __construct(private StripeClient $stripe) {}

    /**
     * Stripe Checkout セッションを作成して URL を返す
     * POST /api/billing/checkout
     */
    public function checkout(Request $request): JsonResponse
    {
        $user = $request->user();

        // Stripe Customer がなければ作成
        if (!$user->stripe_customer_id) {
            $customer = $this->stripe->customers->create([
                'email'    => $user->email,
                'name'     => $user->name,
                'metadata' => ['user_id' => $user->id],
            ]);
            $user->update(['stripe_customer_id' => $customer->id]);
        }

        $session = $this->stripe->checkout->sessions->create([
            'customer'             => $user->stripe_customer_id,
            'mode'                 => 'subscription',
            'payment_method_types' => ['card'],
            'line_items'           => [[
                'price'    => config('services.stripe.price_id'),
                'quantity' => 1,
            ]],
            'subscription_data' => [
                'trial_period_days' => 7,
                'metadata'          => ['user_id' => $user->id],
            ],
            'metadata'   => ['user_id' => $user->id],
            'success_url' => config('app.frontend_url') . '/billing/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'  => config('app.frontend_url') . '/billing/cancel',
        ]);

        return response()->json(['url' => $session->url]);
    }

    /**
     * Stripe Customer Portal（プラン確認・解約）へリダイレクト
     * POST /api/billing/portal
     */
    public function portal(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->stripe_customer_id) {
            return response()->json(['message' => 'サブスクリプション情報が見つかりません。'], 404);
        }

        $session = $this->stripe->billingPortal->sessions->create([
            'customer'   => $user->stripe_customer_id,
            'return_url' => config('app.frontend_url') . '/dashboard',
        ]);

        return response()->json(['url' => $session->url]);
    }

    /**
     * Stripe Webhook（認証不要・署名検証で保護）
     * POST /api/billing/webhook
     */
    public function webhook(Request $request): Response
    {
        $payload   = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $secret    = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (SignatureVerificationException $e) {
            return response('Webhook signature mismatch.', 400);
        }

        match ($event->type) {
            'checkout.session.completed'    => $this->onCheckoutCompleted($event->data->object),
            'customer.subscription.updated' => $this->onSubscriptionUpdated($event->data->object),
            'customer.subscription.deleted' => $this->onSubscriptionDeleted($event->data->object),
            'invoice.payment_failed'        => $this->onPaymentFailed($event->data->object),
            default                         => null,
        };

        return response('OK', 200);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Private handlers
    // ─────────────────────────────────────────────────────────────────────

    private function onCheckoutCompleted(object $session): void
    {
        $userId = $session->metadata->user_id ?? null;
        if (!$userId) return;

        $user = User::find($userId);
        if (!$user) return;

        $subscription = $this->stripe->subscriptions->retrieve($session->subscription);

        $user->update([
            'stripe_customer_id'     => $session->customer,
            'stripe_subscription_id' => $session->subscription,
            'subscription_status'    => $subscription->status, // 'trialing' or 'active'
            'trial_ends_at'          => $subscription->trial_end
                ? Carbon::createFromTimestamp($subscription->trial_end)
                : null,
        ]);
    }

    private function onSubscriptionUpdated(object $subscription): void
    {
        $user = User::where('stripe_subscription_id', $subscription->id)->first();
        if (!$user) return;

        $user->update([
            'subscription_status'  => $subscription->status,
            'trial_ends_at'        => $subscription->trial_end
                ? Carbon::createFromTimestamp($subscription->trial_end)
                : null,
            'subscription_ends_at' => $subscription->cancel_at
                ? Carbon::createFromTimestamp($subscription->cancel_at)
                : null,
        ]);
    }

    private function onSubscriptionDeleted(object $subscription): void
    {
        $user = User::where('stripe_subscription_id', $subscription->id)->first();
        if (!$user) return;

        $user->update(['subscription_status' => 'cancelled']);
    }

    private function onPaymentFailed(object $invoice): void
    {
        $user = User::where('stripe_customer_id', $invoice->customer)->first();
        if (!$user) return;

        $user->update(['subscription_status' => 'past_due']);
    }
}
