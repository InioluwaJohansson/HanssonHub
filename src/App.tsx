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
  GENERAL_CAMERAS
} from './constants';
import { 
  Device, 
  Scene, 
  Room, 
  Section, 
  LogEntry, 
  Contact as ContactType, 
  ContactCategory, 
  UserProfile,
  User,
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
  GetContactDetailsDto
} from './types';
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
  ChevronRight,
  Power,
  Lightbulb,
  ClipboardList,
  Contact,
  UserCircle,
  Layout as WindowIcon,
  Mail,
  Phone,
  MapPin,
  PlusCircle,
  Trash2,
  Edit3,
  Key,
  ShieldAlert,
  MoreVertical,
  User as UserIcon,
  Users,
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
  CalendarDays,
  X,
  Filter,
  CheckCheck,
  Video,
  ImagePlus,
  History,
  Smile,
  MessageSquarePlus,
  XCircle,
  Pause,
  Reply,
  CornerUpLeft,
  Settings,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client';
import { format, subHours, subSeconds } from 'date-fns';

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
  const [rooms, setRooms] = React.useState<Room[]>(ROOMS);
  const [sections, setSections] = React.useState<Section[]>(SECTIONS);
  const [activeView, setActiveView] = React.useState<NavView>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [facilitySearchQuery, setFacilitySearchQuery] = React.useState('');
  const [facilitySortBy, setFacilitySortBy] = React.useState<'room' | 'section'>('room');

  // New State
  const [logs, setLogs] = React.useState<LogEntry[]>(INITIAL_LOGS);
  const [contacts, setContacts] = React.useState<ContactType[]>(INITIAL_CONTACTS);
  const [contactCategories, setContactCategories] = React.useState<ContactCategory[]>(CONTACT_CATEGORIES);
  const [userProfile, setUserProfile] = React.useState<UserProfile>(INITIAL_USER);
  const [contactSearchQuery, setContactSearchQuery] = React.useState('');
  const [contactSortCategory, setContactSortCategory] = React.useState<string>('all');
  const [contactView, setContactView] = React.useState<'overview' | 'all'>('overview');
  const [allUsers, setAllUsers] = React.useState<User[]>(INITIAL_USERS);

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
    doorType: 'interior'
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
  const [isAddRoomOpen, setIsAddRoomOpen] = React.useState(false);
  const [isAddSceneOpen, setIsAddSceneOpen] = React.useState(false);
  const [newRoom, setNewRoom] = React.useState<Partial<Room>>({
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

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authCode, setAuthCode] = React.useState('');
  const [onAuthSuccess, setOnAuthSuccess] = React.useState<(() => void) | null>(null);

  // Camera Modal
  const [isCameraModalOpen, setIsCameraModalOpen] = React.useState(false);
  const [selectedCamera, setSelectedCamera] = React.useState<Device | null>(null);
  const [cameraPlaybackOffset, setCameraPlaybackOffset] = React.useState(0); // seconds from now
  const [modalCurrentTime, setModalCurrentTime] = React.useState(new Date());

  // Chat State
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<any[]>([]);
  const [chatInput, setChatInput] = React.useState("");
  const socketRef = React.useRef<any>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [playingAudioId, setPlayingAudioId] = React.useState<string | null>(null);
  const [playingProgress, setPlayingProgress] = React.useState(0);
  const [replyingTo, setReplyingTo] = React.useState<any>(null);
  const recordingTimerRef = React.useRef<any>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = React.useState("");
  const [isChatSearchVisible, setIsChatSearchVisible] = React.useState(false);

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
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

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
    if (!chatInput.trim() || !activeChatId) return;
    const msg = {
      id: Math.random().toString(36).substr(2, 9),
      userId: userProfile.id.toString(),
      userName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
      userAvatar: userProfile.getPersonDetailsDto.imageUrl,
      text: chatInput,
      type: "text",
      chatId: activeChatId,
      timestamp: new Date().toISOString(),
      replyTo: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        userName: replyingTo.userName
      } : null
    };
    socketRef.current.emit("chat:message", msg);
    setChatInput("");
    setReplyingTo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    if (e.target.files && e.target.files[0] && activeChatId) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const msg = {
          id: Math.random().toString(36).substr(2, 9),
          userId: userProfile.id.toString(),
          userName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
          userAvatar: userProfile.getPersonDetailsDto.imageUrl,
          text: `Sent a ${type}`,
          mediaUrl: reader.result?.toString(),
          fileName: file.name,
          type: type,
          chatId: activeChatId,
          timestamp: new Date().toISOString()
        };
        socketRef.current.emit("chat:message", msg);
      };
      reader.readAsDataURL(file);
    }
  };

  // Room Lock State
  const [roomLocked, setRoomLocked] = React.useState(false);

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
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: `${nextState ? 'locked' : 'unlocked'} all security points in ${rooms.find(r => r.id === roomId)?.name || 'the room'}`,
      userName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
      userAvatar: userProfile.getPersonDetailsDto.imageUrl
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateProfile = () => {
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
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'Updated profile identity (Synced with UpdatePersonDto)',
        userName: `${userProfile.getPersonDetailsDto.firstName} ${userProfile.getPersonDetailsDto.lastName}`,
        userAvatar: userProfile.getPersonDetailsDto.imageUrl
      };
      setLogs(prev => [newLog, ...prev]);
    }
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
    if (!newSectionName.trim()) return;
    const newSec: Section = {
      id: newSectionName.toLowerCase().replace(/\s+/g, '-'),
      name: newSectionName,
      type: newSectionType
    };
    setSections(prev => [...prev, newSec]);
    setNewSectionName('');
    setNewSectionType('general');
    setIsAddSectionOpen(false);
  };

  const requestDelete = (action: () => void) => {
    setOnAuthSuccess(() => action);
    setIsAuthModalOpen(true);
    setAuthCode('');
  };

  const handleAuthSubmit = () => {
    if (authCode.length === 6 && /^\d+$/.test(authCode)) {
      onAuthSuccess?.();
      setIsAuthModalOpen(false);
      setAuthCode('');
      setOnAuthSuccess(null);
    }
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
    requestDelete(() => {
      setDevices(prev => prev.filter(d => d.id !== id));
    });
  };

  const handleEditDevice = (id: string) => {
    const device = devices.find(d => d.id === id);
    if (device) {
      setEditingDevice(device);
      setIsEditDeviceOpen(true);
    }
  };

  const handleSaveDevice = () => {
    if (editingDevice && editingDevice.id) {
      setDevices(prev => prev.map(d => d.id === editingDevice.id ? { ...d, ...editingDevice } as Device : d));
      setIsEditDeviceOpen(false);
      setEditingDevice(null);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsEditRoomOpen(true);
  };

  const handleSaveRoom = () => {
    if (editingRoom && editingRoom.id) {
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...editingRoom } as Room : r));
      setIsEditRoomOpen(false);
      setEditingRoom(null);
    }
  };

  const handleDeleteRoom = (id: string) => {
    requestDelete(() => {
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

    const device: Device = {
      id: Math.random().toString(36).substring(2, 9),
      name: newDevice.name,
      type: inferredType as any,
      room: (newDevice.room === 'none' || !newDevice.room) ? undefined : newDevice.room,
      section: newDevice.section || undefined,
      status: (inferredType === 'door' || inferredType === 'window') ? 'locked' : (inferredType === 'camera' ? 'active' : 'off'),
      value: inferredType === 'light' ? 0 : undefined,
      doorType: inferredType === 'door' ? (newDevice.doorType || 'interior') : undefined,
      powerUsage: inferredType === 'appliance' ? 0 : undefined
    };

    setDevices(prev => [...prev, device]);
    setIsAddDeviceOpen(false);
    setNewDevice({ name: '', type: 'light', room: '', section: '', doorType: 'interior' });
  };

  const handleAddRoom = () => {
    if (!newRoom.name) return;

    const room: Room = {
      id: newRoom.name.toLowerCase().replace(/\s+/g, '-'),
      name: newRoom.name,
      section: newRoom.section || '',
      icon: newRoom.icon || 'Sofa'
    };

    setRooms(prev => [...prev, room]);
    setIsAddRoomOpen(false);
    setNewRoom({ name: '', section: '', icon: 'Sofa' });
  };

  const [newScene, setNewScene] = React.useState<Partial<Scene>>({
    name: '',
    icon: 'Film'
  });

  const handleAddScene = () => {
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
    } else if (activeView === 'facility-scenes') {
      Icon = Film;
      title = 'Scenes';
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 flex items-center gap-4 bg-primary/5 border-primary/10">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Thermometer className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">24°C</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 bg-blue-500/5 border-blue-500/10">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Cloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold">45%</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 bg-green-500/5 border-green-500/10">
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security</p>
                <p className="text-2xl font-bold">Armed</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 bg-yellow-500/5 border-yellow-500/10">
              <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Energy</p>
                <p className="text-2xl font-bold">1.2 kW</p>
              </div>
            </Card>
          </div>

          {/* Navigation Boxes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => setActiveView('facility-overview')}
            >
              <Layers className="h-6 w-6 text-primary" />
              <span className="font-bold">Facilities</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => setActiveView('contacts')}
            >
              <Contact className="h-6 w-6 text-primary" />
              <span className="font-bold">Contacts</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => setActiveView('logs')}
            >
              <ClipboardList className="h-6 w-6 text-primary" />
              <span className="font-bold">Logs</span>
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              External Security Cameras
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {externalCameras.map(camera => (
                <DeviceCard
                  key={camera.id}
                  device={camera}
                  onToggle={handleToggle}
                  onStatusChange={handleStatusChange}
                  onValueChange={handleValueChange}
                  onClick={(d) => {
                    if (d.type === 'camera') {
                      setSelectedCamera(d);
                      setIsCameraModalOpen(true);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Quick Scenes
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {scenes.map(scene => (
                  <Card 
                    key={scene.id} 
                    className="p-4 flex items-center justify-between hover:bg-accent transition-colors cursor-pointer group"
                    onClick={() => triggerScene(scene)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {scene.icon === 'Film' ? <Film className="h-5 w-5" /> : scene.icon === 'Sun' ? <Sun className="h-5 w-5" /> : <HomeIcon className="h-5 w-5" />}
                      </div>
                      <span className="font-medium">{scene.name}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-4 w-4 fill-current" />
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
                    <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
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
        { id: 'facility-scenes', name: 'Scenes', icon: Film, type: 'scene' },
        { id: 'facility-sections', name: 'Sections', icon: LayoutGrid, type: 'section' },
        { id: 'facility-windows', name: 'Windows', icon: WindowIcon, type: 'window' },
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
              } else if (cat.type === 'scene') {
                total = scenes.length;
                active = scenes.filter(s => s.isActive).length;
                inactive = total - active;
                statusSummary = `${active} Active • ${inactive} Inactive`;
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
        const logDate = new Date(log.timestamp);
        const start = logStartDate ? new Date(logStartDate) : new Date(0);
        const end = logEndDate ? new Date(logEndDate) : new Date();
        return logDate >= start && logDate <= end;
      });

      return (
        <motion.div
          key="logs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
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
                      onSelect={(date) => setLogStartDate(date ? date.toISOString() : '')}
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
                      onSelect={(date) => setLogEndDate(date ? date.toISOString() : '')}
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
                onClick={() => { setLogStartDate(''); setLogEndDate(''); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="divide-y">
              {filteredLogs.length > 0 ? filteredLogs.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
                  <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={log.userAvatar} alt={log.userName} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-bold">{log.userName}</span> {log.action}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">
                  No logs found for the selected date range.
                </div>
              )}
            </div>
          </div>
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
                <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
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
                    <Plus className="mr-2 h-4 w-4" /> Add Contact
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
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEditContact(contact); }}><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); setContactToDelete(contact); setIsDeleteContactOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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
                      <Plus className="mr-1 h-3 w-3" /> Add Contact
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
                    <Save className="mr-2 h-4 w-4 text-green-600" />
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <UserCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
            </div>
            <p className="text-muted-foreground">Manage users and their access levels.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allUsers.map(person => {
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
                      <img src={details.imageUrl} alt={`${details.firstName} ${details.lastName}`} className="h-full w-full object-cover" />
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
              <PlusCircle className="h-6 w-6 text-muted-foreground" />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Doors */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Doors</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
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

            {/* Windows */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <WindowIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Windows</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
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

            {/* Lights */}
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

            {/* Appliances */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Power className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Appliances</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
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

            {/* Room Scenes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Room Scenes</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
                {roomScenes.map(scene => (
                  <Card 
                    key={scene.id} 
                    className="p-4 flex flex-col gap-3 hover:bg-accent transition-all cursor-pointer group relative"
                    onClick={() => triggerScene(scene)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {scene.icon === 'Film' ? <Film className="h-4 w-4" /> : scene.icon === 'Sun' ? <Sun className="h-4 w-4" /> : <HomeIcon className="h-4 w-4" />}
                      </div>
                      <Button size="icon" variant="ghost" className="rounded-full h-6 w-6">
                        <Play className="h-3 w-3 fill-current" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold truncate">{scene.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{scene.actions.length} Actions</p>
                    </div>
                  </Card>
                ))}
                {roomScenes.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No specific scenes for this room.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {/* Cameras (Full Width) */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Cameras</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onToggle={handleToggle}
                    onStatusChange={handleStatusChange}
                    onValueChange={handleValueChange}
                    onClick={(d) => {
                      if (d.type === 'camera') {
                        setSelectedCamera(d);
                        setIsCameraModalOpen(true);
                      }
                    }}
                  />
                ))}
                {cameras.length === 0 && (
                  <div className="col-span-full flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
                    <p className="text-xs text-muted-foreground">No cameras in this room.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Sofa className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
              </div>
              <p className="text-muted-foreground">Overview of all rooms in your home.</p>
            </div>
            <Button onClick={() => setIsAddRoomOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Room
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map(room => {
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

    if (activeView === 'facility-scenes') {
      return (
        <motion.div
          key="facility-scenes"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Film className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Scenes</h1>
              </div>
              <p className="text-muted-foreground">Automate your home with custom scenes.</p>
            </div>
            <Button onClick={() => setIsAddSceneOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Scene
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map(scene => (
              <Card 
                key={scene.id} 
                className="p-6 flex flex-col gap-4 hover:bg-accent transition-all cursor-pointer group relative"
                onClick={() => triggerScene(scene)}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    requestDelete(() => setScenes(prev => prev.filter(s => s.id !== scene.id)));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    {scene.icon === 'Film' ? <Film className="h-6 w-6" /> : scene.icon === 'Sun' ? <Sun className="h-6 w-6" /> : <HomeIcon className="h-6 w-6" />}
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <Play className="h-5 w-5 fill-current" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{scene.name}</h3>
                  <p className="text-sm text-muted-foreground">{scene.actions.length} Actions</p>
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
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Layers className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Home Sections</h1>
              </div>
              <p className="text-muted-foreground">Manage devices and rooms grouped by section.</p>
            </div>
            <Button onClick={() => setIsAddSectionOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Section
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {sections.map(section => {
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
                          setEditingSection(section);
                          setIsEditSectionOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDelete(() => setSections(prev => prev.filter(s => s.id !== section.id)));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
                            onClick={(d) => {
                              if (d.type === 'camera') {
                                setSelectedCamera(d);
                                setIsCameraModalOpen(true);
                              }
                            }}
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
                      requestDelete(() => setRooms(prev => prev.filter(r => r.id !== room.id)));
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
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setActiveView(isRoom ? 'facility-rooms' : 'facilities')}>
                <ChevronRight className="h-5 w-5 rotate-180" />
              </Button>
              <HeaderIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{headerTitle}</h1>
            </div>
            <p className="text-muted-foreground">Manage all {title?.toLowerCase()} in your home.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              {filteredDevices.length} Devices
            </Badge>
            {isRoom && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleEditRoom(room!)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Room
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRoom(room!.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Room
                </Button>
              </>
            )}
          </div>
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

        {(!isRoom && facilityType !== 'overview') && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder={`Search ${title?.toLowerCase()}...`}
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
                    facilitySortBy === 'room' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setFacilitySortBy('room')}
                >
                  By Room
                </button>
                <button
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    facilitySortBy === 'section' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setFacilitySortBy('section')}
                >
                  By Section
                </button>
              </div>
              <Button onClick={() => setIsAddDeviceOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New {singularName}
              </Button>
            </div>
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
                onClick={(d) => {
                  if (d.type === 'camera') {
                    setSelectedCamera(d);
                    setIsCameraModalOpen(true);
                  }
                }}
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
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(() => {
                const type = activeView.replace('facility-', '');
                const Icon = type === 'doors' ? Lock : type === 'lights' ? Lightbulb : type === 'appliances' ? Power : type === 'windows' ? WindowIcon : type === 'cameras' ? Camera : PlusCircle;
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              Add New {(() => {
                const type = activeView.replace('facility-', '');
                const map: Record<string, string> = {
                  'appliances': 'Appliance',
                  'lights': 'Light',
                  'cameras': 'Camera',
                  'doors': 'Door',
                  'windows': 'Light'
                };
                return map[type] || 'Device';
              })()}
            </DialogTitle>
            <DialogDescription>
              Connect a new smart device to your HanssonHub.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                    'windows': 'Room Name'
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
                Section (Optional)
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
                Room (Optional)
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDevice} className="bg-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Add {(() => {
                const type = activeView.replace('facility-', '');
                const map: Record<string, string> = {
                  'appliances': 'Appliance',
                  'lights': 'Light',
                  'cameras': 'Camera',
                  'doors': 'Door',
                  'windows': 'Light'
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
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sofa className="h-5 w-5 text-primary" />
              Add New Room
            </DialogTitle>
            <DialogDescription>
              Create a new room in your HanssonHub.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="room-section" className="flex items-center gap-2">
                <Layers className="h-3 w-3 text-muted-foreground" />
                Section (Optional)
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRoom} className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditSectionOpen} onOpenChange={setIsEditSectionOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Edit Home Section
            </DialogTitle>
            <DialogDescription>Update the details and visibility of this section.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSectionOpen(false)} className="flex items-center gap-2">
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingSection?.id && editingSection.name) {
                setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, name: editingSection.name!, type: editingSection.type } : s));
                setIsEditSectionOpen(false);
              }
            }} className="flex items-center gap-2 bg-primary text-primary-foreground">
              <Save className="h-4 w-4" />
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
          <div className="grid gap-4 py-4">
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
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-700">
              <ShieldAlert className="h-5 w-5" />
              Authorization Required
            </DialogTitle>
            <DialogDescription className="text-yellow-800/70">
              This is a sensitive operation. Please enter your credentials to authorize the action.
            </DialogDescription>
          </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Household Member
            </DialogTitle>
            <DialogDescription>Create a new person and their associated login credentials.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] px-1">
            <div className="grid gap-6 py-4">
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
            <Button variant="outline" onClick={() => setIsAddPersonOpen(false)}>Cancel</Button>
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
              Update User Role
            </DialogTitle>
            <DialogDescription>Modify the system access level for {updateUserRoleData.userName}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-role-select">Select New Role</Label>
              <Select value={updateUserRoleData.role.toString()} onValueChange={(v) => setUpdateUserRoleData(p => ({ ...p, role: parseInt(v) }))}>
                <SelectTrigger id="edit-role-select" className="bg-transparent text-black border-primary/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Owner</SelectItem>
                  <SelectItem value="2">Wife</SelectItem>
                  <SelectItem value="3">Child</SelectItem>
                  <SelectItem value="4">Relative</SelectItem>
                  <SelectItem value="5">Visitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="border-primary/20 text-black hover:bg-muted" onClick={() => setIsEditPersonRoleOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setPendingUserAction({ type: 'update-role', userId: updateUserRoleData.id, targetRole: updateUserRoleData.role });
              setIsEditPersonRoleOpen(false);
              setIsAuthCodeModalOpen(true);
            }} className="bg-transparent border-2 border-primary text-black hover:bg-primary/5 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Person Details Dialog */}
      <Dialog open={isViewPersonDetailsOpen} onOpenChange={setIsViewPersonDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <DialogTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" />
                  User Profile: {viewingPerson?.getPersonDetailsDto.firstName} {viewingPerson?.getPersonDetailsDto.lastName}
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
                      setPendingUserAction({ type: 'toggle-disable', userId: viewingPerson.id });
                      setIsAuthCodeModalOpen(true);
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
                      setPendingUserAction({ type: 'delete', userId: viewingPerson.id });
                      setIsAuthCodeModalOpen(true);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 py-4">
              {viewingPerson && (
                <>
                  {/* Identity Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Core Identity</h4>
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Add New Category
            </DialogTitle>
            <DialogDescription>Create a new category to organize your contacts.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
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
          <div className="grid gap-4 py-4">
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
            <Button variant="outline" onClick={() => { setIsEditCategoryOpen(false); setEditingCategory(null); }}>Cancel</Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddContactOpen} onOpenChange={(open) => { setIsAddContactOpen(open); if (!open) setEditingContactId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Contact className="h-5 w-5 text-primary" />
              {editingContactId ? 'Edit Contact' : 'Add New Contact'}
            </DialogTitle>
            <DialogDescription>Fill in the contact details and addresses.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 pr-4 overflow-y-auto max-h-[60vh]">
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" /> First Name
                  </Label>
                  <Input 
                    placeholder="First Name" 
                    value={newContact.firstName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" /> Last Name
                  </Label>
                  <Input 
                    placeholder="Last Name" 
                    value={newContact.lastName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Avatar
                </Label>
                <div className="flex items-center gap-4">
                  {newContact.imageUrl && (
                    <img src={newContact.imageUrl} alt="Avatar Preview" className="h-12 w-12 rounded-full object-cover" />
                  )}
                  <Input 
                    type="file"
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
                    {contactCategories.map(cat => (
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
                        <Input value={addr.numberLine} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].numberLine = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Street</Label>
                        <Input value={addr.street} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].street = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">City</Label>
                        <Input value={addr.city} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].city = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Region</Label>
                        <Input value={addr.region} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].region = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">State</Label>
                        <Input value={addr.state} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].state = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Country</Label>
                        <Input value={addr.country} onChange={(e) => {
                          const list = [...newContact.address];
                          list[idx].country = e.target.value;
                          setNewContact(prev => ({ ...prev, address: list }));
                        }} />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Postal Code</Label>
                        <Input value={addr.postalCode} onChange={(e) => {
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
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {editingContactId ? 'Update Contact' : 'Save Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteContactOpen} onOpenChange={setIsDeleteContactOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Delete Contact
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {contactToDelete?.firstName} {contactToDelete?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteContactOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteContact}>Delete Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSceneOpen} onOpenChange={setIsAddSceneOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              Add New Scene
            </DialogTitle>
            <DialogDescription>
              Create a new automated scene for your home.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            <Button variant="outline" onClick={() => setIsAddSceneOpen(false)}>Cancel</Button>
            <Button onClick={handleAddScene}>Add Scene</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Add New Section
            </DialogTitle>
            <DialogDescription>Create a new home section to group your rooms and devices.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSectionOpen(false)} className="flex items-center gap-2">
              Cancel
            </Button>
            <Button onClick={handleAddSection} className="flex items-center gap-2 bg-primary text-primary-foreground">
              <PlusCircle className="h-4 w-4" />
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-[400px] border-2 border-red-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Authorization Required
            </DialogTitle>
            <DialogDescription>
              Please enter your 6-digit numerical authorization code to proceed with deletion.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex gap-2">
              <Input 
                type="password"
                maxLength={6}
                className="text-center text-2xl tracking-[1em] font-mono h-14 w-48"
                placeholder="••••••"
                value={authCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setAuthCode(val);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">This is a sensitive operation.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuthModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAuthSubmit} 
              disabled={authCode.length !== 6}
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={isEditDeviceOpen} onOpenChange={setIsEditDeviceOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingDevice && (() => {
                const Icon = editingDevice.type === 'door' ? Lock : editingDevice.type === 'light' ? Lightbulb : editingDevice.type === 'appliance' ? Power : editingDevice.type === 'window' ? WindowIcon : editingDevice.type === 'camera' ? Camera : Edit3;
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              Edit {editingDevice && (() => {
                if (editingDevice.type === 'window') return 'Light';
                const map: Record<string, string> = {
                  'appliance': 'Appliance',
                  'light': 'Light',
                  'camera': 'Camera',
                  'door': 'Door'
                };
                return map[editingDevice.type] || 'Device';
              })()}
            </DialogTitle>
            <DialogDescription>Update the details of this {editingDevice?.type || 'device'}.</DialogDescription>
          </DialogHeader>
          {editingDevice && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-device-name" className="flex items-center gap-2">
                  {(() => {
                    const Icon = editingDevice.type === 'door' ? Lock : editingDevice.type === 'light' ? Lightbulb : editingDevice.type === 'appliance' ? Power : editingDevice.type === 'window' ? WindowIcon : editingDevice.type === 'camera' ? Camera : Edit3;
                    return <Icon className="h-3 w-3 text-muted-foreground" />;
                  })()}
                  {(() => {
                    if (editingDevice.type === 'window') return 'Room Name';
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
            <Button variant="outline" onClick={() => setIsEditDeviceOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDevice} className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditRoomOpen} onOpenChange={setIsEditRoomOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sofa className="h-5 w-5 text-primary" />
              Edit Room
            </DialogTitle>
            <DialogDescription>Update the details of this room.</DialogDescription>
          </DialogHeader>
          {editingRoom && (
            <div className="grid gap-4 py-4">
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoomOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRoom} className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewContactOpen} onOpenChange={setIsViewContactOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Contact className="h-5 w-5 text-primary" />
              Contact Details
            </DialogTitle>
          </DialogHeader>
          {viewingContact && (
            <div className="flex flex-col gap-6 py-4 overflow-y-auto max-h-[70vh] pr-2">
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
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" className="rounded-xl" onClick={() => setIsViewContactOpen(false)}>Close</Button>
            <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={() => {
              setIsViewContactOpen(false);
              handleEditContact(viewingContact!);
            }}>Edit Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
      />

      {/* Camera Feed Modal */}
      <Dialog open={isCameraModalOpen} onOpenChange={(open) => {
        setIsCameraModalOpen(open);
        if (!open) setCameraPlaybackOffset(0);
      }}>
        <DialogContent showCloseButton={false} className="max-w-[85vw] w-[85vw] sm:max-w-[85vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="flex flex-col h-full bg-black relative max-h-[90vh]">
            {/* Header overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-40">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    {selectedCamera?.name || 'Camera Feed'}
                  </h2>
                  <p className="text-xs text-white/60 tracking-wide font-mono uppercase">
                    REC • 1080p • 60fps • {selectedCamera?.room ? rooms.find(r => r.id === selectedCamera.room)?.name : 'Main Hub'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => setIsCameraModalOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden group min-h-[400px]">
              <div 
                className="absolute top-24 left-6 flex items-center gap-2 z-30 bg-black/60 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md cursor-pointer hover:bg-black/80 transition-all active:scale-95"
                onClick={() => setCameraPlaybackOffset(0)}
              >
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  cameraPlaybackOffset === 0 ? "bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.9)]" : "bg-white/40"
                )} />
                <span className={cn(
                  "text-[10px] font-mono font-black uppercase tracking-[0.2em]",
                  cameraPlaybackOffset === 0 ? "text-white" : "text-white/60"
                )}>
                  {cameraPlaybackOffset === 0 ? 'Live Feed' : 'Jump to Live'}
                </span>
              </div>
              
              <img 
                src={`https://picsum.photos/seed/${selectedCamera?.id || 'default'}-${cameraPlaybackOffset}/1920/1080`} 
                alt="Camera Feed" 
                className="h-full w-full object-cover select-none"
                referrerPolicy="no-referrer"
              />

              {/* Status HUD */}
              <div className="absolute top-24 right-6 z-30 flex flex-col gap-2">
                <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-mono text-white/80">SECURE STREAM</span>
                </div>
              </div>

              {/* Controls Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-40">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono text-white/50 w-24">
                      {format(subSeconds(modalCurrentTime, 24 * 3600), "HH:mm:ss")}
                    </span>
                    <div className="flex-1 px-2">
                      <Slider
                        defaultValue={[24 * 3600]}
                        max={24 * 3600}
                        step={1}
                        value={[24 * 3600 - cameraPlaybackOffset]}
                        onValueChange={(vals) => setCameraPlaybackOffset(24 * 3600 - vals[0])}
                        className="cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white font-bold w-24 text-right">
                      {format(subSeconds(modalCurrentTime, cameraPlaybackOffset), "HH:mm:ss")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/10">
                        <p className="text-[11px] font-mono text-white tracking-widest uppercase">
                          {format(subSeconds(modalCurrentTime, cameraPlaybackOffset), "MMM dd, yyyy • HH:mm:ss")}
                        </p>
                      </div>
                      {cameraPlaybackOffset > 0 && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 animate-in fade-in slide-in-from-left-2">
                          PLAYBACK: -{Math.floor(cameraPlaybackOffset / 3600)}h {Math.floor((cameraPlaybackOffset % 3600) / 60)}m
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button className="h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
                        Capture Image
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent showCloseButton={false} className="max-w-[85vw] w-[85vw] h-[85vh] p-0 flex flex-row overflow-hidden rounded-3xl border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-white">
          {/* WhatsApp Style Sidebar - List View (Increased width: 25-30%) */}
          <div className="w-[35%] lg:w-[30%] xl:w-[25%] bg-[#ffffff] flex flex-col shrink-0 border-r-[1px] border-black relative z-10">
            <div className="p-4 pb-2 bg-[#f0f2f5] space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 shadow-inner overflow-hidden border-2 border-white">
                    <img src={userProfile.getPersonDetailsDto.imageUrl} alt="Me" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-[#111b21]">HanssonHub Chats</h2>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-[#54656f]" />
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 bg-white">
              <div className="divide-y divide-slate-50">
                {[
                  { id: 'general', name: 'Home Hub', lastMsg: chatMessages.filter(m => m.chatId === 'general').slice(-1)[0]?.text || 'No messages yet', time: 'Now', icon: <HomeIcon className="h-5 w-5" />, online: true, unread: 0 },
                  { id: 'maint', name: 'Maintenance', lastMsg: 'Your request #231 is processed.', time: '2:45 PM', icon: <Wrench className="h-5 w-5" />, online: true, unread: 2 },
                  { id: 'family', name: 'Family Group', lastMsg: 'Dinner at 7?', time: 'Yesterday', icon: <Users className="h-5 w-5" />, online: false, unread: 0 },
                  { id: 'sec', name: 'Security Alerts', lastMsg: 'Front door unlocked.', time: 'Tuesday', icon: <ShieldAlert className="h-5 w-5" />, online: true, unread: 0 },
                  { id: 'work', name: 'Office Hub', lastMsg: 'Meeting starting in 10.', time: 'Monday', icon: <Building2 className="h-5 w-5" />, online: false, unread: 1 },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setActiveChatId(item.id);
                      setChatSearchQuery("");
                      setIsChatSearchVisible(false);
                    }}
                    className={cn(
                      "w-full h-[72px] px-4 flex gap-3 hover:bg-[#f5f6f6] transition-all text-left group relative border-l-4 border-transparent",
                      activeChatId === item.id && "bg-[#f0f2f5] border-primary"
                    )}
                  >
                    <div className="relative shrink-0 flex items-center">
                      <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center shadow-sm overflow-hidden",
                        activeChatId === item.id ? "bg-primary text-primary-foreground" : "bg-slate-200 text-slate-500 group-hover:bg-white transition-colors"
                      )}>
                        {item.icon}
                      </div>
                      {item.online && (
                        <span className="absolute bottom-2 right-0 h-3.5 w-3.5 bg-[#25d366] border-[3px] border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center border-b border-slate-100 group-last:border-none h-full">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-[16px] text-[#111b21] truncate">{item.name}</span>
                        <span className={cn(
                          "text-[11px] font-medium tracking-tight px-1",
                          item.unread > 0 ? "text-[#25d366]" : "text-[#667781]"
                        )}>{item.time}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          {activeChatId === item.id && item.id === 'general' && <CheckCheck className="h-4 w-4 text-[#53bdeb] shrink-0" />}
                          <p className="text-[14px] text-[#667781] truncate leading-relaxed">
                            {item.id === 'general' ? (chatMessages.filter(m => m.chatId === 'general').slice(-1)[0]?.text || item.lastMsg) : item.lastMsg}
                          </p>
                        </div>
                        {item.unread > 0 && (
                          <div className="h-5 w-5 rounded-full bg-[#25d366] text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                            {item.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Box (Proportional 70-75%) */}
          <div className="flex-1 flex flex-col bg-[#efeae2] relative overflow-hidden">
            {activeChatId ? (
              <>
                {/* Essential Header */}
                <header className="px-5 py-3 border-b flex items-center justify-between bg-[#f0f2f5] shrink-0 z-20 shadow-sm h-[60px]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        {activeChatId === 'general' ? <HomeIcon className="h-5 w-5" /> : 
                         activeChatId === 'maint' ? <Wrench className="h-5 w-5" /> : 
                         activeChatId === 'family' ? <Users className="h-5 w-5" /> : 
                         activeChatId === 'sec' ? <ShieldAlert className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-[#25d366] border-2 border-[#f0f2f5] rounded-full" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111b21]">
                        {activeChatId === 'general' ? 'Home Hub' : 
                         activeChatId === 'maint' ? 'Maintenance' : 
                         activeChatId === 'family' ? 'Family Group' : 
                         activeChatId === 'sec' ? 'Security Alerts' : 'Office Hub'}
                      </h3>
                      <div className="flex items-center gap-1.5 ">
                        <span className="text-[12px] text-[#667781] font-medium leading-none">Online • Active now</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isChatSearchVisible && (
                      <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 200, opacity: 1 }}
                        className="mr-2"
                      >
                        <Input 
                          placeholder="Search messages..." 
                          className="h-8 text-xs bg-white border-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg"
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

                <div className="flex-1 relative overflow-hidden">
                  {/* WhatsApp background pattern */}
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat z-0" />
                  
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
                            (!chatSearchQuery || m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
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
                                const isMe = msg.userId === userProfile.id.toString();
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
                                          <span className="text-xs font-bold text-primary tracking-tight">{msg.userName}</span>
                                        </div>
                                      )}

                                      {/* Quoted Message */}
                                      {msg.replyTo && (
                                        <div className="mb-1 p-2 rounded-lg bg-black/5 border-l-4 border-primary/50 text-[13px] opacity-80 overflow-hidden">
                                          <p className="font-bold text-xs mb-0.5 text-primary">{msg.replyTo.userName}</p>
                                          <p className="truncate italic">{msg.replyTo.text}</p>
                                        </div>
                                      )}
                                      
                                      <div className="px-1 py-0.5">
                                        {msg.type === 'text' && (
                                          <p className="text-[14.5px] leading-[1.4] text-[#111b21] whitespace-pre-wrap">{msg.text}</p>
                                        )}
                                        {msg.type === 'image' && (
                                          <div className="space-y-1.5 rounded-lg overflow-hidden bg-black/5 p-1 border border-black/5">
                                            <img 
                                              src={msg.mediaUrl} 
                                              alt="uploaded" 
                                              className="rounded-lg w-full h-auto max-h-[400px] object-cover hover:opacity-95 transition-opacity cursor-pointer shadow-sm" 
                                              referrerPolicy="no-referrer"
                                            />
                                            <p className="px-1 py-1 text-[13px] text-[#111b21]">{msg.text}</p>
                                          </div>
                                        )}
                                        {msg.type === 'file' && (
                                          <div className="flex items-center gap-3 bg-black/5 p-3 rounded-xl min-w-[280px] hover:bg-black/10 transition-colors cursor-pointer group/file border border-black/5">
                                            <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm shrink-0">
                                              <FileText className="h-7 w-7 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-bold truncate text-[#111b21]">{msg.fileName}</p>
                                              <p className="text-[10px] text-[#667781] uppercase font-bold tracking-tight">PDF • 1.2 MB</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/50 hover:bg-white shrink-0 rounded-full">
                                              <Download className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )}
                                        {msg.type === 'audio' && (
                                          <div className="flex items-center gap-4 w-72 bg-[#f0f2f5]/40 p-2.5 rounded-xl border border-black/5">
                                            <div className="relative shrink-0">
                                              <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-12 w-12 rounded-full bg-white shadow-sm shrink-0 text-primary"
                                                onClick={() => {
                                                  if (playingAudioId === msg.id) {
                                                    if (audioRef.current) {
                                                      audioRef.current.pause();
                                                    }
                                                    setPlayingAudioId(null);
                                                  } else {
                                                    if (audioRef.current) {
                                                      audioRef.current.pause();
                                                    }
                                                    const audio = new Audio(msg.mediaUrl);
                                                    audioRef.current = audio;
                                                    setPlayingAudioId(msg.id);
                                                    setPlayingProgress(0);
                                                    audio.play();
                                                    
                                                    audio.ontimeupdate = () => {
                                                      setPlayingProgress(audio.currentTime);
                                                    };
                                                    
                                                    audio.onended = () => {
                                                      setPlayingAudioId(null);
                                                      setPlayingProgress(0);
                                                    };
                                                  }
                                                }}
                                              >
                                                {playingAudioId === msg.id ? (
                                                  <Pause className="h-5 w-5 fill-current" />
                                                ) : (
                                                  <Play className="h-5 w-5 fill-current ml-0.5" />
                                                )}
                                              </Button>
                                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                <Mic className="h-3 w-3 text-white" />
                                              </div>
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1.5">
                                              <div className="flex items-end gap-[1px] h-8 pt-2">
                                                {Array.from({length: 32}).map((_, i) => {
                                                  const isPlayed = playingAudioId === msg.id && (i / 32) < (playingProgress / (msg.duration || 1));
                                                  return (
                                                    <div 
                                                      key={i} 
                                                      className={cn(
                                                        "flex-1 rounded-full transition-all duration-300",
                                                        isPlayed ? "bg-primary h-[80%]" : "bg-slate-300 h-[40%]"
                                                      )} 
                                                      style={{ 
                                                        height: isPlayed ? `${40 + Math.random() * 40}%` : `${20 + Math.random() * 20}%`
                                                      }} 
                                                    />
                                                  );
                                                })}
                                              </div>
                                              <div className="flex justify-between items-center text-[10px] font-bold text-[#667781]">
                                                <span>
                                                  {playingAudioId === msg.id 
                                                    ? `${Math.floor(playingProgress / 60)}:${Math.floor(playingProgress % 60).toString().padStart(2, '0')}`
                                                    : `${Math.floor((msg.duration || 0) / 60)}:${Math.floor((msg.duration || 0) % 60).toString().padStart(2, '0')}`
                                                  }
                                                </span>
                                                <span>Voice Note</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-end gap-1 px-1 mt-0.5 h-4">
                                        <span className={cn(
                                          "text-[10px] font-medium leading-none text-[#667781]"
                                        )}>
                                          {format(new Date(msg.timestamp || Date.now()), "HH:mm")}
                                        </span>
                                        {isMe && <CheckCheck className="h-4 w-4 text-[#53bdeb] ml-0.5" />}
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
                          <p className="text-xs font-bold text-primary mb-0.5">{replyingTo.userName}</p>
                          <p className="text-sm text-[#667781] truncate">{replyingTo.text}</p>
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
                          <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                          <div className="h-11 w-11 flex items-center justify-center rounded-full text-[#54656f] hover:bg-slate-200/50 transition-colors">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        </label>
                      </div>

                    <div className="flex-1 relative">
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
              <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] text-[#667781] p-12 text-center space-y-6">
                <div className="h-48 w-48 rounded-full bg-slate-200 flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 rounded-full border-4 border-white/50 border-dashed animate-[spin_20s_linear_infinite]" />
                  <MessageSquare className="h-24 w-24 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#111b21]">HanssonHub Chats</h3>
                  <p className="text-[#667781] max-w-md mx-auto">
                    Select a conversation to continue. Send and receive messages without keeping your phone online.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#8696a0] pt-12">
                  <Lock className="h-3 w-3" />
                  <span>End-to-end encrypted</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
