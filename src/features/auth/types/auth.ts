export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  data: Data;
}

export interface Data {
  user: User;
  cooperatives: Coopera[];
}

export interface User {
  id: string;
  cooperativeId: string;
  email: string;
  mobileNumber: string;
  isActive: boolean;
  isVerified: boolean;
  roleId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  profile: Profile;
  cooperative: Cooperative;
  role: Role;
}

export interface Profile {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}

export interface Cooperative {
  id: string;
  code: string;
  groupName: string;
  mobilePhone: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Coopera {
  cooperativeMemberId: string;
  cooperativeId: string;
  cooperative: Cooperative2;
  memberProfile: MemberProfile;
  roles: Role2[];
  permissions: Permission3[];
}

export interface Cooperative2 {
  id: string;
  code: string;
  groupName: string;
  mobilePhone: string;
}

export interface MemberProfile {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}

export interface Role2 {
  id: string;
  name: string;
  description: string;
  permissions: Permission2[];
}

export interface Permission2 {
  id: string;
  name: string;
  description: string;
}

export interface Permission3 {
  id: string;
  name: string;
  description: string;
}

export interface LoginRequest {
  cooperativeCode: string;
  identifier: string;
  password: string;
}