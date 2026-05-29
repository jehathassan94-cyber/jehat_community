import React, { useState, useEffect, useRef } from "react";
import { 
  User, MessageSquare, Plus, Trash2, Edit2, LogOut, Check,
  AlertCircle, ShieldCheck, Mail, Lock, Phone, UserCheck, Stethoscope, ChevronLeft, Send, Sparkles, Calendar, Clock, CheckCircle,
  Search, Database, BookOpen, TrendingUp, Coins, DollarSign
} from "lucide-react";
import { Patient, Message, User as UserType } from "../types";

interface SecretaryDashboardProps {
  currentUser: UserType;
  onLogout: () => void;
}

export default function SecretaryDashboard({
  currentUser,
  onLogout,
}: SecretaryDashboardProps) {
  // Tabs & Searching States for Secretary
  const [secretarySubTab, setSecretarySubTab] = useState<"current" | "archive">("current");
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [secretarySearchQuery, setSecretarySearchQuery] = useState("");
  const [secretarySelectedPatient, setSecretarySelectedPatient] = useState<Patient | null>(null);
  // Data lists
  const [patients, setPatients] = useState<Patient[]>([]);

  // Chat parameters with selected Doctor
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getCurrentDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // New patient addition form
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientDateTime, setNewPatientDateTime] = useState(getCurrentDateTimeString());
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientHeight, setNewPatientHeight] = useState("");
  const [newPatientWeight, setNewPatientWeight] = useState("");
  const [newPatientAmountPaid, setNewPatientAmountPaid] = useState("");
  const [isReviewVisit, setIsReviewVisit] = useState(false);
  const [patientFormError, setPatientFormError] = useState("");
  const [patientFormSuccess, setPatientFormSuccess] = useState("");
  const [addingPatient, setAddingPatient] = useState(false);
  const [cancelingPatientId, setCancelingPatientId] = useState<string | null>(null);

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

  // Get unique patient records historically for search / auto-completion of secretaries
  const getUniquePatients = () => {
    const seen = new Set<string>();
    const uniqueList: Patient[] = [];
    [...patients].reverse().forEach(p => {
      const key = p.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(p);
      }
    });
    return uniqueList;
  };

  const fillPatientFields = (pat: Patient) => {
    setNewPatientName(pat.name);
    setNewPatientPhone(pat.phone || "");
    setNewPatientAge(pat.age || "");
    setNewPatientHeight(pat.height || "");
    setNewPatientWeight(pat.weight || "");
    setIsReviewVisit(true); // Default to review for returning
    setPatientFormSuccess(`تم استرجاع وتعبئة بيانات المراجع المسبق "${pat.name}" تلقائياً! ⚡`);
    setShowNameSuggestions(false);
    setShowPhoneSuggestions(false);
  };

  // Active sync polling
  useEffect(() => {
    const loadSecretaryData = async () => {
      if (!currentUser.doctorId) return;
      try {
        // Load patient lineup for this specific doctor
        const patRes = await fetch(`/api/patients?doctorId=${currentUser.doctorId}`);
        if (patRes.ok) {
          const patData = await patRes.json();
          setPatients(patData);
        }
      } catch (err) {
        console.error("Failed to load secretary statistics", err);
      }
    };

    loadSecretaryData();
    const interval = setInterval(loadSecretaryData, 3000); // 3 seconds interval refresh
    return () => clearInterval(interval);
  }, [currentUser.doctorId]);

  // Load chat messages with Doctor
  useEffect(() => {
    if (!currentUser.doctorId) return;

    const loadChat = async () => {
      try {
        const chatRes = await fetch(`/api/chat?userA=${currentUser.id}&userB=${currentUser.doctorId}`);
        if (chatRes.ok) {
          const data = await chatRes.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load secretary chat", err);
      }
    };

    loadChat();
    const chatInterval = setInterval(loadChat, 2000); // Poll chat messages
    return () => clearInterval(chatInterval);
  }, [currentUser.doctorId, currentUser.id]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, currentUser.doctorId]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !currentUser.doctorId) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: currentUser.doctorId,
          text: newMessageText.trim()
        })
      });

      if (response.ok) {
        setNewMessageText("");
        // Load immediately
        const chatRes = await fetch(`/api/chat?userA=${currentUser.id}&userB=${currentUser.doctorId}`);
        if (chatRes.ok) {
          const data = await chatRes.json();
          setMessages(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Patient Entry (إدخال مريض جديد)
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientFormError("");
    setPatientFormSuccess("");

    if (!newPatientName.trim()) {
      setPatientFormError("الرجاء إدخال اسم المريض");
      return;
    }

    const resolvedDateTime = newPatientDateTime || getCurrentDateTimeString();

    setAddingPatient(true);
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPatientName.trim(),
          phone: newPatientPhone.trim(),
          datetime: resolvedDateTime,
          age: newPatientAge.trim(),
          height: newPatientHeight.trim(),
          weight: newPatientWeight.trim(),
          amountPaid: isReviewVisit ? 0 : (parseFloat(newPatientAmountPaid) || 0),
          isReview: isReviewVisit,
          secretaryId: currentUser.id,
          doctorId: currentUser.doctorId
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPatientFormSuccess("تم تسجيل المريض بنجاح وإضافته لطابور العيادة!");
        setNewPatientName("");
        setNewPatientPhone("");
        setNewPatientDateTime(getCurrentDateTimeString());
        setNewPatientAge("");
        setNewPatientHeight("");
        setNewPatientWeight("");
        setNewPatientAmountPaid("");
        setIsReviewVisit(false);
        
        // Refresh patient list
        const patRes = await fetch(`/api/patients?doctorId=${currentUser.doctorId}`);
        if (patRes.ok) {
          const patData = await patRes.json();
          setPatients(patData);
        }
      } else {
        setPatientFormError(data.error || "فشل تسجيل المريض مراجعاً.");
      }
    } catch (err) {
      setPatientFormError("تعذر الاتصال بقاعدة البيانات.");
    } finally {
      setAddingPatient(false);
    }
  };

  // Entrance Approval Request to Doctor
  const handleRequestApproval = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending_approval" })
      });
      if (response.ok) {
        // Update local status
        setPatients(prev =>
          prev.map(p => p.id === patientId ? { ...p, status: "pending_approval" } : p)
        );
      }
    } catch (err) {
      console.error("Failed to request approval", err);
    }
  };

  // Confirm admitting patient directly into clinic space
  const handleConfirmAdmit = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "admitted" })
      });
      if (response.ok) {
        setPatients(prev =>
          prev.map(p => p.id === patientId ? { ...p, status: "admitted" } : p)
        );
      }
    } catch (err) {
      console.error("Failed to admit patient:", err);
    }
  };

  // Delete patient completely (Cancellation)
  const confirmCancelPatient = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setPatients(prev => prev.filter(p => p.id !== patientId));
        setCancelingPatientId(null);
      }
    } catch (err) {
      console.error("Failed to cancel patient:", err);
    }
  };

  // Edit settings
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    if (editUsername.includes(" ")) {
      setSettingsError("اسم المستخدم يجب أن يكون خالياً من الفراغات");
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

  // Delete account completely
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
      {/* Secretary Header Panel */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10 px-6 h-16 py-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EBF8FF] rounded-xl text-[#3182CE]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1A202C] flex items-center gap-2">
              السكرتير: {currentUser.firstName} {currentUser.lastName}
              <span className="text-[10px] bg-[#EBF8FF] text-[#2B6CB0] border border-[#BEE3F8] px-2 py-0.5 rounded-full font-bold">
                سكرتيرة العيادة الطبية
              </span>
            </h1>
            <p className="text-[11px] text-[#718096]">
              طبيب العيادة المرافق: <span className="font-bold text-[#2D3748]">د. {currentUser.doctorName || "بانتظار الربط..."}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowSettings(true);
              setSettingsError("");
              setSettingsSuccess("");
            }}
            className="p-2 bg-white hover:bg-[#EDF2F7] text-[#4A5568] rounded-lg border border-[#E2E8F0] cursor-pointer transition-colors"
            title="إعدادات السكرتير"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 bg-red-50 hover:bg-red-100 text-[#C53030] rounded-lg border border-red-150 transition-colors cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Right side area: Register patient & list patients (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Secretary view switcher */}
          <div className="bg-white p-1 rounded-xl border border-[#E2E8F0] flex gap-2 w-fit shrink-0 shadow-xs">
            <button
              onClick={() => setSecretarySubTab("current")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                secretarySubTab === "current"
                  ? "bg-[#3182CE] text-white shadow-xs"
                  : "text-[#536471] hover:bg-[#EDF2F7] text-[#2D3748]"
              }`}
            >
              طابور اليوم وتسجيل الحالات 📝
            </button>
            <button
              onClick={() => setSecretarySubTab("archive")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                secretarySubTab === "archive"
                  ? "bg-[#3182CE] text-white shadow-xs"
                  : "text-[#536471] hover:bg-[#EDF2F7] text-[#2D3748]"
              }`}
            >
              أرشيف وبحث الملفات واسترجاع البيانات 🔍 ({getUniquePatients().length})
            </button>
          </div>

          {secretarySubTab === "current" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
            
            {/* 1. Register Patient Form (5 Cols) */}
            <div className="md:col-span-5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-4 h-fit sticky top-24">
              <div>
                <h3 className="font-bold text-[#1A202C] text-sm flex items-center gap-1.5">
                  <Calendar className="w-4.5 h-4.5 text-[#3182CE]" />
                  إدخال مريض مراجع جديد
                </h3>
                <p className="text-[10px] text-[#718096] mt-0.5">تسجيل بيانات المراجع اليومية للتنسيق مع الطبيب</p>
              </div>

              {patientFormError && (
                <div className="p-2.5 bg-red-50 text-[#C53030] text-xs rounded-lg flex items-center gap-1 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{patientFormError}</span>
                </div>
              )}

              {patientFormSuccess && (
                <div className="p-2.5 bg-green-50 text-[#22543D] text-xs rounded-lg flex items-center gap-1 border border-green-100">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{patientFormSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddPatient} className="space-y-3.5">
                <div className="space-y-1 relative">
                  <label className="text-xs font-semibold text-[#4A5568] flex justify-between">
                    <span>الاسم الكامل للمريض *</span>
                    {newPatientName.trim().length >= 2 && (
                      <span className="text-[10px] text-blue-600 font-bold font-sans">مرجع مسبق؟ راجع القائمة</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => {
                      setNewPatientName(e.target.value);
                      setShowNameSuggestions(true);
                      if (!newPatientDateTime) {
                        setNewPatientDateTime(getCurrentDateTimeString());
                      }
                    }}
                    onFocus={() => {
                      setShowNameSuggestions(true);
                    }}
                    placeholder="مثال: جهاد حسن محمد"
                    className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-bold text-slate-800 animate-none"
                    required
                  />
                  {newPatientName.trim().length >= 2 && showNameSuggestions && (() => {
                    const nameCandidates = getUniquePatients().filter(p => p.name.toLowerCase().includes(newPatientName.trim().toLowerCase())).slice(0, 4);
                    if (nameCandidates.length === 0) return null;
                    return (
                      <div className="absolute right-0 left-0 bg-white border border-blue-200 shadow-xl rounded-lg z-30 p-1 flex flex-col mt-1 gap-1">
                        <div className="flex items-center justify-between text-[9px] text-[#2B6CB0] px-2 py-1 font-bold bg-slate-50 border-b border-slate-100">
                          <span>📋 نقرة واحدة للملء التلقائي (مريض مراجع قديم):</span>
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNameSuggestions(false);
                            }}
                            className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer text-[10px]"
                          >
                            إغلاق ✕
                          </button>
                        </div>
                        {nameCandidates.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => fillPatientFields(c)}
                            className="w-full text-right p-2.5 text-xs hover:bg-[#EBF8FF] rounded-md transition font-extrabold text-slate-800 flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-slate-900 font-bold">{c.name}</span>
                            <span className="text-[10px] text-blue-600 font-mono font-medium">
                              {c.phone ? `📞 ${c.phone}` : ""} {c.age ? `(السن: ${c.age})` : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-1 relative">
                  <label className="text-xs font-semibold text-[#4A5568]">رقم هاتف المريض (اختياري)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newPatientPhone}
                      onChange={(e) => {
                        setNewPatientPhone(e.target.value);
                        setShowPhoneSuggestions(true);
                      }}
                      onFocus={() => {
                        setShowPhoneSuggestions(true);
                      }}
                      placeholder="077XXXXXXXX"
                      className="w-full pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono animate-none font-bold text-slate-800"
                    />
                    <Phone className="w-4 h-4 absolute top-2.5 right-3 text-[#A0AEC0]" />
                  </div>
                  {newPatientPhone.trim().length >= 3 && showPhoneSuggestions && (() => {
                    const phoneCandidates = getUniquePatients().filter(p => p.phone && p.phone.trim().includes(newPatientPhone.trim())).slice(0, 4);
                    if (phoneCandidates.length === 0) return null;
                    return (
                      <div className="absolute right-0 left-0 bg-white border border-blue-200 shadow-xl rounded-lg z-30 p-1 flex flex-col mt-1 gap-1">
                        <div className="flex items-center justify-between text-[9px] text-[#2B6CB0] px-2 py-1 font-bold bg-slate-50 border-b border-slate-100">
                          <span>📋 مريض عثر عليه عبر رقمه:</span>
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPhoneSuggestions(false);
                            }}
                            className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer text-[10px]"
                          >
                            إغلاق ✕
                          </button>
                        </div>
                        {phoneCandidates.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => fillPatientFields(c)}
                            className="w-full text-right p-2.5 text-xs hover:bg-[#EBF8FF] rounded-md transition font-extrabold text-slate-800 flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-slate-900 font-bold">{c.name}</span>
                            <span className="text-[10px] text-blue-600 font-mono font-medium">📞 {c.phone}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Patient medical parameters row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#4A5568]">العمر (اختياري)</label>
                    <input
                      type="text"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                      placeholder="مثال: 30"
                      className="w-full px-2.5 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] text-center font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#4A5568]">الطول (اختياري)</label>
                    <input
                      type="text"
                      value={newPatientHeight}
                      onChange={(e) => setNewPatientHeight(e.target.value)}
                      placeholder="سم"
                      className="w-full px-2.5 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] text-center font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#4A5568]">الوزن (اختياري)</label>
                    <input
                      type="text"
                      value={newPatientWeight}
                      onChange={(e) => setNewPatientWeight(e.target.value)}
                      placeholder="كجم"
                      className="w-full px-2.5 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] text-center font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A5568]">توقيت وتاريخ الكشف (يُحدد تلقائياً)</label>
                  <input
                    type="datetime-local"
                    value={newPatientDateTime}
                    onChange={(e) => setNewPatientDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE]"
                  />
                </div>

                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-xs font-bold text-slate-755 block mb-1.5">تصنيف الزيارة / المعاينة:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewVisit(false)}
                      className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all border cursor-pointer ${
                        !isReviewVisit
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      كشفية جديدة (دفع مالي) 💵
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReviewVisit(true);
                        setNewPatientAmountPaid("");
                      }}
                      className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all border cursor-pointer ${
                        isReviewVisit
                          ? "bg-purple-650 text-white border-purple-600 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      مراجعة مجانية / استشارة 🔄
                    </button>
                  </div>
                </div>

                {!isReviewVisit ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">المبلغ المدفوع (الدخولية) - اختيارى/إجباري:</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newPatientAmountPaid}
                        onChange={(e) => setNewPatientAmountPaid(e.target.value)}
                        placeholder="مثال: 15000 أو 25"
                        className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-bold text-emerald-700 font-mono"
                      />
                      <span className="absolute left-3 top-2 text-xs text-emerald-600 font-bold">د.ع / $</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-purple-50 border border-purple-205 rounded-lg text-[11px] text-purple-800 font-bold leading-relaxed">
                    🔄 تم تفعيل وضع مراجعة / استشارة (مجانية). سيتم إدراج المراجع في طابور العيادة دون مطالبته بأية رسوم دفع.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addingPatient}
                  className="w-full py-2 bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  {addingPatient ? "جاري الإضافة..." : "حفظ المريض بالطابور اليومي"}
                </button>
              </form>
            </div>

            {/* 2. Patient Waitlist Queue (7 Cols) */}
            <div className="md:col-span-7 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col overflow-hidden max-h-[500px] md:max-h-none">
              <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-[#1A202C] text-sm">طابور الانتظار للعيادة</h3>
                <span className="text-[10px] bg-[#EDF2F7] text-[#2D3748] border border-[#E2E8F0] px-2 py-0.5 rounded-full font-bold">
                  {patients.length} مراجعين
                </span>
              </div>

              <div className="divide-y divide-[#E2E8F0] overflow-auto flex-1 custom-scrollbar">
                {patients.length === 0 ? (
                  <div className="p-12 text-center text-[#718096] text-xs">
                    لم يدرج أي مريض في قائمة الانتظار لليوم.
                  </div>
                ) : (
                  patients.map((pat) => (
                    <div key={pat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#1A202C] text-xs flex items-center gap-1.5">
                          {pat.name}
                          <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold rounded-full ${
                            pat.status === "waiting" 
                              ? "bg-[#EDF2F7] text-[#2D3748]"
                              : pat.status === "pending_approval"
                              ? "bg-red-100 text-[#C53030] animate-pulse"
                              : pat.status === "admitted"
                              ? "bg-[#C6F6D5] text-[#22543D]"
                              : "bg-[#EBF8FF] text-[#2B6CB0]"
                          }`}>
                            {pat.status === "waiting" && "بالانتظار"}
                            {pat.status === "pending_approval" && "بانتظار الطبيب"}
                            {pat.status === "admitted" && "داخل العيادة"}
                            {pat.status === "completed" && "تم الكشف"}
                          </span>
                        </h4>
                        <div className="text-[10px] text-[#718096]">
                          {pat.phone ? <span className="font-mono">{pat.phone}</span> : <span className="text-slate-400">بدون هاتف</span>}
                          {pat.datetime && ` | ${new Date(pat.datetime).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" })}`}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 font-sans">
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
                      </div>

                      <div className="flex items-center gap-2">
                        {cancelingPatientId === pat.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-1.5 rounded-lg border border-red-200">
                            <span className="text-[10px] text-red-700 font-bold ml-1">تأكيد الإلغاء؟</span>
                            <button
                              type="button"
                              onClick={() => confirmCancelPatient(pat.id)}
                              className="bg-[#E53E3E] hover:bg-[#C53030] text-white text-[9px] font-bold px-2 py-1 rounded-md cursor-pointer"
                            >
                              نعم، إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancelingPatientId(null)}
                              className="bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#2D3748] text-[9px] font-bold px-2 py-1 rounded-md cursor-pointer"
                            >
                              تراجع
                            </button>
                          </div>
                        ) : (
                          <>
                            {pat.status === "waiting" && (
                              <button
                                type="button"
                                onClick={() => handleRequestApproval(pat.id)}
                                className="bg-[#3182CE] hover:bg-[#2B6CB0] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                              >
                                طلب موافقة للدخول
                              </button>
                            )}
                            {pat.status === "pending_approval" && (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200 animate-pulse">
                                  🚨 مطلوب إدخاله فوراً
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmAdmit(pat.id)}
                                  className="bg-[#38A169] hover:bg-[#2F855A] text-white text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                                >
                                  تأكيد الدخول
                                </button>
                              </div>
                            )}
                            {pat.status === "admitted" && (
                              <span className="text-xs text-[#22543D] font-bold bg-[#C6F6D5] px-2 py-1.5 rounded-md">
                                المريض بالداخل حالياً
                              </span>
                            )}
                            {pat.status === "completed" && (
                              <span className="text-xs text-[#2B6CB0] font-extrabold flex items-center gap-0.5 bg-[#EBF8FF] px-2 py-1.5 rounded-md border border-[#BEE3F8]">
                                <Check className="w-3.5 h-3.5" /> انتهت المعاينة
                              </span>
                            )}

                            {/* Show Cancel Option for any status except completed */}
                            {pat.status !== "completed" && (
                              <button
                                type="button"
                                onClick={() => setCancelingPatientId(pat.id)}
                                className="bg-red-50 hover:bg-red-100 text-[#E53E3E] text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors cursor-pointer border border-red-100"
                                title="إلغاء المريض"
                              >
                                إلغاء
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
          )}

          {/* SubTab 2: Secretary Advanced Longitudinal Patient Search & Financial Audit */}
          {secretarySubTab === "archive" && (() => {
            const normalizedQuery = secretarySearchQuery.trim().toLowerCase();
            const filteredUniquePatients = getUniquePatients().filter(pat => {
              const matchesName = pat.name.toLowerCase().includes(normalizedQuery);
              const matchesPhone = pat.phone && pat.phone.toLowerCase().includes(normalizedQuery);
              return matchesName || matchesPhone;
            });

            return (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs flex-1 flex flex-col min-h-[500px] animate-fade-in text-right">
                <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="text-right">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 justify-start">
                      <Search className="w-4.5 h-4.5 text-[#3182CE]" />
                      أرشيف وبحث ملفات المراجعين الشامل 🔍
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">ابحث عن أي مراجع قديم لاستيراد بياناته وصرف معاينات جديدة أو مراقبة حسابات الدخولية</p>
                  </div>
                  <div className="relative max-w-xs w-full">
                    <input
                      type="text"
                      value={secretarySearchQuery}
                      onChange={(e) => {
                        setSecretarySearchQuery(e.target.value);
                        setSecretarySelectedPatient(null);
                      }}
                      placeholder="ابحث بالاسم أو رقم الهاتف..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-bold text-slate-800 text-right"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#E2E8F0] min-h-0 overflow-hidden text-right">
                  {/* Candidates List (5 Columns) */}
                  <div className="md:col-span-12 lg:col-span-5 flex flex-col p-4 space-y-3 overflow-y-auto max-h-[250px] md:max-h-none min-h-0 custom-scrollbar bg-slate-50/10">
                    <span className="text-[10px] font-black text-[#536471] tracking-wider uppercase">قائمة المراجعين المسترجعين ({filteredUniquePatients.length}):</span>
                    {filteredUniquePatients.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-bold">
                        {secretarySearchQuery ? "لا توجد نتائج مطابقة لمدخلات البحث" : "لا يوجد مراجعين مؤرشفين بعد بالعيادة"}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {filteredUniquePatients.map(pat => {
                          const isSelected = secretarySelectedPatient?.name.trim().toLowerCase() === pat.name.trim().toLowerCase();
                          return (
                            <button
                              key={pat.id}
                              type="button"
                              onClick={() => setSecretarySelectedPatient(pat)}
                              className={`w-full text-right p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-3xs flex items-center justify-between ${
                                isSelected 
                                  ? "bg-[#EBF8FF] text-[#2B6CB0] border-[#3182CE]" 
                                  : "bg-white text-slate-650 border-slate-150 hover:bg-slate-50"
                              }`}
                            >
                              <div className="space-y-0.5 w-full">
                                <div className="font-bold text-slate-900">{pat.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {pat.phone ? `📞 ${pat.phone}` : "بدون رقم هاتف مسجل"}
                                </div>
                              </div>
                              <ChevronLeft className="w-4 h-4 text-slate-400 animate-none" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Audit details panel (7 Columns) */}
                  <div className="md:col-span-12 lg:col-span-7 p-5 flex flex-col space-y-5 overflow-y-auto max-h-[450px] md:max-h-none min-h-0 custom-scrollbar bg-slate-50/50 text-right">
                    {!secretarySelectedPatient ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-[#718096] space-y-2">
                        <Database className="w-12 h-12 text-blue-300" />
                        <h4 className="font-bold text-xs text-slate-705">اختر مريضاً لبدء المحاسبة والمزامنة</h4>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto text-center">سيتم استعراض جدول زيارات المريض، إجمالي المبالغ المدفوعة، التواريخ، وحالته الطبية الحالية.</p>
                      </div>
                    ) : (() => {
                      const pName = secretarySelectedPatient.name.trim().toLowerCase();
                      const historicalVisits = patients.filter(p => p.name.trim().toLowerCase() === pName);
                      
                      // Calculate financial cumulative of this candidate
                      const totalPaidFunds = historicalVisits.reduce((sum, current) => sum + (current.amountPaid || 0), 0);
                      const paidVisitsCount = historicalVisits.filter(v => !v.isReview).length;
                      const freeConsultationCount = historicalVisits.filter(v => v.isReview).length;

                      return (
                        <div className="space-y-4 text-right">
                          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-3xs space-y-2.5">
                            <h4 className="font-extrabold text-[#1A202C] text-sm flex items-center justify-between">
                              <span>الملف المالي والتاريخي: {secretarySelectedPatient.name}</span>
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full border border-emerald-100 font-bold">مسترجع ⚡</span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 font-sans justify-start">
                              {secretarySelectedPatient.phone && (
                                <span className="bg-slate-50 text-slate-650 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
                                  الهاتف: {secretarySelectedPatient.phone}
                                </span>
                              )}
                              {secretarySelectedPatient.age && (
                                <span className="text-[10px] font-bold bg-slate-55 text-slate-650 px-2 py-0.5 rounded border">
                                  السن: {secretarySelectedPatient.age} سنة
                                </span>
                              )}
                            </div>

                            {/* Rapid action trigger to load patient in form */}
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  fillPatientFields(secretarySelectedPatient);
                                  setSecretarySubTab("current");
                                }}
                                className="w-full py-2 bg-[#3182CE] hover:bg-[#2B6CB0] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs text-center"
                              >
                                <Plus className="w-4 h-4 shrink-0" />
                                <span>إدراج المريض ومراجعته فوراً في طابور اليوم 🩺</span>
                              </button>
                            </div>
                          </div>

                          {/* Statistics Card */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center">
                              <span className="text-[9px] text-[#718096] block font-bold">مجموع المدفوعات</span>
                              <span className="text-xs font-black text-emerald-600 block mt-0.5 font-mono">
                                {totalPaidFunds.toLocaleString()} د.ع
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center">
                              <span className="text-[9px] text-[#718096] block font-bold">كشوفات مدفوعة</span>
                              <span className="text-xs font-black text-blue-600 block mt-0.5 font-mono">
                                {paidVisitsCount} زيارة
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center">
                              <span className="text-[9px] text-[#718096] block font-bold">مراجعات مجانية</span>
                              <span className="text-xs font-black text-purple-600 block mt-0.5 font-mono">
                                {freeConsultationCount} زيارة
                              </span>
                            </div>
                          </div>

                          {/* Visits Card */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-3xs text-right">
                            <h5 className="font-bold text-xs text-slate-800 border-b border-rose-50 pb-2 flex items-center gap-1 justify-start">
                              <Clock className="w-4 h-4 text-rose-500" />
                              الخط الزمني لكافة زيارات العيادة السابقة ({historicalVisits.length})
                            </h5>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar text-right">
                              {historicalVisits.map((v, idx) => (
                                <div key={v.id} className="p-2.5 rounded-lg border border-slate-150 bg-slate-50/40 text-[11px] font-sans flex items-center justify-between">
                                  <div className="space-y-1 text-right">
                                    <div className="font-extrabold text-[#1A202C] text-[10px]">
                                      زيارة رقم #{historicalVisits.length - idx} {v.isReview ? "(استشارة مجانية 🔄)" : `(كشفية مدفوعة د.ع ${v.amountPaid || 0})`}
                                    </div>
                                    <div className="text-[9px] text-[#718096] font-mono">
                                      ⏱️ {v.datetime ? new Date(v.datetime).toLocaleString("ar-EG") : "—"}
                                    </div>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                    v.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                                    v.status === "admitted" ? "bg-blue-100 text-blue-700 font-bold animate-pulse" : "bg-amber-100 text-amber-850"
                                  }`}>
                                    {v.status === "completed" ? "مكتمل" : v.status === "admitted" ? "قيد المعاينة" : "في الانتظار"}
                                  </span>
                                </div>
                              ))}
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

        {/* Left side area: Chat Panel with chosen Doctor (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden h-[500px] lg:h-auto">
          {/* Top of Chat */}
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F7FAFC] flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] text-[#3182CE] font-bold uppercase block">قناة تواصل عيادية مغلقة</span>
              <h3 className="font-semibold text-[#1A202C] text-sm flex items-center gap-1.5 mt-0.5">
                <MessageSquare className="w-4 h-4 text-[#3182CE]" />
                الدردشة التنسيقية مع الطبيب
              </h3>
            </div>
          </div>

          <div className="px-4 py-1.5 bg-[#EBF8FF]/30 text-[#1A365D] border-b border-[#E2E8F0] text-[10px] font-bold shrink-0">
            تتكلم مباشرة مع: د. {currentUser.doctorName || "طبيب العيادة"}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30 min-h-0">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                ابدأ بإرسال رسائل أو طرح استفسارات عاجلة مع الطبيب.
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
                          ? "bg-[#EBF8FF] text-[#2C5282] border border-[#BEE3F8] rounded-tl-none font-medium text-left"
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

          {/* Chat text Input sender */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E2E8F0] flex gap-2 bg-white shrink-0">
            <input
              type="text"
              placeholder="اكتب رسالة للطبيب..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              className="w-full bg-[#F7FAFC] text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#3182CE] font-medium"
            />
            <button
              type="submit"
              disabled={!newMessageText.trim()}
              className="p-2.5 bg-[#3182CE] hover:bg-[#2B6CB0] text-white rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4 shrink-0 transform rotate-180" />
            </button>
          </form>
        </div>
      </div>

      {/* USER SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E2E8F0] animate-slide-up">
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-bold text-[#1A202C] text-sm">إعدادات سكرتير العيادة</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            <div className="p-6 space-y-5">
              {settingsError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{settingsError}</span>
                </div>
              )}

              {settingsSuccess && (
                <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A5568] block">تعديل اسم المستخدم (بدون فراغات)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.replace(/\s+/g, ""))}
                      className="w-full pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono"
                    />
                    <User className="w-4 h-4 absolute top-2.5 right-2.5 text-[#4A5568]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A5568] block">تعديل الايميل</label>
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
                  <label className="text-xs font-semibold text-[#4A5568] block">تعديل كلمة المرور (الرقم السري)</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="اتركها فارغة للاحتفاظ بكلمة السر الحالية"
                      className="w-full pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE]"
                    />
                    <Lock className="w-4 h-4 absolute top-2.5 right-2.5 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  حفظ وتحديث معلومات الحساب
                </button>
              </form>

              {/* Delete account section */}
              <div className="pt-4 border-t border-[#E2E8F0]">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setDeletePasscode("");
                      setDeleteError("");
                    }}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-[#C53030] rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    مسح وحذف حساب السكرتير نهائياً
                  </button>
                ) : (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-right space-y-3">
                    <p className="text-xs font-bold text-red-900 leading-relaxed text-center">
                      هل أنت متأكد تماماً من حذف حسابك؟ سيتم إزالة كافة السجلات المرتبطة بك وإعلام الطبيب.
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
          </div>
        </div>
      )}
    </div>
  );
}
