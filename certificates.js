// =========================================================================
// ឯកសារ js/certificates.js - ម៉ាស៊ីនផលិតប័ណ្ណសរសើរ (Interactive Canva-like Editor & Print)
// =========================================================================

window.currentCertBg = "";
let activeCertEl = null;
let isCertDragging = false;
let certStartX, certStartY, certInitialX, certInitialY;

// អនុគមន៍ជំនួយបំប្លែងលេខខ្មែរ
function toKhmerNum(str) {
    if (!str) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
}

// ---------------------------------------------------------
// ១. មុខងារគ្រប់គ្រងផ្ទាំងទូទៅ (UI & Form Handlers)
// ---------------------------------------------------------

window.updateCertPeriodDropdown = function() {
    const type = document.getElementById("certPeriodType")?.value;
    const valSelect = document.getElementById("certPeriodValue");
    if (!valSelect) return;
  
    if (type === "monthly") {
        valSelect.innerHTML = `
            <option value="មករា" selected>ខែ មករា</option> <option value="កុម្ភៈ">ខែ កុម្ភៈ</option>
            <option value="មីនា">ខែ មីនា</option> <option value="មេសា">ខែ មេសា</option>
            <option value="ឧសភា">ខែ ឧសភា</option> <option value="មិថុនា">ខែ មិថុនា</option>
            <option value="កក្កដា">ខែ កក្កដា</option> <option value="សីហា">ខែ សីហា</option>
            <option value="កញ្ញា">ខែ កញ្ញា</option> <option value="តុលា">ខែ តុលា</option>
            <option value="វិច្ឆិកា">ខែ វិច្ឆិកា</option> <option value="ធ្នូ">ខែ ធ្នូ</option>
        `;
    } else if (type === "semester") {
        valSelect.innerHTML = `<option value="ឆមាសទី១" selected>ឆមាសទី១</option><option value="ឆមាសទី២">ឆមាសទី២</option>`;
    } else if (type === "annual") {
        valSelect.innerHTML = `<option value="ប្រចាំឆ្នាំ" selected>លទ្ធផលប្រចាំឆ្នាំ</option>`;
    }
    
    if (typeof window.generateCertificatePreview === "function") {
        window.generateCertificatePreview();
    }
};

window.changeCertFrame = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.currentCertBg = e.target.result;
            window.generateCertificatePreview();
        };
        reader.readAsDataURL(file);
    }
};

