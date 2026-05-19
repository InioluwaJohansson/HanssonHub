import { Device, Room, Section, Scene, LogEntry, Contact, ContactCategory, UserProfile, User, GetPersonDto, Gender, Role, GetHardwareDto, GetExternalDto, Recording } from './types';

export const SECTIONS: Section[] = [
  { id: 'indoor', name: 'Indoor' },
  { id: 'outdoor', name: 'Outdoor' },
  { id: 'security', name: 'Security' },
];

export const ROOMS: Room[] = [
  { id: 'living-room', name: 'Living Room', section: 'indoor', icon: 'Sofa' },
  { id: 'kitchen', name: 'Kitchen', section: 'indoor', icon: 'Utensils' },
  { id: 'bedroom', name: 'Bedroom', section: 'indoor', icon: 'Bed' },
  { id: 'bathroom', name: 'Bathroom', section: 'indoor', icon: 'Bath' },
  { id: 'garage', name: 'Garage', section: 'outdoor', icon: 'Car' },
  { id: 'backyard', name: 'Backyard', section: 'outdoor', icon: 'Trees' },
  { id: 'front-door', name: 'Front Door', section: 'security', icon: 'Shield' },
];

export const INITIAL_DEVICES: Device[] = [
  { id: '1', name: 'Main Light', type: 'light', status: 'on', value: 80, room: 'living-room', section: 'indoor' },
  { id: '2', name: 'Ambient Light', type: 'light', status: 'off', value: 0, room: 'living-room', section: 'indoor' },
  { id: '3', name: 'Smart TV', type: 'appliance', status: 'off', room: 'living-room', section: 'indoor', powerUsage: 0 },
  
  { id: '5', name: 'Ceiling Light', type: 'light', status: 'on', value: 100, room: 'kitchen', section: 'indoor' },
  { id: '6', name: 'Refrigerator', type: 'appliance', status: 'on', room: 'kitchen', section: 'indoor', powerUsage: 150 },
  { id: '7', name: 'Coffee Maker', type: 'appliance', status: 'off', room: 'kitchen', section: 'indoor', powerUsage: 0 },
  
  { id: '8', name: 'Bedside Lamp', type: 'light', status: 'off', value: 0, room: 'bedroom', section: 'indoor' },
  { id: '9', name: 'Main Light', type: 'light', status: 'off', value: 0, room: 'bedroom', section: 'indoor' },
  { id: 'w1', name: 'Bedroom Window', type: 'window', status: 'closed', room: 'bedroom', section: 'indoor' },
  { id: 'd1', name: 'Bedroom Door', type: 'door', status: 'unlocked', room: 'bedroom', section: 'indoor', doorType: 'interior' },
  { id: 'a1', name: 'Air Conditioner', type: 'appliance', status: 'off', room: 'bedroom', section: 'indoor', powerUsage: 0 },
  { id: 'c1', name: 'Bedroom Camera', type: 'camera', status: 'active', room: 'bedroom', section: 'security' },
  
  { id: '10', name: 'Garage Door', type: 'door', status: 'locked', room: 'garage', section: 'outdoor', doorType: 'exterior' },
  { id: '11', name: 'Garage Light', type: 'light', status: 'off', value: 0, room: 'garage', section: 'outdoor' },
  
  { id: '12', name: 'Sprinklers', type: 'appliance', status: 'inactive', room: 'backyard', section: 'outdoor', powerUsage: 0 },
  { id: '13', name: 'Pool Light', type: 'light', status: 'off', value: 0, room: 'backyard', section: 'outdoor' },
  
  { id: '14', name: 'Front Door Camera', type: 'camera', status: 'active', room: 'front-door', section: 'security' },
  { id: 'c-gate', name: 'Gate Camera', type: 'camera', status: 'active', section: 'security' },
  { id: 'c-porch', name: 'Porch Camera', type: 'camera', status: 'active', section: 'security' },
  { id: '15', name: 'Smart Lock', type: 'door', status: 'locked', room: 'front-door', section: 'security', doorType: 'exterior' },
  { id: '16', name: 'Porch Light', type: 'light', status: 'on', value: 50, room: 'front-door', section: 'security' },
  { id: 'w2', name: 'Front Window', type: 'window', status: 'locked', room: 'front-door', section: 'security' },
];

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'movie-night',
    name: 'Movie Night',
    icon: 'Film',
    actions: [
      { deviceId: '1', status: 'on', value: 10 },
      { deviceId: '2', status: 'on', value: 5 },
      { deviceId: '3', status: 'on' },
      { deviceId: '15', status: 'locked' },
    ]
  },
  {
    id: 'good-morning',
    name: 'Good Morning',
    icon: 'Sun',
    actions: [
      { deviceId: '1', status: 'on', value: 80 },
      { deviceId: '5', status: 'on', value: 100 },
      { deviceId: '7', status: 'on' },
      { deviceId: '15', status: 'unlocked' },
    ]
  },
  {
    id: 'away',
    name: 'Away',
    icon: 'Home',
    actions: [
      { deviceId: '1', status: 'off' },
      { deviceId: '2', status: 'off' },
      { deviceId: '5', status: 'off' },
      { deviceId: '8', status: 'off' },
      { deviceId: '9', status: 'off' },
      { deviceId: '15', status: 'locked' },
      { deviceId: '10', status: 'locked' },
    ]
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Turned on Main Light in Living Room', userName: 'Inioluwa', userAvatar: 'https://picsum.photos/seed/user1/100/100' },
  { id: '2', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Unlocked Front Door', userName: 'Inioluwa', userAvatar: 'https://picsum.photos/seed/user1/100/100' },
  { id: '3', timestamp: new Date(Date.now() - 10800000).toISOString(), action: 'Activated Movie Night Scene', userName: 'Inioluwa', userAvatar: 'https://picsum.photos/seed/user1/100/100' },
];

export const CONTACT_CATEGORIES: ContactCategory[] = [
  { id: 1, name: 'Family', description: 'Immediate and extended family members', icon: 'UserCircle', personId: 1 },
  { id: 2, name: 'Friends', description: 'Close friends and colleagues', icon: 'Users', personId: 1 },
  { id: 3, name: 'Emergency', description: 'Critical security and health contacts', icon: 'ShieldAlert', personId: 1 },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    getContactCategoryDto: CONTACT_CATEGORIES[1],
    imageUrl: 'https://picsum.photos/seed/contact1/100/100',
    contactDetails: [
      { id: 1, phoneNumber: '+1234567890', email: 'john@example.com', contactId: 1, personDetailsId: 1 }
    ],
    address: [
      { 
        id: 1, 
        numberLine: '123', 
        street: 'Smart St', 
        city: 'Tech City', 
        region: 'North', 
        state: 'TC', 
        country: 'Techland', 
        postalCode: '12345',
        contactId: 1,
        personId: 1
      }
    ],
  },
];

