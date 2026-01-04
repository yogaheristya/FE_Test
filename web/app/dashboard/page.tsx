"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/ruas?show=active_only");

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        console.error("Gagal mengambil data ruas aktif");
        return;
      }

      const json = await res.json();
      setData(json.data ?? []);
    };

    load();
  }, [router]);

  return <MapView data={data} />;
}
