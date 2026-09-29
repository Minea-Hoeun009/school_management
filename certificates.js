// =========================================================================
// ឯកសារ js/certificates.js - ម៉ាស៊ីនផលិតប័ណ្ណសរសើរ (Advanced Certificate Studio)
// =========================================================================

window.currentCertBg = "";
let activeCertEl = null;
let isCertDragging = false;
let certStartX, certStartY, certInitialX, certInitialY;
let currentRankedStudents = []; 

// State សម្រាប់គ្រប់គ្រងទម្រង់ប័ណ្ណ
window.certState = {
    orientation: 'landscape',
    borderStyle: 'solid',
    borderColor: '#d97706',
    borderWidth: 12,
    watermarkOpacity: 0.1,
    zoom: 85,
    topCount: 5 // Default Print Top 5
};

function toKhmerNum(str) {
    if (!str) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
}

function formatKhmerDate(dateString) {
    if (!dateString) return '...';
    let cleanDate = String(dateString).split('T')[0];
    let day, month, year;
    if (cleanDate.includes('-')) {
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4) { [year, month, day] = parts; }
            else { [day, month, year] = parts; }
        }
    } else if (cleanDate.includes('/')) {
        const parts = cleanDate.split('/');
        if (parts.length === 3) { [day, month, year] = parts; }
    } else {
        return cleanDate;
    }
    const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    return `${toKhmerNum(day)} ខែ${khmerMonths[parseInt(month, 10)-1] || month} ឆ្នាំ${toKhmerNum(year)}`;
}

// ---------------------------------------------------------
// ១. មុខងារគ្រប់គ្រងផ្ទាំងទូទៅ (Studio Layout & UI)
// ---------------------------------------------------------
window.updateCertPeriodDropdown = function() {
    const type = document.getElementById("certPeriodType")?.value;
    const valSelect = document.getElementById("certPeriodValue");
    if (!valSelect) return;
  
    if (type === "monthly") {
        valSelect.innerHTML = `
            <option value="មករា" selected>ខែ មករា</option> <option value="កុម្ភៈ">ខែ កុម្ភៈ</option>
            <option value="មីនា">ខែ មីនា</option> <option value="មេសា">ខែ មេសា</option>
            <option value="ឧសភា">ខែ ឧសភា</option> <option value="មិថុនា">ខែ មិថុនា</option>
            <option value="កក្កដា">ខែ កក្កដា</option> <option value="សីហា">ខែ សីហា</option>
            <option value="កញ្ញា">ខែ កញ្ញា</option> <option value="តុលា">ខែ តុលា</option>
            <option value="វិច្ឆិកា">ខែ វិច្ឆិកា</option> <option value="ធ្នូ">ខែ ធ្នូ</option>
        `;
    } else if (type === "semester") {
        valSelect.innerHTML = `<option value="ឆមាសទី១" selected>ឆមាសទី១</option><option value="ឆមាសទី២">ឆមាសទី២</option>`;
    } else if (type === "annual") {
        valSelect.innerHTML = `<option value="ប្រចាំឆ្នាំ" selected>លទ្ធផលប្រចាំឆ្នាំ</option>`;
    }
    
    if (typeof window.fetchAndGenerateCertificate === "function") {
        window.fetchAndGenerateCertificate();
    }
};

window.changeCertFrame = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.currentCertBg = e.target.result;
            window.applyCertStyles();
        };
        reader.readAsDataURL(file);
    }
};

