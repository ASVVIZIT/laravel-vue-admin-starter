<?php

namespace App\Http\Controllers\Api\CompanyContactChannel;

use App\Http\Controllers\Controller;
use App\Models\Company\Company;
use App\Models\Company\CompanyContactChannel; // Обновлённый путь к модели
use App\Http\Resources\CompanyContactChannel\CompanyContactChannelResource; // Обновлённый путь к ресурсу
use App\Http\Requests\CompanyContactChannel\StoreContactChannelRequest;
use App\Http\Requests\CompanyContactChannel\UpdateContactChannelRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB; // Для транзакции при сортировке

class ContactChannelController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \App\Models\Company\Company  $company
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Company $company): AnonymousResourceCollection
    {
        // Получаем каналы связи для конкретной компании, отсортированные по order_column
        $channels = $company->contactChannels()
            ->orderBy('order_column')
            ->get();
        return CompanyContactChannelResource::collection($channels);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\CompanyContactChannel\StoreContactChannelRequest  $request
     * @param  \App\Models\Company\Company  $company
     * @return \App\Http\Resources\CompanyContactChannel\CompanyContactChannelResource
     */
    public function store(StoreContactChannelRequest $request, Company $company): CompanyContactChannelResource
    {
        $data = $request->validated();
        $data['company_id'] = $company->id;

        // Если order_column не передан, устанавливаем его как max + 1 для этой компании
        if (!isset($data['order_column'])) {
            $maxOrder = $company->contactChannels()->max('order_column') ?? -1;
            $data['order_column'] = $maxOrder + 1;
        }

        $channel = $company->contactChannels()->create($data);
        return new CompanyContactChannelResource($channel);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Company\Company  $company
     * @param  \App\Models\Company\CompanyContactChannel  $contactChannel
     * @return \App\Http\Resources\CompanyContactChannel\CompanyContactChannelResource
     */
    public function show(Company $company, CompanyContactChannel $contactChannel): CompanyContactChannelResource
    {
        // Проверяем, принадлежит ли канал указанной компании
        abort_if($contactChannel->company_id !== $company->id, 404);

        return new CompanyContactChannelResource($contactChannel);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\CompanyContactChannel\UpdateContactChannelRequest  $request
     * @param  \App\Models\Company\Company  $company
     * @param  \App\Models\Company\CompanyContactChannel  $contactChannel
     * @return \App\Http\Resources\CompanyContactChannel\CompanyContactChannelResource
     */
    public function update(UpdateContactChannelRequest $request, Company $company, CompanyContactChannel $contactChannel): CompanyContactChannelResource
    {
        // Проверяем, принадлежит ли канал указанной компании
        abort_if($contactChannel->company_id !== $company->id, 404);

        $contactChannel->update($request->validated());
        return new CompanyContactChannelResource($contactChannel);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Company\Company  $company
     * @param  \App\Models\Company\CompanyContactChannel  $contactChannel
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Company $company, CompanyContactChannel $contactChannel)
    {
        // Проверяем, принадлежит ли канал указанной компании
        abort_if($contactChannel->company_id !== $company->id, 404);

        $contactChannel->delete();
        return response()->json(['message' => 'Contact channel deleted']);
    }

    /**
     * Update the order of contact channels for a specific company.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Company\Company  $company
     * @return \Illuminate\Http\JsonResponse
     */
    public function reorder(Request $request, Company $company)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:company_contact_channels,id', // Проверяем, что ID существует в правильной таблице
        ]);

        $order = $request->input('order');
        DB::beginTransaction();
        try {
            foreach ($order as $index => $id) {
                // Обновляем order_column для каждого канала, принадлежащего компании
                $company->contactChannels()
                    ->where('id', $id)
                    ->update(['order_column' => $index]);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Error updating order'], 500);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }
}
