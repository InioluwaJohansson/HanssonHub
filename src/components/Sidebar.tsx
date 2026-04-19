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
  Layout as WindowIcon,
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
  isCollapsed: boolean;
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

export function Sidebar({ activeView, onViewChange, rooms, sections, userProfile, isCollapsed }: SidebarProps) {
  const [isFacilitiesOpen, setIsFacilitiesOpen] = React.useState(true);

  const firstName = userProfile.getPersonDetailsDto.firstName;
  const lastName = userProfile.getPersonDetailsDto.lastName;
  const roleName = userProfile.getUserDto.roleName;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'user-room', label: `${firstName}'s Room`, icon: HomeIcon },
  ];

  const facilityItems = [
    { id: 'facilities', label: 'Overview', icon: Layers },
    { id: 'facility-appliances', label: 'Appliances', icon: Power },
    { id: 'facility-cameras', label: 'Cameras', icon: Camera },
    { id: 'facility-doors', label: 'Doors', icon: Lock },
    { id: 'facility-lights', label: 'Lights', icon: Lightbulb },
    { id: 'facility-rooms', label: 'Rooms', icon: Sofa },
    { id: 'facility-scenes', label: 'Scenes', icon: Film },
    { id: 'facility-sections', label: 'Sections', icon: LayoutGrid },
    { id: 'facility-windows', label: 'Windows', icon: WindowIcon },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="flex h-full flex-col border-r bg-card/50 backdrop-blur-xl transition-all duration-300 overflow-hidden"
    >
      <ScrollArea className="flex-1 px-3 min-h-0">
        <div className={cn(
          "space-y-4 py-4 min-h-full flex flex-col transition-all duration-500",
          !isFacilitiesOpen && "justify-center"
        )}>
          <div className="px-3 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}

            {/* Facilities Collapsible */}
            <div className="space-y-1">
              <button
                onClick={() => setIsFacilitiesOpen(!isFacilitiesOpen)}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? "Facilities" : undefined}
              >
                <Settings2 className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span className="flex-1 text-left">Facilities</span>}
                {!isCollapsed && <ChevronRight className={cn("h-4 w-4 transition-transform", isFacilitiesOpen && "rotate-90")} />}
              </button>
              
              <AnimatePresence initial={false}>
                {isFacilitiesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={cn("overflow-hidden space-y-1", !isCollapsed ? "pl-4" : "flex flex-col items-center py-2")}
                  >
                    {facilityItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                          "group flex w-full items-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                          activeView === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                          !isCollapsed ? "px-3 py-1.5 text-xs font-medium" : "justify-center p-2"
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className={cn(!isCollapsed ? "mr-2 h-3.5 w-3.5" : "h-4 w-4")} />
                        {!isCollapsed && item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {[
              { id: 'contacts', label: 'Contacts', icon: Contact },
              { id: 'all-users', label: 'All Users', icon: UserCircle },
              { id: 'logs', label: 'Logs', icon: ClipboardList },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="mt-auto border-t p-4">
        <button 
          onClick={() => onViewChange('profile')}
          className={cn(
            "flex w-full items-center gap-3 px-2 py-2 rounded-md transition-colors hover:bg-accent",
            activeView === 'profile' ? "bg-accent" : "",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Profile" : undefined}
        >
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
            <img src={userProfile.getPersonDetailsDto.imageUrl} alt="Profile" className="h-full w-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium">{firstName} {lastName[0]}.</span>
              <span className="text-[10px] text-muted-foreground">{roleName}</span>
            </div>
          )}
          {!isCollapsed && (
            <div className="ml-auto rounded-md p-1">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
