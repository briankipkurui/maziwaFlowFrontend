export interface SignInResponse {
  message: string;
  accessToken: string;
  data: Data;
}

export interface Data {
  user: User;
  cooperatives: Coopera[];
}

export interface User {
  id: string;
  email: string;
  mobileNumber: string;
  isActive: boolean;
  isVerified: boolean;
  userTypeId: string;
  createdAt: string;
  updatedAt: string;
  password: string;
  refreshHashedToken: string;
  resetToken: string;
  verificationToken: string;
  profile: Profile;
  userType: UserType;
  cooperativeMemberAccounts: CooperativeMemberAccount[];
}

export interface Profile {
  id: string;
  userId: string;
  otherNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  kraPin: string;
  identificationNumber: string;
  county: string;
  subCounty: string;
  division: string;
  location: string;
  subLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CooperativeMemberAccount {
  id: string;
  cooperativeMemberId: string;
  userId: string;
  linkedAt: string;
  createdAt: string;
  updatedAt: string;
  cooperativeMember: CooperativeMember;
}

export interface CooperativeMember {
  id: string;
  cooperativeId: string;
  memberNumber: string;
  role: string;
  status: string;
  joinedAt: string;
  identificationNumber: string;
  createdAt: string;
  updatedAt: string;
  cooperative: Cooperative;
  profile: Profile2;
  roleAssignments: RoleAssignment[];
}

export interface Cooperative {
  id: string;
  groupName: string;
  mobilePhone: string;
  imgUrl: string;
  county: string;
  subCounty: string;
  division: string;
  location: string;
  subLocation: string;
  ward: string;
  hasInsurance: boolean;
  insuranceProvider: string;
  insuranceType: string;
  enterpriseCovered: string;
  incorporationNumber: string;
  kraPin: string;
  latitude: string;
  longitude: string;
  altitude: string;
  precision: string;
  mainActivity: string;
  notes: string;
  cooperativeUnionId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile2 {
  id: string;
  cooperativeMemberId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  otherNumber: string;
  kraPin: string;
  county: string;
  subCounty: string;
  division: string;
  location: string;
  subLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleAssignment {
  id: string;
  cooperativeMemberId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
  updatedAt: string;
  permission: Permission2;
}

export interface Permission2 {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coopera {
  cooperativeMemberId: string;
  cooperativeId: string;
  cooperative: Cooperative;
  memberProfile: MemberProfile;
  roles: Role2[];
  permissions: Permission4[];
}

export interface Cooperative {
  id: string;
  groupName: string;
  mobilePhone: string;
  imgUrl: string;
  county: string;
  subCounty: string;
  division: string;
  location: string;
  subLocation: string;
  ward: string;
  hasInsurance: boolean;
  insuranceProvider: string;
  insuranceType: string;
  enterpriseCovered: string;
  incorporationNumber: string;
  kraPin: string;
  latitude: string;
  longitude: string;
  altitude: string;
  precision: string;
  mainActivity: string;
  notes: string;
  cooperativeUnionId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberProfile {
  id: string;
  cooperativeMemberId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  otherNumber: string;
  kraPin: string;
  county: string;
  subCounty: string;
  division: string;
  location: string;
  subLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role2 {
  id: string;
  name: string;
  description: string;
  permissions: Permission3[];
}

export interface Permission3 {
  id: string;
  name: string;
  description: string;
}

export interface Permission4 {
  id: string;
  name: string;
  description: string;
}
