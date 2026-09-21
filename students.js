// ==========================================
// ឯកសារ js/students.js - ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្ស (Modernized UI/UX)
// ==========================================

window.allStudents = [];
window.filteredStudents = [];

// អនុគមន៍ជំនួយ៖ បំប្លែងលេខទៅជាលេខខ្មែរ (ប្រើសម្រាប់តែថ្នាក់)
function toKhmerNum(str) {
    if (!str) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
}

// អនុគមន៍ជំនួយ៖ ធ្វើឱ្យថ្នាក់រៀនមានស្តង់ដារលេខខ្មែរជានិច្ច
function normalizeGrade(str) {
    let s = String(str || "ថ្នាក់ទី ១").trim();
    const khmerToArabic = {'០':'0', '១':'1', '២':'2', '៣':'3', '៤':'4', '៥':'5', '៦':'6', '៧':'7', '៨':'8', '៩':'9'};
    let arabicStr = s.replace(/[០-៩]/g, match => khmerToArabic[match]);
    let match = arabicStr.match(/[0-9]+/);
    if (match) {
        return "ថ្នាក់ទី " + toKhmerNum(match[0]);
    }
    return "ថ្នាក់ទី ១";
}

// អនុគមន៍ជំនួយ៖ គណនាអាយុ
function calculateAge(dobStr) {
    if (!dobStr) return "-";
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return "-";
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970).toString();
}

// អនុគមន៍ជំនួយ៖ យកអក្សរដំបូងធ្វើជារូបតំណាង (Avatar)
function getAvatarInitial(name) {
    if (!name) return "ស";
    const cleanName = name.replace(/^(កុមារា|កុមារី|យុវជន|យុវតី)\s*/, '');
    const words = cleanName.split(' ');
    if (words.length > 1) return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    return cleanName.substring(0, 2).toUpperCase();
}

// អនុគមន៍ជំនួយ៖ បង្រួមទីលំនៅបង្ហាញក្នុងតារាង
function formatAddress(village, commune) {
    let addr = [];
    if(village) addr.push(`ភូមិ${village}`);
    if(commune) addr.push(`ឃុំ${commune}`);
    return addr.length > 0 ? addr.join(" ") : "-";
}

// ១. មុខងារចម្បងក្នុងការគូរផ្ទាំងគ្រប់គ្រងសិស្ស
window.loadStudentsView = async function() {
    const container = document.getElementById("studentsView") || document.getElementById("mainContentArea") || document.getElementById("appView");
    if (!container) return;

    let gradesOptions = `<option value="all">គ្រប់ថ្នាក់</option>`;
    for(let i = 1; i <= 12; i++) {
        const khGrade = toKhmerNum(i.toString());
        gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}">ថ្នាក់ទី ${khGrade}</option>`;
    }

    container.className = "p-4 md:p-6 transition duration-300 h-full w-full flex flex-col min-h-0 bg-slate-50";
    container.innerHTML = `
        <div class="animate-fade-in h-full w-full flex flex-col min-h-0 font-siemreap text-slate-800 max-w-[1600px] mx-auto">
            
            <!-- ផ្នែកខាងលើ៖ ចំណងជើង និងប៊ូតុងសកម្មភាព -->
            <div class="bg-white p-6 rounded-[2rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 shrink-0 mb-6 no-print relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-6 transition-all">
                <div class="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-3xl"></div>
                <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
                
                <div class="flex items-center gap-5 ml-2 relative z-10 w-full xl:w-auto">
                    <div class="w-14 h-14 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-indigo-100"><i class="fa-solid fa-users"></i></div>
                    <div>
                        <h2 class="text-xl md:text-2xl font-black text-slate-800 font-moul mb-1">បញ្ជីឈ្មោះសិស្ស</h2>
                        <p class="text-[13px] text-slate-500 font-bold flex gap-3 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 inline-flex mt-1">
                            <span>សរុប: <span id="hdrTotal" class="text-indigo-600 font-mono text-sm">0</span> នាក់</span> <span class="text-slate-300">|</span>
                            <span>បង្ហាញ: <span id="hdrActive" class="text-emerald-600 font-mono text-sm">0</span> នាក់</span>
                        </p>
                    </div>
                </div>
                
                <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end relative z-10">
                    <button onclick="window.syncStudentsToCloud(this)" class="px-4 py-2.5 bg-white hover:bg-purple-50 text-purple-600 rounded-xl text-[13px] font-bold transition flex items-center gap-2 border border-purple-200 shadow-sm hover:shadow transform hover:-translate-y-0.5">
                        <i class="fa-solid fa-cloud-arrow-up"></i> រក្សាទុកទៅ Cloud
                    </button>
                    <button onclick="window.printIDCards()" class="px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-600 rounded-xl text-[13px] font-bold transition flex items-center gap-2 border border-blue-200 shadow-sm hover:shadow transform hover:-translate-y-0.5">
                        <i class="fa-solid fa-id-badge"></i> កាតសិស្ស
                    </button>
                    <button onclick="window.printStudentList()" class="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[13px] font-bold transition flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow transform hover:-translate-y-0.5">
                        <i class="fa-solid fa-print"></i> បោះពុម្ពបញ្ជី
                    </button>
                    <div class="h-8 w-px bg-slate-200 hidden md:block mx-1"></div>
                    <button onclick="window.downloadStudentTemplate()" class="w-10 h-10 flex items-center justify-center bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl transition border border-indigo-200 shadow-sm hover:shadow transform hover:-translate-y-0.5" title="ទាញយកគំរូ Excel">
                        <i class="fa-solid fa-download"></i>
                    </button>
                    <input type="file" id="stuExcelInput" accept=".xlsx, .xls" class="hidden" onchange="window.importStudentsExcel(event)">
                    <button onclick="document.getElementById('stuExcelInput').click()" class="w-10 h-10 flex items-center justify-center bg-white hover:bg-amber-50 text-amber-600 rounded-xl transition border border-amber-200 shadow-sm hover:shadow transform hover:-translate-y-0.5" title="នាំចូលពី Excel">
                        <i class="fa-solid fa-file-import"></i>
                    </button>
                    <button onclick="window.exportStudentsExcel()" class="w-10 h-10 flex items-center justify-center bg-white hover:bg-emerald-50 text-emerald-600 rounded-xl transition border border-emerald-200 shadow-sm hover:shadow transform hover:-translate-y-0.5" title="ទាញយកជា Excel">
                        <i class="fa-solid fa-file-excel"></i>
                    </button>
                    <button onclick="window.openStudentModal()" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-[13px] font-bold shadow-md shadow-indigo-200 transition flex items-center gap-2 transform hover:-translate-y-0.5 ml-2">
                        <i class="fa-solid fa-user-plus"></i> ចុះឈ្មោះថ្មី
                    </button>
                </div>
            </div>

            <!-- តម្រងស្វែងរកកម្រិតខ្ពស់ (Filters) -->
            <div class="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm mb-6 shrink-0 no-print">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div class="relative">
                        <span class="absolute left-3 top-2.5 text-slate-400"><i class="fa-solid fa-magnifying-glass text-[12px]"></i></span>
                        <input type="text" id="stuSearchInput" oninput="window.filterStudents()" placeholder="ស្វែងរកឈ្មោះ ឬ អត្តលេខ..." class="pl-9 pr-3 py-2 w-full border border-slate-200 rounded-xl text-[13px] font-bold outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition">
                    </div>
                    <select id="stuFilterGrade" onchange="window.filterStudents()" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50 hover:bg-slate-100 transition">${gradesOptions}</select>
                    <select id="stuFilterRoom" onchange="window.filterStudents()" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50 hover:bg-slate-100 transition">
                        <option value="all">គ្រប់បន្ទប់</option><option value="«ក»">បន្ទប់ «ក»</option><option value="«ខ»">បន្ទប់ «ខ»</option><option value="«គ»">បន្ទប់ «គ»</option><option value="«ឃ»">បន្ទប់ «ឃ»</option>
                    </select>
                    <select id="stuFilterGender" onchange="window.filterStudents()" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50 hover:bg-slate-100 transition">
                        <option value="all">ប្រុស និង ស្រី</option><option value="ប្រុស">ប្រុស</option><option value="ស្រី">ស្រី</option>
                    </select>
                    <select id="stuFilterStatus" onchange="window.filterStudents()" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50 hover:bg-slate-100 transition">
                        <option value="all">គ្រប់ស្ថានភាព</option><option value="Active" selected>កំពុងសិក្សា</option><option value="Dropped">បោះបង់</option>
                    </select>
                    <input type="text" id="stuFilterAddress" oninput="window.filterStudents()" placeholder="ស្វែងរកទីលំនៅ..." class="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-bold outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition">
                </div>
            </div>

            <!-- តារាងទិន្នន័យសិស្ស (Data Table) -->
            <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden flex-1 flex flex-col min-h-0 w-full print:border-none print:shadow-none">
                <div class="overflow-auto w-full flex-1 min-h-0 custom-scrollbar print:overflow-visible relative bg-white pb-6">
                    <table id="studentsTable" class="w-full border-collapse text-left whitespace-nowrap bg-white relative">
                        <thead class="bg-slate-50/80 text-slate-500 sticky top-0 z-10 shadow-sm backdrop-blur-md text-[11px] uppercase tracking-wider font-bold">
                            <tr>
                                <th class="p-4 border-b border-slate-200 text-center w-12 rounded-tl-[2rem]">ល.រ</th>
                                <th class="p-4 border-b border-slate-200 text-center w-16">រូបថត</th>
                                <th class="p-4 border-b border-slate-200 w-24 text-indigo-600 font-moul">អត្តលេខ</th>
                                <th class="p-4 border-b border-slate-200 font-moul text-slate-700">គោត្តនាម និងនាម</th>
                                <th class="p-4 border-b border-slate-200 text-center w-16">ភេទ</th>
                                <th class="p-4 border-b border-slate-200 w-32 text-center">ថ្ងៃខែឆ្នាំកំណើត</th>
                                <th class="p-4 border-b border-slate-200 w-32 text-center">ថ្នាក់រៀន</th>
                                <th class="p-4 border-b border-slate-200 w-32">ទីលំនៅ (ភូមិ/ឃុំ)</th>
                                <th class="p-4 border-b border-slate-200 text-center w-36 no-print rounded-tr-[2rem]">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody id="studentsTableBody" class="divide-y divide-slate-100 text-[13px] text-slate-700">
                            <tr><td colspan="9" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-indigo-400"></i><br>កំពុងទាញយកទិន្នន័យ...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div id="stuModalContainer"></div>
        </div>
    `;

    window.renderStudentModalTemplate();
    await window.fetchStudentsData();
};