export const INITIAL_USER: UserProfile = {
  id: 1,
  personId: "P-001",
  disabled: false,
  getPersonDetailsDto: {
    id: 1,
    firstName: "Inioluwa",
    lastName: "Makinde",
    gender: Gender.Male,
    imageUrl: "https://picsum.photos/seed/ini/200/200",
    disabled: false,
    getAddressDtos: [
      { id: 1, contactId: 0, personId: 1, numberLine: "Plot 12", street: "Smart Avenue", city: "Lagos", region: "Lekki", state: "Lagos", country: "Nigeria", postalCode: "100001" }
    ],
    getContactDetailsDtos: [
      { id: 1, contactId: 0, personDetailsId: 1, email: "inioluwa.makinde10@gmail.com", phoneNumber: "+234 800 000 0000" }
    ]
  },
  getUserDto: {
    id: 1,
    userName: "ini_makinde",
    roleName: "Owner",
    role: Role.Owner,
    personId: 1
  },
  cameraAccess: ['14', 'c-gate']
};

export const INITIAL_USERS: GetPersonDto[] = [
  INITIAL_USER,
  {
    id: 2,
    personId: "P-002",
    disabled: false,
    getPersonDetailsDto: {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
      gender: Gender.Female,
      imageUrl: "https://picsum.photos/seed/jane/100/100",
      disabled: false,
      getAddressDtos: [],
      getContactDetailsDtos: [{ id: 2, contactId: 0, personDetailsId: 2, email: "jane@example.com", phoneNumber: "+234 801 111 2222" }]
    },
    getUserDto: {
      id: 2,
      userName: "jane_doe",
      roleName: "Wife",
      role: Role.Wife,
      personId: 2
    }
  },
  {
    id: 3,
    personId: "P-003",
    disabled: true,
    getPersonDetailsDto: {
      id: 3,
      firstName: "Bob",
      lastName: "Smith",
      gender: Gender.Male,
      imageUrl: "https://picsum.photos/seed/bob/100/100",
      disabled: true,
      getAddressDtos: [],
      getContactDetailsDtos: [{ id: 3, contactId: 0, personDetailsId: 3, email: "bob@example.com", phoneNumber: "+234 802 333 4444" }]
    },
    getUserDto: {
      id: 3,
      userName: "bob_smith",
      roleName: "Visitor",
      role: Role.Visitor,
      personId: 3
    }
  }
];

