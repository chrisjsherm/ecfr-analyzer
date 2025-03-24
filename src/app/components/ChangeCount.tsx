"use client";

import { useState } from "react";
import { Agency } from "../types/agency";
import { AgencyDropdown } from "./AgencyDropdown";

export default function ChangeCount({ agencies }: { agencies: Agency[] }) {
  const [changeCount, setChangeCount] = useState(null);

  async function handleAgencySelect(agency: Agency) {
    const response = await fetch(
      `/api/ecfr/count?agency_slugs[]=${agency.slug}`
    );
    const json = await response.json();
    setChangeCount(json.meta.total_count);
  }
  return (
    <div>
      <AgencyDropdown agencies={agencies} onSelect={handleAgencySelect} />
      <div>{changeCount && <p>{changeCount}</p>}</div>
    </div>
  );
}
