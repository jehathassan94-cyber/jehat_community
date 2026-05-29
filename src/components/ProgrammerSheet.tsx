import React, { useState, useEffect } from "react";
import { Table, Server, RefreshCw, Download, FileSpreadsheet, Sparkles, X, Database } from "lucide-react";
import { SyncLog, User } from "../types";

interface ProgrammerSheetProps {
  onBackToApp: () => void;
}

export default function ProgrammerSheet({ onBackToApp }: ProgrammerSheetProps) {
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sync-logs");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setSyncLogs(data.logs || []);
        setLastSync(new Date().toLocaleTimeString("ar-EG"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh database logs automatically every 5 seconds for a true "live-sync" simulation!
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadCSV = () => {
    window.open("/api/export-csv", "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1A202C] p-4 md:p-6 lg:p-8 flex flex-col font-sans">
      {/* Header Panel */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs mb-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 bg-[#EBF8FF] text-[#2B6CB0] text-[10px] font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5 border-l border-b border-[#BEE3F8]">
          <span className="w-2 h-2 bg-[#3182CE] rounded-full animate-pulse" />
          مزامنة تلقائية فائقة الموثوقية بـ Google Sheets
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4 text-right">
            <div className="p-3 bg-[#EBF8FF] rounded-xl text-[#3182CE] border border-[#BEE3F8]">
              <FileSpreadsheet className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2 text-[#1A202C]">
                لوحة تحكم شيت المبرمج وقاعدة البيانات
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h1>
              <p className="text-xs text-[#718096] mt-1">
                البريد الإلكتروني الأساسي للمبرمج:{" "}
                <span className="font-mono text-[#2B6CB0] font-bold bg-[#EBF8FF] px-2 py-0.5 rounded border border-[#BEE3F8] select-all">
                  jehat.hassan91@gmail.com
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 bg-[#2F855A] hover:bg-[#22543D] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              تنزيل شيت Excel (CSV) الحالي
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center justify-center p-2.5 bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#4A5568] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#3182CE]" : ""}`} />
            </button>

            <button
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 bg-[#C53030] hover:bg-[#9B2C2C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              إغلاق اللوحة والعودة
            </button>
          </div>
        </div>

        {/* Quick analytics counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E2E8F0]">
          <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#E2E8F0] text-center">
            <span className="text-[10px] text-[#718096] block font-semibold">عدد الحسابات الكلي</span>
            <span className="text-base font-bold font-mono text-[#2B6CB0] mt-0.5 block">{users.length}</span>
          </div>
          <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#E2E8F0] text-center">
            <span className="text-[10px] text-[#718096] block font-semibold">أطباء مسجلين</span>
            <span className="text-base font-bold font-mono text-[#2F855A] mt-0.5 block">
              {users.filter(u => u.role === "doctor").length}
            </span>
          </div>
          <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#E2E8F0] text-center">
            <span className="text-[10px] text-[#718096] block font-semibold">سكرتارية طاقية</span>
            <span className="text-base font-bold font-mono text-amber-600 mt-0.5 block">
              {users.filter(u => u.role === "secretary").length}
            </span>
          </div>
          <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#E2E8F0] text-center">
            <span className="text-[10px] text-[#718096] block font-semibold">آخر مزامنة لقاعدة البيانات</span>
            <span className="text-xs font-bold font-mono text-[#3182CE] mt-0.5 block">{lastSync || "بانتظار الإشارة..."}</span>
          </div>
        </div>
      </div>

      {/* Database Sheet Simulator */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col flex-1 shadow-xs">
        {/* Navigation tabs mimicking Excel sheet tabs */}
        <div className="bg-[#F7FAFC] border-b border-[#E2E8F0] flex items-center justify-between px-6 py-2 shrink-0">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === "users"
                  ? "border-[#3182CE] text-[#3182CE]"
                  : "border-transparent text-[#718096] hover:text-[#1A202C]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              جدول حسابات المستخدمين الرئیسیة
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === "logs"
                  ? "border-[#2F855A] text-[#2F855A]"
                  : "border-transparent text-[#718096] hover:text-[#1A202C]"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              سجل العمليات المتزامنة الفوري
            </button>
          </div>
          <span className="text-[10px] font-mono text-[#A0AEC0]">
            تنسيق المظهر: مبرمج خارجي نشط
          </span>
        </div>

        {/* Tab content area */}
        <div className="overflow-auto flex-1 custom-scrollbar min-h-[300px]">
          {activeTab === "users" ? (
            <div className="p-4">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#718096] text-[10px] font-bold tracking-wider">
                    <th className="pb-3 px-3">رقم ID</th>
                    <th className="pb-3 px-3">الاسم الأول</th>
                    <th className="pb-3 px-3">الاسم الثاني</th>
                    <th className="pb-3 px-3">اسم المستخدم (Username)</th>
                    <th className="pb-3 px-3 text-amber-600">كلمة المرور (Password)</th>
                    <th className="pb-3 px-3">رقم الهاتف</th>
                    <th className="pb-3 px-3">البريد الإلكتروني</th>
                    <th className="pb-3 px-3">الدور/الصالحية</th>
                    <th className="pb-3 px-3">اسم الطبيب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#4A5568]">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-[#A0AEC0] font-semibold">
                        لا يوجد أي مستخدم مسجل حالياً في قاعدة البيانات.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F7FAFC] transition-colors">
                        <td className="py-3 px-3 font-mono text-[10px] text-[#718096] select-all">{item.id}</td>
                        <td className="py-3 px-3 font-semibold text-[#1A202C]">{item.firstName}</td>
                        <td className="py-3 px-3 text-[#4A5568]">{item.lastName}</td>
                        <td className="py-3 px-3 font-mono text-semibold text-[#2980B9]">{item.username}</td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-700 select-all bg-amber-50 px-2 rounded">
                          {item.passwordHash}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#4A5568]">{item.phone}</td>
                        <td className="py-3 px-3 font-mono text-[#2B6CB0]">{item.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.role === "doctor"
                                ? "bg-[#E6FFFA] text-[#319795] border border-[#B2F5EA]"
                                : item.role === "secretary"
                                ? "bg-[#EBF8FF] text-[#2B6CB0] border border-[#BEE3F8]"
                                : "bg-[#EDF2F7] text-[#4A5568] border border-[#E2E8F0]"
                            }`}
                          >
                            {item.role === "doctor" ? "طبيب" : item.role === "secretary" ? "سكرتير" : "مستخدم عام"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#718096]">{item.doctorName || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#718096] text-[10px] font-bold">
                    <th className="pb-3 px-3">المعرف الفريد</th>
                    <th className="pb-3 px-3">توقيت العملية</th>
                    <th className="pb-3 px-3">نوع النشاط</th>
                    <th className="pb-3 px-3">الحساب المتـزامن</th>
                    <th className="pb-3 px-3">تفاصيل المزامنة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#4A5568]">
                  {syncLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-[#A0AEC0]">
                        لا توجد عمليات مسجلة حالياً في السجل الفوري.
                      </td>
                    </tr>
                  ) : (
                    [...syncLogs].reverse().map((log) => (
                      <tr key={log.id} className="hover:bg-[#F7FAFC] transition-colors">
                        <td className="py-3 px-3 font-mono text-[10px] text-[#718096]">{log.id}</td>
                        <td className="py-3 px-3 font-mono text-[#718096] text-[10px]">
                          {new Date(log.timestamp).toLocaleString("ar-EG")}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action.includes("إنشاء")
                                ? "bg-[#E6FFFA] text-[#319795]"
                                : log.action.includes("حذف") || log.action.includes("مسح")
                                ? "bg-[#FFF5F5] text-[#C53030]"
                                : log.action.includes("تعديل")
                                ? "bg-[#FEFCBF] text-[#B7791F]"
                                : "bg-[#EBF8FF] text-[#2B6CB0]"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#2B6CB0]">{log.emailAffected}</td>
                        <td className="py-3 px-3 text-[#4A5568]">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
