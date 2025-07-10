<?php

namespace App\Services;

use App\Repositories\Interfaces\BackendRepositoryInterface;
use App\Services\Interfaces\BackendServiceInterface;

class BackendService implements BackendServiceInterface
{
    protected $backendRepository;

    public function __construct(BackendRepositoryInterface $backendRepository)
    {
        $this->backendRepository = $backendRepository;
    }

    public function fetchData()
    {
        return $this->backendRepository->getData();
    }

    public function storeData(array $data)
    {
        return $this->backendRepository->sendData($data);
    }
    public function setEndpoint(string $endpoint)
    {
        $this->backendRepository->setEndpoint($endpoint);
        return $this;
    }
}
