<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    /**
     * Show the checkout page.
     */
    public function index(): Response
    {
        return Inertia::render('checkout');
    }
}