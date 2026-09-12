import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { BarberinLogo } from "@/components/barberin/ui";

import { loginSuperadmin } from "@/lib/superadmin";
import { getSuperadminAuth, superadminActions, useSuperadmin } from "@/lib/superadmin-store";

export const Route = createFileRoute("/superadmin/login")({
  head: () => ({
    meta: [
      { title: "Login Superadmin — BARBERIN Admin Platform" },
      {
        name: "description",
        content: "Masuk ke panel administrasi platform BARBERIN.",
      },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && getSuperadminAuth()) {
      throw redirect({ to: "/superadmin/tenants" });
    }
  },
  component: SuperadminLoginPage,
});

function SuperadminLoginPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSuperadmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Jika sudah login, alihkan langsung ke dashboard
  useEffect(() => {
    if (isLoggedIn || (typeof window !== "undefined" && getSuperadminAuth())) {
      navigate({ to: "/superadmin/tenants", replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn || (typeof window !== "undefined" && getSuperadminAuth())) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginSuperadmin({
        data: {
          email,
          password,
        },
      });

      superadminActions.login({
        id_user: res.id_user,
        email: res.email,
        nama_lengkap: res.nama_lengkap,
        role: res.role,
      });

      toast.success("Login Berhasil", {
        description: `Selamat datang di Admin Platform BARBERIN, ${res.nama_lengkap}!`,
      });

      navigate({ to: "/superadmin/tenants", replace: true });
    } catch (err: any) {
      console.error(err);
      let msg = err?.message || "Email atau password salah.";
      if (
        msg.includes("Failed query") ||
        msg.includes("CONNECT_TIMEOUT") ||
        msg.includes("fetch failed") ||
        msg.includes("ETIMEDOUT")
      ) {
        msg = "Gagal terhubung ke server database. Periksa koneksi internet Anda.";
      }
      setError(msg);
      toast.error("Gagal Masuk", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] flex items-center justify-center p-4 antialiased selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md bg-[#0F1D33] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7 relative z-10">
          <BarberinLogo className="h-16 w-16 mb-4 drop-shadow-xl" />
          <h1 className="text-2xl font-black text-white tracking-wider">
            BARBERIN
          </h1>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Platform / Superadmin</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Panel Administrasi & Manajemen Seluruh Barbershop
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Superadmin
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@barberin.test"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Memverifikasi Akses...</span>
            ) : (
              <>
                <span>Masuk ke Admin Platform</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400">
            Kredensial Superadmin Platform:
          </p>
          <div className="mt-1.5 inline-block bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-blue-400">
            superadmin@barberin.test / superadmin123
          </div>
        </div>
      </div>
    </div>
  );
}