window.loadCertificatesView = async function() {
    const container = document.getElementById("certificatesContainer") || document.getElementById("mainContentArea");
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];

    // បង្កើតបញ្ជីថ្នាក់រៀនស្វ័យប្រវត្តិពី ទី១ ដល់ ទី១២
    let gradesOptions = "";
    for (let i = 1; i <= 12; i++) {
        let khGrade = toKhmerNum(i.toString());
        gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}" ${i===2?'selected':''}>ថ្នាក់ទី ${khGrade}</option>`;
    }

    container.innerHTML = `
      <!-- នាំចូល Fonts បន្ថែមពី Google Fonts -->
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Kantumruy+Pro:wght@400;700&family=Moul&family=Siemreap&display=swap');
        .font-battambang { font-family: 'Battambang', sans-serif !important; }
        .font-kantumruy { font-family: 'Kantumruy Pro', sans-serif !important; }
      </style>

      <div class="space-y-6 animate-fade-in pb-10 font-siemreap text-slate-800 max-w-[1600px] mx-auto relative">
        
        <!-- Canva Floating Toolbar -->
        <div id="canvaToolbar" class="hidden absolute z-[200] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 p-2 flex flex-wrap items-center gap-2 transition-all max-w-[90vw]">
           <div class="flex items-center gap-1 border-r border-slate-200 pr-2">
              <select id="canvaFontSelector" onchange="window.changeElementFont(this.value)" class="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded p-1.5 outline-none cursor-pointer">
                  <option value="font-moul" class="font-moul">Moul (ចំណងជើង)</option>
                  <option value="font-siemreap" class="font-siemreap">Siemreap (អត្ថបទ)</option>
                  <option value="font-battambang" class="font-battambang">Battambang (ទូទៅ)</option>
                  <option value="font-kantumruy" class="font-kantumruy">Kantumruy Pro (ទំនើប)</option>
              </select>
           </div>
           <div class="flex items-center gap-1 border-r border-slate-200 pr-2 pl-1">
              <input type="color" id="canvaColorPicker" oninput="window.changeElementColor(this.value)" class="w-8 h-8 rounded cursor-pointer border-0 p-0" title="ចាក់ពណ៌">
           </div>
           <div class="flex items-center gap-1 border-r border-slate-200 pr-2 pl-1">
              <button onclick="window.changeElementSize(1)" class="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700 font-bold" title="ពង្រីក">+</button>
              <button onclick="window.changeElementSize(-1)" class="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700 font-bold" title="បង្រួម">-</button>
              <button onclick="window.toggleElementBold()" class="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700 font-bold font-serif" title="អក្សរដិត">B</button>
           </div>
           <div class="flex items-center gap-1 pl-1">
              <button onclick="window.deleteActiveElement()" class="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="លុបចោល"><i class="fa-solid fa-trash text-xs"></i></button>
              <button onclick="window.closeCanvaToolbar()" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600" title="បិទម៉ឺនុយ"><i class="fa-solid fa-xmark"></i></button>
           </div>
        </div>

        <!-- Top Control Panel -->
        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] flex flex-col xl:flex-row justify-between xl:items-center gap-6 no-print relative overflow-hidden transition-all hover:shadow-md">
          <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
          
          <div class="relative z-10 flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-amber-100"><i class="fa-solid fa-award"></i></div>
            <div>
              <h2 class="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3 font-moul mb-1">
                ម៉ាស៊ីនផលិតប័ណ្ណសរសើរ
              </h2>
              <div class="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-[11px] font-bold border border-pink-200 animate-pulse inline-block shadow-sm">
                <i class="fa-solid fa-wand-magic-sparkles"></i> អាចចុច កែពណ៌ ប្តូរFont លុប និងអូសបានលើប័ណ្ណផ្ទាល់
              </div>
            </div>
          </div>
          
          <div class="flex flex-wrap items-center justify-end gap-3 relative z-10 w-full xl:w-auto">
            
            <div class="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 shadow-sm">
              <i class="fa-solid fa-layer-group text-slate-400 text-[11px]"></i>
              <select id="certLevelSelect" onchange="window.generateCertificatePreview()" class="border-none bg-transparent text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer p-1">
                ${gradesOptions}
              </select>
              <span class="text-slate-300">|</span>
              <select id="certRoomSelect" onchange="window.generateCertificatePreview()" class="border-none bg-transparent text-xs font-bold text-amber-700 focus:ring-0 outline-none cursor-pointer p-1">
                <option value="«ក»">«ក»</option> <option value="«ខ»" selected>«ខ»</option> <option value="«គ»">«គ»</option> <option value="«ឃ»">«ឃ»</option>
              </select>
            </div>

            <!-- ផ្នែកជ្រើសរើសប្រភេទរយៈពេល (ខែ/ឆមាស/ឆ្នាំ) ដែលខ្វះខាតពីមុន -->
            <div class="flex items-center gap-2 bg-amber-50 border-2 border-amber-100 rounded-xl px-3 py-2 shadow-sm">
              <i class="fa-solid fa-calendar-days text-amber-500 text-[11px]"></i>
              <select id="certPeriodType" onchange="window.updateCertPeriodDropdown()" class="border-none bg-transparent text-xs font-bold text-amber-900 focus:ring-0 outline-none cursor-pointer p-1">
                <option value="monthly" selected>ប្រចាំខែ</option>
                <option value="semester">ប្រចាំឆមាស</option>
                <option value="annual">ប្រចាំឆ្នាំ</option>
              </select>
              <span class="text-amber-300">|</span>
              <select id="certPeriodValue" onchange="window.generateCertificatePreview()" class="border-none bg-transparent text-xs font-bold text-indigo-700 focus:ring-0 outline-none cursor-pointer p-1"></select>
            </div>

            <div class="flex items-center gap-2 bg-blue-50 border-2 border-blue-100 rounded-xl px-3 py-2 shadow-sm">
              <i class="fa-solid fa-palette text-blue-500 text-xs"></i>
              <select id="certTemplateSelect" onchange="window.generateCertificatePreview()" class="text-xs font-bold text-blue-900 bg-transparent outline-none cursor-pointer">
                <option value="1" selected>គំរូទី ១ (ស្តង់ដារក្រសួង)</option>
                <option value="2">គំរូទី ២ (មានរូបថត)</option>
                <option value="3">គំរូទី ៣ (ទំនើប Vintage)</option>
                <option value="4">គំរូទី ៤ (វិញ្ញាបនបត្រ)</option>
              </select>
            </div>
            
            <button type="button" onclick="window.generateCertificatePreview()" class="px-5 py-2.5 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2">
              <i class="fa-solid fa-rotate-right"></i> បង្កើតថ្មី
            </button>
            <button type="button" onclick="window.printOfficialCertificates()" class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2">
              <i class="fa-solid fa-print"></i> Print ទាំង ៥
            </button>
          </div>
        </div>

        <!-- Design Toolbar (Canvas Tools) -->
        <div class="bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3 no-print">
            <span class="text-xs font-bold text-slate-500 mr-2 border-r border-slate-200 pr-4">ឧបករណ៍រចនា ៖</span>
            
            <label class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer no-close-canva">
              <i class="fa-solid fa-image"></i> បញ្ចូល Logo
              <input type="file" accept="image/*" class="hidden" onchange="window.addCustomImage(event, 'logo')">
            </label>
            <label class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer no-close-canva">
              <i class="fa-solid fa-stamp"></i> ត្រា / ហត្ថលេខា
              <input type="file" accept="image/*" class="hidden" onchange="window.addCustomImage(event, 'seal')">
            </label>
            <button type="button" onclick="window.addCustomText()" class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 no-close-canva">
              <i class="fa-solid fa-t"></i> បន្ថែមអក្សរ
            </button>
            <label class="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto no-close-canva">
              <i class="fa-regular fa-images"></i> ដូរផ្ទៃស៊ុមក្រោយ (BG)
              <input type="file" accept="image/*" class="hidden" onchange="window.changeCertFrame(event)">
            </label>
        </div>

        <!-- Preview Area -->
        <div class="bg-slate-200/80 p-6 md:p-8 rounded-[2rem] border border-slate-300 shadow-inner flex flex-col items-center gap-8 overflow-y-auto max-h-[85vh] print:max-h-none print:p-0 print:bg-white print:border-none print:shadow-none min-h-[600px] relative" id="certificatePrintArea">
           <div class="text-center text-slate-500 font-bold mt-32 flex flex-col items-center">
              <div class="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-5xl text-slate-300 mb-4 shadow-sm border border-slate-200"><i class="fa-solid fa-award"></i></div>
              <p class="text-lg">សូមជ្រើសរើសថ្នាក់ និងចុច "បង្កើតថ្មី" ដើម្បីបង្ហាញប័ណ្ណសរសើរ</p>
           </div>
        </div>
      </div>
    `;
    
    window.updateCertPeriodDropdown();
    window.initCertCanvaEngine(); 
};

