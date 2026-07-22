document.addEventListener("DOMContentLoaded", () => {
  // --- أيقونات العين الرسمية ---
  const eyeOpenSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
  const eyeClosedSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;

  // --- تفعيل زر عرض/إخفاء الرقم السري ---
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
    { id: "t8", name: "الأربعون النووية", totalDays: 23 },
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
      if (currentDate.getDay() !== 5) dayCount++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dayCount > 0 ? (dayCount > 23 ? 23 : dayCount) : 1;
  }

  function getTaskText(trackId, taskType, dayIndex) {
    if (dayIndex <= 0) return "لا يوجد";
    const sched = scheduleData[trackId];
    if (sched && sched[dayIndex - 1]) return sched[dayIndex - 1][taskType];
    return `مقرر ${getDateLabel(dayIndex)}`;
  }

  const loginScreen = document.getElementById("student-login-screen");
  const dashboardScreen = document.getElementById("student-dashboard");
  const loader = document.getElementById("global-loader");

  let currentStudent = null;

  setTimeout(() => {
    if (loader) loader.style.opacity = "0";
    setTimeout(() => {
      if (loader) loader.style.display = "none";
      const sessionStr = localStorage.getItem("wathbah_student_session");
      if (sessionStr) {
        currentStudent = JSON.parse(sessionStr);
        if (!currentStudent.progress)
          currentStudent.progress = { mem: [], cons: [], rev: [] };
        if (!currentStudent.tasksTiming)
          currentStudent.tasksTiming = { mem: {}, cons: {}, rev: {} };
        loadStudentDashboard();
      } else {
        if (loginScreen) loginScreen.style.display = "flex";
      }
    }, 500);
  }, 800);

  async function requestFCMToken(userObj) {
    if (
      typeof firebase !== "undefined" &&
      firebase.messaging &&
      firebase.messaging.isSupported()
    ) {
      try {
        const messaging = firebase.messaging();
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await messaging.getToken({
            vapidKey: "YOUR_PUBLIC_VAPID_KEY_HERE",
          });
          if (token && userObj.fcmToken !== token) {
            userObj.fcmToken = token;
            await dbFirestore
              .collection("students")
              .doc(userObj.id)
              .update({ fcmToken: token });
          }
        }
      } catch (error) {
        console.log("تعذر تفعيل الإشعارات لهذا الجهاز:", error);
      }
    }
  }

  const loginForm = document.getElementById("student-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const loginId = document.getElementById("login-id-number").value.trim();
      const pin = document.getElementById("login-pin").value.trim();
      const btn = document.getElementById("btn-submit");

      if (typeof dbFirestore === "undefined") {
        alert("يرجى التأكد من اتصالك بالإنترنت للتحقق من البيانات.");
        return;
      }

      btn.innerHTML = "جاري التحقق...";
      btn.disabled = true;

      try {
        let snapshot = await dbFirestore
          .collection("students")
          .where("idNumber", "==", loginId)
          .get();

        if (snapshot.empty) {
          snapshot = await dbFirestore
            .collection("students")
            .where("phone", "==", loginId)
            .get();
        }

        if (snapshot.empty) {
          alert("الرقم المدخل غير مسجل في النظام.");
          btn.innerHTML = "تسجيل الدخول";
          btn.disabled = false;
          return;
        }

        let studentData = null;
        snapshot.forEach((doc) => {
          studentData = doc.data();
        });

        if (studentData.pin !== pin) {
          alert("الرقم السري غير صحيح.");
          btn.innerHTML = "تسجيل الدخول";
          btn.disabled = false;
          return;
        }

        if (!studentData.progress)
          studentData.progress = { mem: [], cons: [], rev: [] };
        if (!studentData.manualProgress)
          studentData.manualProgress = { mem: "", cons: "", rev: "" };
        if (!studentData.detailedProgress)
          studentData.detailedProgress = { mem: [], cons: [], rev: [] };
        if (!studentData.tasksTiming)
          studentData.tasksTiming = { mem: {}, cons: {}, rev: {} };

        currentStudent = studentData;
        localStorage.setItem(
          "wathbah_student_session",
          JSON.stringify(currentStudent),
        );

        requestFCMToken(currentStudent);

        loginScreen.style.display = "none";
        loadStudentDashboard();
      } catch (error) {
        console.error(error);
        alert("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.");
      } finally {
        btn.innerHTML = "تسجيل الدخول";
        btn.disabled = false;
      }
    });
  }

  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("wathbah_student_session");
      currentStudent = null;
      dashboardScreen.style.display = "none";
      loginScreen.style.display = "flex";
      document.getElementById("login-pin").value = "";
    });
  }

  async function loadStudentDashboard() {
    dashboardScreen.style.display = "block";

    document.getElementById("st-name").textContent =
      `أهلاً بك، ${currentStudent.name.split(" ")[0]}`;

    const trackInfo = tracksDefinition.find(
      (t) => t.id === currentStudent.trackId,
    );
    document.getElementById("st-track").textContent = trackInfo
      ? trackInfo.name
      : "المسار غير محدد";

    try {
      let circleName = "لم يتم التوزيع بعد";
      if (currentStudent.circleId) {
        const circleDoc = await dbFirestore
          .collection("groups")
          .doc(currentStudent.circleId)
          .get();
        if (circleDoc.exists) circleName = circleDoc.data().name;
      }
      document.getElementById("st-circle").textContent = circleName;

      const recordsSnap = await dbFirestore
        .collection("dailyRecords")
        .where("studentId", "==", currentStudent.id)
        .get();
      const records = recordsSnap.docs.map((doc) => doc.data());

      const currentDay = getCurrentProgramDay();
      const presentRecords = records.filter(
        (r) => r.attendance === "present" || r.attendance === "late",
      ).length;
      let attendancePercent =
        currentDay > 0 ? Math.round((presentRecords / currentDay) * 100) : 0;
      if (attendancePercent > 100) attendancePercent = 100;
      document.getElementById("st-attendance-rate").textContent =
        attendancePercent + "%";

      const attRateEl = document.getElementById("st-attendance-rate");
      attRateEl.style.color =
        attendancePercent >= 80
          ? "#166534"
          : attendancePercent >= 50
            ? "#b45309"
            : "#991b1b";

      const trackDays = trackInfo ? trackInfo.totalDays : 23;
      const totalTasks = trackDays * 3;

      const completedTasks =
        (currentStudent.progress?.mem?.length || 0) +
        (currentStudent.progress?.cons?.length || 0) +
        (currentStudent.progress?.rev?.length || 0);

      let progressPercent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      if (progressPercent > 100) progressPercent = 100;
      document.getElementById("st-progress-rate").textContent =
        progressPercent + "%";

      document.getElementById("st-today-label").textContent =
        getDateLabel(currentDay);

      let memTimeStr = "";
      let consTimeStr = "";
      let revTimeStr = "";

      if (currentStudent.progress?.mem?.includes(currentDay)) {
        const t = currentStudent.tasksTiming?.mem?.["day_" + currentDay];
        if (t) memTimeStr = ` (بعد ${t} ${t === "فجر" ? "🌅" : "🌇"})`;
      }
      if (currentStudent.progress?.cons?.includes(currentDay)) {
        const t = currentStudent.tasksTiming?.cons?.["day_" + currentDay];
        if (t) consTimeStr = ` (بعد ${t} ${t === "فجر" ? "🌅" : "🌇"})`;
      }
      if (currentStudent.progress?.rev?.includes(currentDay)) {
        const t = currentStudent.tasksTiming?.rev?.["day_" + currentDay];
        if (t) revTimeStr = ` (بعد ${t} ${t === "فجر" ? "🌅" : "🌇"})`;
      }

      document.getElementById("st-task-mem").innerHTML =
        getTaskText(currentStudent.trackId, "mem", currentDay) +
        `<span style="color:var(--primary-blue); font-size:0.75rem; font-weight:bold; margin-right:5px;">${memTimeStr}</span>`;
      document.getElementById("st-task-cons").innerHTML =
        getTaskText(currentStudent.trackId, "cons", currentDay) +
        `<span style="color:var(--primary-blue); font-size:0.75rem; font-weight:bold; margin-right:5px;">${consTimeStr}</span>`;
      document.getElementById("st-task-rev").innerHTML =
        getTaskText(currentStudent.trackId, "rev", currentDay) +
        `<span style="color:var(--primary-blue); font-size:0.75rem; font-weight:bold; margin-right:5px;">${revTimeStr}</span>`;

      const todayIso = new Date().toISOString().split("T")[0];
      const todayRecord = records.find((r) => r.date === todayIso);

      const statusDiv = document.getElementById("st-today-status");
      const statusCard = document.getElementById("st-today-status-card");

      if (todayRecord) {
        statusCard.style.borderTop = "4px solid #166534";
        let text = "";
        if (todayRecord.attendance === "present")
          text = "✨ حضرت الحلقة وتم تسجيل إنجازك اليوم، بارك الله فيك!";
        else if (todayRecord.attendance === "late")
          text = "⏳ حضرت متأخراً وتم تسجيل إنجازك، احرص على التبكير غداً!";
        else if (todayRecord.attendance === "excused") {
          text = "📩 تم قبول استئذانك وتم تسجيلك (مستأذن) اليوم.";
          statusCard.style.borderTop = "4px solid #0369a1";
          statusDiv.style.color = "#0369a1";
        } else if (todayRecord.attendance === "absent") {
          text = "⭕ تم تسجيلك (غائب) اليوم.";
          statusCard.style.borderTop = "4px solid #991b1b";
          statusDiv.style.color = "#991b1b";
        }
        statusDiv.textContent = text;
      } else {
        statusCard.style.borderTop = "4px solid var(--text-gray)";
        statusDiv.style.color = "var(--text-gray)";
        statusDiv.textContent =
          "لم يقم المعلم بتسجيل إنجازك وحضورك لهذا اليوم حتى الآن.";
      }

      // --- برمجة عرض المنهج الكامل للطالب ---
      const btnShowSyllabus = document.getElementById("btn-show-syllabus");
      if (btnShowSyllabus) {
        btnShowSyllabus.onclick = () => {
          const modal = document.getElementById("syllabus-modal");
          const tbody = document.getElementById("syllabus-modal-tbody");
          const trackNameEl = document.getElementById("syllabus-track-name");

          trackNameEl.textContent = trackInfo
            ? trackInfo.name
            : "المسار غير محدد";
          const sched = scheduleData[currentStudent.trackId] || [];
          tbody.innerHTML = "";

          sched.forEach((item) => {
            const isMemDone = currentStudent.progress?.mem?.includes(item.day);
            const isConsDone = currentStudent.progress?.cons?.includes(
              item.day,
            );
            const isRevDone = currentStudent.progress?.rev?.includes(item.day);

            const memStyle = isMemDone
              ? "text-decoration: line-through; color: #166534; font-weight: bold;"
              : "color: var(--text-dark);";
            const consStyle = isConsDone
              ? "text-decoration: line-through; color: #166534; font-weight: bold;"
              : "color: var(--text-dark);";
            const revStyle = isRevDone
              ? "text-decoration: line-through; color: #166534; font-weight: bold;"
              : "color: var(--text-dark);";

            const isCurrentDay = item.day === currentDay;
            const rowClass = isCurrentDay ? 'class="day-highlight"' : "";

            tbody.innerHTML += `
              <tr ${rowClass}>
                <td style="font-weight: bold; width: 130px;">${getDateLabel(item.day)}</td>
                <td>
                  <div style="margin-bottom:6px; font-size: 0.8rem; ${memStyle}">📖 حفظ: ${item.mem} ${isMemDone ? "✅" : ""}</div>
                  <div style="margin-bottom:6px; font-size: 0.8rem; ${consStyle}">🔄 تثبيت: ${item.cons} ${isConsDone ? "✅" : ""}</div>
                  <div style="font-size: 0.8rem; ${revStyle}">🔁 مراجعة: ${item.rev} ${isRevDone ? "✅" : ""}</div>
                </td>
              </tr>
            `;
          });

          modal.classList.add("active");
        };
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الطالب:", error);
    }
  }

  const msgForm = document.getElementById("student-message-form");
  if (msgForm) {
    msgForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const target = document.getElementById("msg-target").value;
      const subject = document.getElementById("msg-subject").value;
      const text = document.getElementById("msg-text").value;
      const btn = e.target.querySelector("button");

      btn.innerHTML = "جاري الإرسال...";
      btn.disabled = true;

      const newMsg = {
        id: "msg_" + Date.now(),
        senderId: currentStudent.id,
        senderName: currentStudent.name,
        senderRole: "student",
        receiverType: target,
        circleId: currentStudent.circleId || "",
        subject: subject,
        text: text,
        timestamp: Date.now(),
        date: new Date().toLocaleString("ar-SA"),
      };

      try {
        await dbFirestore.collection("messages").doc(newMsg.id).set(newMsg);
        alert("تم إرسال رسالتك بنجاح! 📬");
        msgForm.reset();
      } catch (err) {
        console.error(err);
        alert("فشل الإرسال، الرجاء التأكد من الاتصال بالإنترنت.");
      } finally {
        btn.innerHTML = "إرسال الرسالة 🚀";
        btn.disabled = false;
      }
    });
  }

  const passForm = document.getElementById("student-password-form");
  if (passForm) {
    passForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPin = document.getElementById("st-new-pin").value;

      if (newPin.length !== 4) {
        alert("الرقم السري يجب أن يكون 4 أرقام.");
        return;
      }

      try {
        await dbFirestore
          .collection("students")
          .doc(currentStudent.id)
          .update({ pin: newPin });
        currentStudent.pin = newPin;
        localStorage.setItem(
          "wathbah_student_session",
          JSON.stringify(currentStudent),
        );
        alert("تم تحديث الرقم السري الخاص بك بنجاح!");
        document.getElementById("st-new-pin").value = "";
      } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تغيير الرقم السري، تأكد من الاتصال بالإنترنت.");
      }
    });
  }
});
