import { createFileRoute } from "@tanstack/react-router";
import { Settings, Store, Clock, Phone, MapPin } from "lucide-react";

import {
  OwnerSidebar,
  OwnerHeader,
  OwnerMobileHeader,
  OwnerBottomNav,
} from "@/components/owner/ui";
import { useOwner } from "@/lib/owner-store";

export const Route = createFileRoute("/owner/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan Barbershop — BARBERIN Owner" },
      { name: "description", content: "Pengaturan profil outlet dan preferensi operasional." },
    ],
  }),
  component: OwnerSettingsPage,
});

function OwnerSettingsPage() {
  const { user } = useOwner();

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row antialiased">
      <OwnerSidebar activePath="/owner/settings" />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerMobileHeader activePath="/owner/settings" />
        <OwnerHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12 max-w-[1600px] w-full mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Setelan Operasional
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Konfigurasi profil barbershop, jam operasional, dan akun owner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Profil Barbershop</h3>
                  <p className="text-xs text-slate-400">Informasi toko yang terlihat oleh pelanggan</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Nama Barbershop</label>
                  <input
                    type="text"
                    disabled
                    value={user.barbershopName}
                    className="w-full px-3.5 py-2.5 bg-[#14233D] border border-slate-700/80 rounded-xl text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Alamat Outlet</label>
                  <input
                    type="text"
                    disabled
                    value="Jl. Jenderal Soedirman No. 123, Purbalingga"
                    className="w-full px-3.5 py-2.5 bg-[#14233D] border border-slate-700/80 rounded-xl text-white font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Jam Buka</label>
                    <input
                      type="text"
                      disabled
                      value="08:00 WIB"
                      className="w-full px-3.5 py-2 bg-[#14233D] border border-slate-700/80 rounded-xl text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Jam Tutup</label>
                    <input
                      type="text"
                      disabled
                      value="21:00 WIB"
                      className="w-full px-3.5 py-2 bg-[#14233D] border border-slate-700/80 rounded-xl text-white font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Akun Pemilik (Owner)</h3>
                  <p className="text-xs text-slate-400">Kredensial dan hak akses utama</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    disabled
                    value={user.nama_lengkap}
                    className="w-full px-3.5 py-2.5 bg-[#14233D] border border-slate-700/80 rounded-xl text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email</label>
                  <input
                    type="text"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 bg-[#14233D] border border-slate-700/80 rounded-xl text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Peran Sistem</label>
                  <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-semibold uppercase tracking-wider text-[11px]">
                    OWNER (PENGELOLA)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <OwnerBottomNav activePath="/owner/settings" />
      </div>
    </div>
  );
}