window.fetchStudentsData = async function(forceRefresh = false) {
    const tbody = document.getElementById("studentsTableBody");
    if(tbody && forceRefresh) tbody.innerHTML = `<tr><td colspan="9" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-indigo-400"></i><br>កំពុងផ្ទុកទិន្នន័យថ្មី...</td></tr>`;

    try {
        let serverData = [];
        if (typeof apiGet === 'function' && !forceRefresh) {
            try { 
                const res = await apiGet("getStudents"); 
                if (res && res.data) serverData = res.data;
            } catch(e) {}
        }

        let localData = [];
        try {
            const rawData = localStorage.getItem('academic_students');
            if (rawData) localData = JSON.parse(rawData) || [];
        } catch(e) {}

        if (serverData.length > 0) {
            window.allStudents = serverData;
            localStorage.setItem('academic_students', JSON.stringify(serverData));
        } else if (localData.length > 0) {
            window.allStudents = localData;
        } else {
            window.allStudents = [];
        }

        window.filterStudents();
    } catch(err) {
        if(tbody) tbody.innerHTML = `<tr><td colspan="9" class="p-12 text-center text-rose-500 font-bold bg-rose-50"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><br>បរាជ័យក្នុងការតភ្ជាប់ទិន្នន័យ</td></tr>`;
    }
};

window.filterStudents = function() {
    const search = (document.getElementById("stuSearchInput")?.value || "").toLowerCase();
    const grade = document.getElementById("stuFilterGrade")?.value || "all";
    const room = document.getElementById("stuFilterRoom")?.value || "all";
    const gender = document.getElementById("stuFilterGender")?.value || "all";
    const status = document.getElementById("stuFilterStatus")?.value || "Active";
    const address = (document.getElementById("stuFilterAddress")?.value || "").toLowerCase();

    window.filteredStudents = window.allStudents.filter(s => {
        const fullAddr = formatAddress(s.curr_village, s.curr_commune).toLowerCase();
        const normGrade = normalizeGrade(s.grade);

        const matchSearch = s.name.toLowerCase().includes(search) || String(s.id).toLowerCase().includes(search);
        const matchGrade = grade === "all" || normGrade === grade;
        const matchRoom = room === "all" || s.room === room;
        const matchGender = gender === "all" || s.gender === gender;
        const matchStatus = status === "all" || (status === "Active" ? s.status !== "Dropped" : s.status === "Dropped");
        const matchAddress = address === "" || fullAddr.includes(address);

        return matchSearch && matchGrade && matchRoom && matchGender && matchStatus && matchAddress;
    });

    if (document.getElementById("hdrTotal")) document.getElementById("hdrTotal").innerText = window.allStudents.length;
    if (document.getElementById("hdrActive")) document.getElementById("hdrActive").innerText = window.filteredStudents.length;

    window.renderStudentsTable();
};

