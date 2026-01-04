import { NextResponse } from "next/server";

const API_URL = process.env.API_URL!;

export async function POST(req: { formData: () => any }) {
  const formData = await req.formData();

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.status) {
    return NextResponse.json(
      { message: "Username or password is invalid" },
      { status: 401 }
    );
  }

  // ✅ SET COOKIE
  const response = NextResponse.json(
    { message: "Login berhasil" },
    { status: 200 }
  );

  response.cookies.set({
    name: "access_token",
    value: data.access_token,
    httpOnly: true,
    sameSite: "lax",
    secure: false, // dev
    path: "/",
    maxAge: data.expires_in,
  });

  return response;
}
