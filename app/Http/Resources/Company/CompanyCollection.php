<?php

namespace App\Http\Resources\Company;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CompanyCollection extends ResourceCollection
{
    protected $total;

    public function __construct($resource, $total = null)
    {
        parent::__construct($resource);

        $this->total = $total !== null ? (int) $total : (int) $resource->total();
    }

    public function toArray($request)
    {
        return [
            'data' => $this->collection,
        ];
    }

    public function with($request)
    {
        return [
            'meta' => [
                'total' => $this->total,
                'per_page' => (int) $this->resource->perPage(),
                'current_page' => (int) $this->resource->currentPage(),
                'last_page' => (int) $this->resource->lastPage(),
                'from' => $this->resource->firstItem(),
                'to' => $this->resource->lastItem(),
            ],
        ];
    }
}