window.renderStudentsTable = function() {
    const tbody = document.getElementById("studentsTableBody");
    if(!tbody) return;

    if (window.filteredStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="p-20 text-center text-slate-400 font-bold"><i class="fa-solid fa-folder-open text-4xl mb-3 text-slate-200"></i><br>មិនមានទិន្នន័យសិស្សទេ!</td></tr>`;
        return;
    }

    const bgColors = ['bg-indigo-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-cyan-400', 'bg-purple-400'];

    let trs = "";
    window.filteredStudents.forEach((stu, index) => {
        let isMale = stu.gender !== 'ស្រី';
        let genBadge = isMale 
            ? `<span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold border border-blue-100 shadow-sm"><i class="fa-solid fa-mars mr-1"></i> ប្រុស</span>` 
            : `<span class="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[11px] font-bold border border-pink-100 shadow-sm"><i class="fa-solid fa-venus mr-1"></i> ស្រី</span>`;
        
        let avatarColor = bgColors[index % bgColors.length];
        
        let avatarContent = `<div class="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-white text-sm ${avatarColor} shadow-md border-2 border-white">${getAvatarInitial(stu.name)}</div>`;
        if (stu.photo_url && stu.photo_url.trim() !== "") {
            avatarContent = `<img src="${stu.photo_url}" class="w-10 h-10 rounded-full mx-auto object-cover shadow-md border-2 border-white" alt="Photo">`;
        }

        let dobStr = stu.dob;
        if(dobStr && dobStr.includes('-')) {
            const p = dobStr.split('-');
            if(p.length === 3) dobStr = `${p[2]}/${p[1]}/${p[0]}`; 
        }
        let ageHtml = calculateAge(stu.dob) !== "-" ? `<span class="text-slate-400 text-[11px] ml-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">${calculateAge(stu.dob)}ឆ្នាំ</span>` : "";
        let addrText = formatAddress(stu.curr_village, stu.curr_commune);
        
        let displayGrade = normalizeGrade(stu.grade); 

        trs += `
            <tr class="hover:bg-indigo-50/40 transition-colors border-b border-slate-100 group font-bold">
                <td class="p-3 text-center text-slate-500 font-mono">${index + 1}</td>
                <td class="p-3 text-center">${avatarContent}</td>
                <td class="p-3 text-indigo-600 font-mono"><span class="bg-indigo-50 px-2 py-1 rounded border border-indigo-100">${stu.id}</span></td>
                <td class="p-3 text-slate-800 font-moul text-[14px]">${stu.name}</td>
                <td class="p-3 text-center">${genBadge}</td>
                <td class="p-3 text-center text-slate-600 font-mono text-[12px]">${dobStr || '-'} ${ageHtml}</td>
                <td class="p-3 text-center text-slate-700">
                   <span class="border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-indigo-800">${displayGrade} <span class="text-rose-600 ml-1">${stu.room || ''}</span></span> 
                </td>
                <td class="p-3 text-slate-500 text-[12px]"><i class="fa-solid fa-map-pin text-slate-300 mr-1"></i> ${addrText}</td>
                <td class="p-3 text-center no-print">
                    <div class="flex items-center justify-center gap-2 opacity-30 group-hover:opacity-100 transition-all duration-300">
                        <button onclick="window.viewStudentProfile('${stu.id}')" title="ប្រវត្តិរូប" class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md transition-all transform hover:-translate-y-0.5"><i class="fa-regular fa-eye"></i></button>
                        <button onclick="window.printIDCards(['${stu.id}'])" title="កាតសិស្ស" class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all transform hover:-translate-y-0.5"><i class="fa-regular fa-address-card"></i></button>
                        <button onclick="window.openStudentModal('${stu.id}')" title="កែប្រែ" class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md transition-all transform hover:-translate-y-0.5"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button onclick="window.deleteStudent('${stu.id}')" title="លុប" class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:shadow-md transition-all transform hover:-translate-y-0.5"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = trs;
};

// =========================================
// បង្រួមទំហំរូបថត (Image Compression for Base64) 
// =========================================
window.handleStudentPhotoUpload = function(inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const previewImg = document.getElementById("stu_photo_preview");
    const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
    
    if(previewImg) {
        previewImg.classList.add("opacity-50", "animate-pulse");
        previewImg.classList.remove("hidden");
    }
    if(iconPlaceholder) iconPlaceholder.classList.add("hidden");

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 150; 
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); 

            if(previewImg) {
                previewImg.src = compressedBase64;
                previewImg.classList.remove("opacity-50", "animate-pulse");
            }
            document.getElementById("stu_photo_val").value = compressedBase64; 
        }
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.renderStudentModalTemplate = function() {
    const mContainer = document.getElementById("stuModalContainer");
    if(!mContainer) return;

    let gradesOptions = "";
    for(let i=1; i<=12; i++) {
        const khGrade = toKhmerNum(i.toString());
        gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}">ថ្នាក់ទី ${khGrade}</option>`;
    }

    mContainer.innerHTML = `
        <!-- ទម្រង់ចុះឈ្មោះ និងកែប្រែ -->
        <div id="studentModal" class="fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 fade-in font-siemreap overflow-y-auto pt-10 pb-10">
            <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col my-auto transform transition-all">
                <div class="px-8 py-5 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
                    <h3 id="stuModalTitle" class="font-moul text-lg text-slate-800 flex items-center gap-3"></h3>
                    <button type="button" onclick="document.getElementById('studentModal').classList.replace('flex','hidden')" class="w-8 h-8 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center transition"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                    <form id="studentForm" onsubmit="window.saveStudentData(event)">
                        <input type="hidden" id="stu_is_edit" value="0">
                        <input type="hidden" id="stu_photo_val" value="">
                        
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-4">
                            <!-- ផ្នែកទី១៖ ព័ត៌មានផ្ទាល់ខ្លួន -->
                            <div class="col-span-12 md:col-span-4 space-y-5 bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                                <h4 class="font-moul text-sm text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2"><i class="fa-regular fa-address-card text-indigo-500"></i> ១. ផ្ទាល់ខ្លួន</h4>
                                
                                <div class="flex flex-col items-center justify-center mb-5 pb-5 border-b border-slate-100">
                                    <div class="w-28 h-36 relative mb-3 group cursor-pointer border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50 transition-colors shadow-inner" onclick="document.getElementById('stu_photo_file').click()">
                                        <img id="stu_photo_preview" src="" class="w-full h-full object-cover hidden" alt="Student Photo">
                                        <div id="stu_photo_icon_placeholder" class="text-slate-400 text-center flex flex-col items-center">
                                            <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-indigo-400"><i class="fa-solid fa-camera"></i></div>
                                            <span class="text-[10px] font-bold tracking-wide">ជ្រើសរើសរូបថត</span>
                                        </div>
                                    </div>
                                    <input type="file" id="stu_photo_file" accept="image/png, image/jpeg" class="hidden" onchange="window.handleStudentPhotoUpload(this)">
                                </div>

                                <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">អត្តលេខសិស្ស (ID) *</label><input type="text" id="stu_id" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold font-mono outline-none focus:border-indigo-300 focus:bg-white transition text-indigo-700"></div>
                                <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">គោត្តនាម និងនាម *</label><input type="text" id="stu_name" required placeholder="ឧ. ហឿន មីនា" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold font-moul outline-none focus:border-indigo-300 focus:bg-white transition"></div>
                                <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ភេទ *</label><select id="stu_gender" required class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-300 focus:bg-white transition cursor-pointer"><option value="ប្រុស">ប្រុស</option><option value="ស្រី">ស្រី</option></select></div>
                                <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ថ្ងៃខែឆ្នាំកំណើត</label><input type="date" id="stu_dob" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold font-mono outline-none focus:border-indigo-300 focus:bg-white transition cursor-pointer"></div>
                            </div>

                            <!-- ផ្នែកទី២៖ ទីលំនៅ និងឪពុកម្ដាយ -->
                            <div class="col-span-12 md:col-span-8 space-y-6">
                                <div class="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div class="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                                    <h4 class="font-moul text-sm text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2"><i class="fa-solid fa-map-location-dot text-blue-500"></i> ២. ទីកន្លែងកំណើត និងទីលំនៅ</h4>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        <div><label class="text-[11px] font-bold text-slate-400 mb-1.5 block">ភូមិ (កំណើត)</label><input type="text" id="stu_pob_village" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-300 focus:bg-white transition"></div>
                                        <div><label class="text-[11px] font-bold text-slate-400 mb-1.5 block">ឃុំ (កំណើត)</label><input type="text" id="stu_pob_commune" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-300 focus:bg-white transition"></div>
                                        <div><label class="text-[11px] font-bold text-slate-400 mb-1.5 block">ស្រុក (កំណើត)</label><input type="text" id="stu_pob_district" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-300 focus:bg-white transition"></div>
                                        <div><label class="text-[11px] font-bold text-slate-400 mb-1.5 block">ខេត្ត (កំណើត)</label><input type="text" id="stu_pob_province" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-300 focus:bg-white transition"></div>
                                    </div>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div><label class="text-[11px] font-bold text-blue-400 mb-1.5 block">ភូមិ (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_village" class="w-full bg-blue-50/30 border-2 border-blue-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-400 focus:bg-white transition"></div>
                                        <div><label class="text-[11px] font-bold text-blue-400 mb-1.5 block">ឃុំ (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_commune" class="w-full bg-blue-50/30 border-2 border-blue-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-400 focus:bg-white transition"></div>
                                        <div><label class="text-[11px] font-bold text-blue-400 mb-1.5 block">ស្រុក (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_district" class="w-full bg-blue-50/30 border-2 border-blue-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-400 focus:bg-white transition"></div>
                                        <div><label class="text-[11px] font-bold text-blue-400 mb-1.5 block">ខេត្ត (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_province" class="w-full bg-blue-50/30 border-2 border-blue-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-400 focus:bg-white transition"></div>
                                    </div>
                                </div>

                                <div class="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                                    <h4 class="font-moul text-sm text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2"><i class="fa-solid fa-people-roof text-emerald-500"></i> ៣. អាណាព្យាបាល និងការសិក្សា</h4>
                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                        <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ឈ្មោះឪពុក</label><input type="text" id="stu_father_name" placeholder="ឈ្មោះឪពុក" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-300 focus:bg-white transition"></div>
                                        <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">មុខរបរឪពុក</label><input type="text" id="stu_father_job" placeholder="មុខរបរ" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-300 focus:bg-white transition"></div>
                                        <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ឈ្មោះម្ដាយ</label><input type="text" id="stu_mother_name" placeholder="ឈ្មោះម្ដាយ" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-300 focus:bg-white transition"></div>
                                        <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">មុខរបរម្ដាយ</label><input type="text" id="stu_mother_job" placeholder="មុខរបរ" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-300 focus:bg-white transition"></div>
                                    </div>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ថ្នាក់រៀន</label><select id="stu_grade" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-emerald-300 focus:bg-white transition cursor-pointer text-indigo-700">${gradesOptions}</select></div>
                                        <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">បន្ទប់</label><select id="stu_room" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-emerald-300 focus:bg-white transition cursor-pointer text-indigo-700"><option value="«ក»">«ក»</option><option value="«ខ»">«ខ»</option><option value="«គ»">«គ»</option><option value="«ឃ»">«ឃ»</option></select></div>
                                        <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">លេខទូរស័ព្ទ</label><input type="text" id="stu_contact" placeholder="012 345 678" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold font-mono outline-none focus:border-emerald-300 focus:bg-white transition"></div>
                                        <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ស្ថានភាព</label><select id="stu_status" class="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-emerald-400 focus:bg-white transition cursor-pointer"><option value="Active">កំពុងសិក្សា</option><option value="Dropped">បោះបង់</option></select></div>
                                    </div>
                                </div>
                                
                                <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                                    <div class="text-[13px] font-moul text-amber-700 flex items-center gap-2"><i class="fa-solid fa-star"></i> ស្ថានភាពពិសេស</div>
                                    <div class="flex flex-wrap gap-4">
                                        <label class="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm hover:border-amber-400 transition"><input type="checkbox" id="stu_poor" class="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"><span class="text-xs font-bold text-slate-700">ក្រីក្រ</span></label>
                                        <label class="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm hover:border-amber-400 transition"><input type="checkbox" id="stu_scholar" class="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"><span class="text-xs font-bold text-slate-700">អាហារូបករណ៍</span></label>
                                        <label class="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm hover:border-amber-400 transition"><input type="checkbox" id="stu_disable" class="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"><span class="text-xs font-bold text-slate-700">ពិការភាព</span></label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col-reverse md:flex-row justify-between items-center pt-5 mt-4 border-t border-slate-200 gap-4">
                            <button type="button" onclick="window.clearStudentForm()" class="w-full md:w-auto px-5 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-rose-600 rounded-xl text-[13px] font-bold transition flex justify-center items-center gap-2 shadow-sm"><i class="fa-solid fa-eraser"></i> សម្អាតទម្រង់</button>
                            <div class="flex gap-3 w-full md:w-auto">
                                <button type="button" onclick="document.getElementById('studentModal').classList.replace('flex','hidden')" class="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-[13px] font-bold transition">បោះបង់</button>
                                <button type="submit" id="btnSaveStudent" class="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុកទិន្នន័យ</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- ផ្ទាំងមើលប្រវត្តិរូបសិស្ស (Modern Profile Card Modal) -->
        <div id="studentProfileModal" class="fixed inset-0 z-[6000] bg-slate-900/70 backdrop-blur-sm hidden items-center justify-center p-4 fade-in font-siemreap">
            <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 relative transform transition-all scale-100">
                
                <!-- Close Button -->
                <button onclick="document.getElementById('studentProfileModal').classList.replace('flex','hidden')" class="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition backdrop-blur-md z-20"><i class="fa-solid fa-xmark"></i></button>
                
                <!-- Cover Photo Gradient -->
                <div class="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                    <div class="absolute inset-0 bg-black/10"></div>
                    <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                </div>
                
                <!-- Profile Avatar & Details -->
                <div class="px-8 pb-8 relative -mt-14 text-center">
                    <div id="profAvatar" class="w-28 h-28 mx-auto bg-white rounded-full border-[4px] border-white shadow-lg flex items-center justify-center text-4xl font-bold mb-4 text-indigo-500 overflow-hidden relative z-10"></div>
                    
                    <h3 id="profName" class="text-2xl font-moul text-slate-800 mb-1 drop-shadow-sm"></h3>
                    <p id="profId" class="text-sm text-indigo-600 font-bold mb-4 font-mono bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100"></p>
                    
                    <div id="profBadges" class="flex justify-center flex-wrap gap-2 mb-6"></div>

                    <!-- Info Grid -->
                    <div class="bg-slate-50 rounded-[1.5rem] border border-slate-100 p-5 text-left space-y-4 shadow-inner">
                        <div class="flex items-center gap-4 border-b border-slate-200/60 pb-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><i class="fa-solid fa-venus-mars text-lg"></i></div>
                            <div class="flex-1"><p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ភេទ</p><p id="profGender" class="text-sm font-bold text-slate-800"></p></div>
                        </div>
                        <div class="flex items-center gap-4 border-b border-slate-200/60 pb-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><i class="fa-regular fa-calendar text-lg"></i></div>
                            <div class="flex-1"><p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ថ្ងៃខែឆ្នាំកំណើត</p><p id="profDob" class="text-sm font-bold text-slate-800 font-mono"></p></div>
                        </div>
                        <div class="flex items-center gap-4 border-b border-slate-200/60 pb-3">
                            <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><i class="fa-solid fa-layer-group text-lg"></i></div>
                            <div class="flex-1"><p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ថ្នាក់រៀនបច្ចុប្បន្ន</p><p id="profGrade" class="text-sm font-bold text-indigo-700"></p></div>
                        </div>
                        <div class="flex items-center gap-4 border-b border-slate-200/60 pb-3">
                            <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><i class="fa-solid fa-people-roof text-lg"></i></div>
                            <div class="flex-1"><p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ឪពុក / ម្ដាយ</p><p id="profParents" class="text-sm font-bold text-slate-800"></p></div>
                        </div>
                        <div class="flex items-center gap-4 border-b border-slate-200/60 pb-3">
                            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><i class="fa-solid fa-phone text-lg"></i></div>
                            <div class="flex-1"><p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">លេខទូរស័ព្ទ</p><p id="profContact" class="text-sm font-bold text-slate-800 font-mono"></p></div>
                        </div>
                        <div class="flex items-start gap-4 pt-1">
                            <div class="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0"><i class="fa-solid fa-map-location-dot text-lg"></i></div>
                            <div class="flex-1"><p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ទីលំនៅបច្ចុប្បន្ន</p><p id="profAddress" class="text-xs font-bold text-slate-700 leading-relaxed mt-0.5"></p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.clearStudentForm = function() {
    if (confirm("តើលោកគ្រូអ្នកគ្រូពិតជាចង់សម្អាតទិន្នន័យដែលកំពុងវាយបញ្ចូលនេះមែនទេ?")) {
        document.getElementById("studentForm").reset();
        document.getElementById("stu_photo_val").value = "";
        
        const previewImg = document.getElementById("stu_photo_preview");
        if(previewImg) {
            previewImg.src = "";
            previewImg.classList.add("hidden");
        }
        const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
        if (iconPlaceholder) iconPlaceholder.classList.remove("hidden");

        if (document.getElementById("stu_is_edit").value === "0") {
            document.getElementById("stu_id").value = "STU" + Math.floor(Math.random() * 900000 + 100000);
        }
    }
};

window.openStudentModal = function(id = null) {
    const modal = document.getElementById("studentModal");
    if(!modal) return;
    
    document.getElementById("studentForm").reset();
    document.getElementById("stu_photo_val").value = "";
    
    const previewImg = document.getElementById("stu_photo_preview");
    const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
    
    if(previewImg) { previewImg.src = ""; previewImg.classList.add("hidden"); }
    if(iconPlaceholder) iconPlaceholder.classList.remove("hidden");

    if (id) {
        const stu = window.allStudents.find(s => String(s.id) === String(id));
        if(stu) {
            document.getElementById("stu_is_edit").value = "1";
            document.getElementById("stu_id").value = stu.id;
            document.getElementById("stu_id").readOnly = true;
            document.getElementById("stu_id").classList.add("bg-slate-100", "text-slate-500");
            
            document.getElementById("stu_name").value = stu.name || "";
            document.getElementById("stu_gender").value = stu.gender || "ប្រុស";
            document.getElementById("stu_dob").value = stu.dob || "";
            
            if (stu.photo_url && stu.photo_url.trim() !== "") {
                if(previewImg) {
                    previewImg.src = stu.photo_url;
                    previewImg.classList.remove("hidden");
                }
                if(iconPlaceholder) iconPlaceholder.classList.add("hidden");
                document.getElementById("stu_photo_val").value = stu.photo_url;
            }

            document.getElementById("stu_pob_village").value = stu.pob_village || "";
            document.getElementById("stu_pob_commune").value = stu.pob_commune || "";
            document.getElementById("stu_pob_district").value = stu.pob_district || "";
            document.getElementById("stu_pob_province").value = stu.pob_province || "";

            document.getElementById("stu_curr_village").value = stu.curr_village || "";
            document.getElementById("stu_curr_commune").value = stu.curr_commune || "";
            document.getElementById("stu_curr_district").value = stu.curr_district || "";
            document.getElementById("stu_curr_province").value = stu.curr_province || "";

            document.getElementById("stu_father_name").value = stu.father_name || "";
            document.getElementById("stu_father_job").value = stu.father_job || "";
            document.getElementById("stu_mother_name").value = stu.mother_name || "";
            document.getElementById("stu_mother_job").value = stu.mother_job || "";
            
            document.getElementById("stu_grade").value = normalizeGrade(stu.grade);
            document.getElementById("stu_room").value = stu.room || "«ក»";
            document.getElementById("stu_contact").value = stu.parent_contact || "";
            document.getElementById("stu_status").value = stu.status || "Active";
            
            document.getElementById("stu_poor").checked = !!stu.poor_id;
            document.getElementById("stu_scholar").checked = !!stu.scholarship;
            document.getElementById("stu_disable").checked = !!stu.disability;

            document.getElementById("stuModalTitle").innerHTML = `<div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex justify-center items-center text-lg"><i class="fa-solid fa-user-pen"></i></div> កែប្រែព័ត៌មានសិស្ស`;
        }
    } else {
        document.getElementById("stu_is_edit").value = "0";
        document.getElementById("stu_id").value = "STU" + Math.floor(Math.random() * 900000 + 100000); 
        document.getElementById("stu_id").readOnly = false;
        document.getElementById("stu_id").classList.remove("bg-slate-100", "text-slate-500");
        document.getElementById("stuModalTitle").innerHTML = `<div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex justify-center items-center text-lg"><i class="fa-solid fa-user-plus"></i></div> ចុះឈ្មោះសិស្សថ្មី`;
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

window.viewStudentProfile = function(id) {
    const modal = document.getElementById("studentProfileModal");
    const stu = window.allStudents.find(s => String(s.id) === String(id));
    if(!modal || !stu) return;

    if (stu.photo_url && stu.photo_url.trim() !== "") {
        document.getElementById("profAvatar").innerHTML = `<img src="${stu.photo_url}" class="w-full h-full object-cover">`;
    } else {
        document.getElementById("profAvatar").innerHTML = `<span class="flex items-center justify-center w-full h-full bg-slate-100 text-slate-400 font-bold">${getAvatarInitial(stu.name)}</span>`;
    }
    
    document.getElementById("profName").textContent = stu.name;
    document.getElementById("profId").textContent = "ID: " + stu.id;
    document.getElementById("profGender").innerHTML = stu.gender === 'ស្រី' ? '<span class="text-pink-600">ស្រី</span>' : '<span class="text-blue-600">ប្រុស</span>';
    
    let dobStr = stu.dob;
    if(dobStr && dobStr.includes('-')) {
        const p = dobStr.split('-');
        if(p.length === 3) dobStr = `${p[2]}/${p[1]}/${p[0]}`;
    }
    let age = calculateAge(stu.dob);
    document.getElementById("profDob").textContent = `${dobStr || '-'} ${age !== "-" ? `(${age}ឆ្នាំ)` : ''}`;
    
    document.getElementById("profGrade").innerHTML = `${normalizeGrade(stu.grade)} <span class="text-rose-500 ml-1">${stu.room || ''}</span>`;
    document.getElementById("profParents").textContent = `${stu.father_name||'-'} / ${stu.mother_name||'-'}`;
    document.getElementById("profContact").textContent = stu.parent_contact || '-';
    document.getElementById("profAddress").textContent = formatAddress(stu.curr_village, stu.curr_commune);

    let badges = [];
    if (stu.status === "Active") badges.push(`<span class="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border border-emerald-200"><i class="fa-solid fa-check-circle mr-1"></i> កំពុងសិក្សា</span>`);
    else badges.push(`<span class="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border border-slate-300"><i class="fa-solid fa-ban mr-1"></i> បោះបង់ការសិក្សា</span>`);
    
    if (stu.poor_id) badges.push(`<span class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border border-amber-200"><i class="fa-solid fa-star mr-1"></i> ប័ណ្ណក្រីក្រ</span>`);
    if (stu.scholarship) badges.push(`<span class="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border border-indigo-200"><i class="fa-solid fa-award mr-1"></i> អាហារូបករណ៍</span>`);
    if (stu.disability) badges.push(`<span class="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border border-rose-200"><i class="fa-solid fa-wheelchair mr-1"></i> ពិការភាព</span>`);
    
    document.getElementById("profBadges").innerHTML = badges.join("");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

window.saveStudentData = async function(e) {
    e.preventDefault();
    const btn = document.getElementById("btnSaveStudent");
    const origText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងរក្សាទុក...`;
    btn.disabled = true;

    const isEdit = document.getElementById("stu_is_edit").value === "1";
    const payload = {
        id: document.getElementById("stu_id").value.trim(),
        name: document.getElementById("stu_name").value.trim(),
        gender: document.getElementById("stu_gender").value,
        dob: document.getElementById("stu_dob").value,
        photo_url: document.getElementById("stu_photo_val").value,
        
        pob_village: document.getElementById("stu_pob_village").value.trim(),
        pob_commune: document.getElementById("stu_pob_commune").value.trim(),
        pob_district: document.getElementById("stu_pob_district").value.trim(),
        pob_province: document.getElementById("stu_pob_province").value.trim(),

        curr_village: document.getElementById("stu_curr_village").value.trim(),
        curr_commune: document.getElementById("stu_curr_commune").value.trim(),
        curr_district: document.getElementById("stu_curr_district").value.trim(),
        curr_province: document.getElementById("stu_curr_province").value.trim(),

        father_name: document.getElementById("stu_father_name").value.trim(),
        father_job: document.getElementById("stu_father_job").value.trim(),
        mother_name: document.getElementById("stu_mother_name").value.trim(),
        mother_job: document.getElementById("stu_mother_job").value.trim(),
        
        grade: normalizeGrade(document.getElementById("stu_grade").value),
        room: document.getElementById("stu_room").value,
        parent_contact: document.getElementById("stu_contact").value.trim(),
        status: document.getElementById("stu_status").value,
        poor_id: document.getElementById("stu_poor").checked,
        scholarship: document.getElementById("stu_scholar").checked,
        disability: document.getElementById("stu_disable").checked
    };

    setTimeout(() => {
        if (isEdit) {
            const idx = window.allStudents.findIndex(s => String(s.id) === payload.id);
            if(idx > -1) window.allStudents[idx] = payload;
            else window.allStudents.push(payload); 
        } else {
            const exists = window.allStudents.find(s => String(s.id) === payload.id);
            if (exists) { payload.id = payload.id + "_" + Math.floor(Math.random() * 1000); }
            window.allStudents.unshift(payload);
        }

        try {
            localStorage.setItem('academic_students', JSON.stringify(window.allStudents));
        } catch(ex) {
            alert("ទំហំផ្ទុកពេញ! សូមសម្អាតទិន្នន័យ (Clear Cache) ឬកាត់បន្ថយទំហំរូបថត។");
            btn.innerHTML = origText;
            btn.disabled = false;
            return;
        }

        window.filterStudents();
        document.getElementById("studentModal").classList.replace("flex", "hidden");
        if(typeof showToast === 'function') showToast("✅ រក្សាទុកព័ត៌មានសិស្សបានជោគជ័យ!");

        btn.innerHTML = origText;
        btn.disabled = false;

        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof apiPost === 'function') {
             apiPost("saveStudent", { data: payload }).catch(console.error);
        }
    }, 500); 
};

window.deleteStudent = function(id) {
    if(confirm("⚠️ តើលោកគ្រូអ្នកគ្រូពិតជាចង់លុបសិស្សនេះចេញពីបញ្ជីមែនទេ? (ទិន្នន័យនឹងត្រូវលុបពី Google Sheet ផងដែរ)")) {
        
        window.allStudents = window.allStudents.filter(s => String(s.id) !== String(id));
        localStorage.setItem('academic_students', JSON.stringify(window.allStudents));

        window.filterStudents();
        if(typeof showToast === 'function') showToast("🗑️ បានលុបសិស្សចេញពីបញ្ជីដោយជោគជ័យ!");

        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof apiPost === 'function') {
             apiPost("deleteStudent", { id: id })
                .then(() => console.log(`Deleted Student ID: ${id} from Cloud`))
                .catch(e => console.error("Cloud Delete Failed:", e));
        }
    }
};

window.printIDCards = function(ids = null) {
    let targetStudents = ids ? window.allStudents.filter(s => ids.includes(String(s.id))) : window.filteredStudents;
    if (targetStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពកាតទេ!");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាចំណេះទូទៅ គំរូ";
    const academicYear = sInfo.academic_year || "2026-2027";
    const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
    const principalName = sInfo.principal_name || "នាយកសាលា";
    const lunarStr = sInfo.lunar_date || "ថ្ងៃព្រហស្បតិ៍ ១កើត ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០";
    const solarStr = sInfo.solar_date || "ធ្វើនៅ..............., ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...";
    
    const logoUrl = sInfo.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Seal_of_the_Ministry_of_Education%2C_Youth_and_Sport_of_Cambodia.svg/1024px-Seal_of_the_Ministry_of_Education%2C_Youth_and_Sport_of_Cambodia.svg.png";
    const sigUrl = sInfo.signature_url || ""; 

    let cardsHtml = "";
    targetStudents.forEach(stu => {
        let dobStr = stu.dob;
        if(dobStr && dobStr.includes('-')) {
            const p = dobStr.split('-');
            if(p.length === 3) dobStr = `${p[2]}/${p[1]}/${p[0]}`;
        }
        
        let levelStr = normalizeGrade(stu.grade || "ថ្នាក់ទី ១");
        let schoolPrefix = "សាលាបឋមសិក្សា";
        if(levelStr.includes("៧") || levelStr.includes("៨") || levelStr.includes("៩")) schoolPrefix = "អនុវិទ្យាល័យ";
        if(levelStr.includes("១០") || levelStr.includes("១១") || levelStr.includes("១២")) schoolPrefix = "វិទ្យាល័យ";

        let photoDisplay = `<div style="width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; background-color:#f1f5f9; font-weight:bold; font-size:24px; color:#cbd5e1;">${getAvatarInitial(stu.name)}</div>`;
        if (stu.photo_url && stu.photo_url.trim() !== "") {
             photoDisplay = `<img src="${stu.photo_url}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover; display:block;">`;
        }

        cardsHtml += `
            <div class="id-card">
                <img src="${logoUrl}" class="watermark" />
                <div class="inner-border">
                    <div class="header-row">
                        <img src="${logoUrl}" class="logo" />
                        <div class="header-text">
                            <div class="font-moul" style="font-size: 9px; color: #1e3a8a;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                            <div class="font-moul" style="font-size: 9px; margin-top: 1px; color: #1e3a8a;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                        </div>
                    </div>
                    
                    <div class="moeys-text font-moul">មន្ទីរអប់រំ យុវជន និងកីឡា${districtName}</div>
                    <div class="divider"></div>
                    
                    <div class="school-title font-moul">${schoolName}</div>
                    <div class="card-title font-moul">ប័ណ្ណសម្គាល់ខ្លួនសិស្ស</div>
                    
                    <div class="name-row font-bold">
                        ឈ្មោះ : <span class="text-blue font-muol">${stu.name}</span> &nbsp;&nbsp;&nbsp;&nbsp; ភេទ : <span class="text-blue">${stu.gender}</span>
                    </div>
                    
                    <div class="content-row">
                        <div class="photo-col">
                            <div class="photo-box">${photoDisplay}</div>
                            <div class="id-text font-bold">អត្តលេខ : ${stu.id}</div>
                        </div>
                        <div class="info-col font-bold">
                            <table class="info-table">
                                <tr><td class="lbl">ថ្ងៃខែឆ្នាំកំណើត</td><td>: <b>${dobStr || '-'}</b></td></tr>
                                <tr><td class="lbl">ជាសិស្ស</td><td>: <b class="text-rose-600">${levelStr} ${stu.room || ''}</b></td></tr>
                                <tr><td class="lbl">ឈ្មោះឪពុក</td><td>: <b>${stu.father_name || '-'}</b></td></tr>
                                <tr><td class="lbl">ឈ្មោះម្ដាយ</td><td>: <b>${stu.mother_name || '-'}</b></td></tr>
                                <tr><td class="lbl">ឆ្នាំសិក្សា</td><td>: <b class="text-blue">${academicYear}</b></td></tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="footer-sign">
                        <div class="dates font-bold">${lunarStr}<br>${solarStr}</div>
                        <div class="prin-title font-moul">នាយក</div>
                        <div class="sign-area">${sigUrl ? `<img src="${sigUrl}" />` : ''}</div>
                        <div class="prin-name font-moul">${principalName}</div>
                    </div>
                    
                    <div class="bottom-note font-bold">បញ្ជាក់៖ កាតនេះត្រូវពាក់រាល់ពេលមកសិក្សា</div>
                </div>
            </div>
        `;
    });

    const printContent = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
            <meta charset="utf-8"><title>បោះពុម្ពកាតសិស្ស</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
                @page { size: A4 portrait; margin: 10mm; }
                * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { margin: 0; padding: 0; background: #f8fafc; font-family: 'Siemreap', sans-serif; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; align-content: flex-start;}
                
                .id-card { width: 54mm; height: 86mm; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 4px; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.1); float: left; margin: 2mm; padding: 2px; overflow: hidden; }
                @media print { body { background: white; display: block; padding: 0; } .id-card { box-shadow: none; page-break-inside: avoid; margin: 2mm; border: 1px dashed #cbd5e1; border-radius: 0; } }

                .inner-border { border: 1px solid #1e3a8a; width: 100%; height: 100%; position: relative; padding: 3px; z-index: 10; background: rgba(255,255,255,0.95); }
                .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40mm; opacity: 0.06; z-index: 0; }

                .font-moul { font-family: 'Moul', serif; font-weight: normal; }
                .font-bold { font-weight: 700; }
                .text-blue { color: #1e3a8a; }
                .text-rose-600 { color: #e11d48; }

                .header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2px; }
                .logo { width: 12mm; height: 12mm; object-fit: contain; }
                .header-text { text-align: center; flex: 1; padding-top: 2px;}
                
                .moeys-text { text-align: center; color: #1e3a8a; font-size: 8px; margin-top: 2px; margin-bottom: 2px;}
                .divider { height: 1px; background-color: #1e3a8a; margin: 0 4px 4px 4px; }

                .school-title { text-align: center; font-size: 10px; color: #333; line-height: 1.4; }
                .card-title { text-align: center; font-size: 11px; color: #1e3a8a; margin: 3px 0 5px 0; background: #f1f5f9; padding: 2px 0; border-radius: 2px; border: 1px solid #e2e8f0; }

                .name-row { font-size: 10px; padding-left: 2px; margin-bottom: 4px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 2px; }
                
                .content-row { display: flex; gap: 4px; }
                .photo-col { width: 20mm; text-align: center; }
                .photo-box { width: 18mm; height: 24mm; margin: 0 auto; overflow: hidden; border: 1px solid #1e3a8a; background-color: #fff; border-radius: 2px; }
                .id-text { font-size: 9px; margin-top: 4px; color: #333; background: #f1f5f9; padding: 1px 0; border: 1px solid #e2e8f0; border-radius: 2px; }

                .info-col { flex: 1; }
                .info-table { width: 100%; font-size: 8px; border: none; }
                .info-table td { padding: 1px 0; border: none; vertical-align: top;}
                .info-table .lbl { width: 15mm; color: #64748b; }

                .footer-sign { text-align: center; margin-top: 4px; }
                .dates { font-size: 6px; line-height: 1.3; margin-bottom: 2px; color: #64748b; }
                .prin-title { font-size: 9px; }
                .sign-area { height: 12mm; display: flex; align-items: center; justify-content: center; }
                .sign-area img { max-height: 12mm; max-width: 25mm; }
                .prin-name { font-size: 9px; color: #e11d48; }

                .bottom-note { position: absolute; bottom: 1px; left: 0; width: 100%; text-align: center; font-size: 6px; color: #fff; background: #1e3a8a; padding: 1px 0; font-style: normal; }
            </style>
        </head>
        <body>
            ${cardsHtml}
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open(); printWindow.document.write(printContent); printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 800);
};

window.printStudentList = function() {
    if (window.filteredStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាចំណេះទូទៅ គំរូ";
    const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
    const academicYear = sInfo.academic_year || "2026-2027";
    const teacherName = sInfo.teacher_name || ".......................";
    const principalName = sInfo.principal_name || ".......................";
    const lunarStr = sInfo.lunar_date || "ថ្ងៃព្រហស្បតិ៍ ១កើត ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០";
    const solarStr = sInfo.solar_date || "ធ្វើនៅ..............., ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...";

    const filterGrade = document.getElementById("stuFilterGrade")?.value || "all";
    const filterRoom = document.getElementById("stuFilterRoom")?.value || "all";
    let subTitle = "";
    if (filterGrade !== "all") subTitle += `${filterGrade}`;
    if (filterRoom !== "all") subTitle += ` ${filterRoom}`;
    if (!subTitle) subTitle = "សិស្សទាំងអស់សរុប";

    let total = window.filteredStudents.length;
    let female = 0, poorTotal = 0, poorFemale = 0;
    let scholarTotal = 0, scholarFemale = 0;
    let disTotal = 0, disFemale = 0;

    let rowsHtml = "";
    window.filteredStudents.forEach((stu, idx) => {
        let isF = stu.gender === 'ស្រី';
        if (isF) female++;
        if (stu.poor_id) { poorTotal++; if(isF) poorFemale++; }
        if (stu.scholarship) { scholarTotal++; if(isF) scholarFemale++; }
        if (stu.disability) { disTotal++; if(isF) disFemale++; }

        let dobStr = stu.dob;
        if(dobStr && dobStr.includes('-')) {
            const p = dobStr.split('-');
            if(p.length === 3) dobStr = `${p[2]}/${p[1]}/${p[0]}`;
        }
        let remark = stu.status === "Dropped" ? "បោះបង់ការសិក្សា" : "";
        if (stu.poor_id) remark += " (ក្រីក្រ)";
        if (stu.scholarship) remark += " (អាហារូបករណ៍)";

        let addrText = formatAddress(stu.curr_village, stu.curr_commune);

        rowsHtml += `
            <tr class="font-bold">
                <td style="text-align: center;">${idx + 1}</td>
                <td style="text-align: center; font-family: monospace;">${stu.id}</td>
                <td style="text-align: left; padding-left: 6px;">${stu.name}</td>
                <td style="text-align: center;">${stu.gender}</td>
                <td style="text-align: center; font-family: monospace;">${dobStr || ''}</td>
                <td style="text-align: left; padding-left: 6px;">${addrText}</td>
                <td style="text-align: center; font-family: monospace;">${stu.parent_contact || ''}</td>
                <td style="text-align: center; color: #475569; font-size: 10px;">${remark}</td>
            </tr>
        `;
    });

    const printContent = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
            <meta charset="utf-8"><title>បញ្ជីរាយនាមសិស្ស</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
                @page { size: A4 portrait; margin: 15mm auto; }
                * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { margin: 0 auto; padding: 0; font-family: 'Siemreap', sans-serif; color: #000; background: #fff; font-size: 12px; width: 100%; max-width: 190mm; }
                
                .font-moul { font-family: 'Moul', serif; font-weight: normal; }
                .font-bold { font-weight: 700; }

                .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
                .header-left p { margin: 0 0 4px 0; font-size: 12px; }
                .header-right { text-align: center; }
                .header-right p { margin: 0 0 3px 0; font-size: 13px; }
                .title-box { text-align: center; margin: 15px 0 20px 0; }
                .title-box h2 { margin: 0 0 6px 0; font-size: 16px; text-transform: uppercase;}
                .title-box p { margin: 0; font-size: 12px; font-weight: bold; }
                
                table { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; margin-bottom: 20px; border: 2px solid black; }
                th, td { border: 1px solid #000; padding: 6px 4px; }
                th { background-color: #f1f5f9; font-family: 'Moul', serif; font-weight: normal; }
                
                .summary-table { width: 60%; margin: 0 auto 30px auto; font-size: 11px; }
                .summary-table th, .summary-table td { padding: 4px; }
                
                .footer-box { display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px; padding: 0 20px; font-weight: bold; }
                .footer-col { text-align: center; }
            </style>
        </head>
        <body>
            <div class="header-box">
                <div class="header-left">
                    <p class="font-moul">ការិយាល័យអប់រំ យុវជន និងកីឡា នៃរដ្ឋបាល${districtName}</p>
                    <p class="font-moul" style="color: #1e3a8a;">${schoolName}</p>
                </div>
                <div class="header-right">
                    <p class="font-moul">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p class="font-moul">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div style="font-family: serif; letter-spacing: 3px; font-weight: bold; margin-top: -3px;">𑁋𑁋𑁋𑁋𑁋</div>
                </div>
            </div>
            
            <div class="title-box">
                <h2 class="font-moul">បញ្ជីរាយនាមសិស្សានុសិស្ស</h2>
                <p class="font-bold">${subTitle} | ឆ្នាំសិក្សា ${academicYear}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">ល.រ</th>
                        <th style="width: 12%;">អត្តលេខ</th>
                        <th style="width: 20%; text-align: left; padding-left: 6px;">គោត្តនាម និងនាម</th>
                        <th style="width: 8%;">ភេទ</th>
                        <th style="width: 12%;">ថ្ងៃខែឆ្នាំកំណើត</th>
                        <th style="width: 20%; text-align: left; padding-left: 6px;">ទីលំនៅបច្ចុប្បន្ន</th>
                        <th style="width: 13%;">លេខទូរស័ព្ទ</th>
                        <th style="width: 10%;">ផ្សេងៗ</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <table class="summary-table font-bold">
                <thead>
                    <tr>
                        <th class="font-moul">សិស្សសរុប</th>
                        <th class="font-moul">សិស្សស្រី</th>
                        <th class="font-moul">ប័ណ្ណក្រីក្រ (សរុប/ស្រី)</th>
                        <th class="font-moul">អាហារូបករណ៍ (សរុប/ស្រី)</th>
                        <th class="font-moul">ពិការភាព (សរុប/ស្រី)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight:bold; color: #1e3a8a;">${total}</td>
                        <td style="font-weight:bold; color: #e11d48;">${female}</td>
                        <td>${poorTotal} / ${poorFemale}</td>
                        <td>${scholarTotal} / ${scholarFemale}</td>
                        <td>${disTotal} / ${disFemale}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer-box">
                <div class="footer-col">
                    <p style="margin: 0 0 8px 0;">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul" style="font-size: 12px; margin: 0;">នាយកសាលា</p>
                    <div style="height: 60px;"></div>
                    <p class="font-moul" style="color: #1e3a8a;">${principalName}</p>
                </div>
                <div class="footer-col">
                    <p style="margin: 0 0 3px 0; color: #64748b;">${lunarStr}</p>
                    <p style="margin: 0 0 8px 0; color: #64748b;">${solarStr}</p>
                    <p class="font-moul" style="font-size: 12px; margin: 0;">គ្រូបន្ទុកថ្នាក់</p>
                    <div style="height: 60px;"></div>
                    <p class="font-moul" style="color: #1e3a8a;">${teacherName}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open(); printWindow.document.write(printContent); printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
};

window.syncStudentsToCloud = async function(btnEl) {
    if (typeof apiPost !== 'function') return alert("❌ មុខងារតភ្ជាប់ apiPost មិនទាន់ដំណើរការទេ!");
    if (window.allStudents.length === 0) return alert("⚠️ មិនមានទិន្នន័យសិស្សសម្រាប់រក្សាទុកទេ!");

    let origText = "";
    if (btnEl) {
        origText = btnEl.innerHTML;
        btnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបញ្ជូន...`;
        btnEl.disabled = true;
    }

    try {
        await apiPost("saveStudentsBatch", { data: window.allStudents });
        if (typeof showToast === 'function') showToast("✅ ទិន្នន័យសិស្សត្រូវបានរក្សាទុកចូល Google Script ជោគជ័យ!");
        else alert("✅ ទិន្នន័យសិស្សត្រូវបានរក្សាទុកចូល Google Script ជោគជ័យ!");
    } catch (error) {
        console.error("Cloud Sync Error:", error);
        alert("❌ បរាជ័យក្នុងការតភ្ជាប់ទៅ Google Script! សូមពិនិត្យមើលអ៊ីនធឺណិត។");
    } finally {
        if (btnEl) {
            btnEl.innerHTML = origText;
            btnEl.disabled = false;
        }
    }
};

window.downloadStudentTemplate = function() {
    if (typeof XLSX === 'undefined') return alert("សូមភ្ជាប់ Library SheetJS ជាមុនសិន!");
    
    const headers = [
        "ល.រ", "អត្តលេខ", "គោត្តនាម និងនាម", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", 
        "ទីកន្លែងកំណើត(ភូមិ)", "ទីកន្លែងកំណើត(ឃុំ)", "ទីកន្លែងកំណើត(ស្រុក)", "ទីកន្លែងកំណើត(ខេត្ត)",
        "ទីលំនៅ(ភូមិ)", "ទីលំនៅ(ឃុំ)", "ទីលំនៅ(ស្រុក)", "ទីលំនៅ(ខេត្ត)",
        "ឈ្មោះឪពុក", "មុខរបរឪពុក", "ឈ្មោះម្ដាយ", "មុខរបរម្ដាយ",
        "ថ្នាក់រៀន", "បន្ទប់", "ទំនាក់ទំនង", "ប័ណ្ណក្រីក្រ", "អាហារូបករណ៍", "ពិការភាព"
    ];
    
    const sampleData1 = ["1", "STU10200", "សុខ សាន្ត", "ប្រុស", "2010-05-20", "ព្រែក", "ស្អាង", "ស្អាង", "កណ្តាល", "ព្រែក", "ស្អាង", "ស្អាង", "កណ្តាល", "សាន សុខ", "កសិករ", "មាស ស្រី", "មេផ្ទះ", "ថ្នាក់ទី ១", "«ក»", "012 345 678", "គ្មាន", "គ្មាន", "គ្មាន"];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData1]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    
    XLSX.writeFile(wb, "Student_Import_Template_Full.xlsx");
};

