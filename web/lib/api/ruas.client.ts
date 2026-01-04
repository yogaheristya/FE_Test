interface RuasClientResponse {
  success: boolean;
  status: number;
  message?: string;
  data: any[];
  current_page: number;
  last_page: number;
}

export async function getRuasClient(
  page = 1,
  perPage = 5
): Promise<RuasClientResponse> {
  const res = await fetch(`/api/ruas?page=${page}&per_page=${perPage}`);

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
    current_page: Number(json.current_page ?? page),
    last_page: Number(json.last_page ?? page),
  };
}

export async function getRuasDetailClient(id: number) {
  const res = await fetch(`/api/ruas/${id}`);

  if (res.status === 401 || res.status === 403) {
    return {
      success: false,
      status: res.status,
      message: "Session expired",
    };
  }

  if (!res.ok) {
    return {
      success: false,
      status: res.status,
      message: "Gagal mengambil detail ruas",
    };
  }

  const json = await res.json();

  return {
    success: true,
    status: 200,
    data: {
      id: json.data.id,
      unit_id: json.data.unit_id,
      ruas_name: json.data.ruas_name,
      long: String(json.data.long),
      km_awal: json.data.km_awal,
      km_akhir: json.data.km_akhir,
      status: json.data.status,
      coordinates: json.data.coordinates.map((c: any) => c.coordinates),
    },
  };
}
