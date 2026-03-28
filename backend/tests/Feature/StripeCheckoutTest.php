<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Stripe\StripeClient;
use Tests\Fakes\FakeStripeClient;
use Tests\TestCase;

class StripeCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->instance(StripeClient::class, new FakeStripeClient());
    }

    // ─── Checkout セッション作成 ─────────────────────────────────────────

    public function test_authenticated_user_gets_checkout_url(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
             ->postJson('/api/billing/checkout')
             ->assertStatus(200)
             ->assertJsonStructure(['url'])
             ->assertJsonPath('url', 'https://checkout.stripe.com/pay/cs_test_123');
    }

    public function test_checkout_creates_stripe_customer_when_none_exists(): void
    {
        $user = User::factory()->create(['stripe_customer_id' => null]);

        $this->actingAs($user)
             ->postJson('/api/billing/checkout')
             ->assertStatus(200);

        // FakeStripeClient::customers->create() は 'cus_test_new' を返す
        $this->assertEquals('cus_test_new', $user->fresh()->stripe_customer_id);
    }

    public function test_checkout_reuses_existing_stripe_customer(): void
    {
        $user = User::factory()->create(['stripe_customer_id' => 'cus_already_exists']);

        $this->actingAs($user)
             ->postJson('/api/billing/checkout')
             ->assertStatus(200);

        // 既存の customer_id が上書きされていないこと
        $this->assertEquals('cus_already_exists', $user->fresh()->stripe_customer_id);
    }

    public function test_unauthenticated_user_cannot_access_checkout(): void
    {
        $this->postJson('/api/billing/checkout')
             ->assertStatus(401);
    }

    // ─── Customer Portal ─────────────────────────────────────────────────

    public function test_subscribed_user_gets_portal_url(): void
    {
        $user = User::factory()->subscribed()->create();

        $this->actingAs($user)
             ->postJson('/api/billing/portal')
             ->assertStatus(200)
             ->assertJsonPath('url', 'https://billing.stripe.com/portal/test');
    }

    public function test_portal_returns_404_when_no_stripe_customer(): void
    {
        $user = User::factory()->create(['stripe_customer_id' => null]);

        $this->actingAs($user)
             ->postJson('/api/billing/portal')
             ->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_portal(): void
    {
        $this->postJson('/api/billing/portal')
             ->assertStatus(401);
    }
}
