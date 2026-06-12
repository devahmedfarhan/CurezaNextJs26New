<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShippingMethod;

class ShippingController extends Controller
{
    public function index()
    {
        return response()->json(ShippingMethod::all());
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string',
            'cost' => 'required|numeric|min:0',
            'estimated_days' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $method = ShippingMethod::findOrFail($id);
        $method->update($request->all());

        return response()->json($method);
    }
}
