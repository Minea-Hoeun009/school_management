// ==========================================
// ឯកសារ js/academic.js - ប្រព័ន្ធគ្រប់គ្រងការសិក្សា (Modern Integration)
// ==========================================

const khmerNumbersAc = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
const toKhmerNumAc = (str) => String(str).split('').map(n => khmerNumbersAc[n] || n).join('');

// ផ្ទុកទិន្នន័យ (Local Storage Data)
let storedData = JSON.parse(localStorage.getItem('academic_data')) || {};
window.acData = {
  years: storedData.years || ["២០២៥-២០២៦", "២០២៦-២០២៧"],
  semesters: storedData.semesters || ["ឆមាសទី១", "ឆមាសទី២"],
  activeYear: storedData.activeYear || "២០២៦-២០២៧",
  activeSemester: storedData.activeSemester || "ឆមាសទី១",
  schoolLevels: storedData.schoolLevels || ["បឋមសិក្សា", "អនុវិទ្យាល័យ", "វិទ្យាល័យ"],
  curriculums: storedData.curriculums || ["ចំណេះទូទៅ-បឋម", "ចំណេះទូទៅ-អនុវិទ្យាល័យ", "ចំណេះទូទៅ-វិទ្យាសាស្ត្រ", "ចំណេះទូទៅ-វិទ្យាសាស្ត្រសង្គម", "ភាសាអង់គ្លេសទូទៅ (GEP)"],
  grades: storedData.grades || ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦", "ថ្នាក់ទី ៧", "ថ្នាក់ទី ៨", "ថ្នាក់ទី ៩", "ថ្នាក់ទី ១០", "ថ្នាក់ទី ១១", "ថ្នាក់ទី ១២"],
  rooms: storedData.rooms || ["«ក»", "«ខ»", "«គ»", "«ឃ»"],
  subjects: storedData.subjects || [
    { id: "S1", name: "ភាសាខ្មែរ", code: "KHM-101", curriculum: "ចំណេះទូទៅ-បឋម", credit: 8, teacher: "លោកគ្រូ សុខ សាន្ត" },
    { id: "S2", name: "គណិតវិទ្យា", code: "MAT-101", curriculum: "ចំណេះទូទៅ-បឋម", credit: 6, teacher: "អ្នកគ្រូ មាស មករា" },
    { id: "S3", name: "រូបវិទ្យា", code: "PHY-101", curriculum: "ចំណេះទូទៅ-វិទ្យាសាស្ត្រ", credit: 6, teacher: "លោកគ្រូ កែវ វាសនា" }
  ],
  lessons: storedData.lessons || [],
  timetables: storedData.timetables || []
};

window.saveAcData = function() { localStorage.setItem('academic_data', JSON.stringify(window.acData)); };

// ==========================================
// 1. រចនាសម្ព័ន្ធមេ (Main Layout)
// ==========================================
window.loadAcademicView = function() {
  let container = document.getElementById("academic") || document.getElementById("mainContentArea");
  if (!container) return console.error("⚠️ រកមិនឃើញកន្លែងបង្ហាញ (Container) សម្រាប់មុខងារ Academic ទេ!");

  container.className = "p-4 md:p-6 transition duration-300 h-full w-full flex flex-col min-h-0 bg-slate-50";
  container.innerHTML = `
    <div id="acModalsContainer" class="font-siemreap"></div>
    <div class="space-y-4 animate-fade-in pb-10 h-full w-full flex flex-col min-h-0 font-siemreap max-w-[1600px] mx-auto">
      
      <!-- ក្បាលទំព័រ -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden shrink-0 hover:shadow-md transition">
        <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-600 to-purple-600"></div>
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10">
          <h2 class="text-xl md:text-2xl font-moul text-slate-800 flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-indigo-100"><i class="fa-solid fa-graduation-cap"></i></div>
            ប្រព័ន្ធគ្រប់គ្រងការសិក្សា
          </h2>
          <p class="text-xs text-slate-500 font-bold bg-slate-50 inline-block px-4 py-1.5 rounded-full border border-slate-100 shadow-inner ml-0 md:ml-16">
            ឆ្នាំសិក្សា៖ <b class="text-indigo-600">${toKhmerNumAc(window.acData.activeYear || "មិនទាន់កំណត់")}</b> | <span class="text-emerald-600">${window.acData.activeSemester || "មិនទាន់កំណត់"}</span>
          </p>
        </div>
        <div class="relative z-10 flex items-center gap-3 w-full md:w-auto" id="acTopActionBtnContainer"></div>
      </div>

      <!-- Menu Tabs -->
      <div class="bg-white px-2 pt-2 border border-slate-200 rounded-t-3xl shadow-sm shrink-0 flex gap-2 overflow-x-auto custom-scrollbar z-10 w-full">
         <button onclick="window.switchAcademicTab('setup')" id="atab-setup" class="px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 flex items-center gap-2">
           <i class="fa-solid fa-sitemap"></i> រចនាសម្ព័ន្ធ (Setup)
         </button>
         <button onclick="window.switchAcademicTab('subjects')" id="atab-subjects" class="px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-indigo-500 flex items-center gap-2 border-b-2 border-transparent">
           <i class="fa-solid fa-book"></i> កម្មវិធី & មុខវិជ្ជា
         </button>
         <button onclick="window.switchAcademicTab('timetable')" id="atab-timetable" class="px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-indigo-500 flex items-center gap-2 border-b-2 border-transparent">
           <i class="fa-solid fa-calendar-days"></i> កាលវិភាគសិក្សា
         </button>
         <button onclick="window.switchAcademicTab('lessons')" id="atab-lessons" class="px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-indigo-500 flex items-center gap-2 border-b-2 border-transparent">
           <i class="fa-solid fa-chalkboard-user"></i> ផែនការ & តាមដានបង្រៀន
         </button>
      </div>

      <!-- Content Areas -->
      <div class="flex-1 w-full bg-white shadow-sm relative overflow-hidden flex flex-col z-0 rounded-b-3xl border-x border-b border-slate-200 min-h-0">
        <div id="academicTabContent-setup" class="hidden w-full h-full p-4 md:p-6 overflow-y-auto custom-scrollbar flex-col gap-6"></div>
        <div id="academicTabContent-subjects" class="hidden w-full h-full p-4 md:p-6 overflow-y-auto custom-scrollbar flex-col gap-6"></div>
        <div id="academicTabContent-timetable" class="hidden w-full h-full p-4 md:p-6 overflow-y-auto custom-scrollbar flex-col gap-6"></div>
        <div id="academicTabContent-lessons" class="hidden w-full h-full p-4 md:p-6 overflow-y-auto custom-scrollbar flex-col gap-6"></div>
      </div>
    </div>
  `;

  window.acRenderModals();
  window.switchAcademicTab('setup');
};

