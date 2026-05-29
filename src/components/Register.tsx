import React, { useState, useEffect } from "react";
import { 
  User, Lock, Mail, Phone, ShieldCheck, ArrowRight, CheckCircle, 
  AlertCircle, HelpCircle, Eye, EyeOff, Check, X, ShieldAlert 
} from "lucide-react";

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

interface DoctorDropdownItem {
  id: string;
  name: string;
  phone: string;
  username: string;
}

export default function Register({
  onRegisterSuccess,
  onNavigateToLogin,
}: RegisterProps) {
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("doctor");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [programmerPassword, setProgrammerPassword] = useState("");

  // Helpers / States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState<{ checked: boolean; exists: boolean }>({ checked: false, exists: false });
  const [doctorsList, setDoctorsList] = useState<DoctorDropdownItem[]>([]);

  // Verification status
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState(""); // Simulated sent code
  const [enteredPhoneCode, setEnteredPhoneCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [phoneSimulatedMessage, setPhoneSimulatedMessage] = useState("");

  // Doctor Verification status (For Secretary roles)
  const [docCodeSent, setDocCodeSent] = useState(false);
  const [docVerificationCode, setDocVerificationCode] = useState(""); // Simulated sent code to doctor
  const [enteredDocCode, setEnteredDocCode] = useState("");
  const [docVerified, setDocVerified] = useState(true);
  const [docSimulatedMessage, setDocSimulatedMessage] = useState("");
  const [showDocModal, setShowDocModal] = useState(false);

  // Load doctors for secretary selection
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors");
        if (response.ok) {
          const data = await response.json();
          setDoctorsList(data);
          if (data.length > 0) {
            setSelectedDoctorId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  // Check username for spaces and availability
  const checkUsernameAvailability = async (nameVal: string) => {
    const cleanName = nameVal.replace(/\s+/g, "").toLowerCase();
    setUsername(cleanName);

    if (cleanName.length < 3) {
      setUsernameCheck({ checked: false, exists: false });
      return;
    }

    try {
      const res = await fetch("/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanName })
      });
      const data = await res.json();
      setUsernameCheck({ checked: true, exists: data.exists });
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger WhatsApp Verification
  const handleSendPhoneCode = async () => {
    if (!phone.trim()) {
      setError("الرجاء إدخال رقم الهاتف أولاً");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/verify-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPhoneVerificationCode(data.code);
        setPhoneCodeSent(true);
        setPhoneSimulatedMessage(`[رسالة واتساب محاكاة]: تم إرسال الرمز ${data.code} لتأكيد حسابك.`);
      } else {
        setError(data.error || "فشل إرسال رمز التحقق.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم لإرسال الرمز.");
    }
  };

  // Verify entered phone code
  const handleVerifyPhoneCode = () => {
    if (enteredPhoneCode === phoneVerificationCode) {
      setPhoneVerified(true);
      setError("");
    } else {
      setError("رمز التحقق غير متطابق. يرجى إعادة التأكد.");
    }
  };

  // Trigger Secretary's Doctor verification code
  const handleSendDocCode = async () => {
    if (!selectedDoctorId) {
      setError("الرجاء تحديد الطبيب أولاً");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/verify-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: selectedDoctorId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDocVerificationCode(data.code);
        setDocCodeSent(true);
        setShowDocModal(true);
        setDocSimulatedMessage(`[واتساب الطبيب]: أهلاً دكتور، يرجى تزويد السكرتير بالرمز ${data.code} للموافقة على ربط الحساب بهاتف ${data.doctorPhone}`);
      } else {
        setError(data.error || "فشل إرسال طلب الموافقة للطبيب.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء التواصل مع الطبيب.");
    }
  };

  const handleVerifyDocCode = () => {
    if (enteredDocCode === docVerificationCode) {
      setDocVerified(true);
      setShowDocModal(false);
      setError("");
    } else {
      setError("رمز موافقة الطبيب خاطئ ولا يطابق الرمز المرسل لهاتف الطبيب المختار.");
    }
  };

  // Check if all fields are valid to unlock register button
  const isFormValid = () => {
    // Basic checks
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !password || !phone.trim() || !email.trim()) return false;
    // Space checking
    if (username.includes(" ")) return false;
    // Username shouldn't exist
    if (usernameCheck.exists) return false;
    // Programmer password check
    if (programmerPassword !== "Pgjmwpgjmw93*94#") return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("يرجى التأكد من استكمال كافة الشروط الأساسية (رمز المبرمج، وخلو الاسم من الفراغات).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          password,
          phone,
          email,
          role,
          doctorId: role === "secretary" ? selectedDoctorId : undefined,
          programmerPassword,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Success
        onRegisterSuccess();
      } else {
        setError(data.error || "فشل التسجيل. يرجى مراجعة الحقول والرموز.");
      }
} catch (error: any) {
  const serverError = error.response?.data?.error || error.message || "خطأ غير معروف";
  setMessage(`فشل التسجيل بسبب: ${serverError}`);
}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4 py-12 md:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden relative">
        <div className="bg-[#3182CE] h-1.5 w-full" />

        <div className="pt-8 px-8 text-center">
          <h2 className="text-lg font-bold text-[#1A202C] tracking-tight">إنشاء حساب جديد</h2>
          <p className="mt-1 text-[#718096] text-xs">
            قم بملء تفاصيل حسابك المخصص في مجتمع العيادات المشترك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-[#C53030] text-xs rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A5568]">الاسم الأول *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="مثال: أحمد"
                className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A5568]">الاسم الثاني/العائلة *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="مثال: علي"
                className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-medium"
                required
              />
            </div>
          </div>

          {/* Username (strictly without spaces) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center bg-transparent">
              <label className="text-xs font-semibold text-[#4A5568]">اسم مستخدم بدون فراغ *</label>
              {usernameCheck.checked && (
                usernameCheck.exists ? (
                  <span className="text-[10px] text-[#C53030] flex items-center gap-0.5 font-bold">
                    <X className="w-3 h-3" /> مستخدم مسبقاً
                  </span>
                ) : (
                  <span className="text-[10px] text-[#2F855A] flex items-center gap-0.5 font-bold">
                    <Check className="w-3 h-3" /> متاح للاستخدام
                  </span>
                )
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => checkUsernameAvailability(e.target.value)}
                placeholder="مثال: ahmedalidev(بدون مسافة)"
                className={`w-full pr-8 pl-3 py-2 bg-[#F7FAFC] border ${usernameCheck.checked && usernameCheck.exists ? "border-red-300" : "border-[#E2E8F0]"} rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono`}
                required
              />
              <User className="w-4 h-4 absolute top-2.5 right-3 text-[#A0AEC0]" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#4A5568]">الرقم السري *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رقم سر الحساب الخاص بك"
                className="w-full pr-8 pl-9 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE]"
                required
              />
              <Lock className="w-4 h-4 absolute top-2.5 right-3 text-[#A0AEC0]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A0AEC0] hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#4A5568]">البريد الإلكتروني (الايميل) *</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full pr-8 pl-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono"
                required
              />
              <Mail className="w-4 h-4 absolute top-2.5 right-3 text-[#A0AEC0]" />
            </div>
          </div>

          {/* Account Type (Role) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A5568]">نوع الحساب الجديد *</label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                }}
                className="w-full px-2 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] text-[#1A202C]"
              >
                <option value="doctor">طبيب (Doctor)</option>
                <option value="secretary">سكرتير الطبيب (Secretary)</option>
                <option value="market_manager">مدير الماركت</option>
                <option value="cashier">موظف كاشير ماركت</option>
                <option value="accountant">محاسب ماركت</option>
              </select>
            </div>

            {/* Phone input with verification */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A5568]">رقم الهاتف *</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                  }}
                  placeholder="077XXXXXXXX"
                  className="w-full px-2 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* If Secretary is selected -> Show doctor list */}
          {role === "secretary" && (
            <div className="bg-[#EBF8FF] p-4 rounded-lg border border-[#BEE3F8] text-xs space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#2B6CB0] mb-1">
                  اختر الطبيب الذي تعمل سكرتيراً لديه *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                  }}
                  className="w-full px-2 py-2 bg-white border border-[#BEE3F8] rounded-lg text-xs text-[#2B6CB0] focus:outline-none focus:border-[#3182CE]"
                >
                  {doctorsList.length === 0 ? (
                    <option value="">لا يوجد أطباء مسجلين حالياً</option>
                  ) : (
                    doctorsList.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} (المعرف: {doc.username})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Developer/Programmer Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center bg-transparent">
              <label className="text-xs font-semibold text-[#4A5568] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                كلمة سر المبرمج التفعيلية *
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Pgjmwpgjmw93*94#</span>
            </div>
            <input
              type="password"
              value={programmerPassword}
              onChange={(e) => setProgrammerPassword(e.target.value)}
              placeholder="يجب إدخل الرمز السري للمبرمج لتأكيد الصلاحية"
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono placeholder-[#A0AEC0]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-2.5 bg-[#3182CE] hover:bg-[#2B6CB0] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg text-xs transition-colors mt-2 shrink-0 cursor-pointer"
          >
            {loading ? "جاري إنشاء الحساب..." : "تفعيل وإنشاء الحساب"}
          </button>
        </form>

        <div className="px-8 pb-6 text-center border-t border-[#E2E8F0] pt-4 bg-slate-50/50 flex justify-center items-center">
          <p className="text-xs text-[#4A5568]">
            لديك حساب بالفعل؟{" "}
            <button
              onClick={onNavigateToLogin}
              className="font-bold text-[#2B6CB0] hover:text-[#2C5282] transition-colors cursor-pointer"
            >
              تسجيل دخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
