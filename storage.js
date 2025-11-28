// أدوات التخزين وإدارة البيانات المشتركة

// ملاحظة مهمة:
// حالياً يتم تخزين كل شيء باستخدام localStorage داخل المتصفح فقط.
// هذا يعني أن الأسعار والأجور التي تحفظها تظهر لك على نفس الجهاز والمتصفح فقط.
// إذا أردت أن يشاهد أي شخص يفتح الرابط من أي مكان نفس الأسعار التي قمت بحفظها，
// فيجب ربط الموقع بقاعدة بيانات أو سيرفر (API) على الإنترنت بدلاً من localStorage.
// يمكن عندها استبدال هذه الدوال (getData / saveData / getUsers / addUser / ...) بدوال
// تستدعي السيرفر باستخدام fetch أو أي طريقة أخرى.
//
// ما الذي تحتاج أن تزودني به لربط قاعدة بيانات حقيقية (بالتفصيل):
// 1) رابط الـ API الأساسي (Base URL):
//    - مثال: https://api.example.com أو https://your-domain.com/api
//
// 2) مسارات (Endpoints) واضحة لكل عملية، مع طريقة الطلب:
//
//    أ) المستخدمون / تسجيل الدخول / الجلسات:
//       - POST /auth/login
//         • يستقبل JSON: { "username": "admin", "password": "1234" }
//         • يعيد JSON: {
//             "ok": true/false,
//             "message": "اختياري",
//             "token": "JWT_OR_SESSION_TOKEN",
//             "user": {
//               "username": "admin",
//               "isSuper": true/false,
//               "permissions": {
//                 "canSyria": true/false,
//                 "canFees": true/false,
//                 "canFx": true/false,
//                 "canManageUsers": true/false
//               }
//             }
//           }
//
//       - GET /users
//         • (اختياري) لقراءة قائمة المدراء.
//         • يجب أن يرجع مصفوفة مستخدمين بنفس شكل الحقل "user" أعلاه.
//         • الوصول غالباً يكون مع هيدر Authorization: Bearer <token>.
//
//       - POST /users
//         • لإضافة مدير جديد.
//         • JSON مرسل: {
//             "username": "name",
//             "password": "pass",
//             "permissions": {
//               "canSyria": true/false,
//               "canFees": true/false,
//               "canFx": true/false,
//               "canManageUsers": true/false
//             },
//             "isSuper": true/false
//           }
//         • JSON مستلم: { "ok": true/false, "message": "..." }
//
//       - (اختياري) PUT /users/:username لتعديل الصلاحيات أو كلمة المرور.
//
//    ب) بيانات الأسعار والأجور (ما يخص getData / saveData):
//       - GET /prices
//         • يعيد كل شيء تحتاجه public.html و admin.html بصيغة JSON، مثلاً:
//           {
//             "syriaPrices": {
//               "دمشق": { "buy": "10000", "sell": "10100" },
//               "حلب":  { "buy": "...",   "sell": "..."   },
//               ...
//             },
//             "fees": {
//               "دمشق": { "usdPercent": "2.5", "sypPercent": "3" },
//               "حلب":  { "usdPercent": "...", "sypPercent": "..." },
//               ...
//             },
//             "fx": {
//               "USD": { "buy": "15000", "sell": "15100" },
//               "EUR": { "buy": "...",    "sell": "..."   },
//               ...
//             },
//             "globalLastUpdatedAt": 1710000000000,
//             "globalLastUpdatedBy": "admin",
//             "lastUpdatedSyriaAt": 1710000000000,
//             "lastUpdatedSyriaBy": "admin",
//             "lastUpdatedFeesAt": 1710000000000,
//             "lastUpdatedFeesBy": "user1",
//             "lastUpdatedFxAt": 1710000000000,
//             "lastUpdatedFxBy": "user2"
//           }
//
//       - POST /prices/syria
//         • لتحديث أسعار السوري فقط.
//         • JSON مرسل: {
//             "syriaPrices": { ...نفس التركيب الموجود أعلاه... },
//             "updatedBy": "اسم_المدير"
//           }
//         • يعيد JSON محدث كامل أو تأكيد: { "ok": true, "data": { ...نفس شكل GET /prices... } }
//
//       - POST /prices/fees
//         • لتحديث أجور الحوالات.
//         • JSON مرسل: { "fees": { ... }, "updatedBy": "اسم_المدير" }
//         • يعيد نفس نوع الرد.
//
//       - POST /prices/fx
//         • لتحديث أسعار العملات العالمية.
//         • JSON مرسل: { "fx": { ... }, "updatedBy": "اسم_المدير" }
//         • يعيد نفس نوع الرد.
//
// 3) طريقة التحقق (Authentication):
//    - هل تستخدم توكن (JWT)؟
//      • إذا نعم: أرسل لي شكل التوكن وكيف يتم إرساله (عادة في Authorization Header).
//    - أو كوكي جلسة Session Cookie من السيرفر؟
//      • إذا نعم: هل الدومين والـ CORS جاهزين؟
//
// 4) أي قيود إضافية تريدها:
//    - مثلاً: هل تريد منع حذف مستخدم admin من الـ API؟
//    - هل تريد أن يقوم السيرفر نفسه بحساب الحقول lastUpdated* ؟
//      إذا نعم، لا داعي لأن نرسل timestamp من الواجهة.
//
// 5) مثال حقيقي واحد على الأقل من كل رد (Response) من الـ API:
//    - نسخة JSON حقيقية من:
//      • رد تسجيل الدخول الناجح والفاشل.
//      • رد GET /prices.
//      • رد POST /prices/syria بعد حفظ ناجح.
//
// بعد أن تزودني بما يلي:
//   • Base URL للـ API
//   • قائمة المسارات (endpoints) مع طرق الطلب (GET/POST/PUT)
//   • نماذج JSON للطلبات (Request Body) والردود (Response)
//   • طريقة التوثيق (JWT أو كوكي، مع مثال للهيدر)
// يمكنني عندها:
//   • استبدال استخدام localStorage في الدوال getData / saveData / getUsers / addUser / authenticate
//   • وربطها باستدعاءات fetch للسيرفر بحيث تصبح الأسعار مشتركة بين جميع الزوار.

