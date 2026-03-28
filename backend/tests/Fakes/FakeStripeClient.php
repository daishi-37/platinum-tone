<?php

namespace Tests\Fakes;

use Carbon\Carbon;

/**
 * テスト用 Stripe クライアントのフェイク実装
 * StripeClient を DI でバインドし差し替えて使う
 *
 * 使い方:
 *   $this->app->instance(\Stripe\StripeClient::class, new FakeStripeClient());
 *   // 特定のサブスクリプションデータを返したい場合:
 *   $this->app->instance(\Stripe\StripeClient::class, new FakeStripeClient(
 *       subscriptionData: (object)['status' => 'active', 'trial_end' => null, 'cancel_at' => null]
 *   ));
 */
class FakeStripeClient
{
    public FakeCustomersService $customers;
    public FakeCheckoutService $checkout;
    public FakeBillingPortalService $billingPortal;
    public FakeSubscriptionsService $subscriptions;

    public function __construct(?object $subscriptionData = null)
    {
        $this->customers    = new FakeCustomersService();
        $this->checkout     = new FakeCheckoutService();
        $this->billingPortal = new FakeBillingPortalService();
        $this->subscriptions = new FakeSubscriptionsService($subscriptionData);
    }
}

class FakeCustomersService
{
    public function create(array $data): object
    {
        return (object)['id' => 'cus_test_new'];
    }
}

class FakeCheckoutService
{
    public FakeCheckoutSessionsService $sessions;

    public function __construct()
    {
        $this->sessions = new FakeCheckoutSessionsService();
    }
}

class FakeCheckoutSessionsService
{
    public function create(array $data): object
    {
        return (object)[
            'id'  => 'cs_test_123',
            'url' => 'https://checkout.stripe.com/pay/cs_test_123',
        ];
    }
}

class FakeBillingPortalService
{
    public FakeBillingPortalSessionsService $sessions;

    public function __construct()
    {
        $this->sessions = new FakeBillingPortalSessionsService();
    }
}

class FakeBillingPortalSessionsService
{
    public function create(array $data): object
    {
        return (object)['url' => 'https://billing.stripe.com/portal/test'];
    }
}

class FakeSubscriptionsService
{
    private object $data;

    public function __construct(?object $data = null)
    {
        $this->data = $data ?? (object)[
            'status'    => 'trialing',
            'trial_end' => Carbon::now()->addDays(7)->timestamp,
            'cancel_at' => null,
        ];
    }

    public function retrieve(string $id): object
    {
        return $this->data;
    }
}