// ---------------------------------------------------------
// ២. មុខងារបន្ថែមរូបភាព ត្រា និងអត្ថបទ (Design Capabilities)
// ---------------------------------------------------------

window.addCustomImage = function(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const imgUrl = e.target.result;
        // បន្ថែមរូបភាពទៅគ្រប់ប័ណ្ណសរសើរដែលកំពុង Preview (៥ សន្លឹក)
        const certs = document.querySelectorAll('.cert-preview-card');
        if(certs.length === 0) {
            alert("សូមចុចប៊ូតុង 'បង្កើតថ្មី' ដើម្បីឱ្យលោតផ្ទាំងប័ណ្ណសិន មុននឹងបញ្ចូលធាតុថ្មី!");
            return;
        }

        certs.forEach(cert => {
            const wrapper = document.createElement('div');
            // ដាក់ absolute និងកណ្តាលដើម្បីងាយស្រួលអូស
            wrapper.className = 'canva-cert-el absolute p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded z-50 inline-block';
            wrapper.style.left = type === 'logo' ? '20%' : '80%';
            wrapper.style.top = type === 'logo' ? '20%' : '80%';
            wrapper.style.transform = 'translate(-50%, -50%)';
            wrapper.style.cursor = 'grab';
            
            const img = document.createElement('img');
            img.src = imgUrl;
            // សម្រាប់ត្រា ធ្វើអោយព្រិល Background (mix-blend-multiply)
            if(type === 'seal') {
                img.className = 'w-32 h-auto pointer-events-none mix-blend-multiply';
            } else {
                img.className = 'w-24 h-auto pointer-events-none object-contain';
            }

            wrapper.appendChild(img);
            cert.appendChild(wrapper);
        });
    };
    reader.readAsDataURL(file);
};

window.addCustomText = function() {
    const certs = document.querySelectorAll('.cert-preview-card');
    if(certs.length === 0) {
        alert("សូមចុចប៊ូតុង 'បង្កើតថ្មី' ដើម្បីឱ្យលោតផ្ទាំងប័ណ្ណសិន!");
        return;
    }

    certs.forEach(cert => {
        const wrapper = document.createElement('div');
        wrapper.className = 'canva-cert-el absolute p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded z-50 inline-block';
        wrapper.style.left = '50%';
        wrapper.style.top = '50%';
        wrapper.style.transform = 'translate(-50%, -50%)';
        wrapper.style.cursor = 'grab';

        const textNode = document.createElement('div');
        textNode.contentEditable = "true";
        textNode.spellcheck = false;
        textNode.innerHTML = "អត្ថបទថ្មី";
        textNode.className = 'font-moul text-xl text-slate-800 outline-none drop-shadow-sm';

        wrapper.appendChild(textNode);
        cert.appendChild(wrapper);
    });
};

// ---------------------------------------------------------
// ៣. ម៉ាស៊ីនបង្កើតប័ណ្ណសរសើរ (Certificate Generation Engine - កែសម្រួលថ្មីឱ្យបង្ហាញជានិច្ច)
// ---------------------------------------------------------

