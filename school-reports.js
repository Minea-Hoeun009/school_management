// ==========================================
// ឯកសារ js/school-reports.js - របាយការណ៍ និងលិខិតបទដ្ឋាន (Full View Edition)
// ==========================================

console.log("✅ School Reports Full View script loaded!");

window.currentReportTab = 'adminReports';

window.officialDocuments = [
  { id: "DOC-001", type: "ច្បាប់", title: "ច្បាប់ស្តីពីការអប់រំ ឆ្នាំ២០០៧", date: "០៨-ធ្នូ-២០០៧", status: "ជាធរមាន", icon: "fa-scale-balanced" },
  { id: "DOC-002", type: "ប្រកាស", title: "ប្រកាសស្តីពីបទបញ្ជាផ្ទៃក្នុងសម្រាប់គ្រឹះស្ថានបឋមសិក្សាសាធារណៈ", date: "១៥-សីហា-២០១៨", status: "ជាធរមាន", icon: "fa-file-signature" },
  { id: "DOC-003", type: "សេចក្តីណែនាំ", title: "សេចក្តីណែនាំស្តីពីការវាយតម្លៃលទ្ធផលសិក្សារបស់សិស្ស", date: "២០-កញ្ញា-២០២១", status: "ជាធរមាន", icon: "fa-clipboard-list" },
  { id: "DOC-004", type: "សេចក្តីណែនាំ", title: "គោលការណ៍ប្រតិបត្តិស្តីពីការរៀបចំ និងកិច្ចតែងការបង្រៀន", date: "០៥-តុលា-២០២២", status: "ជាធរមាន", icon: "fa-person-chalkboard" },
  { id: "DOC-005", type: "សារាចរ", title: "សារាចរណែនាំស្តីពីការអនុវត្តកម្មវិធីសិក្សាលម្អិត", date: "១២-មករា-២០២៣", status: "ជាធរមាន", icon: "fa-book-open" }
];

window.teacherProgress = [
  { name: "ចាន់ សុវណ្ណ", role: "គ្រូថ្នាក់ទី ៦ «ក»", attendance: "១០០%", lessonPlan: "បានដាក់ពេញលេញ (១០០%)", evaluation: "ល្អប្រសើរ", statusColor: "emerald" },
  { name: "មាស កល្យាណ", role: "គ្រូថ្នាក់ទី ៥ «ខ»", attendance: "៩៥%", lessonPlan: "ខ្វះ ១ សប្តាហ៍ (៨០%)", evaluation: "ល្អបង្គួរ", statusColor: "amber" },
  { name: "រិទ្ធី ពិសិដ្ឋ", role: "គ្រូអប់រំកាយ", attendance: "៨០%", lessonPlan: "មិនទាន់បានដាក់ (០%)", evaluation: "ត្រូវកែលម្អ", statusColor: "rose" }
];