window.importStudentsExcel = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') return alert("សូមភ្ជាប់ Library SheetJS ជាមុនសិន!");

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
            let importedCount = 0;
            
            for (let r = 1; r < rows.length; r++) {
                const rowData = rows[r];
                const name = String(rowData[2]).trim();
                if (!name || name === "undefined") continue; 
                
                const id = String(rowData[1] || `STU${Math.floor(Math.random() * 900000 + 100000)}`).trim();
                const existingIdx = window.allStudents.findIndex(s => String(s.id) === id);
                
                const newStu = {
                    id: id,
                    name: name,
                    gender: String(rowData[3] || "ប្រុស").trim(),
                    dob: String(rowData[4] || "").trim(),
                    photo_url: "", 
                    
                    pob_village: String(rowData[5] || "").trim(),
                    pob_commune: String(rowData[6] || "").trim(),
                    pob_district: String(rowData[7] || "").trim(),
                    pob_province: String(rowData[8] || "").trim(),

                    curr_village: String(rowData[9] || "").trim(),
                    curr_commune: String(rowData[10] || "").trim(),
                    curr_district: String(rowData[11] || "").trim(),
                    curr_province: String(rowData[12] || "").trim(),

                    father_name: String(rowData[13] || "").trim(),
                    father_job: String(rowData[14] || "").trim(),
                    mother_name: String(rowData[15] || "").trim(),
                    mother_job: String(rowData[16] || "").trim(),

                    grade: normalizeGrade(String(rowData[17] || "ថ្នាក់ទី ១")),
                    room: String(rowData[18] || "«ក»").trim(),
                    parent_contact: String(rowData[19] || "").trim(),
                    poor_id: String(rowData[20]).includes("មាន"),
                    scholarship: String(rowData[21]).includes("មាន"),
                    disability: String(rowData[22]).includes("មាន"),
                    status: "Active"
                };

                if (existingIdx > -1) window.allStudents[existingIdx] = newStu;
                else window.allStudents.push(newStu);
                importedCount++;
            }
            
            localStorage.setItem('academic_students', JSON.stringify(window.allStudents));
            
            const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
            if (sInfo.auto_sync && typeof apiPost === 'function') {
                apiPost("saveStudentsBatch", { data: window.allStudents }).catch(console.error);
            }

            event.target.value = ""; 
            window.filterStudents();
            
            if(typeof showToast === 'function') showToast(`📥 នាំចូលសិស្សបានសម្រេច ${importedCount} នាក់!`);
            else alert(`នាំចូលសិស្សបានសម្រេច ${importedCount} នាក់!`);
        } catch (error) {
            console.error(error);
            alert("❌ មានបញ្ហាក្នុងការអានឯកសារ Excel។ សូមប្រាកដថាទម្រង់ឯកសារត្រឹមត្រូវ។");
        }
    };
    reader.readAsArrayBuffer(file);
};

