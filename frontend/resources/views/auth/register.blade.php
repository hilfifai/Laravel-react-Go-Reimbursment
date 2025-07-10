@extends('layouts.template')

@section('content')

    <div class="container-xxl">
        <div class="authentication-wrapper authentication-basic container-p-y">
            <div class="authentication-inner">
                <!-- Register -->
                <div class="card">
                    <div class="card-body">
                        <!-- Logo -->
                        <div class="app-brand justify-content-center">
                            <a href="index.html" class="app-brand-link gap-2">
                               
                                <span class="app-brand-text demo fw-bolder" style="  text-transform: capitalize!important;">AIC</span>
                            </a>
                        </div>
                        <!-- /Logo -->
                      
                        @include('flash-message')
                        <form id="formAuthentication" class="mb-3" action="{{route('send_register')}}" method="POST">
                            {{csrf_field()}}
                            <div class="mb-3">
                                <label for="email" class="form-label">name</label>
                                <input type="name" class="form-control" id="name" name="name"
                                    placeholder="Enter your name" autofocus />
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email Addres</label>
                                <input type="email" class="form-control" id="email" name="email"
                                    placeholder="Enter your email or username" autofocus />
                            </div>
                            <div class="mb-3 form-password-toggle">
                                <div class="d-flex justify-content-between">
                                    <label class="form-label" for="password">Password</label>
                                   
                                </div>
                                <div class="input-group input-group-merge">
                                    <input type="password" id="password" class="form-control" name="password"
                                        placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                        aria-describedby="password" />
                                    <span class="input-group-text cursor-pointer"><i class="bx bx-hide"></i></span>
                                </div>
                            </div>
                           
                            <div class="mb-3">
                                <button class="btn btn-primary d-grid w-100" type="submit">Register</button>
                            </div>
                        </form>

                        <p class="text-center">
                            <span>Already Account?</span>
                            <a href="<?=route('login');?>">
                                <span>Login</span>
                            </a>
                        </p>
                    </div>
                </div>
                <!-- /Register -->
            </div>
        </div>
    </div>

@endsection