// ==========================================
// ឯកសារ js/certificates.js - ម៉ាស៊ីនផលិតប័ណ្ណសរសើរ (Interactive Canva-like Editor & Print)
// ==========================================

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

window.updateCertPeriodDropdown = function() {
  const type = document.getElementById("certPeriodType")?.value;
  const valSelect = document.getElementById("certPeriodValue");
  if (!valSelect) return;
  
  if (type === "monthly") {
    valSelect.innerHTML = `
      <option value="មករា" selected>ខែ មករា</option>
      <option value="កុម្ភៈ">ខែ កុម្ភៈ</option>
      <option value="មីនា">ខែ មីនា</option>
      <option value="មេសា">ខែ មេសា</option>
      <option value="ឧសភា">ខែ ឧសភា</option>
      <option value="មិថុនា">ខែ មិថុនា</option>
      <option value="កក្កដា">ខែ កក្កដា</option>
      <option value="សីហា">ខែ សីហា</option>
      <option value="កញ្ញា">ខែ កញ្ញា</option>
      <option value="តុលា">ខែ តុលា</option>
      <option value="វិច្ឆិកា">ខែ វិច្ឆិកា</option>
      <option value="ធ្នូ">ខែ ធ្នូ</option>
    `;
  } else if (type === "semester") {
    valSelect.innerHTML = `<option value="ឆមាសទី១" selected>ឆមាសទី១</option><option value="ឆមាសទី២">ឆមាសទី២</option>`;
  } else if (type === "annual") {
    valSelect.innerHTML = `<option value="ប្រចាំឆ្នាំ" selected>លទ្ធផលប្រចាំឆ្នាំ</option>`;
  }
  if (typeof generateCertificatePreview === "function") {
    generateCertificatePreview();
  }
}

window.changeCertFrame = function(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          window.currentCertBg = e.target.result;
          generateCertificatePreview();
      }
      reader.readAsDataURL(file);
  }
}

