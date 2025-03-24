import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agencySlugs = searchParams.getAll("agency_slugs[]");

  const ecfrUrl = `https://ecfr.gov/api/search/v1/count?${agencySlugs
    .map((slug) => `agency_slugs[]=${slug}`)
    .join("&")}`;

  try {
    const response = await fetch(ecfrUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from eCFR:", error);
    return NextResponse.json(
      { error: "Failed to fetch from eCFR" },
      { status: 500 }
    );
  }
}
