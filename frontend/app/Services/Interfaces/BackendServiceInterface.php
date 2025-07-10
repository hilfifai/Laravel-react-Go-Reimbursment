<?php

namespace App\Services\Interfaces;

interface BackendServiceInterface
{
    public function fetchData();
    public function storeData(array $data);
}