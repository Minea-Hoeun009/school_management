// =====================================================================
// ឯកសារ js/attendance.js - គ្រប់គ្រងបញ្ជីវត្តមានសិស្ស
// =====================================================================

let attendanceStudents = []; 
let monthlyAttendanceData = {}; 
window.monthlyAttendanceData = monthlyAttendanceData; // បញ្ជូនជា Global Variable
const KHMER_DAYS = ["អា", "ច", "អ", "ពុ", "ព្រ", "សុ", "ស"];

// អនុគមន៍ជំនួយ៖ បំប្លែងលេខទៅជាលេខខ្មែរ
window.toKhmerNum = window.toKhmerNum || function(str) {
    if (str === null || str === undefined) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
};

// =====================================================================
// មុខងារទាញទិន្នន័យអវត្តមានរបស់សិស្សសម្រាប់ប្រើរួមគ្នាជាមួយ report_cards.js
// =====================================================================
window.getStudentAttendance = function(studentId, monthName = null) {
  let permission = 0;
  let unexcused = 0;
  let found = false;

  const targetId = String(studentId).trim();
  const attData = window.monthlyAttendanceData || monthlyAttendanceData;

  // ១. ស្វែងរកក្នុងអង្គចងចាំ Memory
  if (attData && attData[targetId]) {
    found = true;
    const records = attData[targetId];
    Object.values(records).forEach(val => {
      if (!val) return;
      const v = String(val).trim().toUpperCase();
      if (v === "ច" || v === "C" || v === "ច្បាប់") permission++;
      else if (v === "អ" || v === "A" || v === "ឥតច្បាប់") unexcused++;
    });
  }

  // ២. ស្វែងរកក្នុង localStorage (Cache)
  if (!found) {
    try {
      const stored = JSON.parse(localStorage.getItem('academic_monthly_attendance') || '{}');
      if (stored && stored[targetId]) {
        found = true;
        Object.values(stored[targetId]).forEach(val => {
          if (!val) return;
          const v = String(val).trim().toUpperCase();
          if (v === "ច" || v === "C" || v === "ច្បាប់") permission++;
          else if (v === "អ" || v === "A" || v === "ឥតច្បាប់") unexcused++;
        });
      }
    } catch(e) {}
  }

  // ៣. បើកំពុងបើកលើផ្ទាំងវត្តមាន អាចទាញពី DOM
  if (!found) {
    const permEl = document.getElementById(`perm_${targetId}`);
    const unexEl = document.getElementById(`unex_${targetId}`);
    if (permEl || unexEl) {
      permission = parseInt(permEl?.textContent) || 0;
      unexcused = parseInt(unexEl?.textContent) || 0;
      found = true;
    }
  }

  return {
    permission: permission,
    unexcused: unexcused,
    total: permission + unexcused,
    hasData: found
  };
};

