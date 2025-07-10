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

class AdminController extends Controller
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
 
    public function index(Request $request)
    {return view('auth.login_admin'); }

    public function get_login(Request $request)
    {//echo 'masuk';die;
        $this->validate($request, [
            'username' => 'required|string',
            'password' => 'required|string|min:6',
        ]);
  
        $loginType = filter_var($request->username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $login = [
            $loginType => $request->username,
            'password' => $request->password,
            'admin' => 1
        ];
        if (auth()->attempt($login)) {
            //return redirect()->route('home')->with('success','Login successfully!');
            Session::put('username',$request->username);
            //$sqluser="SELECT * FROM hrm.users WHERE username ='".$request->username."' ";
            //$user=DB::connection()->select($sqluser);
            //$role=$user->role;
            //Session::put('role',$role);
            Session::put('login',TRUE);
            return redirect()->route('admin')->with('success','Login successfully!');
            //alert($user[0]->name.'Selamat Datang Di Pouch Work','Success')->persistent("Close this");
        }
        //date_default_timezone_set('Asia/Jakarta');
        //$user = User::find(Auth::user()->id);
        //$user->last_login = date('Y-m-d H:i:s');
        //$user->save();
        //$request->Session()->flush();
        //Session::flush();
        
        return view('auth.login_admin')->with(['error' => 'Email/Password salah!']);
    }

    public function logout(Request $request)
    {
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
        Session::flush();
        //Auth::guard($this->getGuard())->logout();
        return redirect()->route('login_admin')->with('success','Logout successfully!');
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
