import * as React from 'react';
import { Sidebar, NavView } from './components/Sidebar';
import { DeviceCard } from './components/DeviceCard';
import { 
  INITIAL_DEVICES, 
  ROOMS, 
  INITIAL_SCENES, 
  SECTIONS,
  INITIAL_LOGS,
  INITIAL_CONTACTS,
  CONTACT_CATEGORIES,
  INITIAL_USER,
  INITIAL_USERS,
  GENERAL_CAMERAS,
  INITIAL_HARDWARES,
  INITIAL_EXTERNALS,
  INITIAL_CAMERAS,
  INITIAL_APPLIANCES,
  INITIAL_DOORS,
  INITIAL_ROOMS,
  INITIAL_LIGHTS,
  INITIAL_SECTIONS,
  INITIAL_WINDOWS,
  INITIAL_ACTIONS
} from './constants';
import { 
  Device, 
  Scene, 
  Room, 
  Section, 
  GetLogDto, 
  Contact as ContactType, 
  ContactCategory, 
  UserProfile,
  CreatePersonDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserAuthorizationCode,
  GetPersonDto,
  Role,
  Gender,
  UpdatePersonDto,
  PersonResponseModel,
  GetAddressDto,
  GetContactDetailsDto,
  GetHardwareDto,
  GetExternalDto,
  GetCameraDto,
  CreateCameraDto,
  UpdateCameraDto,
  GetRecordingDto,
  GetApplianceDto,
  GetDoorDto,
  GetLightDto,
  GetWindowDto,
  UpdateHardwareDto,
  CreateHardwareDto,
  UpdateExternalDto,
  CreateExternalDto,
  CreateActionDto,
  UpdateActionDto,
  CreateActionStepDto,
  UpdateActionStepDto,
  GetActionStepDto,
  GetActionDto,
  FacilityType,
  ChatDto,
  ChatParticipantDto,
  MessageDto,
  MessageType,
  SendMessageDto,
  MessageAttachmentDto,
  CreateDirectChatDto,
  CreateGroupChatDto,
  CreateRoomDto
} from './types';
import { INITIAL_CHATS, INITIAL_CHAT_MESSAGES } from './chatData';
import { toast, Toaster } from 'sonner';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { Checkbox } from './components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import { Switch } from "./components/ui/switch";
import { Calendar } from "./components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { 
  RefreshCw,
  Bell, 
  Search, 
  Cloud, 
  Thermometer, 
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  Camera,
  Plus,
  Play,
  Film,
  Sun,
  Home as HomeIcon,
  Sofa,
  Utensils,
  Bed,
  Bath,
  Car,
  Trees,
  Shield,
  Building2,
  Settings2,
  Layers,
  LayoutGrid,
  LayoutDashboard,
  UserCog,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  Power,
  Lightbulb,
  Globe,
  Video,
  ClipboardList,
  Contact,
  UserCircle,
  Layout as WindowIcon,
  Mail,
  Phone,
  MapPin,
  PlusCircle,
  Trash2,
  Edit2,
  Pencil,
  Undo2,
  Check,
  Edit3,
  Key,
  ClipboardCheck,
  ShieldAlert,
  MoreVertical,
  User as UserIcon,
  Heart,
  Wrench,
  Save,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  Image as ImageIcon,
  FileText,
  Download,
  Fingerprint,
  CalendarDays,
  X,
  Filter,
  CheckCheck,
  VideoOff,
  EyeOff,
  ImagePlus,
  History,
  Smile,
  MessageSquarePlus,
  XCircle,
  Pause,
  Reply,
  CornerUpLeft,
  Settings,
  UserPlus,
  Cpu,
  Radio,
  Copy,
  Loader2,
  Trash,
  Info,
  Maximize,
  Minimize,
  CameraOff,
  ScanLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client';
import { format, subHours, subSeconds } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

const iconMap: Record<string, any> = {
  Film,
  Sun,
  Home: HomeIcon,
  Sofa,
  Utensils,
  Bed,
  Bath,
  Car,
  Trees,
  Shield,
  Layers,
  UserCircle,
  Users,
  ShieldAlert,
  Key,
  Heart,
  Wrench,
  Contact,
  Phone,
  Mail,
  MapPin,
  Camera,
  Zap,
  Bell,
  Search,
  Building2,
  Smartphone
};

import { ImageCropperModal } from './components/ImageCropperModal';

