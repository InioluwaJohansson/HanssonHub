import * as React from 'react';
import { Sidebar, NavView } from './components/Sidebar';
import { DeviceCard } from './components/DeviceCard';
import { INITIAL_DEVICES, ROOMS, INITIAL_SCENES, SECTIONS } from './constants';
import { Device, Scene, Room, Section } from './types';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
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
  ChevronRight,
  Power,
  Lightbulb
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

  // Add Device State
  const [isAddDeviceOpen, setIsAddDeviceOpen] = React.useState(false);
  const [newDevice, setNewDevice] = React.useState<Partial<Device>>({
    name: '',
    type: 'light',
    room: '',
    section: ''
  });

  // Add Room State
  const [isAddRoomOpen, setIsAddRoomOpen] = React.useState(false);
  const [newRoom, setNewRoom] = React.useState<Partial<Room>>({
    name: '',
    section: '',
    icon: 'Sofa'
  });

  const handleToggle = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id !== id) return d;
      
      let newStatus = d.status;
      if (d.type === 'light' || d.type === 'appliance') {
        newStatus = d.status === 'on' ? 'off' : 'on';
      } else if (d.type === 'door') {
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
      status: newDevice.type === 'door' ? 'locked' : (newDevice.type === 'camera' ? 'active' : 'off'),
      value: newDevice.type === 'light' ? 0 : undefined
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

  const renderView = () => {
    const filteredDevices = getFilteredDevices();

    if (activeView === 'dashboard') {
      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Welcome Home, Inioluwa</h1>
            </div>
            <p className="text-muted-foreground">Everything looks good. {activeDevicesCount} devices are currently active.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">Secure</Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Security System</p>
                <p className="text-2xl font-bold">Armed</p>
              </div>
            </Card>
            
            <Card className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-yellow-500/10 p-2 text-yellow-500">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">1.2 kWh</span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Energy Usage</p>
                <p className="text-2xl font-bold">Normal</p>
              </div>
            </Card>

            <Card className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-purple-500/10 p-2 text-purple-500">
                  <Camera className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-purple-500 border-purple-500/20 bg-purple-500/5">Live</Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Cameras</p>
                <p className="text-2xl font-bold">4 Online</p>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold tracking-tight">Quick Scenes</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                <Plus className="mr-2 h-3 w-3" /> Create Scene
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scenes.map(scene => {
                const Icon = iconMap[scene.icon] || Play;
                return (
                  <Card 
                    key={scene.id} 
                    className="cursor-pointer transition-all hover:bg-accent group"
                    onClick={() => triggerScene(scene)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{scene.name}</span>
                        <span className="text-xs text-muted-foreground">{scene.actions.length} Actions</span>
                      </div>
                      <Play className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold tracking-tight">Active Devices</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {devices.filter(d => d.status === 'on' || d.status === 'active' || d.status === 'unlocked' || d.status === 'open').map(device => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  onToggle={handleToggle}
                  onValueChange={handleValueChange}
                  onStatusChange={handleStatusChange}
                />
              ))}
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
      : (facilityType === 'doors' ? Lock : facilityType === 'lights' ? Lightbulb : facilityType === 'appliances' ? Power : Camera);

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
              <TitleIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
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
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-8 bg-card/30 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1">
            {/* Search bar removed from header */}
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
    </div>
  );
}
