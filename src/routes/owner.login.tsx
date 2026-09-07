import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Scissors, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { loginOwner } from "@/lib/owner";
import { ownerActions, useOwner } from "@/lib/owner-store";

export const Route = createFileRoute("/owner/login")({
  head: () => ({
    meta: [
      { title: "Login Owner — BARBERIN" },
      { name: "description", content: "Masuk ke Dashboard Manajemen Owner BARBERIN." },
    ],
  }),
  component: OwnerLoginPage,
});

function OwnerLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("owner@barberin.test");
  const [password, setPassword] = useState("owner123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginOwner({
        data: {
          email,
          password,
        },
      });

      ownerActions.login({
        id_user: res.id_user,
        email: res.email,
        nama_lengkap: res.nama_lengkap,
        role: res.role,
        barbershopName: res.barbershop.nama_barbershop,
      });

      toast.success("Login Berhasil", {
        description: `Selamat datang kembali, ${res.nama_lengkap}!`,
      });
      navigate({ to: "/owner/dashboard", replace: true });
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Email atau password salah.";
      setError(msg);
      toast.error("Gagal Masuk", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    ownerActions.login({
      id_user: "demo-owner",
      email: "owner@barberin.test",
      nama_lengkap: "Owner Barbershop",
      role: "owner",
      barbershopName: "BARBERIN Headquarter",
    });
    toast.success("Masuk sebagai Demo Owner");
    navigate({ to: "/owner/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-[#070D18] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-[#0F1D33] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/25 mb-4">
            <Scissors className="h-7 w-7 rotate-90" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">BARBERIN</h1>
          <p className="text-xs text-slate-400 mt-1">Owner Management System</p>
          <div className="mt-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-400">
            Portal Pemilik Barbershop
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Owner
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@barberin.test"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14233D] text-sm text-white placeholder-slate-500 border border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#14233D] text-sm text-white placeholder-slate-500 border border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Button */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center relative z-10">
          <p className="text-xs text-slate-400 mb-2.5">Atau akses cepat untuk pengujian:</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
          >
            ⚡ Masuk Cepat sebagai Demo Owner
          </button>
        </div>
      </div>
    </div>
  );
}