// 2. ការប្តូរ Tabs និង ការបញ្ជា
window.currentAcTab = 'setup';
window.switchAcademicTab = function(tab) {
  window.currentAcTab = tab;
  
  ["setup", "subjects", "timetable", "lessons"].forEach(t => {
    const btn = document.getElementById(`atab-${t}`);
    const content = document.getElementById(`academicTabContent-${t}`);
    if (btn) btn.className = "px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-indigo-500 flex items-center gap-2 border-b-2 border-transparent";
    if (content) { content.classList.add("hidden"); content.classList.remove("flex"); }
  });

  const activeBtn = document.getElementById(`atab-${tab}`);
  const activeContent = document.getElementById(`academicTabContent-${tab}`);
  if (activeBtn) activeBtn.className = "px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 flex items-center gap-2";
  if (activeContent) { activeContent.classList.remove("hidden"); activeContent.classList.add("flex", "animate-fade-in"); }

  const actionContainer = document.getElementById("acTopActionBtnContainer");
  if (actionContainer) {
      if (tab === 'setup') {
         actionContainer.innerHTML = ``;
      } else if (tab === 'subjects') {
         actionContainer.innerHTML = `
            <div class="relative w-full md:w-64 hidden sm:block">
               <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
               <input type="text" id="acSubjectSearch" onkeyup="window.acFilterSubjects()" placeholder="ស្វែងរកមុខវិជ្ជា..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition">
            </div>
            <button onclick="window.openAcSubjectModal()" class="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2"><i class="fa-solid fa-plus"></i> បន្ថែមមុខវិជ្ជា</button>
         `;
      } else if (tab === 'timetable') {
         actionContainer.innerHTML = `
            <button onclick="window.acSaveTimetableData()" id="btnSaveTimetable" class="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2"><i class="fa-solid fa-cloud-arrow-up"></i> រក្សាទុក</button>
            <button onclick="window.printAcTimetable()" class="flex-1 md:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2"><i class="fa-solid fa-print"></i> បោះពុម្ព</button>
         `;
      } else if (tab === 'lessons') {
         actionContainer.innerHTML = `<button onclick="window.openAcLessonModal()" class="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2"><i class="fa-solid fa-plus"></i> បង្កើត Lesson Plan</button>`;
      }
  }

  if (tab === 'setup') window.acRenderSetup();
  else if (tab === 'subjects') window.acRenderSubjects();
  else if (tab === 'timetable') window.acRenderTimetableRoot();
  else if (tab === 'lessons') window.acRenderLessons();
};

// --- TAB 1: រចនាសម្ព័ន្ធ (Setup) ---
window.acRenderSetup = function() {
  const c = document.getElementById("academicTabContent-setup");
  if(!c) return;

  const buildHtml = (list, key, activeVal) => {
     return list.map((item, idx) => {
        const isActive = item === activeVal;
        const bgClass = isActive ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500 shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50";
        const badgeHtml = isActive ? `<i class="fa-solid fa-circle-check text-indigo-500"></i>` : ``;
        const actionClick = (key === 'years' || key === 'semesters') ? `onclick="window.acSetActive('${key}', '${item}')"` : ``;
        return `<div ${actionClick} class="px-4 py-3 ${bgClass} rounded-xl text-sm font-bold flex justify-between items-center group w-full transition duration-300 ${actionClick ? 'cursor-pointer' : ''}">
           <div class="flex items-center gap-2">${toKhmerNumAc(item)} ${badgeHtml}</div>
           <button onclick="event.stopPropagation(); window.acDeleteItemConfirm('${key}', ${idx})" class="w-7 h-7 rounded-lg bg-white/50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-trash-can"></i></button>
        </div>`;
     }).join('');
  };

  const yearsHtml = buildHtml(window.acData.years, 'years', window.acData.activeYear);
  const semestersHtml = buildHtml(window.acData.semesters, 'semesters', window.acData.activeSemester);
  const curHtml = buildHtml(window.acData.curriculums, 'curriculums', null);
  
  const gradesHtml = window.acData.grades.map((g, idx) => {
      let typeClass = "bg-white border-slate-200 hover:border-blue-300";
      let typeIcon = "fa-child-reaching text-blue-500";
      let badge = "បឋម";
      let badgeColor = "bg-blue-50 text-blue-600";
      
      if(g.includes("១០") || g.includes("១១") || g.includes("១២")) { typeClass="bg-white border-slate-200 hover:border-purple-300"; typeIcon="fa-graduation-cap text-purple-500"; badge="វិទ្យា"; badgeColor="bg-purple-50 text-purple-600"; }
      else if(g.includes("៧") || g.includes("៨") || g.includes("៩")) { typeClass="bg-white border-slate-200 hover:border-emerald-300"; typeIcon="fa-school text-emerald-500"; badge="អនុ"; badgeColor="bg-emerald-50 text-emerald-600"; }
      
      return `
        <div class="px-4 py-3 ${typeClass} border shadow-sm rounded-xl text-sm font-bold text-slate-700 flex justify-between items-center group w-full transition duration-300 relative overflow-hidden">
          <div class="flex items-center gap-3 relative z-10">
             <div class="w-8 h-8 rounded-full ${badgeColor} flex justify-center items-center"><i class="fa-solid ${typeIcon}"></i></div>
             ${toKhmerNumAc(g)}
          </div>
          <button onclick="window.acDeleteItemConfirm('grades', ${idx})" class="relative z-10 w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `;
  }).join('');

  const roomsHtml = window.acData.rooms.map((r, idx) => `<div class="px-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 flex justify-between items-center group w-full hover:border-amber-300 transition duration-300"><span class="flex items-center gap-2"><i class="fa-solid fa-door-open text-amber-500"></i> បន្ទប់ ${r}</span> <button onclick="window.acDeleteItemConfirm('rooms', ${idx})" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-trash-can"></i></button></div>`).join('');

  c.innerHTML = `
    <div class="w-full space-y-6 flex-1 bg-slate-50/30 p-2 md:p-6 rounded-3xl">
       <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] w-full h-max transition duration-300 hover:shadow-lg">
             <div class="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h3 class="font-bold text-slate-800 text-base flex items-center gap-2"><i class="fa-regular fa-calendar-check text-indigo-500 text-lg"></i> ឆ្នាំសិក្សា (ជ្រើសរើស)</h3>
                <button onclick="window.acPromptModal('years', 'បន្ថែមឆ្នាំសិក្សាថ្មី', 'ឧ. ២០២៧-២០២៨')" class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center shadow-sm"><i class="fa-solid fa-plus"></i></button>
             </div>
             <div class="grid grid-cols-1 gap-3 w-full">${yearsHtml}</div>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] w-full h-max transition duration-300 hover:shadow-lg">
             <div class="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h3 class="font-bold text-slate-800 text-base flex items-center gap-2"><i class="fa-solid fa-clock-rotate-left text-teal-500 text-lg"></i> ឆមាស (ជ្រើសរើស)</h3>
                <button onclick="window.acPromptModal('semesters', 'បន្ថែមឆមាសថ្មី', 'ឧ. ឆមាសទី៣')" class="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition flex items-center justify-center shadow-sm"><i class="fa-solid fa-plus"></i></button>
             </div>
             <div class="grid grid-cols-1 gap-3 w-full">${semestersHtml}</div>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] w-full h-max transition duration-300 hover:shadow-lg">
             <div class="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h3 class="font-bold text-slate-800 text-base flex items-center gap-2"><i class="fa-solid fa-layer-group text-purple-500 text-lg"></i> កម្មវិធីសិក្សា</h3>
                <button onclick="window.acPromptModal('curriculums', 'បន្ថែមកម្មវិធីសិក្សាថ្មី', 'ឧ. ចំណេះទូទៅ-កុំព្យូទ័រ')" class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition flex items-center justify-center shadow-sm"><i class="fa-solid fa-plus"></i></button>
             </div>
             <div class="grid grid-cols-1 gap-3 w-full">${curHtml}</div>
          </div>
       </div>

       <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] w-full h-max lg:col-span-2 transition duration-300 hover:shadow-lg">
             <div class="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h3 class="font-bold text-slate-800 text-base flex items-center gap-2"><i class="fa-solid fa-chalkboard text-blue-500 text-lg"></i> កម្រិតថ្នាក់បង្រៀន</h3>
                <button onclick="window.acPromptModal('grades', 'បន្ថែមកម្រិតថ្នាក់ថ្មី', 'ឧ. ថ្នាក់ទី ១៣')" class="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"><i class="fa-solid fa-plus"></i> បន្ថែមថ្នាក់</button>
             </div>
             <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">${gradesHtml}</div>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] w-full h-max transition duration-300 hover:shadow-lg">
             <div class="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h3 class="font-bold text-slate-800 text-base flex items-center gap-2"><i class="fa-solid fa-building text-amber-500 text-lg"></i> បន្ទប់ (Rooms)</h3>
                <button onclick="window.acPromptModal('rooms', 'បន្ថែមបន្ទប់/ក្រុមថ្មី', 'ឧ. «ង»')" class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition flex items-center justify-center shadow-sm"><i class="fa-solid fa-plus"></i></button>
             </div>
             <div class="grid grid-cols-2 gap-3 w-full">${roomsHtml}</div>
          </div>
       </div>
    </div>
  `;
};