// ១. បង្ហាញផ្ទាំង Layout មេ
window.loadAttendanceView = async function(defaultGrade = "ថ្នាក់ទី ២ «ខ»") {
  const container = document.getElementById("attendanceContainer") || document.getElementById("attendanceView");
  if (!container) return;

  const currentYear = new Date().getFullYear();
  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាចំណេះទូទៅ គំរូ";
  const academicYear = sInfo.academic_year || `${currentYear}-${currentYear + 1}`;

  let gradesOptions = "";
  for(let i = 1; i <= 12; i++) {
      let type = i <= 6 ? "(បឋម)" : i <= 9 ? "(អនុ)" : "(វិទ្យា)";
      let khGrade = window.toKhmerNum(i.toString());
      gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}">ទី ${khGrade} ${type}</option>`;
  }

  container.className = "p-4 md:p-6 transition duration-300 h-full w-full flex flex-col min-h-0 bg-slate-50";
  container.innerHTML = `
    <div class="animate-fade-in h-full w-full flex flex-col min-h-0 font-siemreap max-w-[1600px] mx-auto">
      
      <!-- ក្បាលទំព័រ និងការកំណត់ (បិទពេល Print) -->
      <div class="bg-white p-6 rounded-[2rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 shrink-0 mb-6 relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-6 no-print transition-all">
        <div class="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-rose-500 to-orange-500 rounded-l-3xl"></div>
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-rose-50 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="flex items-center gap-5 ml-2 w-full xl:w-auto relative z-10">
            <div class="w-14 h-14 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-rose-100"><i class="fa-solid fa-calendar-check"></i></div>
            <div>
                <h2 class="text-xl md:text-2xl font-black text-slate-800 font-moul mb-1">បញ្ជីវត្តមានប្រចាំខែ</h2>
                <p class="text-[13px] text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-100 inline-flex mt-1">
                    <span class="text-blue-600"><i class="fa-solid fa-circle text-[8px] mr-1"></i>ច្បាប់ (ច)</span> <span class="mx-2 text-slate-300">|</span>
                    <span class="text-rose-600"><i class="fa-solid fa-circle text-[8px] mr-1"></i>ឥតច្បាប់ (អ)</span> <span class="mx-2 text-slate-300">|</span>
                    <span class="text-amber-500"><i class="fa-solid fa-circle text-[8px] mr-1"></i>ឈប់សម្រាក (៖)</span>
                </p>
            </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3 w-full xl:w-auto relative z-10">
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-slate-400"><i class="fa-solid fa-magnifying-glass text-[12px]"></i></span>
              <input type="text" id="attSearch" oninput="window.filterAttendanceTable()" placeholder="ស្វែងរកឈ្មោះ..." class="pl-9 pr-3 py-2 border-2 border-slate-100 rounded-xl text-xs font-bold focus:border-rose-300 focus:bg-white outline-none w-full md:w-48 bg-slate-50 transition shadow-sm">
            </div>

            <div class="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 shadow-sm hover:border-slate-200 transition">
              <i class="fa-solid fa-layer-group text-slate-400 text-[11px]"></i>
              <select id="attLevelSelect" onchange="window.fetchMonthlyAttendance()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer">
                ${gradesOptions}
              </select>
              <span class="text-slate-300">|</span>
              <select id="attRoomSelect" onchange="window.fetchMonthlyAttendance()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer">
                <option value="«ក»">«ក»</option><option value="«ខ»" selected>«ខ»</option>
                <option value="«គ»">«គ»</option><option value="«ឃ»">«ឃ»</option>
              </select>
            </div>
            
            <div class="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 shadow-sm hover:border-slate-200 transition">
              <i class="fa-solid fa-calendar-day text-slate-400 text-[11px]"></i>
              <select id="attMonthSelect" onchange="window.fetchMonthlyAttendance()" class="border-none bg-transparent text-xs font-bold text-rose-700 outline-none cursor-pointer">
                <option value="មករា">មករា</option><option value="កុម្ភៈ">កុម្ភៈ</option><option value="មីនា">មីនា</option>
                <option value="មេសា">មេសា</option><option value="ឧសភា">ឧសភា</option><option value="មិថុនា">មិថុនា</option>
                <option value="កក្កដា">កក្កដា</option><option value="សីហា">សីហា</option><option value="កញ្ញា">កញ្ញា</option>
                <option value="តុលា">តុលា</option><option value="វិច្ឆិកា">វិច្ឆិកា</option><option value="ធ្នូ">ធ្នូ</option>
              </select>
              <span class="text-slate-300">|</span>
              <select id="attYearSelect" onchange="window.fetchMonthlyAttendance()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer font-mono">
                <option value="${currentYear - 1}">${currentYear - 1}</option>
                <option value="${currentYear}" selected>${currentYear}</option>
                <option value="${currentYear + 1}">${currentYear + 1}</option>
              </select>
            </div>
        </div>
      </div>

      <!-- ឧបករណ៍បញ្ជា (Toolbar) -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0 no-print">
        <div class="flex flex-wrap gap-3">
          <button onclick="window.autoFillSundays()" class="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[13px] font-bold transition shadow-sm hover:shadow transform hover:-translate-y-0.5 flex items-center gap-2">
            <i class="fa-solid fa-sun text-amber-500"></i> ថ្ងៃអាទិត្យស្វ័យប្រវត្តិ
          </button>
          <button onclick="window.clearAttendance()" class="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[13px] font-bold transition shadow-sm hover:shadow transform hover:-translate-y-0.5 flex items-center gap-2">
            <i class="fa-solid fa-eraser text-slate-400"></i> សម្អាតទាំងអស់
          </button>
        </div>
        <div class="flex flex-wrap gap-3">
          <button onclick="window.exportAttendanceToExcel()" class="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[13px] font-bold transition shadow-sm hover:shadow transform hover:-translate-y-0.5 flex items-center gap-2">
            <i class="fa-solid fa-file-excel"></i> ទាញយក Excel
          </button>
          <button onclick="window.printOfficialAttendance()" class="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[13px] font-bold shadow-md transition flex items-center gap-2 transform hover:-translate-y-0.5">
            <i class="fa-solid fa-print"></i> បោះពុម្ពបញ្ជី
          </button>
        </div>
      </div>

      <!-- តារាងវត្តមាន -->
      <div class="bg-white rounded-[2rem] border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] relative overflow-hidden flex-1 flex flex-col min-h-0 print:border-none print:shadow-none w-full" id="attendanceWebArea">
        
        <div class="flex justify-between items-center py-4 px-6 print:py-4 no-print shrink-0 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md">
            <h3 class="text-[15px] font-bold text-slate-700 flex items-center gap-3 font-moul">
               <div class="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center text-sm shadow-sm"><i class="fa-solid fa-list-check"></i></div>
               បញ្ជីវត្តមានប្រចាំខែ <span id="lblMonthTitle" class="text-rose-600 border-b-2 border-rose-300 pb-0.5">មករា</span>
            </h3>
            <p class="text-[13px] font-bold text-slate-500">ថ្នាក់ទី <span id="attHeaderGrade" class="text-indigo-700 mx-1 font-moul bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-sm">${defaultGrade}</span> | ឆ្នាំសិក្សា <span id="lblAcademicYearTitle" class="ml-1 font-mono">${window.toKhmerNum(academicYear)}</span></p>
        </div>

        <div class="overflow-auto w-full flex-1 min-h-0 custom-scrollbar print:overflow-visible relative bg-white pb-6">
            <table class="w-max min-w-full border-collapse border border-slate-400 print:border-black text-[12px] text-center bg-white relative font-siemreap" id="mainAttendanceTable">
              <thead class="sticky top-0 z-30 shadow-sm text-[12px]">
                <tr id="trKhmerDays" class="bg-slate-100 text-slate-700 border-b border-slate-300 print:border-black font-moul h-[40px] tracking-wider">
                  <!-- Render ថ្ងៃនៃសប្តាហ៍ -->
                </tr>
                <tr id="trDayNumbers" class="bg-slate-50 text-slate-700 border-b border-slate-400 print:border-black font-bold h-[36px]">
                  <!-- Render លេខ ១ ដល់ ៣១ -->
                </tr>
              </thead>
              <tbody id="attendanceTableRows" class="divide-y divide-slate-300 print:divide-black text-slate-800 print:text-black">
                <tr><td colspan="38" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-rose-400"></i><br>កំពុងទាញយកទិន្នន័យ...</td></tr>
              </tbody>
              <tfoot id="attendanceTableFoot" class="bg-slate-100 font-bold border-t-[2px] border-slate-400 print:border-black text-slate-800 print:text-black sticky bottom-0 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <!-- ជួរបូកសរុបអវត្តមានប្រចាំថ្ងៃ -->
              </tfoot>
            </table>
        </div>
      </div>

      <!-- ប៊ូតុងរក្សាទុកអណ្តែតជាប់ក្រោម -->
      <div class="flex justify-end pt-5 shrink-0 no-print">
        <button type="button" id="btnSaveAttendance" onclick="window.saveMonthlyAttendance()"
                class="px-10 py-3.5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white rounded-2xl text-[14px] font-black shadow-lg shadow-rose-200 transition transform hover:-translate-y-1 flex items-center gap-3">
          <i class="fa-solid fa-floppy-disk text-lg"></i> រក្សាទុកបញ្ជីវត្តមានប្រចាំខែ
        </button>
      </div>

    </div>
  `;

  const levelSelect = document.getElementById("attLevelSelect");
  const roomSelect = document.getElementById("attRoomSelect");
  
  if (defaultGrade && levelSelect && roomSelect) {
     const gradeNumMatch = defaultGrade.match(/ថ្នាក់ទី\s*([០-៩\d]+)/);
     const roomMatch = defaultGrade.match(/«.*?»/);
     if (gradeNumMatch) {
         const khmerGradeToFind = "ថ្នាក់ទី " + window.toKhmerNum(gradeNumMatch[1]);
         Array.from(levelSelect.options).forEach(opt => {
             if (opt.value === khmerGradeToFind) opt.selected = true;
         });
     }
     if (roomMatch) {
         Array.from(roomSelect.options).forEach(opt => {
             if (opt.value === roomMatch[0]) opt.selected = true;
         });
     }
  }

  const currentMonthIdx = new Date().getMonth();
  const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
  const attMonthSelect = document.getElementById("attMonthSelect");
  if(attMonthSelect) {
      Array.from(attMonthSelect.options).forEach(opt => {
          if (opt.value === khmerMonths[currentMonthIdx]) opt.selected = true;
      });
  }

  await window.fetchMonthlyAttendance();
  window.setupAttExcelLikeNavigation();
};

