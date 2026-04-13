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
  User
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
import { 
  Bell, 
  Search, 
  Cloud, 
  Thermometer, 
  ShieldCheck,
  Zap,
  Lock,
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
  Square as WindowIcon,
  Mail,
  Phone,
  MapPin,
  PlusCircle,
  Trash2,
  Edit3,
  Key,
  ShieldAlert,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

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
  Layers
};

export default function App() {
  const [devices, setDevices] = React.useState<Device[]>(INITIAL_DEVICES);
  const [scenes, setScenes] = React.useState<Scene[]>(INITIAL_SCENES);
  const [rooms, setRooms] = React.useState<Room[]>(ROOMS);
  const [sections, setSections] = React.useState<Section[]>(SECTIONS);
  const [activeView, setActiveView] = React.useState<NavView>('dashboard');
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

  // Logs Filter
  const [logStartDate, setLogStartDate] = React.useState<string>('');
  const [logEndDate, setLogEndDate] = React.useState<string>('');

  // Profile Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isAuthCodeModalOpen, setIsAuthCodeModalOpen] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({ old: '', new: '', confirm: '', token: '' });
  const [authCodeData, setAuthCodeData] = React.useState({ code: '', token: '' });

  // Add Device State
  const [isAddDeviceOpen, setIsAddDeviceOpen] = React.useState(false);
  const [newDevice, setNewDevice] = React.useState<Partial<Device>>({
    name: '',
    type: 'light',
    room: '',
    section: ''
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
  const [newRoom, setNewRoom] = React.useState<Partial<Room>>({
    name: '',
    section: '',
    icon: 'Sofa'
  });

  // Contact Modals
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newContact, setNewContact] = React.useState<Partial<ContactType>>({
    firstName: '',
    lastName: '',
    category: '',
    emails: [{ label: 'Work', email: '' }],
    phones: [{ label: 'Mobile', phone: '' }],
    addresses: [{ label: 'Home', address: '' }]
  });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: ContactCategory = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName
    };
    setContactCategories(prev => [...prev, newCat]);
    setNewCategoryName('');
    setIsAddCategoryOpen(false);
  };

  const handleAddContact = () => {
    if (!newContact.firstName || !newContact.lastName) return;
    const contact: ContactType = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      category: newContact.category || 'other',
      emails: (newContact.emails || []).filter(e => e.email),
      phones: (newContact.phones || []).filter(p => p.phone),
      addresses: (newContact.addresses || []).filter(a => a.address),
    };
    setContacts(prev => [...prev, contact]);
    setIsAddContactOpen(false);
    setNewContact({
      firstName: '',
      lastName: '',
      category: '',
      emails: [{ label: 'Work', email: '' }],
      phones: [{ label: 'Mobile', phone: '' }],
      addresses: [{ label: 'Home', address: '' }]
    });
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
    if (!newDevice.name || !newDevice.section) return;
    
    const device: Device = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDevice.name,
      type: newDevice.type as any,
      room: newDevice.room === 'none' ? undefined : newDevice.room,
      section: newDevice.section,
      status: (newDevice.type === 'door' || newDevice.type === 'window') ? 'locked' : (newDevice.type === 'camera' ? 'active' : 'off'),
      value: newDevice.type === 'light' ? 0 : undefined,
      doorType: newDevice.type === 'door' ? 'interior' : undefined,
      powerUsage: newDevice.type === 'appliance' ? 0 : undefined
    };

    setDevices(prev => [...prev, device]);
    setIsAddDeviceOpen(false);
    setNewDevice({ name: '', type: 'light', room: '', section: '' });
  };

  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.section) return;

    const room: Room = {
      id: newRoom.name.toLowerCase().replace(/\s+/g, '-'),
      name: newRoom.name,
      section: newRoom.section,
      icon: newRoom.icon || 'Sofa'
    };

    setRooms(prev => [...prev, room]);
    setIsAddRoomOpen(false);
    setNewRoom({ name: '', section: '', icon: 'Sofa' });
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
      title = `${userProfile.name.split(' ')[0]}'s Room`;
    } else if (activeView === 'facility-overview') {
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
            <h1 className="text-3xl font-bold tracking-tight">Welcome home, {userProfile.name.split(' ')[0]}!</h1>
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

    if (activeView === 'facilities') {
      const facilityCategories = [
        { id: 'facility-appliances', name: 'Appliances', icon: Power, type: 'appliance' },
        { id: 'facility-cameras', name: 'Cameras', icon: Camera, type: 'camera' },
        { id: 'facility-doors', name: 'Doors', icon: Lock, type: 'door' },
        { id: 'facility-lights', name: 'Lights', icon: Lightbulb, type: 'light' },
        { id: 'facility-windows', name: 'Windows', icon: WindowIcon, type: 'window' },
      ].sort((a, b) => a.name.localeCompare(b.name));

      return (
        <motion.div
          key="facilities-overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Facilities Overview</h1>
            </div>
            <p className="text-muted-foreground">Summary of all systems and infrastructure in HanssonHub.</p>
          </div>

          <div className="space-y-12">
            {facilityCategories.map(cat => {
              const Icon = cat.icon;
              const categoryDevices = devices.filter(d => d.type === cat.type);
              
              return (
                <div key={cat.id} className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-2xl font-bold">{cat.name}</h2>
                      <Badge variant="secondary" className="ml-2">
                        {categoryDevices.length} Total
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveView(cat.id)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      View All {cat.name}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryDevices.slice(0, 4).map(device => (
                      <DeviceCard 
                        key={device.id} 
                        device={device} 
                        onToggle={handleToggle}
                        variant="summary"
                      />
                    ))}
                    {categoryDevices.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No {cat.name.toLowerCase()} found.</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Sections Summary */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Sections</h2>
                  <Badge variant="secondary" className="ml-2">
                    {sections.length} Total
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveView('facility-sections')}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  View All Sections
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sections.map(section => (
                  <Card key={section.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setActiveView('facility-sections')}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="rounded-lg bg-muted p-2">
                        <Layers className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{section.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {rooms.filter(r => r.section === section.id).length} Rooms
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
            
            <div className="flex items-center gap-2 bg-card p-2 rounded-xl border">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase ml-1">From</Label>
                <Input 
                  type="date" 
                  className="h-8 text-xs" 
                  value={logStartDate}
                  onChange={(e) => setLogStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase ml-1">To</Label>
                <Input 
                  type="date" 
                  className="h-8 text-xs" 
                  value={logEndDate}
                  onChange={(e) => setLogEndDate(e.target.value)}
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="mt-4 h-8 w-8"
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
        const matchesCategory = contactSortCategory === 'all' || c.category === contactSortCategory;
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
                  {contactCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <Badge variant="secondary">{contacts.filter(c => c.category === cat.id).length}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm" onClick={() => setIsAddCategoryOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
              </Card>

              <Card className="p-6 md:col-span-2">
                <h3 className="text-lg font-bold mb-4">Recent Contacts</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {contacts.slice(0, 4).map(contact => (
                    <div key={contact.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{contact.firstName} {contact.lastName}</span>
                        <span className="text-xs text-muted-foreground capitalize">{contact.category}</span>
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
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                  <Card key={contact.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <div>
                            <CardTitle className="text-base">{contact.firstName} {contact.lastName}</CardTitle>
                            <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider">{contact.category}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 text-sm">
                        {contact.emails.map((e, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="font-medium text-foreground">{e.email}</span>
                            <span className="text-[10px] uppercase tracking-wider">({e.label})</span>
                          </div>
                        ))}
                        {contact.phones.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span className="font-medium text-foreground">{p.phone}</span>
                            <span className="text-[10px] uppercase tracking-wider">({p.label})</span>
                          </div>
                        ))}
                        {contact.addresses.map((a, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{a.address}</span>
                              <span className="text-[10px] uppercase tracking-wider">({a.label})</span>
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
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <UserCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
            </div>
            <p className="text-muted-foreground">Manage your account information and security settings.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/10">
                  <img src={userProfile.avatar} alt={userProfile.name} className="h-full w-full object-cover" />
                </div>
                <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:scale-110 transition-transform">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold">{userProfile.name}</h2>
                <p className="text-sm text-muted-foreground">Home Owner</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Verified Account</Badge>
            </Card>

            <Card className="p-6 md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={userProfile.name} onChange={(e) => setUserProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={userProfile.email} onChange={(e) => setUserProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={userProfile.phone} onChange={(e) => setUserProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Home Address</Label>
                  <Input value={userProfile.address} onChange={(e) => setUserProfile(p => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-bold">Camera Access</h3>
                <Card className="p-4 bg-muted/30">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                        <Label htmlFor={`cam-${camera.id}`} className="text-sm font-medium leading-none cursor-pointer">
                          {camera.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-bold">Security Settings</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setIsPasswordModalOpen(true)}>
                    <Key className="mr-4 h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="font-bold">Change Password</span>
                      <span className="text-[10px] text-muted-foreground">Update your login credentials</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setIsAuthCodeModalOpen(true)}>
                    <ShieldAlert className="mr-4 h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="font-bold">Authorization Code</span>
                      <span className="text-[10px] text-muted-foreground">Manage your 6-digit secure code</span>
                    </div>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
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
            {allUsers.map(user => (
              <Card key={user.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px] uppercase">{user.role}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </Card>
            ))}
            <Button variant="outline" className="h-full border-dashed flex flex-col gap-2 py-8">
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
      
      return (
        <motion.div
          key="user-room"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{userProfile.name.split(' ')[0]}'s Room</h1>
            </div>
            <p className="text-muted-foreground">Manage devices in your personal space.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {roomDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={handleToggle}
                onStatusChange={handleStatusChange}
                onValueChange={handleValueChange}
              />
            ))}
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
              <Plus className="mr-2 h-4 w-4" /> Add Room
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
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Scene
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map(scene => (
              <Card 
                key={scene.id} 
                className="p-6 flex flex-col gap-4 hover:bg-accent transition-all cursor-pointer group"
                onClick={() => triggerScene(scene)}
              >
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Layers className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Home Sections</h1>
            </div>
            <p className="text-muted-foreground">Manage devices and rooms grouped by section.</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {sections.map(section => {
              const sectionRooms = rooms.filter(r => r.section === section.id);
              const sectionDevices = devices.filter(d => d.section === section.id);
              
              return (
                <div key={section.id} className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">{section.name}</h2>
                    <Badge variant="secondary" className="ml-2">
                      {sectionRooms.length} Rooms • {sectionDevices.length} Devices
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Rooms in Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rooms</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {sectionRooms.map(room => (
                          <Card 
                            key={room.id} 
                            className="cursor-pointer hover:bg-accent transition-colors"
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
                  className="cursor-pointer overflow-hidden transition-all hover:shadow-md"
                  onClick={() => setActiveView(`room-${room.id}`)}
                >
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
              <HeaderIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{headerTitle}</h1>
            </div>
            <p className="text-muted-foreground">Manage all {title?.toLowerCase()} in your home.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {!isRoom && (
              <div className="flex items-center gap-2 rounded-lg border bg-card p-1">
                <Button 
                  variant={facilitySortBy === 'room' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-8 text-[10px]"
                  onClick={() => setFacilitySortBy('room')}
                >
                  Sort by Room
                </Button>
                <Button 
                  variant={facilitySortBy === 'section' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-8 text-[10px]"
                  onClick={() => setFacilitySortBy('section')}
                >
                  Sort by Section
                </Button>
              </div>
            )}
            <Button size="sm" onClick={() => setIsAddDeviceOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Device
            </Button>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredDevices.length} Devices
            </Badge>
          </div>
        </div>

        {!isRoom && (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${title?.toLowerCase()}...`}
              className="h-10 w-full rounded-xl border bg-card pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
              value={facilitySearchQuery}
              onChange={(e) => setFacilitySearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDevices.map(device => (
            <DeviceCard 
              key={device.id} 
              device={device} 
              onToggle={handleToggle}
              onValueChange={handleValueChange}
              onStatusChange={handleStatusChange}
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
      />
      
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-8 bg-card/30 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4 mt-1">
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
              <button className="relative rounded-full p-2 hover:bg-muted">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </button>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-8 pb-12">
            <AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>

      {/* Add Device Dialog */}
      <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Connect a new smart device to your HanssonHub.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Device Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Desk Lamp" 
                value={newDevice.name}
                onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Device Type</Label>
              <Select 
                value={newDevice.type} 
                onValueChange={(v) => setNewDevice(prev => ({ ...prev, type: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="door">Door / Lock</SelectItem>
                  <SelectItem value="window">Window</SelectItem>
                  <SelectItem value="appliance">Appliance</SelectItem>
                  <SelectItem value="camera">Camera</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section">Section</Label>
              <Select 
                value={newDevice.section} 
                onValueChange={(v) => setNewDevice(prev => ({ ...prev, section: v, room: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Room (Optional)</Label>
              <Select 
                value={newDevice.room} 
                onValueChange={(v) => setNewDevice(prev => ({ ...prev, room: v }))}
                disabled={!newDevice.section}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Room (Section Only)</SelectItem>
                  {rooms.filter(r => r.section === newDevice.section).map(room => (
                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDevice}>Add Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Create a new room in your HanssonHub.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input 
                id="room-name" 
                placeholder="e.g. Study" 
                value={newRoom.name}
                onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section">Section</Label>
              <Select 
                value={newRoom.section} 
                onValueChange={(v) => setNewRoom(prev => ({ ...prev, section: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Select 
                value={newRoom.icon} 
                onValueChange={(v) => setNewRoom(prev => ({ ...prev, icon: v }))}
              >
                <SelectTrigger>
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
            <Button onClick={handleAddRoom}>Add Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Password Change Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password. You will need your current password and a valid 16-character token.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="old-password">Current Password</Label>
              <Input 
                id="old-password" 
                type="password"
                value={passwordData.old}
                onChange={(e) => setPasswordData(prev => ({ ...prev, old: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password-token">16-Character Token</Label>
              <Input 
                id="password-token" 
                placeholder="XXXX-XXXX-XXXX-XXXX"
                maxLength={19}
                value={passwordData.token}
                onChange={(e) => setPasswordData(prev => ({ ...prev, token: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsPasswordModalOpen(false)}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Authorization Code Dialog */}
      <Dialog open={isAuthCodeModalOpen} onOpenChange={setIsAuthCodeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Authorization Code</DialogTitle>
            <DialogDescription>
              Change your 6-digit secure authorization code. A 16-character token is required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="auth-code">New 6-Digit Code</Label>
              <Input 
                id="auth-code" 
                placeholder="000000"
                maxLength={6}
                value={authCodeData.code}
                onChange={(e) => setAuthCodeData(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auth-token">16-Character Token</Label>
              <Input 
                id="auth-token" 
                placeholder="XXXX-XXXX-XXXX-XXXX"
                maxLength={19}
                value={authCodeData.token}
                onChange={(e) => setAuthCodeData(prev => ({ ...prev, token: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuthCodeModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAuthCodeModalOpen(false)}>Update Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modals */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>Add a new contact with multiple details.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input 
                    placeholder="First Name" 
                    value={newContact.firstName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input 
                    placeholder="Last Name" 
                    value={newContact.lastName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Category</Label>
                <Select 
                  value={newContact.category} 
                  onValueChange={(val) => setNewContact(prev => ({ ...prev, category: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Emails</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setNewContact(prev => ({ 
                      ...prev, 
                      emails: [...(prev.emails || []), { label: 'Work', email: '' }] 
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {(newContact.emails || []).map((email, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input 
                      className="w-24" 
                      value={email.label} 
                      onChange={(e) => {
                        const emails = [...(newContact.emails || [])];
                        emails[idx].label = e.target.value;
                        setNewContact(prev => ({ ...prev, emails }));
                      }}
                    />
                    <Input 
                      className="flex-1" 
                      placeholder="email@example.com" 
                      value={email.email}
                      onChange={(e) => {
                        const emails = [...(newContact.emails || [])];
                        emails[idx].email = e.target.value;
                        setNewContact(prev => ({ ...prev, emails }));
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const emails = (newContact.emails || []).filter((_, i) => i !== idx);
                        setNewContact(prev => ({ ...prev, emails }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Phone Numbers</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setNewContact(prev => ({ 
                      ...prev, 
                      phones: [...(prev.phones || []), { label: 'Mobile', phone: '' }] 
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {(newContact.phones || []).map((phone, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input 
                      className="w-24" 
                      value={phone.label} 
                      onChange={(e) => {
                        const phones = [...(newContact.phones || [])];
                        phones[idx].label = e.target.value;
                        setNewContact(prev => ({ ...prev, phones }));
                      }}
                    />
                    <Input 
                      className="flex-1" 
                      placeholder="+1 (555) 000-0000" 
                      value={phone.phone}
                      onChange={(e) => {
                        const phones = [...(newContact.phones || [])];
                        phones[idx].phone = e.target.value;
                        setNewContact(prev => ({ ...prev, phones }));
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const phones = (newContact.phones || []).filter((_, i) => i !== idx);
                        setNewContact(prev => ({ ...prev, phones }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Addresses</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setNewContact(prev => ({ 
                      ...prev, 
                      addresses: [...(prev.addresses || []), { label: 'Home', address: '' }] 
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {(newContact.addresses || []).map((addr, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input 
                      className="w-24" 
                      value={addr.label} 
                      onChange={(e) => {
                        const addresses = [...(newContact.addresses || [])];
                        addresses[idx].label = e.target.value;
                        setNewContact(prev => ({ ...prev, addresses }));
                      }}
                    />
                    <Input 
                      className="flex-1" 
                      placeholder="123 Main St, City, State" 
                      value={addr.address}
                      onChange={(e) => {
                        const addresses = [...(newContact.addresses || [])];
                        addresses[idx].address = e.target.value;
                        setNewContact(prev => ({ ...prev, addresses }));
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const addresses = (newContact.addresses || []).filter((_, i) => i !== idx);
                        setNewContact(prev => ({ ...prev, addresses }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>Cancel</Button>
            <Button onClick={handleAddContact}>Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
