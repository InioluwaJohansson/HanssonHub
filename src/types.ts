export enum FacilityType {
  Appliance = 1,
  Camera,
  Door,
  External,
  Light,
  Window
}

export interface CreateActionDto {
  actionName: string;
  description: string;
  personId: number;
}

export interface UpdateActionDto {
  id: number;
  personId: number;
  actionName: string;
  description: string;
}

export interface CreateActionStepDto {
  actionId: number;
  facilityType: FacilityType;
  facilityTypeId: number;
  brightnessLevel: number;
  isLocked: boolean;
  isOpen: boolean;
  isActive: boolean;
}

export interface UpdateActionStepDto extends CreateActionStepDto {
  id: number;
}

export interface GetActionStepDto {
  id: number;
  actionId: number;
  facilityType: FacilityType;
  facilityTypeId: number;
  brightnessLevel: number;
  isLocked: boolean;
  isOpen: boolean;
  isActive: boolean;
}

export interface GetActionDto extends UserBaseDefaultDto {
  id: number;
  actionId: string;
  actionName: string;
  actionDescription: string;
  actionActive: boolean;
  getActionStepDtos: GetActionStepDto[];
}

export interface ActionResponseModel extends BaseResponse {
  data: GetActionDto;
}

export interface ActionsResponseModel extends BaseResponse {
  data: GetActionDto[];
}

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
  ipAddress?: string;
  username?: string;
  password?: string;
  streamPath?: string;
  port?: number;
  applianceType?: number;
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
  id: number | string;
  name: string;
  section: string;
  icon: string;
  isHidden?: boolean;
}

export interface Section {
  id: number | string;
  name: string;
  type?: 'general' | 'secretive';
  isHidden?: boolean;
  dbId?: number;
  sectionId?: string;
  sectionName?: string;
}

export interface GetLogDto {
  id: number;
  getPersonDto: GetPersonDto;
  personId: number;
  actionType: string;
  timeOfAction: string; // DateTime ISO string
  logDetails: string;
}

export interface LogResponseModel extends BaseResponse {
  data: GetLogDto;
}

export interface LogsResponseModel extends BaseResponse {
  data: GetLogDto[];
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
  role: Role;
}

export interface CreatePersonDto {
  relation: string;
  createPersonDetailsDto: CreatePersonDetailsDto;
  createUserDto: CreateUserDto;
}

export interface UpdatePersonDto {
  id: number;
  cameraIds: number[];
  updatePersonDetailsDto: UpdatePersonDetailsDto;
  updateUserDto: UpdateUserDto;
}