window.fetchMonthlyAttendance = async function() {
  const btn = document.getElementById("btnSaveAttendance");
  if(btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> កំពុងទាញយកទិន្នន័យ...`;
  }
  
  const month = document.getElementById("attMonthSelect").value;
  const year = parseInt(document.getElementById("attYearSelect").value);
  
  const levelVal = document.getElementById("attLevelSelect").value.trim();
  const roomVal = document.getElementById("attRoomSelect").value.trim();
  const fullGradeName = `${levelVal} ${roomVal}`;

  document.getElementById("attHeaderGrade").textContent = fullGradeName.replace("ថ្នាក់ទី", "");
  document.getElementById("lblMonthTitle").textContent = month;

  const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
  const monthNum = monthMap[month] || 1;
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  window.renderCalendarHeaders(year, monthNum, daysInMonth);

  const tbody = document.getElementById("attendanceTableRows");
  tbody.innerHTML = `<tr><td colspan="38" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-rose-400"></i><br>កំពុងទាញយកទិន្នន័យសិស្ស...</td></tr>`;

  try {
    let studentsRes = {data: []};
    let attRes = {data: []};

    if (typeof apiGet === "function") {
        try {
            [studentsRes, attRes] = await Promise.all([
              apiGet("getStudents", { status: "Active" }), 
              apiGet("getAttendance", { grade: fullGradeName, month: month })
            ]);
        } catch(e) { console.warn("API Fetch Failed"); }
    }

    let allStus = (studentsRes.data && studentsRes.data.length > 0) ? studentsRes.data : (JSON.parse(localStorage.getItem('academic_students')) || []);

    attendanceStudents = allStus.filter(s => 
        String(s.grade).trim() === levelVal && 
        String(s.room).trim() === roomVal && 
        s.status !== "Dropped"
    );

    attendanceStudents.sort((a, b) => String(a.name || "").trim().localeCompare(String(b.name || "").trim(), "km"));

    const savedRecords = attRes.data || [];
    monthlyAttendanceData = {};
    savedRecords.forEach(r => {
      if (!monthlyAttendanceData[r.student_id]) monthlyAttendanceData[r.student_id] = {};
      const day = parseInt(String(r.date).split("-")[2] || r.date, 10);
      if (!Number.isNaN(day)) monthlyAttendanceData[r.student_id][day] = r.status;
    });

    // ធ្វើសមកាលកម្មទិន្នន័យទៅ Global និង Cache ក្នុង localStorage
    window.monthlyAttendanceData = monthlyAttendanceData;
    try {
      localStorage.setItem('academic_monthly_attendance', JSON.stringify(monthlyAttendanceData));
    } catch(e) {}

    window.renderAttendanceRows(daysInMonth);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="38" class="p-12 text-center text-rose-500 font-bold bg-rose-50"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><br>មានបញ្ហាក្នុងការតភ្ជាប់ទិន្នន័យ</td></tr>`;
  } finally {
    if(btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk text-lg"></i> រក្សាទុកបញ្ជីវត្តមានប្រចាំខែ`;
    }
  }
};

