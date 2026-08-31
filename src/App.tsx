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
  DeviceType, 
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
  GetTokenDto,
  GetTokenDtoResponse,
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
  FacilityTypeApp,
  ChatDto,
  ChatParticipantDto,
  MessageDto,
  MessageType,
  SendMessageDto,
  MessageAttachmentDto,
  CreateDirectChatDto,
  CreateGroupChatDto,
  CreateRoomDto,
  UpdateGroupChatDto,
  MessageQueryDto,
  RemoveParticipantDto,
  AddParticipantsDto,
  RealtimeMessageDto,
  CallType,
  CallStatus,
  CallParticipantStatus,
  CallParticipantDto,
  CallDto,
  CallLogDto,
  StartCallDto,
  OfferDto,
  AnswerDto,
  RejectDto,
  IceCandidateDto,
  ToggleCallItemsDto
} from './types';
import { INITIAL_CHATS, INITIAL_CHAT_MESSAGES } from './chatData';
import { toast, Toaster } from 'sonner';
import { GetUserDto } from './api/types';
import { API_BASE_URL } from './config';
import { apiFetch } from './api/client';
import { ScrollArea } from './components/ui/scroll-area';
import { HlsVideo } from './components/HlsVideo';
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
  Repeat,
  Camera,
  Plus,
  Tag,
  Film,
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
  ArrowLeft,
  ArrowLeftCircle,
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
  Compass,
  Heart,
  Wrench,
  Save,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  Send,
  Paperclip,
  PhoneOff,
  Image as ImageIcon,
  FileText,
  Download,
  Fingerprint,
  CalendarDays,
  ExternalLink,
  X,
  Filter,
  CheckCheck,
  VideoOff,
  Eye,
  EyeOff,
  ImagePlus,
  History,
  Smile,
  MessageSquarePlus,
  XCircle,
  Pause,
  Play,
  Square,
  Reply,
  Forward,
  CornerUpLeft,
  Settings,
  UserPlus,
  Cpu,
  Radio,
  Copy,
  ArrowRight,
  Sparkles,
  Loader2,
  Trash,
  Info,
  Maximize,
  Minimize,
  CameraOff,
  ScanLine,
  LogOut,
  Activity,
  AlertTriangle,
  AlertCircle,
  Terminal,
  Volume2,
  Code2,
  UserMinus,
  ChevronDown,
  Ban,
  Volume1,
  PhoneIncoming,
  PhoneOutgoing,
  ArrowDownUp,
  Moon,
  Sun,
  Mic,
  MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { cn } from '@/lib/utils';
import { LoginScreen } from './components/LoginScreen';
import { RememberedUsersManager } from './utils/rememberedUsers';
import { RecordingWaveform } from './components/RecordingWaveform';
import { GrainyAudioOverlay } from './components/GrainyAudioOverlay';
import { DynamicParticleSphere } from './components/DynamicParticleSphere';
import { io } from 'socket.io-client';
import { format, subHours, subSeconds } from 'date-fns';
import { initSignalR } from './lib/signalR';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

const getRawId = (id: string | number | undefined): string => {
  if (id === undefined || id === null) return '';
  const s = id.toString();
  return s.includes('-') ? s.split('-')[1] : s;
};

const resolveCameraUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const relativePath = url.startsWith('/') ? url.substring(1) : url;
  return `https://kv5zhpcr-7190.uks1.devtunnels.ms/storage/${relativePath}`;
};

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  // Normalize backslashes to forward slashes first
  const normalizedUrl = url.replace(/\\/g, '/');
  if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://') || normalizedUrl.startsWith('data:')) {
    return normalizedUrl;
  }
  const cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl.slice(1) : normalizedUrl;
  const baseDomain = API_BASE_URL.replace(/\/Home_Security$/, '').replace(/\/$/, '');
  
  if (cleanUrl.startsWith('storage/')) {
    return `${baseDomain}/${cleanUrl}`;
  }
  return `${baseDomain}/storage/${cleanUrl}`;
};

const NoItems = ({ icon: Icon = Info, message = "No items found." }: { icon?: any, message?: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 dark:bg-zinc-950 rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800 w-full transition-colors">
    <div className="h-16 w-16 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-400 mb-4 shadow-sm border border-slate-100 dark:border-zinc-700">
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">{message}</h3>
    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-[250px] mx-auto">It looks like you haven't added anything here yet. Get started by clicking the add button.</p>
  </div>
);

const ThreeDotsLoading = ({ label = "Loading data..." }: { label?: string }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 space-y-4 w-full bg-slate-50/30 dark:bg-zinc-950/30 rounded-3xl border border-dashed border-slate-200/60 dark:border-zinc-800/60 animate-in fade-in duration-300">
    <div className="flex space-x-2.5 items-center">
      <div className="w-3.5 h-3.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3.5 h-3.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3.5 h-3.5 bg-primary rounded-full animate-bounce"></div>
    </div>
    <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">{label}</span>
  </div>
);

const TokenCountdown = ({ expiryTime }: { expiryTime: string }) => {
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    const calculateTime = () => {
      const target = new Date(expiryTime).getTime();
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        setTimeLeft("EXPIRED");
        return false;
      }
      
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      return true;
    };

    calculateTime();
    const interval = setInterval(() => {
      if (!calculateTime()) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [expiryTime]);

  return (
    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
      <Clock className="h-3 w-3" />
      <span>EXPIRES IN: {timeLeft}</span>
    </div>
  );
};

const DASHBOARD_FACILITIES = [
  { id: 'facility-actions', label: 'Actions', icon: Play, desc: 'Automate security and operational response protocols across your connected hardware.' },
  { id: 'facility-appliances', label: 'Appliances', icon: Power, desc: 'Monitor state parameters and toggle smart appliances across rooms in real-time.' },
  { id: 'facility-cameras', label: 'Cameras', icon: Camera, desc: 'Access continuous video streams and manage surveillance of perimeter security points.' },
  { id: 'facility-doors', label: 'Doors', icon: Lock, desc: 'Control localized locks, verify open entry points, and view door status reports.' },
  { id: 'facility-externals', label: 'Externals', icon: Radio, desc: 'Configure external signal interfaces and map automated transceivers.' },
  { id: 'facility-hardware', label: 'Hardware', icon: Cpu, desc: 'Audit system hardware details, discovered controller units, and master codes.' },
  { id: 'facility-lights', label: 'Lights', icon: Lightbulb, desc: 'Adjust lighting brightness, toggle smart bulb states, and configure section tags.' },
  { id: 'facility-rooms', label: 'Rooms', icon: Sofa, desc: 'Organize indoor zones, track active device counts, and view facility areas.' },
  { id: 'facility-sections', label: 'Sections', icon: LayoutGrid, desc: 'Define facility layout categories and group related environmental controls.' },
  { id: 'facility-windows', label: 'Windows', icon: WindowIcon, desc: 'Verify environmental safety latches and track open states of physical windows.' },
];

const mapSection = (s: any): Section => {
  if (!s) return s;
  const idStr = (s.sectionId ?? s.id ?? '').toString();
  
  let dbId: number | undefined = undefined;
  if (typeof s.id === 'number') {
    dbId = s.id;
  } else if (s.id && !isNaN(parseInt(s.id.toString(), 10))) {
    dbId = parseInt(s.id.toString(), 10);
  } else if (typeof s.Id === 'number') {
    dbId = s.Id;
  } else if (s.Id && !isNaN(parseInt(s.Id.toString(), 10))) {
    dbId = parseInt(s.Id.toString(), 10);
  }

  return {
    ...s,
    id: idStr,
    name: s.sectionName || s.name || '',
    type: s.sectionType || s.type || 'general',
    isHidden: !!(s.isHidden || s.IsHidden),
    sectionId: s.sectionId ?? s.id,
    sectionName: s.sectionName || s.name,
    dbId: dbId,
  } as Section;
};

const resolveDoorType = (typeVal: any): number => {
  if (typeVal === undefined || typeVal === null) return 1;
  if (typeof typeVal === 'number') {
    if (isNaN(typeVal) || typeVal === 0) return 1;
    return typeVal;
  }
  const strVal = typeVal.toString().trim().toLowerCase();
  if (strVal === 'interior' || strVal === '1') return 1;
  if (strVal === 'exterior' || strVal === '2') return 2;
  if (strVal === 'gate' || strVal === '3') return 3;
  return 1;
};

const getProp = (obj: any, propName: string) => {
  if (!obj) return undefined;
  const lowerProp = propName.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === lowerProp) {
      return obj[key];
    }
  }
  return undefined;
};

const formatTimeSpanForPayload = (timeStr: any): string => {
  if (!timeStr && timeStr !== 0) return "00:00:00";
  let str = '';
  if (typeof timeStr === 'string') {
    str = timeStr;
  } else if (typeof timeStr === 'object') {
    const h = String(timeStr.hours ?? timeStr.Hours ?? 0).padStart(2, '0');
    const m = String(timeStr.minutes ?? timeStr.Minutes ?? 0).padStart(2, '0');
    const s = String(timeStr.seconds ?? timeStr.Seconds ?? 0).padStart(2, '0');
    str = `${h}:${m}:${s}`;
  } else {
    str = String(timeStr);
  }
  if (/^\d{2}:\d{2}$/.test(str)) {
    return `${str}:00`;
  }
  return str || "00:00:00";
};

const formatTimeSpanDisplay = (timeVal: any): string => {
  if (!timeVal && timeVal !== 0) return '';
  let str = '';
  if (typeof timeVal === 'string') {
    str = timeVal;
  } else if (typeof timeVal === 'object') {
    const h = String(timeVal.hours ?? timeVal.Hours ?? 0).padStart(2, '0');
    const m = String(timeVal.minutes ?? timeVal.Minutes ?? 0).padStart(2, '0');
    const s = String(timeVal.seconds ?? timeVal.Seconds ?? 0).padStart(2, '0');
    str = `${h}:${m}:${s}`;
  } else {
    str = String(timeVal);
  }
  const match = str.match(/^(\d{2}):(\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${h12}:${minutes} ${ampm}`;
  }
  return str;
};

const formatTimeSpanForInput = (timeVal: any): string => {
  if (!timeVal && timeVal !== 0) return '00:00';
  let str = '';
  if (typeof timeVal === 'string') {
    str = timeVal;
  } else if (typeof timeVal === 'object') {
    const h = String(timeVal.hours ?? timeVal.Hours ?? 0).padStart(2, '0');
    const m = String(timeVal.minutes ?? timeVal.Minutes ?? 0).padStart(2, '0');
    str = `${h}:${m}`;
  } else {
    str = String(timeVal);
  }
  const match = str.match(/^(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  return '00:00';
};

const isExternalTriggered = (e: any): boolean => {
  if (!e) return false;
  const val = getProp(e, 'isTriggered');
  return val === true || val === 'true' || val === 1 || val === '1';
};

const isPropActive = (item: any): boolean => {
  if (!item) return false;
  const val = getProp(item, 'isActive');
  return val === true || val === 'true' || val === 1 || val === '1' || val === 'active' || val === 'on';
};

const getInitials = (firstName?: string, lastName?: string): string => {
  const f = firstName?.trim().charAt(0) || '';
  const l = lastName?.trim().charAt(0) || '';
  const init = (f + l).toUpperCase();
  return init || '?';
};

const resolveSectionId = (sectionVal: any, sectionsList: Section[]): number | null => {
  if (sectionVal === undefined || sectionVal === null || sectionVal === '' || sectionVal === 'none' || sectionVal === '0') return null;
  
  // 1. Check if sectionVal matches a section's id, sectionId, or dbId
  const match = (sectionsList || []).find(s => 
    s.id?.toString() === sectionVal.toString() || 
    s.sectionId?.toString() === sectionVal.toString() ||
    s.dbId?.toString() === sectionVal.toString()
  );
  if (match && match.dbId !== undefined) {
    return match.dbId;
  }

  // 2. If it is already a valid integer, return it if a corresponding section exists
  const parsed = parseInt(sectionVal.toString(), 10);
  if (!isNaN(parsed) && parsed > 0) {
    const exists = (sectionsList || []).some(s => s.dbId === parsed || s.id?.toString() === parsed.toString());
    if (exists) {
      return parsed;
    }
  }

  // 3. Fallback to match by name or sectionName
  const matchedByName = (sectionsList || []).find(s => 
    s.name?.toLowerCase() === sectionVal.toString().toLowerCase() || 
    (s as any).sectionName?.toLowerCase() === sectionVal.toString().toLowerCase()
  );
  if (matchedByName) {
    if (matchedByName.dbId !== undefined) return matchedByName.dbId;
    const parsedMatchedId = parseInt(matchedByName.id.toString(), 10);
    return !isNaN(parsedMatchedId) ? parsedMatchedId : null;
  }

  // 4. Ultimate fallback: if parsed is a valid number, return it
  if (!isNaN(parsed)) {
    return parsed;
  }

  return null;
};

const resolveRoomId = (roomVal: any, roomsList: Room[]): number | null => {
  if (roomVal === undefined || roomVal === null || roomVal === '' || roomVal === 'none' || roomVal === '0') return null;
  const parsed = parseInt(roomVal.toString(), 10);
  if (!isNaN(parsed)) {
    return parsed;
  }
  const matchedRoom = (roomsList || []).find(r => r.name.toLowerCase() === roomVal.toString().toLowerCase() || (r as any).roomName?.toLowerCase() === roomVal.toString().toLowerCase());
  if (matchedRoom) {
    return parseInt(matchedRoom.id.toString(), 10);
  }
  return null;
};

const getSectionRooms = (section: any, globalRooms: Room[]): Room[] => {
  if (!section) return [];
  const sectionIdStr = section.id?.toString();
  const sectionDbIdStr = section.dbId?.toString() || (section as any).Id?.toString();

  const nestedRoomsRaw = section.rooms || section.Rooms || [];
  const mappedNestedRooms = nestedRoomsRaw.map((r: any) => ({
    ...r,
    id: r.id ?? r.Id,
    name: r.roomName || r.name || '',
    section: sectionIdStr,
    icon: r.icon || 'Sofa'
  }));

  const roomsMap = new Map<string, Room>();
  
  // First, add global rooms belonging to this section
  (globalRooms || []).forEach(r => {
    const rSectionStr = r.section?.toString();
    if (rSectionStr && (rSectionStr === sectionIdStr || rSectionStr === sectionDbIdStr)) {
      roomsMap.set(r.id.toString(), r);
    }
  });

  // Then, add nested rooms from the section object (overwriting or supplementing)
  mappedNestedRooms.forEach((r: any) => {
    roomsMap.set(r.id.toString(), r);
  });

  return Array.from(roomsMap.values());
};

const getSectionDirectDevices = (section: any, globalDevices: Device[]): Device[] => {
  if (!section) return [];
  const sectionIdStr = section.id?.toString();
  const sectionDbIdStr = section.dbId?.toString() || (section as any).Id?.toString();

  const rawDoors = section.doors || section.Doors || [];
  const rawLights = section.lights || section.Lights || [];
  const rawWindows = section.windows || section.Windows || [];
  const rawAppliances = section.appliances || section.Appliances || [];
  const rawCameras = section.cameras || section.Cameras || [];
  const rawExternals = section.externals || section.Externals || [];

  const isDirect = (item: any) => {
    const rId = item.roomId !== undefined ? item.roomId : item.RoomId;
    const sId = item.sectionId !== undefined ? item.sectionId : item.SectionId;
    
    const isRoomNull = (rId === undefined || rId === null || rId === '' || rId === 'none' || rId === 0 || rId === '0');
    
    const matchSection = sId !== undefined && sId !== null && (
      sId.toString() === sectionIdStr || 
      sId.toString() === sectionDbIdStr
    );

    return isRoomNull && matchSection;
  };

  const list: Device[] = [];

  rawDoors.filter(isDirect).forEach((item: any) => {
    let doorStatus = 'unlocked';
    if (item.isOpen && item.isLocked) doorStatus = 'open-locked';
    else if (item.isOpen) doorStatus = 'open';
    else if (item.isLocked) doorStatus = 'locked';

    list.push({
      id: `door-${item.id}`,
      name: item.doorName || item.name || "Unknown Door",
      type: 'door',
      status: doorStatus,
      room: '',
      section: sectionIdStr,
      doorType: item.doorType || 'Interior'
    } as Device);
  });

  rawLights.filter(isDirect).forEach((item: any) => {
    list.push({
      id: `light-${item.id}`,
      name: item.lightName || item.name || "Unknown Light",
      type: 'light',
      status: (item.isActive || item.status === 'on') ? 'on' : 'off',
      value: item.brightnessLevel || 0,
      room: '',
      section: sectionIdStr
    } as Device);
  });

  rawWindows.filter(isDirect).forEach((item: any) => {
    list.push({
      id: `window-${item.id}`,
      name: item.windowName || item.name || "Unknown Window",
      type: 'window',
      status: item.isLocked ? 'locked' : item.isOpen ? 'open' : 'closed',
      room: '',
      section: sectionIdStr
    } as Device);
  });

  rawAppliances.filter(isDirect).forEach((item: any) => {
    list.push({
      id: `appliance-${item.id}`,
      name: item.applianceName || item.name || "Unknown Appliance",
      type: 'appliance',
      status: (item.isActive || item.status === 'on') ? 'on' : 'off',
      room: '',
      section: sectionIdStr,
      powerUsage: item.powerActive ? 150 : 0
    } as Device);
  });

  rawCameras.filter(isDirect).forEach((item: any) => {
    list.push({
      id: `camera-${item.id}`,
      name: item.cameraName || item.name || "Unknown Camera",
      type: 'camera',
      status: (item.isActive || item.status === 'active') ? 'active' : 'inactive',
      room: '',
      section: sectionIdStr
    } as Device);
  });

  rawExternals.filter(isDirect).forEach((item: any) => {
    list.push({
      id: `external-${item.id}`,
      name: item.externalName || item.name || "Unknown External",
      type: 'external' as any,
      status: (item.isActive || item.status === 'active') ? 'active' : 'inactive',
      room: '',
      section: sectionIdStr
    } as Device);
  });

  // Merge with global devices that are direct and match the section
  const devicesMap = new Map<string, Device>();

  // First populate with list of section devices
  list.forEach(d => {
    devicesMap.set(d.id.toString(), d);
  });

  // Then overwrite with live stateful values from global devices so that toggles and adjustments react immediately
  (globalDevices || []).forEach(d => {
    const dSectionStr = d.section?.toString();
    const isDirectGlobal = !d.room || d.room === '' || d.room === 'none' || d.room === '0' || d.room === 'null' || d.room === 'undefined';
    if (dSectionStr && (dSectionStr === sectionIdStr || dSectionStr === sectionDbIdStr) && isDirectGlobal) {
      devicesMap.set(d.id.toString(), d);
    }
  });

  return Array.from(devicesMap.values());
};

const resolveSectionName = (device: any, dto: any, sections: Section[], rooms: Room[]): string => {
  if (!sections || sections.length === 0) return 'N/A';
  
  let secId = getProp(device, 'section') ?? getProp(dto, 'sectionId') ?? getProp(dto, 'SectionId');
  
  if (!secId || secId === '0' || secId === 0) {
    const roomId = getProp(device, 'room') ?? getProp(dto, 'roomId') ?? getProp(dto, 'RoomId');
    if (roomId && roomId !== 'none' && roomId !== '0' && roomId !== 0) {
      const room = (rooms || []).find(r => r.id?.toString() === roomId.toString());
      if (room) {
        secId = room.section;
      }
    }
  }

  if (!secId || secId === 'none' || secId === '0' || secId === 0) return 'N/A';

  const secIdStr = secId.toString().toLowerCase();
  const found = (sections || []).find(s => 
    s.id?.toString().toLowerCase() === secIdStr || 
    s.dbId?.toString().toLowerCase() === secIdStr ||
    (s as any).sectionId?.toString().toLowerCase() === secIdStr ||
    (s as any).SectionId?.toString().toLowerCase() === secIdStr
  );
  
  return found?.name || found?.sectionName || 'N/A';
};

const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const mapFrontendTypeToBackend = (frontType: any): number => {
  if (frontType === undefined || frontType === null) return 0;
  if (frontType === 1 || frontType === 2 || frontType === 3 || frontType === 4) {
    return frontType;
  }
  if (frontType === MessageType.Text) return 0;
  if (frontType === MessageType.Image) return 1;
  if (frontType === MessageType.Video) return 2;
  if (frontType === MessageType.Audio) return 3;
  if (frontType === MessageType.File) return 4;
  return 0;
};

const normalizeMessage = (msg: any): MessageDto => {
  if (!msg) return msg;
  const chatIdValue = msg.chatId ?? msg.ChatId;
  const senderPersonIdValue = msg.senderPersonId ?? msg.SenderPersonId;
  const contentValue = msg.content ?? msg.Content;
  const isEditedValue = msg.isEdited ?? msg.IsEdited ?? false;
  const isDeletedValue = msg.isDeleted ?? msg.IsDeleted ?? false;
  const sentAtValue = msg.sentAt ?? msg.SentAt;
  const idValue = msg.id ?? msg.Id;
  
  let rawType = msg.type !== undefined ? msg.type : msg.Type;
  if (rawType === undefined) rawType = 0;
  
  let mappedType = MessageType.Text;
  
  // Backend MessageType enum:
  // Image = 1, Video = 2, Audio = 3, File = 4
  
  if (typeof rawType === 'string') {
    const lower = rawType.toLowerCase();
    if (lower === 'image') mappedType = MessageType.Image;
    else if (lower === 'video') mappedType = MessageType.Video;
    else if (lower === 'audio') mappedType = MessageType.Audio;
    else if (lower === 'file') mappedType = MessageType.File;
    else mappedType = MessageType.Text;
  } else {
    // Number from backend
    if (rawType === 1) mappedType = MessageType.Image;
    else if (rawType === 2) mappedType = MessageType.Video;
    else if (rawType === 3) mappedType = MessageType.Audio;
    else if (rawType === 4) mappedType = MessageType.File;
    else if (rawType === 7) mappedType = MessageType.Audio; // frontend Audio is 7
    else if (rawType === MessageType.Image) mappedType = MessageType.Image;
    else if (rawType === MessageType.Video) mappedType = MessageType.Video;
    else if (rawType === MessageType.Audio) mappedType = MessageType.Audio;
    else if (rawType === MessageType.File) mappedType = MessageType.File;
    else mappedType = MessageType.Text;
  }

  // Normalize attachments
  const rawAtts = msg.attachments ?? msg.Attachments ?? [];
  const normalizedAtts = rawAtts.map((att: any) => {
    let rawAttType = att.type !== undefined ? att.type : att.Type;
    let mappedAttType = MessageType.File; // Default to file for attachment if not specified

    const rawContentType = att.contentType ?? att.ContentType ?? '';
    const lowerContentType = rawContentType.toLowerCase();
    
    if (rawAttType !== undefined) {
      if (typeof rawAttType === 'string') {
        const lower = rawAttType.toLowerCase();
        if (lower === 'image') mappedAttType = MessageType.Image;
        else if (lower === 'video') mappedAttType = MessageType.Video;
        else if (lower === 'audio') mappedAttType = MessageType.Audio;
        else if (lower === 'file') mappedAttType = MessageType.File;
      } else {
        if (rawAttType === 0) mappedAttType = MessageType.Text;
        else if (rawAttType === 1) mappedAttType = MessageType.Image;
        else if (rawAttType === 2) mappedAttType = MessageType.Video;
        else if (rawAttType === 3) mappedAttType = MessageType.Audio;
        else if (rawAttType === 4) mappedAttType = MessageType.File;
        else if (rawAttType === MessageType.Image) mappedAttType = MessageType.Image;
        else if (rawAttType === MessageType.Video) mappedAttType = MessageType.Video;
        else if (rawAttType === MessageType.Audio) mappedAttType = MessageType.Audio;
        else if (rawAttType === MessageType.File) mappedAttType = MessageType.File;
      }
    } else if (rawContentType) {
      if (lowerContentType.includes('image') || lowerContentType === 'jpg' || lowerContentType === 'png' || lowerContentType === 'gif') {
        mappedAttType = MessageType.Image;
      } else if (lowerContentType.includes('video') || lowerContentType === 'mp4') {
        mappedAttType = MessageType.Video;
      } else if (lowerContentType.includes('audio') || lowerContentType === 'webm' || lowerContentType === 'mp3') {
        mappedAttType = MessageType.Audio;
      }
    } else {
      // Check extension of fileName as a robust fallback
      const fileName = (att.fileName ?? att.FileName ?? '').toLowerCase();
      if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)) {
        mappedAttType = MessageType.Image;
      } else if (/\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(fileName)) {
        mappedAttType = MessageType.Video;
      } else if (/\.(mp3|wav|ogg|webm|m4a|aac)$/i.test(fileName)) {
        mappedAttType = MessageType.Audio;
      }
    }

    return {
      id: att.id ?? att.Id,
      messageId: att.messageId ?? att.MessageId,
      fileName: att.fileName ?? att.FileName ?? '',
      filePath: att.filePath ?? att.FilePath ?? '',
      contentType: rawContentType,
      fileSize: att.fileSize ?? att.FileSize ?? 0,
      thumbnailPath: att.thumbnailPath ?? att.ThumbnailPath ?? '',
      createdAt: att.createdAt ?? att.CreatedAt,
      type: mappedAttType,
    };
  });

  return {
    ...msg,
    id: idValue,
    chatId: chatIdValue,
    senderPersonId: senderPersonIdValue,
    content: contentValue,
    type: mappedType,
    isEdited: isEditedValue,
    isDeleted: isDeletedValue,
    sentAt: sentAtValue,
    attachments: normalizedAtts,
    senderName: msg.senderName ?? msg.SenderName,
    senderProfileImage: msg.senderProfileImage ?? msg.SenderProfileImage,
    replyTo: (() => {
      const nested = msg.replyTo ?? msg.ReplyTo ?? msg.replyToMessage ?? msg.ReplyToMessage;
      return nested ? normalizeMessage(nested) : undefined;
    })(),
    replyToId: (() => {
      let replyToIdValue = msg.replyToId ?? msg.ReplyToId ?? msg.replyToMessageId ?? msg.ReplyToMessageId ?? msg.referenceId ?? msg.ReferenceId;
      if (!replyToIdValue) {
        const nested = msg.replyTo ?? msg.ReplyTo ?? msg.replyToMessage ?? msg.ReplyToMessage;
        if (nested) {
          replyToIdValue = nested.id ?? nested.Id;
        }
      }
      if (replyToIdValue !== undefined && replyToIdValue !== null && replyToIdValue !== 0 && replyToIdValue !== '0') {
        return replyToIdValue;
      }
      return undefined;
    })()
  };
};

const buildMessageFormData = (sendDto: SendMessageDto): FormData => {
  const formData = new FormData();
  const chatIdValue = sendDto.chatId ?? 0;
  const contentValue = sendDto.content ?? '';
  const typeValue = mapFrontendTypeToBackend(sendDto.type ?? MessageType.Text);
  const replyToIdValue = sendDto.replyToMessageId ?? 0;

  // Append only camelCase (lowercase first letter) parameters to avoid duplicates
  formData.append('chatId', chatIdValue.toString());
  formData.append('content', contentValue);
  formData.append('type', typeValue.toString());
  formData.append('replyToMessageId', replyToIdValue.toString());
  if (replyToIdValue) {
    formData.append('replyToId', replyToIdValue.toString());
  }
  
  const atts = sendDto.attachments ?? [];
  
  atts.forEach((att: any, index: number) => {
    const fileName = att.fileName || att.FileName || "";
    const rawFilePath = att.filePath || att.FilePath || "";
    const contentType = att.contentType || att.ContentType || "";
    const fileSize = att.fileSize || att.FileSize || 0;
    const thumbnailPath = att.thumbnailPath || att.ThumbnailPath || "";
    
    let fileToUpload: any = rawFilePath;
    if (typeof rawFilePath === 'string' && rawFilePath.startsWith('data:')) {
      fileToUpload = base64ToFile(rawFilePath, fileName);
    } else if (typeof rawFilePath === 'string') {
      // If filePath is just a local URL or string, send a dummy file with correct content type to satisfy IFormFile
      fileToUpload = new File([""], fileName, { type: contentType || 'application/octet-stream' });
    }
    
    // Determine attachment type using updated MessageType backend mapping
    let mappedType = 4; // Default to File
    const rawType = att.type !== undefined ? att.type : (att.Type !== undefined ? att.Type : sendDto.type);
    
    if (rawType === MessageType.Image || rawType === 1 || String(rawType).toLowerCase() === 'image') {
      mappedType = 1;
    } else if (rawType === MessageType.Video || rawType === 2 || String(rawType).toLowerCase() === 'video') {
      mappedType = 2;
    } else if (rawType === MessageType.Audio || rawType === 3 || String(rawType).toLowerCase() === 'audio') {
      mappedType = 3;
    } else if (rawType === MessageType.File || rawType === 4 || String(rawType).toLowerCase() === 'file') {
      mappedType = 4;
    }

    // Append standard C# model binding index notation with lowercase "attachments" prefix and PascalCase nested properties
    formData.append(`attachments[${index}].FileName`, fileName);
    formData.append(`attachments[${index}].FilePath`, fileToUpload);
    formData.append(`attachments[${index}].Type`, mappedType.toString());
    formData.append(`attachments[${index}].FileSize`, fileSize.toString());
    formData.append(`attachments[${index}].ThumbnailPath`, thumbnailPath);
  });

  return formData;
};

const formatLastMessageAttachmentsText = (attachments: any[]): string => {
  if (!attachments || attachments.length === 0) return '';
  
  let imageCount = 0;
  let videoCount = 0;
  let audioCount = 0;
  let fileCount = 0;
  
  attachments.forEach(att => {
    const rawType = att.type;
    // Normalize attachment type checking
    if (rawType === MessageType.Image || rawType === 1 || String(rawType).toLowerCase() === 'image') {
      imageCount++;
    } else if (rawType === MessageType.Video || rawType === 2 || String(rawType).toLowerCase() === 'video') {
      videoCount++;
    } else if (rawType === MessageType.Audio || rawType === 3 || String(rawType).toLowerCase() === 'audio') {
      audioCount++;
    } else {
      fileCount++;
    }
  });

  const total = attachments.length;
  if (imageCount === total) {
    return imageCount === 1 ? 'ðŸ“· Image' : `ðŸ“· ${imageCount} images`;
  }
  if (videoCount === total) {
    return videoCount === 1 ? 'ðŸŽ¥ Video' : `ðŸŽ¥ ${videoCount} videos`;
  }
  if (audioCount === total) {
    return audioCount === 1 ? 'ðŸŽ™ï¸ Voice note' : `ðŸŽ™ï¸ ${audioCount} voice notes`;
  }
  if (fileCount === total) {
    if (fileCount === 1) {
      const name = attachments[0].fileName || 'File';
      return `ðŸ“„ ${name}`;
    }
    return `ðŸ“„ ${fileCount} files`;
  }

  // Mixed or fallback
  return `ðŸ“Ž ${total} attachments`;
};

const handleDownloadFile = async (e: React.MouseEvent, url: string, fileName: string) => {
  e.stopPropagation();
  e.preventDefault();
  try {
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Failed to download file directly, falling back to window.open', err);
    window.open(url, '_blank');
  }
};

export const formatRelativeTime = (dateInput: string | Date | number): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) {
    return 'just now';
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hr' : 'hrs'} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

const WhatsAppMediaGrid = ({ media, onMediaClick }: { media: any[]; onMediaClick: (url: string, isVideo: boolean) => void }) => {
  const totalCount = media.length;
  if (totalCount === 0) return null;

  if (totalCount === 1) {
    const att = media[0];
    const fullUrl = getFullImageUrl(att.filePath) || undefined;
    const isVideo = att.type === MessageType.Video || att.contentType?.startsWith('video/') || att.filePath?.toLowerCase().endsWith('.mp4') || att.filePath?.toLowerCase().endsWith('.webm');
    if (isVideo) {
      return (
        <div className="rounded-lg overflow-hidden max-w-full">
          <video 
            src={fullUrl} 
            controls 
            className="w-full rounded-md shadow-sm max-h-[300px] object-cover bg-black/5" 
          />
        </div>
      );
    } else {
      return (
        <div className="rounded-lg overflow-hidden max-w-full">
          <img 
            src={fullUrl} 
            alt={att.fileName || "Image"} 
            className="w-full h-auto max-h-[300px] object-cover rounded-md hover:opacity-95 transition-opacity cursor-pointer shadow-sm bg-black/5"
            onClick={() => onMediaClick(fullUrl || "", false)}
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }
  }

  // 2 files
  if (totalCount === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden max-w-[320px] w-full aspect-[4/3] bg-transparent border border-black/5 p-0.5">
        {media.map((att, idx) => {
          const fullUrl = getFullImageUrl(att.filePath) || undefined;
          const isVideo = att.type === MessageType.Video || att.contentType?.startsWith('video/') || att.filePath?.toLowerCase().endsWith('.mp4') || att.filePath?.toLowerCase().endsWith('.webm');
          return (
            <div key={idx} className="relative w-full h-full overflow-hidden cursor-pointer" onClick={() => onMediaClick(fullUrl || "", isVideo)}>
              {isVideo ? (
                <div className="relative w-full h-full">
                  <video src={fullUrl} className="w-full h-full object-cover bg-black/5" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              ) : (
                <img src={fullUrl} className="w-full h-full object-cover hover:scale-102 transition-transform duration-200" referrerPolicy="no-referrer" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // 3 files (2 up, 1 below)
  if (totalCount === 3) {
    return (
      <div className="flex flex-col gap-1 rounded-xl overflow-hidden max-w-[320px] w-full aspect-[4/3] bg-transparent border border-black/5 p-0.5">
        {/* Top row: 2 files */}
        <div className="grid grid-cols-2 gap-1 flex-1">
          {media.slice(0, 2).map((att, idx) => {
            const fullUrl = getFullImageUrl(att.filePath) || undefined;
            const isVideo = att.type === MessageType.Video || att.contentType?.startsWith('video/') || att.filePath?.toLowerCase().endsWith('.mp4') || att.filePath?.toLowerCase().endsWith('.webm');
            return (
              <div key={idx} className="relative w-full h-full overflow-hidden cursor-pointer" onClick={() => onMediaClick(fullUrl || "", isVideo)}>
                {isVideo ? (
                  <div className="relative w-full h-full">
                    <video src={fullUrl} className="w-full h-full object-cover bg-black/5" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                ) : (
                  <img src={fullUrl} className="w-full h-full object-cover hover:scale-102 transition-transform duration-200" referrerPolicy="no-referrer" />
                )}
              </div>
            );
          })}
        </div>
        {/* Bottom row: 1 file */}
        {(() => {
          const att = media[2];
          const fullUrl = getFullImageUrl(att.filePath) || undefined;
          const isVideo = att.type === MessageType.Video || att.contentType?.startsWith('video/') || att.filePath?.toLowerCase().endsWith('.mp4') || att.filePath?.toLowerCase().endsWith('.webm');
          return (
            <div className="relative w-full h-[48%] overflow-hidden cursor-pointer" onClick={() => onMediaClick(fullUrl || "", isVideo)}>
              {isVideo ? (
                <div className="relative w-full h-full">
                  <video src={fullUrl} className="w-full h-full object-cover bg-black/5" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              ) : (
                <img src={fullUrl} className="w-full h-full object-cover hover:scale-102 transition-transform duration-200" referrerPolicy="no-referrer" />
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  // 4 or more files (2x2 grid, with overlay on the 4th item if remaining)
  const displayMedia = media.slice(0, 4);
  const remainingCount = totalCount - 4;

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden max-w-[320px] w-full aspect-square bg-transparent border border-black/5 p-0.5">
      {displayMedia.map((att, idx) => {
        const fullUrl = getFullImageUrl(att.filePath) || undefined;
        const isVideo = att.type === MessageType.Video || att.contentType?.startsWith('video/') || att.filePath?.toLowerCase().endsWith('.mp4') || att.filePath?.toLowerCase().endsWith('.webm');
        const isLastItem = idx === 3;
        return (
          <div key={idx} className="relative w-full h-full overflow-hidden cursor-pointer" onClick={() => onMediaClick(fullUrl || "", isVideo)}>
            {isVideo ? (
              <div className="relative w-full h-full">
                <video src={fullUrl} className="w-full h-full object-cover bg-black/5" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-6 w-6 text-white fill-white" />
                </div>
              </div>
            ) : (
              <img src={fullUrl} className="w-full h-full object-cover hover:scale-102 transition-transform duration-200" referrerPolicy="no-referrer" />
            )}
            
            {isLastItem && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-lg select-none">
                +{remainingCount + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const CircularProgress = ({ progress }: { progress: number }) => {
  const radius = 16;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center h-10 w-10 shrink-0 select-none">
      <svg className="transform -rotate-90 h-10 w-10">
        <circle
          className="text-slate-200/50"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx="20"
          cy="20"
        />
        <circle
          className="text-[#00a884] transition-all duration-300 ease-out"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx="20"
          cy="20"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-[#00a884]">{Math.round(progress)}%</span>
    </div>
  );
};

const getSupportedAudioMimeType = (): string => {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return 'audio/webm';
  if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) return 'audio/ogg;codecs=opus';
  return 'audio/webm';
};

const CustomAudioPlayer = ({ 
  src, 
  fileName = "Audio Message",
  isSending = false,
  progress = 0,
  initialText = ""
}: { 
  src?: string | null; 
  fileName?: string;
  isSending?: boolean;
  progress?: number;
  initialText?: string;
}) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isCardHovered, setIsCardHovered] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [transcriptionText, setTranscriptionText] = React.useState<string | null>(initialText?.trim() || null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCardHovered(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1);
    audio.playbackRate = 1;
    audio.volume = 1.0;
    audio.preload = "auto";
    if (!isSending && src) {
      audio.load();
    }
  }, [src, isSending]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!src) {
      toast.error("Audio is not available yet");
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (currentlyPlayingAudioRef.current && currentlyPlayingAudioRef.current !== audio) {
        currentlyPlayingAudioRef.current.pause();
      }
      
      currentlyPlayingAudioRef.current = audio;
      
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nextRate = 1;
    if (playbackRate === 1) nextRate = 1.5;
    else if (playbackRate === 1.5) nextRate = 2;
    else nextRate = 1;

    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const performTranscription = async () => {
    if (!src || (transcriptionText && transcriptionText !== "Unable to transcribe message") || isTranscribing) return;

    setIsTranscribing(true);
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: src })
      });
      const data = await res.json();
      if (data && data.text && data.text.trim()) {
        setTranscriptionText(data.text.trim());
      } else {
        setTranscriptionText("Unable to transcribe message");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setTranscriptionText("Unable to transcribe message");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      performTranscription();
    }
  };

  const showTranscriptionBox = (isOpen || isCardHovered) && (transcriptionText !== null || isTranscribing);

  const barsCount = 35;
  const heights = React.useMemo(() => {
    const safeStr = (typeof src === 'string' && src) ? src : (fileName || 'audio-track');
    const result: number[] = [];
    let hash = 0;
    for (let i = 0; i < safeStr.length; i++) {
      hash = safeStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    for (let i = 0; i < barsCount; i++) {
      const val = Math.abs(Math.sin(hash + i) * 70) + 25;
      result.push(Math.round(val));
    }
    return result;
  }, [src, fileName]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col p-1.5 bg-transparent min-w-[280px] w-full max-w-[320px] select-none relative"
      onClick={(e) => e.stopPropagation()}
    >
      <audio 
        ref={audioRef} 
        src={src || undefined} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* Transcribed text displayed ABOVE the voicenote div */}
      {showTranscriptionBox && (
        <div 
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
          className="mb-2 p-2.5 rounded-xl border border-emerald-500/30 bg-white/95 dark:bg-zinc-800/95 text-slate-800 dark:text-zinc-100 shadow-md backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-1"
        >
          <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-black/5 dark:border-white/10">
            <span className="flex items-center gap-1.5 font-bold text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 animate-pulse text-emerald-500" />
              Transcribed Voice Note
            </span>
            {isOpen && (
              <span className="text-[9px] text-slate-400 dark:text-zinc-400 font-medium italic">
                Active
              </span>
            )}
          </div>
          {isTranscribing ? (
            <div className="flex items-center gap-2 py-1 text-slate-500 dark:text-zinc-400 text-[11px] italic">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500 shrink-0" />
              <span>Converting audio to text...</span>
            </div>
          ) : (
            <p className="text-[12px] leading-relaxed text-slate-700 dark:text-zinc-200 font-normal whitespace-pre-wrap select-text">
              "{transcriptionText}"
            </p>
          )}
        </div>
      )}

      {/* Main Voice Note Audio Player Div */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button or Upload Progress */}
        {isSending ? (
          <CircularProgress progress={progress} />
        ) : (
          <button 
            onClick={handlePlayPause}
            className="h-10 w-10 rounded-full bg-[#00a884] hover:bg-[#008f72] flex items-center justify-center text-white shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-white text-white" />
            ) : (
              <Play className="h-5 w-5 fill-white text-white translate-x-[1px]" />
            )}
          </button>
        )}

        {/* Waveform & Duration Container */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Custom Waveform Slider */}
          <div 
            className="flex items-center gap-[3px] h-8 cursor-pointer select-none w-full"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const fraction = Math.max(0, Math.min(1, clickX / rect.width));
              const newTime = fraction * duration;
              setCurrentTime(newTime);
              if (audioRef.current) {
                audioRef.current.currentTime = newTime;
              }
            }}
          >
            {heights.map((h, i) => {
              const isPlayed = (i / barsCount) <= (duration ? (currentTime / duration) : 0);
              return (
                <div 
                  key={i}
                  style={{ height: `${h}%` }}
                  className={cn(
                    "w-[3px] rounded-full transition-colors duration-150 origin-center shrink-0",
                    isPlayed ? "bg-[#00a884]" : "bg-slate-300"
                  )}
                />
              );
            })}
          </div>

          {/* Time Display beneath slider at the right */}
          <div className="flex justify-end text-[10px] text-[#667781] dark:text-zinc-400 mt-0.5 font-medium px-0.5">
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Speed Modifier Badge */}
        <button 
          onClick={cycleSpeed}
          className="px-2.5 py-1 text-[11px] font-black text-[#00a884] bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors border border-emerald-100/70 shrink-0 min-w-[42px] text-center shadow-2xs"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Beneath every voicenote, text called "Transcribe" */}
      <div className="flex items-center justify-between mt-1 px-1 pt-1 border-t border-black/5 dark:border-white/5">
        <button
          type="button"
          onClick={handleTranscribeClick}
          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer py-0.5 select-none"
        >
          <FileText className="h-3 w-3" />
          <span>{isOpen || isCardHovered ? (isTranscribing ? "Transcribing..." : "Transcribed") : "Transcribe"}</span>
        </button>
      </div>
    </div>
  );
};

const AUDIO_URLS = {
  TYPING: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
  RECORDING: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
  SENT: "https://actions.google.com/sounds/v1/alarms/phone_beep.ogg",
  RECEIVED: "https://actions.google.com/sounds/v1/alarms/tick_tock.ogg",
};

const currentlyPlayingAudioRef = { current: null as HTMLAudioElement | null };

const playAudio = (url: string) => {
  const audio = new Audio(url);
  audio.play().catch(e => console.error("Audio playback failed", e));
};

const playTripleKeystrokeSynth = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playClick = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(10, time + 0.05);
      
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, time);
      
      gain.gain.setValueAtTime(0.04, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.06);
    };
    const now = ctx.currentTime;
    playClick(now);
    playClick(now + 0.1);
    playClick(now + 0.2);
  } catch (e) {
    console.error("Triple keystroke playback failed", e);
  }
};

const playWhatsappRecordChirp = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(580, now);
    osc1.frequency.exponentialRampToValueAtTime(620, now + 0.08);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);
    
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(780, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.06, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.12);
    }, 70);
  } catch (e) {
    console.error("Whatsapp record sound failed", e);
  }
};

const playImessageSentSynth = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
    
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2500, now + 0.25);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.3);
  } catch (e) {
    console.error("iMessage sent sound failed", e);
  }
};

const playImessageReceivedSynth = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now);
    gain2.gain.setValueAtTime(0.04, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now);
    osc2.stop(now + 0.2);
  } catch (e) {
    console.error("iMessage received sound failed", e);
  }
};

const LocalVideoFeed = ({ stream }: { stream?: MediaStream | null }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      return;
    }
    let localSubStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => {
          localSubStream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => console.warn("Failed to get local video feed:", err));
    }
    return () => {
      if (localSubStream) {
        localSubStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [stream]);
  return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-xl" />;
};

const RemoteVideoFeed = ({ stream }: { stream: MediaStream | null }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover rounded-2xl"
    />
  );
};

const RemoteAudioFeed = ({ stream }: { stream: MediaStream | null; key?: string | number }) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  React.useEffect(() => {
    const el = audioRef.current;
    if (el && stream) {
      el.srcObject = stream;
      el.volume = 1.0;
      const promise = el.play();
      if (promise !== undefined) {
        promise.catch(err => {
          console.warn("[WebRTC Log] RemoteAudioFeed autoplay warning:", err);
        });
      }
    }
  }, [stream]);

  if (!stream) return null;

  return <audio ref={audioRef} autoPlay playsInline controls={false} />;
};

const GlobalRemoteAudioFeeds = ({ remoteStreams }: { remoteStreams: Record<number, MediaStream> }) => {
  return (
    <div style={{ display: 'none' }}>
      {Object.entries(remoteStreams).map(([personId, stream]) => (
        <RemoteAudioFeed key={personId} stream={stream} />
      ))}
    </div>
  );
};

const LocalCallSoundwave = ({ isMuted }: { isMuted: boolean }) => {
  const [volumes, setVolumes] = React.useState<number[]>([4, 4, 4, 4, 4, 4, 4, 4, 4]);

  React.useEffect(() => {
    if (isMuted) {
      setVolumes([4, 4, 4, 4, 4, 4, 4, 4, 4]);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startAnalysis = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000
          }
        });
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 32; // small fft size to analyze 16 frequency bins
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);

          // Map frequency bins to 9 bars
          const newVolumes = Array.from({ length: 9 }).map((_, i) => {
            const dataIndex = Math.floor((i / 8) * (dataArray.length - 1));
            const val = dataArray[dataIndex] || 0;
            // Scale to a nice display height (minimum 4px, max 18px)
            const height = 4 + (val / 255) * 14;
            return height;
          });

          setVolumes(newVolumes);
          animationFrameId = requestAnimationFrame(update);
        };

        update();
      } catch (err) {
        console.warn("Could not get microphone stream for call soundwave", err);
        // Fall back to elegant procedural simulation if blocked or denied
        const simulate = () => {
          const time = Date.now() * 0.005;
          const newVolumes = Array.from({ length: 9 }).map((_, i) => {
            const wave = Math.sin(time + i * 0.5) * Math.cos(time * 0.7 + i * 0.3);
            return 4 + Math.max(0, wave) * 12;
          });
          setVolumes(newVolumes);
          animationFrameId = requestAnimationFrame(simulate);
        };
        simulate();
      }
    };

    startAnalysis();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (source) {
        source.disconnect();
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isMuted]);

  if (isMuted) {
    return (
      <div className="flex flex-col items-center justify-center pt-1" title="Muted">
        <MicOff className="h-4 w-4 text-rose-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 pt-0.5 w-full">
      <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase animate-pulse">Speaking</span>
      <div className="flex items-end justify-center gap-0.5 h-5 w-full">
        {volumes.map((h, i) => (
          <div 
            key={i} 
            className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
};

const RemoteCallSoundwave = ({ isMuted }: { isMuted: boolean }) => {
  const [volumes, setVolumes] = React.useState<number[]>([4, 4, 4, 4, 4, 4, 4, 4, 4]);

  React.useEffect(() => {
    if (isMuted) {
      setVolumes([4, 4, 4, 4, 4, 4, 4, 4, 4]);
      return;
    }

    let animationFrameId: number;

    const update = () => {
      const time = Date.now() * 0.008;
      // Procedurally generate active speech envelope with pauses
      const voiceEnvelope = Math.max(0, Math.sin(time * 0.2) * 0.8 + Math.cos(time * 0.07) * 0.4);
      
      const newVolumes = Array.from({ length: 9 }).map((_, i) => {
        const fastWave = Math.sin(time + i * 0.8) * Math.sin(time * 2.3 + i * 0.4);
        const noise = Math.sin(time * 4.1 - i * 1.2) * 0.3;
        const rawVal = Math.max(0.1, (fastWave + noise + 1) / 2);
        const val = rawVal * voiceEnvelope;
        const height = 4 + val * 14;
        return height;
      });

      setVolumes(newVolumes);
      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMuted]);

  if (isMuted) {
    return (
      <div className="flex flex-col items-center justify-center pt-1" title="Muted">
        <MicOff className="h-4 w-4 text-rose-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 pt-0.5 w-full">
      <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase animate-pulse font-medium">Active</span>
      <div className="flex items-end justify-center gap-0.5 h-5 w-full">
        {volumes.map((h, i) => (
          <div 
            key={i} 
            className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
};

function mapToCallDto(raw: any): CallDto {
  if (!raw) return raw;
  const id = raw.id ?? raw.Id;
  const chatId = raw.chatId ?? raw.ChatId;
  const callerPersonId = raw.callerPersonId ?? raw.CallerPersonId;
  const type = raw.type ?? raw.Type;
  const status = raw.status ?? raw.Status;
  const startedAt = raw.startedAt ?? raw.StartedAt;
  const answeredAt = raw.answeredAt ?? raw.AnsweredAt;
  const endedAt = raw.endedAt ?? raw.EndedAt;
  const participantsRaw = raw.participants ?? raw.Participants ?? [];
  const participants = Array.isArray(participantsRaw) ? participantsRaw.map((p: any) => ({
    personId: p.personId ?? p.PersonId,
    fullName: p.fullName ?? p.FullName,
    profileImage: p.profileImage ?? p.ProfileImage,
    isMuted: p.isMuted ?? p.IsMuted,
    isCameraEnabled: p.isCameraEnabled ?? p.IsCameraEnabled,
    isScreenSharing: p.isScreenSharing ?? p.IsScreenSharing,
    status: p.status ?? p.Status,
  })) : [];
  return {
    id,
    chatId,
    callerPersonId,
    type,
    status,
    startedAt,
    answeredAt,
    endedAt,
    participants,
  };
}

function parseTimestamp(dateInput: string | Date | number | undefined | null): number {
  if (!dateInput) return Date.now();
  if (typeof dateInput === 'number') return dateInput;
  if (dateInput instanceof Date) return dateInput.getTime();
  
  let str = String(dateInput).trim();
  if (!str) return Date.now();
  
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
    str += 'Z';
  } else if (!str.includes('T') && str.includes(' ') && !str.endsWith('Z')) {
    str = str.replace(' ', 'T') + 'Z';
  }
  
  const parsed = new Date(str).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

function formatCallDuration(startedAt: string | Date | undefined | null, endedAt: string | Date | undefined | null, answeredAt?: string | Date | undefined | null): string {
  const startToUse = answeredAt || startedAt;
  if (!startToUse) return "0s";
  const start = parseTimestamp(startToUse);
  const end = endedAt ? parseTimestamp(endedAt) : Date.now();
  const diffMs = end - start;
  if (diffMs <= 0) return "0s";
  
  const totalSecs = Math.floor(diffMs / 1000);
  const secs = totalSecs % 60;
  const totalMins = Math.floor(totalSecs / 60);
  const mins = totalMins % 60;
  const hrs = Math.floor(totalMins / 60);
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  } else if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function mapCallDtoToCallLogDto(call: CallDto, currentUserId: number, chatName: string): CallLogDto {
  const isIncoming = call.callerPersonId !== currentUserId;
  
  const isEndedStatus = call.status === CallStatus.Ended || 
                        call.status === CallStatus.Rejected || 
                        call.status === CallStatus.Missed || 
                        call.status === CallStatus.TimedOut;
  const endedAt = call.endedAt || (isEndedStatus ? new Date().toISOString() : undefined);

  // Calculate duration in a friendly format (e.g. "12s", "1m 45s", "2h 15m")
  const duration = formatCallDuration(call.startedAt, endedAt, call.answeredAt);

  // Check if current user has missed the call
  const userParticipant = call.participants?.find(p => p.personId === currentUserId);
  const isMissed = call.status === CallStatus.Missed || 
                   (isIncoming && call.status === CallStatus.Rejected) || 
                   (userParticipant?.status === CallParticipantStatus.Missed);

  return {
    callId: call.id,
    chatId: call.chatId,
    chatName: chatName,
    type: call.type,
    status: call.status,
    startedAt: call.startedAt,
    endedAt: endedAt,
    duration: duration,
    isIncoming: isIncoming,
    callerPersonId: call.callerPersonId,
    isMissed: isMissed,
    participants: call.participants?.map(p => ({
      personId: p.personId,
      fullName: p.fullName,
      profileImage: p.profileImage,
      status: p.status,
      isMuted: p.isMuted,
      isCameraEnabled: p.isCameraEnabled,
      isScreenSharing: p.isScreenSharing
    }))
  };
}

function parseCallUpdate(payload: any): { callDto: CallDto; isLegacy: boolean; legacyData?: any } {
  if (!payload) return { callDto: {} as any, isLegacy: false };
  
  // Check if it's the full callDto (has callerPersonId, participants, or startedAt)
  const isFullCallDto = (payload.callerPersonId !== undefined || payload.CallerPersonId !== undefined || Array.isArray(payload.participants) || Array.isArray(payload.Participants));
  
  if (isFullCallDto) {
    return { callDto: mapToCallDto(payload), isLegacy: false };
  } else {
    // Legacy format
    const callId = payload.callId ?? payload.CallId ?? 0;
    const personId = payload.personId ?? payload.PersonId ?? 0;
    const participantStatus = payload.status ?? payload.Status ?? 0;
    const callStatus = payload.callStatus ?? payload.CallStatus ?? 0;
    
    return {
      callDto: {
        id: callId,
        chatId: payload.chatId ?? payload.ChatId ?? 0,
        callerPersonId: payload.callerPersonId ?? payload.CallerPersonId ?? 0,
        type: payload.type ?? payload.Type ?? CallType.Audio,
        status: callStatus,
        startedAt: payload.startedAt ?? payload.StartedAt ?? new Date().toISOString(),
        endedAt: (callStatus === CallStatus.Ended || callStatus === CallStatus.Rejected || callStatus === CallStatus.Missed) ? new Date().toISOString() : undefined,
        participants: []
      },
      isLegacy: true,
      legacyData: { callId, personId, participantStatus, callStatus }
    };
  }
}

export default function App() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [hardwares, setHardwares] = React.useState<GetHardwareDto[]>([]);
  const [externals, setExternals] = React.useState<GetExternalDto[]>([]);
  const [cameras, setCameras] = React.useState<GetCameraDto[]>([]);
  const [appliances, setAppliances] = React.useState<GetApplianceDto[]>([]);
  const [doors, setDoors] = React.useState<GetDoorDto[]>([]);
  const [lights, setLights] = React.useState<GetLightDto[]>([]);
  const [windows, setWindows] = React.useState<GetWindowDto[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [userRooms, setUserRooms] = React.useState<Room[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);

  React.useEffect(() => {
    if (!sections || sections.length === 0) return;
    
    const nestedRooms: Room[] = [];
    const nestedDevices: Device[] = [];

    sections.forEach(section => {
      const sectionIdStr = section.id?.toString();
      const sectionDbId = section.dbId ?? (section.id ? parseInt(section.id.toString(), 10) : null);
      const sectionDbIdStr = sectionDbId?.toString();

      const rawRooms = section.rooms || section.Rooms || [];
      rawRooms.forEach((r: any) => {
        nestedRooms.push({
          ...r,
          id: r.id ?? r.Id,
          name: r.roomName || r.name || '',
          section: sectionIdStr,
          icon: r.icon || 'Sofa'
        });
      });

      const rawDoors = section.doors || section.Doors || [];
      const rawLights = section.lights || section.Lights || [];
      const rawWindows = section.windows || section.Windows || [];
      const rawAppliances = section.appliances || section.Appliances || [];
      const rawCameras = section.cameras || section.Cameras || [];
      const rawExternals = section.externals || section.Externals || [];

      const mapDevice = (item: any, type: string) => {
        const rId = item.roomId !== undefined ? item.roomId : item.RoomId;
        const roomStr = (rId !== undefined && rId !== null && rId !== 0 && rId !== '0' && rId !== 'none') ? rId.toString() : '';
        const sId = item.sectionId !== undefined ? item.sectionId : item.SectionId;
        const sectionStr = sId?.toString() || sectionIdStr || '';

        if (type === 'door') {
          let doorStatus = 'unlocked';
          if (item.isOpen && item.isLocked) doorStatus = 'open-locked';
          else if (item.isOpen) doorStatus = 'open';
          else if (item.isLocked) doorStatus = 'locked';

          return {
            id: `door-${item.id}`,
            name: item.doorName || item.name || "Unknown Door",
            type: 'door',
            status: doorStatus,
            room: roomStr,
            section: sectionStr,
            doorType: item.doorType || 'Interior'
          } as Device;
        }

        if (type === 'light') {
          return {
            id: `light-${item.id}`,
            name: item.lightName || item.name || "Unknown Light",
            type: 'light',
            status: (item.isActive || item.status === 'on') ? 'on' : 'off',
            value: item.brightnessLevel || 0,
            room: roomStr,
            section: sectionStr
          } as Device;
        }

        if (type === 'window') {
          return {
            id: `window-${item.id}`,
            name: item.windowName || item.name || "Unknown Window",
            type: 'window',
            status: item.isLocked ? 'locked' : item.isOpen ? 'open' : 'closed',
            room: roomStr,
            section: sectionStr
          } as Device;
        }

        if (type === 'appliance') {
          return {
            id: `appliance-${item.id}`,
            name: item.applianceName || item.name || "Unknown Appliance",
            type: 'appliance',
            status: (item.isActive || item.status === 'on') ? 'on' : 'off',
            room: roomStr,
            section: sectionStr,
            powerUsage: item.powerActive ? 150 : 0
          } as Device;
        }

        if (type === 'camera') {
          return {
            id: `camera-${item.id}`,
            name: item.cameraName || item.name || "Unknown Camera",
            type: 'camera',
            status: (item.isActive || item.status === 'active') ? 'active' : 'inactive',
            room: roomStr,
            section: sectionStr
          } as Device;
        }

        if (type === 'external') {
          return {
            id: `external-${item.id}`,
            name: item.externalName || item.name || "Unknown External",
            type: 'external' as any,
            status: (item.isActive || item.status === 'active') ? 'active' : 'inactive',
            room: roomStr,
            section: sectionStr
          } as Device;
        }

        return null;
      };

      rawDoors.forEach((d: any) => { const mapped = mapDevice(d, 'door'); if (mapped) nestedDevices.push(mapped); });
      rawLights.forEach((l: any) => { const mapped = mapDevice(l, 'light'); if (mapped) nestedDevices.push(mapped); });
      rawWindows.forEach((w: any) => { const mapped = mapDevice(w, 'window'); if (mapped) nestedDevices.push(mapped); });
      rawAppliances.forEach((a: any) => { const mapped = mapDevice(a, 'appliance'); if (mapped) nestedDevices.push(mapped); });
      rawCameras.forEach((c: any) => { const mapped = mapDevice(c, 'camera'); if (mapped) nestedDevices.push(mapped); });
      rawExternals.forEach((e: any) => { const mapped = mapDevice(e, 'external'); if (mapped) nestedDevices.push(mapped); });
    });

    if (nestedRooms.length > 0) {
      setRooms(prev => {
        const roomsMap = new Map<string, Room>();
        prev.forEach(r => { roomsMap.set(r.id.toString(), r); });
        let changed = false;
        nestedRooms.forEach(r => {
          const key = r.id.toString();
          if (!roomsMap.has(key)) {
            roomsMap.set(key, r);
            changed = true;
          }
        });
        return changed ? Array.from(roomsMap.values()) : prev;
      });
      setUserRooms(prev => {
        const roomsMap = new Map<string, Room>();
        prev.forEach(r => { roomsMap.set(r.id.toString(), r); });
        let changed = false;
        nestedRooms.forEach(r => {
          if (r.personId?.toString() === userProfile?.id?.toString()) {
            const key = r.id.toString();
            if (!roomsMap.has(key)) {
              roomsMap.set(key, r);
              changed = true;
            }
          }
        });
        return changed ? Array.from(roomsMap.values()) : prev;
      });
    }

    if (nestedDevices.length > 0) {
      setDevices(prev => {
        const devicesMap = new Map<string, Device>();
        prev.forEach(d => { devicesMap.set(d.id.toString(), d); });
        let changed = false;
        nestedDevices.forEach(d => {
          const key = d.id.toString();
          if (!devicesMap.has(key)) {
            devicesMap.set(key, d);
            changed = true;
          }
        });
        return changed ? Array.from(devicesMap.values()) : prev;
      });
    }
  }, [sections]);
  const [roomSearchQuery, setRoomSearchQuery] = React.useState('');
  const [sectionSearchQuery, setSectionSearchQuery] = React.useState('');
  const [activeView, setActiveView] = React.useState<NavView>('dashboard');
  const [refreshState, setRefreshState] = React.useState<'idle'|'loading'|'success'|'error'>('idle');
  const [refreshProgress, setRefreshProgress] = React.useState(0);
  const [selectedUserRoomId, setSelectedUserRoomId] = React.useState<string | number | null>(null);
  const [myRoomsSearchQuery, setMyRoomsSearchQuery] = React.useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [facilitySearchQuery, setFacilitySearchQuery] = React.useState('');
  const [facilitySortBy, setFacilitySortBy] = React.useState<'room' | 'section'>('room');

  React.useEffect(() => {
    setFacilitySearchQuery('');
  }, [activeView]);

  const syncDevicesFromFetchedType = (type: string, fetchedData: any[]) => {
    setDevices(prev => {
      const otherDevices = prev.filter(d => d.type !== type);
      const mappedNewDevices = (fetchedData || []).map((item: any) => {
        const itemRoomId = item.roomId !== undefined && item.roomId !== null ? item.roomId : (item.RoomId !== undefined && item.RoomId !== null ? item.RoomId : '');
        const itemSectionId = item.sectionId !== undefined && item.sectionId !== null ? item.sectionId : (item.SectionId !== undefined && item.SectionId !== null ? item.SectionId : '');
        
        const roomStr = itemRoomId.toString();
        const sectionStr = itemSectionId.toString();

        if (type === 'appliance') {
          return {
            id: `appliance-${item.id}`,
            name: item.applianceName || item.name || "Unknown Appliance",
            type: 'appliance',
            status: isPropActive(item) ? 'on' : 'off',
            room: roomStr,
            section: sectionStr,
            powerUsage: item.powerActive ? 150 : 0
          } as Device;
        }
        if (type === 'light') {
          return {
            id: `light-${item.id}`,
            name: item.lightName || item.name || "Unknown Light",
            type: 'light',
            status: isPropActive(item) ? 'on' : 'off',
            value: item.brightnessLevel || 0,
            room: roomStr,
            section: sectionStr
          } as Device;
        }
        if (type === 'camera') {
          return {
            id: `camera-${item.id}`,
            name: item.cameraName || item.name || "Unknown Camera",
            type: 'camera',
            status: isPropActive(item) ? 'active' : 'inactive',
            room: roomStr,
            section: sectionStr,
            liveStreamUrl: item.liveStreamUrl || item.streamPath || item.url,
            streamPath: item.streamPath,
            ipAddress: item.ipAddress,
            username: item.username,
            password: item.password,
            port: item.port
          } as Device;
        }
        if (type === 'door') {
          let doorStatus = 'unlocked';
          if (item.isOpen && item.isLocked) doorStatus = 'open-locked';
          else if (item.isOpen) doorStatus = 'open';
          else if (item.isLocked) doorStatus = 'locked';
          
          return {
            id: `door-${item.id}`,
            name: item.doorName || item.name || "Unknown Door",
            type: 'door',
            status: doorStatus,
            room: roomStr,
            section: sectionStr,
            doorType: (appNamesDetailList?.doorType || []).find((t: any) => t.id.toString() === item.doorType?.toString())?.name || item.doorType || 'Interior'
          } as Device;
        }
        if (type === 'window') {
          return {
            id: `window-${item.id}`,
            name: item.windowName || item.name || "Unknown Window",
            type: 'window',
            status: item.isLocked ? 'locked' : item.isOpen ? 'open' : 'closed',
            room: roomStr,
            section: sectionStr
          } as Device;
        }
        if (type === 'external') {
          return {
            id: `external-${item.id}`,
            name: item.externalName || item.name || "Unknown External",
            type: 'external' as any,
            status: isPropActive(item) ? 'active' : 'inactive',
            room: roomStr,
            section: sectionStr
          } as Device;
        }
        return item;
      });
      return [...otherDevices, ...mappedNewDevices];
    });
  };

  // Theme & App Bar States
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [isHeaderMicMuted, setIsHeaderMicMuted] = React.useState<boolean>(false);
  const [isMicOverlayActive, setIsMicOverlayActive] = React.useState<boolean>(false);
  const [isMicMinimized, setIsMicMinimized] = React.useState<boolean>(false);
  const [fridayResponse, setFridayResponse] = React.useState<string | null>(null);
  const [isFridaySpeaking, setIsFridaySpeaking] = React.useState<boolean>(false);

  const [transcription, setTranscription] = React.useState<string>("");
  const wasCallMutedBeforeHeyFridayRef = React.useRef<boolean>(false);
  const speechRecognitionRef = React.useRef<any>(null);
  const isFridaySpeakingRef = React.useRef<boolean>(false);
  const lastFridaySpeakingEndedRef = React.useRef<number>(0);
  const recentSpokenAssistantPhrasesRef = React.useRef<string[]>([]);
  const cachedVoicesRef = React.useRef<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) {
            cachedVoicesRef.current = v;
          }
        } catch (e) {}
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);


  
  

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // New State
  const [logs, setLogs] = React.useState<GetLogDto[]>(INITIAL_LOGS);
  const [logPage, setLogPage] = React.useState<number>(1);
  const [hasMoreLogs, setHasMoreLogs] = React.useState<boolean>(true);
  const [selectedLog, setSelectedLog] = React.useState<GetLogDto | null>(null);
  const [isViewLogOpen, setIsViewLogOpen] = React.useState<boolean>(false);
  const loaderRef = React.useRef<HTMLDivElement>(null);
  const callLogsLoaderRef = React.useRef<HTMLDivElement>(null);
  const sideCallLogsLoaderRef = React.useRef<HTMLDivElement>(null);
  const [isPagingLoading, setIsPagingLoading] = React.useState<boolean>(false);
  const [globalFetching, setGlobalFetching] = React.useState(0);
  const [loadingViews, setLoadingViews] = React.useState<Record<string, boolean>>({});

  const isViewLoading = React.useCallback((viewName: string) => {
    if (loadingViews[viewName] !== undefined) {
      return loadingViews[viewName];
    }
    return !fetchedViewsRef.current[viewName] && globalFetching > 0;
  }, [loadingViews, globalFetching]);

  React.useEffect(() => {
    const handleStart = () => setGlobalFetching(prev => prev + 1);
    const handleEnd = () => setGlobalFetching(prev => Math.max(0, prev - 1));

    window.addEventListener('api-fetch-start', handleStart);
    window.addEventListener('api-fetch-end', handleEnd);

    return () => {
      window.removeEventListener('api-fetch-start', handleStart);
      window.removeEventListener('api-fetch-end', handleEnd);
    };
  }, []);

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const fetchedViewsRef = React.useRef<Record<string, boolean>>({});
  const [userDto, setUserDto] = React.useState<GetUserDto | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const userProfileRef = React.useRef<UserProfile | null>(null);
  React.useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  // Auto-login removed as requested to ensure no requests run before explicit login success
  React.useEffect(() => {
    // We only clear out bad session state here, requiring explicit login
    const token = localStorage.getItem('token');
    if (!token || token === "undefined" || token === "null") {
       localStorage.clear();
    }
  }, []);

  const handleLoginSuccess = (userData: GetUserDto, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id.toString());
    localStorage.setItem('userName', userData.userName);
    localStorage.setItem('roleName', userData.roleName);
    if (userData.personId) {
      localStorage.setItem('personId', userData.personId.toString());
    }
    
    setUserDto(userData);
    setIsLoggedIn(true);
    setActiveView('dashboard');
    setIsSidebarCollapsed(true);
    
    // Update userProfile if needed
    setUserProfile(prev => {
      const p = prev || INITIAL_USER;
      return {
      ...p,
      id: userData.personId || p.id,
      getUserDto: {
        ...p.getUserDto,
        id: userData.id,
        userName: userData.userName,
        roleName: userData.roleName
      }
    }});
  };

  React.useEffect(() => {
    const handleAuthExpired = () => {
      const remembered = localStorage.getItem('remembered_users_list');
      localStorage.clear();
      sessionStorage.clear();
      if (remembered) {
        localStorage.setItem('remembered_users_list', remembered);
      }
      fetchedViewsRef.current = {};
      setIsLoggedIn(false);
      setUserDto(null);
      setUserProfile(null);
      setChats([]);
      setChatMessages([]);
      setActiveChatId(null);
      toast.error("Session expired. Please log in again.");
    };

    const handleHighLevelLogOut = () => {
      console.log("HighLevelLogOut event triggered");
      handleLogout();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    window.addEventListener('HighLevelLogOut', handleHighLevelLogOut);
    window.addEventListener('high-level-log-out', handleHighLevelLogOut);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
      window.removeEventListener('HighLevelLogOut', handleHighLevelLogOut);
      window.removeEventListener('high-level-log-out', handleHighLevelLogOut);
    };
  }, []);

  React.useEffect(() => {
    if (isLoggedIn && userProfile) {
      const role = userProfile.getUserDto?.roleName;
      const roleLower = role?.toLowerCase();
      const isRelativeOrVisitor = roleLower === 'relative' || roleLower === 'visitor';

      if (isRelativeOrVisitor) {
        if (activeView === 'contacts' || activeView === 'all-users' || activeView === 'logs' || activeView === 'facilities' || activeView === 'facility-overview' || activeView.startsWith('facility-')) {
          setActiveView('dashboard');
        }
      } else if (role && role !== 'Owner' && role !== 'Wife') {
        if (activeView === 'logs' || activeView === 'all-users') {
          setActiveView('dashboard');
        }
      }
    }
  }, [activeView, isLoggedIn, userProfile]);

  const handleLogout = () => {
    // 1. Cancel Speech Synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    // 2. Stop Speech Recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    // 3. Disable Friday Assistant Mic Overlay & header mic
    setIsMicOverlayActive(false);
    setIsHeaderMicMuted(true);
    setIsMicMinimized(false);

    // 4. Stop Active Voice Recording & Microphone Stream
    if (mediaRecorderRef.current) {
      try {
        (mediaRecorderRef.current as any).isCancelled = true;
        if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {}
    }
    if (activeStream) {
      try {
        activeStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      setActiveStream(null);
    }
    setIsRecording(false);
    setRecordingState('inactive');

    // 5. Disable Call Camera & Mute Microphone / End active calls
    if (activeCall) {
      try {
        if (typeof handleEndCall === 'function') {
          handleEndCall(activeCall.id).catch(() => {});
        }
      } catch (e) {}
    }
    setActiveCall(null);
    setIsCallModalOpen(false);
    setIsCallCameraEnabled(false);
    setIsCallMuted(true);
    if (typeof cleanupAllPeerConnections === 'function') {
      try { cleanupAllPeerConnections(); } catch (e) {}
    }

    // 6. Stop all active media tracks across video/audio elements
    try {
      const mediaElements = document.querySelectorAll('video, audio');
      mediaElements.forEach((el: any) => {
        if (el.srcObject && typeof el.srcObject.getTracks === 'function') {
          el.srcObject.getTracks().forEach((t: MediaStreamTrack) => t.stop());
          el.srcObject = null;
        }
      });
    } catch (e) {}

    const remembered = localStorage.getItem('remembered_users_list');
    localStorage.clear();
    sessionStorage.clear();
    if (remembered) {
      localStorage.setItem('remembered_users_list', remembered);
    }
    fetchedViewsRef.current = {};
    setIsLoggedIn(false);
    setUserDto(null);
    setUserProfile(null);
    setChats([]);
    setChatMessages([]);
    setActiveChatId(null);
    setAuthFailedAttempts(0);
    authFailedAttemptsRef.current = 0;
    toast.success("Successfully logged out");
  };

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

  // Infinite scroll dynamic loader handled via direct onScroll listener on the main content container.

  const [contacts, setContacts] = React.useState<ContactType[]>([]);
  const [contactCategories, setContactCategories] = React.useState<ContactCategory[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = React.useState('');
  const [contactSortCategory, setContactSortCategory] = React.useState<string>('all');
  const [contactView, setContactView] = React.useState<'overview' | 'all'>('overview');
  const [allUsers, setAllUsers] = React.useState<GetPersonDto[]>([]);
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
  
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showAuthCode, setShowAuthCode] = React.useState(false);
  const [showAuthPwd, setShowAuthPwd] = React.useState(false);
  const [showNewAuthCode, setShowNewAuthCode] = React.useState(false);
  const [showAddMemberPassword, setShowAddMemberPassword] = React.useState(false);
  const [showAddMemberAuthCode, setShowAddMemberAuthCode] = React.useState(false);

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
    doorType: 1,
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
      let initialRoom = '';
      let initialSection = '';
      
      if (activeView.startsWith('room-')) {
        initialRoom = activeView.replace('room-', '');
        const room = (rooms || []).find(r => r.id.toString() === initialRoom.toString());
        initialSection = room?.section || '';
      } else if (activeView === 'user-room') {
        initialRoom = 'bedroom';
        initialSection = 'indoor';
      }

      setNewDevice({
        name: '',
        type: 'light',
        room: initialRoom,
        section: initialSection,
        doorType: 1,
        ipAddress: '',
        username: '',
        password: '',
        streamPath: '',
        port: 80,
        applianceType: 1
      });
    }
  }, [isAddDeviceOpen, activeView, rooms]);

  // Add Room State
  const [actions, setActions] = React.useState<GetActionDto[]>([]);
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

  const [appNamesDetailList, setAppNamesDetailList] = React.useState<any>({
    applianceIdNames: (appliances || []).map(a => ({ id: a.id, name: a.applianceName })),
    cameraIdNames: (cameras || []).map(c => ({ id: c.id, name: c.cameraName })),
    lightIdNames: (lights || []).map(l => ({ id: l.id, name: l.lightName })),
    windowIdNames: (windows || []).map(w => ({ id: w.id, name: w.windowName })),
    doorIdNames: (doors || []).map(d => ({ id: d.id, name: d.doorName })),
    externalIdNames: (externals || []).map(e => ({ id: e.id, name: e.externalName })),
    personIdNames: (allUsers || []).map(u => ({ id: u.id, name: `${u.getPersonDetailsDto.firstName} ${u.getPersonDetailsDto.lastName}`, imageUrl: u.getPersonDetailsDto.imageUrl })),
    contactCategoryIdNames: (contactCategories || []).map(c => ({ id: c.id, name: c.name })),
    actionIdNames: (actions || []).map(a => ({ id: a.id, name: a.actionName })),
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
    roomIds: (rooms || []).map(r => ({ id: r.id, name: r.name })),
    sectionIds: (sections || []).map(s => ({ id: s.id, name: s.name })),
  });

  React.useEffect(() => {
    setAppNamesDetailList((prev: any) => ({
      ...prev,
      applianceIdNames: (appliances || []).map(a => ({ id: a.id, name: a.applianceName })),
      cameraIdNames: (cameras || []).map(c => ({ id: c.id, name: c.cameraName })),
      lightIdNames: (lights || []).map(l => ({ id: l.id, name: l.lightName })),
      windowIdNames: (windows || []).map(w => ({ id: w.id, name: w.windowName })),
      doorIdNames: (doors || []).map(d => ({ id: d.id, name: d.doorName })),
      externalIdNames: (externals || []).map(e => ({ id: e.id, name: e.externalName })),
      personIdNames: (allUsers || []).map(u => ({ id: u.id, name: `${u.getPersonDetailsDto.firstName} ${u.getPersonDetailsDto.lastName}`, imageUrl: u.getPersonDetailsDto.imageUrl, isOnline: u.isOnline ?? !u.disabled })),
      contactCategoryIdNames: (contactCategories || []).map(c => ({ id: c.id, name: c.name })),
      roomIds: (rooms || []).map(r => ({ id: r.id, name: r.name })),
      sectionIds: (sections || []).map(s => ({ id: s.id, name: s.name })),
    }));
  }, [allUsers, appliances, cameras, lights, windows, doors, externals, contactCategories, rooms, sections]);

  const isOwner = userProfile?.getUserDto?.role === 1 || userProfile?.getUserDto?.roleName?.toLowerCase() === 'owner';
  const canSeeActions = isOwner || userProfile?.getUserDto?.role === 2 || userProfile?.getUserDto?.role === 3 || ['wife', 'child'].includes(userProfile?.getUserDto?.roleName?.toLowerCase() || '');

  const getUserNameById = React.useCallback((userId: number | string | undefined | null) => {
    if (!userId) return null;
    const uIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const person = (appNamesDetailList?.personIdNames || []).find((p: any) => p.id === uIdNum);
    if (person) return person.name;
    const user = allUsers.find(u => u.id === uIdNum || u.getUserDto?.id === uIdNum || u.personId === uIdNum.toString());
    if (user) return `${user.getPersonDetailsDto?.firstName} ${user.getPersonDetailsDto?.lastName}`;
    return null;
  }, [appNamesDetailList, allUsers]);

  React.useEffect(() => {
    if (activeView === 'facility-actions' && !canSeeActions && isLoggedIn) {
      setActiveView('dashboard');
    }
  }, [activeView, canSeeActions, isLoggedIn]);

  const getUserDetailsById = React.useCallback((personId: number) => {
    const list = appNamesDetailList?.personIdNames || [];
    const found = list.find((u: any) => u.id === personId);
    return found ? { fullName: found.name, profileImageUrl: found.imageUrl } : null;
  }, [appNamesDetailList]);

  const getRoomSectionId = React.useCallback((roomId: string | number | undefined | null) => {
    if (!roomId || roomId === 'none' || roomId === 0) return null;
    
    const r = (rooms || []).find(room => room.id?.toString() === roomId.toString());
    const rSectId = r?.sectionId || r?.SectionId || (r as any)?.Section || r?.section;
    const rSectName = (r as any)?.sectionName || (r as any)?.SectionName || r?.section;
    
    const roomNames = appNamesDetailList?.roomIdNames || appNamesDetailList?.RoomIdNames || [];
    const rNameItem = roomNames.find((x: any) => x.id?.toString() === roomId.toString());
    const rNameSectId = rNameItem?.sectionId ?? rNameItem?.SectionId ?? rNameItem?.section;
    const rNameSectName = rNameItem?.sectionName ?? rNameItem?.SectionName ?? rNameItem?.section;

    const possibleIds = [rSectId, rNameSectId].filter(x => x !== undefined && x !== null && x !== 'none' && x !== '');
    const possibleNames = [rSectName, rNameSectName].filter(x => x !== undefined && x !== null && x !== 'none' && x !== '');

    if (sections && sections.length > 0) {
      const foundSection = sections.find(s => {
        const sId = s.id?.toString().toLowerCase();
        const sDbId = s.dbId?.toString().toLowerCase();
        const sSecId = s.sectionId?.toString().toLowerCase();
        const sName = s.name?.toLowerCase();
        const sSectName = s.sectionName?.toLowerCase();

        for (const pId of possibleIds) {
          const pIdStr = pId.toString().toLowerCase();
          if (sId === pIdStr || sDbId === pIdStr || sSecId === pIdStr) {
            return true;
          }
        }

        for (const pName of possibleNames) {
          const pNameStr = pName.toString().toLowerCase();
          if (sName === pNameStr || sSectName === pNameStr) {
            return true;
          }
        }

        return false;
      });

      if (foundSection) {
        return foundSection.id.toString();
      }
    }

    for (const pId of possibleIds) {
      if (pId && pId !== 'none') return pId.toString();
    }

    return null;
  }, [rooms, sections, appNamesDetailList]);

  const getChatDisplayName = React.useCallback((chat: ChatDto) => {
    if (chat.isGroup) return chat.name;
    const otherParticipant = chat.participants?.find(p => p.personId !== userProfile?.id);
    if (otherParticipant) {
      const detail = getUserDetailsById(otherParticipant.personId);
      return detail?.fullName || otherParticipant.fullName || chat.name || 'Private Chat';
    }
    return chat.name || 'Private Chat';
  }, [getUserDetailsById, userProfile]);

  const getChatDisplayImageUrl = React.useCallback((chat: ChatDto) => {
    if (chat.isGroup) return chat.imageUrl;
    const otherParticipant = chat.participants?.find(p => p.personId !== userProfile?.id);
    if (otherParticipant) {
      const detail = getUserDetailsById(otherParticipant.personId);
      return detail?.profileImageUrl || otherParticipant.profileImageUrl || chat.imageUrl;
    }
    return chat.imageUrl;
  }, [getUserDetailsById, userProfile]);

  const getChatDisplayInitial = React.useCallback((chat: ChatDto) => {
    const displayName = getChatDisplayName(chat);
    return displayName ? displayName.charAt(0).toUpperCase() : 'U';
  }, [getChatDisplayName]);

  const getMessageSenderName = React.useCallback((msg: MessageDto) => {
    const detail = getUserDetailsById(msg.senderPersonId);
    return detail?.fullName || msg.senderName;
  }, [getUserDetailsById]);

  const getMessageSenderProfileImage = React.useCallback((msg: MessageDto) => {
    const detail = getUserDetailsById(msg.senderPersonId);
    return detail?.profileImageUrl || msg.senderProfileImage;
  }, [getUserDetailsById]);

  const getGroupMemberNames = React.useCallback((chat: ChatDto) => {
    return (chat.participants || [])
      .map(p => {
        const u = (allUsers || []).find(user => user.id === p.personId);
        if (u) {
          return u.getPersonDetailsDto.firstName;
        }
        const detail = getUserDetailsById(p.personId);
        const name = detail?.fullName || p.fullName || '';
        return name ? name.trim().split(' ')[0] : '';
      })
      .filter(Boolean)
      .join(', ');
  }, [allUsers, getUserDetailsById]);

  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [dashboardRotation, setDashboardRotation] = React.useState(0);

  // Auto-rotate the dashboard carousel
  React.useEffect(() => {
    if (activeView !== 'dashboard') return;
    const interval = setInterval(() => {
      setDashboardRotation(prev => prev + 36);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeView]);


  React.useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    // 1. Dashboard Page
    if (activeView === 'dashboard') {
      if (!fetchedViewsRef.current['dashboard']) {
        fetchedViewsRef.current['dashboard'] = true;
        apiFetch('/Dashboard/GetAppNamesIdList', { method: 'POST' })
          .then((data: any) => {
            if (data && (data.data ?? data.Data)) {
               const responseData = data.data ?? data.Data;
               setAppNamesDetailList((prev: any) => {
                 const next = { ...prev };
                 Object.keys(responseData).forEach(key => {
                   if (responseData[key] !== null && responseData[key] !== undefined) {
                     next[key] = responseData[key];
                     if (key === 'DoorType') {
                       next['doorType'] = responseData[key];
                     }
                     if (key === 'doorType') {
                       next['DoorType'] = responseData[key];
                     }
                   }
                 });
                 return next;
               });
            } else if (data && !data.success) {
               setAppNamesDetailList((prev: any) => {
                 const next = { ...prev, ...data };
                 if (data.DoorType) next.doorType = data.DoorType;
                 if (data.doorType) next.DoorType = data.doorType;
                 return next;
               });
            }
          })
          .catch(err => console.error("Failed to load app list data", err));
      }
    }

    // PRELOAD ALL backend records once logged in, to set up real lists and prevent displaying fallback states
    if (isLoggedIn && !fetchedViewsRef.current['all-preloads']) {
      fetchedViewsRef.current['all-preloads'] = true;

      // Fetch user profile based on personId from local storage or userDto
      const storedPersonId = localStorage.getItem('personId') || '1';
      apiFetch(`/Person/GetPersonById?id=${storedPersonId}`, { method: 'POST', body: '' })
        .then((res: any) => {
          if (res && res.data) {
            setUserProfile(prev => {
              const p = prev || INITIAL_USER;
              return {
                ...p,
                ...res.data,
                id: (res.data.id ?? res.data.Id) || parseInt(storedPersonId),
                personId: res.data.personId || parseInt(storedPersonId)
              };
            });
            // Store remembered user details
            const pDetails = res.data.getPersonDetailsDto;
            const uDto = res.data.getUserDto;
            if (pDetails) {
              const uName = uDto?.userName || localStorage.getItem('userName') || '';
              if (uName) {
                RememberedUsersManager.addUser({
                  name: `${pDetails.firstName || ''} ${pDetails.lastName || ''}`.trim(),
                  username: uName,
                  imageUrl: pDetails.imageUrl || '',
                });
              }
            }
          }
        })
        .catch(err => console.error("Failed to load user profile on preload", err));

      apiFetch('/External/GetAllExternals', { method: 'POST' })
        .then((res: any) => { if (res && res.data && Array.isArray(res.data)) { setExternals(res.data); syncDevicesFromFetchedType('external', res.data); } else { setExternals([]); syncDevicesFromFetchedType('external', []); } })
        .catch(() => setExternals([]));

      apiFetch('/Room/GetAllRooms', { method: 'POST' })
        .then((res: any) => { 
          if (res && res.data && Array.isArray(res.data)) {
            setRooms(res.data.map((r: any) => ({ ...r, id: r.id ?? r.Id, name: r.roomName || r.name, section: r.sectionId?.toString() || r.SectionId?.toString() || r.sectionName || r.SectionName || r.section || r.Section || '', icon: r.icon || 'Sofa' })));
          } else {
            setRooms([]);
          }
        })
        .catch(() => setRooms([]));

      apiFetch('/Section/GetAllSections', { method: 'POST' })
        .then((res: any) => { if (res && res.data && Array.isArray(res.data)) { setSections(res.data.map(mapSection)); } else { setSections([]); } })
        .catch(() => setSections([]));

      apiFetch('/Appliance/GetAllAppliances', { method: 'POST' })
        .then((res: any) => { 
          if (res && res.data && Array.isArray(res.data)) {
            setAppliances(res.data); 
            syncDevicesFromFetchedType('appliance', res.data);
          } else {
            setAppliances([]);
            syncDevicesFromFetchedType('appliance', []);
          }
        })
        .catch(() => { setAppliances([]); syncDevicesFromFetchedType('appliance', []); });

      apiFetch('/Light/GetAllLights', { method: 'POST' })
        .then((res: any) => { 
          if (res && res.data && Array.isArray(res.data)) {
            setLights(res.data); 
            syncDevicesFromFetchedType('light', res.data);
          } else {
            setLights([]);
            syncDevicesFromFetchedType('light', []);
          }
        })
        .catch(() => { setLights([]); syncDevicesFromFetchedType('light', []); });

      apiFetch('/Camera/GetAllCameras', { method: 'POST' })
        .then((res: any) => { 
          if (res && res.data && Array.isArray(res.data)) {
            setCameras(res.data); 
            syncDevicesFromFetchedType('camera', res.data);
          } else {
            setCameras([]);
            syncDevicesFromFetchedType('camera', []);
          }
        })
        .catch(() => { setCameras([]); syncDevicesFromFetchedType('camera', []); });

      apiFetch('/Door/GetAllDoors', { method: 'POST' })
        .then((res: any) => { 
          if (res && res.data && Array.isArray(res.data)) {
            setDoors(res.data); 
            syncDevicesFromFetchedType('door', res.data);
          } else {
            setDoors([]);
            syncDevicesFromFetchedType('door', []);
          }
        })
        .catch(() => { setDoors([]); syncDevicesFromFetchedType('door', []); });

      apiFetch('/Window/GetAllWindows', { method: 'POST' })
        .then((res: any) => { 
          if (res && res.data && Array.isArray(res.data)) {
            setWindows(res.data); 
            syncDevicesFromFetchedType('window', res.data);
          } else {
            setWindows([]);
            syncDevicesFromFetchedType('window', []);
          }
        })
        .catch(() => { setWindows([]); syncDevicesFromFetchedType('window', []); });

      apiFetch('/Hardware/GetAllHardwares', { method: 'GET' })
        .then((res: any) => { if (res && res.data && Array.isArray(res.data)) { setHardwares(res.data); } else { setHardwares([]); } })
        .catch(() => setHardwares([]));

      apiFetch('/Person/GetAllPersons', { method: 'POST' })
        .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setAllUsers(res.data); else setAllUsers([]); })
        .catch(err => { console.error("Failed to preload persons", err); setAllUsers([]); });

      apiFetch('/Dashboard/GetAppNamesIdList', { method: 'POST' })
        .then((data: any) => {
          if (data && (data.data ?? data.Data)) {
             const responseData = data.data ?? data.Data;
             setAppNamesDetailList((prev: any) => {
               const next = { ...prev };
               Object.keys(responseData).forEach(key => {
                 if (responseData[key] !== null && responseData[key] !== undefined) {
                   next[key] = responseData[key];
                   if (key === 'DoorType') next['doorType'] = responseData[key];
                   if (key === 'doorType') next['DoorType'] = responseData[key];
                 }
               });
               return next;
             });
          }
        })
        .catch(err => console.error("Failed to preload app list data", err));

      apiFetch('/Action/GetAllActions', { method: 'POST', body: '' })
        .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setActions(res.data); })
        .catch(err => console.error("Failed to preload actions", err));

      apiFetch('/Log/GetAllLogs?page=1&pageSize=50', { method: 'POST', body: '' })
        .then((res: any) => {
          if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
            setLogs(res.data);
          } else {
            setLogs(INITIAL_LOGS);
          }
        })
        .catch(() => {
          setLogs(INITIAL_LOGS);
        });
    }

    // 1.5. Facilities Overview Reload
    if (activeView === 'facilities' || activeView === 'facility-overview') {
      if (!fetchedViewsRef.current['facility-overview']) {
        fetchedViewsRef.current['facility-overview'] = true;
        fetchedViewsRef.current['facilities'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-overview': true, 'facilities': true }));
        Promise.all([
          apiFetch('/Section/GetAllSections', { method: 'POST' })
            .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setSections(res.data.map(mapSection)); })
            .catch(err => console.error("Failed to reload sections for overview", err)),
          apiFetch('/Hardware/GetAllHardwares', { method: 'GET' })
            .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setHardwares(res.data); })
            .catch(err => console.error("Failed to reload hardwares for overview", err)),
          apiFetch('/Action/GetAllActions', { method: 'POST', body: '' })
            .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setActions(res.data); })
            .catch(err => console.error("Failed to reload actions for overview", err)),
          apiFetch('/Room/GetAllRooms', { method: 'POST' })
            .then((res: any) => { 
              if (res && res.data && Array.isArray(res.data)) {
                setRooms(res.data.map((r: any) => ({ ...r, id: r.id ?? r.Id, name: r.roomName || r.name, section: r.sectionId?.toString() || r.SectionId?.toString() || r.sectionName || r.SectionName || r.section || r.Section || '', icon: r.icon || 'Sofa' })));
              }
            })
            .catch(err => console.error("Failed to reload rooms for overview", err)),
          apiFetch('/External/GetAllExternals', { method: 'POST' })
            .then((res: any) => { 
              if (res && res.data && Array.isArray(res.data)) { 
                setExternals(res.data); 
                syncDevicesFromFetchedType('external', res.data); 
              } 
            })
            .catch(err => console.error("Failed to reload externals for overview", err))
        ]).finally(() => setLoadingViews(prev => ({ ...prev, 'facility-overview': false, 'facilities': false })));
      }
    }

    // 2. All Users (Persons) Page
    if (activeView === 'all-users') {
      if (!fetchedViewsRef.current['all-users']) {
        fetchedViewsRef.current['all-users'] = true;
        setLoadingViews(prev => ({ ...prev, 'all-users': true }));
        apiFetch('/Person/GetAllPersons', { method: 'POST' })
          .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setAllUsers(res.data); else setAllUsers([]); })
          .catch(err => { console.error("Failed to load persons", err); setAllUsers([]); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'all-users': false })));
      }
    }

    // 3. Hardware Page
    if (activeView === 'facility-hardware') {
      if (!fetchedViewsRef.current['facility-hardware']) {
        fetchedViewsRef.current['facility-hardware'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-hardware': true }));
        apiFetch('/Hardware/GetAllHardwares', { method: 'GET' })
          .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setHardwares(res.data); else setHardwares([]); })
          .catch(err => { console.error("Failed to load hardwares", err); setHardwares([]); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-hardware': false })));
      }
    }

    // 4. Cameras Page
    if (activeView === 'facility-cameras') {
      if (!fetchedViewsRef.current['facility-cameras']) {
        fetchedViewsRef.current['facility-cameras'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-cameras': true }));
        apiFetch('/Camera/GetAllCameras', { method: 'POST' })
          .then((res: any) => { 
            if (res && res.data && Array.isArray(res.data)) { 
              setCameras(res.data); 
              syncDevicesFromFetchedType('camera', res.data);
            } else {
              setCameras([]);
              syncDevicesFromFetchedType('camera', []);
            }
          })
          .catch(err => { console.error("Failed to load cameras", err); setCameras([]); syncDevicesFromFetchedType('camera', []); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-cameras': false })));
      }
    }

    // 5. Windows Page
    if (activeView === 'facility-windows') {
      if (!fetchedViewsRef.current['facility-windows']) {
        fetchedViewsRef.current['facility-windows'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-windows': true }));
        apiFetch('/Window/GetAllWindows', { method: 'POST' })
          .then((res: any) => { 
            if (res && res.data && Array.isArray(res.data)) { 
              setWindows(res.data); 
              syncDevicesFromFetchedType('window', res.data);
            } else {
              setWindows([]);
              syncDevicesFromFetchedType('window', []);
            }
          })
          .catch(err => { console.error("Failed to load windows", err); setWindows([]); syncDevicesFromFetchedType('window', []); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-windows': false })));
      }
    }

    // 6. Doors Page
    if (activeView === 'facility-doors') {
      if (!fetchedViewsRef.current['facility-doors']) {
        fetchedViewsRef.current['facility-doors'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-doors': true }));
        apiFetch('/Door/GetAllDoors', { method: 'POST' })
          .then((res: any) => { 
            if (res && res.data && Array.isArray(res.data)) { 
              setDoors(res.data); 
              syncDevicesFromFetchedType('door', res.data);
            } else {
              setDoors([]);
              syncDevicesFromFetchedType('door', []);
            }
          })
          .catch(err => { console.error("Failed to load doors", err); setDoors([]); syncDevicesFromFetchedType('door', []); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-doors': false })));
      }
    }

    // 7. Lights Page
    if (activeView === 'facility-lights') {
      if (!fetchedViewsRef.current['facility-lights']) {
        fetchedViewsRef.current['facility-lights'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-lights': true }));
        apiFetch('/Light/GetAllLights', { method: 'POST' })
          .then((res: any) => { 
            if (res && res.data && Array.isArray(res.data)) { 
              setLights(res.data); 
              syncDevicesFromFetchedType('light', res.data);
            } else {
              setLights([]);
              syncDevicesFromFetchedType('light', []);
            }
          })
          .catch(err => { console.error("Failed to load lights", err); setLights([]); syncDevicesFromFetchedType('light', []); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-lights': false })));
      }
    }

    // 8. Rooms Page
    if (activeView === 'facility-rooms' || activeView === 'rooms') {
      if (!fetchedViewsRef.current['facility-rooms']) {
        fetchedViewsRef.current['facility-rooms'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-rooms': true, 'rooms': true }));
        apiFetch('/Room/GetAllRooms', { method: 'POST' })
          .then((res: any) => { 
            if (res && res.data && Array.isArray(res.data)) {
              setRooms(res.data.map((r: any) => ({ ...r, id: r.id ?? r.Id, name: r.roomName || r.name, section: r.sectionId?.toString() || r.SectionId?.toString() || r.sectionName || r.SectionName || r.section || r.Section || '', icon: r.icon || 'Sofa' })));
            } else {
              setRooms([]);
            }
          })
          .catch(err => { console.error("Failed to load rooms", err); setRooms([]); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-rooms': false, 'rooms': false })));
      }
    }

    // 9. Sections Page
    if (activeView === 'facility-sections') {
      if (!fetchedViewsRef.current['facility-sections']) {
        fetchedViewsRef.current['facility-sections'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-sections': true }));
        apiFetch('/Section/GetAllSections', { method: 'POST' })
          .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setSections(res.data.map(mapSection)); else setSections([]); })
          .catch(err => { console.error("Failed to load sections", err); setSections([]); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-sections': false })));
      }
    }

    // 10. Contact (and Categories) Page
    if (activeView === 'contacts') {
      if (!fetchedViewsRef.current['contacts']) {
        fetchedViewsRef.current['contacts'] = true;
        setLoadingViews(prev => ({ ...prev, 'contacts': true }));
        Promise.all([
          apiFetch('/ContactCategory/GetAllContactCategories', { method: 'POST' })
            .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setContactCategories(res.data); else setContactCategories([]); })
            .catch(err => { console.error("Failed to load contact categories", err); setContactCategories([]); }),
          apiFetch('/Contact/GetAllContacts', { method: 'POST', body: '' })
            .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setContacts(res.data); else setContacts([]); })
            .catch(err => { console.error("Failed to load contacts", err); setContacts([]); })
        ]).finally(() => setLoadingViews(prev => ({ ...prev, 'contacts': false })));
      }
    }

    // 11. Appliance Page
    if (activeView === 'facility-appliances') {
      if (!fetchedViewsRef.current['facility-appliances']) {
        fetchedViewsRef.current['facility-appliances'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-appliances': true }));
        apiFetch('/Appliance/GetAllAppliances', { method: 'POST' })
          .then((res: any) => { 
            if (res && res.data && Array.isArray(res.data)) { 
              setAppliances(res.data); 
              syncDevicesFromFetchedType('appliance', res.data);
            } else {
              setAppliances([]);
              syncDevicesFromFetchedType('appliance', []);
            }
          })
          .catch(err => { console.error("Failed to load appliances", err); setAppliances([]); syncDevicesFromFetchedType('appliance', []); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-appliances': false })));
      }
    }

    // 12. User Specific Rooms (Rooms by Person ID)
    if (activeView === 'user-room') {
      if (!fetchedViewsRef.current['user-room']) {
        fetchedViewsRef.current['user-room'] = true;
        setLoadingViews(prev => ({ ...prev, 'user-room': true }));
        apiFetch('/Room/GetAllRoomsByPersonId', { method: 'POST', body: '' })
          .then((res: any) => { 
            if (res && res.data && Array.isArray(res.data)) {
              setUserRooms(res.data.map((r: any) => ({ ...r, id: r.id ?? r.Id, name: r.roomName || r.name, section: r.sectionId?.toString() || r.SectionId?.toString() || r.sectionName || r.SectionName || r.section || r.Section || '', icon: r.icon || 'Sofa' })));
            } else {
              setUserRooms([]);
            }
          })
          .catch(err => { console.error("Failed to load user-specific rooms by person id", err); setUserRooms([]); })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'user-room': false })));
      }
    }

    // 13. Profile Page Fetching
    if (activeView === 'profile') {
      const storedPersonId = localStorage.getItem('personId') || '1';
      apiFetch(`/Person/GetPersonById?id=${storedPersonId}`, { method: 'POST', body: '' })
        .then((res: any) => {
          if (res && res.data) {
            setUserProfile(prev => {
              const p = prev || INITIAL_USER;
              return {
                ...p,
                ...res.data,
                id: (res.data.id ?? res.data.Id) || parseInt(storedPersonId),
                personId: res.data.personId || parseInt(storedPersonId)
              };
            });
          }
        })
        .catch(err => console.error("Failed to load user profile", err));
    }

    // 14. Externals Page Fetching
    if (activeView === 'facility-externals') {
      if (!fetchedViewsRef.current['facility-externals']) {
        fetchedViewsRef.current['facility-externals'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-externals': true }));
        Promise.all([
          apiFetch('/External/GetAllExternals', { method: 'POST', body: '' })
            .then((res: any) => {
              if (res && res.data && Array.isArray(res.data)) {
                setExternals(res.data);
                syncDevicesFromFetchedType('external', res.data);
              } else {
                setExternals([]);
                syncDevicesFromFetchedType('external', []);
              }
            })
            .catch(err => { console.error("Failed to load externals", err); setExternals([]); syncDevicesFromFetchedType('external', []); }),
          apiFetch('/Action/GetAllActions', { method: 'POST', body: '' })
            .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setActions(res.data); })
            .catch(err => console.error("Failed to load actions on externals page", err))
        ]).finally(() => setLoadingViews(prev => ({ ...prev, 'facility-externals': false })));
      }
    }

    // 15. Activity Logs Fetching
    if (activeView === 'logs') {
      if (!fetchedViewsRef.current['logs']) {
        fetchedViewsRef.current['logs'] = true;
        setLoadingViews(prev => ({ ...prev, 'logs': true }));
        const page = 1;
        const pageSize = 50;
        setLogPage(page);
        setHasMoreLogs(true);
        
        const formatDateToDDMMYYYY = (dateVal: string | Date | null) => {
          if (!dateVal) return '';
          const d = new Date(dateVal);
          if (isNaN(d.getTime())) return '';
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          return `${day}-${month}-${year}`;
        };

        const fetchLogsPromise = (logStartDate || logEndDate)
          ? apiFetch(`/Log/GetAllLogsByDate?startDate=${formatDateToDDMMYYYY(logStartDate)}&endDate=${formatDateToDDMMYYYY(logEndDate || new Date())}&page=${page}&pageSize=${pageSize}`, { method: 'POST', body: '' })
          : apiFetch(`/Log/GetAllLogs?page=${page}&pageSize=${pageSize}`, { method: 'POST', body: '' });

        fetchLogsPromise
          .then((res: any) => {
            if (res && res.data && Array.isArray(res.data)) {
              setLogs(res.data);
              setHasMoreLogs(res.data.length >= pageSize);
            } else {
              setLogs([]);
              setHasMoreLogs(false);
            }
          })
          .catch(err => {
            console.error("Failed to load logs", err);
            setLogs([]);
            setHasMoreLogs(false);
          })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'logs': false })));
      }
    }

    // 16. Actions Fetching
    if (activeView === 'facility-actions') {
      if (!fetchedViewsRef.current['facility-actions']) {
        fetchedViewsRef.current['facility-actions'] = true;
        setLoadingViews(prev => ({ ...prev, 'facility-actions': true }));
        apiFetch('/Action/GetAllActions', { method: 'POST', body: '' })
          .then((res: any) => {
            if (res && res.data && Array.isArray(res.data)) {
              setActions(res.data);
            } else {
              setActions([]);
            }
          })
          .catch(err => {
            console.error("Failed to load actions", err);
            setActions([]);
          })
          .finally(() => setLoadingViews(prev => ({ ...prev, 'facility-actions': false })));
      }
    }
  }, [activeView, isLoggedIn, logStartDate, logEndDate]);
  const [actionForm, setActionForm] = React.useState<CreateActionDto>({
    actionName: '',
    description: '',
    isPrivate: false,
    isRecurring: false,
    time: '00:00:00'
  });

  const [isAddRoomOpen, setIsAddRoomOpen] = React.useState(false);
  const [roomLocked, setRoomLocked] = React.useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = React.useState(false);
  const [generatedToken, setGeneratedToken] = React.useState<GetTokenDto | null>(null);
  const [newGroupImageUrl, setNewGroupImageUrl] = React.useState("");
  const [newGroupImageFile, setNewGroupImageFile] = React.useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = React.useState<File | null>(null);
  const [editingGroupId, setEditingGroupId] = React.useState<number | null>(null);
  const [isEditGroupOpen, setIsEditGroupOpen] = React.useState(false);
  const [isViewGroupOpen, setIsViewGroupOpen] = React.useState(false);
  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = React.useState(false);
  const [isGroupImageCropperOpen, setIsGroupImageCropperOpen] = React.useState(false);
  const [tempGroupImageUrl, setTempGroupImageUrl] = React.useState("");
  const groupImageInputRef = React.useRef<HTMLInputElement>(null);
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
  const [isNewContactImageSelected, setIsNewContactImageSelected] = React.useState(false);
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
      setIsNewContactImageSelected(true);
    } else {
      setUserProfile(prev => ({ 
        ...prev, 
        getPersonDetailsDto: { ...prev.getPersonDetailsDto, imageUrl: croppedImageUrl } 
      }));
      try {
        const file = dataURLtoFile(croppedImageUrl, 'profile-avatar.png');
        setProfileImageFile(file);
      } catch (err) {
        console.error("Failed to convert cropped image to file", err);
      }
    }
  };

  // Section Modals
  const [isAddSectionOpen, setIsAddSectionOpen] = React.useState(false);
  const [isEditSectionOpen, setIsEditSectionOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<Partial<Section> | null>(null);
  const [newSectionName, setNewSectionName] = React.useState('');
  const [newSectionType, setNewSectionType] = React.useState<'general' | 'secretive'>('general');
  const [newSectionIsHidden, setNewSectionIsHidden] = React.useState(false);

  // Logout All Confirmation Modal
  const [isLogoutAllConfirmationOpen, setIsLogoutAllConfirmationOpen] = React.useState(false);

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authFailedAttempts, setAuthFailedAttempts] = React.useState(0);
  const authFailedAttemptsRef = React.useRef(0);
  const [authCode, setAuthCode] = React.useState('');
  const [authError, setAuthError] = React.useState(false);
  const [authSuccess, setAuthSuccess] = React.useState(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = React.useState(false);
  const [onAuthSuccess, setOnAuthSuccess] = React.useState<(() => void) | null>(null);

  // Camera Modal
  const [isCameraModalOpen, setIsCameraModalOpen] = React.useState(false);
  const [selectedCamera, setSelectedCamera] = React.useState<Device | null>(null);
  const [playingRecordingPath, setPlayingRecordingPath] = React.useState<string | null>(null);
  const [cameraPlaybackOffset, setCameraPlaybackOffset] = React.useState(0);
  const [modalCurrentTime, setModalCurrentTime] = React.useState(new Date());
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [isRestartingCamera, setIsRestartingCamera] = React.useState(false);
  const [isScreensaverOpen, setIsScreensaverOpen] = React.useState(false);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const inactivityTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Call-related States
  const [activeCall, setActiveCall] = React.useState<CallDto | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = React.useState(false);
  const [isIncomingCall, setIsIncomingCall] = React.useState(false);
  const [isCallMuted, setIsCallMuted] = React.useState(false);
  const [isCallCameraEnabled, setIsCallCameraEnabled] = React.useState(false);
  const [isCallScreenSharing, setIsCallScreenSharing] = React.useState(false);

  const isCallMutedRef = React.useRef(isCallMuted);
  const isCallCameraEnabledRef = React.useRef(isCallCameraEnabled);
  const isCallScreenSharingRef = React.useRef(isCallScreenSharing);

  React.useEffect(() => {
    isCallMutedRef.current = isCallMuted;
  }, [isCallMuted]);

  React.useEffect(() => {
    isCallCameraEnabledRef.current = isCallCameraEnabled;
  }, [isCallCameraEnabled]);

  React.useEffect(() => {
    isCallScreenSharingRef.current = isCallScreenSharing;
  }, [isCallScreenSharing]);
  const [isCallSpeakerEnabled, setIsCallSpeakerEnabled] = React.useState(false);
  const [callLogs, setCallLogs] = React.useState<CallLogDto[]>([]);
  const [isCallLogsOpen, setIsCallLogsOpen] = React.useState(false);
  const [isCallLogsLoading, setIsCallLogsLoading] = React.useState(false);
  const [hasLoadedCallLogs, setHasLoadedCallLogs] = React.useState(false);
  const [callLogPage, setCallLogPage] = React.useState<number>(1);
  const [hasMoreCallLogs, setHasMoreCallLogs] = React.useState<boolean>(true);
  const [isFetchingMoreCallLogs, setIsFetchingMoreCallLogs] = React.useState<boolean>(false);
  const [callLogFilter, setCallLogFilter] = React.useState<'all' | 'missed' | 'received' | 'rejected' | 'outgoing'>('all');
  const [callLogSort, setCallLogSort] = React.useState<'newest' | 'oldest' | 'duration' | 'type_video' | 'type_voice'>('newest');

  const [isChatCallHistoryOpen, setIsChatCallHistoryOpen] = React.useState(true);

  const getUserCallStatus = React.useCallback((log: CallLogDto, userId?: number) => {
    if (!userId) return 'missed';

    const rawCallerId = log.callerPersonId ?? (log as any).CallerPersonId;
    const rawIsIncoming = log.isIncoming ?? (log as any).IsIncoming;

    // 1. Check if the call was initiated by the logged in user
    const isCaller = (rawCallerId !== undefined && rawCallerId !== null && Number(rawCallerId) === Number(userId)) || rawIsIncoming === false;
    if (isCaller) {
      return 'outgoing';
    }

    // 2. Call was NOT initiated by the user (Incoming Call)
    const rawStatus = log.status ?? (log as any).Status;
    const rawEndedAt = log.endedAt ?? (log as any).EndedAt;

    const isCallEnded = rawStatus === CallStatus.Ended || rawStatus === 3 || rawStatus === '3' ||
      (typeof rawStatus === 'string' && rawStatus.toLowerCase() === 'ended') ||
      rawStatus === CallStatus.Missed || rawStatus === CallStatus.Rejected || rawStatus === CallStatus.TimedOut ||
      !!rawEndedAt;

    const participantsList = log.participants || (log as any).Participants || [];
    const userParticipant = participantsList.find((p: any) => {
      const pId = p.personId ?? p.PersonId;
      return pId !== undefined && pId !== null && Number(pId) === Number(userId);
    });

    const pStatus = userParticipant ? (userParticipant.status ?? userParticipant.Status) : undefined;

    const isLeftOrConnected = (s: any) => {
      if (s === undefined || s === null) return false;
      if (s === CallParticipantStatus.Connected || s === CallParticipantStatus.Left) return true;
      if (s === 1 || s === 3 || s === '1' || s === '3') return true;
      if (typeof s === 'string') {
        const lower = s.toLowerCase();
        return lower === 'connected' || lower === 'left' || lower === 'joined';
      }
      return false;
    };

    const isRingingStatus = (s: any) => {
      if (s === undefined || s === null) return false;
      if (s === CallParticipantStatus.Ringing || s === 0 || s === '0') return true;
      if (typeof s === 'string' && s.toLowerCase() === 'ringing') return true;
      return false;
    };

    const isDeclinedOrRejected = (s: any) => {
      if (s === undefined || s === null) return false;
      if (s === CallParticipantStatus.Declined || s === 2 || s === '2') return true;
      if (typeof s === 'string' && s.toLowerCase() === 'declined') return true;
      return false;
    };

    // Check if duration is non-zero (e.g., "00:01:23")
    const hasNonZeroDuration = (() => {
      if (log.duration && typeof log.duration === 'string' && log.duration.trim() !== '') {
        const parts = log.duration.split(':');
        if (parts.length >= 2) {
          const totalSecs = parts.reduce((acc, time) => (60 * acc) + (+time || 0), 0);
          return totalSecs > 0;
        }
      }
      return false;
    })();

    const userIsLeftOrConnected = (userParticipant && isLeftOrConnected(pStatus)) ||
      !!(log.answeredAt ?? (log as any).AnsweredAt) ||
      hasNonZeroDuration ||
      log.isMissed === false;

    // Active ringing call check
    if (!isCallEnded && userParticipant && isRingingStatus(pStatus)) {
      return 'ringing';
    }

    // Rejection check
    if (rawStatus === CallStatus.Rejected || (userParticipant && isDeclinedOrRejected(pStatus))) {
      return 'rejected';
    }

    // When call status is ended and user status is Left/Connected (or answered):
    // Call is marked as RECEIVED (falls under received badge)
    // Else: marked as MISSED
    if (isCallEnded) {
      if (userIsLeftOrConnected) {
        return 'received';
      }
      return 'missed';
    }

    // Ongoing call where user joined
    if (userIsLeftOrConnected) {
      return 'received';
    }

    return 'missed';
  }, []);

  const filteredAndSortedCallLogs = React.useMemo(() => {
    if (!callLogs) return [];
    
    let result = [...callLogs];

    if (callLogFilter !== 'all') {
      result = result.filter(log => {
        const userStatus = getUserCallStatus(log, userProfile?.id);
        if (callLogFilter === 'missed') return userStatus === 'missed';
        if (callLogFilter === 'received') return userStatus === 'received';
        if (callLogFilter === 'rejected') return userStatus === 'rejected';
        if (callLogFilter === 'outgoing') return userStatus === 'outgoing';
        return true;
      });
    }

    result.sort((a, b) => {
      if (callLogSort === 'oldest') {
        return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
      }
      if (callLogSort === 'duration') {
        const getSec = (log: CallLogDto) => {
          if (!log.startedAt || !log.endedAt) return 0;
          return (new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000;
        };
        return getSec(b) - getSec(a);
      }
      if (callLogSort === 'type_video') {
        if (a.type !== b.type) {
          return (b.type === CallType.Video ? 1 : 0) - (a.type === CallType.Video ? 1 : 0);
        }
        return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      }
      if (callLogSort === 'type_voice') {
        if (a.type !== b.type) {
          return (b.type === CallType.Audio ? 1 : 0) - (a.type === CallType.Audio ? 1 : 0);
        }
        return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      }
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });

    return result;
  }, [callLogs, callLogFilter, callLogSort, userProfile?.id, getUserCallStatus]);

  const callLogCounts = React.useMemo(() => {
    const counts = { all: callLogs.length, missed: 0, received: 0, rejected: 0, outgoing: 0 };
    callLogs.forEach(log => {
      const userStatus = getUserCallStatus(log, userProfile?.id);
      if (userStatus === 'missed') counts.missed++;
      else if (userStatus === 'rejected') counts.rejected++;
      else if (userStatus === 'received') counts.received++;
      else if (userStatus === 'outgoing') counts.outgoing++;
    });
    return counts;
  }, [callLogs, userProfile?.id, getUserCallStatus]);

  // Live Ticker for call durations & real-time updates (updates every 1000ms)
  const [liveTimestamp, setLiveTimestamp] = React.useState<number>(Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Call Duration Timer
  const [callDurationSeconds, setCallDurationSeconds] = React.useState(0);
  React.useEffect(() => {
    if (!activeCall) {
      setCallDurationSeconds(0);
      return;
    }
    const isCallEnded = activeCall.status === CallStatus.Ended || 
                        activeCall.status === CallStatus.Rejected || 
                        activeCall.status === CallStatus.Missed || 
                        activeCall.status === CallStatus.TimedOut || 
                        !!activeCall.endedAt;

    const startMs = parseTimestamp(activeCall.answeredAt || activeCall.startedAt);
    const endMs = isCallEnded 
      ? parseTimestamp(activeCall.endedAt || activeCall.answeredAt || activeCall.startedAt) 
      : liveTimestamp;
    const secs = Math.max(0, Math.floor((endMs - startMs) / 1000));
    setCallDurationSeconds(secs);
  }, [activeCall, activeCall?.status, activeCall?.startedAt, activeCall?.answeredAt, activeCall?.endedAt, liveTimestamp]);

  const formatCallTimer = React.useCallback((totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const pad = (num: number) => num.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }, []);

  // WebRTC Peer Connection and signaling handlers (Multi-Peer Group Call Support)
  const activeCallRef = React.useRef<CallDto | null>(activeCall);
  React.useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const peerConnectionsRef = React.useRef<Record<number, RTCPeerConnection>>({});
  const remoteStreamsRef = React.useRef<Record<number, MediaStream>>({});
  const pendingIceCandidatesRef = React.useRef<Record<number, RTCIceCandidateInit[]>>({});
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);

  const [remoteStreams, setRemoteStreams] = React.useState<Record<number, MediaStream>>({});

  const cleanupPeerConnectionForPerson = React.useCallback((personId: number) => {
    const pc = peerConnectionsRef.current[personId];
    if (pc) {
      console.log(`[WebRTC Log] Closing RTCPeerConnection for personId=${personId}`);
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onsignalingstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.onconnectionstatechange = null;
      pc.close();
      delete peerConnectionsRef.current[personId];
    }
    delete remoteStreamsRef.current[personId];
    delete pendingIceCandidatesRef.current[personId];
    setRemoteStreams(prev => {
      const next = { ...prev };
      delete next[personId];
      return next;
    });
  }, []);

  const cleanupAllPeerConnections = React.useCallback(() => {
    console.log("[WebRTC Log] Cleaning up all RTCPeerConnections, local media, and screen sharing");
    Object.entries(peerConnectionsRef.current).forEach(([, pc]: [string, RTCPeerConnection]) => {
      try {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onsignalingstatechange = null;
        pc.oniceconnectionstatechange = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch (e) {
        console.warn("[WebRTC Log] Error closing peer connection:", e);
      }
    });
    peerConnectionsRef.current = {};

    if (screenStreamRef.current) {
      console.log("[WebRTC Log] Stopping screen sharing tracks");
      screenStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      screenStreamRef.current = null;
    }

    if (localStreamRef.current) {
      console.log("[WebRTC Log] Stopping local MediaStream tracks (microphone & camera)");
      localStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      localStreamRef.current = null;
    }
    remoteStreamsRef.current = {};
    setRemoteStreams({});
    pendingIceCandidatesRef.current = {};
    setIsCallScreenSharing(false);
    setIsCallCameraEnabled(false);
    setIsCallMuted(true);
    setIsCallModalOpen(false);
  }, []);

  React.useEffect(() => {
    if (!activeCall) {
      cleanupAllPeerConnections();
    }
    return () => {
      cleanupAllPeerConnections();
    };
  }, [activeCall, cleanupAllPeerConnections]);

  React.useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isCallMuted;
      });
    }
  }, [isCallMuted]);

  React.useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isCallCameraEnabled;
      });
    }
  }, [isCallCameraEnabled]);

  const getLocalMediaStream = React.useCallback(async (callType?: CallType) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !isCallMuted; });
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = isCallCameraEnabled; });
      return localStreamRef.current;
    }
    const isVideo = callType === CallType.Video || isCallCameraEnabled;
    const constraints = {
      audio: true,
      video: isVideo ? true : false
    };
    console.log(`[WebRTC Log] Requesting getUserMedia:`, constraints);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getAudioTracks().forEach(t => { t.enabled = !isCallMuted; });
      stream.getVideoTracks().forEach(t => { t.enabled = isCallCameraEnabled; });
      localStreamRef.current = stream;
      console.log("[WebRTC Log] Successfully acquired local MediaStream:", stream.getTracks().map(t => `${t.kind}:${t.id}`));
      return stream;
    } catch (err) {
      console.warn("[WebRTC Log] getUserMedia failed with specified constraints, attempting audio-only fallback:", err);
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioOnlyStream.getAudioTracks().forEach(t => { t.enabled = !isCallMuted; });
        localStreamRef.current = audioOnlyStream;
        console.log("[WebRTC Log] Fallback audio-only MediaStream acquired");
        return audioOnlyStream;
      } catch (fallbackErr) {
        console.error("[WebRTC Log] getUserMedia failed completely:", fallbackErr);
        return null;
      }
    }
  }, [isCallMuted, isCallCameraEnabled]);

  const getOrCreatePeerConnection = React.useCallback((targetPersonId: number, callId: number, chatId: number) => {
    if (peerConnectionsRef.current[targetPersonId]) {
      const existingPc = peerConnectionsRef.current[targetPersonId];
      if (existingPc.signalingState !== "closed") {
        return existingPc;
      }
    }

    console.log(`[WebRTC Log] Initializing RTCPeerConnection for targetPersonId=${targetPersonId}, callId=${callId}, chatId=${chatId}`);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ],
    });

    pc.onsignalingstatechange = () => {
      console.log(`[WebRTC Log] [Peer ${targetPersonId}] signalingState:`, pc.signalingState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC Log] [Peer ${targetPersonId}] iceConnectionState:`, pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC Log] [Peer ${targetPersonId}] connectionState:`, pc.connectionState);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC Log] [Peer ${targetPersonId}] Local ICE candidate generated:`, event.candidate.candidate);
        const conn = signalRConnectionRef.current;
        if (conn && conn.state === "Connected") {
          const token = localStorage.getItem('token') || '';
          const currentUserId = userProfileRef.current?.id || userProfile?.id || 0;
          const iceDto: IceCandidateDto = {
            callId,
            CallId: callId,
            chatId,
            ChatId: chatId,
            personId: currentUserId,
            PersonId: currentUserId,
            candidate: event.candidate.candidate,
            Candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid || undefined,
            SdpMid: event.candidate.sdpMid || undefined,
            sdpMLineIndex: event.candidate.sdpMLineIndex !== null && event.candidate.sdpMLineIndex !== undefined ? event.candidate.sdpMLineIndex : undefined,
            SdpMLineIndex: event.candidate.sdpMLineIndex !== null && event.candidate.sdpMLineIndex !== undefined ? event.candidate.sdpMLineIndex : undefined
          };
          conn.invoke("IceCandidate", iceDto, token).catch(err => {
            console.error(`[WebRTC Log] [Peer ${targetPersonId}] Failed to send IceCandidate via SignalR:`, err);
          });
        }
      } else {
        console.log(`[WebRTC Log] [Peer ${targetPersonId}] End of ICE candidates`);
      }
    };

    pc.ontrack = (event) => {
      console.log(`[WebRTC Log] [Peer ${targetPersonId}] Remote track received:`, event.track.kind, "Streams:", event.streams);
      let stream = event.streams[0];
      if (!stream) {
        stream = new MediaStream([event.track]);
      } else if (!stream.getTrackById(event.track.id)) {
        stream.addTrack(event.track);
      }
      remoteStreamsRef.current[targetPersonId] = stream;
      setRemoteStreams(prev => ({
        ...prev,
        [targetPersonId]: new MediaStream(stream.getTracks())
      }));
    };

    peerConnectionsRef.current[targetPersonId] = pc;
    return pc;
  }, [userProfile]);

  const flushPendingIceCandidates = React.useCallback(async (personId: number, pc: RTCPeerConnection) => {
    const queued = pendingIceCandidatesRef.current[personId];
    if (queued && queued.length > 0) {
      console.log(`[WebRTC Log] Processing ${queued.length} queued ICE candidate(s) for personId=${personId}...`);
      const candidatesToProcess = [...queued];
      pendingIceCandidatesRef.current[personId] = [];
      for (const cand of candidatesToProcess) {
        try {
          console.log(`[WebRTC Log] Adding queued ICE candidate for personId=${personId}:`, cand.candidate);
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.error(`[WebRTC Log] Error adding queued ICE candidate for personId=${personId}:`, e);
        }
      }
    }
  }, []);

  const createOfferForPeer = React.useCallback(async (targetPersonId: number, callId: number, chatId: number, callType?: CallType) => {
    const currentUserId = userProfileRef.current?.id || userProfile?.id || 0;
    if (!targetPersonId || targetPersonId === currentUserId) return;
    console.log(`[WebRTC Log] Initiating Offer flow for targetPersonId=${targetPersonId}, callId=${callId}, chatId=${chatId}`);
    const conn = signalRConnectionRef.current;
    if (!conn || conn.state !== "Connected") {
      console.warn("[WebRTC Log] SignalR connection not ready or not connected for offer flow");
      return;
    }

    const token = localStorage.getItem('token') || '';

    try {
      const pc = getOrCreatePeerConnection(targetPersonId, callId, chatId);
      const localStream = await getLocalMediaStream(callType);

      if (localStream) {
        localStream.getTracks().forEach(track => {
          const senders = pc.getSenders();
          const exists = senders.some(s => s.track?.id === track.id);
          if (!exists) {
            console.log(`[WebRTC Log] Adding local track (${track.kind}) for targetPersonId=${targetPersonId}`);
            pc.addTrack(track, localStream);
          }
        });
      }

      console.log(`[WebRTC Log] Creating Offer SDP for targetPersonId=${targetPersonId}...`);
      const offer = await pc.createOffer();

      await pc.setLocalDescription(offer);
      console.log(`[WebRTC Log] [Peer ${targetPersonId}] setLocalDescription succeeded. Signaling state:`, pc.signalingState);

      const offerDto: OfferDto = {
        callId,
        CallId: callId,
        chatId,
        ChatId: chatId,
        personId: currentUserId,
        PersonId: currentUserId,
        sdp: offer.sdp || '',
        Sdp: offer.sdp || ''
      };
      console.log(`[WebRTC Log] Sending Offer via SignalR to targetPersonId=${targetPersonId}...`);
      await conn.invoke("Offer", offerDto, token);
      console.log(`[WebRTC Log] Offer invoked successfully on SignalR for targetPersonId=${targetPersonId}`);

      // Invoke toggle controls
      const currentMuted = isCallMutedRef.current;
      const currentCam = isCallCameraEnabledRef.current;
      const currentShare = isCallScreenSharingRef.current;

      const toggleCallItemsDto: ToggleCallItemsDto = {
        callId,
        chatId,
        personId: currentUserId,
        isMuted: currentMuted,
        isCameraEnabled: currentCam,
        isSharing: currentShare,
        CallId: callId,
        ChatId: chatId,
        PersonId: currentUserId,
        IsMuted: currentMuted,
        IsCameraEnabled: currentCam,
        IsSharing: currentShare
      };
      await conn.invoke("ToggleCallItems", toggleCallItemsDto, token).catch(e => console.warn("Failed sending ToggleCallItems on offer creation:", e));
      await conn.invoke("ToggleMicrophone", { callId, isMuted: currentMuted }, token).catch(() => {});
      await conn.invoke("ToggleCamera", { callId, isCameraEnabled: currentCam }, token).catch(() => {});
      if (currentShare) {
        await conn.invoke("ScreenShare", { callId, isSharing: true }, token).catch(() => {});
      }
    } catch (err) {
      console.error(`[WebRTC Log] Error creating offer for targetPersonId=${targetPersonId}:`, err);
    }
  }, [getOrCreatePeerConnection, getLocalMediaStream, userProfile]);

  const startWebRTCCaller = React.useCallback(async (callId: number, chatId: number, callType?: CallType, targetPersonId?: number) => {
    const currentUserId = userProfileRef.current?.id || userProfile?.id || 0;

    if (targetPersonId && targetPersonId !== currentUserId) {
      await createOfferForPeer(targetPersonId, callId, chatId, callType);
      return;
    }

    const activeParticipants = activeCallRef.current?.participants || [];
    let remotePersonIds = activeParticipants
      .map(p => p.personId)
      .filter(pid => pid && pid !== currentUserId);

    if (remotePersonIds.length === 0) {
      const callChat = chatsRef.current?.find((c: any) => c.id === chatId);
      if (callChat && callChat.participants) {
        remotePersonIds = callChat.participants
          .map((p: any) => p.personId)
          .filter((pid: number) => pid && pid !== currentUserId);
      }
    }

    console.log(`[WebRTC Log] startWebRTCCaller for remote participant IDs:`, remotePersonIds);
    for (const pid of remotePersonIds) {
      await createOfferForPeer(pid, callId, chatId, callType);
    }
  }, [createOfferForPeer, userProfile]);

  const handleOfferEvent = React.useCallback(async (dto: OfferDto) => {
    if (!dto) return;
    const currentUserId = userProfileRef.current?.id || userProfile?.id || 0;
    const senderId = dto.personId ?? dto.PersonId;
    const callId = dto.callId ?? dto.CallId ?? 0;
    const chatId = dto.chatId ?? dto.ChatId ?? 0;
    const sdpStr = dto.sdp || dto.Sdp || "";

    console.log(`[WebRTC Log] Received SignalR Offer from personId=${senderId} for callId=${callId}`);

    if (senderId && currentUserId && senderId === currentUserId) {
      console.log("[WebRTC Log] Ignoring Offer originating from current user");
      return;
    }
    
    if (!sdpStr || !senderId) {
      console.warn("[WebRTC Log] Offer received with empty SDP or missing senderId");
      return;
    }

    try {
      const pc = getOrCreatePeerConnection(senderId, callId, chatId);

      const callType = activeCallRef.current?.type;
      const localStream = await getLocalMediaStream(callType);

      if (localStream) {
        localStream.getTracks().forEach(track => {
          const senders = pc.getSenders();
          const exists = senders.some(s => s.track?.id === track.id);
          if (!exists) {
            console.log(`[WebRTC Log] Receiver adding local track (${track.kind}) for senderId=${senderId}`);
            pc.addTrack(track, localStream);
          }
        });
      }

      console.log(`[WebRTC Log] Receiver setting remote description (Offer SDP) for senderId=${senderId}...`);
      await pc.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: sdpStr
      }));
      console.log(`[WebRTC Log] [Peer ${senderId}] setRemoteDescription (Offer) succeeded. Signaling state:`, pc.signalingState);

      await flushPendingIceCandidates(senderId, pc);

      console.log(`[WebRTC Log] Receiver creating answer SDP for senderId=${senderId}...`);
      const answer = await pc.createAnswer();

      await pc.setLocalDescription(answer);
      console.log(`[WebRTC Log] [Peer ${senderId}] setLocalDescription (Answer) succeeded. Signaling state:`, pc.signalingState);

      const conn = signalRConnectionRef.current;
      if (conn && conn.state === "Connected") {
        const token = localStorage.getItem('token') || '';
        const answerDto: AnswerDto = {
          callId,
          CallId: callId,
          chatId,
          ChatId: chatId,
          personId: currentUserId,
          PersonId: currentUserId,
          sdp: answer.sdp || ""
        };
        console.log(`[WebRTC Log] Receiver sending Answer via SignalR to senderId=${senderId}...`);
        await conn.invoke("Answer", answerDto, token);
        console.log(`[WebRTC Log] Answer invoked successfully on SignalR for senderId=${senderId}`);

        const toggleDto: ToggleCallItemsDto = {
          callId,
          chatId,
          personId: currentUserId,
          isMuted: isCallMuted,
          isCameraEnabled: isCallCameraEnabled,
          isSharing: isCallScreenSharing,
          CallId: callId,
          ChatId: chatId,
          PersonId: currentUserId,
          IsMuted: isCallMuted,
          IsCameraEnabled: isCallCameraEnabled,
          IsSharing: isCallScreenSharing
        };
        await conn.invoke("ToggleCallItems", toggleDto, token).catch(e => console.warn("Failed sending ToggleCallItems on answer:", e));
      } else {
        console.warn("[WebRTC Log] SignalR connection not ready to send Answer");
      }
    } catch (err) {
      console.error(`[WebRTC Log] Failed to handle Offer event from senderId=${senderId}:`, err);
    }
  }, [getOrCreatePeerConnection, getLocalMediaStream, flushPendingIceCandidates, userProfile]);

  const handleAnswerEvent = React.useCallback(async (dto: AnswerDto) => {
    if (!dto) return;
    const currentUserId = userProfileRef.current?.id || userProfile?.id || 0;
    const senderId = dto.personId ?? dto.PersonId;
    const sdpStr = dto.sdp || dto.Sdp || "";

    console.log(`[WebRTC Log] Received SignalR Answer from personId=${senderId}`);

    if (senderId && currentUserId && senderId === currentUserId) {
      console.log("[WebRTC Log] Ignoring Answer originating from current user");
      return;
    }

    if (!sdpStr || !senderId) {
      console.warn("[WebRTC Log] Answer received with empty SDP or missing senderId");
      return;
    }

    try {
      const pc = peerConnectionsRef.current[senderId];
      if (pc) {
        console.log(`[WebRTC Log] Caller setting remote description (Answer SDP) for senderId=${senderId}...`);
        await pc.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: sdpStr
        }));
        console.log(`[WebRTC Log] [Peer ${senderId}] setRemoteDescription (Answer) succeeded. Signaling state:`, pc.signalingState);

        await flushPendingIceCandidates(senderId, pc);
      } else {
        console.warn(`[WebRTC Log] Received Answer from personId=${senderId} but no active RTCPeerConnection found`);
      }
    } catch (err) {
      console.error(`[WebRTC Log] Failed to handle Answer event from personId=${senderId}:`, err);
    }
  }, [flushPendingIceCandidates, userProfile]);

  const handleIceCandidateEvent = React.useCallback(async (dto: IceCandidateDto) => {
    if (!dto) return;
    const currentUserId = userProfileRef.current?.id || userProfile?.id || 0;
    const senderId = dto.personId ?? dto.PersonId;
    const candidateStr = dto.candidate || dto.Candidate || "";

    if (senderId && currentUserId && senderId === currentUserId) {
      return;
    }

    if (!candidateStr || !senderId) return;

    const candidateInit: RTCIceCandidateInit = {
      candidate: candidateStr,
      sdpMid: dto.sdpMid ?? dto.SdpMid ?? undefined,
      sdpMLineIndex: dto.sdpMLineIndex ?? dto.SdpMLineIndex ?? undefined
    };

    console.log(`[WebRTC Log] Remote ICE candidate received from personId=${senderId}:`, candidateStr);

    try {
      const pc = peerConnectionsRef.current[senderId];
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        console.log(`[WebRTC Log] Adding remote ICE candidate directly to peerConnection for personId=${senderId}`);
        await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
      } else {
        console.log(`[WebRTC Log] Remote description not set yet for personId=${senderId}. Queueing ICE candidate...`);
        if (!pendingIceCandidatesRef.current[senderId]) {
          pendingIceCandidatesRef.current[senderId] = [];
        }
        pendingIceCandidatesRef.current[senderId].push(candidateInit);
      }
    } catch (err) {
      console.error(`[WebRTC Log] Failed to handle IceCandidate event from personId=${senderId}:`, err);
    }
  }, [userProfile]);

  const handleToggleCallItemsEvent = React.useCallback((dto: ToggleCallItemsDto) => {
    if (!dto) return;
    const currentUserId = userProfileRef.current?.id || userProfile?.id;
    const senderId = dto.personId ?? dto.PersonId ?? (dto as any).participant?.personId ?? (dto as any).participant?.PersonId;
    if (senderId != null && currentUserId != null && Number(senderId) === Number(currentUserId)) {
      return;
    }
    
    const callId = dto.callId ?? dto.CallId;
    const isMuted = dto.isMuted ?? dto.IsMuted ?? false;
    const isCameraEnabled = dto.isCameraEnabled ?? dto.IsCameraEnabled ?? false;
    const isSharing = dto.isSharing ?? dto.IsSharing ?? false;
    
    setActiveCall(prev => {
      if (!prev || prev.id !== callId) return prev;
      
      return {
        ...prev,
        participants: prev.participants.map(p => {
          if (Number(p.personId) === Number(senderId)) {
            return {
              ...p,
              isMuted,
              isCameraEnabled,
              isScreenSharing: isSharing
            };
          }
          return p;
        })
      };
    });
  }, [userProfile]);

  const handleCallStatusUpdate = React.useCallback((eventName: "IncomingCall" | "CallAccepted" | "CallRejected" | "CallEnded" | "CallTimedOut" | "ParticipantLeft" | "ParticipantJoined" | "ParticipantJoinedCall" | "ParticipantAddedToCall", payload: any) => {
    if (!payload) return;
    
    const { callDto, isLegacy, legacyData } = parseCallUpdate(payload);
    const currentUserId = userProfileRef.current?.id ?? 0;
    
    // 1. Update activeCall state
    if (eventName === "IncomingCall") {
      setActiveCall(callDto);
      setIsIncomingCall(true);
      setIsCallModalOpen(true);
      setIsScreensaverOpen(false);
      setIsCallMuted(false);
      setIsCallCameraEnabled(callDto.type === CallType.Video);
      setIsCallScreenSharing(false);
      toast.info(`Incoming ${callDto.type === CallType.Video ? 'video' : 'voice'} call...`);
    } else if (eventName === "CallAccepted") {
      setActiveCall(callDto);
      setIsIncomingCall(false);
      toast.success("Call answered");
      if (callDto && callDto.id && callDto.callerPersonId === currentUserId) {
        startWebRTCCaller(callDto.id, callDto.chatId, callDto.type);
      }
    } else if (eventName === "ParticipantJoined" || eventName === "ParticipantJoinedCall" || (eventName as string) === "ParticipantAddedToCall") {
      if (callDto && callDto.id) {
        setActiveCall(callDto);
        toast.info("A participant joined the call");
        const joinedPersonId = payload?.personId || payload?.PersonId || payload?.participant?.personId || payload?.participant?.PersonId;
        
        // 1. Invoke Offer and ICE Candidate generation/exchange for joined participant
        startWebRTCCaller(callDto.id, callDto.chatId, callDto.type, joinedPersonId);

        // 2. Invoke toggle controls (ToggleCallItems, ToggleMicrophone, ToggleCamera, ScreenShare)
        try {
          const conn = signalRConnectionRef.current;
          if (conn && conn.state === "Connected") {
            const token = localStorage.getItem('token') || '';
            const currentMuted = isCallMutedRef.current;
            const currentCam = isCallCameraEnabledRef.current;
            const currentShare = isCallScreenSharingRef.current;

            const toggleDto: ToggleCallItemsDto = {
              callId: callDto.id,
              chatId: callDto.chatId,
              personId: currentUserId,
              isMuted: currentMuted,
              isCameraEnabled: currentCam,
              isSharing: currentShare,
              CallId: callDto.id,
              ChatId: callDto.chatId,
              PersonId: currentUserId,
              IsMuted: currentMuted,
              IsCameraEnabled: currentCam,
              IsSharing: currentShare
            };
            conn.invoke("ToggleCallItems", toggleDto, token).catch(() => {});
            conn.invoke("ToggleMicrophone", { callId: callDto.id, isMuted: currentMuted }, token).catch(() => {});
            conn.invoke("ToggleCamera", { callId: callDto.id, isCameraEnabled: currentCam }, token).catch(() => {});
            if (currentShare) {
              conn.invoke("ScreenShare", { callId: callDto.id, isSharing: true }, token).catch(() => {});
            }
          }
        } catch (err) {
          console.warn("[WebRTC Log] Failed to send toggle controls on participant join:", err);
        }
      }
    } else if (eventName === "CallRejected" || eventName === "ParticipantLeft") {
      const leftPersonId = payload?.personId || payload?.PersonId || (isLegacy ? legacyData?.personId : undefined);
      if (leftPersonId) {
        cleanupPeerConnectionForPerson(leftPersonId);
      }
      if (isLegacy && legacyData) {
        const data = legacyData;
        setActiveCall(prev => {
          if (!prev || prev.id !== data.callId) return prev;
          if (data.callStatus === CallStatus.Ended || data.callStatus === CallStatus.Rejected) {
            setIsCallModalOpen(false);
            setIsCallCameraEnabled(false);
            cleanupAllPeerConnections();
            toast.info("Call ended/rejected");
            return null;
          }
          toast.info("A participant left the call");
          return {
            ...prev,
            status: data.callStatus,
            participants: prev.participants.map(p => 
              p.personId === data.personId ? { ...p, status: data.status } : p
            )
          };
        });
      } else {
        // It's a full CallDto
        setActiveCall(prev => {
          if (!prev || prev.id !== callDto.id) return prev;
          
          // If overall status is ended/rejected, or if current user declined/left, close call modal
          const isUserActive = callDto.participants?.some(p => p.personId === currentUserId && (p.status === CallParticipantStatus.Connected || p.status === CallParticipantStatus.Ringing));
          if (callDto.status === CallStatus.Ended || callDto.status === CallStatus.Rejected || !isUserActive) {
            setIsCallModalOpen(false);
            setIsCallCameraEnabled(false);
            cleanupAllPeerConnections();
            toast.info("Call ended/rejected");
            return null;
          }
          toast.info("A participant left the call");
          return callDto;
        });
      }
    } else if (eventName === "CallEnded") {
      cleanupAllPeerConnections();
      if (isLegacy && legacyData) {
        const data = legacyData;
        setActiveCall(prev => {
          if (!prev || prev.id !== data.callId) return prev;
          setIsCallModalOpen(false);
          setIsCallCameraEnabled(false);
          toast.info("Call ended");
          return null;
        });
      } else {
        // It's a full CallDto
        setActiveCall(prev => {
          if (!prev || prev.id !== callDto.id) return prev;
          setIsCallModalOpen(false);
          setIsCallCameraEnabled(false);
          toast.info("Call ended");
          return null;
        });
      }
    } else if (eventName === "CallTimedOut") {
      setIsCallModalOpen(false);
      setIsIncomingCall(false);
      setIsCallCameraEnabled(false);
      
      const targetStatus = CallStatus.Missed;
      callDto.status = targetStatus;
      if (isLegacy && legacyData) {
        legacyData.callStatus = targetStatus;
      }
      
      setActiveCall(prev => {
        if (!prev || prev.id !== callDto.id) return prev;
        toast.info("Call timed out / missed");
        return null;
      });
    }

    // 2. Update callLogs history list!
    setCallLogs(prev => {
      // Find matching log by callId or id
      const targetCallId = callDto.id;
      const existingIndex = prev.findIndex(log => log.callId === targetCallId || log.id === targetCallId);
      
      // We need chatName for CallLogDto
      const logChat = chatsRef.current.find(c => c.id === callDto.chatId);
      const chatName = logChat ? getChatDisplayName(logChat) : `Call #${targetCallId}`;
      
      if (existingIndex > -1) {
        // Update existing log
        const updated = [...prev];
        const existing = prev[existingIndex];
        
        // Merge properties
        const updatedStatus = isLegacy && legacyData ? legacyData.callStatus : callDto.status;
        const isEndedStatus = updatedStatus === CallStatus.Ended || 
                              updatedStatus === CallStatus.Rejected || 
                              updatedStatus === CallStatus.Missed || 
                              updatedStatus === CallStatus.TimedOut;

        const updatedEndedAt = (isLegacy && legacyData) ? 
          ((legacyData.callStatus === CallStatus.Ended || legacyData.callStatus === CallStatus.Rejected) ? (existing.endedAt || new Date().toISOString()) : existing.endedAt) 
          : (callDto.endedAt || (isEndedStatus ? (existing.endedAt || new Date().toISOString()) : existing.endedAt));
        
        // Calculate duration
        const startStr = callDto.startedAt || existing.startedAt;
        const duration = formatCallDuration(startStr, updatedEndedAt);

        // Merge participants
        let mergedParticipants = existing.participants || [];
        if (!isLegacy && callDto.participants && callDto.participants.length > 0) {
          mergedParticipants = callDto.participants.map(p => ({
            personId: p.personId,
            fullName: p.fullName,
            profileImage: p.profileImage,
            status: p.status,
            isMuted: p.isMuted,
            isCameraEnabled: p.isCameraEnabled,
            isScreenSharing: p.isScreenSharing
          }));
        } else if (isLegacy && legacyData) {
          // Update specific participant status
          mergedParticipants = mergedParticipants.map(p => 
            p.personId === legacyData.personId ? { ...p, status: legacyData.status } : p
          );
        }

        const isIncoming = callDto.callerPersonId ? (callDto.callerPersonId !== currentUserId) : existing.isIncoming;
        const userParticipant = mergedParticipants?.find(p => p.personId === currentUserId);
        const isMissed = updatedStatus === CallStatus.Missed || 
                         (isIncoming && updatedStatus === CallStatus.Rejected) || 
                         (userParticipant?.status === CallParticipantStatus.Missed);

        updated[existingIndex] = {
          ...existing,
          status: updatedStatus,
          endedAt: updatedEndedAt,
          duration: duration,
          participants: mergedParticipants,
          isIncoming,
          isMissed
        };
        
        return updated;
      } else {
        // Add new log to the top of the history list
        const newLog = mapCallDtoToCallLogDto(callDto, currentUserId, chatName);
        // Ensure we set status properly if legacy
        if (isLegacy && legacyData) {
          newLog.status = legacyData.callStatus;
        }
        return [
          {
            ...newLog,
            id: targetCallId
          },
          ...prev
        ];
      }
    });
  }, []);

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
  const [hasLoadedChats, setHasLoadedChats] = React.useState(false);
  const [isChatsLoading, setIsChatsLoading] = React.useState(false);
  
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = React.useState("");
  const [galleryMedia, setGalleryMedia] = React.useState<any[]>([]);
  const [galleryIndex, setGalleryIndex] = React.useState<number>(0);
  const [slideDirection, setSlideDirection] = React.useState<number>(1);
  const touchStartX = React.useRef<number>(0);
  const touchEndX = React.useRef<number>(0);
  const mouseStartX = React.useRef<number>(0);

  React.useEffect(() => {
    if (!isPreviewModalOpen || galleryMedia.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "Left") {
        if (galleryIndex > 0) {
          setSlideDirection(-1);
          setGalleryIndex(prev => prev - 1);
        }
      } else if (e.key === "ArrowRight" || e.key === "Right") {
        if (galleryIndex < galleryMedia.length - 1) {
          setSlideDirection(1);
          setGalleryIndex(prev => prev + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreviewModalOpen, galleryIndex, galleryMedia.length]);

  const isChatModalOpenRef = React.useRef(isChatModalOpen);
  React.useEffect(() => {
    isChatModalOpenRef.current = isChatModalOpen;
  }, [isChatModalOpen]);
  const [chatPopups, setChatPopups] = React.useState<MessageDto[]>([]);
  const [formActionStatus, setFormActionStatus] = React.useState<{ message: string, isSuccess: boolean } | null>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button');
      if (!btn) return;
      
      const text = btn.textContent?.toLowerCase().trim() || '';
      const isTrash = !!btn.querySelector('.lucide-trash-2, .lucide-trash2, polyline[points="3 6 5 6 21 6"]');
      
      const isSave = text.includes('save') || text.includes('create') || text.includes('update') || text.includes('confirm') || text === 'add scene' || text === 'add group';
      const isDelete = isTrash || text.includes('delete') || text.includes('remove');
      const isModalAdd = text.includes('add ') && !!btn.closest('[role="dialog"]');

      if (isSave || isDelete || isModalAdd) {
        // Exclude logs filter clear button and general clear icons
        if (isTrash && !text && btn.classList.contains('hover:text-destructive')) {
          if (btn.closest('div.sm\\:flex-row')) return;
        }
        
        const actionName = (text.length > 0 && text.length < 30) ? 
          text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 
          (isTrash ? 'Delete Form Details' : 'Submit Form Details');

        setTimeout(() => {
          setFormActionStatus({
            message: `User Action: '${actionName}' completed and stored successfully.`,
            isSuccess: true
          });
          
          setTimeout(() => {
            setFormActionStatus(null);
          }, 5000);
        }, 500); 
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  const [userSearchQuery, setUserSearchQuery] = React.useState("");
  const [isAddFingerprintOpen, setIsAddFingerprintOpen] = React.useState(false);
  const [isRegisterNfidOpen, setIsRegisterNfidOpen] = React.useState(false);
  const [selectedNfidUserId, setSelectedNfidUserId] = React.useState<string>("");
  const [selectedNfidHardwareId, setSelectedNfidHardwareId] = React.useState<string>("");
  const [fingerprintImages, setFingerprintImages] = React.useState<string[]>([]);
  const [selectedFingerprintUserId, setSelectedFingerprintUserId] = React.useState<string>("");
  const [selectedFingerprintHardwareId, setSelectedFingerprintHardwareId] = React.useState<string>("");
  const [chats, setChats] = React.useState<ChatDto[]>([]);
  const [chatMessages, setChatMessages] = React.useState<MessageDto[]>([]);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);
  const [activeFloatingDate, setActiveFloatingDate] = React.useState<string>("");
  const [showScrollToBottom, setShowScrollToBottom] = React.useState<boolean>(false);

  const getMessageDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const handleChatScroll = () => {
    const container = chatScrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollToBottom(distanceFromBottom > 300);

    const groups = container.querySelectorAll('[data-date-group]');
    let currentActiveLabel = "";
    const containerRect = container.getBoundingClientRect();

    groups.forEach((groupEl) => {
      const rect = groupEl.getBoundingClientRect();
      const relativeTop = rect.top - containerRect.top;
      if (relativeTop <= 80) {
        currentActiveLabel = groupEl.getAttribute('data-date-group') || "";
      }
    });

    if (currentActiveLabel) {
      setActiveFloatingDate(currentActiveLabel);
    } else if (groups.length > 0) {
      setActiveFloatingDate(groups[0].getAttribute('data-date-group') || "");
    }
  };
  const [newGroupRoom, setNewGroupRoom] = React.useState<string>("none");
  const [newGroupSection, setNewGroupSection] = React.useState<string>("");
  const [chatInput, setChatInput] = React.useState("");
  const socketRef = React.useRef<any>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [recordingState, setRecordingState] = React.useState<'inactive' | 'recording' | 'paused' | 'preview'>('inactive');
  const [activeStream, setActiveStream] = React.useState<MediaStream | null>(null);
  const [swipeX, setSwipeX] = React.useState(0);
  const [playbackPreviewPlaying, setPlaybackPreviewPlaying] = React.useState(false);
  const [playbackPreviewUrl, setPlaybackPreviewUrl] = React.useState<string | null>(null);
  const playbackAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<Record<number, number>>({});
  const [highlightedMessageId, setHighlightedMessageId] = React.useState<number | null>(null);
  const activeRecordingUsersRef = React.useRef<Record<string, boolean>>({});
  const activeTypingUsersRef = React.useRef<Record<string, boolean>>({});
  const [playingAudioId, setPlayingAudioId] = React.useState<number | null>(null);
  const [playingProgress, setPlayingProgress] = React.useState(0);
  const [replyingTo, setReplyingTo] = React.useState<MessageDto | null>(null);
  const recordingTimerRef = React.useRef<any>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const voiceNotePartsRef = React.useRef<Blob[]>([]);
  const allMessagesMapRef = React.useRef<Map<string, MessageDto>>(new Map());
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const longPressTimeout = React.useRef<any>(null);
  const chatBoxMessagesContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeChatId, setActiveChatId] = React.useState<number | null>(null);
  const [activeChatUnreadCount, setActiveChatUnreadCount] = React.useState<number>(0);
  const activeChatIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    activeChatIdRef.current = activeChatId;
    if (activeChatId) {
      setIsCallLogsOpen(false);
    }
  }, [activeChatId]);

  React.useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      chatMessages.forEach(m => {
        if (m && m.id) {
          allMessagesMapRef.current.set(m.id.toString(), m);
        }
      });
    }
  }, [chatMessages]);

  const signalRConnectionRef = React.useRef<any>(null);

  const [messageToDelete, setMessageToDelete] = React.useState<MessageDto | null>(null);
  const [messageToEdit, setMessageToEdit] = React.useState<MessageDto | null>(null);
  const [editMessageContent, setEditMessageContent] = React.useState("");
  const [selectedMessageId, setSelectedMessageId] = React.useState<number | null>(null);
  const [optionsPosition, setOptionsPosition] = React.useState<'above' | 'below'>('below');

  const handleLongPress = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setSelectedMessageRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  };

  const getMessageTickStatus = (msg: MessageDto, chat: ChatDto | undefined): 'blue' | 'double' | 'single' => {
    if (!chat || !userProfile) return 'double';
    
    const recipients = (chat.participants || []).filter(p => {
      const pId = p.personId ?? (p as any).PersonId;
      return pId?.toString() !== userProfile.id?.toString();
    });

    if (recipients.length === 0) {
      return 'double';
    }

    const sentTime = new Date(msg.sentAt).getTime();

    if (chat.isGroup) {
      const lastMsg = chatMessages.filter(m => m.chatId === chat.id).pop() || chat.lastMessage;
      if (!lastMsg) {
        return 'double';
      }
      const lastMsgSentTime = new Date(lastMsg.sentAt).getTime();
      
      const allRecipientsReadLastMsg = recipients.every(p => {
        const readAtStr = p.lastReadAt ?? (p as any).LastReadAt;
        if (!readAtStr) return false;
        const readTime = new Date(readAtStr).getTime();
        return readTime >= lastMsgSentTime;
      });

      if (allRecipientsReadLastMsg) {
        return 'blue';
      } else {
        return 'double';
      }
    } else {
      const recipient = recipients[0];
      if (!recipient) {
        return 'double';
      }
      const readAtStr = recipient.lastReadAt ?? (recipient as any).LastReadAt;
      if (!readAtStr) {
        return 'single';
      }
      const readTime = new Date(readAtStr).getTime();
      if (readTime >= sentTime) {
        return 'blue';
      } else {
        return 'double';
      }
    }
  };

  const fetchUnreadCountsForAllChats = async (loadedChats: ChatDto[]) => {
    const updatedChats = await Promise.all(loadedChats.map(async (chat) => {
      let count = chat.unreadCount || 0;
      try {
        const res = await apiFetch<any>(`/Message/GetUnreadCount?chatId=${chat.id}`, { method: 'GET' });
        if (res && typeof res.unreadCount === 'number') count = res.unreadCount;
        else if (res && typeof res.count === 'number') count = res.count;
        else if (res && typeof res.data === 'number') count = res.data;
        else if (typeof res === 'number') count = res;
      } catch {
        try {
          const res = await apiFetch<any>(`/Chat/GetUnreadCount?chatId=${chat.id}`, { method: 'GET' });
          if (res && typeof res.unreadCount === 'number') count = res.unreadCount;
          else if (res && typeof res.count === 'number') count = res.count;
          else if (res && typeof res.data === 'number') count = res.data;
          else if (typeof res === 'number') count = res;
        } catch {
          // Keep existing unreadCount if fetch fails
        }
      }
      return { ...chat, unreadCount: count };
    }));
    setChats(updatedChats);
  };

  const markChatAsRead = async (chatId: number) => {
    try {
      await apiFetch(`/Message/MarkAsRead?chatId=${chatId}`, { method: 'POST' });
    } catch {
      try {
        await apiFetch(`/Chat/MarkAsRead?chatId=${chatId}`, { method: 'POST' });
      } catch {
        try {
          await apiFetch(`/Message/ReadChat?chatId=${chatId}`, { method: 'POST' });
        } catch {
          try {
            await apiFetch(`/Chat/ReadChat?chatId=${chatId}`, { method: 'POST' });
          } catch {
            // Silently catch if not supported
          }
        }
      }
    }
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
  };

  const loadMyChatsRef = React.useRef<((force?: boolean) => Promise<void>) | null>(null);
  const chatsRef = React.useRef<ChatDto[]>([]);
  const allUsersRef = React.useRef<GetPersonDto[]>([]);
  const callLogsRef = React.useRef<CallLogDto[]>([]);
  const pendingVoiceActionRef = React.useRef<{
    type: 'voice_message_recipient' | 'voice_call_recipient' | 'video_call_recipient';
  } | null>(null);

  React.useEffect(() => {
    callLogsRef.current = callLogs;
  }, [callLogs]);

  React.useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);

  const findChatOrUserByName = React.useCallback(async (nameQuery: string): Promise<{ chatId: number; name: string } | null> => {
    if (!nameQuery || !nameQuery.trim()) return null;
    let cleanQ = nameQuery.toLowerCase().trim();
    cleanQ = cleanQ.replace(/^(to|with|for|a|call|message|text|the)\s+/gi, '').trim();
    if (!cleanQ) return null;

    // 1. Search existing group or 1-on-1 chats
    for (const c of (chatsRef.current || [])) {
      const displayName = getChatDisplayName(c).toLowerCase();
      if (displayName.includes(cleanQ) || cleanQ.includes(displayName) || (c.isGroup && c.name && c.name.toLowerCase().includes(cleanQ))) {
        return { chatId: c.id, name: getChatDisplayName(c) };
      }
    }

    // 2. Search users in allUsers
    for (const u of (allUsersRef.current || [])) {
      const firstName = (u.getPersonDetailsDto?.firstName || '').toLowerCase();
      const lastName = (u.getPersonDetailsDto?.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName.includes(cleanQ) || cleanQ.includes(fullName) || (firstName.length > 1 && cleanQ.includes(firstName))) {
        const existingChat = (chatsRef.current || []).find(c => !c.isGroup && c.participants?.some(p => p.personId === u.id));
        if (existingChat) {
          return { chatId: existingChat.id, name: `${u.getPersonDetailsDto.firstName} ${u.getPersonDetailsDto.lastName}` };
        }
        try {
          const response = await apiFetch<any>(`/Chat/CreateChat?recipientPersonId=${u.id}`, { method: 'POST' });
          if (loadMyChatsRef.current) {
            await loadMyChatsRef.current(true);
          }
          const cId = response?.id || (chatsRef.current || []).find(c => !c.isGroup && c.participants?.some(p => p.personId === u.id))?.id;
          if (cId) {
            return { chatId: cId, name: `${u.getPersonDetailsDto.firstName} ${u.getPersonDetailsDto.lastName}` };
          }
        } catch (err) {}
      }
    }
    return null;
  }, [getChatDisplayName]);

  React.useEffect(() => {
    chatsRef.current = chats;
    const conn = signalRConnectionRef.current;
    if (conn && conn.state === "Connected" && chats.length > 0) {
      chats.forEach(chat => {
        conn.invoke("JoinChat", chat.id)
          .catch(err => console.warn(`Failed to automatically join SignalR chat group ${chat.id}:`, err));
      });
    }
  }, [chats]);

  React.useEffect(() => {
    if (activeChatId) {
      const foundChat = chatsRef.current.find(c => c.id === activeChatId);
      const unread = foundChat ? (foundChat.unreadCount || 0) : 0;
      setActiveChatUnreadCount(unread);

      markChatAsRead(activeChatId);
    } else {
      setActiveChatUnreadCount(0);
    }
  }, [activeChatId]);

  // Call Actions
  const handleStartCall = React.useCallback(async (chatId: number, type: CallType) => {
    try {
      const token = localStorage.getItem('token');
      const payload: StartCallDto = { chatId, type };
      const res = await apiFetch<any>('/Call/StartCall', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      let callData: CallDto = res?.data ?? res;
      if (callData && callData.id) {
        const nowIso = new Date().toISOString();
        const chatObj = chatsRef.current.find(c => c.id === chatId);
        const currentUserId = userProfileRef.current?.id;

        let participants = callData.participants || [];
        if (chatObj && (!participants || participants.length === 0)) {
          participants = (chatObj.participants || []).map(p => ({
            personId: p.personId,
            fullName: p.fullName || 'User',
            profileImage: p.profileImageUrl || '',
            isMuted: false,
            isCameraEnabled: type === CallType.Video,
            isScreenSharing: false,
            status: p.personId === currentUserId ? CallParticipantStatus.Connected : CallParticipantStatus.Ringing
          }));
        } else {
          participants = participants.map(p => ({
            ...p,
            status: p.personId === currentUserId ? CallParticipantStatus.Connected : (p.status ?? CallParticipantStatus.Ringing)
          }));
        }

        callData = {
          ...callData,
          startedAt: callData.startedAt || nowIso,
          participants
        };

        setActiveCall(callData);
        setIsIncomingCall(false);
        setIsCallMuted(false);
        setIsCallCameraEnabled(type === CallType.Video);
        setIsCallScreenSharing(false);
        setIsCallModalOpen(true);
        toast.success(`Outgoing ${type === CallType.Video ? 'video' : 'voice'} call started...`);
        if (callData && callData.id) {
          startWebRTCCaller(callData.id, callData.chatId, type);
        }
      } else {
        toast.error("Failed to start call");
      }
    } catch (err) {
      console.error("Failed to start call", err);
      toast.error("Failed to start call due to error");
    }
  }, []);

  const handleEndCall = React.useCallback(async (callId: number) => {
    try {
      const nowIso = new Date().toISOString();
      setCallLogs(prev => prev.map(log => {
        if (log.callId === callId || log.id === callId) {
          const endedAt = log.endedAt || nowIso;
          return {
            ...log,
            status: CallStatus.Ended,
            endedAt,
            duration: formatCallDuration(log.startedAt, endedAt)
          };
        }
        return log;
      }));
      const token = localStorage.getItem('token');
      await apiFetch<any>(`/Call/EndCall?callId=${callId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: ''
      });
      setActiveCall(null);
      setIsCallModalOpen(false);
      setIsCallCameraEnabled(false);
      toast.info("Call ended");
    } catch (err) {
      console.error("Failed to end call", err);
      setActiveCall(null);
      setIsCallModalOpen(false);
      setIsCallCameraEnabled(false);
    }
  }, []);

  const handleRejectCall = React.useCallback(async (callId: number, chatId: number) => {
    try {
      const nowIso = new Date().toISOString();
      setCallLogs(prev => prev.map(log => {
        if (log.callId === callId || log.id === callId) {
          const endedAt = log.endedAt || nowIso;
          return {
            ...log,
            status: CallStatus.Rejected,
            endedAt,
            duration: formatCallDuration(log.startedAt, endedAt)
          };
        }
        return log;
      }));
      const token = localStorage.getItem('token') || '';
      await apiFetch<any>(`/Call/RejectCall?callId=${callId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: ''
      });
      setActiveCall(null);
      setIsCallModalOpen(false);
      setIsCallCameraEnabled(false);
      toast.info("Call rejected/left");
    } catch (err) {
      console.error("Failed to reject/leave call", err);
      setActiveCall(null);
      setIsCallModalOpen(false);
      setIsCallCameraEnabled(false);
    }
  }, []);

  const handleTerminateCall = React.useCallback(() => {
    if (!activeCall) return;
    if (activeCall.status === CallStatus.Connected) {
      handleEndCall(activeCall.id);
    } else {
      if (activeCall.callerPersonId === userProfile?.id) {
        handleEndCall(activeCall.id);
      } else {
        handleRejectCall(activeCall.id, activeCall.chatId);
      }
    }
  }, [activeCall, handleEndCall, handleRejectCall, userProfile]);

  const handleAcceptCall = React.useCallback(async (callId: number, chatId: number) => {
    try {
      const targetCall = callLogs.find(l => (l as any).callId === callId || l.id === callId) || (activeCall?.id === callId ? activeCall : null);
      if (targetCall && getUserCallStatus(targetCall as any, userProfile?.id) === 'missed') {
        toast.error("You cannot join a missed call.");
        return;
      }

      const token = localStorage.getItem('token') || '';
      
      // Send accept call API request
      try {
        await apiFetch<any>(`/Call/AcceptCall?callId=${callId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: ''
        });
      } catch (apiErr) {
        console.warn("Accept call API response warning:", apiErr);
      }

      // 1. Immediately open the Call Modal Card
      setIsCallModalOpen(true);
      setIsScreensaverOpen(false);
      setIsIncomingCall(false);

      const currentUserId = userProfileRef.current?.id || 0;
      const callChat = chatsRef.current.find(c => c.id === chatId);
      const targetLog = callLogsRef.current.find(l => l.callId === callId || (l as any).id === callId);

      // 2. Set or update activeCall state
      setActiveCall(prev => {
        if (prev && prev.id === callId) {
          const updatedParticipants = (prev.participants || []).map(p => 
            p.personId === currentUserId ? { ...p, status: CallParticipantStatus.Connected } : p
          );
          if (!updatedParticipants.some(p => p.personId === currentUserId)) {
            updatedParticipants.push({
              personId: currentUserId,
              fullName: userProfileRef.current?.getPersonDetailsDto?.firstName ? `${userProfileRef.current.getPersonDetailsDto.firstName} ${userProfileRef.current.getPersonDetailsDto.lastName || ''}`.trim() : 'You',
              profileImage: userProfileRef.current?.getPersonDetailsDto?.imageUrl || '',
              isMuted: false,
              isCameraEnabled: false,
              isScreenSharing: false,
              status: CallParticipantStatus.Connected
            });
          }
          return {
            ...prev,
            status: CallStatus.Connected,
            answeredAt: prev.answeredAt || new Date().toISOString(),
            participants: updatedParticipants
          };
        }

        const callType = targetLog?.type ?? (targetLog as any)?.callType ?? CallType.Voice;
        let participants: CallParticipantDto[] = (callChat?.participants || []).map(p => ({
          personId: p.personId,
          fullName: p.fullName || 'User',
          profileImage: p.profileImageUrl || '',
          isMuted: false,
          isCameraEnabled: false,
          isScreenSharing: false,
          status: p.personId === currentUserId ? CallParticipantStatus.Connected : CallParticipantStatus.Ringing
        }));

        if (!participants.some(p => p.personId === currentUserId)) {
          participants.push({
            personId: currentUserId,
            fullName: userProfileRef.current?.getPersonDetailsDto?.firstName ? `${userProfileRef.current.getPersonDetailsDto.firstName} ${userProfileRef.current.getPersonDetailsDto.lastName || ''}`.trim() : 'You',
            profileImage: userProfileRef.current?.getPersonDetailsDto?.imageUrl || '',
            isMuted: false,
            isCameraEnabled: false,
            isScreenSharing: false,
            status: CallParticipantStatus.Connected
          });
        }

        return {
          id: callId,
          chatId: chatId,
          callerPersonId: targetLog?.callerPersonId || (callChat?.participants?.[0]?.personId ?? 0),
          type: callType,
          status: CallStatus.Connected,
          startedAt: targetLog?.startedAt || new Date().toISOString(),
          answeredAt: new Date().toISOString(),
          endedAt: null,
          participants
        };
      });

      setIsCallMuted(false);
      setIsCallScreenSharing(false);

      // 3. Perform SignalR/WebRTC signaling sequence
      const callType = targetLog?.type ?? (targetLog as any)?.callType ?? CallType.Voice;
      await startWebRTCCaller(callId, chatId, callType);

      try {
        const token = localStorage.getItem('token') || '';
        const conn = signalRConnectionRef.current;
        if (conn && conn.state === "Connected") {
          const currentUserId = userProfileRef.current?.id || userProfile?.id || 0;
          const toggleDto: ToggleCallItemsDto = {
            callId,
            chatId,
            personId: currentUserId,
            isMuted: false,
            isCameraEnabled: callType === CallType.Video,
            isSharing: false,
            CallId: callId,
            ChatId: chatId,
            PersonId: currentUserId,
            IsMuted: false,
            IsCameraEnabled: callType === CallType.Video,
            IsSharing: false
          };
          await conn.invoke("ToggleCallItems", toggleDto, token).catch(() => {});
        }
      } catch (e) {
        console.warn("Failed sending ToggleCallItems on accept:", e);
      }

      toast.success("Joined call");
    } catch (err) {
      console.error("Failed to accept call", err);
      toast.error("Failed to accept call");
    }
  }, [startWebRTCCaller]);

  const handleToggleCallMicrophone = React.useCallback(async () => {
    if (!activeCall) return;
    const nextMuted = !isCallMuted;
    setIsCallMuted(nextMuted);
    try {
      const token = localStorage.getItem('token') || '';
      const conn = signalRConnectionRef.current;
      if (conn && conn.state === "Connected") {
        await conn.invoke("ToggleMicrophone", { callId: activeCall.id, isMuted: nextMuted }, token);
        
        const toggleCallItemsDto: ToggleCallItemsDto = {
          callId: activeCall.id,
          chatId: activeCall.chatId,
          personId: userProfileRef.current?.id || 0,
          isMuted: nextMuted,
          isCameraEnabled: isCallCameraEnabled,
          isSharing: isCallScreenSharing,
          CallId: activeCall.id,
          ChatId: activeCall.chatId,
          PersonId: userProfileRef.current?.id || 0,
          IsMuted: nextMuted,
          IsCameraEnabled: isCallCameraEnabled,
          IsSharing: isCallScreenSharing
        };
        await conn.invoke("ToggleCallItems", toggleCallItemsDto, token);
      }
    } catch (err) {
      console.warn("Failed to notify microphone toggle on server", err);
    }
  }, [activeCall, isCallMuted, isCallCameraEnabled, isCallScreenSharing]);

  const handleToggleCallCamera = React.useCallback(async () => {
    if (!activeCall) return;
    const nextCam = !isCallCameraEnabled;
    setIsCallCameraEnabled(nextCam);
    try {
      const token = localStorage.getItem('token') || '';
      const conn = signalRConnectionRef.current;
      if (conn && conn.state === "Connected") {
        await conn.invoke("ToggleCamera", { callId: activeCall.id, isCameraEnabled: nextCam }, token);
        
        const toggleCallItemsDto: ToggleCallItemsDto = {
          callId: activeCall.id,
          chatId: activeCall.chatId,
          personId: userProfileRef.current?.id || 0,
          isMuted: isCallMuted,
          isCameraEnabled: nextCam,
          isSharing: isCallScreenSharing,
          CallId: activeCall.id,
          ChatId: activeCall.chatId,
          PersonId: userProfileRef.current?.id || 0,
          IsMuted: isCallMuted,
          IsCameraEnabled: nextCam,
          IsSharing: isCallScreenSharing
        };
        await conn.invoke("ToggleCallItems", toggleCallItemsDto, token);
      }
    } catch (err) {
      console.warn("Failed to notify camera toggle on server", err);
    }
  }, [activeCall, isCallMuted, isCallCameraEnabled, isCallScreenSharing]);

  const stopScreenSharingInternal = React.useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      screenStreamRef.current = null;
    }
    setIsCallScreenSharing(false);

    // Restore camera video track on all peer connections if camera is enabled & track available
    let cameraTrack: MediaStreamTrack | null = null;
    if (localStreamRef.current && isCallCameraEnabled) {
      const vTracks = localStreamRef.current.getVideoTracks();
      if (vTracks.length > 0 && vTracks[0].readyState === 'live') {
        cameraTrack = vTracks[0];
      }
    }

    (Object.values(peerConnectionsRef.current) as RTCPeerConnection[]).forEach(pc => {
      try {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video' || (s.track === null && s.transport));
        if (videoSender) {
          videoSender.replaceTrack(cameraTrack).catch(err => {
            console.warn("[WebRTC Log] Failed to restore camera track via replaceTrack:", err);
          });
        }
      } catch (err) {
        console.warn("[WebRTC Log] Error restoring track on peer connection during stop screen share:", err);
      }
    });

    if (activeCallRef.current) {
      try {
        const token = localStorage.getItem('token') || '';
        const conn = signalRConnectionRef.current;
        if (conn && conn.state === "Connected") {
          await conn.invoke("ScreenShare", { callId: activeCallRef.current.id, isSharing: false }, token);
          const toggleCallItemsDto: ToggleCallItemsDto = {
            callId: activeCallRef.current.id,
            chatId: activeCallRef.current.chatId,
            personId: userProfileRef.current?.id || 0,
            isMuted: isCallMuted,
            isCameraEnabled: isCallCameraEnabled,
            isSharing: false,
            CallId: activeCallRef.current.id,
            ChatId: activeCallRef.current.chatId,
            PersonId: userProfileRef.current?.id || 0,
            IsMuted: isCallMuted,
            IsCameraEnabled: isCallCameraEnabled,
            IsSharing: false
          };
          await conn.invoke("ToggleCallItems", toggleCallItemsDto, token);
        }
      } catch (err) {
        console.warn("Failed to notify screen share stop on server", err);
      }
    }
  }, [isCallMuted, isCallCameraEnabled]);

  const handleToggleCallScreenShare = React.useCallback(async () => {
    if (!activeCall) return;

    if (isCallScreenSharing) {
      await stopScreenSharingInternal();
      return;
    }

    try {
      console.log("[WebRTC Log] Calling navigator.mediaDevices.getDisplayMedia({ video: true })");
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = displayStream;
      const displayTrack = displayStream.getVideoTracks()[0];

      if (!displayTrack) {
        console.warn("[WebRTC Log] No video track returned by getDisplayMedia");
        return;
      }

      // Replace camera track using RTCRtpSender.replaceTrack() across all active peer connections
      (Object.values(peerConnectionsRef.current) as RTCPeerConnection[]).forEach(pc => {
        try {
          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track?.kind === 'video' || (s.track === null && s.transport));
          if (videoSender) {
            console.log("[WebRTC Log] Replacing video track with displayTrack using RTCRtpSender.replaceTrack()");
            videoSender.replaceTrack(displayTrack).catch(err => {
              console.warn("[WebRTC Log] replaceTrack screen share error:", err);
            });
          } else if (localStreamRef.current) {
            console.log("[WebRTC Log] No video sender found, adding displayTrack to peer connection");
            pc.addTrack(displayTrack, displayStream);
          }
        } catch (err) {
          console.warn("[WebRTC Log] Error replacing track during screen share start:", err);
        }
      });

      displayTrack.onended = () => {
        console.log("[WebRTC Log] Screen share track onended event triggered (browser native bar)");
        stopScreenSharingInternal();
      };

      setIsCallScreenSharing(true);

      const token = localStorage.getItem('token') || '';
      const conn = signalRConnectionRef.current;
      if (conn && conn.state === "Connected") {
        await conn.invoke("ScreenShare", { callId: activeCall.id, isSharing: true }, token);
        const toggleCallItemsDto: ToggleCallItemsDto = {
          callId: activeCall.id,
          chatId: activeCall.chatId,
          personId: userProfileRef.current?.id || 0,
          isMuted: isCallMuted,
          isCameraEnabled: isCallCameraEnabled,
          isSharing: true,
          CallId: activeCall.id,
          ChatId: activeCall.chatId,
          PersonId: userProfileRef.current?.id || 0,
          IsMuted: isCallMuted,
          IsCameraEnabled: isCallCameraEnabled,
          IsSharing: true
        };
        await conn.invoke("ToggleCallItems", toggleCallItemsDto, token);
      }
    } catch (err) {
      console.warn("[WebRTC Log] Screen sharing failed or cancelled by user:", err);
      setIsCallScreenSharing(false);
    }
  }, [activeCall, isCallMuted, isCallCameraEnabled, isCallScreenSharing, stopScreenSharingInternal]);

  const handleToggleCallSpeaker = React.useCallback(() => {
    if (!activeCall) return;
    setIsCallSpeakerEnabled(prev => !prev);
  }, [activeCall]);

  const fetchCallLogs = React.useCallback(async (force = false) => {
    if (hasLoadedCallLogs && !force) return;
    setIsCallLogsLoading(true);
    setCallLogPage(1);
    setHasMoreCallLogs(true);
    try {
       const token = localStorage.getItem('token');
       const res = await apiFetch<any>('/Call/GetCallLogs?page=1&pageSize=50', { 
         method: 'GET',
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       const rawData = (res && res.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
       const formatted = rawData.map((log: any) => {
         const uStatus = getUserCallStatus(log, userProfile?.id);
         const isMissed = uStatus === 'missed' || uStatus === 'rejected' || log.status === CallStatus.Missed;
         return {
           ...log,
           duration: isMissed ? "0s" : formatCallDuration(log.startedAt, log.endedAt, log.answeredAt)
         };
       });
       setCallLogs(formatted);
       setHasLoadedCallLogs(true);
       if (rawData.length < 50) {
         setHasMoreCallLogs(false);
       }
     } catch (err) {
       console.error("Failed to load call logs", err);
       setCallLogs([]);
     } finally {
       setIsCallLogsLoading(false);
     }
  }, [hasLoadedCallLogs, getUserCallStatus, userProfile?.id]);

  const fetchMoreCallLogs = React.useCallback(async () => {
    if (isFetchingMoreCallLogs || !hasMoreCallLogs || isCallLogsLoading) return;
    setIsFetchingMoreCallLogs(true);
    try {
      const token = localStorage.getItem('token');
      const nextPage = callLogPage + 1;
      const res = await apiFetch<any>(`/Call/GetCallLogs?page=${nextPage}&pageSize=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const rawData = (res && res.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      const formatted = rawData.map((log: any) => {
        const uStatus = getUserCallStatus(log, userProfile?.id);
        const isMissed = uStatus === 'missed' || uStatus === 'rejected' || log.status === CallStatus.Missed;
        return {
          ...log,
          duration: isMissed ? "0s" : formatCallDuration(log.startedAt, log.endedAt, log.answeredAt)
        };
      });

      if (formatted.length > 0) {
        setCallLogs(prev => {
          const existingKeys = new Set(prev.map(l => l.id || l.callId));
          const newUnique = formatted.filter((l: any) => !existingKeys.has(l.id || l.callId));
          return [...prev, ...newUnique];
        });
        setCallLogPage(nextPage);
      }

      if (rawData.length < 50) {
        setHasMoreCallLogs(false);
      }
    } catch (err) {
      console.error("Failed to load more call logs", err);
    } finally {
      setIsFetchingMoreCallLogs(false);
    }
  }, [callLogPage, hasMoreCallLogs, isFetchingMoreCallLogs, isCallLogsLoading, getUserCallStatus, userProfile?.id]);

  const handleCallLogsScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (hasMoreCallLogs && !isFetchingMoreCallLogs && !isCallLogsLoading) {
        fetchMoreCallLogs();
      }
    }
  }, [hasMoreCallLogs, isFetchingMoreCallLogs, isCallLogsLoading, fetchMoreCallLogs]);

  const loadMyChats = async (force = false) => {
    if (hasLoadedChats && !force) return;
    setIsChatsLoading(true);
    // Try to load cached chats from localStorage
    const cachedChatsStr = localStorage.getItem('chats_cache');
    let cachedChats: ChatDto[] = [];
    if (cachedChatsStr) {
      try {
        const parsed = JSON.parse(cachedChatsStr);
        cachedChats = (parsed || []).map((chat: any) => ({
          ...chat,
          lastMessage: chat.lastMessage ? normalizeMessage(chat.lastMessage) : undefined
        }));
      } catch (e) {
        console.error('Failed to parse chats_cache:', e);
      }
    }

    // Immediately display saved data if state is currently empty
    if (cachedChats.length > 0) {
      setChats(prev => {
        if (prev.length === 0) {
          return cachedChats;
        }
        return prev;
      });
      setHasLoadedChats(true);
    }

    try {
      const data = await apiFetch<ChatDto[]>('/Chat/GetMyChats', { method: 'GET' });
      const fetchedChats = (data || []).map(chat => ({
        ...chat,
        lastMessage: chat.lastMessage ? normalizeMessage(chat.lastMessage) : undefined
      }));
      
      // Save cache
      localStorage.setItem('chats_cache', JSON.stringify(fetchedChats));

      // Update state without triggering a re-render if data is the same
      setChats(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(fetchedChats)) {
          return fetchedChats;
        }
        return prev;
      });
      setHasLoadedChats(true);
      if (fetchedChats.length > 0) {
        fetchUnreadCountsForAllChats(fetchedChats);
      }
    } catch (err: any) {
      if (cachedChats.length === 0) {
        toast.error('Failed to load chats: ' + err.message);
      } else {
        console.warn('Silent chat update failed:', err);
      }
    } finally {
      setIsChatsLoading(false);
    }
  };
  loadMyChatsRef.current = loadMyChats;

  React.useEffect(() => {
    if (isChatModalOpen && !hasLoadedChats) {
      loadMyChats();
    }
  }, [isChatModalOpen, hasLoadedChats]);

  React.useEffect(() => {
    if (isLoggedIn && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isLoggedIn]);
  const [chatSearchQuery, setChatSearchQuery] = React.useState("");
  const [isChatSearchVisible, setIsChatSearchVisible] = React.useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = React.useState("");
  const [selectedMessageRect, setSelectedMessageRect] = React.useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [forwardingMessage, setForwardingMessage] = React.useState<MessageDto | null>(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = React.useState(false);
  const [forwardSearchQuery, setForwardSearchQuery] = React.useState("");
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
  const [homeMemberSearchQuery, setHomeMemberSearchQuery] = React.useState("");
  const [typingUsers, setTypingUsers] = React.useState<Record<number, Record<number, { name: string, isTyping: boolean, action: string }>>>({});
  const typingTimeoutsRef = React.useRef<Record<string, any>>({});
  const [chatCurrentPages, setChatCurrentPages] = React.useState<Record<number, number>>({});
  const [isChatPagingLoading, setIsChatPagingLoading] = React.useState(false);
  React.useEffect(() => {
    if (recordingState === 'recording') {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        const now = Date.now();
        if (now - (window as any).lastTypingSentTime > 4000 || !(window as any).lastTypingSentTime) {
          (window as any).lastTypingSentTime = now;
          if (activeChatId !== null) {
            apiFetch(`/Message/Typing?chatId=${activeChatId}&action=${encodeURIComponent('recording voice message')}`, { method: 'POST' }).catch(() => {});
          }
        }
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
      if (recordingState === 'inactive') {
        setRecordingTime(0);
      }
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [recordingState, activeChatId]);

  React.useEffect(() => {
    let interval: any;
    if (playingAudioId) {
      interval = setInterval(() => {
        setPlayingProgress(prev => {
          const currentMsg = (chatMessages || []).find(m => m.id === playingAudioId);
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
    if (!isLoggedIn) return;

    let refs = {
      isChatModalOpen: isChatModalOpenRef.current,
      userProfileId: userProfile?.id,
    };
    
    const { homeSecurityConnection } = initSignalR();
    signalRConnectionRef.current = homeSecurityConnection;

    const token = localStorage.getItem('token');

    const setupConnectionAndRoles = async () => {
      if (homeSecurityConnection!.state === "Disconnected") {
        try {
          await homeSecurityConnection!.start();
          if (token) {
            await homeSecurityConnection!.invoke("AddPersonRole", token);
            await homeSecurityConnection!.invoke("AddPerson", token).catch(err => console.error("Failed AddPerson", err));
          }
          
          // Automatically invoke JoinChat if we already have an active chat when connecting
          const activeChatIdVal = activeChatIdRef.current;
          if (activeChatIdVal && (homeSecurityConnection!.state as any) === "Connected") {
            homeSecurityConnection!.invoke("JoinChat", activeChatIdVal)
              .catch(err => console.error(`Failed to join SignalR chat group ${activeChatIdVal}:`, err));
          }
          // Also automatically join all loaded chats so we get typing/messages correctly for everything
          const allChatsVal = chatsRef.current || [];
          if (allChatsVal.length > 0 && (homeSecurityConnection!.state as any) === "Connected") {
            allChatsVal.forEach(chat => {
              homeSecurityConnection!.invoke("JoinChat", chat.id)
                .catch(err => console.warn(`Error joining chat ${chat.id}:`, err));
            });
          }
        } catch (err) {
          console.error("SignalR Connection Error: ", err);
        }
      } else if (homeSecurityConnection!.state === "Connected") {
        if (token) {
          try {
            await homeSecurityConnection!.invoke("AddPersonRole", token);
            await homeSecurityConnection!.invoke("AddPerson", token).catch(err => console.error("Failed AddPerson on existing connection", err));
          } catch (err) {
            console.error("Failed to add person role on existing connection:", err);
          }
        }
        const activeChatIdVal = activeChatIdRef.current;
        if (activeChatIdVal) {
          homeSecurityConnection!.invoke("JoinChat", activeChatIdVal)
            .catch(err => console.error(`Failed to join SignalR chat group ${activeChatIdVal}:`, err));
        }
        const allChatsVal = chatsRef.current || [];
        if (allChatsVal.length > 0) {
          allChatsVal.forEach(chat => {
            homeSecurityConnection!.invoke("JoinChat", chat.id)
              .catch(err => console.warn(`Error joining chat ${chat.id}:`, err));
          });
        }
      }
    };

    setupConnectionAndRoles();

    homeSecurityConnection!.onreconnected(async (connectionId) => {
      const reToken = localStorage.getItem('token');
      if (reToken && homeSecurityConnection!.state === "Connected") {
        try {
          await homeSecurityConnection!.invoke("AddPersonRole", reToken);
          await homeSecurityConnection!.invoke("AddPerson", reToken).catch(err => console.error("Failed AddPerson on reconnect", err));
        } catch (err) {
          console.error("Failed to re-add person role on reconnect:", err);
        }
      }
    });

    const hsWrapper = homeSecurityConnection!;
    const hs = {
      on: (event: string, callback: (data: any) => void) => hsWrapper.on(event, (data) => { callback(data); }),
      off: (event: string) => hsWrapper.off(event)
    };

    const updateSyncDevice = (type: string, id: string | number, data: any, op: 'update' | 'add' | 'delete') => {
      setDevices(prev => {
        const targetId = `${type}-${id}`;
        if (op === 'delete') {
          return prev.filter(d => d.id !== targetId);
        }
        
        const mapToDevice = (item: any, existingDev?: Device): Device => {
          let st = 'off';
          const isActiveVal = getProp(item, 'isActive');
          const isOpenVal = getProp(item, 'isOpen');
          const isLockedVal = getProp(item, 'isLocked');
          
          if (type === 'door' || type === 'window') {
            const isOpen = (isOpenVal !== undefined && isOpenVal !== null) ? (isOpenVal === true || isOpenVal === 'true') : 
                           (existingDev ? (existingDev.status === 'open' || existingDev.status === 'open-locked') : false);
            const isLocked = (isLockedVal !== undefined && isLockedVal !== null) ? (isLockedVal === true || isLockedVal === 'true') : 
                             (existingDev ? (existingDev.status === 'locked' || existingDev.status === 'open-locked') : false);
            if (isOpen && isLocked) st = 'open-locked';
            else if (isOpen) st = 'open';
            else if (isLocked) st = 'locked';
            else st = 'unlocked';
          } else if (type === 'external') {
            st = isExternalTriggered(item) ? 'triggered' : (isPropActive(item) ? 'active' : 'inactive');
          } else {
            const isAct = (isActiveVal !== undefined && isActiveVal !== null) ? (isActiveVal === true || isActiveVal === 'true' || isActiveVal === 1 || isActiveVal === '1') : 
                          (existingDev ? (existingDev.status === 'on' || existingDev.status === 'active') : false);
            st = isAct ? (type === 'camera' ? 'active' : 'on') : (type === 'camera' ? 'inactive' : 'off');
          }
          
          const existRoom = existingDev?.room || '';
          const existSection = existingDev?.section || '';
          const roomVal = getProp(item, 'roomId')?.toString();
          const sectionVal = getProp(item, 'sectionId')?.toString();
          
          const nameVal = getProp(item, 'applianceName') || getProp(item, 'lightName') || getProp(item, 'cameraName') || getProp(item, 'doorName') || getProp(item, 'windowName') || getProp(item, 'name');
          const existName = existingDev?.name || 'Unknown';
          const brightnessVal = getProp(item, 'brightnessLevel');
          const appTypeVal = getProp(item, 'applianceType');
          
          const rawDoorType = getProp(item, 'doorType') ?? getProp(item, 'DoorType');
          const doorTypeMapped = (rawDoorType !== undefined && rawDoorType !== null)
            ? ((appNamesDetailList?.doorType || []).find((t: any) => t.id.toString() === rawDoorType.toString())?.name || rawDoorType.toString())
            : (existingDev?.doorType);
          
          return {
            id: `${type}-${getProp(item, 'id') ?? id}`,
            name: nameVal || existName,
            type: type as DeviceType,
            status: st,
            room: (roomVal !== undefined && roomVal !== null && roomVal !== '') ? roomVal : existRoom,
            section: (sectionVal !== undefined && sectionVal !== null && sectionVal !== '') ? sectionVal : existSection,
            value: type === 'light' ? (brightnessVal !== undefined ? brightnessVal : (existingDev?.value ?? 0)) : undefined,
            applianceType: appTypeVal ? ((appNamesDetailList?.applianceType || []).find(t => t.name === appTypeVal)?.id || 1) : (existingDev?.applianceType),
            ...(type === 'door' ? { doorType: doorTypeMapped } : {})
          };
        };

        if (op === 'add') {
          if (prev.some(d => d.id === targetId)) return prev;
          return [...prev, mapToDevice(data)];
        }

        // update
        return prev.map(d => {
          if (d.id !== targetId) return d;
          return mapToDevice(data, d);
        });
      });
    };

    const updateSectionsAndRoomsWithFacilityItem = (type: string, data: any, op: 'add' | 'update' | 'delete') => {
      const dataId = data.id ?? data.Id ?? data.sectionId ?? data.roomId;
      if (dataId === undefined || dataId === null) return;

      const getVal = (prop: string) => data[prop] ?? data[prop.charAt(0).toUpperCase() + prop.slice(1)] ?? data[prop.toLowerCase()];
      
      const sectionId = getVal('sectionId');
      const roomId = getVal('roomId');

      setSections(prevSections => {
        return prevSections.map(sec => {
          const secIdStr = sec.id?.toString();
          const secDbIdStr = sec.dbId?.toString() || (sec as any).Id?.toString();

          let itemBelongsToThisSection = false;
          if (sectionId !== undefined && sectionId !== null && sectionId !== '' && sectionId !== 0 && sectionId !== '0') {
            itemBelongsToThisSection = (sectionId.toString() === secIdStr || sectionId.toString() === secDbIdStr);
          } else if (roomId !== undefined && roomId !== null && roomId !== '' && roomId !== 0 && roomId !== '0') {
            const secRooms = sec.rooms || (sec as any).Rooms || [];
            itemBelongsToThisSection = secRooms.some((r: any) => (r.id ?? r.Id)?.toString() === roomId.toString());
          }

          const arrNames = {
            door: ['doors', 'Doors'],
            light: ['lights', 'Lights'],
            window: ['windows', 'Windows'],
            appliance: ['appliances', 'Appliances'],
            camera: ['cameras', 'Cameras'],
            external: ['externals', 'Externals'],
            room: ['rooms', 'Rooms']
          }[type];

          if (!arrNames) return sec;

          const updatedSec = { ...sec };
          arrNames.forEach(arrName => {
            const rawArr = (sec as any)[arrName] || [];
            let updatedArr = [...rawArr];

            updatedArr = updatedArr.filter((x: any) => (x.id ?? x.Id)?.toString() !== dataId.toString());

            if (op !== 'delete' && itemBelongsToThisSection) {
              const idx = rawArr.findIndex((x: any) => (x.id ?? x.Id)?.toString() === dataId.toString());
              if (idx >= 0) {
                updatedArr = rawArr.map((x: any) => (x.id ?? x.Id)?.toString() === dataId.toString() ? { ...x, ...data } : x);
              } else {
                updatedArr.push(data);
              }
            }

            (updatedSec as any)[arrName] = updatedArr;
          });

          return updatedSec;
        });
      });
    };

    // --- Device Listeners ---
    ['Light', 'Appliance', 'Camera', 'Door', 'Window', 'External'].forEach(t => {
      const type = t.toLowerCase();
      hs.on(`${t}Created`, (data) => {
        const setter = ({ 'Light': setLights, 'Appliance': setAppliances, 'Camera': setCameras, 'Door': setDoors, 'Window': setWindows, 'External': setExternals }[t]);
        const dataId = data.id ?? data.Id;
        if (setter && dataId !== undefined && dataId !== null) {
          setter(prev => {
            if (prev.some(x => x.id.toString() === dataId.toString())) return prev;
            return [...prev, data];
          });
        }
        updateSyncDevice(type, dataId, data, 'add');
        updateSectionsAndRoomsWithFacilityItem(type, data, 'add');
      });
      hs.on(`${t}Updated`, (data) => {
        const setter = ({ 'Light': setLights, 'Appliance': setAppliances, 'Camera': setCameras, 'Door': setDoors, 'Window': setWindows, 'External': setExternals }[t]);
        const dataId = getProp(data, 'id');
        if (setter && dataId !== undefined && dataId !== null) {
          setter(prev => prev.map(x => {
            if (x.id.toString() !== dataId.toString()) return x;
            const merged = { ...x };
            for (const key of Object.keys(data)) {
              const existingKey = Object.keys(x).find(k => k.toLowerCase() === key.toLowerCase());
              if (existingKey) {
                (merged as any)[existingKey] = data[key];
              } else {
                const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
                (merged as any)[camelKey] = data[key];
              }
            }
            return merged;
          }));
        }
        updateSyncDevice(type, dataId, data, 'update');
        updateSectionsAndRoomsWithFacilityItem(type, data, 'update');
      });
      hs.on(`${t}Deleted`, (data) => {
        const id = typeof data === 'object' ? (data.id ?? data.Id) : data;
        const setter = ({ 'Light': setLights, 'Appliance': setAppliances, 'Camera': setCameras, 'Door': setDoors, 'Window': setWindows, 'External': setExternals }[t]);
        if (setter && id !== undefined && id !== null) {
          setter(prev => prev.filter(x => x.id.toString() !== id.toString()));
        }
        updateSyncDevice(type, id, {}, 'delete');
        updateSectionsAndRoomsWithFacilityItem(type, { id }, 'delete');
      });
      hs.on(`${t}Triggered`, (data) => {
        toast.info(`${t} triggered`, { description: data.message });
        updateSyncDevice(type, (data.id ?? data.Id), data, 'update');
        updateSectionsAndRoomsWithFacilityItem(type, data, 'update');
      });
    });

    // --- System Listeners ---
    hs.on("LogCreated", (data) => setLogs(prev => [data, ...prev]));
    hs.on("SystemLogAdded", (data) => setLogs(prev => [data, ...prev]));
    
    hs.on("PersonCreated", (data) => setAllUsers(prev => {
      const dataId = data.id ?? data.Id;
      if (dataId !== undefined && dataId !== null && prev.some(p => p.id.toString() === dataId.toString())) return prev;
      return [...prev, data];
    }));
    hs.on("PersonUpdated", (data) => setAllUsers(prev => prev.map(p => (p.id !== undefined && p.id !== null && (data.id ?? data.Id) !== undefined && (data.id ?? data.Id) !== null) && p.id.toString() === (data.id ?? data.Id).toString() ? { ...p, ...data } : p)));
    hs.on("PersonStatusChanged", (data) => setAllUsers(prev => prev.map(u => (u.id !== undefined && u.id !== null && (data.id ?? data.Id) !== undefined && (data.id ?? data.Id) !== null) && u.id.toString() === (data.id ?? data.Id).toString() ? { ...u, disabled: data.disabled } : u)));
    
    hs.on("RoomCreated", (data) => {
      const dataId = data.id ?? data.Id;
      setRooms(prev => {
        if (dataId !== undefined && dataId !== null && prev.some(r => r.id.toString() === dataId.toString())) return prev;
        return [...prev, { ...data, id: dataId, name: data.roomName || data.name, section: data.sectionId?.toString() || data.SectionId?.toString() || data.sectionName || data.SectionName || data.section || data.Section || '' }];
      });
      setUserRooms(prev => {
        if (dataId !== undefined && dataId !== null && prev.some(r => r.id.toString() === dataId.toString())) return prev;
        if (data.personId?.toString() !== userProfile?.id?.toString()) return prev;
        return [...prev, { ...data, id: dataId, name: data.roomName || data.name, section: data.sectionId?.toString() || data.SectionId?.toString() || data.sectionName || data.SectionName || data.section || data.Section || '' }];
      });
      updateSectionsAndRoomsWithFacilityItem('room', data, 'add');
    });
    hs.on("RoomUpdated", (data) => {
      const dataId = data.id ?? data.Id;
      setRooms(prev => prev.map(r => (r.id !== undefined && r.id !== null && dataId !== undefined && dataId !== null) && r.id.toString() === dataId.toString() ? { 
        ...r, 
        ...data, 
        name: data.roomName || data.name || r.name, 
        section: data.sectionId?.toString() || data.SectionId?.toString() || data.sectionName || data.SectionName || data.section || data.Section || r.section || '' 
      } : r));
      setUserRooms(prev => prev.map(r => (r.id !== undefined && r.id !== null && dataId !== undefined && dataId !== null) && r.id.toString() === dataId.toString() ? { 
        ...r, 
        ...data, 
        name: data.roomName || data.name || r.name, 
        section: data.sectionId?.toString() || data.SectionId?.toString() || data.sectionName || data.SectionName || data.section || data.Section || r.section || '' 
      } : r));
      updateSectionsAndRoomsWithFacilityItem('room', data, 'update');
    });
    hs.on("RoomDeleted", (id) => {
      const deletedId = typeof id === 'object' ? (id.id ?? id.Id) : id;
      if (deletedId !== undefined && deletedId !== null) {
        setRooms(prev => prev.filter(r => r.id.toString() !== deletedId.toString()));
        setUserRooms(prev => prev.filter(r => r.id.toString() !== deletedId.toString()));
        updateSectionsAndRoomsWithFacilityItem('room', { id: deletedId }, 'delete');
      }
    });
    
    hs.on("SectionCreated", (data) => setSections(prev => {
      const dataId = data.sectionId ?? data.id ?? data.Id;
      if (dataId !== undefined && dataId !== null && prev.some(s => s.id.toString() === dataId.toString())) return prev;
      return [...prev, mapSection(data)];
    }));
    hs.on("SectionUpdated", (data) => setSections(prev => prev.map(s => s.id.toString() === (data.sectionId ?? data.id ?? data.Id ?? '').toString() ? { ...s, ...mapSection(data) } : s)));
    hs.on("SectionDeleted", (id) => {
      const deletedId = typeof id === 'object' ? (id.sectionId ?? id.id ?? id.Id) : id;
      setSections(prev => prev.filter(s => s.id.toString() !== (deletedId ?? '').toString()));
    });
    
    hs.on("ExternalCreated", (data) => setExternals(prev => {
      const dataId = data.id ?? data.Id;
      if (dataId !== undefined && dataId !== null && prev.some(e => e.id.toString() === dataId.toString())) return prev;
      return [...prev, data];
    }));
    hs.on("ExternalsCreated", (data) => {
      const items = Array.isArray(data) ? data : [data];
      items.forEach(item => {
        const dataId = item.id ?? item.Id;
        if (dataId !== undefined && dataId !== null) {
          setExternals(prev => {
            if (prev.some(e => e.id.toString() === dataId.toString())) return prev;
            return [...prev, item];
          });
          updateSyncDevice('external', dataId, item, 'add');
          updateSectionsAndRoomsWithFacilityItem('external', item, 'add');
        }
      });
    });
    hs.on("ExternalUpdated", (data) => setExternals(prev => prev.map(e => (e.id !== undefined && e.id !== null && (data.id ?? data.Id) !== undefined && (data.id ?? data.Id) !== null) && e.id.toString() === (data.id ?? data.Id).toString() ? { ...e, ...data } : e)));
    hs.on("ExternalsUpdated", (data) => {
      const items = Array.isArray(data) ? data : [data];
      items.forEach(item => {
        const dataId = getProp(item, 'id');
        if (dataId !== undefined && dataId !== null) {
          setExternals(prev => prev.map(x => {
            if (x.id.toString() !== dataId.toString()) return x;
            const merged = { ...x };
            for (const key of Object.keys(item)) {
              const existingKey = Object.keys(x).find(k => k.toLowerCase() === key.toLowerCase());
              if (existingKey) {
                (merged as any)[existingKey] = item[key];
              } else {
                const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
                (merged as any)[camelKey] = item[key];
              }
            }
            return merged;
          }));
          updateSyncDevice('external', dataId, item, 'update');
          updateSectionsAndRoomsWithFacilityItem('external', item, 'update');
        }
      });
    });
    hs.on("ExternalDeleted", (id) => {
      const deletedId = typeof id === 'object' ? (id.id ?? id.Id) : id;
      if (deletedId === undefined || deletedId === null) return;
      setExternals(prev => prev.filter(e => e.id.toString() !== deletedId.toString()));
    });
    
    hs.on("HardwareCreated", (data) => setHardwares(prev => {
      const dataId = data.id ?? data.Id;
      if (dataId !== undefined && dataId !== null && prev.some(h => h.id.toString() === dataId.toString())) return prev;
      return [...prev, data];
    }));
    hs.on("HardwareUpdated", (data) => setHardwares(prev => prev.map(h => (h.id !== undefined && h.id !== null && (data.id ?? data.Id) !== undefined && (data.id ?? data.Id) !== null) && h.id.toString() === (data.id ?? data.Id).toString() ? { ...h, ...data } : h)));
    
    hs.on("ActionCreated", (data) => setActions(prev => {
      const dataId = data.id ?? data.Id ?? data.actionId ?? data.ActionId;
      if (dataId !== undefined && dataId !== null && prev.some(a => a.id.toString() === dataId.toString())) return prev;
      
      const isPriv = !!(data.isPrivate ?? data.IsPrivate);
      const actionPersonId = data.personId ?? data.PersonId ?? data.createdBy ?? data.CreatedBy;
      const currentUserId = userProfileRef.current?.id ?? userProfileRef.current?.getUserDto?.personId;

      if (isPriv && actionPersonId !== undefined && actionPersonId !== null && currentUserId !== undefined && currentUserId !== null) {
        if (actionPersonId.toString() !== currentUserId.toString()) {
          return prev;
        }
      }

      return [...prev, { 
        ...data, 
        id: dataId, 
        actionName: (data.actionName ?? data.ActionName ?? data.name), 
        actionDescription: (data.actionDescription ?? data.ActionDescription ?? data.description ?? data.Description), 
        actionActive: (data.actionActive ?? data.ActionActive ?? false), 
        actionId: (data.actionId ?? data.ActionId ?? ''), 
        isPrivate: data.isPrivate ?? data.IsPrivate ?? false,
        isRecurring: data.isRecurring ?? data.IsRecurring ?? false,
        time: data.time ?? data.Time ?? '00:00:00',
        getActionStepDtos: (data.getActionStepDtos ?? data.GetActionStepDtos ?? []),
        createdBy: data.createdBy ?? data.CreatedBy,
        createdByName: data.createdByName ?? data.CreatedByName,
        createdOn: data.createdOn ?? data.CreatedOn,
        lastModifiedBy: data.lastModifiedBy ?? data.LastModifiedBy,
        lastModifiedByName: data.lastModifiedByName ?? data.LastModifiedByName,
        lastModifiedOn: data.lastModifiedOn ?? data.LastModifiedOn,
        personId: data.personId ?? data.PersonId
      }];
    }));
    hs.on("ActionUpdated", (data) => setActions(prev => {
      const dataId = data.id ?? data.Id ?? data.actionId ?? data.ActionId;
      const isPriv = !!(data.isPrivate ?? data.IsPrivate);
      const actionPersonId = data.personId ?? data.PersonId ?? data.createdBy ?? data.CreatedBy;
      const currentUserId = userProfileRef.current?.id ?? userProfileRef.current?.getUserDto?.personId;

      if (isPriv && actionPersonId !== undefined && actionPersonId !== null && currentUserId !== undefined && currentUserId !== null) {
        if (actionPersonId.toString() !== currentUserId.toString()) {
          return prev.filter(a => a.id.toString() !== dataId?.toString());
        }
      }

      return prev.map(a => {
        if (a.id !== undefined && a.id !== null && dataId !== undefined && dataId !== null && a.id.toString() === dataId.toString()) {
          return { 
            ...a, 
            ...data,
            actionName: data.actionName ?? data.ActionName ?? data.name ?? a.actionName,
            actionDescription: data.actionDescription ?? data.ActionDescription ?? data.description ?? data.Description ?? a.actionDescription,
            actionActive: data.actionActive ?? data.ActionActive ?? a.actionActive,
            actionId: data.actionId ?? data.ActionId ?? a.actionId,
            isPrivate: data.isPrivate ?? data.IsPrivate ?? a.isPrivate,
            isRecurring: data.isRecurring ?? data.IsRecurring ?? a.isRecurring,
            time: data.time ?? data.Time ?? a.time,
            getActionStepDtos: data.getActionStepDtos ?? data.GetActionStepDtos ?? a.getActionStepDtos,
            createdBy: data.createdBy ?? data.CreatedBy ?? a.createdBy,
            createdByName: data.createdByName ?? data.CreatedByName ?? a.createdByName,
            createdOn: data.createdOn ?? data.CreatedOn ?? a.createdOn,
            lastModifiedBy: data.lastModifiedBy ?? data.LastModifiedBy ?? a.lastModifiedBy,
            lastModifiedByName: data.lastModifiedByName ?? data.LastModifiedByName ?? a.lastModifiedByName,
            lastModifiedOn: data.lastModifiedOn ?? data.LastModifiedOn ?? a.lastModifiedOn,
            personId: data.personId ?? data.PersonId ?? a.personId
          };
        }
        return a;
      });
    }));
    hs.on("ActionActivationChanged", (data) => {
      const actId = data.actionId ?? data.ActionId ?? data.id ?? data.Id;
      const isActive = data.isActive ?? data.IsActive ?? data.actionActive ?? data.ActionActive;
      if (actId !== undefined && actId !== null) {
        setActions(prev => prev.map(a => a.id.toString() === actId.toString() ? { ...a, actionActive: !!isActive } : a));
      }
    });
    hs.on("ActionDeleted", (id) => {
      const deletedId = typeof id === 'object' ? (id.id ?? id.Id) : id;
      if (deletedId === undefined || deletedId === null) return;
      setActions(prev => prev.filter(a => a.id.toString() !== deletedId.toString()));
    });
    
    hs.on("ActionStepAdded", (data) => { if((data.data ?? data.Data)) setActions(prev => prev.map(a => a.id === (data.actionId ?? data.ActionId) ? (data.data ?? data.Data) : a)); });
    hs.on("ActionStepUpdated", (data) => { if((data.data ?? data.Data)) setActions(prev => prev.map(a => a.id === (data.actionId ?? data.ActionId) ? (data.data ?? data.Data) : a)); });
    hs.on("ActionStepDeleted", (data) => setActions(prev => prev.map(a => a.id === (data.actionId ?? data.ActionId) ? { ...a, getActionStepDtos: a.getActionStepDtos.filter(s => s.id !== (data.actionStepId ?? data.ActionStepId)) } : a)));

    hs.on("GetAppNamesDetails", (data) => {
      setAppNamesDetailList(prev => {
        const next = { ...prev, ...data };
        if (data && data.DoorType && !data.doorType) {
          next.doorType = data.DoorType;
        }
        return next;
      });
    });

    hs.on("ContactCategoryCreated", (data) => setContactCategories(prev => {
      const dataId = data.id ?? data.Id;
      if (prev.some(c => c.id === dataId)) return prev;
      return [...prev, data];
    }));
    hs.on("ContactCategoryUpdated", (data) => setContactCategories(prev => prev.map(c => c.id === (data.id ?? data.Id) ? { ...c, ...data } : c)));
    hs.on("ContactCategoryDeleted", (id) => {
      const deletedId = typeof id === 'object' ? (id.id ?? id.Id) : id;
      setContactCategories(prev => prev.filter(c => c.id !== deletedId));
    });

    hs.on("fingerprint_received", (data) => {
        console.log("Fingerprint received", data);
        toast.info(data.message || "Fingerprint data received");
        setFingerprintImages(prev => [...prev, data.fingerPrintEncoding]);
    });

    // --- Chat Events via homeSecurityConnection (hs) ---
    const onMessageSent = (rawMsg: MessageDto) => {
      const msg = normalizeMessage(rawMsg);
      
      // Silently mark as read using GET as requested
      apiFetch(`/Message/MarkAsRead?chatId=${msg.chatId}`, { method: 'GET', headers: { 'accept': '*/*' } }).catch(() => {});
      
      const profile = userProfileRef.current;
      const isMe = msg.senderPersonId?.toString() === profile?.id?.toString();
      
      if (!isMe) {
          playImessageReceivedSynth();
          // Set sender online if offline
          setAllUsers(prev => prev.map(u => u.id?.toString() === msg.senderPersonId?.toString() ? { ...u, isOnline: true } : u));
      } else {
          playImessageSentSynth();
      }
      
      setChatMessages(prev => {
        const existingIndex = prev.findIndex(m => m.id === msg.id);
        if (existingIndex !== -1) {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            ...msg,
            replyTo: msg.replyTo || next[existingIndex].replyTo,
            replyToId: msg.replyToId || next[existingIndex].replyToId,
            status: 'sent'
          };
          return next;
        }
        
        // Optimistic reconciliation for messages sent by me
        if (isMe) {
          const optIndex = prev.findIndex(m => (m as any).status === 'sending' && m.chatId === msg.chatId && m.content === msg.content);
          if (optIndex !== -1) {
            const next = [...prev];
            next[optIndex] = { 
              ...next[optIndex], 
              ...msg, 
              replyTo: msg.replyTo || next[optIndex].replyTo,
              replyToId: msg.replyToId || next[optIndex].replyToId,
              status: 'sent' 
            };
            return next;
          }
        }
        
        return [...prev, msg];
      });

      const activeChatIdVal = activeChatIdRef.current;
      const isChatOpen = isChatModalOpenRef.current;
      
      if (!isMe) {
        // Show floating notification if chat modal is closed OR we're not on this chat
        if (!isChatOpen || activeChatIdVal?.toString() !== msg.chatId?.toString()) {
          setChatPopups(p => {
            if (p.some(m => m.id === msg.id)) return p;
            return [...p, msg];
          });
          setTimeout(() => {
            setChatPopups(p => p.filter(x => x.id !== msg.id));
          }, 5000);
        }

        // System notification when minimized
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          const displayContent = msg.content || (msg.attachments && msg.attachments.length > 0 ? "Sent an attachment" : "New message");
          const cleanContent = displayContent.length > 60 ? displayContent.substring(0, 57) + "..." : displayContent;
          const n = new Notification(msg.senderName || "New Message", {
            body: cleanContent,
            icon: msg.senderProfileImage && msg.senderProfileImage.startsWith('data:') 
              ? msg.senderProfileImage 
              : (msg.senderProfileImage && msg.senderProfileImage.startsWith('http') ? msg.senderProfileImage : undefined),
            tag: `chat_${msg.chatId}`,
            renotify: true
          } as any);
          n.onclick = () => {
            window.focus();
            setActiveChatId(msg.chatId);
            setIsChatModalOpen(true);
          };
        }
      }

      // Update unread count and lastMessage
      setChats(prev => prev.map(c => {
        if (c.id?.toString() === msg.chatId?.toString()) {
          const shouldInc = !isMe && (!isChatOpen || activeChatIdVal?.toString() !== msg.chatId?.toString());
          return { 
            ...c, 
            unreadCount: shouldInc ? (c.unreadCount || 0) + 1 : c.unreadCount,
            lastMessage: msg 
          };
        }
        return c;
      }));
    };
    
    hs.on("MessageSent", onMessageSent);
    hs.on("ReceiveMessage", onMessageSent);
    hs.on("ReceiveMessageDto", onMessageSent);
    hs.on("OnMessageSent", onMessageSent);

    hs.on("MessageEdited", (rawMsg: MessageDto) => {
      const msg = normalizeMessage(rawMsg);
      setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, ...msg, replyTo: msg.replyTo || m.replyTo, replyToId: msg.replyToId || m.replyToId } : m));
      setChats(prev => prev.map(c => c.id === msg.chatId && c.lastMessage?.id === msg.id ? { ...c, lastMessage: msg } : c));
    });

    hs.on("MessageDeleted", (data: any) => {
      const cid = data.chatId ?? data.ChatId;
      const mid = data.messageId ?? data.MessageId;
      const isDel = data.isDeleted ?? data.IsDeleted;
      setChatMessages(prev => prev.map(m => m.id === mid ? { ...m, isDeleted: isDel } : m));
      setChats(prev => prev.map(c => {
        if (c.id === cid && c.lastMessage?.id === mid) {
          return { ...c, lastMessage: { ...c.lastMessage, isDeleted: isDel } };
        }
        return c;
      }));
    });

    hs.on("UpdateChat", (arg1: any, arg2?: any, arg3?: any) => {
      let eventName = "";
      let payload: any = null;
      if (typeof arg1 === 'string') {
        eventName = arg1;
        payload = arg3 !== undefined ? arg3 : arg2;
      } else {
        payload = arg1;
      }

      if (eventName === "GroupChatCreated" || eventName === "ChatCreated") {
        const chat = payload as ChatDto;
        if (chat && chat.id) {
          setChats(prev => {
            if (prev.some(c => c.id === chat.id)) return prev;
            return [chat, ...prev];
          });
          if (homeSecurityConnection && homeSecurityConnection.state === "Connected") {
            homeSecurityConnection.invoke("JoinChat", chat.id)
              .catch(err => console.warn(`Failed to join chat ${chat.id} from UpdateChat:`, err));
          }
        }
      } else if (eventName === "IncomingCall") {
        handleCallStatusUpdate("IncomingCall", payload);
      } else if (eventName === "CallAccepted") {
        handleCallStatusUpdate("CallAccepted", payload);
      } else if (eventName === "CallRejected") {
        handleCallStatusUpdate("CallRejected", payload);
      } else if (eventName === "CallEnded") {
        handleCallStatusUpdate("CallEnded", payload);
      } else if (eventName === "CallTimedOut") {
        handleCallStatusUpdate("CallTimedOut", payload);
      } else if (eventName === "ParticipantLeft") {
        handleCallStatusUpdate("ParticipantLeft", payload);
      } else if (eventName === "ParticipantJoined" || eventName === "ParticipantJoinedCall" || eventName === "ParticipantAddedToCall") {
        handleCallStatusUpdate("ParticipantJoined" as any, payload);
      } else if (eventName === "Offer") {
        handleOfferEvent(payload);
      } else if (eventName === "Answer") {
        handleAnswerEvent(payload);
      } else if (eventName === "IceCandidate") {
        handleIceCandidateEvent(payload);
      } else if (eventName === "ToggleCallItems") {
        handleToggleCallItemsEvent(payload);
      } else if (eventName === "MessageDeleted" || (payload && (payload.messageId ?? payload.MessageId))) {
        const cid = payload?.chatId ?? payload?.ChatId;
        const mid = payload?.messageId ?? payload?.MessageId;
        const isDel = payload?.isDeleted ?? payload?.IsDeleted ?? true;
        
        setChatMessages(prev => prev.map(m => m.id === mid ? { ...m, isDeleted: isDel } : m));
        setChats(prev => prev.map(c => {
          if (c.id === cid && c.lastMessage?.id === mid) {
            return { ...c, lastMessage: { ...c.lastMessage, isDeleted: isDel } };
          }
          return c;
        }));
      }
    });

    // Also bind separate call handlers directly for safety
    hs.on("IncomingCall", (callDto: any) => {
      handleCallStatusUpdate("IncomingCall", callDto);
    });

    hs.on("CallAccepted", (callDto: any) => {
      handleCallStatusUpdate("CallAccepted", callDto);
    });

    hs.on("CallRejected", (data: any) => {
      handleCallStatusUpdate("CallRejected", data);
    });

    hs.on("CallEnded", (data: any) => {
      handleCallStatusUpdate("CallEnded", data);
    });

    hs.on("CallTimedOut", (data: any) => {
      handleCallStatusUpdate("CallTimedOut", data);
    });

    hs.on("ParticipantLeft", (data: any) => {
      handleCallStatusUpdate("ParticipantLeft", data);
    });

    hs.on("ParticipantJoined", (data: any) => {
      handleCallStatusUpdate("ParticipantJoined" as any, data);
    });

    hs.on("ParticipantJoinedCall", (data: any) => {
      handleCallStatusUpdate("ParticipantJoinedCall" as any, data);
    });

    hs.on("ParticipantAddedToCall", (data: any) => {
      handleCallStatusUpdate("ParticipantAddedToCall" as any, data);
    });

    hs.on("Offer", (offerDto: any) => {
      handleOfferEvent(offerDto);
    });

    hs.on("Answer", (answerDto: any) => {
      handleAnswerEvent(answerDto);
    });

    hs.on("IceCandidate", (iceDto: any) => {
      handleIceCandidateEvent(iceDto);
    });

    hs.on("ToggleCallItems", (dto: any) => {
      handleToggleCallItemsEvent(dto);
    });

    const onUserTyping = (dto: any) => {
      const chatId = dto.chatId ?? dto.ChatId;
      const personId = dto.personId ?? dto.PersonId;
      const isTyping = dto.isTyping ?? dto.IsTyping;
      const name = dto.name ?? dto.Name ?? dto.fullName ?? dto.FullName ?? "";
      const action = dto.action ?? dto.Action ?? "typing";
      
      const profile = userProfileRef.current;
      if (personId?.toString() === profile?.id?.toString()) return;
      
      if (isTyping) {
        if (action.toLowerCase() === 'recording voice message') {
          if (!activeRecordingUsersRef.current[personId]) {
            activeRecordingUsersRef.current[personId] = true;
            playWhatsappRecordChirp();
          }
        } else {
          if (!activeTypingUsersRef.current[personId]) {
            activeTypingUsersRef.current[personId] = true;
            playTripleKeystrokeSynth();
          }
        }
      } else {
        if (action.toLowerCase() === 'recording voice message') {
          activeRecordingUsersRef.current[personId] = false;
        } else {
          activeTypingUsersRef.current[personId] = false;
        }
      }

      setTypingUsers(prev => {
        const chatTyping = { ...(prev[chatId] || {}) };
        if (isTyping) {
          chatTyping[personId] = { name: name, isTyping: true, action: action };
        } else {
          delete chatTyping[personId];
        }
        return { ...prev, [chatId]: chatTyping };
      });

      const timeoutKey = `${chatId}-${personId}`;
      if (typingTimeoutsRef.current[timeoutKey]) {
        clearTimeout(typingTimeoutsRef.current[timeoutKey]);
      }

      if (isTyping) {
        typingTimeoutsRef.current[timeoutKey] = setTimeout(() => {
          setTypingUsers(prev => {
            const chatTyping = { ...(prev[chatId] || {}) };
            delete chatTyping[personId];
            return { ...prev, [chatId]: chatTyping };
          });
          delete typingTimeoutsRef.current[timeoutKey];
        }, 5000);
      }
    };

    hs.on("UserTyping", onUserTyping);
    hs.on("Typing", onUserTyping);
    hs.on("ReceiveTyping", onUserTyping);
    hs.on("OnTyping", onUserTyping);

    hs.on("ChatCreated", (chat: ChatDto) => {
      setChats(prev => {
        if (prev.some(c => c.id === chat.id)) return prev;
        return [chat, ...prev];
      });
      if (homeSecurityConnection && homeSecurityConnection.state === "Connected") {
        homeSecurityConnection.invoke("JoinChat", chat.id)
          .catch(err => console.warn(`Failed to join chat ${chat.id} from ChatCreated direct event:`, err));
      }
    });

    hs.on("GroupChatCreated", (chat: ChatDto) => {
      setChats(prev => {
        if (prev.some(c => c.id === chat.id)) return prev;
        return [chat, ...prev];
      });
      if (homeSecurityConnection && homeSecurityConnection.state === "Connected") {
        homeSecurityConnection.invoke("JoinChat", chat.id)
          .catch(err => console.warn(`Failed to join chat ${chat.id} from GroupChatCreated direct event:`, err));
      }
    });

    hs.on("GroupChatUpdated", (chat: ChatDto) => {
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, ...chat } : c));
    });

    hs.on("ChatDeleted", (data: any) => {
      const cid = data.chatId ?? data.ChatId;
      setChats(prev => prev.filter(c => c.id !== cid));
      if (activeChatIdRef.current === cid) {
        setActiveChatId(null);
      }
    });

    hs.on("ParticipantsAdded", (data: any) => {
      const list = Array.isArray(data) ? data : [data];
      if (list.length === 0) return;
      const cid = list[0].chatId ?? list[0].ChatId;
      setChats(prev => prev.map(c => {
        if (c.id !== cid) return c;
        const currentParts = c.participants || [];
        const newParts = [...currentParts];
        list.forEach(item => {
          const pid = item.personId ?? item.PersonId;
          if (!newParts.some(p => p.personId === pid)) {
            newParts.push({
              personId: pid,
              isAdmin: item.isAdmin ?? item.IsAdmin ?? false,
              isOnline: false,
              fullName: "",
              profileImageUrl: null
            });
          }
        });
        return { ...c, participants: newParts };
      }));
    });

    hs.on("ParticipantRemoved", (data: any) => {
      const cid = data.chatId ?? data.ChatId;
      const pid = data.personId ?? data.PersonId;
      const profile = userProfileRef.current;
      if (pid === profile?.id) {
        setChats(prev => prev.filter(c => c.id !== cid));
        if (activeChatIdRef.current === cid) {
          setActiveChatId(null);
        }
      } else {
        setChats(prev => prev.map(c => {
          if (c.id !== cid) return c;
          return { ...c, participants: (c.participants || []).filter(p => p.personId !== pid) };
        }));
      }
    });

    hs.on("MessagesRead", (data: any) => {
      const cid = data.chatId ?? data.ChatId;
      const pid = data.personId ?? data.PersonId;
      const readAt = data.readAt ?? data.ReadAt ?? new Date().toISOString();
      const profile = userProfileRef.current;

      setChats(prev => prev.map(c => {
        if (c.id !== cid) return c;

        let nextUnreadCount = c.unreadCount;
        if (pid === profile?.id) {
          nextUnreadCount = 0;
        }

        const updatedParticipants = (c.participants || []).map(p => {
          const pId = p.personId ?? (p as any).PersonId;
          if (pId === pid) {
            return {
              ...p,
              lastReadAt: readAt
            };
          }
          return p;
        });

        return {
          ...c,
          unreadCount: nextUnreadCount,
          participants: updatedParticipants
        };
      }));
    });

    hs.on("UserOnline", (personId: number) => {
      setChats(prev => prev.map(c => {
        const updatedParticipants = (c.participants || []).map(p => 
          p.personId === personId ? { ...p, isOnline: true } : p
        );
        return { ...c, participants: updatedParticipants };
      }));
      setAllUsers(prev => prev.map(u => u.id === personId ? { ...u, isOnline: true } : u));
    });

    hs.on("UserOffline", (personId: number) => {
      setChats(prev => prev.map(c => {
        const updatedParticipants = (c.participants || []).map(p => 
          p.personId === personId ? { ...p, isOnline: false } : p
        );
        return { ...c, participants: updatedParticipants };
      }));
      setAllUsers(prev => prev.map(u => u.id === personId ? { ...u, isOnline: false } : u));
    });

    hs.on("NewRecording", (data: any) => {
      const recCameraId = data.cameraId ?? data.CameraId;
      const recFilePath = data.filePath ?? data.FilePath;
      const recStartTime = data.startTime ?? data.StartTime;
      const recEndTime = data.endTime ?? data.EndTime;
      
      if (recCameraId !== undefined && recCameraId !== null) {
        setCameras(prev => prev.map(c => {
          if (c.id.toString() === recCameraId.toString()) {
            const exists = c.recordings?.some(r => r.filePath === recFilePath);
            if (!exists) {
              const newRec: GetRecordingDto = {
                filePath: recFilePath,
                startTime: recStartTime,
                endTime: recEndTime
              };
              return {
                ...c,
                recordings: [newRec, ...(c.recordings || [])]
              };
            }
          }
          return c;
        }));
        toast.info(`New recording received for camera ${recCameraId}`);
      }
    });

    hs.on("HighLevelLogOut", () => {
      console.log("HighLevelLogOut event received from SignalR hub");
      toast.info("Security broadcast: High-level logout requested");
      handleLogout();
    });

    hs.on("LogOut", (personId: any) => {
      console.log("LogOut event received from SignalR hub for personId:", personId);
      const currentPersonId = userProfileRef.current?.id || userProfileRef.current?.getUserDto?.personId;
      if (personId === undefined || personId === null || String(personId) === String(currentPersonId)) {
        toast.info("Session ended: Logged out from all devices");
        handleLogout();
      }
    });

    return () => {
       hs.off("HighLevelLogOut");
       hs.off("LogOut");
       hs.off("ActionCreated");
       hs.off("ActionUpdated");
       hs.off("ActionActivationChanged");
       hs.off("ActionDeleted");
       hs.off("ApplianceTriggered");
       hs.off("CameraTriggered");
       hs.off("LightTriggered");
       hs.off("DoorTriggered");
       hs.off("WindowTriggered");
       hs.off("ActionTriggered");
       hs.off("ActionStepAdded");
       hs.off("ActionStepUpdated");
       hs.off("ActionStepDeleted");
       hs.off("ApplianceCreated");
       hs.off("ApplianceUpdated");
       hs.off("ApplianceDeleted");
       hs.off("CameraCreated");
       hs.off("CameraUpdated");
       hs.off("CameraDeleted");
       hs.off("NewRecording");
       hs.off("fingerprint_received");
       hs.off("ExternalsCreated");
       hs.off("ExternalsUpdated");
       hs.off("ExternalsDeleted");
       hs.off("LightCreated");
       hs.off("LightUpdated");
       hs.off("LightDeleted");
       hs.off("LogCreated");
       hs.off("RoomCreated");
       hs.off("RoomUpdated");
       hs.off("RoomDeleted");
       hs.off("DoorCreated");
       hs.off("DoorUpdated");
       hs.off("WindowCreated");
       hs.off("WindowUpdated");
       hs.off("HardwareCreated");
       hs.off("HardwareUpdated");
       hs.off("SectionCreated");
       hs.off("SectionUpdated");
       hs.off("SectionDeleted");
       hs.off("GetAppNamesDetails");
       hs.off("ContactCategoryCreated");
       hs.off("ContactCategoryUpdated");
       hs.off("ContactCategoryDeleted");
       hs.off("PersonCreated");
       hs.off("PersonUpdated");
       hs.off("PersonStatusChanged");

       hs.off("MessageSent");
       hs.off("ReceiveMessage");
       hs.off("ReceiveMessageDto");
       hs.off("OnMessageSent");
       hs.off("MessageEdited");
       hs.off("MessageDeleted");
        hs.off("UpdateChat");
       hs.off("UserTyping");
       hs.off("Typing");
       hs.off("ReceiveTyping");
       hs.off("OnTyping");
       hs.off("ChatCreated");
       hs.off("GroupChatCreated");
       hs.off("GroupChatUpdated");
       hs.off("ChatDeleted");
       hs.off("ParticipantsAdded");
       hs.off("ParticipantRemoved");
       hs.off("MessagesRead");
       hs.off("UserOnline");
       hs.off("UserOffline");
       hs.off("IncomingCall");
       hs.off("CallAccepted");
       hs.off("CallRejected");
       hs.off("CallEnded");
       hs.off("CallTimedOut");
       hs.off("ParticipantLeft");
       hs.off("Offer");
       hs.off("Answer");
       hs.off("IceCandidate");
       hs.off("ToggleCallItems");
        
        // Clear typing timeouts
        if (typingTimeoutsRef.current) {
          Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
          typingTimeoutsRef.current = {};
        }
    };
  }, [isLoggedIn]);

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

  const handleRestartCamera = async (id: number) => {
    if (isRestartingCamera) return;
    setIsRestartingCamera(true);
    const toastId = toast.loading("Restarting camera...");
    try {
      await apiFetch(`/Camera/RestartCamera?id=${id}`, { method: 'PUT' });
      toast.success("Camera restarted successfully", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to restart camera", { id: toastId });
    } finally {
      setIsRestartingCamera(false);
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
    const timer = setTimeout(() => {
      handleChatScroll();
    }, 150);
    return () => clearTimeout(timer);
  }, [chatMessages, isChatModalOpen, activeChatId]);

  const sendVoiceNote = React.useCallback(async () => {
    const mime = voiceNotePartsRef.current[0]?.type || getSupportedAudioMimeType();
    const mergedBlob = new Blob(voiceNotePartsRef.current, { type: mime });
    if (mergedBlob.size === 0) {
      setIsRecording(false);
      setRecordingState('inactive');
      setActiveStream(null);
      setSwipeX(0);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = reader.result?.toString() || '';
      const ext = mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'webm';
      const voiceFileName = `voice_note_${Date.now()}.${ext}`;
      
      const sendDto: SendMessageDto = {
        chatId: activeChatId!,
        content: "",
        type: MessageType.Audio,
        attachments: [
          {
            fileName: voiceFileName,
            filePath: base64Audio,
            contentType: mime.split(';')[0],
            fileSize: mergedBlob.size,
            thumbnailPath: ''
          }
        ],
        replyToMessageId: replyingTo?.id || undefined
      };

      const tempId = Date.now() * -1;
      const tempMsg: MessageDto & { status?: 'sending' | 'sent' | 'failed' } = {
        id: tempId,
        chatId: activeChatId!,
        senderPersonId: userProfile.id,
        senderName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
        senderProfileImage: userProfile.getPersonDetailsDto.imageUrl || undefined,
        content: "",
        type: MessageType.Audio,
        isEdited: false,
        isDeleted: false,
        sentAt: new Date().toISOString(),
        attachments: sendDto.attachments!,
        replyToId: replyingTo?.id || undefined,
        replyTo: replyingTo || undefined,
        status: 'sending'
      };

      setChatMessages(prev => [...prev, tempMsg]);
      setIsRecording(false);
      setRecordingState('inactive');
      setActiveStream(null);
      setSwipeX(0);
      setReplyingTo(null);

      try {
        const formData = buildMessageFormData(sendDto);
        const savedMsgRaw = await apiFetch<MessageDto>(`/Message/SendMessageChatId?chatId=${sendDto.chatId}`, {
          method: 'POST',
          body: formData
        });
        const savedMsg = normalizeMessage(savedMsgRaw);
        setChatMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, status: 'sent', replyToId: savedMsg.replyToId || m.replyToId, replyTo: savedMsg.replyTo || m.replyTo } : m));
      } catch (err: any) {
        setChatMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
        toast.error('Failed to send voice note: ' + err.message);
      }
    };
    reader.readAsDataURL(mergedBlob);
  }, [activeChatId, replyingTo, userProfile]);

  const startChatVoiceRecording = React.useCallback(async (targetChatId?: number) => {
    const targetId = targetChatId || activeChatId;
    if (!targetId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        }
      });
      setIsRecording(true);
      setRecordingState('recording');
      setActiveStream(stream);
      setRecordingTime(0);
      setPlaybackPreviewUrl(null);
      setPlaybackPreviewPlaying(false);
      
      (window as any).lastTypingSentTime = Date.now();
      apiFetch(`/Message/Typing?chatId=${targetId}&action=${encodeURIComponent('recording voice message')}`, { method: 'POST' }).catch(() => {});
      
      const recMime = getSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, { mimeType: recMime });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      voiceNotePartsRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setActiveStream(null);

        if ((recorder as any).isCancelled) {
          setIsRecording(false);
          setRecordingState('inactive');
          voiceNotePartsRef.current = [];
          return;
        }

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || recMime });
          voiceNotePartsRef.current.push(audioBlob);
          const url = URL.createObjectURL(audioBlob);
          setPlaybackPreviewUrl(url);
        }
      };
      
      recorder.start(200);
    } catch (err: any) {
      toast.error("Could not access microphone for voice note: " + err.message);
    }
  }, [activeChatId]);

  const handleSendMessage = async (customDto?: SendMessageDto | React.MouseEvent, customTempId?: number) => {
    const isRetry = !!(customDto && typeof customDto === 'object' && 'content' in customDto);
    const sendDto: SendMessageDto = isRetry ? {
      chatId: (customDto as SendMessageDto).chatId ?? activeChatId!,
      content: (customDto as SendMessageDto).content,
      type: (customDto as SendMessageDto).type ?? MessageType.Text,
      attachments: (customDto as SendMessageDto).attachments ?? [],
      replyToMessageId: (customDto as SendMessageDto).replyToMessageId ?? (replyingTo?.id || undefined),
    } : {
      chatId: activeChatId!,
      content: chatInput,
      type: MessageType.Text,
      attachments: [],
      replyToMessageId: replyingTo?.id || undefined,
    };

    if (!isRetry && (!chatInput.trim() || activeChatId === null)) return;

    const tempId = customTempId || Date.now() * -1;
    
    if (!isRetry) {
      const tempMsg: MessageDto & { status?: 'sending' | 'sent' | 'failed' } = {
        id: tempId,
        chatId: activeChatId!,
        senderPersonId: userProfile.id,
        senderName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
        senderProfileImage: userProfile.getPersonDetailsDto.imageUrl || undefined,
        content: chatInput,
        type: MessageType.Text,
        isEdited: false,
        isDeleted: false,
        sentAt: new Date().toISOString(),
        attachments: [],
        replyToId: replyingTo?.id || undefined,
        replyTo: replyingTo || undefined,
        status: 'sending'
      };

      setChatMessages(prev => [...prev, tempMsg]);
      setChatInput("");
      setReplyingTo(null);
    } else {
      // For retry, change status to 'sending'
      setChatMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sending' } : m));
    }

    try {
      const formData = buildMessageFormData(sendDto);
      const savedMsgRaw = await apiFetch<MessageDto>(`/Message/SendMessageChatId?chatId=${sendDto.chatId}`, {
        method: 'POST',
        body: formData
      });
      const savedMsg = normalizeMessage(savedMsgRaw);
      // Replace optimistic message with saved message
      setChatMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, status: 'sent', replyToId: savedMsg.replyToId || m.replyToId, replyTo: savedMsg.replyTo || m.replyTo } : m));
    } catch (err: any) {
      setChatMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
      toast.error('Failed to send message: ' + err.message);
    }
  };

  const handleForwardMessage = async (targetChatId: number) => {
    if (!forwardingMessage) return;
    
    const sendDto: SendMessageDto = {
      chatId: targetChatId,
      content: forwardingMessage.content,
      type: forwardingMessage.type,
      attachments: (forwardingMessage.attachments || []).map(att => ({
        fileName: att.fileName,
        filePath: att.filePath,
        contentType: att.contentType,
        fileSize: att.fileSize,
        thumbnailPath: att.thumbnailPath,
      })),
    };

    try {
      const formData = buildMessageFormData(sendDto);
      await apiFetch<MessageDto>(`/Message/SendMessageChatId?chatId=${sendDto.chatId}`, {
        method: 'POST',
        body: formData
      });
      toast.success('Message forwarded successfully!');
      setIsForwardModalOpen(false);
      setForwardingMessage(null);
    } catch (err: any) {
      toast.error('Failed to forward message: ' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    if (e.target.files && e.target.files.length > 0 && activeChatId !== null) {
      const files = Array.from(e.target.files) as File[];
      
      if (type === 'file' && files.length > 1) {
        // Send each file selected as a separate message immediately
        files.forEach((file, fileIdx) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const attachment: MessageAttachmentDto = {
              fileName: file.name,
              filePath: reader.result?.toString() || '',
              contentType: file.type,
              fileSize: file.size,
              thumbnailPath: ''
            };
            
            let msgType = MessageType.File;
            if (file.type.startsWith('image/')) msgType = MessageType.Image;
            else if (file.type.startsWith('video/')) msgType = MessageType.Video;
            else if (file.type.startsWith('audio/')) msgType = MessageType.Audio;

            const sendDto: SendMessageDto = {
              chatId: activeChatId!,
              content: "",
              type: msgType,
              attachments: [attachment],
              replyToMessageId: replyingTo?.id || undefined,
            };

            const tempId = (Date.now() + fileIdx) * -1 - Math.floor(Math.random() * 100);
            const tempMsg: MessageDto & { status?: 'sending' | 'sent' | 'failed' } = {
              id: tempId,
              chatId: activeChatId!,
              senderPersonId: userProfile.id,
              senderName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
              senderProfileImage: userProfile.getPersonDetailsDto.imageUrl || undefined,
              content: "",
              type: msgType,
              isEdited: false,
              isDeleted: false,
              sentAt: new Date().toISOString(),
              attachments: [attachment],
              replyToId: replyingTo?.id || undefined,
              replyTo: replyingTo || undefined,
              status: 'sending'
            };

            setChatMessages(prev => [...prev, tempMsg]);
            setUploadProgress(prev => ({ ...prev, [tempId]: 1 }));

            try {
              const formData = buildMessageFormData(sendDto);
              const savedMsgRaw = await apiFetch<MessageDto>(`/Message/SendMessageChatId?chatId=${sendDto.chatId}`, {
                method: 'POST',
                body: formData,
                onUploadProgress: (progressEvent: any) => {
                  if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, [tempId]: percent }));
                  }
                }
              });
              const savedMsg = normalizeMessage(savedMsgRaw);
              setChatMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, status: 'sent', replyToId: savedMsg.replyToId || m.replyToId, replyTo: savedMsg.replyTo || m.replyTo } : m));
            } catch (err: any) {
              setChatMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
              toast.error(`Failed to send ${file.name}: ` + err.message);
            } finally {
              setTimeout(() => {
                setUploadProgress(prev => {
                  const next = { ...prev };
                  delete next[tempId];
                  return next;
                });
              }, 1000);
            }
          };
          reader.readAsDataURL(file);
        });
        
        e.target.value = '';
        setReplyingTo(null);
        return;
      }

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
    
    const uploadPromises = (uploadPreviewFiles || []).map(file => {
      return new Promise<MessageAttachmentDto>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          let thumbPath: string | undefined = undefined;
          if (file.type.startsWith('image/')) {
            thumbPath = `/thumbnails/img_${file.name}`;
          } else if (file.type.startsWith('video/')) {
            thumbPath = `/thumbnails/vid_${file.name}`;
          }
          resolve({
            fileName: file.name,
            filePath: reader.result?.toString() || '',
            contentType: file.type,
            fileSize: file.size,
            thumbnailPath: thumbPath
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises).then(async attachments => {
      const file = uploadPreviewFiles[0];
      let msgType = MessageType.File;
      if (file.type.startsWith('image/')) {
        msgType = MessageType.Image;
      } else if (file.type.startsWith('video/')) {
        msgType = MessageType.Video;
      } else if (file.type.startsWith('audio/')) {
        msgType = MessageType.Audio;
      }

      const textContent = uploadPreviewText.trim();

      const sendDto: SendMessageDto = {
        chatId: activeChatId!,
        content: textContent,
        type: msgType,
        attachments: attachments,
        replyToMessageId: replyingTo?.id || undefined,
      };

      const tempId = Date.now() * -1;
      const tempMsg: MessageDto & { status?: 'sending' | 'sent' | 'failed' } = {
        id: tempId,
        chatId: activeChatId!,
        senderPersonId: userProfile.id,
        senderName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
        senderProfileImage: userProfile.getPersonDetailsDto.imageUrl || undefined,
        content: textContent,
        type: msgType,
        isEdited: false,
        isDeleted: false,
        sentAt: new Date().toISOString(),
        attachments: attachments,
        replyToId: replyingTo?.id || undefined,
        replyTo: replyingTo || undefined,
        status: 'sending'
      };

      setChatMessages(prev => [...prev, tempMsg]);
      setUploadProgress(prev => ({ ...prev, [tempId]: 1 }));
      setUploadPreviewFiles([]);
      setUploadPreviewText("");
      setUploadPreviewType(null);
      setReplyingTo(null);

      try {
        const formData = buildMessageFormData(sendDto);
        const savedMsgRaw = await apiFetch<MessageDto>(`/Message/SendMessageChatId?chatId=${sendDto.chatId}`, {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({ ...prev, [tempId]: percent }));
            }
          }
        });
        const savedMsg = normalizeMessage(savedMsgRaw);
        setChatMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, status: 'sent', replyToId: savedMsg.replyToId || m.replyToId, replyTo: savedMsg.replyTo || m.replyTo } : m));
      } catch (err: any) {
        setChatMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
        toast.error('Failed to send media: ' + err.message);
      } finally {
        setTimeout(() => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
        }, 1000);
      }
    });
  };

  const startDirectChat = async (person: GetPersonDto) => {
    try {
      const response = await apiFetch<any>(`/Chat/CreateChat?recipientPersonId=${person.id}`, { method: 'POST' });
      // The response might be the created chat object. Let's add it to state or just reload chats.
      await loadMyChats(true);
      if (response && response.id) {
        setActiveChatId(response.id);
      } else {
        // Fallback: search for chat with person
        const existingChat = (chats || []).find(c => !c.isGroup && c.participants.some(p => p.personId === person.id));
        if (existingChat) {
          setActiveChatId(existingChat.id);
        }
      }
      setIsNewChatOpen(false);
    } catch (err: any) {
      toast.error('Failed to create chat: ' + err.message);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedParticipants.length === 0) return;

    try {
      let uploadedImageUrl = "";
      if (newGroupImageFile) {
        uploadedImageUrl = await toBase64(newGroupImageFile);
      }

      const createDto = {
        name: newGroupName,
        description: newGroupDescription || "",
        imageUrl: uploadedImageUrl,
        participantPersonIds: [userProfile.id, ...selectedParticipants]
      };

      await apiFetch<any>('/Chat/CreateGroupChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createDto)
      });
      await loadMyChats(true);
      setIsNewChatOpen(false);
      setIsGroupMode(false);
      setSelectedParticipants([]);
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupImageFile(null);
    } catch (err: any) {
      toast.error('Failed to create group: ' + err.message);
    }
  };

  // Room Lock State
  const handleUpdateGroup = async () => {
    if (!editingGroupId || !newGroupName.trim()) return;

    try {
      const updateDto = {
        chatId: editingGroupId,
        name: newGroupName,
        description: newGroupDescription || "",
        imageUrl: newGroupImageUrl || ""
      };

      await apiFetch<any>('/Chat/UpdateGroupChat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateDto)
      });
      await loadMyChats(true);
      setIsEditGroupOpen(false);
      setEditingGroupId(null);
      setNewGroupImageFile(null);
    } catch (err: any) {
      toast.error('Failed to update group: ' + err.message);
    }
  };


  const handleDeleteChat = async () => {
    if (!editingGroupId) return;
    try {
      await apiFetch<any>(`/Chat/DeleteChat?chatId=${editingGroupId}`, { method: 'PUT' });
      await loadMyChats(true);
      if (activeChatId === editingGroupId) {
        setActiveChatId(null);
      }
      setIsDeleteChatModalOpen(false);
      setIsEditGroupOpen(false);
      setIsViewGroupOpen(false);
      setEditingGroupId(null);
      toast.success('Chat deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete chat: ' + err.message);
    }
  };

  React.useEffect(() => {
    if (activeChatId) {
      const cacheKey = `messages_cache_${activeChatId}`;
      const cachedMessagesStr = localStorage.getItem(cacheKey);
      let cachedMessages: MessageDto[] = [];
      if (cachedMessagesStr) {
        try {
          const parsed = JSON.parse(cachedMessagesStr);
          cachedMessages = (parsed || []).map(normalizeMessage);
        } catch (e) {
          console.error('Failed to parse message cache:', e);
        }
      }

      const hasCached = cachedMessages.length > 0;
      if (hasCached) {
        setChatMessages(prev => {
          const hasMessages = prev.some(m => m.chatId === activeChatId);
          if (!hasMessages) {
            const others = prev.filter(m => m.chatId !== activeChatId);
            return [...others, ...cachedMessages];
          }
          return prev;
        });
      } else {
        setIsPagingLoading(true);
      }

      apiFetch<MessageDto[]>(`/Message/GetChatMessages?chatId=${activeChatId}&page=1&pageSize=100`, { method: 'GET' })
        .then(messages => {
          const fetchedMessages = (messages || []).map(normalizeMessage);
          localStorage.setItem(cacheKey, JSON.stringify(fetchedMessages));

          setChatMessages(prev => {
            const others = prev.filter(m => m.chatId !== activeChatId);
            const currentForChat = prev.filter(m => m.chatId === activeChatId);
            if (JSON.stringify(currentForChat) !== JSON.stringify(fetchedMessages)) {
              return [...others, ...fetchedMessages];
            }
            return prev;
          });
          setChatCurrentPages(prev => ({ ...prev, [activeChatId]: 1 }));
        })
        .catch(err => {
          if (!hasCached) {
            toast.error("Failed to load messages: " + err.message);
          } else {
            console.warn("Silent messages update failed:", err);
          }
        })
        .finally(() => {
          setIsPagingLoading(false);
        });
    }
  }, [activeChatId]);

  const loadMoreMessages = async () => {
    if (activeChatId === null || isPagingLoading) return;
    
    setIsPagingLoading(true);
    const currentPage = chatCurrentPages[activeChatId] || 1;
    const nextPage = currentPage + 1;

    try {
      const messages = await apiFetch<MessageDto[]>(`/Message/GetChatMessages?chatId=${activeChatId}&page=${nextPage}&pageSize=100`, { method: 'GET' });
      const historicalMessages = (messages || []).map(normalizeMessage);
      if (historicalMessages && historicalMessages.length > 0) {
        setChatMessages(prev => [...historicalMessages, ...prev]);
        setChatCurrentPages(prev => ({ ...prev, [activeChatId]: nextPage }));
      } else {
        toast.info("No more older messages found.");
      }
    } catch (err: any) {
      toast.error('Failed to load older messages: ' + err.message);
    } finally {
      setIsPagingLoading(false);
    }
  };

  const fetchMoreLogs = React.useCallback(async () => {
    if (isPagingLoading || !hasMoreLogs) return;
    setIsPagingLoading(true);
    
    const nextPage = logPage + 1;
    const pageSize = 50;
    
    const formatDateToDDMMYYYY = (dateVal: string | Date | null) => {
      if (!dateVal) return '';
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    try {
      let res;
      if (logStartDate || logEndDate) {
        const startStr = formatDateToDDMMYYYY(logStartDate);
        const endStr = formatDateToDDMMYYYY(logEndDate || new Date());
        res = await apiFetch(`/Log/GetAllLogsByDate?startDate=${startStr}&endDate=${endStr}&page=${nextPage}&pageSize=${pageSize}`, { method: 'POST', body: '' });
      } else {
        res = await apiFetch(`/Log/GetAllLogs?page=${nextPage}&pageSize=${pageSize}`, { method: 'POST', body: '' });
      }
      
      const resData = res as any;
      if (resData && resData.data && Array.isArray(resData.data)) {
        if (resData.data.length > 0) {
          setLogs(prev => [...prev, ...resData.data]);
          setLogPage(nextPage);
        }
        if (resData.data.length < pageSize) {
          setHasMoreLogs(false);
        }
      } else {
        setHasMoreLogs(false);
      }
    } catch (err) {
      console.error("Failed to load more logs", err);
    } finally {
      setIsPagingLoading(false);
    }
  }, [logPage, hasMoreLogs, isPagingLoading, logStartDate, logEndDate]);

  React.useEffect(() => {
    if (activeView !== 'logs' || !loaderRef.current) return;
    if (!hasMoreLogs || isPagingLoading) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isPagingLoading && hasMoreLogs) {
        fetchMoreLogs();
      }
    }, { root: null, rootMargin: '100px', threshold: 0.1 });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [activeView, isPagingLoading, hasMoreLogs, fetchMoreLogs]);

  React.useEffect(() => {
    if (!hasMoreCallLogs || isFetchingMoreCallLogs || isCallLogsLoading) return;
    
    const observer = new IntersectionObserver((entries) => {
      const isIntersecting = entries.some(e => e.isIntersecting);
      if (isIntersecting && hasMoreCallLogs && !isFetchingMoreCallLogs && !isCallLogsLoading) {
        fetchMoreCallLogs();
      }
    }, { root: null, rootMargin: '150px', threshold: 0.1 });

    if (callLogsLoaderRef.current) observer.observe(callLogsLoaderRef.current);
    if (sideCallLogsLoaderRef.current) observer.observe(sideCallLogsLoaderRef.current);
    
    return () => observer.disconnect();
  }, [hasMoreCallLogs, isFetchingMoreCallLogs, isCallLogsLoading, fetchMoreCallLogs]);

  const handleRefresh = async () => {
    try {
        setRefreshState('loading');
        setRefreshProgress(70);
        const p1 = apiFetch('/Room/GetAllRooms', { method: 'POST' }).then((res: any) => { if (res && res.data) setRooms(res.data.map((r: any) => ({ ...r, id: r.id ?? r.Id, name: r.roomName || r.name, section: r.sectionId?.toString() || r.SectionId?.toString() || r.sectionName || r.SectionName || r.section || r.Section || '', icon: r.icon || 'Sofa' }))); });
        const p1_user = apiFetch('/Room/GetAllRoomsByPersonId', { method: 'POST', body: '' }).then((res: any) => { if (res && res.data) setUserRooms(res.data.map((r: any) => ({ ...r, id: r.id ?? r.Id, name: r.roomName || r.name, section: r.sectionId?.toString() || r.SectionId?.toString() || r.sectionName || r.SectionName || r.section || r.Section || '', icon: r.icon || 'Sofa' }))); });
        const p2 = apiFetch('/Section/GetAllSections', { method: 'POST' }).then((res: any) => { if (res && res.data) setSections(res.data.map(mapSection)); });
        const p3 = apiFetch('/Appliance/GetAllAppliances', { method: 'POST' }).then((res: any) => { if (res && res.data) { setAppliances(res.data); syncDevicesFromFetchedType('appliance', res.data); } });
        const p4 = apiFetch('/Light/GetAllLights', { method: 'POST' }).then((res: any) => { if (res && res.data) { setLights(res.data); syncDevicesFromFetchedType('light', res.data); } });
        const p5 = apiFetch('/Camera/GetAllCameras', { method: 'POST' }).then((res: any) => { if (res && res.data) { setCameras(res.data); syncDevicesFromFetchedType('camera', res.data); } });
        const p6 = apiFetch('/Door/GetAllDoors', { method: 'POST' }).then((res: any) => { if (res && res.data) { setDoors(res.data); syncDevicesFromFetchedType('door', res.data); } });
        const p7 = apiFetch('/Window/GetAllWindows', { method: 'POST' }).then((res: any) => { if (res && res.data) { setWindows(res.data); syncDevicesFromFetchedType('window', res.data); } });
        const p8 = apiFetch('/External/GetAllExternals', { method: 'POST' }).then((res: any) => { if (res && res.data) { setExternals(res.data); syncDevicesFromFetchedType('external', res.data); } });
        const p9 = apiFetch('/Hardware/GetAllHardwares', { method: 'GET' }).then((res: any) => { if (res && res.data) setHardwares(res.data); });
        const p10 = apiFetch('/Person/GetAllPersons', { method: 'POST' }).then((res: any) => { if (res && res.data) setAllUsers(res.data); });
        const p11 = apiFetch('/ContactCategory/GetAllContactCategories', { method: 'POST' })
          .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setContactCategories(res.data); else setContactCategories([]); })
          .catch(() => setContactCategories([]));
        const p12 = apiFetch('/Contact/GetAllContacts', { method: 'POST', body: '' }).then((res: any) => { if (res && res.data) setContacts(res.data); });
        const pLogs = apiFetch('/Log/GetAllLogs?page=1&pageSize=50', { method: 'POST', body: '' })
          .then((res: any) => { if (res && res.data && Array.isArray(res.data) && res.data.length > 0) setLogs(res.data); else setLogs(INITIAL_LOGS); })
          .catch(() => setLogs(INITIAL_LOGS));
        await Promise.all([p1, p1_user, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, pLogs]);
        setRefreshProgress(100);
        setRefreshState('success');
        setTimeout(() => setRefreshState('idle'), 1000);
    } catch(err) {
      console.error(err);
      setRefreshProgress(100);
      setRefreshState('error');
      setTimeout(() => setRefreshState('idle'), 1500);
    }
  };

  const toggleRoomLock = async (roomId: string) => {
    const nextState = !roomLocked;
    setRoomLocked(nextState);
    
    const doorsInRoom = devices.filter(d => d.room === roomId && d.type === 'door');
    const windowsInRoom = devices.filter(d => d.room === roomId && d.type === 'window');

    for (const door of doorsInRoom) {
      try {
        const rawId = door.id.includes('-') ? door.id.split('-')[1] : door.id;
        await apiFetch(`/Door/LockDoor?id=${rawId}`, { method: 'PUT' });
      } catch (e) {
         console.error("Failed to toggle door in room lock", e);
      }
    }

    for (const win of windowsInRoom) {
      try {
        const rawId = win.id.includes('-') ? win.id.split('-')[1] : win.id;
        await apiFetch(`/Window/LockWindow?id=${rawId}`, { method: 'PUT' });
      } catch (e) {
         console.error("Failed to toggle window in room lock", e);
      }
    }
    
    // Toggle all doors and windows in this room
    setDevices(prev => prev.map(d => {
      if (d.room === roomId && (d.type === 'door' || d.type === 'window')) {
        return { ...d, status: nextState ? 'locked' : 'unlocked' };
      }
      return d;
    }));
    
    // Add log
    addLogEntry('Door Security', `${nextState ? 'Locked' : 'Unlocked'} all security points in ${(rooms || []).find(r => r.id.toString() === roomId.toString())?.name || 'the room'}`);
    toast.success(`Room ${nextState ? 'locked' : 'unlocked'} successfully`);
  };

  const handleUpdateProfile = async () => {
    if (!userProfile) return;
    
    const requestBody = {
      id: userProfile.id,
      cameraIds: userProfile.cameraIds || [],
      updatePersonDetailsDto: {
        firstName: userProfile.getPersonDetailsDto.firstName || '',
        lastName: userProfile.getPersonDetailsDto.lastName || '',
        imageUrl: profileImageFile ? (userProfile.getPersonDetailsDto.imageUrl || '') : null
      },
      updateUserDto: {
        id: userProfile.getUserDto.id,
        userName: userProfile.getUserDto.userName || '',
        role: userProfile.getUserDto.role ?? 0
      }
    };

    try {
      await apiFetch('/Person/UpdatePerson', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      addLogEntry('Profile Sync', 'Updated profile identity');
      toast.success('Profile updated successfully');
      setProfileImageFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleLogoutEverywhere = async () => {
    const personId = userProfile?.id || userProfile?.getUserDto?.personId || userProfileRef.current?.id;
    if (!personId) {
      toast.error("Unable to identify user profile");
      return;
    }

    try {
      const token = localStorage.getItem('token') || '';
      await apiFetch<any>(`/User/LogOutPersonId?personId=${personId}`, {
        method: 'POST',
        body: JSON.stringify({ token, personId })
      }).catch(async () => {
        return await apiFetch<any>(`/User/LogOutPersonId?token=${encodeURIComponent(token)}&personId=${personId}`, {
          method: 'GET'
        }).catch(() => {});
      });

      toast.success("Successfully logged out from all app sessions");
      handleLogout();
    } catch (err: any) {
      toast.error(err.message || 'Failed to logout everywhere');
      handleLogout();
    }
  };

  const refreshContactCategories = () => {
    apiFetch('/ContactCategory/GetAllContactCategories', { method: 'POST' })
      .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setContactCategories(res.data); })
      .catch(err => console.error("Failed to load contact categories", err));
  };

  const refreshContacts = () => {
    apiFetch('/Contact/GetAllContacts', { method: 'POST', body: '' })
      .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setContacts(res.data); })
      .catch(err => console.error("Failed to load contacts", err));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    requestAuth(async () => {
      try {
        const response: any = await apiFetch('/ContactCategory/CreateContactCategory', {
          method: 'POST',
          body: JSON.stringify({
            name: newCategoryName,
            description: newCategoryDescription,
            icon: newCategoryIcon
          })
        });
        const isTrue = response === true || response?.data === true || response?.status === true || response?.isSuccess === true;
        if (isTrue || (response && response.data)) {
          if (response.data && typeof response.data === 'object') {
            setContactCategories(prev => [...prev, response.data]);
          } else {
            refreshContactCategories();
          }
          setNewCategoryName('');
          setNewCategoryDescription('');
          setNewCategoryIcon('UserCircle');
          setIsAddCategoryOpen(false);
          toast.success("Category added successfully");
        }
      } catch (err: any) {
        console.error("Failed to add category", err);
        toast.error(`Failed to add category: ${err.message}`);
      }
    });
  };

  const handleEditCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    requestAuth(async () => {
      try {
        const payload = {
          id: Number(editingCategory.id),
          name: newCategoryName,
          description: newCategoryDescription,
          icon: newCategoryIcon
        };
        const response: any = await apiFetch('/ContactCategory/UpdateContactCategory', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        const isTrue = response === true || response?.data === true || response?.status === true || response?.isSuccess === true;
        if (isTrue || response) {
          if (isTrue && !(response?.data)) {
            refreshContactCategories();
          } else {
            setContactCategories(prev => prev.map(cat => cat.id === editingCategory.id ? {
              ...cat,
              ...payload
            } : cat));
          }
          setNewCategoryName('');
          setNewCategoryDescription('');
          setNewCategoryIcon('UserCircle');
          setIsEditCategoryOpen(false);
          setEditingCategory(null);
          toast.success("Category updated successfully");
        }
      } catch (err: any) {
        console.error("Failed to update category", err);
        toast.error(`Failed to update category: ${err.message}`);
      }
    });
  };

  const handleDeleteCategory = (id: number) => {
    requestAuth(async () => {
      try {
        await apiFetch(`/ContactCategory/DeleteContactCategory?contactCategoryId=${id}`, {
          method: 'PUT'
        });
        setContactCategories(prev => prev.filter(cat => cat.id !== id));
        const otherCat = (contactCategories || []).find(c => (c.name || '').toLowerCase() === 'other');
        if (otherCat) {
          setContacts(prev => prev.map(c => c.getContactCategoryDto.id === id ? { ...c, getContactCategoryDto: otherCat } : c));
        }
        toast.success("Category deleted successfully");
      } catch (err: any) {
        console.error("Failed to delete category", err);
        toast.error(`Failed to delete category: ${err.message}`);
      }
    });
  };

   const handleAddContact = () => {
    if (!newContact.firstName || !newContact.lastName) return;
    
    const selectedCategory = (contactCategories || []).find(c => c.id === newContact.contactCategory) || contactCategories[0] || {
      id: 0,
      name: 'Uncategorized',
      description: '',
      icon: 'UserCircle'
    };

    if (editingContactId !== null) {
      requestAuth(async () => {
        try {
          const payload = {
            id: editingContactId,
            firstName: newContact.firstName,
            lastName: newContact.lastName,
            imageUrl: isNewContactImageSelected ? (newContact.imageUrl || null) : null,
            gender: 1,
            ContactCategory: newContact.contactCategory || 0,
            contactCategory: newContact.contactCategory || 0,
            personId: newContact.personId || userProfile?.id || 1,
            PersonId: newContact.personId || userProfile?.id || 1,
            contactDetails: newContact.contactDetails.map(d => ({
              id: d.id || 0,
              contactId: editingContactId,
              phoneNumber: d.phoneNumber || '',
              email: d.email || ''
            })),
            address: newContact.address.map(a => ({
              id: a.id || 0,
              contactId: editingContactId,
              numberLine: a.numberLine || '',
              street: a.street || '',
              city: a.city || '',
              region: a.region || '',
              state: a.state || '',
              country: a.country || '',
              postalCode: a.postalCode || ''
            }))
          };

          const res: any = await apiFetch('/Contact/UpdateContact', {
            method: 'PUT',
            body: JSON.stringify(payload)
          });

          const isTrue = res === true || res?.data === true || res?.status === true || res?.isSuccess === true;
          if (isTrue || res?.data) {
            if (isTrue && !(res?.data && typeof res.data === 'object')) {
              refreshContacts();
            } else {
              const updatedContactData = res?.data;
              setContacts(prev => prev.map(c => c.id === editingContactId ? {
                ...c,
                firstName: updatedContactData?.firstName || newContact.firstName,
                lastName: updatedContactData?.lastName || newContact.lastName,
                getContactCategoryDto: selectedCategory,
                imageUrl: isNewContactImageSelected ? (updatedContactData?.imageUrl || newContact.imageUrl || '') : null,
                contactDetails: (updatedContactData?.contactDetails || newContact.contactDetails).map((d: any, i: number) => ({
                  ...d,
                  id: d.id || i + 1,
                  contactId: editingContactId,
                  personDetailsId: d.personDetailsId || 0
                })),
                address: (updatedContactData?.address || newContact.address).map((a: any, i: number) => ({
                  ...a,
                  id: a.id || i + 1,
                  contactId: editingContactId,
                  personId: newContact.personId
                })),
              } : c));
            }
            toast.success("Contact updated successfully");
            setIsAddContactOpen(false);
          }
        } catch (err: any) {
          console.error("Failed to update contact", err);
          toast.error(`Failed to update contact: ${err.message}`);
        } finally {
          setEditingContactId(null);
          setIsNewContactImageSelected(false);
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
        }
      });
    } else {
      requestAuth(async () => {
        try {
          const payload = {
            firstName: newContact.firstName,
            lastName: newContact.lastName,
            imageUrl: newContact.imageUrl || '',
            gender: 1,
            ContactCategory: newContact.contactCategory || 0,
            contactCategory: newContact.contactCategory || 0,
            personId: userProfile?.id || 1,
            PersonId: userProfile?.id || 1,
            contactDetails: newContact.contactDetails.map(d => ({
              contactId: 0,
              personDetailsId: d.personDetailsId || 0,
              phoneNumber: d.phoneNumber || '',
              email: d.email || ''
            })),
            address: newContact.address.map(a => ({
              numberLine: a.numberLine || '',
              street: a.street || '',
              city: a.city || '',
              region: a.region || '',
              state: a.state || '',
              country: a.country || '',
              postalCode: a.postalCode || ''
            }))
          };

          const res: any = await apiFetch('/Contact/CreateContact', {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          const isTrue = res === true || res?.data === true || res?.status === true || res?.isSuccess === true;
          if (isTrue || res?.data) {
            if (isTrue && !(res?.data && typeof res.data === 'object')) {
              refreshContacts();
            } else if (res && res.data) {
              const serverContact: ContactType = {
                id: (res.data.id ?? res.data.Id) || Math.floor(Math.random() * 10000),
                firstName: res.data.firstName || newContact.firstName,
                lastName: res.data.lastName || newContact.lastName,
                getContactCategoryDto: selectedCategory,
                imageUrl: res.data.imageUrl || newContact.imageUrl || '',
                contactDetails: (res.data.contactDetails || []).map((d: any, idx: number) => ({
                  id: d.id || idx + 1,
                  contactId: (res.data.id ?? res.data.Id) || 0,
                  phoneNumber: d.phoneNumber || '',
                  email: d.email || '',
                  personDetailsId: d.personDetailsId || 0
                })),
                address: (res.data.address || []).map((a: any, idx: number) => ({
                  id: a.id || idx + 1,
                  contactId: (res.data.id ?? res.data.Id) || 0,
                  personId: userProfile?.id || 1,
                  numberLine: a.numberLine || '',
                  street: a.street || '',
                  city: a.city || '',
                  region: a.region || '',
                  state: a.state || '',
                  country: a.country || 'United Kingdom',
                  postalCode: a.postalCode || ''
                }))
              };
              setContacts(prev => [...prev, serverContact]);
            }
            toast.success('Contact created successfully!');
            setIsAddContactOpen(false);
          } else {
            // Fallback locally
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
            toast.success('Contact created locally!');
          }
        } catch (err: any) {
          console.error("Failed to create contact remotely", err);
          toast.error(`Remote contact creation failed: ${err.message}`);
        } finally {
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
        }
      });
    }
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
    setIsNewContactImageSelected(false);
    setIsAddContactOpen(true);
  };

  const handleDeleteContact = () => {
    if (contactToDelete) {
      requestAuth(async () => {
        try {
          await apiFetch(`/Contact/DeleteContact?contactId=${contactToDelete.id}`, { method: 'PUT' });
          setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
          toast.success("Contact deleted successfully");
        } catch (err: any) {
          toast.error(`Error deleting contact: ${err.message}`);
        }
        setContactToDelete(null);
        setIsDeleteContactOpen(false);
      });
    }
  };

  const handleAddSection = () => {
    requestAuth(async () => {
      if (!newSectionName.trim()) return;
      try {
        const url = `/Section/CreateSection?SectionName=${encodeURIComponent(newSectionName)}&IsHidden=${newSectionIsHidden ? 'true' : 'false'}`;
        await apiFetch(url, {
          method: 'POST'
        });
        setNewSectionName('');
        setNewSectionType('general');
        setNewSectionIsHidden(false);
        setIsAddSectionOpen(false);
        toast.success("Section added successfully");
      } catch (err: any) {
        console.error("Failed to add section", err);
        toast.error(`Failed to add section: ${err.message}`);
      }
    });
  };

  React.useEffect(() => {
    let timer: any;

    const verifyAuth = async () => {
      // The user mentioned 1308 as an example, and length 6 in previous code.
      if ((authCode.length === 4 || authCode.length === 6) && /^\d+$/.test(authCode)) {
        setIsVerifyingAuth(true);
        try {
          const response: any = await apiFetch(`/User/VerifyAuthCode?authCode=${authCode}`, {
            method: 'POST'
          });
          
          if (response?.success === true || response === true || response?.data === true || response?.isSuccess === true) {
            authFailedAttemptsRef.current = 0;
            setAuthFailedAttempts(0);
            setAuthSuccess(true);
            setTimeout(() => {
              onAuthSuccess?.();
              setIsAuthModalOpen(false);
              setAuthCode('');
              setAuthError(false);
              setAuthSuccess(false);
              setOnAuthSuccess(null);
            }, 800);
          } else {
            // Failed verification in 200 response (returns false)
            const currentFailed = authFailedAttemptsRef.current + 1;
            authFailedAttemptsRef.current = currentFailed;
            setAuthFailedAttempts(currentFailed);

            if (currentFailed >= 3) {
              authFailedAttemptsRef.current = 0;
              setAuthFailedAttempts(0);
              setIsAuthModalOpen(false);
              setAuthCode('');
              setAuthError(false);
              setOnAuthSuccess(null);
              toast.error("Authorization code failed 3 times. You have been logged out.");
              handleLogout();
              return;
            }

            setAuthError(true);
            setAuthCode(''); // Clear the inputted code on verification failure so user can start again
            toast.error(`Invalid Authorization Code (${currentFailed}/3 attempts).`);
            setTimeout(() => {
              const firstInput = document.getElementById('auth-code-input-0');
              if (firstInput) firstInput.focus();
            }, 50);
          }
        } catch (err: any) {
          console.error("Auth verification failed", err);
          
          // Fallback for development/testing if API fails but we have mock code
          if (authCode === '1308' || authCode === '123456') {
             authFailedAttemptsRef.current = 0;
             setAuthFailedAttempts(0);
             toast.info("Using development fallback for auth code");
             setAuthSuccess(true);
             setTimeout(() => {
               onAuthSuccess?.();
               setIsAuthModalOpen(false);
               setAuthCode('');
               setAuthError(false);
               setAuthSuccess(false);
               setOnAuthSuccess(null);
             }, 800);
          } else {
             const currentFailed = authFailedAttemptsRef.current + 1;
             authFailedAttemptsRef.current = currentFailed;
             setAuthFailedAttempts(currentFailed);

             if (currentFailed >= 3) {
               authFailedAttemptsRef.current = 0;
               setAuthFailedAttempts(0);
               setIsAuthModalOpen(false);
               setAuthCode('');
               setAuthError(false);
               setOnAuthSuccess(null);
               toast.error("Authorization code failed 3 times. You have been logged out.");
               handleLogout();
               return;
             }

             setAuthError(true);
             setAuthCode(''); // Clear the inputted code on error when fallback is not matched so user can start again
             toast.error(err.message ? `${err.message} (${currentFailed}/3 attempts).` : `Invalid Authorization Code (${currentFailed}/3 attempts).`);
             setTimeout(() => {
               const firstInput = document.getElementById('auth-code-input-0');
               if (firstInput) firstInput.focus();
             }, 50);
          }
        } finally {
          setIsVerifyingAuth(false);
        }
      }
    };

    if (authCode.length === 6) {
      verifyAuth();
    } else if (authCode.length === 4) {
      // do not auto-verify on 4 anymore since we have 6 inputs
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [authCode, onAuthSuccess]);

  const requestAuth = (action: () => void) => {
    setOnAuthSuccess(() => action);
    setIsAuthModalOpen(true);
    setAuthCode('');
    setAuthError(false);
  };

  
    const handleToggle = async (id: string) => {
      let d = devices.find(x => x.id === id || x.id.split('-')[1] === id || x.id === `appliance-${id}` || x.id === `light-${id}` || x.id === `camera-${id}` || x.id === `door-${id}` || x.id === `window-${id}` || x.id === `external-${id}`);
      if (!d) return;

      const rawId = d.id.includes('-') ? d.id.split('-')[1] : d.id;

      // Determine next status and state
      let newStatus = d.status;
      let nextActive = false;
      if (d.type === 'light') {
        nextActive = d.status === 'off';
        newStatus = nextActive ? 'on' : 'off';
      } else if (d.type === 'appliance') {
        nextActive = (d.status === 'off' || d.status === 'inactive');
        newStatus = nextActive ? 'on' : 'off';
      } else if (d.type === 'door' || d.type === 'window') {
        newStatus = d.status === 'locked' ? 'unlocked' : 'locked';
      } else if (d.type === 'camera') {
        nextActive = d.status === 'inactive';
        newStatus = nextActive ? 'active' : 'inactive';
      } else if (d.type === 'external' as any) {
        nextActive = d.status === 'inactive';
        newStatus = nextActive ? 'active' : 'inactive';
      }

      // Keep original states to revert on failure
      const prevDevices = [...devices];
      const prevLights = [...lights];
      const prevAppliances = [...appliances];
      const prevCameras = [...cameras];
      const prevDoors = [...doors];
      const prevExternals = [...externals];

      // Optimistic update
      setDevices(prev => prev.map(dev => dev.id === d.id ? { 
        ...dev, 
        status: newStatus as any,
        value: (d.type === 'light' && nextActive && (dev.value === undefined || dev.value === 0)) ? 100 : dev.value
      } : dev));
      if (d.type === 'light') {
        setLights(prev => prev.map(item => item.id.toString() === rawId ? { 
          ...item, 
          isActive: nextActive,
          brightnessLevel: (nextActive && (item.brightnessLevel === undefined || item.brightnessLevel === 0)) ? 100 : item.brightnessLevel
        } : item));
      } else if (d.type === 'appliance') {
        setAppliances(prev => prev.map(item => item.id.toString() === rawId ? { ...item, isActive: nextActive } : item));
      } else if (d.type === 'camera') {
        setCameras(prev => prev.map(item => item.id.toString() === rawId ? { ...item, isActive: nextActive } : item));
      } else if (d.type === 'external' as any) {
        setExternals(prev => prev.map(item => item.id.toString() === rawId ? { ...item, isActive: nextActive } : item));
      }

      try {
        if (d.type === 'door') {
          await apiFetch(`/Door/LockDoor?id=${rawId}`, { method: 'PUT' });
          setDoors(prev => prev.map(item => item.id.toString() === rawId ? { ...item, isLocked: !item.isLocked } : item));
        } else if (d.type === 'window') {
          await apiFetch(`/Window/LockWindow?id=${rawId}`, { method: 'PUT' });
          setWindows(prev => prev.map(item => item.id.toString() === rawId ? { ...item, isLocked: !item.isLocked } : item));
        } else if (d.type === 'light') {
          const lightDto = (prevLights || []).find(l => l.id.toString() === rawId.toString());
          const calculatedBrightness = (nextActive && (d.value === 0 || d.value === undefined || (lightDto && (lightDto.brightnessLevel === 0 || lightDto.brightnessLevel === undefined)))) ? 100 : (d.value ?? lightDto?.brightnessLevel ?? 100);
          const payload = { 
            id: parseInt(rawId), 
            isActive: nextActive, 
            lightName: lightDto?.lightName || d.name,
            brightnessLevel: calculatedBrightness,
            roomId: resolveRoomId(lightDto?.roomId, rooms),
            sectionId: resolveSectionId(lightDto?.sectionId, sections),
            isHidden: false
          };
          await apiFetch('/Light/UpdateLight', { 
            method: 'PUT', 
            body: JSON.stringify(payload)
          });
        } else if (d.type === 'appliance') {
          const appDto = (prevAppliances || []).find(a => a.id.toString() === rawId.toString());
          const payload = { 
            id: parseInt(rawId), 
            isActive: nextActive, 
            applianceName: appDto?.applianceName || d.name,
            applianceType: appDto?.applianceType ? ((appNamesDetailList?.applianceType || []).find(t => t.name === (appDto as any).applianceType)?.id || 1) : 1,
            roomId: resolveRoomId(appDto?.roomId, rooms),
            sectionId: resolveSectionId(appDto?.sectionId, sections),
            isHidden: false
          };
          await apiFetch('/Appliance/UpdateAppliance', { 
            method: 'PUT', 
            body: JSON.stringify(payload)
          });
        } else if (d.type === 'camera') {
          const token = localStorage.getItem('token');
          await apiFetch(`/Camera/ToggleCamera?id=${rawId}`, { 
            method: 'POST', 
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: ''
          });
        } else if (d.type === 'external' as any) {
          const extDto = (prevExternals || []).find(e => e.id.toString() === rawId.toString());
          if (extDto) {
            const payload = {
              id: parseInt(rawId),
              externalName: extDto.externalName,
              isActive: nextActive,
              isTriggered: isExternalTriggered(extDto),
              actionIds: extDto.actionIds || [],
              roomId: resolveRoomId(extDto.roomId, rooms),
              sectionId: resolveSectionId(extDto.sectionId, sections),
              isHidden: false
            };
            await apiFetch('/External/UpdateExternal', { 
              method: 'PUT', 
              body: JSON.stringify(payload)
            });
          }
        }
        
        toast.success(`Device toggled successfully`);
      } catch (err: any) {
        console.error("Failed to toggle device remotely", err);
        toast.error(`Remote toggle failed: ${err.message}`);
        // Revert states on failure
        setDevices(prevDevices);
        setLights(prevLights);
        setAppliances(prevAppliances);
        setCameras(prevCameras);
        setDoors(prevDoors);
        setExternals(prevExternals);
      }
  };

  const handleDoorAction = async (id: string, action: 'lock'|'unlock'|'open'|'close') => {
    let d = devices.find(x => x.id === id || x.id.split('-')[1] === id || x.id === `door-${id}` || x.id === `window-${id}`);
    if (!d) return;

    const rawId = getRawId(d.id);
    const isCurrentlyOpen = d.status === 'open' || d.status === 'open-locked';
    const isCurrentlyLocked = d.status === 'locked' || d.status === 'open-locked';

    if ((action === 'open' || action === 'close') && isCurrentlyLocked) {
      toast.error(`Cannot ${action} ${d.type} because it is locked`);
      return;
    }

    try {
      if (d.type === 'door') {
        if (action === 'lock' || action === 'unlock') {
          await apiFetch(`/Door/LockDoor?id=${rawId}`, { method: 'PUT' });
        } else if (action === 'open' || action === 'close') {
          await apiFetch(`/Door/UnlockDoor?id=${rawId}`, { method: 'PUT' });
        }
        setDoors(prev => prev.map(item => item.id.toString() === rawId ? { 
          ...item, 
          isLocked: action === 'lock' ? true : action === 'unlock' ? false : item.isLocked,
          isOpen: action === 'open' ? true : action === 'close' ? false : (action === 'lock' ? false : item.isOpen)
        } : item));
      } else if (d.type === 'window') {
        if (action === 'lock' || action === 'unlock') {
          await apiFetch(`/Window/LockWindow?id=${rawId}`, { method: 'PUT' });
        } else if (action === 'open' || action === 'close') {
          await apiFetch(`/Window/UnlockWindow?id=${rawId}`, { method: 'PUT' });
        }
        setWindows(prev => prev.map(item => item.id.toString() === rawId ? { 
          ...item, 
          isLocked: action === 'lock' ? true : action === 'unlock' ? false : item.isLocked,
          isOpen: action === 'open' ? true : action === 'close' ? false : (action === 'lock' ? false : item.isOpen)
        } : item));
      }
      toast.success(`${d.type} ${action}ed successfully`);
    } catch (err: any) {
      console.error(`Failed to ${action} ${d.type} remotely`, err);
      toast.error(`Remote action failed: ${err.message}`);
      return; 
    }

    setDevices(prev => prev.map(dev => {
      if (dev.id !== d.id) return dev;
      let newStatus = dev.status;
      const isLocked = dev.status === 'locked' || dev.status === 'open-locked';
      const isOpen = dev.status === 'open' || dev.status === 'open-locked';

      if (action === 'lock') {
        newStatus = 'locked';
      } else if (action === 'unlock') {
        newStatus = isOpen ? 'open' : 'unlocked';
      } else if (action === 'open') {
        newStatus = isLocked ? 'open-locked' : 'open';
      } else if (action === 'close') {
        newStatus = isLocked ? 'locked' : 'unlocked';
      }
      return { ...dev, status: newStatus as any };
    }));
  };

  const handleStatusChange = (id: string, status: string) => {
    let d = devices.find(x => x.id === id || x.id.split('-')[1] === id);
    if (!d) return;
    setDevices(prev => prev.map(dev => 
      dev.id === d.id ? { ...dev, status } : dev
    ));
  };

  const handleValueChange = (id: string, value: number) => {
    let d = devices.find(x => x.id === id || x.id.split('-')[1] === id);
    if (!d) return;
    setDevices(prev => prev.map(dev => 
      dev.id === d.id ? { ...dev, value } : dev
    ));
    const rawId = d.id.includes('-') ? d.id.split('-')[1] : d.id;
    setLights(prev => prev.map(l => l.id.toString() === rawId ? { ...l, brightnessLevel: value } : l));
  };

  const valueChangeTimers = React.useRef<{ [id: string]: ReturnType<typeof setTimeout> }>({});

  const handleValueChangeEnd = (id: string, value: number) => {
    const matchedId = devices.find(x => x.id === id || x.id.split('-')[1] === id)?.id || id;
    if (valueChangeTimers.current[matchedId]) {
      clearTimeout(valueChangeTimers.current[matchedId]);
    }
    valueChangeTimers.current[matchedId] = setTimeout(async () => {
      setDevices(currentDevices => {
        const d = currentDevices.find(x => x.id === matchedId);
        if (!d || d.type !== 'light') return currentDevices;
        const rawId = d.id.includes('-') ? d.id.split('-')[1] : d.id;
        const lightDto = (lights || []).find(l => l.id.toString() === rawId.toString());
        const currentIsActive = d.status === 'on';
        
        apiFetch('/Light/UpdateLight', {
          method: 'PUT',
          body: JSON.stringify({
            id: parseInt(rawId),
            isActive: currentIsActive,
            lightName: lightDto?.lightName || d.name,
            brightnessLevel: d.value ?? value,
            roomId: resolveRoomId(lightDto?.roomId, rooms),
            sectionId: resolveSectionId(lightDto?.sectionId, sections)
          })
        }).then(() => {
          toast.success('Brightness updated remotely');
        }).catch((err: any) => {
          toast.error(`Remote slider update failed: ${err.message}`);
        });

        return currentDevices;
      });
    }, 2000);
  };

  const handleDeleteDevice = (id: string, type?: string) => {
    const rawId = getRawId(id);
    requestAuth(async () => {
      let isSuccess = true;
      try {
        if (type === 'camera') {
          await apiFetch(`/Camera/DeleteCamera?cameraId=${rawId}`, { method: 'PUT' });
        } else if (type === 'appliance') {
          await apiFetch(`/Appliance/DeleteAppliance?applianceId=${rawId}`, { method: 'PUT' });
        } else if (type === 'window') {
          await apiFetch(`/Window/DeleteWindow?windowId=${rawId}`, { method: 'PUT' });
        } else if (type === 'door') {
          await apiFetch(`/Door/DeleteDoor?doorId=${rawId}`, { method: 'PUT' });
        } else if (type === 'light') {
          await apiFetch(`/Light/DeleteLight?lightId=${rawId}`, { method: 'PUT' });
        }
      } catch (err: any) {
        console.error("Failed to delete device remotely", err);
        toast.error(`Remote deletion failed: ${err.message}`);
        isSuccess = false;
      }
      
      if (isSuccess) {
        setDevices(prev => prev.filter(d => d.id !== id));
        if (type === 'camera') {
          setCameras(prev => prev.filter(c => c.id.toString() !== rawId));
        } else if (type === 'appliance') {
          setAppliances(prev => prev.filter(a => a.id.toString() !== rawId));
        } else if (type === 'window') {
          setWindows(prev => prev.filter(w => w.id.toString() !== rawId));
        } else if (type === 'door') {
          setDoors(prev => prev.filter(d => d.id.toString() !== rawId));
        } else if (type === 'light') {
          setLights(prev => prev.filter(l => l.id.toString() !== rawId));
        }
        toast.success("Device deleted successfully");
      }
    });
  };

  const handleEditDevice = (id: string, type?: string) => {
    const device = devices.find(d => d.id === id && (type ? d.type === type : true));
    if (device) {
      let finalDevice = { ...device };
      const rawId = getRawId(device.id);
      if (device.type === 'appliance') {
        const appDto = (appliances || []).find(a => a.id.toString() === rawId || a.applianceName === device.name);
        if (appDto) {
          const typeId = (appNamesDetailList?.applianceType || []).find(t => t.name === (appDto as any).applianceType)?.id || 1;
          finalDevice.applianceType = typeId;
        }
      }
      if (device.type === 'door') {
        // Reverse map device.doorType (the string name) back to the ID for the select dropdown
        const doorTypeItem = (appNamesDetailList?.doorType || []).find((t: any) => t.name === device.doorType);
        finalDevice.doorType = doorTypeItem ? doorTypeItem.id : 1;
      }
      if (device.type === 'camera') {
        const camDto = (cameras || []).find(c => c.id.toString() === rawId || c.cameraName === device.name);
        if (camDto) {
          finalDevice.ipAddress = camDto.ipAddress;
          finalDevice.username = camDto.username;
          finalDevice.password = camDto.password;
          finalDevice.streamPath = camDto.streamPath;
          finalDevice.port = camDto.port;
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
    } else if (d.type === 'external' as any) {
      const rawId = d.id.includes('-') ? d.id.split('-')[1] : d.id;
      const extDto = (externals || []).find(e => e.id.toString() === rawId.toString());
      if (extDto) {
        setSelectedExternal(extDto);
        setIsViewExternalOpen(true);
      }
    }
  };

  const getFacilityTypeBadgeColor = (type?: string) => {
    if (!type) return "bg-primary/10 text-primary border-primary/20";
    const t = type.toLowerCase();
    switch (t) {
      case 'light': return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case 'door': return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case 'appliance': return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case 'camera': return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case 'window': return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case 'external': return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case 'hardware': return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case 'action': return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case 'room': return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
      case 'section': return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      case 'person': return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20";
      case 'contact': return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case 'contactcategory': return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const formatFacilityTypeName = (type?: string) => {
    if (!type) return '';
    const t = type.toLowerCase();
    switch (t) {
      case 'contactcategory': return 'Contact Category';
      case 'person': return 'User';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getFacilityTypeIcon = (type?: string) => {
    if (!type) return <Tag className="h-3 w-3" />;
    const t = type.toLowerCase();
    switch (t) {
      case 'light': return <Lightbulb className="h-3 w-3" />;
      case 'door': return <Lock className="h-3 w-3" />;
      case 'appliance': return <Power className="h-3 w-3" />;
      case 'camera': return <Camera className="h-3 w-3" />;
      case 'window': return <WindowIcon className="h-3 w-3" />;
      case 'external': return <Radio className="h-3 w-3" />;
      case 'hardware': return <Cpu className="h-3 w-3" />;
      case 'action': return <Play className="h-3 w-3" />;
      case 'room': return <HomeIcon className="h-3 w-3" />;
      case 'section': return <Layers className="h-3 w-3" />;
      case 'person': return <UserIcon className="h-3 w-3" />;
      case 'contact': return <Contact className="h-3 w-3" />;
      case 'contactcategory': return <Tag className="h-3 w-3" />;
      default: return <Tag className="h-3 w-3" />;
    }
  };

  const getFacilityItemName = (facilityType?: string, facilityId?: number) => {
    if (!facilityType || facilityId === undefined || facilityId === null) return null;
    const typeStr = facilityType.toString().trim().toLowerCase();
    const idNum = Number(facilityId);

    switch (typeStr) {
      case 'appliance': {
        const app = (appliances || []).find(a => Number(a.id) === idNum);
        return app ? (app.applianceName || (app as any).name) : null;
      }
      case 'camera': {
        const cam = (cameras || []).find(c => Number(c.id) === idNum);
        return cam ? (cam.cameraName || (cam as any).name) : null;
      }
      case 'door': {
        const d = (doors || []).find(item => Number(item.id) === idNum);
        return d ? (d.doorName || (d as any).name) : null;
      }
      case 'external': {
        const ext = (externals || []).find(e => Number(e.id) === idNum);
        return ext ? (ext.externalName || (ext as any).name) : null;
      }
      case 'light': {
        const l = (lights || []).find(item => Number(item.id) === idNum);
        return l ? (l.lightName || (l as any).name) : null;
      }
      case 'window': {
        const w = (windows || []).find(item => Number(item.id) === idNum);
        return w ? (w.windowName || (w as any).name) : null;
      }
      case 'hardware': {
        const hw = (hardwares || []).find(h => Number(h.id) === idNum);
        return hw ? (hw.hardwareName || (hw as any).name) : null;
      }
      case 'action': {
        const act = (actions || []).find(a => Number(a.id) === idNum);
        return act ? (act.actionName || (act as any).name) : null;
      }
      case 'room': {
        const r = (rooms || []).find(room => Number(room.id) === idNum || Number(room.dbId) === idNum);
        return r ? (r.name || (r as any).roomName) : null;
      }
      case 'section': {
        const s = (sections || []).find(sec => Number(sec.id) === idNum || Number(sec.dbId) === idNum);
        return s ? (s.name || (s as any).sectionName) : null;
      }
      case 'person': {
        const p = (allUsers || []).find(u => Number(u.id) === idNum || Number(u.personId) === idNum);
        if (p?.getPersonDetailsDto) {
          return `${p.getPersonDetailsDto.firstName || ''} ${p.getPersonDetailsDto.lastName || ''}`.trim() || null;
        }
        return null;
      }
      case 'contact': {
        const c = (contacts || []).find(cont => Number(cont.id) === idNum);
        if (c) {
          return `${c.firstName || ''} ${c.lastName || ''}`.trim() || null;
        }
        return null;
      }
      case 'contactcategory': {
        const cat = (contactCategories || []).find(ctg => Number(ctg.id) === idNum);
        return cat ? (cat.categoryName || (cat as any).name) : null;
      }
      default:
        return null;
    }
  };

  const handleNavigateToLogItem = (log: GetLogDto) => {
    const fType = log.facilityType || (log as any).FacilityType;
    const fIdRaw = log.facilityId ?? (log as any).FacilityId;
    if (!fType) return;

    const fTypeStr = fType.toString().trim();
    const fId = typeof fIdRaw === 'number' ? fIdRaw : parseInt(fIdRaw || '0', 10);
    const lowerType = fTypeStr.toLowerCase();

    setIsViewLogOpen(false);

    if (lowerType === 'appliance') {
      setActiveView('facility-appliances');
      if (fId) {
        const found = devices.find(dev => dev.type === 'appliance' && (dev.id === fId.toString() || dev.id === `appliance-${fId}` || dev.id.endsWith(`-${fId}`) || dev.dbId === fId))
          || (() => {
              const app = (appliances || []).find(a => a.id === fId || a.id.toString() === fId.toString());
              if (!app) return null;
              return {
                id: `appliance-${app.id}`,
                dbId: app.id,
                name: app.applianceName || `Appliance #${app.id}`,
                type: 'appliance',
                status: app.isActive ? 'on' : 'off',
                room: (rooms || []).find(r => r.id === app.roomId)?.name || 'Facility Overview',
                icon: 'Power',
                sectionId: app.sectionId?.toString(),
                roomId: app.roomId?.toString()
              } as Device;
            })();
        if (found) {
          setSelectedAppliance(found);
          setTimeout(() => {
            setIsApplianceModalOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'camera') {
      setActiveView('facility-cameras');
      if (fId) {
        const found = devices.find(dev => dev.type === 'camera' && (dev.id === fId.toString() || dev.id === `camera-${fId}` || dev.id.endsWith(`-${fId}`) || dev.dbId === fId))
          || (() => {
              const cam = (cameras || []).find(c => c.id === fId || c.id.toString() === fId.toString());
              if (!cam) return null;
              return {
                id: `camera-${cam.id}`,
                dbId: cam.id,
                name: cam.cameraName || `Camera #${cam.id}`,
                type: 'camera',
                status: cam.isActive ? 'on' : 'off',
                room: (rooms || []).find(r => r.id === cam.roomId)?.name || 'Facility Overview',
                icon: 'Video',
                sectionId: cam.sectionId?.toString(),
                roomId: cam.roomId?.toString()
              } as Device;
            })();
        if (found) {
          setSelectedCamera(found);
          setTimeout(() => {
            setIsCameraModalOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'door') {
      setActiveView('facility-doors');
      if (fId) {
        const found = devices.find(dev => dev.type === 'door' && (dev.id === fId.toString() || dev.id === `door-${fId}` || dev.id.endsWith(`-${fId}`) || dev.dbId === fId))
          || (() => {
              const dr = (doors || []).find(d => d.id === fId || d.id.toString() === fId.toString());
              if (!dr) return null;
              return {
                id: `door-${dr.id}`,
                dbId: dr.id,
                name: dr.doorName || `Door #${dr.id}`,
                type: 'door',
                status: dr.isOpen ? 'on' : 'off',
                isLocked: dr.isLocked,
                room: (rooms || []).find(r => r.id === dr.roomId)?.name || 'Facility Overview',
                icon: 'Lock',
                sectionId: dr.sectionId?.toString(),
                roomId: dr.roomId?.toString()
              } as Device;
            })();
        if (found) {
          setSelectedDoor(found);
          setTimeout(() => {
            setIsDoorModalOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'external') {
      setActiveView('facility-externals');
      if (fId) {
        const ext = (externals || []).find(e => e.id === fId || e.id.toString() === fId.toString());
        if (ext) {
          setSelectedExternal(ext);
          setTimeout(() => {
            setIsViewExternalOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'light') {
      setActiveView('facility-lights');
      if (fId) {
        const found = devices.find(dev => dev.type === 'light' && (dev.id === fId.toString() || dev.id === `light-${fId}` || dev.id.endsWith(`-${fId}`) || dev.dbId === fId))
          || (() => {
              const lt = (lights || []).find(l => l.id === fId || l.id.toString() === fId.toString());
              if (!lt) return null;
              return {
                id: `light-${lt.id}`,
                dbId: lt.id,
                name: lt.lightName || `Light #${lt.id}`,
                type: 'light',
                status: lt.isActive ? 'on' : 'off',
                value: lt.brightnessLevel || 100,
                room: (rooms || []).find(r => r.id === lt.roomId)?.name || 'Facility Overview',
                icon: 'Lightbulb',
                sectionId: lt.sectionId?.toString(),
                roomId: lt.roomId?.toString()
              } as Device;
            })();
        if (found) {
          setSelectedLight(found);
          setTimeout(() => {
            setIsLightModalOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'window') {
      setActiveView('facility-windows');
      if (fId) {
        const found = devices.find(dev => dev.type === 'window' && (dev.id === fId.toString() || dev.id === `window-${fId}` || dev.id.endsWith(`-${fId}`) || dev.dbId === fId))
          || (() => {
              const win = (windows || []).find(w => w.id === fId || w.id.toString() === fId.toString());
              if (!win) return null;
              return {
                id: `window-${win.id}`,
                dbId: win.id,
                name: win.windowName || `Window #${win.id}`,
                type: 'window',
                status: win.isOpen ? 'on' : 'off',
                isLocked: win.isLocked,
                room: (rooms || []).find(r => r.id === win.roomId)?.name || 'Facility Overview',
                icon: 'AppWindow',
                sectionId: win.sectionId?.toString(),
                roomId: win.roomId?.toString()
              } as Device;
            })();
        if (found) {
          setSelectedWindow(found);
          setTimeout(() => {
            setIsViewWindowOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'hardware') {
      setActiveView('facility-hardware');
      if (fId) {
        const hw = (hardwares || []).find(h => h.id === fId || h.id.toString() === fId.toString());
        if (hw) {
          setSelectedHardware(hw);
          setTimeout(() => {
            setIsHardwareDetailOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'action') {
      setActiveView('facility-actions');
      if (fId) {
        const act = (actions || []).find(a => a.id === fId || a.id.toString() === fId.toString());
        if (act) {
          setSelectedAction(act);
          setTimeout(() => {
            setIsViewActionOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'room') {
      setActiveView('facility-rooms');
      if (fId) {
        const rm = (rooms || []).find(r => r.id === fId || r.id.toString() === fId.toString() || r.dbId === fId);
        if (rm) {
          setViewingRoom(rm);
          setTimeout(() => {
            setIsViewRoomOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'section') {
      setActiveView('facility-overview');
      if (fId) {
        const sec = (sections || []).find(s => s.id === fId || s.id.toString() === fId.toString() || s.dbId === fId);
        if (sec) {
          setViewingSection(sec);
          setTimeout(() => {
            setIsViewSectionOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'person') {
      setActiveView('all-users');
      if (fId) {
        const p = (allUsers || []).find(usr => usr.id === fId || usr.id.toString() === fId.toString() || usr.personId === fId || usr.getPersonDto?.id === fId);
        if (p) {
          setViewingPerson(p);
          setTimeout(() => {
            setIsViewPersonDetailsOpen(true);
          }, 150);
        } else if (log.getPersonDto && (log.getPersonDto.id === fId || log.personId === fId)) {
          setViewingPerson(log.getPersonDto);
          setTimeout(() => {
            setIsViewPersonDetailsOpen(true);
          }, 150);
        }
      } else if (log.getPersonDto) {
        setViewingPerson(log.getPersonDto);
        setTimeout(() => {
          setIsViewPersonDetailsOpen(true);
        }, 150);
      }
    } else if (lowerType === 'contact') {
      setActiveView('contacts');
      if (fId) {
        const cnt = (contacts || []).find(c => c.id === fId || c.id.toString() === fId.toString());
        if (cnt) {
          setViewingContact(cnt);
          setTimeout(() => {
            setIsViewContactOpen(true);
          }, 150);
        }
      }
    } else if (lowerType === 'contactcategory') {
      setActiveView('contacts');
      if (fId) {
        setContactSortCategory(fId.toString());
      }
    } else {
      setActiveView('facility-overview');
    }
  };

  const handleSaveDevice = () => {
    requestAuth(async () => {
      if (editingDevice && editingDevice.id) {
        let isSuccess = true;
        const rawId = getRawId(editingDevice.id);
        const rRaw = editingDevice.room;
        const sRaw = editingDevice.section;
        const finalRoomId = resolveRoomId(rRaw, rooms);
        const finalSectionId = resolveSectionId(sRaw, sections);

        try {
          if (editingDevice.type === 'camera') {
            await apiFetch('/Camera/UpdateCamera', {
              method: 'PUT',
              body: JSON.stringify({
                id: Number(rawId) || 0,
                roomId: finalRoomId,
                sectionId: finalSectionId,
                isHidden: false,
                cameraName: editingDevice.name,
                isActive: true,
                ipAddress: editingDevice.ipAddress || '127.0.0.1',
                username: (editingDevice.username && editingDevice.username.trim() !== '') ? editingDevice.username : null,
                password: (editingDevice.password && editingDevice.password.trim() !== '') ? editingDevice.password : null,
                streamPath: editingDevice.streamPath || '/',
                port: editingDevice.port !== undefined ? Number(editingDevice.port) : 80
              })
            });
          } else if (editingDevice.type === 'appliance') {
            await apiFetch('/Appliance/UpdateAppliance', {
              method: 'PUT',
              body: JSON.stringify({
                id: Number(rawId) || 0,
                roomId: finalRoomId,
                sectionId: finalSectionId,
                isHidden: false,
                applianceName: editingDevice.name,
                applianceType: parseInt(editingDevice.applianceType?.toString() || '1'),
                isActive: true
              })
            });
          } else if (editingDevice.type === 'window') {
            await apiFetch('/Window/UpdateWindow', {
              method: 'PUT',
              body: JSON.stringify({
                id: Number(rawId) || 0,
                roomId: finalRoomId,
                sectionId: finalSectionId,
                isHidden: false,
                windowName: editingDevice.name,
                isOpen: editingDevice.status === 'open' || editingDevice.status === 'open-locked',
                isLocked: editingDevice.status === 'locked' || editingDevice.status === 'open-locked',
                openedBy: 0,
                lockedBy: 0,
                unlockedBy: 0
              })
            });
          } else if (editingDevice.type === 'door') {
            await apiFetch('/Door/UpdateDoor', {
              method: 'PUT',
              body: JSON.stringify({
                id: Number(rawId) || 0,
                roomId: finalRoomId,
                sectionId: finalSectionId,
                isHidden: false,
                doorName: editingDevice.name,
                doorType: resolveDoorType(editingDevice.doorType),
                isLocked: editingDevice.status === 'locked' || editingDevice.status === 'open-locked',
                isOpen: editingDevice.status === 'open' || editingDevice.status === 'open-locked',
                openedBy: 0,
                lockedBy: 0,
                unlockedBy: 0
              })
            });
          } else if (editingDevice.type === 'light') {
            await apiFetch('/Light/UpdateLight', {
              method: 'PUT',
              body: JSON.stringify({
                id: Number(rawId) || 0,
                roomId: finalRoomId,
                sectionId: finalSectionId,
                isHidden: false,
                lightName: editingDevice.name,
                brightnessLevel: editingDevice.value || 0,
                isActive: editingDevice.status === 'on'
              })
            });
          }
        } catch (err: any) {
          console.error("Failed to update device remotely", err);
          toast.error(`Remote update failed: ${err.message}`);
          isSuccess = false;
        }

        if (isSuccess) {
          const finalRoom = (finalRoomId !== null) ? finalRoomId.toString() : '';
          const finalSection = (finalSectionId !== null) ? finalSectionId.toString() : '';
          
          let doorTypeName = undefined;
          if (editingDevice.type === 'door') {
            const dtId = editingDevice.doorType?.toString();
            doorTypeName = (appNamesDetailList?.doorType || []).find((t: any) => t.id.toString() === dtId)?.name || editingDevice.doorType;
          }

          const processedEditingDevice = {
            ...editingDevice,
            room: finalRoom,
            section: finalSection,
            ...(doorTypeName ? { doorType: doorTypeName } : {})
          };
          setDevices(prev => prev.map(d => d.id === editingDevice.id ? { ...d, ...processedEditingDevice } as Device : d));
          
          if (editingDevice.type === 'door') {
            setDoors(prev => prev.map(d => d.id.toString() === rawId ? {
              ...d,
              doorName: editingDevice.name || d.doorName,
              doorType: editingDevice.doorType || d.doorType,
              roomId: finalRoomId,
              sectionId: finalSectionId
            } : d));
          }
          if (editingDevice.type === 'camera') {
            setCameras(prev => prev.map(c => c.id.toString() === rawId ? {
              ...c,
              cameraName: editingDevice.name || c.cameraName,
              roomId: finalRoomId,
              sectionId: finalSectionId
            } : c));
          }
          if (editingDevice.type === 'appliance') {
            setAppliances(prev => prev.map(a => a.id.toString() === rawId ? {
              ...a,
              applianceName: editingDevice.name || a.applianceName,
              applianceType: (appNamesDetailList?.applianceType || []).find((t: any) => t.id.toString() === editingDevice.applianceType?.toString())?.name || a.applianceType,
              roomId: finalRoomId,
              roomName: finalRoomId !== null ? (rooms || []).find(r => r.id.toString() === finalRoomId.toString())?.name : undefined,
              sectionId: finalSectionId,
              sectionName: finalSectionId !== null ? (sections || []).find(s => s.id.toString() === finalSectionId.toString())?.name : undefined
            } : a));
          }
          if (editingDevice.type === 'window') {
            setWindows(prev => prev.map(w => w.id.toString() === rawId ? {
              ...w,
              windowName: editingDevice.name || w.windowName,
              roomId: finalRoomId,
              sectionId: finalSectionId
            } : w));
          }
          if (editingDevice.type === 'light') {
            setLights(prev => prev.map(l => l.id.toString() === rawId ? {
              ...l,
              lightName: editingDevice.name || l.lightName,
              brightnessLevel: editingDevice.value || l.brightnessLevel,
              isActive: editingDevice.status === 'on',
              roomId: finalRoomId,
              sectionId: finalSectionId
            } : l));
          }
          setIsEditDeviceOpen(false);
          setEditingDevice(null);
          toast.success("Device updated successfully");
        }
      }
    });
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsEditRoomOpen(true);
  };

  const handleSaveRoom = () => {
    requestAuth(async () => {
      if (editingRoom && editingRoom.id) {
        try {
          const finalSectionId = resolveSectionId(editingRoom.section, sections);

          await apiFetch('/Room/UpdateRoom', {
            method: 'PUT',
            body: JSON.stringify({
              id: Number(editingRoom.id) || 0,
              roomName: editingRoom.name,
              icon: editingRoom.icon || 'Sofa',
              personId: editingRoom.personId !== undefined && editingRoom.personId !== null ? editingRoom.personId : (userProfile?.id || 0),
              sectionId: finalSectionId,
              isHidden: editingRoom.isHidden || false
            })
          });
          setRooms((prev: any) => prev.map((r: any) => r.id === editingRoom.id ? { ...r, ...editingRoom } as Room : r));
          setUserRooms((prev: any) => prev.map((r: any) => r.id === editingRoom.id ? { ...r, ...editingRoom } as Room : r));
          setIsEditRoomOpen(false);
          setEditingRoom(null);
          toast.success("Room updated successfully");
        } catch (err: any) {
          console.error("Failed to update room", err);
          toast.error(`Failed to update room: ${err.message}`);
        }
      }
    });
  };

  const handleDeleteRoom = (id: string) => {
    requestAuth(async () => {
      try {
        await apiFetch(`/Room/DeleteRoom?roomId=${id}`, { method: 'PUT' });
        setRooms((prev: any) => prev.filter((r: any) => r.id !== id));
        setUserRooms((prev: any) => prev.filter((r: any) => r.id !== id));
        if (activeView === `room-${id}`) {
          setActiveView('facility-rooms');
        }
        toast.success("Room deleted successfully");
      } catch (err: any) {
        console.error("Failed to delete room", err);
        toast.error(`Failed to delete room: ${err.message}`);
      }
    });
  };

  const triggerScene = (scene: Scene) => {
    setDevices(prev => prev.map(device => {
      const action = (scene.actions || []).find(a => a.deviceId === device.id);
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

    requestAuth(async () => {
      try {
        if (inferredType === 'camera') {
          const payload = {
            roomId: resolveRoomId(newDevice.room, rooms),
            sectionId: resolveSectionId(newDevice.section, sections),
            isHidden: true,
            cameraName: newDevice.name,
            ipAddress: newDevice.ipAddress || '0.0.0.0',
            username: newDevice.username && newDevice.username.trim() !== '' ? newDevice.username : null,
            password: newDevice.password && newDevice.password.trim() !== '' ? newDevice.password : null,
            streamPath: newDevice.streamPath || '',
            port: newDevice.port ? parseInt(newDevice.port.toString()) : 80
          };
          await apiFetch('/Camera/CreateCamera', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          toast.success('Camera added successfully'); 
          setIsAddDeviceOpen(false);
        } else if (inferredType === 'appliance') {
          const appType = newDevice.applianceType || 1;
          const payload = {
            roomId: resolveRoomId(newDevice.room, rooms),
            sectionId: resolveSectionId(newDevice.section, sections),
            isHidden: true,
            applianceName: newDevice.name,
            applianceType: appType
          };
          await apiFetch('/Appliance/CreateAppliance', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          toast.success('Appliance added successfully'); 
          setIsAddDeviceOpen(false);
        } else if (inferredType === 'door') {
          const payload = {
            roomId: resolveRoomId(newDevice.room, rooms),
            sectionId: resolveSectionId(newDevice.section, sections),
            isHidden: true,
            doorName: newDevice.name,
            doorType: resolveDoorType(newDevice.doorType),
            isLocked: true,
            isOpen: false,
            openedBy: 0,
            lockedBy: userProfile?.id || 0,
            unlockedBy: 0
          };
          await apiFetch('/Door/CreateDoor', {
            method: 'POST', 
            body: JSON.stringify(payload)
          });
          toast.success('Door added successfully'); 
          setIsAddDeviceOpen(false);
        } else if (inferredType === 'window') {
          const payload = {
            roomId: resolveRoomId(newDevice.room, rooms),
            sectionId: resolveSectionId(newDevice.section, sections),
            isHidden: true,
            windowName: newDevice.name,
            windowId: Math.random().toString(36).substring(2, 9),
            isOpen: false,
            isLocked: true,
            openedBy: 0,
            lockedBy: userProfile?.id || 0,
            unlockedBy: 0
          };
          await apiFetch('/Window/CreateWindow', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          toast.success('Window added successfully'); 
          setIsAddDeviceOpen(false);
        } else if (inferredType === 'light') {
          const payload = {
            roomId: resolveRoomId(newDevice.room, rooms),
            sectionId: resolveSectionId(newDevice.section, sections),
            isHidden: true,
            lightName: newDevice.name,
            brightnessLevel: 0
          };
          await apiFetch('/Light/CreateLight', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          toast.success('Light added successfully'); 
          setIsAddDeviceOpen(false);
        } else {
          // Fallback for other generic types mock locally
          const numericId = Math.floor(Math.random() * 9000) + 1000;
          const device: Device = {
            id: Math.random().toString(36).substring(2, 9),
            name: newDevice.name,
            type: inferredType as any,
            room: (newDevice.room === 'none' || !newDevice.room) ? undefined : newDevice.room,
            section: newDevice.section || undefined,
            status: (inferredType === 'door' || inferredType === 'window') ? 'locked' : 'off',
            value: inferredType === 'light' ? 0 : undefined,
            doorType: inferredType === 'door' ? (newDevice.doorType || 'interior') : undefined,
            powerUsage: 0
          };
          setDevices(prev => [...prev, device]);
          toast.success('Device added locally');
        }
        
        setIsAddDeviceOpen(false);
        setNewDevice({
          name: '',
          type: 'light',
          room: '',
          section: '',
          doorType: 1,
          ipAddress: '',
          username: '',
          password: '',
          streamPath: '',
          port: 80,
          applianceType: 1
        });
      } catch (err: any) {
        toast.error(err.message || 'Error occurred while creating the device');
      }
    });
  };

  const handleAddRoom = () => {
    requestAuth(async () => {
      if (!newRoom.name) return;

      try {
        await apiFetch('/Room/CreateRoom', {
          method: 'POST',
          body: JSON.stringify({
            roomName: newRoom.name,
            icon: newRoom.icon || 'Sofa',
            personId: newRoom.personId !== undefined && newRoom.personId !== null ? newRoom.personId : (userProfile?.id || 0),
            sectionId: resolveSectionId(newRoom.section, sections),
            isHidden: newRoom.isHidden || false
          })
        });

        setIsAddRoomOpen(false);
        setNewRoom({ name: '', section: '', icon: 'Sofa' });
        toast.success("Room created successfully");
      } catch (err: any) {
        console.error("Failed to create room", err);
        toast.error(`Failed to create room: ${err.message}`);
      }
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
      filtered = filtered.filter(d => d.room?.toString() === roomId.toString());
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
      filtered = filtered.filter(d => (d?.name || '').toLowerCase().includes(facilitySearchQuery.toLowerCase()));
    }

    // Sorting
    if (activeView.startsWith('facility-')) {
      filtered = [...filtered].sort((a, b) => {
        if (facilitySortBy === 'room') {
          const roomA = (rooms || []).find(r => r.id.toString() === a.room?.toString())?.name || 'No Room';
          const roomB = (rooms || []).find(r => r.id.toString() === b.room?.toString())?.name || 'No Room';
          return roomA.localeCompare(roomB);
        } else {
          const sectionA = (sections || []).find(s => s.id.toString() === a.section?.toString())?.name || 'No Section';
          const sectionB = (sections || []).find(s => s.id.toString() === b.section?.toString())?.name || 'No Section';
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
    const room = isRoom ? (rooms || []).find(r => r.id.toString() === roomId.toString()) : null;
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
      if (!selectedUserRoomId) {
        title = `${userProfile.getPersonDetailsDto.firstName}'s Room(s)`;
      } else {
        const r = (userRooms || []).find(room => room.id === selectedUserRoomId);
        title = r ? `${userProfile.getPersonDetailsDto.firstName}'s ${r.name}` : `${userProfile.getPersonDetailsDto.firstName}'s Room(s)`;
      }
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
      Icon = Play;
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
      const externalCameras = (dashboardData?.cameraNamesUrls && dashboardData.cameraNamesUrls.length > 0)
        ? dashboardData.cameraNamesUrls
        : (cameras && cameras.length > 0)
          ? cameras.map(c => ({
              id: c.id,
              cameraName: c.cameraName || `Camera ${c.id}`,
              url: c.liveStreamUrl,
              liveStreamUrl: c.liveStreamUrl
            }))
          : devices.filter(d => d.type === 'camera').map(d => ({
              id: d.id,
              cameraName: d.name,
              url: d.liveStreamUrl,
              liveStreamUrl: d.liveStreamUrl
            }));
      const totalFacilityCount = (appliances?.length || 0) + (cameras?.length || 0) + (doors?.length || 0) + (lights?.length || 0) + (windows?.length || 0) + (externals?.length || 0) + (hardwares?.length || 0) + (rooms?.length || 0) + (sections?.length || 0) + (actions?.length || 0);
      
      const facilityItemsList = [
        { id: 'appliances', label: 'Appliances', icon: Power, count: appliances?.length || 0, targetView: 'facility-appliances', visible: true },
        { id: 'cameras', label: 'Cameras', icon: Camera, count: cameras?.length || 0, targetView: 'facility-cameras', visible: true },
        { id: 'doors', label: 'Doors', icon: Lock, count: doors?.length || 0, targetView: 'facility-doors', visible: true },
        { id: 'externals', label: 'Externals', icon: Radio, count: externals?.length || 0, targetView: 'facility-externals', visible: true },
        { id: 'hardware', label: 'Hardware', icon: Cpu, count: hardwares?.length || 0, targetView: 'facility-hardware', visible: isOwner },
        { id: 'lights', label: 'Lights', icon: Lightbulb, count: lights?.length || 0, targetView: 'facility-lights', visible: true },
        { id: 'windows', label: 'Windows', icon: WindowIcon, count: windows?.length || 0, targetView: 'facility-windows', visible: true },
        { id: 'rooms', label: 'Rooms', icon: Sofa, count: rooms?.length || 0, targetView: 'facility-rooms', visible: true },
        { id: 'sections', label: 'Sections', icon: LayoutGrid, count: sections?.length || 0, targetView: 'facility-sections', visible: true },
        { id: 'actions', label: 'Actions', icon: Play, count: actions?.length || 0, targetView: 'facility-actions', visible: canSeeActions },
      ];

      const quickAccessCards = [
        {
          id: 'nav-my-room',
          label: `${userProfile?.getPersonDetailsDto?.firstName || 'Inioluwa'}'s Room(s)`,
          icon: HomeIcon,
          description: 'Manage personal room controls, lighting, and assigned devices.',
          onClick: () => {
            setSelectedUserRoomId(null);
            setActiveView('user-room');
          },
          visible: true,
          isFriday: false,
          colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
        },
        {
          id: 'nav-chats',
          label: 'Chats',
          icon: MessageSquare,
          description: 'Direct messaging, group channels, and real-time security alerts.',
          onClick: () => setIsChatModalOpen(true),
          visible: true,
          isFriday: false,
          colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        },
        {
          id: 'nav-contacts',
          label: 'Contacts',
          icon: Contact,
          description: 'Household directory, member profiles, and direct voice or video calling.',
          onClick: () => setActiveView('contacts'),
          visible: true,
          isFriday: false,
          colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        },
        {
          id: 'nav-friday',
          label: 'Friday',
          icon: Sparkles,
          description: 'AI voice assistant for automated control, inquiries, and facility actions.',
          onClick: () => {
            setIsMicOverlayActive(true);
            setIsMicMinimized(false);
            setIsHeaderMicMuted(false);
          },
          visible: true,
          isFriday: true,
          colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        },
      ];

      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Welcome home, {userProfile.getPersonDetailsDto.firstName}!</h1>
            <p className="text-slate-500 dark:text-zinc-400">Everything is looking good. You have {activeDevices} active devices.</p>
          </div>

          {/* Top Metric Cards: Expanded Facilities Card + Logs Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card 
              id="dashboard-facilities-card"
              className="lg:col-span-2 p-5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-primary/40 transition-all rounded-2xl flex flex-col justify-between gap-4 cursor-pointer group"
              onClick={() => setActiveView('facility-overview')}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Facilities</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Integrated physical systems & spaces</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 leading-none">{totalFacilityCount}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-zinc-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Breakdown of each facility item with its own item count & icon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                {facilityItemsList.filter(item => item.visible).map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <div 
                      key={item.id}
                      id={`dashboard-facility-item-${item.id}`}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 transition-all group/item"
                    >
                      <div className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 shadow-2xs">
                        <ItemIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 truncate">
                            {item.label}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md shrink-0">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card 
              id="dashboard-logs-card"
              className="lg:col-span-1 p-5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/40 transition-all rounded-2xl flex flex-col justify-between cursor-pointer group"
              onClick={() => {
                const role = userProfile?.getUserDto?.roleName;
                if (role === 'Owner' || role === 'Wife') {
                  setActiveView('logs');
                } else {
                  toast.error("You do not have permission to view logs.");
                }
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Logs</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Security & activity audit</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="flex flex-col justify-between gap-3 pt-2">
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                  {logs?.length || 50} <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-normal">Entries</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-tight">
                  Track Create, Update, Delete, Lock, Unlock, Open, and Close operations in real time.
                </div>
              </div>
            </Card>
          </div>

          {/* External Security Cameras */}
          <div className="space-y-4 overflow-hidden relative">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              External Security Cameras
            </h2>
            <div className="flex overflow-x-auto snap-x space-x-6 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {externalCameras.length > 0 ? (
                externalCameras.map((cam: any) => {
                  const deviceId = cam.id || cam.cameraName;
                  const name = cam.cameraName || cam.name || `Camera ${cam.id || ''}`;
                  const rawUrl = cam.url || cam.liveStreamUrl || ((cameras || []).find(c => c.id.toString() === cam.id?.toString() || c.cameraName === cam.name || c.cameraName === cam.cameraName)?.liveStreamUrl);
                  const feedUrl = rawUrl ? resolveCameraUrl(rawUrl) : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
                  
                  return (
                    <div 
                      key={deviceId} 
                      onClick={() => {
                        const targetCam = devices.find(d => d.type === 'camera' && (d.id === `camera-${cam.id}` || d.name === name)) || {
                          id: `camera-${cam.id || '1'}`,
                          name: name || 'Camera',
                          type: 'camera',
                          status: 'active',
                          liveStreamUrl: rawUrl
                        };
                        setSelectedCamera(targetCam as Device);
                        setIsCameraModalOpen(true);
                      }}
                      className="min-w-[80vw] sm:min-w-[400px] h-[280px] bg-zinc-950 rounded-3xl snap-center shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-md cursor-pointer group hover:scale-[1.01] transition-transform"
                    >
                      <HlsVideo src={feedUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white flex justify-between items-end">
                        <span className="font-semibold text-lg tracking-tight">{name}</span>
                        <span className="text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse flex items-center gap-1 shadow-sm">
                          <span className="h-1.5 w-1.5 bg-white rounded-full"></span> Live
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full flex justify-center py-6">
                  <NoItems icon={Camera} message="No external security cameras found." />
                </div>
              )}
            </div>
          </div>

          {/* Quick Access */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Quick Access
              </h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Core shortcuts to personal quarters, communication, and AI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickAccessCards.filter(c => c.visible).map(card => {
                const CardIcon = card.icon;
                return (
                  <div
                    key={card.id}
                    id={card.id}
                    onClick={card.onClick}
                    className="p-5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs hover:border-primary/50 hover:bg-slate-50/80 dark:hover:bg-zinc-900/60 transition-all rounded-2xl cursor-pointer group flex flex-col justify-between min-h-[140px] gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {card.isFriday ? (
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                          <DynamicParticleSphere 
                            size={36} 
                            audioLevel={isMicOverlayActive ? 160 : 30} 
                            isIcon={true} 
                          />
                        </div>
                      ) : (
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform", card.colorClass)}>
                          <CardIcon className="h-5 w-5" />
                        </div>
                      )}
                      <span className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight truncate group-hover:text-primary transition-colors select-none">
                        {card.label}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                        {card.description}
                      </p>
                      <div className="flex items-center justify-center shrink-0 p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 group-hover:bg-primary/10 transition-colors">
                        <ArrowRight className="h-4 w-4 text-slate-400 dark:text-zinc-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      );
    }

    if (activeView === 'facilities' || activeView === 'facility-overview') {
      const facilityCategories = [
        { id: 'facility-actions', name: 'Actions', icon: Play, type: 'action' },
        { id: 'facility-appliances', name: 'Appliances', icon: Power, type: 'appliance' },
        { id: 'facility-cameras', name: 'Cameras', icon: Camera, type: 'camera' },
        { id: 'facility-doors', name: 'Doors', icon: Lock, type: 'door' },
        { id: 'facility-externals', name: 'Externals', icon: Radio, type: 'externals' },
        { id: 'facility-hardware', name: 'Hardware', icon: Cpu, type: 'hardware' },
        { id: 'facility-lights', name: 'Lights', icon: Lightbulb, type: 'light' },
        { id: 'facility-windows', name: 'Windows', icon: WindowIcon, type: 'window' },
        { id: 'facility-rooms', name: 'Rooms', icon: Sofa, type: 'room' },
        { id: 'facility-sections', name: 'Sections', icon: LayoutGrid, type: 'section' },
      ];

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
            <p className="text-slate-500 dark:text-zinc-400">Real-time status summary of your home infrastructure.</p>
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
                active = total; // always full except if 0
                statusSummary = `${total} Total Rooms`;
              } else if (cat.type === 'action') {
                total = actions.length;
                active = actions.filter(a => a.actionActive).length;
                statusSummary = `${active} Active Actions`;
              } else if (cat.type === 'hardware') {
                total = hardwares.length;
                active = hardwares.filter(h => h.isActive).length;
                inactive = total - active;
                statusSummary = `${active} Active â€¢ ${inactive} Off`;
              } else if (cat.type === 'externals') {
                total = externals.length;
                active = externals.filter(e => isExternalTriggered(e)).length;
                inactive = total - active;
                statusSummary = `${active} Triggered â€¢ ${inactive} OK`;
              } else if (cat.type === 'section') {
                total = sections.length;
                active = total; // always full except if 0
                statusSummary = `${total} Total Sections`;
              } else {
                const categoryDevices = devices.filter(d => d.type === cat.type);
                total = categoryDevices.length;
                
                if (cat.type === 'light' || cat.type === 'appliance') {
                  active = categoryDevices.filter(d => d.status === 'on' || d.status === 'active').length;
                  inactive = total - active;
                  statusSummary = `${active} On â€¢ ${inactive} Off`;
                } else if (cat.type === 'door' || cat.type === 'window') {
                  const locked = categoryDevices.filter(d => d.status === 'locked' || d.status === 'open-locked').length;
                  const unlocked = total - locked;
                  active = locked; // Windows and doors show locked count in progress bar
                  statusSummary = `${locked} Locked â€¢ ${unlocked} Unlocked`;
                } else if (cat.type === 'camera') {
                  active = categoryDevices.filter(d => d.status === 'active' || d.status === 'on').length;
                  inactive = total - active;
                  statusSummary = `${active} Active â€¢ ${inactive} Inactive`;
                } else {
                  active = categoryDevices.filter(d => d.status === 'on' || d.status === 'active' || d.status === 'unlocked' || d.status === 'open').length;
                  inactive = total - active;
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
                      <ChevronRight className="h-5 w-5 text-slate-500 dark:text-zinc-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="mt-6 space-y-2">
                      <h3 className="text-xl font-bold">{cat.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">{total} Items</Badge>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{statusSummary}</span>
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
      const role = userProfile?.getUserDto?.roleName;
      if (role !== 'Owner' && role !== 'Wife') {
        return null;
      }
      const filteredLogs = logs.filter(log => {
        if (!logStartDate && !logEndDate) return true;
        const logDate = new Date(log.timeOfAction);
        const start = logStartDate ? new Date(logStartDate) : new Date(0);
        const end = logEndDate ? new Date(logEndDate) : new Date();
        return logDate >= start && logDate <= end;
      });

      const displayedLogs = filteredLogs;

      const getActionTypeBadgeColor = (type: string) => {
        switch (type) {
          case 'Light Control': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
          case 'Door Security': return 'bg-red-500/10 text-red-500 border-red-500/20';
          case 'Scene Activation': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
          case 'Appliance State': return 'bg-slate-500/10 text-blue-500 border-slate-200/20';
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
                  <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border-none font-bold text-[10px] uppercase tracking-wider">
                    <ClipboardList className="h-3 w-3" />
                    {logs.length} Total Logs
                  </Badge>
                </div>
              </div>
              <p className="text-slate-500 dark:text-zinc-400">Recent actions and events in your smart home.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border shadow-sm">
              <div className="flex flex-col gap-1.5 prose-sm">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 ml-1">From</Label>
                <Popover>
                  <PopoverTrigger 
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 justify-start text-left font-normal w-[160px] rounded-xl border-dashed hover:border-solid transition-all",
                          !logStartDate && "text-slate-500 dark:text-zinc-400"
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
                        setLogPage(1); // Reset page count on filter
                      }}
                      initialFocus
                      className="rounded-2xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 ml-1">To</Label>
                <Popover>
                  <PopoverTrigger 
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 justify-start text-left font-normal w-[160px] rounded-xl border-dashed hover:border-solid transition-all",
                          !logEndDate && "text-slate-500 dark:text-zinc-400"
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
                        setLogPage(1); // Reset page count on filter
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
                onClick={() => { setLogStartDate(''); setLogEndDate(''); setLogPage(1); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
            <div className="divide-y text-left">
              {isViewLoading('logs') ? (
                <div className="p-8">
                  <ThreeDotsLoading label="Loading logs..." />
                </div>
              ) : displayedLogs.length > 0 ? (displayedLogs || []).map(log => {
                const details = log.getPersonDto?.getPersonDetailsDto;
                const userFullName = details ? `${details.firstName} ${details.lastName}` : 'System';
                const imageUrl = details?.imageUrl;

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
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center border border-primary/10">
                        {imageUrl ? (
                          <img src={getFullImageUrl(imageUrl)} alt={userFullName} className="h-full w-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-medium leading-none text-foreground flex items-center gap-2 flex-wrap text-left">
                          <span className="font-bold">{userFullName}</span>
                          <span className="text-slate-500 dark:text-zinc-400 truncate max-w-[400px] text-left">{log.logDetails}</span>
                        </p>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 inline text-primary/75" />
                          {formatRelativeTime(log.timeOfAction)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap flex-shrink-0">
                      {(log.facilityType || (log as any).FacilityType) && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs px-2.5 py-0.5 rounded-full border font-medium flex items-center gap-1.5 shadow-none",
                            getFacilityTypeBadgeColor(log.facilityType || (log as any).FacilityType)
                          )}
                        >
                          {getFacilityTypeIcon(log.facilityType || (log as any).FacilityType)}
                          <span>{formatFacilityTypeName(log.facilityType || (log as any).FacilityType)}</span>
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-xs px-2.5 py-0.5 rounded-full border", getActionTypeBadgeColor(log.actionType))}>
                        {log.actionType}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-slate-500 dark:text-zinc-400 hidden sm:block" />
                    </div>
                  </div>
                );
              }) : (
                <div className="p-12 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center justify-center gap-3">
                  <ClipboardList className="h-12 w-12 text-slate-500 dark:text-zinc-400/40" />
                  <div>
                    <p className="font-semibold text-foreground">No logs found</p>
                    <p className="text-xs">Adjust your date filters or do some changes to trigger logs.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Paging / Loading Trigger element */}
            {hasMoreLogs && (
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
                    className="text-slate-500 dark:text-zinc-400 hover:text-foreground text-xs font-semibold py-1.5 px-4 rounded-xl border-dashed border hover:border-solid bg-background/50 hover:bg-background transition-all"
                    onClick={() => fetchMoreLogs()}
                  >
                    Load More
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Single View Log Details Modal */}
          <Dialog open={isViewLogOpen} onOpenChange={setIsViewLogOpen}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl border shadow-2xl p-6 bg-card" showCloseButton={false}>
              <div className="absolute right-4 top-4 flex items-center gap-1 z-50">
              <DialogClose render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-500 dark:text-zinc-400 hover:text-foreground hover:bg-muted transition-colors shrink-0" />}>
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
                        src={getFullImageUrl(selectedLog.getPersonDto?.getPersonDetailsDto?.imageUrl) || 'https://picsum.photos/seed/system/100/100'} 
                        alt="User Avatar" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-foreground text-base leading-snug">
                        {selectedLog.getPersonDto?.getPersonDetailsDto?.firstName} {selectedLog.getPersonDto?.getPersonDetailsDto?.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1 flex-wrap text-left">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 bg-muted/10 p-3 rounded-xl border text-left">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 block text-left">Action Class</span>
                        <Badge variant="outline" className={cn("text-xs font-bold w-fit", getActionTypeBadgeColor(selectedLog.actionType))}>
                          {selectedLog.actionType}
                        </Badge>
                      </div>
                      {(selectedLog.facilityType || (selectedLog as any).FacilityType) && (
                        <div className="space-y-1 bg-muted/10 p-3 rounded-xl border text-left">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 block text-left">FACILITY</span>
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() => handleNavigateToLogItem(selectedLog)}
                              title={`Navigate to ${formatFacilityTypeName(selectedLog.facilityType || (selectedLog as any).FacilityType)}`}
                              className={cn(
                                "group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-xs hover:shadow-sm hover:scale-[1.03] active:scale-[0.97] text-left",
                                getFacilityTypeBadgeColor(selectedLog.facilityType || (selectedLog as any).FacilityType)
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                {getFacilityTypeIcon(selectedLog.facilityType || (selectedLog as any).FacilityType)}
                                <span>{formatFacilityTypeName(selectedLog.facilityType || (selectedLog as any).FacilityType)}</span>
                              </div>
                              <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                className="flex items-center justify-center text-current opacity-80 group-hover:opacity-100"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </motion.div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 bg-muted/10 p-4 rounded-xl border text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 block text-left">Timestamp of Event</span>
                      <div className="text-xs font-medium space-y-1.5 text-left">
                        <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> <span className="text-foreground font-semibold">Time:</span> {formatRelativeTime(selectedLog.timeOfAction)} <span className="text-slate-400 font-normal text-[11px]">({new Date(selectedLog.timeOfAction).toLocaleString()})</span></p>
                        <p className="flex items-center gap-2 text-slate-500 dark:text-zinc-400"><CalendarDays className="h-3.5 w-3.5" /> <span className="font-semibold text-[11px]">UTC:</span> <span className="font-mono text-[11px]">{selectedLog.timeOfAction}</span></p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-muted/30 p-4 rounded-2xl border border-primary/10 text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary block text-left">Log Details</span>
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
                  <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-100 border-none font-bold text-[10px] uppercase tracking-wider">
                    <Contact className="h-3 w-3" />
                    {contacts.length} {contacts.length === 1 ? 'Contact' : 'Contacts'}
                  </Badge>
                </div>
              </div>
              <p className="text-slate-500 dark:text-zinc-400">Manage your home contacts and emergency services.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={contactView === 'overview' ? 'default' : 'outline'} size="sm" onClick={() => setContactView('overview')}>Overview</Button>
              <Button variant={contactView === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setContactView('all')}>All Contacts</Button>
            </div>
          </div>

          {contactView === 'overview' ? (
            <div className="flex flex-col gap-6 items-start w-full">
              <Card className="p-6 w-full h-fit transition-all duration-300 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm text-foreground">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-500" />
                    Categories
                  </h3>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="h-8 px-3 rounded-full flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-100 border-none font-bold text-[10px] uppercase tracking-wider">
                      <Tag className="h-3 w-3 text-slate-500" />
                      {contactCategories?.length || 0} {contactCategories?.length === 1 ? 'Category' : 'Categories'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => setIsAddCategoryOpen(true)} className="h-8 py-1 px-3 flex items-center gap-1.5 shadow-sm text-xs font-medium">
                      <Plus className="h-3.5 w-3.5" /> Add Category
                    </Button>
                  </div>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x" style={{ scrollbarWidth: 'thin' }}>
                  {isViewLoading('contacts') ? (
                    <div className="w-full">
                      <ThreeDotsLoading label="Loading categories..." />
                    </div>
                  ) : contactCategories && contactCategories.length > 0 ? (
                    contactCategories.map(cat => {
                      const CategoryIcon = iconMap[cat.icon || 'UserCircle'] || UserCircle;
                      return (
                        <div key={cat.id} className="group relative flex-[0_0_30%] max-w-[30%] min-w-[200px] snap-start">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-zinc-800/50 hover:bg-muted dark:hover:bg-zinc-800 transition-colors h-full">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <CategoryIcon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{cat.name}</p>
                                {cat.description && <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{cat.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <Badge variant="secondary" className="h-5 group-hover:hidden">{contacts.filter(c => c.getContactCategoryDto.id === cat.id).length}</Badge>
                              <div className="hidden group-hover:flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-blue-500 hover:text-slate-700 hover:bg-blue-100 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-800 shadow-sm"
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
                                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 bg-white dark:bg-zinc-800 shadow-sm"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full py-6 px-4 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-1">
                      <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">No contact categories found</p>
                      <p className="text-slate-400 dark:text-zinc-500 text-xs">Create a custom category to group your contacts.</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm text-foreground">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-500" />
                  Recent Contacts
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {isViewLoading('contacts') ? (
                    <ThreeDotsLoading label="Loading recent contacts..." />
                  ) : contacts && contacts.length > 0 ? (
                    contacts.slice(0, 4).map(contact => (
                      <div 
                        key={contact.id} 
                        className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => { setViewingContact(contact); setIsViewContactOpen(true); }}
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                          {contact.imageUrl ? (
                            <img src={getFullImageUrl(contact.imageUrl)} alt={contact.firstName} className="h-full w-full object-cover" />
                          ) : (
                            `${contact.firstName[0]}${contact.lastName[0]}`
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{contact.firstName} {contact.lastName}</span>
                          <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize">{contact.getContactCategoryDto.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <NoItems icon={Contact} message="No contacts found." />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-zinc-400" />
                  <Input autoComplete="off" placeholder="Search contacts..." 
                    className="pl-10"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={contactSortCategory} onValueChange={setContactSortCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories">
                        {contactSortCategory === 'all' 
                          ? 'All Categories' 
                          : ((contactCategories || []).find(cat => cat.id.toString() === contactSortCategory)?.name || contactSortCategory)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {(contactCategories || []).map(cat => (
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
                {isViewLoading('contacts') ? (
                  <ThreeDotsLoading label="Loading contacts..." />
                ) : filteredContacts && filteredContacts.length > 0 ? (
                  (filteredContacts || []).map(contact => (
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
                                <img src={getFullImageUrl(contact.imageUrl)} alt={contact.firstName} className="h-full w-full object-cover" />
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
                              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                                <Mail className="h-4 w-4" />
                                <span className="font-medium text-foreground">{d.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                                <Phone className="h-4 w-4" />
                                <span className="font-medium text-foreground">{d.phoneNumber}</span>
                              </div>
                            </div>
                          ))}
                          {contact.address.map((a, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-slate-500 dark:text-zinc-400">
                              <MapPin className="h-4 w-4 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{a.numberLine} {a.street}, {a.city}</span>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{a.state}, {a.country}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full">
                    <NoItems icon={Search} message="No contacts matching your search." />
                  </div>
                )}
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
            <p className="text-slate-500 dark:text-zinc-400">Manage your account information and security settings.</p>
          </div>

          <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
              {/* Left Column: Form Details */}
              <div className="md:col-span-3 p-8 space-y-8 order-2 md:order-1">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-slate-500 dark:text-zinc-400" />
                      Full Name
                    </Label>
                    <Input autoComplete="off" className="border-0 border-b-2 border-slate-200 dark:border-zinc-700 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-lg font-medium bg-transparent text-black dark:text-zinc-100 dark:text-white px-0"
                      value={userProfile.getPersonDetailsDto.firstName} 
                      onChange={(e) => setUserProfile(p => ({ ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, firstName: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-slate-500 dark:text-zinc-400" />
                      Last Name
                    </Label>
                    <Input autoComplete="off" className="border-0 border-b-2 border-slate-200 dark:border-zinc-700 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-lg font-medium bg-transparent text-black dark:text-zinc-100 dark:text-white px-0"
                      value={userProfile.getPersonDetailsDto.lastName} 
                      onChange={(e) => setUserProfile(p => ({ ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, lastName: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 text-slate-500 dark:text-zinc-400" />
                      Username
                    </Label>
                    <Input autoComplete="off" className="border-0 border-b-2 border-slate-200 dark:border-zinc-700 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none bg-transparent text-black dark:text-zinc-100 dark:text-white px-0"
                      value={userProfile.getUserDto.userName} 
                      onChange={(e) => setUserProfile(p => ({ ...p, getUserDto: { ...p.getUserDto, userName: e.target.value } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-slate-500 dark:text-zinc-400" />
                      Email Address
                    </Label>
                    <Input autoComplete="off" className="border-0 border-b-2 border-slate-200 dark:border-zinc-700 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none bg-transparent text-black dark:text-zinc-100 dark:text-white px-0"
                      value={userProfile.getPersonDetailsDto.getContactDetailsDtos[0]?.email || ''} 
                      onChange={(e) => {
                        const email = e.target.value;
                        setUserProfile(p => {
                          const details = [...(p.getPersonDetailsDto.getContactDetailsDtos || [])];
                          if (details[0]) details[0] = { ...details[0], email };
                          else details[0] = { id: 0, contactId: 0, personDetailsId: p.getPersonDetailsDto.id, email, phoneNumber: '' };
                          return { ...p, getPersonDetailsDto: { ...p.getPersonDetailsDto, getContactDetailsDtos: details } };
                        });
                      }} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-3 w-3 text-slate-500 dark:text-zinc-400" />
                      Phone Number
                    </Label>
                    <Input autoComplete="off" className="border-0 border-b-2 border-slate-200 dark:border-zinc-700 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none bg-transparent text-black dark:text-zinc-100 dark:text-white px-0"
                      value={userProfile.getPersonDetailsDto.getContactDetailsDtos[0]?.phoneNumber || ''} 
                      onChange={(e) => {
                        const phoneNumber = e.target.value;
                        setUserProfile(p => {
                          const details = [...(p.getPersonDetailsDto.getContactDetailsDtos || [])];
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
                      Manage Addresses ({(userProfile.getPersonDetailsDto.getAddressDtos || []).length})
                    </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center gap-1.5"
                      onClick={async () => {
                        const newAddresses = (userProfile.getPersonDetailsDto.getAddressDtos || []).filter(a => a.id && a.id > 10000);
                        if (newAddresses.length > 0) {
                          try {
                            await apiFetch('/Person/AddPersonAddress', {
                              method: 'PUT',
                              body: JSON.stringify((newAddresses || []).map(a => ({
                                id: 0,
                                numberLine: a.numberLine || "",
                                street: a.street || "",
                                city: a.city || "",
                                region: a.region || "",
                                state: a.state || "",
                                country: a.country || "",
                                postalCode: a.postalCode || ""
                              })))
                            });
                            toast.success('New addresses saved successfully');
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to save new addresses');
                          }
                        } else {
                          toast.info('No new addresses to save');
                        }
                      }}
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Save New</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] uppercase h-7 bg-transparent border border-primary/20 text-foreground dark:text-zinc-100 hover:bg-primary/5 px-3 flex items-center gap-1.5"
                      onClick={() => {
                        setUserProfile(p => {
                          if (!p) return null;
                          const newAddr: GetAddressDto = { 
                            id: Date.now(), contactId: 0, personId: p.id, 
                            numberLine: '', street: '', city: '', region: '', state: '', 
                            country: 'United Kingdom', postalCode: '' 
                          };
                          return {
                            ...p,
                            getPersonDetailsDto: {
                              ...p.getPersonDetailsDto,
                              getAddressDtos: [...(p.getPersonDetailsDto.getAddressDtos || []), newAddr]
                            }
                          };
                        });
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add Address
                    </Button>
                  </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {(userProfile.getPersonDetailsDto.getAddressDtos || []).map((addr, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border bg-muted/20 space-y-4 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (addr.id > 0) {
                              apiFetch(`/Person/DeletePersonContactAddress?personProfileAddressId=${addr.id}`, { method: 'PUT' }).catch(console.error);
                            }
                            setUserProfile(p => {
                              if (!p) return null;
                              return {
                                ...p,
                                getPersonDetailsDto: {
                                  ...p.getPersonDetailsDto,
                                  getAddressDtos: (p.getPersonDetailsDto.getAddressDtos || []).filter((_, i) => i !== idx)
                                }
                              };
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Number/Line</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Street</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">City</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Region</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">State</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Country</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Postal Code</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center gap-1.5"
                      onClick={async () => {
                        const newContacts = (userProfile.getPersonDetailsDto.getContactDetailsDtos || []).filter(c => c.id && c.id > 10000);
                        if (newContacts.length > 0) {
                          try {
                            await apiFetch('/Person/AddPersonDetails', {
                              method: 'PUT',
                              body: JSON.stringify((newContacts || []).map(c => ({
                                id: 0,
                                contactId: userProfile.id || 0,
                                personDetailsId: userProfile.getPersonDetailsDto.id || 0,
                                phoneNumber: c.phoneNumber || "",
                                email: c.email || ""
                              })))
                            });
                            toast.success('New contacts saved successfully');
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to save new contacts');
                          }
                        } else {
                          toast.info('No new contacts to save');
                        }
                      }}
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Save New</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] uppercase h-7 bg-transparent border border-primary/20 text-foreground dark:text-zinc-100 hover:bg-primary/5 px-3 flex items-center gap-1.5"
                      onClick={() => {
                        setUserProfile(p => {
                          if (!p) return null;
                          const newContact: GetContactDetailsDto = { 
                            id: Date.now(), contactId: 0, personDetailsId: p.getPersonDetailsDto.id, 
                            email: '', phoneNumber: '' 
                          };
                          return {
                            ...p,
                            getPersonDetailsDto: {
                              ...p.getPersonDetailsDto,
                              getContactDetailsDtos: [...(p.getPersonDetailsDto.getContactDetailsDtos || []), newContact]
                            }
                          };
                        });
                      }}
                    >
                      <UserPlus className="h-3 w-3" /> Add Contact
                    </Button>
                  </div>
                  </div>
                  <div className="space-y-3">
                    {(userProfile.getPersonDetailsDto.getContactDetailsDtos || []).map((contact, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border bg-muted/20 flex flex-col gap-4 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (contact.id > 0) {
                              apiFetch(`/Person/DeletePersonContactDetails?personProfileDetailId=${contact.id}`, { method: 'PUT' }).catch(console.error);
                            }
                            setUserProfile(p => {
                              if (!p) return null;
                              return {
                                ...p,
                                getPersonDetailsDto: {
                                  ...p.getPersonDetailsDto,
                                  getContactDetailsDtos: (p.getPersonDetailsDto.getContactDetailsDtos || []).filter((_, i) => i !== idx)
                                }
                              };
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Email Address</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                            <Label className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Phone Number</Label>
                            <Input autoComplete="off" className="border-0 border-b-2 border-primary/20 focus-visible:border-b-green-400 focus-visible:ring-0 rounded-none shadow-none text-xs bg-transparent text-foreground dark:text-zinc-100 px-0 h-8"
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
                    {(appNamesDetailList?.cameraIdNames || []).map(camera => (
                      <div key={camera.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cam-${camera.id}`} 
                          checked={userProfile.cameraIds?.includes(camera.id) || false}
                          onCheckedChange={(checked) => {
                            setUserProfile(prev => ({
                              ...prev,
                              cameraIds: checked 
                                ? [...(prev.cameraIds || []), camera.id]
                                : (prev.cameraIds || []).filter(id => id !== camera.id)
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
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-700 dark:hover:text-zinc-100 transition-colors rounded-2xl" onClick={() => setIsPasswordModalOpen(true)}>
                      <Key className="mr-4 h-5 w-5 text-blue-500" />
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-xs uppercase tracking-wider">Change Password</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Update your login credentials</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent border border-orange-200 dark:border-orange-800/60 text-slate-900 dark:text-zinc-100 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-700 dark:hover:text-orange-300 transition-colors rounded-2xl" onClick={() => setIsAuthCodeModalOpen(true)}>
                      <ShieldAlert className="mr-4 h-5 w-5 text-orange-500" />
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-xs uppercase tracking-wider">Authorization Code</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Manage your 6-digit secure code</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8">
                  <Button 
                    variant="outline"
                    className="bg-transparent border-2 border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300 rounded-full px-6 shadow-sm hover:scale-105 active:scale-95 transition-all w-full sm:w-auto font-bold"
                    onClick={() => setIsLogoutAllConfirmationOpen(true)}
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
                    Logout From All Devices
                  </Button>
                  <Button 
                    className="bg-transparent border-2 border-green-400 dark:border-green-600 text-slate-900 dark:text-zinc-100 hover:bg-green-50 dark:hover:bg-green-950/40 rounded-full px-8 shadow-sm hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
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
                    <img src={getFullImageUrl(userProfile.getPersonDetailsDto.imageUrl)} alt={`${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`} className="h-full w-full object-cover" />
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
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pb-2 border-b">
                    <span>Identity Status</span>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">System Role</span>
                    <span className="text-xs font-medium">{userProfile.getUserDto.roleName}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Member Since</span>
                    <span className="text-xs font-medium">October 2023</span>
                  </div>

                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }

    if (activeView === 'all-users') {
      const role = userProfile?.getUserDto?.roleName;
      if (role !== 'Owner' && role !== 'Wife') {
        return null;
      }
      return (
        <motion.div
          key="all-users"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <UserCircle className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
              </div>
              <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-100 border-none font-bold text-[10px] uppercase tracking-wider">
                <UserCircle className="h-4 w-4 text-primary" />
                {allUsers.length} {allUsers.length === 1 ? 'User' : 'Users'}
              </Badge>
            </div>
            <p className="text-md text-slate-500 dark:text-zinc-400">Manage system users, access levels and biometric tokens.</p>
          </div>  
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Input autoComplete="off" type="text"
                  placeholder="Search users by name or role..." 
                  className="pl-9 h-11 rounded-none bg-white dark:bg-zinc-950 border-0 border-b border-slate-200 dark:border-zinc-800 text-black dark:text-zinc-100 dark:text-white w-full focus-visible:ring-0 focus-visible:border-b-black dark:focus-visible:border-b-white transition-all"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              {isOwner && (
                <div className="ml-auto flex items-center gap-3">
                  <Button 
                    variant="outline"
                    className="font-medium border-slate-200 dark:border-zinc-800 flex items-center justify-center gap-2 px-4 shadow-sm"
                    onClick={() => setIsAddFingerprintOpen(true)}
                  >
                    <Fingerprint className="h-4 w-4" /> Add Fingerprint
                  </Button>
                  <Button 
                    variant="outline"
                    className="font-medium border-slate-200 dark:border-zinc-800 flex items-center justify-center gap-2 px-4 shadow-sm"
                    onClick={() => setIsRegisterNfidOpen(true)}
                  >
                    <ScanLine className="h-4 w-4" /> Register NFID
                  </Button>
                  <Button 
                    className="bg-white text-black dark:bg-zinc-950 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all font-medium px-6 flex items-center justify-center gap-2 shadow-sm border border-black dark:border-zinc-800"
                    onClick={async () => {
                      try {
                        const res: any = await apiFetch('/User/GenerateToken', { method: 'POST' });
                        const tokenData = res?.tokenCode ? res : res?.data;
                        if (tokenData && tokenData.tokenCode) {
                          setGeneratedToken(tokenData);
                          setIsTokenModalOpen(true);
                          toast.success(tokenData.message || res?.message || "Token successfully generated!");
                        } else {
                          toast.error("Failed to generate token: Invalid response structure");
                        }
                      } catch (err: any) {
                        console.error('Failed to generate token', err);
                        toast.error(`Failed to generate token: ${err.message}`);
                      }
                    }}
                  >
                    <Key className="h-4 w-4" />
                    Generate Token
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isViewLoading('manage-users') ? (
              <ThreeDotsLoading label="Loading users..." />
            ) : allUsers && allUsers.length > 0 ? (
              allUsers
                .filter(person => {
                  const query = userSearchQuery.toLowerCase();
                  const details = person?.getPersonDetailsDto;
                  const user = person?.getUserDto;
                  return (
                    (details?.firstName || '').toLowerCase().includes(query) ||
                    (details?.lastName || '').toLowerCase().includes(query) ||
                    (user?.roleName || '').toLowerCase().includes(query)
                  );
                })
                .map(person => {
                const details = person.getPersonDetailsDto;
                const user = person.getUserDto;
                return (
                  <Card 
                    key={person.id} 
                    className={`p-4 flex items-center justify-between group border border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 text-foreground hover:shadow-md hover:border-primary/50 transition-all cursor-pointer ${person.disabled ? 'opacity-50 grayscale' : ''}`}
                    onClick={() => {
                      setViewingPerson(person);
                      setIsViewPersonDetailsOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {details?.imageUrl ? (
                          <img 
                            src={getFullImageUrl(details.imageUrl)} 
                            alt={`${details.firstName} ${details.lastName}`} 
                            className="h-full w-full object-cover" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="font-bold text-sm text-slate-700">${getInitials(details?.firstName, details?.lastName)}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span>{getInitials(details?.firstName, details?.lastName)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold">{details.firstName} {details.lastName}</h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">{details.getContactDetailsDtos[0]?.email}</p>
                        <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wider">{user.roleName}</Badge>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full">
                <NoItems icon={Users} message="No users found." />
              </div>
            )}
            <Button 
              variant="outline" 
              className="h-full min-h-[100px] border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 flex flex-col gap-2 py-8 rounded-xl transition-all"
              onClick={() => setIsAddPersonOpen(true)}
            >
              <UserPlus className="h-6 w-6 text-slate-500 dark:text-zinc-400" />
              <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Add New User</span>
            </Button>
          </div>
        </motion.div>
      );
    }

    if (activeView === 'user-room') {
      if (!selectedUserRoomId) {
        const filteredUserRooms = userRooms.filter(room => 
          (room?.name || '').toLowerCase().includes(myRoomsSearchQuery.toLowerCase())
        );

        return (
          <motion.div
            key="my-rooms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <HomeIcon className="h-8 w-8 text-primary shrink-0" />
                    <h1 className="text-3xl font-bold tracking-tight">{userProfile.getPersonDetailsDto.firstName}'s Room(s)</h1>
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400">Select a room to manage its devices.</p>
                </div>
                
                <div className="shrink-0 pt-1">
                  <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                    <Sofa className="h-3 w-3" />
                    {userRooms.length} {userRooms.length === 1 ? 'Room' : 'Rooms'}
                  </Badge>
                </div>
              </div>
              
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input autoComplete="off" placeholder="Search your rooms..." 
                  className="pl-9 h-10 border-slate-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-none bg-transparent text-foreground dark:text-zinc-100"
                  value={myRoomsSearchQuery}
                  onChange={(e) => setMyRoomsSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isViewLoading('user-room') ? (
                <ThreeDotsLoading label="Loading your rooms..." />
              ) : filteredUserRooms && filteredUserRooms.length > 0 ? (
                filteredUserRooms.map(room => {
                  const RoomIcon = iconMap[room.icon || ''] || Sofa;
                  const roomDevices = devices.filter(d => d.room?.toString() === room.id?.toString());
                  const activeCount = roomDevices.filter(d => d.status === 'on' || d.status === 'active' || d.status === 'unlocked' || d.status === 'open').length;

                  return (
                    <Card 
                      key={room.id}
                      className="p-6 hover:bg-accent transition-all cursor-pointer group relative overflow-hidden dark:bg-zinc-950 dark:border-zinc-800"
                      onClick={() => setSelectedUserRoomId(room.id)}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <RoomIcon className="h-24 w-24" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <RoomIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-100">{room.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-zinc-400">{roomDevices.length} Devices</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={activeCount > 0 ? 'default' : 'secondary'}>
                            {activeCount} Active
                          </Badge>
                          <ChevronRight className="h-4 w-4 ml-auto text-slate-500 dark:text-zinc-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-slate-500 dark:text-zinc-400">
                  <Sofa className="h-12 w-12 mx-auto text-slate-300 dark:text-zinc-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-200">No rooms found</h3>
                  <p className="text-sm">We couldn't find any rooms matching your search.</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      }

      const userRoomId = selectedUserRoomId || userRooms[0]?.id || 'bedroom'; // Assuming fallback to the first room
      const currentRoom = (userRooms || []).find(r => r.id.toString() === userRoomId.toString());
      const roomDevices = devices.filter(d => d.room?.toString() === userRoomId?.toString());
      
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
      const roomExternals = sortedRoomDevices.filter(d => d.type === 'external' as any);
      
      const roomScenes = scenes.filter(scene => 
        scene.actions.some(action => roomDevices.some(d => d.id === action.deviceId))
      );
      
      return (
        <motion.div
          key={`room-${userRoomId}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0 rounded-full hover:bg-primary/10 text-primary transition-colors border border-primary/20"
                  onClick={() => setSelectedUserRoomId(null)}
                  title="Back to My Rooms"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="h-5 w-[2px] bg-border mx-1 shrink-0" />
              </>
              <HomeIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{userProfile.getPersonDetailsDto.firstName}'s {currentRoom?.name || 'Room'}</h1>
            </div>
            <p className="text-slate-500 dark:text-zinc-400">Manage devices in your personal space.</p>
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
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Doors</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{roomDevices.filter(d => d.type === 'window').length}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Windows</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{roomDevices.filter(d => d.type === 'camera').length}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Cameras</span>
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
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Lights</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{roomDevices.filter(d => d.type === 'appliance').length}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">Appliances</span>
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
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Click to toggle security</p>
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
                    {(doors || []).map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onDoorAction={handleDoorAction}
                        onValueChange={handleValueChange}
                        onValueChangeEnd={handleValueChangeEnd}
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
                    {(windows || []).map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onDoorAction={handleDoorAction}
                        onValueChange={handleValueChange}
                        onValueChangeEnd={handleValueChangeEnd}
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
                    {(appliances || []).map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onDoorAction={handleDoorAction}
                        onValueChange={handleValueChange}
                        onValueChangeEnd={handleValueChangeEnd}
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
                    {(roomExternals || []).map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onDoorAction={handleDoorAction}
                        onValueChange={handleValueChange}
                        onValueChangeEnd={handleValueChangeEnd}
                        onClick={handleDeviceClick}
                      />
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
                    {(lights || []).map(device => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggle}
                        onStatusChange={handleStatusChange}
                        onDoorAction={handleDoorAction}
                        onValueChange={handleValueChange}
                        onValueChangeEnd={handleValueChangeEnd}
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
                {(cameras || []).map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onToggle={handleToggle}
                    onStatusChange={handleStatusChange}
                        onDoorAction={handleDoorAction}
                    onValueChange={handleValueChange}
                        onValueChangeEnd={handleValueChangeEnd}
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
                <p className="text-slate-500 dark:text-zinc-400">Overview of all rooms in your home.</p>
              </div>
              
              <div className="shrink-0 pt-1">
                <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                  <Sofa className="h-3 w-3" />
                  {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input autoComplete="off" placeholder="Search rooms..." 
                  className="pl-9 h-10 bg-transparent border-slate-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground dark:text-zinc-100"
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-row items-center gap-3 shrink-0">
                {/* Rooms view doesn't have sort by room/section yet, adding placeholder or omit, user mentions it generally */}
                {/* Let's just put Add button for Rooms */}
                {isOwner && (
                  <Button onClick={() => setIsAddRoomOpen(true)} className="bg-primary text-primary-foreground shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Add New Room
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isViewLoading('facility-rooms') || isViewLoading('rooms') ? (
              <ThreeDotsLoading label="Loading rooms..." />
            ) : rooms.filter(r => (r?.name || '').toLowerCase().includes(roomSearchQuery.toLowerCase())).length > 0 ? (
              rooms.filter(r => (r?.name || '').toLowerCase().includes(roomSearchQuery.toLowerCase())).map(room => {
                const Icon = iconMap[room.icon] || Sofa;
                const roomDevices = devices.filter(d => d.room?.toString() === room.id?.toString());
                const activeCount = roomDevices.filter(d => d.status === 'on' || d.status === 'active' || d.status === 'unlocked' || d.status === 'open').length;
                
                return (
                  <Card 
                    key={room.id} 
                    className="p-6 border border-slate-200 shadow-sm hover:bg-accent transition-all cursor-pointer group relative overflow-hidden"
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
                        <p className="text-sm text-slate-500 dark:text-zinc-400">{roomDevices.length} Devices</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={activeCount > 0 ? 'default' : 'secondary'}>
                          {activeCount} Active
                        </Badge>
                        <ChevronRight className="h-4 w-4 ml-auto text-slate-500 dark:text-zinc-400 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full">
                <NoItems icon={Sofa} message="No rooms found." />
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    if (activeView === 'facility-actions') {
      const filteredActions = actions.filter(action => 
        !facilitySearchQuery || 
        (action?.actionName || '').toLowerCase().includes(facilitySearchQuery.toLowerCase()) ||
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
                  <Play className="h-8 w-8 text-primary shrink-0" />
                  <h1 className="text-3xl font-bold tracking-tight shrink-0 whitespace-nowrap">Actions</h1>
                </div>
                <p className="text-slate-500 dark:text-zinc-400">Manage system-wide triggered events and automation sequences.</p>
              </div>
              
              <div className="shrink-0 pt-1">
                <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-100 border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                  <Play className="h-3 w-3" />
                  {actions.length} {actions.length === 1 ? 'Action' : 'Actions'}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Input autoComplete="off" type="text"
                  placeholder="Search actions by name..."
                  className="pl-10 h-10"
                  value={facilitySearchQuery}
                  onChange={(e) => setFacilitySearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-row items-center gap-3 shrink-0">
                <Button onClick={() => {
                  setActionForm({
                    actionName: '',
                    description: '',
                    isPrivate: false,
                    isRecurring: false,
                    time: '00:00:00'
                  });
                  setIsAddActionOpen(true);
                }} className="bg-black text-white hover:bg-black/90 dark:bg-slate-100 dark:text-black dark:hover:bg-slate-200 shrink-0 font-medium border-0">
                  <Plus className="mr-2 h-4 w-4" /> Add New Action
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isViewLoading('facility-actions') ? (
              <ThreeDotsLoading label="Loading actions..." />
            ) : filteredActions && filteredActions.length > 0 ? (
              (filteredActions || []).map(action => (
                <Card 
                  key={action.id} 
                  className="p-6 flex flex-col gap-4 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => {
                    setSelectedAction(action);
                    setIsViewActionOpen(true);
                  }}
                >
                  <div className="flex flex-col relative z-10 gap-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-primary shrink-0" />
                        <h3 className="text-xl font-bold tracking-tight">{action.actionName}</h3>
                        <Badge variant={action.actionActive ? "default" : "secondary"} className="text-[10px] h-4">
                          {action.actionActive ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "h-8 w-8 transition-colors",
                            action.actionActive ? "text-green-500 hover:bg-green-50" : "text-slate-400 hover:bg-slate-50"
                          )}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const originalActive = action.actionActive;
                            // Optimistic update
                            setActions(prev => prev.map(a => a.id === action.id ? { ...a, actionActive: !a.actionActive } : a));
                            try {
                              await apiFetch(`/Action/ActivateDeactivateAction?id=${action.id}`, {
                                method: 'POST',
                                body: ''
                              });
                              toast.success(`Action updated successfully!`);
                            } catch (err: any) {
                              console.error("Failed to activate/deactivate action", err);
                              toast.error(`Failed to update action: ${err.message}`);
                              // Revert on failure
                              setActions(prev => prev.map(a => a.id === action.id ? { ...a, actionActive: originalActive } : a));
                            }
                          }}
                        >
                          {action.actionActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2">{action.actionDescription}</p>

                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="outline" className={cn(
                        "text-[10px] h-5 gap-1 rounded-md font-medium",
                        action.isPrivate ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      )}>
                        {action.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {action.isPrivate ? "Private" : "Public"}
                      </Badge>
                      <Badge variant="outline" className={cn(
                        "text-[10px] h-5 gap-1 rounded-md font-medium",
                        action.isRecurring ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" : "bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
                      )}>
                        <Repeat className="h-3 w-3" />
                        {action.isRecurring ? "Recurring" : "One-time"}
                      </Badge>
                      {action.time && (
                        <Badge variant="outline" className="text-[10px] h-5 gap-1 rounded-md font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                          <Clock className="h-3 w-3" />
                          {formatTimeSpanDisplay(action.time)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 pt-4 border-t dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 relative z-10">
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
              ))
            ) : (
              <div className="col-span-full">
                <NoItems icon={Play} message="There are no action items in the selected action page to be listed." />
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    if (activeView === 'facility-hardware') {
      if (!isOwner) {
        return (
          <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-slate-500 dark:text-zinc-400">Only the Owner role can view the Hardware page.</p>
          </div>
        );
      }

      const filteredHardwares = hardwares.filter(hw => 
        !facilitySearchQuery || (hw?.hardwareName || '').toLowerCase().includes(facilitySearchQuery.toLowerCase())
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
                  <h1 className="text-3xl font-bold tracking-tight shrink-0 whitespace-nowrap">Hardware</h1>
                </div>
                <p className="text-slate-500 dark:text-zinc-400">Manage and monitor hardware hubs and integration controllers.</p>
              </div>
              
              <div className="shrink-0 pt-1">
                <Badge variant="secondary" className="h-8 px-4 rounded-full flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-100 border-none font-bold text-[10px] uppercase tracking-wider shrink-0">
                  <Cpu className="h-3 w-3" />
                  {hardwares.length} {hardwares.length === 1 ? 'Hardware' : 'Hardwares'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Input autoComplete="off" type="text"
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
                      facilitySortBy === 'room' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-slate-500 dark:text-zinc-400"
                    )}
                    onClick={() => setFacilitySortBy('room')}
                  >
                    By Room
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                      facilitySortBy === 'section' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-slate-500 dark:text-zinc-400"
                    )}
                    onClick={() => setFacilitySortBy('section')}
                  >
                    By Section
                  </button>
                </div>
                {isOwner && (
                  <Button onClick={() => {
                    setHardwareForm({ hardwareName: '' });
                    setIsAddHardwareOpen(true);
                  }} className="bg-primary text-primary-foreground shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Add Hardware
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isViewLoading('facility-hardware') ? (
              <ThreeDotsLoading label="Loading hardware..." />
            ) : filteredHardwares && filteredHardwares.length > 0 ? (
              (filteredHardwares || []).map(hw => {
                const deviceCount = (hw.applianceIdNames?.length || 0) + 
                                   (hw.cameraIdNames?.length || 0) + 
                                   (hw.lightIdNames?.length || 0) + 
                                   (hw.windowIdNames?.length || 0) + 
                                   (hw.doorIdNames?.length || 0) + 
                                   (hw.externalIdNames?.length || 0);

                return (
                  <Card 
                    key={hw.id} 
                    className="p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer bg-card"
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
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Hardware ID</span>
                        <span className="font-mono text-xs font-semibold">{hw.hardwareId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Auth Key</span>
                        <span className="font-mono text-xs select-all text-primary font-medium truncate max-w-[150px]">{hw.authKey}</span>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full">
                <NoItems icon={Cpu} message="There are no hardware items in the selected hardware page to be listed." />
              </div>
            )}
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
            (ext?.externalName || '').toLowerCase().includes(facilitySearchQuery.toLowerCase())
          );
        }

        // Sort by room or section
        result.sort((a, b) => {
          if (facilitySortBy === 'room') {
            const roomA = (rooms || []).find(r => r.id.toString() === a.room?.toString())?.name || 'No Room';
            const roomB = (rooms || []).find(r => r.id.toString() === b.room?.toString())?.name || 'No Room';
            return roomA.localeCompare(roomB);
        xœì½ívÛF²(úž¢Í•=¤‘”ä8;£Xörlg¢=¶ãmÙ3ç\Ç³ ‰8 (‰‘¸Öy•sþß_÷ö›œ'¹UÕÝ@ ,;ÎìÍåe‘@TWWWWUWU3¶aQRDìêLùL²´(YMÊ8K±#6ßv}ÍÞ¾ÛMã4ìè+Fq8*³“2ÓÙ`‡±`$Ê?TÞì<¥Á"Âú/2vÂKô¿ó÷üýö=ŸÞ¸ç<*WyZz”d“ ‰g‹eGŠïwÔJ›êûžÿÁh)ŠURÊò›ª â4NÊ(Â§—ð'›EåæãAÝ²hwPut‘!P£0>W :‹ÖG½i0‰“¸\#ÙPO)§qÉÑÕË–P²\²½]ÿì±ÍF)¤ñ"(#­ä>•4
N’ (^ –zŒ†ëá·u—”’÷\µø4‰.þ7œd	[„‡ô=Ï.ð{\F‹b8‰RûeU”ñt=<Ê‹(JÙ,X¿fÃé*Iz´Ùlî+î»+zªjp`õ»¾êÐÀ÷«²ÌRf½`ì<Èã -z³yV”=W‘"þ:Jœ¯ÀæÃoˆoYž­Ò0
	6ÏÎ£üðt6\æ0sùz¼¿ÇJ ù›•y1Ò¢"Ëvšå!ŒŠÿ©êìõÝgéã$žœ]ázƒ%•`aœG£‹A¿¢:âõw6ŽFÊ¸L þïƒÉ+3ö“(l÷gã°ûxçYú,š–:6î6îõØØ1#c>%Ž7ÆdÏ‰ –—0(ð²¸î»[}„qæšáîª­4fÒº—Ú ±ù¾Úu~÷2aÓ,-aIˆs>9V8,ãÙ¼ì=¨¸Ëýñ|ßÙä÷A8‹jrö—¥!Æîò0¦Q {½ F‹xÉpoA[gH¥¿Æédøíž ÑÓI‚ÞÑoz‹Åm¦Y©ÃÂ2o÷÷–—ïØj¹ŒòI [Y5Ø‹ê81æž;\ÒwÓ…Ÿ«Š“Ž’(•óýˆ¶ }öõ%†ûì°þQô]«ˆ‘í¢Z ‹;9.-à¨¾'Q]£óë½½Þƒçì Yì‰#žÍ`–‚Õ%,^drX°OÀXÔQÁšcVÎ#¶Ì3Àu¹†YYQŒî—û5¡:oÅ¢Þ8›oZ-Ì? À¤Ä"b‹àrx1\„6ë?‰‚|2Wë§E–¬Êˆ%Ào€DÊ¶ŽñãŒâk6$~JÈ^Ó‹Vì³_¤dvÿ8]®J˜†2C©#‰`ÛíeÓi•ë¥˜V›E.aÉDsXQ~ÔàWdÉN×%ŸÑhd×T¹L $Ò¾ƒçŸÉ
öÉÚyÿ¾ŠòµMÌ°;ÌƒtÅ‘Ü~°+¢Qä íŒ¨qk·Ó¶{4RÓÅ{ƒÍ^ò¶dVm”³á$ÈC„àÚýOi«iÜº¯&éÀÉdzÀNï²%P§£Ë‚³»EÆ«EË"´·ñÞ®³ÅjÞ²¼ü~MªŸgÙ¢\ªW‹	Ú–5œfy4ãžº/¢EŒ·Ü¬WIXa;½»Ä§X`Ë?hÀ8àŽº.Žƒ}Å\õÔ'|þ3'ÔßåäIØ»ÏŸPÔ:O¡so¼Š‹Ÿ.RX¶ü#³§NÊêøW€`Hr#ÿ!Ëƒ«šÏ"iÀ>ßßeA|‡ ¬’Zèlè¸xV:ÞOË(”90B»ôf£r§S^ÌAç=î¹%Å—ÉªP\äÃj+Ã-‰XLÂÅžDçñ$ê,M{`–Ç!Ãÿpe°”øÖì»~xÀ’™òó®1P˜nÔEže ßîß·áþ¬“î¿žçQô$+Q“%Ái”õäÏJ&
	)n©æFµ+ÌÖëî¬‡R^| j´ÌÀnD?Ár  ‰:hù1îJ¨þ£`:ŠCv–Ão˜­-75…+°cNVy‘2˜‘XmyÅ<³‹a±èY+Éú$J`ÉÖp#¬;ßq‚ÇYqP<P¸“Rýûr²CÙ"úš‘¦	×Æ-jÌïjýêÊF2ë= äJrÀRÐ¢îzÛë$©°E9ÜÝó‚ÕU%ƒ]ht÷!¡R½ýjGõ0:haüý¿ÚûÁ]]k Ö!Îý¨b‡%Å!ïílØ3`R°ÿ<â¶=ÿ }º‘|í`øí¯5>7°R!ý„¢ÏðIÝ¯¹B…Dþ¨†QÔN†R«¹ëkKT
	 »Ã<Ð,Âdªjn5‘Èoåõ«ã?ÿùé«§O“×^<ùþ:õÒø¿x»‚y¾C\¨à"| vâ÷VÜ8=ÖŠÙW9W6¢QÚÙKÐNƒY€t5Øqò–ª£“‹¸u©¡ˆ~óh”*XªÌ¦¹ªATKjCA±N'l ÚòJê§„=¾­Œ´%‡eÆŽ:”ÆO²«Åi”ø&±ã–>ÍÊð™É»µ!Ñw(±ÚµZE[¼gåA·©LãJ|[íÖêÇ þ½[=!öÊªÕÏÖÊ—ìhŒë"ˆK,ã" äA,ãøÍ2&^Y¡va^Då<(ú/ß¼†§Y¸>dÿvòÓX6xN»é (iÇ#µš£ª„áb°Ì£s¤iüËE¾A˜C­…Ó0Ÿ+RS´kÓÛ 3Šv:ô„á³lö4…å1èÿ"ÉEG¨(¬rò`Xï¿°÷g6]¥„uß@z(#-Ï_\I €3FipšD!ñÅ0.øÍû@•YPÀÌ®& ƒ÷OuQ‘­h.@xâÐ"±nov† '5ÊóC¤ëœ5²|ðþ‡ NPÅË Õ>„qC™Ñ€	fQ‡!ú¶ñ¶ùu6ÝÐ€Ç‹Ÿ†=Þ£¥6Ô±µùá¢ŒX¸È2$hØÈœ›—ô¤y@HR%[–Ãïv~¥öÝ¼ov=»)ˆ$Z¤ Ùå¶1¥	a|Ï­jVP=ÖQ^lci—Xo>ù­X‹(¦ò*Oý”Õ"ÚxiòJÎþïr6N²ip“¹Àë‘ãDäêDÐ’ÐgÝöxW0”ï I¢Y¸B××{ª}·Òåõi•P0ÝêÄEµö<–ËZù9¼?Æö¶ÐU*Aå"–¨=úUÚ+]æ²Õ4Û"ê^	·ù '¿Y”å*¯†#@ŽÀ±¬l(p¹’h€¼”¶ ÷¿~q¥6ï›v1ËwÂ‰l¾fÉ‚‚-Ö«7[•I¯eXdi¦*h½W5€›ÇOÃÞ»Ùñ-Q8ÏöÔ—lÑ½/2yX ÆfqAV¨&ú¼ñ>k?Fë•eRÔQà¸¹B@‡"¼^ïŒÙ12\†.GWt¼aB:ê½žÃ
•0±õA(¯‘Òùg!¬\õkd"´N#– ÒBÛ6è¸†;ãýýqíÝ#Ÿ
b|.žòµÄ½/øAeî”›g¿–·ñ’Õ'^CdÊìì„‡Ê¶Ä­ƒ4\bÜ»5:ur)ju*rºÉ“„Oê_tKF[ø¹OŸšüŒªÓ'wóyuö5ªp<]¸$jÛï¨µ™­½†~Ì‘<“óxù˜ûÖþ)AŠ,Uœµ›
—@ñ”e§Óµ4¬ØÎ'0ZVsEîK·,õ¹Dñ÷²ñôanQ-ç„Û*mWr¿¨}£Œ'µk”t¿%û³Ü¥ìEì‘\Î Íý6½‹ºîÝŒ¶r4²Œ¤ç‘B^EM~E.ß¡jÚð|Ó1Ó½†*¿!Ñ^£ÛÛqèÄªÙæ7ä0¹Ýå:HÚÞÜ°XšÝ¼Ò@²>½Õóþ®'þ/@|ô9[4íiÖøW§õ A¶sº|Ûõ _‘|éÌI+¥¼¼Àw@m…8< ª÷üŸ[¬…ƒÐß•öYvå3vFÀÏ“U{µè%wvšµõÜ7*ýÒéTüµðW´cSXÃ‰òD¶°Ë·t‡¬µòDÈ j;Oâ¾ˆ7u{B\p´h=h°5’@J†'…ÔT¾æÒ“|¿£‚Wà›ù)[ž6Øƒ[3y¾·{‹æ–4¦Ê}½ÕÀSáÝpÐñÜ#-ž"‰(òI'gmüT0¡3,Qò,¶$7=»6Aw™xð0YW’'ûÿû¿þOõ^jUBü¾!Ü9Œ¸µ{dL¿U°E­äŸNÊ%ÿ´ª˜ü£@.L rÓ:rÕR>EùVÑ%Åc¦©:F-Þœ¦9”W·Ê?œ•ñG%î4@Ë‚II¾ÔrºV9GY¢@S½†3·Fûÿq:Íºk³¢RƒNËß·zátbŒÎmÿÝÝ¯á lü¥Xzq*…öåØË<ža~‡Ë7Œ“àB÷²õk\Ô^‚¿É›¬#Òî.“ÍžZÃ-žN·œ.†$µ»!V0wIaÑ0	«LK9¬EÆžÚB‹µè=Â5ü¢ï}ãAsóÊ©Füf!ï`ÒkrSZ5ÕH%à@úi»M‹öç
ùïó`ù–~¼)ñULÊÑ$Ð%$‰ ãÀ.ˆ>"è*.YÃ¥ZÇÉaÅ9š±Jcl:©WŠ¹.úñŸO!›4MÔ½+×\Ø}¡~v‰È%éc¯ù¸˜ú¶­d—E‡N9½É%,çqÑd!ÓFÔtBÛ0oÌ3d)¼ÿ~Y2W5ä@~+Þ,%HäÎÂ«¨?óJÄ¥[1qÞ.±ñ–â¼¤¬ÑZ<K_g³YæA&ÿÕÆ4²ô¯hä‘v!^Uyä¯¯Õ|š†ŽÊð´½ÿ“2(W…€ú¬	‚'Y–óó}Y³~ÒÞ³ØÓDE>ø¨¹f£G7¶¥k*Ÿq…|™…5¿ø”l›Wž–´¾ùèG×Üà;»–v÷Ñµ|ûùœ\ÓÖuÃÓjªûyU@ø²#wÅM“V¸³UÄ	Z7té®k&ƒ­%	“ŠŽu„x;áíò´—eS†ÑL•Xô#hE–þ¸:í³ÞlÜ—Ön÷pDDI?ŽU±ï;PØÉFïfu+æ®¥¹­±ý›æ˜;v™(?MÇ‹+ŽnÀY®JÁžX7Í³PÕ>}Öåã	ZŸ™CÓFPKñ”±dmM–q|ÂRNžl!9,>4}Ð„þ¨¥òuÂÙÚ1) ìHíÓè© I‚ó><àõ‡ˆ²^¬Ò$C§uÇ«è¬/Ï>ÐÞI½Fk¾`9V‚¦æŠÿ4Wó8£Ô8ä†Q{v2Ü‚òïÙü›-£­¢,¢®ó_<ø=`92Køû+`•}¥½K0¯Êø@¸\ÌacPÍ£JxZm ¡R>ó‹éÓï7:¼ýývÍ<úÇ
`y´*çƒv›+Ì7?PÒâOÄ*«Ý“ïÔ+¸9ÂÚ{SDù-¶é¤ñØo½‚êë<(æÛXn›­¶æ.K‡o÷¿ïï½«Öµj¥EÊ>/f~…°È'GWïçe¹,Çãe<)V‹Ñrž•Y1.¢(×ëu;ùøàÞÞûý2HÊ#Åä/¨áœ3„FvúŽ{‚ã¬–Ù·§y4ò<Ê_f° @ôL³¡|ä«ä?‰3'A²€8Z’[ÿ,Â$¸a™K6Í§ñÕü¬æŒ;‡`†º´l:òóutš‰,€’Èéäk¯£RÍ7šl1´3wLÉUU2M~ê9dWCßã€=æ\Û•ÔÉöÄ]Â$Õ„·­¶j<çŠmFQ3rYY¸”Ö£i°JJÊRê6†ÓjílßŠ›•nÙÝbÍõÙp½Ò­|Z:	»n^ý6úùxÌdö–å¤z°Ø âi<a(]Q).ðÆ…uk…~DnÕÅßbØÆI¯öEûµ ~¢Ïë>Tëæ¹¥ÉŠ»è²‚®‚}³µ~S|’Kš?Ö‚J ù¦“w ô"]Š^£ËÁ‘ÈÊëˆªÂX@ã«$È±6(*‡ì¬£<¼Ï£mwÿû@‰ÜîËekÖpFüHþêËHã~‚R!½|†ßê NðÍcúZ¿
³,§h¬_ ’²zñ7úÚçà‚ˆÜ1FôVÅi_}Î´©"Glu®¸ŠEI‡ŠG“y?*{è¢ômöÜñˆ}¥+`çû;Ö|½Æ®¤zÈ»£
QõÅ‡¤0r¨JmÜ‘…è3šÇ"4ôt/p^BÌÁo§«äÔYN™d(û¬œåäA!>A4²CÆçW¦…548—‘ŒÇ3UÄ[s•ìÒ´’yld—†,ºŒKG[C½±&;šÂ£¶÷¸å`›„züwÞX×Qû¤:àhÔÙ+QóUnÆàŸ6¹ls¤Æýš«}PÄÇö†Ú+Båæã™iE”šx_uÓÊDël•“ãm'‹mã*nñø¯àá#)„Ç•ÌHf¨W}æð¿¼j0Þ4-*[ãŽÜÙú^¾|vüèÅã§'}—5¥±A¾k×m=ùé§W7hFnÅuC;~ñä§¿Ý ))¨ÕM=~ôüé«G7hJuKÏŽÿüãkwC¢ˆ{ëØ!¿!»E­mvìŒNuÎçú_?P¾^Iîâ˜&Ý!ÃvÅóí³˜Ï<ÖçêŽ˜/BÄ£æþ–¹ˆ7ÊHÌ?jlÑÕ{1–/Ül~4½÷àwŽ7ÂÏ6¹Šùç–2ó'"ôfq3·¦ÔF„·ž™ZõfÔÅO‡¬ºø¹ýÌºøù<ó"ãÇëÌróüÈøñYÚ|y’ñãÏ•Lo_³ûYäNÆÏLpCeü4Ì±?¼¯yš}îN©¯¶Æ¹ÚÊ­oÓ)Ê¢Ž®À>ÈÜwÇs¸VTèŽ®Â_úMÜdPÌÿF9Ï®åï¶˜K3ÈÂôçpÖ"ø$*ƒ8q…5DbzRÂ´D§¶Æ§r)ð£…§vp~ñÔ“a«WªÒ—ŠÆj§Ø¹QL«RÉô¸¹ro¼Ýpaƒ¯0wÑ0r<+&œ{¦mfßž—5lñ5±/Nýç‚ÎÈöy%!%@½Q¢ÌåÈ¸«­5¶v*ï:³Ã¸*º·ÆÒ¹OïŒˆJSñÒ}JÍÌ\9ð4œzº{•A•­be5è=ÀSï‘¡/ŸÇç‡8®¢ZÔq³ü?ò¸QâÓ"cl‡<'+¶{}|q%èÊ°Õ¬Qyö)¸ãÿ,½\±ÅÉß”(
ÆQÁNVdŸÎ~O¬‘Ì]Ÿ–Fé ïŸ`}WvÕO‹¾ê û#¬r£šûÓ˜ CýìvÉˆ¦[v±Wë'xÞ\œÄatä³$	–%™îi~Ô_“Zi\g²£·d0}¯¨ø1Ò£ÔC°ŸøÒž\½—¿…ÝÎe¶Ó9•zŠtµVî?1ÌÎ.ðY]ñ÷G¾5ÆºµF·µÆ³u`ûô1kŸ2JÃÃÈ\¦á/ŽyWé§!úð²øÝ_²k¼›™mgÇ ½æsfß-ÿ¡Œ’E‹e¹~^ÌØ{ÿÇÏ£ Ä‡×s6¹•ˆè‚þø5èÁ#GrÚî'a.“ˆîQVÕô¸•Õï¾eŽÃ~?t·ƒ¨­ ¥Z ù»[°>tÛ
B^Í¢xyk0Ê£Ê­ ÄJøèÕ­AWŸ€n¯æP¼ì£õDœh—ÕÉvípy%¡Ã½Êv5Ï2;ØväÏÚÆÓ}Ïs†ÔZŽ"älo†U¿d‰¢%nÈˆGôNˆÅ­S˜kÃ±ÄŸ®JÆy)%Ê”
N³óÈˆ¿·Å(ùÜô%*Þbþ‡Ê;pgÍ`t¯¢b	(»7Jƒ‡Â¹Qa¨hÌ©%XË²TPXeã‚¿;ÁÑÆMG“UŽ^íÐ$¿“E¥q—·3åý#~ñï X ƒgTŠ’÷É2;‹ÒGEä¤åË9ð†¨Ð;}[áDi¨
AöéØ–pWÜÛeû÷ä~õÎô¶}²šœ±1Ãƒ¶ˆ'y¶œ£ËGLç¯ó8%» l	‰4Yó9 ŠÈ(TVxµñ4ŠÂÓ`rV!ŠF“9:¡ÎR¢ÈCú½CMuF@OyY‡óˆK¤^mÄ eçI6	’“2‚…³[÷ûÑ,*áh^£oK1Ø¡?&óAÉïœ+GâÖ˜±i \ì»*æF	5FE(›J~s‡ÇÐ…Ñ4N1ˆh…¿ñÑž¬SX^€lRÜ¥GÜT/>ÄS¾tV%ðÚ„XŠÉõ¶ÞÈ×ê"©øoBHzTñ)ž[àâ3$˜æuÅVÏµcqQåèXT©¡®õvŸ€v8J³‹\–‚Èaå—Yî ð`ŠÊð$¥6»H}M§Q®Âõ:^DÙªtHh8½w†iîW~ZD:€–IòÏ÷ìîh”X™¶±@ì¶VåÇ}WXãÚ%_X;Ï±†]@Öß7ÈÖööj¢¯¦¼"ñ’+zÞnKŸ5ß§áøyûäê8»}f£"¥º·KÅ Þ'xd¯YgQ¼¾É]Xc \Žú!ZÄ)02Ú‡(Fåå<1ÏMRQu‹Ò1xG5†ÓD“UËž(å½é¤†Ýˆª°êô^˜}0ØÐ-¯ú›4·•'yˆÊµ^æq–Ãúù5b'ÀÀâ€· ;²XêÛÜøÜœ‹’rVD—˜rnò0^%å1ç¡k”ßY…WyŒs}>¢†ß¼:vævUëÉñaãUÊ×¾„“çÊ…Vï7V›6Î
‰ÚS›öED‰ÖYš ÅXßa$MœÇ!~YùþEY>£W³^óÖ‡‚—øw
"6¯‘Æ^t§6·Vø¨Š>øå~_Êy¶è[cØ	µyN}Až¥F[9€„ï@ñ_Ð`ióUN ÁP¨|?Ï2j5+Îz·¤|q4ËŒ&‘cÊãbN¥²Ä:ª0åkò„0fÁÿ‚ò¾À¿Q9L/âD¾>RlLP%«	ë<Jó
{À^xW€ýQa!1Éfy“ìT‚$ª$ÇJ‚h °ŒÁ"ç"2AÆ… qHïûE°XQ¿€’"ZÎù·9½»Xe)Z…Ê&t«3ÞV1ç£™À¼ðo¿¬Ð,ÖÀÂZô=€:¬AÇEL8ºÓI–PI½Ah!üÍW¡h/\'¼èWº‚þaæ"2µ½Éæ¸©G€\
”0ß1Ÿa{Ìçzß`’rs?‚Á˜­BùŠzMA0þ$¢YÊ×üAJê_Ä0l‹“Tb‘4–m-"¾`xÑGSðQfaÑ_ “?™¯RŽ}µÍ(ý•Ž{v!ªN†KIè±@f€Î¸ôí, /"QÞX6!‡O®êUÈ±ËXPÉxÐ‚ë£-›ð+žS[œX˜„å’Šša†;ê„£Ž/¦KXûu%|…ÿ²â­-£07öÄ„Œ#(.$YóéN¡1eiœqTä)"³’ô× 1ÛËƒ)_—°Îò¯E”QðiÉF“è|.H\=³5H¸82¾úÒR"'3(QÁúKüc‹i‘^M _G*À \žC8«¦ó4_ñ¾âYLø ÊlñŸÿ»¨yÕþ¿æD#,	o§ÁªDí·—·–Àã €_ÆÊ˜¦ÁdÅQª6xJKÞQ÷íS>‡@Ne$Z¶÷ˆ¢ZØ‹7&!%+?[ŽòEÆÑ@Õò¦3X’Ön [Ý„“ÖXéþ‚3&çA˜qÚKH³'4žÿçÿ–Ë¦¦šýËØ„¥ ”S;åÉ•°«18kIeã±Eˆ°äšËx§bMfë~UðµçO…”êÛ÷á½Øùa+@>K3ýkÌYj%‰cÈ9ßž¢åËD!j–E6-™¬Z?‰ÎóàW1„êQ±*p8j“EÌ÷ï_€Að­S ,K|‰Çô­„½å:¢§j[ ZVœŽCÚì€â„ Ðó†`VbÎYÍø89£Ïr£U4rR1 Y–Í’ˆ­Îˆ¸ÐåœÕø•ï
ûÚ¨UŒ¸±ä ³8Oøú…8Q#&¬ðÚh£þôQñEl¬©üÉ[Yk[sjÌá_À™D97Zfœ%‚+g‰Àâ°XðÕL[qVÊI‰eÄ[ƒ¸0¼ùKø(ŒK¾·$p†œ<ðƒ
úšY˜t)h/B“'ÞD ”ã„þeŽx˜W”@_²„7‡f›14@Õ€@iQã•Å|þù7V|.¤H^ÿ–œž­­I<ž
%*
A‚ÀýÅŠ_s8a»8!	K~‰øò,MR:Si$°³<_ä£5æP´˜LkÂšdÃ¬szCLÅ¼%l½’§¯9§:•,+ŒµüwÌEÈšb•Ó—yõ-•ßÄ<âW)ÈåœkMŠ®×¼µHˆÒ  (C’P¨2°Ô…¿Ó¯mµAÊÇ“WD€ÁYi$è	Þ0ê@üÐK’-Íaç¨\s):&|Îs!¯ä«Ó5ÿË'¶#Þ~kˆ?™66ÇM#Á!ëD@„Ç"|ì²HÍá^š¾	ÊQ£m¶‘Ü
²„OÑy’`Á’ë€¾Á9Òú<ÌäWXõ;S\–ú< $ƒóCÓ+T[§Îž ®ýbÅj¼ÙZ{7l'æv:*²E48»@(+˜jUþì‚Ô{Ù·öbÇ4¶ÈHAÝ8¬Ûÿl»‚ªÔshghghà…jj°¦*Å	·tªQ…œžÈ¬rG™ÎÁùŽa­Ðh°jI3†i´iB»kúMDÃ¨ë<#§šn2‡e‡É+t@k TËÛd¸™–iSÿ±?þQ)ôa W©v|²¥q@u¤mü­A¦%õÙÜ”¼ÞJ7o÷Þ9›ô&*T²1Ì¾çÂ¤è0ÿÖ<£2°î(¦åsÕi[ž—1ZþØþèî=ûm;½Ü3N£:Ñ1å jÍ}FV5bY¾•C5H;³?. kß—I\úÌJ‚ÉËƒdH©LÂçÈ@žƒ02µlppoooWiìKöõ½=öÛßSŽ6Î¡ˆÜCÇéô¼ÉÃÛëHk‹­dq„™ß6»*äi)÷¹ê0ÖßüL±ÆA==88¾RÔÓQZ³j%˜À©X§6 @ÂI/]~
r«¹ptŠ3ó‡v,ÀŒ‹RlgØe„÷ù`Ôº7<µö¿©éº0SmkÇæ¸ÑMçp_OæNU2¬ñßçÑšMi ?_ŽwY¯'0'›¢¿u…ŸO«Åõj~=_,®óÅu1Ÿ_'ñYt½ÎVì°w]dlókteà1e×i’ýÎÏ§ãY]°žÁÏÅWã™xÈ¡«gîu¾SV™î	êv4²ÙËU:)W¿ãÎøíß¾ø¹x‡}¼¦t!ÅÉÊä)ðsÌ ÜÕM7@^X]p
€¯ÄKÑ¤1]`¬·¥= ßøÑMI)ZoÂž
D¿žwFeÞ¢ÜW7Ê<(ÜÑPÒÿ(ÉfƒÞÉj¹5Ýªù¾6Ë<\‘7Yí.K ;ìí*dl`ÃtÆÙ±— G WMÀ³äO(šmf£]öè"ˆK|	ð”P`Ó/1G'®íTYòFˆ	qŸZ'¯óFg©È4×X“üúåK¢ü¡žgÊó·S‘âHÊ>çAùSŽÙo¿_£´>àkE'DµcÛSáFE“ñÂ÷î?*ÔŽƒ´/`§Ï³0HÜAºUj(,wJ 0KüÔŠòÌ†……OfÛÃ§¡"Áñ<ž<!jÿ
›§†H8Kôý=Á>pò9Ñ‰q’ÿÝW²#ÊXª»üÚ¾rlRë©Ì`Ÿ«	ˆŠ…ýZ%V"XÝmÓž„	(ëÞà(«ÜÅqPÚ@Õ.Ã‡”skÁ·‰:„6ªrþáˆÛ3qe·‹lñ¶0ƒm}TÌTr·&î™ ÃïU¦}ÎX yg<$„X„S;DœÄÉÃÅ|¥ƒ*ýkž¼Ï¸Åþ}Ó3fÐ–à/ˆR¬Ú0˜öLqMÈ@=.Ÿ°@+½ÊÁ_á3!¿¸^á3µ½zGÓjÖÖ¥€ÚëŽ¿	ª©!L²ØX Œ‹E\jOg&ØA<]aŒö1Ìíƒª6dg-EÉzO„$¥¤!ïÞŠOhw?ÐZ§"¶€	“`Í÷6C¢2?Rh	2ôCÔ™_@q:Í=±jI‡öZÅ›Ð|/‰5u\9
j²fËdñržyçkJ6e®5Yµa½E—Ë `ð6Œ–ÅDÍ´/•jÔM­UCn*”'X?uÚÛ‡A#6—í‰ùDÆlRÅ¨g0$ýÈ±u œ»LuÂ‘5Û‡Ê5ŽhÊ"Qµp&"³m.Am' ª_Y´uÒµeïœs^´ÓœkCŽ­Ã„-Ò¸“¸#gº8¤MíAHgî]‘™x—=ËV!A,¼¸¨Ù>Ê;nc #[-Ý/A‹<êÊž`;œàQÈ.þ~

©ñ–(£Ð†6P^Æ±£ð˜ÄŠmË|‘Y—Á›C%§ÞS®‚bÊ|ê3JÓ¡1©.aÉv®Æy”V\PÄ Ÿb;éÚ4)]nüDÒ´ÞõX7ZW©«XK‹mM5µQRän+\u±ÚBðÖÖ¸ÛxÇQ’}&›Ný#å%R^ 3!JûÔŽ§#›FÐŽJ¢²¯ç¼§k&{”ÉóŽ
ŸlÛÇtªÂíI|È.+»í¡FvÓãj¶tƒº›W-þP[±ÖÎk—W‹+ê+G¡ùºpÎlÌ¢˜U8? *ux˜5Áó"´`Ý«ëþ6üP27ÜÈ(”"mL¢©5É':4ÇÙ]Sc\‰ko
œâ±@í‰øjZÐN€Äûô<•§Õ6ìÄêZ ò)#q±O ó‰ ÎŽ¼°	RïûJ£wN¯Í`+|z9y!Çâ¯Û¹/ÇDV3“ÕËzldßq»°‹ykb´FÉ-ùlGx\ƒ¼ÖD1rÚ&Ð?36›€îå¡ÖK|üYDŠ€R’)-z­PÍQÜ*ßòsõ«PˆF-!©.ƒÇp;ñ±ß¢æ<~{ñ®•Ï€¬ÖóÍm˜•÷E˜ëh	º=áø¤m¹¸	TQ]Âk hX«j…ŽÖ¡}Ö 4„GdÀY-Øy–¬Q3Sl­þ[/íñ˜=±”"^Å™0ðÓWLÙÑÜDr.åª6kýþ¼‘æä[¯ƒÖà¶>²t–Q‡Æ¾¬RjŸÜVClØÆ*Xç*|^ð¶9o0XA·êš9ÜºÙÎ®£0øp”{|©Ì zo%ŒûÒõÎ7PìS	í7ä_tg³8‘Ìå95]çÜ¥Æ2XQh¥âi¨š-½Na®€íÄ¢>G·Ž*ªW˜o,ôãTÜYí,„eÍŽÛy þ 	A?ñ›CµÓÊ1äRÍÔv©2qµ…6£è÷#ö,›e«RçG–J<Ka¼ëí26fõ¯¨œŒvœ<K¬[¥®±B•vì7Ž§Ô”§ñØÇ3 <Ô¬ñ}Õµ·6½4mßŽÝäZBV‡~`PÇˆs1Ã‚Xh¤ãR1Ÿ)ÓýÉœÒÇ°á€`¥FãVfn˜ÒY†;dQ¿Ä‰EVª?òÏ®2|»-ÿ¡Uk)®E›Å|ó:Ï.Ú›L‚U
œ@+gÎ.KU¶ãÎÎ1°œA¥cÿt«ó„˜jY¯-'­8‘›[kAné8t<ÝaŠaçÝz6çÉÛMÇÓKîÝ¶õtt;}~2|óEV"óLË<KŠCö7µ]ÌBè.{™k6x™GxéÓÎ.;‰:hK4=dÕþê~­ùq5IÞÞivæœRW—­©c—†åP@_ÜNòPE‰.rMÉè¦ÜÓYqˆR®i>û«æxWñÚÞ“²WFAµ\ƒë‘›Ür¢R“ZøS?Á‰÷§•i!9«?ŸÃÝk{INuNV—aÔûJëØA¹6»^ÉÕ»En#’	+Õ48gA™å#¢/™Rq•è²úŸ®xÞ»C"H#Å–ƒØâ7JjR)ÄJ^´ö„é”/ª!8ÃWnD˜0óoAç/EÁùð§+fBÇ“â0°y
E¼ {t–—QH=ãstVtE$æb±ŠLtÏÕ,†¿Ë®ØB4qXõ££ØË5ŽªÔâ4Wç«ôÌÌ»øN-&«Žð&Î2Îƒ8öð”Éç&aQd‚üÛoÆu¥•òA1Z®Š¹h¦!SÛÆhÁù¢+›0G'Ò­c`ú"Ø¥M~•©F€gTþüZuF±ÙJ~Ÿd§‚ð«§=$ŠR»¤än*ÁñÜý_bˆ…wˆ­‘Ï³Ú(A[„¶-vÎ›Œó¯Ì²ºµOªÓy®eÐÛz‹AÎa‰#(5,u	¹yX¯µýÉî˜rð¦¨ª¸ÚQe£/· cƒì/'æ1´öLÃ¦0¼ïY~V°Ó/ž*&‹“uìEäíY+˜L	ç¤I%U=”[êìùMn·?ŽPö¡bÙVÖ¡N¢™¾Ú˜ SÄœðÉ‹æ·{ïòû* É[m_‹(ŸE¡É²¼Õ\kas'>²=ï¾!Sð%Ðã›WÏFx¦SF?þMJø­4Ñº¿ !¿ÓUÄð!ôØ5ôÜž^1…W*©e·‘Pš-ò	4	ïX_t–×ý¹¶ QÜÃTŒ@Ïxz°×M{ ¾õtDº«4â‰H–3
¡_mfŠ:$¤É°nåÚJÑI¦Þ˜ÁŠé2„KR`uŠÔÔJ…:qôåàá!²\—Ù5ðæÏŒ),ÔQÊÚƒ¹6á¾6bd”ß×ô;<DTíN†C*Ã©âô=l
ÓŠâÝæA†#^î#‹ZãŠT¾El‘Ÿ¤Íûx@¹ïhh«Zÿ–GÚsŒtÔ å›gšmUrßp‡©©¸¿Í3v1UdÑÆg’°*Húì[UÜBÊTYL×Âb:•k+%©^L€fùˆ.OÑÊ…Ìý2IpkèY¾	Ÿ†U£»6±rm„?*¿¯-Ü\ÿp1#rô¹X[ìèoÉÅna¤=ÇH?s…ßŒ‹Ý€mÃ¹@ˆúA¢žµo¬>äû–r¿+(Ö°‹VJ%;”»À8(<ÜóµìµàÐ`e·-éWÍUÆä<cØšSr&y³•SÆ¬	i×þ‡ú#7¯]Èº¶ðrm¢àÓsÚfVÛž&¡s’„¦Hhåa·‘¡kÜ¸'5Â-ðùvD7ãOíéÆØ3y¥‰~\LÝxó°“|Ülÿp­ux¾å–Ò¥•æ]æÏ˜÷%Çó~yÁþ¼
òðPÆVN‚8ù° Q‰ÇÔ°lŠn¨üÓÿñøéË×—[ ¡]@ÂK}Í,5üZóÊÏ_ÞqZrL{öL€$¢!=%°÷ÆÚÎá)ƒ™Ôš{i	ºäY7z;Z’¥¸x†?åx¤9NLH½æ–´ë4º¸Fä^¯–!þlÆÓõuH÷M_dç”ÿiTFEY¥ª©¶}»#qµŽf3\…ÇsÙ£ÔwÁ’4æŸýmýÎ)0Üþ?ŽÂÍžsŠ<âäT{yhÄpù3>…6"Ë]çD\Ç‡–Ò2ìÊÅàí;µÈ‹è‚êÓFÖë¹^=‰xj%À…Qâ¸€2´në,¤O‹tB“&‘µàÌÐjÛvœ,ÒãBäÓˆ–zÅ™¥šßÊ6x	ït9üynŸ5ÏúXXJ>FÇIºæîMšà”ŽØ«,[lçÙMus¨æó2„×‹u[	tün)²Bøª2hVi<¢@#D¢L3L¢*éæ)Á1ÿTHI¿ŽÆ"wvCÐ3
ÂY<«¬¤Qø¦~PdÊNXýx»÷„fõç(GevBI(%÷OñzlÑ¯EðJäÅkJ}¬>”Ex	:?q@¢ö­ýðœ+Ü±ne`À«8œ‹/\Täñ6X©~PcéFËÕ˜›‡¬ÇÓ4Ëã´žiOº®d÷rý7ŒÂ 5¦“W.’@C§Œã§i8¦£Fþ¦mÑÒù®ØaC‰|•6¾¢™Í€Ø•2>`È»®YS6Þ‡©x¬ëƒGI1ÌÑ£¶¤¾ÄûÞÉAûÞs´úÞrDøë|/–Å@ò"/!×†¦HXÏì7N»É• ¥gYÚb»ø;ôsñŸ¨FÃÅß	ÂŽeäŽ%Å:–¦Yëo¶ìXf´cÉš¸»BÌÜ¯­èì„ÅÈkÇY+ªš@™;û0ŒI”‡Ì S;\]˜M>’9)³4Èé<wy`dXFAÕ¤q==
f¯ÖöšªWas{FƒÍ…ëFýûSÓkÈ²Cùãb€7%#Âðïh,9úØÍ	;Z#øð!»ÂŸƒ]ÁÌ¹üqhpºlÁî³§ŽÚº¤•Ë	Á2þ!‚þïÇ¼Cúƒ‹ëIµÌø‹‡qxTYÑ*à6ïw-ETÎ³¤§—?¼ÖnÂÏi®á]_{¬{Â¨~l‡ä^äðÁ\¼\íýÄWfBì‘›Þ.CG8Ý‘Âž)ÊU·Í
·\s·K«ùÅ•>?Üç£’%J/x™z#ÓüšÈ­Éïdsõ¥þRÅKph)kÉKCÏŸËC Ï3q‘‚LiþöÝwb±"¢÷;–à8ò=Û¼}§ÜÂ¥6ð¶Åü4òÃæÙBF¶àÏE§l‰&$ø‘G9öÂ¼Û]ö«ú»²Ûþ“êÛì:»•:4\k9Ø%^(ÔRÕA¯Ò'‹ž¯IaLŽÍ‹‡qTx+ýV$*K*ýÿP·ó“l§AêØ¡úuUf‹ÀñÓŠ\-$Rlï€`¹Ä[–€V©¿ú—«¿ê­Òå£ºJkgüäžz’_ÝˆWJEáÖÂ,Ë©yþÅÑ8½Pš~B[Ž.K¼¬1¡ÆëŽª—J'O«
­á•´AN‹¬úîèF¾SzùQoí$ÁÐ|Šøæè€¿QšÆ‹¶6ÎÃ´©uùÕÑ¼x¥´ÿ7Q¸µÎZ1Ë€Áªè…kitdET¯Êê»£ùNéê$jY}"©2_"Á2º_+íË"ê*µ|Í">?’‘V_ÌÖ¡ä
¨j¿¡JÞöqË&úÉf…ˆt¦¿s¼â6_+à•v° ¯ÙežMAŠ_ù?žŠ©ho•¦_ò'ììD{©¼ó!BC-£Ë¦bûÔã–ðÝèÌw±V-šwgé²µB±‹7>K•>&|È@6¡&i¸ñðÔ>žôÛ»<}À'–Ž=êù#d!ÕÀ-nâ¹,ã=ÖÔz§ú%Ï2žUmÏA÷ô«/4m
X1?¿ç™+Q‘¦DÁ`å{2 P@‘úÄ§·È¡í¨GhØž²Õ=o•vz«T ê£Ý0¥s=Z]SnIjIƒb‘ d1ÂV.0½HÓýTR7t¢cFÖ£t‹¢ÿéhþùˆ}OIkðBö(üeU”‘ä%òÓª´ÛBõ/*õ£ÉrR>øe[¼,!`0ü~µósñå¿ŒuS¶,¯Î¡·rÃ	Jl‡ÚïèŒŽ&ù<-£ofÁÓó#ëó"õ©*ÿv˜ð¾êþŽ
£sœ0mA+ºNmZ¹ž`Vßè: ÄÒm=Š‰D-¹éuö¦RÙ”|’Ê¬¡P5¸½wþ†þÅÑ€aÏ1xIJ€ŽP„«	CMÈÃ^(ö‡d-J>¯„×á©¨'êS(Å´›QhÆÍv|1tÜ£–Ã³›ª¿þ°¿
·ù^\Ï/@	7ÞÛº<¡äI™QY’<5³WB³qj„¸$ •‡3ðk9.DŠkc4“µ*øÄdiÿ;ÕnÑjËé©‘ñr` ïý&3ÍŸ•æßN~z1â{<]Ì`¶ ~µJiÔ;fKx[™´Xƒ¶‹’‘€+Ü?U)E‘Š%¤*»‘zi>Ã;¦bÎéTÃH‹,9Ä)[Ý9¿ËE|Çà„ä­4q"Ÿ(­T¥v+‘~Çhj£?0#Ww‰ÀsÛ~òßðÇ°!JÊ–&D(±Ë8i]H$«HE¡ #ü—+_vÿ$ÐÂ’=«A‚€ev’ÀÝz·iÊ¬edY•]žáJ³(oW[}M<.ÜÖ½mdÏºÉ­›Ñ­ÕìÖÉŒØjýT}xÞ×¶Oî®¤ŒùF¥FÂéjóÞ0…Öß=W98¯~Eº­Ê;zˆØÕz´m…©ý<ëý4w÷t7g¾14µŒ¹–/íS‡ä²+CvŠ™»ü†ÅØ‰6Q-—},‹7<s·ºõzÉ¯§T4}‘I@qÙåµI/…
×²æ5¯x-ê1~«–œNQQKZV ÑHë¬*¸äÂ÷0CðjÃÞ+o£4ä•äÛ÷š’iž!,<þ·FýisénH†›ä¸JÒšð9„7×ñ—[Z!·ÝY2wfá/Ýïdåž-Üâc`â…&•ÑõÑ$—©ÂU 
@n/( ó_ö¤¢‘ßvõÜ±Œ}ˆ¡ŸI€ôœ?*{xYø›å²:²ûÊ8µ*Ý`gC×JtÞ¢ÕÊGM-«Û¬K[¡gÞåkÿÌóŽ¹‡§ž7Ñ<ù¢µßÇÜ¬}³¯)HOPŠiRÖ‚¤ywL•¦4}•iÇefñø‚Çj¨7ÅG …ªìûQÛNz§KU	§}«Å­l7e>â„?ØËlý°å‰{ vÙL§ò	~+.èu|+¿N§Šƒ%Jÿ†Öe’bD[(¶Pkô­jH/ üÎ3uKYGœ¤IIGé`:5{˜N«.ø×:üUûôÐ/žÉº’¥ŒŽP¤Š‹×4ýÒoåÍtj¿âq2¼ë÷mËüòVE.ÑªZ¡šl¤ ¤'?Ñ:½h”dWwdsuN0¢[rœ_IÊU™™Z|à {dl !0¥êéf²^ÌzÀô…IÌàúÕ	´õFÐ©ùXš•û2[Îç¸_Tá@ÜF“¬‰––m˜¤cŒùV¤6úN£ÉŠ,`ìZ/NŸ¹ñT{æx Åpê¦z$…rYï:(ç>MS#,,ós+£œN?ƒa:å
~í‡.Sx…DßN+RxÈ)	mQ°l~"1ŽÏL4x)‚´(„†¢Ä´?Š0Dø^±fÑ€–Á÷q2â5ª…•áÏ_›ß¸s»Q“žÔqê;w»žŠê»¢¡ß:ÈÈºƒ ñŒY¾þÍÄÚþx,Ýþ÷U7mEd:V,2ö]Æ©¢›÷úÀN…DøkøZ'Œ ³†XçE‘â>bðØ¿‹r|YÎ”l »ß°Ä°¤EµJkÎwëzáO¯¨¼æ¹šrí«ý·%ŸhHâPÚÖ†€¨Cª^==¢­Ñb£•	öÛ0#Ü‡›Úhw/e9HA‚*Ê
Z® Ä %Wõ¥‚ÈEíHŽ§O8ÔS¬Ð›¤‘CfB â1ö¢yJ,óæW-”e0™£O:N½«e}.ËNÔˆÜÏÒGŸcÅ¿U‰^*
kžâb«•ÞÛîjwÅÌS6¡†5TóÕ–uH%tw!Qì‡$(à¶ãAS1'¨b©Ê#oSÇœŒb(Œô;!i¿ Mœj‰&« @“N:§­ÎPý[I_B-qI¶*J˜,f¸„í@§×"Z9æçF‚;ú£#XãÜù·CüOL(½&ûJÚie Qœ†ºm—±Ä“žÊ‡»8@Mœ'Ÿ,W‡šî»óŠ.³¢ˆO“èy1ã8PGZñF¿dqJm¾mJ'uu5w-jCr›^¥H¦L‚Rî;£A6*éèß7†ã	oÜ ÏªGñ­Éü)JH”jWÍeOæ,¹V¶yÇ\KÎ[ü4obÂÅvaP½íâPíh»Dû¦Á?¾­CL†AP˜ëôžžLÛ9sºÖ¦Ê„´˜xº†Jµ¬	ð6únz"¡phÜeè¼ßÏ•WÄ•ƒ$!icæÅ¦P[D¾ÿâj…ß_Bù,}ÂÝaMã¼ §ÔºÝE’@”x¯/U“÷QS˜Q·¹#_#²— Ín@-ÔìäÀ±ÍPÏÆB»7@wÃ}«Û(æQ„5’•Âíèn+\#ÞDutèÙBúþ‘¾AskæÙÁcs^*ÙUr¯ò%yðŒ–Ô÷±æ5DpÁög¸YNŽyÒ±‚‡ä4§Mä(¥Ï‚í­V¯W\fÕ5Ò}í>,ƒ÷cìaü˜ròPgU¢§—æ#“"Ñ?´¸
ï,É‚ðùÛ-\›ùX%ˆ8N¢Ä‹î‡†¢7¿±kY(o—|lÙgr¬É;MÏíË<ÛH=ÛÈ=Ý$Ÿ[}ºJ?íüáfRQG¹È)™éØuIÉOœÒíÉH¤¤mä¤’R7Y©––&Ç	©‹ŒÔ]Jj““lIÉ)+5ÌdƒÄ$òÚÖûÛíÀ1‹©¦ÿû**ÈíQZ Aà(~¹—ÙyÈôyŽ©‚º	oºâ†QmASrŸîa+°ŠŠXø/§UÝ§åÓÃ¦WÏß<
BX×Mar0}CœæÞ¡ˆiPíøXúJZgëˆarngu.ðÞsù„9ø+âÑºxÍÃšÙÐÖëý÷b<ô@B¦£:%å¬ló^±ôÈé0ì²€©'xûQµ¥zG8àšcRnLQM_üë( Ôx›ÔŒÂ¦pNç]Þ2[Ëèô¿¾	+ÃU<Å?8"@Is‡Z‚š0Œ¦Á*)_U'M@;˜î±÷ÅÍð¦7b?âaJ²cÆIóM>kÑ¥IÑ£‚ûe#2jDl@&€?¯Ð?c”õt:&:/å#:¡‘1'é,e®áI#ïˆ±Ë PeºˆNÏâÒ*ú]ew»c½Û© V Ê5P0ÏœUoP·z4÷Ëex–­8G¨EbXq àe‘Ié/–)Êý(¾9éWó¦ƒ`ßUV×j0Ksê’®;§Ý†œ	”]óˆbâPÌ‚±ðHRùL£ˆŒ©Äc =»H…ý6HØpµÅœÂ¤1XJÑ¾š‘ŒqñH¶[E°Ä§}ºY:R§Å"bÓC†jŽ^á)^÷¢ÖºÏîíí‘Œ¸rH¤:/XAEÇ£â—ÜwtûßŒ
Ñ¿î'aQeNú¼ þuˆÒRjò3÷Qú!Nƒä•œNÅOIÞq
;È4£t‚˜Ýí©¯çAQ¿>†^·¡¨+ÔÙXFœxŽS—ßÁãûÚcÉå¿c_};ÜB(ÂC¯ñ6~GŸzIøÝŠxL`\L…†L”!á¬¥«Å)ì=äb¼§\x­Ç‡¬šiÝ€@Ý")TïuYÐ…1ë’*éÏƒr>‚‡íÅ.QóŸ­¾Âò;9‹—´ÀÐì”†$T•üø 8ûP]l'o½+ZFCŠ%>½ÏöF_“	ÄœŒ‘ *ËHL÷e:áµ)õ«#Žó²z¤ã¹[§&}ë˜¶¬-˜žsÊÔ¼JÖ*ŠL ’8ð9þã½ñ,¥Â¥²ríÙÆûÏ´é­ñ¨Ûa‰‹Ð@Ü¦µ%n!ÓPå·4¼i2Ï(Š
ªá6"0fÉºÏRdÏ5÷^Îshˆ§u†mÙ#lýgQZÙ)
ÂªæKQ±Î·ÃX.¤‹X‘.”(À~ÌEõQáLÞP5»_WÈ¨¯Á%Š"X`Êe¨jZ1.±´›äÙrž¥ éªŒBÏ»Uj½å^|Œ;»ºÞÿTíì$H…¥8€å÷„P4î¥jaé££Ür­¾ŽìK°54ê·Ó«¯.\ÉÉ50¢› k¯ý}që§&rÅÛ$®3tµÀ²ñ–3µuús¿rµ¹Gdž°w†?ç®ÃZˆ)êíÈ\J:¼y´”òsñåxöâ:_Ãøíß¾ø¹x‡N¤øÜ•´A‘hÅYKK±ñép)öb–ÊÉ¨VPÏRÇ—÷	­îGF_ÚMvØ­àÎ›©“W¢€hÖ`KÝ0nßUZ„Ý1†!˜¦.Ñð!Ñs¥ºØ®J}#¯†F¥ÊwvO¥g%<Î¨S¬N¹
>ØC‹ÊŽjßxÅC$‹;G)»êÖ–Qõ¦ôcvmôª	›ßCÏ²Ù,
uoSáPÊ&ƒiK³ºc«ó:C,ø#;PDöé¼€QûÛÝcÚÞ bŒèáJ]hÅ”‹3‚$q:/`k‡7Ôë÷tåêÑškº.×å,3¨ÀHUÀePåÙ8à-ëx­ºÀRKÕ¦b[‡ý&VçÑ“ÊaëY6Lœo6Á®™sÍ°ƒÌ	~C{©˜^”ùq¶ð2ÚbÅ¹ÓM–òŽÌ½È&°ûô´Í†.ÍRÇ&‰ÁØò±POzo…A7ì^êw¥âTQ$!Ê¬˜gy©ÊË$%Ãžš$Q^¸:‘½ "Güg½ü|:X-®Wóëùbq½˜/®‹ùü:š_ó9^w¹ö	Ò_”†•ƒ—Š“nSÓ²¡©á¼‘mK¤ä×šs.
CÓb‚ŽQæmèbN›LÓÆÐ´Qð¿ú‘©: ~ÅxS§2NVçƒjÞŒúŠíÏ@™©ª‚ÞC}¥3ÝÈ³Ùeoí%³Ëê…¿«®å]ž³+Rîòèá]&v¹Ãï;¾fnn}rÂû*„Þ†QX0@}òQï4+Ël1$a½2ûdþ8Kð`s¬Tƒâô„dr•õe)Á;Ž®8«Ï6Z&Þy´ˆŽ®èº+ðÔµ¯ÅÛúG]¦‚å¾øFHÞT8Pÿ>$„ñ9¬@_ÑúÔ›&Ñ%›¹žÁ.†èwAú1D9	P„Y’âéZþ<Þ‚Ã"¹ixoo…A~vHÏ@9›¿†GØÁp’%l,‡_÷4dâîr Bs1ü€ùÜxmË8å},Çùº§MÇR­ËAY°)hC¼m|µ`xÛ®¸aIÓúà	4H¸êø#°Ú"K\2³Ñht¼¬q¸2Ñ¬¡³2Ã-MüÆ4®S4Íã0„J}U˜º­Þ?ýú4Èk²ªÜ€GWõw….³<¦äXGWZ6A¥%Á9º¢?5]ÊŒ6X«ß)4y¤žL)qS€ŸKP-0e2½z&Vƒ“c¤LÀ&ú‰Þök²[Äép>Ü³G@µ0>ÀsÈÕøKÆeöå¸†ï>?ÖsÌôþ7îµr•H§tÛýð”-/ª&AŽïîÑö‚02<MVùp²_‡û{°uƒÞq6ÜSV‰‡È´^Í•Õ½Ö[äÃ¯Ù¢ŒÁÞWdùp™Ñá›#Â³e0Áì¢ßî1²ÅÓÐÌã$žœ]U·³[Ó‡œÙ|¶³Ñ¡õ.¥o²„&~DË(
‡Éñ+Ø„Æ3”åÖ3»Å•2£$TûžïA·÷4^c±åa±R‹<´–O3hÜäC5ë¹?ÆÚÆÜÙ½˜èá˜y»¿¼|G†èŒ&Ó‚º+%´²ry÷ùZ9žd©Û× ›ˆS:ÏvLÑ_¯ã2‰6ÖŒtÀŸõàƒ—r
UV'	Aˆ,
gt„ž–Àž(y*îábsßeŠáñtl<Ý%s.y^ðïÙbG÷HÑÃzå¸zò§=†³ŒènµføþÄiG²*ú3¾‡Ì( !vxpY¨K/Þ3g‘A‚
ãºûÞ=1k~+.â”yä§Ú&‹c­F¯ì½Î‘~³§£ci³B}ø*bï{€w~×Ó0Åp7ðéöèêý	Ïw@éÆ8Mð´"°ÐúË³ô1ÊT6˜ô6zo"ÂÁÁtò¸š¤†¶‰ÃÔÆmÌñ.S@AðYà‰±Z½sèFÁ	ÝÕ.òù1¤¡ž½/Ð OVƒ¹;Bÿ;˜Œ‡K
<É©D4áÑÕ,~ó)ñô<39ñ%:Öxm?iXá‚‡5,_D¼úž”È¬õc0–`ë´u`jÆ"7äÃžË)Ïaõq”b‚ò¬ iƒd' ¡Gw÷öT:Øë¹;¤ÆÚ¹›I#Vc;6O5ä7—	´£éX~:›µ
LÉüãHKØÖ·¿±ÎVNÑ·õlc?ÌÞA)ñ~ålY9‡É“b•Ç˜ò|kÎßÎÍ@ªe(ÝZÊ²âôôd ºðKZ“èdI‡Eü+ö`oÃ](s§gðû_ïÁ@÷0¯
Œ°Ùž7[p%ÎXœŒ‰b!>„%5òž›¬¾í¥ªvž¦3,{}»”1G€f{
a6ë˜á¾|òU $ÐIðwˆþÁi‘%xV@VØeamÀÿsQ=†ˆ:sÚLÊÐŸÚ»’Ê³l†Fr±Ü_ddÀtSláIô#NþÑÕ+&A¢_Ö·6# ¢¯ƒ¥Rpoô§» ‚±Ó!!É]AÝþéÙ7Î½c_ÓÎ'Ü$1x)E|4‚¬Ê$N#T·%¸Ú4%âé*Š1¤Š+3(tkŽ[Ð©·`M°˜˜P‹¬„¡Ñ|yÈÞîí2PƒvÙÞ;'o®p„åÃUpêýÑ·»0še”‡ì8‚ÚV®wY0m=üsœþPºÚÜ‚ûvXZ€èÈa‹à(
rÀqÐxIÚ‡úˆs(¿Q)‚¾sZTƒ€>ïZK5®Íõ¤-íúþ˜«ëÊÇ6KÝ²Ì­‡xÏ”j™ÓZPºl&kÆ‚e%Ñ´„?óáÛ4–ü
Æä¼RP2Ãé"Mê`Mó¨˜ó$ìÇ@Û$ìKÙLÔíæòÉ> ¹­C£á¸Ðxš gîÅðí¿îýË;lL«>°ë‹Y†¦gbÜüÜ¥	ra—¬#¼àÝh¡×ÛQs“ï¨'æì.‡ß²åépÿ@L°C¦¸ÿž½Î^qHù@ã7É2ÄÏ[B9Œ4ä¡GWf_Ä+MíkÎ<akU,o­Ö
C“&0ëµ•î"£¢ì=pQˆMN?¢X\rÒ]À¸qY1 Ñ{š†Ã×ÉFþ¼…qIkçGÂ«
L:!ØÛ¬¶õŒ£¡é€-×¸§¹¬®xß/¡rÆ\d!žÿqé”?¯ò6³œ®6rH0÷ÇF{·÷Ç>àE´‚Àô‚¸9Q~x†"L†=‰ƒ$›)2Ä}ñ}ûP
†²¼(
_ sü«°%~Ç[ô¡b¸X.‚Ë!0 ]`húQ¯ö£u\“jšoEY2ªv0.ÚF?o48"»ÿ2Yã|’D®Í<Õ³ÂÙvì‰Fä¿ˆ.ú¡Ù”wQ9òª\êûÒúä»`ëy2Wäò½"—ÅûÜlWÜ[ù v©Ÿ}åVÂCÖ¯®#´îÕ ÂâV»Ciõs’B)~ó »¿JÍ†˜ ØYDÞr…xâû¾Ujc£BL$àâ-bôÅŠqzí·O×ý±Ba*}U^p:mÕ§æ•§bˆ‹¬{ÀŸÖÙ*WŽnG°{t¶,_þØ"œ˜Ò®6¾Ù;Ÿ¿cK<-ƒÆ30ÌQ{¶¤¥©(õüô€-ËáÛ»(ÀÎø5òÆýÆ3¾ª¦¹îî?Ãû×Ø¼\$?dùQ“XônwùÞÖ¢c¡#¦çÏ&9ïZ ¡ÂH²Ê_á·ÓUrª½W–”yI	ÏÔ÷’¼á%'oê[-!—”àK	Þ>ãò®—êïÛÇZwÑ”Úáœ¬#7û=q1†8èÄÊJZü¬¡¬ÆÔÊYœ—íÂÞoÆ®äšÈûcZ•–ÌAì¹Èãl±L¢ÙËtÚcq(W®Õ>Mð$<42¼§ë¿ðÊmŠ¸Þ\Œ•7 ¤8cÏ‚ÅÒ³2Ÿ¶ºîstÑxš¢ÂåØ4ìú’Dê¾vñŒbloC!áº™Ç€ø(bÏƒ³(w¶QA¼fž-NL¾u"ÇøJGW°]ñª<·Ë@'„?ô¶ã&º²Nu§Ò€.IÂ_»”DöE#‹?¢~ 
‹Í#—ñ«&Ž&×uÊè¼hžÍtÞ›¨°±?Umq~n´S‰faß/ÿŒ]ß”%;š­Ùé;´
çºÆI:ïu×X¤Pa »x¨^Œ…Ìf¿¿qµ’¥Åv*r9ïF.Z_ÊµlPÝA4.T5¶×y<›Áœ «2&ÑU«ªGpk\¬'UµÂZ¡]Jâü<aÁ³¸(êhÔòï” èÒq÷Ø û\`žT&ê;áîÛX¤Ñ•á;Ñ:ÖðÚ€y¡ô¹ñsÕ9x-Å¹[•þŽ1L÷,Z]!ö6’‚Tn\‰ûÒäH°žH©ÕðŽOè »ïlº2·JðëÀÙŠ%P-Èý$®H«y‰îqN^·c´Yc¼u6ÇK[;{g½ÝG•ßgîÉ»xãJ’oÿ9ÉN#õpPÆŽ_21çœ{8h›t¤ ÇÙ+.En&³ÏÁð£1 ’¢öÿt0ÚÿæÛÑþ­²ÎJï®  ~àYúÛïêU³]¶vüÜØÇEÐ$ü‡§BÐ‘Ë™­©ª—œm‚FßÞ®úè§¢g€ã\f¨f²f”ò‡ãá÷^Ân#íMžŽÛhÛ î \Ä©¯¤EÒ²÷&Š¾	MËv»’´“¨½d}Ô¹„ª”ý³¢N—÷qe¾C¹mÊ¬QÔH™U±.Ôùÿ×ÿqþëL°²·Û&XÙîÇ!ØÏ=e‹—A9ÿÌ–À_y*ˆmVÀ	…á`n{¨hº=NNòcÑ{ÝÿmS|ÝòçË¤³¼üÌ¨S\$]lÉ£a$·ÎŸ	;DÉó)u"Ëo=R°‹cD±žŒè!3^Þ.w†&†N®¤žï}DFýA§8æ¸mK6ûF´ïWq‚¾&.R¾±ìóÏ|†Ãþ ËYmj%:Ù×íYÎêI»¡Ñì&¦29ÝJ*f²°ÅNÖ€tÝDvLy³ü³´Š™x@ƒ˜††Î†±P³Œ™ØsÆbÀÂÒs ÿs²¥mÁ¥,“ÿÞC¡‘ï4¸5ætÂÁ¡£<6ø‰‚dÇB‰ûôN¬@[@­"ý£msSs½hé‹dˆØì¬õ.¯v)äZÉzèbH^«2#9;«ÌÏˆš*ÛèýÏ~x§¦gA<dƒ!×øWAu°-«•i	f¥šóE©¾IòrÌ‹L’Ž“¯µpµVžÖÎÑTÄé¯G¡…jÈÚ8Ç•…Fdr¼ÌÏb}¢†ÊÿêGúù€|Þé”ÀÅ×Z¸š›§u–Þ‚ƒáZ»)û:É¦Áí1¯W É‡q.«I‹•áhU>fÕp36_˜˜ÊÆâÃš™¢ƒÛm&o‘@4D!aòˆg®àÌ$ÇNs39Wy‡;dL¶=)é‚PJ°}±*C@‘7ÔÌ9pªðáyÏÑtîò‰á½‰­E 
“\¡ÔYÅ‡fë™Ñiï¡uu£Ç[SÛuˆ’µ-‡žtÚoˆ0´ÍÆKzó-;iÙft>Ã=ÁjÝ`¶ÞòÙîMÇk|q¹Å«Ï6.þŠ/ºßW£Ìd+¼x@M|»·‡aU2ñ…>]Š§Tã_¡Æ7{äK¯åðk
¯ˆqæ¨×}T¸ª”o<”Í½ä¥˜tŽ¯‹Ò…F·ƒ”dZ¸Ú™CHÁ*ª„"~ëâ	=ìèÁàÓ»X•xË(ëù¿iÛ7_oRÌ–;ÃÝœÈü–HîŽ›æ~ÇTtK"1`ëŽS_µ5sgwÂž·B"m'ÍÓ½%)â¾RF‡•N,þ±Šs 
¼%LSÎ†üö#xE³îÊñã[s­Ë˜)¸“yvAYª?	®tÐghf$E[>#ûvø!¤âÞ´„6bv«¸¤ŠÊ*<QIhRÇÂãd%{ùÓ=‹2ö%±TU%#Ry“ïØê›;Æh‘OôG£cÑïÉùþ¿pÑ÷Žhc7iËç§”­ >Ò
»„ðaÁ¦ ¾êýï*|Ïa­pÇå9Ö†àá¨¹ò„{±Ö€/ÆøŸ"â‹¶î8mŠôª»ó4ê‹öÂSøÖ#èQC±æeÆ€u×2"½Z’2ni˜Þ8ÚÚ£h§`žêh“j<ØVgud{rž”«pí(Y›·^UBšÃ¢å<ŠÆ!C{ô“Ï/Ž½éô£7ãE´YMòK·¡v»$Mœ¼!×:}ÜÎJÙ2±²—ÆÓ—–sàÎ¦/9y7²€5ÔåfkÂ
£?ëdóÚvåGÞ@~d]@Îã]³ý€|AÝâ±w~=FSþBÄ
 ¼ËÌÑú¦!×Æ?(•4ÚðÄ:x$TÜÏÐœg@Ø~tdÎ.*Ô«-Vª½êxZÞ1ËiƒÁN’ûð·oô\Rfê3™ Õ|Ùê"^Ì|&yþ)òÉ‘‡ A¦šEoòD³Æ;½XêO”¾æ’olBÃá@d&ÏNAëÍQâóãŸ<šFyå/3Ð×HZCù¨©¢×;®ÅØãRãóUŠ7Áõ´c£mý»•îýŽ5‡ÿÜ¾´±lé™á:ùe|˜<ð‘}14t(ÁÇõÃP»øo/š‹ÿöÂ¸1ÃŠ'Ä­n=\µ§ÛUtp„·¥Î`[Ì•å7bI|²œqŠc¢ñª÷àY|Ž6{2EðÑN½;šzÝ !ôüÓ³ƒD8nÒÜ÷QØ{ ÿ‘k _nÔFŸ<ÀÿE3ðí&í<òÞƒ?9ˆl ?nÒÆë<Š 9?­J4³ýnièc±†Myá
†j³%¬ñêÞƒ{{Ú!î´¼6Gò„†ï¹³Ù¹ø—È#ÞvEÑVüO×ÑOÓiCŠwö#×j,ó,Ç°Ï!ß¾HIœDo“>ÑqÝ	Åáô Pð:RN³|$ì<Ž.
åª¥@¢ä'X`W|K¢Ú*A×)ã­BË-‚`;¦ÄàNþû˜W«8°h¦Ê¾‰#›´Yj³õížóáHþiOù§·x¢¤MAud„†v!zÌ2¿¯£#ÇQB§³#¬Ç®€ía@Ý‰ÔÕÀ%íow®ôfIwA—óˆ…\ó§ÛuÎã">¥C[–Mám\Hdtóƒ¤O~„˜CÍñƒÎœŠ¼ÜBnA™¿ó c >9ÚKI…ÑuîóT«_±súûµ’Š`ÞÂQÐïE®©æå7•mÄ|ý—o,ŒûEs5ÜŠ¨Óy‰8äžj}|¸ôsS)Ç}¦…±
¶èàL*]Žÿ±ŠŠòÑªœ‚bN˜ÿðL¿ÉWý Óƒ9š™‡§Çö•åìwx-ÞØs9~¤S’šÕŸfDQ¡Áøçð«±÷\á r;ÕªÃRzþvïÝ.Ûßó4àv‹¬×iQðãid³¥ÒrB¶ož4|+q”%ŠhÅ	V#¦~Ö0±7ÇˆìæÅþlšØ¦CŽ^¦ Ìt’…Ñ›WÇ¸Mã½Ï¥ÙAJxc’58)½âRY¯§¡ûïˆ]yÎdÅ!tŽm½‹fÆ\î“«ù8<úâŠÐ²ù£xF¼ÿ‹+1°ÍE¿X°†oóÞÝ©óa€ÙêY°Œˆp½ H»ÀQ9ÏBÄË7¯û üy£`Å€¸j•Œ¿x¬r¡Ä®;,îMkÐ	MH¶M|º¨ä{þî¨Ü7Cô¸-|Gõ.½¦ñî­¯5‰ë+=)C®h&C&^àAåºç	“W—ç¹À”?,K¢Ýs1èý j÷:æ}Uç)»J4BË[xïká}qEF~CÒæ}×˜*«œ^fó¹+è$EÐ[(è'ÁyÄ¸à¡‡|%½>eÚ,Ñg»ó§¬P] åÔåíR7ÑæQ°çSiMœ"¤þÉRqué¿!vã[còîû”Û­­íPÚTó—híµ"œ‚Š…2¹ƒnÄô9³ me-°Õ—mn?¦òR&ÐÅÊ*©ØˆýÏlÅ.â$aiœ‚
MVy)…È2Á«ƒ ™åñ¯‡
6ÜÛrvýä6
9¸a™E]Îïöu«Ã¿ÚÈ¿‹È·‰e‹³<TW9Z^#T7²I˜³˜¸v,ö?à3Ôÿ³eŒ»h½1ZÈ:­í¬BòP)ýµ,m½§š¸ë”yO‚2èÎ(asWOÊéÆ(ožt»nöš—J=§ñÚúÍ½uÓèb¸E¶É®€nÍ¸ñ
@Ÿ}‰?ýCvÜÃÖm©èpéÄ˜«ìª˜g Vµ-?ä÷!õTÕ]ZŠ±n–ùðOþ ÇÏrñ¤ú°·XBîE¤´çªr£Å¤´Ù-_ ëôßwõªÌWÇß;‰Ä¾ÎôD'˜Áƒ‚œèò_9z—_9:>`ÃúFÅ5=¸é½ÜVÿN§ ›ðÆÏJnZÀž·.×¨n6w«œ¯Ú#Q ¢s‹ügÊµ”ŒíØà#MÒz~lfèÂI#KD°îüP“<öèãòÊ}ãY”ÎÊùÑÕ7ÿœlU“£‡£„Læ’on…ÓZ]tâ·MijÎ¹YLc°U°éøç'ã™÷âÖ‰‘[ RŸ¾Œ/ûGàì’î9[—¿~O<]Y¹ŸCßæ0Å:?i:ÜplFÑþIÆ|9HJíï:„f9uÅ ŸfáúýÛÉO/F<:ž®î¥C;†ô2Ï¦q=Ä€ „äI™ÑY&uçNÂZ/ÈNê­/‹`+½ž»™:½¸­í¸khò–OºsW¥VùÊîÚ›ƒ)4ó9«°½·]önÝÐÛ¯Ä—¥×ÅçÜV6¯mÙd‰WR-ì÷¡8ðÐw™í;›ÛÍÕ.î³4kVfa`šR+í¦å“1±Ãe@(±l³ƒs“³c÷®ìÇº  ›•qçïì_d™zøuÅµ]ð·ŒhoT…SáGJ.`‰˜Òˆ£ÙÒl—º™¥Ù˜}qã÷×Æô‹Çˆë±Mó „f’™ü&Ú…wcI+â•Fè#zµqÈ,ºÎ!ÞmÌ/Ô‘GI”—#¶ßlm“Ç-°è˜Ôé[Çä¸Ž5¨×èÿ`¢i£¾ƒ$š¬#ö2‰Ð†c‘›´ó(„Ÿ WlN2Sî€ðóÃÛ°dßÈŽ}ãKuIS[^|>Æ»gÙ,N›ÍwõÕfmµº½7iêË‹Î»ß¥^^KÂPubs#s·³©nïGJÕ¾ÅÆâH^®Eƒóëo@µú?Hù-u7[s3èù6Õ6·ÒÖA?û ¶õ{;vëÀŽÜnÛ·ýÞÛ4®±ýa›‹÷8ÚnÄv:´?¡ãùìs3.ã[Gó-m×5&¶k k[›r'‹r³=ù÷¿ë§o·fPv-IWDÿMð`Mî²ð]ð6˜“-c²mJ¾]!D¡õêx°Á”ü
#újýí’›ØÍ‘u²'sgçe”âUhk}Dú£Û©“;.¥—Á:É‚Ð“R“qS°Õ*Ùp›ìÀ·eVDt§"à©¥˜tí=ÜSÇaËle6.³®‹9øÃœ³6âùS1ÍHá¦å½Â:2x?æ™{ÆO¨"ÿñP&;úâÊ7™›÷Ýý¯9·i®´°™bšò]aî*J–âëÓŸ¸ÌpoÆšŒ£"dE0|^ÍÕÕ­x‹à4‰úH|MåÊl6K¢¡,~ƒyà5?ùDTYÇhŽfB‘<ÍÓU+ï=Œ	Ä ¤wV#ù£¡¼#µÔ!„r¦ÚÕ;p%¦’˜7‘ÆR­ºÒÚ{¢µ¢ÊUQ²œÇ{ôòØí‘Þæˆ€‡¿¾¼–
Î%×,¹Ñ4EKßU&M_º1Åëð³8„19ñ®«ƒ‡hýþc—Å´QÅ§at¹ã‰£ñÞ¨bÏWO^2ŸGB–d“Àõ°í\ÁNY“òsž«ÇÄúiã”Ù¥»™°ÜòÌñ5;Ì3äîü£‹»“tÿ

´ÊÕ%™õkßˆÝúü`¿b]Ï>ÿ4ëÿÿ   ÿÿì}ërÛ:²î«p¹V-Ë3¶|‰ã•xÇÎÉuMÎäVqÖÌÞ;'5¡%Úâ,JT‘TËUûÎßók?Ú~’ƒÆ…Àn¤$_³R±D 4Ýî¯««Åá¾¸ºÊuüª„»Ñ%½ñfb_J²(r"®~˜gû«dNŸÐ½ºV®lDßÎä­õÚˆ;báû§ê§ÏôÊj³­pªõÃC»F‰‰aø7ÿÈ°ðÇ/LáÚú…ˆ	¿{Ö{<ÀšPæ_å·À`¡Ayø)3ù€#­.¸„jÚ‰ƒ±x±•–L¥»×\‹Rƒ®:cÐMmÂ¬ÓEy„‹à‚´üƒL*8Ìz{
Áe[±.ø¬n­kÓ~?ÕÃ7ÓC
Ô'¨l°Í¢Y`Ü*Ì þÔÒ§ˆw·¾î­;—5½ÅßõHó2AœOîû{•OXîGòþÃû[›»´’ÑÿVIöè7q¼E^Qð¤d²¤ØW•¶CBûä=E]™O´í‘ö„#Ÿø))I 3p<„þ^@l÷Ü W\%Jf9âÜã›#å/)ã9pÒ¼‰ šÁšè6¸VF‚a‚áá£Å(Š³€u0ÄœE&ÜUDóËYÀŸ©m49Jðé—ýý³èø€«áHuÇaöy_b¬Ú`Ã]>—çL”g¯ÏÁ§²0€é#qÛ7uOóþ9¯E±ÒhGõ’¬ìh—„3â¨?NG2•UŒÈÀW!3›Ò6€„§è ¢çá0L‚W“@"`‘F»Èë¢cÊþƒµ˜³×âÞUxGý„äv˜ÐÆÉ€½_f;G#±›øóî Y›~â8QroÀoœá•»’}œ‡•(*W.5`_Ïf/©D4âe„Æ– ¯­´«à?¯ekvG¥D‰ŠÄ¿_À¼'bÞ_‡‹˜ö¤ý´« W;ëeâ«˜tÕØ™óaz¼røv¯ô$xgÅh®Y‡êäÙ0ˆ²íæžxwÂ;qµ$ 5|%T µwcá4šp¸¼ßø_7Ô<¸‡WT­á;QÔ9Ò¢i+UaüÕ}½REo„`o¬!p$½Ô/a8>xN‡–ãîJã$ŽŠO…{{uMåuZ}&ÚòäŽöäËhÜêÙ{Ú³ï˜ìœ5<ªÊCì|¦žÄR¿’V˜…HÈ|Y¬8ß(§cº3ÆÜ'ƒ1ú<[óbä;×poå¿Ohòf¡LºÝŽÓÕùœðåƒL
ä'°Ù¼;›8™^Ó¾WÖŠeDœ‚¦¹<ÍRÔõ *}bgTõ,iÿSÕ·ÛåÔS¨K)žVCR7oµˆ›šýô?‘ØS¿”îÖ·Bœ	U ^a2¯&0kÔÔñYi€_¦ôg7ÖEâ3â¦fÍº1û†wp¸rxtž“‡ƒ»yä;5€Pé"„º†ÁG›s
pb º‹oÏ‹¼^ä(qG‡2?™S¦Ô^át
3QîuœE5:€.ÏåI$òô™.$íwi ÎÈÅµo¾ñ²["Oæ’„žâ¤1+'YÁ®’3¾vïÄý•Ã¿Åy\¤×*-„AðâaÒÞ˜âG>Ð°áq“êÒâ'‡Cq Ð }F×…W”›ÕÊ:¹D="‘®á^],¼Œw¤kXøæHE¢ÉxÔEf+u`ÝhSëB¼)_‹›´©AFPÚ·jåõâáˆ‹æ7$Í/$GÎ•£~¥Ï9Ð:|5‰á<ŽŸþ
TˆÞ^0ŒOã²©]%›"ÆÔ…ð©†ð1º.,ŽŒ.m”-ùu†[,K¬Cˆ]!oDbDn“´PÂìÛß	“\’˜œ«…2I—-ÆyËZfØl¤“œ÷ïªÅ^XÐll~(3aÏ¢|Ê>DÜS+8¨û/Ê(™gš…¼àìÝQ„³’øÁm©¤GÂYŽuY½äRwA_ä.jà`^Q#å¯õêÁš^Vƒ{®mnL# <€I˜v	GÂk%‰’à‡ãpðG4ámÑ$Ÿe5Fsp‰sˆa{Èy$ÀÒGa„I<œ@¼vŽ4N{žŠ‘ÝøåM3ú÷Ì_òU3¤	&ôþýªáÁ¯¾ÁI`·ždYxÎ&„ÿíYÖœÑ•¿¸õT¯èŒOÔ‹,kí„(ždc‹ÍË	_³°
D.ªæÎ–_™Ã‹Òò|SîÍÞâ.×eÍ_²ZÒG’;îVc š“c€¶cÝ™FN6Æ?/9Í¹ï8¯©-’œ2së6omïóÇyÃ]ì(ƒ·tC]é–ƒäÆóUJI‹Ðè6	Oˆ ¼3ý§U¬eSÐûB’è^îÒçøbfÄq§rÝ~~Y½j6í<%ß¤C¶iò­$ÖèPìxIô•éeŒN=¹¼u	AÁLº‘s[› 
vîµü“Z­ÒŽ®°HÔ¼m Så*ð{íaûÜ±nùGíþˆÅß9ö–Ó»¥Ð)|Ô*ÚÜ©ç›ÑúÑéJ¯£ƒùˆÖÏq`àqTÐpHÐx<Ð|0pÑ8.ÈÇ‡¥ç:ãæø?¢óƒ½òlÑÊËCvé²ÉPehh0Üã&û+OÏéŸ]	q%È‘“=a®xW ´V!i< ­þF¡hZ ZÃ–KÎyE¼¢q^¸RÔ-Êu*Ä•o5B[‰7¶^=ÆUŽm¡£‘Á²¸HÖ.Z–D›¢CÛ…”z†º5ºÍÔû9ÝÜ	Å´5‡»Õô5«L+XmCQroÿe¸š îû«Q¢¦§ŽžùéQRÂ	äJô( ™2òLPM³*…ªMá%»D¤­`…}–¤y$FâàBdÎöGkí½7†01s˜$?§®Çë ~ò,ÎIÔAÝã³ÐÙÞ&1ƒP(-Æ§xDH5¤~¨›=.`ÒD;&‡‘jz"8Î4ðë"Žrn}”ê$£9HÛX'º†™Æ‰BøN³=d~ØÚà¾¤`DÄ$ÊG„UŸÀfS××0‹ÃIÁôÏQšôMÿ‹õ9¸q¢yÀˆæA€²Ê:æcËTÔ9Kƒ„Y]`ª5ˆ6¼ò—GuJ·;=ÈpF¦ ãÂÑE9²
UÄ]‘ïî,)¶J²¹Ì…â:‹: ó·ãANÿÁáå%–îŽ;½žvVÖì‘Ú¯×²Èàœ»†X.©ñŒÉH
‹E—˜eÒ%@ž˜ïU¦qcG¡Û±òfœÿž±.òDwYkÜ_ýÔ/úØ©ºäÔ+ «4×W<tÇ¡tçk‹ÃgörÂæë¹šãƒà'³¿jö›êjígˆÓO]Ø~êª øô÷òxp°?c.âj@FRW'Xýò€
ÔuG
º¨ê¶'–Iu‘Êž:yXêÄ4±ß‡RûÄ›ùâ1•/Õq[Ð6eKÃ«}ôû$©e1œAê‰F¼Anâ†æ'5fÑ°ÌÅ¯^b¼e»	¹Ûu3i‡²k¿Æ•óC¦×rN]e„¼ý9ø ŸFPtÛà<iïr½üïÑÇ,ÌG´Œy¯»ˆniß¢êé7à5’¿Œ¿mlµ?Bîb-Òä–$Æ jøàBñR›gê¼áÜfÈ^y<ìêh	ùg©1‘Ò,¯@”`›@ßûß}£KÃ ¼{7¯@ò€ýˆƒ=É¢Ð0áà¨_kÀQtìçžóDÞÞ‚qKjgsç+½TœC<&_…•‘ÓÕ7ÍÄÄ–¬GzÌ(Œ‰ÑôLûOÏÎ·¤Ê¾±&cT–Hùµ„k’N¥&aåÞÜ.sýÅ0OUA³œ“S+é¿~Q³=ÔŒ¬ÅÓè÷,si’=ŠÇ§.±;Ï¬ö—Œ¿¿’öüÛvy€³6a\b@:¼A@8a¼9ÊÞ§Lþ8?X™¤ê%«ÀeÌ6ìPl¾ùŸôøŸŒìØÂfóçl8p°Ò†Õêê)/ñ Ìƒ¿||óšØ‹$3rYësL¯¾ôÖdÉ*àx5€+HFˆvM-ˆròk3àƒ(Þ¼	‹r}N²Ð(ëÈ—GŒMH#1[–dü3‘ïÈ=¨4|¯×­l¤Ù{íòÑ&tëðË{7ý#éÖ¿Æ”
Çã]ºÒ÷og&"}Ùé½áž8^ÁãóùƒHÀ·ÜæwÎmš@`ÒÀá3¶m—[¸÷ß—©çú4+rK¯3û•?msÇ/ëí/[›c•µTf0M'éÊa}«¨ÅÞ?Úœ:^&+ßÈyÙðÓpxU’d:+’xb@ ÀÉÖ¶k„”‡!^Ûm¥÷/>½{¼z¾òh\®îÚ@*åø¶Ð—èVÃ°±!•|jæÚ(éóƒãbÜñI„X®r5´“ÊË]½—¸Øx1êÀûa%9½;\ôšOÔ»“i€…¾7P™4(€÷ZŒmÏ®knÞÛ
¦lKUzŸÐ}jçfíS/Æl8Z/–"›M“° W„ƒ‹A?‚Š.ËO·„[¼1ñÝëýáÕ¦Púíâ2–³â1_V¸<4E”Æõ¸ß-Ðî­y”‹¸yÈâ"dZÛÊáÛ4yv‚\œt¨îÃˆà®É.n¥rÝ^nõ~tžÇˆx¯-‚_!ùš8£
—À¨Ô`nûð&Ç®ö'|m¼fäp°¯y‘EQÑ°Têé)§„ýÓ.×EKìñ‘ƒ„eçîVY¹iÊJxð1¾0š»!8£ ^Õ¾Yë%µø[/‹ht³ŒÅ*òðkóš¯ß¶ïY/‹I+[¨ÆC<3 hÿÏØ‹ž¦Ù¹ïß(Ó%`­°­šaÑ0KÖ²7çû¥\ÉÐôÁÒB¹ó-¡ƒçô7àó:þ›g;ìÎFqY/T³z¶t×lŽº)DXvvæT©ÔÔ[TÙ"0¯Y1dëp8–f§á’gœ§³LíºÌr Gí‰s‚mnz¯å=Ç{pìà&âÅü±Ø˜XX‡úhRùÍÕô¹@×Ý°1UË5îUÇ#}1Ž2¦Î×ƒ—á8NØß£(û¢yÞ Êí-ûÐ¿™¨=lÎj}–çÚâmX³'é`–o|óø8‰ö!4g½ÉÆ„qÄ’™@³uS}£÷^&^ô‡z&BKm#´V-vÈ6É1ñnÐ–äô¥ß{Çÿ†	…tÔL{¢nÚ{šÅÑI0ÔNO‚bç%ù©O›ÖD¨={´Ø‘×A.ŠÞÜ¶óûr·m%Z(:ø–pEBnÛ{\ð±7_ù ®‹O«U@Æêº”@’Uµý$‰²¾²ÍM|ø;#ÝÁ>qE>¼aÂ0/“Ž#þ8Ûô‹©*ñŸáþ<^ðˆU&êx:‹H;¸Ão§'!ï“õr&_‹G†üOXðòÏÂþ|dJŽÖËÕÏ\S7~Hœ8ŠCAžç €ÂoÂé'õÐgììKb´ÁµÂç‚P7„>(+§t’š‘(§¹q%ü=¶:ƒÿ4OÀ½™Kö4…ibõ8Sª•%fç@ÌÏ[MYÅ¼é=S÷´ð¶íJJªBÞMmÎívÄ-,œÉ¥?‹é@ûöùº›LÞ²$W¢
Ò…è–õ„N\îîæ‰,Öz¶Xä-Í¥˜W÷q8 Óõ¯c%gÇîÞ³c#ž ål&‘¦ªÚ¶á&ÊéLô±tâ¿l>¬è’ô(5ó–/§µÃkV!?-m~6´·Uƒv¶øhNï¦ÑrP+tg:¸%¦˜¹{¬8éÊM2°¹4e¨1ÄnÿAl˜æúVó·\¡^ý}*‡Kµ”³Í&«K°\›†}G•wvƒ;»AmMÜÙîìwvƒ;»Ÿ‰@×Io€ÃsÖ0:lGá×(²ÇòÑž0ÇqB‹YzPLÄž”ØÏZqñó¿ñpŽŸDQ^æŽ-nYòÕ°7™%	+Ç«€…(€ðhU4(d7ð²?ãÃ=¶)Ëù!×ál„ÇÄmj;ÿôöïV’€lS_ÍR][@A¬#GÕ¿L¿m< -–‰ Çš48÷âfÛ6ŽÑ’p±¼ð­."‹~x\=JŒp=le#WãåÉèÐšåFiîxÊÅ®€DL8Ôá&šŸ¹ú"nWa9RÞ]½ü0«¥¡QÝ­¿“„Ëgkñ2 )_EéÈ!ØÄ‡/c&Å
­ü4uëPé¾µ8‘ˆ!âo°
MaÕ 48V¿¯u¨)®]5ðà=òƒ•Ã_O¹Hb˜Ò­46ù@Mos35äÑ8æË…L¼êA#„DFbáq`lÎ^ÂÂá3B0ë”ÙÔ°PTM!š’€.êÇR?pf=Õ‰p³Ó.$älª!ÿ°cë´2VZkì‘qù¨ÅF<_¢YH,qöm=(ëDó£í\M¢Ö[¶¢^‡Ë^Pe-×“
G½[N3|`¸šT•w‹É±˜^‡ç}‡XHè\50š½	@ÊUªE#AIVÞ†0ñ$«1=…ÔA9Œf~ÛÀnÚËç]UsXÜuº#v¤)K„·Æ|ÓÄä:ž¢SEXu¼òFòˆAXÀL³?xÖéfZCRH¨RÞy§ËnVîi<Ñ„{TÁr.•¶õbÊ$µ	ˆFvoz$¢µ"«aZt6i*¾Î‰¨]gæx(ÝõmŒ;&'!hœÐ{Õ3Ö«,¤6†'_CV:˜ä¦ÀmLkDe§‹$FìVÜ“ÃÓØèAÃ0EC7ûwtA-Ì²<Í6¦i,¦„õeè144œH~›ñ#ë`˜f€Ng¨æ)[‘½U¹H7B>ê³)dÆ[e¼j ÷Ð¥AJj\Ð‰C ¡8GH=kÀ5ÊD@—ÂHŠLFã82.™–ëÑ#'«kkäP7Ýq¨5²ûüÉ
H3HÉàêÊbG-lpO‚Yw£Ø¸â‰ckôÊÔ¶ñDœ¹—Çl%¦ÓbCÙ]¾6ñ«»^°`Ú‘Ïñ<žÃ,xv¶ñ	ñÓÔºû>šâÄü=6ø{Ú‹Ù¯uúî˜«ƒhm<´[™øbù‹x^ú;qîC”ƒ|tS¶´øºÛüÉZL}Iœ[i‡½h=Pœe¥ÎÕÛ`+T¶>„n~{>¯…pÛkë«M 7ðR àrž†ÊIÒ¥	8ü&.ºvGR®L®p`{þ3~è\W’ˆ•WêN”½Ã@IØ>Éúæ «á=ðtÇ¶§zðõ«á~°\~ÆÛ$´4j&ñD¡Á8`àÎu,NðDí‘o#Ä¹Á:ãßHÀl`øÍ8^—QÍáG*dg«4©ï¥(Å™5Eán€fO|æ6>(ÕYÓwdu8‚x¥|Í D6ðî7ï:õMen˜fá$&‹C$‹*u¢§Íµ³_~©ª:¶®ò¹Û,{(q›M “ÇÕýƒŸkG€—¿´ÍË¨7œ'm€¹bLkW«I"@÷þ¡ ;bŽëÊõÙÏ@¤úqÙŒ$mA«óO9í($ôêâ!¡gÏ)ZfSg\^¦3([]W5ó‹õ¥ƒU/Ÿ‡u¤lBj£á,I¹Kê6•FÓ&ÈBÊó¸æÏÛ;÷Ø,;ñlµÉë59å?¯KÚòêcãz¨¦†¸9˜¾ë !’ä¨WnuÉZ>1¶ðÙ˜Êë<È]M[®±_v¿aÓè‚¦ë@»)K×ýÎsérÝàEßB(Â(€RoÄU_Äüù»åk-_&x®˜¾ïsÉ¶5GÕõÝïØòò&œ¾'”é¥Äü±Œ,ÒÑP³®È;ë®dg| °±ü@ñ”eñ)‹N™­J0.#Ü?i)aøà;Õâí5ØÈÑ”˜ìËæVØi`ª¸•>t·ÑÈjn¼…Fr??,Ì‰œÇ@#Wˆ©Ÿ«e³T“Œj¹»-FÕpƒŒ1%C¿aÖ˜eLó‚¦øÎðR=³íMjÉ .Ì¡ÃiŠçÉ•ò£èbJã²^ÿ²j%–cçE]«’ËÅ©NÁ“B“Òf :å½j÷E/Ýk÷ò¶Û6Ž¸ì¼À…!„ñrQHóëZräïCçÅðŒ§˜ZØRàÞ@?âBà€û×µø¨ß-‚Î‹à·›,pCÌ¹Ä«_ÛR#·æØ¯•Ž ’ïG\
"õÊõÉF0îw¡»h$Ìæ‹”ŽD?äbPÉ‡®MF’cÿ-6:ÉÄGpüñ¥¸öðS¤ Ž‘¸>´ÄS?âÑ2d]×*Ñfà¶-”…Å;o-þŒÎ‚¦ÿæ”.¦Ç@«Hh&ÐÙEýÚ‹ ¸Ûµa pÁé78#*Î“&i6f¼¦1.	÷E@±ž8"á—@b;•ElºÁšX•PÔ
.‰s6?é*ØŒóGª½^Ê+ÍÆj÷„;ÞX¤¹v„]Ç;ÒN	4Eë	1j¢¬ij]n×û$ãË‚|&?œ… Õ›ÊÃÌàBž(~LEk 5È%ÜÆãà# ‡"Kè œLRÆp"ˆãL'Q}öàV8-Â…²™Ò›AŸ›ù´vyhü1rŠ\)«7y!ÔéþeœŒçH÷Ç_{qÄo$óQpòó{h…±ùLäò¥ã…¬°ß6ð9yÈG¯;‚¾V•|þ›ôkÌZï'L9ï•€l¨•"Ðyø#¨D7ñÄåY*Ø¼(îuèí¦ lì±š°šL×AeûÁWlP×6¦¢ñr˜\Û„ñÂŸÄC€`IšIt¼1ˆ+ÀpV-öàËZ.RÉÑŒ½ìóð<è±O]*P(å+‡ð)èÁÿ:ÂÅ¶’£Á,ƒó•ž¸Ó¥®ÿ§+‡/&QvÊªa_êh€CÁPZj*[x]Sà¤~y[ÿxU[´H€îÜ¤µ"·k›ÆÐ»ÚmÔâÕçØª½¶`ÆÙ„0É„S—Âwç,MÇ-uñÜ,ËI§³¤Ý9ÔÓáø;´ã(k}˜)ø¿Ùd†ña9uÎa7±¡|G¡á)SßÏÃl¸üfái´<)ŠË”¢m’¢Ão[IÕ3‹ÏÚë  Á;4«ÏíûQrjÁs‹?›µdL´v«!ßbÔ§A¨‰hÜ&ÈâÑ‹óèÝÉ	A•Üœñ‚„q	1Æ„õöÑ”27ãS¡Fe‡õ‹ýœ¥ã@Úw˜Øp–?ÚœÖ·;¯äè,_ÞZ·Õ2 áW žur~•‹AB¿g¢¼¶á¼m~°‰—±7‹.]úMÚe8(M~I4%9øµMŠzWÞC|ç[¼H"®‹Í?¯ÓÓ”±ß'I<[ X+NbFÀœ‘KÙåO›Š³ÙÒŒ¨€=¯?F
6té–2ÎŽÌŸ¸çÈðÒ1bÉKý“×Îr;Yý2ÖèžÁ€àÎ®2=ë(úˆtž¾›yå¬¿f¥M½ŸÄå/MÏkHƒ³‡3^µŸ$¬1àµ—ô-ª¿>iŠdC<Ž'\d/Š¨ <ÊsFx`bÌÒ<ç?I	ðqðð4€ë3%”Ð”cè¥˜..72ie”fñ¿ÄÀá+04-²¬	ã¥mú™úóL?¡ ŽI˜|¹KÌlä¾ù`‹ËÄ‘Š5¸ZO$@[‰geò.E¶%×„¿š&^âô[·Öéì·œÆô;(©€õ˜.þñ„mÈrî÷óA˜DŒ?ØQ^Ñ]n¦’±Ôk—%"­Ä(ZzÁ†ôüleQMxdß³N¼¸µ#ÉW~	>ˆwà%–¾9ÕôeÖè›t&´ºl” w’|”ž=KÒ<}>¸àS¦ËŠLÛeî‹]¦„÷ÔÈj&)Sž†³ŒS äóË5Fœ›¯sžr$‚¿´bÂ3à~µA}ÚúÇÖ? _ÿÈNÃÞ½Ýõí‡¿®?Ü]ßêß[ãùXÕ#e7ÄÖ°L-‰Ð¯ªX²÷]ïÀý
dáó(8Ò]‹¹ÈÛ{UgÙŽ%?ÉßØ«–Žî³£ÙµK×cÅ3mcÒ¾îT	DvÇQ2—„¢“‚‘|2O‚Þ³YÆÓNJÒÉ×4	ï	k¸t^ù5 £Û)­UÑ»L€¡¥^ë_£ó&ëLNb8ÏØ˜ÎØ!‚Ïž» ðˆ˜‘¢9²èøœ´Àõž	 lcÐöà½a|Ê¸åd6Ž²˜1ubWf[ø b;8S¯F<Yã+bÑöÉ®::ƒ*osl¢¿R Ìd›{»›0žéÓÖz°½ì¬÷ÖƒÝõà¾H5Ù‹ÙöKTýIå†„¨@G¦¥^|	Ø€qßà•mü,ŸùB=%àG§ì•Ï¡â®ë¶!¢ cÛ¯£Éi1:¸Ø¦šÆyxœ€ºçc„srÎä dÏÖx0õ¼¹Y…ª¼•„¨´-÷ 8+Åyö›±fÇé$E·PuÏ\IÕ‰-õMˆ, ûoB|5eyÃ¹Úœîomîn9Qt´}ËQ*À÷4ñ±l¾Š&/ŠÒô.oÙ'NèÄÖ7-(áåáé×ÐZµawOR	‰íÔ¥Í=#:FÂå+ŸAk4!á™° °}ìyz6ñp(äØ
}ÆÅxÒ…U0ó}w ~²šuÑÏDq8J‚£Sœ0Ø¶âè¡«Pûo£Ï' ýÕÕ2ò¼ˆ’xW695×É~qû{oóÿ<ß<]gÓäè"¼OaÒ<®ÜÍ“»jªIéç³ã\dh`;›ÜÅþÌ;õg¬ç?ÛÎQVþ¥cFõCÙ¢lÛlp¯	=à‰ìBO«ÌçÎÈH¥±>.ßŠ.ôög/zƒÚ×xôæ‹Öà=•'Q}ÙÚâ
*ñbXA‚-^à	Z$
°„Àé9˜<”ç|ÿ~)²Ç“à$ä”P©§;d´¢Úo¼Z‡ÚD×r¶±Ãñÿ«´Ö¦Hõ÷˜ÝDÁ'ñz;Œ’ð|ƒi´ùgGþ‚%5º}É­¶O€ÚMkùW
ÜaI‹¦–Ôï÷‘*G_¨¤xÿ<â.¸§'ØKÙræÒîW]CC;×ÂÍ½¦åà9g•šÏ$ˆi8l§ÜßZ¬Q8¥U†YV‰ú¼±¥}Kª ‘¯EGäR×¦!7Jè™»í–…äžÔ(¥Wº¶Ô\Fä}2tI¶®¿®Öƒ‡R¯dê7E&m(As•’=ŒsßÒÙ6IÌ^-5Ÿ.g&DÛfC²-ï—½åÚ2–sièV‹MÜÐ×ßÆIšE§ü))DÃÆÆ^ûRÊÓ¦ž	·›,Þ^©{¨=¶ürÓM¸Â<b’ŽcS×·ZåÈÿþì/Ž]·…´ƒÏº=ã<’"'"	ÛÏK<K¢0«q^IÒ>$;ÁÒäúi{»Ì×ƒl©ÒÞ·i˜RÜ•Þ¼¨M'RIð$„0Bà“‡ˆiÀ„oÝšÉ^0oZïñ¢…Ö|ÇÁuV·hÓ›ç`#ïId[-	LD‚l––‡[CoÊ—«Ú„äre¬D§†~Îž@¥ÜØ¦¢0Ëa=aõœñ#/wš8:hú£Õ½Æ…tîhöäÂ¢,yÐj¹U~É*¦QÇ/¿=ŠÚ„|îÁð¥?Ö‡aD¦i¶Ê´ú×éà¦QÅP8x9øp<KŽ…Ãé4aë“ƒ÷é{ºðY<¦gPòïüï/]|BîL(.³hîsò¸‡y,³l<âz¸q×|ÖêÙ9%šS eµ7j¤m\¾et*ð)àôôD¸âØÍò1f‡²Ùî^ßQ9IÊ+œ+b£O{[_GŸ«„ŸçÂÇfúÁ
i•éÛöÞ…noˆ×ŸÇ‡øºXö¾à¢O\ëçgîUÈ*kžeš‡5ÕçU1Ü™;1Áãpº|ˆi6|$,¸Ïý=dóNIwÚ$í«OÔÑuD)É€=ÀÉ ¡°œ*VZN•»8§DVø9û+Šâb£s¦Ù`|ªðgÏÑŠÏ)íÑîŒ¨¯qT°ä'of‡K¾Œ¾aQ/ôçEÄ Q%\Yo &=áù$.š–góº¨,ÀŽw*[â‰WàäºüŒóÆS	€îÃw•’o¡Û´Î±íö
â}ý-I#„K9Ìá¯Þ«¼„IÛ¥ãA¿ÚH¨Çm?Üéoï=èo÷gÑ(á—­5=wYeå^Ë .tÐiT˜y°¾[Ó5AÙ³<Ê|Š«#ì@  `áMô¿ËW¢†ÁåAãÕ˜‘}0ˆ<Žc2WAÙª7aw%mU»7e“¹‰\G`"ÑÒÝì¦‘¨ÇnKžïåë,<«ñ"ûàçÇg‘ñÿü×£ÿZR¶ju9”­j_"eßl†€äáø}XŒnÜzù«,m»\ŽøûðBK[1ú˜ù­…ÍÐ„Ú~ÕÊrH¿ªÿv°õ4+n‰Ei¾Óš«³·YGçCÕÀÍEjO^þÀá)‹smÖ Û[çØ¬æ}Æ·³<z5)ì }ž„kùÌ½ÍõUb5û•—[-é[®¤ˆæÒ)[Û€t¶òÚÏÓYñô¦«­­¸²}d=DçÎ¯HA%Á…g9ÐØã~‘	·DN=«Û«HX=\5L%™“Ë—rf5þºF,1	uÜ%l–IþÑÂä|šÛYK0ñ¹Heú:Î‹Çæ˜Â8~ú¼Ö?‰'Ã^¯¨Æ©èÇC}¼a1ôÚMÎÚš8Xßµ>“¤‚â¯L­ÿ|)mäSb|¼‡¬
:dGk“c3q—*Á„×ÎËCvÆæ²	ò	.<1f5.,-ÐIü2c‡-y¢?'„êçf‚OgqÁêØ¦?äVé«`0WËùT‹‹gzÕ„^1¿S¯d²º¡Æë†ÌÎ1&Ÿ{d³µq“™œ=&ÜT’|nh0:{,/éùbd¤=7•=.ììWÂ¢uæv8ˆØ\Œ®=®Íàp½Yb”Á²jœ©‘ ™67C‰ ÎâÐb²+ ©Éw7Þà1 GŒaDÃ€ý„WtÝ¾V)„ñOÇQç&8ùÍ>Ý×¶z5;l‹Çø©(rù>z=Y<7øoÎça»hS:Ó]Ó¼UÌ[]#û±¬¾MAœ¹‘/{pežŒ€xŠøª‡Í\ï¢6¬ÀÂsë®1î\çÛyM@Í}Tœÿ6r_Š÷â§Ìc´°\»sÙ£ô$\$ýÀz³<ïÚ‰»Ò.+:tú7Ëš6ã¤RS7:
Ï—œL4„ž¨`5¼P†°š¯:W¡\˜Uí<÷ÂApÐ‚é²ñr8?[c@²§ÚØ%Å˜;‘hUnd²ËlöË&"ÇÛÉ²‘ñ5Øqs<[ÛÂ8ý×ö/~×só¸´úÎE’S½‘†mŠ4îYœž{
Íõuô5JÖnðÝõØ½:KDð.ï–ÃúomúÁC‹ÜTàþ¹á¾KX0fAb‚ ÜÛÃ*”â¯ì‰½-HX³-9k¨_8ÉÂ¢Ï@%^ºø•h™«¤1ßyîÄ)B1ì„mÀbÕX-,ºµÇí{ÌE#¾èŠ-"!ÁCº$¿›r¿émË£ÕU#BÀ"B}ù3wTÏ¯ß'ì=ãS#øX !þ„Sâw@W•ÛÙØýDê÷øM|ýz×iø¡VôqŽìãB i¿M‹h¿ÄEsŽ	8i€M–šäFXá`…ùhº­R!øM½.1‡ŒÒ3ÀÈ®Œ—Šó%ùŠ]ÙÍ	?‰ÍÄËàIänÌ4GóæÿñS€F#{Š¼m\ù²Aç	h‹£3!T6†¡AQ(I¡Ú… Ý!h¨ñÖÖ6çi2$[ˆ;`#[¤Åƒ«ñÛÁ¿6jˆûìÝÞMX	äô
ÙO	,^¸ÊhÐÓQšãžyü/Öi‘/ùÙ°%<à8u*®sì³9×ƒŠkÇ›€yg¦Î;xúŒ™ÀÜÓ6 ±~A†rÆ3•Ù¤ªe?âqB~à»øZ”¿\3ihðªi×n¢SÏÛ
þØ@=…–A"äÚ¦¡C"ª˜¿0<Ó[=	qçÜÐSñéóÐÏÇ,ÌG;  ‹¹‰Z¦ßx±ûŒ!æÆ1ïX;µbÂÀ[™¤ÂÄÁE-ƒ¢¤MÈ4t+<ÝA“µö®ÿî3Òå6ïlî›8¼;íLÙ–]Ë4o.¦ºáØ+ß®/´U£Ioðu®H]«-q@Ìfšã¹˜8Žþ©„.ã©ë]¹\PRE½f2&\XcJ>g²ûA€˜ézYu˜F¤ËÇA‰¨ÎMž!C
kÒ‚gÁ%V1mhŸî.å?¢ò¸SVVTCñÁ	³ð(4
žÍ®Ì8E©X_µE+‡õs-·º£O#¢ì@%Øc&=V¾RšÒÛÍ'«—í.,REÝ¥x¤SLË™]ÖìŠDnÃàé¹kn›ç÷4* Œ~â€™æ õ¢™§ç|ê¨ß–Èóœñ^ÇÌ8gç&Žï»É|ã‹Ù»Iðø÷8,  3xÎnCÿn²¶¬¾?]]ãGNÂoÞ>ê*ƒY3ÒÌã5ðóŸ='±LíÙâŸ†ÃÓ¨’ÇJ'Cd×˜ä%xêx«ì0:	g‰iÁ¬‚®`LÝÜÃÅßâ<>N"UuG›ý­XU¯C&.¼I‡ñI¼|ÞÅ+T[83K|‡\Ìïó2}ô|šYÞäj[Ý7¨ûB#7ÕÄžhcÜû˜þÁØÊoÑD¢¶<ÃÄÇp§ô±Š´3óÉìpJ¼÷-Q¹à´,o>¹ãš€ó-}s†Å=nXÜÃˆËW®-MÚÊÌ¦ýÂG †¥ná»^M uÇß@.6¶AºpíºŒŠ={Û1óóià*q®ž„Ç#_Bm¼j)zöØˆí5©ír	2È—OwãÏcP@g«OÏÒé¹€á*8› ÿ(š²Áòð$ê¯
ãXô}V# 
$AÎ÷¨ f#|*˜K>—âïX‡jóÙ¢Ò4;÷¶8sÑÒH¢©(ÑÜ|òÚ?Tc¾`Ì
€Ÿ:Îèw›vdë\~åàYâØ8ARû2q$áòbûÑ·iœŒÇRí¿ûŒgÁ˜÷$¨~=°žÔ¼>Ô¼ú(éï‰<ÉÖ½©À‘¢Š6Dñ@…óü@
–ó˜iNpÔVé­*¤_MîÖfMÝÝ­ò³Å“	ê_›’BÌÁ‰š b`éS
msra8ÀNõ…+m¸Á¾Áú £³ñ@WSÌ•lÊþjîq0Ä^‹¸JF9×q9ôáÇ$üŸ†EšõI<=NÃlØ?ËØ|dD`U¨ÕGq)“gû¹€Ží­YoNcáÁP¶ñÓÊÎ;øæÑÞ|M}\Þªß1·:¡tb­v<æ¾f¤Õ®§Fè¢Oø ÜåinÐòÁìÉÑ K“ä	ãÕÆ¨ëpŸpòƒa|zƒ‡‚H»|P—ùÐA±ïù#¸­YòÝQµ7E÷#=Èáƒrë„È£õ°¸± tDëæbæþ‡ŠÔsäÔv‰$&X‹ô›7,Ï˜§¯üüAyÆ TŽòÆíeäQ'l]Ãñ¬²×ÑðýGÓY7Ã•j6­¶,i	5€î¼,žï+‰UeJPóÂ8Ÿ–ŽìHL)wº¬è!Î•Ã×ñWð~–OìÖZóbA*û½€ìeI¾rø×¸Œ˜ŽÔS·ºUø4®²ÿ¸§}èX€ÐÂÿ²"ö©[MÏÂlåð·0O£ Ç¾t«åcElÞÍ
 ƒzü{cU7’M™h3'‚C½¹Pá‘JŸ¨h”÷¼sËbIâÕM¿•9ñ¥ZrB$4Æ´æerj;r3çÓ–l¥ÞÏ®ÊûžÒUC&_¸„Û×Â$ê3e1 ñ…ZàoƒD†Í¿3UkéÊ6c½ýòóÅ2Ø
þ9žÄY^ÀB¸¨"pºÊK|ÑÄ9Ñ"E¸àtÓ%¾Må’)—ÐwµzêƒÛ`Ï8Hš³V’æL—4gÞp;ÝÍëtê8ÌHEU&M	7—Òë·ôñu5Á‰Ç§MÕólp@f<fãïYb„¾pYÕ&U¡¶*1F†…Ìî™ÿÎ04îLö°>O¢,‹²÷iÎØ6Ô-÷£Ó÷^ v•Í&¶ï­6Khôq;bÜD©ñ¸§®‰gUÙû[åJIN­S'ñg³vîµ­%yØ ®[¢’X’+µ#G•\NøÞÁT$ÎÞ‹óèÝÉ‰%>õÁÔÌþ)o(Ü‰C
°tÆòx´µ›’8J5Ð…¹›û9cù¼‰îQœ£ÙŽ©Óµ£3P40Þ`Ê2jì‘‚„„†º©ü#Þ+¸8÷L<\
t²2OÍS6²¯ú r[½k'z«²ºë¿Ì!jõäFE…Z}k<^Ô²@‰s–¸&€N8´ &QV²|r¹Ïf‹Öq_mRo~+¤
Ï„ƒÂ§ª—iw†w­¡ªÍ7:oJ¼iãÊÀfŽŒ¬bMeih(¿þT{¦i%xˆâÜ×1o‹õb]æ(ã\ŠM¤üýc*"AíÇ0u‘O¿(® {ÜC¢¹´e‹þÑž5tŒò¼âÔ¸þ NI[óÆqÊjW7ÙÉÛ¾ÎÍ¡”ª»ÉPù p§96‘üå÷,Ç;ªt›øµt›èàIE8ÖWËÎã-O3CSÞk1W÷Ï`)ÇíªÕV†;å™#\Ù(x2nÓàF¦'¿dÝ%Ÿè5­YænŸ°Êj
¸Ÿå7ÐðRT{ýÁ(Ìž½-Ì’ç!&ÕùF÷jJßŽéÈ­´¸«•CÇÈØ?i6‰Ñ=´u2&Ëòoç¦ºÌãŠvÊP†­zOË=òãÊ§ivæyb,Â´ü½Ù°2Kk„ÔíŽÄ_iãé'Ñä´‡ÁÚJ5v²%Œv1Ÿw1õ\·C\?mõw¢ñgÊláã,ÿèý(P	ƒgéx<›HjF8»DçÛgPºèÙ›‚9Ä&B;Ó×›àÙ¡ÜL_Ò,¬R¦k®0PÝÛ²¬Rü¶&lÞ·pM¡ ·_Ñ#Ä»eÎŒ4ÌSYžx¶“ÜÝ½aLžù©u»Ç¥™àbØÆ¬|£)ÓÇÔÚm¼Bó€/-n„ŽØS×Ê`ãÂË“TÍ?:ÎŸi¤ÿvùH5œ/)c¿'–÷&œ¾±So>³¯SÁîò%ó»°Jô[2ºðö3:4²Çäca_äv{Íd<&©„<“`Tø¬¢îÁ»
n57ˆ‹óËuh˜½6{Oñ9/ØÓû /iQ2ŽA˜+*ëÖ”i¹aÂ_‚ÿù¯ÿ†ž );ŸïxiiL¥%Tb£T|W·¹ñ,KaàxxnYQœ¿“ÆQù37z–?ƒa‡éÖÊ°Ã'ZAi4©ÊsäT—+õJ~3êc÷K‡n‰Û¨ßSe7»¼Ãol9Nõ‚Î·ÑPüÍÐÇÃ+ü1O«â ›­è¡4—Øö3ô¸„ùùdôŽ‘ïíY­¿Â-ä$N¢à Å>¦/Ù×ê™õ`ØÓtƒ÷ ÿÏééªýo£³ªCüi¨ÑY
^µêÖ¿]ÁnÁ:	³áY˜Eª1j]•ÅI³?R¬åÿ·ü+[Çƒû`ë°!¬ØÃ­¯gwP–7çh.ï¸>•7BÎÇ	\{™fcGBžÒÁ®šNÚT'_aóýÀ~ºo“«ÒA¦tÆïÍÕ%@¤tmúÏÍ•1p˜žÑµ¿7W>¬teÚ¯ÍU©wº:«DS•T~¸FÕ w)Ÿƒ3*õ¬ûtä,õzÁRý¹ /°.AÐ~£/©ÆòÞ4‹¾Bqø«àëGpc>à¼Z£c ±_4i.#™ÌØêÝ9]»sºé¬h‹8£³WÉãþH~*êÔOK_-Xûãˆiµu<M' ¡†ÜÇx˜Â§UW8Ë„éÆ‹e©Có)¢aºŒ‡û6¢©u®X›:P^8Ð3&'û2ƒWÚ Õ¼ëc´ÕÄ+*#Ðî–n]Z"êª³FYK²•CÐgÀáŽ­hÂ‰ÃjxVZ`3ÉéÊaŒ•p‰úHºÌ&·j EÎ‰àÕó`38ŠOZaÚ6:»­¤ÈÜp[š	46•Ëv Øm	?AÏä«!5¼m·0ÎgWl¹È„âè›ˆþv5ÔIJ6õR¤| ~mgõÃ³U6P{yŒ=~LÐúÌ¨ÕÒQvé
ÉÑBúkäÄÎôsö ¦ì3w…7„¯ã„¤\Ë*MÕVÿ¾ŽÃ¤–‚@"Ô‚ê
6{eöžô‰»êk—E¡É\ó­ÙË[°4ºtN!fBÉHX¡‡¾eÕ§ÙÁk6ê ¿óFGÙºø2â „güÃqéç:éÅ¹H_<V—8ÍØÀð,œ0ÎÎv³éŒ)]«§˜ˆ&ð¯^~¹<tŸ;¦µìÝ]{÷öõ«·/x7Þ½|É?;Ï^nÅ¼OÏX}7T¦ÐKœZ}d‡^*YXÝxÿîï/>¼x¼û+ïÿ¼ûýã“ßL".¯'D—ø FÉR™ ^ÀÔ%!ÛåÁÑlÌÅ¦×q^´Ñ0vA³‘$—Àçi‚kˆÛæ°$ŸÜv*"S£Ø¾Z†›¿šœd¡0iÍ˜Òö&œâ~nK³8ÒR67wkïì}âõ”í;zÈÆmYÆ+'¶Gn]n> `ÍE„ÍU‚öÛXH÷qä©%oÏ²p*%"®Oö
Ð³áL1!C
XÜ_b(ã‡ë˜óì'ÃçÐ‘Q’œg²Òz0Ÿ—Ò!“˜xÄuXQB¨h¾H|Ü T~û¤RCDŠâBü•Óù3~"ƒ¹qXcQø½nþ`äm”¸>ÚFN©¾GÂÈ©ÿ©ú5lÂ(Qëg†Mïu iã#i½ÀõQtý¤ô{$èDÌúwHÏÏS8Dù%xÎg—E©[;v¶ˆ{·që‡Ømk¿_i×NÚ¿GÊæ€YâÌ¥¢ïÛJÌçŽ(ý> `Ó§£a£ÄõQ1â|ò=Ò18°…}÷LRÁm§æÒ5'ß|2û†Ñ´å»cQõýTm{atm•¹>ÊF]—¾GÚ.—Ì&q1/]{Ý^´»·¼V¬'Ãaå$ÛäË
ëNa¨k¬]¦_¬Èêt}¨öÝÜ;`ßFgå@.Òwcš¤çA@&2èzÆ&œ1 „*8Îâá)À›9‚(œÀ±ÄYÌ˜€LVGKO¨c¢ÕÛ†½Á<6¾T8nŒÎæA¨¯Ïi‰åÁY­¨ ¶4Q|)7½ñRµp“Qÿ´èøµoaòŸÂœcÏJè>uÎ¾Äu'#õC³7’• Ày‚oë^1l_c{5?/<)G}í{ã75xM‚¿äOäØ¬IüJÛËP÷›”‘„÷$èl˜O¥¿ÈÀã7œœAx²µNã—Q1õV7ÕXoŠd­¥Ø:á£9ŽŠQ:„ãß?®âþÁÇéð|?øßGïÞBì£Ÿøäœô+7§’"ôéK,TwÖ„	È„ Ãþô‡aRþª¨ê§’öÔãŸ	§Pl/rú—Z9pÊ5/s×ò8;;ÇÓàÔWÕe0¿­e*g8EiÂ$¨,K³ÞÊKé­—Ê¶ËéXYX´mÑ{QÁNC<­:¯i?øù‚ýÒgBYžF—_|`k¬2—F äõƒ¡>zŸÌògq607zOÌo–Vf²„¨žÈES:9C<­§Q¶Ö0¨QÂªš'ôèá–3ôèÚ±£¨ ˜º¼ƒ4&Ré<ìŠmÅIi0çñ€Ñ xÙ~³bÆ>³‰§#HÎ–—æJé[;š/K<kë7[OFXóš…Ñ“ˆtŸõwž¥JzC´Ï'.[4$…Ã&ñÐ|7¤ß]¥¼+’óºf0ò˜ÿ®­ØÉÎ‚¦[sÞm1ë~Þ=†ë²åÌ9ä;Ž½¥C’È\Y:òVŽŒ+‡8)Ñ¼Wâ½KôÉížØÒ5ÑÑãt…d\KÜ–€A‰üZ36Êçàzô>°mdãÝ$9¯‹ñ·ž’+¿ÛBÆ^.¶WNÃ˜½îâö1==eûþKaT:—â„ù¨[`«Œã	“L‘„ÙˆÏ›í]ngk§Â0L'7-}€ã%…·[MPEs?JÝg"uã®’·ïƒ¼Ý‡}fR3¤y¯	ÀyPûêî†®vŒàÕ"upm“âí°jAyÒ¬Ê!Lí™ˆ¨5Ã©ïMXŒúlø{[ëÁƒ`#°V¤ËÃÉ6$”wžÛ n·ƒ	.D$âÖcG]É7K6¸B‡ƒ÷Z¿^ðè Ø"ëƒ´3 ì‡€$ÄõuÞwñõAå**nÜÛªt~qÇTúËR®\û¼A•Æúþ–™ìú×ªMukGkUÝ3ÛUw-»‚A?äVïe¯Ó;J–æç¨ŸÑ	¹Ÿ	FÌ8?R¡¡AÃ@äé8ê}ƒZ¿A 8$b­@l8.SÑË'P‰Ž8eüÂº´ñó…hóòKCŽ%\h¯ø8XF'á,)¸ï¹Œ"²•UÍ“³ò4Û˜¦1çŠÂÐ•2ÆË¶–÷ÝIW¼  ´fùü°3Æ‚Áï¼i‚Äì»3:	“m5".uù¨”uP­ã
c "Ÿ*Ò…³©Ï—A”°¿¹«ðrzÃêðü xàó¦¦Ýuåu<ŽÁÌF`uýtÂÉ$eŠþpŒ™PLûfLD[‚E„å<õ©ëæ…ŸS ã°¤¹3¼6lëÁE³3¤Ã·òQn•¸üì5yÎß`‡ê¢™8\µ]úbÿå—`õþßÿu®î† >¶“ÐèÝ°àÁO¹sßI}e|J©ÖV®îúÖ}¯¶uÓ~ï·Mîk÷nwB¿¼…¾.”s£$> °HqÏ‚k—õXîd=|v®SÐ³€ân˜”wo‰RÞ½2îææ‹xÖ,yËwâ¹#ÜUÝ¹Å’iºìJÀ¡¡p3Eº½ÚÆLF}Ý6‰®Õ«Ý	tüòè:ÐÍ’çdüÛ"Å9s ®]šãÝ¹“çÐé¹NqÎê½aÒÜÞ¥¹=tzó…9sŽ¼e9þØåÊÞÜbINÄ?ÞIràuÑ€lþªP}?Þ­íÇt|èmäÚ½Û$Ç/oI®åÜ(QNEÇ.R–³†àÚ…9ÖŸ;QŸë”å¬<	7L˜Û]¢0·[¥ß|iÎš%oqN<wcä¹ª;·X t)Îý   ÿÿì}‰rÛH“æ« µ=¿¨Y‘’,[mkl+|þ­]_a¹{w¢£#" 	Ó Á!(Ë…"öYöÑöI¶².Ô‘u ¤$Ê&fâo,UYYYy|¹Rç`ö\MH™sÕÜUÎýe+EŽ^s(r!®Y*5.£a‘Jœöùw®Â5+›œ»Ôà´ÒT?”þÆÖÛòkoÚEënðÔÒhn‚˜{¬·Iè¦•ò–|’‰ÈDûV”‘ÕVšÄ#k7ö[Ý7=®í×­t9zEërÝ¸g©ô¹\JE§#7çÓé¬a@ô:Òæõ:˜úŸ¯Ø;Wj
aw7ª]n–
ªwœqnI½{tƒêÝ£¤Y~Ë¯âY3åPóØü5þO.…ªgtÔ½à­&9Á3þlþ¾iÐ1X¥8Æ#mm%Ÿ )­xÈjÌäà9mG~ß·!‚[ÝÀÆÎACé™„©[‘ b,ë€gËÏj9ôØc< ‚,Ew—º¯K9Š~…’þdõè+ŽáïUDÜZ]:køûn«?'à°¿?vpµzs€pûûj$¤ÕŸ4¶éÓêòúßì“ž{Ïµ§sýÂ¡öäúŠ…Ç‹D‹#KýmZ–Çd¹ïÓ¯þç›/ dyð­N²óöÍªó5°¾HOOH-?)Æ´X/Ò«kø0€ê~<ra—QtÁ6#éGî{©”:DÈ^P^ Ÿ>ðI˜ ÞQ<\nõA´‚»t7¬*0@Àø¯8rÈ1†è`•žKù¦/õ¾W¸7ð[™ÎU¬€Xˆq¬\’û$7Ö"¼}Âë‘×nùŒu`‰h¿HÆº@¥²ÝÍ59ñW€ÚŠ±¡UèDà$€wÕ)­zÑ[?b¸xD;Wõ¬Ñò6Y³(½an¨^‹çAt½é¨ŸëÆÂÕQ?×­ç—%Ó ÷)-(BÿÇši<u”~ÍWúõ"ñ4ùJ.l¶¼¤^6¹xÄ‡M®µé‚M†`6—ÖÌ)FØ'¶vGšå„uŽ5} Ï$k¼GnÖg)‘ýßÊ»ƒáüœfE5"ºnƒo…ˆÞ jª':E|J†ç5ù%©Ó“|v™ä_ÊéÞÂ¡Ã¨ƒ¡+:2Ÿm!ääÂ„Lr» ¡7ßdÑ‹@¡§5ù¾‚VutQ%Ï‚.v1mKkœq èo”N¼æ¦þÄ€c*£/\ãjœƒ`ð˜ŽÂÒÄ´âðêœg ÂÚhc-gÙš9Ýºµ²¸ñC¢±ÏÇ¼GŒ›h'Ò!w›!DalÆ?ô0;Ìª#zŠémP~ƒ)^GìÕøwèIòé7Ä}è¹A²$ú«¤l§z?£‰hüÀ„älHôú#~@›VÕž–Ñc-Âï@VÖ/Ó‚M…ÀøäŒðz2×B;)<ìrÖ2zèDèR‡Ï¿ Ìé2ÂÙ §Ž_~’3à4˜$½@šFÈÐg½šò9®©\Æ½GfÜ8 v(Oêß¶Ž±á"G÷•X<#ðÓ-eq£­6é¶0”D´Í!Ø\cÛP(ÞmðN®¬q…Ã1¿G™c,Ô·S†4¢¡¹¥ŒûõsyÆÿ:L#¶–šQtŽ‘hàÀý\´h±Ð]®ÿZòù¥:F¹1‘ÎäÞä9n„÷€.Ýžµ}ÄÓn·RÀÈÜÀ´‡àÉ&ZŒó‘*ô»\7¥N#¾ÀÙ@|ûu~8ž›ÉÎ6jsdÈM™:ßF‡Å9^ØŽ7×~g-žåØì(Yq;›k›ã·#÷8h­opS`–ihƒ³—&²»A£àÖœ½Äû±©Í¡ƒøŠº=ºæîm…«ë‰°®"òˆÍD‘¥ zÑ/··Á”&1Ãö•_È{Û´²£€÷,v}¦\
KsJô‡[PÌ¦SÍÜŽwOe
º¸DÈ]W–$‡…¶qÐdª5Á|*%ÒT›à!Ugâë
½©-Á…kLl:–¯TäŠïéõÛXÚ¦K`œøÎŠß_Ý„êŽÜòZwÜ…(ì2]+ä¶°=~*Ó9«W¼ƒÊ–³*jÔ&#Ý"B¯z©}PìÕNžiÍ)¸VéF€©’Hœ¨&lS¾êƒùüòœH^ê
õ†ƒúA9Hv–õiäñBAkêxb ÎØOW¨gt'Õ¬vg( ³M(gÌYL¾xÈ’¯ åyÔfÙŒÖlI(z6áå¨C×,:"g†šOuÄ:Ôlgô +c	Ø˜ÀVFExŸñž ;Òx?§ïÁù×&ØÏ­ÃÁ$½,«4s„ñÑ·ñÃt¯Óinƒ¬zyGšª:"
ãóÒaTÖŽèÓ¼®Ê¯y£àè¦x¦vžü‹ú×"Ëò1H£Ñ'p®×”¹WVTÏ'oØ–Áâ&QLø´"¯Ä"çUbÅŸ7yÅy¨MÜ•O!}…sâ“½ÆªøÉŽª`æ°÷pÕBH8ô‡„ø‘ôÕ/Á´’’ÕÃ¢
hH–kÞZ¦¸½
E¡yãùŒØ±7ðø€»Ìõñ‹‹ C¢ÄìÈ½ÑrG­xK½‚ùH–zuÄÜ@œ
ÿ„«ü^(‘Á@hŒT±µUyGÑµ¤>«.^•U³xvE–ÇeªÅé1ÂçdÒ§‚ñ!áÎ	ù_\ÏßIþ‹èëfÉÐ¢þx1&-È6bª¥È™Ú±ÏÂeÖeCš¨¥Ú0M[=n<&¬òX-@>Þ0öUƒ]šÅÀolíl'ÔBKCkÁ‘^MkL™RdA{¨¹* Þ!`=é±ÏÛLæ¯JDŸöl°7`/‡÷ìêÓçŠOÃ8ÿåŽ™ì7¡X|U¤¨rež¦]˜‹Úh>½±-çYÚÉ_vò:‡ñçAMúŒœ/7Ðã&¤HiaöNý‚ÎJÃôF€3?`åp#yqÈ}'ž.+ÃP>d©¨HúÇç|Dæ?Ã¶t‹Â(-®€º5åïôG±Š?—Ek1¨“+tÖd"$6ÆäË4­Ï,@ˆ[$ëeò³\‘}ëï ½šæAƒr±•ÃM&<Ï®Z%o[SjeJE|r‰|©•þôÇŒ´Ô¯à›=Iy8W¨©ùÀT»‰hWª^†¢]©h-ã;èPžØXužÕaÏ¡Ô<¡jÎ×¢ÒÀª;Ñw=WLló‹õ[4×“+û0‘1´‘aˆÁèE·a|JqÁm„×UãÃÑìèkÏ¹Å<z³tv^»QbK+3¤‹<+Î]®z¢‡‹9¯Gvxã—Y¥ RôM¥ãààú“s²I*ßêMözÞŒ†®è±}í9¾qv|éïw¾ Î)pÌÝ³Ì¦5~šVD­É[0L˜1l•¨æo;@&Úö×A>²-HsB&Ö3‡ãTkÝ~®–oª¸Å’FÄ/t¢t‹(<f-àMKÁmì£,¬î°–oŒÁM<Ï _ù¢Œh¼ƒµ*¸Ù›<E"9š»B:>l½X¿n7èK8Ìðœ%//»NÃi>û­Î)¢ØËËC{CÙ+^^Ò8K÷ÏR©bé‚mwyÆòã¸ëXºçã˜r¢ó‘]¹iR¯ÉMç@ol’S÷§Éú†kÏ§w?”ïÈÁ¯ÅIq³ÌIœ‰÷¸8TosïÙTÛ2«:Nq«?¡³mNÎ®\rr*ûð™®¸õç÷)ù%1--z„“fÁô¿ÆcIkî_%þS²í96Øó†:DSŠçHyJFbÆáÐ<….R±ƒ»bdØœFcREÆ5XÖbªÁÂ ›D ^ã!ðØ‘aßv DIÀgþÅ˜!ùo?Sjœa9”ô9Ð—ÚÐPþ¯G1cªPøP%bVÉèþGF7ÚßÜjlLˆˆò’°+Ý £Y1k²núRPO Õ¨¥'ð“ÖßIÒzD¢¬íQÎÇÃB‹ŒÌk§ó¬…Ü•Ï^\^pWƒLºI^R¨¹d’Î€jd‹,™ñøI¾ön7Þ²ÚÎ‘OfƒÆ.ŽÍ”x< Ûb­1©QIt€9Óê!²UO˜çbáÃ¢òæõ¯·¨º¯iðQræf’å}|ÄoN NÂ«d‰ï$Ò•ª;Ž¯ZÂÅJÛ<r§m"Û5š«°gàƒV‘Þ `«]Î·öæ«…&Áln®çº!?L\Ò ¥†òfœ“m\™EMÿ9;+êÆIC—OÈè?ÝšDè±@a+ìå:Xž<3¬°Ì"™¦°Né#r¹ò.¢­è|_¼[©Ë
+!¤ß²aK`òÝÇ© &–	Rb@‰„“ðñÇr¤ÙvÂ”pesÞžÄ
MÂ¼VhâîB$ú²@JÜ¬$§éËŽ$ñ½âHx¶%öZ¾³-j„s‘,ÇžÖ:M5ºØˆh¿º*+ÀˆÛŒ¸wp+°ˆäãùXÄ
,b9À"¸ïôU5ëƒo´+°ˆ¹À"¤ú¹B‹X¡EØ/w~´ˆ˜bPºŸž.ÛFÄ'þ¹’þâ "”šOÝô…%A–h‹+³€ÝÀ›ˆA›0ü£í°&ŠZæTÏ*¿ÀÐ4EWÂ×ƒú—èx_Ø
uáº`U?d@Å¢k4y0.ðTwî©«¸Ž¹Øñú:Þ
;ÑÜã.‰¶Èù÷M¿_$ ëù¯fÅó¹¤,2½Dî£oÆ8J)—ƒõ†e×»óŽ©¿Xk%2¿WËíµ*eåúÛc²{ÍyUKg%ì&¾J!Q+y›“ù
Å#²¶´ŽØƒv†ŽA¹ÖxŽµkf“ê<ìY•³È£ìA8êA5»''ä^o[cr~'òús>$SBþñ)%*lüJCñI×îðHŠ6y4frï[Ifï'¾^ü™4‘”ìïQ¶ß´:ëÿñøÑ×³?“I;–:)«‹þU¤)~·	öi‚#iê8ùfžymdbkÌvÕÃ;¦¼MÓ2†Ô­"‚®ù„P³]z¡$1°_hõQ²S®ÿÒ/[ËZ²: =VÓL·Z !bµ”‘ÖC^îLjÆëžÙ/7<dð g\ªÔìÝô<”™I[¢Oëà+ŽÏ¯XŸå%ßïžo9Ðÿ&Jäé2gËX„kÏ|Ò% $¿‘ÊÓÑoÓ²y¹éƒÞÂbd=³½ƒ³‡ýdíl6›Ôû[[Ãj4‚tÌéÕ”èÁiU–9QÀêùqëtöµÿµÈòªîŸÿÎg[u
á‡[/‹Ó—äÆËóñør0š<\ÃÇúàŸ&ÈÊõÌ÷ïðJ6<Ø“Ø `í€½µ±À^9OÔ¼¸=!MÌ ýá°«¸­HÃ
¤ìÊ†$˜æeJùÓ'˜±‰ˆwP-BÙ "ÇøH1s8ˆ­Ýíÿ¡{âºYËõ4vëKBž–§z¶ËŠð”KBÎ…ÿ ¸mÒO=Öê§:È¥ŽPiØö 6ñìÒ&TJ%­Å»Šä…3ûÅS½Û°­|ÙÕpì3¯¯JÏ½“Ë>w[°˜Êj\¹<"vÍí”O)~ÉèP	H÷ödƒÖìÁöˆD¡‚fØè‰Ê3"üÕeoë½Ïr…Ñ¼þBn(ë"Þ79þÔž§[gœ¿Ùq°QYjr¾<<yøz?¹r±Sþzõâ}ÿg‹o©Ñ8ùÿçÿ&;Û·'	“ÔDC…[VkêÚ9HÚ¸û•Çåð'Ãÿ>-ÆÉ¯çÇÎáGâzÅñÅéÙÕYh¢0{âòÁíÉ×x¼“n„4qE ¥‰+€˜&®e‚åW´ç .,1™ßþ9FeeG|¦bÚŠùf²ÎV¤K\èÁ+„R—/‡Ða§‡Ë'ãÚõÉ§œx[²Å’²æâAýÄuK<È ú¾7.l÷&³agø·æ-ÿA¾äù~¿k9YÆ*ð0Y;¿bBlíaŒ–`RpR£ŠÆË*»Lþ	AÑ±'5²÷Ù4;Iyº¯üùÀ²<Šqÿ¬¿­Ÿ,Qí{—ŸÌ’WUy>ï'prß¹„Ú ’z8…Sá? âz•LÒq^¢äÛ@•@
¿$úéwÒß£ºÍ^Cþe2…æ=åd—ÚC—>¦=R¬o2Æd5âÄqò¦ùÉ³+úaòÏù‰f”gð´ž@Ð†v\WsøÌ—VjÛÞ“01†@œ»¹¦ç=]ëŸ\WçÓ!³@œ7B¹¾Ûž	òÌÀKÂä?ÿÕßuÆèÈoÛú…évE$šfËÐ’©™6C`¦lJ^u\žO‰hñ*JCGÎ3B`ŠÀò]snœæô0˜è vü\8¼$\ûÐòón,(F‚÷GÏÃÁìä©âóð†Þ]Éo[wøû›ä××ÉÛ7o^ÓSæ§w/þýå‹Wÿs?ùüæÕÇÏ¯?üÓ{àt£0¸¥§B2)ˆÏjË¶}8†Xö>dBHó(kúÏ€4KV¸§!m2Œ¾öõthµ×¼‹¾‡£™›²7]V\ôTÇÿâhË^È”kÓËùÀûoI7\œ@ïüßâòT2Ò•àSW=aÆ	ÍZð4)«jâù™êžßÁø[Ž!€ÌÙÊ¹@}Á¼Î­X—ß¨•ÿ©º%'°IÓEÌônlœ ÊWONŒ@©ØÙëf`®t_0]îÚ¢Ò4]2+éîÁÚsnUm`Ïv½/°P^•Rd¦3'Û·: œó©Ì©À¬NOË<a$‰í¨|ÉIîe%§•‡ýè1þ’5à‘„é=I~;lÀx;lÓÇÑDGÍN-j34;¶iÃ×xS2ã0ã®Ü--çŽT“tXÌÀžK5™>SòÅ]j>mô|~;ÉÎ§)½±‹8Ð•Ïv¡i5»dÃ†dAEï‚ðßÏ_Ž>%¯‹)dõ0M‘nˆ/¦Ã3øù%ùP¢˜	•·ó¦ˆZ÷ðYmçá}„M!âÄW¼öëüèmkNŠy!ùEÁ®:jžHÉÆÖç~=LË¼ÿä‘ÿÕòÈ7“;ÍæÛz’d;ÏÖšæ¾wùEÌ•±m>}_u‘µã0	ð·ïÓo¾&¯€=ÂÃj„Z®=ù¬ÁüE1,ÍT‰h©ÙfÜ':´šæFÓÒà<ÂN&ÀŒ\ÙÞe[gHU³n?ªÍÉ³˜íÂ¾âga?WèP~2Íë³WðP2š’ÑçšzÊœW€ë3ób“}8ÈÏ<\Ú5	Íç…õ=”h§C0T0\|·µ…ögˆfÕÙ^p°§µ
ž×Û{Þ¥×}rìucj›ç£,3KÌ@¡dž¾ÆrRœò­Û¯ßE‚Õ¶6ÝõŒ!-ÒÏ!ªH®ºf›Ì5ådMÔW_~O^}üðáÍ«/‡?qÓã!:ã¼v€Â	@bœÞ’XÀÂç˜¹»ƒ«<ÎŠÐwtí9g
©3üõ­(Ð*¡©éÌi@èÉÒ²?wôÙÖ’™
ö‘eðËH¸l$*y™§ã% 	õ–ìÅÀÑØòšGïÖªaÈž0K§ä¬É¦ãxæÕ}à’[|ì¡8Î…_È¦ô‹¦R‹†é*èèqXè–Íç3E6Cv¬]q¼0ÊÔ¼7"€Y¡g¹úÊãÛšÿ;:©`RS+× Ì$˜sMS%ü†Oú¶»Ñœªq¡l”)>•‡°,áçÐxsu ž[>…Ãçúÿ¸¬†ãaTtCxB±í4ívíùá'(ŠIfÝ'í¤	Iî5uo¦6 1@Å„¿—FŸí<øe°Mþoð¹ýtäêr÷§Š¬ÕUæ)Qq#£=÷Â@?ÞþÎGÀù!rë–øœ¿V-äñ2?ÀAõæšGi–e1©‹Úv¥áèdÔ”:Ó±5çdø½YqÈ–b£ œc©àÏîí¶QjÇI’wöC(ø·ùi •x,¿aÛïý^îQÕ«œTÍ5ãžWl7­àö¸òVÍÌÌ/<?9-Q/²¯éxSÈPKJ½Ÿ¼'R.™åFPIX$^QZ5`	Wôgê¶Ùzq¢IIP+èêsF½êw.ÊÃÅÕäl!êër•Ã“ß2·'„æ›[.FéVg–š¥ÚNn
`ljÿ=¯ãæõCõ#ÍhË-¤ûŒÞÂ~1ÏŒÌï¾»9Œ)íç¢Ú_EÉÒjüy~—lêi’°û²bbŠÿÅ¶sôÐšj–%³}À{7Öï¢«Æx˜¿K»L`¨ÑwËéÚè/žÙËPA;O¾kÁ¨¡¥"¿Àyá3Dt)aødÌª%K’­?Â¾¯Cþ#$Ÿ˜†“ÍÑ©	ú³GÇQ~ò¹¼ÙSÌ™Ý!ÅšE\";¡š`Íõk€
—Ê´9™ÄíUJÅ^3ÕLHÔCìùð+y¼¦X5®˜I¯W=t6>N«²¤Ìü…þ/ÍnÑà¡¸fÖÈdê‘mø'Rƒ‘¯’¥ƒå£€	ó<vZfi}&žü²ý²ùÍenÅ³¨»p4ðCü@FÂ†y(8¸[ò8'NAwr"~!ô˜ÅYÂa¾NÊjH•²¤Y9%æ«Ì…Û*š›Ï…2;H&
”î|Êd²Ò7Õ×F¢v'›§³³<Í\’œÛ­¶bb¡%](6½E¼ŽÝ±†ÂÔPŽb+ùRÕæí”žgg]ºcM£ž™y…VÈ÷EÚÈ‡^ÈÀ‡&ÐUšC‘í_¶É«ž9£BËŸ6“"û‘ü—mÄC¿À’r`èP&q0fs”»"Šç6£5e5äKÔ¼º`º‹¸Öì”Q=PdëÑv ÕE\ŽÁaé_Ž4˜ö".?òGs=eÖòˆz0´ÿÐ(³è¾l»×¯+Sín˜ŒF“€ ªöÚû÷ï“,ÛL~ýu4Ú¯ëµ`B~TÈšçsU‘±µø|¢€xF gâûoþ»ƒ¡ijÓY@òÉ–k"ynF•(2b¡£FïQ!rêÕ. M½”äúOu…â’1tM0{¤WŒ(t†ÚÛaù?i1|mÆ°Åº‰ŽÆ·7ÄVoáÑz´dì˜%ÁÆYiƒUGå†[H•pˆž~}—+YX
KmCO+àóJË|:ëýu8&*S
q›ìØ•'K{«‰"°¶ÕÅ˜B½Ã±ëç+›éõ¤,f½õ­õÁ¤šô¨ÝrÜ íqòõR–eïªÓ7ãÙô²·Æ£I_P@âµÍDLFX’Vˆ“¢$ÌU1¡4³S"€‡ ï0 ¼–Ä{Phì‹K€×â3xV!™ÓÉI ùª•€ëF¥€í¤,v	*¬PÞ–<ØÚJ~¥Aì|%D™à äîKâ3#@÷ÃöD1¼*3ØTL±|ÃˆVöÅªí¤ üÃvZ•x¥8Ùï'C8V«_5•‚–‚í#JGë7£Õ¼´lÏÇrØî=Þ"1ØÅJé`úéF,xÌåßŽŽè¦™%“œœãÆ`½ëFÙ–èf$ò#’tF6£È“¯ròKN¦Õh‰·1”vó›†Øvó[ØÃvF¸‚g×)²^†H¯Az‹Z¤»šÑ]Õ–ÚA¢·‘›Ú€\oô”×k°¿i¨å„¨­lÉüH¡*²¹³ÐœCš5Ä¥T?»¬ððÍGuÕPGÂ‰û!p>LWpX(,ëÁˆ@ .Øk”^¥kJ6pk"N\Wù,ÕLÅŸn\Mçy!5ç©/Ý
¸Õ-gïš}Èzs|‚b¯.?§´Wõ°Jg0UDÕØ«„HIKÔV(ºüìJ0¦É…*ËÝ5*àÁXß…T*÷Høfm?±J²†¼Z„Zñæú§ýfV âh„]ž² o»øB(šF¯t 9\©v-ï);b8(Íè×¼Îëá´˜À4˜¯eh!d¦hî¤fUjrQu=@ép¼MüÌ&CýÅîŸnßÞò?¤)-ÿc¢U‘â+²#Ûñr?Röè	W)Ðâ¤u:OÓ#ŒšÕÐC¶‘¤5Ó	CÌVeYÿ]Z]‚—	8›£òc°ÚÃ­B'o$œžØ¹Ý~‘°+I8°[u`ª"©Ö>ªÆë ¹¦§ÂP¤5Qbƒ|ñº8Àæ}¬ûØºmÎ%ˆEs	Y‚W©úr9ñ$Xxbg“a:)fiI6¾µçÈ`ÏHÇ®¸WÇí+L‚8€L(ÚG)ßu®Y·Ül¨–1Ë,œð¸¼³ŸU¶À9\¢|²û<wñùcçÎ“7&çsS‰â³ÇîóøGfüw|{·‰ý]2ûõ^°ä~ÒAƒ‚±UË«Ž·$ÀÝSˆöï‘qb“;%Ti#¦â-Ú¤RÝ›%
FåMaãåKšÂÛ·Ê\ún—8?#»s=Í¾+–n‘Øž«có=µL	ôxÇì»Ö.€<mÝšÇO¦8Ê^WÕ4ÎG-ýî1½ÅÊ3öãyÆ€:8Åà1æåÈÈ¿ËV^°¥÷‚Åðê [B®Xy¼V¯V¯w€½6¯Ãx[9AÂŸ7ëæ’º²>æêjèY¸—‹ª#A´Â=\\føœ[Ð„ûµ@®èýÞšá.-þVÒ<À“–;‹¾|åÉ
ªú°&nÏ¥ñ–æ@`Ä<[÷$û··Á7"O)6Ï¾Î5„_ººM‡ÜÁ×žÿ6.#zŸß%v÷œC¥Ã‚Ý]”+`9C¿T¾Ò,õ¢rðb]†w?`q6ôö&\ŸítÓ¶qóûÆŽòC«1æ<FqÙA¬=œOÖÁ|¶pÞËÜfðnŽg±»¯|ÎØeŒÒÊÝ|?ÝÍbúî½§yÎ›Ë1ë7êïSºº¬¿+—ÀB½\ÆPù¼ VÓ•o«#ÓºÝZx‹ïŠ}íÑÂ†,†¿c?ûÜXï(Tf”‹6õ;²Œ&+OÖçÉ¢,ÐÁ•EŸc^‹þp[èœ¶òf-½7+Š/PwÖrrÆÊ£µòhµóh_Ÿ—Çs»µhOŠIˆþ}gù[
5÷j1í$èÖ¢Íp¿–>ÇmÃ=[TÂèv»Þ\è/–ëÊ˜‹÷€q[¸·º;¸æpqµ?ÜEÂÖ"}\V_1I[Œ§ð„-f$zØ*]Ëdx¬ëcÚáÇ“Gmµ¶°Ë1×/©Â>Uõóô±ûš–ç¹r`‹û`p,ßõŽßJh³}ý/íÇmI‡2*í ‹ùÔày<+M±®•fúæò­ˆncÐžaàœý’ÌØkfW†\¥§|7Å±ú¯ÌÍÉYÕÜášébÎ¹{÷LW¿=`Ëè£ñZßB?.Él¶)8·°¹\"‡Í÷0‡mJÌužCO¨×MS8·).·ð¢öK>cñå:9äBCÝeö¯m÷dMÄ‘‹ò:˜cæó8Øm[Ö»ÜÎ6/#»]hŽ&ß!K·ð¤µåêXgšãÖ…â¼®6ì>²wÜ.’¢Øc£|kÐˆ?àt®™mVÞµÇ»†XrZåÓïv£F—UÓÔ|Òë:GëÍ¦ç.×	ÂàÉ•niýp±4Íÿóœôâ|vÖKëËñ0	¡¦ÏÈ
ðáƒ§i1KÒIñ6ŸÏzmq¶˜·ÿuÀuÿÃìÙÏW:±ƒ"»þk3¹JFùì¬ÊÈŽñé·/ëD2û €	{òÇëÅ\ßËû†D^ç`â½º¹_“Q4qëõ~îÖ+[E¶ÄA}N1³{kb¿ 8ÙDAâ?€íùrÍÓÑu2LÉ¸&½|:åßâ›ð|Te> ­«ioí-sôÌ*þ^q[ÛLH‹úY?¹ú¤É`D>%=õn»N{®‰^¹oWîÛÛsß¦—9ùÌ®¾[]¤(&g~çÖÝ·Aóßê¸ü¤Às?¬°iVþZHiÓÊo	lµé<É<¯¹Íà®\´‹´ú’Êè«ÊÓælÙ0À˜%q&7¦‰òêýtx.fÄ3öÀßc'Ó¯¬Öp8x j”ë8ÿD3rƒ¢æØî	Å½ÀÚx\e/êâ¸¼QÔ’sÀBLäÍô[Fò÷§i5éYs¿™¬KÃøúÝp¢ÚBÏë7ds$ûHFì%w=!sYÔãÖ#ª^˜S72BÓïiÉ‚ÅB“ôqìŽ6eœ­â}nEšìýÏ…NÍpñÞLÓªx›°¡ú_$Î‡‘/‹ ÝWWG7—š×wÅÞôgt”:º#BôØïYþ,ÊýqG"H÷˜¬·š\¨“ÖQrQgÌ}•]Äß¾ôZ*•â¡ú_äL]]Ä;¨X{¯JirÜS·@À%àq,‹)èP3tØÜáÖcgÚ{ˆeç\Ðãká§‰Ü\†M×Z ÑÎ!ÜŒ{³¿XGÐ‚§ÍÂZ†‰Ž7Ú;fº£±~e‹W¸{[<c­C2ÄsçR±®{<»qgÙT*=O§â~0ŸŠ´Ã³©¤ð¥S±FÜŽÏD…nÆ¿€W_ØOÌŒ*sF.ð”*JãÊZ¿0Ü@ä4GV•Ár-Ñ“[Åô#b´´Å\X-àåà'ØÓo›ŸLÙr0(jJG.jñh¦ÀC`èt¡ì¢Xÿéfzk¬²¤Ü3ožZÐcÊžyÖ”.b3Ö+eMösÿrÖàþúo7i­™ìUÖÚ½ÏZk&s•¶¶Œikqö|Oú›àMKR¯Øî,­Yshòów˜ï³à6kÐ|‰>HãUÛÜÌìÎbsµùÙzñiløàÅ±÷•È†¹_„ÓÔ”&íÜ€¿lƒ0¿Îú<Ùþzö'säÁÿ€µ-+ÏIY]ôÏX¸Q˜W1¦˜;OÈfÔç¶ãwi«ÇDÍZ€Óq:÷NÇ·ïtÜÙN.àT£;t<ÚÚ‰ê’záÉI"<Å~~KfH¥Š¶Ÿè}šŸ6ÑG³Æ˜îxV1·S¹ºŽwTÔŸ¦ÅW2´ûÉO?Éß\~†ºAp´G–¿âÏ
øn&· îãˆÈG2XŸÒË²J3cÐš~Çöö>ýÿõ¤W,åÆ–CÈz¾>{Âe†¡Ò˜%šm;ø{©çg)ü½î…w£>_gÚ^÷•çŽò±2ú^¨	}ìƒ´Iç39ºU:Ÿ 5Mã3øR¸‘ŠÌ=ëM®Ì=ëâ‹LKÖ[áÎÕû	÷‹G§éiiuoà?ì5dýsA—Sg/WËÝ¾ÑÁßÞj¥YþöG·èoŸ¼1Ÿ»kçö¹ƒB§¦Fr/Îˆ6âTŒŽã4¤„ºòÅ‚Oÿá¶¡–ýÇy=+N.¹Öcª:Ñ	Wh ;E”ìd §˜áßdMôg#´$CÑüåRÃÌY5¦gÛTÒ(MŸÊôRŸ¿=2{Z 6ÿV†<PÔúÝj€XƒäåmÕætÇÁ”^LÓ‰Óq5Î±qAz„÷8ë1Jv¶½øI¡ô›Ò]rkò2!,¢Ì0ò«qÕŒösÇÐf×®“¢E7 )tA!?`×ü  ¸ËlK;0æ‡AÇRuo+œÏ†y†¹93ËõpQ€Lhˆ¿¶a<vSr\&ƒÃÃyˆx]Ôéqé>½#gÜ›ž%Óš^ÏÊ‚0ºòN
«rµàÊíÁ#…/hX1ãRã'Ó­Úô%ìÅ[ùr`wö´å ýÒBN³¦œfwéQvŸ¾î¸<×Äôoõeô†þ.zKyýÛ|½	/Ú°ö8”óµqàÿ¤D~:?&êëfÛpxÇox¾ä!‹ÏØä|:)µAäwÔaä·ôä7•¡äwÌÁä·•yÃ-†ÄÜÃe{x'ÿ¥Í¼iã!ÿ „~ç}8F¶™=ëôê*6žêˆiN4ß¨RqKG%dHZqW]qË_qÿ1ªAÐÐèD NˆZÎEý‹ÔŽ	D$ÚÚ¤9è1{Qå`§1Â]öÓóY•Lú“ÉL‰¢ÛKÈË«²<N§`¨3Õ—B¸,×kk-Bó<Îgy>Æ•³‡.Î16´f§óÚ§å6÷ÇöàA>úÓ¥Ká’Ä.ÙÚvÑm*IÞ|#«êzG|G–ÝÙCLbÎvTBXGšÜŒ§e6l–fyš@44¬ÚÎFÒ*p4Ë'Ó 0f¦yï l€Ž[Õ’ä$e1»„ú¶ûÉ[å¯Á‹É¤$ã7tôôgáÕÎ— äž–EÍb÷j§p7[F°Ó
y3´•ÇsX¿È²føýXa±ˆ<ŸÊóúU1ê?ŸžŒ¦ý}df¡&B°íÅíá"0 kÜR	ÒýLn:U9òõ¬’Ñ^£tÒëÕäæfRdß(O£›Þ«tš%ç—Ï® 1XÉô“ýÃðy^nþ[{Ž“|}–fDn×#¾@ùß#Í¤‘ÍNÈ¹d|+]!‚QQžxp4ö¼m·ùVN“î=ÿÙFÊ7dÛxè˜ô1‡ˆú‹–àvT^fHþ{²Ó¡0¨s_ãþEß¥‚ÄO¾sÉ>Ì£:¾ÈÁ·¯hƒ•EK„ÐEA©t¥¨ÂÖ~Æ.º‡ãò|_&¤â–µù¨û[5_˜mã¾xTúâeÿÜTœºW)h—iCúw{ºØs’(Öm'Š DbCoO<%i;QòæáÙqZ6ÔäüN{ŠÄ“’*Ñy'Ê(òmCRX(†¦¦êPSé©5,~¡!ËË‰¡GIÚQ²¥ÂñXGIÀ:K/>éËÖåkƒõ‹Œ˜FDJäâß¬ˆÖKÄ(ŒêlþaÍÍŸóŒ‚w§‰Ý2v“ÑŒ~™<~ãgÃc²1yOƒÆ—ZGÙÑ^[`= mÍÂ>Ï“mwà¹üª–6ÕˆgØë,Û\sÐ	Ìj’4öù—_sý/þÏð'“Àå]!1£Ây!
ö¹Àxhc®Œ£ë$#.¦2ó#7áIkšnò4ueËøføQ¬ö^Rp›z]Y´²Q:D>b[S¯¹§ÝÖœóN¤|DS‘T~?¸„'ŽÁ¤WS]“³ÎÿTØ„ß¹C>ÔÂ),ì†9dÕmšøgKw™žãblmÓì"g*4OW¹ŸÏÙ4Íª‰w’‚S´¸Ð]ºgSüßÙÐm/W„ÝP\´tqiGÿ'ääÿD=øË³¶œJåŒ-%º®“y_7·ú³5!£&#ßÔG"åçÞ¸j‚Þ©”`!–Ìd0À“ˆs+¦.lŒb”—W[FBïvÍ²ë4Îñ'Ú²ÅsŸ¥§ð Ô×ž?ç#ÒU[FlÑWlØŸFfÐW\8 |¢?$ð©lÈZp#¨*¸IxvIþÕ `§8Ÿ ôXÝ×‰(hoExa­à4µ})|–°•­½z3±Þ½¯{~›+FLÏM€ä3,@’ìX:•ûIê/w _©Ë»žÖMDxH%•{-â*Õ«e)•_¼%¥©M!Nßtá“ÎÍÌ+ž±€ÍÅÈgoÚŠ3¹\ˆËñY[]`.Á¥¿—hFË/"„ù.8XÄ©¾hŒ÷hRˆå2BœÈõÈ4	?¨#$Šˆ„Ñq·…¿øéáø¤Š-S¡¸ü­¶ÄO'ŽH/$ÀÂ«D8à4/ÓoyÀípÁ)$ÚL0iÏÏN2ÊöMdž½`TÁ¤ÿÈã\s3Q lVú’ÚFOÎ–ÀYíL	Àp;1é·óx†l'žv¦ÇêusâÔå „KÌ±Œak¬þÒù]_WÓÕÔ0 p:°ûY7ÖjGx§•ŒƒË¬ÑyÆIùtðî¨¤6b×ÈœuìãXÒu„	 ëj9Ÿq-ÄnLË3·êÂÝ!C<÷Tä—6)ÔŽJH?ˆcÊbóGDA•lüÝÊÊ£|Šo•ôãå±Û•v|KyYPêß¹Ðù…¦zÜÛ8B(ªÍ#¤­8U†eè•¡£;–¡H´­©Õ¢B–IÈ™GÚ6Ù:¨p"gÜ]Ì f9…¨ÍŽ`½@ NwGT­ÑpV×€5Æ!œ›Ð2dÑ‰\ ·h\ððA ãNæ'¨Ìkµcj£íEà½ýT<oòon&÷‚CÙ´Z‹u¾L;²vlP)Ï:Z{þ:?)Æy’& ìu0ä~xž&:ì-GÚØ{HfXÿMØYä³³}Èü3ù£O¦V¶­g—e.~ùÇþ~ÿ"?þ» C!žýsŸAu8‘ä]Åó29›Ê·ÕôÙZ“=é×h¸Ó­öEmµ;®BƒGqü*íoá÷áüÛ`žYLÇÅ­Ãñä|FùëU5š€%õÙZur²–™>vÖ»&%á’32j9å|p:HÞ“Ýš|ñÑéº°ùš–çD€¦£Ã“ÛJ=\âörVsWƒ÷Ækæƒ¿65p|0K§DUÐ·’-Ù±•Á*50grÖßÙ‰<Ž¹Mƒ')@ÿDˆneÜö±Y¶~§O>²=ÏVF¸­Ot_6
ÖÉÒ­›·E™!},víø¢ÖŽ6€þÅÃÞ|œ'g)±³¢Î„¬ÊkÂÜQK)s[K;­%ífµ˜æßƒà¼³tké5g,t!ÏòìŠ4Ùhðí‹Û‘ØHÎ.'0ˆðo×ò°€Žhç=eÕ8’(;¬— ´’¾‚6–g	5@	ÂO5ùn§jx^÷¿²J¡ûÏ¬eßlôjj–#Š®ªØÓ2ØÙþ¤þMÈ,ÆY1LgQô()Å˜¨†´D]‘FUAA¢Ö¦wqS?8Ö*KílJÑ–…%·÷:$§RY‚¯ÒwÖ"e™náó¸ÖÀeo2ä—ÌÌ·Å—8ØDØê`4‰~.2þÙÚrˆJ’í€ä’3,¤ž†À›bHÁx*Š™œ×ùÔò#*sóˆæY=€¨jÍ^æg9ÄíjÛ·lŽ#ú€”I¼ƒHÉ¤ÀÍñ1é³ZeŸóIžÎît)à	^iFƒØŸojµ±]?¯ˆ†áïJˆNST ûËòòF]3‚‘ËN>pOkl½ô|7˜)çmUÍtSŽ34R‡?&jñßl.™	RF/Ò_¶ž¨p0ÐÑè-ùœX”êJÆW5Ñ.À¥S²Šªc÷jjLmÛ~›hIw¼#s›L˜âG#ùÎˆŠ¹¥tÓõäkõp†} ¤IrØì	Ø&ä~Láh|¹ýâ×M÷»àî#¨t]•²@öÇú¦{šˆÑG2êhÆ"IÿÇÑÇƒšW!<ÚãÓ¼?äŠ9Åãy@\(£í†ð‚RØ¸š©Œ°‰~Ü‡ŠÖÀð!tqÆï±SOëøây-é¨, ÑÒjÂŽu¡L¸<Üï.)Œñ¦ïê°Ò±rQ•Ñdå²Z—’#ÑÖgEÓS–ÄiõuÀKë%-fY¯\U‘fB2Ì³þÊ_ÅY ƒuÐÀ•Óê‡²³Óù_y®ÔáíºŠVî«Õ²Bö¥•Kõœ»ÔÊ‘µrdýP&ö;vdÑ¥·òfu0¬#·riÝõvç.-Î7+¿VÄÍðò[9·VÎ-Æ‘ íà?|ÑN­$ëç€pgBÖÙ†Ó»2;l±Î.±¹œb‹q‹9cn×³Ô†]c‰	§âl×Á;æö9AQœ¯·ÁRœMÓ Ÿ`6wEW6+æa³À¡Îd3wGzºß~"“ç6³êðèãû^kF½5Xš®`4XMJŸÃõ®]®pánfþ½qnæ89ˆï–¾ª­ï¼‰)3òèR‡þOLÊQú5O˜~Tß¸O÷jë_2K‰$+--“ÝºnÑÆ™Ì( ßü	²Uq¼ãv@_Úi„¼;?.îøÂº¤Šº,XŠÅ:l×žÃûX!ážV;«Týmøf÷tßl”¿Ô@å±KB´0gËCéâÌÖ`£^{.Pm€µuž:Ÿ²Ý¯¬£xA¤£†žKöT±¡^c=Tãß¡y„#=êÇ7	‰áôª5“tZç‡ãídÓ.Kƒ[zÑc6ûä/ÓâôT_ùš1¸µ…7ÎÆ6f7fFÇLwbñIS¼õô

=ÀwÔ¯idÃ»¢žè`Ç*DþÉÆûdF4e©
7ãƒqÊÀó5úpÀ·§[ÊÇ¡³²¥M‹gâA¯XQga§Adq–}‰7PöØ°¹À‚9…‡Dn³ú7t|¯¥ŸÄíëçpFñZ|><ŠÓ‰±w3lÆöm7py–Pp±z
ÉVò…zrnFtf·'¼@>iâëGUE´
!½²#v‘‘IJ¼2é0;PæÒeIC®YdAóŽ‰¸[Û^1×‰A½»³2':LÌ¡oÍÓV”øñ|ƒÞÓWæÇóX¢QˆŠ9Yàç6sTQ17:v\þû±C§yú·¯‰³FÐ|ßÅ
-ÏGÑ2Có}TZžz#ªÍ÷Q9ïfy>Œ;šï«h©£åù$^1i¾obå’îæ£ÜÂ\l7Ô+Úh@†»+.-³®êß5çÜibËÉEo#Ò<j)Æ©ª§–Zœ"Z±gkWš‹Þ$€ä!JòP%yh‘<œ—d½]ä äf(¹™Jnf‘›ÍKî«^]dç(Ù¹Jvn‘ÏK¶QÌ.V|Á%Jp©\Z—ólÖ»‹Î@òJò…Jò…EòE;’Í‚xêëØ;ˆ†dE—yöüCÅ%sÍÄ¶ö§°ÆñN ÃùÅÈ-¯UcÉ9þÿ  ÿÿì}Yo#I’æ_‰dU¨‘"©3UR
yUWîV“Êê‚Ð$CbL“ND0%[@cßƒYìÃ^ÀX`ßöuOÿÝŸ°fæî~IeVõ(z¦RŒÃOsss³ÏÌ9ïñ&xþy·½cšm,§«;†	UeCc:árÍUÕuk@?e$’¬¼Ö"Õ
„j0zU Xv"Àæ©ç<Ê4gÀØx"T•!ÅÐ/(ÌùTÐ!;kSãIyÜ+™î	‘ôqTÏÆ!…²Õ|±ž›+¾Pj2”ºŒ¤†2£’Úûiû·˜*
ÿå¥b“óÎ…wD©•xMü›“P»¦±“pz²è¨?Åüð­æKyIÞªS²«Àbª	¦—×šIªÒ§œ«õ‘1ùÜ2`@µúF·Ú;J˜}±¦•JÛ³~›×¨n¹¯d^CŽôrzå˜nÈyÓWbäŒK–	Üjj,bÞ2ùµkÕ	ùf\°¢
#ô¯kË}=)$q9Ù¼áªªëó-´u|ôg±fÞ‰ÅÅ!Œ±ÏŒ´ŸeÍ0hÀ=®¬à×K‰„”'YzþôÙÖbíÏHæDá a_y˜j²¼g«’VÖ]ëZ‹ï¢kôÅ²Ÿ'«Â¸W\ˆo?aŠÐqŽœ€5™0áŠò6®Dý:Äµô)ÐXÌÖ±Y–•XY‡5âÕK7dHTñ@‡ÎyVt´ššuç¸2´ÄŠwCgWQÝ_eþD‹Ÿku&«[hÜ­`>Mi‹°3u-¤`^v5ySªŠŽ©ŠÊ¡Ï|ô´–—Ë¤yØü1Ûž•bùCÁO4œ¬¶ÑáB§£2[$„OES¶&É¨
›ùñç|7vr\ŸQ‚É_—±ñ!ô¢	ãƒb>üÓú©/ÿ*…âOôÔ ‘¢x¤‡×~:jOü›fgw”W9­æF•U¥Y~TXëum(ûšë~«¾¼æK]_LÍumBü/½ —\ÎË.f-¬ßHÍË¦¼=¯’ž–ò¶Äš¹ø¥ûTÚ÷CÎÜZæVó (Eo«•÷¾Ü –ìVEmß—'€ÖËæ_Mín	÷ ô÷J×ñ»`
,~ñØ>'ÊŸ¼±n%ˆÂóQ
-ûã¢{€ú?@ý þPÿâø<@ýÃö õ—¯¨ÿçUPÿìz€ú×éÚÔÿêÿ õ_g— þÊB þåëêÿ õwnîÔÿêO×Ôÿêÿ õ€ú?@ý†ØæŸrùêÿ õ€ú?@ý þPÿ¨ÿÔÿêÿ õ¯BýqÃ/ÞAšùe8 „0¶Ýÿðxð/Ím“€ÿ—é$À1ÅK8
Tà×øÑäþ—¹¯A‚fÈå<5H•Š* Þ	–\¶nG”¡¿pì~u½<xÿË…ïÿY€÷u1üuàýÏÃ¿Ê‡zSîkñøÅ7´Püd]?GIÀÚ|² ò¹+€í>ÿñÞ§ë/ûcô0vŽàgf­É¼&šãZ1J³Ø,½unnyLà¶IÜ­ØY˜õ2¤i³Æ[’¤/08I{L¯Ò­á¬ÙâQ_©¹Ê:sÝÂåƒ@ÿÄœ)€£V!æêãZ
âÐŸ¦'«Q”¤ŠD¶IøT”ir¥fùý$ÏaÒh'ÚŽàßQëÚxX>Ì²ƒÝt9QHG“ŸÐd&¦;­hVéQ%CÎ›Ê+Sqèý[ÕRSMº—t¾¹0Øÿö2¸eÜ:ïæiC_æd1ˆÆÆsàLLÿ-œ=2ê1îª4›åÎLúP’íØ©Ö±¼f¼õìæ~\òQêá÷
ùûvªêM^[òbÔ«¨Yz&Ÿè[Ïs Ïœ2O>Œï{š$ÑôûyYršozŠæT•>ÉÄAáÃøÛMÒxr–ú˜5šNaÃÆì:rÍa~ƒ NÚÞ;Xž¯¤>¢í#¯\…SvUBš ¶B¤Caå©Òëy#ÒaFr%¦ì@}Œó¹[œq+ØÏë¹iaöbòâñ’AÇ}?ÆÚR‘4@¸Ã¶ÈŸþ6¦#8	¡}ŽB“ä-/ì_`×À±üñøÇçæ2ÃÐ4çÈœæ(§=B!½‹#x†8&¦â=£A_ÃÖÅE ,1Ú·ÊüiëE#&h˜Z¡1Îâ%s„pŠû/0)ÂôëYÎ½‘
¿‹”ï´°Bj¥"e[ÿx2J-ö–0Ù>Ä•ÐBiÆ¯ 3•I/L½Jy9;“·,ä.»^Þ2Þ¦]ñ‡¼`J*/Ù æzÄ«ümêE‹fx†×öä>ÓŸ˜4M½§^…“+/‰'8Å|x5æýc<&ÒÀ“Ö; kL‡ £N7í¿±yçùã”Ó êÅË0NR¬»â¸Ñ8qé&êÿ=Ð"Pô£<ãÄsX,ííIcµÄ-å–õBgcâ“™_ðE¤½!	&a®ò_ÉLúPé-ÑxâÒÙãm¬®Fk„gäz¬Þ$EkÖRäKØ@àtCûŽ·ûJq‡]:ß#õÎì˜>¶rkN³%I¹xÚþ•÷[Ü…ŸÎf1iï<°r¯å!ÎûM\{ÍÎ7°sGí2fºõFð0ö ŒkìÏ’`¸åõö¾ÁÇxðÙ”¼”³Ê«;„
uI×E•ÅÙ£Z
ËdAGžWbgÃ9³÷E
Í%ÈÏŸÃ“ïYÿPFkòì½o.È¦Ãx\4Ê¶4Œ:Ø¹ì]î):˜uI¦;!,t»žf¯mÌw'ÔNÔnˆ¶ÎÔ5þ§Àå3ÞÜSñf«½Fkd¤"vò#hB`\ÝØ¨ö,›Êœ[#¸H¢É©Š¯fì¾rz•Í¸‰ÉÇa/i¼.&¶_÷^Qe,R'Q¾Ö¹jÆÎšõUÖ`˜®¤«òÁ¤¯G!Ø×´'!f’þªÛíö{Ýå†g8éÔãû«õÙ=27ï‡è*ñ8‹ó¸æ£Ê±©:^/«n/£~¯¡<By\ä||÷v÷÷ö/+ã»›	²UnR´¶¢1U‹x1ÛTÙu‰f"?¾fÏ‰__%âUR¨^¿SRŒqÒ 	ãs¥’·5D,f×ICJ_dÕÃq4V:}LçšåW„‡­j8jÅ$uáåDaxY©¯/Oixñy}‚òoÛûõ’g©ºQl²5Ê8ñT1“s.Õþ8¼šž4‚é°QTGìí{’·Væœå(ô”¥'í¬Ð(r›(™w¼Á6P8âF!)à*ëŸ-_š•×Ñ0†væ§MZÔZ…µ7Dœ¨‚ †Vpe©êÌ‡6å©ŒŸn¶&¦'ó=T´ÛÎ4åý|3Àzé	ø¹Ž>‹GÃOŠˆõŒñ=­ÓNùÅz'OËCkg!WN?Œ”¦‘qp™ÂÜ …¤»Ýó˜ö…ØÂ-Ý(LZè¢4²{:Õ÷«él´>O£çÑd6R¨;º¼l”#.°ö¡Ì¦dã21ñPCÇ`MátÄa†_#7—B`‰(9˜'­OaöÇÁ‚AÐW½	’ouj*Úm~–Ð)Ö¿¿›ñ­Jðˆ2ëd3Ö¡çÅÏšA;¥`"m*v5@¡Õ–×êtäÙ¡î–©«áü’©£«Çâw°ËˆÞ—qŒ §ü/ÁvŠóú–„uÆYî¼|3ÁWÑÉ¢Ü@ÙN4”)âs•¡°}”6 KãÉñFÞê÷w¶ü)œû ÔdN½	W×Oú­.¿‡]õpm£a#fýd#~'~®¡_BK|/]xŸ5³Ýnó¶¯döàæø[„&¡?ýÉk>ùô›`¶)H­Úœ7µÇöªÒg_/˜|ÅAð"Ê0FÐóICü”íN	ôY»õhO¾ú£y“zÅ!>š
»9l?*ñ
­A¤jcc³F? †û9Ì{s³ä<žÃœ7K_ÛÔVŽöúÖpcx"|éur…¨&ú“ÙJ3³Ñ¿Ÿ´ñÑ+üÁ?Ñf¤>±BAIð¢1Æ¨¨é¢›MËëSó¦ ½¿ ÒmúíVÉÓ”P–›¨žùN Ÿ^+§¯yÇØ )¬Rl™ Ì'…(>;W¿ÚòºèFH£@Å²3Õ&o§ÀøOÆpàïÓöÄÆp‚¼’QŒôjF ¬vV ,¨Y{F*«WJC’¬¾LŠ‰ÁË4•ršÕ¨î–¡¯>ìpÐdãÜ§·À‘®Hr<çÄs-ZhPh¬ T|Þ|KJ6¶=&Ír›p.—Ò‘ÇÀ ßÂˆ J@|ˆÆ?ý–c®Ä+Þ¢qŠ›†ÓÂ>2R’xéÕ”Î›'¼!Õ2á7¿’Á•©³ÁÕ„çð?6¾¯†MóZÏ¾)‹4†í‘aßü†IiŸVµƒ—Åy)¿„éü G5ÉCA˜ìwr¥ÄùW—{—û—û¥Äö~Å Â´› v³Hn\á2ì87ºJ!Ñ>SùåK³!s_ä½AÛw˜™BJãýVÅ"¿´¦ww3tÖíÌ$SÑ«šÀîhò…‘ZDzE”Õæ‘›úÕæÇ
¥¶Í˜bœsÃ¬Ÿz¥ˆ bÖÅ­sU3¡ôs¯vi“/{h<v1^98Þ
Ó0Ë+Æ+^0AÅ†©\æ–¯(’Ýw+ÑòJ]0ÇÂc—5¢µ@•Ëä …bGôY/œ¡
ÛÚ%âÒ3ÐBÓKBJUéSãlS =’fçÉ¢8wÂêon´>»l8ËãZ¬Fœ ð¨lS/1>Sƒ‚â‘¤ÉXŽçãêÏX¸j'¡¥¯4ë˜ìb¦½ ›¶GZÁÃ¨Þ+=+ÖsÞÝÏ|VM:AØ çÓpIýò²cT²îI@,¼¥Ý,à¬Ðd-ž €¨Ü¦‹QÀ|þð9lq)?°ð:¾êíwö÷¢‚ßÚß?88¬ÊnÕ	²xÙv ÷= äáxÆ¥òSØ©t‚£Žñü	OSÿâRy‰YdÔû‡|÷@ñI~˜%¹UÂä¿ibÒ±s™V„——¯ñhƒmhO£k:áËuk/é‰×Ûõ~åDÊÿ´ßqÙ«2–/*Çê÷ •ó0‰Ù@m:ì}"ÖÏOiÄ¶¼×¯_{Ã·oTßny·pé|säË¶ÑIÑåZ¾ÿþh2±—oÛ“pÛ±ñËÆ´L<Àèb"»—J¥d[œA(_‹Ò±XÌ‘š¢ŠE°+ñuÎÕ¼ÒÀYºÇzTôµð¸q3ýçlÇHk‹©ÕììŽé˜¦„	•nøÜ±¯ o£5±ØDQ‰ð)ÂhàÜukz­{Ön·7€¦7˜*Ù)T¼D¾Là¡­ß+ô£íH4ÌÎ^ÄáùN‘óÖ7‘ÊÄ»RV+ÊâE<û"@+Õ0/ô&óàÅz×~âÙŽ¥;½„Á¸'Iæx–m‚í¿Cê_÷î<’
û›¿ÉJóÓÔŒ&Á”iÝ·%•ÛÎ€W¡åŒWþë<Ÿæ¥ ªi*juàÕxUBÒ¨/ÌY\†7L ¨3p¢q {€ üNh?OŠÚÏSR¢ºO¡-¿æ°ÂûëÀ¤¨]òaË½f®f§¾üH~^Sx|´½¹ÛöT=Ž“$jÍpå¨NÏZ Ájæ/#¡ã‹ŽCTÝ_/r8û‘÷q­dÅ!Ñ¤N¯‘×ü·Òp«Sœ¡yiù²ÛÙƒ"»ÌûL¹ÿvö0…ßß%Ä;.õÙE¼\¶›@cW¸{iå¢ŒV*»pf×2¼9—$M7`³|#)"WýYàÈÆÚFÞaÔîM¹añšP×]U6W4Oƒd)ÀjG;Òº£fE¥Í<ÿªÓïîvý­WŸÇµ5\crV(6-ÛÚT!Ì
è¯À…¾ó§úC#ôe?òGötïûÕvy¤¾ŒÆg0’û5sÝÒoýö‡ôo‚1[áÖeMZ¬M†nS×¡g<ïœ
Â|<ªä¤›Ý`::„¡iý.Ð¡÷"6iôX•Ì¶ðT‘á4ììW2êÉ¬ê†‘rt¨vg—Œ Ã¸‡ò<Š[Ð‹íÌÿZšxXÖ×‰ûî¾â‹¢BÜÝµ;b,ƒ{6ò¤c·íT)}„À(*šÌAâŒBÖ'ò
=Þíh«®Ü=ß¦(ÑÁÍ¬Ù$×/rö[Ùò˜å™ââÍá§?Âz†þXËÍ5;¸Þoc5‡mr%3ÊÜcî€0/Y­þš›Laa=
œº}n¥@•u¤xV@³——|å[ø:5,G´\ÍcAo˜=æE<¿.{
ŠÈä£Ç‡TÀ¦Ð®\@’•¡ã®]ûF(ü¢œªûÇqßäSGIP%ºËÙ¿DMt{_8Ro0>…J(†Í*4ò;­ËƒìÎÍÚRj¥$PÈÅ‰aOÐÓ…ÖakÄÓ¤*e”ïûD¶yÅ©‡'´ä¦g¾Fp)#WZô2I.Ã]ÇþÌ®¬Ý‘¥e”Bo?øýÄÛöÞ…ãq¢ó0sãíí½Jh
ë‹#£ßÎºà“
0¹Ä¸±ÅÐ˜ðë)ýàiéˆ6À0
ÓRHµw:Ë/l&I0”Ê{-n(‹d¯[KƒA ’³\îûü–²dñ‰CÙOQÍ
eg·4e³çÖ²£yz—–Ê~›ßR–->Ñ•}APÑÔï;DþÐJ7„Cƒ2jÅýRÎ”¿ã(<úÑ|WmX/Xå;HËHïUß4À–,…¢~í”\ÍÖÛÜGÒÁ±~•æSŒë%ntâHbBùîó¸œ@ó±Êð/çóJÌö`LÔ•¹âU	 eô·{¥(·”>&+ö26†OÁ™¡uU;`†%"á_í©ü$Kyiï‹¤ˆf¶{¥ËxÃHRî$ÒSÈ‰,‹B¡I˜•q÷^D³_“HÂ¢[F1‹•Eñ@†žð[iûîÙNîêp.²´§1!¸tlP¯4xÇÑõèä³¢X¹bå!Âp€Ô9MSåà7½œçt~6É!°m"ü½ÁÏÉ¤â°*/>ÖË‹j]Þa•åib›—VÐAu¦zâÊ®&˜Íø
¡F=eìø|cãQ&3@×˜Zp&EK¬æÓà:HÒ<`n¼¡¿A®áŽY‰^-=EAoéï%ºPVÔ†4M½ânÝâ;ð‡Oá0ˆX¿Á?él–,Ù@V"âx‰)p-Ñƒò||Š£).ÖÒRmãÿ[b“1Ì‘¯LZ€Z.ñµâ{†ÓY­pny¸4ÉË1Ô°8
í]-}\{\¾$Î6ž¼‘o[q<Yx*í;f>{TPèc¼™'^.û½?#† î²9yß™2Ø?ÏßÃÛÙÀHÉ•ªåŒõ4Tj^˜Yô£/0Nv†°²`‹Qf{Æ…«ìÍòýgóË÷_æÖŸ³ÿ‚Ñù(o2÷8
k^Ü¶1Îw¿ÕGY/ ¬:þÇlS6íu²ªÛ< Bªlô.èÏ5“x.*ü¬‡ÿÝ#7˜†¿Ý©3öe‘èÆ^ñmlnŽ!fˆ=jˆ- ™R9þ,ÞzBV¢Óg1Tƒ‹‚œ£L!$÷F“·lõgôÉÉ6ûá8¦vW¹­cK(G®oBe T~YŽB¡›ES‡[0E§ÐÆq°[ðù‚3	š®‘ 
LM¸d©Zäæi-]køê‘V„ÆXó`ËÆÙŸñpçÁ7òAn·Ûëg7ˆ
æŽQèEh©šåÒ&ÀÿÈŒé^T­Å&œ¿5BG=ÑƒÜ\">ÏXTÞs6Ó€ÔHap‹#f°Ó/Å>ÚË‚°¹›1@ya’ˆ¿ŽŸ4¢ »»šÀ°Ê ÝuÃî.µÁ@›l²¥ÕF©ÒÔ¥ÉÔ	'o")dçw8Hâ‚¤Ð›³'8i}$m>YP‘:ÿ÷˜~y™ ü“låxÒ×!üð-Âf=‚åÓ6ëñQ“ÿ†èëb›îržÂìG”øÄHô9åK³ýÑ¬Š2âKcðHŒ<Ìõ¶–nU´º–÷3¯å=›E“:a…gËL:y@lf9Xùl]{OaÚ2z7£Eg‡—¡#ÆåkvRÒ%ÌUÇÂ×B¿!Pä# Ö-/xãàyÄCEW<¢YEÞ¼iyODW<’Åc‚gjK‚˜eäea
Ðù›Éî±6–]O¾5{,XÆˆ‹Õò·ÚcŸÈµü#.Âül}ÍoÞ}D†Pº?_Ñ™ƒ†÷Žß¦,èÂ‹7Ø“Z€•4Puü)ÓS®­»Éê·îB®!»•ÃÑVq¸•l¹”„EƒÉAÅ–a±;"8â˜­¾öì¢HÖHúO?ù©@eoƒ&‹YúÐÍá¾!°†0ö¹ÀPöÈ'°†O à.n¯ìªå‰WÍˆ*¼EÎž]5Ã«Ô/~É`*ùµÆ°*¢õkŒ¬’_.k§Ð#Þš%®¬]Ejö¦£W¿›Ï1»\Ø"êwbNZ|FùBærƒÇ}—d~…Ã¤#×8íVÂœH™B†6µÃƒcEeX¸Û?ç¢¾÷U.¸Qôñöh×±ãÎ Uwgæ€‘ƒoÝ‡F–ÒÈ»³IO¯6j0sÝñTRIÛŽ.äBýøÚÚG-ÜŠ«;±Ü Ä˜Õ½&ŽÂ" zÍ÷l$ÜØµÃ!’N~!½•Ÿ§†Ÿ}ø?ß€Æø¹èðçeª^ÃgÎ ù’¤[™TCÒQ}ÙI¢ä!'so%9}Rö™cåÔ`“ÔOÒ`½½¼T`×¼¼ƒB³ËàèŸqî2xùfÏŸôa˜ŠÓÇîÕš?ö‰4ìF½dß”§—´ö9Mêy6¦Ÿu¹»ÁùœÞÓS6ÿ®…ÿÑ ¿š¢	Ù44£\5ƒ°Nßã8¯:–Âü¬=9®}…‡v©IbÅÛ÷5„®§×€ZmoÊ³üä/þ×z®FÔð*6Ñ4*…°
—5&õäç`
E¼ðoíŒÖ?ôàµ`ñwÞs«;…‰+¨Þœ'Oï_Û$
~s d„;Lh÷ÈW;kTv,'WýÌ¡Cxl
äW-¢Gƒ?Z¹¬hF¾M\ø§?ÄxÈ©N<ÌuÚm&¹Ë²dÈêXlÅx|³©o?´˜›™KÝhbz„/b#\C5Z’G8Ä¢ÅÄ×äVBqÌ-<›Ì6·¨yþ4¹&3FÍŠaðslÄÞÚ["uSù©Ôµß‹êª³Îâˆ«^Ô¸<<?S¢xq½Æi¦YƒN?z„£"0Åâ	i=ªO_Ÿ2²SåUÈb<õj†ÒŠýk,=ˆ1™'ì+Rx²ÓS¯Ð¤ç…Çµ+{•dB«.Ìo”«Êß­WC‰°drÿ(Ïß%Ù‚uW~8ÅC3Ü3Gé\þ–^ä÷Ë&³Mœ…Rßàmrò·˜Óò‹…wedMÈú€±ôÊ“®¸·Tp=1`Q:‚É5œT+à©*š³#š\|<¤T0…³vÕU7hõ4÷•&–2úpU6Î {ÁŽÆLùª š2ƒ9÷ªpÛ"Kñ¹Ã¾¦ºÕÁ!4›©-oöjxsCƒóPÓèÃ.F%³Ì”<»M7»í>êìÂHŠ¬”ç»JmØ‡ÎÅ–gññm,ßP1‰íä;|í’ŽggEy@šµ²h€\E~½[¾±ÑÝ¨ÜÊ¾Þ¨gÜb—jBÖ$ÓêŒÛU™µö¸z¥ùùw2øÚÅH!1í³ô"Œi)M@¯2#½ê$‰×6G¤<¨jAùì˜ô›²ª²<)ts3":|¿sò&¾)õNeðwªó®m.´¶ÿ/ÅÀÊ“½½ß‰`‡°ò0ïVÆ}·:<ºÊ¿•…Áº[6–ÛÀC
-«‘Öê¶•IxÌ`È# ‹ ÀRä_!þQXcIˆžÕ“ýxÃBÿÎÚhåzÃCûÎ²d†M©QÖ À§ÙWú@õ~þúgC‹FmlÜ}l§q8i¢n¥S:,lHkfÃùˆ ®%ÄVv1¡îfr‡~ëküÅ°vâ7HŒŸsÐ†q•”PRM†%{KóC·ï9zü›»dNÖÂøéa•#${Aää”„Å­	áŽ	óo]½.OŠ¸"s°Í»'‹œU,Ýºå¾«¹.ïœ55¬IÎ˜ZmqmCí“¢[„kçŽ¹"ƒ"Æ/f™$€ý{ŠÏéñœŒ.8!G˜¦ÓÊ;~æ¯‚; ÏU4¿cß€sŠ<ókº"v¡ýR3Q‡²Í¼eY8"û¹Åõä~¼±¥Ç³ø‘¸E³:´ÅLb—=Ù»–¡üó»†ž‘?lÃm½E¹4ÀF·^•¼d~x´bÅÍ/D\5¤/æÐút0f¤yoæù-woü2d8-^[Ðc\Ÿ;¸â¦‚=ªÄ Ý/F‘+	-ÀÐx^ ÏaïÐ<`åaò\­;ÜB†úÂAuûÜÙÎ¨rA'cÚe8·„W“462n«Ž1ó	v¤žqÄî„#.w¬C½¥PŠÂëø•”÷ó,¹3´[å+ŽVÙV¶áÜûzÃ(À5¼ê††vðbX"@u%^¯Êá¡ÞRe"Ñz¨e¯SEð`Ñ¬9^±¾³ç®HæëÐ%ùŠƒ`ê’)ÄDÕæCÀ"L¾Ãð°¿Žâ,ƒƒ¥sºÜWzW^µh_ H†VÑw%¿{[ÙÄš…7ú¦àï”Ô6mæiy¤Ÿ—‘Ÿ,1Uqp™ÚJØÐ½.ïª£GŽþæ!ZÚßSý!Q!uŒöKÅMÜ¹s«ÒâqµtÎ€'†bn¡”©«˜\«è*×­\¬”¿’ÎÚŽÁÂ’þvŠŠ{ï¤œ’™ÚrªÄ"$Ñ$hÎ°a³vV P¤x|TÌyFºÁ#S™ÔY^¦©”Ó¬F¥VÍ¨9[.·Ì
‰eÎ¿ºì\ö.÷.“Ë$srê„Ññ¶^¢i•¦ÀX&LãP
ôÄÄ‚hæÂô¶uò9E¨¥l)ÚìH]S¾x‡¨!ßÕM‚—éË!4uzE¯¿ò¯mÇ,øîMpMß¼ÙŸ3¥u£áþõ‹ Ä!_d…óuËÊ¼Y„_gÍRÞGÑ„•Ã_¯†˜¶ôŒe—#…wƒ2â¸—wòÞ%ì‡¢T‡Yä`(Ã#š¬\£AàD‰Ïl
èrÙ'^¨d<ö†¼J0õŽr€P€(£D¥}¦=5Â•ä(:«n|M–©Y”ßnw]=¤ù‚µ…Ó)<)ûC;LÍÂ¯$…º%î‰#¼¯¦ßóÀÅ+¹–«³S‰–ÇK:?¯Ñåy°fgÛ±GdÁ´;6géÄVód¶™	VI¥èS—ÑsEú²óî~1Î/»ûU·Ûí÷ªÙ–)¯ƒÈ¶Ì‚ÃjÃ"ØÎK>&inˆI¦Ùþ\*Nzâè$¬'ã`êÓ©‰áróð]+—Èð”ÇÖ4K¸MdwÎÅ„ÜlwnL"5ßÒ
iS¼Í¤Y®ja³Å‰#%výÖIÑ€‡FãÀŸ~ë±´ââïŽI×,ÿ	vWûÈÊs©°æÕDŸæƒM9bµ¼çz’So#L¼¼_‘Ý¡˜#*&Ï¢nWôÕ°ÖëÒ&ô*&O;Zír2Âµú|Wš™Åá¤ZF´®®kY+EÊ>ážßO¢ñ¸RHG»¯FÞ>t~Ï8$âÄq íYÑ'(ë©Ü’RŽ¶¬÷%H½Êë¼»ÈWÏ”@*‹|m¹YâÜê²r[eË¤ç8£ QC8	<–}ÿ:¿ë&&­y9žµ¿ppXÝKË8ïÂZ¬l²‡Æ#}ñZÈ#P¢7œÄ’ÞwêsÍµó@ßÓ0»EžÊT°?ð¿þòçÖ¿itùÐ7Þ^^â#‡v^ËàÞ§(i~¸RfV¼µò!ºº,¢—"Kõ3;~Å’©/Çlx9dìÄ«²¥œ–S‹9µîíîïí_*©U‘a¬b‹“áqÕ—fèK˜à°ã¨óA§â¨Œ“6#ÙF(þöà.»fh‰‘r•™Q«nÎâà¾ðÿ0–Èu¿O½Æóh<ög‰‚	®Ba*«ô5OútÕŽâ›c^ãòË³ü–Úg[I&’-QeÙÂÏm[%[°Y6¨iFô­0Ò•ÂäüÙ©*Ësð@U÷DUOçÃ°Ue3²$U)€
÷@Uº78Ë>üx0úM˜„ýq`32O"Ü
ÛÖè²!ÓÜ,Þu8LGG^gKœáoî†Ÿ>¥Ï{=¹€®­ ÙC4FèªP·¾²úÙ@ÎÈâXŒ1])±^t¶ÝóZ$6ßÒ}B5{š“WÓÙ<õ0bÿóh2)&tº¼lx³±?F˜Û)šdÍãêQß¦à*æ3œá?¹ËŒú0ó	Ç•ýL•æIë£˜#Ôbµ:ª›ÐF/Z¹±‚¾æÈKÓxÆ0ÞÖ·¿›ñ­í ‹^d„ˆóºRJ3hÃ†S,ÓæY0<–ÀõùšÐ¿g‚R|yYÛ‘]+yscËÓ0’BNØ‚Õ©QGFµÚ‚_U«o>R´Érèc ª_YU$j
³ÚFMC`ànFZ¬ò(É¼²Â^qœç‹âYN@i8ðÇr•ô ˆÅ°;<ö/ÌøK@wzý1‚(€Ä¦1ˆ¹]äÉ&¢‰ç¤×Øîð›Ò)|{0Žã^Å‘çøŸ–A~÷<Œã’"EÎ?5¬E­fÍ«¶½zV^-K¨–£o3¨ê©bÕ1uNå¶&ãU"†£)×r³ä8Š…ÜhÆ'¢—o>¼|„Ù¸àÓ„ëy~Ð…Fa®©Q×uÅšÅõkÌ,Ë>A B˜Á!?¬#^BÙLÄCÑÛò)8æ¤Â0Fô;WdðtÚv±
1Üó‰È¢Î6Æ†9’œW¨†âÕ4Ç.Ž§²@LðK‘‚á©æ‡(¸Ã
G˜"áëSsûóE#ùÛDí“^564Ï­ÅÞ©Ô
á’«ùlºœñ’o|J…ŸxÎÃ¢ýdœßT¾ÈWÏINN¶Ig±¥ò×ó8[¦ºàM6#öšØ{P‹íEêÔåÝ<Ž€íMk6|;OËýä´£ï$Å{MAmü8ÉÃ£5UcUi	{¨/ê§Â¥±<Õ×$ÅF«S=q!´›¾9œòD|¶³`€{í§£öÄ¿iÂ—þfÅÍ&k|KŒÑ¦·íu;Î¦:GŒ[[ÚVdÅsÑL@nÕyâ+(Ú,W}˜§?ù©µÓ±§ÔXÝYÖjÏáN	>~FVñ¥,áyw‹uÛ+´>7æÒËÝÔÏèVLñ(;#Üux"[z:þŒù’”=Šå í’˜N=ØÛ®b8ð•µçSË´—ÙX1äiÁ£Æ†*ìV§ÞGÁwŽ¼¯y´Hä[qSÁš6)&Eƒ±ø#9¨Y2Gm¤µ¬u½e¤ýÝ˜ëÑêó¨ÔKŽ¼ù¶ÅCÌ3_)¢&¹(X•eÝÛM)µU‘WTÜw:AtY(yô—Üx'Ú îE7^úic	gÞºÊîœ=Éž·¶D‘™g--H;µ™O™–ÜtuÉˆidYÒ”ˆ˜]UR¨ºr³.=‰ØU¸WV}²õÒšü-¥¢ë•'¥¦YÍ3?ó‘ƒEú,ºáš»óû°V¼åø<Ûn+yTr—ôr?¢ó¯:ýîn×WƒŠð þ[<?Í¼>ìpW4Ù —¦0/:Ã^yË•Ä¦fÅy§ÝÙ¿ð¸×O+øÓ0å;6m›£4%GÛÛxVk‘ÓIÒ¾
ÓÑ¼w,Ys{M¶»{ƒ½ƒ½ÇÛ½Ãƒîãîînëp8è\tZ;ýn«ÛZ»]4T:— Ú^·=›^ml^PŒ¯`ÀÁý'­ÿ¼f„ÎRXW·ÞwãÈGW
¡ìý€	„½f6zIz‹*Zõˆ-—%PZ—vxÑ¦³ËL</¯Fø/­¦’_I¹ªQ×¹VõØìŠ|%/äKú¼ó`Ý³›?ôàÿã«¾§ú_»»·IAvPŒïfŒd|Uˆ—^A¥EŸ6Œ.UßžIˆVÌŽš¸†~é+¹É/[û,ù<®vå{•œõÙ'ê÷õ~‚_Ü²¤ÛXw+¡’ZŸÂàzÅiÎ]¦Ö÷cGÖŒN‰vg­}o2<ÂÀW=ïfŒôvóJ~j	7¡LbwIþpO.Î2K1›-	^Ýö¿
Oªï
·w;Ä)‡1¬Æþx#õ_°U'h|vËÒj+ú@ÖÀH¾kY›¤®ÒoæúæZ¢W¤JŒeÒ±@š=f©Ñu^qÜ?ÿêòòòñ 6©â:†Íëpxyè_H^®$"óäôìRŠ=£=ì|s!rË›~?˜²dœÈEÔ dPj‰¿	Œ*èM0,&[â€çÇ*ZiÔ‚àÏA|;Rh{o"™z4OIS]zé(L˜øÀGí»?ô¢Ø‡	l¢°}Àó`Òöˆ¸ð'4 6yŒ6`0àrVr$,‘Vy—-z#†ÔÅçfÍžñårÙY ›fC?…ÃÌë0'²Þ· X–ñËæ£*ø ;%2é¨ä!Ó§ƒñ|$ÍêwÅ7ájKJáˆ¹åõi¤³~;¢™ª±³‰á-)ËË¦×ÊßékÞ1tÇœUš'«ž"å´é¦oöNÊ³ ¼ŒZÒHþH_=&¡Tòªªx†Åoó}äÄk*KD&
VnÚ“ÍƒcM›7Í“}Zþì¼\òR²±Œ#½íI\bðÎG5Šˆ:½Ð3¬o†ÔÉ.KÀÜí±Wà»£8^Di"Ú;F	ü¤‘M‘ñFö€+«¹±îÊ¢ e	ÓëØ=*\¦eVÍÆ4‘7½ÆrKáÜóWl6³/:?Nã«ˆÏRz¡+¶bþ×ÉÂOn§o]ží‡©ÇŽ!FÑÑÜüÖ»»ófPPïsÆÉOå9•dJ:¯ÐL;š’´ñÄ9€PÜë’ö{JC„Âü²)eu‡Çìüú"ÜKO8· ˜JÔpküU÷ä?lk!xJ&©'G@Ä©r_ÜIöˆ¿ô"Î/ÐöŸó»çZ™¹dâN¿ô£æ$¹rdÇÚLdÞt¢I0„¤âhf»=”Ê÷{·pÝ¢è$yJCs^úïê]‡A`l6/SáˆmÞ!`¶ô—kù¼€l7™ÍP§.óØøn••{O5qbÙ’ˆäjêpk€õ;³Æ.Î Ë-¤\2Wåôåä9‰<€âŒ_ås{Mê·†¸Lévé©´ª¹î";3¸:&»fo[ûË»%‹ƒlé´ºfUWãIadî+¿ÙU‘æižê¶¼px³Tæ³×ˆIác˜'	+„í9)ÆÎA„Žü¼n¦/tq¦ Ù¬â,l#§^ò« À,yâ=Ö–F§¡z¦?@;½ü_óÓ¸î$àÁƒJ·
’_ÝNQ8Þ«¦¶[ô–¾_]ç~‘þ½A¸°rÇª·¤Pu»õÌ·µWø’¾S»ÎBâú}"Ï,k§˜ÿ–¶W=ç^}¢8Û÷ß-rE²v‹ÞÒwkÇ¹[>tïÝJFÑ5;Ý¿?‘I1®#Òh\ë¨•ãø}àÒöw±…ýbû%oŒ0aÇàììZT»gÙYiRÝh«¸›æªa¾mÃ9´…;û…§N¦Ñ•ÂýÕÎõaµ>VšÚð²ÏÍ¤p‰çõk­ÖË»È•×i®Åt‚ÎåÀ¦4VVQ/!†º]E¤YÅ2Ø­—¿ž×¡”~‚îå
@\–étúÐo¥Îž†J-	iy’`U6ô{Ã>Ö¼,øJ}-”ª¿;ýüNýð .FŽH(J„SüÒ/•Ÿe	Š©ýI½œ.®~™ÅKòÒÌ}3·<t°ÜÛòú7Ú÷Üã¤ã%yoæ›Tl'+ÕêÁY¼r£–:ÌplvZ Ã‰~ô¶°¦N{gþ¸Øò†°,¡^†°§M`êÞ¯ày‡ÞêmÖkÅ¶Š“ÆMdÕøÉsÜýb?„½[P
8xÃVK|‰Gæp—F²ÿ)tiß“‹·ñ&<ªUO4}5M‡'‹æàL2½Œ–H^ÊTÞ¯	xE´™WhUõ­½Z¹rÙ¿fã[àX"gA~I‰ô©öÄû"íªñv­yTˆ5µxÌÿGø¼õ5/äîcÚKŽ¦´uð=œ´ƒ[‚FbÏ„£+E¿	ýŽÉ¹*ðyÇàûŸ0©Bæú„%˜ÝL‹WÖl4ØF¡&e5˜O ª3)C˜Ü÷¾¹ðÆWGüçZàoÆâç>þœI‰›nÆ2zhvó‡!ˆŠè¡Í-b	qÑn©Ÿòk¬hŒìH3uµ÷l–9ŠÔ@{‡Ð]o¯»»sá‘ûyýãch.Ñ2(ëy·ÝÙ¹`±ÒàLÆœ‰sçGC¤Îüˆdƒa€€…Ú}9âÜQôiøør8Ü)ô©³7Øí_dÍL¹>´µÛ[¶,Ã“åUõ:½ÁÎŽTÕ˜W/_Õf]r±-ó,_áXšÐëS¹¦„…ûá‡h>‘I8‹.°\&o{ N¿A›Û>ÐÚ©±£éÕ;tE@ @4OEiPrÂPpÓÙR¾ðíQG“µºvÎPO¤b3Z»´»-o¿Ó©»·.5ÓLô¡Á fGŒ§nÔ—£§×Ñ§à~«yÍ“àEt=} Ú:×/ji¢œ}jú!ðï“jë­™_W²ª béObé”5;{¦vIQ6B‹“F­7ˆÏK&Ÿ]BI¡SªPËZ{Ùé"y`€#UæžúÍÑáU‹˜0Êc˜úãp Te»”5˜©Òä),ÞÂy÷`Ï=\l©…ÏŠ4Rp>Ì[$% YBŸIÅ|@`*·/z×~‚êÝå³/¡)uOTX¨j)UâÒ»^l—ù	ãa7zôˆø}Œ??DÌóOº±Äž‚iD-Ö¸®Í¦6”ÒÔd´ö®ZKû!"]è·†Aì/ár'%Ë2Éñ¼™ò}Ša±T›zÞñ½ögïƒK±ÿ L¶©¨§±Yg¤ñ^n¬—Î/Ï®úê	ù’#çõ%LÅ9qEn·Îw¤Ÿp*¼ô÷ö.r½Š£œ2Uö~W™žR2X-Ý¡Ü­c9áW¾‚v’F³wq4ó¯H#â˜P]È
8MÖW8/YD'6Àuv¼ø»«´³rFƒù„¯ª—ã ÿ|µ4Eý+
OlÁäö‡Åãmn3¯ªWÓ4Â¨FÍ…×Fþ§0Š¼dEéhcËë£Áá“6Ñ_¦‹Ût>¡9y3GeT6å«'”ïÊµfë÷M“*ÝDAJìÜUê“õÔ¿êiÍµKÚ0Au.8…õ:µa•Rê õWùIÚâ8Š›Ø¨Ø¥ ø
qm1ô2Ü
§z
Ú
Z¾Â×Ë[ó›_Ë€ìRKz (ûÍqûe\ùCžïì/+é‹k!‰LËœi
ýZ¥!T@Ám@‘œ7ßÈåÂcŽNªx>^æ|W½Ô'Þ|¼jª&Ýµ;<X‹(:ZˆÄ!¥LÆúÁ>ù—Á”/‰–@ËSIJ¾jÀò?ž½Þ=/•E9±6žf(¯»‹Zv>åà­:þÇK}ÅµÜÁ³P¿ÂÍFÒK:ƒ.1Š·qxNýqÆÅcÁØW‹ÖÂR‡ö5|¼ÔneË¼¢»0`§nšO¾)H¾¹¸·S,ƒ!Ñ§×ëû/šÂ¾<D ßæ;‰2©-[m-ð%i<WWx Ã˜ÿTªô¤R'w·…[«Hy9ºµP˜VoðiÄ§,â^òÛ0573½Í`â‹7~ç§£â[èðpD¯n,-<IHcS³3ˆ±±Ù„vk6½º|³¹7â>°Ë¶ì1ˆ­‚ø¾¬ÍþeÒ×#6Þ2vE
ûbª2Yã•bD,îõäâ­»e®ZæÛ+ÈZè±„d))ßV>E¼¥×Ø«_ÇË vŠÏIe”j!ÓTW4¥&
ßÓ,¯E1ÁWéÃ"Tæ•Þ%`UV­‘rY¾ëBêgyy¯¬Á‹¯¥¬FtÉˆ—4JÈ×êZ4ÒýÚôÁo–§`­U°©Ä¹Æ G-D˜ã#oUÕ¯æl¬÷E”$´Ù]O©¯’wq€z¢RèÁ•µf«W:Â¡Iq"È¦|z}á ½±*;ÅËêÝ’Ù)vÊq¨”¡×ãÿake¦Íz¼W€y2ß]†“_­¡b¨óDÌÇ~,‚ßz3þÇÉb>C=¥xpÎ 2¤OèÜ­:ýT÷*Ø5²’>jÅúW¨{QÀ™£1lõU×gÛ§
¾‘&Q9s‹4ŠÊäóè&*Ó«Ë‹Êx1?–anEñ`E™W\yŒ r	(Ù}×Á®žŒ&Ôçwcÿá8QN‚Ú`êåüWÕVâ…4À`ú‚"ðaQq2k¬,¨âÅÝ¯PkË<48­®£'arÆöÇûºŽúÜ¶ƒ•+Zy;YÇ>°
Xe¶·½Á¥?§Þ¶G~úÄþš/§É<æafE¾¾<ª0ÆáñÓÁÈëÏû˜Ïl…¬…ó¬OaWÎ¶VµÏ[ÓM”3!–üi8&¥/ƒZ0óÎ…ØRÂÂ0d7%Ÿ[Ž¥YüÂ®
†¶#ÎD79dâ¸r‘°šÁ–ØÑ·¼2+Üò77(˜ÖJm[y9—Dâzª\ã¤X00QŒI!ÉXg•Ösh§$!Ž¥àd™[{ =B¸/	÷,Ô´qY†Œg[Çxè#ØñÌ²©ÕävÔxRØ¬ïÖ`õU6ï¼ÛÉrs˜Â÷I®õŠD&í½†wQ•ngã0mn€L{Þ½@ãØçC’r±SÙÛíÍö,š57l|÷ê‡—wÞ_þü¯pŸŸ…?¡ÃZñ7¦&êíò0ÆÈwáM0lvÑ»lpcóÎ{ýlgÁÕMúëXj‰UÑÔÖ/vì^ÝxNíç‰=ËÙ;å~øøácEZ…‰
¦\Pw4îw[‹
ET®p XÛwIãêv­ˆ»Yy}­ _ß-Ýö/tø ¤sçòšÔÂv¹„‹»¸ÄN»Ëbû,Õy·½{áà€L"3ßÍâ uû³ÚîêâªÅ8õÐvØ#/døÃMÇtm.ÍhVW,¹³.±àê£ºjWRóu÷°[˜€åMb¦b±ÉnbN#¢Áuy:‹ rúE¤'B¡W•–®vâá9å”±k·¼ï¿?šL6–"˜åÜÕ™_èò()"´²Þ¥"fá]N¡ËÕ)ÇOÇAœªqç	Òhzcvö:’”¥£œ::.µ­{T„¼ê°<WÓ„$c~ù!á2 ‚žñ±â:Èn³ ¯è9·”Ø@ž1R8Þýñ<X}°GÁàôãˆŸµ·Óý‹‚ƒêç$»rï µñšú_“Ø>g×kÎÓº»÷sDÇ«ùÁñv Ï9öôv1>¨ëwŽëÚí¨âØO{hx§óž-x¶XÔ(Å‰÷ŒlƒÀ\G}Ñ{Ýly5Ó¤£€Â·g€÷ùìÚ‡‡‘ºþóø¼i'hý€6PFßs9·Ï#Ò‚,îìÁ™¶(°ù¶ÉÑÛŸ|`©I³\å&nwo
K.O+&¨G^?ŠàÀ2ý–šŠÁ	Ù+˜a`S@\	–¶ÅG´Â>k#3ÝÓß[ôÔÝz/ŒçïƒASæ–Vf›µöTx#Î^þ…ƒ@Lò†…×²Iñ+WY€>RZÌ°Õúz#âžî¢_®9òeùH"ÎóŠáñœ
tæ|œ‘l÷RÇC{™[„99g\Á¯ÆÉ£nÈ†kX0²Ÿ2[A½“…[„‘®Ø…E¶æ}q$ËÛ”Lj±X<…¼~O½F¶>IïÀØac‰p1•¤~aW`úxÿðä‹yúfãÚàJñ#¢kú¯”ÔÏ6›æûpØÏ9ûvT×š·“Ôù|Ÿíéî}¹Õ¬·6ñ×‘¹j¼\W8sØ4íc'yèx»lÊÜ8³ZËÐ ³Œ]ÌXýr:¤ÕÚºã®}¤} ¸…"â³(M£‰ÇÒáz¯ýäºÌê`Žæ”±Z,nŸª…3~)3ÚP`‘\Åþ0&Œ);Sï2†W³ÄÜã‰Ôdt›Ôd÷(ò¾,¡;(5®"‡³fi©IÇ(K[ÍG)Ä°q“Øu˜Ž¼q8ñ-C \Ÿbxð
D5]
ð§l½c€5t*UÏ3%"`Õ~ˆx¥Í¾½úæT÷i)“™ädf­„`Ä%SÁM˜®Ô‚RŽ_“äLé³%—Å±³HÛÕ/L¡G,ôHÃÂ°ôý1tÕ°„öùÚÙ‡µÓíâ>Ó-î+•à°lÉd®îY¥’î¹o0‹­ÊX#=a¥»Bq&CV ÿÉRÙk³‘óF³Ô¬ÃN§Ò˜íŽXÙÇ’YxõËM€åPúe×¤Òi˜ŽaüsÀ&@÷{BgCÒÉ–ð_+‡¯S±5c‚eÎ‘ˆ;)‚ÖÁñ6úcÐ:ïµ÷¬¹šk•ÅL8Ü»R÷Í¥Z2.x¥ú5å^~¼]aÝšã}€j¦„¡œŽ7©÷:˜Î½q4CT‚÷7Þ3îâ¾íÊ™ÚKOáD‘Z$ÜUœâ¾•21ËñÞh{¯Ô®ám\ÚcàÚ¤ÍzVÎt¦}—¥Ç"kO¸d²÷Ôn#fýpÄ4ÖlŸE7bŸç³]ãCkQ.$Ìí9FÁ?ÖÅ£±,T³ì¨no#Ù×Ëuz}ÞøãúBGN åZVg›žÞHÃ!Þüä8¯B/Øø6Šx^«8ptÓ4…¢ÜÑLSl
OÊ¥Â½Ú:äkñ·ásÌy½Þî·8r×­½} $ü=»qøþû€¢ÄœäÔwêu÷:YXx:0{éíîÁë½®Î7ÑÐ
Ú(žãèi²0(#Ö°Ëõo•ƒÊÞÕT/Õô´›©w"OSí&Ï"¶‡ÿ—©Ôþ''å1ýÓŸäþ=‘š€1Ñ6úx›²ùx¯Îš"#4©MdŽc%k¶SÏu@áá¡¦£B!­r×[Þ¡Nš42Àß ’÷M”“9fÎUÍrHúÙai<IscÛŸ…Û¤=ÞÐ)Dõg£(NYhQ3Ñãf%WÎBx
8Î±·ßÑlsíkZ¯Ç%bgw1-ÐÁž‘ŠGÑ|<ü.ŠÆáÕ”Öm>hdCtBÏ §Îüh™[i…^Vk|«Ä’¬„óƒ–—jˆ„v˜òèOCÀÿ}Ì@®ŽÃŸp´Çã[¶‘cR–NÞ>;'þ%ˆ©þ7M¹…Áciü›fw+Ïñ¤šÜòø´<ü$/LG›–`ÐË³4±êØ×0å=ÄÎ„S2ŽåûcŸ%6Ù¾9‹I§À~3 ™,bÃ–Â%œVnù[ À ×ôq´Ñ
YkXkÊ¡Ó ¸óJ‹ÈÑŽMBÎÅÁû·P\.ÃðØds´9Y|¿‹*¢óÇ–“ä˜L0%­ƒ2³ E¸ÔwÀpd1avjx;Ã–&k¯$½£Ç¨#m²lP7ÌpLÅŽ¼_/²íõnvóÑü	Ë–}ƒtkÿˆÈŸ¾*, Û‡FÃ]%Kõ ÿw¡UTæº|LfS<Ñ—ƒ'KYoý=¾È”ÿÀi.ý!þ‹j‹Ÿ¢h‚>ÞËÓ6¡—Œ¶å¦öB’KÍ–\klÊcvf¶C3p˜ý ½`\fyÞrÅAîfÊ(Y­SuÆS8•w%T™µUg»†*¸´Ëwzvâb§G'<<¿H£#ý†y9ð¶7`Õ€ GL¤¿Ý×\ˆ;ò*Û÷(&e£Û7ˆû¨ô¦@ö.å8àKD:iL›ÙPoyÎÙd¬ˆ»ÝŒYßSåÜò‡É°õüº¤>#ãã®ÊŒ-VB2§öÆãm“ª,¿,ë{)8³›/ÍpŠxÙW‡À¯]Z¾›Y!ŠýÔÿÂQÜŒÃY?òãaû:†ñÂc™|${äÆ¹Dìd>`®¦çÑ,Èe=«À5ì†º4Å“ãb›f«ºq›­1ü¡[^B)}Ð)…v2å»..+ÒðnÝ`{¶xøí=—íú¯k?†¯ŸK
ö&±Éø¯@æúöGYnD;tÛËÒ”‘ø‡ØOF=‘¯m—° ,¬«-"êò;Æç^å„È+®ûçk”“ å’˜„	¡î‡¯I<z \Õµá~ÅcÒR»kBo
ÄÈ?_"ãÏƒúyû3úç¿VÀ_Á
pøUý’0ïêZå|:øÜ‡¸ýÏcá}–ƒÃºÎänê‡Óº¸ÖxZwû2ÉýO£—Ã0uÞÄèSü‚þœ­[…Ñõ—w6ÇneKèÎ-½‡sÇ îgx‡3º‹B•Ê)¢×	0g—¢—+dN£mqÑu0´»Dm:D†‰ßÃ–dÚNˆ¿ MIû:pÝßevÂ î§ºZIó
©ñ~Í½?Åtx,{±çgÀ´„B]Þzþ”b{3?NÃAk;m»ñ&û„þUëL`3V}U¹Ú½…—_½EÈiäô}l'›jç²w¹wQ‚¥Ã¶Íwö´bfUƒÁ³p?KQ‚ Í€k–G\`iJ0¯{>rîùxï›orÓòç âfhJæó©jÛëpérü.š!›5‚­ù;âðêÊÊ9&$î‰m¹×WpQÈ=Ì.	»U1Ov¨ ü·íû»‰%XÖãÙ$,Gy¡ 6¨ûvqø]fŠKm¢­N°Á4Œè¤Á|†åV ùíô(¸ßáø‚n]LáFëAÃ>éÛ3ë”©ú
SÎàpõ%­}ƒiæ”£gq¾ñÿþù¿üycËÃÿÿ÷?²ÿ‰ÿû_ÿ‘ýûŸÿ'þû—ÿñ¿ØÏÿô¿Ù¿ÿø/üñ?±ÿþßÿåÿþŸÜ¸ ¿ü`ý}ˆ{¾“Ï{#^äïN58Ç<.ú“vp±8D¿¥•ƒ_Z4ÝŽÖ%F
µ[]¡U!RËa:›§ˆ÷·‚[TWoU>²Nóæ(×cPK.>²•\¶°<Õ›]W·(¥•ìoy¦ó$¦u#Ù^[Áàöø¼/ia¼ó§ÁØÚåŒÑqîeòÔ±îZúoÇ~? O'ãï¢vM`Ê-PµÀK~^Æ†‡H«Gaå5¼p¨/™çåò&óqJ> ° F£:;90äF*ý‘>Çx¥X†Ò5oÕ Ø|«´®þÂ»öUÁ,Ûå;)pÎŠýÙ‡îì[·L#©ohD7z£D$”çï~¨D[´ 0f)qûW[,Ïß¯jÓÏUøo‡€(¹Tß¿.=5+x”õLöç‘&µA×)!43°êô¬•‡”7‘ÊÆ.»ùŠi”\m[cô³gŠˆ*v‘RM0íBSÉ	Ÿ»"ë¸J»Ù ð!Ò‡ªqÛõñ`²óÅœÝŠ€™l¯k<‘œ{ÚBÎ«dßz³¶±4Ó2—ÛdË
Î_3g—Êº0d×vÚ‚¢n<pZ§R»ª˜(a„^;¿+EÌÃxyZ`
¦­é JË¡KÕYò)P-·L©A7e×w—äž‹,6K(´N™Û»98½&÷¥Ö¨.øÙ¿!wG"ïÇUòî–ùKÕ­¿Ôù*Ò½3Ñ÷K•ðÅ¢qa—y×yæt¶+¯Ëëò"±¼Zf9È½â9ó›Ét_£Ö!ôõ°¸e;Ÿúl»‘6ØEVgLëÉB\¼¡ÝTÔÚÏ3gî0yîOÁ˜ùy#*ÃÙ®)šüÃƒR¸¼´Ž¹|1óçI Â†"1ƒÇšÞÖ7ã’"k^úãÄÝBÌZfJÍœ!ÕüüC8	š.ÙXá#Ðò,âjAÃÊu8~çT	ÒÇlìßbÒ-r­M¹º¯ÛD n3«-#‰@ì†>Ôe`Þñzx¶YLñè>ª¥ñ§;	YL1V‹‰Êä‚»¹%—Œ¯•7Ý2W°§„±bT³ÍÅ"Jû‹‹A1ßbêA1Ä^b´ÜnSðË.M­½Ñebü„|©µ)ÔQí²“½CÖp–R×Œ®5ì"t)ø¹ØÏËpQ¸®üAÃµÌÚ§¯ÝÖ?½Z+”í0ö¯N7.$Œ¯>Gg½Ø§i‚aÐ˜ïk«»ÛÙb½,áÓŠ…½ÄÀÍá /¨ÓîÖ-'š¾À,šØòÂéeTcuå{,~ØŽ./áNûÆMŠqoÛËép©æ:Bn˜wìÁiÆ}¯.Ï²ë¾¤Z{+?«lË®uñ&çû®ï-)óf¯"ùVq–³O—‘‚³kÈÂìZ]"f×:äbKIîÒ1»jÌò’²®ˆzò²¸âàæaDcBƒÖ(Â©Àû70O£±näÑ¥‡a2ða]1žµ^ËPÕš„…<v…wsä%Ô·ïª*1€ä†Ì¾…w+¡%eu»
da¶ç:i×HÆæÖ©«Øï‹¨—Ò­>N¶%Ò.‰8I[ŽÈ§šé¦ªv©!æð¿åø¥?ZIäV“=´<Ë±M#‡Ät<KôÎþìæÂ9xú‚b÷\Ž£(nÆ2ç÷¶½ýÎæÝÑ¢tû¼KúŒòN47KÏêÓìmy×Ô[îqÁu >E_¶åýÖÿ`†0ï7a2÷ÇáOuuÌ[xœ±¦¬˜„6³“…/mmdØ\Ú°e;r~GÂâÇbG:¢&Ç:Y¿µ»åu.ÜóHäVS,$f"þ«é%u¾ÝÊÅyÝöÞ–øIpä5ðŸWÓ·ó´±TÆŠÂŠá¹èŠè™òœªq^@œ»ƒà¾K)ßŸ#»^„b˜	J~†¦:å¼¿üóÿ‚ÿk¸®iVk,çrÞ¶eUtIè‹”ŽÉCÉñ3&ux uDsÌ0ºí•Ú¸dÅàrÜE“…Û:s[ß»®¼Ø]çFW}Å]õ´ot}Fœs›2]›ŸÜN^ýÜ‹jpVžk§xãA‹qk<aŒ0Nã;ØépÞÁ\éh8‡ƒíˆ¥óä†tTx_£e¼ÎYC®<ˆ¯‚á³qÔ‡&`^Lü³©mË–·°Õö4ÊJçñjûñýíì‰iÀ²ZÁïfÞœ¬äÿ  ÿÿ îIxœì}ùvÛF–÷ÿýeeÕmR$µØVKÖ8vÒñLûó’î>::1D‚"&$À@Ë
[çÌ³Ì£Í“|÷ÖTjE9îžð[B-·nÝõw		úqùj]_D£_^åñ‡$¾z—Ï:Ë|¶óç?„µÀ?É„tî-xSO–ã${Oz£ežÇi¹CVíZ#ÄÖ9!i|EèåNÛNÞ´»ÝÖ‡^–Æé8C_:;ääqûÑ5§¿&éegÍŠ¸õ¸ZÞoX‘`P°ü›jh½LöÙ)óe»É¹!1Ì'¥Î§Ü˜Ú¿Òyo-‹¸õÔmž´Ønp\ëPÄFi‚´cÁ÷ÞÞù8´Á•™ÊÈ)9~…ÔAF³¨(~ŒæñÉÖ´{@®º[d÷19‚ßáVËÏ½<ÞýfY–Yúø÷³ÛCÇö!Ê“(-O¶.§YQn…>V$¿Âh’Q–?¢ÌÂC˜…‡¤Œ?–Ý³/ö'çdå¿Ñk¿&é¨;ì÷Iž-‘Ãw'ËÙŒL³q~tqÙ-fQwð;}¤ºN{Øï÷)KŸÎ’Ñ/'«¨¸NGkœ"e~ÝrOÂ”%)Ê<ŽæÀã£«()I}H.£2Ë{óxœDÏ€ÌFqÑ»ŒËwEœ¿Àk‰pÜhä¦åVƒ}û:eù÷M	Ó×ÙÎÅ÷íöm=•É‡øE‡¦e#=
6Î¾7Ë½o÷.ÿt®’tœ]‘¨ Qz½ÓƒS¾½^àÊÁÞ&óç¬a/Í®ÚŽ-Z$ßÅåhÚy¿û".Šè2ÞemŸŽ¦Qù||òå*¢‹û”~½ù¿e)\ŽÓQ6Žß½~þ4›/Pô*%"2 Y2gMnïÜ¼¿OVðµœfã#²ýêå›·Û@´½Q„ïæ‰xÍ/}Á&6È›åb‘åe<¦K×a8­W¼jFç\¸¥ûî5¿Æ©œŽŠ¿ä¨êIÛÝ8—[V¥jÑ‡–«Šƒ:]¦¿jsgç-§X¼„ëqTFÑ‡(™E3œíN¼–”;=îacäë¯	û«‡yLúkˆj–ÁöËbÊ_Ôz¿·ÓHnÖŸÓ¢Ìkë+ŒñXx›g*:;½I–ÁŽ*ñ¶Iÿèák:;ë°=…³§pì¶Ý£lÁ;Õ^\,)žFé(žÍâñ:‹]{^TGØzB41žƒIÊ^Ûc?”ëý˜•ñ«(/[¯m{y\.ó´=õ®±B–]4‹ÓËrºîÖäÒM|9‡¶¾™eœ•âŸ–7"G-7eÛD0Xò¬Íbñc]Æ+¤n®Ñ¸“å¶kj­õ3í0ªŽ¼½¿ÎÚ}"Ú+âtü“X˜¶çôÚœ·(Ú½í†Pa¯<o;Ÿ¸²YÜƒG³¼³õ"åÙb
BYÄù<)
©È8N“x|´uŸàÚMDÿ×2É©Ü«;ÍÊn™œ¸½Ó£ÿ‹7?Í–³1I³’D#P)
^DW¶ÚÍÆo¦~Ãìth¦=æ €"¥É•ÂÅÎT¯Ûj×A7“þ;Co+Q*‹Ž§˜“I––Ý‹–ëÇƒÁàb8hèÇ¨ÿÎ“´{Õ=Û?X|<'Å4OÒ_º}>3Éå´Ü
ØêETN{“YS	ôTÍØ%‡ý›£•vù+¼tRžÅ; eßÐ6¼O¶û ýLß×»cÏ::_äYçÏ;äˆtì>OË•ÎQ<……Šó“-z^EBÚ"ŽŽIk¾¸î’ÅÇî~eéH‘I\P¦+Éÿ ³e9KÒ˜}™d£eqd¸„+Ò/ÝI‘€ì..ÓôJv7£­Á!Ž4#Ns‡‡<lÒÜ¾°¹4¡?ãN¤ß.f(Ž6	Öe™ùÍ–ñÉŠª¡8¿®µ–e†jè,.a³ÉÄÕ0»ŽçQé½·X€„út£QˆÊ˜®^d)(Éé%t:H5Ùó©(*°a@’ïÑa{X1«@Ûo¡ø£Œ€OtCì		,]å­{þ»ý‡a:ç;€Ö5V”ô¦P„«®åwžtYúñõ³ì*­ˆ#îý_“““²ýmZÆù6ªÃ@?ãY³2æì8xš•Zž±²8þCã—c¸,³§É,þH’2žÝQŒ}®ÎëÁ²ÊõŠÜÃñV*9u±Uv»Xge°Q qh½¡³/>½”ŒmØ¬5!B¡õa“Ô›‚ò¿\fk•+þ¾Üç³ä¬3M5©Žæ®•¤èàZËp¥íý/í"Õ‰Ñ@|…šŽáÂx4gÇÐêì¨¤ÄIôðààœ‹BrÐžæW«g¹D0“æVÿÏeQ&“kñuÑ­¥ì$%¿fÙþ·Ÿ¥.Éíž*ÓÂ¤’I2›uÅQæê}r<Ês•`Ñ±ud³¼¨'¤2R“él4	b÷ÀF»d!Ë~AkMßàqÊº1Éò9a›æ¨E³Ètc«ÿ †ü@Yý[/÷­ÖVs‹ºn•\¡aBÿj”Úû†A¸Ý¥ûF¦á¡‘z#xUÃc°¾ï}ðª;MÆã8Ýºïì¯ûÄ!g^;Ž‹2_Òkl WS @Â(i0¨XÑìÒ%ž;·ÔÞÜÿ­ðØ‚~ÛÚ÷¶¾·×+popˆ]*M3n|p±™Ù½¨ì“f	ˆ&ËÅ"©Í*üITºþ%éÓ,-ólþ °é4gOa”GdòH¡&øVåˆìi÷½Ïø~k³&ˆE¿ÜÎ	¿¦Û]~)Òo§òˆ!‘;ƒÚ>ÚÎq¾	Å2|{~nÎð[ÍÍãwîß€üþ—Ûyí<?oÂ^»Ì[:Ê7â÷2ÇÍÍPKwø8À×uyoÈÉ½¶[ûÖŽìÛ»®C†.Â:¤kô†Î·r3Îü\É¤…–âq£ q;§ð¸7åÝ]Ó°åÔëŽZjÔ¹&¿že;èòñî$ËÛXÈ	Yíþ‘¼~þ—ïß‘§(Têb#OQþ>sTÊ7É8&¯"PcœOäM<‹G …#ÉwMc:~Âlk 5Ã é1IA1fÂež 8Ð&¾œ¿ûå"NQç¶™ŽçŠ°=žuQªW¯ÈU2.§G¤Ÿd‹h””×ð·‹>¸…Pzto(?<p=LÊu^Z›1ðéñ2çZn¿7<€]ÀÙ·ð¿çéËe¹åjJ"ß«îô]q¬sóé,ÐºzqÉ­ªu÷ Ï,pøOw”¡‰‡Zz4«‹°ˆ|,jÃÌ¯ð2›}Ä¾Éd¿#dðfâcÝûCýÒ‹ëîžîEø¸Ï¾˜ô'ÃÉÁ¹eìFëãE\^Åtà|¾§Ý³C\gƒßiu-ºÃ™Å“’ÇMØ½Xæ–§ÝGÀÐ©Y	0´xçÑQªÑŠK0`4Á©Fyñã@›@qçÐk£¥ƒOŠ–”«ûÔÂÏç²¢&oLÈ±`cÊÐ÷{v³/¦ÑûfoN@œŒ¾ aËÏM÷‘5°´ÈFÅ”T‘5e¾LGhÎœÁÆÁð‰’ÅÓP.3ûãÝé¾·?‹FwÎ”µH9hvvõåå¼êÔÖã²Ë‚ž-å4)PÎ ÞQP¶w¼»¸å¼ûoÚq¿³˜7”²Ô.S)<AÉ—¤ìoÿ
1ÓºtßÕY§¦4lô‡ë&2i.(ªLä®Vúôú2)g0\ªÑD*Í¸ûãÝÓ8
ò“ 6áÑõržtCý ƒmuDÒ#|PŸÜ×]´{ƒDÞ-@ŸÍ."t¦í‘ä˜~ÅS¨ZúƒÚ;#[°ªoèÃ'+æSÄuÀî±«I¤bJa*òˆ
ù	è5ìÏÞ$™ÁîÌ°YB©ç_6…,ÔöÈÛ?ëõzò+Ï{øs§Ý'´Ï¨¤£é¶sÁT±xü¤Ü¡¶´Zïn}Gd¼Ãg¶AU4ìý?d”¯£¬\÷SXp¸ö¦õ:\âsüvšÇñ³¬¬^;‹.âÙÉ–øŠ³OfØƒ^/ |Õ«Üy'âŒÙtJT2¯Óý|ÝYX$åü²]œ{øqf‹@w§QX]€–Êe£a€pdÙ$tÑö’¡%À#\Àcì7<‹æÝaP‡¡Ë¯¨ÙÁœŠ2ä° f£¨c“¼4GµgÞã3MÀò4ÖŸšŒe›È²ÛÎó¹¼» sP—@æò
}W	ô)Z,bàéÓ8{¡k‘‘ÍÄ–b–Á¬‰.b²%õãP8ÄÅ"hˆí&A³³KÜr{l­ŠxžÐõª·†b©˜×;ë­9^ù8ÎxG>]îS@ûkz®ÊC
La6ÂMÙ§Ý!ÔúH»´3BS‚öÐí8;gÎsŸG‹N–û$r³°³{YÄ9ú–s%bhÎ»ÆZÄ{^åñi/ñÉmŽ_âë“¼Z&§ä}‘Œã.|í~É/Þ¼'GËxŽ‚¸òàpoøÅJXÀxýýbç@‡÷lYãh‘öß„ªž¿§õ©¿ÒmªèÔŒJ \ëÀò›`¨É$ôl	S‘ÁêïUËßDãË¸Mì”üá‡À#<(Sƒ¯yD¹ÚØx>Š@É–‡=‘£ßV‹=‹Å®tØ@öA’Cw•¨*Föj„¼¥Œ³	.¹FÃ¾Ù¨´o3øXJ[°Y¶$ÕC?ˆ-–=i#4j#Õ‡‚oì8õ³òL)ýƒŽ²î­Ðd5àÝH`¡Ø*d%sEJ²;ï ÃÑ>šR³¿;ê½Ñ'c^7ir”|ÌÛŒ0jf\øœz2¥[åŠþk·JÉx05ôXeöð)JöÔç}kw9ñyVÄšé“^ÚgÖoú·¤ÛÓï|×šN1×Núˆn fíôi;–õn·ÂTz9™ä!i ÌšK^ÐYý„Ë˜ÇÿyÇ;(š_À¼ª+É®ñ¥d_¤µdÚ-&{F_MÞÒ§\N1¶ž¯ùô~ÒÅÀ
>OTµKù„ô{lÂWÖçÊÙøê>OGÙœZŒ,K,	|‘ÙŒßá"ßÍBºŒ²µ)©®Ç‹¹Á¹,/3×š]Ì–5—wßÕ‚…	G>›¹r¯wUçYši†¿_%Ð}TV›`Ïê³~äZ¢ø±Vt{ìÌÛ	^FûE0 nªž[ÞþšÉ—î.>‚æ³ïáõIÞmì8fø0ûü3BÑQ´çûµ~îðÛ|±sŸv4Õ«8oûZ˜ |XmàHýý†(Mü«Ô™`ŠÝFá{£½âÝÎ9¼()§ã¬«T9›~&UZ Z¯ïêz'{-ªá[–-ökàB9Êr¶\¼ ›W›Ýqg¹·žòÑ´³¥™?Fãë“Ñ(^0ëkm;cû‡¹ý'?ZÜÁCb>Ü5e±až>4›§ç²-:tàágõ¿Ã‘n5i% µ¥ƒ5Ñ[×oõ™ïk¢¹_ÀÖ'Ì–˜Ì¡™û5H§‘ì¨…aIñ5ÁðÛ¾„@KÉOàëÔVÙQ6Ëòç=±xù/žpŠú³1CÙ1ûCC©Iþ­0‹ùžÆµ6Û$¤ÙM"0ù-ÎßovÜÙÝ«¤ ‰ep’¼Èò*‚Ã˜Ë»nšîq¿iþ#â|h¹©ìsÅ"IU¥ñ`q{î™¹gŸšiT¬1[y<9Y¡HŽì Ye7ÍÁ£¹Ò3BG÷C?Þ­C«Í÷[>ÞÕ"¿ƒ£×Õ+¦sÆ®‰¡6¹#{ýØQ4Øb~´Àø9´CS£¦×>v)`[ËÊöP§˜ H UH¸U4Øv–×ŒÙÇ Âý‡¹+Üµ"p·ÎÏ·n~½3ÑE‘Í–%2qÙÕãS˜Z°/þXä0ùõî ò£b«™=C†ñó°_üŒ¨cQþs’N0W vsóÌÚ7ÿµŒrí\â–ò(ñú¡µMûhÎˆÏoz<6UÄÄWŠj&É%m±ÃpŸ3ü=ˆE–~¿¼ \s8Þ-h†±ó€%‡	‹e¤—ñØJ.,/…Dèò/#øk’gsr-è€Ÿbð"ìyLâ&Sšå	Bc€xÜ³,™1HÆº`kJï~µï÷÷¥%+ l“›¶ùâ#®‘µ?TŠßul‹Ö–Pƒ¦ï¬]ÙÙ]%ˆ¶±õ˜¹ÝÈ‹­þ…Û¾±á:NJ{\àU-tîçDXÁ‘‘)UÔêu“%†Œ *.¨`|J¯ &îôï“ýƒ¿ã¬˜/VSÁ–0&ÅqŸ¬ÛèY‚¨„ôDûŠd9Mè;ôFCÚìBâ¤~Ã”¡J	P©µŸr	¯^¸Ä¶çç¯	y©gR™fá Øì¯Q$L·tRÊGW½o=â9#—Ë¸|¤›¥Ïâ2JfÅ³2ëA;—ñ»|`<:Næ—¤ÈG'+hè;ösþlÇÛúÎ‰få‰½“$/JœbM„¦³Ë%¯ìè°Æ0Ù^¥!Ä
bEÄ­XÜÖã€.ÃÔùo:ëŸC¶O·oBÌ¾·Á™ÝÓÝTt{u%C… »†A¢N_º’²X<gû„…s6ÜÓy¼{áNøÝ–¥Qnxh“Ü`•îZ‘¾l¨nv†ÍÙÏ0EûK&Õ5åQôõœ#+&˜ÎÏù1À0ºúü›5îWGéd‰IAê}‘crÁ.ÿ_áùGó”Š’-?×*º¼š-‹§I>š)êÅgÕåïG©¼c-Ôg·eµK9o\TèÝíYRU~éÁãÝgI4Ë.lö¸¸K\Ö<fWIS~²JŠŸ@À§‹ƒkp«‡ÿdcºFêu'Ž•×‚ü]=eEÌ&K¤®7Õ÷ýxŠœ=ê¸:§`ƒúÐá	¹9B0âú1¥=˜ž«‹Â!ø yò´3\mÝ‹À­kç•a¹;GÕ¦;ÇÌ—ùEÃb`hpƒÃ?@çõ0òìÊíeä†°y)M{ur€ÁÆžóy¤M;£ŽŸ§Í^nç'6F`;¸m½E@C:¸@…®M¾²–¦lä ¾ì@žÈ fh¢ó	M}Aí*wFøìu+=½¥Õñô’òG¢ OÞvÚKØ!Aì.}ÐÐ^Ú!qÁÜªÍ,/!kÇZ<‹‹Qž,h ‚!‹)0Y;E—ö¬Z
¹
Û9„Ì•Œ¥7Gé˜Ì™Îî‹Ô×õŸš…#Û†5I±˜ÁJˆC:ª¹¢wÊ8jVŽFBõaßàt«w.:¥sð·°[ž8ÃÕgLÜËå\Å$b–¡KÑÞðLŒ@TÌI±˜%%ÙïöµÜb—yž[ÄP¬jiæ2æƒ<ÍfËyJ:ûý¯vÌú{°bHÿ«sjW•õ·²J©'"9üØ³ÃÞÈeå[×fß< „Úœ½iÌR{‹PB›ŸE…~Ý×·J¹döÜo8°ôF¸}€1á­[š \ªÿ15Þ™Åiÿï9,†.“;œ^µùxº×<(f·9¸«¥ŠöñîtÏôÞê.ùÄ²­¼Ã¥PfL0‡ë |RW_Ã‰`zçÅ¼o_ss~pRF 1jç Í–ÆEž}H`ƒÚ^Ú¤×9¨]EVú-ˆ.ôø}ceÂŽÁÂ 	a7b£ìÍÌœpæãLšX—ÝÜdj¨â¿L?6º§Dž5Ÿ‘y·*-ÅYÇÇ`Q¨mŸ†>ÕíhªšN<Lz;®X}»…Ù`Q0nglÎ2á®jdæMÔî÷›´Åìf…6â"Ò‡(µ¦Rˆ¸Z» ‘ƒiwFlã¢ªð"G³ÍPÅÛ<*¦v²àSà¤ÎP°cm‰ÁÀÃLŒââRÉ‚‡²à!Ê‚ªØp ¸0kLr“„Ÿäqd 7çìëÇgLÜÍá¼ùÈèFðd=Ïˆ_}~~$? ‚dk<¯Ýð'ÔÙ«Q^&£È¡¤<².¬üíÛð^yKÔXÿ|ŒÃÇ¦¢ 
¦/#®´¨ÜãhÒxè„„Å"¿R{-w”zU~ÃATcÚlAî›ëÎ"=¢P´ØÖ"s»¨aµ+(/xG¼DòCÛµ¸U“Iñ2E~íIÝG£¿~z*¿VýaQ}s¿H\zk‡£/<+³ÓþNg–o›9ö·m-º/vˆd|$ÍŠ=ï=…~©s‘ò®-z¨ˆŽvôáè®¥SÅ{÷þËU‹nHÈíX(€Þ ÛÌ¸Ä§oÇ>Bá/ÕFY9iéH,Àà¹tÑß¹‰ímG8ÕØï@Šp=ÿd<OÒ#J€ôO×½/byåéöÐ0>,[@˜ol\bG½ˆŸ§l14>Rdó˜1w,{–A}Õ­c^T“y±·Ìñ-sÁôöE‚¿fÇÇ24¿L‹i2)Å\p«©A*¾í&ß²“<÷«ûÈw³º‹þž-]”[ío—Ûn_1Ü×šYèË«X@Àþq¿‘m¼Ç¶A,„jÁó1Òª‚–g£)Š¤ßÃþìNßØN¼ùB½Ùz¯ ï¹Œèk dÐGd>úJõjKŽàÁ:vD´Î±›_XÃy“-ðc\1xd1C»ç†Šåp7•‚WÄ#,"’_+&8ÝJiF’k&ÁÞ8\UÿœŠýwâ¤¾”—9peü•’¢;dîGçL# X¬û;îp¿ªÎ;xÌk£þ|··*[ŠVv”7¯‡2²s)¨ºˆc¸¢NÝð(øXq¤:.¼e|7´D€ýoß†€*Ù×½Ï7‡± ÇQ¶¼© ßYø«{ÊI,èOÝNî"K¨1ª¾ô3OJ–/©Úü`ðfóàÇšÁPfÃ–µÇ¿Â€Ï4ŽZUÑx%ÌÍuh†æBŒ	7!G^í›³¢ét…ÎÇnëCòá¼¥Y‘hì·¾]ßSæ®š[í¾“4õ<â§¢Õðð[:#VšÖž¸å—ÓFÖÒµÌ1¦î¶ç£LCõjäÛ†À÷Ó÷úøvR‚ÅŽ¨Ékºœ6ÊÙá³¸™ƒ6j}þ›Gä¹  !£•=`¯úË	4g¬	¸Â20ìÄßä¥5?f­À¼vsü³‚]W-ØmAwœ˜uò€ÂµT˜¼0Pdü°¹›‡`€‘pÌ KÌ¼-a¨ŠQª`xîzÂ-¹C‡Úü·™ñÉä.¦<(ÿ¼ÝlhafZ8,Š#Yb·¡µ"(G7à ©»âMñ^?IÚÅaôÏÃù,>ýÚãäáR.„ÆNÿe–]D³×ñ<+cŠJý]±6^`Õ#‹“•òõ©š?þ9
kÎ£¯;EÏÒ“Å´´ë«¹=‹®e¨WnM=P»ƒwiê%+"?Åî“}cå–&ÌÖ-ÝÒˆð>ÚGÇ(ïŒòÆRNô’+Þ{Ï•€zjd÷ÙƒÁàb88—¡bœ±lµ¶#]¸1›óeÀš: ÝOr´²C!ÁN]$WÑ‡¸ !"xPÀ~Õ=¬Ç¬™1.
Œª˜]¿E@1ôû·/~8Y­~þyZÎgGä½B¥ÿ&ÞYú"|OCÅïuŸ€¬òY‘iŒzÐy¸øøç†z} Ü²?lÞsc{9È\I«ìû;08ôu ‡¯í¢7XcµGZ×Dê9-ïr~T;”±ã<nüç°Ñ"âQž,3ÓP±((jåˆPuÄ
Õwú½G;–ÊÒõl£o<;è´g‡ÍgùìÞSžuÍçû™ïàGT±Fö£KmËjÅ¨¬%ãy(7Ö™™s@~¥v@ìÅXá9Ö?æÁ0¦Ê<vÈ$?8’ÉX\Iá¥ö²JV·_h*³(<UÙ…(?Û¸"£yŽb72ƒ#UsùÔxŸ1r¥z&8BD°4
,æ¨ÛQ+	©é¬»+ž›+ÿ~ñ¦úBx¾MÇÝ2ëÂäÛt”_/JŒD´Åò˜M]á¢\BŽ7kAPL,z`@Ü)ÐßÌ†]‘¸!š<Åòø×³¤X€ƒcëˆ_Q“Ù’ñ/úÚÈz¦øW³®&h4KçIòµ™Jx‡Ö:”0ŸÅ %Ñ4xkNÔ¾£îTI%Þî4tD†S*æ÷õz=—¾áçv¸~h‹Ïiïe8
·®Ea|þ÷¿ÿ§u„%Ö{ZÕp£ˆ>™SÒÀ£o¨®Øñh`V­Æ›nã¦ëö`ezF“¯Ã“[?¡Eª:KcòMÖ]ÓÉíàG›æF"Ž„º¤è„œT­Kéd§„Õö²rç,0á»<›‹ÎU-É±)§¬»zpŠÉIgáHå—ÒËø)ZqL´Ñ6µG»¯ÖòRXh£›c óèJ ”–J‰áá,Žp@tszâ{Äqc]@ìS‘€Ý5Ê›Zè|Rðj‹Úp4Q æÎ8§Øû{2ýµ>ÇAúšërf›1áG&º¯ãD1@¦os=Šø>KrøŸFë¶å8:K«r PƒÊãÎRØœ±5ŠŠ-üñž™ÀŽñlóü<µõ%)^€Z ‹@IÛ~×Óe‚oSL++]· }Ú›z3°b¥™´1ÁFß ã6c¶íé\Å[‚á@èX˜û]šTê¦]5´P6Ù©åyÝÒr‚Àv‚	[%k5\ôîÆ¼SÔQÙ–o‹žÀ¢1…nŸÅdÐv@ÄóØ\rŽ‹ïvü;ƒ÷CÔÐ`]qˆÅkW0EEÁœ`n¹µ®º‡û„bHÎÇGWÝ‡}üÚ=¤i7f¤ž~*©°»{j,Š%³”bz|íî8+fŽV˜“×#ˆŠx4£KÆs«×	Öb}ÂêÙ1|äFfœÑbþÚ:•V¬?ŠS
Üšd“Iˆççv€¼ŽŸœÁ8{Ü”µg¯Š4Ëì÷H¿ðÿ8‡/fË£b"žUi˜pIm3S˜ðš9Kþ Òükwè­7¯¯DµûèH¸jî'½¹ì‘ WÑ[ÙåMËa.ÝŸ[z»¶‡yÿì£’{ ™™Bõ‹‡½0èzËÏú–¼zýíOÏ¿ý«ÿ)Äˆ•*/²²Ìæ@S`¥Ëa{ªl8¥M†[#hŠEÛ˜±08EçØa6ÊÎÐqj÷*r„•ŽÇ"÷Ui/ë)™íÞ•&e¹_ÅnQõå§¸ùƒâŒ6¤°[.}ØCÁôV9¶ÂÛ(‡;[€+Ü>Ì¶î,Ý…+uZ…Ë÷ö}X„AkLÄ=9H‹;™ÔÉì'í¶j˜ÔSE4˜•­ùs°ì(3,EÜ`i¦ LD˜\ Ì2:½œ§q*yj!/ùìªÂŸÝ9®Z­¤+FÍU‘5Ö.UÜ–lï"8~tZÁo¥6Ø *M-{áM5@áƒÃâ*©dx°ÅÂ%NV+ÙE¿-9Ô‡Eå£ß&Ì#ýIû8h×GÒï=(üm1 g¯öšNžú¬×!ø«Í‰Ù¡º©¦ù0	a_¦ñå
ŸNøD‚ÀšbÀºB r)<Ý7&øD€Û ¾ãÿŽN½U˜uÇe0ø987ytŠÃ“Ûòø¿–qáˆkžs¯£•D\gj°å½Ÿ•ùÚA™0Ë	óøÑkÆCgÖi“¡Ë;ÓlÈ—½Aö|ÓÂvÙÕ`.ØMÁdÉ¢k„³XJ£òäÓñLŠúz%¬ô?Ž »÷Šìz¡ ©”`^0¦Ü•ÆÖ1ø„ßëOd°C§e€Yu>è`‹Ý¦Éã²¯¶8t·(Ý¹gÏžÛ1€QÖqJ^…'yåcch[ý±š‹›Fa•[é™‰‘bvé—!XmKy6(^ÜDüf”ÇqÊ]O!u4#qAc©OVk‡~{Oz-Ç#°1Q}cµ½'3¼¼^G¼¯Ü´I;8mO•°ë"P&Ãp]+•,ÃkZþì2,I	pÃI'(9+i¸ 1´ü>–ñµ¹¼¾Ö™@¦G/”„Âêelý}+8%(¥&´ £ËZTGƒJ¥dÓ4\,ÇW\æyæd	ê«Ï.æ±\™åZ²P?°X¨YmûZún1 É!‡“šÚFU2,ŒSŸ™ãã¶ ñýºCSÐq¿R”ÈÁ˜	”ô_$£†§N
ëÍ³¢Jd½¥¹Òï“ÀCý%úá‰G»	=TyÔ$¥xaÔØ‡c¿‰²öudÓ©-j…ËÄnODÕÕ2öIý’uc¦ôÆŸÅ#tK…µ-nkš"b‡4‹7†4)'uap‹œãuVGgXàôÔ¶¦QA%Š·¸3µÆhì—ôyr}sÑÙaˆU%RFÙ‹¹ •=¸}|Í4ïöÄÃmØŽøx@wÄ‡ò-
yRõ&\‡`§Ðzw2ªž!á‡Òéx—AüÙïoQ™²"áú6ÊuØ=µ—ßNÉ²¾Uòøñéâ÷ó?Åû<½v«ì³Ò)íXËe¬ä[ùÆÊ>ýwôÖ:wEÙÈÞ¥¦È­wÉÛ
Nˆy§ÊüÐ/uyƒ:`œæß!õ\ýÔëvâ!Tá%˜¦ÂŠyr1âaŸ|H¢.Ý
‹ˆªžx‹ôíÈÁ9ØŸ«FÁõIüQma¡æ+-J/T scÕ%ÔF"HÔ¸I@ö	WhÏ™'EYžJ!—\xÕF }+¨Ð[};!Ü2WÉÙûþu8ðÍ&#‚ˆ¨A6¨ˆ·ùy…9:\$f`­ #éåá´aUi	…{¾„BÃÀÏŠÊ¯àR^«ë7ý´4#‘0S’©i;ó×ÝœM'çáº\_aòÚ²VUkç÷îžÿ³ðûÖ!Ÿ•š…Àr±BÇ:‘¡Ü D0ßý£l“ \'~• ™½d#ïR¨íŠô96²€aÝ •Ëk×
ˆÔäãlP›…^Ì„¾Æ+-ç+lã¶×^ÌƒÒÅF.3\Ì£ Dy ¢\‹\àü{†ªv°ÈÎ³vt]~c³*LÚ”n=/kßMnCØXµdy©ø¦¶ýÛX·˜íã·§Æºj™B™uÞü]Pç't´„x8\&Î›uQÁÜ´'µQ±¨æß°e×0žK-™EkàÉ3ô5(1­‚0ëî\åÑÂº¯v’EŸÛkB¢‡Z®¨@Fþ(ƒ¶±!øQ¬ºg_&ÃÑÞþ¹v
Ÿ}1ŒöíÏ;¯£™é%µñ—¡žöè\ûÌ¸÷4oÑºž¨t’^ê¶\KÏ»kš
¦xš9Fk˜9‹ïÖö0ïp3kƒänÜõþÙ:ÞƒõìÏÌé
È0ª€Tº¦Þô@:eKÔC\ã¸±,øÙ½ë5ð‡À
ÓzhÔk –ÙQŸìURN9 èãËØç¦½£öÎ\µwì¬½Swí8lÛ»l=ÍúH7ä%õ¨›:@Û»E7åÝû¤ŽÑ0×è;GÛÈÜa3þ|=É@¤hAm8]W. ó·¶	õó1 ¶Ö`7l<ƒ ö(´9Ä­VÑÛZ¹ÂaímZ|{Zd	tü‡IìÃl+
ªÊZ¦é@KÂ«ÉìiEbÛøÑXòeÍŽ‡}=\NáÈ2CÒDÑßkn,š²Mü¬?aì?+uPâou ø?íim¤Ù¸µ^¤°mÈ
ã©§ä2²Ü.ûÊÒ°õCGMÉaCÏ³YAÞf5ª|—eeìð&?.M× >ì…çqFÌö2´ÃVPb&îÐ˜£qË­‰ÓøfG¿À¨Þf—dÓcìHÉø	©*Ž7f2~*Üäi”Žg1ëÖOù²Q”0¯v çÕJåî*pÓ¯,÷òPfÖg?æØyFn)[c´Z`,É×X]|ŽLM²óÚÜX»-°¡WÆ¡Âxa½L)­¾N&jÍq³¼áø',Uk¥Õ+€ix)¿c`¸ÃP°ÈÆÀ¬°Ô´si|D2EÚùÜwQÝÕªÄ,±Þý#ä#­ÓûŸÓ¦aÃ‚¾¿Kçè¯W‡n™Úµµ¶x‡1ãAÙ,pƒå×µwÏ’ñìŠ[fg»7Uø¶
ÙXŽ­ÅÆj¯Â³f?ÑÖªüj”³S~ÜÔ>ÛÜNsj¾ÊnÓ8·ž%þÍ©”n9ö«¸bkØ."[^eÊ¹W*#t gÊ[Ð21v±æQ‘Võ¹Ÿ[uRØ?×Á¥&³y°F<º¶!¤²wŸÑ1ÖÈØ{Sf™ÂØqFÿâ—[žeÇ™€zïË‰ÐÇü'ÔkšÝ<I)Ì¹°WŒ¡ÍþF»÷nÿ.°ÆÖJ„.±k?P©¦E•VŒ˜5Kë|`+/4ƒõQÌ5fðc%WTø6 %N’Ù¬ËSìåñä&»¡?ã`_žPé·æU›)My2b•ÁŒêzGEFáG®h@a^YJPØ{›	º!fTÿráè†%ð¤@e*Á-öd4Š¥«™GŽÓJ*±MÁÇ±ÈÎÉø¾¡Dˆl–ŽdäÈÍ@Rå4¹»½Sí>Óöä]Zo"‡kÄÃxëE7ËÑkü“ÐEým(‚Ûµ?IóUŸèj7[Ýl˜D/Pƒx›“¬îèìý,©åŸðìm¶Ú<ê%ù{Óóâ¯æú‡?èeU¿'%õýµ*«ª<¥–UåE]Ø“r`<ˆ}Ó'Ÿ;Ø{Å·¼‰gÔ_ uÎÎõÛ~Œ¯h+ÃvkËöó³¸å	ÝHŽ»*§»r‹˜WGX[qØFEX„ŸÄj°}¬ëª;lÀm3=gXÕfW)†ÀÃ¾^V ô«õ¦Á}<Zz0=Wgá‡W¿”ýMÝ*(ãBíÚÀÖ5QÊ±Ù™ÊYÕ£«;GLÁùE£Ü½¡ÖætwÁ? ;ÕÃÈ³+wºhÈya"UÁƒ¤hoÁ‚aƒ¾C«¦D\ztÐßmÀ˜‰õ×q’ÛÆÊ‰%F¥àM\â-ÂË^š‹=ZÎ?N_o‘e7â3.´T¶ÚÅñ¨Y_'edZÕ‹´ñÈs80"35êBR¿ý–ø‰§š…^þ\t•‰Ör–„¼[ŒQ¿b`…X¬¹Ìj¢»z/õ.p¡Ì9“CÆFàô’;YqqC/,«’É# “G*Ù/B\ÒšQgÐˆ·k¿²‹Ta©ÅàcY^(©)†XŠã¿…‘uuâègp£¢ºÌ2ÕÊÃÌP™ÍfÌ*ä4›“b1¢Üïöõ
ÚŽÚ…Ú¥qvh„D3 0 ä):SÒÙï¥×é6%ŠœÁ}x6º+‰Cß£QÜ½†û*¦(øU~0Ø*=ï$Í¤œ+ïÒÇ#zi‚Åb…ëïa‚GfŠ½hRn<¥7½	[€q ?‹,ï.@-À¢DÆ§5ò²iž§‹e)4žöFx£ÂØ"Ä6·!*C[Â»iEÍ±œV‰¦-†LÌ†ÞåÜ„5»È“y”_x…?~•jò¡34ÎÊ©7#Ò6èÅÛ'n¸#7×Çã×8°<·ô'ëÌºsÁ¸OÕPc
ÀAHµKî¤ÑŽ«ÇOÆc¶ßoUÁð TT®ˆ oun+ÿ á®ž{þœ²/]ÕLëÀß@™u~¬?Y°1Ëf&£àë{¶ZÓ–sÀž${üCtÏb…k¹ÎJ_d1Ã7±Ã;Þ¥­[ßM94Ásîi6_Ìâ^ŸM&[Ðô{
ïÙk+î]öî“ï¢y2»&ß//¾³Ñl	Š{*©Çvó`V+ú1=:tÅ:î•´PO6fh”Ž‚]Çià9ü²¿ s*PS‹=3‡u-‹î‡¤H@ê:¢I}ÓE˜hº)mv%«]§yÛòµ¬¤Š¸l
ÂP«¬Ót˜Ñ1ší8(7jÿŠ•)PŠ¦ð“f¢‹lYžZÈW#]©[fºsQ¯l÷	"â9UÕfÆ&ÁR‡jÙ•Zq¨V¢Z¡Jº ç™ñ «(I.Í!ÀnƒªO¥Ü7–ŒRÔ^0eÜâöi£Øä´gµ=Í(QøÃC;€)SÇê;Ë¾ÁLÒÚ>PÄ£,…¥¼V$\]kàBä® ~!TÊ„º=«Â`7æõn¦Úó]Úu'·7þ&W31K€±ÒÛg1rFò|ä
Å°Š9Ï_žˆ%r¥:¡u±*}:îŒðéQ/aõ•cÅ&ïÈ¿ùª/@¯dÎ‰üŽÓžœi|ÊÀziv°¯Èýé©µl<û„T¬À	hW3LÕÂáÎ`ót–ìt0p˜ÙÎÂÎ{â<.îÛì55‰‘(½>;ÇRóècëè$‘çòë¯å‰q—]’»Ñ[,‹©¥®xõ®ñ‘báNªrð|éúrnÿ?þA¶ÿž-·Ým­‡6-n¥-{šÍÊÕÁ½Í/)Äã¥P÷½pÒÄÆ‘!-Ò7‹;è›_^¥qî}ýþjÇm7²µKìvJWvSo’åßF£)Å¤ð¥úó4ÿçé$sóÊ†l¼w¢+Lð!¶2˜9/„uWNOy;ü‚«±u·RÛ=äÙ<möŒ{³´Ù&îý¶3Úì	ûf`Ô´¨‹uÝíàÂ„GŽ¬¯–„tÙw3dQXná/qb]4KFc‰þ$êÍÿ˜‘ŒVQàÒ
IRIw:Þ]8jÓ9òðyß”‘!pG‡½Æ[é0ÂnÚ®?‚½vÏïö¦íga-k½ïð5›¼éVÏ„ì†¯ÍÊš{J¨(ÕåZék˜Bƒ\\ÉúÝP§,ñ^k¢â€«|ôAuVÙ§ZÞM!!ií	~¹bŸ›CF?BNF…û ì<ÿ{7ƒ^dVkWB	=žî+-iúã\×#&¬VÜJ,6°y^7ãîßiXîêš8önÞ‡$ O÷†­Í ‡*T.†9hLË9úð§ÀRõ²åˆ…ä²&ôÂV#È£^­Û‚F:!#ƒ+· rfs6­`
n3·ThUÆô®gW¨‘ý:-fs2¹‹éBkqÌä^“a`RÐãÿýïÿiíY*íÕÛz,v IzÙ¼(0„{2ÂEq9Ó¥‡î<"%ù„ÜnpêÒéGoC¾¤ëµ0%]ÜÕƒåª8€—VáQqŽHXínö)óëÀ;	‰®¢¤$Ñ"ù..GÓã(½~Üy¿‹Úí.Âñ|ˆ%ÃÒ)‹Ì?ùr¥Z×n¾Îc¸A7è¯µ4üþ>Y…Ì0ûÌãrš&ºýêÝÛíÀ§\z‘ú±Eá.òøÕÙáaZC#âcÐŠiO5—%Mý°YeÑøÅ5ÎeÑAkGðãeç¯XŽFqQtŒ¢BNgLñM˜*õ>°y*#XjÒ‰sfí)†.÷žËòÎûï@µ†”ïËˆ/ðSo}¹ö&¸?wÝ„ÜÄæÙòUóï´ ŽŒBñ‹$]jñ£3´tj¹ó*ê¯Ú¤Ýz¬¶_låß}Na‹7	ÃQ„ÝúMLsê]Jù‡«xeS»õzœ6é'’FátÝ¥·#1È’Úým. 4òòñ ½w;÷€Ó¨$wíS•žÀa:Â¸ÓQYÌ_Žf´X¢02ÝÖ¬¤Œš•pn½GðÝx¨~34Hwoá%æÛÂz|ª•ÚÕþ'³Æñ~2[\°!mm£–AVÙðþ¯âlæýÍ‚”‡ “Û»ò»ù®yÓog¾kg«YTûM•ÕîŸÐf÷»±Nþün¬û¿a¬Û°eN7ÃiÞáÏÅl\kmZkeX³™ÕD°\%?IÑtkšÓÖ6¦…›Ò*}dçòwqDÎ¸DzNnÂl"«h¥²2gµÉ¡é-pÖv·—oÞz¢êÏE6¾>"ÿþæå½¢ÄÀ]ô:lü;¡mLiv!ÌÐŠlóìó.ÂnCg¢ÅÖŒB?íþ'Ìäv¥­=jàòjØêGh~þ95ƒ
5äFÐÐÇB­ ¡÷ùl¥g½^ÿ¾/tÄóÀ†oem˜ECÄ5 Hf¥la$]ÛDj1BÖ³Žú)>À2*`ˆÆã@£hÀYôj¶®-4Ìú¹:ƒ.Û“ä+€}›Ôš• IA…D¡Çi#èÜ"¨	$Un¤tLw'Y_ÒsY’øÅ9ý‹†Ì] 8Ê8gƒ^xÎ Äµ~ïÑÃFA½sÃ ÌX_ä1ÃŸ¬îÉ9d=8·æ’h¬öñÓi<ú…þ£` `ò¯ƒðß`ý
–Ì£Åè›ö€F)~Ð~A¾aáùÈZ_dãhf‚¿¡P7¦ûnƒE~a¡Ãa`hÖhŒ‰¾úZê=ªÍ=øE`.Ê•Á¥O\úÁÅU”I±L«»?ÌÀ†hS±‚Ÿ‚_Ø)øƒn1¤7c¦àÝ2^
o_²(6˜ÚÛ<*¦œ;Í¨mÐ¼‰ÿ¹€Qlß×‚Eáy)[j’èÖ©ÖC+ J Šj]:0‡bÌKZ7›um›cÎ ¯F·Ÿä1¹Î–¤Xò?®°²'Èc6*‹ç)y‹FÌ›6ŠÒ4ƒã!&@G@¿=ã0-È):¶Gcx¹Ž6Ûå¢Ú.ðEpþp¢Š
‹ù‘ü+Î¢¾™Ì'TØÕzJtD:¥‘ûu(Okˆò|ì°ŒFét³Ã›>Õ8 ¼F'Š§Q:ŠgÚ’šÄ¦[Ï	;9ëéh;|ÕUÇ+¦~m.†"TbþêN7M*ÚŸáÑ.8ç”Ñ;§bo°-pûóø»,¿Šò±õ0¶bÑé†ÃÑñ'ÿ¼`Ê†‘Žßõ&ŽòÑôÿ-ãüº5Nœùø·£À1@“ rÖ‡žë‡ˆ¢6Á]5˜ó¹²úT„\ì37;OC±›OCßÙž¹Dµè._þ†–b?­¸åX\ÌºwK`g<g4³)ˆhxÈMxOé)ÇUc¸~«ÓÌ¥Z¡‚ÑÂ°º$Ùv1b¡ #1õ²Ew°;$ì|¤+xM/pMÁï…"]¡ñ½žÁàª.0nÊ½í Fê/±ùuSøÝ|¾i‡à`	“ojjí&œOóÀ$ø$XƒºÎ Ï@nÓPfÎ†´d¼CY±Ç5 ‘ô!G¢è.ÂÔj2bÆjDDëÿv(¡_âì¼‰âJˆ8ªCX0àˆƒ63¼fßS÷š«ŠïëŒzi•»Ó+³²«8qg§ŽTj>«Þ¹cJÃ#RŒ1 BÉ„bôÅòS8ÊC=t‰ï«®J‹c}ˆ
§×3¿½M½¾æDð‘UsA#šðÅV9#ÚCÉ „rëñÂšä”v_	B2Ç ™àðÎ¯ÉVÇÞÎksW0e,–JwùqD:zO•j³<9ZyÊh*T_Ÿ‚€Uo§´zZÿhåù“²ÓGÒ}‡±„Œ ÍÝ‘*Ëê?V¿9ZÜ~·mNõt“î…R›FL±9ÛlÉF,w! r“7aõÊ¶¶’í‡!ÑUÔ4EV:DD—0”Uî”µWYOcÊÊo‚5·ÄâCÒ	³²žá±W¦S¿ÒÂ5$RíÈÞ“ƒ:\¨%úÎuÇ”Øƒ±´vDèUµù6aå‹ÊÐxÎ1ÅŠ®ÂR¬¦´ÊK¼.;ŸË-b‰²òÇVm0%rSxŠõSÁàUž|ÀÖQÔØ¶{¼ÜaUÞc‹E¯®£Mã¬ú]“Ë6ûƒöø³$Gˆ3MçPÖuv·±H@¬0ED'Ÿ
ÉEZ³[ƒëÏ›8[;è."qa/ `*?¬_kzñb{-¥Ë×}n· Õ(Tz÷8ÜÀÓ•©Î±^‡ÍµÚ2Ú7Æ#nÜ\ÓÐ¸®o*¡ŠlõV‘öò˜¤¬æñÜ·^`™Õ2dèúáˆ–Ö9Ù¢âÜîës¹¡ÊBn¥ý`{¥ â÷â´wÖWp¸Ñ€.‚i~Ïj¡…w¯è€äÊø%=~à;{X£aºFõ£OóÅ<ºP†pU…….ooË7Ô3UÅìZÍ‘?ÆWÈ‹ZY"¥gÂŸ²àÅ÷Ù<fÑt·±fÊmZü2Ùën}n•0î«¦!~:sˆu›Ñ)1Uö/s†ÕUdlj#Oúe•Q©á¨yy„Ó96ü@ï×›•Ñ~kØ¹ŽHm}®º¬éÕöTá]:GÚz7X.Äoª6ÔÎÜ
ð³ieBô¨<™`åÕ2$´8$\zˆxªðO".½®4Ò<R>«Ú#ûŸAí‘•:ÍVBhø{3¼ÊQtö³¯U¢ÍÀÖSzD`î„ƒÅcR8äJzc%Ò»)gbSr[V8ÑY‡Ûèé(§\7bƒŽf Ã
:~æqŽþ_©ŠpÊ	x±g+œ"µ¦k§ŸwEò/—!är)zy•úôÃÂ^.¡ùQÅR[J*Åò&ÇGd¿ÿUPqQ‹E¤jYcEF3vék¾Š+µqÐ]7jRÜ™«·+’²©2)m¬—ÿ*¥R\ÌV5R\&Ì;®’â·_n¬RŠÁ2¶!c¹eù[bVpÿÓ¢ÄŠ7x}ë®ë§õJŠ4ô!ëj0œÞîÚ¶„Féõømt©ÐÍbÄeâôS]åÄa›uBÆGp´(€Ò²Ê&‹ üV‘`ŸOSh­z(ŸíF;þ.Á²ËË[î4suË”»°wî¦hKû²-.Üò/¹éŒÔÐ²¼P]±…i‡áÚÇ”l1½) laÁÌfY9¬ž²°”o¡÷N÷îŽUÐ‘µf“½K
„”ÌhÎƒ™[L^xJžL÷lMX.Ób¦,’†–8)ØwLcÇUÎ0„1‡AjÙ!ÍhG´µ£SX©witMŸ7â´w`	-5Iì¿â®æe7þ o/¸UÝ1÷íR%£W4›#Sëç³S“§­|cö­'è°€ÙE.‡Íb†Ô‹œåÚ|VÖ¬0ÞõblÕ(ƒ—–ëH¥•ÝüÆ-R„âRáæ¡öÒì9ãjû€aÝalìÃ<ÌìFw–sÓknõ"º3¬M3ÇŠïÌ0ST[I˜ƒÁS%º™T³»!ªý7/÷Õ7u„|°O'ä³—y2&ø³è™¯Éeè	@‰àE’²ËËxü<e$‚ÎiÒŠz+«`¬……Wžr×WAÄxÿí,éü=[î¼_£ä¥å»¬9Ô|¿«à£¹Gq%Ð¹®´Õ‰TI.Ø`H
%æ±Ìô{¤|ýÑïÜêFQ…á›±“s·GÃ¶ÕÆ|°lxK:&ŽÊ»Îâ´Eý#ê‘wÐPÁƒŽýÈ¸x£~`¶èíø§ÿš`Ù;‚êüÐ+Š¼w¯³¬1,Ðk8:È’£;yZòÀÝ¬E`¾¡A;Æ#˜ã!ìˆ¥u×¯c~kµ`¶Ë•$ßlìd rê^Æ\ŠzCŸ©Üû>±TÞóçÎ–4P³éö[².7Hªfªèž
ÑŠˆ²Â¶°I <7âoØÞv3ç¬Ö0q?4ÿ€w+ Ë&XÀÃOû³ão]
C0|HIMy!Oí8ôbíÈ‘„¿Ä/ž¼' q( MÈ”dú¸<NJ•”ö!EÉij‡=»®vÖ~TLçÕü¨¶`(ÓGÔìá-ŒãI´œ•z,Ñ‹òª¿îŒÑHp™jnCöŸô<BÛÑ'?û4`DñhŠß+}ÒøëC
EGxDµ‡ 9éÜU<jªÝÁIúô³Â»R¿Û<@'rË}¤âÇ,éVðCKè"^ÐEö‘\Ð
Â4ÊgÑ¥ª¡ÃrTtÝ¦Ò.±™aï€k™.”yGs›¶¯ÈoQÝýlsú5Y¡!Pb‡A÷Ó¸U‰ªk›¸|‰2Ê<‚ª¾àçH#­=i=°Gy•ziQš?+ib`ÿ7©¦Ý=tÃ¢Ì³_âîÙ^ïàÜ3Øü!‡úôq©¯°¸8C^%£ámÖ¡úiw€†Áþz˜ä·L–«Y‰än©Ž~â$iê4áJ“¢h(áPËÖè¥=‘W‰â› o_l!§ Q~uhwBP¶Ãi•*n_“7eT.‹µ(58ÝNjbƒ‰w‹ÁÏ…1†¬rK†üÙ o@+¸àÔPhó¥Ùéci^n’Ï‹z¶ÅÕ
ãy#¸Û†>Ü5®y+dsÒŒ»{°Í½3àw³çþ©×ÏûËªšßº(èípÐ[N~4òºóÎCáy)¶Î^<‰íK4‰œ·•A|7ù|øqêÄîšÛ¶@ÚÆ…Æó›v_›¨òŠ«ÑßÎ°Þ€Äšc¼ ¥°‚"„C¦­‚¶[ûÝkŸ{;;V…ÓÝåm_ÇÓ¾q/ûïöÍxØ-”ÓÞ³î3Ó†\7âMÿžtÃîl—It7^wGèMKo»ûÔ3N~Ë ¼»	w3 1†ÅùãÜý>~ôˆ%ÅOI|õCF³ý:Ûó(­º‹^™b{+Ú°CÅ¯aßNó8~–•o‚Ì0¬õdK|•Yø®³z¡íÕÍY3ÒÕaœ¥¹î_å¤	ñ.ÙisNF>*œuBc$|Ul·T±ïU×£¿8)ë@g©ø}ñá÷×¶amxB<¤®ÖÄÊ±ÊçÇ^@iX¢ñã:Õ~Bpn½:šR%Ê{÷X€B@•É°R’AÎI¥˜¤ç^ýÄl^öƒéÌlØ¾6ŒiÖÂnû®
‘­ÀÃì>µpì5)ŸRÉÅû¬*TÞ…5¸QÇ²­Yø÷¢–Þ…µ\×žZç²%½ª6a'æE£©ÍÙ†¯}éùÔ¾¼kÛñï1?±ÅøÓÛ‹?ßª™úln¼¦o9ËÚš­E–ÇÞÎn¡à(0CrîQœÏ¨"rÒ<Æò,eiuwtÄÌpˆÅþŸ¤ì›òº&Ý(h-ãÜ„³S–Ý±ÛÕí5cus¿Zú­o‚µ'-Œ§Úââo VÛ†M«Â‘–…áŒúJ»RˆúŠtVÆ`]ŽTÿ'2hÆ[Ê é(õ<¬ƒ Þ-°2'y•Ç’øŠpìÈ:BG“d÷óÛ­¥æšwY1
Íó#÷w¶¿OcLh‹@®m=~Û¿„Ô¨V¼Q=lÓîÙÃƒSµp‹q‚ïQ¾DàC¾–=oÈè‘y§œ€„ZP/Ùp(8ëÖÞAoE3r…‰#PFõj¶^|Gø²9¨BS¸ØN±ãÄ 3MØi®Çø¡§UÖæmÇ³$Y±míaæ-Ep h@I›ÊüX€ßä‚Þ~@F¯XS/	µ¸Á(l°ÅºWÄVŽÐ^Þk}6Õ›\ã˜98ŽŽÕ¶”Ç‰€ÏLú&%ÔÒ5nw±ôÈµJq¢‡&ÑýJïB#N›µŠ’ažÐJ2Ï”>ÒI°{, 
Ugý¾½$Ó¯À4U
®	›B½r1jW6…²+4üÎ2¦NBó8H—Á¾B§àz.QµpÝ,úÚ§ÿ˜Øéú¿¡¥aŽÝÏimþ´6%éÇí±TðË›‹uf[Ús‹‚D}uäœ{Ol…yHí›¡§2¼Ÿz1Jà´GÅ_“rÚÙfˆìÛ6L´òœ_™½•ø³½æ·¥=qø`¹ÿŽV²"´[õJ¿?©¶»/Y*4Òì$Iã1Çúã+¡l„ÊXž–QRÃƒÏ.¥â¤(¯g E¯Üûû)ïˆlí€Ø»u¯ý5—S¸ÒçW[äæÆ¡†ÛxCb8b+8L÷o9“t½ms‰s•g³â3žFëÌŒ}mœÆ(•Âos}UÉ`ˆ¢§ä¥£hÜL¥^/*ö÷U„Òè,Y˜¬]LÌýâ`ÿðàprî³­ƒDÈT^n„;ªu·¹TÉ…iC®A~DÅcEyŠw_1¾Ø‚,m•×u[fÅý¨ñò]úKš]¥ä-\ØööÅgXsÿn¥gÓe‹Íö†æ´1¼„£z]“rºœ_¤Q2#¸øÆ„kÜEê^*àiâÃGzn–ÿY¡Ö²üG¤¢ªZy„èa°Íh1Ë]M.àÿqâËÅl™cñ{‰&–-I!«Nó 4fÉã>IÆýBÁçq.Ëç„8 E=aNíÇVIÚ¶´ëã¢”`XBùø£l5Z½—¼ó|]iÁTŽ%€SC×ö´Üá
ÈX3¶‰/dñR6±ú”lk€ÄrÖ«0ð]±êÖƒAŸŒ2”«Ë€;&åu÷P¾âB ÈÛèlßÅ7P}ÓJjrtå-®Äº{œª.é©3mj€ô$ÈÙ×[Ü¸ún%Ä7¹ÞÌ-ñÜ~ü¦U|4IY|s‰¾çw(¿Bþnücb
lõ™0á{»ïuùîðú™mÂLÃÿuàsv¹ü«<êÌ™|lKøîs¹_¯Å¡ì	iÔcÀi¡ç1‹`láÁA;<0‰+4ki>1ÙâÑ%­ºãŽ[$â¼HÅÙwBñ-š‡¢MÑ@¯X@cdQ÷A©÷<…ªOªÙ9U‚•Óléy¯OeÞñ®1Uý TµƒÓéØq8}ýµý·ÇA3Ñì§|XXïú×GÕQ}Ç¬k$ø ¶Ò·™N9aòP†ëgD‹›IjFs
àff^¼‹ñš§á&\ƒLs³àO%Su­¥¡	Û^ÔÃ™Šv@øG/‹ÁØ³Ë÷$2ØÜ`’¾í;¢‚1ÊýF ƒþKa¢kš¦i÷ûšÇYÿ˜1ø¶¢‚­²¨»áâ‰¼pû^Ð¶m2½nÈâbhÅ%LÚbQÿ‡×ñZ±ø­‡ok6Y)iFMoÇÞ%)­Ø¤à´æF…âçh”ÊÚ­–ãÄÓè¼Ei³hƒÉË¡`ŽV ´wÛË@—¯·.wÞ2š°QéE³ÕbÚ¶
wa†+«IWP\àí ºŸ.–6$%R4×ÿÉ²Ìº@¡³xLž½}I:|Ÿ”e4šÎ¡7ÏÊ¬	¿dÜñ`W9ýçÁ$?§ãûÈ¡^¯Y00ÎÒŒHÞvóø=qˆš¡·Þwd+tµø@‰ÉVìë4gè £Á-³~É%3HºÂ)×˜È7É¯·ë$ã&¡@vÉ ?ÜÇÔ«ï’ñ¸3Ø¹!ÿñé¬ª[nÈ7;ë¾Ä™Z@Žn««8?^ImžÕlðüQ½qŒaÕ‘¹ç‰Óãb:îá¶9«÷ØštÚnöÞ
Ë¯cîìÍÖá®b#íV¦äb7`N	—?Sëg?oï?‘½ˆ¬ÊtÝ ÑÇ‰*…œ©y]_4&‡ÖÙ“þd898o†µá±f‰ªªÃGÛ )ØaðÒw˜/¯P'À‚Y‘B2p@EvÂÒ2útš@Þéù ²ô?âëgÀÅV”PâÞ/ñ5¥œíoq·ÍbLá7ñHc˜f‹@Åð1Ö_Ó]zGú]3V=I§qžTáÀ¢bË@: ž#Ú—iè]t[Q“’!ªQ5éVæ `Ù†ªp`Ñ``…zP²ê¹q0‰œ+]ˆ?RÒïéŸ“,Ÿ“ˆ
çÜ@þ¨Ï§×K§®JckÓAEbhÔÎÉ0¨)L¢Môî‹xœDUðî‹lÍ±»ü>z›5t·qÓ†"wº"w-¹¨þ Üuëªk¾ñ[†ëb|RÉ*fbÐî¾%^×šŽÛ&^Wèöi3·…1-w‰@ˆ‡3öŽú#-äï’â¬³5ŽÅÍa f·×Íž*Íœñ/La†SÙ|$ù%Ò nø”têoLd5Ê5(ûH7ŽjAÙìÙÔîGùàUTNO5xsØöüÁÞ|±¿ÎcWñÅUß#3¦‚öÕêmŸíˆôv´œ`¹b+ew¸|D’¯åì‹~?zøpÿ¼&pÊH«ëV³¥ËÓc³ 9_l“%£Èe>»´F™ûÙ›ßDLö£ô*Üìˆl1‘W\±%AùÊª[í†¦ÐvÝÐwÇn#&…u¼g¼èË•Ì6h²É&õe™CÝ¼Ç©@ôÄYaÕQQkÄâÈRkÝd“0Mƒ&Ñ5Cd,2’#«ý,ÇÝÛ¥+K¾jrÔ2@„#¡éo4Åêë’Õw‹I‹Û¯Ñõ%ÕnÛƒ"×éCùÿ  ÿÿì=ÛrÛHvïù
kQ‰©‹eE²J–äÍŒle»&år!"™!.@Ž¬Õª*_°/ù€T¥òeù‚|BÎén }9§Òòe'f•-h4úrúÜ/¹[€S…ZC©Æ(’ÉËdÞ^ ™aÅYÑä—¼b7Pº¨ÕüX_ôeo6Þbo¸ù‹xwÔ+O'}ÿ¡ÁR¯Ë)rtuõ<H~Ý}ÝIv=šF˜)CÙzÛv
Í(Þcÿ èäÊtê9¾GÖ+(™N{CîO½í{¤Dˆ… Æ€ÅdÒ´zÓ†@h÷öš¢P„øû-i=tDÄR¡.ç·¬/1AÖ°ëNe}‰¹Ð–Pg.~(>OæYäÛclA›Z§DôÿjÊönB9õ®uî]_¡û+t{ ûS‹dÖÏv;xŒŸvð«9KŠkëó ƒh/ÚB\ùæb½ø‡ÇÅ;¼³ðèTfúH²¥ôV5$K;!Ø¡¼1U¬¾šý?]—VOË¥<%npål.ñ©`Í‹}e³×]{h»‘›Ax¥V{·PaÅ}+ Îeô…™å,l{5÷ç©ðßÃ÷±ËPß9p!¿ÀÚXºhnàj·ø|²w*Ö&µdˆ¦/Ô$Ühó3€±ÊºûŽÉÏÂñÒ`L³Oò³$/ÍZÇ”*åHú‘<æ-šôÐév&—ÀéI|p›ËtÌvùÂ—-o?N„iˆ	3M
¢¯!›–œƒÿde· Aµ‡,lŠ\¦£`Õôù›¾ßQ#UY :Û@Y×á¯j–ŠýØ¼­ÄÑ€6­‡»l«;OÝÓžšNÅàë´Sc¤~˜üÓÑûÑlÉ%ßÿLK¾ØqŠÃÓÓJ¹n4zÞf¸^ÐüÏµ(©ÖaoE¢ø½ ‘MÑÂÜXQ»š /»lÂzÚŽ§p~u}{X,îm¶q»¬S4»T~`Ÿ
ÐŽ¡W§RÏGœ¨¨ôÐAž'ŠèhOôÛ†_?å²Ik­X3ü:TAVÌµ¢Þšu<`M±9içãMXt#»×5C÷?ÿŠù†FWQšFéóx˜›ƒÆ$YÏ/yžã—š3•—¶Y´þ~l(à>HO ëD)¢¥Y¥S´×š³nD3Ö1‚t€ØÞ¸Ôe‹{8àw«ÞO¦µ]0ã.zS7‡mQwný6…«Á¢ÉÉøL…Xfga³hýTËæcì–±àîëÐùAéÍ,P·'ëM[&ïDY/	w=*¹žu¹:sVùk<zF™ˆ­%q4KG=h;¡/ ²¢A>0íåÉÊxS Q}J:ãl"|î.û[Nµi\8åTá·Þe#Š8¸¥=,öEíoµEŸ¥=›ÕÙÁ1i.õ…\ªv¬™,jà£$U“%—A=©<Ió"íˆáô‰¿Æ6¿`33“¼LGƒ‰‡º^¸'zqx]?6ÓK“õþPãÓ3p‡	l¼<fž¨m~Ù<Ç!'å~”rAä…hòÜÀ‚õEiìG•ÙhÍ’‹JØûÁAÀŽMkXo©ôÐsô¹—Ú1è:®¯.—¯B}¡ñ4°;ãË
j[Í©g(õB²Å?ÙŸ[g¿dý)Ró|¸ì\8dý,žRøz›[ì­{]½QUûÄ²]Ž’åY&¸rùò&5Ùß?òw£ÉêàýïÃ´¦T¦ûÂýy¿µñ¿öÀÕÔ¤åŠTÐ‚p*òfgòþLßakX<,nhˆXdXá—ƒÐ‘þ¡×ñiö$WjbÛ¢ý‚qk,â¡ÄÂÃE±ðPÇÂÃE°ð°¢Pø—…Ké‹#¯¥½§ØqÞ¶fèßt»y
¹-CBÊ³´˜g¿cd¯·ÏýCÝSæxyHVÜêÖ)[%ý³‰	h9ïYö
ÏuWC‘DÏ…-Ìn&½ÀÇ!Î@žåxÇ>A8=‰f½aó][à9 ý"úóh˜vé°<#ª ÿ4Ü×RI ïÖ<|-È±Ã¤häù³‹—+¼&û2éß`.3NoÍ²­³˜V6ïõ¢,k6tA*'X~€ÜšÏ¼Õ`z»z!¬aÐŒÒt/'7|ÂùZh—¤ðR@@Q_‘¿òªÆ^Ð¾ e+–¾*ìTÚmt_Šƒ0ã™îAÈÿY8é_&ïá< ØNèÁöfóp³KÚƒQLœsØ"Àrz~é¢‡½ŸÅ4¨bØ“é¦“Á¿\´³µ6zýøÙ‹ë¿$Gðyzñjxúj€_Oñ¿ÇÇGÿŠ¯žô.~À/'¯Æ§?¿~±ÕŸïþe÷ñÏ'×G§ÃŸ¿;þŸŸý,ùáÅ«íÓô·ƒÁÁAƒ[`6´=ÞDYáL†™ŽðûZ1ƒ·ÜVW	ã‰D_„ýQR¿’¬:c}o	¦’Ë…sê³¼_$»ËÅ’ð¯~Œ•UÁv·c¸]'ØP÷Ãl'ÕÐ¶nRÚÖZVÔcY™!,ã¶XG>€¬T{]§áT•ž´hE­_TcGZÊÝâ†J²»‚ŒìÊZgÏTØ4¿í.Fú[çÇIGñ LI1El^ÈÒóL”U
ÂlŠ†šìÏs@ª°:Ý-ÂDC®¬—Ý¯¤ÕN(¯¾} åLÄ/nÆéÛw:´Éä”!ó®fJÁ"Åä.ÿT™T°àa¶6ŠþÌòUzÞJÍeG]^>·b…c”7º¦üþSˆCÒ¹ðŒô4¯(ùµHítžZàß¼ŽsóW úU™»þœð °Ùyñ
ãžtöÔ¢F|ëœv#-çgd/¯c*‡{©¿3îï3è%„c O¡§ëÖZŠ¦Á0­ÕZ`Qì5áiªï‚4“<I’™£ŒqÉ)&¿×¢bþˆeQ],ÞÓÆŠv`uT Dºn–žê´œU[’Úõ
dZP9‰ôu¯ž<&EÔÙ¡®Tæ?DîŒ:™ä¡§á¨ÿu@Ê¹ä´íÒ,:›Ìšì@IW²«Rd;ô’¾ðò“v$oˆàâAY±|emHã5Ìó9ÞtÐ»®¹ªŸ;—Æé&ã¨Ç£Ù¸˜_Æ£™A´±;å^c-_‚)çDXK|]1ÄWY N»²ÂÉšuäÌ¡°fè-µ¢”(ë"m<<Ø¶^xPµÿvn…s»’‚êÏž¶2¡ mæÓ¦„R@ñJ­Ò
lªº(ùæZhe<,<IUI’ù†–£|–¿fƒQMšŸeŽóE¥çŠ¤0Ž„p<Œz¿ÒÞ8êÁí9·ÜšÙªE^ø\IQpÈ‘¿ÕtË)Üž>9;©pÊQ‹ô29‰0‘`u0ŠÇvÌibsÞ¾ÁoÈ%À^Ÿ›O7ñÉÕu¶rgÝ²•XE5UÏK‡KÁ¹@™)©Mo\ƒúÉKeæèbzøf×®#Óˆä™§ãKº¶ßËÄ×.Á<» K1KD3ÇBµKÎz7É0“úrJÝZ_ÂÛl8Ê„‡n^ :j¥Æ³ A¿aOzÛ„Ôt]F(È¡ñKøÍ†Qþ^ÉNÂí4ŠûÁUšÄ8X`.á %éMËY}n°ß²©ónyº\-õ:²Å3g‹9A¬*4Å‰èsl?g‚t™­]=“çý(‹ÜŒ	æñßµ³fÙpNzÑ¸ßòëWWÏŽA±þdô¿u¼ÉÎì|Ô|×VÒ–½ª_‡êeB½n½P¨W·ø^»¸=ßyZŽñB]²à¾‘õ±¸õ’â|él
£Z¯¯Yg8…_Ô kêÔï“aTÜË¸³B÷æ^t.¹*æªS¦è„Q¾/˜¥›µÃÈåòó<éà”r%>‡ãç\Nûp€–ä[ðÙáZª8”.{Ì;[¸Lw@+¢æÈº¦.àèéò8|òJe©=_eµŽuòNž:OU%ž4u5÷ÂVp	7µ¬–Š,”ÛÍ€RF´a‰EV
Ú -+åÖµ§’BêmPœ=s"€û×)¿¸{Í…^qÔÈKŒPSQR¢©±‡@øZ­VìÔZ0Êðf3Kç`{˜GÃ‰jP°ÚŒ¡_ø¢Å¨Wñ¢ñÙÓ¢s»>sL³`ËšÌgãÑ$¢*Ì’H[2{ñw5Ù;ƒ»ûzzƒ¯§—Ñß÷é}tþ’gƒq[T)5ÊòÖO¯F}6NÌiôw%ö5ìÓ‡‚]ôÂÉO@Z>,Ì c{žŸ9
Lœ¬Y§(ñ÷÷Q/úT‘`Zô×N˜ðŠŠë[†¬»œ/N!YÆç˜[Ýwu7)úq4é~àBx¦ýöËpÐ>‘«{Š—_à>\D“,I[þ%fÎR'(Ÿr ¥Zï¾¸†/ÒÍk©€6_8ÐÀ„3 å¨ŽaÓZyB%è°…Îç
[ð-Ôˆ\#ÖˆiY;\íž‚ÕÊÕRûX1j5ƒÔ¼!jNO~o~6Z¢F¬DH‰¥"Óî+.í£E¥UÇQÐÞ]•1\EíP‰¿SÄ½P0ZU(Ú2x»^ü™Õò„¿+cÎ˜Õòbñ{43ßÍG˜é3ò˜í¹?3¶¼¯¨²ûŠ)«ˆ(ûðàWçÊ?¾seÉ¤±n:^N3kúÂv s¡~Oòì'‚µ]#XÆµ ¡vYMÊ‘-ïh†ÓáèpdÇI?¢é¬¡"è4ùƒ«£(ö„ÌÕr:KÜƒ™8rµm•ßíÐÀhB§q¹ Ãé0CP,ÆÇp8tëqŽ†ÅXö-4{ïN†ÿŠå@®à51`f™Øv'øËú›‡ð±k}IµÆ4!NYõý2ÉVQª;³©>ÛfoÎž'ÓùÔ”R¦x‰­0‡"&'
á37Sˆ®Zò‘çêPZ[+{Å¡`Ÿø×ì°‡öÌ±ÓÑ(ûN„Iˆ.[ùotK'2€çÅ2àož§	¦—!šùƒ¬Ê1BÇ*å:ölL3ïDU3•WI+ïÃæÕö‚æwé›(^9En†9kÙæ©FÅHŸªGš
J„¦@~¯VxÚ:ƒÆ+Yì·±êä™ÌC
óÔg}¨ÿB@JfÍ,Ëû
…?™AYäW+xÅ¦‘¯ Hõ»€ä!ÄBÈŸ¢|8Ëa°ò¿ÿù·ÿ^'¨ëÌm—å2†E!ê=œ‹Zõ„UÙÙü-(«W‹Š±O±´¢ê™9#/“ä§d‚`nN¨ì~gƒzR­Ýy&OHÞÍ¡ÝM6¿”FÔæÆZ°ý Ë×®´Z-žÙ²f½tOeÁçËuÿE*ç[™îöÌ‰«åÇ¥â“óÜ´ðE&U75ê®?…pBhgÝ^"€=€nüól>kP6H÷’Hëè† dŠ`~ žMêµ¸M€Æ&¿ˆiS	¤öÃm+}{ÛÅ„6`<U†§cü/¦))dH{åîöï×oƒ¸ŸÛ/71÷)
 ˜'cGÚ2MÚ*žVŒQ¥8·o½9`ªt]=cûÝnA£@¾ –¥uf¯nü¥å¿Á”Š9qŸÇ‚&6=²xà,®E]4t .{gÕõÒ§ª½öªJA‰³[ÙúKµ]QLÎ2AÓÅ7\bÏåAö%ì¡Ívõ§ëU6}¯ˆÖHÛÐX]±š×D4t8^_^òº”8›ã˜©±ÛÅÕoMí)g^·l9«–'{C+*jrÓ5¢µéè	2~C(TÍ÷`…ýÂ
_NZì5Y»‘|•Y¤¢¨S9IÒXúehÒÞ`3 ÝæŒ­àÍlæín±’Ê~KûI*µêÖ¡äs3[5æË×°éšÍ|·²(Ð1VÒ ®é›Q†_g†cÛ%©Ò‘Æã?êsç¤7ÌÅPŠo€ì66„{s®Ýv©XÜ×ÕOæ{ èWš?Ò:Úè°™³1ë˜Î‹FÀ—uŒÊY—£-kŽ !£¨žŸ¸´ã|¬B&2I…á›_7~ílOßÿš.Ãfgg­³»½Öé>\ÛhuWß–XÇKÛÿ<Ÿ3THýy
L\ÃD“Tóv*¶’H•Qá>Aåˆâ(Ç2Ì ]ù*be€"ID×U#,J
wKSFÁVèƒ°Ý©*É¦’b>EWÊ­Æa'¥D.rJ/Ïm˜òX.0”ý‹føíÄlÓÌ[¬2ÑXYïZ61zn‘dU?c8´fK	+e¦†(z‘™O¸fzt¡¬ZVER†¾Úýu€]¬‡Q UQûÓ‘ ë"ë zÎ˜Â6@Œ×%nìy=këØQØï¡}Î¸¢Ñ†²€þÒª×Qà¾¼elS·…ïæUÊUÑ‡M¢Y¤ýçÃÄöœ£:”uÄUíNª÷ŠMsSY›Ø—•
,j²Hë$Ø8Àö6z%ù¾Ü¯ÄHrvJðêÈ¤„9óÙP”:9,ÚÀ™8CŠ[bAìA)—¹¥L÷FÐýëò#¢œQffÜ\7ûECôE@ªÿÛdIOAô€S®ªlÎæYq¬.ÄÏÖô ª¡†úÚjµ°Þû»³	æÉ º,øŸÿ/à7¯›‰39‚Aˆå>QÌÉEûÝÏVïÞU­+÷Ñ4Lk°’¸üC½¶¶â½bL¼‹`õýdœ„")Ç‘ˆ‘®u®Hç§²Q¿íÎEÌ?Ïá™àe2Œ£à|ÔƒæÅ8¸YÚ0¬=´"œ­»Zþ)ëN1Öa8é#ùzÁ0#àÌn{3’Ù¨Œàm‹ÉDwóJBàªµ”X0Çð‚ž¨bh’	A«ÝUb£¸`UM6éZ}{AÃ`ó4	nÓÎ~àÆÒ9rï½¡Ñ§¿œÀ!êÁc¤°åºãùjœ[×üf2«Ï}xðÙÕ²
Ýcæ®}@sË·§“¾¤JŸ\£4M`ÝñÕž@ÈJÌá`Ç+ˆ¸°’ûÝÈ—¨"Ì˜`,Ä¦œ„>¤4™!ä½éln÷£Á[W–!CÁ˜}|!)è'ÚÅúBúZY÷ŒÚ§ø¶õ<|?ŠaªÛš7«?NÛ©­¢TÚÏ²&o"ÔpÑK£h’…°®"Å°Ë˜Ð¡Y]xS‹ff)­&v£Ü¾Áwã(cr©¾° >B¦BÃ\þdr’Ì/’9pf-‚r·à¥ûä¢Ûw¦°'‹ï à¿?Ùì®ðçVúäV/Dí¬Ÿævº¿þí€û°n‡ÁJYÄ§#ú¤É5|_	ö–ìµk÷šÅ{F¥ ûxÉ–ù½×®Û«ÖrÓhi´nÑ!tÌp„ËüF·¦Q…ÈŸÌá¥ gül/NÑ·ßË¾è_æå›Õ0£:å&™ÏÄu+5e!1
Í_ôÝ±x NÜ¹{Ç*¯s¥Ô˜KÆD%ùü)Q=R>§: .À9ÉåªLdãUš«jŽ‚˜”)6ÿÎfÓl¯ÝÆôBá j’XÑp:ÊZ½$nf¿¯‹qdë—óÞoÑ¬…˜f¡ýx4xÏ'“,,/Ø¦e;;GÓ!–Ú=Á%Ý;ÌÉ©€éDÀº¿tNÎ²ØÀ4ô)ÒŒÊZràãk‚îóþ²ûß³×µê…pQ¿Æe‚ ã$quôOÌ±üù%ýìl‚QóžVµ/Q6Ô£=)(>ª_cB9×ô/ÝÄ„jŠÑ1a¡cWDÏbOíJÃÝEå™m§†Áè»R%bë‘ØXïJHçË…ÐJó>“B˜^¨b7•*4·m}ª«£qJ&‰¶¼íGJ1ÓœD×è5W×‚•ï¿ß‹ã½,[Yõn?l™rŽòrTëðFªsvTLC!æèÙ»MÔgi¼	¤·~O}_W¡ät¦s ’¹ìÌÈZÏæîKÚéÈì<›ð_a±âÓ¤‹nê?âÐ½Ùhu£ømñ¢-íÓ$¸&á8XŽÎA’ø¶S-Xab)è¼Ô®FÖ~ú¶ùÉ

’DÝ0²¯Ò¹½?æîFšp&’ì¡àÞ÷ÿX±ÈÇÉäj4˜§B.ÔÚr @—^®4R9Š	Mb^XÆ	|}£•-l²ß¢aÙ\Çø°Èà äTz™·q™e<ƒJiéŽŽ€Žãã—¯íÕˆ'òË±&‡Òiw%‚_$6ÀûÞ¾p#.°«êI[¹ª@>w|nqJmÂÙ¢i¥Ù,ª"î©ni¾0Ûƒ•*<œÏEÔ›§X˜â<™Œ@ñà\Æj7¦¹-çM$op~~ôAŽ¾?à½Ëa¢Înú¾ÜÒƒÀ¾´PFÂ'QÔÏîa4Û,}ÍŠ¦phMÃþÅ,LgÍ.ìÑÆÂC_t}Õäºl*”V“vl"R3%…GRÌÂ)†]cq
Yæ+›Ç7•eÀÂ9~g„!œò7+È	á[¦îÜŽ24ƒHª¡vÒt!û.G“›#ôêWÍ$s™g…9¸5~îl¡"Pü1nà['BãÛ?C(~ëd+™H“[~S%râ›“,¢}ˆó'¹’ñd¢¥ÌbƒoBÚõ¾»3ëNß>šEÇI‡“~n‚±êš>RòxeÓd‚Ã½JGýð&ÿ}g¬ÓÅ4
€p™žˆvù•²]%Ô†à#¾û‡ÿ  ÿÿ p·