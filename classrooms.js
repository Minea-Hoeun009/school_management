// ==========================================
// ឯកសារ js/classrooms.js - ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀនតាមកម្រិតសាលា (Classroom Management Hub & Workspace)
// ==========================================

window.currentActiveGrade = ""; 

// ទិន្នន័យថ្នាក់រៀនបែងចែកតាមកម្រិតសាលា (បឋម, អនុវិទ្យាល័យ, វិទ្យាល័យ)
const defaultClassrooms = [
    // កម្រិតបឋមសិក្សា (Primary Level)
    { grade: "ថ្នាក់ទី ១", room: "«ក»", teacher: "សុខ សាន្ត", type: "primary" },
    { grade: "ថ្នាក់ទី ២", room: "«ខ»", teacher: "ហឿន មីនា", type: "primary" },
    { grade: "ថ្នាក់ទី ៣", room: "«ក»", teacher: "ចាន់ តារា", type: "primary" },
    { grade: "ថ្នាក់ទី ៤", room: "«ក»", teacher: "ស៊ន ពិសី", type: "primary" },
    { grade: "ថ្នាក់ទី ៥", room: "«ខ»", teacher: "ផន វណ្ណា", type: "primary" },
    { grade: "ថ្នាក់ទី ៦", room: "«ក»", teacher: "អ៊ុច សុភា", type: "primary" },

    // កម្រិតអនុវិទ្យាល័យ (Lower Secondary Level)
    { grade: "ថ្នាក់ទី ៧", room: "«ក»", teacher: "មាស សុខា", type: "lower_sec" },
    { grade: "ថ្នាក់ទី ៨", room: "«ខ»", teacher: "កែវ ធីតា", type: "lower_sec" },
    { grade: "ថ្នាក់ទី ៩", room: "«ក»", teacher: "ទន់ រ៉ានី", type: "lower_sec" },

    // កម្រិតវិទ្យាល័យ (Upper Secondary Level)
    { grade: "ថ្នាក់ទី ១០", room: "«ក»", teacher: "លឹម សុវណ្ណ", type: "upper_sec" },
    { grade: "ថ្នាក់ទី ១១", room: "«ខ»", teacher: "ស៊ឹង សុផាន់", type: "upper_sec" },
    { grade: "ថ្នាក់ទី ១២", room: "«ក»", teacher: "ហេង វិបុល", type: "upper_sec" }
];

