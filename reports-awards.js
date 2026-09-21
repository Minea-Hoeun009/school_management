// ==========================================
// ឯកសារ js/reports-awards.js - គ្រប់គ្រងចំណាត់ថ្នាក់, ព្រឹត្តិបត្រ និង Canva-Like Editor ពេញលេញ
// ==========================================

let rankingsDataList = [];
window.currentHonorBg = "";
window.currentCertBg = "";

// ==========================================================
// ០. ម៉ាស៊ីនរចនាអូសទាញ និងកែទម្រង់អក្សរ (Full Canva-like Engine)
// ==========================================================
let activeEl = null;
let isDragging = false;
let startX, startY, initialX, initialY;

function initCanvaEngine() {
  if (document.getElementById('canva-toolbar')) return; 

  const toolbar = document.createElement('div');
  toolbar.id = 'canva-toolbar';
  toolbar.className = 'fixed z-[9999] hidden bg-slate-800 text-white rounded-xl shadow-2xl p-1.5 flex flex-wrap items-center gap-1 border border-slate-600 transition-opacity animate-fade-in no-print';
  toolbar.innerHTML = `
      <div class="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none flex items-center gap-1.5"><i class="fa-solid fa-pen-ruler"></i> Design</div>
      <div class="w-px h-5 bg-slate-600 mx-1"></div>
      
      <select onchange="applyCanvaStyle('font', this.value)" id="canva-font" class="bg-slate-700 text-white text-[10px] font-bold rounded p-1.5 outline-none cursor-pointer">
        <option value="Siemreap">Siemreap</option>
        <option value="Moul">Moul (ចំណងជើង)</option>
      </select>
      
      <button type="button" onclick="adjustActiveElSize(2)" class="w-7 h-7 rounded hover:bg-slate-700 text-xs font-bold" title="ពង្រីក (A+)"><i class="fa-solid fa-a"></i><span class="text-[9px] align-top">+</span></button>
      <button type="button" onclick="adjustActiveElSize(-2)" class="w-7 h-7 rounded hover:bg-slate-700 text-xs font-bold" title="បង្រួម (A-)"><i class="fa-solid fa-a"></i><span class="text-[9px] align-top">-</span></button>
      <div class="w-px h-5 bg-slate-600 mx-1"></div>
      
      <button type="button" onclick="applyCanvaStyle('bold')" class="w-7 h-7 rounded hover:bg-slate-700 font-black" title="ដិត (Bold)">B</button>
      <button type="button" onclick="applyCanvaStyle('italic')" class="w-7 h-7 rounded hover:bg-slate-700 italic font-serif" title="ទ្រេត (Italic)">I</button>
      <button type="button" onclick="applyCanvaStyle('underline')" class="w-7 h-7 rounded hover:bg-slate-700 underline" title="គូសបន្ទាត់ក្រោម (Underline)">U</button>
      <div class="w-px h-5 bg-slate-600 mx-1"></div>
      
      <button type="button" onclick="applyCanvaStyle('align', 'left')" class="w-7 h-7 rounded hover:bg-slate-700" title="តម្រឹមឆ្វេង"><i class="fa-solid fa-align-left text-xs"></i></button>
      <button type="button" onclick="applyCanvaStyle('align', 'center')" class="w-7 h-7 rounded hover:bg-slate-700" title="តម្រឹមកណ្តាល"><i class="fa-solid fa-align-center text-xs"></i></button>
      <button type="button" onclick="applyCanvaStyle('align', 'right')" class="w-7 h-7 rounded hover:bg-slate-700" title="តម្រឹមស្តាំ"><i class="fa-solid fa-align-right text-xs"></i></button>
      <div class="w-px h-5 bg-slate-600 mx-1"></div>
      
      <button type="button" onclick="moveActiveEl(0, -5)" class="w-7 h-7 rounded hover:bg-slate-700" title="ឡើងលើ"><i class="fa-solid fa-arrow-up text-[10px]"></i></button>
      <button type="button" onclick="moveActiveEl(0, 5)" class="w-7 h-7 rounded hover:bg-slate-700" title="ចុះក្រោម"><i class="fa-solid fa-arrow-down text-[10px]"></i></button>
      <button type="button" onclick="moveActiveEl(-5, 0)" class="w-7 h-7 rounded hover:bg-slate-700" title="ទៅឆ្វេង"><i class="fa-solid fa-arrow-left text-[10px]"></i></button>
      <button type="button" onclick="moveActiveEl(5, 0)" class="w-7 h-7 rounded hover:bg-slate-700" title="ទៅស្តាំ"><i class="fa-solid fa-arrow-right text-[10px]"></i></button>
      <div class="w-px h-5 bg-slate-600 mx-1"></div>
      
      <label class="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center cursor-pointer relative" title="ពណ៌អក្សរ">
          <i class="fa-solid fa-palette text-amber-400"></i>
          <input type="color" id="canva-color-picker" onchange="changeActiveElColor(this.value)" class="absolute opacity-0 w-full h-full cursor-pointer">
      </label>
      
      <button type="button" onclick="closeCanvaToolbar()" class="w-7 h-7 rounded hover:bg-rose-600 text-rose-400 hover:text-white flex items-center justify-center ml-1 transition" title="បិទ"><i class="fa-solid fa-xmark"></i></button>
  `;
  document.body.appendChild(toolbar);

  document.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  
  document.addEventListener('click', function(e) {
      if (e.target.closest('.canva-el')) {
          activeEl = e.target.closest('.canva-el');
          showCanvaToolbar(activeEl, e);
          document.querySelectorAll('.canva-el').forEach(el => el.classList.remove('ring-2', 'ring-dashed', 'ring-blue-400'));
          activeEl.classList.add('ring-2', 'ring-dashed', 'ring-blue-400');
      } else if (!e.target.closest('#canva-toolbar')) {
          closeCanvaToolbar();
      }
  });
}

function showCanvaToolbar(el, e) {
  const toolbar = document.getElementById('canva-toolbar');
  toolbar.classList.remove('hidden');
  let tbX = e.clientX - 100; 
  let tbY = e.clientY - 60; 
  if (tbY < 0) tbY = e.clientY + 40; 
  if (tbX < 0) tbX = 10;
  toolbar.style.left = `${tbX}px`;
  toolbar.style.top = `${tbY}px`;
  
  const computedColor = window.getComputedStyle(el).color;
  const hexColor = rgbToHex(computedColor);
  if (hexColor) document.getElementById('canva-color-picker').value = hexColor;

  const computedFont = window.getComputedStyle(el).fontFamily;
  const fontSelect = document.getElementById('canva-font');
  if (fontSelect) {
      if (computedFont.includes("Moul")) fontSelect.value = "Moul";
      else fontSelect.value = "Siemreap";
  }
}

function closeCanvaToolbar() {
  const toolbar = document.getElementById('canva-toolbar');
  if (toolbar) toolbar.classList.add('hidden');
  if (activeEl) {
      activeEl.classList.remove('ring-2', 'ring-dashed', 'ring-blue-400');
      activeEl = null;
  }
}

window.applyCanvaStyle = function(prop, value = null) {
  if (!activeEl) return;
  const computed = window.getComputedStyle(activeEl);

  if (prop === 'bold') {
      const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 700;
      activeEl.style.fontWeight = isBold ? 'normal' : 'bold';
  } 
  else if (prop === 'italic') {
      activeEl.style.fontStyle = computed.fontStyle === 'italic' ? 'normal' : 'italic';
  } 
  else if (prop === 'underline') {
      const isUnderlined = computed.textDecoration.includes('underline');
      activeEl.style.textDecoration = isUnderlined ? 'none' : 'underline';
  } 
  else if (prop === 'align') {
      activeEl.style.display = 'block'; 
      activeEl.style.width = '100%'; 
      activeEl.style.textAlign = value;
  } 
  else if (prop === 'font') {
      activeEl.style.fontFamily = value === 'Moul' ? "'Moul', serif" : "'Siemreap', sans-serif";
  }
};

function adjustActiveElSize(change) {
  if (!activeEl) return;
  const currentSize = parseFloat(window.getComputedStyle(activeEl).fontSize);
  activeEl.style.fontSize = (currentSize + change) + 'px';
}

function changeActiveElColor(color) {
  if (!activeEl) return;
  activeEl.style.color = color;
}

function moveActiveEl(dx, dy) {
  if (!activeEl) return;
  let currentTransform = activeEl.style.transform;
  let x = 0, y = 0;
  if (currentTransform && currentTransform.includes("translate")) {
      const match = currentTransform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
      if (match) { x = parseFloat(match[1]); y = parseFloat(match[2]); }
  }
  activeEl.style.transform = `translate(${x + dx}px, ${y + dy}px)`;
  if (window.getComputedStyle(activeEl).display === 'inline') {
      activeEl.style.display = 'inline-block';
  }
}

function dragStart(e) {
  if (e.target.closest('.canva-el')) {
      isDragging = true;
      activeEl = e.target.closest('.canva-el');
      let currentTransform = activeEl.style.transform;
      initialX = 0; initialY = 0;
      if (currentTransform && currentTransform.includes("translate")) {
          const match = currentTransform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
          if (match) { initialX = parseFloat(match[1]); initialY = parseFloat(match[2]); }
      }
      startX = e.clientX; startY = e.clientY;
      activeEl.style.cursor = 'grabbing';
      if (window.getComputedStyle(activeEl).display === 'inline') activeEl.style.display = 'inline-block';
  }
}
function drag(e) {
  if (isDragging && activeEl) {
      e.preventDefault(); 
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      activeEl.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
  }
}
function dragEnd(e) {
  isDragging = false;
  if (activeEl) activeEl.style.cursor = 'grab';
}

function rgbToHex(rgb) {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;
  function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
  return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
}

window.addEventListener('DOMContentLoaded', () => { initCanvaEngine(); });

// ==========================================================
// ១. មុខងារចំណាត់ថ្នាក់ 
// ==========================================================
window.setPrintPageSize = function(orientation) {
  let style = document.getElementById('dynamic-print-orientation');
  if (!style) {
    style = document.createElement('style');
    style.id = 'dynamic-print-orientation';
    document.head.appendChild(style);
  }
  
  // លុបពាក្យ size: A4 landscape/portrait ចេញ ដើម្បីឱ្យ Browser បើកសិទ្ធិរើសក្រដាសបានវិញ
  if (orientation === 'landscape') {
      style.innerHTML = '@page { margin: 0mm; }';
  } else {
      style.innerHTML = '@page { margin: 5mm; }';
  }
};

window.updateRankingPeriodDropdown = function() {
  const type = document.getElementById("rankPeriodType")?.value;
  const valSelect = document.getElementById("rankPeriodValue");
  if (!valSelect) return;
  if (type === "monthly") valSelect.innerHTML = `<option value="មករា">ខែមករា</option> <option value="កុម្ភៈ">ខែកុម្ភៈ</option> <option value="មីនា">ខែមីនា</option> <option value="មេសា">ខែមេសា</option> <option value="ឧសភា">ខែឧសភា</option> <option value="មិថុនា">ខែមិថុនា</option> <option value="កក្កដា">ខែកក្កដា</option> <option value="សីហា">ខែសីហា</option> <option value="កញ្ញា">ខែកញ្ញា</option> <option value="តុលា">ខែតុលា</option> <option value="វិច្ឆិកា">ខែវិច្ឆិកា</option> <option value="ធ្នូ">ខែធ្នូ</option>`;
  else if (type === "semester") valSelect.innerHTML = `<option value="ឆមាសទី១">ឆមាសទី១</option><option value="ឆមាសទី២">ឆមាសទី២</option>`;
  else if (type === "annual") valSelect.innerHTML = `<option value="លទ្ធផលប្រចាំឆ្នាំ">លទ្ធផលប្រចាំឆ្នាំ</option>`;
}

