<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Services\Interfaces\BackendServiceInterface;

class AppController extends Controller
{
	public $sql;
	protected $backendService;
	public function __construct(BackendServiceInterface $backendService)
	{
		$this->backendService = $backendService;

		$this->middleware('auth');
	}
	public function index(Request $request)
	{
		// $this->backendService->setEndpoint('reimbursements'); 

		// $data = $this->backendService->fetchData();
		$login_as = Auth::user()->role;
		$menu = match ($login_as) {
			'admin' => [
				['name' => 'User Management', 'icon' => 'bx bx-user', 'route' => "ShowSection('users','users')"],
				['name' => 'Reimbursement', 'icon' => 'bx bx-money', 'route' => "ShowSection('reimbursements','reimbursements')"]
			],
			'manager' => [
				['name' => 'Approval Reimbursement', 'icon' => 'bx bx-check-circle', 'route' => "ShowSection('approval-reimbursements','reimbursements')"]
			],
			'employee' => [
				['name' => 'Ajukan Reimbursement', 'icon' => 'bx bx-plus-circle', 'route' => "ShowSection('reimbursement','reimbursements')"]
			],
			default => []
		};
		$default= [
			"admin"=>"ShowSection('users','users')",
			"manager"=>"ShowSection('approval-reimbursements','reimbursements')",
			"employee"=>"ShowSection('reimbursement','reimbursements')",
		];
		return view('app', compact('login_as', 'menu','default'));
	}
	
}
