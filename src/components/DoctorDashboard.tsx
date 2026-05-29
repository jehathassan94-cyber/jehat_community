import React, { useState, useEffect, useRef } from "react";
import { 
  User, MessageSquare, Plus, Trash2, Edit2, LogOut, Check, Printer, Settings,
  AlertCircle, ShieldCheck, Mail, Lock, Phone, UserCheck, Stethoscope, ChevronLeft, Send, Sparkles, BookOpen,
  DollarSign, Coins, TrendingUp, X, Search, Database, Calendar, Clock
} from "lucide-react";
import { Patient, Prescription, Message, User as UserType } from "../types";

const defaultTemplate = {
  clinicName: "",
  doctorTitle: "",
  phone: "",
  address: "بغداد، العراق",
  logoSymbol: "stethoscope",
  logoUrl: "",
  fontFamily: "Cairo",
  fontSize: "sm",
  themeColor: "#3182CE",
  topMargin: 20,
  bottomMargin: 20,
  hideHeaderFooter: false,
  showDate: true,
  showAge: true,
  showHeightWeight: true,
  showBarcode: true,
  showSignatory: true,
  signatoryText: "توقيع وختم الطبيب المعتمد",
  customNotesBottom: "يرجى الإلتزام بمواعيد وطبيعة الجرعات المحددة في الروشتة والتواصل مع العيادة عند الطوارئ.",
  medicinesLabel: "💊 الأدوية الموصوفة والجرعات",
  xraysLabel: "🔮 الأشعة والسونار المطلوبة",
  testsLabel: "🧪 التحاليل المخبرية المطلوبة",
  instructionsLabel: "📝 ملاحظات وتوجيهات أخرى"
};

