// ==========================================
// ឯកសារ js/config.js (Advanced Cloud Sync & Instant Delete API)
// ==========================================

// 👉 URL របស់ Google Apps Script 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz3BAb42xG9nXlgukxRD8k5ZvdvFsnF-Cyby9ZzqnN4Sc9GWlVd6PXwyN_qRNSJDyne/exec";

// =========================================================
// ១. ការកំណត់ទូទៅ (Global Settings Data)
// =========================================================
let appSettings = {
  school_name: "សាលាបឋមសិក្សា",
  academic_year: "២០២៦-២០២៧",
  principal_name: "នាយកសាលា",
  teacher_name: "គ្រូបង្រៀន",
  district: ".......",
  school_logo: "",
  grade_format: "khmer", 
  auto_sync: true
};

async function fetchSystemSettings() {
  const cached = localStorage.getItem("school_settings");
  if (cached) { 
    try {
        appSettings = { ...appSettings, ...JSON.parse(cached) }; 
        applySettingsToUI(); 
    } catch(e) {}
  }

  try {
    const res = await apiGet("getSettings");
    if (res && res.data) {
      appSettings = { ...appSettings, ...res.data };
      localStorage.setItem("school_settings", JSON.stringify(appSettings));
      applySettingsToUI();
    }
  } catch (error) {
    console.warn("⚠️ ប្រើប្រាស់ Settings ចាស់ក្នុងម៉ាស៊ីន ដោយសារបណ្តាញមានបញ្ហា។");
  }
}

function applySettingsToUI() {
  const nameEl = document.getElementById("navSchoolName");
  if (nameEl) nameEl.textContent = appSettings.school_name || "សាលារៀន";
  const yearEl = document.getElementById("navSchoolYear");
  if (yearEl) yearEl.textContent = "ឆ្នាំសិក្សា " + (appSettings.academic_year || "២០២៦-២០២៧");
  const logoEl = document.getElementById("sidebarLogo");
  if (logoEl && appSettings.logo_url) {
      logoEl.src = appSettings.logo_url;
      logoEl.style.display = "block";
      if(logoEl.nextElementSibling) logoEl.nextElementSibling.style.display = "none";
  }
}

// =========================================================
// ២. ប្រព័ន្ធ API (GET & POST) សម្រាប់ Google Apps Script
// =========================================================

/**
 * មុខងារសម្រាប់ហៅទិន្នន័យ (GET)
 */