window.acSetActive = function(key, val) {
  if (key === 'years') window.acData.activeYear = val;
  if (key === 'semesters') window.acData.activeSemester = val;
  window.saveAcData(); window.acRenderSetup(); window.loadAcademicView(); 
};

window.acDeleteSubject = function(idx) {
  window.acConfirmModal("តើអ្នកពិតជាចង់លុបមុខវិជ្ជានេះមែនទេ?", function() {
     window.acData.subjects.splice(idx, 1);
     window.saveAcData();
     window.acRenderSubjects();
  });
};

window.acDeleteItemConfirm = function(key, idx) {
  window.acConfirmModal("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?", function() {
      const deletedVal = window.acData[key][idx];
      window.acData[key].splice(idx, 1); 
      if(key === 'years' && window.acData.activeYear === deletedVal) window.acData.activeYear = window.acData.years[0] || "";
      if(key === 'semesters' && window.acData.activeSemester === deletedVal) window.acData.activeSemester = window.acData.semesters[0] || "";
      window.saveAcData(); window.acRenderSetup(); window.loadAcademicView();
  });
};

// --- TAB 2: មុខវិជ្ជា & គ្រូ (Subjects) ---
window.acRenderSubjects = function() {
  const c = document.getElementById("academicTabContent-subjects");
  if(!c) return;

  const searchQuery = document.getElementById("acSubjectSearch")?.value.toLowerCase() || "";
  const filteredSubjects = window.acData.subjects.filter(s => 
      s.name.toLowerCase().includes(searchQuery) || 
      s.code.toLowerCase().includes(searchQuery) || 
      s.teacher.toLowerCase().includes(searchQuery)
  );

  let tbody = "";
  if (filteredSubjects.length === 0) {
     tbody = `<tr><td colspan="6" class="p-20 text-center text-slate-400 font-bold bg-slate-50 border-b border-slate-100 rounded-b-3xl">
        <div class="text-4xl mb-4 text-slate-300"><i class="fa-solid fa-folder-open"></i></div>
        មិនមានទិន្នន័យមុខវិជ្ជាទេ!
     </td></tr>`;
  } else {
     filteredSubjects.forEach((sub, idx) => {
        let badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
        if(String(sub.curriculum).includes("អនុ")) badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
        if(String(sub.curriculum).includes("វិទ្យា")) badgeColor = "bg-purple-50 text-purple-700 border-purple-100";

        tbody += `
          <tr class="hover:bg-indigo-50/50 transition border-b border-slate-100 bg-white align-middle group">
            <td class="p-4 font-mono text-indigo-600 font-bold text-[13px] text-center"><span class="bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">${sub.code}</span></td>
            <td class="p-4 font-moul text-[14px] text-slate-800">${sub.name}</td>
            <td class="p-4"><span class="${badgeColor} border px-3 py-1.5 rounded-xl text-[11px] font-bold">${sub.curriculum || '-'}</span></td>
            <td class="p-4 text-center"><span class="bg-slate-100 text-slate-600 font-bold px-4 py-1.5 rounded-xl text-[13px]">${toKhmerNumAc(sub.credit.toString())} ម៉ោង</span></td>
            <td class="p-4">
               <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex justify-center items-center text-sm shadow-inner border border-slate-200"><i class="fa-solid fa-user-tie"></i></div> 
                 <span class="font-bold text-[14px] text-slate-700">${sub.teacher}</span>
               </div>
            </td>
            <td class="p-4 text-center">
              <div class="flex justify-center gap-1 opacity-50 group-hover:opacity-100 transition duration-300">
                <button onclick="window.openAcSubjectModal(${window.acData.subjects.indexOf(sub)})" title="កែប្រែ" class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5"><i class="fa-solid fa-pen"></i></button>
                <button onclick="window.acDeleteSubject(${window.acData.subjects.indexOf(sub)})" title="លុប" class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            </td>
          </tr>
        `;
     });
  }

  c.innerHTML = `
    <div class="w-full h-full flex flex-col rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white">
      <div class="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
         <h3 class="font-moul text-slate-700 text-[15px] flex items-center gap-3"><i class="fa-solid fa-book-open text-indigo-500"></i> បញ្ជីមុខវិជ្ជាទាំងអស់</h3>
         <span class="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">សរុប៖ ${toKhmerNumAc(filteredSubjects.length.toString())}</span>
      </div>
      <div class="overflow-x-auto custom-scrollbar flex-1 pb-10">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead class="bg-white border-b-2 border-slate-200 text-slate-400 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10 shadow-sm">
            <tr>
              <th class="p-4 w-[12%] text-center">កូដមុខវិជ្ជា</th>
              <th class="p-4 w-[25%] text-slate-700">ឈ្មោះមុខវិជ្ជា</th>
              <th class="p-4 w-[20%]">កម្មវិធីសិក្សា</th>
              <th class="p-4 w-[13%] text-center">ម៉ោង/សប្តាហ៍</th>
              <th class="p-4 w-[20%] text-left">គ្រូបង្រៀន</th>
              <th class="p-4 w-[10%] text-center">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">${tbody}</tbody>
        </table>
      </div>
    </div>
  `;
};

window.acFilterSubjects = function() {
    window.acRenderSubjects();
};

window.openAcSubjectModal = function(idx = null) {
  const m = document.getElementById("acSubjectModal");
  if(!m) return;
  document.getElementById("acSubjectForm").reset();

  const curOptions = window.acData.curriculums.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById("ac_sub_curriculum").innerHTML = curOptions;

  if (idx !== null && window.acData.subjects[idx]) {
     const sub = window.acData.subjects[idx];
     document.getElementById("ac_sub_idx").value = idx;
     document.getElementById("ac_sub_name").value = sub.name;
     document.getElementById("ac_sub_code").value = sub.code;
     document.getElementById("ac_sub_curriculum").value = sub.curriculum || window.acData.curriculums[0];
     document.getElementById("ac_sub_credit").value = sub.credit;
     document.getElementById("ac_sub_teacher").value = sub.teacher;
     document.getElementById("acSubModalTitle").innerHTML = `<div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg"><i class="fa-solid fa-pen"></i></div> កែប្រែមុខវិជ្ជា`;
  } else {
     document.getElementById("ac_sub_idx").value = "";
     document.getElementById("ac_sub_code").value = "SUB-" + Math.floor(100 + Math.random()*900);
     document.getElementById("acSubModalTitle").innerHTML = `<div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg"><i class="fa-solid fa-plus"></i></div> បន្ថែមមុខវិជ្ជាថ្មី`;
  }
  m.classList.remove("hidden"); m.classList.add("flex");
};

window.saveAcSubject = function(e) {
  e.preventDefault();
  const idx = document.getElementById("ac_sub_idx").value;
  const payload = {
    id: "SUB" + Date.now(),
    name: document.getElementById("ac_sub_name").value,
    code: document.getElementById("ac_sub_code").value,
    curriculum: document.getElementById("ac_sub_curriculum").value,
    credit: document.getElementById("ac_sub_credit").value,
    teacher: document.getElementById("ac_sub_teacher").value
  };
  if (idx !== "") window.acData.subjects[idx] = payload;
  else window.acData.subjects.push(payload);
  window.saveAcData();
  document.getElementById("acSubjectModal").classList.replace("flex", "hidden");
  window.acRenderSubjects();
};

// --- TAB 3: កាលវិភាគ (Timetable - Multi-View) ---
window.currentTimetableView = 'class'; 

