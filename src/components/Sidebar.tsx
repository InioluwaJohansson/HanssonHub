import * as React from 'react';
import { 
  LayoutDashboard, 
  Sofa, 
  Utensils, 
  Bed, 
  Bath, 
  Car, 
  Trees, 
  Shield,
  Settings,
  Bell,
  User,
  Building2,
  Lightbulb,
  Lock,
  Power,
  Camera,
  Layers,
  LayoutGrid,
  ClipboardList,
  Contact,
  UserCircle,
  Square as WindowIcon,
  Home as HomeIcon,
  Film,
  ChevronRight,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROOMS, SECTIONS } from '../constants';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Room, Section } from '../types';

export type NavView = 
  | 'dashboard' 
  | 'user-room'
  | 'facility-overview'
  | 'facility-rooms'
  | 'facility-scenes'
  | 'facility-doors' 
  | 'facility-lights' 
  | 'facility-appliances' 
  | 'facility-cameras' 
  | 'facility-windows'
  | 'contacts' 
  | 'all-users'
  | 'logs' 
  | 'profile'
  | string;

interface SidebarProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  rooms: Room[];
  sections: Section[];
  userProfile: UserProfile;
}

const iconMap: Record<string, any> = {
  Sofa,
  Utensils,
  Bed,
  Bath,
  Car,
  Trees,
  Shield
};

export function Sidebar({ activeView, onViewChange, rooms, sections, userProfile }: SidebarProps) {
  const [isFacilitiesOpen, setIsFacilitiesOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'user-room', label: `${userProfile.name.split(' ')[0]}'s Room`, icon: HomeIcon },
  ];

  const facilityItems = [
    { id: 'facility-overview', label: 'Overview', icon: Layers },
    { id: 'facility-rooms', label: 'Rooms', icon: Sofa },
    { id: 'facility-sections', label: 'Sections', icon: LayoutGrid },
    { id: 'facility-scenes', label: 'Scenes', icon: Film },
    { id: 'facility-doors', label: 'Doors', icon: Lock },
    { id: 'facility-lights', label: 'Lights', icon: Lightbulb },
    { id: 'facility-appliances', label: 'Appliances', icon: Power },
    { id: 'facility-cameras', label: 'Cameras', icon: Camera },
    { id: 'facility-windows', label: 'Windows', icon: WindowIcon },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </button>
            ))}

            {/* Facilities Collapsible */}
            <div className="space-y-1">
              <button
                onClick={() => setIsFacilitiesOpen(!isFacilitiesOpen)}
                className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">Facilities</span>
                <ChevronRight className={cn("h-4 w-4 transition-transform", isFacilitiesOpen && "rotate-90")} />
              </button>
              
              <AnimatePresence initial={false}>
                {isFacilitiesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4 space-y-1"
                  >
                    {facilityItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                          "group flex w-full items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          activeView === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="mr-2 h-3.5 w-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => onViewChange('contacts')}
              className={cn(
                "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                activeView === 'contacts' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <Contact className="mr-2 h-4 w-4" />
              Contacts
            </button>

            <button
              onClick={() => onViewChange('all-users')}
              className={cn(
                "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                activeView === 'all-users' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              All Users
            </button>

            <button
              onClick={() => onViewChange('logs')}
              className={cn(
                "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                activeView === 'logs' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Logs
            </button>
          </div>
        </div>
      </ScrollArea>

      <div className="mt-auto border-t p-4">
        <button 
          onClick={() => onViewChange('profile')}
          className={cn(
            "flex w-full items-center gap-3 px-2 py-2 rounded-md transition-colors hover:bg-accent",
            activeView === 'profile' ? "bg-accent" : ""
          )}
        >
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            <img src={userProfile.avatar} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium">{userProfile.name.split(' ')[0]} {userProfile.name.split(' ')[1]?.[0]}.</span>
            <span className="text-[10px] text-muted-foreground">Home Owner</span>
          </div>
          <div className="ml-auto rounded-md p-1">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
      </div>
    </div>
  );
}
