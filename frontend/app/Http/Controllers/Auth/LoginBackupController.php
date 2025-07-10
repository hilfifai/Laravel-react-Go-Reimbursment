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
	
    public function login(Request $request)
    {//echo 'masuk';die;
        // Auth::logout();
        $this->validate($request, [
            'username' => 'required|string',
            'password' => 'required|string|min:6',
        ]);
  
        $loginType = filter_var($request->username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $login = [
            $loginType => $request->username,
            'password' => $request->password,
            'active'=>1
        ];
        
        if (auth()->attempt($login)) {
            //return redirect()->route('home')->with('success','Login successfully!');
            Session::put('username',$request->username);
            $sqluser="SELECT * FROM users WHERE username ='".$request->username."' and active=1";
            $user=DB::connection()->select($sqluser);
           
            $role=$user[0]->role;
            //echo $role;die;
            //Session::put('role',$role);
            DB::connection()->table("users_login")
			->insert([

				"user_id" => $user[0]->id,
				"type_login" => 1,
				"waktu" => date('Y-m-d H:i:s'),
			]);
            Session::put('login',TRUE);
            Session::put('userid',$user[0]->id);
            if($role==2){
                Session::put('akses','karyawan');
				
            // 	return Session::get('backUrl') ? redirect(Session::get('backUrl')) : redirect()->route('home')->with('success','Login successfully!');
             	return  redirect()->route('home')->with('success','Login successfully!');
			}
            else{
                Session::put('akses','admin');
				
            	return  redirect()->route('admin')->with('success','Login successfully!');
			}
            //alert($user[0]->name.'Selamat Datang Di Pouch Work','Success')->persistent("Close this");
        }
        
        //date_default_timezone_set('Asia/Jakarta');
        //$user = User::find(Auth::user()->id);
        //$user->last_login = date('Y-m-d H:i:s');
        //$user->save();
        //$request->Session()->flush();
        //Session::flush();
        $sqlslider="select * from m_slider where active=1";
        $slider=DB::connection()->select($sqlslider);
        return view('auth.login', compact('slider'))->with('error', 'Email/Password salah!');
    }

    public function logout(Request $request)
    {
    	if((Session::get('userid'))){
    		
    	  $sqluser="SELECT * FROM users WHERE id ='".Session::get('userid')."' ";
            $user=DB::connection()->select($sqluser);
    	
        DB::connection()->table("users_login")
			->insert([

				"user_id" => $user[0]->id,
				"type_login" => 2,
				"waktu" => date('Y-m-d H:i:s'),
			]);
    	}
			 //return view('auth.login');
        //echo 'masuk';die;

        //$sqlslider="select * from m_slider where active=1";
        //$slider=DB::connection()->select($sqlslider);
        //return redirect('login', compact('slider'))->with('info','Kamu sudah logout');
        //return view('auth.login', compact('slider'))->with('info','Kamu sudah logout');
        $sqlslider="select * from m_slider where active=1";
        $slider=DB::connection()->select($sqlslider);
        //Session::flush();
        //return view('auth.login', compact('slider'))->with('info','Kamu sudah logout');
       Auth::logout();
       //Session::destroy();
        //Auth::guard($this->getGuard())->logout();
        return redirect()->route('login')->with('success','Logout successfully!');
    }

    public function landingpage(Request $request)
    {
        //return view('auth.login');
        //$sqllokasi="select * from m_lokasi where active=1";
        //$lokasi=DB::connection()->select($sqllokasi);

        $sqlslider="select * from m_slider where active=1";
        $slider=DB::connection()->select($sqlslider);
        return view('auth.login',compact('slider'));
    }

    public function loginform()
    {
        //Session::flush();
        $sqlslider="select * from m_slider where active=1";
        $slider=DB::connection()->select($sqlslider);
        return view('auth.login',compact('slider'));
    }
}