window.acRenderTimetableRoot = function() {
  const c = document.getElementById("academicTabContent-timetable");
  if(!c) return;

  c.innerHTML = `
    <div class="w-full flex flex-col h-full min-h-0 bg-slate-50/50 p-2 md:p-6 rounded-3xl">
       <div class="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 mb-6 shadow-sm shrink-0 w-full">
          <div class="flex flex-col md:flex-row gap-4 items-start md:items-center w-full justify-between">
             <div class="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-1 overflow-x-auto w-full md:w-auto custom-scrollbar">
                <button onclick="window.switchTimetableView('class')" id="tt-tab-class" class="px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap text-teal-600 bg-white shadow-sm ring-1 ring-slate-200">ថ្នាក់រៀន</button>
                <button onclick="window.switchTimetableView('teacher')" id="tt-tab-teacher" class="px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap text-slate-500 hover:text-slate-800 hover:bg-slate-200/50">គ្រូបង្រៀន</button>
                <button onclick="window.switchTimetableView('room')" id="tt-tab-room" class="px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap text-slate-500 hover:text-slate-800 hover:bg-slate-200/50">បន្ទប់រៀន</button>
                <button onclick="window.switchTimetableView('exam')" id="tt-tab-exam" class="px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap text-slate-500 hover:text-slate-800 hover:bg-slate-200/50">ប្រឡង</button>
             </div>
             <button onclick="window.acNotifyChanges()" class="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold shadow-sm transition transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap">
               <i class="fa-solid fa-bell animate-bounce"></i> ជូនដំណឹង (Notify)
             </button>
          </div>
       </div>

       <div id="timetableFilterArea" class="flex flex-wrap gap-4 mb-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0"></div>

       <div class="overflow-auto rounded-3xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] bg-white print:border-none print:shadow-none flex-1 w-full min-h-0 custom-scrollbar relative pb-6" id="timetableGridArea">
          <div class="p-20 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-indigo-400"></i><br>កំពុងរៀបចំទិន្នន័យ...</div>
       </div>
    </div>
  `;
  window.switchTimetableView('class'); 
};

window.switchTimetableView = function(view) {
  window.currentTimetableView = view;

  ["class", "teacher", "room", "exam"].forEach(t => {
      const btn = document.getElementById(`tt-tab-${t}`);
      if(btn) btn.className = "px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap text-slate-500 hover:text-slate-800 hover:bg-slate-200/50";
  });
  
  const activeBtn = document.getElementById(`tt-tab-${view}`);
  if(activeBtn) activeBtn.className = "px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap text-teal-600 bg-white shadow-sm ring-1 ring-slate-200";

  const filterArea = document.getElementById("timetableFilterArea");
  if(filterArea) {
      if(view === 'class') {
          const gradesOptions = window.acData.grades.map(g => `<option value="${g}">${g}</option>`).join('');
          const roomsOptions = window.acData.rooms.map(r => `<option value="${r}">បន្ទប់ ${r}</option>`).join('');
          filterArea.innerHTML = `
              <div class="flex items-center gap-2">
                 <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center"><i class="fa-solid fa-layer-group"></i></div>
                 <span class="text-xs font-bold text-slate-500 uppercase mr-1">ជ្រើសរើសថ្នាក់៖</span>
              </div>
              <select id="ttLevel" onchange="window.renderTimetableGridData()" class="bg-white border-2 border-slate-100 hover:border-teal-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-sm transition">${gradesOptions}</select>
              <select id="ttRoom" onchange="window.renderTimetableGridData()" class="bg-white border-2 border-slate-100 hover:border-teal-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-sm transition">${roomsOptions}</select>
          `;
      } 
      else if(view === 'teacher') {
          const teachers = [...new Set(window.acData.subjects.map(s => s.teacher))].filter(Boolean);
          const tOptions = teachers.map(t => `<option value="${t}">${t}</option>`).join('');
          filterArea.innerHTML = `
              <div class="flex items-center gap-2">
                 <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><i class="fa-solid fa-user-tie"></i></div>
                 <span class="text-xs font-bold text-slate-500 uppercase mr-1">ជ្រើសរើសគ្រូបង្រៀន៖</span>
              </div>
              <select id="ttTeacher" onchange="window.renderTimetableGridData()" class="bg-white border-2 border-slate-100 hover:border-blue-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-64 shadow-sm transition">${tOptions || '<option>គ្មានទិន្នន័យគ្រូ</option>'}</select>
          `;
      }
      else if(view === 'room') {
          const rOptions = window.acData.rooms.map(r => `<option value="${r}">បន្ទប់ ${r}</option>`).join('');
          filterArea.innerHTML = `
              <div class="flex items-center gap-2">
                 <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><i class="fa-solid fa-door-open"></i></div>
                 <span class="text-xs font-bold text-slate-500 uppercase mr-1">ជ្រើសរើសបន្ទប់៖</span>
              </div>
              <select id="ttRoomFilter" onchange="window.renderTimetableGridData()" class="bg-white border-2 border-slate-100 hover:border-rose-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer w-48 shadow-sm transition">${rOptions}</select>
          `;
      }
      else if(view === 'exam') {
          const gradesOptions = window.acData.grades.map(g => `<option value="${g}">${g}</option>`).join('');
          filterArea.innerHTML = `
              <div class="flex items-center gap-2">
                 <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><i class="fa-solid fa-file-pen"></i></div>
                 <span class="text-xs font-bold text-slate-500 uppercase mr-1">ការប្រឡង៖</span>
              </div>
              <select id="ttExamLevel" onchange="window.renderTimetableGridData()" class="bg-white border-2 border-slate-100 hover:border-amber-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm transition">${gradesOptions}</select>
              <select id="ttExamType" onchange="window.renderTimetableGridData()" class="bg-white border-2 border-slate-100 hover:border-amber-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm transition">
                 <option value="ប្រចាំខែ">ប្រឡងប្រចាំខែ</option>
                 <option value="ប្រចាំឆមាស">ប្រឡងប្រចាំឆមាស</option>
              </select>
          `;
      }
  }

  window.renderTimetableGridData();
};

