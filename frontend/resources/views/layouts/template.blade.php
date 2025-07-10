<!DOCTYPE html>

<!-- =========================================================
* Sneat - Bootstrap 5 HTML Admin Template - Pro | v1.0.0
==============================================================

* Product Page: https://themeselection.com/products/sneat-bootstrap-html-admin-template/
* Created by: ThemeSelection
* License: You must have a valid license purchased in order to legally use the theme for your project.
* Copyright ThemeSelection (https://themeselection.com)

=========================================================
 -->
<!-- beautify ignore:start -->
<html
  lang="en"
  class="light-style"
  dir="ltr"
  data-theme="theme-default"
 
  data-template="vertical-menu-template-free"
>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
    />

    <title>Reimbursment Hilfi</title>

    <meta name="description" content="" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <!-- Favicon -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

    <!-- Icons. Uncomment required icon fonts -->
    <link rel="stylesheet" href="{{ asset('/assets/sneat/assets/vendor/fonts/boxicons.css')}}" />

    <!-- Core CSS -->
    <link rel="stylesheet" href="{{ asset('/assets/sneat/assets/vendor/css/core.css')}}" class="template-customizer-core-css" />
    <link rel="stylesheet" href="{{ asset('/assets/sneat/assets/vendor/css/theme-default.css')}}" class="template-customizer-theme-css" />
    <link rel="stylesheet" href="{{ asset('/assets/sneat/assets/css/demo.css')}}" />

    <!-- Vendors CSS -->
    <link rel="stylesheet" href="{{ asset('/assets/sneat/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css')}}" />
 <link rel="stylesheet" href="{{ asset('/assets/sneat/assets/vendor/css/pages/page-auth.css')}}" />
    <!-- Page CSS -->

    <!-- Helpers -->
    <script src="{{ asset('/assets/sneat/assets/vendor/js/helpers.js')}}"></script>

    <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->
    <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->
    <script src="{{ asset('/assets/sneat/assets/js/config.js')}}"></script>
    <style>
    .alert {
        padding: 15px;
        border: 1px solid #d6d8db;
        border-radius: 4px;
        background: #e2e3e5;
        margin-bottom: 20px;
    }
    .alert-dismissible .close {
        float: right;
        font-size: 1.5rem;
        font-weight: bold;
        line-height: 1;
        color: #000;
        opacity: 0.5;
        border: none;
        background: transparent;
    }
    .alert strong {
        font-weight: 600;
    }
</style>
  </head>

  <body>
   <div id="header"></div>
  
     <div class="layout-wrapper layout-content-navbar">
         <div id="sidebar"> @stack('sidebar')</div>
      <div class="layout-container">
        @yield('content')
      </div>
     </div>
    <script src="{{ asset('/assets/sneat/assets/vendor/libs/jquery/jquery.js')}}"></script>
    <script src="{{ asset('/assets/sneat/assets/vendor/libs/popper/popper.js')}}"></script>
    <script src="{{ asset('/assets/sneat/assets/vendor/js/bootstrap.js')}}"></script>
    <script src="{{ asset('/assets/sneat/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js')}}"></script>

    <script src="{{ asset('/assets/sneat/assets/vendor/js/menu.js')}}"></script>
    <!-- endbuild -->

    <!-- Vendors JS -->

    <!-- Main JS -->
    <script src="{{ asset('/assets/sneat/assets/js/main.js')}}"></script>
    <script src="{{ asset('/assets/faiframework/ListTableBuilder2.js')}}"></script>
    <script src="{{ asset('/assets/faiframework/FormBuilder.js')}}"></script>
    <link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css" />
    <script src="//cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    @stack('script')
  </body>
</html>