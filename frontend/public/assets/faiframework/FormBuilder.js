/**
 * FormBuilder Class
 *
 * Mengonversi konfigurasi field mentah menjadi komponen HTML, JS, dan CSS yang siap dirender.
 * Kelas ini menangani inisialisasi (logika visibilitas & pemrosesan flag) dan parsing (rendering HTML).
 *
 * Alur Kerja:
 * 1. Buat instance: const fb = new FormBuilder(globalConfig);
 * 2. Untuk setiap field: const components = fb.buildField(rawFieldConfig, index);
 * 3. Gunakan components.html, components.js, components.css.
 */
class FormBuilder {
    /**
     * @param {object} config - Konfigurasi global.
     *   - `config.viewContext`: Konteks tampilan saat ini ('tambah', 'edit', 'view', 'list', 'search').
     *   - `config.data`: Data baris saat ini untuk mode 'edit' atau 'view'.
     *   - `config.page`: Objek konfigurasi halaman (misal, page.crud, page.non_view).
     *   - `config.fai`: Objek helper atau framework (opsional, untuk routing).
     */
    constructor(config = {}) {
        this.config = {
            viewContext: 'tambah',
            data: {},
            
            fai: {
                route_v: (page, route, params) => `/api/select?field=${params[0]}`
            },
            ...config
        };
    }

    /**
     * Metode publik utama untuk membangun satu field.
     * Mengorkestrasi proses inisialisasi dan parsing.
     * @param {Array} rawFieldConfig - Konfigurasi mentah untuk field, cth: ['Nama', 'nama', 'text-list-req'].
     * @param {number} numbering - Nomor urut untuk field, digunakan dalam ID.
     * @returns {{html: string, js: string, css: string}}
     */
    buildField(rawFieldConfig, numbering = 0) {
        const pConfig = this._initialize(rawFieldConfig, numbering);
         console.log(pConfig);
        if (!pConfig.isVisible) {
            return { html: '', js: '', css: '' };
        }
        console.log(pConfig);
        return this._parse(pConfig);
    }

    // ===================================================================
    // LANGKAH 1: INISIALISASI
    // ===================================================================
    
