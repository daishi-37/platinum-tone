<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ─── 登録 ────────────────────────────────────────────────────────────

    public function test_user_can_register(): void
    {
        Event::fake([Registered::class]);

        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'テストユーザー',
            'email'                 => 'test@example.com',
            'password'              => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('email', 'test@example.com');

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
        Event::assertDispatched(Registered::class);
    }

    public function test_register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'name'                  => '別のユーザー',
            'email'                 => 'existing@example.com',
            'password'              => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('email');
    }

    public function test_register_fails_with_password_mismatch(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'テストユーザー',
            'email'                 => 'test@example.com',
            'password'              => 'Password1!',
            'password_confirmation' => 'DifferentPass1!',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('password');
    }

    public function test_register_fails_without_required_fields(): void
    {
        $this->postJson('/api/auth/register', [])
             ->assertStatus(422)
             ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    // ─── ログイン ─────────────────────────────────────────────────────────

    public function test_user_can_login(): void
    {
        $user = User::factory()->create(['email' => 'login@example.com']);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'login@example.com',
            'password' => 'password', // UserFactory のデフォルトパスワード
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('email', 'login@example.com');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'login@example.com']);

        $this->postJson('/api/auth/login', [
            'email'    => 'login@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(422)
          ->assertJsonValidationErrors('email');
    }

    public function test_login_fails_with_unknown_email(): void
    {
        $this->postJson('/api/auth/login', [
            'email'    => 'unknown@example.com',
            'password' => 'password',
        ])->assertStatus(422);
    }

    // ─── ログアウト ───────────────────────────────────────────────────────

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
             ->postJson('/api/auth/logout')
             ->assertStatus(200)
             ->assertJsonPath('message', 'ログアウトしました。');
    }

    public function test_unauthenticated_user_cannot_logout(): void
    {
        $this->postJson('/api/auth/logout')
             ->assertStatus(401);
    }

    // ─── ユーザー情報取得 ─────────────────────────────────────────────────

    public function test_authenticated_user_can_get_own_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
             ->getJson('/api/auth/user')
             ->assertStatus(200)
             ->assertJsonPath('email', $user->email);
    }

    public function test_unauthenticated_user_cannot_get_profile(): void
    {
        $this->getJson('/api/auth/user')
             ->assertStatus(401);
    }
}