window.loadCertificatesView = async function() {
    const container = document.getElementById("certificatesContainer") || document.getElementById("mainContentArea");
    if (!container) return;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const gradeFull = sInfo.teacher_level && sInfo.teacher_room ? `${sInfo.teacher_level} ${sInfo.teacher_room}` : "ថ្នាក់រៀនរបស់ខ្ញុំ";

    container.className = "flex flex-col flex-1 w-full h-full bg-[#f1f5f9] transition duration-300 min-h-0 overflow-hidden";
    container.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Kantumruy+Pro:wght@400;700&family=Moul&family=Siemreap&display=swap');
        .font-battambang { font-family: 'Battambang', sans-serif !important; }
        .font-kantumruy { font-family: 'Kantumruy Pro', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .range-slider { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 5px; background: #e2e8f0; outline: none; }
        .range-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #f59e0b; cursor: pointer; }
      </style>

      <!-- 🟢 របារខាងលើ (Top Header Bar) 🟢 -->
      <div class="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-4 z-40 shrink-0 shadow-sm">
         <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl flex items-center justify-center text-xl shadow-sm"><i class="fa-solid fa-award"></i></div>
            <div>
               <h2 class="text-sm md:text-base font-black text-slate-800 font-moul leading-tight">ស្ទូឌីយោរៀបចំប័ណ្ណសរសើរ</h2>
               <p class="text-[11px] text-slate-500 font-bold mt-0.5">ថ្នាក់រៀន៖ <span class="text-indigo-600">${gradeFull}</span></p>
            </div>
         </div>
         
         <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div class="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shadow-sm text-xs font-bold w-full sm:w-auto">
               <select id="certPeriodType" onchange="window.updateCertPeriodDropdown()" class="bg-transparent text-slate-700 outline-none cursor-pointer p-1">
                 <option value="monthly" selected>ប្រចាំខែ</option>
                 <option value="semester">ប្រចាំឆមាស</option>
                 <option value="annual">ប្រចាំឆ្នាំ</option>
               </select>
               <span class="text-slate-300 mx-1">|</span>
               <select id="certPeriodValue" onchange="window.fetchAndGenerateCertificate()" class="bg-transparent text-indigo-700 outline-none cursor-pointer p-1"></select>
            </div>
            
            <button type="button" onclick="window.fetchAndGenerateCertificate()" class="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-black text-white rounded-lg text-xs font-bold shadow-md transition flex items-center justify-center gap-2">
               <i class="fa-solid fa-rotate-right"></i> ទាញទិន្នន័យ
            </button>
            
            <div class="flex items-center bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 shadow-sm text-xs font-bold">
               <span class="text-amber-700 mr-1 hidden sm:inline">បោះពុម្ព៖</span>
               <select id="certTopCount" onchange="window.certState.topCount = parseInt(this.value);" class="bg-transparent text-amber-800 outline-none cursor-pointer p-1">
                 <option value="1">Top 1</option>
                 <option value="3">Top 3</option>
                 <option value="5" selected>Top 5</option>
                 <option value="10">Top 10</option>
               </select>
            </div>

            <button type="button" onclick="window.printAllCertificates()" class="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center justify-center gap-2">
               <i class="fa-solid fa-print"></i> Print
            </button>
         </div>
      </div>

      <!-- 🟢 ផ្ទៃការងារមេ (Main Studio Area Split Layout) 🟢 -->
      <div class="flex flex-col md:flex-row flex-1 w-full h-full overflow-hidden relative">
         
         <!-- របារឧបករណ៍ Canva Floating -->
         <div id="canvaToolbar" class="hidden absolute z-[200] bg-slate-900/95 text-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-slate-700 p-1.5 flex flex-wrap items-center gap-1 transition-all">
             <select id="canvaFontSelector" onchange="window.changeElementFont(this.value)" class="text-[11px] font-bold text-slate-200 bg-slate-800 border border-slate-600 rounded p-1 outline-none cursor-pointer mr-1">
                 <option value="font-moul" class="font-moul">Moul (ចំណងជើង)</option>
                 <option value="font-siemreap" class="font-siemreap">Siemreap (អត្ថបទ)</option>
                 <option value="font-battambang" class="font-battambang">Battambang</option>
             </select>
             <div class="relative flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-700 transition overflow-hidden tooltip" title="ពណ៌អក្សរ">
                 <input type="color" id="canvaColorPicker" oninput="window.changeElementColor(this.value)" class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 opacity-0">
                 <div id="colorIndicator" class="w-4 h-4 rounded-full border border-white pointer-events-none" style="background-color: #000;"></div>
             </div>
             <div class="w-px h-5 bg-slate-700 mx-0.5"></div>
             <button onclick="window.changeElementSize(1)" class="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-white font-bold" title="ពង្រីក">+</button>
             <button onclick="window.changeElementSize(-1)" class="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-white font-bold" title="បង្រួម">-</button>
             <button onclick="window.toggleElementBold()" class="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-white font-bold font-serif" title="អក្សរដិត">B</button>
             <div class="w-px h-5 bg-slate-700 mx-0.5"></div>
             <button onclick="window.deleteActiveElement()" class="w-7 h-7 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition"><i class="fa-solid fa-trash text-[10px]"></i></button>
             <button onclick="window.closeCanvaToolbar()" class="w-7 h-7 md:hidden flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition"><i class="fa-solid fa-xmark"></i></button>
         </div>

         <!-- ផ្នែកខាងឆ្វេង៖ ឧបករណ៍ (Tools Sidebar) -->
         <div class="w-full md:w-[300px] lg:w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 h-48 md:h-full overflow-y-auto custom-scrollbar font-siemreap shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] order-2 md:order-1">
            
            <div class="flex items-center border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
               <button onclick="window.switchStudioTab('design')" id="stab-design" class="flex-1 py-3 text-[11px] font-bold text-indigo-600 border-b-2 border-indigo-600 bg-white transition flex flex-col items-center gap-1"><i class="fa-solid fa-palette text-sm"></i> ស៊ុម & ផ្ទៃ</button>
               <button onclick="window.switchStudioTab('content')" id="stab-content" class="flex-1 py-3 text-[11px] font-bold text-slate-500 border-b-2 border-transparent hover:text-indigo-600 transition flex flex-col items-center gap-1"><i class="fa-solid fa-t text-sm"></i> ធាតុបន្ថែម</button>
            </div>

            <!-- Tab 1: Design (ស៊ុម & ផ្ទៃ) -->
            <div id="studioTabContent-design" class="p-4 space-y-5 block">
               
               <div>
                  <label class="block text-xs font-bold text-slate-700 mb-2">ទិសដៅក្រដាស (Orientation)</label>
                  <div class="grid grid-cols-2 gap-2">
                     <button onclick="window.setCertOrientation('landscape')" id="btnOriLand" class="py-2 px-3 bg-amber-50 text-amber-700 border-2 border-amber-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition"><i class="fa-regular fa-rectangle-list"></i> A4 ផ្តេក</button>
                     <button onclick="window.setCertOrientation('portrait')" id="btnOriPort" class="py-2 px-3 bg-white text-slate-600 border-2 border-slate-200 hover:border-amber-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition"><i class="fa-regular fa-file-lines"></i> A4 បញ្ឈរ</button>
                  </div>
               </div>

               <div class="h-px bg-slate-100 w-full"></div>

               <div>
                  <label class="block text-xs font-bold text-slate-700 mb-2">ម៉ូដស៊ុមជុំវិញ (Border Style)</label>
                  <div class="grid grid-cols-2 gap-2">
                     <button onclick="window.setCertBorder('solid')" id="btnBorderSolid" class="py-2 border-2 border-indigo-500 bg-indigo-50 rounded-lg text-[11px] font-bold text-slate-700 flex items-center justify-center gap-2"><div class="w-4 h-4 border-[3px] border-slate-800"></div> បន្ទាត់ត្រង់</button>
                     <button onclick="window.setCertBorder('double')" id="btnBorderDouble" class="py-2 border border-slate-200 hover:border-indigo-300 bg-white rounded-lg text-[11px] font-bold text-slate-700 flex items-center justify-center gap-2"><div class="w-4 h-4 border-[3px] border-double border-slate-800"></div> បន្ទាត់ពីរជាន់</button>
                     <button onclick="window.setCertBorder('dashed')" id="btnBorderDashed" class="py-2 border border-slate-200 hover:border-indigo-300 bg-white rounded-lg text-[11px] font-bold text-slate-700 flex items-center justify-center gap-2"><div class="w-4 h-4 border-2 border-dashed border-slate-800"></div> បន្ទាត់ចុចៗ</button>
                     <button onclick="window.setCertBorder('none')" id="btnBorderNone" class="py-2 border border-slate-200 hover:border-indigo-300 bg-white rounded-lg text-[11px] font-bold text-slate-700 flex items-center justify-center gap-2"><i class="fa-solid fa-ban text-slate-400"></i> គ្មានស៊ុម</button>
                  </div>
               </div>

               <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="block text-[11px] font-bold text-slate-500 mb-2">ពណ៌ស៊ុម (Color)</label>
                     <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                        <input type="color" id="ctrlBorderColor" value="${window.certState.borderColor}" oninput="window.updateCertState('borderColor', this.value)" class="w-6 h-6 rounded cursor-pointer border-0 p-0">
                        <span class="text-[10px] font-mono font-bold text-slate-600" id="lblBorderColor">${window.certState.borderColor}</span>
                     </div>
                  </div>
                  <div>
                     <label class="block text-[11px] font-bold text-slate-500 mb-2">កម្រាស់ (Size)</label>
                     <input type="range" min="0" max="30" value="${window.certState.borderWidth}" oninput="window.updateCertState('borderWidth', this.value)" class="range-slider mt-2">
                     <div class="text-right text-[10px] font-mono text-slate-500 font-bold mt-1"><span id="lblBorderWidth">${window.certState.borderWidth}</span>px</div>
                  </div>
               </div>

               <div class="h-px bg-slate-100 w-full"></div>

               <div>
                  <div class="flex justify-between items-center mb-2">
                     <label class="block text-xs font-bold text-slate-700">ផ្ទៃខាងក្រោយ (BG Image)</label>
                     <label class="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded cursor-pointer transition font-bold">
                        <i class="fa-solid fa-upload"></i> Upload <input type="file" accept="image/*" class="hidden" onchange="window.changeCertFrame(event)">
                     </label>
                  </div>
                  <div class="flex items-center gap-2 mb-4">
                     <button onclick="window.clearCertBg()" class="px-3 py-1.5 bg-rose-50 text-rose-600 rounded border border-rose-200 text-[10px] font-bold hover:bg-rose-100 w-full">លុបផ្ទៃខាងក្រោយ (Clear)</button>
                  </div>
                  
                  <label class="block text-[11px] font-bold text-slate-500 mb-2">កម្រិតព្រាលឡូហ្គោលិច (Watermark)</label>
                  <input type="range" min="0" max="100" value="${window.certState.watermarkOpacity * 100}" oninput="window.updateCertState('watermarkOpacity', this.value/100)" class="range-slider">
                  <div class="text-right text-[10px] font-mono text-slate-500 font-bold mt-1"><span id="lblWatermarkOp">${window.certState.watermarkOpacity * 100}</span>%</div>
               </div>
            </div>

            <!-- Tab 2: Content (អត្ថបទ & ត្រា) -->
            <div id="studioTabContent-content" class="p-4 space-y-5 hidden">
               <div>
                  <label class="block text-xs font-bold text-slate-700 mb-3">បន្ថែមធាតុថ្មីលើប័ណ្ណសរសើរ</label>
                  <div class="grid grid-cols-2 gap-2 text-[11px]">
                     <button type="button" onclick="window.addCustomText()" class="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold transition flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-t"></i> បន្ថែមអក្សរ
                     </button>
                     <label class="py-2.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer m-0">
                        <i class="fa-solid fa-stamp"></i> ត្រា / ហត្ថលេខា
                        <input type="file" accept="image/*" class="hidden" onchange="window.addCustomImage(event, 'seal')">
                     </label>
                     <label class="py-2.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer m-0">
                        <i class="fa-solid fa-shield-cat"></i> ប្ដូរឡូហ្គោ
                        <input type="file" accept="image/*" class="hidden" onchange="window.addCustomImage(event, 'logo')">
                     </label>
                     <button type="button" onclick="window.addCustomSticker('🏆')" class="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-bold transition flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-trophy"></i> និមិត្តសញ្ញា 🏆
                     </button>
                  </div>
               </div>
               
               <div class="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-[11px] text-blue-800 leading-relaxed mt-4">
                  <b>គន្លឹះ៖</b> លោកគ្រូអ្នកគ្រូអាចចុចលើអត្ថបទណាមួយនៅលើប័ណ្ណ ដើម្បីកែប្រែទំហំ ពណ៌ និងប្តូរពុម្ពអក្សរ ហើយអាចអូសវាទៅកាន់ទីតាំងដែលចង់បានដោយសេរី។
               </div>
            </div>

         </div>

         <!-- ផ្នែកខាងស្តាំ៖ ផ្ទាំងបង្ហាញ (Preview Area) -->
         <div class="flex-1 relative flex flex-col overflow-hidden order-1 md:order-2 bg-slate-300/50">
            
            <!-- Zoom Controls -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 no-print">
               <button onclick="window.setCertZoom(60)" class="text-[10px] font-bold text-slate-600 hover:text-indigo-600 px-1">Fit</button>
               <div class="w-px h-3 bg-slate-300"></div>
               <button onclick="window.setCertZoom(75)" class="text-[10px] font-bold text-slate-600 hover:text-indigo-600 px-1">75%</button>
               <button onclick="window.setCertZoom(85)" class="text-[10px] font-bold text-slate-600 hover:text-indigo-600 px-1">85%</button>
               <button onclick="window.setCertZoom(100)" class="text-[10px] font-bold text-slate-600 hover:text-indigo-600 px-1">100%</button>
            </div>

            <!-- Canvas Container -->
            <div class="flex-1 overflow-auto custom-scrollbar flex justify-center items-start p-4 md:p-8" id="certificatePrintWrapper">
               <div id="certificatePrintArea" class="transition-transform duration-300 transform-origin-top-center shadow-2xl">
                  <div class="text-center text-slate-500 font-bold mt-32 flex flex-col items-center bg-white p-10 rounded-3xl border border-slate-200">
                     <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl text-slate-300 mb-4 shadow-inner"><i class="fa-solid fa-award"></i></div>
                     <p class="text-base">សូមចុចប៊ូតុង "ទាញទិន្នន័យ" ដើម្បីបង្ហាញប័ណ្ណ!</p>
                  </div>
               </div>
            </div>
            
         </div>

      </div>
    `;
    
    window.updateCertPeriodDropdown();
    window.initCertCanvaEngine(); 
};

// ---------------------------------------------------------
// ២. មុខងារបញ្ជា UI របស់ Studio
// ---------------------------------------------------------
window.switchStudioTab = function(tab) {
    const tabs = ['design', 'content'];
    tabs.forEach(t => {
        const btn = document.getElementById(`stab-${t}`);
        const content = document.getElementById(`studioTabContent-${t}`);
        if(btn) btn.className = `flex-1 py-3 text-[11px] font-bold border-b-2 transition flex flex-col items-center gap-1 ${t === tab ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-slate-500 border-transparent hover:text-indigo-600'}`;
        if(content) content.style.display = t === tab ? 'block' : 'none';
    });
};

window.setCertOrientation = function(ori) {
    window.certState.orientation = ori;
    const btnL = document.getElementById('btnOriLand');
    const btnP = document.getElementById('btnOriPort');
    
    if (ori === 'landscape') {
        if(btnL) btnL.className = "py-2 px-3 bg-amber-50 text-amber-700 border-2 border-amber-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition";
        if(btnP) btnP.className = "py-2 px-3 bg-white text-slate-600 border-2 border-slate-200 hover:border-amber-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition";
    } else {
        if(btnP) btnP.className = "py-2 px-3 bg-amber-50 text-amber-700 border-2 border-amber-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition";
        if(btnL) btnL.className = "py-2 px-3 bg-white text-slate-600 border-2 border-slate-200 hover:border-amber-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition";
    }
    window.applyCertStyles();
};

window.setCertBorder = function(style) {
    window.certState.borderStyle = style;
    const styles = ['solid', 'dashed', 'double', 'none'];
    styles.forEach(s => {
        const btn = document.getElementById(`btnBorder${s.charAt(0).toUpperCase() + s.slice(1)}`);
        if(btn) {
            if(s === style) btn.className = `py-2 border-2 border-indigo-500 bg-indigo-50 rounded-lg text-[11px] font-bold text-slate-700 flex items-center justify-center gap-2`;
            else btn.className = `py-2 border border-slate-200 hover:border-indigo-300 bg-white rounded-lg text-[11px] font-bold text-slate-700 flex items-center justify-center gap-2`;
        }
    });
    window.applyCertStyles();
};

window.updateCertState = function(key, val) {
    window.certState[key] = val;
    if (key === 'borderColor') document.getElementById('lblBorderColor').innerText = val;
    if (key === 'borderWidth') document.getElementById('lblBorderWidth').innerText = val;
    if (key === 'watermarkOpacity') document.getElementById('lblWatermarkOp').innerText = Math.round(val * 100);
    window.applyCertStyles();
};

window.clearCertBg = function() {
    window.currentCertBg = "";
    window.applyCertStyles();
};

window.setCertZoom = function(percent) {
    window.certState.zoom = percent;
    const area = document.getElementById("certificatePrintArea");
    if(area) area.style.transform = `scale(${percent / 100})`;
};

// ---------------------------------------------------------
// ៣. មុខងារអនុវត្ត Style (Real-time Preview Apply)
// ---------------------------------------------------------
window.applyCertStyles = function() {
    const certCard = document.getElementById('mainCertPreviewCard');
    if (!certCard) return;

    if (window.certState.orientation === 'landscape') {
        certCard.style.width = '297mm';
        certCard.style.height = '210mm';
    } else {
        certCard.style.width = '210mm';
        certCard.style.height = '297mm';
    }

    const borderWrapper = document.getElementById('certBorderWrapper');
    if (borderWrapper) {
        borderWrapper.style.borderStyle = window.certState.borderStyle;
        borderWrapper.style.borderColor = window.certState.borderColor;
        borderWrapper.style.borderWidth = window.certState.borderStyle === 'none' ? '0px' : `${window.certState.borderWidth}px`;
    }

    const bgImg = document.getElementById('certBgImage');
    if (bgImg) {
        bgImg.src = window.currentCertBg;
        bgImg.style.display = window.currentCertBg ? 'block' : 'none';
    }

    const watermark = document.getElementById('certWatermark');
    if (watermark) {
        watermark.style.opacity = window.certState.watermarkOpacity;
    }
};

// ---------------------------------------------------------
// ៤. មុខងារទាញទិន្នន័យ និងរៀបចំណាត់ថ្នាក់
// ---------------------------------------------------------
window.fetchAndGenerateCertificate = async function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const level = sInfo.teacher_level || "ថ្នាក់ទី ២";
    const room = sInfo.teacher_room || "«ខ»";
    const grade = `${level} ${room}`.trim();

    const periodType = document.getElementById("certPeriodType")?.value || "monthly";
    const periodVal = document.getElementById("certPeriodValue")?.value || "មករា";

    const container = document.getElementById("certificatePrintArea");
    if (!container) return;
    
    // បង្ហាញ Loading State
    container.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center text-amber-500 font-bold bg-white rounded-3xl p-16 shadow-sm border border-slate-200">
            <i class="fa-solid fa-circle-notch animate-spin text-5xl mb-4"></i>
            <span class="text-sm">កំពុងរៀបចំទិន្នន័យចំណាត់ថ្នាក់...</span>
        </div>`;

    try {
        let students = JSON.parse(localStorage.getItem('academic_students')) || [];
        let cleanLevel = level.replace(/ថ្នាក់ទី|\s+/g, ''); 
        let cleanRoom = room.replace(/[«»\s]/g, ''); 
        let expectedFull = cleanLevel + cleanRoom; 

        let classStudents = students.filter(s => {
            if (s.status === "Dropped") return false;
            let sGradeStr = String(s.grade || "") + String(s.room || "");
            let cleanSGrade = sGradeStr.replace(/ថ្នាក់ទី|[«»\s]/g, '');
            return cleanSGrade === expectedFull || cleanSGrade.includes(expectedFull) || cleanSGrade.startsWith(cleanLevel);
        });

        if (classStudents.length === 0) {
            return container.innerHTML = `<div class="bg-rose-50 text-rose-600 p-8 rounded-3xl font-bold text-sm my-10 border border-rose-200 shadow-sm flex flex-col items-center"><i class="fa-solid fa-folder-open text-4xl mb-4 text-rose-300"></i>❌ រកមិនឃើញទិន្នន័យសិស្សក្នុងថ្នាក់ [${grade}] ទេ!</div>`;
        }

        let allScores = JSON.parse(localStorage.getItem('academic_scores')) || [];
        let periodScores = allScores.filter(s => {
            let scGradeStr = String(s.grade || "") + String(s.room || "");
            let cleanScGrade = scGradeStr.replace(/ថ្នាក់ទី|[«»\s]/g, '');
            let isSameGrade = cleanScGrade === expectedFull || cleanScGrade.includes(expectedFull);
            let isSameType = s.period_type === periodType;
            let isSameMonth = periodType === "annual" ? true : (s.period_value === periodVal || s.month === periodVal);
            return isSameGrade && isSameType && isSameMonth;
        });

        let rankedStudents = classStudents.map(stu => {
            const sc = periodScores.find(s => String(s.student_id) === String(stu.id)) || {};
            let avg = parseFloat(sc.average || sc.sem_avg || sc.annual_avg || sc.total_score || sc.total) || 0;
            return { ...stu, avg: avg };
        });

        rankedStudents = rankedStudents.filter(s => s.avg > 0).sort((a, b) => b.avg - a.avg);

        let currentRank = 1, actualPosition = 1, previousAvg = null;
        rankedStudents.forEach(item => {
            if (previousAvg !== null && item.avg < previousAvg) currentRank = actualPosition;
            item.rank = currentRank; 
            previousAvg = item.avg; 
            actualPosition++;
        });

        currentRankedStudents = rankedStudents; // រក្សាទុកសម្រាប់ Print Top N
        let periodText = periodType === "annual" ? "ប្រចាំឆ្នាំ" : periodVal;

        if (currentRankedStudents.length === 0) {
            return container.innerHTML = `<div class="bg-amber-50 text-amber-700 p-8 rounded-3xl font-bold text-sm my-10 border border-amber-200 shadow-sm flex flex-col items-center text-center"><i class="fa-solid fa-triangle-exclamation text-4xl mb-4 text-amber-300"></i>⚠️ សិស្សក្នុងថ្នាក់ [${grade}] មិនទាន់មានទិន្នន័យពិន្ទុសម្រាប់ [${periodText}] ទេ!</div>`;
        }

        // បង្ហាញតែសិស្សទី១ (Top 1) នៅលើ Preview
        const previewStudent = currentRankedStudents[0];
        container.innerHTML = generateDynamicCertificateHtml(previewStudent, grade, periodText, false);
        
        // ធានាថា Canvas Scale បានអនុវត្ត
        window.setCertZoom(window.certState.zoom);

    } catch (err) {
        container.innerHTML = `<div class="text-rose-500 font-bold text-sm my-10 bg-rose-50 p-6 rounded-2xl border border-rose-200">⚠️ មានបញ្ហា! សូមពិនិត្យកុងសូល។</div>`;
        console.error("Cert Error:", err);
    }
};

// ---------------------------------------------------------
// ៥. បង្កើត HTML ប័ណ្ណសរសើរឆ្លាតវៃ (Responsive to Settings)
// ---------------------------------------------------------
function generateDynamicCertificateHtml(student, grade, periodText, isPrintMode = false) {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    const khmerAcademicYear = toKhmerNum(sInfo.academic_year || "២០២៦-២០២៧");
    
    const now = new Date();
    const d = window.toKhmerNum(now.getDate().toString());
    const m = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"][now.getMonth()];
    const y = window.toKhmerNum(now.getFullYear().toString());
    const issueDateText = `ថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;
    
    const moeysLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Cambodia_Ministry_of_Education_Youth_and_Sport_Logo.svg/1024px-Cambodia_Ministry_of_Education_Youth_and_Sport_Logo.svg.png";

    let rankNumKhmer = toKhmerNum(student.rank.toString());
    let formattedDOB = student.dob ? formatKhmerDate(student.dob) : ".........."; 

    // ដោះស្រាយទំហំ (Orientation)
    let w = '297mm', h = '210mm';
    if (window.certState.orientation === 'portrait') { w = '210mm'; h = '297mm'; }

    // HTML តួខ្លួនប័ណ្ណ
    return `
      <div id="${isPrintMode ? '' : 'mainCertPreviewCard'}" class="cert-preview-card bg-white relative overflow-hidden flex-shrink-0 box-border print:shadow-none print:break-after-page mx-auto" style="width: ${w}; height: ${h}; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
         
         <img id="${isPrintMode ? '' : 'certBgImage'}" src="${window.currentCertBg}" class="absolute inset-0 w-full h-full object-cover z-0" style="display: ${window.currentCertBg ? 'block' : 'none'};">
         
         <div id="${isPrintMode ? '' : 'certBorderWrapper'}" class="absolute inset-5 z-10 pointer-events-none" style="border-style: ${window.certState.borderStyle}; border-color: ${window.certState.borderColor}; border-width: ${window.certState.borderStyle==='none'?'0px':window.certState.borderWidth+'px'};"></div>
         
         <div class="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
            <img id="${isPrintMode ? '' : 'certWatermark'}" src="${moeysLogoUrl}" class="h-2/3 object-contain transition-opacity" style="opacity: ${window.certState.watermarkOpacity};">
         </div>
         
         <div class="relative z-20 w-full h-full p-8 md:p-12 flex flex-col justify-between font-siemreap text-slate-800">
            
            <!-- ក្បាល (Header) -->
            <div class="flex justify-between items-start w-full">
               <div class="text-center canva-cert-el cursor-grab p-2">
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[15px] outline-none leading-relaxed tracking-wide">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាល ស្រុក${districtName}</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[16px] outline-none leading-relaxed tracking-wide">${school_name}</p>
               </div>
               <div class="text-center canva-cert-el cursor-grab p-2">
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[15px] outline-none leading-relaxed tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[16px] outline-none leading-relaxed tracking-wide">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  <div class="flex items-center justify-center gap-2 mt-1 mx-auto w-[85%] pointer-events-none">
                     <div class="h-[1.5px] flex-1 bg-amber-600"></div><span class="text-amber-600 text-[11px] mb-[2px]">❖ ❖ ❖</span><div class="h-[1.5px] flex-1 bg-amber-600"></div>
                  </div>
               </div>
            </div>

            <!-- តួអត្ថបទ (Body) -->
            <div class="text-center w-full mt-2">
               <div class="canva-cert-el cursor-grab p-2 w-full inline-block">
                  <h1 contenteditable="true" spellcheck="false" class="font-moul text-4xl md:text-5xl tracking-[0.1em] outline-none mb-4" style="color: ${window.certState.borderColor};">ប័ណ្ណសរសើរ</h1>
                  <h2 contenteditable="true" spellcheck="false" class="font-moul text-lg md:text-xl outline-none">នាយកសាលា ${school_name}</h2>
               </div>
               <div class="canva-cert-el cursor-grab p-2 w-full mt-4 inline-block">
                  <div contenteditable="true" spellcheck="false" class="font-siemreap text-[16px] md:text-[18px] leading-[2.2] md:leading-[2.5] text-center max-w-[850px] mx-auto px-4 outline-none">
                     សូមសរសើរចំពោះសិស្សឈ្មោះ <span class="font-moul text-xl md:text-2xl mx-2 border-b border-dotted border-slate-400 pb-0.5 stu-name-display">${student.name || 'ឈ្មោះសិស្ស'}</span> 
                     ភេទ <span class="font-bold stu-gender-display">${student.gender || 'ប្រុស'}</span> កើតថ្ងៃទី <span class="font-bold stu-dob-display">${formattedDOB}</span><br>
                     រៀនថ្នាក់ទី <span class="font-bold text-lg md:text-xl mx-2 stu-grade-display" style="color: ${window.certState.borderColor};">${grade}</span> 
                     ដែលទទួលបានចំណាត់ថ្នាក់លេខ <span class="font-bold text-2xl md:text-3xl mx-2 stu-rank-display" style="color: ${window.certState.borderColor};">${rankNumKhmer}</span> 
                     ប្រចាំ <span class="font-bold stu-period-display">${periodText}</span> ឆ្នាំសិក្សា <span class="font-bold stu-year-display">${khmerAcademicYear}</span> ។<br>
                     ប័ណ្ណសរសើរនេះប្រគល់ជូនសាមីខ្លួនប្រើប្រាស់តាមការដែលអាចប្រើបាន ។
                  </div>
               </div>
            </div>
            
            <!-- ហត្ថលេខា (Footer) -->
            <div class="flex justify-end pr-10 md:pr-16 pb-6 mt-4 w-full">
               <div class="text-center text-sm font-bold canva-cert-el cursor-grab p-3 inline-block">
                  <p contenteditable="true" spellcheck="false" class="mb-2 outline-none">ធ្វើនៅ...................., ${issueDateText}</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul mt-6 text-lg outline-none">នាយកសាលា</p>
                  <div class="h-20 border-b border-dashed border-slate-500 mt-2 min-w-[150px]"></div>
               </div>
            </div>

         </div>
      </div>
    `;
}