const getLogoSymbolSvg = (symbol: string, color: string) => {
  switch (symbol) {
    case "stethoscope":
      return `<svg style="color: ${color}; fill: none; stroke: currentColor; stroke-width: 2; width: 44px; height: 44px;" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5"/><circle cx="12" cy="7" r="5"/><path d="M12 12v4.5m0 0a1.5 1.5 0 103 0M12 16.5a1.5 1.5 0 11-3 0"/></svg>`;
    case "cross":
      return `<svg style="color: ${color}; fill: none; stroke: currentColor; stroke-width: 2.5; width: 40px; height: 40px;" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "rx":
      return `<div style="font-family: 'Times New Roman', serif; font-size: 38px; font-weight: bold; color: ${color}; font-style: italic; line-height: 1;">℞</div>`;
    case "dental":
      return `<svg style="color: ${color}; fill: none; stroke: currentColor; stroke-width: 2; width: 40px; height: 40px;" viewBox="0 0 24 24"><path d="M12 2C8.5 2 6 4.5 6 8c0 4 3 6.5 4 10a4 4 0 008 0c1-3.5 4-6 4-10 0-3.5-2.5-6-6-6z" stroke-linecap="round"/><path d="M10 14h4" stroke-linecap="round"/></svg>`;
    case "eye":
      return `<svg style="color: ${color}; fill: none; stroke: currentColor; stroke-width: 2; width: 40px; height: 40px;" viewBox="0 0 24 24"><path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>`;
    case "heart":
      return `<svg style="color: ${color}; fill: none; stroke: currentColor; stroke-width: 2; width: 40px; height: 40px;" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "activity":
      return `<svg style="color: ${color}; fill: none; stroke: currentColor; stroke-width: 2; width: 40px; height: 40px;" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "shield":
      return `<svg style="color: ${color}; fill: none; stroke: currentColor; stroke-width: 2; width: 40px; height: 40px;" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "award":
      return `<svg style="color: ${color}; fill: none; stroke: currentColor; stroke-width: 2; width: 40px; height: 40px;" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    default:
      return "";
  }
};

const getPrescriptionStyles = (temp: any) => {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Almarai:wght@400;700&family=Tajawal:wght@400;500;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=El+Messiri:wght@450;700&family=Inter:wght@400;700&display=swap');
    body {
      font-family: '${temp.fontFamily || "Cairo"}', sans-serif;
      direction: rtl;
      padding: 35px;
      color: #2D3748;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px double ${temp.themeColor || "#3182CE"};
      padding-bottom: 15px;
      margin-bottom: 25px;
      display: ${temp.hideHeaderFooter ? "none!important" : "flex"};
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }
    .header-text {
      text-align: right;
      flex: 1;
    }
    .header-logo {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      background-color: #F8FAFC;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
    }
    .logo-img {
      max-height: 70px;
      max-width: 140px;
      object-fit: contain;
    }
    .title {
      font-family: '${temp.clinicNameFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.clinicNameFontSize || 22}px;
      font-weight: bold;
      color: ${temp.clinicNameColor || temp.themeColor || "#1A365D"};
      margin: 0;
      display: ${temp.clinicNameShow === false ? "none!important" : "block"};
    }
    .doctor-sub {
      font-family: '${temp.doctorTitleFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.doctorTitleFontSize || 13}px;
      color: ${temp.doctorTitleColor || "#4A5568"};
      margin-top: 6px;
      font-weight: 600;
      display: ${temp.doctorTitleShow === false ? "none!important" : "block"};
    }
    .phone-text {
      font-family: '${temp.phoneFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.phoneFontSize || 11}px;
      color: ${temp.phoneColor || "#718096"};
      margin: 2px 0 0 0;
      display: ${temp.phoneShow === false ? "none!important" : "block"};
    }
    .address-text {
      font-family: '${temp.addressFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.addressFontSize || 11}px;
      color: ${temp.addressColor || "#718096"};
      margin: 2px 0 0 0;
      display: ${temp.addressShow === false ? "none!important" : "block"};
    }
    .patient-box {
      background-color: #F8FAFC;
      padding: 10px 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #E2E8F0;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .patient-box strong {
      color: #2D3748;
    }
    .section-header {
      font-weight: bold;
      color: ${temp.themeColor || "#3182CE"};
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 4px;
      margin-bottom: 12px;
    }
    .content {
      font-size: 14px;
      white-space: pre-wrap;
      background-color: #FAFAFA;
      padding: 12px;
      border-radius: 6px;
      border-right: 4px solid ${temp.themeColor || "#3182CE"};
      min-height: 120px;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #E2E8F0;
      border-left: 1px solid #E2E8F0;
      line-height: 1.6;
    }
    .prescription-grid {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
    }
    .pres-section {
      background-color: #FAFAFA;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
    }
    .section-label {
      font-weight: bold;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 3px;
      margin-bottom: 8px;
    }
    .medicines-label {
      font-family: '${temp.medicinesFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.medicinesFontSize || 16}px;
      color: ${temp.medicinesColor || temp.themeColor || "#3182CE"};
    }
    .xrays-label {
      font-family: '${temp.xraysFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.xraysFontSize || 14}px;
      color: ${temp.xraysColor || temp.themeColor || "#3182CE"};
    }
    .tests-label {
      font-family: '${temp.testsFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.testsFontSize || 14}px;
      color: ${temp.testsColor || temp.themeColor || "#3182CE"};
    }
    .instructions-label {
      font-family: '${temp.instructionsFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.instructionsFontSize || 14}px;
      color: ${temp.instructionsColor || temp.themeColor || "#3182CE"};
    }
    .section-body {
      font-size: 14px;
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .footer-sig {
      font-family: '${temp.signatoryFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.signatoryFontSize || 12}px;
      font-weight: bold;
      color: ${temp.signatoryColor || "#2D3748"};
      margin-top: 40px;
      text-align: left;
      padding-left: 20px;
      display: ${temp.showSignatory && !temp.hideHeaderFooter ? "block" : "none"};
    }
    .custom-bottom-notes {
      font-family: '${temp.notesFontFamily || temp.fontFamily || "Cairo"}', sans-serif;
      font-size: ${temp.notesFontSize || 10}px;
      color: ${temp.notesColor || "#718096"};
      border-top: 1px dashed #E2E8F0;
      padding-top: 6px;
      margin-top: 20px;
      text-align: center;
      font-style: italic;
    }
    .barcode-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 8px;
      font-family: monospace;
      color: #718096;
    }
    .barcode-lines {
      font-size: 14px;
      letter-spacing: 1.5px;
      font-weight: bold;
      color: #2D3748;
      line-height: 1;
    }
    @media print {
      body { 
        padding-top: ${temp.topMargin}px !important;
        padding-bottom: ${temp.bottomMargin}px !important;
      }
      .patient-box { background-color: #F8FAFC !important; -webkit-print-color-adjust: exact; }
      .content { background-color: #FAFAFA !important; -webkit-print-color-adjust: exact; }
      .pres-section { background-color: #FAFAFA !important; -webkit-print-color-adjust: exact; }
    }
  `;
};

const getLogoHeaderHTML = (temp: any) => {
  if (temp.hideHeaderFooter) return "";
  
  const logoContent = temp.logoUrl && temp.logoUrl.trim() 
    ? `<img src="${temp.logoUrl.trim()}" class="logo-img" alt="Logo" />`
    : (temp.logoSymbol !== "custom" ? getLogoSymbolSvg(temp.logoSymbol, temp.themeColor) : "");

  return `
    <div class="header">
      <div class="header-text">
        <h1 class="title" style="${temp.clinicNameShow === false ? 'display: none!important;' : ''}">${temp.clinicName}</h1>
        <p class="doctor-sub" style="${temp.doctorTitleShow === false ? 'display: none!important;' : ''}">${temp.doctorTitle}</p>
        ${temp.address && temp.address.trim() ? `<p class="address-text" style="${temp.addressShow === false ? 'display: none!important;' : ''}">📍 ${temp.address}</p>` : ""}
        ${temp.phone && temp.phone.trim() ? `<p class="phone-text" style="${temp.phoneShow === false ? 'display: none!important;' : ''}">📞 ${temp.phone}</p>` : ""}
      </div>
      ${logoContent ? `<div class="header-logo">${logoContent}</div>` : ""}
    </div>
  `;
};

const getPatientBoxHTML = (
  patientName: string, 
  temp: any, 
  patientAge?: string, 
  patientHeight?: string, 
  patientWeight?: string
) => {
  const showAgeFlag = temp.showAge && patientAge;
  const showVitalsFlag = temp.showHeightWeight && (patientHeight || patientWeight);
  const showBarcodeFlag = temp.showBarcode;

  return `
    <div class="patient-box">
      <div>
        <strong>اسم المريض:</strong> ${patientName || "—"}
      </div>
      
      ${showAgeFlag ? `<div><strong>العمر:</strong> ${patientAge} سنة</div>` : ""}
      
      ${showVitalsFlag ? `
        <div style="font-family: monospace;">
          ${patientHeight ? `<strong>الطول:</strong> ${patientHeight} سم` : ""}
          ${patientHeight && patientWeight ? " | " : ""}
          ${patientWeight ? `<strong>الوزن:</strong> ${patientWeight} كجم` : ""}
        </div>
      ` : ""}
      
      ${temp.showDate ? `<div><strong>تاريخ الطباعة:</strong> ${new Date().toLocaleDateString("ar-EG")}</div>` : ""}

      ${showBarcodeFlag ? `
        <div class="barcode-container">
          <div class="barcode-lines">||| | || |||| | ||| | ||</div>
          <div>PAT-${Math.floor(Date.now() / 100000)}</div>
        </div>
      ` : ""}
    </div>
  `;
};

interface DoctorDashboardProps {
  currentUser: UserType;
  onLogout: () => void;
}

export default function DoctorDashboard({
  currentUser,
  onLogout,
}: DoctorDashboardProps) {
  // Tabs & Views
  const [activeSubTab, setActiveSubTab] = useState<"patients" | "prescriptions" | "archive">("patients");
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [doctorSelectedArchivePatient, setDoctorSelectedArchivePatient] = useState<Patient | null>(null);
  
  // Data lists
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [secretaries, setSecretaries] = useState<UserType[]>([]);
  const [selectedSec, setSelectedSec] = useState<UserType | null>(null);

  // Active chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Prescription modal / form
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatientForPres, setSelectedPatientForPres] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState("");
  const [xrays, setXrays] = useState("");
  const [tests, setTests] = useState("");
  const [other, setOther] = useState("");

  // AI Symptoms & Suggestion States
  const [symptomTags, setSymptomTags] = useState<string[]>([]);
  const [currentSymptomInput, setCurrentSymptomInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ medicines: string[]; xrays: string[]; tests: string[] }>({
    medicines: [],
    xrays: [],
    tests: []
  });

  // User Settings Menu
  const [showSettings, setShowSettings] = useState(false);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editPassword, setEditPassword] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePasscode, setDeletePasscode] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [settingsTab, setSettingsTab] = useState<"account" | "template">("account");
  const [prescriptionTemplate, setPrescriptionTemplate] = useState(() => {
    const defaultVal = {
      clinicName: `عيادة الدكتور ${currentUser.firstName} ${currentUser.lastName}`,
      doctorTitle: `تخصص طبي كشف ومعالجة | هاتف: ${currentUser.phone || "غير متوفر"}`,
      phone: currentUser.phone || "",
      address: "بغداد، العراق",
      logoSymbol: "stethoscope",
      logoUrl: "",
      fontFamily: "Cairo",
      fontSize: "sm",
      themeColor: "#3182CE",
      topMargin: 20,
      bottomMargin: 20,
      hideHeaderFooter: false,
      showDate: true,
      showAge: true,
      showHeightWeight: true,
      showBarcode: true,
      showSignatory: true,
      signatoryText: "توقيع وختم الطبيب المعتمد",
      customNotesBottom: "يرجى الإلتزام بمواعيد وطبيعة الجرعات المحددة في الروشتة والتواصل مع العيادة عند الطوارئ.",
      medicinesLabel: "💊 الأدوية الموصوفة والجرعات",
      xraysLabel: "🔮 الأشعة والسونار المطلوبة",
      testsLabel: "🧪 التحاليل المخبرية المطلوبة",
      instructionsLabel: "📝 ملاحظات وتوجيهات أخرى"
    };

    const dbTemplate = (currentUser as any).prescriptionTemplate;
    const saved = localStorage.getItem(`prescription_template_${currentUser.id}`);
    if (dbTemplate) {
      return { ...defaultVal, ...dbTemplate };
    } else if (saved) {
      try {
        return { ...defaultVal, ...JSON.parse(saved) };
      } catch (e) {
        return defaultVal;
      }
    }
    return defaultVal;
  });

  const [editTemplate, setEditTemplate] = useState(() => prescriptionTemplate);

  const handleSaveTemplate = async (temp: any) => {
    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          prescriptionTemplate: temp
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPrescriptionTemplate(temp);
        localStorage.setItem(`prescription_template_${currentUser.id}`, JSON.stringify(temp));
        setSettingsSuccess("تم حفظ وتطبيق قالب ورق الروشتة المخصص بنجاح! 💾✨");
      } else {
        setSettingsError(data.error || "فشل التحديث على الخادم.");
      }
    } catch (err) {
      setSettingsError("خطأ في الاتصال بالشبكة لحفظ القالب.");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        setSettingsError("حجم الصورة كبير جداً! يرجى اختيار لوجو أصغر من 800 كيلوبايت لضمان سرعة التحميل.");
        return;
      }
      setSettingsError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditTemplate({
          ...editTemplate,
          logoUrl: base64String,
          logoSymbol: "custom"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Financial parameters
  const [showFinancials, setShowFinancials] = useState(false);

  const getFinancialStats = () => {
    const now = new Date();
    
    // Start of today (00:00:00)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of this week (7 days ago)
    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    // Start of this month (30 days ago)
    const monthStart = new Date();
    monthStart.setDate(now.getDate() - 30);
    monthStart.setHours(0, 0, 0, 0);
    
    // Start of this year (365 days ago)
    const yearStart = new Date();
    yearStart.setDate(now.getDate() - 365);
    yearStart.setHours(0, 0, 0, 0);

    let dailyTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    
    let dailyCount = 0;
    let weeklyCount = 0;
    let monthlyCount = 0;
    let yearlyCount = 0;

    const dailyPatients: Patient[] = [];
    const allPatientsWithPayments: Patient[] = [];

    patients.forEach(pat => {
      const amount = pat.amountPaid || 0;
      if (!pat.datetime) return;
      
      const patDate = new Date(pat.datetime);
      if (amount > 0) {
        allPatientsWithPayments.push(pat);
      }
      
      // Daily check
      if (patDate >= todayStart) {
        dailyTotal += amount;
        dailyCount++;
        if (amount > 0) {
          dailyPatients.push(pat);
        }
      }
      
      // Weekly check (last 7 days)
      if (patDate >= weekStart) {
        weeklyTotal += amount;
        weeklyCount++;
      }
      
      // Monthly check (last 30 days)
      if (patDate >= monthStart) {
        monthlyTotal += amount;
        monthlyCount++;
      }
      
      // Yearly check (last 365 days)
      if (patDate >= yearStart) {
        yearlyTotal += amount;
        yearlyCount++;
      }
    });

    return {
      dailyTotal, dailyCount, dailyPatients,
      weeklyTotal, weeklyCount,
      monthlyTotal, monthlyCount,
      yearlyTotal, yearlyCount,
      allPatientsWithPayments
    };
  };

  // Get unique patient records historically for search / auto-completion
  const getUniquePatients = () => {
    const seen = new Set<string>();
    const uniqueList: Patient[] = [];
    // Loop backwards to get most recent values for height/weight/age/phone
    [...patients].reverse().forEach(p => {
      const key = p.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(p);
      }
    });
    return uniqueList;
  };

  // Server poll interval
  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        // Load incoming patients
        const patRes = await fetch(`/api/patients?doctorId=${currentUser.id}`);
        if (patRes.ok) {
          const patData = await patRes.json();
          setPatients(patData);
        }

        // Load written prescriptions
        const presRes = await fetch(`/api/prescriptions?doctorId=${currentUser.id}`);
        if (presRes.ok) {
          const presData = await presRes.json();
          setPrescriptions(presData);
        }

        // Load live system logs (to find secretaries registered for this doctor)
        const logRes = await fetch(`/api/sync-logs`);
        if (logRes.ok) {
          const syncData = await logRes.json();
          // Find secretaries linked to this doctor
          const linkedSecs = (syncData.users || []).filter(
            (u: UserType) => u.role === "secretary" && u.doctorId === currentUser.id
          );
          setSecretaries(linkedSecs);
          if (linkedSecs.length > 0 && !selectedSec) {
            setSelectedSec(linkedSecs[0]);
          }
        }
      } catch (err) {
        console.error("Failed to sync doctor dashboard space", err);
      }
    };

    loadDoctorData();
    const interval = setInterval(loadDoctorData, 3000); // Poll every 3 seconds for smooth clinic operations
    return () => clearInterval(interval);
  }, [currentUser.id, selectedSec]);

  // Load chat messages when selected secretary changes
  useEffect(() => {
    if (!selectedSec) return;

    const loadChat = async () => {
      try {
        const chatRes = await fetch(`/api/chat?userA=${currentUser.id}&userB=${selectedSec.id}`);
        if (chatRes.ok) {
          const data = await chatRes.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load doctor chat messages", err);
      }
    };

    loadChat();
    const chatInterval = setInterval(loadChat, 2000); // Chat polls faster for near-real-time feel
    return () => clearInterval(chatInterval);
  }, [selectedSec, currentUser.id]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedSec?.id]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedSec) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedSec.id,
          text: newMessageText.trim()
        })
      });

      if (response.ok) {
        setNewMessageText("");
        // Reload immediately
        const chatRes = await fetch(`/api/chat?userA=${currentUser.id}&userB=${selectedSec.id}`);
        if (chatRes.ok) {
          const data = await chatRes.json();
          setMessages(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Approval queue: ADMIT PATIENT
  const handleAdmitPatient = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "admitted" })
      });
      if (response.ok) {
        // Refresh local array
        setPatients(prev =>
          prev.map(p => p.id === patientId ? { ...p, status: "admitted" } : p)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Call / request secretary to enter a specific waiting patient
  const handleCallPatient = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending_approval" })
      });
      if (response.ok) {
        setPatients(prev =>
          prev.map(p => p.id === patientId ? { ...p, status: "pending_approval" } : p)
        );
      }
    } catch (err) {
      console.error("Failed to request patient entry:", err);
    }
  };

  // Open Prescription Writer
  const handleOpenPrescription = (patient: Patient) => {
    setSelectedPatientForPres(patient);
    
    // Find if we have an existing prescription for this specific patient visit
    const existing = [...prescriptions]
      .reverse()
      .find(p => p.patientId === patient.id);

    if (existing) {
      setMedicines(existing.medicines || "");
      setXrays(existing.xrays || "");
      setTests(existing.tests || "");
      setOther(existing.other || "");
    } else {
      setMedicines("");
      setXrays("");
      setTests("");
      setOther("");
    }
    setShowPrescriptionModal(true);
  };

  // Reset smart AI state on modal toggles
  useEffect(() => {
    if (showPrescriptionModal) {
      setSymptomTags([]);
      setCurrentSymptomInput("");
      setAiSuggestions({ medicines: [], xrays: [], tests: [] });
      setAiLoading(false);
    }
  }, [showPrescriptionModal]);

  const fetchSmartSuggestions = async (tags: string[]) => {
    if (tags.length === 0) {
      setAiSuggestions({ medicines: [], xrays: [], tests: [] });
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: tags })
      });
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions({
          medicines: data.medicines || [],
          xrays: data.xrays || [],
          tests: data.tests || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch smart clinical suggestions:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSymptomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = currentSymptomInput.trim();
      if (val && !symptomTags.includes(val)) {
        const updatedTags = [...symptomTags, val];
        setSymptomTags(updatedTags);
        setCurrentSymptomInput("");
        fetchSmartSuggestions(updatedTags);
      }
    }
  };

  const handleRemoveSymptomTag = (tagToRemove: string) => {
    const updatedTags = symptomTags.filter(t => t !== tagToRemove);
    setSymptomTags(updatedTags);
    fetchSmartSuggestions(updatedTags);
  };

  const handleAddSuggestedMedicine = (med: string) => {
    setMedicines(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return med;
      return `${trimmed}\n${med}`;
    });
  };

  const handleAddSuggestedXray = (xr: string) => {
    setXrays(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return xr;
      return `${trimmed}\n${xr}`;
    });
  };

  const handleAddSuggestedTest = (tst: string) => {
    setTests(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return tst;
      return `${trimmed}\n${tst}`;
    });
  };

  // Helper to print a specific section of prescription
  const handlePrintSection = (title: string, content: string) => {
    if (!content.trim()) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("الرجاء السماح للنوافذ المنبثقة لطباعة الروشتة");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة ${title}</title>
          <style>${getPrescriptionStyles(prescriptionTemplate)}</style>
        </head>
        <body>
          ${getLogoHeaderHTML(prescriptionTemplate)}
          ${getPatientBoxHTML(
            selectedPatientForPres?.name || "—",
            prescriptionTemplate,
            selectedPatientForPres?.age?.toString(),
            selectedPatientForPres?.height?.toString(),
            selectedPatientForPres?.weight?.toString()
          )}
          <div class="section-header">${title}</div>
          <div class="content">${content}</div>
          <div class="footer-sig" style="margin-top: 40px;">
            ${prescriptionTemplate.signatoryText}: ..........................
          </div>
          ${prescriptionTemplate.customNotesBottom ? `
            <div class="custom-bottom-notes">${prescriptionTemplate.customNotesBottom}</div>
          ` : ""}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper to print whole prescription
  const handlePrintFullPrescription = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("الرجاء السماح للنوافذ المنبثقة لطباعة الروشتة");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>راشيتة علاج كاملة</title>
          <style>${getPrescriptionStyles(prescriptionTemplate)}</style>
        </head>
        <body>
          ${getLogoHeaderHTML(prescriptionTemplate)}
          ${getPatientBoxHTML(
            selectedPatientForPres?.name || "—",
            prescriptionTemplate,
            selectedPatientForPres?.age?.toString(),
            selectedPatientForPres?.height?.toString(),
            selectedPatientForPres?.weight?.toString()
          )}
          
          <div class="prescription-grid">
            ${medicines.trim() ? `
              <div class="pres-section" style="border-right: 4px solid ${prescriptionTemplate.themeColor};">
                <div class="section-label medicines-label">${prescriptionTemplate.medicinesLabel || "💊 الأدوية والجرعات"}</div>
                <div class="section-body">${medicines}</div>
              </div>
            ` : ""}

            ${xrays.trim() ? `
              <div class="pres-section" style="border-right: 4px solid #D69E2E;">
                <div class="section-label xrays-label">${prescriptionTemplate.xraysLabel || "🔮 الأشعة والسونار"}</div>
                <div class="section-body">${xrays}</div>
              </div>
            ` : ""}

            ${tests.trim() ? `
              <div class="pres-section" style="border-right: 4px solid #38A169;">
                <div class="section-label tests-label">${prescriptionTemplate.testsLabel || "🧪 التحاليل المخبرية"}</div>
                <div class="section-body">${tests}</div>
              </div>
            ` : ""}

            ${other.trim() ? `
              <div class="pres-section" style="border-right: 4px solid #805AD5;">
                <div class="section-label instructions-label">${prescriptionTemplate.instructionsLabel || "📝 ملاحظات أخرى"}</div>
                <div class="section-body">${other}</div>
              </div>
            ` : ""}
          </div>

          <div class="footer-sig" style="margin-top: 40px;">
            ${prescriptionTemplate.signatoryText}: ..........................
          </div>
          ${prescriptionTemplate.customNotesBottom ? `
            <div class="custom-bottom-notes">${prescriptionTemplate.customNotesBottom}</div>
          ` : ""}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Historical Printing Helpers
  const handlePrintArchiveSection = (patientName: string, title: string, content: string) => {
    if (!content.trim()) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("الرجاء السماح للنوافذ المنبثقة لطباعة الروشتة");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة ${title}</title>
          <style>${getPrescriptionStyles(prescriptionTemplate)}</style>
        </head>
        <body>
          ${getLogoHeaderHTML(prescriptionTemplate)}
          ${getPatientBoxHTML(
            patientName,
            prescriptionTemplate
          )}
          <div class="section-header">${title}</div>
          <div class="content">${content}</div>
          <div class="footer-sig" style="margin-top: 40px;">
            ${prescriptionTemplate.signatoryText}: ..........................
          </div>
          ${prescriptionTemplate.customNotesBottom ? `
            <div class="custom-bottom-notes">${prescriptionTemplate.customNotesBottom}</div>
          ` : ""}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintArchiveFull = (pres: Prescription) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("الرجاء السماح للنوافذ المنبثقة لطباعة الروشتة");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>راشيتة علاج كاملة مؤرشفة</title>
          <style>${getPrescriptionStyles(prescriptionTemplate)}</style>
        </head>
        <body>
          ${getLogoHeaderHTML(prescriptionTemplate)}
          ${getPatientBoxHTML(
            pres.patientName || "—",
            prescriptionTemplate,
            undefined,
            undefined,
            undefined
          )}
          
          <div class="prescription-grid">
            ${pres.medicines.trim() ? `
              <div class="pres-section" style="border-right: 4px solid ${prescriptionTemplate.themeColor};">
                <div class="section-label medicines-label">${prescriptionTemplate.medicinesLabel || " الأدوية والجرعات"}</div>
                <div class="section-body">${pres.medicines}</div>
              </div>
            ` : ""}

            ${pres.xrays.trim() ? `
              <div class="pres-section" style="border-right: 4px solid #D69E2E;">
                <div class="section-label xrays-label">${prescriptionTemplate.xraysLabel || " الأشعة والسونار"}</div>
                <div class="section-body">${pres.xrays}</div>
              </div>
            ` : ""}

            ${pres.tests.trim() ? `
              <div class="pres-section" style="border-right: 4px solid #38A169;">
                <div class="section-label tests-label">${prescriptionTemplate.testsLabel || " التحاليل المخبرية"}</div>
                <div class="section-body">${pres.tests}</div>
              </div>
            ` : ""}

            ${pres.other && pres.other.trim() ? `
              <div class="pres-section" style="border-right: 4px solid #805AD5;">
                <div class="section-label instructions-label">${prescriptionTemplate.instructionsLabel || " ملاحظات وتوجيهات أخرى"}</div>
                <div class="section-body">${pres.other}</div>
              </div>
            ` : ""}
          </div>

          <div class="footer-sig" style="margin-top: 40px;">
            ${prescriptionTemplate.signatoryText}: ..........................
          </div>
          ${prescriptionTemplate.customNotesBottom ? `
            <div class="custom-bottom-notes">${prescriptionTemplate.customNotesBottom}</div>
          ` : ""}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Submit Prescription (ورقة راشيتة المريض)
  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForPres) return;

    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientForPres.id,
          patientName: selectedPatientForPres.name,
          doctorId: currentUser.id,
          medicines,
          xrays,
          tests,
          other
        })
      });

      if (response.ok) {
        setShowPrescriptionModal(false);
        // Refresh
        const presRes = await fetch(`/api/prescriptions?doctorId=${currentUser.id}`);
        if (presRes.ok) {
          const presData = await presRes.json();
          setPrescriptions(presData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    if (editUsername.includes(" ")) {
      setSettingsError("اسم المستخدم يجب أن يكون بدون فراغات مسموحة");
      return;
    }

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          username: editUsername,
          email: editEmail,
          password: editPassword || undefined
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSettingsSuccess("تم تحديث معلومات الحساب بنجاح!");
        setEditPassword("");
      } else {
        setSettingsError(data.error || "فشل التحديث.");
      }
    } catch (err) {
      setSettingsError("خطأ في الاتصال بالشبكة.");
    }
  };

  // Delete User Account
  const handleDeleteAccount = async () => {
    if (deletePasscode !== "Pgjmwpgjmw93*94#") {
      setDeleteError("الرمز السري الخاص بالمبرمج غير صحيح! لا يمكن إتمام عملية مسح الحساب. ❌");
      return;
    }
    setDeleteError("");
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, passcode: deletePasscode })
      });
      if (response.ok) {
        onLogout();
      }
    } catch (err) {
      console.error(err);
      setDeleteError("خطأ في الاتصال بالشبكة.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-[#1A202C]">
      {/* Top Header Section */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10 px-6 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EBF8FF] rounded-xl text-[#3182CE]">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1A202C] flex items-center gap-2">
              د. {currentUser.firstName} {currentUser.lastName}
              <span className="text-[10px] bg-[#E2E8F0] text-[#1A365D] px-2 py-0.5 rounded-full font-bold">
                بوابة الطبيب الأخصائي
              </span>
            </h1>
            <p className="text-xs text-[#718096]">نظام إدارة العمارة - العيادة الطبية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFinancials(true)}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-250 transition-colors flex items-center gap-1 font-bold text-xs shrink-0 cursor-pointer"
            title="التقرير المالي والإيرادات"
          >
            <Coins className="w-4 h-4 text-emerald-600 animate-none" />
            <span className="hidden md:inline">التقرير المالي 📊</span>
          </button>
          <button
            onClick={() => {
              setShowSettings(true);
              setSettingsTab("account");
              setEditTemplate({ ...prescriptionTemplate });
              setSettingsError("");
              setSettingsSuccess("");
            }}
            className="p-2 bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#2D3748] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
            title="إعدادات الحساب"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 bg-[#EDF2F7] hover:bg-[#FED7D7] hover:text-[#E53E3E] text-[#E53E3E] rounded-lg border border-[#FED7D7] transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Right Panel / Desktop Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Tabs switch */}
          <div className="bg-white p-1 rounded-xl border border-[#E2E8F0] flex gap-2 w-fit shrink-0 shadow-xs">
            <button
              onClick={() => setActiveSubTab("patients")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === "patients"
                  ? "bg-[#3182CE] text-white shadow-xs"
                  : "text-[#536471] hover:bg-[#EDF2F7] text-[#2D3748]"
              }`}
            >
              طابور المرضى والمراجعات ({patients.filter(p => p.status !== "completed").length})
            </button>
            <button
              onClick={() => setActiveSubTab("prescriptions")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === "prescriptions"
                  ? "bg-[#3182CE] text-white shadow-xs"
                  : "text-[#536471] hover:bg-[#EDF2F7] text-[#2D3748]"
              }`}
            >
              أرشيف الروشتات الصادرة ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveSubTab("archive")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === "archive"
                  ? "bg-[#3182CE] text-white shadow-xs"
                  : "text-[#536471] hover:bg-[#EDF2F7] text-[#2D3748]"
              }`}
            >
              سجل وبحث المرضى العام 🔍 ({getUniquePatients().length})
            </button>
          </div>

          {/* Tab 1: Patients Queue */}
          {activeSubTab === "patients" && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs flex-1 flex flex-col">
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-slate-50/50">
                <h3 className="font-bold text-[#1A202C] text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4.5 h-4.5 text-[#3182CE]" />
                  قائمة مرضى المراجعات اليومية بالعيادة
                </h3>
                <span className="text-[10px] text-[#718096]">
                  يتم إدخال المرضى من خلال السكرتير
                </span>
              </div>

              {/* Patient List container */}
              <div className="divide-y divide-[#E2E8F0] overflow-auto flex-1 custom-scrollbar">
                {patients.length === 0 ? (
                  <div className="p-12 text-center text-[#718096] space-y-2">
                    <User className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold">لا يوجد مرضى في الطابور حالياً</p>
                    <p className="text-xs text-slate-400">عندما يقوم السكرتير بإدخال مريض جديد، سيظهر لك هنا مباشرة.</p>
                  </div>
                ) : (
                  patients.map((pat) => (
                    <div key={pat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenPrescription(pat)}
                            className="font-bold text-[#3182CE] hover:text-[#2B6CB0] text-sm hover:underline text-right cursor-pointer"
                            title="اضغط لعرض أو تعديل الروشتة الطبية للمريض"
                          >
                            {pat.name}
                          </button>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              pat.status === "waiting"
                                ? "bg-[#EDF2F7] text-[#2D3748]"
                                : pat.status === "pending_approval"
                                ? "bg-red-100 text-[#C53030] animate-pulse"
                                : pat.status === "admitted"
                                ? "bg-[#C6F6D5] text-[#22543D]"
                                : "bg-[#EBF8FF] text-[#2B6CB0]"
                            }`}
                          >
                            {pat.status === "waiting" && "في الانتظار"}
                            {pat.status === "pending_approval" && "مطلوب الإدخال / بانتظار الدخول"}
                            {pat.status === "admitted" && "داخل العيادة حالياً"}
                            {pat.status === "completed" && "تم الكشف وكتابة الوصفة"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#718096]">
                          <span>الهاتف: <span className="font-mono">{pat.phone || "غير متوفر"}</span></span>
                          {pat.datetime && (
                            <span>الموعد: <span className="font-mono">{new Date(pat.datetime).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" })}</span></span>
                          )}
                        </div>
                        {(pat.age || pat.height || pat.weight || (pat.amountPaid !== undefined)) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {pat.age && (
                              <span className="bg-blue-50/75 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100/30">
                                العمر: {pat.age}
                              </span>
                            )}
                            {pat.height && (
                              <span className="bg-purple-50/75 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-100/30">
                                الطول: {pat.height} سم
                              </span>
                            )}
                            {pat.weight && (
                              <span className="bg-amber-50/75 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-100/30">
                                الوزن: {pat.weight} كجم
                              </span>
                            )}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              pat.isReview
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : pat.amountPaid && pat.amountPaid > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-650 border-red-200"
                            }`}>
                              {pat.isReview ? "الزيارة: مراجعة مجانية 🔄" : `المدفوع: ${pat.amountPaid || 0} د.ع / $`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {pat.status === "waiting" && (
                          <button
                            onClick={() => handleCallPatient(pat.id)}
                            className="px-3 py-1.5 bg-[#DD6B20] hover:bg-[#C05621] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            طلب خطوة إدخال المريض
                          </button>
                        )}

                        {pat.status === "pending_approval" && (
                          <button
                            onClick={() => handleAdmitPatient(pat.id)}
                            className="px-3 py-1.5 bg-[#38A169] hover:bg-[#2F855A] text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            موافقة على الدخول
                          </button>
                        )}

                        {(pat.status === "admitted" || pat.status === "pending_approval" || pat.status === "waiting") && (
                          <button
                            onClick={() => handleOpenPrescription(pat)}
                            className="px-3 py-1.5 bg-[#3182CE] hover:bg-[#2B6CB0] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            كتابة راشيتة / علاج
                          </button>
                        )}

                        {pat.status === "completed" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenPrescription(pat)}
                              className="px-2.5 py-1.5 bg-[#4A5568] hover:bg-[#2D3748] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-[#4A5568]"
                              title="اضغط لعرض أو تعديل الروشتة الطبية وإعادة طباعتها"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>مراجعة/تعديل الراشيتة 📝</span>
                            </button>
                            <span className="text-xs text-[#22543D] font-bold flex items-center gap-0.5 bg-[#C6F6D5] px-2.5 py-1 rounded-md">
                              <Check className="w-3.5 h-3.5" /> تم المعاينة
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Written Prescriptions Archive */}
          {activeSubTab === "prescriptions" && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs flex-1 flex flex-col">
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-[#F7FAFC]">
                <h3 className="font-bold text-[#1A202C] text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4.5 h-4.5 text-[#3182CE]" />
                  أرشيف الوصفات والروشتات الطبية المسجلة
                </h3>
              </div>

              {/* Prescription container */}
              <div className="divide-y divide-[#E2E8F0] overflow-auto flex-1 custom-scrollbar">
                {prescriptions.length === 0 ? (
                  <div className="p-12 text-center text-[#718096] space-y-1">
                    <p className="font-semibold text-sm">لا توجد وصفات طبية مؤرشفة بالرقم اليومي</p>
                    <p className="text-xs text-[#718096]">كل راشيتة علاج تصرفها للمريض تتم أرشفتها وحفظها هنا تلقائياً.</p>
                  </div>
                ) : (
                  prescriptions.map((pres) => (
                    <div key={pres.id} className="p-5 hover:bg-slate-50 transition space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-100 font-sans">
                        <div>
                          <h4 className="font-bold text-[#1A202C] text-sm">المريض: {pres.patientName}</h4>
                          <span className="text-[10px] text-[#718096] block mt-0.5">
                            تاريخ ووقت الوصفة: <span className="font-mono">{new Date(pres.createdAt).toLocaleString("ar-EG")}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePrintArchiveFull(pres)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#38A169] hover:bg-[#2F855A] text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            طباعة الروشتة كاملة 🖨️
                          </button>
                          <span className="text-[10px] bg-[#EDF2F7] text-[#2D3748] px-2 py-1 rounded border border-[#E2E8F0] font-mono">
                            ID: {pres.id}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs bg-slate-50 p-4 rounded-xl border border-[#E2E8F0]">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-150/60 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-blue-700 block mb-1">💊 الأدوية والجرعات:</span>
                            <p className="text-[#4A5568] text-[11px] whitespace-pre-wrap min-h-[40px]">{pres.medicines || "—"}</p>
                          </div>
                          {pres.medicines && (
                            <button
                              type="button"
                              onClick={() => handlePrintArchiveSection(pres.patientName, "💊 الأدوية الموصوفة والجرعات", pres.medicines)}
                              className="mt-2.5 flex items-center justify-center gap-1 w-full text-[9px] bg-slate-50 hover:bg-blue-50 text-blue-700 font-bold py-1 rounded border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Printer className="w-2.5 h-2.5" /> طباعة الأدوية
                            </button>
                          )}
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-150/60 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-amber-700 block mb-1">🔮 الأشعة المطلوبة:</span>
                            <p className="text-[#4A5568] text-[11px] whitespace-pre-wrap min-h-[40px]">{pres.xrays || "—"}</p>
                          </div>
                          {pres.xrays && (
                            <button
                              type="button"
                              onClick={() => handlePrintArchiveSection(pres.patientName, "🔮 الفحوصات والأشعة المطلوبة", pres.xrays)}
                              className="mt-2.5 flex items-center justify-center gap-1 w-full text-[9px] bg-slate-50 hover:bg-amber-50 text-amber-750 font-bold py-1 rounded border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Printer className="w-2.5 h-2.5" /> طباعة الأشعة
                            </button>
                          )}
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-150/60 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-green-700 block mb-1">🧪 التحاليل المخبرية:</span>
                            <p className="text-[#4A5568] text-[11px] whitespace-pre-wrap min-h-[40px]">{pres.tests || "—"}</p>
                          </div>
                          {pres.tests && (
                            <button
                              type="button"
                              onClick={() => handlePrintArchiveSection(pres.patientName, "🧪 التحاليل المخبرية المطلوبة", pres.tests)}
                              className="mt-2.5 flex items-center justify-center gap-1 w-full text-[9px] bg-slate-50 hover:bg-green-50 text-green-700 font-bold py-1 rounded border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Printer className="w-2.5 h-2.5" /> طباعة التحاليل
                            </button>
                          )}
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-150/60 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-purple-700 block mb-1">📝 ملاحظات / أخرى:</span>
                            <p className="text-[#4A5568] text-[11px] whitespace-pre-wrap min-h-[40px]">{pres.other || "—"}</p>
                          </div>
                          {pres.other && (
                            <button
                              type="button"
                              onClick={() => handlePrintArchiveSection(pres.patientName, "📝 ملاحظات وتوجيهات أخرى", pres.other)}
                              className="mt-2.5 flex items-center justify-center gap-1 w-full text-[9px] bg-slate-50 hover:bg-purple-50 text-purple-705 font-bold py-1 rounded border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Printer className="w-2.5 h-2.5" /> طباعة أخرى
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Detailed Patient Search & Longitudinal Medical Archive */}
          {activeSubTab === "archive" && (() => {
            const normalizedQuery = doctorSearchQuery.trim().toLowerCase();
            const filteredUniquePatients = getUniquePatients().filter(pat => {
              const matchesName = pat.name.toLowerCase().includes(normalizedQuery);
              const matchesPhone = pat.phone && pat.phone.toLowerCase().includes(normalizedQuery);
              return matchesName || matchesPhone;
            });

            return (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs flex-1 flex flex-col min-h-[500px]">
                <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-[#1A202C] text-sm flex items-center gap-1.5 text-right">
                      <Search className="w-4.5 h-4.5 text-[#3182CE]" />
                      سجل وبحث المرضى العام ومراجعة السوابق 🔍
                    </h3>
                    <p className="text-[10px] text-[#718096] mt-0.5 text-right font-semibold">ابحث باسم المريض أو هاتفه لمشاهدة جميع الزيارات، المدفوعات، والروشتات والتعليمات الطبية السابقة فورا</p>
                  </div>
                  <div className="relative max-w-xs w-full">
                    <input
                      type="text"
                      value={doctorSearchQuery}
                      onChange={(e) => {
                        setDoctorSearchQuery(e.target.value);
                        setDoctorSelectedArchivePatient(null);
                      }}
                      placeholder="ابحث باسم المريض أو رقم الهاتف..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-bold text-slate-800 text-right"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#E2E8F0] min-h-0 overflow-hidden">
                  {/* Matching patients matching filter (4 columns) */}
                  <div className="md:col-span-4 flex flex-col p-4 space-y-3 overflow-y-auto max-h-[250px] md:max-h-none min-h-0 custom-scrollbar bg-slate-50/20">
                    <span className="text-[10px] font-extrabold text-[#718096] uppercase tracking-wider text-right">نتائج البحث ومرضى العيادة:</span>
                    {filteredUniquePatients.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                        {doctorSearchQuery ? "لم يتم العثور على نتائج تطابق البحث" : "لا يوجد سجل مرضى مؤرشف بعد بالعيادة"}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {filteredUniquePatients.map(pat => {
                          const isSelected = doctorSelectedArchivePatient?.name.trim().toLowerCase() === pat.name.trim().toLowerCase();
                          return (
                            <button
                              key={pat.id}
                              type="button"
                              onClick={() => setDoctorSelectedArchivePatient(pat)}
                              className={`w-full text-right p-3 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
                                isSelected 
                                  ? "bg-[#EBF8FF] text-[#2B6CB0] border-[#3182CE]" 
                                  : "bg-white text-slate-700 border-slate-150 hover:bg-slate-50"
                              }`}
                            >
                              <div className="space-y-0.5 text-right w-full">
                                <div className="font-bold text-slate-905">{pat.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {pat.phone ? `📞 ${pat.phone}` : "بدون رقم هاتف"}
                                </div>
                              </div>
                              <ChevronLeft className="w-4 h-4 text-slate-400 font-mono" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected patient information & activities timeline (8 columns) */}
                  <div className="md:col-span-8 p-5 flex flex-col space-y-5 overflow-y-auto max-h-[450px] md:max-h-none min-h-0 custom-scrollbar bg-slate-50/60 font-sans">
                    {!doctorSelectedArchivePatient ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-[#718096] space-y-3">
                        <Database className="w-12 h-12 text-blue-200" />
                        <h4 className="font-bold text-sm text-slate-700">الرجاء اختيار اسم المريض من القائمة اليمنى</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed text-center">سيتم جلب كافة البيانات التاريخية المسجلة، سجل المراجعات الحالية، المبالغ المودعة، والوصفات / الراشيتات الطبية السابقة الصادرة له لتتبع حالته عبر الزمن.</p>
                      </div>
                    ) : (() => {
                      const pName = doctorSelectedArchivePatient.name.trim().toLowerCase();
                      const historicalVisits = patients.filter(p => p.name.trim().toLowerCase() === pName);
                      const pPrescriptions = prescriptions.filter(pr => pr.patientName.trim().toLowerCase() === pName);
                      
                      return (
                        <div className="space-y-5 text-right w-full">
                          {/* File header card */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-extrabold text-[#1A202C] text-sm flex items-center gap-1.5 justify-start">
                                <span className="bg-[#EBF8FF] text-[#2B6CB0] p-1 px-2 rounded-lg text-xs font-black">ملف المريض</span>
                                {doctorSelectedArchivePatient.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2 justify-start font-sans">
                                {doctorSelectedArchivePatient.phone && (
                                  <span className="bg-slate-50 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded border border-slate-200 font-mono">
                                    📞 {doctorSelectedArchivePatient.phone}
                                  </span>
                                )}
                                {doctorSelectedArchivePatient.age && (
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded border border-blue-105">
                                    العمر: {doctorSelectedArchivePatient.age} سنة
                                  </span>
                                )}
                                {doctorSelectedArchivePatient.height && (
                                  <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded border border-purple-105">
                                    الطول: {doctorSelectedArchivePatient.height} سم
                                  </span>
                                )}
                                {doctorSelectedArchivePatient.weight && (
                                  <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-105">
                                    الوزن: {doctorSelectedArchivePatient.weight} كجم
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleOpenPrescription(doctorSelectedArchivePatient)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer max-w-fit"
                            >
                              <Stethoscope className="w-4 h-4 shadow-sm" />
                              <span>كتابة / تعديل المعاينة الفورية 🩺</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Visits Card */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3">
                              <h5 className="font-extrabold text-xs text-slate-800 border-b border-rose-50 pb-2 flex items-center gap-1.5 justify-start">
                                <Clock className="w-4 h-4 text-slate-400" />
                                سجل زيارات العيادة والمدفوعات ({historicalVisits.length})
                              </h5>
                              <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                                {historicalVisits.map((v, idx) => (
                                  <div key={v.id} className="p-3 rounded-lg border border-slate-150 bg-slate-50/50 space-y-1.5 text-right">
                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                      <span className="text-[#3182CE] font-bold">زيارة رقم #{historicalVisits.length - idx}</span>
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                        v.isReview ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-800"
                                      }`}>
                                        {v.isReview ? "مراجعة مجانية" : "كشفية جديدة"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                                      <div>📅 التاريخ: {v.datetime ? new Date(v.datetime).toLocaleDateString("ar-EG") : "غير محدد"}</div>
                                    </div>
                                    <div className="text-[10px] text-slate-600 font-sans">
                                      الحالة: <span className="font-bold underline">{
                                        v.status === "completed" ? "✅ تم المعاينة" : 
                                        v.status === "admitted" ? "🩺 داخل غرفة الطبيب" : "⏳ في قائمة الانتظار"
                                      }</span>
                                    </div>
                                    {!v.isReview && (
                                      <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold inline-block font-mono">
                                        قيمة الكشفية: {v.amountPaid || 0} د.ع / $
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Prescriptions timeline list */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3">
                              <h5 className="font-extrabold text-xs text-slate-800 border-b border-sky-50 pb-2 flex items-center gap-1.5 justify-start">
                                <BookOpen className="w-4 h-4 text-sky-500" />
                                الوصفات الطبية الصادرة ({pPrescriptions.length})
                              </h5>
                              <div className="space-y-2.5 max-h-[320px] overflow-y-auto custom-scrollbar">
                                {pPrescriptions.length === 0 ? (
                                  <div className="p-8 text-center text-slate-400 text-[10px] font-semibold border border-dashed border-slate-200 rounded-lg">
                                    لا توجد وصفات أو راشيتات مسبقة مؤرشفة لهذا المريض.
                                  </div>
                                ) : (
                                  pPrescriptions.map(pres => (
                                    <div key={pres.id} className="p-3 rounded-lg border border-sky-105 bg-sky-50/10 space-y-2 hover:border-sky-305 transition-all text-right">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-extrabold font-mono">
                                          📅 التاريخ: {new Date(pres.createdAt).toLocaleDateString("ar-EG")}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setMedicines(pres.medicines || "");
                                            setXrays(pres.xrays || "");
                                            setTests(pres.tests || "");
                                            setOther(pres.other || "");
                                            setSelectedPatientForPres(doctorSelectedArchivePatient);
                                            setShowPrescriptionModal(true);
                                          }}
                                          className="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-200 rounded text-[9px] font-extrabold transition cursor-pointer"
                                        >
                                          تعديل / إعادة طباعة 📝
                                        </button>
                                      </div>
                                      
                                      <div className="text-[11px] space-y-1 text-slate-600 font-sans">
                                        {pres.medicines && (
                                          <div>
                                            <strong className="text-slate-850 block text-[10px]">💊 الأدوية الموصوفة:</strong>
                                            <p className="text-[10px] bg-white p-1 rounded border border-slate-100 font-mono whitespace-pre-wrap">{pres.medicines}</p>
                                          </div>
                                        )}
                                        {pres.tests && (
                                          <div className="flex gap-1 justify-start">
                                            <strong className="text-slate-800">🧪 التحاليل:</strong>
                                            <span className="text-green-700 font-medium">{pres.tests}</span>
                                          </div>
                                        )}
                                        {pres.xrays && (
                                          <div className="flex gap-1 justify-start">
                                            <strong className="text-slate-800">🔮 الأشعة:</strong>
                                            <span className="text-amber-700 font-medium">{pres.xrays}</span>
                                          </div>
                                        )}
                                        {pres.other && (
                                          <div className="text-slate-500 leading-relaxed text-[10px]">
                                            <strong className="text-slate-800">📝 توصيات أخرى:</strong> {pres.other}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Left Panel: Chat Panel with the associated Secretary Only (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden h-[600px] lg:h-auto">
          {/* Top of chat */}
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] text-[#3182CE] font-bold uppercase tracking-wider block">قناة تواصل عيادية خاصة</span>
              <h3 className="font-semibold text-[#1A202C] text-sm flex items-center gap-1.5 mt-0.5">
                <MessageSquare className="w-4 h-4 text-[#3182CE]" />
                الدردشة الحية مع السكرتيرة
              </h3>
            </div>
          </div>

          {/* Secretary Selection (Only shows linked secretaries) */}
          <div className="px-4 py-2 bg-[#EBF8FF]/30 border-b border-[#E2E8F0] text-xs shrink-0 flex items-center justify-between">
            <span className="text-slate-600 font-medium">السكرتير الحالي:</span>
            {secretaries.length === 0 ? (
              <span className="text-rose-500 font-bold">لا يوجد سكرتير مرتبط بك حالياً</span>
            ) : (
              <select
                value={selectedSec?.id || ""}
                onChange={(e) => {
                  const s = secretaries.find(u => u.id === e.target.value);
                  if (s) setSelectedSec(s);
                }}
                className="bg-white border border-[#E2E8F0] rounded px-1.5 py-0.5 font-semibold text-[#1A365D] focus:outline-none"
              >
                {secretaries.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.firstName} {sec.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Chat Messages flow */}
          <div className="flex-1 overflow-auto p-4 space-y-3.5 custom-scrollbar min-h-0 bg-slate-50/30">
            {secretaries.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-1.5">
                <p className="text-xs">لم يقم أي سكرتير بربط حسابه باسمك حتى الآن.</p>
                <p className="text-[10px] text-slate-400 px-3">
                  توجيه: عند تسجيل السكرتير الجديد لحسابه، يرجى منه اختيار خانة اسمك "د. {currentUser.firstName}" وإرسال رمز المزامنة ليتفعل الرابط التلقائي فورا.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                ابدأ التحدث والتنسيق مع سكرتير العيادة لتنظيم دخول المراجعين.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isMe ? "mr-auto text-left" : "ml-auto text-right"}`}
                  >
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        isMe
                          ? "bg-[#EBF8FF] text-[#2C5282] border border-[#BEE3F8] rounded-tl-none font-medium"
                          : "bg-white text-[#2D3748] border border-[#E2E8F0] rounded-tr-none font-medium text-right shadow-xs"
                      }`}
                      style={{ direction: isMe ? "ltr" : "rtl" }}
                    >
                      <span className="block w-full">{msg.text}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input text send messaging bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E2E8F0] flex gap-2 bg-white shrink-0">
            <input
              type="text"
              placeholder={selectedSec ? `اكتب رسالة للسكرتيرة...` : `انتظار ربط السكرتيرة بالعيادة`}
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              disabled={!selectedSec}
              className="w-full bg-[#F7FAFC] text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#3182CE] font-medium"
            />
            <button
              type="submit"
              disabled={!newMessageText.trim() || !selectedSec}
              className="p-2.5 bg-[#3182CE] hover:bg-[#2B6CB0] text-white rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4 shrink-0 transform rotate-180" />
            </button>
          </form>
        </div>
      </div>

      {/* MODAL WRITER FOR PRESCRIPTIONS */}
      {showPrescriptionModal && selectedPatientForPres && (() => {
        const pNameNormalized = selectedPatientForPres.name.trim().toLowerCase();
        
        // Find previous prescriptions written for this patient
        const prevPresCount = prescriptions.filter(p => p.patientName.trim().toLowerCase() === pNameNormalized);
        
        // Find historical visits for this patient to display a timeline
        const patientTimelineVisits = patients.filter(p => p.name.trim().toLowerCase() === pNameNormalized);

        // Does this patient have any past medical history at this clinic?
        const patientHasHistory = prevPresCount.length > 0 || patientTimelineVisits.length > 1;

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`bg-white rounded-xl w-full overflow-hidden shadow-2xl border border-[#E2E8F0] animate-slide-up flex flex-col ${
              patientHasHistory ? "max-w-7xl" : "max-w-5xl"
            }`}>
              {/* Modal Banner Header */}
              <div className="bg-[#1A365D] text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-300 animate-pulse" />
                  <h3 className="font-bold text-sm">معاينة الطبيب وتحضير الروشتة 🩺</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs bg-sky-900 border border-sky-700 px-3 py-1 rounded-full text-sky-200 font-extrabold font-sans">
                    المريض: {selectedPatientForPres.name}
                  </span>
                  {selectedPatientForPres.isReview && (
                    <span className="text-[10px] bg-purple-700/80 border border-purple-500 text-purple-100 font-bold px-2 py-0.5 rounded-full">
                      مراجعة مجانية 🔄
                    </span>
                  )}
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-200 min-h-0 overflow-y-auto">
                {/* Right Column: Smart AI Clinical Side Panel (Takes 4 or 5 Cols) */}
                <div className={`p-5 flex flex-col space-y-4 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-50/70 text-right shrink-0 border-l border-slate-200/95 ${
                  patientHasHistory ? "lg:col-span-4 md:col-span-5" : "lg:col-span-5 md:col-span-12"
                }`}>
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h4 className="font-extrabold text-[#1A365D] text-xs flex items-center gap-1.5 justify-start">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      المساعد الذكي والتحليل السريري 🧠⚡
                    </h4>
                    <span className="text-[9px] bg-sky-100 text-sky-850 font-extrabold px-1.5 py-0.5 rounded">تحليل فوري</span>
                  </div>

                  {/* Symptom Tag input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold block text-slate-705">أعراض وعلامات المراجع الحالية:</label>
                    <input
                      type="text"
                      value={currentSymptomInput}
                      onChange={(e) => setCurrentSymptomInput(e.target.value)}
                      onKeyDown={handleAddSymptomTag}
                      placeholder=""
                      className="w-full px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-bold text-slate-800 text-right"
                    />
                    <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-white rounded-lg border border-slate-200/80 items-center justify-start">
                      {symptomTags.length === 0 ? (
                        <span className="text-[10px] text-slate-400 font-medium">قائمة العلامات المسجلة فارغة حالياً</span>
                      ) : (
                        symptomTags.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-sky-50 text-sky-900 border border-sky-200 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold flex items-center justify-start gap-1 transition-all"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSymptomTag(tag)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold leading-none cursor-pointer p-0.5"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Dynamic AI Status / Loader */}
                  {aiLoading && (
                    <div className="flex items-center gap-2 justify-start bg-sky-50/50 border border-sky-100/30 p-2 rounded-lg text-[10px] text-sky-800 animate-pulse font-bold">
                      <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري التحليل السريري بالذكاء الاصطناعي... ⏳</span>
                    </div>
                  )}

                  {/* Suggestions Results */}
                  <div className="space-y-3.5 pt-1">
                    {symptomTags.length === 0 ? (
                      <div className="p-4 border border-dashed border-slate-200 bg-white text-center text-[10px] font-bold rounded-lg text-slate-400 leading-relaxed">
                        أدخل أعراض المراجع الحالية أعلاه لكي يقترح المساعد الذكي الأدوية والتحاليل الفورية المناسبين.
                      </div>
                    ) : (
                      <>
                        {/* Suggested Medicines */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-[#2C5282] font-black block">💊 أدوية وعلاجات مقترحة (انقر للإضافة):</span>
                          {aiSuggestions.medicines && aiSuggestions.medicines.length > 0 ? (
                            <div className="flex flex-col gap-1 text-right">
                              {aiSuggestions.medicines.map((med, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleAddSuggestedMedicine(med)}
                                  className="bg-white hover:bg-[#3182CE] hover:text-white text-slate-700 text-[10px] font-bold p-1.5 rounded border border-slate-200/80 text-right transition duration-150 cursor-pointer flex items-center justify-start gap-1 leading-normal shadow-3xs"
                                >
                                  <Plus className="w-3 h-3 text-[#3182CE] shrink-0" />
                                  <span className="flex-1 text-right">{med}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9.5px] text-slate-400 font-medium block">لا توجد اقتراحات حالية.</span>
                          )}
                        </div>

                        {/* Suggested X-rays */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-[#7B341E] font-black block">🔮 صور وأشعة وسونار مقترحة (انقر للإضافة):</span>
                          {aiSuggestions.xrays && aiSuggestions.xrays.length > 0 ? (
                            <div className="flex flex-col gap-1 text-right">
                              {aiSuggestions.xrays.map((xr, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleAddSuggestedXray(xr)}
                                  className="bg-white hover:bg-amber-600 hover:text-white text-slate-700 text-[10px] font-bold p-1.5 rounded border border-slate-200/80 text-right transition duration-150 cursor-pointer flex items-center justify-start gap-1 leading-normal shadow-3xs"
                                >
                                  <Plus className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="flex-1 text-right">{xr}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9.5px] text-slate-400 font-medium block">لا توجد اقتراحات حالية.</span>
                          )}
                        </div>

                        {/* Suggested Tests */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-[#2F855A] font-black block">🧪 تحاليل مخبرية مقترحة (انقر للإضافة):</span>
                          {aiSuggestions.tests && aiSuggestions.tests.length > 0 ? (
                            <div className="flex flex-col gap-1 text-right">
                              {aiSuggestions.tests.map((t, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleAddSuggestedTest(t)}
                                  className="bg-white hover:bg-emerald-600 hover:text-white text-slate-700 text-[10px] font-bold p-1.5 rounded border border-slate-200/80 text-right transition duration-150 cursor-pointer flex items-center justify-start gap-1 leading-normal shadow-3xs"
                                >
                                  <Plus className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span className="flex-1 text-right">{t}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9.5px] text-slate-400 font-medium block">لا توجد اقتراحات حالية.</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Middle Column: Active writing form (Takes 5 Cols when history is present, or 7 Cols if not) */}
                <form 
                  onSubmit={handleSubmitPrescription} 
                  className={`p-6 space-y-4 custom-scrollbar overflow-y-auto max-h-[500px] md:max-h-[600px] text-right ${
                    patientHasHistory ? "lg:col-span-5 md:col-span-12" : "lg:col-span-7 md:col-span-12"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700 block"> الأدوية والجرعات:</label>
                      <button
                        type="button"
                        onClick={() => handlePrintSection("الأدوية والجرعات", medicines)}
                        disabled={!medicines.trim()}
                        className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded border border-blue-200 cursor-pointer disabled:opacity-50 transition-colors"
                        title="طباعة الأدوية والجرعات"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      value={medicines}
                      onChange={(e) => setMedicines(e.target.value)}
                      placeholder=""
                      rows={4}
                      className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono text-right"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 block"> الأشعة والسونار:</label>
                        <button
                          type="button"
                          onClick={() => handlePrintSection("الأشعة والسونار", xrays)}
                          disabled={!xrays.trim()}
                          className="flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 p-1.5 rounded border border-amber-200 cursor-pointer disabled:opacity-50 transition-colors"
                          title="طباعة الأشعة والسونار"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={xrays}
                        onChange={(e) => setXrays(e.target.value)}
                        placeholder=""
                        rows={2}
                        className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 block"> التحاليل الطبية:</label>
                        <button
                          type="button"
                          onClick={() => handlePrintSection("التحاليل الطبية", tests)}
                          disabled={!tests.trim()}
                          className="flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 p-1.5 rounded border border-green-200 cursor-pointer disabled:opacity-50 transition-colors"
                          title="طباعة التحاليل"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={tests}
                        onChange={(e) => setTests(e.target.value)}
                        placeholder=""
                        rows={2}
                        className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700 block"> التوجيهات والتعليمات:</label>
                      <button
                        type="button"
                        onClick={() => handlePrintSection("التوجيهات والتعليمات", other)}
                        disabled={!other.trim()}
                        className="flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 p-1.5 rounded border border-purple-200 cursor-pointer disabled:opacity-50 transition-colors"
                        title="طباعة التوجيهات"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      value={other}
                      onChange={(e) => setOther(e.target.value)}
                      placeholder=""
                      rows={2}
                      className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] text-right"
                    />
                  </div>

                  {/* Active user metadata parameters inside the writing space */}
                  {(selectedPatientForPres.age || selectedPatientForPres.height || selectedPatientForPres.weight) && (
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between flex-wrap gap-2 text-xs text-[#2B6CB0] font-sans">
                      <span className="font-bold">المؤشرات الحيوية المسجلة للمراجع:</span>
                      <div className="flex gap-2 font-mono">
                        {selectedPatientForPres.age && <span>العمر: {selectedPatientForPres.age} سنة</span>}
                        {selectedPatientForPres.height && <span>الطول: {selectedPatientForPres.height} سم</span>}
                        {selectedPatientForPres.weight && <span>الوزن: {selectedPatientForPres.weight} كجم</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 font-sans pb-1">
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintFullPrescription}
                        className="flex-1 py-2 bg-[#38A169] hover:bg-[#2F855A] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Printer className="w-4 h-4" />
                        طباعة
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPrescriptionModal(false)}
                      className="w-full py-1.5 bg-[#EDF2F7] hover:bg-[#FEE2E2] hover:text-[#EF4444] text-[#2D3748] font-bold text-xs rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      إلغاء
                    </button>
                  </div>
                </form>

                {/* Left Columns: Historical Longitudinal comparison of past prescriptions & notes (Takes 5 Cols) */}
                {patientHasHistory && (
                  <div className="md:col-span-5 bg-slate-50/80 p-5 flex flex-col space-y-4 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar border-r border-[#E2E8F0] text-right">
                    <div className="border-b border-slate-200 pb-2.5">
                      <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 justify-start">
                        <Clock className="w-4 h-4 text-[#3182CE]" />
                        الأرشيف التاريخي لبيانات المريض السابقة
                      </h4>
                      <p className="text-[9px] text-[#718096] mt-0.5 leading-relaxed text-right">يمكنك مراجعة كافة الملاحظات والروشتات التي كتبتها له سابقاً وتبنِّي العلاج بنقرة واحدة.</p>
                    </div>

                    {/* Timeline of visits */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#2B6CB0] uppercase tracking-wider block text-right font-sans">⏱️ وتيرة الزيارات والتحصيلات السابقة ({patientTimelineVisits.length}):</span>
                      <div className="space-y-1 text-[11px] max-h-[105px] overflow-y-auto custom-scrollbar">
                        {patientTimelineVisits.map((v, i) => (
                          <div key={v.id} className="p-1.5 border border-slate-200 bg-white rounded flex items-center justify-between font-sans">
                            <span className="text-[10px] text-slate-400 font-mono">#{patientTimelineVisits.length - i}</span>
                            <span className="text-[10px] text-slate-500 font-mono">📅 {v.datetime ? new Date(v.datetime).toLocaleDateString("ar-EG") : "—"}</span>
                            <span className={`px-1 rounded text-[8px] font-bold ${
                              v.isReview ? "bg-purple-100 text-purple-700" : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {v.isReview ? "مراجعة" : "كشفية"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline of past prescriptions */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
                      <span className="text-[10px] font-black text-[#2B6CB0] uppercase tracking-wider block text-right font-sans">📋 الروشتات والعلاجات السابقة الصادرة له ({prevPresCount.length}):</span>
                      {prevPresCount.length === 0 ? (
                        <div className="p-6 border border-dashed border-slate-200 bg-white text-center text-[10px] font-bold rounded-lg text-slate-400">
                          لم تصرف له روشتات بالعيادة سابقاً.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {prevPresCount.map(p => (
                            <div key={p.id} className="p-2.5 bg-white border border-[#E2E8F0] shadow-2xs rounded-lg space-y-2 hover:border-[#3182CE] transition-all">
                              <div className="flex items-center justify-between font-sans">
                                <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded font-mono">
                                  📅 {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMedicines(p.medicines || "");
                                    setXrays(p.xrays || "");
                                    setTests(p.tests || "");
                                    setOther(p.other || "");
                                  }}
                                  className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 text-[10px] rounded hover:bg-sky-100 transition font-extrabold cursor-pointer"
                                  title="تبني أدوية هذه الراشيتة السابقة ونسخها بالكامل"
                                >
                                  استيراد ونسخ بالكامل 🔄
                                </button>
                              </div>

                              <div className="text-[10px] space-y-1.5 text-slate-700 font-sans">
                                {p.medicines && (
                                  <div>
                                    <strong className="text-slate-800 text-[9px] block">💊 الأدوية المقررة سابقاً:</strong>
                                    <pre className="text-[9px] bg-slate-50 p-1 rounded font-mono border border-slate-100 leading-snug whitespace-pre-wrap max-h-[50px] overflow-y-auto custom-scrollbar">{p.medicines}</pre>
                                  </div>
                                )}
                                {p.tests && (
                                  <div className="flex gap-1 justify-start">
                                    <strong className="text-slate-800 text-[9px]">🧪 تحاليل مطلوبة:</strong>
                                    <span className="text-[9px] text-green-700 font-bold">{p.tests}</span>
                                  </div>
                                )}
                                {p.xrays && (
                                  <div className="flex gap-1 justify-start">
                                    <strong className="text-slate-800 text-[9px]">🔮 أشعة مطلوبة:</strong>
                                    <span className="text-[9px] text-purple-705 font-bold">{p.xrays}</span>
                                  </div>
                                )}
                                {p.other && (
                                  <div className="text-[9px] text-slate-500 leading-relaxed text-right">
                                    <strong className="text-slate-800">📝 توصيات الطبيب:</strong> {p.other}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* USER SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className={`bg-white rounded-xl ${settingsTab === "template" ? "max-w-5xl" : "max-w-2xl"} w-full overflow-hidden shadow-2xl border border-[#E2E8F0] animate-slide-up flex flex-col max-h-[90vh] transition-all duration-300`}>
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Settings className="w-4.5 h-4.5 text-[#3182CE]" />
                لوحة إعدادات الطبيب والتحكم بورق الروشتة
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                إغلاق ×
              </button>
            </div>

            {/* Tab Swapper */}
            <div className="flex border-b border-[#E2E8F0] bg-slate-50/50 justify-center shrink-0">
              <button
                type="button"
                onClick={() => setSettingsTab("account")}
                className={`flex-1 py-3 text-center text-xs font-bold transition-all cursor-pointer border-b-2 ${
                  settingsTab === "account"
                    ? "border-[#3182CE] text-[#3182CE] bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                ⚙️ الحساب الشخصي
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("template")}
                className={`flex-1 py-3 text-center text-xs font-bold transition-all cursor-pointer border-b-2 ${
                  settingsTab === "template"
                    ? "border-[#3182CE] text-[#3182CE] bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                🖨️ تصميم ورق الطباعة والروشتات
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-right">
              {settingsError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center justify-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{settingsError}</span>
                </div>
              )}

              {settingsSuccess && (
                <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100 flex items-center justify-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-550" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {settingsTab === "account" ? (
                <div className="space-y-5">
                  <form onSubmit={handleUpdateSettings} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 block">تعديل اسم المستخدم (بدون فراغات)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value.replace(/\s+/g, ""))}
                          className="w-full pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono"
                        />
                        <User className="w-4 h-4 absolute top-2.5 right-2.5 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 block">تعديل الايميل</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono"
                        />
                        <Mail className="w-4 h-4 absolute top-2.5 right-2.5 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 block">تعديل كلمة السر</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="اتركه فارغاً للاحتفاظ بكلمة السر الحالية"
                          className="w-full pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE]"
                        />
                        <Lock className="w-4 h-4 absolute top-2.5 right-2.5 text-slate-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      حفظ وتحديث معلومات الحساب
                    </button>
                  </form>

                  {/* Account Deletion space */}
                  <div className="pt-4 border-t border-[#E2E8F0]">
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setDeletePasscode("");
                          setDeleteError("");
                        }}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        مسح وحذف الحساب نهائياً
                      </button>
                    ) : (
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-right space-y-3">
                        <p className="text-xs font-bold text-red-900 leading-relaxed text-center">
                          هل أنت متأكد تماماً من حذف حسابك؟ سيتم إزالة ملفك ونسخ حسابك نهائياً من العيادة وقاعدة البيانات.
                        </p>

                        <div className="space-y-1">
                          <label className="text-[11px] font-extrabold text-red-800 block">
                            الرمز المالي السري للمبرمج للموافقة على الإزالة:
                          </label>
                          <input
                            type="password"
                            placeholder="أدخل الرمز السري الخاص بالمبرمج هنا..."
                            value={deletePasscode}
                            onChange={(e) => setDeletePasscode(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-red-200 rounded-lg focus:outline-none focus:border-red-500 font-bold text-right text-slate-800"
                            required
                          />
                        </div>

                        {deleteError && (
                          <div className="text-[10px] text-red-650 font-bold bg-white border border-red-200 p-2 rounded-md text-center">
                            {deleteError}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={handleDeleteAccount}
                            className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                          >
                            نعم، احذف حسابي
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeletePasscode("");
                              setDeleteError("");
                            }}
                            className="w-full py-1.5 bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#2D3748] font-bold text-xs rounded-lg cursor-pointer transition-colors"
                          >
                            تراجع وإلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-right font-sans">
                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 text-[11px] text-[#1A365D] leading-relaxed font-bold">
                    💡 يمكنك هنا تعديل الترويسة العليا والهوامش ولون السمة وطباعة ترويسة ورق الروشتة وعلاجاتها بمرونة كاملة لتخصيص الهوية البصرية لطباعة الأدوية، الأشعة، الفحوصات الطبية.
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: Dynamic Real-time Live Preview */}
                    <div className="lg:col-span-12 xl:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 lg:sticky lg:top-0 max-h-[70vh] overflow-y-auto flex flex-col justify-start">
                      <span className="text-[11px] font-extrabold text-[#3182CE] mb-2 block text-center">💻 معاينة حية تفاعلية لورقة الروشتة (A4 Mockup)</span>
                      
                      <div className="w-full bg-white rounded-lg shadow-sm border p-4 text-right relative overflow-hidden flex flex-col justify-between transition-all duration-300"
                           style={{
                             fontFamily: `${editTemplate.fontFamily || "Cairo"}, sans-serif`,
                             borderColor: editTemplate.themeColor || "#3182CE",
                             minHeight: "440px"
                           }}>
                        
                        {/* Dynamic top margin representation */}
                        <div style={{ height: `${Math.min(50, Math.max(10, editTemplate.topMargin / 2))}px` }} className="transition-all duration-300 bg-slate-50/40 border-b border-dashed border-slate-200/50 flex items-center justify-center text-[8px] text-slate-400 select-none mb-2">
                           الهامش العلوي المخصص ({editTemplate.topMargin}px)
                        </div>

                        {/* Logo Header representation */}
                        {!editTemplate.hideHeaderFooter ? (
                          <div className="flex items-start justify-between pb-2 mb-3 select-none relative" 
                               style={{ borderBottom: `3.5px double ${editTemplate.themeColor || "#3182CE"}` }}>
                            
                            {/* Clinic Text Details */}
                            <div className="flex-1 min-w-0 pr-1 text-right">
                              <h4 className="font-extrabold truncate"
                                  style={{
                                    color: editTemplate.clinicNameColor || editTemplate.themeColor || "#1A365D",
                                    fontFamily: `'${editTemplate.clinicNameFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                    fontSize: `${editTemplate.clinicNameFontSize || 22}px`,
                                    display: editTemplate.clinicNameShow === false ? 'none' : 'block'
                                  }}>
                                {editTemplate.clinicName || "اسم عيادتك الرسمية"}
                              </h4>
                              <p className="font-bold mt-1"
                                 style={{
                                   color: editTemplate.doctorTitleColor || "#4A5568",
                                   fontFamily: `'${editTemplate.doctorTitleFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                   fontSize: `${editTemplate.doctorTitleFontSize || 13}px`,
                                   display: editTemplate.doctorTitleShow === false ? 'none' : 'block'
                                 }}>
                                {editTemplate.doctorTitle || "التخصص الطبي أو تفاصيل العنوان"}
                              </p>
                              {editTemplate.address && (
                                <p className="mt-0.5"
                                   style={{
                                     color: editTemplate.addressColor || "#718096",
                                     fontFamily: `'${editTemplate.addressFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                     fontSize: `${editTemplate.addressFontSize || 11}px`,
                                     display: editTemplate.addressShow === false ? 'none' : 'block'
                                   }}>
                                  📍 {editTemplate.address}
                                </p>
                              )}
                              {editTemplate.phone && (
                                <p className="mt-0.5"
                                   style={{
                                     color: editTemplate.phoneColor || "#718096",
                                     fontFamily: `'${editTemplate.phoneFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                     fontSize: `${editTemplate.phoneFontSize || 11}px`,
                                     display: editTemplate.phoneShow === false ? 'none' : 'block'
                                   }}>
                                  📞 {editTemplate.phone}
                                </p>
                              )}
                            </div>

                            {/* Logo Wrapper */}
                            <div className="shrink-0 p-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                              {editTemplate.logoUrl && editTemplate.logoUrl.trim() ? (
                                <img src={editTemplate.logoUrl.trim()} className="h-10 w-10 object-contain rounded" alt="Logo" referrerPolicy="no-referrer" />
                              ) : (
                                editTemplate.logoSymbol !== "custom" ? (
                                  <div dangerouslySetInnerHTML={{ __html: getLogoSymbolSvg(editTemplate.logoSymbol, editTemplate.themeColor || "#3182CE") }} className="w-8 h-8 flex items-center justify-center scale-75" />
                                ) : (
                                  <div className="w-8 h-8 flex items-center justify-center text-[10px] text-slate-400 bg-slate-100 rounded">لوجو</div>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 border border-dashed border-slate-200 bg-slate-100/50 rounded text-center text-[9px] text-slate-400 mb-2 select-none">
                            🚫 الترويسة العلوية مخفية حالياً
                          </div>
                        )}

                        {/* Patient Box Mock */}
                        <div className="bg-slate-50 p-2 rounded border border-slate-200/60 flex flex-wrap justify-between items-center text-[8.5px] gap-1 mb-3 select-none font-sans font-bold">
                          <div className="text-slate-705">
                            الاسم: <span className="text-slate-900">محمد علي أحمد</span>
                          </div>
                          {editTemplate.showAge && (
                            <div>
                              السن: <span className="font-mono text-slate-700">35 سنة</span>
                            </div>
                          )}
                          {editTemplate.showHeightWeight && (
                            <div className="flex gap-1.5 font-mono text-slate-600">
                              <span>الطول: 178سم</span>
                              <span>الوزن: 82كجم</span>
                            </div>
                          )}
                          {editTemplate.showDate && (
                            <div className="text-slate-500 font-mono font-bold">
                              التاريخ: {new Date().toLocaleDateString("ar-EG")}
                            </div>
                          )}
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-3 flex-1 select-none text-right">
                          {/* Rx Symbol / Medicines */}
                          <div className="p-2 bg-slate-50/50 rounded border border-slate-105 border-r-4" style={{ borderRightColor: editTemplate.themeColor || "#3182CE" }}>
                            <div className="pb-0.5 border-b border-slate-100 flex items-center gap-1 font-extrabold"
                                 style={{
                                   color: editTemplate.medicinesColor || editTemplate.themeColor || "#3182CE",
                                   fontFamily: `'${editTemplate.medicinesFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                   fontSize: `${editTemplate.medicinesFontSize || 16}px`
                                 }}>
                              <span>💊</span>
                              <span>{editTemplate.medicinesLabel || "الأدوية الموصوفة والجرعات"}</span>
                            </div>
                            <div className="text-[8.5px] text-slate-500 font-bold pt-1 font-sans leading-relaxed">
                              1. Amoxicillin 500mg — كبسولة كل 8 ساعات لمده 5 ايام<br />
                              2. Claritin 10mg — قرص مساءً قبل النوم
                            </div>
                          </div>

                          {/* Xrays & Tests */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-1.5 bg-slate-50/30 rounded border border-slate-100">
                              <div className="pb-0.5 border-b border-dotted border-slate-200 font-bold"
                                   style={{
                                     color: editTemplate.xraysColor || editTemplate.themeColor || "#3182CE",
                                     fontFamily: `'${editTemplate.xraysFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                     fontSize: `${editTemplate.xraysFontSize || 14}px`
                                   }}>
                                🔮 {editTemplate.xraysLabel || "الأشعة المطلوبة"}
                              </div>
                              <div className="text-[8px] text-slate-500 pt-0.5 font-sans leading-relaxed">
                                - Chest X-Ray (أشعة صدر)
                              </div>
                            </div>
                            <div className="p-1.5 bg-slate-50/30 rounded border border-slate-100">
                              <div className="pb-0.5 border-b border-dotted border-slate-200 font-bold"
                                   style={{
                                     color: editTemplate.testsColor || editTemplate.themeColor || "#3182CE",
                                     fontFamily: `'${editTemplate.testsFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                     fontSize: `${editTemplate.testsFontSize || 14}px`
                                   }}>
                                🧪 {editTemplate.testsLabel || "التحاليل المطلوبة"}
                              </div>
                              <div className="text-[8px] text-slate-500 pt-0.5 font-sans leading-relaxed">
                                - CBC (تحليل صورة دم)
                              </div>
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="p-1.5 bg-slate-50/20 rounded border border-slate-100">
                            <div className="font-bold flex items-center gap-0.5"
                                 style={{
                                   color: editTemplate.instructionsColor || editTemplate.themeColor || "#3182CE",
                                   fontFamily: `'${editTemplate.instructionsFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                   fontSize: `${editTemplate.instructionsFontSize || 14}px`
                                 }}>
                              <span>📝</span>
                              <span>{editTemplate.instructionsLabel || "تعليمات إضافية للمراجع"}</span>
                            </div>
                            <div className="text-[8px] text-slate-500 pt-0.5 leading-relaxed font-sans">
                              الراحة التامة والالتزام بالجرعات في مواعيدها الدقيقة.
                            </div>
                          </div>
                        </div>

                        {/* Signatory Box */}
                        {editTemplate.showSignatory && !editTemplate.hideHeaderFooter && (
                          <div className="mt-3 text-left pl-2 select-none border-t border-slate-100 pt-1.5 font-bold"
                               style={{
                                 color: editTemplate.signatoryColor || "#2D3748",
                                 fontFamily: `'${editTemplate.signatoryFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                 fontSize: `${editTemplate.signatoryFontSize || 12}px`
                               }}>
                            <span>{editTemplate.signatoryText || "توقيع المعتمد"}:</span>
                            <div className="mt-0.5 h-6 w-20 bg-emerald-50/30 border border-dashed border-emerald-200/80 rounded ml-0 flex items-center justify-center text-[7px] text-emerald-600/70 font-mono font-bold">
                              [خاتم طبي]
                            </div>
                          </div>
                        )}

                        {/* Barcode/QR Mock */}
                        {editTemplate.showBarcode && (
                          <div className="flex flex-col items-center gap-0.5 mt-2 select-none">
                            <div className="flex gap-0.5 h-3 items-end bg-black/5 p-0.5 rounded">
                              {[2, 1, 3, 1, 2, 1, 2, 1, 3, 2, 1, 2].map((weight, i) => (
                                <div key={i} className="bg-slate-800" style={{ width: `${weight}px`, height: "100%" }}></div>
                              ))}
                            </div>
                            <span className="text-[6.5px] text-slate-400 tracking-wider font-mono">RX-{currentUser.id || "MED"}</span>
                          </div>
                        )}

                        {/* Custom Bottom Static Notes */}
                        {editTemplate.customNotesBottom && (
                          <div className="border-t border-dashed border-slate-200 pt-1 mt-2 text-center italic leading-relaxed text-slate-400 select-none max-h-[34px] overflow-hidden truncate"
                               style={{
                                 color: editTemplate.notesColor || "#718096",
                                 fontFamily: `'${editTemplate.notesFontFamily || editTemplate.fontFamily || "Cairo"}', sans-serif`,
                                 fontSize: `${editTemplate.notesFontSize || 10}px`
                               }}>
                            {editTemplate.customNotesBottom}
                          </div>
                        )}

                        {/* Dynamic bottom margin representation */}
                        <div style={{ height: `${Math.min(50, Math.max(10, editTemplate.bottomMargin / 2))}px` }} className="transition-all duration-300 bg-slate-50/40 border-t border-dashed border-slate-200/50 flex items-center justify-center text-[8px] text-slate-400 select-none mt-2">
                           الهامش السفلي المخصص ({editTemplate.bottomMargin}px)
                        </div>

                      </div>
                    </div>

                    {/* RIGHT COLUMN: Configuration Inputs Form Controls */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-4 max-h-[70vh] overflow-y-auto pr-1">

                      {/* SECTION 1: HEADER & CLINIC INFO */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200/95 space-y-3 shadow-xs">
                        <h4 className="text-xs font-extrabold text-[#3182CE] pb-1.5 border-b border-slate-100 flex items-center gap-1">
                          <span>🏥</span>
                          <span>معلومات ومحتوى الترويسة العليا (Header Details)</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-3">
                          {/* 1. Clinic Name Option */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editTemplate.clinicNameShow !== false}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, clinicNameShow: e.target.checked })}
                                  className="rounded text-blue-650 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span>اسم العيادة / المركز الطبي</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">clinicName</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.clinicName || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, clinicName: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                                disabled={editTemplate.clinicNameShow === false}
                              />
                              <select
                                value={editTemplate.clinicNameFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, clinicNameFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                                disabled={editTemplate.clinicNameShow === false}
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="40"
                                  value={editTemplate.clinicNameFontSize || 22}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, clinicNameFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                  disabled={editTemplate.clinicNameShow === false}
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.clinicNameColor || editTemplate.themeColor || "#1A365D"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, clinicNameColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  disabled={editTemplate.clinicNameShow === false}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 2. Doctor Specialization Option */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editTemplate.doctorTitleShow !== false}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, doctorTitleShow: e.target.checked })}
                                  className="rounded text-blue-650 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span>التخصص الطبي والوصف التوضيحي</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">doctorSpecialization</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.doctorTitle || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, doctorTitle: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                                disabled={editTemplate.doctorTitleShow === false}
                              />
                              <select
                                value={editTemplate.doctorTitleFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, doctorTitleFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                                disabled={editTemplate.doctorTitleShow === false}
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="30"
                                  value={editTemplate.doctorTitleFontSize || 13}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, doctorTitleFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                  disabled={editTemplate.doctorTitleShow === false}
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.doctorTitleColor || "#4A5568"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, doctorTitleColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  disabled={editTemplate.doctorTitleShow === false}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 3. Address Option */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editTemplate.addressShow !== false}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, addressShow: e.target.checked })}
                                  className="rounded text-blue-650 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span>العنوان الجغرافي</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">address</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.address || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, address: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                                disabled={editTemplate.addressShow === false}
                              />
                              <select
                                value={editTemplate.addressFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, addressFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                                disabled={editTemplate.addressShow === false}
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="24"
                                  value={editTemplate.addressFontSize || 11}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, addressFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                  disabled={editTemplate.addressShow === false}
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.addressColor || "#718096"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, addressColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  disabled={editTemplate.addressShow === false}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 4. Phone Option */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editTemplate.phoneShow !== false}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, phoneShow: e.target.checked })}
                                  className="rounded text-blue-650 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span>أرقام الهواتف والتواصل</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">phone</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.phone || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, phone: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                                disabled={editTemplate.phoneShow === false}
                              />
                              <select
                                value={editTemplate.phoneFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, phoneFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                                disabled={editTemplate.phoneShow === false}
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="24"
                                  value={editTemplate.phoneFontSize || 11}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, phoneFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                  disabled={editTemplate.phoneShow === false}
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.phoneColor || "#718096"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, phoneColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  disabled={editTemplate.phoneShow === false}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Interactive Logo upload and toggle */}
                          <div className="bg-blue-50/10 p-3 rounded-lg border border-blue-200/50 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-extrabold text-blue-900 block">شعار ورمز الترويسة:</label>
                              <select
                                value={editTemplate.logoSymbol || "stethoscope"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, logoSymbol: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-md text-[11px] font-bold focus:outline-none"
                              >
                                <option value="stethoscope">🩺 سماعة الطبيب الافتراضية</option>
                                <option value="heart">❤️ نبض القلب المباشر</option>
                                <option value="activity">⚡ موجة نشاط وحيوية</option>
                                <option value="shield">🛡️ درع الأمان الطبي</option>
                                <option value="award">🎗️ مرتبة الشرف الطبية</option>
                                <option value="custom">🖼️ شعار مخصص (مرفوع من قبلك)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-extrabold text-[#3182CE] block">📤 رفع ملف الشعار الخاص بك (Logo):</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="w-full text-[10px] text-slate-650 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                              />
                            </div>
                            {editTemplate.logoUrl && (
                              <div className="col-span-2 flex items-center justify-between bg-emerald-50/70 p-1.5 px-3 rounded border border-emerald-100 mt-1 select-none">
                                <span className="text-[10px] text-emerald-850 font-extrabold">✓ تم حفظ وتفعيل الشعار المخصص بنجاح بالمعاينة والطباعة</span>
                                <button
                                  type="button"
                                  onClick={() => setEditTemplate({ ...editTemplate, logoUrl: "", logoSymbol: "stethoscope" })}
                                  className="text-[9px] bg-white border border-red-200 text-red-650 px-1.5 py-0.5 rounded font-extrabold hover:bg-red-50"
                                >
                                  إزالة الشعار
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* SECTION 2: PRESCRIPTION SECTION LABELS Styling */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200/95 space-y-3 shadow-xs">
                        <h4 className="text-xs font-extrabold text-[#3182CE] pb-1.5 border-b border-slate-100 flex items-center gap-1">
                          <span>📋</span>
                          <span>أقسام وعناوين المطبوعة الكبرى (Prescription Content Areas)</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-3">
                          {/* 5. Medicines Label */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-850 flex items-center gap-1 font-bold">
                                <span>💊</span>
                                <span>عنوان حقل الأدوية والجرعات</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">medicinesLabel</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.medicinesLabel || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, medicinesLabel: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                              />
                              <select
                                value={editTemplate.medicinesFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, medicinesFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="30"
                                  value={editTemplate.medicinesFontSize || 16}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, medicinesFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.medicinesColor || editTemplate.themeColor || "#3182CE"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, medicinesColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 6. Xrays Label */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-850 flex items-center gap-1 font-bold">
                                <span>🔮</span>
                                <span>عنوان حقل الأشعة والسونار</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">xraysLabel</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.xraysLabel || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, xraysLabel: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                              />
                              <select
                                value={editTemplate.xraysFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, xraysFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="30"
                                  value={editTemplate.xraysFontSize || 14}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, xraysFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.xraysColor || editTemplate.themeColor || "#3182CE"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, xraysColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 7. Tests Label */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-850 flex items-center gap-1 font-bold">
                                <span>🧪</span>
                                <span>عنوان حقل التحاليل واللوحات</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">testsLabel</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.testsLabel || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, testsLabel: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                              />
                              <select
                                value={editTemplate.testsFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, testsFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="30"
                                  value={editTemplate.testsFontSize || 14}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, testsFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.testsColor || editTemplate.themeColor || "#3182CE"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, testsColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 8. Extra Instructions */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-850 flex items-center gap-1 font-bold">
                                <span>📝</span>
                                <span>عنوان حقل التعليمات والإرادات</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">instructionsLabel</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.instructionsLabel || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, instructionsLabel: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                              />
                              <select
                                value={editTemplate.instructionsFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, instructionsFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="30"
                                  value={editTemplate.instructionsFontSize || 14}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, instructionsFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.instructionsColor || editTemplate.themeColor || "#3182CE"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, instructionsColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: SIGNATORY, MARGINS & FOOTER */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200/95 space-y-3 shadow-xs">
                        <h4 className="text-xs font-extrabold text-[#3182CE] pb-1.5 border-b border-slate-100 flex items-center gap-1">
                          <span>⚖️</span>
                          <span>هوامش وتصميم ذيل الروشتة (Margins & Footer Options)</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-3">
                          {/* 9. Signatory Text Option */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editTemplate.showSignatory !== false}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, showSignatory: e.target.checked })}
                                  className="rounded text-blue-650 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span>إظهار توقيع وختم الطبيب</span>
                              </label>
                              <span className="text-[8px] text-slate-400 font-mono">signatoryText</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editTemplate.signatoryText || ""}
                                onChange={(e) => setEditTemplate({ ...editTemplate, signatoryText: e.target.value })}
                                className="md:col-span-6 px-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                                disabled={editTemplate.showSignatory === false}
                              />
                              <select
                                value={editTemplate.signatoryFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, signatoryFontFamily: e.target.value })}
                                className="md:col-span-3 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                                disabled={editTemplate.showSignatory === false}
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>
                              <div className="md:col-span-3 flex items-center gap-1">
                                <input
                                  type="number"
                                  min="8"
                                  max="24"
                                  value={editTemplate.signatoryFontSize || 12}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, signatoryFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                  disabled={editTemplate.showSignatory === false}
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                                <input
                                  type="color"
                                  value={editTemplate.signatoryColor || "#2D3748"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, signatoryColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  disabled={editTemplate.showSignatory === false}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 10. Custom Notes Bottom */}
                          <div className="bg-slate-50/55 p-3 rounded-lg border border-slate-200/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold text-slate-800">ملاحظات وعبارات ذيل الروشتة الثابتة بالأسفل:</span>
                              <span className="text-[8px] text-slate-400 font-mono">notesBottom</span>
                            </div>
                            <textarea
                              value={editTemplate.customNotesBottom || ""}
                              onChange={(e) => setEditTemplate({ ...editTemplate, customNotesBottom: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold focus:outline-none focus:border-[#3182CE]"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                              <select
                                value={editTemplate.notesFontFamily || editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, notesFontFamily: e.target.value })}
                                className="px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold"
                              >
                                <option value="Cairo">خط القاهرة (Cairo)</option>
                                <option value="Almarai">خط المراعي (Almarai)</option>
                                <option value="Inter">انتر (Inter)</option>
                              </select>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 font-bold">الحجم:</span>
                                <input
                                  type="number"
                                  min="8"
                                  max="20"
                                  value={editTemplate.notesFontSize || 10}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, notesFontSize: Number(e.target.value) })}
                                  className="w-14 px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs font-bold text-center"
                                />
                                <span className="text-[10px] text-slate-400">px</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 font-bold">اللون:</span>
                                <input
                                  type="color"
                                  value={editTemplate.notesColor || "#718096"}
                                  onChange={(e) => setEditTemplate({ ...editTemplate, notesColor: e.target.value })}
                                  className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Margins & Colors select */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-650 block">الهامش الأعلى (px):</label>
                              <input
                                type="number"
                                min="0"
                                max="150"
                                value={editTemplate.topMargin}
                                onChange={(e) => setEditTemplate({ ...editTemplate, topMargin: Number(e.target.value) })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-center font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-650 block">الهامش الأسفل (px):</label>
                              <input
                                type="number"
                                min="0"
                                max="150"
                                value={editTemplate.bottomMargin}
                                onChange={(e) => setEditTemplate({ ...editTemplate, bottomMargin: Number(e.target.value) })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-center font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-650 block">الخط الافتراضي العام:</label>
                              <select
                                value={editTemplate.fontFamily || "Cairo"}
                                onChange={(e) => setEditTemplate({ ...editTemplate, fontFamily: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold"
                              >
                                <option value="Cairo">Cairo (القاهرة)</option>
                                <option value="Almarai">Almarai (المراعي)</option>
                                <option value="Inter">Inter (الافتراضي)</option>
                              </select>
                            </div>

                            <div className="col-span-3 space-y-1 pt-1 border-t border-slate-200/50">
                              <label className="text-[10px] font-bold text-slate-650 block">اللون الثيم العام للمطبوعات:</label>
                              <div className="flex gap-2 items-center flex-wrap pt-0.5">
                                {["#3182CE", "#38A169", "#4C51BF", "#E53E3E", "#D69E2E", "#4A5568"].map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setEditTemplate({ ...editTemplate, themeColor: c })}
                                    className="w-5 h-5 rounded-full border border-white cursor-pointer transition-transform"
                                    style={{
                                      backgroundColor: c,
                                      transform: editTemplate.themeColor === c ? "scale(1.28)" : "none",
                                      boxShadow: editTemplate.themeColor === c ? "0 0 0 2px rgb(59 130 246)" : "none"
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Extra Checkboxes Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 text-right">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-650 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editTemplate.showDate !== false}
                                onChange={(e) => setEditTemplate({ ...editTemplate, showDate: e.target.checked })}
                                className="rounded text-blue-600"
                              />
                              إظهار تاريخ الروشتة
                            </label>
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-650 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editTemplate.showAge !== false}
                                onChange={(e) => setEditTemplate({ ...editTemplate, showAge: e.target.checked })}
                                className="rounded text-blue-600"
                              />
                              إظهار عمر المراجع
                            </label>
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-650 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editTemplate.showHeightWeight !== false}
                                onChange={(e) => setEditTemplate({ ...editTemplate, showHeightWeight: e.target.checked })}
                                className="rounded text-blue-600"
                              />
                              إظهار المؤشرات الحيوية
                            </label>
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-650 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editTemplate.showBarcode !== false}
                                onChange={(e) => setEditTemplate({ ...editTemplate, showBarcode: e.target.checked })}
                                className="rounded text-blue-650"
                              />
                              إظهار التكويد و الباركود
                            </label>
                            <label className="col-span-2 md:col-span-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-650 cursor-pointer border-t border-slate-200/50 pt-2 mt-1 select-none">
                              <input
                                type="checkbox"
                                checked={!editTemplate.hideHeaderFooter}
                                onChange={(e) => setEditTemplate({ ...editTemplate, hideHeaderFooter: !e.target.checked })}
                                className="rounded text-blue-650"
                              />
                              عرض ترويسة ورأس الورقة بالكامل بالطباعة والمعاينة
                            </label>
                          </div>

                        </div>
                      </div>

                      {/* SAVE ACTION BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleSaveTemplate(editTemplate)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1 mt-2.5"
                      >
                        💾 حفظ وتطبيق تصميم الروشتة المخصص
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FINANCIALS REPORT MODAL */}
      {showFinancials && (() => {
        const stats = getFinancialStats();
        return (
          <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E2E8F0] animate-slide-up flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-[#E2E8F0] bg-emerald-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                    <Coins className="w-5 h-5 shadow-xs animate-none" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">التقرير المالي والإحصاءات الحسابية</h3>
                    <p className="text-[10px] text-emerald-750 font-bold">إحصائيات الإيرادات الحالية، الأسبوعية، الشهرية، والسنوية لعيادتك</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFinancials(false)}
                  className="p-1 px-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-850 rounded-lg hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>إغلاق</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                {/* 4 Financial Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Daily */}
                  <div className="bg-[#E6FFFA] border border-[#B2F5EA] rounded-xl p-4 text-center space-y-1 shadow-xs transition hover:shadow-md">
                    <span className="text-[10px] text-[#319795] font-extrabold uppercase tracking-wider block">إيرادات اليوم 📅</span>
                    <h4 className="text-base md:text-lg font-extrabold text-[#234E52] font-mono leading-none">
                      {stats.dailyTotal.toLocaleString()}
                    </h4>
                    <span className="text-[10px] text-[#285E61] font-bold block">
                      {stats.dailyCount} حالات اليوم
                    </span>
                  </div>

                  {/* Weekly */}
                  <div className="bg-[#EBF8FF] border border-[#BEE3F8] rounded-xl p-4 text-center space-y-1 shadow-xs transition hover:shadow-md">
                    <span className="text-[10px] text-[#3182CE] font-extrabold uppercase tracking-wider block">إيرادات الأسبوع 📊</span>
                    <h4 className="text-base md:text-lg font-extrabold text-[#1A365D] font-mono leading-none">
                      {stats.weeklyTotal.toLocaleString()}
                    </h4>
                    <span className="text-[10px] text-[#2B6CB0] font-bold block">
                      {stats.weeklyCount} كشوفات بالأسبوع
                    </span>
                  </div>

                  {/* Monthly */}
                  <div className="bg-[#FAF5FF] border border-[#E9D8FD] rounded-xl p-4 text-center space-y-1 shadow-xs transition hover:shadow-md">
                    <span className="text-[10px] text-[#805AD5] font-extrabold uppercase tracking-wider block">إيرادات الشهر 🩺</span>
                    <h4 className="text-base md:text-lg font-extrabold text-[#44337A] font-mono leading-none">
                      {stats.monthlyTotal.toLocaleString()}
                    </h4>
                    <span className="text-[10px] text-[#553C9A] font-bold block">
                      {stats.monthlyCount} كشوفات بالشهر
                    </span>
                  </div>

                  {/* Yearly */}
                  <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-xl p-4 text-center space-y-1 shadow-xs transition hover:shadow-md">
                    <span className="text-[10px] text-[#E53E3E] font-extrabold uppercase tracking-wider block">إيرادات السنة 🏢</span>
                    <h4 className="text-base md:text-lg font-extrabold text-[#742A2A] font-mono leading-none">
                      {stats.yearlyTotal.toLocaleString()}
                    </h4>
                    <span className="text-[10px] text-[#9B2C2C] font-bold block">
                      {stats.yearlyCount} كشوفات بالسنة
                    </span>
                  </div>
                </div>

                {/* Patient Payment Detail List & Verification */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      سجل مدفوعات المرضى اليوم (تتم مزامنتها مع شيت المبرمج)
                    </h4>
                    <span className="text-[10px] text-[#718096] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold">
                      {stats.dailyPatients.length} معاينات ومسجلي اليوم
                    </span>
                  </div>

                  {stats.dailyPatients.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs rounded-xl border border-dashed border-slate-200 bg-slate-50/50 font-medium">
                      لا توجد مبالغ مستلمة لليوم حتى الآن. عند قيام السكرتير بإدراج وتفعيل مريض جديد بمبلغ كشفيته سيظهر فوراً هنا.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-[#F7FAFC] text-[#4A5568] font-bold text-[10px] uppercase border-b border-[#E2E8F0]">
                          <tr>
                            <th className="py-2.5 px-4">اسم المراجع</th>
                            <th className="py-2.5 px-4 text-center">حالة الزيارة</th>
                            <th className="py-2.5 px-4 text-center">توقيت المعاينة</th>
                            <th className="py-2.5 px-4 text-left font-mono">المدفوع المستلم</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] font-medium text-slate-700">
                          {stats.dailyPatients.map(pat => (
                            <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-slate-900">{pat.name}</td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold rounded-full ${
                                  pat.status === "completed" 
                                    ? "bg-[#C6F6D5] text-[#22543D]"
                                    : pat.status === "admitted"
                                    ? "bg-[#EBF8FF] text-[#2B6CB0]"
                                    : "bg-[#EDF2F7] text-[#2D3748]"
                                }`}>
                                  {pat.status === "waiting" && "بالانتظار"}
                                  {pat.status === "pending_approval" && "بانتظار الطبيب"}
                                  {pat.status === "admitted" && "داخل العيادة"}
                                  {pat.status === "completed" && "تم الكشف"}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-center text-[10px] text-slate-400 font-mono">
                                {pat.datetime ? new Date(pat.datetime).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" }) : "—"}
                              </td>
                              <td className="py-2.5 px-4 text-left font-extrabold text-emerald-700 font-mono">
                                {(pat.amountPaid || 0).toLocaleString()} د.ع / $
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Historical Ledger */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 pt-2">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#3182CE]" />
                      أرشيف الفواتير والدفعات المالية المسجلة (تاريخياً)
                    </h4>
                    <span className="text-[10px] text-[#718096] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold">
                      {stats.allPatientsWithPayments.length} معاينة مالية مسجلة
                    </span>
                  </div>

                  {stats.allPatientsWithPayments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs rounded-xl border border-dashed border-slate-200 bg-slate-50/50 font-medium">
                      لا توجد فواتير أو دفعات أقدم مسجلة حالياً بقاعدة بيانات العيادة.
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[180px] rounded-xl border border-[#E2E8F0] custom-scrollbar">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-[#F7FAFC] text-[#4A5568] font-bold text-[10px] uppercase border-b border-[#E2E8F0] sticky top-0">
                          <tr>
                            <th className="py-2.5 px-4 bg-[#F7FAFC]">تاريخ المراجعة</th>
                            <th className="py-2.5 px-4 bg-[#F7FAFC]">المريض</th>
                            <th className="py-2.5 px-4 bg-[#F7FAFC] text-left font-mono">المبلغ المالي المودع</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] font-medium text-slate-600">
                          {stats.allPatientsWithPayments.map(pat => (
                            <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">
                                {pat.datetime ? new Date(pat.datetime).toLocaleDateString("ar-EG") : "—"}
                              </td>
                              <td className="py-2.5 px-4 text-slate-800 font-bold">{pat.name}</td>
                              <td className="py-2.5 px-4 text-left font-bold text-emerald-800 font-mono">
                                {(pat.amountPaid || 0).toLocaleString()} د.ع / $
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 border-t border-[#E2E8F0] text-center shrink-0">
                <span className="text-[10px] text-slate-500 font-extrabold block">تتم مزامنة هذه البيانات والحسابات تلقائياً مع جداول المبرمج (jehat.hassan91@gmail.com) بشكل فوري.</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
