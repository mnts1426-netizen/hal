// تهيئة Firebase ديناميكياً (بحيث لا نضطر لتضمين مكتبات ضخمة في HTML)
window.initFirebase = async function (config) {
  try {
    const { initializeApp } =
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js");
    const {
      getFirestore,
      collection,
      getDocs,
      doc,
      setDoc,
      query,
      where,
      serverTimestamp,
      addDoc,
    } =
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
    const { getAuth, signInWithEmailAndPassword, signOut } =
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");

    const app = initializeApp(config);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // ربط الخدمات بالنظام ليستخدمها app.js
    window.firebaseApp = app;
    window.firestore = db;
    window.authSystem = auth;

    // ==========================================
    // 1. نظام المصادقة المبسط (الاسم + PIN)
    // ==========================================
    window.api = {
      // جلب الأسماء لملء القائمة المنسدلة في شاشة الدخول
      getUsersByRole: async (role) => {
        const q = query(collection(db, "users"), where("role", "==", role));
        const snap = await getDocs(q);
        const users = [];
        snap.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
        return users;
      },

      // تسجيل الدخول
      login: async (email, pin) => {
        // ندمج الـ PIN مع كلمة مرور النظام لأن Firebase يطلب 6 أحرف كحد أدنى
        const systemPassword = pin + "-systemKey2026";
        return await signInWithEmailAndPassword(auth, email, systemPassword);
      },

      logout: async () => {
        await signOut(auth);
      },

      // ==========================================
      // 2. العمليات الأكاديمية (الطلاب، الحلقات، التسميع)
      // ==========================================

      // جلب الطلاب (النظام آمن لأن firestore.rules ستفلتر البيانات تلقائياً)
      getStudents: async (userScope) => {
        let q = collection(db, "students");

        // إذا كان معلماً، نجلب طلاب حلقته فقط
        if (userScope.role === "teacher") {
          q = query(
            collection(db, "students"),
            where("circleId", "==", userScope.circleId),
          );
        }
        // إذا كان مشرفاً، نجلب طلاب حلقاته فقط
        else if (userScope.role === "supervisor") {
          q = query(
            collection(db, "students"),
            where("circleId", "in", userScope.managedCircles),
          );
        }
        // المدير (Admin) يسحب كل الطلاب بدون where

        const snap = await getDocs(q);
        const students = [];
        snap.forEach((d) => students.push({ id: d.id, ...d.data() }));
        return students;
      },

      // تسجيل الحضور مع إضافة سجل للعمليات تلقائياً (Audit Log)
      markAttendance: async (data, actorInfo) => {
        const attRef = await addDoc(collection(db, "attendance"), {
          ...data,
          date: new Date().toISOString().split("T")[0], // تاريخ اليوم
          timestamp: serverTimestamp(),
        });

        // توثيق العملية
        await addDoc(collection(db, "audit_logs"), {
          action: "record_attendance",
          actor: actorInfo.name,
          actorRole: actorInfo.role,
          targetId: data.studentId,
          timestamp: serverTimestamp(),
        });

        return attRef;
      },
    };

    console.log("تم تفعيل المحرك: الأكاديمية جاهزة.");
  } catch (err) {
    console.error("خطأ في تهيئة النظام المحرك:", err);
  }
};

// إعدادات Firebase الخاصة بك (ضع مفاتيح مشروعك الحقيقية هنا لاحقاً)
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBuSNVMvwhKLgrPxVLo5n5sD6c_BLYsqT8",
  authDomain: "hadith-system-92058.firebaseapp.com",
  projectId: "hadith-system-92058",
  storageBucket: "hadith-system-92058.firebasestorage.app",
  messagingSenderId: "863793007314",
  appId: "1:863793007314:web:437a6c149455b95af33b0b",
};

// التشغيل التلقائي
window.initFirebase(window.FIREBASE_CONFIG);
