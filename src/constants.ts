import { 
  Device, 
  Room, 
  Section, 
  Scene, 
  GetLogDto, 
  GetPersonDto, 
  Gender, 
  Role, 
  DoorType,
  GetHardwareDto, 
  GetExternalDto, 
  GetWindowDto, 
  GetLightDto, 
  GetDoorDto, 
  GetApplianceDto, 
  GetCameraDto,
  FacilityType,
  GetActionDto,
  GetActionStepDto,
  Contact,
  ContactCategory,
  UserProfile
} from './types';

export const INITIAL_ACTIONS: GetActionDto[] = [
  {
    id: 1,
    actionId: "ACT-001",
    actionName: "Secure Perimeter",
    actionDescription: "Locks all external doors and windows",
    actionActive: true,
    getActionStepDtos: [
      { id: 1, actionId: 1, facilityType: 3, facilityTypeId: 10, brightnessLevel: 0, isLocked: true, isOpen: false, isActive: true },
      { id: 2, actionId: 1, facilityType: 3, facilityTypeId: 15, brightnessLevel: 0, isLocked: true, isOpen: false, isActive: true },
      { id: 3, actionId: 1, facilityType: 6, facilityTypeId: 31, brightnessLevel: 0, isLocked: true, isOpen: false, isActive: true }
    ],
    createdBy: 1,
    createdByName: "System",
    createdOn: new Date().toISOString(),
    lastModifiedBy: 1,
    lastModifiedByName: "System",
    lastModifiedOn: new Date().toISOString(),
    isDeleted: false,
    personId: 1,
    peronName: "Owner",
    deletedBy: 0
  },
  {
    id: 2,
    actionId: "ACT-002",
    actionName: "Evening Ambiance",
    actionDescription: "Dim lights for a cozy evening",
    actionActive: true,
    getActionStepDtos: [
      { id: 4, actionId: 2, facilityType: 5, facilityTypeId: 1, brightnessLevel: 30, isLocked: false, isOpen: false, isActive: true },
      { id: 5, actionId: 2, facilityType: 5, facilityTypeId: 5, brightnessLevel: 20, isLocked: false, isOpen: false, isActive: true }
    ],
    createdBy: 1,
    createdByName: "System",
    createdOn: new Date().toISOString(),
    lastModifiedBy: 1,
    lastModifiedByName: "System",
    lastModifiedOn: new Date().toISOString(),
    isDeleted: false,
    personId: 1,
    peronName: "Owner",
    deletedBy: 0
  }
];

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
  { id: '1', name: 'Main Chandelier', type: 'light', status: 'on', value: 80, room: 'living-room', section: 'indoor' },
  { id: '4', name: 'Porch Light', type: 'light', status: 'on', value: 50, room: 'front-door', section: 'security' },
  { id: '3', name: 'Smart TV', type: 'appliance', status: 'off', room: 'living-room', section: 'indoor', powerUsage: 0 },
  
  { id: '5', name: 'Kitchen Island', type: 'light', status: 'on', value: 100, room: 'kitchen', section: 'indoor' },
  { id: '6', name: 'Refrigerator', type: 'appliance', status: 'on', room: 'kitchen', section: 'indoor', powerUsage: 150 },
  { id: '7', name: 'Coffee Maker', type: 'appliance', status: 'off', room: 'kitchen', section: 'indoor', powerUsage: 0 },
  
  { id: '2', name: 'Desk Lamp', type: 'light', status: 'off', value: 0, room: 'bedroom', section: 'indoor' },
  { id: '31', name: 'Living Room Window', type: 'window', status: 'closed', room: 'living-room', section: 'indoor' },
  { id: '17', name: 'Bedroom Door', type: 'door', status: 'unlocked', room: 'bedroom', section: 'indoor', doorType: 'interior' },
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

