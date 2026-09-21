// ==========================================
// ឯកសារ js/library.js - គ្រប់គ្រងបណ្ណាល័យ និងការខ្ចីសងសៀវភៅ (ទាញឈ្មោះសិស្សចេញពីប្រព័ន្ធស្វ័យប្រវត្តិ)
// ==========================================

let libraryBooks = [];
let schoolAssets = [];
let cachedStudents = []; 

// ទិន្នន័យកត់ត្រាសាកល្បង
let borrowRecords = JSON.parse(localStorage.getItem("school_borrow_records")) || [
  { id: 1, studentId: "STU-001", name: "សុខ សាន្ត", gender: "ប្រុស", grade: "ថ្នាក់ទី ៦ «ក»", books: ["ភាសាខ្មែរ", "គណិតវិទ្យា"], borrowDate: "2026-09-08", returnDate: "2026-09-15", status: "កំពុងខ្ចី" }
];
let currentLibTab = 'lending'; 

// បញ្ជីឈ្មោះសៀវភៅតាមកម្រិត
const primaryBooksList = ["ភាសាខ្មែរ", "គណិតវិទ្យា", "វិទ្យាសាស្ត្រ", "សិក្សាសង្គម", "រឿងនិទានកុមារ", "អង់គ្លេសបឋម"];
const highSchoolBooksList = ["រូបវិទ្យា", "គីមីវិទ្យា", "ជីវវិទ្យា", "ផែនដីវិទ្យា", "ប្រវត្តិវិទ្យា", "ភូមិវិទ្យា", "ភាសាអង់គ្លេស", "សីលធម៌ ពលរដ្ឋ", "ព័ត៌មានវិទ្យា (កុំព្យូទ័រ)", "ភាសាបារាំង"];

// មុខងារទាញយកថ្នាក់ទាំងអស់ដែលមានក្នុងប្រព័ន្ធ
function getUniqueGrades() {
  const students = (cachedStudents && cachedStudents.length > 0) ? cachedStudents : (typeof allStudents !== 'undefined' ? allStudents : []);
  const allGrades = ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦", "ថ្នាក់ទី ៧", "ថ្នាក់ទី ៨", "ថ្នាក់ទី ៩", "ថ្នាក់ទី ១០", "ថ្នាក់ទី ១១", "ថ្នាក់ទី ១២"];
  const gradeSet = new Set();
  students.forEach(s => {
    if (s.grade && String(s.grade).trim() !== "") {
      gradeSet.add(String(s.grade).trim());
    }
  });
  return Array.from(gradeSet).sort((a, b) => a.localeCompare(b, 'km'));
}