const STORAGE_KEY = "zamzam_exchange_data_v1";
const USERS_KEY = "zamzam_exchange_users_v1";
const SESSION_KEY = "zamzam_exchange_session_v1";

export const SYRIAN_PROVINCES = [
  "دمشق",
  "ريف دمشق",
  "حلب",
  "حمص",
  "حماة",
  "اللاذقية",
  "طرطوس",
  "إدلب",
  "الرقة",
  "دير الزور",
  "الحسكة",
  "درعا",
  "السويداء",
  "القنيطرة"
];

export const WORLD_CURRENCIES = [
  { code: "USD", name: "دولار أمريكي" },
  { code: "EUR", name: "يورو" },
  { code: "TRY", name: "ليرة تركية" },
  { code: "SAR", name: "ريال سعودي" },
  { code: "AED", name: "درهم إماراتي" }
];

function normalizeUser(user) {
  if (!user) return null;
  const isSuper = !!user.isSuper || user.username === "admin";
  const permissions = user.permissions || {};
  const basePermissions = {
    isSuper,
    canSyria: isSuper || !!permissions.canSyria,
    canFees: isSuper || !!permissions.canFees,
    canFx: isSuper || !!permissions.canFx,
    canManageUsers: isSuper || !!permissions.canManageUsers
  };
  return { ...user, isSuper, permissions: basePermissions };
}