window.loadClassroomsView = function() {
    const container = document.getElementById("classroomsContainer") || document.getElementById("mainContentArea");
    if (!container) return;

    let allStudents = JSON.parse(localStorage.getItem('academic_students')) || [];
    let classesData = JSON.parse(localStorage.getItem('academic_classrooms')) || defaultClassrooms;

    let cardsHtml = "";
    classesData.forEach(cls => {
        let fullGrade = `${cls.grade} ${cls.room}`;
        
        let cleanLevel = cls.grade.replace(/\s+/g, '');
        let cleanRoom = cls.room.replace(/[«»\s]/g, '');
        
        let classStudents = allStudents.filter(s => {
            if (s.status === "Dropped") return false;
            let sGrade = String(s.grade || "").replace(/\s+/g, '');
            let sRoom = String(s.room || "").replace(/[«»\s]/g, '');
            let fullDB = String(s.grade || "").replace(/\s+/g, ''); 
            return (sGrade === cleanLevel && sRoom === cleanRoom) || (fullDB.includes(cleanLevel) && fullDB.includes(cleanRoom));
        });

        let studentCount = classStudents.length > 0 ? classStudents.length : 0;

        let levelBadge = "";
        let iconColor = "";
        if (cls.type === "primary") {
            levelBadge = '<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">បឋមសិក្សា</span>';
            iconColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
        } else if (cls.type === "lower_sec") {
            levelBadge = '<span class="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">អនុវិទ្យាល័យ</span>';
            iconColor = "text-blue-600 bg-blue-50 border-blue-100";
        } else {
            levelBadge = '<span class="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">វិទ្យាល័យ</span>';
            iconColor = "text-indigo-600 bg-indigo-50 border-indigo-100";
        }

        cardsHtml += `
            <div onclick="openClassWorkspace('${cls.grade}', '${cls.room}', '${cls.teacher}')" class="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:border-indigo-300 hover:shadow-xl group relative overflow-hidden flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${iconColor}">
                            <i class="fa-solid fa-chalkboard-user"></i>
                        </div>
                        <div class="flex flex-col items-end gap-1.5">
                            ${levelBadge}
                            <div class="bg-slate-100 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 font-mono">
                                <i class="fa-solid fa-users text-indigo-500 mr-1"></i> ${toKhmerNum(studentCount.toString())} នាក់
                            </div>
                        </div>
                    </div>
                    
                    <div class="relative z-10 mt-2">
                        <h3 class="font-moul text-lg text-slate-800 tracking-wide group-hover:text-indigo-600 transition-colors">${fullGrade}</h3>
                        <p class="font-siemreap text-xs text-slate-500 mt-2 flex items-center gap-2">
                            <i class="fa-solid fa-user-tie text-slate-400"></i> គ្រូបន្ទុក៖ <strong class="text-slate-700 font-moul text-[11px]">${cls.teacher}</strong>
                        </p>
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                    <span>ចូលកាន់បន្ទប់ការងារ</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </div>
            </div>
        `;
    });

    container.className = "p-4 md:p-8 transition duration-300 w-full flex flex-col h-full bg-slate-50/50 min-h-0 font-siemreap overflow-y-auto custom-scrollbar";
    container.innerHTML = `
        <div class="animate-fade-in w-full max-w-[1600px] mx-auto pb-10">
            <!-- Header -->
            <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                <div>
                    <h2 class="text-xl md:text-2xl font-black text-slate-800 font-moul flex items-center gap-3">
                        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-indigo-100"><i class="fa-solid fa-school"></i></div>
                        ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀនតាមកម្រិត
                    </h2>
                    <p class="text-sm text-slate-500 mt-1 ml-1">ជ្រើសរើសថ្នាក់រៀនតាមកម្រិតបឋម អនុវិទ្យាល័យ និងវិទ្យាល័យ ដើម្បីគ្រប់គ្រងទិន្នន័យ</p>
                </div>
            </div>

            <!-- Grid of Classes -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${cardsHtml}
            </div>
        </div>
    `;
};