async function loadCertificatesView() {
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
    <div class="space-y-6 animate-fade-in pb-10 font-siemreap text-slate-800 max-w-[1600px] mx-auto">
      
      <!-- Top Control Panel -->
      <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] flex flex-col xl:flex-row justify-between xl:items-center gap-6 no-print relative overflow-hidden transition-all hover:shadow-md">
        <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="relative z-10 flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-amber-100"><i class="fa-solid fa-award"></i></div>
          <div>
            <h2 class="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3 font-moul mb-1">
              ម៉ាស៊ីនផលិតប័ណ្ណសរសើរ
            </h2>
            <div class="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-[11px] font-bold border border-pink-200 animate-pulse inline-block shadow-sm">
              <i class="fa-solid fa-hand-pointer"></i> អាចចុច កែអក្សរ និងអូសរំកិលបានលើប័ណ្ណផ្ទាល់
            </div>
          </div>
        </div>
        
        <div class="flex flex-wrap items-center justify-end gap-3 relative z-10 w-full xl:w-auto">
          
          <div class="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 shadow-sm hover:border-slate-200 transition">
            <i class="fa-solid fa-layer-group text-slate-400 text-[11px]"></i>
            <select id="certLevelSelect" onchange="generateCertificatePreview()" class="border-none bg-transparent text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer p-1">
              ${gradesOptions}
            </select>
            <span class="text-slate-300">|</span>
            <select id="certRoomSelect" onchange="generateCertificatePreview()" class="border-none bg-transparent text-xs font-bold text-amber-700 focus:ring-0 outline-none cursor-pointer p-1">
              <option value="«ក»">«ក»</option> <option value="«ខ»" selected>«ខ»</option> <option value="«គ»">«គ»</option> <option value="«ឃ»">«ឃ»</option>
            </select>
          </div>

          <div class="flex items-center gap-2 bg-amber-50 border-2 border-amber-100 rounded-xl px-3 py-2 shadow-sm hover:border-amber-200 transition">
            <i class="fa-solid fa-calendar-days text-amber-500 text-[11px]"></i>
            <select id="certPeriodType" onchange="updateCertPeriodDropdown()" class="border-none bg-transparent text-xs font-bold text-amber-900 focus:ring-0 outline-none cursor-pointer p-1">
              <option value="monthly" selected>ប្រចាំខែ</option>
              <option value="semester">ប្រចាំឆមាស</option>
              <option value="annual">ប្រចាំឆ្នាំ</option>
            </select>
            <span class="text-amber-300">|</span>
            <select id="certPeriodValue" onchange="generateCertificatePreview()" class="border-none bg-transparent text-xs font-bold text-indigo-700 focus:ring-0 outline-none cursor-pointer p-1"></select>
          </div>

          <div class="flex items-center gap-2 bg-blue-50 border-2 border-blue-100 rounded-xl px-3 py-2 shadow-sm hover:border-blue-200 transition">
            <i class="fa-solid fa-calendar text-blue-500 text-[11px]"></i>
            <input type="date" id="certIssueDate" value="${today}" onchange="generateCertificatePreview()" class="border-none bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer">
          </div>

          <div class="flex items-center gap-2 bg-purple-50 border-2 border-purple-100 rounded-xl px-3 py-2 shadow-sm hover:border-purple-200 transition">
            <i class="fa-solid fa-palette text-purple-500 text-xs"></i>
            <select id="certTemplateSelect" onchange="generateCertificatePreview()" class="text-xs font-bold text-purple-900 bg-transparent outline-none cursor-pointer">
              <option value="1">គំរូទី ១ (ទូទៅ - ស៊ុមមាស)</option>
              <option value="2" selected>គំរូទី ២ (ផ្លូវការ - ក្រសួង)</option>
              <option value="3">គំរូទី ៣ (ទំនើប - Vintage)</option>
              <option value="4">គំរូទី ៤ (វិញ្ញាបនបត្រ)</option>
            </select>
          </div>

          <div class="flex items-center gap-2 border-l border-slate-200 pl-3 ml-1">
            <label class="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer mb-0 shadow-sm transform hover:-translate-y-0.5">
              <i class="fa-solid fa-image"></i> បញ្ចូលស៊ុម Custom
              <input type="file" accept="image/*" class="hidden" onchange="window.changeCertFrame(event)">
            </label>
            <button type="button" onclick="generateCertificatePreview()" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 transform hover:-translate-y-0.5">
              <i class="fa-solid fa-wand-magic-sparkles"></i> បង្កើត
            </button>
            <button type="button" onclick="printOfficialCertificates()" class="px-5 py-2.5 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 transform hover:-translate-y-0.5">
              <i class="fa-solid fa-print"></i> Print ទាំង ៥
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Area -->
      <div class="bg-slate-200/80 p-6 md:p-8 rounded-[2rem] border border-slate-300 shadow-inner flex flex-col items-center gap-8 overflow-y-auto max-h-[85vh] print:max-h-none print:p-0 print:bg-white print:border-none print:shadow-none min-h-[600px]" id="certificatePrintArea">
         <div class="text-center text-slate-500 font-bold mt-32 flex flex-col items-center">
            <div class="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-5xl text-slate-300 mb-4 shadow-sm border border-slate-200"><i class="fa-solid fa-award"></i></div>
            <p class="text-lg">សូមជ្រើសរើសថ្នាក់ និងចុច "បង្កើត" ដើម្បីបង្ហាញប័ណ្ណសរសើរសិស្ស Top 5</p>
         </div>
      </div>
    </div>
  `;
  updateCertPeriodDropdown();
  initCertCanvaEngine(); // Initialize Drag & Drop for certificates
}

function formatKhmerDate(dateString) {
  if (!dateString) return '...';
  let day, month, year;
  if (dateString.includes('/')) { [day, month, year] = dateString.split('/'); } 
  else if (dateString.includes('-')) { [year, month, day] = dateString.split('-'); } 
  else { return dateString; }
  
  const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
  
  let monthIndex = parseInt(month, 10) - 1;
  let monthName = khmerMonths[monthIndex] || month;
  
  return `${toKhmerNum(day)} ខែ${monthName} ឆ្នាំ${toKhmerNum(year)}`;
}

function formatKhmerIssueDate(dateString) {
  if (!dateString) return "........., ថ្ងៃទី........ខែ........ឆ្នាំ ២០២...";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  
  const d = toKhmerNum(parts[2]);
  const y = toKhmerNum(parts[0]);
  const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
  let mName = khmerMonths[parseInt(parts[1], 10) - 1] || parts[1];
  
  return `ថ្ងៃទី ${d} ខែ ${mName} ឆ្នាំ ${y}`;
}

async function generateCertificatePreview() {
  const level = document.getElementById("certLevelSelect").value;
  const room = document.getElementById("certRoomSelect").value;
  const periodType = document.getElementById("certPeriodType").value;
  const periodVal = document.getElementById("certPeriodValue").value;
  const templateId = document.getElementById("certTemplateSelect").value;
  const rawIssueDate = document.getElementById("certIssueDate")?.value || "";
  const grade = level ? `${level} ${room}` : "";

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
  const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
  const principalName = sInfo.principal_name || "នាយកសាលា";
  const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
  
  const khmerAcademicYear = toKhmerNum(academic_year);
  const formattedIssueDateText = formatKhmerIssueDate(rawIssueDate);

  const container = document.getElementById("certificatePrintArea");
  container.innerHTML = `
    <div class="w-full h-full flex flex-col items-center justify-center text-amber-500 font-bold mt-20">
        <i class="fa-solid fa-circle-notch animate-spin text-5xl mb-4"></i>
        <span class="text-lg animate-pulse tracking-wide">កំពុងស្វែងរកទិន្នន័យ និងរៀបចំទម្រង់ប័ណ្ណ...</span>
    </div>
  `;

  try {
    // ១. ទាញយកបញ្ជីសិស្ស
    let students = [];
    if (typeof apiGet === "function") {
      try { const stRes = await apiGet("getStudents", { status: "Active" }); students = stRes.data || []; } catch(e) {}
    }
    if (students.length === 0) students = JSON.parse(localStorage.getItem('academic_students')) || [];

    // ចម្រាញ់សិស្សតាមថ្នាក់រៀនដោយកាត់ការដកឃ្លាចោល (Smart Logic)
    let cleanLevel = level.replace(/\s+/g, '');
    let cleanRoom = room.replace(/[«»\s]/g, '');

    students = students.filter(s => {
        if (s.status === "Dropped") return false;
        let sGrade = String(s.grade || "").replace(/\s+/g, '');
        let sRoom = String(s.room || "").replace(/[«»\s]/g, '');
        let fullGradeDB = String(s.grade || "").replace(/\s+/g, ''); 
        let expectedFull = cleanLevel + cleanRoom;
        return (sGrade === cleanLevel && sRoom === cleanRoom) || (fullGradeDB === expectedFull) || (fullGradeDB.includes(cleanLevel) && fullGradeDB.includes(cleanRoom));
    });

    if (students.length === 0) {
      container.innerHTML = `
        <div class="bg-rose-50 border border-rose-200 text-rose-600 p-8 rounded-3xl font-bold text-lg my-20 flex flex-col items-center shadow-sm">
            <i class="fa-solid fa-folder-open text-5xl mb-4 text-rose-300"></i>
            ❌ រកមិនឃើញទិន្នន័យសិស្សក្នុងថ្នាក់ [${grade}] ទេ។ សូមពិនិត្យបញ្ជីសិស្សឡើងវិញ!
        </div>
      `;
      return;
    }

    // ២. ទាញយកបញ្ជីពិន្ទុ
    let top5Students = [];
    let allScores = [];
    if (typeof apiGet === "function") {
      try { const scRes = await apiGet("getScores"); allScores = scRes.data || []; } catch(e) {}
    }
    if (allScores.length === 0) allScores = JSON.parse(localStorage.getItem('academic_scores')) || [];

    // ចម្រាញ់ពិន្ទុតាមថ្នាក់ និងខែ
    let periodScores = allScores.filter(s => {
        let scGrade = String(s.grade || "").replace(/\s+/g, '').replace(/[«»]/g, '');
        let isSameGrade = scGrade === (cleanLevel + cleanRoom);
        let isSameType = s.period_type === periodType;
        let isSameMonth = periodType === "annual" ? true : s.month === periodVal;
        return isSameGrade && isSameType && isSameMonth;
    });

    let processedData = students.map(stu => {
      const sc = periodScores.find(s => String(s.student_id) === String(stu.id)) || {};
      let avg = parseFloat(sc.average || sc.sem_avg || sc.annual_avg) || 0;
      return { ...stu, avg: avg };
    });

    // រៀបចំណាត់ថ្នាក់
    processedData = processedData.filter(s => s.avg > 0);
    processedData.sort((a, b) => b.avg - a.avg);
    let currentRank = 1, actualPosition = 1, previousAvg = null;
    processedData.forEach(item => {
      if (previousAvg !== null && item.avg < previousAvg) currentRank = actualPosition;
      item.rank = currentRank;
      previousAvg = item.avg;
      actualPosition++;
    });
    
    top5Students = processedData.filter(s => s.rank >= 1 && s.rank <= 5);

    if (top5Students.length === 0) {
      container.innerHTML = `
        <div class="bg-amber-50 border border-amber-200 text-amber-700 p-8 rounded-3xl font-bold text-lg my-20 flex flex-col items-center shadow-sm">
            <i class="fa-solid fa-triangle-exclamation text-5xl mb-4 text-amber-300"></i>
            ⚠️ សិស្សក្នុងថ្នាក់នេះមិនទាន់មានពិន្ទុសម្រាប់បោះពុម្ពប័ណ្ណសរសើរនៅឡើយទេ!
        </div>
      `;
      return;
    }

    let periodText = periodType === "annual" ? "ប្រចាំឆ្នាំ" : periodVal;
    let allCertificatesHtml = "";

    // ឆែកមើលថាតើមានការបញ្ជូលស៊ុម (Custom Frame) ថ្មីឬទេ
    const isCustomFrame = !!window.currentCertBg;

    top5Students.forEach((student) => {
      let rankText = `លេខ ${toKhmerNum(student.rank.toString())}`;
      let formattedDOB = formatKhmerDate(student.dob); 
      let genderTitle = student.gender === "ស្រី" ? "យុវតី" : "យុវជន";
      let templateContent = "";

      const photoSrc = student.photo_url || "https://placehold.co/120x160/f8fafc/94a3b8?text=Photo";

      // ==========================================
      // គំរូទី ១ (ទូទៅ - ស៊ុមមាស ច្រឡឹងស្រស់ស្អាត)
      // ==========================================
      if (templateId === "1") {
        const wrapperClass = isCustomFrame 
            ? "h-full w-full p-10 flex flex-col justify-between items-center text-center relative z-10" 
            : "border-[8px] border-double border-amber-500 h-full w-full p-10 flex flex-col justify-between items-center text-center bg-white rounded-2xl relative shadow-inner z-10";

        templateContent = `
           <div class="${wrapperClass}">
              <div class="w-full relative z-10">
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab">
                    <h1 contenteditable="true" spellcheck="false" class="font-moul text-2xl text-slate-800 tracking-wider outline-none">ព្រះរាជាណាចក្រកម្ពុជា</h1>
                 </div>
                 <br>
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab">
                    <h2 contenteditable="true" spellcheck="false" class="font-moul text-lg text-slate-700 mt-1 outline-none">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
                 </div>
                 <div class="w-24 border-b-2 border-amber-500 mx-auto mt-2 pointer-events-none ${isCustomFrame ? 'hidden' : ''}"></div>
              </div>
              
              <div class="my-auto space-y-5 w-full px-8 relative z-10">
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full">
                    <h1 contenteditable="true" spellcheck="false" class="font-moul text-5xl text-amber-600 drop-shadow-sm outline-none tracking-widest">ប័ណ្ណសរសើរ</h1>
                 </div>
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full">
                    <p contenteditable="true" spellcheck="false" class="font-siemreap text-lg text-slate-700 outline-none">ប្រគល់ជូនដោយសេចក្តីសោមនស្សរីករាយជូនចំពោះ</p>
                 </div>
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full">
                    <div contenteditable="true" spellcheck="false" class="font-moul text-4xl text-blue-900 tracking-wide outline-none py-2">${genderTitle} ${student.name}</div>
                 </div>
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full mt-2">
                    <p contenteditable="true" spellcheck="false" class="font-siemreap text-[17px] text-slate-800 max-w-3xl mx-auto leading-loose outline-none">
                       ជាសិស្សរៀនថ្នាក់ទី <span class="font-bold text-rose-600 text-[19px] mx-1">${grade}</span> ដែលបានខិតខំប្រឹងប្រែងរៀនសូត្រ និងគោរពវិន័យបានល្អប្រសើរ 
                       រហូតទទួលបានចំណាត់ថ្នាក់ <span class="font-bold text-amber-600 text-2xl mx-1 bg-amber-50 px-3 py-1 rounded border border-amber-200">${rankText}</span> ប្រចាំ <span class="font-bold text-indigo-600">${periodText}</span> ។
                    </p>
                 </div>
              </div>

              <div class="w-full flex justify-between items-end px-12 font-siemreap text-sm font-bold pb-4 relative z-10">
                 <div class="canva-cert-el cursor-grab p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded">
                    <div contenteditable="true" spellcheck="false" class="text-left text-slate-500 font-mono text-xs outline-none">អត្តលេខ៖ ${toKhmerNum(student.id)}</div>
                 </div>
                 <div class="text-center canva-cert-el cursor-grab p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded">
                    <p contenteditable="true" spellcheck="false" class="mb-2 text-[13px] outline-none text-slate-700">ធ្វើនៅ....................., ${formattedIssueDateText}</p>
                    <p contenteditable="true" spellcheck="false" class="font-moul mt-6 text-xl text-slate-800 outline-none">នាយកសាលា</p>
                    <div class="h-20 border-b border-dashed border-slate-400 mt-2 min-w-[150px]"></div>
                 </div>
              </div>
           </div>
        `;
      } 
      // ==========================================
      // គំរូទី ២ (ផ្លូវការ - ក្រសួងអប់រំ សមល្មមស្រស់ស្អាត)
      // ==========================================
      else if (templateId === "2") {
        const wrapperClass = isCustomFrame
            ? "h-full w-full p-10 flex flex-col justify-between relative z-10"
            : "border-[5px] border-solid border-slate-800 h-full w-full p-10 flex flex-col justify-between relative bg-white rounded-xl shadow-sm z-10";

        templateContent = `
           <div class="${wrapperClass}">
              ${isCustomFrame ? '' : '<div class="absolute inset-2 border-[1.5px] border-slate-800 pointer-events-none"></div>'}
              
              <div class="flex justify-between items-start text-sm font-moul relative z-10">
                 <div class="text-center leading-[1.8] canva-cert-el cursor-grab p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded">
                    <p contenteditable="true" spellcheck="false" class="text-blue-800 text-[15px] outline-none">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                    <p contenteditable="true" spellcheck="false" class="text-blue-900 mt-1 text-[16px] outline-none">${school_name}</p>
                 </div>
                 <div class="text-center leading-[1.8] canva-cert-el cursor-grab p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded">
                    <p contenteditable="true" spellcheck="false" class="text-blue-800 text-[15px] outline-none">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p contenteditable="true" spellcheck="false" class="text-blue-900 mt-1 text-[16px] outline-none">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div class="font-siemreap tracking-[4px] mt-1 text-[11px] font-bold text-blue-900 pointer-events-none ${isCustomFrame ? 'hidden' : ''}">𑁋𑁋𑁋𑁋𑁋</div>
                 </div>
              </div>

              <div class="text-center my-auto flex flex-col items-center w-full relative z-10">
                 <div class="canva-cert-el cursor-grab p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded w-full">
                    <h1 contenteditable="true" spellcheck="false" class="font-moul text-6xl text-red-600 tracking-widest outline-none mb-6" style="-webkit-text-stroke: 1px darkred;">ប័ណ្ណសរសើរ</h1>
                 </div>
                 
                 <div class="canva-cert-el cursor-grab p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded w-full mt-4">
                    <div contenteditable="true" spellcheck="false" class="font-siemreap text-[18px] text-slate-800 leading-[2.4] text-justify max-w-[900px] mx-auto px-8 outline-none">
                       <span class="ml-16"></span>នាយកសាលាបឋមសិក្សា <span class="font-moul text-blue-900">${school_name}</span> សូមសរសើរចំពោះសិស្សឈ្មោះ <span class="font-moul text-blue-800 text-2xl mx-2 border-b border-dotted border-blue-400 pb-0.5">${student.name}</span> 
                       ភេទ <span class="font-bold text-blue-900">${student.gender || '-'}</span> កើតថ្ងៃទី <span class="font-bold text-blue-900">${formattedDOB}</span> 
                       រៀនថ្នាក់ទី <span class="font-bold text-red-600 text-xl mx-2">${grade}</span> 
                       ដែលទទួលបានលទ្ធផលសិក្សាល្អ និងទទួលបានចំណាត់ថ្នាក់ <span class="font-bold text-red-600 text-3xl mx-2">${rankText}</span> 
                       ប្រចាំ <span class="font-bold text-blue-900">${periodText}</span> ឆ្នាំសិក្សា <span class="font-bold text-red-600">${khmerAcademicYear}</span> ។
                    </div>
                 </div>
              </div>

              <div class="flex justify-end pr-16 font-siemreap relative z-10 pb-6">
                 <div class="text-center text-sm font-bold canva-cert-el cursor-grab p-3 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded">
                    <p contenteditable="true" spellcheck="false" class="mb-2 outline-none text-slate-700">ធ្វើនៅ...................., ${formattedIssueDateText}</p>
                    <p contenteditable="true" spellcheck="false" class="font-moul mt-6 text-lg text-blue-900 outline-none">នាយកសាលា</p>
                    <div class="h-24 border-b border-dashed border-blue-900 mt-2 min-w-[180px]"></div>
                 </div>
              </div>
           </div>
        `;
      }
      // ==========================================
      // គំរូទី ៣ (ទំនើប - Vintage Style)
      // ==========================================
      else if (templateId === "3") {
        const wrapperClass = isCustomFrame
            ? "h-full w-full p-10 flex flex-col justify-between items-center text-center relative overflow-hidden z-10"
            : "border-[10px] border-double border-yellow-600 h-full w-full p-10 flex flex-col justify-between items-center text-center bg-[#fdfbf6] rounded-[2rem] relative shadow-inner overflow-hidden z-10";

        templateContent = `
           <div class="${wrapperClass}">
              ${isCustomFrame ? '' : '<div class="absolute inset-3 border border-yellow-400 rounded-xl pointer-events-none"></div>'}
              
              <div class="w-full flex justify-between items-start relative z-10">
                 <div class="text-left font-moul text-indigo-900 text-xs opacity-70 canva-cert-el p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab">
                    <p contenteditable="true" spellcheck="false" class="outline-none">${school_name}</p>
                 </div>
                 <div class="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-md ${isCustomFrame ? 'hidden' : ''}">
                    <i class="fa-solid fa-award text-4xl text-amber-500 drop-shadow-sm"></i>
                 </div>
                 <div class="w-32"></div> <!-- Spacer -->
              </div>
              
              <div class="space-y-6 w-full my-auto relative z-10">
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full">
                    <h3 contenteditable="true" spellcheck="false" class="font-moul text-5xl text-amber-700 tracking-[0.2em] outline-none drop-shadow-sm">វិញ្ញាបនបត្រសរសើរ</h3>
                 </div>
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full">
                    <p contenteditable="true" spellcheck="false" class="font-siemreap text-base text-slate-600 tracking-wider outline-none">ប្រគល់ជូនសិស្សានុសិស្សឈ្មោះ</p>
                 </div>
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full">
                    <h4 contenteditable="true" spellcheck="false" class="font-moul text-5xl text-indigo-900 py-3 border-b-[3px] border-indigo-200 inline-block px-12 outline-none">${student.name}</h4>
                 </div>
                 <div class="canva-cert-el inline-block p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full mt-4">
                    <p contenteditable="true" spellcheck="false" class="font-siemreap text-[18px] text-slate-700 max-w-4xl mx-auto leading-[2.2] outline-none">
                       ជាសិស្សថ្នាក់ទី <span class="font-bold text-slate-900 text-xl px-1">${grade}</span> ដែលបានខិតខំប្រឹងប្រែងរៀនសូត្រ រហូតទទួលបានចំណាត់ថ្នាក់ <span class="font-bold text-amber-700 text-2xl mx-1 bg-amber-50 px-3 py-0.5 rounded-lg border border-amber-200 shadow-sm">${rankText}</span> 
                       ប្រចាំ <span class="font-bold text-slate-900">${periodText}</span> ឆ្នាំសិក្សា <span class="font-bold text-indigo-800">${khmerAcademicYear}</span> ។
                    </p>
                 </div>
              </div>

              <div class="w-full flex justify-between items-end px-16 font-siemreap text-sm font-bold pb-6 relative z-10">
                 <div class="canva-cert-el cursor-grab p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded">
                    <div contenteditable="true" spellcheck="false" class="text-left text-slate-400 font-mono outline-none">អត្តលេខ៖ ${toKhmerNum(student.id)}</div>
                 </div>
                 <div class="text-center canva-cert-el cursor-grab p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded">
                     <p contenteditable="true" spellcheck="false" class="mb-2 text-slate-600 outline-none">${formattedIssueDateText}</p>
                     <p contenteditable="true" spellcheck="false" class="font-moul mt-6 text-xl text-indigo-900 outline-none">នាយកសាលា</p>
                     <div class="h-20 border-b border-dashed border-indigo-900 mt-2 min-w-[180px]"></div>
                 </div>
              </div>
           </div>
        `;
      }
      // ==========================================
      // គំរូទី ៤ (វិញ្ញាបនបត្របញ្ចប់ការសិក្សា - Certificate of Completion)
      // ==========================================
      else if (templateId === "4") {
        const wrapperClass = isCustomFrame
            ? "h-full w-full p-10 flex flex-col justify-between items-center text-center relative z-10"
            : "border-[12px] border-solid border-indigo-900 h-full w-full p-10 flex flex-col justify-between items-center text-center bg-white rounded-xl relative shadow-xl z-10";

        templateContent = `
           <div class="${wrapperClass}">
              ${isCustomFrame ? '' : '<div class="absolute inset-3 border-[2px] border-amber-500 pointer-events-none rounded-lg opacity-60"></div>'}
              
              <div class="w-full flex justify-between items-center relative z-10 px-6 text-xs font-moul text-indigo-900">
                 <div class="text-left leading-relaxed canva-cert-el p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab">
                    <p contenteditable="true" spellcheck="false" class="outline-none text-[13px]">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                 </div>
                 <div class="text-center leading-[1.6] canva-cert-el p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab">
                    <p contenteditable="true" spellcheck="false" class="text-[14px] text-blue-900 outline-none">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p contenteditable="true" spellcheck="false" class="text-[13px] text-blue-900 mt-0.5 outline-none">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div class="w-16 border-b-[2px] border-black mx-auto mt-1 pointer-events-none ${isCustomFrame ? 'hidden' : ''}"></div>
                 </div>
              </div>

              <div class="relative z-10 my-auto space-y-6 w-full px-10">
                 <div class="canva-cert-el p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full">
                    <h2 contenteditable="true" spellcheck="false" class="font-moul text-2xl text-slate-700 outline-none mb-1">វិញ្ញាបនបត្រ</h2>
                    <h1 contenteditable="true" spellcheck="false" class="font-moul text-[40px] text-amber-600 tracking-wider outline-none drop-shadow-sm">បញ្ជាក់ការសិក្សា</h1>
                 </div>
                 <div class="canva-cert-el p-1 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab w-full mt-6">
                    <div contenteditable="true" spellcheck="false" class="font-siemreap text-[18px] text-slate-800 max-w-4xl mx-auto leading-[2.4] text-center outline-none">
                       <p>វិញ្ញាបនបត្រនេះបញ្ជាក់ជូនថា៖</p>
                       <div class="font-moul text-4xl text-blue-900 my-4 border-b-2 border-dotted border-blue-900 pb-2 inline-block px-12">${genderTitle} ${student.name}</div>
                       <p class="mt-2">
                          កើតថ្ងៃទី <span class="font-bold border-b border-slate-400 pb-0.5">${formattedDOB}</span> បានបញ្ចប់ការសិក្សាដោយជោគជ័យ<br>
                          កម្រិតថ្នាក់ <span class="font-moul text-red-600 text-xl mx-1">${grade}</span> នៃសាលាបឋមសិក្សា <span class="font-moul text-indigo-900 mx-1">${school_name}</span> ក្នុងឆ្នាំសិក្សា <span class="font-bold text-indigo-700 text-lg mx-1">${khmerAcademicYear}</span> ។
                       </p>
                    </div>
                 </div>
              </div>

              <div class="w-full flex justify-between items-end px-16 relative z-10 pb-4 font-siemreap text-sm font-bold">
                 <div class="text-center canva-cert-el p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab">
                    <p contenteditable="true" spellcheck="false" class="text-xs text-slate-600 mb-2 outline-none">បានឃើញ និងឯកភាព</p>
                    <p contenteditable="true" spellcheck="false" class="font-moul text-[14px] text-slate-800 mt-8 outline-none">ប្រធានការិយាល័យអប់រំ យុវជន និងកីឡា</p>
                    <div class="h-24 border-b border-dashed border-slate-800 mt-2 min-w-[180px]"></div>
                 </div>
                 <div class="text-center canva-cert-el p-2 hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded cursor-grab">
                    <p contenteditable="true" spellcheck="false" class="text-xs text-slate-600 mb-2 outline-none">${formattedIssueDateText}</p>
                    <p contenteditable="true" spellcheck="false" class="font-moul text-sm text-indigo-900 mt-8 outline-none">នាយកសាលា</p>
                    <div class="h-24 border-b border-dashed border-indigo-900 mt-2 min-w-[180px]"></div>
                 </div>
              </div>
           </div>
        `;
      }

      const bgHtml = isCustomFrame ? `<img src="${window.currentCertBg}" class="absolute inset-0 w-full h-full object-cover z-0 print:object-cover">` : '';

      allCertificatesHtml += `
        <div class="w-[297mm] h-[210mm] bg-white shadow-2xl relative overflow-hidden flex-shrink-0 print:w-[297mm] print:h-[210mm] print:shadow-none print:break-after-page box-border p-[10mm] mt-8 print:mt-0 ${isCustomFrame ? 'bg-transparent' : ''}">
           ${bgHtml}
           <div class="relative z-10 w-full h-full font-siemreap">
              ${templateContent}
           </div>
        </div>
      `;
    });

    container.innerHTML = allCertificatesHtml;

  } catch (err) {
    container.innerHTML = `<div class="text-rose-500 font-bold text-xl my-20 bg-rose-50 p-6 rounded-2xl border border-rose-200 shadow-sm">⚠️ មានបញ្ហាក្នុងការទាញយកទិន្នន័យសិស្ស! សូមព្យាយាមម្តងទៀត។</div>`;
  }
}

// =========================================================================
// មុខងារ Print ប័ណ្ណសរសើរ A4 Landscape
// =========================================================================
window.printOfficialCertificates = function() {
  const printArea = document.getElementById("certificatePrintArea");
  if (!printArea) {
      alert("⚠️ រកមិនឃើញប័ណ្ណសរសើរទេ!");
      return;
  }

  window.closeCanvaToolbar();

  const clonedPrintArea = printArea.cloneNode(true);
  
  // ដកស្រមោល និង Flex/Overflow ទាំងអស់ចេញ ដើម្បីអោយ Print ចេញមកពេញក្រដាស
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
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        
        /* កំណត់ទំហំក្រដាស A4 ផ្តេក (Landscape) គ្មាន Margin */
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        
        .font-moul { font-family: 'Moul', serif !important; font-weight: normal !important; }
        .font-siemreap { font-family: 'Siemreap', sans-serif !important; }
        
        .print\\:break-after-page { page-break-after: always; break-after: page; }
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

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 1000);
}

// មុខងារជំនួយសម្រាប់អូសទាញក្នុង Canva Engine (ត្រូវហៅប្រើក្នុង window ដើម្បីងាយស្រួល)
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
      }
  });

  document.addEventListener('mouseup', function() {
      isCertDragging = false;
      if (activeCertEl) activeCertEl.style.cursor = 'grab';
  });

  document.addEventListener('click', function(e) {
      if (e.target.closest('.canva-cert-el')) {
          activeEl = e.target.closest('.canva-cert-el'); 
          window.showCanvaToolbar(activeEl, e);
          document.querySelectorAll('.canva-cert-el').forEach(el => el.classList.remove('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10'));
          activeEl.classList.add('ring-[3px]', 'ring-dashed', 'ring-indigo-500', 'bg-indigo-50/10');
      }
  });
};