window.generateCertificatePreview = async function() {
    const level = document.getElementById("certLevelSelect").value;
    const room = document.getElementById("certRoomSelect").value;
    const periodType = document.getElementById("certPeriodType")?.value || "monthly";
    const periodVal = document.getElementById("certPeriodValue")?.value || "មករា";
    const templateId = document.getElementById("certTemplateSelect").value;
    const grade = level ? `${level} ${room}` : "";

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
    const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
    const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
  
    const khmerAcademicYear = toKhmerNum(academic_year);
    const issueDateText = `ថ្ងៃទី ........ ខែ ........ ឆ្នាំ ${toKhmerNum(new Date().getFullYear().toString())}`;

    const container = document.getElementById("certificatePrintArea");
    container.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-amber-500 font-bold mt-20"><i class="fa-solid fa-circle-notch animate-spin text-5xl mb-4"></i><span class="text-lg">កំពុងទាញយកទិន្នន័យសិស្ស...</span></div>`;

    try {
        // ១. ទាញយកបញ្ជីសិស្សពីគ្រប់ប្រភពដែលអាចធ្វើไปបាន
        let students = [];
        if (typeof apiGet === "function") { 
            try { 
                const stRes = await apiGet("getStudents", { status: "Active" }); 
                students = (stRes && stRes.data) ? stRes.data : (Array.isArray(stRes) ? stRes : []);
            } catch(e) {} 
        }
        
        if (students.length === 0 && typeof attendanceStudents !== 'undefined' && attendanceStudents.length > 0) {
            students = attendanceStudents;
        }
        
        if (students.length === 0) {
            students = JSON.parse(localStorage.getItem('academic_students')) || [];
        }

        // ស្រង់សិស្សតាមថ្នាក់
        let cleanLevel = level.replace(/ថ្នាក់ទី|\s+/g, ''); 
        let cleanRoom = room.replace(/[«»\s]/g, ''); 
        let expectedFull = cleanLevel + cleanRoom; 

        let classStudents = students.filter(s => {
            if (s.status === "Dropped") return false;
            let sGradeStr = String(s.grade || "") + String(s.room || "");
            let cleanSGrade = sGradeStr.replace(/ថ្នាក់ទី|[«»\s]/g, '');
            return cleanSGrade === expectedFull || cleanSGrade.includes(expectedFull) || cleanSGrade.startsWith(cleanLevel);
        });

        // បើរកមិនឃើញសិស្សតាមថ្នាក់ទេ ទាញយកសិស្សទាំងអស់មកបង្ហាញកុំឱ្យទទេ
        if (classStudents.length === 0) {
            classStudents = students.slice(0, 5); // យក ៥ នាក់ដំបូងមកតេស្តបង្ហាញ
        }

        if (classStudents.length === 0) {
            return container.innerHTML = `<div class="bg-rose-50 text-rose-600 p-8 rounded-3xl font-bold text-lg my-20 border border-rose-200 shadow-sm flex flex-col items-center"><i class="fa-solid fa-folder-open text-5xl mb-4 text-rose-300"></i>❌ រកមិនឃើញទិន្នន័យសិស្សក្នុងថ្នាក់ [${grade}] ទេ! សូមបញ្ចូលឈ្មោះសិស្សក្នុងប្រព័ន្ធជាមុនសិន។</div>`;
        }

        // ចាត់ថ្នាក់សិស្ស (យកត្រឹម ៥ នាក់ដំបូងសម្រាប់ធ្វើប័ណ្ណ Top 5)
        let top5Students = classStudents.slice(0, 5).map((stu, index) => {
            return {
                ...stu,
                rank: index + 1
            };
        });

        let periodText = periodType === "annual" ? "ប្រចាំឆ្នាំ" : periodVal;
        let allCertificatesHtml = "";
        const isCustomFrame = !!window.currentCertBg;
        const moeysLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Cambodia_Ministry_of_Education_Youth_and_Sport_Logo.svg/1024px-Cambodia_Ministry_of_Education_Youth_and_Sport_Logo.svg.png";

        top5Students.forEach((student) => {
            let rankNumKhmer = toKhmerNum(student.rank.toString());
            let formattedDOB = student.dob ? formatKhmerDate(student.dob) : ".........."; 
            let genderTitle = student.gender === "ស្រី" ? "យុវតី" : "យុវជន";
            let photoUrl = student.photo_url || "https://placehold.co/300x400/e2e8f0/475569?text=Photo";
            let templateContent = "";

            // --- គំរូទី ១ និង ៣ (ស្តង់ដារក្រសួង ពណ៌មាស) ---
            if (templateId === "1" || templateId === "3") {
                const wrapperClass = isCustomFrame ? "h-full w-full p-8 flex flex-col justify-between relative z-10" : "border-[12px] border-double border-amber-400 h-full w-full p-8 flex flex-col justify-between relative bg-white shadow-sm z-10";
                
                templateContent = `
                   <div class="${wrapperClass}">
                      ${isCustomFrame ? '' : `<div class="absolute inset-1 border border-amber-300 pointer-events-none"></div>`}
                      
                      <div class="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
                          <img src="${moeysLogoUrl}" class="h-2/3 object-contain">
                      </div>

                      <div class="flex justify-between items-start w-full relative z-10 px-4">
                         <div class="text-center canva-cert-el cursor-grab p-2">
                            <img src="${moeysLogoUrl}" class="h-16 mx-auto mb-2 object-contain pointer-events-none">
                            <p contenteditable="true" spellcheck="false" class="font-moul text-blue-900 text-[13px] outline-none">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                            <p contenteditable="true" spellcheck="false" class="font-moul text-blue-900 text-[14px] mt-1 outline-none">មន្ទីរអប់រំ យុវជន និងកីឡា</p>
                         </div>
                         <div class="text-center canva-cert-el cursor-grab p-2 mt-4">
                            <p contenteditable="true" spellcheck="false" class="font-moul text-blue-900 text-[15px] outline-none">ព្រះរាជាណាចក្រកម្ពុជា</p>
                            <p contenteditable="true" spellcheck="false" class="font-moul text-blue-900 text-[16px] mt-1 outline-none">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                            <div class="font-siemreap tracking-[4px] mt-1 text-[11px] font-bold text-blue-900 pointer-events-none">𑁋𑁋𑁋𑁋𑁋</div>
                         </div>
                      </div>

                      <div class="text-center w-full relative z-10 mt-2">
                         <div class="canva-cert-el cursor-grab p-2 w-full">
                            <h1 contenteditable="true" spellcheck="false" class="font-moul text-5xl text-red-600 tracking-[0.1em] outline-none drop-shadow-sm mb-4">ប័ណ្ណសរសើរ</h1>
                            <h2 contenteditable="true" spellcheck="false" class="font-moul text-xl text-slate-800 outline-none">នាយកសាលា ${school_name}</h2>
                         </div>
                         
                         <div class="canva-cert-el cursor-grab p-2 w-full mt-4">
                            <div contenteditable="true" spellcheck="false" class="font-siemreap text-[18px] text-slate-800 leading-[2.5] text-center max-w-[850px] mx-auto px-4 outline-none">
                               សូមសរសើរចំពោះសិស្សឈ្មោះ <span class="font-moul text-blue-800 text-2xl mx-2 border-b border-dotted border-blue-400 pb-0.5">${student.name || 'ឈ្មោះសិស្ស'}</span> 
                               ភេទ <span class="font-bold text-blue-900">${student.gender || 'ប្រុស'}</span> កើតថ្ងៃទី <span class="font-bold text-blue-900">${formattedDOB}</span><br>
                               រៀនថ្នាក់ទី <span class="font-bold text-red-600 text-xl mx-2">${grade}</span> 
                               ដែលទទួលបានចំណាត់ថ្នាក់លេខ <span class="font-bold text-red-600 text-3xl mx-2">${rankNumKhmer}</span> 
                               ប្រចាំ <span class="font-bold text-blue-900">${periodText}</span> ឆ្នាំសិក្សា <span class="font-bold text-red-600">${khmerAcademicYear}</span> ។<br>
                               ប័ណ្ណសរសើរនេះប្រគល់ជូនសាមីខ្លួនប្រើប្រាស់តាមការដែលអាងប្រើបាន ។
                            </div>
                         </div>
                      </div>

                      <div class="flex justify-end pr-16 font-siemreap relative z-10 pb-6 mt-4">
                         <div class="text-center text-sm font-bold canva-cert-el cursor-grab p-3">
                            <p contenteditable="true" spellcheck="false" class="mb-2 outline-none text-slate-700">ធ្វើនៅ...................., ${issueDateText}</p>
                            <p contenteditable="true" spellcheck="false" class="font-moul mt-6 text-lg text-slate-800 outline-none">នាយកសាលា</p>
                            <div class="h-24 border-b border-dashed border-slate-500 mt-2 min-w-[180px]"></div>
                         </div>
                      </div>
                   </div>
                `;
            } 
            // --- គំរូទី ២ (មានរូបថត និងផ្លាកចំណាត់ថ្នាក់) ---
            else if (templateId === "2") {
                const wrapperClass = isCustomFrame ? "h-full w-full p-10 flex flex-col justify-between relative z-10" : "border-t-[20px] border-l-[20px] border-b-[20px] border-blue-900 h-full w-full p-8 flex flex-col justify-between relative bg-white shadow-sm z-10";
                
                templateContent = `
                   <div class="${wrapperClass}">
                      ${isCustomFrame ? '' : `<div class="absolute inset-0 border-[8px] border-amber-400 pointer-events-none z-20" style="clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 20%, 20% 0);"></div>`}
                      
                      <div class="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
                          <img src="${moeysLogoUrl}" class="h-2/3 object-contain">
                      </div>

                      <div class="flex justify-between items-start text-sm font-moul relative z-10 pl-24">
                         <div class="text-center leading-[1.8] canva-cert-el cursor-grab p-2">
                            <p contenteditable="true" spellcheck="false" class="text-blue-800 text-[14px] outline-none">មន្ទីរអប់រំ យុវជន និងកីឡា</p>
                            <p contenteditable="true" spellcheck="false" class="text-blue-900 mt-1 text-[15px] outline-none">${school_name}</p>
                         </div>
                         <div class="text-center leading-[1.8] canva-cert-el cursor-grab p-2">
                            <p contenteditable="true" spellcheck="false" class="text-blue-800 text-[15px] outline-none">ព្រះរាជាណាចក្រកម្ពុជា</p>
                            <p contenteditable="true" spellcheck="false" class="text-blue-900 mt-1 text-[16px] outline-none">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                            <div class="font-siemreap tracking-[4px] mt-1 text-[11px] font-bold text-blue-900 pointer-events-none">𑁋𑁋𑁋𑁋𑁋</div>
                         </div>
                      </div>

                      <div class="text-center my-auto flex flex-col items-center w-full relative z-10">
                         <div class="absolute top-0 right-10 canva-cert-el cursor-grab p-2 z-20">
                            <div class="relative flex justify-center items-center w-20 h-20 bg-red-600 rounded-full border-4 border-amber-300 shadow-md">
                                <span class="font-moul text-white text-3xl drop-shadow">${rankNumKhmer}</span>
                            </div>
                         </div>

                         <div class="canva-cert-el cursor-grab p-2 w-full">
                            <h1 contenteditable="true" spellcheck="false" class="font-moul text-5xl text-red-600 tracking-widest outline-none mb-4">ប័ណ្ណសរសើរ</h1>
                            <h2 contenteditable="true" spellcheck="false" class="font-moul text-xl text-blue-900 outline-none">នាយកសាលា ${school_name}</h2>
                         </div>
                         
                         <div class="canva-cert-el cursor-grab p-2 w-full mt-2">
                            <div contenteditable="true" spellcheck="false" class="font-siemreap text-[18px] text-slate-800 leading-[2.4] text-center max-w-[800px] mx-auto outline-none">
                               សូមសរសើរចំពោះសិស្សឈ្មោះ <span class="font-moul text-blue-800 text-2xl mx-2">${student.name || 'សិស្ស'}</span> 
                               ភេទ <span class="font-bold text-blue-900">${student.gender || '-'}</span> រៀនថ្នាក់ទី <span class="font-bold text-blue-900 text-xl mx-1">${grade}</span><br>
                               ដែលទទួលបានចំណាត់ថ្នាក់លេខ <span class="font-bold text-red-600 text-3xl mx-2">${rankNumKhmer}</span> 
                               ប្រចាំ <span class="font-bold text-blue-900">${periodText}</span> ឆ្នាំសិក្សា <span class="font-bold text-blue-900">${khmerAcademicYear}</span> ។
                            </div>
                         </div>
                      </div>

                      <div class="flex justify-between items-end px-10 font-siemreap relative z-10 pb-2">
                         <div class="text-center text-sm font-bold canva-cert-el cursor-grab p-3">
                            <p contenteditable="true" class="mb-2 outline-none text-slate-700">បានឃើញ និងឯកភាព</p>
                            <p contenteditable="true" class="font-moul mt-6 text-lg text-slate-800 outline-none">នាយកសាលា</p>
                            <div class="h-20 border-b border-dashed border-slate-500 mt-2 min-w-[150px]"></div>
                         </div>
                         
                         <div class="canva-cert-el cursor-grab p-1 bg-white border-2 border-slate-300 shadow-sm relative z-20">
                            <img src="${photoUrl}" class="w-20 h-28 object-cover object-top pointer-events-none" alt="Student Photo">
                         </div>

                         <div class="text-center text-sm font-bold canva-cert-el cursor-grab p-3">
                            <p contenteditable="true" class="mb-2 outline-none text-slate-700">ធ្វើនៅ....................</p>
                            <p contenteditable="true" class="font-moul mt-6 text-lg text-slate-800 outline-none">គ្រូបន្ទុកថ្នាក់</p>
                            <div class="h-20 border-b border-dashed border-slate-500 mt-2 min-w-[150px]"></div>
                         </div>
                      </div>
                   </div>
                `;
            }
            // --- គំរូទី ៤ (វិញ្ញាបនបត្រ) ---
            else {
                const wrapperClass = isCustomFrame ? "h-full w-full p-10 flex flex-col justify-between items-center text-center relative z-10" : "border-[12px] border-solid border-indigo-900 h-full w-full p-10 flex flex-col justify-between items-center text-center bg-white rounded-xl relative shadow-xl z-10";
                templateContent = `
                   <div class="${wrapperClass}">
                      <div class="w-full flex justify-between items-center relative z-10 px-6 text-xs font-moul text-indigo-900">
                         <div class="text-left canva-cert-el p-1 cursor-grab"><p contenteditable="true" class="outline-none text-[13px]">${school_name}</p></div>
                         <div class="text-center canva-cert-el p-1 cursor-grab"><p contenteditable="true" class="text-[14px] text-blue-900 outline-none">ព្រះរាជាណាចក្រកម្ពុជា</p></div>
                      </div>
                      <div class="relative z-10 my-auto space-y-6 w-full px-10">
                         <div class="canva-cert-el p-1 cursor-grab w-full">
                            <h2 contenteditable="true" class="font-moul text-2xl text-slate-700 outline-none mb-1">វិញ្ញាបនបត្រ</h2>
                            <h1 contenteditable="true" class="font-moul text-[40px] text-amber-600 outline-none">បញ្ជាក់ការសិក្សា</h1>
                         </div>
                         <div class="canva-cert-el p-1 cursor-grab w-full mt-6">
                            <div contenteditable="true" class="font-siemreap text-[18px] text-slate-800 max-w-4xl mx-auto leading-[2.4] text-center outline-none">
                               <p>វិញ្ញាបនបត្រនេះបញ្ជាក់ជូនថា៖</p>
                               <div class="font-moul text-4xl text-blue-900 my-4 border-b-2 border-dotted border-blue-900 pb-2 inline-block px-12">${genderTitle} ${student.name || 'សិស្ស'}</div>
                               <p class="mt-2">បានបញ្ចប់ការសិក្សាដោយជោគជ័យ កម្រិតថ្នាក់ <span class="font-moul text-red-600 text-xl mx-1">${grade}</span> ក្នុងឆ្នាំសិក្សា <span class="font-bold text-indigo-700 text-lg mx-1">${khmerAcademicYear}</span> ។</p>
                            </div>
                         </div>
                      </div>
                      <div class="w-full flex justify-end items-end px-16 relative z-10 pb-4 font-siemreap text-sm font-bold">
                         <div class="text-center canva-cert-el p-2 cursor-grab">
                            <p contenteditable="true" class="font-moul text-sm text-indigo-900 mt-8 outline-none">នាយកសាលា</p>
                            <div class="h-24 border-b border-dashed border-indigo-900 mt-2 min-w-[180px]"></div>
                         </div>
                      </div>
                   </div>
                `;
            }

            const bgHtml = isCustomFrame ? `<img src="${window.currentCertBg}" class="absolute inset-0 w-full h-full object-cover z-0 print:object-cover">` : '';

            allCertificatesHtml += `
                <div class="cert-preview-card w-[297mm] h-[210mm] bg-white shadow-2xl relative overflow-hidden flex-shrink-0 print:w-[297mm] print:h-[210mm] print:shadow-none print:break-after-page box-border mt-8 print:mt-0 ${isCustomFrame ? 'bg-transparent' : ''}">
                   ${bgHtml}
                   <div class="relative z-10 w-full h-full font-siemreap">
                      ${templateContent}
                   </div>
                </div>
            `;
        });

        container.innerHTML = allCertificatesHtml;

    } catch (err) {
        container.innerHTML = `<div class="text-rose-500 font-bold text-xl my-20 bg-rose-50 p-6 rounded-2xl border border-rose-200">⚠️ មានបញ្ហា! សូមពិនិត្យកុងសូល (Console)។</div>`;
        console.error("Cert Error:", err);
    }
};