async function loadLibraryView() {
  const container = document.getElementById("libraryView") || document.getElementById("mainContentArea");
  if (!container) return;

  // បង្ហាញការរង់ចាំពេលទាញទិន្នន័យ
  container.innerHTML = `<div class="p-20 text-center text-indigo-500 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i><br>កំពុងទាញយកទិន្នន័យពីប្រព័ន្ធ...</div>`;

  await fetchLibraryCloudData();
  
  const dynamicGrades = getUniqueGrades();
  const gradeOptions = dynamicGrades.length > 0 
      ? dynamicGrades.map(g => `<option value="${g}">${g}</option>`).join('') 
      : `<option value="">គ្មានទិន្នន័យថ្នាក់ទេ</option>`;

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in pb-10 font-siemreap">
      <!-- ផ្ទាំងក្បាល (Header) -->
      <div class="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 no-print relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-blue-600"></div>
        <div class="pl-2">
          <h2 class="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-sm"><i class="fa-solid fa-book-reader"></i></div>
            បណ្ណាល័យ និងការខ្ចី-សងសៀវភៅ
          </h2>
          <p class="text-sm text-slate-500 mt-1 md:ml-14 font-bold">តាមដានសកម្មភាពខ្ចីសៀវភៅតាមមុខវិជ្ជា ដោយទាញឈ្មោះពីបញ្ជីសិស្សស្វ័យប្រវត្តិ</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="printLendingReport()" id="btnPrintLending" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2">
            <i class="fa-solid fa-print"></i> បោះពុម្ពបញ្ជី
          </button>
          <button onclick="openLibraryModal()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2">
            <i class="fa-solid fa-plus-circle"></i> កត់ត្រាថ្មី
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 no-print" id="libKpiCards"></div>

      <!-- ផ្នែកទិន្នន័យចម្បង -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        <!-- Tabs Menu -->
        <div class="flex gap-2 p-2 border-b border-slate-100 bg-slate-50 overflow-x-auto custom-scrollbar">
           <button onclick="switchLibTab('lending')" id="tab-lending" class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap bg-indigo-100 text-indigo-700 shadow-sm">🤝 តាមដានការខ្ចី-សង</button>
           <button onclick="switchLibTab('books')" id="tab-books" class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-200">📚 បញ្ជីសៀវភៅសរុប</button>
           <button onclick="switchLibTab('assets')" id="tab-assets" class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-200">🖨️ ទ្រព្យសម្បត្តិសាលា</button>
        </div>
        
        <!-- Filter Bar -->
        <div class="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-3 bg-white no-print" id="libFilterContainer">
           <div class="relative w-full md:w-80">
              <i class="fa-solid fa-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input type="text" id="libSearchInput" oninput="renderLibTable()" placeholder="ស្វែងរកឈ្មោះ អត្តលេខ..." class="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition">
           </div>
           
           <div id="lendingFilters" class="flex items-center gap-2">
             <select id="libGradeFilter" onchange="renderLibTable()" class="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 outline-none cursor-pointer">
               <option value="">គ្រប់កម្រិតថ្នាក់</option>
               ${gradeOptions}
             </select>
             <select id="libStatusFilter" onchange="renderLibTable()" class="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 outline-none cursor-pointer">
               <option value="">ស្ថានភាព</option>
               <option value="កំពុងខ្ចី">កំពុងខ្ចី</option>
               <option value="បានសងរួច">បានសងរួច</option>
             </select>
           </div>
        </div>

        <div class="overflow-x-auto custom-scrollbar" id="libTableContainer"></div>
      </div>
    </div>
  `;

  createLibraryModalHTML();
  renderLibTable();
  updateLibKPIs();
}

async function fetchLibraryCloudData() {
  try {
    const [booksRes, assetsRes, studentsRes] = await Promise.all([
      typeof apiGet === "function" ? apiGet("getBooks") : Promise.resolve({ data: [] }),
      typeof apiGet === "function" ? apiGet("getAssets") : Promise.resolve({ data: [] }),
      typeof apiGet === "function" ? apiGet("getStudents", { status: "Active" }) : Promise.resolve({ data: [] })
    ]);
    libraryBooks = booksRes.data || [];
    schoolAssets = assetsRes.data || [];
    cachedStudents = studentsRes.data || (typeof allStudents !== 'undefined' ? allStudents : []);
  } catch (err) {
    if (typeof allStudents !== 'undefined') cachedStudents = allStudents;
  }
}

function updateLibKPIs() {
  const activeBorrows = borrowRecords.filter(r => r.status === "កំពុងខ្ចី").length;
  const returnedBorrows = borrowRecords.filter(r => r.status === "បានសងរួច").length;

  const kpiContainer = document.getElementById("libKpiCards");
  if(kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
         <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex justify-center items-center text-xl"><i class="fa-solid fa-users"></i></div>
         <div><p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">សិស្សខ្ចីសរុប</p><h4 class="text-xl font-black text-slate-800 font-mono">${borrowRecords.length}</h4></div>
      </div>
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
         <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex justify-center items-center text-xl"><i class="fa-solid fa-book-open-reader"></i></div>
         <div><p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">សិស្សកំពុងខ្ចី</p><h4 class="text-xl font-black text-rose-600 font-mono">${activeBorrows}</h4></div>
      </div>
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
         <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex justify-center items-center text-xl"><i class="fa-solid fa-clipboard-check"></i></div>
         <div><p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">បានសងត្រឡប់</p><h4 class="text-xl font-black text-emerald-600 font-mono">${returnedBorrows}</h4></div>
      </div>
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
         <div class="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex justify-center items-center text-xl"><i class="fa-solid fa-book"></i></div>
         <div><p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">សៀវភៅក្នុងស្តុក</p><h4 class="text-xl font-black text-amber-600 font-mono">${libraryBooks.length}</h4></div>
      </div>
    `;
  }
}