window.renderTimetableGridData = function() {
  const gridArea = document.getElementById("timetableGridArea");
  if (!gridArea) return;

  const view = window.currentTimetableView;
  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាចំណេះទូទៅ គំរូ";
  const academicYear = window.acData.activeYear;

  let filterTitle = "";
  let timetableId = "";
  let headerColor = "bg-teal-600 border-teal-700";
  let idPrefix = "";

  if(view === 'class') {
      const level = document.getElementById("ttLevel")?.value || "";
      const room = document.getElementById("ttRoom")?.value || "";
      filterTitle = `ថ្នាក់ ${level} ${room}`;
      timetableId = `${level}_${room}_fullday`;
      headerColor = "bg-teal-600 border-teal-700 text-white";
      idPrefix = "ttc_";
  } else if(view === 'teacher') {
      const t = document.getElementById("ttTeacher")?.value || "";
      filterTitle = `គ្រូបង្រៀន៖ ${t}`;
      timetableId = `teacher_${t}_fullday`;
      headerColor = "bg-blue-600 border-blue-700 text-white";
      idPrefix = "ttt_";
  } else if(view === 'room') {
      const r = document.getElementById("ttRoomFilter")?.value || "";
      filterTitle = `កាលវិភាគបន្ទប់ ${r}`;
      timetableId = `room_${r}_fullday`;
      headerColor = "bg-rose-600 border-rose-700 text-white";
      idPrefix = "ttr_";
  } else if(view === 'exam') {
      const el = document.getElementById("ttExamLevel")?.value || "";
      const et = document.getElementById("ttExamType")?.value || "";
      filterTitle = `ការ${et} - ថ្នាក់ ${el}`;
      timetableId = `exam_${el}_${et}`;
      headerColor = "bg-amber-500 border-amber-600 text-white";
      idPrefix = "tte_";
  }

  const savedTimetable = window.acData.timetables.find(t => t.id === timetableId);
  let parsedData = {};
  if (savedTimetable && savedTimetable.data) {
      try { parsedData = JSON.parse(savedTimetable.data); } catch(e) {}
  }

  let times = [];
  if(view === 'exam') {
      times = ['០៧:៣០ - ០៩:០០', '០៩:០០ - ០៩:៣០', '០៩:៣០ - ១១:០០', '១۴:០០ - ១៥:៣០', '១៥:៣០ - ១៧:០០'];
  } else {
      times = ['០៧:០០ - ០៧:៤០', '០៧:៤០ - ០៨:២០', '០៨:២០ - ០៩:០០', '០៩:០០ - ០៩:២០', '០៩:២០ - ១០:០០', '១០:០០ - ១០:៤០', '១០:៤០ - ១៣:០០', '១៣:០០ - ១៣:៤០', '១៣:៤០ - ១៤:២០', '១៤:២០ - ១៥:០០', '១៥:០០ - ១៥:២០', '១៥:២០ - ១៦:០០', '១៦:០០ - ១៦:៤០'];
  }

  let tbodyHtml = '';
  times.forEach((time, r) => {
      if (view !== 'exam') {
          if (r === 3 || r === 10) {
              tbodyHtml += `
                  <tr class="bg-slate-100 font-bold text-slate-500 text-center text-[11px] md:text-[12px] h-8 md:h-10 border-y-[2px] border-slate-300 print:border-black print:h-[26px]">
                      <td class="border-r-[2px] border-slate-300 print:border-black p-1 md:p-2 font-mono text-slate-700 sticky left-0 z-20 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none">${time}</td>
                      <td colspan="6" class="p-1 md:p-2 tracking-[10px] uppercase font-moul text-slate-400 print:text-black select-none">ម៉ោងចេញលេង</td>
                  </tr>
              `;
          } else if (r === 6) {
              tbodyHtml += `
                  <tr class="bg-slate-200/60 font-bold text-slate-600 text-center text-[12px] md:text-[13px] h-10 md:h-12 border-y-[2px] border-slate-400 print:border-black print:h-[30px]">
                      <td class="border-r-[2px] border-slate-400 print:border-black p-1 md:p-2 font-mono text-slate-700 print:text-black sticky left-0 z-20 bg-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none">${time}</td>
                      <td colspan="6" class="p-1 md:p-2 tracking-[15px] uppercase font-moul print:text-black select-none">ម៉ោងសម្រាកថ្ងៃត្រង់</td>
                  </tr>
              `;
          } else {
              tbodyHtml += `<tr class="text-center text-[11px] md:text-[13px] h-10 md:h-14 border-b border-slate-200 print:border-black bg-white transition print:h-[28px]">
                  <td class="border-r-[2px] border-slate-300 print:border-black p-1 font-mono font-bold text-slate-600 print:text-black sticky left-0 z-20 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] print:shadow-none">${time}</td>`;
              for(let d = 0; d < 6; d++) {
                  let placeholder = (view==='teacher') ? "ថ្នាក់ / បន្ទប់" : ((view==='room') ? "ថ្នាក់ / គ្រូ" : "មុខវិជ្ជា / គ្រូ");
                  const cellValue = parsedData[`${r}_${d}`] || "";
                  tbodyHtml += `<td id="${idPrefix}${r}_${d}" contenteditable="true" data-placeholder="${placeholder}" class="border-r border-slate-200 print:border-black p-1 md:p-2 outline-none hover:bg-indigo-50 focus:bg-indigo-50/50 focus:ring-inset focus:ring-2 focus:ring-indigo-300 cursor-text transition-colors duration-200 font-bold text-slate-800 font-moul print:text-black leading-tight empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:font-siemreap empty:before:font-normal">${cellValue}</td>`;
              }
              tbodyHtml += `</tr>`;
          }
      } 
      else {
          if (r === 1) { 
              tbodyHtml += `<tr class="bg-slate-100 font-bold text-slate-500 text-center border-y-[2px] border-slate-300 print:border-black h-10"><td class="border-r-[2px] border-slate-300 print:border-black p-2 font-mono text-slate-700 sticky left-0 bg-slate-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">${time}</td><td colspan="6" class="tracking-[10px] uppercase font-moul">ម៉ោងសម្រាក</td></tr>`;
          } else {
              tbodyHtml += `<tr class="text-center text-[13px] h-14 border-b border-slate-200 print:border-black bg-white transition"><td class="border-r-[2px] border-slate-300 print:border-black p-2 font-mono font-bold text-slate-600 sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">${time}</td>`;
              for(let d = 0; d < 6; d++) {
                  const cellValue = parsedData[`${r}_${d}`] || "";
                  tbodyHtml += `<td id="${idPrefix}${r}_${d}" contenteditable="true" data-placeholder="មុខវិជ្ជា / អនុរក្ស" class="border-r border-slate-200 print:border-black p-2 outline-none hover:bg-amber-50 focus:bg-amber-50/50 focus:ring-inset focus:ring-2 focus:ring-amber-300 cursor-text transition-colors font-bold text-slate-800 font-moul leading-tight empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:font-siemreap empty:before:font-normal">${cellValue}</td>`;
              }
              tbodyHtml += `</tr>`;
          }
      }
  });

  let daysHeader = `<th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">ចន្ទ</th><th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">អង្គារ</th><th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">ពុធ</th><th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">ព្រហស្បតិ៍</th><th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">សុក្រ</th><th class="p-3 w-[14%] print:border-black border-r border-slate-300/30 font-moul">សៅរ៍</th>`;
  
  if(view === 'exam') {
      daysHeader = `<th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">ថ្ងៃទី១</th><th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">ថ្ងៃទី២</th><th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">ថ្ងៃទី៣</th><th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">ថ្ងៃទី៤</th><th class="border-r border-slate-300/30 print:border-black p-3 w-[14%] font-moul">ថ្ងៃទី៥</th><th class="p-3 w-[14%] print:border-black border-r border-slate-300/30 font-moul">ថ្ងៃទី៦</th>`;
  }

  const btnSave = document.getElementById("btnSaveTimetable");
  if(btnSave) btnSave.setAttribute("onclick", `window.acSaveTimetableData('${view}', '${timetableId}', '${idPrefix}')`);

  gridArea.innerHTML = `
      <div id="printTimetableTarget" class="w-max min-w-full lg:w-full lg:max-w-[1050px] mx-auto bg-white p-4 print:p-0 h-max mb-10">
          
          <div class="hidden print:flex justify-between items-start mb-8 text-[12px] font-bold leading-relaxed">
             <div class="text-left font-moul">
               <p>ការិយាល័យអប់រំ យុវជន និងកីឡា</p>
               <p class="mt-1">${schoolName}</p>
             </div>
             <div class="text-center font-moul">
               <p class="text-[14px]">ព្រះរាជាណាចក្រកម្ពុជា</p>
               <p class="text-[13px] mt-0.5">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
               <div class="tracking-[4px] mt-1 text-slate-600 font-siemreap text-[10px]">* * * 📖 * * *</div>
             </div>
          </div>

          <div class="text-center mb-6 sticky left-0 print:static">
             <h3 class="font-moul text-lg md:text-xl text-slate-800 print:text-black uppercase tracking-wider">កាលវិភាគ <span class="text-indigo-600 print:text-black">${filterTitle}</span></h3>
             <p class="font-bold text-[12px] md:text-sm text-slate-600 mt-2 font-siemreap">
               <span class="mr-6">ឆ្នាំសិក្សា៖ <span class="font-moul text-slate-800 print:text-black">${toKhmerNumAc(academicYear)}</span></span>
             </p>
          </div>

          <div class="rounded-2xl overflow-hidden print:rounded-none">
            <table class="w-full border-collapse border-[2px] border-slate-300 print:border-black table-fixed bg-white relative">
                <thead class="${headerColor} print:bg-slate-100 text-[12px] md:text-sm tracking-wider border-b-[2px] border-slate-300 print:border-black h-12 print:h-[35px] sticky top-0 z-30">
                    <tr>
                        <th class="border-r-[2px] border-slate-300/30 print:border-black p-2 w-[16%] sticky left-0 ${headerColor} print:bg-slate-100 z-40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)] print:shadow-none font-siemreap">ម៉ោងសិក្សា</th>
                        ${daysHeader}
                    </tr>
                </thead>
                <tbody class="text-slate-800 print:text-black">
                    ${tbodyHtml}
                </tbody>
            </table>
          </div>

          <div class="hidden print:flex justify-between mt-10 text-[11px] font-bold px-12">
              <div class="text-center">
                  <p class="mb-1 font-siemreap">បានឃើញ និងឯកភាព</p>
                  <p class="font-moul mb-20 mt-2 text-[12px]">នាយកសាលា</p>
              </div>
              <div class="text-center">
                  <p class="mb-1 font-normal font-siemreap whitespace-nowrap">ធ្វើនៅ..................., ថ្ងៃទី........ ខែ........ ឆ្នាំ ២០២...</p>
                  <p class="font-moul mb-20 mt-2 text-[12px]">គណៈកម្មការរៀបចំ</p>
              </div>
          </div>
      </div>
  `;
};