window.AdminReportController = {
  currentType: 'monthly',
  init() { this.renderReportContent(this.currentType); },
  switchTab(type) {
    this.currentType = type;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active-tab', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
      btn.classList.add('text-slate-600', 'bg-slate-50', 'border-slate-200');
    });
    const activeBtn = document.getElementById(`tab-${type}`);
    if (activeBtn) {
      activeBtn.classList.add('active-tab', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
      activeBtn.classList.remove('text-slate-600', 'bg-slate-50', 'border-slate-200');
    }
    this.renderReportContent(type);
  },
  renderReportContent(type) {
    const titleEl = document.getElementById('reportTitle');
    const subtitleEl = document.getElementById('reportSubtitle');
    const contentEl = document.getElementById('reportContent');
    const teacherName = document.getElementById('navUserName') ? document.getElementById('navUserName').innerText : 'គ្រូបង្រៀន / នាយកសាលា';
    const sigNameEl = document.getElementById('teacherSignatureName');
    if (sigNameEl) sigNameEl.innerText = teacherName;

    let html = '';
    if (type === 'monthly') {
      if(titleEl) titleEl.innerText = 'របាយការណ៍ប្រចាំខែ';
      if(subtitleEl) subtitleEl.innerText = 'ខែ តុលា ឆ្នាំសិក្សា ២០២៦-២០២៧';
      html = `
        <p class="indent-8 text-justify font-siemreap leading-relaxed">
          សូមគោរពជូន លោក/លោកស្រីនាយកសាលា ជាទីគោរព។ ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ <strong contenteditable="true" class="outline-none hover:bg-slate-50 text-indigo-700 px-1 rounded">${teacherName}</strong> ជាគ្រូបន្ទុកថ្នាក់ សូមរាយការណ៍សង្ខេបអំពីលទ្ធផលនៃការគ្រប់គ្រងថ្នាក់ និងការអនុវត្តការបង្រៀនប្រចាំខែ ដូចខាងក្រោម៖
        </p>
        <h4 class="font-bold font-moul mt-4 mb-2 text-[13px]">១. ស្ថិតិសិស្ស និងវត្តមាន៖</h4>
        <ul class="list-disc ml-12 space-y-1 font-siemreap">
          <li>សិស្សសរុបមានចំនួន ៤៥ នាក់ (ស្រី ២០ នាក់)។</li>
          <li>សិស្សអវត្តមានសរុប ៨ ដង (មានច្បាប់ ៥ ឥតច្បាប់ ៣)។</li>
        </ul>
        <h4 class="font-bold font-moul mt-4 mb-2 text-[13px]">២. លទ្ធផលសិក្សា៖</h4>
        <p class="indent-8 font-siemreap leading-relaxed">ផ្អែកតាមការវាយតម្លៃប្រចាំខែ សិស្សភាគច្រើនទទួលបានលទ្ធផលល្អប្រសើរ។ សិស្សទទួលបាននិទ្ទេស A មានចំនួន ១៥នាក់, B ចំនួន ១៨នាក់, C ចំនួន ១០នាក់ និង D ចំនួន ២នាក់។</p>
        <h4 class="font-bold font-moul mt-4 mb-2 text-[13px]">៣. ការអនុវត្តផែនការបង្រៀន (កិច្ចតែងការ)៖</h4>
        <table class="w-full border-collapse border border-slate-800 text-center mt-3 font-siemreap text-sm">
          <thead class="bg-slate-100 font-bold">
            <tr>
              <th class="border border-slate-800 p-2 w-[35%]">មុខវិជ្ជា</th>
              <th class="border border-slate-800 p-2">ផែនការអនុវត្ត</th>
              <th class="border border-slate-800 p-2 w-[25%]">លទ្ធផលសម្រេចបាន</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-800 p-2">ICT និងកុំព្យូទ័រ</td>
              <td class="border border-slate-800 p-2 text-left pl-3">មេរៀនទី១ ដល់ ទី៣</td>
              <td class="border border-slate-800 p-2 text-emerald-600">១០០%</td>
            </tr>
            <tr>
              <td class="border border-slate-800 p-2">Scratch Coding</td>
              <td class="border border-slate-800 p-2 text-left pl-3">គម្រោងបង្កើត Animation ខ្លី</td>
              <td class="border border-slate-800 p-2 text-emerald-600">បញ្ចប់តាមការគ្រោងទុក</td>
            </tr>
            <tr>
              <td class="border border-slate-800 p-2">Arduino & Electronics</td>
              <td class="border border-slate-800 p-2 text-left pl-3">តម្លើងសៀគ្វីភ្លើង LED និង Sensor</td>
              <td class="border border-slate-800 p-2 text-amber-600">កំពុងអនុវត្ត (៨០%)</td>
            </tr>
          </tbody>
        </table>
        <h4 class="font-bold font-moul mt-4 mb-2 text-[13px]">៤. បញ្ហាប្រឈម និងសំណូមពរ៖</h4>
        <p class="indent-8 font-siemreap leading-relaxed outline-none hover:bg-slate-50 cursor-text" contenteditable="true">សម្ភារៈឧបទ្ទេសសម្រាប់ការអនុវត្តផ្ទាល់ (Arduino Starter Kits) មានភាពខ្វះខាតបន្តិចបន្តួច បើធៀបនឹងចំនួនសិស្ស។ សំណូមពរដល់គណៈគ្រប់គ្រងសាលាជួយពិនិត្យលទ្ធភាពបន្ថែម។</p>
      `;
    } 
    else if (type === 'semester') {
      if(titleEl) titleEl.innerText = 'របាយការណ៍ប្រចាំឆមាសទី១';
      if(subtitleEl) subtitleEl.innerText = 'ឆ្នាំសិក្សា ២០២៦-២០២៧';
      html = `<p class="indent-8 font-siemreap leading-relaxed">ខ្លឹមសាររបាយការណ៍សង្ខេបប្រចាំឆមាស នឹងត្រូវបានរៀបចំស្វ័យប្រវត្តិទាញយកពីទិន្នន័យពិន្ទុ និងវត្តមានរយៈពេល ៥ខែ...</p>`;
    } 
    else if (type === 'yearly') {
      if(titleEl) titleEl.innerText = 'របាយការណ៍បូកសរុបប្រចាំឆ្នាំ';
      if(subtitleEl) subtitleEl.innerText = 'ឆ្នាំសិក្សា ២០២៦-២០២៧';
      html = `<p class="indent-8 font-siemreap leading-relaxed">ខ្លឹមសាររបាយការណ៍បូកសរុបសមិទ្ធផលពេញមួយឆ្នាំសិក្សា រួមមានស្ថិតិសិស្សឡើងថ្នាក់ ត្រួតថ្នាក់ និងអត្រាបោះបង់ការសិក្សា...</p>`;
    }
    if (contentEl) contentEl.innerHTML = html;
  },
  exportPDF() {
    if (typeof html2pdf === 'undefined') {
      alert("សូមបញ្ជូល Library html2pdf.js នៅក្នុង index.html ជាមុនសិន!"); return;
    }
    const element = document.getElementById('reportDocument');
    const opt = { margin: 0.5, filename: `របាយការណ៍រដ្ឋបាល_${this.currentType}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#ffffff'; 
    html2pdf().set(opt).from(element).save().then(() => { element.style.backgroundColor = originalBg; });
  },
  exportWord() {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Word</title></head><body>";
    const footer = "</body></html>";
    const content = document.getElementById('reportDocument').innerHTML;
    const html = header + content + footer;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    if(navigator.msSaveOrOpenBlob){ navigator.msSaveOrOpenBlob(blob, `របាយការណ៍រដ្ឋបាល_${this.currentType}.doc`); } 
    else { downloadLink.href = url; downloadLink.download = `របាយការណ៍រដ្ឋបាល_${this.currentType}.doc`; downloadLink.click(); }
    document.body.removeChild(downloadLink);
  }
};

window.loadSchoolReportsView = function() {
  const container = document.getElementById("schoolReportsView") || document.getElementById("mainContentArea");
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in font-siemreap text-slate-800 h-full flex flex-col pb-10">
      
      <!-- ផ្ទាំងបញ្ជា (Header) -->
      <div class="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-500 to-indigo-600"></div>
        <div class="pl-2">
          <h2 class="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
            <div class="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shadow-sm"><i class="fa-solid fa-file-contract"></i></div>
            របាយការណ៍រដ្ឋបាល និងវាយតម្លៃ
          </h2>
          <p class="text-xs text-slate-500 mt-1 md:ml-14 font-bold">តាមដានសកម្មភាពបុគ្គលិកអប់រំ និងទាញយករបាយការណ៍ផ្លូវការ</p>
        </div>
      </div>

      <!-- Main Tabs -->
      <div class="bg-white px-4 pt-4 border border-slate-300 rounded-t-2xl shrink-0 shadow-sm">
         <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
           <button onclick="window.switchMainReportTab('adminReports')" id="rtab-adminReports" class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap bg-sky-100 text-sky-700 shadow-sm">
             <i class="fa-solid fa-file-word mr-1"></i> របាយការណ៍រដ្ឋបាល
           </button>
           <button onclick="window.switchMainReportTab('teachers')" id="rtab-teachers" class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-100">
             <i class="fa-solid fa-chalkboard-user mr-1"></i> វឌ្ឍនភាពគ្រូបង្រៀន
           </button>
           <button onclick="window.switchMainReportTab('library')" id="rtab-library" class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-100">
             <i class="fa-solid fa-book-reader mr-1"></i> វឌ្ឍនភាពបណ្ណារក្ស
           </button>
           <button onclick="window.switchMainReportTab('legal')" id="rtab-legal" class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-100">
             <i class="fa-solid fa-scale-balanced mr-1"></i> លិខិតបទដ្ឋានគតិយុត្ត
           </button>
         </div>
      </div>
      
      <!-- Content Area -->
      <div id="reportContentArea" class="flex-1 bg-white border border-t-0 border-slate-300 rounded-b-2xl shadow-sm overflow-hidden flex flex-col custom-scrollbar"></div>
      
    </div>
  `;
  window.renderMainReportContent();
}

window.switchMainReportTab = function(tab) {
  window.currentReportTab = tab;
  document.querySelectorAll("[id^='rtab-']").forEach(btn => {
    btn.className = "px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-slate-500 hover:bg-slate-100";
  });
  const activeTab = document.getElementById("rtab-" + tab);
  if (activeTab) {
    activeTab.className = "px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap bg-sky-100 text-sky-700 shadow-sm";
  }
  window.renderMainReportContent();
}

window.renderMainReportContent = function() {
  const area = document.getElementById("reportContentArea");
  if (!area) return;

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
  const districtName = sInfo.district || "ស្រុក/ខណ្ឌ.................";

  if (window.currentReportTab === 'adminReports') {
    area.innerHTML = `
      <div class="flex flex-col lg:flex-row w-full h-full min-h-full bg-slate-50/50">
        
        <div class="w-full lg:w-64 border-r border-slate-300 p-4 flex flex-col gap-3 bg-white shrink-0 shadow-sm z-10 overflow-y-auto">
           <h3 class="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">ប្រភេទរបាយការណ៍</h3>
           <button id="tab-monthly" class="tab-btn active-tab w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm" onclick="window.AdminReportController.switchTab('monthly')">
              ប្រចាំខែ
           </button>
           <button id="tab-semester" class="tab-btn w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100" onclick="window.AdminReportController.switchTab('semester')">
              ប្រចាំឆមាស
           </button>
           <button id="tab-yearly" class="tab-btn w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100" onclick="window.AdminReportController.switchTab('yearly')">
              ប្រចាំឆ្នាំ
           </button>
           
           <h3 class="font-bold text-slate-800 mt-6 mb-2 border-b border-slate-100 pb-2">ទាញយកឯកសារ (Export)</h3>
           <button type="button" onclick="window.AdminReportController.exportPDF()" class="w-full text-left px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-sm border border-rose-200 transition shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-file-pdf"></i> ទាញយកជា PDF
           </button>
           <button type="button" onclick="window.AdminReportController.exportWord()" class="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-sm border border-blue-200 transition shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-file-word"></i> ទាញយកជា Word
           </button>
        </div>

        <div class="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-200 flex justify-center custom-scrollbar">
           <div id="reportDocument" class="w-[210mm] min-h-[297mm] bg-white shadow-xl p-[20mm] text-[12pt] text-black shrink-0 box-border" style="font-family: 'Siemreap', sans-serif;">
              
              <div class="flex justify-between items-start font-moul text-[13px] mb-8 leading-relaxed">
                <div class="text-center">
                  <p class="outline-none hover:bg-slate-50 cursor-text" contenteditable="true">ការិយាល័យអប់រំ យុវជន និងកីឡា</p>
                  <p class="outline-none hover:bg-slate-50 cursor-text" contenteditable="true">${districtName}</p>
                  <p class="outline-none hover:bg-slate-50 cursor-text" contenteditable="true">${schoolName}</p>
                </div>
                <div class="text-center">
                  <p class="text-[14px]">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p class="text-[14px] mt-0.5">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  <div class="font-serif tracking-[4px] mt-0.5 text-slate-600 font-bold">* * * 📖 * * *</div>
                </div>
              </div>
              
              <div class="text-center font-moul text-lg mb-8">
                <h2 id="reportTitle" class="tracking-wider outline-none hover:bg-slate-50 cursor-text" contenteditable="true">ចំណងជើងរបាយការណ៍</h2>
                <h3 id="reportSubtitle" class="text-base mt-2 outline-none hover:bg-slate-50 cursor-text" contenteditable="true">ខែ/ឆ្នាំ</h3>
              </div>
              
              <div id="reportContent" class="text-justify leading-relaxed text-[14px]"></div>
              
              <div class="flex justify-end mt-16 font-moul text-center text-[13px]">
                <div>
                   <p class="font-siemreap text-sm mb-2 outline-none hover:bg-slate-50 cursor-text" contenteditable="true">ធ្វើនៅ............., ថ្ងៃទី.......ខែ.......ឆ្នាំ ២០២...</p>
                   <p class="mb-16 outline-none hover:bg-slate-50 cursor-text" contenteditable="true">នាយកសាលា / គ្រូបន្ទុកថ្នាក់</p>
                   <p id="teacherSignatureName" class="text-indigo-900 outline-none hover:bg-slate-50 cursor-text" contenteditable="true">ឈ្មោះគ្រូ</p>
                </div>
              </div>

           </div>
        </div>
      </div>
    `;
    setTimeout(() => { window.AdminReportController.init(); }, 100);

  } 
  else if (window.currentReportTab === 'teachers') {
    let rows = window.teacherProgress.map((t, idx) => `
      <tr class="border-b border-slate-200 hover:bg-white transition text-[13px] font-bold text-slate-700">
        <td class="p-4 text-center">${idx + 1}</td>
        <td class="p-4 font-moul">${t.name}</td>
        <td class="p-4 text-indigo-600">${t.role}</td>
        <td class="p-4 text-center font-mono">${t.attendance}</td>
        <td class="p-4 text-center"><span class="px-3 py-1 bg-${t.statusColor}-50 text-${t.statusColor}-700 rounded-lg border border-${t.statusColor}-200">${t.lessonPlan}</span></td>
        <td class="p-4 text-center text-${t.statusColor}-600">${t.evaluation}</td>
        <td class="p-4 text-center">
           <button class="text-slate-400 hover:text-indigo-600 transition" title="ពិនិត្យកិច្ចតែងការលម្អិត"><i class="fa-solid fa-folder-open text-lg"></i></button>
        </td>
      </tr>
    `).join("");

    area.innerHTML = `
      <div class="p-6 w-full h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
        <div class="flex justify-between items-center mb-4 px-2">
          <h3 class="font-bold text-slate-700"><i class="fa-solid fa-list-check text-sky-500 mr-2"></i> តាមដានការដាក់កិច្ចតែងការបង្រៀន និងវត្តមាន</h3>
          <span class="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">ប្រចាំខែ បច្ចុប្បន្ន</span>
        </div>
        <table class="w-full text-left border-collapse bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <thead class="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
            <tr><th class="p-4 text-center w-12">ល.រ</th><th class="p-4">ឈ្មោះគ្រូបង្រៀន</th><th class="p-4">តួនាទី / បន្ទុកថ្នាក់</th><th class="p-4 text-center">វត្តមានបង្រៀន</th><th class="p-4 text-center">កិច្ចតែងការ (Lesson Plan)</th><th class="p-4 text-center">ការវាយតម្លៃ</th><th class="p-4 text-center">សកម្មភាព</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }
  else if (window.currentReportTab === 'library') {
    area.innerHTML = `
      <div class="p-6 w-full h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
             <h3 class="text-sm font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3"><i class="fa-solid fa-book-open-reader text-purple-500 mr-2"></i> របាយការណ៍សកម្មភាពបណ្ណាល័យ</h3>
             <div class="space-y-4 font-bold text-sm text-slate-600">
                <div class="flex justify-between items-center"><span class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> សិស្សចូលអានសៀវភៅសរុប៖</span> <span class="font-mono text-lg text-slate-800">១២៥ នាក់</span></div>
                <div class="flex justify-between items-center"><span class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-blue-500"></div> សៀវភៅត្រូវបានខ្ចីចេញ៖</span> <span class="font-mono text-lg text-slate-800">៤៨ ក្បាល</span></div>
                <div class="flex justify-between items-center"><span class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-rose-500"></div> សៀវភៅហួសថ្ងៃកំណត់សង៖</span> <span class="font-mono text-lg text-rose-600">៥ ក្បាល</span></div>
                <div class="flex justify-between items-center"><span class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-amber-500"></div> សៀវភៅខូចខាត/បាត់បង់៖</span> <span class="font-mono text-lg text-amber-600">១ ក្បាល</span></div>
             </div>
          </div>
          <div class="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center">
             <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 text-5xl mb-4"><i class="fa-solid fa-chart-pie"></i></div>
             <p class="font-bold text-slate-500">ក្រាហ្វិកស្ថិតិអ្នកអានកំពុងរៀបចំ...</p>
          </div>
        </div>
      </div>
    `;
  }
  else if (window.currentReportTab === 'legal') {
    let docCards = window.officialDocuments.map(doc => `
      <div class="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-300 transition group relative overflow-hidden flex flex-col h-full cursor-pointer">
         <div class="absolute -right-4 -top-4 text-slate-100 group-hover:text-sky-50 transition transform group-hover:scale-110 text-6xl z-0"><i class="fa-solid ${doc.icon}"></i></div>
         <div class="relative z-10 flex-1">
            <span class="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md mb-3 inline-block border border-sky-100">${doc.type}</span>
            <h3 class="font-moul text-sm text-slate-800 leading-[1.8] line-clamp-2" title="${doc.title}">${doc.title}</h3>
         </div>
         <div class="relative z-10 mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
            <span class="font-mono"><i class="fa-regular fa-calendar mr-1"></i> ${doc.date}</span>
            <span class="text-emerald-600 flex items-center gap-1"><i class="fa-solid fa-circle-check text-[10px]"></i> ${doc.status}</span>
         </div>
      </div>
    `).join("");

    area.innerHTML = `
      <div class="p-6 w-full h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-slate-700"><i class="fa-solid fa-scale-balanced text-sky-500 mr-2"></i> បណ្ណាល័យឯកសារគតិយុត្ត (MoEYS Standard)</h3>
          <div class="relative">
             <i class="fa-solid fa-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
             <input type="text" placeholder="ស្វែងរកឯកសារ..." class="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-sky-500 w-64 shadow-sm">
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
           ${docCards}
        </div>
      </div>
    `;
  }
}