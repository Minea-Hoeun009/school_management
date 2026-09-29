// =========================================================================
// ឯកសារ js/library.js - ប្រព័ន្ធគ្រប់គ្រងការខ្ចី និងប្រមូលសៀវភៅសិក្សាគោល (Ultimate Edition)
// =========================================================================

window.libStudents = [];
window.libData = {}; 
window.currentLibTab = 'borrow'; // 'borrow' (ខ្ចី) ឬ 'return' (ប្រមូល)
window.libSubjects = [];
window.currentGradeFull = "";

const BORROW_STATES = ["គ្មាន", "ថ្មី", "ចាស់", "អន់"];
const RETURN_STATES = ["គ្មាន", "✔", "✘"];

// អនុគមន៍ជំនួយ
function toKhmerNum(str) {
    if (!str) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
}

function formatKhmerDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${toKhmerNum(parts[2])}/${toKhmerNum(parts[1])}/${toKhmerNum(parts[0])}`;
    }
    return dateStr;
}

// គ្រប់គ្រងមុខវិជ្ជាសៀវភៅ
window.loadLibSubjects = function() {
    const savedSettings = JSON.parse(localStorage.getItem(`lib_subjects_${window.currentGradeFull}`));
    if (savedSettings && savedSettings.length > 0) {
        window.libSubjects = savedSettings;
    } else {
        window.libSubjects = [
            { key: "khmer", name: "ភាសាខ្មែរ" },
            { key: "math", name: "គណិតវិទ្យា" },
            { key: "science", name: "វិទ្យាសាស្ត្រ" },
            { key: "social", name: "សិក្សាសង្គម" }
        ];
    }
};

window.addCustomBookColumn = function() {
    const bookName = prompt("សូមបញ្ចូលឈ្មោះមុខវិជ្ជា/សៀវភៅថ្មី ៖");
    if (bookName && bookName.trim() !== "") {
        const key = "book_" + Date.now();
        window.libSubjects.push({ key: key, name: bookName.trim() });
        localStorage.setItem(`lib_subjects_${window.currentGradeFull}`, JSON.stringify(window.libSubjects));
        window.renderLibTable();
        window.saveLibData(true);
    }
};

window.removeCustomBookColumn = function() {
    if (window.libSubjects.length <= 1) return alert("មិនអាចលុបសៀវភៅចុងក្រោយបានទេ!");
    const bookName = prompt("សូមបញ្ចូលឈ្មោះសៀវភៅដែលអ្នកចង់លុបចេញពីតារាង ៖");
    if (bookName && bookName.trim() !== "") {
        const initialLength = window.libSubjects.length;
        window.libSubjects = window.libSubjects.filter(sub => sub.name.trim().toLowerCase() !== bookName.trim().toLowerCase());
        
        if (window.libSubjects.length < initialLength) {
            localStorage.setItem(`lib_subjects_${window.currentGradeFull}`, JSON.stringify(window.libSubjects));
            window.renderLibTable();
            window.saveLibData(true);
            if (typeof showToast === 'function') showToast("✅ បានលុបជួរឈរសៀវភៅដោយជោគជ័យ!");
        } else {
            alert("រកមិនឃើញឈ្មោះសៀវភៅនេះក្នុងតារាងទេ!");
        }
    }
};

// ==========================================
// ១. Layout មេនៃកម្មវិធី (Main UI)
// ==========================================
window.loadLibraryView = async function() {
    const container = document.getElementById("libraryView") || document.getElementById("mainContentArea");
    if (!container) return;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = sInfo.teacher_room || "«ក»";
    window.currentGradeFull = `${levelStr} ${roomStr}`;
    const academicYear = sInfo.academic_year || "២០២៦-២០២៧";
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";

    window.loadLibSubjects();

    container.className = "p-1 md:p-4 transition duration-300 h-full w-full flex flex-col min-h-0 bg-slate-50";
    container.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Siemreap&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        /* Interactive Cells */
        .lib-cell { cursor: pointer; user-select: none; transition: all 0.2s; }
        .lib-cell:hover { background-color: #f1f5f9; }
        
        /* Badges */
        .badge-new { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap; }
        .badge-old { background-color: #fffbeb; color: #d97706; border: 1px solid #fde68a; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap; }
        .badge-poor { background-color: #fef2f2; color: #e11d48; border: 1px solid #fecdd3; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap; }
        .badge-none { color: #94a3b8; font-size: 11px; font-weight: bold; white-space: nowrap; }
        
        .badge-check { color: #059669; font-size: 14px; font-weight: bold; }
        .badge-cross { color: #e11d48; font-size: 14px; font-weight: bold; background-color: #fef2f2; padding: 2px 8px; border-radius: 6px; border: 1px solid #fecdd3;}
      </style>

      <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 relative rounded-3xl">
        <div class="animate-fade-in flex flex-col font-siemreap max-w-[1680px] mx-auto pb-32 px-1 md:px-4 pt-2 md:pt-4 min-h-full">
          
          <!-- 🟢 Header App Style 🟢 -->
          <div class="bg-indigo-900 text-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shrink-0 shadow-md z-20 mb-4 relative overflow-hidden">
             <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             
             <div class="flex items-center gap-3 relative z-10 w-full xl:w-auto">
                <div class="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-2xl flex justify-center items-center text-xl md:text-2xl border border-white/20 shadow-inner shrink-0">
                   <i class="fa-solid fa-book-open-reader"></i>
                </div>
                <div>
                   <h1 id="libMainTitle" class="text-base md:text-xl font-moul tracking-wide drop-shadow-sm">បញ្ជីខ្ចីសៀវភៅសិក្សាគោល</h1>
                   <p id="libSubTitle" class="text-[11px] md:text-xs text-indigo-200 mt-1 font-bold">ថ្នាក់ទី៖ <span class="text-white bg-white/20 px-2 py-0.5 rounded">${window.currentGradeFull}</span> | ឆ្នាំសិក្សា៖ ${toKhmerNum(academicYear)}</p>
                </div>
             </div>

             <!-- Tools & Tabs Selector -->
             <div class="flex flex-wrap items-center justify-start xl:justify-end gap-3 relative z-10 w-full xl:w-auto">
                
                <div class="flex bg-white/10 p-1 rounded-xl w-full sm:w-auto border border-white/20 shadow-inner">
                   <button onclick="window.switchLibTab('borrow')" id="ltab-borrow" class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all bg-white text-indigo-900 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <i class="fa-solid fa-hand-holding-hand"></i> កត់ត្រាខ្ចី
                   </button>
                   <button onclick="window.switchLibTab('return')" id="ltab-return" class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold text-indigo-100 hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <i class="fa-solid fa-box-archive"></i> កត់ត្រាសង
                   </button>
                </div>

                <div class="w-px h-8 bg-indigo-700 mx-1 hidden sm:block"></div>

                <div class="flex items-center gap-2">
                   <button onclick="window.addCustomBookColumn()" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                     <i class="fa-solid fa-plus"></i> សៀវភៅ
                   </button>
                   <button onclick="window.removeCustomBookColumn()" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                     <i class="fa-solid fa-minus"></i> សៀវភៅ
                   </button>
                </div>

             </div>
          </div>

          <!-- 🟢 Main Document Area (Printable) 🟢 -->
          <div id="libPrintArea" class="bg-white w-full rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200 print:shadow-none print:border-none print:rounded-none p-4 md:p-8 font-siemreap flex-1 flex flex-col relative overflow-hidden">
             
             <!-- Document Header (Print Only or Web Top) -->
             <div class="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div class="text-left"><br><br>
                   <p class="text-[12px] md:text-xs font-moul text-slate-800">${schoolName}</p>
                   <p class="text-[12px] md:text-xs font-bold text-slate-700 mt-1"><span class="text-rose-600 font-moul">${window.currentGradeFull}</span></p>
                </div>
                <div class="text-center">
                   <p class="font-moul text-indigo-900 text-[12px] md:text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                   <p class="font-moul text-indigo-900 text-[12px] md:text-base mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                   <div class="flex items-center justify-center gap-2 mt-1 mx-auto w-[60%] print:w-[80%]">
                      <div class="h-[1.5px] flex-1 bg-slate-800"></div><span class="text-slate-800 text-[9px]">❖</span><div class="h-[1.5px] flex-1 bg-slate-800"></div>
                   </div>
                </div>
             </div>

             <!-- Title -->
             <div class="text-center mb-6 shrink-0">
                <h2 id="libDocTitle" class="font-moul text-amber-600 text-base md:text-lg tracking-wide" style="text-shadow: 1px 1px 0px rgba(0,0,0,0.05);">បញ្ជីខ្ចីសៀវភៅសិក្សាគោល</h2>
                <p id="libDocSub" class="text-[10px] md:text-[11px] text-slate-500 font-bold mt-2 bg-slate-50 inline-block px-4 py-1.5 rounded-full border border-slate-100 no-print">ចុចលើប្រអប់មុខវិជ្ជា ដើម្បីជ្រើសរើសស្ថានភាព ៖ <span class='badge-new mx-1'>ថ្មី</span> - <span class='badge-old mx-1'>ចាស់</span> - <span class='badge-poor mx-1'>អន់</span> - <span class='badge-none mx-1'>គ្មាន</span></p>
             </div>

             <!-- Table អាច Scroll ផ្តេកបាន (Horizontal Scroll) -->
             <div class="w-full overflow-x-auto custom-scrollbar flex-1 pb-4 print:overflow-visible">
                <table class="w-max min-w-full border-collapse border border-slate-400 print:border-black text-center text-[11px] md:text-xs mx-auto table-fixed">
                   <thead class="bg-indigo-900 text-white font-moul sticky top-0 z-30 shadow-sm print:static print:shadow-none">
                      <tr id="libTableHead">
                         <!-- Rendered by JS -->
                      </tr>
                   </thead>
                   <tbody id="libTableBody" class="divide-y divide-slate-300 print:divide-black text-slate-800 font-bold">
                      <tr><td colspan="100" class="p-16 text-center"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-400 mb-3"></i><br>កំពុងរៀបចំទិន្នន័យ...</td></tr>
                   </tbody>
                </table>
             </div>

             <!-- 🟢 ស្ថិតិសង្ខេបខាងក្រោមតារាង 🟢 -->
             <div id="libSummarySection" class="mt-6 border-t border-slate-300 pt-4 font-bold text-sm text-slate-700 print:mt-4 print:pt-2"></div>

             <!-- Footer Signatures (៣ ផ្នែក) -->
             <div class="flex justify-between items-start mt-10 md:mt-12 text-[11px] md:text-xs font-bold px-2 md:px-10 print:mt-8">
                <div class="text-center">
                   <p class="mb-20">ប្រធានបណ្ណាល័យ</p>
                   <p class="font-moul text-slate-800">........................</p>
                </div>
                <div class="text-center">
                   <p class="mb-20">គ្រូទទួលបន្ទុកថ្នាក់</p>
                   <p class="font-moul text-slate-800">${sInfo.teacher_name || '.......................'}</p>
                </div>
                <div class="text-center">
                   <p class="mb-2 text-slate-600">ធ្វើនៅ...................., ថ្ងៃទី........ខែ........ឆ្នាំ២០២...</p>
                   <p class="mb-14">បានឃើញ និងឯកភាព<br>នាយកសាលា</p>
                   <p class="font-moul text-slate-800">${sInfo.principal_name || '.......................'}</p>
                </div>
             </div>

          </div>
        </div>
      </div>

      <!-- 🟢 Bottom Floating Action Bar (Responsive Grid) 🟢 -->
      <div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[600px] bg-white/90 backdrop-blur-md border border-slate-200 p-2.5 rounded-2xl grid grid-cols-3 gap-2 shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-40 no-print transition-all">
         
         <button onclick="window.saveLibData()" id="btnSaveLib" class="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-[11px] md:text-[13px] font-bold shadow-md transition flex items-center justify-center gap-1.5 transform hover:-translate-y-0.5">
            <i class="fa-solid fa-cloud-arrow-up"></i> <span class="hidden sm:inline">រក្សាទុកទិន្នន័យ</span><span class="sm:hidden">រក្សាទុក</span>
         </button>
         
         <button onclick="window.printLibraryReport()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] md:text-[13px] font-bold shadow-md transition flex items-center justify-center gap-1.5 transform hover:-translate-y-0.5">
            <i class="fa-solid fa-print"></i> <span class="hidden sm:inline">បោះពុម្ពបញ្ជី</span><span class="sm:hidden">បោះពុម្ព</span>
         </button>

         <button onclick="window.clearLibData()" class="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-[11px] md:text-[13px] font-bold transition flex items-center justify-center gap-1.5 border border-slate-200 transform hover:-translate-y-0.5">
            <i class="fa-solid fa-eraser"></i> <span class="hidden sm:inline">សម្អាតទិន្នន័យ</span><span class="sm:hidden">សម្អាត</span>
         </button>

      </div>
    `;

    await window.fetchLibraryData();
};