window.exportStudentsExcel = function() {
    if (window.filteredStudents.length === 0) return alert("គ្មានទិន្នន័យសម្រាប់ទាញយកទេ!");

    let tableHtml = `
        <table border="1">
            <tr>
                <th>ល.រ</th><th>អត្តលេខ</th><th>គោត្តនាម និងនាម</th><th>ភេទ</th><th>ថ្ងៃខែឆ្នាំកំណើត</th>
                <th>ទីកន្លែងកំណើត(ភូមិ)</th><th>ទីកន្លែងកំណើត(ឃុំ)</th><th>ទីកន្លែងកំណើត(ស្រុក)</th><th>ទីកន្លែងកំណើត(ខេត្ត)</th>
                <th>ទីលំនៅ(ភូមិ)</th><th>ទីលំនៅ(ឃុំ)</th><th>ទីលំនៅ(ស្រុក)</th><th>ទីលំនៅ(ខេត្ត)</th>
                <th>ឈ្មោះឪពុក</th><th>មុខរបរឪពុក</th><th>ឈ្មោះម្ដាយ</th><th>មុខរបរម្ដាយ</th>
                <th>ថ្នាក់រៀន</th><th>បន្ទប់</th><th>ទំនាក់ទំនង</th><th>ប័ណ្ណក្រីក្រ</th><th>អាហារូបករណ៍</th><th>ពិការភាព</th><th>ស្ថានភាព</th>
            </tr>
    `;
    
    window.filteredStudents.forEach((s, idx) => {
        tableHtml += `
            <tr>
                <td>${idx+1}</td><td>${s.id}</td><td>${s.name}</td><td>${s.gender}</td><td>${s.dob||''}</td>
                <td>${s.pob_village||''}</td><td>${s.pob_commune||''}</td><td>${s.pob_district||''}</td><td>${s.pob_province||''}</td>
                <td>${s.curr_village||''}</td><td>${s.curr_commune||''}</td><td>${s.curr_district||''}</td><td>${s.curr_province||''}</td>
                <td>${s.father_name||''}</td><td>${s.father_job||''}</td><td>${s.mother_name||''}</td><td>${s.mother_job||''}</td>
                <td>${normalizeGrade(s.grade)}</td><td>${s.room}</td><td>${s.parent_contact||''}</td>
                <td>${s.poor_id ? 'មាន' : 'គ្មាន'}</td><td>${s.scholarship ? 'មាន' : 'គ្មាន'}</td><td>${s.disability ? 'មាន' : 'គ្មាន'}</td>
                <td>${s.status==='Active'?'កំពុងសិក្សា':'បោះបង់'}</td>
            </tr>
        `;
    });
    tableHtml += `</table>`;

    const finalHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"></head>
        <body>${tableHtml}</body>
        </html>
    `;
    
    const blob = new Blob(['\ufeff', finalHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a"); 
    link.href = URL.createObjectURL(blob); 
    link.download = `Student_List_${new Date().toISOString().split('T')[0]}.xls`; 
    link.click();
};