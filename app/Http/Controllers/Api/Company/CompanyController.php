<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Company;
use App\Http\Resources\Company\CompanyResource;
use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Валидация и получение per_page из запроса
        $perPage = $request->get('per_page', 15); // По умолчанию 15
        $page = $request->get('page', 1); // По умолчанию 1

        // Убедимся, что per_page в допустимом диапазоне, если нужно
        $perPage = min(max((int)$perPage, 1), 100); // Пример: от 1 до 100

        // Загружаем компании с количеством каналов связи
        $companies = Company::withCount('contactChannels')->paginate($perPage, ['*'], 'page', $page);
        return CompanyResource::collection($companies);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Company\StoreCompanyRequest  $request
     * @return \App\Http\Resources\Company\CompanyResource
     */
    public function store(StoreCompanyRequest $request): CompanyResource
    {
        $company = Company::create($request->validated());
        return new CompanyResource($company);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Company\Company  $company
     * @return \App\Http\Resources\Company\CompanyResource
     */
    public function show(Company $company): CompanyResource
    {
        // Загружаем связанную информацию, если нужно
        $company->load('contactChannels');
        return new CompanyResource($company);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Company\UpdateCompanyRequest  $request
     * @param  \App\Models\Company\Company  $company
     * @return \App\Http\Resources\Company\CompanyResource
     */
    public function update(UpdateCompanyRequest $request, Company $company): CompanyResource
    {
        $company->update($request->validated());
        return new CompanyResource($company);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Company\Company  $company
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Company $company)
    {
        $company->delete(); // Каскадное удаление связанных каналов
        return response()->json(['message' => 'Company deleted']);
    }
}