// ==========================================
// ២. មុខងារទាញទិន្នន័យ និងរៀបចំ UI
// ==========================================
window.fetchLibraryData = async function() {
    try {
        let allStus = JSON.parse(localStorage.getItem('academic_students')) || [];
        let cleanLevel = window.currentGradeFull.replace(/ថ្នាក់ទី|«|»|\s+/g, '');

        window.libStudents = allStus.filter(s => {
            if (s.status === "Dropped") return false;
            let sGradeStr = String(s.grade || "") + String(s.room || "");
            let cleanSGrade = sGradeStr.replace(/ថ្នាក់ទី|«|»|\s+/g, '');
            return cleanSGrade === cleanLevel || cleanSGrade.includes(cleanLevel);
        });

        if (window.libStudents.length === 0) {
            window.libStudents = Array.from({length: 15}, (_, i) => ({ 
                id: "STU-" + String(i + 1).padStart(3, '0'), 
                name: "សិស្សសាកល្បង " + (i + 1), 
                gender: i % 2 === 0 ? "ប្រុស" : "ស្រី" 
            }));
        }

        window.libStudents.sort((a,b) => String(a.name||"").localeCompare(String(b.name||""), 'km'));

        // ទាញទិន្នន័យពី Cloud (Sheet Library) បើសិនអាច
        let cloudData = null;
        if (typeof apiGet === 'function') {
            try {
                const res = await apiGet("getLibrary");
                const resArray = res.data || res;
                if (Array.isArray(resArray) && resArray.length > 0) {
                    cloudData = {};
                    resArray.forEach(row => {
                        if (row.id) {
                            let cleanRow = { ...row };
                            delete cleanRow.id;
                            cloudData[row.id] = cleanRow;
                        }
                    });
                }
            } catch(e) {}
        }

        const savedData = cloudData || JSON.parse(localStorage.getItem(`lib_data_${window.currentGradeFull}`)) || {};
        window.libData = savedData;

        window.renderLibTable();

    } catch (err) {
        console.error("Library Error:", err);
    }
};

