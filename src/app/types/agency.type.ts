/**
 * United States federal agency
 */
export interface Agency {
  name: string;
  short_name: string;
  slug: string;
}

/**
 * Response from the eCFR API for the list of agencies
 */
export interface AgenciesResponse {
  agencies: Agency[];
}
