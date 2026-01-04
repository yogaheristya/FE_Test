"use client";

import { useEffect, useState } from "react";
import { getUnitClient } from "@/lib/api/unit.client";

/* ================= TYPES ================= */
interface Unit {
  id: number;
  unit: string;
}

export interface RuasForm {
  unit_id: number | "";
  ruas_name: string;
  long: string;
  km_awal: string;
  km_akhir: string;
  status: string;
  coordinates: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData?: Partial<RuasForm> | null;
}

/* ================= CONST ================= */
const EMPTY_FORM: RuasForm = {
  unit_id: "",
  ruas_name: "",
  long: "",
  km_awal: "",
  km_akhir: "",
  status: "1",
  coordinates: [""],
};

/* ================= COMPONENT ================= */
export default function RuasModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState<RuasForm>(EMPTY_FORM);

  /* ================= GET UNIT ================= */
  useEffect(() => {
    if (!open) return;

    getUnitClient().then((res) => {
      if (res.success) {
        setUnits(res.data);
      }
    });
  }, [open]);

  /* ================= ADD / EDIT MODE ================= */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        coordinates:
          initialData.coordinates && initialData.coordinates.length > 0
            ? initialData.coordinates
            : [""],
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, initialData]);

  if (!open) return null;

  /* ================= COORDINATES ================= */
  const updateCoordinate = (index: number, value: string) => {
    const next = [...form.coordinates];
    next[index] = value;
    setForm({ ...form, coordinates: next });
  };

  const addCoordinate = () => {
    setForm({ ...form, coordinates: [...form.coordinates, ""] });
  };

  const removeCoordinate = (index: number) => {
    const next = form.coordinates.filter((_, i) => i !== index);
    setForm({
      ...form,
      coordinates: next.length > 0 ? next : [""],
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    const fd = new FormData();

    fd.append("unit_id", String(form.unit_id));
    fd.append("ruas_name", form.ruas_name);
    fd.append("long", form.long);
    fd.append("km_awal", form.km_awal);
    fd.append("km_akhir", form.km_akhir);
    fd.append("status", form.status);

    form.coordinates
      .filter((c) => c.trim() !== "")
      .forEach((c) => fd.append("coordinates[]", c));

    onSubmit(fd);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {initialData ? "Edit Ruas" : "Tambah Ruas"}
        </h2>

        <div className="space-y-3">
          {/* Unit Kerja */}
          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-gray-600">Unit Kerja</label>
            <select
              className="col-span-3 border rounded px-3 py-2 text-sm"
              value={form.unit_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  unit_id: e.target.value ? Number(e.target.value) : "",
                })
              }
            >
              <option value="">-- Pilih Unit Kerja --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Ruas */}
          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-gray-600">Nama Ruas</label>
            <input
              className="col-span-3 border rounded px-3 py-2 text-sm"
              value={form.ruas_name}
              onChange={(e) => setForm({ ...form, ruas_name: e.target.value })}
            />
          </div>

          {/* Panjang */}
          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-gray-600">Panjang (km)</label>
            <input
              type="number"
              className="col-span-3 border rounded px-3 py-2 text-sm"
              value={form.long}
              onChange={(e) => setForm({ ...form, long: e.target.value })}
            />
          </div>

          {/* KM Awal */}
          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-gray-600">KM Awal</label>
            <input
              className="col-span-3 border rounded px-3 py-2 text-sm"
              placeholder="contoh: 2+000"
              value={form.km_awal}
              onChange={(e) => setForm({ ...form, km_awal: e.target.value })}
            />
          </div>

          {/* KM Akhir */}
          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-gray-600">KM Akhir</label>
            <input
              className="col-span-3 border rounded px-3 py-2 text-sm"
              placeholder="contoh: 96+000"
              value={form.km_akhir}
              onChange={(e) => setForm({ ...form, km_akhir: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-gray-600">Status</label>
            <select
              className="col-span-3 border rounded px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="1">Aktif</option>
              <option value="0">Tidak Aktif</option>
            </select>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-4 gap-3">
            <label className="text-sm text-gray-600 pt-2">Coordinates</label>

            <div className="col-span-3 space-y-2">
              {form.coordinates.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 border rounded px-3 py-2 text-sm"
                    placeholder="-6.24748,106.88046"
                    value={c}
                    onChange={(e) => updateCoordinate(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeCoordinate(i)}
                    className="border px-3 rounded text-sm"
                  >
                    -
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCoordinate}
                className="text-sm text-blue-600"
              >
                + Tambah Coordinate
              </button>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={handleClose} className="border px-4 py-2 rounded">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
