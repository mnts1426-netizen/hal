document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  function updateOnlineStatus() {
    const banner = document.getElementById("offline-banner");
    if (banner) {
      banner.style.display = navigator.onLine ? "none" : "block";
    }
  }
  updateOnlineStatus();

  const PERMISSIONS = {
    MANAGE_ADMINS: "manage_admins",
    MANAGE_SETTINGS: "manage_settings",
    VIEW_AUDIT_LOGS: "view_audit_logs",
    MANAGE_SUPERVISORS: "manage_supervisors",
    MANAGE_TEACHERS: "manage_teachers",
    MANAGE_STUDENTS: "manage_students",
    MANAGE_CIRCLES: "manage_circles",
    MANAGE_TRACKS: "manage_tracks",
    VIEW_DASHBOARD: "view_dashboard",
    VIEW_REPORTS: "view_reports",
    RECORD_ATTENDANCE: "record_attendance",
    MANAGE_ALL_RECORDS: "manage_all_records",
  };

  const ROLE_PERMISSIONS = {
    admin: Object.values(PERMISSIONS).filter(
      (p) => p !== PERMISSIONS.RECORD_ATTENDANCE,
    ),
    supervisor: [
      PERMISSIONS.MANAGE_STUDENTS,
      PERMISSIONS.MANAGE_TEACHERS,
      PERMISSIONS.MANAGE_CIRCLES,
      PERMISSIONS.MANAGE_TRACKS,
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.MANAGE_ALL_RECORDS,
    ],
    teacher: [
      PERMISSIONS.RECORD_ATTENDANCE,
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.MANAGE_STUDENTS, // تم إضافة صلاحية إدارة الطلاب للمعلم
    ],
  };

  function hasPermission(role, permissionName) {
    return (ROLE_PERMISSIONS[role] || []).includes(permissionName);
  }

  const PROGRAM_START_DATE = new Date("2026-07-19");

  const PROGRAM_DATES = [
    "الأحد 19 يوليو (5 صفر)",
    "الإثنين 20 يوليو (6 صفر)",
    "الثلاثاء 21 يوليو (7 صفر)",
    "الأربعاء 22 يوليو (8 صفر)",
    "الخميس 23 يوليو (9 صفر)",
    "السبت 25 يوليو (11 صفر)",
    "الأحد 26 يوليو (12 صفر)",
    "الإثنين 27 يوليو (13 صفر)",
    "الثلاثاء 28 يوليو (14 صفر)",
    "الأربعاء 29 يوليو (15 صفر)",
    "الخميس 30 يوليو (16 صفر)",
    "السبت 1 أغسطس (18 صفر)",
    "الأحد 2 أغسطس (19 صفر)",
    "الإثنين 3 أغسطس (20 صفر)",
    "الثلاثاء 4 أغسطس (21 صفر)",
    "الأربعاء 5 أغسطس (22 صفر)",
    "الخميس 6 أغسطس (23 صفر)",
    "السبت 8 أغسطس (25 صفر)",
    "الأحد 9 أغسطس (26 صفر)",
    "الإثنين 10 أغسطس (27 صفر)",
    "الثلاثاء 11 أغسطس (28 صفر)",
    "الأربعاء 12 أغسطس (29 صفر)",
    "الخميس 13 أغسطس (1 ربيع الأول)",
  ];

  function getDateLabel(dayIndex) {
    if (dayIndex >= 1 && dayIndex <= 23) return PROGRAM_DATES[dayIndex - 1];
    return `اليوم ${dayIndex}`;
  }

  function getCurrentProgramDay() {
    const today = new Date();
    let dayCount = 0;
    let currentDate = new Date(PROGRAM_START_DATE);
    currentDate.setHours(0, 0, 0, 0);
    const compareToday = new Date(today);
    compareToday.setHours(0, 0, 0, 0);

    while (currentDate <= compareToday) {
      if (currentDate.getDay() !== 5) {
        dayCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dayCount > 0 ? (dayCount > 23 ? 23 : dayCount) : 1;
  }

  const tracksDefinition = [
    {
      id: "t1",
      name: "بلوغ المرام - النصف الأول",
      totalDays: 23,
      totalHadiths: 729,
    },
    {
      id: "t2",
      name: "مختصر الجمع بين الصحيحين - المجلد 1 (النصف 1)",
      totalDays: 23,
      totalHadiths: 514,
    },
    {
      id: "t3",
      name: "بلوغ المرام - الثلث الأول",
      totalDays: 23,
      totalHadiths: 597,
    },
    {
      id: "t4",
      name: "مختصر الجمع بين الصحيحين - المجلد 1 كاملاً",
      totalDays: 23,
      totalHadiths: 1089,
    },
    { id: "t5", name: "عمدة الأحكام كاملاً", totalDays: 23, totalHadiths: 431 },
    {
      id: "t6",
      name: "عمدة الأحكام - النصف الأول",
      totalDays: 23,
      totalHadiths: 222,
    },
    { id: "t7", name: "بلوغ المرام كاملاً", totalDays: 23, totalHadiths: 1564 },
  ];

  const memArrays = {
    t1: [
      [1, 9],
      [10, 38],
      [39, 81],
      [82, 128],
      [129, 165],
      [166, 210],
      [211, 253],
      [254, 285],
      [286, 321],
      [322, 355],
      [356, 397],
      [398, 440],
      [441, 489],
      [490, 531],
      [532, 583],
      [584, 615],
      [616, 651],
      [652, 690],
      [691, 729],
    ],
    t2: [
      [1, 18],
      [19, 40],
      [41, 79],
      [80, 103],
      [104, 127],
      [128, 150],
      [151, 163],
      [164, 173],
      [174, 183],
      [184, 201],
      [202, 234],
      [235, 265],
      [266, 299],
      [300, 336],
      [337, 365],
      [366, 397],
      [398, 441],
      [442, 486],
      [487, 514],
    ],
    t3: [
      [1, 29],
      [30, 60],
      [61, 96],
      [97, 129],
      [130, 159],
      [160, 192],
      [193, 223],
      [224, 258],
      [259, 283],
      [284, 316],
      [317, 339],
      [340, 377],
      [378, 410],
      [411, 440],
      [441, 473],
      [474, 500],
      [501, 532],
      [533, 563],
      [564, 597],
    ],
    t4: [
      [1, 43],
      [44, 108],
      [109, 151],
      [152, 181],
      [182, 224],
      [225, 299],
      [300, 366],
      [367, 424],
      [425, 493],
      [494, 553],
      [554, 620],
      [621, 678],
      [679, 743],
      [744, 807],
      [808, 857],
      [858, 915],
      [916, 986],
      [987, 1039],
      [1040, 1089],
    ],
    t5: [
      [1, 24],
      [25, 52],
      [53, 72],
      [73, 97],
      [98, 122],
      [123, 142],
      [143, 162],
      [163, 183],
      [184, 211],
      [212, 231],
      [232, 257],
      [258, 285],
      [286, 311],
      [312, 330],
      [331, 347],
      [348, 362],
      [363, 385],
      [386, 403],
      [404, 431],
    ],
    t6: [
      [1, 12],
      [13, 20],
      [21, 30],
      [31, 43],
      [44, 52],
      [53, 63],
      [64, 72],
      [73, 85],
      [86, 98],
      [99, 112],
      [113, 125],
      [126, 136],
      [137, 146],
      [147, 157],
      [158, 163],
      [164, 177],
      [178, 185],
      [186, 207],
      [208, 222],
    ],
    t7: [
      [1, 95],
      [96, 186],
      [187, 272],
      [273, 349],
      [350, 439],
      [440, 530],
      [531, 614],
      [615, 689],
      [690, 763],
      [764, 848],
      [849, 923],
      [924, 1009],
      [1010, 1088],
      [1089, 1162],
      [1163, 1234],
      [1235, 1315],
      [1316, 1404],
      [1405, 1474],
      [1475, 1564],
    ],
  };

  const scheduleData = {};
  tracksDefinition.forEach((t) => {
    let activeIdx = 0;
    let trackSchedule = [];
    const memArr = memArrays[t.id];

    for (let i = 0; i < 23; i++) {
      if (i === 5 || i === 11 || i === 17) {
        trackSchedule.push({
          day: i + 1,
          mem: "مراجعة الأسبوع السابق",
          cons: "لا يوجد",
          rev: "لا يوجد",
        });
      } else if (i === 22) {
        trackSchedule.push({
          day: i + 1,
          mem: "مراجعة سرد واختبار",
          cons: "لا يوجد",
          rev: "لا يوجد",
        });
      } else {
        let mem = memArr[activeIdx];
        let cons = activeIdx > 0 ? memArr[activeIdx - 1] : null;
        let rev = activeIdx >= 5 ? memArr[activeIdx - 5] : null;
        trackSchedule.push({
          day: i + 1,
          mem: mem ? `ح ${mem[0]} إلى ${mem[1]}` : "لا يوجد",
          cons: cons ? `ح ${cons[0]} إلى ${cons[1]}` : "لا يوجد",
          rev: rev ? `ح ${rev[0]} إلى ${rev[1]}` : "لا يوجد",
        });
        activeIdx++;
      }
    }
    scheduleData[t.id] = trackSchedule;
  });

  function getTaskText(trackId, taskType, dayIndex) {
    if (dayIndex <= 0) return "لا يوجد";
    const sched = window.db.scheduleData[trackId];
    if (sched && sched[dayIndex - 1]) return sched[dayIndex - 1][taskType];
    return `مقرر ${getDateLabel(dayIndex)}`;
  }

  function extractMaxNum(text) {
    if (!text || text.includes("لا يوجد") || text.includes("مراجعة")) return 0;
    const nums = text.match(/\d+/g);
    return nums ? Math.max(...nums.map(Number)) : 0;
  }

  // المزامنة السحابية
  async function initDB() {
    try {
      const studentsSnap = await dbFirestore.collection("students").get();
      const circlesSnap = await dbFirestore.collection("groups").get();
      const usersSnap = await dbFirestore.collection("users").get();
      const recordsSnap = await dbFirestore.collection("dailyRecords").get();
      const logsSnap = await dbFirestore.collection("auditLogs").get();

      let loadedStudents = studentsSnap.docs.map((doc) => doc.data());
      let loadedCircles = circlesSnap.docs.map((doc) => doc.data());
      let loadedRecords = recordsSnap.docs.map((doc) => doc.data());
      let loadedLogs = logsSnap.docs.map((doc) => doc.data());

      let loadedUsers = { admin: [], supervisor: [], teacher: [] };
      usersSnap.docs.forEach((doc) => {
        let u = doc.data();
        if (loadedUsers[u.role]) loadedUsers[u.role].push(u);
      });

      if (loadedUsers.admin.length === 0) {
        loadedUsers = {
          admin: [{ id: "a1", name: "أ. عبدالله", role: "admin", pin: "0000" }],
          supervisor: [],
          teacher: [],
        };
        loadedCircles = [];
        loadedStudents = [];
      }

      window.db = {
        tracks: tracksDefinition,
        scheduleData: scheduleData,
        circles: loadedCircles,
        students: loadedStudents,
        users: loadedUsers,
        dailyRecords: loadedRecords,
        auditLogs: loadedLogs,
      };

      localStorage.setItem("wathbah_db", JSON.stringify(window.db));
      if (loadedUsers.admin.length === 0) saveDB();
    } catch (e) {
      console.warn("استخدام النسخة المحلية للبيانات بسبب انقطاع الاتصال.", e);
      const stored = localStorage.getItem("wathbah_db");
      if (stored) {
        window.db = JSON.parse(stored);
        window.db.tracks = tracksDefinition;
        window.db.scheduleData = scheduleData;
      } else {
        window.db = {
          tracks: tracksDefinition,
          scheduleData: scheduleData,
          circles: [],
          students: [],
          users: {
            admin: [
              { id: "a1", name: "أ. عبدالله", role: "admin", pin: "0000" },
            ],
            supervisor: [],
            teacher: [],
          },
          dailyRecords: [],
          auditLogs: [],
        };
      }
    }
  }

  async function saveDB() {
    localStorage.setItem("wathbah_db", JSON.stringify(window.db));
    try {
      if (typeof dbFirestore !== "undefined") {
        window.db.students.forEach((s) =>
          dbFirestore.collection("students").doc(s.id).set(s),
        );
        window.db.circles.forEach((c) =>
          dbFirestore.collection("groups").doc(c.id).set(c),
        );
        Object.values(window.db.users)
          .flat()
          .forEach((u) => dbFirestore.collection("users").doc(u.id).set(u));
        window.db.dailyRecords.forEach((r) =>
          dbFirestore
            .collection("dailyRecords")
            .doc(r.studentId + "_" + r.date)
            .set(r),
        );
        window.db.auditLogs.slice(0, 50).forEach((l, idx) =>
          dbFirestore
            .collection("auditLogs")
            .doc("log_" + idx)
            .set(l),
        );
      }
    } catch (err) {
      console.warn("سيتم الرفع عند عودة الإنترنت.");
    }
  }

  let currentUser = null;
  let isGlobalManualMode = false;

  function addLog(actionDesc, targetCircle) {
    window.db.auditLogs.unshift({
      time: new Date().toLocaleString("ar-SA"),
      user: currentUser ? currentUser.name : "نظام",
      role: currentUser
        ? currentUser.role === "admin"
          ? "مدير"
          : currentUser.role === "supervisor"
            ? "مشرف"
            : "معلم"
        : "-",
      action: actionDesc,
      circle: targetCircle || "عام",
    });
    saveDB();
    renderLogs();
  }

  function renderLogs() {
    const tbody = document.getElementById("audit-logs-body");
    if (!tbody) return;
    tbody.innerHTML = window.db.auditLogs
      .map(
        (l) => `
      <tr><td dir="ltr" style="font-size:0.85rem; color:var(--text-gray);">${l.time}</td>
      <td style="font-weight:bold;">${l.user} <span style="font-size:0.75rem; color:gray;">(${l.role})</span></td>
      <td>${l.action}</td><td><span class="badge" style="background:#f1f5f9; color:var(--primary-blue);">${l.circle}</span></td></tr>
    `,
      )
      .join("");
  }

  const loginScreen = document.getElementById("login-screen");
  const mainApp = document.getElementById("main-app-content");
  const roleSelect = document.getElementById("role-select");
  const userSelect = document.getElementById("user-select");
  const loginPasswordGroup = document.getElementById("login-password-group");
  const loginPasswordInput = document.getElementById("login-password");
  const submitBtn = document.getElementById("btn-submit");

  function checkSession() {
    const sessionStr = localStorage.getItem("wathbah_session");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (Date.now() - session.loginTime < 5 * 60 * 60 * 1000)
          return session.user;
        else localStorage.removeItem("wathbah_session");
      } catch (e) {}
    }
    return null;
  }

  function doLogin(user) {
    currentUser = user;
    localStorage.setItem(
      "wathbah_session",
      JSON.stringify({ user: currentUser, loginTime: Date.now() }),
    );
    loginScreen.style.display = "none";
    mainApp.style.display = "flex";
    document.getElementById("current-user-name").textContent = currentUser.name;

    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.style.display = hasPermission(
        currentUser.role,
        btn.getAttribute("data-permission"),
      )
        ? "flex"
        : "none";
    });

    if (document.getElementById("add-supervisor-card"))
      document.getElementById("add-supervisor-card").style.display =
        hasPermission(currentUser.role, PERMISSIONS.MANAGE_SUPERVISORS)
          ? "block"
          : "none";
    if (document.getElementById("add-teacher-card"))
      document.getElementById("add-teacher-card").style.display = hasPermission(
        currentUser.role,
        PERMISSIONS.MANAGE_TEACHERS,
      )
        ? "block"
        : "none";
    if (document.getElementById("report-filter-group"))
      document.getElementById("report-filter-group").style.display =
        currentUser.role === "teacher" ? "none" : "block";
    if (document.getElementById("teachers-management-section"))
      document.getElementById("teachers-management-section").style.display =
        hasPermission(currentUser.role, PERMISSIONS.MANAGE_TEACHERS)
          ? "block"
          : "none";

    const firstBtn = document.querySelector('.nav-btn[style*="display: flex"]');
    if (firstBtn) firstBtn.click();

    const todayIso = new Date().toISOString().split("T")[0];
    document.getElementById("report-date-input").value = todayIso;
    if (document.getElementById("admin-record-date"))
      document.getElementById("admin-record-date").value = todayIso;

    refreshAllViews();
  }

  setTimeout(async () => {
    const loader = document.getElementById("global-loader");
    if (loader) {
      if (typeof dbFirestore !== "undefined") await initDB();
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
        const sessionUser = checkSession();
        if (sessionUser) doLogin(sessionUser);
        else loginScreen.style.display = "flex";
      }, 500);
    }
  }, 600);

  roleSelect.addEventListener("change", function () {
    const users = window.db.users[this.value] || [];
    userSelect.innerHTML =
      '<option value="" disabled selected>تحديد حساب...</option>';
    users.forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      opt.dataset.userObj = JSON.stringify(u);
      userSelect.appendChild(opt);
    });
    userSelect.disabled = false;
    submitBtn.disabled = true;
    loginPasswordGroup.style.display = "none";
    loginPasswordInput.disabled = true;
  });

  userSelect.addEventListener("change", () => {
    submitBtn.disabled = false;
    loginPasswordGroup.style.display = "block";
    loginPasswordInput.disabled = false;
    loginPasswordInput.value = "";
    loginPasswordInput.focus();
  });

  document
    .getElementById("login-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const user = JSON.parse(
        userSelect.options[userSelect.selectedIndex].dataset.userObj,
      );
      const enteredPin = loginPasswordInput.value;
      if (user.pin && user.pin !== enteredPin)
        return alert("الرقم السري غير صحيح!");
      submitBtn.innerHTML = "جاري التحقق...";
      submitBtn.disabled = true;
      setTimeout(() => {
        doLogin(user);
        submitBtn.innerHTML = "دخول";
        submitBtn.disabled = false;
        loginPasswordInput.value = "";
        addLog("تسجيل الدخول للنظام", "عام");
      }, 400);
    });

  const navButtons = document.querySelectorAll(".nav-btn");
  const appSections = document.querySelectorAll(".app-section");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      navButtons.forEach((b) => b.classList.remove("active"));
      appSections.forEach((sec) => sec.classList.remove("active"));
      this.classList.add("active");
      document
        .getElementById(this.getAttribute("data-target"))
        .classList.add("active");
      if (this.getAttribute("data-target") === "manage-circles")
        refreshCirclesManager();
    });
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    addLog("تسجيل الخروج", "عام");
    localStorage.removeItem("wathbah_session");
    currentUser = null;
    mainApp.style.display = "none";
    loginScreen.style.display = "flex";
    roleSelect.value = "";
    userSelect.innerHTML =
      '<option value="" disabled selected>تحديد حساب...</option>';
    userSelect.disabled = true;
    submitBtn.disabled = true;
    loginPasswordGroup.style.display = "none";
    loginPasswordInput.disabled = true;
  });

  function refreshAllViews() {
    renderTracks();
    renderStudents();
    renderTeachers();
    updateDynamicDropdowns();
    updateDashboardStats();
    updateSupportInfo();
    if (currentUser && currentUser.role === "teacher") renderDailyTracking("");
    else renderAdminRecords();
    generateReport();
    updateTopBanner();
    refreshCirclesManager();
    renderLogs();
  }

  if (document.getElementById("admin-student-search"))
    document
      .getElementById("admin-student-search")
      .addEventListener("input", () => renderAdminRecords());
  if (document.getElementById("admin-teacher-search"))
    document
      .getElementById("admin-teacher-search")
      .addEventListener("input", () => renderTeachers());

  function updateSupportInfo() {
    const supportDiv = document.getElementById("dynamic-support-info");
    if (!supportDiv) return;
    if (currentUser.role === "teacher") {
      supportDiv.innerHTML = `<div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); border-right: 3px solid var(--primary-blue);"><strong>🏢 التواصل مع الإدارة:</strong> <br /><span style="color: var(--text-gray); font-size:0.85rem;">يرجى التواصل مع المشرف المباشر لحلقتك أو إدارة المجمع لأي استفسارات إدارية وأكاديمية.</span></div>`;
    } else if (currentUser.role === "supervisor") {
      supportDiv.innerHTML = `<div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); border-right: 3px solid var(--primary-blue);"><strong>👑 التواصل مع المدير:</strong> <br /><span style="color: var(--text-gray); font-size:0.85rem;">يرجى التواصل مع مدير المجمع لاعتماد القرارات أو رفع الملاحظات الشاملة.</span></div>`;
    } else if (currentUser.role === "admin") {
      supportDiv.innerHTML = `<div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #e2e8f0; border-right: 3px solid var(--gold-text);"><strong style="color: var(--primary-blue);">⚙️ الدعم الفني للنظام (مطور النظام):</strong> <br /><span style="color: var(--text-gray); font-size:0.85rem;">لأي تعديلات أو دعم فني مخصص للنظام، يرجى التواصل مباشرة.</span><br/><a href="https://wa.me/966537466925" target="_blank" style="display:inline-block; margin-top:8px; background: #25D366; color:white; padding:6px 12px; border-radius:4px; text-decoration: none; font-weight:bold; font-size:0.85rem;">💬 تواصل عبر واتساب: 966537466925+</a></div>`;
    }
  }

  if (document.getElementById("support-message-form")) {
    document
      .getElementById("support-message-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        alert("تم إرسال رسالتك أو ملاحظتك بنجاح! سيتم مراجعتها في أقرب وقت.");
        e.target.reset();
      });
  }

  function updateTopBanner() {
    const banner = document.getElementById("daily-target-banner");
    if (!banner) return;
    const currentDay = getCurrentProgramDay();
    const trackId = "t1";
    banner.innerHTML = `
      <div class="banner-header"><span class="daily-target-icon">📅</span> <strong>مقرر اليوم: ${getDateLabel(currentDay)}</strong></div>
      <div class="banner-details" style="margin-top:5px;">
        <div><strong>📖 حفظ:</strong> ${getTaskText(trackId, "mem", currentDay)}</div>
        <div><strong>🔄 تثبيت:</strong> ${getTaskText(trackId, "cons", currentDay)}</div>
        <div><strong>🔁 مراجعة:</strong> ${getTaskText(trackId, "rev", currentDay)}</div>
      </div>
    `;
  }

  function updateDashboardStats() {
    const dashGrid = document.getElementById("main-dashboard-grid");
    if (!dashGrid) return;

    const isTeacher = currentUser.role === "teacher";
    const students = isTeacher
      ? window.db.students.filter((s) => s.circleId === currentUser.circleId)
      : window.db.students;
    const circlesCount = window.db.circles.length;
    const today = new Date().toISOString().split("T")[0];
    const todaysRecords = window.db.dailyRecords.filter(
      (r) => r.date === today && students.find((s) => s.id === r.studentId),
    );

    const attendanceCount = todaysRecords.filter(
      (r) => r.attendance === "present",
    ).length;
    const attendanceRate =
      students.length > 0
        ? Math.round((attendanceCount / students.length) * 100)
        : 0;
    const targetDay = getCurrentProgramDay();
    const totalProgress = students.reduce(
      (acc, s) =>
        acc +
        (s.progress.mem.length +
          s.progress.cons.length +
          s.progress.rev.length),
      0,
    );
    let avgProgress =
      students.length > 0 && targetDay > 0
        ? Math.round((totalProgress / (targetDay * 3 * students.length)) * 100)
        : 0;
    if (avgProgress > 100) avgProgress = 100;

    if (isTeacher) {
      dashGrid.innerHTML = `<div class="stat-card"><h3>طلاب حلقتي</h3><p class="stat-value">${students.length}</p></div><div class="stat-card gold"><h3>نسبة حضور الطلاب</h3><p class="stat-value">${attendanceRate}%</p></div><div class="stat-card gold"><h3>متوسط إنجاز المنهج</h3><p class="stat-value">${avgProgress}%</p></div>`;
    } else {
      dashGrid.innerHTML = `<div class="stat-card"><h3>الطلاب المسجلين</h3><p class="stat-value">${students.length}</p></div><div class="stat-card"><h3>الحلقات المسجلة</h3><p class="stat-value">${circlesCount}</p></div><div class="stat-card gold"><h3>نسبة حضور الطلاب</h3><p class="stat-value">${attendanceRate}%</p></div><div class="stat-card gold"><h3>متوسط إنجاز المنهج</h3><p class="stat-value">${avgProgress}%</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>المرحلة الابتدائية</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "الابتدائية").length}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>المرحلة المتوسطة</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "المتوسطة").length}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>المرحلة الثانوية</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "الثانوية").length}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>المرحلة الجامعية</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "الجامعة").length}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>أعلى من ذلك</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "أعلى من ذلك").length}</p></div>`;
    }
  }

  function updateDynamicDropdowns() {
    const trackDropdown = document.getElementById("stu-track");
    if (trackDropdown) {
      trackDropdown.innerHTML =
        '<option value="" disabled selected>اختر المسار...</option>';
      window.db.tracks.forEach(
        (t) =>
          (trackDropdown.innerHTML += `<option value="${t.id}">${t.name}</option>`),
      );
    }
    const newCircleTrack = document.getElementById("new-circle-track");
    if (newCircleTrack) {
      newCircleTrack.innerHTML =
        '<option value="" disabled selected>اختر المسار المخصص للحلقة...</option>';
      // إضافة خيار حلقة عامة
      newCircleTrack.innerHTML +=
        '<option value="all" style="font-weight:bold; color:var(--primary-blue);">🌍 جميع المسارات (حلقة عامة)</option>';
      window.db.tracks.forEach(
        (t) =>
          (newCircleTrack.innerHTML += `<option value="${t.id}">${t.name}</option>`),
      );
    }
    const newCircleTeacher = document.getElementById("new-circle-teacher");
    if (newCircleTeacher) {
      newCircleTeacher.innerHTML =
        '<option value="" disabled selected>اختر المعلم...</option>';
      window.db.users.teacher.forEach(
        (t) =>
          (newCircleTeacher.innerHTML += `<option value="${t.id}">${t.name}</option>`),
      );
    }
    const assignCircleSelect = document.getElementById("assign-circle-select");
    if (assignCircleSelect) {
      assignCircleSelect.innerHTML =
        '<option value="" disabled selected>اختر الحلقة...</option>';
      window.db.circles.forEach(
        (c) =>
          (assignCircleSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`),
      );
    }
    const reportFilter = document.getElementById("report-circle-filter");
    if (reportFilter) {
      reportFilter.innerHTML = '<option value="all">كافة الحلقات</option>';
      window.db.circles.forEach((c) => {
        reportFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    }
  }

  // فلترة الحلقات بذكاء عند اختيار المسار في شاشة إضافة طالب
  const stuTrackSelect = document.getElementById("stu-track");
  const stuCircleSelect = document.getElementById("stu-circle");
  if (stuTrackSelect && stuCircleSelect) {
    stuTrackSelect.addEventListener("change", (e) => {
      const selectedTrack = e.target.value;
      stuCircleSelect.innerHTML =
        '<option value="" disabled selected>اختر الحلقة المناسبة للطالب...</option>';

      const matchingCircles = window.db.circles.filter(
        (c) => c.trackId === selectedTrack || c.trackId === "all",
      );

      if (matchingCircles.length === 0) {
        stuCircleSelect.innerHTML +=
          '<option value="" disabled>لا توجد حلقات لهذا المسار حالياً</option>';
      } else {
        matchingCircles.forEach((c) => {
          let typeLabel =
            c.trackId === "all" ? " (حلقة عامة)" : " (مخصصة للمسار)";
          stuCircleSelect.innerHTML += `<option value="${c.id}">${c.name}${typeLabel}</option>`;
        });
      }
    });
  }

  const addTrackForm = document.getElementById("add-track-form");
  if (addTrackForm) {
    addTrackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const trackName = document.getElementById("track-name-input").value;
      const newId = "t" + Date.now();
      window.db.tracks.push({
        id: newId,
        name: trackName,
        totalDays: 23,
        totalHadiths: 150,
      });
      window.db.scheduleData[newId] = Array.from({ length: 23 }, (_, i) => ({
        day: i + 1,
        mem: "",
        cons: "",
        rev: "",
      }));
      e.target.reset();
      saveDB();
      refreshAllViews();
      alert("تم حفظ المسار!");
      addLog(`إنشاء مسار جديد: ${trackName}`, "عام");
    });
  }

  const addStudentForm = document.getElementById("add-student-form");
  if (addStudentForm) {
    addStudentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const sName = document.getElementById("stu-name").value;
      const sTrackId = document.getElementById("stu-track").value;
      const selectedCircleId = document.getElementById("stu-circle").value;

      window.db.students.push({
        id: "s" + Date.now(),
        name: sName,
        idNumber: document.getElementById("stu-id-number").value,
        phone: document.getElementById("stu-phone").value,
        pin: document.getElementById("stu-pin").value,
        level: document.getElementById("stu-level").value,
        trackId: sTrackId,
        circleId: selectedCircleId,
        progress: { mem: [], cons: [], rev: [] },
        manualProgress: { mem: "", cons: "", rev: "" },
        detailedProgress: { mem: [], cons: [], rev: [] },
      });

      e.target.reset();
      stuCircleSelect.innerHTML =
        '<option value="" disabled selected>اختر المسار أولاً لتظهر الحلقات...</option>';
      saveDB();
      refreshAllViews();

      const cName =
        window.db.circles.find((c) => c.id === selectedCircleId)?.name ||
        "غير موزع";
      alert(`تم تسجيل الطالب بنجاح وإضافته إلى: ${cName}`);
      addLog(`تسجيل طالب وتوزيعه: ${sName}`, cName);
    });
  }

  const addTeacherForm = document.getElementById("add-teacher-form");
  if (addTeacherForm) {
    addTeacherForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const tName = document.getElementById("teacher-name").value;
      window.db.users.teacher.push({
        id: "tech" + Date.now(),
        name: tName,
        pin: document.getElementById("teacher-pin").value,
        circleId: "",
        role: "teacher",
      });
      e.target.reset();
      saveDB();
      refreshAllViews();
      alert("تم تسجيل المعلم!");
      addLog(`إضافة معلم جديد: ${tName}`, "عام");
    });
  }

  const newCircleForm = document.getElementById("new-circle-form");
  if (newCircleForm) {
    newCircleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const circleId = "c" + Date.now();
      const circleName = document.getElementById("new-circle-name").value;
      const trackId = document.getElementById("new-circle-track").value;
      const teacherId = document.getElementById("new-circle-teacher").value;

      window.db.circles.push({
        id: circleId,
        name: circleName,
        teacherId: teacherId,
        trackId: trackId,
      });

      const teacher = window.db.users.teacher.find((t) => t.id === teacherId);
      if (teacher) teacher.circleId = circleId;

      e.target.reset();
      saveDB();
      refreshAllViews();
      alert("تم تأسيس الحلقة بنجاح!");
      addLog(`تأسيس حلقة جديدة`, circleName);
    });
  }

  const assignCircleSelect = document.getElementById("assign-circle-select");
  if (assignCircleSelect) {
    assignCircleSelect.addEventListener("change", function () {
      const circleId = this.value;
      const listDiv = document.getElementById("unassigned-students-list");
      listDiv.innerHTML = "";
      const selectedCircle = window.db.circles.find((c) => c.id === circleId);
      if (!selectedCircle) return;

      const matchingStudents = window.db.students.filter(
        (s) =>
          s.trackId === selectedCircle.trackId ||
          selectedCircle.trackId === "all",
      );

      if (matchingStudents.length === 0) {
        listDiv.innerHTML =
          '<p style="color:gray; font-size:0.85rem; text-align:center;">لا يوجد طلاب مسجلين يناسبون هذه الحلقة.</p>';
        return;
      }
      matchingStudents.forEach((s) => {
        const isChecked = s.circleId === circleId ? "checked" : "";
        listDiv.innerHTML += `
          <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; cursor:pointer; background:#fff; padding:6px; border:1px solid #e2e8f0; border-radius:4px;">
            <input type="checkbox" name="assign_student" value="${s.id}" style="width:16px; height:16px; accent-color:var(--primary-blue);" ${isChecked}> 
            <span style="font-weight:600; font-size:0.85rem;">${s.name}</span> <span style="color:var(--text-gray); font-size:0.75rem;">(${s.level})</span>
          </label>`;
      });
    });
  }

  const assignStudentsForm = document.getElementById("assign-students-form");
  if (assignStudentsForm) {
    assignStudentsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const circleId = assignCircleSelect.value;
      if (!circleId) return alert("الرجاء اختيار الحلقة أولاً");
      const c = window.db.circles.find((x) => x.id === circleId);
      const checkboxes = assignStudentsForm.querySelectorAll(
        'input[name="assign_student"]',
      );
      checkboxes.forEach((chk) => {
        const student = window.db.students.find((s) => s.id === chk.value);
        if (student) {
          if (chk.checked) student.circleId = circleId;
          else if (student.circleId === circleId) student.circleId = "";
        }
      });
      saveDB();
      refreshAllViews();
      alert("تم حفظ قائمة طلاب الحلقة!");
      addLog(`تحديث قائمة طلاب الحلقة`, c ? c.name : "");
    });
  }

  function refreshCirclesManager() {
    const tbody = document.getElementById("circles-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    window.db.circles.forEach((c, i) => {
      let trackName = "جميع المسارات (عامة)";
      if (c.trackId !== "all") {
        const track = window.db.tracks.find((t) => t.id === c.trackId);
        trackName = track ? track.name : "غير محدد";
      }
      const teacher = window.db.users.teacher.find(
        (t) => t.id === c.teacherId,
      ) || { name: "غير معين" };
      const studentCount = window.db.students.filter(
        (s) => s.circleId === c.id,
      ).length;
      tbody.innerHTML += `<tr><td>${i + 1}</td><td style="font-weight:700;">${c.name}</td><td><span class="badge" style="background:#f1f5f9; color:var(--primary-blue);">${trackName}</span></td><td>${teacher.name}</td><td style="color:var(--primary-blue); font-weight:bold;">${studentCount} طلاب</td>
      <td><button class="btn-action" onclick="openEditModal('circle', '${c.id}')">تعديل الحلقة</button></td></tr>`;
    });
  }

  function renderTracks() {
    const tbody = document.getElementById("tracks-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    window.db.tracks.forEach(
      (t, i) =>
        (tbody.innerHTML += `<tr><td>${i + 1}</td><td style="font-weight:700;">${t.name}</td>
    <td><button class="btn-action" onclick="openEditModal('track', '${t.id}')">تعديل الاسم</button><button class="btn-action" style="background:var(--primary-light); color:var(--primary-blue); margin-right:5px;" onclick="openScheduleModal('${t.id}')">تعديل المقررات</button></td></tr>`),
    );
  }

  // دالة الحذف العامة
  window.deleteStudent = function (studentId) {
    if (
      confirm(
        "⚠️ تحذير: هل أنت متأكد من رغبتك في حذف هذا الطالب نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.",
      )
    ) {
      const student = window.db.students.find((s) => s.id === studentId);
      window.db.students = window.db.students.filter((s) => s.id !== studentId);
      // تنظيف سجلاته اليومية أيضاً
      window.db.dailyRecords = window.db.dailyRecords.filter(
        (r) => r.studentId !== studentId,
      );

      saveDB();
      refreshAllViews();
      alert("تم حذف الطالب بنجاح.");
      addLog(`حذف الطالب: ${student ? student.name : "غير معروف"}`, "عام");
    }
  };

  function renderStudents() {
    const tbody = document.getElementById("students-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    // تم إزالة قيد المعلم ليتمكن الجميع من رؤية كامل الطلاب هنا
    let displayStudents = window.db.students;

    displayStudents.forEach((s) => {
      const track = window.db.tracks.find((t) => t.id === s.trackId) || {
        name: "غير محدد",
      };
      const circle = window.db.circles.find((c) => c.id === s.circleId) || {
        name: "غير موزع لحلقة",
      };
      tbody.innerHTML += `<tr><td style="font-weight:700;">${s.name}</td><td>${s.level}</td><td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${track.name}</span></td><td style="color:${circle.name === "غير موزع لحلقة" ? "var(--danger-btn)" : "inherit"}">${circle.name}</td>
      <td>
        <button class="btn-action" onclick="openEditModal('student', '${s.id}')">تعديل</button>
        <button class="btn-action" style="background:var(--danger-btn); color:white; border-color:var(--danger-btn); margin-right:5px;" onclick="deleteStudent('${s.id}')">حذف</button>
      </td></tr>`;
    });
  }

  function renderTeachers() {
    const tbody = document.getElementById("teachers-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const searchVal =
      document.getElementById("admin-teacher-search")?.value.toLowerCase() ||
      "";
    let filteredTeachers = window.db.users.teacher;
    if (searchVal)
      filteredTeachers = filteredTeachers.filter((t) =>
        t.name.toLowerCase().includes(searchVal),
      );

    filteredTeachers.forEach((t) => {
      const circle = window.db.circles.find((c) => c.id === t.circleId) || {
        name: "غير مكلف",
      };
      tbody.innerHTML += `<tr><td style="font-weight:700;">${t.name}</td><td style="letter-spacing: 2px;">${t.pin}</td><td style="color:${circle.name === "غير مكلف" ? "var(--danger-btn)" : "inherit"}">${circle.name}</td>
      <td><button class="btn-action" onclick="openEditModal('teacher', '${t.id}')">تعديل</button></td></tr>`;
    });
  }

  let editingContext = { type: null, id: null };
  window.openEditModal = function (type, id) {
    editingContext = { type, id };
    const modal = document.getElementById("edit-modal");
    const fields = document.getElementById("edit-form-fields");
    fields.innerHTML = "";

    if (type === "student") {
      const s = window.db.students.find((x) => x.id === id);
      document.getElementById("edit-modal-title").textContent =
        "تعديل بيانات الطالب";
      let trackOpts = "";
      window.db.tracks.forEach(
        (t) =>
          (trackOpts += `<option value="${t.id}" ${s.trackId === t.id ? "selected" : ""}>${t.name}</option>`),
      );

      let circleOpts = "<option value=''>غير موزع لحلقة</option>";
      const matchingCircles = window.db.circles.filter(
        (c) => c.trackId === s.trackId || c.trackId === "all",
      );
      matchingCircles.forEach((c) => {
        circleOpts += `<option value="${c.id}" ${s.circleId === c.id ? "selected" : ""}>${c.name}</option>`;
      });

      fields.innerHTML = `
        <div class="input-group"><label>اسم الطالب</label><input type="text" id="edit-stu-name" class="modern-input" value="${s.name}" required></div>
        <div style="display:flex; gap:10px;">
          <div class="input-group" style="flex:1"><label>رقم الهوية</label><input type="text" id="edit-stu-id" class="modern-input" value="${s.idNumber || ""}" required></div>
          <div class="input-group" style="flex:1"><label>رقم الجوال</label><input type="tel" id="edit-stu-phone" class="modern-input" value="${s.phone || ""}" required></div>
        </div>
        <div class="input-group"><label>الرقم السري</label><input type="password" id="edit-stu-pin" class="modern-input" value="${s.pin || "1234"}" maxlength="4" required></div>
        <div class="input-group"><label>المسار</label><select id="edit-stu-track" class="modern-input">${trackOpts}</select></div>
        <div class="input-group"><label>الحلقة</label><select id="edit-stu-circle" class="modern-input">${circleOpts}</select></div>
      `;

      // تفاعل اختيار المسار داخل نافذة التعديل
      setTimeout(() => {
        const eTrack = document.getElementById("edit-stu-track");
        const eCircle = document.getElementById("edit-stu-circle");
        eTrack.addEventListener("change", (e) => {
          const tId = e.target.value;
          eCircle.innerHTML = "<option value=''>غير موزع لحلقة</option>";
          const mCircles = window.db.circles.filter(
            (c) => c.trackId === tId || c.trackId === "all",
          );
          mCircles.forEach((c) => {
            eCircle.innerHTML += `<option value="${c.id}">${c.name}</option>`;
          });
        });
      }, 100);
    } else if (type === "teacher") {
      const t = window.db.users.teacher.find((x) => x.id === id);
      document.getElementById("edit-modal-title").textContent =
        "تعديل بيانات المعلم";
      let cOpts = "<option value=''>غير مكلف بأي حلقة</option>";
      window.db.circles.forEach(
        (c) =>
          (cOpts += `<option value="${c.id}" ${t.circleId === c.id ? "selected" : ""}>${c.name}</option>`),
      );
      fields.innerHTML = `
        <div class="input-group"><label>اسم المعلم</label><input type="text" id="edit-teacher-name" class="modern-input" value="${t.name}" required></div>
        <div class="input-group"><label>الرقم السري</label><input type="text" id="edit-teacher-pin" class="modern-input" value="${t.pin}" pattern="\\d{4}" maxlength="4" required></div>
        <div class="input-group"><label>الحلقة المكلف بها</label><select id="edit-teacher-circle" class="modern-input">${cOpts}</select></div>
      `;
    } else if (type === "track") {
      const t = window.db.tracks.find((x) => x.id === id);
      document.getElementById("edit-modal-title").textContent =
        "تعديل اسم المسار";
      fields.innerHTML = `<div class="input-group"><label>اسم المسار</label><input type="text" id="edit-track-name" class="modern-input" value="${t.name}" required></div>`;
    } else if (type === "circle") {
      const c = window.db.circles.find((x) => x.id === id);
      document.getElementById("edit-modal-title").textContent =
        "تعديل بيانات الحلقة";
      let teacherOpts = "<option value=''>بدون معلم</option>";
      window.db.users.teacher.forEach(
        (t) =>
          (teacherOpts += `<option value="${t.id}" ${c.teacherId === t.id ? "selected" : ""}>${t.name}</option>`),
      );
      let trackOpts =
        "<option value='all' style='font-weight:bold; color:var(--primary-blue);'>🌍 جميع المسارات (حلقة عامة)</option>";
      window.db.tracks.forEach(
        (t) =>
          (trackOpts += `<option value="${t.id}" ${c.trackId === t.id ? "selected" : ""}>${t.name}</option>`),
      );
      fields.innerHTML = `
        <div class="input-group"><label>اسم الحلقة</label><input type="text" id="edit-circle-name" class="modern-input" value="${c.name}" required></div>
        <div class="input-group"><label>المسار المخصص</label><select id="edit-circle-track" class="modern-input">${trackOpts}</select></div>
        <div class="input-group"><label>تغيير المعلم</label><select id="edit-circle-teacher" class="modern-input">${teacherOpts}</select></div>
      `;
    }
    modal.classList.add("active");
  };

  window.closeEditModal = function () {
    document.getElementById("edit-modal").classList.remove("active");
  };

  document.getElementById("edit-modal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (editingContext.type === "student") {
      const s = window.db.students.find((x) => x.id === editingContext.id);
      if (s) {
        s.name = document.getElementById("edit-stu-name").value;
        s.idNumber = document.getElementById("edit-stu-id").value;
        s.phone = document.getElementById("edit-stu-phone").value;
        s.pin = document.getElementById("edit-stu-pin").value;
        s.trackId = document.getElementById("edit-stu-track").value;
        s.circleId = document.getElementById("edit-stu-circle").value;
        addLog(`تعديل بيانات الطالب: ${s.name}`, "عام");
      }
    } else if (editingContext.type === "teacher") {
      const t = window.db.users.teacher.find((x) => x.id === editingContext.id);
      if (t) {
        t.name = document.getElementById("edit-teacher-name").value;
        t.pin = document.getElementById("edit-teacher-pin").value;
        const newCircleId = document.getElementById(
          "edit-teacher-circle",
        ).value;
        if (t.circleId !== newCircleId) {
          if (t.circleId) {
            const oldC = window.db.circles.find((c) => c.id === t.circleId);
            if (oldC) oldC.teacherId = "";
          }
          t.circleId = newCircleId;
          if (newCircleId) {
            const newC = window.db.circles.find((c) => c.id === newCircleId);
            if (newC) {
              if (newC.teacherId && newC.teacherId !== t.id) {
                const oldT = window.db.users.teacher.find(
                  (x) => x.id === newC.teacherId,
                );
                if (oldT) oldT.circleId = "";
              }
              newC.teacherId = t.id;
            }
          }
        }
        addLog(`تعديل بيانات المعلم: ${t.name}`, "عام");
      }
    } else if (editingContext.type === "track") {
      const t = window.db.tracks.find((x) => x.id === editingContext.id);
      if (t) {
        t.name = document.getElementById("edit-track-name").value;
        addLog(`تعديل اسم مسار إلى: ${t.name}`, "عام");
      }
    } else if (editingContext.type === "circle") {
      const c = window.db.circles.find((x) => x.id === editingContext.id);
      if (c) {
        c.name = document.getElementById("edit-circle-name").value;
        c.trackId = document.getElementById("edit-circle-track").value;
        const newTeacherId = document.getElementById(
          "edit-circle-teacher",
        ).value;
        const oldTeacher = window.db.users.teacher.find(
          (t) => t.id === c.teacherId,
        );
        if (oldTeacher) oldTeacher.circleId = "";
        c.teacherId = newTeacherId;
        const newTeacher = window.db.users.teacher.find(
          (t) => t.id === newTeacherId,
        );
        if (newTeacher) newTeacher.circleId = c.id;
        addLog(`تعديل مسار ومعلم الحلقة`, c.name);
      }
    }
    closeEditModal();
    saveDB();
    refreshAllViews();
    alert("تم حفظ التعديلات!");
  });

  let editingScheduleTrackId = null;
  window.openScheduleModal = function (trackId) {
    editingScheduleTrackId = trackId;
    const track = window.db.tracks.find((t) => t.id === trackId);
    document.getElementById("schedule-modal-title").textContent =
      `تعديل مقررات: ${track.name}`;
    const tbody = document.getElementById("schedule-modal-tbody");
    tbody.innerHTML = "";
    const sched = window.db.scheduleData[trackId] || [];
    sched.forEach((item) => {
      tbody.innerHTML += `
        <tr>
          <td style="font-weight:bold; background:var(--primary-light); width:150px; text-align:center;">${getDateLabel(item.day)}</td>
          <td><input type="text" id="sch_mem_${item.day}" value="${item.mem}"></td>
          <td><input type="text" id="sch_cons_${item.day}" value="${item.cons}"></td>
          <td><input type="text" id="sch_rev_${item.day}" value="${item.rev}"></td>
        </tr>
      `;
    });
    document.getElementById("schedule-modal").classList.add("active");
  };

  window.closeScheduleModal = function () {
    document.getElementById("schedule-modal").classList.remove("active");
  };

  document
    .getElementById("schedule-modal-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const sched = window.db.scheduleData[editingScheduleTrackId];
      if (sched) {
        sched.forEach((item) => {
          item.mem = document.getElementById(`sch_mem_${item.day}`).value;
          item.cons = document.getElementById(`sch_cons_${item.day}`).value;
          item.rev = document.getElementById(`sch_rev_${item.day}`).value;
        });
        const t = window.db.tracks.find((x) => x.id === editingScheduleTrackId);
        addLog(`تعديل مقررات المسار`, t ? t.name : "عام");
      }
      closeScheduleModal();
      saveDB();
      refreshAllViews();
      alert("تم تحديث المقررات! وستظهر للمعلمين فوراً.");
    });

  if (document.getElementById("admin-record-date"))
    document
      .getElementById("admin-record-date")
      .addEventListener("change", renderAdminRecords);

  function renderAdminRecords() {
    const tbody = document.getElementById("admin-records-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const currentDay = getCurrentProgramDay();
    const selectedDate =
      document.getElementById("admin-record-date").value ||
      new Date().toISOString().split("T")[0];
    const searchVal =
      document.getElementById("admin-student-search")?.value.toLowerCase() ||
      "";
    let filteredStudents = window.db.students;
    if (searchVal)
      filteredStudents = filteredStudents.filter((s) =>
        s.name.toLowerCase().includes(searchVal),
      );

    filteredStudents.forEach((student) => {
      const circle = window.db.circles.find(
        (c) => c.id === student.circleId,
      ) || { name: "غير موزع" };
      const track = window.db.tracks.find((t) => t.id === student.trackId) || {
        name: "غير محدد",
        totalDays: 23,
      };
      const record = window.db.dailyRecords.find(
        (r) => r.studentId === student.id && r.date === selectedDate,
      );
      const presentRecords = window.db.dailyRecords.filter(
        (r) =>
          r.studentId === student.id &&
          (r.attendance === "present" || r.attendance === "late"),
      ).length;
      let attendancePercent =
        currentDay > 0 ? Math.round((presentRecords / currentDay) * 100) : 0;
      if (attendancePercent > 100) attendancePercent = 100;

      const totalTasks = track.totalDays * 3;
      const completedTasks =
        student.progress.mem.length +
        student.progress.cons.length +
        student.progress.rev.length;
      let progressPercent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      if (progressPercent > 100) progressPercent = 100;

      const selectHtml = `
        <select class="modern-input" style="padding: 0.3rem; min-height: auto; font-size:0.8rem;" onchange="adminUpdateAttendance('${student.id}', this.value)">
          <option value="" disabled ${!record ? "selected" : ""}>لم يحضر</option>
          <option value="present" ${record?.attendance === "present" ? "selected" : ""}>حاضر</option>
          <option value="late" ${record?.attendance === "late" ? "selected" : ""}>متأخر</option>
          <option value="absent" ${record?.attendance === "absent" ? "selected" : ""}>غائب</option>
        </select>
      `;

      tbody.innerHTML += `
        <tr>
          <td style="font-weight:700;">${student.name}</td><td>${student.level}</td>
          <td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${track.name}</span></td>
          <td style="color:${circle.name === "غير موزع" ? "var(--danger-btn)" : "inherit"}">${circle.name}</td>
          <td style="color:${attendancePercent >= 80 ? "#166534" : "#991b1b"}; font-weight:bold;" dir="ltr">${attendancePercent}%</td>
          <td style="color:var(--primary-blue); font-weight:bold;" dir="ltr">${progressPercent}%</td>
          <td>${selectHtml}</td>
          <td>
            <button class="btn-action" onclick="openEditModal('student', '${student.id}')">تعديل</button>
            <button class="btn-action" style="background:var(--danger-btn); color:white; border-color:var(--danger-btn); margin-right:5px;" onclick="deleteStudent('${student.id}')">حذف</button>
          </td>
        </tr>
      `;
    });
  }

  window.adminUpdateAttendance = function (studentId, status) {
    const selectedDate =
      document.getElementById("admin-record-date").value ||
      new Date().toISOString().split("T")[0];
    let existingRecordIndex = window.db.dailyRecords.findIndex(
      (r) => r.studentId === studentId && r.date === selectedDate,
    );
    if (existingRecordIndex > -1)
      window.db.dailyRecords[existingRecordIndex].attendance = status;
    else {
      window.db.dailyRecords.push({
        studentId,
        date: selectedDate,
        attendance: status,
        notes: "تعديل حضور إداري",
        timestamp: Date.now(),
      });
      saveDB();
    }
    const student = window.db.students.find((s) => s.id === studentId);
    const circle = window.db.circles.find((c) => c.id === student?.circleId);
    addLog(
      `تعديل حضور الطالب (${student ? student.name : ""}) ليوم ${selectedDate}`,
      circle ? circle.name : "",
    );
    updateDashboardStats();
    generateReport();
    renderAdminRecords();
  };

  document
    .getElementById("generate-report-btn")
    .addEventListener("click", generateReport);
  function generateReport() {
    const tbody = document.getElementById("reports-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const dateInput = document.getElementById("report-date-input").value;
    document.getElementById("report-table-title").textContent =
      `تقرير الإنجاز والمتابعة (يوم: ${dateInput})`;

    let studentsToReport = window.db.students;
    if (currentUser.role === "teacher")
      studentsToReport = studentsToReport.filter(
        (s) => s.circleId === currentUser.circleId,
      );
    else {
      const filterVal = document.getElementById("report-circle-filter")
        ? document.getElementById("report-circle-filter").value
        : "all";
      if (filterVal && filterVal !== "all")
        studentsToReport = studentsToReport.filter(
          (s) => s.circleId === filterVal,
        );
    }
    const dayRecords = window.db.dailyRecords.filter(
      (r) => r.date === dateInput,
    );

    studentsToReport.forEach((student) => {
      const record = dayRecords.find((r) => r.studentId === student.id);
      const circle = window.db.circles.find(
        (c) => c.id === student.circleId,
      ) || { name: "" };
      let attText = "غير مسجل";
      let attColor = "var(--text-gray)";
      if (record) {
        if (record.attendance === "present") {
          attText = "حاضر";
          attColor = "#166534";
        } else if (record.attendance === "late") {
          attText = "متأخر";
          attColor = "#b45309";
        } else if (record.attendance === "absent") {
          attText = "غائب";
          attColor = "#991b1b";
        }
      }
      const manualStr = student.manualProgress
        ? ` (ح:${student.manualProgress.mem || 0}, ث:${student.manualProgress.cons || 0}, م:${student.manualProgress.rev || 0})`
        : "";
      const timeStr =
        record?.sessionTime && record.sessionTime !== "غير محدد"
          ? ` | وقت: ${record.sessionTime}`
          : "";
      const tasksCompleted = record
        ? `أيام المنهج: ${student.progress.mem.length}/${student.progress.cons.length}/${student.progress.rev.length}${manualStr}${timeStr}`
        : "لا يوجد إنجاز جديد";
      const notesStr = record?.notes || "-";
      tbody.innerHTML += `<tr><td style="font-weight:700;">${student.name}</td><td>${circle.name}</td><td style="color:${attColor}; font-weight:bold;">${attText}</td><td style="font-size:0.8rem;">${tasksCompleted}</td><td>${notesStr}</td></tr>`;
    });
  }

  const searchInput = document.getElementById("student-search-input");
  const trackingContainer = document.getElementById("tracking-cards-container");
  const globalToggleBtn = document.getElementById("global-toggle-btn");
  if (globalToggleBtn) {
    globalToggleBtn.addEventListener("click", () => {
      isGlobalManualMode = !isGlobalManualMode;
      renderDailyTracking(searchInput ? searchInput.value.toLowerCase() : "");
    });
  }
  if (searchInput)
    searchInput.addEventListener("input", (e) => {
      renderDailyTracking(e.target.value.toLowerCase());
    });

  function setupDetailedSync(card, student, type) {
    const manualInput = card.querySelector(`input[name="manual_${type}"]`);
    const detChecks = card.querySelectorAll(
      `input[name="det_${type}_${student.id}"]`,
    );
    const quickChecks = card.querySelectorAll(`input[name^="chk_${type}_"]`);
    if (!manualInput || detChecks.length === 0) return;

    const updateManualFromChecks = () => {
      let max = 0;
      detChecks.forEach((c) => {
        if (c.checked && parseInt(c.value) > max) max = parseInt(c.value);
      });
      manualInput.value = max > 0 ? max : "";
      quickChecks.forEach((chk) => {
        const text = getTaskText(student.trackId, type, chk.value);
        const target = extractMaxNum(text);
        chk.checked = target > 0 && max >= target;
      });
    };
    const updateChecksFromManual = () => {
      let val = parseInt(manualInput.value);
      if (isNaN(val) || val <= 0) {
        detChecks.forEach((c) => (c.checked = false));
        quickChecks.forEach((c) => (c.checked = false));
        return;
      }
      detChecks.forEach((c) => {
        c.checked = parseInt(c.value) <= val;
      });
      quickChecks.forEach((chk) => {
        const text = getTaskText(student.trackId, type, chk.value);
        const target = extractMaxNum(text);
        chk.checked = target > 0 && val >= target;
      });
    };
    const updateFromQuickChecks = () => {
      let maxTarget = 0;
      quickChecks.forEach((c) => {
        if (c.checked) {
          const text = getTaskText(student.trackId, type, c.value);
          const target = extractMaxNum(text);
          if (target > maxTarget) maxTarget = target;
        }
      });
      manualInput.value = maxTarget > 0 ? maxTarget : "";
      detChecks.forEach((c) => {
        c.checked = parseInt(c.value) <= maxTarget;
      });
    };
    manualInput.addEventListener("input", updateChecksFromManual);
    detChecks.forEach((c) =>
      c.addEventListener("change", updateManualFromChecks),
    );
    quickChecks.forEach((c) =>
      c.addEventListener("change", updateFromQuickChecks),
    );
  }

  function renderDailyTracking(searchTerm) {
    if (!trackingContainer) return;
    trackingContainer.innerHTML = "";
    let filteredStudents = window.db.students;
    if (currentUser.role === "teacher")
      filteredStudents = filteredStudents.filter(
        (s) => s.circleId === currentUser.circleId,
      );
    if (searchTerm)
      filteredStudents = filteredStudents.filter((s) =>
        s.name.toLowerCase().includes(searchTerm),
      );

    if (filteredStudents.length === 0) {
      trackingContainer.innerHTML =
        '<p style="text-align:center; color:var(--text-gray);">لا توجد نتائج أو لا يوجد طلاب في هذه الحلقة.</p>';
      return;
    }

    const currentProgramDay = getCurrentProgramDay();
    filteredStudents.forEach((student) => {
      if (!student.manualProgress)
        student.manualProgress = { mem: "", cons: "", rev: "" };
      if (!student.detailedProgress)
        student.detailedProgress = { mem: [], cons: [], rev: [] };

      const today = new Date().toISOString().split("T")[0];
      const record = window.db.dailyRecords.find(
        (r) => r.studentId === student.id && r.date === today,
      );
      let isEditable = true;
      if (record && currentUser.role === "teacher") {
        const hoursPassed = (Date.now() - record.timestamp) / (1000 * 60 * 60);
        if (hoursPassed > 24) isEditable = false;
      }
      const disableStr = isEditable ? "" : "disabled";

      const track = window.db.tracks.find((t) => t.id === student.trackId);
      const totalTrackDays = track ? track.totalDays : 23;
      const totalHadiths =
        track && track.totalHadiths ? track.totalHadiths : 150;

      let maxMem =
        student.progress.mem.length > 0 ? Math.max(...student.progress.mem) : 0;
      let delayDays = currentProgramDay - maxMem;
      let progressBadge = "";
      if (delayDays <= 0)
        progressBadge = `<span class="badge" style="background:#dcfce7; color:#166534; border:1px solid #166534;">🌟 مواكب للخطة</span>`;
      else if (delayDays <= 2)
        progressBadge = `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #b45309;">⚠️ متأخر (${delayDays} يوم)</span>`;
      else
        progressBadge = `<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #991b1b;">🚨 متأخر جداً (${delayDays} يوم)</span>`;

      const statusBadge = record
        ? `<span class="badge saved">تم حفظ إنجاز اليوم</span>`
        : `<span class="badge" style="background:#f8fafc; border:1px solid var(--border-color); color:var(--text-gray);">لم يتم الحفظ</span>`;

      let timelineHTML =
        '<div class="timeline-container"><div class="timeline-scroll">';
      for (let i = 1; i <= totalTrackDays; i++) {
        const memText = getTaskText(student.trackId, "mem", i);
        const consText = getTaskText(student.trackId, "cons", i);
        const revText = getTaskText(student.trackId, "rev", i);
        const isMemChecked = student.progress.mem.includes(i) ? "checked" : "";
        const isConsChecked = student.progress.cons.includes(i)
          ? "checked"
          : "";
        const isRevChecked = student.progress.rev.includes(i) ? "checked" : "";
        let dayClass = "day-column";
        if (i < currentProgramDay) dayClass += " day-past";
        else if (i === currentProgramDay) dayClass += " day-current";
        timelineHTML += `
          <div class="${dayClass}">
            <h4>${getDateLabel(i)}</h4>
            <label class="task-item"><input type="checkbox" name="chk_mem_${i}" value="${i}" ${isMemChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">📖 حفظ:</span><span class="task-desc">${memText}</span></div></label>
            <label class="task-item"><input type="checkbox" name="chk_cons_${i}" value="${i}" ${isConsChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">🔄 تثبيت:</span><span class="task-desc">${consText}</span></div></label>
            <label class="task-item"><input type="checkbox" name="chk_rev_${i}" value="${i}" ${isRevChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">🔁 مراجعة:</span><span class="task-desc">${revText}</span></div></label>
          </div>`;
      }
      timelineHTML += "</div></div>";

      let dropdownHTML = `<details class="dropdown-details"><summary>🔽 عرض تفصيل الأحاديث (تحديد / إلغاء الأحاديث بدقة)</summary><div class="dropdown-content">`;
      let memGrid = `<div class="hadith-grid-container"><h5>📖 أحاديث الحفظ:</h5><div class="hadith-grid">`;
      for (let h = 1; h <= totalHadiths; h++) {
        let checked = student.detailedProgress.mem.includes(h) ? "checked" : "";
        memGrid += `<label class="h-item"><input type="checkbox" name="det_mem_${student.id}" value="${h}" ${checked} ${disableStr}> ${h}</label>`;
      }
      memGrid += `</div></div>`;
      let consGrid = `<div class="hadith-grid-container"><h5>🔄 أحاديث التثبيت:</h5><div class="hadith-grid">`;
      for (let h = 1; h <= totalHadiths; h++) {
        let checked = student.detailedProgress.cons.includes(h)
          ? "checked"
          : "";
        consGrid += `<label class="h-item"><input type="checkbox" name="det_cons_${student.id}" value="${h}" ${checked} ${disableStr}> ${h}</label>`;
      }
      consGrid += `</div></div>`;
      let revGrid = `<div class="hadith-grid-container"><h5>🔁 أحاديث المراجعة:</h5><div class="hadith-grid">`;
      for (let h = 1; h <= totalHadiths; h++) {
        let checked = student.detailedProgress.rev.includes(h) ? "checked" : "";
        revGrid += `<label class="h-item"><input type="checkbox" name="det_rev_${student.id}" value="${h}" ${checked} ${disableStr}> ${h}</label>`;
      }
      revGrid += `</div></div>`;
      dropdownHTML += memGrid + consGrid + revGrid + `</div></details>`;

      let manualInputHTML = `
        <div class="manual-input-grid">
          <div><label>أين وصل في الحفظ؟</label><input type="number" name="manual_mem" class="modern-input" placeholder="رقم الحديث" value="${student.manualProgress.mem}" ${disableStr}></div>
          <div><label>أين وصل في التثبيت؟</label><input type="number" name="manual_cons" class="modern-input" placeholder="رقم الحديث" value="${student.manualProgress.cons}" ${disableStr}></div>
          <div><label>أين وصل في المراجعة؟</label><input type="number" name="manual_rev" class="modern-input" placeholder="رقم الحديث" value="${student.manualProgress.rev}" ${disableStr}></div>
        </div>
      `;

      const card = document.createElement("div");
      card.className = "tracking-card";
      card.innerHTML = `
        <div class="tracking-header"><div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;"><h3 style="margin: 0; color:var(--primary-blue); font-size:1.1rem;">${student.name}</h3>${progressBadge}</div>${statusBadge}</div>
        <form class="daily-track-form" data-student-id="${student.id}">
          <div style="margin-bottom: 1.2rem; display:flex; flex-direction:column; gap:10px;">
            <div class="status-radios"><span style="font-size:0.85rem; font-weight:800; color:var(--primary-blue); margin-left:4px; line-height:2.2;">الحضور:</span>
              <div class="status-radio"><input type="radio" id="present_${student.id}" name="attendance" value="present" ${record?.attendance === "present" ? "checked" : ""} required ${disableStr}><label for="present_${student.id}">حاضر</label></div>
              <div class="status-radio"><input type="radio" id="late_${student.id}" name="attendance" value="late" ${record?.attendance === "late" ? "checked" : ""} ${disableStr}><label for="late_${student.id}">متأخر</label></div>
              <div class="status-radio"><input type="radio" id="absent_${student.id}" name="attendance" value="absent" ${record?.attendance === "absent" ? "checked" : ""} ${disableStr}><label for="absent_${student.id}">غائب</label></div>
            </div>
            <div class="status-radios"><span style="font-size:0.85rem; font-weight:800; color:var(--primary-blue); margin-left:4px; line-height:2.2;">وقت التسميع:</span>
              <div class="status-radio"><input type="radio" id="time_fajr_${student.id}" name="session_time" value="فجر" ${record?.sessionTime === "فجر" ? "checked" : ""} ${disableStr}><label for="time_fajr_${student.id}">بعد الفجر 🌅</label></div>
              <div class="status-radio"><input type="radio" id="time_asr_${student.id}" name="session_time" value="عصر" ${record?.sessionTime === "عصر" ? "checked" : ""} ${disableStr}><label for="time_asr_${student.id}">بعد العصر 🌇</label></div>
              <div class="status-radio"><input type="radio" id="time_none_${student.id}" name="session_time" value="غير محدد" ${!record?.sessionTime || record?.sessionTime === "غير محدد" ? "checked" : ""} ${disableStr}><label for="time_none_${student.id}">غير محدد</label></div>
            </div>
          </div>
          <div style="display: ${isGlobalManualMode ? "none" : "block"};"><p style="font-weight:800; margin-bottom: 0.4rem; color: var(--gold-text); font-size:0.85rem;">الخطة الزمنية (متابعة بالأيام):</p>${timelineHTML}</div>
          <div style="display: ${isGlobalManualMode ? "block" : "none"};"><p style="font-weight:800; margin-bottom: 0.4rem; color: var(--gold-text); font-size:0.85rem;">الإدخال اليدوي الدقيق (متابعة بالأحاديث):</p>${manualInputHTML}${dropdownHTML}</div>
          <div style="margin-bottom: 1rem; margin-top: 0.5rem;"><label style="font-weight:700; display:block; font-size:0.8rem; margin-bottom:3px;">ملاحظات المعلم:</label><input type="text" name="notes" class="modern-input" placeholder="مثال: الطالب متميز اليوم..." value="${record?.notes || ""}" ${disableStr}></div>
          ${isEditable ? `<button type="submit" class="btn-submit" style="width:auto; padding: 0.5rem 1.5rem;">💾 حفظ إنجاز الطالب</button>` : `<p style="color:var(--danger-btn); font-weight:bold; margin:0; font-size:0.85rem;">انتهت فترة التعديل (24 ساعة).</p>`}
        </form>
      `;

      if (isEditable) {
        setupDetailedSync(card, student, "mem");
        setupDetailedSync(card, student, "cons");
        setupDetailedSync(card, student, "rev");
        card
          .querySelector(".daily-track-form")
          .addEventListener("submit", (e) => {
            e.preventDefault();
            const att = e.target.elements["attendance"].value;
            const sTime = e.target.elements["session_time"].value;
            const notes = e.target.elements["notes"].value;
            let newMem = [],
              newCons = [],
              newRev = [];
            for (let i = 1; i <= totalTrackDays; i++) {
              if (
                e.target.elements[`chk_mem_${i}`] &&
                e.target.elements[`chk_mem_${i}`].checked
              )
                newMem.push(i);
              if (
                e.target.elements[`chk_cons_${i}`] &&
                e.target.elements[`chk_cons_${i}`].checked
              )
                newCons.push(i);
              if (
                e.target.elements[`chk_rev_${i}`] &&
                e.target.elements[`chk_rev_${i}`].checked
              )
                newRev.push(i);
            }
            student.progress.mem = newMem;
            student.progress.cons = newCons;
            student.progress.rev = newRev;
            student.manualProgress.mem = e.target.elements["manual_mem"]
              ? e.target.elements["manual_mem"].value
              : "";
            student.manualProgress.cons = e.target.elements["manual_cons"]
              ? e.target.elements["manual_cons"].value
              : "";
            student.manualProgress.rev = e.target.elements["manual_rev"]
              ? e.target.elements["manual_rev"].value
              : "";
            let detMem = [],
              detCons = [],
              detRev = [];
            card
              .querySelectorAll(`input[name="det_mem_${student.id}"]:checked`)
              .forEach((c) => detMem.push(parseInt(c.value)));
            card
              .querySelectorAll(`input[name="det_cons_${student.id}"]:checked`)
              .forEach((c) => detCons.push(parseInt(c.value)));
            card
              .querySelectorAll(`input[name="det_rev_${student.id}"]:checked`)
              .forEach((c) => detRev.push(parseInt(c.value)));
            student.detailedProgress.mem = detMem;
            student.detailedProgress.cons = detCons;
            student.detailedProgress.rev = detRev;

            let existingRecordIndex = window.db.dailyRecords.findIndex(
              (r) => r.studentId === student.id && r.date === today,
            );
            const newRecord = {
              studentId: student.id,
              date: today,
              attendance: att,
              sessionTime: sTime,
              notes,
              timestamp: Date.now(),
            };
            if (existingRecordIndex > -1)
              window.db.dailyRecords[existingRecordIndex] = newRecord;
            else window.db.dailyRecords.push(newRecord);

            saveDB();
            renderDailyTracking(searchInput.value.toLowerCase());
            updateDashboardStats();
            generateReport();
            alert("تم حفظ إنجاز الطالب بنجاح!");
          });
      }
      trackingContainer.appendChild(card);
    });
  }

  const passForm = document.getElementById("password-change-form");
  if (passForm) {
    passForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPin = document.getElementById("new-pin").value;
      const userInDb = window.db.users[currentUser.role].find(
        (u) => u.id === currentUser.id,
      );
      if (userInDb) {
        userInDb.pin = newPin;
        alert("تم تحديث الرقم السري بنجاح!");
        passForm.reset();
        saveDB();
      }
      addLog("تغيير الرقم السري", "عام");
    });
  }
});
