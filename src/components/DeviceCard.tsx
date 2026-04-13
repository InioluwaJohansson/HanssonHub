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
  ChevronRight,
  AppWindow as WindowIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface DeviceCardProps {
  key?: string | number;
  device: Device;
  onToggle: (id: string) => void;
  onValueChange?: (id: string, value: number) => void;
  onStatusChange?: (id: string, status: string) => void;
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

export function DeviceCard({ device, onToggle, onValueChange, onStatusChange, variant = 'default' }: DeviceCardProps) {
  const isActive = device.status === 'on' || device.status === 'unlocked' || device.status === 'active' || device.status === 'open';
  const isLocked = device.status === 'locked' || device.status === 'open-locked';
  const isOpen = device.status === 'open' || device.status === 'open-locked';
  const isSummary = variant === 'summary';

  const handleDoorAction = (action: 'lock' | 'unlock' | 'open' | 'close') => {
    if ((device.type !== 'door' && device.type !== 'window') || isSummary) return;
    
    if (action === 'lock') {
      if (isOpen) {
        onStatusChange?.(device.id, 'open-locked');
      } else {
        onStatusChange?.(device.id, 'locked');
      }
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
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md",
        isActive ? "border-primary/50 bg-primary/5" : "bg-card"
      )}>
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
            (device.type === 'door' || device.type === 'window') ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
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
            )
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider">
                {device.status.replace('-', ' ')}
              </Badge>
              {device.value !== undefined && (
                <span className="text-xs font-mono text-muted-foreground">
                  {`${device.value}%`}
                </span>
              )}
              {device.type === 'appliance' && device.powerUsage !== undefined && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  {device.powerUsage}W
                </span>
              )}
            </div>
            
            {(device.type === 'door' || device.type === 'window') && !isSummary && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-[10px]"
                    onClick={() => handleDoorAction(isLocked ? 'unlock' : 'lock')}
                  >
                    {isLocked ? <Unlock className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                    {isLocked ? 'Unlock' : 'Lock'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-[10px]"
                    onClick={() => handleDoorAction(isOpen ? 'close' : 'open')}
                  >
                    {isOpen ? (device.status === 'open-locked' ? <DoorOpen className="mr-1 h-3 w-3" /> : <WindowIcon className="mr-1 h-3 w-3" />) : <WindowIcon className="mr-1 h-3 w-3" />}
                    {getOpenCloseLabel()}
                  </Button>
                </div>
              </div>
            )}

            {device.value !== undefined && isActive && device.type !== 'door' && device.type !== 'window' && !isSummary && (
              <div className="pt-2">
                <Slider
                  value={[device.value]}
                  max={100}
                  min={0}
                  step={1}
                  onValueChange={(vals) => onValueChange?.(device.id, vals[0])}
                  className="py-2"
                />
              </div>
            )}

            {device.type === 'camera' && isActive && (
              <div className="relative mt-2 aspect-video overflow-hidden rounded-lg bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="ml-2 text-[10px] font-mono text-white/70 uppercase">Live Feed</span>
                </div>
                <img 
                  src={`https://picsum.photos/seed/${device.id}/400/225`} 
                  alt="Camera Feed" 
                  className="h-full w-full object-cover opacity-60 grayscale"
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
