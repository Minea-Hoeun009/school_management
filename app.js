// =====================================================================
// ឯកសារ js/app.js - គ្រប់គ្រងដំណើរការទូទៅរបស់ប្រព័ន្ធ
// =====================================================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("App Started! Checking Login State...");
    
    // ១. ពិនិត្យមើលថាតើគ្រូបាន Login ឬនៅ?
    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    
    if (currentTeacherId) {
        // ២. បើ Login រួចហើយ រៀបចំទិន្នន័យបឋម
        console.log("Teacher is logged in. Preparing workspace...");
        
        // ធានាថាកាលបរិច្ឆេទសូរិយគតិ/ចន្ទគតិ ត្រូវបាន Set Default ជាថ្ងៃនេះ
        if (typeof window.setSharedTodaySolarDate === 'function') {
            window.setSharedTodaySolarDate();
        }

        // ៣. ហៅមុខងារ Load View នៃ Menu ដែលគ្រូកំពុងស្ថិតនៅ (ឧ. វត្តមាន ឬ ពិន្ទុ)
        // សន្មតថាយើងមានអថេរកំណត់ Menu បច្ចុប្បន្ន ឧ. localStorage.getItem('activeMenu')
        const activeMenu = localStorage.getItem('activeMenu') || 'attendance'; 
        
        switch (activeMenu) {
            case 'attendance':
                if (typeof window.loadAttendanceView === 'function') {
                    await window.loadAttendanceView(); // នេះវានឹងហៅ fetchMonthlyAttendance ខាងក្នុង
                }
                break;
            case 'scores':
                if (typeof window.loadScoresView === 'function') {
                    await window.loadScoresView(); // នេះវានឹងហៅ fetchStudentsForScores ខាងក្នុង
                }
                break;
            case 'students':
                 if (typeof window.loadStudentView === 'function') {
                    await window.loadStudentView();
                }
                break;
            default:
                // Load ទំព័រដើម (Dashboard)
                if (typeof window.loadDashboard === 'function') {
                    await window.loadDashboard();
                }
                break;
        }
        
    } else {
        console.log("No teacher logged in. Showing login screen.");
        // បង្ហាញផ្ទាំង Login (បើមាន)
        if (typeof window.showLoginScreen === 'function') {
            window.showLoginScreen();
        }
    }
});

// =====================================================================
// មុខងារសម្រាប់ពេលចុចលើ Menu នីមួយៗ (Sidebar Click Handlers)
// =====================================================================
window.navigateTo = async function(menuName) {
    // រក្សាទុកទីតាំងចុងក្រោយ ដើម្បីពេល Refresh នៅដដែល
    localStorage.setItem('activeMenu', menuName);
    
    // បិទ/បើក UI តាម Menu (សន្មតថាអ្នកមានកូដលាក់/បង្ហាញ div រួចហើយ)
    document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
    const targetView = document.getElementById(menuName + 'View');
    if(targetView) targetView.classList.remove('hidden');

    // 🟢 ហៅមុខងារ Load ទិន្នន័យភ្លាមៗពេលចុច Menu 🟢
    if (menuName === 'attendance' && typeof window.loadAttendanceView === 'function') {
        await window.loadAttendanceView();
    } else if (menuName === 'scores' && typeof window.loadScoresView === 'function') {
        await window.loadScoresView();
    } else if (menuName === 'students' && typeof window.loadStudentView === 'function') {
        await window.loadStudentView();
    }
};