window.renderCalendarHeaders = function(year, monthNum, daysInMonth) {
  const trKhmer = document.getElementById("trKhmerDays");
  const trNums = document.getElementById("trDayNumbers");

  let khmerDaysHtml = `
    <th rowspan="2" class="border-r border-slate-300 print:border-black p-2 sticky left-0 z-20 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none" style="min-width: 40px; width: 40px; max-width: 40px;">ល.រ</th>
    <th rowspan="2" class="border-r border-slate-300 print:border-black p-2 sticky left-[40px] z-20 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none hidden md:table-cell" style="min-width: 80px; width: 80px; max-width: 80px;">អត្តលេខ</th>
    <th rowspan="2" class="border-r border-slate-300 print:border-black text-left px-4 sticky md:left-[120px] left-[40px] z-20 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none" style="min-width: 220px; width: 220px; max-width: 220px;">គោត្តនាម និងនាម</th>
    <th rowspan="2" class="border-r border-slate-300 print:border-black p-2 bg-slate-50" style="min-width: 45px; width: 45px; max-width: 45px;">ភេទ</th>
  `;
  let numDaysHtml = "";

  for (let d = 1; d <= 31; d++) {
    let dayName = "-";
    let isSunday = false;

    if (d <= daysInMonth) {
      const dateObj = new Date(year, monthNum - 1, d);
      dayName = KHMER_DAYS[dateObj.getDay()];
      isSunday = dayName === "អា";
    }
    
    const headerClass = isSunday ? 'text-rose-600 bg-rose-100' : 'bg-slate-100/80 text-slate-500';
    const numClass = isSunday ? 'text-rose-600 bg-rose-50' : 'bg-white text-slate-600';
    
    khmerDaysHtml += `<th class="border-r border-slate-300 print:border-black font-bold ${headerClass}" style="min-width: 36px; width: 36px; max-width: 36px;">${dayName}</th>`;
    numDaysHtml += `<th class="border-r border-slate-300 print:border-black font-mono text-[13px] ${numClass}" style="min-width: 36px; width: 36px; max-width: 36px;">${d <= daysInMonth ? d : '-'}</th>`;
  }

  khmerDaysHtml += `<th colspan="3" class="border-r border-slate-300 print:border-black bg-blue-100 text-blue-800 shadow-sm" style="min-width: 120px; width: 120px; max-width: 120px;">ចំនួនអវត្តមាន</th>
                    <th rowspan="2" class="p-2 bg-slate-50" style="min-width: 100px; width: 100px; max-width: 100px;">ផ្សេងៗ</th>`;
  numDaysHtml += `
    <th class="border-r border-slate-300 print:border-black bg-blue-50 text-blue-700" title="ច្បាប់" style="min-width: 40px; width: 40px; max-width: 40px;">ច្ប</th>
    <th class="border-r border-slate-300 print:border-black bg-rose-50 text-rose-700" title="ឥតច្បាប់" style="min-width: 40px; width: 40px; max-width: 40px;">អ.ច្ប</th>
    <th class="border-r border-slate-300 print:border-black bg-amber-100 text-amber-800" style="min-width: 40px; width: 40px; max-width: 40px;">សរុប</th>
  `;

  trKhmer.innerHTML = khmerDaysHtml;
  trNums.innerHTML = numDaysHtml;
};

