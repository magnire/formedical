<?php

namespace App\Http\Controllers;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

class StripePaymentController extends Controller
{
    public function __construct()
    {
        if (!Config::has('services.stripe.secret')) {
            throw new \RuntimeException('Stripe secret key not configured');
        }
    }

    public function createPaymentIntent(Request $request) 
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.50'
        ]);

        Stripe::setApiKey(Config::get('services.stripe.secret'));

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int)($request->amount * 100), // Convert to cents
                'currency' => 'usd',
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}