window.acSaveTimetableData = function(view, timetableId, idPrefix) {
  const btnSave = document.getElementById("btnSaveTimetable");
  if (btnSave) {
      btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងរក្សាទុក...`;
      btnSave.classList.add("opacity-75", "pointer-events-none");
  }

  const cellData = {};
  const maxRows = (view === 'exam') ? 4 : 12;
  
  for(let r = 0; r <= maxRows; r++) {
      if(view !== 'exam' && (r === 3 || r === 6 || r === 10)) continue; 
      if(view === 'exam' && r === 1) continue;
      
      for(let d = 0; d < 6; d++) {
          const cell = document.getElementById(`${idPrefix}${r}_${d}`);
          if(cell) cellData[`${r}_${d}`] = cell.innerText.trim();
      }
  }

  const payload = {
      id: timetableId, class_name: timetableId, shift: view, data: JSON.stringify(cellData)
  };

  const existingIdx = window.acData.timetables.findIndex(t => t.id === timetableId);
  if(existingIdx > -1) window.acData.timetables[existingIdx] = payload;
  else window.acData.timetables.push(payload);
  
  window.saveAcData();

  if (typeof showToast === 'function') showToast("✅ រក្សាទុកកាលវិភាគជោគជ័យ!");
  else alert("រក្សាទុកជោគជ័យ!");

  setTimeout(() => {
    if (btnSave) {
        btnSave.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> រក្សាទុក`;
        btnSave.classList.remove("opacity-75", "pointer-events-none");
    }
  }, 1000);
};

window.acNotifyChanges = function() {
    window.acConfirmModal("តើអ្នកពិតជាចង់ផ្ញើសារជូនដំណឹងពីការផ្លាស់ប្តូរកាលវិភាគនេះ ទៅកាន់គ្រូ និងសិស្សពាក់ព័ន្ធមែនទេ?", function() {
        if(typeof showToast === 'function') showToast("🔔 សារជូនដំណឹងត្រូវបានបញ្ជូនជោគជ័យ (App & Telegram)!");
        else alert("🔔 សារជូនដំណឹងត្រូវបានបញ្ជូនជោគជ័យ (App & Telegram)!");
    });
};

