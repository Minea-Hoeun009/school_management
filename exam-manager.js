// ==========================================
// ឯកសារ js/exam-manager.js - ប្រព័ន្ធគ្រប់គ្រងការប្រឡង (Fixed Tab Switching & Display)
// ==========================================

console.log("✅ ឯកសារ Exam Manager ត្រូវបានភ្ជាប់ជោគជ័យ!");

window.currentExamTab = 'subjects'; 

try { window.examScoresData = JSON.parse(localStorage.getItem('exam_scores_data')) || {}; } catch(e) { window.examScoresData = {}; }

try {
    window.examSubjectsData = JSON.parse(localStorage.getItem('exam_subjects_data'));
    if (!Array.isArray(window.examSubjectsData)) throw new Error();
} catch(e) {
    window.examSubjectsData = [
      { name: "ភាសាខ្មែរ", multiplier: 2, date: "2026-02-12", time: "០៧:៣០ - ០៩:០០", duration: "៩០នាទី" },
      { name: "គណិតវិទ្យា", multiplier: 2, date: "2026-02-12", time: "០៩:១៥ - ១០:៤៥", duration: "៩០នាទី" },
      { name: "រូបវិទ្យា", multiplier: 1, date: "2026-02-13", time: "០៧:៣០ - ០៨:៣០", duration: "៦០នាទី" },
      { name: "គីមីវិទ្យា", multiplier: 1, date: "2026-02-13", time: "០៨:៤៥ - ០៩:៤៥", duration: "៦០នាទី" }
    ];
}

