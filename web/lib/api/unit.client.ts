export async function getUnitClient() {
  const res = await fetch("/api/unit");

  if (!res.ok) {
    return { success: false, data: [] };
  }

  const json = await res.json();
  return { success: true, data: json.data };
}