window.renderAttendanceRows = function(daysInMonth) {
  const tbody = document.getElementById("attendanceTableRows");
  
  if (attendanceStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="38" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-folder-open text-4xl mb-3 text-slate-200"></i><br>មិនទាន់មានសិស្សក្នុងថ្នាក់នេះនៅឡើយទេ</td></tr>`;
    return;
  }

  tbody.innerHTML = attendanceStudents.map((s, idx) => {
    const genderShort = s.gender === "ស្រី" ? "ស" : "ប";
    const genderColor = s.gender === "ស្រី" ? "text-rose-600 bg-rose-50/50" : "text-blue-600 bg-blue-50/50";
    const studentData = monthlyAttendanceData[s.id] || {};

    let dayInputs = "";
    for (let d = 1; d <= 31; d++) {
      if (d <= daysInMonth) {
        let val = studentData[d] || "";
        if (val === "ច្បាប់") val = "ច";
        if (val === "ឥតច្បាប់") val = "អ";
        if (val === "ឈប់សម្រាក") val = "៖";

        const dateObj = new Date(parseInt(document.getElementById("attYearSelect").value), document.getElementById("attMonthSelect").selectedIndex, d);
        const isSunday = dateObj.getDay() === 0;
        const bgCellClass = isSunday ? "bg-rose-50/30" : "bg-white";

        dayInputs += `
          <td class="border-r border-slate-300 print:border-black p-0 relative ${bgCellClass} group-hover:bg-indigo-50/50 transition-colors" style="min-width: 36px; width: 36px; max-width: 36px;">
            <input type="text" maxlength="1" id="att_${s.id}_${d}" value="${val}" data-row="${idx}" data-col="${d}"
                   oninput="window.handleAttInput(this, '${s.id}', ${daysInMonth})" 
                   class="att-input w-full h-[36px] text-center text-[13px] font-bold border-0 focus:ring-inset focus:ring-2 focus:ring-rose-400 outline-none bg-transparent uppercase ${window.getColorClass(val)} cursor-text transition-all">
          </td>
        `;
      } else {
        dayInputs += `<td class="border-r border-slate-300 print:border-black bg-slate-100/50" style="min-width: 36px; width: 36px; max-width: 36px;"></td>`;
      }
    }

    return `
      <tr class="hover:bg-indigo-50/30 transition-colors border-b border-slate-200 print:border-black h-[36px] bg-white group">
        <td class="border-r border-slate-300 print:border-black text-center font-bold sticky left-0 z-10 bg-white group-hover:bg-indigo-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none font-mono text-[12px] text-slate-500" style="min-width: 40px; width: 40px; max-width: 40px;">${idx + 1}</td>
        <td class="border-r border-slate-300 print:border-black text-center font-mono text-[11px] font-bold text-indigo-400 hidden md:table-cell sticky left-[40px] z-10 bg-white group-hover:bg-indigo-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none" style="min-width: 80px; width: 80px; max-width: 80px;">${s.id}</td>
        <td class="border-r border-slate-300 print:border-black px-4 text-left font-bold text-slate-800 sticky md:left-[120px] left-[40px] z-10 bg-white group-hover:bg-indigo-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none font-moul text-[13px] truncate" style="min-width: 220px; width: 220px; max-width: 220px;">${s.name}</td>
        <td class="border-r border-slate-300 print:border-black text-center font-bold ${genderColor} font-siemreap text-[12px] group-hover:bg-indigo-50 transition-colors" style="min-width: 45px; width: 45px; max-width: 45px;">${genderShort}</td>
        
        ${dayInputs}

        <td class="border-r border-slate-300 print:border-black text-center font-mono font-bold text-blue-700 bg-blue-50/80 text-[13px]" style="min-width: 40px; width: 40px; max-width: 40px;" id="perm_${s.id}">0</td>
        <td class="border-r border-slate-300 print:border-black text-center font-mono font-bold text-rose-700 bg-rose-50/80 text-[13px]" style="min-width: 40px; width: 40px; max-width: 40px;" id="unex_${s.id}">0</td>
        <td class="border-r border-slate-300 print:border-black text-center font-mono font-black text-amber-800 bg-amber-100/80 text-[14px]" style="min-width: 40px; width: 40px; max-width: 40px;" id="tot_${s.id}">0</td>
        <td class="p-0 bg-white group-hover:bg-indigo-50 transition-colors" style="min-width: 100px; width: 100px; max-width: 100px;"><input type="text" id="note_${s.id}" class="w-full h-[36px] text-[11px] border-0 bg-transparent px-2 outline-none text-slate-500 focus:bg-white focus:ring-inset focus:ring-2 focus:ring-indigo-300 font-siemreap"></td>
      </tr>
    `;
  }).join("");

  window.calculateAllAttendance(); 
};

window.getColorClass = function(val) {
  if (val === "ច" || val === "C") return "text-blue-600 font-black bg-blue-100/80";
  if (val === "អ" || val === "A") return "text-rose-600 font-black bg-rose-100/80";
  if (val === "៖" || val === ":") return "text-amber-500 font-black bg-amber-100/80";
  return "text-slate-800 font-bold";
};

