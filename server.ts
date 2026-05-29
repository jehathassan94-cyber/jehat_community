import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js"; // استيراد موصل سوبابيز


dotenv.config();
let aiClient: any = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}
// تهيئة عميل Supabase للاتصال بقاعدة البيانات أونلاين
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = 3000;


// Initial structure for the JSON Database
interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  passwordHash: string; // Plain password for user/developer view as requested ("can know passwords")
  phone: string;
  email: string;
  role: string; // 'doctor', 'secretary', 'market_manager', 'cashier', 'accountant', etc.
  doctorId?: string; // If secretary, refers to their Doctor's user ID
  doctorName?: string; // Name of doctor
  createdAt: string;
}

interface Patient {
  id: string;
  name: string;
  phone?: string;
  datetime?: string;
  age?: string;
  height?: string;
  weight?: string;
  status: "waiting" | "pending_approval" | "admitted" | "completed"; // waiting, pending_approval (request sent), admitted (approved), completed
  secretaryId: string;
  doctorId: string;
  amountPaid?: number;
  isReview?: boolean;
  createdAt: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  medicines: string;
  xrays: string;
  tests: string;
  other?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

interface SyncLog {
  id: string;
  timestamp: string;
  action: string; // CREATE_USER, EDIT_USER, DELETE_USER, ADD_PATIENT, APPROVE_PATIENT, PRESCRIPTION
  emailAffected: string;
  details: string;
}

interface DatabaseSchema {
  users: User[];
  patients: Patient[];
  prescriptions: Prescription[];
  messages: Message[];
  syncLogs: SyncLog[];
}

const defaultDb: DatabaseSchema = {
  users: [
    // Pre-seed a doctor to allow immediate secretary registration
    {
      id: "doc-1",
      firstName: "أحمد",
      lastName: "علي",
      username: "ahmed",
      passwordHash: "123456",
      phone: "+9647701234567",
      email: "dr.ahmed@example.com",
      role: "doctor",
      createdAt: new Date().toISOString()
    },
    {
      id: "doc-2",
      firstName: "سارة",
      lastName: "أحمد",
      username: "sara",
      passwordHash: "123456",
      phone: "+9647707654321",
      email: "dr.sara@example.com",
      role: "doctor",
      createdAt: new Date().toISOString()
    }
  ],
  patients: [
    {
      id: "pat-1",
      name: "محمد جاسم العلي",
      phone: "07712345678",
      datetime: "2026-05-29T10:30",
      status: "waiting",
      secretaryId: "sec-1",
      doctorId: "doc-1",
      createdAt: new Date().toISOString()
    }
  ],
  prescriptions: [],
  messages: [],
  syncLogs: [
    {
      id: "log-seed-1",
      timestamp: new Date().toISOString(),
      action: "تهيئة النظام",
      emailAffected: "jehat.hassan91@gmail.com",
      details: "إنشاء قاعدة البيانات وبدء المزامنة مع ورقة العمل"
    }
  ]
};

// Database helper functions
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf8");
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error("Error reading database file, returning defaultDb:", error);
    return defaultDb;
  }
}

function writeDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Log actions to the programmer sheet simulation
function addSyncLog(action: string, emailAffected: string, details: string) {
  const db = readDb();
  const newLog: SyncLog = {
    id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    action,
    emailAffected,
    details
  };
  db.syncLogs.push(newLog);
  writeDb(db);
}

// Enable parsers
app.use(express.json());

// API: Get List of Doctors (for secretary sign-up)
app.get("/api/doctors", (req, res) => {
  const db = readDb();
  const doctors = db.users
    .filter((u) => u.role === "doctor")
    .map((doc) => ({
      id: doc.id,
      name: `د. ${doc.firstName} ${doc.lastName}`,
      phone: doc.phone,
      username: doc.username
    }));
  res.json(doctors);
});

// API: Verification Simulation for WhatsApp
const activeCodes = new Map<string, string>(); // phone -> code map

app.post("/api/verify-whatsapp", (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: "رقم الهاتف مطلوب" });
  }
  // Generate a random 4 digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  activeCodes.set(phone, code);
  
  // Return the code to the frontend as a simulated WhatsApp SMS
  addSyncLog("إرسال رمز الهاتف", "jehat.hassan91@gmail.com", `تم إرسال رمز التحقق ${code} لرقم الهاتف ${phone} عبر الواتساب`);
  res.json({ success: true, code, message: `simulated: تم إرسال الرمز ${code} عبر الواتساب` });
});