    _initialize(rawConfig, numbering) {
        let pConfig = { numbering };

        pConfig.text = rawConfig[0] || '';
        pConfig.field = (rawConfig[1] || '').toLowerCase().trim().replace('.', '');
        if (!pConfig.field && pConfig.text) {
            pConfig.field = pConfig.text.toLowerCase().replace(/ /g, '_');
        }
        if (!pConfig.text && pConfig.field) {
            pConfig.text = pConfig.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        const typeString = rawConfig[2] || 'text';
        const typeParts = typeString.split('-');
        
        const baseTypes = ['text','select_manual', 'select', 'textarea', 'photos', 'file', 'picture', 'editor', 'radio', 'checkbox', 'hidden', 'password', 'number', 'div'];
        pConfig.type = baseTypes.includes(typeParts[0]) ? typeParts[0] : 'text';

        this._determineVisibility(pConfig, typeParts);
        this._processFlags(pConfig, typeParts);
        
        const pageCrud = this.config.page.crud || {};
        pConfig.prefixName = pageCrud.prefix_name || '';
        pConfig.suffixName = pageCrud.sufix_name || '';
        if (['file', 'photos', 'file-upload', 'video'].includes(typeString)) {
            pConfig.suffixName = `[${pConfig.numbering}]`;
        }

        pConfig.options = rawConfig[3] || [];
        pConfig.extraConfig = rawConfig[4] || {};
        pConfig.originalField = rawConfig[5] || pConfig.field;
        pConfig.originalTypeString = typeString;
        
        return pConfig;
    }

    _determineVisibility(pConfig, typeParts) {
        const view = this.config.viewContext;
       
        let visible = true;
        if (typeParts.length > 1) {
            const flags = new Set(typeParts);
            if (flags.has('relation')) visible = (view === 'view');
            else if ((flags.has('table') || flags.has('list')) && flags.has('crud')) visible = ['tambah', 'edit', 'view','list'].includes(view);
            else if (flags.has('table') || flags.has('list')) visible = (view === 'list');
            else if (flags.has('appr')) visible = ['list', 'appr'].includes(view);
            else if (flags.has('editview')) visible = ['edit', 'view'].includes(view);
            else if (flags.has('crud')) visible = ['tambah', 'edit', 'view'].includes(view);
            else if (flags.has('edit')) visible = (view === 'edit');
            else if (flags.has('tambah')) visible = (view === 'tambah');
            else if (flags.has('password')) visible = ['tambah', 'edit'].includes(view);
            else if (flags.has('hidden_input')) visible = (view !== 'list');
            else if (flags.has('crud')) visible = true;;
        }
        // console.log( ['tambah', 'edit', 'view'].includes(view));
       
        const nonView = this.config.page.non_view || {};

        
        if (view === 'list' && nonView.list && nonView.list[pConfig.field]) visible = false;
        if (view === 'tambah' && nonView.Tambah && nonView.Tambah[pConfig.field]) visible = false;
        if (view === 'edit' && nonView.Edit && nonView.Edit[pConfig.field]) visible = false;
       
        pConfig.isVisible = visible;
    }
    
    _processFlags(pConfig, typeParts) {
        const flags = new Set(typeParts);
        pConfig.isRequired = flags.has('req');
        pConfig.isNumber = flags.has('number');
        pConfig.isRight = flags.has('right');
        pConfig.isDisabled = flags.has('disable');
        pConfig.inputGroup = { prefix: '', suffix: '' };
        if (flags.has('cur')) pConfig.inputGroup.prefix = 'Rp.';
        if (flags.has('persen')) pConfig.inputGroup.suffix = '%';
    }


    _parse(pConfig) {
        const context = {
            pConfig,
            value: this._getValue(pConfig),
            wrapper: this._buildWrapper(pConfig),
            inputInline: this._buildInputAttributes(pConfig),
            customClass: this._buildCustomClass(pConfig)
        };
        
        const handlerName = `_handle_${pConfig.originalTypeString.replace(/-/g, '_')}`;
        console.log(handlerName);
        if (typeof this[handlerName] === 'function') {
            return this[handlerName](context);
        }
        
        const baseHandlerName = `_handle_${pConfig.type}`;
        console.log(baseHandlerName);
        if (typeof this[baseHandlerName] === 'function') {
            return this[baseHandlerName](context);
        }

        return this._handle_standard_input(context, pConfig.type);
    }
    
    _getValue(pConfig) {
       
        const pageCrud = this.config.page.crud || {};
        const view = this.config.viewContext;
        const data = this.config.data || {};

        if (view === 'search') {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(pConfig.field) || '';
        }

        let value = data[pConfig.field] || '';
        
        if (view === 'tambah' && pageCrud.insert_value && pageCrud.insert_value[pConfig.field]) {
            value = this._processSpecialValues(pageCrud.insert_value[pConfig.field]);
        } else if (view === 'edit' && pageCrud.update_value && pageCrud.update_value[pConfig.field] && !value) {
            value = this._processSpecialValues(pageCrud.update_value[pConfig.field]);
        }
        
        if (pConfig.type === 'password') return '';

        return value;
    }
     _processSpecialValues(stringValue) {
        if (stringValue === 'date:now') {
            return new Date().toISOString().split('T')[0];
        }
        return stringValue;
    }

    _buildWrapper(pConfig) {
        
       
        const { text, field, numbering, inputGroup } = pConfig;
        const formType = (this.config.page.crud || {}).form_type || 1;
        let startDiv, endDiv;
        if(this.config.page.crud.startDiv){
            startDiv = this.config.page.crud.startDiv;
           startDiv =  startDiv.replace(new RegExp(`<TEXT></TEXT>`, 'gi'),text || '')
           startDiv =  startDiv.replace(new RegExp(`<FIELD_NUMBERING></FIELD_NUMBERING>`, 'gi'),field+numbering || '')
            endDiv = this.config.page.crud.endDiv;
           endDiv =  endDiv.replace(new RegExp(`<TEXT></TEXT>`, 'gi'),text || '')
           endDiv =  endDiv.replace(new RegExp(`<FIELD_NUMBERING></FIELD_NUMBERING>`, 'gi'),field+numbering || '')
        }else
        if (formType === 1) { // Horizontal
            startDiv = `<div class="form-group row mb-1"><label class="control-label col-3" style="font-weight:600">${text}</label><div class="col-9">`;
            endDiv = `<span class="help-block text-danger" id="help_${field}${numbering}"></span></div></div>`;
        } else { // Vertical
            startDiv = `<div class="form-group mb-1"><label class="control-label" style="font-weight:600">${text}</label><div>`;
            endDiv = `<span class="help-block text-danger" id="help_${field}${numbering}"></span></div></div>`;
        }
        
        if (inputGroup.prefix || inputGroup.suffix) {
             startDiv += `<div class="input-group">`;
             if(inputGroup.prefix) startDiv += `<span class="input-group-text">${inputGroup.prefix}</span>`;
             endDiv = (inputGroup.suffix ? `<span class="input-group-text">${inputGroup.suffix}</span>` : '') + `</div>` + endDiv;
        }

        return { startDiv, endDiv };
    }
    
    _buildCustomClass(pConfig) {
        // ... (Implementasi dari jawaban sebelumnya sudah bagus)
        let classes = ` ${pConfig.field}`;
        if (pConfig.isRight) classes += ' text-right';
        if (pConfig.isNumber) classes += ' is-number';
        
        const pageCrud = this.config.page.crud || {};
        if (pageCrud.costum_class && pageCrud.costum_class[pConfig.field]) {
            classes += " "+`${pageCrud.costum_class[pConfig.field]}${classes}`;
        }
        if (pageCrud.allCostumClass) {
            classes += " "+pageCrud.allCostumClass;
        }
        return classes.trim();
    }
    
    _buildInputAttributes(pConfig) {
        // ... (Implementasi dari jawaban sebelumnya sudah bagus)
        const pageCrud = this.config.page.crud || {};
        let attributes = pageCrud.input_inline || '';

        if (pConfig.isRequired) attributes += ' required';
        if (pConfig.isDisabled) attributes += ' disabled';
        if (pConfig.isNumber) {
            attributes += ` onkeypress="return event.charCode >= 48 && event.charCode <= 57" data-number="true"`;
        }
        
        if (pageCrud.field_value_automatic && pageCrud.field_value_automatic[pConfig.field]) {
            attributes += ` onchange="field_value_automatic_${pConfig.field}(this)"`;
        }

        return attributes.trim();
    }
    

    _handle_standard_input(context, inputType = 'text') {
        const { pConfig, value, wrapper, inputInline, customClass } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        const html = `
            ${wrapper.startDiv}
            <input 
                name="${name}" 
                id="${pConfig.field}${pConfig.numbering}" 
                type="${inputType}" 
                class="${customClass.includes('no-form-control') ? customClass : 'form-control ' + customClass}"
                placeholder="${pConfig.text}" 
                value="${value}" 
                ${inputInline}
            />
            ${wrapper.endDiv}
        `;
        return { html, js: '', css: '' };
    }

    _handle_password(context) {
        return this._handle_standard_input(context, 'password');
    }
    
    _handle_number(context) {
        return this._handle_standard_input(context, 'number');
    }

    _handle_hidden(context) {
        const { pConfig, value } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        const html = `<input name="${name}" id="${pConfig.field}${pConfig.numbering}" type="hidden" value="${value}">`;
        return { html, js:'', css:'' };
    }
    
    _handle_div(context) {
        const { pConfig } = context;
        const html = `<h4>${pConfig.text}</h4><div id="${pConfig.field}"></div>`;
        return { html, js:'', css:'' };
    }
    
    _handle_textarea(context) {
        const { pConfig, value, wrapper, inputInline, customClass } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        const html = `
            ${wrapper.startDiv}
            <textarea
                name="${name}"
                id="${pConfig.field}${pConfig.numbering}"
                class="${customClass.includes('no-form-control') ? customClass : 'form-control ' + customClass} " 
                placeholder="${pConfig.text}"
                ${inputInline}
            >${value}</textarea>
            ${wrapper.endDiv}
        `;
        return { html, js: '', css: '' };
    }

    _handle_select(context) {
        const { pConfig, value, wrapper, inputInline, customClass } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        const pageCrud = this.config.page.crud || {};
        const ajaxUrl = this.config.fai.route_v(this.config.page, pageCrud.route, [`select2_${pConfig.field}`, -1]);
        const html = `${wrapper.startDiv}<select name="${name}" id="${pConfig.field}${pConfig.numbering}" class="${customClass.includes('no-form-control') ? customClass : 'form-control ' + customClass} select2" ${inputInline}></select>${wrapper.endDiv}`;
        const js = `
            $(document).ready(function() {
                const selectEl = $('#${pConfig.field}${pConfig.numbering}');
                selectEl.select2({
                    placeholder: 'Pilih ${pConfig.text}',
                    allowClear: true,
                    ajax: { url: '${ajaxUrl}', dataType: 'json', delay: 250, data: p => ({ q: p.term }), processResults: d => ({ results: d.items || d }) }
                });

                const initialValue = '${value}';
                const initialText = '${this.config.data[pConfig.field + '_name'] || ''}';
                if (initialValue && initialText) {
                    selectEl.append(new Option(initialText, initialValue, true, true)).trigger('change');
                }
            });
        `;
        return { html, js, css: '' };
    }
    
    _handle_select_manual(context) {
        const { pConfig, value, wrapper, inputInline, customClass } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        let optionsHtml = `<option value="">- Pilih ${pConfig.text} -</option>`;
        if (typeof pConfig.options === 'object' && pConfig.options !== null) {
            for (const [key, val] of Object.entries(pConfig.options)) {
                const selected = value == key ? 'selected' : '';
                optionsHtml += `<option value="${key}" ${selected}>${val}</option>`;
            }
        }
        const html = `${wrapper.startDiv}<select name="${name}" id="${pConfig.field}${pConfig.numbering}" class="${customClass.includes('no-form-control') ? customClass : 'form-control ' + customClass}"${inputInline}>${optionsHtml}</select>${wrapper.endDiv}`;
        return { html, js: '', css: '' };
    }

    _handle_choice_controls(context, type) {
        const { pConfig, value, wrapper, inputInline, customClass } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        let choicesHtml = '';
        if (typeof pConfig.options === 'object' && pConfig.options !== null) {
             for (const [key, val] of Object.entries(pConfig.options)) {
                const checked = value == key ? 'checked' : '';
                choicesHtml += `
                    <div class="form-check form-check-inline">
                        <input class="form-check-input ${customClass}" type="${type}" name="${name}" id="${pConfig.field}${pConfig.numbering}_${key}" value="${key}" ${checked} ${inputInline}>
                        <label class="form-check-label" for="${pConfig.field}${pConfig.numbering}_${key}">${val}</label>
                    </div>
                `;
            }
        }
        const html = `${wrapper.startDiv}${choicesHtml}${wrapper.endDiv}`;
        return { html, js: '', css: '' };
    }

    _handle_radio(context) { return this._handle_choice_controls(context, 'radio'); }
    _handle_radio_manual(context) { return this._handle_choice_controls(context, 'radio'); }
    _handle_checkbox(context) { return this._handle_choice_controls(context, 'checkbox'); }
    _handle_checkbox_manual(context) { return this._handle_choice_controls(context, 'checkbox'); }
    
    _handle_photos(context) {
        const { pConfig, value, wrapper, inputInline } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        const css = `
            .photo-upload-container { width: 12rem; height: 12rem; position: relative; border: 1px solid #ddd; border-radius: 0.5rem; overflow: hidden; background-color: #f8f9fa; }
            .photo-upload-img { object-fit: cover; width: 100%; height: 100%; }
            .photo-upload-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s; cursor: pointer; }
            .photo-upload-container:hover .photo-upload-overlay { opacity: 1; }
            .photo-upload-btn { background-color: rgba(255,255,255,0.8); border: 1px solid #ccc; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #333; }
            .photo-upload-input { display: none; }
        `;
        
        const imageUrl = value ? value : 'https://placehold.co/300x300/e2e8f0/e2e8f0';
        
        const html = `
            ${wrapper.startDiv}
            <div class="photo-upload-container" id="container_${pConfig.field}${pConfig.numbering}">
                <img id="image_${pConfig.field}${pConfig.numbering}" class="photo-upload-img" src="${imageUrl}" />
                <div class="photo-upload-overlay" onclick="document.getElementById('${pConfig.field}${pConfig.numbering}').click()">
                    <span class="photo-upload-btn">📷</span>
                </div>
            </div>
            <input name="${name}" id="${pConfig.field}${pConfig.numbering}" accept="image/*" class="photo-upload-input" type="file" ${inputInline} />
            ${wrapper.endDiv}
        `;

        const js = `
            $(document).ready(function() {
                $('#${pConfig.field}${pConfig.numbering}').on('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            $('#image_${pConfig.field}${pConfig.numbering}').attr('src', event.target.result);
                        }
                        reader.readAsDataURL(file);
                    }
                });
            });
        `;
        return { html, js, css };
    }
    
    _handle_file_upload(context) {
        const { pConfig, wrapper } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        const html = `
            ${wrapper.startDiv}
            <div id="dropzone_${pConfig.field}${pConfig.numbering}" class="dropzone">
                <div class="dz-message" data-dz-message><span>Jatuhkan file di sini atau klik untuk mengunggah.</span></div>
            </div>
            ${wrapper.endDiv}
        `;
        const js = `
            Dropzone.autoDiscover = false;
            $(document).ready(function() {
                new Dropzone("#dropzone_${pConfig.field}${pConfig.numbering}", {
                    url: "/file-upload-handler", // GANTI DENGAN URL UPLOAD ANDA
                    paramName: "${name}", // Nama field untuk server
                    addRemoveLinks: true,
                    // Opsi lain bisa ditambahkan di sini
                });
            });
        `;
        return { html, js, css: '' };
    }

    _handle_editor_code(context) {
        const { pConfig, value, wrapper, inputInline } = context;
        const name = `${pConfig.prefixName}${pConfig.field}${pConfig.suffixName}`;
        // Escape HTML untuk ditampilkan di dalam div Ace Editor
        const escapedValue = (value || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
        const html = `
            ${wrapper.startDiv}
            <div id="editor_${pConfig.field}${pConfig.numbering}" style="height: 300px; border: 1px solid #ccc;">${escapedValue}</div>
            <textarea name="${name}" id="textarea_${pConfig.field}${pConfig.numbering}" style="display:none;" ${inputInline}>${value || ''}</textarea>
            ${wrapper.endDiv}
        `;

        const js = `
            $(document).ready(function() {
                if (typeof ace !== 'undefined') {
                    var editor = ace.edit("editor_${pConfig.field}${pConfig.numbering}");
                    var textarea = $('#textarea_${pConfig.field}${pConfig.numbering}');
                    editor.setTheme("ace/theme/monokai");
                    editor.session.setMode("ace/mode/php");
                    
                    editor.session.on('change', function(){
                        textarea.val(editor.getSession().getValue());
                    });
                } else {
                    console.error('ACE Editor library not found.');
                }
            });
        `;
        return { html, js, css:'' };
    }
}