function switchLibTab(tab) {
  currentLibTab = tab;
  document.querySelectorAll("[id^='tab-']").forEach(btn => {
    btn.className = "px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-200";
  });
  const activeTab = document.getElementById("tab-" + tab);
  if (activeTab) {
    activeTab.className = "px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap bg-indigo-100 text-indigo-700 shadow-sm";
  }

  const filterAddon = document.getElementById("lendingFilters");
  const btnPrint = document.getElementById("btnPrintLending");
  if (tab === 'lending') {
    if(filterAddon) { filterAddon.classList.remove("hidden"); filterAddon.classList.add("flex"); }
    if(btnPrint) { btnPrint.classList.remove("hidden"); btnPrint.classList.add("flex"); }
  } else {
    if(filterAddon) { filterAddon.classList.add("hidden"); filterAddon.classList.remove("flex"); }
    if(btnPrint) { btnPrint.classList.add("hidden"); btnPrint.classList.remove("flex"); }
  }
  renderLibTable();
}

function renderLibTable() {
  const container = document.getElementById("libTableContainer");
  const searchQuery = (document.getElementById("libSearchInput")?.value || "").toLowerCase().trim();
  if (!container) return;

  if (currentLibTab === 'lending') {
    const gradeFilter = document.getElementById("libGradeFilter")?.value || "";
    const statusFilter = document.getElementById("libStatusFilter")?.value || "";

    const filtered = borrowRecords.filter(item => {
      const matchName = item.name.toLowerCase().includes(searchQuery) || item.studentId.toLowerCase().includes(searchQuery);
      const matchGrade = gradeFilter ? item.grade.includes(gradeFilter) : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchName && matchGrade && matchStatus;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-folder-open text-4xl mb-4"></i><br>មិនមានទិន្នន័យការខ្ចី-សងសៀវភៅទេ</div>`;
      return;
    }

    let trs = filtered.map((item, index) => {
      const statusClass = item.status === 'កំពុងខ្ចី' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
      const booksHtml = (item.books || []).map(b => `<span class="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] mr-1 inline-block mb-1 shadow-xs">${b}</span>`).join('');

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-[12px] font-bold text-slate-700">
          <td class="p-3 text-center">${index + 1}</td>
          <td class="p-3 font-mono text-slate-400">${item.studentId}</td>
          <td class="p-3 font-moul text-slate-900">${item.name}</td>
          <td class="p-3 text-center text-indigo-600">${item.grade}</td>
          <td class="p-3 max-w-[250px] whitespace-normal leading-tight">${booksHtml || '-'}</td>
          <td class="p-3 text-center font-mono">${item.borrowDate}</td>
          <td class="p-3 text-center font-mono ${item.returnDate ? 'text-emerald-600' : 'text-slate-400'}">${item.returnDate || '-'}</td>
          <td class="p-3 text-center">
            <button onclick="toggleBorrowStatus(${item.id})" class="px-3 py-1 rounded-full text-[10px] border shadow-sm hover:scale-105 transition ${statusClass}">
              ${item.status} <i class="fa-solid fa-rotate text-[9px] ml-1"></i>
            </button>
          </td>
          <td class="p-3 text-right pr-6">
             <div class="flex items-center justify-end gap-1.5">
               <button onclick="editBorrowRecord(${item.id})" class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 transition shadow-sm" title="កត់ត្រាសង / កែប្រែ">
                 <i class="fa-solid fa-pen-to-square"></i>
               </button>
               <button onclick="deleteBorrowRecord(${item.id})" class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 transition shadow-sm" title="លុប">
                 <i class="fa-solid fa-trash-can"></i>
               </button>
             </div>
          </td>
        </tr>
      `;
    }).join("");

    container.innerHTML = `
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead class="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
          <tr>
            <th class="p-3 text-center w-10">ល.រ</th><th class="p-3">អត្តលេខ</th><th class="p-3">ឈ្មោះសិស្ស</th><th class="p-3 text-center">ថ្នាក់ទី</th>
            <th class="p-3 min-w-[200px]">សៀវភៅដែលបានខ្ចី</th>
            <th class="p-3 text-center">ថ្ងៃខ្ចី</th><th class="p-3 text-center">ថ្ងៃសង</th><th class="p-3 text-center">ស្ថានភាព</th><th class="p-3 text-right pr-6">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">${trs}</tbody>
      </table>
    `;
  } 
  else if (currentLibTab === 'books') {
    let filteredBooks = libraryBooks.filter(b => String(b.title || "").toLowerCase().includes(searchQuery) || String(b.id || "").toLowerCase().includes(searchQuery));
    let trs = filteredBooks.map(b => `<tr class="border-b"><td class="p-3">${b.id}</td><td class="p-3">${b.title}</td><td class="p-3 text-center">${b.total}</td></tr>`).join("");
    container.innerHTML = `<table class="w-full text-left text-sm"><thead><tr class="bg-slate-50"><th class="p-3">កូដ</th><th class="p-3">ចំណងជើង</th><th class="p-3 text-center">សរុប</th></tr></thead><tbody>${trs}</tbody></table>`;
  } else {
    let filteredAssets = schoolAssets.filter(a => String(a.name || "").toLowerCase().includes(searchQuery));
    let trs = filteredAssets.map(a => `<tr class="border-b"><td class="p-3">${a.id}</td><td class="p-3">${a.name}</td><td class="p-3 text-center">${a.qty}</td></tr>`).join("");
    container.innerHTML = `<table class="w-full text-left text-sm"><thead><tr class="bg-slate-50"><th class="p-3">កូដ</th><th class="p-3">ឈ្មោះសម្ភារៈ</th><th class="p-3 text-center">បរិមាណ</th></tr></thead><tbody>${trs}</tbody></table>`;
  }
}

// ទាញឈ្មោះសិស្សតាមថ្នាក់
window.updateBrwStudentSelect = function() {
  const grade = document.getElementById("brw_grade_select")?.value;
  const select = document.getElementById("brw_student_id");
  if(!select || !grade) return;

  const students = (cachedStudents && cachedStudents.length > 0) ? cachedStudents : (typeof allStudents !== 'undefined' ? allStudents : []);
  const studentsInGrade = students.filter(s => String(s.grade).trim() === grade.trim());
  studentsInGrade.sort((a, b) => String(a.name).localeCompare(String(b.name), 'km'));

  if(studentsInGrade.length === 0) {
    select.innerHTML = `<option value="">គ្មានសិស្សទេ</option>`;
  } else {
    select.innerHTML = studentsInGrade.map(s => `<option value="${s.id}" data-name="${s.name}" data-gender="${s.gender}">${s.id} - ${s.name}</option>`).join("");
  }
}

function createLibraryModalHTML() {
  if (document.getElementById("libraryModal")) return;
  const modalHtml = `
    <div id="libraryModal" class="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-sm hidden flex-col items-center justify-center p-4 font-siemreap animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-slate-200">
        <div class="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 id="libModalTitle" class="font-black text-lg text-slate-800 flex items-center gap-3">ចំណងជើង</h2>
          <button type="button" onclick="closeLibraryModal()" class="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition flex justify-center items-center"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
          <form id="libraryForm" onsubmit="handleLibrarySave(event)" class="space-y-5">
             <input type="hidden" id="editBorrowId" value="">
             <div id="libDynamicFields" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
             
             <!-- ទីតាំងជ្រើសរើសសៀវភៅ -->
             <div id="booksSelectionArea" class="sm:col-span-2 pt-4 border-t border-slate-100 hidden">
                <label class="text-xs font-bold text-slate-800 mb-2 block"><i class="fa-solid fa-book-open text-blue-500"></i> សៀវភៅបឋមសិក្សា៖</label>
                <div class="flex flex-wrap gap-2 mb-4">
                  ${primaryBooksList.map(book => `
                    <label class="cursor-pointer">
                      <input type="checkbox" value="${book}" class="peer sr-only book-checkbox">
                      <div class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 peer-checked:border-indigo-300 transition-all hover:bg-slate-50">${book}</div>
                    </label>
                  `).join('')}
                </div>

                <label class="text-xs font-bold text-slate-800 mb-2 block"><i class="fa-solid fa-microscope text-emerald-500"></i> សៀវភៅអនុវិទ្យាល័យ & វិទ្យាល័យ៖</label>
                <div class="flex flex-wrap gap-2 mb-4">
                  ${highSchoolBooksList.map(book => `
                    <label class="cursor-pointer">
                      <input type="checkbox" value="${book}" class="peer sr-only book-checkbox">
                      <div class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-300 transition-all hover:bg-slate-50">${book}</div>
                    </label>
                  `).join('')}
                </div>

                <label class="text-xs font-bold text-slate-800 mb-2 block"><i class="fa-solid fa-pen-nib text-amber-500"></i> បញ្ចូលឈ្មោះសៀវភៅផ្សេងៗទៀត (ប្រសិនបើមាន)៖</label>
                <input type="text" id="brw_custom_books" placeholder="ឧ. សៀវភៅប្រវត្តិសាស្ត្រខ្មែរ, សៀវភៅរឿងខ្លី..." class="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold bg-white focus:border-indigo-500 outline-none">
             </div>

             <div class="pt-6 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onclick="closeLibraryModal()" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition">បោះបង់</button>
                <button type="submit" class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition text-sm flex items-center gap-2"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុក</button>
             </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openLibraryModal(item = null) {
  const modal = document.getElementById("libraryModal");
  const fieldsContainer = document.getElementById("libDynamicFields");
  const booksSelectionArea = document.getElementById("booksSelectionArea");
  const title = document.getElementById("libModalTitle");
  if (!modal || !fieldsContainer) return;
  
  document.getElementById("libraryForm").reset();
  document.getElementById("editBorrowId").value = "";
  document.querySelectorAll('.book-checkbox').forEach(chk => chk.checked = false);

  const today = new Date().toISOString().split('T')[0];

  if (currentLibTab === 'lending') {
    const isEdit = item !== null;
    if (isEdit) document.getElementById("editBorrowId").value = item.id;

    title.innerHTML = isEdit ? `<i class="fa-solid fa-clipboard-check text-emerald-600"></i> កត់ត្រាសងសៀវភៅ / កែប្រែ` : `<i class="fa-solid fa-handshake-angle text-indigo-600"></i> កត់ត្រាការខ្ចីសៀវភៅថ្មី`;
    
    const dynamicGrades = getUniqueGrades();
    const gradeOptions = dynamicGrades.length > 0 
      ? dynamicGrades.map(g => `<option value="${g}">${g}</option>`).join('') 
      : `<option value="">គ្មានទិន្នន័យថ្នាក់ទេ</option>`;

    fieldsContainer.innerHTML = `
      <div>
         <label class="block text-xs font-bold text-slate-600 mb-1">ជ្រើសរើសថ្នាក់ទី</label>
         <select id="brw_grade_select" onchange="updateBrwStudentSelect()" ${isEdit ? 'disabled' : ''} class="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold bg-slate-50 outline-none">
            ${gradeOptions}
         </select>
      </div>
      <div>
         <label class="block text-xs font-bold text-slate-600 mb-1">ឈ្មោះសិស្ស</label>
         <select id="brw_student_id" ${isEdit ? 'disabled' : ''} class="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold bg-slate-50 outline-none"></select>
      </div>
      
      <div><label class="block text-xs font-bold text-slate-600 mb-1">ថ្ងៃខ្ចីសៀវភៅ</label><input type="date" id="brw_borrow_date" required value="${isEdit ? item.borrowDate : today}" class="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold outline-none"></div>
      <div><label class="block text-xs font-bold text-emerald-600 mb-1">ថ្ងៃសង (កត់ត្រាពេលសង)</label><input type="date" id="brw_return_date" value="${isEdit && item.returnDate ? item.returnDate : (isEdit ? today : '')}" class="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold outline-none"></div>
      
      <div class="sm:col-span-2 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
         <label class="text-sm font-bold text-slate-800">ស្ថានភាពកំណត់ត្រា៖</label>
         <select id="brw_status" class="border border-slate-300 rounded-lg px-4 py-1.5 text-xs font-bold bg-white text-indigo-700 outline-none cursor-pointer">
            <option value="កំពុងខ្ចី" ${isEdit && item.status === 'កំពុងខ្ចី' ? 'selected' : ''}>កំពុងខ្ចី</option>
            <option value="បានសងរួច" ${isEdit && item.status === 'បានសងរួច' ? 'selected' : ''}>បានសងរួច</option>
         </select>
      </div>
    `;

    booksSelectionArea.classList.remove("hidden");
    booksSelectionArea.classList.add("block");

    setTimeout(() => {
       if (isEdit) {
         document.getElementById("brw_grade_select").value = item.grade;
         document.getElementById("brw_student_id").innerHTML = `<option value="${item.studentId}" data-name="${item.name}" data-gender="${item.gender}">${item.studentId} - ${item.name}</option>`;
         
         let customBooksArr = [];
         const allCheckboxes = document.querySelectorAll('.book-checkbox');
         
         (item.books || []).forEach(b => {
            let found = false;
            allCheckboxes.forEach(chk => {
               if(chk.value === b) { chk.checked = true; found = true; }
            });
            if(!found) customBooksArr.push(b);
         });

         if(customBooksArr.length > 0) {
            document.getElementById("brw_custom_books").value = customBooksArr.join(', ');
         }
       } else {
         updateBrwStudentSelect();
       }
    }, 100);

  } else {
    booksSelectionArea.classList.add("hidden");
    booksSelectionArea.classList.remove("block");
  }
  
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeLibraryModal() {
  document.getElementById("libraryModal")?.classList.add("hidden");
  document.getElementById("libraryModal")?.classList.remove("flex");
}

function handleLibrarySave(e) {
  e.preventDefault();
  
  if (currentLibTab === 'lending') {
    const editId = document.getElementById("editBorrowId").value;
    const selectEl = document.getElementById("brw_student_id");
    const option = selectEl.options[selectEl.selectedIndex];
    
    if (!option) {
       alert("សូមជ្រើសរើសសិស្សឱ្យបានត្រឹមត្រូវសិន!"); return;
    }

    let selectedBooks = [];
    document.querySelectorAll('.book-checkbox:checked').forEach(chk => {
        selectedBooks.push(chk.value);
    });
    
    const customBooksInput = document.getElementById("brw_custom_books").value.trim();
    if(customBooksInput) {
        customBooksInput.split(',').forEach(b => {
            if(b.trim()) selectedBooks.push(b.trim());
        });
    }

    if (selectedBooks.length === 0) {
        alert("សូមជ្រើសរើស ឬបញ្ចូលឈ្មោះសៀវភៅយ៉ាងហោចណាស់ ១ ក្បាល!"); return;
    }

    const statusVal = document.getElementById("brw_status").value;
    let returnDateVal = document.getElementById("brw_return_date").value;
    if (statusVal === "កំពុងខ្ចី") returnDateVal = ""; // បើប្តូរទៅកំពុងខ្ចី លុបថ្ងៃសងចេញ

    const newRecord = {
      id: editId ? Number(editId) : Date.now(),
      studentId: option.value,
      name: option.getAttribute("data-name"),
      gender: option.getAttribute("data-gender"),
      grade: document.getElementById("brw_grade_select").value,
      borrowDate: document.getElementById("brw_borrow_date").value,
      returnDate: returnDateVal,
      books: selectedBooks, 
      status: statusVal
    };

    if (editId) {
      const idx = borrowRecords.findIndex(r => r.id === Number(editId));
      if (idx !== -1) borrowRecords[idx] = newRecord;
    } else {
      borrowRecords.unshift(newRecord);
    }

    localStorage.setItem("school_borrow_records", JSON.stringify(borrowRecords));
    if(typeof showToast === 'function') showToast("✅ កត់ត្រាការខ្ចី-សងជោគជ័យ!");
    
    renderLibTable();
    updateLibKPIs();
    closeLibraryModal();
  } 
}

function editBorrowRecord(id) {
  const rec = borrowRecords.find(r => r.id === id);
  if (rec) openLibraryModal(rec);
}

function deleteBorrowRecord(id) {
  if (!confirm("តើអ្នកពិតជាចង់លុបកំណត់ត្រាខ្ចី-សងនេះមែនទេ?")) return;
  borrowRecords = borrowRecords.filter(r => r.id !== id);
  localStorage.setItem("school_borrow_records", JSON.stringify(borrowRecords));
  renderLibTable();
  updateLibKPIs();
}

function toggleBorrowStatus(id) {
  const item = borrowRecords.find(r => r.id === id);
  if (item) {
    item.status = item.status === "កំពុងខ្ចី" ? "បានសងរួច" : "កំពុងខ្ចី";
    if (item.status === "បានសងរួច" && !item.returnDate) {
       item.returnDate = new Date().toISOString().split('T')[0];
    } else if (item.status === "កំពុងខ្ចី") {
       item.returnDate = ""; 
    }
    localStorage.setItem("school_borrow_records", JSON.stringify(borrowRecords));
    renderLibTable();
    updateLibKPIs();
  }
}

// ==========================================
// ការបោះពុម្ពទម្រង់លិខិតរដ្ឋបាល (Official Report - A4 Landscape)
// ==========================================
function printLendingReport() {
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា/វិទ្យាល័យគំរូ";
  const districtName = sInfo.district || ".......................";
  const academicYear = sInfo.academic_year || "២០២៦-២០២៧";
  
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  const currentYearKh = toKhmerNum(new Date().getFullYear());

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>បញ្ជីតាមដានការខ្ចី-សងសៀវភៅ</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        @page { size: A4 landscape; margin: 12mm 15mm; }
        body { font-family: 'Siemreap', sans-serif; color: black; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .font-moul { font-family: 'Moul', serif; font-weight: normal; }
      </style>
    </head>
    <body>
      <div class="flex justify-between items-start text-[13px] font-bold leading-relaxed mb-6">
        <div class="text-left font-moul">
          <p>ការិយាល័យអប់រំ យុវជន និងកីឡា <span class="text-indigo-900">${districtName}</span></p>
          <p class="mt-1">${schoolName}</p>
        </div>
        <div class="text-center font-moul">
          <p class="text-[14px]">ព្រះរាជាណាចក្រកម្ពុជា</p>
          <p class="text-[14px] mt-0.5">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          <div class="tracking-[4px] mt-0 text-[12px] font-serif font-bold text-slate-600">* * * 📖 * * *</div>
        </div>
      </div>

      <div class="text-center mt-6 mb-8">
        <h2 class="font-moul text-[18px] uppercase tracking-wider underline decoration-double underline-offset-4">បញ្ជីតាមដានសកម្មភាពខ្ចី-សងសៀវភៅបណ្ណាល័យ</h2>
        <p class="text-[13px] font-bold mt-2">ឆ្នាំសិក្សា៖ <span class="font-mono text-[15px]">${toKhmerNum(academicYear)}</span></p>
      </div>

      <table class="w-full border-collapse border-[2px] border-black text-center text-[12px]">
        <thead>
          <tr class="bg-slate-100 font-moul h-10 border-b-[2px] border-black text-[12px]">
            <th class="border-r-[2px] border-black w-10">ល.រ</th>
            <th class="border-r border-black w-20">អត្តលេខ</th>
            <th class="border-r border-black text-left px-3">គោត្តនាម និងនាម</th>
            <th class="border-r border-black w-12">ភេទ</th>
            <th class="border-r border-black w-24">ថ្នាក់ទី</th>
            <th class="border-r-[2px] border-black text-left px-3 min-w-[250px]">ចំណងជើងសៀវភៅដែលបានខ្ចី</th>
            <th class="border-r border-black w-24">ថ្ងៃខ្ចី</th>
            <th class="border-r border-black w-24">ថ្ងៃសង</th>
            <th class="border-r border-black w-20">ស្ថានភាព</th>
            <th class="w-20">ផ្សេងៗ</th>
          </tr>
        </thead>
        <tbody>
          ${borrowRecords.map((item, idx) => `
            <tr class="min-h-[32px] border-b border-black font-bold">
              <td class="border-r-[2px] border-black text-center p-1">${toKhmerNum(idx + 1)}</td>
              <td class="border-r border-black font-mono text-[11px] p-1">${item.studentId}</td>
              <td class="border-r border-black text-left px-3 font-moul p-1">${item.name}</td>
              <td class="border-r border-black text-center p-1">${item.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
              <td class="border-r border-black text-center p-1">${item.grade}</td>
              <td class="border-r-[2px] border-black text-left px-3 text-[11px] py-1.5 leading-relaxed font-normal">${(item.books || []).join(' , ')}</td>
              <td class="border-r border-black font-mono text-center text-[11px] p-1">${item.borrowDate}</td>
              <td class="border-r border-black font-mono text-center text-[11px] p-1">${item.returnDate || '...'}</td>
              <td class="border-r border-black text-center p-1 ${item.status === 'កំពុងខ្ចី' ? 'text-black' : 'text-black'}">${item.status}</td>
              <td></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="flex justify-between mt-12 text-[12px] font-bold px-12 pb-10">
        <div class="text-center">
          <p class="font-moul mb-20">ប្រធានបណ្ណាល័យ</p>
        </div>
        <div class="text-center">
          <p class="mb-1 font-normal">ធ្វើនៅ...................., ថ្ងៃទី........ខែ........ឆ្នាំ ${currentYearKh}</p>
          <p class="font-moul mb-20 mt-1">នាយកសាលា</p>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => { printWindow.focus(); printWindow.print(); }, 1000);
}