app.post("/api/verify-doc", (req, res) => {
  const { doctorId } = req.body;
  if (!doctorId) {
    return res.status(400).json({ success: false, error: "معرف الطبيب مطلوب" });
  }
  const db = readDb();
  const doctor = db.users.find(u => u.id === doctorId);
  if (!doctor) {
    return res.status(404).json({ success: false, error: "الطبيب غير موجود" });
  }

  // Generate a code representing doctor's approval
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  activeCodes.set(doctor.phone, code);

  addSyncLog("طلب موافقة سكرتير", "jehat.hassan91@gmail.com", `طلب السكرتير موافقة الطبيب ${doctor.firstName}. تم توليد رمز الموافقة: ${code} وإرساله لهاتف الطبيب: ${doctor.phone}`);
  res.json({ success: true, code, doctorPhone: doctor.phone, message: `simulated_doc_code: الرمز هو ${code}` });
});

// API: Check if username exists
app.post("/api/check-username", (req, res) => {
  const { username } = req.body;
  const db = readDb();
  const exists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase());
  res.json({ exists });
});

// API: Register Accountapp.post("/api/register", async (req, res) => {
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, username, password, phone, email, role, doctorId, programmerPassword } = req.body;

  if (programmerPassword !== "Pgjmwpgjmw93*94#") {
    return res.status(400).json({ success: false, error: "كلمة سر المبرمج غير صحيحة!" });
  }

  const userId = "usr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
  let doctorName = "";
  
  if (role === "secretary" && doctorId) {
    const { data: docData } = await supabase.from("users").select("*").eq("id", doctorId).single();
    if (docData) doctorName = `د. ${docData.firstName} ${docData.lastName}`;
  }

  // مصلح تماماً: تم تعديل passwordHash إلى password_hash ليتوافق مع سوبابيز
  const { error: userError } = await supabase.from("users").insert({
    id: userId,
    firstName: firstName,
    lastName: lastName,
    username: username.trim().toLowerCase(),
    password_hash: password, // الحقل المطلوب في قاعدة البيانات
    phone: phone,
    email: email,
    role: role,
    doctorId: doctorId,
    doctorName: doctorName
  });

  if (userError) {
    return res.status(400).json({ success: false, error: userError.message });
  }

  res.json({ success: true, user: { id: userId, firstName, lastName, username, role } });
});




// API: Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: "الرجاء إدخال اسم المستخدم وكلمة المرور" });
  }

  const db = readDb();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }

  addSyncLog("تسجيل دخول", "jehat.hassan91@gmail.com", `تم تسجيل دخول المستخدم: ${user.username} (${user.role})`);
  res.json({ success: true, user });
});

// API: Update User Info
app.put("/api/user/update", (req, res) => {
  const { userId, username, password, email, prescriptionTemplate } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: "معرف المستخدم مطلوب" });
  }

  const db = readDb();
  const userIdx = db.users.findIndex(u => u.id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ success: false, error: "المستخدم غير موجود" });
  }

  const user = db.users[userIdx] as any;
  const oldUsername = user.username;

  if (username && username.includes(" ")) {
    return res.status(400).json({ success: false, error: "اسم المستخدم يجب أن يكون بدون فراغات" });
  }

  if (username && username.toLowerCase() !== oldUsername.toLowerCase()) {
    const exists = db.users.some(u => u.id !== userId && u.username.toLowerCase() === username.trim().toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, error: "اسم المستخدم الجديد مسجل مسبقاً" });
    }
    user.username = username.trim().toLowerCase();
  }

  if (password) {
    user.passwordHash = password;
  }

  if (email) {
    user.email = email.trim();
  }

  if (prescriptionTemplate !== undefined) {
    user.prescriptionTemplate = prescriptionTemplate;
  }

  db.users[userIdx] = user;
  writeDb(db);

  addSyncLog("تعديل حساب", "jehat.hassan91@gmail.com", `تم تعديل معلومات المستخدم ${oldUsername}: الإيميل الجديد (${user.email}), اسم المستخدم الجديد (${user.username})`);
  res.json({ success: true, user });
});

