@if ($message = Session::get('success'))
    <div class="alert alert-primary alert-dismissible" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="alert-message">
            <strong>{{ $message }}</strong>
        </div>
    </div>
@endif

@if ($message = Session::get('error'))
    <div class="alert alert-danger alert-dismissible" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="alert-message">
            <strong>{{ $message }}</strong>
        </div>
    </div>
@endif

@if ($message = Session::get('warning'))
    <div class="alert alert-warning alert-dismissible" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="alert-message">
            <strong>{{ $message }}</strong>
        </div>
    </div>
@endif

@if ($message = Session::get('info'))
    <div class="alert alert-info alert-dismissible" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="alert-message">
            <strong>{{ $message }}</strong>
        </div>
    </div>
@endif

@if ($errors->any())
    <div class="alert alert-secondary alert-dismissible" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="alert-message">
            <strong>Please check the form below for errors</strong>
        </div>
    </div>
@endif