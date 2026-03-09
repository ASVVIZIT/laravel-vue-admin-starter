<?php

namespace App\Http\Controllers\Api\CompanyContactChannel;

use App\Http\Controllers\Controller;
use App\Models\Company\Company;
use App\Models\Company\CompanyContactChannel;
use App\Http\Resources\CompanyContactChannel\CompanyContactChannelResource;
use App\Http\Resources\Company\CompanyResource;
use App\Http\Requests\CompanyContactChannel\StoreContactChannelRequest;
use App\Http\Requests\CompanyContactChannel\UpdateContactChannelRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ContactChannelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CompanyContactChannel::with('company');

        // ✅ ФИЛЬТР ПО КОМПАНИИ
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->get('company_id'));
        }

        // ✅ ФИЛЬТР ПО ТИПУ
        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }

        // ✅ ФИЛЬТР ПО АКТИВНОСТИ
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->get('is_active') === 'true' || $request->get('is_active') === '1');
        }

        // ✅ ПОИСК
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('identifier', 'LIKE', "%{$search}%")
                    ->orWhere('url', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // ✅ СОРТИРОВКА — МАППИНГ ПОЛЕЙ (ИСПРАВЛЕНИЕ!)
        $sortBy = $request->get('sort_by', 'order_column_asc');
        $sortParts = explode('_', $sortBy);
        $direction = array_pop($sortParts);
        $field = implode('_', $sortParts);

        // ✅ МАППИНГ ИМЕН ПОЛЕЙ (frontend → database)
        $fieldMap = [
            'order' => 'order_column',
            'id' => 'id',
            'title' => 'title',
            'type' => 'type',
            'company' => 'company_id',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
            'is_active' => 'is_active',
        ];

        $column = $fieldMap[$field] ?? 'order_column';
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'asc';

        $query->orderBy($column, $direction);

        // ✅ ПАГИНАЦИЯ
        $perPage = max((int)$request->get('per_page', 500), 1);
        $page = $request->get('page', 1);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get total count of channels (для прогресс бара)
     */
    public function count(Request $request)
    {
        $query = CompanyContactChannel::query();

        // Применить те же фильтры что и в index()
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->get('company_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->get('is_active') === 'true' || $request->get('is_active') === '1');
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('identifier', 'LIKE', "%{$search}%")
                    ->orWhere('url', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $total = $query->count();

        return response()->json(['total' => (int) $total]);
    }

    /**
     * Display a listing of the resource (через компанию)
     */
    public function indexByCompany(Company $company): AnonymousResourceCollection
    {
        $channels = $company->contactChannels()
            ->with('company')
            ->orderBy('order_column', 'asc')
            ->get();

        return CompanyContactChannelResource::collection($channels);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContactChannelRequest $request): CompanyContactChannelResource
    {
        $data = $request->validated();

        if (!isset($data['company_id'])) {
            abort(422, 'company_id is required');
        }

        if (!isset($data['order_column'])) {
            $maxOrder = CompanyContactChannel::where('company_id', $data['company_id'])->max('order_column') ?? -1;
            $data['order_column'] = $maxOrder + 1;
        }

        $channel = CompanyContactChannel::create($data);
        $channel->load('company');

        return new CompanyContactChannelResource($channel);
    }

    /**
     * Display the specified resource.
     */
    public function show(CompanyContactChannel $contactChannel): CompanyContactChannelResource
    {
        $contactChannel->load('company');
        return new CompanyContactChannelResource($contactChannel);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContactChannelRequest $request, CompanyContactChannel $contactChannel): CompanyContactChannelResource
    {
        $contactChannel->update($request->validated());
        $contactChannel->load('company');
        return new CompanyContactChannelResource($contactChannel);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CompanyContactChannel $contactChannel)
    {
        $contactChannel->delete();
        return response()->json(['message' => 'Contact channel deleted']);
    }

    /**
     * Update the order of contact channels.
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'required|integer|exists:company_contact_channels,id',
        ]);

        $order = $request->input('order');

        DB::beginTransaction();
        try {
            foreach ($order as $index => $id) {
                CompanyContactChannel::where('id', $id)->update([
                    'order_column' => $index
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Порядок обновлён',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Ошибка обновления порядка',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
