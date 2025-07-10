@extends('layouts.template')
@push('sidebar')
    @include('layouts.sidebar')
@endpush
@section('content')

    <div class="container mt-4">
        <div class="card">
            <div class="card-body">
                <!-- Container untuk ListTableBuilder -->
                <div id="my-table-container"></div>
            </div>
        </div>
    </div>

    <!-- Modal untuk FormBuilder -->
    <div class="modal fade" id="form-modal" tabindex="-1" aria-labelledby="formModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="formModalLabel">Form Data</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="data-form">
                    <div class="modal-body">
                        <!-- Form fields will be injected here by FormBuilder -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loading-overlay" style="display: none;">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

@endsection
@push('script')
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script>
        function ShowSection(menu,apiUrl) {

            const fieldConfigs=[];
            fieldConfigs['users'] = [
                ['ID', 'id', 'number-list'],
                ['Nama', 'name', 'text-list-crud-req'],
                ['Email', 'email', 'email-list-crud-req'],
                ['Password', 'password', 'password-crud-req'],
                
                ['Role', 'role', 'select_manual-list-crud', {
                    admin: 'Admin',
                    manager: 'Manager',
                    employee: 'Employee'
                }]
                
            ];
            fieldConfigs['reimbursements'] = [
                ['ID', 'id', 'number-list'],
                ['Judul', 'title', 'text-list-crud-req'],
                ['Deskripsi', 'description', 'textarea-list-crud-req'],
                ['Jumlah', 'amount', 'currency-list-crud-req'],
                // ['Kategori', 'category_id', 'select-api-list-crud', 'categories'],
                ['Status', 'status', 'select_manual-list', {
                    pending: 'Pending',
                    approved: 'Approved',
                    rejected: 'Rejected',
                    processed: 'Processed'
                }],
                // ['Diajukan Pada', 'created_at', 'datetime-list'],
                // ['Disetujui Pada', 'approved_at', 'datetime-list'],
                // ['Pemohon', 'user_id', 'select-api-list-crud', 'users'],
                // ['Disetujui Oleh', 'approved_by', 'select-api-list-crud', 'users']
            ];
            fieldConfigs['approval-reimbursements'] = [
                ['ID', 'id', 'number-list'],
                ['Judul', 'title', 'text-list-crud-req'],
                ['Deskripsi', 'description', 'textarea-list-crud-req'],
                ['Jumlah', 'amount', 'currency-list-crud-req'],
                // ['Kategori', 'category_id', 'select-api-list-crud', 'categories'],
                ['Status', 'status', 'select_manual-list-crud', {
                    pending: 'Pending',
                    approved: 'Approved',
                    rejected: 'Rejected',
                    processed: 'Processed'
                }],
                // ['Diajukan Pada', 'created_at', 'datetime-list'],
                // ['Disetujui Pada', 'approved_at', 'datetime-list'],
                // ['Pemohon', 'user_id', 'select-api-list-crud', 'users'],
                // ['Disetujui Oleh', 'approved_by', 'select-api-list-crud', 'users']
            ];
            // Konfigurasi untuk ListTableBuilder
            const tableConfig = {
                containerId: 'my-table-container',
                modalId: 'form-modal',
                fieldConfigs: fieldConfigs[menu],
                apiUrl: apiUrl, // Ganti dengan URL API Anda
                backendUrl: "{{ env('GOLANG_API_KEY') }}",
                api_token: "{{ session('api_token') }}"
            };

            // Buat instance dan inisialisasi
            const myTable = new ListTableBuilder(tableConfig);
            myTable.init();
        }
        <?=$default[$login_as];?>
    </script>
@endpush