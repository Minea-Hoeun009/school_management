// ==========================================
// ឯកសារ៖ គ្រប់គ្រងបុគ្គលិក និង ហិរញ្ញវត្ថុ (Staff & Finance Management - Premium UI)
// ==========================================

const khmerNumbersSF = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
const toKhmerNumSF = (str) => String(str).split('').map(n => khmerNumbersSF[n] || n).join('');

let allStaffList = [];
let allFinanceRecords = [];

// ==========================================
// ផ្នែកទី ១៖ គ្រប់គ្រងបុគ្គលិក និងគ្រូបង្រៀន (Staff Management)
// ==========================================

async function loadStaffView() {
  const container = document.getElementById("staffContainer") || document.getElementById("mainContentArea");
  if (!container) return;

  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
      .custom-mixed-font { font-family: 'Times New Roman', 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
      .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal !important; }
      .font-siemreap { font-family: 'Times New Roman', 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
    </style>

    <div class="space-y-6 animate-fade-in relative custom-mixed-font h-full flex flex-col p-2 md:p-4 bg-slate-50/50 rounded-3xl">
      
      <!-- ក្បាលទំព័រ និងប៊ូតុងសកម្មភាព -->
      <div class="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print relative overflow-hidden shrink-0">
        <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-500 to-blue-500"></div>
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div class="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center text-xl shadow-sm"><i class="fa-solid fa-chalkboard-user"></i></div>
            បញ្ជីបុគ្គលិក និងគ្រូបង្រៀន
          </h2>
          <p class="text-xs text-slate-500 mt-1 md:ml-14 font-bold bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">
            បុគ្គលិកសរុប៖ <b id="staffTotalCount" class="text-cyan-600 text-sm font-siemreap mx-1">0</b> នាក់
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="printStaffReport()" class="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2">
            <i class="fa-solid fa-print text-slate-500"></i> បោះពុម្ពបញ្ជី
          </button>
          <button onclick="openStaffModal()" class="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold shadow-md shadow-cyan-200 transition transform hover:-translate-y-0.5 flex items-center gap-2">
            <i class="fa-solid fa-plus"></i> បន្ថែមបុគ្គលិកថ្មី
          </button>
        </div>
      </div>

      <!-- តារាងទិន្នន័យ -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden no-print flex-1 flex flex-col">
        <div class="overflow-x-auto custom-scrollbar flex-1">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10">
              <tr>
                <th class="p-4 text-center w-12">ល.រ</th>
                <th class="p-4">ឈ្មោះបុគ្គលិក</th>
                <th class="p-4">ភេទ</th>
                <th class="p-4">តួនាទី</th>
                <th class="p-4">ថ្ងៃចូលធ្វើការ</th>
                <th class="p-4">លេខទូរស័ព្ទ</th>
                <th class="p-4 text-center">ស្ថានភាព</th>
                <th class="p-4 text-center w-24">ជម្រើស</th>
              </tr>
            </thead>
            <tbody id="staffTableBody" class="divide-y divide-slate-100 text-xs">
              <tr><td colspan="8" class="p-10 text-center text-slate-400 font-bold"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><br>កំពុងទាញយកទិន្នន័យ...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ទម្រង់សម្រាប់ព្រីន (លាក់ទុក Hidden) -->
      <div id="printStaffContainer" class="hidden">
        <div class="text-black bg-white p-8 font-sans font-siemreap">
          <div class="text-center mb-6">
            <h2 class="text-lg font-bold font-moul mb-1 tracking-wide">បញ្ជីរាយនាមបុគ្គលិក និងគ្រូបង្រៀន</h2>
            <p class="text-sm font-bold mt-2">កាលបរិច្ឆេទបញ្ចេញរបាយការណ៍៖ ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
          <table class="w-full border-collapse border-[2px] border-black text-xs text-center mb-6">
            <thead class="bg-slate-100 font-moul text-[11px] leading-relaxed">
              <tr class="border-b-[2px] border-black">
                <th class="border-r border-black p-2 w-10">ល.រ</th>
                <th class="border-r border-black p-2 text-left px-2 w-24">អត្តលេខ</th>
                <th class="border-r border-black p-2 text-left px-2">គោត្តនាម និងនាម</th>
                <th class="border-r border-black p-2">ភេទ</th>
                <th class="border-r border-black p-2">ថ្ងៃកំណើត</th>
                <th class="border-r border-black p-2">តួនាទី / មុខតំណែង</th>
                <th class="border-r border-black p-2">កម្រិតវប្បធម៌</th>
                <th class="p-2">លេខទូរស័ព្ទ</th>
              </tr>
            </thead>
            <tbody id="printStaffTableBody" class="font-siemreap"></tbody>
          </table>
          <div class="mt-8 flex justify-between font-bold text-xs px-8">
            <div class="text-center">
              <p class="mb-16">ធ្វើនៅ....................ថ្ងៃទី......ខែ......ឆ្នាំ២០២...</p>
              <p class="font-moul">នាយកសាលា</p>
            </div>
            <div class="text-center">
              <p class="mb-16">ធ្វើនៅ....................ថ្ងៃទី......ខែ......ឆ្នាំ២០២...</p>
              <p class="font-moul">អ្នករៀបចំបញ្ជី</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal បន្ថែម/កែប្រែបុគ្គលិក -->
      <div id="staffFullModal" class="fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 fade-in overflow-y-auto no-print custom-mixed-font">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-auto flex flex-col overflow-hidden border border-slate-100">
          <div class="bg-cyan-600 px-6 py-4 flex items-center justify-between shrink-0">
            <h3 id="staffModalTitle" class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-user-tie"></i> បន្ថែមបុគ្គលិកថ្មី
            </h3>
            <button type="button" onclick="closeStaffModal()" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-rose-500 transition">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="staffFullForm" onsubmit="handleSaveStaffSubmit(event)" class="p-6 md:p-8 overflow-y-auto space-y-6 text-sm bg-slate-50/50">
            <input type="hidden" id="stf_hidden_id">
            <div class="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
                <h4 class="font-bold text-cyan-700 flex items-center gap-2"><i class="fa-solid fa-address-card text-cyan-400"></i> ១. ព័ត៌មានផ្ទាល់ខ្លួន</h4>
              </div>
              <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">អត្តលេខបុគ្គលិក</label><input type="text" id="stf_emp_id" placeholder="ឧ. T-001" class="w-full border border-slate-200 rounded-xl p-2.5 font-mono text-cyan-700 font-bold focus:ring-2 focus:ring-cyan-500 outline-none bg-slate-50"></div>
              <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">គោត្តនាម និងនាម *</label><input type="text" id="stf_name" required placeholder="ឧ. ហឿន វិផា" class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none font-bold font-moul"></div>
              <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">ភេទ *</label><select id="stf_gender" required class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-medium"><option value="ប្រុស">ប្រុស</option><option value="ស្រី">ស្រី</option></select></div>
              <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">ថ្ងៃខែឆ្នាំកំណើត</label><input type="date" id="stf_dob" class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-mono"></div>
              <div class="md:col-span-2"><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">ទីលំនៅបច្ចុប្បន្ន</label><input type="text" id="stf_address" placeholder="ភូមិ ឃុំ ស្រុក ខេត្ត" class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none"></div>

              <div class="md:col-span-2 border-b border-slate-100 pb-2 mb-2 mt-2">
                <h4 class="font-bold text-blue-700 flex items-center gap-2"><i class="fa-solid fa-briefcase text-blue-400"></i> ២. ព័ត៌មានការងារ</h4>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">តួនាទី / មុខតំណែង *</label>
                <select id="stf_role" required class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-bold text-slate-700">
                  <option value="គ្រូបង្រៀន">គ្រូបង្រៀន</option><option value="នាយកសាលា">នាយកសាលា</option><option value="នាយករង">នាយករង</option>
                  <option value="រដ្ឋបាល">រដ្ឋបាល / លេខា</option><option value="គណនេយ្យ">គណនេយ្យ</option><option value="សន្តិសុខ">សន្តិសុខ / ឆ្មាំ</option>
                  <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                </select>
              </div>
              <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">កម្រិតវប្បធម៌ / ឯកទេស</label><input type="text" id="stf_degree" placeholder="ឧ. បរិញ្ញាបត្រគរុកោសល្យ..." class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none"></div>
              <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">ថ្ងៃចូលបម្រើការងារ</label><input type="date" id="stf_start_date" class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-mono"></div>
              <div><label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">លេខទូរស័ព្ទ</label><input type="tel" id="stf_phone" placeholder="012 345 678" class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"></div>
              <div>
                <label class="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">ស្ថានភាពការងារ</label>
                <select id="stf_status" class="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-medium">
                  <option value="សកម្ម">🟢 កំពុងបម្រើការ (Active)</option>
                  <option value="ឈប់សម្រាក">🔴 ឈប់សម្រាក / ព្យួរការងារ (Inactive)</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2 sticky bottom-0 z-10">
              <button type="button" onclick="closeStaffModal()" class="px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-bold transition shadow-sm">បោះបង់</button>
              <button type="submit" id="btnSaveStaff" class="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md shadow-cyan-200 transition flex items-center gap-2">
                <i class="fa-solid fa-floppy-disk"></i> រក្សាទុកទិន្នន័យ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  await fetchStaffList();
}

async function fetchStaffList() {
  const tbody = document.getElementById("staffTableBody");
  const printBody = document.getElementById("printStaffTableBody");
  
  try {
    const res = typeof apiGet === "function" ? await apiGet("getStaff") : { data: [] };
    allStaffList = res.data || [];
    
    if (allStaffList.length === 0) {
      allStaffList = [
         { id: "1", emp_id: "T-001", name: "មាស មករា", gender: "ស្រី", dob: "1990-05-12", position: "គ្រូបង្រៀន", phone: "012345678", status: "សកម្ម", join_date: "2020-01-01", education: "បរិញ្ញាបត្រ" },
         { id: "2", emp_id: "A-001", name: "សុខ សាន្ត", gender: "ប្រុស", dob: "1985-10-20", position: "នាយកសាលា", phone: "098765432", status: "សកម្ម", join_date: "2015-09-01", education: "អនុបណ្ឌិត" }
      ];
    }
    
    if (document.getElementById("staffTotalCount")) {
      document.getElementById("staffTotalCount").textContent = allStaffList.length.toString();
    }

    if (tbody) {
      tbody.innerHTML = allStaffList.map((s, index) => {
        const isActive = s.status !== "ឈប់សម្រាក";
        const statusBadge = isActive 
          ? `<span class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100"><i class="fa-solid fa-check mr-1"></i>សកម្ម</span>` 
          : `<span class="px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100"><i class="fa-solid fa-ban mr-1"></i>ឈប់សម្រាក</span>`;

        let roleClass = "bg-blue-50 text-blue-600 border-blue-100";
        if(s.position && s.position.includes("នាយក")) roleClass = "bg-purple-50 text-purple-600 border-purple-100";
        else if(s.position === "រដ្ឋបាល" || s.position === "គណនេយ្យ") roleClass = "bg-amber-50 text-amber-600 border-amber-100";

        // ប្រើប្រាស់អនុគមន៍ formatDate បើមាន
        const displayJoinDate = (typeof formatDate === 'function' && s.join_date) ? formatDate(s.join_date) : (s.join_date || '-');

        return `
          <tr class="hover:bg-cyan-50/40 transition border-b border-slate-50 bg-white">
            <td class="p-4 text-center font-bold text-slate-400 font-siemreap">${(index + 1).toString()}</td>
            <td class="p-4 font-bold text-slate-800 font-moul text-[13px]">
              ${s.name} <br><span class="text-[10px] text-slate-400 font-normal font-mono bg-slate-50 px-1.5 py-0.5 rounded">${s.emp_id || '-'}</span>
            </td>
            <td class="p-4"><span class="px-2 py-1 ${s.gender==='ស្រី'?'bg-pink-50 text-pink-600':'bg-blue-50 text-blue-600'} rounded-md text-[11px] font-bold">${s.gender}</span></td>
            <td class="p-4"><span class="px-2.5 py-1 rounded-md border ${roleClass} text-[10px] font-bold">${s.position || '-'}</span></td>
            <td class="p-4 text-slate-500 font-siemreap text-xs">${displayJoinDate}</td>
            <td class="p-4 font-mono text-indigo-600 font-bold text-[13px]">${s.phone || '-'}</td>
            <td class="p-4 text-center">${statusBadge}</td>
            <td class="p-4 text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button onclick="editStaff('${s.id}')" title="កែប្រែ" class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition shadow-sm"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteStaff('${s.id}')" title="លុបចោល" class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition shadow-sm"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    if (printBody) {
      printBody.innerHTML = allStaffList.map((s, index) => {
        const displayDOB = (typeof formatDate === 'function' && s.dob) ? formatDate(s.dob) : (s.dob || '-');
        return `
        <tr class="h-[30px]">
          <td class="border-r border-black p-1 text-center">${(index + 1).toString()}</td>
          <td class="border-r border-black p-1 text-left px-2 font-mono">${s.emp_id || '-'}</td>
          <td class="border-r border-black p-1 font-bold font-moul px-2 text-left">${s.name}</td>
          <td class="border-r border-black p-1 text-center">${s.gender}</td>
          <td class="border-r border-black p-1 text-center font-mono">${displayDOB}</td>
          <td class="border-r border-black p-1 text-center">${s.position || '-'}</td>
          <td class="border-r border-black p-1 text-center">${s.education || '-'}</td>
          <td class="p-1 text-center font-mono">${s.phone || '-'}</td>
        </tr>
      `}).join("");
    }
  } catch (err) {
    console.log(err);
  }
}

function openStaffModal(staffObj = null) {
  const modal = document.getElementById("staffFullModal");
  const form = document.getElementById("staffFullForm");
  if (!modal || !form) return;
  form.reset();

  if (staffObj) {
    document.getElementById("staffModalTitle").innerHTML = `<i class="fa-solid fa-user-pen"></i> កែសម្រួលព័ត៌មានបុគ្គលិក`;
    document.getElementById("stf_hidden_id").value = staffObj.id;
    document.getElementById("stf_emp_id").value = staffObj.emp_id || "";
    document.getElementById("stf_name").value = staffObj.name || "";
    document.getElementById("stf_gender").value = staffObj.gender || "ប្រុស";
    document.getElementById("stf_dob").value = staffObj.dob || "";
    document.getElementById("stf_address").value = staffObj.address || "";
    document.getElementById("stf_role").value = staffObj.position || "គ្រូបង្រៀន";
    document.getElementById("stf_degree").value = staffObj.education || "";
    document.getElementById("stf_start_date").value = staffObj.join_date || "";
    document.getElementById("stf_phone").value = staffObj.phone || "";
    document.getElementById("stf_status").value = staffObj.status || "សកម្ម";
  } else {
    document.getElementById("staffModalTitle").innerHTML = `<i class="fa-solid fa-user-tie"></i> បន្ថែមបុគ្គលិកថ្មី`;
    document.getElementById("stf_hidden_id").value = "";
    document.getElementById("stf_emp_id").value = "STF-" + Math.floor(1000 + Math.random() * 9000); 
  }
  modal.classList.remove("hidden"); modal.classList.add("flex");
}

function closeStaffModal() {
  const modal = document.getElementById("staffFullModal");
  if (modal) { modal.classList.add("hidden"); modal.classList.remove("flex"); }
}

function editStaff(id) {
  const s = allStaffList.find(item => String(item.id) === String(id));
  if (s) openStaffModal(s);
}

async function handleSaveStaffSubmit(e) {
  e.preventDefault();
  const idVal = document.getElementById("stf_hidden_id").value || String(new Date().getTime());
  
  // 🔴 ប្រើឈ្មោះ Keys ឱ្យដូច Header របស់ Google Sheet
  const payload = {
    id: idVal, 
    emp_id: document.getElementById("stf_emp_id").value,
    name: document.getElementById("stf_name").value, 
    gender: document.getElementById("stf_gender").value,
    dob: document.getElementById("stf_dob").value, 
    address: document.getElementById("stf_address").value,
    position: document.getElementById("stf_role").value, // ប្ដូរពី role ទៅ position
    education: document.getElementById("stf_degree").value, // ប្ដូរពី degree ទៅ education
    join_date: document.getElementById("stf_start_date").value, // ប្ដូរពី start_date ទៅ join_date
    phone: document.getElementById("stf_phone").value,
    status: document.getElementById("stf_status").value
  };

  // 🔴 ហៅមុខងារ apiPost ដើម្បីបញ្ជូនទិន្នន័យទៅ Server តាមរយៈ Queue
  if (typeof apiPost === "function") {
    apiPost("saveStaff", payload).catch(err => console.error("Error saving staff to queue:", err));
  } else {
    console.error("apiPost function is not defined.");
  }

  // ធ្វើបច្ចុប្បន្នភាព UI ភ្លាមៗ (Optimistic Update)
  const existingIndex = allStaffList.findIndex(s => s.id === payload.id);
  if (existingIndex > -1) allStaffList[existingIndex] = payload;
  else allStaffList.push(payload);

  closeStaffModal(); 
  fetchStaffList(); 
  
  if(typeof showToast === 'function') {
      showToast("✅ រក្សាទុកបុគ្គលិកជោគជ័យ!");
  } else {
      alert("✅ រក្សាទុកបុគ្គលិកជោគជ័យ!");
  }
}

async function deleteStaff(id) {
  if(!confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យបុគ្គលិកនេះចេញពីប្រព័ន្ធមែនទេ?")) return;
  
  // 🔴 ហៅមុខងារ apiPost ដើម្បីបញ្ជូនសំណើលុបទៅកាន់ Server ភ្លាមៗ (Instant Delete)
  if (typeof apiPost === "function") {
      try {
          await apiPost("deleteStaff", { id: id });
      } catch(err) {
          console.error("Error deleting staff:", err);
      }
  }

  // ធ្វើបច្ចុប្បន្នភាព UI ភ្លាមៗ
  allStaffList = allStaffList.filter(s => String(s.id) !== String(id));
  fetchStaffList(); 
}

function printStaffReport() {
  if (allStaffList.length === 0) return alert("គ្មានទិន្នន័យសម្រាប់បោះពុម្ពទេ!");
  const content = document.getElementById("printStaffContainer");
  if(!content) return;
  
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  printWindow.document.write(`
    <html>
      <head>
        <title>បោះពុម្ពបញ្ជីបុគ្គលិក</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
           @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
           body { font-family: 'Times New Roman', 'Khmer OS Siemreap', 'Siemreap', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;}
           .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal !important; }
           .font-siemreap { font-family: 'Times New Roman', 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
           @page { size: landscape; margin: 12mm; }
        </style>
      </head>
      <body>${content.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => { printWindow.focus(); printWindow.print(); }, 800);
}
