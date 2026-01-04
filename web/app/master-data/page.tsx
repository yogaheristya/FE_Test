import { redirect } from "next/navigation";
import { getRuasServer } from "@/lib/api/ruas.server";
import RuasTable from "./RuasTable";

export default async function MasterDataPage() {
  const res = await getRuasServer(1);

  // 🔥 INI KUNCI NYA
  if (res.status === 401) {
    redirect("/login");
  }

  return (
    <RuasTable
      initialData={res.data ?? []}
      initialPage={res.current_page}
      initialLastPage={res.last_page}
      initialError={!res.success ? res.message : null}
    />
  );
}