export interface GetPersonDto {
  id: number;
  personId: string;
  disabled: boolean;
  cameraIds: number[];
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

export interface GetTokenDto {
  tokenCode: string;
  expiryTime: string;
  status: boolean;
  message: string;
}

export interface GetTokenDtoResponse extends BaseResponse {
  data: GetTokenDto;
}
export type Contact = GetContactDto;
export type ContactCategory = GetContactCategoryDto;

export type UserProfile = GetPersonDto & { cameraAccess?: string[] };
export type User = GetPersonDto;

// Hardware and Externals Models
export interface GenericIdNames {
  id: number;
  name: string;
}

export interface GenericNames extends GenericIdNames {
  isHidden: boolean;
  imageUrl: string;
}

export interface AppNamesDetailList {
  applianceIdNames: GenericNames[];
  cameraIdNames: GenericNames[];
  lightIdNames: GenericNames[];
  windowIdNames: GenericNames[];
  doorIdNames: GenericNames[];
  externalIdNames: GenericNames[];
  personIdNames: GenericNames[];
  contactCategoryIdNames: GenericIdNames[];
  actionIdNames: GenericIdNames[];
  hardwareIdNames: GenericIdNames[];
  applianceType: GenericIdNames[];
  gender: GenericIdNames[];
  doorType: GenericIdNames[];
  facilityType: GenericIdNames[];
  role: GenericIdNames[];
  roomIds: GenericIdNames[]; 
  sectionIds: GenericIdNames[]; 
}

export interface GetHardwareDto {
  id: number;
  hardwareName: string;
  hardwareId: string;
  authKey: string;
  isActive: boolean;
  powerActive: boolean;
  applianceIdNames: GenericIdNames[];
  cameraIdNames: GenericIdNames[];
  lightIdNames: GenericIdNames[];
  windowIdNames: GenericIdNames[];
  doorIdNames: GenericIdNames[];
  externalIdNames: GenericIdNames[];
}

export interface HardwareResponseModel extends BaseResponse {
  data: GetHardwareDto;
}

export interface HardwaresResponseModel extends BaseResponse {
  data: GetHardwareDto[];
}

export interface BaseDefaultDto {
  isActive?: boolean;
  powerActive?: boolean;
  roomId?: number;
  roomName?: string;
  sectionId?: number;
  sectionName?: string;
  createdBy?: number;
  createdByName?: string;
  createdOn?: string;
  lastModifiedBy?: number;
  lastModifiedByName?: string;
  lastModifiedOn?: string;
  deletedOn?: string;
  deletedBy?: number;
  isDeleted?: boolean;
  personId?: number;
  peronName?: string;
}

export interface GetExternalDto extends BaseDefaultDto {
  id: number;
  externalName: string;
  externalId: string;
  isTriggered: boolean;
  actionIds: number[];
}

export interface ExternalResponseModel extends BaseResponse {
  data: GetExternalDto;
}

export interface ExternalsResponseModel extends BaseResponse {
  data: GetExternalDto[];
}

export interface Recording {
  id: string;
  cameraName: string;
  timestamp: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  size: string;
}

export interface CreateHardwareDto {
  hardwareName: string;
}

export interface UpdateHardwareDto {
  id: number;
  hardwareName: string;
  authKey: string;
  lightIds: number[];
  applianceIds: number[];
  cameraIds: number[];
  windowIds: number[];
  doorIds: number[];
  externalIds: number[];
}

export interface CreateBaseDefaultDto {
  roomId?: number;
  sectionId?: number;
}

export enum DoorType {
  Interior = 1,
  Exterior,
  Gate
}

export interface CreateLightDto extends CreateBaseDefaultDto {
  lightName: string;
  brightnessLevel: number;
}

export interface UpdateLightDto extends CreateBaseDefaultDto {
  id: number;
  lightName: string;
  brightnessLevel: number;
  isActive: boolean;
}

export interface GetLightDto extends BaseDefaultDto {
  id: number;
  lightName: string;
  lightId: string;
  brightnessLevel: number;
}

export interface LightResponseModel extends BaseResponse {
  data: GetLightDto;
}

export interface LightsResponseModel extends BaseResponse {
  data: GetLightDto[];
}

export interface CreateRoomDto {
  roomName: string;
  personId: number;
  sectionId: number;
  isHidden: boolean;
}

export interface UpdateRoomDto {
  id: number;
  roomName: string;
  personId: number;
  sectionId: number;
  isHidden: boolean;
}

export interface UserBaseDefaultDto {
  createdBy: number;
  createdByName: string;
  createdOn: string;
  lastModifiedBy: number;
  lastModifiedByName: string;
  lastModifiedOn?: string;
  deletedOn?: string;
  deletedBy: number;
  isDeleted: boolean;
  personId: number;
  peronName: string;
}

export interface CreateSectionDto {
  sectionName: string;
  isHidden: boolean;
}

export interface UpdateSectionDto {
  id: number;
  sectionName: string;
  isHidden: boolean;
}

export interface GetSectionDto extends UserBaseDefaultDto {
  id: number;
  sectionName: string;
  sectionId: string;
  isHidden: boolean;
  rooms: GetRoomDto[];
  doors: GetDoorDto[];
  lights: GetLightDto[];
  windows: GetWindowDto[];
  appliances: GetApplianceDto[];
  cameras: GetCameraDto[];
  externals: GetExternalDto[];
}

export interface SectionResponseModel extends BaseResponse {
  data: GetSectionDto;
}

export interface SectionsResponseModel extends BaseResponse {
  data: GetSectionDto[];
}

export interface CreateWindowDto extends CreateBaseDefaultDto {
  windowName: string;
  windowId: string;
  isOpen: boolean;
  isLocked: boolean;
  openedBy: number;
  lockedBy: number;
  unlockedBy: number;
}

export interface UpdateWindowDto extends CreateBaseDefaultDto {
  id: number;
  windowName: string;
  isOpen: boolean;
  isLocked: boolean;
  openedBy: number;
  lockedBy: number;
  unlockedBy: number;
}

export interface GetWindowDto extends BaseDefaultDto {
  id: number;
  windowName: string;
  windowId: string;
  isOpen: boolean;
  isLocked: boolean;
  openedBy: number;
  lockedBy: number;
  unlockedBy: number;
}

export interface WindowResponseModel extends BaseResponse {
  data: GetWindowDto;
}

export interface WindowsResponseModel extends BaseResponse {
  data: GetWindowDto[];
}

export interface GetRoomDto extends UserBaseDefaultDto {
  id: number;
  roomName: string;
  roomId: string;
  personId: number;
  sectionId: number;
  isHidden: boolean;
  doors: GetDoorDto[];
  lights: GetLightDto[];
  windows: GetWindowDto[];
  appliances: GetApplianceDto[];
  cameras: GetCameraDto[];
  externals: GetExternalDto[];
}

export interface RoomResponseModel extends BaseResponse {
  data: GetRoomDto;
}

export interface RoomsResponseModel extends BaseResponse {
  data: GetRoomDto[];
}

export interface CreateApplianceDto extends CreateBaseDefaultDto {
  applianceName: string;
  applianceType: number;
}

export interface UpdateApplianceDto extends CreateBaseDefaultDto {
  id: number;
  applianceName: string;
  applianceType: number;
  isActive: boolean;
}

export interface GetApplianceDto extends BaseDefaultDto {
  id: number;
  applianceName: string;
  applianceId: string;
  applianceType: string;
  isActive: boolean;
  powerActive: boolean;
  roomId?: number;
  roomName?: string;
  sectionId?: number;
  sectionName?: string;
}

export interface ApplianceResponseModel extends BaseResponse {
  data: GetApplianceDto;
}

export interface AppliancesResponseModel extends BaseResponse {
  data: GetApplianceDto[];
}

export interface CreateDoorDto extends CreateBaseDefaultDto {
  doorName: string;
  doorType: DoorType;
  isLocked: boolean;
  isOpen: boolean;
  openedBy: number;
  lockedBy: number;
  unlockedBy: number;
}

export interface UpdateDoorDto extends CreateBaseDefaultDto {
  id: number;
  doorName: string;
  doorType: DoorType;
  isLocked: boolean;
  isOpen: boolean;
  openedBy: number;
  lockedBy: number;
  unlockedBy: number;
}

export interface GetDoorDto extends BaseDefaultDto {
  id: number;
  doorName: string;
  doorId: string;
  doorType: DoorType;
  isLocked: boolean;
  isOpen: boolean;
  openedBy: number;
  lockedBy: number;
  unlockedBy: number;
}

export interface DoorResponseModel extends BaseResponse {
  data: GetDoorDto;
}

export interface DoorsResponseModel extends BaseResponse {
  data: GetDoorDto[];
}

export interface CreateExternalDto extends CreateBaseDefaultDto {
  externalName: string;
  actionIds: number[];
}

export interface UpdateExternalDto extends CreateBaseDefaultDto {
  id: number;
  externalName: string;
  isTriggered: boolean;
  isActive: boolean;
  actionIds: number[];
}

export interface CreateCameraDto extends CreateBaseDefaultDto {
  cameraName: string;
  ipAddress: string;
  username: string;
  password?: string;
  streamPath: string;
  port: number;
}

export interface UpdateCameraDto extends CreateBaseDefaultDto {
  id: number;
  cameraName: string;
  isActive: boolean;
  ipAddress: string;
  username: string;
  password?: string;
  streamPath: string;
  port: number;
}

export interface GetCameraDto extends BaseDefaultDto {
  id: number;
  cameraName: string;
  cameraId: string;
  liveStreamUrl: string;
  recordings: GetRecordingDto[];
}

export interface CameraResponseModel extends BaseResponse {
  data: GetCameraDto;
}

export interface CamerasResponseModel extends BaseResponse {
  data: GetCameraDto[];
}

export interface GetRecordingDto {
  filePath: string;
  startTime: string;
  endTime: string;
}

export enum MessageType {
  Text = 0,
  Image = 1,
  Video = 2,
  Audio = 3,
  File = 4,
}

export interface CreateDirectChatDto {
  recipientPersonId: number;
}

export interface CreateGroupChatDto {
  name: string;
  description?: string;
  imageUrl?: string;
  participantPersonIds: number[];
}

export interface UpdateGroupChatDto {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface AddParticipantsDto {
  personIds: number[];
}

export interface RemoveParticipantDto {
  personId: number;
}

export interface MessageAttachmentDto {
  fileName?: string;
  filePath?: string;
  contentType?: string;
  fileSize?: number;
  thumbnailPath?: string;
  type?: MessageType;
}

export interface SendMessageDto {
  chatId?: number;
  content?: string;
  type?: MessageType;
  attachments?: MessageAttachmentDto[];
  replyToMessageId?: number;
}

export interface EditMessageDto {
  messageId: number;
  content: string;
}

export interface DeleteMessageDto {
  messageId: number;
}

export interface MessageDto {
  id: number;
  chatId: number;
  senderPersonId: number;
  senderName: string;
  senderProfileImage?: string;
  content?: string;
  type: MessageType;
  isEdited: boolean;
  isDeleted: boolean;
  sentAt: string; // ISO string
  attachments: MessageAttachmentDto[];
  replyToId?: number;
  replyTo?: MessageDto;
}

export interface ChatParticipantDto {
  personId: number;
  fullName: string;
  profileImageUrl?: string;
  isAdmin: boolean;
  isOnline: boolean;
  lastReadAt?: string; // ISO string
}

export interface ChatDto {
  id: number;
  name?: string;
  description?: string;
  isGroup: boolean;
  imageUrl?: string;
  createdAt: string; // ISO string
  participants: ChatParticipantDto[];
  lastMessage?: MessageDto;
  unreadCount: number;
  roomId?: number;
  sectionId?: number;
}

export interface RealtimeMessageDto {
  messageId: number;
  chatId: number;
  senderPersonId: number;
  senderName: string;
  content?: string;
  type: MessageType;
  sentAt: string; // ISO string
  attachments: MessageAttachmentDto[];
}

export interface TypingDto {
  chatId: number;
  personId: number;
  name: string;
  isTyping: boolean;
}

export interface CameraNameUrl {
  cameraName: string;
  url: string;
}

export interface DashBoardResponseModel {
  totalContacts: number;
  rooms: GetRoomDto[];
  actions: GetActionDto[];
  cameraNamesUrls: CameraNameUrl[];
  logs: GetLogDto[];
  status: boolean;
}

export interface DashboardResponseModelWrapper extends BaseResponse {
  data: DashBoardResponseModel;
}

export interface ReadReceiptDto {
  chatId: number;
  personId: number;
  readAt: string; // ISO string
}

export interface PresenceDto {
  personId: number;
  isOnline: boolean;
}

export interface MessageQueryDto {
  chatId: number;
  page: number;
  pageSize: number;
}