// ---------------------------------------------------------
// ៤. Canva Engine - អូសទាញ និងផ្ទាំងបញ្ជា (Draggable & Design Toolbar)
// ---------------------------------------------------------

window.showCanvaToolbar = function(el, event) {
    const toolbar = document.getElementById('canvaToolbar');
    if(!toolbar) return;
    
    toolbar.classList.remove('hidden');
    
    const rect = el.getBoundingClientRect();
    let topPos = rect.top + window.scrollY - 55; // លើកឡើងបន្តិច
    if (topPos < 50) topPos = rect.bottom + window.scrollY + 10;
    
    toolbar.style.top = `${topPos}px`;
    toolbar.style.left = `${Math.max(20, rect.left + window.scrollX)}px`;
    
    // បង្ហាញ Font បច្ចុប្បន្ន
    const innerEl = el.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"]');
    if(innerEl) {
        const fontSelector = document.getElementById('canvaFontSelector');
        if(innerEl.classList.contains('font-moul')) fontSelector.value = 'font-moul';
        else if(innerEl.classList.contains('font-battambang')) fontSelector.value = 'font-battambang';
        else if(innerEl.classList.contains('font-kantumruy')) fontSelector.value = 'font-kantumruy';
        else fontSelector.value = 'font-siemreap';
    }
};