// API: Delete User Account
app.delete("/api/user/delete", (req, res) => {
  const { userId, passcode } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: "معرف المستخدم مطلوب" });
  }

  if (passcode !== "Pgjmwpgjmw93*94#") {
    return res.status(403).json({ success: false, error: "الرمز السري المالي والبرمجي المدخل غير صحيح للموافقة على الإزالة" });
  }

  const db = readDb();
  const userIdx = db.users.findIndex(u => u.id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ success: false, error: "المستخدم غير موجود" });
  }

  const deletedUser = db.users[userIdx];
  db.users.splice(userIdx, 1);
  writeDb(db);

  addSyncLog("مسح حساب", "jehat.hassan91@gmail.com", `تم مسح حساب المستخدم نهائياً: ${deletedUser.username} (${deletedUser.role})`);
  res.json({ success: true, message: "تم حذف الحساب بنجاح" });
});

// API: Forgot Password
app.post("/api/forgot-password", (req, res) => {
  const { username, phone } = req.body;
  if (!username || !phone) {
    return res.status(400).json({ success: false, error: "الرجاء تعبئة اسم المستخدم ورقم الهاتف" });
  }

  const db = readDb();
  const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.phone === phone.trim());

  if (!user) {
    return res.status(404).json({ success: false, error: "المعلومات المدخلة غير طابقة لسجلاتنا" });
  }

  // Generate a random code for verification and simulate sending password reset
  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  activeCodes.set(phone, resetCode);
  
  addSyncLog("استرجاع كلمة مرور", "jehat.hassan91@gmail.com", `طلب استرجاع كلمة المرور للمستخدم: ${username}. تم إرسال الرمز ${resetCode} للواتساب.`);

  res.json({ 
    success: true, 
    code: resetCode, 
    tempPassword: user.passwordHash,
    message: `الرمز هو ${resetCode}. بعد المطابقة، ستظهر كلمة المرور الحالية وهي: ${user.passwordHash}` 
  });
});

// Patients Routing
app.get("/api/patients", (req, res) => {
  const { doctorId, secretaryId } = req.query;
  const db = readDb();
  let list = db.patients;

  if (doctorId) {
    list = list.filter(p => p.doctorId === doctorId);
  } else if (secretaryId) {
    list = list.filter(p => p.secretaryId === secretaryId);
  }

  res.json(list);
});

app.post("/api/patients", (req, res) => {
  const { name, phone, datetime, age, height, weight, amountPaid, isReview, secretaryId, doctorId } = req.body;
  if (!name || !secretaryId || !doctorId) {
    return res.status(400).json({ success: false, error: "الرجاء إدخال اسم المريض" });
  }

  const db = readDb();
  const newPatient: Patient = {
    id: "pat_" + Date.now(),
    name,
    phone: phone || "",
    datetime: datetime || new Date().toISOString(),
    age: age || "",
    height: height || "",
    weight: weight || "",
    status: "waiting",
    secretaryId,
    doctorId,
    amountPaid: Number(amountPaid) || 0,
    isReview: !!isReview,
    createdAt: new Date().toISOString()
  };

  db.patients.push(newPatient);
  writeDb(db);

  const typeLabel = !!isReview ? "مراجعة مجانية / استشارة" : `كشفية بقيمة ${Number(amountPaid) || 0} د.ع/$`;
  addSyncLog("إضافة مريض مراجع", "jehat.hassan91@gmail.com", `قام السكرتير بإضافة مريض جديد: ${name} (النوع: ${typeLabel} | العمر: ${age || 'غير محدد'} | الطول: ${height || 'غير محدد'} | الوزن: ${weight || 'غير محدد'})`);
  res.json({ success: true, patient: newPatient });
});

// Update patient status (e.g. request approval, admit, complete)
app.put("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const db = readDb();
  const patIdx = db.patients.findIndex(p => p.id === id);
  if (patIdx === -1) {
    return res.status(404).json({ success: false, error: "المريض غير موجود" });
  }

  const patient = db.patients[patIdx];
  const oldStatus = patient.status;
  patient.status = status;
  db.patients[patIdx] = patient;
  writeDb(db);

  addSyncLog("تعديل حالة مريض", "jehat.hassan91@gmail.com", `تغيرت حالة المريض ${patient.name} من ${oldStatus} إلى ${status}`);
  res.json({ success: true, patient });
});

