<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // API TIDAK BOLEH redirect ke halaman login.
        // Kalau token salah/expired, langsung lempar 401 JSON.
        Authenticate::redirectUsing(fn($request) => null);
    }
}
