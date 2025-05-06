<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MerchantApplication;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

class MerchantApplicationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reason' => 'required|string|min:50',
        ]);

        // Check if user already has a pending application
        $existingApplication = MerchantApplication::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if ($existingApplication) {
            return back()->with('error', 'You already have a pending application.');
        }

        MerchantApplication::create([
            'user_id' => Auth::id(),
            'reason' => $validated['reason'],
        ]);

        return back()->with('success', 'Your merchant application has been submitted.');
    }

    public function review(Request $request, MerchantApplication $application)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $application->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'],
            'reviewed_at' => now(),
        ]);

        if ($validated['status'] === 'approved') {
            $application->user->update(['role' => 'merchant']);
        }

        return back()->with('success', 'Application has been reviewed.');
    }

    public function index()
{
    return MerchantApplication::with('user')
        ->where('status', 'pending')
        ->latest()
        ->get();
}
}