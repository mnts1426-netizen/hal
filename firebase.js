// إعدادات Firebase الخاصة بمشروعك (hadith-system-92058)
const firebaseConfig = {
  apiKey: "AIzaSyBuSNVMvwhKLgrPxVLo5n5sD6c_BLYsqT8",
  authDomain: "hadith-system-92058.firebaseapp.com",
  projectId: "hadith-system-92058",
  storageBucket: "hadith-system-92058.firebasestorage.app",
  messagingSenderId: "863793007314",
  appId: "1:863793007314:web:437a6c149455b95af33b0b",
};

// تهيئة النظام (بنسخة متوافقة تماماً مع الكود الذي برمجناه)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// تفعيل قاعدة البيانات
const dbFirestore = firebase.firestore();

// تفعيل ميزة (العمل بدون إنترنت - Offline Persistence)
dbFirestore.enablePersistence().catch(function (err) {
  if (err.code == "failed-precondition") {
    console.warn("تنبيه: ميزة الأوفلاين تعمل في تبويب واحد فقط لتجنب التضارب.");
  } else if (err.code == "unimplemented") {
    console.warn("تنبيه: المتصفح الحالي لا يدعم ميزة الأوفلاين.");
  }
});

console.log("تم تفعيل المحرك السحابي: النظام جاهز ومربوط بنجاح!");
