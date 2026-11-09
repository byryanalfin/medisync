<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Drug;
use Illuminate\Http\Request;

class DrugController extends Controller
{
    public function index(Request $request)
    {
        $query = Drug::query();

        // Search by name, generic name, or category
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('generic_name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Pagination
        $perPage = $request->per_page ?? 10;
        $drugs = $query->orderBy('name')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $drugs->items(),
            'pagination' => [
                'current_page' => $drugs->currentPage(),
                'last_page' => $drugs->lastPage(),
                'per_page' => $drugs->perPage(),
                'total' => $drugs->total(),
            ],
        ]);
    }

    public function categories()
    {
        $categories = Drug::distinct()->pluck('category')->filter()->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
