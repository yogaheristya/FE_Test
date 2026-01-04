"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import { getRuasClient, getRuasDetailClient } from "@/lib/api/ruas.client";
import RuasModal from "./RuasModal";

interface Ruas {
  id: number;
  ruas_name: string;
  unit_id: number;
  unit_kerja_name?: string;
  long?: number | string;
  km_awal?: string;
  km_akhir?: string;
  status: string;
  coordinates?: string[];
}

type RuasForm = {
  ruas_name?: string;
  unit_id?: number;
  long?: string;
  km_awal?: string;
  km_akhir?: string;
  status?: string;
  coordinates?: string[];
};

const mapRuasToForm = (ruas: Ruas): Partial<RuasForm> => ({
  ...ruas,
  long: ruas.long !== undefined ? String(ruas.long) : undefined,
});

interface Props {
  initialData: Ruas[];
  initialPage: number | string | null | undefined;
  initialLastPage: number | string | null | undefined;
  initialError?: string | null;
}

const toSafeNumber = (v: any, fallback = 1): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function RuasTable({
  initialData,
  initialPage,
  initialLastPage,
  initialError = null,
}: Props) {
  const router = useRouter();

  const [data, setData] = useState<Ruas[]>(initialData ?? []);
  const [page, setPage] = useState<number>(() => toSafeNumber(initialPage, 1));
  const [lastPage, setLastPage] = useState<number>(() =>
    toSafeNumber(initialLastPage, 1)
  );

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Ruas | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Ruas | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialError) toast.error(initialError);
  }, [initialError]);

  const loadPage = async (p: number) => {
    setLoading(true);

    const res: any = await getRuasClient(p);

    if (res?.status === 401) {
      router.push("/login");
      return;
    }

    if (!res.success) {
      toast.error(res.message || "Gagal mengambil data");
      setLoading(false);
      return;
    }

    setData(Array.isArray(res.data) ? res.data : []);
    setPage(toSafeNumber(res.current_page, 1));
    setLastPage(toSafeNumber(res.last_page, 1));
    setLoading(false);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const isEdit = Boolean(editingData?.id);
      const url = isEdit ? `/api/ruas/${editingData!.id}` : `/api/ruas`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        toast.error("Gagal menyimpan data");
        return;
      }

      toast.success(
        isEdit ? "Berhasil mengubah ruas" : "Berhasil menambah ruas",
        { duration: 2000 }
      );

      setModalOpen(false);
      setEditingData(null);
      loadPage(page);
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleEdit = async (item: Ruas) => {
    setLoading(true);

    const res: any = await getRuasDetailClient(item.id);

    setLoading(false);

    if (res?.status === 401) {
      router.push("/login");
      return;
    }

    if (!res.success) {
      toast.error("Gagal mengambil detail ruas");
      return;
    }

    setEditingData(res.data);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    const target = deleteTarget;
    const prevData = [...data];

    setData((prev) => prev.filter((d) => d.id !== target.id));
    setDeleteTarget(null);

    try {
      const res = await fetch(`/api/ruas/${target.id}`, {
        method: "DELETE",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error();

      toast.success("Ruas berhasil dihapus", { duration: 2000 });

      if (prevData.length === 1 && safePage > 1) {
        loadPage(safePage - 1);
      }
    } catch {
      setData(prevData);
      toast.error("Gagal menghapus ruas", { duration: 2500 });
    } finally {
      setDeleting(false);
    }
  };

  const safePage = useMemo(() => toSafeNumber(page, 1), [page]);
  const safeLastPage = useMemo(() => toSafeNumber(lastPage, 1), [lastPage]);

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Master Data Ruas</h1>

        <div className="flex items-center gap-2">
          <button className="p-2 border rounded hover:bg-gray-100">
            <FaSearch size={14} />
          </button>

          <button
            onClick={() => {
              setEditingData(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded text-sm"
          >
            <FaPlus size={12} />
            Tambah
          </button>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="border-r p-2 w-12 text-center">No</th>
              <th className="border-r p-2">Ruas</th>
              <th className="border-r p-2">Unit Kerja</th>
              <th className="border-r p-2 text-center">Status</th>
              <th className="p-2 text-center w-32">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="border-r p-2 text-center">
                    {(safePage - 1) * 5 + index + 1}
                  </td>
                  <td className="border-r p-2">{item.ruas_name}</td>
                  <td className="border-r p-2">
                    {item.unit_kerja_name ?? "-"}
                  </td>
                  <td className="border-r p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.status === "1"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status === "1" ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center gap-3">
                      <button
                        className="hover:text-blue-600"
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </button>
                      <button className="hover:text-gray-700">
                        <FaEye />
                      </button>
                      <button
                        className="hover:text-red-600"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4 text-sm">
        <div className="flex items-center gap-1">
          <button
            disabled={safePage <= 1}
            onClick={() => loadPage(safePage - 1)}
            className="border rounded px-2 py-1 disabled:opacity-50"
          >
            &lt;
          </button>

          <button className="border rounded px-3 py-1 bg-gray-200">
            {safePage}
          </button>

          <button
            disabled={safePage >= safeLastPage}
            onClick={() => loadPage(safePage + 1)}
            className="border rounded px-2 py-1 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      <RuasModal
        open={modalOpen}
        initialData={editingData ? mapRuasToForm(editingData) : undefined}
        onClose={() => {
          setModalOpen(false);
          setEditingData(null);
        }}
        onSubmit={handleSubmit}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded p-6 space-y-4">
            <h2 className="text-lg font-semibold text-red-600">Hapus Ruas</h2>

            <p className="text-sm text-gray-700">
              Yakin ingin menghapus ruas
              <span className="font-semibold"> {deleteTarget.ruas_name}</span>
              ?<br />
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-2 pt-4">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="border px-4 py-2 rounded"
              >
                Batal
              </button>

              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
