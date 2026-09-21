// ==========================================
// ឯកសារ js/auth.js - កំណត់សិទ្ធិចូលប្រើ និងប្តូរផ្ទាំងការងារ (Smart View Switcher)
// ==========================================

// ១. គ្រប់គ្រងស្ថានភាពអ្នកប្រើប្រាស់ (Bypass Login Mode)
window.AuthState = {
  getUser: () => JSON.parse(localStorage.getItem('authUser')),
  setUser: (user) => localStorage.setItem('authUser', JSON.stringify(user)),
  clear: () => localStorage.removeItem('authUser')
};

document.addEventListener("DOMContentLoaded", () => {
  // ហៅមុខងារចូលប្រព័ន្ធដោយស្វ័យប្រវត្តិពេលបើកវេបសាយភ្លាមៗ
  checkInitialAuth();
});

// ២. មុខងារបញ្ជាឱ្យចូល Dashboard ដោយមិនបាច់ Login
function checkInitialAuth() {
  // បង្កើតគណនី Admin សាកល្បង
  const dummyAdmin = {
    name: "គណនីសាកល្បង (Test Mode)",
    role: "Admin",
    username_or_phone: "admin"
  };
  
  AuthState.setUser(dummyAdmin);

  const loginView = document.getElementById("loginView");
  const appView = document.getElementById("appView");
  const landingScreen = document.getElementById("landing-screen");

  // លាក់ផ្ទាំង Login/Landing ហើយបើកផ្ទាំងការងារ (App View)
  if (landingScreen) landingScreen.classList.add("hidden");
  if (loginView) loginView.classList.add("hidden");
  if (appView) appView.classList.remove("hidden");
  
  // បង្ហាញឈ្មោះនៅលើ Sidebar និងបើកសិទ្ធិ
  renderUserInfo(dummyAdmin);
  applyRolePermissions(dummyAdmin.role);
  
  // ហៅការកំណត់ទូទៅ (បើមាន) និងបើកផ្ទាំង Dashboard
  if (typeof fetchSystemSettings === 'function') {
    fetchSystemSettings();
  }
  window.switchView("dashboard");
}

function renderUserInfo(user) {
  const nameEl = document.getElementById("navUserName");
  const roleEl = document.getElementById("navUserRole");
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = "នាយកសាលា / រដ្ឋបាល";
}

function applyRolePermissions(role) {
  const adminMenus = document.querySelectorAll(".role-admin");
  const teacherMenus = document.querySelectorAll(".role-teacher");
  adminMenus.forEach(el => el.classList.remove("hidden"));
  teacherMenus.forEach(el => el.classList.remove("hidden"));
}

window.handleLogout = function() {
  alert("លោកអ្នកកំពុងស្ថិតក្នុងទម្រង់សាកល្បង (Bypass Login)។ ការចាកចេញត្រូវបានបិទបណ្តោះអាសន្ន!");
};

// ==========================================
// ៣. មុខងារប្តូរផ្ទាំងការងារឆ្លាតវៃ (Smart View Switcher)
// ==========================================
window.switchView = function(viewId, param = "") {
  // ក. លាក់ផ្ទាំងទាំងអស់សិន
  const allViews = document.querySelectorAll("main[id$='View']");
  allViews.forEach(el => {
      el.classList.add('hidden');
      el.style.display = 'none'; // បន្ថែម Display None ឱ្យប្រាកដថាលាក់
  });
  
  // ខ. បង្ហាញតែផ្ទាំងដែលបានជ្រើសរើស
  const targetView = document.getElementById(viewId + 'View');
  if (targetView) {
      targetView.classList.remove('hidden');
      targetView.style.display = 'block';
  } else {
      console.warn("⚠️ រកមិនឃើញផ្ទាំង HTML ឈ្មោះ:", viewId + 'View');
      return;
  }
  
  // គ. ប្តូរចំណងជើងក្បាលទំព័រ
  const titles = {
    'dashboard': 'ផ្ទាំងគ្រប់គ្រង (Dashboard)', 
    'students': 'គ្រប់គ្រងបញ្ជីឈ្មោះសិស្ស', 
    'classrooms': 'គ្រប់គ្រងថ្នាក់រៀន',
    'attendance': 'កត់វត្តមានប្រចាំថ្ងៃ',
    'scores': 'បញ្ចូលពិន្ទុ និងនិទ្ទេស',  
    'certificates': 'ប័ណ្ណសរសើរ',
    'staff': 'គ្រប់គ្រងបុគ្គលិក', 
    'settings': 'ការកំណត់ទូទៅ', 
    'documentEditor': 'បង្កើតឯកសារ & AI',
    'academic': 'ប្រព័ន្ធគ្រប់គ្រងការសិក្សា'
  };
  
  const titleEl = document.getElementById('pageTitleHeader');
  if (titleEl) titleEl.textContent = titles[viewId] || 'ផ្ទាំងការងារ';

  // ឃ. ហៅទាញទិន្នន័យពេលចុច (Dynamic Render)
  if (viewId === "dashboard" && typeof loadDashboard === 'function') loadDashboard();
  else if (viewId === "classrooms" && typeof loadClassroomsView === 'function') loadClassroomsView();
  else if (viewId === "students" && typeof loadStudentsView === 'function') loadStudentsView(param);
  else if (viewId === "attendance" && typeof loadAttendanceView === 'function') loadAttendanceView(param);
  else if (viewId === "scores" && typeof loadScoresView === 'function') loadScoresView(param);
  else if (viewId === "rankings" && typeof loadRankingsView === 'function') loadRankingsView(param);
  else if (viewId === "certificates" && typeof loadCertificatesView === 'function') loadCertificatesView();
  else if (viewId === "staff" && typeof loadStaffView === 'function') loadStaffView();
  else if (viewId === "settings" && typeof loadSettingsView === 'function') loadSettingsView();
  else if (viewId === "documentEditor" && typeof loadDocumentEditorView === 'function') loadDocumentEditorView();
  else if (viewId === "library" && typeof loadLibraryView === 'function') loadLibraryView();
  else if (viewId === "academic" && typeof loadAcademicView === 'function') loadAcademicView(param);
  else if (viewId === "examManager" && typeof loadExamManagerView === 'function') loadExamManagerView();
  else if (viewId === "schoolReports" && typeof loadSchoolReportsView === 'function') loadSchoolReportsView();
};