window.handleAttInput = function(inputEl, studentId, daysInMonth) {
  inputEl.className = `att-input w-full h-[36px] text-center text-[13px] font-bold border-0 focus:ring-inset focus:ring-2 focus:ring-rose-400 outline-none bg-transparent uppercase ${window.getColorClass(inputEl.value.trim().toUpperCase())} transition-all cursor-text`;
  
  // ធ្វើបច្ចុប្បន្នភាពទិន្នន័យក្នុង Memory
  const col = parseInt(inputEl.getAttribute('data-col'));
  if (!monthlyAttendanceData[studentId]) monthlyAttendanceData[studentId] = {};
  monthlyAttendanceData[studentId][col] = inputEl.value.trim().toUpperCase();
  window.monthlyAttendanceData = monthlyAttendanceData;

  window.calculateStudentAbsence(studentId, daysInMonth);
  window.calculateDailyTotals(daysInMonth);
};

window.calculateStudentAbsence = function(studentId, daysInMonth) {
  let permission = 0, unexcused = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const val = document.getElementById(`att_${studentId}_${d}`)?.value.trim().toUpperCase();
    if (val === "ច" || val === "C") permission++;
    else if (val === "អ" || val === "A") unexcused++;
  }
  // កែសម្រួល៖ បង្ហាញលេខជាក់ស្តែង (ទោះបី 0 ក៏ត្រូវបង្ហាញលេខ 0 មិនដាក់ទទេឡើយ)
  if (document.getElementById(`perm_${studentId}`)) {
    document.getElementById(`perm_${studentId}`).textContent = permission;
  }
  if (document.getElementById(`unex_${studentId}`)) {
    document.getElementById(`unex_${studentId}`).textContent = unexcused;
  }
  if (document.getElementById(`tot_${studentId}`)) {
    document.getElementById(`tot_${studentId}`).textContent = (permission + unexcused);
  }
};

window.calculateDailyTotals = function(daysInMonth) {
  let dailyTotalsHtml = `<tr class="h-[40px] text-center bg-slate-50 font-siemreap">
     <td colspan="4" class="border-r border-slate-300 print:border-black px-5 text-right font-bold text-slate-600 sticky left-0 z-10 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none text-[12px] uppercase tracking-wider">សរុបអវត្តមានប្រចាំថ្ងៃ</td>`;
  
  let grandTotalPerm = 0, grandTotalUnex = 0;

  for (let d = 1; d <= 31; d++) {
    if (d <= daysInMonth) {
      let dayAbsentCount = 0;
      attendanceStudents.forEach(s => {
        const val = document.getElementById(`att_${s.id}_${d}`)?.value.trim().toUpperCase();
        if (val === "ច" || val === "អ" || val === "C" || val === "A") dayAbsentCount++;
      });
      dailyTotalsHtml += `<td class="border-r border-slate-300 print:border-black font-mono text-[13px] ${dayAbsentCount > 0 ? 'text-rose-600 font-black bg-rose-50/50' : 'text-slate-300'}">${dayAbsentCount || ''}</td>`;
    } else {
      dailyTotalsHtml += `<td class="border-r border-slate-300 print:border-black bg-slate-100/50"></td>`;
    }
  }

  attendanceStudents.forEach(s => {
    grandTotalPerm += parseInt(document.getElementById(`perm_${s.id}`)?.textContent) || 0;
    grandTotalUnex += parseInt(document.getElementById(`unex_${s.id}`)?.textContent) || 0;
  });

  dailyTotalsHtml += `
    <td class="border-r border-slate-300 print:border-black font-mono font-bold text-blue-800 bg-blue-100 text-[13px]">${grandTotalPerm}</td>
    <td class="border-r border-slate-300 print:border-black font-mono font-bold text-rose-800 bg-rose-100 text-[13px]">${grandTotalUnex}</td>
    <td class="border-r border-slate-300 print:border-black font-mono font-black text-amber-900 bg-amber-200 text-[14px]">${grandTotalPerm + grandTotalUnex}</td>
    <td class="bg-slate-50"></td>
  </tr>`;

  document.getElementById("attendanceTableFoot").innerHTML = dailyTotalsHtml;
};

window.calculateAllAttendance = function() {
  const month = document.getElementById("attMonthSelect").value;
  const year = parseInt(document.getElementById("attYearSelect").value);
  const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
  const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

  attendanceStudents.forEach(s => window.calculateStudentAbsence(s.id, daysInMonth));
  window.calculateDailyTotals(daysInMonth);
};

