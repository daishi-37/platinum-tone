<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Stripe\StripeClient;
use Tests\Fakes\FakeStripeClient;
use Tests\Fakes\FakeSubscriptionsService;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    private string $webhookSecret = 'whsec_testsecret';

    protected function setUp(): void
    {
        parent::setUp();
        // 実際のStripe APIを呼ばないようにFakeClientをバインド
        $this->app->instance(StripeClient::class, new FakeStripeClient());
    }

    // ─── ヘルパー: Stripe Webhook 署名ヘッダーを生成 ───────────────────────

    private function makeWebhookHeader(string $payload): string
    {
        $timestamp    = time();
        $signedPayload = "{$timestamp}.{$payload}";
        $signature    = hash_hmac('sha256', $signedPayload, $this->webhookSecret);

        return "t={$timestamp},v1={$signature}";
    }

    private function postWebhook(array $eventData): \Illuminate\Testing\TestResponse
    {
        $payload = json_encode($eventData);

        return $this->call(
            'POST',
            '/api/billing/webhook',
            [],
            [],
            [],
            ['HTTP_STRIPE_SIGNATURE' => $this->makeWebhookHeader($payload),
             'CONTENT_TYPE' => 'application/json'],
            $payload
        );
    }

    // ─── 署名検証 ─────────────────────────────────────────────────────────

    public function test_webhook_rejects_invalid_signature(): void
    {
        $payload = json_encode(['type' => 'checkout.session.completed']);

        $this->call(
            'POST',
            '/api/billing/webhook',
            [],
            [],
            [],
            ['HTTP_STRIPE_SIGNATURE' => 't=12345,v1=invalidsignature',
             'CONTENT_TYPE' => 'application/json'],
            $payload
        )->assertStatus(400);
    }

    // ─── checkout.session.completed ──────────────────────────────────────

    public function test_checkout_completed_sets_subscription_to_trialing(): void
    {
        $user = User::factory()->create();
        $trialEnd = Carbon::now()->addDays(7)->timestamp;

        // checkout.session.completed では subscriptions->retrieve() が呼ばれるため
        // trialing を返す FakeClient を注入
        $this->app->instance(StripeClient::class, new FakeStripeClient(
            subscriptionData: (object)[
                'status'    => 'trialing',
                'trial_end' => $trialEnd,
                'cancel_at' => null,
            ]
        ));

        $this->postWebhook([
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'customer'     => 'cus_test_webhook',
                    'subscription' => 'sub_test_webhook',
                    'metadata'     => ['user_id' => (string)$user->id],
                ],
            ],
        ])->assertStatus(200);

        $user->refresh();
        $this->assertEquals('trialing', $user->subscription_status);
        $this->assertEquals('cus_test_webhook', $user->stripe_customer_id);
        $this->assertEquals('sub_test_webhook', $user->stripe_subscription_id);
        $this->assertNotNull($user->trial_ends_at);
    }

    public function test_checkout_completed_sets_subscription_to_active_when_no_trial(): void
    {
        $user = User::factory()->create();

        $this->app->instance(StripeClient::class, new FakeStripeClient(
            subscriptionData: (object)[
                'status'    => 'active',
                'trial_end' => null,
                'cancel_at' => null,
            ]
        ));

        $this->postWebhook([
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'customer'     => 'cus_active',
                    'subscription' => 'sub_active',
                    'metadata'     => ['user_id' => (string)$user->id],
                ],
            ],
        ])->assertStatus(200);

        $user->refresh();
        $this->assertEquals('active', $user->subscription_status);
        $this->assertNull($user->trial_ends_at);
    }

    // ─── customer.subscription.updated ───────────────────────────────────

    public function test_subscription_updated_changes_status(): void
    {
        $user = User::factory()->trialing()->create();

        $this->postWebhook([
            'type' => 'customer.subscription.updated',
            'data' => [
                'object' => [
                    'id'         => 'sub_test123',
                    'status'     => 'active',
                    'trial_end'  => null,
                    'cancel_at'  => null,
                ],
            ],
        ])->assertStatus(200);

        $this->assertEquals('active', $user->fresh()->subscription_status);
    }

    public function test_subscription_updated_sets_cancellation_date(): void
    {
        $cancelAt = Carbon::now()->addMonth()->timestamp;
        $user = User::factory()->subscribed()->create();

        $this->postWebhook([
            'type' => 'customer.subscription.updated',
            'data' => [
                'object' => [
                    'id'        => 'sub_test123',
                    'status'    => 'active',
                    'trial_end' => null,
                    'cancel_at' => $cancelAt,
                ],
            ],
        ])->assertStatus(200);

        $this->assertNotNull($user->fresh()->subscription_ends_at);
    }

    // ─── customer.subscription.deleted ───────────────────────────────────

    public function test_subscription_deleted_sets_status_to_cancelled(): void
    {
        $user = User::factory()->subscribed()->create();

        $this->postWebhook([
            'type' => 'customer.subscription.deleted',
            'data' => [
                'object' => [
                    'id'        => 'sub_test123',
                    'status'    => 'canceled',
                    'trial_end' => null,
                    'cancel_at' => null,
                ],
            ],
        ])->assertStatus(200);

        $this->assertEquals('cancelled', $user->fresh()->subscription_status);
    }

    // ─── invoice.payment_failed ───────────────────────────────────────────

    public function test_payment_failed_sets_status_to_past_due(): void
    {
        $user = User::factory()->subscribed()->create();

        $this->postWebhook([
            'type' => 'invoice.payment_failed',
            'data' => [
                'object' => [
                    'customer' => 'cus_test123',
                ],
            ],
        ])->assertStatus(200);

        $this->assertEquals('past_due', $user->fresh()->subscription_status);
    }

    // ─── 翌月決済（月次更新シナリオ） ──────────────────────────────────────

    /**
     * 翌月の自動決済が成功した場合:
     * invoice.payment_succeeded 相当のシナリオとして
     * customer.subscription.updated (status=active) で確認する
     */
    public function test_monthly_renewal_keeps_subscription_active(): void
    {
        $user = User::factory()->subscribed()->create();

        // 月次更新 = Stripe が subscription.updated イベントを送信し status は active のまま
        $this->postWebhook([
            'type' => 'customer.subscription.updated',
            'data' => [
                'object' => [
                    'id'        => 'sub_test123',
                    'status'    => 'active',
                    'trial_end' => null,
                    'cancel_at' => null,
                ],
            ],
        ])->assertStatus(200);

        $this->assertEquals('active', $user->fresh()->subscription_status);
    }

    /**
     * トライアル終了 → 本決済移行:
     * trial_end を迎えると Stripe は subscription.updated で trialing → active へ変化させる
     */
    public function test_trial_converts_to_active_after_first_payment(): void
    {
        $user = User::factory()->trialing()->create();

        $this->postWebhook([
            'type' => 'customer.subscription.updated',
            'data' => [
                'object' => [
                    'id'        => 'sub_test123',
                    'status'    => 'active',
                    'trial_end' => Carbon::now()->subSecond()->timestamp, // 直前に終了
                    'cancel_at' => null,
                ],
            ],
        ])->assertStatus(200);

        $this->assertEquals('active', $user->fresh()->subscription_status);
    }

    /**
     * 翌月の決済失敗シナリオ:
     * invoice.payment_failed → past_due になり会員コンテンツにアクセス不可
     */
    public function test_monthly_payment_failure_revokes_member_access(): void
    {
        $user = User::factory()->subscribed()->create();

        $this->postWebhook([
            'type' => 'invoice.payment_failed',
            'data' => [
                'object' => [
                    'customer' => 'cus_test123',
                ],
            ],
        ])->assertStatus(200);

        $user->refresh();
        $this->assertEquals('past_due', $user->subscription_status);
        $this->assertFalse($user->isSubscribed());
    }
}
