<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Http;
use App\Repositories\Interfaces\BackendRepositoryInterface;

class GolangBackendRepository implements BackendRepositoryInterface
{
    protected $baseUrl;
    protected $endpoints;
    protected $token;
    public function __construct()
    {
        $this->baseUrl = env('GOLANG_API_KEY', 'http://localhost:8080');
        $this->endpoints = [
            'get_data' => '/api/data',
            'store_data' => '/api/data'
        ];
        $this->token = session('api_token');
    }

    public function getData()
    {
      
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' .  session('api_token'),
            'Accept' => 'application/json',
        ])->get($this->baseUrl . $this->endpoints['get_data']);

        if ($response->successful()) {
            return $response->json();
        }

        throw new \Exception("Failed to fetch data from backend");
    }

    public function sendData(array $data)
    {
        $response = Http::post("{$this->baseUrl}/api/data", $data);

        if ($response->successful()) {
            return $response->json();
        }

        throw new \Exception("Failed to send data to backend");
    }
    public function setEndpoint(string $endpoint)
    {
        $this->endpoints['get_data'] = $endpoint;
        return $this;
    }
}
