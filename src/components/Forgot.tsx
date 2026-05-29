import React, { useState } from "react";
import { User, Phone, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface ForgotProps {
  onNavigateToLogin: () => void;
}

export default function Forgot({ onNavigateToLogin }: ForgotProps) {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [codeSent, setCodeSent] = useState(false);
  const [sentCode, setSentCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState("");
  const [simulatedMessage, setSimulatedMessage] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !phone.trim()) {
      setError("الرجاء إدخال اسم المستخدم ورقم الهاتف المسجل");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSentCode(data.code);
        setRecoveredPassword(data.tempPassword);
        setCodeSent(true);
        setSimulatedMessage(`[رسالة واتساب استرجاع]: رمز التحقق الخاص بك لاسترجاع الحساب هو: ${data.code}`);
      } else {
        setError(data.error || "المعلومات المدخلة غير مطابقة لسجلاتنا. يرجى مراجعة الاسم ورقم الهاتف.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء محاولة الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchCode = () => {
    if (enteredCode === sentCode) {
      setVerified(true);
      setError("");
    } else {
      setError("رمز التحقق غير متطابق. الرجاء إدخال الرمز الصحيح المرسل للواتساب.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
        <div className="bg-[#3182CE] h-1.5 w-full" />

        <div className="pt-8 px-8 text-center">
          <h2 className="text-lg font-bold text-[#1A202C] tracking-tight">استرجاع الرقم السري</h2>
          <p className="mt-1 text-[#718096] text-xs">
            قم بالتحقق من هويتك لاستظهار الرقم السري المسجل
          </p>
        </div>

        <div className="p-8 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-[#C53030] text-xs rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!verified ? (
            !codeSent ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A5568]">اسم المستخدم *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                      placeholder="أدخل اسم المستخدم بالكامل"
                      className="w-full pr-8 pl-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE]"
                      required
                    />
                    <User className="w-4 h-4 absolute top-2.5 right-3 text-[#A0AEC0]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A5568]">رقم الهاتف المسجل *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="077XXXXXXXX"
                      className="w-full pr-8 pl-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#3182CE] font-mono"
                      required
                    />
                    <Phone className="w-4 h-4 absolute top-2.5 right-3 text-[#A0AEC0]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-70 cursor-pointer"
                >
                  {loading ? "جاري البحث عن حسابك..." : "طلب رمز استرداد الرقم السري"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {simulatedMessage && (
                  <div className="p-3 bg-[#EBF8FF] text-[#1A365D] border border-[#BEE3F8] rounded-lg text-xs leading-relaxed font-bold">
                    {simulatedMessage}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A5568]">أدخل رمز التحقق (المرسل إلى هاتف الواتساب) *</label>
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="رمز التحقق"
                    className="w-full text-center text-base font-bold py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg tracking-widest font-mono focus:outline-none focus:border-[#3182CE]"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleMatchCode}
                  className="w-full py-2 bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  تأكيد ومطابقة الرمز
                </button>
              </div>
            )
          ) : (
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center space-y-3">
              <div className="inline-flex p-2 bg-[#C6F6D5] text-[#22543D] rounded-full">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-bold text-[#1A202C] text-sm">تم التحقق من هويتك بنجاح!</h3>
              <p className="text-xs text-[#718096]">رقم السري الخاص بحسابك هو:</p>
              <div className="p-2.5 bg-white border border-green-200 rounded-lg font-mono text-lg font-bold tracking-wider text-[#1A202C] select-all">
                {recoveredPassword}
              </div>
              <p className="text-[10px] text-[#A0AEC0] leading-relaxed">
                يمكنك الآن نسخ هذا الرقم السري والعودة لتسجيل الدخول إلى حسابك بأمان.
              </p>
            </div>
          )}

          <div className="text-center pt-2">
            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-1.5 text-xs text-[#718096] hover:text-[#1A202C] transition-colors cursor-pointer font-bold"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لشاشة الدخول</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
