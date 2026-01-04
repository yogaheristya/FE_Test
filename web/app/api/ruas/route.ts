import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL!;

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "1";
    const perPage = searchParams.get("per_page") ?? "5";
    const show = searchParams.get("show");

    const query = new URLSearchParams({
      page,
      per_page: perPage,
    });

    if (show) query.append("show", show);

    const res = await fetch(`${API_URL}/ruas?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (res.status === 401 || res.status === 403) {
      const response = NextResponse.json(
        { message: "Session expired" },
        { status: 401 }
      );

      response.cookies.delete("access_token");
      return response;
    }

    const text = await res.text();

    if (!res.ok) {
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        {
          message: "Backend error",
          backendStatus: res.status,
          backendResponse: text,
        },
        { status: res.status }
      );
    }

    // backend return kosong
    if (!text) {
      return NextResponse.json({ data: [] });
    }

    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON from backend" },
        { status: 500 }
      );
    }

    // pagination response
    if (json.data && json.current_page !== undefined) {
      return NextResponse.json({
        data: json.data,
        current_page: json.current_page,
        last_page: json.last_page,
        per_page: json.per_page,
        total: json.total,
      });
    }

    return NextResponse.json({ data: json.data ?? [] });
  } catch (err) {
    console.error("ROUTE FATAL ERROR:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const res = await fetch(`${API_URL}/ruas`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.status === 401 || res.status === 403) {
      const response = NextResponse.json(
        { message: "Session expired" },
        { status: 401 }
      );

      response.cookies.delete("access_token");
      return response;
    }

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Gagal menambah ruas",
          backendResponse: text,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (err) {
    console.error("ROUTE POST ERROR:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
