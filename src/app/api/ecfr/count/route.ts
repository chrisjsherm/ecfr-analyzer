import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agencySlugs = searchParams.getAll("agency_slugs[]");
  const lastModified = searchParams.get("last_modified_on_or_after");

  // Validate date format if lastModified is provided
  if (lastModified) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(lastModified)) {
      return NextResponse.json(
        { error: "Invalid date format. Please use YYYY-MM-DD" },
        { status: 400 }
      );
    }
  }

  const ecfrUrl = `https://ecfr.gov/api/search/v1/count?${agencySlugs
    .map((slug) => `agency_slugs[]=${slug}`)
    .join("&")}${
    lastModified ? `&last_modified_on_or_after=${lastModified}` : ""
  }`;

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
