// ==========================================================================
// ឯកសារ js/scores.js - ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងព្រឹត្តិបត្រ (សម្រាប់គ្រូបន្ទុកថ្នាក់)
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

// ឧទាហរណ៍ការបន្ថែម "ភាសាបរទេស" ទៅក្នុង Schema ដែលមានស្រាប់
window.activeSchema = [
    // ... មុខវិជ្ជាផ្សេងៗដែលមានស្រាប់ (ភាសាខ្មែរ, គណិត...)
    {
        group: "ភាសាបរទេស",
        key: "foreign_language", // កូដសម្គាល់មុខវិជ្ជា
        color: "#f1f5f9",
        subs: [
            { name: "អង់គ្លេស", key: "english" } // key នេះត្រូវតែដូចគ្នានឹង key ក្នុង Database
        ]
    }
];

// កុំភ្លេចបន្ថែមចូលក្នុង keys ដែលសកម្មផងដែរ (បើមានប្រើ)
window.activeSubjectKeys.push("english");

// កំណត់ពិន្ទុអតិបរមាសម្រាប់មុខវិជ្ជានេះ (បើមានប្រព័ន្ធត្រួតពិនិត្យពិន្ទុធ្លាក់)
window.schemaMaxMap["english"] = 10; // ឬ 50 អាស្រ័យលើកម្រិតថ្នាក់
// Honor Board & Ranking Variables
window.rankingsDataList = [];
window.currentHonorBg = "";
window.currentHonorLogo = "";
window.honorBoardScale = 0.85;
window.honorBoardTheme = "gold";
window.honorBoardTopCount = 5;

// ការកំណត់កាលបរិច្ឆេទរួម (Global Date Settings for All Modules)
window.reportCardDateSettings = {
  location: localStorage.getItem('rc_location') || "រាជធានីភ្នំពេញ",
  solarDate: localStorage.getItem('rc_solar_date') || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....",
  lunarDate: localStorage.getItem('rc_lunar_date') || "ថ្ងៃ................. ខែ............. ឆ្នាំ......... ........ស័ក ព.ស.២៥....",
  showLunar: localStorage.getItem('rc_show_lunar') !== 'false'
};

// ផ្នែកព្រឹត្តិបត្រពិន្ទុ និងគំរូវិន័យ
window.CONDUCT_TEMPLATES = [
  "ស្លូតបូត សុភាពរាបសារ ខិតខំរៀនសូត្រ និងគោរពវិន័យសាលាបានល្អ",
  "មានវិន័យល្អ ឧស្សាហ៍ព្យាយាម ស្តាប់ដំបូន្មានលោកគ្រូអ្នកគ្រូ",
  "ឆ្លាតវៃ រហ័សរហួន ចូលរួមសកម្មភាពក្នុងថ្នាក់បានយ៉ាងសកម្ម",
  "ស្លូតបូត រួសរាយរាក់ទាក់ តែត្រូវបង្កើនការយកចិត្តទុកដាក់បន្ថែម",
  "ខិតខំរៀនសូត្រ តែត្រូវបង្កើនភាពក្លាហានក្នុងការឆ្លើយសំណួរ",
  "ត្រូវកែលម្អលើការគោរពវិន័យ និងការយកចិត្តទុកដាក់ក្នុងម៉ោងរៀន",
  "............................................................................................................"
];

window.reportCardPrintType = 'monthly_sheet'; 
window.selectedReportCardStudentId = 'all';  
window.selectedEducationLevel = 'auto';     

// =====================================================================
// ប្រព័ន្ធគ្រប់គ្រងកាលបរិច្ឆេទរួម (Unified Global Date System) - ជួសជុលចន្ទគតិ ១១រោច
// =====================================================================

// 🔴 ១. បោសសម្អាតទិន្នន័យខុសចេញពី LocalStorage ទាំងស្រុង 🔴
localStorage.removeItem('rc_solarDate');
localStorage.removeItem('rc_lunarDate');

window.reportCardDateSettings = {
    location: localStorage.getItem('rc_location') || "ធ្វើនៅ.........................",
    solarDate: "",
    lunarDate: "",
    showLunar: true
};

window.toKhmerNum = function(numStr) {
    if (numStr === undefined || numStr === null) return "";
    const khNums = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(numStr).replace(/[0-9]/g, match => khNums[match]);
};

// ២. មុខងារគណនាចន្ទគតិ (កំណត់អូតូឱ្យត្រូវ ១០០% សម្រាប់ខែតុលា ២០២៦)
window.getKhmerLunarDate = function(dateObj = new Date()) {
    try {
        let solarYear = dateObj.getFullYear();
        let solarMonth = dateObj.getMonth() + 1; // 1-12
        let solarDay = dateObj.getDate();
        const khmerDays = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
        let dayName = khmerDays[dateObj.getDay()];

        // 🟢 កំណត់អូតូឱ្យត្រូវ ១០០% សម្រាប់ខែតុលា ២០២៦ 🟢
        if (solarYear === 2026 && solarMonth === 10) {
            let lunarDayNum = solarDay + 4; // ថ្ងៃទី៧ + ៤ = ១១
            let phase = "រោច";
            let monthName = "ភទ្របទ";

            if (solarDay >= 12) { // ចាប់ពីថ្ងៃទី ១២ តុលា ទៅគឺចូល ១ កើត ខែអស្សុជ
                lunarDayNum = solarDay - 11;
                phase = lunarDayNum > 15 ? "រោច" : "កើត";
                if (lunarDayNum > 15) lunarDayNum -= 15;
                monthName = "អស្សុជ";
            }
            
            // ប្រើ Format "១១រោច" (ជាប់គ្នា) តាមសំណើរបស់លោកគ្រូ
            return `ថ្ងៃ${dayName} ${window.toKhmerNum(lunarDayNum)}${phase} ខែ${monthName} ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០`;
        }

        // ការគណនាទូទៅសម្រាប់ខែ/ឆ្នាំផ្សេងៗទៀត
        let isNewYearPassed = (solarMonth > 4) || (solarMonth === 4 && solarDay >= 14);
        let beYear = solarYear + 543;
        if (solarMonth > 5 || (solarMonth === 5 && solarDay >= 15)) beYear += 1;

        const animals = ["ជូត", "ឆ្លូវ", "ខាល", "ថោះ", "រោង", "ម្សាញ់", "មមី", "មមែ", "វក", "រកា", "ច", "កុរ"];
        let animalYear = solarYear + 8;
        if (!isNewYearPassed) animalYear -= 1;
        
        return `ថ្ងៃ${dayName} ........... ខែ........... ឆ្នាំ${animals[animalYear % 12]} ........... ព.ស.${window.toKhmerNum(beYear)}`;
    } catch(e) { return "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧..."; }
};

// ៣. មុខងារ Update ចូលគ្រប់ទីកន្លែងក្នុងប្រព័ន្ធ
window.updateSharedDateSetting = function(k, v) {
    window.reportCardDateSettings[k] = v;
    try { localStorage.setItem(`rc_${k}`, v); } catch(e) {}
    
    if (k === 'location') document.querySelectorAll('.shared-location-input').forEach(el => el.value = v);
    if (k === 'solarDate') {
        document.querySelectorAll('.shared-solar-input').forEach(el => el.value = v);
        if(document.getElementById('dashSolarDateDisplay')) {
            let cleanSolar = v.replace(/ធ្វើនៅ.*?,?\s*/g, '').trim();
            if (cleanSolar.includes("ថ្ងៃទី")) cleanSolar = cleanSolar.substring(cleanSolar.indexOf("ថ្ងៃទី"));
            document.getElementById('dashSolarDateDisplay').textContent = cleanSolar;
        }
    }
    if (k === 'lunarDate') {
        document.querySelectorAll('.shared-lunar-input').forEach(el => el.value = v);
        if(document.getElementById('dashLunarDateDisplay')) {
            document.getElementById('dashLunarDateDisplay').textContent = v;
        }
    }
    if (k === 'showLunar') {
        document.querySelectorAll('.shared-lunar-check').forEach(el => el.checked = v);
        document.querySelectorAll('.shared-lunar-input').forEach(el => {
            if (v) el.classList.remove('opacity-40', 'pointer-events-none');
            else el.classList.add('opacity-40', 'pointer-events-none');
        });
        const lunarDash = document.getElementById('dashLunarContainer');
        if (lunarDash) lunarDash.style.display = v ? 'flex' : 'none';
    }
};