window.saveMonthlyAttendance = async function() {
  const btn = document.getElementById("btnSaveAttendance");
  const month = document.getElementById("attMonthSelect").value;
  const year = document.getElementById("attYearSelect").value;
  const grade = `${document.getElementById("attLevelSelect").value} ${document.getElementById("attRoomSelect").value}`;
  
  if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-lg"></i> កំពុងរក្សាទុក...`;
  }

  const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
  const monthNum = monthMap[month] || 1;
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  const batchPayload = [];

  attendanceStudents.forEach(s => {
    for (let d = 1; d <= daysInMonth; d++) {
      const val = document.getElementById(`att_${s.id}_${d}`)?.value.trim().toUpperCase();
      if (val) {
        let statusText = "វត្តមាន";
        if (val === "ច" || val === "C") statusText = "ច្បាប់";
        else if (val === "អ" || val === "A") statusText = "ឥតច្បាប់";
        else if (val === "៖" || val === ":") statusText = "ឈប់សម្រាក";

        batchPayload.push({
          student_id: s.id,
          date: `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
          month: month,
          grade: grade,
          status: statusText
        });
      }
    }
  });

  // រក្សាទុកក្នុង localStorage ជាបម្រុង
  try {
    localStorage.setItem('academic_monthly_attendance', JSON.stringify(monthlyAttendanceData));
  } catch(e) {}

  try {
    if (typeof apiPost === 'function') {
        const res = await apiPost("saveAttendanceBatch", { data: batchPayload });
        if (res.status === "success") {
          if(typeof showToast === 'function') showToast("✅ រក្សាទុកវត្តមានបានជោគជ័យ!");
        } else {
          alert("មានបញ្ហាក្នុងការរក្សាទុក!");
        }
    }
  } catch (err) {
    if(typeof showToast === 'function') showToast("✅ ទិន្នន័យត្រូវបានរក្សាទុកបណ្ដោះអាសន្ន (Offline)!");
  } finally {
    setTimeout(() => {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-floppy-disk text-lg"></i> រក្សាទុកបញ្ជីវត្តមានប្រចាំខែ`;
        }
    }, 800);
  }
};

window.autoFillSundays = function() {
  const year = parseInt(document.getElementById("attYearSelect").value);
  const month = document.getElementById("attMonthSelect").value;
  const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
  const monthNum = monthMap[month] || 1;
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  attendanceStudents.forEach(s => {
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, monthNum - 1, d);
      if (dateObj.getDay() === 0) { 
        const el = document.getElementById(`att_${s.id}_${d}`);
        if (el && !el.value) {
          el.value = "៖";
          window.handleAttInput(el, s.id, daysInMonth);
        }
      }
    }
  });
  if(typeof showToast === 'function') showToast("🌅 បំពេញថ្ងៃអាទិត្យស្វ័យប្រវត្តិរួចរាល់!");
};

window.clearAttendance = function() {
  if(!confirm("តើអ្នកពិតជាចង់លុបវត្តមានទាំងអស់នៅលើតារាងនេះមែនទេ? (លុបតែលើអេក្រង់)")) return;
  const inputs = document.querySelectorAll("#attendanceTableRows input.att-input");
  inputs.forEach(el => {
    el.value = '';
    el.className = `att-input w-full h-[36px] text-center text-[13px] font-bold border-0 focus:ring-inset focus:ring-2 focus:ring-rose-400 outline-none bg-transparent uppercase text-slate-700 cursor-text transition-all`;
  });
  monthlyAttendanceData = {};
  window.monthlyAttendanceData = {};
  try {
    localStorage.removeItem('academic_monthly_attendance');
  } catch(e) {}
  window.calculateAllAttendance();
};

