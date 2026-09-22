// =====================================================================
// ឯកសារ js/attendance.js - ប្រព័ន្ធគ្រប់គ្រងបញ្ជីវត្តមាន ស្ថិតិអវត្តមាន និង Sync ជាមួយ Google Sheets
// =====================================================================

let attendanceStudents = []; 
let monthlyAttendanceData = {}; 
window.monthlyAttendanceData = monthlyAttendanceData; 
const KHMER_DAYS = ["អា", "ច", "អ", "ពុ", "ព្រ", "សុ", "ស"];
const KHMER_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

// បញ្ជីថ្ងៃឈប់សម្រាកប្រចាំខែ
window.monthlyHolidays = {};

// =====================================================================
// Utilities & Helper Functions
// =====================================================================
window.toKhmerNum = window.toKhmerNum || function(str) {
    if (str === null || str === undefined || str === "") return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
};

window.getSchoolLevel = window.getSchoolLevel || function(gradeStr) {
    if (!gradeStr) return "primary";
    const numStr = gradeStr.replace(/[^\d១២៣៤៥៦៧៨៩០]/g, '');
    const khmerNumbersAc = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const arabicNumStr = numStr.split('').map(n => khmerNumbersAc.indexOf(n) > -1 ? khmerNumbersAc.indexOf(n) : n).join('');
    const num = parseInt(arabicNumStr);
    if (num >= 7 && num <= 9) return "lower_sec";
    if (num >= 10 && num <= 12) return "upper_sec";
    return "primary"; 
};

function parseDayNumber(dateVal) {
    if (!dateVal) return null;
    const s = String(dateVal).trim();
    const m1 = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m1) return parseInt(m1[3], 10);
    const m2 = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (m2) return parseInt(m2, 10);
    const m3 = s.match(/^(\d{1,2})$/);
    if (m3) return parseInt(m3, 10);
    return null;
}

function isRecordInMonth(r, currentMonthName, currentMonthNum, currentYear) {
    if (r.month !== undefined && r.month !== null && String(r.month).trim() !== "") {
        const mStr = String(r.month).trim();
        if (mStr === currentMonthName || parseInt(mStr, 10) === currentMonthNum) {
            return true;
        }
    }
    if (r.date) {
        const s = String(r.date).trim();
        const m1 = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (m1) {
            const y = parseInt(m1, 10);
            const m = parseInt(m1, 10);
            if (m === currentMonthNum && (!currentYear || y === currentYear)) return true;
        }
        const m2 = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (m2) {
            const m = parseInt(m2, 10);
            const y = parseInt(m2[3], 10);
            if (m === currentMonthNum && (!currentYear || y === currentYear)) return true;
        }
    }
    return false;
}

function findMatchingStudent(r, studentList) {
    const rawId = String(r.student_id || r.studentId || r.id || r['អត្តលេខ'] || "").trim();
    if (rawId) {
        let found = studentList.find(s => String(s.id).trim().toLowerCase() === rawId.toLowerCase());
        if (found) return found;

        const numId = parseInt(rawId.replace(/[^\d]/g, ''), 10);
        if (!isNaN(numId)) {
            found = studentList.find(s => {
                const sNum = parseInt(String(s.id).replace(/[^\d]/g, ''), 10);
                return !isNaN(sNum) && sNum === numId;
            });
            if (found) return found;
        }
    }
    const rawName = String(r.student_name || r.name || r['ឈ្មោះ'] || "").trim();
    if (rawName) {
        let found = studentList.find(s => String(s.name).trim() === rawName);
        if (found) return found;
    }
    return null;
}

function normalizeStatus(statusRaw) {
    if (!statusRaw) return "";
    const v = String(statusRaw).trim();
    if (v === "ច្បាប់" || v === "មានច្បាប់" || v === "ច" || v === "ច្ប" || v.toUpperCase() === "C") return "ច្ប";
    if (v === "ឥតច្បាប់" || v === "អត់ច្បាប់" || v === "អ" || v === "អច្ប" || v.toUpperCase() === "A") return "អច្ប";
    if (v === "ឈឺ" || v === "ឈឺមានច្បាប់" || v === "ឈ" || v.toUpperCase() === "S") return "ឈ";
    if (v === "ឈប់សម្រាក" || v === "សម្រាក" || v === "៖" || v === ":") return "៖";
    if (v === "វត្តមាន" || v.toUpperCase() === "P" || v === "វ") return "";
    return v;
}

// =====================================================================
// មុខងារទាញទិន្នន័យអវត្តមាន
// =====================================================================
window.getStudentAttendance = function(studentId, monthName = null) {
    let permission = 0, unexcused = 0, sick = 0, found = false;
    const targetId = String(studentId).trim();
    const attData = window.monthlyAttendanceData || monthlyAttendanceData;

    if (attData && attData[targetId]) {
        found = true;
        Object.values(attData[targetId]).forEach(val => {
            if (!val) return;
            const v = String(val).trim().toUpperCase();
            if (v === "ច" || v === "ច្ប" || v === "C") permission++;
            else if (v === "អ" || v === "អច្ប" || v === "A") unexcused++;
            else if (v === "ឈ" || v === "S") sick++;
        });
    }

    return {
        permission: permission + sick,
        permissionOnly: permission,
        sick: sick,
        unexcused: unexcused,
        total: permission + sick + unexcused,
        hasData: found
    };
};

// =====================================================================
// ១. Layout មេ (Main Layout)
// =====================================================================
window.loadAttendanceView = async function(defaultGrade = "ថ្នាក់ទី ២ «ខ»") {
    const container = document.getElementById("attendanceContainer") || document.getElementById("attendanceView") || document.getElementById("mainContentArea");
    if (!container) return;

    const currentYear = new Date().getFullYear();
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const academicYear = sInfo.academic_year || `${currentYear}-${currentYear + 1}`;

    let gradesOptions = "";
    for (let i = 1; i <= 12; i++) {
        let khGrade = window.toKhmerNum(i.toString());
        gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}" ${i === 2 ? 'selected' : ''}>ថ្នាក់ទី ${khGrade}</option>`;
    }

    container.className = "p-3 md:p-6 transition duration-300 h-full w-full flex flex-col min-h-0 bg-slate-50";
    container.innerHTML = `
      <style>
        .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
        .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      </style>

      <div class="animate-fade-in h-full w-full flex flex-col min-h-0 font-siemreap max-w-[1680px] mx-auto space-y-3.5">
        
        <!-- ក្បាលទំព័រ និងការកំណត់ -->
        <div class="bg-white p-4 md:p-5 rounded-[1.8rem] shadow-xs border border-slate-100 shrink-0 relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-4 no-print transition-all">
          <div class="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-rose-500 to-orange-500"></div>
          
          <div class="flex items-center gap-4 ml-1 w-full xl:w-auto relative z-10">
              <div class="w-12 h-12 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl shadow-xs border border-rose-100">
                <i class="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                  <h2 class="text-lg md:text-2xl font-black text-slate-800 font-moul">បញ្ជីវត្តមាន និងស្ថិតិអវត្តមាន</h2>
                  <p class="text-xs text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 inline-flex flex-wrap items-center gap-2 mt-1">
                      <span class="text-blue-600 flex items-center gap-1"><i class="fa-solid fa-circle text-[7px]"></i> ច្បាប់ (ច្ប)</span>
                      <span class="text-slate-300">|</span>
                      <span class="text-rose-600 flex items-center gap-1"><i class="fa-solid fa-circle text-[7px]"></i> ឥតច្បាប់ (អច្ប)</span>
                      <span class="text-slate-300">|</span>
                      <span class="text-purple-600 flex items-center gap-1"><i class="fa-solid fa-circle text-[7px]"></i> ឈឺ (ឈ)</span>
                      <span class="text-slate-300">|</span>
                      <span class="text-amber-600 flex items-center gap-1"><i class="fa-solid fa-circle text-[7px]"></i> សម្រាក (៖)</span>
                  </p>
              </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2.5 w-full xl:w-auto relative z-10">
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><i class="fa-solid fa-magnifying-glass text-xs"></i></span>
                <input type="text" id="attSearch" oninput="window.filterAttendanceTable()" placeholder="ស្វែងរកឈ្មោះសិស្ស..." 
                       class="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-rose-400 focus:bg-white outline-none w-36 sm:w-48 bg-slate-50 transition shadow-2xs font-siemreap">
              </div>

              <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <i class="fa-solid fa-layer-group text-slate-400 text-xs"></i>
                <select id="attLevelSelect" onchange="window.fetchMonthlyAttendance()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer font-siemreap">
                  ${gradesOptions}
                </select>
                <span class="text-slate-300">|</span>
                <select id="attRoomSelect" onchange="window.fetchMonthlyAttendance()" class="border-none bg-transparent text-xs font-bold text-amber-700 outline-none cursor-pointer font-siemreap">
                  <option value="«ក»" selected>«ក»</option>
                  <option value="«ខ»">«ខ»</option>
                  <option value="«គ»">«គ»</option>
                  <option value="«ឃ»">«ឃ»</option>
                </select>
              </div>
              
              <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <i class="fa-solid fa-calendar-days text-slate-400 text-xs"></i>
                <select id="attMonthSelect" onchange="window.fetchMonthlyAttendance()" class="border-none bg-transparent text-xs font-bold text-rose-700 outline-none cursor-pointer font-siemreap">
                  ${KHMER_MONTHS.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
                <span class="text-slate-300">|</span>
                <select id="attYearSelect" onchange="window.fetchMonthlyAttendance()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer font-mono">
                  <option value="${currentYear - 1}">${currentYear - 1}</option>
                  <option value="${currentYear}" selected>${currentYear}</option>
                  <option value="${currentYear + 1}">${currentYear + 1}</option>
                  <option value="${currentYear + 2}">${currentYear + 2}</option>
                </select>
              </div>
          </div>
        </div>

        <!-- ២. កាតស្ថិតិសង្ខេបស្វ័យប្រវត្តិតាមរូបមន្តក្រសួង -->
        <div id="attendanceKpiSummaryContainer" class="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-6 gap-3 no-print"></div>

        <!-- របារឧបករណ៍បញ្ជា (Action Toolbar) -->
        <div class="flex flex-wrap items-center justify-between gap-2.5 shrink-0 no-print bg-white p-3 px-4 rounded-2xl border border-slate-100 shadow-2xs">
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="window.openDailyAttendanceModal()" class="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition flex items-center gap-2 transform hover:-translate-y-0.5">
              <i class="fa-solid fa-calendar-day text-sm"></i> កត់វត្តមាន (Pop-Up)
            </button>

            <button onclick="window.openHolidayManagerModal()" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 transition flex items-center gap-2 transform hover:-translate-y-0.5">
              <i class="fa-solid fa-calendar-xmark text-sm"></i> កំណត់ថ្ងៃឈប់
            </button>

            <button onclick="window.fetchMonthlyAttendance()" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs" title="ទាញទិន្នន័យពី Google Sheet ឡើងវិញ">
              <i class="fa-solid fa-arrows-rotate text-slate-500"></i> ទាញទិន្នន័យ
            </button>

            <button onclick="window.clearAttendance()" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
              <i class="fa-solid fa-eraser text-slate-400"></i> សម្អាត
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- ប៊ូតុងរបាយការណ៍ប្រចាំឆ្នាំថ្មី -->
            <button onclick="openAnnualReportModal()" class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
              <i class="fa-solid fa-file-contract text-indigo-600"></i> របាយការណ៍ប្រចាំឆ្នាំ
            </button>

            <button onclick="window.exportAttendanceToExcel()" class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
              <i class="fa-solid fa-file-excel text-emerald-600"></i> Export
            </button>
            <button onclick="window.printOfficialAttendance()" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5">
              <i class="fa-solid fa-print"></i> បោះពុម្ពបញ្ជី
            </button>
            <button type="button" id="btnSaveAttendance" onclick="window.saveMonthlyAttendance()"
                    class="px-5 py-2 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-rose-200 transition flex items-center gap-2">
              <i class="fa-solid fa-floppy-disk"></i> រក្សាទុក
            </button>
          </div>
        </div>

        <!-- ផ្ទៃតារាងវត្តមាន -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden flex-1 flex flex-col min-h-0 print:border-none print:shadow-none w-full" id="attendanceWebArea">
          
          <div class="flex justify-between items-center py-3 px-5 no-print shrink-0 border-b border-slate-100 bg-slate-50/70">
              <h3 class="text-sm font-bold text-slate-700 flex items-center gap-2 font-moul">
                 <i class="fa-solid fa-list-check text-rose-500"></i>
                 បញ្ជីវត្តមានប្រចាំខែ <span id="lblMonthTitle" class="text-rose-600">មករា</span>
              </h3>
              <p class="text-xs font-bold text-slate-500">
                ថ្នាក់ទី <span id="attHeaderGrade" class="text-indigo-700 mx-1 font-moul bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">${defaultGrade}</span> 
                | ឆ្នាំសិក្សា <span id="lblAcademicYearTitle" class="ml-1 font-mono">${window.toKhmerNum(academicYear)}</span>
              </p>
          </div>

          <div class="overflow-auto w-full flex-1 min-h-0 custom-scrollbar print:overflow-visible relative bg-white pb-6">
              <table class="w-max min-w-full border-collapse border border-slate-300 print:border-black text-[12px] text-center bg-white relative font-siemreap" id="mainAttendanceTable" style="table-layout: fixed;">
                <thead class="sticky top-0 z-30 shadow-2xs text-[12px]">
                  <tr id="trKhmerDays" class="bg-slate-100 text-slate-700 border-b border-slate-300 print:border-black font-moul h-[38px]">
                  </tr>
                  <tr id="trDayNumbers" class="bg-slate-50 text-slate-700 border-b border-slate-300 print:border-black font-bold h-[32px]">
                  </tr>
                </thead>
                <tbody id="attendanceTableRows" class="divide-y divide-slate-200 print:divide-black text-slate-800 print:text-black">
                  <tr><td colspan="42" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-rose-400"></i><br>កំពុងទាញយកទិន្នន័យពី Google Sheet...</td></tr>
                </tbody>
                <tfoot id="attendanceTableFoot" class="bg-slate-100 font-bold border-t-2 border-slate-300 print:border-black text-slate-800 sticky bottom-0 z-30">
                </tfoot>
              </table>
          </div>
        </div>

      </div>

      <!-- ផ្ទាំង Pop-up (Modal) របាយការណ៍ប្រចាំឆ្នាំ លាក់ទុកសិន (hidden) -->
      <div id="annualReportModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex justify-center items-center transition-opacity p-4 font-siemreap">
          <div class="bg-white rounded-[1.5rem] shadow-xl w-full max-w-sm p-6 transform scale-100 transition-transform">
              
              <!-- ក្បាល Pop-up -->
              <div class="border-b border-slate-100 pb-3 mb-5 flex justify-between items-center">
                  <h3 class="text-sm font-bold text-indigo-800 flex items-center gap-2 font-moul">
                      <i class="fa-solid fa-file-contract text-indigo-500 text-lg"></i>
                      បោះពុម្ពរបាយការណ៍ប្រចាំឆ្នាំ
                  </h3>
                  <button onclick="closeAnnualReportModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
                      <i class="fa-solid fa-xmark"></i>
                  </button>
              </div>
              
              <!-- តួ Pop-up (ទម្រង់ជ្រើសរើស) -->
              <div class="mb-6 space-y-3">
                  <div>
                      <label class="block text-xs font-bold text-slate-600 mb-1.5">ជ្រើសរើសឆ្នាំសិក្សា ៖</label>
                      <select id="annualYearSelect" class="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-bold text-slate-700 bg-slate-50">
                          <option value="២០២៥-២០២៦">២០២៥-២០២៦</option>
                          <option value="២០២៦-២០២៧" selected>២០២៦-២០២៧</option>
                          <option value="២០២៧-២០២៨">២០២៧-២០២៨</option>
                          <option value="២០២៨-២០២៩">២០២៨-២០២៩</option>
                          <option value="២០៣០-២០៣១">២០៣០-២០៣១</option>
                      </select>
                  </div>
                  <div class="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex gap-2 text-xs text-blue-700">
                      <i class="fa-solid fa-circle-info mt-0.5"></i>
                      <p>ទិន្នន័យអវត្តមានទាំង១០ខែ នឹងត្រូវទាញយកមកបូកសរុប និងបង្កើតជារបាយការណ៍ A4 Landscape ដោយស្វ័យប្រវត្តិ។</p>
                  </div>
              </div>
              
              <!-- ប៊ូតុងបញ្ជាខាងក្រោម (Footer) -->
              <div class="flex justify-end gap-2.5">
                  <button onclick="closeAnnualReportModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition">
                      បោះបង់
                  </button>
                  <button onclick="handlePrintAnnualAction()" class="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-indigo-200">
                      <i class="fa-solid fa-print"></i> បោះពុម្ពរបាយការណ៍
                  </button>
              </div>
              
          </div>
      </div>
    `;

    const levelSelect = document.getElementById("attLevelSelect");
    const roomSelect = document.getElementById("attRoomSelect");
    if (defaultGrade && levelSelect && roomSelect) {
        const gradeNumMatch = defaultGrade.match(/ថ្នាក់ទី\s*([០-៩\d]+)/);
        const roomMatch = defaultGrade.match(/«.*?»/);
        if (gradeNumMatch && gradeNumMatch) {
            const khmerGradeToFind = "ថ្នាក់ទី " + window.toKhmerNum(gradeNumMatch);
            Array.from(levelSelect.options).forEach(opt => {
                if (opt.value.trim() === khmerGradeToFind.trim()) opt.selected = true;
            });
        }
        if (roomMatch) {
            Array.from(roomSelect.options).forEach(opt => {
                if (opt.value.trim() === roomMatch[0].trim()) opt.selected = true;
            });
        }
    }

    const currentMonthIdx = new Date().getMonth();
    const attMonthSelect = document.getElementById("attMonthSelect");
    if (attMonthSelect) {
        Array.from(attMonthSelect.options).forEach(opt => {
            if (opt.value === KHMER_MONTHS[currentMonthIdx]) opt.selected = true;
        });
    }

    await window.fetchMonthlyAttendance();
    window.setupAttExcelLikeNavigation();
};

