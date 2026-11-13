import * as React from 'react';
import { Device } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { HlsVideo } from './HlsVideo';
import { WaterTank } from './WaterTank';
import { 
  Lightbulb, 
  LightbulbOff,
  Lock, 
  Unlock, 
  DoorOpen,
  DoorClosed,
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
  Maximize2,
  Radio,
  Zap,
  Flame,
  Sprout,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const resolveCameraUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const relativePath = url.startsWith('/') ? url.substring(1) : url;
  return `https://kv5zhpcr-7190.uks1.devtunnels.ms/storage/${relativePath}`;
};

interface DeviceCardProps {
  key?: string | number;
  device: Device;
  onToggle: (id: string) => void;
  onValueChange?: (id: string, value: number) => void;
  onValueChangeEnd?: (id: string, value: number) => void;
  onStatusChange?: (id: string, status: string) => void;
  onDoorAction?: (id: string, action: 'lock'|'unlock'|'open'|'close') => void;
  onDelete?: (id: string, type?: string) => void;
  onEdit?: (id: string, type?: string) => void;
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
    case 'utility': {
      const ut = Number(device.utilityType || 1);
      if (ut === 2) return <Droplets className={cn("h-5 w-5 transition-colors", isActive ? "text-sky-500" : "text-muted-foreground")} />;
      if (ut === 3) return <Flame className={cn("h-5 w-5 transition-colors", isActive ? "text-orange-500" : "text-muted-foreground")} />;
      if (ut === 4) return <Wind className={cn("h-5 w-5 transition-colors", isActive ? "text-cyan-500" : "text-muted-foreground")} />;
      if (ut === 5) return <Radio className={cn("h-5 w-5 transition-colors", isActive ? "text-indigo-500" : "text-muted-foreground")} />;
      if (ut === 6) return <Sprout className={cn("h-5 w-5 transition-colors", isActive ? "text-emerald-500" : "text-muted-foreground")} />;
      if (ut === 7) return <ShieldAlert className={cn("h-5 w-5 transition-colors", isActive ? "text-rose-500" : "text-muted-foreground")} />;
      return <Zap className={cn("h-5 w-5 transition-colors", color)} />;
    }
    case 'camera':
      return <Camera className={cn("h-5 w-5 transition-colors", color)} />;
    case 'external' as any:
      return <Radio className={cn("h-5 w-5 transition-colors", color)} />;
    case 'speaker':
      return <Tv className={cn("h-5 w-5 transition-colors", color)} />;
    default:
      return <Power className="h-5 w-5" />;
  }
};

const formatUtilitySubLabel = (raw?: string | number | null): string => {
  if (raw === undefined || raw === null || raw === '') return '';
  return raw.toString().replace(/([a-z])([A-Z])/g, '$1 $2').trim();
};

