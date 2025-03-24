import { NextResponse } from "next/server";
import { isValidDateFormat } from "../../../../utils/date.utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agencySlugs = searchParams.getAll("agency_slugs[]");
  const lastModified = searchParams.get("last_modified_on_or_after");

  if (lastModified && !isValidDateFormat(lastModified)) {
    return NextResponse.json(
      { error: "Invalid date format. Please use YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const ecfrUrl = `${process.env.ECFR_API_URL}/count?${agencySlugs
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
