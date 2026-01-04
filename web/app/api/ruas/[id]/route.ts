import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL!;

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/ruas/${id}`, {
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

  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  formData.append("_method", "PUT");

  const res = await fetch(`${API_URL}/ruas/${id}`, {
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

  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/ruas/${id}`, {
    method: "DELETE",
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

  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