window.printAcTimetable = function() {
  const printArea = document.getElementById("printTimetableTarget");
  if(!printArea) return alert("រកមិនឃើញទិន្នន័យដើម្បីបោះពុម្ពទេ!");

  const clonedArea = printArea.cloneNode(true);
  const allEls = clonedArea.querySelectorAll('*');
  allEls.forEach(el => {
      el.className = el.className.replace(/sticky/g, "").replace(/left-0/g, "").replace(/z-[0-9]+/g, "").replace(/shadow-[^"'\s]*/g, "");
  });

  const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8"><title>បោះពុម្ពកាលវិភាគ</title><script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'Times New Roman', 'Khmer OS Siemreap', 'Siemreap', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white; margin: 0; padding: 0; }
          .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal !important; }
          .font-siemreap { font-family: 'Times New Roman', 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
          table { width: 100%; border-collapse: collapse; border: 2px solid black !important; }
          th, td { border: 1px solid black !important; padding: 6px !important; }
          th { border-bottom: 2px solid black !important; }
        </style>
      </head>
      <body>${clonedArea.outerHTML}</body>
      </html>
  `;
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  printWindow.document.open(); printWindow.document.write(printDocument); printWindow.document.close();
  setTimeout(() => { printWindow.focus(); printWindow.print(); }, 1000);
};

// --- TAB 4: ផែនការ & តាមដានបង្រៀន (Lesson Plans) ---
window.acRenderLessons = function() {
  const c = document.getElementById("academicTabContent-lessons");
  if(!c) return;

  const pending = window.acData.lessons.filter(l => l.status === "pending");
  const progress = window.acData.lessons.filter(l => l.status === "progress");
  const completed = window.acData.lessons.filter(l => l.status === "completed");

  const totalLessons = window.acData.lessons.length;
  const compPercent = totalLessons === 0 ? 0 : Math.round((completed.length / totalLessons) * 100);

  const buildCards = (list) => {
    if(list.length === 0) return `<div class="p-10 text-center text-slate-400 text-sm font-bold border-2 border-dashed border-slate-200 rounded-2xl w-full flex flex-col items-center justify-center h-full"><i class="fa-solid fa-folder-open text-3xl mb-3 text-slate-200"></i> ទទេ</div>`;
    return list.map(l => {
      let subjectBadge = `<span class="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">${l.subject}</span>`;
      if(l.subject.includes("គណិត")) subjectBadge = `<span class="text-[11px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-200 shadow-sm">${l.subject}</span>`;
      else if(l.subject.includes("ខ្មែរ")) subjectBadge = `<span class="text-[11px] font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-lg border border-rose-200 shadow-sm">${l.subject}</span>`;
      else if(l.subject.includes("រូប") || l.subject.includes("គីមី")) subjectBadge = `<span class="text-[11px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg border border-emerald-200 shadow-sm">${l.subject}</span>`;

      let dateStr = l.date || "-";
      if(dateStr.includes("-")) {
         const p = dateStr.split("-");
         if(p.length===3 && p[0].length===4) dateStr = `${toKhmerNumAc(p[2])}/${toKhmerNumAc(p[1])}/${toKhmerNumAc(p[0])}`;
      }

      let barColor = "bg-slate-200"; let barWidth = "0%"; let titleClass = "text-slate-800 font-moul";
      if(l.status === "progress") { barColor = "bg-blue-500"; barWidth = "50%"; }
      else if(l.status === "completed") { barColor = "bg-emerald-500"; barWidth = "100%"; titleClass = "text-slate-400 font-moul line-through decoration-emerald-300"; }

      return `
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer relative group w-full" onclick="window.openAcLessonModal('${l.id}')">
           <div class="flex justify-between items-start mb-4">
             ${subjectBadge}
             <span class="text-[11px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-full"><i class="fa-regular fa-clock"></i> ${dateStr}</span>
           </div>
           <h5 class="text-[14px] ${titleClass} mb-4 leading-snug">${l.title}</h5>
           <p class="text-[12px] text-slate-500 font-bold mb-4 flex items-center gap-2"><div class="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-400"><i class="fa-solid fa-layer-group text-[10px]"></i></div> ${l.grade}</p>
           <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div class="${barColor} h-1.5 rounded-full transition-all duration-1000" style="width: ${barWidth}"></div></div>
           
           <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex gap-2 bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-slate-100 scale-90 group-hover:scale-100 transition-transform origin-center">
             <button onclick="event.stopPropagation(); window.acChangeLessonStatus('${l.id}', 'pending')" class="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 text-sm shadow-sm transform hover:scale-110 transition" title="មិនទាន់បង្រៀន"><i class="fa-solid fa-pause"></i></button>
             <button onclick="event.stopPropagation(); window.acChangeLessonStatus('${l.id}', 'progress')" class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white text-sm shadow-sm transform hover:scale-110 transition" title="កំពុងបង្រៀន"><i class="fa-solid fa-play"></i></button>
             <button onclick="event.stopPropagation(); window.acChangeLessonStatus('${l.id}', 'completed')" class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white text-sm shadow-sm transform hover:scale-110 transition" title="បញ្ចប់"><i class="fa-solid fa-check"></i></button>
           </div>
        </div>
      `;
    }).join('');
  };

  c.innerHTML = `
    <div class="h-full flex flex-col w-full min-h-0 bg-slate-50/50 p-2 md:p-6 rounded-3xl">
       <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm mb-6 shrink-0 flex flex-col md:flex-row items-center gap-8 w-full transition hover:shadow-md">
          <div class="w-32 h-32 rounded-full border-[6px] border-slate-50 relative flex items-center justify-center shrink-0 shadow-inner">
             <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="58" cy="58" r="52" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-100" />
                <circle cx="58" cy="58" r="52" stroke="currentColor" stroke-width="12" fill="transparent" stroke-dasharray="${2 * Math.PI * 52}" stroke-dashoffset="${2 * Math.PI * 52 * (1 - compPercent/100)}" class="text-emerald-500 transition-all duration-1000 drop-shadow-md" stroke-linecap="round" />
             </svg>
             <div class="text-center">
                <span class="text-3xl font-black text-slate-800 font-mono drop-shadow-sm">${compPercent}%</span>
             </div>
          </div>
          <div class="flex-1 w-full text-center md:text-left">
             <h3 class="font-moul text-slate-800 text-xl flex justify-center md:justify-start items-center gap-3"><div class="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl text-lg shadow-sm border border-emerald-100"><i class="fa-solid fa-chart-line"></i></div> ការតាមដានការបង្រៀន</h3>
             <p class="text-sm text-slate-500 mt-2 font-bold ml-0 md:ml-12">វឌ្ឍនភាពនៃការអនុវត្តកម្មវិធីសិក្សា និងកិច្ចតែងការបង្រៀនប្រចាំឆ្នាំ។</p>
             <div class="mt-5 flex flex-wrap justify-center md:justify-start gap-4 w-full">
                <div class="bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] px-6 py-3 rounded-2xl border border-slate-200"><span class="text-[11px] text-slate-400 block uppercase font-bold mb-1"><i class="fa-solid fa-box-open mr-1"></i> មេរៀនសរុប</span><span class="text-2xl font-black text-slate-700 font-mono">${toKhmerNumAc(totalLessons.toString())}</span></div>
                <div class="bg-blue-50 shadow-sm px-6 py-3 rounded-2xl border border-blue-200"><span class="text-[11px] text-blue-500 block uppercase font-bold mb-1"><i class="fa-solid fa-spinner fa-spin-pulse mr-1"></i> កំពុងបង្រៀន</span><span class="text-2xl font-black text-blue-700 font-mono">${toKhmerNumAc(progress.length.toString())}</span></div>
                <div class="bg-emerald-50 shadow-sm px-6 py-3 rounded-2xl border border-emerald-200"><span class="text-[11px] text-emerald-500 block uppercase font-bold mb-1"><i class="fa-solid fa-check-double mr-1"></i> បានបញ្ចប់</span><span class="text-2xl font-black text-emerald-700 font-mono">${toKhmerNumAc(completed.length.toString())}</span></div>
             </div>
          </div>
       </div>

       <!-- Kanban Board Area -->
       <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px] w-full pb-6">
          <div class="bg-slate-100/70 p-5 rounded-[2rem] border border-slate-200 flex flex-col h-full w-full">
             <h4 class="font-moul text-slate-600 mb-5 pb-4 border-b border-slate-200 flex justify-between items-center text-[15px]">
                <span class="flex items-center gap-2"><div class="w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div> មិនទាន់បង្រៀន</span>
                <span class="bg-white text-slate-600 font-mono px-3 py-1 rounded-xl text-sm shadow-sm font-black border border-slate-100">${toKhmerNumAc(pending.length.toString())}</span>
             </h4>
             <div class="space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-10 content-start w-full pr-1">${buildCards(pending)}</div>
          </div>
          <div class="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100 flex flex-col h-full w-full">
             <h4 class="font-moul text-blue-700 mb-5 pb-4 border-b border-blue-200 flex justify-between items-center text-[15px]">
                <span class="flex items-center gap-2"><div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm animate-pulse"></div> កំពុងបង្រៀន</span>
                <span class="bg-white text-blue-600 font-mono px-3 py-1 rounded-xl text-sm shadow-sm font-black border border-blue-100">${toKhmerNumAc(progress.length.toString())}</span>
             </h4>
             <div class="space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-10 content-start w-full pr-1">${buildCards(progress)}</div>
          </div>
          <div class="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100 flex flex-col h-full w-full">
             <h4 class="font-moul text-emerald-700 mb-5 pb-4 border-b border-emerald-200 flex justify-between items-center text-[15px]">
                <span class="flex items-center gap-2"><div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div> បានបញ្ចប់</span>
                <span class="bg-white text-emerald-600 font-mono px-3 py-1 rounded-xl text-sm shadow-sm font-black border border-emerald-100">${toKhmerNumAc(completed.length.toString())}</span>
             </h4>
             <div class="space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-10 content-start w-full pr-1">${buildCards(completed)}</div>
          </div>
       </div>
    </div>
  `;
};

window.acChangeLessonStatus = function(id, newStatus) {
  const idx = window.acData.lessons.findIndex(l => l.id === id);
  if(idx > -1) { window.acData.lessons[idx].status = newStatus; window.saveAcData(); window.acRenderLessons(); }
};

window.openAcLessonModal = function(id = null) {
  const lm = document.getElementById("acLessonModal");
  if(!lm) return;
  document.getElementById("acLessonForm").reset();

  const subjectsOptions = window.acData.subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
  const gradesOptions = window.acData.grades.map(g => `<option value="${g}">${g}</option>`).join('');
  document.getElementById("ac_les_subject").innerHTML = subjectsOptions;
  document.getElementById("ac_les_grade").innerHTML = gradesOptions;

  if (id) {
     const l = window.acData.lessons.find(x => x.id === id);
     if(l) {
       document.getElementById("ac_les_id").value = l.id;
       document.getElementById("ac_les_title").value = l.title;
       document.getElementById("ac_les_subject").value = l.subject;
       document.getElementById("ac_les_grade").value = l.grade;
       document.getElementById("ac_les_date").value = l.date;
       document.getElementById("ac_les_status").value = l.status;
       document.getElementById("acLessonModalTitle").innerHTML = `<div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg"><i class="fa-solid fa-pen"></i></div> កែប្រែផែនការបង្រៀន`;
       document.getElementById("acBtnDeleteLesson").classList.remove("hidden");
     }
  } else {
     document.getElementById("ac_les_id").value = "";
     document.getElementById("ac_les_date").value = new Date().toISOString().split('T')[0];
     document.getElementById("acLessonModalTitle").innerHTML = `<div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg"><i class="fa-solid fa-plus"></i></div> បន្ថែមផែនការបង្រៀនថ្មី`;
     document.getElementById("acBtnDeleteLesson").classList.add("hidden");
  }

  lm.classList.remove("hidden"); lm.classList.add("flex");
};