// =====================================================================
// ២. មុខងារទាញទិន្នន័យពី Google Sheet
// =====================================================================
window.fetchMonthlyAttendance = async function() {
    const btn = document.getElementById("btnSaveAttendance");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> កំពុងទាញយក...`;
    }
    
    const month = document.getElementById("attMonthSelect").value;
    const year = parseInt(document.getElementById("attYearSelect").value);
    const levelVal = document.getElementById("attLevelSelect").value.trim();
    const roomVal = document.getElementById("attRoomSelect").value.trim();
    const fullGradeName = `${levelVal} ${roomVal}`;

    document.getElementById("attHeaderGrade").textContent = fullGradeName.replace("ថ្នាក់ទី", "").trim();
    document.getElementById("lblMonthTitle").textContent = month;

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    // ផ្ទុកថ្ងៃឈប់សម្រាកដែលបានរក្សាទុក
    try {
        const savedHolidays = JSON.parse(localStorage.getItem(`att_holidays_${fullGradeName}_${month}_${year}`) || '{}');
        window.monthlyHolidays = savedHolidays;
    } catch(e) {
        window.monthlyHolidays = {};
    }

    window.renderCalendarHeaders(year, monthNum, daysInMonth);

    const tbody = document.getElementById("attendanceTableRows");
    tbody.innerHTML = `<tr><td colspan="42" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-rose-400"></i><br>កំពុងទាញយកទិន្នន័យពី Google Sheet...</td></tr>`;

    try {
        let studentsRes = null;
        let attRes = null;

        // ១. ទាញបញ្ជីសិស្ស
        if (typeof apiGet === "function") {
            try {
                studentsRes = await apiGet("getStudents", { status: "Active" });
            } catch(e) {
                console.warn("apiGet getStudents failed:", e);
            }

            // ២. ទាញទិន្នន័យវត្តមានពី Google Sheet
            try {
                attRes = await apiGet("getAttendance", { grade: fullGradeName, month: month, year: year });
            } catch(e) {}

            const hasValidData = (r) => (Array.isArray(r) && r.length > 0) || (r && Array.isArray(r.data) && r.data.length > 0) || (r && Array.isArray(r.records) && r.records.length > 0);

            if (!hasValidData(attRes)) {
                try { attRes = await apiGet("getAttendance", { grade: fullGradeName, month: month }); } catch(e) {}
            }
            if (!hasValidData(attRes)) {
                try { attRes = await apiGet("getAttendance", { grade: fullGradeName }); } catch(e) {}
            }
            if (!hasValidData(attRes)) {
                try { attRes = await apiGet("getAttendance"); } catch(e) {}
            }
        }

        let allStus = (studentsRes && studentsRes.data && studentsRes.data.length > 0) 
            ? studentsRes.data 
            : (Array.isArray(studentsRes) && studentsRes.length > 0 ? studentsRes : (JSON.parse(localStorage.getItem('academic_students')) || []));

        let cleanLevel = levelVal.replace(/\s+/g, '');
        let cleanRoom = roomVal.replace(/[«»\s]/g, '');
        let expectedFull = cleanLevel + cleanRoom;

        attendanceStudents = allStus.filter(s => {
            if (s.status === "Dropped") return false;
            let sGrade = String(s.grade || "").replace(/\s+/g, '');
            let sRoom = String(s.room || "").replace(/[«»\s]/g, '');
            let fullGradeDB = String(s.grade || "").replace(/\s+/g, '');
            return (sGrade === cleanLevel && sRoom === cleanRoom) || 
                   (fullGradeDB === expectedFull) || 
                   (fullGradeDB.includes(cleanLevel) && fullGradeDB.includes(cleanRoom)) ||
                   (sGrade === cleanLevel && !sRoom);
        });

        if (attendanceStudents.length === 0 && allStus.length === 0) {
            attendanceStudents = Array.from({ length: 15 }, (_, i) => ({
                id: "STU-" + String(i + 1).padStart(3, '0'),
                name: "សិស្សសាកល្បង " + (i + 1),
                gender: i % 2 === 0 ? "ប្រុស" : "ស្រី",
                grade: levelVal,
                room: roomVal
            }));
        }

        attendanceStudents.sort((a, b) => String(a.name || "").trim().localeCompare(String(b.name || "").trim(), "km"));

        // ស្រង់កំណត់ត្រាវត្តមានចេញពី Response
        let allRecords = [];
        if (Array.isArray(attRes)) allRecords = attRes;
        else if (attRes && Array.isArray(attRes.data)) allRecords = attRes.data;
        else if (attRes && Array.isArray(attRes.records)) allRecords = attRes.records;
        else if (attRes && Array.isArray(attRes.rows)) allRecords = attRes.rows;

        monthlyAttendanceData = {};

        // ផ្ទុកទិន្នន័យពី Cache ជាមុន
        try {
            const cached = JSON.parse(localStorage.getItem(`att_${fullGradeName}_${month}_${year}`) || '{}');
            monthlyAttendanceData = { ...cached };
        } catch(e) {}

        // បញ្ចូលទិន្នន័យពី Google Sheet ចូលក្នុង Memory
        let fetchedCount = 0;
        allRecords.forEach(r => {
            if (r.grade) {
                const cleanRGrade = String(r.grade).replace(/[«»\s]/g, '');
                const cleanTargetGrade = fullGradeName.replace(/[«»\s]/g, '');
                if (!cleanRGrade.includes(cleanLevel) && cleanRGrade !== cleanTargetGrade) return;
            }

            if (!isRecordInMonth(r, month, monthNum, year)) return;

            const day = parseDayNumber(r.date || r.day);
            if (!day || day < 1 || day > daysInMonth) return;

            const stu = findMatchingStudent(r, attendanceStudents);
            const stuId = stu ? stu.id : String(r.student_id || r.studentId || r.id || "").trim();

            if (stuId) {
                if (!monthlyAttendanceData[stuId]) monthlyAttendanceData[stuId] = {};
                monthlyAttendanceData[stuId][day] = normalizeStatus(r.status || r.attendance || r['ស្ថានភាព']);
                fetchedCount++;
            }
        });

        // អនុវត្តថ្ងៃឈប់សម្រាកដោយមិនជាន់លើវត្តមានពិតប្រាកដ
        Object.keys(window.monthlyHolidays).forEach(dayKey => {
            const d = parseInt(dayKey, 10);
            if (d >= 1 && d <= daysInMonth) {
                attendanceStudents.forEach(s => {
                    if (!monthlyAttendanceData[s.id]) monthlyAttendanceData[s.id] = {};
                    if (!monthlyAttendanceData[s.id][d]) {
                        monthlyAttendanceData[s.id][d] = "៖";
                    }
                });
            }
        });

        // រក្សាទុក Cache
        try {
            localStorage.setItem(`att_${fullGradeName}_${month}_${year}`, JSON.stringify(monthlyAttendanceData));
            localStorage.setItem('academic_monthly_attendance', JSON.stringify(monthlyAttendanceData));
        } catch(e) {}

        window.monthlyAttendanceData = monthlyAttendanceData;
        window.renderAttendanceRows(daysInMonth);

        if (fetchedCount > 0 && typeof showToast === 'function') {
            showToast(`✅ ទាញបានទិន្នន័យវត្តមាន ${window.toKhmerNum(fetchedCount.toString())} ពី Google Sheet!`);
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="42" class="p-12 text-center text-rose-500 font-bold bg-rose-50"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><br>បរាជ័យក្នុងការទាញយកទិន្នន័យពី Google Sheet</td></tr>`;
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> រក្សាទុក`;
        }
    }
};