async function loadRankingsView(defaultGrade = "") {
  const container = document.getElementById("rankingsContainer");
  if (!container) return;

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
  const teacher_name = sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";
  const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
  const district = sInfo.district || ".......";
  const current_year = new Date().getFullYear();
  const grade = defaultGrade || "ថ្នាក់ទី ២ «ខ»";

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in relative pb-10">
      
      <!-- ផ្ទាំងបញ្ជាខាងលើ (Control Panel) -->
      <div class="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between xl:items-center gap-5 no-print relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1.5 h-full bg-yellow-400"></div>
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-xl shadow-sm"><i class="fa-solid fa-trophy"></i></div>
            តារាងចំណាត់ថ្នាក់
          </h2>
          <p class="text-sm text-slate-500 mt-1 md:ml-14">បោះពុម្ពតារាងចំណាត់ថ្នាក់ តារាងកិត្តិយស និងព្រឹត្តិបត្រពិន្ទុ</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- ស្វែងរក -->
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-slate-400"><i class="fa-solid fa-magnifying-glass"></i></span>
            <input type="text" id="rankSearch" oninput="filterRankTable()" placeholder="ស្វែងរកឈ្មោះ..." class="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-yellow-500 outline-none w-40 md:w-48 bg-slate-50 transition">
          </div>
          
          <!-- ថ្នាក់ និង បន្ទប់ -->
          <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 shadow-xs">
            <label class="text-[10px] font-bold text-slate-500 uppercase ml-1">ថ្នាក់</label>
            <select id="rankLevelSelect" onchange="fetchRankingsData()" class="border-none bg-transparent text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer p-1">
              <option value="ថ្នាក់ទី ១">ទី ១</option> <option value="ថ្នាក់ទី ២" selected>ទី ២</option>
              <option value="ថ្នាក់ទី ៣">ទី ៣</option> <option value="ថ្នាក់ទី ៤">ទី ៤</option>
              <option value="ថ្នាក់ទី ៥">ទី ៥</option> <option value="ថ្នាក់ទី ៦">ទី ៦</option>
            </select>
            <span class="text-slate-300">|</span>
            <select id="rankRoomSelect" onchange="fetchRankingsData()" class="border-none bg-transparent text-xs font-bold text-yellow-700 focus:ring-0 outline-none cursor-pointer p-1">
              <option value="«ក»">«ក»</option> <option value="«ខ»" selected>«ខ»</option> <option value="«គ»">«គ»</option> <option value="«ឃ»">«ឃ»</option>
            </select>
          </div>

          <!-- ប្រភេទពិន្ទុ -->
          <div class="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-2 py-1 shadow-xs">
            <label class="text-[10px] font-bold text-yellow-700 uppercase ml-1">ប្រភេទ</label>
            <select id="rankPeriodType" onchange="updateRankingPeriodDropdown(); fetchRankingsData();" class="border-none bg-transparent text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer p-1">
              <option value="monthly">ប្រចាំខែ</option>
              <option value="semester">ប្រចាំឆមាស</option>
              <option value="annual">ប្រចាំឆ្នាំ</option>
            </select>
            <span class="text-yellow-300">|</span>
            <select id="rankPeriodValue" onchange="fetchRankingsData()" class="border-none bg-transparent text-xs font-bold text-indigo-700 focus:ring-0 outline-none cursor-pointer p-1"></select>
          </div>
        </div>
      </div>

      <!-- កាតបង្ហាញ Top 3 (Dynamic KPI) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 no-print" id="top3CardsContainer">
         <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center text-slate-400 font-bold">កំពុងគណនា...</div>
      </div>

      <!-- ឧបករណ៍បញ្ជា (Action Toolbar) -->
      <div class="flex flex-wrap items-center justify-between gap-3 no-print">
        <div class="flex gap-2">
          <button onclick="openTranscriptModal()" class="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2">
            <i class="fa-solid fa-file-invoice"></i> ព្រឹត្តិបត្រពិន្ទុ
          </button>
          <button onclick="openTrackingBookModal()" class="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2">
            <i class="fa-solid fa-book-open-reader"></i> សៀវភៅតាមដាន
          </button>
          <button onclick="openTop5HonorModal()" class="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2">
            <i class="fa-solid fa-crown text-amber-500"></i> តារាងកិត្តិយស (Top 5)
          </button>
        </div>
        <div class="flex gap-2">
          <button onclick="exportRankingsToExcel()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2">
            <i class="fa-solid fa-file-excel"></i> Export Excel
          </button>
          <!-- ប្រើមុខងារថ្មី printRankingTable ដែលចេញជា ២ ជួរឈរ A4 Portrait -->
          <button onclick="printRankingTable()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2">
            <i class="fa-solid fa-print"></i> បោះពុម្ពចំណាត់ថ្នាក់
          </button>
        </div>
      </div>
      

      <!-- តារាងចំណាត់ថ្នាក់ (Web View) -->
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div id="rankingsPrintArea" class="w-full text-black">
          
          <div class="text-center my-6 font-siemreap">
            <h3 id="rankTableDocTitle" class="text-lg font-moul text-slate-900 tracking-wide">តារាងចំណាត់ថ្នាក់</h3>
            <p class="text-xs font-bold mt-2 text-slate-700">
              ថ្នាក់រៀន៖ <span id="lblRankGradeName" class="text-rose-600 font-moul mx-1">${grade}</span> | 
              ឆ្នាំសិក្សា៖ <span id="lblRankAcademicYear" class="mx-1">${academic_year}</span>
            </p>
          </div>

          <div class="overflow-x-auto print:overflow-visible print:w-full custom-scrollbar pb-4">
            <table id="rankTableMain" class="w-full border-collapse border border-black text-[10px] text-center whitespace-nowrap font-siemreap bg-white">
              <thead id="rankTableHead" class="text-slate-900 sticky top-0 shadow-sm"></thead>
              <tbody id="rankingsTableBody" class="divide-y divide-black border border-black">
                <tr><td colspan="17" class="p-12 text-center text-slate-400 font-bold"><i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i><br>កំពុងរៀបចំទិន្នន័យចំណាត់ថ្នាក់...</td></tr>
              </tbody>
            </table>
          </div>

          <!-- ផ្នែកស្ថិតិសង្ខេប (សម្រាប់ Web) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs mt-6 pt-4 font-siemreap">
            <div class="space-y-2 text-slate-900 border border-black p-4 rounded-xl bg-slate-50">
              <div class="flex justify-between border-b border-dashed border-slate-300 pb-2 font-bold text-sm">
                <span>សិស្សសរុបមានពិន្ទុ៖</span>
                <span><span id="rankSumTotal" class="text-indigo-700">0</span> នាក់ <span class="text-[10px] ml-1">(ស្រី៖ <span id="rankSumFemale" class="text-rose-600">0</span>)</span></span>
              </div>
              <div class="flex justify-between pt-1 font-semibold text-emerald-700"><span>ល្អ (៩.៥០ - ១០.០០)៖</span><span><span id="rank_c_9_10">0</span> នាក់ <span class="text-[10px]">(ស្រី៖ <span id="rank_cf_9_10">0</span>)</span></span></div>
              <div class="flex justify-between font-semibold text-teal-700"><span>ល្អបង្គួរ (៨.០០ - ៩.៤៩)៖</span><span><span id="rank_c_8_9">0</span> នាក់ <span class="text-[10px]">(ស្រី៖ <span id="rank_cf_8_9">0</span>)</span></span></div>
              <div class="flex justify-between font-semibold text-blue-600"><span>មធ្យម (៦.៥០ - ៧.៩៩)៖</span><span><span id="rank_c_65_79">0</span> នាក់ <span class="text-[10px]">(ស្រី៖ <span id="rank_cf_65_79">0</span>)</span></span></div>
              <div class="flex justify-between font-semibold text-amber-600"><span>ខ្សោយ (៥.០០ - ៦.៤៩)៖</span><span><span id="rank_c_5_64">0</span> នាក់ <span class="text-[10px]">(ស្រី៖ <span id="rank_cf_5_64">0</span>)</span></span></div>
              <div class="flex justify-between font-bold text-rose-600 border-t border-dashed border-rose-200 pt-1"><span>ធ្លាក់ (ក្រោម ៥.០០)៖</span><span><span id="rank_c_under_5">0</span> នាក់ <span class="text-[10px]">(ស្រី៖ <span id="rank_cf_under_5">0</span>)</span></span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal សម្រាប់ព្រឹត្តិបត្រពិន្ទុ (Transcript Modal) -->
      <div id="transcriptModal" class="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm hidden flex-col items-center justify-center p-4 font-siemreap fade-in no-print">
        <div class="bg-slate-200 rounded-3xl shadow-2xl w-full max-w-[850px] h-[95vh] flex flex-col overflow-hidden border border-slate-300">
          <div class="p-4 border-b border-slate-300 bg-white flex justify-between items-center shrink-0">
            <h2 class="font-bold text-lg text-slate-800 flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><i class="fa-solid fa-file-invoice"></i></div>
              ព្រឹត្តិបត្រពិន្ទុសិស្ស (Student Transcripts)
            </h2>
            <div class="flex gap-3">
              <button onclick="printOfficialTranscripts()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition">
                <i class="fa-solid fa-print"></i> Print ទាំងអស់
              </button>
              <button onclick="closeTranscriptModal()" class="w-10 h-10 bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition flex justify-center items-center">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div class="p-8 overflow-y-auto flex-1 flex flex-col items-center gap-8 custom-scrollbar" id="transcriptPrintArea">
             <!-- ព្រឹត្តិបត្រនឹងលោតមកទីនេះ -->
          </div>
        </div>
      </div>

    </div>
  `;
  updateRankingPeriodDropdown();

  const levelSelect = document.getElementById("rankLevelSelect");
  const roomSelect = document.getElementById("rankRoomSelect");
  if (defaultGrade && levelSelect && roomSelect) {
     const parts = defaultGrade.split(" ");
     if (parts.length >= 3) {
       levelSelect.value = parts[0] + " " + parts[1];
       roomSelect.value = parts[2];
     }
  }

  await fetchRankingsData();
}

function renderRankTableHeader(periodType) {
  let colHtml = "";
  if (periodType === "monthly") {
     colHtml = `<th class="border border-black p-1.5 w-6 bg-slate-200">ល.រ</th><th class="border border-black p-1.5 w-40 bg-slate-200 text-left">ឈ្មោះសិស្ស</th><th class="border border-black p-1.5 w-6 bg-slate-200">ភេទ</th><th class="border border-black p-1.5 w-14 bg-blue-100 text-blue-800">មធ្យមភាគ</th><th class="border border-black p-1.5 w-12 bg-amber-100 text-amber-800">ចំណាត់ថ្នាក់</th><th class="border border-black p-1.5 w-12 bg-emerald-100 text-emerald-800">និទ្ទេស</th>`;
  } else if (periodType === "semester") {
     colHtml = `<th class="border border-black p-1.5 w-6 bg-slate-200">ល.រ</th><th class="border border-black p-1.5 w-40 bg-slate-200 text-left">ឈ្មោះសិស្ស</th><th class="border border-black p-1.5 w-6 bg-slate-200">ភេទ</th><th class="border border-black p-1 w-10 bg-orange-50 text-orange-800">ម.ប្រឡង</th><th class="border border-black p-1 w-10 bg-blue-50 text-blue-800">ម.ប្រចាំខែ</th><th class="border border-black p-1 w-12 bg-rose-100 text-rose-800">ម.ឆមាស</th><th class="border border-black p-1 w-12 bg-amber-100 text-amber-800">ចំណាត់ថ្នាក់</th><th class="border border-black p-1.5 w-12 bg-emerald-100 text-emerald-800">និទ្ទេស</th>`;
  } else if (periodType === "annual") {
     colHtml = `<th class="border border-black p-1.5 w-6 bg-slate-200">ល.រ</th><th class="border border-black p-1.5 w-40 bg-slate-200 text-left">ឈ្មោះសិស្ស</th><th class="border border-black p-1.5 w-6 bg-slate-200">ភេទ</th><th class="border border-black p-1 w-12 bg-blue-50 text-blue-800">ម.ឆមាសទី១</th><th class="border border-black p-1 w-12 bg-indigo-50 text-indigo-800">ម.ឆមាសទី២</th><th class="border border-black p-1 w-14 bg-purple-100 text-purple-900">ម.ប្រចាំឆ្នាំ</th><th class="border border-black p-1 w-12 bg-amber-100 text-amber-800">ចំណាត់ថ្នាក់</th><th class="border border-black p-1.5 w-12 bg-emerald-100 text-emerald-800">និទ្ទេស</th>`;
  }
  return `<tr class="border-b border-black font-bold text-slate-800">${colHtml}</tr>`;
}

async function fetchRankingsData() {
  const level = document.getElementById("rankLevelSelect").value;
  const room = document.getElementById("rankRoomSelect").value;
  const grade = level ? `${level} ${room}` : ""; 
  const periodType = document.getElementById("rankPeriodType").value;
  const month = document.getElementById("rankPeriodValue").value || "មករា";
  
  if(document.getElementById("lblRankGradeName")) document.getElementById("lblRankGradeName").textContent = grade || "ថ្នាក់ទាំងអស់";
  const titleEl = document.getElementById("rankTableDocTitle");
  if(titleEl) {
     if (periodType === "semester") titleEl.innerHTML = `ចំណាត់ថ្នាក់ប្រចាំ <span class="text-rose-600">${month}</span>`;
     else if (periodType === "annual") titleEl.innerHTML = `ចំណាត់ថ្នាក់ <span class="text-rose-600">ប្រចាំឆ្នាំ</span>`;
     else titleEl.innerHTML = `ចំណាត់ថ្នាក់ប្រចាំ <span class="text-rose-600">ខែ${month}</span>`;
  }

  document.getElementById("rankTableHead").innerHTML = renderRankTableHeader(periodType);
  const tbody = document.getElementById("rankingsTableBody");
  tbody.innerHTML = `<tr><td colspan="17" class="p-12 text-center text-amber-600 font-bold"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><br>កំពុងគណនាចំណាត់ថ្នាក់...</td></tr>`;

  try {
    const params = grade ? { grade: grade } : {};
    let students = [], existingScores = [], sem1Scores = [], sem2Scores = [];

    if (periodType === "annual") {
       const [stRes, s1Res, s2Res, annRes] = await Promise.all([
         typeof apiGet === "function" ? apiGet("getStudents", params) : Promise.resolve({data:[]}),
         typeof apiGet === "function" ? apiGet("getScores", { month: "ឆមាសទី១", grade: grade }) : Promise.resolve({data:[]}),
         typeof apiGet === "function" ? apiGet("getScores", { month: "ឆមាសទី២", grade: grade }) : Promise.resolve({data:[]}),
         typeof apiGet === "function" ? apiGet("getScores", { month: "លទ្ធផលប្រចាំឆ្នាំ", grade: grade }) : Promise.resolve({data:[]})
       ]);
       students = stRes.data || []; sem1Scores = s1Res.data || []; sem2Scores = s2Res.data || []; existingScores = annRes.data || [];
    } else {
       const [stRes, scRes] = await Promise.all([
         typeof apiGet === "function" ? apiGet("getStudents", params) : Promise.resolve({data:[]}),
         typeof apiGet === "function" ? apiGet("getScores", { month: month, grade: grade }) : Promise.resolve({data:[]})
       ]);
       students = stRes.data || []; existingScores = scRes.data || [];
    }

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="17" class="p-8 text-center text-rose-500 font-bold bg-rose-50">គ្មានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ!</td></tr>`;
      renderTop3Cards([]);
      return;
    }

    let processedData = students.map(stu => {
      const scoreObj = existingScores.find(sc => String(sc.student_id) === String(stu.id)) || {};
      let item = { ...stu, rank: 0, gradeLetter: scoreObj.grade_letter || "-", rawScores: scoreObj }; 

      if (periodType === "monthly") {
        item.avg = parseFloat(scoreObj.average) || 0;
      } else if (periodType === "semester") {
        item.exam_avg = parseFloat(scoreObj.exam_avg) || 0;
        item.monthly_avg = parseFloat(scoreObj.monthly_avg) || 0;
        item.avg = parseFloat(scoreObj.sem_avg) || 0;
      } else if (periodType === "annual") {
        const s1 = sem1Scores.find(s => String(s.student_id) === String(stu.id)) || {};
        const s2 = sem2Scores.find(s => String(s.student_id) === String(stu.id)) || {};
        item.sem1_avg = parseFloat(s1.sem_avg) || parseFloat(scoreObj.sem1_avg) || 0;
        item.sem2_avg = parseFloat(s2.sem_avg) || parseFloat(scoreObj.sem2_avg) || 0;
        item.avg = parseFloat(scoreObj.annual_avg) || 0;
      }

      const format = (typeof appSettings !== 'undefined') ? appSettings.grade_format : "khmer";
      if (item.avg > 0) {
         if (item.avg >= 9.5) item.gradeLetter = format === "english" ? "A" : "ល្អ";
         else if (item.avg >= 8.0) item.gradeLetter = format === "english" ? "B" : "ល្អបង្គួរ";
         else if (item.avg >= 6.5) item.gradeLetter = format === "english" ? "C" : "មធ្យម";
         else if (item.avg >= 5.0) item.gradeLetter = format === "english" ? "D" : "ខ្សោយ";
         else item.gradeLetter = format === "english" ? "F" : "ធ្លាក់";
      }
      return item;
    });

    processedData = processedData.filter(item => item.avg > 0);
    processedData.sort((a, b) => b.avg - a.avg);

    if (processedData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="17" class="p-8 text-center text-slate-500 font-bold">សិស្សមិនទាន់មានពិន្ទុក្នុងខែ/ឆមាសនេះទេ!</td></tr>`;
      renderTop3Cards([]);
      return;
    }

    let currentRank = 1, actualPosition = 1, previousAvg = null;
    let total = 0, female = 0;
    let c9 = 0, cf9 = 0, c8 = 0, cf8 = 0, c6 = 0, cf6 = 0, c5 = 0, cf5 = 0, cU = 0, cfU = 0;

    rankingsDataList = processedData.map(item => {
      if (previousAvg !== null && item.avg < previousAvg) currentRank = actualPosition;
      item.rank = currentRank;
      previousAvg = item.avg;
      actualPosition++;

      total++;
      const isF = item.gender === "ស្រី";
      if (isF) female++;

      if (item.avg >= 9.5) { c9++; if(isF) cf9++; }
      else if (item.avg >= 8.0) { c8++; if(isF) cf8++; }
      else if (item.avg >= 6.5) { c6++; if(isF) cf6++; }
      else if (item.avg >= 5.0) { c5++; if(isF) cf5++; }
      else { cU++; if(isF) cfU++; }

      return item;
    });

    renderTop3Cards(rankingsDataList);

    if(document.getElementById('rankSumTotal')) {
        document.getElementById('rankSumTotal').textContent = total; 
        document.getElementById('rankSumFemale').textContent = female;
        document.getElementById('rank_c_9_10').textContent = c9; document.getElementById('rank_cf_9_10').textContent = cf9;
        document.getElementById('rank_c_8_9').textContent = c8; document.getElementById('rank_cf_8_9').textContent = cf8;
        document.getElementById('rank_c_65_79').textContent = c6; document.getElementById('rank_cf_65_79').textContent = cf6;
        document.getElementById('rank_c_5_64').textContent = c5; document.getElementById('rank_cf_5_64').textContent = cf5;
        document.getElementById('rank_c_under_5').textContent = cU; document.getElementById('rank_cf_under_5').textContent = cfU;
    }

    let rowsHtml = "";
    rankingsDataList.forEach((s, idx) => {
       const genderShort = s.gender === "ស្រី" ? "ស" : "ប";
       let rankDisplay = s.rank;
       let rankStyle = "text-slate-800";
       if (s.rank === 1) { rankDisplay = `🥇 1`; rankStyle = "bg-yellow-100 text-yellow-800"; }
       else if (s.rank === 2) { rankDisplay = `🥈 2`; rankStyle = "bg-slate-100 text-slate-800"; }
       else if (s.rank === 3) { rankDisplay = `🥉 3`; rankStyle = "bg-orange-100 text-orange-900"; }

       let trData = "";
       if (periodType === "monthly") {
         trData = `
           <td class="border border-black p-1 text-center font-bold text-slate-500">${idx + 1}</td>
           <td class="border border-black p-1 text-left px-2 truncate font-bold max-w-[140px] text-slate-800">${s.name}</td>
           <td class="border border-black p-1 text-center font-bold ${s.gender==='ស្រី'?'text-rose-500':'text-blue-600'}">${genderShort}</td>
           <td class="border border-black p-1 font-mono font-bold text-blue-700 bg-blue-50">${s.avg.toFixed(2)}</td>
           <td class="border border-black p-1 text-center font-bold font-mono ${rankStyle}">${rankDisplay}</td>
           <td class="border border-black p-1 text-emerald-700 font-bold bg-emerald-50">${s.gradeLetter}</td>
         `;
       } else if (periodType === "semester") {
         trData = `
           <td class="border border-black p-1 text-center font-bold text-slate-500">${idx + 1}</td>
           <td class="border border-black p-1 text-left px-2 truncate font-bold max-w-[140px] text-slate-800">${s.name}</td>
           <td class="border border-black p-1 text-center font-bold ${s.gender==='ស្រី'?'text-rose-500':'text-blue-600'}">${genderShort}</td>
           <td class="border border-black p-1 font-mono text-orange-700">${s.exam_avg.toFixed(2)}</td>
           <td class="border border-black p-1 font-mono text-blue-700">${s.monthly_avg.toFixed(2)}</td>
           <td class="border border-black p-1 font-mono font-bold text-rose-700 bg-rose-50">${s.avg.toFixed(2)}</td>
           <td class="border border-black p-1 text-center font-bold font-mono ${rankStyle}">${rankDisplay}</td>
           <td class="border border-black p-1 text-emerald-700 font-bold bg-emerald-50">${s.gradeLetter}</td>
         `;
       } else {
         trData = `
           <td class="border border-black p-1 text-center font-bold text-slate-500">${idx + 1}</td>
           <td class="border border-black p-1 text-left px-2 truncate font-bold max-w-[140px] text-slate-800">${s.name}</td>
           <td class="border border-black p-1 text-center font-bold ${s.gender==='ស្រី'?'text-rose-500':'text-blue-600'}">${genderShort}</td>
           <td class="border border-black p-1 font-mono text-blue-700">${s.sem1_avg.toFixed(2)}</td>
           <td class="border border-black p-1 font-mono text-indigo-700">${s.sem2_avg.toFixed(2)}</td>
           <td class="border border-black p-1 font-mono font-bold text-purple-700 bg-purple-50">${s.avg.toFixed(2)}</td>
           <td class="border border-black p-1 text-center font-bold font-mono ${rankStyle}">${rankDisplay}</td>
           <td class="border border-black p-1 text-emerald-700 font-bold bg-emerald-50">${s.gradeLetter}</td>
         `;
       }

       rowsHtml += `<tr class="border-b border-black hover:bg-slate-50 transition duration-200">${trData}</tr>`;
    });

    tbody.innerHTML = rowsHtml;

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="17" class="p-8 text-center text-rose-500 font-bold"><i class="fa-solid fa-triangle-exclamation mb-2 text-2xl"></i><br>បរាជ័យក្នុងការតភ្ជាប់ទិន្នន័យ</td></tr>`;
  }
}

