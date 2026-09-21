// ==========================================
// ឯកសារ js/settings.js - ផ្ទាំងកំណត់ទូទៅ (Global Settings Manager)
// ==========================================

// --- អនុគមន៍ជំនួយ: ទាញយក Settings ទៅកាន់អថេរសកល (Global Variable) ---
window.loadGlobalSettings = function() {
    let savedSettings = localStorage.getItem("school_settings");
    if (savedSettings) {
        try {
            window.appSettings = JSON.parse(savedSettings);
        } catch (e) {
            console.error("កំហុសក្នុងការអាន Settings ពី LocalStorage:", e);
            window.appSettings = {};
        }
    } else {
        window.appSettings = {};
    }
};
// ហៅអនុគមន៍នេះភ្លាមពេល file នេះដំណើរការ ដើម្បីឱ្យផ្ទាំងផ្សេងមានទិន្នន័យប្រើប្រាស់
window.loadGlobalSettings();

window.formatSettingsSolarDate = function() {
    const loc = document.getElementById('set_solar_location') ? document.getElementById('set_solar_location').value.trim() : 'ភ្នំពេញ';
    const dateVal = document.getElementById('set_solar_picker') ? document.getElementById('set_solar_picker').value : '';
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

    let formattedDate = `ធ្វើនៅ${loc || '...'}, ថ្ងៃទី.........ខែ..................ឆ្នាំ២០២....`;
    
    if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
            const day = toKhmerNum(d.getDate().toString().padStart(2, '0'));
            const month = khmerMonths[d.getMonth()];
            const year = toKhmerNum(d.getFullYear().toString());
            formattedDate = `ធ្វើនៅ${loc || '...'}, ថ្ងៃទី${day} ខែ${month} ឆ្នាំ${year}`;
        }
    }
    
    const hiddenInput = document.getElementById('set_solar_date');
    if(hiddenInput) hiddenInput.value = formattedDate;
    
    const preview = document.getElementById('setSolarPreview');
    if(preview) preview.innerText = formattedDate;
};

