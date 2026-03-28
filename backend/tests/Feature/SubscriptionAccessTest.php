<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * 会員限定ルート（/api/members/*）のアクセス制御テスト
 *
 * RequireSubscription ミドルウェアが正しく機能しているかを検証する。
 * コンテンツのDBレコードは不要（アクセス可否のみ確認するため空のレスポンスでも OK）。
 */
class SubscriptionAccessTest extends TestCase
{
    use RefreshDatabase;

    // ─── 未認証 ───────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_access_lessons(): void
    {
        $this->getJson('/api/members/lessons')->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_podcast(): void
    {
        $this->getJson('/api/members/podcast')->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_member_blog(): void
    {
        $this->getJson('/api/members/blog')->assertStatus(401);
    }

    // ─── 認証済み・サブスクリプションなし ─────────────────────────────────

    public function test_user_without_subscription_cannot_access_lessons(): void
    {
        $user = User::factory()->create(['subscription_status' => null]);

        $this->actingAs($user)
             ->getJson('/api/members/lessons')
             ->assertStatus(403);
    }

    public function test_user_without_subscription_cannot_access_podcast(): void
    {
        $user = User::factory()->create(['subscription_status' => null]);

        $this->actingAs($user)
             ->getJson('/api/members/podcast')
             ->assertStatus(403);
    }

    // ─── 解約済みユーザー ─────────────────────────────────────────────────

    public function test_cancelled_user_cannot_access_member_content(): void
    {
        $user = User::factory()->cancelled()->create();

        $this->actingAs($user)
             ->getJson('/api/members/lessons')
             ->assertStatus(403);
    }

    public function test_past_due_user_cannot_access_member_content(): void
    {
        $user = User::factory()->create(['subscription_status' => 'past_due']);

        $this->actingAs($user)
             ->getJson('/api/members/lessons')
             ->assertStatus(403);
    }

    // ─── trialing（無料試用中） ───────────────────────────────────────────

    public function test_trialing_user_can_access_lessons(): void
    {
        $user = User::factory()->trialing()->create();

        // コンテンツが空でも 200（空リスト）が返ることを確認
        $this->actingAs($user)
             ->getJson('/api/members/lessons')
             ->assertStatus(200);
    }

    public function test_trialing_user_can_access_podcast(): void
    {
        $user = User::factory()->trialing()->create();

        $this->actingAs($user)
             ->getJson('/api/members/podcast')
             ->assertStatus(200);
    }

    public function test_trialing_user_can_access_member_blog(): void
    {
        $user = User::factory()->trialing()->create();

        $this->actingAs($user)
             ->getJson('/api/members/blog')
             ->assertStatus(200);
    }

    // ─── active（本会員） ─────────────────────────────────────────────────

    public function test_active_subscriber_can_access_lessons(): void
    {
        $user = User::factory()->subscribed()->create();

        $this->actingAs($user)
             ->getJson('/api/members/lessons')
             ->assertStatus(200);
    }

    public function test_active_subscriber_can_access_podcast(): void
    {
        $user = User::factory()->subscribed()->create();

        $this->actingAs($user)
             ->getJson('/api/members/podcast')
             ->assertStatus(200);
    }

    public function test_active_subscriber_can_access_member_blog(): void
    {
        $user = User::factory()->subscribed()->create();

        $this->actingAs($user)
             ->getJson('/api/members/blog')
             ->assertStatus(200);
    }

    // ─── isSubscribed() メソッドの単体確認 ───────────────────────────────

    public function test_is_subscribed_returns_true_for_trialing(): void
    {
        $user = User::factory()->trialing()->make();
        $this->assertTrue($user->isSubscribed());
    }

    public function test_is_subscribed_returns_true_for_active(): void
    {
        $user = User::factory()->subscribed()->make();
        $this->assertTrue($user->isSubscribed());
    }

    public function test_is_subscribed_returns_false_for_cancelled(): void
    {
        $user = User::factory()->cancelled()->make();
        $this->assertFalse($user->isSubscribed());
    }

    public function test_is_subscribed_returns_false_for_past_due(): void
    {
        $user = User::factory()->make(['subscription_status' => 'past_due']);
        $this->assertFalse($user->isSubscribed());
    }

    public function test_is_subscribed_returns_false_when_null(): void
    {
        $user = User::factory()->make(['subscription_status' => null]);
        $this->assertFalse($user->isSubscribed());
    }
}