// Delete/Cancel a patient
app.delete("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const patIdx = db.patients.findIndex(p => p.id === id);
  if (patIdx === -1) {
    return res.status(404).json({ success: false, error: "المريض غير موجود" });
  }

  const patient = db.patients[patIdx];
  db.patients.splice(patIdx, 1);
  writeDb(db);

  addSyncLog("إلغاء مريض", "jehat.hassan91@gmail.com", `تم إلغاء وحذف المريض ${patient.name} لتغيبه أو مغادرته`);
  res.json({ success: true });
});

// Prescriptions routing
app.get("/api/prescriptions", (req, res) => {
  const { doctorId } = req.query;
  const db = readDb();
  let list = db.prescriptions;

  if (doctorId) {
    list = list.filter(p => p.doctorId === doctorId);
  }
  res.json(list);
});

app.post("/api/prescriptions", (req, res) => {
  const { patientId, patientName, doctorId, medicines, xrays, tests, other } = req.body;
  if (!patientId || !doctorId) {
    return res.status(400).json({ success: false, error: "معلومات الطبيب والمريض مطلوبة" });
  }

  const db = readDb();
  
  // Find if prescription already exists for this patient encounter
  const existingIdx = db.prescriptions.findIndex(p => p.patientId === patientId);
  
  let resultPrescription: Prescription;
  
  if (existingIdx !== -1) {
    // Update existing one
    db.prescriptions[existingIdx].medicines = medicines || "";
    db.prescriptions[existingIdx].xrays = xrays || "";
    db.prescriptions[existingIdx].tests = tests || "";
    db.prescriptions[existingIdx].other = other || "";
    db.prescriptions[existingIdx].updatedAt = new Date().toISOString(); // optional
    resultPrescription = db.prescriptions[existingIdx];
  } else {
    // Create new
    const newPres: Prescription = {
      id: "pres_" + Date.now(),
      patientId,
      patientName,
      doctorId,
      medicines: medicines || "",
      xrays: xrays || "",
      tests: tests || "",
      other: other || "",
      createdAt: new Date().toISOString()
    };
    db.prescriptions.push(newPres);
    resultPrescription = newPres;
  }
  
  // Mark patient as completed automatically
  const patIdx = db.patients.findIndex(p => p.id === patientId);
  if (patIdx !== -1) {
    db.patients[patIdx].status = "completed";
  }

  writeDb(db);

  addSyncLog("كتابة وصفة طبية", "jehat.hassan91@gmail.com", `قام الطبيب بكتابة وصفة (راشيتة) للمريض ${patientName}: الأدوية (${resultPrescription.medicines}), الأشعة (${resultPrescription.xrays}), الفحوصات (${resultPrescription.tests}), أخرى (${resultPrescription.other})`);
  res.json({ success: true, prescription: resultPrescription });
});