window.closeCanvaToolbar = function() {
    const toolbar = document.getElementById('canvaToolbar');
    if(toolbar) toolbar.classList.add('hidden');
    if(activeCertEl) {
        activeCertEl.classList.remove('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10');
    }
    activeCertEl = null;
};

// មុខងារដូរ Font
window.changeElementFont = function(fontClass) {
    if(!activeCertEl) return;
    const innerEl = activeCertEl.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"]');
    if(innerEl) {
        // លុប Font ចាស់ចេញ
        innerEl.classList.remove('font-moul', 'font-siemreap', 'font-battambang', 'font-kantumruy');
        // ដាក់ Font ថ្មី
        innerEl.classList.add(fontClass);
    }
};

window.changeElementColor = function(colorHex) {
    if(!activeCertEl) return;
    const innerEl = activeCertEl.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"]');
    if(innerEl) {
        innerEl.style.color = colorHex;
        innerEl.className = innerEl.className.replace(/text-[a-z]+-\d+/g, '');
    }
};

window.changeElementSize = function(step) {
    if(!activeCertEl) return;
    const innerEl = activeCertEl.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"], img');
    if(!innerEl) return;

    if (innerEl.tagName === 'IMG') {
        let currentWidth = parseInt(window.getComputedStyle(innerEl).width);
        innerEl.style.width = `${currentWidth + (step * 20)}px`;
        innerEl.className = innerEl.className.replace(/w-\d+|w-auto/g, ''); 
    } else {
        let currentSize = parseInt(window.getComputedStyle(innerEl).fontSize);
        innerEl.style.fontSize = `${currentSize + (step * 2)}px`;
        innerEl.className = innerEl.className.replace(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/g, '');
    }
};

