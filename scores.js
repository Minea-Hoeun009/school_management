// ==========================================================================
// ឯកសារ js/scores.js - ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងព្រឹត្តិបត្រពេញលេញ (Pop-up/Modal & Shared Dates Edition)
// ==========================================================================

window.scoresStudentList = [];
window.currentScores = []; 
window.s1Scores = []; 
window.s2Scores = []; 
window.hasUnsavedChanges = false; 

window.activeSchema = [];
window.activeSubjectKeys = [];
window.schemaMaxMap = {};
window.currentMobileStudentIndex = 0;
window.isScoreFullScreen = false;

// Honor Board & Ranking Variables
window.rankingsDataList = [];
window.currentHonorBg = "";

// ការកំណត់កាលបរិច្ឆេទរួម (Global Date Settings for All Modules)
window.reportCardDateSettings = {
  location: localStorage.getItem('rc_location') || "រាជធានីភ្នំពេញ",
  solarDate: localStorage.getItem('rc_solar_date') || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....",
  lunarDate: localStorage.getItem('rc_lunar_date') || "ថ្ងៃ.............. ... ខែ............. ឆ្នាំ......... ........ស័ក ព.ស. ២៥....",
  showLunar: localStorage.getItem('rc_show_lunar') !== 'false'
};

// ==========================================
// Utilities (មុខងារជំនួយទូទៅ)
// ==========================================
function toKhmerNum(str) {
    if (str === null || str === undefined || str === "") return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
}

window.getSchoolLevel = function(gradeStr) {
  if (!gradeStr) return "primary";
  const numStr = gradeStr.replace(/[^\d១២៣៤៥៦៧៨៩០]/g, '');
  const khmerNumbersAc = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const arabicNumStr = numStr.split('').map(n => khmerNumbersAc.indexOf(n) > -1 ? khmerNumbersAc.indexOf(n) : n).join('');
  const num = parseInt(arabicNumStr);
  if (num >= 7 && num <= 9) return "lower_sec";
  if (num >= 10 && num <= 12) return "upper_sec";
  return "primary"; 
};

window.getScoreSchema = function(level, periodType, track = "sci") {
  const mkSub = (name, key, max = 10) => ({ name, key, max });
  if (level === "primary") {
      return [
        { group: "ភាសាខ្មែរ", color: "#dbeafe", subs: [mkSub("ស្តាប់","k_listen"), mkSub("សរសេរ","k_write"), mkSub("អាន","k_read"), mkSub("តែងសេចក្តី","k_compose")] },
        { group: "គណិតវិទ្យា", color: "#fadbd8", subs: [mkSub("ចំនួន","m_num"), mkSub("រង្វាស់រង្វាល់","m_measure"), mkSub("ធរណីមាត្រ","m_geo"), mkSub("ពីជគណិត","m_alg"), mkSub("ស្ថិតិ","m_stat")] },
        { group: "វិទ្យាសាស្ត្រ", color: "#e8f8f5", subs: [mkSub("រូបវិទ្យា","s_phy"), mkSub("គីមីវិទ្យា","s_chem"), mkSub("ជីវវិទ្យា","s_bio"), mkSub("ផែនដី-បរិស្ថាន","s_earth")] },
        { group: "សិក្សាសង្គម", color: "#fcf3cf", subs: [mkSub("សីលធម៌-ពលរដ្ឋ","ss_moral"), mkSub("ភូមិវិទ្យា","ss_geo"), mkSub("ប្រវត្តិវិទ្យា","ss_hist")] },
        { group: "អប់រំកាយ", color: "#f4ecf7", subs: [mkSub("គេហៈ-សិល្បៈ","pe_art"), mkSub("កីឡា","pe_sport"), mkSub("សុខភាព","pe_health")] },
        { group: "បំណិនជីវិត", color: "#dbeafe", key: "life_skill", max: 10 }
      ];
  } 
  if (level === "lower_sec") {
      const secSubs = [
        ["គណិតវិទ្យា", "ls_math", 50, "#fadbd8"], ["រូបវិទ្យា", "ls_phy", 50, "#e8f8f5"],
        ["គីមីវិទ្យា", "ls_chem", 50, "#e8f8f5"], ["ជីវវិទ្យា", "ls_bio", 50, "#e8f8f5"],
        ["ផែនដី-បរិស្ថាន", "ls_earth", 50, "#e8f8f5"], ["ប្រវត្តិវិទ្យា", "ls_hist", 50, "#fcf3cf"],
        ["ភូមិវិទ្យា", "ls_geo", 50, "#fcf3cf"], ["សីលធម៌-ពលរដ្ឋ", "ls_moral", 50, "#fcf3cf"],
        ["ភាសាបរទេស", "ls_lang", 50, "#f4ecf7"], ["អប់រំកាយ", "ls_pe", 50, "#f4ecf7"],
        ["បច្ចេកវិទ្យា(ICT)", "ls_ict", 50, "#dbeafe"]
      ];
      return [
        { group: "ភាសាខ្មែរ", color: "#dbeafe", subs: [mkSub("តែងសេចក្តី","ls_k_c", 25), mkSub("សរសេរតាមអាន","ls_k_d", 25)] },
        ...secSubs.map(([group, key, max, color]) => ({ group, key, max, color }))
      ];
  } 
  if (level === "upper_sec") {
      const isSci = (track === "sci");
      const pfx = isSci ? "usc_" : "uso_";
      const khmerSubs = isSci 
        ? [mkSub("តែងសេចក្តី", `${pfx}k_c`, 40), mkSub("សរសេរតាមអាន", `${pfx}k_d`, 35)]
        : [mkSub("តែងសេចក្តី", `${pfx}k_c`, 65), mkSub("សរសេរតាមអាន", `${pfx}k_d`, 60)];
      
      const config = isSci ? [
        ["គណិតវិទ្យា", 125, "#fadbd8"], ["រូបវិទ្យា", 75, "#e8f8f5"], ["គីមីវិទ្យា", 75, "#e8f8f5"],
        ["ជីវវិទ្យា", 75, "#e8f8f5"], ["ផែនដី-បរិស្ថាន", 50, "#e8f8f5"], ["ប្រវត្តិវិទ្យា", 50, "#fcf3cf"],
        ["ភូមិវិទ្យា", 50, "#fcf3cf"], ["សីលធម៌-ពលរដ្ឋ", 50, "#fcf3cf"], ["ភាសាបរទេស", 50, "#f4ecf7"],
        ["អប់រំកាយ", 50, "#f4ecf7"], ["បច្ចេកវិទ្យា(ICT)", 50, "#dbeafe"]
      ] : [
        ["គណិតវិទ្យា", 75, "#fadbd8"], ["រូបវិទ្យា", 50, "#e8f8f5"], ["គីមីវិទ្យា", 50, "#e8f8f5"],
        ["ជីវវិទ្យា", 50, "#e8f8f5"], ["ផែនដី-បរិស្ថាន", 50, "#e8f8f5"], ["ប្រវត្តិវិទ្យា", 75, "#fcf3cf"],
        ["ភូមិវិទ្យា", 75, "#fcf3cf"], ["សីលធម៌-ពលរដ្ឋ", 75, "#fcf3cf"], ["ភាសាបរទេស", 50, "#f4ecf7"],
        ["អប់រំកាយ", 50, "#f4ecf7"], ["បច្ចេកវិទ្យា(ICT)", 50, "#dbeafe"]
      ];

      const keys = ["math","phy","chem","bio","earth","hist","geo","moral","lang","pe","ict"];
      return [
        { group: "ភាសាខ្មែរ", color: "#dbeafe", subs: khmerSubs },
        ...config.map(([group, max, color], i) => ({ group, key: `${pfx}${keys[i]}`, max, color }))
      ];
  }
  return [];
};

window.extractSubjectKeys = function(schema) {
  let keys = [];
  window.schemaMaxMap = {};
  if (schema) {
      schema.forEach(item => {
        if (item.subs) {
          item.subs.forEach(s => { keys.push(s.key); window.schemaMaxMap[s.key] = s.max || 10; });
        } else if (item.key) {
          keys.push(item.key);
          window.schemaMaxMap[item.key] = item.max || 10;
        }
      });
  }
  return keys;
};

// ==========================================
// Date Control Handlers (មុខងារកាលបរិច្ឆេទរួម)
// ==========================================
window.getDateSettingsPanelHTML = function(moduleName) {
  return `
    <div id="datePanel-${moduleName}" class="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-3 text-xs mt-3 hidden no-print w-full">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-slate-600">ធ្វើនៅ៖</span>
          <input type="text" value="${window.reportCardDateSettings.location}" 
                 oninput="window.updateSharedDateSetting('location', this.value)" 
                 class="shared-location-input border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 w-24 bg-white outline-none focus:border-amber-400">
        </div>
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-slate-600">សូរិយគតិ៖</span>
          <input type="text" value="${window.reportCardDateSettings.solarDate}" 
                 oninput="window.updateSharedDateSetting('solarDate', this.value)" 
                 class="shared-solar-input border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 w-52 bg-white outline-none focus:border-amber-400">
          <button onclick="window.setSharedTodaySolarDate()" class="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-bold text-indigo-600 shadow-sm">ថ្ងៃនេះ</button>
          <button onclick="window.setSharedDotsSolarDate()" class="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-bold text-slate-600 shadow-sm">ចុចៗ</button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="inline-flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
          <input type="checkbox" ${window.reportCardDateSettings.showLunar?'checked':''} 
                 onchange="window.updateSharedDateSetting('showLunar', this.checked)" class="shared-lunar-check rounded text-indigo-600">
          <span>ចន្ទគតិ៖</span>
        </label>
        <input type="text" value="${window.reportCardDateSettings.lunarDate}" 
               oninput="window.updateSharedDateSetting('lunarDate', this.value)" 
               placeholder="ថ្ងៃ.............. ...កើត/រោច..."
               class="shared-lunar-input border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 w-64 bg-white outline-none focus:border-amber-400 ${!window.reportCardDateSettings.showLunar?'opacity-50 pointer-events-none':''}">
      </div>
    </div>
  `;
};

window.toggleSharedDatePanel = function(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) {
     panel.classList.toggle('hidden');
     panel.classList.toggle('flex');
  }
};

window.updateSharedDateSetting = function(k, v) {
  window.reportCardDateSettings[k] = v;
  try { localStorage.setItem(`rc_${k}`, v); } catch(e) {}
  
  if (k === 'location') document.querySelectorAll('.shared-location-input').forEach(el => el.value = v);
  if (k === 'solarDate') document.querySelectorAll('.shared-solar-input').forEach(el => el.value = v);
  if (k === 'lunarDate') document.querySelectorAll('.shared-lunar-input').forEach(el => el.value = v);
  if (k === 'showLunar') {
    document.querySelectorAll('.shared-lunar-check').forEach(el => el.checked = v);
    document.querySelectorAll('.shared-lunar-input').forEach(el => {
      if (v) el.classList.remove('opacity-50', 'pointer-events-none');
      else el.classList.add('opacity-50', 'pointer-events-none');
    });
  }

  // ធ្វើបច្ចុប្បន្នភាព UI Preview ភ្លាមៗ (Real-time Update)
  const honorSolarDisplay = document.getElementById('honorSolarDateDisplay');
  if(honorSolarDisplay) honorSolarDisplay.innerText = window.getFormattedSolarDate();
  
  const honorLunarDisplay = document.getElementById('honorLunarDateDisplay');
  if(honorLunarDisplay) {
     honorLunarDisplay.innerText = window.reportCardDateSettings.showLunar ? window.reportCardDateSettings.lunarDate : "";
     honorLunarDisplay.style.display = window.reportCardDateSettings.showLunar ? "block" : "none";
  }

  if (document.getElementById('modal-reportcards') && !document.getElementById('modal-reportcards').classList.contains('hidden')) {
     window.refreshRcPreview();
  }
};

window.getFormattedSolarDate = function() {
  const loc = window.reportCardDateSettings.location ? `${window.reportCardDateSettings.location}, ` : "";
  return `${loc}${window.reportCardDateSettings.solarDate}`;
};

window.setSharedTodaySolarDate = function() {
  const now = new Date();
  const d = window.toKhmerNum(now.getDate().toString());
  const m = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"][now.getMonth()];
  const y = window.toKhmerNum(now.getFullYear().toString());
  const formatted = `ថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;
  window.updateSharedDateSetting('solarDate', formatted);
};

window.setSharedDotsSolarDate = function() {
  window.updateSharedDateSetting('solarDate', "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
};


// ==========================================
// UI & Layout Management (រៀបចំអេក្រង់មេ និង Pop-up)
// ==========================================

window.loadScoresView = async function() {
  const container = document.getElementById("scores") || document.getElementById("mainContentArea");
  if (!container) return;

  let gradesOptions = "";
  for (let i = 1; i <= 12; i++) {
      let khGrade = toKhmerNum(i.toString());
      gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}" ${i===2?'selected':''}>ថ្នាក់ទី ${khGrade}</option>`;
  }

  container.className = "p-3 md:p-6 transition duration-300 w-full flex flex-col h-50% bg-slate-50 min-h-0";
  container.innerHTML = `
    <style>
        .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
        .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; font-weight: 500; }
        .header-vertical { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; padding: 8px 0; }
        .score-input, .eval-input { font-family: monospace; font-size: 13px; font-weight: bold; }
        .eval-input { font-family: 'Khmer OS Siemreap', sans-serif; text-transform: uppercase; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box;}
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; border: 2px solid transparent; background-clip: padding-box;}
    </style>
    
    <div class="animate-fade-in custom-mixed-font w-full h-full flex flex-col min-h-0 max-w-[1600px] mx-auto">
      
      <!-- ក្បាលទំព័រ និងការកំណត់ទូទៅ (Global Settings) -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden no-print mb-6 shrink-0">
        <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
        <div class="relative z-10">
          <h2 class="text-lg md:text-2xl font-black text-slate-800 flex items-center gap-3">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 rounded-xl flex items-center justify-center text-xl shadow-sm border border-amber-100">
              <i class="fa-solid fa-star-half-stroke"></i>
            </div>
            <span class="font-moul mt-1">គ្រប់គ្រងពិន្ទុ និងលទ្ធផលសិក្សា</span>
          </h2>
          <p class="text-slate-500 text-sm mt-1 ml-14 hidden md:block">ជ្រើសរើសការកំណត់ថ្នាក់ខាងស្តាំ មុននឹងជ្រើសរើសមុខងារខាងក្រោម។</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-2 relative z-10 w-full md:w-auto bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <div class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
             <i class="fa-solid fa-layer-group text-slate-400 text-xs"></i>
             <select id="globalLevelSelect" onchange="window.updateGlobalSettings()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer font-siemreap">${gradesOptions}</select>
             <span class="text-slate-300">|</span>
             <select id="globalRoomSelect" onchange="window.updateGlobalSettings()" class="border-none bg-transparent text-xs font-bold text-amber-700 outline-none cursor-pointer font-siemreap">
                <option value="«ក»" selected>«ក»</option> <option value="«ខ»">«ខ»</option> <option value="«គ»">«គ»</option> <option value="«ឃ»">«ឃ»</option>
             </select>
          </div>
          
          <select id="globalTrackSelect" onchange="window.updateGlobalSettings()" class="hidden border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 outline-none cursor-pointer shadow-sm font-siemreap">
            <option value="sci">ថ្នាក់វិទ្យាសាស្ត្រ</option>
            <option value="soc">ថ្នាក់វិទ្យាសាស្ត្រសង្គម</option>
          </select>

          <div class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
             <i class="fa-solid fa-calendar-days text-slate-400 text-xs"></i>
             <select id="globalPeriodType" onchange="window.updateGlobalPeriod(); window.updateGlobalSettings();" class="border-none bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer font-siemreap">
                <option value="monthly">ប្រចាំខែ</option>
                <option value="semester">ប្រចាំឆមាស</option>
                <option value="annual">ប្រចាំឆ្នាំ (២ឆមាស)</option>
             </select>
             <span class="text-slate-300">|</span>
             <select id="globalPeriodValue" onchange="window.updateGlobalSettings()" class="border-none bg-transparent text-xs font-bold text-rose-700 outline-none cursor-pointer font-siemreap"></select>
          </div>
        </div>
      </div>

      <!-- កាតជម្រើសមុខងារមេ (Main Feature Cards Grid) -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 flex-1 no-print">
        
        <div onclick="window.openScoreModal('modal-entry', window.renderScoreEntryContent)" class="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-200 group flex flex-col justify-center items-center text-center">
            <div class="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner"><i class="fa-solid fa-keyboard"></i></div>
            <h3 class="font-moul text-lg text-slate-800 mb-2">បញ្ចូលពិន្ទុ</h3>
            <p class="text-slate-500 text-sm font-siemreap px-4">បញ្ជីស្រង់ពិន្ទុ គណនាមធ្យមភាគ និងវាយតម្លៃលទ្ធផលសិស្ស។</p>
        </div>

        <div onclick="window.openScoreModal('modal-rankings', window.renderRankingsContent)" class="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-200 group flex flex-col justify-center items-center text-center">
            <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner"><i class="fa-solid fa-ranking-star"></i></div>
            <h3 class="font-moul text-lg text-slate-800 mb-2">តារាងចំណាត់ថ្នាក់</h3>
            <p class="text-slate-500 text-sm font-siemreap px-4">តារាងសរុបចំណាត់ថ្នាក់ ស្ថិតិ និងអាច Export ទៅជា Excel បាន។</p>
        </div>

        <div onclick="window.openScoreModal('modal-reportcards', window.renderReportCardsContent)" class="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-200 group flex flex-col justify-center items-center text-center">
            <div class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner"><i class="fa-solid fa-file-invoice"></i></div>
            <h3 class="font-moul text-lg text-slate-800 mb-2">ព្រឹត្តិបត្រពិន្ទុ</h3>
            <p class="text-slate-500 text-sm font-siemreap px-4">សៀវភៅតាមដានការសិក្សាបុគ្គល សម្រាប់ផ្ញើជូនមាតាបិតា។</p>
        </div>

        <div onclick="window.openScoreModal('modal-honorboard', window.renderHonorBoardContent)" class="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-200 group flex flex-col justify-center items-center text-center">
            <div class="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner"><i class="fa-solid fa-crown"></i></div>
            <h3 class="font-moul text-lg text-slate-800 mb-2">តារាងកិត្តិយស</h3>
            <p class="text-slate-500 text-sm font-siemreap px-4">ប័ណ្ណសរសើរសម្រាប់សិស្សឆ្នើមប្រចាំខែ និងឆមាស (Top 3/5)។</p>
        </div>

      </div>
    </div>

    <!-- MODAL CONTAINERS (Pop-ups សម្រាប់មុខងារនីមួយៗ) -->
    
    <!-- 1. Modal បញ្ចូលពិន្ទុ -->
    <div id="modal-entry" class="fixed inset-0 z-[2000] hidden bg-slate-900/80 backdrop-blur-sm p-2 md:p-6 transition-opacity font-siemreap">
        <div class="bg-slate-50 w-full h-full rounded-3xl flex flex-col overflow-hidden shadow-2xl relative border border-slate-200">
            <div class="bg-white p-3 md:p-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3 shrink-0">
                <div class="flex items-center gap-3">
                    <button onclick="window.closeScoreModal('modal-entry')" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                    <h2 class="font-moul text-lg text-blue-800 hidden md:block">បញ្ជីស្រង់ពិន្ទុ</h2>
                    <div class="relative w-40 md:w-56 ml-2">
                        <span class="absolute left-3 top-2.5 text-slate-400"><i class="fa-solid fa-magnifying-glass text-xs"></i></span>
                        <input type="text" id="scoreSearchInput" oninput="window.filterScoreTable()" placeholder="ស្វែងរកសិស្ស..." class="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-amber-400 focus:bg-white outline-none w-full bg-slate-100 transition shadow-inner">
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <button onclick="window.openMobileScoreModal()" class="md:hidden px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"><i class="fa-solid fa-mobile-screen"></i> កាត</button>
                    <button onclick="window.clearAllScores()" class="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition shadow-sm hidden md:flex items-center gap-1.5"><i class="fa-solid fa-eraser"></i> សម្អាត</button>
                    <button onclick="window.printScoreList()" class="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"><i class="fa-solid fa-print"></i> បោះពុម្ព</button>
                    <div class="w-px h-5 bg-slate-300 mx-1 hidden md:block"></div>
                    <button onclick="window.calculateAllScores()" class="px-3 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"><i class="fa-solid fa-calculator"></i> គណនា</button>
                    <button onclick="window.autoRankStudents()" class="px-3 py-2 bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"><i class="fa-solid fa-ranking-star"></i> ចំណាត់ថ្នាក់</button>
                    <button onclick="window.saveScoresData()" id="btnSaveScores" class="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"><i class="fa-solid fa-cloud-arrow-up"></i> រក្សាទុក</button>
                </div>
            </div>
            <div id="modal-content-entry" class="flex-1 overflow-hidden flex flex-col relative bg-white"></div>
        </div>
    </div>

    <!-- 2. Modal ចំណាត់ថ្នាក់ -->
    <div id="modal-rankings" class="fixed inset-0 z-[2000] hidden bg-slate-900/80 backdrop-blur-sm p-2 md:p-6 transition-opacity font-siemreap">
        <div class="bg-slate-50 w-full h-full rounded-3xl flex flex-col overflow-hidden shadow-2xl relative border border-slate-200">
            <div class="bg-white p-3 md:p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-3">
                    <button onclick="window.closeScoreModal('modal-rankings')" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                    <h2 class="font-moul text-lg text-rose-600">តារាងចំណាត់ថ្នាក់</h2>
                </div>
            </div>
            <div id="modal-content-rankings" class="flex-1 overflow-auto bg-slate-100/50 p-2 md:p-4"></div>
        </div>
    </div>

    <!-- 3. Modal ព្រឹត្តិបត្រពិន្ទុ -->
    <div id="modal-reportcards" class="fixed inset-0 z-[2000] hidden bg-slate-900/80 backdrop-blur-sm p-2 md:p-6 transition-opacity font-siemreap">
        <div class="bg-slate-50 w-full h-full rounded-3xl flex flex-col overflow-hidden shadow-2xl relative border border-slate-200">
            <div class="bg-white p-3 md:p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-3">
                    <button onclick="window.closeScoreModal('modal-reportcards')" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                    <h2 class="font-moul text-lg text-indigo-600">សៀវភៅតាមដានការសិក្សា</h2>
                </div>
            </div>
            <div id="modal-content-reportcards" class="flex-1 overflow-auto bg-slate-200 p-0"></div>
        </div>
    </div>

    <!-- 4. Modal តារាងកិត្តិយស -->
    <div id="modal-honorboard" class="fixed inset-0 z-[2000] hidden bg-slate-900/80 backdrop-blur-sm p-2 md:p-6 transition-opacity font-siemreap">
        <div class="bg-slate-50 w-full h-full rounded-3xl flex flex-col overflow-hidden shadow-2xl relative border border-slate-200">
            <div class="bg-white p-3 md:p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-3">
                    <button onclick="window.closeScoreModal('modal-honorboard')" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                    <h2 class="font-moul text-lg text-amber-600">តារាងកិត្តិយស (Honor Board)</h2>
                </div>
            </div>
            <div id="modal-content-honorboard" class="flex-1 overflow-auto bg-slate-300/40 p-0"></div>
        </div>
    </div>
  `;

  window.updateGlobalPeriod();
  window.toggleTrackSelect();
  
  // Pre-load scores data so modals have data when opened
  await window.renderScoreEntryContent(); 
};

window.updateGlobalPeriod = function() {
  const type = document.getElementById("globalPeriodType")?.value;
  const valSelect = document.getElementById("globalPeriodValue");
  if (!valSelect) return;
  
  if (type === "monthly") {
    valSelect.style.display = "inline-block";
    valSelect.innerHTML = `<option value="មករា">ខែមករា</option> <option value="កុម្ភៈ">ខែកុម្ភៈ</option> <option value="មីនា">ខែមីនា</option> <option value="មេសា">ខែមេសា</option> <option value="ឧសភា">ខែឧសភា</option> <option value="មិថុនា">ខែមិថុនា</option> <option value="កក្កដា">ខែកក្កដា</option> <option value="សីហា">ខែសីហា</option> <option value="កញ្ញា">ខែកញ្ញា</option> <option value="តុលា">ខែតុលា</option> <option value="វិច្ឆិកា">ខែវិច្ឆិកា</option> <option value="ធ្នូ">ខែធ្នូ</option>`;
  } else if (type === "semester") {
    valSelect.style.display = "inline-block";
    valSelect.innerHTML = `<option value="ឆមាសទី១">ឆមាសទី១</option><option value="ឆមាសទី២">ឆមាសទី២</option>`;
  } else if (type === "annual") {
    valSelect.style.display = "none";
    valSelect.innerHTML = `<option value="ប្រចាំឆ្នាំ">លទ្ធផលប្រចាំឆ្នាំ</option>`;
  }
};

window.toggleTrackSelect = function() {
  const levelStr = document.getElementById("globalLevelSelect")?.value || "";
  const trackSelect = document.getElementById("globalTrackSelect");
  if (trackSelect) {
     if (window.getSchoolLevel(levelStr) === "upper_sec") trackSelect.classList.remove("hidden");
     else trackSelect.classList.add("hidden");
  }
};

window.updateGlobalSettings = async function() {
  if (window.hasUnsavedChanges) {
      if (!confirm("⚠️ អ្នកមានទិន្នន័យពិន្ទុមិនទាន់បានរក្សាទុក!\nតើអ្នកពិតជាចង់ប្តូរការកំណត់មែនទេ? (ទិន្នន័យដែលមិនទាន់រក្សាទុកនឹងបាត់បង់)")) {
          return; 
      }
  }
  window.toggleTrackSelect();
  await window.renderScoreEntryContent();
  
  // Re-render open modals to reflect new class/period
  if (!document.getElementById('modal-rankings').classList.contains('hidden')) window.renderRankingsContent();
  if (!document.getElementById('modal-reportcards').classList.contains('hidden')) window.renderReportCardsContent();
  if (!document.getElementById('modal-honorboard').classList.contains('hidden')) window.renderHonorBoardContent();
};