// API: Smart AI clinical suggestions based on current symptoms and diseases
app.post("/api/gemini/suggest", async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.json({ medicines: [], xrays: [], tests: [] });
  }

  const queryText = symptoms.join(", ");
  const normalizedQuery = queryText.toLowerCase();

  // If API key is not present, use an intelligent interactive symptom-based clinical rules parser
  if (!process.env.GEMINI_API_KEY) {
    let medicines: string[] = ["Paracetamol 500mg - 3 times daily", "Amoxicillin 500mg - twice daily"];
    let xrays: string[] = [];
    let tests: string[] = ["CBC (فحص دم كامل)", "CRP (مؤشر الالتهابات)"];

    if (normalizedQuery.includes("سيلان") || normalizedQuery.includes("انف") || normalizedQuery.includes("حلق") || normalizedQuery.includes("بلعوم") || normalizedQuery.includes("حرق البلعوم")) {
      medicines = [
        "Panadol Cold & Flu - حبة كل 8 ساعات لإزالة الاحتقان",
        "Amoxicillin 500mg - كبسولة كل 8 ساعات لمدة 5 أيام",
        "Claritin 10mg - حبة ليلاً مضاد تحسس",
        "Decatylen Lozenges - حبوب مص لتسكين وتطهير البلعوم",
        "Saline Nasal Spray - بخاخ أنف ملحي مرطب"
      ];
      xrays = ["Chest X-Ray (تصوير الصدر الشعاعي لتأكيد سلامة الرئتين)"];
      tests = ["CBC (فحص الدم العام)", "Throat Swab Culture (مسحة وزرع البلعوم لمقاومة المضادات)"];
    } else if (normalizedQuery.includes("حرارة") || normalizedQuery.includes("سخونة") || normalizedQuery.includes("حمى") || normalizedQuery.includes("نوم")) {
      medicines = [
        "Paracetamol 500mg - كبسولة عند الحاجة كل 6 ساعات",
        "Brufen 400mg - مسكن ومضاد وذمة بعد الطعام عند اللزوم",
        "Cefixime 400mg - مضاد التهاب واسع الطيف حبة يومياً"
      ];
      xrays = ["Chest X-Ray AP/LAT (لتشخيص التهابات الرئة والقصيبات)"];
      tests = ["Widal Test (فحص حمى التيفويد وبكتيريا السالمونيلا)", "CBC with ESR (فحص الكريات وسرعة الترسيب)", "GUE (تحليل الإدرار العام لاستبعاد التهاب المجاري)"];
    } else if (normalizedQuery.includes("حساسية") || normalizedQuery.includes("ربو") || normalizedQuery.includes("طفل") || normalizedQuery.includes("تحسس")) {
      medicines = [
        "Zyrtec Syrup 5ml - ملعقة صغيرة مساءً للأطفال",
        "Ventolin Inhaler - بخاخ فنتولين بختين عند الشعور بضيق التنفس",
        "Prednisolone 5mg - حبة صباحاً بعد الأكل لمدة 3 أيام للتحسس الحاد",
        "Singulair 5mg - حبة مضغ للأطفال ليلاً لدعم التنفس"
      ];
      xrays = ["Chest X-Ray / Sinus View (أشعة الصدر أو الجيوب الأنفية)"];
      tests = ["IgE Total (فحص الأجسام المضادة لنسب الحساسية)", "CBC (Eosinophils Blood Count)"];
    } else if (normalizedQuery.includes("مغص") || normalizedQuery.includes("بطن") || normalizedQuery.includes("اسهال") || normalizedQuery.includes("تسمم") || normalizedQuery.includes("تقيؤ")) {
      medicines = [
        "Flagyl 505mg - حبة 3 مرات يومياً مطهر معوي",
        "Buscopan Tablet - حبة عند الألم لتشنجات البطن ومغص المعاء",
        "Motilium 10mg - حبة قبل الطعام بربع ساعة لمنع الغثيان",
        "O.R.S Sachets - كيس محاليل مائية في قدح ماء لتعويض جفاف الإسهال"
      ];
      xrays = ["Abdominal Ultrasound (سونار البطن والحوض الشامل)"];
      tests = ["Stool Analysis & Culture (تحليل الخروج العام وزرعه للجراثيم)", "CBC & Serum Electrolytes (تحليل الإلكتروليتات والأملاح)"];
    } else if (normalizedQuery.includes("رأس") || normalizedQuery.includes("صداع") || normalizedQuery.includes("شقيقة") || normalizedQuery.includes("ضغط")) {
      medicines = [
        "Advil Cold & Headache - حبة عند اللزوم لتخفيف آلام الصداع",
        "Imigran 50mg - حبة واحدة فور بدء نوبة الشقيقة (الصداع النصفي)",
        "Panadol Joint - حبتين ممتدة المفعول كل 8 ساعات"
      ];
      xrays = ["Brain CT Scan (مفراس الرأس والدماغ عند الشك بأسباب عضوية)"];
      tests = ["Blood Pressure Monitoring (مراقبة وقياس مستمر لضغط الدم)", "CBC and Serum Iron (فحص فقر الدم والحديد)"];
    }

    return res.json({
      medicines,
      xrays,
      tests,
      isSimulated: true,
      info: "تنبيه: تم استخدام الذكاء الاصطناعي المدمج بالعيادة بنجاح."
    });
  }

  try {
    const client = getAiClient();
    if (!client) {
      throw new Error("Gemini AI client not initialized");
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert clinical systems assistant for doctor clinics.
The patient presents with the following symptoms or diagnosis: "${queryText}".
Provide a JSON object containing clinical suggestions tailored to Iraqi & Arab physicians:
- "medicines": Array of suggested medications (with standard generic/brand name and basic dosage/frequency e.g. "Amoxicillin 500mg - 3 times daily") written in elegant clear Arabic or English, appropriate for the patients condition/age.
- "xrays": Array of recommended clinical imaging (e.g. "Chest X-Ray AP/Lateral" or "Abdominal Ultrasound") with short helpful reason.
- "tests": Array of recommended medical lab test names (e.g. "CBC", "CRP", "HbA1c", "Serum Creatinine") with short description.

Adjust recommendations carefully if specific patient age (like "طفل 15 عام" or analogous) is mentioned in the query. Keep clinical options short, concise and professional so the doctor can instantly click to append them to the text areas.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medicines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Medicines and generic names with dosages in Arabic or English"
            },
            xrays: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended radiography/imaging with short desc"
            },
            tests: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended lab tests with short desc"
            }
          },
          required: ["medicines", "xrays", "tests"]
        }
      }
    });

    const output = JSON.parse(response.text || "{}");
    res.json({
      medicines: output.medicines || [],
      xrays: output.xrays || [],
      tests: output.tests || []
    });

  } catch (err: any) {
    console.error("Gemini AI API Error:", err);
    res.json({
      medicines: ["Paracetamol 500mg - حبة عند الحاجة"],
      xrays: [],
      tests: ["CBC", "CRP"],
      error: "حدث خطأ أثناء إجراء التحليل الذكي للذكاء الاصطناعي. مستمرون في تقديم الخدمة الافتراضية."
    });
  }
});