window.loadSettingsView = function() {
    const container = document.getElementById("settingsContainer") || document.getElementById("mainContentArea") || document.getElementById("appView");
    if (!container) {
        console.error("រកមិនឃើញ ID: settingsContainer ទេ!");
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-8 animate-fade-in font-siemreap pb-20">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between relative overflow-hidden border border-slate-700">
           <div class="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
           <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>
           <div class="relative z-10">
             <h2 class="text-2xl md:text-3xl font-black font-moul mb-3 tracking-wide drop-shadow-md">ការកំណត់ទូទៅនៃប្រព័ន្ធ</h2>
             <p class="text-sm md:text-base text-indigo-200 font-medium">គ្រប់គ្រងព័ត៌មានសាលារៀន គ្រូបង្រៀន រូបភាពផ្លូវការ និងប្រព័ន្ធទិន្នន័យ</p>
           </div>
           <div class="w-16 h-16 md:w-20 md:h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-inner relative z-10 backdrop-blur-md">
             <i class="fa-solid fa-gears text-indigo-100"></i>
           </div>
        </div>

        <form id="settingsForm" onsubmit="window.handleSaveSettings(event)" class="space-y-8">
           
           <!-- ១. ព័ត៌មានសាលារៀន -->
           <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition duration-300">
               <h3 class="font-bold text-slate-800 border-b-2 border-slate-100 pb-4 mb-6 text-lg flex items-center gap-3">
                   <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-school"></i></div>
                   ១. ព័ត៌មានសាលារៀន
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">ឈ្មោះសាលារៀន (ខ្មែរ) *</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-graduation-cap text-slate-400"></i></div>
                         <input type="text" id="set_school_name" required placeholder="ឧ. សាលាបឋមសិក្សាគំរូ" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-moul text-blue-800 text-[13px] shadow-sm transition">
                     </div>
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">ឈ្មោះសាលារៀន (អង់គ្លេស)</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-language text-slate-400"></i></div>
                         <input type="text" id="set_school_en" placeholder="ឧ. Kumro Primary School" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium shadow-sm transition">
                     </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">លេខកូដសាលា</label>
                         <input type="text" id="set_school_code" placeholder="ឧ. KPS" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono uppercase shadow-sm transition text-center">
                      </div>
                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">ឆ្នាំសិក្សា *</label>
                         <input type="text" id="set_academic_year" required placeholder="២០២៦-២០២៧" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-center shadow-sm transition font-siemreap">
                      </div>
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">ប្រភេទសាលា</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-layer-group text-slate-400"></i></div>
                         <select id="set_school_type" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold shadow-sm transition appearance-none cursor-pointer font-siemreap">
                           <option value="មត្តេយ្យសិក្សា">មត្តេយ្យសិក្សា</option>
                           <option value="បឋមសិក្សា">បឋមសិក្សា</option>
                           <option value="អនុវិទ្យាល័យ">អនុវិទ្យាល័យ</option>
                           <option value="វិទ្យាល័យ">វិទ្យាល័យ</option>
                           <option value="ចំណេះទូទៅ">ចំណេះទូទៅ (គ្រប់កម្រិត)</option>
                         </select>
                     </div>
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">នាយក / នាយិកាសាលា *</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-user-tie text-slate-400"></i></div>
                         <input type="text" id="set_principal_name" required placeholder="ឈ្មោះនាយកសាលា" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-slate-800 shadow-sm transition font-moul text-[13px]">
                     </div>
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">ទំនាក់ទំនង (ទូរស័ព្ទ ឬ អ៊ីមែល)</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-phone text-slate-400"></i></div>
                         <input type="text" id="set_school_contact" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono shadow-sm transition font-siemreap">
                     </div>
                  </div>

                  <div class="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-100 shadow-inner">
                     <div>
                       <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">រាជធានី / ខេត្ត</label>
                       <input type="text" id="set_province" placeholder="ខេត្ត..." class="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-siemreap">
                     </div>
                     <div>
                       <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">ក្រុង / ស្រុក / ខណ្ឌ</label>
                       <input type="text" id="set_district" placeholder="ស្រុក..." class="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-siemreap">
                     </div>
                     <div>
                       <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">ឃុំ / សង្កាត់</label>
                       <input type="text" id="set_commune" placeholder="ឃុំ..." class="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-siemreap">
                     </div>
                     <div>
                       <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">ភូមិ</label>
                       <input type="text" id="set_village" placeholder="ភូមិ..." class="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-siemreap">
                     </div>
                  </div>
               </div>
           </div>

           <!-- ២. ព័ត៌មានអ្នកប្រើប្រាស់ -->
           <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition duration-300">
               <h3 class="font-bold text-slate-800 border-b-2 border-slate-100 pb-4 mb-6 text-lg flex items-center gap-3">
                   <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-chalkboard-user"></i></div>
                   ២. ព័ត៌មានគ្រូបន្ទុកថ្នាក់
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">ឈ្មោះគ្រូបង្រៀន *</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-user text-slate-400"></i></div>
                         <input type="text" id="set_teacher_name" required placeholder="ឧ. ហឿន មីនា" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold text-emerald-700 shadow-sm transition font-moul text-[13px]">
                     </div>
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">លេខទូរស័ព្ទ / តេឡេក្រាម</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-brands fa-telegram text-slate-400"></i></div>
                         <input type="text" id="set_teacher_phone" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-mono shadow-sm transition font-siemreap">
                     </div>
                  </div>
                  <div class="flex gap-4">
                     <div class="w-1/2">
                        <label class="block text-xs font-bold text-slate-600 mb-2">ថ្នាក់ទី</label>
                        <select id="set_teacher_level" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold shadow-sm cursor-pointer appearance-none font-siemreap">
                           <option value="ថ្នាក់ទី ១">ទី ១</option><option value="ថ្នាក់ទី ២">ទី ២</option><option value="ថ្នាក់ទី ៣">ទី ៣</option>
                           <option value="ថ្នាក់ទី ៤">ទី ៤</option><option value="ថ្នាក់ទី ៥">ទី ៥</option><option value="ថ្នាក់ទី ៦">ទី ៦</option>
                           <option value="ថ្នាក់ទី ៧">ទី ៧</option><option value="ថ្នាក់ទី ៨">ទី ៨</option><option value="ថ្នាក់ទី ៩">ទី ៩</option>
                           <option value="ថ្នាក់ទី ១០">ទី ១០</option><option value="ថ្នាក់ទី ១១">ទី ១១</option><option value="ថ្នាក់ទី ១២">ទី ១២</option>
                        </select>
                     </div>
                     <div class="w-1/2">
                        <label class="block text-xs font-bold text-slate-600 mb-2">បន្ទប់</label>
                        <select id="set_teacher_room" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold text-center shadow-sm cursor-pointer appearance-none font-siemreap">
                           <option value="«ក»">«ក»</option><option value="«ខ»">«ខ»</option>
                           <option value="«គ»">«គ»</option><option value="«ឃ»">«ឃ»</option>
                        </select>
                     </div>
                  </div>
               </div>
           </div>

           <!-- ៣. ចំណូលចិត្តប្រព័ន្ធ -->
           <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition duration-300">
               <h3 class="font-bold text-slate-800 border-b-2 border-slate-100 pb-4 mb-6 text-lg flex items-center gap-3">
                   <div class="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-sliders"></i></div>
                   ៣. ចំណូលចិត្តប្រព័ន្ធ (System Preferences)
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div class="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition">
                    <div>
                      <h4 class="font-bold text-slate-700 flex items-center gap-2 font-siemreap"><i class="fa-solid fa-cloud-arrow-up text-purple-500"></i> ស្វ័យប្រវត្តិ Sync ទិន្នន័យ</h4>
                      <p class="text-[11px] text-slate-500 mt-1 font-siemreap">រក្សាទុកទៅ Cloud ពេលមានអ៊ីនធឺណិត</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="set_auto_sync" class="sr-only peer" checked>
                      <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition">
                    <div class="w-1/2">
                      <h4 class="font-bold text-slate-700 flex items-center gap-2 font-siemreap"><i class="fa-solid fa-star-half-stroke text-amber-500"></i> ទម្រង់វាយតម្លៃ</h4>
                      <p class="text-[11px] text-slate-500 mt-1 font-siemreap">ជ្រើសរើសរបៀបបង្ហាញនិទ្ទេស</p>
                    </div>
                    <select id="set_grade_format" class="w-1/2 bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none text-xs font-bold text-purple-700 shadow-sm cursor-pointer font-siemreap">
                      <option value="khmer">ល្អ - ខ្សោយ</option>
                      <option value="english">A - F</option>
                    </select>
                  </div>
                  
                  <div class="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition">
                    <div class="w-1/2">
                      <h4 class="font-bold text-slate-700 flex items-center gap-2 font-siemreap"><i class="fa-solid fa-calculator text-blue-500"></i> ពិន្ទុអតិបរមា</h4>
                      <p class="text-[11px] text-slate-500 mt-1 font-siemreap">កំណត់ទំហំពិន្ទុពេញសម្រាប់មុខវិជ្ជា</p>
                    </div>
                    <select id="set_max_score" class="w-1/2 bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none text-xs font-bold text-blue-700 shadow-sm cursor-pointer font-siemreap">
                      <option value="100">១០០ ពិន្ទុ</option>
                      <option value="50">៥០ ពិន្ទុ</option>
                    </select>
                  </div>

                  <!-- ការកំណត់កាលបរិច្ឆេទលំនាំដើម -->
                  <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 pt-6 border-t border-slate-100">
                     <div class="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                       <label class="block text-[11px] font-bold text-amber-700 mb-2 flex items-center gap-2 font-siemreap"><i class="fa-solid fa-moon"></i> កាលបរិច្ឆេទចន្ទគតិ (លំនាំដើម)</label>
                       <input type="text" id="set_lunar_date" placeholder="ថ្ងៃព្រហស្បតិ៍ ១កើត ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០" class="w-full bg-white border border-amber-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none font-siemreap font-bold text-xs shadow-sm transition text-amber-900">
                     </div>
                     <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative">
                       <label class="block text-[11px] font-bold text-blue-700 mb-2 flex items-center justify-between gap-2 font-siemreap">
                           <span class="flex items-center gap-2"><i class="fa-solid fa-sun"></i> កាលបរិច្ឆេទសូរិយគតិ (លំនាំដើម)</span>
                           <span id="setSolarPreview" class="text-[9px] text-blue-500 bg-blue-100 px-2 py-0.5 rounded shadow-sm"></span>
                       </label>
                       <div class="flex gap-2">
                           <input type="text" id="set_solar_location" placeholder="ទីតាំង (ឧ. ភ្នំពេញ)" class="w-1/3 bg-white border border-blue-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-siemreap font-bold text-xs shadow-sm transition text-blue-900" oninput="window.formatSettingsSolarDate()">
                           <input type="date" id="set_solar_picker" value="${today}" class="w-2/3 bg-white border border-blue-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-siemreap font-bold text-xs shadow-sm transition text-blue-900 cursor-pointer" onchange="window.formatSettingsSolarDate()">
                       </div>
                       <input type="hidden" id="set_solar_date">
                     </div>
                  </div>

               </div>
           </div>

           <!-- ៤. រូបភាពផ្លូវការ -->
           <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition duration-300">
               <h3 class="font-bold text-slate-800 border-b-2 border-slate-100 pb-4 mb-6 text-lg flex items-center gap-3 font-siemreap">
                   <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-image"></i></div>
                   ៤. រូបភាពផ្លូវការ (សម្រាប់បោះពុម្ពឯកសារផ្សេងៗ)
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  
                  <div class="border-2 border-slate-100 rounded-3xl p-6 text-center bg-slate-50/50 shadow-sm relative hover:border-indigo-300 hover:bg-indigo-50/30 transition duration-300 group">
                      <label class="block text-sm font-bold text-slate-700 mb-4 flex items-center justify-center gap-2 font-siemreap"><i class="fa-solid fa-shield-cat text-indigo-500"></i> ឡូហ្គោសាលា</label>
                      <div class="w-28 h-28 mx-auto mb-5 border-2 border-dashed border-slate-300 group-hover:border-indigo-400 rounded-full p-2 bg-white flex items-center justify-center overflow-hidden transition shadow-inner">
                          <img id="preview_logo" src="https://via.placeholder.com/150?text=Logo" class="w-full h-full object-contain" alt="Logo">
                      </div>
                      <label class="block w-full bg-white border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-sm font-siemreap">
                          <i class="fa-solid fa-upload mr-1"></i> ជ្រើសរើសឡូហ្គោ
                          <input type="file" accept="image/png, image/jpeg" onchange="window.handleLocalImagePreview(this, 'preview_logo', 'val_logo')" class="hidden">
                      </label>
                      <input type="hidden" id="val_logo">
                  </div>

                  <div class="border-2 border-slate-100 rounded-3xl p-6 text-center bg-slate-50/50 shadow-sm relative hover:border-emerald-300 hover:bg-emerald-50/30 transition duration-300 group">
                      <label class="block text-sm font-bold text-slate-700 mb-4 flex items-center justify-center gap-2 font-siemreap"><i class="fa-solid fa-signature text-emerald-500"></i> ហត្ថលេខានាយក</label>
                      <div class="w-36 h-28 mx-auto mb-5 border-2 border-dashed border-slate-300 group-hover:border-emerald-400 rounded-2xl p-2 bg-white flex items-center justify-center overflow-hidden transition shadow-inner">
                          <img id="preview_sig" src="https://via.placeholder.com/150?text=Signature" class="w-full h-full object-contain" alt="Signature">
                      </div>
                      <label class="block w-full bg-white border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-sm font-siemreap">
                          <i class="fa-solid fa-upload mr-1"></i> ជ្រើសរើសហត្ថលេខា
                          <input type="file" accept="image/png" onchange="window.handleLocalImagePreview(this, 'preview_sig', 'val_sig')" class="hidden">
                      </label>
                      <p class="text-[9px] text-slate-400 mt-3 font-medium font-siemreap">* គួរប្រើរូបភាព .PNG ផ្ទៃថ្លា (Transparent)</p>
                      <input type="hidden" id="val_sig">
                  </div>

                  <div class="border-2 border-slate-100 rounded-3xl p-6 text-center bg-slate-50/50 shadow-sm relative hover:border-amber-300 hover:bg-amber-50/30 transition duration-300 group">
                      <label class="block text-sm font-bold text-slate-700 mb-4 flex items-center justify-center gap-2 font-siemreap"><i class="fa-regular fa-id-badge text-amber-500"></i> ស៊ុមប័ណ្ណសរសើរ</label>
                      <div class="w-36 h-28 mx-auto mb-5 border-2 border-dashed border-slate-300 group-hover:border-amber-400 rounded-2xl p-2 bg-white flex items-center justify-center overflow-hidden transition shadow-inner">
                          <img id="preview_frame" src="https://via.placeholder.com/150?text=Frame" class="w-full h-full object-contain" alt="Frame">
                      </div>
                      <label class="block w-full bg-white border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 text-amber-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-sm font-siemreap">
                          <i class="fa-solid fa-upload mr-1"></i> ជ្រើសរើសស៊ុម
                          <input type="file" accept="image/png, image/jpeg" onchange="window.handleLocalImagePreview(this, 'preview_frame', 'val_frame')" class="hidden">
                      </label>
                      <input type="hidden" id="val_frame">
                  </div>

               </div>
           </div>

           <!-- ៥. គ្រប់គ្រងទិន្នន័យ -->
           <div class="bg-rose-50/50 p-6 md:p-8 rounded-3xl shadow-sm border border-rose-100">
               <h3 class="font-bold text-rose-900 border-b-2 border-rose-100 pb-4 mb-6 text-lg flex items-center gap-3 font-siemreap">
                   <div class="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-database"></i></div>
                   ៥. គ្រប់គ្រងទិន្នន័យ (Data Management)
               </h3>
               <div class="flex flex-wrap gap-4 items-center font-siemreap">
                  <button type="button" onclick="window.exportBackupData()" class="px-6 py-3 bg-white border border-rose-200 text-rose-700 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center gap-2">
                    <i class="fa-solid fa-download"></i> ទាញយកទិន្នន័យ (Backup)
                  </button>
                  
                  <label class="px-6 py-3 bg-white border border-teal-200 text-teal-700 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-50 hover:border-teal-300 transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-upload"></i> នាំចូលទិន្នន័យ (Restore)
                    <input type="file" accept=".json" class="hidden" onchange="window.importBackupData(event)">
                  </label>

                  <div class="w-px h-10 bg-rose-200 mx-2 hidden md:block"></div>

                  <button type="button" onclick="window.clearLocalCacheWithConfirm()" class="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                    <i class="fa-solid fa-trash-can"></i> លុបសម្អាត Cache ទាំងអស់
                  </button>
               </div>
               <p class="text-xs text-rose-500 mt-4 bg-white/60 inline-block px-3 py-1.5 rounded-lg border border-rose-100 font-siemreap">* ប្រសិនបើកម្មវិធីមានបញ្ហា លោកគ្រូអាចចុច "លុបសម្អាត Cache" ដើម្បីឱ្យប្រព័ន្ធទាញទិន្នន័យស្រស់ៗពី Server មកវិញដោយស្វ័យប្រវត្តិ។</p>
           </div>

           <!-- Submit Button -->
           <div class="flex justify-end pt-4 sticky bottom-6 z-50">
              <button type="submit" id="btnSaveSettings" class="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 flex items-center gap-3 text-base border border-indigo-500 font-siemreap">
                 <i class="fa-solid fa-floppy-disk text-xl"></i> <span>រក្សាទុកការកំណត់ទាំងអស់</span>
              </button>
           </div>
        </form>
      </div>
    `;

    window.fillSettingsForm();
};

// ២. បំពេញទិន្នន័យពីអថេរ appSettings ចូលទៅក្នុង Form វិញ
window.fillSettingsForm = function() {
    const s = typeof appSettings !== 'undefined' ? appSettings : {};
    
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
    
    setVal("set_school_name", s.school_name);
    setVal("set_school_en", s.school_en);
    setVal("set_school_code", s.school_code);
    setVal("set_school_type", s.school_type || "បឋមសិក្សា");
    setVal("set_principal_name", s.principal_name);
    setVal("set_academic_year", s.academic_year);
    setVal("set_school_contact", s.school_contact);
    
    setVal("set_province", s.province);
    setVal("set_district", s.district);
    setVal("set_commune", s.commune);
    setVal("set_village", s.village);
    
    setVal("set_teacher_name", s.teacher_name);
    setVal("set_teacher_phone", s.teacher_phone);
    setVal("set_teacher_level", s.teacher_level || "ថ្នាក់ទី ១");
    setVal("set_teacher_room", s.teacher_room || "«ក»");

    if(document.getElementById("set_auto_sync")) document.getElementById("set_auto_sync").checked = s.auto_sync !== false;
    setVal("set_grade_format", s.grade_format || "khmer");
    setVal("set_max_score", s.max_score || "100");
    
    // កាលបរិច្ឆេទលំនាំដើម
    setVal("set_lunar_date", s.lunar_date);
    setVal("set_solar_location", s.solar_location || "ភ្នំពេញ");
    
    const defaultDate = new Date().toISOString().split('T')[0];
    setVal("set_solar_picker", s.solar_picker_date || defaultDate);
    
    // ដំណើរការ format ថ្ងៃខែ
    if(typeof window.formatSettingsSolarDate === 'function') window.formatSettingsSolarDate();

    // បំពេញរូបភាព
    if (s.logo_url) {
        const preview = document.getElementById("preview_logo");
        if(preview) preview.src = s.logo_url;
        setVal("val_logo", s.logo_url);
    }
    if (s.signature_url) {
        const preview = document.getElementById("preview_sig");
        if(preview) preview.src = s.signature_url;
        setVal("val_sig", s.signature_url);
    }
    if (s.frame_url) {
        const preview = document.getElementById("preview_frame");
        if(preview) preview.src = s.frame_url;
        setVal("val_frame", s.frame_url);
    }
};

// ៣. អនុគមន៍សម្រាប់បម្លែងរូបភាពទៅជាទិន្នន័យ (Base64)
window.handleLocalImagePreview = function(inputEl, previewId, hiddenId) {
    const file = inputEl.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("⚠️ សូមជ្រើសរើសរូបភាពដែលមានទំហំតូចជាង 2MB ដើម្បីកុំឱ្យធ្ងន់ប្រព័ន្ធ!");
        inputEl.value = "";
        return;
    }

    const previewImg = document.getElementById(previewId);
    if(previewImg) previewImg.classList.add("opacity-50", "animate-pulse");

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Str = e.target.result;
        if(previewImg) {
            previewImg.src = base64Str;
            previewImg.classList.remove("opacity-50", "animate-pulse");
        }
        document.getElementById(hiddenId).value = base64Str; 
    };
    reader.readAsDataURL(file);
};

// ៤. អនុគមន៍រក្សាទុកពេលចុច Submit Form
window.handleSaveSettings = async function(event) {
    event.preventDefault();
    const btn = document.getElementById("btnSaveSettings");
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-xl"></i> <span>កំពុងរក្សាទុក...</span>`;
    btn.disabled = true;
    btn.classList.add("opacity-90", "cursor-not-allowed");

    const payload = {
        school_name: document.getElementById("set_school_name").value.trim(),
        school_en: document.getElementById("set_school_en").value.trim(),
        school_code: document.getElementById("set_school_code").value.trim(),
        school_type: document.getElementById("set_school_type").value,
        principal_name: document.getElementById("set_principal_name").value.trim(),
        academic_year: document.getElementById("set_academic_year").value.trim(),
        school_contact: document.getElementById("set_school_contact").value.trim(),
        
        province: document.getElementById("set_province").value.trim(),
        district: document.getElementById("set_district").value.trim(),
        commune: document.getElementById("set_commune").value.trim(),
        village: document.getElementById("set_village").value.trim(),
        
        teacher_name: document.getElementById("set_teacher_name").value.trim(),
        teacher_phone: document.getElementById("set_teacher_phone").value.trim(),
        teacher_level: document.getElementById("set_teacher_level").value,
        teacher_room: document.getElementById("set_teacher_room").value,
        
        auto_sync: document.getElementById("set_auto_sync").checked,
        grade_format: document.getElementById("set_grade_format").value,
        max_score: document.getElementById("set_max_score").value,
        
        lunar_date: document.getElementById("set_lunar_date").value.trim(),
        solar_date: document.getElementById("set_solar_date").value.trim(),
        solar_location: document.getElementById("set_solar_location").value.trim(),
        solar_picker_date: document.getElementById("set_solar_picker").value,

        logo_url: document.getElementById("val_logo").value,
        signature_url: document.getElementById("val_sig").value,
        frame_url: document.getElementById("val_frame").value
    };

    try {
        // Update global variable
        window.appSettings = payload;

        // រក្សាទុកចូល LocalStorage (Offline-First)
        localStorage.setItem("school_settings", JSON.stringify(window.appSettings));
        
        // ធ្វើបច្ចុប្បន្នភាពឈ្មោះនៅលើ Sidebar (បើមាន function នោះ)
        window.updateUIWithSettings();

        // បញ្ជូនទៅ Server
        if (typeof apiPost === "function" && window.appSettings.auto_sync) {
           await apiPost("updateSettings", { data: payload });
        }
        
        if(typeof showToast === 'function') showToast("✅ រក្សាទុកការកំណត់បានជោគជ័យ!");
        else alert("✅ រក្សាទុកការកំណត់បានជោគជ័យ!");
        
    } catch (error) {
        console.error(error);
        alert("❌ មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ។ សូមពិនិត្យមើលអ៊ីនធឺណិតរបស់អ្នក។");
    } finally {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        btn.classList.remove("opacity-90", "cursor-not-allowed");
    }
};

// ៥. មុខងារ Update UI ក្រោយពេល Save
window.updateUIWithSettings = function() {
    const s = window.appSettings;
    
    // Update School Name in Sidebar Header
    const sidebarTitle = document.getElementById("sidebarSchoolName");
    if(sidebarTitle && s.school_name) sidebarTitle.textContent = s.school_name;

    // Update Academic Year in Sidebar
    const sidebarYear = document.getElementById("sidebarAcademicYear");
    if(sidebarYear && s.academic_year) sidebarYear.textContent = "ឆ្នាំសិក្សា: " + s.academic_year;

    // Update School Logo
    const sidebarLogo = document.getElementById("sidebarLogo");
    if(sidebarLogo && s.logo_url) sidebarLogo.src = s.logo_url;
};

// ៦. មុខងារ Backup ទាញយកទិន្នន័យជាឯកសារ JSON
window.exportBackupData = function() {
    const data = {
        settings: JSON.parse(localStorage.getItem("school_settings") || "{}"),
        students: JSON.parse(localStorage.getItem("academic_students") || "[]"),
        examScores: JSON.parse(localStorage.getItem("academic_scores") || "[]"),
        academicData: JSON.parse(localStorage.getItem("academic_data") || "{}"),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SchoolApp_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ៧. មុខងារ Restore នាំចូលទិន្នន័យពីឯកសារ JSON
window.importBackupData = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.settings) {
                localStorage.setItem("school_settings", JSON.stringify(data.settings));
                window.appSettings = data.settings;
            }
            if (data.students) {
                localStorage.setItem("academic_students", JSON.stringify(data.students));
            }
            if (data.examScores) {
                localStorage.setItem("academic_scores", JSON.stringify(data.examScores));
            }
            if (data.academicData) {
                localStorage.setItem("academic_data", JSON.stringify(data.academicData));
            }
            
            alert("✅ នាំចូលទិន្នន័យបានជោគជ័យ! ប្រព័ន្ធនឹងផ្ទុកឡើងវិញ (Reload)។");
            window.location.reload();
        } catch (error) {
            alert("❌ ឯកសារមិនត្រឹមត្រូវ ឬមានបញ្ហាក្នុងការនាំចូលទិន្នន័យ!");
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
};

// ៨. មុខងារលុប Cache ដែលមានការបញ្ជាក់ច្បាស់លាស់
window.clearLocalCacheWithConfirm = function() {
    if(confirm("⚠️ តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបសម្អាតទិន្នន័យបណ្តោះអាសន្ន (Cache) មែនទេ?\n\nបញ្ជាក់៖ ប្រព័ន្ធនឹងទាមទារទាញយកទិន្នន័យថ្មីពី Server ម្តងទៀតនៅពេលចុច OK។")) {
        localStorage.removeItem('academic_scores');
        localStorage.removeItem('academic_students');
        localStorage.removeItem('academic_data');
        if(typeof showToast === 'function') showToast("🧹 បានសម្អាត Cache ដោយជោគជ័យ!");
        setTimeout(() => window.location.reload(), 1500);
    }
};

// អនុវត្ត Update UI ដំបូងពេលផ្ទុក
setTimeout(() => {
    if (typeof window.updateUIWithSettings === "function") window.updateUIWithSettings();
}, 500);