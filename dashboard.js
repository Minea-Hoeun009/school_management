// ==========================================
// ឯកសារ js/dashboard.js - ផ្ទាំងគ្រប់គ្រងទូទៅ (Modern Dynamic Dashboard)
// ==========================================

window.loadDashboard = function() {
    const container = document.getElementById("dashboardView") || document.getElementById("mainContentArea") || document.getElementById("appView");
    if (!container) return;

    // ទាញយកទិន្នន័យសិស្សសរុប (ឆ្លងកាត់ការ Filter រួចជាស្រេចតាម Teacher ID ពី window.allStudents)
    const students = window.allStudents || [];
    
    // គណនាទិន្នន័យ
    const totalStudents = students.length;
    const femaleStudents = students.filter(s => s.gender === 'ស្រី').length;
    const poorStudents = students.filter(s => s.poor_id).length;
    const scholarStudents = students.filter(s => s.scholarship).length;
    const dropStudents = students.filter(s => s.status === 'Dropped').length;

    // ១. ទាញយកឈ្មោះគ្រូពី Auth State និង ឆ្នាំសិក្សា
    const teacherName = window.AuthState ? window.AuthState.teacherName : (localStorage.getItem('auth_teacher_name') || 'លោកគ្រូ អ្នកគ្រូ');
    const teacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";

    // ២. ស្វែងរកថ្នាក់រៀនពិតប្រាកដដែលគ្រូនេះបង្រៀនដោយស្វ័យប្រវត្តិ
    let teacherGradeStr = "មិនទាន់កំណត់ថ្នាក់រៀន";
    try {
        const rawStudents = JSON.parse(localStorage.getItem('academic_students')) || [];
        const myStudents = rawStudents.filter(s => String(s.teacher_id) === String(teacherId) && String(s.academic_year) === String(academicYear) && s.status !== "Dropped");
        
        if (myStudents.length > 0) {
            let sGrade = String(myStudents[0].grade || "ថ្នាក់ទី ១").trim();
            if (!sGrade.includes("ថ្នាក់ទី")) sGrade = "ថ្នាក់ទី " + sGrade;
            teacherGradeStr = `${sGrade} ${myStudents[0].room || '«ក»'}`;
        } else {
             const levelStr = sInfo.teacher_level || "ថ្នាក់ទី ១";
             const roomStr = sInfo.teacher_room || "«ក»";
             teacherGradeStr = `${levelStr} ${roomStr}`;
        }
    } catch(e) {
         console.warn("មិនអាចទាញយកថ្នាក់រៀនពិតប្រាកដបានទេ", e);
    }

    // ៣. ទាញយកកាលបរិច្ឆេទខ្មែរ (សូរិយគតិ និង ចន្ទគតិ) ថ្ងៃនេះ
    const today = new Date();
    const khmerDays = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
    const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    
    const dayName = khmerDays[today.getDay()];
    const dStr = window.toKhmerNum(today.getDate().toString());
    const mStr = khmerMonths[today.getMonth()];
    const yStr = window.toKhmerNum(today.getFullYear().toString());
    const currentSolarDate = `ថ្ងៃទី ${dStr} ខែ ${mStr} ឆ្នាំ ${yStr}`;

    let currentLunarDate = "កំពុងទាញយក...";
    if (typeof window.getKhmerLunarDate === 'function') {
        currentLunarDate = window.getKhmerLunarDate(today);
    }

    container.className = "p-2 md:p-6 transition-all duration-500 h-full w-full flex flex-col min-h-0 bg-slate-50";
    container.innerHTML = `
        <style>
            /* 🟢 ការកំណត់ Fonts ស្តង់ដារ (Khmer OS Muol Light សម្រាប់ចំណងជើង & Siemreap សម្រាប់អត្ថបទ) 🟢 */
            .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
            .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
            
            /* Custom Scrollbar */
            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        </style>
        
        <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 relative">
            <div class="flex animate-fade-in flex-col font-siemreap text-slate-800 max-w-[1680px] mx-auto pb-16 px-1 md:px-2 pt-1 min-h-full">
                
                <!-- 🟢 ផ្នែកខាងលើ៖ ផ្ទាំងស្វាគមន៍ (Welcome Banner) 🟢 -->
                <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden group border border-indigo-400/30">
                    <!-- បែបផែន Background ក្នុង Banner -->
                    <div class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:translate-x-1/3 transition duration-1000"></div>
                    <div class="absolute bottom-0 left-10 w-48 h-48 bg-sky-300/20 rounded-full blur-2xl group-hover:scale-125 transition duration-1000"></div>
                    
                    <!-- ក្រឡា Pattern -->
                    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] opacity-50 z-0"></div>
                    
                    <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div class="flex-1">
                            <div class="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full text-indigo-50 font-bold mb-5 shadow-sm text-[13px] font-siemreap">
                                <i class="fa-solid fa-graduation-cap text-amber-300 text-base"></i> 
                                <span>ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</span>
                            </div>
                            
                            <h2 class="text-3xl md:text-[42px] font-moul text-white mb-4 drop-shadow-md leading-tight tracking-wide flex items-center gap-3">
                                សួស្តី ${teacherName}! <span class="animate-wave inline-block origin-bottom-right font-siemreap"></span>
                            </h2>
                            
                            <p class="text-indigo-100 font-bold text-base md:text-lg opacity-90 max-w-2xl leading-relaxed flex items-center gap-2 font-siemreap">
                                <i class="fa-solid fa-chalkboard-user text-sky-200"></i>
                                លោកគ្រូអ្នកគ្រូកំពុងស្ថិតក្នុងទំព័រគ្រប់គ្រងសិស្ស <span class="text-white bg-indigo-900/40 px-3 py-1 rounded-lg border border-indigo-300/30 font-moul text-[15px] shadow-inner ml-2">${teacherGradeStr}</span>
                            </p>
                        </div>
                        
                        <!-- 🟢 កាតបង្ហាញម៉ោង និងកាលបរិច្ឆេទ 🟢 -->
                        <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] p-6 flex flex-col gap-4 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/20 transition-colors w-full lg:w-auto font-siemreap min-w-[340px]">
                            <div class="flex items-center gap-5 border-b border-white/10 pb-4">
                                <div class="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/30"><i class="fa-regular fa-clock text-white"></i></div>
                                <div>
                                    <p class="text-[12px] uppercase tracking-widest font-black text-indigo-100 mb-1">ម៉ោងបច្ចុប្បន្ន</p>
                                    <p class="text-3xl font-black font-siemreap drop-shadow-md tracking-wider text-amber-300" id="dashClock">00:00:00</p>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2.5 pt-1 text-[13.5px] font-bold text-indigo-50">
                                <div class="flex items-start gap-3">
                                    <i class="fa-solid fa-moon text-amber-200 mt-1 text-base"></i>
                                    <span class="leading-relaxed tracking-wide">${currentLunarDate}</span>
                                </div>
                                <div class="flex items-start gap-3">
                                    <i class="fa-regular fa-calendar text-sky-300 mt-1 text-base"></i>
                                    <span class="leading-relaxed tracking-wide">${currentSolarDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 🟢 ផ្នែកទី២៖ កាតទិន្នន័យសង្ខេប (Statistics Cards) 🟢 -->
                <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8 font-siemreap">
                    
                    <!-- កាតទី១: សិស្សសរុប -->
                    <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-users"></i></div>
                            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[11px] font-bold">សរុប</span>
                        </div>
                        <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">សិស្សក្នុងបន្ទុក</h3>
                        <p class="text-3xl md:text-4xl font-black text-slate-800">${window.toKhmerNum(totalStudents.toString())}</p>
                    </div>

                    <!-- កាតទី២: សិស្សស្រី -->
                    <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-pink-50 text-pink-500 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-venus"></i></div>
                            <span class="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg text-[11px] font-bold">ស្រី</span>
                        </div>
                        <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">សិស្សស្រី</h3>
                        <p class="text-3xl md:text-4xl font-black text-slate-800">${window.toKhmerNum(femaleStudents.toString())}</p>
                    </div>

                    <!-- កាតទី៣: ប័ណ្ណក្រីក្រ -->
                    <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-star"></i></div>
                            <span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[11px] font-bold">ក្រីក្រ</span>
                        </div>
                        <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">ប័ណ្ណក្រីក្រ</h3>
                        <p class="text-3xl md:text-4xl font-black text-slate-800">${window.toKhmerNum(poorStudents.toString())}</p>
                    </div>

                    <!-- កាតទី៤: អាហារូបករណ៍ -->
                    <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-award"></i></div>
                            <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[11px] font-bold">អាហារូបករណ៍</span>
                        </div>
                        <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">អាហារូបករណ៍</h3>
                        <p class="text-3xl md:text-4xl font-black text-slate-800">${window.toKhmerNum(scholarStudents.toString())}</p>
                    </div>

                    <!-- កាតទី៥: បោះបង់ការសិក្សា -->
                    <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group col-span-2 md:col-span-4 xl:col-span-1">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-rose-50 text-rose-500 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-person-walking-arrow-right"></i></div>
                            <span class="bg-rose-100 text-rose-700 px-2 py-1 rounded-lg text-[10px] font-bold">បោះបង់</span>
                        </div>
                        <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">បោះបង់ការសិក្សា</h3>
                        <p class="text-3xl md:text-4xl font-black text-slate-800">${window.toKhmerNum(dropStudents.toString())}</p>
                    </div>

                </div>

                <!-- 🟢 ផ្នែកទី៣៖ ម៉ឺនុយសកម្មភាពរហ័ស (Quick Actions Menu) 🟢 -->
                <h3 class="font-moul text-[17px] text-slate-800 mb-5 px-2 flex items-center gap-3"><i class="fa-solid fa-bolt text-amber-500 text-xl"></i> សកម្មភាពរហ័ស</h3>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 font-siemreap">
                    <button onclick="window.switchView('students')" class="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition duration-300 shadow-sm hover:shadow-md group">
                        <div class="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner"><i class="fa-solid fa-users-gear"></i></div>
                        <span class="font-bold text-slate-700 text-[13px] md:text-sm">បញ្ជីឈ្មោះសិស្ស</span>
                    </button>
                    
                    <button onclick="window.switchView('attendance')" class="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition duration-300 shadow-sm hover:shadow-md group">
                        <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner"><i class="fa-solid fa-clipboard-user"></i></div>
                        <span class="font-bold text-slate-700 text-[13px] md:text-sm">កត់វត្តមានសិស្ស</span>
                    </button>
                    
                    <button onclick="window.switchView('scores')" class="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition duration-300 shadow-sm hover:shadow-md group">
                        <div class="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner"><i class="fa-solid fa-marker"></i></div>
                        <span class="font-bold text-slate-700 text-[13px] md:text-sm">បញ្ចូលពិន្ទុខែ</span>
                    </button>
                    
                    <button onclick="window.fetchAllData(this)" class="bg-slate-800 hover:bg-slate-900 border border-slate-700 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition duration-300 shadow-lg shadow-slate-300 group">
                        <div class="w-14 h-14 bg-slate-700 text-white rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-180 transition duration-500 shadow-inner"><i class="fa-solid fa-arrows-rotate"></i></div>
                        <span class="font-bold text-white text-[13px] md:text-sm">ទាញទិន្នន័យថ្មី (Sync)</span>
                    </button>
                </div>
                
            </div>
        </div>
        
        
    `;

    
    // ដំណើរការនាឡិកា (Real-time Clock) នៅក្នុង Banner លេខសកល
    const clockEl = document.getElementById("dashClock");
    if(clockEl) {
        clearInterval(window.dashClockInterval);
        window.dashClockInterval = setInterval(() => {
            const now = new Date();
            const hStr = String(now.getHours()).padStart(2, '0');
            const mStr = String(now.getMinutes()).padStart(2, '0');
            const sStr = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${hStr}:${mStr}:${sStr}`;
        }, 1000);
    }
};

// បញ្ជាឱ្យគូរ Dashboard ឡើងវិញប្រសិនបើកូដនេះត្រូវបានដំណើរការ
if(document.getElementById("dashboardView") && !document.getElementById("dashboardView").classList.contains("hidden")) {
    window.loadDashboard();
}