// បើកផ្ទាំងការងារផ្តាច់មុខសម្រាប់ថ្នាក់រៀនដែលបានជ្រើសរើស (Workspace)
window.openClassWorkspace = function(grade, room, teacher) {
    const container = document.getElementById("classroomsContainer") || document.getElementById("mainContentArea");
    if (!container) return;

    window.currentActiveGrade = `${grade} ${room}`;
    let gradeLevelForSelect = grade; 

    let allStudents = JSON.parse(localStorage.getItem('academic_students')) || [];
    let cleanLevel = grade.replace(/\s+/g, '');
    let cleanRoom = room.replace(/[«»\s]/g, '');

    let classStudents = allStudents.filter(s => {
        if (s.status === "Dropped") return false;
        let sGrade = String(s.grade || "").replace(/\s+/g, '');
        let sRoom = String(s.room || "").replace(/[«»\s]/g, '');
        let fullDB = String(s.grade || "").replace(/\s+/g, ''); 
        return (sGrade === cleanLevel && sRoom === cleanRoom) || (fullDB.includes(cleanLevel) && fullDB.includes(cleanRoom));
    });

    let totalSt = classStudents.length;
    let femaleSt = classStudents.filter(s => s.gender === "ស្រី").length;

    let studentsRows = "";
    if (classStudents.length > 0) {
        classStudents.forEach((st, idx) => {
            studentsRows += `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-4 text-center font-mono font-bold text-slate-500">${toKhmerNum((idx + 1).toString())}</td>
                    <td class="p-4 font-bold text-slate-800 font-moul text-xs">${st.name}</td>
                    <td class="p-4 text-center font-bold ${st.gender === 'ស្រី' ? 'text-rose-600' : 'text-blue-600'}">${st.gender}</td>
                    <td class="p-4 text-center font-mono text-slate-600">${st.dob || '-'}</td>
                    <td class="p-4 text-center"><span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">សកម្ម</span></td>
                </tr>
            `;
        });
    } else {
        studentsRows = `<tr><td colspan="5" class="p-12 text-center text-slate-400 font-bold">មិនទាន់មានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ</td></tr>`;
    }

    container.className = "p-4 md:p-8 transition duration-300 w-full flex flex-col h-full bg-slate-50/50 min-h-0 font-siemreap overflow-y-auto custom-scrollbar";
    container.innerHTML = `
        <div class="animate-fade-in w-full max-w-[1600px] mx-auto flex flex-col pb-10">
            
            <!-- Workspace Header -->
            <div class="bg-gradient-to-r from-indigo-900 to-slate-800 p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shrink-0 mb-6">
                <div class="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div class="relative z-10 flex items-center gap-5">
                    <button onclick="loadClassroomsView()" class="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition border border-white/20 backdrop-blur-sm shadow-sm" title="ត្រឡប់ថយក្រោយ">
                        <i class="fa-solid fa-arrow-left text-xl"></i>
                    </button>
                    <div>
                        <div class="flex items-center gap-3 mb-1">
                            <span class="bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-indigo-400">បន្ទប់ការងារ (Workspace)</span>
                        </div>
                        <h2 class="text-2xl md:text-3xl font-black text-white font-moul tracking-wide drop-shadow-md">
                            ${window.currentActiveGrade}
                        </h2>
                        <p class="text-indigo-200 mt-2 text-sm flex items-center gap-2">
                            <i class="fa-solid fa-user-tie"></i> គ្រូបន្ទុក៖ <span class="font-moul text-xs text-white">${teacher}</span>
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3 relative z-10">
                    <button onclick="jumpToScoresModule('${gradeLevelForSelect}', '${room}')" class="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 text-xs">
                        <i class="fa-solid fa-star-half-stroke"></i> គ្រប់គ្រងពិន្ទុថ្នាក់នេះ
                    </button>
                </div>
            </div>

            <!-- Workspace Navigation Tabs -->
            <div class="bg-white px-3 pt-3 border border-slate-200 rounded-t-[2rem] shadow-sm flex gap-2 overflow-x-auto custom-scrollbar z-10 shrink-0">
                <button onclick="switchClassTab('overview')" id="ctab-overview" class="class-tab-btn active px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 flex items-center gap-2">
                    <i class="fa-solid fa-house-user"></i> ទិដ្ឋភាពទូទៅ
                </button>
                <button onclick="switchClassTab('students')" id="ctab-students" class="class-tab-btn px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 border-b-2 border-transparent">
                    <i class="fa-solid fa-users-rectangle"></i> បញ្ជីសិស្ស (${toKhmerNum(totalSt.toString())})
                </button>
                <button onclick="switchClassTab('attendance')" id="ctab-attendance" class="class-tab-btn px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 border-b-2 border-transparent">
                    <i class="fa-solid fa-clipboard-user"></i> វត្តមានសិស្ស
                </button>
                <button onclick="switchClassTab('schedule')" id="ctab-schedule" class="class-tab-btn px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 border-b-2 border-transparent">
                    <i class="fa-solid fa-calendar-week"></i> កាលវិភាគ
                </button>
            </div>

            <!-- Workspace Content Area -->
            <div class="bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-b-[2rem] border-x border-b border-slate-200 p-6 relative min-h-[400px]">
                
                <!-- 1. ទិដ្ឋភាពទូទៅ -->
                <div id="ccontent-overview" class="class-tab-content block animate-fade-in space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div class="w-14 h-14 bg-white rounded-full flex justify-center items-center text-2xl text-blue-500 shadow-sm border border-blue-100"><i class="fa-solid fa-users"></i></div>
                            <div><p class="text-slate-500 text-xs font-bold mb-1 uppercase">សិស្សសរុប</p><h3 class="font-black text-2xl text-slate-800 font-mono">${toKhmerNum(totalSt.toString())} <span class="text-sm font-normal text-slate-500 font-siemreap">នាក់</span></h3></div>
                        </div>
                        <div class="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div class="w-14 h-14 bg-white rounded-full flex justify-center items-center text-2xl text-rose-500 shadow-sm border border-rose-100"><i class="fa-solid fa-venus"></i></div>
                            <div><p class="text-slate-500 text-xs font-bold mb-1 uppercase">សិស្សស្រី</p><h3 class="font-black text-2xl text-slate-800 font-mono">${toKhmerNum(femaleSt.toString())} <span class="text-sm font-normal text-slate-500 font-siemreap">នាក់</span></h3></div>
                        </div>
                        <div class="bg-amber-50/50 border border-amber-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div class="w-14 h-14 bg-white rounded-full flex justify-center items-center text-2xl text-amber-500 shadow-sm border border-amber-100"><i class="fa-solid fa-calendar-check"></i></div>
                            <div><p class="text-slate-500 text-xs font-bold mb-1 uppercase">វត្តមានមធ្យម</p><h3 class="font-black text-2xl text-slate-800 font-mono">៩៨%</h3></div>
                        </div>
                    </div>
                </div>

                <!-- 2. បញ្ជីសិស្ស -->
                <div id="ccontent-students" class="class-tab-content hidden animate-fade-in">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-moul text-lg text-slate-800"><i class="fa-solid fa-address-book text-indigo-500 mr-2"></i>បញ្ជីឈ្មោះសិស្សក្នុងថ្នាក់</h3>
                        <button onclick="switchView('students')" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold border border-indigo-200 shadow-sm hover:bg-indigo-100 transition text-xs"><i class="fa-solid fa-user-plus mr-1"></i> គ្រប់គ្រងសិស្សទូទៅ</button>
                    </div>
                    <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                        <table class="w-full border-collapse text-left text-sm">
                            <thead class="bg-slate-50 text-slate-600 font-moul text-xs border-b border-slate-200">
                                <tr>
                                    <th class="p-4 text-center w-16">ល.រ</th>
                                    <th class="p-4">ឈ្មោះសិស្ស</th>
                                    <th class="p-4 text-center w-24">ភេទ</th>
                                    <th class="p-4 text-center w-32">ថ្ងៃខែឆ្នាំកំណើត</th>
                                    <th class="p-4 text-center w-28">ស្ថានភាព</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${studentsRows}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 3. វត្តមានសិស្ស -->
                <div id="ccontent-attendance" class="class-tab-content hidden animate-fade-in">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-moul text-lg text-slate-800"><i class="fa-solid fa-clipboard-check text-emerald-500 mr-2"></i>បញ្ជីវត្តមានប្រចាំថ្ងៃ</h3>
                        <input type="date" class="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold shadow-sm outline-none focus:border-emerald-400 text-xs">
                    </div>
                    <div class="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        (ប្រព័ន្ធកត់វត្តមាន កំពុងរៀបចំ...)
                    </div>
                </div>

                <!-- 4. កាលវិភាគ -->
                <div id="ccontent-schedule" class="class-tab-content hidden animate-fade-in">
                    <h3 class="font-moul text-lg text-slate-800 mb-6"><i class="fa-solid fa-calendar-days text-rose-500 mr-2"></i>តារាងកាលវិភាគសិក្សា</h3>
                    <div class="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        (ប្រព័ន្ធរៀបចំកាលវិភាគ កំពុងរៀបចំ...)
                    </div>
                </div>

            </div>
        </div>
    `;
};

