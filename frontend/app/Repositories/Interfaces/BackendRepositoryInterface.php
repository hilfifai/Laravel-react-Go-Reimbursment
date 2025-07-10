<?php

namespace App\Repositories\Interfaces;

interface BackendRepositoryInterface
{
    public function getData();
    public function sendData(array $data);
}
