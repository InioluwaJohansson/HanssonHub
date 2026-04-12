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
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROOMS, SECTIONS } from '../constants';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

export type NavView = 'dashboard' | 'rooms' | 'facility-doors' | 'facility-lights' | 'facility-appliances' | 'facility-cameras' | 'facility-sections' | string;

interface SidebarProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
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

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">HanssonHub</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <button
              onClick={() => onViewChange('dashboard')}
              className={cn(
                "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                activeView === 'dashboard' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('rooms')}
              className={cn(
                "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                activeView === 'rooms' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <Building2 className="mr-2 h-4 w-4" />
              All Rooms
            </button>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Facilities
            </h2>
            <div className="space-y-1">
              <button
                onClick={() => onViewChange('facilities')}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === 'facilities' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => onViewChange('facility-appliances')}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === 'facility-appliances' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Power className="mr-2 h-4 w-4" />
                Appliances
              </button>
              <button
                onClick={() => onViewChange('facility-cameras')}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === 'facility-cameras' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Camera className="mr-2 h-4 w-4" />
                Cameras
              </button>
              <button
                onClick={() => onViewChange('facility-doors')}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === 'facility-doors' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Lock className="mr-2 h-4 w-4" />
                Doors
              </button>
              <button
                onClick={() => onViewChange('facility-lights')}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === 'facility-lights' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Lights
              </button>
              <button
                onClick={() => onViewChange('facility-sections')}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeView === 'facility-sections' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Layers className="mr-2 h-4 w-4" />
                Sections
              </button>
            </div>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.id} className="px-3 py-2">
              <h2 className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {section.name}
              </h2>
              <div className="space-y-1">
                {ROOMS.filter(r => r.section === section.id).map((room) => {
                  const Icon = iconMap[room.icon] || Sofa;
                  return (
                    <button
                      key={room.id}
                      onClick={() => onViewChange(`room-${room.id}`)}
                      className={cn(
                        "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        activeView === `room-${room.id}` ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {room.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">Inioluwa M.</span>
            <span className="text-[10px] text-muted-foreground">Home Owner</span>
          </div>
          <button className="ml-auto rounded-md p-1 hover:bg-accent">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
