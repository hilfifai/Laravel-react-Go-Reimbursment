<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return view('app');
// });

Route::get('/', [App\Http\Controllers\AppController::class, 'index'])->name('index');
// Route::post('/register', [App\Http\Controllers\Auth\LoginController::class, 'register'])->name('register');
Route::post('/get_login', [App\Http\Controllers\Auth\LoginController::class, 'get_login'])->name('get_login');
Route::post('/send_register', [App\Http\Controllers\Auth\LoginController::class, 'send_register'])->name('send_register');
Route::get('/logout', [App\Http\Controllers\Auth\LoginController::class, 'logout'])->name('logout');

Auth::routes();
