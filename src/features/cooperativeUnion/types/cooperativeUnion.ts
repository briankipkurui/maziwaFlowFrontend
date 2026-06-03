export interface CooperativeUnion {
  id: string;
  name: string;
  description: string | null;
  county: string;
  subCounty: string;
  division: string;
  location: string;
  subLocation: string;
  ward: string;
  kraPin: string;
  latitude: string;
  longitude: string;
  altitude: string;
  precision: string;
  createdAt: string;
  updatedAt: string;
}

export interface CooperativeUnionResponse {
  totalItems: number;
  results: CooperativeUnion[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  limit: number;
}

export interface CooperativeUnionListParams {
  page?: number;
  limit?: number;
  search?: string;
}