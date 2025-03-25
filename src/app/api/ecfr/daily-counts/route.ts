import { NextResponse } from "next/server";
import { isValidDateFormat } from "../../../../utils/date.utils";

interface DateCounts {
  [key: string]: number;
}

interface APIResponse {
  dates: DateCounts;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agencySlugs = searchParams.getAll("agency_slugs[]");
  const startDate = searchParams.get("last_modified_on_or_after");
  const endDate = searchParams.get("last_modified_on_or_before");
  const query = searchParams.get("query");

  // Validate date formats
  if (
    (startDate && !isValidDateFormat(startDate)) ||
    (endDate && !isValidDateFormat(endDate))
  ) {
    return NextResponse.json(
      { error: "Invalid date format. Please use YYYY-MM-DD" },
      { status: 400 }
    );
  }

  // Build query parameters
  const queryParams = [
    ...agencySlugs.map((slug) => `agency_slugs[]=${encodeURIComponent(slug)}`),
    startDate && `last_modified_on_or_after=${startDate}`,
    endDate && `last_modified_on_or_before=${endDate}`,
    query && `query=${encodeURIComponent(query)}`,
  ]
    .filter(Boolean)
    .join("&");

  const ecfrUrl = `${process.env.ECFR_API_URL}/counts/daily?${queryParams}`;

  try {
    const response = await fetch(ecfrUrl);
    const data: APIResponse = await response.json();

    // Transform the data into the format expected by the chart
    const counts = Object.entries(data.dates)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date ascending

    return NextResponse.json({ counts });
  } catch (error) {
    console.error("Error fetching from eCFR:", error);
    return NextResponse.json(
      { error: "Failed to fetch from eCFR" },
      { status: 500 }
    );
  }
}
