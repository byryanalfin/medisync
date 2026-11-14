<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Drug;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DrugController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);
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

    public function store(Request $request)
    {
        $validated = $this->validateDrug($request);

        return response()->json(['success' => true, 'message' => 'Obat berhasil ditambahkan.', 'data' => Drug::create($validated)], 201);
    }

    public function update(Request $request, Drug $drug)
    {
        $validated = $this->validateDrug($request, $drug->id);
        $drug->update($validated);

        return response()->json(['success' => true, 'message' => 'Data obat berhasil diperbarui.', 'data' => $drug]);
    }

    private function validateDrug(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('drugs', 'name')->ignore($id)],
            'generic_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'unit' => 'required|string|max:50',
            'stock' => 'required|integer|min:0|max:10000000',
        ]);
    }
}
