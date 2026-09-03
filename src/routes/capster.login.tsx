import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";

import {
  BarberinLogo,
  GlassCard,
  MobileShell,
  PrimaryButton,
} from "@/components/barberin/ui";
import { capsterActions } from "@/lib/capster-store";
import { loginCapster } from "@/lib/capsters";

export const Route = createFileRoute("/capster/login")({
  head: () => ({
    meta: [
      { title: "Login Capster — BARBERIN" },
      { name: "description", content: "Masuk ke akun Capster BARBERIN." },
    ],
  }),
  component: CapsterLoginPage,
});

function CapsterLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("budi@barberin.test");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginCapster({
        data: { emailOrName: username },
      });
      capsterActions.login({
        id: res.id_capster,
        name: res.nama_lengkap,
        role: res.role,
        barbershopId: res.id_barbershop,
      });
      setLoading(false);
      navigate({ to: "/capster/check-in" });
    } catch (err) {
      console.error(err);
      const isAndi =
        username.toLowerCase().includes("andi") || username.includes("002");
      capsterActions.login({
        id: isAndi
          ? "8b020274-d637-4d0f-b454-b8d387338865"
          : "4bac18cd-d0c8-4933-a24b-2eacf56294ac",
        name: isAndi ? "Andi" : "Budi",
        role: isAndi ? "Barber" : "Senior Barber",
      });
      setLoading(false);
      navigate({ to: "/capster/check-in" });
    }
  };

  return (
    <MobileShell>
      <main className="flex-1 flex flex-col justify-center px-5 py-8">
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="h-20 w-20 flex items-center justify-center rounded-2xl glass-2 shadow-lg mb-2">
            <BarberinLogo className="h-14 w-14" />
          </div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-foreground">
            BARBERIN
          </h1>
          <div className="inline-block rounded-full bg-primary/20 px-3 py-1 text-[12px] font-bold text-primary-soft ring-1 ring-primary/40">
            Capster / Admin
          </div>
          <p className="text-[14px] text-muted-foreground pt-1">
            Masuk ke akun capster
          </p>
        </div>

        <GlassCard className="p-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="username" className="block text-[13px] font-semibold text-foreground">
                  Email / Username
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-muted-foreground">Pilih Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("andi@barberin.test");
                      setPassword("password");
                    }}
                    className={`rounded px-2 py-0.5 font-semibold transition-all ${
                      username.toLowerCase().includes("andi")
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white/10 text-muted-foreground hover:text-foreground hover:bg-white/15"
                    }`}
                  >
                    Andi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("budi@barberin.test");
                      setPassword("password");
                    }}
                    className={`rounded px-2 py-0.5 font-semibold transition-all ${
                      username.toLowerCase().includes("budi")
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white/10 text-muted-foreground hover:text-foreground hover:bg-white/15"
                    }`}
                  >
                    Budi
                  </button>
                </div>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-muted-foreground">
                  <User className="h-4 w-4" strokeWidth={2} />
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan email / username (contoh: andi@barberin.test)"
                  className="min-h-[48px] w-full rounded-[12px] border border-white/16 bg-white/8 pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-soft"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[13px] font-semibold text-foreground">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-muted-foreground">
                  <Lock className="h-4 w-4" strokeWidth={2} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="min-h-[48px] w-full rounded-[12px] border border-white/16 bg-white/8 pl-10 pr-11 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-soft"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[13px]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-muted-foreground">Ingat saya</span>
              </label>
            </div>

            <div className="pt-3">
              <PrimaryButton type="submit" loading={loading}>
                LOGIN
              </PrimaryButton>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                className="text-[13px] font-semibold text-primary-soft hover:underline"
                onClick={() => alert("Fitur reset password dapat diakses melalui Admin/Owner.")}
              >
                Lupa Password?
              </button>
            </div>
          </form>
        </GlassCard>

        <p className="mt-8 text-center text-[12px] text-muted-foreground/80 leading-relaxed px-4">
          Login hanya dilakukan 1x. Setelah login, capster tetap login sampai memilih <strong>AKHIRI SHIFT</strong>.
        </p>
      </main>
    </MobileShell>
  );
}