// ---------------------------------------------------------
// ៦. Canva Engine (Drag/Drop & Toolbar)
// ---------------------------------------------------------
window.initCertCanvaEngine = function() {
    const startDrag = function(e) {
        if (e.target.tagName.toLowerCase() === 'input' || (e.target.contentEditable === 'true' && document.activeElement === e.target)) return;
        const targetEl = e.target.closest('.canva-cert-el');
        if (targetEl) {
            isCertDragging = true;
            activeCertEl = targetEl;
            
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

            let currentTransform = activeCertEl.style.transform;
            certInitialX = 0; certInitialY = 0;
            
            if (currentTransform && currentTransform.includes("translate")) {
                const match = currentTransform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
                if (match) { certInitialX = parseFloat(match[1]); certInitialY = parseFloat(match[2]); }
            }
            
            certStartX = clientX; 
            certStartY = clientY;
            activeCertEl.style.cursor = 'grabbing';
        }
    };

    const doDrag = function(e) {
        if (isCertDragging && activeCertEl) {
            e.preventDefault(); 
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            // គិតពី Zoom Factor 
            const scale = window.certState.zoom / 100;
            const dx = (clientX - certStartX) / scale;
            const dy = (clientY - certStartY) / scale;

            activeCertEl.style.transform = `translate(${certInitialX + dx}px, ${certInitialY + dy}px)`;
            
            const toolbar = document.getElementById('canvaToolbar');
            if(toolbar) toolbar.classList.add('hidden');
        }
    };

    const endDrag = function(e) {
        isCertDragging = false;
        if (activeCertEl) {
            activeCertEl.style.cursor = 'grab';
            window.showCanvaToolbar(activeCertEl, e);
        }
    };

    const handleClick = function(e) {
        if (e.target.closest('.canva-cert-el')) {
            let activeEl = e.target.closest('.canva-cert-el'); 
            activeCertEl = activeEl;
            window.showCanvaToolbar(activeEl, e);
            
            document.querySelectorAll('.canva-cert-el').forEach(el => el.classList.remove('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10'));
            activeEl.classList.add('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10');
            
            const colorPicker = document.getElementById('canvaColorPicker');
            const colorInd = document.getElementById('colorIndicator');
            if(colorPicker && colorInd) {
                const textTarget = activeEl.querySelector('[contenteditable="true"]') || activeEl;
                const rgb = window.getComputedStyle(textTarget).color;
                const hex = rgbToHex(rgb) || '#000000';
                colorPicker.value = hex;
                colorInd.style.backgroundColor = hex;
            }
        } else if (!e.target.closest('#canvaToolbar') && !e.target.closest('.no-close-canva') && !isCertDragging) {
            window.closeCanvaToolbar();
        }
    };

    document.removeEventListener('mousedown', startDrag);
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchstart', startDrag);
    document.removeEventListener('touchmove', doDrag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('click', handleClick);

    document.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', doDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('click', handleClick);
};

window.showCanvaToolbar = function(el, event) {
    const toolbar = document.getElementById('canvaToolbar');
    if(!toolbar) return;
    toolbar.classList.remove('hidden');
    
    const rect = el.getBoundingClientRect();
    let topPos = rect.top - 50;
    if (topPos < 10) topPos = rect.bottom + 10;
    let leftPos = rect.left;
    if (leftPos < 10) leftPos = 10;
    
    toolbar.style.top = `${topPos}px`;
    toolbar.style.left = `${leftPos}px`;
    
    const innerEl = el.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"]');
    if(innerEl) {
        const fontSelector = document.getElementById('canvaFontSelector');
        if(innerEl.classList.contains('font-moul')) fontSelector.value = 'font-moul';
        else if(innerEl.classList.contains('font-battambang')) fontSelector.value = 'font-battambang';
        else if(innerEl.classList.contains('font-kantumruy')) fontSelector.value = 'font-kantumruy';
        else fontSelector.value = 'font-siemreap';
    }
};

window.closeCanvaToolbar = function() {
    const toolbar = document.getElementById('canvaToolbar');
    if(toolbar) toolbar.classList.add('hidden');
    if(activeCertEl) activeCertEl.classList.remove('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10');
    activeCertEl = null;
};

window.changeElementFont = function(fontClass) {
    if(!activeCertEl) return;
    const innerEl = activeCertEl.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"]');
    if(innerEl) {
        innerEl.classList.remove('font-moul', 'font-siemreap', 'font-battambang', 'font-kantumruy');
        innerEl.classList.add(fontClass);
    }
};

window.changeElementColor = function(colorHex) {
    if(!activeCertEl) return;
    const innerEl = activeCertEl.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"]');
    if(innerEl) {
        innerEl.style.color = colorHex;
        innerEl.className = innerEl.className.replace(/text-[a-z]+-\d+/g, '');
    }
    const indicator = document.getElementById('colorIndicator');
    if(indicator) indicator.style.backgroundColor = colorHex;
};

window.changeElementSize = function(step) {
    if(!activeCertEl) return;
    const innerEl = activeCertEl.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"], img');
    if(!innerEl) return;

    if (innerEl.tagName === 'IMG') {
        let currentWidth = parseInt(window.getComputedStyle(innerEl).width);
        innerEl.style.width = `${currentWidth + (step * 20)}px`;
        innerEl.className = innerEl.className.replace(/w-\d+|w-auto/g, ''); 
    } else {
        let currentSize = parseInt(window.getComputedStyle(innerEl).fontSize);
        innerEl.style.fontSize = `${currentSize + (step * 2)}px`;
        innerEl.className = innerEl.className.replace(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/g, '');
    }
};

window.toggleElementBold = function() {
    if(!activeCertEl) return;
    const innerEl = activeCertEl.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"]');
    if(!innerEl) return;
    const isBold = window.getComputedStyle(innerEl).fontWeight >= 700;
    innerEl.style.fontWeight = isBold ? 'normal' : 'bold';
};

window.deleteActiveElement = function() {
    if(!activeCertEl) return;
    activeCertEl.remove();
    window.closeCanvaToolbar();
};

function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return null;
    function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
}

