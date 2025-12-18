import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patternId = searchParams.get("patternId");
  const format = searchParams.get("format") ?? "svg";

  if (!patternId) {
    return new NextResponse("Missing patternId", { status: 400 });
  }

  const token =
    req.headers.get("authorization") ?? req.cookies.get("access_token")?.value;

  const backendResponse = await fetch(
    `${API_BASE_URL}/patterns/${patternId}/export?format=${format}`,
    {
      headers: token ? { Authorization: token } : {},
    },
  );

  if (!backendResponse.ok) {
    return new NextResponse("Export failed", { status: backendResponse.status });
  }

  const bytes = await backendResponse.arrayBuffer();
  const contentType =
    backendResponse.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition":
        backendResponse.headers.get("content-disposition") ??
        `attachment; filename="pattern_${patternId}.${format}"`,
    },
  });
}



