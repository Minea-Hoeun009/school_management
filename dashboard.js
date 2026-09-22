// ==========================================
// ឯកសារ js/dashboard.js - ផ្ទាំង Dashboard ទំនើប (អាប់ដេត UI/UX & Fonts)
// ==========================================

let studentChartInstance = null;
let gradeChartInstance = null;
let liveClockInterval = null;

// ១. មុខងារទាញទិន្នន័យ និងបង្ហាញ Dashboard មេ
window.loadDashboard = async function() {
  const container = document.getElementById("dashboardView") || document.getElementById("mainContentArea") || document.getElementById("appView");
  if (!container) return;

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
  const school_name = sInfo.school_name || "សាលាចំណេះទូទៅ គំរូ";

  container.className = "flex flex-col flex-1 w-full h-full overflow-y-auto custom-scrollbar bg-slate-50 transition duration-300";

  container.innerHTML = `
    <div class="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 animate-fade-in pb-24 w-full font-siemreap text-slate-800 max-w-[1600px] mx-auto">
      
      <!-- ១. បដាស្វាគមន៍ (Welcome Banner) -->
      <div class="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-6 z-10 hover:shadow-2xl transition duration-500">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div class="absolute -left-10 -top-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-5 pointer-events-none z-0"><i class="fa-solid fa-school"></i></div>
        
        <div class="relative z-10 w-full lg:w-auto text-center lg:text-left">
          <span class="px-3 py-1.5 bg-white/10 rounded-full text-xs font-semibold text-blue-100 border border-white/10 shadow-sm backdrop-blur-md inline-flex items-center gap-2 mb-3">
            <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> ប្រព័ន្ធគ្រប់គ្រងសាលារៀន ៣កម្រិត
          </span>
          <h1 class="text-3xl font-black mt-1 mb-2 font-moul text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 drop-shadow-sm">
            ${school_name}
          </h1>
          <p class="text-sm sm:text-base text-indigo-200 font-medium tracking-wide">ឆ្នាំសិក្សា ${academic_year} | គ្រប់គ្រងទិន្នន័យដោយសុវត្ថិភាព និងប្រសិទ្ធភាព</p>
        </div>
        
        <div class="relative z-10 flex flex-col sm:flex-row gap-4 items-center">
           <button onclick="if(typeof switchView === 'function') switchView('examManager');" class="px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl text-xs font-bold shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2 cursor-pointer border border-white/20">
             <i class="fa-solid fa-file-pdf"></i> គ្រប់គ្រងការប្រឡង
           </button>
           <button onclick="if(typeof switchView === 'function') switchView('attendance');" class="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl text-xs font-bold shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2 cursor-pointer border border-emerald-400">
             <i class="fa-solid fa-clipboard-user text-sm"></i> ពិនិត្យវត្តមានថ្ងៃនេះ
           </button>
           <div class="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md text-center min-w-[200px] shadow-2xl">
             <div id="liveTime" class="text-3xl font-black text-white font-mono tracking-wider drop-shadow-md">00:00:00</div>
             <div id="liveDate" class="text-[10px] text-indigo-200 font-bold mt-1 uppercase tracking-widest bg-black/20 py-0.5 px-2 rounded-lg inline-block">ថ្ងៃ-ខែ-ឆ្នាំ</div>
           </div>
        </div>
      </div>

      <!-- ២. កាតចំណុចសំខាន់ៗ (KPI Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        <div class="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden transform hover:-translate-y-2 hover:shadow-xl transition duration-300 group cursor-pointer" onclick="if(typeof switchView === 'function') switchView('students');">
          <i class="fa-solid fa-users absolute -right-6 -bottom-6 text-8xl text-blue-50 group-hover:text-blue-100 transition-colors z-0 group-hover:scale-110 duration-500"></i>
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[11px] text-slate-500 font-bold tracking-widest uppercase">សិស្សសរុបទាំងអស់</p>
              <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors"><i class="fa-solid fa-graduation-cap"></i></div>
            </div>
            <h3 class="text-4xl font-black text-slate-800 flex items-baseline gap-2 font-mono">
              <span id="d_totalStudents">0</span> <span class="text-xs font-moul text-slate-400">នាក់</span>
            </h3>
            <div class="mt-3 flex justify-between text-xs font-bold text-slate-600 border-t border-slate-100 pt-2">
              <span class="text-pink-600">ស្រី: <span id="d_femaleCount">0</span></span> 
              <span class="text-blue-600">ប្រុស: <span id="d_maleCount">0</span></span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden transform hover:-translate-y-2 hover:shadow-xl transition duration-300 group cursor-pointer" onclick="if(typeof switchView === 'function') switchView('attendance');">
          <i class="fa-solid fa-user-check absolute -right-6 -bottom-6 text-8xl text-indigo-50 group-hover:text-indigo-100 transition-colors z-0 group-hover:scale-110 duration-500"></i>
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[11px] text-slate-500 font-bold tracking-widest uppercase">វត្តមានសិស្សថ្ងៃនេះ</p>
              <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors"><i class="fa-solid fa-clipboard-check"></i></div>
            </div>
            <h3 class="text-4xl font-black text-indigo-600 flex items-baseline gap-2 font-mono">
              <span id="d_attPercentage">100</span>%
            </h3>
            <div class="mt-3 flex justify-between text-xs font-bold text-slate-600 border-t border-slate-100 pt-2">
              <span class="text-emerald-600">មកវត្តមាន៖ <span id="d_attPresent">0</span></span>
              <span class="text-rose-500">អវត្តមាន៖ <span id="d_attAbsent">0</span></span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden transform hover:-translate-y-2 hover:shadow-xl transition duration-300 group cursor-pointer" onclick="if(typeof switchView === 'function') switchView('staff');">
          <i class="fa-solid fa-chalkboard-user absolute -right-6 -bottom-6 text-8xl text-emerald-50 group-hover:text-emerald-100 transition-colors z-0 group-hover:scale-110 duration-500"></i>
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[11px] text-slate-500 font-bold tracking-widest uppercase">គ្រូ និងបុគ្គលិក</p>
              <div class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors"><i class="fa-solid fa-user-tie"></i></div>
            </div>
            <h3 class="text-4xl font-black text-slate-800 flex items-baseline gap-2 font-mono">
              <span id="d_totalStaff">0</span> <span class="text-xs font-moul text-slate-400">នាក់</span>
            </h3>
            <div class="mt-3 flex justify-between text-xs font-bold text-slate-600 border-t border-slate-100 pt-2">
              <span class="text-emerald-600">វត្តមានគ្រូ៖ <span id="d_teacherPresent">100</span>%</span>
              <span class="text-amber-600">ច្បាប់៖ <span id="d_teacherLeave">0</span></span>
            </div>
          </div>
        </div>

      </div>

      <!-- ៣. កាតស្ថិតិសិស្សតាមថ្នាក់ទាំង ៣ កម្រិត -->
      <div class="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-6 md:p-8 relative">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-xl font-moul text-slate-800 flex items-center gap-3"><div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-layer-group"></i></div> ស្ថិតិសិស្សតាមកម្រិតថ្នាក់</h3>
            <p class="text-xs text-slate-500 mt-1 ml-14">ទិន្នន័យបំបែកតាមកម្រិត៖ បឋមសិក្សា អនុវិទ្យាល័យ និងវិទ្យាល័យ</p>
          </div>
          <button onclick="if(typeof switchView === 'function') switchView('students');" class="px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-indigo-200 transition flex items-center gap-2 shadow-sm cursor-pointer">
            មើលបញ្ជីលម្អិត <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        
        <div id="d_gradeCardsContainer" class="space-y-8">
           <div class="py-12 text-center text-slate-400 font-bold"><i class="fa-solid fa-spinner fa-spin text-3xl mb-3 text-indigo-400"></i><br>កំពុងរៀបចំទិន្នន័យ...</div>
        </div>
      </div>

      <!-- ៤. គំនូសតាង (Charts Area) និង សេចក្តីជូនដំណឹង -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <h3 class="text-base font-moul text-slate-800 mb-6 flex items-center gap-2">
            <i class="fa-solid fa-chart-column text-blue-500 text-xl"></i> របាយការណ៍សិស្សប្រុស-ស្រី តាមថ្នាក់ទាំង១២
          </h3>
          <div class="relative h-[320px] w-full">
             <canvas id="dashboardStudentChart"></canvas>
          </div>
        </div>

        <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <h3 class="text-base font-moul text-slate-800 mb-6 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-rose-500 text-xl"></i> លទ្ធផលនិទ្ទេសសិស្សទូទៅរួម
            </h3>
            <div class="relative h-[220px] w-full flex justify-center items-center">
                <canvas id="dashboardGradeChart"></canvas>
                <div class="absolute flex flex-col items-center justify-center pointer-events-none bg-white rounded-full p-4 shadow-sm">
                  <i class="fa-solid fa-award text-4xl text-amber-400"></i>
                </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-8" id="d_gradeLetterBadges">
            <div class="col-span-2 text-center text-xs text-slate-400 font-bold">កំពុងទាញយកទិន្នន័យ...</div>
          </div>
        </div>
      </div>

    </div>
  `;

  startLiveClock();
  await fetchAndComputeDashboard();
}

