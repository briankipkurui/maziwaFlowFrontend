export interface CooperativePayload {
  code: string
  groupName: string
  mobilePhone: string
  imgUrl: string
  county: string
  subCounty: string
  division: string
  location: string
  subLocation: string
  ward: string
  hasInsurance: boolean
  insuranceProvider: string
  insuranceType: string
  enterpriseCovered: string
  incorporationNumber: string
  kraPin: string
  latitude: string
  longitude: string
  altitude: string
  precision: string
  mainActivity: string
  notes: string
  cooperativeUnionId?: string
}

export interface Cooperative extends CooperativePayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CooperativeResponse {
  totalItems: number;
  results: Cooperative[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  limit: number;
}

export interface CooperativeListParams {
  page?: number;
  limit?: number;
  search?: string;
}