window.switchLibTab = function(tab) {
    window.currentLibTab = tab;
    
    const btnB = document.getElementById('ltab-borrow');
    const btnR = document.getElementById('ltab-return');
    
    if (tab === 'borrow') {
        btnB.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all bg-white text-indigo-900 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap";
        btnR.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold text-indigo-100 hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap border border-transparent";
        
        document.getElementById('libMainTitle').innerText = "បញ្ជីខ្ចីសៀវភៅ";
        document.getElementById('libDocTitle').innerText = "បញ្ជីខ្ចីសៀវភៅសិក្សាគោល";
        document.getElementById('libDocSub').innerHTML = "ចុចលើប្រអប់មុខវិជ្ជា ដើម្បីជ្រើសរើសស្ថានភាព ៖ <span class='badge-new mx-1'>ថ្មី</span> - <span class='badge-old mx-1'>ចាស់</span> - <span class='badge-poor mx-1'>អន់</span> - <span class='badge-none mx-1'>គ្មាន</span>";
    } else {
        btnR.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all bg-white text-indigo-900 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap border border-slate-200";
        btnB.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold text-indigo-100 hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap border border-transparent";
        
        document.getElementById('libMainTitle').innerText = "បញ្ជីប្រមូលសៀវភៅ";
        document.getElementById('libDocTitle').innerText = "បញ្ជីប្រមូលសៀវភៅសិក្សាគោលមកវិញ";
        document.getElementById('libDocSub').innerHTML = "ចុចលើប្រអប់មុខវិជ្ជា ដើម្បីជ្រើសរើសស្ថានភាព ៖ <span class='badge-check mx-1'>✔</span> (បានប្រមូល) - <span class='badge-cross mx-1'>✘</span> (មិនបានប្រមូល/បាត់) - <span class='badge-none mx-1'>គ្មាន</span>";
    }

    window.renderLibTable();
};

