import React, { useState } from "react";
import { Lock, User, AlertCircle, Eye, EyeOff, Sparkles, Milestone } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
}

export default function Login({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgot,
}: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "فشل تسجيل الدخول. يرجى التحقق من المدخلات.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم. حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4 py-12 md:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
        {/* Top visual accent */}
        <div className="bg-[#3182CE] h-1.5 w-full" />

        {/* Header container */}
        <div className="pt-8 px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-[#EBF8FF] text-[#3182CE] rounded-xl mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1A202C] tracking-tight">
            مجتمع العيادات الطبية
          </h2>
          <p className="mt-1 text-[#718096] text-xs">
            بوابة دخول الأطباء والكوادر الطبية المساعدة
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 text-[#C53030] text-xs rounded-lg border border-red-100 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#4A5568]">
              اسم المستخدم <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#A0AEC0]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                placeholder="أدخل اسم المستخدم (بدون مسافات)"
                className="block w-full pr-10 pl-4 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 placeholder-[#A0AEC0] focus:outline-none focus:border-[#3182CE] text-xs font-medium animate-none"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-[#4A5568]">
                الرقم السري (كلمة المرور) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={onNavigateToForgot}
                className="text-xs text-[#2B6CB0] hover:text-[#2C5282] font-semibold transition-colors cursor-pointer"
              >
                نسيت الرقم السري؟
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#A0AEC0]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل الرقم السري"
                className="block w-full pr-10 pl-9 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 placeholder-[#A0AEC0] focus:outline-none focus:border-[#3182CE] text-xs font-medium animate-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A0AEC0] hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </div>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        {/* Bottom options */}
        <div className="px-8 pb-8 text-center border-t border-[#E2E8F0] pt-6 bg-slate-50/50 space-y-4">
          <p className="text-xs text-[#4A5568]">
            ليس لديك حساب بالفعل؟{" "}
            <button
              onClick={onNavigateToRegister}
              className="font-bold text-[#2B6CB0] hover:text-[#2C5282] transition-colors cursor-pointer"
            >
              إنشاء حساب جديد
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
