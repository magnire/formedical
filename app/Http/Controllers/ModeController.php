<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ModeController extends Controller
{
    public function switchMode(Request $request)
{
    $mode = $request->input('mode');
    $user = auth()->user();
    
    // Validate if user has access to this mode
    if ($mode === 'admin' && $user->role !== 'admin') {
        return back()->with('error', 'Unauthorized access');
    }
    
    if ($mode === 'merchant' && !in_array($user->role, ['admin', 'merchant'])) {
        return back()->with('error', 'Unauthorized access');
    }

    // Update active mode
    $user->active_mode = $mode;
    $user->save();

    // Redirect to the appropriate dashboard
    return redirect()->route($mode . '.dashboard')
        ->with('success', 'Mode switched successfully');
}
}