window.toggleElementBold = function() {
    if(!activeCertEl) return;
    const innerEl = activeCertEl.querySelector('h1, h2, h3, h4, p, div[contenteditable="true"]');
    if(!innerEl) return;
    
    const isBold = window.getComputedStyle(innerEl).fontWeight >= 700;
    innerEl.style.fontWeight = isBold ? 'normal' : 'bold';
};

window.deleteActiveElement = function() {
    if(!activeCertEl) return;
    activeCertEl.remove();
    window.closeCanvaToolbar();
};

window.initCertCanvaEngine = function() {
    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('.canva-cert-el')) {
            isCertDragging = true;
            activeCertEl = e.target.closest('.canva-cert-el');
            
            let currentTransform = activeCertEl.style.transform;
            certInitialX = 0; certInitialY = 0;
            if (currentTransform && currentTransform.includes("translate")) {
                const match = currentTransform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
                if (match) { certInitialX = parseFloat(match[1]); certInitialY = parseFloat(match[2]); }
            }
            
            certStartX = e.clientX; certStartY = e.clientY;
            activeCertEl.style.cursor = 'grabbing';
            if (window.getComputedStyle(activeCertEl).display === 'inline') activeCertEl.style.display = 'inline-block';
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isCertDragging && activeCertEl) {
            e.preventDefault(); 
            const dx = e.clientX - certStartX;
            const dy = e.clientY - certStartY;
            activeCertEl.style.transform = `translate(${certInitialX + dx}px, ${certInitialY + dy}px)`;
            
            const toolbar = document.getElementById('canvaToolbar');
            if(toolbar) toolbar.classList.add('hidden');
        }
    });

    document.addEventListener('mouseup', function(e) {
        isCertDragging = false;
        if (activeCertEl) {
            activeCertEl.style.cursor = 'grab';
            window.showCanvaToolbar(activeCertEl, e);
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.closest('.canva-cert-el')) {
            let activeEl = e.target.closest('.canva-cert-el'); 
            activeCertEl = activeEl;
            window.showCanvaToolbar(activeEl, e);
            
            document.querySelectorAll('.canva-cert-el').forEach(el => el.classList.remove('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10'));
            activeEl.classList.add('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10');
            
        } else if (!e.target.closest('#canvaToolbar') && !e.target.closest('.no-close-canva')) {
            window.closeCanvaToolbar();
        }
    });
};

