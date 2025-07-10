/**
 * ListTableBuilder Class
 *
 * Membuat dan mengelola tabel data interaktif yang terintegrasi dengan FormBuilder
 * untuk operasi CRUD.
 */
class ListTableBuilder {
    /**
     * @param {object} config - Konfigurasi untuk table builder.
     *   - `containerId`: ID elemen div tempat tabel akan dirender.
     *   - `modalId`: ID elemen modal yang akan digunakan untuk form.
     *   - `fieldConfigs`: Array konfigurasi field, sama seperti yang digunakan oleh FormBuilder.
     *   - `apiUrl`: URL dasar untuk operasi data (e.g., '/api/users').
     */
    constructor(config) {
        this.config = config;
        this.container = document.getElementById(config.containerId);
        this.data = [];
        this.table = null; // Instance DataTables
        this.formBuilder = null; // Akan diinisialisasi saat dibutuhkan
    }

    /**
     * Metode utama untuk menginisialisasi dan merender tabel.
     */
    async init() {
        if (!this.container) {
            console.error(`Container with ID "${this.config.containerId}" not found.`);
            return;
        }
        this._renderBaseLayout();
        this.showLoading(true);
        try {
            await this._fetchData();
            this._initDataTable();
            this._bindGlobalEvents();
        } catch (error) {
            console.error("Initialization failed:", error);
            this.container.innerHTML = `<div class="alert alert-danger">Gagal memuat data tabel.</div>`;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Merender struktur HTML dasar untuk tabel dan tombol.
     * @private
     */
    _renderBaseLayout() {
      
        this.container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Data List</h4>
                <button class="btn btn-primary" id="add-new-btn">
                    <i class="fas fa-plus me-1"></i> Tambah Data Baru
                </button>
            </div>
            <div class="table-responsive">
                <table id="main-datatable" class="table table-striped table-hover w-100"></table>
            </div>
        `;
    }

    /**
     * Mengambil data awal dari API (simulasi).
     * @private
     */
    async _fetchData() {
        // Simulasi pengambilan data dari file JSON
        // Di aplikasi nyata, ini akan menjadi: fetch(this.config.apiUrl)
        try {
            // const response = await fetch('data.json'); 
            const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

            // Get bearer token from Laravel session (passed to view)
            const bearerToken = this.config.api_token;
            const myHeaders = new Headers();
            myHeaders.append("Authorization", bearerToken);
            myHeaders.append("Cookie", "ci_session=7ub6b26t9omk8mckrvh02qol7cb2jakt");

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };


            const response = await fetch(`${this.config.backendUrl}${this.config.apiUrl}`, requestOptions);

            const data = await response.json().catch(async () => {
                const text = await response.text();
                try {
                    // Second attempt to parse if text might be JSON
                    return JSON.parse(text);
                } catch {
                    return text;
                }
            });

            this.data = Array.isArray(data) ? data : data[this.config.apiUrl] || [];

        } catch (e) {
            console.error("Failed to fetch data:", e);
            this.data = []; // Fallback to empty data
            throw e;
        }
    }

    /**
     * Menginisialisasi plugin DataTables.
     * @private
     */
    _initDataTable() {
        const columns = this._generateTableColumns();

        if (this.table) {
            this.table.destroy();
        }
        console.log(this.data);
        this.table = $('#main-datatable').DataTable({
            data: this.data,
            columns: columns,
            responsive: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/id.json',
                search: "_INPUT_",
                searchPlaceholder: "Cari data..."
            },
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' +
                '<"row"<"col-sm-12"tr>>' +
                '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        });
    }

    /**
     * Membuat konfigurasi kolom untuk DataTables dari fieldConfigs.
     * @private
     */
    _generateTableColumns() {
        const columns = [];

        // Filter field yang harusnya tampil di list
        const listFields = this.config.fieldConfigs.filter(cfg => {
            const typeString = cfg[2] || '';
            return typeString.includes('-list') || typeString.includes('-table') || !typeString.includes('-')
        });

        listFields.forEach(cfg => {
            const fieldName = cfg[1];
            columns.push({
                data: fieldName,
                title: cfg[0]
            });
        });

        // Tambahkan kolom Aksi
        columns.push({
            data: null,
            title: "Aksi",
            orderable: false,
            searchable: false,
            render: (data, type, row) => {
                return `
                    <button class="btn btn-sm btn-info edit-btn" data-id="${row.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${row.id}" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
            }
        });