window.addCustomImage = function(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const imgUrl = e.target.result;
        const previewCard = document.getElementById('mainCertPreviewCard');
        if(!previewCard) return alert("សូមចុច 'ទាញទិន្នន័យ' សិន!");

        const wrapper = document.createElement('div');
        wrapper.className = 'canva-cert-el absolute p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded z-50 inline-block';
        wrapper.style.left = type === 'logo' ? '20%' : '80%';
        wrapper.style.top = type === 'logo' ? '20%' : '80%';
        wrapper.style.transform = 'translate(-50%, -50%)';
        wrapper.style.cursor = 'grab';
        
        const img = document.createElement('img');
        img.src = imgUrl;
        img.className = type === 'seal' ? 'w-32 h-auto pointer-events-none mix-blend-multiply' : 'w-24 h-auto pointer-events-none object-contain';
        wrapper.appendChild(img);
        previewCard.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
};

window.addCustomText = function() {
    const previewCard = document.getElementById('mainCertPreviewCard');
    if(!previewCard) return alert("សូមចុច 'ទាញទិន្នន័យ' សិន!");

    const wrapper = document.createElement('div');
    wrapper.className = 'canva-cert-el absolute p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded z-50 inline-block';
    wrapper.style.left = '50%';
    wrapper.style.top = '50%';
    wrapper.style.transform = 'translate(-50%, -50%)';
    wrapper.style.cursor = 'grab';

    const textNode = document.createElement('div');
    textNode.contentEditable = "true";
    textNode.spellcheck = false;
    textNode.innerHTML = "អត្ថបទថ្មី";
    textNode.className = 'font-moul text-xl text-slate-800 outline-none drop-shadow-sm';

    wrapper.appendChild(textNode);
    previewCard.appendChild(wrapper);
};