window.saveAcLesson = function(e) {
  e.preventDefault();
  let id = document.getElementById("ac_les_id").value;
  const payload = {
    id: id || "LSN" + Date.now(),
    title: document.getElementById("ac_les_title").value,
    subject: document.getElementById("ac_les_subject").value,
    grade: document.getElementById("ac_les_grade").value,
    date: document.getElementById("ac_les_date").value,
    status: document.getElementById("ac_les_status").value
  };

  if (id) {
     const idx = window.acData.lessons.findIndex(x => x.id === id);
     if(idx > -1) window.acData.lessons[idx] = payload;
  } else {
     window.acData.lessons.push(payload);
  }

  window.saveAcData();
  document.getElementById("acLessonModal").classList.replace("flex", "hidden");
  window.acRenderLessons();
};

window.deleteAcLesson = function() {
  const id = document.getElementById("ac_les_id").value;
  if(id) {
     window.acConfirmModal("តើអ្នកពិតជាចង់លុបផែនការបង្រៀននេះមែនទេ?", function() {
         window.acData.lessons = window.acData.lessons.filter(x => x.id !== id);
         window.saveAcData();
         document.getElementById("acLessonModal").classList.replace("flex", "hidden");
         window.acRenderLessons();
     });
  }
};

// ==========================================
// 4. Custom Modals រួមបញ្ចូលគ្នា (Modals/Prompts)
// ==========================================
window.acRenderModals = function() {
  const container = document.getElementById("acModalsContainer");
  if(!container) return;
  container.innerHTML = `
    <!-- Subject Modal -->
    <div id="acSubjectModal" class="fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 transition-opacity">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-transform scale-100 border border-slate-100 relative">
        <button type="button" onclick="document.getElementById('acSubjectModal').classList.replace('flex','hidden')" class="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button>
        <h3 id="acSubModalTitle" class="font-moul text-lg text-slate-800 mb-6 flex items-center gap-3"></h3>
        <form id="acSubjectForm" onsubmit="window.saveAcSubject(event)">
          <input type="hidden" id="ac_sub_idx">
          <div class="space-y-5 mb-8">
            <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">ឈ្មោះមុខវិជ្ជា <span class="text-rose-500">*</span></label><input type="text" id="ac_sub_name" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-300 transition font-moul text-indigo-700"></div>
            <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">កម្មវិធីសិក្សា</label><select id="ac_sub_curriculum" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-300 transition cursor-pointer"></select></div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">កូដមុខវិជ្ជា</label><input type="text" id="ac_sub_code" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold font-mono outline-none focus:bg-white focus:border-indigo-300 transition"></div>
              <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">ម៉ោង/សប្តាហ៍</label><input type="number" id="ac_sub_credit" value="2" min="1" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold font-mono outline-none focus:bg-white focus:border-indigo-300 transition text-center"></div>
            </div>
            <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">គ្រូបង្រៀន</label><input type="text" id="ac_sub_teacher" placeholder="ឈ្មោះលោកគ្រូ/អ្នកគ្រូ" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-300 transition"></div>
          </div>
          <button type="submit" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5">រក្សាទុកមុខវិជ្ជា</button>
        </form>
      </div>
    </div>

    <!-- Lesson Modal -->
    <div id="acLessonModal" class="fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 transition-opacity">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-transform scale-100 border border-slate-100 relative">
        <button type="button" onclick="document.getElementById('acLessonModal').classList.replace('flex','hidden')" class="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button>
        <h3 id="acLessonModalTitle" class="font-moul text-lg text-slate-800 mb-6 flex items-center gap-3"></h3>
        <form id="acLessonForm" onsubmit="window.saveAcLesson(event)">
          <input type="hidden" id="ac_les_id">
          <div class="space-y-5 mb-8">
            <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">ចំណងជើងមេរៀន <span class="text-rose-500">*</span></label><input type="text" id="ac_les_title" required placeholder="ឧ. មេរៀនទី១៖..." class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold font-moul text-indigo-700 outline-none focus:bg-white focus:border-indigo-300 transition"></div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">មុខវិជ្ជា</label><select id="ac_les_subject" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-300 transition cursor-pointer"></select></div>
              <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">កម្រិតថ្នាក់</label><select id="ac_les_grade" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-300 transition cursor-pointer"></select></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">កាលបរិច្ឆេទ</label><input type="date" id="ac_les_date" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold font-mono outline-none focus:bg-white focus:border-indigo-300 transition cursor-pointer"></div>
              <div><label class="text-[12px] font-bold text-slate-500 mb-1.5 block">ស្ថានភាពបង្រៀន</label><select id="ac_les_status" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-300 transition cursor-pointer"><option value="pending">មិនទាន់បង្រៀន (Pending)</option><option value="progress">កំពុងបង្រៀន (Progress)</option><option value="completed">បានបញ្ចប់ (Completed)</option></select></div>
            </div>
          </div>
          <div class="flex gap-3">
             <button type="button" id="acBtnDeleteLesson" onclick="window.deleteAcLesson()" class="w-12 h-[52px] rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition flex justify-center items-center shrink-0 border border-rose-100"><i class="fa-solid fa-trash-can"></i></button>
             <button type="submit" class="flex-1 h-[52px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5">រក្សាទុកមេរៀន</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom Generic Prompt Modal -->
    <div id="acGenericPromptModal" class="fixed inset-0 z-[9000] bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 transition-opacity">
       <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-transform scale-100 border border-slate-100 relative">
          <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl mb-4"><i class="fa-solid fa-keyboard"></i></div>
          <h3 id="acPromptTitle" class="font-moul text-slate-800 text-[15px] mb-2"></h3>
          <input type="text" id="acPromptInput" class="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 rounded-xl px-4 py-3 text-sm font-bold outline-none transition mt-3 mb-6 font-siemreap" autocomplete="off">
          <div class="flex gap-3">
             <button type="button" onclick="document.getElementById('acGenericPromptModal').classList.replace('flex','hidden')" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition">បោះបង់</button>
             <button type="button" id="acPromptConfirmBtn" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition">យល់ព្រម</button>
          </div>
       </div>
    </div>

    <!-- Custom Generic Confirm Modal -->
    <div id="acGenericConfirmModal" class="fixed inset-0 z-[9000] bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 transition-opacity">
       <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-transform scale-100 border border-slate-100 relative">
          <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h3 class="font-moul text-slate-800 text-[16px] mb-2">បញ្ជាក់ការលុប</h3>
          <p id="acConfirmMessage" class="text-sm font-bold text-slate-500 mb-6"></p>
          <div class="flex gap-3">
             <button type="button" onclick="document.getElementById('acGenericConfirmModal').classList.replace('flex','hidden')" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition">ទេ បោះបង់</button>
             <button type="button" id="acConfirmYesBtn" class="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md transition">បាទ/ចាស លុប</button>
          </div>
       </div>
    </div>
  `;
};

// ជំនួស prompt()
window.acPromptModal = function(key, title, placeholder) {
   const m = document.getElementById("acGenericPromptModal");
   const input = document.getElementById("acPromptInput");
   const btn = document.getElementById("acPromptConfirmBtn");
   
   document.getElementById("acPromptTitle").innerText = title;
   input.placeholder = placeholder;
   input.value = "";
   
   m.classList.remove("hidden"); m.classList.add("flex");
   setTimeout(() => input.focus(), 100);

   btn.onclick = function() {
      const v = input.value.trim();
      if(v !== "") {
         window.acData[key].push(v); 
         window.saveAcData(); 
         window.acRenderSetup();
      }
      m.classList.replace('flex','hidden');
   };
   input.onkeypress = function(e) { if(e.key === "Enter") btn.click(); };
};

// ជំនួស confirm()
window.acConfirmModal = function(message, onConfirmCallback) {
   const m = document.getElementById("acGenericConfirmModal");
   document.getElementById("acConfirmMessage").innerText = message;
   
   m.classList.remove("hidden"); m.classList.add("flex");
   
   document.getElementById("acConfirmYesBtn").onclick = function() {
      m.classList.replace('flex','hidden');
      if (typeof onConfirmCallback === "function") onConfirmCallback();
   };
};