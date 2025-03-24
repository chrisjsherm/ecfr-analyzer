export interface Agency {
  name: string;
  short_name: string;
  slug: string;
}

export interface AgenciesResponse {
  agencies: Agency[];
}
