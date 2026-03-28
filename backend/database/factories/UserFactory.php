<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /** サブスクリプション有効（trialing）状態 */
    public function trialing(): static
    {
        return $this->state(fn (array $attributes) => [
            'stripe_customer_id'     => 'cus_test123',
            'stripe_subscription_id' => 'sub_test123',
            'subscription_status'    => 'trialing',
            'trial_ends_at'          => now()->addDays(7),
        ]);
    }

    /** サブスクリプション有効（active）状態 */
    public function subscribed(): static
    {
        return $this->state(fn (array $attributes) => [
            'stripe_customer_id'     => 'cus_test123',
            'stripe_subscription_id' => 'sub_test123',
            'subscription_status'    => 'active',
        ]);
    }

    /** サブスクリプション解約済み */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'stripe_customer_id'     => 'cus_test123',
            'stripe_subscription_id' => 'sub_test123',
            'subscription_status'    => 'cancelled',
        ]);
    }
}
