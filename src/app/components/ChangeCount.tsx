"use client";

import { Agency } from "../types/agency";
import { AgencyDropdown } from "./AgencyDropdown";

export default function ChangeCount({ agencies }: { agencies: Agency[] }) {
  function handleAgencySelect(agency: Agency) {
    console.log("agency", agency);
  }
  return <AgencyDropdown agencies={agencies} onSelect={handleAgencySelect} />;
}