window.openScoreModal = function(modalId, renderFunction) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (typeof renderFunction === 'function' && modalId !== 'modal-entry') {
        renderFunction(); 
    }
  }
};

window.closeScoreModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    if (window.hasUnsavedChanges && modalId === 'modal-entry') {
        if (!confirm("អ្នកមានទិន្នន័យមិនទាន់បានរក្សាទុក! តើអ្នកពិតជាចង់ចាកចេញមែនទេ?")) return;
    }
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
};

// ==========================================
// គណនា និង រក្សាទុកពិន្ទុ
// ==========================================
window.calculateSectionScore = function(id, suffix, schoolLevel) {
  let totalScore = 0, overallMax = 0, divisorCount = 0; 
  window.activeSchema.forEach(item => {
    let groupScore = 0, groupMax = 0, groupHasInput = false;
    const processInput = (key, maxVal) => {
        const inputId = suffix ? `${key}_${suffix}_${id}` : `${key}_${id}`;
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            const valStr = inputEl.value.trim();
            if (valStr !== "" && !isNaN(parseFloat(valStr))) {
               const val = parseFloat(valStr);
               if (val < maxVal / 2) { inputEl.classList.add("text-rose-600"); inputEl.classList.remove("text-slate-800"); } 
               else { inputEl.classList.remove("text-rose-600"); inputEl.classList.add("text-slate-800"); }
               groupScore += val; groupMax += maxVal; groupHasInput = true;
               if (schoolLevel === "primary") divisorCount++;
            } else { inputEl.classList.remove("text-rose-600", "text-slate-800"); }
        }
    };
    if (item.subs && item.subs.length > 0) item.subs.forEach(s => processInput(s.key, window.schemaMaxMap[s.key] || 10));
    else processInput(item.key, window.schemaMaxMap[item.key] || 10);

    if (groupHasInput) {
        totalScore += groupScore; overallMax += groupMax;
        if (schoolLevel !== "primary") divisorCount++;
    }
  });

  const examAvg = divisorCount > 0 ? (totalScore / divisorCount) : 0;
  const type = document.getElementById("globalPeriodType")?.value || "monthly";
  let finalAvgToGrade = examAvg;
  
  if (type === "semester" && suffix === "") { 
      const monthlyAvgStr = document.getElementById(`monthly_avg_${id}`)?.value.trim();
      if (monthlyAvgStr !== "" && !isNaN(parseFloat(monthlyAvgStr))) {
          const monthlyAvg = parseFloat(monthlyAvgStr);
          finalAvgToGrade = (examAvg + monthlyAvg) / 2;
      }
      const totExEl = document.getElementById(`total_exam_${id}`);
      if (totExEl) totExEl.textContent = divisorCount > 0 ? totalScore.toFixed(2) : '';
      const avgExEl = document.getElementById(`avg_exam_${id}`);
      if (avgExEl) avgExEl.textContent = divisorCount > 0 ? examAvg.toFixed(2) : '';
  } else {
      const totalEl = suffix ? document.getElementById(`total_${suffix}_${id}`) : document.getElementById(`total_${id}`);
      if (totalEl) totalEl.textContent = divisorCount > 0 ? totalScore.toFixed(2) : '';
  }

  let avgDomId = type === "annual" ? `avg_${suffix}_${id}` : `avg_${id}`;
  const avgDomEl = document.getElementById(avgDomId);
  if (avgDomEl) avgDomEl.textContent = divisorCount > 0 ? finalAvgToGrade.toFixed(2) : '';

  let letter = "-", color = "text-slate-500";
  const pct = overallMax > 0 ? (totalScore / overallMax) * 100 : 0; 
  if (schoolLevel === "upper_sec") {
      if (pct >= 90) { letter = "A"; color = "text-blue-700"; }
      else if (pct >= 80) { letter = "B"; color = "text-emerald-700"; }
      else if (pct >= 70) { letter = "C"; color = "text-emerald-600"; }
      else if (pct >= 60) { letter = "D"; color = "text-amber-500"; }
      else if (pct >= 50) { letter = "E"; color = "text-amber-600"; }
      else if (totalScore > 0 || divisorCount > 0) { letter = "F"; color = "text-rose-600"; }
  } else {
      if (finalAvgToGrade >= 9.5) { letter = "ល្អណាស់"; color = "text-blue-800"; } 
      else if (finalAvgToGrade >= 8.0) { letter = "ល្អ"; color = "text-emerald-700"; }
      else if (finalAvgToGrade >= 6.50) { letter = "ល្អបង្គួរ"; color = "text-emerald-600"; }
      else if (finalAvgToGrade >= 5.0) { letter = "មធ្យម"; color = "text-amber-500"; }
      else if (finalAvgToGrade > 0) { letter = "ធ្លាក់"; color = "text-rose-600"; }
  }

  let gradeDomId = type === "annual" ? `grade_${suffix}_${id}` : `grade_${id}`;
  const gradeEl = document.getElementById(gradeDomId);
  if (gradeEl) { 
    gradeEl.textContent = divisorCount > 0 ? letter : ""; 
    gradeEl.className = `p-1 border-r border-slate-300 print:border-black text-center font-bold font-moul text-[11px] whitespace-nowrap ${color}`; 
  }
  return { total: totalScore, avg: finalAvgToGrade, rank: 0, gradeLetter: letter };
};

window.calculateStudentScore = function(id) {
  const levelStr = document.getElementById("globalLevelSelect")?.value || "";
  const type = document.getElementById("globalPeriodType")?.value || "monthly";
  const month = document.getElementById("globalPeriodValue")?.value || "";
  const schoolLevel = window.getSchoolLevel(levelStr);

  if (type === "annual") {
     const s1 = calculateSectionScore(id, "s1", schoolLevel);
     const s2 = calculateSectionScore(id, "s2", schoolLevel);
     let annualAvg = 0, divider = 0;
     if (s1.avg > 0) { annualAvg += s1.avg; divider++; }
     if (s2.avg > 0) { annualAvg += s2.avg; divider++; }
     annualAvg = divider > 0 ? (annualAvg / divider) : 0;
     
     let letter = "-", color = "text-slate-500";
     if (schoolLevel === "upper_sec") {
          letter = annualAvg >= 90 ? "A" : annualAvg >= 80 ? "B" : annualAvg >= 70 ? "C" : annualAvg >= 60 ? "D" : annualAvg >= 50 ? "E" : annualAvg > 0 ? "F" : "-"; 
          color = letter === "F" ? "text-rose-600" : "text-blue-700";
     } else {
         if (annualAvg >= 9.5) { letter = "ល្អណាស់"; color = "text-blue-800"; } 
         else if (annualAvg >= 8.0) { letter = "ល្អ"; color = "text-emerald-700"; }
         else if (annualAvg >= 6.50) { letter = "ល្អបង្គួរ"; color = "text-emerald-600"; }
         else if (annualAvg >= 5.0) { letter = "មធ្យម"; color = "text-amber-500"; }
         else if (annualAvg > 0) { letter = "ធ្លាក់"; color = "text-rose-600"; }
     }

     const annAvgEl = document.getElementById(`avg_annual_${id}`);
     if (annAvgEl) annAvgEl.textContent = divider > 0 ? annualAvg.toFixed(2) : '';
     const annGradeEl = document.getElementById(`grade_annual_${id}`);
     if (annGradeEl) { 
        annGradeEl.textContent = divider > 0 ? letter : ""; 
        annGradeEl.className = `p-1.5 border-r border-slate-300 print:border-black text-center font-black font-moul text-[13px] bg-amber-50 ${color}`; 
     }
  } else if (type === "semester") {
      const suffix = month.includes("២") ? "s2" : "s1";
      calculateSectionScore(id, suffix, schoolLevel);
  } else {
      calculateSectionScore(id, "", schoolLevel);
  }
};

window.calculateAllScores = function() { 
  window.scoresStudentList.forEach(s => window.calculateStudentScore(s.id)); 
  window.updateRanksInMemory(); 
};

window.updateRanksInMemory = function() {
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    let studentAvgs = [];

    window.scoresStudentList.forEach(s => {
        let avgId = type === "annual" ? `avg_annual_${s.id}` : `avg_${s.id}`;
        let avgEl = document.getElementById(avgId);
        let avg = avgEl ? parseFloat(avgEl.textContent) : 0;
        if (isNaN(avg)) avg = 0;
        
        let gradeId = type === "annual" ? `grade_annual_${s.id}` : `grade_${s.id}`;
        let gradeEl = document.getElementById(gradeId);
        let gradeLetter = gradeEl ? gradeEl.textContent : "-";

        let examAvg = 0, monthlyAvg = 0, s1Avg = 0, s2Avg = 0;
        if (type === "semester") {
            examAvg = parseFloat(document.getElementById(`avg_exam_${s.id}`)?.textContent) || 0;
            monthlyAvg = parseFloat(document.getElementById(`monthly_avg_${s.id}`)?.value) || 0;
        } else if (type === "annual") {
            s1Avg = parseFloat(document.getElementById(`avg_s1_${s.id}`)?.textContent) || 0;
            s2Avg = parseFloat(document.getElementById(`avg_s2_${s.id}`)?.textContent) || 0;
        }

        studentAvgs.push({ 
            ...s, avg: avg, gradeLetter: gradeLetter, exam_avg: examAvg, monthly_avg: monthlyAvg, sem1_avg: s1Avg, sem2_avg: s2Avg
        });
    });

    studentAvgs.sort((a, b) => b.avg - a.avg);
    let currentRank = 1;
    for (let i = 0; i < studentAvgs.length; i++) {
        if (i > 0 && studentAvgs[i].avg === studentAvgs[i-1].avg) { studentAvgs[i].rank = studentAvgs[i-1].rank; } 
        else { studentAvgs[i].rank = currentRank; }
        currentRank++;
    }
    window.rankingsDataList = studentAvgs;
};

window.autoRankStudents = function() {
  window.calculateAllScores();
  const type = document.getElementById("globalPeriodType")?.value || "monthly";
  window.rankingsDataList.forEach(s => {
      let rankId = type === "annual" ? `rank_annual_${s.id}` : `rank_${s.id}`;
      const rankEl = document.getElementById(rankId);
      if (rankEl) rankEl.textContent = s.rank;
  });
  window.markUnsaved();
  if (typeof showToast === 'function') showToast("🏆 ការរៀបចំណាត់ថ្នាក់ស្វ័យប្រវត្តិទទួលបានជោគជ័យ!");
};

window.saveScoresData = async function() {
    const btn = document.getElementById("btnSaveScores");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបញ្ជូន...`;
    btn.disabled = true;

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "";
    const levelStr = document.getElementById("globalLevelSelect")?.value || "";
    const roomStr = document.getElementById("globalRoomSelect")?.value || "";
    const grade = `${levelStr} ${roomStr}`;

    window.calculateAllScores();
    let scoresPayload = [];
    window.rankingsDataList.forEach(stu => {
        let stuRecord = {
            student_id: stu.id, grade: grade, period_type: type, month: type === "annual" ? "ប្រចាំឆ្នាំ" : month,
            eval_knowledge: document.getElementById(`eval_k_${stu.id}`)?.value || "",
            eval_skill: document.getElementById(`eval_s_${stu.id}`)?.value || "",
            eval_moral: document.getElementById(`eval_m_${stu.id}`)?.value || "",
            eval_solidarity: document.getElementById(`eval_so_${stu.id}`)?.value || ""
        };

        if (type === "annual") {
            stuRecord.total_score = ""; 
            stuRecord.average = document.getElementById(`avg_annual_${stu.id}`)?.textContent || "";
            stuRecord.rank = document.getElementById(`rank_annual_${stu.id}`)?.textContent || "";
            stuRecord.grade_letter = document.getElementById(`grade_annual_${stu.id}`)?.textContent || "";
        } else {
            stuRecord.total_score = document.getElementById(`total_${stu.id}`)?.textContent || "";
            stuRecord.average = document.getElementById(`avg_${stu.id}`)?.textContent || "";
            stuRecord.rank = document.getElementById(`rank_${stu.id}`)?.textContent || "";
            stuRecord.grade_letter = document.getElementById(`grade_${stu.id}`)?.textContent || "";
            if (type === "semester") {
                stuRecord.total_exam = document.getElementById(`total_exam_${stu.id}`)?.textContent || "";
                stuRecord.avg_exam = document.getElementById(`avg_exam_${stu.id}`)?.textContent || "";
                stuRecord.monthly_avg = document.getElementById(`monthly_avg_${stu.id}`)?.value || "";
            }
        }

        window.activeSubjectKeys.forEach(key => {
            let inputId = `${key}_${stu.id}`;
            if (type === "annual") inputId = `${key}_s2_${stu.id}`;
            else if (type === "semester") inputId = `${key}_${month.includes("២") ? "s2" : "s1"}_${stu.id}`;
            
            stuRecord[key] = document.getElementById(inputId)?.value || "";
            if (type === "annual") stuRecord[`${key}_s1`] = document.getElementById(`${key}_s1_${stu.id}`)?.value || "";
        });
        scoresPayload.push(stuRecord);
    });

    try {
        let allScores = JSON.parse(localStorage.getItem('academic_scores')) || [];
        allScores = allScores.filter(s => !(s.period_type === type && s.month === (type === "annual" ? "ប្រចាំឆ្នាំ" : month) && s.grade === grade)); 
        allScores = [...allScores, ...scoresPayload]; 
        localStorage.setItem('academic_scores', JSON.stringify(allScores));

        if (typeof apiPost === 'function') {
            await apiPost("saveScoresBatch", { data: scoresPayload });
            if (typeof showToast === 'function') showToast("✅ រក្សាទុកពិន្ទុទៅកាន់ Server បានជោគជ័យ!");
        } else {
            if (typeof showToast === 'function') showToast("⚠️ ទិន្នន័យរក្សាទុកបានត្រឹមក្នុងម៉ាស៊ីន (Offline)!");
        }
        window.hasUnsavedChanges = false;
        const badge = document.getElementById("unsavedBadge");
        if (badge) badge.classList.add("hidden");
    } catch (error) {
        console.error("Save Error:", error);
        alert("បរាជ័យក្នុងការរក្សាទុកទៅ Server! សូមពិនិត្យអ៊ីនធឺណិត។");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

window.clearAllScores = function() {
    if (confirm("តើអ្នកពិតជាចង់សម្អាតពិន្ទុទាំងអស់លើតារាងនេះមែនទេ?")) {
        document.querySelectorAll('.score-input, .eval-input').forEach(input => {
            input.value = "";
            input.classList.remove('text-rose-600');
            input.classList.add('text-slate-800');
        });
        window.calculateAllScores();
        window.markUnsaved();
    }
};



// ==========================================
// បង្ហាញក្នុង Modal ទី ១: Entry Tab
// ==========================================
window.renderScoreEntryContent = async function() {
  const c = document.getElementById("modal-content-entry");
  if (!c) return;

  const type = document.getElementById("globalPeriodType")?.value || "monthly";

  c.innerHTML = `
    <div id="unsavedBadge" class="hidden absolute top-4 left-4 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse no-print z-[80] shadow-sm border border-rose-200">
      <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> មិនទាន់រក្សាទុក
    </div>
    <div class="flex-1 overflow-auto w-full custom-scrollbar print:overflow-visible relative bg-white font-siemreap">
      <table id="scoreTableMain" class="border-collapse border border-slate-300 print:border-black text-[12px] text-center whitespace-nowrap bg-white relative" style="table-layout: fixed; width: max-content; min-width: 100%;">
        <thead id="scoreTableHead" class="text-slate-700 sticky top-0 z-[60] shadow-sm print:static print:shadow-none bg-slate-50 border-b-2 border-slate-300"></thead>
        <tbody id="scoresTableBody" class="divide-y divide-slate-200 print:divide-black text-slate-800 print:text-black">
          <tr><td colspan="100" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-amber-400"></i><br>កំពុងទាញយកទិន្នន័យ...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  await window.fetchStudentsForScores();
  window.setupExcelLikeNavigation();
};

window.renderTableHeader = function(schema, type) {
  let topRowHtml = "", subRowHtml = "";
  const evalHeadersTop = `<th colspan="4" class="border-r border-b border-slate-300 print:border-black p-2 bg-purple-100 text-purple-900" style="-webkit-print-color-adjust: exact;">ការវាយតម្លៃ</th>`;
  const evalHeadersSub = ["ចំណេះដឹង", "បំណិន", "សីលធម៌", "សាមគ្គីភាព"].map(t => `<th class="border-r border-slate-300 print:border-black p-0 bg-purple-50/50" style="width: 60px; min-width: 60px; max-width: 60px;"><div class="header-vertical text-[11px] mx-auto text-purple-800">${t}</div></th>`).join("");
  const evalHeadersSub_Annual = ["ចំណេះដឹង", "បំណិន", "សីលធម៌", "សាមគ្គីភាព"].map(t => `<th rowspan="2" class="border-r border-slate-300 print:border-black p-0 bg-purple-50/50" style="width: 60px; min-width: 60px; max-width: 60px;"><div class="header-vertical text-[11px] mx-auto text-purple-800">${t}</div></th>`).join("");

  const W_NO = 40, W_NAME = 190, W_GENDER = 50, W_SCORE = 45, W_STAT = 60, W_EVAL = 60;
  const L_NAME = W_NO, L_GENDER = W_NO + W_NAME, W_TOTAL_FIXED = W_NO + W_NAME + W_GENDER; 

  let cgHtml = `<colgroup><col style="width: ${W_NO}px; min-width: ${W_NO}px; max-width: ${W_NO}px;"><col style="width: ${W_NAME}px; min-width: ${W_NAME}px; max-width: ${W_NAME}px;"><col style="width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width: ${W_GENDER}px;">`;

  const renderSchemaHeaders = (prefix = "") => {
      schema.forEach(item => {
         if (item.subs && item.subs.length > 0) {
            topRowHtml += `<th colspan="${item.subs.length}" class="border-r border-b border-slate-300 print:border-black p-1.5 text-slate-800 font-bold" style="background-color: ${item.color} !important; -webkit-print-color-adjust: exact;">${item.group}</th>`;
            item.subs.forEach(sub => {
               subRowHtml += `<th class="border-r border-slate-300 print:border-black p-0 font-normal" style="background-color: ${item.color}80 !important; -webkit-print-color-adjust: exact; width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><div class="header-vertical text-[11px] mx-auto text-slate-700">${sub.name}</div></th>`;
               cgHtml += `<col style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;">`;
            });
         } else {
            topRowHtml += `<th rowspan="2" class="border-r border-slate-300 print:border-black p-0 text-slate-800" style="background-color: ${item.color} !important; -webkit-print-color-adjust: exact; width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><div class="header-vertical font-bold text-[12px] mx-auto">${item.group}</div></th>`;
            cgHtml += `<col style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;">`;
         }
      });
  };

  const makeCol = (w, count = 1) => { for (let i = 0; i < count; i++) cgHtml += `<col style="width: ${w}px; min-width: ${w}px; max-width: ${w}px;">`; };

  if (type === "annual") {
      let subjectCount = 0;
      schema.forEach(item => { subjectCount += (item.subs ? item.subs.length : 1); });
      let superTopRowHtml = `<tr><th colspan="3" class="border-r border-b border-slate-300 print:border-black bg-white sticky left-0 z-[70]" style="min-width: ${W_TOTAL_FIXED}px; width: ${W_TOTAL_FIXED}px; max-width: ${W_TOTAL_FIXED}px;"></th><th colspan="${subjectCount + 4}" class="border-r border-b border-slate-300 print:border-black p-2 bg-blue-100 text-blue-900 text-[13px] font-moul uppercase" style="-webkit-print-color-adjust: exact; background-color: #dbeafe !important;">ឆមាសទី១</th><th colspan="${subjectCount + 4}" class="border-r border-b border-slate-300 print:border-black p-2 bg-emerald-100 text-emerald-900 text-[13px] font-moul uppercase border-l-[3px] border-l-slate-400 print:border-l-black" style="-webkit-print-color-adjust: exact; background-color: #d1fae5 !important;">ឆមាសទី២</th><th colspan="3" class="border-r border-b border-slate-300 print:border-black p-2 bg-orange-100 text-orange-900 text-[13px] font-moul uppercase border-l-[3px] border-l-slate-400 print:border-l-black" style="-webkit-print-color-adjust: exact; background-color: #ffedd5 !important;">លទ្ធផលប្រចាំឆ្នាំ</th>${evalHeadersTop}</tr>`;

      renderSchemaHeaders("_s1");
      topRowHtml += `<th rowspan="2" class="border-r border-slate-300 print:border-black p-1 bg-slate-100 text-slate-700" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">សរុប<br>ឆ.១</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-blue-700 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">មធ្យម<br>ឆ.១</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-rose-600 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-emerald-700 bg-slate-100 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">និទ្ទេស</th>`;
      makeCol(W_STAT, 4);
      renderSchemaHeaders("_s2");
      topRowHtml += `<th rowspan="2" class="border-r border-slate-300 print:border-black p-1 bg-slate-100 text-slate-700" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">សរុប<br>ឆ.២</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-blue-700 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">មធ្យម<br>ឆ.២</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-rose-600 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-emerald-700 bg-slate-100 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">និទ្ទេស</th>`;
      makeCol(W_STAT, 4);
      makeCol(W_STAT + 10, 1); makeCol(W_STAT, 2); makeCol(W_EVAL, 4);
      cgHtml += `</colgroup>`;

      return `${cgHtml}${superTopRowHtml}
        <tr class="text-[12px] font-bold border-b border-slate-300 print:border-black bg-slate-50">
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky left-0 z-[70] print:static bg-white" style="width: ${W_NO}px; min-width: ${W_NO}px; max-width: ${W_NO}px; left: 0px;">ល.រ</th>
          <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-white" style="width: ${W_NAME}px; min-width: ${W_NAME}px; max-width: ${W_NAME}px; left: ${L_NAME}px;">ឈ្មោះសិស្ស</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky z-[70] print:static bg-white" style="width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width: ${W_GENDER}px; left: ${L_GENDER}px;">ភេទ</th>
          ${topRowHtml}
          <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black bg-amber-50 text-blue-800 text-[13px] font-moul" style="width: ${W_STAT+10}px; min-width: ${W_STAT+10}px; max-width: ${W_STAT+10}px;">មធ្យមភាគ<br>ប្រចាំឆ្នាំ</th>
          <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black bg-amber-50 text-rose-700 text-[13px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
          <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black bg-amber-50 text-emerald-700 text-[13px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">និទ្ទេស</th>
          ${evalHeadersSub_Annual}
        </tr><tr class="font-bold text-slate-800 bg-white border-b border-slate-300 print:border-black">${subRowHtml}</tr>`;
  } else if (type === "semester") {
      renderSchemaHeaders("");
      makeCol(W_STAT, 2); makeCol(W_STAT + 5, 2); makeCol(W_STAT, 2); makeCol(W_EVAL, 4); cgHtml += `</colgroup>`;
      return `${cgHtml}
        <tr class="text-[12px] font-bold border-b border-slate-300 print:border-black bg-slate-50">
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky left-0 z-[70] print:static bg-white" style="width: ${W_NO}px; min-width: ${W_NO}px; max-width: ${W_NO}px; left: 0px;">ល.រ</th>
          <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-white" style="width: ${W_NAME}px; min-width: ${W_NAME}px; max-width: ${W_NAME}px; left: ${L_NAME}px;">ឈ្មោះសិស្ស</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky z-[70] print:static bg-white" style="width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width: ${W_GENDER}px; left: ${L_GENDER}px;">ភេទ</th>
          ${topRowHtml}
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-700 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">សរុប<br>ប្រឡង</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-700 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">មធ្យមភាគ<br>ប្រឡង</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-blue-50 text-blue-800" style="width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width: ${W_STAT+5}px;">មធ្យមភាគ<br>ប្រចាំខែ</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-emerald-50 text-emerald-800" style="width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width: ${W_STAT+5}px;">មធ្យមភាគ<br>ប្រចាំឆមាស</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-orange-50 text-rose-700" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-orange-50 text-emerald-700" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">និទ្ទេស</th>
          ${evalHeadersTop}
        </tr><tr class="font-bold text-slate-800 bg-white border-b border-slate-300 print:border-black">${subRowHtml} ${evalHeadersSub}</tr>`;
  } else {
      renderSchemaHeaders("");
      makeCol(W_STAT, 4); makeCol(W_EVAL, 4); cgHtml += `</colgroup>`;
      return `${cgHtml}
        <tr class="text-[12px] font-bold border-b border-slate-300 print:border-black bg-slate-50">
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky z-[70] print:static bg-white" style="width: ${W_NO}px; min-width: ${W_NO}px; max-width: ${W_NO}px; left: 0px;">ល.រ</th>
          <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-white" style="width: ${W_NAME}px; min-width: ${W_NAME}px; max-width: ${W_NAME}px; left: ${L_NAME}px;">ឈ្មោះសិស្ស</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky z-[70] print:static bg-white" style="width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width: ${W_GENDER}px; left: ${L_GENDER}px;">ភេទ</th>
          ${topRowHtml}
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-700 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">សរុប</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-blue-50 text-blue-800" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">មធ្យមភាគ</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-rose-50 text-rose-700" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
          <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-emerald-50 text-emerald-700" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;">និទ្ទេស</th>
          ${evalHeadersTop}
        </tr><tr class="font-bold text-slate-800 bg-white border-b border-slate-300 print:border-black">${subRowHtml} ${evalHeadersSub}</tr>`;
  }
};

