export type DeviceType = 'light' | 'door' | 'appliance' | 'camera' | 'speaker' | 'window';

export type DoorStatus = 'locked' | 'unlocked' | 'open' | 'open-locked';
export type LightStatus = 'on' | 'off';
export type CameraStatus = 'active' | 'inactive';
export type ApplianceStatus = 'on' | 'off' | 'active' | 'inactive';
export type WindowStatus = 'open' | 'closed' | 'locked';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: string; // Using string to accommodate various statuses
  value?: number; // For dimmers, volume, etc.
  room?: string; // Optional if attached directly to a section
  section?: string;
  doorType?: 'exterior' | 'interior';
  powerUsage?: number; // in Watts
}

export interface SceneAction {
  deviceId: string;
  status: string;
  value?: number;
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  actions: SceneAction[];
}

export interface Room {
  id: string;
  name: string;
  section: string;
  icon: string;
}

export interface Section {
  id: string;
  name: string;
  type?: 'general' | 'secretive';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  userName: string;
  userAvatar: string;
}

export interface BaseAddressDto {
  numberLine: string;
  street: string;
  city: string;
  region: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface GetAddressDto extends BaseAddressDto {
  id: number;
  contactId: number;
  personId: number;
}

export interface CreateAddressDto extends BaseAddressDto {}
export interface UpdateAddressDto extends BaseAddressDto {
  id: number;
}

export interface BaseContactDetailsDto {
  phoneNumber: string;
  email: string;
}

export interface GetContactDetailsDto extends BaseContactDetailsDto {
  id: number;
  contactId: number;
  personDetailsId: number;
}

export interface CreateContactDetailsDto extends BaseContactDetailsDto {
  contactId: number;
  personDetailsId: number;
}

export interface UpdateContactDetailsDto extends BaseContactDetailsDto {
  id: number;
  contactId: number;
  personDetailsId: number;
}

export interface BaseContactCategoryDto {
  name: string;
  icon: string;
  description: string;
}

export interface GetContactCategoryDto extends BaseContactCategoryDto {
  id: number;
  personId: number;
}

export interface CreateContactCategoryDto extends BaseContactCategoryDto {
  personId: number;
}

export interface UpdateContactCategoryDto extends BaseContactCategoryDto {
  id: number;
  personId: number;
}

export interface GetContactDto {
  id: number;
  firstName: string;
  lastName: string;
  imageUrl: string;
  getContactCategoryDto: GetContactCategoryDto;
  contactDetails: GetContactDetailsDto[];
  address: GetAddressDto[];
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  imageUrl: File | string | null;
  contactCategory: number;
  personId: number;
  contactDetails: CreateContactDetailsDto[];
  address: CreateAddressDto[];
}

export interface UpdateContactDto {
  id: number;
  firstName: string;
  lastName: string;
  imageUrl: File | string | null;
  contactCategory: number;
  personId: number;
  contactDetails: UpdateContactDetailsDto[];
  address: UpdateAddressDto[];
}

export interface BaseResponse {
  isSuccess: boolean;
  message: string;
  errors: string[];
}

export enum Role {
  Owner = 1,
  Wife,
  Child,
  Relative,
  Visitor
}

export enum Gender {
  Male = 1,
  Female,
  Other
}

export interface CreatePersonDetailsDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string
  age: number;
  gender: Gender;
  imageUrl: File | string | null;
}

export interface GetPersonDetailsDto {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  imageUrl: string;
  disabled: boolean;
  getAddressDtos: GetAddressDto[];
  getContactDetailsDtos: GetContactDetailsDto[];
}

export interface UpdatePersonDetailsDto {
  firstName: string;
  lastName: string;
  gender: Gender;
  imageUrl: File | string | null;
  getContactDetailsDtos: GetContactDetailsDto[];
  updateAddressDtos: UpdateAddressDto[];
}

export interface CreateUserDto {
  userName: string;
  password: string;
  authorizationCode: string;
  role: Role;
}

export interface GetUserDto {
  id: number;
  userName: string;
  roleName: string;
  role: Role;
  personId: number;
}

export interface UpdateUserDto {
  id: number;
  userName: string;
  password: string;
  role: Role;
}

export interface CreatePersonDto {
  relation: string;
  createPersonDetailsDto: CreatePersonDetailsDto;
  createUserDto: CreateUserDto;
}

export interface UpdatePersonDto {
  id: number;
  updatePersonDetailsDto: UpdatePersonDetailsDto;
  updateUserDto: UpdateUserDto;
}

export interface GetPersonDto {
  id: number;
  personId: string;
  disabled: boolean;
  getPersonDetailsDto: GetPersonDetailsDto;
  getUserDto: GetUserDto;
}

export interface PersonResponseModel extends BaseResponse {
  data: GetPersonDto;
}

export interface PersonsResponseModel extends BaseResponse {
  data: GetPersonDto[];
}

export interface UpdateUserPasswordDto {
  id: number;
  userName: string;
  token: string;
  newPassword: string;
  authorizationCode: string;
}

export interface UpdateUserAuthorizationCode {
  id: number;
  userName: string;
  password: string;
  token: string;
  newAuthorizationCode: string;
}

export interface ContactResponseModel extends BaseResponse {
  data: GetContactDto;
}

export interface ContactsResponseModel extends BaseResponse {
  data: GetContactDto[];
}

export interface ContactCategoryResponseModel extends BaseResponse {
  data: GetContactCategoryDto;
}

export interface ContactCategoriesResponseModel extends BaseResponse {
  data: GetContactCategoryDto[];
}

// Maintaining compatibility with the rest of the app by mapping types
export type Contact = GetContactDto;
export type ContactCategory = GetContactCategoryDto;

export type UserProfile = GetPersonDto & { cameraAccess?: string[] };
export type User = GetPersonDto;