// تهيئة أولية للمستخدمين (إنشاء admin / 1234 إذا لم يكن موجوداً)
export function ensureInitialUsers() {
  let users = JSON.parse(localStorage.getItem(USERS_KEY) || "null");
  if (!Array.isArray(users) || users.length === 0) {
    users = [
      {
        username: "admin",
        password: "1234",
        isSuper: true,
        permissions: {
          canSyria: true,
          canFees: true,
          canFx: true,
          canManageUsers: true
        }
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  return users;
}

export function getUsers() {
  return ensureInitialUsers().map(u => normalizeUser(u));
}

export function getUserByUsername(username) {
  const users = ensureInitialUsers();
  const found = users.find(u => u.username === username);
  return normalizeUser(found);
}

export function getPermissionsForUser(username) {
  const user = getUserByUsername(username);
  if (!user) {
    // في حال عدم العثور على المستخدم، نعطي صلاحيات كاملة كاحتياط
    return {
      isSuper: true,
      canSyria: true,
      canFees: true,
      canFx: true,
      canManageUsers: true
    };
  }
  return user.permissions || {
    isSuper: !!user.isSuper,
    canSyria: !!user.isSuper,
    canFees: !!user.isSuper,
    canFx: !!user.isSuper,
    canManageUsers: !!user.isSuper
  };
}

export function addUser(username, password, permissions = {}) {
  const trimmedUser = (username || "").trim();
  const trimmedPass = (password || "").trim();
  if (!trimmedUser || !trimmedPass) return { ok: false, message: "الرجاء إدخال اسم وكلمة مرور" };

  const users = ensureInitialUsers();
  if (users.some(u => u.username === trimmedUser)) {
    return { ok: false, message: "اسم المستخدم موجود مسبقاً" };
  }

  const isSuper = !!permissions.isSuper;
  const newUser = {
    username: trimmedUser,
    password: trimmedPass,
    isSuper,
    permissions: {
      canSyria: !!permissions.canSyria,
      canFees: !!permissions.canFees,
      canFx: !!permissions.canFx,
      canManageUsers: !!permissions.canManageUsers
    }
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true };
}

export function updateUser(username, updates) {
  const users = ensureInitialUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) return { ok: false, message: "المستخدم غير موجود" };

  const current = users[idx];
  const merged = { ...current, ...updates };
  if (updates.permissions) {
    merged.permissions = {
      ...(current.permissions || {}),
      ...updates.permissions
    };
  }
  if (typeof updates.isSuper === "boolean") {
    merged.isSuper = updates.isSuper;
  }

  users[idx] = merged;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true };
}

export function authenticate(username, password) {
  const users = ensureInitialUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return null;
  const session = { username: user.username, loginAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getCurrentSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function requireAuthOrRedirect() {
  const session = getCurrentSession();
  if (!session) {
    window.location.replace("./index.html");
    return null;
  }
  return session;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// بيانات الأسعار
export function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createEmptyData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...createEmptyData(), ...parsed };
  } catch {
    const initial = createEmptyData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

export function saveData(partial, sectionKey, username) {
  const current = getData();
  const now = Date.now();
  const updated = {
    ...current,
    ...partial,
    globalLastUpdatedAt: now,
    globalLastUpdatedBy: username || current.globalLastUpdatedBy || null
  };

  if (sectionKey === "syria") {
    updated.lastUpdatedSyriaAt = now;
    updated.lastUpdatedSyriaBy = username;
  } else if (sectionKey === "fees") {
    updated.lastUpdatedFeesAt = now;
    updated.lastUpdatedFeesBy = username;
  } else if (sectionKey === "fx") {
    updated.lastUpdatedFxAt = now;
    updated.lastUpdatedFxBy = username;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

function createEmptyData() {
  const syriaPrices = {};
  const fees = {};
  SYRIAN_PROVINCES.forEach(p => {
    syriaPrices[p] = { buy: "", sell: "" };
    fees[p] = {
      usdPercent: "",
      sypPercent: ""
    };
  });

  const fx = {};
  WORLD_CURRENCIES.forEach(c => {
    fx[c.code] = { buy: "", sell: "" };
  });

  return {
    syriaPrices,
    fees,
    fx,
    globalLastUpdatedAt: null,
    globalLastUpdatedBy: null,
    lastUpdatedSyriaAt: null,
    lastUpdatedSyriaBy: null,
    lastUpdatedFeesAt: null,
    lastUpdatedFeesBy: null,
    lastUpdatedFxAt: null,
    lastUpdatedFxBy: null
  };
}

export function formatTimestamp(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  const date = d.toLocaleDateString("ar-SY", { year: "numeric", month: "2-digit", day: "2-digit" });
  const time = d.toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" });
  return `${date} - ${time}`;
}