window.addCustomSticker = function(emoji) {
    const previewCard = document.getElementById('mainCertPreviewCard');
    if(!previewCard) return alert("សូមចុច 'ទាញទិន្នន័យ' សិន!");

    const wrapper = document.createElement('div');
    wrapper.className = 'canva-cert-el absolute p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded-full z-50 inline-block cursor-grab text-[60px] drop-shadow-lg';
    wrapper.style.left = '50%';
    wrapper.style.top = '25%';
    wrapper.style.transform = 'translate(-50%, -50%)';
    wrapper.innerHTML = emoji;
    previewCard.appendChild(wrapper);
};

// ---------------------------------------------------------
// ៧. មុខងារ Print (Hidden Iframe Method for Robustness)
// ---------------------------------------------------------

function printHTMLContent(htmlContent) {
    // បង្កើត Hidden Iframe ដើម្បីកុំឱ្យ Pop-up Blocker រារាំង
    let iframe = document.getElementById('printIframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'printIframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>បោះពុម្ពប័ណ្ណសរសើរ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Kantumruy+Pro:wght@400;700&family=Moul&family=Siemreap&display=swap');
          @page { size: A4 ${window.certState.orientation}; margin: 0; }
          body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .font-moul { font-family: 'Moul', serif !important; font-weight: normal !important; }
          .font-siemreap { font-family: 'Siemreap', sans-serif !important; }
          .font-battambang { font-family: 'Battambang', sans-serif !important; }
          .font-kantumruy { font-family: 'Kantumruy Pro', sans-serif !important; }
          .print\\:break-after-page { page-break-after: always; break-after: page; margin: 0 auto; }
          .hover\\:ring-2, .hover\\:ring-dashed { border: none !important; box-shadow: none !important; }
          /* លុប Border បញ្ឆោតពេល Print */
          .cert-preview-card { box-shadow: none !important; margin: 0 !important; }
        </style>
      </head>
      <body class="font-siemreap">
        ${htmlContent}
      </body>
      </html>
    `);
    doc.close();

    // រង់ចាំឱ្យរូបភាពនិងហ្វុងលោតចេញពេញលេញមុននឹង Print
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }, 1500);
}

// បោះពុម្ពតែ១សន្លឹក (Preview លើអេក្រង់)
window.printOfficialCertificates = function() {
    const printArea = document.getElementById("certificatePrintArea");
    if (!printArea) { alert("⚠️ រកមិនឃើញប័ណ្ណសរសើរទេ!"); return; }

    window.closeCanvaToolbar();
    document.querySelectorAll('.canva-cert-el').forEach(el => el.classList.remove('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10'));

    const clonedCard = printArea.querySelector('.cert-preview-card').cloneNode(true);
    clonedCard.style.transform = "none"; 
    
    // បង្ខំឱ្យទំហំត្រូវតាម A4 ដែលបានជ្រើសរើស
    clonedCard.style.margin = "0";
    if (window.certState.orientation === 'landscape') {
        clonedCard.style.width = '297mm'; clonedCard.style.height = '210mm';
    } else {
        clonedCard.style.width = '210mm'; clonedCard.style.height = '297mm';
    }

    printHTMLContent(clonedCard.outerHTML);
};

// បោះពុម្ពច្រើនសន្លឹកតាមជម្រើស (Top N) - Cloning Engine
window.printAllCertificates = function() {
    if (currentRankedStudents.length === 0) {
        alert("⚠️ មិនមានទិន្នន័យសិស្សទេ! សូមចុច 'ទាញទិន្នន័យ' សិន។");
        return;
    }

    const topCount = parseInt(document.getElementById("certTopCount")?.value || 5);
    const targetStudents = currentRankedStudents.slice(0, topCount);

    const basePreview = document.getElementById("mainCertPreviewCard");
    if (!basePreview) {
        alert("សូមទាញយកទិន្នន័យដើម្បីបង្ហាញទម្រង់ជាមុនសិន!");
        return;
    }

    window.closeCanvaToolbar();

    let allHtml = "";
    
    // ចម្លងទម្រង់ដើមទាំងមូល ដើម្បីរក្សារាល់ Custom Text / Logo / Stamps ដែលលោកគ្រូបានរចនាបញ្ចូល
    targetStudents.forEach(stu => {
        // Clone Element មេ
        const clone = basePreview.cloneNode(true);
        clone.id = "";
        clone.style.transform = "none";
        clone.style.margin = "0";
        if (window.certState.orientation === 'landscape') {
            clone.style.width = '297mm'; clone.style.height = '210mm';
        } else {
            clone.style.width = '210mm'; clone.style.height = '297mm';
        }
        clone.classList.add("print:break-after-page");
        
        // លុប Highlight Border ផ្សេងៗ
        clone.querySelectorAll('.canva-cert-el').forEach(el => el.classList.remove('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10'));

        // 🟢 ជំនួសទិន្នន័យសិស្សម្នាក់ៗ ដោយប្រើយន្តការស្វែងរក Class ឆ្លាតវៃ 🟢
        const nameEl = clone.querySelector('.stu-name-display');
        if (nameEl) nameEl.textContent = stu.name || '';

        const genderEl = clone.querySelector('.stu-gender-display');
        if (genderEl) genderEl.textContent = stu.gender || 'ប្រុស';

        const dobEl = clone.querySelector('.stu-dob-display');
        if (dobEl) dobEl.textContent = stu.dob ? formatKhmerDate(stu.dob) : "..........";

        const rankEl = clone.querySelector('.stu-rank-display');
        if (rankEl) rankEl.textContent = toKhmerNum(stu.rank.toString());

        allHtml += clone.outerHTML;
    });

    if (typeof showToast === 'function') showToast(`រៀបចំប័ណ្ណសរសើរចំនួន ${topCount} សន្លឹក រួចរាល់! កំពុងបើកផ្ទាំងបោះពុម្ព...`);
    printHTMLContent(allHtml);
};