export const getMockLogs = (count: number): GetLogDto[] => {
  const users = INITIAL_USERS;
  const actionTypes = [
    'Light Control',
    'Door Security',
    'Scene Activation',
    'Appliance State',
    'Window Control',
    'Profile Sync',
    'Camera Access',
    'System Diagnostic',
    'Air Conditioning'
  ];
  const logsList: GetLogDto[] = [];
  const startMs = Date.now();
  
  for (let i = 1; i <= count; i++) {
    const user = users[(i - 1) % users.length];
    const actType = actionTypes[(i - 1) % actionTypes.length];
    let details = '';
    switch (actType) {
      case 'Light Control':
        details = `Turned ${i % 2 === 0 ? 'on' : 'off'} the light in the ${i % 3 === 0 ? 'Kitchen' : 'Living Room'}. Power consumption is nominal.`;
        break;
      case 'Door Security':
        details = `Attempted to ${i % 2 === 0 ? 'unlock' : 'lock'} the ${i % 3 === 0 ? 'Garage' : 'Front'} Door. Authentication succeeded.`;
        break;
      case 'Scene Activation':
        details = `Activated the custom scene '${i % 2 === 0 ? 'Movie Night' : 'Morning Routine'}' setting all relevant devices automatically.`;
        break;
      case 'Appliance State':
        details = `Set the Smart TV state to ${i % 2 === 0 ? 'Active' : 'Standby'}. Current draw monitored at 120W.`;
        break;
      case 'Window Control':
        details = `Triggered the window actuator. Status changed to ${i % 2 === 0 ? 'closed' : 'open (ventilation)'}.`;
        break;
      case 'Profile Sync':
        details = `Synchronized identity profile settings with security service layer. All permissions verified.`;
        break;
      case 'Camera Access':
        details = `Opened live stream feed for Front Door Camera. Duration: 45s. Resolution auto-scaled to 1080p.`;
        break;
      case 'System Diagnostic':
        details = `Diagnostic code report: Hub status green. Internal latency: ${12 + (i % 5)}ms. No packet loss.`;
        break;
      case 'Air Conditioning':
        details = `Adjusted thermostat target temperature to ${20 + (i % 5)}°C. Compressor mode is running.`;
        break;
    }
    
    logsList.push({
      id: i,
      getPersonDto: user,
      personId: user.id,
      actionType: actType,
      timeOfAction: new Date(startMs - i * 600000).toISOString(), // 10 minutes intervals
      logDetails: details
    });
  }
  return logsList;
};

export const INITIAL_LOGS: GetLogDto[] = getMockLogs(175);

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
    windowIdNames: [{ id: 31, name: "Living Room Window" }],
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
    externalName: "Outdoor Motion Sensor",
    externalId: "EXT-MOT-01",
    isTriggered: true,
    actionIds: [101, 102]
  },
  {
    id: 2,
    externalName: "Driveway Beam Gate",
    externalId: "EXT-BEAM-02",
    isTriggered: false,
    actionIds: [103]
  },
  {
    id: 3,
    externalName: "Front Boundary Laser Fence",
    externalId: "EXT-FENCE-03",
    isTriggered: false,
    actionIds: [104, 105]
  }
];

export const INITIAL_APPLIANCES: GetApplianceDto[] = [
  { id: 3, applianceName: 'Smart TV', applianceId: 'APP-01', applianceType: 'Television', isActive: false, powerActive: false, roomId: 101, roomName: 'Living Room', sectionId: 201, sectionName: 'Indoor' },
  { id: 6, applianceName: 'Refrigerator', applianceId: 'APP-02', applianceType: 'Kitchen Appliance', isActive: true, powerActive: true, roomId: 102, roomName: 'Kitchen', sectionId: 201, sectionName: 'Indoor' },
  { id: 7, applianceName: 'Coffee Maker', applianceId: 'APP-03', applianceType: 'Coffee Machine', isActive: false, powerActive: false, roomId: 102, roomName: 'Kitchen', sectionId: 201, sectionName: 'Indoor' },
  { id: 8, applianceName: 'Air Conditioner', applianceId: 'APP-04', applianceType: 'HVAC', isActive: false, powerActive: false, roomId: 103, roomName: 'Bedroom', sectionId: 201, sectionName: 'Indoor' },
  { id: 12, applianceName: 'Sprinklers', applianceId: 'APP-05', applianceType: 'Other', isActive: false, powerActive: false, roomId: 104, roomName: 'Backyard', sectionId: 202, sectionName: 'Outdoor' },
];