window.renderCalendarHeaders = function(year, monthNum, daysInMonth) {
    const trKhmer = document.getElementById("trKhmerDays");
    const trNums = document.getElementById("trDayNumbers");
    if (!trKhmer || !trNums) return;

    let khmerDaysHtml = `
      <th rowspan="2" class="border-r border-slate-300 print:border-black p-1 sticky left-0 z-20 bg-slate-100" style="width: 40px; min-width: 40px; max-width: 40px;">ល.រ</th>
      <th rowspan="2" class="border-r border-slate-300 print:border-black p-1 sticky left-[40px] z-20 bg-slate-100 hidden md:table-cell" style="width: 75px; min-width: 75px; max-width: 75px;">អត្តលេខ</th>
      <th rowspan="2" class="border-r border-slate-300 print:border-black text-left px-3 sticky md:left-[115px] left-[40px] z-20 bg-slate-100" style="width: 195px; min-width: 195px; max-width: 195px;">គោត្តនាម និងនាម</th>
      <th rowspan="2" class="border-r border-slate-300 print:border-black p-1 bg-slate-50" style="width: 42px; min-width: 42px; max-width: 42px;">ភេទ</th>
    `;
    let numDaysHtml = "";

    for (let d = 1; d <= 31; d++) {
        let dayName = "-";
        let isSunday = false;

        if (d <= daysInMonth) {
            const dateObj = new Date(year, monthNum - 1, d);
            dayName = KHMER_DAYS[dateObj.getDay()];
            isSunday = dateObj.getDay() === 0;
        }

        const isHoliday = !!window.monthlyHolidays[d];
        const hInfo = window.monthlyHolidays[d] || {};
        
        let headerClass = 'bg-slate-100 text-slate-600';
        let numClass = 'bg-white text-slate-700';

        if (isSunday) {
            headerClass = 'text-rose-600 bg-rose-100/80';
            numClass = 'text-rose-600 bg-rose-50';
        } else if (isHoliday) {
            headerClass = 'text-amber-800 bg-amber-200';
            numClass = 'text-amber-900 bg-amber-100 font-black';
        }

        const tooltipTitle = isHoliday 
            ? `ថ្ងៃឈប់សម្រាក ៖ ${hInfo.title || 'បុណ្យ/ប្រជុំ'}` 
            : (isSunday ? 'ថ្ងៃអាទិត្យ' : `ថ្ងៃទី ${d} - ចុចដើម្បីកត់វត្តមាន`);
        
        khmerDaysHtml += `<th class="border-r border-slate-300 print:border-black font-bold cursor-pointer hover:opacity-80 transition ${headerClass}" onclick="window.openDailyAttendanceModal(${d})" title="${tooltipTitle}" style="width: 35px; min-width: 35px; max-width: 35px;">${dayName}</th>`;
        numDaysHtml += `<th class="border-r border-slate-300 print:border-black font-mono text-xs cursor-pointer hover:opacity-80 transition ${numClass}" onclick="window.openDailyAttendanceModal(${d})" title="${tooltipTitle}" style="width: 35px; min-width: 35px; max-width: 35px;">
          ${d <= daysInMonth ? d : '-'}
          ${isHoliday ? '<span class="inline-block w-1.5 h-1.5 bg-amber-600 rounded-full ml-0.5 no-print"></span>' : ''}
        </th>`;
    }

    khmerDaysHtml += `
      <th colspan="4" class="border-r border-slate-300 print:border-black bg-blue-100 text-blue-900" style="width: 150px; min-width: 150px; max-width: 150px;">ចំនួនអវត្តមាន</th>
      <th rowspan="2" class="p-1 bg-slate-50" style="width: 85px; min-width: 85px; max-width: 85px;">ផ្សេងៗ</th>
    `;
    numDaysHtml += `
      <th class="border-r border-slate-300 print:border-black bg-blue-50 text-blue-800" title="មានច្បាប់ (ច្ប)" style="width: 36px; min-width: 36px; max-width: 36px;">ច្ប</th>
      <th class="border-r border-slate-300 print:border-black bg-rose-50 text-rose-800" title="អត់ច្បាប់ (អច្ប)" style="width: 36px; min-width: 36px; max-width: 36px;">អច្ប</th>
      <th class="border-r border-slate-300 print:border-black bg-purple-50 text-purple-800" title="ឈឺមានច្បាប់ (ឈ)" style="width: 36px; min-width: 36px; max-width: 36px;">ឈ</th>
      <th class="border-r border-slate-300 print:border-black bg-amber-100 text-amber-900" style="width: 42px; min-width: 42px; max-width: 42px;">សរុប</th>
    `;

    trKhmer.innerHTML = khmerDaysHtml;
    trNums.innerHTML = numDaysHtml;
};

window.renderAttendanceRows = function(daysInMonth) {
    const tbody = document.getElementById("attendanceTableRows");
    if (!tbody) return;
    
    if (attendanceStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="42" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-folder-open text-4xl mb-3 text-slate-200"></i><br>មិនទាន់មានសិស្សក្នុងថ្នាក់នេះនៅឡើយទេ</td></tr>`;
        return;
    }

    const year = parseInt(document.getElementById("attYearSelect").value);
    const monthIdx = document.getElementById("attMonthSelect").selectedIndex;

    tbody.innerHTML = attendanceStudents.map((s, idx) => {
        const genderShort = s.gender === "ស្រី" ? "ស" : "ប";
        const genderColor = s.gender === "ស្រី" ? "text-rose-600 bg-rose-50/40" : "text-blue-700 bg-blue-50/40";
        const studentData = monthlyAttendanceData[s.id] || {};

        let dayInputs = "";
        for (let d = 1; d <= 31; d++) {
            if (d <= daysInMonth) {
                let val = studentData[d] || "";
                if (val === "ច្បាប់" || val === "ច") val = "ច្ប";
                else if (val === "ឥតច្បាប់" || val === "អ") val = "អច្ប";
                else if (val === "ឈឺ") val = "ឈ";
                else if (val === "ឈប់សម្រាក") val = "៖";

                const dateObj = new Date(year, monthIdx, d);
                const isSunday = dateObj.getDay() === 0;
                const isHoliday = !!window.monthlyHolidays[d];

                let bgCellClass = "bg-white";
                if (isSunday) bgCellClass = "bg-rose-50/30";
                if (isHoliday) bgCellClass = "bg-amber-100/40";

                dayInputs += `
                  <td class="border-r border-slate-300 print:border-black p-0 relative ${bgCellClass} hover:bg-amber-50 transition-colors" style="width: 35px; min-width: 35px; max-width: 35px;">
                    <input type="text" maxlength="4" id="att_${s.id}_${d}" value="${val}" data-row="${idx}" data-col="${d}"
                           oninput="window.handleAttInput(this, '${s.id}', ${daysInMonth})" 
                           class="att-input w-full h-[34px] text-center text-xs font-bold border-0 focus:ring-inset focus:ring-2 focus:ring-rose-400 outline-none bg-transparent uppercase ${window.getColorClass(val)} cursor-text transition-all">
                  </td>
                `;
            } else {
                dayInputs += `<td class="border-r border-slate-300 print:border-black bg-slate-100/40" style="width: 35px; min-width: 35px; max-width: 35px;"></td>`;
            }
        }

        return `
          <tr class="hover:bg-indigo-50/30 transition-colors border-b border-slate-200 print:border-black h-[34px] bg-white group">
            <td class="border-r border-slate-300 print:border-black text-center font-bold sticky left-0 z-10 bg-white group-hover:bg-indigo-50 font-mono text-xs text-slate-500" style="width: 40px; min-width: 40px; max-width: 40px;">${idx + 1}</td>
            <td class="border-r border-slate-300 print:border-black text-center font-mono text-[11px] font-bold text-indigo-400 hidden md:table-cell sticky left-[40px] z-10 bg-white group-hover:bg-indigo-50" style="width: 75px; min-width: 75px; max-width: 75px;">${s.id}</td>
            <td class="border-r border-slate-300 print:border-black px-3 text-left font-bold text-slate-800 sticky md:left-[115px] left-[40px] z-10 bg-white group-hover:bg-indigo-50 font-moul text-xs truncate" style="width: 195px; min-width: 195px; max-width: 195px;" title="${s.name}">${s.name}</td>
            <td class="border-r border-slate-300 print:border-black text-center font-bold ${genderColor} font-siemreap text-xs" style="width: 42px; min-width: 42px; max-width: 42px;">${genderShort}</td>
            
            ${dayInputs}

            <td class="border-r border-slate-300 print:border-black text-center font-mono font-bold text-blue-700 bg-blue-50/70 text-xs" style="width: 36px; min-width: 36px; max-width: 36px;" id="perm_${s.id}">0</td>
            <td class="border-r border-slate-300 print:border-black text-center font-mono font-bold text-rose-700 bg-rose-50/70 text-xs" style="width: 36px; min-width: 36px; max-width: 36px;" id="unex_${s.id}">0</td>
            <td class="border-r border-slate-300 print:border-black text-center font-mono font-bold text-purple-700 bg-purple-50/70 text-xs" style="width: 36px; min-width: 36px; max-width: 36px;" id="sick_${s.id}">0</td>
            <td class="border-r border-slate-300 print:border-black text-center font-mono font-black text-amber-900 bg-amber-100/70 text-xs" style="width: 42px; min-width: 42px; max-width: 42px;" id="tot_${s.id}">0</td>
            <td class="p-0 bg-white" style="width: 85px; min-width: 85px; max-width: 85px;"><input type="text" id="note_${s.id}" class="w-full h-[34px] text-[11px] border-0 bg-transparent px-2 outline-none text-slate-500 focus:bg-white font-siemreap"></td>
          </tr>
        `;
    }).join("");

    window.calculateAllAttendance(); 
};

window.getColorClass = function(val) {
    const v = String(val || "").trim().toUpperCase();
    if (v === "ច" || v === "ច្ប" || v === "C") return "text-blue-600 font-black bg-blue-100/80";
    if (v === "អ" || v === "អច្ប" || v === "A") return "text-rose-600 font-black bg-rose-100/80";
    if (v === "ឈ" || v === "S") return "text-purple-600 font-black bg-purple-100/80";
    if (v === "៖" || v === ":") return "text-amber-600 font-black bg-amber-100/80";
    return "text-slate-800 font-bold";
};

window.handleAttInput = function(inputEl, studentId, daysInMonth) {
    let cleanVal = inputEl.value.trim();
    if (cleanVal === "ច") cleanVal = "ច្ប";
    else if (cleanVal === "អ") cleanVal = "អច្ប";

    inputEl.className = `att-input w-full h-[34px] text-center text-xs font-bold border-0 focus:ring-inset focus:ring-2 focus:ring-rose-400 outline-none bg-transparent uppercase ${window.getColorClass(cleanVal)} transition-all cursor-text`;
    
    const col = parseInt(inputEl.getAttribute('data-col'));
    if (!monthlyAttendanceData[studentId]) monthlyAttendanceData[studentId] = {};
    monthlyAttendanceData[studentId][col] = cleanVal;
    window.monthlyAttendanceData = monthlyAttendanceData;

    window.calculateStudentAbsence(studentId, daysInMonth);
    window.calculateDailyTotals(daysInMonth);
    window.calculateMoEYSSummary();
};

window.calculateStudentAbsence = function(studentId, daysInMonth) {
    let permission = 0, unexcused = 0, sick = 0;
    for (let d = 1; d <= daysInMonth; d++) {
        const val = (document.getElementById(`att_${studentId}_${d}`)?.value || monthlyAttendanceData[studentId]?.[d] || "").trim().toUpperCase();
        if (val === "ច" || val === "ច្ប" || val === "C") permission++;
        else if (val === "អ" || val === "អច្ប" || val === "A") unexcused++;
        else if (val === "ឈ" || val === "S") sick++;
    }

    const permEl = document.getElementById(`perm_${studentId}`);
    const unexEl = document.getElementById(`unex_${studentId}`);
    const sickEl = document.getElementById(`sick_${studentId}`);
    const totEl = document.getElementById(`tot_${studentId}`);

    if (permEl) permEl.textContent = permission;
    if (unexEl) unexEl.textContent = unexcused;
    if (sickEl) sickEl.textContent = sick;
    if (totEl) totEl.textContent = (permission + unexcused + sick);
};