export const GENERAL_CAMERAS = [
  { id: '14', name: 'Front Door Camera' },
  { id: 'c-gate', name: 'Gate Camera' },
  { id: 'c-porch', name: 'Porch Camera' },
  { id: 'c-backyard', name: 'Backyard Camera' },
];

export const INITIAL_HARDWARES: GetHardwareDto[] = [
  {
    id: 1,
    hardwareName: "Main Controller Hub",
    hardwareId: "HW-HUB-01",
    authKey: "auth_key_6f0a35db9d72",
    isActive: true,
    powerActive: true,
    applianceIdNames: [{ id: 3, name: "Smart TV" }, { id: 6, name: "Refrigerator" }],
    cameraIdNames: [{ id: 14, name: "Front Door Camera" }],
    lightIdNames: [{ id: 1, name: "Main Light" }, { id: 5, name: "Ceiling Light" }],
    windowIdNames: [{ id: 30, name: "Bedroom Window" }],
    doorIdNames: [{ id: 31, name: "Bedroom Door" }],
    externalIdNames: [{ id: 1, name: "Outdoor Motion Sensor" }]
  },
  {
    id: 2,
    hardwareName: "Kitchen Smart Bridge",
    hardwareId: "HW-KITCH-02",
    authKey: "auth_key_71be4d193ba2",
    isActive: true,
    powerActive: true,
    applianceIdNames: [{ id: 7, name: "Coffee Maker" }],
    cameraIdNames: [],
    lightIdNames: [{ id: 5, name: "Ceiling Light" }],
    windowIdNames: [],
    doorIdNames: [],
    externalIdNames: []
  },
  {
    id: 3,
    hardwareName: "Garden Irrigation Unit",
    hardwareId: "HW-GARD-03",
    authKey: "auth_key_8e4f1a20cd11",
    isActive: false,
    powerActive: false,
    applianceIdNames: [{ id: 12, name: "Sprinklers" }],
    cameraIdNames: [],
    lightIdNames: [{ id: 13, name: "Pool Light" }],
    windowIdNames: [],
    doorIdNames: [],
    externalIdNames: [{ id: 2, name: "Driveway Beam Gate" }]
  }
];

export const INITIAL_EXTERNALS: GetExternalDto[] = [
  {
    id: 1,
    externalsName: "Outdoor Motion Sensor",
    externalsId: "EXT-MOT-01",
    isTriggered: true,
    actionIds: [101, 102]
  },
  {
    id: 2,
    externalsName: "Driveway Beam Gate",
    externalsId: "EXT-BEAM-02",
    isTriggered: false,
    actionIds: [103]
  },
  {
    id: 3,
    externalsName: "Front Boundary Laser Fence",
    externalsId: "EXT-FENCE-03",
    isTriggered: false,
    actionIds: [104, 105]
  }
];

export const INITIAL_RECORDINGS: Recording[] = [
  {
    id: "rec-01",
    cameraName: "Front Door Camera",
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    duration: "00:45",
    thumbnailUrl: "https://picsum.photos/seed/rec1/320/180",
    videoUrl: "",
    size: "12.4 MB"
  },
  {
    id: "rec-02",
    cameraName: "Gate Camera",
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    duration: "01:20",
    thumbnailUrl: "https://picsum.photos/seed/rec2/320/180",
    videoUrl: "",
    size: "24.1 MB"
  },
  {
    id: "rec-03",
    cameraName: "Backyard Camera",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    duration: "02:05",
    thumbnailUrl: "https://picsum.photos/seed/rec3/320/180",
    videoUrl: "",
    size: "41.8 MB"
  }
];

