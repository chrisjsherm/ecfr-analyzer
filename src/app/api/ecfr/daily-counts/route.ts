import { NextResponse } from "next/server";
import { isValidDateFormat } from "../../../../utils/date.utils";
import { fetchChangeCountByAgency } from "../../../../utils/ecfr-api.utils";

export async function POST(request: Request) {
  const { agencySlugs, startDate, endDate, query } = await request.json();

  if (!Array.isArray(agencySlugs)) {
    return NextResponse.json(
      { error: "agencySlugs must be an array" },
      { status: 400 }
    );
  }

  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const data = await fetchChangeCountByAgency(
    agencySlugs,
    startDate,
    endDate,
    query
  );

  return NextResponse.json(data);
}
