document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => (loader.style.display = "none"), 500);
      document.getElementById("login-screen").style.display = "flex";
    }
  }, 600);

  // ==========================================
  // 1. نظام الصلاحيات
  // ==========================================
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
    admin: Object.values(PERMISSIONS),
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
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.RECORD_ATTENDANCE,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.MANAGE_SETTINGS,
    ],
  };

  function hasPermission(role, permissionName) {
    return (ROLE_PERMISSIONS[role] || []).includes(permissionName);
  }

  // ==========================================
  // 2. قاعدة البيانات والمناهج (الجدول الذكي للتواريخ)
  // ==========================================
  const PROGRAM_START_DATE = new Date("2026-07-19"); // الأحد 5 صفر

  // مصفوفة التواريخ الدقيقة للـ 23 يوماً (باستثناء الجمعة)
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
        // تجاهل الجمعة
        dayCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dayCount > 0 ? (dayCount > 23 ? 23 : dayCount) : 1;
  }

  const tracksDefinition = [
    { id: "t1", name: "بلوغ المرام - النصف الأول", totalDays: 23 },
    {
      id: "t2",
      name: "مختصر الجمع بين الصحيحين - المجلد 1 (النصف 1)",
      totalDays: 23,
    },
    { id: "t3", name: "بلوغ المرام - الثلث الأول", totalDays: 23 },
    {
      id: "t4",
      name: "مختصر الجمع بين الصحيحين - المجلد 1 كاملاً",
      totalDays: 23,
    },
    { id: "t5", name: "عمدة الأحكام كاملاً", totalDays: 23 },
    { id: "t6", name: "عمدة الأحكام - النصف الأول", totalDays: 23 },
    { id: "t7", name: "بلوغ المرام كاملاً", totalDays: 23 },
  ];

  const scheduleData = {};
  tracksDefinition.forEach((t) => {
    scheduleData[t.id] = Array.from({ length: 23 }, (_, i) => ({
      day: i + 1,
      mem: `مقرر الحفظ لـ ${getDateLabel(i + 1)}`,
      cons: `مقرر التثبيت`,
      rev: `مقرر المراجعة`,
    }));
  });

  scheduleData["t1"][0] = {
    day: 1,
    mem: "ح 1 إلى 9 (ص 1-9) - كان يخلل لحيته",
    cons: "لا يوجد",
    rev: "لا يوجد",
  };
  scheduleData["t1"][1] = {
    day: 2,
    mem: "ح 38 إلى 80 (ص 10-18) - أتي بثلثي مد...",
    cons: "ح 1 إلى 9",
    rev: "لا يوجد",
  };

  function getTaskText(trackId, taskType, dayIndex) {
    if (dayIndex <= 0) return "لا يوجد";
    const sched = window.db.scheduleData[trackId];
    if (sched && sched[dayIndex - 1]) return sched[dayIndex - 1][taskType];
    return `مقرر ${getDateLabel(dayIndex)}`;
  }

  window.db = {
    tracks: tracksDefinition,
    scheduleData: scheduleData,
    circles: [{ id: "c1", name: "حلقة الإمام البخاري", teacherId: "tech1" }],
    students: [
      {
        id: "s1",
        name: "عبدالرحمن محمد",
        level: "المتوسطة",
        trackId: "t1",
        circleId: "c1",
        progress: { mem: [1], cons: [], rev: [] },
      },
      {
        id: "s2",
        name: "ياسر سعد",
        level: "الثانوية",
        trackId: "t1",
        circleId: "c1",
        progress: { mem: [], cons: [], rev: [] },
      },
    ],
    users: {
      admin: [{ id: "a1", name: "أ. عبدالله", role: "admin" }],
      supervisor: [
        {
          id: "sup1",
          name: "سعد",
          phone: "0500000000",
          pin: "2222",
          role: "supervisor",
        },
      ],
      teacher: [
        {
          id: "tech1",
          name: "أحمد",
          pin: "1234",
          circleId: "c1",
          role: "teacher",
        },
      ],
    },
    dailyRecords: [],
    auditLogs: [],
  };

  let currentUser = null;

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
  const submitBtn = document.getElementById("btn-submit");

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
  });

  userSelect.addEventListener("change", () => (submitBtn.disabled = false));

  document
    .getElementById("login-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const user = JSON.parse(
        userSelect.options[userSelect.selectedIndex].dataset.userObj,
      );
      submitBtn.innerHTML = "جاري التحقق...";
      submitBtn.disabled = true;

      setTimeout(() => {
        currentUser = user;
        loginScreen.style.display = "none";
        mainApp.style.display = "flex";
        document.getElementById("current-user-name").textContent =
          currentUser.name;

        document.querySelectorAll(".nav-btn").forEach((btn) => {
          btn.style.display = hasPermission(
            currentUser.role,
            btn.getAttribute("data-permission"),
          )
            ? "flex"
            : "none";
        });

        const addSupervisorCard = document.getElementById(
          "add-supervisor-card",
        );
        if (addSupervisorCard) {
          addSupervisorCard.style.display = hasPermission(
            currentUser.role,
            PERMISSIONS.MANAGE_SUPERVISORS,
          )
            ? "block"
            : "none";
        }

        const firstBtn = document.querySelector(
          '.nav-btn[style="display: flex;"]',
        );
        if (firstBtn) firstBtn.click();

        submitBtn.innerHTML = "دخول";
        submitBtn.disabled = false;

        const todayIso = new Date().toISOString().split("T")[0];
        document.getElementById("report-date-input").value = todayIso;
        const adminDateInput = document.getElementById("admin-record-date");
        if (adminDateInput) adminDateInput.value = todayIso;

        refreshAllViews();
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
    currentUser = null;
    mainApp.style.display = "none";
    loginScreen.style.display = "flex";
    roleSelect.value = "";
    userSelect.innerHTML =
      '<option value="" disabled selected>تحديد حساب...</option>';
    userSelect.disabled = true;
    submitBtn.disabled = true;
  });

  function refreshAllViews() {
    renderTracks();
    renderStudents();
    updateDynamicDropdowns();
    updateDashboardStats();
    if (currentUser.role === "teacher") renderDailyTracking("");
    else renderAdminRecords();
    generateReport();
    updateTopBanner();
    refreshCirclesManager();
    renderLogs();
  }

  function updateTopBanner() {
    const banner = document.getElementById("daily-target-banner");
    if (!banner) return;
    const currentDay = getCurrentProgramDay();
    // استخدام المسار الأول كمثال في الشريط (يُفترض لاحقاً سحبه من إعدادات الحلقة إن أردت)
    const trackId = "t1";

    const targetMem = getTaskText(trackId, "mem", currentDay);
    const targetCons = getTaskText(trackId, "cons", currentDay);
    const targetRev = getTaskText(trackId, "rev", currentDay);

    banner.innerHTML = `
      <div class="banner-header"><span class="daily-target-icon">📅</span> <strong>مقرر اليوم: ${getDateLabel(currentDay)}</strong></div>
      <div class="banner-details" style="margin-top:5px;">
        <div><strong>📖 حفظ:</strong> ${targetMem}</div>
        <div><strong>🔄 تثبيت:</strong> ${targetCons}</div>
        <div><strong>🔁 مراجعة:</strong> ${targetRev}</div>
      </div>
    `;
  }

  function updateDashboardStats() {
    const isTeacher = currentUser.role === "teacher";
    const students = isTeacher
      ? window.db.students.filter((s) => s.circleId === currentUser.circleId)
      : window.db.students;
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
      students.length > 0
        ? Math.round((totalProgress / (targetDay * 3 * students.length)) * 100)
        : 0;
    if (avgProgress > 100) avgProgress = 100;

    const dashStudents = document.getElementById("dash-students-count");
    if (dashStudents) {
      dashStudents.textContent = students.length;
      document.getElementById("dash-attendance-rate").textContent =
        attendanceRate + "%";
      document.getElementById("dash-progress-rate").textContent =
        avgProgress + "%";
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
  }

  const addTrackForm = document.getElementById("add-track-form");
  if (addTrackForm) {
    addTrackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const trackName = document.getElementById("track-name-input").value;
      const newId = "t" + Date.now();
      window.db.tracks.push({ id: newId, name: trackName, totalDays: 23 });
      window.db.scheduleData[newId] = Array.from({ length: 23 }, (_, i) => ({
        day: i + 1,
        mem: "",
        cons: "",
        rev: "",
      }));
      e.target.reset();
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
      window.db.students.push({
        id: "s" + Date.now(),
        name: sName,
        level: document.getElementById("stu-level").value,
        trackId: document.getElementById("stu-track").value,
        circleId: "",
        progress: { mem: [], cons: [], rev: [] },
      });
      e.target.reset();
      refreshAllViews();
      alert("تم تسجيل الطالب! توجه لقسم الحلقات لتوزيعه.");
      addLog(`تسجيل طالب جديد: ${sName}`, "عام");
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
      const teacherId = document.getElementById("new-circle-teacher").value;
      window.db.circles.push({
        id: circleId,
        name: circleName,
        teacherId: teacherId,
      });
      const teacher = window.db.users.teacher.find((t) => t.id === teacherId);
      if (teacher) teacher.circleId = circleId;
      e.target.reset();
      refreshAllViews();
      alert("تم تأسيس الحلقة بنجاح!");
      addLog(`تأسيس وتكليف المعلم بالحلقة`, circleName);
    });
  }

  const assignCircleSelect = document.getElementById("assign-circle-select");
  if (assignCircleSelect) {
    assignCircleSelect.addEventListener("change", function () {
      const circleId = this.value;
      const listDiv = document.getElementById("unassigned-students-list");
      listDiv.innerHTML = "";
      if (window.db.students.length === 0) {
        listDiv.innerHTML =
          '<p style="color:gray; font-size:0.85rem; text-align:center;">لا يوجد طلاب.</p>';
        return;
      }
      window.db.students.forEach((s) => {
        const isChecked = s.circleId === circleId ? "checked" : "";
        listDiv.innerHTML += `
          <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; cursor:pointer; background:#fff; padding:6px; border:1px solid #e2e8f0; border-radius:4px;">
            <input type="checkbox" name="assign_student" value="${s.id}" style="width:16px; height:16px; accent-color:var(--primary-blue);" ${isChecked}> 
            <span style="font-weight:600;">${s.name}</span> <span style="color:var(--text-gray); font-size:0.8rem;">(${s.level})</span>
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
      refreshAllViews();
      alert("تم تحديث قائمة طلاب الحلقة!");
      addLog(`توزيع وضم الطلاب للحلقة`, c ? c.name : "");
    });
  }

  function refreshCirclesManager() {
    const tbody = document.getElementById("circles-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    window.db.circles.forEach((c, i) => {
      const teacher = window.db.users.teacher.find(
        (t) => t.id === c.teacherId,
      ) || { name: "غير معين" };
      const studentCount = window.db.students.filter(
        (s) => s.circleId === c.id,
      ).length;
      tbody.innerHTML += `<tr><td>${i + 1}</td><td style="font-weight:700;">${c.name}</td><td>${teacher.name}</td><td style="color:var(--primary-blue); font-weight:bold;">${studentCount} طلاب</td>
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
    <td>
      <button class="btn-action" onclick="openEditModal('track', '${t.id}')">تعديل الاسم</button>
      <button class="btn-action" style="background:var(--primary-light); color:var(--primary-blue); margin-right:5px;" onclick="openScheduleModal('${t.id}')">تعديل المقررات</button>
    </td></tr>`),
    );
  }

  function renderStudents() {
    const tbody = document.getElementById("students-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    window.db.students.forEach((s) => {
      const track = window.db.tracks.find((t) => t.id === s.trackId) || {
        name: "غير محدد",
      };
      const circle = window.db.circles.find((c) => c.id === s.circleId) || {
        name: "غير موزع لحلقة",
      };
      tbody.innerHTML += `<tr><td style="font-weight:700;">${s.name}</td><td>${s.level}</td><td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${track.name}</span></td><td style="color:${circle.name === "غير موزع لحلقة" ? "red" : "black"}">${circle.name}</td>
      <td><button class="btn-action" onclick="openEditModal('student', '${s.id}')">تعديل بياناته</button></td></tr>`;
    });
  }

  // النوافذ المنبثقة للتعديل
  let editingContext = { type: null, id: null };
  window.openEditModal = function (type, id) {
    editingContext = { type, id };
    const modal = document.getElementById("edit-modal");
    const fields = document.getElementById("edit-form-fields");
    fields.innerHTML = "";

    if (type === "student") {
      const s = window.db.students.find((x) => x.id === id);
      document.getElementById("edit-modal-title").textContent =
        "تعديل بيانات الطالب الأساسية";
      let trackOpts = "";
      window.db.tracks.forEach(
        (t) =>
          (trackOpts += `<option value="${t.id}" ${s.trackId === t.id ? "selected" : ""}>${t.name}</option>`),
      );
      let circleOpts = "<option value=''>غير موزع</option>";
      window.db.circles.forEach(
        (c) =>
          (circleOpts += `<option value="${c.id}" ${s.circleId === c.id ? "selected" : ""}>${c.name}</option>`),
      );

      fields.innerHTML = `
        <div class="input-group"><label>اسم الطالب</label><input type="text" id="edit-stu-name" class="modern-input" value="${s.name}" required></div>
        <div class="input-group"><label>المسار</label><select id="edit-stu-track" class="modern-input">${trackOpts}</select></div>
        <div class="input-group"><label>الحلقة</label><select id="edit-stu-circle" class="modern-input">${circleOpts}</select></div>
        <p style="font-size:0.85rem; color:var(--text-gray); margin-top:10px;">ملاحظة: تعديل إنجاز الطالب يتم عبر المعلم المختص فقط من شاشة المتابعة.</p>
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
      fields.innerHTML = `
        <div class="input-group"><label>اسم الحلقة</label><input type="text" id="edit-circle-name" class="modern-input" value="${c.name}" required></div>
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
        s.trackId = document.getElementById("edit-stu-track").value;
        s.circleId = document.getElementById("edit-stu-circle").value;
        const c = window.db.circles.find((x) => x.id === s.circleId);
        addLog(
          `تعديل بيانات الطالب الأساسية: ${s.name}`,
          c ? c.name : "غير موزع",
        );
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
        addLog(`تعديل بيانات ومعلم الحلقة`, c.name);
      }
    }
    closeEditModal();
    refreshAllViews();
    alert("تم حفظ التعديلات!");
  });

  // تعديل المقررات باستخدام التواريخ الدقيقة
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
      refreshAllViews();
      alert("تم تحديث المقررات! وستظهر للمعلمين فوراً.");
    });

  // سجل الإدارة الشامل (مع محدد التاريخ)
  const adminDateInput = document.getElementById("admin-record-date");
  if (adminDateInput)
    adminDateInput.addEventListener("change", renderAdminRecords);

  function renderAdminRecords() {
    const tbody = document.getElementById("admin-records-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const currentDay = getCurrentProgramDay();
    const selectedDate =
      document.getElementById("admin-record-date").value ||
      new Date().toISOString().split("T")[0];

    window.db.students.forEach((student) => {
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
        <select class="modern-input" style="padding: 0.4rem; min-height: auto;" onchange="adminUpdateAttendance('${student.id}', this.value)">
          <option value="" disabled ${!record ? "selected" : ""}>لم يحضر</option>
          <option value="present" ${record?.attendance === "present" ? "selected" : ""}>حاضر</option>
          <option value="late" ${record?.attendance === "late" ? "selected" : ""}>متأخر</option>
          <option value="absent" ${record?.attendance === "absent" ? "selected" : ""}>غائب</option>
        </select>
      `;

      tbody.innerHTML += `
        <tr>
          <td style="font-weight:700;">${student.name}</td>
          <td>${student.level}</td>
          <td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${track.name}</span></td>
          <td style="color:${circle.name === "غير موزع" ? "red" : "black"}">${circle.name}</td>
          <td style="color:${attendancePercent >= 80 ? "#166534" : "#991b1b"}; font-weight:bold;" dir="ltr">${attendancePercent}%</td>
          <td style="color:var(--primary-blue); font-weight:bold;" dir="ltr">${progressPercent}%</td>
          <td>${selectHtml}</td>
          <td><button class="btn-action" onclick="openEditModal('student', '${student.id}')">تعديل أساسي</button></td>
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

    if (existingRecordIndex > -1) {
      window.db.dailyRecords[existingRecordIndex].attendance = status;
    } else {
      window.db.dailyRecords.push({
        studentId,
        date: selectedDate,
        attendance: status,
        notes: "تعديل حضور إداري",
        timestamp: Date.now(),
      });
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

  // التقارير (تظهر تقارير الحلقة للمعلم والجميع للإدارة)
  document
    .getElementById("generate-report-btn")
    .addEventListener("click", generateReport);
  function generateReport() {
    const tbody = document.getElementById("reports-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const dateInput = document.getElementById("report-date-input").value;
    document.getElementById("report-table-title").textContent =
      `تقرير يوم: ${dateInput}`;

    let studentsToReport = window.db.students;
    // هنا حصر المعلم بحلقته في التقارير
    if (currentUser.role === "teacher")
      studentsToReport = studentsToReport.filter(
        (s) => s.circleId === currentUser.circleId,
      );

    const dayRecords = window.db.dailyRecords.filter(
      (r) => r.date === dateInput,
    );

    studentsToReport.forEach((student) => {
      const record = dayRecords.find((r) => r.studentId === student.id);
      const circle = window.db.circles.find(
        (c) => c.id === student.circleId,
      ) || { name: "" };

      let attText = "غير مسجل";
      let attColor = "gray";
      if (record) {
        if (record.attendance === "present") {
          attText = "حاضر";
          attColor = "green";
        } else if (record.attendance === "late") {
          attText = "متأخر";
          attColor = "orange";
        } else if (record.attendance === "absent") {
          attText = "غائب";
          attColor = "red";
        }
      }

      const tasksCompleted = record
        ? `إنجاز كلي (ح:${student.progress.mem.length} | ث:${student.progress.cons.length} | م:${student.progress.rev.length})`
        : "لا يوجد جديد";
      const notesStr = record?.notes || "-";

      tbody.innerHTML += `<tr><td style="font-weight:700;">${student.name}</td><td>${circle.name}</td><td style="color:${attColor}; font-weight:bold;">${attText}</td><td style="font-size:0.9rem;">${tasksCompleted}</td><td>${notesStr}</td></tr>`;
    });
  }

  // ==========================================
  // المتابعة اليومية المرنة (المعلم - Timeline الأفقي) مع التلوين الذكي
  // ==========================================
  const searchInput = document.getElementById("student-search-input");
  const trackingContainer = document.getElementById("tracking-cards-container");
  if (searchInput)
    searchInput.addEventListener("input", (e) => {
      renderDailyTracking(e.target.value.toLowerCase());
    });

  function renderDailyTracking(searchTerm) {
    if (!trackingContainer) return;
    trackingContainer.innerHTML = "";
    let filteredStudents = window.db.students;

    // المعلم يرى طلاب حلقته فقط هنا وفي لوحة التحكم والتقارير
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
        '<p style="text-align:center;">لا توجد نتائج أو لا يوجد طلاب في هذه الحلقة.</p>';
      return;
    }

    const currentProgramDay = getCurrentProgramDay();

    filteredStudents.forEach((student) => {
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
      const statusBadge = record
        ? `<span class="badge saved">تم الحفظ اليوم</span>`
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

        // التلوين الذكي للأعمدة (رصاصي للسابق، وأخضر مزرق لليوم الحالي)
        let dayClass = "day-column";
        if (i < currentProgramDay) {
          dayClass += " day-past";
        } else if (i === currentProgramDay) {
          dayClass += " day-current";
        }

        timelineHTML += `
          <div class="${dayClass}">
            <h4>${getDateLabel(i)}</h4>
            <label class="task-item"><input type="checkbox" name="chk_mem_${i}" value="${i}" ${isMemChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">📖 حفظ:</span><span class="task-desc">${memText}</span></div>
            </label>
            <label class="task-item"><input type="checkbox" name="chk_cons_${i}" value="${i}" ${isConsChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">🔄 تثبيت:</span><span class="task-desc">${consText}</span></div>
            </label>
            <label class="task-item"><input type="checkbox" name="chk_rev_${i}" value="${i}" ${isRevChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">🔁 مراجعة:</span><span class="task-desc">${revText}</span></div>
            </label>
          </div>
        `;
      }
      timelineHTML += "</div></div>";

      const card = document.createElement("div");
      card.className = "tracking-card";
      card.innerHTML = `
        <div class="tracking-header"><div><h3 style="display:inline-block; margin-left: 10px;">${student.name}</h3></div>${statusBadge}</div>
        <form class="daily-track-form" data-student-id="${student.id}">
          <div style="margin-bottom: 1.5rem;">
            <div class="status-radios">
              <div class="status-radio"><input type="radio" id="present_${student.id}" name="attendance" value="present" ${record?.attendance === "present" ? "checked" : ""} required ${disableStr}><label for="present_${student.id}">حاضر</label></div>
              <div class="status-radio"><input type="radio" id="late_${student.id}" name="attendance" value="late" ${record?.attendance === "late" ? "checked" : ""} ${disableStr}><label for="late_${student.id}">متأخر</label></div>
              <div class="status-radio"><input type="radio" id="absent_${student.id}" name="attendance" value="absent" ${record?.attendance === "absent" ? "checked" : ""} ${disableStr}><label for="absent_${student.id}">غائب</label></div>
            </div>
          </div>
          <p style="font-weight:700; margin-bottom: 0.5rem; color: var(--primary-blue);">الخطة الزمنية (حدد الإنجاز ليكون مفتوحاً بالكامل):</p>
          ${timelineHTML}
          <div style="margin-bottom: 1.5rem;"><label style="font-weight:700; display:block;">ملاحظات:</label><input type="text" name="notes" class="modern-input" placeholder="اختياري..." value="${record?.notes || ""}" ${disableStr}></div>
          ${isEditable ? `<button type="submit" class="btn-submit" style="width:auto; padding: 0.6rem 2rem;">حفظ إنجاز الطالب</button>` : `<p style="color:red; font-weight:bold; margin:0;">انتهت فترة التعديل (24 ساعة).</p>`}
        </form>
      `;

      if (isEditable) {
        card
          .querySelector(".daily-track-form")
          .addEventListener("submit", (e) => {
            e.preventDefault();
            const att = e.target.elements["attendance"].value;
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

            let existingRecordIndex = window.db.dailyRecords.findIndex(
              (r) => r.studentId === student.id && r.date === today,
            );
            const newRecord = {
              studentId: student.id,
              date: today,
              attendance: att,
              notes,
              timestamp: Date.now(),
            };

            if (existingRecordIndex > -1)
              window.db.dailyRecords[existingRecordIndex] = newRecord;
            else window.db.dailyRecords.push(newRecord);

            renderDailyTracking(searchInput.value.toLowerCase());
            updateDashboardStats();
            generateReport();
            alert("تم حفظ إنجاز الطالب وتحديث خطته بنجاح!");
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
      }
      addLog("تغيير الرقم السري", "عام");
    });
  }
});