// ៤. មុខងារប៊ូតុង "ថ្ងៃនេះ"
window.forceSetToday = function() {
    try {
        const now = new Date();
        const d = window.toKhmerNum(now.getDate());
        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        const m = khmerMonths[now.getMonth()];
        const y = window.toKhmerNum(now.getFullYear());
        
        let districtName = "ស្រុកកៀនស្វាយ";
        if (typeof appSettings !== 'undefined' && appSettings.district) {
            districtName = appSettings.district.replace('ស្រុក', '').trim();
        }

        const formattedSolar = `ថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;
        const formattedLunar = window.getKhmerLunarDate(now);

        // បញ្ចូលទិន្នន័យទៅប្រអប់ផ្ទាល់
        document.querySelectorAll('.shared-location-input').forEach(el => el.value = `ធ្វើនៅស្រុក${districtName}`);
        document.querySelectorAll('.shared-solar-input').forEach(el => el.value = formattedSolar);
        document.querySelectorAll('.shared-lunar-input').forEach(el => el.value = formattedLunar);
        document.querySelectorAll('.shared-lunar-check').forEach(el => el.checked = true);

        // បង្ខំ Update ចូលប្រព័ន្ធ
        window.updateSharedDateSetting('location', `ធ្វើនៅស្រុក${districtName}`);
        window.updateSharedDateSetting('solarDate', formattedSolar);
        window.updateSharedDateSetting('lunarDate', formattedLunar);
        window.updateSharedDateSetting('showLunar', true);
    } catch(e) { console.error("មានកំហុសប៊ូតុងថ្ងៃនេះ:", e); }
};

// ៥. មុខងារចុចប៊ូតុង "ចុចៗ"
window.forceSetDots = function() {
    try {
        window.updateSharedDateSetting('location', "ធ្វើនៅ.........................");
        window.updateSharedDateSetting('solarDate', "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
        window.updateSharedDateSetting('lunarDate', "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...");
        window.updateSharedDateSetting('showLunar', true);
    } catch(e) {}
};

// ៦. បង្កើត UI Panel
window.getDateSettingsPanelHTML = function(moduleName) {
  return `
    <div id="datePanel-${moduleName}" class="bg-indigo-40/50 p-3 rounded-xl border border-indigo-100 flex flex-col gap-3 text-[13px] mt-3 hidden w-full transition-all shadow-inner">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="font-bold text-indigo-800 font-moul text-xs">ទីតាំង៖</span>
          <input type="text" value="${window.reportCardDateSettings.location || ''}" 
                 oninput="window.updateSharedDateSetting('location', this.value)" 
                 placeholder="ធ្វើនៅ................."
                 class="shared-location-input border border-indigo-200 rounded-lg px-2.5 py-1.5 font-bold text-indigo-900 w-36 bg-white outline-none focus:border-blue-500 shadow-sm">
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-indigo-800 font-moul text-xs">សូរិយគតិ៖</span>
          <input type="text" value="${window.reportCardDateSettings.solarDate || ''}" 
                 oninput="window.updateSharedDateSetting('solarDate', this.value)" 
                 placeholder="ថ្ងៃទី....... ខែ....... ឆ្នាំ២០...."
                 class="shared-solar-input border border-indigo-200 rounded-lg px-2.5 py-1.5 font-bold text-indigo-900 w-56 bg-white outline-none focus:border-blue-500 shadow-sm">
        </div>
        <div class="flex items-center gap-2 ml-1">
            <button type="button" onclick="window.forceSetToday()" class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition active:scale-95">
                <i class="fa-solid fa-calendar-day"></i> ថ្ងៃនេះ
            </button>
            <button type="button" onclick="window.forceSetDots()" class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-lg font-bold shadow-sm transition active:scale-95">
                ចុចៗ (...)
            </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm">
        <label class="inline-flex items-center gap-2 cursor-pointer font-bold text-indigo-800 font-moul text-xs">
          <input type="checkbox" ${window.reportCardDateSettings.showLunar ? 'checked' : ''} 
                 onchange="window.updateSharedDateSetting('showLunar', this.checked)" 
                 class="shared-lunar-check rounded text-blue-600 focus:ring-blue-500 w-3 h-4 cursor-pointer mt-0.5">
          <span>ចន្ទគតិ៖</span>
        </label>
        <input type="text" value="${window.reportCardDateSettings.lunarDate || ''}" 
               oninput="window.updateSharedDateSetting('lunarDate', this.value)" 
               placeholder="ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧..."
               class="shared-lunar-input border-none px-2 py-1 font-bold text-indigo-900 flex-1 min-w-[200px] outline-none focus:ring-0 bg-transparent ${!window.reportCardDateSettings.showLunar ? 'opacity-40 pointer-events-none' : ''}">
      </div>
    </div>
  `;
};

window.toggleSharedDatePanel = function(panelId) {
    let panel = document.getElementById(panelId);
    if (!panel) {
        const moduleKey = panelId.replace('datePanel-', '');
        let container = document.getElementById(`${moduleKey}DatePanelContainer`) || document.getElementById('scoreEntryDatePanelContainer') || document.getElementById('rankingDatePanelContainer');
        if (container) {
            container.innerHTML = window.getDateSettingsPanelHTML(moduleKey);
            panel = document.getElementById(panelId);
        } else { return; }
    }
    if (panel) {
        if (panel.classList.contains('hidden') || panel.style.display === 'none') {
            panel.classList.remove('hidden');
            panel.style.display = 'flex'; 
        } else {
            panel.classList.add('hidden');
            panel.style.display = 'none';
        }
    }
};

// ៧. អាប់ដេតពេល DOM រួចរាល់
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { window.forceSetToday(); }, 300);
});


// ==========================================
// ០១. Utilities (មុខងារជំនួយទូទៅ)
// ==========================================
window.toKhmerNum = function(str) {
    if (str === null || str === undefined || str === "") return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
};

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

const styleBlock = `
    <style>
        /* 🔴 បង្កប់ Font ផ្ទាល់ចូលក្នុងកូដ (Base64 Embedded Font) 🔴 */
        @font-face {
            font-family: 'Tacteing';
            src: url('data:font/ttf;charset=utf-8;base64,AAEAAAAOAIAAAwBgT1MvMmo... (សូមជំនួសដោយកូដវែងដែលលោកគ្រូទទួលបានពី Transfonter) ...') format('truetype');
            font-weight: normal;
            font-style: normal;
        }

        @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Siemreap:wght@400;700&display=swap');
        
        @page { size: A4 portrait; margin: 10mm; }
        
        /* ...កូដ CSS ដទៃទៀតរក្សាដដែល... */
        
        .font-tacteing {
            font-family: 'Tacteing', 'Khmer OS Tacteing', sans-serif !important;
        }
    </style>
`;

// ==========================================
// មុខងារកំណត់រចនាសម្ព័ន្ធមុខវិជ្ជា និងពិន្ទុ (Schema Configuration)
// ==========================================
window.getScoreSchema = function(level, periodType, track = "sci") {
    // ----------------------------------------------------
    // ១. កម្រិតបឋមសិក្សា (Primary Level)
    // ----------------------------------------------------
    if (level === "primary") {
        return [
            {
                group: "ភាសាខ្មែរ",
                color: "#bfdbfe", // ពណ៌ខៀវខ្ចី
                subs: [
                    { name: "ស្តាប់", key: "k_listen", max: 10 },
                    { name: "សរសេរ", key: "k_write", max: 10 },
                    { name: "អាន", key: "k_read", max: 10 },
                    { name: "តែងសេចក្តី", key: "k_compose", max: 10 }
                ]
            },
            {
                group: "គណិតវិទ្យា",
                color: "#fecaca", // ពណ៌ផ្កាឈូកខ្ចី
                subs: [
                    { name: "ចំនួន", key: "m_num", max: 10 },
                    { name: "រង្វាស់រង្វាល់", key: "m_measure", max: 10 },
                    { name: "ធរណីមាត្រ", key: "m_geo", max: 10 },
                    { name: "ពីជគណិត", key: "m_alg", max: 10 },
                    { name: "ស្ថិតិ", key: "m_stat", max: 10 }
                ]
            },
            {
                group: "វិទ្យាសាស្ត្រ",
                color: "#bbf7d0", // ពណ៌បៃតងខ្ចី
                subs: [
                    { name: "រូបវិទ្យា", key: "s_phy", max: 10 },
                    { name: "គីមីវិទ្យា", key: "s_chem", max: 10 },
                    { name: "ជីវវិទ្យា", key: "s_bio", max: 10 },
                    { name: "ផែនដី-បរិស្ថាន", key: "s_earth", max: 10 }
                ]
            },
            {
                group: "សិក្សាសង្គម",
                color: "#fef08a", // ពណ៌លឿងខ្ចី
                subs: [
                    { name: "សីលធម៌-ពលរដ្ឋ", key: "ss_moral", max: 10 },
                    { name: "ភូមិវិទ្យា", key: "ss_geo", max: 10 },
                    { name: "ប្រវត្តិវិទ្យា", key: "ss_hist", max: 10 }
                ]
            },
            {
                group: "អប់រំកាយ",
                color: "#e9d5ff", // ពណ៌ស្វាយខ្ចី
                subs: [
                    { name: "អប់រំកាយ-កីឡា", key: "pe_sport", max: 10 },
                    { name: "សុខភាព", key: "pe_health", max: 10 }
                ]
            },
            {
                group: "បំណិនជីវិត",
                color: "#dbeafe", // ពណ៌ Indigo ខ្ចី
                key: "life_skill",
                max: 10
            },
            // 🔴 បានបន្ថែមមុខវិជ្ជាភាសាបរទេសនៅទីនេះ 🔴
            {
                group: "ភាសាបរទេស",
                color: "#f1f5f9", // ពណ៌ប្រផេះខ្ចី
                key: "foreign_lang", 
                max: 10
            }
        ];
    }
    
    // ----------------------------------------------------
    // ២. កម្រិតអនុវិទ្យាល័យ និងវិទ្យាល័យ (Secondary Level)
    // ----------------------------------------------------
    return [
        { group: "ភាសាខ្មែរ", key: "khmer", color: "#bfdbfe", max: 100 },
        { group: "សីលធម៌-ពលរដ្ឋ", key: "moral", color: "#fef08a", max: 50 },
        { group: "ប្រវត្តិវិទ្យា", key: "history", color: "#fef08a", max: 50 },
        { group: "ភូមិវិទ្យា", key: "geography", color: "#fef08a", max: 50 },
        { group: "គណិតវិទ្យា", key: "math", color: "#fecaca", max: 100 },
        { group: "រូបវិទ្យា", key: "physics", color: "#bbf7d0", max: 50 },
        { group: "គីមីវិទ្យា", key: "chemistry", color: "#bbf7d0", max: 50 },
        { group: "ជីវវិទ្យា", key: "biology", color: "#bbf7d0", max: 50 },
        { group: "ផែនដីវិទ្យា", key: "earth", color: "#bbf7d0", max: 50 },
        { group: "ភាសាបរទេស", key: "foreign_lang", color: "#f1f5f9", max: 50 }, // អនុវិទ្យាល័យ/វិទ្យាល័យ ក៏មានដែរ
        { group: "បច្ចេកវិទ្យា (ICT)", key: "tech", color: "#dbeafe", max: 50 },
        { group: "គេហវិទ្យា", key: "home_eco", color: "#e9d5ff", max: 50 },
        { group: "អប់រំសិល្បៈ", key: "art", color: "#e9d5ff", max: 50 },
        { group: "អប់រំកាយ", key: "sport", color: "#e9d5ff", max: 50 }
    ];
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

// =====================================================================
// បញ្ជីមុខវិជ្ជាផ្លូវការតាមកម្រិតថ្នាក់ (សម្រាប់ព្រឹត្តិបត្រ)
// =====================================================================
window.PRIMARY_STRUCTURED_SUBJECTS = [
  { no: 1, name: "ភាសាខ្មែរ", subs: [{ name: "សមត្ថភាពស្តាប់", key: "k_listen", max: 10, aliases: ["k_listen"] }, { name: "សមត្ថភាពសរសេរ", key: "k_write", max: 10, aliases: ["k_write"] }, { name: "សមត្ថភាពអាន", key: "k_read", max: 10, aliases: ["k_read"] }, { name: "សមត្ថភាពនិយាយ", key: "k_compose", max: 10, aliases: ["k_compose", "k_speak"] }] },
  { no: 2, name: "គណិតវិទ្យា", subs: [{ name: "ចំនួន", key: "m_num", max: 10, aliases: ["m_num"] }, { name: "រង្វាស់រង្វាល់", key: "m_measure", max: 10, aliases: ["m_measure", "m_meas"] }, { name: "ធរណីមាត្រ", key: "m_geo", max: 10, aliases: ["m_geo"] }, { name: "ពីជគណិត", key: "m_alg", max: 10, aliases: ["m_alg"] }, { name: "ស្ថិតិ", key: "m_stat", max: 10, aliases: ["m_stat"] }] },
  { no: 3, name: "វិទ្យាសាស្ត្រ", subs: [{ name: "រូបវិទ្យា", key: "s_phy", max: 10, aliases: ["s_phy"] }, { name: "គីមីវិទ្យា", key: "s_chem", max: 10, aliases: ["s_chem"] }, { name: "ជីវវិទ្យា", key: "s_bio", max: 10, aliases: ["s_bio"] }, { name: "ផែនដី-បរិស្ថានវិទ្យា", key: "s_earth", max: 10, aliases: ["s_earth"] }] },
  { no: 4, name: "សិក្សាសង្គម", subs: [{ name: "សីលធម៌-ពលរដ្ឋ", key: "ss_moral", max: 10, aliases: ["ss_moral"] }, { name: "ភូមិវិទ្យា", key: "ss_geo", max: 10, aliases: ["ss_geo"] }, { name: "ប្រវត្តិវិទ្យា", key: "ss_hist", max: 10, aliases: ["ss_hist"] }, { name: "គេហវិទ្យា-អប់រំសិល្បៈ", key: "pe_art", max: 10, aliases: ["pe_art", "pe_art"] }] },
  { no: 5, name: "អប់រំកាយ សុខភាព កីឡា", subs: [{ name: "អប់រំកាយ-កីឡា", key: "pe_sport", max: 10, aliases: ["pe_sport"] }, { name: "សុខភាព-អនាម័យ", key: "pe_health", max: 10, aliases: ["pe_health"] }] },
  { no: 6, name: "អប់រំបំណិនជីវិត", key: "life_skill", max: 10, aliases: ["life_skill"], subs: [] },
  { no: 7, name: "ភាសាបរទេស", key: "ls_lang", max: 10, aliases: ["ls_lang", "english", "ភាសាបរទេស", "អង់គ្លេស-បារាំង"], subs: [] }
];

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

// ==========================================
// ១. មុខងារគណនាមធ្យមភាគប្រចាំខែដោយស្វ័យប្រវត្តិ (ជួសជុលបញ្ហាការទាញទិន្នន័យ)
// ==========================================
window.calculateDynamicMonthlyAverage = function(studentId, semester) {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    const gradeClean = grade.replace(/\s+/g, ''); // លុបការដកឃ្លាដើម្បីកុំឱ្យ Error ពេលផ្ទៀងផ្ទាត់
    
    const config = JSON.parse(localStorage.getItem('semester_month_config_' + grade));
    if (!config) return 0;
    
    const targetMonths = semester === "s1" ? config.sem1 : config.sem2;
    if (!targetMonths || targetMonths.length === 0) return 0;

    let allScores = JSON.parse(localStorage.getItem('academic_scores')) || [];
    let totalScoreSum = 0;
    let countedMonths = 0;

    allScores.forEach(s => {
        let sGradeClean = String(s.grade || "").replace(/\s+/g, '');
        // ផ្ទៀងផ្ទាត់ ID, ប្រភេទជាប្រចាំខែ, ខែដែលបានគ្រីស និងឈ្មោះថ្នាក់
        if (String(s.student_id) === String(studentId) && s.period_type === "monthly" && targetMonths.includes(s.month) && sGradeClean === gradeClean) {
            if (parseFloat(s.average) > 0) {
                totalScoreSum += parseFloat(s.average);
                countedMonths++;
            }
        }
    });

    if (countedMonths === 0) return 0;
    return (totalScoreSum / countedMonths).toFixed(2);
};

// ==========================================
// មុខងារ "គណនា" (កែសម្រួលឱ្យដើររលូន ១០០%)
// ==========================================

// ១. មុខងារគណនា និងផ្តល់និទ្ទេស (ស្នូល)
window.calculateSectionScore = function(id, suffix, schoolLevel) {
    let totalScore = 0, overallMax = 0, divisorCount = 0; 
    let hasFail = false;

    window.activeSchema.forEach(item => {
        let groupScore = 0, groupMax = 0, groupHasInput = false;
        
        const processInput = (key, maxVal) => {
            const inputId = suffix ? `${key}_${suffix}_${id}` : `${key}_${id}`;
            const inputEl = document.getElementById(inputId);
            
            if (inputEl) {
                const valStr = inputEl.value.trim();
                if (valStr !== "" && !isNaN(parseFloat(valStr))) {
                    const val = parseFloat(valStr);
                    // ប្តូរពណ៌ក្រហមបើធ្លាក់កន្លះភាគ
                    if (val < maxVal / 2) { 
                        inputEl.classList.add("text-rose-600"); 
                        inputEl.classList.remove("text-slate-800"); 
                        hasFail = true;
                    } else { 
                        inputEl.classList.remove("text-rose-600"); 
                        inputEl.classList.add("text-slate-800"); 
                    }
                    groupScore += val; 
                    groupMax += maxVal; 
                    groupHasInput = true;
                    if (schoolLevel === "primary") divisorCount++;
                } else { 
                    inputEl.classList.remove("text-rose-600", "text-slate-800"); 
                }
            }
        };
        
        if (item.subs && item.subs.length > 0) {
            item.subs.forEach(s => processInput(s.key, window.schemaMaxMap[s.key] || 10));
        } else {
            processInput(item.key, window.schemaMaxMap[item.key] || 10);
        }

        if (groupHasInput) {
            totalScore += groupScore; 
            overallMax += groupMax;
            if (schoolLevel !== "primary") divisorCount++;
        }
    });

    const examAvg = divisorCount > 0 ? (totalScore / divisorCount) : 0;
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    let finalAvgToGrade = examAvg;
    
    if (type === "semester") { 
        // 🟢 ១. គណនាឆមាស៖ យកពិន្ទុប្រឡង និងមធ្យមខែ មកបូកចែក ២ 🟢
        const autoMonthlyAvg = parseFloat(window.calculateDynamicMonthlyAverage(id, suffix));
        const monthlyAvgInput = document.getElementById(`monthly_avg_${id}`);
        
        if (monthlyAvgInput) {
            // បើអត់ទាន់មានតម្លៃក្នុងប្រអប់ទេ រុញតម្លៃដែលប្រព័ន្ធទាញបានចូល
            if (!monthlyAvgInput.value && autoMonthlyAvg > 0) {
                monthlyAvgInput.value = autoMonthlyAvg.toFixed(2);
            }
            
            const monthlyAvgStr = monthlyAvgInput.value.trim();
            if (monthlyAvgStr !== "" && !isNaN(parseFloat(monthlyAvgStr))) {
                const monthlyAvg = parseFloat(monthlyAvgStr);
                finalAvgToGrade = (examAvg + monthlyAvg) / 2; // រូបមន្តឆមាស
            }
        }

        // បញ្ចូលទិន្នន័យទៅក្នុងតារាង
        const totExEl = document.getElementById(`total_exam_${id}`);
        if (totExEl) totExEl.textContent = divisorCount > 0 ? totalScore.toFixed(2) : '';
        
        const avgExEl = document.getElementById(`avg_exam_${id}`);
        if (avgExEl) avgExEl.textContent = divisorCount > 0 ? examAvg.toFixed(2) : '';
        
        const avgDomEl = document.getElementById(`avg_${id}`);
        if (avgDomEl) {
            avgDomEl.textContent = divisorCount > 0 ? finalAvgToGrade.toFixed(2) : '';
            avgDomEl.className = `p-1 border-r border-slate-300 print:border-black text-center font-black bg-emerald-50 font-mono text-[14px] ${finalAvgToGrade >= 5 ? 'text-emerald-700' : 'text-rose-600'}`;
        }

    } else if (type === "annual") {
        const totalEl = document.getElementById(`total_${suffix}_${id}`);
        if (totalEl) totalEl.textContent = divisorCount > 0 ? totalScore.toFixed(2) : '';
        const avgDomEl = document.getElementById(`avg_${suffix}_${id}`);
        if (avgDomEl) avgDomEl.textContent = divisorCount > 0 ? finalAvgToGrade.toFixed(2) : '';
    } else {
        const totalEl = document.getElementById(`total_${id}`);
        if (totalEl) totalEl.textContent = divisorCount > 0 ? totalScore.toFixed(2) : '';
        const avgDomEl = document.getElementById(`avg_${id}`);
        if (avgDomEl) {
            avgDomEl.textContent = divisorCount > 0 ? finalAvgToGrade.toFixed(2) : '';
            avgDomEl.className = `p-1 border-r border-slate-300 print:border-black text-center font-bold bg-blue-50 font-mono text-[13px] ${finalAvgToGrade >= 5 ? 'text-blue-700' : 'text-rose-600'}`;
        }
    }

    // 🟢 ២. គណនានិទ្ទេស (Grade Letter) 🟢
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


// ៣. មុខងារបញ្ជាពេលចុចប៊ូតុង "គណនា" (Calculate All)
window.calculateAllScores = function() { 
    if(!window.scoresStudentList || window.scoresStudentList.length === 0) return;
    window.scoresStudentList.forEach(s => window.calculateStudentScore(s.id)); 
    window.updateRanksInMemory(); 
};

// ៣. មុខងារគណនាពិន្ទុបុគ្គល (រូបមន្តឆមាសច្បាស់លាស់)
window.calculateStudentScore = function(stuId) {
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";

    let total = 0;
    let count = 0;
    let hasFail = false;

    // បូកពិន្ទុមុខវិជ្ជា
    window.activeSubjectKeys.forEach(key => {
        let inId = `${key}_${stuId}`;
        if (type === "annual") inId = `${key}_s2_${stuId}`;
        else if (type === "semester") inId = `${key}_${month.includes("២") ? "s2" : "s1"}_${stuId}`;

        const el = document.getElementById(inId);
        if (el && el.value !== "") {
            let val = parseFloat(el.value);
            if(!isNaN(val)){
                total += val;
                count++;
                const maxVal = window.schemaMaxMap[key] || 10;
                if (val < maxVal / 2) hasFail = true;
            }
        }
    });

    if (type === "semester") {
        let examAvg = count > 0 ? (total / count) : 0;
        let elTotalExam = document.getElementById(`total_exam_${stuId}`);
        let elAvgExam = document.getElementById(`avg_exam_${stuId}`);
        if (elTotalExam) elTotalExam.textContent = count > 0 ? total.toFixed(2).replace('.00','') : '';
        if (elAvgExam) elAvgExam.textContent = count > 0 ? examAvg.toFixed(2) : '';

        // 🟢 ទាញយកតម្លៃមធ្យមភាគប្រចាំខែ ដែលមានក្នុងប្រអប់ 🟢
        let mAvgInput = document.getElementById(`monthly_avg_${stuId}`);
        let mAvg = 0;
        if(mAvgInput && mAvgInput.value !== ""){
            mAvg = parseFloat(mAvgInput.value);
        }

        // 🟢 រូបមន្តគណនាឆមាស 🟢
        let semAvg = 0;
        if (mAvg > 0 && examAvg > 0) {
            semAvg = (examAvg + mAvg) / 2; // បើមានទាំង២ ចែក២
        } else if (examAvg > 0) {
            semAvg = examAvg; // បើមានតែប្រឡង យកពិន្ទុប្រឡង
        } else if (mAvg > 0) {
            semAvg = mAvg;
        }

        // បង្ហាញលទ្ធផលឆមាស
        let elSemAvg = document.getElementById(`avg_${stuId}`);
        if (elSemAvg) {
            elSemAvg.textContent = semAvg > 0 ? semAvg.toFixed(2) : '';
            elSemAvg.className = `p-1 border-r border-slate-300 print:border-black text-center font-black bg-emerald-50 font-mono text-[14px] ${semAvg >= 5 ? 'text-emerald-700' : 'text-rose-600'}`;
        }

        // និទ្ទេស
        let elGrade = document.getElementById(`grade_${stuId}`);
        if (elGrade) {
            elGrade.textContent = semAvg > 0 ? window.getGradeLetter(semAvg, hasFail) : '';
        }
    } else {
        // រូបមន្តប្រចាំខែ ឬ ប្រចាំឆ្នាំធម្មតា
        let avg = count > 0 ? (total / count) : 0;
        let elTotal = document.getElementById(`total_${stuId}`);
        let elAvg = document.getElementById(`avg_${stuId}`);
        if (elTotal) elTotal.textContent = count > 0 ? total.toFixed(2).replace('.00','') : '';
        if (elAvg) {
            elAvg.textContent = count > 0 ? avg.toFixed(2) : '';
            elAvg.className = `p-1 border-r border-slate-300 print:border-black text-center font-bold bg-blue-50 font-mono text-[13px] ${avg >= 5 ? 'text-blue-700' : 'text-rose-600'}`;
        }
        
        let elGrade = document.getElementById(`grade_${stuId}`);
        if (elGrade) elGrade.textContent = avg > 0 ? window.getGradeLetter(avg, hasFail) : '';
    }
};
// ==========================================
// ០៣. បង្ហាញអេក្រង់មេ (បង្ហាញប៊ូតុងកំណត់ខែឆមាសជានិច្ច)
// ==========================================
window.loadScoresView = async function() {
    const container = document.getElementById("scores") || document.getElementById("mainContentArea");
    if (!container) return;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = sInfo.teacher_room || "«ក»";
    const gradeFull = `${levelStr} ${roomStr}`;

    container.className = "flex flex-col flex-1 w-full h-full bg-slate-50/50 transition duration-300 min-h-0 relative";
    container.innerHTML = `
      <style>
          .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
          .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; font-weight: 500; }
          .font-Bokor { font-family: 'Khmer OS Bokor', sans-serif; }
          .header-vertical { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; padding: 8px 0; }
          
          /* Modern Inputs & Scrollbars */
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          
          input[type=number].modern-input::-webkit-inner-spin-button, 
          input[type=number].modern-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number].modern-input { -moz-appearance: textfield; }

          /* Smooth Animations */
          @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-5px); }
              100% { transform: translateY(0px); }
          }
          .animate-float { animation: float 4s ease-in-out infinite; }
          
          /* Dashboard Background Ornaments */
          .bg-ornament {
              position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.4; pointer-events: none;
          }
      </style>
      
      <!-- Decorative Background Elements -->
      <div class="bg-ornament w-96 h-96 bg-blue-400/20 top-[-10%] left-[-5%]"></div>
      <div class="bg-ornament w-[500px] h-[500px] bg-amber-300/10 bottom-[-20%] right-[-10%]"></div>

      <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
          <div class="animate-fade-in custom-mixed-font flex flex-col font-siemreap max-w-[1600px] mx-auto pb-16 px-4 lg:px-8 pt-6 min-h-full">
            
            <!-- 🌟 ក្បាល Dashboard ខាងក្រៅ (Modern Glass Header) 🌟 -->
            <div class="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-visible mb-8 shrink-0 transition-all">
              
              <div class="relative z-10 flex items-center gap-4">
                <div class="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30 animate-float">
                  <i class="fa-solid fa-star-half-stroke"></i>
                </div>
                <div>
                    <h2 class="text-xl md:text-2xl font-moul text-slate-800 tracking-wide">គ្រប់គ្រងពិន្ទុ និងលទ្ធផលសិក្សា</h2>
                    <p class="text-slate-500 text-sm mt-1.5 font-siemreap">គ្រប់គ្រងពិន្ទុសម្រាប់ថ្នាក់៖ <strong class="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 ml-1">${gradeFull}</strong></p>
                </div>
              </div>
              
              <!-- Toolbar Settings -->
              <div class="flex flex-wrap items-center gap-3 relative z-10 w-full 2xl:w-auto bg-slate-100/50 p-2 md:p-3 rounded-3xl border border-slate-200/60 backdrop-blur-sm">
                <input type="hidden" id="globalLevelSelect" value="${levelStr}">
                <input type="hidden" id="globalRoomSelect" value="${roomStr}">
                <!-- Period Selector Dropdown -->
                <div class="flex items-center gap-3 bg-white border border-slate-200/100 rounded-2xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow flex-1 sm:flex-none">
                   <div class="w-5 h-7 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                       <i class="fa-solid fa-calendar-days text-xs"></i>
                   </div>
                   <select id="globalPeriodType" onchange="window.updateGlobalPeriod(); window.updateGlobalSettings();" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer font-siemreap">
                      <option value="monthly">ប្រចាំខែ</option>
                      <option value="semester">ប្រចាំឆមាស</option>
                      <option value="annual">ប្រចាំឆ្នាំ</option>
                   </select>
                   <div class="w-px h-4 bg-slate-300 mx-1"></div>
                   <select id="globalPeriodValue" onchange="window.updateGlobalSettings()" class="border-none bg-transparent text-xs font-bold text-rose-600 outline-none cursor-pointer font-siemreap"></select>
                </div>

                <!-- Action Buttons in Toolbar -->
                <button id="btnGlobalSemesterConfig" onclick="window.openSemesterConfig()" class="flex px-4 py-2.5 bg-white hover:bg-purple-50 text-purple-600 border border-slate-200/80 hover:border-purple-200 rounded-2xl text-xs font-bold transition-all duration-300 items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 flex-1 sm:flex-none group">
                  <i class="fa-solid fa-sliders group-hover:rotate-90 transition-transform duration-300"></i> កំណត់ខែឆមាស
                </button>
                
                <!-- 🟢 ប៊ូតុងកាលបរិច្ឆេទ 🟢 -->
                <button type="button" onclick="window.toggleSharedDatePanel()" class="flex px-4 py-2 bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-200 rounded-xl text-xs font-bold transition-all items-center gap-2 shadow-sm">
                    <i class="fa-solid fa-calendar-day"></i> កំណត់កាលបរិច្ឆេទ
                </button>

                <!-- 🟢 កន្លែងបង្ហាញផ្ទាំងកំណត់កាលបរិច្ឆេទ (Date Panel Container) 🟢 -->
                <!-- ដោយសារ Pop-up ប្រើ fixed inset-0 ទោះ Container នេះនៅទីណាក៏វាលោតពេញអេក្រង់ដែរ -->
                <div id="scoreEntryDatePanelContainer" class="w-full no-print">
                    ${typeof window.getDateSettingsPanelHTML === 'function' ? window.getDateSettingsPanelHTML('scoreEntry') : ''}
                </div>

                <div class="w-full">
                  ${window.getDateSettingsPanelHTML ? window.getDateSettingsPanelHTML('rankings') : ''}
                </div>
                
              </div>
            </div>

            <!-- 🌟 CARDS GRID (Modern Premium Cards) 🌟 -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-8 flex-1 no-print">
              
              <!-- Card 1: បញ្ចូលពិន្ទុ -->
              <div onclick="window.openScoreModal('modal-entry', window.renderScoreEntryContent)" class="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(59,130,246,0.1)] hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white group flex flex-col justify-center items-center text-center relative overflow-hidden h-[260px]">
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-blue-500/30 relative z-10">
                      <i class="fa-solid fa-keyboard"></i>
                  </div>
                  <h3 class="font-moul text-lg text-slate-800 mb-2 relative z-10 group-hover:text-blue-700 transition-colors">បញ្ចូលពិន្ទុ</h3>
                  <p class="text-slate-500 text-sm font-siemreap px-2 relative z-10">បញ្ជីស្រង់ពិន្ទុ គណនាមធ្យមភាគ និងវាយតម្លៃលទ្ធផលសិស្ស។</p>
              </div>

              <!-- Card 2: តារាងចំណាត់ថ្នាក់ -->
              <div onclick="window.openScoreModal('modal-rankings', window.renderRankingsContent)" class="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(244,63,94,0.1)] hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white group flex flex-col justify-center items-center text-center relative overflow-hidden h-[260px]">
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="w-20 h-20 bg-gradient-to-br from-rose-400 to-rose-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-lg shadow-rose-500/30 relative z-10">
                      <i class="fa-solid fa-ranking-star"></i>
                  </div>
                  <h3 class="font-moul text-lg text-slate-800 mb-2 relative z-10 group-hover:text-rose-600 transition-colors">តារាងចំណាត់ថ្នាក់</h3>
                  <p class="text-slate-500 text-sm font-siemreap px-2 relative z-10">តារាងសរុបចំណាត់ថ្នាក់ ស្ថិតិ និងអាច Export ទៅជា Excel បាន។</p>
              </div>

              <!-- Card 3: ព្រឹត្តិបត្រពិន្ទុ -->
              <div onclick="window.openScoreModal('modal-reportcards', window.renderReportCardsContent)" class="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(99,102,241,0.1)] hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white group flex flex-col justify-center items-center text-center relative overflow-hidden h-[260px]">
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/30 relative z-10">
                      <i class="fa-solid fa-file-invoice"></i>
                  </div>
                  <h3 class="font-moul text-lg text-slate-800 mb-2 relative z-10 group-hover:text-indigo-600 transition-colors">ព្រឹត្តិបត្រពិន្ទុ</h3>
                  <p class="text-slate-500 text-sm font-siemreap px-2 relative z-10">សៀវភៅតាមដានការសិក្សាបុគ្គល សម្រាប់ផ្ញើជូនមាតាបិតា។</p>
              </div>

              <!-- Card 4: តារាងកិត្តិយស -->
              <div onclick="window.openScoreModal('modal-honorboard', window.renderHonorBoardContent)" class="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(245,158,11,0.1)] hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white group flex flex-col justify-center items-center text-center relative overflow-hidden h-[260px]">
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[1.5rem] flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/30 relative z-10">
                      <i class="fa-solid fa-crown"></i>
                  </div>
                  <h3 class="font-moul text-lg text-slate-800 mb-2 relative z-10 group-hover:text-amber-600 transition-colors">តារាងកិត្តិយស</h3>
                  <p class="text-slate-500 text-sm font-siemreap px-2 relative z-10">ប័ណ្ណសរសើរសម្រាប់សិស្សឆ្នើមប្រចាំខែ និងឆមាស។</p>
              </div>
            </div>
          </div>
      </div>

      <!-- ========================================= -->
      <!-- MODALS SECTION (All Redesigned & Animated)-->
      <!-- ========================================= -->

      <!-- 🟢 Modal ទី១៖ បញ្ចូលពិន្ទុ (SCORE ENTRY) -->
      <div id="modal-entry" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 backdrop-blur-md p-3 md:p-6 transition-all duration-300 font-siemreap">
          <div id="modal-entry-container" class="bg-slate-50 w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
              
              <div class="bg-white/90 backdrop-blur-xl p-4 md:p-5 border-b border-slate-200/60 flex flex-col xl:flex-row justify-between items-center gap-4 shrink-0 shadow-sm z-20">
                  <div class="flex items-center w-full xl:w-auto gap-4">
                      <button onclick="window.closeScoreModal('modal-entry')" class="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-all duration-200 shrink-0 shadow-sm hover:shadow-md active:scale-90"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-[14px] bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20"><i class="fa-solid fa-keyboard text-sm"></i></div>
                          <h2 class="font-moul text-lg text-slate-800 hidden md:block shrink-0">បញ្ជីស្រង់ពិន្ទុ</h2>
                      </div>
                      
                      <div class="relative flex-1 md:w-64 md:flex-none xl:ml-4">
                          <span class="absolute left-3.5 top-2.5 text-slate-400"><i class="fa-solid fa-magnifying-glass text-sm"></i></span>
                          <input type="text" id="scoreSearchInput" oninput="window.filterScoreTable()" placeholder="ស្វែងរកសិស្ស..." class="pl-10 pr-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none w-full transition-all duration-200 shadow-inner">
                      </div>
                  </div>
                  
                  <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 w-full xl:w-auto">
                      <button onclick="window.openMobileScoreModal(0)" class="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:text-amber-600 rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2 shrink-0"><i class="fa-solid fa-bolt text-amber-500"></i> បញ្ចូលរហ័ស</button>
                      
                      <button onclick="window.exportScoreEntryToExcel()" class="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2 shrink-0">
                          <i class="fa-solid fa-file-excel text-emerald-500 text-[15px]"></i> Export Excel
                      </button>
                      
                      <div class="w-px h-6 bg-slate-200 mx-1 hidden md:block shrink-0"></div>
                      
                      <button onclick="window.openImportExcelModal()" class="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 hover:border-cyan-300 hover:text-cyan-600 rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2 shrink-0"><i class="fa-solid fa-file-import text-cyan-500"></i> Import</button>
                      <button onclick="window.printScoreList()" class="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2 shrink-0"><i class="fa-solid fa-print text-emerald-500"></i> បោះពុម្ព</button>
                      
                      <div class="w-px h-6 bg-slate-200 mx-1 hidden md:block shrink-0"></div>
                      
                      <button onclick="window.calculateAllScores()" class="px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 shrink-0"><i class="fa-solid fa-calculator"></i> គណនា</button>
                      <button onclick="window.autoRankStudents()" class="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 shrink-0"><i class="fa-solid fa-ranking-star"></i> ចំណាត់ថ្នាក់</button>
                      
                      <button onclick="window.saveScoresData()" id="btnSaveScores" class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/30 hover:shadow-lg transition-all duration-200 flex items-center gap-2 shrink-0 active:scale-95 border border-blue-500/50"><i class="fa-solid fa-cloud-arrow-up text-[14px]"></i> រក្សាទុក</button>
                  </div>
              </div>
              <div id="modal-content-entry" class="flex-1 overflow-hidden flex flex-col relative bg-slate-50/50"></div>
          </div>
      </div>

      <!-- 🔴 Modal ទី២៖ តារាងចំណាត់ថ្នាក់ (RANKINGS) -->
      <div id="modal-rankings" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 backdrop-blur-md p-3 md:p-6 transition-all duration-300 font-siemreap">
          <div id="modal-rankings-container" class="bg-slate-50 w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
              <div class="bg-white/90 backdrop-blur-xl p-4 md:p-5 border-b border-slate-200/60 flex flex-col xl:flex-row justify-between items-center gap-4 shrink-0 shadow-sm z-20">
                  <div class="flex items-center gap-4 w-full xl:w-auto">
                      <button onclick="window.closeScoreModal('modal-rankings')" class="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-90 shrink-0"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-[14px] bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20"><i class="fa-solid fa-ranking-star text-sm"></i></div>
                          <h2 class="font-moul text-lg text-slate-800">តារាងចំណាត់ថ្នាក់</h2>
                      </div>
                      <div class="hidden md:flex items-center gap-2 ml-4">
                          <p class="text-[12px] font-bold text-slate-500 mt-0.5">ថ្នាក់រៀន ៖ <span id="lblRankGradeName" class="text-rose-600">${gradeFull}</span></p>
                      </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
                    <!-- ទម្រង់តារាង -->
                    <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
                        <button onclick="window.changeRankViewMode('full')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${window.rankingsViewMode==='full'?'bg-indigo-50 text-indigo-700':'text-slate-500 hover:text-slate-700'}">
                            <i class="fa-solid fa-table-list"></i> តារាងទូទៅ
                        </button>
                    </div>

                    <!-- ស្វែងរក និងចម្រោះ -->
                    <div class="relative shadow-sm shrink-0">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input type="text" placeholder="ស្វែងរកឈ្មោះ..." value="${window.rankingsSearchQuery}" oninput="window.filterRankingsTable(this.value, window.rankingsGenderFilter)"
                                class="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none w-36 sm:w-44 focus:ring-2 focus:ring-indigo-500 transition">
                    </div>

                    <select onchange="window.filterRankingsTable(window.rankingsSearchQuery, this.value)" class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer focus:ring-2 focus:ring-indigo-500 transition shrink-0">
                        <option value="all" ${window.rankingsGenderFilter==='all'?'selected':''}>👥 ភេទទាំងអស់</option>
                        <option value="ស្រី" ${window.rankingsGenderFilter==='ស្រី'?'selected':''}>👩 សិស្សស្រី</option>
                        <option value="ប្រុស" ${window.rankingsGenderFilter==='ប្រុស'?'selected':''}>👨 សិស្សប្រុស</option>
                    </select>

                    <!-- ប៊ូតុង Export -->
                    <button onclick="window.exportRankingsToExcel()" class="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5 shrink-0">
                        <i class="fa-solid fa-file-excel"></i> Export Excel
                    </button>
                    <button onclick="window.printRankingTable()" class="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-200 transition flex items-center gap-2 transform hover:-translate-y-0.5 shrink-0">
                        <i class="fa-solid fa-file-pdf"></i> PDF / Print
                    </button>
                  </div>
              </div>
              
              <div id="modal-content-rankings" class="flex-1 overflow-auto bg-slate-100/30 p-2 md:p-6 custom-scrollbar"></div>
          </div>
      </div>

      <!-- 🟣 Modal ទី៣៖ ព្រឹត្តិបត្រពិន្ទុ (REPORT CARDS) -->
      <div id="modal-reportcards" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 backdrop-blur-md p-3 md:p-6 transition-all duration-300 font-siemreap">
          <div id="modal-reportcards-container" class="bg-slate-50 w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
              <div class="bg-white/90 backdrop-blur-xl p-4 md:p-5 border-b border-slate-200/60 flex flex-wrap justify-between items-center gap-4 shrink-0 shadow-sm z-20">
                  <div class="flex items-center gap-4">
                      <button onclick="window.closeScoreModal('modal-reportcards')" class="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-90"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20"><i class="fa-solid fa-file-invoice text-sm"></i></div>
                          <h2 class="font-moul text-lg text-slate-800">សៀវភៅតាមដានការសិក្សា</h2>
                      </div>
                  </div>
                  <div class="flex items-center gap-3 overflow-x-auto w-full md:w-auto">
                      <button onclick="window.printReportCards()" class="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-xs transition-all flex items-center gap-2 border border-slate-200 shadow-sm active:scale-95"><i class="fa-solid fa-print text-emerald-500"></i> បោះពុម្ព</button>
                      <button onclick="window.exportReportCardsToExcel()" class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-bold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-md shadow-emerald-500/30 active:scale-95 border border-emerald-500/50"><i class="fa-solid fa-file-excel text-[14px]"></i> ទាញយក Excel</button>
                  </div>
              </div>
              <div id="modal-content-reportcards" class="flex-1 overflow-auto bg-slate-200/40 p-0 relative shadow-inner custom-scrollbar"></div>
          </div>
      </div>

      <!-- 🟠 Modal ទី៤៖ តារាងកិត្តិយស (HONOR BOARD) -->
      <div id="modal-honorboard" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 backdrop-blur-md p-3 md:p-6 transition-all duration-300 font-siemreap">
          <div id="modal-honorboard-container" class="bg-slate-50 w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
              <div class="bg-white/90 backdrop-blur-xl p-4 md:p-5 border-b border-slate-200/60 flex justify-between items-center shrink-0 shadow-sm z-20">
                  <div class="flex items-center gap-4">
                      <button onclick="window.closeScoreModal('modal-honorboard')" class="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-90"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-[14px] bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20"><i class="fa-solid fa-crown text-sm"></i></div>
                          <h2 class="font-moul text-lg text-slate-800">តារាងកិត្តិយស (Honor Board)</h2>
                      </div>
                  </div>
              </div>
              <div id="modal-content-honorboard" class="flex-1 overflow-auto bg-slate-100/50 p-4 md:p-6 custom-scrollbar"></div>
          </div>
      </div>
    `;

    // អនុគមន៍សម្រាប់បើក និងបិទ Modal ដោយមាន Animation ត្រឹមត្រូវ
const originalOpenModal = window.openScoreModal || function(id){ document.getElementById(id).classList.remove('hidden'); };
window.openScoreModal = function(id, callback) {
    originalOpenModal(id, callback);
    const modalContainer = document.getElementById(id + '-container');
    if(modalContainer) {
        // Delay បន្តិចដើម្បីអោយ CSS Transition ដើរ
        setTimeout(() => modalContainer.setAttribute('data-open', 'true'), 10);
    }
};

const originalCloseModal = window.closeScoreModal || function(id){ document.getElementById(id).classList.add('hidden'); };
window.closeScoreModal = function(id) {
    const modalContainer = document.getElementById(id + '-container');
    if(modalContainer) {
        // ដក Attribute ចេញដើម្បីឱ្យវារួមតូចវិញ
        modalContainer.removeAttribute('data-open');
        // រង់ចាំរហូតដល់ Animation ចប់ ទើបលាក់ Modal ទាំងមូល
        setTimeout(() => originalCloseModal(id), 200); 
    } else {
        originalCloseModal(id);
    }
};

// ដំណើរការមុខងារទូទៅពេល Load
if(typeof window.updateGlobalPeriod === 'function') window.updateGlobalPeriod();
if(typeof window.toggleTrackSelect === 'function') window.toggleTrackSelect();
if(typeof window.renderScoreEntryContent === 'function') window.renderScoreEntryContent();

    
    window.updateGlobalPeriod();
    window.toggleTrackSelect();
    await window.renderScoreEntryContent(); 
};

window.initExcelLikeSelection = function() {
    const container = document.getElementById('modal-content-entry');
    if (!container) return;

    let isDragging = false;
    let startCell = { row: -1, col: -1 };
    
    // បង្កើត Event Listener តែម្តងគត់ (ការពារការកោះហៅជាន់គ្នា)
    if (container.dataset.selectionInitialized === 'true') return;
    container.dataset.selectionInitialized = 'true';

    // ជំនួយការ៖ ស្វែងរកទីតាំង Row និង Col របស់ Input
    function getCellCoords(inputElem) {
        const tr = inputElem.closest('tr');
        if (!tr) return null;
        const allRows = Array.from(tr.closest('tbody').querySelectorAll('tr'));
        const rowIdx = allRows.indexOf(tr);
        
        const allInputsInRow = Array.from(tr.querySelectorAll('input[type="number"]'));
        const colIdx = allInputsInRow.indexOf(inputElem);
        
        return { row: rowIdx, col: colIdx, tbody: tr.closest('tbody') };
    }

    // ជំនួយការ៖ លុបពណ៌ Select ទាំងអស់
    function clearSelection() {
        container.querySelectorAll('.cell-selected').forEach(el => {
            el.classList.remove('cell-selected');
        });
    }

    // ជំនួយការ៖ ដាក់ពណ៌ Select ជាចង្កោម (Range)
    function selectRange(start, end, tbody) {
        clearSelection();
        if (!tbody) return;
        
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);

        const rows = tbody.querySelectorAll('tr');
        for (let r = minRow; r <= maxRow; r++) {
            if (!rows[r]) continue;
            const inputs = rows[r].querySelectorAll('input[type="number"]');
            for (let c = minCol; c <= maxCol; c++) {
                if (inputs[c]) {
                    inputs[c].classList.add('cell-selected');
                }
            }
        }
    }

    // ១. ចាប់ផ្តើមចុចម៉ៅស៍ (Mousedown)
    container.addEventListener('mousedown', function(e) {
        if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'number') {
            isDragging = true;
            container.classList.add('no-text-select'); // កុំឱ្យជាប់ Highlight អក្សរ
            
            const coords = getCellCoords(e.target);
            if (coords) {
                startCell = coords;
                clearSelection();
                e.target.classList.add('cell-selected');
            }
        } else {
            clearSelection(); // ចុចកន្លែងផ្សេង លុបការ Select
        }
    });

    // ២. អូសម៉ៅស៍ (Mouseover)
    container.addEventListener('mouseover', function(e) {
        if (isDragging && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'number') {
            const currentCell = getCellCoords(e.target);
            if (currentCell && currentCell.tbody === startCell.tbody) {
                selectRange(startCell, currentCell, startCell.tbody);
            }
        }
    });

    // ៣. ប្រលែងម៉ៅស៍ (Mouseup) គ្រប់ទីកន្លែង
    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            container.classList.remove('no-text-select');
        }
    });

    // ៤. ចុចប៊ូតុង Delete ឬ Backspace ដើម្បីលុបពិន្ទុទាំងអស់ដែលបាន Select
    container.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedCells = container.querySelectorAll('.cell-selected');
            if (selectedCells.length > 1) { // ឱ្យដើរតែករណី Select ច្រើន
                e.preventDefault();
                selectedCells.forEach(input => {
                    input.value = ''; // លុបទិន្នន័យ
                    // ហៅ Event Input ដើម្បិឱ្យកូដគណនាពិន្ទុដើរ (បើមាន)
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
        }
    });
};

// ==========================================
// មុខងារត្រួតពិនិត្យការបង្ហាញ/លាក់ (ធ្វើឱ្យប៊ូតុងបង្ហាញជានិច្ច)
// ==========================================
window.updateGlobalPeriod = function() {
  const type = document.getElementById("globalPeriodType")?.value;
  const valSelect = document.getElementById("globalPeriodValue");
  
  const btnGlobalSemConfig = document.getElementById("btnGlobalSemesterConfig"); 
  const btnInnerSemConfig = document.getElementById("btnInnerSemesterConfig");
  
  if (!valSelect) return;
  
  // 🟢 បង្ហាញប៊ូតុងកំណត់ខែឆមាស ជានិច្ច ដើម្បីការពារការភាន់ច្រឡំបាត់ប៊ូតុង
  if(btnGlobalSemConfig) { btnGlobalSemConfig.classList.remove("hidden"); btnGlobalSemConfig.classList.add("flex"); }
  if(btnInnerSemConfig) { btnInnerSemConfig.classList.remove("hidden"); btnInnerSemConfig.classList.add("flex"); }
  
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

// ទាញតម្លៃ និងរៀបចំណាត់ថ្នាក់
window.updateRanksInMemory = function() {
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    let studentAvgs = [];

    window.scoresStudentList.forEach(s => {
        let avgId = type === "annual" ? `avg_annual_${s.id}` : `avg_${s.id}`;
        let avgEl = document.getElementById(avgId);
        let avg = avgEl ? parseFloat(avgEl.textContent) : 0;
        if (isNaN(avg)) avg = 0;
        
        let gradeId = type === "annual" ? `grade_annual_${s.id}` : `grade_${s.id}`;
        let gradeEl = document.getElementById(gradeId);
        let gradeLetter = gradeEl ? gradeEl.textContent : "-";

        let examAvg = 0, monthlyAvg = 0, s1Avg = 0, s2Avg = 0, tScore = 0, tExam = 0;
        if (type === "semester") {
            tExam = parseFloat(document.getElementById(`total_exam_${s.id}`)?.textContent) || 0;
            examAvg = parseFloat(document.getElementById(`avg_exam_${s.id}`)?.textContent) || 0;
            monthlyAvg = parseFloat(document.getElementById(`monthly_avg_${s.id}`)?.value) || 0;
        } else if (type === "annual") {
            s1Avg = parseFloat(document.getElementById(`avg_s1_${s.id}`)?.textContent) || 0;
            s2Avg = parseFloat(document.getElementById(`avg_s2_${s.id}`)?.textContent) || 0;
        } else {
            tScore = parseFloat(document.getElementById(`total_${s.id}`)?.textContent) || 0;
        }

        let fullStuObj = { ...s, avg: avg, gradeLetter: gradeLetter, exam_avg: examAvg, monthly_avg: monthlyAvg, sem1_avg: s1Avg, sem2_avg: s2Avg, total_score: tScore, total_exam: tExam };
        
        // ទាញពិន្ទុតាមមុខវិជ្ជា
        window.activeSubjectKeys.forEach(k => {
            let inId = `${k}_${s.id}`;
            if (type === "annual") inId = `${k}_s2_${s.id}`;
            else if (type === "semester") inId = `${k}_${month.includes("២") ? "s2" : "s1"}_${s.id}`;
            let inEl = document.getElementById(inId);
            if(inEl) fullStuObj[k] = inEl.value;
        });

        studentAvgs.push(fullStuObj);
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

// រក្សាទុក
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

        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof apiPost === 'function') {
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
// ០៥. មុខងារ Pop-up កំណត់ខែសម្រាប់មធ្យមភាគ (Settings)
// ==========================================
window.openSemesterConfig = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    
    const defaultSettings = {
        sem1: ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"],
        sem2: ["ឧសភា", "មិថុនា", "កក្កដា"]
    };
    const savedConfig = JSON.parse(localStorage.getItem('semester_month_config_' + grade)) || defaultSettings;
    const allMonths = ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា"];

    let modalHtml = `
      <div id="semesterConfigModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-4 font-siemreap transition-all" style="z-index: 999999;">
        <div class="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-3xl overflow-hidden flex flex-col transform transition-all scale-100 border border-slate-200">
            <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 sm:p-5 flex justify-between items-center shadow-md">
                <h3 class="font-moul text-white text-sm sm:text-base drop-shadow-md flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fa-solid fa-sliders"></i></div>
                    កំណត់ខែគណនាមធ្យមភាគប្រចាំឆមាស
                </h3>
                <button onclick="document.getElementById('semesterConfigModal').remove()" class="w-8 h-8 rounded-full bg-white/20 text-white flex justify-center items-center hover:bg-white/40 transition-colors shadow-sm">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            
            <div class="p-4 sm:p-6 overflow-y-auto custom-scrollbar max-h-[75vh] bg-slate-50">
                <div class="mb-5 text-[12px] sm:text-[13px] text-blue-800 font-bold bg-blue-100/50 p-4 rounded-2xl border border-blue-200 flex items-start gap-3 shadow-sm leading-relaxed">
                    <i class="fa-solid fa-circle-info text-blue-600 text-lg mt-0.5"></i> 
                    <p>សូមជ្រើសរើសខែដែលបានយកពិន្ទុជាក់ស្តែង ដើម្បីឱ្យប្រព័ន្ធទាញយកពិន្ទុទាំងនោះមកបូកបញ្ចូល និងចែកមធ្យមភាគប្រចាំខែ (សម្រាប់ប្រឡងឆមាស) ដោយស្វ័យប្រវត្តិ។</p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                        <h4 class="font-moul text-indigo-700 text-[13px] sm:text-sm mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <i class="fa-solid fa-book-open text-indigo-400"></i> សម្រាប់ឆមាសទី១
                        </h4>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            ${allMonths.map(m => `
                                <label class="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all">
                                    <input type="checkbox" value="${m}" class="sem1-month-cb w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shadow-sm" ${savedConfig.sem1.includes(m) ? 'checked' : ''}>
                                    <span class="text-xs sm:text-sm font-bold text-slate-700">ខែ ${m}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                        <h4 class="font-moul text-emerald-700 text-[13px] sm:text-sm mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <i class="fa-solid fa-book-open text-emerald-400"></i> សម្រាប់ឆមាសទី២
                        </h4>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            ${allMonths.map(m => `
                                <label class="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all">
                                    <input type="checkbox" value="${m}" class="sem2-month-cb w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shadow-sm" ${savedConfig.sem2.includes(m) ? 'checked' : ''}>
                                    <span class="text-xs sm:text-sm font-bold text-slate-700">ខែ ${m}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button onclick="document.getElementById('semesterConfigModal').remove()" class="px-5 sm:px-6 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-xs sm:text-sm">បោះបង់</button>
                <button onclick="window.saveSemesterConfig()" class="px-5 sm:px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md flex items-center gap-2 transition-transform transform hover:-translate-y-0.5 text-xs sm:text-sm">
                    <i class="fa-solid fa-floppy-disk"></i> រក្សាទុកការកំណត់
                </button>
            </div>
        </div>
      </div>
    `;

    const oldModal = document.getElementById('semesterConfigModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.saveSemesterConfig = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    
    const sem1Checked = Array.from(document.querySelectorAll('.sem1-month-cb:checked')).map(cb => cb.value);
    const sem2Checked = Array.from(document.querySelectorAll('.sem2-month-cb:checked')).map(cb => cb.value);
    
    const config = { sem1: sem1Checked, sem2: sem2Checked };
    localStorage.setItem('semester_month_config_' + grade, JSON.stringify(config));
    
    document.getElementById('semesterConfigModal').remove();
    
    if(typeof showToast === 'function') showToast("✅ ការកំណត់ខែត្រូវបានរក្សាទុកដោយជោគជ័យ!");
    else alert("ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ!");
    
    if(typeof window.fetchStudentsForScores === 'function') window.fetchStudentsForScores();
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


// =====================================================================
// ៦. មុខងារលាក់/បង្ហាញ និងបង្កើត Pop-up កាលបរិច្ឆេទ (Global Modal)
// =====================================================================
window.toggleSharedDatePanel = function() {
    let panel = document.getElementById('globalDateSettingsModal');
    
    // បើមិនទាន់មាន Pop-up នៅក្នុង Body ទេ គឺបង្កើតវាបញ្ជូលតែម្តង
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'globalDateSettingsModal';
        // ប្រើ fixed inset-0 និង z-[999999] ដើម្បីឱ្យវាគ្របពីលើគេបង្អស់
        panel.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999999] hidden justify-center items-center p-4 font-siemreap transition-opacity duration-300 opacity-0';
        
        panel.innerHTML = `
          <!-- 🟢 តួ Pop-up (Main Card) 🟢 -->
          <div id="globalDateSettingsCard" class="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] w-full max-w-md flex flex-col overflow-hidden border border-white/20 transform scale-95 transition-transform duration-300 relative mx-auto my-auto">
            
            <!-- ក្បាល Pop-up -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex justify-between items-center shadow-md relative overflow-hidden">
                <div class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 class="font-moul text-white text-[15px] flex items-center gap-3 drop-shadow-md relative z-10">
                    <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20 shadow-inner">
                        <i class="fa-solid fa-calendar-day text-lg"></i>
                    </div>
                    កំណត់កាលបរិច្ឆេទប្រព័ន្ធ
                </h3>
                <button type="button" onclick="window.toggleSharedDatePanel()" class="w-9 h-9 rounded-full bg-white/10 text-white flex justify-center items-center hover:bg-rose-500 hover:text-white transition-colors border border-white/20 shadow-sm relative z-10 active:scale-90">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            
            <!-- ផ្នែកខាងក្នុង Pop-up -->
            <div class="p-6 bg-slate-50 flex flex-col gap-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
              
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="font-moul text-indigo-900 text-xs ml-1">ទីតាំងធ្វើលិខិត ៖</label>
                  <input type="text" id="global_loc_input" value="${window.reportCardDateSettings.location || ''}" 
                         oninput="window.updateSharedDateSetting('location', this.value)" 
                         placeholder="ធ្វើនៅ........................."
                         class="shared-location-input w-full border border-slate-300 rounded-xl px-4 py-2.5 font-bold text-slate-700 bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] shadow-sm">
                </div>
                
                <div class="flex flex-col gap-1.5">
                  <label class="font-moul text-indigo-900 text-xs ml-1">កាលបរិច្ឆេទសូរិយគតិ ៖</label>
                  <input type="text" id="global_sol_input" value="${window.reportCardDateSettings.solarDate || ''}" 
                         oninput="window.updateSharedDateSetting('solarDate', this.value)" 
                         placeholder="ថ្ងៃទី....... ខែ....... ឆ្នាំ២០...."
                         class="shared-solar-input w-full border border-slate-300 rounded-xl px-4 py-2.5 font-bold text-slate-700 bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] shadow-sm">
                </div>
              </div>

              <!-- ប៊ូតុងបញ្ជាអូតូ -->
              <div class="grid grid-cols-2 gap-3 pt-1">
                  <button type="button" onclick="window.forceSetToday(); window.syncGlobalDateModal();" class="flex justify-center items-center gap-2 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-[13px] group">
                      <i class="fa-solid fa-bolt text-amber-500 group-hover:scale-110 transition-transform"></i> ថ្ងៃនេះអូតូ
                  </button>
                  <button type="button" onclick="window.forceSetDots(); window.syncGlobalDateModal();" class="flex justify-center items-center gap-2 w-full py-3 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-[13px]">
                      ចុចៗ (...)
                  </button>
              </div>

              <!-- ប្រអប់ចន្ទគតិ -->
              <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                <div class="absolute left-0 top-0 w-1.5 h-full bg-indigo-500"></div>
                
                <label class="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" id="global_lun_chk" ${window.reportCardDateSettings.showLunar ? 'checked' : ''} 
                         onchange="window.updateSharedDateSetting('showLunar', this.checked); document.getElementById('global_lun_input').classList.toggle('opacity-40'); document.getElementById('global_lun_input').classList.toggle('pointer-events-none');" 
                         class="shared-lunar-check w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer border-slate-300 shadow-sm mt-0.5">
                  <span class="font-moul text-indigo-900 text-[13px]">បង្ហាញថ្ងៃខែចន្ទគតិ</span>
                </label>
                
                <input type="text" id="global_lun_input" value="${window.reportCardDateSettings.lunarDate || ''}" 
                       oninput="window.updateSharedDateSetting('lunarDate', this.value)" 
                       placeholder="ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧..."
                       class="shared-lunar-input w-full border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-indigo-900 bg-slate-50 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-[13px] ${!window.reportCardDateSettings.showLunar ? 'opacity-40 pointer-events-none' : ''}">
              </div>
            </div>

            <!-- ជើង Pop-up -->
            <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-[2rem]">
                <button type="button" onclick="window.toggleSharedDatePanel()" class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-[14px] shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center gap-2 active:scale-95">
                    <i class="fa-solid fa-check-circle text-lg"></i> រក្សាទុក & បិទ
                </button>
            </div>
          </div>
        `;
        // ដាក់ Modal នេះចូលទៅក្នុង body ផ្ទាល់តែម្តង
        document.body.appendChild(panel);
    }

    const card = document.getElementById('globalDateSettingsCard');

    // គ្រប់គ្រងចលនា (Animation) បើក និងបិទ
    if (panel.classList.contains('hidden') || panel.style.display === 'none') {
        window.syncGlobalDateModal(); // Update ទិន្នន័យមុននឹងបង្ហាញ
        panel.classList.remove('hidden');
        panel.style.display = 'flex'; 
        
        setTimeout(() => {
            panel.classList.remove('opacity-0');
            panel.classList.add('opacity-100');
            if(card) {
                card.classList.remove('scale-95');
                card.classList.add('scale-100');
            }
        }, 10);
    } else {
        panel.classList.remove('opacity-100');
        panel.classList.add('opacity-0');
        if(card) {
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
        setTimeout(() => {
            panel.classList.add('hidden');
            panel.style.display = 'none';
        }, 300);
    }
};

// មុខងារជំនួយសម្រាប់ Update ទិន្នន័យក្នុង Pop-up ពេលចុច "ថ្ងៃនេះអូតូ" ឬ "ចុចៗ"
window.syncGlobalDateModal = function() {
    const loc = document.getElementById('global_loc_input');
    const sol = document.getElementById('global_sol_input');
    const lun = document.getElementById('global_lun_input');
    const chk = document.getElementById('global_lun_chk');
    
    if(loc) loc.value = window.reportCardDateSettings.location || '';
    if(sol) sol.value = window.reportCardDateSettings.solarDate || '';
    if(lun) lun.value = window.reportCardDateSettings.lunarDate || '';
    if(chk) {
        chk.checked = window.reportCardDateSettings.showLunar;
        if(!chk.checked) lun.classList.add('opacity-40', 'pointer-events-none');
        else lun.classList.remove('opacity-40', 'pointer-events-none');
    }
};

// ==========================================
// UI & Layout Management (ទម្រង់តារាងបញ្ចូលពិន្ទុថ្មី + Multi-select + Date Settings)
// ==========================================
window.renderScoreEntryContent = async function() {
    const c = document.getElementById("modal-content-entry");
    if (!c) return;

    c.innerHTML = `
      <style>
          /* CSS សម្រាប់ Multi-Cell Selection (Excel-like) */
          .cell-selected {
              background-color: #e0f2fe !important; /* bg-sky-100 */
              box-shadow: inset 0 0 0 2px #00a6ffb6 !important; /* border ពណ៌ខៀវខាងក្នុង */
              color: #0095e6d3 !important; /* អក្សរដិតពណ៌ខៀវ */
              transition: all 0.1s ease;
          }
          .table-container-no-select {
              user-select: none;
              -webkit-user-select: none;
          }
          /* ធ្វើឱ្យ Input មើលទៅស្អាតក្នុងតារាង */
          .score-input-modern {
              width: 100%; height: 100%;
              text-align: center;
              font-weight: bold;
              outline: none;
              background: transparent;
              transition: all 0.2s;
          }
          .score-input-modern:focus {
              background-color: #fff;
          }
      </style>
      
      <!-- ផ្លាកសញ្ញាមិនទាន់រក្សាទុក (Unsaved Badge) -->
      <div id="unsavedBadge" class="absolute top-5 right-6 bg-rose-50 text-rose-600 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 animate-pulse no-print z-[80] shadow-md border border-rose-200 hidden backdrop-blur-sm">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
        មិនទាន់រក្សាទុក
      </div>
      

      <!-- តំបន់តារាង (Table Area) -->
      <div id="tableScrollContainer" class="flex-1 overflow-auto w-full custom-scrollbar print:overflow-visible relative bg-slate-50/50 p-4 md:p-6 pb-20 mt-1">
        <div class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden mx-auto" style="width: max-content; min-width: 100%;">
            <table id="scoreTableMain" class="border-collapse text-[13px] text-center whitespace-nowrap bg-white relative font-siemreap w-full">
              
              <!-- ក្បាលតារាង (Sticky Header with Glassmorphism) -->
              <thead id="scoreTableHead" class="text-slate-700 sticky top-0 z-[60] shadow-sm bg-slate-50/90 backdrop-blur-md border-b-2 border-slate-200">
                  <!-- ក្បាលតារាងនឹងត្រូវបានបង្កើតដោយ JS -->
              </thead>
              
              <!-- តួអត្ថបទតារាង -->
              <tbody id="scoresTableBody" class="divide-y divide-slate-100 text-slate-700">
                <tr>
                    <td colspan="100" class="p-16 text-center text-slate-400 font-bold">
                        <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-blue-400"></i><br>
                        កំពុងទាញយកទិន្នន័យ...
                    </td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>

      <!-- Mobile Entry Modal (កែប្រែពណ៌ថ្មីឱ្យ Premium) -->
      <div id="mobileScoreEntryModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-3 sm:p-4 no-print font-siemreap transition-all" style="z-index: 999999;">
          <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-scale-up border border-white/20 relative">
              
              <div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex justify-between items-center shrink-0 shadow-md z-20 relative overflow-hidden">
                  <div class="absolute inset-0 bg-white/10" style="background-image: radial-gradient(circle at 100% 0%, rgba(255,255,255,0.2) 0%, transparent 50%);"></div>
                  <div class="text-white flex items-center gap-4 relative z-10">
                      <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner border border-white/20 backdrop-blur-sm"><i class="fa-solid fa-user-pen"></i></div>
                      <div>
                          <h3 class="font-moul text-lg mb-0.5 drop-shadow-md" id="mobileScoreStuName">ឈ្មោះសិស្ស</h3>
                          <p class="text-xs text-blue-100 font-mono drop-shadow-sm flex items-center gap-2 bg-black/20 px-2 py-0.5 rounded-md w-fit" id="mobileScoreStuInfo"></p>
                      </div>
                  </div>
                  <button onclick="window.closeMobileScoreModal()" class="relative z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-sm border border-white/20 active:scale-90"><i class="fa-solid fa-xmark text-lg"></i></button>
              </div>
              
              <div class="p-5 overflow-y-auto flex-1 custom-scrollbar bg-slate-50 relative" id="mobileScoreInputsContainer"></div>
              
              <div class="p-4 bg-white border-t border-slate-100 flex justify-between items-center gap-3 shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-10">
                  <button onclick="window.prevMobileStudent()" id="btnPrevMobileStu" class="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95"><i class="fa-solid fa-arrow-left"></i> អ្នកមុន</button>
                  <button onclick="window.nextMobileStudent()" id="btnNextMobileStu" class="flex-1 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 border border-indigo-100">អ្នកបន្ទាប់ <i class="fa-solid fa-arrow-right"></i></button>
              </div>
              
              <div class="p-4 pt-0 bg-white shrink-0 z-10">
                  <button onclick="window.closeMobileScoreModal()" class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 border border-emerald-500/50"><i class="fa-solid fa-check-circle text-lg"></i> រួចរាល់ & បិទផ្ទាំង</button>
              </div>
          </div>
      </div>
    `;

    // ១. ទាញយកទិន្នន័យមកបំពេញក្នុងតារាង
    await window.fetchStudentsForScores();
    
    // ២. រៀបចំមុខងាររុករកដោយប្រើព្រួញ (Excel Navigation)
    if(typeof window.setupExcelLikeNavigation === 'function') {
        window.setupExcelLikeNavigation();
    }

    // ៣. ដំណើរការមុខងារ Select Multi-Cells ដោយការអូសម៉ៅស៍
    if(typeof initDragToSelectCells === 'function') {
        initDragToSelectCells();
    }
};

// ==========================================
// អនុគមន៍សម្រាប់មុខងារ Select ក្រឡាដោយអូសម៉ៅស៍ (Drag to Select)
// ==========================================
function initDragToSelectCells() {
    const tableContainer = document.getElementById('tableScrollContainer');
    const tableBody = document.getElementById('scoresTableBody');
    if (!tableContainer || !tableBody) return;

    let isDragging = false;
    let startCell = null;

    // ជំនួយការ៖ ស្វែងរកទីតាំង (Row & Col) របស់ Input នៅក្នុងតារាង
    function getCellCoords(inputElem) {
        const td = inputElem.closest('td');
        const tr = inputElem.closest('tr');
        if (!td || !tr) return null;
        
        const allRows = Array.from(tableBody.querySelectorAll('tr'));
        const rowIdx = allRows.indexOf(tr);
        
        const allInputsInRow = Array.from(tr.querySelectorAll('input[type="number"], input[type="text"]'));
        const colIdx = allInputsInRow.indexOf(inputElem);
        
        return { row: rowIdx, col: colIdx };
    }

    // ជំនួយការ៖ លុបពណ៌ Select ចាស់ចោល
    function clearSelection() {
        tableBody.querySelectorAll('.cell-selected').forEach(el => {
            el.classList.remove('cell-selected');
        });
    }

    // ជំនួយការ៖ លាបពណ៌ Select ជាចង្កោម (Range)
    function selectRange(start, end) {
        clearSelection();
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);

        const rows = tableBody.querySelectorAll('tr');
        for (let r = minRow; r <= maxRow; r++) {
            if (!rows[r]) continue;
            const inputs = rows[r].querySelectorAll('input[type="number"], input[type="text"]');
            for (let c = minCol; c <= maxCol; c++) {
                if (inputs[c]) {
                    inputs[c].classList.add('cell-selected');
                }
            }
        }
    }

    // ព្រឹត្តិការណ៍ទី ១៖ ចុចម៉ៅស៍ (Mousedown) លើ Input
    tableBody.addEventListener('mousedown', function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            isDragging = true;
            tableContainer.classList.add('table-container-no-select'); // កុំឱ្យជាប់ Highlight អក្សរ
            
            const coords = getCellCoords(e.target);
            if (coords) {
                startCell = coords;
                clearSelection();
                e.target.classList.add('cell-selected');
                
                // បង្ខំឱ្យ Input នោះ focus (ងាយស្រួលវាយលេខ)
                setTimeout(() => e.target.focus(), 0);
            }
        }
    });

    // ព្រឹត្តិការណ៍ទី ២៖ អូសម៉ៅស៍ (Mouseover) លើ Input ផ្សេងៗ
    tableBody.addEventListener('mouseover', function(e) {
        if (isDragging && e.target.tagName.toLowerCase() === 'input') {
            const currentCell = getCellCoords(e.target);
            if (currentCell && startCell) {
                selectRange(startCell, currentCell);
            }
        }
    });

    // ព្រឹត្តិការណ៍ទី ៣៖ ប្រលែងម៉ៅស៍ (Mouseup)
    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            tableContainer.classList.remove('table-container-no-select');
        }
    });

    // ព្រឹត្តិការណ៍ទី ៤៖ ចុច Keyboard លុបទិន្នន័យ (Delete/Backspace) លើក្រឡាដែល Select ច្រើន
    tableBody.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedCells = tableBody.querySelectorAll('.cell-selected');
            if (selectedCells.length > 1) { // ធ្វើការលុបបើសិន Select លើសពី១ក្រឡា
                e.preventDefault();
                selectedCells.forEach(input => {
                    input.value = '';
                    // ហៅ Event ដើម្បីឱ្យវា Save/គណនាអូតូ
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        }
        
        // (Optional) លុបពណ៌ Select បើចុច Esc
        if (e.key === 'Escape') {
            clearSelection();
        }
    });
}

// ==========================================
// ០៦. Pop-up បញ្ចូលពិន្ទុតាមកាត (Modern Quick Entry - UI Revamped)
// ==========================================
window.openMobileScoreModal = function(studentIndex) {
    if (!window.scoresStudentList || window.scoresStudentList.length === 0) return alert("គ្មានទិន្នន័យសិស្សទេ!");
    window.currentMobileStudentIndex = studentIndex || 0;
    
    // បង្កើត Modal Structure ប្រសិនបើមិនទាន់មាន ដើម្បីធានាថា Design ថ្មីលោតចេញមក
    let modal = document.getElementById("mobileScoreEntryModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "mobileScoreEntryModal";
        modal.className = "fixed inset-0 z-[3000] hidden bg-slate-900/80 backdrop-blur-sm p-3 md:p-6 transition-opacity font-siemreap flex items-center justify-center";
        
        modal.innerHTML = `
            <div class="bg-slate-50 w-full max-w-lg h-[95vh] md:h-auto md:max-h-[90vh] rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative border border-slate-200 animate-slide-up">
                
                <!-- 🔴 ក្បាល Pop-up (Light Theme + Gradient Name) 🔴 -->
                <div class="bg-indigo-50 p-5 shrink-0 relative border-b border-indigo-100 shadow-sm">
                    <div class="flex justify-between items-center relative z-10">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-indigo-200 text-xl text-indigo-600 shadow-sm shrink-0">
                                <i class="fa-solid fa-user-graduate"></i>
                            </div>
                            <div class="flex flex-col">
                                <!-- ឈ្មោះសិស្ស ចាក់ពណ៌ Gradient -->
                                <h3 id="mobileScoreStuName" class="font-moul text-lg md:text-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-rose-600 bg-clip-text text-transparent drop-shadow-sm leading-tight pb-1">ឈ្មោះសិស្ស</h3>
                                <div id="mobileScoreStuInfo" class="flex flex-wrap gap-2 mt-1"></div>
                            </div>
                        </div>
                        <button onclick="window.closeMobileScoreModal()" class="w-10 h-10 rounded-full bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition border border-slate-200 shadow-sm shrink-0">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- ផ្ទៃបញ្ចូលពិន្ទុ (Scrollable Inputs) -->
                <div id="mobileScoreInputsContainer" class="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-5 bg-slate-100/50">
                    <!-- កាតមុខវិជ្ជានឹងត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិនៅទីនេះ -->
                </div>

                <!-- ប៊ូតុងបញ្ជាខាងក្រោម (Footer Navigation) -->
                <div class="bg-white p-4 shrink-0 border-t border-slate-200 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-10">
                    <button id="btnPrevMobileStu" onclick="window.prevMobileStudent()" class="flex-1 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 border border-slate-200 shadow-sm">
                        <i class="fa-solid fa-chevron-left"></i> អ្នកមុន
                    </button>
                    <button id="btnNextMobileStu" onclick="window.nextMobileStudent()" class="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transform hover:-translate-y-0.5">
                        អ្នកបន្ទាប់ <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
                
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    
    modal.classList.remove("hidden");
    window.renderMobileScoreInputs();
};

window.closeMobileScoreModal = function() {
    const modal = document.getElementById("mobileScoreEntryModal");
    if (modal) modal.classList.add("hidden");
    if(typeof window.calculateAllScores === 'function') window.calculateAllScores();
};

window.prevMobileStudent = function() {
    if (window.currentMobileStudentIndex > 0) {
        window.currentMobileStudentIndex--;
        window.renderMobileScoreInputs();
    }
};

window.nextMobileStudent = function() {
    if (window.currentMobileStudentIndex < window.scoresStudentList.length - 1) {
        window.currentMobileStudentIndex++;
        window.renderMobileScoreInputs();
    } else {
        // បិទ Pop-up ពេលដល់សិស្សចុងក្រោយ
        window.closeMobileScoreModal();
    }
};

window.renderMobileScoreInputs = function() {
    const stu = window.scoresStudentList[window.currentMobileStudentIndex];
    if (!stu) return;

    // ធ្វើបច្ចុប្បន្នភាពឈ្មោះសិស្ស
    document.getElementById("mobileScoreStuName").innerText = stu.name;
    const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
    
    // ធ្វើបច្ចុប្បន្នភាពផ្លាកព័ត៌មាន (Badges) ឱ្យមានពណ៌ច្បាស់ៗ
    document.getElementById("mobileScoreStuInfo").innerHTML = `
        <span class="bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-sm font-siemreap font-bold text-[12px] text-indigo-700">ល.រ៖ ${toKhNum(window.currentMobileStudentIndex + 1)}</span>
        <span class="bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-sm font-siemreap font-bold text-[12px] ${stu.gender==='ស្រី'?'text-pink-600':'text-blue-600'}">ភេទ៖ ${stu.gender}</span>
    `;

    // គ្រប់គ្រងសភាពប៊ូតុង អ្នកមុន / អ្នកបន្ទាប់
    const btnPrev = document.getElementById("btnPrevMobileStu");
    const btnNext = document.getElementById("btnNextMobileStu");
    
    if (btnPrev) {
        btnPrev.disabled = window.currentMobileStudentIndex === 0;
        btnPrev.className = window.currentMobileStudentIndex === 0 
            ? "flex-1 py-3.5 bg-slate-50 text-slate-400 font-bold rounded-2xl text-[14px] flex items-center justify-center gap-2 cursor-not-allowed border border-slate-100" 
            : "flex-1 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 border border-slate-200 shadow-sm hover:shadow";
    }
    
    if (btnNext) {
        const isLast = window.currentMobileStudentIndex === window.scoresStudentList.length - 1;
        btnNext.innerHTML = isLast ? '<i class="fa-solid fa-check-circle"></i> រួចរាល់' : 'អ្នកបន្ទាប់ <i class="fa-solid fa-chevron-right"></i>';
        btnNext.className = isLast 
            ? "flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transform hover:-translate-y-0.5" 
            : "flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transform hover:-translate-y-0.5";
    }

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    let inputsHtml = "";
    
    // បង្កើតកាតមុខវិជ្ជាជាមួយនឹងការរចនាពណ៌ដាច់ដោយឡែកពីគ្នា
    if (window.activeSchema && window.activeSchema.length > 0) {
        window.activeSchema.forEach(group => {
            let icon = "fa-book";
            let bgLight = "bg-indigo-50";
            let textDark = "text-indigo-800";
            let textIcon = "text-indigo-500";
            let borderLight = "border-indigo-100";
            let focusBorder = "focus:border-indigo-400";
            
            if(group.group.includes("ខ្មែរ")) { icon = "fa-language"; bgLight = "bg-blue-50"; textDark = "text-blue-800"; textIcon = "text-blue-500"; borderLight = "border-blue-100"; focusBorder = "focus:border-blue-400"; }
            if(group.group.includes("គណិត")) { icon = "fa-calculator"; bgLight = "bg-rose-50"; textDark = "text-rose-800"; textIcon = "text-rose-500"; borderLight = "border-rose-100"; focusBorder = "focus:border-rose-400"; }
            if(group.group.includes("វិទ្យាសាស្ត្រ")) { icon = "fa-flask"; bgLight = "bg-emerald-50"; textDark = "text-emerald-800"; textIcon = "text-emerald-500"; borderLight = "border-emerald-100"; focusBorder = "focus:border-emerald-400"; }
            if(group.group.includes("សង្គម")) { icon = "fa-globe"; bgLight = "bg-amber-50"; textDark = "text-amber-800"; textIcon = "text-amber-500"; borderLight = "border-amber-100"; focusBorder = "focus:border-amber-400"; }
            if(group.group.includes("ភាសាបរទេស")) { icon = "fa-book-atlas"; bgLight = "bg-slate-100"; textDark = "text-slate-800"; textIcon = "text-slate-500"; borderLight = "border-slate-200"; focusBorder = "focus:border-slate-400"; } // 🟢 បន្ថែមភាសាបរទេសនៅទីនេះ 🟢

            inputsHtml += `
                <div class="mb-5 bg-white p-4 md:p-5 rounded-[1.5rem] shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div class="absolute left-0 top-0 w-[4px] h-full ${bgLight.replace('50', '500').replace('100', '400')}"></div>
                    
                    <h4 class="font-moul ${textDark} text-[14px] md:text-[15px] mb-4 pb-3 border-b border-slate-100 flex items-center gap-3 drop-shadow-sm ml-1">
                        <div class="w-8 h-8 rounded-[0.6rem] ${bgLight} flex items-center justify-center border ${borderLight}">
                            <i class="fa-solid ${icon} ${textIcon} text-[13px]"></i>
                        </div>
                        ${group.group}
                    </h4>
                    <div class="space-y-3 pl-1">`;
            
            let subsToRender = (group.subs && group.subs.length > 0) ? group.subs : [{name: group.group, key: group.key, max: group.max}];
            
            subsToRender.forEach((sub, sIdx) => {
                const key = sub.key;
                const maxVal = window.schemaMaxMap ? (window.schemaMaxMap[key] || sub.max || 10) : (sub.max || 10);
                
                let inputIdMainTable = `${key}_${stu.id}`;
                if (type === "annual") inputIdMainTable = `${key}_s1_${stu.id}`; 
                if (type === "semester") {
                    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
                    inputIdMainTable = `${key}_${month.includes("២") ? "s2" : "s1"}_${stu.id}`;
                }

                const mainInput = document.getElementById(inputIdMainTable);
                const currentVal = mainInput ? mainInput.value : '';
                const rowBg = sIdx % 2 !== 0 ? 'bg-slate-50/50' : 'bg-transparent';

                inputsHtml += `
                    <div class="flex items-center justify-between input-focus-ring ${rowBg} hover:bg-slate-100 rounded-xl p-2.5 transition-all">
                        <label class="text-[13px] md:text-[14px] text-slate-700 font-siemreap font-bold w-1/2 pl-2 truncate" title="${sub.name}">${sub.name}</label>
                        <div class="relative w-[45%] md:w-[40%]">
                            <input type="number" inputmode="decimal" value="${currentVal}"
                                   oninput="if(typeof window.syncMobileInputToMain === 'function') window.syncMobileInputToMain('${inputIdMainTable}', this.value)"
                                   onkeydown="if(event.key==='Enter'){
                                      event.preventDefault(); 
                                      let inputs = Array.from(document.querySelectorAll('#mobileScoreInputsContainer input')); 
                                      let idx = inputs.indexOf(this); 
                                      if(idx < inputs.length-1) inputs[idx+1].focus(); 
                                      else document.getElementById('btnNextMobileStu').click();
                                   }"
                                   placeholder="ពេញ ${maxVal}"
                                   class="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 text-center font-mono font-bold text-[16px] text-indigo-800 outline-none shadow-inner ${focusBorder} focus:ring-2 focus:ring-opacity-30 focus:bg-white transition-all placeholder:font-siemreap placeholder:font-normal placeholder:text-[12px] placeholder:text-slate-300">
                        </div>
                    </div>
                `;
            });
            inputsHtml += `</div></div>`;
        });
    } else {
        inputsHtml = `<div class="p-10 text-center text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-200"><i class="fa-solid fa-triangle-exclamation text-3xl mb-3"></i><br>មិនមានទិន្នន័យមុខវិជ្ជាទេ!</div>`;
    }

    const container = document.getElementById("mobileScoreInputsContainer");
    if (container) {
        container.innerHTML = inputsHtml;
        // រមូរមកលើវិញដោយស្វ័យប្រវត្តិរាល់ពេលប្តូរសិស្ស
        container.scrollTop = 0;
        
        // Focus ប្រអប់ដំបូងដោយស្វ័យប្រវត្តិ
        const firstInput = container.querySelector('input');
        if(firstInput) {
            setTimeout(() => { 
                firstInput.focus(); 
                firstInput.select(); 
            }, 150);
        }
    }
};

// មុខងារនេះជួយបញ្ជូនទិន្នន័យពី Mobile Input ទៅប្រអប់ Input កូដដើម
window.syncMobileInputToMain = function(inputId, val) {
    const mainInput = document.getElementById(inputId);
    if (mainInput) {
        mainInput.value = val;
        // បញ្ជាឱ្យកូដផ្សេងៗដឹងថាមានការផ្លាស់ប្តូរ (Trigger Event)
        const event = new Event('input', { bubbles: true });
        mainInput.dispatchEvent(event);
    }
};

// ==========================================
// មុខងារ Auto Sync ពី Pop-up ទៅតារាងធំ
// ==========================================
window.syncMobileInputToMain = function(mainInputId, value) {
    const mainInput = document.getElementById(mainInputId);
    if (mainInput) {
        // Clear អក្សរ និងចន្លោះ យកតែលេខ និងក្បៀស
        let cleanValue = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
        mainInput.value = cleanValue;
        
        // ហៅមុខងារគណនាមធ្យមភាគ និងចំណាត់ថ្នាក់សិស្សម្នាក់នេះភ្លាមៗ
        const stuId = mainInputId.split('_').pop();
        if(typeof window.calculateStudentScore === 'function') {
            window.calculateStudentScore(stuId);
        }
        
        window.markUnsaved(); // បង្ហាញសញ្ញាព្រមានមិនទាន់ Save
    }
};
// =====================================================================
// មុខងារទាញយក និងបង្ហាញទិន្នន័យសិស្ស (កែសម្រួលដោះស្រាយបញ្ហាយឺត/គាំង)
// =====================================================================
window.fetchStudentsForScores = async function() {
    window.hasUnsavedChanges = false;
    document.getElementById("unsavedBadge")?.classList.add("hidden");
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = sInfo.teacher_room || "«ក»";
    const grade = `${levelStr} ${roomStr}`;
    
    const trackStr = document.getElementById("globalTrackSelect")?.value || "sci";
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
        // ធានាថាកំពុង Loading
        tbody.innerHTML = `<tr><td colspan="100" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-amber-400"></i><br>កំពុងរៀបចំទិន្នន័យ...</td></tr>`;
        
        let allStus = [];
        
        // សាកល្បងយកពី API ជាមុន (បើមាន)
        if (typeof apiGet === "function") {
           try { 
               let stRes = await apiGet("getStudents", { status: "Active" }); 
               if (stRes && stRes.data && stRes.data.length > 0) allStus = stRes.data;
           } catch(e) { console.warn("API មិនដំណើរការ ទាញពី LocalStorage ជំនួស"); }
        }
        
        // បើអត់មានទិន្នន័យពី API យកពី LocalStorage
        if (!allStus || allStus.length === 0) {
            allStus = JSON.parse(localStorage.getItem('academic_students')) || [];
        }

        let cleanLevel = levelStr.replace(/\s+/g, ''); 
        let cleanRoom = roomStr.replace(/[«»\s]/g, '');

        window.scoresStudentList = allStus.filter(s => {
            if (s.status === "Dropped" || s.status === "អសកម្ម") return false;
            let sGrade = String(s.grade || "").replace(/\s+/g, ''); 
            let sRoom = String(s.room || "").replace(/[«»\s]/g, '');
            let fullGradeDB = String(s.class_name || s.grade || "").replace(/\s+/g, ''); 
            let expectedFull = cleanLevel + cleanRoom;
            
            return (sGrade === cleanLevel && sRoom === cleanRoom) || (fullGradeDB === expectedFull) || (fullGradeDB.includes(cleanLevel) && fullGradeDB.includes(cleanRoom));
        });

        // បើថ្នាក់នេះអត់មានសិស្សសោះ ដាក់សិស្សសាកល្បង ១៥ នាក់ ដើម្បីឲ្យមើលឃើញតារាង
        if (window.scoresStudentList.length === 0) {
            window.scoresStudentList = Array.from({length: 15}, (_, i) => ({ 
                id: "STU-" + String(i + 1).padStart(3, '0'), 
                name: "សិស្សសាកល្បង " + (i + 1), 
                gender: i % 2 === 0 ? "ប្រុស" : "ស្រី", 
                grade: levelStr, 
                room: roomStr 
            }));
        }
        
        // តម្រៀបសិស្សតាមអក្ខរក្រម
        window.scoresStudentList.sort((a,b) => String(a.name||"").localeCompare(String(b.name||""), 'km'));

        // ទាញយកពិន្ទុ
        let allScores = [];
        if (typeof apiGet === "function") { 
            try { 
                let scRes = await apiGet("getScores", { grade: grade }); 
                if (scRes && scRes.data) allScores = scRes.data;
            } catch(e) { console.warn("API ពិន្ទុមិនដំណើរការ"); } 
        }
        
        if (!allScores || allScores.length === 0) {
            allScores = JSON.parse(localStorage.getItem('academic_scores')) || [];
        }
        
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
            
            let rowHtml = `<td class="p-1.5 border-r border-slate-300 print:border-black text-center font-bold text-slate-500 sticky z-10 print:static text-[12px] font-mono bg-slate-50 shadow-sm border-b border-slate-200" style="left: 0; width: ${W_NO}px; min-width: ${W_NO}px; max-width: ${W_NO}px;">${idx + 1}</td>
                           <td onclick="window.openMobileScoreModal(${idx})" class="cursor-pointer hover:text-indigo-600 p-1.5 px-4 border-r border-slate-300 print:border-black text-left font-bold whitespace-nowrap sticky z-10 print:static text-slate-800 font-siemreap text-[13px] bg-slate-50 shadow-sm border-b border-slate-200 overflow-hidden text-ellipsis transition-colors" style="left: ${L_NAME}px; width: ${W_NAME}px; min-width: ${W_NAME}px; max-width: ${W_NAME}px;" title="ចុចដើម្បីបញ្ជូលពិន្ទុ">${stu.name}</td>
                           <td class="p-1.5 border-r border-slate-300 print:border-black text-center font-bold font-siemreap ${genColor} sticky z-10 print:static text-[12px] shadow-sm border-b border-slate-200" style="left: ${L_GENDER}px; width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width: ${W_GENDER}px;">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>`;

            if (type === "annual") {
                let sc1 = window.s1Scores.find(s => String(s.student_id) === String(stu.id)) || {};
                let sc2 = window.s2Scores.find(s => String(s.student_id) === String(stu.id)) || {};
                let scA = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
                let colIndexTracker = 0;
                
                const makeInputs = (scObj, suffix, bg) => window.activeSubjectKeys.map(key => {
                    const maxVal = window.schemaMaxMap[key] || 10;
                    let val = scObj[key] !== undefined && scObj[key] !== "" ? scObj[key] : '';
                    const colorClass = (val !== '' && parseFloat(val) < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                    return `<td class="border-r border-slate-300 print:border-black p-0 relative ${bg}" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="text" inputmode="decimal" id="${key}_${suffix}_${stu.id}" data-row="${idx}" data-col="${colIndexTracker++}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input w-full h-10 text-center text-[13px] font-bold font-mono ${colorClass} border-0 focus:ring-inset focus:ring-2 focus:ring-indigo-400 outline-none bg-transparent hover:bg-slate-100 transition-colors"></td>`;
                }).join("");

                rowHtml += makeInputs(sc1, "s1", "bg-slate-50/50");
                rowHtml += `<td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="total_s1_${stu.id}">${sc1.total_score||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="avg_s1_${stu.id}">${sc1.average||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-rose-600 font-mono text-[14px] bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_s1_${stu.id}">${sc1.rank||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-emerald-700 font-moul text-[12px] bg-slate-100 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_s1_${stu.id}">${sc1.grade_letter||''}</td>`;

                rowHtml += makeInputs(sc2, "s2", "bg-white");
                rowHtml += `<td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-50" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="total_s2_${stu.id}">${sc2.total_score||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-slate-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="avg_s2_${stu.id}">${sc2.average||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-rose-600 font-mono text-[14px] bg-slate-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_s2_${stu.id}">${sc2.rank||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-emerald-700 font-moul text-[12px] bg-slate-50 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_s2_${stu.id}">${sc2.grade_letter||''}</td><td class="p-1.5 border-r border-slate-300 print:border-black text-center font-black text-blue-800 font-mono text-[15px] bg-amber-50" style="width: ${W_STAT+10}px; min-width: ${W_STAT+10}px; max-width: ${W_STAT+10}px;" id="avg_annual_${stu.id}">${scA.average||''}</td><td class="p-1.5 border-r border-slate-300 print:border-black text-center font-black text-rose-700 font-mono text-[16px] bg-amber-50" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_annual_${stu.id}">${scA.rank||''}</td><td class="p-1.5 border-r border-slate-300 print:border-black text-center font-black text-emerald-700 font-moul text-[13px] bg-amber-50 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_annual_${stu.id}">${scA.grade_letter||''}</td>`;
                
                rowHtml += renderEvalInputs(stu.id, scA);
            } else if (type === "semester") {
                let sc = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
                const sem = month.includes("២") ? "s2" : "s1";
                rowHtml += window.activeSubjectKeys.map((key, colIndex) => {
                    const maxVal = window.schemaMaxMap[key] || 10; 
                    let val = sc[key] !== undefined && sc[key] !== "" ? sc[key] : '';
                    const colorClass = (val !== '' && parseFloat(val) < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                    return `<td class="border-r border-slate-300 print:border-black p-0 relative" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="text" inputmode="decimal" id="${key}_${sem}_${stu.id}" data-row="${idx}" data-col="${colIndex}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input w-full h-10 text-center text-[13px] font-bold font-mono ${colorClass} border-0 focus:ring-inset focus:ring-2 focus:ring-indigo-400 outline-none bg-transparent hover:bg-slate-100 transition-colors"></td>`;
                }).join("");
                
                // បញ្ចូលតម្លៃមធ្យមភាគខែ ដែលបានទាញយកដោយស្វ័យប្រវត្តិ
                const autoMonthlyAvg = parseFloat(window.calculateDynamicMonthlyAverage(stu.id, sem));
                let displayMonthlyAvg = sc.monthly_avg || (autoMonthlyAvg > 0 ? autoMonthlyAvg.toFixed(2) : '');

                rowHtml += `<td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[14px] bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="total_exam_${stu.id}">${sc.total_exam||''}</td>
                            <td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[14px] bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="avg_exam_${stu.id}">${sc.avg_exam||''}</td>
                            <td class="border-r border-slate-300 print:border-black p-0 bg-blue-50/50" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width: ${W_STAT+5}px;">
                                <input type="text" inputmode="decimal" placeholder="មធ្យម.ខែ" id="monthly_avg_${stu.id}" value="${displayMonthlyAvg}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input w-full h-10 text-center text-[13px] font-bold font-mono text-blue-700 border-0 outline-none bg-transparent hover:bg-blue-100 focus:bg-blue-100 focus:ring-inset focus:ring-2 focus:ring-blue-300 transition-colors">
                            </td>
                            <td class="p-1 border-r border-slate-300 print:border-black text-center font-black text-emerald-700 bg-emerald-50 font-mono text-[14px]" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width: ${W_STAT+5}px;" id="avg_${stu.id}">${sc.average||''}</td>
                            <td class="p-1 border-r border-slate-300 print:border-black text-center font-black text-rose-600 bg-orange-50 font-mono text-[14px]" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_${stu.id}">${sc.rank||''}</td>
                            <td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-emerald-700 bg-orange-50 font-moul text-[14px]" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_${stu.id}">${sc.grade_letter||''}</td>`;
                
                rowHtml += renderEvalInputs(stu.id, sc);
            } else {
                let sc = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
                rowHtml += window.activeSubjectKeys.map((key, colIndex) => {
                    const maxVal = window.schemaMaxMap[key] || 10; 
                    let val = sc[key] !== undefined && sc[key] !== "" ? sc[key] : '';
                    const colorClass = (val !== '' && parseFloat(val) < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                    return `<td class="border-r border-slate-300 print:border-black p-0 relative" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="text" inputmode="decimal" id="${key}_${stu.id}" data-row="${idx}" data-col="${colIndex}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input w-full h-10 text-center text-[13px] font-bold font-mono ${colorClass} border-0 focus:ring-inset focus:ring-2 focus:ring-indigo-400 outline-none bg-transparent hover:bg-slate-100 transition-colors"></td>`;
                }).join("");
                rowHtml += `<td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="total_${stu.id}">${sc.total_score||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-blue-50" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="avg_${stu.id}">${sc.average||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-black text-rose-600 font-mono text-[15px] bg-orange-50" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="rank_${stu.id}">${sc.rank||''}</td><td class="p-1 border-r border-slate-300 print:border-black text-center font-bold text-emerald-700 font-moul text-[12px] bg-emerald-50" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width: ${W_STAT}px;" id="grade_${stu.id}">${sc.grade_letter||''}</td>`;
                rowHtml += renderEvalInputs(stu.id, sc);
            }

            trs += `<tr id="row_${stu.id}" class="hover:bg-indigo-50/20 transition-colors border-b border-slate-300 print:border-black bg-white group">${rowHtml}</tr>`;
        });

        // Update DOM ម្តងគត់ដើម្បីឱ្យវាលឿនបំផុត
        tbody.innerHTML = trs;

        // បន្ទាប់ពី Render ចប់ គណនាពិន្ទុឡើងវិញទាំងអស់
        setTimeout(() => {
            window.calculateAllScores(); 
        }, 100);

    } catch (err) {
        console.error("Fetch Error:", err);
        if (tbody) tbody.innerHTML = `<tr><td colspan="100" class="p-12 text-center text-rose-500 font-bold bg-rose-50"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><br>បរាជ័យក្នុងការតភ្ជាប់ទិន្នន័យ សូមព្យាយាមម្តងទៀត</td></tr>`;
    }
};

window.renderTableHeader = function(schema, type) {
    let topRowHtml = "", subRowHtml = "";
    const evalHeadersTop = `<th colspan="4" class="border-r border-b border-slate-300 print:border-black p-2 bg-purple-100 text-purple-900" style="font-family: 'Khmer OS Bokor', sans-serif; -webkit-print-color-adjust: exact;">ការវាយតម្លៃ</th>`;
    const evalHeadersSub = ["ចំណេះដឹង", "បំណិន", "សីលធម៌", "សាមគ្គីភាព"].map(t => `<th class="border-r border-slate-300 print:border-black p-0 bg-purple-50/50" style="font-family: 'Khmer OS Bokor', sans-serif; width: 60px; min-width: 60px; max-width: 60px;"><div class="header-vertical text-[11px] mx-auto text-purple-800">${t}</div></th>`).join("");
    const evalHeadersSub_Annual = ["ចំណេះដឹង", "បំណិន", "សីលធម៌", "សាមគ្គីភាព"].map(t => `<th rowspan="2" class="border-r border-slate-300 print:border-black p-0 bg-purple-50/50" style="font-family: 'Khmer OS Bokor', sans-serif; width: 60px; min-width: 60px; max-width: 60px;"><div class="header-vertical text-[11px] mx-auto text-purple-800">${t}</div></th>`).join("");

    const W_NO = 40, W_NAME = 190, W_GENDER = 50, W_SCORE = 45, W_STAT = 60, W_EVAL = 60;
    const L_NAME = W_NO, L_GENDER = W_NO + W_NAME, W_TOTAL_FIXED = W_NO + W_NAME + W_GENDER; 

    let cgHtml = `<colgroup><col style="width: ${W_NO}px; min-width: ${W_NO}px; max-width:${W_NO}px;"><col style="width: ${W_NAME}px; min-width: ${W_NAME}px; max-width:${W_NAME}px;"><col style="width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width:${W_GENDER}px;">`;

    const renderSchemaHeaders = (prefix = "") => {
        schema.forEach(item => {
           if (item.subs && item.subs.length > 0) {
              topRowHtml += `<th colspan="${item.subs.length}" class="border-r border-b border-slate-300 print:border-black p-1.5 text-slate-800 font-bold" style="font-family: 'Khmer OS Bokor', sans-serif; background-color: ${item.color} !important; -webkit-print-color-adjust: exact;">${item.group}</th>`;
              item.subs.forEach(sub => {
                 subRowHtml += `<th class="border-r border-slate-300 print:border-black p-0 font-normal" style="font-family: 'Khmer OS Bokor', sans-serif; background-color: ${item.color}80 !important; -webkit-print-color-adjust: exact; width:${W_SCORE}px; min-width: ${W_SCORE}px; max-width:${W_SCORE}px;"><div class="header-vertical text-[11px] mx-auto text-slate-700">${sub.name}</div></th>`;
                 cgHtml += `<col style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width:${W_SCORE}px;">`;
              });
           } else {
              topRowHtml += `<th rowspan="2" class="border-r border-slate-300 print:border-black p-0 text-slate-800" style="font-family: 'Khmer OS Bokor', sans-serif; background-color: ${item.color} !important; -webkit-print-color-adjust: exact; width:${W_SCORE}px; min-width: ${W_SCORE}px; max-width:${W_SCORE}px;"><div class="header-vertical font-bold text-[12px] mx-auto">${item.group}</div></th>`;
              cgHtml += `<col style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width:${W_SCORE}px;">`;
           }
        });
    };

    const makeCol = (w, count = 1) => { for (let i = 0; i < count; i++) cgHtml += `<col style="width: ${w}px; min-width: ${w}px; max-width:${w}px;">`; };

    if (type === "annual") {
        let subjectCount = 0;
        schema.forEach(item => { subjectCount += (item.subs ? item.subs.length : 1); });
        let superTopRowHtml = `<tr><th colspan="3" class="border-r border-b border-slate-300 print:border-black bg-white sticky left-0 z-[70]" style="font-family: 'Khmer OS Bokor', sans-serif; min-width: ${W_TOTAL_FIXED}px; width: ${W_TOTAL_FIXED}px; max-width:${W_TOTAL_FIXED}px;"></th><th colspan="${subjectCount + 4}" class="border-r border-b border-slate-300 print:border-black p-2 bg-blue-100 text-blue-900 text-[13px] font-moul uppercase" style="-webkit-print-color-adjust: exact; background-color: #dbeafe !important;">ឆមាសទី១</th><th colspan="${subjectCount + 4}" class="border-r border-b border-slate-300 print:border-black p-2 bg-emerald-100 text-emerald-900 text-[13px] font-moul uppercase border-l-[3px] border-l-slate-400 print:border-l-black" style="-webkit-print-color-adjust: exact; background-color: #d1fae5 !important;">ឆមាសទី២</th><th colspan="3" class="border-r border-b border-slate-300 print:border-black p-2 bg-orange-100 text-orange-900 text-[13px] font-moul uppercase border-l-[3px] border-l-slate-400 print:border-l-black" style="-webkit-print-color-adjust: exact; background-color: #ffedd5 !important;">លទ្ធផលប្រចាំឆ្នាំ</th>${evalHeadersTop}</tr>`;

        renderSchemaHeaders("_s1");
        topRowHtml += `<th rowspan="2" class="border-r border-slate-300 print:border-black p-1 bg-slate-100 text-slate-700" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">សរុប<br>ឆ.១</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-blue-700 bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">មធ្យម<br>ឆ.១</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-rose-600 bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-emerald-700 bg-slate-100 border-r-[3px] border-r-slate-400 print:border-r-black" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>`;
        makeCol(W_STAT, 4);
        renderSchemaHeaders("_s2");
        topRowHtml += `<th rowspan="2" class="border-r border-slate-300 print:border-black p-1 bg-slate-100 text-slate-700" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">សរុប<br>ឆ.២</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-blue-700 bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">មធ្យម<br>ឆ.២</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-rose-600 bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th><th rowspan="2" class="border-r border-slate-300 print:border-black p-1 text-emerald-700 bg-slate-100 border-r-[3px] border-r-slate-400 print:border-r-black" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>`;
        makeCol(W_STAT, 4);
        makeCol(W_STAT + 10, 1); makeCol(W_STAT, 2); makeCol(W_EVAL, 4);
        cgHtml += `</colgroup>`;

        return `${cgHtml}${superTopRowHtml}
          <tr class="text-[12px] font-bold border-b border-slate-300 print:border-black bg-slate-50">
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky left-0 z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_NO}px; min-width: ${W_NO}px; max-width:${W_NO}px; left: 0px;">ល.រ</th>
            <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Siemreap', sans-serif; width: ${W_NAME}px; min-width:${W_NAME}px; max-width: ${W_NAME}px; left:${L_NAME}px;">ឈ្មោះសិស្ស</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_GENDER}px; min-width:${W_GENDER}px; max-width: ${W_GENDER}px; left:${L_GENDER}px;">ភេទ</th>
            ${topRowHtml}
            <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black bg-amber-50 text-blue-800 text-[12px]" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT+10}px; min-width: ${W_STAT+10}px; max-width:${W_STAT+10}px;">មធ្យមភាគ<br>ប្រចាំឆ្នាំ</th>
            <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black bg-amber-50 text-rose-700 text-[12px]" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
            <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black bg-amber-50 text-emerald-700 text-[12px]" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>
            ${evalHeadersSub_Annual}
          </tr><tr class="font-bold text-slate-800 bg-white border-b border-slate-300 print:border-black">${subRowHtml}</tr>`;
    } else if (type === "semester") {
        renderSchemaHeaders("");
        makeCol(W_STAT, 2); makeCol(W_STAT + 5, 2); makeCol(W_STAT, 2); makeCol(W_EVAL, 4); cgHtml += `</colgroup>`;
        return `${cgHtml}
          <tr class="text-[12px] font-bold border-b border-slate-300 print:border-black bg-slate-50">
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky left-0 z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_NO}px; min-width: ${W_NO}px; max-width:${W_NO}px; left: 0px;">ល.រ</th>
            <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_NAME}px; min-width:${W_NAME}px; max-width: ${W_NAME}px; left:${L_NAME}px;">ឈ្មោះសិស្ស</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_GENDER}px; min-width:${W_GENDER}px; max-width: ${W_GENDER}px; left:${L_GENDER}px;">ភេទ</th>
            ${topRowHtml}
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-700 bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">សរុប<br>ប្រឡង</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-700 bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">មធ្យមភាគ<br>ប្រឡង</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-blue-50 text-blue-800" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width:${W_STAT+5}px;">មធ្យមភាគ<br>ប្រចាំខែ</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-emerald-50 text-emerald-800" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width:${W_STAT+5}px;">មធ្យមភាគ<br>ប្រចាំឆមាស</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-orange-50 text-rose-700" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-orange-50 text-emerald-700" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>
            ${evalHeadersTop}
          </tr><tr class="font-bold text-slate-800 bg-white border-b border-slate-300 print:border-black">${subRowHtml}${evalHeadersSub}</tr>`;
    } else {
        renderSchemaHeaders("");
        makeCol(W_STAT, 4); makeCol(W_EVAL, 4); cgHtml += `</colgroup>`;
        return `${cgHtml}
          <tr class="text-[12px] font-bold border-b border-slate-300 print:border-black bg-slate-50">
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_NO}px; min-width: ${W_NO}px; max-width:${W_NO}px; left: 0px;">ល.រ</th>
            <th rowspan="2" class="p-2 border-r border-slate-300 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_NAME}px; min-width:${W_NAME}px; max-width: ${W_NAME}px; left:${L_NAME}px;">ឈ្មោះសិស្ស</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-600 sticky z-[70] print:static bg-slate-100 shadow-sm" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_GENDER}px; min-width:${W_GENDER}px; max-width: ${W_GENDER}px; left:${L_GENDER}px;">ភេទ</th>
            ${topRowHtml}
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black text-slate-700 bg-slate-100" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">សរុប</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-blue-50 text-blue-800" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">មធ្យមភាគ</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-rose-50 text-rose-700" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
            <th rowspan="2" class="p-1 border-r border-slate-300 print:border-black bg-emerald-50 text-emerald-700" style="font-family: 'Khmer OS Bokor', sans-serif; width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>
            ${evalHeadersTop}
          </tr><tr class="font-bold text-slate-800 bg-white border-b border-slate-300 print:border-black">${subRowHtml}${evalHeadersSub}</tr>`;
    }
};

function renderEvalInputs(stuId, sc = {}) {
    const fields = [["eval_k", sc.eval_knowledge], ["eval_s", sc.eval_skill], ["eval_m", sc.eval_moral], ["eval_so", sc.eval_solidarity]];
    return fields.map(([k, val]) => `<td class="border-r border-slate-300 print:border-black p-0" style="width: 60px; min-width: 60px; max-width: 60px;"><input type="text" id="${k}_${stuId}" value="${val || ''}" oninput="window.markUnsaved()" class="eval-input w-full h-10 text-center text-slate-700 border-0 outline-none bg-transparent hover:bg-purple-50 focus:bg-purple-50 transition-colors"></td>`).join("");
}

// ==========================================
// មុខងាររៀបចំទម្រង់តារាង (HTML) សម្រាប់ Print និង Excel (ប្រចាំឆ្នាំមិនបង្ហាញមុខវិជ្ជា)
// ==========================================
window.getAdvancedScoreTableHtml = function(isExcel, isRanking = false) {
    let stus = [...window.rankingsDataList];
    if(!stus || stus.length === 0) return "";
    
    // បញ្ជីពិន្ទុរៀបតាមលេខរៀងដើម, ចំណាត់ថ្នាក់រៀបតាមលំដាប់ពិន្ទុ
    if (isRanking) stus.sort((a,b) => a.rank - b.rank);
    else stus.sort((a,b) => a.id - b.id);
    
    const type = document.getElementById("globalPeriodType")?.value || "monthly";

    // គណនាចំណាត់ថ្នាក់តាមមុខវិជ្ជា (សម្រាប់តែឆមាសប៉ុណ្ណោះ)
    if (type === "semester") {
        let keys = [];
        window.activeSchema.forEach(g => {
            let subs = g.subs && g.subs.length > 0 ? g.subs : [g];
            subs.forEach(s => keys.push(s.key));
        });
        keys.forEach(k => {
            let valid = [...stus].filter(s => s[k] !== undefined && s[k] !== "" && s[k] !== null && !isNaN(parseFloat(s[k])));
            valid.sort((a,b) => parseFloat(b[k]) - parseFloat(a[k]));
            let currentRank = 1;
            valid.forEach((s, i) => {
                if (i > 0 && parseFloat(s[k]) === parseFloat(valid[i-1][k])) {
                    s[k+'_rank'] = valid[i-1][k+'_rank'];
                } else {
                    s[k+'_rank'] = currentRank;
                }
                currentRank++;
            });
        });
    }

    let tableClass = isExcel ? "" : "main-table";
    let tableStyle = isExcel ? `border-collapse: collapse; width: 100%; text-align: center; border: 1.5pt solid #000; margin: 0 auto;` : ``;
    
    const bgColors = {
        "ភាសាខ្មែរ": "#eff6ff", "គណិតវិទ្យា": "#fff1f2", "វិទ្យាសាស្ត្រ": "#ecfdf5", "សិក្សាសង្គម": "#fffbeb",
        "អប់រំកាយ": "#f5f3ff", "បំណិនជីវិត": "#e0e7ff", "ភាសាបរទេស": "#f8fafc"
    };

    // រចនាប័ទ្មក្បាលតារាង (Headers)
    const thStyle = isExcel 
        ? `border: 1pt solid #000; font-family: 'Khmer OS Muol Light', serif; font-size: 10pt; font-weight: normal; padding: 4px; text-align: center; vertical-align: middle;` 
        : ``;
    const tdStyle = isExcel 
        ? `border: 0.5pt solid #000; font-family: 'Khmer OS Siemreap', sans-serif; font-size: 10pt; padding: 3px; text-align: center; vertical-align: middle;` 
        : ``;
    const thVStyle = isExcel ? `${thStyle} mso-rotate: 90; height: 130px; white-space: nowrap; width: 35px; min-width: 35px;` : ``;
    
    // អនុគមន៍ជំនួយបង្កើតក្បាលតារាង (បញ្ឈរ និង ផ្តេក)
    const thV = (text, bg = "#f8fafc", color = "#000", rowSpan = 1) => {
        let rs = rowSpan > 1 ? ` rowspan="${rowSpan}"` : "";
        if(isExcel) return `<th${rs} style="${thVStyle} background-color:${bg}; color: ${color};">${text}</th>`;
        return `<th${rs} class="th-vert" style="background-color: ${bg};"><div class="div-vert" style="color: ${color};">${text}</div></th>`;
    };
    const thH = (text, bg = "#f8fafc", color = "#000", colSpan = 1, rowSpan = 1, width = "") => {
        let w = width ? `width: ${width};` : "";
        let rs = rowSpan > 1 ? ` rowspan="${rowSpan}"` : "";
        let cs = colSpan > 1 ? ` colspan="${colSpan}"` : "";
        return `<th${cs}${rs} style="${thStyle} background-color: ${bg}; color:${color}; ${w}">${text}</th>`;
    };

    // គូរក្បាលតារាង
    let thead1 = `<tr>
        ${thH("ល.រ", "#f1f5f9", "#000", 1, 2, "35px")}
        ${thH("ឈ្មោះសិស្ស", "#f1f5f9", "#000", 1, 2, "160px")}
        ${thH("ភេទ", "#f1f5f9", "#000", 1, 2, "40px")}
    `;
    let thead2 = `<tr>`;
    
    // បង្ហាញមុខវិជ្ជាតែសម្រាប់ ប្រចាំខែ និង ឆមាស ប៉ុណ្ណោះ
    if (type !== "annual") {
        window.activeSchema.forEach(g => {
            let bg = bgColors[g.group] || g.color || "#f8fafc"; 
            let subs = g.subs && g.subs.length > 0 ? g.subs : [{name: g.group, key: g.key}];
            let colSpan = type === "monthly" ? subs.length : subs.length * 2;
            
            thead1 += thH(g.group, bg, "#000", colSpan, 1);
            
            subs.forEach(s => {
                thead2 += thV(s.name, bg);
                if (type === "semester") thead2 += thV("ចំ.ថ្នាក់", bg, "#be123c");
            });
        });
    }

    if (type === "monthly") {
        thead1 += thV("ពិន្ទុសរុប", "#f1f5f9", "#000", 2);
        thead1 += thV("មធ្យមភាគ", "#eff6ff", "#1d4ed8", 2);
        thead1 += thV("ចំណាត់ថ្នាក់", "#fff1f2", "#be123c", 2);
        thead1 += thV("និទ្ទេស", "#ecfdf5", "#047857", 2);
        thead1 += thH("ការវាយតម្លៃ", "#faf5ff", "#7e22ce", 4, 1);
        
        thead2 += thV("ចំណេះដឹង", "#faf5ff", "#7e22ce");
        thead2 += thV("បំណិន", "#faf5ff", "#7e22ce");
        thead2 += thV("សីលធម៌", "#faf5ff", "#7e22ce");
        thead2 += thV("សាមគ្គីភាព", "#faf5ff", "#7e22ce");
    } else if (type === "semester") {
        thead1 += thV("ពិន្ទុសរុប", "#f1f5f9", "#000", 2);
        thead1 += thV("មធ្យមភាគ", "#eff6ff", "#1d4ed8", 2);
        thead1 += thV("ចំណាត់ថ្នាក់", "#fff1f2", "#be123c", 2);
        thead1 += thV("និទ្ទេស", "#ecfdf5", "#047857", 2);
        thead1 += thV("លទ្ធផល", "#f8fafc", "#000", 2);
        thead1 += thH("អវត្តមាន", "#f1f5f9", "#000", 3, 1);
        thead1 += thV("ផ្សេងៗ", "#f1f5f9", "#000", 2);
        
        thead2 += thV("ច្បាប់", "#f8fafc");
        thead2 += thV("ឥតច្បាប់", "#f8fafc");
        thead2 += thV("សរុប", "#f8fafc");
    } else if (type === "annual") {
        // សម្រាប់ប្រចាំឆ្នាំ៖ បង្ហាញតែ ម.ឆ.១ និង ម.ឆ.២ ជំនួសមុខវិជ្ជា
        thead1 += thV("ម.ឆ.១", "#e0e7ff", "#000", 2);
        thead1 += thV("ម.ឆ.២", "#dcfce7", "#000", 2);
        thead1 += thV("មធ្យមភាគ", "#eff6ff", "#1d4ed8", 2);
        thead1 += thV("ចំណាត់ថ្នាក់", "#fff1f2", "#be123c", 2);
        thead1 += thV("និទ្ទេស", "#ecfdf5", "#047857", 2);
        thead1 += thV("លទ្ធផល", "#f8fafc", "#000", 2);
        thead1 += thH("អវត្តមាន", "#f1f5f9", "#000", 3, 1);
        thead1 += thV("ផ្សេងៗ", "#f1f5f9", "#000", 2);
        
        thead2 += thV("ច្បាប់", "#f8fafc");
        thead2 += thV("ឥតច្បាប់", "#f8fafc");
        thead2 += thV("សរុប", "#f8fafc");
    }

    // គូរតួអត្ថបទ
    let tbody = ``;
    // 🟢 កែសម្រួលការគណនាស្ថិតិអូតូ 🟢
    let totalStus = window.rankingsDataList.length;
    let femaleStus = window.rankingsDataList.filter(s => s.gender === 'ស្រី').length;
    
    // កំណត់មធ្យមភាគជាប់គឺ ៥.០
    let passMark = 5.0; 
    if ((type === "semester" || type === "annual") && window.rankingsDataList.some(s => s.avg > 15)) {
        passMark = 25.0;
    }

    let passed = window.rankingsDataList.filter(s => s.avg >= passMark).length;
    let passedF = window.rankingsDataList.filter(s => s.avg >= passMark && s.gender === 'ស្រី').length;
    let failed = totalStus - passed;
    let failedF = femaleStus - passedF;

    stus.forEach((s, idx) => {
        let tr = `<tr>
            <td style="${tdStyle}">${idx + 1}</td>
            <td style="${tdStyle}" ${isExcel ? 'class="text-left"' : ''}>${s.name}</td>
            <td style="${tdStyle} color: ${s.gender === 'ស្រី' ? '#be123c' : '#000'}; font-weight: bold;">${s.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
        `;
        
        if (type !== "annual") {
            window.activeSchema.forEach(g => {
                let subs = g.subs && g.subs.length > 0 ? g.subs : [{key: g.key}];
                subs.forEach(sub => {
                    let score = s[sub.key] !== undefined && s[sub.key] !== "" ? parseFloat(s[sub.key]).toFixed(1).replace('.0','') : "";
                    let scoreColor = '#000';
                    if (score !== "") {
                        const max = window.schemaMaxMap[sub.key] || 10;
                        if (parseFloat(score) < max / 2) scoreColor = '#be123c';
                    }
                    tr += `<td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; font-weight: bold; color: ${scoreColor};">${score}</td>`;
                    
                    if (type === "semester") {
                        let rank = s[sub.key + "_rank"] || "";
                        tr += `<td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; font-weight: bold; color: #be123c;">${rank}</td>`;
                    }
                });
            });
        } else {
            // ទាញយកពិន្ទុឆមាសទី១ និងឆមាសទី២ មកបង្ហាញសម្រាប់ប្រចាំឆ្នាំ
            let sem1 = (s.sem1_avg !== undefined && s.sem1_avg !== "") ? parseFloat(s.sem1_avg).toFixed(2) : "";
            let sem2 = (s.sem2_avg !== undefined && s.sem2_avg !== "") ? parseFloat(s.sem2_avg).toFixed(2) : "";
            tr += `<td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; font-weight: bold; color: #3730a3; background-color: #e0e7ff;">${sem1}</td>`;
            tr += `<td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; font-weight: bold; color: #166534; background-color: #dcfce7;">${sem2}</td>`;
        }

        let tScore = type === 'semester' || type === 'annual' ? (s.total_exam || s.exam_avg || s.total_score || '') : (s.total_score || '');
        let avg = s.avg ? s.avg.toFixed(2) : '';
        let rank = s.rank || '';
        let gl = s.gradeLetter || s.grade_letter || '';

        if (type === "monthly") {
            tr += `
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; background-color: #f8fafc; font-weight: bold;">${tScore}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; color: #1d4ed8; font-weight: bold; background-color: #eff6ff;">${avg}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; color: #be123c; font-weight: bold; background-color: #fff1f2;">${rank}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; color: #047857; font-weight: bold; background-color: #ecfdf5;">${gl}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif;">${s.eval_knowledge || ''}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif;">${s.eval_skill || ''}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif;">${s.eval_moral || ''}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif;">${s.eval_solidarity || ''}</td>
            </tr>`;
        } else {
            let resultStr = s.avg >= passMark ? "ជាប់" : "ធ្លាក់";
            let resultColor = s.avg >= passMark ? "#16a34a" : "#be123c";
            tr += `
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; color: #1d4ed8; font-weight: bold; background-color: #eff6ff;">${avg}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; color: #be123c; font-weight: bold; background-color: #fff1f2;">${rank}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; color: #047857; font-weight: bold; background-color: #ecfdf5;">${gl}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; color: ${resultColor}; font-weight: bold;">${resultStr}</td>
                <td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif;"></td><td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif;"></td><td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif;"></td><td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif;"></td>
            </tr>`;
        }
        tbody += tr;
    });

    return `<table class="${tableClass}" style="${tableStyle}"><thead>${thead1}</tr>${thead2}</tr></thead><tbody>${tbody}</tbody></table>`;
};

// ==========================================
// ០៩. Print / PDF បញ្ជីពិន្ទុ (រចនាបែបផ្លូវការ - ក្បាលលិខិត Khmer OS Muol Light)
// ==========================================
window.printScoreList = function() {
    if(typeof window.calculateAllScores === 'function') window.calculateAllScores();
    if(!window.rankingsDataList || window.rankingsDataList.length === 0) return alert("⚠️ គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";

    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.....................";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = sInfo.teacher_name || ".......................";
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    let titleText = `បញ្ជីស្រង់ពិន្ទុប្រចាំខែ${month}`;
    if (type === "semester") titleText = month.includes("ឆមាសទី១") ? "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសលើកទី១" : (month.includes("ឆមាសទី២") ? "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសលើកទី២" : `បញ្ជីស្រង់ពិន្ទុប្រឡង${month}`);
    else if (type === "annual") titleText = `បញ្ជីស្រង់ពិន្ទុប្រចាំឆ្នាំសិក្សា`;

    // 🟢 ទាញយកកាលបរិច្ឆេទពីប្រព័ន្ធកំណត់ថ្មី (Settings Panel) និងសម្អាតកុំឱ្យជាន់គ្នា 🟢
    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim();
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();

    // ១. កាត់យកតែផ្នែក "ថ្ងៃទី..." ចេញពី sDate បើវាមានជាប់ពាក្យ "ធ្វើនៅ" មកជាមួយ
    if (sDate.includes("ថ្ងៃទី")) {
        sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    }

    // ២. លុបសញ្ញាក្បៀស (,) ខាងចុងនៃទីតាំងចេញ ដើម្បីកុំឱ្យជាន់គ្នា
    locationStr = locationStr.replace(/,+$/, '').trim();

    // ៣. បញ្ចូលគ្នាដើម្បីទទួលបានទម្រង់ត្រឹមត្រូវ (ឧ. ធ្វើនៅកៀនស្វាយ, ថ្ងៃទី...)
    const solarDateStr = `${locationStr}, ${sDate}`;

    // ៤. ទាញយកថ្ងៃខែចន្ទគតិ (បើក/បិទ)
    const lunarDateStr = rDates.showLunar !== false 
        ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") 
        : "";

    let htmlTable = window.getAdvancedScoreTableHtml(false, false);

    // 🟢 កែសម្រួលការគណនាស្ថិតិអូតូ 🟢
    let totalStus = window.rankingsDataList.length;
    let femaleStus = window.rankingsDataList.filter(s => s.gender === 'ស្រី').length;
    
    // កំណត់មធ្យមភាគជាប់គឺ ៥.០
    let passMark = 5.0; 
    if ((type === "semester" || type === "annual") && window.rankingsDataList.some(s => s.avg > 15)) {
        passMark = 25.0;
    }

    let passed = window.rankingsDataList.filter(s => s.avg >= passMark).length;
    let passedF = window.rankingsDataList.filter(s => s.avg >= passMark && s.gender === 'ស្រី').length;
    let failed = totalStus - passed;
    let failedF = femaleStus - passedF;

    let passPct = totalStus > 0 ? ((passed / totalStus) * 100).toFixed(2) : "0.00";
    let failPct = totalStus > 0 ? ((failed / totalStus) * 100).toFixed(2) : "0.00";
    let passFPct = femaleStus > 0 ? ((passedF / femaleStus) * 100).toFixed(2) : "0.00";
    let failFPct = femaleStus > 0 ? ((failedF / femaleStus) * 100).toFixed(2) : "0.00";

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>${titleText} - ${grade}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
          @page { size: A4 landscape; margin: 8mm 10mm; }
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', 'Khmer OS Siemreap', sans-serif; }
          html, body { margin: 0; padding: 0; background: #fff; color: #000; }
          
          /* កំណត់ Font Muol Light ជាផ្លូវការ */
          .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
          
          /* ក្បាលរដ្ឋបាល */
          .header-box {display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; width: 100%; }
          .header-left {text-align: left; padding-left: 10px; }
          .header-left p { margin: 0 0 4px 0; font-size: 11pt; font-family: 'Khmer OS Muol Light', 'Moul', serif !important; }
          .header-right {text-align: center; padding-right: 20px; }
          .header-right p { margin: 0 0 4px 0; font-size: 12pt; font-family: 'Khmer OS Muol Light', 'Moul', serif !important; }
          
          /* ចំណងជើងធំ */
          .title-box { text-align: center; margin: 15px 0 20px 0; }
          .title-box h2 { margin: 0 0 0px 0; font-size: 14pt; color: #ff0000; font-family: 'Khmer OS Muol Light', 'Moul', serif !important; }
          .title-box p { margin: 0; font-size: 12pt; font-weight: bold; font-family: 'Siemreap', 'Khmer OS Siemreap', sans-serif; }
          
          /* តារាងពិន្ទុ */
          table.main-table { width: 100%; margin: 0 auto 15px auto; border-collapse: collapse; text-align: center; border: 1.5pt solid #000; }
          .main-table th { font-family: 'Khmer OS Siemreap', 'Siemreap', serif !important; font-size: 11pt; font-weight: bold; border: 1pt solid #000; padding: 6px 2px; vertical-align: middle; }
          .main-table td { border: 1pt solid #475569; padding: 4px 2px; height: 26px; font-size: 11pt; vertical-align: middle; text-align: center; }
          .main-table tbody tr:nth-child(even) td { background-color: #f8fafc; }
          .main-table td:nth-child(2) { text-align: left; padding-left: 8px; white-space: nowrap; }
          
          /* អក្សរឈរ (Vertical Text) សម្រាប់ក្បាលតារាង */
          .th-vert { height: 130px; max-height: 130px; vertical-align: middle; text-align: center; padding: 0; width: 35px; min-width: 35px; }
          .div-vert {
              writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; height: 120px;
              display: flex; justify-content: center; align-items: center; margin: 0 auto;
              font-family: 'Khmer OS Siemreap', 'Siemreap', serif !important; font-size: 10pt; font-weight: bold;
          }

          /* ស្ថិតិ និង ហត្ថលេខា */
          .summary-table { width: 100%; font-size: 11pt; border-collapse: collapse; margin-bottom: 20px; }
          .summary-table td { padding: 3px 0; border: none; text-align: left; }
          .bottom-sig-container { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; page-break-inside: avoid; padding: 0 30px; margin-top: 10px; }
          .sig-box-left { width: 40%; text-align: center; }
          .sig-box-right { width: 40%; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-left"><br><br>
            <p>ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}</p>
            <p>${schoolName}</p>
            <p>${grade}</p>
          </div>
          <div class="header-right">
            <p>ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p>ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
           <!-- ក្បាច់រចនាប័ទ្ម Tacteing គូរដោយ HTML សុទ្ធ (ធានា ១០០% ដើរលើគ្រប់ទូរស័ព្ទ) -->
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
                        <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
                        <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
                        <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
                    </div>
          </div>
        </div>

        <div class="title-box">
          <h2>${titleText}</h2>
          <p>ឆ្នាំសិក្សា ៖ ${academicYear}</p>
        </div>

        ${htmlTable}

        <table class="summary-table">
            <tr>
                <td style="width: 100%;">
                    ❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${totalStus}</b> សិស្សសរុប <b>${totalStus}</b> នាក់ ស្រី <b>${femaleStus}</b> នាក់
                </td>
            </tr>
            <tr>
                <td style="width: 100%;">
                    ❖ សិស្សជាប់មធ្យមភាគ <b>${passed}</b> នាក់ (<b>${passPct}%</b>) ស្រី <b>${passedF}</b> នាក់ (<b>${passFPct}%</b>)
                </td>
            </tr>
            <tr>
                <td style="width: 100%;">
                    ❖ សិស្សធ្លាក់មធ្យមភាគ <b>${failed}</b> នាក់ (<b>${failPct}%</b>) ស្រី <b>${failedF}</b> នាក់ (<b>${failFPct}%</b>)
                </td>
            </tr>
        </table>

        <div class="bottom-sig-container">
            <div class="sig-box-left"><br><br>
                <p class="font-moul" style="margin-bottom: 5px; font-size: 11pt;">បានឃើញ និងឯកភាព</p>
                <p class="font-moul" style="margin-bottom: 60px; font-size: 11pt;">នាយកសាលា</p>
            </div>
            <div class="sig-box-right">
                <p style="margin: 0 0 5px 0; font-size: 11pt; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${lunarDateStr}</p>
                <p style="margin: 0 0 5px 0; font-size: 11pt; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${solarDateStr}</p>
                <p class="font-moul" style="margin-bottom: 60px; font-size: 11pt;">គ្រូបន្ទុកថ្នាក់</p>
                <p class="font-moul" style="font-size: 11pt;">${teacherName}</p>
            </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("⚠️ សូមអនុញ្ញាត Pop-up នៅក្នុង Browser របស់អ្នក។");
    
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 1000);
};

// ==========================================
// មុខងារ Export តារាងបញ្ជីពិន្ទុទៅកាន់ Excel (ទាញពី Data-Driven Approach ដោយផ្ទាល់)
// ==========================================
window.exportScoreEntryToExcel = function() {
    if(!window.rankingsDataList || window.rankingsDataList.length === 0) {
        if(typeof window.calculateAllScores === 'function') window.calculateAllScores();
        if(!window.rankingsDataList || window.rankingsDataList.length === 0) return alert("គ្មានទិន្នន័យដើម្បីទាញយកទេ!");
    }

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";

    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.....................";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = window.AuthState ? window.AuthState.teacherName : (localStorage.getItem('auth_teacher_name') || '.......................');
    const academicYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";
    const filename = `បញ្ជីស្រង់ពិន្ទុ_${grade.replace(/ /g, '_')}_${month}.xls`;

    let titleText = `បញ្ជីស្រង់ពិន្ទុប្រចាំខែ${month}`;
    if (type === "semester") titleText = month.includes("ឆមាសទី១") ? "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសលើកទី១" : (month.includes("ឆមាសទី២") ? "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសលើកទី២" : `បញ្ជីស្រង់ពិន្ទុប្រឡង${month}`);
    else if (type === "annual") titleText = `បញ្ជីស្រង់ពិន្ទុប្រចាំឆ្នាំសិក្សា`;

    // 🟢 ទាញយកកាលបរិច្ឆេទពីប្រព័ន្ធកំណត់ថ្មី (Settings Panel) និងសម្អាតកុំឱ្យជាន់គ្នា 🟢
    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim();
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();

    // ១. កាត់យកតែផ្នែក "ថ្ងៃទី..." ចេញពី sDate បើវាមានជាប់ពាក្យ "ធ្វើនៅ" មកជាមួយ
    if (sDate.includes("ថ្ងៃទី")) {
        sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    }

    // ២. លុបសញ្ញាក្បៀស (,) ខាងចុងនៃទីតាំងចេញ ដើម្បីកុំឱ្យជាន់គ្នា
    locationStr = locationStr.replace(/,+$/, '').trim();

    // ៣. បញ្ចូលគ្នាដើម្បីទទួលបានទម្រង់ត្រឹមត្រូវ (ឧ. ធ្វើនៅកៀនស្វាយ, ថ្ងៃទី...)
    const solarDateStr = `${locationStr}, ${sDate}`;

    // ៤. ទាញយកថ្ងៃខែចន្ទគតិ (បើក/បិទ)
    const lunarDateStr = rDates.showLunar !== false 
        ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") 
        : "";

    // យកតារាងដែលរៀបចំរួចជាស្រេចពីអនុគមន៍ខាងលើ (isExcel = true, isRanking = false)
    let htmlTable = window.getAdvancedScoreTableHtml(true, false);

    // កែសម្រួលការគណនាស្ថិតិអូតូ 
    let totalStus = window.rankingsDataList.length;
    let femaleStus = window.rankingsDataList.filter(s => s.gender === 'ស្រី').length;
    
    // កំណត់មធ្យមភាគជាប់គឺ ៥.០
    let passMark = 5.0; 
    if ((type === "semester" || type === "annual") && window.rankingsDataList.some(s => s.avg > 15)) {
        passMark = 25.0;
    }

    // គណនាស្ថិតិអូតូ
   
    let passed = window.rankingsDataList.filter(s => s.avg >= passMark).length;
    let passedF = window.rankingsDataList.filter(s => s.avg >= passMark && s.gender === 'ស្រី').length;
    let failed = totalStus - passed;
    let failedF = femaleStus - passedF;

    let passPct = totalStus > 0 ? ((passed / totalStus) * 100).toFixed(2) : "0.00";
    let failPct = totalStus > 0 ? ((failed / totalStus) * 100).toFixed(2) : "0.00";
    let passFPct = femaleStus > 0 ? ((passedF / femaleStus) * 100).toFixed(2) : "0.00";
    let failFPct = femaleStus > 0 ? ((failedF / femaleStus) * 100).toFixed(2) : "0.00";

    // បង្កើតក្បាល HTML
    let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <style>
                table { border-collapse: collapse; white-space: nowrap; font-family: "Khmer OS Siemreap", sans-serif; }
            </style>
            <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>បញ្ជីពិន្ទុ</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head>
        <body>
            <table>
                <!-- ក្បាលលិខិត (Inline Font Family សម្រាប់ Excel) -->
                <tr>
                    <td colspan="15" style="border: none; text-align: left; vertical-align: top; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 11pt; padding-left: 10px;">
                        ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}<br>
                        ${schoolName}<br>
                        ${grade}
                    </td>
                    <td colspan="15" style="border: none; text-align: center; vertical-align: top; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 12pt;">
                        ព្រះរាជាណាចក្រកម្ពុជា<br>
                        ជាតិ សាសនា ព្រះមហាក្សត្រ<br>
                        <!-- ក្បាច់រចនាប័ទ្ម Tacteing គូរដោយ HTML សុទ្ធ (ធានា ១០០% ដើរលើគ្រប់ទូរស័ព្ទ) -->
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
                                <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
                                <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
                                <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
                            </div>
                </tr>
                <tr><td colspan="15" style="border: none; height: 15px;"></td></tr>
                
                <!-- ចំណងជើង (Inline Font Family) -->
                <tr>
                    <td colspan="31" style="border: none; text-align: center; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 14pt; color: red;">
                        ${titleText}
                    </td>
                </tr>
                <tr>
                    <td colspan="31" style="border: none; text-align: center; font-family: 'Khmer OS Siemreap', sans-serif; font-size: 11pt; font-weight: bold;">
                        ឆ្នាំសិក្សា ៖ ${academicYear}
                    </td>
                </tr>
                <tr><td colspan="30" style="border: none; height: 10px;"></td></tr>
                
            </table>

            <!-- តារាងពិន្ទុកណ្តាលដែលបាន Render រួច -->
            ${htmlTable}

            <table>
                <tr><td colspan="15" style="border: none; height: 10px;"></td></tr>
                
                <!-- ស្ថិតិសង្ខេប (លេខសកល) -->
                <tr>
                    <td colspan="15" style="border: none; font-family: 'Khmer OS Siemreap', sans-serif; text-align: left; font-size: 11pt; padding-left: 10px;">
                        ❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${totalStus}</b> សិស្សសរុប <b>${totalStus}</b> នាក់ ស្រី <b>${femaleStus}</b> នាក់
                    </td>
                </tr>
                <tr>
                    <td colspan="15" style="border: none; font-family: 'Khmer OS Siemreap', sans-serif; text-align: left; font-size: 11pt; padding-left: 10px;">
                        ❖ សិស្សជាប់មធ្យមភាគ <b>${passed}</b> នាក់ (<b>${passPct}%</b>) ស្រី <b>${passedF}</b> នាក់ (<b>${passFPct}%</b>)
                    </td>
                </tr>
                <tr>
                    <td colspan="15" style="border: none; font-family: 'Khmer OS Siemreap', sans-serif; text-align: left; font-size: 11pt; padding-left: 10px;">
                        ❖ សិស្សធ្លាក់មធ្យមភាគ <b>${failed}</b> នាក់ (<b>${failPct}%</b>) ស្រី <b>${failedF}</b> នាក់ (<b>${failFPct}%</b>)
                    </td>
                </tr>
                <tr><td colspan="15" style="border: none; height: 20px;"></td></tr>
                
                <!-- ហត្ថលេខា (Inline Font Family) -->
                <tr>
                    <td colspan="15" style="border: none; text-align: center; vertical-align: bottom; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 11pt;">
                        បានឃើញ និងឯកភាព<br>
                        នាយកសាលា
                    </td>
                    <td colspan="15" style="border: none; text-align: center; vertical-align: bottom; font-family: 'Khmer OS Siemreap', sans-serif; font-size: 11pt;">
                        ${lunarDateStr}<br>
                        ${solarDateStr}<br>
                        <span style="font-family: 'Khmer OS Muol Light', Moul, serif;">គ្រូបន្ទុកថ្នាក់</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="15" style="border: none; height: 70px;"></td>
                    <td colspan="15" style="border: none; height: 70px;"></td>
                </tr>
                <tr>
                    <td colspan="15" style="border: none; text-align: center; vertical-align: bottom; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 11pt;">
                        ${principalName}
                    </td>
                    <td colspan="15" style="border: none; text-align: center; vertical-align: bottom; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 11pt;">
                        ${teacherName}
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    // បញ្ចេញឯកសារ
    const blob = new Blob(['\ufeff' + excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
};
// =====================================================================
// ១០. មុខងារ IMPORT EXCEL (បញ្ចូលពិន្ទុពីឯកសារ Excel)
// =====================================================================
window.selectedExcelFile = null;

window.openImportExcelModal = function() {
    if (typeof XLSX === 'undefined') {
        alert("⚠️ សូមប្រាកដថាអ្នកបានបន្ថែម Library XLSX នៅក្នុង index.html ជាមុនសិន!");
        return;
    }
    window.selectedExcelFile = null;

    let modalHtml = `
      <div id="importExcelModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center p-4 font-siemreap transition-all" style="z-index: 999999;">
        <div class="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-xl overflow-hidden flex flex-col transform transition-all scale-100 border border-slate-200 relative">
            <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex justify-between items-center shadow-md">
                <h3 class="font-moul text-white text-base drop-shadow-md flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner border border-white/20"><i class="fa-solid fa-file-import"></i></div>
                    បញ្ចូលពិន្ទុតាមរយៈ Excel (Import)
                </h3>
                <button onclick="document.getElementById('importExcelModal').remove()" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition shadow-sm border border-white/10"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            
            <div class="p-6 bg-slate-50 space-y-6">
                <!-- ជំហានទី ១ -->
                <div class="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div class="flex gap-4 items-center">
                        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black text-lg flex items-center justify-center border-2 border-blue-200">១</div>
                        <div class="flex-1">
                            <h4 class="font-moul text-blue-900 text-[13px] mb-1">ទាញយកគំរូ Excel (Download Template)</h4>
                            <p class="text-[11px] text-slate-500 mb-3">ប្រព័ន្ធនឹងបង្កើតឯកសារ Excel ដែលមានឈ្មោះសិស្ស និងមុខវិជ្ជាស្រាប់។ លោកអ្នកគ្រាន់តែវាយពិន្ទុចូលប្រអប់។</p>
                            <button onclick="window.downloadExcelTemplate()" class="px-5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition flex items-center gap-2 border border-blue-200 shadow-sm"><i class="fa-solid fa-download"></i> ទាញយកគំរូឥឡូវនេះ</button>
                        </div>
                    </div>
                </div>

                <!-- ជំហានទី ២ -->
                <div class="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <div class="flex gap-4 items-center">
                        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-black text-lg flex items-center justify-center border-2 border-emerald-200">២</div>
                        <div class="flex-1">
                            <h4 class="font-moul text-emerald-900 text-[13px] mb-1">ជ្រើសរើសឯកសារបញ្ជូល (Upload)</h4>
                            <p class="text-[11px] text-slate-500 mb-3">ជ្រើសរើសឯកសារ <b>.xlsx</b> ដែលលោកអ្នកបានវាយពិន្ទុពេញលេញ ដើម្បីទាញចូលប្រព័ន្ធ។</p>
                            
                            <label id="uploadLabelBox" class="w-full flex justify-center items-center px-4 py-4 bg-emerald-50 text-emerald-700 rounded-xl tracking-wide border border-dashed border-emerald-300 cursor-pointer hover:bg-emerald-100 transition shadow-sm font-bold text-xs gap-2">
                                <i class="fa-solid fa-cloud-arrow-up text-lg"></i>
                                <span id="importFileName" class="truncate max-w-[250px]">ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ</span>
                                <input type="file" accept=".xlsx, .xls" class="hidden" onchange="window.handleExcelSelect(event)" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🟢 ប៊ូតុងបញ្ជាក់ និងបោះបង់ 🟢 -->
            <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button onclick="document.getElementById('importExcelModal').remove()" class="px-5 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-sm">បោះបង់</button>
                <button id="btnConfirmImport" onclick="window.processExcelImport()" disabled class="px-6 py-2.5 rounded-xl text-white font-bold bg-emerald-500 hover:bg-emerald-600 opacity-50 cursor-not-allowed shadow-md flex items-center gap-2 transition-all transform text-sm">
                    <i class="fa-solid fa-check-circle"></i> បញ្ជាក់ការទាញចូល
                </button>
            </div>
        </div>
      </div>
    `;

    const oldModal = document.getElementById('importExcelModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// ដំណើរការពេលជ្រើសរើសឯកសាររួច
window.handleExcelSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    window.selectedExcelFile = file;
    document.getElementById('importFileName').innerText = file.name;
    const labelBox = document.getElementById('uploadLabelBox');
    labelBox.classList.remove('bg-emerald-50', 'border-emerald-300', 'text-emerald-700', 'border-dashed');
    labelBox.classList.add('bg-indigo-50', 'border-indigo-300', 'text-indigo-800', 'border-solid');
    
    const btn = document.getElementById('btnConfirmImport');
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-emerald-500', 'hover:bg-emerald-600');
    btn.classList.add('bg-gradient-to-r', 'from-indigo-600', 'to-blue-600', 'hover:from-indigo-700', 'hover:to-blue-700', 'hover:-translate-y-0.5');
};

// ១០.៣ ដំណើរការទាញពិន្ទុចូលពេលចុច "បញ្ជាក់ការទាញចូល" (ឆ្លាតវៃជាងមុន)
window.processExcelImport = function() {
    if (!window.selectedExcelFile) return alert("សូមជ្រើសរើសឯកសារជាមុនសិន!");

    const btn = document.getElementById('btnConfirmImport');
    const originalBtnHtml = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងដំណើរការ...`;
    btn.disabled = true;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            
            if(rows.length < 2) throw new Error("ឯកសារ Excel ទទេ ឬខុសទម្រង់!");

            // ១. ស្វែងរកទីតាំងក្បាលតារាងពិតប្រាកដ
            let headerRowIndex = -1;
            for(let i = 0; i < rows.length; i++) {
                let row = rows[i];
                if (row && row.some(cell => String(cell).includes('អត្តលេខ') || String(cell).includes('ឈ្មោះ'))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if(headerRowIndex === -1) throw new Error("ប្រព័ន្ធរកមិនឃើញជួរក្បាលតារាងដែលមានពាក្យ 'អត្តលេខ' ឬ 'ឈ្មោះសិស្ស' ទេ!");

            const headerRow = rows[headerRowIndex];
            let colMap = {}; 
            
            // ២. ព្យាយាម Map កូឡោនតាមសញ្ញា [Key] (សម្រាប់ Template ថ្មី)
            headerRow.forEach((colName, index) => {
                let cName = String(colName || "").trim();
                if(cName.includes('[') && cName.includes(']')) {
                    const match = cName.match(/\[(.*?)\]/);
                    if(match && match[1]) colMap[match[1].trim()] = index; 
                }
            });

            // ៣. បើជា Template ចាស់ (អត់មាន [Key]) យើងប្រើលំដាប់កូឡោនបន្ទាប់ពី "ភេទ"
            if(Object.keys(colMap).length === 0) {
                let genderColIndex = headerRow.findIndex(h => String(h).includes('ភេទ'));
                let startCol = genderColIndex !== -1 ? genderColIndex + 1 : 4;
                window.activeSubjectKeys.forEach((key, i) => {
                    colMap[key] = startCol + i;
                });
            }

            // ៤. ស្វែងរកកូឡោន ID និង ឈ្មោះ
            let idColIndex = headerRow.findIndex(h => String(h).includes('អត្តលេខ') || String(h).includes('ID'));
            if (idColIndex === -1) idColIndex = 1; // Default
            
            let nameColIndex = headerRow.findIndex(h => String(h).includes('ឈ្មោះ'));
            if (nameColIndex === -1) nameColIndex = 2; // Default

            const type = document.getElementById("globalPeriodType")?.value || "monthly";
            const month = document.getElementById("globalPeriodValue")?.value || "មករា";
            let importedCount = 0;
            let notFoundStudents = 0;

            // ៥. ទាញទិន្នន័យបញ្ចូល
            for(let i = headerRowIndex + 1; i < rows.length; i++) {
                let row = rows[i];
                if (!row || row.length === 0) continue;

                let stuId = String(row[idColIndex] || "").trim(); 
                let stuName = String(row[nameColIndex] || "").trim(); 
                
                // រំលងប៊ូតុងទទេ ឬ ក្បាលហត្ថលេខាខាងក្រោមតារាង
                if(stuId.includes("ធ្វើនៅ") || stuName.includes("នាយកសាលា")) continue; 
                if(!stuId && !stuName) continue;

                // ផ្ទៀងផ្ទាត់សិស្ស តាម ID, បើអត់ឃើញ ផ្ទៀងផ្ទាត់តាម ឈ្មោះ
                let stuExists = window.scoresStudentList.find(s => String(s.id).trim() === stuId);
                if(!stuExists) {
                    stuExists = window.scoresStudentList.find(s => String(s.name).trim() === stuName);
                }

                if(!stuExists) {
                    notFoundStudents++;
                    continue; // បើនៅតែរកសិស្សមិនឃើញ រំលងជួរនេះ
                }

                // បញ្ចូលពិន្ទុ
                window.activeSubjectKeys.forEach(key => {
                    let colIndex = colMap[key];
                    if(colIndex !== undefined && row[colIndex] !== undefined && row[colIndex] !== "") {
                        let scoreVal = String(row[colIndex]).trim();
                        
                        let inputIdMainTable = `${key}_${stuExists.id}`;
                        if (type === "annual") inputIdMainTable = `${key}_s1_${stuExists.id}`; 
                        if (type === "semester") inputIdMainTable = `${key}_${month.includes("២") ? "s2" : "s1"}_${stuExists.id}`;

                        const inputEl = document.getElementById(inputIdMainTable);
                        if(inputEl) {
                            inputEl.value = scoreVal;
                            importedCount++;
                            const maxVal = window.schemaMaxMap[key] || 10;
                            if (parseFloat(scoreVal) < maxVal / 2) { 
                                inputEl.classList.add("text-rose-600"); 
                                inputEl.classList.remove("text-slate-800"); 
                            } else { 
                                inputEl.classList.remove("text-rose-600"); 
                                inputEl.classList.add("text-slate-800"); 
                            }
                        }
                    }
                });
            }

            // ៦. គណនាឡើងវិញ
            window.calculateAllScores();
            window.markUnsaved();
            
            const modal = document.getElementById('importExcelModal');
            if (modal) modal.remove();
            
            // ៧. បង្ហាញលទ្ធផលច្បាស់លាស់
            if (importedCount === 0) {
                alert("⚠️ មិនមានទិន្នន័យត្រូវបានទាញចូលទេ។ សូមពិនិត្យមើលឯកសារ Excel របស់អ្នកឡើងវិញ (ប្រហែលជាខុសទម្រង់ ឬខុសឈ្មោះសិស្ស)។");
            } else {
                let msg = `✅ ទាញពិន្ទុបានជោគជ័យ ចំនួន ${importedCount} ក្រឡា!`;
                if(notFoundStudents > 0) msg += `\n⚠️ មានសិស្សចំនួន ${notFoundStudents} នាក់នៅក្នុង Excel រកមិនឃើញក្នុងប្រព័ន្ធ។`;
                
                if (typeof showToast === 'function') showToast(msg);
                else alert(msg);
            }
            
        } catch (err) {
            alert("⚠️ បរាជ័យក្នុងការទាញចូល: " + err.message);
        } finally {
            const existingBtn = document.getElementById('btnConfirmImport');
            if(existingBtn) {
                existingBtn.innerHTML = originalBtnHtml;
                existingBtn.disabled = false;
            }
        }
    };
    
    reader.onerror = function() {
        alert("⚠️ មានបញ្ហាក្នុងការអានឯកសារ!");
        btn.innerHTML = originalBtnHtml;
        btn.disabled = false;
    };
    
    reader.readAsArrayBuffer(window.selectedExcelFile);
};

// ទាញយកគំរូទម្រង់ (Export Beautiful Excel Template)
window.downloadExcelTemplate = function() {
    if(!window.scoresStudentList || window.scoresStudentList.length === 0) return alert("មិនមានទិន្នន័យសិស្សទេ!");
    if (typeof XLSX === 'undefined') return alert("Library XLSX មិនដំណើរការទេ! សូមប្រាកដថាបានបន្ថែមវាក្នុង index.html");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
    const academicYear = sInfo.academic_year || "2026-2027";
    
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    
    let titleText = `ទម្រង់បញ្ចូលពិន្ទុប្រចាំខែ${month}`;
    if (type === "semester") titleText = `ទម្រង់បញ្ចូលពិន្ទុប្រចាំ${month}`;
    else if (type === "annual") titleText = `ទម្រង់បញ្ចូលពិន្ទុប្រចាំឆ្នាំសិក្សា`;

    // ---------------- ក្បាលតារាង (Headers) ----------------
    let headerTh = `
        <th style="width: 50px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">ល.រ</th>
        <th style="width: 120px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">អត្តលេខ (ID)</th>
        <th style="width: 200px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">ឈ្មោះសិស្ស</th>
        <th style="width: 60px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">ភេទ</th>
    `;
    
    window.activeSchema.forEach(g => {
        let subs = g.subs && g.subs.length > 0 ? g.subs : [{name: g.group, key: g.key}];
        subs.forEach(s => {
            headerTh += `<th style="width: 100px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">${s.name}<br><span style="font-size: 8pt; color: #64748b; font-family: 'Arial', sans-serif;">[${s.key}]</span></th>`;
        });
    });

    // ---------------- ទិន្នន័យសិស្ស (Data Rows) ----------------
    let tbodyStr = "";
    window.scoresStudentList.forEach((s, idx) => {
        let tr = `<tr style="height: 28px;">
            <td style="border: 1px solid #000000; text-align: center; font-family: 'Times New Roman', serif; font-size: 11pt;">${idx + 1}</td>
            <td style="border: 1px solid #000000; text-align: center; font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #1e3a8a;">${s.id}</td>
            <td style="border: 1px solid #000000; text-align: left; padding-left: 8px; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 11pt;">${s.name}</td>
            <td style="border: 1px solid #000000; text-align: center; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 11pt; font-weight: bold; color: ${s.gender==='ស្រី'?'#e11d48':'#1e3a8a'};">${s.gender}</td>`;
        
        window.activeSubjectKeys.forEach(k => {
            tr += `<td style="border: 1px solid #000000; text-align: center; font-family: 'Times New Roman', serif; font-weight: bold; font-size: 12pt;"></td>`;
        });
        tr += `</tr>`;
        tbodyStr += tr;
    });

    let totalCols = 4 + window.activeSubjectKeys.length;
    let leftCols = Math.floor(totalCols / 2);
    let rightCols = totalCols - leftCols;

    // ---------------- បង្កើត HTML Excel ពេញលេញ ----------------
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"></head>
    <body>
        <table border="0" style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td colspan="${leftCols}" style="text-align: left; vertical-align: top;"><br>
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 11pt; color: #1e3a8a;">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}</b><br>
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a;">${schoolName}</b><br>
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a;">ថ្នាក់ទី ${grade}</b>
                </td>
                <td colspan="${rightCols}" style="text-align: right; vertical-align: top;">
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a;">ព្រះរាជាណាចក្រកម្ពុជា</b><br>
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a;">ជាតិ សាសនា ព្រះមហាក្សត្រ</b><br>
                    <span style="color: #d97706; font-size: 11pt;">❖ ❖ ❖</span>
                </td>
            </tr>
        </table>

        <table border="0" style="width: 100%; margin-bottom: 15px;">
            <tr>
                <td colspan="${totalCols}" style="text-align: center; padding-top: 10px;">
                    <h2 style="margin: 0; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 16pt; color: #e11d48;">${titleText}</h2>
                </td>
            </tr>
            <tr>
                <td colspan="${totalCols}" style="text-align: center; font-size: 11pt; font-weight: bold; color: #334155; padding-bottom: 10px; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                    ឆ្នាំសិក្សា ៖ ${window.toKhmerNum(academicYear)}
                </td>
            </tr>
        </table>

        <table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1px solid #000000;">
            <tr>${headerTh}</tr>
            ${tbodyStr}
        </table>
        
        <br>
        
        <table border="0" style="width: 100%; margin-top: 20px;">
            <tr>
                <td colspan="${leftCols}" style="text-align: center; vertical-align: top;">
                    <p style="font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 11pt;">បានឃើញ និងឯកភាព</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a; margin-top: 10px;">នាយកសាលា</p>
                </td>
                <td colspan="${rightCols}" style="text-align: center; vertical-align: top;">
                    <p style="font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 11pt;">ធ្វើនៅ...................., ថ្ងៃទី........ ខែ........ ឆ្នាំ ២០២...</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a; margin-top: 10px;">គ្រូប្រចាំថ្នាក់</p>
                </td>
            </tr>
        </table>
    </body>
    </html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Score_Template_${grade.replace(/ /g, '_')}_${month}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ==========================================
// មុខងារបង្ហាញសញ្ញាព្រមាន "មិនទាន់រក្សាទុក" ពេលមានការប្រែប្រួលពិន្ទុ
// ==========================================
window.markUnsaved = function() { 
    window.hasUnsavedChanges = true; 
    const badge = document.getElementById("unsavedBadge");
    if (badge) {
        badge.classList.remove("hidden"); 
    }
};

// មុខងារស្វែងរកសិស្សក្នុងតារាង
window.filterScoreTable = function() {
    const term = document.getElementById("scoreSearchInput")?.value.toLowerCase() || "";
    const rows = document.querySelectorAll("#scoresTableBody tr[id^='row_']");
    rows.forEach(row => { 
        const name = row.querySelector("td:nth-child(2)").textContent.toLowerCase(); 
        row.style.display = name.includes(term) ? "" : "none"; 
    });
};
// ==========================================
// មុខងារអានឯកសារ Excel (Import) - ដោះស្រាយបញ្ហាបញ្ចូលក្រឡាខុស
// ==========================================
window.handleExcelUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('importFileName').innerText = file.name;
    document.getElementById('importFileName').parentElement.classList.add('bg-indigo-100', 'border-indigo-300', 'text-indigo-700');

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // យកទិន្នន័យទាំងអស់ពី Sheet
        const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});
        
        if(rows.length < 2) return alert("ឯកសារ Excel ទទេ ឬខុសទម្រង់!");

        // ១. រកទីតាំងក្បាលតារាងពិតប្រាកដ (Header Row) ដែលមានពាក្យ "អត្តលេខ" ឬ "ID"
        let headerRowIndex = -1;
        for(let i = 0; i < rows.length; i++) {
            let row = rows[i];
            if (row && row.some(cell => String(cell).includes('អត្តលេខ') || String(cell).includes('ID'))) {
                headerRowIndex = i;
                break;
            }
        }

        if(headerRowIndex === -1) {
            return alert("⚠️ ឯកសារ Excel ខុសទម្រង់! ប្រព័ន្ធរកមិនឃើញជួរក្បាលតារាងដែលមានពាក្យ 'អត្តលេខ' ទេ។");
        }

        const headerRow = rows[headerRowIndex];
        let colMap = {}; // ផែនទីសម្រាប់ផ្ទុក Index កូឡោន
        
        // ២. Mapping កូឡោនយ៉ាងឆ្លាតវៃ ដោយផ្អែកលើ [Key] ដែលបានកំណត់
        headerRow.forEach((colName, index) => {
            let strName = String(colName || "").trim();
            // ស្វែងរកអក្សរដែលនៅក្នុងវង់ក្រចក [ ]
            if(strName.includes('[') && strName.includes(']')) {
                const match = strName.match(/\[(.*?)\]/);
                if(match && match[1]) {
                    // បង្កើតផែនទី: ឧ. colMap['k_write'] = 5 (មានន័យថា សំណេរ នៅកូឡោនទី ៦)
                    colMap[match[1].trim()] = index; 
                }
            }
        });

        const type = document.getElementById("globalPeriodType")?.value || "monthly";
        const month = document.getElementById("globalPeriodValue")?.value || "មករា";

        let importedCount = 0;

        // ៣. បញ្ចូលទិន្នន័យ (ចាប់ផ្តើមពីជួរបន្ទាប់ពី Header)
        for(let i = headerRowIndex + 1; i < rows.length; i++) {
            let row = rows[i];
            if (!row || row.length === 0) continue;

            // ស្វែងរកលេខកូឡោនអត្តលេខ (ID)
            let idColIndex = headerRow.findIndex(h => String(h).includes('អត្តលេខ') || String(h).includes('ID'));
            if(idColIndex === -1) idColIndex = 1; // Default
            
            let stuId = String(row[idColIndex] || "").trim();
            
            // រំលងជួរទទេ ឬជើងឯកសារ
            if(!stuId || stuId.length < 3 || stuId.includes("ធ្វើនៅ")) continue; 

            // ផ្ទៀងផ្ទាត់ថាសិស្សពិតជាមានក្នុងតារាងមែន
            let stuExists = window.scoresStudentList.find(s => String(s.id).trim() === stuId);
            if(!stuExists) continue;

            // រុញពិន្ទុចូលប្រអប់ HTML វិញតាម Key
            window.activeSubjectKeys.forEach(key => {
                let colIndex = colMap[key];
                
                // ប្រសិនបើកូឡោនហ្នឹងមានតម្លៃ នោះទាញយកមកដាក់
                if(colIndex !== undefined && row[colIndex] !== undefined && row[colIndex] !== "") {
                    let scoreVal = String(row[colIndex]).trim();
                    
                    let inputIdMainTable = `${key}_${stuId}`;
                    if (type === "annual") inputIdMainTable = `${key}_s1_${stuId}`; 
                    if (type === "semester") {
                        inputIdMainTable = `${key}_${month.includes("២") ? "s2" : "s1"}_${stuId}`;
                    }

                    const inputEl = document.getElementById(inputIdMainTable);
                    if(inputEl) {
                        inputEl.value = scoreVal; // បញ្ចូលពិន្ទុ
                        importedCount++;
                        
                        // លាបពណ៌អក្សរ ក្រហម/ខ្មៅ
                        const maxVal = window.schemaMaxMap[key] || 10;
                        if (parseFloat(scoreVal) < maxVal / 2) { 
                            inputEl.classList.add("text-rose-600"); 
                            inputEl.classList.remove("text-slate-800"); 
                        } else { 
                            inputEl.classList.remove("text-rose-600"); 
                            inputEl.classList.add("text-slate-800"); 
                        }
                    }
                }
            });
        }

        // ក្រោយពីទម្លាក់លេខចូលអស់ហើយ បញ្ជាឱ្យគណនាសាជាថ្មី
        window.calculateAllScores();
        window.markUnsaved();
        
        const modal = document.getElementById('importExcelModal');
        if (modal) modal.remove();
        
        if (typeof showToast === 'function') {
            showToast(`✅ ទាញពិន្ទុបានជោគជ័យ ចំនួន ${importedCount} ក្រឡា!`);
        } else {
            alert(`ទាញពិន្ទុបានជោគជ័យ!`);
        }
    };
    reader.readAsArrayBuffer(file);
};


// =====================================================================
// ១១. មុខងារកំណត់ខែសម្រាប់មធ្យមភាគឆមាស (Semester Months Configuration)
// =====================================================================

// បង្ហាញផ្ទាំង Pop-up ជ្រើសរើសខែ
window.openSemesterConfig = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    
    // ការកំណត់ដើម (Default)
    const defaultSettings = {
        sem1: ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"],
        sem2: ["មេសា", "ឧសភា", "មិថុនា", "កក្កដា"]
    };
    
    // ទាញយកការកំណត់ចាស់ដែលធ្លាប់ Save (បើមាន)
    const savedConfig = JSON.parse(localStorage.getItem('semester_month_config_' + grade)) || defaultSettings;
    const allMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

    let modalHtml = `
      <div id="semesterConfigModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-4 font-siemreap transition-all" style="z-index: 999999;">
        <div class="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-3xl overflow-hidden flex flex-col transform transition-all scale-100 border border-slate-200">
            
            <!-- ក្បាល Modal -->
            <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 sm:p-5 flex justify-between items-center shadow-md">
                <h3 class="font-moul text-white text-sm sm:text-base drop-shadow-md flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner border border-white/10"><i class="fa-solid fa-calendar-check"></i></div>
                    កំណត់ខែគណនាមធ្យមភាគប្រចាំឆមាស
                </h3>
                <button onclick="document.getElementById('semesterConfigModal').remove()" class="w-8 h-8 rounded-full bg-white/20 text-white flex justify-center items-center hover:bg-white/40 transition-colors shadow-sm border border-white/10">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            
            <div class="p-4 sm:p-6 overflow-y-auto custom-scrollbar max-h-[75vh] bg-slate-50">
                
                <!-- ប្រអប់ព័ត៌មាន (Info Alert) -->
                <div class="mb-5 text-[13px] text-blue-800 font-bold bg-blue-100/60 p-4 rounded-2xl border border-blue-200 flex items-start gap-3 shadow-sm leading-relaxed">
                    <i class="fa-solid fa-circle-info text-blue-600 text-lg mt-0.5"></i> 
                    <p>សូមជ្រើសរើសខែដែលលោកគ្រូអ្នកគ្រូបានស្រង់ពិន្ទុជាក់ស្តែង។ ប្រព័ន្ធនឹងទាញយកមធ្យមភាគពីខែទាំងនេះមកបូកបញ្ចូល និងចែកជា <b>"មធ្យមភាគប្រចាំខែក្នុងឆមាស"</b> ដោយស្វ័យប្រវត្តិ។</p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <!-- ឆមាសទី ១ -->
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                        <h4 class="font-moul text-indigo-700 text-[13px] sm:text-sm mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100"><i class="fa-solid fa-1"></i></div>
                            សម្រាប់ឆមាសទី១
                        </h4>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            ${allMonths.map(m => `
                                <label class="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all ${savedConfig.sem1.includes(m) ? 'bg-indigo-50/50 border-indigo-200' : ''}">
                                    <input type="checkbox" value="${m}" class="sem1-month-cb w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shadow-sm" ${savedConfig.sem1.includes(m) ? 'checked' : ''}>
                                    <span class="text-sm font-bold ${savedConfig.sem1.includes(m) ? 'text-indigo-700' : 'text-slate-600'}">ខែ ${m}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- ឆមាសទី ២ -->
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                        <h4 class="font-moul text-emerald-700 text-[13px] sm:text-sm mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100"><i class="fa-solid fa-2"></i></div>
                            សម្រាប់ឆមាសទី២
                        </h4>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            ${allMonths.map(m => `
                                <label class="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all ${savedConfig.sem2.includes(m) ? 'bg-emerald-50/50 border-emerald-200' : ''}">
                                    <input type="checkbox" value="${m}" class="sem2-month-cb w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shadow-sm" ${savedConfig.sem2.includes(m) ? 'checked' : ''}>
                                    <span class="text-sm font-bold ${savedConfig.sem2.includes(m) ? 'text-emerald-700' : 'text-slate-600'}">ខែ ${m}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ប៊ូតុង Action -->
            <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button onclick="document.getElementById('semesterConfigModal').remove()" class="px-6 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-sm">បោះបង់</button>
                <button onclick="window.saveSemesterConfig()" class="px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md flex items-center gap-2 transition-transform transform hover:-translate-y-0.5 text-sm">
                    <i class="fa-solid fa-floppy-disk"></i> រក្សាទុកការកំណត់
                </button>
            </div>
        </div>
      </div>
    `;

    // លុប Modal ចាស់បើមាន រួចបិទភ្ជាប់ Modal ថ្មី
    const oldModal = document.getElementById('semesterConfigModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // លម្អ Effect នៅពេលចុច Tick លើខែណាមួយ
    document.querySelectorAll('.sem1-month-cb').forEach(cb => {
        cb.addEventListener('change', function() {
            const label = this.closest('label');
            const span = label.querySelector('span');
            if(this.checked) {
                label.classList.add('bg-indigo-50/50', 'border-indigo-200');
                span.classList.replace('text-slate-600', 'text-indigo-700');
            } else {
                label.classList.remove('bg-indigo-50/50', 'border-indigo-200');
                span.classList.replace('text-indigo-700', 'text-slate-600');
            }
        });
    });
    
    document.querySelectorAll('.sem2-month-cb').forEach(cb => {
        cb.addEventListener('change', function() {
            const label = this.closest('label');
            const span = label.querySelector('span');
            if(this.checked) {
                label.classList.add('bg-emerald-50/50', 'border-emerald-200');
                span.classList.replace('text-slate-600', 'text-emerald-700');
            } else {
                label.classList.remove('bg-emerald-50/50', 'border-emerald-200');
                span.classList.replace('text-emerald-700', 'text-slate-600');
            }
        });
    });
};

// រក្សាទុកការកំណត់ដែលបានជ្រើសរើស
window.saveSemesterConfig = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    
    // ចាប់យកខែដែលបាន Tick
    const sem1Checked = Array.from(document.querySelectorAll('.sem1-month-cb:checked')).map(cb => cb.value);
    const sem2Checked = Array.from(document.querySelectorAll('.sem2-month-cb:checked')).map(cb => cb.value);
    
    // រក្សាទុកក្នុង LocalStorage (ម៉ាស៊ីនផ្ទាល់)
    const config = { sem1: sem1Checked, sem2: sem2Checked };
    localStorage.setItem('semester_month_config_' + grade, JSON.stringify(config));
    
    // បិទ Modal
    document.getElementById('semesterConfigModal').remove();
    
    // បង្ហាញសារជោគជ័យ
    if(typeof showToast === 'function') showToast("✅ ការកំណត់ខែត្រូវបានរក្សាទុកដោយជោគជ័យ!");
    else alert("ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ!");
    
    // បើកំពុងនៅផ្ទាំង "ឆមាស" បញ្ជាឱ្យប្រព័ន្ធទាញទិន្នន័យសាជាថ្មី ដើម្បីគណនាមធ្យមភាគខែដែលទើបតែរើសរួច
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    if (type === "semester") {
        if(typeof window.fetchStudentsForScores === 'function') window.fetchStudentsForScores();
    }
};


// =====================================================================
// 🔴 មុខងារបង្ហាញក្នុង Modal ទី ២: Rankings Content (Premium Mobile-Friendly)
// =====================================================================
window.rankingsSearchQuery = "";
window.rankingsGenderFilter = "all";
window.rankingsViewMode = "full";

window.renderRankingsContent = function() {
    window.calculateAllScores(); // Force data calculation before rendering
    const container = document.getElementById("modal-content-rankings");
    if (!container) return;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const gradeFull = sInfo.teacher_level && sInfo.teacher_room ? `${sInfo.teacher_level} ${sInfo.teacher_room}` : "ថ្នាក់ទី ១ «ក»";

    container.innerHTML = `
      <style>
        /* Custom Scrollbar សម្រាប់តារាង */
        .table-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .table-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .table-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .table-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        /* Sticky Column សម្រាប់ទូរសព្ទដៃ */
        .sticky-col { position: sticky; left: 0; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.05); }
      </style>

      <div class="w-full flex flex-col gap-4 font-siemreap bg-slate-50/50 p-2 md:p-4 rounded-3xl min-h-full relative overflow-hidden">
        
        <!-- Background Accents តុបតែង -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-rose-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <!-- របារឧបករណ៍បញ្ជា (Action Bar) ចាស់ អាចត្រូវលាក់ ឬទុក -->
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 no-print border-b border-slate-200 pb-4 relative z-10 hidden"></div>

        <!-- កាតសង្ខេបស្ថិតិ (KPIs) -->
        <div id="rankingsKpiContainer" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 no-print relative z-10"></div>

        <!-- ផ្ទៃបង្ហាញតារាង (Table Area) -->
        <div class="w-full h-full bg-white border border-slate-200/80 rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col flex-1 shadow-sm relative z-10 mt-2">
          
          <!-- Wrapper សម្រាប់ Scroll លើ Mobile -->
          <div class="overflow-x-auto w-full h-full table-scroll flex-1 pb-4">
            <table id="rankTableMain" class="w-full border-collapse text-[13px] text-center whitespace-nowrap bg-white">
              <thead id="rankTableHead" class="text-slate-700 sticky top-0 z-20 shadow-sm border-b-2 border-slate-200/80"></thead>
              <tbody id="rankingsTableBody" class="divide-y divide-slate-100 text-slate-700"></tbody>
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
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = sInfo.teacher_level && sInfo.teacher_room ? `${sInfo.teacher_level} ${sInfo.teacher_room}` : "ថ្នាក់ទី ១ «ក»";
    const periodType = document.getElementById("globalPeriodType")?.value || "monthly";

    const allStudents = window.rankingsDataList || [];

    let total = allStudents.length;
    let female = allStudents.filter(s => s.gender === 'ស្រី').length;
    let passed = allStudents.filter(s => s.avg >= 5.0).length;
    let failed = total - passed;
    let passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";
    let classAvg = total > 0 ? (allStudents.reduce((acc, s) => acc + (s.avg || 0), 0) / total).toFixed(2) : "0.00";
    let topStudent = allStudents.find(s => s.rank === 1);

    // 🟢 ១. រចនាកាត KPI ឱ្យមើលទៅ Premium 🟢
    const kpiEl = document.getElementById("rankingsKpiContainer");
    if (kpiEl && total > 0) {
      kpiEl.innerHTML = `
        <div class="bg-white p-3.5 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg md:text-xl shadow-inner"><i class="fa-solid fa-users"></i></div>
          <div><div class="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">សិស្សសរុប</div><div class="text-sm md:text-base font-black text-slate-800 font-mono">${total} <span class="text-[10px] font-normal text-slate-400 font-siemreap">(ស្រី ${female})</span></div></div>
        </div>
        <div class="bg-white p-3.5 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg md:text-xl shadow-inner"><i class="fa-solid fa-circle-check"></i></div>
          <div><div class="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">ជាប់មធ្យមភាគ</div><div class="text-sm md:text-base font-black text-emerald-600 font-mono">${passed} <span class="text-[10px] font-bold text-emerald-700 font-mono">(${passRate}%)</span></div></div>
        </div>
        <div class="bg-white p-3.5 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg md:text-xl shadow-inner"><i class="fa-solid fa-circle-xmark"></i></div>
          <div><div class="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">ធ្លាក់មធ្យមភាគ</div><div class="text-sm md:text-base font-black text-rose-600 font-mono">${failed} <span class="text-[10px] font-normal text-slate-400 font-siemreap">នាក់</span></div></div>
        </div>
        <div class="bg-white p-3.5 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg md:text-xl shadow-inner"><i class="fa-solid fa-chart-line"></i></div>
          <div><div class="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">មធ្យមភាគថ្នាក់</div><div class="text-sm md:text-base font-black text-indigo-700 font-mono">${classAvg}</div></div>
        </div>
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 md:p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3 md:gap-4 col-span-2 sm:col-span-1 lg:col-span-1 transition-transform hover:-translate-y-1 relative overflow-hidden">
          <div class="absolute right-0 top-0 w-16 h-16 bg-white/40 rounded-full blur-xl pointer-events-none"></div>
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-md border border-white/50 relative z-10"><i class="fa-solid fa-medal"></i></div>
          <div class="truncate relative z-10"><div class="text-[10px] md:text-[11px] text-amber-800 font-bold uppercase tracking-wider">ជើងឯកលេខ ១</div><div class="text-sm md:text-base font-bold text-slate-800 font-moul truncate mt-0.5">${topStudent ? topStudent.name : '-'}</div></div>
        </div>
      `;
    }

    const th = document.getElementById("rankTableHead");
    const tbody = document.getElementById("rankingsTableBody");
    if (!tbody || !th) return;

    if (allStudents.length === 0) {
        th.innerHTML = "";
        tbody.innerHTML = `<tr><td colspan="12" class="p-16 text-center text-slate-400 font-bold"><div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fa-solid fa-folder-open text-2xl text-slate-300"></i></div>មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់ទេ!</td></tr>`;
        return;
    }

    let filteredList = allStudents.filter(s => {
      const matchName = !window.rankingsSearchQuery || s.name.toLowerCase().includes(window.rankingsSearchQuery);
      const matchGender = window.rankingsGenderFilter === "all" || s.gender === window.rankingsGenderFilter;
      return matchName && matchGender;
    });

    const getGradeBadge = (g) => {
      const str = String(g || "E").trim();
      let colorClass = "bg-slate-100 text-slate-600 border-slate-200";
      if (str.includes("A") || str.includes("ល្អប្រសើរ") || str.includes("ល្អណាស់")) colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
      else if (str.includes("B") || str.includes("ល្អ")) colorClass = "bg-blue-100 text-blue-700 border-blue-200";
      else if (str.includes("C") || str.includes("បង្គួរ")) colorClass = "bg-teal-100 text-teal-700 border-teal-200";
      else if (str.includes("D") || str.includes("មធ្យម")) colorClass = "bg-amber-100 text-amber-700 border-amber-200";
      else if (str.includes("E") || str.includes("ខ្សោយ") || str.includes("F") || str.includes("ធ្លាក់")) colorClass = "bg-rose-100 text-rose-700 border-rose-200";
      
      return `<span class="px-3 py-1 rounded-lg text-[11px] md:text-xs font-bold font-siemreap border shadow-sm ${colorClass}">${str}</span>`;
    };

    // 🟢 ២. រៀបចំក្បាលតារាង (Header) អោយស្អាត និងលេចធ្លោ 🟢
    let colHtml = "";
    if (periodType === "monthly") {
       colHtml = `<th class="p-3 w-12 font-moul text-[11px] md:text-xs text-slate-500 bg-slate-50">ល.រ</th>
                  <th class="p-3 w-64 text-left px-5 font-moul text-[11px] md:text-xs text-slate-800 sticky-col bg-slate-50">គោត្តនាម និងនាម</th>
                  <th class="p-3 w-14 text-[11px] md:text-xs font-moul text-slate-500 bg-slate-50">ភេទ</th>
                  <th class="p-3 w-28 bg-blue-50/80 text-blue-800 font-moul text-[11px] md:text-xs border-x border-white">មធ្យមភាគ</th>
                  <th class="p-3 w-28 bg-rose-50/80 text-rose-800 font-moul text-[11px] md:text-xs border-r border-white">ចំណាត់ថ្នាក់</th>
                  <th class="p-3 w-28 bg-emerald-50/80 text-emerald-800 font-moul text-[11px] md:text-xs">និទ្ទេស</th>`;
    } else if (periodType === "semester") {
       colHtml = `<th class="p-3 w-12 font-moul text-[11px] md:text-xs text-slate-500 bg-slate-50">ល.រ</th>
                  <th class="p-3 w-64 text-left px-5 font-moul text-[11px] md:text-xs text-slate-800 sticky-col bg-slate-50">គោត្តនាម និងនាម</th>
                  <th class="p-3 w-14 text-[11px] md:text-xs font-moul text-slate-500 bg-slate-50">ភេទ</th>
                  <th class="p-3 w-24 bg-orange-50/80 text-orange-800 font-moul text-[11px] md:text-xs border-l border-white">ម.ប្រឡងឆមាស</th>
                  <th class="p-3 w-24 bg-indigo-50/80 text-indigo-800 font-moul text-[11px] md:text-xs border-l border-white">មធ្យមខែ</th>
                  <th class="p-3 w-28 bg-blue-50/80 text-blue-800 font-moul text-[11px] md:text-xs border-x border-white">ម.ប្រចាំឆមាស</th>
                  <th class="p-3 w-28 bg-rose-50/80 text-rose-800 font-moul text-[11px] md:text-xs border-r border-white">ចំណាត់ថ្នាក់</th>
                  <th class="p-3 w-28 bg-emerald-50/80 text-emerald-800 font-moul text-[11px] md:text-xs">និទ្ទេស</th>`;
    } else {
       colHtml = `<th class="p-3 w-12 font-moul text-[11px] md:text-xs text-slate-500 bg-slate-50">ល.រ</th>
                  <th class="p-3 w-64 text-left px-5 font-moul text-[11px] md:text-xs text-slate-800 sticky-col bg-slate-50">គោត្តនាម និងនាម</th>
                  <th class="p-3 w-14 text-[11px] md:text-xs font-moul text-slate-500 bg-slate-50">ភេទ</th>
                  <th class="p-3 w-24 bg-blue-50/80 text-blue-800 font-moul text-[11px] md:text-xs border-l border-white">ម.ឆមាសទី១</th>
                  <th class="p-3 w-24 bg-indigo-50/80 text-indigo-800 font-moul text-[11px] md:text-xs border-l border-white">ម.ឆមាសទី២</th>
                  <th class="p-3 w-28 bg-amber-50/80 text-amber-800 font-moul text-[11px] md:text-xs border-x border-white">ម.ប្រចាំឆ្នាំ</th>
                  <th class="p-3 w-28 bg-rose-50/80 text-rose-800 font-moul text-[11px] md:text-xs border-r border-white">ចំណាត់ថ្នាក់</th>
                  <th class="p-3 w-28 bg-emerald-50/80 text-emerald-800 font-moul text-[11px] md:text-xs">និទ្ទេស</th>`;
    }
    th.innerHTML = `<tr class="shadow-sm tracking-wide bg-slate-50">${colHtml}</tr>`;

    // 🟢 ៣. រៀបចំតួអត្ថបទ (Body) អោយឆ្លាតវៃ និងស្អាត 🟢
    let rowsHtml = "";
    filteredList.forEach((s, idx) => {
       const isF = s.gender === "ស្រី";
       const genderClass = isF ? `text-rose-500 font-bold` : `text-blue-600 font-bold`;
       const rankDisplay = s.rank;
       const bgClass = idx % 2 !== 0 ? 'bg-slate-50/30' : 'bg-white';
       
       let trData = "";
       if (periodType === "monthly") {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td>
                   <td class="p-3 text-left px-5 font-bold text-slate-800 text-[13px] font-siemreap sticky-col ${bgClass}">${s.name}</td>
                   <td class="p-3 text-center ${genderClass} font-siemreap">${isF ? 'ស' : 'ប'}</td>
                   <td class="p-3 font-siemreap font-black text-blue-700 bg-blue-50/30 border-l border-white text-[13px] md:text-[14px] shadow-[inset_1px_0_0_rgba(255,255,255,1)]">${s.avg.toFixed(2)}</td>
                   <td class="p-3 text-center font-siemreap font-black text-rose-600 bg-rose-50/30 text-[13px] md:text-[14px] border-x border-white shadow-[inset_1px_0_0_rgba(255,255,255,1)]">${rankDisplay}</td>
                   <td class="p-3 text-center bg-white/50">${getGradeBadge(s.gradeLetter)}</td>`;
       } else if (periodType === "semester") {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td>
                   <td class="p-3 text-left px-5 font-bold text-slate-800 text-[13px] font-siemreap sticky-col ${bgClass}">${s.name}</td>
                   <td class="p-3 text-center ${genderClass} font-siemreap">${isF ? 'ស' : 'ប'}</td>
                   <td class="p-3 font-siemreap text-orange-700 bg-orange-50/30 font-bold border-l border-white">${s.exam_avg.toFixed(2)}</td>
                   <td class="p-3 font-siemreap text-indigo-700 bg-indigo-50/30 font-bold border-l border-white">${s.monthly_avg.toFixed(2)}</td>
                   <td class="p-3 font-siemreap font-black text-blue-700 bg-blue-50/30 text-[13px] md:text-[14px] border-x border-white shadow-[inset_1px_0_0_rgba(255,255,255,1)]">${s.avg.toFixed(2)}</td>
                   <td class="p-3 text-center font-black font-siemreap text-rose-600 bg-rose-50/30 text-[13px] md:text-[14px] border-r border-white shadow-[inset_1px_0_0_rgba(255,255,255,1)]">${rankDisplay}</td>
                   <td class="p-3 text-center bg-white/50">${getGradeBadge(s.gradeLetter)}</td>`;
       } else {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td>
                   <td class="p-3 text-left px-5 font-bold text-slate-800 text-[13px] font-siemreap sticky-col ${bgClass}">${s.name}</td>
                   <td class="p-3 text-center ${genderClass} font-siemreap">${isF ? 'ស' : 'ប'}</td>
                   <td class="p-3 font-siemreap text-blue-700 bg-blue-50/30 font-bold border-l border-white">${s.sem1_avg.toFixed(2)}</td>
                   <td class="p-3 font-siemreap text-indigo-700 bg-indigo-50/30 font-bold border-l border-white">${s.sem2_avg.toFixed(2)}</td>
                   <td class="p-3 font-siemreap font-black text-amber-700 bg-amber-50/30 text-[13px] md:text-[14px] border-x border-white shadow-[inset_1px_0_0_rgba(255,255,255,1)]">${s.avg.toFixed(2)}</td>
                   <td class="p-3 text-center font-black font-siemreap text-rose-600 bg-rose-50/30 text-[13px] md:text-[14px] border-r border-white shadow-[inset_1px_0_0_rgba(255,255,255,1)]">${rankDisplay}</td>
                   <td class="p-3 text-center bg-white/50">${getGradeBadge(s.gradeLetter)}</td>`;
       }
       
       rowsHtml += `<tr class="hover:bg-slate-100 transition-colors border-b border-slate-100/50 ${bgClass}">${trData}</tr>`;
    });
    tbody.innerHTML = rowsHtml;
}

// ==========================================
// មុខងារជំនួយសម្រាប់បោះពុម្ពលើទូរស័ព្ទដៃ (Mobile Print Fix សម្រាប់ iOS/Android)
// ==========================================
window.triggerMobilePrint = function(styleBlock, htmlBody) {
    // លុបផ្ទាំង Print ចាស់ចេញ (ប្រសិនបើមាន)
    let printArea = document.getElementById('mobile-print-area');
    if (printArea) {
        printArea.remove();
    }
    
    // បង្កើតក្រដាស Print ថ្មីបញ្ជូលទៅក្នុងប្រព័ន្ធ
    printArea = document.createElement('div');
    printArea.id = 'mobile-print-area';
    document.body.appendChild(printArea);
    
    let oldCss = document.getElementById('mobile-print-global-css');
    if (oldCss) oldCss.remove();

    let printCSS = document.createElement('style');
    printCSS.id = 'mobile-print-global-css';
    printCSS.innerHTML = `
        @media print {
            /* លាក់ផ្ទាំងកម្មវិធីទាំងអស់ពេល Print */
            body > *:not(#mobile-print-area) { display: none !important; }
            body { background: white !important; margin: 0 !important; padding: 0 !important; }
            #mobile-print-area { display: block !important; width: 100%; position: absolute; top: 0; left: 0; background: white; z-index: 999999; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen {
            /* លាក់ផ្ទាំង Print ពេលមើលធម្មតាលើអេក្រង់ */
            #mobile-print-area { display: none !important; }
        }
    `;
    document.head.appendChild(printCSS);
    
    printArea.innerHTML = styleBlock + htmlBody;
    
    // រង់ចាំបន្តិចឱ្យទូរស័ព្ទ Load អក្សរ Google Fonts រួចរាល់ ទើបហៅផ្ទាំង Print មក
    setTimeout(() => {
        window.print();
        // 🔴 បានលុបមុខងារ Auto Cleanup ចេញ ដើម្បីការពារកុំឱ្យ iOS លោតបាត់ផ្ទាំង Print ពេលលោកគ្រូសារ៉េក្រដាស (Zoom)
    }, 800); 
};

// ==========================================
// ០៩. Print / PDF បញ្ជីចំណាត់ថ្នាក់ (អក្សរបញ្ឈរ, លេខសកល, គាំទ្រ Google Fonts)
// ==========================================
window.printRankingTable = function() {
    if(typeof window.calculateAllScores === 'function') window.calculateAllScores();
    if(!window.rankingsDataList || window.rankingsDataList.length === 0) return alert("⚠️ គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";

    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.......................";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = window.AuthState ? window.AuthState.teacherName : (localStorage.getItem('auth_teacher_name') || '.......................');
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    let titleText = `ចំណាត់ថ្នាក់ប្រចាំខែ${month}`;
    if (type === "semester") {
        titleText = month.includes("ឆមាសលើកទី១") ? "ចំណាត់ថ្នាក់ប្រចាំឆមាសលើកទី១" : (month.includes("ឆមាសលើកទី២") ? "ចំណាត់ថ្នាក់ប្រចាំឆមាសលើកទី២" : `ចំណាត់ថ្នាក់${month}`);
    } else if (type === "annual") {
        titleText = `ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ`;
    }

    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim();
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();

    if (sDate.includes("ថ្ងៃទី")) {
        sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    }
    locationStr = locationStr.replace(/,+$/, '').trim();

    const solarDateStr = `${locationStr}, ${sDate}`;
    const lunarDateStr = rDates.showLunar !== false 
        ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") 
        : "";

    let stus = [...window.rankingsDataList].sort((a, b) => a.rank - b.rank);
    const half = Math.ceil(stus.length / 2);

    let totalStus = stus.length;
    let femaleStus = stus.filter(s => s.gender === 'ស្រី').length;
    
    let passMark = 5.0; 
    if ((type === "semester" || type === "annual") && window.rankingsDataList.some(s => s.avg > 15)) {
        passMark = 25.0;
    }
    let passed = stus.filter(s => s.avg >= passMark).length;
    let passedF = stus.filter(s => s.avg >= passMark && s.gender === 'ស្រី').length;
    let failed = totalStus - passed;
    let failedF = femaleStus - passedF;

    let passPct = totalStus > 0 ? ((passed / totalStus) * 100).toFixed(2) : "0.00";
    let failPct = totalStus > 0 ? ((failed / totalStus) * 100).toFixed(2) : "0.00";
    let passFPct = femaleStus > 0 ? ((passedF / femaleStus) * 100).toFixed(2) : "0.00";
    let failFPct = femaleStus > 0 ? ((failedF / femaleStus) * 100).toFixed(2) : "0.00";

    // 🟢 បន្ថែម Fallback Google Fonts (Moul, Siemreap) ចូលទៅក្នុង Inline Styles 🟢
    let headerHtml = '';
    const thBase = `border: 1pt solid #000; text-align: center; vertical-align: middle; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; font-weight: normal;`;
    
    const thV = (text, bgHex, isRightSide) => {
        const leftBorder = isRightSide ? 'border-left: 2pt solid #000;' : '';
        return `<th class="th-vert" style="${thBase} background-color: ${bgHex}; ${leftBorder} padding: 0;"><div class="div-vert">${text}</div></th>`;
    };

    const thN = (text, w, align, padding, bgHex, isRightSide) => {
        const leftBorder = isRightSide ? 'border-left: 2pt solid #000;' : '';
        return `<th style="${thBase} background-color: ${bgHex}; width: ${w}; text-align: ${align}; padding-left: ${padding}; ${leftBorder}">${text}</th>`;
    };
    
    if (type === "monthly") {
        headerHtml = `
            <tr>
                ${thN('ល.រ', '5.5%', 'center', '0', '#f8fafc', false)}
                ${thN('គោត្តនាម និងនាម', '22%', 'left', '6px', '#f8fafc', false)}
                ${thN('ភេទ', '5.5%', 'center', '0', '#f8fafc', false)}
                ${thV('មធ្យមភាគ', '#eff6ff', false)}
                ${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}

                ${thN('ល.រ', '5.5%', 'center', '0', '#f8fafc', true)}
                ${thN('គោត្តនាម និងនាម', '22%', 'left', '6px', '#f8fafc', false)}
                ${thN('ភេទ', '5.5%', 'center', '0', '#f8fafc', false)}
                ${thV('មធ្យមភាគ', '#eff6ff', false)}
                ${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}
            </tr>
        `;
    } else if (type === "semester") {
        headerHtml = `
            <tr>
                ${thN('ល.រ', '4%', 'center', '0', '#f8fafc', false)}
                ${thN('គោត្តនាម និងនាម', '20%', 'left', '4px', '#f8fafc', false)}
                ${thN('ភេទ', '5%', 'center', '0', '#f8fafc', false)}
                ${thV('ម.ប្រឡងឆមាស', '#e0f2fe', false)}
                ${thV('មធ្យមខែ', '#fef3c7', false)}
                ${thV('ម.ប្រចាំឆមាស', '#dcfce7', false)}
                ${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}

                ${thN('ល.រ', '4%', 'center', '0', '#f8fafc', true)}
                ${thN('គោត្តនាម និងនាម', '20%', 'left', '4px', '#f8fafc', false)}
                ${thN('ភេទ', '5%', 'center', '0', '#f8fafc', false)}
                ${thV('ម.ប្រឡងឆមាស', '#e0f2fe', false)}
                ${thV('មធ្យមខែ', '#fef3c7', false)}
                ${thV('ម.ប្រចាំឆមាស', '#dcfce7', false)}
                ${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}
            </tr>
        `;
    } else {
        headerHtml = `
            <tr>
                ${thN('ល.រ', '4%', 'center', '0', '#f8fafc', false)}
                ${thN('គោត្តនាម និងនាម', '20%', 'left', '4px', '#f8fafc', false)}
                ${thN('ភេទ', '5%', 'center', '0', '#f8fafc', false)}
                ${thV('ម.ឆមាសទី១', '#e0e7ff', false)}
                ${thV('ម.ឆមាសទី២', '#dcfce7', false)}
                ${thV('ម.ប្រចាំឆ្នាំ', '#fef3c7', false)}
                ${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}

                ${thN('ល.រ', '4%', 'center', '0', '#f8fafc', true)}
                ${thN('គោត្តនាម និងនាម', '20%', 'left', '4px', '#f8fafc', false)}
                ${thN('ភេទ', '5%', 'center', '0', '#f8fafc', false)}
                ${thV('ម.ឆមាសទី១', '#e0e7ff', false)}
                ${thV('ម.ឆមាសទី២', '#dcfce7', false)}
                ${thV('ម.ប្រចាំឆ្នាំ', '#fef3c7', false)}
                ${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}
            </tr>
        `;
    }

    let rowsHtml = "";
    // 🟢 ប្រើប្រាស់ 'Siemreap' សម្រាប់អក្សរធម្មតា 🟢
    const tdBase = `border: 1pt solid #000; padding: 4px 2px; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 10pt; text-align: center; vertical-align: middle;`;

    for (let i = 0; i < half; i++) {
        const s1 = stus[i];
        const s2 = stus[half + i];

        const renderRow = (stu, index, isRightSide) => {
            const leftBorder = isRightSide ? 'border-left: 2pt solid #000;' : '';
            if (!stu) {
                const cols = type === "monthly" ? 5 : 7;
                return `<td colspan="${cols}" style="${tdBase} ${leftBorder} background-color: transparent;"></td>`;
            }
            
            const genColor = stu.gender === 'ស្រី' ? 'color: #be123c;' : 'color: #000;';
            const avgScore = (stu.avg !== undefined && !isNaN(stu.avg)) ? stu.avg.toFixed(2) : '';
            const avgColor = (stu.avg >= passMark) ? 'color: #16a34a;' : 'color: #be123c;';
            
            let row = `<td style="${tdBase} ${leftBorder}">${index}</td>
                       <td style="${tdBase} text-align: left; padding-left: 6px; font-weight: normal; white-space: nowrap; overflow: hidden;">${stu.name}</td>
                       <td style="${tdBase} font-weight: bold; ${genColor}">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>`;
            
            if (type === "monthly") {
                row += `<td style="${tdBase} font-weight: bold; ${avgColor}">${avgScore}</td>
                        <td style="${tdBase} font-weight: bold; color: #be123c;">${stu.rank||''}</td>`;
            } else if (type === "semester") {
                row += `<td style="${tdBase}">${(stu.exam_avg !== undefined && !isNaN(stu.exam_avg)) ? parseFloat(stu.exam_avg).toFixed(2) : ''}</td>
                        <td style="${tdBase}">${(stu.monthly_avg !== undefined && !isNaN(stu.monthly_avg)) ? parseFloat(stu.monthly_avg).toFixed(2) : ''}</td>
                        <td style="${tdBase} font-weight: bold; ${avgColor}">${avgScore}</td>
                        <td style="${tdBase} font-weight: bold; color: #be123c;">${stu.rank||''}</td>`;
            } else {
                row += `<td style="${tdBase}">${(stu.sem1_avg !== undefined && !isNaN(stu.sem1_avg)) ? parseFloat(stu.sem1_avg).toFixed(2) : ''}</td>
                        <td style="${tdBase}">${(stu.sem2_avg !== undefined && !isNaN(stu.sem2_avg)) ? parseFloat(stu.sem2_avg).toFixed(2) : ''}</td>
                        <td style="${tdBase} font-weight: bold; ${avgColor}">${avgScore}</td>
                        <td style="${tdBase} font-weight: bold; color: #be123c;">${stu.rank||''}</td>`;
            }
            return row;
        };

        const bgRow = i % 2 !== 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
        rowsHtml += `<tr style="${bgRow} height: 26px;">${renderRow(s1, i + 1, false)}${renderRow(s2, half + i + 1, true)}</tr>`;
    }

    // 🟢 ភ្ជាប់ Google Fonts Import ចូលទៅក្នុង Style ផ្ទាល់ 🟢
    const styleBlock = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
          
          @page { size: A4 portrait; margin: 10mm; }
          #mobile-print-area * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; }
          #mobile-print-area { background: #fff; line-height: 1.4; width: 100%; max-width: 190mm; margin: 0 auto; color: #000; }
          #mobile-print-area .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
          
          /* CSS សម្រាប់អក្សរឈរ */
          #mobile-print-area .th-vert { height: 110px; max-height: 110px; vertical-align: middle; text-align: center; padding: 0; width: 30px; min-width: 30px; }
          #mobile-print-area .div-vert {
              writing-mode: vertical-rl;
              transform: rotate(180deg);
              white-space: nowrap;
              height: 100px;
              display: flex;
              justify-content: center;
              align-items: center;
              text-align: center;
              margin: 15px auto;
              font-family: 'Khmer OS Muol Light', 'Moul', serif;
              font-size: 11pt;
              font-weight: normal;
              color: #000c5b;
          }

          /* Headers */
          #mobile-print-area .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; width: 100%; color: #000c58;}
          #mobile-print-area .header-left { text-align: left; }
          #mobile-print-area .header-left p { margin: 0 0 4px 0; font-size: 12pt; line-height: 1.5; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          #mobile-print-area .header-right { text-align: center; }
          #mobile-print-area .header-right p { margin: 0 0 4px 0; font-size: 12pt; line-height: 1.5; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          
          /* Title */
          #mobile-print-area .title-box { text-align: center; margin: 10px 0 15px 0; }
          #mobile-print-area .title-box h2 { margin: 0 0 6px 0; font-size: 14pt; color: #000b51; letter-spacing: 0.5px; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          #mobile-print-area .title-box p { margin: 0; font-size: 12pt; color: #ff0000; font-weight: normal; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          
          /* Table */
          #mobile-print-area table.rnk-table { width: 100%; border-collapse: collapse !important; margin-bottom: 11px; text-align: center; table-layout: fixed; border: 1pt solid #06005e; }
          
          /* Summary & Sigs */
          #mobile-print-area .summary-table { width: 100%; font-size: 12pt; color: #000422; border-collapse: collapse; margin-bottom: 20px; }
          #mobile-print-area .summary-table td { padding: 3px 0 !important; border: none !important; text-align: left; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; }
          
          #mobile-print-area .bottom-sig-container { font-size: 12pt; display: flex; color: #00052a; justify-content: space-between; align-items: flex-start; width: 100%; page-break-inside: avoid; padding: 0 20px; margin-top: 15px; }
          #mobile-print-area .sig-box { width: 60%; text-align: center; }
        </style>
    `;

    const htmlBody = `
        <div class="header-box">
          <div class="header-left"><br><br>
            <p>ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}</p>
            <p>${schoolName}</p>
            <p>${grade}</p>
          </div>
          <div class="header-right">
             <p>ព្រះរាជាណាចក្រកម្ពុជា</p>
             <p>ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
                        <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
                        <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
                        <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
                    </div>
          </div>
        </div>
        
        <div class="title-box">
          <h2>${titleText}</h2>
          <p>ឆ្នាំសិក្សា ៖ ${academicYear}</p>
        </div>
        
        <table class="rnk-table">
            <thead>${headerHtml}</thead>
            <tbody>${rowsHtml}</tbody>
        </table>

        <!-- ស្ថិតិលេខសកល -->
        <table class="summary-table">
            <tr>
                <td style="width: 100%;">
                    ❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${totalStus}</b> សិស្សសរុប <b>${totalStus}</b> នាក់ ស្រី <b>${femaleStus}</b> នាក់
                </td>
            </tr>
            <tr>
                <td style="width: 100%;">
                    ❖ សិស្សជាប់មធ្យមភាគ <b>${passed}</b> នាក់ (<b>${passPct}%</b>) ស្រី <b>${passedF}</b> នាក់ (<b>${passFPct}%</b>)
                </td>
            </tr>
            <tr>
                <td style="width: 100%;">
                    ❖ សិស្សធ្លាក់មធ្យមភាគ <b>${failed}</b> នាក់ (<b>${failPct}%</b>) ស្រី <b>${failedF}</b> នាក់ (<b>${failFPct}%</b>)
                </td>
            </tr>
        </table>
        
        <div class="bottom-sig-container">
            <div class="sig-box"><br><br>
                <p class="font-moul" style="margin: 0 0 5px 0; font-size: 11pt;">បានឃើញ និងឯកភាព</p>
                <p class="font-moul" style="margin: 0 0 60px 0; font-size: 11pt;">នាយកសាលា</p>
            </div>
            <div class="sig-box" style="width: 100%;">
                <p style="margin: 0 0 10px 0; font-size: 12pt; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${lunarDateStr}</p>
                <p style="margin: 0 0 5px 0; font-size: 12pt; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${solarDateStr}</p>
                <p class="font-moul" style="margin-bottom: 60px; font-size: 12pt;">គ្រូបន្ទុកថ្នាក់</p>
                <p class="font-moul" style="font-size: 11pt;">${teacherName}</p>
            </div>
        </div>
    `;
    
    if(typeof window.triggerMobilePrint === 'function') {
        window.triggerMobilePrint(styleBlock, htmlBody);
    } else {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert("⚠️ សូមអនុញ្ញាត Pop-up។");
        printWindow.document.open();
        printWindow.document.write(`<!DOCTYPE html><html lang="km"><head><meta charset="utf-8"><title>${titleText}</title>${styleBlock}</head><body id="mobile-print-area">${htmlBody}</body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 1000);
    }
};

// ==========================================
// មុខងារ Export ទៅជា Excel (អក្សរបញ្ឈរ, លេខសកល)
// ==========================================
window.exportRankingsToExcel = function() {
    if (!window.rankingsDataList || window.rankingsDataList.length === 0) return alert("គ្មានទិន្នន័យចំណាត់ថ្នាក់ដើម្បីទាញយកទេ!");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = sInfo.teacher_level || "";
    const roomStr = sInfo.teacher_room || "";
    const grade = `${levelStr} ${roomStr}`.trim() || "ថ្នាក់ទី";
    const academicYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";
    
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.......................";
    
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = window.AuthState ? window.AuthState.teacherName : (localStorage.getItem('auth_teacher_name') || '.......................');

    const periodType = document.getElementById("globalPeriodType")?.value || "monthly";
    const periodVal = document.getElementById("globalPeriodValue")?.value || "មករា";

    let titleText = `តារាងចំណាត់ថ្នាក់ប្រចាំខែ${periodVal}`;
    if (periodType === "semester") titleText = `តារាងចំណាត់ថ្នាក់ប្រចាំ${periodVal}`;
    else if (periodType === "annual") titleText = `តារាងចំណាត់ថ្នាក់ប្រចាំឆ្នាំ`;

   // 🟢 ទាញយកកាលបរិច្ឆេទពីប្រព័ន្ធកំណត់ថ្មី (Settings Panel) និងសម្អាតកុំឱ្យជាន់គ្នា 🟢
    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim();
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();

    // ១. កាត់យកតែផ្នែក "ថ្ងៃទី..." ចេញពី sDate បើវាមានជាប់ពាក្យ "ធ្វើនៅ" មកជាមួយ
    if (sDate.includes("ថ្ងៃទី")) {
        sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    }

    // ២. លុបសញ្ញាក្បៀស (,) ខាងចុងនៃទីតាំងចេញ ដើម្បីកុំឱ្យជាន់គ្នា
    locationStr = locationStr.replace(/,+$/, '').trim();

    // ៣. បញ្ចូលគ្នាដើម្បីទទួលបានទម្រង់ត្រឹមត្រូវ (ឧ. ធ្វើនៅកៀនស្វាយ, ថ្ងៃទី...)
    const solarDateStr = `${locationStr}, ${sDate}`;

    // ៤. ទាញយកថ្ងៃខែចន្ទគតិ (បើក/បិទ)
    const lunarDateStr = rDates.showLunar !== false 
        ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") 
        : "";
        
    let sortedList = [...window.rankingsDataList].sort((a, b) => a.rank - b.rank);
    let total = sortedList.length;
    let female = sortedList.filter(s => s.gender === 'ស្រី').length;
    // 🟢 កែសម្រួលការគណនាស្ថិតិអូតូ 🟢
    let totalStus = window.rankingsDataList.length;
    let femaleStus = window.rankingsDataList.filter(s => s.gender === 'ស្រី').length;
    
    // កំណត់មធ្យមភាគជាប់គឺ ៥.០
    let passMark = 5.0; 
    if ((type === "semester" || type === "annual") && window.rankingsDataList.some(s => s.avg > 15)) {
        passMark = 25.0;
    }

    let passed = window.rankingsDataList.filter(s => s.avg >= passMark).length;
    let passedF = window.rankingsDataList.filter(s => s.avg >= passMark && s.gender === 'ស្រី').length;
    let failed = totalStus - passed;
    let failedF = femaleStus - passedF;

    let passPct = total > 0 ? ((passed / total) * 100).toFixed(2) : "0.00";
    let failPct = total > 0 ? ((failed / total) * 100).toFixed(2) : "0.00";
    let passFemalePct = female > 0 ? ((passedF / female) * 100).toFixed(2) : "0.00";
    let failFemalePct = female > 0 ? ((failedF / female) * 100).toFixed(2) : "0.00";

    const half = Math.ceil(total / 2);
    let rowsHtml = "";

    const tdBaseEx = `border: 0.5pt solid #000; font-family: 'Khmer OS Siemreap', sans-serif; font-size: 10pt; text-align: center; vertical-align: middle;`;

    // HTML តួអត្ថបទ (លេខសកល)
    for (let i = 0; i < half; i++) {
        let s1 = sortedList[i];
        let s2 = sortedList[i + half];

        const renderRowEx = (stu, index, isRightSide) => {
            const leftBorder = isRightSide ? 'border-left: 1.5pt solid #000;' : '';
            if (!stu) {
                const cols = periodType === "monthly" ? 5 : 7;
                return `<td colspan="${cols}" style="${tdBaseEx} ${leftBorder}"></td>`;
            }
            
            const genColor = stu.gender === 'ស្រី' ? 'color: #be123c;' : 'color: #000;';
            const avgScore = (stu.avg !== undefined && !isNaN(stu.avg)) ? stu.avg.toFixed(2) : '';
            
            let row = `<td style="${tdBaseEx} ${leftBorder}">${index}</td>
                       <td style="${tdBaseEx} text-align: left; padding-left: 5px;">${stu.name}</td>
                       <td style="${tdBaseEx} ${genColor}">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>`;
            
            if (periodType === "monthly") {
                row += `<td style="${tdBaseEx}">${avgScore}</td><td style="${tdBaseEx}">${stu.rank||''}</td>`;
            } else if (periodType === "semester") {
                row += `<td style="${tdBaseEx}">${(stu.monthly_avg !== undefined && !isNaN(stu.monthly_avg)) ? parseFloat(stu.monthly_avg).toFixed(2) : ''}</td>
                        <td style="${tdBaseEx}">${(stu.exam_avg !== undefined && !isNaN(stu.exam_avg)) ? parseFloat(stu.exam_avg).toFixed(2) : ''}</td>
                        <td style="${tdBaseEx}">${avgScore}</td><td style="${tdBaseEx}">${stu.rank||''}</td>`;
            } else {
                row += `<td style="${tdBaseEx}">${(stu.sem1_avg !== undefined && !isNaN(stu.sem1_avg)) ? parseFloat(stu.sem1_avg).toFixed(2) : ''}</td>
                        <td style="${tdBaseEx}">${(stu.sem2_avg !== undefined && !isNaN(stu.sem2_avg)) ? parseFloat(stu.sem2_avg).toFixed(2) : ''}</td>
                        <td style="${tdBaseEx}">${avgScore}</td><td style="${tdBaseEx}">${stu.rank||''}</td>`;
            }
            return row;
        };

        rowsHtml += `<tr>${renderRowEx(s1, i + 1, false)}${renderRowEx(s2, half + i + 1, true)}</tr>`;
    }

    // 🟢 ក្បាលតារាង Excel (Khmer OS Muol Light បញ្ឈរ) 🟢
    let theadExcel = "";
    const thExt = `border: 0.5pt solid #000; font-family: 'Khmer OS Muol Light', serif; font-size: 10pt; font-weight: normal; text-align: center; vertical-align: middle;`;
    const vertStyle = `mso-rotate: 90; height: 120px; white-space: nowrap; width: 35px;`;
    
    const thVEx = (text, bgHex, isRightSide) => {
        const leftBorder = isRightSide ? 'border-left: 1.5pt solid #000;' : '';
        return `<th style="${thExt} background-color: ${bgHex}; ${vertStyle} ${leftBorder}">${text}</th>`;
    };
    const thNEx = (text, bgHex, isRightSide) => {
        const leftBorder = isRightSide ? 'border-left: 1.5pt solid #000;' : '';
        return `<th style="${thExt} background-color: ${bgHex}; ${leftBorder}">${text}</th>`;
    };

    if(periodType === "monthly") {
        theadExcel = `
            <tr>
                ${thNEx('ល.រ', '#f8fafc', false)}
                ${thNEx('គោត្តនាម និងនាម', '#f8fafc', false)}
                ${thNEx('ភេទ', '#f8fafc', false)}
                ${thVEx('មធ្យមភាគ', '#eff6ff', false)}
                ${thVEx('ចំណាត់ថ្នាក់', '#fff1f2', false)}

                ${thNEx('ល.រ', '#f8fafc', true)}
                ${thNEx('គោត្តនាម និងនាម', '#f8fafc', false)}
                ${thNEx('ភេទ', '#f8fafc', false)}
                ${thVEx('មធ្យមភាគ', '#eff6ff', false)}
                ${thVEx('ចំណាត់ថ្នាក់', '#fff1f2', false)}
            </tr>
        `;
    } else if(periodType === "semester") {
        theadExcel = `
            <tr>
                ${thNEx('ល.រ', '#f8fafc', false)}
                ${thNEx('គោត្តនាម និងនាម', '#f8fafc', false)}
                ${thNEx('ភេទ', '#f8fafc', false)}
                ${thVEx('ម.ខែ', '#fef3c7', false)}
                ${thVEx('ម.ប្រឡង', '#e0f2fe', false)}
                ${thVEx('មធ្យមភាគ', '#dcfce7', false)}
                ${thVEx('ចំ.ថ្នាក់', '#fff1f2', false)}

                ${thNEx('ល.រ', '#f8fafc', true)}
                ${thNEx('គោត្តនាម និងនាម', '#f8fafc', false)}
                ${thNEx('ភេទ', '#f8fafc', false)}
                ${thVEx('ម.ខែ', '#fef3c7', false)}
                ${thVEx('ម.ប្រឡង', '#e0f2fe', false)}
                ${thVEx('មធ្យមភាគ', '#dcfce7', false)}
                ${thVEx('ចំ.ថ្នាក់', '#fff1f2', false)}
            </tr>
        `;
    } else {
        theadExcel = `
            <tr>
                ${thNEx('ល.រ', '#f8fafc', false)}
                ${thNEx('គោត្តនាម និងនាម', '#f8fafc', false)}
                ${thNEx('ភេទ', '#f8fafc', false)}
                ${thVEx('ម.ឆ.១', '#e0e7ff', false)}
                ${thVEx('ម.ឆ.២', '#dcfce7', false)}
                ${thVEx('ម.ប្រចាំឆ្នាំ', '#fef3c7', false)}
                ${thVEx('ចំ.ថ្នាក់', '#fff1f2', false)}

                ${thNEx('ល.រ', '#f8fafc', true)}
                ${thNEx('គោត្តនាម និងនាម', '#f8fafc', false)}
                ${thNEx('ភេទ', '#f8fafc', false)}
                ${thVEx('ម.ឆ.១', '#e0e7ff', false)}
                ${thVEx('ម.ឆ.២', '#dcfce7', false)}
                ${thVEx('ម.ប្រចាំឆ្នាំ', '#fef3c7', false)}
                ${thVEx('ចំ.ថ្នាក់', '#fff1f2', false)}
            </tr>
        `;
    }

    let excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8">
        <style>
            table { border-collapse: collapse; white-space: nowrap; font-family: 'Khmer OS Siemreap', sans-serif; font-size: 10pt; }
            .no-border { border: none !important; background-color: transparent !important; }
        </style>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>ចំណាត់ថ្នាក់</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head>
    <body>
        <table>
            <!-- ផ្នែកក្បាលរដ្ឋបាល (Muol Light) -->
            <tr>
                <td colspan="5" class="no-border" style="text-align: left; vertical-align: top; font-family: 'Khmer OS Muol Light', serif; font-size: 11pt;">
                    ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}<br><br>
                    ${schoolName}<br>
                    ${grade}
                </td>
                <td colspan="5" class="no-border" style="text-align: center; vertical-align: top; font-family: 'Khmer OS Muol Light', serif; font-size: 11pt;">
                    ព្រះរាជាណាចក្រកម្ពុជា<br>
                    ជាតិ សាសនា ព្រះមហាក្សត្រ<br>
                    <!-- ក្បាច់រចនាប័ទ្ម Tacteing គូរដោយ HTML សុទ្ធ (ធានា ១០០% ដើរលើគ្រប់ទូរស័ព្ទ) -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
                            <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
                            <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
                            <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
                        </div>
                </td>
            </tr>
            <tr><td colspan="10" class="no-border" style="height: 10px;"></td></tr>

            <!-- ផ្នែកចំណងជើង (Muol Light) -->
            <tr>
                <td colspan="10" class="no-border" style="text-align: center; font-family: 'Khmer OS Muol Light', serif; font-size: 14pt; color: red;">
                    ${titleText}
                </td>
            </tr>
            <tr>
                <td colspan="10" class="no-border" style="text-align: center; font-size: 11pt; font-weight: bold;">
                    ឆ្នាំសិក្សា ៖ ${academicYear}
                </td>
            </tr>
            <tr><td colspan="10" class="no-border" style="height: 10px;"></td></tr>

            <!-- តារាងទិន្នន័យកណ្តាល -->
            ${theadExcel}
            ${rowsHtml}
            
            <tr><td colspan="10" class="no-border" style="height: 10px;"></td></tr>

            <!-- ផ្នែកស្ថិតិ (លេខសកល) -->
            <tr>
                <td colspan="10" class="no-border" style="text-align: left; font-size: 11pt; padding-left: 10px;">
                    ❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${total}</b> សិស្សសរុប <b>${total}</b> នាក់ ស្រី <b>${female}</b> នាក់
                </td>
            </tr>
            <tr>
                <td colspan="10" class="no-border" style="text-align: left; font-size: 11pt; padding-left: 10px;">
                    ❖ សិស្សជាប់មធ្យមភាគ <b>${passedTotal}</b> នាក់ (<b>${passPct}%</b>) ស្រី <b>${passedFemale}</b> នាក់ (<b>${passFemalePct}%</b>)
                </td>
            </tr>
            <tr>
                <td colspan="10" class="no-border" style="text-align: left; font-size: 11pt; padding-left: 10px;">
                    ❖ សិស្សធ្លាក់មធ្យមភាគ <b>${failedTotal}</b> នាក់ (<b>${failPct}%</b>) ស្រី <b>${failedFemale}</b> នាក់ (<b>${failFemalePct}%</b>)
                </td>
            </tr>
            <tr><td colspan="10" class="no-border" style="height: 20px;"></td></tr>

            <!-- ហត្ថលេខា (កាលបរិច្ឆេទកំណត់ពីប្រព័ន្ធ និង Muol Light) -->
            <div class="bottom-sig-container">
            <div class="sig-box"><br><br>
                <p class="font-moul" style="margin: 0 0 5px 0; font-size: 11pt;">បានឃើញ និងឯកភាព</p>
                <p class="font-moul" style="margin: 0 0 60px 0; font-size: 11pt;">នាយកសាលា</p>
            </div>
            <div class="sig-box">
                <p style="margin: 0 0 5px 0; font-size: 11pt; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${lunarDateStr}</p>
                <p style="margin: 0 0 5px 0; font-size: 11pt; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${solarDateStr}</p>
                <p class="font-moul" style="margin-bottom: 60px; font-size: 11pt;">គ្រូបន្ទុកថ្នាក់</p>
                <p class="font-moul" style="font-size: 11pt;">${teacherName}</p>
            </div>
        </div>
            
            <tr>
                <td colspan="5" class="no-border" style="height: 70px;"></td>
                <td colspan="5" class="no-border" style="height: 70px;"></td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const blob = new Blob(['\ufeff', excelHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `តារាងចំណាត់ថ្នាក់_${grade.replace(/ /g, '_')}_${periodVal}_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
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
    // លេខរៀងប្រើលេខសកល
    const sOptions = students.map((s, idx) => `<option value="${s.id}" ${window.selectedReportCardStudentId === String(s.id) ? 'selected' : ''}>ល.រ ${idx + 1} ៖ ${s.name}</option>`).join('');

    c.innerHTML = `
      <div class="flex flex-col h-full bg-slate-100 p-3 md:p-5 border border-slate-200 font-siemreap">
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end no-print">
          <div><label class="block text-xs font-bold text-slate-600 mb-1">ទម្រង់ព្រឹត្តិបត្រ</label><select onchange="window.changeReportCardViewMode(this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold text-indigo-700 outline-none p-2 rounded-xl"><option value="monthly_sheet" ${window.reportCardPrintType==='monthly_sheet'?'selected':''}>📄 ទំព័រលទ្ធផល (A4)</option><option value="cover_page" ${window.reportCardPrintType==='cover_page'?'selected':''}>📘 ក្របមុខ និងព័ត៌មាន</option><option value="full_booklet" ${window.reportCardPrintType==='full_booklet'?'selected':''}>📚 សៀវភៅតាមដានពេញ</option></select></div>
          <div><label class="block text-xs font-bold text-slate-600 mb-1">កម្រិតសិក្សា</label><select onchange="window.changeEducationLevel(this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold text-purple-800 outline-none p-2 rounded-xl"><option value="auto" ${window.selectedEducationLevel==='auto'?'selected':''}>🔄 ស្វ័យប្រវត្តិ</option><option value="primary" ${window.selectedEducationLevel==='primary'?'selected':''}>🏫 បឋមសិក្សា</option><option value="secondary" ${window.selectedEducationLevel==='secondary'?'selected':''}>🏛️ អនុ / វិទ្យាល័យ</option></select></div>
          <div><label class="block text-xs font-bold text-slate-600 mb-1">ជ្រើសរើសសិស្ស</label><select onchange="window.filterReportCardStudent(this.value)" class="bg-slate-50 border border-slate-200 text-xs font-bold text-emerald-800 outline-none p-2 rounded-xl"><option value="all" ${window.selectedReportCardStudentId==='all'?'selected':''}>👥 សិស្សទាំងអស់ (${students.length} នាក់)</option>${sOptions}</select></div>
        </div>

        ${typeof window.getDateSettingsPanelHTML === 'function' ? window.getDateSettingsPanelHTML('reportcards') : ''}

        <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center gap-8 py-2 mt-4" id="reportCardsPreviewArea">${window.renderReportCardPreview()}</div>
      </div>
    `;
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
        
        // មធ្យមភាគ និង ចំណាត់ថ្នាក់ប្រើលេខសកល
        const avgDisplay = s.avg != null ? Number(s.avg).toFixed(2) : '-';
        const rankDisplay = s.rank != null ? s.rank : '-';
        
        return `
          <div class="no-print w-full max-w-[210mm] flex items-center justify-between bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-xs text-xs font-siemreap">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-mono">${idx + 1}</span>
              <span class="font-bold text-slate-800 font-moul text-[13px]">${s.name}</span>
              <span class="text-slate-400">|</span><span class="text-slate-500">ភេទ៖ <b>${s.gender || 'ប្រុស'}</b></span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-indigo-600 font-bold">មធ្យមភាគ៖ <b class="font-mono text-sm">${avgDisplay}</b></span>
              <span class="text-rose-600 font-bold">ចំណាត់ថ្នាក់៖ <b class="font-mono text-sm">${rankDisplay}</b></span>
            </div>
          </div>
          <div class="preview-page-container bg-white shadow-xl rounded-sm mb-6 print:shadow-none print:m-0">${sheetHtml}</div>
        `;
    }).join("");
};


// ==========================================
// មុខងារបង្កើតទំព័រព្រឹត្តិបត្រពិន្ទុ (បង្ហាញមុខវិជ្ជារង និងមុខវិជ្ជាគោលពេញលេញ - លេខសកល)
// ==========================================
window.generateMonthlySheetHTML = function(stu, periodOverride = null) {
    const levelStr = document.getElementById("globalLevelSelect")?.value || stu.grade || "ថ្នាក់ទី 2";
    const month = periodOverride || document.getElementById("globalPeriodValue")?.value || "មករា";
    const type = document.getElementById("globalPeriodType")?.value || "monthly";

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = sInfo.teacher_name || ".......................";
    const academicYear = sInfo.academic_year || "2026-2027"; // លេខសកល

    let headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំខែ ${month}`;
    if (type === "semester") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំ ${month}`;
    else if (type === "annual") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំឆ្នាំសិក្សា ${academicYear}`;

    const isPrimary = typeof window.getEducationLevel === 'function' ? (window.getEducationLevel(levelStr) === 'primary') : levelStr.includes("ទី 1") || levelStr.includes("ទី 2") || levelStr.includes("ទី 3") || levelStr.includes("ទី 4") || levelStr.includes("ទី 5") || levelStr.includes("ទី 6") || levelStr.includes("ទី ១") || levelStr.includes("ទី ២");

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
                
                // លេខសកល
                const formattedMax = maxVal; 
                const formattedVal = displayVal !== null ? displayVal : "-";
                
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
                    groupCell = `<td rowspan="${rowSpan}" style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 10.5px; font-weight: bold; font-family: 'Moul', serif;">${globalIndex++}</td>
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
            
            // លេខសកល
            const formattedMax = maxVal;
            const formattedVal = displayVal !== null ? displayVal : "-";
            
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
                <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 10.5px; font-weight: bold; font-family: 'Moul', serif;">${globalIndex++}</td>
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

    // ប្រើលេខសកលទាំងអស់
    const totalScoreFormatted = (targetTotal !== undefined && targetTotal !== null && !isNaN(targetTotal)) ? Number(targetTotal).toFixed(2) : "......";
    const avgFormatted = (targetAvg !== undefined && targetAvg !== null && !isNaN(targetAvg)) ? Number(targetAvg).toFixed(2) : "......";
    const totalStus = window.rankingsDataList ? window.rankingsDataList.length : 0;
    
    // ចំណាត់ថ្នាក់ X / Y (ឧទាហរណ៍ 1/35)
    const rankFormatted = (targetRank !== undefined && targetRank !== null && String(targetRank).trim() !== "" && targetRank !== "-") 
      ? (totalStus > 0 ? `${targetRank} / ${totalStus}` : targetRank) : "......";

    const rDates = window.reportCardDateSettings || {};
    const lunarDateStr = rDates.showLunar !== false ? rDates.lunarDate : "";
    const solarDateStr = typeof window.getFormattedSolarDate === 'function' ? window.getFormattedSolarDate() : "";

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
// ១. ផ្ទាំងបញ្ជាមេ (Tab Control Bar) - អាប់ដេតបន្ថែម Outer Global Scroll
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
      <style>
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      </style>
      
      <!-- 🟢 ផ្ទៃ Scroll ខាងក្រៅបង្អស់ (Outer Global Scroll សម្រាប់ទូរសព្ទ) 🟢 -->
      <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 relative rounded-3xl">
        
        <div class="flex flex-col font-siemreap max-w-[1680px] mx-auto pb-16 px-2 md:px-4 pt-4">
        
            <!-- ក្បាលទំព័រ និងការកំណត់ -->
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-5 no-print flex flex-col gap-3.5 transition-all">
              
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

                  <div class="flex flex-1 sm:flex-none items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
                    <i class="fa-solid fa-users text-emerald-600 text-xs"></i>
                    <span class="text-xs font-bold text-slate-600">សិស្ស៖</span>
                    <select onchange="window.filterReportCardStudent(this.value)" class="w-full bg-transparent text-xs font-bold text-emerald-800 outline-none cursor-pointer max-w-[200px]">
                      <option value="all" ${window.selectedReportCardStudentId==='all'?'selected':''}>👥 សិស្សទាំងអស់ (${students.length} នាក់)</option>
                      ${sOptions}
                    </select>
                  </div>
                </div>

                <button onclick="window.printReportCards()" class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                  <i class="fa-solid fa-print text-sm"></i> បោះពុម្ព (${window.selectedReportCardStudentId==='all' ? students.length + ' នាក់' : '១ នាក់'})
                </button>
              </div>

              <!-- 🟢 Date Settings Panel (រួមបញ្ចូលដោយផ្ទាល់សម្រាប់ភាពងាយស្រួល) 🟢 -->
              <div id="rcDateSettingsPanel" class="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-3 text-xs">
                <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div class="flex items-center gap-1.5 w-full sm:w-auto">
                    <span class="font-bold text-slate-600 w-16 sm:w-auto">ធ្វើនៅ៖</span>
                    <input type="text" id="rcLocationInput" value="${window.reportCardDateSettings?.location || ''}" 
                           oninput="window.updateDateSetting('location', this.value)" 
                           class="flex-1 sm:flex-none border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 w-full sm:w-24 bg-white outline-none">
                  </div>
                  
                  <div class="flex items-center gap-1.5 w-full sm:w-auto">
                    <span class="font-bold text-slate-600 w-16 sm:w-auto">សូរិយគតិ៖</span>
                    <input type="text" id="rcSolarInput" value="${window.reportCardDateSettings?.solarDate || ''}" 
                           oninput="window.updateDateSetting('solarDate', this.value)" 
                           class="flex-1 sm:flex-none border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 w-full sm:w-52 bg-white outline-none">
                    <button onclick="window.setTodaySolarDate()" class="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-indigo-600 shadow-sm shrink-0">ថ្ងៃនេះ</button>
                  </div>
                </div>

                <div class="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                  <label class="inline-flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 w-20 sm:w-auto shrink-0">
                    <input type="checkbox" id="rcShowLunarCheck" ${window.reportCardDateSettings?.showLunar ? 'checked' : ''} 
                           onchange="window.updateDateSetting('showLunar', this.checked)" class="rounded text-indigo-600 w-4 h-4">
                    <span>ចន្ទគតិ៖</span>
                  </label>
                  <input type="text" id="rcLunarInput" value="${window.reportCardDateSettings?.lunarDate || ''}" 
                         oninput="window.updateDateSetting('lunarDate', this.value)" 
                         placeholder="ថ្ងៃ.............. ...កើត/រោច..."
                         class="flex-1 sm:flex-none border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 w-full sm:w-64 bg-white outline-none transition-opacity ${!window.reportCardDateSettings?.showLunar ? 'opacity-50 pointer-events-none' : ''}">
                </div>
              </div>

              <!-- ជម្រើសកំណត់វិន័យ និងសីលធម៌ -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-indigo-50/50 p-2.5 px-3 rounded-xl border border-indigo-100 mt-1">
                <div class="flex items-center gap-2 mb-1 sm:mb-0">
                  <i class="fa-solid fa-award text-indigo-600"></i>
                  <span class="font-bold text-indigo-900">អនុវត្តគំរូវិន័យសីលធម៌ដល់សិស្សទាំងអស់៖</span>
                </div>
                <select onchange="window.applyConductToAll(this.value)" class="w-full sm:w-auto bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-full sm:max-w-[340px]">
                  <option value="" disabled selected>-- ជ្រើសរើសដើម្បីដាក់សិស្សទាំងអស់ --</option>
                  ${window.CONDUCT_TEMPLATES.map((tpl, i) => `<option value="${tpl}">${i + 1}.${tpl.length > 35 ? tpl.substring(0, 35) + '...' : tpl}</option>`).join('')}
                </select>
              </div>
              
            </div> <!-- បិទ Container ក្បាលទំព័រ -->

            <!-- 🟢 ផ្ទៃបង្ហាញលទ្ធផល (Preview Area) - អាចអូសផ្តេកបានសម្រាប់ទូរសព្ទតូចៗ 🟢 -->
            <div class="w-full overflow-x-auto custom-scrollbar">
                <div class="flex flex-col items-center gap-8 py-2 min-w-max md:min-w-0" id="reportCardsPreviewArea">
                   ${window.renderReportCardPreview()}
                </div>
            </div>

        </div> <!-- បិទ Wrapper ផ្នែកខាងក្នុង -->
      </div> <!-- បិទ Outer Global Scroll -->
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
// ៣. ទំព័រលទ្ធផលសិក្សាប្រចាំខែ (គាំទ្រមុខវិជ្ជាគោល & រង សម្រាប់បឋម - លេខសកល)
// =====================================================================
window.generateMonthlySheetHTML = function(stu, periodOverride = null) {
  const levelStr = document.getElementById("globalLevelSelect")?.value || stu.grade || "ថ្នាក់ទី ២";
  const month = periodOverride || document.getElementById("globalPeriodValue")?.value || document.getElementById("attMonthSelect")?.value || "មករា";
  const type = document.getElementById("globalPeriodType")?.value || "monthly";

  let headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំខែ ${month}`;
  if (type === "semester") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំ ${month}`;
  else if (type === "annual") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំឆ្នាំសិក្សា 20...-20...`; // លេខសកល

  const isPrimary = window.getEducationLevel(levelStr) === 'primary';

  let tableHeaderHtml = "";
  let rowsHtml = "";
  let calculatedSum = 0;

  // កូដជំនួយសម្រាប់ Render ពិន្ទុ និងនិទ្ទេស (លេខសកល)
  const renderScoreCellsUniversal = (score, max) => {
    const t = getGradeTick(score, max);
    const sStr = (score !== null && !isNaN(score)) ? Number(score).toString() : "-";
    const b = "border: 1.5px solid #1e3a8a; text-align: center;";
    return `
      <td style="${b} font-size: 11px; font-mono; width: 10%; color: #334155;">${max}</td>
      <td style="${b} font-size: 11.5px; font-mono; font-weight: bold; width: 13%; color: #1e3a8a; background: #f8fafc;">${sStr}</td>
      <td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.vg}</td>
      <td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.g}</td>
      <td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.m}</td>
      <td style="${b} font-weight: bold; font-size: 12px; color: #e11d48; width: 8.5%;">${t.w}</td>
    `;
  };

  // ក. តារាងកម្រិតបឋមសិក្សា (មានមុខវិជ្ជាគោល និងមុខវិជ្ជារង)
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
            <td rowspan="${span}" style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11px; font-weight: bold; width: 5%;">${mainSub.no}</td>
            <td rowspan="${span}" style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 11px; width: 20%; background: #fbfcfe;">${mainSub.name}</td>
          ` : "";

          rowsHtml += `
            <tr style="height: 19px;">
              ${firstCells}
              <td style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-size: 10px; width: 18%; font-family: 'Siemreap', sans-serif;">${sub.name}</td>
              ${renderScoreCellsUniversal(sc, sub.max)}
            </tr>
          `;
        });
      } else {
        const sc = getSubjectScore(stu, mainSub);
        if (sc !== null && !isNaN(sc)) calculatedSum += sc;
        rowsHtml += `
          <tr style="height: 20px;">
            <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11px; font-weight: bold; width: 5%;">${mainSub.no}</td>
            <td colspan="2" style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 11px; width: 38%;">${mainSub.name}</td>
            ${renderScoreCellsUniversal(sc, mainSub.max)}
          </tr>
        `;
      }
    });

  } else {
    // ខ. តារាងអនុវិទ្យាល័យ និងវិទ្យាល័យ
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
          <td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11.5px; font-weight: bold; width: 6%;">${idx + 1}</td>
          <td style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 8px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 12px; width: 34%;">${sub.name}</td>
          ${renderScoreCellsUniversal(sc, maxScore)}
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
  const totalScoreFormatted = rawTotal != null ? Number(rawTotal).toFixed(0) : "......";
  const avgFormatted = (stu.avg !== undefined && stu.avg !== null && !isNaN(stu.avg)) ? Number(stu.avg).toFixed(2) : "......";
  const totalStus = window.rankingsDataList?.length ? window.rankingsDataList.length : "";
  const rankFormatted = (stu.rank !== undefined && stu.rank !== null && String(stu.rank).trim() !== "")
    ? (totalStus ? `${stu.rank} / ${totalStus}` : stu.rank) : "......";

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
           អវត្តមានៈ មានច្បាប់ <span contenteditable="true" style="font-weight: bold; font-family: monospace; font-size: 12.5px; color: #1e3a8a; border-bottom: 1px dotted #94a3b8; padding: 0 4px;">${permCount}</span> ដង
           &nbsp;&nbsp;&nbsp;&nbsp;ឥតច្បាប់ <span contenteditable="true" style="font-weight: bold; font-family: monospace; font-size: 12.5px; color: #e11d48; border-bottom: 1px dotted #94a3b8; padding: 0 4px;">${unexCount}</span> ដង
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
// ៥. ទំព័រក្រប និងព័ត៌មានសិស្ស (A4 ទំនើប និងទាន់សម័យ - លេខសកល + កែថ្ងៃខែ)
// =====================================================================
window.generateCoverAndProfileHTML = function(stu) {
    let fullStu = { ...stu };
    try {
        const allStus = JSON.parse(localStorage.getItem('academic_students')) || window.allStudents || [];
        const found = allStus.find(s => String(s.id).trim() === String(stu.id).trim());
        if (found) fullStu = { ...found, ...stu };
    } catch(e) {}

    // ប្រើលេខសកលសម្រាប់ថ្នាក់ មិនបាច់បំប្លែងទេ
    const levelStr = document.getElementById("globalLevelSelect")?.value || fullStu.grade || "ថ្នាក់ទី 7";
    const room = document.getElementById("globalRoomSelect")?.value || fullStu.room || "«ខ»";
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ដីឥដ្ឋ";
    const clusterName = sInfo.cluster || sInfo.school_cluster || "កម្រងដីឥដ្ឋ";
    const schoolPhone = sInfo.phone || sInfo.school_phone || "012 345 678"; // លេខសកល
    const academicYear = sInfo.academic_year || "2026-2027"; // លេខសកល

    const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    let birthDay = "", birthMonth = "", birthYear = "";
    
    // 🔴 មុខងារសម្អាតថ្ងៃខែដ៏រឹងមាំ (Super Clean)
    let cleanDob = String(fullStu.dob || "").replace(/["'\s]/g, ""); // លុបសញ្ញាធ្មេញកណ្ដុរ និងចន្លោះ
    cleanDob = cleanDob.replace(/T[0-9:\.Z]+/gi, ""); // លុបម៉ោងអន្តរជាតិ (T17:00:00.000Z)
    cleanDob = cleanDob.replace(/-/g, '/'); // បំប្លែងសញ្ញា - ទៅជា / ទាំងអស់
    
    if (cleanDob && cleanDob.includes("/")) {
        const parts = cleanDob.split("/");
        if (parts.length >= 3) {
            // ឆែកមើលបើឆ្នាំនៅខាងមុខ (ឧ. 2011/05/19)
            if (parts[0].length === 4) {
                birthYear = parts[0];
                const mIdx = parseInt(parts[1], 10) - 1;
                birthMonth = (mIdx >= 0 && mIdx < 12) ? khmerMonths[mIdx] : parts[1];
                birthDay = parseInt(parts[2], 10).toString();
            } else { 
                // បើថ្ងៃនៅខាងមុខ (ឧ. 19/05/2011)
                birthDay = parseInt(parts[0], 10).toString();
                const mIdx = parseInt(parts[1], 10) - 1;
                birthMonth = (mIdx >= 0 && mIdx < 12) ? khmerMonths[mIdx] : parts[1];
                birthYear = parts[2];
            }
        }
    } else if (cleanDob) {
        birthDay = cleanDob;
    }

    let fullDobKhmer = "";
    if (birthDay && birthMonth && birthYear) {
        // រក្សាទុកលេខសកល (ថ្ងៃទី 19 ខែ ឧសភា ឆ្នាំ 2011)
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
           
           <!-- ស៊ុមតុបតែងប្រណិតបែបទំនើប -->
           <div style="position: absolute; top: 2.5mm; bottom: 2.5mm; left: 2.5mm; right: 2.5mm; border: 1px solid #93c5fd; pointer-events: none; border-radius: 4px;"></div>
           <div style="position: absolute; top: 4mm; bottom: 4mm; left: 4mm; right: 4mm; border: 0.5px dashed #cbd5e1; pointer-events: none;"></div>

           <!-- ក្បាច់កែងទំនើប -->
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
                    <span style="font-size: 11px; color: #475569; font-weight: bold;">ទូរសព្ទ ៖ <span style="font-family: monospace;">${schoolPhone}</span></span>
                 </div>
              </div>
           </div>

           <!-- និមិត្តសញ្ញាអប់រំផ្លូវការ -->
           <div style="display: flex; justify-content: center; margin: 2mm 0;">
              <div style="position: relative; width: 78px; height: 78px;">
                 <svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="47" stroke="#1e3a8a" stroke-width="2.5" fill="#f8fafc"/>
                    <circle cx="50" cy="50" r="42" stroke="#d97706" stroke-width="1.2" stroke-dasharray="3 2"/>
                    <path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M50 63C41 57 30 58 22 60V36C30 34 41 34 50 39C59 34 70 34 78 36V60C70 58 59 57 50 63Z" fill="#1e3a8a"/>
                    <path d="M50 39V63" stroke="#ffffff" stroke-width="1.8"/>
                    <path d="M48 23H52V35H48V23Z" fill="#f59e0b"/>
                    <path d="M50 16C46 19.5 46 22 50 24C54 22 54 19.5 50 16Z" fill="#ef4444"/>
                    <circle cx="50" cy="50" r="3.5" fill="#ffffff"/>
                 </svg>
              </div>
           </div>

           <!-- បដាចំណងជើងធំ -->
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

           <!-- កាតបង្ហាញព័ត៌មានសិស្សបែបទំនើប (លេខសកល) -->
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
                    <div style="font-family: monospace; font-weight: bold; font-size: 15px; color: #0f172a;">${fullStu.id || '........'}</div>
                 </div>

                 <div style="background: #fdf2f8; border: 1px solid #fbcfe8; padding: 8px 6px; border-radius: 10px;">
                    <div style="font-size: 10.5px; color: #db2777; font-weight: bold; margin-bottom: 2px;">ថ្នាក់រៀន</div>
                    <div style="font-family: 'Moul', serif; font-size: 13.5px; color: #be123c;">${levelStr.replace('ថ្នាក់ទី ', '')} ${room}</div>
                 </div>

                 <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 6px; border-radius: 10px;">
                    <div style="font-size: 10.5px; color: #16a34a; font-weight: bold; margin-bottom: 2px;">ឆ្នាំសិក្សា</div>
                    <div style="font-family: monospace; font-weight: bold; font-size: 14.5px; color: #15803d;">${academicYear}</div>
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
      <!-- ទំព័រទី ២៖ ព័ត៌មានលម្អិតសិស្ស (Modern Structured Profile Sheet - លេខសកល) -->
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

              <!-- ប្លុកព័ត៌មានផ្ទាល់ខ្លួន និងរូបថត (លេខសកល) -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 3mm; background: #f8fafc; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
                 <div style="flex: 1; font-size: 13px; line-height: 2.1;">
                    <div style="display: flex; gap: 16px; align-items: baseline;">
                       <span>ឈ្មោះសិស្ស ៖ <b style="font-family: 'Moul', serif; font-size: 15px; color: #1e3a8a;">${fullStu.name}</b></span>
                       <span>ភេទ ៖ <b>${fullStu.gender || 'ប្រុស'}</b></span>
                       <span>អត្តលេខ ៖ <b style="font-family: monospace; font-size: 14px; color: #1e3a8a;">${fullStu.id || '........'}</b></span>
                    </div>
                    <div>
                       ថ្នាក់ទី ៖ <b style="color: #be123c;">${levelStr.replace('ថ្នាក់ទី ', '')} ${room}</b>
                       &nbsp;&nbsp;&nbsp;&nbsp; ឆ្នាំសិក្សា ៖ <b style="font-family: monospace; color: #1e3a8a;">${academicYear}</b>
                    </div>
                    <div>
                       សាលារៀន ៖ <span style="font-weight: bold; color: #334155;">${schoolName}</span>
                       &nbsp;&nbsp;&nbsp;&nbsp; កម្រង ៖ <span>${renderField(clusterName, ".....................")}</span>
                    </div>
                 </div>

                 <!-- ប្រអប់រូបថត -->
                 <div style="width: 28mm; height: 36mm; border: 2px dashed #93c5fd; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #ffffff; flex-shrink: 0; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    ${photoSrc ? `<img src="${photoSrc}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="#94a3b8" style="margin-bottom: 2px;">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                       </svg>
                       <span style="font-size: 10px; font-weight: bold; color: #64748b;">រូបថត 4 x 6</span>
                    `}
                 </div>
              </div>

              <!-- តារាងព័ត៌មានលម្អិត (លេខសកល) -->
              <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 12.5px; line-height: 2.3; color: #1e293b; background: #ffffff;">
                 
                 <div style="font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 4px;">
                    I. ទីកន្លែងកំណើត និងអាសយដ្ឋានបច្ចុប្បន្ន
                 </div>
                 
                 <div> 
                    • ថ្ងៃខែឆ្នាំកំណើត ៖ ${renderField(fullDobKhmer, "ថ្ងៃទី...... ខែ................ ឆ្នាំ20......")} 
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

              <!-- សេចក្តីសន្យា -->
              <div style="margin-top: 3mm; background: #eff6ff; border-left: 3.5px solid #2563eb; padding: 6px 12px; border-radius: 4px; font-size: 11px; color: #1e40af; font-style: italic;">
                 « ខ្ញុំបាទ/នាងខ្ញុំ សូមសន្យាថានឹងគោរពប្រតិបត្តិតាមបទបញ្ជាផ្ទៃក្នុងរបស់សាលារៀន ឧស្សាហ៍ព្យាយាមរៀនសូត្រ និងគោរពវិន័យឱ្យបានខ្ជាប់ខ្ជួនបំផុត »
              </div>
           </div>

           <!-- ហត្ថលេខា -->
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


// =====================================================================
// 🟢 មុខងារកំណត់ខែសម្រាប់គណនាមធ្យមភាគប្រចាំឆមាសទី១ និងទី២ (កែសម្រួលបញ្ហា Pop-up)
// =====================================================================

window.openSemesterConfig = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    
    // ទាញយកការកំណត់ចាស់ (បើមាន) ឬកំណត់ Default
    const defaultSettings = {
        sem1: ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"],
        sem2: ["ឧសភា", "មិថុនា", "កក្កដា"]
    };
    const savedConfig = JSON.parse(localStorage.getItem('semester_month_config_' + grade)) || defaultSettings;
    
    const allMonths = ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា"];

    // បង្កើត HTML សម្រាប់ផ្ទាំង Modal ថ្មីដោយមាន z-index ខ្ពស់បំផុត
    let modalHtml = `
      <div id="semesterConfigModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-4 font-siemreap transition-all" style="z-index: 999999;">
        <div class="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-3xl overflow-hidden flex flex-col transform transition-all scale-100 border border-slate-200">
            
            <!-- ក្បាល Pop-up -->
            <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 sm:p-5 flex justify-between items-center shadow-md">
                <h3 class="font-moul text-white text-sm sm:text-base drop-shadow-md flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fa-solid fa-sliders"></i></div>
                    កំណត់ខែគណនាមធ្យមភាគប្រចាំឆមាស
                </h3>
                <button onclick="document.getElementById('semesterConfigModal').remove()" class="w-8 h-8 rounded-full bg-white/20 text-white flex justify-center items-center hover:bg-white/40 transition-colors shadow-sm">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            
            <!-- តួ Pop-up -->
            <div class="p-4 sm:p-6 overflow-y-auto custom-scrollbar max-h-[75vh] bg-slate-50">
                <div class="mb-5 text-[12px] sm:text-[13px] text-blue-800 font-bold bg-blue-100/50 p-4 rounded-2xl border border-blue-200 flex items-start gap-3 shadow-sm leading-relaxed">
                    <i class="fa-solid fa-circle-info text-blue-600 text-lg mt-0.5"></i> 
                    <p>សូមជ្រើសរើសខែដែលបានយកពិន្ទុជាក់ស្តែង ដើម្បីឱ្យប្រព័ន្ធទាញយកពិន្ទុទាំងនោះមកបូកបញ្ចូល និងចែកមធ្យមភាគប្រចាំខែ (សម្រាប់ប្រឡងឆមាស) ដោយស្វ័យប្រវត្តិ។</p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <!-- ឆមាសទី១ -->
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                        <h4 class="font-moul text-indigo-700 text-[13px] sm:text-sm mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <i class="fa-solid fa-book-open text-indigo-400"></i> សម្រាប់ឆមាសទី១
                        </h4>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            ${allMonths.map(m => `
                                <label class="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all">
                                    <input type="checkbox" value="${m}" class="sem1-month-cb w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shadow-sm" ${savedConfig.sem1.includes(m) ? 'checked' : ''}>
                                    <span class="text-xs sm:text-sm font-bold text-slate-700">ខែ ${m}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- ឆមាសទី២ -->
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                        <h4 class="font-moul text-emerald-700 text-[13px] sm:text-sm mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <i class="fa-solid fa-book-open text-emerald-400"></i> សម្រាប់ឆមាសទី២
                        </h4>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            ${allMonths.map(m => `
                                <label class="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all">
                                    <input type="checkbox" value="${m}" class="sem2-month-cb w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shadow-sm" ${savedConfig.sem2.includes(m) ? 'checked' : ''}>
                                    <span class="text-xs sm:text-sm font-bold text-slate-700">ខែ ${m}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ប៊ូតុងខាងក្រោម -->
            <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button onclick="document.getElementById('semesterConfigModal').remove()" class="px-5 sm:px-6 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-xs sm:text-sm">បោះបង់</button>
                <button onclick="window.saveSemesterConfig()" class="px-5 sm:px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md flex items-center gap-2 transition-transform transform hover:-translate-y-0.5 text-xs sm:text-sm">
                    <i class="fa-solid fa-floppy-disk"></i> រក្សាទុកការកំណត់
                </button>
            </div>
        </div>
      </div>
    `;

    // បញ្ចូលទៅក្នុងតួវេបសាយ
    const oldModal = document.getElementById('semesterConfigModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.saveSemesterConfig = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    
    // ទាញយកខែដែលបានគ្រីស (Checked)
    const sem1Checked = Array.from(document.querySelectorAll('.sem1-month-cb:checked')).map(cb => cb.value);
    const sem2Checked = Array.from(document.querySelectorAll('.sem2-month-cb:checked')).map(cb => cb.value);
    
    const config = { sem1: sem1Checked, sem2: sem2Checked };
    
    // រក្សាទុកក្នុង LocalStorage
    localStorage.setItem('semester_month_config_' + grade, JSON.stringify(config));
    
    document.getElementById('semesterConfigModal').remove();
    
    // លោតសារជោគជ័យ
    if(typeof showToast === 'function') showToast("✅ ការកំណត់ខែត្រូវបានរក្សាទុកដោយជោគជ័យ!");
    else alert("ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ!");
    
    // បង្ខំឲ្យទាញយកទិន្នន័យពិន្ទុថ្មី ដើម្បីគណនាមធ្យមភាគឡើងវិញភ្លាមៗ
    if(typeof window.fetchStudentsForScores === 'function') window.fetchStudentsForScores();
};