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

  // أيقونات العين الرسمية (مفتوحة ومغلقة)
  const eyeOpenSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
  const eyeClosedSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;

  // --- تفعيل زر عرض/إخفاء الرقم السري (👁️) بدون الإيموجي ---
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".toggle-password-btn, .toggle-password");
    if (btn) {
      const container = btn.parentElement;
      const input = container.querySelector("input");
      if (input) {
        if (input.type === "password") {
          input.type = "text";
          btn.innerHTML = eyeClosedSVG;
        } else {
          input.type = "password";
          btn.innerHTML = eyeOpenSVG;
        }
      }
    }
  });

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
    SEND_NOTIFICATIONS: "send_notifications",
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
      PERMISSIONS.SEND_NOTIFICATIONS,
    ],
    teacher: [
      PERMISSIONS.RECORD_ATTENDANCE,
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.MANAGE_STUDENTS,
    ],
  };

  function hasPermission(role, permissionName) {
    return (ROLE_PERMISSIONS[role] || []).includes(permissionName);
  }

  // ================= الدورات: الصيفية (للمدير فقط) والفصل الأول =================
  // كل البيانات القديمة بدون programId = الدورة الصيفية، ولا يتغير فيها شيء
  const SUMMER = "summer_1448";
  const TERM = "term1_1448";
  const PROGRAM_NAMES = {
    [SUMMER]: "الدورة الصيفية 1448",
    [TERM]: "الدورة الفصل الأول 1448",
  };
  const isTermDoc = (x) => !!x && x.programId === TERM;
  let activeProgram = TERM;
  const isTerm = () => activeProgram === TERM;

  // ما يُنشأ في الفصل الأول يُعلَّم به، وما يُنشأ في الصيفية يبقى كما كان
  function stampProgram(obj) {
    if (isTerm()) obj.programId = TERM;
    return obj;
  }

  // أيام خطة الفصل (الأحد إلى الأربعاء) تُسمَّع في جلسات الجمعة والسبت
  // dueHour: الساعة التي بعدها تُعتبر الجلسة منتهية عند حساب المواكبة
  const TERM_SLOTS = [
    { plan: "الأحد", session: "فجر الجمعة", offset: 0, dueHour: 12 },
    { plan: "الإثنين", session: "عصر الجمعة", offset: 0, dueHour: 18 },
    { plan: "الثلاثاء", session: "فجر السبت", offset: 1, dueHour: 12 },
    { plan: "الأربعاء", session: "عصر السبت", offset: 1, dueHour: 18 },
  ];

  function parseIsoDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  function toIsoDate(d) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function hijriDayMonth(d, withYear) {
    try {
      return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", {
        day: "numeric",
        month: "long",
        ...(withYear ? { year: "numeric" } : {}),
      }).format(d);
    } catch (e) {
      return d.toLocaleDateString("ar-SA");
    }
  }

  function termSessionDate(track, day) {
    const first = parseIsoDate(track && track.startDate);
    if (!first || day < 1) return null;
    while (first.getDay() !== 5) first.setDate(first.getDate() + 1);
    const slot = TERM_SLOTS[(day - 1) % 4];
    first.setDate(first.getDate() + Math.floor((day - 1) / 4) * 7 + slot.offset);
    return first;
  }

  function termDayLabel(track, day) {
    const slot = TERM_SLOTS[(day - 1) % 4];
    const week = Math.floor((day - 1) / 4) + 1;
    const d = termSessionDate(track, day);
    return `الأسبوع ${week} - ${slot.plan} (${slot.session}${d ? " " + hijriDayMonth(d) : ""})`;
  }

  // عدد جلسات الخطة التي انتهى وقتها حتى الآن
  function termDueCount(track) {
    if (!track || !track.startDate) return 0;
    const now = new Date();
    let n = 0;
    for (let day = 1; day <= (track.totalDays || 0); day++) {
      const d = termSessionDate(track, day);
      d.setHours(TERM_SLOTS[(day - 1) % 4].dueHour, 0, 0, 0);
      if (now < d) break;
      n++;
    }
    return n;
  }

  // عدد أيام الحلقة (الجمعة والسبت) التي مضت، لحساب نسبة الحضور
  function termDueDates(track) {
    const dates = new Set();
    for (let day = 1; day <= termDueCount(track); day++)
      dates.add(toIsoDate(termSessionDate(track, day)));
    return dates.size;
  }

  function sessionsText(n) {
    if (n === 1) return "جلسة واحدة";
    if (n === 2) return "جلستين";
    if (n <= 10) return `${n} جلسات`;
    return `${n} جلسة`;
  }

  function pagesText(n) {
    if (n === 1) return "صفحة واحدة";
    if (n === 2) return "صفحتان";
    if (n >= 3 && n <= 10) return `${n} صفحات`;
    return `${n} صفحة`;
  }

  function formatRecitedAt(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const day = d.toLocaleDateString("ar-SA", { weekday: "long" });
    const time = d.toLocaleTimeString("ar-SA-u-nu-latn", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${day} ${hijriDayMonth(d)} - ${time}`;
  }

  function toLocalInputValue(ts) {
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, "0");
    return `${toIsoDate(d)}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  // أعلى حديث وصل له الطالب في نوع معين (حفظ / تثبيت / مراجعة)
  function reachedHadith(student, type) {
    let n = parseInt(student.manualProgress?.[type]) || 0;
    (student.detailedProgress?.[type] || []).forEach((h) => {
      if (h > n) n = h;
    });
    (student.progress?.[type] || []).forEach((day) => {
      const t = extractMaxNum(getTaskText(student.trackId, type, day));
      if (t > n) n = t;
    });
    return n;
  }

  // المواكبة في الفصل على الحفظ فقط: كم جلسة انتهت ولم يصل الطالب لمقرر حفظها
  function termMemStatus(student) {
    const track = window.db.tracks.find((t) => t.id === student.trackId);
    if (!track || !track.startDate) return null;
    const due = termDueCount(track);
    const reached = reachedHadith(student, "mem");
    let behind = 0;
    for (let day = 1; day <= due; day++) {
      // جلسات المراجعة والاختبار ليس فيها حفظ جديد فلا تُحسب
      const target = extractMaxNum(getTaskText(track.id, "mem", day) || "");
      if (target > 0 && reached < target) behind++;
    }
    return { due, reached, behind };
  }

  function memBadgeHtml(st) {
    if (!st) return "";
    if (st.behind <= 0)
      return `<span class="badge" style="background:#dcfce7; color:#166534; border:1px solid #166534;">🌟 مواكب للخطة</span>`;
    if (st.behind <= 2)
      return `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #b45309;">⚠️ متأخر في الحفظ (${sessionsText(st.behind)})</span>`;
    return `<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #991b1b;">🚨 متأخر جداً في الحفظ (${sessionsText(st.behind)})</span>`;
  }

  // نسبة الحفظ من الخطة كاملة
  // أول وآخر حديث في خطة الحفظ (بعض الخطط لا تبدأ من الحديث 1)
  function termPlanRange(trackId) {
    let first = 0;
    let last = 0;
    (window.db.scheduleData[trackId] || []).forEach((d) => {
      const m = /ح\s*(\d+)\s*إلى\s*(\d+)/.exec(toLatinDigits(d.mem || ""));
      if (!m) return;
      if (!first || +m[1] < first) first = +m[1];
      if (+m[2] > last) last = +m[2];
    });
    return { first, last };
  }

  // عدد ما حفظه الطالب من خطته
  function termMemCount(student) {
    const { first, last } = termPlanRange(student.trackId);
    const reached = reachedHadith(student, "mem");
    if (!last) return reached;
    if (reached < first) return 0;
    return Math.min(reached, last) - first + 1;
  }

  // التاريخ الهجري: الأربعاء 1448/05/24هـ
  function hijriDate(iso) {
    const d = parseIsoDate(iso);
    if (!d) return iso || "";
    try {
      const parts = new Intl.DateTimeFormat(
        "ar-SA-u-ca-islamic-umalqura-nu-latn",
        { day: "2-digit", month: "2-digit", year: "numeric" },
      ).formatToParts(d);
      const get = (t) => (parts.find((p) => p.type === t) || {}).value || "";
      const day = d.toLocaleDateString("ar-SA", { weekday: "long" });
      return `${day} ${get("year")}/${get("month")}/${get("day")}هـ`;
    } catch (e) {
      return iso;
    }
  }

  // جلسات الحفظ في الخطة مع صفحاتها: ح 1 إلى 24 (ص 1-8)
  function termPlanSessions(trackId) {
    const out = [];
    (window.db.scheduleData[trackId] || []).forEach((d) => {
      const m = /ح\s*(\d+)\s*إلى\s*(\d+)\s*\(ص\s*(\d+)-(\d+)\)/.exec(
        toLatinDigits(d.mem || ""),
      );
      if (m) out.push({ fh: +m[1], th: +m[2], fp: +m[3], tp: +m[4] });
    });
    return out.sort((a, b) => a.fh - b.fh);
  }

  // عدد الصفحات المنجزة من كتاب المسار: عند نهاية الجلسة من الخطة، وداخلها من فهرس الكتاب
  function termPagesDone(student) {
    const sessions = termPlanSessions(student.trackId);
    if (sessions.length === 0) return null;
    const n = reachedHadith(student, "mem");
    const firstPage = sessions[0].fp;
    if (n < sessions[0].fh) return 0;
    const book = (window.TERM_BOOKS || []).find((b) =>
      (b.tracks || []).includes(student.trackId),
    );
    const startOf = (h) =>
      book && book.startPages ? book.startPages[h - 1] : undefined;
    const s = sessions.find((x) => n >= x.fh && n <= x.th);
    let end;
    if (!s) {
      const prev = sessions.filter((x) => x.th <= n).pop();
      end = prev ? prev.tp : firstPage;
    } else if (n === s.th) end = s.tp;
    else {
      const a = startOf(n);
      const b = startOf(n + 1);
      if (a) end = Math.max(a, (b || a) - 1);
      else
        end =
          s.fp +
          Math.floor(((n - s.fh + 1) / (s.th - s.fh + 1)) * (s.tp - s.fp));
      end = Math.min(Math.max(end, s.fp), s.tp);
    }
    return Math.max(0, end - firstPage + 1);
  }

  // نسبة الحفظ من الخطة كاملة
  function termMemPercent(student) {
    const { first, last } = termPlanRange(student.trackId);
    if (!last) return 0;
    return Math.min(
      100,
      Math.round((termMemCount(student) / (last - first + 1)) * 100),
    );
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

  function getDateLabel(dayIndex, trackId) {
    if (isTerm())
      return termDayLabel(
        window.db.tracks.find((t) => t.id === trackId),
        dayIndex,
      );
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
      totalHadiths: 763,
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
    { id: "t8", name: "الأربعون النووية", totalDays: 23, totalHadiths: 42 },
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
      [584, 628],
      [629, 673],
      [674, 718],
      [729, 763],
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
    t8: [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 11],
      [12, 13],
      [14, 15],
      [16, 17],
      [18, 19],
      [20, 22],
      [23, 24],
      [25, 26],
      [27, 28],
      [29, 30],
      [31, 33],
      [34, 35],
      [36, 37],
      [38, 39],
      [40, 42],
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

  function emptySchedule(totalDays) {
    return Array.from({ length: totalDays || 23 }, (_, i) => ({
      day: i + 1,
      mem: "",
      cons: "",
      rev: "",
    }));
  }

  // المسارات الأساسية (من الكود) + ما حفظه المدير في قاعدة البيانات من مسارات جديدة أو تعديلات
  function buildTracks(trackDocs) {
    const tracks = tracksDefinition.map((t) => ({ ...t }));
    const sched = {};
    Object.keys(scheduleData).forEach((id) => {
      sched[id] = scheduleData[id].map((d) => ({ ...d }));
    });
    // خطط الفصل الأول من ملف term-plans.js (وما يعدّله المدير في قاعدة البيانات يُقدَّم عليها)
    (window.TERM_PLANS || []).forEach((p) => {
      tracks.push({
        id: p.id,
        name: p.name,
        totalDays: p.totalDays,
        totalHadiths: p.totalHadiths,
        startDate: p.startDate,
        programId: TERM,
      });
      sched[p.id] = p.schedule.map((d) => ({ ...d }));
    });
    trackDocs
      .filter((d) => d && d.id)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .forEach((d) => {
        let t = tracks.find((x) => x.id === d.id);
        if (!t) {
          t = { id: d.id, name: "", totalDays: 23, totalHadiths: 150 };
          tracks.push(t);
        }
        if (d.name) t.name = d.name;
        if (d.totalDays) t.totalDays = d.totalDays;
        if (d.totalHadiths) t.totalHadiths = d.totalHadiths;
        if (d.programId) t.programId = d.programId;
        if (d.startDate) t.startDate = d.startDate;
        if (d.createdAt) t.createdAt = d.createdAt;
        if (Array.isArray(d.schedule) && d.schedule.length > 0)
          sched[d.id] = d.schedule.map((x) => ({ ...x }));
        else if (!sched[d.id]) sched[d.id] = emptySchedule(t.totalDays);
      });
    return { tracks, sched };
  }

  // حفظ المسار ومقرراته في قاعدة البيانات (يرجع true عند نجاح الحفظ فعلياً)
  async function saveTrackToFirestore(trackId) {
    const t = window.db.tracks.find((x) => x.id === trackId);
    if (!t || typeof dbFirestore === "undefined" || !navigator.onLine)
      return false;
    const sched = window.db.scheduleData[trackId] || [];
    try {
      await dbFirestore
        .collection("tracks")
        .doc(trackId)
        .set({
          id: t.id,
          name: t.name,
          totalDays: t.totalDays || 23,
          totalHadiths: t.totalHadiths || 150,
          schedule: sched.map((d) => ({
            day: d.day,
            mem: d.mem || "",
            cons: d.cons || "",
            rev: d.rev || "",
          })),
          createdAt: t.createdAt || 0,
          updatedAt: Date.now(),
          ...(t.programId ? { programId: t.programId } : {}),
          ...(t.startDate ? { startDate: t.startDate } : {}),
        });
      return true;
    } catch (e) {
      console.warn("تعذر حفظ المسار في قاعدة البيانات:", e);
      return false;
    }
  }

  function trackSaveAlert(ok, successText) {
    alert(
      ok
        ? successText
        : "⚠️ تم الحفظ على هذا الجهاز فقط ولم يُحفظ في قاعدة البيانات.\nتأكد من الاتصال بالإنترنت ثم أعد الحفظ، وإلا سيختفي التعديل عند تحديث الصفحة.",
    );
  }

  function getTaskText(trackId, taskType, dayIndex) {
    if (dayIndex <= 0) return "لا يوجد";
    const sched = window.db.scheduleData[trackId];
    if (sched && sched[dayIndex - 1]) return sched[dayIndex - 1][taskType];
    return `مقرر ${getDateLabel(dayIndex, trackId)}`;
  }

  function extractMaxNum(text) {
    if (isTerm() && text) {
      const m = /ح\s*(\d+)\s*إلى\s*(\d+)/.exec(toLatinDigits(text));
      if (m) return Number(m[2]);
    }
    if (!text || text.includes("لا يوجد") || text.includes("مراجعة")) return 0;
    const nums = (isTerm() ? toLatinDigits(text) : text).match(/\d+/g);
    return nums ? Math.max(...nums.map(Number)) : 0;
  }

  // بيانات الدورتين في الذاكرة، و window.db هو الدورة المعروضة حالياً
  // (المدراء والرسائل وسجل العمليات والمقررات مشتركة بين الدورتين)
  let programs = null;

  function setPrograms(flat) {
    const termStudentIds = new Set(
      flat.students.filter(isTermDoc).map((s) => s.id),
    );
    const make = (term) => {
      const pick = (arr) => (arr || []).filter((x) => isTermDoc(x) === term);
      return {
        tracks: pick(flat.tracks),
        scheduleData: flat.scheduleData,
        circles: pick(flat.circles),
        students: pick(flat.students),
        users: {
          admin: flat.users.admin,
          supervisor: pick(flat.users.supervisor),
          teacher: pick(flat.users.teacher),
        },
        dailyRecords: (flat.dailyRecords || []).filter(
          (r) => (isTermDoc(r) || termStudentIds.has(r.studentId)) === term,
        ),
        auditLogs: flat.auditLogs,
        messages: flat.messages,
      };
    };
    programs = { [SUMMER]: make(false), [TERM]: make(true) };
    window.db = programs[activeProgram];
  }

  function useProgram(p) {
    activeProgram = p === SUMMER ? SUMMER : TERM;
    if (programs) window.db = programs[activeProgram];
  }

  function mergedDB() {
    if (!programs) return window.db;
    const s = programs[SUMMER];
    const t = programs[TERM];
    return {
      tracks: [...s.tracks, ...t.tracks],
      scheduleData: s.scheduleData,
      circles: [...s.circles, ...t.circles],
      students: [...s.students, ...t.students],
      users: {
        admin: s.users.admin,
        supervisor: [...s.users.supervisor, ...t.users.supervisor],
        teacher: [...s.users.teacher, ...t.users.teacher],
      },
      dailyRecords: [...s.dailyRecords, ...t.dailyRecords],
      auditLogs: s.auditLogs,
      messages: s.messages,
    };
  }

  function saveLocalDB() {
    localStorage.setItem("wathbah_db", JSON.stringify(mergedDB()));
  }

  async function syncToFirestore(collectionName, docId, data) {
    if (typeof dbFirestore !== "undefined" && navigator.onLine) {
      try {
        await dbFirestore.collection(collectionName).doc(docId).set(data);
      } catch (e) {
        console.warn("سيتم المزامنة عند استقرار الاتصال.");
      }
    }
  }

  async function deleteFromFirestore(collectionName, docId) {
    if (typeof dbFirestore !== "undefined" && navigator.onLine) {
      try {
        await dbFirestore.collection(collectionName).doc(docId).delete();
      } catch (e) {
        console.warn("فشل الحذف من السحابة مؤقتاً.");
      }
    }
  }

  async function requestFCMToken(userObj, collection) {
    if (
      typeof firebase !== "undefined" &&
      firebase.messaging &&
      firebase.messaging.isSupported()
    ) {
      try {
        const messaging = firebase.messaging();
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
          );

          const token = await messaging.getToken({
            vapidKey:
              "BLDTgzOIzrk0LpHH2qIbkXo1KNnC8lkL58i36jwuaMT53LB-3z0i6H8wcSMVmSut0RmLN21d68fqNaQVox8vfeM",
            serviceWorkerRegistration: registration,
          });

          if (token && userObj.fcmToken !== token) {
            userObj.fcmToken = token;
            await syncToFirestore(collection, userObj.id, userObj);
            console.log("تم تفعيل إشعارات الجوال لهذا المستخدم بنجاح.");
          }

          messaging.onMessage((payload) => {
            console.log("تم استلام إشعار والنظام مفتوح: ", payload);
            const title = payload.notification?.title || "تنبيه جديد";
            const body = payload.notification?.body || "لديك رسالة من الإدارة.";
            alert(`🔔 ${title}\n\n${body}`);
          });
        } else {
          console.warn("تم رفض صلاحية الإشعارات من قبل المستخدم.");
        }
      } catch (error) {
        console.log("تعذر تسجيل أو تفعيل الإشعارات الفورية:", error);
      }
    }
  }

  async function initDB() {
    try {
      const studentsSnap = await dbFirestore.collection("students").get();
      const circlesSnap = await dbFirestore.collection("groups").get();
      const usersSnap = await dbFirestore.collection("users").get();
      const recordsSnap = await dbFirestore.collection("dailyRecords").get();
      const logsSnap = await dbFirestore
        .collection("auditLogs")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();
      const messagesSnap = await dbFirestore
        .collection("messages")
        .orderBy("timestamp", "desc")
        .get();

      // قراءة المسارات منفصلة: لو فشلت لا تتأثر بقية البيانات
      let builtTracks = null;
      try {
        const tracksSnap = await dbFirestore.collection("tracks").get();
        builtTracks = buildTracks(tracksSnap.docs.map((doc) => doc.data()));
      } catch (err) {
        console.warn("تعذر قراءة المسارات من قاعدة البيانات:", err);
        try {
          const stored = JSON.parse(localStorage.getItem("wathbah_db"));
          if (stored && Array.isArray(stored.tracks) && stored.scheduleData)
            builtTracks = {
              tracks: stored.tracks,
              sched: stored.scheduleData,
            };
        } catch (e2) {}
        if (!builtTracks) builtTracks = buildTracks([]);
      }

      let loadedMessages = messagesSnap.docs.map((doc) => doc.data());

      let loadedStudents = studentsSnap.docs.map((doc) => {
        let s = doc.data();
        if (!s.progress) s.progress = { mem: [], cons: [], rev: [] };
        if (!s.manualProgress)
          s.manualProgress = { mem: "", cons: "", rev: "" };
        if (!s.detailedProgress)
          s.detailedProgress = { mem: [], cons: [], rev: [] };
        if (!s.tasksTiming) s.tasksTiming = { mem: {}, cons: {}, rev: {} };
        if (!s.trackId) s.trackId = "";
        if (!s.circleId) s.circleId = "";
        if (!s.level) s.level = "غير محدد";
        if (!s.phone) s.phone = "";
        if (!s.idNumber) s.idNumber = "";
        return s;
      });

      let loadedCircles = circlesSnap.docs.map((doc) => doc.data());
      let loadedRecords = recordsSnap.docs.map((doc) => doc.data());
      let loadedLogs = logsSnap.docs.map((doc) => doc.data());

      let loadedUsers = { admin: [], supervisor: [], teacher: [] };
      usersSnap.docs.forEach((doc) => {
        let u = doc.data();
        if (!u.phone) u.phone = "";
        if (u.role && loadedUsers[u.role]) loadedUsers[u.role].push(u);
      });

      let isFirstSeed = false;

      if (loadedUsers.admin.length === 0) {
        const defaultAdmin = {
          id: "a1",
          name: "عبدالله",
          role: "admin",
          pin: "1234",
          phone: "0500000000",
        };
        loadedUsers.admin.push(defaultAdmin);
        isFirstSeed = true;
      }

      if (!loadedUsers.admin.find((a) => a.name === "يوسف مهدي")) {
        const yousefAdmin = {
          id: "a2_yousef",
          name: "يوسف مهدي",
          role: "admin",
          pin: "0000",
          phone: "",
        };
        loadedUsers.admin.push(yousefAdmin);
        if (!isFirstSeed) syncToFirestore("users", yousefAdmin.id, yousefAdmin);
      }

      if (!loadedUsers.admin.find((a) => a.name === "ادارة البرنامج")) {
        const idaraAdmin = {
          id: "a3_idara",
          name: "ادارة البرنامج",
          role: "admin",
          pin: "0000",
          phone: "",
        };
        loadedUsers.admin.push(idaraAdmin);
        if (!isFirstSeed) syncToFirestore("users", idaraAdmin.id, idaraAdmin);
      }

      setPrograms({
        tracks: builtTracks.tracks,
        scheduleData: builtTracks.sched,
        circles: loadedCircles,
        students: loadedStudents,
        users: loadedUsers,
        dailyRecords: loadedRecords,
        auditLogs: loadedLogs,
        messages: loadedMessages,
      });

      saveLocalDB();
      if (isFirstSeed) {
        window.db.users.admin.forEach((admin) =>
          syncToFirestore("users", admin.id, admin),
        );
      }
    } catch (e) {
      console.warn("استخدام النسخة المحلية للبيانات بسبب انقطاع الاتصال.", e);
      const stored = localStorage.getItem("wathbah_db");
      if (stored) {
        const flat = JSON.parse(stored);
        if (
          !Array.isArray(flat.tracks) ||
          flat.tracks.length === 0 ||
          !flat.scheduleData
        ) {
          const defaults = buildTracks([]);
          flat.tracks = defaults.tracks;
          flat.scheduleData = defaults.sched;
        }
        if (!flat.messages) flat.messages = [];
        if (!flat.auditLogs) flat.auditLogs = [];
        if (!flat.dailyRecords) flat.dailyRecords = [];
        if (!flat.circles) flat.circles = [];
        if (!flat.students) flat.students = [];
        if (!flat.users) flat.users = { admin: [], supervisor: [], teacher: [] };
        if (!flat.users.admin) flat.users.admin = [];
        flat.students.forEach((s) => {
          if (!s.tasksTiming) s.tasksTiming = { mem: {}, cons: {}, rev: {} };
        });
        setPrograms(flat);
      } else {
        const defaults = buildTracks([]);
        setPrograms({
          tracks: defaults.tracks,
          scheduleData: defaults.sched,
          circles: [],
          students: [],
          users: {
            admin: [
              {
                id: "a1",
                name: "عبدالله",
                role: "admin",
                pin: "1234",
                phone: "",
              },
            ],
            supervisor: [],
            teacher: [],
          },
          dailyRecords: [],
          auditLogs: [],
          messages: [],
        });
      }
    }
  }

  let currentUser = null;
  let isGlobalManualMode = false;

  // حلقات المعلم: كل حلقة مسجل عليها كمعلم + حلقته المحفوظة في حسابه (توافقاً مع البيانات القديمة)
  function getTeacherCircleIds(teacherId) {
    const ids = window.db.circles
      .filter((c) => c.teacherId === teacherId)
      .map((c) => c.id);
    const teacher = window.db.users.teacher.find((t) => t.id === teacherId);
    if (
      teacher &&
      teacher.circleId &&
      !ids.includes(teacher.circleId) &&
      window.db.circles.find((c) => c.id === teacher.circleId)
    )
      ids.push(teacher.circleId);
    return ids;
  }

  // المعلم بدون حلقة يرى الطلاب غير الموزعين (كما كان سابقاً)
  function myCircleIds() {
    if (!currentUser) return [];
    const ids = getTeacherCircleIds(currentUser.id);
    return ids.length > 0 ? ids : [""];
  }

  function hasValidCircle(teacher) {
    return (
      !!teacher.circleId &&
      !!window.db.circles.find((c) => c.id === teacher.circleId)
    );
  }

  // الحلقة لها معلم واحد: أي معلم آخر محفوظة عنده هذه الحلقة تُنقل حلقته المحفوظة لحلقة أخرى من حلقاته
  function detachCircleFromOtherTeachers(circleId, keepTeacherId) {
    window.db.users.teacher.forEach((u) => {
      if (u.id !== keepTeacherId && u.circleId === circleId) {
        const remaining = window.db.circles.filter(
          (c) => c.teacherId === u.id && c.id !== circleId,
        );
        u.circleId = remaining.length > 0 ? remaining[0].id : "";
        syncToFirestore("users", u.id, u);
      }
    });
  }

  function addLog(actionDesc, targetCircle) {
    const timestamp = Date.now();
    const logId = "log_" + timestamp;
    const newLog = {
      id: logId,
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
      timestamp: timestamp,
    };

    window.db.auditLogs.unshift(newLog);
    saveLocalDB();
    syncToFirestore("auditLogs", logId, newLog);

    if (window.db.auditLogs.length > 50) {
      const oldLog = window.db.auditLogs.pop();
      if (oldLog.id) deleteFromFirestore("auditLogs", oldLog.id);
    }
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

  function renderMessages() {
    const container = document.getElementById("messages-container");
    if (!container) return;
    container.innerHTML = "";
    let visibleMessages = window.db.messages || [];

    if (!currentUser) return;

    if (currentUser.role === "admin") {
      visibleMessages = visibleMessages.filter(
        (m) =>
          m.receiverType === "admin" ||
          m.targetType === "admin" ||
          m.senderId === currentUser.id,
      );
    } else if (currentUser.role === "supervisor") {
      visibleMessages = visibleMessages.filter(
        (m) =>
          m.receiverType === "supervisor" ||
          m.targetType === "all_supervisors" ||
          (m.targetType === "specific_supervisor" &&
            m.targetId === currentUser.id) ||
          m.senderId === currentUser.id,
      );
    } else if (currentUser.role === "teacher") {
      visibleMessages = visibleMessages.filter(
        (m) =>
          (m.receiverType === "teacher" &&
            (!m.circleId || myCircleIds().includes(m.circleId))) ||
          m.targetType === "all_teachers" ||
          (m.targetType === "specific_teacher" &&
            m.targetId === currentUser.id) ||
          m.senderId === currentUser.id,
      );
    }

    if (visibleMessages.length === 0) {
      container.innerHTML =
        "<p style='text-align:center; color:var(--text-gray); padding:2rem; background:#fff; border-radius:8px;'>📭 لا توجد رسائل واردة جديدة في صندوقك.</p>";
      return;
    }

    visibleMessages.forEach((msg) => {
      const roleName =
        msg.senderRole === "student"
          ? "طالب"
          : msg.senderRole === "teacher"
            ? "معلم حلقة"
            : msg.senderRole === "supervisor"
              ? "مشرف تعليمي"
              : "الإدارة العامة";

      let toText = "الإدارة العامة / المدير";
      if (msg.targetType === "all_students") toText = "جميع الطلاب";
      else if (msg.targetType === "all_teachers") toText = "جميع المعلمين";
      else if (msg.targetType === "all_supervisors") toText = "جميع المشرفين";
      else if (msg.targetType && msg.targetType.startsWith("specific_"))
        toText = "مستخدم محدد";
      else if (msg.receiverType === "teacher") toText = "معلم الحلقة";

      container.innerHTML += `
           <div class="content-card" style="margin-bottom:12px; border-right: 4px solid var(--primary-blue); padding: 1.2rem; background: #fff;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
                 <div>
                    <strong style="color:var(--primary-blue); font-size:1.1rem;">${msg.senderName} <span style="font-size:0.8rem; color:gray;">(${roleName})</span></strong>
                    <div style="font-size:0.8rem; color:var(--text-gray); margin-top:4px;">📥 الإرسال إلى: <strong>${toText}</strong></div>
                 </div>
                 <span style="font-size:0.8rem; background:#f1f5f9; padding:4px 8px; border-radius:4px; color:var(--text-gray);" dir="ltr">${msg.date || ""}</span>
              </div>
              <h4 style="margin-bottom:8px; font-weight:800; color:var(--gold-text);">${msg.subject || "بدون عنوان"}</h4>
              <p style="font-size:0.9rem; line-height:1.6; white-space: pre-wrap; margin:0; color:var(--text-dark);">${msg.text || ""}</p>
           </div>
        `;
    });
  }

  function adjustNotificationUI(role) {
    const targetSelectGroup =
      document.getElementById("notif-target-type")?.parentElement;
    const userSelectGroup = document.getElementById("notif-user-select-group");
    if (!targetSelectGroup) return;

    if (role !== "admin") {
      targetSelectGroup.style.display = "none";
      if (userSelectGroup) userSelectGroup.style.display = "none";

      let notice = document.getElementById("target-admin-notice");
      if (!notice) {
        notice = document.createElement("div");
        notice.id = "target-admin-notice";
        notice.style =
          "background: #e0f2fe; color: #0369a1; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 0.95rem; font-weight: bold; border: 1px solid #bae6fd;";
        notice.innerHTML =
          "📨 وجهة الإشعار/الرسالة: الإدارة العامة (المدير) مباشرة";
        targetSelectGroup.parentElement.insertBefore(notice, targetSelectGroup);
      }
    } else {
      targetSelectGroup.style.display = "block";
      const notice = document.getElementById("target-admin-notice");
      if (notice) notice.remove();
    }
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

  // الجلسة المحفوظة تُقبل فقط لحساب موجود: المدير، أو حساب من الفصل الأول
  // (حسابات الدورة الصيفية لا تدخل النظام، ويطلع عليها المدير فقط)
  function findSessionUser(sessionUser) {
    if (!programs || !sessionUser || !sessionUser.role) return null;
    const list = programs[TERM].users[sessionUser.role] || [];
    return list.find((u) => u.id === sessionUser.id) || null;
  }

  function savedAdminProgram() {
    try {
      return localStorage.getItem("hadith_program") === SUMMER ? SUMMER : TERM;
    } catch (e) {
      return TERM;
    }
  }

  function navAllowed(perm) {
    // في الفصل الأول: المدير والمشرف يستطيعان تسجيل التسميع وتعديله أيضاً
    if (perm === PERMISSIONS.RECORD_ATTENDANCE && isTerm()) return true;
    // الكتب للدورة الفصل الأول فقط
    if (perm === "view_books") return isTerm();
    return hasPermission(currentUser.role, perm);
  }

  // ما يتغير في الواجهة بين الدورتين
  function applyProgramUI() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.style.display = navAllowed(btn.getAttribute("data-permission"))
        ? "flex"
        : "none";
    });
    const isAdmin = currentUser.role === "admin";
    const progSelect = document.getElementById("program-select");
    if (progSelect) {
      progSelect.style.display = isAdmin ? "block" : "none";
      progSelect.value = activeProgram;
    }
    const progName = document.getElementById("current-program-name");
    if (progName) {
      progName.textContent = PROGRAM_NAMES[activeProgram];
      progName.style.display = isAdmin ? "none" : "block";
    }
    const banner = document.getElementById("summer-archive-banner");
    if (banner) banner.style.display = isTerm() ? "none" : "block";
    document.querySelectorAll(".term-only").forEach((el) => {
      el.style.display = isTerm() ? "" : "none";
    });
    const trackingDate = document.getElementById("tracking-date");
    if (trackingDate) {
      const todayLocal = toIsoDate(new Date());
      trackingDate.max = todayLocal;
      if (!trackingDate.value || trackingDate.value > todayLocal)
        trackingDate.value = todayLocal;
    }
    // تسجيل الفصل بأرقام الأحاديث فقط، وزر التبديل (شريط/دقيق) للصيف
    isGlobalManualMode = isTerm();
    const toggleBtn = document.getElementById("global-toggle-btn");
    if (toggleBtn) toggleBtn.style.display = isTerm() ? "none" : "";
  }

  function doLogin(user, isAutoSession = false) {
    currentUser = user;
    useProgram(currentUser.role === "admin" ? savedAdminProgram() : TERM);
    localStorage.setItem(
      "wathbah_session",
      JSON.stringify({ user: currentUser, loginTime: Date.now() }),
    );
    loginScreen.style.display = "none";
    mainApp.style.display = "flex";
    document.getElementById("current-user-name").textContent = currentUser.name;

    applyProgramUI();

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
    if (document.getElementById("teachers-management-section"))
      document.getElementById("teachers-management-section").style.display =
        hasPermission(currentUser.role, PERMISSIONS.MANAGE_TEACHERS)
          ? "block"
          : "none";

    if (document.getElementById("report-filter-group"))
      document.getElementById("report-filter-group").style.display =
        currentUser.role === "teacher" && myCircleIds().length < 2
          ? "none"
          : "block";

    requestFCMToken(currentUser, "users");
    adjustNotificationUI(currentUser.role);

    const firstBtn = document.querySelector('.nav-btn[style*="display: flex"]');
    if (firstBtn) firstBtn.click();

    const todayIso = new Date().toISOString().split("T")[0];
    document.getElementById("report-date-input").value = todayIso;
    if (document.getElementById("admin-record-date"))
      document.getElementById("admin-record-date").value = todayIso;

    refreshAllViews();

    if (!isAutoSession) addLog("تسجيل الدخول للنظام", "عام");
  }

  setTimeout(async () => {
    const loader = document.getElementById("global-loader");
    if (loader) {
      if (typeof dbFirestore !== "undefined") await initDB();
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
        const sessionUser = findSessionUser(checkSession());
        if (sessionUser) doLogin(sessionUser, true);
        else {
          localStorage.removeItem("wathbah_session");
          loginScreen.style.display = "flex";
        }
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

    loginPasswordInput.type = "password";
    const toggleBtn = loginPasswordGroup.querySelector(".toggle-password-btn");
    if (toggleBtn) toggleBtn.innerHTML = eyeOpenSVG;
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
        doLogin(user, false);
        submitBtn.innerHTML = "دخول";
        submitBtn.disabled = false;
        loginPasswordInput.value = "";
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
    useProgram(TERM);
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

  // المدير فقط: التبديل بين الفصل الأول والدورة الصيفية
  const programSelect = document.getElementById("program-select");
  if (programSelect) {
    programSelect.addEventListener("change", () => {
      if (!currentUser || currentUser.role !== "admin") return;
      try {
        localStorage.setItem("hadith_program", programSelect.value);
      } catch (e) {}
      useProgram(programSelect.value);
      applyProgramUI();
      const activeBtn = document.querySelector(".nav-btn.active");
      if (!activeBtn || activeBtn.style.display === "none") {
        const firstBtn = document.querySelector(
          '.nav-btn[style*="display: flex"]',
        );
        if (firstBtn) firstBtn.click();
      }
      refreshAllViews();
    });
  }

  function refreshAllViews() {
    renderBooks();
    renderAccountsTransfer();
    renderTracks();
    renderStudents();
    renderTeachers();
    updateDynamicDropdowns();
    updateDashboardStats();
    updateSupportInfo();
    renderMessages();
    if (currentUser) adjustNotificationUI(currentUser.role);
    if (currentUser && (currentUser.role === "teacher" || isTerm()))
      renderDailyTracking("");
    if (!currentUser || currentUser.role !== "teacher") renderAdminRecords();
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
      supportDiv.innerHTML = `<div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); border-right: 3px solid var(--primary-blue);"><strong>🏢 التواصل مع الإدارة:</strong> <br /><span style="color: var(--text-gray); font-size:0.85rem;">يمكنك كتابة رسالة من المربع بالأسفل وستصل للإدارة فوراً.</span></div>`;
    } else if (
      currentUser.role === "supervisor" ||
      currentUser.role === "admin"
    ) {
      supportDiv.innerHTML = `<div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); border-right: 3px solid var(--primary-blue);"><strong>📬 صندوق الرسائل مفعّل:</strong> <br /><span style="color: var(--text-gray); font-size:0.85rem;">أنت تستقبل الرسائل من المعلمين والطلاب في تبويب "صندوق الرسائل".</span></div>`;
    }
  }

  if (document.getElementById("support-message-form")) {
    document
      .getElementById("support-message-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const subject = e.target.querySelector('input[type="text"]').value;
        const text = e.target.querySelector("textarea").value;

        const newMsg = {
          id: "msg_" + Date.now(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          receiverType: "admin",
          circleId: currentUser.circleId || "",
          subject: subject,
          text: text,
          timestamp: Date.now(),
          date: new Date().toLocaleString("ar-SA"),
        };

        if (!window.db.messages) window.db.messages = [];
        window.db.messages.unshift(newMsg);
        syncToFirestore("messages", newMsg.id, newMsg);
        saveLocalDB();
        renderMessages();
        alert("تم إرسال رسالتك للإدارة بنجاح! 🚀");
        e.target.reset();
      });
  }

  const notifTargetType = document.getElementById("notif-target-type");
  const notifUserGroup = document.getElementById("notif-user-select-group");
  const notifTargetUser = document.getElementById("notif-target-user");

  if (notifTargetType) {
    notifTargetType.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val.startsWith("specific_")) {
        notifUserGroup.style.display = "block";
        notifTargetUser.innerHTML =
          '<option value="" disabled selected>اختر المستخدم...</option>';
        let list = [];
        if (val === "specific_student") list = window.db.students;
        else if (val === "specific_teacher") list = window.db.users.teacher;
        else if (val === "specific_supervisor")
          list = window.db.users.supervisor;

        list.forEach((u) => {
          const phoneStr = u.phone ? ` (${u.phone})` : "";
          notifTargetUser.innerHTML += `<option value="${u.id}">${u.name}${phoneStr}</option>`;
        });
      } else {
        notifUserGroup.style.display = "none";
      }
    });

    const notifForm = document.getElementById("send-notification-form");
    if (notifForm) {
      notifForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("notif-title").value;
        const body = document.getElementById("notif-body").value;

        let type = "admin";
        let targetId = "admin";

        if (currentUser && currentUser.role === "admin") {
          type = notifTargetType.value;
          targetId = notifTargetUser.value;
          if (type.startsWith("specific_") && !targetId) {
            return alert("الرجاء تحديد المستخدم المطلوب.");
          }
        }

        const notifData = {
          id: "notif_" + Date.now(),
          title: title,
          body: body,
          targetType: type,
          targetId: targetId || "all",
          senderId: currentUser ? currentUser.id : "",
          senderName: currentUser ? currentUser.name : "مستخدم بالنظام",
          senderRole: currentUser ? currentUser.role : "teacher",
          timestamp: Date.now(),
          date: new Date().toLocaleString("ar-SA"),
        };

        try {
          await dbFirestore
            .collection("notifications_queue")
            .doc(notifData.id)
            .set(notifData);

          const internalMsg = {
            id: "msg_" + Date.now(),
            senderId: notifData.senderId,
            senderName: notifData.senderName,
            senderRole: notifData.senderRole,
            receiverType:
              type === "admin"
                ? "admin"
                : type.includes("teacher")
                  ? "teacher"
                  : type.includes("supervisor")
                    ? "supervisor"
                    : "student",
            targetType: type,
            targetId: targetId || "all",
            circleId: currentUser ? currentUser.circleId || "" : "",
            subject: "🔔 " + title,
            text: body,
            timestamp: Date.now(),
            date: notifData.date,
          };

          if (!window.db.messages) window.db.messages = [];
          window.db.messages.unshift(internalMsg);
          await syncToFirestore("messages", internalMsg.id, internalMsg);
          saveLocalDB();
          renderMessages();

          alert("✅ تم حفظ وإرسال الإشعار بنجاح للمستهدف داخل النظام! 🚀");
          e.target.reset();
          notifUserGroup.style.display = "none";
        } catch (err) {
          console.error(err);
          alert("⚠️ تم حفظ الإشعار محلياً، وسيتزامن عند استقرار الاتصال.");
        }
      });
    }
  }

  function updateTopBanner() {
    const banner = document.getElementById("daily-target-banner");
    if (banner) {
      banner.style.display = "none";
      banner.innerHTML = "";
    }
  }

  function updateDashboardStats() {
    const dashGrid = document.getElementById("main-dashboard-grid");
    if (!dashGrid) return;
    const isTeacher = currentUser.role === "teacher";
    const teacherCircles = isTeacher ? myCircleIds() : [];
    const students = isTeacher
      ? window.db.students.filter((s) => teacherCircles.includes(s.circleId))
      : window.db.students;
    const circlesCount = window.db.circles.length;
    const today = isTerm()
      ? toIsoDate(new Date())
      : new Date().toISOString().split("T")[0];
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

    const totalProgress = students.reduce((acc, s) => {
      const mLen = s.progress?.mem?.length || 0;
      const cLen = s.progress?.cons?.length || 0;
      const rLen = s.progress?.rev?.length || 0;
      return acc + mLen + cLen + rLen;
    }, 0);

    let avgProgress =
      students.length > 0 && targetDay > 0
        ? Math.round((totalProgress / (targetDay * 3 * students.length)) * 100)
        : 0;
    if (avgProgress > 100) avgProgress = 100;

    let totalMemorizedHadiths = 0;
    let behindCard = "";
    if (isTerm()) {
      // الفصل الأول: الإنجاز والمواكبة على الحفظ فقط
      let behindCount = 0;
      let pctSum = 0;
      students.forEach((s) => {
        totalMemorizedHadiths += termMemCount(s);
        pctSum += termMemPercent(s);
        const st = termMemStatus(s);
        if (st && st.behind > 0) behindCount++;
      });
      avgProgress =
        students.length > 0 ? Math.round(pctSum / students.length) : 0;
      behindCard = `<div class="stat-card" style="border-bottom-color:#991b1b;"><h3>متأخرون في الحفظ عن الخطة</h3><p class="stat-value" style="color:#991b1b;">${behindCount}</p></div>`;
    } else {
      totalMemorizedHadiths = students.reduce((acc, s) => {
        let highestMem = parseInt(s.manualProgress?.mem) || 0;
        if (highestMem === 0 && s.detailedProgress?.mem?.length > 0) {
          highestMem = Math.max(...student.detailedProgress.mem);
        }
        return acc + highestMem;
      }, 0);
    }

    if (isTeacher) {
      dashGrid.innerHTML = `<div class="stat-card"><h3>${teacherCircles.length > 1 ? `طلاب حلقاتي (${teacherCircles.length} حلقات)` : "طلاب حلقتي"}</h3><p class="stat-value">${students.length}</p></div><div class="stat-card gold"><h3>نسبة حضور الطلاب</h3><p class="stat-value">${attendanceRate}%</p></div><div class="stat-card gold"><h3>متوسط إنجاز المنهج</h3><p class="stat-value">${avgProgress}%</p></div><div class="stat-card gold" style="border-bottom-color: var(--primary-blue);"><h3>إجمالي التسميع (أحاديث)</h3><p class="stat-value" style="color: var(--primary-blue);">${totalMemorizedHadiths}</p></div>${behindCard}`;
    } else {
      dashGrid.innerHTML = `<div class="stat-card"><h3>الطلاب المسجلين</h3><p class="stat-value">${students.length}</p></div><div class="stat-card"><h3>الحلقات المسجلة</h3><p class="stat-value">${circlesCount}</p></div><div class="stat-card gold"><h3>نسبة حضور الطلاب</h3><p class="stat-value">${attendanceRate}%</p></div><div class="stat-card gold"><h3>متوسط إنجاز المنهج</h3><p class="stat-value">${avgProgress}%</p></div><div class="stat-card gold" style="border-bottom-color: var(--primary-blue);"><h3>إجمالي التسميع (أحاديث)</h3><p class="stat-value" style="color: var(--primary-blue);">${totalMemorizedHadiths}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>المرحلة الابتدائية</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "الابتدائية").length}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>المرحلة المتوسطة</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "المتوسطة").length}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>المرحلة الثانوية</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "الثانوية").length}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>المرحلة الجامعية</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "الجامعة").length}</p></div><div class="stat-card" style="border-bottom-color:#64748b;"><h3>أعلى من ذلك</h3><p class="stat-value" style="color:var(--text-dark); font-size:1.8rem;">${students.filter((s) => s.level === "أعلى من ذلك").length}</p></div>${behindCard}`;
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

    const stuCircleSelect = document.getElementById("stu-circle");
    if (stuCircleSelect) {
      const currentVal = stuCircleSelect.value;
      stuCircleSelect.innerHTML =
        '<option value="" selected>اختر الحلقة (اختياري / أو يوزع لاحقاً)...</option>';
      window.db.circles.forEach((c) => {
        let trackObj = window.db.tracks.find((t) => t.id === c.trackId);
        let trackName = trackObj ? trackObj.name : "مسار غير محدد";
        let typeLabel =
          c.trackId === "all" ? " (حلقة عامة)" : ` (مخصصة: ${trackName})`;
        stuCircleSelect.innerHTML += `<option value="${c.id}">${c.name}${typeLabel}</option>`;
      });
      if (currentVal && window.db.circles.find((c) => c.id === currentVal)) {
        stuCircleSelect.value = currentVal;
      }
    }

    const reportFilter = document.getElementById("report-circle-filter");
    if (reportFilter) {
      if (currentUser && currentUser.role === "teacher") {
        const prevVal = reportFilter.value;
        const ids = myCircleIds();
        reportFilter.innerHTML = '<option value="all">كل حلقاتي</option>';
        window.db.circles
          .filter((c) => ids.includes(c.id))
          .forEach((c) => {
            reportFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
          });
        if (prevVal && ids.includes(prevVal)) reportFilter.value = prevVal;
      } else {
        reportFilter.innerHTML = '<option value="all">كافة الحلقات</option>';
        window.db.circles.forEach((c) => {
          reportFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
      }
    }

    // اختيار الحلقة في صفحة المتابعة: يظهر للمعلم الذي لديه أكثر من حلقة
    const trackingFilter = document.getElementById("tracking-circle-filter");
    if (trackingFilter) {
      const ids =
        currentUser && currentUser.role === "teacher" ? myCircleIds() : [];
      if (currentUser && currentUser.role !== "teacher" && isTerm()) {
        // المدير والمشرف في الفصل: اختيار الحلقة (تُعرض حلقة واحدة افتراضياً لتخفيف الصفحة)
        const prevVal = trackingFilter.value;
        trackingFilter.innerHTML =
          window.db.circles
            .map((c) => `<option value="${c.id}">${c.name}</option>`)
            .join("") +
          '<option value="none">طلاب بدون حلقة</option><option value="all">كل الطلاب</option>';
        if (
          prevVal &&
          Array.from(trackingFilter.options).some((o) => o.value === prevVal)
        )
          trackingFilter.value = prevVal;
        trackingFilter.style.display = "block";
      } else if (ids.length > 1) {
        const prevVal = trackingFilter.value;
        trackingFilter.innerHTML = '<option value="all">كل حلقاتي</option>';
        window.db.circles
          .filter((c) => ids.includes(c.id))
          .forEach((c) => {
            trackingFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
          });
        if (prevVal && ids.includes(prevVal)) trackingFilter.value = prevVal;
        trackingFilter.style.display = "block";
      } else {
        trackingFilter.innerHTML = '<option value="all"></option>';
        trackingFilter.style.display = "none";
      }
    }
  }
  const stuTrackSelect = document.getElementById("stu-track");
  const stuCircleSelect = document.getElementById("stu-circle");
  if (stuTrackSelect && stuCircleSelect) {
    stuTrackSelect.addEventListener("change", (e) => {
      const selectedTrack = e.target.value;
      const matchingCircle = window.db.circles.find(
        (c) => c.trackId === selectedTrack,
      );
      if (matchingCircle) {
        stuCircleSelect.value = matchingCircle.id;
      } else {
        const generalCircle = window.db.circles.find(
          (c) => c.trackId === "all",
        );
        if (generalCircle) stuCircleSelect.value = generalCircle.id;
        else stuCircleSelect.value = "";
      }
    });
  }

  const addTrackForm = document.getElementById("add-track-form");
  if (addTrackForm) {
    addTrackForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const trackName = document.getElementById("track-name-input").value;
      const newId = "t" + Date.now();
      const newTrack = {
        id: newId,
        name: trackName,
        totalDays: 23,
        totalHadiths: 150,
        createdAt: Date.now(),
      };
      if (isTerm()) {
        // خطة الفصل بالأسابيع: كل أسبوع 4 أيام (الأحد إلى الأربعاء)
        const weeks =
          parseInt(document.getElementById("track-weeks-input").value) || 12;
        newTrack.totalDays = Math.min(60, Math.max(1, weeks)) * 4;
        newTrack.programId = TERM;
        const start = termStartDate();
        if (start) newTrack.startDate = start;
      }
      window.db.tracks.push(newTrack);
      window.db.scheduleData[newId] = emptySchedule(newTrack.totalDays);
      e.target.reset();
      saveLocalDB();
      refreshAllViews();
      const ok = await saveTrackToFirestore(newId);
      trackSaveAlert(ok, "تم حفظ المسار في قاعدة البيانات!");
      addLog(`إنشاء مسار جديد: ${trackName}`, "عام");
    });
  }

  // تاريخ بداية خطة الفصل (أول جمعة)، محفوظ مع مسارات الفصل
  function termStartDate() {
    const t = (programs ? programs[TERM].tracks : []).find((x) => x.startDate);
    return t ? t.startDate : "";
  }

  function renderTermStartInfo() {
    const input = document.getElementById("term-start-input");
    const info = document.getElementById("term-start-info");
    if (!input || !info) return;
    const start = termStartDate();
    if (document.activeElement !== input) input.value = start;
    const d = parseIsoDate(start);
    info.textContent = d
      ? `بداية الخطة: ${hijriDate(start)}`
      : "لم يتم تحديد تاريخ بداية الخطة بعد، ولن تظهر المواكبة حتى يُحدد.";
  }

  const termStartForm = document.getElementById("term-start-form");
  if (termStartForm) {
    termStartForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!isTerm()) return;
      const value = document.getElementById("term-start-input").value;
      const d = parseIsoDate(value);
      if (!d) return alert("الرجاء اختيار التاريخ.");
      if (d.getDay() !== 5)
        return alert("⚠️ التاريخ المختار ليس يوم جمعة. اختر تاريخ أول جمعة في الدورة.");
      const termTracks = window.db.tracks;
      if (termTracks.length === 0)
        return alert("أضف مسارات الفصل أولاً، ثم حدد تاريخ البداية.");
      termTracks.forEach((t) => (t.startDate = value));
      saveLocalDB();
      refreshAllViews();
      let allOk = true;
      for (const t of termTracks) {
        if (!(await saveTrackToFirestore(t.id))) allOk = false;
      }
      trackSaveAlert(allOk, "تم حفظ تاريخ بداية الخطة لكل مسارات الفصل.");
      addLog(`تحديد بداية خطة الفصل: ${value}`, "عام");
    });
  }

  const addStudentForm = document.getElementById("add-student-form");
  if (addStudentForm) {
    addStudentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const sName = document.getElementById("stu-name").value;
      const sTrackId = document.getElementById("stu-track").value;
      const selectedCircleId = document.getElementById("stu-circle").value;

      const idInput = document.getElementById("stu-id-number");
      const phoneInput = document.getElementById("stu-phone");

      const newStudent = {
        id: "s" + Date.now(),
        name: sName,
        idNumber: idInput ? idInput.value : "",
        phone: phoneInput ? phoneInput.value : "",
        pin: document.getElementById("stu-pin").value,
        level: document.getElementById("stu-level").value,
        trackId: sTrackId,
        circleId: selectedCircleId,
        progress: { mem: [], cons: [], rev: [] },
        manualProgress: { mem: "", cons: "", rev: "" },
        detailedProgress: { mem: [], cons: [], rev: [] },
        tasksTiming: { mem: {}, cons: {}, rev: {} },
      };

      stampProgram(newStudent);
      window.db.students.push(newStudent);
      e.target.reset();

      const pinField = document.getElementById("stu-pin");
      if (pinField) {
        pinField.type = "password";
        const tb = pinField.nextElementSibling;
        if (tb) tb.innerHTML = eyeOpenSVG;
      }

      saveLocalDB();
      syncToFirestore("students", newStudent.id, newStudent);
      refreshAllViews();

      let cName = "بدون حلقة (سيتم توزيعه لاحقاً)";
      if (selectedCircleId) {
        const cObj = window.db.circles.find((c) => c.id === selectedCircleId);
        if (cObj) cName = cObj.name;
      }

      alert(`تم تسجيل الطالب بنجاح!\nالحلقة التي تم ضمه إليها: ${cName}`);
      addLog(`تسجيل طالب وتوزيعه: ${sName}`, cName);
    });
  }

  // ================= استيراد الطلاب من ملف Excel =================
  // يضيف طلاباً جدداً فقط، ولا يعدّل أو يحذف أي طالب موجود
  const IMPORT_LEVELS = [
    "الابتدائية",
    "المتوسطة",
    "الثانوية",
    "الجامعة",
    "أعلى من ذلك",
  ];
  const IMPORT_HEADERS = [
    "الاسم",
    "رقم الجوال",
    "رقم الهوية",
    "المرحلة",
    "المسار",
    "الحلقة",
    "الرقم السري",
  ];
  let importRows = [];

  function loadXLSX() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = () => resolve(window.XLSX);
      s.onerror = () => reject(new Error("xlsx load failed"));
      document.head.appendChild(s);
    });
  }

  function toLatinDigits(v) {
    return String(v == null ? "" : v)
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .trim();
  }

  function normAr(v) {
    return String(v == null ? "" : v)
      .replace(/[ً-ْـ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[-–_()\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function normPhone(v) {
    let p = toLatinDigits(v).replace(/[^\d]/g, "");
    if (p.startsWith("00966")) p = "0" + p.slice(5);
    else if (p.startsWith("966") && p.length === 12) p = "0" + p.slice(3);
    if (p.length === 9 && p.startsWith("5")) p = "0" + p;
    return p;
  }

  function matchLevel(v) {
    const n = normAr(v);
    if (!n) return "";
    if (n.includes("ابتدا")) return "الابتدائية";
    if (n.includes("متوسط")) return "المتوسطة";
    if (n.includes("ثانو")) return "الثانوية";
    if (n.includes("جامع")) return "الجامعة";
    if (n.includes("اعلي") || n.includes("اعلى")) return "أعلى من ذلك";
    return null;
  }

  // أسماء الأعمدة المقبولة: مطابقة تامة أولاً، ثم عنوان يحتوي الكلمة (مع تجنب أعمدة ولي الأمر ونحوها)
  const IMPORT_COLUMNS = [
    ["name", ["الاسم", "اسم الطالب", "الاسم الرباعي", "الاسم الكامل", "اسم المستفيد", "الطالب", "المستفيد"], ["اسم"], ["ولي", "الاب", "الام", "مسار", "حلقه", "معلم", "مدرسه"]],
    ["idNumber", ["رقم الهوية", "الهوية", "الهوية الوطنية", "السجل المدني", "رقم السجل المدني", "رقم الإقامة", "الإقامة"], ["هويه", "سجل مدني", "السجل المدني", "اقامه"], ["ولي", "الاب", "الام"]],
    ["phone", ["رقم الجوال", "الجوال", "جوال الطالب", "رقم جوال الطالب", "الهاتف", "رقم الهاتف", "هاتف الطالب", "الموبايل", "رقم التواصل", "جوال"], ["جوال", "هاتف", "موبايل", "تواصل"], ["ولي", "الاب", "الام"]],
    ["level", ["المرحلة", "المرحلة الدراسية", "الصف", "الصف الدراسي", "المستوى الدراسي"], ["مرحله", "الصف"], []],
    ["track", ["المسار", "اسم المسار"], ["مسار"], []],
    ["circle", ["الحلقة", "اسم الحلقة"], ["حلقه"], []],
    ["pin", ["الرقم السري", "كلمة المرور", "الرمز السري", "كلمة السر"], ["سري", "مرور", "كلمه السر"], []],
  ];

  function mapImportColumns(headerRow) {
    const normed = (headerRow || []).map((h) => normAr(h));
    const taken = [];
    const find = (exact, contains, avoid) => {
      for (const name of exact) {
        const i = normed.findIndex(
          (h, idx) => h === normAr(name) && !taken.includes(idx),
        );
        if (i > -1) return i;
      }
      for (const word of contains) {
        const i = normed.findIndex(
          (h, idx) =>
            h &&
            !taken.includes(idx) &&
            h.includes(normAr(word)) &&
            !avoid.some((a) => h.includes(normAr(a))),
        );
        if (i > -1) return i;
      }
      return -1;
    };
    const col = {};
    IMPORT_COLUMNS.forEach(([key, exact, contains, avoid]) => {
      col[key] = find(exact, contains, avoid);
      // إن لم يوجد إلا جوال ولي الأمر يُستخدم
      if (key === "phone" && col.phone === -1) col.phone = find([], contains, []);
      if (col[key] > -1) taken.push(col[key]);
    });
    return col;
  }

  // صف العناوين: أول صف (من أول 10) فيه عمود الاسم أو الجوال أو الهوية،
  // ومعه عمود آخر، أو يكون عنوانه مطابقاً تماماً (حتى لا يُعتبر عنوان مثل "كشف أسماء الطلاب" صف عناوين)
  function findImportHeader(rows) {
    const exactMain = IMPORT_COLUMNS.filter(([key]) =>
      ["name", "phone", "idNumber"].includes(key),
    ).flatMap(([, exact]) => exact.map((e) => normAr(e)));
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const col = mapImportColumns(rows[i]);
      const found = Object.values(col).filter((x) => x > -1).length;
      const hasMain = col.name > -1 || col.phone > -1 || col.idNumber > -1;
      const hasExact = (rows[i] || []).some((h) =>
        exactMain.includes(normAr(h)),
      );
      if (hasMain && (found >= 2 || hasExact)) return { headerIdx: i, col };
    }
    return null;
  }

  function parseImportSheet(rows, headerIdx, col) {
    const cell = (r, i) => (i > -1 && r[i] != null ? r[i] : "");

    const existingIds = new Set(
      window.db.students.map((s) => toLatinDigits(s.idNumber)).filter(Boolean),
    );
    const existingPhones = new Map();
    window.db.students.forEach((s) => {
      const p = normPhone(s.phone);
      if (!p) return;
      if (!existingPhones.has(p)) existingPhones.set(p, new Set());
      existingPhones.get(p).add(normAr(s.name));
    });
    const existingNames = new Set(window.db.students.map((s) => normAr(s.name)));
    const fileIds = new Set();
    const filePhones = new Map();
    const result = [];

    rows.slice(headerIdx + 1).forEach((r, i) => {
      const rowNum = headerIdx + i + 2;
      if (!r || r.every((c) => String(c == null ? "" : c).trim() === ""))
        return;
      const errors = [];
      const warnings = [];
      let maybeDuplicate = false;

      const name = String(cell(r, col.name)).replace(/\s+/g, " ").trim();
      const nName = normAr(name);
      const phone = normPhone(cell(r, col.phone));
      const idNumber = toLatinDigits(cell(r, col.idNumber)).replace(/\s/g, "");
      const levelRaw = String(cell(r, col.level)).trim();
      const trackRaw = String(cell(r, col.track)).trim();
      const circleRaw = String(cell(r, col.circle)).trim();
      const pinCell = cell(r, col.pin);
      let pin = toLatinDigits(pinCell);
      if (typeof pinCell === "number" && pin.length > 0 && pin.length < 4)
        pin = pin.padStart(4, "0");
      if (!pin) pin = "1234";
      else if (!/^\d{4}$/.test(pin)) {
        warnings.push("الرقم السري غير صالح وسيكون 1234");
        pin = "1234";
      }

      if (!name) warnings.push("بدون اسم");
      if (phone && phone.length < 7) warnings.push("رقم الجوال قصير");

      let level = "غير محدد";
      if (levelRaw) {
        const m = matchLevel(levelRaw);
        if (m) level = m;
        else warnings.push(`المرحلة (${levelRaw}) غير معروفة وستكون غير محدد`);
      }

      let track = null;
      if (trackRaw) {
        track =
          window.db.tracks.find((t) => t.id === trackRaw) ||
          window.db.tracks.find((t) => normAr(t.name) === normAr(trackRaw));
        if (!track) errors.push(`مسار غير موجود: ${trackRaw}`);
      }

      let circle = null;
      if (circleRaw) {
        circle = window.db.circles.find(
          (c) => normAr(c.name) === normAr(circleRaw),
        );
        if (!circle) errors.push(`حلقة غير موجودة: ${circleRaw}`);
        else if (track && circle.trackId !== "all" && circle.trackId !== track.id)
          warnings.push("الحلقة مخصصة لمسار آخر");
      }

      // التكرار: نفس الهوية = نفس الطالب، ونفس الجوال مع نفس الاسم = نفس الطالب
      if (idNumber) {
        if (existingIds.has(idNumber)) errors.push("رقم الهوية مسجل مسبقاً");
        else if (fileIds.has(idNumber)) errors.push("رقم الهوية مكرر في الملف");
      }
      if (phone) {
        const inDb = existingPhones.get(phone);
        const inFile = filePhones.get(phone);
        if ((inDb && inDb.has(nName)) || (inFile && inFile.has(nName)))
          errors.push(inDb && inDb.has(nName) ? "الطالب مسجل مسبقاً" : "الطالب مكرر في الملف");
        else if (inDb || inFile)
          warnings.push(
            inDb ? "الجوال مسجل لطالب آخر" : "الجوال مكرر لطالب آخر في الملف",
          );
      }
      if (!phone && !idNumber && name && existingNames.has(nName)) {
        warnings.push("يوجد طالب مسجل بنفس الاسم");
        maybeDuplicate = true;
      }

      if (errors.length === 0) {
        if (idNumber) fileIds.add(idNumber);
        if (phone) {
          if (!filePhones.has(phone)) filePhones.set(phone, new Set());
          filePhones.get(phone).add(nName);
        }
      }

      result.push({
        rowNum,
        name,
        phone,
        idNumber,
        pin,
        level,
        trackId: track ? track.id : "",
        trackName: track ? track.name : trackRaw || "—",
        circleId: circle ? circle.id : "",
        circleName: circle ? circle.name : circleRaw || "بدون حلقة",
        errors,
        warnings,
        selected: errors.length === 0 && !maybeDuplicate,
      });
    });
    return result;
  }

  function updateImportCounts() {
    const ok = importRows.filter((r) => r.errors.length === 0);
    const bad = importRows.length - ok.length;
    const chosen = ok.filter((r) => r.selected).length;
    document.getElementById("import-summary").innerHTML =
      `عدد الصفوف في الملف: <strong>${importRows.length}</strong> — ` +
      `<span style="color:#166534; font-weight:bold;">المحدد للحفظ: ${chosen}</span>` +
      (bad
        ? ` — <span style="color:#991b1b; font-weight:bold;">فيها أخطاء ولن تُحفظ: ${bad}</span>`
        : "") +
      `<br><span style="color:var(--text-gray); font-size:0.8rem;">يمكنك إلغاء تحديد أي صف لا تريد حفظه. لن يتم تعديل أو حذف أي طالب موجود، الإضافة فقط للطلاب الجدد.</span>`;
    const btn = document.getElementById("import-confirm-btn");
    btn.disabled = chosen === 0;
    btn.textContent =
      chosen > 0 ? `حفظ ${chosen} طالب` : "لا يوجد طلاب محددون للحفظ";
  }

  function renderImportPreview() {
    const tbody = document.getElementById("import-preview-body");
    tbody.innerHTML = importRows
      .map((r, idx) => {
        const bg = r.errors.length
          ? "#fee2e2"
          : r.warnings.length
            ? "#fef9c3"
            : "#fff";
        const status = r.errors.length
          ? `<span style="color:#991b1b; font-weight:bold;">❌ ${r.errors.join("، ")}</span>`
          : r.warnings.length
            ? `<span style="color:#a16207; font-weight:bold;">⚠️ ${r.warnings.join("، ")}</span>`
            : `<span style="color:#166534; font-weight:bold;">✅ جاهز</span>`;
        const esc = (v) =>
          String(v).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
        const check = `<input type="checkbox" class="import-row-check" data-idx="${idx}" style="width:18px; height:18px; accent-color:var(--primary-blue);" ${r.selected ? "checked" : ""} ${r.errors.length ? "disabled" : ""}>`;
        return `<tr style="background:${bg};"><td style="text-align:center;">${check}</td><td>${r.rowNum}</td><td style="font-weight:700;">${esc(r.name)}</td><td dir="ltr">${esc(r.phone)}</td><td dir="ltr">${esc(r.idNumber)}</td><td>${esc(r.level)}</td><td style="font-size:0.75rem;">${esc(r.trackName)}</td><td>${esc(r.circleName)}</td><td style="font-size:0.8rem;">${status}</td></tr>`;
      })
      .join("");
    tbody.querySelectorAll(".import-row-check").forEach((chk) =>
      chk.addEventListener("change", () => {
        const row = importRows[parseInt(chk.dataset.idx)];
        if (row) row.selected = chk.checked;
        updateImportCounts();
      }),
    );
    updateImportCounts();
    document.getElementById("import-modal").classList.add("active");
  }

  window.closeImportModal = function () {
    document.getElementById("import-modal").classList.remove("active");
    importRows = [];
  };

  const importBtn = document.getElementById("import-students-btn");
  const importFile = document.getElementById("import-students-file");
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => {
      importFile.value = "";
      importFile.click();
    });
    importFile.addEventListener("change", async () => {
      const file = importFile.files[0];
      if (!file) return;
      let XLSX;
      try {
        XLSX = await loadXLSX();
      } catch (e) {
        return alert("تعذر تحميل أداة قراءة ملفات Excel، تأكد من الاتصال بالإنترنت.");
      }
      try {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: "array" });
        // البحث في كل صفحات الملف عن جدول الطلاب (مع تجاهل صفحة القوائم في النموذج)
        let parsed = null;
        let foundHeader = false;
        for (const sheetName of wb.SheetNames) {
          if (sheetName === "القوائم والتعليمات") continue;
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
            header: 1,
            defval: "",
            raw: true,
          });
          const h = findImportHeader(rows);
          if (!h) continue;
          foundHeader = true;
          const sheetRows = parseImportSheet(rows, h.headerIdx, h.col);
          if (sheetRows.length > 0) {
            parsed = sheetRows;
            break;
          }
        }
        if (!foundHeader)
          return alert(
            "لم يتم العثور على جدول الطلاب في الملف.\nيجب أن يحتوي على صف عناوين مثل: الاسم، رقم الجوال، المسار.\nاستخدم زر (تحميل نموذج Excel) لمعرفة الشكل المطلوب.",
          );
        if (!parsed) return alert("الملف لا يحتوي على طلاب.");
        importRows = parsed;
        renderImportPreview();
      } catch (e) {
        console.error(e);
        alert("تعذر قراءة الملف. تأكد أنه ملف Excel صحيح (xlsx).");
      }
    });
  }

  const importConfirmBtn = document.getElementById("import-confirm-btn");
  if (importConfirmBtn) {
    importConfirmBtn.addEventListener("click", async () => {
      const ready = importRows.filter(
        (r) => r.errors.length === 0 && r.selected,
      );
      if (ready.length === 0) return;
      if (typeof dbFirestore === "undefined" || !navigator.onLine)
        return alert("الاستيراد يحتاج اتصالاً بالإنترنت، حاول مرة أخرى بعد الاتصال.");

      importConfirmBtn.disabled = true;
      importConfirmBtn.textContent = "جاري الحفظ...";
      const base = Date.now();
      const newStudents = ready.map((r, i) => stampProgram({
        id: "s" + (base + i),
        name: r.name,
        idNumber: r.idNumber,
        phone: r.phone,
        pin: r.pin,
        level: r.level,
        trackId: r.trackId,
        circleId: r.circleId,
        progress: { mem: [], cons: [], rev: [] },
        manualProgress: { mem: "", cons: "", rev: "" },
        detailedProgress: { mem: [], cons: [], rev: [] },
        tasksTiming: { mem: {}, cons: {}, rev: {} },
      }));

      // الحفظ على دفعات (حد قاعدة البيانات 500 في الدفعة)، ولا يضاف للنظام إلا ما حُفظ فعلياً
      let savedCount = 0;
      let failed = false;
      for (let i = 0; i < newStudents.length; i += 400) {
        const chunk = newStudents.slice(i, i + 400);
        try {
          const batch = dbFirestore.batch();
          chunk.forEach((s) =>
            batch.set(dbFirestore.collection("students").doc(s.id), s),
          );
          await batch.commit();
          window.db.students.push(...chunk);
          savedCount += chunk.length;
        } catch (e) {
          console.error("فشل حفظ دفعة من الطلاب:", e);
          failed = true;
          break;
        }
      }

      try {
        saveLocalDB();
      } catch (e) {
        console.warn("تعذر حفظ النسخة المحلية:", e);
      }
      closeImportModal();
      refreshAllViews();
      if (savedCount > 0)
        addLog(`استيراد ${savedCount} طالب من ملف Excel`, "عام");
      alert(
        failed
          ? `⚠️ تم حفظ ${savedCount} طالب فقط من أصل ${newStudents.length}، وحدث خطأ في الاتصال.\nالطلاب الذين لم يُحفظوا لم يُضافوا، يمكنك إعادة استيراد نفس الملف وسيتجاهل المسجلين.`
          : `✅ تم حفظ ${savedCount} طالب بنجاح في قاعدة البيانات!`,
      );
      importConfirmBtn.disabled = false;
    });
  }

  const templateBtn = document.getElementById("download-template-btn");
  if (templateBtn) {
    templateBtn.addEventListener("click", async () => {
      let XLSX;
      try {
        XLSX = await loadXLSX();
      } catch (e) {
        return alert("تعذر تحميل أداة ملفات Excel، تأكد من الاتصال بالإنترنت.");
      }
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([IMPORT_HEADERS]);
      ws["!cols"] = [
        { wch: 30 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 40 },
        { wch: 22 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "الطلاب");

      const maxLen = Math.max(
        IMPORT_LEVELS.length,
        window.db.tracks.length,
        window.db.circles.length,
      );
      const lists = [["المراحل المقبولة", "المسارات المتاحة", "الحلقات المتاحة"]];
      for (let i = 0; i < maxLen; i++)
        lists.push([
          IMPORT_LEVELS[i] || "",
          window.db.tracks[i] ? window.db.tracks[i].name : "",
          window.db.circles[i] ? window.db.circles[i].name : "",
        ]);
      lists.push([]);
      lists.push(["ملاحظات:"]);
      lists.push(["- اكتب اسم المسار والحلقة كما هو في هذه القائمة."]);
      lists.push(["- الرقم السري الافتراضي للدخول: 1234"]);
      const ws2 = XLSX.utils.aoa_to_sheet(lists);
      ws2["!cols"] = [{ wch: 18 }, { wch: 45 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, ws2, "القوائم والتعليمات");
      wb.Workbook = { Views: [{ RTL: true }] };
      XLSX.writeFile(wb, "نموذج_استيراد_الطلاب.xlsx");
    });
  }

  const addTeacherForm = document.getElementById("add-teacher-form");
  if (addTeacherForm) {
    addTeacherForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const tName = document.getElementById("teacher-name").value;
      const phoneInput = document.getElementById("teacher-phone");

      const newTeacher = {
        id: "tech" + Date.now(),
        name: tName,
        pin: document.getElementById("teacher-pin").value,
        phone: phoneInput ? phoneInput.value : "",
        circleId: "",
        role: "teacher",
      };
      stampProgram(newTeacher);
      window.db.users.teacher.push(newTeacher);
      e.target.reset();

      const pinField = document.getElementById("teacher-pin");
      if (pinField) {
        pinField.type = "password";
        const tb = pinField.nextElementSibling;
        if (tb) tb.innerHTML = eyeOpenSVG;
      }

      saveLocalDB();
      syncToFirestore("users", newTeacher.id, newTeacher);
      refreshAllViews();
      alert("تم تسجيل المعلم!");
      addLog(`إضافة معلم جديد: ${tName}`, "عام");
    });
  }

  const addSupervisorForm = document.getElementById("add-supervisor-form");
  if (addSupervisorForm) {
    addSupervisorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const supName = document.getElementById("supervisor-name").value;
      const phoneInput = document.getElementById("supervisor-phone");

      const newSup = {
        id: "sup" + Date.now(),
        name: supName,
        phone: phoneInput ? phoneInput.value : "",
        pin: document.getElementById("supervisor-pin").value,
        role: "supervisor",
      };
      stampProgram(newSup);
      window.db.users.supervisor.push(newSup);
      e.target.reset();

      const pinField = document.getElementById("supervisor-pin");
      if (pinField) {
        pinField.type = "password";
        const tb = pinField.nextElementSibling;
        if (tb) tb.innerHTML = eyeOpenSVG;
      }

      saveLocalDB();
      syncToFirestore("users", newSup.id, newSup);
      refreshAllViews();
      alert("تم تسجيل المشرف!");
      addLog(`إضافة مشرف جديد: ${supName}`, "عام");
    });
  }

  const newCircleForm = document.getElementById("new-circle-form");
  if (newCircleForm) {
    const typeRadios = newCircleForm.querySelectorAll(
      'input[name="circle_type"]',
    );
    const trackContainer = document.getElementById("circle-track-container");
    typeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "all") trackContainer.style.display = "none";
        else trackContainer.style.display = "block";
      });
    });

    newCircleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const circleId = "c" + Date.now();
      const circleName = document.getElementById("new-circle-name").value;
      const cType = newCircleForm.querySelector(
        'input[name="circle_type"]:checked',
      ).value;
      const trackId =
        cType === "all"
          ? "all"
          : document.getElementById("new-circle-track").value;

      if (cType === "specific" && !trackId) {
        alert(
          "⚠️ الرجاء اختيار المسار المخصص لهذه الحلقة قبل الحفظ لكي يتعرف عليها النظام.",
        );
        return;
      }

      const teacherId = document.getElementById("new-circle-teacher").value;
      const newCircle = {
        id: circleId,
        name: circleName,
        teacherId: teacherId,
        trackId: trackId,
      };
      stampProgram(newCircle);
      window.db.circles.push(newCircle);

      // المعلم يحتفظ بحلقاته السابقة، وتضاف له هذه الحلقة
      const teacher = window.db.users.teacher.find((t) => t.id === teacherId);
      if (teacher && !hasValidCircle(teacher)) {
        teacher.circleId = circleId;
        syncToFirestore("users", teacher.id, teacher);
      }

      e.target.reset();
      trackContainer.style.display = "block";
      saveLocalDB();
      syncToFirestore("groups", circleId, newCircle);
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
          let hasChanged = false;
          if (chk.checked && student.circleId !== circleId) {
            student.circleId = circleId;
            hasChanged = true;
          } else if (!chk.checked && student.circleId === circleId) {
            student.circleId = "";
            hasChanged = true;
          }
          if (hasChanged) syncToFirestore("students", student.id, student);
        }
      });
      saveLocalDB();
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
      <td>
        <button class="btn-action" onclick="openEditModal('circle', '${c.id}')">تعديل</button>
        <button class="btn-action" style="background:var(--danger-btn); color:white; border-color:var(--danger-btn); margin-right:5px;" onclick="deleteCircle('${c.id}')">حذف</button>
      </td></tr>`;
    });
  }

  function renderTracks() {
    renderTermStartInfo();
    const tbody = document.getElementById("tracks-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    window.db.tracks.forEach(
      (t, i) =>
        (tbody.innerHTML += `<tr><td>${i + 1}</td><td style="font-weight:700;">${t.name}</td>
    <td><button class="btn-action" onclick="openEditModal('track', '${t.id}')">تعديل الاسم</button><button class="btn-action" style="background:var(--primary-light); color:var(--primary-blue); margin-right:5px;" onclick="openScheduleModal('${t.id}')">تعديل المقررات</button></td></tr>`),
    );
  }

  window.deleteStudent = async function (studentId) {
    if (
      confirm(
        "⚠️ تحذير: هل أنت متأكد من رغبتك في حذف هذا الطالب نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.",
      )
    ) {
      const student = window.db.students.find((s) => s.id === studentId);
      window.db.students = window.db.students.filter((s) => s.id !== studentId);

      window.db.dailyRecords = window.db.dailyRecords.filter((r) => {
        if (r.studentId === studentId) {
          deleteFromFirestore("dailyRecords", r.studentId + "_" + r.date);
          return false;
        }
        return true;
      });

      deleteFromFirestore("students", studentId);
      saveLocalDB();
      refreshAllViews();
      alert("تم حذف الطالب بنجاح.");
      addLog(`حذف الطالب: ${student ? student.name : "غير معروف"}`, "عام");
    }
  };

  window.deleteCircle = async function (circleId) {
    if (
      confirm(
        "⚠️ هل أنت متأكد من حذف هذه الحلقة؟ (لن يتم حذف الطلاب، بل سيصبحون بدون حلقة متصلة).",
      )
    ) {
      const circle = window.db.circles.find((c) => c.id === circleId);
      window.db.circles = window.db.circles.filter((c) => c.id !== circleId);

      detachCircleFromOtherTeachers(circleId, null);
      window.db.students.forEach((s) => {
        if (s.circleId === circleId) {
          s.circleId = "";
          syncToFirestore("students", s.id, s);
        }
      });

      deleteFromFirestore("groups", circleId);
      saveLocalDB();
      refreshAllViews();
      alert("تم حذف الحلقة بنجاح.");
      addLog(`حذف الحلقة: ${circle ? circle.name : "غير معروف"}`, "عام");
    }
  };

  window.deleteTeacher = async function (teacherId) {
    if (confirm("⚠️ هل أنت متأكد من حذف هذا المعلم؟")) {
      const teacher = window.db.users.teacher.find((t) => t.id === teacherId);
      window.db.users.teacher = window.db.users.teacher.filter(
        (t) => t.id !== teacherId,
      );

      window.db.circles.forEach((c) => {
        if (c.teacherId === teacherId) {
          c.teacherId = "";
          syncToFirestore("groups", c.id, c);
        }
      });

      deleteFromFirestore("users", teacherId);
      saveLocalDB();
      refreshAllViews();
      alert("تم حذف المعلم بنجاح.");
      addLog(`حذف المعلم: ${teacher ? teacher.name : "غير معروف"}`, "عام");
    }
  };

  function renderStudents() {
    const tbody = document.getElementById("students-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    let displayStudents = window.db.students;

    if (currentUser.role === "teacher") {
      const ids = myCircleIds();
      displayStudents = displayStudents.filter((s) =>
        ids.includes(s.circleId),
      );
    }

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
    const searchVal = document.getElementById("admin-teacher-search")
      ? document.getElementById("admin-teacher-search").value.toLowerCase()
      : "";
    let filteredTeachers = window.db.users.teacher;
    if (searchVal)
      filteredTeachers = filteredTeachers.filter((t) =>
        t.name.toLowerCase().includes(searchVal),
      );

    filteredTeachers.forEach((t) => {
      const ids = getTeacherCircleIds(t.id);
      const circleNames = window.db.circles
        .filter((c) => ids.includes(c.id))
        .map((c) => c.name)
        .join("، ");
      const circle = { name: circleNames || "غير مكلف" };
      tbody.innerHTML += `<tr><td style="font-weight:700;">${t.name}</td><td style="letter-spacing: 2px;">${t.pin}</td><td style="color:${circle.name === "غير مكلف" ? "var(--danger-btn)" : "inherit"}">${circle.name}</td>
      <td>
        <button class="btn-action" onclick="openEditModal('teacher', '${t.id}')">تعديل</button>
        <button class="btn-action" style="background:var(--danger-btn); color:white; border-color:var(--danger-btn); margin-right:5px;" onclick="deleteTeacher('${t.id}')">حذف</button>
      </td></tr>`;
    });
  }

  let editingContext = { type: null, id: null };
  window.openEditModal = function (type, id) {
    editingContext = { type, id };
    const modal = document.getElementById("edit-modal");
    const fields = document.getElementById("edit-form-fields");
    fields.innerHTML = "";

    const eyeOpenSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;

    if (type === "student") {
      const s = window.db.students.find((x) => x.id === id);
      if (!s) return alert("خطأ: لم يتم العثور على بيانات الطالب.");
      document.getElementById("edit-modal-title").textContent =
        "تعديل بيانات الطالب";
      let trackOpts = "";
      window.db.tracks.forEach(
        (t) =>
          (trackOpts += `<option value="${t.id}" ${s.trackId === t.id ? "selected" : ""}>${t.name}</option>`),
      );
      let circleOpts = "<option value=''>غير موزع لحلقة</option>";
      window.db.circles.forEach((c) => {
        circleOpts += `<option value="${c.id}" ${s.circleId === c.id ? "selected" : ""}>${c.name}</option>`;
      });

      fields.innerHTML = `
        <div class="input-group"><label>اسم الطالب</label><input type="text" id="edit-stu-name" class="modern-input" value="${s.name}" required></div>
        <div style="display:flex; gap:10px;">
          <div class="input-group" style="flex:1"><label>رقم الهوية</label><input type="text" id="edit-stu-id" class="modern-input" value="${s.idNumber || ""}"></div>
          <div class="input-group" style="flex:1"><label>رقم الجوال</label><input type="tel" id="edit-stu-phone" class="modern-input" value="${s.phone || ""}" required></div>
        </div>
        <div class="input-group"><label>الرقم السري</label><div class="password-wrapper"><input type="password" id="edit-stu-pin" class="modern-input" value="${s.pin || "1234"}" maxlength="4" required><button type="button" class="toggle-password-btn">${eyeOpenSVG}</button></div></div>
        <div class="input-group"><label>المسار</label><select id="edit-stu-track" class="modern-input">${trackOpts}</select></div>
        <div class="input-group"><label>الحلقة</label><select id="edit-stu-circle" class="modern-input">${circleOpts}</select></div>
      `;
    } else if (type === "teacher") {
      const t = window.db.users.teacher.find((x) => x.id === id);
      if (!t) return alert("خطأ.");
      document.getElementById("edit-modal-title").textContent =
        "تعديل بيانات المعلم";
      const myIds = getTeacherCircleIds(t.id);
      let cOpts = "";
      window.db.circles.forEach((c) => {
        const otherTeacher =
          c.teacherId && c.teacherId !== t.id
            ? window.db.users.teacher.find((x) => x.id === c.teacherId)
            : null;
        const otherText = otherTeacher
          ? ` <span style="color:var(--text-gray); font-size:0.75rem;">(حالياً مع: ${otherTeacher.name})</span>`
          : "";
        cOpts += `<label style="display:flex; align-items:center; gap:8px; margin-bottom:6px; cursor:pointer; background:#fff; padding:6px; border:1px solid #e2e8f0; border-radius:4px;"><input type="checkbox" name="edit_teacher_circles" value="${c.id}" style="width:16px; height:16px; accent-color:var(--primary-blue);" ${myIds.includes(c.id) ? "checked" : ""}> <span style="font-weight:600; font-size:0.85rem;">${c.name}</span>${otherText}</label>`;
      });
      if (!cOpts)
        cOpts =
          '<p style="color:gray; font-size:0.85rem; text-align:center; margin:0;">لا توجد حلقات مسجلة بعد.</p>';
      fields.innerHTML = `
        <div class="input-group"><label>اسم المعلم</label><input type="text" id="edit-teacher-name" class="modern-input" value="${t.name}" required></div>
        <div class="input-group"><label>رقم الجوال</label><input type="tel" id="edit-teacher-phone" class="modern-input" value="${t.phone || ""}" required></div>
        <div class="input-group"><label>الرقم السري</label><div class="password-wrapper"><input type="password" id="edit-teacher-pin" class="modern-input" value="${t.pin}" pattern="\\d{4}" maxlength="4" required><button type="button" class="toggle-password-btn">${eyeOpenSVG}</button></div></div>
        <div class="input-group"><label>الحلقات المكلف بها (يمكن اختيار أكثر من حلقة)</label><div id="edit-teacher-circles" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); padding:8px; border-radius:var(--radius-sm); background:#f8fafc;">${cOpts}</div></div>
      `;
    } else if (type === "track") {
      const t = window.db.tracks.find((x) => x.id === id);
      document.getElementById("edit-modal-title").textContent =
        "تعديل اسم المسار";
      fields.innerHTML = `<div class="input-group"><label>اسم المسار</label><input type="text" id="edit-track-name" class="modern-input" value="${t.name}" required></div>`;
    } else if (type === "circle") {
      const c = window.db.circles.find((x) => x.id === id);
      if (!c) return alert("خطأ.");
      document.getElementById("edit-modal-title").textContent =
        "تعديل بيانات الحلقة";
      let teacherOpts = "<option value=''>بدون معلم</option>";
      window.db.users.teacher.forEach(
        (t) =>
          (teacherOpts += `<option value="${t.id}" ${c.teacherId === t.id ? "selected" : ""}>${t.name}</option>`),
      );

      let typeSpecific = c.trackId !== "all" ? "checked" : "";
      let typeAll = c.trackId === "all" ? "checked" : "";
      let trackDisplay = c.trackId === "all" ? "none" : "block";

      let trackOpts = "";
      window.db.tracks.forEach(
        (t) =>
          (trackOpts += `<option value="${t.id}" ${c.trackId === t.id ? "selected" : ""}>${t.name}</option>`),
      );

      fields.innerHTML = `
        <div class="input-group"><label>اسم الحلقة</label><input type="text" id="edit-circle-name" class="modern-input" value="${c.name}" required></div>
        <div class="input-group">
          <label>نوع الحلقة</label>
          <div style="display:flex; gap:15px; margin-top:8px;">
            <label><input type="radio" name="edit_circle_type" value="specific" ${typeSpecific}> مخصصة لمسار</label>
            <label style="color:var(--primary-blue); font-weight:bold;"><input type="radio" name="edit_circle_type" value="all" ${typeAll}> حلقة عامة</label>
          </div>
        </div>
        <div class="input-group" id="edit-circle-track-container" style="display:${trackDisplay};">
          <label>المسار المخصص</label><select id="edit-circle-track" class="modern-input">${trackOpts}</select>
        </div>
        <div class="input-group"><label>تغيير المعلم</label><select id="edit-circle-teacher" class="modern-input">${teacherOpts}</select></div>
      `;

      setTimeout(() => {
        const eRadios = document.querySelectorAll(
          'input[name="edit_circle_type"]',
        );
        const eTrackCont = document.getElementById(
          "edit-circle-track-container",
        );
        eRadios.forEach((r) =>
          r.addEventListener("change", (e) => {
            eTrackCont.style.display =
              e.target.value === "all" ? "none" : "block";
          }),
        );
      }, 50);
    }
    modal.classList.add("active");
  };

  window.closeEditModal = function () {
    document.getElementById("edit-modal").classList.remove("active");
  };

  document.getElementById("edit-modal-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let savedTrackId = null;
    if (editingContext.type === "student") {
      const s = window.db.students.find((x) => x.id === editingContext.id);
      if (s) {
        s.name = document.getElementById("edit-stu-name").value;
        const idInput = document.getElementById("edit-stu-id");
        s.idNumber = idInput ? idInput.value : "";
        s.phone = document.getElementById("edit-stu-phone").value;
        s.pin = document.getElementById("edit-stu-pin").value;
        s.trackId = document.getElementById("edit-stu-track").value;
        s.circleId = document.getElementById("edit-stu-circle").value;
        syncToFirestore("students", s.id, s);
        addLog(`تعديل بيانات الطالب: ${s.name}`, "عام");
      }
    } else if (editingContext.type === "teacher") {
      const t = window.db.users.teacher.find((x) => x.id === editingContext.id);
      if (t) {
        t.name = document.getElementById("edit-teacher-name").value;
        t.phone = document.getElementById("edit-teacher-phone").value;
        t.pin = document.getElementById("edit-teacher-pin").value;
        const selectedIds = Array.from(
          document.querySelectorAll(
            'input[name="edit_teacher_circles"]:checked',
          ),
        ).map((x) => x.value);
        window.db.circles.forEach((c) => {
          if (selectedIds.includes(c.id)) {
            if (c.teacherId !== t.id) {
              c.teacherId = t.id;
              syncToFirestore("groups", c.id, c);
            }
            detachCircleFromOtherTeachers(c.id, t.id);
          } else if (c.teacherId === t.id) {
            c.teacherId = "";
            syncToFirestore("groups", c.id, c);
          }
        });
        if (!selectedIds.includes(t.circleId))
          t.circleId = selectedIds.length > 0 ? selectedIds[0] : "";
        syncToFirestore("users", t.id, t);
        addLog(`تعديل بيانات المعلم: ${t.name}`, "عام");
      }
    } else if (editingContext.type === "track") {
      const t = window.db.tracks.find((x) => x.id === editingContext.id);
      if (t) {
        t.name = document.getElementById("edit-track-name").value;
        savedTrackId = t.id;
        addLog(`تعديل اسم مسار إلى: ${t.name}`, "عام");
      }
    } else if (editingContext.type === "circle") {
      const c = window.db.circles.find((x) => x.id === editingContext.id);
      if (c) {
        c.name = document.getElementById("edit-circle-name").value;
        const eType = document.querySelector(
          'input[name="edit_circle_type"]:checked',
        ).value;
        c.trackId =
          eType === "all"
            ? "all"
            : document.getElementById("edit-circle-track").value;

        const newTeacherId = document.getElementById(
          "edit-circle-teacher",
        ).value;
        // تغيير معلم الحلقة لا يمس بقية حلقات المعلم القديم أو الجديد
        if (c.teacherId !== newTeacherId) {
          c.teacherId = newTeacherId;
          detachCircleFromOtherTeachers(c.id, newTeacherId);
          const newTeacher = window.db.users.teacher.find(
            (t) => t.id === newTeacherId,
          );
          if (newTeacher && !hasValidCircle(newTeacher)) {
            newTeacher.circleId = c.id;
            syncToFirestore("users", newTeacher.id, newTeacher);
          }
        }
        syncToFirestore("groups", c.id, c);
        addLog(`تعديل مسار ومعلم الحلقة`, c.name);
      }
    }
    closeEditModal();
    saveLocalDB();
    refreshAllViews();
    if (savedTrackId) {
      const ok = await saveTrackToFirestore(savedTrackId);
      trackSaveAlert(ok, "تم حفظ التعديلات في قاعدة البيانات!");
    } else alert("تم حفظ التعديلات!");
  });

  let editingScheduleTrackId = null;
  // نسخة للتعديل: لا يتغير شيء في المقررات إلا عند الضغط على حفظ
  let editingSched = [];

  function renderScheduleRows() {
    const tbody = document.getElementById("schedule-modal-tbody");
    const esc = (v) =>
      String(v == null ? "" : v).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
    tbody.innerHTML = editingSched
      .map(
        (item) => `
        <tr>
          <td style="font-weight:bold; background:var(--primary-light); width:150px; text-align:center;">${getDateLabel(item.day, editingScheduleTrackId)}</td>
          <td><input type="text" id="sch_mem_${item.day}" value="${esc(item.mem)}"></td>
          <td><input type="text" id="sch_cons_${item.day}" value="${esc(item.cons)}"></td>
          <td><input type="text" id="sch_rev_${item.day}" value="${esc(item.rev)}"></td>
        </tr>
      `,
      )
      .join("");
  }

  function readScheduleInputs() {
    editingSched.forEach((item) => {
      const m = document.getElementById(`sch_mem_${item.day}`);
      if (!m) return;
      item.mem = m.value;
      item.cons = document.getElementById(`sch_cons_${item.day}`).value;
      item.rev = document.getElementById(`sch_rev_${item.day}`).value;
    });
  }

  window.openScheduleModal = function (trackId) {
    editingScheduleTrackId = trackId;
    const track = window.db.tracks.find((t) => t.id === trackId);
    if (!track) return;
    document.getElementById("schedule-modal-title").textContent =
      `تعديل مقررات: ${track.name}`;
    editingSched = (window.db.scheduleData[trackId] || []).map((d) => ({
      ...d,
    }));
    const weeksBar = document.getElementById("schedule-weeks-bar");
    if (weeksBar) {
      weeksBar.style.display = isTerm() ? "flex" : "none";
      document.getElementById("schedule-weeks-input").value = Math.ceil(
        editingSched.length / 4,
      );
    }
    renderScheduleRows();
    document.getElementById("schedule-modal").classList.add("active");
  };

  const weeksApplyBtn = document.getElementById("schedule-weeks-apply");
  if (weeksApplyBtn) {
    weeksApplyBtn.addEventListener("click", () => {
      const weeks = parseInt(
        document.getElementById("schedule-weeks-input").value,
      );
      if (!weeks || weeks < 1 || weeks > 60)
        return alert("عدد الأسابيع يجب أن يكون من 1 إلى 60.");
      readScheduleInputs();
      const newDays = weeks * 4;
      const removed = editingSched.slice(newDays);
      if (
        removed.some((d) => (d.mem || d.cons || d.rev || "").trim()) &&
        !confirm("سيتم حذف مقررات الأسابيع الزائدة من هذه الخطة. متابعة؟")
      )
        return;
      editingSched = editingSched.slice(0, newDays);
      for (let i = editingSched.length; i < newDays; i++)
        editingSched.push({ day: i + 1, mem: "", cons: "", rev: "" });
      renderScheduleRows();
    });
  }

  window.closeScheduleModal = function () {
    document.getElementById("schedule-modal").classList.remove("active");
  };

  document
    .getElementById("schedule-modal-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const trackId = editingScheduleTrackId;
      let sched = window.db.scheduleData[trackId];
      if (sched) {
        readScheduleInputs();
        sched = editingSched.map((d) => ({ ...d }));
        window.db.scheduleData[trackId] = sched;
        const t = window.db.tracks.find((x) => x.id === editingScheduleTrackId);
        if (t && isTerm()) {
          t.totalDays = sched.length;
          // عدد الأحاديث من أكبر رقم في الخطة (لشبكة الأحاديث عند التسجيل)
          let maxNum = 0;
          sched.forEach((d) =>
            ["mem", "cons", "rev"].forEach((k) => {
              const nums = toLatinDigits(d[k]).match(/\d+/g);
              if (nums)
                nums.forEach((n) => {
                  if (+n > maxNum) maxNum = +n;
                });
            }),
          );
          if (maxNum > 0) t.totalHadiths = maxNum;
        }
        addLog(`تعديل مقررات المسار`, t ? t.name : "عام");
      }
      closeScheduleModal();
      saveLocalDB();
      refreshAllViews();
      const ok = sched ? await saveTrackToFirestore(trackId) : false;
      trackSaveAlert(
        ok,
        "تم حفظ المقررات في قاعدة البيانات، وستظهر للمعلمين والطلاب عند فتح الصفحة.",
      );
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
    const adminHijri = document.getElementById("admin-record-date-hijri");
    if (adminHijri) adminHijri.textContent = hijriDate(selectedDate);
    const searchInputEl = document.getElementById("admin-student-search");
    const searchVal = searchInputEl ? searchInputEl.value.toLowerCase() : "";
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
      // في الفصل: الحضور من أيام الحلقة التي مضت، والإنجاز على الحفظ فقط
      const attendanceBase = isTerm() ? termDueDates(track) : currentDay;
      let attendancePercent =
        attendanceBase > 0
          ? Math.round((presentRecords / attendanceBase) * 100)
          : 0;
      if (attendancePercent > 100) attendancePercent = 100;

      const totalTasks = track.totalDays * 3;
      const completedTasks =
        (student.progress?.mem?.length || 0) +
        (student.progress?.cons?.length || 0) +
        (student.progress?.rev?.length || 0);
      let progressPercent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      if (progressPercent > 100) progressPercent = 100;
      if (isTerm()) progressPercent = termMemPercent(student);

      const selectHtml = `
        <select class="modern-input" style="padding: 0.3rem; min-height: auto; font-size:0.8rem;" onchange="adminUpdateAttendance('${student.id}', this.value)">
          <option value="" disabled ${!record ? "selected" : ""}>لم يحضر</option>
          <option value="present" ${record && record.attendance === "present" ? "selected" : ""}>حاضر</option>
          <option value="late" ${record && record.attendance === "late" ? "selected" : ""}>متأخر</option>
          <option value="excused" ${record && record.attendance === "excused" ? "selected" : ""}>مستأذن</option>
          <option value="absent" ${record && record.attendance === "absent" ? "selected" : ""}>غائب</option>
        </select>
      `;

      tbody.innerHTML += `
        <tr>
          <td style="font-weight:700;">${student.name}</td><td>${student.level}</td>
          <td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${track.name}</span></td>
          <td style="color:${circle.name === "غير موزع" ? "var(--danger-btn)" : "inherit"}">${circle.name}</td>
          <td style="font-weight:bold; color:var(--primary-blue); text-align:center;">${presentRecords}</td>
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
    if (existingRecordIndex > -1) {
      window.db.dailyRecords[existingRecordIndex].attendance = status;
      syncToFirestore(
        "dailyRecords",
        studentId + "_" + selectedDate,
        window.db.dailyRecords[existingRecordIndex],
      );
    } else {
      const newRecord = {
        studentId,
        date: selectedDate,
        attendance: status,
        notes: "تعديل حضور إداري",
        timestamp: Date.now(),
      };
      stampProgram(newRecord);
      window.db.dailyRecords.push(newRecord);
      syncToFirestore(
        "dailyRecords",
        studentId + "_" + selectedDate,
        newRecord,
      );
    }
    const student = window.db.students.find((s) => s.id === studentId);
    const circle = window.db.circles.find(
      (c) => c.id === (student ? student.circleId : ""),
    );
    saveLocalDB();
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
      `تقرير الإنجاز والمتابعة (يوم: ${isTerm() ? hijriDate(dateInput) : dateInput})`;
    const reportHijri = document.getElementById("report-date-hijri");
    if (reportHijri) reportHijri.textContent = hijriDate(dateInput);

    let studentsToReport = window.db.students;
    if (currentUser.role === "teacher") {
      const ids = myCircleIds();
      studentsToReport = studentsToReport.filter((s) =>
        ids.includes(s.circleId),
      );
    }
    const filterEl = document.getElementById("report-circle-filter");
    const filterVal = filterEl ? filterEl.value : "all";
    if (filterVal && filterVal !== "all")
      studentsToReport = studentsToReport.filter(
        (s) => s.circleId === filterVal,
      );
    const dayRecords = window.db.dailyRecords.filter(
      (r) => r.date === dateInput,
    );

    let totalReportHadiths = 0;
    let totalReportPages = 0;

    studentsToReport.forEach((student) => {
      const record = dayRecords.find((r) => r.studentId === student.id);
      const circle = window.db.circles.find(
        (c) => c.id === student.circleId,
      ) || { name: "" };
      const track = window.db.tracks.find((t) => t.id === student.trackId) || {
        totalHadiths: 0,
      };

      let attText = "غير مسجل";
      let attColor = "var(--text-gray)";
      if (record) {
        if (record.attendance === "present") {
          attText = "حاضر";
          attColor = "#166534";
        } else if (record.attendance === "late") {
          attText = "متأخر";
          attColor = "#b45309";
        } else if (record.attendance === "excused") {
          attText = "مستأذن";
          attColor = "#0369a1";
        } else if (record.attendance === "absent") {
          attText = "غائب";
          attColor = "#991b1b";
        }
      }

      // 👈 احتساب إجمالي الأيام التي حضرها الطالب فعلياً (حاضر أو متأخر) مباشرة من سجلات الحضور
      const totalAttendedDays = window.db.dailyRecords.filter(
        (r) =>
          r.studentId === student.id &&
          (r.attendance === "present" || r.attendance === "late"),
      ).length;

      let highestMem = parseInt(student.manualProgress?.mem) || 0;
      if (highestMem === 0 && student.detailedProgress?.mem?.length > 0) {
        highestMem = Math.max(...student.detailedProgress.mem);
      }
      if (isTerm()) highestMem = termMemCount(student);

      totalReportHadiths += highestMem;

      let totalHadithsStr = track.totalHadiths
        ? `${highestMem} من أصل ${track.totalHadiths}`
        : `${highestMem}`;
      if (isTerm()) {
        // الفصل: ما حفظه من خطته، وآخر حديث وصل إليه
        const range = termPlanRange(student.trackId);
        const reached = reachedHadith(student, "mem");
        totalHadithsStr = range.last
          ? `${highestMem} من أصل ${range.last - range.first + 1}`
          : `${highestMem}`;
        if (reached)
          totalHadithsStr += `<br><span style="font-size:0.75rem; color:var(--text-gray);">وصل إلى ح ${reached}</span>`;
        const st = termMemStatus(student);
        if (st)
          totalHadithsStr += `<br><span style="font-size:0.75rem; font-weight:bold; color:${st.behind > 0 ? "#991b1b" : "#166534"};">${st.behind > 0 ? `متأخر في الحفظ (${sessionsText(st.behind)})` : "مواكب للخطة"}</span>`;
      }

      const manualStr = student.manualProgress
        ? ` (ح:${student.manualProgress?.mem || 0}, ث:${student.manualProgress?.cons || 0}, م:${student.manualProgress?.rev || 0})`
        : "";
      let timeStr =
        record && record.sessionTime && record.sessionTime !== "غير محدد"
          ? ` | وقت: ${record.sessionTime}`
          : "";
      if (isTerm() && record)
        timeStr =
          (record.recitedAt
            ? ` | وقت التسميع: ${formatRecitedAt(record.recitedAt)}`
            : "") + (record.isReview ? " | 🔁 مراجعة" : "");
      const tasksCompleted = record
        ? `أيام المنهج: ${student.progress?.mem?.length || 0}/${student.progress?.cons?.length || 0}/${student.progress?.rev?.length || 0}${manualStr}${timeStr}`
        : "لا يوجد إنجاز جديد";
      const notesStr = record && record.notes ? record.notes : "-";
      let pagesStr = "-";
      if (isTerm()) {
        const pages = termPagesDone(student);
        if (pages !== null) {
          pagesStr = pagesText(pages);
          totalReportPages += pages;
        }
      }

      tbody.innerHTML += `<tr>
        <td style="font-weight:700;">${student.name}</td>
        <td>${circle.name}</td>
        <td style="color:${attColor}; font-weight:bold;">${attText}</td>
        <td style="font-weight:bold; color:var(--primary-blue); text-align:center;">${totalAttendedDays}</td>
        <td style="font-size:0.8rem;">${tasksCompleted}</td>
        <td style="font-weight:bold; color:var(--primary-blue);" dir="rtl">${totalHadithsStr}</td>
        ${isTerm() ? `<td style="font-weight:bold; color:var(--primary-blue); text-align:center;">${pagesStr}</td>` : ""}
        <td>${notesStr}</td>
      </tr>`;
    });

    if (studentsToReport.length > 0) {
      tbody.innerHTML += `
        <tr style="background-color: var(--primary-light); border-top: 2px solid var(--primary-blue);">
          <td colspan="5" style="text-align: left; font-weight: 800; color: var(--primary-blue); font-size: 1rem; padding: 12px;">إجمالي الأحاديث المسمّعة للطلاب أعلاه:</td>
          <td colspan="${isTerm() ? 3 : 2}" style="font-weight: 900; color: var(--danger-btn); font-size: 1.1rem; padding: 12px;">${totalReportHadiths} حديثاً${isTerm() ? ` — ${pagesText(totalReportPages)}` : ""}</td>
        </tr>`;
    }
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
  const trackingCircleFilter = document.getElementById(
    "tracking-circle-filter",
  );
  if (trackingCircleFilter)
    trackingCircleFilter.addEventListener("change", () => {
      renderDailyTracking(searchInput ? searchInput.value.toLowerCase() : "");
    });
  const trackingDateInput = document.getElementById("tracking-date");
  if (trackingDateInput)
    trackingDateInput.addEventListener("change", () => {
      // لا يُسجَّل لتاريخ لم يأتِ بعد
      trackingDateInput.value = selectedTrackingDate();
      renderDailyTracking(searchInput ? searchInput.value.toLowerCase() : "");
    });

  // تاريخ التسجيل في الفصل: اليوم، أو أي يوم سابق يختاره المعلم أو المشرف أو المدير
  function selectedTrackingDate() {
    const todayLocal = toIsoDate(new Date());
    const v = trackingDateInput ? trackingDateInput.value : "";
    return parseIsoDate(v) && v <= todayLocal ? v : todayLocal;
  }

  // وقت التسميع: الفصل يحفظ وقتاً فعلياً، والصيفية تحفظ (فجر / عصر)
  function timingHtml(t) {
    if (!t) return "";
    if (typeof t === "number")
      return `<span style="font-size:0.65rem; color:#0369a1; margin-right:4px;">(${formatRecitedAt(t)})</span>`;
    return `<span style="font-size:0.65rem; color:${t === "فجر" ? "#0284c7" : "#b45309"}; margin-right:4px;">(${t})</span>`;
  }

  function setupDetailedSync(card, student, type) {
    const manualInput = card.querySelector(`input[name="manual_${type}"]`);
    const detChecks = card.querySelectorAll(
      `input[name="det_${type}_${student.id}"]`,
    );
    const quickChecks = card.querySelectorAll(`input[name^="chk_${type}_"]`);
    if (!manualInput || (detChecks.length === 0 && !isTerm())) return;

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
    if (currentUser.role === "teacher") {
      const ids = myCircleIds();
      filteredStudents = filteredStudents.filter((s) =>
        ids.includes(s.circleId),
      );
      const circleFilter = document.getElementById("tracking-circle-filter");
      if (circleFilter && circleFilter.value && circleFilter.value !== "all")
        filteredStudents = filteredStudents.filter(
          (s) => s.circleId === circleFilter.value,
        );
    } else if (isTerm()) {
      const f = document.getElementById("tracking-circle-filter").value;
      if (f === "none")
        filteredStudents = filteredStudents.filter(
          (s) => !window.db.circles.find((c) => c.id === s.circleId),
        );
      else if (f && f !== "all")
        filteredStudents = filteredStudents.filter((s) => s.circleId === f);
    }
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
    const trackingHijri = document.getElementById("tracking-date-hijri");
    if (trackingHijri && isTerm())
      trackingHijri.textContent = hijriDate(selectedTrackingDate());
    filteredStudents.forEach((student) => {
      if (!student.progress) student.progress = { mem: [], cons: [], rev: [] };
      if (!student.manualProgress)
        student.manualProgress = { mem: "", cons: "", rev: "" };
      if (!student.detailedProgress)
        student.detailedProgress = { mem: [], cons: [], rev: [] };
      if (!student.tasksTiming)
        student.tasksTiming = { mem: {}, cons: {}, rev: {} };

      const today = isTerm()
        ? selectedTrackingDate()
        : new Date().toISOString().split("T")[0];
      const record = window.db.dailyRecords.find(
        (r) => r.studentId === student.id && r.date === today,
      );
      let isEditable = true;
      // الفصل: لا يُقفل التعديل بعد 24 ساعة
      if (record && currentUser.role === "teacher" && !isTerm()) {
        const hoursPassed = (Date.now() - record.timestamp) / (1000 * 60 * 60);
        if (hoursPassed > 24) isEditable = false;
      }
      const disableStr = isEditable ? "" : "disabled";

      const track = window.db.tracks.find((t) => t.id === student.trackId);
      const totalTrackDays = track ? track.totalDays : 23;
      const totalHadiths =
        track && track.totalHadiths ? track.totalHadiths : 150;

      let maxMem =
        student.progress?.mem?.length > 0
          ? Math.max(...student.progress.mem)
          : 0;
      let delayDays = currentProgramDay - maxMem;
      let progressBadge = "";
      if (isTerm()) progressBadge = memBadgeHtml(termMemStatus(student));
      else if (delayDays <= 0)
        progressBadge = `<span class="badge" style="background:#dcfce7; color:#166534; border:1px solid #166534;">🌟 مواكب للخطة</span>`;
      else if (delayDays <= 2)
        progressBadge = `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #b45309;">⚠️ متأخر (${delayDays} يوم)</span>`;
      else
        progressBadge = `<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #991b1b;">🚨 متأخر جداً (${delayDays} يوم)</span>`;

      const statusBadge = record
        ? `<span class="badge saved">${isTerm() ? "تم التسجيل لهذا التاريخ" : "تم حفظ إنجاز اليوم"}</span>`
        : `<span class="badge" style="background:#f8fafc; border:1px solid var(--border-color); color:var(--text-gray);">لم يتم الحفظ</span>`;

      // الفصل: الأيام قبل الجلسة الحالية منتهية، والحالية هي التي لم ينته وقتها
      const termDue = isTerm() ? termDueCount(track) : 0;
      const pastLimit = isTerm() ? termDue : currentProgramDay - 1;
      const currentIdx = isTerm() ? termDue + 1 : currentProgramDay;

      // الفصل: التسجيل بأرقام الأحاديث فقط، فلا يُبنى شريط الأيام ولا شبكة الصيف
      const summerDays = isTerm() ? 0 : totalTrackDays;
      const summerHadiths = isTerm() ? 0 : totalHadiths;
      let timelineHTML =
        '<div class="timeline-container"><div class="timeline-scroll">';
      for (let i = 1; i <= summerDays; i++) {
        const memText = getTaskText(student.trackId, "mem", i);
        const consText = getTaskText(student.trackId, "cons", i);
        const revText = getTaskText(student.trackId, "rev", i);
        const isMemChecked = student.progress?.mem?.includes(i)
          ? "checked"
          : "";
        const isConsChecked = student.progress?.cons?.includes(i)
          ? "checked"
          : "";
        const isRevChecked = student.progress?.rev?.includes(i)
          ? "checked"
          : "";

        const memTime = student.tasksTiming?.mem?.["day_" + i];
        const consTime = student.tasksTiming?.cons?.["day_" + i];
        const revTime = student.tasksTiming?.rev?.["day_" + i];

        const memTimeHtml = timingHtml(memTime);
        const consTimeHtml = timingHtml(consTime);
        const revTimeHtml = timingHtml(revTime);

        let dayClass = "day-column";
        if (i <= pastLimit) dayClass += " day-past";
        else if (i === currentIdx) dayClass += " day-current";
        timelineHTML += `
          <div class="${dayClass}">
            <h4>${getDateLabel(i, student.trackId)}</h4>
            <label class="task-item"><input type="checkbox" name="chk_mem_${i}" value="${i}" ${isMemChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">📖 حفظ: ${memTimeHtml}</span><span class="task-desc">${memText}</span></div></label>
            <label class="task-item"><input type="checkbox" name="chk_cons_${i}" value="${i}" ${isConsChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">🔄 تثبيت: ${consTimeHtml}</span><span class="task-desc">${consText}</span></div></label>
            <label class="task-item"><input type="checkbox" name="chk_rev_${i}" value="${i}" ${isRevChecked} ${disableStr}>
              <div class="task-content"><span class="task-label">🔁 مراجعة: ${revTimeHtml}</span><span class="task-desc">${revText}</span></div></label>
          </div>`;
      }
      timelineHTML += "</div></div>";

      let dropdownHTML = `<details class="dropdown-details"><summary>🔽 عرض تفصيل الأحاديث (تحديد / إلغاء الأحاديث بدقة)</summary><div class="dropdown-content">`;
      let memGrid = `<div class="hadith-grid-container"><h5>📖 أحاديث الحفظ:</h5><div class="hadith-grid">`;
      for (let h = 1; h <= summerHadiths; h++) {
        let checked = student.detailedProgress?.mem?.includes(h)
          ? "checked"
          : "";
        let time = student.tasksTiming?.mem?.["hadith_" + h];
        let icon = time === "فجر" ? "🌅" : time === "عصر" ? "🌇" : "";
        memGrid += `<label class="h-item"><input type="checkbox" name="det_mem_${student.id}" value="${h}" ${checked} ${disableStr}> ${h} ${icon}</label>`;
      }
      memGrid += `</div></div>`;
      let consGrid = `<div class="hadith-grid-container"><h5>🔄 أحاديث التثبيت:</h5><div class="hadith-grid">`;
      for (let h = 1; h <= summerHadiths; h++) {
        let checked = student.detailedProgress?.cons?.includes(h)
          ? "checked"
          : "";
        let time = student.tasksTiming?.cons?.["hadith_" + h];
        let icon = time === "فجر" ? "🌅" : time === "عصر" ? "🌇" : "";
        consGrid += `<label class="h-item"><input type="checkbox" name="det_cons_${student.id}" value="${h}" ${checked} ${disableStr}> ${h} ${icon}</label>`;
      }
      consGrid += `</div></div>`;
      let revGrid = `<div class="hadith-grid-container"><h5>🔁 أحاديث المراجعة:</h5><div class="hadith-grid">`;
      for (let h = 1; h <= summerHadiths; h++) {
        let checked = student.detailedProgress?.rev?.includes(h)
          ? "checked"
          : "";
        let time = student.tasksTiming?.rev?.["hadith_" + h];
        let icon = time === "فجر" ? "🌅" : time === "عصر" ? "🌇" : "";
        revGrid += `<label class="h-item"><input type="checkbox" name="det_rev_${student.id}" value="${h}" ${checked} ${disableStr}> ${h} ${icon}</label>`;
      }
      revGrid += `</div></div>`;
      dropdownHTML += memGrid + consGrid + revGrid + `</div></details>`;

      // الفصل: أرقام أحاديث مسار الطالب، والضغط على رقم يحدده مع كل ما قبله
      const TERM_TYPES = [
        ["mem", "📖 الحفظ", "📖 أحاديث الحفظ"],
        ["cons", "🔄 التثبيت", "🔄 أحاديث التثبيت"],
        ["rev", "🔁 المراجعة", "🔁 أحاديث المراجعة"],
      ];
      const termRange = isTerm() ? termPlanRange(student.trackId) : null;
      const termSel = {};
      const reachedLabel = (k) =>
        termSel[k] ? `وصل إلى ح ${termSel[k]}` : "لم يبدأ";
      let termHadithHTML = "";
      if (isTerm()) {
        if (!termRange.last)
          termHadithHTML = `<p style="color:var(--danger-btn); font-weight:bold; font-size:0.85rem; margin:0;">حدد مسار الطالب أولاً لتظهر أرقام الأحاديث.</p>`;
        else {
          TERM_TYPES.forEach(([k]) => {
            const r = reachedHadith(student, k);
            termSel[k] = r >= termRange.first ? Math.min(r, termRange.last) : 0;
          });
          termHadithHTML = `<div style="display:flex; flex-wrap:wrap; gap:6px 18px; font-size:0.85rem; font-weight:800; color:var(--primary-blue); margin-bottom:6px;">${TERM_TYPES.map(([k, label]) => `<span>${label}: <span data-reached="${k}">${reachedLabel(k)}</span></span>`).join("")}</div>
            <details class="dropdown-details term-hadith-details"><summary>🔽 أرقام الأحاديث (ح ${termRange.first} إلى ${termRange.last}): اضغط على رقم الحديث لتحديده مع ما قبله</summary><div class="dropdown-content"></div></details>`;
        }
      }

      let manualInputHTML = `
        <div class="manual-input-grid">
          <div><label>أين وصل في الحفظ؟</label><input type="number" name="manual_mem" class="modern-input" placeholder="رقم الحديث" value="${student.manualProgress?.mem || ""}" ${disableStr}></div>
          <div><label>أين وصل في التثبيت؟</label><input type="number" name="manual_cons" class="modern-input" placeholder="رقم الحديث" value="${student.manualProgress?.cons || ""}" ${disableStr}></div>
          <div><label>أين وصل في المراجعة؟</label><input type="number" name="manual_rev" class="modern-input" placeholder="رقم الحديث" value="${student.manualProgress?.rev || ""}" ${disableStr}></div>
        </div>
      `;

      // الفصل: وقت التسميع يُسجَّل تلقائياً ويمكن تعديله، وعلامة المراجعة يوم السبت
      const recDay = parseIsoDate(today);
      const isSaturday = isTerm() && recDay && recDay.getDay() === 6;
      const sessionTimeHtml = isTerm()
        ? `<div class="status-radios" style="align-items:center;"><span style="font-size:0.85rem; font-weight:800; color:var(--primary-blue); margin-left:4px; line-height:2.2;">وقت التسميع:</span>
              <input type="datetime-local" name="recited_at" class="modern-input" style="width:auto; padding:0.3rem 0.5rem; min-height:auto; font-size:0.85rem;" value="${record && record.recitedAt ? toLocalInputValue(record.recitedAt) : ""}" ${disableStr}>
              <span style="font-size:0.75rem; color:var(--text-gray);">${record && record.recitedAt ? `سُجّل: ${formatRecitedAt(record.recitedAt)}${record.recordedBy ? ` (${record.recordedBy})` : ""} — يمكن تعديله` : "يُسجَّل تلقائياً عند الحفظ"}</span>
            </div>
            ${isSaturday ? `<label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:800; color:#7c3aed; cursor:pointer; width:fit-content;"><input type="checkbox" name="is_review" style="width:18px; height:18px; accent-color:#7c3aed;" ${record && record.isReview ? "checked" : ""} ${disableStr}> 🔁 هذا التسميع مراجعة</label>` : ""}`
        : `<div class="status-radios"><span style="font-size:0.85rem; font-weight:800; color:var(--primary-blue); margin-left:4px; line-height:2.2;">وقت التسميع:</span>
              <div class="status-radio"><input type="radio" id="time_fajr_${student.id}" name="session_time" value="فجر" ${record && record.sessionTime === "فجر" ? "checked" : ""} ${disableStr}><label for="time_fajr_${student.id}">بعد الفجر 🌅</label></div>
              <div class="status-radio"><input type="radio" id="time_asr_${student.id}" name="session_time" value="عصر" ${record && record.sessionTime === "عصر" ? "checked" : ""} ${disableStr}><label for="time_asr_${student.id}">بعد العصر 🌇</label></div>
              <div class="status-radio"><input type="radio" id="time_none_${student.id}" name="session_time" value="غير محدد" ${!record || record.sessionTime === "غير محدد" ? "checked" : ""} ${disableStr}><label for="time_none_${student.id}">غير محدد</label></div>
            </div>`;

      const card = document.createElement("div");
      card.className = "tracking-card";
      card.innerHTML = `
        <div class="tracking-header"><div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;"><h3 style="margin: 0; color:var(--primary-blue); font-size:1.1rem;">${student.name}</h3>${progressBadge}</div>${statusBadge}</div>
        <form class="daily-track-form" data-student-id="${student.id}">
          <div style="margin-bottom: 1.2rem; display:flex; flex-direction:column; gap:10px;">
            <div class="status-radios"><span style="font-size:0.85rem; font-weight:800; color:var(--primary-blue); margin-left:4px; line-height:2.2;">الحضور:</span>
              <div class="status-radio"><input type="radio" id="present_${student.id}" name="attendance" value="present" ${record && record.attendance === "present" ? "checked" : ""} required ${disableStr}><label for="present_${student.id}">حاضر</label></div>
              <div class="status-radio"><input type="radio" id="late_${student.id}" name="attendance" value="late" ${record && record.attendance === "late" ? "checked" : ""} ${disableStr}><label for="late_${student.id}">متأخر</label></div>
              <div class="status-radio"><input type="radio" id="excused_${student.id}" name="attendance" value="excused" ${record && record.attendance === "excused" ? "checked" : ""} ${disableStr}><label for="excused_${student.id}">مستأذن</label></div>
              <div class="status-radio"><input type="radio" id="absent_${student.id}" name="attendance" value="absent" ${record && record.attendance === "absent" ? "checked" : ""} ${disableStr}><label for="absent_${student.id}">غائب</label></div>
            </div>
            ${sessionTimeHtml}
          </div>
          ${
            isTerm()
              ? `<div style="margin-bottom:0.5rem;"><p style="font-weight:800; margin-bottom: 0.4rem; color: var(--gold-text); font-size:0.85rem;">التسميع (بأرقام الأحاديث):</p>${termHadithHTML}</div>`
              : `<div style="display: ${isGlobalManualMode ? "none" : "block"};"><p style="font-weight:800; margin-bottom: 0.4rem; color: var(--gold-text); font-size:0.85rem;">الخطة الزمنية (متابعة بالأيام):</p>${timelineHTML}</div>
          <div style="display: ${isGlobalManualMode ? "block" : "none"};"><p style="font-weight:800; margin-bottom: 0.4rem; color: var(--gold-text); font-size:0.85rem;">الإدخال اليدوي الدقيق (متابعة بالأحاديث):</p>${manualInputHTML}${dropdownHTML}</div>`
          }
          <div style="margin-bottom: 1rem; margin-top: 0.5rem;"><label style="font-weight:700; display:block; font-size:0.8rem; margin-bottom:3px;">ملاحظات المعلم:</label><input type="text" name="notes" class="modern-input" placeholder="مثال: الطالب متميز اليوم..." value="${record && record.notes ? record.notes : ""}" ${disableStr}></div>
          ${isEditable ? `<button type="submit" class="btn-submit" style="width:auto; padding: 0.5rem 1.5rem;">💾 حفظ إنجاز الطالب</button>` : `<p style="color:var(--danger-btn); font-weight:bold; margin:0; font-size:0.85rem;">انتهت فترة التعديل (24 ساعة).</p>`}
        </form>
      `;

      if (isTerm() && termRange && termRange.last) {
        const det = card.querySelector(".term-hadith-details");
        const box = det.querySelector(".dropdown-content");
        det.addEventListener("toggle", () => {
          if (!det.open || box.dataset.built) return;
          box.dataset.built = "1";
          box.innerHTML = TERM_TYPES.map(([k, , title]) => {
            let cells = "";
            for (let h = termRange.first; h <= termRange.last; h++)
              cells += `<label class="h-item"><input type="checkbox" data-k="${k}" value="${h}" ${h <= termSel[k] ? "checked" : ""} ${disableStr}> ${h}</label>`;
            return `<div class="hadith-grid-container"><h5>${title}:</h5><div class="hadith-grid">${cells}</div></div>`;
          }).join("");
        });
        // تحديد رقم = هو وكل ما قبله، وإلغاء رقم = يُلغى هو وما بعده
        box.addEventListener("change", (ev) => {
          const k = ev.target.dataset && ev.target.dataset.k;
          if (!k) return;
          const h = parseInt(ev.target.value);
          termSel[k] = ev.target.checked
            ? h
            : h - 1 >= termRange.first
              ? h - 1
              : 0;
          box
            .querySelectorAll(`input[data-k="${k}"]`)
            .forEach((c) => (c.checked = parseInt(c.value) <= termSel[k]));
          const lab = card.querySelector(`[data-reached="${k}"]`);
          if (lab) lab.textContent = reachedLabel(k);
        });
      }

      if (isEditable) {
        setupDetailedSync(card, student, "mem");
        setupDetailedSync(card, student, "cons");
        setupDetailedSync(card, student, "rev");
        card
          .querySelector(".daily-track-form")
          .addEventListener("submit", (e) => {
            e.preventDefault();
            const att = e.target.elements["attendance"].value;
            const sTimeEl = e.target.elements["session_time"];
            const sTime = sTimeEl ? sTimeEl.value : "غير محدد";
            const notes = e.target.elements["notes"].value;

            // الفصل: الوقت المكتوب، أو الوقت السابق، أو وقت الحفظ الآن (على تاريخ التسجيل)
            let recitedAt = null;
            if (isTerm()) {
              const v = e.target.elements["recited_at"].value;
              const parsed = v ? new Date(v).getTime() : NaN;
              if (!isNaN(parsed)) recitedAt = parsed;
              else if (record && record.recitedAt) recitedAt = record.recitedAt;
              else {
                const now = new Date();
                const d = parseIsoDate(today);
                d.setHours(now.getHours(), now.getMinutes(), 0, 0);
                recitedAt =
                  today === toIsoDate(now) ? now.getTime() : d.getTime();
              }
            }
            const stamp = isTerm() ? recitedAt : sTime;

            if (isTerm()) {
              // الفصل: ما حُدد من أرقام الأحاديث، وأيام الخطة التي اكتمل مقررها
              if (termRange && termRange.last)
                TERM_TYPES.forEach(([k]) => {
                  const sel = termSel[k] || 0;
                  const days = [];
                  for (let d = 1; d <= totalTrackDays; d++) {
                    const target = extractMaxNum(
                      getTaskText(student.trackId, k, d),
                    );
                    if (target > 0 && target <= sel) days.push(d);
                  }
                  days
                    .filter((d) => !(student.progress[k] || []).includes(d))
                    .forEach((d) => (student.tasksTiming[k]["day_" + d] = stamp));
                  student.progress[k] = days;
                  student.manualProgress[k] = sel ? String(sel) : "";
                  student.detailedProgress[k] = [];
                });
            } else {
              const oldMemDays = student.progress.mem || [];
              const oldConsDays = student.progress.cons || [];
              const oldRevDays = student.progress.rev || [];
              const oldDetMem = student.detailedProgress.mem || [];
              const oldDetCons = student.detailedProgress.cons || [];
              const oldDetRev = student.detailedProgress.rev || [];

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

              if (isTerm() || sTime !== "غير محدد") {
                newMem
                  .filter((x) => !oldMemDays.includes(x))
                  .forEach((d) => (student.tasksTiming.mem["day_" + d] = stamp));
                newCons
                  .filter((x) => !oldConsDays.includes(x))
                  .forEach((d) => (student.tasksTiming.cons["day_" + d] = stamp));
                newRev
                  .filter((x) => !oldRevDays.includes(x))
                  .forEach((d) => (student.tasksTiming.rev["day_" + d] = stamp));

                detMem
                  .filter((x) => !oldDetMem.includes(x))
                  .forEach(
                    (h) => (student.tasksTiming.mem["hadith_" + h] = stamp),
                  );
                detCons
                  .filter((x) => !oldDetCons.includes(x))
                  .forEach(
                    (h) => (student.tasksTiming.cons["hadith_" + h] = stamp),
                  );
                detRev
                  .filter((x) => !oldDetRev.includes(x))
                  .forEach(
                    (h) => (student.tasksTiming.rev["hadith_" + h] = stamp),
                  );
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
              student.detailedProgress.mem = detMem;
              student.detailedProgress.cons = detCons;
              student.detailedProgress.rev = detRev;
            }

            syncToFirestore("students", student.id, student);

            let existingRecordIndex = window.db.dailyRecords.findIndex(
              (r) => r.studentId === student.id && r.date === today,
            );
            const newRecord = isTerm()
              ? {
                  studentId: student.id,
                  date: today,
                  attendance: att,
                  notes,
                  recitedAt,
                  isReview: !!(
                    e.target.elements["is_review"] &&
                    e.target.elements["is_review"].checked
                  ),
                  recordedBy: currentUser.name,
                  programId: TERM,
                  timestamp: Date.now(),
                }
              : {
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

            syncToFirestore(
              "dailyRecords",
              student.id + "_" + today,
              newRecord,
            );

            saveLocalDB();
            renderDailyTracking(searchInput.value.toLowerCase());
            updateDashboardStats();
            generateReport();
            alert("تم حفظ إنجاز الطالب بنجاح!");
          });
      }
      trackingContainer.appendChild(card);
    });
  }

  // ================= الكتب (الدورة الفصل الأول) =================
  function renderBooks() {
    const list = document.getElementById("books-library-list");
    if (!list) return;
    const esc = (v) =>
      String(v == null ? "" : v).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
    list.innerHTML = (window.TERM_BOOKS || [])
      .map((b) => {
        const tracks = (b.tracks || [])
          .map((id) => (window.db.tracks.find((t) => t.id === id) || {}).name)
          .filter(Boolean);
        return `<div class="content-card" style="margin:0;">
          <h3 class="content-card-title">📖 ${esc(b.name)}</h3>
          <p style="font-size:0.85rem; color:var(--text-gray); line-height:1.7; margin-bottom:1rem;">${tracks.length ? `المسارات: ${tracks.map(esc).join("، ")}` : "كتاب للاطلاع"}</p>
          <button type="button" class="btn-submit" style="margin:0;" onclick="openBookViewer('${esc(b.id)}')">فتح الكتاب</button>
        </div>`;
      })
      .join("");
  }

  // ================= نقل حسابات الدورة الصيفية إلى الفصل الأول =================
  // نفس الاسم والجوال والهوية والرقم السري، بدون حلقات ولا مسارات ولا إنجاز، ولا يتغير شيء في الصيف
  function pendingSummerAccounts() {
    if (!programs) return { students: [], teacher: [], supervisor: [] };
    const s = programs[SUMMER];
    const t = programs[TERM];
    const copied = (list, x) =>
      list.some((y) => y.sourceId === x.id || y.id === x.id + "_t1");
    const sameStudent = (x) =>
      t.students.some(
        (y) =>
          (x.idNumber && toLatinDigits(y.idNumber) === toLatinDigits(x.idNumber)) ||
          (x.phone &&
            normPhone(y.phone) === normPhone(x.phone) &&
            normAr(y.name) === normAr(x.name)),
      );
    const sameUser = (list, x) =>
      list.some((y) => normAr(y.name) === normAr(x.name) && y.pin === x.pin);
    return {
      students: s.students.filter(
        (x) => !copied(t.students, x) && !sameStudent(x),
      ),
      teacher: s.users.teacher.filter(
        (x) => !copied(t.users.teacher, x) && !sameUser(t.users.teacher, x),
      ),
      supervisor: s.users.supervisor.filter(
        (x) =>
          !copied(t.users.supervisor, x) && !sameUser(t.users.supervisor, x),
      ),
    };
  }

  function renderAccountsTransfer() {
    const card = document.getElementById("accounts-transfer-card");
    if (!card) return;
    const show = isTerm() && currentUser && currentUser.role === "admin";
    card.style.display = show ? "block" : "none";
    if (!show) return;
    const p = pendingSummerAccounts();
    const total = p.students.length + p.teacher.length + p.supervisor.length;
    document.getElementById("accounts-transfer-info").innerHTML = total
      ? `لم يُنقل بعد: <strong>${p.students.length}</strong> طالب، <strong>${p.teacher.length}</strong> معلم، <strong>${p.supervisor.length}</strong> مشرف.`
      : "✅ كل حسابات الدورة الصيفية موجودة في الفصل الأول.";
    document.getElementById("accounts-transfer-btn").disabled = total === 0;
  }

  const transferBtn = document.getElementById("accounts-transfer-btn");
  if (transferBtn) {
    transferBtn.addEventListener("click", async () => {
      if (!isTerm() || !currentUser || currentUser.role !== "admin") return;
      const p = pendingSummerAccounts();
      const total = p.students.length + p.teacher.length + p.supervisor.length;
      if (total === 0) return;
      if (typeof dbFirestore === "undefined" || !navigator.onLine)
        return alert("نقل الحسابات يحتاج اتصالاً بالإنترنت.");
      if (
        !confirm(
          `سيتم إنشاء ${p.students.length} طالب و ${p.teacher.length} معلم و ${p.supervisor.length} مشرف في الدورة الفصل الأول، بنفس الأسماء وأرقام الجوال والهوية والأرقام السرية.\nبدون حلقات ولا مسارات ولا إنجاز، ولن يتغير أي شيء في الدورة الصيفية.\nمتابعة؟`,
        )
      )
        return;
      const fresh = {
        progress: { mem: [], cons: [], rev: [] },
        manualProgress: { mem: "", cons: "", rev: "" },
        detailedProgress: { mem: [], cons: [], rev: [] },
        tasksTiming: { mem: {}, cons: {}, rev: {} },
      };
      const docs = [
        ...p.students.map((x) => [
          "students",
          {
            id: x.id + "_t1",
            name: x.name || "",
            idNumber: x.idNumber || "",
            phone: x.phone || "",
            pin: x.pin || "1234",
            level: x.level || "غير محدد",
            trackId: "",
            circleId: "",
            ...JSON.parse(JSON.stringify(fresh)),
            programId: TERM,
            sourceId: x.id,
          },
        ]),
        ...["teacher", "supervisor"].flatMap((role) =>
          p[role].map((x) => [
            "users",
            {
              id: x.id + "_t1",
              name: x.name || "",
              phone: x.phone || "",
              pin: x.pin || "",
              role,
              ...(role === "teacher" ? { circleId: "" } : {}),
              programId: TERM,
              sourceId: x.id,
            },
          ]),
        ),
      ];
      transferBtn.disabled = true;
      transferBtn.textContent = "جاري النقل...";
      let saved = 0;
      let failed = false;
      // على دفعات، ولا يُضاف للنظام إلا ما حُفظ فعلياً
      for (let i = 0; i < docs.length; i += 400) {
        const chunk = docs.slice(i, i + 400);
        try {
          const batch = dbFirestore.batch();
          chunk.forEach(([col, d]) =>
            batch.set(dbFirestore.collection(col).doc(d.id), d),
          );
          await batch.commit();
          chunk.forEach(([col, d]) => {
            if (col === "students") programs[TERM].students.push(d);
            else programs[TERM].users[d.role].push(d);
          });
          saved += chunk.length;
        } catch (e) {
          console.error("فشل نقل دفعة من الحسابات:", e);
          failed = true;
          break;
        }
      }
      try {
        saveLocalDB();
      } catch (e) {}
      transferBtn.textContent = "نقل الحسابات إلى الفصل الأول";
      refreshAllViews();
      if (saved > 0) addLog(`نقل ${saved} حساب من الدورة الصيفية إلى الفصل الأول`, "عام");
      alert(
        failed
          ? `⚠️ تم نقل ${saved} حساب من أصل ${docs.length}، وحدث خطأ في الاتصال. أعد الضغط على الزر لإكمال الباقي.`
          : `✅ تم نقل ${saved} حساب إلى الدورة الفصل الأول.\nالآن حدد لكل طالب مساره وحلقته.`,
      );
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
        syncToFirestore("users", userInDb.id, userInDb);
        alert("تم تحديث الرقم السري بنجاح!");
        passForm.reset();
        saveLocalDB();
      }
      addLog("تغيير الرقم السري", "عام");
    });
  }
});