window.calculateDailyTotals = function(daysInMonth) {
    let dailyTotalsHtml = `
      <tr class="h-[36px] text-center bg-slate-50 font-siemreap">
        <td colspan="4" class="border-r border-slate-300 print:border-black px-4 text-right font-bold text-slate-600 sticky left-0 z-10 bg-slate-50 text-xs">សរុបអវត្តមានប្រចាំថ្ងៃ</td>`;
    
    let grandTotalPerm = 0, grandTotalUnex = 0, grandTotalSick = 0;

    for (let d = 1; d <= 31; d++) {
        if (d <= daysInMonth) {
            let dayAbsentCount = 0;
            attendanceStudents.forEach(s => {
                const val = (document.getElementById(`att_${s.id}_${d}`)?.value || monthlyAttendanceData[s.id]?.[d] || "").trim().toUpperCase();
                if (val === "ច" || val === "ច្ប" || val === "អ" || val === "អច្ប" || val === "ឈ" || val === "C" || val === "A" || val === "S") {
                    dayAbsentCount++;
                }
            });
            dailyTotalsHtml += `<td class="border-r border-slate-300 print:border-black font-mono text-xs ${dayAbsentCount > 0 ? 'text-rose-600 font-black bg-rose-50' : 'text-slate-300'}">${dayAbsentCount || ''}</td>`;
        } else {
            dailyTotalsHtml += `<td class="border-r border-slate-300 print:border-black bg-slate-100/50"></td>`;
        }
    }

    attendanceStudents.forEach(s => {
        grandTotalPerm += parseInt(document.getElementById(`perm_${s.id}`)?.textContent) || 0;
        grandTotalUnex += parseInt(document.getElementById(`unex_${s.id}`)?.textContent) || 0;
        grandTotalSick += parseInt(document.getElementById(`sick_${s.id}`)?.textContent) || 0;
    });

    const grandTotalAbsence = grandTotalPerm + grandTotalUnex + grandTotalSick;

    dailyTotalsHtml += `
        <td class="border-r border-slate-300 print:border-black font-mono font-bold text-blue-800 bg-blue-100 text-xs">${grandTotalPerm}</td>
        <td class="border-r border-slate-300 print:border-black font-mono font-bold text-rose-800 bg-rose-100 text-xs">${grandTotalUnex}</td>
        <td class="border-r border-slate-300 print:border-black font-mono font-bold text-purple-800 bg-purple-100 text-xs">${grandTotalSick}</td>
        <td class="border-r border-slate-300 print:border-black font-mono font-black text-amber-900 bg-amber-200 text-xs">${grandTotalAbsence}</td>
        <td class="bg-slate-50"></td>
      </tr>`;

    const foot = document.getElementById("attendanceTableFoot");
    if (foot) foot.innerHTML = dailyTotalsHtml;
};

// =====================================================================
// ៣. រូបមន្តគណនាស្ថិតិអវត្តមានប្រចាំខែ (MoEYS Official Mathematical Logic)
// =====================================================================
window.calculateMoEYSSummary = function() {
    const studentRows = document.querySelectorAll("#mainAttendanceTable tbody tr");
    const totalStudents = studentRows.length;
    let femaleStudents = 0;
    
    let grandPerm = 0;
    let grandUnex = 0; 
    let grandSick = 0; 
    
    studentRows.forEach(row => {
        const gender = row.cells[3]?.innerText.trim() || ""; // កែពី cells[2] ទៅ cells[3] តាម column index ពិតប្រាកដ
        if (gender === "ស" || gender === "ស្រី" || gender === "F") femaleStudents++;
        
        const inputs = row.querySelectorAll("input.att-input");
        inputs.forEach(input => {
            const val = input.value.trim().toUpperCase();
            if (val === "ច្ប" || val === "ច" || val === "C") grandPerm++;
            if (val === "អច្ប" || val === "អ" || val === "A") grandUnex++;
            if (val === "ឈ" || val === "S") grandSick++;
        });
    });

    const totalAbsentSessions = grandPerm + grandUnex + grandSick;

    const daysInMonth = parseInt(document.getElementById("attDaysInMonth")?.value || 
       new Date(parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear()), 
                document.getElementById("attMonthSelect")?.selectedIndex + 1 || 1, 0).getDate());
    
    let offDaysCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
        if (window.monthlyHolidays[d]) offDaysCount++;
        else {
             const y = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
             const m = document.getElementById("attMonthSelect")?.selectedIndex || 0;
             if (new Date(y, m, d).getDay() === 0) offDaysCount++;
        }
    }
    
    const actualSchoolDays = daysInMonth - offDaysCount; 
    const totalSessionsRequired = actualSchoolDays * totalStudents;
    const actualAttendedSessions = totalSessionsRequired - totalAbsentSessions;

    let absencePercentage = 0;
    if (totalSessionsRequired > 0) {
        absencePercentage = (totalAbsentSessions * 100) / totalSessionsRequired;
    }

    let attendancePercentage = 100 - absencePercentage;

    const summaryData = {
        totalStudents,
        femaleStudents,
        grandPerm,
        grandUnex,
        grandSick,
        totalAbsentSessions,
        actualSchoolDays,
        offDaysCount,
        totalSessionsRequired,
        actualAttendedSessions,
        absencePercentage: absencePercentage.toFixed(2),
        attendancePercentage: attendancePercentage.toFixed(2)
    };
    window.renderKpiSummaryCards(summaryData);
    return summaryData;
};

window.renderKpiSummaryCards = function(d) {
    const el = document.getElementById("attendanceKpiSummaryContainer");
    if (!el) return;

    el.innerHTML = `
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
         <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
           <i class="fa-solid fa-users"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-500 font-bold">សិស្សសរុប</div>
            <div class="text-sm font-black text-slate-800 font-mono">
              ${window.toKhmerNum(d.totalStudents.toString())} <span class="text-xs font-normal text-slate-400 font-siemreap">(ស្រី ${window.toKhmerNum(d.femaleStudents.toString())})</span>
            </div>
         </div>
      </div>

      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
         <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold">
           <i class="fa-solid fa-calendar-days"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-500 font-bold">ថ្ងៃរៀនពិតប្រាកដ</div>
            <div class="text-sm font-black text-indigo-700 font-mono">
              ${window.toKhmerNum(d.actualSchoolDays.toString())} <span class="text-xs font-normal text-slate-400 font-siemreap">ថ្ងៃ (ឈប់ ${window.toKhmerNum(d.offDaysCount.toString())})</span>
            </div>
         </div>
      </div>

      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
         <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">
           <i class="fa-solid fa-clock"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-500 font-bold">ពេលត្រូវមករៀន</div>
            <div class="text-sm font-black text-amber-800 font-mono">
              ${window.toKhmerNum(d.totalSessionsRequired.toString())} <span class="text-xs font-normal text-slate-400 font-siemreap">ពេល</span>
            </div>
         </div>
      </div>

      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
         <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold">
           <i class="fa-solid fa-user-xmark"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-500 font-bold">អវត្តមានសរុប</div>
            <div class="text-sm font-black text-rose-600 font-mono">
              ${window.toKhmerNum(d.totalAbsentSessions.toString())} <span class="text-xs font-normal text-slate-400 font-siemreap">(ឈឺ ${window.toKhmerNum(d.grandSick.toString())})</span>
            </div>
         </div>
      </div>

      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
         <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
           <i class="fa-solid fa-user-check"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-500 font-bold">ពេលរៀនជាក់ស្តែង</div>
            <div class="text-sm font-black text-emerald-600 font-mono">
              ${window.toKhmerNum(d.actualAttendedSessions.toString())} <span class="text-xs font-normal text-slate-400 font-siemreap">ពេល</span>
            </div>
         </div>
      </div>

      <div class="bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-3">
         <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base font-bold shadow-xs">
           %
         </div>
         <div>
            <div class="text-[11px] text-emerald-800 font-bold">អត្រាវត្តមាន</div>
            <div class="text-sm font-black text-emerald-700 font-mono">
              ${window.toKhmerNum(d.attendancePercentage)}% <span class="text-[10px] text-rose-600 font-bold">(${window.toKhmerNum(d.absencePercentage)}% អវត្តមាន)</span>
            </div>
         </div>
      </div>
    `;
};

window.calculateAllAttendance = function() {
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    attendanceStudents.forEach(s => window.calculateStudentAbsence(s.id, daysInMonth));
    window.calculateDailyTotals(daysInMonth);
    window.calculateMoEYSSummary();
};

// =====================================================================
// ៤. ផ្ទាំង Pop-Up កំណត់ថ្ងៃឈប់សម្រាក ថ្ងៃបុណ្យ និងថ្ងៃប្រជុំ (Holiday Manager)
// =====================================================================
window.openHolidayManagerModal = function() {
    let modal = document.getElementById("holidayManagerModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "holidayManagerModal";
        modal.className = "fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-2 sm:p-4 no-print";
        document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    window.renderHolidayModalContent();
};

window.renderHolidayModalContent = function() {
    const modal = document.getElementById("holidayManagerModal");
    if (!modal) return;

    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const levelVal = document.getElementById("attLevelSelect")?.value || "ថ្នាក់ទី ២";
    const roomVal = document.getElementById("attRoomSelect")?.value || "«ខ»";

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    let thursdayCount = 0;
    let fourthThursdayDay = null;
    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, monthNum - 1, d);
        if (dObj.getDay() === 4) { 
            thursdayCount++;
            if (thursdayCount === 4) fourthThursdayDay = d;
        }
    }

    let dayItemsHtml = "";
    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, monthNum - 1, d);
        const dayOfWeek = KHMER_DAYS[dObj.getDay()];
        const isSunday = dObj.getDay() === 0;
        const is4thThu = (d === fourthThursdayDay);
        
        const isOff = !!window.monthlyHolidays[d];
        const hInfo = window.monthlyHolidays[d] || {};

        let badgeType = isSunday ? 'ថ្ងៃអាទិត្យ' : (is4thThu ? 'ព្រហស្បតិ៍ទី៤' : '');
        let bgStyle = isOff ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200';

        dayItemsHtml += `
          <div class="p-3 rounded-2xl border ${bgStyle} transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs">
             <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                   <span class="w-8 h-8 rounded-xl ${isSunday?'bg-rose-100 text-rose-700':(isOff?'bg-amber-500 text-white':'bg-slate-100 text-slate-700')} font-mono font-bold flex items-center justify-center text-xs">
                     ${d}
                   </span>
                   <div>
                     <span class="font-bold text-xs ${isSunday?'text-rose-600':'text-slate-800'}">${dayOfWeek}</span>
                     ${badgeType ? `<span class="text-[10px] text-amber-700 font-bold ml-1">(${badgeType})</span>` : ''}
                   </div>
                </div>

                <label class="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" ${isOff ? 'checked' : ''} onchange="window.toggleHolidayDay(${d}, this.checked)" class="sr-only peer">
                   <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
             </div>

             <div class="${isOff ? 'block' : 'hidden'} space-y-1.5 pt-2 border-t border-amber-200/60 text-xs">
                <select onchange="window.setHolidayType(${d}, this.value)" class="w-full bg-white border border-amber-200 rounded-lg p-1 text-[11px] font-bold text-slate-700 outline-none">
                  <option value="holiday" ${hInfo.type==='holiday'?'selected':''}>🎉 ថ្ងៃបុណ្យ (Holiday)</option>
                  <option value="meeting" ${hInfo.type==='meeting'?'selected':''}>🏛️ ថ្ងៃប្រជុំ (Meeting)</option>
                  <option value="thursday4" ${hInfo.type==='thursday4'?'selected':''}>📅 ព្រហស្បតិ៍សប្តាហ៍ទី៤</option>
                  <option value="teacher_absent" ${hInfo.type==='teacher_absent'?'selected':''}>👨‍🏫 គ្រូអវត្តមាន</option>
                  <option value="sunday" ${hInfo.type==='sunday'?'selected':''}>☀️ ថ្ងៃអាទិត្យ</option>
                  <option value="other" ${hInfo.type==='other'?'selected':''}>📌 ផ្សេងៗ</option>
                </select>

                <input type="text" placeholder="មូលហេតុ..." value="${hInfo.title || ''}" 
                       oninput="window.setHolidayTitle(${d}, this.value)"
                       class="w-full bg-white border border-amber-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none placeholder:text-slate-400">
             </div>
          </div>
        `;
    }

    const totalSetHolidays = Object.keys(window.monthlyHolidays).length;

    modal.innerHTML = `
      <div class="w-full max-w-4xl bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-scale-up font-siemreap">
        
        <div class="p-4 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-2xs">
               <i class="fa-solid fa-calendar-xmark"></i>
             </div>
             <div>
                <h3 class="text-sm md:text-base font-moul text-slate-800">កំណត់ថ្ងៃឈប់សម្រាក ថ្ងៃបុណ្យ និងថ្ងៃប្រជុំ</h3>
                <p class="text-xs text-slate-500 font-bold mt-0.5">
                  ${levelVal} ${roomVal} | ខែ${month} ឆ្នាំ${year} (កំណត់បាន ៖ ${window.toKhmerNum(totalSetHolidays.toString())} ថ្ងៃ)
                </p>
             </div>
          </div>

          <button onclick="document.getElementById('holidayManagerModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="bg-amber-50/70 px-6 py-3 border-b border-amber-200/70 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div class="flex items-center gap-2">
             <span class="font-bold text-amber-900 flex items-center gap-1.5">
               <i class="fa-solid fa-wand-magic-sparkles text-amber-600"></i> បំពេញស្វ័យប្រវត្តិ ៖
             </span>
             <button onclick="window.autoSetAllSundays()" class="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold transition shadow-2xs">
               ☀️ ថ្ងៃអាទិត្យទាំងអស់
             </button>
             ${fourthThursdayDay ? `
               <button onclick="window.autoSet4thThursday(${fourthThursdayDay})" class="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold transition shadow-2xs">
                 📅 ថ្ងៃព្រហស្បតិ៍សប្តាហ៍ទី៤ (ថ្ងៃទី ${fourthThursdayDay})
               </button>
             ` : ''}
          </div>

          <button onclick="window.clearAllHolidays()" class="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold transition">
            <i class="fa-solid fa-trash-can text-[10px]"></i> សម្អាតថ្ងៃឈប់ទាំងអស់
          </button>
        </div>

        <div class="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
           ${dayItemsHtml}
        </div>

        <div class="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div class="text-xs text-slate-500">
             ថ្ងៃឈប់សម្រាកសរុប ៖ <b class="text-amber-600 font-mono text-sm">${window.toKhmerNum(totalSetHolidays.toString())}</b> ថ្ងៃ
          </div>

          <button onclick="window.applyAndSaveHolidays()" class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-amber-200 transition flex items-center gap-2">
            <i class="fa-solid fa-floppy-disk"></i> រក្សាទុក និងអនុវត្ត
          </button>
        </div>

      </div>
    `;
};

