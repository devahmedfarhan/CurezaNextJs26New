<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminRole;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class AdminRoleController extends Controller
{
    public function index()
    {
        // Return roles with count of users assigned
        $roles = AdminRole::withCount('users')->latest()->get();
        return response()->json($roles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:admin_roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'string|in:dashboard,products,reviews,orders,users,approvals,marketing,events,finance,support,community,cms,settings',
        ]);

        $slug = Str::slug($validated['name'], '_');

        $role = AdminRole::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'permissions' => $validated['permissions'],
        ]);

        return response()->json($role, 201);
    }

    public function update(Request $request, $id)
    {
        $role = AdminRole::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('admin_roles')->ignore($role->id)],
            'permissions' => 'sometimes|required|array',
            'permissions.*' => 'string|in:dashboard,products,reviews,orders,users,approvals,marketing,events,finance,support,community,cms,settings',
        ]);

        if (isset($validated['name'])) {
            $role->name = $validated['name'];
            $role->slug = Str::slug($validated['name'], '_');
        }

        if (isset($validated['permissions'])) {
            $role->permissions = $validated['permissions'];
        }

        $role->save();

        return response()->json($role);
    }

    public function destroy($id)
    {
        $role = AdminRole::findOrFail($id);
        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }
}