// ---------------------------------------------------------
// ៥. មុខងារ Print ប័ណ្ណសរសើរ
// ---------------------------------------------------------

window.printOfficialCertificates = function() {
    const printArea = document.getElementById("certificatePrintArea");
    if (!printArea) { alert("⚠️ រកមិនឃើញប័ណ្ណសរសើរទេ!"); return; }

    window.closeCanvaToolbar();
    document.querySelectorAll('.canva-cert-el').forEach(el => el.classList.remove('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10'));

    const clonedPrintArea = printArea.cloneNode(true);
    clonedPrintArea.className = "";
    clonedPrintArea.style.background = "white";
    
    const printContent = clonedPrintArea.outerHTML;

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>បោះពុម្ពប័ណ្ណសរសើរ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Kantumruy+Pro:wght@400;700&family=Moul&family=Siemreap&display=swap');
          
          @page { size: A4 landscape; margin: 0; }
          body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          .font-moul { font-family: 'Moul', serif !important; font-weight: normal !important; }
          .font-siemreap { font-family: 'Siemreap', sans-serif !important; }
          .font-battambang { font-family: 'Battambang', sans-serif !important; }
          .font-kantumruy { font-family: 'Kantumruy Pro', sans-serif !important; }
          
          .print\\:break-after-page { page-break-after: always; break-after: page; }
          .hover\\:ring-2, .hover\\:ring-dashed { border: none !important; box-shadow: none !important; }
        </style>
      </head>
      <body class="font-siemreap">
        ${printContent}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 1500); 
};