window.toggleHolidayDay = function(day, isChecked) {
    if (isChecked) {
        const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
        const month = document.getElementById("attMonthSelect")?.value || "មករា";
        const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
        const dObj = new Date(year, (monthMap[month] || 1) - 1, day);
        const isSunday = dObj.getDay() === 0;

        window.monthlyHolidays[day] = {
            type: isSunday ? 'sunday' : 'holiday',
            title: isSunday ? 'ថ្ងៃអាទិត្យ' : 'ថ្ងៃឈប់សម្រាក'
        };
    } else {
        delete window.monthlyHolidays[day];
    }
    window.renderHolidayModalContent();
};

window.setHolidayType = function(day, typeVal) {
    if (!window.monthlyHolidays[day]) window.monthlyHolidays[day] = {};
    window.monthlyHolidays[day].type = typeVal;
    if (typeVal === 'sunday' && !window.monthlyHolidays[day].title) window.monthlyHolidays[day].title = 'ថ្ងៃអាទិត្យ';
    if (typeVal === 'thursday4' && !window.monthlyHolidays[day].title) window.monthlyHolidays[day].title = 'ប្រជុំបច្ចេកទេសព្រហស្បតិ៍សប្តាហ៍ទី៤';
    if (typeVal === 'meeting' && !window.monthlyHolidays[day].title) window.monthlyHolidays[day].title = 'ថ្ងៃប្រជុំ';
};

window.setHolidayTitle = function(day, titleVal) {
    if (!window.monthlyHolidays[day]) window.monthlyHolidays[day] = { type: 'holiday' };
    window.monthlyHolidays[day].title = titleVal;
};

window.autoSetAllSundays = function() {
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, monthNum - 1, d);
        if (dObj.getDay() === 0) {
            window.monthlyHolidays[d] = {
                type: 'sunday',
                title: 'ថ្ងៃអាទិត្យ'
            };
        }
    }
    window.renderHolidayModalContent();
    if (typeof showToast === 'function') showToast("☀️ បានកំណត់ថ្ងៃអាទិត្យទាំងអស់!");
};

window.autoSet4thThursday = function(dayNumber) {
    window.monthlyHolidays[dayNumber] = {
        type: 'thursday4',
        title: 'ប្រជុំបច្ចេកទេសព្រហស្បតិ៍សប្តាហ៍ទី៤'
    };
    window.renderHolidayModalContent();
    if (typeof showToast === 'function') showToast(`📅 បានកំណត់ថ្ងៃព្រហស្បតិ៍សប្តាហ៍ទី៤ (ថ្ងៃទី ${dayNumber})!`);
};

window.clearAllHolidays = function() {
    if (!confirm("តើអ្នកពិតជាចង់សម្អាតថ្ងៃឈប់សម្រាកទាំងអស់មែនទេ?")) return;
    window.monthlyHolidays = {};
    window.renderHolidayModalContent();
};

window.applyAndSaveHolidays = function() {
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const levelVal = document.getElementById("attLevelSelect")?.value || "ថ្នាក់ទី ២";
    const roomVal = document.getElementById("attRoomSelect")?.value || "«ខ»";
    const fullGradeName = `${levelVal} ${roomVal}`;

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    try {
        localStorage.setItem(`att_holidays_${fullGradeName}_${month}_${year}`, JSON.stringify(window.monthlyHolidays));
    } catch(e) {}

    Object.keys(window.monthlyHolidays).forEach(dayKey => {
        const d = parseInt(dayKey, 10);
        if (d >= 1 && d <= daysInMonth) {
            attendanceStudents.forEach(s => {
                if (!monthlyAttendanceData[s.id]) monthlyAttendanceData[s.id] = {};
                if (!monthlyAttendanceData[s.id][d]) {
                    monthlyAttendanceData[s.id][d] = "៖";
                    const cellInput = document.getElementById(`att_${s.id}_${d}`);
                    if (cellInput) {
                        cellInput.value = "៖";
                        cellInput.className = `att-input w-full h-[34px] text-center text-xs font-bold border-0 focus:ring-inset focus:ring-2 focus:ring-rose-400 outline-none bg-transparent uppercase ${window.getColorClass("៖")} transition-all cursor-text`;
                    }
                }
            });
        }
    });

    window.monthlyAttendanceData = monthlyAttendanceData;
    window.renderCalendarHeaders(year, monthMap[month] || 1, daysInMonth);
    window.calculateAllAttendance();

    document.getElementById("holidayManagerModal")?.classList.add("hidden");
    if (typeof showToast === 'function') showToast("✅ បានរក្សាទុក និងអនុវត្តថ្ងៃឈប់សម្រាកបានជោគជ័យ!");
    else alert("✅ បានរក្សាទុក និងអនុវត្តថ្ងៃឈប់សម្រាកបានជោគជ័យ!");
};

// =====================================================================
// ៥. ផ្ទាំង Pop-Up កត់វត្តមានប្រចាំថ្ងៃ (Daily Attendance Modal)
// =====================================================================
window.currentDailyAttendanceDay = new Date().getDate();
window.dailyModalSearchQuery = "";
window.dailyModalStatusFilter = "all";