window.renderLibTable = function() {
    const thead = document.getElementById("libTableHead");
    const tbody = document.getElementById("libTableBody");
    if (!thead || !tbody) return;

    // 🟢 រៀបចំក្បាលតារាង (Headers) 🟢
    let ths = `
        <th class="p-2 md:p-3 border-r border-b border-indigo-700 w-10 md:w-12 sticky left-0 z-20 bg-indigo-900 print:static print:border-black font-moul">ល.រ</th>
        <th class="p-2 md:p-3 border-r border-b border-indigo-700 text-left px-3 min-w-[140px] md:min-w-[160px] sticky left-[40px] md:left-[48px] z-20 bg-indigo-900 print:static print:border-black font-moul">គោត្តនាម និងនាម</th>
        <th class="p-2 md:p-3 border-r border-b border-indigo-700 w-12 hidden sm:table-cell print:table-cell print:border-black font-moul">ភេទ</th>
    `;
    
    // បង្ហាញជួរឈរសៀវភៅ (Dynamic Books)
    window.libSubjects.forEach(sub => {
        ths += `<th class="p-2 border-r border-b border-indigo-700 font-siemreap w-[70px] md:w-20 text-[10px] md:text-[11px] leading-tight print:border-black font-moul">${sub.name}</th>`;
    });
    
    // បន្ថែមជួរឈរថ្ងៃខ្ចី និងថ្ងៃសង
    ths += `
        <th class="p-2 border-r border-b border-indigo-700 font-moul w-[110px] min-w-[110px] text-[10px] md:text-xs leading-tight print:border-black bg-blue-800">ថ្ងៃខ្ចី</th>
        <th class="p-2 border-r border-b border-indigo-700 font-moul w-[110px] min-w-[110px] text-[10px] md:text-xs leading-tight print:border-black bg-emerald-800">ថ្ងៃសង</th>
        <th class="p-2 border-b border-indigo-700 font-moul w-[120px] min-w-[120px] text-[10px] md:text-xs print:border-black">ផ្សេងៗ/ហត្ថលេខា</th>
    `;
    thead.innerHTML = ths;

    // 🟢 រៀបចំតួអត្ថបទ និងគណនាទិន្នន័យសង្ខេប (Rows & Summaries) 🟢
    let trs = "";
    
    // អថេរសម្រាប់គណនាស្ថិតិរួម
    let totalBorrowed = 0, totalReturned = 0, totalLost = 0;
    let totalNew = 0, totalOld = 0, totalPoor = 0;

    window.libStudents.forEach((stu, idx) => {
        const sData = window.libData[stu.id] || {};
        const isF = stu.gender === 'ស្រី';

        let subCells = "";
        window.libSubjects.forEach(sub => {
            const currentSubData = sData[sub.key] || {};
            const bVal = currentSubData.borrow || "គ្មាន";
            const rVal = currentSubData.return || "គ្មាន";
            
            // គណនា Summary
            if (bVal === "ថ្មី" || bVal === "ចាស់" || bVal === "អន់") totalBorrowed++;
            
            // គណនាប្រភេទសៀវភៅលម្អិត
            if (bVal === "ថ្មី") totalNew++;
            if (bVal === "ចាស់") totalOld++;
            if (bVal === "អន់") totalPoor++;

            if (rVal === "✔") totalReturned++;
            if (rVal === "✘") totalLost++;

            let displayHtml = "";
            if (window.currentLibTab === 'borrow') {
                if (bVal === "ថ្មី") displayHtml = `<span class="badge-new">ថ្មី</span>`;
                else if (bVal === "ចាស់") displayHtml = `<span class="badge-old">ចាស់</span>`;
                else if (bVal === "អន់") displayHtml = `<span class="badge-poor">អន់</span>`;
                else displayHtml = `<span class="badge-none">គ្មាន</span>`;
            } else {
                if (rVal === "✔") displayHtml = `<span class="badge-check">✔</span>`;
                else if (rVal === "✘") displayHtml = `<span class="badge-cross">✘</span>`;
                else displayHtml = `<span class="badge-none">គ្មាន</span>`;
            }

            subCells += `
                <td class="p-1 border-r border-slate-300 print:border-black lib-cell bg-white print:bg-transparent" onclick="window.toggleLibCell('${stu.id}', '${sub.key}', '${stu.name}', '${stu.gender}')">
                    ${displayHtml}
                </td>
            `;
        });

        trs += `
            <tr class="hover:bg-indigo-50/30 transition-colors border-b border-slate-300 print:border-black group">
                <td class="p-1 md:p-2 border-r border-slate-300 print:border-black text-center font-mono text-slate-500 sticky left-0 z-10 bg-white group-hover:bg-indigo-50 print:static print:bg-transparent">${toKhmerNum((idx + 1).toString())}</td>
                <td class="p-1 md:p-2 border-r border-slate-300 print:border-black text-left px-3 font-moul text-[11px] md:text-xs text-slate-800 whitespace-nowrap sticky left-[40px] md:left-[48px] z-10 bg-white group-hover:bg-indigo-50 print:static print:bg-transparent" title="${stu.id}">${stu.name}</td>
                <td class="p-1 md:p-2 border-r border-slate-300 print:border-black text-center font-bold ${isF ? 'text-rose-600' : 'text-blue-600'} hidden sm:table-cell print:table-cell bg-white print:bg-transparent">${isF ? 'ស' : 'ប'}</td>
                ${subCells}
                <td class="p-1 border-r border-slate-300 print:border-black bg-blue-50/40 print:bg-transparent" style="width: 110px; min-width: 110px;">
                    <input type="date" id="bDate_${stu.id}" value="${sData.borrowDate || ''}" onchange="window.updateLibDate('${stu.id}', 'borrowDate', this.value, '${stu.name}', '${stu.gender}')" class="w-full text-[10px] md:text-[11px] bg-transparent outline-none font-mono text-center text-blue-700 border-0 focus:bg-white px-1 font-bold">
                </td>
                <td class="p-1 border-r border-slate-300 print:border-black bg-emerald-50/40 print:bg-transparent" style="width: 110px; min-width: 110px;">
                    <input type="date" id="rDate_${stu.id}" value="${sData.returnDate || ''}" onchange="window.updateLibDate('${stu.id}', 'returnDate', this.value, '${stu.name}', '${stu.gender}')" class="w-full text-[10px] md:text-[11px] bg-transparent outline-none font-mono text-center text-emerald-700 border-0 focus:bg-white px-1 font-bold">
                </td>
                <td class="p-1 border-slate-300 print:border-black bg-white print:bg-transparent" style="width: 120px; min-width: 120px;">
                    <input type="text" id="note_${stu.id}" value="${sData.note || ''}" oninput="window.updateLibNote('${stu.id}', this.value, '${stu.name}', '${stu.gender}')" class="w-full h-full min-h-[30px] bg-transparent border-0 outline-none text-center text-[10px] md:text-[11px] text-slate-500 focus:bg-amber-50 px-2 font-siemreap transition-colors" placeholder="...">
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = trs;

    // 🟢 បង្ហាញស្ថិតិសង្ខេបខាងក្រោម 🟢
    const summarySection = document.getElementById("libSummarySection");
    if (summarySection) {
        summarySection.innerHTML = `
            <div class="flex items-center gap-3 mb-4">
               <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-inner"><i class="fa-solid fa-chart-pie"></i></div>
               <h3 class="font-moul text-indigo-900 text-base drop-shadow-sm">សរុបស្ថិតិសៀវភៅក្នុងថ្នាក់</h3>
            </div>
            
            <!-- កាតស្ថិតិរួម -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
               <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div class="absolute -right-3 -top-3 text-slate-200 text-5xl opacity-40"><i class="fa-solid fa-users"></i></div>
                  <div class="text-[11px] md:text-xs text-slate-600 font-bold uppercase mb-1 font-siemreap z-10">ចំនួនសិស្សសរុប</div>
                  <div class="text-slate-800 text-2xl md:text-3xl font-black font-mono z-10">${window.toKhmerNum(window.libStudents.length.toString())} <span class="text-[10px] md:text-xs font-siemreap font-bold text-slate-400">នាក់</span></div>
               </div>
               
               <div class="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div class="absolute -right-3 -top-3 text-blue-200 text-5xl opacity-40"><i class="fa-solid fa-hand-holding-hand"></i></div>
                  <div class="text-[11px] md:text-xs text-blue-600 font-bold uppercase mb-1 font-siemreap z-10">បានខ្ចីសរុប</div>
                  <div class="text-blue-800 text-2xl md:text-3xl font-black font-mono z-10">${window.toKhmerNum(totalBorrowed.toString())} <span class="text-[10px] md:text-xs font-siemreap font-bold text-blue-500">ក្បាល</span></div>
               </div>
               
               <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div class="absolute -right-3 -top-3 text-emerald-200 text-5xl opacity-40"><i class="fa-solid fa-box-archive"></i></div>
                  <div class="text-[11px] md:text-xs text-emerald-600 font-bold uppercase mb-1 font-siemreap z-10">បានសងសរុប</div>
                  <div class="text-emerald-800 text-2xl md:text-3xl font-black font-mono z-10">${window.toKhmerNum(totalReturned.toString())} <span class="text-[10px] md:text-xs font-siemreap font-bold text-emerald-500">ក្បាល</span></div>
               </div>
               
               <div class="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div class="absolute -right-3 -top-3 text-rose-200 text-5xl opacity-40"><i class="fa-solid fa-triangle-exclamation"></i></div>
                  <div class="text-[11px] md:text-xs text-rose-600 font-bold uppercase mb-1 font-siemreap z-10">បាត់បង់/ខូច</div>
                  <div class="text-rose-800 text-2xl md:text-3xl font-black font-mono z-10">${window.toKhmerNum(totalLost.toString())} <span class="text-[10px] md:text-xs font-siemreap font-bold text-rose-400">ក្បាល</span></div>
               </div>
            </div>

            <!-- ស្ថិតិប្រភេទសៀវភៅលម្អិត -->
            <div class="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm no-print">
               <h4 class="font-bold text-slate-700 text-xs md:text-sm mb-4 font-siemreap flex items-center gap-2">
                 <i class="fa-solid fa-layer-group text-slate-400"></i> លម្អិតប្រភេទសៀវភៅដែលបានខ្ចី ៖
               </h4>
               <div class="grid grid-cols-3 gap-3 md:gap-6">
                  <div class="flex items-center gap-3 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                     <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm md:text-lg shrink-0"><i class="fa-solid fa-book"></i></div>
                     <div>
                        <div class="text-[10px] md:text-[11px] text-slate-500 font-bold font-siemreap">សៀវភៅថ្មី</div>
                        <div class="font-mono font-black text-emerald-700 text-lg md:text-2xl leading-none mt-1">${window.toKhmerNum(totalNew.toString())}</div>
                     </div>
                  </div>
                  <div class="flex items-center gap-3 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                     <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm md:text-lg shrink-0"><i class="fa-solid fa-book-open"></i></div>
                     <div>
                        <div class="text-[10px] md:text-[11px] text-slate-500 font-bold font-siemreap">សៀវភៅចាស់</div>
                        <div class="font-mono font-black text-amber-600 text-lg md:text-2xl leading-none mt-1">${window.toKhmerNum(totalOld.toString())}</div>
                     </div>
                  </div>
                  <div class="flex items-center gap-3 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                     <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm md:text-lg shrink-0"><i class="fa-solid fa-book-journal-whills"></i></div>
                     <div>
                        <div class="text-[10px] md:text-[11px] text-slate-500 font-bold font-siemreap">សៀវភៅអន់</div>
                        <div class="font-mono font-black text-rose-600 text-lg md:text-2xl leading-none mt-1">${window.toKhmerNum(totalPoor.toString())}</div>
                     </div>
                  </div>
               </div>
            </div>
        `;
    }
};

// ==========================================
// ៣. មុខងារបញ្ជា Cell (Toggle & Update Logic) + រក្សាទុក ឈ្មោះ និងភេទ
// ==========================================
window.toggleLibCell = function(stuId, subKey, stuName, stuGender) {
    if (!window.libData[stuId]) window.libData[stuId] = {};
    window.libData[stuId].name = stuName;
    window.libData[stuId].gender = stuGender;

    if (!window.libData[stuId][subKey]) window.libData[stuId][subKey] = { borrow: "គ្មាន", return: "គ្មាន" };

    let current = window.libData[stuId][subKey];

    if (window.currentLibTab === 'borrow') {
        let idx = BORROW_STATES.indexOf(current.borrow);
        if (idx === -1) idx = 0;
        current.borrow = BORROW_STATES[(idx + 1) % BORROW_STATES.length];
    } else {
        let idx = RETURN_STATES.indexOf(current.return);
        if (idx === -1) idx = 0;
        current.return = RETURN_STATES[(idx + 1) % RETURN_STATES.length];
    }

    window.renderLibTable();
};

window.updateLibDate = function(stuId, field, value, stuName, stuGender) {
    if (!window.libData[stuId]) window.libData[stuId] = {};
    window.libData[stuId].name = stuName;
    window.libData[stuId].gender = stuGender;
    window.libData[stuId][field] = value;
};

window.updateLibNote = function(stuId, value, stuName, stuGender) {
    if (!window.libData[stuId]) window.libData[stuId] = {};
    window.libData[stuId].name = stuName;
    window.libData[stuId].gender = stuGender;
    window.libData[stuId].note = value;
};

window.saveLibData = async function(silent = false) {
    const btn = document.getElementById("btnSaveLib");
    const origText = btn ? btn.innerHTML : '';
    if(btn) {
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> រក្សាទុក...`;
        btn.disabled = true;
    }

    try {
        localStorage.setItem(`lib_data_${window.currentGradeFull}`, JSON.stringify(window.libData));
        
        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof apiPost === 'function') {
            await apiPost("saveLibrary", { data: window.libData });
            if (!silent && typeof showToast === 'function') showToast("✅ ទិន្នន័យបានរក្សាទុកទៅសៀវភៅ Library ជោគជ័យ!");
        } else {
            if (!silent && typeof showToast === 'function') showToast("✅ ទិន្នន័យបានរក្សាទុកក្នុងប្រព័ន្ធ (Offline)!");
        }
    } catch (e) {
        if (!silent) alert("⚠️ មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ! សូមពិនិត្យអ៊ីនធឺណិត។");
    } finally {
        setTimeout(() => {
            if(btn) {
                btn.innerHTML = origText || `<i class="fa-solid fa-cloud-arrow-up"></i> <span class="hidden sm:inline">រក្សាទុកទិន្នន័យ</span><span class="sm:hidden">រក្សាទុក</span>`;
                btn.disabled = false;
            }
        }, 500);
    }
};