        return columns;
    }

    /**
     * Mengikat event listener global dan delegasi event.
     * @private
     */
    _bindGlobalEvents() {
        // Tombol Tambah Data
        document.getElementById('add-new-btn').addEventListener('click', () => {
            this._showFormModal('add');
        });

        // Delegasi event untuk tombol di dalam tabel
        $('#main-datatable tbody').on('click', '.edit-btn', (e) => {
            const id = $(e.currentTarget).data('id');
            const rowData = this.data.find(item => item.id == id);
            this._showFormModal('edit', rowData);
        });

        $('#main-datatable tbody').on('click', '.delete-btn', (e) => {
            const id = $(e.currentTarget).data('id');
            this._handleDelete(id);
        });
    }

    /**
     * Menampilkan modal dengan form yang dirender oleh FormBuilder.
     * @param {string} mode - 'add' atau 'edit'.
     * @param {object|null} data - Data baris untuk mode 'edit'.
     * @private
     */
    _showFormModal(mode, data = null) {
        const modalElement = document.getElementById(this.config.modalId);
        const modal = new bootstrap.Modal(modalElement);

        const modalTitle = modalElement.querySelector('.modal-title');
        const modalBody = modalElement.querySelector('.modal-body');
        const form = modalElement.querySelector('form');
        form.reset();
        modalBody.innerHTML = '';

        modalTitle.textContent = mode === 'add' ? 'Tambah Data Baru' : `Edit Data #${data.id}`;

        // Konfigurasi untuk FormBuilder
        const formBuilderConfig = {
            viewContext: mode === 'add' ? 'tambah' : 'edit',
            data: data || {},
            page: { crud: {} } // Bisa di-extend dengan config page dari ListTableBuilder
        };
        this.formBuilder = new FormBuilder(formBuilderConfig);

        let allJS = '';
        console.log(this.config.fieldConfigs);
        this.config.fieldConfigs.forEach((fieldConfig, index) => {
            console.log(fieldConfig);
            const components = this.formBuilder.buildField(fieldConfig, index);
            console.log(components);
            if (components.html) {
                modalBody.innerHTML += components.html;
                allJS += components.js;
            }
        });

        // Eksekusi script yang dihasilkan oleh FormBuilder
        if (allJS) {
            const scriptTag = document.createElement('script');
            scriptTag.textContent = allJS;
            modalBody.appendChild(scriptTag);
        }

        // Simpan data ID di form untuk submit
        if (mode === 'edit') {
            const idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.name = 'id';
            idInput.value = data.id;
            form.appendChild(idInput);
        }

        modal.show();

        // Hapus event listener lama sebelum menambahkan yang baru untuk mencegah duplikasi
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleFormSubmit(newForm, modal);
        });
    }

    /**
     * Menangani submit form dari modal.
     * @param {HTMLFormElement} formElement - Elemen form yang disubmit.
     * @param {bootstrap.Modal} modalInstance - Instance modal.
     * @private
     */
    // async _handleFormSubmit(formElement, modalInstance) {
    //     const formData = new FormData(formElement);
    //     const data = Object.fromEntries(formData.entries());
    //     const isEdit = !!data.id;

    //     this.showLoading(true);
    //     try {
    //         // Simulasi API call
    //         await new Promise(resolve => setTimeout(resolve, 500));

    //         if (isEdit) {
    //             // Update data di array
    //             const index = this.data.findIndex(item => item.id == data.id);
    //             if (index !== -1) {
    //                 this.data[index] = { ...this.data[index], ...data };
    //             }
    //         } else {
    //             // Tambah data baru ke array
    //             const newId = this.data.length > 0 ? Math.max(...this.data.map(d => d.id)) + 1 : 1;
    //             data.id = newId;
    //             this.data.push(data);
    //         }

    //         // Refresh tabel
    //         this.table.clear().rows.add(this.data).draw();

    //         modalInstance.hide();
    //         this.showToast(isEdit ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!');
    //     } catch (error) {
    //         console.error("Form submission failed:", error);
    //         this.showToast('Terjadi kesalahan saat menyimpan data.', 'error');
    //     } finally {
    //         this.showLoading(false);
    //     }
    // }

    async _handleFormSubmit(formElement, modalInstance) {
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData.entries());
        const isEdit = !!data.id;

        this.showLoading(true);

        try {
            // Prepare request
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${this.config.api_token}`);
            myHeaders.append("Content-Type", "application/json");

            // Convert amount to number if exists
            if (data.amount) {
                data.amount = Number(data.amount);
            }
           
            const requestOptions = {
                method: isEdit ? "PUT" : "POST",
                headers: myHeaders,
                body: JSON.stringify(data),
                redirect: "follow"
            };

            const endpoint = isEdit
                ? `${this.config.backendUrl}${this.config.apiUrl}/${data.id}`
                : `${this.config.backendUrl}${this.config.apiUrl}`;

            // Send to API
            const response = await fetch(endpoint, requestOptions);

            if (!response) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Request failed');
            }

            // const result = await response.json();

            // // Update local data
            // if (isEdit) {
            //     const index = this.data.findIndex(item => item.id == data.id);
            //     if (index !== -1) {
            //         this.data[index] = { ...this.data[index], ...result };
            //     }
            // } else {
            //     this.data.push(result);
            // }
            this._fetchData();

            // Refresh table
            this.table.clear().rows.add(this.data).draw();

            modalInstance.hide();
            this.showToast(
                isEdit ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!',
                'success'
            );

        } catch (error) {
            console.error("Form submission failed:", error);
            this.showToast(
                error.message || 'Terjadi kesalahan saat menyimpan data',
                'error'
            );
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Menangani proses penghapusan data.
     * @param {number} id - ID baris yang akan dihapus.
     * @private
     */
    async _handleDelete(id) {
        const result = await Swal.fire({
            title: 'Anda yakin?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            this.showLoading(true);
            try {
                // Simulasi API call
                await new Promise(resolve => setTimeout(resolve, 500));

                this.data = this.data.filter(item => item.id != id);
                this.table.clear().rows.add(this.data).draw();

                this.showToast('Data berhasil dihapus.');
            } catch (error) {
                console.error("Delete failed:", error);
                this.showToast('Gagal menghapus data.', 'error');
            } finally {
                this.showLoading(false);
            }
        }
    }

    // ===================================================================
    // UTILITY METHODS
    // ===================================================================

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showToast(message, icon = 'success') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }
}