window.openDailyAttendanceModal = function(selectedDay = null) {
    if (!attendanceStudents || attendanceStudents.length === 0) {
        alert("សូមជ្រើសរើសថ្នាក់ ឬទាញយកបញ្ជីវត្តមានជាមុនសិន!");
        return;
    }

    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    if (selectedDay !== null && selectedDay >= 1 && selectedDay <= daysInMonth) {
        window.currentDailyAttendanceDay = selectedDay;
    } else {
        const today = new Date().getDate();
        window.currentDailyAttendanceDay = today <= daysInMonth ? today : 1;
    }

    let modal = document.getElementById("dailyAttendanceModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "dailyAttendanceModal";
        modal.className = "fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-2 sm:p-4 no-print";
        document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    window.renderDailyModalContent();
};

window.renderDailyModalContent = function() {
    const modal = document.getElementById("dailyAttendanceModal");
    if (!modal) return;

    const targetDay = window.currentDailyAttendanceDay;
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const levelVal = document.getElementById("attLevelSelect")?.value || "ថ្នាក់ទី ២";
    const roomVal = document.getElementById("attRoomSelect")?.value || "«ខ»";

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const dateObj = new Date(year, monthNum - 1, targetDay);
    const dayOfWeek = KHMER_DAYS[dateObj.getDay()];
    const isSunday = dateObj.getDay() === 0;

    const isHoliday = !!window.monthlyHolidays[targetDay];
    const hInfo = window.monthlyHolidays[targetDay] || {};

    let countPresent = 0, countPerm = 0, countUnex = 0, countSick = 0, countHoliday = 0;
    attendanceStudents.forEach(s => {
        const val = (document.getElementById(`att_${s.id}_${targetDay}`)?.value || monthlyAttendanceData[s.id]?.[targetDay] || "").trim().toUpperCase();
        if (val === "ច" || val === "ច្ប" || val === "C") countPerm++;
        else if (val === "អ" || val === "អច្ប" || val === "A") countUnex++;
        else if (val === "ឈ" || val === "S") countSick++;
        else if (val === "៖" || val === ":") countHoliday++;
        else countPresent++;
    });

    let dayOptions = "";
    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, monthNum - 1, d);
        const dKh = KHMER_DAYS[dObj.getDay()];
        const hLabel = window.monthlyHolidays[d] ? ` - ឈប់` : '';
        dayOptions += `<option value="${d}" ${d === targetDay ? 'selected' : ''}>ថ្ងៃទី ${window.toKhmerNum(d.toString())} (${dKh}${hLabel})</option>`;
    }

    let filteredStudents = attendanceStudents.filter(s => {
        const matchName = !window.dailyModalSearchQuery || s.name.toLowerCase().includes(window.dailyModalSearchQuery) || String(s.id).includes(window.dailyModalSearchQuery);
        const val = (document.getElementById(`att_${s.id}_${targetDay}`)?.value || monthlyAttendanceData[s.id]?.[targetDay] || "").trim().toUpperCase();
        
        let matchStatus = true;
        if (window.dailyModalStatusFilter === "present") matchStatus = (!val || val === "វ");
        else if (window.dailyModalStatusFilter === "perm") matchStatus = (val === "ច" || val === "ច្ប" || val === "C");
        else if (window.dailyModalStatusFilter === "unex") matchStatus = (val === "អ" || val === "អច្ប" || val === "A");
        else if (window.dailyModalStatusFilter === "sick") matchStatus = (val === "ឈ" || val === "S");
        else if (window.dailyModalStatusFilter === "holiday") matchStatus = (val === "៖" || val === ":");

        return matchName && matchStatus;
    });

    const studentCardsHtml = filteredStudents.map((stu, i) => {
        const val = (document.getElementById(`att_${stu.id}_${targetDay}`)?.value || monthlyAttendanceData[stu.id]?.[targetDay] || "").trim().toUpperCase();

        const isPresent = !val || val === "វ";
        const isPerm = val === "ច" || val === "ច្ប" || val === "C";
        const isUnex = val === "អ" || val === "អច្ប" || val === "A";
        const isSick = val === "ឈ" || val === "S";
        const isHolidayStatus = val === "៖" || val === ":";

        return `
          <div class="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition shadow-2xs">
             <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-500">
                 ${i + 1}
               </div>
               <div>
                  <div class="font-moul text-xs text-slate-800 leading-tight">${stu.name}</div>
                  <div class="text-[11px] text-slate-400 font-siemreap mt-0.5">
                    ភេទ ៖ <span class="${stu.gender==='ស្រី'?'text-rose-600 font-bold':'text-blue-600 font-bold'}">${stu.gender||'ប្រុស'}</span> | ID: <span class="font-mono">${stu.id}</span>
                  </div>
               </div>
             </div>

             <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold font-siemreap">
                <button onclick="window.setDailyStatus('${stu.id}', '')" 
                        class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${isPresent ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'}">
                  <i class="fa-solid fa-check text-[11px]"></i> វត្តមាន
                </button>
                <button onclick="window.setDailyStatus('${stu.id}', 'ច្ប')" 
                        class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${isPerm ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-blue-700'}">
                  ច្បាប់
                </button>
                <button onclick="window.setDailyStatus('${stu.id}', 'អច្ប')" 
                        class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${isUnex ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'}">
                  អត់ច្បាប់
                </button>
                <button onclick="window.setDailyStatus('${stu.id}', 'ឈ')" 
                        class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${isSick ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-purple-700'}">
                  ឈឺ
                </button>
                <button onclick="window.setDailyStatus('${stu.id}', '៖')" 
                        class="px-2 py-1 rounded-lg transition flex items-center gap-1 ${isHolidayStatus ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-amber-700'}">
                  សម្រាក
                </button>
             </div>
          </div>
        `;
    }).join("");

    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-scale-up font-siemreap">
        
        <div class="p-4 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg shadow-2xs">
               <i class="fa-solid fa-calendar-day"></i>
             </div>
             <div>
                <h3 class="text-sm md:text-base font-moul text-slate-800">កត់វត្តមានប្រចាំថ្ងៃ</h3>
                <p class="text-xs text-slate-500 font-bold mt-0.5">
                  ${levelVal} ${roomVal} | ខែ${month} ឆ្នាំ${year}
                </p>
             </div>
          </div>

          <div class="flex items-center gap-2">
            <select onchange="window.switchDailyModalDay(this.value)" class="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-xl outline-none cursor-pointer">
              ${dayOptions}
            </select>
            <button onclick="document.getElementById('dailyAttendanceModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div class="bg-white px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div class="flex items-center gap-2">
             <span class="px-2.5 py-1 rounded-lg font-bold ${isSunday?'bg-rose-50 text-rose-700 border border-rose-200':(isHoliday?'bg-amber-100 text-amber-900 border border-amber-300':'bg-indigo-50 text-indigo-700 border border-indigo-200')}">
               ${dayOfWeek} ទី ${window.toKhmerNum(targetDay.toString())}
               ${isHoliday ? `(${hInfo.title || 'ថ្ងៃឈប់សម្រាក'})` : ''}
             </span>
             <span class="text-slate-400">|</span>
             <span class="text-emerald-700 font-bold">វត្តមាន ៖ ${window.toKhmerNum(countPresent.toString())}</span>
             <span class="text-blue-700 font-bold">ច្បាប់ ៖ ${window.toKhmerNum(countPerm.toString())}</span>
             <span class="text-rose-700 font-bold">អត់ច្បាប់ ៖ ${window.toKhmerNum(countUnex.toString())}</span>
             <span class="text-purple-700 font-bold">ឈឺ ៖ ${window.toKhmerNum(countSick.toString())}</span>
          </div>

          <div class="flex items-center gap-1.5">
             <button onclick="window.markAllDailyPresent()" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold transition">
               <i class="fa-solid fa-check-double text-[10px]"></i> វត្តមានទាំងអស់
             </button>
             <button onclick="window.markAllDailyHoliday()" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold transition">
               <i class="fa-solid fa-mug-hot text-[10px]"></i> សម្រាកទាំងអស់
             </button>
          </div>
        </div>

        <div class="p-3 px-6 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div class="relative flex-1 min-w-[180px]">
             <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
             <input type="text" placeholder="ស្វែងរកឈ្មោះក្នុងបញ្ជី..." value="${window.dailyModalSearchQuery}"
                    oninput="window.filterDailyModalStudents(this.value, window.dailyModalStatusFilter)"
                    class="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-rose-400">
          </div>

          <div class="flex items-center gap-1 text-[11px] font-bold">
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'all')" 
                     class="px-2 py-1 rounded-lg ${window.dailyModalStatusFilter==='all'?'bg-slate-800 text-white':'bg-white text-slate-600 border border-slate-200'}">ទាំងអស់</button>
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'present')" 
                     class="px-2 py-1 rounded-lg ${window.dailyModalStatusFilter==='present'?'bg-emerald-600 text-white':'bg-white text-slate-600 border border-slate-200'}">វត្តមាន</button>
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'perm')" 
                     class="px-2 py-1 rounded-lg ${window.dailyModalStatusFilter==='perm'?'bg-blue-600 text-white':'bg-white text-slate-600 border border-slate-200'}">ច្បាប់</button>
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'unex')" 
                     class="px-2 py-1 rounded-lg ${window.dailyModalStatusFilter==='unex'?'bg-rose-600 text-white':'bg-white text-slate-600 border border-slate-200'}">អត់ច្បាប់</button>
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'sick')" 
                     class="px-2 py-1 rounded-lg ${window.dailyModalStatusFilter==='sick'?'bg-purple-600 text-white':'bg-white text-slate-600 border border-slate-200'}">ឈឺ</button>
          </div>
        </div>

        <div class="p-4 px-6 overflow-y-auto flex-1 custom-scrollbar space-y-2">
           ${filteredStudents.length > 0 ? studentCardsHtml : '<div class="p-8 text-center text-slate-400 font-bold">រកមិនឃើញសិស្សតាមលក្ខខណ្ឌនេះទេ!</div>'}
        </div>

        <div class="p-3.5 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
             <button onclick="window.prevDailyModalDay()" ${targetDay <= 1 ? 'disabled class="opacity-40 cursor-not-allowed"' : ''} 
                     class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition">
               <i class="fa-solid fa-arrow-left"></i> ថ្ងៃមុន
             </button>
             <button onclick="window.nextDailyModalDay()" ${targetDay >= daysInMonth ? 'disabled class="opacity-40 cursor-not-allowed"' : ''} 
                     class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition">
               ថ្ងៃបន្ទាប់ <i class="fa-solid fa-arrow-right"></i>
             </button>
          </div>

          <button onclick="window.closeDailyModalAndSave()" class="px-5 py-2 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-rose-200 transition flex items-center gap-1.5">
            <i class="fa-solid fa-circle-check"></i> រួចរាល់ & រក្សាទុក
          </button>
        </div>

      </div>
    `;
};

window.switchDailyModalDay = function(dayStr) {
    window.currentDailyAttendanceDay = parseInt(dayStr);
    window.renderDailyModalContent();
};

window.prevDailyModalDay = function() {
    if (window.currentDailyAttendanceDay > 1) {
        window.currentDailyAttendanceDay--;
        window.renderDailyModalContent();
    }
};

window.nextDailyModalDay = function() {
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    if (window.currentDailyAttendanceDay < daysInMonth) {
        window.currentDailyAttendanceDay++;
        window.renderDailyModalContent();
    }
};

window.setDailyStatus = function(studentId, statusVal) {
    const targetDay = window.currentDailyAttendanceDay;
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    if (!monthlyAttendanceData[studentId]) monthlyAttendanceData[studentId] = {};
    monthlyAttendanceData[studentId][targetDay] = statusVal;
    window.monthlyAttendanceData = monthlyAttendanceData;

    const cellInput = document.getElementById(`att_${studentId}_${targetDay}`);
    if (cellInput) {
        cellInput.value = statusVal;
        cellInput.className = `att-input w-full h-[34px] text-center text-xs font-bold border-0 focus:ring-inset focus:ring-2 focus:ring-rose-400 outline-none bg-transparent uppercase ${window.getColorClass(statusVal)} transition-all cursor-text`;
    }

    window.calculateStudentAbsence(studentId, daysInMonth);
    window.calculateDailyTotals(daysInMonth);
    window.calculateMoEYSSummary();
    window.renderDailyModalContent();
};

window.markAllDailyPresent = function() {
    attendanceStudents.forEach(s => window.setDailyStatus(s.id, ''));
    if (typeof showToast === 'function') showToast("✅ បានកំណត់វត្តមានពេញលេញសម្រាប់ថ្ងៃនេះ!");
};

window.markAllDailyHoliday = function() {
    attendanceStudents.forEach(s => window.setDailyStatus(s.id, '៖'));
    if (typeof showToast === 'function') showToast("☕ បានកំណត់ជាថ្ងៃឈប់សម្រាក!");
};

window.filterDailyModalStudents = function(query, statusFilter) {
    window.dailyModalSearchQuery = query.toLowerCase();
    window.dailyModalStatusFilter = statusFilter;
    window.renderDailyModalContent();
};

window.closeDailyModalAndSave = function() {
    document.getElementById("dailyAttendanceModal")?.classList.add("hidden");
    window.saveMonthlyAttendance();
};

// =====================================================================
// ៦. រក្សាទុកទិន្នន័យ (Save Batch to API & LocalStorage)
// =====================================================================
window.saveMonthlyAttendance = async function() {
    const btn = document.getElementById("btnSaveAttendance");
    const month = document.getElementById("attMonthSelect").value;
    const year = document.getElementById("attYearSelect").value;
    const grade = `${document.getElementById("attLevelSelect").value} ${document.getElementById("attRoomSelect").value}`;
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> កំពុងរក្សាទុក...`;
    }

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const batchPayload = [];

    attendanceStudents.forEach(s => {
        for (let d = 1; d <= daysInMonth; d++) {
            const val = (document.getElementById(`att_${s.id}_${d}`)?.value || monthlyAttendanceData[s.id]?.[d] || "").trim().toUpperCase();
            if (val) {
                let statusText = "វត្តមាន";
                if (val === "ច" || val === "ច្ប" || val === "C") statusText = "ច្បាប់";
                else if (val === "អ" || val === "អច្ប" || val === "A") statusText = "ឥតច្បាប់";
                else if (val === "ឈ" || val === "S") statusText = "ឈឺ";
                else if (val === "៖" || val === ":") statusText = "ឈប់សម្រាក";

                batchPayload.push({
                    student_id: s.id,
                    student_name: s.name,
                    date: `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                    month: month,
                    grade: grade,
                    status: statusText
                });
            }
        }
    });

    try {
        localStorage.setItem(`att_${grade}_${month}_${year}`, JSON.stringify(monthlyAttendanceData));
        localStorage.setItem('academic_monthly_attendance', JSON.stringify(monthlyAttendanceData));
        localStorage.setItem(`att_holidays_${grade}_${month}_${year}`, JSON.stringify(window.monthlyHolidays));
    } catch(e) {}

    try {
        if (typeof apiPost === 'function') {
            const res = await apiPost("saveAttendanceBatch", { data: batchPayload });
            if (res && res.status === "success") {
                if (typeof showToast === 'function') showToast("✅ រក្សាទុកវត្តមានទៅ Google Sheet បានជោគជ័យ!");
            } else {
                if (typeof showToast === 'function') showToast("✅ រក្សាទុកទិន្នន័យបានជោគជ័យ!");
            }
        } else {
            if (typeof showToast === 'function') showToast("✅ រក្សាទុកវត្តមានក្នុងម៉ាស៊ីន (Offline)!");
        }
    } catch (err) {
        if (typeof showToast === 'function') showToast("✅ រក្សាទុកទិន្នន័យបណ្តោះអាសន្ន (Offline)!");
    } finally {
        setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> រក្សាទុក`;
            }
        }, 600);
    }
};

window.clearAttendance = function() {
    if (!confirm("តើអ្នកពិតជាចង់សម្អាតវត្តមានទាំងអស់នៅលើតារាងនេះមែនទេ?")) return;
    const inputs = document.querySelectorAll("#attendanceTableRows input.att-input");
    inputs.forEach(el => {
        el.value = '';
        el.className = `att-input w-full h-[34px] text-center text-xs font-bold border-0 outline-none bg-transparent uppercase text-slate-700 cursor-text transition-all`;
    });
    monthlyAttendanceData = {};
    window.monthlyAttendanceData = {};
    window.calculateAllAttendance();
};

window.setupAttExcelLikeNavigation = function() {
    const area = document.getElementById("attendanceWebArea");
    if (!area) return;
    area.addEventListener('keydown', function(e) {
        if (!e.target.classList.contains('att-input')) return;
        let r = parseInt(e.target.getAttribute('data-row'));
        let c = parseInt(e.target.getAttribute('data-col'));
        if (isNaN(r) || isNaN(c)) return;

        let nextInput = null;
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault(); nextInput = document.querySelector(`.att-input[data-row='${r+1}'][data-col='${c}']`);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); nextInput = document.querySelector(`.att-input[data-row='${r-1}'][data-col='${c}']`);
        } else if (e.key === 'ArrowRight') {
            nextInput = document.querySelector(`.att-input[data-row='${r}'][data-col='${c+1}']`);
        } else if (e.key === 'ArrowLeft') {
            nextInput = document.querySelector(`.att-input[data-row='${r}'][data-col='${c-1}']`);
        }
        if (nextInput) { nextInput.focus(); nextInput.select(); }
    });
};