window.clearLibData = function() {
    if (confirm("⚠️ តើលោកគ្រូអ្នកគ្រូពិតជាចង់លុបសម្អាតទិន្នន័យសៀវភៅទាំងអស់របស់ថ្នាក់នេះមែនទេ? (ទិន្នន័យនឹងមិនអាចទាញមកវិញបានទេ)")) {
        window.libData = {};
        window.renderLibTable();
        window.saveLibData();
    }
};

// ==========================================
// ៤. មុខងារបោះពុម្ព (Print) - Hidden Iframe
// ==========================================
window.printLibraryReport = function() {
    const printArea = document.getElementById("libPrintArea");
    if (!printArea) return alert("⚠️ រកមិនឃើញទិន្នន័យដើម្បីបោះពុម្ព!");

    const clonedArea = printArea.cloneNode(true);
    
    // បំប្លែង Input Date និង Text ទៅជា Span ដើម្បី Print ចេញមកស្អាត និងយកទម្រង់ខ្មែរ
    const inputsDate = clonedArea.querySelectorAll('input[type="date"]');
    inputsDate.forEach(input => {
        const val = input.value;
        const span = document.createElement('span');
        span.textContent = val ? formatKhmerDate(val) : '.../.../....';
        span.style.fontSize = '9.5px';
        span.style.fontFamily = 'monospace';
        span.style.color = '#1e3a8a';
        span.style.fontWeight = 'bold';
        input.parentNode.replaceChild(span, input);
    });

    const inputsText = clonedArea.querySelectorAll('input[type="text"]');
    inputsText.forEach(input => {
        const val = input.value.trim();
        const span = document.createElement('span');
        span.textContent = val;
        span.style.fontSize = '10px';
        span.style.color = '#475569';
        input.parentNode.replaceChild(span, input);
    });

    // ដកយក Class Tailwind មួយចំនួនដែលរំខានដល់ការ Print
    const allEls = clonedArea.querySelectorAll('*');
    allEls.forEach(el => {
        el.className = (el.className || "")
            .replace(/sticky/g, "")
            .replace(/left-\[?[^\]\s]+\]?/g, "")
            .replace(/z-\d+/g, "")
            .replace(/shadow-[^"'\s]*/g, "")
            .replace(/bg-white/g, ""); 
        el.style.position = "static";
        el.style.left = "auto";
    });

    const printContent = clonedArea.outerHTML;

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>${document.getElementById('libDocTitle').innerText}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Siemreap&display=swap');
          @page { size: A4 landscape; margin: 8mm 10mm; }
          body { margin: 0; padding: 0; display: flex; justify-content: center; background: white; font-family: 'Siemreap', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .font-moul { font-family: 'Moul', serif !important; font-weight: normal !important; }
          .font-battambang { font-family: 'Battambang', sans-serif !important; }
          
          /* បង្ខំពណ៌ Badge ពេល Print */
          .badge-new { color: #059669 !important; font-size: 10px; }
          .badge-old { color: #d97706 !important; font-size: 10px; }
          .badge-poor { color: #e11d48 !important; font-size: 10px; }
          .badge-none { color: #cbd5e1 !important; font-size: 10px; }
          
          .badge-check { color: #059669 !important; font-size: 12px; font-weight: bold; }
          .badge-cross { color: #e11d48 !important; font-size: 12px; font-weight: bold; }
          
          table { width: 100%; border-collapse: collapse; border: 1.5px solid black; }
          th { background-color: #f1f5f9 !important; color: black !important; font-family: 'Moul', serif; padding: 4px; font-size: 10px; border: 1px solid black; text-align: center; }
          td { border: 1px solid black; padding: 4px 2px; font-size: 10.5px; text-align: center; height: 24px; vertical-align: middle;}
          td:nth-child(2) { text-align: left; padding-left: 6px; font-family: 'Moul', serif; font-size: 11px;}
          tr:nth-child(even) { background-color: #f8fafc !important; }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 277mm;">
           ${printContent}
        </div>
      </body>
      </html>
    `;

    // ប្រើប្រាស់ Hidden Iframe ដើម្បី Print ចៀសវាង Pop-up Blocker
    let iframe = document.getElementById('printLibIframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'printLibIframe';
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
    doc.write(printDocument);
    doc.close();

    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }, 1000);
};