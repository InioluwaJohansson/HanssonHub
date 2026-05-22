import * as React from 'react';
import { Device } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Lightbulb, 
  LightbulbOff,
  Lock, 
  Unlock, 
  DoorOpen,
  Power, 
  Thermometer, 
  Camera, 
  Tv, 
  Coffee, 
  Wind,
  Droplets,
  Sun,
  ChevronRight,
  Trash2,
  Edit3,
  AppWindow as WindowIcon,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface DeviceCardProps {
  key?: string | number;
  device: Device;
  onToggle: (id: string) => void;
  onValueChange?: (id: string, value: number) => void;
  onStatusChange?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onClick?: (device: Device) => void;
  variant?: 'default' | 'summary';
}

const getIcon = (device: Device) => {
  const { type, status, value } = device;
  const isActive = status === 'on' || status === 'unlocked' || status === 'active' || status === 'open';
  const isLocked = status === 'locked' || status === 'open-locked';
  const color = isActive ? 'text-yellow-500' : 'text-muted-foreground';
  
  switch (type) {
    case 'light':
      if (status === 'off' || value === 0) return <LightbulbOff className="h-5 w-5 text-muted-foreground" />;
      if (value && value < 33) return <Lightbulb className="h-5 w-5 text-yellow-500/50" />;
      if (value && value < 66) return <Lightbulb className="h-5 w-5 text-yellow-500/80" />;
      return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    case 'door':
      if (isLocked) return <Lock className="h-5 w-5 text-red-500" />;
      if (status === 'open') return <DoorOpen className="h-5 w-5 text-green-500" />;
      return <Unlock className="h-5 w-5 text-yellow-500" />;
    case 'window':
      if (status === 'locked') return <Lock className="h-5 w-5 text-red-500" />;
      if (status === 'open') return <WindowIcon className="h-5 w-5 text-green-500" />;
      return <WindowIcon className="h-5 w-5 text-muted-foreground" />;
    case 'appliance':
      return <Power className={cn("h-5 w-5 transition-colors", color)} />;
    case 'camera':
      return <Camera className={cn("h-5 w-5 transition-colors", color)} />;
    case 'speaker':
      return <Tv className={cn("h-5 w-5 transition-colors", color)} />;
    default:
      return <Power className="h-5 w-5" />;
  }
};

export function DeviceCard({ device, onToggle, onValueChange, onStatusChange, onDelete, onEdit, onClick, variant = 'default' }: DeviceCardProps) {
  const isActive = device.status === 'on' || device.status === 'unlocked' || device.status === 'active' || device.status === 'open';
  const isLocked = device.status === 'locked' || device.status === 'open-locked';
  const isOpen = device.status === 'open' || device.status === 'open-locked';
  const isSummary = variant === 'summary';

  const handleDoorAction = (action: 'lock' | 'unlock' | 'open' | 'close') => {
    if ((device.type !== 'door' && device.type !== 'window') || isSummary) return;
    
    if (action === 'lock') {
      // Always close and lock as requested
      onStatusChange?.(device.id, 'locked');
    } else if (action === 'unlock') {
      if (isOpen) {
        onStatusChange?.(device.id, 'open');
      } else {
        onStatusChange?.(device.id, 'unlocked');
      }
    } else if (action === 'open') {
      if (isLocked) {
        onStatusChange?.(device.id, 'open-locked');
      } else {
        onStatusChange?.(device.id, 'open');
      }
    } else if (action === 'close') {
      if (isLocked) {
        onStatusChange?.(device.id, 'locked');
      } else {
        onStatusChange?.(device.id, 'unlocked');
      }
    }
  };

  const getOpenCloseLabel = () => {
    if (device.status === 'open-locked') return 'Open';
    return isOpen ? 'Close' : 'Open';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-md",
          isActive ? "border-primary/50 bg-primary/5" : "bg-card",
          onClick ? "cursor-pointer" : ""
        )}
        onClick={() => {
          onClick?.(device);
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "rounded-full p-2 transition-colors",
              isActive ? "bg-primary/10" : "bg-muted"
            )}>
              {getIcon(device)}
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-sm font-medium leading-none">
                {device.name}
              </CardTitle>
              {device.doorType && (
                <span className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {device.doorType}
                </span>
              )}
            </div>
          </div>
          {!isSummary && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {(device.type === 'door' || device.type === 'window') ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isLocked ? "text-red-500 hover:bg-red-500/10" : "text-green-500 hover:bg-green-500/10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDoorAction(isLocked ? 'unlock' : 'lock');
                  }}
                >
                  {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              ) : (
                <Switch 
                  checked={isActive} 
                  onCheckedChange={() => onToggle(device.id)}
                />
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider">
              {device.status.replace('-', ' ')}
            </Badge>
            {device.value !== undefined && (!isActive || isSummary) && (
              <span className="text-xs font-mono text-muted-foreground">
                {`${device.value}%`}
              </span>
            )}
            {device.type === 'appliance' && device.powerUsage !== undefined && (
              <span className="text-[10px] font-mono text-muted-foreground">
                {device.powerUsage}W
              </span>
            )}

            {(device.type === 'door' || device.type === 'window') && !isSummary && (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 transition-colors rounded-lg border flex items-center justify-center shadow-sm",
                    isLocked 
                      ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" 
                      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  )}
                  onClick={(e) => { e.stopPropagation(); handleDoorAction(isLocked ? 'unlock' : 'lock'); }}
                  title={isLocked ? 'Unlock' : 'Lock'}
                >
                  {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 transition-colors rounded-lg border flex items-center justify-center shadow-sm",
                    isOpen
                      ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  )}
                  onClick={(e) => { e.stopPropagation(); handleDoorAction(isOpen ? 'close' : 'open'); }}
                  title={isOpen ? 'Close' : 'Open'}
                >
                  {isOpen ? (device.status === 'open-locked' ? <DoorOpen className="h-4 w-4" /> : <WindowIcon className="h-4 w-4" />) : <WindowIcon className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
            
            {device.value !== undefined && isActive && device.type !== 'door' && device.type !== 'window' && !isSummary && (
              <div className="pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    <span>Intensity</span>
                  </div>
                  <span>{device.value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={device.value}
                  onChange={(e) => { e.stopPropagation(); onValueChange?.(device.id, parseInt(e.target.value)); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            {device.type === 'camera' && isActive && (
              <div 
                className="relative mt-2 aspect-video overflow-hidden rounded-lg bg-black cursor-pointer group/camera"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(device);
                }}
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/camera:opacity-100 transition-opacity bg-black/40">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Maximize2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur-md">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-wider">Live Feed</span>
                </div>
                <img 
                  src={`https://picsum.photos/seed/${device.id}/400/225`} 
                  alt="Camera Feed" 
                  className="h-full w-full object-cover opacity-60 grayscale group-hover/camera:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
