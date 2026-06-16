export interface CooperativeUnionPayload {
  name: string;
  description: string;
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
}

export interface CooperativeUnion extends CooperativeUnionPayload {
  id: string;
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
