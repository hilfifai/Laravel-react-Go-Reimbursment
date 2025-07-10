<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\BackendRepositoryInterface;
use App\Repositories\GolangBackendRepository;
use App\Services\Interfaces\BackendServiceInterface;
use App\Services\BackendService;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
     public function register()
    {
        $this->app->bind(
            BackendRepositoryInterface::class,
            GolangBackendRepository::class
        );
        
        $this->app->bind(
            BackendServiceInterface::class,
            BackendService::class
        );
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
