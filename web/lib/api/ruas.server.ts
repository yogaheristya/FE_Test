import { cookies } from "next/headers";

interface RuasServerResponse {
  success: boolean;
  status: number;
  message?: string;
  data: any[];
  current_page: number;
  last_page: number;
}

const API_URL = process.env.API_URL!;

export async function getRuasServer(
  page = 1,
  perPage = 5
): Promise<RuasServerResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return {
      success: false,
      status: 401,
      message: "Unauthorized",
      data: [],
      current_page: page,
      last_page: page,
    };
  }

  const res = await fetch(`${API_URL}/ruas?page=${page}&per_page=${perPage}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    return {
      success: false,
      status: res.status,
      message: "Session expired",
      data: [],
      current_page: page,
      last_page: page,
    };
  }

  if (!res.ok) {
    return {
      success: false,
      status: res.status,
      message: "Gagal mengambil data ruas",
      data: [],
      current_page: page,
      last_page: page,
    };
  }

  const json = await res.json();

  return {
    success: true,
    status: 200,
    data: json.data ?? [],
    current_page: json.current_page ?? page,
    last_page: json.last_page ?? page,
  };
}