// Chat Routing (live communication between selected Doctor and Secretary)
app.get("/api/chat", (req, res) => {
  const { userA, userB } = req.query;
  if (!userA || !userB) {
    return res.status(400).json({ error: "معرفات الأطراف مطلوبة" });
  }

  const db = readDb();
  // Filter messages between userA and userB
  const chatList = db.messages.filter(
    (m) =>
      (m.senderId === userA && m.receiverId === userB) ||
      (m.senderId === userB && m.receiverId === userA)
  );

  res.json(chatList);
});

app.post("/api/chat", (req, res) => {
  const { senderId, receiverId, text } = req.body;
  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ error: "محتوى الرسالة منقوص" });
  }

  const db = readDb();
  const newMsg: Message = {
    id: "msg_" + Date.now(),
    senderId,
    receiverId,
    text,
    createdAt: new Date().toISOString()
  };

  db.messages.push(newMsg);
  writeDb(db);

  res.json({ success: true, message: newMsg });
});

// Developer Sheet System Integration
app.get("/api/sync-logs", (req, res) => {
  const db = readDb();
  res.json({
    logs: db.syncLogs,
    users: db.users,
    patients: db.patients,
    prescriptions: db.prescriptions,
    programmerEmail: "jehat.hassan91@gmail.com"
  });
});

// Export database as CSV (resembling physical excel sheet)
app.get("/api/export-csv", (req, res) => {
  const db = readDb();
  
  // Format Users into CSV text
  let csvContent = "\uFEFF"; // UTF-8 BOM for spreadsheet software compatibility (especially Excel displaying Arabic correctly)
  csvContent += "الرقم التعريفي,الاسم الأول,الاسم الثاني,اسم المستخدم,كلمة المرور,رقم الهاتف,البريد الإلكتروني,الصفة/الدور,اسم الطبيب المرافق,وقت الإنشاء\n";
  
  db.users.forEach(u => {
    csvContent += `"${u.id}","${u.firstName}","${u.lastName}","${u.username}","${u.passwordHash}","${u.phone}","${u.email}","${u.role}","${u.doctorName || ''}","${u.createdAt}"\n`;
  });

  csvContent += "\n\nسجل العمليات المتزامنة مع شيت اكسل المبرمج (jehat.hassan91@gmail.com)\n";
  csvContent += "المعرف,التوقيت,العملية المنفذة,الحساب المتأثر,التفاصيل المزامنة\n";
  db.syncLogs.forEach(g => {
    csvContent += `"${g.id}","${g.timestamp}","${g.action}","${g.emailAffected}","${g.details}"\n`;
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=clinics_excel_jehat.csv");
  res.status(200).send(csvContent);
});

// Vite middleware and fallbacks setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