async function apiGet(action, params = {}) {
  const cacheKey = `cache_${action}_${JSON.stringify(params)}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    fetchDataFromAPI(action, params, cacheKey).catch(e => console.warn("Background Sync API Get Error"));
    return JSON.parse(cachedData);
  }

  return await fetchDataFromAPI(action, params, cacheKey);
}

async function fetchDataFromAPI(action, params, cacheKey) {
  try {
    const url = new URL(SCRIPT_URL);
    url.searchParams.append("action", action);
    for (const [key, val] of Object.entries(params)) { 
      if (val) url.searchParams.append(key, val); 
    }
    
    const res = await fetch(url.toString());
    const data = await res.json();
    
    if (data.status === "success") {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    return data;
  } catch (err) { 
    console.warn(`API GET Error [${action}]: បរាជ័យក្នុងការតភ្ជាប់។`);
    return { status: "error", data: null };
  }
}

/**
 * មុខងារសម្រាប់បញ្ជូនទិន្នន័យ (POST)
 */
async function apiPost(action, payload = {}) {
  // ការងារបន្ទាន់ដែលត្រូវបាញ់ទៅ Server ភ្លាមៗ (មិនឆ្លងកាត់ Queue)
  const instantActions = [
      "loginUser", 
      "generateWithAI", 
      "deleteStudent", 
      "deleteFinance", 
      "deleteStaff", 
      "deleteBook", 
      "deleteAsset"
  ];
  
  if (instantActions.includes(action)) {
    try {
      const formData = new URLSearchParams();
      formData.append("action", action);
      
      // បញ្ជាក់ id ដាច់ដោយឡែកដើម្បីអោយ Backend ចាប់បាន
      if(payload && payload.id) formData.append("id", payload.id);
      else if (payload && payload.data && payload.data.id) formData.append("id", payload.data.id);
      
      formData.append("data", JSON.stringify(payload));

      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      return await response.json();
    } catch (error) {
      console.error(`API POST Instant Error [${action}]:`, error);
      throw new Error("បញ្ហាតភ្ជាប់បណ្តាញ (Network Error)"); 
    }
  }

  // សម្រាប់ទិន្នន័យធម្មតា ត្រូវរក្សាទុកក្នុងកុំព្យូទ័រសិន (Offline-First Queue)
  let syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  
  syncQueue = syncQueue.filter(item => item.action !== action);
  syncQueue.push({ action, payload: payload, timestamp: new Date().getTime() });
  
  localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
  updateSyncBadgeUI(syncQueue.length);

  // ប្រសិនបើកំណត់ Auto Sync = true នោះបាញ់ទៅ Cloud ស្វ័យប្រវត្តិ
  if (appSettings.auto_sync !== false) {
      setTimeout(() => { syncDataToServer(true); }, 1500);
  }

  return { status: "success", message: "បានរក្សាទុកក្នុងម៉ាស៊ីន! (Pending Cloud Sync)" };
}

/**
 * មុខងារបញ្ជូនទិន្នន័យដែលនៅសល់ក្នុងបញ្ជីរង់ចាំ (Queue) ទៅកាន់ Google Sheet
 */
async function syncDataToServer(isSilent = false) {
  let syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  if (syncQueue.length === 0) {
      if(!isSilent) {
          if(typeof showToast === 'function') showToast("✅ គ្មានទិន្នន័យថ្មីត្រូវបញ្ជូនទេ!");
          else alert("✅ គ្មានទិន្នន័យថ្មីត្រូវបញ្ជូនទេ!");
      }
      return;
  }

  const btn = document.getElementById("btnSyncData");
  const originalHtml = btn ? btn.innerHTML : "Sync";
  if (btn && !isSilent) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបញ្ជូន...`;

  try {
    let failedQueue = [];

    for (let i = 0; i < syncQueue.length; i++) {
      const task = syncQueue[i];
      const formData = new URLSearchParams();
      
      formData.append("action", task.action);
      
      // រៀបចំទិន្នន័យ data ឲ្យបានត្រឹមត្រូវ
      if (task.payload && task.payload.data) {
          formData.append("data", JSON.stringify(task.payload.data));
      } else {
          formData.append("data", JSON.stringify(task.payload));
      }

      // 🔴 ចំណុចសំខាន់ដែលបានបន្ថែម: ទាញយក id មកបញ្ជូនដាច់ដោយឡែក
      if (task.payload && task.payload.data && task.payload.data.id) {
         formData.append("id", task.payload.data.id);
      } else if (task.payload && task.payload.id) {
         formData.append("id", task.payload.id);
      }

      try {
          const res = await fetch(SCRIPT_URL, { 
            method: "POST", 
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
          });
          
          const result = await res.json();
          if (result.status !== "success") {
             console.error(`Task [${task.action}] failed response:`, result);
             throw new Error(result.message);
          }
      } catch (reqErr) {
          console.warn(`Task [${task.action}] fetch failed:`, reqErr);
          failedQueue.push(task); 
      }
    }
    
    // រក្សាទុកតែទិន្នន័យដែលបរាជ័យ
    localStorage.setItem('syncQueue', JSON.stringify(failedQueue));
    updateSyncBadgeUI(failedQueue.length);
    
    if(failedQueue.length === 0) {
        if(!isSilent && typeof showToast === 'function') showToast("☁️ ទិន្នន័យត្រូវបាន Sync ទៅកាន់ Cloud ជោគជ័យ ១០០%!");
    } else {
        if(!isSilent && typeof showToast === 'function') showToast(`⚠️ នៅសល់ទិន្នន័យ ${failedQueue.length} មិនទាន់អាចបញ្ជូនបាន។`, true);
    }

  } catch (error) { 
    console.error("Global Sync Error:", error);
    if(!isSilent && typeof showToast === 'function') showToast("បរាជ័យក្នុងការធ្វើសមកាលកម្ម! សូមពិនិត្យអ៊ីនធឺណិត។", true);
  } finally { 
    if (btn && !isSilent) btn.innerHTML = originalHtml; 
  }
}

