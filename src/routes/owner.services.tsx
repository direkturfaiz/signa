import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Scissors,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  OwnerSidebar,
  OwnerHeader,
  OwnerMobileHeader,
  OwnerBottomNav,
} from "@/components/owner/ui";
import { formatRupiah } from "@/lib/format";
import {
  getOwnerServices,
  createOwnerService,
  updateOwnerService,
  deleteOwnerService,
  toggleOwnerServiceStatus,
  type OwnerServiceItem,
} from "@/lib/services";

export const Route = createFileRoute("/owner/services")({
  head: () => ({
    meta: [
      { title: "Manajemen Layanan — BARBERIN Owner" },
      { name: "description", content: "Kelola katalog menu, tarif, dan durasi layanan barbershop." },
    ],
  }),
  component: OwnerServicesPage,
});

function OwnerServicesPage() {
  const [services, setServices] = useState<OwnerServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<OwnerServiceItem | null>(null);
  const [deletingService, setDeletingService] = useState<OwnerServiceItem | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDuration, setFormDuration] = useState(30);
  const [formPrice, setFormPrice] = useState(30000);
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [submitting, setSubmitting] = useState(false);

  // Load services
  const loadServices = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getOwnerServices();
      setServices(res);
    } catch (err: any) {
      console.error("Gagal memuat layanan:", err);
      toast.error(err?.message || "Gagal memuat daftar layanan");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        s.nama_layanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.deskripsi && s.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.status === "active") ||
        (statusFilter === "inactive" && s.status === "inactive");

      return matchSearch && matchStatus;
    });
  }, [services, searchQuery, statusFilter]);

  const activeCount = useMemo(
    () => services.filter((s) => s.status === "active").length,
    [services],
  );
  const inactiveCount = useMemo(
    () => services.filter((s) => s.status === "inactive").length,
    [services],
  );

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormName("");
    setFormDesc("");
    setFormDuration(30);
    setFormPrice(30000);
    setFormStatus("active");
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (service: OwnerServiceItem) => {
    setEditingService(service);
    setFormName(service.nama_layanan);
    setFormDesc(service.deskripsi || "");
    setFormDuration(service.durasi_menit);
    setFormPrice(service.harga);
    setFormStatus(service.status);
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Nama layanan wajib diisi.");
      return;
    }
    if (formPrice < 0) {
      toast.error("Tarif tidak boleh negatif.");
      return;
    }
    if (formDuration <= 0) {
      toast.error("Durasi harus lebih dari 0 menit.");
      return;
    }

    setSubmitting(true);
    try {
      await createOwnerService({
        data: {
          nama_layanan: formName.trim(),
          deskripsi: formDesc.trim() || undefined,
          durasi_menit: Number(formDuration),
          harga: Number(formPrice),
          status: formStatus,
        },
      });
      toast.success("Layanan baru berhasil ditambahkan!");
      setIsCreateModalOpen(false);
      await loadServices(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menambahkan layanan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    if (!formName.trim()) {
      toast.error("Nama layanan wajib diisi.");
      return;
    }
    if (formPrice < 0) {
      toast.error("Tarif tidak boleh negatif.");
      return;
    }
    if (formDuration <= 0) {
      toast.error("Durasi harus lebih dari 0 menit.");
      return;
    }

    setSubmitting(true);
    try {
      await updateOwnerService({
        data: {
          id_layanan: editingService.id_layanan,
          nama_layanan: formName.trim(),
          deskripsi: formDesc.trim() || undefined,
          durasi_menit: Number(formDuration),
          harga: Number(formPrice),
          status: formStatus,
        },
      });
      toast.success("Layanan berhasil diperbarui!");
      setEditingService(null);
      await loadServices(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui layanan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (service: OwnerServiceItem) => {
    try {
      const res = await toggleOwnerServiceStatus({
        data: { id_layanan: service.id_layanan },
      });
      toast.success(res.message);
      await loadServices(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengubah status layanan.");
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingService) return;
    setSubmitting(true);
    try {
      const res = await deleteOwnerService({
        data: { id_layanan: deletingService.id_layanan },
      });
      toast.success(res.message);
      setDeletingService(null);
      await loadServices(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus layanan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row antialiased">
      <OwnerSidebar activePath="/owner/services" />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerMobileHeader activePath="/owner/services" />
        <OwnerHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12 max-w-[1600px] w-full mx-auto">
          {/* Top Title & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Manajemen Layanan
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Katalog menu, tarif dinamis, dan estimasi waktu pengerjaan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-all self-start sm:self-auto shadow-lg shadow-blue-600/25 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Layanan</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[#0F1D33] border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari layanan berdasarkan nama atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070D18] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills & Refresh */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-[#070D18] text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Semua ({services.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === "active"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-[#070D18] text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Aktif ({activeCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === "inactive"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "bg-[#070D18] text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span>Nonaktif ({inactiveCount})</span>
              </button>
              <button
                type="button"
                onClick={() => loadServices(true)}
                title="Muat Ulang Data"
                className="p-2 bg-[#070D18] hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-[#0F1D33]/60 rounded-2xl border border-slate-800"
                />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="bg-[#0F1D33] border border-slate-800 rounded-2xl p-12 text-center">
              <Scissors className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">Tidak ada layanan ditemukan</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada layanan yang cocok dengan kata kunci "${searchQuery}".`
                  : "Belum ada layanan yang ditambahkan. Silakan klik tombol 'Tambah Layanan' untuk membuat menu baru."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-colors"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((s) => {
                const isActive = s.status === "active";
                return (
                  <div
                    key={s.id_layanan}
                    className={`bg-[#0F1D33] border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm ${
                      isActive
                        ? "border-slate-800/80 hover:border-slate-700"
                        : "border-slate-800/40 opacity-75 hover:opacity-100 bg-[#0c172a]"
                    }`}
                  >
                    <div>
                      {/* Top row: Icon, Status Badge & Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? "bg-blue-600/20 text-blue-400"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          <Scissors className="h-4 w-4 rotate-90" />
                        </div>

                        {/* Status badge & Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Status Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(s)}
                            title={
                              isActive
                                ? "Klik untuk menonaktifkan"
                                : "Klik untuk mengaktifkan"
                            }
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              isActive
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25"
                                : "bg-slate-700/40 text-slate-400 border border-slate-700 hover:bg-slate-700/60"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span>Aktif</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-slate-400" />
                                <span>Nonaktif</span>
                              </>
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(s)}
                            title="Edit Layanan"
                            className="p-1.5 rounded-lg bg-[#070D18] hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-slate-800 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingService(s)}
                            title="Hapus Layanan"
                            className="p-1.5 rounded-lg bg-[#070D18] hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Service Name & Description */}
                      <div className="mt-3">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {s.nama_layanan}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {s.deskripsi || "Layanan potong dan perawatan rambut profesional."}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Duration, Usage, & Price */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span>{s.durasi_menit || 30} menit</span>
                        </div>
                        {s.usageCount > 0 && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
                            {s.usageCount}x dipesan
                          </span>
                        )}
                      </div>

                      <div className="text-base font-bold text-emerald-400">
                        {formatRupiah(s.harga || 0)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <OwnerBottomNav activePath="/owner/services" />
      </div>

      {/* ================= MODAL: TAMBAH LAYANAN ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1D33] border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tambah Layanan Baru</h3>
                  <p className="text-xs text-slate-400">
                    Katalog menu, tarif dinamis, dan estimasi waktu.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Layanan <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Premium Hair Wash & Creambath"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#070D18] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deskripsi Layanan
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan rincian layanan atau produk yang digunakan..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#070D18] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Durasi (Menit) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={5}
                      step={5}
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full bg-[#070D18] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      menit
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tarif (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#070D18] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-emerald-400 mt-1 font-medium">
                    Preview: {formatRupiah(formPrice || 0)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status Layanan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus("active")}
                    className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      formStatus === "active"
                        ? "bg-emerald-600/25 border border-emerald-500/50 text-emerald-300 font-semibold"
                        : "bg-[#070D18] border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Aktif</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus("inactive")}
                    className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      formStatus === "inactive"
                        ? "bg-slate-700/50 border border-slate-600 text-slate-300 font-semibold"
                        : "bg-[#070D18] border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5 text-slate-400" />
                    <span>Nonaktif</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-600/25 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{submitting ? "Menyimpan..." : "Simpan Layanan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT LAYANAN ================= */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1D33] border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Edit Layanan</h3>
                  <p className="text-xs text-slate-400">
                    Perbarui nama, tarif, durasi, atau status layanan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setEditingService(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Layanan <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#070D18] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deskripsi Layanan
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#070D18] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Durasi (Menit) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={5}
                      step={5}
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full bg-[#070D18] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      menit
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tarif (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#070D18] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-emerald-400 mt-1 font-medium">
                    Preview: {formatRupiah(formPrice || 0)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status Layanan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus("active")}
                    className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      formStatus === "active"
                        ? "bg-emerald-600/25 border border-emerald-500/50 text-emerald-300 font-semibold"
                        : "bg-[#070D18] border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Aktif</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus("inactive")}
                    className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      formStatus === "inactive"
                        ? "bg-slate-700/50 border border-slate-600 text-slate-300 font-semibold"
                        : "bg-[#070D18] border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5 text-slate-400" />
                    <span>Nonaktif</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-600/25 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{submitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS ================= */}
      {deletingService && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1D33] border border-rose-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hapus Layanan?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus layanan{" "}
                  <strong className="text-white">"{deletingService.nama_layanan}"</strong>?
                </p>
                <p className="text-[11px] text-amber-400/90 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 leading-relaxed">
                  ⚠️ Jika layanan ini memiliki riwayat transaksi/booking sebelumnya, sistem
                  akan otomatis menonaktifkannya agar catatan keuangan historis tetap aman.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setDeletingService(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteConfirm}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-md shadow-rose-600/25 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{submitting ? "Memproses..." : "Ya, Hapus Layanan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