window.switchClassTab = function(tabId) {
    document.querySelectorAll('.class-tab-btn').forEach(btn => {
        btn.className = "class-tab-btn px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 border-b-2 border-transparent";
    });
    
    document.querySelectorAll('.class-tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('block', 'flex');
    });

    const activeBtn = document.getElementById(`ctab-${tabId}`);
    if (activeBtn) {
        activeBtn.className = "class-tab-btn active px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 flex items-center gap-2";
    }

    const activeContent = document.getElementById(`ccontent-${tabId}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
        activeContent.classList.add('block');
    }
};

window.jumpToScoresModule = function(level, room) {
    if (typeof loadScoresView === 'function') {
        switchView('scores'); 
        loadScoresView().then(() => {
            const levelSelect = document.getElementById("globalLevelSelect");
            const roomSelect = document.getElementById("globalRoomSelect");
            
            if (levelSelect) levelSelect.value = level;
            if (roomSelect) roomSelect.value = room;
            
            if (typeof reloadActiveScoreTab === 'function') {
                toggleTrackSelect(); 
                reloadActiveScoreTab();
            }
        });
    } else {
        alert("មុខងារពិន្ទុមិនទាន់ត្រូវបានភ្ជាប់ជាមួយប្រព័ន្ធទេ។");
    }
};