window.setupAttExcelLikeNavigation = function() {
  document.getElementById("attendanceWebArea").addEventListener('keydown', function(e) {
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
  const search = document.getElementById("attSearch").value.toLowerCase();
  const rows = document.querySelectorAll("#attendanceTableRows tr");
  
  rows.forEach(row => {
    if(row.children.length > 2) {
      const name = row.children[2].textContent.toLowerCase();
      if(name.includes(search)) {
         row.style.display = "";
      } else {
         row.style.display = "none";
      }
    }
  });
};

// មុខងារបោះពុម្ពបញ្ជីវត្តមាន A4 Landscape
window.printOfficialAttendance = function() {
  const tableContent = document.getElementById("mainAttendanceTable");
  if (!tableContent) { alert("⚠️ រកមិនឃើញតារាងវត្តមានទេ!"); return; }

  const printWrapper = document.createElement("div");
  printWrapper.innerHTML = tableContent.outerHTML;
  
  const inputs = printWrapper.querySelectorAll("input");
  inputs.forEach(input => {
      const val = input.value;
      const td = input.parentElement;
      if (val !== "") {
          let color = "#000";
          if (val === "ច" || val === "C") color = "#2563eb";
          if (val === "អ" || val === "A") color = "#e11d48";
          if (val === "៖" || val === ":") color = "#d97706";
          td.innerHTML = `<span style="color: ${color}; font-weight: bold;">${val}</span>`;
      } else {
          td.innerHTML = "";
      }
  });

  const trKhmer = printWrapper.querySelector("#trKhmerDays");
  if (trKhmer && trKhmer.children.length > 1) {
      trKhmer.removeChild(trKhmer.children[1]);
  }
  
  const tbodyRows = printWrapper.querySelectorAll("#attendanceTableRows tr");
  tbodyRows.forEach(tr => {
      if (tr.children.length > 1 && !tr.children[0].hasAttribute('colspan')) {
          tr.removeChild(tr.children[1]);
      }
  });
  
  const tfootTd = printWrapper.querySelector("#attendanceTableFoot td[colspan='4']");
  if (tfootTd) {
      tfootTd.setAttribute("colspan", "3");
  }

  const allEls = printWrapper.querySelectorAll('*');
  allEls.forEach(el => {
      el.className = el.className.replace(/sticky/g, "").replace(/left-\[?\d+[a-z]*\]?/g, "").replace(/z-10/g, "").replace(/z-20/g, "").replace(/z-30/g, "").replace(/shadow-[^"'\s]*/g, "");
      el.style.minWidth = "";
      el.style.width = "";
      el.style.maxWidth = "";
  });

  let colGroupHtml = `
    <colgroup>
      <col style="width: 3%;"> <!-- ល.រ -->
      <col style="width: 17%;"> <!-- ឈ្មោះ -->
      <col style="width: 3%;"> <!-- ភេទ -->
  `;
  for(let i=0; i<31; i++) {
      colGroupHtml += `<col style="width: 2%;">`;
  }
  colGroupHtml += `
      <col style="width: 3%;"> <!-- ច្ប -->
      <col style="width: 3%;"> <!-- អ.ច្ប -->
      <col style="width: 3%;"> <!-- សរុប -->
      <col style="width: 6%;"> <!-- ផ្សេងៗ -->
    </colgroup>
  `;

  const clonedTable = printWrapper.querySelector("table");
  clonedTable.insertAdjacentHTML('afterbegin', colGroupHtml);

  const month = document.getElementById("attMonthSelect").value;
  const grade = `${document.getElementById("attLevelSelect").value} ${document.getElementById("attRoomSelect").value}`;
  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាចំណេះទូទៅ គំរូ";
  const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
  const principalName = sInfo.principal_name || "នាយកសាលា";
  const teacherName = sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";
  const academicYear = sInfo.academic_year || "2026-2027";
  const currentYear = new Date().getFullYear();

  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>បញ្ជីវត្តមានប្រចាំខែ${month} - ${grade}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; font-family: 'Siemreap', sans-serif; color: #000; background: #fff; }
        .font-moul { font-family: 'Moul', serif; font-weight: normal; }
        .font-bold { font-weight: 700; }
        .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .header-left p { margin: 0 0 4px 0; font-size: 13px; font-weight: bold; }
        .header-right { text-align: center; }
        .header-right p { margin: 0 0 3px 0; font-size: 14px; }
        .title-box { text-align: center; margin: 5px 0 15px 0; }
        .title-box h2 { margin: 0 0 5px 0; font-size: 18px; color: #000; }
        .title-box p { margin: 0; font-size: 12px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 15px; table-layout: fixed; border: 2px solid black; }
        th, td { border: 1px solid #000; padding: 2px 0px; height: 28px; font-size: 11px; overflow: hidden; white-space: nowrap; word-break: break-all; }
        th { background-color: #f8fafc; font-weight: bold; }
        td:nth-child(2) { text-align: left; padding-left: 6px; white-space: nowrap; text-overflow: ellipsis; font-family: 'Moul', serif;}
        .footer-box { display: flex; justify-content: space-between; align-items: flex-start; padding: 0 50px; font-size: 12px; font-weight: bold; margin-top: 15px; }
        .footer-col { text-align: center; }
        .footer-col p { margin: 0 0 5px 0; }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="header-left">
          <p class="font-moul" style="font-size: 12px;">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
          <p class="font-moul" style="font-size: 14px; color: #e11d48;">${schoolName}</p>
          <p style="font-size: 12px; margin-top: 2px;" class="font-bold font-siemreap">${grade}</p>
        </div>
        <div class="header-right">
          <p class="font-moul">ព្រះរាជាណាចក្រកម្ពុជា</p>
          <p class="font-moul">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          <div style="font-family: serif; letter-spacing: 3px; font-weight: bold; margin-top: -2px;">𑁋𑁋𑁋𑁋𑁋</div>
        </div>
      </div>

      <div class="title-box">
        <h2 class="font-moul">បញ្ជីវត្តមានប្រចាំ <span style="color: #e11d48;">ខែ${month}</span></h2>
        <p class="font-bold font-siemreap">ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</p>
      </div>

      ${printWrapper.innerHTML}

      <div class="footer-box">
        <div class="footer-col">
          <p style="font-weight: normal;">បានឃើញ និងឯកភាព</p>
          <p class="font-moul" style="font-size: 11px;">នាយិកាសាលា / នាយកសាលា</p>
          <div style="height: 50px;"></div>
          <p class="font-moul" style="font-size: 12px; color: #1e3a8a;">${principalName}</p>
        </div>
        <div class="footer-col">
          <p style="font-weight: normal;">ធ្វើនៅ................, ថ្ងៃទី........ ខែ........ ឆ្នាំ ${window.toKhmerNum(currentYear.toString())}</p>
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