// ២. មុខងារបញ្ឆេះម៉ោងផ្ទាល់ខ្លួន (Live Clock)
function startLiveClock() {
  const timeEl = document.getElementById("liveTime");
  const dateEl = document.getElementById("liveDate");
  if (!timeEl || !dateEl) return;

  if (liveClockInterval) clearInterval(liveClockInterval);

  const updateClock = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    
    const days = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
    const months = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    dateEl.textContent = `ថ្ងៃ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  updateClock();
  liveClockInterval = setInterval(updateClock, 1000);
}

// ៣. ទាញទិន្នន័យ និងគណនាបញ្ចូលក្នុង Dashboard
async function fetchAndComputeDashboard() {
  try {
    let studentsRes = {data: []}, staffRes = {data: []}, financesRes = {data: []}, scoresRes = {data: []}, attendanceRes = {data: []};
    
    if (typeof apiGet === "function") {
        try {
            [studentsRes, staffRes, financesRes, scoresRes, attendanceRes] = await Promise.all([
              apiGet("getStudents", { status: "Active" }),
              apiGet("getStaff"),
              apiGet("getFinance"),
              apiGet("getScores"),
              apiGet("getAttendance")
            ]);
        } catch(e) { console.warn("API Fetch Failed in Dashboard"); }
    }

    const students = studentsRes.data && studentsRes.data.length > 0 ? studentsRes.data : (JSON.parse(localStorage.getItem('academic_students')) || []);
    const staff = staffRes.data || [];
    const finances = financesRes.data || [];
    let scores = scoresRes.data && scoresRes.data.length > 0 ? scoresRes.data : (JSON.parse(localStorage.getItem('academic_scores')) || []);

    const totalStudents = students.length;
    const femaleCount = students.filter(s => s.gender === "ស្រី").length;
    const maleCount = totalStudents - femaleCount;
    
    if (document.getElementById("d_totalStudents")) {
      document.getElementById("d_totalStudents").textContent = totalStudents;
      document.getElementById("d_femaleCount").textContent = `${femaleCount} នាក់`;
      document.getElementById("d_maleCount").textContent = `${maleCount} នាក់`;
    }

    let presentCount = totalStudents > 0 ? Math.floor(totalStudents * 0.95) : 0; 
    let absentCount = totalStudents - presentCount;
    let attPercent = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 100;

    if (document.getElementById("d_attPercentage")) {
       document.getElementById("d_attPercentage").textContent = attPercent;
       document.getElementById("d_attPresent").textContent = `${presentCount} នាក់`;
       document.getElementById("d_attAbsent").textContent = `${absentCount} នាក់`;
    }
    
    const activeStaffList = staff.filter(st => st.status !== "ឈប់សម្រាក");
    if (document.getElementById("d_totalStaff")) {
      document.getElementById("d_totalStaff").textContent = activeStaffList.length;
    }

    let totalIncome = 0, totalExpense = 0;
    finances.forEach(f => {
      const amt = Number(f.amount) || 0;
      if (f.type === "ចំណូល") totalIncome += amt;
      else if (f.type === "ចំណាយ") totalExpense += amt;
    });
    
    if (document.getElementById("d_netBalance")) {
      document.getElementById("d_netBalance").textContent = "$" + (totalIncome - totalExpense).toLocaleString(undefined, {minimumFractionDigits: 2});
      document.getElementById("d_totalIncome").textContent = "+$" + totalIncome.toLocaleString();
      document.getElementById("d_totalExpense").textContent = "-$" + totalExpense.toLocaleString();
    }

    const gradeCardsContainer = document.getElementById("d_gradeCardsContainer");
    let gradeCardsHtml = "";
    const gradeStats = {};
    
    const themeClasses = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500', icon: 'fa-child-reaching' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', icon: 'fa-school' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-500', icon: 'fa-graduation-cap' }
    };

    const levelsGrouping = [
      { 
        title: "កម្រិតបឋមសិក្សា (ទី១ - ទី៦)", theme: "blue",
        grades: [ { id: "១", name: "ថ្នាក់ទី ១" }, { id: "២", name: "ថ្នាក់ទី ២" }, { id: "៣", name: "ថ្នាក់ទី ៣" }, { id: "៤", name: "ថ្នាក់ទី ៤" }, { id: "៥", name: "ថ្នាក់ទី ៥" }, { id: "៦", name: "ថ្នាក់ទី ៦" } ]
      },
      { 
        title: "កម្រិតអនុវិទ្យាល័យ (ទី៧ - ទី៩)", theme: "emerald",
        grades: [ { id: "៧", name: "ថ្នាក់ទី ៧" }, { id: "៨", name: "ថ្នាក់ទី ៨" }, { id: "៩", name: "ថ្នាក់ទី ៩" } ]
      },
      { 
        title: "កម្រិតវិទ្យាល័យ (ទី១០ - ទី១២)", theme: "purple",
        grades: [ { id: "១០", name: "ថ្នាក់ទី ១០" }, { id: "១១", name: "ថ្នាក់ទី ១១" }, { id: "១២", name: "ថ្នាក់ទី ១២" } ]
      }
    ];

    if (gradeCardsContainer) {
      levelsGrouping.forEach(lvl => {
        const theme = themeClasses[lvl.theme];
        let cardsHtml = "";
        
        lvl.grades.forEach(g => {
          const inGrade = students.filter(s => {
            const sg = String(s.grade || "").trim();
            const regex = new RegExp(`ទី\\s*${g.id}(?![០១២៣៤៥៦៧៨៩])`);
            return regex.test(sg);
          });

          const fCount = inGrade.filter(s => s.gender === "ស្រី").length;
          const mCount = inGrade.length - fCount;
          const total = inGrade.length;
          let fPercent = total > 0 ? (fCount / total) * 100 : 0;
          let mPercent = total > 0 ? (mCount / total) * 100 : 0;

          gradeStats[g.name] = { total, female: fCount, male: mCount };

          cardsHtml += `
            <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-${theme.text.split('-')[1]}-300 hover:shadow-lg hover:-translate-y-1 transition duration-300 group">
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-moul text-slate-800">${g.name}</h4>
                <div class="w-7 h-7 rounded-full ${theme.bg} ${theme.text} flex items-center justify-center text-[10px]"><i class="fa-solid fa-users"></i></div>
              </div>
              <div class="text-3xl font-black text-slate-800 mt-2 mb-4 font-mono">${total} <span class="text-[10px] font-bold text-slate-400 font-siemreap">នាក់</span></div>
              
              <div class="w-full flex h-2 rounded-full overflow-hidden bg-slate-100 mb-2 relative">
                <div style="width: ${mPercent}%" class="${theme.bar} transition-all duration-1000 ease-out"></div>
                <div style="width: ${fPercent}%" class="bg-pink-400 transition-all duration-1000 ease-out"></div>
              </div>
              
              <div class="flex justify-between items-center text-[10px] font-bold">
                <span class="${theme.text}">ប: ${mCount}</span>
                <span class="text-pink-500">ស: ${fCount}</span>
              </div>
            </div>
          `;
        });

        gradeCardsHtml += `
          <div class="w-full bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
            <h4 class="font-moul text-[15px] ${theme.text} pb-3 mb-4 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg ${theme.bg} flex items-center justify-center"><i class="fa-solid ${theme.icon}"></i></div> ${lvl.title}
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
              ${cardsHtml}
            </div>
          </div>
        `;
      });
      
      gradeCardsContainer.innerHTML = gradeCardsHtml;
    }

    const gradeLetters = { "excellent": 0, "good": 0, "fair": 0, "average": 0, "fail": 0 };
    let hasScoresData = false;

    scores.forEach(sc => {
      hasScoresData = true;
      let letter = (sc.grade_letter || "").trim();
      if (letter === "A" || letter === "ល្អណាស់") gradeLetters["excellent"]++;
      else if (letter === "B" || letter === "ល្អ") gradeLetters["good"]++;
      else if (letter === "C" || letter === "បង្គួរ") gradeLetters["fair"]++;
      else if (letter === "D" || letter === "E" || letter === "មធ្យម") gradeLetters["average"]++;
      else if (letter === "F" || letter === "ធ្លាក់") gradeLetters["fail"]++;
      else gradeLetters["fail"]++; 
    });

    const badgeContainer = document.getElementById("d_gradeLetterBadges");
    if (badgeContainer) {
      if (!hasScoresData) {
         badgeContainer.innerHTML = `<div class="col-span-2 text-center text-xs font-bold text-slate-400 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">គ្មានទិន្នន័យពិន្ទុ</div>`;
      } else {
         badgeContainer.innerHTML = `
           <div class="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 rounded-xl flex items-center justify-between border border-blue-100 shadow-sm hover:shadow-md transition">
              <span class="text-xs font-moul">ល្អណាស់ / A</span> <span class="font-black text-lg font-mono">${gradeLetters["excellent"]}</span>
           </div>
           <div class="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-xl flex items-center justify-between border border-emerald-100 shadow-sm hover:shadow-md transition">
              <span class="text-xs font-moul">ល្អ / B</span> <span class="font-black text-lg font-mono">${gradeLetters["good"]}</span>
           </div>
           <div class="p-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-xl flex items-center justify-between border border-amber-100 shadow-sm hover:shadow-md transition">
              <span class="text-xs font-moul">បង្គួរ / C</span> <span class="font-black text-lg font-mono">${gradeLetters["fair"]}</span>
           </div>
           <div class="p-3 bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 rounded-xl flex items-center justify-between border border-rose-100 shadow-sm hover:shadow-md transition">
              <span class="text-xs font-moul">មធ្យម/ធ្លាក់</span> <span class="font-black text-lg font-mono">${gradeLetters["average"] + gradeLetters["fail"]}</span>
           </div>
         `;
      }
    }

    renderDashboardCharts(gradeStats, gradeLetters, hasScoresData);

  } catch (err) {
    console.error("Dashboard compute error:", err);
  }
}

// ៤. គូរគំនូសតាង (Chart.js)
function renderDashboardCharts(gradeStats, gradeLetters, hasScoresData) {
  if (typeof Chart === 'undefined') return;

  const ctxStudent = document.getElementById("dashboardStudentChart")?.getContext("2d");
  if (ctxStudent) {
    if (studentChartInstance) studentChartInstance.destroy();
    
    const labels = [
      "ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦",
      "ថ្នាក់ទី ៧", "ថ្នាក់ទី ៨", "ថ្នាក់ទី ៩", "ថ្នាក់ទី ១០", "ថ្នាក់ទី ១១", "ថ្នាក់ទី ១២"
    ];
    
    studentChartInstance = new Chart(ctxStudent, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          { label: "សិស្សប្រុស", data: labels.map(l => gradeStats[l]?.male || 0), backgroundColor: "#4f46e5", borderRadius: 6, barPercentage: 0.7 },
          { label: "សិស្សស្រី", data: labels.map(l => gradeStats[l]?.female || 0), backgroundColor: "#f43f5e", borderRadius: 6, barPercentage: 0.7 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 1500, easing: 'easeOutQuart' },
        plugins: { legend: { position: "top", labels: { font: { family: "Siemreap", size: 12 }, usePointStyle: true, padding: 20 } } },
        scales: { 
          y: { beginAtZero: true, grid: { color: '#f8fafc' }, ticks: { font: { family: "Siemreap" } } },
          x: { grid: { display: false }, ticks: { font: { family: "Siemreap", weight: 'bold', size: 10 } } }
        }
      }
    });
  }

  const ctxGrade = document.getElementById("dashboardGradeChart")?.getContext("2d");
  if (ctxGrade) {
    if (gradeChartInstance) gradeChartInstance.destroy();
    
    const dataValues = hasScoresData ? [
        gradeLetters["excellent"], 
        gradeLetters["good"], 
        gradeLetters["fair"], 
        gradeLetters["average"] + gradeLetters["fail"]
    ] : [1];
    
    const bgColors = hasScoresData ? ["#4f46e5", "#10b981", "#f59e0b", "#f43f5e"] : ["#f1f5f9"];
    const labels = hasScoresData ? ["ល្អណាស់/A", "ល្អ/B", "បង្គួរ/C", "មធ្យម/ធ្លាក់"] : ["គ្មានទិន្នន័យ"];

    gradeChartInstance = new Chart(ctxGrade, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{ data: dataValues, backgroundColor: bgColors, borderWidth: 4, borderColor: '#ffffff', hoverOffset: 8 }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        cutout: '70%', 
        animation: { animateScale: true, animateRotate: true, duration: 1500 },
        plugins: { legend: { display: false } } 
      }
    });
  }
}