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
    public function index(): AnonymousResourceCollection
    {
        // Загружаем компании с количеством каналов связи
        $companies = Company::withCount('contactChannels')->paginate(10); // или all()
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