function renderTop3Cards(list) {
  const container = document.getElementById("top3CardsContainer");
  if(!container) return;
  
  if(list.length === 0) {
     container.innerHTML = `<div class="col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center text-slate-400 font-bold">មិនមានទិន្នន័យចំណាត់ថ្នាក់ទេ</div>`;
     return;
  }

  const getS = (rank) => list.find(s => s.rank === rank) || null;
  const s1 = getS(1), s2 = getS(2), s3 = getS(3);

  const drawCard = (stu, rank, colors, icon) => {
     if(!stu) return `<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm opacity-50 flex items-center justify-center"><p class="text-slate-400 font-bold">លេខ ${rank} មិនទាន់មាន</p></div>`;
     const photo = stu.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.name)}&background=random`;
     return `
        <div class="bg-gradient-to-br ${colors} p-5 rounded-3xl text-white shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition duration-300 flex items-center gap-4">
           <div class="absolute -right-4 -bottom-4 text-7xl opacity-20">${icon}</div>
           <div class="relative z-10 w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden shadow-inner shrink-0 bg-white">
              <img src="${photo}" class="w-full h-full object-cover">
           </div>
           <div class="relative z-10 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">លេខ ${rank}</p>
              <h4 class="font-bold text-base leading-tight truncate drop-shadow-sm mb-1">${stu.name}</h4>
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/20 rounded-lg text-xs font-mono font-bold border border-white/10">
                 មធ្យម៖ ${stu.avg.toFixed(2)}
              </div>
           </div>
        </div>
     `;
  };

  container.innerHTML = `
     ${drawCard(s2, 2, "from-slate-400 to-slate-600 shadow-slate-300", "🥈")}
     ${drawCard(s1, 1, "from-amber-400 to-orange-500 shadow-orange-300 transform md:-translate-y-2", "🥇")}
     ${drawCard(s3, 3, "from-orange-700 to-red-800 shadow-red-300", "🥉")}
  `;
}

function filterRankTable() {
  const term = document.getElementById("rankSearch").value.toLowerCase();
  const rows = document.querySelectorAll("#rankingsTableBody tr");
  rows.forEach(row => {
    const leftName = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
    if(leftName.includes(term)) row.style.display = "";
    else row.style.display = "none";
  });
}

function exportRankingsToExcel() {
    const table = document.getElementById("rankTableMain");
    const wb = XLSX.utils.table_to_book(table, {sheet: "Rankings"});
    XLSX.writeFile(wb, `តារាងចំណាត់ថ្នាក់.xlsx`);
}

// =========================================================================
// មុខងារបោះពុម្ពព្រឹត្តិបត្រពិន្ទុផ្លូវការ (Isolated Print - 1 Student per A4 Portrait)
// =========================================================================
function printOfficialTranscripts() {
  if (!rankingsDataList || rankingsDataList.length === 0) {
    alert("⚠️ មិនមានទិន្នន័យសម្រាប់បោះពុម្ពទេ សូមជ្រើសរើសថ្នាក់ និងរង់ចាំទាញទិន្នន័យសិន!");
    return;
  }
  
  const periodType = document.getElementById("rankPeriodType").value;
  const periodVal = document.getElementById("rankPeriodValue").value;
  const grade = document.getElementById("rankLevelSelect").value + " " + document.getElementById("rankRoomSelect").value;
  const totalStudents = rankingsDataList.length;
  
  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
  const current_year = new Date().getFullYear();
  const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
  const principal_name = sInfo.principal_name || "នាយកសាលា";
  const teacher_name = sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";
  
  let title = "";
  if (periodType === "monthly") title = `ព្រឹត្តិបត្រពិន្ទុប្រចាំខែ ${periodVal}`;
  else if (periodType === "semester") title = `ព្រឹត្តិបត្រពិន្ទុប្រចាំ ${periodVal}`;
  else title = `ព្រឹត្តិបត្រពិន្ទុប្រចាំឆ្នាំ`;
  
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');

  const subjectDict = {
    k_listen: "ភាសាខ្មែរ (ស្តាប់)", k_write: "ភាសាខ្មែរ (សរសេរ)", k_read: "ភាសាខ្មែរ (អាន)", k_compose: "ភាសាខ្មែរ (តែងសេចក្តី)",
    m_num: "គណិតវិទ្យា (ចំនួន)", m_measure: "គណិតវិទ្យា (រង្វាស់រង្វាល់)", m_geo: "គណិតវិទ្យា (ធរណីមាត្រ)", m_alg: "គណិតវិទ្យា (ពីជគណិត)", m_stat: "គណិតវិទ្យា (ស្ថិតិ)",
    s_phy: "វិទ្យាសាស្ត្រ (រូបវិទ្យា)", s_chem: "វិទ្យាសាស្ត្រ (គីមីវិទ្យា)", s_bio: "វិទ្យាសាស្ត្រ (ជីវវិទ្យា)", s_earth: "វិទ្យាសាស្ត្រ (ផែនដី)",
    ss_moral: "សិក្សាសង្គម (សីលធម៌)", ss_geo: "សិក្សាសង្គម (ភូមិវិទ្យា)", ss_hist: "សិក្សាសង្គម (ប្រវត្តិវិទ្យា)",
    pe_art: "អប់រំកាយ (សិល្បៈ)", pe_sport: "អប់រំកាយ (កីឡា)", pe_health: "អប់រំកាយ (សុខភាព)",
    life_skill: "បំណិនជីវិត"
  };
  const SUBJECT_KEYS = Object.keys(subjectDict);
  
  let allTranscriptsHtml = "";
  
  for (let i = 0; i < rankingsDataList.length; i++) {
      const s = rankingsDataList[i];
      let trHtml = "";
      let totalObtained = 0;
      let subCount = 1;
      const raw = s.rawScores || {}; 
      
      SUBJECT_KEYS.forEach(k => {
          const scoreVal = raw[k];
          const score = parseFloat(scoreVal);
          
          let displayScore = "";
          let gradeL = "-", c_color = "text-slate-400", status = "-", remark = "-";

          if (!isNaN(score) && scoreVal !== "") {
              totalObtained += score;
              displayScore = score;
              
              if (score >= 9.5) { gradeL = "A"; c_color = "text-emerald-600"; }
              else if (score >= 8.0) { gradeL = "B"; c_color = "text-teal-600"; }
              else if (score >= 6.5) { gradeL = "C"; c_color = "text-blue-600"; }
              else if (score >= 5.0) { gradeL = "D"; c_color = "text-amber-600"; }
              else { gradeL = "F"; c_color = "text-rose-600"; }
              
              status = score >= 5 ? "ជាប់" : "ធ្លាក់";
              remark = score >= 8 ? "ល្អ" : (score >= 5 ? "មធ្យម" : "ខ្សោយ");
          }

          trHtml += `
             <tr class="border-b border-black text-[11px]" style="height: 23px;">
                <td class="border-r border-black p-0 text-center">${toKhmerNum(subCount)}</td>
                <td class="border-r border-black p-0 px-2 text-left font-bold text-slate-800">${subjectDict[k]}</td>
                <td class="border-r border-black p-0 text-center font-mono">១០</td>
                <td class="border-r border-black p-0 text-center font-bold text-indigo-700 font-mono">${displayScore}</td>
                <td class="border-r border-black p-0 text-center text-slate-400">-</td>
                <td class="border-r border-black p-0 text-center font-bold ${c_color}">${gradeL}</td>
                <td class="border-r border-black p-0 text-center text-slate-800">${remark}</td>
                <td class="border-r border-black p-0 text-center ${status === 'ជាប់' ? 'text-emerald-600' : (status === 'ធ្លាក់' ? 'text-rose-600' : 'text-slate-400')} font-bold">${status}</td>
                <td class="p-0 text-center"></td>
             </tr>
          `;
          subCount++;
      });

      const photoUrl = s.photo_url || "https://placehold.co/120x160/e2e8f0/64748b?text=Photo";

      allTranscriptsHtml += `
         <!-- ក្រដាស A4 មួយសន្លឹកពេញ -->
         <div class="a4-page mx-auto bg-white box-border flex flex-col relative" style="width: 210mm; height: 297mm; padding: 15mm; page-break-after: always; overflow: hidden;">
            
            <div class="flex justify-between items-start mb-4">
               <div class="flex items-start gap-3 w-1/3">
                 <img src="${sInfo.logo_url || 'https://placehold.co/80x80/f8fafc/94a3b8?text=Logo'}" class="w-[65px] h-[65px] object-contain shrink-0" alt="Logo">
                 <div class="text-left text-[11px] font-bold leading-tight mt-1">
                    <p class="font-moul text-[13px] text-blue-900 mb-1">${school_name}</p>
                    <p>ថ្នាក់ទី៖ <span class="text-rose-600">${grade.replace('ថ្នាក់ទី ', '')}</span></p>
                    <p>ឆ្នាំសិក្សា៖ ${academic_year}</p>
                 </div>
               </div>
               <div class="text-center w-1/3 pt-1">
                  <p class="font-moul text-[13px] m-0 leading-tight text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p class="font-moul text-[13px] m-0 leading-tight mt-1 text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  <div class="w-16 mx-auto border-b-[1.5px] border-black mt-2"></div>
               </div>
               <div class="w-1/3 flex justify-end">
                 <div class="w-[30mm] h-[40mm] border border-slate-300 p-[2px] bg-slate-50 overflow-hidden flex items-center justify-center">
                    <img src="${photoUrl}" class="w-full h-full object-cover grayscale" alt="Photo">
                 </div>
               </div>
            </div>
            
            <div class="text-center mb-4">
               <h2 class="font-moul text-lg text-blue-800 tracking-wide m-0">${title}</h2>
            </div>
            
            <div class="flex justify-between items-center font-bold text-xs mb-3 px-4 py-2 border border-slate-300 rounded text-slate-800" style="background-color: #f8fafc !important; -webkit-print-color-adjust: exact;">
               <div>អត្តលេខ៖ <span class="ml-2 font-mono text-slate-600">${toKhmerNum(s.id)}</span></div>
               <div>សិស្សឈ្មោះ៖ <span class="ml-2 font-moul text-blue-900 text-sm">${s.name}</span></div>
               <div>ភេទ៖ <span class="ml-2 text-blue-900">${s.gender}</span></div>
            </div>
            
            <table class="w-full border-collapse border border-black text-center text-[12px] flex-1">
               <thead>
                  <tr class="font-bold border-b border-black h-[28px]" style="background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact;">
                     <th class="border-r border-black p-0 w-8">ល.រ</th>
                     <th class="border-r border-black p-0 text-left px-2">មុខវិជ្ជា</th>
                     <th class="border-r border-black p-0 w-14 leading-tight">ពិន្ទុ<br>អតិបរមា</th>
                     <th class="border-r border-black p-0 w-14 leading-tight">ពិន្ទុ<br>បាន</th>
                     <th class="border-r border-black p-0 w-14 leading-tight">ចំណាត់<br>ថ្នាក់</th>
                     <th class="border-r border-black p-0 w-14">និទ្ទេស</th>
                     <th class="border-r border-black p-0 w-18">មូលវិចារ</th>
                     <th class="border-r border-black p-0 w-14">លទ្ធផល</th>
                     <th class="p-0 w-18">ផ្សេងៗ</th>
                  </tr>
               </thead>
               <tbody>${trHtml}</tbody>
               <tfoot class="border-t border-black">
                  <tr class="font-bold h-[24px]" style="background-color: #f8fafc !important; -webkit-print-color-adjust: exact;">
                     <td colspan="2" class="border-r border-black p-0 text-right px-2 text-slate-800">ពិន្ទុសរុប</td>
                     <td class="border-r border-black p-0 text-blue-800 font-mono">២០០</td>
                     <td class="border-r border-black p-0 text-rose-600 font-mono">${totalObtained.toFixed(2)}</td>
                     <td colspan="5" class="p-0 bg-white"></td>
                  </tr>
                  <tr class="font-bold text-[12px] border-t border-black h-[28px]" style="background-color: #fef3c7 !important; -webkit-print-color-adjust: exact;">
                     <td colspan="2" class="border-r border-black p-0 text-right px-2 text-slate-800">មធ្យមភាគ និងចំណាត់ថ្នាក់</td>
                     <td colspan="2" class="border-r border-black p-0 text-blue-800 font-mono text-[13px]">${s.avg.toFixed(2)}</td>
                     <td class="border-r border-black p-0 text-rose-700 text-[13px]" style="background-color: #ffe4e6 !important; -webkit-print-color-adjust: exact;">${toKhmerNum(s.rank)} <span class="text-[9px] text-slate-400 font-normal">/${toKhmerNum(totalStudents)}</span></td>
                     <td class="border-r border-black p-0 text-emerald-700">${s.gradeLetter}</td>
                     <td class="border-r border-black p-0">${s.avg >= 5 ? 'ល្អ' : 'ខ្សោយ'}</td>
                     <td class="border-r border-black p-0 ${s.avg >= 5 ? 'text-emerald-700' : 'text-rose-600'}">${s.avg >= 5 ? 'ជាប់' : 'ធ្លាក់'}</td>
                     <td class="p-0"></td>
                  </tr>
               </tfoot>
            </table>

            <div class="flex justify-between items-end mt-4 pt-2 text-[12px] font-bold px-10 shrink-0">
               <div class="text-center">
                  <p class="mb-1">បានឃើញ និងឯកភាព</p>
                  <p class="font-normal text-[11px] text-slate-600 mb-1">នាយកសាលា</p>
                  <div class="h-24"></div>
                  <p class="font-moul text-[13px] text-blue-900 m-0">${principal_name}</p>
               </div>
               <div class="text-center">
                  <p class="font-normal text-[11px] text-slate-600 mb-1">ធ្វើនៅ..............., ថ្ងៃទី........ខែ........ឆ្នាំ ${toKhmerNum(current_year)}</p>
                  <p class="mb-1">គ្រូបន្ទុកថ្នាក់</p>
                  <div class="h-24"></div>
                  <p class="font-moul text-[13px] text-blue-900 m-0">${teacher_name}</p>
               </div>
            </div>
            
         </div>
      `;
  }

  // កសាងឯកសារ Print ពេញលេញដោយបញ្ចូល Tailwind CSS ដើម្បីរក្សា Design
  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>បោះពុម្ពព្រឹត្តិបត្រពិន្ទុ - ${grade}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        @page { size: A4 portrait; margin: 0; }
        body { margin: 0; padding: 0; background: #e2e8f0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .font-moul { font-family: 'Moul', serif; }
        .font-siemreap { font-family: 'Siemreap', sans-serif; }
        @media print {
           body { background: white; }
           .a4-page { box-shadow: none !important; margin: 0 !important; }
        }
      </style>
    </head>
    <body class="font-siemreap">
      ${allTranscriptsHtml}
    </body>
    </html>
  `;

  // បើកផ្ទាំង Print ថ្មី
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  printWindow.document.open();
  printWindow.document.write(printDocument);
  printWindow.document.close();

  // រង់ចាំ 1 វិនាទី ឱ្យ Tailwind និង Font ដំណើរការចប់សិន ទើបបញ្ជា Print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 1000);
}
// =========================================================================
// មុខងារបោះពុម្ពតារាងចំណាត់ថ្នាក់ (Ranking Table - Perfect Column Fit & Left Summary)
// =========================================================================
function printRankingTable() {
  const level = document.getElementById("rankLevelSelect")?.value || "";
  const room = document.getElementById("rankRoomSelect")?.value || "";
  const grade = level ? `${level} ${room}` : "ថ្នាក់ទី ២ «ខ»";
  const month = document.getElementById("rankPeriodValue")?.value || "មករា";

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា គំរូ";
  const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
  const academicYear = sInfo.academic_year || "2026-2027";
  const teacherName = sInfo.teacher_name || ".......................";
  const principalName = sInfo.principal_name || ".......................";
  const currentYear = new Date().getFullYear();

  // ជំនួយការបំប្លែងលេខទៅជាលេខខ្មែរ
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');

  let rankedStudents = [];
  if (!rankingsDataList || rankingsDataList.length === 0) {
      alert("⚠️ មិនមានទិន្នន័យចំណាត់ថ្នាក់សម្រាប់បោះពុម្ពទេ!");
      return;
  }

  // ចម្លងទិន្នន័យចេញពី Data ដើម ដែលបានគណនារួច
  rankedStudents = [...rankingsDataList];
  rankedStudents.sort((a, b) => a.rank - b.rank);

  // គណនាទិន្នន័យសង្ខេប (Summary Statistics)
  let total = 0, female = 0;
  let c9 = 0, cf9 = 0, c8 = 0, cf8 = 0, c6 = 0, cf6 = 0, c5 = 0, cf5 = 0, cU = 0, cfU = 0;

  rankedStudents.forEach(s => {
    total++;
    const isF = s.gender === "ស្រី";
    if (isF) female++;

    if (s.avg >= 9.5) { c9++; if(isF) cf9++; }
    else if (s.avg >= 8.0) { c8++; if(isF) cf8++; }
    else if (s.avg >= 6.5) { c6++; if(isF) cf6++; }
    else if (s.avg >= 5.0) { c5++; if(isF) cf5++; }
    else { cU++; if(isF) cfU++; }
  });

  // បូកសរុបសិស្សជាប់ និងធ្លាក់
  const passedTotal = c9 + c8 + c6 + c5;
  const passedFemale = cf9 + cf8 + cf6 + cf5;
  const failedTotal = cU;
  const failedFemale = cfU;

  const half = Math.ceil(rankedStudents.length / 2);
  const leftList = rankedStudents.slice(0, half);
  const rightList = rankedStudents.slice(half);

  // កសាងជួរដេកនីមួយៗ (លុប Inline Width ចេញដើម្បីប្រើ CSS Classes ជំនួសវិញ)
  let rowsHtml = "";
  for (let i = 0; i < half; i++) {
      const s1 = leftList[i];
      const s2 = rightList[i];

      const row1Html = s1 ? `
          <td>${toKhmerNum(i + 1)}</td>
          <td style="text-align: left; padding-left: 6px;">${s1.name}</td>
          <td style="color: #1d4ed8;">${s1.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
          <td style="font-weight: bold; color: #1d4ed8; font-family: monospace;">${toKhmerNum(s1.avg.toFixed(2))}</td>
          <td style="font-weight: bold; color: #e11d48; font-family: monospace; background-color: #fff1f2 !important;">${toKhmerNum(s1.rank)}</td>
      ` : `<td></td><td></td><td></td><td></td><td></td>`;

      const row2Html = s2 ? `
          <td style="border-left: 2px solid #000;">${toKhmerNum(half + i + 1)}</td>
          <td style="text-align: left; padding-left: 6px;">${s2.name}</td>
          <td style="color: #1d4ed8;">${s2.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
          <td style="font-weight: bold; color: #1d4ed8; font-family: monospace;">${toKhmerNum(s2.avg.toFixed(2))}</td>
          <td style="font-weight: bold; color: #e11d48; font-family: monospace; background-color: #fff1f2 !important;">${toKhmerNum(s2.rank)}</td>
      ` : `<td style="border-left: 2px solid #000;"></td><td></td><td></td><td></td><td></td>`;

      rowsHtml += `<tr>${row1Html}${row2Html}</tr>`;
  }

  const printContent = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>តារាងចំណាត់ថ្នាក់ខែ${month} - ${grade}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        
        @page { margin: 10mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; font-family: 'Siemreap', sans-serif; color: #000; background: #fff; }
        .font-moul { font-family: 'Moul', serif; }
        .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .header-left p { margin: 0 0 5px 0; font-size: 13px; color: #1e1b4b; }
        .header-right { text-align: center; }
        .header-right p { margin: 0 0 4px 0; font-size: 14px; }
        .title-box { text-align: center; margin: 15px 0 15px 0; }
        .title-box h2 { margin: 0 0 6px 0; font-size: 20px; color: #0f172a; }
        .title-box p { margin: 0; font-size: 13px; font-weight: bold; }
        
        /* Main Table with Fixed Layout */
        .main-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; table-layout: fixed; }
        .main-table th, .main-table td { border: 1px solid #000; padding: 4px 2px; height: 26px; word-wrap: break-word; }
        .main-table th { background-color: #f1f5f9 !important; font-weight: bold; font-size: 11px; }
        
        /* កំណត់ទំហំក្រឡោននីមួយៗឱ្យសមល្មម 50% ក្នុងមួយចំហៀង */
        .col-no { width: 4.5%; }
        .col-name { width: 23%; }
        .col-gender { width: 4.5%; }
        .col-avg { width: 9%; }
        .col-rank { width: 9%; }

        /* Left Summary Table */
        .summary-wrapper { display: flex; justify-content: flex-start; margin-top: 15px; }
        .summary-box { border: 1.5px solid #000; border-radius: 6px; padding: 8px 15px; background-color: #f8fafc; min-width: 45%; box-shadow: 2px 2px 0px #e2e8f0; }
        .summary-title { font-family: 'Moul', serif; font-size: 12px; margin-bottom: 8px; text-decoration: underline; color: #0f172a; }
        .summary-table { width: 100%; border-collapse: collapse; font-size: 12px; font-weight: bold; }
        .summary-table td { border: none !important; padding: 4px 5px !important; height: auto !important; background: transparent !important; }
        .num-badge { font-family: monospace; font-size: 14px; margin: 0 2px; display: inline-block; min-width: 20px; text-align: center; }
        
        /* Footer Signatures */
        .footer-box { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; padding: 0 30px; font-size: 12px; }
        .footer-col { text-align: center; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="header-left"><br><br>
          <p class="font-moul" style="font-size: 13px;">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាល${districtName}</p>
          <p class="font-moul" style="font-size: 14px; color: #1e3a8a;">${schoolName}</p>
        </div>
        <div class="header-right">
          <p class="font-moul">ព្រះរាជាណាចក្រកម្ពុជា</p>
          <p class="font-moul">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          <div style="font-family: Tacteing; letter-spacing: 3px; font-weight: bold; margin-top: -3px;">3</div>
        </div>
      </div>

      <div class="title-box">
        <h2 class="font-moul">តារាងចំណាត់ថ្នាក់ប្រចាំ <span style="color: #e11d48;">ខែ${month}</span></h2>
        <p><span class="font-moul" style="color: #e11d48;">${grade}</span> ឆ្នាំសិក្សា ${toKhmerNum(academicYear)}</p>
      </div>

      <table class="main-table">
        <thead>
          <tr>
            <!-- ជួរឈរចំហៀងខាងឆ្វេង (50%) -->
            <th class="col-no">ល.រ</th>
            <th class="col-name">គោត្តនាម និងនាម</th>
            <th class="col-gender">ភេទ</th>
            <th class="col-avg">មធ្យមភាគ</th>
            <th class="col-rank" style="color: #e11d48;">ចំណាត់ថ្នាក់</th>
            
            <!-- ជួរឈរចំហៀងខាងស្តាំ (50%) -->
            <th class="col-no" style="border-left: 2px solid #000;">ល.រ</th>
            <th class="col-name">គោត្តនាម និងនាម</th>
            <th class="col-gender">ភេទ</th>
            <th class="col-avg">មធ្យមភាគ</th>
            <th class="col-rank" style="color: #e11d48;">ចំណាត់ថ្នាក់</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <!-- តារាងសង្ខេបស្ថិតិ ផ្នែកខាងឆ្វេង -->
      <div class="summary-wrapper">
         <div class="summary-box">
            <div class="summary-title">តារាងសង្ខេបស្ថិតិ</div>
            <table class="summary-table">
               <tr style="color: #1e293b;">
                  <td style="text-align: left;">បញ្ឈប់បញ្ជីត្រឹម</td>
                  <td style="text-align: right;"><span class="num-badge">${toKhmerNum(total)}</span> នាក់</td>
                  <td style="text-align: right;">ស្រី <span class="num-badge">${toKhmerNum(female)}</span> នាក់</td>
               </tr>
               <tr style="color: #047857; border-top: 1px dashed #cbd5e1 !important;">
                  <td style="text-align: left; padding-top: 6px !important;">សិស្សជាប់មធ្យមភាគសរុប</td>
                  <td style="text-align: right; padding-top: 6px !important;"><span class="num-badge">${toKhmerNum(passedTotal)}</span> នាក់</td>
                  <td style="text-align: right; padding-top: 6px !important;">ស្រី <span class="num-badge">${toKhmerNum(passedFemale)}</span> នាក់</td>
               </tr>
               <tr style="color: #e11d48;">
                  <td style="text-align: left;">សិស្សធ្លាក់មធ្យមភាគសរុប</td>
                  <td style="text-align: right;"><span class="num-badge">${toKhmerNum(failedTotal)}</span> នាក់</td>
                  <td style="text-align: right;">ស្រី <span class="num-badge">${toKhmerNum(failedFemale)}</span> នាក់</td>
               </tr>
            </table>
         </div>
      </div>

      <div class="footer-box">
        <div class="footer-col">
          <p style="font-weight: normal; margin: 0 0 6px 0;">បានឃើញ និងឯកភាព</p>
          <p class="font-moul" style="font-size: 12px; margin: 0;">នាយកសាលា</p>
          <div style="height: 60px;"></div>
          <p class="font-moul" style="font-size: 12px; margin: 0; color: #1e3a8a;">${principalName}</p>
        </div>
        <div class="footer-col">
          <p style="font-weight: normal; margin: 0 0 6px 0;">ថ្ងៃ.......................ខែ............ឆ្នាំ..............ព.ស.២៥៧..</p>
          <p style="font-weight: normal; margin: 0 0 6px 0;">ធ្វើនៅ................., ថ្ងៃទី........ខែ........ឆ្នាំ ${toKhmerNum(currentYear)}</p>
          <p class="font-moul" style="font-size: 12px; margin: 0;">គ្រូបន្ទុកថ្នាក់</p>
          <div style="height: 60px;"></div>
          <p class="font-moul" style="font-size: 12px; margin: 0; color: #1e3a8a;">${teacherName}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 400);
}
// ==========================================================
// ផ្នែកទី ២៖ តារាងកិត្តិយស Top 5 (Honor Board) - រចនាបែប Canva
// ==========================================================
window.changeHonorFrame = function(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) { window.currentHonorBg = e.target.result; renderTop5HonorBoard(); }
      reader.readAsDataURL(file);
  }
}

function closeTop5HonorModal() {
  const modal = document.getElementById("top5HonorModal");
  if (modal) { modal.classList.add("hidden"); modal.classList.remove("flex"); closeCanvaToolbar(); }
}

function openTop5HonorModal() {
  if (!rankingsDataList || rankingsDataList.length === 0) {
    alert("⚠️ មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់ទេ! សូមជ្រើសរើសថ្នាក់ និងទាញទិន្នន័យជាមុនសិន។"); return;
  }
  let modal = document.getElementById("top5HonorModal");
  if (!modal) {
    const modalHtml = `
      <div id="top5HonorModal" class="fixed inset-0 z-[5000] bg-slate-900/80 backdrop-blur-sm hidden flex-col items-center justify-center p-4 font-siemreap fade-in no-print">
        <div class="bg-slate-100 rounded-3xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col overflow-hidden border border-slate-300">
          <div class="p-4 border-b border-slate-300 bg-white flex justify-between items-center shrink-0">
            <h2 class="font-bold text-lg text-slate-800 flex items-center gap-2">
              <div class="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><i class="fa-solid fa-crown"></i></div>
              តារាងកិត្តិយសសិស្សឆ្នើម
            </h2>
            <div class="flex items-center gap-2">
              <div class="bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-pink-200 animate-pulse hidden md:block">
                <i class="fa-solid fa-hand-pointer"></i> អាចចុច កែអក្សរ និងអូសរំកិលបាន
              </div>
              <label class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer mb-0">
                <i class="fa-solid fa-image"></i> បញ្ចូលស៊ុម (Frame)
                <input type="file" accept="image/*" class="hidden" onchange="changeHonorFrame(event)">
              </label>
              <!-- កែសម្រួល៖ ប្រើមុខងារ Print ដាច់ដោយឡែក (Isolated) -->
              <button onclick="printOfficialHonorBoard()" class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2">
                 <i class="fa-solid fa-print"></i> Print
              </button>
              <button onclick="closeTop5HonorModal()" class="w-8 h-8 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition flex justify-center items-center"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
          <div class="p-6 overflow-y-auto flex-1 flex flex-col items-center custom-scrollbar bg-slate-300" id="top5HonorContainer"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById("top5HonorModal");
  }
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  renderTop5HonorBoard();
}

function renderTop5HonorBoard() {
  const container = document.getElementById("top5HonorContainer");
  const level = document.getElementById("rankLevelSelect")?.value || "ថ្នាក់ទី";
  const room = document.getElementById("rankRoomSelect")?.value || "";
  const periodType = document.getElementById("rankPeriodType")?.value || "monthly";
  const periodVal = document.getElementById("rankPeriodValue")?.value || "";

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
  const teacher_name = sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";
  const principal_name = sInfo.principal_name || "នាយកសាលា";
  const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
  const current_year = new Date().getFullYear();

  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');

  let periodTitleText = periodType === "monthly" ? `លទ្ធផលសិក្សាប្រចាំខែ ${periodVal}` : (periodType === "semester" ? `លទ្ធផលសិក្សាប្រចាំ${periodVal}` : `លទ្ធផលសិក្សាប្រចាំឆ្នាំ`);

  const top5 = rankingsDataList.filter(s => s.rank >= 1 && s.rank <= 5);
  const getS = (r) => top5.find(s => s.rank === r) || null;

  // Render កាតសិស្សម្នាក់ៗ (មាន Class canva-el)
  const renderStudentCard = (stu, rankNum) => {
    let theme = {};
    if (rankNum === 1) theme = { border: 'border-yellow-400', ring: 'ring-yellow-200', badge: 'bg-gradient-to-br from-yellow-400 to-yellow-600' };
    else if (rankNum === 2) theme = { border: 'border-slate-300', ring: 'ring-slate-200', badge: 'bg-gradient-to-br from-slate-300 to-slate-500' };
    else if (rankNum === 3) theme = { border: 'border-orange-400', ring: 'ring-orange-200', badge: 'bg-gradient-to-br from-orange-400 to-orange-600' };
    else theme = { border: 'border-blue-400', ring: 'ring-blue-200', badge: 'bg-gradient-to-br from-blue-500 to-blue-700' };

    if (!stu) return `<div class="canva-el flex items-center justify-center w-[110px] h-[145px] border-2 border-dashed border-slate-300 bg-white/50 text-slate-400 text-xs rounded-xl opacity-50 cursor-grab">ទទេ</div>`;

    const photoSrc = stu.photo_url || "https://placehold.co/100x130/f8fafc/94a3b8?text=Photo";

    return `
      <div class="canva-el flex flex-col items-center relative z-10 w-36 cursor-grab group">
        <div class="relative">
          <div class="absolute -top-4 -right-4 w-11 h-11 rounded-full ${theme.badge} text-white font-bold flex items-center justify-center text-sm shadow-lg border-[3px] border-white z-20 font-moul pointer-events-none">${toKhmerNum(rankNum)}</div>
          <div class="w-[105px] h-[135px] rounded-xl overflow-hidden border-[4px] ${theme.border} shadow-lg ring-4 ${theme.ring} bg-white pointer-events-none">
            <img src="${photoSrc}" class="w-full h-full object-cover">
          </div>
        </div>
        <div class="mt-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl w-[150px] p-2.5 text-center shadow-md relative z-10">
          <h4 contenteditable="true" spellcheck="false" class="font-moul text-[11px] truncate outline-none hover:bg-slate-100 px-1 rounded text-slate-800" title="${stu.name}">${stu.name}</h4>
          <div class="inline-block bg-slate-50 border border-slate-100 px-3 py-0.5 rounded-lg text-[10px] font-bold text-slate-600 shadow-inner mt-1">
             មធ្យម៖ <span contenteditable="true" spellcheck="false" class="text-indigo-600 font-mono text-sm outline-none hover:bg-slate-200 px-1 rounded">${stu.avg.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  };

  const bgHtml = window.currentHonorBg ? `<img src="${window.currentHonorBg}" class="absolute inset-0 w-full h-full object-fill z-0 print:object-fill">` : `
    <div class="absolute inset-0 bg-[radial-gradient(#fff_0%,#faf5eb_100%)] z-0"></div>
    <div class="absolute inset-4 border-[6px] border-double border-red-800/80 rounded-2xl z-0 pointer-events-none"></div>
  `;

  container.innerHTML = `
    <div id="top5HonorPrintArea" class="w-[794px] h-[1123px] relative flex flex-col justify-between print:w-[210mm] print:h-[297mm] shadow-2xl print:shadow-none bg-white text-slate-900 font-siemreap shrink-0 box-border overflow-hidden">
      ${bgHtml}
      <div class="w-full h-full relative z-10 flex flex-col px-14 py-12">
          
          <div class="shrink-0 mb-6 relative">
            <div class="flex justify-between items-start">
              <div class="text-center leading-tight">
                <div class="w-12 h-12 bg-red-800 text-white rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-2 shadow-sm border-2 border-white pointer-events-none">🏫</div>
                <div class="canva-el cursor-grab inline-block outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-1 rounded">
                   <p contenteditable="true" spellcheck="false" class="font-moul text-blue-900 text-xs outline-none">${school_name}</p>
                </div>
              </div>
              <div class="text-center">
                <div class="canva-el cursor-grab inline-block outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-1 rounded">
                   <p contenteditable="true" spellcheck="false" class="font-moul text-sm text-slate-900 outline-none">ព្រះរាជាណាចក្រកម្ពុជា</p>
                   <p contenteditable="true" spellcheck="false" class="font-moul text-sm mt-1 text-slate-800 outline-none">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                </div>
                <div class="w-24 mx-auto border-b-2 border-black mt-1 pointer-events-none"></div>
              </div>
            </div>

            <div class="text-center mt-8 mb-4 relative z-20">
              <div class="canva-el cursor-grab inline-block outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-1 rounded w-full">
                <h1 contenteditable="true" spellcheck="false" class="font-moul text-5xl text-red-700 tracking-widest drop-shadow-sm mb-4 outline-none" style="-webkit-text-stroke: 0.5px darkred;">តារាងកិត្តិយស</h1>
              </div>
              <br>
              <div class="canva-el cursor-grab inline-block outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-1 rounded">
                 <p contenteditable="true" spellcheck="false" class="font-bold text-base text-slate-800 bg-white/60 inline-block px-6 py-1.5 rounded-full border border-slate-200 backdrop-blur-sm outline-none">${periodTitleText}</p>
              </div>
              <br>
              <div class="canva-el cursor-grab inline-block outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-1 rounded mt-2">
                 <p class="text-red-700 font-bold">ថ្នាក់ទី <span contenteditable="true" class="text-lg outline-none">${level.replace('ថ្នាក់ទី ', '')} "${room.replace(/«|»/g, '')}"</span> <span class="mx-2 text-slate-400">|</span> ឆ្នាំសិក្សា <span contenteditable="true" class="font-moul outline-none">${toKhmerNum(academic_year)}</span></p>
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col justify-center items-center gap-12 relative z-10 w-full mt-4">
            <div class="flex justify-center w-full">${renderStudentCard(getS(1), 1)}</div>
            <div class="flex justify-center gap-20 w-full">${renderStudentCard(getS(2), 2)} ${renderStudentCard(getS(3), 3)}</div>
            <div class="flex justify-center gap-24 w-full">${renderStudentCard(getS(4), 4)} ${renderStudentCard(getS(5), 5)}</div>
          </div>

          <div class="shrink-0 mt-auto pt-8 relative z-10">
            <div class="flex justify-between items-end text-sm font-bold px-8">
              <div class="text-center canva-el cursor-grab inline-block outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded">
                <p contenteditable="true" spellcheck="false" class="mb-1 text-slate-900 outline-none">បានឃើញ និងឯកភាព</p>
                <p contenteditable="true" spellcheck="false" class="font-moul text-xs text-indigo-950 mt-1 mb-14 outline-none">នាយកសាលា</p>
                <div contenteditable="true" spellcheck="false" class="font-moul text-base text-indigo-900 outline-none min-w-[100px] border-b border-dashed border-transparent hover:border-slate-400">${principal_name}</div>
              </div>
              <div class="text-center canva-el cursor-grab inline-block outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded">
                <p contenteditable="true" spellcheck="false" class="font-normal text-xs text-slate-800 mb-1 outline-none">ធ្វើនៅ..............., ថ្ងៃទី........ខែ........ឆ្នាំ ${toKhmerNum(current_year)}</p>
                <p contenteditable="true" spellcheck="false" class="font-moul text-xs text-indigo-950 mt-1 mb-14 outline-none">គ្រូបន្ទុកថ្នាក់</p>
                <div contenteditable="true" spellcheck="false" class="font-moul text-base text-indigo-900 outline-none min-w-[100px] border-b border-dashed border-transparent hover:border-slate-400">${teacher_name}</div>
              </div>
            </div>
          </div>

      </div>
    </div>
  `;
}
// =========================================================================
// មុខងារបោះពុម្ពតារាងកិត្តិយសផ្លូវការ (Isolated Print - A4 Portrait)
// ==========================================================
function printOfficialHonorBoard() {
  const printArea = document.getElementById("top5HonorPrintArea");
  if (!printArea) {
     alert("⚠️ រកមិនឃើញតារាងកិត្តិយសទេ!");
     return;
  }

  // បិទ Toolbar និងបន្ទាត់ពណ៌ខៀវ (Selection) ជាមុនសិនដើម្បីកុំឱ្យវាជាប់ក្នុងក្រដាស Print
  closeCanvaToolbar();

  // ចាប់យកកូដ HTML ទាំងមូលពីផ្ទាំងរចនាបច្ចុប្បន្ន
  const printContent = printArea.outerHTML;

  // កសាងឯកសារ Print ពេញលេញដោយបញ្ចូល Tailwind CSS
  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>បោះពុម្ពតារាងកិត្តិយស</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        
        @page { size: A4 portrait; margin: 0; }
        body { margin: 0; padding: 0; display: flex; justify-content: center; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        
        .font-moul { font-family: 'Moul', serif; }
        .font-siemreap { font-family: 'Siemreap', sans-serif; }
        
        /* តម្រឹមតារាងកិត្តិយសឱ្យពេញ A4 ពេល Print */
        #top5HonorPrintArea {
           box-shadow: none !important;
           width: 210mm !important;
           height: 297mm !important;
           margin: 0 !important;
        }
      </style>
    </head>
    <body class="font-siemreap">
      ${printContent}
    </body>
    </html>
  `;

  // បើកផ្ទាំង Print ថ្មី
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  printWindow.document.open();
  printWindow.document.write(printDocument);
  printWindow.document.close();

  // រង់ចាំ 1 វិនាទី ឱ្យ Tailwind និង Font ដំណើរការចប់សិន ទើបបញ្ជា Print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 1000);
}
// ==========================================================
// ផ្នែកទី ៣៖ ព្រឹត្តិបត្រពិន្ទុ (Transcripts - ១ សិស្ស លើក្រដាស A4 Portrait ១សន្លឹក)
// ==========================================================
function closeTranscriptModal() {
    const m = document.getElementById("transcriptModal");
    if(m) { m.classList.add("hidden"); m.classList.remove("flex"); }
}

function openTranscriptModal() {
  if (!rankingsDataList || rankingsDataList.length === 0) {
    alert("⚠️ មិនមានទិន្នន័យសម្រាប់បង្កើតព្រឹត្តិបត្រទេ សូមជ្រើសរើសថ្នាក់ និងរង់ចាំទាញទិន្នន័យសិន!");
    return;
  }
  
  const container = document.getElementById("transcriptPrintArea");
  container.innerHTML = `<div class="text-center py-10 font-bold text-blue-600 animate-pulse text-xl"><i class="fa-solid fa-spinner fa-spin mb-3"></i><br>កំពុងរៀបចំព្រឹត្តិបត្រពិន្ទុ...</div>`;
  
  const modal = document.getElementById("transcriptModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  
  const periodType = document.getElementById("rankPeriodType").value;
  const periodVal = document.getElementById("rankPeriodValue").value;
  const grade = document.getElementById("rankLevelSelect").value + " " + document.getElementById("rankRoomSelect").value;
  const totalStudents = rankingsDataList.length;
  
  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
  const current_year = new Date().getFullYear();
  const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
  const principal_name = sInfo.principal_name || "នាយកសាលា";
  const teacher_name = sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";
  
  let title = "";
  if (periodType === "monthly") title = `ព្រឹត្តិបត្រពិន្ទុប្រចាំខែ ${periodVal}`;
  else if (periodType === "semester") title = `ព្រឹត្តិបត្រពិន្ទុប្រចាំ ${periodVal}`;
  else title = `ព្រឹត្តិបត្រពិន្ទុប្រចាំឆ្នាំ`;
  
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');

  // បញ្ជី ២០ មុខវិជ្ជា
  const subjectDict = {
    k_listen: "ភាសាខ្មែរ (ស្តាប់)", k_write: "ភាសាខ្មែរ (សរសេរ)", k_read: "ភាសាខ្មែរ (អាន)", k_compose: "ភាសាខ្មែរ (តែងសេចក្តី)",
    m_num: "គណិតវិទ្យា (ចំនួន)", m_measure: "គណិតវិទ្យា (រង្វាស់រង្វាល់)", m_geo: "គណិតវិទ្យា (ធរណីមាត្រ)", m_alg: "គណិតវិទ្យា (ពីជគណិត)", m_stat: "គណិតវិទ្យា (ស្ថិតិ)",
    s_phy: "វិទ្យាសាស្ត្រ (រូបវិទ្យា)", s_chem: "វិទ្យាសាស្ត្រ (គីមីវិទ្យា)", s_bio: "វិទ្យាសាស្ត្រ (ជីវវិទ្យា)", s_earth: "វិទ្យាសាស្ត្រ (ផែនដី)",
    ss_moral: "សិក្សាសង្គម (សីលធម៌)", ss_geo: "សិក្សាសង្គម (ភូមិវិទ្យា)", ss_hist: "សិក្សាសង្គម (ប្រវត្តិវិទ្យា)",
    pe_art: "អប់រំកាយ (សិល្បៈ)", pe_sport: "អប់រំកាយ (កីឡា)", pe_health: "អប់រំកាយ (សុខភាព)",
    life_skill: "បំណិនជីវិត"
  };
  const SUBJECT_KEYS = Object.keys(subjectDict);
  
  let allTranscriptsHtml = "";
  
  // បង្កើត Transcript ១ សិស្ស សម្រាប់ ១ សន្លឹក (A4 Layout - Portrait)
  for (let i = 0; i < rankingsDataList.length; i++) {
      const s = rankingsDataList[i];

      const generateA4Card = (s) => {
         let trHtml = "";
         let totalObtained = 0;
         let subCount = 1;
         const raw = s.rawScores || {}; 
         
         // គូរទាំង ២០ មុខវិជ្ជា ទោះបីជាមាន ឬគ្មានពិន្ទុក៏ដោយ
         SUBJECT_KEYS.forEach(k => {
             const scoreVal = raw[k];
             const score = parseFloat(scoreVal);
             
             let displayScore = "";
             let gradeL = "-", c_color = "text-slate-400", status = "-", remark = "-";

             // បើមានពិន្ទុបញ្ជូល
             if (!isNaN(score) && scoreVal !== "") {
                 totalObtained += score;
                 displayScore = score;
                 
                 if (score >= 9.5) { gradeL = "A"; c_color = "text-emerald-600"; }
                 else if (score >= 8.0) { gradeL = "B"; c_color = "text-teal-600"; }
                 else if (score >= 6.5) { gradeL = "C"; c_color = "text-blue-600"; }
                 else if (score >= 5.0) { gradeL = "D"; c_color = "text-amber-600"; }
                 else { gradeL = "F"; c_color = "text-rose-600"; }
                 
                 status = score >= 5 ? "ជាប់" : "ធ្លាក់";
                 remark = score >= 8 ? "ល្អ" : (score >= 5 ? "មធ្យម" : "ខ្សោយ");
             }

             trHtml += `
                <tr class="border-b border-black text-[11px] h-[25px]">
                   <td class="border-r border-black py-0.5 px-2 text-center">${toKhmerNum(subCount)}</td>
                   <td class="border-r border-black py-0.5 px-3 text-left font-bold text-slate-800">${subjectDict[k]}</td>
                   <td class="border-r border-black py-0.5 px-2 text-center font-mono">១០</td>
                   <td class="border-r border-black py-0.5 px-2 text-center font-bold text-indigo-700 font-mono">${displayScore}</td>
                   <td class="border-r border-black py-0.5 px-2 text-center text-slate-400">-</td>
                   <td class="border-r border-black py-0.5 px-2 text-center font-bold ${c_color}">${gradeL}</td>
                   <td class="border-r border-black py-0.5 px-2 text-center text-slate-800">${remark}</td>
                   <td class="border-r border-black py-0.5 px-2 text-center ${status === 'ជាប់' ? 'text-emerald-600' : (status === 'ធ្លាក់' ? 'text-rose-600' : 'text-slate-400')} font-bold">${status}</td>
                   <td class="py-0.5 px-2 text-center"></td>
                </tr>
             `;
             subCount++;
         });

         const photoUrl = s.photo_url || "https://placehold.co/120x160/e2e8f0/64748b?text=Photo";

         // តម្រៀបសម្រាប់ក្រដាស A4 ទំហំ 210mm x 297mm
         return `
            <div class="mx-auto bg-white box-border flex flex-col relative print:shadow-none shadow-xl mb-8" 
                 style="width: 210mm; min-height: 297mm; padding: 12mm 15mm; page-break-after: always;">
               
               <!-- ផ្នែកក្បាលលិខិត -->
               <div class="flex justify-between items-start mb-6">
                  <div class="flex items-start gap-4 w-1/3">
                    <img src="${sInfo.logo_url || 'https://placehold.co/80x80/f8fafc/94a3b8?text=Logo'}" class="w-[70px] h-[70px] object-contain shrink-0" alt="Logo">
                    <div class="text-left text-xs font-bold leading-relaxed mt-1">
                       <p class="font-moul text-sm text-blue-900 mb-1">${school_name}</p>
                       <p>ថ្នាក់ទី៖ <span class="text-rose-600">${grade.replace('ថ្នាក់ទី ', '')}</span></p>
                       <p>ឆ្នាំសិក្សា៖ ${academic_year}</p>
                    </div>
                  </div>
                  <div class="text-center w-1/3 pt-1">
                     <p class="font-moul text-sm m-0 leading-relaxed text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                     <p class="font-moul text-sm m-0 leading-relaxed mt-1 text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                     <div class="w-16 mx-auto border-b-2 border-black mt-2"></div>
                  </div>
                  <div class="w-1/3 flex justify-end">
                    <div class="w-[30mm] h-[40mm] border border-slate-300 p-[2px] bg-slate-50 shadow-sm overflow-hidden flex items-center justify-center text-slate-400 font-bold text-xs">
                       ${s.photo_url ? `<img src="${s.photo_url}" class="w-full h-full object-cover">` : 'Photo'}
                    </div>
                  </div>
               </div>
               
               <!-- ចំណងជើងព្រឹត្តិបត្រ -->
               <div class="text-center mb-6">
                  <h2 class="font-moul text-xl text-blue-800 tracking-wide m-0">${title}</h2>
               </div>
               
               <!-- ព័ត៌មានសិស្ស -->
               <div class="flex justify-between items-center font-bold text-sm mb-3 px-4 py-2 border border-slate-300 rounded text-slate-800" style="background-color: #f8fafc !important; -webkit-print-color-adjust: exact;">
                  <div>អត្តលេខ៖ <span class="ml-2 font-mono text-slate-600">${toKhmerNum(s.id)}</span></div>
                  <div>សិស្សឈ្មោះ៖ <span class="ml-2 font-moul text-blue-900 text-base">${s.name}</span></div>
                  <div>ភេទ៖ <span class="ml-2 text-blue-900">${s.gender}</span></div>
               </div>
               
               <!-- តារាងពិន្ទុទាំង ២០ មុខវិជ្ជា -->
               <table class="w-full border-collapse border border-black text-center text-[11px] flex-1">
                  <thead>
                     <tr class="font-bold border-b border-black h-[30px]" style="background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact;">
                        <th class="border-r border-black p-1 w-10">ល.រ</th>
                        <th class="border-r border-black p-1 text-left px-3">មុខវិជ្ជា</th>
                        <th class="border-r border-black p-1 w-16 leading-tight">ពិន្ទុ<br>អតិបរមា</th>
                        <th class="border-r border-black p-1 w-16 leading-tight">ពិន្ទុ<br>បាន</th>
                        <th class="border-r border-black p-1 w-16 leading-tight">ចំណាត់<br>ថ្នាក់</th>
                        <th class="border-r border-black p-1 w-16">និទ្ទេស</th>
                        <th class="border-r border-black p-1 w-20">មូលវិចារ</th>
                        <th class="border-r border-black p-1 w-16">លទ្ធផល</th>
                        <th class="p-1 w-20">ផ្សេងៗ</th>
                     </tr>
                  </thead>
                  <tbody>${trHtml}</tbody>
                  <tfoot class="border-t border-black">
                     <tr class="font-bold h-[28px]" style="background-color: #f8fafc !important; -webkit-print-color-adjust: exact;">
                        <td colspan="2" class="border-r border-black py-1 text-right px-3 text-slate-800">ពិន្ទុសរុប</td>
                        <td class="border-r border-black py-1 text-blue-800 font-mono">២០០</td>
                        <td class="border-r border-black py-1 text-rose-600 font-mono">${totalObtained.toFixed(2)}</td>
                        <td colspan="5" class="p-1 bg-white"></td>
                     </tr>
                     <tr class="font-bold text-[11px] border-t border-black h-[32px]" style="background-color: #fef3c7 !important; -webkit-print-color-adjust: exact;">
                        <td colspan="2" class="border-r border-black py-1 text-right px-3 text-slate-800">មធ្យមភាគ និងចំណាត់ថ្នាក់</td>
                        <td colspan="2" class="border-r border-black py-1 text-blue-800 font-mono text-sm">${s.avg.toFixed(2)}</td>
                        <td class="border-r border-black py-1 text-rose-700 text-[13px]" style="background-color: #ffe4e6 !important; -webkit-print-color-adjust: exact;">${toKhmerNum(s.rank)} <span class="text-[9px] text-slate-400 font-normal">/${toKhmerNum(totalStudents)}</span></td>
                        <td class="border-r border-black py-1 text-emerald-700">${s.gradeLetter}</td>
                        <td class="border-r border-black py-1">${s.avg >= 5 ? 'ល្អ' : 'ខ្សោយ'}</td>
                        <td class="border-r border-black py-1 ${s.avg >= 5 ? 'text-emerald-700' : 'text-rose-600'}">${s.avg >= 5 ? 'ជាប់' : 'ធ្លាក់'}</td>
                        <td class="py-1"></td>
                     </tr>
                  </tfoot>
               </table>

               <!-- ជើងទំព័រហត្ថលេខា -->
               <div class="flex justify-between items-end mt-6 pt-2 text-xs font-bold px-12 shrink-0">
                  <div class="text-center">
                     <p class="mb-1">បានឃើញ និងឯកភាព</p>
                     <p class="font-normal text-[11px] text-slate-600 mb-1">នាយកសាលា</p>
                     <div class="h-20"></div>
                     <p class="font-moul text-sm text-blue-900 m-0">${principal_name}</p>
                  </div>
                  <div class="text-center">
                     <p class="font-normal text-[11px] text-slate-600 mb-1">ធ្វើនៅ..............., ថ្ងៃទី........ខែ........ឆ្នាំ ${toKhmerNum(current_year)}</p>
                     <p class="mb-1">គ្រូបន្ទុកថ្នាក់</p>
                     <div class="h-20"></div>
                     <p class="font-moul text-sm text-blue-900 m-0">${teacher_name}</p>
                  </div>
               </div>
               
            </div>
         `;
      };
      
      allTranscriptsHtml += generateA4Card(s);
  }
  
  container.innerHTML = `<div class="w-full flex flex-col items-center bg-slate-200 py-6">${allTranscriptsHtml}</div>`;
}


const AdminReportController = {
  currentType: 'monthly',
  reportData: null, // សម្រាប់ផ្ទុកទិន្នន័យដែលទាញបាន

  async init() {
    // បង្ហាញសញ្ញាកំពុងដំណើរការ (Loading) មុនពេលទិន្នន័យមកដល់
    const contentEl = document.getElementById('reportContent');
    if (contentEl) {
      contentEl.innerHTML = `<div class="text-center py-10 text-slate-500"><i class="fa-solid fa-spinner fa-spin text-2xl text-indigo-600 mb-2"></i><br>កំពុងចងក្រងទិន្នន័យរបាយការណ៍...</div>`;
    }

    // ទាញយកទិន្នន័យពី API របស់ Google Sheets (ហៅតាមរយៈ apiGet)
    try {
      const [studentsRes, scoresRes] = await Promise.all([
        typeof apiGet === "function" ? apiGet("getStudents", { status: "Active" }) : Promise.resolve({data: []}),
        typeof apiGet === "function" ? apiGet("getScores") : Promise.resolve({data: []})
      ]);
      
      this.reportData = {
        students: studentsRes.data || [],
        scores: scoresRes.data || []
      };
    } catch (error) {
      console.error("Error fetching report data:", error);
      this.reportData = { students: [], scores: [] };
    }

    // បន្ទាប់ពីទាញទិន្នន័យបាន ចាប់ផ្តើមបង្ហាញរបាយការណ៍
    this.renderReportContent(this.currentType);
  },

  switchTab(type) {
    this.currentType = type;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active-tab', 'bg-white', 'text-indigo-600', 'shadow-sm');
      btn.classList.add('text-slate-500');
    });
    
    const activeBtn = document.getElementById(`tab-${type}`);
    activeBtn.classList.add('active-tab', 'bg-white', 'text-indigo-600', 'shadow-sm');
    activeBtn.classList.remove('text-slate-500');

    this.renderReportContent(type);
  },

  renderReportContent(type) {
    const titleEl = document.getElementById('reportTitle');
    const subtitleEl = document.getElementById('reportSubtitle');
    const contentEl = document.getElementById('reportContent');
    
    const teacherName = "ហឿន មីនា";
    const gradeLevel = "ថ្នាក់ទី ៨";
    
    document.getElementById('teacherSignatureName').innerText = teacherName;

    // --- ដំណើរការទិន្នន័យ (Data Processing) ---
    const students = this.reportData.students;
    const scores = this.reportData.scores;
    
    // ចម្រាញ់យកតែសិស្សថ្នាក់ទី ៨
    const grade8Students = students.filter(s => String(s.grade || "").includes("៨") || String(s.grade || "").includes("8"));
    const totalStudents = grade8Students.length > 0 ? grade8Students.length : 45; // ប្រើ 45 ជាទិន្នន័យគំរូ បើគ្មាន Data
    const femaleStudents = grade8Students.length > 0 ? grade8Students.filter(s => s.gender === "ស្រី").length : 20;

    // គណនានិទ្ទេសសិស្ស
    let gradeCount = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    if (scores.length > 0) {
       scores.forEach(sc => {
         let letter = sc.grade_letter || "F";
         if (letter.includes("A") || letter.includes("ល្អណាស់")) gradeCount.A++;
         else if (letter.includes("B") || letter.includes("ល្អបង្គួរ")) gradeCount.B++;
         else if (letter.includes("C") || letter.includes("មធ្យម")) gradeCount.C++;
         else if (letter.includes("D") || letter.includes("ខ្សោយ")) gradeCount.D++;
         else gradeCount.F++;
       });
    } else {
       // ទិន្នន័យប៉ាន់ស្មាន បើមិនទាន់មានពិន្ទុក្នុងប្រព័ន្ធ
       gradeCount = { A: 12, B: 15, C: 10, D: 5, F: 3 }; 
    }

    // ទម្រង់កាលបរិច្ឆេទ
    const now = new Date();
    const months = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    const currentMonthKh = months[now.getMonth()];
    const currentYear = now.getFullYear();

    let html = '';

    // ==========================================
    // ១. របាយការណ៍ប្រចាំខែ
    // ==========================================
    if (type === 'monthly') {
      titleEl.innerText = 'របាយការណ៍ប្រចាំខែ';
      subtitleEl.innerText = `ខែ ${currentMonthKh} ឆ្នាំ ${currentYear}`;
      html = `
        <p class="indent-8 text-justify">
          សូមគោរពជូន លោក/លោកស្រីនាយកសាលា ជាទីគោរព។ ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ <strong>${teacherName}</strong> ជាគ្រូបន្ទុក និងជាគ្រូបង្រៀន <strong>${gradeLevel}</strong> សូមរាយការណ៍សង្ខេបអំពីលទ្ធផលនៃការគ្រប់គ្រងថ្នាក់ និងការអនុវត្តការបង្រៀនប្រចាំខែ ដូចខាងក្រោម៖
        </p>
        
        <h4 class="font-bold underline mt-4">១. ស្ថិតិសិស្ស និងវត្តមាន៖</h4>
        <ul class="list-disc ml-12 space-y-1 mt-2">
          <li>សិស្សសរុបមានចំនួន <strong>${totalStudents}</strong> នាក់ (ស្រី <strong>${femaleStudents}</strong> នាក់)។</li>
          <li>សិស្សអវត្តមានសរុបចំនួន ៨ ដង (មានច្បាប់ ៥ ឥតច្បាប់ ៣)។ <em>(អត្រាអវត្តមានមានការថយចុះ)</em></li>
        </ul>

        <h4 class="font-bold underline mt-4">២. លទ្ធផលសិក្សា៖</h4>
        <p class="indent-8 mt-2">
          ផ្អែកតាមការវាយតម្លៃប្រចាំខែ សិស្សភាគច្រើនទទួលបានលទ្ធផលល្អប្រសើរ។ ខាងក្រោមនេះជាស្ថិតិនិទ្ទេសជារួម៖
        </p>
        <div class="grid grid-cols-5 gap-2 text-center mt-3 font-bold">
           <div class="border border-slate-300 rounded p-2 bg-slate-50"><div class="text-emerald-600">និទ្ទេស A</div><div>${gradeCount.A} នាក់</div></div>
           <div class="border border-slate-300 rounded p-2 bg-slate-50"><div class="text-teal-600">និទ្ទេស B</div><div>${gradeCount.B} នាក់</div></div>
           <div class="border border-slate-300 rounded p-2 bg-slate-50"><div class="text-amber-600">និទ្ទេស C</div><div>${gradeCount.C} នាក់</div></div>
           <div class="border border-slate-300 rounded p-2 bg-slate-50"><div class="text-orange-500">និទ្ទេស D</div><div>${gradeCount.D} នាក់</div></div>
           <div class="border border-slate-300 rounded p-2 bg-slate-50"><div class="text-rose-600">និទ្ទេស F</div><div>${gradeCount.F} នាក់</div></div>
        </div>

        <h4 class="font-bold underline mt-5">៣. ការអនុវត្តផែនការបង្រៀន (កិច្ចតែងការ)៖</h4>
        <table class="w-full border-collapse border border-slate-800 text-center mt-3 text-sm">
          <thead class="bg-slate-100 font-bold">
            <tr>
              <th class="border border-slate-800 p-2">មុខវិជ្ជាបង្រៀន</th>
              <th class="border border-slate-800 p-2">ផែនការអនុវត្ត (មេរៀន/ជំពូក)</th>
              <th class="border border-slate-800 p-2">លទ្ធផលសម្រេចបាន</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-800 p-2">ICT និងកុំព្យូទ័រទូទៅ</td>
              <td class="border border-slate-800 p-2 text-left pl-3">ទ្រឹស្តីកុំព្យូទ័រ និងបណ្តាញ</td>
              <td class="border border-slate-800 p-2 text-emerald-600 font-bold">១០០%</td>
            </tr>
            <tr>
              <td class="border border-slate-800 p-2">Scratch Coding</td>
              <td class="border border-slate-800 p-2 text-left pl-3">ការប្រើប្រាស់ Blocks, Variables, & Loops</td>
              <td class="border border-slate-800 p-2 text-emerald-600 font-bold">បញ្ចប់តាមផែនការ</td>
            </tr>
            <tr>
              <td class="border border-slate-800 p-2">Arduino & Electronics</td>
              <td class="border border-slate-800 p-2 text-left pl-3">គម្រោងតម្លើងសៀគ្វី LED និង Sensors</td>
              <td class="border border-slate-800 p-2 text-amber-600 font-bold">កំពុងអនុវត្តបន្ត</td>
            </tr>
          </tbody>
        </table>

        <h4 class="font-bold underline mt-5">៤. បញ្ហាប្រឈម និងសំណូមពរ៖</h4>
        <p class="indent-8 mt-2">
          ការអនុវត្តជាក់ស្តែងសម្រាប់មុខវិជ្ជា Arduino ដំណើរការបានល្អ ប៉ុន្តែសម្ភារៈឧបទ្ទេស (Arduino Starter Kits) មួយចំនួនមានការខ្វះខាតបើធៀបនឹងចំនួនសិស្ស។ សំណូមពរដល់គណៈគ្រប់គ្រងមេត្តាពិនិត្យលទ្ធភាពបន្ថែមសម្ភារៈទាំងនេះ ដើម្បីឱ្យសិស្សបានអនុវត្តគ្រប់ៗគ្នា។
        </p>
      `;
    } 
    // ==========================================
    // ២. របាយការណ៍ប្រចាំឆមាស
    // ==========================================
    else if (type === 'semester') {
      titleEl.innerText = 'របាយការណ៍ប្រចាំឆមាសទី១';
      subtitleEl.innerText = `ឆ្នាំសិក្សា ២០២៦-២០២៧`;
      html = `
        <p class="indent-8 text-justify">
          ក្នុងឆមាសទី១ កន្លងមកនេះ ការបង្រៀនមុខវិជ្ជាបច្ចេកវិទ្យា (ICT, Scratch, Arduino) សម្រាប់សិស្ស <strong>${gradeLevel}</strong> បានដំណើរការយ៉ាងរលូន ដោយសិស្សទទួលបានបទពិសោធន៍ថ្មីៗជាច្រើនលើការសរសេរកូដ និងការគិតបែបតក្កវិជ្ជា។
        </p>
        
        <div class="grid grid-cols-2 gap-6 mt-6">
           <div class="border border-slate-300 p-4 rounded-xl bg-slate-50 shadow-sm">
             <h5 class="font-bold text-center border-b pb-2 mb-3">ស្ថិតិជារួម (ឆមាសទី១)</h5>
             <ul class="space-y-2 text-sm">
                <li class="flex justify-between"><span>សិស្សសរុប៖</span> <strong>${totalStudents} នាក់</strong></li>
                <li class="flex justify-between"><span>សិស្សស្រី៖</span> <strong>${femaleStudents} នាក់</strong></li>
                <li class="flex justify-between"><span>អត្រាជាប់មធ្យមភាគ៖</span> <strong class="text-emerald-600">៨៨%</strong></li>
                <li class="flex justify-between"><span>បោះបង់ការសិក្សា៖</span> <strong class="text-rose-600">០ នាក់</strong></li>
             </ul>
           </div>
           <div class="border border-slate-300 p-4 rounded-xl bg-slate-50 shadow-sm">
             <h5 class="font-bold text-center border-b pb-2 mb-3">សមិទ្ធផលលេចធ្លោ</h5>
             <ul class="space-y-2 text-sm list-disc pl-5">
                <li>សិស្សអាចបង្កើតហ្គេមខ្នាតតូចដោយខ្លួនឯងតាមរយៈ Scratch។</li>
                <li>យល់ដឹងពីគ្រឿងអេឡិចត្រូនិកមូលដ្ឋានតាមរយៈការតម្លើង Arduino។</li>
             </ul>
           </div>
        </div>
      `;
    } 
    // ==========================================
    // ៣. របាយការណ៍ប្រចាំឆ្នាំ
    // ==========================================
    else if (type === 'yearly') {
      titleEl.innerText = 'របាយការណ៍បូកសរុបប្រចាំឆ្នាំ';
      subtitleEl.innerText = `ឆ្នាំសិក្សា ២០២៦-២០២៧`;
      html = `
        <p class="indent-8 text-justify">
          នេះជារបាយការណ៍បូកសរុបលទ្ធផលពេញមួយឆ្នាំសិក្សារបស់សិស្ស <strong>${gradeLevel}</strong>។ សរុបជារួម ការអនុវត្តកម្មវិធីសិក្សាថ្មីដែលរួមបញ្ចូលការសរសេរកូដ និងរ៉ូបូត (Robotics/Arduino) ទទួលបានជោគជ័យ និងការចាប់អារម្មណ៍យ៉ាងខ្លាំងពីសំណាក់សិស្សានុសិស្ស។
        </p>
        <h4 class="font-bold underline mt-6 mb-3">លទ្ធផលនៃការវាយតម្លៃចុងឆ្នាំ៖</h4>
        <table class="w-full border-collapse border border-slate-800 text-center text-sm">
          <thead class="bg-slate-100 font-bold">
            <tr>
              <th class="border border-slate-800 p-2">សរុបអ្នករួមតេស្ត</th>
              <th class="border border-slate-800 p-2">សិស្សជាប់ (ឡើងថ្នាក់)</th>
              <th class="border border-slate-800 p-2">សិស្សធ្លាក់ (ត្រួតថ្នាក់)</th>
              <th class="border border-slate-800 p-2">អត្រាភាគរយសិស្សជាប់</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-800 p-3">${totalStudents} នាក់</td>
              <td class="border border-slate-800 p-3 text-emerald-600 font-bold">${totalStudents - 2} នាក់</td>
              <td class="border border-slate-800 p-3 text-rose-600 font-bold">២ នាក់</td>
              <td class="border border-slate-800 p-3 font-bold text-indigo-600">៩៥.៥%</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    contentEl.innerHTML = html;
  },

  exportPDF() {
    const element = document.getElementById('reportDocument');
    const opt = {
      margin:       0,
      filename:     `របាយការណ៍រដ្ឋបាល_${this.currentType}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#ffffff'; 
    
    html2pdf().set(opt).from(element).save().then(() => {
      element.style.backgroundColor = originalBg;
    });
  },

  exportWord() {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Report</title></head><body>";
    const footer = "</body></html>";
    const html = header + document.getElementById('reportDocument').innerHTML + footer;
    
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const downloadLink = document.createElement("a");
    
    document.body.appendChild(downloadLink);
    if(navigator.msSaveOrOpenBlob){
        navigator.msSaveOrOpenBlob(blob, `របាយការណ៍រដ្ឋបាល_${this.currentType}.doc`);
    } else {
        downloadLink.href = url;
        downloadLink.download = `របាយការណ៍រដ្ឋបាល_${this.currentType}.doc`;
        downloadLink.click();
    }
    document.body.removeChild(downloadLink);
  }
};