<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Company;
use App\Http\Resources\Company\CompanyResource;
use App\Http\Resources\Company\CompanyCollection;
use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CompanyController extends Controller
{
    /**
     * Получить ТОЛЬКО количество записей.
     */
    public function count(Request $request)
    {
        $query = Company::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('address', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('has_icon')) {
            $hasIcon = $request->get('has_icon') === 'true';
            if ($hasIcon) {
                $query->whereHas('settings', fn($q) => $q->where('icon', '!=', ''));
            } else {
                $query->whereDoesntHave('settings', fn($q) => $q->where('icon', '!=', ''));
            }
        }

        return response()->json(['total' => (int) $query->count()]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): ResourceCollection
    {
        $perPage = max((int)$request->get('per_page', 15), 1);
        $page = $request->get('page', 1);

        $query = Company::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('address', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('has_icon')) {
            $hasIcon = $request->get('has_icon') === 'true';
            if ($hasIcon) {
                $query->whereHas('settings', fn($q) => $q->where('icon', '!=', ''));
            } else {
                $query->whereDoesntHave('settings', fn($q) => $q->where('icon', '!=', ''));
            }
        }

        $sortBy = $request->get('sort_by', 'id_asc');
        switch ($sortBy) {
            case 'id_desc':
                $query->orderBy('id', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'created_at_desc':
                $query->orderBy('created_at', 'desc');
                break;
            case 'created_at_asc':
                $query->orderBy('created_at', 'asc');
                break;
            default:
                $query->orderBy('id', 'asc');
        }

        $total = $query->count();
        $companies = $query->withCount('contactChannels')->paginate($perPage, ['*'], 'page', $page);

        return new CompanyCollection($companies, $total);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request): CompanyResource
    {
        $company = Company::create($request->validated());
        $company->load('contactChannels');
        return new CompanyResource($company);
    }

    /**
     * Display the specified resource.
     */
    public function show(Company $company): CompanyResource
    {
        $company->load('contactChannels');
        return new CompanyResource($company);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCompanyRequest $request, Company $company): CompanyResource
    {
        $company->update($request->validated());
        $company->load('contactChannels');
        return new CompanyResource($company);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        $company->delete();
        return response()->json([
            'message' => 'Company deleted successfully',
            'deleted_id' => $company->id
        ]);
    }
}
