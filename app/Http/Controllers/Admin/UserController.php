<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::orderBy('created_at', 'desc')->get();
    }

    public function update(Request $request, User $user)
{
    $validated = $request->validate([
        'role' => 'required|in:user,merchant,admin',
        'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
        'first_name' => 'sometimes|string|max:255',
        'last_name' => 'sometimes|string|max:255',
        'phone' => 'sometimes|string|max:255',
    ]);

    $user->update($validated);

    // If email was changed, require re-verification
    if ($user->wasChanged('email')) {
        $user->email_verified_at = null;
        $user->save();
        // Optionally send new verification email
        $user->sendEmailVerificationNotification();
    }

    return response()->json([
        'message' => 'User updated successfully',
        'user' => $user
    ]);
}

    public function destroy(User $user)
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}