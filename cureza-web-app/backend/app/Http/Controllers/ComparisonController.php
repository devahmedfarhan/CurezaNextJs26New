<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ComparisonController extends Controller
{
    public function getComparisonDetails(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array|min:2|max:4',
                'ids.*' => 'exists:products,id',
            ]);

            $products = Product::with(['brand', 'attributes.attribute', 'category'])
                ->whereIn('id', $request->ids)
                ->get();

            // Structure the response for easier frontend rendering
            $comparisonData = [
                'products' => $products,
                'attributes_map' => $this->mapAttributes($products),
            ];

            return response()->json($comparisonData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Comparison Check Failed',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    private function mapAttributes($products)
    {
        // Collect all unique attribute names across these products
        $allAttributes = [];
        foreach ($products as $product) {
            foreach ($product->attributes as $attr) {
                if ($attr->attribute) {
                    $attrName = $attr->attribute->name;
                    $allAttributes[$attrName] = true;
                }
            }
        }
        
        $matrix = [];
        foreach (array_keys($allAttributes) as $attrName) {
            $row = [
                'name' => $attrName,
                'values' => []
            ];
            foreach ($products as $product) {
                $val = $product->attributes->first(function ($a) use ($attrName) {
                    return $a->attribute && $a->attribute->name === $attrName;
                });
                $row['values'][$product->id] = $val ? $val->value : '-';
            }
            $matrix[] = $row;
        }

        return $matrix;
    }
}
