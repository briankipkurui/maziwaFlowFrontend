export type CooperativeMemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface CooperativeMemberProfilePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  mobileNumber: string;
  otherNumber?: string;
  kraPin?: string;
  county?: string;
  subCounty?: string;
  division?: string;
  location?: string;
  subLocation?: string;
}

export interface CooperativeMemberPayload {
  memberNumber?: string;
  cooperativeId:string
  identificationNumber?: string;
  roleId?: string;
  status: CooperativeMemberStatus;
  profile: CooperativeMemberProfilePayload;
}

export interface CooperativeMemberProfile extends CooperativeMemberProfilePayload {
  id: string;
  cooperativeMemberId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CooperativeMemberRole {
  id: string;
  cooperativeId?: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CooperativeMember {
  id: string;
  cooperativeId: string;
  memberNumber?: string;
  identificationNumber?: string;
  email?: string;
  mobileNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  roleId?: string;
  status: CooperativeMemberStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  profile: CooperativeMemberProfile;
  role?: CooperativeMemberRole;
}

export interface CooperativeMemberResponse {
  totalItems: number;
  results: CooperativeMember[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  limit: number;
}

export interface CooperativeMemberListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
