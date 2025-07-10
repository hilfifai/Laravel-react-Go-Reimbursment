<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\User;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Session;
use DB;
use Auth;
use Illuminate\Support\Facades\URL;
use App\Helper_function;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }
    public function get_login(Request $request)
    {
      
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
       
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Cookie' => 'ci_session=7ub6b26t9omk8mckrvh02qol7cb2jakt',
        ])->post(env('GOLANG_API_KEY').'auth/login', [
            'email' => $request->email,
            'password' => $request->password,
        ]);
        
       
        if ($response->successful()) {
            $data = $response->json();

            session(['api_token' => $data['token']]);
            session(['userid' => $data['user']['id']]);

            $user = new \App\Models\User(); 
            $user->id = $data['user']['id']; 
            Auth::login($user);

            return redirect('/'); 
        }

        return back()->withErrors([
            'email' => 'Email atau password salah.',
        ]);
    }
    public function send_register(Request $request)
    {
      
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'name' => 'required'
        ]);
       
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Cookie' => 'ci_session=7ub6b26t9omk8mckrvh02qol7cb2jakt',
        ])->post(env('GOLANG_API_KEY').'auth/register', [
            'email' => $request->email,
            'password' => $request->password,
            'name' => $request->name,
            'role' => 'employee',
        ]);
        
       
        // Cek response dari API
        if ($response->successful()) {
          


            return redirect('/login')->with('success',"register berhasil"); 
        }

        return back()->withErrors([
            'email' => 'Form terdapat kesalahan.',
        ]);
    }

    public function logout2(Request $request)
    {
        // Hapus session/token
        $request->session()->forget('api_token');
        Auth::logout();
        return redirect('/');
    }
    public function login(Request $request)
    {
         return view('auth.login');
    }

    public function logout(Request $request)
    {
    	if((Session::get('userid'))){
    		
    	  $sqluser="SELECT * FROM users WHERE id ='".Session::get('userid')."' ";
            $user=DB::connection()->select($sqluser);
    	
       
    	}
	
        Session::flush();
       Auth::logout();
       Cache::forget('key');
       Session::forget('key');
       Session::regenerate();;
        return redirect()->route('login')->with('success','Logout successfully!');
    }

    public function landingpage(Request $request)
    {
    
    }

    public function loginform()
    {
        //Session::flush();
        $sqlslider="select * from m_slider where active=1";
        $slider=DB::connection()->select($sqlslider);
        return view('auth.login',compact('slider'));
    }
}