export const INITIAL_DOORS: GetDoorDto[] = [
  { id: 10, doorName: 'Garage Door', doorId: 'DOOR-01', doorType: DoorType.Exterior, isLocked: true, isOpen: false, openedBy: 0, lockedBy: 1, unlockedBy: 0, roomId: 105, roomName: 'Garage', sectionId: 202, sectionName: 'Outdoor', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner' },
  { id: 15, doorName: 'Smart Lock', doorId: 'DOOR-02', doorType: DoorType.Exterior, isLocked: true, isOpen: false, openedBy: 0, lockedBy: 1, unlockedBy: 0, roomId: 106, roomName: 'Front Door', sectionId: 203, sectionName: 'Security', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner' },
  { id: 17, doorName: 'Bedroom Door', doorId: 'DOOR-03', doorType: DoorType.Interior, isLocked: false, isOpen: false, openedBy: 1, lockedBy: 0, unlockedBy: 1, roomId: 103, roomName: 'Bedroom', sectionId: 201, sectionName: 'Indoor', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner' },
];

export const INITIAL_LIGHTS: GetLightDto[] = [
  { id: 1, lightName: 'Main Chandelier', lightId: 'LGT-01', brightnessLevel: 80, isActive: true, powerActive: true, roomId: 101, roomName: 'Living Room', sectionId: 201, sectionName: 'Indoor', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner' },
  { id: 2, lightName: 'Desk Lamp', lightId: 'LGT-02', brightnessLevel: 100, isActive: false, powerActive: false, roomId: 103, roomName: 'Bedroom', sectionId: 201, sectionName: 'Indoor', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner' },
  { id: 4, lightName: 'Porch Light', lightId: 'LGT-03', brightnessLevel: 100, isActive: true, powerActive: true, roomId: 106, roomName: 'Front Door', sectionId: 203, sectionName: 'Security', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner' },
  { id: 5, lightName: 'Kitchen Island', lightId: 'LGT-04', brightnessLevel: 60, isActive: true, powerActive: true, roomId: 102, roomName: 'Kitchen', sectionId: 201, sectionName: 'Indoor', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner' }
];

export const INITIAL_ROOMS = [
  { id: 101, roomName: 'Living Room', roomId: 'living-room', personId: 1, sectionId: 201, isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, peronName: 'Owner', doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] },
  { id: 102, roomName: 'Kitchen', roomId: 'kitchen', personId: 1, sectionId: 201, isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, peronName: 'Owner', doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] },
  { id: 103, roomName: 'Bedroom', roomId: 'bedroom', personId: 1, sectionId: 201, isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, peronName: 'Owner', doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] },
  { id: 104, roomName: 'Bathroom', roomId: 'bathroom', personId: 1, sectionId: 201, isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, peronName: 'Owner', doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] },
  { id: 105, roomName: 'Garage', roomId: 'garage', personId: 1, sectionId: 202, isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, peronName: 'Owner', doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] },
  { id: 106, roomName: 'Front Door', roomId: 'front-door', personId: 1, sectionId: 203, isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, peronName: 'Owner', doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] }
];

export const INITIAL_SECTIONS = [
  { id: 201, sectionName: 'Indoor', sectionId: 'indoor', isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, personId: 1, peronName: 'Owner', rooms: [], doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] },
  { id: 202, sectionName: 'Outdoor', sectionId: 'outdoor', isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, personId: 1, peronName: 'Owner', rooms: [], doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] },
  { id: 203, sectionName: 'Security', sectionId: 'security', isHidden: false, createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', isDeleted: false, personId: 1, peronName: 'Owner', rooms: [], doors: [], lights: [], windows: [], appliances: [], cameras: [], externals: [] }
];

export const INITIAL_WINDOWS: GetWindowDto[] = [
  { id: 31, windowName: 'Living Room Window', windowId: 'WIN-01', isOpen: false, isLocked: true, openedBy: 0, lockedBy: 1, unlockedBy: 0, isActive: true, powerActive: false, roomId: 101, roomName: 'Living Room', sectionId: 201, sectionName: 'Indoor', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner', deletedBy: 0, deletedOn: undefined },
  { id: 32, windowName: 'Kitchen Window', windowId: 'WIN-02', isOpen: true, isLocked: false, openedBy: 1, lockedBy: 0, unlockedBy: 1, isActive: true, powerActive: false, roomId: 102, roomName: 'Kitchen', sectionId: 201, sectionName: 'Indoor', createdBy: 1, createdByName: 'System', createdOn: new Date().toISOString(), lastModifiedBy: 1, lastModifiedByName: 'System', lastModifiedOn: new Date().toISOString(), isDeleted: false, personId: 1, peronName: 'Owner', deletedBy: 0, deletedOn: undefined }
];

export const INITIAL_CAMERAS: GetCameraDto[] = [

  {
    id: 14,
    cameraName: "Front Door Camera",
    cameraId: "CAM-FD-14",
    liveStreamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    recordings: [
      {
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        startTime: "2026-05-21T18:00:00Z",
        endTime: "2026-05-21T18:05:00Z"
      },
      {
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        startTime: "2026-05-21T16:30:00Z",
        endTime: "2026-05-21T16:32:00Z"
      },
      {
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        startTime: "2026-05-21T12:00:00Z",
        endTime: "2026-05-21T12:08:00Z"
      }
    ]
  },
  {
    id: 1,
    cameraName: "Bedroom Camera",
    cameraId: "CAM-BR-01",
    liveStreamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    recordings: [
      {
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        startTime: "2026-05-21T15:20:00Z",
        endTime: "2026-05-21T15:24:00Z"
      }
    ]
  },
  {
    id: 102,
    cameraName: "Gate Camera",
    cameraId: "CAM-GT-02",
    liveStreamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    recordings: [
      {
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        startTime: "2026-05-21T11:10:00Z",
        endTime: "2026-05-21T11:15:00Z"
      }
    ]
  },
  {
    id: 103,
    cameraName: "Porch Camera",
    cameraId: "CAM-PR-03",
    liveStreamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    recordings: [
      {
        filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        startTime: "2026-05-21T09:40:00Z",
        endTime: "2026-05-21T09:48:00Z"
      }
    ]
  }
];