export default function App() {
  const [devices, setDevices] = React.useState<Device[]>(INITIAL_DEVICES);
  const [scenes, setScenes] = React.useState<Scene[]>(INITIAL_SCENES);
  const [hardwares, setHardwares] = React.useState<GetHardwareDto[]>(INITIAL_HARDWARES);
  const [externals, setExternals] = React.useState<GetExternalDto[]>(INITIAL_EXTERNALS);
  const [cameras, setCameras] = React.useState<GetCameraDto[]>(INITIAL_CAMERAS);
  const [appliances, setAppliances] = React.useState<GetApplianceDto[]>(INITIAL_APPLIANCES);
  const [doors, setDoors] = React.useState<GetDoorDto[]>(INITIAL_DOORS);
  const [lights, setLights] = React.useState<GetLightDto[]>(INITIAL_LIGHTS);
  const [windows, setWindows] = React.useState<GetWindowDto[]>(INITIAL_WINDOWS);
  const [rooms, setRooms] = React.useState<Room[]>(ROOMS);
  const [sections, setSections] = React.useState<Section[]>(SECTIONS);
  const [roomSearchQuery, setRoomSearchQuery] = React.useState('');
  const [sectionSearchQuery, setSectionSearchQuery] = React.useState('');
  const [activeView, setActiveView] = React.useState<NavView>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [facilitySearchQuery, setFacilitySearchQuery] = React.useState('');
  const [facilitySortBy, setFacilitySortBy] = React.useState<'room' | 'section'>('room');

  // New State
  const [logs, setLogs] = React.useState<GetLogDto[]>(INITIAL_LOGS);
  const [visibleLogsCount, setVisibleLogsCount] = React.useState<number>(50);
  const [selectedLog, setSelectedLog] = React.useState<GetLogDto | null>(null);
  const [isViewLogOpen, setIsViewLogOpen] = React.useState<boolean>(false);
  const loaderRef = React.useRef<HTMLDivElement>(null);
  const [isPagingLoading, setIsPagingLoading] = React.useState<boolean>(false);

  const [userProfile, setUserProfile] = React.useState<UserProfile>(INITIAL_USER);

  const addLogEntry = React.useCallback((actionType: string, logDetails: string) => {
    const newLog: GetLogDto = {
      id: Date.now(),
      getPersonDto: userProfile,
      personId: userProfile.id,
      actionType: actionType,
      timeOfAction: new Date().toISOString(),
      logDetails: logDetails
    };
    setLogs(prev => [newLog, ...prev]);
  }, [userProfile]);

  // Infinite scroll dynamic loader context
  React.useEffect(() => {
    if (activeView !== 'logs') return;
    if (visibleLogsCount >= logs.length) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isPagingLoading) {
        setIsPagingLoading(true);
        setTimeout(() => {
          setVisibleLogsCount(prev => prev + 50);
          setIsPagingLoading(false);
        }, 500);
      }
    }, { rootMargin: '120px' });

    const currentRef = loaderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [activeView, visibleLogsCount, logs.length, isPagingLoading]);

  const [contacts, setContacts] = React.useState<ContactType[]>(INITIAL_CONTACTS);
  const [contactCategories, setContactCategories] = React.useState<ContactCategory[]>(CONTACT_CATEGORIES);
  const [contactSearchQuery, setContactSearchQuery] = React.useState('');
  const [contactSortCategory, setContactSortCategory] = React.useState<string>('all');
  const [contactView, setContactView] = React.useState<'overview' | 'all'>('overview');
  const [allUsers, setAllUsers] = React.useState<GetPersonDto[]>(INITIAL_USERS);
  // Person/User Modals
  const [isAddPersonOpen, setIsAddPersonOpen] = React.useState(false);
  const [isEditPersonRoleOpen, setIsEditPersonRoleOpen] = React.useState(false);
  const [isViewPersonDetailsOpen, setIsViewPersonDetailsOpen] = React.useState(false);
  const [viewingPerson, setViewingPerson] = React.useState<GetPersonDto | null>(null);
  const [pendingUserAction, setPendingUserAction] = React.useState<{ type: 'disable' | 'delete' | 'toggle-disable' | 'delete-address' | 'delete-contact' | 'update-role', userId?: number, index?: number, targetRole?: Role } | null>(null);
  const [editingPersonId, setEditingPersonId] = React.useState<number | null>(null);
  const [newPerson, setNewPerson] = React.useState<CreatePersonDto>({
    relation: 'Relative',
    createPersonDetailsDto: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: 0,
      gender: Gender.Male,
      imageUrl: null
    },
    createUserDto: {
      userName: '',
      password: '',
      authorizationCode: '',
      role: Role.Visitor
    }
  });
  const [updateUserRoleData, setUpdateUserRoleData] = React.useState<UpdateUserDto>({
    id: 0,
    userName: '',
    password: '',
    role: Role.Visitor
  });

  // Hardware and Externals Modals
  const [selectedHardware, setSelectedHardware] = React.useState<GetHardwareDto | null>(null);
  const [isHardwareDetailOpen, setIsHardwareDetailOpen] = React.useState(false);
  const [isAddHardwareOpen, setIsAddHardwareOpen] = React.useState(false);
  const [isEditHardwareOpen, setIsEditHardwareOpen] = React.useState(false);
  const [hardwareForm, setHardwareForm] = React.useState<Partial<GetHardwareDto>>({});

  const [selectedExternal, setSelectedExternal] = React.useState<GetExternalDto | null>(null);
  const [isViewExternalOpen, setIsViewExternalOpen] = React.useState(false);
  const [isAddExternalOpen, setIsAddExternalOpen] = React.useState(false);
  const [isEditExternalOpen, setIsEditExternalOpen] = React.useState(false);
  const [externalForm, setExternalForm] = React.useState<Partial<GetExternalDto>>({});

  // Logs Filter
  const [logStartDate, setLogStartDate] = React.useState<string>('');
  const [logEndDate, setLogEndDate] = React.useState<string>('');

  // Profile Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isAuthCodeModalOpen, setIsAuthCodeModalOpen] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState<UpdateUserPasswordDto>({ 
    id: 1, 
    userName: 'ini_makinde', 
    token: '', 
    newPassword: '', 
    authorizationCode: '' 
  });
  const [authCodeData, setAuthCodeData] = React.useState<UpdateUserAuthorizationCode>({ 
    id: 1, 
    userName: 'ini_makinde', 
    password: '', 
    token: '', 
    newAuthorizationCode: '' 
  });

  // Add Device State
  const [isAddDeviceOpen, setIsAddDeviceOpen] = React.useState(false);
  const [newDevice, setNewDevice] = React.useState<Partial<Device>>({
    name: '',
    type: 'light',
    room: '',
    section: '',
    doorType: 'interior',
    ipAddress: '',
    username: '',
    password: '',
    streamPath: '',
    port: 80,
    applianceType: 1
  });

  // Pre-select room/section when opening Add Device dialog
  React.useEffect(() => {
    if (isAddDeviceOpen) {
      if (activeView.startsWith('room-')) {
        const roomId = activeView.replace('room-', '');
        const room = rooms.find(r => r.id === roomId);
        setNewDevice(prev => ({ ...prev, room: roomId, section: room?.section || '' }));
      } else if (activeView === 'user-room') {
        setNewDevice(prev => ({ ...prev, room: 'bedroom', section: 'indoor' }));
      }
    }
  }, [isAddDeviceOpen, activeView, rooms]);

  // Add Room State
  const [actions, setActions] = React.useState<GetActionDto[]>(INITIAL_ACTIONS);
  const [selectedAction, setSelectedAction] = React.useState<GetActionDto | null>(null);
  const [isViewActionOpen, setIsViewActionOpen] = React.useState(false);
  const [isEditActionOpen, setIsEditActionOpen] = React.useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = React.useState(false);
  const [isAddActionStepOpen, setIsAddActionStepOpen] = React.useState(false);
  const [isEditActionStepOpen, setIsEditActionStepOpen] = React.useState(false);
  const [selectedActionStep, setSelectedActionStep] = React.useState<GetActionStepDto | null>(null);
  const [actionStepForm, setActionStepForm] = React.useState<CreateActionStepDto>({
    actionId: 0,
    facilityType: FacilityType.Appliance,
    facilityTypeId: 0,
    brightnessLevel: 0,
    isLocked: false,
    isOpen: false,
    isActive: false
  });

  const appNamesDetailList = React.useMemo(() => {
    return {
      applianceIdNames: appliances.map(a => ({ id: a.id, name: a.applianceName })),
      cameraIdNames: cameras.map(c => ({ id: c.id, name: c.cameraName })),
      lightIdNames: lights.map(l => ({ id: l.id, name: l.lightName })),
      windowIdNames: windows.map(w => ({ id: w.id, name: w.windowName })),
      doorIdNames: doors.map(d => ({ id: d.id, name: d.doorName })),
      externalIdNames: externals.map(e => ({ id: e.id, name: e.externalName })),
      personIdNames: allUsers.map(u => ({ id: u.id, name: `${u.getPersonDetailsDto.firstName} ${u.getPersonDetailsDto.lastName}` })),
      contactCategoryIdNames: contactCategories.map(c => ({ id: c.id, name: c.name })),
      actionIdNames: actions.map(a => ({ id: a.id, name: a.actionName })),
      applianceType: [
        { id: 1, name: 'TV' },
        { id: 2, name: 'Fridge' },
        { id: 3, name: 'Coffee Maker' },
        { id: 4, name: 'AC' },
        { id: 5, name: 'Sprinklers' }
      ],
      gender: [
        { id: 1, name: 'Male' },
        { id: 2, name: 'Female' },
        { id: 3, name: 'Other' }
      ],
      doorType: [
        { id: 1, name: 'Interior' },
        { id: 2, name: 'Exterior' }
      ],
      facilityType: [
        { id: FacilityType.Appliance, name: 'Appliance' },
        { id: FacilityType.Camera, name: 'Camera' },
        { id: FacilityType.Door, name: 'Door' },
        { id: FacilityType.External, name: 'External' },
        { id: FacilityType.Light, name: 'Light' },
        { id: FacilityType.Window, name: 'Window' }
      ],
      role: [
        { id: 1, name: 'Owner' },
        { id: 2, name: 'Wife' },
        { id: 3, name: 'Husband' },
        { id: 4, name: 'Son' },
        { id: 5, name: 'Daughter' },
        { id: 6, name: 'Relative' },
        { id: 7, name: 'Visitor' }
      ],
      roomIds: INITIAL_ROOMS.map(r => ({ id: r.id, name: r.roomName })),
      sectionIds: INITIAL_SECTIONS.map(s => ({ id: s.id, name: s.sectionName })),
    };
  }, [appliances, cameras, lights, windows, doors, externals, allUsers, contactCategories, actions]);
  const [actionForm, setActionForm] = React.useState<CreateActionDto>({
    actionName: '',
    description: '',
    personId: 1
  });

  const [isAddRoomOpen, setIsAddRoomOpen] = React.useState(false);
  const [roomLocked, setRoomLocked] = React.useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = React.useState(false);
  const [generatedToken, setGeneratedToken] = React.useState("");
  const [newGroupImageUrl, setNewGroupImageUrl] = React.useState("");
  const [editingGroupId, setEditingGroupId] = React.useState<number | null>(null);
  const [isEditGroupOpen, setIsEditGroupOpen] = React.useState(false);
  const [isAddSceneOpen, setIsAddSceneOpen] = React.useState(false);
  const [newRoom, setNewRoom] = React.useState<Partial<Room & CreateRoomDto>>({
    name: '',
    section: '',
    icon: 'Sofa'
  });
  const [isEditRoomOpen, setIsEditRoomOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Partial<Room> | null>(null);

  // Edit Device State
  const [isEditDeviceOpen, setIsEditDeviceOpen] = React.useState(false);
  const [editingDevice, setEditingDevice] = React.useState<Partial<Device> | null>(null);

  // Contact Modals
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = React.useState(false);
  const [isViewContactOpen, setIsViewContactOpen] = React.useState(false);
  const [viewingContact, setViewingContact] = React.useState<ContactType | null>(null);
  const [isDeleteContactOpen, setIsDeleteContactOpen] = React.useState(false);
  const [contactToDelete, setContactToDelete] = React.useState<ContactType | null>(null);
  const [editingContactId, setEditingContactId] = React.useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryDescription, setNewCategoryDescription] = React.useState('');
  const [newCategoryIcon, setNewCategoryIcon] = React.useState('UserCircle');
  const [isEditCategoryOpen, setIsEditCategoryOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ContactCategory | null>(null);
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const [cropImageSrc, setCropImageSrc] = React.useState('');
  const [cropTarget, setCropTarget] = React.useState<'contact' | 'profile'>('contact');
  const [newContact, setNewContact] = React.useState<{
    firstName: string;
    lastName: string;
    imageUrl: string;
    contactCategory: number;
    personId: number;
    contactDetails: { phoneNumber: string; email: string; id?: number; contactId?: number; personDetailsId?: number }[];
    address: { 
      numberLine: string; 
      street: string; 
      city: string; 
      region: string; 
      state: string; 
      country: string; 
      postalCode: string;
      id?: number;
      contactId?: number;
      personId?: number;
    }[];
  }>({
    firstName: '',
    lastName: '',
    imageUrl: '',
    contactCategory: 0,
    personId: 1,
    contactDetails: [{ phoneNumber: '', email: '', personDetailsId: 0 }],
    address: [{ numberLine: '', street: '', city: '', region: '', state: '', country: '', postalCode: '' }]
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'contact' | 'profile') => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result?.toString() || '');
        setCropTarget(target);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    if (cropTarget === 'contact') {
      setNewContact(prev => ({ ...prev, imageUrl: croppedImageUrl }));
    } else {
      setUserProfile(prev => ({ 
        ...prev, 
        getPersonDetailsDto: { ...prev.getPersonDetailsDto, imageUrl: croppedImageUrl } 
      }));
    }
  };

  // Section Modals
  const [isAddSectionOpen, setIsAddSectionOpen] = React.useState(false);
  const [isEditSectionOpen, setIsEditSectionOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<Partial<Section> | null>(null);
  const [newSectionName, setNewSectionName] = React.useState('');
  const [newSectionType, setNewSectionType] = React.useState<'general' | 'secretive'>('general');
  const [newSectionIsHidden, setNewSectionIsHidden] = React.useState(false);

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authCode, setAuthCode] = React.useState('');
  const [authError, setAuthError] = React.useState(false);
  const [onAuthSuccess, setOnAuthSuccess] = React.useState<(() => void) | null>(null);

  // Camera Modal
  const [isCameraModalOpen, setIsCameraModalOpen] = React.useState(false);
  const [selectedCamera, setSelectedCamera] = React.useState<Device | null>(null);
  const [playingRecordingPath, setPlayingRecordingPath] = React.useState<string | null>(null);
  const [cameraPlaybackOffset, setCameraPlaybackOffset] = React.useState(0);
  const [modalCurrentTime, setModalCurrentTime] = React.useState(new Date());
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [isScreensaverOpen, setIsScreensaverOpen] = React.useState(false);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const inactivityTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Inactivity Logic
  const resetInactivityTimer = React.useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setIsScreensaverOpen(true);
    }, 60000); // 1 minute
  }, []);

  const handleActivity = React.useCallback(() => {
    if (inactivityTimerRef.current) {
      resetInactivityTimer();
    }
  }, [resetInactivityTimer]);

  React.useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer start
    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [handleActivity, resetInactivityTimer]);

  // Appliance Modal
  const [isApplianceModalOpen, setIsApplianceModalOpen] = React.useState(false);
  const [selectedAppliance, setSelectedAppliance] = React.useState<Device | null>(null);

  // Door Modal
  const [isDoorModalOpen, setIsDoorModalOpen] = React.useState(false);
  const [selectedDoor, setSelectedDoor] = React.useState<Device | null>(null);

  // Light Modal
  const [isLightModalOpen, setIsLightModalOpen] = React.useState(false);
  const [selectedLight, setSelectedLight] = React.useState<Device | null>(null);

  // View Room Modal
  const [isViewRoomOpen, setIsViewRoomOpen] = React.useState(false);
  const [viewingRoom, setViewingRoom] = React.useState<Room | null>(null);

  // Window Modal
  const [isViewWindowOpen, setIsViewWindowOpen] = React.useState(false);
  const [selectedWindow, setSelectedWindow] = React.useState<Device | null>(null);

  // Section Modal
  const [isViewSectionOpen, setIsViewSectionOpen] = React.useState(false);
  const [viewingSection, setViewingSection] = React.useState<Section | null>(null);

  // Chat State
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = React.useState("");
  const isChatModalOpenRef = React.useRef(isChatModalOpen);
  React.useEffect(() => {
    isChatModalOpenRef.current = isChatModalOpen;
  }, [isChatModalOpen]);
  const [chatPopups, setChatPopups] = React.useState<MessageDto[]>([]);
  const [userSearchQuery, setUserSearchQuery] = React.useState("");
  const [isAddFingerprintOpen, setIsAddFingerprintOpen] = React.useState(false);
  const [isRegisterNfidOpen, setIsRegisterNfidOpen] = React.useState(false);
  const [selectedNfidUserId, setSelectedNfidUserId] = React.useState<string>("");
  const [selectedNfidHardwareId, setSelectedNfidHardwareId] = React.useState<string>("");
  const [fingerprintImages, setFingerprintImages] = React.useState<string[]>([]);
  const [selectedFingerprintUserId, setSelectedFingerprintUserId] = React.useState<string>("");
  const [chats, setChats] = React.useState<ChatDto[]>([]);
  const [chatMessages, setChatMessages] = React.useState<MessageDto[]>([]);
  const [newGroupRoom, setNewGroupRoom] = React.useState<string>("none");
  const [newGroupSection, setNewGroupSection] = React.useState<string>("");
  const [chatInput, setChatInput] = React.useState("");
  const socketRef = React.useRef<any>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [playingAudioId, setPlayingAudioId] = React.useState<number | null>(null);
  const [playingProgress, setPlayingProgress] = React.useState(0);
  const [replyingTo, setReplyingTo] = React.useState<MessageDto | null>(null);
  const recordingTimerRef = React.useRef<any>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [activeChatId, setActiveChatId] = React.useState<number | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = React.useState("");
  const [isChatSearchVisible, setIsChatSearchVisible] = React.useState(false);
  const [isUploadPreviewOpen, setIsUploadPreviewOpen] = React.useState(false);
  const [uploadPreviewFiles, setUploadPreviewFiles] = React.useState<File[]>([]);
  const [uploadPreviewType, setUploadPreviewType] = React.useState<'image' | 'file' | null>(null);
  const [uploadPreviewText, setUploadPreviewText] = React.useState("");

  // New Chat Selection State (for when user has no chats)
  const [isNewChatOpen, setIsNewChatOpen] = React.useState(false);
  const [uploadPreviewActiveIndex, setUploadPreviewActiveIndex] = React.useState(0);
  const [isGroupMode, setIsGroupMode] = React.useState(false);
  const [selectedParticipants, setSelectedParticipants] = React.useState<number[]>([]);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [newGroupDescription, setNewGroupDescription] = React.useState("");

  React.useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  React.useEffect(() => {
    let interval: any;
    if (playingAudioId) {
      interval = setInterval(() => {
        setPlayingProgress(prev => {
          const currentMsg = chatMessages.find(m => m.id === playingAudioId);
          const duration = currentMsg?.duration || 10; // Fallback
          if (prev >= duration) {
            setPlayingAudioId(null);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      setPlayingProgress(0);
    }
    return () => clearInterval(interval);
  }, [playingAudioId, chatMessages]);

  React.useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("chat:history", (history: any[]) => {
      setChatMessages(history);
    });

    socketRef.current.on("chat:message", (msg: any) => {
      setChatMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        
        if (!isChatModalOpenRef.current && msg.senderId !== userProfile.id) {
          setChatPopups(p => {
             if (p.some(p => p.id === msg.id)) return p;
             return [...p, msg];
          });
          setTimeout(() => {
            setChatPopups(p => p.filter(x => x.id !== msg.id));
          }, 5000);
        }
        
        return [...prev, msg];
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Camera Fullscreen Logic
  const toggleCameraFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Playback Sync Logic
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !isCameraModalOpen) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setCameraPlaybackOffset(progress);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.playbackRate = playbackSpeed;
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isCameraModalOpen, playbackSpeed]);

  const handleCameraPlaybackChange = (value: number[]) => {
    if (videoRef.current && videoRef.current.duration) {
      const newTime = (value[0] / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setCameraPlaybackOffset(value[0]);
    }
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setModalCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatModalOpen]);

  const handleSendMessage = () => {
    if (!chatInput.trim() || activeChatId === null) return;
    const msg: MessageDto = {
      id: Date.now(),
      chatId: activeChatId,
      senderPersonId: userProfile.id,
      senderName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
      senderProfileImage: userProfile.getPersonDetailsDto.imageUrl,
      content: chatInput,
      type: MessageType.Text,
      isEdited: false,
      isDeleted: false,
      sentAt: new Date().toISOString(),
      attachments: [],
      replyToId: replyingTo?.id
    };
    
    // Update local state and emit
    setChatMessages(prev => [...prev, msg]);
    if (socketRef.current) {
      socketRef.current.emit("chat:message", msg);
    }
    
    // Update last message in chats
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: msg } : c));
    
    setChatInput("");
    setReplyingTo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    if (e.target.files && e.target.files.length > 0 && activeChatId !== null) {
      const files = type === 'file' ? [e.target.files[0]] : Array.from(e.target.files);
      setUploadPreviewFiles(files);
      setUploadPreviewType(type);
      setUploadPreviewText("");
      setUploadPreviewActiveIndex(0);
      setIsUploadPreviewOpen(true);
      e.target.value = '';
    }
  };

  const handleSendUpload = () => {
    if (uploadPreviewFiles.length === 0 || activeChatId === null || !uploadPreviewType) return;
    
    setIsUploadPreviewOpen(false);
    
    const uploadPromises = uploadPreviewFiles.map(file => {
      return new Promise<MessageAttachmentDto>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            fileName: file.name,
            filePath: reader.result?.toString() || '',
            contentType: file.type,
            fileSize: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises).then(attachments => {
      const type = uploadPreviewType;
      let textContent = uploadPreviewText.trim();
      if (!textContent) {
        textContent = attachments.length > 1 ? `Sent ${attachments.length} ${type}s` : `Sent a ${type}`;
      }

      const msg: MessageDto = {
        id: Date.now() + Math.random(),
        chatId: activeChatId,
        senderPersonId: userProfile.id,
        senderName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
        senderProfileImage: userProfile.getPersonDetailsDto.imageUrl,
        content: textContent,
        type: type === 'image' ? MessageType.Image : MessageType.File,
        isEdited: false,
        isDeleted: false,
        sentAt: new Date().toISOString(),
        attachments: attachments,
        replyToId: replyingTo?.id
      };
      
      setChatMessages(prev => [...prev, msg]);
      if (socketRef.current) {
        socketRef.current.emit("chat:message", msg);
      }
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: msg } : c));
      
      setUploadPreviewFiles([]);
      setUploadPreviewText("");
      setUploadPreviewType(null);
      setReplyingTo(null);
    });
  };

  const startDirectChat = (person: GetPersonDto) => {
    // Check if chat already exists
    const existingChat = chats.find(c => !c.isGroup && c.participants.some(p => p.personId === person.id));
    if (existingChat) {
      setActiveChatId(existingChat.id);
    } else {
      const newChat: ChatDto = {
        id: Date.now(),
        name: `${person.getPersonDetailsDto.firstName} ${person.getPersonDetailsDto.lastName}`,
        isGroup: false,
        imageUrl: person.getPersonDetailsDto.imageUrl,
        createdAt: new Date().toISOString(),
        participants: [
          {
            personId: userProfile.id,
            fullName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
            profileImageUrl: userProfile.getPersonDetailsDto.imageUrl,
            isAdmin: true,
            isOnline: true
          },
          {
            personId: person.id,
            fullName: `${person.getPersonDetailsDto.firstName} ${person.getPersonDetailsDto.lastName}`,
            profileImageUrl: person.getPersonDetailsDto.imageUrl,
            isAdmin: false,
            isOnline: !person.disabled
          }
        ],
        unreadCount: 0
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }
    setIsNewChatOpen(false);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedParticipants.length === 0) return;

    // Apply CreateGroupChatDto
    const groupPayload: CreateGroupChatDto = {
      name: newGroupName,
      description: newGroupDescription,
      imageUrl: newGroupImageUrl || `https://picsum.photos/seed/${newGroupName}/100/100`,
      participantPersonIds: [userProfile.id, ...selectedParticipants]
    };

    const participants: ChatParticipantDto[] = [
      {
        personId: userProfile.id,
        fullName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
        profileImageUrl: userProfile.getPersonDetailsDto.imageUrl,
        isAdmin: true,
        isOnline: true
      },
      ...selectedParticipants.map(id => {
        const p = allUsers.find(u => u.id === id);
        return {
          personId: id,
          fullName: p ? `${p.getPersonDetailsDto.firstName} ${p.getPersonDetailsDto.lastName}` : 'Unknown',
          profileImageUrl: p?.getPersonDetailsDto.imageUrl,
          isAdmin: false,
          isOnline: !(p?.disabled)
        };
      })
    ];

    const newChat: ChatDto = {
      id: Date.now(),
      name: groupPayload.name,
      description: groupPayload.description,
      isGroup: true,
      imageUrl: groupPayload.imageUrl,
      createdAt: new Date().toISOString(),
      participants,
      unreadCount: 0,
      roomId: newGroupRoom === "none" ? undefined : parseInt(newGroupRoom),
      sectionId: newGroupSection ? parseInt(newGroupSection) : undefined
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setIsNewChatOpen(false);
    setIsGroupMode(false);
    setSelectedParticipants([]);
    setNewGroupName("");
    setNewGroupDescription("");
  };

  // Room Lock State
  const handleUpdateGroup = () => {
    if (!editingGroupId || !newGroupName.trim()) return;

    const participants: ChatParticipantDto[] = [
      {
        personId: userProfile.id,
        fullName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
        profileImageUrl: userProfile.getPersonDetailsDto.imageUrl,
        isAdmin: true,
        isOnline: true
      },
      ...selectedParticipants.map(id => {
        const p = allUsers.find(u => u.id === id);
        return {
          personId: id,
          fullName: p ? `${p.getPersonDetailsDto.firstName} ${p.getPersonDetailsDto.lastName}` : 'Unknown',
          profileImageUrl: p?.getPersonDetailsDto.imageUrl,
          isAdmin: false,
          isOnline: !(p?.disabled)
        };
      })
    ];

    setChats(prev => prev.map(chat => 
      chat.id === editingGroupId 
        ? { 
            ...chat, 
            name: newGroupName, 
            description: newGroupDescription, 
            imageUrl: newGroupImageUrl || chat.imageUrl,
            participants: participants,
            roomId: newGroupRoom === "none" ? undefined : parseInt(newGroupRoom),
            sectionId: newGroupSection ? parseInt(newGroupSection) : undefined
          } 
        : chat
    ));
    setIsEditGroupOpen(false);
    setEditingGroupId(null);
  };

  const toggleRoomLock = (roomId: string) => {
    const nextState = !roomLocked;
    setRoomLocked(nextState);
    
    // Toggle all doors and windows in this room
    setDevices(prev => prev.map(d => {
      if (d.room === roomId && (d.type === 'door' || d.type === 'window')) {
        return { ...d, status: nextState ? 'locked' : 'unlocked' };
      }
      return d;
    }));
    
    // Add log
    addLogEntry('Door Security', `${nextState ? 'Locked' : 'Unlocked'} all security points in ${rooms.find(r => r.id === roomId)?.name || 'the room'}`);
  };

  const handleUpdateProfile = () => {
    requestAuth(() => {
      // Construct UpdatePersonDto for logic demonstration
    const updateData: UpdatePersonDto = {
      id: userProfile.id,
      updatePersonDetailsDto: {
        firstName: userProfile.getPersonDetailsDto.firstName,
        lastName: userProfile.getPersonDetailsDto.lastName,
        gender: userProfile.getPersonDetailsDto.gender,
        imageUrl: userProfile.getPersonDetailsDto.imageUrl,
        getContactDetailsDtos: userProfile.getPersonDetailsDto.getContactDetailsDtos,
        updateAddressDtos: userProfile.getPersonDetailsDto.getAddressDtos.map(a => ({
          id: a.id,
          numberLine: a.numberLine,
          street: a.street,
          city: a.city,
          region: a.region,
          state: a.state,
          country: a.country,
          postalCode: a.postalCode || ''
        }))
      },
      updateUserDto: {
        id: userProfile.getUserDto.id,
        userName: userProfile.getUserDto.userName,
        password: '', 
        role: userProfile.getUserDto.role
      }
    };

    // Simulate wrapping in PersonResponseModel
    const mockResponse: PersonResponseModel = {
      isSuccess: true,
      message: 'Profile synchronization successful',
      errors: [],
      data: userProfile
    };

    if (mockResponse.isSuccess) {
      addLogEntry('Profile Sync', 'Updated profile identity (Synced with UpdatePersonDto)');
    }
  });
};

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: ContactCategory = {
      id: Math.floor(Math.random() * 1000),
      name: newCategoryName,
      description: newCategoryDescription,
      icon: newCategoryIcon,
      personId: 1
    };
    setContactCategories(prev => [...prev, newCat]);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('UserCircle');
    setIsAddCategoryOpen(false);
  };

  const handleEditCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    setContactCategories(prev => prev.map(cat => cat.id === editingCategory.id ? {
      ...cat,
      name: newCategoryName,
      description: newCategoryDescription,
      icon: newCategoryIcon,
    } : cat));
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('UserCircle');
    setIsEditCategoryOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: number) => {
    setContactCategories(prev => prev.filter(cat => cat.id !== id));
    // Reset contacts in this category to other?
    const otherCat = contactCategories.find(c => c.name.toLowerCase() === 'other');
    if (otherCat) {
      setContacts(prev => prev.map(c => c.getContactCategoryDto.id === id ? { ...c, getContactCategoryDto: otherCat } : c));
    }
  };

  const handleAddContact = () => {
    if (!newContact.firstName || !newContact.lastName) return;
    
    const selectedCategory = contactCategories.find(c => c.id === newContact.contactCategory) || contactCategories[0];

    if (editingContactId !== null) {
      setContacts(prev => prev.map(c => c.id === editingContactId ? {
        ...c,
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        getContactCategoryDto: selectedCategory,
        imageUrl: newContact.imageUrl || '',
        contactDetails: newContact.contactDetails.map((d, i) => ({
          ...d,
          id: d.id || i + 1,
          contactId: editingContactId,
          personDetailsId: d.personDetailsId || 0
        })),
        address: newContact.address.map((a, i) => ({
          ...a,
          id: a.id || i + 1,
          contactId: editingContactId,
          personId: newContact.personId
        })),
      } : c));
      setEditingContactId(null);
    } else {
      const newId = Math.floor(Math.random() * 10000);
      const contact: ContactType = {
        id: newId,
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        getContactCategoryDto: selectedCategory,
        imageUrl: newContact.imageUrl || '',
        contactDetails: newContact.contactDetails.map((d, i) => ({
          phoneNumber: d.phoneNumber,
          email: d.email,
          id: i + 1,
          contactId: newId,
          personDetailsId: d.personDetailsId || 0
        })),
        address: newContact.address.map((a, i) => ({
          ...a,
          id: i + 1,
          contactId: newId,
          personId: newContact.personId
        })),
      };
      setContacts(prev => [...prev, contact]);
    }
    
    setIsAddContactOpen(false);
    setNewContact({
      firstName: '',
      lastName: '',
      imageUrl: '',
      contactCategory: 0,
      personId: 1,
      contactDetails: [{ phoneNumber: '', email: '', personDetailsId: 0 }],
      address: [{ numberLine: '', street: '', city: '', region: '', state: '', country: '', postalCode: '' }]
    });
  };

  const handleEditContact = (contact: ContactType) => {
    setNewContact({
      firstName: contact.firstName,
      lastName: contact.lastName,
      contactCategory: contact.getContactCategoryDto.id,
      imageUrl: contact.imageUrl || '',
      personId: contact.address[0]?.personId || 1,
      contactDetails: contact.contactDetails.length > 0 
        ? contact.contactDetails.map(d => ({ ...d })) 
        : [{ phoneNumber: '', email: '', personDetailsId: 0 }],
      address: contact.address.length > 0 
        ? contact.address.map(a => ({ ...a })) 
        : [{ numberLine: '', street: '', city: '', region: '', state: '', country: '', postalCode: '' }]
    });
    setEditingContactId(contact.id);
    setIsAddContactOpen(true);
  };

  const handleDeleteContact = () => {
    if (contactToDelete) {
      setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
      setContactToDelete(null);
      setIsDeleteContactOpen(false);
    }
  };

  const handleAddSection = () => {
    requestAuth(() => {
      if (!newSectionName.trim()) return;
      const newSec: Section = {
        id: newSectionName.toLowerCase().replace(/\s+/g, '-'),
        name: newSectionName,
        type: newSectionType,
        isHidden: newSectionIsHidden
      };
      setSections(prev => [...prev, newSec]);
      setNewSectionName('');
      setNewSectionType('general');
      setNewSectionIsHidden(false);
      setIsAddSectionOpen(false);
    });
  };

  React.useEffect(() => {
    if (authCode.length === 6 && /^\d+$/.test(authCode)) {
      // Simulate a request that gives a false response if code is 000000
      if (authCode === '000000') {
        setAuthError(true);
      } else {
        onAuthSuccess?.();
        setIsAuthModalOpen(false);
        setAuthCode('');
        setAuthError(false);
        setOnAuthSuccess(null);
      }
    }
  }, [authCode, onAuthSuccess]);

  const requestAuth = (action: () => void) => {
    setOnAuthSuccess(() => action);
    setIsAuthModalOpen(true);
    setAuthCode('');
    setAuthError(false);
  };

  
  const handleToggle = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id !== id) return d;
      
      let newStatus = d.status;
      if (d.type === 'light') {
        newStatus = d.status === 'on' ? 'off' : 'on';
      } else if (d.type === 'appliance') {
        newStatus = (d.status === 'on' || d.status === 'active') ? 'off' : 'on';
      } else if (d.type === 'door' || d.type === 'window') {
        newStatus = d.status === 'locked' ? 'unlocked' : 'locked';
      } else if (d.type === 'camera') {
        newStatus = d.status === 'active' ? 'inactive' : 'active';
      }
      
      return { ...d, status: newStatus as any };
    }));
  };

  const handleStatusChange = (id: string, status: string) => {
    setDevices(prev => prev.map(d => 
      d.id === id ? { ...d, status } : d
    ));
  };

  const handleValueChange = (id: string, value: number) => {
    setDevices(prev => prev.map(d => 
      d.id === id ? { ...d, value } : d
    ));
  };

  const handleDeleteDevice = (id: string) => {
    requestAuth(() => {
      setDevices(prev => prev.filter(d => d.id !== id));
      setCameras(prev => prev.filter(c => c.id.toString() !== id.toString()));
    });
  };

  const handleEditDevice = (id: string) => {
    const device = devices.find(d => d.id === id);
    if (device) {
      let finalDevice = { ...device };
      if (device.type === 'appliance') {
        const appDto = appliances.find(a => a.id.toString() === device.id.toString() || a.applianceName === device.name);
        if (appDto) {
          const typeId = appNamesDetailList.applianceType.find(t => t.name === appDto.applianceType)?.id || 1;
          finalDevice.applianceType = typeId;
        }
      }
      setEditingDevice(finalDevice);
      setIsEditDeviceOpen(true);
    }
  };

  const handleDeviceClick = (d: Device) => {
    if (d.type === 'camera') {
      setSelectedCamera(d);
      setIsCameraModalOpen(true);
    } else if (d.type === 'appliance') {
      setSelectedAppliance(d);
      setIsApplianceModalOpen(true);
    } else if (d.type === 'door') {
      setSelectedDoor(d);
      setIsDoorModalOpen(true);
    } else if (d.type === 'light') {
      setSelectedLight(d);
      setIsLightModalOpen(true);
    } else if (d.type === 'window') {
      setSelectedWindow(d);
      setIsViewWindowOpen(true);
    }
  };

  const handleSaveDevice = () => {
    requestAuth(() => {
      if (editingDevice && editingDevice.id) {
        setDevices(prev => prev.map(d => d.id === editingDevice.id ? { ...d, ...editingDevice } as Device : d));
        if (editingDevice.type === 'camera') {
          setCameras(prev => prev.map(c => c.id.toString() === editingDevice.id!.toString() ? {
            ...c,
            cameraName: editingDevice.name || c.cameraName,
            roomId: editingDevice.room ? parseInt(editingDevice.room) : c.roomId,
            sectionId: editingDevice.section ? parseInt(editingDevice.section) : c.sectionId
          } : c));
        }
        if (editingDevice.type === 'appliance') {
          setAppliances(prev => prev.map(a => a.id.toString() === editingDevice.id!.toString() ? {
            ...a,
            applianceName: editingDevice.name || a.applianceName,
            applianceType: appNamesDetailList.applianceType.find(t => t.id === editingDevice.applianceType)?.name || a.applianceType,
            roomId: editingDevice.room ? parseInt(editingDevice.room) : a.roomId,
            roomName: rooms.find(r => r.id === editingDevice.room)?.name,
            sectionId: editingDevice.section ? parseInt(editingDevice.section) : a.sectionId,
            sectionName: sections.find(s => s.id === editingDevice.section)?.name
          } : a));
        }
        setIsEditDeviceOpen(false);
        setEditingDevice(null);
      }
    });
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsEditRoomOpen(true);
  };

  const handleSaveRoom = () => {
    requestAuth(() => {
      if (editingRoom && editingRoom.id) {
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...editingRoom } as Room : r));
      setIsEditRoomOpen(false);
      setEditingRoom(null);
      }
    });
  };

  const handleDeleteRoom = (id: string) => {
    requestAuth(() => {
      setRooms(prev => prev.filter(r => r.id !== id));
      if (activeView === `room-${id}`) {
        setActiveView('facility-rooms');
      }
    });
  };

  const triggerScene = (scene: Scene) => {
    setDevices(prev => prev.map(device => {
      const action = scene.actions.find(a => a.deviceId === device.id);
      if (action) {
        return {
          ...device,
          status: action.status,
          value: action.value !== undefined ? action.value : device.value
        };
      }
      return device;
    }));
  };

  const handleAddDevice = () => {
    requestAuth(() => {
      if (!newDevice.name) return;
      
      let inferredType = newDevice.type;
      if (activeView.startsWith('facility-')) {
        const facilityType = activeView.replace('facility-', '');
        if (facilityType === 'lights') inferredType = 'light';
        else if (facilityType === 'doors') inferredType = 'door';
        else if (facilityType === 'windows') inferredType = 'window';
        else if (facilityType === 'appliances') inferredType = 'appliance';
        else if (facilityType === 'cameras') inferredType = 'camera';
      }

      const numericId = Math.floor(Math.random() * 9000) + 1000;
      const device: Device = {
        id: (inferredType === 'camera' || inferredType === 'appliance') ? numericId.toString() : Math.random().toString(36).substring(2, 9),
        name: newDevice.name,
        type: inferredType as any,
        room: (newDevice.room === 'none' || !newDevice.room) ? undefined : newDevice.room,
        section: newDevice.section || undefined,
        status: (inferredType === 'door' || inferredType === 'window') ? 'locked' : (inferredType === 'camera' ? 'active' : 'off'),
        value: inferredType === 'light' ? 0 : undefined,
        doorType: inferredType === 'door' ? (newDevice.doorType || 'interior') : undefined,
        powerUsage: inferredType === 'appliance' ? 0 : undefined,
        ipAddress: newDevice.ipAddress,
        username: newDevice.username,
        password: newDevice.password,
        streamPath: newDevice.streamPath,
        port: newDevice.port,
        applianceType: inferredType === 'appliance' ? newDevice.applianceType : undefined
      };

      if (inferredType === 'camera') {
        const newCameraDto: GetCameraDto = {
          id: numericId,
          cameraName: device.name,
          cameraId: `CAM-${numericId}`,
          liveStreamUrl: newDevice.streamPath || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          isActive: true,
          powerActive: true,
          roomId: newDevice.room ? parseInt(newDevice.room) : undefined,
          sectionId: newDevice.section ? parseInt(newDevice.section) : undefined,
          recordings: [
            {
              filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
              startTime: new Date(Date.now() - 3600000).toISOString(),
              endTime: new Date(Date.now() - 3500000).toISOString()
            }
          ]
        };
        setCameras(prev => [...prev, newCameraDto]);
      }

      if (inferredType === 'appliance') {
        const appType = appNamesDetailList.applianceType.find(t => t.id === newDevice.applianceType)?.name || 'Unknown';
        const newApplianceDto: GetApplianceDto = {
          id: numericId,
          applianceName: device.name,
          applianceId: `APP-${numericId}`,
          applianceType: appType,
          isActive: false,
          powerActive: false,
          roomId: newDevice.room ? parseInt(newDevice.room) : undefined,
          roomName: rooms.find(r => r.id === newDevice.room)?.name,
          sectionId: newDevice.section ? parseInt(newDevice.section) : undefined,
          sectionName: sections.find(s => s.id === newDevice.section)?.name
        };
        setAppliances(prev => [...prev, newApplianceDto]);
      }

      setDevices(prev => [...prev, device]);
      setIsAddDeviceOpen(false);
      setNewDevice({ name: '', type: 'light', room: '', section: '', doorType: 'interior', applianceType: 1 });
    });
  };

  const handleAddRoom = () => {
    requestAuth(() => {
      if (!newRoom.name) return;

      const room: Room = {
        id: newRoom.name.toLowerCase().replace(/\s+/g, '-'),
        name: newRoom.name,
        section: newRoom.section || '',
        icon: newRoom.icon || 'Sofa',
        isHidden: newRoom.isHidden
      };

      setRooms(prev => [...prev, room]);
      setIsAddRoomOpen(false);
      setNewRoom({ name: '', section: '', icon: 'Sofa' });
    });
  };

  const [newScene, setNewScene] = React.useState<Partial<Scene>>({
    name: '',
    icon: 'Film'
  });

  const handleAddScene = () => {
    requestAuth(() => {
      if (!newScene.name) return;
      const scene: Scene = {
        id: Math.random().toString(36).substr(2, 9),
        name: newScene.name,
        icon: newScene.icon as any || 'Film',
        actions: []
      };
      setScenes(prev => [...prev, scene]);
      setNewScene({ name: '', icon: 'Film' });
      setIsAddSceneOpen(false);
    });
  };

  const getFilteredDevices = () => {
    let filtered = devices;
    
    if (activeView.startsWith('room-')) {
      const roomId = activeView.replace('room-', '');
      filtered = filtered.filter(d => d.room === roomId);
    } else if (activeView === 'facility-doors') {
      filtered = filtered.filter(d => d.type === 'door');
    } else if (activeView === 'facility-lights') {
      filtered = filtered.filter(d => d.type === 'light');
    } else if (activeView === 'facility-appliances') {
      filtered = filtered.filter(d => d.type === 'appliance');
    } else if (activeView === 'facility-cameras') {
      filtered = filtered.filter(d => d.type === 'camera');
    } else if (activeView === 'facility-windows') {
      filtered = filtered.filter(d => d.type === 'window');
    }

    if (activeView.startsWith('facility-') && facilitySearchQuery) {
      filtered = filtered.filter(d => d.name.toLowerCase().includes(facilitySearchQuery.toLowerCase()));
    }

    // Sorting
    if (activeView.startsWith('facility-')) {
      filtered = [...filtered].sort((a, b) => {
        if (facilitySortBy === 'room') {
          const roomA = rooms.find(r => r.id === a.room)?.name || 'No Room';
          const roomB = rooms.find(r => r.id === b.room)?.name || 'No Room';
          return roomA.localeCompare(roomB);
        } else {
          const sectionA = sections.find(s => s.id === a.section)?.name || 'No Section';
          const sectionB = sections.find(s => s.id === b.section)?.name || 'No Section';
          return sectionA.localeCompare(sectionB);
        }
      });
    }

    return filtered;
  };

  const activeDevicesCount = devices.filter(d => d.status === 'on' || d.status === 'active' || d.status === 'unlocked' || d.status === 'open').length;
  const lockedDoorsCount = devices.filter(d => d.type === 'door' && d.status === 'locked').length;
  const totalDoorsCount = devices.filter(d => d.type === 'door').length;

  const getTitleInfo = () => {
    const isRoom = activeView.startsWith('room-');
    const roomId = isRoom ? activeView.replace('room-', '') : null;
    const room = isRoom ? rooms.find(r => r.id === roomId) : null;
    const facilityType = activeView.replace('facility-', '');
    
    let Icon = LayoutDashboard;
    let title = activeView.charAt(0).toUpperCase() + activeView.slice(1).replace('-', ' ');

    if (isRoom) {
      Icon = iconMap[room?.icon || ''] || Sofa;
      title = room?.name || 'Room';
    } else if (activeView === 'dashboard') {
      Icon = LayoutDashboard;
      title = 'Dashboard';
    } else if (activeView === 'user-room') {
      Icon = HomeIcon;
      title = `${userProfile.getPersonDetailsDto.firstName}'s Room`;
    } else if (activeView === 'facilities' || activeView === 'facility-overview') {
      Icon = Layers;
      title = 'Facilities Overview';
    } else if (activeView === 'facility-rooms') {
      Icon = Sofa;
      title = 'Rooms';
    } else if (activeView === 'facility-sections') {
      Icon = LayoutGrid;
      title = 'Sections';
    } else if (activeView === 'facility-actions') {
      Icon = Zap;
      title = 'Actions';
    } else if (activeView === 'facility-hardware') {
      Icon = Cpu;
      title = 'Hardware';
    } else if (activeView === 'facility-externals') {
      Icon = Radio;
      title = 'Externals';
    } else if (activeView === 'facility-doors') {
      Icon = Lock;
      title = 'Doors';
    } else if (activeView === 'facility-lights') {
      Icon = Lightbulb;
      title = 'Lights';
    } else if (activeView === 'facility-appliances') {
      Icon = Power;
      title = 'Appliances';
    } else if (activeView === 'facility-cameras') {
      Icon = Camera;
      title = 'Cameras';
    } else if (activeView === 'facility-windows') {
      Icon = WindowIcon;
      title = 'Windows';
    } else if (activeView === 'contacts') {
      Icon = Contact;
      title = 'Contacts';
    } else if (activeView === 'all-users') {
      Icon = UserCircle;
      title = 'All Users';
    } else if (activeView === 'logs') {
      Icon = ClipboardList;
      title = 'Activity Logs';
    } else if (activeView === 'profile') {
      Icon = Settings2;
      title = 'Profile Settings';
    }

    return { Icon, title };
  };

  const { Icon: HeaderIcon, title: headerTitle } = getTitleInfo();

  const renderView = () => {
    const filteredDevices = getFilteredDevices();

    if (activeView === 'dashboard') {
      const activeDevices = devices.filter(d => d.status === 'on' || d.status === 'active').length;
      const externalCameras = devices.filter(d => d.type === 'camera' && d.section === 'security');
      
      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Welcome home, {userProfile.getPersonDetailsDto.firstName}!</h1>
            <p className="text-muted-foreground">Everything is looking good. You have {activeDevices} active devices.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Card 
              className="p-6 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 shadow-sm hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setActiveView('facility-overview')}
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Facilities</p>
                <p className="text-4xl font-bold text-slate-900">{rooms.length}</p>
              </div>
            </Card>
            <Card 
              className="p-6 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 shadow-sm hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setActiveView('contacts')}
            >
              <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Contact className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contacts</p>
                <p className="text-4xl font-bold text-slate-900">{contacts.length}</p>
              </div>
            </Card>
            <Card 
              className="p-6 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 shadow-sm hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setActiveView('logs')}
            >
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Logs</p>
                <p className="text-4xl font-bold text-slate-900">{logs.length}</p>
              </div>
            </Card>
            
            {/* My Room Card */}
            {(() => {
              const myRoom = rooms.find(r => r.roomName === 'Bedroom') || rooms[0];
              const roomDoors = doors.filter(d => d.roomId === myRoom?.id);
              const roomLights = lights.filter(l => l.roomId === myRoom?.id);
              const roomWindows = windows.filter(w => w.roomId === myRoom?.id);
              const myRoomLocked = roomDoors.length > 0 ? roomDoors.every(d => d.isLocked) : false;
              
              return (
                <Card className="p-8 sm:col-span-3 flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-900 text-white border-0 shadow-xl rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <div className="h-24 w-24 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary z-10 border border-primary/30">
                    <HomeIcon className="h-12 w-12" />
                  </div>
                  <div className="flex-1 z-10 text-center sm:text-left flex flex-col justify-center">
                    <h3 className="text-3xl font-bold mb-1">{myRoom?.roomName || "My Room"}</h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-300 mt-4">
                      <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
                        <Lock className="h-4 w-4" /> {roomDoors.length} Doors
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
                        <Lightbulb className="h-4 w-4" /> {roomLights.length} Lights
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
                        <Maximize className="h-4 w-4" /> {roomWindows.length} Windows
                      </div>
                    </div>
                  </div>
                  <div className="z-10 shrink-0 self-center sm:self-center bg-slate-800 px-6 py-4 rounded-2xl border border-slate-700 flex flex-col items-center">
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Status</span>
                    <span className={cn("text-xl font-bold tracking-tight", myRoomLocked ? "text-green-400" : "text-yellow-400")}>
                      {myRoomLocked ? "Locked" : "Unlocked"}
                    </span>
                  </div>
                </Card>
              );
            })()}
          </div>

          <div className="space-y-4 overflow-hidden relative">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              External Security Cameras
            </h2>
            <div className="flex overflow-x-auto snap-x space-x-6 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {externalCameras.map(device => {
                const currentCameraDto = cameras.find(c => c.id.toString() === device.id.toString() || c.cameraName === device.name);
                const feedUrl = currentCameraDto?.liveStreamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
                return (
                  <div key={device.id} className="min-w-[80vw] sm:min-w-[400px] h-[280px] bg-slate-900 rounded-3xl snap-center shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-200 shadow-md">
                    <video src={feedUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white flex justify-between items-end">
                      <span className="font-semibold text-lg tracking-tight">{device.name}</span>
                      <span className="text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-white rounded-full"></span> Live
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Actions
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {actions.slice(0, 4).map(action => (
                  <Card 
                    key={action.id} 
                    className="p-5 flex items-start gap-4 hover:border-primary/50 transition-colors cursor-pointer group bg-white shadow-sm"
                    onClick={() => {
                        setLogs(prev => [{
                          id: Date.now(),
                          personId: userProfile.id,
                          logDetails: `Triggered action: ${action.actionName}`,
                          timeOfAction: new Date().toISOString(),
                          getPersonDto: { id: userProfile.id, getPersonDetailsDto: userProfile.getPersonDetailsDto, getUserDto: userProfile.getUserDto }
                        } as any, ...prev]);
                    }}
                  >
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-base mb-1 truncate">{action.actionName}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{action.actionDescription || 'Automated device sequence execution.'}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0 h-8 w-8 bg-slate-100 rounded-full">
                      <Play className="h-4 w-4 fill-primary" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Recent Activity
              </h2>
              <Card className="divide-y overflow-hidden">
                {logs.slice(0, 3).map(log => (
                  <div key={log.id} className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <img src={log.getPersonDto?.getPersonDetailsDto?.imageUrl} alt={`${log.getPersonDto?.getPersonDetailsDto?.firstName} avatar`} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-medium"><span className="font-semibold">{log.getPersonDto?.getPersonDetailsDto?.firstName}</span>: {log.logDetails}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.timeOfAction).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </motion.div>
      );
    }

    if (activeView === 'facilities' || activeView === 'facility-overview') {
      const facilityCategories = [
        { id: 'facility-appliances', name: 'Appliances', icon: Power, type: 'appliance' },
        { id: 'facility-cameras', name: 'Cameras', icon: Camera, type: 'camera' },
        { id: 'facility-doors', name: 'Doors', icon: Lock, type: 'door' },
        { id: 'facility-lights', name: 'Lights', icon: Lightbulb, type: 'light' },
        { id: 'facility-rooms', name: 'Rooms', icon: Sofa, type: 'room' },
        { id: 'facility-actions', name: 'Actions', icon: Zap, type: 'action' },
        { id: 'facility-sections', name: 'Sections', icon: LayoutGrid, type: 'section' },
        { id: 'facility-windows', name: 'Windows', icon: WindowIcon, type: 'window' },
        { id: 'facility-hardware', name: 'Hardware', icon: Cpu, type: 'hardware' },
        { id: 'facility-externals', name: 'Externals', icon: Radio, type: 'externals' },
      ].sort((a, b) => a.name.localeCompare(b.name));

      return (
        <motion.div
          key="facilities-overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Facilities Overview</h1>
            </div>
            <p className="text-muted-foreground">Real-time status summary of your home infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {facilityCategories.map(cat => {
              const Icon = cat.icon;
              let total = 0;
              let active = 0;
              let inactive = 0;
              let statusSummary = "";

              if (cat.type === 'room') {
                total = rooms.length;
                statusSummary = `${total} Total Rooms`;
              } else if (cat.type === 'action') {
                total = scenes.length;
                active = scenes.length; // all are available to activate
                statusSummary = `${total} Active Actions`;
              } else if (cat.type === 'hardware') {
                total = hardwares.length;
                active = hardwares.filter(h => h.isActive).length;
                inactive = total - active;
                statusSummary = `${active} Active • ${inactive} Off`;
              } else if (cat.type === 'externals') {
                total = externals.length;
                active = externals.filter(e => e.isTriggered).length;
                inactive = total - active;
                statusSummary = `${active} Triggered • ${inactive} OK`;
              } else if (cat.type === 'section') {
                total = sections.length;
                statusSummary = `${total} Total Sections`;
              } else {
                const categoryDevices = devices.filter(d => d.type === cat.type);
                total = categoryDevices.length;
                active = categoryDevices.filter(d => d.status === 'on' || d.status === 'active' || d.status === 'unlocked' || d.status === 'open').length;
                inactive = total - active;
                
                if (cat.type === 'light' || cat.type === 'appliance') {
                  statusSummary = `${active} On • ${inactive} Off`;
                } else if (cat.type === 'door' || cat.type === 'window') {
                  const locked = categoryDevices.filter(d => d.status === 'locked' || d.status === 'open-locked').length;
                  const unlocked = total - locked;
                  statusSummary = `${locked} Locked • ${unlocked} Unlocked`;
                } else if (cat.type === 'camera') {
                  statusSummary = `${active} Active • ${inactive} Inactive`;
                }
              }

              return (
                <Card 
                  key={cat.id} 
                  className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
                  onClick={() => setActiveView(cat.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="rounded-2xl bg-primary/10 p-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-8 w-8" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="mt-6 space-y-2">
                      <h3 className="text-xl font-bold">{cat.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">{total} Items</Badge>
                        <span className="text-xs text-muted-foreground font-medium">{statusSummary}</span>
                      </div>
                    </div>
                    <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: total > 0 ? `${(active / total) * 100}%` : '0%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      );
    }

    if (activeView === 'logs') {
      const filteredLogs = logs.filter(log => {
        if (!logStartDate && !logEndDate) return true;
        const logDate = new Date(log.timeOfAction);
        const start = logStartDate ? new Date(logStartDate) : new Date(0);
        const end = logEndDate ? new Date(logEndDate) : new Date();
        return logDate >= start && logDate <= end;
      });

      const displayedLogs = filteredLogs.slice(0, visibleLogsCount);

      const getActionTypeBadgeColor = (type: string) => {
        switch (type) {
          case 'Light Control': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
          case 'Door Security': return 'bg-red-500/10 text-red-500 border-red-500/20';
          case 'Scene Activation': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
          case 'Appliance State': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
          case 'Window Control': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          case 'Profile Sync': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
          case 'Camera Access': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
          case 'System Diagnostic': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
          case 'Air Conditioning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
          default: return 'bg-primary/10 text-primary border-primary/20';
        }
      };

      return (
        <motion.div
          key="logs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-primary" />
                <div className="flex items-center justify-between w-full">
                  <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                  <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 text-black border-none font-bold text-[10px] uppercase tracking-wider">
                    <ClipboardList className="h-3 w-3" />
                    {logs.length} Total Logs
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground">Recent actions and events in your smart home.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border shadow-sm">
              <div className="flex flex-col gap-1.5 prose-sm">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">From</Label>
                <Popover>
                  <PopoverTrigger 
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 justify-start text-left font-normal w-[160px] rounded-xl border-dashed hover:border-solid transition-all",
                          !logStartDate && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                    {logStartDate ? format(new Date(logStartDate), "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={logStartDate ? new Date(logStartDate) : undefined}
                      onSelect={(date) => {
                        setLogStartDate(date ? date.toISOString() : '');
                        setVisibleLogsCount(50); // Reset page count on filter
                      }}
                      initialFocus
                      className="rounded-2xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">To</Label>
                <Popover>
                  <PopoverTrigger 
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 justify-start text-left font-normal w-[160px] rounded-xl border-dashed hover:border-solid transition-all",
                          !logEndDate && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                    {logEndDate ? format(new Date(logEndDate), "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={logEndDate ? new Date(logEndDate) : undefined}
                      onSelect={(date) => {
                        setLogEndDate(date ? date.toISOString() : '');
                        setVisibleLogsCount(50); // Reset page count on filter
                      }}
                      initialFocus
                      className="rounded-2xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="mt-5 h-10 w-10 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
                onClick={() => { setLogStartDate(''); setLogEndDate(''); setVisibleLogsCount(50); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
            <div className="divide-y text-left">
              {displayedLogs.length > 0 ? displayedLogs.map(log => {
                const details = log.getPersonDto?.getPersonDetailsDto;
                const userFullName = details ? `${details.firstName} ${details.lastName}` : 'System';
                const avatar = details?.imageUrl || 'https://picsum.photos/seed/system/100/100';

                return (
                  <div 
                    key={log.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-accent/40 active:bg-accent/60 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedLog(log);
                      setIsViewLogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-primary/10">
                        <img src={avatar} alt={userFullName} className="h-full w-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-medium leading-none text-foreground flex items-center gap-2 flex-wrap text-left">
                          <span className="font-bold">{userFullName}</span>
                          <span className="text-muted-foreground truncate max-w-[400px] text-left">{log.logDetails}</span>
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 inline text-primary/75" />
                          {new Date(log.timeOfAction).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <Badge variant="outline" className={cn("text-xs px-2.5 py-0.5 rounded-full border", getActionTypeBadgeColor(log.actionType))}>
                        {log.actionType}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    </div>
                  </div>
                );
              }) : (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                  <ClipboardList className="h-12 w-12 text-muted-foreground/40" />
                  <div>
                    <p className="font-semibold text-foreground">No logs found</p>
                    <p className="text-xs">Adjust your date filters or do some changes to trigger logs.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Paging / Loading Trigger element */}
            {visibleLogsCount < filteredLogs.length && (
              <div 
                ref={loaderRef} 
                className="p-6 flex flex-col items-center justify-center gap-2 border-t bg-muted/5"
              >
                {isPagingLoading ? (
                  <div className="flex items-center gap-2 text-sm text-primary font-medium animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Loading next 50 logs...
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground text-xs font-semibold py-1.5 px-4 rounded-xl border-dashed border hover:border-solid bg-background/50 hover:bg-background transition-all"
                    onClick={() => {
                      setIsPagingLoading(true);
                      setTimeout(() => {
                        setVisibleLogsCount(prev => prev + 50);
                        setIsPagingLoading(false);
                      }, 400);
                    }}
                  >
                    Load More ({filteredLogs.length - visibleLogsCount} remaining)
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Single View Log Details Modal */}
          <Dialog open={isViewLogOpen} onOpenChange={setIsViewLogOpen}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl border shadow-2xl p-6 bg-card" showCloseButton={false}>
              <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
              <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
                <X className="h-4 w-4" />
              </DialogClose>
              </div>
              <DialogHeader className="mb-0 border-b text-left pr-12 pb-4">
                <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-foreground justify-start">
                  <ClipboardList className="h-5.5 w-5.5 text-primary" />
                  View Log Info
                </DialogTitle>
                <DialogDescription className="text-xs mt-1 text-left">
                  Review absolute system trace values and synchronized personnel data.
                </DialogDescription>
              </DialogHeader>

              {selectedLog && (
                <div className="space-y-6 pt-[3px] text-left">
                  <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-muted">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
                      <img 
                        src={selectedLog.getPersonDto?.getPersonDetailsDto?.imageUrl || 'https://picsum.photos/seed/system/100/100'} 
                        alt="User Avatar" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-foreground text-base leading-snug">
                        {selectedLog.getPersonDto?.getPersonDetailsDto?.firstName} {selectedLog.getPersonDto?.getPersonDetailsDto?.lastName}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 flex-wrap text-left">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 py-0 bg-primary/5 text-primary leading-none">
                          Role: {selectedLog.getPersonDto?.getUserDto?.roleName || 'System/Guest'}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-1.5 py-0 leading-none border-transparent", selectedLog.getPersonDto?.disabled ? "bg-destructive/10 text-destructive" : "bg-emerald-500/15 text-emerald-500")}>
                          {selectedLog.getPersonDto?.disabled ? 'Disabled' : 'Active'}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 bg-muted/10 p-3 rounded-xl border">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block text-left">Log Identifier</span>
                        <span className="font-mono text-xs font-semibold text-primary block text-left">ID: {selectedLog.id}</span>
                      </div>
                      <div className="space-y-1 bg-muted/10 p-3 rounded-xl border text-left">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block text-left">Action Class</span>
                        <Badge variant="outline" className={cn("text-xs font-bold w-fit", getActionTypeBadgeColor(selectedLog.actionType))}>
                          {selectedLog.actionType}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-muted/10 p-4 rounded-xl border text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block text-left">Timestamp of Event</span>
                      <div className="text-xs font-medium space-y-1.5 text-left">
                        <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> <span className="text-foreground font-semibold">Local:</span> {new Date(selectedLog.timeOfAction).toLocaleString()}</p>
                        <p className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> <span className="font-semibold text-[11px]">UTC:</span> <span className="font-mono text-[11px]">{selectedLog.timeOfAction}</span></p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-muted/30 p-4 rounded-2xl border border-primary/10 text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary block text-left">Transaction Details</span>
                      <p className="text-sm leading-relaxed text-foreground font-medium text-left">
                        {selectedLog.logDetails}
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    }

    if (activeView === 'contacts') {
      const filteredContacts = contacts.filter(c => {
        const matchesSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(contactSearchQuery.toLowerCase());
        const matchesCategory = contactSortCategory === 'all' || c.getContactCategoryDto.id.toString() === contactSortCategory;
        return matchesSearch && matchesCategory;
      });

      return (
        <motion.div
          key="contacts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Contact className="h-8 w-8 text-primary" />
                <div className="flex items-center justify-between w-full">
                  <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                  <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 text-black border-none font-bold text-[10px] uppercase tracking-wider">
                    <Contact className="h-3 w-3" />
                    {contacts.length} {contacts.length === 1 ? 'Contact' : 'Contacts'}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground">Manage your home contacts and emergency services.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={contactView === 'overview' ? 'default' : 'outline'} size="sm" onClick={() => setContactView('overview')}>Overview</Button>
              <Button variant={contactView === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setContactView('all')}>All Contacts</Button>
            </div>
          </div>

          {contactView === 'overview' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Categories</h3>
                <div className="space-y-2">
                  {contactCategories.map(cat => {
                    const CategoryIcon = iconMap[cat.icon || 'UserCircle'] || UserCircle;
                    return (
                      <div key={cat.id} className="group relative">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{cat.name}</p>
                              {cat.description && <p className="text-[10px] text-muted-foreground line-clamp-1">{cat.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="h-5">{contacts.filter(c => c.getContactCategoryDto.id === cat.id).length}</Badge>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setNewCategoryName(cat.name);
                                  setNewCategoryDescription(cat.description || '');
                                  setNewCategoryIcon(cat.icon || 'UserCircle');
                                  setIsEditCategoryOpen(true);
                                }}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteCategory(cat.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm" onClick={() => setIsAddCategoryOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
              </Card>

              <Card className="p-6 md:col-span-2">
                <h3 className="text-lg font-bold mb-4">Recent Contacts</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {contacts.slice(0, 4).map(contact => (
                    <div 
                      key={contact.id} 
                      className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => { setViewingContact(contact); setIsViewContactOpen(true); }}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                        {contact.imageUrl ? (
                          <img src={contact.imageUrl} alt={contact.firstName} className="h-full w-full object-cover" />
                        ) : (
                          `${contact.firstName[0]}${contact.lastName[0]}`
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{contact.firstName} {contact.lastName}</span>
                        <span className="text-xs text-muted-foreground capitalize">{contact.getContactCategoryDto.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search contacts..." 
                    className="pl-10"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={contactSortCategory} onValueChange={setContactSortCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {contactCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => setIsAddContactOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Contact
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredContacts.map(contact => (
                  <Card 
                    key={contact.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => { setViewingContact(contact); setIsViewContactOpen(true); }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold overflow-hidden">
                            {contact.imageUrl ? (
                              <img src={contact.imageUrl} alt={contact.firstName} className="h-full w-full object-cover" />
                            ) : (
                              `${contact.firstName[0]}${contact.lastName[0]}`
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">{contact.firstName} {contact.lastName}</CardTitle>
                            <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider">{contact.getContactCategoryDto.name}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 text-sm">
                        {contact.contactDetails.map((d, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span className="font-medium text-foreground">{d.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span className="font-medium text-foreground">{d.phoneNumber}</span>
                            </div>
                          </div>
                        ))}
                        {contact.address.map((a, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{a.numberLine} {a.street}, {a.city}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{a.state}, {a.country}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    }

    if (activeView === 'profile') {
      return (
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <UserCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">
                {userProfile.getPersonDetailsDto.firstName} {userProfile.getPersonDetailsDto.lastName} Profile
              </h1>
            </div>
            <p className="text-muted-foreground">Manage your account information and security settings.</p>
          </div>

          <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
              {/* Left Column: Form Details */}
              <div className="md:col-span-3 p-8 space-y-8 order-2 md:order-1">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-muted-foreground" />
                      Full Name
                    </Label>
                    <Input 
                      className={userProfile.getPersonDetailsDto.firstName ? "border-b-green-400 text-lg font-medium bg-transparent text-black" : "text-lg font-medium bg-transparent text-black"} 
                      value={userProfile.getPersonDetailsDto.firstName} 
                      onChange={(e) => setUserProfile(p => ({ ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, firstName: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-muted-foreground" />
                      Last Name
                    </Label>
                    <Input 
                      className={userProfile.getPersonDetailsDto.lastName ? "border-b-green-400 text-lg font-medium bg-transparent text-black" : "text-lg font-medium bg-transparent text-black"} 
                      value={userProfile.getPersonDetailsDto.lastName} 
                      onChange={(e) => setUserProfile(p => ({ ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, lastName: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                      Username
                    </Label>
                    <Input 
                      className={userProfile.getUserDto.userName ? "border-b-green-400 bg-transparent text-black" : "bg-transparent text-black"} 
                      value={userProfile.getUserDto.userName} 
                      onChange={(e) => setUserProfile(p => ({ ...p, getUserDto: { ...p.getUserDto, userName: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input 
                      className={userProfile.getPersonDetailsDto.getContactDetailsDtos[0]?.email ? "border-b-green-400 bg-transparent text-black" : "bg-transparent text-black"} 
                      value={userProfile.getPersonDetailsDto.getContactDetailsDtos[0]?.email || ''} 
                      onChange={(e) => {
                        const email = e.target.value;
                        setUserProfile(p => {
                          const details = [...p.getPersonDetailsDto.getContactDetailsDtos];
                          if (details[0]) details[0] = { ...details[0], email };
                          else details[0] = { id: 0, contactId: 0, personDetailsId: p.getPersonDetailsDto.id, email, phoneNumber: '' };
                          return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getContactDetailsDtos: details } };
                        });
                      }} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-3 w-3 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <Input 
                      className={userProfile.getPersonDetailsDto.getContactDetailsDtos[0]?.phoneNumber ? "border-b-green-400 bg-transparent text-black" : "bg-transparent text-black"} 
                      value={userProfile.getPersonDetailsDto.getContactDetailsDtos[0]?.phoneNumber || ''} 
                      onChange={(e) => {
                        const phoneNumber = e.target.value;
                        setUserProfile(p => {
                          const details = [...p.getPersonDetailsDto.getContactDetailsDtos];
                          if (details[0]) details[0] = { ...details[0], phoneNumber };
                          else details[0] = { id: 0, contactId: 0, personDetailsId: p.getPersonDetailsDto.id, email: '', phoneNumber };
                          return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getContactDetailsDtos: details } };
                        });
                      }} 
                    />
                  </div>
                </div>

                <Separator className="opacity-50" />

                {/* Editable Linked Addresses */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                      <MapPin className="h-4 w-4" />
                      Manage Addresses ({userProfile.getPersonDetailsDto.getAddressDtos.length})
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] uppercase h-7 bg-transparent border border-primary/20 text-black hover:bg-primary/5"
                      onClick={() => {
                        const newAddr: GetAddressDto = { 
                          id: Date.now(), contactId: 0, personId: userProfile.id, 
                          numberLine: '', street: '', city: '', region: '', state: '', 
                          country: 'United Kingdom', postalCode: '' 
                        };
                        setUserProfile(p => ({
                          ...p,
                          getPersonDetailsDto: {
                            ...p.getPersonDetailsDto,
                            getAddressDtos: [...p.getPersonDetailsDto.getAddressDtos, newAddr]
                          }
                        }));
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Address
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {userProfile.getPersonDetailsDto.getAddressDtos.map((addr, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border bg-muted/20 space-y-4 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setPendingUserAction({ type: 'delete-address', index: idx });
                            setIsAuthCodeModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Number/Line</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={addr.numberLine}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const addrs = [...p.getPersonDetailsDto.getAddressDtos];
                                  addrs[idx] = { ...addrs[idx], numberLine: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getAddressDtos: addrs } };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Street</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={addr.street}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const addrs = [...p.getPersonDetailsDto.getAddressDtos];
                                  addrs[idx] = { ...addrs[idx], street: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getAddressDtos: addrs } };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">City</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={addr.city}
                               onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const addrs = [...p.getPersonDetailsDto.getAddressDtos];
                                  addrs[idx] = { ...addrs[idx], city: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getAddressDtos: addrs } };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Region</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={addr.region}
                               onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const addrs = [...p.getPersonDetailsDto.getAddressDtos];
                                  addrs[idx] = { ...addrs[idx], region: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getAddressDtos: addrs } };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">State</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={addr.state}
                               onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const addrs = [...p.getPersonDetailsDto.getAddressDtos];
                                  addrs[idx] = { ...addrs[idx], state: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getAddressDtos: addrs } };
                                });
                              }}
                            />
                          </div>
                           <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Country</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={addr.country}
                               onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const addrs = [...p.getPersonDetailsDto.getAddressDtos];
                                  addrs[idx] = { ...addrs[idx], country: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getAddressDtos: addrs } };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Postal Code</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={addr.postalCode || ''}
                               onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const addrs = [...p.getPersonDetailsDto.getAddressDtos];
                                  addrs[idx] = { ...addrs[idx], postalCode: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getAddressDtos: addrs } };
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="opacity-50" />

                {/* Editable Linked Contacts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                      <Mail className="h-4 w-4" />
                      Manage Contacts ({userProfile.getPersonDetailsDto.getContactDetailsDtos.length})
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] uppercase h-7 bg-transparent border border-primary/20 text-black hover:bg-primary/5"
                      onClick={() => {
                        const newContact: GetContactDetailsDto = { 
                          id: Date.now(), contactId: 0, personDetailsId: userProfile.getPersonDetailsDto.id, 
                          email: '', phoneNumber: '' 
                        };
                        setUserProfile(p => ({
                          ...p,
                          getPersonDetailsDto: {
                            ...p.getPersonDetailsDto,
                            getContactDetailsDtos: [...p.getPersonDetailsDto.getContactDetailsDtos, newContact]
                          }
                        }));
                      }}
                    >
                      <UserPlus className="mr-1 h-3 w-3" /> Add Contact
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {userProfile.getPersonDetailsDto.getContactDetailsDtos.map((contact, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border bg-muted/20 flex flex-col gap-4 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setPendingUserAction({ type: 'delete-contact', index: idx });
                            setIsAuthCodeModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Email Address</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={contact.email}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const details = [...p.getPersonDetailsDto.getContactDetailsDtos];
                                  details[idx] = { ...details[idx], email: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getContactDetailsDtos: details } };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Phone Number</Label>
                            <Input 
                              className="h-8 text-xs bg-transparent border-primary/20 text-black"
                              value={contact.phoneNumber}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUserProfile(p => {
                                  const details = [...p.getPersonDetailsDto.getContactDetailsDtos];
                                  details[idx] = { ...details[idx], phoneNumber: val };
                                  return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getContactDetailsDtos: details } };
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                    <Camera className="h-4 w-4" />
                    Camera Access
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 p-4 rounded-2xl border bg-muted/20">
                    {GENERAL_CAMERAS.map(camera => (
                      <div key={camera.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cam-${camera.id}`} 
                          checked={userProfile.cameraAccess.includes(camera.id)}
                          onCheckedChange={(checked) => {
                            setUserProfile(prev => ({
                              ...prev,
                              cameraAccess: checked 
                                ? [...prev.cameraAccess, camera.id]
                                : prev.cameraAccess.filter(id => id !== camera.id)
                            }));
                          }}
                        />
                        <Label htmlFor={`cam-${camera.id}`} className="text-xs font-medium leading-none cursor-pointer">
                          {camera.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent border border-blue-200 text-black hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-2xl" onClick={() => setIsPasswordModalOpen(true)}>
                      <Key className="mr-4 h-5 w-5 text-blue-500" />
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-xs uppercase tracking-wider">Change Password</span>
                        <span className="text-[10px] text-muted-foreground">Update your login credentials</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent border border-orange-200 text-black hover:bg-orange-50 hover:text-orange-700 transition-colors rounded-2xl" onClick={() => setIsAuthCodeModalOpen(true)}>
                      <ShieldAlert className="mr-4 h-5 w-5 text-orange-500" />
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-xs uppercase tracking-wider">Authorization Code</span>
                        <span className="text-[10px] text-muted-foreground">Manage your 6-digit secure code</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <Button 
                    className="bg-transparent border-2 border-green-300 text-black hover:bg-green-50 rounded-full px-8 shadow-sm hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                    onClick={handleUpdateProfile}
                  >
                    <CheckCheck className="mr-2 h-4 w-4 text-green-600" />
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Right Column: Avatar & Summary */}
              <div className="bg-muted/30 border-l p-8 flex flex-col items-center text-center space-y-6 order-1 md:order-2">
                <div className="relative group">
                  <div className="h-40 w-40 rounded-3xl overflow-hidden border-8 border-background shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <img src={userProfile.getPersonDetailsDto.imageUrl} alt={`${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`} className="h-full w-full object-cover" />
                  </div>
                  <button 
                    className="absolute -bottom-2 -right-2 rounded-2xl bg-primary p-3 text-primary-foreground shadow-xl hover:scale-110 transition-transform"
                    onClick={() => document.getElementById('profile-avatar-upload')?.click()}
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <input 
                    type="file" 
                    id="profile-avatar-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, 'profile')}
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight">{userProfile.getPersonDetailsDto.firstName} {userProfile.getPersonDetailsDto.lastName}</h2>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 uppercase tracking-widest text-[9px] font-bold">
                    {userProfile.getUserDto.roleName}
                  </Badge>
                </div>
                
                <div className="w-full pt-6 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-2 border-b">
                    <span>Identity Status</span>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] text-muted-foreground uppercase">System Role</span>
                    <span className="text-xs font-medium">{userProfile.getUserDto.roleName}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] text-muted-foreground uppercase">Member Since</span>
                    <span className="text-xs font-medium">October 2023</span>
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] text-muted-foreground uppercase">Access Level</span>
                    <span className="text-xs font-medium">Standard Homeowner</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }

    if (activeView === 'all-users') {
      return (
        <motion.div
          key="all-users"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <UserCircle className="h-9 w-9 text-primary" />
              <div className="space-y-0.5">
                <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
              </div>
            </div>
            <p className="text-md text-muted-foreground">Manage system users, access levels and biometric tokens.</p>
          </div>  
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Input 
                  type="text"
                  placeholder="Search users by name or role..." 
                  className="pl-9 h-11 rounded-none bg-white border-0 border-b border-slate-200 w-full focus-visible:ring-0 focus-visible:border-b-black transition-all"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Button 
                  variant="outline"
                  className="font-medium border-slate-200 flex items-center justify-center gap-2 px-4 shadow-sm"
                  onClick={() => setIsAddFingerprintOpen(true)}
                >
                  <Fingerprint className="h-4 w-4" /> Add Fingerprint
                </Button>
                <Button 
                  variant="outline"
                  className="font-medium border-slate-200 flex items-center justify-center gap-2 px-4 shadow-sm"
                  onClick={() => setIsRegisterNfidOpen(true)}
                >
                  <ScanLine className="h-4 w-4" /> Register NFID
                </Button>
                <Button 
                  className="bg-black text-white hover:bg-black/90 transition-all font-medium px-6 flex items-center justify-center gap-2 shadow-sm"
                  onClick={() => {
                    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    setGeneratedToken(token);
                    setIsTokenModalOpen(true);
                  }}
                >
                  <Key className="h-4 w-4" />
                  Generate Token
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allUsers
              .filter(person => {
                const query = userSearchQuery.toLowerCase();
                const details = person.getPersonDetailsDto;
                return (
                  details.firstName.toLowerCase().includes(query) ||
                  details.lastName.toLowerCase().includes(query) ||
                  person.role?.toLowerCase().includes(query)
                );
              })
              .map(person => {
              const details = person.getPersonDetailsDto;
              const user = person.getUserDto;
              return (
                <Card 
                  key={person.id} 
                  className={`p-4 flex items-center justify-between group hover:shadow-md transition-shadow cursor-pointer ${person.disabled ? 'opacity-50 grayscale' : ''}`}
                  onClick={() => {
                    setViewingPerson(person);
                    setIsViewPersonDetailsOpen(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                      <img 
                        src={details.imageUrl} 
                        alt={`${details.firstName} ${details.lastName}`} 
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${details.firstName}+${details.lastName}&background=random`;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{details.firstName} {details.lastName}</h3>
                      <p className="text-xs text-muted-foreground">{details.getContactDetailsDtos[0]?.email}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wider">{user.roleName}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
            <Button 
              variant="outline" 
              className="h-full min-h-[100px] border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 flex flex-col gap-2 py-8 rounded-xl transition-all"
              onClick={() => setIsAddPersonOpen(true)}
            >
              <UserPlus className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Add New User</span>
            </Button>
          </div>
        </motion.div>
      );
    }

    if (activeView === 'user-room') {
      const userRoomId = 'bedroom'; // Assuming Inioluwa's room is the bedroom
      const roomDevices = devices.filter(d => d.room === userRoomId);
      
      const securityPriority: Record<string, number> = {
        'door': 1,
        'window': 2,
        'camera': 3,
        'light': 4,
        'appliance': 5,
        'speaker': 6
      };

      const sortedRoomDevices = [...roomDevices].sort((a, b) => {
        return (securityPriority[a.type] || 99) - (securityPriority[b.type] || 99);
      });

      const doors = sortedRoomDevices.filter(d => d.type === 'door');
      const windows = sortedRoomDevices.filter(d => d.type === 'window');
      const lights = sortedRoomDevices.filter(d => d.type === 'light');
      const appliances = sortedRoomDevices.filter(d => d.type === 'appliance');
      const cameras = sortedRoomDevices.filter(d => d.type === 'camera');
      const roomExternals = externals.filter(e => e.roomId === userRoomId || e.room === userRoomId);
      
      const roomScenes = scenes.filter(scene => 
        scene.actions.some(action => roomDevices.some(d => d.id === action.deviceId))
      );
      
      return (
        <motion.div
          key="user-room"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{userProfile.getPersonDetailsDto.firstName}'s Room</h1>
            </div>
            <p className="text-muted-foreground">Manage devices in your personal space.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 bg-primary/5 border-primary/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{roomDevices.filter(d => d.type === 'door').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Doors</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{roomDevices.filter(d => d.type === 'window').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Windows</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{roomDevices.filter(d => d.type === 'camera').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Cameras</span>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-yellow-500/5 border-yellow-500/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Utilities Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{roomDevices.filter(d => d.type === 'light').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Lights</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{roomDevices.filter(d => d.type === 'appliance').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Appliances</span>
                </div>
              </div>
            </Card>
            <Card 
              className={cn(
                "p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group border-2",
                roomLocked 
                  ? "bg-red-500/5 border-red-500/20 text-red-600 hover:bg-red-500/10" 
                  : "bg-green-500/5 border-green-500/20 text-green-600 hover:bg-green-500/10"
              )}
              onClick={() => toggleRoomLock(userRoomId)}
            >
              <div className={cn(
                "rounded-full p-4 transition-transform group-hover:scale-110",
                roomLocked ? "bg-red-500/10" : "bg-green-500/10"
              )}>
                {roomLocked ? <Lock className="h-10 w-10" /> : <Unlock className="h-10 w-10" />}
              </div>
              <div className="text-center">
                <p className="text-lg font-bold uppercase tracking-wider">{roomLocked ? 'Locked' : 'Unlocked'}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Click to toggle security</p>
              </div>
            </Card>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3 space-y-12">
              {/* Doors */}
              {doors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Doors</h2>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doors.map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onValueChange={handleValueChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Windows */}
              {windows.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <WindowIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Windows</h2>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {windows.map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onValueChange={handleValueChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Appliances */}
              {appliances.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Power className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Appliances</h2>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appliances.map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onValueChange={handleValueChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Externals */}
              {roomExternals.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Externals</h2>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roomExternals.map(ext => (
                      <Card key={ext.id} className="p-6 flex flex-col gap-4 border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-sm" onClick={() => { setSelectedExternal(ext); setIsViewExternalOpen(true); }}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg">{ext.externalName}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground font-mono">ID: {ext.externalId}</p>
                            </div>
                          </div>
                          <Badge variant={ext.isTriggered ? 'destructive' : 'secondary'} className="rounded-xl px-2 py-0.5 text-[10px] font-bold">
                            {ext.isTriggered ? 'TRIGGERED' : 'STANDBY'}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:w-1/3">
              {/* Lights */}
              {lights.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Lights</h2>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 gap-4">
                    {lights.map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onValueChange={handleValueChange}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cameras (Full Width 3/3) */}
          {cameras.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Cameras</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onToggle={handleToggle}
                    onStatusChange={handleStatusChange}
                    onValueChange={handleValueChange}
                    onClick={handleDeviceClick}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    }

    if (activeView === 'facility-rooms') {
      return (
        <motion.div
          key="facility-rooms"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-start justify-between w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 shrink-0 rounded-full hover:bg-primary/10 text-primary transition-colors border border-primary/20"
                    onClick={() => setActiveView('facility-overview')}
                    title="Back to Overview"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1 shrink-0" />
                  <Sofa className="h-8 w-8 text-primary shrink-0" />
                  <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
                </div>
                <p className="text-muted-foreground">Overview of all rooms in your home.</p>
              </div>
              
              <div className="shrink-0 pt-1">
                <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 text-black border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                  <Sofa className="h-3 w-3" />
                  {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input 
                  placeholder="Search rooms..." 
                  className="pl-9 h-10 bg-white border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-row items-center gap-3 shrink-0">
                {/* Rooms view doesn't have sort by room/section yet, adding placeholder or omit, user mentions it generally */}
                {/* Let's just put Add button for Rooms */}
                <Button onClick={() => setIsAddRoomOpen(true)} className="bg-primary text-primary-foreground shrink-0">
                  <Plus className="mr-2 h-4 w-4" /> Add New Room
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.filter(r => r.name.toLowerCase().includes(roomSearchQuery.toLowerCase())).map(room => {
              const Icon = iconMap[room.icon] || Sofa;
              const roomDevices = devices.filter(d => d.room === room.id);
              const activeCount = roomDevices.filter(d => d.status === 'on' || d.status === 'active').length;
              
              return (
                <Card 
                  key={room.id} 
                  className="p-6 hover:bg-accent transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveView(`room-${room.id}`)}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon className="h-24 w-24" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">{roomDevices.length} Devices</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activeCount > 0 ? 'default' : 'secondary'}>
                        {activeCount} Active
                      </Badge>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      );
    }

    if (activeView === 'facility-actions') {
      const filteredActions = actions.filter(action => 
        !facilitySearchQuery || 
        action.actionName.toLowerCase().includes(facilitySearchQuery.toLowerCase()) ||
        action.actionDescription?.toLowerCase().includes(facilitySearchQuery.toLowerCase())
      );

      return (
        <motion.div
          key="facility-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-start justify-between w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 shrink-0 rounded-full hover:bg-primary/10 text-primary transition-colors border border-primary/20"
                    onClick={() => setActiveView('facility-overview')}
                    title="Back to Overview"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1 shrink-0" />
                  <Zap className="h-8 w-8 text-primary shrink-0" />
                  <h1 className="text-3xl font-bold tracking-tight shrink-0 whitespace-nowrap">Actions & Automation</h1>
                </div>
                <p className="text-muted-foreground">Manage system-wide triggered events and automation sequences.</p>
              </div>
              
              <div className="shrink-0 pt-1">
                <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 text-black border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                  <Zap className="h-3 w-3" />
                  {actions.length} {actions.length === 1 ? 'Action' : 'Actions'}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search actions by name..."
                  className="pl-10 h-10"
                  value={facilitySearchQuery}
                  onChange={(e) => setFacilitySearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-row items-center gap-3 shrink-0">
                <Button onClick={() => setIsAddActionOpen(true)} className="bg-primary text-primary-foreground shrink-0">
                  <Plus className="mr-2 h-4 w-4" /> Add New Action
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActions.map(action => (
              <Card 
                key={action.id} 
                className="p-6 flex flex-col gap-4 hover:shadow-md transition-all border-l-4 border-l-primary cursor-pointer group relative overflow-hidden"
                onClick={() => {
                  setSelectedAction(action);
                  setIsViewActionOpen(true);
                }}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-8 w-8 transition-colors",
                        action.actionActive ? "text-green-500 hover:bg-green-50" : "text-slate-400 hover:bg-slate-50"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActions(prev => prev.map(a => a.id === action.id ? { ...a, actionActive: !a.actionActive } : a));
                      }}
                    >
                      {action.actionActive ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight">{action.actionName}</h3>
                    <Badge variant={action.actionActive ? "default" : "secondary"} className="text-[10px] h-4">
                      {action.actionActive ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{action.actionDescription}</p>
                </div>

                <div className="mt-2 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3" />
                    <span>{action.getActionStepDtos.length} Steps</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>Mod: {action.lastModifiedOn ? format(new Date(action.lastModifiedOn), 'MMM d') : 'N/A'}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      );
    }

    if (activeView === 'facility-hardware') {
      const filteredHardwares = hardwares.filter(hw => 
        !facilitySearchQuery || hw.hardwareName.toLowerCase().includes(facilitySearchQuery.toLowerCase())
      );

      return (
        <motion.div
          key="facility-hardware"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-start justify-between w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 w-full">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 shrink-0 rounded-full hover:bg-primary/10 text-primary transition-colors border border-primary/20"
                    onClick={() => setActiveView('facility-overview')}
                    title="Back to Overview"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1 shrink-0" />
                  <Cpu className="h-8 w-8 text-primary shrink-0" />
                  <h1 className="text-3xl font-bold tracking-tight shrink-0 whitespace-nowrap">Hardware Systems</h1>
                </div>
                <p className="text-muted-foreground">Manage and monitor hardware hubs and integration controllers.</p>
              </div>
              
              <div className="shrink-0 pt-1">
                <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 text-black border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                  <Cpu className="h-3 w-3" />
                  {hardwares.length} {hardwares.length === 1 ? 'Controller' : 'Controllers'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search hardware by name..."
                  className="pl-10 h-10"
                  value={facilitySearchQuery}
                  onChange={(e) => setFacilitySearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-row items-center gap-3 shrink-0">
                <div className="flex items-center rounded-lg border bg-card p-1">
                  <button
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                      facilitySortBy === 'room' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                    )}
                    onClick={() => setFacilitySortBy('room')}
                  >
                    By Room
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                      facilitySortBy === 'section' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                    )}
                    onClick={() => setFacilitySortBy('section')}
                  >
                    By Section
                  </button>
                </div>
                <Button onClick={() => {
                  setHardwareForm({ hardwareName: '' });
                  setIsAddHardwareOpen(true);
                }} className="bg-primary text-primary-foreground shrink-0">
                  <Plus className="mr-2 h-4 w-4" /> Add Hardware
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHardwares.map(hw => {
              const deviceCount = (hw.applianceIdNames?.length || 0) + 
                                 (hw.cameraIdNames?.length || 0) + 
                                 (hw.lightIdNames?.length || 0) + 
                                 (hw.windowIdNames?.length || 0) + 
                                 (hw.doorIdNames?.length || 0) + 
                                 (hw.externalIdNames?.length || 0);

              return (
                <Card 
                  key={hw.id} 
                  className="p-6 space-y-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer bg-card"
                  onClick={() => {
                    setSelectedHardware(hw);
                    setIsHardwareDetailOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold">{hw.hardwareName}</h3>
                      </div>
                      <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold">
                        {deviceCount} {deviceCount === 1 ? 'Device' : 'Devices'} Linked
                      </Badge>
                    </div>
                    <Badge variant={hw.isActive ? 'default' : 'secondary'}>
                      {hw.isActive ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-medium">Hardware ID</span>
                      <span className="font-mono text-xs font-semibold">{hw.hardwareId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-medium">Auth Key</span>
                      <span className="font-mono text-xs select-all text-primary font-medium truncate max-w-[150px]">{hw.authKey}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      );
    }

    if (activeView === 'facility-externals') {
      const getFilteredExternals = () => {
        let result = [...externals];

        // Search by name
        if (facilitySearchQuery) {
          result = result.filter(ext => 
            ext.externalName.toLowerCase().includes(facilitySearchQuery.toLowerCase())
          );
        }

        // Sort by room or section
        result.sort((a, b) => {
          if (facilitySortBy === 'room') {
            const roomA = rooms.find(r => r.id === a.room)?.name || 'No Room';
            const roomB = rooms.find(r => r.id === b.room)?.name || 'No Room';
            return roomA.localeCompare(roomB);
          } else {
            const sectionA = sections.find(s => s.id === a.section)?.name || 'No Section';
            const sectionB = sections.find(s => s.id === b.section)?.name || 'No Section';
            return sectionA.localeCompare(sectionB);
          }
        });

        return result;
      };

      const filteredExternals = getFilteredExternals();

      return (
        <motion.div
          key="facility-externals"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center gap-3 w-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary transition-colors border border-primary/20"
                  onClick={() => setActiveView('facility-overview')}
                  title="Back to Overview"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
                <Radio className="h-8 w-8 text-primary" />
                <div className="flex items-center justify-between w-full">
                  <h1 className="text-3xl font-bold tracking-tight">External Systems</h1>
                  <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 text-black border-none font-bold text-[10px] uppercase tracking-wider">
                    <Radio className="h-3 w-3" />
                    {externals.length} {externals.length === 1 ? 'External' : 'Externals'}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground">Monitor and trigger auxiliary external interfaces around the property boundary.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search externals by name..."
                className="pl-10 h-10"
                value={facilitySearchQuery}
                onChange={(e) => setFacilitySearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center rounded-lg border bg-card p-1">
                <button
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    facilitySortBy === 'room' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                  )}
                  onClick={() => setFacilitySortBy('room')}
                >
                  By Room
                </button>
                <button
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    facilitySortBy === 'section' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                  )}
                  onClick={() => setFacilitySortBy('section')}
                >
                  By Section
                </button>
              </div>
              <Button onClick={() => {
                setExternalForm({ externalsName: '', actionIds: [] });
                setIsAddExternalOpen(true);
              }} className="bg-primary text-primary-foreground shrink-0">
                <Plus className="mr-2 h-4 w-4" /> Add External Device
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExternals.map(ext => (
              <Card key={ext.id} className="p-6 flex flex-col gap-4 border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-sm" onClick={() => { setSelectedExternal(ext); setIsViewExternalOpen(true); }}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{ext.externalName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground font-mono">ID: {ext.externalId}</p>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-bold">
                        {(ext.actionIds?.length || 0)} Linked Actions
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge variant={ext.isTriggered ? 'destructive' : 'secondary'} className="rounded-xl px-2 py-0.5 text-[10px] font-bold">
                      {ext.isTriggered ? 'TRIGGERED' : 'STANDBY'}
                    </Badge>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Switch 
                        checked={ext.isActive} 
                        onCheckedChange={(checked) => {
                          setExternals(prev => prev.map(e => e.id === ext.id ? { ...e, isActive: checked } : e));
                          addLogEntry('Hardware Security', `${ext.externalName} functional state set to ${checked ? 'enabled' : 'disabled'}`);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>

                {(ext.section || ext.room) && (
                  <div className="flex gap-2 text-xs border-t pt-2">
                    {ext.section && (
                      <Badge variant="secondary" className="flex items-center gap-1.5 font-normal text-muted-foreground bg-muted/50">
                        <Layers className="h-3 w-3" />
                        {sections.find(s => s.id === ext.section)?.name || ext.section}
                      </Badge>
                    )}
                    {ext.room && (
                      <Badge variant="secondary" className="flex items-center gap-1.5 font-normal text-muted-foreground bg-muted/50">
                        <Sofa className="h-3 w-3" />
                        {rooms.find(r => r.id === ext.room)?.name || ext.room}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="p-3 bg-muted/40 rounded-lg space-y-1 text-xs">
                  <span className="text-muted-foreground font-medium">Mapped Automate Triggers:</span>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {ext.actionIds && ext.actionIds.length > 0 ? (
                      ext.actionIds.map(aid => {
                        const sceneName = scenes.find(s => s.id === aid.toString())?.name || `ACT-${aid}`;
                        return (
                          <Badge key={aid} variant="outline" className="font-mono text-[10px]">{sceneName}</Badge>
                        );
                      })
                    ) : (
                      <span className="text-muted-foreground italic">No triggers registered</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      );
    }

    if (activeView === 'facility-sections') {
      return (
        <motion.div
          key="sections"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-start justify-between w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 w-full">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 shrink-0 rounded-full hover:bg-primary/10 text-primary transition-colors border border-primary/20"
                    onClick={() => setActiveView('facility-overview')}
                    title="Back to Overview"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1 shrink-0" />
                  <Layers className="h-8 w-8 text-primary shrink-0" />
                  <h1 className="text-3xl font-bold tracking-tight">Home Sections</h1>
                </div>
                <p className="text-muted-foreground">Manage devices and rooms grouped by section.</p>
              </div>
              
              <div className="shrink-0 pt-1">
                <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 text-black border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                  <Layers className="h-3 w-3" />
                  {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input 
                  placeholder="Search sections..." 
                  className="pl-10 h-10 rounded-xl"
                  value={sectionSearchQuery}
                  onChange={(e) => setSectionSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-row items-center gap-3 shrink-0">
                <Button onClick={() => setIsAddSectionOpen(true)} className="bg-primary text-primary-foreground shrink-0">
                  <Plus className="mr-2 h-4 w-4" /> Add New Section
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {sections.filter(s => s.name.toLowerCase().includes(sectionSearchQuery.toLowerCase())).map(section => {
              const sectionRooms = rooms.filter(r => r.section === section.id);
              const sectionDevices = devices.filter(d => d.section === section.id);
              
              return (
                <div key={section.id} className="space-y-4 group relative">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">{section.name}</h2>
                    <Badge variant="secondary" className="ml-2 uppercase text-[10px] tracking-wider">
                      {section.type || 'general'}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {sectionRooms.length} Rooms • {sectionDevices.length} Devices
                    </Badge>
                    <div className="ml-auto flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          setViewingSection(section);
                          setIsViewSectionOpen(true);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Rooms in Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rooms</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {sectionRooms.map(room => (
                          <Card 
                            key={room.id} 
                            className="cursor-pointer hover:bg-accent transition-colors group relative"
                            onClick={() => setActiveView(`room-${room.id}`)}
                          >
                            <CardContent className="flex items-center gap-3 p-3">
                              <div className="rounded-lg bg-muted p-2">
                                {iconMap[room.icon] ? React.createElement(iconMap[room.icon], { className: "h-4 w-4" }) : <Sofa className="h-4 w-4" />}
                              </div>
                              <span className="text-sm font-medium">{room.name}</span>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Devices in Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Direct Devices</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {sectionDevices.filter(d => !d.room).map(device => (
                          <DeviceCard 
                            key={device.id} 
                            device={device} 
                            onToggle={handleToggle}
                            onValueChange={handleValueChange}
                            onStatusChange={handleStatusChange}
                            onClick={handleDeviceClick}
                          />
                        ))}
                        {sectionDevices.filter(d => !d.room).length === 0 && (
                          <p className="text-xs text-muted-foreground italic">No direct devices in this section.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      );
    }

    if (activeView === 'rooms') {
      return (
        <motion.div
          key="rooms"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">All Rooms</h1>
              </div>
              <p className="text-muted-foreground">Overview of all rooms in HanssonHub.</p>
            </div>
            <Button size="sm" onClick={() => setIsAddRoomOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Room
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map(room => {
              const Icon = iconMap[room.icon] || Sofa;
              const roomDevices = devices.filter(d => d.room === room.id);
              const activeInRoom = roomDevices.filter(d => d.status === 'on' || d.status === 'active' || d.status === 'unlocked' || d.status === 'open').length;
              
              return (
                <Card 
                  key={room.id} 
                  className="cursor-pointer overflow-hidden transition-all hover:shadow-md group relative"
                  onClick={() => setActiveView(`room-${room.id}`)}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-black/20 text-white hover:text-destructive hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestAuth(() => setRooms(prev => prev.filter(r => r.id !== room.id)));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                    <img 
                      src={`https://picsum.photos/seed/${room.id}/400/250`} 
                      alt={room.name} 
                      className="h-full w-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                      <Icon className="h-5 w-5" />
                      <span className="font-bold">{room.name}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{roomDevices.length} Devices</span>
                      <Badge variant={activeInRoom > 0 ? "default" : "secondary"}>
                        {activeInRoom} Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      );
    }

    // Facility or Room Specific View
    const isRoom = activeView.startsWith('room-');
    const roomId = isRoom ? activeView.replace('room-', '') : '';
    const room = isRoom ? rooms.find(r => r.id === roomId) : null;
    
    const facilityType = activeView.replace('facility-', '');
    const singularTypeMap: Record<string, string> = {
      'appliances': 'Appliance',
      'lights': 'Light',
      'cameras': 'Camera',
      'doors': 'Door',
      'windows': 'Window'
    };
    const singularName = singularTypeMap[facilityType] || 'Device';
    const title = isRoom ? room?.name : facilityType.charAt(0).toUpperCase() + facilityType.slice(1);
    
    const TitleIcon = isRoom 
      ? (iconMap[room?.icon || ''] || Sofa) 
      : (facilityType === 'doors' ? Lock : facilityType === 'lights' ? Lightbulb : facilityType === 'appliances' ? Power : facilityType === 'windows' ? WindowIcon : Camera);

    return (
      <motion.div
        key={activeView}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-start justify-between w-full">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 w-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary transition-colors border border-primary/20 shrink-0"
                  onClick={() => setActiveView(isRoom ? 'facility-rooms' : 'facility-overview')}
                  title="Back to Overview"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="h-4 w-px bg-border mx-1 shrink-0" />
                <TitleIcon className="h-8 w-8 text-primary shrink-0" />
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              </div>
              <p className="text-muted-foreground">Manage all {title?.toLowerCase()} in your home.</p>
            </div>
            
            <div className="shrink-0 pt-1">
              <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 text-black border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                <TitleIcon className="h-3 w-3" />
                {filteredDevices.length} {filteredDevices.length === 1 ? 'Device' : 'Devices'}
              </Badge>
            </div>
          </div>
          
          {(isRoom || facilityType !== 'overview') && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full max-w-md">
                {!isRoom && (
                  <>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      placeholder={`Search ${title?.toLowerCase()}...`}
                      className="pl-10 h-10"
                      value={facilitySearchQuery}
                      onChange={(e) => setFacilitySearchQuery(e.target.value)}
                    />
                  </>
                )}
              </div>
              <div className="flex flex-row items-center gap-3 shrink-0">
                {!isRoom && (
                  <div className="flex items-center rounded-lg border bg-card p-1">
                    <button
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                        facilitySortBy === 'room' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                      )}
                      onClick={() => setFacilitySortBy('room')}
                    >
                      By Room
                    </button>
                    <button
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                        facilitySortBy === 'section' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                      )}
                      onClick={() => setFacilitySortBy('section')}
                    >
                      By Section
                    </button>
                  </div>
                )}
                {isRoom ? (
                  <Button variant="outline" onClick={() => {
                    setViewingRoom(room!);
                    setIsViewRoomOpen(true);
                  }} className="rounded-xl h-10 px-6 shadow-sm font-bold shrink-0">
                    <Info className="mr-2 h-4 w-4" />
                    View Room Details
                  </Button>
                ) : (
                  <Button onClick={() => setIsAddDeviceOpen(true)} className="bg-primary text-primary-foreground shrink-0">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New {singularName}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {isRoom && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-6 bg-primary/5 border-primary/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{filteredDevices.filter(d => d.type === 'door').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Doors</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{filteredDevices.filter(d => d.type === 'window').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Windows</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{filteredDevices.filter(d => d.type === 'camera').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Cameras</span>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-yellow-500/5 border-yellow-500/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Utilities Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{filteredDevices.filter(d => d.type === 'light').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Lights</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{filteredDevices.filter(d => d.type === 'appliance').length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Appliances</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2",
          activeView === 'facility-appliances' 
            ? (isSidebarCollapsed ? "lg:grid-cols-4" : "lg:grid-cols-3") 
            : "lg:grid-cols-3 xl:grid-cols-4"
        )}>
          {filteredDevices.map(device => (
              <DeviceCard 
                key={device.id} 
                device={device} 
                onToggle={handleToggle}
                onValueChange={handleValueChange}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteDevice}
                onEdit={handleEditDevice}
                onClick={handleDeviceClick}
              />
            ))}
          </div>
        
        {filteredDevices.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
            <p className="text-muted-foreground">No devices found in this view.</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Toaster position="top-center" richColors />
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        rooms={rooms}
        sections={sections}
        userProfile={userProfile}
        isCollapsed={isSidebarCollapsed}
      />
      
      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-8 bg-card/30 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4 mt-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">HanssonHub</span>
            </div>
            <div className="h-8 w-[1px] bg-border mr-4" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <HeaderIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {headerTitle}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Cloud className="h-4 w-4" />
              <span>24°C Sunny</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="relative rounded-full p-2 hover:bg-muted"
                onClick={() => setIsChatModalOpen(true)}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </button>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 pb-12">
            <AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>

      {/* Add Device Dialog */}
      <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              {(() => {
                return <PlusCircle className="h-5 w-5 text-primary" />;
              })()}
              Add New {(() => {
                const type = activeView.replace('facility-', '');
                const map: Record<string, string> = {
                  'appliances': 'Appliance',
                  'lights': 'Light',
                  'cameras': 'Camera',
                  'doors': 'Door',
                  'windows': 'Window'
                };
                return map[type] || 'Device';
              })()}
            </DialogTitle>
          <DialogDescription>
            Connect a new smart device to your HanssonHub.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
        <div className="grid gap-4 pt-[3px] pb-4 px-1">
          <div className="grid gap-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              {(() => {
                const type = activeView.replace('facility-', '');
                const Icon = type === 'doors' ? Lock : type === 'lights' ? Lightbulb : type === 'appliances' ? Power : type === 'windows' ? WindowIcon : type === 'cameras' ? Camera : Edit3;
                return <Icon className="h-3 w-3 text-muted-foreground" />;
              })()}
              {(() => {
                const type = activeView.replace('facility-', '');
                const map: Record<string, string> = {
                  'appliances': 'Appliance Name',
                  'lights': 'Light Name',
                  'cameras': 'Camera Name',
                  'doors': 'Door Name',
                  'windows': 'Window Name'
                };
                  return map[type] || 'Device Name';
                })()}
              </Label>
              <Input 
                id="name" 
                placeholder={`e.g. ${(() => {
                  const type = activeView.replace('facility-', '');
                  if (type === 'lights') return 'Desk Lamp';
                  if (type === 'doors') return 'Main Entrance';
                  if (type === 'cameras') return 'Backyard Camera';
                  if (type === 'appliances') return 'Coffee Maker';
                  return 'My Device';
                })()}`}
                value={newDevice.name}
                onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {activeView === 'facility-appliances' && (
              <div className="grid gap-2">
                <Label htmlFor="appliance-type" className="flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                  Appliance Type
                </Label>
                <Select 
                  value={newDevice.applianceType?.toString() || '1'} 
                  onValueChange={(v) => setNewDevice(prev => ({ ...prev, applianceType: parseInt(v) }))}
                >
                  <SelectTrigger id="appliance-type">
                    <SelectValue placeholder="Select appliance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appNamesDetailList.applianceType.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeView === 'facility-cameras' && (
              <div className="space-y-4 pt-2 border-t mt-2">
                <div className="grid gap-2">
                  <Label htmlFor="ipAddress" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    <Globe className="h-3 w-3" />
                    IP Address
                  </Label>
                  <Input 
                    id="ipAddress" 
                    placeholder="e.g. 192.168.1.100"
                    value={newDevice.ipAddress}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, ipAddress: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      <UserCircle className="h-3 w-3" />
                      Username
                    </Label>
                    <Input 
                      id="username" 
                      placeholder="admin"
                      value={newDevice.username}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      <Shield className="h-3 w-3" />
                      Password
                    </Label>
                    <Input 
                      id="password" 
                      type="password"
                      placeholder="••••••••"
                      value={newDevice.password}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="streamPath" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      <Video className="h-3 w-3" />
                      Stream Path
                    </Label>
                    <Input 
                      id="streamPath" 
                      placeholder="/live"
                      value={newDevice.streamPath}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, streamPath: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="port" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      <Settings2 className="h-3 w-3" />
                      Port
                    </Label>
                    <Input 
                      id="port" 
                      type="number"
                      placeholder="80"
                      value={newDevice.port}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, port: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeView === 'facility-doors' && (
              <div className="grid gap-2">
                <Label htmlFor="door-type" className="flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  Door Type
                </Label>
                <Select 
                  value={newDevice.doorType} 
                  onValueChange={(v: any) => setNewDevice(prev => ({ ...prev, doorType: v }))}
                >
                  <SelectTrigger id="door-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior">
                      <div className="flex items-center gap-2">
                        <HomeIcon className="h-4 w-4" />
                        <span>Interior</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="exterior">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Exterior</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="section" className="flex items-center gap-2">
                <Layers className="h-3 w-3 text-muted-foreground" />
                Section Name (Optional)
              </Label>
              <Select 
                value={newDevice.section} 
                onValueChange={(v) => setNewDevice(prev => ({ ...prev, section: v === 'none' ? undefined : v, room: '' }))}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Section</SelectItem>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room" className="flex items-center gap-2">
                <Sofa className="h-3 w-3 text-muted-foreground" />
                Room Name (Optional)
              </Label>
              <Select 
                value={newDevice.room} 
                onValueChange={(v) => setNewDevice(prev => ({ ...prev, room: v === 'none' ? undefined : v }))}
              >
                <SelectTrigger id="room">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Room</SelectItem>
                  {rooms.filter(r => !newDevice.section || r.section === newDevice.section).map(room => (
                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          </ScrollArea>
          <DialogFooter>
            
            <Button onClick={handleAddDevice} className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add {(() => {
                const type = activeView.replace('facility-', '');
                const map: Record<string, string> = {
                  'appliances': 'Appliance',
                  'lights': 'Light',
                  'cameras': 'Camera',
                  'doors': 'Door',
                  'windows': 'Window'
                };
                return map[type] || 'Device';
              })()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Sofa className="h-5 w-5 text-primary" />
              Add New Room
            </DialogTitle>
            <DialogDescription>
              Create a new room in your HanssonHub.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] overflow-y-auto px-1">
          <div className="grid gap-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="room-name" className="flex items-center gap-2">
                <Edit3 className="h-3 w-3 text-muted-foreground" />
                Room Name
              </Label>
              <Input 
                id="room-name" 
                placeholder="e.g. Study" 
                value={newRoom.name}
                onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-person" className="flex items-center gap-2">
                <UserIcon className="h-3 w-3 text-muted-foreground" />
                Person Name
              </Label>
              <Select 
                value={newRoom.personId?.toString() || 'none'} 
                onValueChange={(v) => setNewRoom(prev => ({ ...prev, personId: v === 'none' ? undefined : parseInt(v) }))}
              >
                <SelectTrigger id="room-person">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Person Assigned</SelectItem>
                  {allUsers.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full overflow-hidden bg-muted shrink-0">
                          <img 
                            src={u.getPersonDetailsDto.imageUrl} 
                            alt={u.getPersonDetailsDto.firstName} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="truncate">{u.getPersonDetailsDto.firstName} {u.getPersonDetailsDto.lastName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-section" className="flex items-center gap-2">
                <Layers className="h-3 w-3 text-muted-foreground" />
                Section Name (Optional)
              </Label>
              <Select 
                value={newRoom.section} 
                onValueChange={(v) => setNewRoom(prev => ({ ...prev, section: v === 'none' ? undefined : v }))}
              >
                <SelectTrigger id="room-section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Section</SelectItem>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-icon" className="flex items-center gap-2">
                <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                Icon
              </Label>
              <Select 
                value={newRoom.icon} 
                onValueChange={(v) => setNewRoom(prev => ({ ...prev, icon: v }))}
              >
                <SelectTrigger id="room-icon">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sofa">Living Room (Sofa)</SelectItem>
                  <SelectItem value="Utensils">Kitchen (Utensils)</SelectItem>
                  <SelectItem value="Bed">Bedroom (Bed)</SelectItem>
                  <SelectItem value="Bath">Bathroom (Bath)</SelectItem>
                  <SelectItem value="Car">Garage (Car)</SelectItem>
                  <SelectItem value="Trees">Outdoor (Trees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="space-y-0.5">
                <Label htmlFor="room-hidden" className="text-sm font-medium">Hidden Room</Label>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hide from normal views</p>
              </div>
              <Switch 
                id="room-hidden" 
                checked={newRoom.isHidden || false} 
                onCheckedChange={(checked) => setNewRoom(prev => ({ ...prev, isHidden: checked }))} 
              />
            </div>
          </div>
          </ScrollArea>
          <DialogFooter>
            
            <Button onClick={handleAddRoom} className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditSectionOpen} onOpenChange={setIsEditSectionOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Edit {editingSection?.name || 'Section'}
            </DialogTitle>
            <DialogDescription>Update the details and visibility of this section.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-sec-name" className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                Section Name
              </Label>
              <Input 
                id="edit-sec-name" 
                value={editingSection?.name || ''}
                onChange={(e) => setEditingSection(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sec-type" className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                Section Type
              </Label>
              <Select 
                value={editingSection?.type || 'general'} 
                onValueChange={(v: 'general' | 'secretive') => setEditingSection(prev => prev ? { ...prev, type: v } : null)}
              >
                <SelectTrigger id="edit-sec-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="secretive">Secretive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="space-y-0.5">
                <Label htmlFor="edit-sec-hidden" className="text-sm font-medium">Hidden Section</Label>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hide from normal views</p>
              </div>
              <Switch 
                id="edit-sec-hidden" 
                checked={editingSection?.isHidden || false} 
                onCheckedChange={(checked) => setEditingSection(prev => prev ? { ...prev, isHidden: checked } : null)} 
              />
            </div>
          </div>
          <DialogFooter>
            
            <Button onClick={() => {
              if (editingSection?.id && editingSection.name) {
                requestAuth(() => {
                  setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, name: editingSection.name!, type: editingSection.type, isHidden: editingSection.isHidden } : s));
                  setIsEditSectionOpen(false);
                });
              }
            }} className="bg-primary text-primary-foreground">
              <CheckCheck className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Password Change Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-500" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Update your account password. You will need your current password and your authorization code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="password-token">Security Token</Label>
              <Input 
                id="password-token" 
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className={passwordData.token ? "border-b-green-400" : ""}
                value={passwordData.token}
                onChange={(e) => setPasswordData(prev => ({ ...prev, token: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password"
                className={passwordData.newPassword ? "border-b-green-400" : ""}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password-auth-code">Authorization Code</Label>
              <Input 
                id="password-auth-code" 
                placeholder="000000"
                maxLength={6}
                className={passwordData.authorizationCode.length === 6 ? "border-b-green-400" : ""}
                value={passwordData.authorizationCode}
                onChange={(e) => setPasswordData(prev => ({ ...prev, authorizationCode: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPasswordModalOpen(false)} className="bg-transparent border-2 border-blue-600 text-black hover:bg-blue-50 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Authorization Code Dialog */}
      <Dialog open={isAuthCodeModalOpen} onOpenChange={setIsAuthCodeModalOpen}>
        <DialogContent className="sm:max-w-[400px] border-2 border-yellow-400 shadow-lg shadow-yellow-100/50">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2 text-yellow-700">
              <ShieldAlert className="h-5 w-5" />
              Authorization Required
            </DialogTitle>
            <DialogDescription className="text-yellow-800/70">
              This is a sensitive operation. Please enter your credentials to authorize the action.
            </DialogDescription>
          </DialogHeader>
        <div className="grid gap-4 pt-[3px] pb-4">
          <div className="grid gap-2">
            <Label htmlFor="auth-pwd">Login Password</Label>
            <Input 
              id="auth-pwd" 
              type="password"
              className={authCodeData.password ? "border-b-green-400" : ""}
              value={authCodeData.password}
              onChange={(e) => setAuthCodeData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="auth-token">Security Token</Label>
            <Input 
              id="auth-token" 
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className={authCodeData.token ? "border-b-green-400" : ""}
              value={authCodeData.token}
              onChange={(e) => setAuthCodeData(prev => ({ ...prev, token: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-auth">New Authorization Code</Label>
            <Input 
              id="new-auth" 
              placeholder="000000"
              maxLength={6}
              className={authCodeData.newAuthorizationCode.length === 6 ? "border-b-green-400" : ""}
              value={authCodeData.newAuthorizationCode}
              onChange={(e) => setAuthCodeData(prev => ({ ...prev, newAuthorizationCode: e.target.value }))}
            />
          </div>
        </div>
          <DialogFooter>
            <Button 
               onClick={() => {
                // In a real app, verify the auth code here
                if (pendingUserAction) {
                  if (pendingUserAction.type === 'delete') {
                    setAllUsers(prev => prev.filter(u => u.id !== pendingUserAction.userId));
                  } else if (pendingUserAction.type === 'disable') {
                    setAllUsers(prev => prev.map(u => u.id === pendingUserAction.userId ? { ...u, disabled: true, getPersonDetailsDto: { ...u.getPersonDetailsDto, disabled: true } } : u));
                  } else if (pendingUserAction.type === 'toggle-disable') {
                    setAllUsers(prev => prev.map(u => u.id === pendingUserAction.userId ? { 
                      ...u, 
                      disabled: !u.disabled, 
                      getPersonDetailsDto: { ...u.getPersonDetailsDto, disabled: !u.getPersonDetailsDto.disabled } 
                    } : u));
                  } else if (pendingUserAction.type === 'delete-address') {
                    setUserProfile(p => ({
                      ...p,
                      getPersonDetailsDto: {
                        ...p.getPersonDetailsDto,
                        getAddressDtos: p.getPersonDetailsDto.getAddressDtos.filter((_, i) => i !== pendingUserAction.index)
                      }
                    }));
                  } else if (pendingUserAction.type === 'delete-contact') {
                    setUserProfile(p => ({
                      ...p,
                      getPersonDetailsDto: {
                        ...p.getPersonDetailsDto,
                        getContactDetailsDtos: p.getPersonDetailsDto.getContactDetailsDtos.filter((_, i) => i !== pendingUserAction.index)
                      }
                    }));
                  } else if (pendingUserAction.type === 'update-role' && pendingUserAction.targetRole) {
                    const targetRole = pendingUserAction.targetRole;
                    setAllUsers(prev => prev.map(u => u.getUserDto.id === pendingUserAction.userId ? {
                      ...u,
                      getUserDto: {
                        ...u.getUserDto,
                        role: targetRole,
                        roleName: Role[targetRole]
                      }
                    } : u));
                  }
                  setPendingUserAction(null);
                  setIsViewPersonDetailsOpen(false);
                }
                setIsAuthCodeModalOpen(false);
              }} 
              className="bg-transparent border-2 border-yellow-600 text-black hover:bg-yellow-50 flex items-center gap-2"
            >
              <Key className="h-4 w-4 text-yellow-600" />
              Authorize Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add New Person Dialog */}
      <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Household Member
            </DialogTitle>
            <DialogDescription>Create a new person and their associated login credentials.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] px-1">
            <div className="grid gap-6 pt-[3px] py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider border-b pb-1">
                  <UserIcon className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="p-fname">First Name</Label>
                    <Input id="p-fname" className={newPerson.createPersonDetailsDto.firstName ? "border-b-green-400" : ""} value={newPerson.createPersonDetailsDto.firstName} onChange={(e) => setNewPerson(p => ({ ...p, createPersonDetailsDto: { ...p.createPersonDetailsDto, firstName: e.target.value } }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-lname">Last Name</Label>
                    <Input id="p-lname" className={newPerson.createPersonDetailsDto.lastName ? "border-b-green-400" : ""} value={newPerson.createPersonDetailsDto.lastName} onChange={(e) => setNewPerson(p => ({ ...p, createPersonDetailsDto: { ...p.createPersonDetailsDto, lastName: e.target.value } }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-dob">Date of Birth</Label>
                    <Input id="p-dob" type="date" value={newPerson.createPersonDetailsDto.dateOfBirth} onChange={(e) => setNewPerson(p => ({ ...p, createPersonDetailsDto: { ...p.createPersonDetailsDto, dateOfBirth: e.target.value } }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-gender">Gender</Label>
                    <Select value={newPerson.createPersonDetailsDto.gender.toString()} onValueChange={(v) => setNewPerson(p => ({ ...p, createPersonDetailsDto: { ...p.createPersonDetailsDto, gender: parseInt(v) } }))}>
                      <SelectTrigger id="p-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Male</SelectItem>
                        <SelectItem value="2">Female</SelectItem>
                        <SelectItem value="3">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-relation">Relation to Owner</Label>
                  <Input id="p-relation" placeholder="e.g. Spouse, Brother, etc." className={newPerson.relation ? "border-b-green-400" : ""} value={newPerson.relation} onChange={(e) => setNewPerson(p => ({ ...p, relation: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider border-b pb-1">
                  <Key className="h-4 w-4" />
                  User Account & Security
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="p-uname">Username</Label>
                    <Input id="p-uname" className={newPerson.createUserDto.userName ? "border-b-green-400" : ""} value={newPerson.createUserDto.userName} onChange={(e) => setNewPerson(p => ({ ...p, createUserDto: { ...p.createUserDto, userName: e.target.value } }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-role">System Role</Label>
                    <Select value={newPerson.createUserDto.role.toString()} onValueChange={(v) => setNewPerson(p => ({ ...p, createUserDto: { ...p.createUserDto, role: parseInt(v) } }))}>
                      <SelectTrigger id="p-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Wife</SelectItem>
                        <SelectItem value="3">Child</SelectItem>
                        <SelectItem value="4">Relative</SelectItem>
                        <SelectItem value="5">Visitor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-pwd">Password</Label>
                    <Input id="p-pwd" type="password" className={newPerson.createUserDto.password ? "border-b-green-400" : ""} value={newPerson.createUserDto.password} onChange={(e) => setNewPerson(p => ({ ...p, createUserDto: { ...p.createUserDto, password: e.target.value } }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-auth">Initial Auth Code (6 digits)</Label>
                    <Input id="p-auth" placeholder="000000" maxLength={6} className={newPerson.createUserDto.authorizationCode.length === 6 ? "border-b-green-400" : ""} value={newPerson.createUserDto.authorizationCode} onChange={(e) => setNewPerson(p => ({ ...p, createUserDto: { ...p.createUserDto, authorizationCode: e.target.value } }))} />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            
            <Button onClick={() => {
              const newId = Math.floor(Math.random() * 1000);
              const added: GetPersonDto = {
                id: newId,
                personId: `P-${newId}`,
                disabled: false,
                getPersonDetailsDto: {
                  id: newId,
                  firstName: newPerson.createPersonDetailsDto.firstName,
                  lastName: newPerson.createPersonDetailsDto.lastName,
                  gender: newPerson.createPersonDetailsDto.gender,
                  imageUrl: `https://picsum.photos/seed/${newId}/200/200`,
                  disabled: false,
                  getAddressDtos: [],
                  getContactDetailsDtos: []
                },
                getUserDto: {
                  id: newId,
                  userName: newPerson.createUserDto.userName,
                  roleName: Role[newPerson.createUserDto.role],
                  role: newPerson.createUserDto.role,
                  personId: newId
                }
              };
              setAllUsers(prev => [...prev, added]);
              setIsAddPersonOpen(false);
            }} className="bg-primary text-primary-foreground">
              Create Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Person Role Dialog */}
      <Dialog open={isEditPersonRoleOpen} onOpenChange={setIsEditPersonRoleOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Update {updateUserRoleData.userName || 'User'} Role
            </DialogTitle>
            <DialogDescription>Modify the system access level for {updateUserRoleData.userName}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-role-select">Select New Role</Label>
              <Select value={updateUserRoleData.role.toString()} onValueChange={(v) => setUpdateUserRoleData(p => ({ ...p, role: parseInt(v) }))}>
                <SelectTrigger id="edit-role-select" className="bg-transparent text-black border-primary/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {appNamesDetailList.role.map(r => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            
            <Button onClick={() => {
              requestAuth(() => {
                const targetRole = updateUserRoleData.role;
                setAllUsers(prev => prev.map(u => u.getUserDto.id === updateUserRoleData.id ? {
                  ...u,
                  getUserDto: {
                    ...u.getUserDto,
                    role: targetRole,
                    roleName: Role[targetRole]
                  }
                } : u));
                setIsEditPersonRoleOpen(false);
                setIsViewPersonDetailsOpen(false);
              });
            }} className="bg-transparent border-2 border-primary text-black hover:bg-primary/5 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Person Details Dialog */}
      <Dialog open={isViewPersonDetailsOpen} onOpenChange={setIsViewPersonDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]" showCloseButton={false}>
          <DialogHeader className="mb-0">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <DialogTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" />
                  View User Profile: {viewingPerson?.getPersonDetailsDto.firstName} {viewingPerson?.getPersonDetailsDto.lastName}
                </DialogTitle>
                <DialogDescription className="mt-0">Detailed view of user properties and system settings.</DialogDescription>
              </div>
              <div className="flex items-center gap-2 pr-6">
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 bg-transparent border border-blue-200 text-black hover:bg-blue-50"
                  onClick={() => {
                    if (viewingPerson) {
                      setUpdateUserRoleData({
                        id: viewingPerson.getUserDto.id,
                        userName: viewingPerson.getUserDto.userName,
                        password: '',
                        role: viewingPerson.getUserDto.role
                      });
                      setIsEditPersonRoleOpen(true);
                    }
                  }}
                >
                  <Settings2 className="h-4 w-4 text-blue-500" />
                </Button>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className={cn(
                    "h-8 w-8 bg-transparent border hover:bg-muted",
                    viewingPerson?.disabled ? "text-green-600 border-green-200" : "text-yellow-600 border-yellow-200"
                  )}
                  onClick={() => {
                    if (viewingPerson) {
                      requestAuth(() => {
                        setAllUsers(prev => prev.map(u => u.id === viewingPerson.id ? { 
                          ...u, 
                          disabled: !u.disabled, 
                          getPersonDetailsDto: { ...u.getPersonDetailsDto, disabled: !u.getPersonDetailsDto.disabled } 
                        } : u));
                        setIsViewPersonDetailsOpen(false);
                      });
                    }
                  }}
                >
                  {viewingPerson?.disabled ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 bg-transparent border border-red-200 text-black hover:bg-red-50"
                  onClick={() => {
                    if (viewingPerson) {
                      requestAuth(() => {
                        setAllUsers(prev => prev.filter(u => u.id !== viewingPerson.id));
                        setIsViewPersonDetailsOpen(false);
                      });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
                <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
                  <X className="h-4 w-4" />
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 pt-[3px] pb-4">
              {viewingPerson && (
                <>
                  {/* Identity Section */}
                  <div className="flex items-start gap-6 border-b pb-4">
                    <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden shrink-0 border-2 border-primary/10 shadow-inner">
                      <img 
                        src={viewingPerson.getPersonDetailsDto.imageUrl || `https://ui-avatars.com/api/?name=${viewingPerson.getPersonDetailsDto.firstName}+${viewingPerson.getPersonDetailsDto.lastName}&background=random`} 
                        alt="Profile" 
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${viewingPerson.getPersonDetailsDto.firstName}+${viewingPerson.getPersonDetailsDto.lastName}&background=random`;
                        }}
                      />
                    </div>
                    <div className="space-y-3 flex-1">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Core Identity</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase">Username</Label>
                          <p className="font-medium font-mono">{viewingPerson.getUserDto.userName}</p>
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase">System Role</Label>
                          <Badge variant="outline" className="mt-1">{viewingPerson.getUserDto.roleName}</Badge>
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase">Internal ID</Label>
                          <p className="font-medium font-mono text-muted-foreground text-xs">{viewingPerson.personId}</p>
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase">Gender</Label>
                          <p className="font-medium">{Gender[viewingPerson.getPersonDetailsDto.gender]}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Contact Channels</h4>
                    {viewingPerson.getPersonDetailsDto.getContactDetailsDtos.map((c, i) => (
                      <div key={i} className="bg-muted/30 p-3 rounded-lg grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase">Email</Label>
                          <p className="truncate" title={c.email}>{c.email}</p>
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase">Phone</Label>
                          <p>{c.phoneNumber}</p>
                        </div>
                      </div>
                    ))}
                    {viewingPerson.getPersonDetailsDto.getContactDetailsDtos.length === 0 && <p className="text-xs text-muted-foreground italic">No contact channels defined.</p>}
                  </div>

                  {/* Address Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Physical Addresses</h4>
                    {viewingPerson.getPersonDetailsDto.getAddressDtos.map((a, i) => (
                      <div key={i} className="bg-muted/30 p-3 rounded-lg space-y-1 text-sm">
                        <p className="font-medium">{a.numberLine} {a.street}</p>
                        <p className="text-muted-foreground text-xs">{a.city}, {a.state}, {a.country}</p>
                        {a.postalCode && <p className="text-muted-foreground text-[10px]">Postal: {a.postalCode}</p>}
                      </div>
                    ))}
                    {viewingPerson.getPersonDetailsDto.getAddressDtos.length === 0 && <p className="text-xs text-muted-foreground italic">No addresses saved.</p>}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="sm:justify-end">
            {/* Removed Close View button as per request */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Add New Category
            </DialogTitle>
            <DialogDescription>Create a new category to organize your contacts.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-6 pt-0 pb-4 overflow-y-auto max-h-[60vh]">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input 
                id="cat-name" 
                placeholder="e.g. Emergency, Family, Services" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-desc">Description (Optional)</Label>
              <Input 
                id="cat-desc" 
                placeholder="Brief description of this category" 
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category Icon</Label>
              <div className="grid grid-cols-5 gap-2 border rounded-xl p-3 max-h-[160px] overflow-y-auto bg-muted/10">
                {['UserCircle', 'Users', 'ShieldAlert', 'Heart', 'Wrench', 'Phone', 'Mail', 'HomeIcon', 'Smartphone', 'Zap', 'Bell', 'Search', 'Building2', 'Sofa', 'Utensils', 'Bed', 'Bath', 'Car', 'Trees', 'Shield'].map(iconName => {
                  const Icon = iconMap[iconName];
                  return (
                    <Button
                      key={iconName}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-10 w-10 transition-all",
                        newCategoryIcon === iconName ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                      )}
                      onClick={() => setNewCategoryIcon(iconName)}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 border-t bg-slate-50 flex items-center justify-center sm:justify-center">
            <Button onClick={handleAddCategory} className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Edit Category
            </DialogTitle>
            <DialogDescription>Update category details and icon.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-cat-name">Category Name</Label>
              <Input 
                id="edit-cat-name" 
                placeholder="e.g. Emergency, Family, Services" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cat-desc">Description (Optional)</Label>
              <Input 
                id="edit-cat-desc" 
                placeholder="Brief description of this category" 
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category Icon</Label>
              <div className="grid grid-cols-5 gap-2 border rounded-xl p-3 max-h-[160px] overflow-y-auto bg-muted/10">
                {['UserCircle', 'Users', 'ShieldAlert', 'Heart', 'Wrench', 'Phone', 'Mail', 'HomeIcon', 'Smartphone', 'Zap', 'Bell', 'Search', 'Building2', 'Sofa', 'Utensils', 'Bed', 'Bath', 'Car', 'Trees', 'Shield'].map(iconName => {
                  const Icon = iconMap[iconName];
                  return (
                    <Button
                      key={iconName}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-10 w-10 transition-all",
                        newCategoryIcon === iconName ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                      )}
                      onClick={() => setNewCategoryIcon(iconName)}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            
            <Button onClick={handleEditCategory} className="bg-primary text-primary-foreground">
              <CheckCheck className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddContactOpen} onOpenChange={(open) => { setIsAddContactOpen(open); if (!open) setEditingContactId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[9px] border border-black bg-white shadow-2xl">
          <DialogHeader className="mt-0 mx-0 pt-5 px-8 pb-3 mb-0 border-b bg-white pr-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingContactId ? <UserCog className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
                <DialogTitle className="text-lg font-bold tracking-tight">
                  {editingContactId ? `Edit ${newContact.firstName || 'Contact'}` : 'Add New Contact'}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-xs font-medium mt-1 text-muted-foreground">Fill in the contact details and addresses.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 pr-4 overflow-y-auto max-h-[60vh] p-8 pt-2">
            <div className="grid gap-6 pt-[3px] pb-4">
              <div className="flex gap-8 items-start">
                <div className="flex-1 space-y-5">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <UserCircle className="h-3 w-3" /> First Name
                    </Label>
                    <Input 
                      placeholder="First Name" 
                      className="h-10 rounded-none"
                      value={newContact.firstName}
                      onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <UserCircle className="h-3 w-3" /> Last Name
                    </Label>
                    <Input 
                      placeholder="Last Name" 
                      className="h-10 rounded-none"
                      value={newContact.lastName}
                      onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground self-start ml-2">
                    <Camera className="h-3 w-3" /> Avatar
                  </Label>
                  <div 
                    className="relative h-40 w-40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden cursor-pointer group bg-muted/30 hover:bg-muted transition-all shadow-sm"
                    onClick={() => document.getElementById('contact-avatar-upload')?.click()}
                  >
                    {newContact.imageUrl ? (
                      <img src={newContact.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                      <Pencil className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <input 
                    id="contact-avatar-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, 'contact')}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Category
                </Label>
                <Select 
                  value={newContact.contactCategory.toString()} 
                  onValueChange={(val) => setNewContact(prev => ({ ...prev, contactCategory: parseInt(val) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {appNamesDetailList.contactCategoryIdNames.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Contact Details (Phone & Email)
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setNewContact(prev => ({ 
                      ...prev, 
                      contactDetails: [...prev.contactDetails, { phoneNumber: '', email: '', personDetailsId: 0 }] 
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {newContact.contactDetails.map((detail, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-muted/20 space-y-4 relative group">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const contactDetails = newContact.contactDetails.filter((_, i) => i !== idx);
                        setNewContact(prev => ({ ...prev, contactDetails }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Phone</Label>
                        <Input 
                          placeholder="+123..." 
                          className="h-10 rounded-none"
                          value={detail.phoneNumber}
                          onChange={(e) => {
                            const details = [...newContact.contactDetails];
                            details[idx].phoneNumber = e.target.value;
                            setNewContact(prev => ({ ...prev, contactDetails: details }));
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email</Label>
                        <Input 
                          placeholder="email@example.com" 
                          className="h-10 rounded-none"
                          value={detail.email}
                          onChange={(e) => {
                            const details = [...newContact.contactDetails];
                            details[idx].email = e.target.value;
                            setNewContact(prev => ({ ...prev, contactDetails: details }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Addresses
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setNewContact(prev => ({ 
                      ...prev, 
                      address: [...prev.address, { 
                        numberLine: '', street: '', city: '', region: '', state: '', country: '', postalCode: '' 
                      }] 
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {newContact.address.map((addr, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-muted/20 space-y-4 relative group">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const address = newContact.address.filter((_, i) => i !== idx);
                        setNewContact(prev => ({ ...prev, address }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Number Line</Label>
                        <Input className="h-10 rounded-none" value={addr.numberLine} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].numberLine = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Street</Label>
                        <Input className="h-10 rounded-none" value={addr.street} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].street = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">City</Label>
                        <Input className="h-10 rounded-none" value={addr.city} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].city = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Region</Label>
                        <Input className="h-10 rounded-none" value={addr.region} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].region = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">State</Label>
                        <Input className="h-10 rounded-none" value={addr.state} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].state = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Country</Label>
                        <Input className="h-10 rounded-none" value={addr.country} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].country = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Postal Code</Label>
                        <Input className="h-10 rounded-none" value={addr.postalCode} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].postalCode = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 border-t gap-3 bg-slate-50 flex items-center justify-end sm:items-center">
            <Button onClick={handleAddContact} className="bg-black hover:bg-black/90 text-white px-4 mb-3 font-normal flex items-center justify-center gap-2">
              {editingContactId ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {editingContactId ? 'Update Contact' : 'Save Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteContactOpen} onOpenChange={setIsDeleteContactOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Delete Contact
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {contactToDelete?.firstName} {contactToDelete?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            
            <Button variant="destructive" onClick={handleDeleteContact}>Delete Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSceneOpen} onOpenChange={setIsAddSceneOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              Add New Scene
            </DialogTitle>
            <DialogDescription>
              Create a new automated scene for your home.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="scene-name">Scene Name</Label>
              <Input 
                id="scene-name" 
                placeholder="e.g. Movie Night" 
                value={newScene.name}
                onChange={(e) => setNewScene(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scene-icon">Icon</Label>
              <Select 
                value={newScene.icon} 
                onValueChange={(v) => setNewScene(prev => ({ ...prev, icon: v }))}
              >
                <SelectTrigger id="scene-icon">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Film">Movie (Film)</SelectItem>
                  <SelectItem value="Sun">Day (Sun)</SelectItem>
                  <SelectItem value="HomeIcon">Home (Home)</SelectItem>
                  <SelectItem value="Shield">Security (Shield)</SelectItem>
                  <SelectItem value="Zap">Energy (Zap)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            
            <Button onClick={handleAddScene}>Add Scene</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Add New Section
            </DialogTitle>
            <DialogDescription>Create a new home section to group your rooms and devices.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="sec-name" className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                Section Name
              </Label>
              <Input 
                id="sec-name" 
                placeholder="e.g. Backyard, Garage, Attic" 
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sec-type" className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                Section Type
              </Label>
              <Select 
                value={newSectionType} 
                onValueChange={(v: 'general' | 'secretive') => setNewSectionType(v)}
              >
                <SelectTrigger id="sec-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="secretive">Secretive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="space-y-0.5">
                <Label htmlFor="sec-hidden" className="text-sm font-medium">Hidden Section</Label>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hide from normal views</p>
              </div>
              <Switch 
                id="sec-hidden" 
                checked={newSectionIsHidden} 
                onCheckedChange={setNewSectionIsHidden} 
              />
            </div>
          </div>
          <DialogFooter>
            
            <Button onClick={handleAddSection} className="flex items-center gap-2 bg-primary text-primary-foreground">
              <PlusCircle className="h-4 w-4" />
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className={`sm:max-w-[520px] border-2 transition-colors duration-300 ${authError ? "border-red-500" : "border-yellow-400 shadow-lg shadow-yellow-100/50"}`}>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 items-center">
            {/* Left Column (Current Contents) */}
            <div className="sm:col-span-7 space-y-4">
              <div className="space-y-2">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <Key className="h-5 w-5 text-primary animate-pulse" />
                  Authorization Required
                </DialogTitle>
                <DialogDescription>
                  Please enter your 6-digit numerical authorization code to proceed with the operation.
                </DialogDescription>
              </div>
              
              <div className="flex flex-col gap-3">
                <Input 
                  type="password"
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14 w-full"
                  placeholder="••••••"
                  value={authCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) { setAuthCode(val); setAuthError(false); }
                  }}
                />
                <p className="text-xs text-muted-foreground">This is a sensitive operation.</p>
              </div>
            </div>

            {/* Right Column (Keypad) */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 border-t sm:border-t-0 sm:border-l border-muted bg-muted/20 rounded-xl">
              <div className="grid grid-cols-3 gap-2 w-full max-w-[180px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="h-11 w-11 text-base font-semibold rounded-full hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary transition-all p-0 flex items-center justify-center"
                    onClick={() => {
                      if (authCode.length < 6) {
                        setAuthCode(prev => prev + num);
                        setAuthError(false);
                      }
                    }}
                  >
                    {num}
                  </Button>
                ))}
                {/* Clear */}
                <Button
                  variant="outline"
                  className="h-11 w-11 text-[11px] font-semibold rounded-full text-red-500 hover:bg-red-50 p-0 flex items-center justify-center"
                  onClick={() => {
                    setAuthCode('');
                    setAuthError(false);
                  }}
                >
                  Clear
                </Button>
                {/* 0 */}
                <Button
                  variant="outline"
                  className="h-11 w-11 text-base font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-all p-0 flex items-center justify-center"
                  onClick={() => {
                    if (authCode.length < 6) {
                      setAuthCode(prev => prev + '0');
                      setAuthError(false);
                    }
                  }}
                >
                  0
                </Button>
                {/* Delete/Backspace */}
                <Button
                  variant="outline"
                  className="h-11 w-11 text-sm font-semibold rounded-full hover:bg-muted p-0 flex items-center justify-center"
                  onClick={() => {
                    setAuthCode(prev => prev.slice(0, -1));
                    setAuthError(false);
                  }}
                >
                  ⌫
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={isEditDeviceOpen} onOpenChange={setIsEditDeviceOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              {editingDevice && (() => {
                const Icon = editingDevice.type === 'door' ? Lock : editingDevice.type === 'light' ? Lightbulb : editingDevice.type === 'appliance' ? Power : editingDevice.type === 'window' ? WindowIcon : editingDevice.type === 'camera' ? Camera : Edit3;
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              Edit {editingDevice?.name || 'Device'}
            </DialogTitle>
            <DialogDescription>Update the details of this {editingDevice?.type || 'device'}.</DialogDescription>
          </DialogHeader>
          {editingDevice && (
            <div className="grid gap-4 pt-[3px] pb-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid gap-2">
                <Label htmlFor="edit-device-name" className="flex items-center gap-2">
                  {(() => {
                    const Icon = editingDevice.type === 'door' ? Lock : editingDevice.type === 'light' ? Lightbulb : editingDevice.type === 'appliance' ? Power : editingDevice.type === 'window' ? WindowIcon : editingDevice.type === 'camera' ? Camera : Edit3;
                    return <Icon className="h-3 w-3 text-muted-foreground" />;
                  })()}
                  {(() => {
                    if (editingDevice.type === 'window') return 'Window Name';
                    const map: Record<string, string> = {
                      'appliance': 'Appliance Name',
                      'light': 'Light Name',
                      'camera': 'Camera Name',
                      'door': 'Door Name'
                    };
                    return map[editingDevice.type] || 'Device Name';
                  })()}
                </Label>
                <Input 
                  id="edit-device-name" 
                  value={editingDevice.name || ''}
                  onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                />
              </div>

              {editingDevice.type === 'camera' && (
                <div className="space-y-4 pt-2 border-t mt-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-ipAddress" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      <Globe className="h-3 w-3" />
                      IP Address
                    </Label>
                    <Input 
                      id="edit-ipAddress" 
                      placeholder="e.g. 192.168.1.100"
                      value={editingDevice.ipAddress || ''}
                      onChange={(e) => setEditingDevice({ ...editingDevice, ipAddress: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-username" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        <UserCircle className="h-3 w-3" />
                        Username
                      </Label>
                      <Input 
                        id="edit-username" 
                        placeholder="admin"
                        value={editingDevice.username || ''}
                        onChange={(e) => setEditingDevice({ ...editingDevice, username: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-password" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        <Shield className="h-3 w-3" />
                        Password
                      </Label>
                      <Input 
                        id="edit-password" 
                        type="password"
                        placeholder="••••••••"
                        value={editingDevice.password || ''}
                        onChange={(e) => setEditingDevice({ ...editingDevice, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-streamPath" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        <Video className="h-3 w-3" />
                        Stream Path
                      </Label>
                      <Input 
                        id="edit-streamPath" 
                        placeholder="/live"
                        value={editingDevice.streamPath || ''}
                        onChange={(e) => setEditingDevice({ ...editingDevice, streamPath: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-port" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        <Settings2 className="h-3 w-3" />
                        Port
                      </Label>
                      <Input 
                        id="edit-port" 
                        type="number"
                        placeholder="80"
                        value={editingDevice.port || 80}
                        onChange={(e) => setEditingDevice({ ...editingDevice, port: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingDevice.type === 'appliance' && (
                <div className="grid gap-2 text-left">
                  <Label htmlFor="edit-appliance-type" className="flex items-center gap-2">
                    <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                    Appliance Type
                  </Label>
                  <Select 
                    value={editingDevice.applianceType?.toString() || '1'} 
                    onValueChange={(v: any) => setEditingDevice({ ...editingDevice, applianceType: parseInt(v) })}
                  >
                    <SelectTrigger id="edit-appliance-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appNamesDetailList.applianceType.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editingDevice.type === 'door' && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-door-type" className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    Door Type
                  </Label>
                  <Select 
                    value={editingDevice.doorType || 'interior'} 
                    onValueChange={(v: any) => setEditingDevice({ ...editingDevice, doorType: v })}
                  >
                    <SelectTrigger id="edit-door-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interior">
                        <div className="flex items-center gap-2">
                          <HomeIcon className="h-4 w-4" />
                          <span>Interior</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="exterior">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>Exterior</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-device-room" className="flex items-center gap-2">
                  <Sofa className="h-3 w-3 text-muted-foreground" />
                  Room
                </Label>
                <Select 
                  value={editingDevice.room || 'none'} 
                  onValueChange={(v) => setEditingDevice({ ...editingDevice, room: v === 'none' ? undefined : v })}
                >
                  <SelectTrigger id="edit-device-room">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Room (Section Level)</SelectItem>
                    {rooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-device-section" className="flex items-center gap-2">
                  <Layers className="h-3 w-3 text-muted-foreground" />
                  Section
                </Label>
                <Select 
                  value={editingDevice.section || ''} 
                  onValueChange={(v) => setEditingDevice({ ...editingDevice, section: v })}
                >
                  <SelectTrigger id="edit-device-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            
            <Button onClick={handleSaveDevice} className="bg-primary text-primary-foreground">
              <CheckCheck className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Room Dialog */}
      <Dialog open={isViewRoomOpen} onOpenChange={setIsViewRoomOpen}>
        <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                if (viewingRoom) {
                  handleEditRoom(viewingRoom);
                  setIsViewRoomOpen(false);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => {
                if (viewingRoom) {
                  handleDeleteRoom(viewingRoom.id);
                  setIsViewRoomOpen(false);
                  setActiveView('facility-rooms');
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <Sofa className="h-5 w-5 text-primary" />
              View {viewingRoom?.name || 'Room'}
            </DialogTitle>
            <DialogDescription>
              Detailed view and configuration for {viewingRoom?.name}.
            </DialogDescription>
          </DialogHeader>
          {viewingRoom && (() => {
            const currentRoomDto = INITIAL_ROOMS.find(r => r.roomId === viewingRoom.id) as any;
            return (
              <div className="pt-[3px] pb-4 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Room Name</span>
                    <div className="font-medium text-lg">{viewingRoom.name}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                    <div className="font-medium">{sections.find(s => s.id === viewingRoom.section)?.name || 'N/A'}</div>
                  </div>
                  {currentRoomDto && (
                    <>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Created By</span>
                        <div className="font-medium">{currentRoomDto.createdByName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Created On</span>
                        <div className="font-medium">{currentRoomDto.createdOn ? format(new Date(currentRoomDto.createdOn), 'PPp') : 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Person Name</span>
                        <div className="font-medium">{currentRoomDto.peronName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Hidden Status</span>
                        <div className="font-medium">
                          {currentRoomDto.isHidden ? <Badge variant="secondary">Hidden</Badge> : <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Visible</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Deleted Status</span>
                        <div className="font-medium">
                          {currentRoomDto.isDeleted ? <Badge variant="destructive">Deleted</Badge> : <Badge variant="secondary">No</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified By</span>
                        <div className="font-medium">{currentRoomDto.lastModifiedByName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified On</span>
                        <div className="font-medium">{currentRoomDto.lastModifiedOn ? format(new Date(currentRoomDto.lastModifiedOn), 'PPp') : 'Never'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Token Generation Modal */}
      <Dialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border shadow-2xl p-6 bg-white" showCloseButton={false}>
          <div className="absolute right-6 top-6 z-50">
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-400 hover:text-slate-600 transition-colors" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mt-0 mx-0 pt-1 pb-3 mb-0 text-left pr-16 bg-white">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
              <Key className="h-6 w-6 text-primary" />
              Generated Token
            </DialogTitle>
            <DialogDescription className="text-xs mt-1 text-slate-500">
              Copy this token and keep it safe. It is required for external system integrations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authentication Token</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold">READY</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white dark:bg-black p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-sm break-all select-all text-primary shadow-inner">
                  {generatedToken}
                </div>
                <Button 
                  size="icon"
                  variant="outline"
                  className="shrink-0 h-12 w-12 rounded-xl bg-white hover:bg-slate-50 transition-all border-slate-100 shadow-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedToken);
                    toast.success("Token copied to clipboard!");
                  }}
                >
                  <Copy className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditRoomOpen} onOpenChange={setIsEditRoomOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Sofa className="h-5 w-5 text-primary" />
              Edit {editingRoom?.name || 'Room'}
            </DialogTitle>
            <DialogDescription>Update the details of this room.</DialogDescription>
          </DialogHeader>
          {editingRoom && (
            <ScrollArea className="max-h-[60vh] pr-2 px-1">
            <div className="grid gap-4 pt-[3px] pb-4 pr-1">
              <div className="grid gap-2">
                <Label htmlFor="edit-room-name" className="flex items-center gap-2">
                  <Edit3 className="h-3 w-3 text-muted-foreground" />
                  Room Name
                </Label>
                <Input 
                  id="edit-room-name" 
                  value={editingRoom.name || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-room-section" className="flex items-center gap-2">
                  <Layers className="h-3 w-3 text-muted-foreground" />
                  Section
                </Label>
                <Select 
                  value={editingRoom.section || ''} 
                  onValueChange={(v) => setEditingRoom({ ...editingRoom, section: v })}
                >
                  <SelectTrigger id="edit-room-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-room-icon" className="flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                  Icon
                </Label>
                <Select 
                  value={editingRoom.icon || 'Sofa'} 
                  onValueChange={(v) => setEditingRoom({ ...editingRoom, icon: v })}
                >
                  <SelectTrigger id="edit-room-icon">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sofa">Living Room (Sofa)</SelectItem>
                    <SelectItem value="Utensils">Kitchen (Utensils)</SelectItem>
                    <SelectItem value="Bed">Bedroom (Bed)</SelectItem>
                    <SelectItem value="Bath">Bathroom (Bath)</SelectItem>
                    <SelectItem value="Car">Garage (Car)</SelectItem>
                    <SelectItem value="Trees">Outdoor (Trees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-room-person" className="flex items-center gap-2">
                  <UserIcon className="h-3 w-3 text-muted-foreground" />
                  Assigned Person
                </Label>
                <Select 
                  value={editingRoom.personId?.toString() || 'none'} 
                  onValueChange={(v) => setEditingRoom({ ...editingRoom, personId: v === 'none' ? undefined : parseInt(v) })}
                >
                  <SelectTrigger id="edit-room-person">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Person Assigned</SelectItem>
                    {allUsers.map(u => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full overflow-hidden bg-muted shrink-0">
                            <img 
                              src={u.getPersonDetailsDto.imageUrl} 
                              alt={u.getPersonDetailsDto.firstName} 
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="truncate">{u.getPersonDetailsDto.firstName} {u.getPersonDetailsDto.lastName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-room-hidden" className="text-sm font-medium">Hidden Room</Label>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hide from normal views</p>
                </div>
                <Switch 
                  id="edit-room-hidden" 
                  checked={editingRoom.isHidden || false} 
                  onCheckedChange={(checked) => setEditingRoom({ ...editingRoom, isHidden: checked })} 
                />
              </div>
            </div>
            </ScrollArea>
          )}
          <DialogFooter>
            
            <Button 
              className="bg-primary text-primary-foreground"
              onClick={() => {
                if (editingRoom?.id && editingRoom.name) {
                  handleSaveRoom();
                }
              }}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewContactOpen} onOpenChange={setIsViewContactOpen}>
        <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                setIsViewContactOpen(false);
                handleEditContact(viewingContact!);
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => {
                if (viewingContact) {
                  setContactToDelete(viewingContact);
                  setIsDeleteContactOpen(true);
                  setIsViewContactOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <Contact className="h-5 w-5 text-primary" />
              View {viewingContact?.firstName || 'Contact'}
            </DialogTitle>
          </DialogHeader>
          {viewingContact && (
            <div className="flex flex-col gap-6 pt-[3px] pb-4 overflow-y-auto max-h-[70vh] pr-2">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center text-3xl font-bold border-4 border-primary/10">
                  {viewingContact.imageUrl ? (
                    <img src={viewingContact.imageUrl} alt={viewingContact.firstName} className="h-full w-full object-cover" />
                  ) : (
                    viewingContact.firstName.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{viewingContact.firstName} {viewingContact.lastName}</h3>
                  <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary hover:bg-primary/20 border-0">{viewingContact.getContactCategoryDto.name}</Badge>
                </div>
              </div>
              
              <div className="space-y-6">
                {viewingContact.contactDetails.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" /> Communication</h4>
                    <div className="grid gap-2">
                      {viewingContact.contactDetails.map((d, i) => (
                        <div key={i} className="flex flex-col p-3 rounded-xl bg-muted/30 border border-muted-foreground/5 transition-all hover:bg-muted/50">
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="flex items-center gap-2"><Mail className="h-3 w-3 text-primary/60" /> {d.email}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-2"><Smartphone className="h-3 w-3" /> {d.phoneNumber}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewingContact.address.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground"><MapPin className="h-3 w-3" /> Locations</h4>
                    <div className="grid gap-2">
                      {viewingContact.address.map((a, i) => (
                        <div key={i} className="flex flex-col p-3 rounded-xl bg-muted/30 border border-muted-foreground/5 transition-all hover:bg-muted/50">
                          <span className="text-sm font-bold">{a.numberLine} {a.street}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">{a.city}, {a.region}, {a.state}</span>
                          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mt-1">{a.postalCode} • {a.country}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
      />

      {/* Hardware Detail Modal */}
      <Dialog open={isHardwareDetailOpen} onOpenChange={setIsHardwareDetailOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto w-[90vw]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                if (selectedHardware) {
                    setHardwareForm({
                      ...selectedHardware,
                      applianceIdNames: selectedHardware.applianceIdNames || [],
                      cameraIdNames: selectedHardware.cameraIdNames || [],
                      lightIdNames: selectedHardware.lightIdNames || [],
                      windowIdNames: selectedHardware.windowIdNames || [],
                      doorIdNames: selectedHardware.doorIdNames || [],
                      externalIdNames: selectedHardware.externalIdNames || [],
                    });
                    setIsHardwareDetailOpen(false);
                    setIsEditHardwareOpen(true);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => {
                if (selectedHardware) {
                  requestAuth(() => {
                    setHardwares(prev => prev.filter(h => h.id !== selectedHardware.id));
                    setIsHardwareDetailOpen(false);
                  });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              View {selectedHardware?.hardwareName || 'Hardware'}
            </DialogTitle>
            <DialogDescription>
              Detailed telemetry and component assignment for the selected system node.
            </DialogDescription>
          </DialogHeader>

          {selectedHardware && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-[3px] pb-4">
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/40 rounded-xl space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Controller Name</span>
                    <p className="font-bold text-lg">{selectedHardware.hardwareName}</p>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-xl space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Device ID / Serial</span>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono font-bold text-sm text-primary truncate max-w-[100px]">{selectedHardware.hardwareId}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(selectedHardware.hardwareId || '')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Authentication Key</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 select-all max-w-[120px] truncate">{selectedHardware.authKey}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => navigator.clipboard.writeText(selectedHardware.authKey || '')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Network Link Status</span>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${selectedHardware.isActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></span>
                      <span className="text-xs font-semibold">{selectedHardware.isActive ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Power Status</span>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${selectedHardware.powerActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs font-semibold">{selectedHardware.powerActive ? 'POWERED OK' : 'POWER OUTAGE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Linked Devices Summary Lists */}
              <div className="space-y-4 md:border-l md:pl-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground border-b pb-1">Assigned Infrastructure Map</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">Appliances ({selectedHardware.applianceIdNames?.length || 0})</span>
                    {selectedHardware.applianceIdNames && selectedHardware.applianceIdNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedHardware.applianceIdNames.map(d => <Badge key={d.id} variant="secondary">{d.name}</Badge>)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No appliances assigned to this controller.</p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">Cameras ({selectedHardware.cameraIdNames?.length || 0})</span>
                    {selectedHardware.cameraIdNames && selectedHardware.cameraIdNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedHardware.cameraIdNames.map(d => <Badge key={d.id} variant="secondary">{d.name}</Badge>)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No cameras assigned to this controller.</p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">Lights ({selectedHardware.lightIdNames?.length || 0})</span>
                    {selectedHardware.lightIdNames && selectedHardware.lightIdNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedHardware.lightIdNames.map(d => <Badge key={d.id} variant="secondary">{d.name}</Badge>)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No lights assigned to this controller.</p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">Doors & Entry Checks ({selectedHardware.doorIdNames?.length || 0})</span>
                    {selectedHardware.doorIdNames && selectedHardware.doorIdNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedHardware.doorIdNames.map(d => <Badge key={d.id} variant="secondary">{d.name}</Badge>)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No door systems assigned.</p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">Windows ({selectedHardware.windowIdNames?.length || 0})</span>
                    {selectedHardware.windowIdNames && selectedHardware.windowIdNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedHardware.windowIdNames.map(d => <Badge key={d.id} variant="secondary">{d.name}</Badge>)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No automation windows assigned.</p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">Externals/Aux ({selectedHardware.externalIdNames?.length || 0})</span>
                    {selectedHardware.externalIdNames && selectedHardware.externalIdNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedHardware.externalIdNames.map(d => <Badge key={d.id} variant="secondary">{d.name}</Badge>)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No external units assigned.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Hardware Modal */}
      <Dialog open={isAddHardwareOpen} onOpenChange={setIsAddHardwareOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              Add New Hardware
            </DialogTitle>
            <DialogDescription>
              Deploy a new central node or smart bridging unit to link with facilities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-[3px] pb-3">
            <div className="grid gap-2">
              <Label htmlFor="add-hw-name" className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-muted-foreground" /> Hardware Name
              </Label>
              <Input 
                id="add-hw-name" 
                placeholder="e.g. Living Room Node Bridge" 
                value={hardwareForm.hardwareName || ''}
                onChange={(e) => setHardwareForm(prev => ({ ...prev, hardwareName: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            
            <Button onClick={() => {
              if (!hardwareForm.hardwareName) return;
              const newId = Math.floor(Math.random() * 9000) + 1000;
              const newHw: GetHardwareDto = {
                id: newId,
                hardwareName: hardwareForm.hardwareName,
                hardwareId: `HW-CORE-${Math.floor(Math.random() * 80) + 10}`,
                authKey: `auth_key_${Math.random().toString(16).substring(2, 14)}`,
                isActive: true,
                powerActive: true,
                applianceIdNames: [],
                cameraIdNames: [],
                lightIdNames: [],
                windowIdNames: [],
                doorIdNames: [],
                externalIdNames: []
              };
              setHardwares(prev => [...prev, newHw]);
              setIsAddHardwareOpen(false);
              addLogEntry('System Diagnostic', `Created system Controller Node: ${newHw.hardwareName}`);
            }}><PlusCircle className="mr-2 h-4 w-4" /> Add Hardware</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hardware Modal (UpdateHardwareDto wrapper) */}
      <Dialog open={isEditHardwareOpen} onOpenChange={setIsEditHardwareOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto w-[90vw]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Edit {hardwareForm?.hardwareName || 'Hardware'}
            </DialogTitle>
            <DialogDescription>
              Assign physical and virtual peripherals to this system hub.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-[3px] py-4">
            {/* Left Column: Editable Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-hw-name" className="flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-muted-foreground" /> Hardware Name
                </Label>
                <Input 
                  id="edit-hw-name" 
                  value={hardwareForm.hardwareName || ''}
                  onChange={(e) => setHardwareForm(prev => ({ ...prev, hardwareName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Settings2 className="h-3.5 w-3.5 text-muted-foreground" /> Hardware ID / Serial
                </Label>
                <div className="flex items-center gap-2 bg-muted/40 border rounded-md p-2">
                  <p className="font-mono text-sm flex-1 truncate select-all">{hardwareForm.hardwareId}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(hardwareForm.hardwareId || '')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="h-3.5 w-3.5 text-muted-foreground" /> Auth Security Key (Read-Only)
                </Label>
                <div className="flex items-center gap-2 bg-muted/40 border rounded-md p-2">
                  <p className="font-mono text-sm flex-1 truncate select-all">{hardwareForm.authKey}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(hardwareForm.authKey || '')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Toggle Facility Assignments */}
            <div className="space-y-4 md:border-l md:pl-6 flex flex-col min-h-0">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b pb-1 shrink-0">Toggle Facility Assignments</h3>

              <ScrollArea className="flex-1 -mr-4 pr-4 max-h-[50vh]">
                <div className="space-y-4 pb-4">
                  {/* Appliances Selection */}
                  <div className="space-y-2 bg-muted/20 p-3 rounded-lg">
                <span className="text-xs font-bold text-muted-foreground block">Select Connected Appliances</span>
                <div className="flex flex-wrap gap-2">
                  {appliances.map(dev => {
                    const isSelected = hardwareForm.applianceIdNames?.some(x => x.id === dev.id);
                    return (
                      <Badge 
                        key={`app-${dev.id}`} 
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-85"
                        onClick={() => {
                          const currentList = hardwareForm.applianceIdNames || [];
                          if (isSelected) {
                            setHardwareForm(prev => ({ ...prev, applianceIdNames: currentList.filter(x => x.id !== dev.id) }));
                          } else {
                            setHardwareForm(prev => ({ ...prev, applianceIdNames: [...currentList, { id: dev.id, name: dev.applianceName }] }));
                          }
                        }}
                      >
                        {dev.applianceName} {isSelected && '✓'}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Cameras Selection */}
              <div className="space-y-2 bg-muted/20 p-3 rounded-lg">
                <span className="text-xs font-bold text-muted-foreground block">Select Assigned Security Cameras</span>
                <div className="flex flex-wrap gap-2">
                  {cameras.map(dev => {
                    const isSelected = hardwareForm.cameraIdNames?.some(x => x.id === dev.id);
                    return (
                      <Badge 
                        key={`cam-${dev.id}`} 
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-85"
                        onClick={() => {
                          const currentList = hardwareForm.cameraIdNames || [];
                          if (isSelected) {
                            setHardwareForm(prev => ({ ...prev, cameraIdNames: currentList.filter(x => x.id !== dev.id) }));
                          } else {
                            setHardwareForm(prev => ({ ...prev, cameraIdNames: [...currentList, { id: dev.id, name: dev.cameraName }] }));
                          }
                        }}
                      >
                        {dev.cameraName} {isSelected && '✓'}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Lights Selection */}
              <div className="space-y-2 bg-muted/20 p-3 rounded-lg">
                <span className="text-xs font-bold text-muted-foreground block">Select Controlled Lighting</span>
                <div className="flex flex-wrap gap-2">
                  {lights.map(dev => {
                    const isSelected = hardwareForm.lightIdNames?.some(x => x.id === dev.id);
                    return (
                      <Badge 
                        key={`light-${dev.id}`} 
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-85"
                        onClick={() => {
                          const currentList = hardwareForm.lightIdNames || [];
                          if (isSelected) {
                            setHardwareForm(prev => ({ ...prev, lightIdNames: currentList.filter(x => x.id !== dev.id) }));
                          } else {
                            setHardwareForm(prev => ({ ...prev, lightIdNames: [...currentList, { id: dev.id, name: dev.lightName }] }));
                          }
                        }}
                      >
                        {dev.lightName} {isSelected && '✓'}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Window Selection */}
              <div className="space-y-2 bg-muted/20 p-3 rounded-lg">
                <span className="text-xs font-bold text-muted-foreground block">Select Automated Windows</span>
                <div className="flex flex-wrap gap-2">
                  {windows.map(dev => {
                    const isSelected = hardwareForm.windowIdNames?.some(x => x.id === dev.id);
                    return (
                      <Badge 
                        key={`win-${dev.id}`} 
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-85"
                        onClick={() => {
                          const currentList = hardwareForm.windowIdNames || [];
                          if (isSelected) {
                            setHardwareForm(prev => ({ ...prev, windowIdNames: currentList.filter(x => x.id !== dev.id) }));
                          } else {
                            setHardwareForm(prev => ({ ...prev, windowIdNames: [...currentList, { id: dev.id, name: dev.windowName }] }));
                          }
                        }}
                      >
                        {dev.windowName} {isSelected && '✓'}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Door Selection */}
              <div className="space-y-2 bg-muted/20 p-3 rounded-lg">
                <span className="text-xs font-bold text-muted-foreground block">Select Automated Doors</span>
                <div className="flex flex-wrap gap-2">
                  {doors.map(dev => {
                    const isSelected = hardwareForm.doorIdNames?.some(x => x.id === dev.id);
                    return (
                      <Badge 
                        key={`door-${dev.id}`} 
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-85"
                        onClick={() => {
                          const currentList = hardwareForm.doorIdNames || [];
                          if (isSelected) {
                            setHardwareForm(prev => ({ ...prev, doorIdNames: currentList.filter(x => x.id !== dev.id) }));
                          } else {
                            setHardwareForm(prev => ({ ...prev, doorIdNames: [...currentList, { id: dev.id, name: dev.doorName }] }));
                          }
                        }}
                      >
                        {dev.doorName} {isSelected && '✓'}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Externals Selection */}
              <div className="space-y-2 bg-muted/20 p-3 rounded-lg">
                <span className="text-xs font-bold text-muted-foreground block">Select Peripheral Auxiliaries</span>
                <div className="flex flex-wrap gap-2">
                  {externals.map(ext => {
                    const isSelected = hardwareForm.externalIdNames?.some(x => x.id === ext.id);
                    return (
                      <Badge 
                        key={`ext-${ext.id}`} 
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-85"
                        onClick={() => {
                          const currentList = hardwareForm.externalIdNames || [];
                          if (isSelected) {
                            setHardwareForm(prev => ({ ...prev, externalIdNames: currentList.filter(x => x.id !== ext.id) }));
                          } else {
                            setHardwareForm(prev => ({ ...prev, externalIdNames: [...currentList, { id: ext.id, name: ext.externalName }] }));
                          }
                        }}
                      >
                        {ext.externalName} {isSelected && '✓'}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
            
            <Button onClick={() => {
              if (!hardwareForm.id) return;
              
              requestAuth(() => {
                // Pack as UpdateHardwareDto
                const updateDto: UpdateHardwareDto = {
                  id: hardwareForm.id as number,
                  hardwareName: hardwareForm.hardwareName || '',
                  authKey: hardwareForm.authKey || '',
                  lightIds: (hardwareForm.lightIdNames || []).map(x => x.id),
                  applianceIds: (hardwareForm.applianceIdNames || []).map(x => x.id),
                  cameraIds: (hardwareForm.cameraIdNames || []).map(x => x.id),
                  windowIds: (hardwareForm.windowIdNames || []).map(x => x.id),
                  doorIds: (hardwareForm.doorIdNames || []).map(x => x.id),
                  externalIds: (hardwareForm.externalIdNames || []).map(x => x.id)
                };

                setHardwares(prev => prev.map(item => item.id === updateDto.id ? {
                  ...item,
                  hardwareName: updateDto.hardwareName,
                  authKey: updateDto.authKey,
                  lightIdNames: hardwareForm.lightIdNames || [],
                  applianceIdNames: hardwareForm.applianceIdNames || [],
                  cameraIdNames: hardwareForm.cameraIdNames || [],
                  windowIdNames: hardwareForm.windowIdNames || [],
                  doorIdNames: hardwareForm.doorIdNames || [],
                  externalIdNames: hardwareForm.externalIdNames || [],
                } : item));

                setIsEditHardwareOpen(false);
                addLogEntry('System Diagnostic', `Updated hardware infrastructure map for: ${updateDto.hardwareName}`);
              });
            }} className="bg-primary text-primary-foreground">
              <CheckCheck className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Add External Device Modal */}
      <Dialog open={isAddExternalOpen} onOpenChange={setIsAddExternalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-6 w-6 text-primary" />
              Add External System
            </DialogTitle>
            <DialogDescription>
              Deploy a new peripheral automation unit to track custom safety events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-[3px] pb-3">
            <div className="grid gap-2">
              <Label htmlFor="ext-name" className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-muted-foreground" /> External Device Name
              </Label>
              <Input 
                id="ext-name" 
                placeholder="e.g. Laser Gate Switch" 
                value={externalForm.externalName || ''}
                onChange={(e) => setExternalForm(prev => ({ ...prev, externalName: e.target.value }))}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ext-section" className="flex items-center gap-2">
                  <WindowIcon className="h-3.5 w-3.5 text-muted-foreground" /> Section
                </Label>
                <Select 
                  value={externalForm.sectionId?.toString() || 'none'} 
                  onValueChange={(val) => setExternalForm(prev => ({ ...prev, sectionId: val === 'none' ? undefined : parseInt(val) }))}
                >
                  <SelectTrigger id="ext-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Section</SelectItem>
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id.toString()}>{section.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ext-room" className="flex items-center gap-2">
                  <HomeIcon className="h-3.5 w-3.5 text-muted-foreground" /> Room
                </Label>
                <Select 
                  value={externalForm.roomId?.toString() || 'none'} 
                  onValueChange={(val) => setExternalForm(prev => ({ ...prev, roomId: val === 'none' ? undefined : parseInt(val) }))}
                >
                  <SelectTrigger id="ext-room">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Room</SelectItem>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id.toString()}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" /> Link to Trigger Actions
              </Label>
              <div className="flex flex-wrap gap-2">
                {actions.map((s) => {
                  const aid = s.id;
                  const isSelected = externalForm.actionIds?.includes(aid);
                  return (
                    <Badge 
                      key={`add-ext-act-${s.id}`}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const ids = externalForm.actionIds || [];
                        if (isSelected) {
                          setExternalForm(prev => ({ ...prev, actionIds: ids.filter(id => id !== aid) }));
                        } else {
                          setExternalForm(prev => ({ ...prev, actionIds: [...ids, aid] }));
                        }
                      }}
                    >
                      {s.actionName}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={() => {
                if (!externalForm.externalName) return;
                const newExt: GetExternalDto = {
                  id: Math.floor(Math.random() * 9000) + 1000,
                  externalName: externalForm.externalName,
                  externalId: `EXT-DEV-${Math.floor(Math.random() * 80) + 10}`,
                  isTriggered: false,
                  isActive: true,
                  actionIds: externalForm.actionIds || [],
                  roomId: externalForm.roomId,
                  sectionId: externalForm.sectionId,
                  createdBy: 1,
                  createdByName: userProfile.getPersonDetailsDto.firstName,
                  createdOn: new Date().toISOString(),
                  lastModifiedBy: 1,
                  lastModifiedByName: userProfile.getPersonDetailsDto.firstName,
                  lastModifiedOn: new Date().toISOString(),
                  isDeleted: false,
                  personId: 1,
                  peronName: userProfile.getPersonDetailsDto.firstName,
                  deletedBy: 0
                };
                setExternals(prev => [...prev, newExt]);
                setIsAddExternalOpen(false);
                addLogEntry('Window Control', `Added Boundary Device: ${newExt.externalName}`);
                setExternalForm({});
              }}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add External Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      
      {/* View External Modal */}
      <Dialog open={isViewExternalOpen} onOpenChange={setIsViewExternalOpen}>
        <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                if (selectedExternal) {
                  setExternalForm(selectedExternal);
                  setIsViewExternalOpen(false);
                  setIsEditExternalOpen(true);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => requestAuth(() => {
                setExternals(prev => prev.filter(e => e.id !== selectedExternal?.id));
                setIsViewExternalOpen(false);
                addLogEntry('Hardware Security', `Removed external device: ${selectedExternal?.externalName}`);
              })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              View {selectedExternal?.externalName || 'External'}
            </DialogTitle>
            <DialogDescription>
              Detailed view and security controls for {selectedExternal?.externalName}.
            </DialogDescription>
          </DialogHeader>
          {selectedExternal && (
            <div className="pt-[3px] pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Triggered Status</span>
                  <div className="flex items-center gap-2 font-medium">
                    {selectedExternal.isTriggered ? (
                      <Badge variant="destructive" className="animate-pulse">Triggered</Badge>
                    ) : (
                      <Badge variant="secondary">Standby</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">External ID</span>
                  <div className="font-medium font-mono uppercase">{selectedExternal.externalId}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Active Profile</span>
                  <div className="font-medium">
                    {selectedExternal.isActive ? <Badge variant="default" className="bg-emerald-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                  <div className="font-medium">{appNamesDetailList.sectionIds.find(s => s.id === selectedExternal.sectionId)?.name || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Room Name</span>
                  <div className="font-medium">{appNamesDetailList.roomIds.find(r => r.id === selectedExternal.roomId)?.name || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Created By</span>
                  <div className="font-medium">{selectedExternal.createdByName || 'System'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Created On</span>
                  <div className="font-medium">{selectedExternal.createdOn ? format(new Date(selectedExternal.createdOn), 'PPp') : 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified By</span>
                  <div className="font-medium">{selectedExternal.lastModifiedByName || 'System'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified On</span>
                  <div className="font-medium">{selectedExternal.lastModifiedOn ? format(new Date(selectedExternal.lastModifiedOn), 'PPp') : 'Never'}</div>
                </div>
                <div className="space-y-1 col-span-2">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Linked Triggers</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedExternal.actionIds && selectedExternal.actionIds.length > 0 ? (
                      selectedExternal.actionIds.map(aid => {
                        const action = actions.find(a => a.id === aid);
                        return (
                          <Badge key={aid} variant="outline" className="bg-primary/5 text-primary border-primary/10">
                            {action?.actionName || `Action #${aid}`}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground font-medium">No actions linked</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit External Device Modal */}
      <Dialog open={isEditExternalOpen} onOpenChange={setIsEditExternalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="mb-0">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-6 w-6 text-primary" />
              Edit {externalForm?.externalName || 'External'}
            </DialogTitle>
            <DialogDescription>
              Modify name pattern and linked trigger actions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-ext-name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <Radio className="h-3 w-3" /> External Device Name
              </Label>
              <Input 
                id="edit-ext-name" 
                value={externalForm.externalName || ''}
                onChange={(e) => setExternalForm(prev => ({ ...prev, externalName: e.target.value }))}
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Power className="h-3.5 w-3.5 text-muted-foreground" /> Device Active State
                </Label>
                <p className="text-[10px] text-muted-foreground font-medium">Enable or disable this external interface</p>
              </div>
              <Switch 
                checked={externalForm.isActive} 
                onCheckedChange={(checked) => setExternalForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-ext-section" className="flex items-center gap-2">
                  <WindowIcon className="h-3.5 w-3.5 text-muted-foreground" /> Section Name
                </Label>
                <Select 
                  value={externalForm.section || 'none'} 
                  onValueChange={(val) => setExternalForm(prev => ({ ...prev, section: val === 'none' ? undefined : val }))}
                >
                  <SelectTrigger id="edit-ext-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Section</SelectItem>
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-ext-room" className="flex items-center gap-2">
                  <HomeIcon className="h-3.5 w-3.5 text-muted-foreground" /> Room Name
                </Label>
                <Select 
                  value={externalForm.room || 'none'} 
                  onValueChange={(val) => setExternalForm(prev => ({ ...prev, room: val === 'none' ? undefined : val }))}
                >
                  <SelectTrigger id="edit-ext-room">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Room</SelectItem>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" /> Action Command Triggers
              </Label>
              <div className="flex flex-wrap gap-2">
                {actions.map((s) => {
                  const aid = s.id;
                  const isSelected = externalForm.actionIds?.includes(aid);
                  return (
                    <Badge 
                      key={`edit-ext-act-${s.id}`}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const ids = externalForm.actionIds || [];
                        if (isSelected) {
                          setExternalForm(prev => ({ ...prev, actionIds: ids.filter(id => id !== aid) }));
                        } else {
                          setExternalForm(prev => ({ ...prev, actionIds: [...ids, aid] }));
                        }
                      }}
                    >
                      {s.actionName}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              if (!externalForm.id || !externalForm.externalsName) return;
              requestAuth(() => {
                setExternals(prev => prev.map(item => item.id === externalForm.id ? {
                  ...item,
                  externalsName: externalForm.externalsName || '',
                  actionIds: externalForm.actionIds || [],
                  room: externalForm.room,
                  section: externalForm.section
                } : item));
                setIsEditExternalOpen(false);
              });
            }} className="bg-primary text-primary-foreground">
              <CheckCheck className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Camera Feed Modal */}
      <Dialog open={isCameraModalOpen} onOpenChange={(open) => {
        setIsCameraModalOpen(open);
        if (!open) {
          setCameraPlaybackOffset(0);
          setPlayingRecordingPath(null);
        }
      }}>
        <DialogContent showCloseButton={false} className="max-w-6xl w-[92vw] sm:max-w-[92vw] md:max-w-6xl h-[85vh] p-0 overflow-hidden rounded-3xl border shadow-2xl bg-background text-foreground">
          {(() => {
            const currentCameraDto = cameras.find(c => c.id.toString() === selectedCamera?.id.toString() || c.cameraName === selectedCamera?.name);
            const liveStreamUrl = currentCameraDto?.liveStreamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
            const isLive = !playingRecordingPath;
            const currentVideoUrl = playingRecordingPath || liveStreamUrl;
            const recordingsList = currentCameraDto?.recordings || [];
            
            return (
              <div className="flex flex-col h-full bg-background relative overflow-hidden">
                {/* Header Section */}
                <div className="flex items-center justify-between p-5 border-b bg-muted/30 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        View {selectedCamera?.name || currentCameraDto?.cameraName || 'Camera'}
                        <Badge variant="secondary" className={cn(
                          "ml-2 text-[10px] py-0 px-2 font-mono uppercase tracking-wider border",
                          selectedCamera?.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        )}>
                          {selectedCamera?.status || 'Active'}
                        </Badge>
                      </h2>
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {currentCameraDto?.cameraId || `CAM-${selectedCamera?.id}`} • 1080p Streamed • {selectedCamera?.room ? rooms.find(r => r.id === selectedCamera.room)?.name : 'Main Hub'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 z-50">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => {
                        if (selectedCamera) {
                          handleEditDevice(selectedCamera.id);
                          setIsCameraModalOpen(false);
                        }
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      onClick={() => {
                        if (selectedCamera) {
                          handleDeleteDevice(selectedCamera.id);
                          setIsCameraModalOpen(false);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      onClick={() => setIsCameraModalOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Main Body Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0 bg-background">
                  {/* Left Column: Live/Playback video screen & info panel */}
                  <div className="lg:col-span-7 flex flex-col p-6 gap-6 overflow-y-auto border-r h-full">
                    {/* Video Stream Container */}
                    <div ref={videoContainerRef} className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border shadow-2xl group flex flex-col justify-center shrink-0">
                      {/* Video source overlay status */}
                      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          isLive ? "bg-red-500 animate-pulse" : "bg-cyan-400"
                        )} />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                          {isLive ? 'LIVE HD FEED' : 'PLAYBACK: RECORDING'}
                        </span>
                      </div>

                      {/* Video Player */}
                      {selectedCamera?.status === 'active' ? (
                        <video
                          ref={videoRef}
                          key={currentVideoUrl}
                          src={currentVideoUrl}
                          className={cn(
                            "h-full w-full object-cover select-none bg-black",
                            isFullscreen ? "h-screen w-screen object-contain" : ""
                          )}
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-black/90 p-12 text-center h-full">
                          <VideoOff className="h-16 w-16 text-muted-foreground/30 mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">Camera Inactive</h3>
                          <p className="text-muted-foreground text-sm max-w-xs">
                            Please toggle active status to view live feed
                          </p>
                        </div>
                      )}

                      {/* Overlap UI controls */}
                      <div className="absolute bottom-4 left-4 right-4 z-30 flex justify-between items-center bg-black/60 p-3 rounded-xl border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xs font-mono text-white/90">
                          {isLive ? 'Live RTSP Direct Stream' : 'Archive Backup Playback'}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-white hover:bg-white/10 h-8 w-8 p-0 rounded-lg transition-all active:scale-95"
                            onClick={toggleCameraFullscreen}
                            title="Fullscreen"
                          >
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                          </Button>
                          
                          {!isLive && (
                            <Button 
                              size="sm" 
                              variant="default"
                              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-1 px-3 h-8 text-[11px] rounded-lg tracking-wider font-mono shadow-lg transition-all active:scale-95"
                              onClick={() => setPlayingRecordingPath(null)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Return to Live
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Camera Info Detail Grid */}
                    <div className="bg-muted/30 p-5 rounded-2xl border space-y-4 shrink-0">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-bold text-foreground tracking-widest uppercase font-mono">Stream Configuration</h3>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 text-[10px]">CCTV CONNECTION</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-muted-foreground block font-mono uppercase text-[9px] tracking-wider">IP Address</span>
                          <span className="font-semibold text-foreground font-mono">192.168.1.{10 + (currentCameraDto?.id || 10) % 240}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block font-mono uppercase text-[9px] tracking-wider">Port Node</span>
                          <span className="font-semibold text-foreground font-mono">554 (RTSP)</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block font-mono uppercase text-[9px] tracking-wider">Username</span>
                          <span className="font-semibold text-foreground font-mono">sec_operator</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block font-mono uppercase text-[9px] tracking-wider">Stream Path</span>
                          <span className="font-semibold text-foreground font-mono text-ellipsis overflow-hidden block">/live/h264/ch1</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t">
                        <div className="space-y-1">
                          <span className="text-muted-foreground block font-mono uppercase text-[9px] tracking-wider">Room Name</span>
                          <span className="font-semibold text-foreground">
                            {selectedCamera?.room ? rooms.find(r => r.id === selectedCamera.room)?.name : 'Unassigned Room'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block font-mono uppercase text-[9px] tracking-wider">Section Name</span>
                          <span className="font-semibold text-foreground">
                            {selectedCamera?.section ? sections.find(s => s.id === selectedCamera.section)?.name : 'Security'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Operations: Move the Edit and Delete icons into the view modal */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Active Profile</span>
                          <div className="font-medium">
                            {currentCameraDto?.isActive ? <Badge variant="default" className="bg-emerald-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Power Active</span>
                          <div className="font-medium">
                            {currentCameraDto?.powerActive ? <Badge variant="default" className="bg-amber-500">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                          <div className="font-medium">{appNamesDetailList.sectionIds.find(s => s.id === currentCameraDto?.sectionId)?.name || 'N/A'}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Room Name</span>
                          <div className="font-medium">{appNamesDetailList.roomIds.find(r => r.id === currentCameraDto?.roomId)?.name || 'N/A'}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Person Name</span>
                          <div className="font-medium">{currentCameraDto?.peronName || 'System'}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Deleted Status</span>
                          <div className="font-medium">
                            {currentCameraDto?.isDeleted ? 'Deleted' : 'No'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Created By</span>
                          <div className="font-medium">{currentCameraDto?.createdByName || 'System'}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Created On</span>
                          <div className="font-medium">{currentCameraDto?.createdOn ? format(new Date(currentCameraDto.createdOn), 'PPp') : 'N/A'}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified By</span>
                          <div className="font-medium">{currentCameraDto?.lastModifiedByName || 'System'}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified</span>
                          <div className="font-medium">{currentCameraDto?.lastModifiedOn ? format(new Date(currentCameraDto.lastModifiedOn), 'PPp') : 'Never'}</div>
                        </div>
                      </div>
                  </div>

                  {/* Right Column: List of recordings in table format */}
                  <div className="lg:col-span-5 flex flex-col p-6 h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-sm font-bold text-foreground tracking-wider uppercase font-mono flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        History recordings
                      </h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-mono">
                        {recordingsList.length} Saved
                      </Badge>
                    </div>

                    {/* Scrollable Table View */}
                    <div className="flex-1 overflow-y-auto pr-1">
                      {recordingsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed text-center p-6">
                          <EyeOff className="h-8 w-8 text-muted-foreground/40 mb-2 animate-bounce" />
                          <p className="text-xs text-muted-foreground">No recent security backup files located for this camera.</p>
                        </div>
                      ) : (
                        <div className="border rounded-xl overflow-hidden bg-muted/10">
                          <table className="w-full text-xs text-left">
                            <thead className="text-[10px] bg-muted/20 text-muted-foreground uppercase tracking-wider border-b font-mono">
                              <tr>
                                <th className="p-3">Interval / Time Frame</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y font-mono">
                              {recordingsList.map((recording, idx) => {
                                const isCurrentlyPlayingThis = playingRecordingPath === recording.filePath;
                                return (
                                  <tr key={idx} className={cn(
                                    "transition-colors hover:bg-muted/50",
                                    isCurrentlyPlayingThis ? "bg-primary/10 text-primary" : ""
                                  )}>
                                    <td className="p-3">
                                      <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-foreground">
                                          {format(new Date(recording.startTime), "MMM dd, HH:mm:ss")}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                          to {format(new Date(recording.endTime), "HH:mm:ss")}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={cn(
                                            "h-7 w-7 rounded-lg",
                                            isCurrentlyPlayingThis ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                          )}
                                          onClick={() => setPlayingRecordingPath(recording.filePath)}
                                          title="Play Recording Video"
                                        >
                                          <Play className="h-3 w-3" />
                                        </Button>
                                        
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                                          onClick={() => {
                                            alert(`Initiating secure direct server download for ${recording.filePath.split('/').pop() || 'backup.mp4'}`);
                                            addLogEntry("Camera Access", `Initiated download of backup recording clip for camera: ${currentCameraDto?.cameraName || selectedCamera?.name}`);
                                          }}
                                          title="Download Backup Clip"
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
                                        
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                          onClick={() => {
                                            // Handle record deletion
                                            setCameras(prev => prev.map(c => {
                                              if (c.id.toString() === selectedCamera?.id.toString()) {
                                                return {
                                                  ...c,
                                                  recordings: c.recordings.filter(r => r.filePath !== recording.filePath)
                                                };
                                              }
                                              return c;
                                            }));
                                            if (isCurrentlyPlayingThis) setPlayingRecordingPath(null);
                                            addLogEntry("Camera Access", `Secured permanent deletion of backup clip starting at ${format(new Date(recording.startTime), "HH:mm:ss")} from ${currentCameraDto?.cameraName || selectedCamera?.name}`);
                                          }}
                                          title="Delete Backup Clip"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      {/* Appliance View Modal */}
      <Dialog open={isApplianceModalOpen} onOpenChange={setIsApplianceModalOpen}>
        <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                if (selectedAppliance) {
                  handleEditDevice(selectedAppliance.id);
                  setIsApplianceModalOpen(false);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => {
                if (selectedAppliance) {
                  handleDeleteDevice(selectedAppliance.id);
                  setIsApplianceModalOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-primary" />
              View {selectedAppliance?.name || 'Appliance'}
            </DialogTitle>
            <DialogDescription>
              Detailed view and configuration for {selectedAppliance?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedAppliance && (() => {
            const currentApplianceDto = INITIAL_APPLIANCES.find(a => a.id.toString() === selectedAppliance.id.toString() || a.applianceName === selectedAppliance.name) as any;
            return (
            <div className="pt-[3px] pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Status</span>
                  <div className="flex items-center gap-2 font-medium">
                    <div className={cn("h-2 w-2 rounded-full", selectedAppliance.status === 'on' ? 'bg-emerald-500' : 'bg-zinc-400')} />
                    {selectedAppliance.status === 'on' ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Location</span>
                  <div className="font-medium">{selectedAppliance.room ? rooms.find(r => r.id === selectedAppliance.room)?.name : 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Power Usage</span>
                  <div className="font-medium text-emerald-600 dark:text-emerald-400">{selectedAppliance.powerUsage || 0} W</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Device Type</span>
                  <div className="font-medium capitalize">{selectedAppliance.type}</div>
                </div>
                {currentApplianceDto && (
                  <>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Active Profile</span>
                      <div className="font-medium">
                        {currentApplianceDto.isActive ? <Badge variant="default" className="bg-emerald-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Power Active</span>
                      <div className="font-medium">
                        {currentApplianceDto.powerActive ? <Badge variant="default" className="bg-amber-500">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                      <div className="font-medium">{appNamesDetailList.sectionIds.find(s => s.id === currentApplianceDto.sectionId)?.name || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Room Name</span>
                      <div className="font-medium">{appNamesDetailList.roomIds.find(r => r.id === currentApplianceDto.roomId)?.name || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Person Name</span>
                      <div className="font-medium">{currentApplianceDto.peronName || 'System'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Deleted Status</span>
                      <div className="font-medium">
                        {currentApplianceDto.isDeleted ? 'Deleted' : 'No'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Created By</span>
                      <div className="font-medium">{currentApplianceDto.createdByName || 'System'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Created On</span>
                      <div className="font-medium">{currentApplianceDto.createdOn ? format(new Date(currentApplianceDto.createdOn), 'PPp') : 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified By</span>
                      <div className="font-medium">{currentApplianceDto.lastModifiedByName || 'System'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified</span>
                      <div className="font-medium">{currentApplianceDto.lastModifiedOn ? format(new Date(currentApplianceDto.lastModifiedOn), 'PPp') : 'Never'}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
          })()}
        </DialogContent>
      </Dialog>

      {/* Door View Modal */}
      <Dialog open={isDoorModalOpen} onOpenChange={setIsDoorModalOpen}>
        <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                if (selectedDoor) {
                  handleEditDevice(selectedDoor.id);
                  setIsDoorModalOpen(false);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => {
                if (selectedDoor) {
                  handleDeleteDevice(selectedDoor.id);
                  setIsDoorModalOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              View {selectedDoor?.name || 'Door'}
            </DialogTitle>
            <DialogDescription>
              Detailed view and security controls for {selectedDoor?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedDoor && (() => {
            const currentDoorDto = INITIAL_DOORS.find(d => d.id.toString() === selectedDoor.id.toString() || d.doorName === selectedDoor.name) as any;
            return (
            <div className="pt-[3px] pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Lock Status</span>
                  <div className="flex items-center gap-2 font-medium">
                    {selectedDoor.status === 'locked' ? (
                      <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Locked</Badge>
                    ) : (
                      <Badge variant="destructive">Unlocked</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Type</span>
                  <div className="font-medium capitalize">{selectedDoor.doorType || 'Interior'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Location</span>
                  <div className="font-medium">{selectedDoor.room ? rooms.find(r => r.id === selectedDoor.room)?.name : 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                  <div className="font-medium">{selectedDoor.section ? sections.find(s => s.id === selectedDoor.section)?.name : 'N/A'}</div>
                </div>
                {currentDoorDto && (
                  <>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Active Profile</span>
                      <div className="font-medium">
                        {currentDoorDto.isActive ? <Badge variant="default" className="bg-emerald-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Power Active</span>
                      <div className="font-medium">
                        {currentDoorDto.powerActive ? <Badge variant="default" className="bg-amber-500">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Person Name</span>
                      <div className="font-medium">{currentDoorDto.peronName || 'System'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Room Name</span>
                      <div className="font-medium text-[10px]">{currentDoorDto.roomName || appNamesDetailList.roomIds.find(r => r.id === currentDoorDto.roomId)?.name || 'Hub'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                      <div className="font-medium text-[10px]">{currentDoorDto.sectionName || appNamesDetailList.sectionIds.find(s => s.id === currentDoorDto.sectionId)?.name || 'Area'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Deletion Status</span>
                      <div className="font-medium">
                        {currentDoorDto.isDeleted ? <span className="text-red-500">Deleted (by: {currentDoorDto.deletedBy})</span> : 'Active'}
                        {currentDoorDto.deletedOn && <div className="text-[10px]">{format(new Date(currentDoorDto.deletedOn), 'PPp')}</div>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Created By</span>
                      <div className="font-medium">{currentDoorDto.createdByName || 'System'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Created On</span>
                      <div className="font-medium">{currentDoorDto.createdOn ? format(new Date(currentDoorDto.createdOn), 'PPp') : 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified By</span>
                      <div className="font-medium">{currentDoorDto.lastModifiedByName || 'System'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified</span>
                      <div className="font-medium">{currentDoorDto.lastModifiedOn ? format(new Date(currentDoorDto.lastModifiedOn), 'PPp') : 'Never'}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
          })()}
        </DialogContent>
      </Dialog>
      {/* Light View Modal */}
      <Dialog open={isLightModalOpen} onOpenChange={setIsLightModalOpen}>
        <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                if (selectedLight) {
                  handleEditDevice(selectedLight.id);
                  setIsLightModalOpen(false);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => {
                if (selectedLight) {
                  handleDeleteDevice(selectedLight.id);
                  setIsLightModalOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              View {selectedLight?.name || 'Light'}
            </DialogTitle>
            <DialogDescription>
              Detailed view and configuration for {selectedLight?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedLight && (() => {
            const currentLightDto = lights.find(l => l.lightName === selectedLight?.name || l.id.toString() === selectedLight?.id.toString());
            return (
              <div className="pt-[3px] pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Status</span>
                    <div className="flex items-center gap-2 font-medium">
                      <div className={cn("h-2 w-2 rounded-full", selectedLight.status === 'on' ? 'bg-amber-400' : 'bg-zinc-400')} />
                      {selectedLight.status === 'on' ? 'On' : 'Off'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Brightness</span>
                    <div className="font-medium">{selectedLight.value || currentLightDto?.brightnessLevel || 0}%</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Location</span>
                    <div className="font-medium">{selectedLight.room ? rooms.find(r => r.id === selectedLight.room)?.name : 'N/A'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                    <div className="font-medium">{selectedLight.section ? sections.find(s => s.id === selectedLight.section)?.name : 'N/A'}</div>
                  </div>
                  {/* BaseDefaultDto Integration */}
                  {currentLightDto && (
                    <>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Active Profile</span>
                        <div className="font-medium">
                          {currentLightDto.isActive ? <Badge variant="default" className="bg-emerald-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Power Active</span>
                        <div className="font-medium">
                          {currentLightDto.powerActive ? <Badge variant="default" className="bg-amber-500">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                        <div className="font-medium">{appNamesDetailList.sectionIds.find(s => s.id === currentLightDto.sectionId)?.name || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Room Name</span>
                        <div className="font-medium">{appNamesDetailList.roomIds.find(r => r.id === currentLightDto.roomId)?.name || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Person Name</span>
                        <div className="font-medium">{currentLightDto.peronName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Deleted Status</span>
                        <div className="font-medium">
                          {currentLightDto.isDeleted ? 'Deleted' : 'No'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Created By</span>
                        <div className="font-medium">{currentLightDto.createdByName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Created On</span>
                        <div className="font-medium">{currentLightDto.createdOn ? format(new Date(currentLightDto.createdOn), 'PPp') : 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified By</span>
                        <div className="font-medium">{currentLightDto.lastModifiedByName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified</span>
                        <div className="font-medium">{currentLightDto.lastModifiedOn ? format(new Date(currentLightDto.lastModifiedOn), 'PPp') : 'Never'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      {/* Section View Modal */}
      <Dialog open={isViewSectionOpen} onOpenChange={setIsViewSectionOpen}>
        <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                if (viewingSection) {
                  setEditingSection(viewingSection);
                  setIsEditSectionOpen(true);
                  setIsViewSectionOpen(false);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => {
                if (viewingSection) {
                  requestAuth(() => setSections(prev => prev.filter(s => s.id !== viewingSection.id)));
                  setIsViewSectionOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              View {viewingSection?.name || 'Section'}
            </DialogTitle>
            <DialogDescription>
              Detailed view and configuration for {viewingSection?.name}.
            </DialogDescription>
          </DialogHeader>
          {viewingSection && (() => {
            const currentSectionDto = INITIAL_SECTIONS.find(s => s.id.toString() === viewingSection.id.toString() || s.sectionId === viewingSection.id) as any;
            return (
              <div className="pt-[3px] pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                    <div className="font-medium text-lg">{currentSectionDto?.sectionName || viewingSection.name}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Name</span>
                    <div className="font-medium text-lg">{viewingSection.name}</div>
                  </div>
                  {currentSectionDto && (
                    <>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Hidden Status</span>
                        <div className="font-medium text-sm">
                          {currentSectionDto.isHidden ? <Badge variant="secondary">Hidden</Badge> : <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Visible</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Deleted Status</span>
                        <div className="font-medium text-sm">
                          {currentSectionDto.isDeleted ? <Badge variant="destructive">Deleted</Badge> : <Badge variant="secondary">Active</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Person Name</span>
                        <div className="font-medium text-sm">{currentSectionDto.peronName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Created By</span>
                        <div className="font-medium text-sm">{currentSectionDto.createdByName || 'System'}</div>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Created On</span>
                        <div className="font-medium text-sm">{currentSectionDto.createdOn ? format(new Date(currentSectionDto.createdOn), 'PPp') : 'N/A'}</div>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified</span>
                        <div className="font-medium text-sm">{currentSectionDto.lastModifiedOn ? format(new Date(currentSectionDto.lastModifiedOn), 'PPp') : 'Never'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Window View Modal */}
      <Dialog open={isViewWindowOpen} onOpenChange={setIsViewWindowOpen}>
        <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
          <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => {
                if (selectedWindow) {
                  handleEditDevice(selectedWindow.id);
                  setIsViewWindowOpen(false);
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => {
                if (selectedWindow) {
                  handleDeleteDevice(selectedWindow.id);
                  setIsViewWindowOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogHeader className="mb-0 pr-24">
            <DialogTitle className="flex items-center gap-2">
              <WindowIcon className="h-5 w-5 text-primary" />
              View {selectedWindow?.name || 'Window'}
            </DialogTitle>
            <DialogDescription>
              Detailed view and configuration for {selectedWindow?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedWindow && (() => {
            const currentWindowDto = windows.find(w => w.windowName === selectedWindow?.name || w.id.toString() === selectedWindow?.id.toString());
            return (
              <div className="pt-[3px] pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Lock Status</span>
                    <div className="flex items-center gap-2 font-medium">
                      {selectedWindow.status === 'locked' ? (
                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Locked</Badge>
                      ) : (
                        <Badge variant="destructive">Unlocked</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Open Status</span>
                    <div className="flex items-center gap-2 font-medium">
                      {currentWindowDto?.isOpen ? (
                        <Badge variant="secondary" className="bg-amber-400">Open</Badge>
                      ) : (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Location</span>
                    <div className="font-medium text-sm">{selectedWindow.room ? rooms.find(r => r.id === selectedWindow.room)?.name : 'N/A'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                    <div className="font-medium text-sm">{selectedWindow.section ? sections.find(s => s.id === selectedWindow.section)?.name : 'N/A'}</div>
                  </div>
                  {/* BaseDefaultDto Integration */}
                  {currentWindowDto && (
                    <>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Active Profile</span>
                        <div className="font-medium">
                          {currentWindowDto.isActive ? <Badge variant="default" className="bg-emerald-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Power Active</span>
                        <div className="font-medium">
                          {currentWindowDto.powerActive ? <Badge variant="default" className="bg-amber-500">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Section Name</span>
                        <div className="font-medium text-sm">{appNamesDetailList.sectionIds.find(s => s.id === currentWindowDto.sectionId)?.name || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Room Name</span>
                        <div className="font-medium text-sm">{appNamesDetailList.roomIds.find(r => r.id === currentWindowDto.roomId)?.name || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Person Name</span>
                        <div className="font-medium text-sm">{currentWindowDto.peronName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Deleted Status</span>
                        <div className="font-medium">
                          {currentWindowDto.isDeleted ? 'Deleted' : 'No'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Created By</span>
                        <div className="font-medium">{currentWindowDto.createdByName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Created On</span>
                        <div className="font-medium">{currentWindowDto.createdOn ? format(new Date(currentWindowDto.createdOn), 'PPp') : 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified By</span>
                        <div className="font-medium">{currentWindowDto.lastModifiedByName || 'System'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Last Modified</span>
                        <div className="font-medium">{currentWindowDto.lastModifiedOn ? format(new Date(currentWindowDto.lastModifiedOn), 'PPp') : 'Never'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      <Dialog open={isViewActionOpen} onOpenChange={setIsViewActionOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900" showCloseButton={false}>
          <div className="absolute right-6 top-6 flex items-center gap-2 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => { 
                if (selectedAction) {
                  setActionForm({
                    actionName: selectedAction.actionName,
                    description: selectedAction.actionDescription,
                    personId: selectedAction.personId
                  });
                }
                setIsViewActionOpen(false); 
                setIsEditActionOpen(true); 
              }}
            >
              <Edit3 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              onClick={() => requestAuth(() => { setActions(prev => prev.filter(a => a.id !== selectedAction?.id)); setIsViewActionOpen(false); })}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <div className="h-5 w-px bg-border mx-1" />
            <DialogClose render={<Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
          <DialogHeader className="p-6 h-[100px] bg-white dark:bg-slate-900 border-b mb-0 shrink-0 pr-40 flex flex-col justify-center">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight leading-tight flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary shrink-0" />
                {selectedAction?.actionName}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 leading-none whitespace-nowrap">
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-mono shrink-0">{selectedAction?.actionId}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                {selectedAction?.actionActive ? 
                  <span className="text-emerald-500 font-bold text-[11px] uppercase tracking-wider shrink-0">Active sequence</span> : 
                  <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider shrink-0">Disabled</span>
                }
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-6 scrollbar-hide">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Layers className="h-3 w-3" />
                  Execution Sequence
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary font-bold hover:bg-primary/5 rounded-lg h-8 px-2"
                  onClick={() => {
                    setActionStepForm({
                      actionId: selectedAction?.id || 0,
                      facilityType: FacilityType.Appliance,
                      facilityTypeId: 0,
                      brightnessLevel: 0,
                      isLocked: false,
                      isOpen: false,
                      isActive: false
                    });
                    setIsAddActionStepOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-3">
                {selectedAction?.getActionStepDtos.map((step, idx) => (
                  <Card key={step.id} className="p-4 bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all group rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-400 shadow-sm transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {(() => {
                              switch (step.facilityType) {
                                case FacilityType.Appliance: return appliances.find(x => x.id === step.facilityTypeId)?.applianceName || 'Appliance';
                                case FacilityType.Camera: return cameras.find(x => x.id === step.facilityTypeId)?.cameraName || 'Camera';
                                case FacilityType.Door: return doors.find(x => x.id === step.facilityTypeId)?.doorName || 'Door';
                                case FacilityType.External: return externals.find(x => x.id === step.facilityTypeId)?.externalName || 'External';
                                case FacilityType.Light: return lights.find(x => x.id === step.facilityTypeId)?.lightName || 'Light';
                                case FacilityType.Window: return windows.find(x => x.id === step.facilityTypeId)?.windowName || 'Window';
                                default: return 'Device';
                              }
                            })()}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                            {FacilityType[step.facilityType]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 overflow-x-auto pb-1 scrollbar-hide">
                          {step.facilityType === FacilityType.Light && step.brightnessLevel > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 rounded-lg">
                              Brightness: {step.brightnessLevel}%
                            </Badge>
                          )}
                          {step.facilityType === FacilityType.Door && (
                            <Badge variant="outline" className={cn(
                              "text-[10px] rounded-lg",
                              step.isLocked ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200"
                            )}>
                              {step.isLocked ? "Locked" : "Unlocked"}
                            </Badge>
                          )}
                          {(step.facilityType === FacilityType.Door || step.facilityType === FacilityType.Window) && (
                            <Badge variant="outline" className={cn(
                              "text-[10px] rounded-lg",
                              step.isOpen ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-slate-50 text-slate-500 border-slate-200"
                            )}>
                              {step.isOpen ? "Open" : "Closed"}
                            </Badge>
                          )}
                          <Badge variant="outline" className={cn(
                            "text-[10px] rounded-lg",
                            step.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                          )}>
                            {step.isActive ? "Run" : "Stop"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-slate-400" 
                          title="Edit Step"
                          onClick={() => {
                            setSelectedActionStep(step);
                            setActionStepForm({ ...step });
                            setIsEditActionStepOpen(true);
                          }}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive text-slate-400" 
                          title="Remove Step"
                          onClick={() => requestAuth(() => {
                            if (selectedAction) {
                              const updatedSteps = selectedAction.getActionStepDtos.filter(s => s.id !== step.id);
                              const updatedAction = { ...selectedAction, getActionStepDtos: updatedSteps };
                              setActions(prev => prev.map(a => a.id === selectedAction.id ? updatedAction : a));
                              setSelectedAction(updatedAction);
                            }
                          })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Description
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {selectedAction?.actionDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Created By</span>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <div className="font-bold text-slate-700 dark:text-slate-200">{selectedAction?.createdByName || 'System'}</div>
                  <div className="text-xs text-slate-400 ml-auto">{selectedAction?.createdOn ? format(new Date(selectedAction.createdOn), 'PP') : 'N/A'}</div>
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Modified</span>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div className="font-bold text-slate-700 dark:text-slate-200">{selectedAction?.lastModifiedByName || 'System'}</div>
                  <div className="text-xs text-slate-400 ml-auto">{selectedAction?.lastModifiedOn ? format(new Date(selectedAction.lastModifiedOn), 'PP') : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border-t bg-white dark:bg-slate-900 shrink-0">
             <div className="flex justify-end gap-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">
               Step configuration for automated sequence
             </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddActionOpen} onOpenChange={setIsAddActionOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="mb-0 pt-5 px-6 pb-2">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary shrink-0" />
                Create New Action
              </DialogTitle>
              <DialogDescription className="text-xs font-medium">Define a new automated sequence</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="actionName" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Action Name</Label>
              <Input 
                id="actionName" 
                placeholder="e.g. Master Shutoff" 
                value={actionForm.actionName}
                onChange={(e) => setActionForm(prev => ({ ...prev, actionName: e.target.value }))}
                className="rounded-2xl h-11 border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description</Label>
              <Input 
                id="description" 
                placeholder="Describe what this action does..." 
                value={actionForm.description}
                onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                className="rounded-2xl h-11 border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-primary text-white px-4 font-normal flex items-center justify-center gap-2"
              onClick={() => {
                const newAction: GetActionDto = {
                  id: actions.length + 1,
                  actionId: `ACT-00${actions.length + 1}`,
                  actionName: actionForm.actionName,
                  actionDescription: actionForm.description,
                  actionActive: true,
                  getActionStepDtos: [],
                  createdBy: 1,
                  createdByName: userProfile.getPersonDetailsDto.firstName,
                  createdOn: new Date().toISOString(),
                  lastModifiedBy: 1,
                  lastModifiedByName: userProfile.getPersonDetailsDto.firstName,
                  lastModifiedOn: new Date().toISOString(),
                  isDeleted: false,
                  personId: 1,
                  peronName: userProfile.getPersonDetailsDto.firstName,
                  deletedBy: 0
                };
                setActions(prev => [...prev, newAction]);
                setIsAddActionOpen(false);
                setActionForm({ actionName: '', description: '', personId: 1 });
              }}
            >
              <PlusCircle className="h-5 w-5" />
              Create Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditActionOpen} onOpenChange={setIsEditActionOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="mb-0 pt-5 px-6 pb-2">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Edit3 className="h-6 w-6 text-primary shrink-0" />
                Edit Action
              </DialogTitle>
              <DialogDescription className="text-xs font-medium">Update action details</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-[3px] pb-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-actionName" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Action Name</Label>
              <Input 
                id="edit-actionName" 
                placeholder="e.g. Master Shutoff" 
                value={actionForm.actionName}
                onChange={(e) => setActionForm(prev => ({ ...prev, actionName: e.target.value }))}
                className="rounded-2xl h-11 border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description</Label>
              <Input 
                id="edit-description" 
                placeholder="Describe what this action does..." 
                value={actionForm.description}
                onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                className="rounded-2xl h-11 border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-primary text-primary-foreground px-4 font-normal flex items-center justify-center gap-2"
              onClick={() => {
                if (selectedAction) {
                  setActions(prev => prev.map(a => a.id === selectedAction.id ? {
                    ...a,
                    actionName: actionForm.actionName,
                    actionDescription: actionForm.description,
                    lastModifiedOn: new Date().toISOString()
                  } : a));
                  setIsEditActionOpen(false);
                  setActionForm({ actionName: '', description: '', personId: 1 });
                }
              }}
            >
              <CheckCheck className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Action Step Modal */}
      {/* Add Action Step Modal */}
      <Dialog open={isAddActionStepOpen} onOpenChange={setIsAddActionStepOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="mb-0 pt-5 px-6 pb-2">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-primary shrink-0" />
                Add Sequence Step
              </DialogTitle>
              <DialogDescription className="text-xs font-medium">Add a new operation to this action</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-6 pt-[3px] pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Facility Type</Label>
                <Select 
                  value={actionStepForm.facilityType.toString()} 
                  onValueChange={(val) => setActionStepForm(prev => ({ ...prev, facilityType: parseInt(val), facilityTypeId: 0 }))}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {appNamesDetailList.facilityType.map(ft => (
                      <SelectItem key={ft.id} value={ft.id.toString()}>{ft.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Device / Target</Label>
                <Select 
                  value={actionStepForm.facilityTypeId.toString()} 
                  onValueChange={(val) => setActionStepForm(prev => ({ ...prev, facilityTypeId: parseInt(val) }))}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 h-11">
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {(() => {
                      switch (actionStepForm.facilityType) {
                        case FacilityType.Appliance: return appNamesDetailList.applianceIdNames.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>);
                        case FacilityType.Camera: return appNamesDetailList.cameraIdNames.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>);
                        case FacilityType.Door: return appNamesDetailList.doorIdNames.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>);
                        case FacilityType.External: return appNamesDetailList.externalIdNames.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>);
                        case FacilityType.Light: return appNamesDetailList.lightIdNames.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>);
                        case FacilityType.Window: return appNamesDetailList.windowIdNames.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>);
                        default: return <SelectItem value="0" disabled>No devices found</SelectItem>;
                      }
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 space-y-5">
              {actionStepForm.facilityType === FacilityType.Light && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-300">Brightness Level</Label>
                    <Badge className="bg-primary/10 text-primary border-none font-bold">{actionStepForm.brightnessLevel}%</Badge>
                  </div>
                  <Slider 
                    value={[actionStepForm.brightnessLevel]} 
                    onValueChange={(vals) => setActionStepForm(prev => ({ ...prev, brightnessLevel: Array.isArray(vals) ? vals[0] : vals }))}
                    max={100} 
                    min={0}
                    step={1} 
                    className="py-2"
                  />
                </div>
              )}

              {(actionStepForm.facilityType === FacilityType.Door || actionStepForm.facilityType === FacilityType.Window) && (
                <div className="flex items-center justify-between p-1">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-300">Lock State</Label>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Engage physical lock</p>
                  </div>
                  <Switch 
                    checked={actionStepForm.isLocked} 
                    onCheckedChange={(checked) => setActionStepForm(prev => ({ ...prev, isLocked: checked }))}
                  />
                </div>
              )}

              {(actionStepForm.facilityType === FacilityType.Door || actionStepForm.facilityType === FacilityType.Window) && (
                <div className="flex items-center justify-between p-1 pt-2 border-t border-slate-200/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-300">Opening State</Label>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Physical orientation</p>
                  </div>
                  <Switch 
                    checked={actionStepForm.isOpen} 
                    onCheckedChange={(checked) => setActionStepForm(prev => ({ ...prev, isOpen: checked }))}
                  />
                </div>
              )}

              <div className={cn(
                "flex items-center justify-between p-1",
                (actionStepForm.facilityType === FacilityType.Door || actionStepForm.facilityType === FacilityType.Window || actionStepForm.facilityType === FacilityType.Light) ? "pt-2 border-t border-slate-200/50" : ""
              )}>
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-slate-600 dark:text-slate-300">Power Status</Label>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Overall operational state</p>
                </div>
                <Switch 
                  checked={actionStepForm.isActive} 
                  onCheckedChange={(checked) => setActionStepForm(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 flex items-center justify-center">
            <Button 
              className="flex items-center justify-center gap-2 px-4 font-normal"
              onClick={() => {
                if (selectedAction) {
                  const newStep: GetActionStepDto = {
                    id: Math.max(0, ...selectedAction.getActionStepDtos.map(s => s.id)) + 1,
                    actionId: parseInt(selectedAction.actionId.replace('ACT-', '')), // Map to int as per DTO
                    facilityType: actionStepForm.facilityType,
                    facilityTypeId: actionStepForm.facilityTypeId,
                    brightnessLevel: actionStepForm.brightnessLevel,
                    isLocked: actionStepForm.isLocked,
                    isOpen: actionStepForm.isOpen,
                    isActive: actionStepForm.isActive
                  };
                  const updatedAction = { ...selectedAction, getActionStepDtos: [...selectedAction.getActionStepDtos, newStep] };
                  setActions(prev => prev.map(a => a.id === selectedAction.id ? updatedAction : a));
                  setSelectedAction(updatedAction);
                  setIsAddActionStepOpen(false);
                }
              }}
            >
              <PlusCircle className="h-5 w-5" />
              Add Action Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Action Step Modal */}
      <Dialog open={isEditActionStepOpen} onOpenChange={setIsEditActionStepOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="mb-0 pt-5 px-6 pb-2">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Pencil className="h-6 w-6 text-primary shrink-0" />
                Edit Sequence Step
              </DialogTitle>
              <DialogDescription className="text-xs font-medium">Modify operation settings for this step</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-6 pt-[3px] pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Facility Type</Label>
                <Select 
                  value={actionStepForm.facilityType.toString()} 
                  onValueChange={(val) => setActionStepForm(prev => ({ ...prev, facilityType: parseInt(val), facilityTypeId: 0 }))}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {appNamesDetailList.facilityType.map(ft => (
                      <SelectItem key={ft.id} value={ft.id.toString()}>{ft.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Device / Target</Label>
                <Select 
                  value={actionStepForm.facilityTypeId.toString()} 
                  onValueChange={(val) => setActionStepForm(prev => ({ ...prev, facilityTypeId: parseInt(val) }))}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 h-11">
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {(() => {
                      switch (actionStepForm.facilityType) {
                        case FacilityType.Appliance: return appNamesDetailList.applianceIdNames.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>);
                        case FacilityType.Camera: return appNamesDetailList.cameraIdNames.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>);
                        case FacilityType.Door: return appNamesDetailList.doorIdNames.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>);
                        case FacilityType.External: return appNamesDetailList.externalIdNames.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>);
                        case FacilityType.Light: return appNamesDetailList.lightIdNames.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>);
                        case FacilityType.Window: return appNamesDetailList.windowIdNames.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>);
                        default: return <SelectItem value="0" disabled>No devices found</SelectItem>;
                      }
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 space-y-5">
              {actionStepForm.facilityType === FacilityType.Light && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-300">Brightness Level</Label>
                    <Badge className="bg-primary/10 text-primary border-none font-bold">{actionStepForm.brightnessLevel}%</Badge>
                  </div>
                  <Slider 
                    value={[actionStepForm.brightnessLevel]} 
                    onValueChange={(vals) => setActionStepForm(prev => ({ ...prev, brightnessLevel: Array.isArray(vals) ? vals[0] : vals }))}
                    max={100} 
                    min={0}
                    step={1} 
                    className="py-2"
                  />
                </div>
              )}

              {(actionStepForm.facilityType === FacilityType.Door || actionStepForm.facilityType === FacilityType.Window) && (
                <div className="flex items-center justify-between p-1">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-300">Lock State</Label>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Engage physical lock</p>
                  </div>
                  <Switch 
                    checked={actionStepForm.isLocked} 
                    onCheckedChange={(checked) => setActionStepForm(prev => ({ ...prev, isLocked: checked }))}
                  />
                </div>
              )}

              {(actionStepForm.facilityType === FacilityType.Door || actionStepForm.facilityType === FacilityType.Window) && (
                <div className="flex items-center justify-between p-1 pt-2 border-t border-slate-200/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-300">Opening State</Label>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Physical orientation</p>
                  </div>
                  <Switch 
                    checked={actionStepForm.isOpen} 
                    onCheckedChange={(checked) => setActionStepForm(prev => ({ ...prev, isOpen: checked }))}
                  />
                </div>
              )}

              <div className={cn(
                "flex items-center justify-between p-1",
                (actionStepForm.facilityType === FacilityType.Door || actionStepForm.facilityType === FacilityType.Window || actionStepForm.facilityType === FacilityType.Light) ? "pt-2 border-t border-slate-200/50" : ""
              )}>
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-slate-600 dark:text-slate-300">Power Status</Label>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Overall operational state</p>
                </div>
                <Switch 
                  checked={actionStepForm.isActive} 
                  onCheckedChange={(checked) => setActionStepForm(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 flex items-center justify-center">
            <Button 
              className="flex items-center justify-center gap-2 px-4 font-normal"
              onClick={() => {
                if (selectedAction && selectedActionStep) {
                  const updatedStep: GetActionStepDto = {
                    ...selectedActionStep,
                    facilityType: actionStepForm.facilityType,
                    facilityTypeId: actionStepForm.facilityTypeId,
                    brightnessLevel: actionStepForm.brightnessLevel,
                    isLocked: actionStepForm.isLocked,
                    isOpen: actionStepForm.isOpen,
                    isActive: actionStepForm.isActive
                  };
                  const updatedSteps = selectedAction.getActionStepDtos.map(s => s.id === updatedStep.id ? updatedStep : s);
                  const updatedAction = { ...selectedAction, getActionStepDtos: updatedSteps };
                  setActions(prev => prev.map(a => a.id === selectedAction.id ? updatedAction : a));
                  setSelectedAction(updatedAction);
                  setIsEditActionStepOpen(false);
                }
              }}
            >
              <Save className="h-5 w-5" />
              Update Action Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent showCloseButton={false} className="max-w-[85vw] w-[85vw] h-[85vh] p-0 flex flex-row overflow-hidden rounded-[9px] border border-black shadow-2xl bg-white">
          {chats.length === 0 ? (
            <div className="flex flex-row w-full h-full relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 h-8 w-8 text-slate-500 hover:text-black z-50 rounded-full" 
                onClick={() => setIsChatModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="w-[40%] bg-slate-50 border-r-[1px] border-slate-200 flex flex-col items-center justify-center p-8 text-center shrink-0 relative z-10">
                <div className="relative mb-8 flex items-center justify-center">
                  <Settings className="h-28 w-28 text-slate-300 animate-[spin_4s_linear_infinite]" />
                  <MessageSquare className="h-10 w-10 text-primary absolute" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">The HanssonHub Chats</h2>
                <p className="text-sm text-slate-500 max-w-xs">Start connecting with your peers. Pick a contact to begin a conversation.</p>
              </div>
              
              <div className="flex-1 flex items-center bg-white p-8 relative overflow-hidden">
                <div className="w-full">
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {allUsers.filter(u => u.id !== userProfile.id).map(user => (
                      <button 
                        key={user.id}
                        onClick={() => startDirectChat(user)}
                        className="min-w-[140px] flex flex-col items-center p-5 bg-slate-50 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary transition-all shrink-0"
                      >
                        <img src={user.getPersonDetailsDto.imageUrl} alt={user.getPersonDetailsDto.firstName} className="h-16 w-16 rounded-full mb-3 object-cover shadow-sm border border-slate-100" referrerPolicy="no-referrer" />
                        <span className="font-semibold text-sm text-slate-800">{user.getPersonDetailsDto.firstName}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{user.getUserDto.roleName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* WhatsApp Style Sidebar - List View (Increased width: 25-30%) */}
              <div className="w-[35%] lg:w-[30%] xl:w-[25%] bg-[#ffffff] flex flex-col shrink-0 border-r-[1px] border-black relative z-10">
            <div className="p-5 bg-[#f0f2f5] shrink-0 border-b border-black/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 shadow-inner overflow-hidden border-2 border-white">
                    <img src={userProfile.getPersonDetailsDto.imageUrl} alt="Me" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold tracking-tight text-[#111b21]">Chats</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full text-[#54656f] hover:bg-slate-200" 
                        title="New Chat / Group"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200">
                      <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => { setIsGroupMode(false); setIsNewChatOpen(true); }}>
                        <UserPlus className="mr-3 h-4 w-4 text-[#54656f]" />
                        <span className="font-medium text-[#111b21]">Start a chat</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => { setIsGroupMode(true); setIsNewChatOpen(true); }}>
                        <Users className="mr-3 h-4 w-4 text-[#54656f]" />
                        <span className="font-medium text-[#111b21]">Create a group</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <MessageSquare className="h-5 w-5 text-[#54656f]" />
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search or start new chat" 
                  className="pl-10 h-10 bg-white border-none rounded-[5px] text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 bg-white">
              <div className="divide-y divide-slate-50">
                {chats.map((chat) => {
                    const lastMsg = chat.lastMessage;
                    const isOnline = chat.isGroup ? chat.participants.some(p => p.isOnline && p.personId !== userProfile.id) : chat.participants.find(p => p.personId !== userProfile.id)?.isOnline;
                    
                    return (
                      <button 
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          setChatSearchQuery("");
                          setIsChatSearchVisible(false);
                        }}
                        className={cn(
                          "w-full h-[72px] px-4 flex gap-3 hover:bg-[#f5f6f6] transition-all text-left group relative border-l-4 border-transparent",
                          activeChatId === chat.id && "bg-[#f0f2f5] border-primary"
                        )}
                      >
                        <div className="relative shrink-0 flex items-center">
                          <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-100",
                            activeChatId === chat.id ? "bg-primary/10" : "bg-slate-50"
                          )}>
                            {chat.imageUrl ? (
                              <img src={chat.imageUrl} alt={chat.name} className="h-full w-full object-cover" />
                            ) : (
                              chat.isGroup ? <Users className="h-6 w-6 text-slate-400" /> : <UserIcon className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-2 right-0 h-3.5 w-3.5 bg-[#25d366] border-[3px] border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center border-b border-slate-100 group-last:border-none h-full">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-semibold text-[16px] text-[#111b21] truncate">{chat.name || 'Private Chat'}</span>
                            <span className={cn(
                              "text-[11px] font-medium tracking-tight px-1",
                              chat.unreadCount > 0 ? "text-[#25d366]" : "text-[#667781]"
                            )}>
                              {lastMsg ? format(new Date(lastMsg.sentAt), 'HH:mm') : format(new Date(chat.createdAt), 'MMM d')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                              {lastMsg && lastMsg.senderPersonId === userProfile.id && <CheckCheck className="h-4 w-4 text-[#53bdeb] shrink-0" />}
                              <p className="text-[14px] text-[#667781] truncate leading-relaxed">
                                {lastMsg ? lastMsg.content : (chat.description || 'No messages yet')}
                              </p>
                            </div>
                            {chat.unreadCount > 0 && (
                              <div className="h-5 w-5 rounded-full bg-[#25d366] text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                                {chat.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Box (Proportional 70-75%) */}
          <div className="flex-1 flex flex-col bg-[#efeae2] relative overflow-hidden">
            {activeChatId ? (
              <>
                {(() => {
                  const chat = chats.find(c => c.id === activeChatId);
                  if (!chat) return null;
                  const isOnline = chat.isGroup ? chat.participants.some(p => p.isOnline && p.personId !== userProfile.id) : chat.participants.find(p => p.personId !== userProfile.id)?.isOnline;

                  return (
                    <header className="px-5 py-3 border-b flex items-center justify-between bg-[#f0f2f5] shrink-0 z-20 shadow-sm h-[60px]">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner overflow-hidden border border-slate-200">
                            {chat.imageUrl ? (
                              <img src={chat.imageUrl} alt={chat.name} className="h-full w-full object-cover" />
                            ) : (
                              chat.isGroup ? <Users className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 bg-[#25d366] border-2 border-[#f0f2f5] rounded-full" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold text-[#111b21] truncate max-w-[200px]">
                            {chat.name || 'Private Chat'}
                          </h3>
                          <div className="flex items-center gap-1.5 ">
                            <span className="text-[12px] text-[#667781] font-medium leading-none">
                              {isOnline ? 'Online • Active now' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {chat.isGroup && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full h-10 w-10 text-[#54656f] hover:bg-slate-200/50"
                            onClick={() => {
                              setEditingGroupId(chat.id);
                              setNewGroupName(chat.name || "");
                              setNewGroupDescription(chat.description || "");
                              setNewGroupImageUrl(chat.imageUrl || "");
                              setNewGroupRoom(chat.roomId?.toString() || "none");
                              setNewGroupSection(chat.sectionId?.toString() || "");
                              setSelectedParticipants(chat.participants.map(p => p.personId).filter(id => id !== userProfile.id));
                              setIsEditGroupOpen(true);
                            }}
                            title="Group Settings"
                          >
                            <Settings2 className="h-5 w-5" />
                          </Button>
                        )}
                        {isChatSearchVisible && (
                          <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 200, opacity: 1 }}
                            className="mr-2"
                          >
                            <Input 
                              placeholder="Search messages..." 
                              className="h-8 text-xs bg-white border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
                              value={chatSearchQuery}
                              onChange={(e) => setChatSearchQuery(e.target.value)}
                            />
                          </motion.div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("rounded-full h-10 w-10 text-[#54656f] hover:bg-slate-200/50", isChatSearchVisible && "bg-slate-200 text-primary")}
                          onClick={() => setIsChatSearchVisible(!isChatSearchVisible)}
                        >
                          <Search className="h-5 w-5" />
                        </Button>
                        <Separator orientation="vertical" className="h-5 mx-2 bg-[#d1d7db]" />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setIsChatModalOpen(false)} 
                          className="rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive group/close"
                          title="Close Chat"
                        >
                          <XCircle className="h-6 w-6 text-[#54656f] group-hover/close:text-destructive transition-colors" />
                        </Button>
                      </div>
                    </header>
                  );
                })()}

                <div className="flex-1 relative overflow-hidden bg-[#efeae2]">
                  {/* WhatsApp background pattern */}
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat z-0" />
                  
                  <ScrollArea className="h-full w-full chat-scroll-viewport">
                    <div className="p-6 md:px-12 xl:px-24 relative z-10 flex flex-col min-h-full">
                      <div className="flex justify-center mb-8 sticky top-0 z-30 pt-2">
                        <div className="bg-[#fff9c2] border border-[#e8df8a] shadow-sm px-4 py-1.5 rounded-lg flex items-center gap-2 max-w-[80%] mx-auto">
                          <Lock className="h-3 w-3 text-[#54656f]" />
                          <span className="text-[11px] font-medium text-[#54656f] leading-relaxed text-center">Messages are end-to-end encrypted. No one outside of this chat can read or listen to them. Click to learn more.</span>
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
                        {(() => {
                           const currentMessages = chatMessages.filter(m => 
                            m.chatId === activeChatId && 
                            (!chatSearchQuery || m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                          );

                          if (currentMessages.length === 0) {
                            return (
                              <div className="flex flex-col items-center justify-center py-20 text-[#667781]">
                                <p className="text-sm font-medium">No messages found.</p>
                              </div>
                            );
                          }

                          return (
                            <>
                              <div className="flex justify-center my-6">
                                <span className="bg-[#fff] shadow-sm px-3 py-1 rounded-lg text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Today</span>
                              </div>
                              {currentMessages.map((msg, idx) => {
                                const isMe = msg.senderPersonId === userProfile.id;
                                return (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: Math.min(idx * 0.01, 0.2) }}
                                    key={msg.id || idx} 
                                    className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}
                                  >
                                    <div className={cn(
                                      "group/msg relative max-w-[85%] lg:max-w-[70%] xl:max-w-[60%] p-2 rounded-xl shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] transition-all",
                                      isMe ? "bg-[#d9fdd3] rounded-tr-none ml-12" : "bg-white rounded-tl-none mr-12"
                                    )}>
                                      {/* Reply Button on Hover */}
                                      <button 
                                        onClick={() => setReplyingTo(msg)}
                                        className={cn(
                                          "absolute top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity bg-black/10 hover:bg-black/20 p-1 rounded-full text-[#54656f] z-20",
                                          isMe ? "-left-10" : "-right-10"
                                        )}
                                      >
                                        <Reply className="h-5 w-5" />
                                      </button>

                                      {!isMe && (
                                        <div className="px-1 mb-1">
                                          <span className="text-xs font-bold text-primary tracking-tight">{msg.senderName}</span>
                                        </div>
                                      )}

                                      <div className="px-1 py-0.5">
                                        {msg.replyToId && (
                                          <div className="mb-2 p-2 bg-black/5 rounded-lg border-l-4 border-primary text-[13px] bg-white/40">
                                            {(() => {
                                              const repliedMsg = chatMessages.find(m => m.id === msg.replyToId);
                                              return repliedMsg ? (
                                                <>
                                                  <p className="font-bold text-primary text-[11px] mb-0.5">{repliedMsg.senderName}</p>
                                                  <p className="truncate text-slate-500 italic">
                                                    {repliedMsg.type === MessageType.Text ? repliedMsg.content : `[${MessageType[repliedMsg.type]}]`}
                                                  </p>
                                                </>
                                              ) : (
                                                <p className="text-slate-400 italic">Original message unavailable</p>
                                              );
                                            })()}
                                          </div>
                                        )}
                                        {msg.type === MessageType.Text && (
                                          <p className="text-[14.5px] leading-[1.4] text-[#111b21] whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                        {msg.type === MessageType.Image && msg.attachments && msg.attachments.length > 0 && (
                                          <div className="space-y-1.5 rounded-lg overflow-hidden bg-black/5 p-1 border border-black/5">
                                            <div className={cn(
                                              "grid gap-0.5 rounded-md overflow-hidden",
                                              msg.attachments.length === 1 ? "grid-cols-1" : 
                                              msg.attachments.length === 2 ? "grid-cols-2" : 
                                              "grid-cols-2"
                                            )}>
                                              {msg.attachments.map((att, idx) => (
                                                <img 
                                                  key={idx}
                                                  src={att.filePath} 
                                                  alt="uploaded" 
                                                  className={cn(
                                                    "w-full h-auto object-cover hover:opacity-95 transition-opacity cursor-pointer shadow-sm",
                                                    msg.attachments.length > 1 ? "aspect-square" : "max-h-[400px]"
                                                  )}
                                                  onClick={() => {
                                                    setPreviewMediaUrl(att.filePath);
                                                    setIsPreviewModalOpen(true);
                                                  }}
                                                  referrerPolicy="no-referrer"
                                                />
                                              ))}
                                            </div>
                                            {msg.content && <p className="px-1 py-1 text-[13px] text-[#111b21]">{msg.content}</p>}
                                          </div>
                                        )}
                                        {msg.type === MessageType.File && msg.attachments && msg.attachments.length > 0 && (
                                          <div className="space-y-1">
                                            {msg.attachments.map((att, idx) => (
                                              <div key={idx} className="flex items-center gap-3 bg-black/5 p-3 rounded-xl min-w-[280px] hover:bg-black/10 transition-colors cursor-pointer group/file border border-black/5">
                                                <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm shrink-0">
                                                  <FileText className="h-7 w-7 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-bold truncate text-[#111b21]">{att.fileName}</p>
                                                  <p className="text-[10px] text-[#667781] uppercase font-bold tracking-tight">
                                                    {att.contentType.split('/')[1]?.toUpperCase() || 'FILE'} • {(att.fileSize / 1024 / 1024).toFixed(1)} MB
                                                  </p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/50 hover:bg-white shrink-0 rounded-full">
                                                  <Download className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                          <span className="text-[10px] text-[#667781] font-medium uppercase tracking-tighter">
                                            {format(new Date(msg.sentAt), 'HH:mm')}
                                          </span>
                                          {isMe && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </>
                          );
                        })()}
                        <div ref={chatEndRef} />
                      </div>
                    </div>
                  </ScrollArea>
                  
                  {/* Bottom Scroll Mask */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#efeae2] to-transparent z-10 pointer-events-none" />
                </div>

                <footer className="p-3.5 bg-[#f0f2f5] border-t shrink-0 z-50">
                  <div className="flex flex-col gap-2 relative">
                    {/* Replying UI */}
                    {replyingTo && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto w-[95%] bg-white/80 backdrop-blur-sm p-3 rounded-t-xl border-t border-l border-r border-[#d1d7db] flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="border-l-4 border-primary pl-3 flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-primary mb-0.5">{replyingTo.senderName}</p>
                          <p className="text-sm text-[#667781] truncate">{replyingTo.content}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setReplyingTo(null)}
                          className="h-8 w-8 rounded-full hover:bg-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}

                    <div className="flex items-center gap-2 max-w-[95%] mx-auto relative w-full">
                      <div className="flex items-center shrink-0">
                        <Popover>
                          <PopoverTrigger 
                            render={
                              <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 text-[#54656f] hover:bg-slate-200/50" />
                            }
                          >
                            <Smile className="h-7 w-7" />
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-[320px] p-2 rounded-2xl border shadow-xl bg-white mb-2">
                             <div className="grid grid-cols-6 gap-1 p-2">
                                {['😀', '😂', '😍', '👍', '🙏', '🔥', '✨', '💯', '🏠', '🔑', '🚨', '🛠️'].map(emoji => (
                                   <button 
                                      key={emoji} 
                                      className="h-10 w-10 flex items-center justify-center text-2xl hover:bg-slate-100 rounded-lg transition-colors"
                                      onClick={() => setChatInput(prev => prev + emoji)}
                                   >
                                      {emoji}
                                   </button>
                                ))}
                             </div>
                             <div className="p-2 border-t text-[11px] text-center text-muted-foreground uppercase font-bold tracking-widest text-[#111b21]">Emoji Panel</div>
                          </PopoverContent>
                        </Popover>
                        
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <input type="file" id="file-upload" className="hidden" onChange={(e) => handleFileUpload(e, 'file')} />
                          <div className="h-11 w-11 flex items-center justify-center rounded-full text-[#54656f] hover:bg-slate-200/50 transition-colors">
                            <Paperclip className="h-6 w-6" />
                          </div>
                        </label>

                        <label htmlFor="image-upload" className="cursor-pointer">
                          <input type="file" id="image-upload" className="hidden" accept="image/*,video/*" multiple onChange={(e) => handleFileUpload(e, 'image')} />
                          <div className="h-11 w-11 flex items-center justify-center rounded-full text-[#54656f] hover:bg-slate-200/50 transition-colors">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        </label>
                      </div>

              <div className="flex flex-col flex-1 relative gap-1 min-w-0">
                {replyingTo && (
                  <div className="mx-2 p-2 bg-slate-100 rounded-t-lg border-l-4 border-primary flex items-center justify-between animate-in slide-in-from-bottom-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-primary truncate leading-tight uppercase tracking-widest">{replyingTo.senderName}</p>
                      <p className="text-xs text-slate-500 truncate italic">
                        {replyingTo.type === MessageType.Text ? replyingTo.content : `[${MessageType[replyingTo.type]}]`}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setReplyingTo(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="relative">
                  {isRecording ? (
                        <div className="flex-1 h-12 flex items-center px-4 bg-white rounded-xl shadow-sm border animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3 w-full">
                            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                            <span className="text-sm font-bold text-[#111b21] min-w-[50px] shrink-0">
                              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                            </span>
                            <div className="flex-1 flex items-center justify-center gap-1.5 h-8">
                               {Array.from({length: 16}).map((_, i) => (
                                 <div 
                                   key={i} 
                                   className="w-1.5 bg-[#1DB954] rounded-full spotify-bar" 
                                   style={{ 
                                      animationDelay: `${i * 0.08}s`,
                                      animationDuration: `${0.6 + Math.random() * 0.4}s`
                                   }} 
                                 />
                               ))}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive font-bold h-8 px-2 shrink-0"
                              onClick={() => setIsRecording(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Input 
                          placeholder="Type a message" 
                          className="py-6 px-4 rounded-xl border-none bg-white focus-visible:ring-0 shadow-sm text-[16px] placeholder:text-[#667781]"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                      )}
                    </div>
                  </div>

                <div className="flex items-center shrink-0">
                      {isRecording ? (
                        <Button 
                          onClick={() => {
                            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                              mediaRecorderRef.current.stop();
                              // The actual message sending will happen in onstop event
                            } else {
                              setIsRecording(false);
                            }
                          }}
                          className="rounded-full h-11 w-11 bg-primary text-white shadow-lg flex items-center justify-center p-0 animate-in zoom-in"
                        >
                          <Send className="h-6 w-6 fill-current" />
                        </Button>
                      ) : chatInput.trim() ? (
                        <Button 
                          onClick={handleSendMessage}
                          className="rounded-full h-11 w-11 bg-transparent hover:bg-slate-200/50 text-[#1fa855] shadow-none flex items-center justify-center p-0 transition-transform active:scale-90"
                        >
                          <Send className="h-7 w-7 fill-current" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "rounded-full h-11 w-11 text-[#54656f] transition-all relative overflow-hidden",
                            isRecording && "bg-destructive text-white scale-110 shadow-lg"
                          )}
                          onMouseDown={async () => {
                            try {
                              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                              setIsRecording(true);
                              
                              const recorder = new MediaRecorder(stream);
                              mediaRecorderRef.current = recorder;
                              audioChunksRef.current = [];
                              
                              recorder.ondataavailable = (e) => {
                                if (e.data.size > 0) {
                                  audioChunksRef.current.push(e.data);
                                }
                              };
                              
                              recorder.onstop = () => {
                                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64Audio = reader.result?.toString();
                                  const msg = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    userId: userProfile.id.toString(),
                                    userName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
                                    userAvatar: userProfile.getPersonDetailsDto.imageUrl,
                                    text: `Sent a voice note (${recordingTime}s)`,
                                    type: "audio",
                                    mediaUrl: base64Audio,
                                    chatId: activeChatId,
                                    duration: recordingTime,
                                    timestamp: new Date().toISOString()
                                  };
                                  socketRef.current.emit("chat:message", msg);
                                  setIsRecording(false);
                                };
                                reader.readAsDataURL(audioBlob);
                                
                                // Stop all tracks
                                stream.getTracks().forEach(track => track.stop());
                              };
                              
                              recorder.start();
                            } catch (err) {
                              console.error("Microphone permission denied:", err);
                            }
                          }}
                        >
                          <Mic className="h-6 w-6" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </footer>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] text-[#667781] p-12 text-center">
                <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="flex justify-center">
                    <div className="h-48 w-48 rounded-full bg-white flex items-center justify-center shadow-xl relative">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-dashed animate-[spin_20s_linear_infinite]" />
                      <MessageSquare className="h-24 w-24 text-primary/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">HanssonHub Connect</h2>
                    <p className="text-sm text-[#667781] font-medium leading-relaxed">
                      Select a contact from your sidebar to view history or start a new conversation.
                    </p>
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="h-px w-8 bg-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Members</span>
                      <div className="h-px w-8 bg-slate-300" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {allUsers.filter(u => u.id !== userProfile.id).slice(0, 4).map(user => (
                        <button 
                          key={user.id}
                          onClick={() => startDirectChat(user)}
                          className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group flex flex-col items-center gap-2 w-24"
                        >
                          <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-50">
                            <img src={user.getPersonDetailsDto.imageUrl} alt={user.getPersonDetailsDto.firstName} className="h-full w-full object-cover" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 group-hover:text-primary transition-colors truncate w-full text-center">
                            {user.getPersonDetailsDto.firstName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button 
                      variant="outline" 
                      className="rounded-full bg-white border-2 border-slate-100 text-[#54656f] font-bold h-12 px-8 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                      onClick={() => setIsNewChatOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      New Conversation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditGroupOpen} onOpenChange={(open) => {
        setIsEditGroupOpen(open);
        if (!open) {
          setEditingGroupId(null);
          setSelectedParticipants([]);
          setNewGroupName("");
          setNewGroupDescription("");
          setNewGroupImageUrl("");
        }
      }}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[9px] border border-black shadow-2xl bg-white">
          <DialogHeader className="p-6 pb-2 mb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl font-bold text-slate-900 mb-[3px]">
                  Edit Group Details
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="pl-7 text-[13px] leading-tight">
              Update group name, image and manage participants.
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-4 space-y-6 bg-white max-h-[400px] overflow-y-auto pt-0">
            <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
              <div className="relative group">
                <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                  {newGroupImageUrl ? (
                    <img src={newGroupImageUrl} alt="Group" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full shadow-lg border border-white"
                  onClick={() => {
                    const url = prompt("Enter Group Image URL:");
                    if (url) setNewGroupImageUrl(url);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Group Name</Label>
                  <Input 
                    placeholder="e.g., Family Hub" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="bg-white border-slate-200 rounded-xl h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Description (Optional)</Label>
              <Input 
                placeholder="What is this group about?" 
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="bg-white border-slate-200 rounded-xl h-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

          </div>

          <div className="p-4 bg-slate-50 flex items-center justify-between border-b">
             <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Manage Participants</Label>
             <Badge variant="secondary" className="rounded-full">{selectedParticipants.length} selected</Badge>
          </div>

          <ScrollArea className="h-[240px] bg-white">
            <div className="p-4 space-y-4">
              {allUsers.filter(u => u.id !== userProfile.id).map((user) => {
                const isSelected = selectedParticipants.includes(user.id);
                return (
                  <div
                    key={user.id}
                    className={cn(
                      "w-full p-4 flex items-center gap-4 rounded-xl transition-all border",
                      isSelected ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white border-transparent hover:bg-slate-50"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-100 shrink-0">
                      <img src={user.getPersonDetailsDto.imageUrl} alt={user.getPersonDetailsDto.firstName} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-sm text-slate-800">
                        {user.getPersonDetailsDto.firstName} {user.getPersonDetailsDto.lastName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                        {user.getUserDto.roleName}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "h-8 px-3 rounded-lg text-xs font-bold transition-all",
                        isSelected ? "text-destructive hover:bg-destructive/10 bg-destructive/5" : "text-primary hover:bg-primary/10 bg-primary/5"
                      )}
                      onClick={() => {
                        setSelectedParticipants(prev => 
                          isSelected ? prev.filter(id => id !== user.id) : [...prev, user.id]
                        );
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Remove
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-slate-50">
             <Button 
              className="w-full bg-primary text-primary-foreground" 
              onClick={handleUpdateGroup}
              disabled={!newGroupName.trim() || selectedParticipants.length === 0}
             >
               <CheckCheck className="mr-2 h-4 w-4" />
               Save Changes
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewChatOpen} onOpenChange={(open) => {
        setIsNewChatOpen(open);
        if (!open) {
          setIsGroupMode(false);
          setSelectedParticipants([]);
          setNewGroupName("");
          setNewGroupDescription("");
        }
      }}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[9px] border border-black shadow-2xl bg-white max-h-[90vh] flex flex-col">
          <DialogHeader className="p-6 pb-2 mb-0 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[5px] bg-emerald-100 flex items-center justify-center text-emerald-600">
                {isGroupMode ? <Users className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold mb-[3px]">
                  {isGroupMode ? "Create New Group" : "Start New Chat"}
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm">
                  {isGroupMode ? "Add participants to the group." : "Select a person to start a chat."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {isGroupMode && (
              <div className="px-6 py-4 space-y-4 bg-white border-b shrink-0 text-left">
                <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                  <div className="relative group">
                    <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                      {newGroupImageUrl ? (
                        <img src={newGroupImageUrl} alt="Group" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                      )}
                    </div>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full shadow-lg border border-white"
                      onClick={() => {
                        const url = prompt("Enter Group Image URL:");
                        if (url) setNewGroupImageUrl(url);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Group Name</Label>
                      <Input 
                        placeholder="e.g., Family Hub" 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="bg-white border-slate-200 rounded-xl h-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Description (Optional)</Label>
                  <Input 
                    placeholder="What is this group about?" 
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="bg-white border-slate-200 rounded-xl h-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 border-b shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder={isGroupMode ? "Search participants..." : "Search people..."} 
                  className="pl-9 h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {allUsers.filter(u => u.id !== userProfile.id).map((user) => {
                  const isSelected = selectedParticipants.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        if (isGroupMode) {
                          setSelectedParticipants(prev => 
                            isSelected ? prev.filter(id => id !== user.id) : [...prev, user.id]
                          );
                        } else {
                          startDirectChat(user);
                        }
                      }}
                      className={cn(
                        "w-full p-4 flex items-center gap-4 rounded-xl transition-all group border text-left",
                        isSelected ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white border-transparent hover:bg-slate-50"
                      )}
                    >
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-slate-100 shrink-0 relative">
                        <img src={user.getPersonDetailsDto.firstName && user.getPersonDetailsDto.imageUrl ? user.getPersonDetailsDto.imageUrl : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.getUserDto.userName}`} alt={user.getPersonDetailsDto.firstName} className="h-full w-full object-cover" />
                        {isGroupMode && isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/60 transition-all">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                          {user.getPersonDetailsDto.firstName} {user.getPersonDetailsDto.lastName}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
                          {user.getUserDto.roleName} • {user.disabled ? 'Offline' : 'Available'}
                        </p>
                      </div>
                      {!isGroupMode && (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 border-t bg-slate-50 flex gap-3 shrink-0">
             {isGroupMode && (
               <Button 
                className="flex-1 rounded-xl h-10 font-bold shadow-sm" 
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedParticipants.length === 0}
               >
                 Create Group ({selectedParticipants.length})
               </Button>
             )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Upload Preview Dialog */}
      <Dialog open={isUploadPreviewOpen} onOpenChange={setIsUploadPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50 border border-black shadow-2xl rounded-[9px] flex flex-col h-[85vh]">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-lg font-bold tracking-tight">Send Images</DialogTitle>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Preview and add captions</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-auto" onClick={() => setIsUploadPreviewOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
            {uploadPreviewFiles.length > 0 ? (
              <div className="flex-1 w-full relative flex flex-col items-center justify-center">
                <div className="flex-1 w-full flex items-center justify-center p-6 relative">
                  {uploadPreviewActiveIndex > 0 && (
                    <Button variant="ghost" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full h-10 w-10 p-0 bg-white/50 hover:bg-white/80" onClick={() => setUploadPreviewActiveIndex(i => i - 1)}>
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                  )}
                  {uploadPreviewActiveIndex < uploadPreviewFiles.length - 1 && (
                    <Button variant="ghost" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full h-10 w-10 p-0 bg-white/50 hover:bg-white/80" onClick={() => setUploadPreviewActiveIndex(i => i + 1)}>
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  )}
                  {(() => {
                    const file = uploadPreviewFiles[uploadPreviewActiveIndex];
                    if (!file) return null;
                    const url = URL.createObjectURL(file);
                    return (
                      <img src={url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                    );
                  })()}
                </div>
                
                {/* Overlay thumbnail div */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 overflow-x-auto items-center justify-center shrink-0 max-w-[90%] bg-black/20 backdrop-blur-md rounded-2xl border border-white/20">
                  {uploadPreviewFiles.map((file, idx) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={idx} className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${idx === uploadPreviewActiveIndex ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`} onClick={() => setUploadPreviewActiveIndex(idx)}>
                        <img src={url} className="w-full h-full object-cover" />
                        <button 
                          className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 scale-75 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFiles = [...uploadPreviewFiles];
                            newFiles.splice(idx, 1);
                            if (newFiles.length === 0) {
                              setIsUploadPreviewOpen(false);
                            } else {
                              setUploadPreviewFiles(newFiles);
                              if (idx <= uploadPreviewActiveIndex && uploadPreviewActiveIndex > 0) {
                                setUploadPreviewActiveIndex(uploadPreviewActiveIndex - 1);
                              } else if (idx === uploadPreviewActiveIndex && uploadPreviewActiveIndex === newFiles.length) {
                                setUploadPreviewActiveIndex(newFiles.length - 1);
                              }
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-6 gap-4">
                 <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center">
                   <ImageIcon className="h-8 w-8 text-slate-500" />
                 </div>
                 <div className="text-center">
                   <p className="text-sm font-bold truncate max-w-[200px] text-slate-800">No images selected</p>
                 </div>
              </div>
            )}
          </div>

          <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t shrink-0">
            <Input 
              autoFocus
              placeholder="Add a caption..." 
              value={uploadPreviewText}
              onChange={(e) => setUploadPreviewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendUpload();
                }
              }}
              className="flex-1 bg-white border-none h-11 rounded-[9px] px-4 focus-visible:ring-0 shadow-sm"
            />
            <Button 
              className="rounded-full h-11 w-11 bg-transparent hover:bg-slate-200/50 text-[#1fa855] shadow-none flex items-center justify-center p-0 transition-transform active:scale-90"
              onClick={handleSendUpload}
            >
              <Send className="h-7 w-7 fill-current" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-slate-50 border border-black shadow-2xl rounded-[9px] flex flex-col h-[85vh]">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-lg font-bold tracking-tight">Image Preview</DialogTitle>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Viewing full size image</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full ml-auto" 
              onClick={() => setIsPreviewModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={previewMediaUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-sm rounded-lg" referrerPolicy="no-referrer" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Fingerprint Modal */}
      <Dialog open={isAddFingerprintOpen} onOpenChange={setIsAddFingerprintOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-50 border border-black shadow-2xl rounded-[9px]">
          <DialogHeader className="mt-0 mx-0 pt-5 px-10 pb-3 mb-0 border-b bg-white pr-16">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Fingerprint className="h-6 w-6 text-primary shrink-0" />
                Add Fingerprint
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">Register biometric data for a user</DialogDescription>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Select User</label>
                <Select value={selectedFingerprintUserId} onValueChange={setSelectedFingerprintUserId}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Chose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.getPersonDetailsDto.firstName} {u.getPersonDetailsDto.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-[220px] px-4 font-medium bg-black text-white hover:bg-black/90 flex items-center justify-center gap-2"
                onClick={() => {
                  // Simulate image acquisition
                  const dummyImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
                  setFingerprintImages(prev => [...prev, dummyImg]);
                }}
              >
                <Radio className="h-4 w-4" />
                Request Fingerprint
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fingerprint Previews</label>
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 min-h-[150px] bg-white grid grid-cols-4 gap-4">
                {fingerprintImages.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden">
                    <img src={img} alt={`Fingerprint ${idx + 1}`} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => setFingerprintImages(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {fingerprintImages.length === 0 && (
                  <div className="col-span-full flex items-center justify-center text-slate-400 text-xs italic">
                    Images will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t bg-slate-100/50 flex items-center justify-center">
            <Button 
              className="w-[220px] bg-black hover:bg-black/90 text-white font-medium flex items-center justify-center gap-2"
              disabled={!selectedFingerprintUserId || fingerprintImages.length === 0}
              onClick={() => {
                const payload = {
                  userId: selectedFingerprintUserId,
                  images: fingerprintImages.map(img => img.split(',')[1]) // Send base64 data (bytes)
                };
                console.log("Submitting fingerprint data:", payload);
                // Implementation for actual sending will be added later
                setIsAddFingerprintOpen(false);
                setFingerprintImages([]);
                setSelectedFingerprintUserId("");
              }}
            >
              <CheckCircle2 className="h-5 w-5" />
              Add Fingerprint(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Register NFID Modal */}
      <Dialog open={isRegisterNfidOpen} onOpenChange={setIsRegisterNfidOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-50 border border-black shadow-2xl rounded-[9px]">
          <DialogHeader className="mt-0 mx-0 pt-5 px-10 pb-3 mb-0 border-b bg-white pr-16">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <ScanLine className="h-6 w-6 text-primary shrink-0" />
                Register NFID
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">Register NFID tag or device for a user</DialogDescription>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="bg-slate-100 p-4 rounded-xl border border-dashed border-slate-300 text-center text-sm font-medium text-slate-600">
               Kindly place the Card/Tag/Device on the RFID Sensor.
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Select User</label>
                <Select value={selectedNfidUserId} onValueChange={setSelectedNfidUserId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.getPersonDetailsDto.firstName} {u.getPersonDetailsDto.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Select Hardware</label>
                <Select value={selectedNfidHardwareId} onValueChange={setSelectedNfidHardwareId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose hardware" />
                  </SelectTrigger>
                  <SelectContent>
                    {hardwares.map((h) => (
                      <SelectItem key={h.id} value={h.id.toString()}>
                        {h.hardwareName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t bg-slate-100/50 flex items-center justify-center">
            <Button 
              className="bg-black hover:bg-black/90 text-white font-medium flex items-center justify-center gap-2"
              disabled={!selectedNfidUserId || !selectedNfidHardwareId}
              onClick={() => {
                console.log("Sending NFID Data for user", selectedNfidUserId, "to hardware", selectedNfidHardwareId);
                setIsRegisterNfidOpen(false);
                setSelectedNfidUserId("");
                setSelectedNfidHardwareId("");
              }}
            >
              <Send className="h-5 w-5" />
              Send NFID Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {chatPopups.map((popup) => {
            const sender = allUsers.find(u => u.id === popup.senderPersonId);
            return (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-[9px] shadow-2xl p-4 w-[300px] pointer-events-auto border border-black cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setIsChatModalOpen(true)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold shrink-0">
                  {sender?.getPersonDetailsDto.firstName[0] || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate">{sender?.getPersonDetailsDto.firstName} {sender?.getPersonDetailsDto.lastName}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 break-words">{popup.text || (popup.audioUrl ? '🎤 Voice Message' : popup.images?.length ? '🖼️ Media' : 'File Attached')}</p>
            </motion.div>
          )})}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isScreensaverOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black cursor-pointer"
            onDoubleClick={() => setIsScreensaverOpen(false)}
          >
            
            <div className={`h-full w-full grid gap-1 p-1 ${
              (userProfile.cameraAccess?.length || 0) <= 1 ? 'grid-cols-1 grid-rows-1' :
              (userProfile.cameraAccess?.length || 0) <= 2 ? 'grid-cols-1 sm:grid-cols-2 grid-rows-1' :
              (userProfile.cameraAccess?.length || 0) <= 4 ? 'grid-cols-2 grid-rows-2' :
              'grid-cols-3 grid-rows-2'
            }`}>
              {userProfile.cameraAccess?.map((camId, i) => {
                const cam = cameras.find(c => c.id.toString() === camId.toString() || c.cameraName === camId);
                const videoUrl = cam 
                  ? (i % 2 === 0 ? "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4")
                  : "";
                
                return (
                  <div key={i} className="relative bg-slate-900 rounded-sm overflow-hidden border border-white/5">
                    {cam ? (
                      <>
                        <video 
                          src={videoUrl} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                          <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                            {cam.cameraName || "Camera " + (i + 1)}
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                           <span className="text-[10px] font-mono text-white/70">{format(new Date(), 'HH:mm:ss')}</span>
                        </div>
                        <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent group-hover:border-white/5 transition-all" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-600">
                        <CameraOff className="h-12 w-12 opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">No Signal - CAM {i+1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {(!userProfile.cameraAccess || userProfile.cameraAccess.length === 0) && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-600 col-span-full">
                  <CameraOff className="h-12 w-12 opacity-20" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">No Cameras Configured in Profile</span>
                </div>
              )}
            </div>
            
            {/* Screensaver UI Overlays */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="text-white/20 text-9xl font-black uppercase tracking-[0.5em] select-none pointer-events-none">
                CCTV
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-4">
              <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-4">
                 <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Security Monitor</span>
                   <span className="text-xl font-bold text-white tracking-widest">{format(new Date(), 'MMM dd, yyyy')}</span>
                 </div>
                 <div className="h-8 w-px bg-white/10" />
                 <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Feeds</span>
                   <span className="text-xl font-bold text-emerald-400">{(userProfile.cameraAccess?.length || 0).toString().padStart(2, '0')}</span>
                 </div>
              </div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Double tap anywhere to resume session</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