window.filterAttendanceTable = function() {
    const search = document.getElementById("attSearch")?.value.toLowerCase() || "";
    const rows = document.querySelectorAll("#attendanceTableRows tr");
    rows.forEach(row => {
        if (row.children.length > 2) {
            const name = (row.children[2]?.textContent || "").toLowerCase();
            const id = (row.children[1]?.textContent || "").toLowerCase();
            row.style.display = (name.includes(search) || id.includes(search)) ? "" : "none";
        }
    });
};

// =====================================================================
// ៧. បោះពុម្ពបញ្ជីវត្តមាន និងតារាងសង្ខេបស្ថិតិផ្លូវការ A4 Landscape
// =====================================================================
window.printOfficialAttendance = function() {
    const tableContent = document.getElementById("mainAttendanceTable");
    if (!tableContent) { 
        alert("⚠️ រកមិនឃើញតារាងវត្តមានដើម្បីបោះពុម្ពទេ!"); 
        return; 
    }

    const summary = window.calculateMoEYSSummary();

    const clonedTable = tableContent.cloneNode(true);
    
    const origInputs = tableContent.querySelectorAll("input.att-input");
    const cloneInputs = clonedTable.querySelectorAll("input.att-input");
    
    cloneInputs.forEach((cloneInput, idx) => {
        const orig = origInputs[idx];
        const val = orig ? orig.value.trim() : "";
        const td = cloneInput.parentElement;
        if (val !== "") {
            let color = "#000";
            if (val === "ច" || val === "ច្ប" || val === "C") color = "#2563eb"; // ខៀវ
            else if (val === "អ" || val === "អច្ប" || val === "A") color = "#e11d48"; // ក្រហម
            else if (val === "ឈ" || val === "S") color = "#9333ea"; // ស្វាយ
            else if (val === "៖" || val === ":") color = "#d97706"; // ទឹកក្រូច
            td.innerHTML = `<span style="color: ${color}; font-weight: bold; font-size: 11px;">${val}</span>`;
        } else {
            td.innerHTML = "";
        }
    });

    const origNotes = tableContent.querySelectorAll("input[id^='note_']");
    const cloneNotes = clonedTable.querySelectorAll("input[id^='note_']");
    cloneNotes.forEach((cloneNote, idx) => {
        const orig = origNotes[idx];
        const val = orig ? orig.value.trim() : "";
        const td = cloneNote.parentElement;
        td.innerHTML = `<span style="font-size: 10px; color: #334155;">${val}</span>`;
    });

    const allEls = clonedTable.querySelectorAll('*');
    allEls.forEach(el => {
        el.className = (el.className || "")
            .replace(/sticky/g, "")
            .replace(/left-\[?[^\]\s]+\]?/g, "")
            .replace(/z-\d+/g, "")
            .replace(/shadow-[^"'\s]*/g, "");
        el.style.position = "static";
        el.style.left = "auto";
        el.style.minWidth = "";
        el.style.width = "";
        el.style.maxWidth = "";
    });

    const existingColgroup = clonedTable.querySelector("colgroup");
    if (existingColgroup) existingColgroup.remove();

    let colGroupHtml = `
      <colgroup>
        <col style="width: 3.5%;">
        <col style="width: 6.5%;">
        <col style="width: 17.5%;">
        <col style="width: 3.5%;">
    `;
    for (let i = 0; i < 31; i++) {
        colGroupHtml += `<col style="width: 1.9%;">`;
    }
    colGroupHtml += `
        <col style="width: 2.7%;">
        <col style="width: 2.7%;">
        <col style="width: 2.7%;">
        <col style="width: 3.2%;">
        <col style="width: 4.8%;">
      </colgroup>
    `;
    clonedTable.insertAdjacentHTML('afterbegin', colGroupHtml);

    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const grade = `${document.getElementById("attLevelSelect")?.value || ''} ${document.getElementById("attRoomSelect")?.value || ''}`;
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    
    const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ធំ";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = sInfo.teacher_name || ".......................";
    const academicYear = sInfo.academic_year || "2026-2027";
    
    const totalStudents = summary.totalStudents || 0;
    const femaleStudents = summary.femaleStudents || 0;
    const maleStudents = totalStudents - femaleStudents;

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>បញ្ជីវត្តមានប្រចាំខែ${month} - ${grade}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
          @page { size: A4 landscape; margin: 8mm 9mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; font-family: 'Siemreap', sans-serif; color: #0f172a; background: #fff; line-height: 1.3; }
          .font-moul { font-family: 'Moul', serif; font-weight: normal; }
          
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
          .header-left p { margin: 0 0 3px 0; font-size: 11px; font-family: 'Moul', serif; color: #334155; }
          .header-left .school-name { color: #1e3a8a; font-size: 13px; text-shadow: 0.5px 0.5px 0px #cbd5e1; }
          .header-left .class-name { color: #be123c; font-size: 11.5px; }
          .header-right { text-align: center; }
          .header-right p { margin: 0 0 3px 0; font-size: 12px; font-family: 'Moul', serif; color: #1e3a8a; }
          .header-right .motto { color: #b91c1c; font-size: 11px; }
          
          .title-box { text-align: center; margin: 5px 0 10px 0; }
          .title-box h2 { margin: 0 0 5px 0; font-size: 16px; color: #be123c; letter-spacing: 1px; }
          
          .sub-header-bar { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 6px; padding: 5px 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; color: #0f172a; }
          .sub-header-bar .highlight { color: #be123c; font-family: 'Moul', serif; }
          .sub-header-bar .count { color: #047857; }
          
          table { width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 10px; table-layout: fixed; border: 1.5px solid #0f172a; }
          th, td { border: 1px solid #475569; padding: 2px 0px; height: 26px; font-size: 10px; overflow: hidden; white-space: nowrap; }
          th { background-color: #dbeafe; color: #1e3a8a; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8fafc; }
          td:nth-child(3) { text-align: left; padding-left: 5px; font-size: 10px; font-weight: bold; color: #0f172a; }
          
          .summary-container { background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 5px; padding: 6px 10px; margin-bottom: 8px; }
          .summary-row-inline { display: flex; justify-content: space-between; font-size: 11px; line-height: 1.8; }
          .summary-row-inline span { margin-right: 15px; color: #334155; }
          .summary-row-inline b { font-size: 12px; }
          .text-green { color: #15803d; }
          .text-red { color: #be123c; }
          .text-blue { color: #1d4ed8; }
          
          .end-list-note { font-size: 11px; color: #64748b; font-style: italic; margin-left: 5px; }

          .footer-box { display: flex; justify-content: space-between; align-items: flex-start; font-size: 11px; margin-top: 15px; padding: 0 40px; page-break-inside: avoid; }
          .footer-col-left { text-align: center; font-family: 'Moul', serif; line-height: 1.6; color: #1e3a8a; }
          .footer-col-right { text-align: center; line-height: 1.6; color: #334155; }
          .footer-col-right .role { font-family: 'Moul', serif; margin-top: 5px; color: #1e3a8a; }
          .signature-name { font-family: 'Moul', serif; font-size: 12px; color: #be123c; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-left">
            <p>ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាល${districtName}</p>
            <p class="school-name">${schoolName}</p>
            <p class="class-name">ថ្នាក់ទី ${grade}</p>
          </div>
          <div class="header-right">
            <p>ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p class="motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          </div>
        </div>

        <div class="title-box">
          <h2 class="font-moul">បញ្ជីហៅឈ្មោះសិស្ស</h2>
        </div>

        <div class="sub-header-bar">
          <div>ផ្នែកអវត្តមានសិស្ស</div>
          <div>ខែ <span class="highlight">${month}</span></div>
          <div>ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</div>
          <div>ប្រុស <span class="count">${window.toKhmerNum(maleStudents.toString())}</span> នាក់</div>
          <div>ស្រី <span class="count">${window.toKhmerNum(femaleStudents.toString())}</span> នាក់</div>
          <div>សរុប <span class="count">${window.toKhmerNum(totalStudents.toString())}</span> នាក់</div>
        </div>

        ${clonedTable.outerHTML}

        <!-- ផ្នែកខាងក្រោមតារាង (Summary) -->
        <div class="summary-container">
          <div class="summary-row-inline">
            <span>ចំនួនសិស្សក្នុងបញ្ជី: <b class="text-blue">${window.toKhmerNum(totalStudents.toString())}</b> នាក់</span>
            <span>ស្រី: <b class="text-blue">${window.toKhmerNum(femaleStudents.toString())}</b> នាក់</span>
            <span>ពេលសិស្សត្រូវមករៀន: <b>${window.toKhmerNum(summary.totalSessionsRequired.toString())}</b></span>
            <span>ពេលអវត្តមាន: <b class="text-red">${window.toKhmerNum(summary.totalAbsentSessions.toString())}</b></span>
            <span>ពេលដែលសិស្សមករៀនពិតប្រាកដ: <b class="text-green">${window.toKhmerNum(summary.actualAttendedSessions.toString())}</b></span>
            <span>ភាគរយអវត្តមាន: <b class="text-red">${window.toKhmerNum(summary.absencePercentage)}%</b></span>
          </div>
        </div>
        
        <!-- កែសម្រួលត្រង់ចំណុចនេះតាមការស្នើសុំ -->
        <div class="end-list-note" style="margin-top: 6px;">
            បញ្ឈប់បញ្ជីក្នុងខែនេះត្រឹម <b class="text-blue" style="font-size: 13px; text-decoration: underline;">${window.toKhmerNum(summary.actualSchoolDays.toString())}</b> ពេល
        </div>

        <div class="footer-box">
          <div class="footer-col-left">
            <div>បានឃើញ និងឯកភាព</div>
            <div>នាយកសាលា</div>
            <div style="height: 45px;"></div>
            <div class="signature-name">${principalName}</div>
          </div>
          <div class="footer-col-right">
            <div>ថ្ងៃ.......................ខែ.......................ឆ្នាំ.......................ព.ស.២៥៦...</div>
            <div>....................... ថ្ងៃទី............ខែ.......................ឆ្នាំ២០......</div>
            <div class="role">គ្រូទទួលបន្ទុកថ្នាក់</div>
            <div style="height: 40px;"></div>
            <div class="signature-name">${teacherName}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1150,height=850');
    if (!printWindow) {
        alert("⚠️ ប្រព័ន្ធបានទប់ស្កាត់ផ្ទាំង Pop-up! សូមអនុញ្ញាត Pop-up លើ Browser របស់អ្នកដើម្បីបោះពុម្ព។");
        return;
    }
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
        try {
            printWindow.focus();
            printWindow.print();
        } catch(err) {
            console.error("Print Error:", err);
        }
    }, 600);
};

// =====================================================================
// ៨. Export Excel ជាមួយតារាងស្ថិតិសង្ខេប ២.២
// =====================================================================
window.exportAttendanceToExcel = function() {
    const table = document.getElementById("mainAttendanceTable");
    if (!table) { alert("⚠️ មិនមានទិន្នន័យដើម្បី Export ទេ!"); return; }

    const summary = window.calculateMoEYSSummary();
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const grade = `${document.getElementById("attLevelSelect")?.value || ''} ${document.getElementById("attRoomSelect")?.value || ''}`;

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          body { font-family: 'Khmer OS Siemreap', Arial, sans-serif; }
          th { background-color: #f1f5f9; border: 1px solid #000; font-family: 'Khmer OS Muol Light', serif; }
          td { border: 1px solid #000; text-align: center; }
          .summary-th { background-color: #dbeafe; font-family: 'Khmer OS Muol Light'; border: 1px solid #000; text-align: left; padding: 4px 8px; }
          .summary-td { border: 1px solid #000; text-align: left; padding: 4px 8px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h3 style="text-align: center; font-family: 'Khmer OS Muol Light';">បញ្ជីវត្តមានប្រចាំខែ ${month} - ${grade}</h3>
        ${table.outerHTML}

        <br>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <th colspan="3" class="summary-th">២.២- ផ្នែកស្ថិតិអវត្តមានប្រចាំខែ (តាមស្ដង់ដារក្រសួងអប់រំ យុវជន និងកីឡា)</th>
          </tr>
          <tr>
            <td class="summary-td">១. ចំនួនសិស្សសរុប ៖ ${window.toKhmerNum(summary.totalStudents.toString())} នាក់ (ស្រី ${window.toKhmerNum(summary.femaleStudents.toString())} នាក់)</td>
            <td class="summary-td">៤. ពេលអវត្តមានសរុប ៖ ${window.toKhmerNum(summary.totalAbsentSessions.toString())} ពេល</td>
            <td class="summary-td">៦. ភាគរយអវត្តមាន ៖ ${window.toKhmerNum(summary.absencePercentage)} %</td>
          </tr>
          <tr>
            <td class="summary-td">២. ចំនួនថ្ងៃរៀនពិតប្រាកដក្នុងមួយខែ ៖ ${window.toKhmerNum(summary.actualSchoolDays.toString())} ថ្ងៃ (ឈប់ ${window.toKhmerNum(summary.offDaysCount.toString())} ថ្ងៃ)</td>
            <td class="summary-td">- មានច្បាប់ (ច្ប) ៖ ${window.toKhmerNum(summary.grandPerm.toString())} | អត់ច្បាប់ (អច្ប) ៖ ${window.toKhmerNum(summary.grandUnex.toString())} | ឈឺ (ឈ) ៖ ${window.toKhmerNum(summary.grandSick.toString())}</td>
            <td class="summary-td" style="color: #047857;">៧. ភាគរយវត្តមានជាក់ស្តែង ៖ ${window.toKhmerNum(summary.attendancePercentage)} %</td>
          </tr>
          <tr>
            <td class="summary-td">៣. ចំនួនពេលដែលសិស្សត្រូវមករៀន ៖ ${window.toKhmerNum(summary.totalSessionsRequired.toString())} ពេល</td>
            <td class="summary-td" style="color: #047857;">៥. ចំនួនពេលដែលសិស្សមករៀនពិតប្រាកដ ៖ ${window.toKhmerNum(summary.actualAttendedSessions.toString())} ពេល</td>
            <td></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `បញ្ជីវត្តមាន_${grade.replace(/\s+/g, '_')}_${month}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// =====================================================================
// ៩. បោះពុម្ពរបាយការណ៍អវត្តមានប្រចាំឆ្នាំ (Annual Attendance Report)
// =====================================================================
window.openAnnualReportModal = function() {
    document.getElementById('annualReportModal')?.classList.remove('hidden');
};

window.closeAnnualReportModal = function() {
    document.getElementById('annualReportModal')?.classList.add('hidden');
};

window.handlePrintAnnualAction = function() {
    const selectedYear = document.getElementById('annualYearSelect')?.value || "២០២៦-២០២៧";
    closeAnnualReportModal();
    
    // បង្កើតទិន្នន័យឧទាហរណ៍ (Mock Data) សម្រាប់តេស្ត
    // ជាក់ស្តែង អ្នកត្រូវទាញទិន្នន័យ១០ខែនេះពី API ឬ LocalStorage របស់អ្នក
    const mockStudentsDataForAnnual = attendanceStudents.map(s => {
        return {
            id: s.id,
            name: s.name,
            gender: s.gender,
            monthlyData: {
                "តុលា": { perm: Math.floor(Math.random()*2), unex: Math.floor(Math.random()*1) },
                "វិច្ឆិកា": { perm: Math.floor(Math.random()*1), unex: 0 },
                "ធ្នូ": { perm: 0, unex: 0 },
                "មករា": { perm: 0, unex: Math.floor(Math.random()*2) },
                "កុម្ភៈ": { perm: 1, unex: 0 }
            },
            remark: ""
        };
    });

    window.printAnnualAttendanceReport(mockStudentsDataForAnnual, selectedYear);
};

window.printAnnualAttendanceReport = function(studentsData, academicYear) {
    const months = ["តុលា", "វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"];
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ធំ";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = sInfo.teacher_name || ".......................";
    const acYear = academicYear || "២០២៦-២០២៧"; 
    
    // ទាញយកឈ្មោះថ្នាក់ពីផ្ទាំងបញ្ជា (បើមាន)
    const levelVal = document.getElementById("attLevelSelect")?.value || "";
    const roomVal = document.getElementById("attRoomSelect")?.value || "";
    const grade = `${levelVal} ${roomVal}`.trim() || ".......................";
    
    let tbodyHtml = "";
    const rowsCount = studentsData && studentsData.length > 0 ? studentsData.length : 15;
    
    for (let i = 0; i < rowsCount; i++) {
        const stu = studentsData && studentsData[i] ? studentsData[i] : {};
        
        let rowHtml = `
            <tr>
                <td class="font-mono text-slate-500">${window.toKhmerNum((i + 1).toString())}</td>
                <td class="font-mono text-indigo-600">${stu.id || ""}</td>
                <td style="text-align: left; padding-left: 5px; font-family: 'Moul', serif; font-size: 10px;" class="text-slate-800">${stu.name || ""}</td>
                <td class="${stu.gender === 'ស្រី' ? 'text-rose-600 font-bold' : 'text-blue-600 font-bold'}">${stu.gender || ""}</td>
        `;
        
        let totalPerm = 0; 
        let totalUnex = 0; 
        
        months.forEach((m) => {
            const perm = stu.monthlyData && stu.monthlyData[m] ? stu.monthlyData[m].perm : "";
            const unex = stu.monthlyData && stu.monthlyData[m] ? stu.monthlyData[m].unex : "";
            
            if(Number(perm) > 0) totalPerm += Number(perm);
            if(Number(unex) > 0) totalUnex += Number(unex);
            
            rowHtml += `
                <td class="text-blue font-bold ${perm ? 'bg-blue-50/50' : ''}">${perm || ""}</td>
                <td class="text-red font-bold ${unex ? 'bg-rose-50/50' : ''}">${unex || ""}</td>
            `;
        });
        
        rowHtml += `
                <td class="text-blue" style="font-weight: bold; background-color: #dbeafe; font-size: 11px;">${totalPerm > 0 ? totalPerm : ""}</td>
                <td class="text-red" style="font-weight: bold; background-color: #ffe4e6; font-size: 11px;">${totalUnex > 0 ? totalUnex : ""}</td>
                <td class="text-slate-500 text-[9px]">${stu.remark || ""}</td>
            </tr>
        `;
        tbodyHtml += rowHtml;
    }

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>បញ្ជីអវត្តមានប្រចាំឆ្នាំ ${acYear}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
          @page { size: A4 landscape; margin: 10mm 12mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; font-family: 'Siemreap', sans-serif; color: #0f172a; background: #fff; line-height: 1.3; }
          .font-moul { font-family: 'Moul', serif; font-weight: normal; }
          
          /* ផ្នែកក្បាល (Header) */
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
          .header-left p { margin: 0 0 3px 0; font-size: 11px; font-family: 'Moul', serif; color: #334155; }
          .header-left .school-name { color: #1e3a8a; font-size: 13px; text-shadow: 0.5px 0.5px 0px #cbd5e1; }
          .header-left .class-name { color: #be123c; font-size: 11.5px; }
          .header-right { text-align: center; }
          .header-right p { margin: 0 0 3px 0; font-size: 12px; font-family: 'Moul', serif; color: #1e3a8a; }
          .header-right .motto { color: #b91c1c; font-size: 11px; }
          
          .title-box { text-align: center; margin-bottom: 15px; }
          .title-box h2 { margin: 0 0 5px 0; font-size: 16px; font-family: 'Moul', serif; color: #be123c; letter-spacing: 1px; }
          
          /* តារាង (Table) */
          table { width: 100%; border-collapse: collapse; text-align: center; border: 1.5px solid #0f172a; }
          th, td { border: 1px solid #475569; padding: 2px; font-size: 10px; overflow: hidden; }
          th { font-family: 'Siemreap', sans-serif; font-weight: bold; background-color: #f1f5f9; color: #1e3a8a; }
          tr:nth-child(even) { background-color: #f8fafc; } /* ពណ៌ឆ្លាស់ជួរដេក */
          
          /* រចនាពណ៌ក្បាលតារាងតាមផ្នែក */
          .th-main { background-color: #dbeafe; color: #1e3a8a; }
          .th-months { background-color: #e0e7ff; color: #3730a3; }
          .th-totals { background-color: #fef3c7; color: #92400e; }
          .th-perm { background-color: #eff6ff; color: #1d4ed8; font-size: 9px; }
          .th-unex { background-color: #fff1f2; color: #be123c; font-size: 9px; }
          
          .col-no { width: 3%; }
          .col-id { width: 5%; }
          .col-name { width: 14%; }
          .col-gender { width: 3%; }
          .col-month { width: 2.8%; font-size: 9px; }
          .col-total { width: 3.5%; }
          .col-remark { width: 6%; }
          
          .text-blue { color: #1d4ed8; }
          .text-red { color: #be123c; }
          
          /* ផ្នែកសរុបខាងក្រោមតារាង */
          .summary-footer { font-size: 11px; font-weight: bold; border: 1.5px solid #0f172a; border-top: none; padding: 5px; background-color: #f0fdf4; }
          .summary-row { display: flex; align-items: center; }
          .summary-label { width: 25%; padding-left: 10px; border-right: 1px dashed #cbd5e1; color: #15803d; }
          
          /* ផ្នែកហត្ថលេខា (Signatures) */
          .footer-box { display: flex; justify-content: space-between; align-items: flex-start; font-size: 11px; margin-top: 20px; padding: 0 40px; page-break-inside: avoid; }
          .footer-col-left { text-align: center; font-family: 'Moul', serif; line-height: 1.6; color: #1e3a8a; }
          .footer-col-right { text-align: center; line-height: 1.6; color: #334155; }
          .footer-col-right .role { font-family: 'Moul', serif; margin-top: 5px; color: #1e3a8a; }
          .signature-name { font-family: 'Moul', serif; font-size: 12px; color: #be123c; }
        </style>
      </head>
      <body>
        <!-- ផ្នែកក្បាលលិខិត -->
        <div class="header-box">
          <div class="header-left">
            <p>ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាល${districtName}</p>
            <p class="school-name">${schoolName}</p>
            <p class="class-name">ថ្នាក់ទី ${grade}</p>
          </div>
          <div class="header-right">
            <p>ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p class="motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          </div>
        </div>

        <div class="title-box">
          <h2>ចំនួនអវត្តមានសិស្សក្នុងឆ្នាំសិក្សា ${acYear}</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="3" class="col-no th-main">ល.រ<br>លេខរៀង</th>
              <th rowspan="3" class="col-id th-main">អត្តលេខ</th>
              <th rowspan="3" class="col-name th-main">គោត្តនាម និង នាម</th>
              <th rowspan="3" class="col-gender th-main">ភេទ</th>
              <th colspan="20" class="th-months">ចំនួនអវត្តមានប្រចាំខែ</th>
              <th colspan="2" class="th-totals">ចំនួនអវត្តមាន<br>ប្រចាំឆ្នាំ</th>
              <th rowspan="3" class="col-remark">សេចក្តីផ្សេងៗ</th>
            </tr>
            <tr>
              ${months.map(m => `<th colspan="2" class="bg-slate-100">${m}</th>`).join('')}
              <th rowspan="2" class="th-perm font-moul">ច្ប</th>
              <th rowspan="2" class="th-unex font-moul">អច្ប</th>
            </tr>
            <tr>
              ${months.map(() => `<th class="th-perm">ច្ប</th><th class="th-unex">អច្ប</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tbodyHtml}
          </tbody>
        </table>
        
        <div class="summary-footer">
           <div class="summary-row" style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
              <div class="summary-label">សរុបអវត្តមានប្រចាំខែ</div>
              <div style="flex-grow: 1; text-align: center; color: #64748b; font-size: 10px;">(កន្លែងសម្រាប់បូកសរុបអវត្តមានតាមខែនីមួយៗ)</div>
           </div>
           <div class="summary-row" style="padding-top: 4px;">
              <div class="summary-label">ភាគរយអវត្តមានប្រចាំខែ</div>
              <div style="flex-grow: 1; text-align: center; color: #64748b; font-size: 10px;">(កន្លែងសម្រាប់បូកភាគរយតាមខែនីមួយៗ)</div>
           </div>
        </div>

        <div class="footer-box">
          <div class="footer-col-left">
            <div>បានឃើញ និងឯកភាព</div>
            <div>នាយកសាលា</div>
            <div style="height: 60px;"></div>
            <div class="signature-name">${principalName}</div>
          </div>
          <div class="footer-col-right">
            <div>ថ្ងៃ.......................ខែ.......................ឆ្នាំ.......................ព.ស.២៥៦...</div>
            <div>....................... ថ្ងៃទី............ខែ.......................ឆ្នាំ២០......</div>
            <div class="role">គ្រូទទួលបន្ទុកថ្នាក់</div>
            <div style="height: 60px;"></div>
            <div class="signature-name">${teacherName}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1150,height=850');
    if (!printWindow) {
        alert("⚠️ ប្រព័ន្ធបានទប់ស្កាត់ផ្ទាំង Pop-up! សូមអនុញ្ញាត Pop-up។");
        return;
    }
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
        try {
            printWindow.focus();
            printWindow.print();
        } catch(err) {
            console.error("Print Error:", err);
        }
    }, 600);
};