function renderEvalInputs(stuId, sc = {}) {
  const fields = [["eval_k", sc.eval_knowledge], ["eval_s", sc.eval_skill], ["eval_m", sc.eval_moral], ["eval_so", sc.eval_solidarity]];
  return fields.map(([k, val]) => `<td class="border-r border-slate-300 print:border-black p-0" style="width: 60px; min-width: 60px; max-width: 60px;"><input type="text" id="${k}_${stuId}" value="${val || ''}" oninput="window.markUnsaved()" class="eval-input w-full h-10 text-center text-slate-700 border-0 outline-none bg-transparent hover:bg-purple-50 focus:bg-purple-50 transition-colors"></td>`).join("");
}

window.fetchStudentsForScores = async function() {
  window.hasUnsavedChanges = false;
  document.getElementById("unsavedBadge")?.classList.add("hidden");
  
  const levelStr = document.getElementById("globalLevelSelect")?.value || "";
  const trackStr = document.getElementById("globalTrackSelect")?.value || "sci";
  const roomStr = document.getElementById("globalRoomSelect")?.value || "";
  const grade = levelStr ? `${levelStr} ${roomStr}` : ""; 
  const month = document.getElementById("globalPeriodValue")?.value || "មករា";
  const type = document.getElementById("globalPeriodType")?.value || "monthly";
  
  const schoolLevel = window.getSchoolLevel(levelStr);
  window.activeSchema = window.getScoreSchema(schoolLevel, type, trackStr);
  window.activeSubjectKeys = window.extractSubjectKeys(window.activeSchema);

  const th = document.getElementById("scoreTableHead");
  if (th) th.innerHTML = window.renderTableHeader(window.activeSchema, type);
  
  const tbody = document.getElementById("scoresTableBody");
  if (!tbody) return;

  try {
    let stRes = {data: []};
    if (typeof apiGet === "function") {
       try { stRes = await apiGet("getStudents", { status: "Active" }); } catch(e) {}
    }
    let allStus = (stRes.data && stRes.data.length > 0) ? stRes.data : (JSON.parse(localStorage.getItem('academic_students')) || []);
    let cleanLevel = levelStr.replace(/\s+/g, ''); let cleanRoom = roomStr.replace(/[«»\s]/g, '');

    window.scoresStudentList = allStus.filter(s => {
        if (s.status === "Dropped") return false;
        let sGrade = String(s.grade || "").replace(/\s+/g, ''); let sRoom = String(s.room || "").replace(/[«»\s]/g, '');
        let fullGradeDB = String(s.grade || "").replace(/\s+/g, ''); let expectedFull = cleanLevel + cleanRoom;
        return (sGrade === cleanLevel && sRoom === cleanRoom) || (fullGradeDB === expectedFull) || (fullGradeDB.includes(cleanLevel) && fullGradeDB.includes(cleanRoom));
    });

    if (window.scoresStudentList.length === 0) {
        window.scoresStudentList = Array.from({length: 15}, (_, i) => ({ id: "STU-" + String(i + 1).padStart(3, '0'), name: "សិស្សសាកល្បង " + (i + 1), gender: i % 2 === 0 ? "ប្រុស" : "ស្រី", grade: levelStr, room: roomStr }));
    }
    window.scoresStudentList.sort((a,b) => String(a.name||"").localeCompare(String(b.name||""), 'km'));

    let scRes = {data: []};
    if (typeof apiGet === "function") { try { scRes = await apiGet("getScores", { grade: grade }); } catch(e) {} }
    let allScores = (scRes.data && scRes.data.length > 0) ? scRes.data : JSON.parse(localStorage.getItem('academic_scores')) || [];
    
    if (type === "annual") {
        window.s1Scores = allScores.filter(s => s.period_type === "semester" && s.month === "ឆមាសទី១" && s.grade === grade);
        window.s2Scores = allScores.filter(s => s.period_type === "semester" && s.month === "ឆមាសទី២" && s.grade === grade);
        window.currentScores = allScores.filter(s => s.period_type === "annual" && s.grade === grade);
    } else {
        window.currentScores = allScores.filter(s => s.period_type === type && s.month === month && s.grade === grade);
    }

    const W_NO = 40, W_NAME = 190, W_GENDER = 50, W_SCORE = 45, W_STAT = 60;
    const L_NAME = W_NO, L_GENDER = W_NO + W_NAME;

    let trs = "";
    window.scoresStudentList.forEach((stu, idx) => {
        let genColor = stu.gender === 'ស្រី' ? 'text-rose-600 bg-rose-50/50' : 'text-blue-700 bg-blue-50/50';
        let rowHtml = `<td class="p-1.5 border-r border-slate-300 print:border-black text-center font-bold text-slate-500 sticky z-10 print:static text-[12px] font-mono bg-white" style="left: 0; width: ${W_NO}px; min-width: ${W_NO}px; max-width: ${W_NO}px;">${idx + 1}</td><td class="p-1.5 px-4 border-r border-slate-300 print:border-black text-left font-bold whitespace-nowrap sticky z-10 print:static text-slate-800 font-moul text-[13px] bg-white overflow-hidden text-ellipsis" style="left: ${L_NAME}px; width: ${W_NAME}px; min-width: ${W_NAME}px; max-width: ${W_NAME}px;">${stu.name}</td><td class="p-1.5 border-r border-slate-300 print:border-black text-center font-bold font-siemreap ${genColor} sticky z-10 print:static text-[12px]" style="left: ${L_GENDER}px; width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width: ${W_GENDER}px;">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>`;

        if (type === "annual") {
            let sc1 = window.s1Scores.find(s => String(s.student_id) === String(stu.id)) || {};
            let sc2 = window.s2Scores.find(s => String(s.student_id) === String(stu.id)) || {};
            let scA = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
            let colIndexTracker = 0;
            const makeInputs = (scObj, suffix, bg) => window.activeSubjectKeys.map(key => {
                const maxVal = window.schemaMaxMap[key] || 10;
                let val = scObj[key] !== undefined && scObj[key] !== "" ? scObj[key] : '';
                const colorClass = (val !== '' && val < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                return `<td class="border-r border-slate-300 print:border-black p-0 relative ${bg}" style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="text" inputmode="decimal" id="${key}_${suffix}_${stu.id}" data-row="${idx}" data-col="${colIndexTracker++}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input w-full h-10 text-center text-[13px] font-bold font-mono ${colorClass} border-0 focus:ring-inset focus:ring-2 focus:ring-indigo-400 outline-none bg-transparent hover:bg-slate-100 transition-colors"></td>`;
            }).join("");

            rowHtml += makeInputs(sc1, "s1", "bg-slate-50/50");
            rowHtml += `<td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="total_s1_${stu.id}">${sc1.total_score||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="avg_s1_${stu.id}">${sc1.average||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-rose-600 font-mono text-[14px] bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_s1_${stu.id}">${sc1.rank||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-emerald-700 font-moul text-[12px] bg-slate-100 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_s1_${stu.id}">${sc1.grade_letter||''}</td>`;

            rowHtml += makeInputs(sc2, "s2", "bg-white");
            rowHtml += `<td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="total_s2_${stu.id}">${sc2.total_score||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-slate-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="avg_s2_${stu.id}">${sc2.average||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-rose-600 font-mono text-[14px] bg-slate-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_s2_${stu.id}">${sc2.rank||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-emerald-700 font-moul text-[12px] bg-slate-50 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_s2_${stu.id}">${sc2.grade_letter||''}</td><td class="p-1.5 border-r border-slate-300 print:border-black text-center font-black text-blue-800 font-mono text-[15px] bg-amber-50" style="width: ${W_STAT+10}px; min-width: ${W_STAT+10}px; max-width: ${W_STAT+10}px;" id="avg_annual_${stu.id}">${scA.average||''}</td><td class="p-1.5 border-r border-slate-300 print:border-black text-center font-black text-rose-700 font-mono text-[16px] bg-amber-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_annual_${stu.id}">${scA.rank||''}</td><td class="p-1.5 border-r border-slate-300 print:border-black text-center font-black text-emerald-700 font-moul text-[13px] bg-amber-50 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_annual_${stu.id}">${scA.grade_letter||''}</td>`;
            rowHtml += renderEvalInputs(stu.id, scA);
        } else if (type === "semester") {
            let sc = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
            const sem = month.includes("២") ? "s2" : "s1";
            rowHtml += window.activeSubjectKeys.map((key, colIndex) => {
                const maxVal = window.schemaMaxMap[key] || 10; let val = sc[key] !== undefined && sc[key] !== "" ? sc[key] : '';
                const colorClass = (val !== '' && val < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                return `<td class="border-r border-slate-300 print:border-black p-0 relative" style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="text" inputmode="decimal" id="${key}_${sem}_${stu.id}" data-row="${idx}" data-col="${colIndex}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input w-full h-10 text-center text-[13px] font-bold font-mono ${colorClass} border-0 focus:ring-inset focus:ring-2 focus:ring-indigo-400 outline-none bg-transparent hover:bg-slate-100 transition-colors"></td>`;
            }).join("");
            rowHtml += `<td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="total_exam_${stu.id}">${sc.total_exam||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="avg_exam_${stu.id}">${sc.avg_exam||''}</td><td class="border-r border-slate-300 print:border-black p-0 bg-blue-50/50" style="width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width: ${W_STAT+5}px;"><input type="text" inputmode="decimal" placeholder="មធ្យម.ខែ" id="monthly_avg_${stu.id}" value="${sc.monthly_avg||''}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input w-full h-10 text-center text-[13px] font-bold font-mono text-blue-700 border-0 outline-none bg-transparent hover:bg-blue-100 focus:bg-blue-100 focus:ring-inset focus:ring-2 focus:ring-blue-300 transition-colors"></td><td class="p-1 border-r border-slate-300 print:border-black text-center font-black text-emerald-700 bg-emerald-50 font-mono text-[14px]" style="width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width: ${W_STAT+5}px;" id="avg_${stu.id}">${sc.average||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-black text-rose-600 bg-orange-50 font-mono text-[15px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_${stu.id}">${sc.rank||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-emerald-700 bg-orange-50 font-moul text-[12px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_${stu.id}">${sc.grade_letter||''}</td>`;
            rowHtml += renderEvalInputs(stu.id, sc);
        } else {
            let sc = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
            rowHtml += window.activeSubjectKeys.map((key, colIndex) => {
                const maxVal = window.schemaMaxMap[key] || 10; let val = sc[key] !== undefined && sc[key] !== "" ? sc[key] : '';
                const colorClass = (val !== '' && val < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                return `<td class="border-r border-slate-300 print:border-black p-0 relative" style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="text" inputmode="decimal" id="${key}_${stu.id}" data-row="${idx}" data-col="${colIndex}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input w-full h-10 text-center text-[13px] font-bold font-mono ${colorClass} border-0 focus:ring-inset focus:ring-2 focus:ring-indigo-400 outline-none bg-transparent hover:bg-slate-100 transition-colors"></td>`;
            }).join("");
            rowHtml += `<td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="total_${stu.id}">${sc.total_score||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-blue-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="avg_${stu.id}">${sc.average||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-black text-rose-600 font-mono text-[15px] bg-orange-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_${stu.id}">${sc.rank||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-emerald-700 font-moul text-[12px] bg-emerald-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_${stu.id}">${sc.grade_letter||''}</td>`;
            rowHtml += renderEvalInputs(stu.id, sc);
        }

        trs += `<tr id="row_${stu.id}" class="hover:bg-indigo-50/30 transition-colors border-b border-slate-200 print:border-black bg-white">${rowHtml}</tr>`;
    });
    tbody.innerHTML = trs;
    window.calculateAllScores(); 
  } catch (err) {
    console.error(err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="62" class="p-12 text-center text-rose-500 font-bold bg-rose-50"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><br>បរាជ័យក្នុងការតភ្ជាប់ទិន្នន័យ</td></tr>`;
  }
};

window.setupExcelLikeNavigation = function() {
  const tbody = document.getElementById("scoresTableBody");
  if (!tbody) return;
  tbody.addEventListener('keydown', function(e) {
    if (!e.target.classList.contains('score-input') && !e.target.classList.contains('eval-input')) return;
    let r = parseInt(e.target.getAttribute('data-row'));
    let c = parseInt(e.target.getAttribute('data-col'));
    if (isNaN(r) || isNaN(c)) return;

    let nextInput = null;
    let selectorStr = e.target.classList.contains('score-input') ? '.score-input' : '.eval-input';

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault(); nextInput = document.querySelector(`${selectorStr}[data-row='${r+1}'][data-col='${c}']`);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); nextInput = document.querySelector(`${selectorStr}[data-row='${r-1}'][data-col='${c}']`);
    } else if (e.key === 'ArrowRight') {
      nextInput = document.querySelector(`${selectorStr}[data-row='${r}'][data-col='${c+1}']`);
    } else if (e.key === 'ArrowLeft') {
      nextInput = document.querySelector(`${selectorStr}[data-row='${r}'][data-col='${c-1}']`);
    }
    if (nextInput) { nextInput.focus(); nextInput.select(); }
  });
};

window.filterScoreTable = function() {
  const term = document.getElementById("scoreSearchInput")?.value.toLowerCase() || "";
  const rows = document.querySelectorAll("#scoresTableBody tr[id^='row_']");
  rows.forEach(row => { 
    const name = row.querySelector("td:nth-child(2)").textContent.toLowerCase(); 
    row.style.display = name.includes(term) ? "" : "none"; 
  });
};

window.markUnsaved = function() { 
  window.hasUnsavedChanges = true; 
  document.getElementById("unsavedBadge")?.classList.remove("hidden"); 
};

window.printScoreList = function() {
    const table = document.getElementById("scoreTableMain");
    if (!table) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");
    
    window.calculateAllScores();
    const clonedTable = table.cloneNode(true);
    
    const inputs = clonedTable.querySelectorAll('input');
    inputs.forEach(input => {
        const val = input.value;
        const span = document.createElement('span');
        span.textContent = val;
        span.className = input.className.replace('score-input', '').replace('eval-input', '').replace(/bg-[a-z0-9/-]+/g, '').replace(/w-full/g, '').replace(/h-\d+/g, '');
        span.style.fontWeight = 'bold';
        if (input.classList.contains('text-rose-600')) span.style.color = '#e11d48';
        input.parentNode.replaceChild(span, input);
    });
    
    const allEls = clonedTable.querySelectorAll('*');
    allEls.forEach(el => {
        el.className = el.className.replace(/sticky/g, "").replace(/left-\[?\d+[a-z]*\]?/g, "").replace(/z-\[?\d+\]?/g, "").replace(/shadow-[^"'\s]*/g, "");
    });

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    const levelStr = document.getElementById("globalLevelSelect")?.value || "ថ្នាក់ទី ២";
    const roomStr = document.getElementById("globalRoomSelect")?.value || "«ខ»";
    const grade = `${levelStr} ${roomStr}`;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាចំណេះទូទៅ គំរូ";
    const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = sInfo.teacher_name || ".......................";
    const academicYear = sInfo.academic_year || "2026-2027";
    const currentYear = new Date().getFullYear();

    let titleText = `បញ្ជីពិន្ទុប្រចាំខែ${month}`;
    if (type === "semester") titleText = `បញ្ជីពិន្ទុប្រចាំ${month}`;
    else if (type === "annual") titleText = `បញ្ជីពិន្ទុប្រចាំឆ្នាំ`;

    let total = 0, female = 0, passedTotal = 0, passedFemale = 0, failedTotal = 0, failedFemale = 0;

    if (window.rankingsDataList && window.rankingsDataList.length > 0) {
        window.rankingsDataList.forEach(s => {
            total++;
            const isF = s.gender === "ស្រី";
            if (isF) female++;

            if (s.gradeLetter === "F" || s.gradeLetter === "ធ្លាក់" || s.gradeLetter === "-") {
                failedTotal++;
                if (isF) failedFemale++;
            } else {
                passedTotal++;
                if (isF) passedFemale++;
            }
        });
    }

    const rDates = window.reportCardDateSettings || {};
    const lunarDateStr = rDates.showLunar !== false ? rDates.lunarDate : "";
    const solarDateStr = window.getFormattedSolarDate();

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>${titleText} - ${grade}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
          @page { size: A4 landscape; margin: 10mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; font-family: 'Siemreap', sans-serif; color: #000; background: #fff; }
          .font-moul { font-family: 'Moul', serif; font-weight: normal; }
          .font-bold { font-weight: 700; }
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
          .header-left p { margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #1e3a8a; }
          .header-right { text-align: center; }
          .header-right p { margin: 0 0 3px 0; font-size: 14px; }
          .title-box { text-align: center; margin: 5px 0 15px 0; }
          .title-box h2 { margin: 0 0 5px 0; font-size: 18px; color: #000; }
          .title-box p { margin: 0; font-size: 12px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 15px; table-layout: fixed; border: 2px solid black; }
          th, td { border: 1px solid #000; padding: 2px; height: 26px; font-size: 11px; overflow: hidden; white-space: nowrap; word-break: break-all; }
          th { background-color: #f8fafc; font-weight: bold; }
          td:nth-child(2) { text-align: left; padding-left: 6px; white-space: nowrap; text-overflow: ellipsis; font-family: 'Moul', serif; font-size: 11px;}
          .header-vertical { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; padding: 5px 0; font-size: 9px; }
          .summary-wrapper { display: flex; justify-content: flex-start; margin-top: 20px; page-break-inside: avoid; }
          .summary-box { border: 1.5px solid #000; border-radius: 8px; padding: 10px 15px; background-color: #f8fafc; min-width: 45%; }
          .summary-title { font-family: 'Moul', serif; font-size: 12px; margin-bottom: 8px; text-decoration: underline; color: #0f172a; }
          .summary-table { width: 100%; border-collapse: collapse; font-size: 12px; font-weight: bold; border: none !important; }
          .summary-table td { border: none !important; padding: 4px 5px !important; height: auto !important; background: transparent !important; text-align: left; }
          .summary-table td:nth-child(2), .summary-table td:nth-child(3) { text-align: right; }
          .num-badge { font-family: monospace; font-size: 14px; margin: 0 2px; display: inline-block; min-width: 20px; text-align: center; }
          .footer-box { display: flex; justify-content: space-between; align-items: flex-start; padding: 0 50px; font-size: 12px; font-weight: bold; margin-top: 15px; page-break-inside: avoid; }
          .footer-col { text-align: center; }
          .footer-col p { margin: 0 0 5px 0; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-left"> <br><br>
            <p class="font-moul" style="font-size: 12px; color: #000;">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
            <p class="font-moul" style="font-size: 14px;">${schoolName}</p>
          </div>
          <div class="header-right">
            <p class="font-moul">ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p class="font-moul">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
               <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
               <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
               <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
            </div>
          </div>
        </div>

        <div class="title-box">
          <h2 class="font-moul">${titleText}</h2>
          <p class="font-bold font-siemreap">ថ្នាក់ទី ${grade.replace('ថ្នាក់ទី ', '')} | ឆ្នាំសិក្សា ${toKhmerNum(academicYear)}</p>
        </div>

        ${clonedTable.outerHTML}

        <div class="summary-wrapper">
           <div class="summary-box">
              <div class="summary-title">តារាងសង្ខេបស្ថិតិ</div>
              <table class="summary-table">
                 <tr style="color: #1e293b;">
                    <td>បញ្ឈប់បញ្ជីត្រឹមសិស្ស</td>
                    <td><span class="num-badge">${toKhmerNum(total.toString())}</span> នាក់</td>
                    <td>ស្រី <span class="num-badge">${toKhmerNum(female.toString())}</span> នាក់</td>
                 </tr>
                 <tr style="color: #047857; border-top: 1px dashed #cbd5e1 !important;">
                    <td style="padding-top: 6px !important;">សិស្សជាប់មធ្យមភាគសរុប</td>
                    <td style="padding-top: 6px !important;"><span class="num-badge">${toKhmerNum(passedTotal.toString())}</span> នាក់</td>
                    <td style="padding-top: 6px !important;">ស្រី <span class="num-badge">${toKhmerNum(passedFemale.toString())}</span> នាក់</td>
                 </tr>
                 <tr style="color: #e11d48;">
                    <td>សិស្សធ្លាក់មធ្យមភាគសរុប</td>
                    <td><span class="num-badge">${toKhmerNum(failedTotal.toString())}</span> នាក់</td>
                    <td>ស្រី <span class="num-badge">${toKhmerNum(failedFemale.toString())}</span> នាក់</td>
                 </tr>
              </table>
           </div>
        </div>

        <div class="footer-box">
          <div class="footer-col">
            <p style="font-weight: normal;">បានឃើញ និងឯកភាព</p>
            <p class="font-moul" style="font-size: 11px;">នាយិកាសាលា / នាយកសាលា</p>
            <div style="height: 50px;"></div>
            <p class="font-moul" style="font-size: 12px; color: #1e3a8a;">${principalName}</p>
          </div>
          <div class="footer-col">
            ${lunarDateStr ? `<p style="margin: 0 0 2px 0; font-weight: normal; font-size: 10px;">${lunarDateStr}</p>` : ''}
            <p style="font-weight: normal;">${solarDateStr}</p>
            <p class="font-moul" style="font-size: 11px; margin-top: 5px;">គ្រូទទួលបន្ទុកថ្នាក់</p>
            <div style="height: 40px;"></div>
            <p class="font-moul" style="font-size: 12px; color: #1e3a8a;">${teacherName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 800);
};


// =====================================================================
// 🔴 មុខងារបង្ហាញក្នុង Modal ទី ២: Rankings Content
// =====================================================================
window.rankingsSearchQuery = "";
window.rankingsGenderFilter = "all";
window.rankingsViewMode = "full";

window.renderRankingsContent = function() {
    window.calculateAllScores(); // Force data calculation before rendering
    const container = document.getElementById("modal-content-rankings");
    if (!container) return;

    container.innerHTML = `
      <div class="w-full flex flex-col space-y-4 font-siemreap bg-white rounded-3xl p-4 shadow-sm min-h-full">
        <!-- របារឧបករណ៍បញ្ជា -->
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 no-print border-b border-slate-100 pb-4">
          
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-[12px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
               ថ្នាក់រៀន ៖ <span id="lblRankGradeName" class="font-moul"></span>
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onclick="window.changeRankViewMode('full')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${window.rankingsViewMode==='full'?'bg-white text-indigo-700 shadow-sm':'text-slate-500 hover:text-slate-700'}">
                <i class="fa-solid fa-table-list"></i> តារាងទូទៅ
              </button>
              <button onclick="window.changeRankViewMode('split')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${window.rankingsViewMode==='split'?'bg-white text-indigo-700 shadow-sm':'text-slate-500 hover:text-slate-700'}">
                <i class="fa-solid fa-table-columns"></i> ទម្រង់ ២ ជួរ (A4)
              </button>
            </div>

            <div class="relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input type="text" placeholder="ស្វែងរកឈ្មោះ..." value="${window.rankingsSearchQuery}" oninput="window.filterRankingsTable(this.value, window.rankingsGenderFilter)"
                     class="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none w-36 sm:w-44 transition">
            </div>

            <select onchange="window.filterRankingsTable(window.rankingsSearchQuery, this.value)" class="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none">
              <option value="all" ${window.rankingsGenderFilter==='all'?'selected':''}>👥 ភេទទាំងអស់</option>
              <option value="ស្រី" ${window.rankingsGenderFilter==='ស្រី'?'selected':''}>👩 សិស្សស្រី</option>
              <option value="ប្រុស" ${window.rankingsGenderFilter==='ប្រុស'?'selected':''}>👨 សិស្សប្រុស</option>
            </select>

            <button onclick="window.toggleSharedDatePanel('datePanel-rankings')" class="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
              <i class="fa-solid fa-calendar-days"></i> កាលបរិច្ឆេទ
            </button>

            <button onclick="window.exportRankingsToExcel()" class="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
              <i class="fa-solid fa-file-excel"></i> Export Excel
            </button>

            <button onclick="window.printRankingTable()" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
              <i class="fa-solid fa-print"></i> បោះពុម្ព
            </button>
          </div>
        </div>

        ${window.getDateSettingsPanelHTML('rankings')}

        <!-- កាតសង្ខេបស្ថិតិ -->
        <div id="rankingsKpiContainer" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 no-print mt-3"></div>

        <!-- ផ្ទៃបង្ហាញតារាង -->
        <div class="w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col flex-1 mt-3">
          <div class="overflow-x-auto w-full custom-scrollbar flex-1">
            <table id="rankTableMain" class="w-full border-collapse text-[13px] text-center whitespace-nowrap bg-white">
              <thead id="rankTableHead" class="text-slate-700 sticky top-0 z-20 shadow-sm bg-slate-100 border-b border-slate-200"></thead>
              <tbody id="rankingsTableBody" class="divide-y divide-slate-100 text-slate-800"></tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    buildRankingsTable();
};

window.changeRankViewMode = function(mode) {
  window.rankingsViewMode = mode;
  window.renderRankingsContent();
};

window.filterRankingsTable = function(query, gender) {
  window.rankingsSearchQuery = query.toLowerCase();
  window.rankingsGenderFilter = gender;
  buildRankingsTable();
};

function buildRankingsTable() {
    const levelStr = document.getElementById("globalLevelSelect")?.value || "";
    const roomStr = document.getElementById("globalRoomSelect")?.value || "";
    const grade = levelStr ? `${levelStr} ${roomStr}` : "ថ្នាក់ទាំងអស់"; 
    const periodType = document.getElementById("globalPeriodType")?.value || "monthly";

    if (document.getElementById("lblRankGradeName")) document.getElementById("lblRankGradeName").textContent = grade;

    const allStudents = window.rankingsDataList || [];

    let total = allStudents.length;
    let female = allStudents.filter(s => s.gender === 'ស្រី').length;
    let passed = allStudents.filter(s => s.avg >= 5.0).length;
    let failed = total - passed;
    let passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    let classAvg = total > 0 ? (allStudents.reduce((acc, s) => acc + (s.avg || 0), 0) / total).toFixed(2) : "0.00";
    let topStudent = allStudents.find(s => s.rank === 1);

    const kpiEl = document.getElementById("rankingsKpiContainer");
    if (kpiEl && total > 0) {
      kpiEl.innerHTML = `
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base"><i class="fa-solid fa-users"></i></div>
          <div><div class="text-[11px] text-slate-500 font-bold">សិស្សសរុប</div><div class="text-sm font-black text-slate-800 font-mono">${window.toKhmerNum(total.toString())} <span class="text-xs font-normal text-slate-400 font-siemreap">(ស្រី ${window.toKhmerNum(female.toString())})</span></div></div>
        </div>
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base"><i class="fa-solid fa-circle-check"></i></div>
          <div><div class="text-[11px] text-slate-500 font-bold">ជាប់មធ្យមភាគ</div><div class="text-sm font-black text-emerald-600 font-mono">${window.toKhmerNum(passed.toString())} <span class="text-[11px] font-bold text-emerald-700 font-mono">(${window.toKhmerNum(passRate)}%)</span></div></div>
        </div>
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-base"><i class="fa-solid fa-circle-xmark"></i></div>
          <div><div class="text-[11px] text-slate-500 font-bold">ធ្លាក់មធ្យមភាគ</div><div class="text-sm font-black text-rose-600 font-mono">${window.toKhmerNum(failed.toString())} <span class="text-xs font-normal text-slate-400 font-siemreap">នាក់</span></div></div>
        </div>
        <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base"><i class="fa-solid fa-chart-line"></i></div>
          <div><div class="text-[11px] text-slate-500 font-bold">មធ្យមភាគរួមថ្នាក់</div><div class="text-sm font-black text-indigo-700 font-mono">${window.toKhmerNum(classAvg)}</div></div>
        </div>
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div class="w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center font-bold text-base shadow-sm">🥇</div>
          <div class="truncate"><div class="text-[11px] text-amber-800 font-bold">ជើងឯកលេខ ១</div><div class="text-xs font-bold text-slate-800 font-moul truncate">${topStudent ? topStudent.name : '-'}</div></div>
        </div>
      `;
    }

    const th = document.getElementById("rankTableHead");
    const tbody = document.getElementById("rankingsTableBody");
    if (!tbody || !th) return;

    if (allStudents.length === 0) {
        th.innerHTML = "";
        tbody.innerHTML = `<tr><td colspan="12" class="p-16 text-center text-slate-400 font-bold">មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់ទេ!</td></tr>`;
        return;
    }

    let filteredList = allStudents.filter(s => {
      const matchName = !window.rankingsSearchQuery || s.name.toLowerCase().includes(window.rankingsSearchQuery);
      const matchGender = window.rankingsGenderFilter === "all" || s.gender === window.rankingsGenderFilter;
      return matchName && matchGender;
    });

    const getGradeBadge = (g) => {
      const str = String(g || "មធ្យម").trim();
      let colorClass = "bg-slate-100 text-slate-700 border-slate-200";
      if (str.includes("A") || str.includes("ល្អប្រសើរ")) colorClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
      else if (str.includes("B") || str.includes("ល្អណាស់")) colorClass = "bg-blue-100 text-blue-800 border-blue-300";
      else if (str.includes("C") || str.includes("ល្អ")) colorClass = "bg-teal-100 text-teal-800 border-teal-300";
      else if (str.includes("D") || str.includes("ល្អបង្គួរ")) colorClass = "bg-amber-100 text-amber-800 border-amber-300";
      else if (str.includes("E") || str.includes("មធ្យម")) colorClass = "bg-orange-100 text-orange-800 border-orange-300";
      else if (str.includes("F") || str.includes("ខ្សោយ")) colorClass = "bg-rose-100 text-rose-800 border-rose-300";
      return `<span class="px-3 py-0.5 rounded-full text-xs font-moul border ${colorClass}">${str}</span>`;
    };

    if (window.rankingsViewMode === 'split') {
      th.innerHTML = `
        <tr class="bg-slate-100 text-slate-700 text-xs">
          <th class="p-3 w-12 font-moul">ល.រ</th><th class="p-3 w-48 text-left font-moul">គោត្តនាម និងនាម</th><th class="p-3 w-14">ភេទ</th><th class="p-3 w-24 bg-blue-50 text-blue-900 font-bold">មធ្យមភាគ</th><th class="p-3 w-24 bg-amber-50 text-amber-900 font-bold">ចំណាត់ថ្នាក់</th>
          <th class="p-3 w-12 font-moul border-l-2 border-slate-300">ល.រ</th><th class="p-3 w-48 text-left font-moul">គោត្តនាម និងនាម</th><th class="p-3 w-14">ភេទ</th><th class="p-3 w-24 bg-blue-50 text-blue-900 font-bold">មធ្យមភាគ</th><th class="p-3 w-24 bg-amber-50 text-amber-900 font-bold">ចំណាត់ថ្នាក់</th>
        </tr>
      `;

      let sorted = [...filteredList].sort((a, b) => a.rank - b.rank);
      const half = Math.ceil(sorted.length / 2);
      const leftList = sorted.slice(0, half);
      const rightList = sorted.slice(half);

      let rowsHtml = "";
      for (let i = 0; i < half; i++) {
        const s1 = leftList[i];
        const s2 = rightList[i];

        const row1Html = s1 ? `<td class="p-2.5 text-slate-400 font-mono text-xs font-bold">${i + 1}</td><td class="p-2.5 text-left font-moul text-xs text-slate-800">${s1.name}</td><td class="p-2.5 font-bold ${s1.gender==='ស្រី'?'text-rose-500':'text-blue-600'}">${s1.gender==='ស្រី'?'ស':'ប'}</td><td class="p-2.5 font-mono font-bold text-blue-700 bg-blue-50/40">${s1.avg.toFixed(2)}</td><td class="p-2.5 font-mono font-black text-rose-600 bg-rose-50/40">${s1.rank}</td>` : `<td></td><td></td><td></td><td></td><td></td>`;
        const row2Html = s2 ? `<td class="p-2.5 text-slate-400 font-mono text-xs font-bold border-l-2 border-slate-300">${half + i + 1}</td><td class="p-2.5 text-left font-moul text-xs text-slate-800">${s2.name}</td><td class="p-2.5 font-bold ${s2.gender==='ស្រី'?'text-rose-500':'text-blue-600'}">${s2.gender==='ស្រី'?'ស':'ប'}</td><td class="p-2.5 font-mono font-bold text-blue-700 bg-blue-50/40">${s2.avg.toFixed(2)}</td><td class="p-2.5 font-mono font-black text-rose-600 bg-rose-50/40">${s2.rank}</td>` : `<td class="border-l-2 border-slate-300"></td><td></td><td></td><td></td><td></td>`;

        rowsHtml += `<tr class="hover:bg-indigo-50/30 transition-colors border-b border-slate-100">${row1Html}${row2Html}</tr>`;
      }
      tbody.innerHTML = rowsHtml;
      return;
    }

    let colHtml = "";
    if (periodType === "monthly") {
       colHtml = `<th class="p-3.5 w-14 font-moul text-xs text-slate-600">ល.រ</th><th class="p-3.5 w-64 text-left font-moul text-xs text-slate-700">គោត្តនាម និងនាម</th><th class="p-3.5 w-16 text-slate-600">ភេទ</th><th class="p-3.5 w-32 bg-blue-50 text-blue-900 font-bold">មធ្យមភាគ</th><th class="p-3.5 w-32 bg-amber-50 text-amber-900 font-bold">ចំណាត់ថ្នាក់</th><th class="p-3.5 w-32 bg-emerald-50 text-emerald-900 font-bold">និទ្ទេស</th>`;
    } else if (periodType === "semester") {
       colHtml = `<th class="p-3.5 w-14 font-moul text-xs text-slate-600">ល.រ</th><th class="p-3.5 w-64 text-left font-moul text-xs text-slate-700">គោត្តនាម និងនាម</th><th class="p-3.5 w-16 text-slate-600">ភេទ</th><th class="p-3.5 w-28 bg-orange-50 text-orange-900">ម.ប្រឡង</th><th class="p-3.5 w-28 bg-blue-50 text-blue-900">ម.ខែ</th><th class="p-3.5 w-32 bg-rose-50 text-rose-900 font-bold">ម.ឆមាស</th><th class="p-3.5 w-32 bg-amber-50 text-amber-900 font-bold">ចំណាត់ថ្នាក់</th><th class="p-3.5 w-28 bg-emerald-50 text-emerald-900 font-bold">និទ្ទេស</th>`;
    } else {
       colHtml = `<th class="p-3.5 w-14 font-moul text-xs text-slate-600">ល.រ</th><th class="p-3.5 w-64 text-left font-moul text-xs text-slate-700">គោត្តនាម និងនាម</th><th class="p-3.5 w-16 text-slate-600">ភេទ</th><th class="p-3.5 w-28 bg-blue-50 text-blue-900">ម.ឆ.១</th><th class="p-3.5 w-28 bg-indigo-50 text-indigo-900">ម.ឆ.២</th><th class="p-3.5 w-32 bg-amber-50 text-amber-900 font-bold">ម.ប្រចាំឆ្នាំ</th><th class="p-3.5 w-32 bg-rose-50 text-rose-900 font-bold">ចំណាត់ថ្នាក់</th><th class="p-3.5 w-28 bg-emerald-50 text-emerald-900 font-bold">និទ្ទេស</th>`;
    }
    th.innerHTML = `<tr>${colHtml}</tr>`;

    let rowsHtml = "";
    filteredList.forEach((s, idx) => {
       const genderBadge = s.gender === "ស្រី" ? `<span class="text-rose-600 font-bold">ស្រី</span>` : `<span class="text-blue-600 font-bold">ប្រុស</span>`;
       let rankDisplay = window.toKhmerNum(s.rank.toString());
       let trData = "";
       if (periodType === "monthly") {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td><td class="p-3 text-left font-bold text-slate-800 font-moul">${s.name}</td><td class="p-3 text-center">${genderBadge}</td><td class="p-3 font-mono font-black text-blue-700 bg-blue-50/20">${s.avg.toFixed(2)}</td><td class="p-3 text-center font-mono font-bold text-rose-600 bg-amber-50/30">${rankDisplay}</td><td class="p-3 text-center">${getGradeBadge(s.gradeLetter)}</td>`;
       } else if (periodType === "semester") {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td><td class="p-3 text-left font-bold text-slate-800 font-moul">${s.name}</td><td class="p-3 text-center">${genderBadge}</td><td class="p-3 font-mono text-orange-700 bg-orange-50/20 font-bold">${s.exam_avg.toFixed(2)}</td><td class="p-3 font-mono text-blue-700 bg-blue-50/20 font-bold">${s.monthly_avg.toFixed(2)}</td><td class="p-3 font-mono font-black text-rose-700 bg-rose-50/30">${s.avg.toFixed(2)}</td><td class="p-3 text-center font-bold text-rose-600">${rankDisplay}</td><td class="p-3 text-center">${getGradeBadge(s.gradeLetter)}</td>`;
       } else {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td><td class="p-3 text-left font-bold text-slate-800 font-moul">${s.name}</td><td class="p-3 text-center">${genderBadge}</td><td class="p-3 font-mono text-blue-700 bg-blue-50/20 font-bold">${s.sem1_avg.toFixed(2)}</td><td class="p-3 font-mono text-indigo-700 bg-indigo-50/20 font-bold">${s.sem2_avg.toFixed(2)}</td><td class="p-3 font-mono font-black text-amber-700 bg-amber-50/40">${s.avg.toFixed(2)}</td><td class="p-3 text-center font-bold text-rose-600">${rankDisplay}</td><td class="p-3 text-center">${getGradeBadge(s.gradeLetter)}</td>`;
       }
       rowsHtml += `<tr class="hover:bg-indigo-50/30 transition-colors border-b border-slate-100">${trData}</tr>`;
    });
    tbody.innerHTML = rowsHtml;
}


// =====================================================================
// 🔴 មុខងារបង្ហាញក្នុង Modal ទី ៣: Report Cards Content
// =====================================================================
window.renderReportCardsContent = function() {
  window.calculateAllScores(); // Force calculation
  const c = document.getElementById("modal-content-reportcards");
  if (!c) return;
  
  if (!window.rankingsDataList || window.rankingsDataList.length === 0) {
      c.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-500 font-bold p-16 bg-white"><div class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center text-4xl mb-4"><i class="fa-solid fa-book-open"></i></div><h3 class="text-lg font-bold text-slate-700 font-moul mb-2">មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់</h3><p class="text-sm">សូមបញ្ចូលពិន្ទុ និងគណនាចំណាត់ថ្នាក់ជាមុនសិន។</p></div>`;
      return;
  }

  const students = window.rankingsDataList;
  const sOptions = students.map((s, idx) => `<option value="${s.id}" ${window.selectedReportCardStudentId === String(s.id) ? 'selected' : ''}>ល.រ ${idx + 1} ៖ ${s.name}</option>`).join('');

  c.innerHTML = `
    <div class="flex flex-col h-full bg-slate-100 p-3 md:p-5 border border-slate-200 font-siemreap">
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end no-print">
        <div><label class="block text-xs font-bold text-slate-600 mb-1">ទម្រង់ព្រឹត្តិបត្រ</label><select onchange="window.changeReportCardViewMode(this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold text-indigo-700 outline-none p-2 rounded-xl"><option value="monthly_sheet" ${window.reportCardPrintType==='monthly_sheet'?'selected':''}>📄 ទំព័រលទ្ធផល (A4)</option><option value="cover_page" ${window.reportCardPrintType==='cover_page'?'selected':''}>📘 ក្របមុខ និងព័ត៌មាន</option><option value="full_booklet" ${window.reportCardPrintType==='full_booklet'?'selected':''}>📚 សៀវភៅតាមដានពេញ</option></select></div>
        <div><label class="block text-xs font-bold text-slate-600 mb-1">កម្រិតសិក្សា</label><select onchange="window.changeEducationLevel(this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold text-purple-800 outline-none p-2 rounded-xl"><option value="auto" ${window.selectedEducationLevel==='auto'?'selected':''}>🔄 ស្វ័យប្រវត្តិ</option><option value="primary" ${window.selectedEducationLevel==='primary'?'selected':''}>🏫 បឋមសិក្សា</option><option value="secondary" ${window.selectedEducationLevel==='secondary'?'selected':''}>🏛️ អនុ / វិទ្យាល័យ</option></select></div>
        <div><label class="block text-xs font-bold text-slate-600 mb-1">ជ្រើសរើសសិស្ស</label><select onchange="window.filterReportCardStudent(this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold text-emerald-800 outline-none p-2 rounded-xl"><option value="all" ${window.selectedReportCardStudentId==='all'?'selected':''}>👥 សិស្សទាំងអស់ (${students.length} នាក់)</option>${sOptions}</select></div>
        
        <button onclick="window.toggleSharedDatePanel('datePanel-reportcards')" class="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto">
          <i class="fa-solid fa-calendar-days"></i> កាលបរិច្ឆេទ
        </button>

        <button onclick="window.printReportCards()" class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 text-white rounded-xl text-sm font-black shadow-md transition flex items-center gap-2"><i class="fa-solid fa-print"></i> បោះពុម្ពបញ្ជូនផ្ទះ</button>
      </div>

      ${window.getDateSettingsPanelHTML('reportcards')}

      <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center gap-8 py-2 mt-4" id="reportCardsPreviewArea">${window.renderReportCardPreview()}</div>
    </div>
  `;
};

// ==========================================
// បោះពុម្ពតារាងចំណាត់ថ្នាក់
// ==========================================
window.printRankingTable = function() {
  const level = document.getElementById("globalLevelSelect")?.value || "";
  const room = document.getElementById("globalRoomSelect")?.value || "";
  const grade = level ? `${level} ${room}` : "ថ្នាក់ទី ៨";
  const type = document.getElementById("globalPeriodType")?.value || "monthly";
  const month = document.getElementById("globalPeriodValue")?.value || "មករា";

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "វិទ្យាល័យ ហ៊ុន សែន សេរីភាព";
  const districtName = sInfo.district || "ក្រុងតាខ្មៅ";
  const academicYear = sInfo.academic_year || "2025-2026";
  const teacherName = sInfo.teacher_name || ".......................";
  const principalName = sInfo.principal_name || ".......................";
  const currentYear = new Date().getFullYear();

  if (!window.rankingsDataList || window.rankingsDataList.length === 0) {
      alert("⚠️ មិនមានទិន្នន័យចំណាត់ថ្នាក់សម្រាប់បោះពុម្ពទេ!");
      return;
  }

  let rankedStudents = [...window.rankingsDataList];
  rankedStudents.sort((a, b) => a.rank - b.rank);

  let total = rankedStudents.length;
  let female = rankedStudents.filter(s => s.gender === "ស្រី").length;
  let passedStudents = rankedStudents.filter(s => s.avg >= 5.0);
  let passedTotal = passedStudents.length;
  let passedFemale = passedStudents.filter(s => s.gender === "ស្រី").length;
  let failedTotal = total - passedTotal;
  let failedFemale = female - passedFemale;

  const half = Math.ceil(rankedStudents.length / 2);
  const leftList = rankedStudents.slice(0, half);
  const rightList = rankedStudents.slice(half);

  let rowsHtml = "";
  for (let i = 0; i < half; i++) {
      const s1 = leftList[i];
      const s2 = rightList[i];

      const row1Html = s1 ? `
          <td class="td-cell">${toKhmerNum((i + 1).toString())}</td>
          <td class="td-cell td-name">${s1.name}</td>
          <td class="td-cell" style="color: ${s1.gender === 'ស្រី' ? '#e11d48' : '#1e3a8a'}; font-weight: bold;">${s1.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
          <td class="td-cell td-avg">${toKhmerNum(s1.avg.toFixed(2))}</td>
          <td class="td-cell td-rank">${toKhmerNum(s1.rank.toString())}</td>
      ` : `<td class="td-cell"></td><td class="td-cell"></td><td class="td-cell"></td><td class="td-cell"></td><td class="td-cell"></td>`;

      const row2Html = s2 ? `
          <td class="td-cell border-col-split">${toKhmerNum((half + i + 1).toString())}</td>
          <td class="td-cell td-name">${s2.name}</td>
          <td class="td-cell" style="color: ${s2.gender === 'ស្រី' ? '#e11d48' : '#1e3a8a'}; font-weight: bold;">${s2.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
          <td class="td-cell td-avg">${toKhmerNum(s2.avg.toFixed(2))}</td>
          <td class="td-cell td-rank">${toKhmerNum(s2.rank.toString())}</td>
      ` : `<td class="td-cell border-col-split"></td><td class="td-cell"></td><td class="td-cell"></td><td class="td-cell"></td><td class="td-cell"></td>`;

      rowsHtml += `<tr>${row1Html}${row2Html}</tr>`;
  }

  let titleText = `តារាងចំណាត់ថ្នាក់ប្រចាំខែ ${month}`;
  if (type === "semester") titleText = `តារាងចំណាត់ថ្នាក់ប្រចាំ ${month}`;
  else if (type === "annual") titleText = `តារាងចំណាត់ថ្នាក់ប្រចាំឆ្នាំសិក្សា ${toKhmerNum(academicYear)}`;

  const rDates = window.reportCardDateSettings || {};
  const lunarDateStr = rDates.showLunar !== false ? rDates.lunarDate : "";
  const solarDateStr = window.getFormattedSolarDate();

  const printContent = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>${titleText} - ${grade}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
        * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { margin: 0 !important; padding: 0 !important; font-family: 'Siemreap', sans-serif; color: #000; background: #fff; width: 100%; line-height: 1.4; }
        .font-moul { font-family: 'Moul', serif; }
        .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; width: 100%; }
        .header-left p { margin: 0 0 3px 0; font-size: 11.5px; }
        .header-right { text-align: center; }
        .header-right p { margin: 0 0 3px 0; font-size: 12.5px; }
        .title-box { text-align: center; margin: 4px 0 10px 0; }
        .title-box h2 { margin: 0 0 3px 0; font-size: 16px; color: #1e3a8a; font-family: 'Moul', serif; }
        .title-box p { margin: 0; font-size: 11.5px; font-weight: bold; color: #334155; }
        .main-table { width: 100%; border-collapse: collapse !important; border-spacing: 0 !important; text-align: center; font-size: 11px; table-layout: fixed; border: 1px solid #000 !important; }
        .th-cell { background-color: #f1f5f9 !important; font-weight: bold; font-family: 'Moul', serif; font-size: 10px; border: 1px solid #000 !important; padding: 5px 2px; vertical-align: middle; }
        .td-cell { border: 1px solid #000 !important; padding: 3.5px 2px; height: 25px; font-family: monospace; font-size: 11px; vertical-align: middle; }
        .td-name { text-align: left !important; padding-left: 6px !important; font-family: 'Moul', serif !important; font-size: 10px !important; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .td-avg { font-weight: bold; color: #1e3a8a; background-color: #eff6ff !important; }
        .td-rank { font-weight: bold; color: #be123c; background-color: #fff1f2 !important; }
        .border-col-split { border-left: 2px solid #000 !important; }
        .summary-wrapper { display: flex; justify-content: flex-start; margin-top: 10px; page-break-inside: avoid; }
        .summary-box { border: 1.5px solid #000; border-radius: 6px; padding: 8px 14px; background-color: #f8fafc !important; min-width: 48%; box-sizing: border-box; }
        .summary-title { font-family: 'Moul', serif; font-size: 11px; margin-bottom: 6px; text-decoration: underline; color: #0f172a; }
        .summary-table { width: 100%; border-collapse: collapse; font-size: 11.5px; font-weight: bold; }
        .summary-table td { border: none !important; padding: 3px 4px !important; height: auto !important; background: transparent !important; }
        .num-badge { font-family: monospace; font-size: 13px; margin: 0 2px; display: inline-block; min-width: 18px; text-align: center; }
        .footer-box { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 14px; padding: 0 20px; font-size: 11.5px; page-break-inside: avoid; }
        .footer-col { text-align: center; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="header-left"><br><br>
          <p class="font-moul" style="font-size: 11px; color: #334155;">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាល${districtName}</p>
          <p class="font-moul" style="font-size: 12px; color: #1e3a8a;">${schoolName}</p>
        </div>
        <div class="header-right">
          <p class="font-moul" style="color: #1e3a8a;">ព្រះរាជាណាចក្រកម្ពុជា</p>
          <p class="font-moul" style="color: #1e3a8a;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
               <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
               <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
               <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
          </div>
        </div>
      </div>

      <div class="title-box">
        <h2>${titleText}</h2>
        <p>ថ្នាក់រៀន ៖ <span class="font-moul" style="color: #be123c;">${grade}</span> &nbsp;|&nbsp; ឆ្នាំសិក្សា ៖ <span style="font-family: monospace; font-weight: bold;">${toKhmerNum(academicYear)}</span></p>
      </div>

      <table class="main-table">
        <thead>
          <tr>
            <th class="th-cell" style="width: 4.5%;">ល.រ</th><th class="th-cell" style="width: 26.5%;">គោត្តនាម និងនាម</th><th class="th-cell" style="width: 4.5%;">ភេទ</th><th class="th-cell" style="width: 7.5%; color: #1e3a8a;">មធ្យមភាគ</th><th class="th-cell" style="width: 7%; color: #be123c;">ចំណាត់ថ្នាក់</th>
            <th class="th-cell border-col-split" style="width: 4.5%;">ល.រ</th><th class="th-cell" style="width: 26.5%;">គោត្តនាម និងនាម</th><th class="th-cell" style="width: 4.5%;">ភេទ</th><th class="th-cell" style="width: 7.5%; color: #1e3a8a;">មធ្យមភាគ</th><th class="th-cell" style="width: 7%; color: #be123c;">ចំណាត់ថ្នាក់</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="summary-wrapper">
         <div class="summary-box">
            <div class="summary-title">តារាងសង្ខេបស្ថិតិ</div>
            <table class="summary-table">
               <tr style="color: #1e293b;">
                  <td style="text-align: left;">បញ្ឈប់បញ្ជីត្រឹមសិស្ស</td><td style="text-align: right;"><span class="num-badge">${toKhmerNum(total.toString())}</span> នាក់</td><td style="text-align: right;">ស្រី <span class="num-badge">${toKhmerNum(female.toString())}</span> នាក់</td>
               </tr>
               <tr style="color: #047857; border-top: 1px dashed #cbd5e1 !important;">
                  <td style="text-align: left; padding-top: 4px !important;">សិស្សជាប់មធ្យមភាគសរុប</td><td style="text-align: right; padding-top: 4px !important;"><span class="num-badge">${toKhmerNum(passedTotal.toString())}</span> នាក់</td><td style="text-align: right; padding-top: 4px !important;">ស្រី <span class="num-badge">${toKhmerNum(passedFemale.toString())}</span> នាក់</td>
               </tr>
               <tr style="color: #e11d48;">
                  <td style="text-align: left;">សិស្សធ្លាក់មធ្យមភាគសរុប</td><td style="text-align: right;"><span class="num-badge">${toKhmerNum(failedTotal.toString())}</span> នាក់</td><td style="text-align: right;">ស្រី <span class="num-badge">${toKhmerNum(failedFemale.toString())}</span> នាក់</td>
               </tr>
            </table>
         </div>
      </div>

      <div class="footer-box">
        <div class="footer-col">
          <p style="margin: 0 0 4px 0; font-weight: normal;">បានឃើញ និងឯកភាព</p><p class="font-moul" style="font-size: 11px; margin: 0; color: #1e3a8a;">នាយកសាលា</p>
          <div style="height: 50px;"></div><p class="font-moul" style="font-size: 12px; color: #1e3a8a;">${principalName}</p>
        </div>
        <div class="footer-col">
          ${lunarDateStr ? `<p style="margin: 0 0 2px 0; font-weight: normal; font-size: 10px;">${lunarDateStr}</p>` : ''}
          <p style="margin: 0 0 4px 0; font-weight: normal;">${solarDateStr}</p>
          <p class="font-moul" style="font-size: 11px; margin: 0; color: #1e3a8a;">គ្រូទទួលបន្ទុកថ្នាក់</p><div style="height: 40px;"></div><p class="font-moul" style="color: #1e3a8a; font-size: 11px;">${teacherName}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1050,height=850');
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 450);
};

window.exportRankingsToExcel = function() {
    alert("មុខងារ Export Excel កំពុងស្ថិតក្នុងការអភិវឌ្ឍ។");
};

// ផ្នែកព្រឹត្តិបត្រពិន្ទុ និងគំរូវិន័យ
window.CONDUCT_TEMPLATES = [
  "ស្លូតបូត សុភាពរាបសារ ខិតខំរៀនសូត្រ និងគោរពវិន័យសាលាបានល្អ",
  "មានវិន័យល្អ ឧស្សាហ៍ព្យាយាម ស្តាប់ដំបូន្មានលោកគ្រូអ្នកគ្រូ",
  "ឆ្លាតវៃ រហ័សរហួន ចូលរួមសកម្មភាពក្នុងថ្នាក់បានយ៉ាងសកម្ម",
  "ស្លូតបូត រួសរាយរាក់ទាក់ តែត្រូវបង្កើនការយកចិត្តទុកដាក់បន្ថែម",
  "ខិតខំរៀនសូត្រ តែត្រូវបង្កើនភាពក្លាហានក្នុងការឆ្លើយសំណួរ"
];
window.reportCardPrintType = 'monthly_sheet'; 
window.selectedReportCardStudentId = 'all';  
window.selectedEducationLevel = 'auto';      

window.changeReportCardViewMode = function(mode) { window.reportCardPrintType = mode; window.refreshRcPreview(); };
window.changeEducationLevel = function(lvl) { window.selectedEducationLevel = lvl; window.refreshRcPreview(); };
window.filterReportCardStudent = function(id) { window.selectedReportCardStudentId = id; window.refreshRcPreview(); };
window.refreshRcPreview = function() {
  const el = document.getElementById("reportCardsPreviewArea");
  if (el) el.innerHTML = window.renderReportCardPreview();
};

window.renderReportCardPreview = function() {
  if (!window.rankingsDataList || window.rankingsDataList.length === 0) return '<div class="p-12 text-slate-400 font-bold bg-white rounded-2xl shadow-sm">គ្មានទិន្នន័យសិស្ស</div>';
  const allStudents = window.rankingsDataList;
  let target = allStudents;
  if (window.selectedReportCardStudentId && window.selectedReportCardStudentId !== 'all') {
    target = allStudents.filter(s => String(s.id).trim() === String(window.selectedReportCardStudentId).trim());
  }

  return target.map((s, idx) => {
    let sheetHtml = `<div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">${window.generateMonthlySheetHTML(s, null)}</div>`;
    return `
      <div class="no-print w-full max-w-[210mm] flex items-center justify-between bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-xs text-xs font-siemreap">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-mono">${idx + 1}</span>
          <span class="font-bold text-slate-800 font-moul text-[13px]">${s.name}</span>
          <span class="text-slate-400">|</span><span class="text-slate-500">ភេទ៖ <b>${s.gender || 'ប្រុស'}</b></span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-indigo-600 font-bold">មធ្យមភាគ៖ <b class="font-mono text-sm">${s.avg != null ? window.toKhmerNum(Number(s.avg).toFixed(2)) : '-'}</b></span>
          <span class="text-rose-600 font-bold">ចំណាត់ថ្នាក់៖ <b class="font-mono text-sm">${s.rank != null ? window.toKhmerNum(s.rank.toString()) : '-'}</b></span>
        </div>
      </div>
      <div class="preview-page-container bg-white shadow-xl rounded-sm mb-6 print:shadow-none print:m-0">${sheetHtml}</div>
    `;
  }).join("");
};


// ==========================================
// មុខងារបង្កើតទំព័រព្រឹត្តិបត្រពិន្ទុ (បង្ហាញមុខវិជ្ជារង និងមុខវិជ្ជាគោលពេញលេញ)
// ==========================================
window.generateMonthlySheetHTML = function(stu, periodOverride = null) {
  const levelStr = document.getElementById("globalLevelSelect")?.value || stu.grade || "ថ្នាក់ទី ២";
  const month = periodOverride || document.getElementById("globalPeriodValue")?.value || "មករា";
  const type = document.getElementById("globalPeriodType")?.value || "monthly";

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const principalName = sInfo.principal_name || ".......................";
  const teacherName = sInfo.teacher_name || ".......................";
  const academicYear = sInfo.academic_year || "២០២៦-២០២៧";

  const toKhNum = (num) => window.toKhmerNum ? window.toKhmerNum(String(num)) : String(num);

  let headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំខែ ${month}`;
  if (type === "semester") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំ ${month}`;
  else if (type === "annual") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំឆ្នាំសិក្សា ${toKhNum(academicYear)}`;

  const isPrimary = window.getEducationLevel ? (window.getEducationLevel(levelStr) === 'primary') : levelStr.includes("ទី ១") || levelStr.includes("ទី ២") || levelStr.includes("ទី ៣") || levelStr.includes("ទី ៤") || levelStr.includes("ទី ៥") || levelStr.includes("ទី ៦");

  let sc = {};
  if (window.currentScores && window.currentScores.length > 0) {
      sc = window.currentScores.find(item => String(item.student_id) === String(stu.id)) || stu;
  } else {
      sc = stu;
  }

  let schema = window.activeSchema;
  if (!schema || schema.length === 0) {
     schema = [
        { group: "ភាសាខ្មែរ", subs: [{name:"សមត្ថភាពស្តាប់", key:"k_listen", max:10}, {name:"សមត្ថភាពសរសេរ", key:"k_write", max:10}, {name:"សមត្ថភាពអាន", key:"k_read", max:10}, {name:"សមត្ថភាពនិយាយ", key:"k_compose", max:10}] },
        { group: "គណិតវិទ្យា", subs: [{name:"ចំនួន", key:"m_num", max:10}, {name:"រង្វាស់រង្វាល់", key:"m_measure", max:10}, {name:"ធរណីមាត្រ", key:"m_geo", max:10}, {name:"ពីជគណិត", key:"m_alg", max:10}, {name:"ស្ថិតិ", key:"m_stat", max:10}] },
        { group: "វិទ្យាសាស្ត្រ", subs: [{name:"រូបវិទ្យា", key:"s_phy", max:10}, {name:"គីមីវិទ្យា", key:"s_chem", max:10}, {name:"ជីវវិទ្យា", key:"s_bio", max:10}, {name:"ផែនដី-បរិស្ថាន", key:"s_earth", max:10}] },
        { group: "សិក្សាសង្គម", subs: [{name:"សីលធម៌-ពលរដ្ឋ", key:"ss_moral", max:10}, {name:"ភូមិវិទ្យា", key:"ss_geo", max:10}, {name:"ប្រវត្តិវិទ្យា", key:"ss_hist", max:10}] },
        { group: "អប់រំកាយ សុខភាព កីឡា", subs: [{name:"អប់រំកាយ-កីឡា", key:"pe_sport", max:10}, {name:"សុខភាព-អនាម័យ", key:"pe_health", max:10}] },
        { group: "បំណិនជីវិត", key: "life_skill", max: 10 },
        { group: "ភាសាបរទេស", key: "foreign_lang", max: 10 }
     ];
  }

  let tableHeaderHtml = `
      <tr style="background-color: #f8fafc; color: #1e3a8a; height: 28px;">
         <th rowspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 5%; font-family: 'Moul', serif; font-size: 10px;">ល.រ</th>
         <th colspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 38%; font-family: 'Moul', serif; font-size: 10px;">មុខវិជ្ជា</th>
         <th colspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 23%; font-family: 'Moul', serif; font-size: 10px;">ពិន្ទុ</th>
         <th colspan="4" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 34%; font-family: 'Moul', serif; font-size: 10px;">និទ្ទេស</th>
      </tr>
      <tr style="background-color: #f8fafc; font-size: 9px; height: 20px;">
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 19%;">មុខវិជ្ជាគោល</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 19%;">មុខវិជ្ជារង</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 10%;">អតិបរមា</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 13%; color: #1e3a8a;">ពិន្ទុខែ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អបង្គួរ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">មធ្យម</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%; color: #e11d48;">ខ្សោយ</th>
      </tr>
  `;

  let rowsHtml = "";
  let globalIndex = 1;

  schema.forEach((item) => {
     if (item.subs && item.subs.length > 0) {
         const rowSpan = item.subs.length;
         item.subs.forEach((sub, subIdx) => {
             const subKey = sub.key;
             const subName = sub.name;
             const maxVal = window.schemaMaxMap?.[subKey] || sub.max || 10;
             const val = sc[subKey];
             const displayVal = (val !== undefined && val !== null && String(val).trim() !== "") ? Number(val) : null;
             
             const formattedMax = toKhNum(maxVal);
             const formattedVal = displayVal !== null ? toKhNum(displayVal) : "-";
             
             let marks = ['', '', '', ''];
             let valColor = "#1e3a8a"; 
             
             if (displayVal !== null) {
                 const pct = (displayVal / maxVal) * 100;
                 if (pct >= 80) marks[0] = '✔';
                 else if (pct >= 65) marks[1] = '✔';
                 else if (pct >= 50) marks[2] = '✔';
                 else { marks[3] = '✔'; valColor = "#e11d48"; } 
             }

             let groupCell = "";
             if (subIdx === 0) {
                 groupCell = `<td rowspan="${rowSpan}" style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 10.5px; font-weight: bold; font-family: 'Moul', serif;">${toKhNum(globalIndex++)}</td>
                              <td rowspan="${rowSpan}" style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-weight: bold; font-family: 'Moul', serif; font-size: 10.5px;">${item.group}</td>`;
             }

             rowsHtml += `
               <tr style="height: 19px;">
                 ${groupCell}
                 <td style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-size: 10.5px; font-family: 'Siemreap', sans-serif;">${subName}</td>
                 <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 10.5px; font-mono; color: #334155;">${formattedMax}</td>
                 <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11px; font-mono; font-weight: bold; color: ${valColor}; background: #f8fafc;">${formattedVal}</td>
                 <td style="border: 1.5px solid #1e3a8a; text-align: center; font-weight: bold; font-size: 11px; color: #1e3a8a;">${marks[0]}</td>
                 <td style="border: 1.5px solid #1e3a8a; text-align: center; font-weight: bold; font-size: 11px; color: #1e3a8a;">${marks[1]}</td>
                 <td style="border: 1.5px solid #1e3a8a; text-align: center; font-weight: bold; font-size: 11px; color: #1e3a8a;">${marks[2]}</td>
                 <td style="border: 1.5px solid #1e3a8a; text-align: center; font-weight: bold; font-size: 11px; color: #e11d48;">${marks[3]}</td>
               </tr>
             `;
         });
     } else {
         const key = item.key;
         const name = item.group;
         const maxVal = window.schemaMaxMap?.[key] || item.max || 10;
         const val = sc[key];
         const displayVal = (val !== undefined && val !== null && String(val).trim() !== "") ? Number(val) : null;
         
         const formattedMax = toKhNum(maxVal);
         const formattedVal = displayVal !== null ? toKhNum(displayVal) : "-";
         
         let marks = ['', '', '', ''];
         let valColor = "#1e3a8a"; 
         
         if (displayVal !== null) {
             const pct = (displayVal / maxVal) * 100;
             if (pct >= 80) marks[0] = '✔';
             else if (pct >= 65) marks[1] = '✔';
             else if (pct >= 50) marks[2] = '✔';
             else { marks[3] = '✔'; valColor = "#e11d48"; } 
         }

         rowsHtml += `
           <tr style="height: 19px;">
             <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 10.5px; font-weight: bold; font-family: 'Moul', serif;">${toKhNum(globalIndex++)}</td>
             <td colspan="2" style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-weight: bold; font-family: 'Moul', serif; font-size: 10.5px;">${name}</td>
             <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 10.5px; font-mono; color: #334155;">${formattedMax}</td>
             <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11px; font-mono; font-weight: bold; color: ${valColor}; background: #f8fafc;">${formattedVal}</td>
             <td style="border: 1.5px solid #1e3a8a; text-align: center; font-weight: bold; font-size: 11px; color: #1e3a8a;">${marks[0]}</td>
             <td style="border: 1.5px solid #1e3a8a; text-align: center; font-weight: bold; font-size: 11px; color: #1e3a8a;">${marks[1]}</td>
             <td style="border: 1.5px solid #1e3a8a; text-align: center; font-weight: bold; font-size: 11px; color: #1e3a8a;">${marks[2]}</td>
             <td style="border: 1.5px solid #1e3a8a; text-align: center; font-weight: bold; font-size: 11px; color: #e11d48;">${marks[3]}</td>
           </tr>
         `;
     }
  });

  const targetTotal = sc.total_score || stu.total_score;
  const targetAvg = sc.average || stu.average || stu.avg;
  const targetRank = sc.rank || stu.rank;
  const targetGrade = sc.grade_letter || stu.gradeLetter || "ល្អ";

  const totalScoreFormatted = (targetTotal !== undefined && targetTotal !== null && !isNaN(targetTotal)) ? toKhNum(Number(targetTotal).toFixed(2)) : "......";
  const avgFormatted = (targetAvg !== undefined && targetAvg !== null && !isNaN(targetAvg)) ? toKhNum(Number(targetAvg).toFixed(2)) : "......";
  const totalStus = window.rankingsDataList ? window.rankingsDataList.length : 0;
  const totalStusKhmer = totalStus > 0 ? toKhNum(totalStus) : "";
  const rankFormatted = (targetRank !== undefined && targetRank !== null && String(targetRank).trim() !== "" && targetRank !== "-") 
    ? (totalStusKhmer ? `${toKhNum(targetRank)} / ${totalStusKhmer}` : toKhNum(targetRank)) : "......";

  const rDates = window.reportCardDateSettings || {};
  const lunarDateStr = rDates.showLunar !== false ? rDates.lunarDate : "";
  const solarDateStr = window.getFormattedSolarDate ? window.getFormattedSolarDate() : "";

  return `
    <div class="report-booklet-page bg-white box-border text-slate-900 shadow-xl print:shadow-none" 
         style="width: 100%; height: 100%; padding: 6mm 10mm; border: 2.5px solid #1e3a8a; position: relative; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
       
         <div style="position: absolute; top: 3mm; left: 3mm; font-size: 12px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; top: 3mm; right: 3mm; font-size: 12px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; bottom: 3mm; left: 3mm; font-size: 12px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; bottom: 3mm; right: 3mm; font-size: 12px; font-weight: bold; color: #1e3a8a;">❖</div>

       <div style="text-align: center; margin-bottom: 1.5mm;">
         <h2 style="margin: 0; font-family: 'Moul', serif; font-size: 14px; color: #1e3a8a;">${headerTitle}</h2>
         <p style="margin: 1px 0 0 0; font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a;">លទ្ធផលនៃការសិក្សា</p>
       </div>

       <table style="width: 100%; border-collapse: collapse; border: 2px solid #1e3a8a; font-size: 10px; margin-bottom: 1.5mm;">
         <thead>${tableHeaderHtml}</thead>
         <tbody>${rowsHtml}</tbody>
       </table>

       <div style="font-size: 11px; line-height: 1.6; border-bottom: 1.5px dashed #94a3b8; padding-bottom: 2px; margin-bottom: 1.5mm;">
         <div>
           ពិន្ទុសរុបៈ <span style="font-weight: bold; font-family: monospace; font-size: 12px; color: #1e3a8a;">${totalScoreFormatted}</span>
           &nbsp;&nbsp;&nbsp;&nbsp;មធ្យមភាគៈ <span style="font-weight: bold; font-family: monospace; font-size: 12px; color: #1e3a8a;">${avgFormatted}</span>
           &nbsp;&nbsp;&nbsp;&nbsp;ចំណាត់ថ្នាក់ៈ <span style="font-weight: bold; font-family: monospace; font-size: 12px; color: #e11d48;">${rankFormatted}</span>
           &nbsp;&nbsp;&nbsp;&nbsp;និទ្ទេសៈ <span style="font-weight: bold; font-family: 'Moul', serif; font-size: 10.5px; color: #059669;">${targetGrade}</span>
         </div>
       </div>

       <div style="display: flex; justify-content: space-between; align-items: flex-start; text-align: center; margin-bottom: 1.5mm;">
         <div style="width: 44%;">
            <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: bold;">បានឃើញ និងឯកភាព</p>
            <p style="margin: 0 0 30px 0; font-family: 'Moul', serif; font-size: 11px; color: #1e3a8a;">នាយកសាលា</p>
            <p style="margin: 0; color: #1e3a8a; font-family: 'Moul', serif; font-size: 11.5px;">${principalName}</p>
         </div>
         <div style="width: 48%;">
            <p class="rc-lunar-date-lbl" style="margin: 0 0 2px 0; font-size: 10px; color: #1e293b; display: ${rDates.showLunar ? 'block' : 'none'};">${lunarDateStr}</p>
            <p class="rc-solar-date-lbl" style="margin: 0 0 2px 0; font-size: 10.5px; color: #1e293b;">${solarDateStr}</p>
            <p style="margin: 0 0 30px 0; font-family: 'Moul', serif; font-size: 11px; color: #1e3a8a;">គ្រូទទួលបន្ទុកថ្នាក់</p>
            <p style="margin: 0; color: #1e3a8a; font-family: 'Moul', serif; font-size: 11.5px;">${teacherName}</p>
         </div>
       </div>
    </div>
  `;
};

window.printReportCards = function() {
  const allStudents = window.rankingsDataList;
  if (!allStudents || allStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

  let printStudents = allStudents;
  if (window.selectedReportCardStudentId && window.selectedReportCardStudentId !== 'all') {
    printStudents = allStudents.filter(s => String(s.id).trim() === String(window.selectedReportCardStudentId).trim());
  }

  let fullHtml = "";
  printStudents.forEach(s => {
      fullHtml += `<div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">${window.generateMonthlySheetHTML(s, null)}</div>`;
  });

  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>បោះពុម្ពសៀវភៅតាមដានការសិក្សា</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        @page { size: A4 portrait; margin: 0mm !important; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { margin: 0 !important; padding: 0 !important; background: #fff; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; align-items: center; }
        .font-moul { font-family: 'Moul', serif !important; }
        .print-page-wrapper { page-break-after: always; break-after: page; margin: 0 auto; }
        @media print { .no-print { display: none !important; } }
      </style>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      ${fullHtml}
    </body>
    </html>
  `;

  const printWin = window.open('', '_blank', 'width=1050,height=900');
  printWin.document.open();
  printWin.document.write(printDocument);
  printWin.document.close();

  setTimeout(() => {
    printWin.focus();
    printWin.print();
  }, 800);
};



// =====================================================================
// 🔴 មុខងារសៀវភៅតាមដានការសិក្សា / ព្រឹត្តិបត្រពិន្ទុផ្លូវការ (A4 ពេញទំព័រ)
// =====================================================================

window.reportCardPrintType = 'monthly_sheet'; // 'monthly_sheet', 'cover_page', 'full_booklet'
window.selectedReportCardStudentId = 'all';  // 'all' ឬ id សិស្ស
window.selectedEducationLevel = 'auto';      // 'auto', 'primary', 'secondary'

window.reportCardDateSettings = {
  location: localStorage.getItem('rc_location') || "ភ្នំពេញ",
  solarDate: localStorage.getItem('rc_solar_date') || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....",
  lunarDate: localStorage.getItem('rc_lunar_date') || "ថ្ងៃ...................... ខែ........... ឆ្នាំ.......... .........ស័ក ព.ស. ២៥...",
  showLunar: localStorage.getItem('rc_show_lunar') !== 'false'
};

window.toKhmerNum = window.toKhmerNum || function(str) {
  if (str === null || str === undefined) return "";
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
};

// =====================================================================
// បញ្ជីមុខវិជ្ជាផ្លូវការតាមកម្រិតថ្នាក់
// =====================================================================

// ១. បឋមសិក្សា៖ មុខវិជ្ជាគោល ៧ និងមុខវិជ្ជារង (តាមរូបភាពគំរូជាក់ស្តែង)
window.PRIMARY_STRUCTURED_SUBJECTS = [
  {
    no: 1, name: "ភាសាខ្មែរ",
    subs: [
      { name: "សមត្ថភាពស្តាប់", key: "k_listen", max: 10, aliases: ["k_listen"] },
      { name: "សមត្ថភាពសរសេរ", key: "k_write", max: 10, aliases: ["k_write"] },
      { name: "សមត្ថភាពអាន", key: "k_read", max: 10, aliases: ["k_read"] },
      { name: "សមត្ថភាពនិយាយ", key: "k_compose", max: 10, aliases: ["k_compose", "k_speak"] }
    ]
  },
  {
    no: 2, name: "គណិតវិទ្យា",
    subs: [
      { name: "ចំនួន", key: "m_num", max: 10, aliases: ["m_num"] },
      { name: "រង្វាស់រង្វាល់", key: "m_measure", max: 10, aliases: ["m_measure", "m_meas"] },
      { name: "ធរណីមាត្រ", key: "m_geo", max: 10, aliases: ["m_geo"] },
      { name: "ពីជគណិត", key: "m_alg", max: 10, aliases: ["m_alg"] },
      { name: "ស្ថិតិ", key: "m_stat", max: 10, aliases: ["m_stat"] }
    ]
  },
  {
    no: 3, name: "វិទ្យាសាស្ត្រ",
    subs: [
      { name: "រូបវិទ្យា", key: "s_phy", max: 10, aliases: ["s_phy"] },
      { name: "គីមីវិទ្យា", key: "s_chem", max: 10, aliases: ["s_chem"] },
      { name: "ជីវវិទ្យា", key: "s_bio", max: 10, aliases: ["s_bio"] },
      { name: "ផែនដី-បរិស្ថានវិទ្យា", key: "s_earth", max: 10, aliases: ["s_earth"] }
    ]
  },
  {
    no: 4, name: "សិក្សាសង្គម",
    subs: [
      { name: "សីលធម៌-ពលរដ្ឋ", key: "ss_moral", max: 10, aliases: ["ss_moral"] },
      { name: "ភូមិវិទ្យា", key: "ss_geo", max: 10, aliases: ["ss_geo"] },
      { name: "ប្រវត្តិវិទ្យា", key: "ss_hist", max: 10, aliases: ["ss_hist"] },
      { name: "គេហវិទ្យា-អប់រំសិល្បៈ", key: "pe_art", max: 10, aliases: ["pe_art", "pe_art"] }
    ]
  },
  {
    no: 5, name: "អប់រំកាយ សុខភាព កីឡា",
    subs: [
      { name: "អប់រំកាយ-កីឡា", key: "pe_sport", max: 10, aliases: ["pe_sport"] },
      { name: "សុខភាព-អនាម័យ", key: "pe_health", max: 10, aliases: ["pe_health"] }
    ]
  },
  {
    no: 6, name: "អប់រំបំណិនជីវិត", key: "life_skill", max: 10,
    aliases: ["life_skill"],
    subs: []
  },
  {
    no: 7, name: "ភាសាបរទេស", key: "ls_lang", max: 10,
    aliases: ["ls_lang", "english", "ភាសាបរទេស", "អង់គ្លេស-បារាំង"],
    subs: []
  }
];

// ២. អនុវិទ្យាល័យ / វិទ្យាល័យ (Default បើពុំទាន់មានក្នុងបញ្ជីពិន្ទុ)
window.SECONDARY_DEFAULT_SUBJECTS = [
  { name: "ភាសាខ្មែរ", key: "khmer", max: 100, aliases: ["khmer", "k_read", "ភាសាខ្មែរ"] },
  { name: "សីលធម៌-ពលរដ្ឋវិជ្ជា", key: "moral", max: 50, aliases: ["moral", "ss_moral", "សីលធម៌"] },
  { name: "ប្រវត្តិវិទ្យា", key: "history", max: 50, aliases: ["history", "ss_hist", "ប្រវត្តិវិទ្យា"] },
  { name: "ភូមិវិទ្យា", key: "geography", max: 50, aliases: ["geography", "ss_geo", "ភូមិវិទ្យា"] },
  { name: "គណិតវិទ្យា", key: "math", max: 100, aliases: ["math", "m_num", "គណិតវិទ្យា"] },
  { name: "រូបវិទ្យា", key: "physics", max: 50, aliases: ["physics", "s_phy", "រូបវិទ្យា"] },
  { name: "គីមីវិទ្យា", key: "chemistry", max: 50, aliases: ["chemistry", "គីមីវិទ្យា"] },
  { name: "ជីវវិទ្យា", key: "biology", max: 50, aliases: ["biology", "ជីវវិទ្យា"] },
  { name: "ផែនដីវិទ្យា", key: "earth", max: 50, aliases: ["earth", "ផែនដីវិទ្យា"] },
  { name: "ភាសាបរទេស", key: "foreign_lang", max: 50, aliases: ["foreign_lang", "english", "ls_lang", "ភាសាបរទេស"] },
  { name: "បច្ចេកវិទ្យា", key: "tech", max: 50, aliases: ["tech", "ict", "បច្ចេកវិទ្យា"] },
  { name: "គេហវិទ្យា", key: "home_eco", max: 50, aliases: ["home_eco", "life_skill", "គេហវិទ្យា"] },
  { name: "អប់រំសិល្បៈ", key: "art", max: 50, aliases: ["art", "pe_art", "អប់រំសិល្បៈ"] },
  { name: "អប់រំកាយ", key: "sport", max: 50, aliases: ["sport", "pe_sport", "អប់រំកាយ"] }
];

window.CONDUCT_TEMPLATES = [
  "ស្លូតបូត សុភាពរាបសារ ខិតខំរៀនសូត្រ និងគោរពវិន័យសាលាបានល្អ",
  "មានវិន័យល្អ ឧស្សាហ៍ព្យាយាម ស្តាប់ដំបូន្មានលោកគ្រូអ្នកគ្រូ",
  "ឆ្លាតវៃ រហ័សរហួន ចូលរួមសកម្មភាពក្នុងថ្នាក់បានយ៉ាងសកម្ម",
  "ស្លូតបូត រួសរាយរាក់ទាក់ តែត្រូវបង្កើនការយកចិត្តទុកដាក់បន្ថែម",
  "ខិតខំរៀនសូត្រ តែត្រូវបង្កើនភាពក្លាហានក្នុងការឆ្លើយសំណួរ",
  "ត្រូវកែលម្អលើការគោរពវិន័យ និងការយកចិត្តទុកដាក់ក្នុងម៉ោងរៀន",
  "............................................................................................................"
];

// =====================================================================
// អនុគមន៍ទាញយកពិន្ទុតាមមុខវិជ្ជា (ស្វែងរកទាំងក្នុង Object និង DOM Inputs)
// =====================================================================
function getSubjectScore(stu, sub) {
  if (stu[sub.key] !== undefined && stu[sub.key] !== null && stu[sub.key] !== "") return parseFloat(stu[sub.key]);
  if (stu.scores && stu.scores[sub.key] !== undefined && stu.scores[sub.key] !== "") return parseFloat(stu.scores[sub.key]);
  
  // ឆែកមើលក្នុង window.currentScores
  if (window.currentScores) {
     const found = window.currentScores.find(item => String(item.student_id) === String(stu.id));
     if (found && found[sub.key] !== undefined && found[sub.key] !== "") return parseFloat(found[sub.key]);
  }

  if (sub.aliases) {
    for (let a of sub.aliases) {
      if (stu[a] !== undefined && stu[a] !== null && stu[a] !== "") return parseFloat(stu[a]);
      if (stu.scores && stu.scores[a] !== undefined && stu.scores[a] !== "") return parseFloat(stu.scores[a]);
      if (window.currentScores) {
         const found = window.currentScores.find(item => String(item.student_id) === String(stu.id));
         if (found && found[a] !== undefined && found[a] !== "") return parseFloat(found[a]);
      }
      let el = document.getElementById(`${a}_${stu.id}`);
      if (el && el.value !== "") return parseFloat(el.value);
    }
  }

  // ទាញផ្ទាល់ពី Input Field នៅលើ Screen ក្នុងករណីមានការកែប្រែថ្មីៗ
  let el = document.getElementById(`${sub.key}_${stu.id}`);
  if (el && el.value !== "") return parseFloat(el.value);

  return null;
}
function getGradeTick(score, max) {
  if (score === null || isNaN(score)) return { vg: "", g: "", m: "", w: "" };
  const pct = (score / max) * 100;
  return {
    vg: pct >= 80 ? "✔" : "",
    g: (pct >= 65 && pct < 80) ? "✔" : "",
    m: (pct >= 50 && pct < 65) ? "✔" : "",
    w: pct < 50 ? "✔" : ""
  };
}

function renderScoreCells(score, max) {
  const t = getGradeTick(score, max);
  const sStr = (score !== null && !isNaN(score)) ? window.toKhmerNum(score.toString()) : "";
  const b = "border: 1.5px solid #1e3a8a; text-align: center;";
  return `
    <td style="${b} font-size: 11px; font-mono; width: 10%; color: #334155;">${window.toKhmerNum(max.toString())}</td>
    <td style="${b} font-size: 11.5px; font-mono; font-weight: bold; width: 13%; color: #1e3a8a; background: #f8fafc;">${sStr}</td>
    <td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.vg}</td>
    <td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.g}</td>
    <td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.m}</td>
    <td style="${b} font-weight: bold; font-size: 12px; color: #e11d48; width: 8.5%;">${t.w}</td>
  `;
}

window.getEducationLevel = function(gradeStr) {
  if (window.selectedEducationLevel && window.selectedEducationLevel !== 'auto') {
    return window.selectedEducationLevel;
  }
  const str = String(gradeStr || "").toLowerCase();
  const numMatch = str.match(/([០-៩\d]+)/);
  if (numMatch) {
    let num = parseInt(numMatch[1].replace(/[០-៩]/g, d => "០១២៣៤៥៦៧៨៩".indexOf(d)), 10);
    if (num >= 1 && num <= 6) return 'primary';
    return 'secondary';
  }
  return str.includes("បឋម") ? 'primary' : 'secondary';
};

// =====================================================================
// ១. ផ្ទាំងបញ្ជាមេ (Tab Control Bar)
// =====================================================================
window.renderReportCardsTab = function() {
  const c = document.getElementById("scoreTabContent-reportcards");
  if (!c) return;
  
  if (!window.rankingsDataList || window.rankingsDataList.length === 0) {
      c.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-slate-500 font-bold p-16 bg-white rounded-3xl border border-slate-200 shadow-sm font-siemreap">
            <div class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-inner">
              <i class="fa-solid fa-book-open"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-700 font-moul mb-2">មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់</h3>
            <p class="text-sm text-slate-400">សូមបញ្ចូលពិន្ទុ និងចុច «គណនាចំណាត់ថ្នាក់» ជាមុនសិន ដើម្បីបង្កើតសៀវភៅតាមដានការសិក្សា។</p>
        </div>
      `;
      return;
  }

  const students = window.rankingsDataList;
  const sOptions = students.map((s, idx) => `
    <option value="${s.id}" ${window.selectedReportCardStudentId === String(s.id) ? 'selected' : ''}>
      ល.រ ${idx + 1} ៖ ${s.name} (${s.gender || 'ប្រុស'})
    </option>
  `).join('');

  c.innerHTML = `
    <div class="flex flex-col h-full bg-slate-100 p-3 md:p-5 rounded-3xl border border-slate-200 min-h-[750px] font-siemreap">
      
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-5 no-print flex flex-col gap-3.5">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div class="flex flex-wrap items-center gap-2.5">
            <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
              <i class="fa-solid fa-file-invoice text-indigo-500 text-xs"></i>
              <span class="text-xs font-bold text-slate-600">ទម្រង់៖</span>
              <select onchange="window.changeReportCardViewMode(this.value)" class="bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer">
                <option value="monthly_sheet" ${window.reportCardPrintType==='monthly_sheet'?'selected':''}>📄 ទំព័រលទ្ធផលប្រចាំខែ (A4)</option>
                <option value="cover_page" ${window.reportCardPrintType==='cover_page'?'selected':''}>📘 ក្របមុខ និងព័ត៌មាន (Cover)</option>
                <option value="full_booklet" ${window.reportCardPrintType==='full_booklet'?'selected':''}>📚 សៀវភៅតាមដានពេញ (Booklet)</option>
              </select>
            </div>

            <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
              <i class="fa-solid fa-graduation-cap text-purple-600 text-xs"></i>
              <span class="text-xs font-bold text-slate-600">កម្រិត៖</span>
              <select onchange="window.changeEducationLevel(this.value)" class="bg-transparent text-xs font-bold text-purple-800 outline-none cursor-pointer">
                <option value="auto" ${window.selectedEducationLevel==='auto'?'selected':''}>🔄 ស្វ័យប្រវត្តិ (តាមថ្នាក់)</option>
                <option value="primary" ${window.selectedEducationLevel==='primary'?'selected':''}>🏫 បឋមសិក្សា (គោល & រង)</option>
                <option value="secondary" ${window.selectedEducationLevel==='secondary'?'selected':''}>🏛️ អនុវិទ្យាល័យ / វិទ្យាល័យ</option>
              </select>
            </div>

            <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
              <i class="fa-solid fa-users text-emerald-600 text-xs"></i>
              <span class="text-xs font-bold text-slate-600">សិស្ស៖</span>
              <select onchange="window.filterReportCardStudent(this.value)" class="bg-transparent text-xs font-bold text-emerald-800 outline-none cursor-pointer max-w-[200px]">
                <option value="all" ${window.selectedReportCardStudentId==='all'?'selected':''}>👥 សិស្សទាំងអស់ (${students.length} នាក់)</option>
                ${sOptions}
              </select>
            </div>

            <button onclick="window.toggleDateSettingsPanel()" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-calendar-days text-amber-600"></i> កាលបរិច្ឆេទ
            </button>
          </div>

          <button onclick="window.printReportCards()" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-200 transition flex items-center gap-2 transform hover:-translate-y-0.5">
            <i class="fa-solid fa-print text-sm"></i> បោះពុម្ព (${window.selectedReportCardStudentId==='all' ? students.length + ' នាក់' : '១ នាក់'})
          </button>
        </div>

        <div id="rcDateSettingsPanel" class="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-3 text-xs">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-slate-600">ធ្វើនៅ៖</span>
              <input type="text" id="rcLocationInput" value="${window.reportCardDateSettings.location}" 
                     oninput="window.updateDateSetting('location', this.value)" 
                     class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 w-24 bg-white outline-none">
            </div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-slate-600">សូរិយគតិ៖</span>
              <input type="text" id="rcSolarInput" value="${window.reportCardDateSettings.solarDate}" 
                     oninput="window.updateDateSetting('solarDate', this.value)" 
                     class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 w-52 bg-white outline-none">
              <button onclick="window.setTodaySolarDate()" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-indigo-600">ថ្ងៃនេះ</button>
              <button onclick="window.setDotsSolarDate()" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-600">ចុចៗ</button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <label class="inline-flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
              <input type="checkbox" id="rcShowLunarCheck" ${window.reportCardDateSettings.showLunar?'checked':''} 
                     onchange="window.updateDateSetting('showLunar', this.checked)" class="rounded text-indigo-600">
              <span>ចន្ទគតិ៖</span>
            </label>
            <input type="text" id="rcLunarInput" value="${window.reportCardDateSettings.lunarDate}" 
                   oninput="window.updateDateSetting('lunarDate', this.value)" 
                   class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 w-64 bg-white outline-none ${!window.reportCardDateSettings.showLunar?'opacity-50 pointer-events-none':''}">
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 text-xs bg-indigo-50/50 p-2.5 px-3 rounded-xl border border-indigo-100">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-award text-indigo-600"></i>
            <span class="font-bold text-indigo-900">អនុវត្តគំរូវិន័យសីលធម៌ដល់សិស្សទាំងអស់៖</span>
          </div>
          <select onchange="window.applyConductToAll(this.value)" class="bg-white border border-indigo-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[340px]">
            <option value="" disabled selected>-- ជ្រើសរើសដើម្បីដាក់សិស្សទាំងអស់ --</option>
            ${window.CONDUCT_TEMPLATES.map((tpl, i) => `<option value="${tpl}">${i + 1}.${tpl.length > 35 ? tpl.substring(0, 35) + '...' : tpl}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center gap-8 py-2" id="reportCardsPreviewArea">
         ${window.renderReportCardPreview()}
      </div>

    </div>
  `;
};

// Handlers
window.changeReportCardViewMode = function(mode) { window.reportCardPrintType = mode; window.refreshRcPreview(); };
window.changeEducationLevel = function(lvl) { window.selectedEducationLevel = lvl; window.refreshRcPreview(); };
window.filterReportCardStudent = function(id) { window.selectedReportCardStudentId = id; window.refreshRcPreview(); };
window.refreshRcPreview = function() {
  const el = document.getElementById("reportCardsPreviewArea");
  if (el) el.innerHTML = window.renderReportCardPreview();
};
window.toggleDateSettingsPanel = function() { document.getElementById("rcDateSettingsPanel")?.classList.toggle("hidden"); };
window.updateDateSetting = function(k, v) {
  window.reportCardDateSettings[k] = v;
  try { localStorage.setItem(`rc_${k}`, v); } catch(e) {}
  document.querySelectorAll(".rc-solar-date-lbl").forEach(el => el.textContent = window.getFormattedSolarDate());
  document.querySelectorAll(".rc-lunar-date-lbl").forEach(el => {
    el.textContent = window.reportCardDateSettings.showLunar ? window.reportCardDateSettings.lunarDate : "";
    el.style.display = window.reportCardDateSettings.showLunar ? "block" : "none";
  });
};
window.getFormattedSolarDate = function() {
  const loc = window.reportCardDateSettings.location ? `${window.reportCardDateSettings.location} ` : "";
  return `${loc}${window.reportCardDateSettings.solarDate}`;
};
window.setTodaySolarDate = function() {
  const now = new Date();
  const d = window.toKhmerNum(now.getDate().toString());
  const m = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"][now.getMonth()];
  const y = window.toKhmerNum(now.getFullYear().toString());
  const formatted = `ថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;
  const inp = document.getElementById("rcSolarInput");
  if (inp) inp.value = formatted;
  window.updateDateSetting('solarDate', formatted);
};
window.setDotsSolarDate = function() {
  const formatted = "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....";
  const inp = document.getElementById("rcSolarInput");
  if (inp) inp.value = formatted;
  window.updateDateSetting('solarDate', formatted);
};
window.selectConductTemplate = function(studentId, text) {
  const displayEl = document.getElementById(`conduct_display_${studentId}`);
  if (displayEl) displayEl.innerText = text;
  try { localStorage.setItem(`conduct_${studentId}`, text); } catch(e) {}
  if (window.rankingsDataList) {
    const s = window.rankingsDataList.find(item => String(item.id).trim() === String(studentId).trim());
    if (s) s.conduct = text;
  }
};
window.applyConductToAll = function(selectedTemplate) {
  if (!selectedTemplate) return;
  (window.rankingsDataList || []).forEach(s => {
    window.selectConductTemplate(s.id, selectedTemplate);
    const selEl = document.getElementById(`conduct_select_${s.id}`);
    if (selEl) selEl.value = selectedTemplate;
  });
  if (typeof showToast === 'function') showToast("✅ បានអនុវត្តគំរូវិន័យសីលធម៌ដល់សិស្សទាំងអស់!");
};

// =====================================================================
// ២. បង្ហាញសន្លឹក Preview ទាំងអស់
// =====================================================================
window.renderReportCardPreview = function() {
  if (!window.rankingsDataList || window.rankingsDataList.length === 0) {
    return '<div class="p-12 text-slate-400 font-bold bg-white rounded-2xl shadow-sm">គ្មានទិន្នន័យសិស្ស</div>';
  }

  const allStudents = window.rankingsDataList;
  let target = allStudents;
  if (window.selectedReportCardStudentId && window.selectedReportCardStudentId !== 'all') {
    target = allStudents.filter(s => String(s.id).trim() === String(window.selectedReportCardStudentId).trim());
  }

  return target.map((s, idx) => {
    let sheetHtml = "";
    if (window.reportCardPrintType === 'cover_page') {
      sheetHtml = window.generateCoverAndProfileHTML(s);
    } else if (window.reportCardPrintType === 'full_booklet') {
      sheetHtml = window.generateCoverAndProfileHTML(s) + `
        <div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">
          ${window.generateMonthlySheetHTML(s, null)}
        </div>
      `;
    } else {
      sheetHtml = `
        <div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">
          ${window.generateMonthlySheetHTML(s, null)}
        </div>
      `;
    }

    return `
      <div class="no-print w-full max-w-[210mm] flex items-center justify-between bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-xs text-xs font-siemreap">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-mono">${idx + 1}</span>
          <span class="font-bold text-slate-800 font-moul text-[13px]">${s.name}</span>
          <span class="text-slate-400">|</span>
          <span class="text-slate-500 font-mono">អត្តលេខ៖ <b>${s.id}</b></span>
          <span class="text-slate-400">|</span>
          <span class="text-slate-500">ភេទ៖ <b>${s.gender || 'ប្រុស'}</b></span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-indigo-600 font-bold">មធ្យមភាគ៖ <b class="font-mono text-sm">${s.avg != null ? window.toKhmerNum(Number(s.avg).toFixed(2)) : '-'}</b></span>
          <span class="text-rose-600 font-bold">ចំណាត់ថ្នាក់៖ <b class="font-mono text-sm">${s.rank != null ? window.toKhmerNum(s.rank.toString()) : '-'}</b></span>
        </div>
      </div>
      <div class="preview-page-container bg-white shadow-xl rounded-sm mb-6 print:shadow-none print:m-0">
        ${sheetHtml}
      </div>
    `;
  }).join("");
};

// =====================================================================
// ៣. ទំព័រលទ្ធផលសិក្សាប្រចាំខែ (គាំទ្រមុខវិជ្ជាគោល & រង សម្រាប់បឋម)
// =====================================================================
window.generateMonthlySheetHTML = function(stu, periodOverride = null) {
  const levelStr = document.getElementById("globalLevelSelect")?.value || stu.grade || "ថ្នាក់ទី ២";
  const month = periodOverride || document.getElementById("globalPeriodValue")?.value || document.getElementById("attMonthSelect")?.value || "មករា";
  const type = document.getElementById("globalPeriodType")?.value || "monthly";

  let headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំខែ ${month}`;
  if (type === "semester") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំ ${month}`;
  else if (type === "annual") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំឆ្នាំសិក្សា ២០...-២០...`;

  const isPrimary = window.getEducationLevel(levelStr) === 'primary';

  let tableHeaderHtml = "";
  let rowsHtml = "";
  let calculatedSum = 0;

  // ក. តារាងកម្រិតបឋមសិក្សា (មានមុខវិជ្ជាគោល និងមុខវិជ្ជារង ដូចរូបភាពជាក់ស្តែង)
  if (isPrimary) {
    tableHeaderHtml = `
      <tr style="background-color: #f8fafc; color: #1e3a8a; height: 28px;">
         <th rowspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 5%; font-family: 'Moul', serif; font-size: 10.5px;">ល.រ</th>
         <th colspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 38%; font-family: 'Moul', serif; font-size: 10.5px;">មុខវិជ្ជា</th>
         <th colspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 23%; font-family: 'Moul', serif; font-size: 10.5px;">ពិន្ទុ</th>
         <th colspan="4" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 34%; font-family: 'Moul', serif; font-size: 10.5px;">និទ្ទេស</th>
      </tr>
      <tr style="background-color: #f8fafc; font-size: 9.5px; height: 22px;">
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 20%;">មុខវិជ្ជាគោល</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 18%;">មុខវិជ្ជារង</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 10%;">អតិបរមា</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 13%; color: #1e3a8a;">ពិន្ទុខែ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អបង្គួរ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">មធ្យម</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%; color: #e11d48;">ខ្សោយ</th>
      </tr>
    `;

    window.PRIMARY_STRUCTURED_SUBJECTS.forEach(mainSub => {
      if (mainSub.subs && mainSub.subs.length > 0) {
        const span = mainSub.subs.length;
        mainSub.subs.forEach((sub, sIdx) => {
          const sc = getSubjectScore(stu, sub);
          if (sc !== null && !isNaN(sc)) calculatedSum += sc;

          const firstCells = sIdx === 0 ? `
            <td rowspan="${span}" style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11px; font-weight: bold; width: 5%;">${window.toKhmerNum(mainSub.no.toString())}</td>
            <td rowspan="${span}" style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 11px; width: 20%; background: #fbfcfe;">${mainSub.name}</td>
          ` : "";

          rowsHtml += `
            <tr style="height: 19px;">
              ${firstCells}
              <td style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-size: 10px; width: 18%; font-family: 'Siemreap', sans-serif;">${sub.name}</td>
              ${renderScoreCells(sc, sub.max)}
            </tr>
          `;
        });
      } else {
        const sc = getSubjectScore(stu, mainSub);
        if (sc !== null && !isNaN(sc)) calculatedSum += sc;
        rowsHtml += `
          <tr style="height: 20px;">
            <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11px; font-weight: bold; width: 5%;">${window.toKhmerNum(mainSub.no.toString())}</td>
            <td colspan="2" style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 11px; width: 38%;">${mainSub.name}</td>
            ${renderScoreCells(sc, mainSub.max)}
          </tr>
        `;
      }
    });

  } else {
    // ខ. តារាងអនុវិទ្យាល័យ និងវិទ្យាល័យ (ទាញយកពីបញ្ជីពិន្ទុ ឬ Default)
    tableHeaderHtml = `
      <tr style="background-color: #f8fafc; color: #1e3a8a; height: 30px;">
         <th rowspan="2" style="border: 1.5px solid #1e3a8a; padding: 4px; width: 6%; font-family: 'Moul', serif; font-size: 11px;">ល.រ</th>
         <th rowspan="2" style="border: 1.5px solid #1e3a8a; padding: 4px; width: 34%; font-family: 'Moul', serif; font-size: 11px;">មុខវិជ្ជា</th>
         <th colspan="2" style="border: 1.5px solid #1e3a8a; padding: 4px; width: 26%; font-family: 'Moul', serif; font-size: 11px;">ពិន្ទុ</th>
         <th colspan="4" style="border: 1.5px solid #1e3a8a; padding: 4px; width: 34%; font-family: 'Moul', serif; font-size: 11px;">និទ្ទេស</th>
      </tr>
      <tr style="background-color: #f8fafc; font-size: 10.5px; height: 25px;">
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 12%;">អតិបរមា</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 14%; color: #1e3a8a;">ពិន្ទុខែ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អបង្គួរ</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">មធ្យម</th>
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%; color: #e11d48;">ខ្សោយ</th>
      </tr>
    `;

    const subList = (window.subjectList && window.subjectList.length > 0) ? window.subjectList : window.SECONDARY_DEFAULT_SUBJECTS;
    subList.forEach((sub, idx) => {
      const maxScore = sub.max || 50;
      const sc = getSubjectScore(stu, sub);
      if (sc !== null && !isNaN(sc)) calculatedSum += sc;

      rowsHtml += `
        <tr style="height: 24px;">
          <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11.5px; font-weight: bold; width: 6%;">${window.toKhmerNum((idx + 1).toString())}</td>
          <td style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 8px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 12px; width: 34%;">${sub.name}</td>
          ${renderScoreCells(sc, maxScore)}
        </tr>
      `;
    });
  }

  // អវត្តមាន
  let permCount = 0, unexCount = 0;
  if (typeof window.getStudentAttendance === "function") {
    const att = window.getStudentAttendance(stu.id, month);
    if (att && att.hasData) { permCount = att.permission; unexCount = att.unexcused; }
  } else if (stu.permission !== undefined || stu.unexcused !== undefined) {
    permCount = parseInt(stu.permission || 0) || 0;
    unexCount = parseInt(stu.unexcused || 0) || 0;
  }

  const rawTotal = stu.totalScore || stu.total || stu.total_score || (calculatedSum > 0 ? calculatedSum : null);
  const totalScoreFormatted = rawTotal != null ? window.toKhmerNum(Number(rawTotal).toFixed(0)) : "......";
  const avgFormatted = (stu.avg !== undefined && stu.avg !== null && !isNaN(stu.avg)) ? window.toKhmerNum(Number(stu.avg).toFixed(2)) : "......";
  const totalStusKhmer = window.rankingsDataList?.length ? window.toKhmerNum(window.rankingsDataList.length.toString()) : "";
  const rankFormatted = (stu.rank !== undefined && stu.rank !== null && String(stu.rank).trim() !== "")
    ? (totalStusKhmer ? `${window.toKhmerNum(stu.rank.toString())} / ${totalStusKhmer}` : window.toKhmerNum(stu.rank.toString())) : "......";

  const gradeLetterFormatted = stu.gradeLetter || stu.mention || "ល្អ";
  const savedConduct = localStorage.getItem(`conduct_${stu.id}`) || stu.conduct || window.globalDefaultConduct || window.CONDUCT_TEMPLATES[0];
  const solarDateStr = window.getFormattedSolarDate();
  const lunarDateStr = window.reportCardDateSettings.showLunar ? window.reportCardDateSettings.lunarDate : "";

  return `
    <div class="report-booklet-page bg-white box-border text-slate-900 shadow-xl print:shadow-none" 
         style="width: 100%; height: 100%; padding: 8mm 12mm; border: 2.5px solid #1e3a8a; position: relative; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
       
       <div style="position: absolute; top: 3.5mm; left: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; top: 3.5mm; right: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; bottom: 3.5mm; left: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; bottom: 3.5mm; right: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>

       <div style="text-align: center; margin-bottom: 2mm;">
         <h2 style="margin: 0; font-family: 'Moul', serif; font-size: 15px; color: #1e3a8a;">${headerTitle}</h2>
         <p style="margin: 1px 0 0 0; font-family: 'Moul', serif; font-size: 12.5px; color: #1e3a8a;">លទ្ធផលនៃការសិក្សា</p>
       </div>

       <table style="width: 100%; border-collapse: collapse; border: 2px solid #1e3a8a; font-size: 12px; margin-bottom: 3mm;">
         <thead>${tableHeaderHtml}</thead>
         <tbody>${rowsHtml}</tbody>
       </table>

       <div style="font-size: 12px; line-height: 1.8; border-bottom: 1.5px dashed #94a3b8; padding-bottom: 3px; margin-bottom: 2mm;">
         <div>
           ពិន្ទុសរុបៈ <span style="font-weight: bold; font-family: monospace; font-size: 13px; color: #1e3a8a;">${totalScoreFormatted}</span>
           &nbsp;&nbsp;&nbsp;&nbsp;មធ្យមភាគៈ <span style="font-weight: bold; font-family: monospace; font-size: 13px; color: #1e3a8a;">${avgFormatted}</span>
           &nbsp;&nbsp;&nbsp;&nbsp;ចំណាត់ថ្នាក់ៈ <span style="font-weight: bold; font-family: monospace; font-size: 13px; color: #e11d48;">${rankFormatted}</span>
           &nbsp;&nbsp;&nbsp;&nbsp;និទ្ទេសៈ <span style="font-weight: bold; font-family: 'Moul', serif; font-size: 11px; color: #059669;">${gradeLetterFormatted}</span>
         </div>
         <div>
           អវត្តមានៈ មានច្បាប់ <span contenteditable="true" style="font-weight: bold; font-family: monospace; font-size: 12.5px; color: #1e3a8a; border-bottom: 1px dotted #94a3b8; padding: 0 4px;">${window.toKhmerNum(permCount.toString())}</span> ដង
           &nbsp;&nbsp;&nbsp;&nbsp;ឥតច្បាប់ <span contenteditable="true" style="font-weight: bold; font-family: monospace; font-size: 12.5px; color: #e11d48; border-bottom: 1px dotted #94a3b8; padding: 0 4px;">${window.toKhmerNum(unexCount.toString())}</span> ដង
         </div>
         <div style="margin-top: 1px; display: flex; align-items: center; flex-wrap: wrap;">
           <span style="font-weight: bold; color: #1e293b;">វិន័យសីលធម៌ៈ&nbsp;</span>
           <span id="conduct_display_${stu.id}" contenteditable="true" 
                 oninput="localStorage.setItem('conduct_${stu.id}', this.innerText)"
                 style="font-weight: bold; color: #1e3a8a; border-bottom: 1px dotted #94a3b8; padding: 0 4px; outline: none;">
             ${savedConduct}
           </span>
           <select id="conduct_select_${stu.id}" onchange="window.selectConductTemplate('${stu.id}', this.value)" class="no-print" 
                   style="margin-left: 8px; font-size: 10.5px; padding: 1px 5px; border: 1px solid #cbd5e1; border-radius: 5px; background: #f8fafc; color: #334155;">
             <option value="" disabled>-- ជ្រើសរើសគំរូ --</option>
             ${window.CONDUCT_TEMPLATES.map((tpl, i) => `<option value="${tpl}" ${tpl === savedConduct ? 'selected' : ''}>${i + 1}.${tpl.length > 30 ? tpl.substring(0, 30) + '...' : tpl}</option>`).join('')}
           </select>
         </div>
       </div>

       <div style="display: flex; justify-content: space-between; align-items: flex-start; text-align: center; margin-bottom: 2mm;">
         <div style="width: 40%;">
            <p style="margin: 0 0 3px 0; font-size: 11.5px; font-weight: bold;">បានឃើញ និងឯកភាព</p>
            <p style="margin: 0 0 40px 0; font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a;">នាយកសាលា</p>
            <p style="margin: 0; color: #64748b;">................................................</p>
         </div>
         <div style="width: 50%;">
            <p class="rc-lunar-date-lbl" style="margin: 0 0 2px 0; font-size: 10.5px; color: #1e293b; display: ${window.reportCardDateSettings.showLunar ? 'block' : 'none'};">
              ${lunarDateStr}
            </p>
            <p class="rc-solar-date-lbl" style="margin: 0 0 3px 0; font-size: 11px; color: #1e293b;">${solarDateStr}</p>
            <p style="margin: 0 0 40px 0; font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a;">មូលវិចារគ្រូទទួលបន្ទុកថ្នាក់</p>
            <p style="margin: 0; color: #64748b;">................................................</p>
         </div>
       </div>

       <div style="border-top: 1.5px dashed #94a3b8; padding-top: 3mm;">
         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
           <p style="margin: 0; font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a;">មតិរបស់មាតាបិតា - អាណាព្យាបាលសិស្ស</p>
           <p style="margin: 0; font-size: 10.5px; color: #64748b;">ហត្ថលេខា ឬស្នាមមេដៃ</p>
         </div>
         <div style="line-height: 1.9; font-size: 11.5px; color: #94a3b8; letter-spacing: 1px;">
           <div>......................................................................................................................................................</div>
           <div>......................................................................................................................................................។</div>
         </div>
       </div>

    </div>
  `;
};

// =====================================================================
// ៥. ទំព័រក្រប និងព័ត៌មានសិស្ស (A4 ទំនើប និងទាន់សម័យ - Modern Luxury & Digital Edition)
// =====================================================================
window.generateCoverAndProfileHTML = function(stu) {
  let fullStu = { ...stu };
  try {
    const allStus = JSON.parse(localStorage.getItem('academic_students')) || window.allStudents || [];
    const found = allStus.find(s => String(s.id).trim() === String(stu.id).trim());
    if (found) fullStu = { ...found, ...stu };
  } catch(e) {}

  const levelStr = document.getElementById("globalLevelSelect")?.value || fullStu.grade || "ថ្នាក់ទី ៧";
  const room = document.getElementById("globalRoomSelect")?.value || fullStu.room || "«ខ»";
  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ដីឥដ្ឋ";
  const clusterName = sInfo.cluster || sInfo.school_cluster || "កម្រងដីឥដ្ឋ";
  const schoolPhone = sInfo.phone || sInfo.school_phone || "០១២ ៣៤៥ ៦៧៨";
  const academicYear = sInfo.academic_year || "2026-2027";

  const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
  let birthDay = "", birthMonth = "", birthYear = "";
  const rawDob = fullStu.dob || "";
  
  if (rawDob && (rawDob.includes("-") || rawDob.includes("/"))) {
    const parts = rawDob.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        birthYear = window.toKhmerNum(parts[0]);
        const mIdx = parseInt(parts[1], 10) - 1;
        birthMonth = (mIdx >= 0 && mIdx < 12) ? khmerMonths[mIdx] : window.toKhmerNum(parts[1]);
        birthDay = window.toKhmerNum(parseInt(parts[2], 10).toString());
      } else {
        birthDay = window.toKhmerNum(parseInt(parts[0], 10).toString());
        const mIdx = parseInt(parts[1], 10) - 1;
        birthMonth = (mIdx >= 0 && mIdx < 12) ? khmerMonths[mIdx] : window.toKhmerNum(parts[1]);
        birthYear = window.toKhmerNum(parts[2]);
      }
    }
  } else if (rawDob) {
    birthDay = window.toKhmerNum(rawDob);
  }

  let fullDobKhmer = "";
  if (birthDay && birthMonth && birthYear) {
    fullDobKhmer = `ថ្ងៃទី ${birthDay} ខែ ${birthMonth} ឆ្នាំ ${birthYear}`;
  } else if (birthDay) {
    fullDobKhmer = birthDay;
  }

  const renderField = (val, defaultDots = "....................................................") => {
    if (val && String(val).trim() !== "" && !String(val).includes("...")) {
      return `<span contenteditable="true" style="font-weight: bold; color: #1e3a8a; font-family: 'Siemreap', sans-serif;">${String(val).trim()}</span>`;
    }
    return `<span contenteditable="true" style="color: #94a3b8; letter-spacing: 1px;">${defaultDots}</span>`;
  };

  const photoSrc = fullStu.photo_url || fullStu.photo || "";

  return `
    <!-- ============================================================== -->
    <!-- ទំព័រទី ១៖ ក្របមុខសៀវភៅតាមដាន (Modern Geometric Cover Page) -->
    <!-- ============================================================== -->
    <div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 8mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">
      <div class="report-booklet-page bg-white box-border text-slate-900 shadow-xl print:shadow-none" 
           style="width: 100%; height: 100%; padding: 12mm 14mm; border: 2.5px solid #1e3a8a; position: relative; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; background: radial-gradient(circle at 50% 15%, rgba(241, 245, 249, 0.6) 0%, #ffffff 70%);">
         
         <!-- ស៊ុមតុបតែងប្រណិតបែបទំនើប (Double Modern Accent Borders) -->
         <div style="position: absolute; top: 2.5mm; bottom: 2.5mm; left: 2.5mm; right: 2.5mm; border: 1px solid #93c5fd; pointer-events: none; border-radius: 4px;"></div>
         <div style="position: absolute; top: 4mm; bottom: 4mm; left: 4mm; right: 4mm; border: 0.5px dashed #cbd5e1; pointer-events: none;"></div>

         <!-- ក្បាច់កែងទំនើប (Geometric Corner Accents) -->
         <div style="position: absolute; top: 5.5mm; left: 5.5mm; width: 15px; height: 15px; border-top: 2.5px solid #d97706; border-left: 2.5px solid #d97706;"></div>
         <div style="position: absolute; top: 5.5mm; right: 5.5mm; width: 15px; height: 15px; border-top: 2.5px solid #d97706; border-right: 2.5px solid #d97706;"></div>
         <div style="position: absolute; bottom: 5.5mm; left: 5.5mm; width: 15px; height: 15px; border-bottom: 2.5px solid #d97706; border-left: 2.5px solid #d97706;"></div>
         <div style="position: absolute; bottom: 5.5mm; right: 5.5mm; width: 15px; height: 15px; border-bottom: 2.5px solid #d97706; border-right: 2.5px solid #d97706;"></div>

         <!-- ក្បាលទំព័រជាតិ និងក្រសួង -->
         <div style="text-align: center; margin-top: 3mm;">
            <h2 style="margin: 0; font-family: 'Moul', serif; font-size: 15.5px; color: #1e3a8a; letter-spacing: 0.5px;">ព្រះរាជាណាចក្រកម្ពុជា</h2>
            <h3 style="margin: 3px 0 0 0; font-family: 'Moul', serif; font-size: 13px; color: #1e3a8a; letter-spacing: 0.5px;">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
            
            <!-- ខ្សែបន្ទាត់ក្បាច់ទំនើប -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
               <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
               <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
               <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
            </div>

            <div style="margin-top: 4mm;">
               <p style="margin: 0; font-family: 'Moul', serif; font-size: 13.5px; color: #334155;">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
               <h1 contenteditable="true" style="margin: 4px 0 0 0; font-family: 'Moul', serif; font-size: 20px; color: #1e3a8a; text-shadow: 0 1px 2px rgba(30,58,138,0.1);">${schoolName}</h1>
               <div style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 2px 14px; border-radius: 20px; border: 1px solid #e2e8f0; margin-top: 5px;">
                  <span style="font-size: 11px; color: #475569; font-weight: bold;">កម្រងសាលា ៖ ${clusterName || 'ទូទៅ'}</span>
                  <span style="color: #cbd5e1;">|</span>
                  <span style="font-size: 11px; color: #475569; font-weight: bold;">ទូរសព្ទ ៖ <span style="font-family: monospace;">${schoolPhone || '.....................'}</span></span>
               </div>
            </div>
         </div>

         <!-- និមិត្តសញ្ញាអប់រំផ្លូវការ (High-Resolution Vector Emblem) -->
         <div style="display: flex; justify-content: center; margin: 2mm 0;">
            <div style="position: relative; width: 78px; height: 78px;">
               <svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="47" stroke="#1e3a8a" stroke-width="2.5" fill="#f8fafc"/>
                  <circle cx="50" cy="50" r="42" stroke="#d97706" stroke-width="1.2" stroke-dasharray="3 2"/>
                  <!-- កាំរស្មីពន្លឺនៃចំណេះដឹង -->
                  <path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
                  <!-- សៀវភៅបើក -->
                  <path d="M50 63C41 57 30 58 22 60V36C30 34 41 34 50 39C59 34 70 34 78 36V60C70 58 59 57 50 63Z" fill="#1e3a8a"/>
                  <path d="M50 39V63" stroke="#ffffff" stroke-width="1.8"/>
                  <!-- ភ្លើងគប់/ប៊ិច នៃការសិក្សា -->
                  <path d="M48 23H52V35H48V23Z" fill="#f59e0b"/>
                  <path d="M50 16C46 19.5 46 22 50 24C54 22 54 19.5 50 16Z" fill="#ef4444"/>
                  <circle cx="50" cy="50" r="3.5" fill="#ffffff"/>
               </svg>
            </div>
         </div>

         <!-- បដាចំណងជើងធំ (Modern Royal Gradient Banner) -->
         <div style="text-align: center; margin: 2mm 0;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #2563eb 100%); padding: 9px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2); display: inline-block; min-width: 78%; border: 1.5px solid #fbbf24;">
               <h1 style="margin: 0; font-family: 'Moul', serif; font-size: 23px; color: #ffffff; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  សៀវភៅតាមដានការសិក្សា
               </h1>
               <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: bold; color: #fef08a; letter-spacing: 2px; text-transform: uppercase;">
                  Student Academic Progress Record
               </p>
            </div>
         </div>

         <!-- កាតបង្ហាញព័ត៌មានសិស្សបែបទំនើប (Student Showcase Card) -->
         <div style="margin: 2mm auto; width: 88%; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 14px 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 10px;">
               <div style="display: flex; align-items: baseline; gap: 8px;">
                  <span style="font-size: 13px; font-weight: bold; color: #64748b;">សិស្សឈ្មោះ ៖</span>
                  <span style="font-family: 'Moul', serif; font-size: 17px; color: #1e3a8a;">${fullStu.name}</span>
               </div>
               <div style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  ភេទ ៖ ${fullStu.gender || 'ប្រុស'}
               </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12.5px; text-align: center;">
               <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 6px; border-radius: 10px;">
                  <div style="font-size: 10.5px; color: #64748b; font-weight: bold; margin-bottom: 2px;">អត្តលេខសិស្ស</div>
                  <div style="font-family: monospace; font-weight: bold; font-size: 15px; color: #0f172a;">${window.toKhmerNum(fullStu.id || '........')}</div>
               </div>

               <div style="background: #fdf2f8; border: 1px solid #fbcfe8; padding: 8px 6px; border-radius: 10px;">
                  <div style="font-size: 10.5px; color: #db2777; font-weight: bold; margin-bottom: 2px;">ថ្នាក់រៀន</div>
                  <div style="font-family: 'Moul', serif; font-size: 13.5px; color: #be123c;">${levelStr.replace('ថ្នាក់ទី ', '')} ${room}</div>
               </div>

               <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 6px; border-radius: 10px;">
                  <div style="font-size: 10.5px; color: #16a34a; font-weight: bold; margin-bottom: 2px;">ឆ្នាំសិក្សា</div>
                  <div style="font-family: monospace; font-weight: bold; font-size: 14.5px; color: #15803d;">${window.toKhmerNum(academicYear)}</div>
               </div>
            </div>

            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: #64748b;">
               <span>ប្រព័ន្ធគ្រប់គ្រងសាលារៀនឌីជីថល (Digital School Platform)</span>
               <span style="color: #10b981; font-weight: bold;">● ឯកសារផ្លូវការ</span>
            </div>
         </div>

         <!-- ផ្នែកខាងក្រោម (Footer Bar with Smart QR Code) -->
         <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 10mm; margin-bottom: 1mm;">
            <div style="font-size: 10.5px; color: #64748b; line-height: 1.6;">
               <div>• គោរពតាមកម្មវិធីសិក្សា និងបទបញ្ជាផ្ទៃក្នុងរបស់ក្រសួងអប់រំ</div>
               <div>• បោះពុម្ពចេញពីប្រព័ន្ធស្វ័យប្រវត្តិកាលបរិច្ឆេទ ៖ ${window.getFormattedSolarDate()}</div>
            </div>

            <!-- Modern Digital Verification Mockup -->
            <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 5px 8px; border-radius: 8px;">
               <svg width="34" height="34" viewBox="0 0 24 24" fill="#1e3a8a">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 12h8v8H2v-8zm2 2v4h4v-4H4zm10-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm2 4h2v2h-2v-2zm-4 0h2v2h-2v-2z"/>
               </svg>
               <div style="font-size: 9px; color: #475569; font-weight: bold; line-height: 1.2;">
                  ស្កេនពិនិត្យ<br><span style="color: #2563eb;">E-Portfolio</span>
               </div>
            </div>
         </div>

      </div>
    </div>

    <!-- ============================================================== -->
    <!-- ទំព័រទី ២៖ ព័ត៌មានលម្អិតសិស្ស (Modern Structured Profile Sheet) -->
    <!-- ============================================================== -->
    <div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 8mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">
      <div class="report-booklet-page bg-white box-border text-slate-900 shadow-xl print:shadow-none" 
           style="width: 100%; height: 100%; padding: 10mm 14mm; border: 2.5px solid #1e3a8a; position: relative; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
         
         <div style="position: absolute; top: 3.5mm; left: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; top: 3.5mm; right: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; bottom: 3.5mm; left: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>
         <div style="position: absolute; bottom: 3.5mm; right: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>

         <div>
            <!-- ក្បាលទំព័រព័ត៌មាន -->
            <div style="text-align: center; margin-bottom: 4mm; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px;">
               <h2 style="margin: 0; font-family: 'Moul', serif; font-size: 15px; color: #1e3a8a;">
                  ជីវប្រវត្តិសង្ខេបសិស្ស និងព័ត៌មានអាណាព្យាបាល
               </h2>
               <p style="margin: 1px 0 0 0; font-size: 11px; color: #64748b; font-weight: bold;">
                  សាលាចំណេះទូទៅ • ${schoolName}
               </p>
            </div>

            <!-- ប្លុកព័ត៌មានផ្ទាល់ខ្លួន និងរូបថត (ID Header Grid) -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 3mm; background: #f8fafc; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
               <div style="flex: 1; font-size: 13px; line-height: 2.1;">
                  <div style="display: flex; gap: 16px; align-items: baseline;">
                     <span>ឈ្មោះសិស្ស ៖ <b style="font-family: 'Moul', serif; font-size: 15px; color: #1e3a8a;">${fullStu.name}</b></span>
                     <span>ភេទ ៖ <b>${fullStu.gender || 'ប្រុស'}</b></span>
                     <span>អត្តលេខ ៖ <b style="font-family: monospace; font-size: 14px; color: #1e3a8a;">${fullStu.id || '........'}</b></span>
                  </div>
                  <div>
                     ថ្នាក់ទី ៖ <b style="color: #be123c;">${levelStr.replace('ថ្នាក់ទី ', '')} ${room}</b>
                     &nbsp;&nbsp;&nbsp;&nbsp; ឆ្នាំសិក្សា ៖ <b style="font-family: monospace; color: #1e3a8a;">${window.toKhmerNum(academicYear)}</b>
                  </div>
                  <div>
                     សាលារៀន ៖ <span style="font-weight: bold; color: #334155;">${schoolName}</span>
                     &nbsp;&nbsp;&nbsp;&nbsp; កម្រង ៖ <span>${renderField(clusterName, ".....................")}</span>
                  </div>
               </div>

               <!-- ប្រអប់រូបថតបែបទំនើប (Rounded Photo Slot with Drop Shadow) -->
               <div style="width: 28mm; height: 36mm; border: 2px dashed #93c5fd; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #ffffff; flex-shrink: 0; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                  ${photoSrc ? `<img src="${photoSrc}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="#94a3b8" style="margin-bottom: 2px;">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                     </svg>
                     <span style="font-size: 10px; font-weight: bold; color: #64748b;">រូបថត ៤ x ៦</span>
                  `}
               </div>
            </div>

            <!-- តារាងព័ត៌មានលម្អិត (Structured Modern Form Layout) -->
            <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 12.5px; line-height: 2.3; color: #1e293b; background: #ffffff;">
               
               <div style="font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 4px;">
                  I. ទីកន្លែងកំណើត និងអាសយដ្ឋានបច្ចុប្បន្ន
               </div>
               
               <div> 
                  • ថ្ងៃខែឆ្នាំកំណើត ៖ ${renderField(fullDobKhmer, "ថ្ងៃទី...... ខែ................ ឆ្នាំ២០......")} 
                  &nbsp;&nbsp; នៅភូមិ/ក្រុម ៖ ${renderField(fullStu.pob_village, "........................")}
               </div>
               <div>
                  • ឃុំ/សង្កាត់ ៖ ${renderField(fullStu.pob_commune, "........................")} 
                  &nbsp;&nbsp; ស្រុក/ខណ្ឌ ៖ ${renderField(fullStu.pob_district, "........................")} 
                  &nbsp;&nbsp; ខេត្ត/ក្រុង ៖ ${renderField(fullStu.pob_province, "........................")}
               </div>
               <div>
                  • អាសយដ្ឋានបច្ចុប្បន្ន ៖ ផ្ទះលេខ ${renderField(fullStu.house_no, "....")} 
                  &nbsp; ផ្លូវ ${renderField(fullStu.street, "....")} 
                  &nbsp; ភូមិ ${renderField(fullStu.curr_village, "................")} 
                  &nbsp; ឃុំ/សង្កាត់ ${renderField(fullStu.curr_commune, "................")}
               </div>
               <div>
                  • ស្រុក/ខណ្ឌ ៖ ${renderField(fullStu.curr_district, ".........................")} 
                  &nbsp;&nbsp; ខេត្ត/ក្រុង ៖ ${renderField(fullStu.curr_province, ".........................")}
               </div>

               <div style="font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-top: 8px; margin-bottom: 4px;">
                  II. ព័ត៌មានមាតាបិតា និងអាណាព្យាបាល
               </div>

               <div>
                  • ឪពុកឈ្មោះ ៖ ${renderField(fullStu.father_name)} 
                  &nbsp;&nbsp;&nbsp;&nbsp; មុខរបរ ៖ ${renderField(fullStu.father_job)}
               </div>
               <div>
                  • ម្ដាយឈ្មោះ ៖ ${renderField(fullStu.mother_name)} 
                  &nbsp;&nbsp;&nbsp;&nbsp; មុខរបរ ៖ ${renderField(fullStu.mother_job)}
               </div>
               <div>
                  • អាណាព្យាបាលឈ្មោះ ៖ ${renderField(fullStu.guardian_name || fullStu.father_name || fullStu.mother_name)} 
                  &nbsp;&nbsp;&nbsp;&nbsp; មុខរបរ ៖ ${renderField(fullStu.guardian_job || fullStu.father_job || fullStu.mother_job)}
               </div>
               <div>
                  • លេខទូរស័ព្ទទំនាក់ទំនងអាណាព្យាបាល ៖ <span style="font-family: monospace; font-weight: bold; color: #1e3a8a;">${renderField(fullStu.phone || fullStu.contact, "....................................")}</span>
               </div>
            </div>

            <!-- សេចក្តីសន្យាសង្ខេបរបស់សិស្ស (Student Pledge Callout) -->
            <div style="margin-top: 3mm; background: #eff6ff; border-left: 3.5px solid #2563eb; padding: 6px 12px; border-radius: 4px; font-size: 11px; color: #1e40af; font-style: italic;">
               « ខ្ញុំបាទ/នាងខ្ញុំ សូមសន្យាថានឹងគោរពប្រតិបត្តិតាមបទបញ្ជាផ្ទៃក្នុងរបស់សាលារៀន ឧស្សាហ៍ព្យាយាមរៀនសូត្រ និងគោរពវិន័យឱ្យបានខ្ជាប់ខ្ជួនបំផុត »
            </div>
         </div>

         <!-- ហត្ថលេខា និងការទទួលស្គាល់ផ្លូវការ (Official Signatures) -->
         <div style="display: flex; justify-content: space-between; text-align: center; font-size: 12.5px; margin-top: 4mm; padding-top: 3mm; border-top: 1.5px solid #e2e8f0;">
            <div style="width: 44%;">
               <p style="margin: 0 0 45px 0; font-weight: bold; color: #334155;">ហត្ថលេខា ឬស្នាមមេដៃអាណាព្យាបាល</p>
               <p style="margin: 0; color: #94a3b8; font-size: 11px;">............................................................</p>
            </div>
            
            <div style="width: 44%;">
               <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">${window.getFormattedSolarDate()}</p>
               <p style="margin: 0 0 35px 0; font-family: 'Moul', serif; font-size: 12.5px; color: #1e3a8a;">នាយកសាលា</p>
               <p style="margin: 0; color: #94a3b8; font-size: 11px;">............................................................</p>
            </div>
         </div>

      </div>
    </div>
  `;
};

// =====================================================================
// ៦. មុខងារបោះពុម្ព (Print Manager)
// =====================================================================
window.printReportCards = function() {
  const allStudents = window.rankingsDataList;
  if (!allStudents || allStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

  let printStudents = allStudents;
  if (window.selectedReportCardStudentId && window.selectedReportCardStudentId !== 'all') {
    printStudents = allStudents.filter(s => String(s.id).trim() === String(window.selectedReportCardStudentId).trim());
  }

  let fullHtml = "";
  printStudents.forEach(s => {
    if (window.reportCardPrintType === 'cover_page') {
      fullHtml += window.generateCoverAndProfileHTML(s);
    } else if (window.reportCardPrintType === 'full_booklet') {
      fullHtml += window.generateCoverAndProfileHTML(s) + `
        <div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">
          ${window.generateMonthlySheetHTML(s, null)}
        </div>
      `;
    } else {
      fullHtml += `
        <div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">
          ${window.generateMonthlySheetHTML(s, null)}
        </div>
      `;
    }
  });

  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>បោះពុម្ពសៀវភៅតាមដានការសិក្សា</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        @page { 
          size: A4 portrait; 
          margin: 0mm !important; 
        }
        * { 
          box-sizing: border-box; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
        }
        html, body { 
          margin: 0 !important; 
          padding: 0 !important; 
          background: #fff; 
          font-family: 'Siemreap', sans-serif; 
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .font-moul { font-family: 'Moul', serif !important; }
        .print-page-wrapper {
          page-break-after: always;
          break-after: page;
          margin: 0 auto;
        }
        @media print {
          .no-print { display: none !important; }
        }
      </style>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      ${fullHtml}
    </body>
    </html>
  `;

  const printWin = window.open('', '_blank', 'width=1050,height=900');
  printWin.document.open();
  printWin.document.write(printDocument);
  printWin.document.close();

  setTimeout(() => {
    printWin.focus();
    printWin.print();
  }, 800);
};


// =====================================================================
// 🔴 មុខងារបង្ហាញក្នុង Modal ទី ៤: Honor Board Content (Canva Style Editor)
// =====================================================================

// អថេរសម្រាប់ផ្ទុករូបភាព Background, ឡូហ្គោ និងទំហំ (Scale)
window.currentHonorBg = "";
window.currentHonorLogo = "";
window.honorBoardScale = 0.85;
window.honorBoardTheme = "gold";
window.honorBoardTopCount = 5;

window.renderHonorBoardContent = function() {
    window.calculateAllScores(); // Force calculation
    const container = document.getElementById("modal-content-honorboard") || document.getElementById("scoreTabContent-honorboard");
    if (!container) return;

    if (!window.rankingsDataList || window.rankingsDataList.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-slate-500 font-bold p-16 bg-white rounded-3xl border border-slate-200">
             <div class="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mb-4"><i class="fa-solid fa-trophy"></i></div>
             <h3 class="text-lg font-bold text-slate-700 font-moul mb-2">មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់</h3>
             <p class="text-sm font-normal">សូមបញ្ចូលពិន្ទុ និងគណនាជាមុនសិន។</p>
          </div>`;
        return;
    }

    // ផ្ទាំងបញ្ជា (Control Panel)
    container.innerHTML = `
      <div class="w-full flex flex-col space-y-4 font-siemreap bg-slate-50 p-4 rounded-b-3xl min-h-full">
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4 no-print relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
          
          <div class="flex flex-wrap items-center gap-3 pl-3">
            <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button onclick="window.setHonorTopCount(3)" class="px-4 py-1.5 rounded-lg transition ${window.honorBoardTopCount===3?'bg-white text-amber-700 shadow-sm':'text-slate-500 hover:bg-slate-200'}">Top 3</button>
              <button onclick="window.setHonorTopCount(5)" class="px-4 py-1.5 rounded-lg transition ${window.honorBoardTopCount===5?'bg-white text-amber-700 shadow-sm':'text-slate-500 hover:bg-slate-200'}">Top 5</button>
            </div>

            <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span class="text-slate-500 font-bold"><i class="fa-solid fa-palette text-amber-500"></i> ស្ទីល៖</span>
              <select onchange="window.setHonorTheme(this.value)" class="bg-transparent font-bold text-slate-800 outline-none cursor-pointer">
                <option value="gold" ${window.honorBoardTheme==='gold'?'selected':''}>✨ ពណ៌មាសប្រណីត (Gold)</option>
                <option value="blue" ${window.honorBoardTheme==='blue'?'selected':''}>🏛️ ពណ៌ខៀវផ្លូវការ (Blue)</option>
                <option value="slate" ${window.honorBoardTheme==='slate'?'selected':''}>💎 ប្រាក់ស្រាល (Silver)</option>
                <option value="clean" ${window.honorBoardTheme==='clean'?'selected':''}>📄 សាមញ្ញ (Minimal)</option>
              </select>
            </div>

            <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-700">
              <button onclick="window.adjustHonorScale(-0.05)" class="w-7 h-7 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
              <span id="honorZoomLevelLbl" class="w-12 text-center font-mono text-indigo-700 bg-white py-1 rounded shadow-inner">${Math.round(window.honorBoardScale * 100)}%</span>
              <button onclick="window.adjustHonorScale(0.05)" class="w-7 h-7 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
            </div>

            <div class="flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-xl p-1 shadow-inner">
               <button onclick="window.addCustomText()" class="px-3 py-1.5 hover:bg-white text-indigo-700 rounded-lg text-xs font-bold transition tooltip" title="បន្ថែមអក្សរថ្មី"><i class="fa-solid fa-t"></i></button>
               <button onclick="window.addCustomSticker('🏆')" class="px-3 py-1.5 hover:bg-white text-indigo-700 rounded-lg text-sm font-bold transition">🏆</button>
               <button onclick="window.addCustomSticker('⭐')" class="px-3 py-1.5 hover:bg-white text-indigo-700 rounded-lg text-sm font-bold transition">⭐</button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Upload Logo -->
            <label class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm m-0">
              <i class="fa-solid fa-camera"></i> ប្ដូរឡូហ្គោ
              <input type="file" accept="image/*" class="hidden" onchange="window.changeHonorLogo(event)">
            </label>

            <!-- Upload Frame -->
            <label class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm m-0">
              <i class="fa-solid fa-image"></i> បញ្ចូលស៊ុម (Frame)
              <input type="file" accept="image/*" class="hidden" onchange="window.changeHonorFrame(event)">
            </label>

            <button onclick="window.printOfficialHonorBoard()" class="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-black shadow-md transition flex items-center gap-2 transform hover:scale-105">
              <i class="fa-solid fa-print"></i> បោះពុម្ព
            </button>
          </div>
        </div>

        <div class="w-full flex justify-center overflow-auto p-4 md:p-8 bg-slate-300 rounded-3xl border border-slate-200 custom-scrollbar shadow-inner mt-3" id="top5HonorContainer" style="min-height: 800px;"></div>
      </div>
    `;

    renderTop5HonorBoard();
};

// ==========================================
// មុខងារកំណត់រចនាសម្ព័ន្ធ (Settings Functions)
// ==========================================
window.setHonorTopCount = function(count) {
    window.honorBoardTopCount = count;
    window.renderHonorBoardContent();
};

window.adjustHonorScale = function(delta) {
    window.honorBoardScale = Math.min(Math.max(window.honorBoardScale + delta, 0.4), 1.5);
    const board = document.getElementById("top5HonorPrintArea");
    if (board) board.style.transform = `scale(${window.honorBoardScale})`;
    const lbl = document.getElementById("honorZoomLevelLbl");
    if (lbl) lbl.textContent = `${Math.round(window.honorBoardScale * 100)}%`;
};

window.setHonorTheme = function(theme) {
    window.honorBoardTheme = theme;
    window.currentHonorBg = ""; 
    renderTop5HonorBoard();
};

window.changeHonorFrame = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.currentHonorBg = e.target.result;
            renderTop5HonorBoard(); 
        }
        reader.readAsDataURL(file);
    }
};

window.changeHonorLogo = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.currentHonorLogo = e.target.result;
            renderTop5HonorBoard(); 
        }
        reader.readAsDataURL(file);
    }
};

// ==========================================
// មុខងារគូរផ្ទាំង A4 (Render Engine)
// ==========================================
// ==========================================
// មុខងារគូរផ្ទាំង A4 (ផ្តាច់ធាតុនិមួយៗដាច់ពីគ្នា)
// ==========================================
function renderTop5HonorBoard() {
    const container = document.getElementById("top5HonorContainer");
    if (!container) return;

    const level = document.getElementById("globalLevelSelect")?.value || "ថ្នាក់ទី";
    const room = document.getElementById("globalRoomSelect")?.value || "";
    const periodType = document.getElementById("globalPeriodType")?.value || "monthly";
    const periodVal = document.getElementById("globalPeriodValue")?.value || "";

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
    const teacher_name = sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";
    const principal_name = sInfo.principal_name || "នាយកសាលា";
    const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
    const current_year = new Date().getFullYear();

    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');

    let periodTitleText = periodType === "monthly" 
        ? `លទ្ធផលសិក្សាប្រចាំខែ ${periodVal}` 
        : (periodType === "semester" ? `លទ្ធផលសិក្សាប្រចាំ${periodVal}` : `លទ្ធផលសិក្សាប្រចាំឆ្នាំសិក្សា ${toKhmerNum(academic_year)}`);

    const topStudents = window.rankingsDataList.filter(s => s.rank >= 1 && s.rank <= window.honorBoardTopCount);
    const getS = (r) => topStudents.find(s => s.rank === r) || null;

    const renderStudentCard = (stu, rankNum, isChampion = false) => {
        let theme = {};
        if (rankNum === 1) theme = { border: 'border-amber-400', ring: 'ring-amber-200', badge: 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600', shadow: 'shadow-amber-500/40', medal: '🥇' };
        else if (rankNum === 2) theme = { border: 'border-slate-300', ring: 'ring-slate-200', badge: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500', shadow: 'shadow-slate-500/30', medal: '🥈' };
        else if (rankNum === 3) theme = { border: 'border-orange-400', ring: 'ring-orange-200', badge: 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600', shadow: 'shadow-orange-500/40', medal: '🥉' };
        else theme = { border: 'border-indigo-400', ring: 'ring-indigo-200', badge: 'bg-gradient-to-br from-indigo-500 to-indigo-700', shadow: 'shadow-indigo-500/30', medal: '⭐' };

        const cardScale = isChampion ? 'w-[145px]' : 'w-[125px]';
        const photoBox = isChampion ? 'w-[115px] h-[150px]' : 'w-[100px] h-[130px]';
        const badgeSize = isChampion ? 'w-11 h-11 text-sm -top-3 -right-3' : 'w-9 h-9 text-xs -top-2.5 -right-2.5';
        
        if (!stu) return `<div class="canva-el cursor-grab flex flex-col items-center justify-center ${photoBox} border-2 border-dashed border-slate-400 bg-white/40 text-slate-500 text-xs font-bold rounded-2xl opacity-60 mx-auto backdrop-blur-sm"><i class="fa-solid fa-user-slash text-xl mb-2"></i> ទទេ</div>`;

        const photoSrc = stu.photo_url || stu.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.name)}&background=random&size=200`;

        return `
          <div class="canva-el cursor-grab flex flex-col items-center relative z-10 ${cardScale} mx-auto transition-transform duration-200 hover:scale-105 group hover:z-50">
            <div class="relative">
              <div class="absolute ${badgeSize} rounded-full ${theme.badge} text-white font-black flex items-center justify-center shadow-xl border-[2.5px] border-white z-20 font-moul pointer-events-none transition-transform group-hover:rotate-12">${theme.medal} ${toKhmerNum(rankNum.toString())}</div>
              <div class="${photoBox} rounded-2xl overflow-hidden border-[3.5px] ${theme.border} shadow-xl ${theme.shadow} ring-[3px] ${theme.ring} bg-white pointer-events-none"><img src="${photoSrc}" class="w-full h-full object-cover"></div>
            </div>
            <div class="mt-3 bg-white/95 backdrop-blur-md border border-white rounded-2xl w-[115%] p-2.5 text-center shadow-lg relative z-10 hover:ring-2 hover:ring-dashed hover:ring-blue-400">
              <h4 contenteditable="true" spellcheck="false" class="font-moul text-[12px] truncate outline-none hover:bg-slate-100 px-1 rounded text-slate-900 drop-shadow-sm">${stu.name}</h4>
              <div class="inline-flex bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-600 shadow-inner mt-1.5 pointer-events-none">
                 មធ្យម៖ <span class="text-indigo-700 font-mono text-[11px] font-black pointer-events-auto ml-1" contenteditable="true" spellcheck="false">${stu.avg.toFixed(2)}</span>
              </div>
            </div>
          </div>
        `;
    };

    let themeBg = "";
    let wrapperBorder = "";
    
    if (window.currentHonorBg) {
        themeBg = `<img src="${window.currentHonorBg}" class="absolute inset-0 w-full h-full object-fill z-0 print:object-fill">`;
        wrapperBorder = "border-none bg-white";
    } else {
        if (window.honorBoardTheme === 'blue') {
            themeBg = `<div class="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-slate-100 z-0"></div><div class="absolute inset-4 border-[4px] border-double border-blue-600/30 rounded-3xl z-0 pointer-events-none"></div>`;
            wrapperBorder = "border-[8px] border-solid border-blue-900/10 bg-white";
        } else if (window.honorBoardTheme === 'slate') {
            themeBg = `<div class="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200 z-0"></div><div class="absolute inset-4 border-[2px] border-slate-300 rounded-3xl z-0 pointer-events-none"></div>`;
            wrapperBorder = "border border-slate-300 bg-white";
        } else if (window.honorBoardTheme === 'clean') {
            themeBg = `<div class="absolute inset-0 bg-white z-0"></div>`;
            wrapperBorder = "border border-slate-200 bg-white";
        } else {
            themeBg = `
              <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/60 via-white to-orange-50/50 z-0"></div>
              <div class="absolute inset-5 border-[6px] border-double border-amber-600/30 rounded-3xl z-0 pointer-events-none"></div>
              <div class="absolute top-8 left-8 text-amber-500/40 text-2xl pointer-events-none">❖</div><div class="absolute top-8 right-8 text-amber-500/40 text-2xl pointer-events-none">❖</div>
              <div class="absolute bottom-8 left-8 text-amber-500/40 text-2xl pointer-events-none">❖</div><div class="absolute bottom-8 right-8 text-amber-500/40 text-2xl pointer-events-none">❖</div>
            `;
            wrapperBorder = "border-[12px] border-double border-amber-700 bg-white";
        }
    }

    let studentGridHtml = "";
    if (window.honorBoardTopCount === 3) {
        studentGridHtml = `
          <div class="flex-1 flex flex-col justify-center items-center gap-10 relative z-10 w-full my-auto">
            <div class="flex justify-center w-full z-20">${renderStudentCard(getS(1), 1, true)}</div>
            <div class="flex justify-center gap-24 w-full z-10">${renderStudentCard(getS(2), 2)} ${renderStudentCard(getS(3), 3)}</div>
          </div>
        `;
    } else {
        studentGridHtml = `
          <div class="flex-1 flex flex-col justify-center items-center gap-4 relative z-10 w-full my-auto">
            <div class="flex justify-center w-full z-30">${renderStudentCard(getS(1), 1, true)}</div>
            <div class="flex justify-center gap-16 w-full z-20">${renderStudentCard(getS(2), 2)} ${renderStudentCard(getS(3), 3)}</div>
            <div class="flex justify-center gap-24 w-full z-10">${renderStudentCard(getS(4), 4)} ${renderStudentCard(getS(5), 5)}</div>
          </div>
        `;
    }

    const paddingClass = window.currentHonorBg ? 'px-[75px] py-[65px]' : 'px-14 py-12';
    
    const logoHtml = window.currentHonorLogo 
        ? `<img src="${window.currentHonorLogo}" class="w-14 h-14 object-contain mx-auto mb-1 drop-shadow-md pointer-events-none" alt="Logo">` 
        : `<div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-1 shadow-md border-2 border-white pointer-events-none">🏫</div>`;

    container.innerHTML = `
      <div id="top5HonorPrintArea" 
           class="w-[794px] h-[1123px] relative flex flex-col justify-between print:w-[210mm] print:h-[297mm] shadow-2xl print:shadow-none text-slate-900 font-siemreap shrink-0 box-border overflow-hidden rounded-xl print:rounded-none ${wrapperBorder}" 
           style="transform: scale(${window.honorBoardScale}); transform-origin: top center; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
        
        ${themeBg}

        <div class="w-full h-full relative z-10 flex flex-col ${paddingClass}">
            
            <!-- ============================================== -->
            <!-- ផ្នែកខាងលើ (Logo និង ព្រះរាជាណាចក្រ) ត្រូវបានផ្ដាច់ពីគ្នា -->
            <!-- ============================================== -->
            <div class="shrink-0 relative flex justify-between items-start w-full z-20">
                <!-- ឡូហ្គោ និង ឈ្មោះសាលា -->
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded-xl text-center leading-tight transition-colors hover:bg-white/40 backdrop-blur-sm z-20">
                  ${logoHtml}
                  <p contenteditable="true" spellcheck="false" class="font-moul text-amber-950 text-[13px] outline-none mt-1 hover:bg-white/60 px-2 py-0.5 rounded">${school_name}</p>
                </div>

                <!-- ពាក្យស្លោកជាតិ -->
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded-xl text-center transition-colors hover:bg-white/40 backdrop-blur-sm z-20">
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[14px] text-slate-900 outline-none drop-shadow-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[14px] mt-1 text-slate-800 outline-none drop-shadow-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  <div class="text-[10px] text-amber-600/70 tracking-[0.5em] mt-1 pointer-events-none">❖ ❖ ❖</div>
                </div>
            </div>

            <!-- ============================================== -->
            <!-- ផ្នែកចំណងជើងកណ្តាល ត្រូវបានផ្ដាច់ចេញពីគ្នា -->
            <!-- ============================================== -->
            <div class="text-center mt-3 mb-1 relative z-20 flex flex-col items-center gap-2">
                <!-- ចំណងជើងធំ -->
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded-xl transition-colors hover:bg-white/30 z-20">
                    <h1 contenteditable="true" spellcheck="false" class="font-moul text-[42px] text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 tracking-wider drop-shadow-sm outline-none inline-block px-4 py-1" style="-webkit-text-stroke: 0.5px rgba(255,255,255,0.7);">តារាងកិត្តិយស</h1>
                </div>
                
                <!-- ប៊ូតុងលទ្ធផលសិក្សា -->
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-1 rounded-full transition-transform z-20">
                    <p contenteditable="true" spellcheck="false" class="font-bold text-[14px] text-amber-950 bg-white/90 inline-block px-6 py-1.5 rounded-full border border-amber-200 backdrop-blur-md shadow-sm outline-none">${periodTitleText}</p>
                </div>

                <!-- ថ្នាក់ និងឆ្នាំសិក្សា -->
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded-xl transition-colors hover:bg-white/40 z-20">
                    <p class="text-amber-900 font-bold text-[13px]">ថ្នាក់រៀន ៖ <span contenteditable="true" class="text-[14px] outline-none font-moul text-rose-700 bg-white/50 px-2 rounded">${level.replace('ថ្នាក់ទី ', '')} ${room}</span> <span class="mx-2 text-slate-400">|</span> ឆ្នាំសិក្សា ៖ <span contenteditable="true" class="font-bold outline-none font-mono text-[14px] bg-white/50 px-2 rounded">${toKhmerNum(academic_year)}</span></p>
                </div>
            </div>

            ${studentGridHtml}

            <!-- Footer (Draggable) រក្សាដដែល -->
            <div class="shrink-0 mt-auto pt-4 relative z-10">
              <div class="flex justify-between items-end text-[13px] font-bold px-8">
                <div class="text-center canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-3 rounded-xl transition-colors hover:bg-white/50 backdrop-blur-sm">
                  <p contenteditable="true" spellcheck="false" class="mb-2 text-slate-800 outline-none font-normal">បានឃើញ និងឯកភាព</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[12px] text-slate-900 mb-10 outline-none">នាយកសាលា</p>
                  <div contenteditable="true" spellcheck="false" class="font-moul text-[14px] text-indigo-950 outline-none min-w-[120px] border-b border-dashed border-transparent hover:border-slate-400 pb-1">${principal_name}</div>
                </div>
                <div class="text-center canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-3 rounded-xl transition-colors hover:bg-white/50 backdrop-blur-sm">
                  <p contenteditable="true" spellcheck="false" class="font-normal text-[11px] text-slate-700 mb-2 outline-none">ធ្វើនៅ....................., ថ្ងៃទី........ខែ........ឆ្នាំ ${toKhmerNum(current_year.toString())}</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[12px] text-slate-900 mb-10 outline-none">គ្រូទទួលបន្ទុកថ្នាក់</p>
                  <div contenteditable="true" spellcheck="false" class="font-moul text-[14px] text-indigo-950 outline-none min-w-[120px] border-b border-dashed border-transparent hover:border-slate-400 pb-1">${teacher_name}</div>
                </div>
              </div>
            </div>
        </div>
      </div>
    `;
    
    if (typeof initCanvaEngine === 'function') initCanvaEngine(); 
}

// ==========================================
// មុខងារ Print ដាច់ដោយឡែក (Isolated Print)
// ==========================================
window.printOfficialHonorBoard = function() {
    const printArea = document.getElementById("top5HonorPrintArea");
    if (!printArea) return alert("⚠️ រកមិនឃើញតារាងកិត្តិយសទេ!");

    if (typeof closeCanvaToolbar === 'function') closeCanvaToolbar();

    const clonedPrintArea = printArea.cloneNode(true);
    clonedPrintArea.style.transform = 'none'; 
    clonedPrintArea.style.width = '210mm';
    clonedPrintArea.style.height = '297mm';
    clonedPrintArea.style.boxShadow = 'none';
    clonedPrintArea.style.borderRadius = '0';
    
    const printContent = clonedPrintArea.outerHTML;

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>បោះពុម្ពតារាងកិត្តិយស</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
          @page { size: A4 portrait; margin: 0mm !important; }
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { margin: 0 !important; padding: 0 !important; display: flex; justify-content: center; background: #fff; font-family: 'Siemreap', sans-serif; }
          .font-moul { font-family: 'Moul', serif !important; }
          #top5HonorPrintArea { width: 210mm !important; height: 297mm !important; margin: 0 !important; border-radius: 0 !important; }
          /* លាក់ស៊ុមពណ៌ខៀវពេល Print */
          .canva-el { outline: none !important; box-shadow: none !important; border: none !important; background: transparent !important; }
        </style>
      </head>
      <body class="font-siemreap">
        ${printContent}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 800);
};

// ==========================================
// 🎨 Canva Engine: Drag-Drop, Edit, Floating Toolbar 
// ==========================================
let activeEl = null;
let isDragging = false;
let startX, startY, initialX, initialY;

window.initCanvaEngine = function() {
    let toolbar = document.getElementById('canva-toolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'canva-toolbar';
        toolbar.className = 'fixed z-[9999] hidden bg-slate-900/95 text-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-1.5 flex flex-wrap items-center gap-1 border border-slate-700 backdrop-blur-md transition-opacity animate-fade-in no-print';
        toolbar.innerHTML = `
          <button onclick="changeFontSize(1)" class="w-8 h-8 flex justify-center items-center rounded-xl hover:bg-slate-700 transition tooltip" title="ពង្រីកអក្សរ"><i class="fa-solid fa-plus text-sm"></i></button>
          <button onclick="changeFontSize(-1)" class="w-8 h-8 flex justify-center items-center rounded-xl hover:bg-slate-700 transition tooltip" title="បង្រួមអក្សរ"><i class="fa-solid fa-minus text-sm"></i></button>
          <div class="w-px h-6 bg-slate-700 mx-1"></div>
          <div class="relative flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-700 transition overflow-hidden tooltip" title="ពណ៌អក្សរ">
             <input type="color" id="canvaTextColor" onchange="changeTextColor(this.value)" class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 opacity-0">
             <div id="colorIndicator" class="w-5 h-5 rounded-full border-2 border-white pointer-events-none" style="background-color: #000;"></div>
          </div>
          <div class="w-px h-6 bg-slate-700 mx-1"></div>
          <button onclick="deleteActiveElement()" class="w-8 h-8 flex justify-center items-center rounded-xl hover:bg-rose-500/80 text-rose-300 hover:text-white transition tooltip" title="លុប"><i class="fa-solid fa-trash-can text-sm"></i></button>
        `;
        document.body.appendChild(toolbar);
    }

    document.removeEventListener('mousedown', dragStart);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('click', showToolbarOnClick);

    document.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('click', showToolbarOnClick);
};

function dragStart(e) {
    if (e.target.tagName.toLowerCase() === 'input' || (e.target.contentEditable === 'true' && document.activeElement === e.target)) return;
    
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
        activeEl.style.zIndex = '100';
    }
}

function drag(e) {
    if (isDragging && activeEl) {
        e.preventDefault(); 
        const scale = window.honorBoardScale || 1;
        const dx = (e.clientX - startX) / scale;
        const dy = (e.clientY - startY) / scale;
        activeEl.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
        
        const toolbar = document.getElementById('canva-toolbar');
        if (toolbar && !toolbar.classList.contains('hidden')) updateToolbarPosition();
    }
}

function dragEnd(e) {
    isDragging = false;
    if (activeEl) {
        activeEl.style.cursor = 'grab';
        activeEl.style.zIndex = '10';
    }
}

function showToolbarOnClick(e) {
    const toolbar = document.getElementById('canva-toolbar');
    if (!toolbar) return;

    const clickedEl = e.target.closest('.canva-el');
    if (clickedEl && !isDragging) {
        activeEl = clickedEl;
        toolbar.classList.remove('hidden');
        updateToolbarPosition();
        
        const colorPicker = document.getElementById('canvaTextColor');
        const colorInd = document.getElementById('colorIndicator');
        if(colorPicker && colorInd) {
            const textTarget = activeEl.querySelector('[contenteditable="true"]') || activeEl;
            const rgb = window.getComputedStyle(textTarget).color;
            const hex = rgbToHex(rgb) || '#000000';
            colorPicker.value = hex;
            colorInd.style.backgroundColor = hex;
        }
    } else if (!e.target.closest('#canva-toolbar') && !isDragging) {
        closeCanvaToolbar();
    }
}

function updateToolbarPosition() {
    const toolbar = document.getElementById('canva-toolbar');
    if (toolbar && activeEl) {
        const rect = activeEl.getBoundingClientRect();
        toolbar.style.top = `${rect.top - 60}px`;
        toolbar.style.left = `${rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2)}px`;
    }
}

window.closeCanvaToolbar = function() {
    const toolbar = document.getElementById('canva-toolbar');
    if (toolbar) toolbar.classList.add('hidden');
};

window.changeFontSize = function(delta) {
    if (!activeEl) return;
    const target = activeEl.querySelector('[contenteditable="true"]') || activeEl;
    const currentSize = parseFloat(window.getComputedStyle(target).fontSize);
    target.style.fontSize = `${currentSize + (delta * 3)}px`;
    target.style.lineHeight = 'normal';
    updateToolbarPosition();
};

window.changeTextColor = function(color) {
    if (!activeEl) return;
    const targets = activeEl.querySelectorAll('[contenteditable="true"]');
    if (targets.length > 0) {
        targets.forEach(t => { t.style.color = color; t.style.webkitTextFillColor = color; t.style.backgroundImage = 'none'; });
    } else {
        activeEl.style.color = color;
    }
    const colorInd = document.getElementById('colorIndicator');
    if(colorInd) colorInd.style.backgroundColor = color;
};

window.deleteActiveElement = function() {
    if (activeEl) {
        activeEl.remove();
        closeCanvaToolbar();
    }
};

window.addCustomText = function() {
    const printArea = document.getElementById("top5HonorPrintArea");
    if (!printArea) return;
    const newEl = document.createElement("div");
    newEl.className = "canva-el absolute z-50 p-2 cursor-grab outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm transition-transform";
    newEl.style.top = "40%";
    newEl.style.left = "40%";
    newEl.innerHTML = `<p contenteditable="true" spellcheck="false" class="font-moul text-[24px] text-slate-800 outline-none">អត្ថបទថ្មី</p>`;
    printArea.appendChild(newEl);
};

window.addCustomSticker = function(emoji) {
    const printArea = document.getElementById("top5HonorPrintArea");
    if (!printArea) return;
    const newEl = document.createElement("div");
    newEl.className = "canva-el absolute z-50 p-2 cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded-full text-[60px] drop-shadow-lg transition-transform hover:scale-110";
    newEl.style.top = "40%";
    newEl.style.left = "40%";
    newEl.innerHTML = emoji;
    printArea.appendChild(newEl);
};

function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return null;
    function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
}