window.loadExamManagerView = async function() {
  const container = document.getElementById("examManagerView");
  if (!container) return;

  const today = new Date().toISOString().split('T')[0];
  container.className = "flex-1 p-3 md:p-6 transition duration-300 w-full flex flex-col bg-slate-50 overflow-hidden";
  container.style.display = "flex"; 

  container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&family=Moul&family=Siemreap&display=swap');
        
        :root {
            --surface: #ffffff;
            --background: #f8fafc;
            --border-color: #e2e8f0;
            --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            --shadow-hover: 0 10px 25px -3px rgba(79, 70, 229, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
        }

        .font-moul, .num-rank, .num-id { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
        .font-siemreap, .num-score, .num-normal { font-family: 'Khmer OS Siemreap', 'Siemreap', 'Kantumruy Pro', sans-serif !important; font-weight: 500; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .glass-panel { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.6); }
        .standard-card { background-color: var(--surface); border-radius: 1rem; box-shadow: var(--shadow-soft); border: 1px solid var(--border-color); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>

    <div class="animate-fade-in font-siemreap text-slate-800 flex-1 flex flex-col h-full w-full min-h-0">
      
      <!-- ផ្ទាំងបញ្ជា (Control Panel) -->
      <div class="glass-panel p-5 rounded-2xl shadow-sm flex flex-col relative shrink-0 z-10 overflow-hidden mb-4">
        <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
        
        <div class="flex flex-col xl:flex-row justify-between xl:items-center gap-4 w-full">
            <div class="pl-2">
                <h2 class="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg shadow-sm"><i class="fa-solid fa-file-signature"></i></div>
                    <span class="font-moul text-lg pt-1 text-blue-900">ការគ្រប់គ្រងការប្រឡងទូទៅ</span>
                </h2>
                <p class="text-[11px] text-slate-500 mt-1 md:ml-14 font-bold">រៀបចំបន្ទប់ ប្លង់តុ បញ្ចូលពិន្ទុ បញ្ជីស្រង់ពិន្ទុ និងកាលបរិច្ឆេទ</p>
            </div>
            
            <div class="flex flex-wrap items-center justify-end gap-2 md:gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100 w-full xl:w-auto">
                <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm hover:border-blue-300 transition">
                    <label class="text-[10px] font-bold text-slate-500 uppercase ml-1">ប្រភេទ</label>
                    <select id="emExamType" onchange="window.processExamData()" class="border-none bg-transparent text-xs font-bold text-blue-700 outline-none cursor-pointer">
                        <option value="ប្រចាំខែ">ប្រចាំខែ</option><option value="ឆមាសទី១" selected>ឆមាសទី១</option>
                        <option value="ឆមាសទី២">ឆមាសទី២</option><option value="ប្រឡងសាកល្បង">ប្រឡងសាកល្បង</option>
                    </select>
                </div>

                <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm hover:border-blue-300 transition">
                    <span class="text-[10px] font-bold text-slate-500 uppercase ml-1">ថ្នាក់ទី</span>
                    <select id="emLevelSelect" onchange="window.toggleDivisionAndProcess()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer">
                        <option value="ថ្នាក់ទី ១">ទី ១</option><option value="ថ្នាក់ទី ២">ទី ២</option>
                        <option value="ថ្នាក់ទី ៣">ទី ៣</option><option value="ថ្នាក់ទី ៤">ទី ៤</option>
                        <option value="ថ្នាក់ទី ៥">ទី ៥</option><option value="ថ្នាក់ទី ៦">ទី ៦</option>
                        <option value="ថ្នាក់ទី ៧">ទី ៧</option><option value="ថ្នាក់ទី ៨">ទី ៨</option>
                        <option value="ថ្នាក់ទី ៩">ទី ៩</option><option value="ថ្នាក់ទី ១០">ទី ១០</option>
                        <option value="ថ្នាក់ទី ១១">ទី ១១</option><option value="ថ្នាក់ទី ១២" selected>ទី ១២</option>
                    </select>
                    <span id="divSeparator" class="text-slate-300 hidden">|</span>
                    <select id="emDivisionSelect" onchange="window.processExamData()" class="hidden border-none bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer">
                        <option value="វិទ្យាសាស្ត្រពិត" selected>វិទ្យាសាស្ត្រពិត</option>
                        <option value="វិទ្យាសាស្ត្រសង្គម">វិទ្យាសាស្ត្រសង្គម</option><option value="ទូទៅ">ទូទៅ</option>
                    </select>
                </div>

                <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm hover:border-blue-300 transition">
                    <label class="text-[10px] font-bold text-slate-500 uppercase ml-1">កាលបរិច្ឆេទ</label>
                    <input type="date" id="emExamDate" value="${today}" onchange="window.processExamData()" class="border-none bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer">
                </div>

                <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm hover:border-blue-300 transition">
                    <label class="text-[10px] font-bold text-slate-500 uppercase ml-1" title="ចំនួនបេក្ខជនក្នុងមួយបន្ទប់">ចំណុះ/បន្ទប់</label>
                    <input type="number" id="emRoomCapacity" value="25" min="1" max="50" onkeyup="window.processExamData()" onchange="window.processExamData()" class="w-10 border-none bg-transparent text-xs font-bold text-rose-600 outline-none text-center num-score">
                    <span class="text-slate-300">|</span>
                    <label class="text-[10px] font-bold text-slate-500 uppercase ml-1">បន្ទប់ទី</label>
                    <select id="emRoomNumber" onchange="window.processExamData()" class="border-none bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer num-score">
                        <option value="1">1</option>
                    </select>
                </div>

                <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm cursor-pointer hover:bg-rose-50 transition">
                    <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer w-full h-full">
                        <input type="checkbox" id="emToggleStamp" onchange="window.processExamData()" checked class="rounded text-rose-600 w-4 h-4 cursor-pointer accent-rose-600">
                        <i class="fa-solid fa-stamp text-rose-500"></i> បង្ហាញត្រា
                    </label>
                </div>
            </div>
        </div>
        
        <!-- កាលបរិច្ឆេទចន្ទគតិ និងសូរិយគតិ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 w-full border-t border-slate-200 pt-3 relative">
            <div class="flex flex-col gap-2 bg-gradient-to-r from-amber-50 to-yellow-50/50 p-3.5 rounded-xl border border-amber-200 transition hover:shadow-md hover:border-amber-300">
                <div class="flex justify-between items-center">
                    <label class="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-moon text-amber-500"></i> កាលបរិច្ឆេទចន្ទគតិ</label>
                </div>
                <input type="text" id="emLunarDate" value="ថ្ងៃព្រហស្បតិ៍ ១កើត ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០" onchange="window.processExamData()" class="w-full bg-white border border-amber-200 text-amber-900 text-xs md:text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 font-siemreap font-bold transition-all" placeholder="វាយបញ្ចូលចន្ទគតិ...">
            </div>

            <div class="flex flex-col gap-2 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-3.5 rounded-xl border border-blue-200 transition hover:shadow-md hover:border-blue-300">
                <div class="flex justify-between items-center">
                    <label class="text-[11px] font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-calendar-day text-blue-500"></i> កាលបរិច្ឆេទសូរិយគតិ</label>
                    <span class="text-[9px] md:text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-siemreap truncate max-w-[50%]" id="solarDatePreview">ជ្រើសរើសថ្ងៃ...</span>
                </div>
                <div class="flex gap-2">
                    <input type="text" id="emLocation" value="ភ្នំពេញ" placeholder="ទីតាំង..." oninput="window.updateSolarDate()" class="w-1/3 bg-white border border-blue-200 text-blue-900 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 font-siemreap transition-all">
                    <input type="date" id="emSolarDatePicker" value="${today}" onchange="window.updateSolarDate()" class="w-2/3 bg-white border border-blue-200 text-blue-900 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 font-siemreap cursor-pointer transition-all">
                </div>
                <input type="hidden" id="emSolarDate" value="">
            </div>
        </div>

      </div>

      <!-- Menu Tabs -->
      <div class="bg-white px-2 pt-2 border border-slate-200 rounded-t-2xl shadow-sm shrink-0 flex gap-1 overflow-x-auto custom-scrollbar z-20 relative">
         <button onclick="window.switchExamTab('subjects')" id="etab-subjects" class="px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap bg-blue-50 text-blue-700 border-b-2 border-blue-600 flex items-center gap-2 font-siemreap">
           <i class="fa-solid fa-book"></i> មុខវិជ្ជា & កាលវិភាគ
         </button>
         <button onclick="window.switchExamTab('lists')" id="etab-lists" class="px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 flex items-center gap-2 border-b-2 border-transparent font-siemreap">
           <i class="fa-solid fa-users"></i> បញ្ជី & បន្ទប់
         </button>
         <button onclick="window.switchExamTab('seating')" id="etab-seating" class="px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 flex items-center gap-2 border-b-2 border-transparent font-siemreap">
           <i class="fa-solid fa-border-all"></i> ប្លង់តុ
         </button>
         <button onclick="window.switchExamTab('admitcards')" id="etab-admitcards" class="px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 flex items-center gap-2 border-b-2 border-transparent font-siemreap">
           <i class="fa-solid fa-id-badge"></i> ប័ណ្ណប្រឡង
         </button>
         
         <div class="w-px h-6 bg-slate-200 mx-1 self-center"></div>
         
         <button onclick="window.switchExamTab('scoring')" id="etab-scoring" class="px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 border-b-2 border-transparent hover:border-emerald-300 font-siemreap">
           <i class="fa-solid fa-file-pen text-emerald-600"></i> បញ្ចូលពិន្ទុ
         </button>
         <button onclick="window.switchExamTab('results')" id="etab-results" class="px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-2 border-b-2 border-transparent hover:border-cyan-300 font-siemreap">
           <i class="fa-solid fa-graduation-cap text-cyan-600"></i> ព្រឹត្តិបត្រ
         </button>
         <button onclick="window.switchExamTab('mastersheet')" id="etab-mastersheet" class="px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 border-b-2 border-transparent hover:border-purple-300 font-siemreap">
           <i class="fa-solid fa-table-list text-purple-600"></i> បញ្ជីស្រង់ពិន្ទុរួម
         </button>
         <button onclick="window.switchExamTab('analytics')" id="etab-analytics" class="px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2 border-b-2 border-transparent hover:border-amber-300 font-siemreap">
           <i class="fa-solid fa-chart-pie text-amber-600"></i> ស្ថិតិលទ្ធផល
         </button>
      </div>

      <!-- Content Areas (រៀបចំថ្មី ការពារការលាក់បាត់ Content) -->
      <div class="flex-1 w-full bg-slate-50 shadow-inner relative overflow-hidden rounded-b-2xl border-x border-b border-slate-200 min-h-0 flex flex-col">
        
        <!-- Tab: Subjects -->
        <div id="examTabContent-subjects" class="exam-tab-content flex-1 p-4 md:p-8 flex flex-col bg-white overflow-hidden fade-in">
            <div class="flex justify-between items-center mb-6 border-b pb-4 w-full max-w-[1200px] mx-auto shrink-0">
               <div>
                  <h3 class="text-lg font-bold font-moul text-slate-800">មុខវិជ្ជាប្រឡង និងកាលវិភាគ</h3>
                  <p class="text-xs text-slate-500 font-siemreap mt-1">កំណត់មេគុណ ថ្ងៃម៉ោង និងរយៈពេលសម្រាប់មុខវិជ្ជានីមួយៗ</p>
               </div>
               <div class="flex gap-2 font-siemreap">
                 <button onclick="window.addNewSubject()" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"><i class="fa-solid fa-plus"></i> បន្ថែមមុខវិជ្ជា</button>
                 <button onclick="window.printExamDocument('examTimetable')" class="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 hover:-translate-y-0.5 transition-all flex items-center gap-2"><i class="fa-solid fa-print"></i> ព្រីនកាលវិភាគ</button>
               </div>
            </div>
            
            <div class="w-full max-w-[1200px] mx-auto flex-1 flex flex-col standard-card overflow-hidden">
               <div class="overflow-y-auto custom-scrollbar flex-1 w-full p-0">
                  <table class="w-full text-left border-collapse text-sm min-w-[800px]">
                     <thead class="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-xs font-siemreap sticky top-0 z-20 shadow-sm">
                        <tr><th class="p-4">មុខវិជ្ជា</th><th class="p-4 text-center">មេគុណ</th><th class="p-4 text-center">កាលបរិច្ឆេទ</th><th class="p-4 text-center">ម៉ោងប្រឡង</th><th class="p-4 text-center">រយៈពេល</th><th class="p-4 text-right">សកម្មភាព</th></tr>
                     </thead>
                     <tbody id="subjectsTbody" class="divide-y divide-slate-100 font-medium bg-white"></tbody>
                  </table>
               </div>
            </div>
            <div id="printExamTimetable" class="hidden"></div>
            <div id="printInvigilatorList" class="hidden"></div>
        </div>

        <!-- Tab: Lists & Rooms -->
        <div id="examTabContent-lists" class="exam-tab-content hidden flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex-col bg-slate-50">
            <div class="flex gap-2 justify-end mb-4 no-print w-full max-w-[1400px] mx-auto shrink-0">
               <span id="roomStatusText" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 mr-auto self-center shadow-sm font-siemreap">សរុប៖ ០ បន្ទប់ | បេក្ខជន៖ ០ នាក់</span>
               <button onclick="window.printExamDocument('doorList')" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-door-open"></i> Print បញ្ជីបិទទ្វារ</button>
               <button onclick="window.printExamDocument('signatureList')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-pen-nib"></i> Print បញ្ជីហត្ថលេខា</button>
               <button onclick="window.printExamDocument('invigilatorList')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-user-tie"></i> Print វត្តមានអនុរក្ស</button>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start w-full max-w-[1450px] mx-auto pb-20">
              <div class="flex flex-col items-center w-full standard-card p-0 overflow-x-auto"><div id="printDoorList" class="bg-white w-full max-w-[794px] min-h-[1000px] p-8"></div></div>
              <div class="flex flex-col items-center w-full standard-card p-0 overflow-x-auto"><div id="printSignatureList" class="bg-white w-full min-w-[794px] max-w-[1123px] min-h-[794px] p-8"></div></div>
            </div>
        </div>

        <!-- Tab: Seating Plan -->
        <div id="examTabContent-seating" class="exam-tab-content hidden flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex-col bg-slate-50">
            <div class="flex gap-2 justify-between items-center mb-4 no-print w-full max-w-[1400px] mx-auto shrink-0">
               <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                   <label class="text-[11px] font-bold text-slate-500 font-siemreap">ទម្រង់ប្លង់តុ៖</label>
                   <select id="seatingLayoutType" onchange="window.processExamData()" class="border-none bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer font-siemreap">
                       <option value="normal">ប្លង់ធម្មតា (៥ ជួរ)</option>
                       <option value="no_shape">ប្លង់អក្សរ ណ (U-Shape)</option>
                   </select>
               </div>
               <div class="flex gap-2">
                   <button onclick="window.printExamDocument('seatingPlan')" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-border-all"></i> Print ប្លង់តុ</button>
                   <button onclick="window.printExamDocument('deskLabels')" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-tags"></i> Print Stickers</button>
               </div>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start w-full max-w-[1450px] mx-auto pb-20">
               <div class="flex flex-col items-center w-full standard-card p-0 overflow-hidden"><div id="printSeatingPlan" class="bg-white w-full max-w-[794px] min-h-[1000px] p-8"></div></div>
               <div class="flex flex-col items-center w-full standard-card p-0 overflow-hidden"><div id="printDeskLabels" class="bg-white w-full max-w-[794px] min-h-[1000px] p-8"></div></div>
            </div>
        </div>

        <!-- Tab: Admit Cards -->
        <div id="examTabContent-admitcards" class="exam-tab-content hidden flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex-col bg-slate-50">
            <div class="flex justify-end mb-4 no-print w-full max-w-[794px] mx-auto shrink-0">
               <button onclick="window.printExamDocument('admitCards')" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-print"></i> Print ប័ណ្ណចូលប្រឡង</button>
            </div>
            <div class="flex flex-col items-center pb-20 w-full">
                <div id="printAdmitCards" class="bg-white standard-card p-0 w-full max-w-[794px] min-h-[1123px] p-8 shadow-sm"></div>
            </div>
        </div>

        <!-- Tab: Scoring (បញ្ចូលពិន្ទុ) -->
        <div id="examTabContent-scoring" class="exam-tab-content hidden flex-1 overflow-y-auto custom-scrollbar flex-col bg-white">
            <div class="p-6 sticky top-0 glass-panel z-10 border-b border-slate-200 flex justify-between items-center shadow-sm shrink-0">
               <div>
                  <h3 class="text-lg font-bold font-moul text-slate-800"><i class="fa-solid fa-file-pen text-emerald-600 mr-2"></i> បញ្ចូលពិន្ទុបេក្ខជន</h3>
                  <p class="text-xs text-slate-500 font-siemreap">វាយពិន្ទុចូលប្រអប់ ហើយប្រព័ន្ធនឹងគណនាចំណាត់ថ្នាក់ភ្លាមៗ</p>
               </div>
               <button onclick="window.saveExamScores()" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 font-siemreap">
                 <i class="fa-solid fa-floppy-disk"></i> រក្សាទុកពិន្ទុ
               </button>
            </div>
            <div class="w-full pb-20 p-6" id="scoringTableArea"></div>
        </div>

        <!-- Tab: Report Cards (ព្រឹត្តិបត្រ) -->
        <div id="examTabContent-results" class="exam-tab-content hidden flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex-col bg-slate-100">
            <div class="flex gap-2 justify-end mb-4 no-print w-full max-w-[794px] mx-auto shrink-0">
               <button onclick="window.printExamDocument('reportCards')" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-print"></i> Print ព្រឹត្តិបត្រពិន្ទុ</button>
            </div>
            <div class="flex flex-col items-center pb-20 w-full">
                <div id="printReportCards" class="bg-transparent w-full max-w-[794px] transition-all"></div>
            </div>
        </div>

        <!-- Tab: Master Sheet (ស្រង់ពិន្ទុរួម) -->
        <div id="examTabContent-mastersheet" class="exam-tab-content hidden flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex-col bg-slate-100">
            <div class="flex gap-2 justify-end mb-4 no-print w-full shrink-0">
               <button onclick="window.exportToExcel('printMasterSheetTable', 'Master_Score_Sheet')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-file-excel"></i> Export Excel</button>
               <button onclick="window.printExamDocument('masterSheet')" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 font-siemreap"><i class="fa-solid fa-print"></i> Print បញ្ជីស្រង់ពិន្ទុ</button>
            </div>
            <div class="flex flex-col items-center pb-20 w-full">
                <div id="printMasterSheet" class="bg-white standard-card overflow-x-auto w-full min-h-[794px] p-8 shadow-sm"></div>
            </div>
        </div>

        <!-- Tab: Analytics (ស្ថិតិលទ្ធផល) -->
        <div id="examTabContent-analytics" class="exam-tab-content hidden flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex-col bg-slate-50">
            <div class="w-full max-w-[1200px] mx-auto pb-20" id="analyticsDashboardArea"></div>
        </div>

      </div>
    </div>
  `;

  setTimeout(() => { window.updateSolarDate(); }, 50);
  window.toggleDivisionAndProcess();
}

window.updateSolarDate = function() {
    const locEl = document.getElementById('emLocation');
    const dateEl = document.getElementById('emSolarDatePicker');
    if (!locEl || !dateEl) return;
    
    const loc = locEl.value || 'ភ្នំពេញ';
    const dateVal = dateEl.value;
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

    let formattedDate = `ធ្វើនៅ${loc}, ថ្ងៃទី.........ខែ..................ឆ្នាំ២០២....`;
    
    if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
            const day = toKhmerNum(d.getDate().toString().padStart(2, '0'));
            const month = khmerMonths[d.getMonth()];
            const year = toKhmerNum(d.getFullYear().toString());
            formattedDate = `ធ្វើនៅ${loc}, ថ្ងៃទី${day} ខែ${month} ឆ្នាំ${year}`;
        }
    }
    
    const hiddenInput = document.getElementById('emSolarDate');
    if(hiddenInput) hiddenInput.value = formattedDate;
    
    const preview = document.getElementById('solarDatePreview');
    if(preview) preview.innerText = formattedDate;
    
    window.processExamData();
};

window.toggleDivisionAndProcess = function() {
  const levelEl = document.getElementById("emLevelSelect");
  if(!levelEl) return;
  const level = levelEl.value;
  const divSelect = document.getElementById("emDivisionSelect");
  const divSeparator = document.getElementById("divSeparator");
  
  if (['ថ្នាក់ទី ១០', 'ថ្នាក់ទី ១១', 'ថ្នាក់ទី ១២'].includes(level)) {
    divSelect.classList.remove("hidden");
    divSeparator.classList.remove("hidden");
  } else {
    divSelect.classList.add("hidden");
    divSeparator.classList.add("hidden");
  }
  window.processExamData();
}

window.switchExamTab = function(tab) {
  window.currentExamTab = tab;
  
  // យក class active ចេញពីប៊ូតុងទាំងអស់
  document.querySelectorAll("[id^='etab-']").forEach(btn => {
    btn.className = "px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-100 flex items-center gap-2 border-b-2 border-transparent font-siemreap";
  });
  
  // ដាក់ class active លើប៊ូតុងដែលកំពុងចុច
  const activeBtn = document.getElementById(`etab-${tab}`);
  if (activeBtn) {
    if(tab === 'scoring') activeBtn.className = "px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500 flex items-center gap-2 font-siemreap";
    else if(tab === 'results') activeBtn.className = "px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500 flex items-center gap-2 font-siemreap";
    else if(tab === 'mastersheet') activeBtn.className = "px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap bg-purple-50 text-purple-700 border-b-2 border-purple-500 flex items-center gap-2 font-siemreap";
    else if(tab === 'analytics') activeBtn.className = "px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap bg-amber-50 text-amber-700 border-b-2 border-amber-500 flex items-center gap-2 font-siemreap";
    else activeBtn.className = "px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap bg-blue-50 text-blue-700 border-b-2 border-blue-600 flex items-center gap-2 font-siemreap";
  }

  // លាក់ content ទាំងអស់
  document.querySelectorAll(".exam-tab-content").forEach(content => {
    content.classList.add('hidden');
    content.classList.remove('flex', 'flex-1', 'fade-in');
  });
  
  // បង្ហាញ content គោលដៅ
  const activeContent = document.getElementById(`examTabContent-${tab}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
    // បង្ខំឱ្យវាជា flex និង flex-1 ដើម្បីលាតពេញទីតាំង
    activeContent.classList.add('flex', 'flex-1', 'fade-in');
  }
}

window.addNewSubject = function() {
  window.examSubjectsData.push({ name: "មុខវិជ្ជាថ្មី", multiplier: 1, date: "2026-02-12", time: "០៧:០០ - ០៨:០០", duration: "៦០នាទី" });
  localStorage.setItem('exam_subjects_data', JSON.stringify(window.examSubjectsData));
  window.processExamData(); 
}

window.removeSubject = function(idx) {
  if(confirm("តើលោកអ្នកពិតជាចង់លុបមុខវិជ្ជានេះមែនទេ?")) {
    window.examSubjectsData.splice(idx, 1);
    localStorage.setItem('exam_subjects_data', JSON.stringify(window.examSubjectsData));
    window.processExamData();
  }
}

window.updateSubjectField = function(idx, field, val) {
  if (field === 'multiplier') window.examSubjectsData[idx][field] = Number(val);
  else window.examSubjectsData[idx][field] = val;
  localStorage.setItem('exam_subjects_data', JSON.stringify(window.examSubjectsData));
  window.processExamData();
}

window.renderSubjectsTable = function() {
  const tbody = document.getElementById("subjectsTbody");
  if(!tbody) return;
  
  let html = "";
  window.examSubjectsData.forEach((sub, idx) => {
     html += `
       <tr class="hover:bg-slate-50 transition border-b border-slate-100 font-siemreap">
         <td class="p-3 w-[25%]"><input type="text" value="${sub.name}" onchange="window.updateSubjectField(${idx}, 'name', this.value)" class="w-full bg-transparent outline-none font-bold text-slate-800 px-3 py-2 focus:bg-white focus:ring-2 ring-blue-100 rounded-lg transition font-siemreap"></td>
         <td class="p-3 text-center"><input type="number" value="${sub.multiplier}" onchange="window.updateSubjectField(${idx}, 'multiplier', this.value)" class="w-16 bg-transparent outline-none text-center border border-slate-200 rounded-lg text-indigo-600 font-bold py-1.5 num-score focus:ring-2 focus:ring-blue-100"></td>
         <td class="p-3 text-center"><input type="date" value="${sub.date}" onchange="window.updateSubjectField(${idx}, 'date', this.value)" class="w-32 bg-transparent outline-none text-center text-sm text-slate-600 py-1.5 border border-transparent focus:border-slate-200 rounded-lg num-score"></td>
         <td class="p-3 text-center"><input type="text" value="${sub.time}" onchange="window.updateSubjectField(${idx}, 'time', this.value)" class="w-32 bg-transparent outline-none text-center text-sm text-slate-600 py-1.5 border border-transparent focus:border-slate-200 rounded-lg num-score"></td>
         <td class="p-3 text-center"><input type="text" value="${sub.duration}" onchange="window.updateSubjectField(${idx}, 'duration', this.value)" class="w-24 bg-transparent outline-none text-center text-sm text-slate-600 py-1.5 border border-transparent focus:border-slate-200 rounded-lg font-siemreap"></td>
         <td class="p-3 text-right"><button onclick="window.removeSubject(${idx})" class="text-rose-400 hover:text-rose-600 w-8 h-8 rounded-lg hover:bg-rose-50 transition shadow-sm"><i class="fa-solid fa-trash-can"></i></button></td>
       </tr>
     `;
  });
  tbody.innerHTML = html;
}

window.processExamData = async function() {
  try {
      const levelEl = document.getElementById("emLevelSelect");
      if(!levelEl) return;
      
      const level = levelEl.value;
      const examType = document.getElementById("emExamType").value;
      const examDate = document.getElementById("emExamDate").value;
      const roomCapacity = parseInt(document.getElementById("emRoomCapacity").value) || 25;
      const roomSelectEl = document.getElementById("emRoomNumber");
      let roomNum = parseInt(roomSelectEl.value) || 1;
      
      const toggleStampEl = document.getElementById("emToggleStamp");
      const showStamp = toggleStampEl ? toggleStampEl.checked : true;

      const lunarDateStr = document.getElementById("emLunarDate") ? document.getElementById("emLunarDate").value : "ថ្ងៃព្រហស្បតិ៍ ១កើត ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០";
      const solarDateStr = document.getElementById("emSolarDate") ? document.getElementById("emSolarDate").value : "ធ្វើនៅ....................., ថ្ងៃទី.........ខែ..................ឆ្នាំ២០២....";

      let division = "";
      if (['ថ្នាក់ទី ១០', 'ថ្នាក់ទី ១១', 'ថ្នាក់ទី ១២'].includes(level)) {
        division = document.getElementById("emDivisionSelect").value;
      }

      const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
      const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";

      const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
      const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
      const formatKhmerDateText = (dateString) => {
        if (!dateString) return ".........................";
        const parts = dateString.split("-");
        if (parts.length !== 3) return dateString;
        return `${toKhmerNum(parts[2])}-${toKhmerNum(parts[1])}-${toKhmerNum(parts[0])}`;
      };
      const displayExamDate = formatKhmerDateText(examDate);

      let allStudents = [];
      if (typeof apiGet === "function") {
          try {
              const res = await apiGet("getStudents", { status: "Active" });
              if (res && res.data) allStudents = res.data;
          } catch(e) {}
      } else if (typeof window.allStudents !== 'undefined') {
          allStudents = window.allStudents;
      }
      
      if (!Array.isArray(allStudents)) allStudents = [];

      let targetStudents = allStudents.filter(s => {
        if(!s.grade) return false;
        let match = String(s.grade).includes(level);
        if (division && division !== "ទូទៅ") match = match && String(s.grade).includes(division);
        return match;
      });

      if (targetStudents.length === 0) {
         const mockGrade = level + (division && division !== "ទូទៅ" ? " " + division : "");
         targetStudents = Array.from({length: 42}, (_, i) => ({
            id: "100" + (i+1).toString().padStart(3, '0'),
            name: "សិស្សគំរូ " + String.fromCharCode(65 + (i%26)) + i,
            gender: i % 3 === 0 ? "ប្រុស" : "ស្រី",
            dob: `2008-0${(i%9)+1}-1${i%9}`,
            grade: mockGrade
         }));
      }

      targetStudents.sort((a, b) => String(a.name).localeCompare(String(b.name), 'km'));

      const totalStudents = targetStudents.length;
      const totalRooms = Math.ceil(totalStudents / roomCapacity);
      
      if(roomNum > totalRooms && totalRooms > 0) roomNum = totalRooms;
      if(totalRooms === 0) roomNum = 1;

      let optionsHtml = '';
      for(let i=1; i<=totalRooms; i++){
         optionsHtml += `<option value="${i}" ${i === roomNum ? 'selected' : ''}>បន្ទប់ទី ${i}</option>`;
      }
      if(totalRooms === 0) optionsHtml = `<option value="1">បន្ទប់ទី 1</option>`;
      if(roomSelectEl) roomSelectEl.innerHTML = optionsHtml;

      const roomStatusText = document.getElementById("roomStatusText");
      if(roomStatusText) roomStatusText.innerHTML = `សរុប៖ <span class="num-score">${toKhmerNum(totalRooms.toString())}</span> បន្ទប់ | បេក្ខជន៖ <span class="num-score">${toKhmerNum(totalStudents.toString())}</span> នាក់`;

      const startIndex = (roomNum - 1) * roomCapacity;
      const endIndex = startIndex + roomCapacity;
      const studentsInRoom = targetStudents.slice(startIndex, endIndex);

      const displayGradeName = division && division !== "ទូទៅ" ? `${level} (${division})` : level;
      const displayRoomString = toKhmerNum(String(roomNum).padStart(2, '0'));

      const examSubjects = Array.isArray(window.examSubjectsData) ? window.examSubjectsData.map(s => s.name) : [];

      if (studentsInRoom.length === 0) {
         const emptyMsg = `<div class="text-center text-slate-500 font-bold mt-20 bg-slate-100 p-6 rounded-2xl border border-slate-200 mx-auto max-w-lg shadow-sm font-siemreap flex items-center justify-center gap-3"><i class="fa-solid fa-folder-open text-xl"></i> មិនមានទិន្នន័យបេក្ខជនទេ!</div>`;
         ["printDoorList", "printSignatureList", "printSeatingPlan", "printDeskLabels", "printAdmitCards", "scoringTableArea", "printReportCards", "printMasterSheet", "analyticsDashboardArea"].forEach(id => {
            let el = document.getElementById(id);
            if(el) el.innerHTML = emptyMsg;
         });
      } else {
        window.renderSubjectsTable();
        window.renderLists(studentsInRoom, displayGradeName, displayRoomString, examType, displayExamDate, "មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត", schoolName, "នាយកសាលា", startIndex, showStamp, examSubjects, lunarDateStr, solarDateStr);
        window.renderSeatingPlan(studentsInRoom, displayGradeName, displayRoomString, examType, schoolName, startIndex);
        window.renderDeskLabels(studentsInRoom, displayGradeName, displayRoomString, examType, schoolName, startIndex);
        window.renderAdmitCards(studentsInRoom, displayGradeName, displayRoomString, examType, displayExamDate, schoolName, startIndex);
        window.renderScoringTable(studentsInRoom, displayGradeName, examType);
        window.renderReportCards(studentsInRoom, displayGradeName, examType, examDate, schoolName, showStamp, lunarDateStr, solarDateStr);
        window.renderMasterScoreSheet(targetStudents, displayGradeName, examType, schoolName, showStamp, lunarDateStr, solarDateStr);
        window.renderAnalytics(targetStudents, displayGradeName, examType);
      }

      window.renderExamTimetable(displayGradeName, examType, examDate, "ក្រសួងអប់រំ យុវជន និងកីឡា", "មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត", "ប្រធានមន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត", showStamp, lunarDateStr, solarDateStr);
      window.renderInvigilatorList(displayGradeName, examType, displayExamDate, "មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត", schoolName, "នាយកសាលា", showStamp, lunarDateStr, solarDateStr);
  } catch (err) {
      console.error("Exam Manager Error:", err);
  }
}

window.renderScoringTable = function(students, grade, examType) {
  const area = document.getElementById("scoringTableArea");
  if (!area) return;

  const keyPrefix = `${grade}_${examType}_`;

  let thead = `
    <tr class="bg-emerald-50/80 text-emerald-800 border-y-2 border-emerald-200 font-bold text-[12px] whitespace-nowrap shadow-sm font-siemreap">
      <th class="p-3 text-center w-10 sticky left-0 bg-emerald-50 z-10 border-r border-emerald-100">ល.រ</th>
      <th class="p-3 text-center sticky left-10 bg-emerald-50 z-10 border-r border-emerald-200">អត្តលេខ</th>
      <th class="p-3 text-left w-[200px] min-w-[200px]">គោត្តនាម និងនាម</th>
  `;
  window.examSubjectsData.forEach((sub, idx) => {
    thead += `<th class="p-3 text-center border-l border-emerald-100" title="មេគុណ ${sub.multiplier}">${sub.name}<br><span class="text-[10px] text-emerald-600 bg-white px-2 py-0.5 rounded-full mt-1 inline-block border border-emerald-200 shadow-sm num-score">x${sub.multiplier}</span></th>`;
  });
  thead += `
      <th class="p-3 text-center text-indigo-700 border-l-2 border-emerald-200 bg-indigo-50/80">សរុប</th>
      <th class="p-3 text-center text-indigo-700 bg-indigo-50/80">មធ្យមភាគ</th>
      <th class="p-3 text-center text-rose-600 bg-rose-50/80 border-l border-rose-100">និទ្ទេស</th>
      <th class="p-3 text-center text-amber-600 bg-amber-50/80 border-l border-amber-100">ចំណាត់ថ្នាក់</th>
    </tr>
  `;

  let tbody = '';
  
  let studentTotals = students.map(s => {
    let totalScore = 0;
    window.examSubjectsData.forEach((sub, idx) => {
       const key = `${keyPrefix}${s.id}_${idx}`;
       const rawScore = window.examScoresData[key] ? Number(window.examScoresData[key]) : 0;
       totalScore += (rawScore * sub.multiplier);
    });
    return { id: s.id, total: totalScore };
  });
  studentTotals.sort((a,b) => b.total - a.total); 

  students.forEach((s, i) => {
    const sId = s.id;
    let totalScore = 0;
    let totalMultiplier = 0;

    let tr = `<tr class="border-b border-slate-100 hover:bg-blue-50/30 transition text-[13px] bg-white group font-siemreap">
      <td class="p-2 text-center text-slate-500 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-blue-50/30 num-score">${i + 1}</td>
      <td class="p-2 text-center text-slate-400 sticky left-10 bg-white z-10 border-r border-slate-200 group-hover:bg-blue-50/30 num-id text-sm">${sId}</td>
      <td class="p-2 text-left font-siemreap font-bold truncate w-[200px] min-w-[200px] text-slate-700">${s.name}</td>
    `;

    window.examSubjectsData.forEach((sub, idx) => {
      const key = `${keyPrefix}${sId}_${idx}`;
      const rawScore = window.examScoresData[key] !== undefined ? window.examScoresData[key] : '';
      const numScore = Number(rawScore) || 0;
      totalScore += (numScore * sub.multiplier);
      totalMultiplier += sub.multiplier;

      tr += `<td class="p-2 text-center border-l border-slate-50"><input type="number" id="${key}" value="${rawScore}" min="0" max="100" onchange="window.updateScoreTemp('${sId}', ${idx}, '${keyPrefix}', this.value)" class="w-16 border border-slate-200 rounded-lg text-center py-1.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 shadow-inner bg-slate-50 focus:bg-white transition num-score font-bold"></td>`;
    });

    const average = totalMultiplier > 0 ? (totalScore / totalMultiplier).toFixed(2) : 0;
    
    let gradeLetter = "F"; let gradeColor = "text-rose-600";
    if (average >= 90) { gradeLetter = "A"; gradeColor = "text-emerald-600"; }
    else if (average >= 80) { gradeLetter = "B"; gradeColor = "text-blue-600"; }
    else if (average >= 70) { gradeLetter = "C"; gradeColor = "text-indigo-600"; }
    else if (average >= 60) { gradeLetter = "D"; gradeColor = "text-amber-600"; }
    else if (average >= 50) { gradeLetter = "E"; gradeColor = "text-orange-600"; }

    let rank = studentTotals.findIndex(st => st.id === sId) + 1;
    if (totalScore === 0) rank = "-";

    tr += `
      <td class="p-2 text-center text-indigo-700 bg-indigo-50/20 border-l-2 border-emerald-100 num-score font-bold" id="tot_${sId}">${totalScore.toFixed(2)}</td>
      <td class="p-2 text-center text-indigo-700 bg-indigo-50/20 num-score font-bold" id="avg_${sId}">${average}</td>
      <td class="p-2 text-center font-bold text-lg ${gradeColor} bg-rose-50/20 border-l border-slate-100 font-siemreap" id="grd_${sId}">${totalScore > 0 ? gradeLetter : '-'}</td>
      <td class="p-2 text-center text-amber-600 bg-amber-50/20 border-l border-slate-100 num-rank text-lg" id="rnk_${sId}">${rank}</td>
    </tr>`;
    tbody += tr;
  });

  area.innerHTML = `
    <div class="standard-card overflow-hidden">
        <table class="w-full text-left border-collapse bg-white min-w-[900px]">
          <thead>${thead}</thead>
          <tbody>${tbody}</tbody>
        </table>
    </div>
  `;
}

window.updateScoreTemp = function(sId, idx, prefix, val) {
  const key = `${prefix}${sId}_${idx}`;
  window.examScoresData[key] = val;

  let tot = 0; let mult = 0;
  window.examSubjectsData.forEach((sub, i) => {
     let v = Number(document.getElementById(`${prefix}${sId}_${i}`).value) || 0;
     tot += v * sub.multiplier;
     mult += sub.multiplier;
  });
  let avg = mult > 0 ? (tot/mult).toFixed(2) : 0;
  let gl = "F"; let col = "text-rose-600";
  if (avg >= 90) { gl="A"; col="text-emerald-600"; }
  else if(avg >= 80) { gl="B"; col="text-blue-600"; }
  else if(avg >= 70) { gl="C"; col="text-indigo-600"; }
  else if(avg >= 60) { gl="D"; col="text-amber-600"; }
  else if(avg >= 50) { gl="E"; col="text-orange-600"; }
  
  let totEl = document.getElementById(`tot_${sId}`); if(totEl) totEl.innerText = tot.toFixed(2);
  let avgEl = document.getElementById(`avg_${sId}`); if(avgEl) avgEl.innerText = avg;
  let grdEl = document.getElementById(`grd_${sId}`); 
  if(grdEl) { grdEl.innerText = tot > 0 ? gl : '-'; grdEl.className = `p-2 text-center font-bold text-lg bg-rose-50/30 border-l border-slate-100 font-siemreap ${col}`; }
  
  let rnkEl = document.getElementById(`rnk_${sId}`); 
  if(rnkEl) { rnkEl.innerHTML = '<span class="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded font-siemreap shadow-sm">ចុច Save 👆</span>'; }
}

window.saveExamScores = function() {
  localStorage.setItem('exam_scores_data', JSON.stringify(window.examScoresData));
  if (typeof showToast === 'function') showToast("✅ រក្សាទុក និងគណនាចំណាត់ថ្នាក់ជោគជ័យ!");
  else alert("រក្សាទុកពិន្ទុជោគជ័យ!");
  window.processExamData(); 
}

window.renderReportCards = function(students, grade, examType, examDate, schoolName, showStamp, lunarDateStr, solarDateStr) {
  const area = document.getElementById("printReportCards");
  if (!area) return;

  const keyPrefix = `${grade}_${examType}_`;
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');

  let studentTotals = students.map(s => {
    let totalScore = 0;
    window.examSubjectsData.forEach((sub, idx) => {
       const key = `${keyPrefix}${s.id}_${idx}`;
       const rawScore = window.examScoresData[key] ? Number(window.examScoresData[key]) : 0;
       totalScore += (rawScore * sub.multiplier);
    });
    return { id: s.id, total: totalScore };
  });
  studentTotals.sort((a,b) => b.total - a.total);

  let html = "";
  
  students.forEach((s, index) => {
    let totalScore = 0;
    let totalMultiplier = 0;
    let subjectsHtml = "";

    window.examSubjectsData.forEach((sub, idx) => {
      const key = `${keyPrefix}${s.id}_${idx}`;
      const rawScore = window.examScoresData[key] ? Number(window.examScoresData[key]) : 0;
      const subTotal = rawScore * sub.multiplier;
      totalScore += subTotal;
      totalMultiplier += sub.multiplier;

      subjectsHtml += `
        <tr class="border-b border-black text-[12px] h-[26px]">
          <td class="border-r border-black px-2 text-left">${sub.name}</td>
          <td class="border-r border-black text-center num-score">${toKhmerNum(sub.multiplier.toString())}</td>
          <td class="border-r border-black text-center num-score">${toKhmerNum(rawScore.toString()) || '-'}</td>
          <td class="border-r border-black text-center num-score">${toKhmerNum(subTotal.toString()) || '-'}</td>
          <td class="text-center font-siemreap"></td>
        </tr>
      `;
    });

    const average = totalMultiplier > 0 ? (totalScore / totalMultiplier).toFixed(2) : 0;
    let gradeLetter = "F";
    if (average >= 90) { gradeLetter = "A"; }
    else if (average >= 80) { gradeLetter = "B"; }
    else if (average >= 70) { gradeLetter = "C"; }
    else if (average >= 60) { gradeLetter = "D"; }
    else if (average >= 50) { gradeLetter = "E"; }

    let rank = studentTotals.findIndex(st => st.id === s.id) + 1;
    if (totalScore === 0) rank = "-";

    const stampSignatureHtml = showStamp ? `
      <div class="relative w-full h-16 flex flex-col items-center justify-center mt-2 mb-2 pointer-events-none">
        <div class="absolute w-16 h-16 rounded-full border-[2px] border-blue-800 text-blue-800 opacity-50 rotate-[-15deg] flex flex-col items-center justify-center z-0">
          <span class="text-[6px] font-moul uppercase tracking-widest text-blue-800">ព្រះរាជាណាចក្រកម្ពុជា</span>
          <span class="text-[8px] font-black leading-none my-0.5 text-blue-800 font-siemreap">★</span>
          <span class="text-[5px] font-moul uppercase truncate px-1 max-w-full leading-tight text-blue-800">${schoolName}</span>
        </div>
        <div class="absolute z-10 font-moul text-blue-900 text-xl opacity-70 rotate-[-10deg]">ហត្ថលេខា</div>
      </div>
    ` : `<div class="h-16 mt-2 mb-2"></div>`;

    html += `
      <div class="w-[180mm] min-h-[125mm] border-[2px] border-slate-800 print:border-black rounded-xl p-6 bg-white relative mb-8 break-inside-avoid shadow-sm print:shadow-none mx-auto box-border" style="page-break-inside: avoid;">
         <div class="flex justify-between items-start text-[11px] font-bold mb-4 font-siemreap">
            <div class="text-center w-[150px]">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Seal_of_the_Ministry_of_Education_Youth_and_Sport_of_Cambodia.svg/1024px-Seal_of_the_Ministry_of_Education_Youth_and_Sport_of_Cambodia.svg.png" class="w-12 h-12 mx-auto mb-1 object-contain">
               <p class="font-moul text-[11px] text-slate-800 print:text-black leading-tight">${schoolName}</p>
            </div>
            <div class="text-center">
               <p class="text-[13px] tracking-widest font-moul text-slate-900 print:text-black">ព្រះរាជាណាចក្រកម្ពុជា</p>
               <p class="text-[12px] tracking-wide font-moul text-slate-900 print:text-black mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
               <div class="tracking-[4px] mt-0 text-[10px] font-serif text-slate-600 print:text-black font-bold">* * * 📖 * * *</div>
            </div>
            <div class="w-[150px] text-right">
               <span class="num-score text-xs border border-slate-400 print:border-black px-2 py-1 rounded">No. ${toKhmerNum(String(index+1).padStart(4, '0'))}</span>
            </div>
         </div>

         <div class="text-center mb-4">
            <h2 class="text-[15px] font-bold tracking-wide font-moul text-slate-900 print:text-black leading-snug">ព្រឹត្តិបត្រពិន្ទុប្រចាំ${examType}</h2>
            <p class="text-[11px] font-bold mt-1 font-siemreap text-slate-600 print:text-black">ឆ្នាំសិក្សា ២០២៦-២០២៧</p>
         </div>

         <div class="flex justify-between text-[11px] font-bold mb-3 px-4 bg-slate-50 print:bg-transparent py-2 border border-slate-200 print:border-black rounded-lg font-siemreap">
            <div>
               <p class="mb-1">អត្តលេខ៖ <span class="num-id text-indigo-700 print:text-black">${toKhmerNum(s.id)}</span></p>
               <p>ឈ្មោះ៖ <span class="font-siemreap font-bold text-[13px] text-slate-900 print:text-black">${s.name}</span></p>
            </div>
            <div class="text-right">
               <p class="mb-1">ភេទ៖ <span class="font-normal font-siemreap">${s.gender}</span> | ថ្នាក់ទី៖ <span class="font-moul text-indigo-700 print:text-black">${grade}</span></p>
               <p>ថ្ងៃកំណើត៖ <span class="font-normal num-score">${toKhmerNum(s.dob || '-')}</span></p>
            </div>
         </div>

         <table class="w-full border-collapse border-[2px] border-black text-center text-[11px] font-siemreap">
            <thead>
               <tr class="bg-slate-100 print:bg-transparent font-bold h-8 border-b-[2px] border-black font-moul">
                 <th class="border-r border-black w-[40%] text-left px-2">មុខវិជ្ជា</th>
                 <th class="border-r border-black w-[15%]">មេគុណ</th>
                 <th class="border-r border-black w-[15%]">ពិន្ទុដើម</th>
                 <th class="border-r border-black w-[15%]">ពិន្ទុសរុប</th>
                 <th class="w-[15%]">និទ្ទេស</th>
               </tr>
            </thead>
            <tbody>
               ${subjectsHtml}
               <tr class="font-bold bg-slate-50 print:bg-transparent border-t-[2px] border-black h-[28px]">
                 <td colspan="3" class="border-r border-black text-right px-2 font-moul text-[12px]">ពិន្ទុសរុបរួម៖</td>
                 <td class="border-r border-black num-score text-[13px] text-indigo-700 print:text-black">${toKhmerNum(totalScore.toFixed(2))}</td>
                 <td class="font-bold text-rose-600 print:text-black text-[13px] font-siemreap">${gradeLetter}</td>
               </tr>
            </tbody>
         </table>

         <div class="flex justify-between items-center mt-3 text-[11px] font-bold px-4 font-siemreap">
            <div class="border-[2px] border-slate-800 print:border-black rounded-lg px-4 py-2 bg-amber-50 print:bg-transparent">
               ចំណាត់ថ្នាក់លេខ៖ <span class="num-rank text-xl text-amber-600 print:text-black ml-2">${toKhmerNum(rank.toString())}</span> <span class="text-slate-500 font-normal text-[9px] ml-1">/ <span class="num-score">${toKhmerNum(students.length.toString())}</span> នាក់</span>
            </div>
            <div>
               មធ្យមភាគ៖ <span class="num-score text-[13px] border-b border-black px-2">${toKhmerNum(average.toString())}</span> | និទ្ទេសរួម៖ <span class="font-bold font-siemreap text-[13px] text-rose-600 print:text-black border-b border-black px-2">${gradeLetter}</span>
            </div>
         </div>

         <div class="flex justify-between mt-4 text-[11px] font-bold px-8 font-siemreap">
            <div class="text-center w-1/3">
               <p class="font-moul text-[11px]">នាយកសាលា</p>
               ${stampSignatureHtml}
               <p class="font-moul text-[11px] border-t border-dotted border-black pt-1 w-3/4 mx-auto"></p>
            </div>
            <div class="text-center w-[45%] flex flex-col items-center">
               <p class="font-siemreap font-bold text-[10px] md:text-[11px] w-full whitespace-nowrap" contenteditable="true">${lunarDateStr}</p>
               <p class="font-siemreap font-bold text-[10px] md:text-[11px] mt-1 w-full whitespace-nowrap" contenteditable="true">${solarDateStr}</p>
               <p class="font-moul text-[11px] mt-2">គ្រូបន្ទុកថ្នាក់</p>
               <div class="h-16"></div>
               <p class="font-moul text-[11px] border-t border-dotted border-black pt-1 w-3/4 mx-auto"></p>
            </div>
         </div>
      </div>
    `;
  });

  area.innerHTML = `
    <div class="print-content w-full flex flex-col items-center bg-transparent pt-0" style="font-family: 'Siemreap', sans-serif; color: black;">
       ${html}
    </div>
  `;
}

window.renderMasterScoreSheet = function(allStudents, grade, examType, schoolName, showStamp, lunarDateStr, solarDateStr) {
  const area = document.getElementById("printMasterSheet");
  if (!area) return;

  const keyPrefix = `${grade}_${examType}_`;
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');

  let studentTotals = allStudents.map(s => {
    let totalScore = 0;
    window.examSubjectsData.forEach((sub, idx) => {
       const key = `${keyPrefix}${s.id}_${idx}`;
       const rawScore = window.examScoresData[key] ? Number(window.examScoresData[key]) : 0;
       totalScore += (rawScore * sub.multiplier);
    });
    return { id: s.id, total: totalScore };
  });
  studentTotals.sort((a,b) => b.total - a.total);

  let thead = `
    <tr class="bg-slate-100 print:bg-transparent font-bold h-12 border-b-[2px] border-black text-[11px] font-moul leading-tight">
      <th class="border-r border-black w-[4%] text-center">ល.រ</th>
      <th class="border-r border-black w-[8%] text-center">អត្តលេខ</th>
      <th class="border-r border-black w-[15%] text-left px-3">គោត្តនាម និងនាម</th>
      <th class="border-r border-black w-[4%] text-center">ភេទ</th>
  `;
  window.examSubjectsData.forEach(sub => {
    thead += `<th class="border-r border-black w-[6%] whitespace-nowrap px-1 break-words"><span style="writing-mode: vertical-rl; transform: rotate(180deg); padding: 5px 0;">${sub.name}</span></th>`;
  });
  thead += `
      <th class="border-r border-black w-[7%] text-indigo-800 print:text-black text-center">សរុប</th>
      <th class="border-r border-black w-[6%] text-indigo-800 print:text-black text-center">មធ្យម</th>
      <th class="border-r border-black w-[5%] text-rose-700 print:text-black text-center">និទ្ទេស</th>
      <th class="border-r border-black w-[6%] text-amber-700 print:text-black text-center">ចំណាត់ថ្នាក់</th>
    </tr>
  `;

  let tbody = "";
  let passCount = 0; let femalePassCount = 0; let totalFemale = 0;

  allStudents.forEach((s, index) => {
    if(s.gender === "ស្រី") totalFemale++;
    let totalScore = 0; let totalMultiplier = 0; let subjectTds = "";

    window.examSubjectsData.forEach((sub, idx) => {
      const key = `${keyPrefix}${s.id}_${idx}`;
      const rawScore = window.examScoresData[key] ? Number(window.examScoresData[key]) : 0;
      totalScore += (rawScore * sub.multiplier);
      totalMultiplier += sub.multiplier;
      subjectTds += `<td class="border-r border-black text-center num-score">${toKhmerNum(rawScore.toString()) || '-'}</td>`;
    });

    const average = totalMultiplier > 0 ? (totalScore / totalMultiplier).toFixed(2) : 0;
    let gradeLetter = "F";
    if (average >= 90) gradeLetter = "A";
    else if (average >= 80) gradeLetter = "B";
    else if (average >= 70) gradeLetter = "C";
    else if (average >= 60) gradeLetter = "D";
    else if (average >= 50) { gradeLetter = "E"; }
    
    if(average >= 50) { passCount++; if(s.gender==="ស្រី") femalePassCount++; }

    let rank = studentTotals.findIndex(st => st.id === s.id) + 1;
    if (totalScore === 0) rank = "-";

    tbody += `
      <tr class="h-[30px] transition border-b border-black text-[12px] font-siemreap">
        <td class="border-r border-black text-center num-score">${toKhmerNum((index+1).toString())}</td>
        <td class="border-r border-black text-center num-id">${toKhmerNum(s.id)}</td>
        <td class="border-r border-black px-3 text-left font-siemreap font-bold whitespace-nowrap">${s.name}</td>
        <td class="border-r border-black text-center">${s.gender==="ស្រី"?"ស":"ប"}</td>
        ${subjectTds}
        <td class="border-r border-black text-center num-score text-indigo-800">${toKhmerNum(totalScore.toFixed(2))}</td>
        <td class="border-r border-black text-center num-score text-indigo-800">${toKhmerNum(average.toString())}</td>
        <td class="border-r border-black text-center font-bold text-rose-600 print:text-black font-siemreap">${totalScore > 0 ? gradeLetter : '-'}</td>
        <td class="border-r border-black text-center num-rank text-amber-600 print:text-black">${totalScore > 0 ? toKhmerNum(rank.toString()) : '-'}</td>
      </tr>
    `;
  });

  const stampSignatureHtml = showStamp ? `
    <div class="relative w-full h-20 flex flex-col items-center justify-center mt-3 mb-2 pointer-events-none">
      <div class="absolute w-20 h-20 rounded-full border-[2px] border-blue-800 text-blue-800 opacity-50 rotate-[-15deg] flex flex-col items-center justify-center z-0">
        <span class="text-[7px] font-moul uppercase tracking-widest text-blue-800">ព្រះរាជាណាចក្រកម្ពុជា</span>
        <span class="text-[10px] font-black leading-none my-0.5 text-blue-800 font-siemreap">★</span>
        <span class="text-[6px] font-moul uppercase truncate px-2 max-w-full leading-tight text-blue-800">${schoolName}</span>
      </div>
      <div class="absolute z-10 font-moul text-blue-900 text-2xl opacity-70 rotate-[-10deg]">ហត្ថលេខា</div>
    </div>
  ` : `<div class="h-20 mt-3 mb-2"></div>`;

  area.innerHTML = `
    <div class="print-content h-full w-full flex flex-col" style="font-family: 'Siemreap', sans-serif; color: black;">
      <div class="text-center mb-6">
        <h2 class="text-[16px] font-bold tracking-wide font-moul text-slate-900 print:text-black leading-snug">បញ្ជីស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់សិស្សប្រចាំ${examType}</h2>
        <div class="mt-2 text-[13px] font-bold flex justify-center items-center gap-4 text-slate-800 print:text-black font-siemreap">
          <span>សាលា៖ <span class="font-moul">${schoolName}</span></span> | 
          <span>ថ្នាក់ទី៖ <span class="font-moul text-indigo-700 print:text-black">${grade}</span></span> | 
          <span>សិស្សសរុប៖ <span class="num-score">${toKhmerNum(allStudents.length.toString())}</span> នាក់</span>
        </div>
      </div>
      
      <table id="printMasterSheetTable" class="w-full border-collapse border-[2px] border-black text-center mt-2 min-w-[1000px] font-siemreap">
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
      </table>

      <div class="w-full mt-6 text-[12px] font-bold px-4 flex justify-between">
         <div class="font-siemreap border border-black p-4 rounded-xl bg-slate-50 print:bg-transparent w-[30%]">
            <p class="underline mb-2 font-moul text-[13px]">សេចក្តីសង្ខេប៖</p>
            <p class="mb-1">សិស្សសរុប៖ <span class="num-score">${toKhmerNum(allStudents.length.toString())}</span> នាក់ <span class="font-normal text-slate-600 print:text-black">(ស្រី <span class="num-score">${toKhmerNum(totalFemale.toString())}</span> នាក់)</span></p>
            <p class="mb-1">ប្រឡងជាប់៖ <span class="num-score text-emerald-600 print:text-black">${toKhmerNum(passCount.toString())}</span> នាក់ <span class="font-normal text-slate-600 print:text-black">(ស្រី <span class="num-score">${toKhmerNum(femalePassCount.toString())}</span> នាក់)</span></p>
            <p>ប្រឡងធ្លាក់៖ <span class="num-score text-rose-600 print:text-black">${toKhmerNum((allStudents.length - passCount).toString())}</span> នាក់ <span class="font-normal text-slate-600 print:text-black">(ស្រី <span class="num-score">${toKhmerNum((totalFemale - femalePassCount).toString())}</span> នាក់)</span></p>
         </div>
         <div class="text-center w-[45%] flex flex-col items-center font-siemreap">
            <p class="font-siemreap font-bold text-[11px] md:text-[12px] w-full whitespace-nowrap" contenteditable="true">${lunarDateStr}</p>
            <p class="font-siemreap font-bold text-[11px] md:text-[12px] mt-1 w-full whitespace-nowrap" contenteditable="true">${solarDateStr}</p>
            <p class="font-moul text-[13px] w-full mt-2">នាយកសាលា</p>
            ${stampSignatureHtml}
            <p class="font-moul text-[13px] w-full">នាមត្រកូល និងនាម</p>
         </div>
      </div>
    </div>
  `;
}

window.renderAnalytics = function(allStudents, grade, examType) {
  const area = document.getElementById("analyticsDashboardArea");
  if (!area) return;

  const keyPrefix = `${grade}_${examType}_`;
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');

  let passCount = 0; let femalePassCount = 0; let totalFemale = 0; let classTotalSum = 0; let validStudentsCount = 0;
  let gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  allStudents.forEach(s => {
    if(s.gender === "ស្រី") totalFemale++;
    let totalScore = 0; let totalMultiplier = 0;
    window.examSubjectsData.forEach((sub, idx) => {
      const key = `${keyPrefix}${s.id}_${idx}`; const rawScore = window.examScoresData[key] ? Number(window.examScoresData[key]) : 0;
      totalScore += (rawScore * sub.multiplier); totalMultiplier += sub.multiplier;
    });
    if (totalScore === 0) return;
    validStudentsCount++;
    const average = totalMultiplier > 0 ? (totalScore / totalMultiplier) : 0;
    classTotalSum += average;
    if (average >= 90) gradeCounts.A++; else if (average >= 80) gradeCounts.B++; else if (average >= 70) gradeCounts.C++; else if (average >= 60) gradeCounts.D++; else if (average >= 50) gradeCounts.E++; else gradeCounts.F++;
    if(average >= 50) { passCount++; if(s.gender==="ស្រី") femalePassCount++; }
  });

  let classAverage = 0; if (validStudentsCount > 0) classAverage = (classTotalSum / validStudentsCount).toFixed(2);
  const failCount = validStudentsCount - passCount;
  const passRate = validStudentsCount > 0 ? ((passCount / validStudentsCount) * 100).toFixed(1) : 0;

  area.innerHTML = `
    <div class="mb-6 flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200 standard-card"><div><h2 class="text-2xl font-black text-slate-800 flex items-center gap-3 font-moul pt-2"><i class="fa-solid fa-chart-pie text-amber-500"></i> ស្ថិតិលទ្ធផលប្រឡង</h2><p class="text-sm font-bold text-slate-500 mt-1 font-siemreap">ថ្នាក់ទី ${grade} | ${examType} | បេក្ខជនបានវាយពិន្ទុរួច៖ ${validStudentsCount}/${allStudents.length}</p></div></div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 font-siemreap">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 standard-card"><div class="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i class="fa-solid fa-users"></i></div><div><p class="text-[12px] font-bold text-slate-500 uppercase">សិស្សសរុប</p><p class="text-3xl font-black num-score text-slate-800">${toKhmerNum(validStudentsCount.toString())}</p></div></div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 standard-card"><div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i class="fa-solid fa-check-double"></i></div><div><p class="text-[12px] font-bold text-slate-500 uppercase">ប្រឡងជាប់</p><p class="text-3xl font-black num-score text-emerald-600">${toKhmerNum(passCount.toString())} <span class="text-sm text-slate-400 font-siemreap ml-1">(${toKhmerNum(passRate.toString())}%)</span></p></div></div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 standard-card"><div class="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i class="fa-solid fa-xmark"></i></div><div><p class="text-[12px] font-bold text-slate-500 uppercase">ប្រឡងធ្លាក់</p><p class="text-3xl font-black num-score text-rose-600">${toKhmerNum(failCount.toString())}</p></div></div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 standard-card"><div class="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i class="fa-solid fa-chart-line"></i></div><div><p class="text-[12px] font-bold text-slate-500 uppercase">មធ្យមភាគថ្នាក់</p><p class="text-3xl font-black num-score text-indigo-600">${toKhmerNum(classAverage.toString())}</p></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 font-siemreap">
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 standard-card"><h3 class="font-bold text-slate-700 mb-6 border-b pb-3 text-lg font-moul pt-1"><i class="fa-solid fa-award text-amber-500 mr-2"></i> របាយការណ៍និទ្ទេស</h3><div class="space-y-4"><div class="flex items-center justify-between"><span class="font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-lg w-20 text-center shadow-sm">A</span> <div class="flex-1 mx-4 bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner"><div class="bg-emerald-500 h-full rounded-full transition-all duration-1000" style="width: ${validStudentsCount?(gradeCounts.A/validStudentsCount)*100:0}%"></div></div> <span class="num-score font-bold text-lg text-slate-600">${toKhmerNum(gradeCounts.A.toString())}</span></div><div class="flex items-center justify-between"><span class="font-bold text-blue-600 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-lg w-20 text-center shadow-sm">B</span> <div class="flex-1 mx-4 bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner"><div class="bg-blue-500 h-full rounded-full transition-all duration-1000" style="width: ${validStudentsCount?(gradeCounts.B/validStudentsCount)*100:0}%"></div></div> <span class="num-score font-bold text-lg text-slate-600">${toKhmerNum(gradeCounts.B.toString())}</span></div><div class="flex items-center justify-between"><span class="font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-lg w-20 text-center shadow-sm">C</span> <div class="flex-1 mx-4 bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner"><div class="bg-indigo-500 h-full rounded-full transition-all duration-1000" style="width: ${validStudentsCount?(gradeCounts.C/validStudentsCount)*100:0}%"></div></div> <span class="num-score font-bold text-lg text-slate-600">${toKhmerNum(gradeCounts.C.toString())}</span></div><div class="flex items-center justify-between"><span class="font-bold text-amber-600 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-lg w-20 text-center shadow-sm">D</span> <div class="flex-1 mx-4 bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner"><div class="bg-amber-500 h-full rounded-full transition-all duration-1000" style="width: ${validStudentsCount?(gradeCounts.D/validStudentsCount)*100:0}%"></div></div> <span class="num-score font-bold text-lg text-slate-600">${toKhmerNum(gradeCounts.D.toString())}</span></div><div class="flex items-center justify-between"><span class="font-bold text-orange-600 bg-orange-50 border border-orange-200 px-4 py-1.5 rounded-lg w-20 text-center shadow-sm">E</span> <div class="flex-1 mx-4 bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner"><div class="bg-orange-500 h-full rounded-full transition-all duration-1000" style="width: ${validStudentsCount?(gradeCounts.E/validStudentsCount)*100:0}%"></div></div> <span class="num-score font-bold text-lg text-slate-600">${toKhmerNum(gradeCounts.E.toString())}</span></div><div class="flex items-center justify-between"><span class="font-bold text-rose-600 bg-rose-50 border border-rose-200 px-4 py-1.5 rounded-lg w-20 text-center shadow-sm">F</span> <div class="flex-1 mx-4 bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner"><div class="bg-rose-500 h-full rounded-full transition-all duration-1000" style="width: ${validStudentsCount?(gradeCounts.F/validStudentsCount)*100:0}%"></div></div> <span class="num-score font-bold text-lg text-slate-600">${toKhmerNum(gradeCounts.F.toString())}</span></div></div></div>
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 standard-card"><h3 class="font-bold text-slate-700 mb-6 border-b pb-3 text-lg font-moul pt-1"><i class="fa-solid fa-venus-mars text-purple-500 mr-2"></i> ស្ថិតិជាប់/ធ្លាក់ តាមយេនឌ័រ</h3><div class="flex h-56 gap-6 items-end justify-around mt-8 px-6 border-b-2 border-slate-200 pb-2 relative"><div class="flex flex-col items-center gap-2 w-1/4 group"><div class="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl relative flex items-end justify-center pb-3 text-white font-bold text-sm shadow-md transition-all duration-1000" style="height: ${validStudentsCount?(passCount/validStudentsCount)*100:0}%">${toKhmerNum(passCount.toString())}</div><span class="text-[11px] font-bold text-slate-500 uppercase mt-2">ជាប់សរុប</span></div><div class="flex flex-col items-center gap-2 w-1/4 group"><div class="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-xl relative flex items-end justify-center pb-3 text-white font-bold text-sm shadow-md transition-all duration-1000" style="height: ${validStudentsCount?(femalePassCount/validStudentsCount)*100:0}%">${toKhmerNum(femalePassCount.toString())}</div><span class="text-[11px] font-bold text-slate-500 uppercase mt-2">ជាប់ (ស្រី)</span></div><div class="flex flex-col items-center gap-2 w-1/4 group"><div class="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-xl relative flex items-end justify-center pb-3 text-white font-bold text-sm shadow-md transition-all duration-1000" style="height: ${validStudentsCount?(failCount/validStudentsCount)*100:0}%">${toKhmerNum(failCount.toString())}</div><span class="text-[11px] font-bold text-slate-500 uppercase mt-2">ធ្លាក់សរុប</span></div><div class="flex flex-col items-center gap-2 w-1/4 group"><div class="w-full bg-gradient-to-t from-rose-700 to-rose-500 rounded-t-xl relative flex items-end justify-center pb-3 text-white font-bold text-sm shadow-md transition-all duration-1000" style="height: ${validStudentsCount?((totalFemale-femalePassCount)/validStudentsCount)*100:0}%">${toKhmerNum((totalFemale-femalePassCount).toString())}</div><span class="text-[11px] font-bold text-slate-500 uppercase mt-2">ធ្លាក់ (ស្រី)</span></div></div></div></div>
  `;
}

window.renderLists = function(students, grade, roomNum, examType, examDate, header1, header2, principalTitle, globalStartIndex, showStamp, examSubjects, lunarDateStr, solarDateStr) {
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  let doorTbody = ""; let sigTbody = ""; let femaleCount = 0;
  
  students.forEach((s, index) => {
    const seatNum = toKhmerNum(String(globalStartIndex + index + 1).padStart(3, '0'));
    const gender = s.gender === "ស្រី" ? "ស" : "ប";
    if(s.gender === "ស្រី") femaleCount++;
    
    // បញ្ជីបិទទ្វារ
    doorTbody += `<tr class="h-[28px] border-b border-slate-500 print:border-black text-[11px]">
        <td class="border-r border-slate-500 print:border-black text-center num-score">${toKhmerNum((index + 1).toString())}</td>
        <td class="border-r border-slate-500 print:border-black text-center num-id whitespace-nowrap">${seatNum}</td>
        <td class="border-r border-slate-500 print:border-black px-2 text-left font-bold font-siemreap whitespace-nowrap">${s.name}</td>
        <td class="border-r border-slate-500 print:border-black text-center font-siemreap">${gender}</td>
        <td class="border-r border-slate-500 print:border-black text-center num-score whitespace-nowrap">${s.dob||'-'}</td>
        <td class="border-r border-slate-500 print:border-black text-center font-siemreap">${s.grade || grade}</td>
        <td class="text-center font-siemreap"></td>
    </tr>`;
    
    // បញ្ជីហត្ថលេខា: កំណត់ទំហំ TD ឱ្យនៅតូចគៀកៗគ្នា (w-8 min-w-[32px])
    let subjectTds = examSubjects.map(() => `<td class="border-r border-slate-500 print:border-black w-8 min-w-[32px] max-w-[40px]"></td>`).join('');
    
    sigTbody += `<tr class="h-[32px] border-b border-slate-500 print:border-black text-[11px]">
        <td class="border-r border-slate-500 print:border-black text-center num-score">${toKhmerNum((index + 1).toString())}</td>
        <td class="border-r border-slate-500 print:border-black text-center num-id whitespace-nowrap">${seatNum}</td>
        <td class="border-r border-slate-500 print:border-black px-2 text-left font-bold font-siemreap whitespace-nowrap">${s.name}</td>
        <td class="border-r border-slate-500 print:border-black text-center font-siemreap">${gender}</td>
        <td class="border-r border-slate-500 print:border-black text-center num-score whitespace-nowrap">${s.dob||'-'}</td>
        ${subjectTds}
        <td class="text-center font-siemreap"></td>
    </tr>`;
  });
  
  // ក្បាលមុខវិជ្ជា (កាត់យកតែតួអក្សរខ្លីៗ ដូចជា ភា.. គ.. និងកំណត់ទំហំតូច)
  const thSubjectsHtml = examSubjects.map((sub) => `<th class="border-r border-slate-500 print:border-black py-1 px-0.5 font-bold text-[10px] w-8 min-w-[32px] max-w-[40px] truncate" title="${sub}">${sub.length > 2 ? sub.substring(0,2) + '..' : sub}</th>`).join('');
  
  const headerHtml = `<div class="relative w-full flex justify-center mb-6 font-siemreap"><div class="absolute left-0 top-0 text-center w-[200px]"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Seal_of_the_Ministry_of_Education_Youth_and_Sport_of_Cambodia.svg/1024px-Seal_of_the_Ministry_of_Education_Youth_and_Sport_of_Cambodia.svg.png" class="w-14 h-14 mx-auto mb-1 opacity-90 object-contain"><p class="font-moul text-[11px] leading-tight">${header1}</p><p class="font-moul text-[12px] mt-1 leading-tight">${header2}</p></div><div class="text-center pt-2"><p class="text-[14px] tracking-widest font-moul">ព្រះរាជាណាចក្រកម្ពុជា</p><p class="text-[13px] tracking-wide font-moul mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</p><div class="tracking-[4px] mt-1 text-[11px] font-serif font-bold">* * * 📖 * * *</div></div><div class="absolute right-0 top-6 text-right"><p class="font-moul text-[14px]">បន្ទប់លេខ <span class="num-id text-lg font-black ml-1">${toKhmerNum(roomNum.toString())}</span></p></div></div>`;
  const stampSignatureHtml = showStamp ? `<div class="relative w-full h-20 flex flex-col items-center justify-center mt-3 mb-2 pointer-events-none"><div class="absolute w-20 h-20 rounded-full border-[2px] border-blue-800 text-blue-800 opacity-50 rotate-[-15deg] flex flex-col items-center justify-center z-0"><span class="text-[7px] font-moul uppercase tracking-widest">ព្រះរាជាណាចក្រកម្ពុជា</span><span class="text-[10px] font-black leading-none my-0.5 font-siemreap">★</span><span class="text-[6px] font-moul uppercase truncate px-2 max-w-full leading-tight">${header2}</span></div><div class="absolute z-10 font-moul text-blue-900 text-2xl opacity-70 rotate-[-10deg]">ហត្ថលេខា</div></div>` : `<div class="h-20 mt-3 mb-2"></div>`;
  const footerHtml = `<div class="w-full mt-4 text-[11px] font-bold px-2 font-siemreap"><div class="text-left font-siemreap">បញ្ឈប់បញ្ជីត្រឹមបេក្ខជនចំនួន <span class="num-score">${toKhmerNum(students.length.toString())}</span> នាក់ ស្រី <span class="num-score">${toKhmerNum(femaleCount.toString())}</span> នាក់</div></div><div class="flex justify-between mt-4 text-[11px] font-bold"><div class="text-center w-[45%] flex flex-col items-center z-10 relative font-siemreap"><p class="font-moul text-[12px] w-full">បានឃើញ និងឯកភាព</p><p class="font-moul text-[12px] w-full">${principalTitle}</p>${stampSignatureHtml}<p class="font-moul text-[12px] w-full z-20 relative">នាមត្រកូល និងនាម</p></div><div class="text-center w-[45%] flex flex-col items-center font-siemreap"><p class="font-siemreap font-bold text-[11px] w-full whitespace-nowrap" contenteditable="true">${lunarDateStr}</p><p class="font-siemreap font-bold text-[11px] mt-1 w-full whitespace-nowrap" contenteditable="true">${solarDateStr}</p><p class="font-moul text-[12px] mt-2 w-full">អ្នកធ្វើបញ្ជី</p><div class="h-20 w-full"></div><p class="font-moul text-[12px] w-full">នាមត្រកូល និងនាម</p></div></div>`;
  
  // បញ្ជីបិទទ្វារ
  document.getElementById("printDoorList").innerHTML = `<div class="print-content h-full w-full flex flex-col" style="font-family: 'Siemreap', sans-serif; color: black;">${headerHtml}<div class="text-center mb-4 mt-6"><h2 class="text-[14px] font-bold tracking-wide font-moul leading-snug">បញ្ជីឈ្មោះសិស្សប្រឡងប្រចាំ${examType}</h2><div class="mt-2 text-[12px] font-bold flex justify-center items-center font-siemreap"><span class="font-moul">សម័យប្រឡង៖ <span class="num-score">${examDate}</span></span></div></div><table class="w-full border-collapse border-[2px] border-slate-500 print:border-black text-center mt-2 font-siemreap"><thead><tr class="bg-slate-100 print:bg-transparent font-bold h-10 border-b-[2px] border-slate-500 print:border-black text-[11px] font-moul leading-tight"><th class="border-r border-slate-500 print:border-black w-10">ល.រ</th><th class="border-r border-slate-500 print:border-black w-16 whitespace-nowrap">លេខតុ</th><th class="border-r border-slate-500 print:border-black w-auto text-left px-2 whitespace-nowrap">គោត្តនាម និងនាម</th><th class="border-r border-slate-500 print:border-black w-10">ភេទ</th><th class="border-r border-slate-500 print:border-black w-24 whitespace-nowrap">ថ្ងៃខែឆ្នាំកំណើត</th><th class="border-r border-slate-500 print:border-black w-24">មកពីថ្នាក់</th><th class="w-24">ផ្សេងៗ</th></tr></thead><tbody>${doorTbody}</tbody></table>${footerHtml}</div>`;
  
  // បញ្ជីហត្ថលេខា (ទុកឱ្យ w-auto ស្រូបយក space ឯ w-8 នៅរួមតូច)
  document.getElementById("printSignatureList").innerHTML = `<div class="print-content h-full w-full flex flex-col" style="font-family: 'Siemreap', sans-serif; color: black;">${headerHtml}<div class="text-center mb-4 mt-6"><h2 class="text-[14px] font-bold tracking-wide font-moul leading-snug">បញ្ជីស្រង់អវត្តមានបេក្ខជនប្រឡងប្រចាំ${examType}</h2><div class="mt-2 text-[12px] font-bold flex justify-center items-center font-siemreap"><span class="font-moul">សម័យប្រឡង៖ <span class="num-score">${examDate}</span></span></div></div><table class="w-full border-collapse border-[2px] border-slate-500 print:border-black text-center mt-2 font-siemreap"><thead><tr class="bg-slate-100 print:bg-transparent font-bold border-b-[2px] border-slate-500 print:border-black text-[11px] font-moul leading-tight"><th rowspan="2" class="border-r border-slate-500 print:border-black w-10 py-1">ល.រ</th><th rowspan="2" class="border-r border-slate-500 print:border-black w-16 py-1 whitespace-nowrap">លេខតុ</th><th rowspan="2" class="border-r border-slate-500 print:border-black w-auto text-left px-2 py-1 whitespace-nowrap">គោត្តនាម និងនាម</th><th rowspan="2" class="border-r border-slate-500 print:border-black w-10 py-1">ភេទ</th><th rowspan="2" class="border-r border-slate-500 print:border-black w-24 py-1 whitespace-nowrap">ថ្ងៃខែឆ្នាំកំណើត</th><th colspan="${examSubjects.length}" class="border-r border-slate-500 print:border-black border-b border-slate-500 print:border-black py-1 w-auto">ហត្ថលេខា</th><th rowspan="2" class="w-20 py-1 text-[9px] font-siemreap">កំណត់សម្គាល់</th></tr><tr class="bg-slate-100 print:bg-transparent font-bold border-b-[2px] border-slate-500 print:border-black text-[9px] font-siemreap">${thSubjectsHtml}</tr></thead><tbody>${sigTbody}</tbody></table>${footerHtml}</div>`;
}

window.renderSeatingPlan = function(students, grade, roomNum, examType, schoolName, globalStartIndex) {
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  
  const layoutType = document.getElementById('seatingLayoutType') ? document.getElementById('seatingLayoutType').value : 'normal';
  
  let gridHtml = '';
  
  // ប្លង់តុរាងអក្សរ ណ សម្រាប់សិស្ស (រូបរាងអក្សរ ណ ជាក់ស្តែង)
  if (layoutType === 'no_shape') {
      gridHtml = `<div class="grid grid-cols-6 gap-4 mt-8 w-full font-siemreap max-w-[700px] mx-auto">`;
      let seatIndex = 0;
      // ជួរឈរខាងឆ្វេង (2), ជួរឈរខាងស្តាំ (2), តុបិទគូទខាងក្រោយ (ជួរចុងក្រោយ)
      const allowedCells = [
          0,1,       4,5,
          6,7,       10,11,
          12,13,     16,17,
          18,19,     22,23,
          24,25,     28,29,
          30,31,32,33,34,35 // បិទគូទ
      ];
      
      for (let i = 0; i < 36; i++) {
          if (allowedCells.includes(i) && seatIndex < students.length) {
              const s = students[seatIndex];
              const seatNum = toKhmerNum(String(globalStartIndex + seatIndex + 1).padStart(3, '0'));
              gridHtml += `
                  <div class="border-[2px] border-slate-800 print:border-black rounded-lg p-2 text-center relative bg-white flex flex-col justify-center min-h-[70px]">
                      <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-[10px] font-bold text-slate-500 print:text-black whitespace-nowrap font-siemreap">តុលេខ</div>
                      <div class="text-rose-600 print:text-black font-black num-score text-lg leading-none mt-1">${seatNum}</div>
                      <div class="font-siemreap font-bold text-[10px] text-slate-800 print:text-black leading-tight mt-1 truncate w-full">${s.name}</div>
                  </div>`;
              seatIndex++;
          } else if (allowedCells.includes(i) && seatIndex >= students.length) {
               gridHtml += `<div class="border-[2px] border-dashed border-slate-300 print:border-gray-400 rounded-lg p-2 min-h-[70px] bg-slate-50 print:bg-transparent"></div>`;
          } else {
               gridHtml += `<div></div>`; // ចន្លោះកណ្តាល (ផ្លូវដើរ)
          }
      }
      gridHtml += `</div>`;
  } else {
      // ប្លង់ធម្មតា ៥ជួរ
      gridHtml = `<div class="grid grid-cols-5 gap-4 mt-8 w-full font-siemreap">`;
      students.forEach((s, idx) => {
        const seatNum = toKhmerNum(String(globalStartIndex + idx + 1).padStart(3, '0'));
        gridHtml += `
            <div class="border-[2px] border-slate-800 print:border-black rounded-lg p-2 text-center relative bg-white flex flex-col justify-center min-h-[70px]">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-[10px] font-bold text-slate-500 print:text-black whitespace-nowrap font-siemreap">តុលេខ</div>
                <div class="text-rose-600 print:text-black font-black num-score text-lg leading-none mt-1">${seatNum}</div>
                <div class="font-siemreap font-bold text-[10px] text-slate-800 print:text-black leading-tight mt-1 truncate w-full">${s.name}</div>
            </div>`;
      });
      const rem = students.length % 5;
      if (rem !== 0) { for(let i=0; i<(5-rem); i++) gridHtml += `<div class="border-[2px] border-dashed border-slate-300 print:border-gray-400 rounded-lg p-2 min-h-[70px] bg-slate-50 print:bg-transparent"></div>`; }
      gridHtml += `</div>`;
  }
  
  document.getElementById("printSeatingPlan").innerHTML = `<div class="print-content h-full flex flex-col items-center w-full" style="font-family: 'Siemreap', sans-serif; color: black;"><h2 class="text-lg font-bold uppercase tracking-wide font-moul mb-1">${schoolName}</h2><h3 class="text-base font-bold uppercase tracking-wide font-moul">ប្លង់តុបេក្ខជនប្រឡង ${examType}</h3><div class="mt-2 text-[13px] font-bold flex justify-center items-center gap-4 border-b border-black pb-2 w-full font-siemreap"><span>បន្ទប់លេខ៖ <span class="num-score text-[16px] text-rose-600 print:text-black">${toKhmerNum(roomNum.toString())}</span></span><span>|</span><span>ថ្នាក់ទី៖ <span class="font-moul">${grade}</span></span><span>|</span><span>បេក្ខជនសរុប៖ <span class="num-score text-[16px] text-rose-600 print:text-black">${toKhmerNum(students.length.toString())}</span> នាក់</span></div><div class="w-1/3 bg-slate-200 print:bg-gray-200 border-2 border-slate-800 print:border-black text-center py-2 rounded-md shadow-sm mt-8 mb-4"><span class="font-moul text-sm">ក្តារខៀន (តុអនុរក្ស)</span></div>${gridHtml}<div class="w-full flex justify-between mt-auto pt-10 text-[12px] font-bold px-12"><div class="text-center"><p class="font-moul mb-16">អនុរក្សទី១</p></div><div class="text-center"><p class="font-moul mb-16">អនុរក្សទី២</p></div></div></div>`;
}

window.renderDeskLabels = function(students, grade, roomNum, examType, schoolName, globalStartIndex) {
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  let labelsHtml = `<div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">`;
  students.forEach((s, idx) => {
    const seatNum = toKhmerNum(String(globalStartIndex + idx + 1).padStart(3, '0'));
    const khId = toKhmerNum(s.id);
    labelsHtml += `<div class="border-[2px] border-slate-800 print:border-black p-3 rounded-lg bg-white relative break-inside-avoid font-siemreap"><div class="text-center font-moul text-[10px] mb-1 text-slate-800 print:text-black border-b border-dashed border-slate-400 print:border-gray-500 pb-1 truncate">${schoolName}</div><div class="text-[9px] font-bold text-center mb-2 text-slate-600 print:text-black truncate">${examType} | បន្ទប់ទី <span class="num-score">${toKhmerNum(roomNum.toString())}</span></div><div class="flex justify-between items-end"><div class="space-y-1 w-2/3 pr-1"><div class="text-[10px] font-bold truncate">អត្តលេខ៖ <span class="num-id text-[11px]">${khId}</span></div><div class="text-[11px] font-bold truncate">ឈ្មោះ៖ <span class="font-siemreap font-bold text-indigo-800 print:text-black">${s.name}</span></div></div><div class="text-center border-l-2 border-slate-800 print:border-black pl-2 ml-1 w-1/3"><div class="text-[9px] font-bold text-slate-500 print:text-black mb-0.5">លេខតុ</div><div class="num-score font-black text-2xl text-rose-600 print:text-black leading-none">${seatNum}</div></div></div></div>`;
  });
  labelsHtml += `</div>`;
  document.getElementById("printDeskLabels").innerHTML = `<div class="print-content h-full w-full" style="font-family: 'Siemreap', sans-serif; color: black;"><div class="text-center text-[11px] font-bold text-slate-500 mb-4 no-print border-b pb-2 font-siemreap"><i class="fa-solid fa-scissors mr-1"></i> កាត់តាមគែមបន្ទាត់ដើម្បីបិទលើតុបេក្ខជន</div>${labelsHtml}</div>`;
}

window.renderAdmitCards = function(students, grade, roomNum, examType, examDate, schoolName, globalStartIndex) {
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  let cardsHtml = `<div class="grid grid-cols-2 gap-4 w-full">`;
  students.forEach((s, idx) => {
    const seatNum = toKhmerNum(String(globalStartIndex + idx + 1).padStart(3, '0'));
    const khId = toKhmerNum(String(s.id));
    const photoSrc = s.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=128&background=random`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(s.id + '|' + s.name)}`;
    cardsHtml += `<div class="border-[2px] border-slate-800 print:border-black rounded-xl p-0 bg-white relative break-inside-avoid overflow-hidden flex flex-col h-[70mm] font-siemreap"><div class="bg-indigo-800 print:bg-slate-200 print:text-black text-white p-2 text-center border-b-[2px] border-slate-800 print:border-black shrink-0"><h4 class="font-moul text-[11px]">${schoolName}</h4><p class="font-bold text-[9px] mt-0.5 tracking-wide font-siemreap">ប័ណ្ណចូលប្រឡង (Admit Card) - ${examType}</p></div><div class="p-3 flex-1 flex gap-3"><div class="w-[20mm] shrink-0 flex flex-col items-center gap-2"><img src="${photoSrc}" class="w-full aspect-[3/4] object-cover border border-slate-400 rounded p-0.5"><img src="${qrUrl}" class="w-[15mm] h-[15mm] object-cover"></div><div class="flex-1 text-[10px] space-y-1.5 font-bold text-slate-800 print:text-black"><div class="flex border-b border-slate-200 pb-0.5"><span class="w-16 text-slate-500">អត្តលេខ៖</span> <span class="num-id text-indigo-700 print:text-black">${khId}</span></div><div class="flex border-b border-slate-200 pb-0.5"><span class="w-16 text-slate-500">ឈ្មោះ៖</span> <span class="font-siemreap font-bold text-[12px]">${s.name}</span></div><div class="flex border-b border-slate-200 pb-0.5"><span class="w-16 text-slate-500">ភេទ/ថ្ងៃកំណើត៖</span> <span class="font-normal font-siemreap">${s.gender} | <span class="num-score">${toKhmerNum(s.dob)||'-'}</span></span></div><div class="flex border-b border-slate-200 pb-0.5"><span class="w-16 text-slate-500">ថ្នាក់ទី៖</span> <span class="font-normal font-siemreap">${grade}</span></div><div class="flex border-b border-slate-200 pb-0.5"><span class="w-16 text-slate-500">កាលបរិច្ឆេទ៖</span> <span class="font-normal num-score">${examDate}</span></div></div><div class="w-[18mm] shrink-0 text-center border-l border-slate-300 pl-2 flex flex-col justify-center"><span class="text-[8px] text-slate-500 mb-1">បន្ទប់ / លេខតុ</span><div class="num-score font-black text-lg text-rose-600 print:text-black leading-none">${toKhmerNum(roomNum.toString())}</div><div class="w-full h-px bg-slate-300 my-1"></div><div class="num-score font-black text-2xl text-indigo-700 print:text-black leading-none">${seatNum}</div></div></div></div>`;
  });
  cardsHtml += `</div>`;
  document.getElementById("printAdmitCards").innerHTML = `<div class="print-content h-full w-full" style="font-family: 'Siemreap', sans-serif; color: black;"><div class="text-center text-[11px] font-bold text-slate-500 mb-4 no-print border-b pb-2 font-siemreap"><i class="fa-solid fa-scissors mr-1"></i> កាត់តាមគែមសម្រាប់ចែកបេក្ខជនយកចូលប្រឡង (៤ សន្លឹក/ទំព័រ A4)</div>${cardsHtml}</div>`;
}

// -------------------------------------------------------------
// RENDER Exam Timetable (បំបែកវេនព្រឹក និង វេនរសៀល ដោយស្វ័យប្រវត្តិ)
// -------------------------------------------------------------
window.renderExamTimetable = function(grade, examType, examDate, ttHeader1, ttHeader2, authTitle, showStamp, lunarDateStr, solarDateStr) {
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  
  const stampSignatureHtml = showStamp ? `<div class="relative w-full h-24 flex flex-col items-center justify-center mt-4 mb-2 pointer-events-none"><div class="absolute w-24 h-24 rounded-full border-[2px] border-blue-800 text-blue-800 opacity-30 rotate-[-15deg] flex flex-col items-center justify-center z-0"><span class="text-[8px] font-moul uppercase tracking-widest text-blue-800">ព្រះរាជាណាចក្រកម្ពុជា</span><span class="text-[12px] font-black leading-none my-1 text-blue-800 font-siemreap">★</span><span class="text-[7px] font-moul uppercase truncate px-2 max-w-full leading-tight text-blue-800">${ttHeader2}</span></div><div class="absolute z-10 font-moul text-blue-900 text-3xl opacity-70 rotate-[-10deg]">ហត្ថលេខា</div></div>` : `<div class="h-24 mt-4 mb-2"></div>`;
  
  // Dynamic Timetable Generation
  let timetableHtml = "";
  const groupedSubjects = {};
  
  // Group by Date
  window.examSubjectsData.forEach(sub => {
      if (!groupedSubjects[sub.date]) groupedSubjects[sub.date] = [];
      groupedSubjects[sub.date].push(sub);
  });
  
  const khMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  let firstDateStr = "";
  
  // អនុគមន៍សម្រាប់ទាញយកម៉ោង ដើម្បីបែងចែកព្រឹក/រសៀល
  const parseHour = (timeStr) => {
      let match = timeStr.match(/[0-9០-៩]+/);
      if(!match) return 0;
      let numStr = match[0].split('').map(n => khmerNumbers.indexOf(n) !== -1 ? khmerNumbers.indexOf(n) : n).join('');
      return parseInt(numStr, 10);
  };

  for (const [dateStr, subjects] of Object.entries(groupedSubjects)) {
      let displayDate = dateStr;
      const parts = dateStr.split('-');
      if (parts.length === 3) {
          if (parts[0].length === 4) { // ទម្រង់ YYYY-MM-DD
              displayDate = `ថ្ងៃទី${toKhmerNum(parts[2])} ខែ${khMonths[parseInt(parts[1])-1] || parts[1]} ឆ្នាំ${toKhmerNum(parts[0])}`;
              if(!firstDateStr) firstDateStr = `${toKhmerNum(parts[2])} ${khMonths[parseInt(parts[1])-1] || parts[1]} ${toKhmerNum(parts[0])}`;
          } else { // ទម្រង់ DD-MM-YYYY
              displayDate = `ថ្ងៃទី${toKhmerNum(parts[0])} ខែ${khMonths[parseInt(parts[1])-1] || parts[1]} ឆ្នាំ${toKhmerNum(parts[2])}`;
              if(!firstDateStr) firstDateStr = `${toKhmerNum(parts[0])} ${khMonths[parseInt(parts[1])-1] || parts[1]} ${toKhmerNum(parts[2])}`;
          }
      }
      
      // បំបែកមុខវិជ្ជាទៅជាវេនព្រឹក និងរសៀល
      const morningSubjects = subjects.filter(s => parseHour(s.time) < 12);
      const afternoonSubjects = subjects.filter(s => parseHour(s.time) >= 12);
      
      timetableHtml += `
        <div class="mt-6 mb-2">
            <p class="font-moul text-[13px] hover:bg-slate-100 cursor-text outline-none" contenteditable="true">បរិច្ឆេទ ៖ ${displayDate}</p>
        </div>
        <div class="w-full text-[13px] font-siemreap leading-loose pl-4">
      `;
      
      // បង្ហាញវេនព្រឹក
      if(morningSubjects.length > 0) {
          timetableHtml += `<p class="font-bold underline mb-1">ពេលព្រឹក</p>`;
          morningSubjects.forEach(sub => {
              let timeParts = sub.time.split('-');
              let startTime = timeParts[0] ? timeParts[0].trim() : '';
              let endTime = timeParts[1] ? timeParts[1].trim() : '';
              let dur = sub.duration.replace(/នាទី/g, '').trim();
              let points = toKhmerNum((sub.multiplier * 50).toString());
              let timeString = endTime ? `ម៉ោង <span class="num-score">${startTime}</span> ដល់ម៉ោង <span class="num-score">${endTime}</span>` : `ម៉ោង <span class="num-score">${startTime}</span>`;
              
              timetableHtml += `
                <div class="flex justify-between items-center pl-8 hover:bg-slate-100 cursor-text outline-none" contenteditable="true">
                    <div class="w-1/2">${timeString} ៖ ${sub.name}</div>
                    <div class="w-1/4 text-center">( <span class="num-score">${dur}</span>នាទី )</div>
                    <div class="w-1/4 text-center">( បែបពិន្ទុ <span class="num-score">${points}</span>ពិន្ទុ )</div>
                </div>
              `;
          });
      }
      
      // បង្ហាញវេនរសៀល
      if(afternoonSubjects.length > 0) {
          timetableHtml += `<p class="font-bold underline mb-1 mt-3">ពេលរសៀល</p>`;
          afternoonSubjects.forEach(sub => {
              let timeParts = sub.time.split('-');
              let startTime = timeParts[0] ? timeParts[0].trim() : '';
              let endTime = timeParts[1] ? timeParts[1].trim() : '';
              let dur = sub.duration.replace(/នាទី/g, '').trim();
              let points = toKhmerNum((sub.multiplier * 50).toString());
              let timeString = endTime ? `ម៉ោង <span class="num-score">${startTime}</span> ដល់ម៉ោង <span class="num-score">${endTime}</span>` : `ម៉ោង <span class="num-score">${startTime}</span>`;
              
              timetableHtml += `
                <div class="flex justify-between items-center pl-8 hover:bg-slate-100 cursor-text outline-none" contenteditable="true">
                    <div class="w-1/2">${timeString} ៖ ${sub.name}</div>
                    <div class="w-1/4 text-center">( <span class="num-score">${dur}</span>នាទី )</div>
                    <div class="w-1/4 text-center">( បែបពិន្ទុ <span class="num-score">${points}</span>ពិន្ទុ )</div>
                </div>
              `;
          });
      }
      timetableHtml += `</div>`;
  }
  
  if(!firstDateStr) firstDateStr = "១២ កុម្ភៈ ២០២៦";

  document.getElementById("printExamTimetable").innerHTML = `
    <div class="print-content h-full flex flex-col items-center w-full max-w-[794px] mx-auto bg-white p-10 border border-slate-300 shadow-xl" style="font-family: 'Siemreap', sans-serif; color: black;">
        <div class="w-full flex justify-between items-start text-[13px] font-moul mb-10">
            <div class="text-center w-[250px] leading-relaxed">
                <p class="hover:bg-slate-100 cursor-text outline-none" contenteditable="true">${ttHeader1}</p>
                <p class="hover:bg-slate-100 cursor-text outline-none" contenteditable="true">${ttHeader2}</p>
                <div class="mt-2 w-16 h-px bg-black mx-auto"></div>
            </div>
            <div class="text-center w-[250px] leading-relaxed">
                <p class="text-[14px]">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p class="text-[14px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div class="mt-1 w-12 h-px bg-black mx-auto relative">
                    <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-black rotate-45"></div>
                </div>
            </div>
        </div>
        
        <div class="text-center mb-8 w-full">
            <h2 class="font-moul text-lg uppercase tracking-wide leading-relaxed hover:bg-slate-100 cursor-text outline-none" contenteditable="true">តារាងប្រព្រឹត្តទៅនៃវិញ្ញាសា</h2>
            <h3 class="font-moul text-[14px] uppercase tracking-wide leading-relaxed hover:bg-slate-100 cursor-text outline-none" contenteditable="true">ប្រឡង${examType} សម្រាប់${grade}</h3>
            <p class="font-moul text-[13px] mt-2 hover:bg-slate-100 cursor-text outline-none" contenteditable="true">សម័យប្រឡង ៖ <span class="num-score">${firstDateStr}</span></p>
        </div>
        
        <div class="w-full text-left font-siemreap text-[13px] px-4 font-bold" style="outline:none;">
            ${timetableHtml}
        </div>
        
        <div class="w-full flex justify-end mt-16 pr-10 text-[13px]">
            <div class="text-center w-[60%] flex flex-col items-center z-10 relative">
                <p class="font-siemreap font-bold text-[11px] w-full whitespace-nowrap" contenteditable="true">${lunarDateStr}</p>
                <p class="font-siemreap font-bold text-[11px] mt-1 w-full whitespace-nowrap" contenteditable="true">${solarDateStr}</p>
                <p class="font-moul text-[13px] hover:bg-slate-100 cursor-text outline-none w-full z-10 relative mt-2" contenteditable="true">${authTitle}</p>
                ${stampSignatureHtml}
                <p class="font-moul text-[13px] hover:bg-slate-100 cursor-text outline-none w-full z-20 relative" contenteditable="true">នាមត្រកូល និងនាម</p>
            </div>
        </div>
    </div>`;
}

// -------------------------------------------------------------
// រក្សាទុកពិន្ទុទៅកាន់ Local Storage និង Google Sheets
// -------------------------------------------------------------
window.saveExamScores = function() {
  // Save to Local Storage first (សម្រាប់ការប្រើប្រាស់ Offline)
  localStorage.setItem('exam_scores_data', JSON.stringify(window.examScoresData));
  localStorage.setItem('exam_subjects_data', JSON.stringify(window.examSubjectsData));
  
  if (typeof showToast === 'function') {
      showToast("✅ រក្សាទុកក្នុងម៉ាស៊ីនជោគជ័យ កំពុងបញ្ជូនទៅ Google Sheets...");
  }
  
  // បើមានភ្ជាប់ជាមួយ Google Sheets
  if (window.GAS_WEB_APP_URL && window.GAS_WEB_APP_URL !== "ដាក់_URL_Google_App_Script_នៅទីនេះ") {
      fetch(window.GAS_WEB_APP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `action=saveScores&data=${encodeURIComponent(JSON.stringify(window.examScoresData))}`
      }).then(res => res.json()).then(data => {
          console.log("Scores Saved to Cloud:", data);
          if (typeof showToast === 'function') showToast("✅ ទិន្នន័យបានរក្សាទុកទៅកាន់ Google Sheets ជោគជ័យ!");
      }).catch(err => console.error("Cloud Save Error:", err));
  } else {
      if (typeof showToast !== 'function') alert("រក្សាទុកពិន្ទុចូលម៉ាស៊ីនជោគជ័យ! (មិនទាន់ភ្ជាប់ Google Sheets ទេ)");
  }
  
  window.processExamData(); 
}

window.renderInvigilatorList = function(grade, examType, examDate, header1, header2, principalTitle, showStamp, lunarDateStr, solarDateStr) {
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  let invTbody = "";
  for (let i = 1; i <= 20; i++) {
      let roleText = "អនុរក្ស"; if (i === 1) roleText = "ប្រធានមណ្ឌល"; else if (i === 2) roleText = "អនុប្រធានមណ្ឌល";
      invTbody += `<tr class="h-[35px] transition border-b border-slate-500 print:border-black text-[12px] font-siemreap"><td class="border-r border-slate-500 print:border-black text-center font-normal num-score">${toKhmerNum(i.toString())}</td><td class="border-r border-slate-500 print:border-black px-2 text-left font-bold font-moul outline-none hover:bg-slate-50 cursor-text" contenteditable="true"></td><td class="border-r border-slate-500 print:border-black text-center outline-none hover:bg-slate-50 cursor-text" contenteditable="true">${roleText}</td><td class="border-r border-slate-500 print:border-black text-center"></td><td class="border-r border-slate-500 print:border-black text-center"></td><td class="text-center outline-none hover:bg-slate-50 cursor-text" contenteditable="true"></td></tr>`;
  }
  const stampSignatureHtml = showStamp ? `<div class="relative w-full h-20 flex flex-col items-center justify-center mt-3 mb-2 pointer-events-none"><div class="absolute w-20 h-20 rounded-full border-[2px] border-blue-800 text-blue-800 opacity-50 rotate-[-15deg] flex flex-col items-center justify-center z-0"><span class="text-[7px] font-moul uppercase tracking-widest text-blue-800">ព្រះរាជាណាចក្រកម្ពុជា</span><span class="text-[10px] font-black leading-none my-0.5 text-blue-800 font-siemreap">★</span><span class="text-[6px] font-moul uppercase truncate px-2 max-w-full leading-tight text-blue-800">${header2}</span></div><div class="absolute z-10 font-moul text-blue-900 text-2xl opacity-70 rotate-[-10deg]">ហត្ថលេខា</div></div>` : `<div class="h-20 mt-3 mb-2"></div>`;
  document.getElementById("printInvigilatorList").innerHTML = `<div class="print-content h-full w-full flex flex-col" style="font-family: 'Siemreap', sans-serif; color: black;"><div class="relative w-full flex justify-center mb-6"><div class="absolute left-0 top-0 text-center w-[200px]"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Seal_of_the_Ministry_of_Education_Youth_and_Sport_of_Cambodia.svg/1024px-Seal_of_the_Ministry_of_Education_Youth_and_Sport_of_Cambodia.svg.png" class="w-14 h-14 mx-auto mb-1 opacity-90 object-contain"><p class="font-moul text-[11px] text-slate-800 print:text-black leading-tight hover:bg-slate-100 cursor-text outline-none" contenteditable="true">${header1}</p><p class="font-moul text-[12px] text-blue-900 print:text-black mt-1 leading-tight hover:bg-slate-100 cursor-text outline-none" contenteditable="true">${header2}</p></div><div class="text-center pt-2"><p class="text-[14px] tracking-widest font-moul text-slate-900 print:text-black">ព្រះរាជាណាចក្រកម្ពុជា</p><p class="text-[13px] tracking-wide font-moul text-slate-900 print:text-black mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</p><div class="tracking-[4px] mt-1 text-[11px] font-serif text-slate-600 print:text-black font-bold">* * * 📖 * * *</div></div></div><div class="text-center mb-4 mt-6"><h2 class="text-[14px] font-bold tracking-wide font-moul text-slate-900 print:text-black leading-snug hover:bg-slate-100 cursor-text outline-none" contenteditable="true">បញ្ជីវត្តមានគណៈមេប្រយោគ និងអនុរក្ស</h2><div class="mt-2 text-[12px] font-bold flex justify-center items-center text-slate-800 print:text-black font-siemreap"><span class="font-moul hover:bg-slate-100 cursor-text outline-none" contenteditable="true">សម័យប្រឡង៖ <span class="num-score">${examDate}</span></span></div></div><table class="w-full border-collapse border-[2px] border-slate-500 print:border-black text-center mt-2 table-fixed font-siemreap"><thead><tr class="bg-slate-100 print:bg-transparent font-bold border-b-[2px] border-slate-500 print:border-black text-[11px] font-moul leading-tight"><th rowspan="2" class="border-r border-slate-500 print:border-black w-[5%] py-1">ល.រ</th><th rowspan="2" class="border-r border-slate-500 print:border-black w-[30%] text-left px-2 py-1">គោត្តនាម និងនាម</th><th rowspan="2" class="border-r border-slate-500 print:border-black w-[20%] py-1">តួនាទី</th><th colspan="2" class="border-r border-slate-500 print:border-black border-b border-slate-500 print:border-black py-1">ហត្ថលេខា</th><th rowspan="2" class="w-[15%] py-1 text-[9px] font-siemreap">កំណត់សម្គាល់</th></tr><tr class="bg-slate-100 print:bg-transparent font-bold border-b-[2px] border-slate-500 print:border-black text-[10px] font-siemreap"><th class="border-r border-slate-500 print:border-black py-1 px-1">ព្រឹក</th><th class="border-r border-slate-500 print:border-black py-1 px-1">រសៀល</th></tr></thead><tbody>${invTbody}</tbody></table><div class="flex justify-end mt-4 text-[11px] font-bold font-siemreap"><div class="text-center w-[45%] flex flex-col items-center z-10 relative"><p class="font-siemreap font-bold text-[11px] w-full whitespace-nowrap" contenteditable="true">${lunarDateStr}</p><p class="font-siemreap font-bold text-[11px] mt-1 w-full whitespace-nowrap" contenteditable="true">${solarDateStr}</p><p class="font-moul text-[12px] mt-2 hover:bg-slate-100 cursor-text outline-none w-full" contenteditable="true">${principalTitle}</p>${stampSignatureHtml}<p class="font-moul text-[12px] hover:bg-slate-100 cursor-text outline-none w-full z-20 relative" contenteditable="true">នាមត្រកូល និងនាម</p></div></div></div>`;
}

window.printExamDocument = function(type) {
  let targetId = ''; let title = ''; let isLandscape = false;
  if (type === 'doorList') { targetId = 'printDoorList'; title = 'បញ្ជីបិទមុខបន្ទប់ប្រឡង'; }
  else if (type === 'signatureList') { 
      targetId = 'printSignatureList'; 
      title = 'បញ្ជីស្រង់អវត្តមានប្រឡង'; 
      if (window.examSubjectsData && window.examSubjectsData.length > 2) isLandscape = true;
  }
  else if (type === 'seatingPlan') { targetId = 'printSeatingPlan'; title = 'ប្លង់តុប្រឡង'; }
  else if (type === 'deskLabels') { targetId = 'printDeskLabels'; title = 'ស្លាកលេខតុប្រឡង'; }
  else if (type === 'examTimetable') { targetId = 'printExamTimetable'; title = 'កាលវិភាគប្រឡង'; }
  else if (type === 'invigilatorList') { targetId = 'printInvigilatorList'; title = 'បញ្ជីវត្តមានអនុរក្ស'; }
  else if (type === 'admitCards') { targetId = 'printAdmitCards'; title = 'ប័ណ្ណចូលប្រឡងបេក្ខជន'; }
  else if (type === 'reportCards') { targetId = 'printReportCards'; title = 'ព្រឹត្តិបត្រពិន្ទុ (Report Cards)'; }
  else if (type === 'masterSheet') { targetId = 'printMasterSheet'; title = 'បញ្ជីស្រង់ពិន្ទុរួម'; isLandscape = true; }

  const printArea = document.getElementById(targetId);
  if (!printArea || printArea.innerHTML.includes("មិនមានទិន្នន័យបេក្ខជន")) {
    alert("សូមរង់ចាំឱ្យទិន្នន័យបង្ហាញសិន ឬត្រូវប្រាកដថាមានទិន្នន័យក្នុងថ្នាក់នេះ!"); return;
  }

  const orientation = isLandscape ? 'landscape' : 'portrait';
  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&family=Moul&family=Siemreap&display=swap');
        @page { size: A4 ${orientation}; margin: 15mm; }
        body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .font-moul, .num-rank, .num-id { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
        .font-siemreap, .num-score, .num-normal { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; font-weight: 500; }
        .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
      </style>
    </head>
    <body>${printArea.querySelector('.print-content') ? printArea.querySelector('.print-content').outerHTML : printArea.innerHTML}</body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  printWindow.document.open();
  printWindow.document.write(printDocument);
  printWindow.document.close();
  setTimeout(() => { printWindow.focus(); printWindow.print(); }, 1000);
}

window.exportToExcel = function(tableId, filename) {
  if (typeof XLSX === 'undefined') { alert("សូមបញ្ជូល Library SheetJS សិន ដើម្បីទាញយកជា Excel!"); return; }
  let table = document.getElementById(tableId);
  if(!table) return;
  let wb = XLSX.utils.table_to_book(table, {sheet: "Scores"});
  XLSX.writeFile(wb, filename + ".xlsx");
}