// មុខងារសម្អាត LocalStorage និងធ្វើបច្ចុប្បន្នភាពទំព័រ
window.clearLocalCacheWithConfirm = function() {
  if(confirm("⚠️ តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបទិន្នន័យបណ្តោះអាសន្ន (Cache) មែនទេ?\n\nបញ្ជាក់៖ ប្រព័ន្ធនឹងទាញយកទិន្នន័យថ្មីពី Cloud មកវិញ (ទិន្នន័យដែលមិនទាន់ Sync នឹងត្រូវបាត់បង់)។")) {
      Object.keys(localStorage).forEach(key => { 
        if (key.startsWith('cache_') || key === 'syncQueue' || key === 'academic_students' || key === 'exam_scores_data') {
            localStorage.removeItem(key); 
        }
      });
      if(typeof showToast === 'function') showToast("🧹 បានសម្អាត Cache ដោយជោគជ័យ!");
      setTimeout(() => location.reload(), 1500);
  }
};

function updateSyncBadgeUI(count) {
  const badge = document.getElementById("syncBadgeCount");
  const syncBtn = document.getElementById("btnSyncData");
  
  if (badge) { 
    badge.textContent = count; 
  }
  if (syncBtn) {
    if (count > 0) syncBtn.classList.remove("hidden");
    else syncBtn.classList.add("hidden");
  }
}

// =========================================================
// ៣. មុខងារបោះពុម្ព (Print Iframe with Fonts Support)
// =========================================================
window.printSpecificSheet = function(elementId, orientation = 'landscape') {
  const target = document.getElementById(elementId);
  if (!target) {
    alert("រកមិនឃើញសន្លឹកការងារសម្រាប់បោះពុម្ពទេ!");
    return;
  }

  let oldIframe = document.getElementById("print_frame_helper");
  if (oldIframe) oldIframe.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "print_frame_helper";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const clone = target.cloneNode(true);
  
  const origInputs = target.querySelectorAll("input, select, textarea");
  const cloneInputs = clone.querySelectorAll("input, select, textarea");
  
  origInputs.forEach((inp, idx) => {
    if (cloneInputs[idx]) {
      const span = document.createElement("span");
      if (inp.tagName === "SELECT") {
          span.textContent = inp.options[inp.selectedIndex]?.text || "";
      } else {
          span.textContent = inp.value || "";
      }
      span.style.cssText = "font-weight:bold; font-family:monospace; display:inline-block; text-align:center;";
      cloneInputs[idx].parentNode.replaceChild(span, cloneInputs[idx]);
    }
  });

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="UTF-8">
      <title>បោះពុម្ពឯកសារ</title>
      
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet">
      
      <script src="https://cdn.tailwindcss.com"><\/script>
      <script>
        tailwind.config = { theme: { extend: { fontFamily: { siemreap: ['Siemreap', 'sans-serif'], moul: ['Moul', 'sans-serif'] } } } }
      <\/script>

      <style>
        @page { 
          size: A4 ${orientation}; 
          margin: 8mm; 
        }
        
        @media print {
          body, html { width: 100% !important; margin: 0 !important; padding: 0 !important; background: white !important; }
          #${elementId}, .bg-white, .shadow-xl { max-width: 100% !important; width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        }

        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { color: black !important; font-family: 'Siemreap', sans-serif !important; }
        .font-moul { font-family: 'Moul', serif !important; font-weight: normal !important;}
        .font-siemreap { font-family: 'Siemreap', sans-serif !important; font-weight: 500 !important; }
        .no-print { display: none !important; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black !important; }
        .border-dashed { border-style: dashed !important; }
      </style>
    </head>
    <body>
      ${clone.innerHTML}
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 1500); 
};

// =========================================================
// ៤. ដំណើរការនៅពេលកម្មវិធីចាប់ផ្តើម (Load)
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  updateSyncBadgeUI(queue.length);
  
  fetchSystemSettings(); 
  
  if (queue.length > 0 && appSettings.auto_sync) {
      setTimeout(() => { syncDataToServer(true); }, 3000);
  }
});