export function DeviceCard({ device, onToggle, onValueChange, onValueChangeEnd, onStatusChange, onDoorAction, onDelete, onEdit, onClick, variant = 'default' }: DeviceCardProps) {
  const isActive = device.status === 'on' || device.status === 'unlocked' || device.status === 'active' || device.status === 'open';
  const isLocked = device.status === 'locked' || device.status === 'open-locked';
  const isOpen = device.status === 'open' || device.status === 'open-locked';
  const isSummary = variant === 'summary';

  const handleDoorAction = (action: 'lock' | 'unlock' | 'open' | 'close') => {
    if ((device.type !== 'door' && device.type !== 'window') || isSummary) return;
    
    if ((action === 'open' || action === 'close') && isLocked) {
      return;
    }

    if (onDoorAction) {
      onDoorAction(device.id, action);
      return;
    }

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
          "group relative overflow-hidden transition-all duration-300 hover:shadow-md border",
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
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-sm font-medium leading-none truncate">
                {device.name}
              </CardTitle>
              {device.doorType && !/^\d+$/.test(device.doorType.toString()) && (
                <span className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {device.doorType}
                </span>
              )}
              {device.type === 'utility' && (device.utilityTypeName || device.utilityComponentName) && (
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                  {[formatUtilitySubLabel(device.utilityTypeName), formatUtilitySubLabel(device.utilityComponentName)].filter(Boolean).join(' • ')}
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
            {device.type === 'utility' && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                {(device.powerConsumption !== undefined && device.powerConsumption !== null) ? (
                  <span>{device.powerConsumption}W</span>
                ) : (device.powerUsage !== undefined && (Number(device.utilityType) === 1 || Number(device.utilityType) === 4) && (
                  <span>{device.powerUsage}W</span>
                ))}
                {device.timeOut !== undefined && device.timeOut !== null && device.timeOut > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {device.timeOut} min
                  </span>
                )}
              </div>
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
                  disabled={isLocked}
                  className={cn(
                    "h-8 w-8 transition-colors rounded-lg border flex items-center justify-center shadow-sm",
                    isOpen
                      ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                    isLocked && "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                  )}
                  onClick={(e) => { e.stopPropagation(); handleDoorAction(isOpen ? 'close' : 'open'); }}
                  title={isOpen ? 'Close' : 'Open'}
                >
                  {device.type === 'door' ? (
                    isOpen ? <DoorOpen className="h-4 w-4" /> : <DoorClosed className="h-4 w-4" />
                  ) : (
                    isOpen ? <WindowIcon className="h-4 w-4" /> : <WindowIcon className="h-4 w-4 opacity-40" />
                  )}
                </Button>
              </div>
            )}
          </div>
            
            {device.type === 'utility' && !isSummary && (() => {
              const ut = Number(device.utilityType || 1);
              if (ut === 1 || ut === 4) {
                const hasMetrics = [device.voltageLevel, device.currentLevel, device.powerConsumptionToday].some(v => v !== undefined && v !== null);
                if (!hasMetrics) return null;
                return (
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/50 text-[10px]">
                    <div className="rounded-lg bg-muted/60 px-2 py-1">
                      <span className="text-muted-foreground block uppercase text-[9px]">Voltage</span>
                      <span className="font-mono font-semibold">{device.voltageLevel ?? 0}V</span>
                    </div>
                    <div className="rounded-lg bg-muted/60 px-2 py-1">
                      <span className="text-muted-foreground block uppercase text-[9px]">Current</span>
                      <span className="font-mono font-semibold">{device.currentLevel ?? 0}A</span>
                    </div>
                    <div className="rounded-lg bg-muted/60 px-2 py-1">
                      <span className="text-muted-foreground block uppercase text-[9px]">Today</span>
                      <span className="font-mono font-semibold">{device.powerConsumptionToday ?? 0} kWh</span>
                    </div>
                  </div>
                );
              }
              if (ut === 2) {
                return (
                  <div className="pt-2 border-t border-border/50">
                    <WaterTank
                      currentWaterLevel={device.currentWaterLevel}
                      minWaterLevel={device.minWaterLevel}
                      maxWaterLevel={device.maxWaterLevel}
                      size="sm"
                    />
                  </div>
                );
              }
              if (ut === 7) {
                const compId = Number(device.utilityComponent);
                const sevClass = compId === 11
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : compId === 10
                  ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30"
                  : compId === 9
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-slate-500/10 text-slate-600 dark:text-zinc-400 border-slate-500/20";
                const actionsCount = device.actionIds?.length || 0;
                return (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 text-[10px]">
                    <span className={cn("px-2 py-0.5 rounded-md border font-semibold uppercase tracking-wider", sevClass)}>
                      {formatUtilitySubLabel(device.utilityComponentName || 'Emergency')}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {actionsCount} {actionsCount === 1 ? 'Action' : 'Actions'}
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {device.value !== undefined && isActive && device.type === 'light' && !isSummary && (
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
                  onMouseUp={(e) => { e.stopPropagation(); onValueChangeEnd?.(device.id, device.value || 0); }}
                  onTouchEnd={(e) => { e.stopPropagation(); onValueChangeEnd?.(device.id, device.value || 0); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            {device.type === 'camera' && (
              <div 
                className="relative mt-2 aspect-video overflow-hidden rounded-xl bg-slate-900 cursor-pointer group/camera border border-slate-800 shadow-inner"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(device);
                }}
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/camera:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-md shadow-lg border border-white/20">
                    <Maximize2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md border border-white/10">
                  <div className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-red-500 animate-pulse" : "bg-slate-400")} />
                  <span className="text-[8px] font-bold text-white uppercase tracking-wider font-mono">
                    {isActive ? "Live Feed" : "Camera Standby"}
                  </span>
                </div>
                {(() => {
                  const rawUrl = device.liveStreamUrl || device.streamPath;
                  const feedUrl = rawUrl ? resolveCameraUrl(rawUrl) : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
                  return (
                    <HlsVideo 
                      src={feedUrl} 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                      className="h-full w-full object-cover opacity-90 group-hover/camera:scale-105 transition-transform duration-500 pointer-events-none" 
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
