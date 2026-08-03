import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Settings2, 
  Contact, 
  MessageSquare, 
  ShieldCheck, 
  LogIn, 
  Eye, 
  EyeOff, 
  User,
  Key,
  Trash2,
  Sun,
  Moon,
  Mic,
  MicOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { API_BASE_URL } from '../config';
import { UserLoginResponse, GetUserDto } from '../api/types';
import { cn } from '../lib/utils';

import api from '../api/client';
import { RememberedUsersManager, RememberedUser } from '../utils/rememberedUsers';
import { DynamicParticleSphere } from './DynamicParticleSphere';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const baseDomain = API_BASE_URL.replace(/\/Home_Security$/, '').replace(/\/$/, '');
  
  if (cleanUrl.startsWith('storage/')) {
    return `${baseDomain}/${cleanUrl}`;
  }
  return `${baseDomain}/storage/${cleanUrl}`;
};

interface LoginScreenProps {
  onLoginSuccess: (userData: GetUserDto, token: string) => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  isMicMuted?: boolean;
  onToggleMic?: () => void;
}

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Control panel for system status and active profiles.' },
  { id: 'my-room', label: 'My Room', icon: Home, desc: 'Manage cameras, lights, and settings in your personal space.' },
  { id: 'facility', label: 'Facilities', icon: Settings2, desc: 'Manage multiple facilities and hardware controls.' },
  { id: 'contacts', label: 'Contacts', icon: Contact, desc: 'Emergency channels and resident address directory.' },
  { id: 'chat', label: 'Chats', icon: MessageSquare, desc: 'Collaborative safe space and secure multi-user messaging.' },
];

export function LoginScreen({ onLoginSuccess, theme, toggleTheme, isMicMuted = true, onToggleMic }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [rememberedUsers, setRememberedUsers] = useState<RememberedUser[]>([]);
  const [isChoosingAccount, setIsChoosingAccount] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const list = RememberedUsersManager.getUsers();
    setRememberedUsers(list);
    if (list.length > 0) {
      setIsChoosingAccount(true);
    }
  }, []);

  // Rotate every 10 seconds smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setRotation(prev => prev + 72);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both Username and Password.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const url = `/User/Login?userName=${username}&password=${password}`;

      const response = await api.get(url, {
        headers: {
          'accept': '*/*',
        }
      });

      const result = response.data;
      
      if (result.success || result.status || result.token) {
        toast.success("Successfully logged in!");
        onLoginSuccess(result.data, result.token);
      } else {
        throw new Error(result.message || 'Invalid logical response from server');
      }
    } 
    catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "An error occurred during login. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 dark:bg-zinc-950 text-foreground dark:text-zinc-100 overflow-hidden font-sans relative transition-colors duration-300">
      
      {/* Top Right Controls: Theme Toggle */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-slate-100/90 dark:bg-zinc-800/90 p-1.5 px-2 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm backdrop-blur-md">
        {/* Theme Toggle Button */}
        {toggleTheme && (
          <button 
            type="button"
            onClick={toggleTheme}
            className="flex items-center bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-full p-1 cursor-pointer transition-all shadow-xs gap-0.5 select-none"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <div className={cn("flex items-center justify-center p-1 rounded-full transition-all", theme === 'light' ? "bg-amber-500 text-white shadow-xs" : "text-slate-400 hover:text-slate-200")}>
              <Sun className="h-3.5 w-3.5" />
            </div>
            <div className={cn("flex items-center justify-center p-1 rounded-full transition-all", theme === 'dark' ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-700")}>
              <Moon className="h-3.5 w-3.5" />
            </div>
          </button>
        )}

        {/* Microphone Button */}
        {onToggleMic && (
          <button
            type="button"
            onClick={onToggleMic}
            className={cn(
              "relative rounded-full p-1 transition-all flex items-center justify-center border border-slate-200 dark:border-zinc-700 shadow-2xs cursor-pointer overflow-hidden",
              !isMicMuted ? "bg-rose-500/10 border-rose-300" : "bg-white/90 dark:bg-zinc-900/90 hover:bg-white"
            )}
            title={!isMicMuted ? "Stop Friday AI" : "Start Friday AI"}
          >
            <div className="flex items-center justify-center w-6 h-6 overflow-hidden rounded-full">
              <DynamicParticleSphere size={22} audioLevel={!isMicMuted ? 120 : 0} isIcon={true} />
            </div>
          </button>
        )}
      </div>

      {isChoosingAccount && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-100/90 dark:bg-zinc-950/90 backdrop-blur-xl p-8 select-none overflow-hidden animate-fade-in">
          {/* Grainy CSS Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[repeat] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />

          {/* Header details inside the overlay */}
          <div className="text-center space-y-3 mb-10 z-10">
            <div className="flex items-center justify-center gap-2.5">
              <ShieldCheck className="h-9 w-9 text-slate-900 dark:text-zinc-100 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
              <h2 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-wider uppercase">Hansson Hub</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold tracking-[0.2em] uppercase">
              Select an authorized profile to unlock
            </p>
          </div>

          {/* Horizontal Scroll Div of Cards, scroll bar is invisible, centered at all times */}
          <div 
            className="w-full max-w-4xl flex flex-row items-center gap-6 overflow-x-auto py-6 px-4 no-scrollbar z-10 justify-center"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none !important;
              }
            `}</style>
            {rememberedUsers.map((user, index) => (
              <div
                key={index}
                onClick={() => {
                  setUsername(user.username);
                  setIsChoosingAccount(false);
                }}
                className="relative flex flex-col items-center bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 hover:bg-white/95 dark:hover:bg-zinc-800 rounded-2xl p-6 w-48 shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
              >
                {/* Delete icon to delete that particular stored user metadata */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    RememberedUsersManager.removeUser(user.username);
                    const remaining = RememberedUsersManager.getUsers();
                    setRememberedUsers(remaining);
                    if (remaining.length === 0) {
                      setIsChoosingAccount(false);
                    }
                  }}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-transparent border-0 outline-none cursor-pointer"
                  title="Remove profile"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Big Image with circular black border around it */}
                <div className="h-28 w-28 rounded-full border-4 border-slate-900 dark:border-zinc-100 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {user.imageUrl ? (
                    <img
                      src={getFullImageUrl(user.imageUrl)}
                      alt={user.name}
                      className="h-full w-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-12 w-12 text-slate-400 dark:text-zinc-500" />
                  )}
                </div>

                {/* Name & username stacked below the image */}
                <div className="mt-5 text-center w-full">
                  <span className="block text-sm font-extrabold text-slate-900 dark:text-zinc-100 tracking-wide truncate group-hover:text-black dark:group-hover:text-white transition-colors">
                    {user.name}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-zinc-400 font-semibold tracking-wider mt-1 truncate">
                    @{user.username}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Use another account button below the div */}
          <button
            type="button"
            onClick={() => {
              setUsername('');
              setIsChoosingAccount(false);
            }}
            className="mt-10 px-8 h-12 border border-slate-300 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-400 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-extrabold rounded-xl text-xs tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer select-none z-10 flex items-center justify-center gap-2"
          >
            Use another account
          </button>
        </div>
      )}

      {/* LEFT SECTION (65% width) - 3D Rotating Icons carousel */}
      <div className="hidden md:flex flex-[0.75] flex-col items-center justify-center p-12 relative overflow-hidden bg-transparent border-r border-slate-200/65 dark:border-zinc-800/80">
        
        {/* Orbit track helper ellipse */}
        <div 
          className="absolute border border-dashed border-slate-300 dark:border-zinc-700 rounded-full pointer-events-none" 
          style={{
            width: '420px',
            height: '130px',
            transform: 'translateX(15px) rotate(-5deg) translateY(-20px)',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.015) 0%, transparent 70%)'
          }}
        />

        {/* Dynamic Circular Orbit Carousel container */}
        <div className="relative w-[480px] h-[360px] flex items-center justify-center animate-fade-in" style={{ perspective: '1000px', transform: 'translateX(15px)' }}>
          {PAGES.map((item, idx) => {
            const Icon = item.icon;
            // Calculate current angle based on static offset minus shifting rotation
            const angle = 72 * idx - rotation;
            const theta = (angle * Math.PI) / 180;
            
            // Orbit Math coordinates (wider radius for increased size)
            const x = Math.sin(theta) * 190; 
            const z = Math.cos(theta); 
            // Add a subtle tilt for 3D depth illusion
            const y = -Math.cos(theta) * 25; 

            // Derived styles based on depth factor z (-1 to 1)
            const scale = 0.8 + (z + 1) * 0.2; // larger range for larger moving text and icons
            const opacity = 0.45 + (z + 1) * 0.275; // higher base opacity
            const zIndex = Math.round((z + 1) * 10);

            return (
              <div 
                key={item.id}
                className="absolute flex flex-col items-center justify-center transition-all duration-[10000ms] ease-in-out select-none"
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z * 70}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  width: '220px'
                }}
              >
                {/* Glowing Hexagonal Orb */}
                <div 
                  className={`h-24 w-24 rounded-2xl flex items-center justify-center shadow-lg relative transition-all duration-300 ${
                    zIndex >= 15 
                      ? 'bg-white dark:bg-zinc-800 border-2 border-slate-900 dark:border-zinc-100 text-slate-900 dark:text-zinc-100' 
                      : 'bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  style={{
                    boxShadow: zIndex >= 15 ? '0 10px 30px rgba(0,0,0,0.12)' : 'none'
                  }}
                >
                  <Icon className={`h-12 w-12 transition-transform duration-300 ${zIndex >= 15 ? 'scale-105' : ''}`} />
                </div>
                
                {/* Visual Connector Line */}
                <div className="h-5 w-[1px] bg-slate-300 dark:bg-zinc-700" />

                {/* Tag details with increased font sizes */}
                <div className="text-center px-1">
                  <div className={`text-lg font-extrabold tracking-tight transition-colors duration-300 ${zIndex >= 15 ? 'text-slate-900 dark:text-zinc-100 font-black' : 'text-slate-700 dark:text-zinc-400'}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-zinc-400 mt-1 max-w-[170px] mx-auto leading-normal line-clamp-2">
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT SECTION (35% width login card form) aligned to absolute center of the right side */}
      <div className="w-full md:w-[35%] flex flex-col justify-center items-center p-4 bg-transparent relative z-10">
        
        {/* Card Component with slightly rounded edges + 1px border and glowing shadow effect */}
        <div 
          className="w-full max-w-sm p-8 bg-white dark:bg-zinc-900 border border-slate-900 dark:border-zinc-700 rounded-2xl space-y-8 transition-all duration-300 md:translate-x-[70px]"
          style={{
            boxShadow: '0 0 35px rgba(0,0,0,0.12), 0 0 15px rgba(0,0,0,0.06)'
          }}
        >
          {/* Header element: ShieldCheck icon before "Hansson Hub", subtext below */}
          <div className="space-y-2 select-none">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-slate-900 dark:text-zinc-100 shrink-0" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight uppercase">Hansson Hub</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-semibold uppercase tracking-wider">
              Enter authorized credentials to proceed
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              
              {/* Username Field */}
              <div className="space-y-1.5">
                <Label htmlFor="login-username" className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5 select-none">
                  <User className="h-3 w-3 text-slate-900 dark:text-zinc-100" />
                  Username
                </Label>
                <div className="relative">
                  <Input 
                    id="login-username"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="e.g. admin"
                    required
                    autoComplete="off"
                    className={username ? "border-b-2 border-b-green-400 text-base font-medium bg-transparent text-slate-900 dark:text-zinc-100" : "border-b-2 border-b-slate-200 dark:border-b-zinc-700 text-base font-medium bg-transparent text-slate-900 dark:text-zinc-100"}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 font-sans">
                <Label htmlFor="login-password" className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Key className="h-3 w-3 text-slate-900 dark:text-zinc-100" />
                  Password
                </Label>
                <div className="relative flex items-center">
                  <Input 
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className={password ? "border-b-2 border-b-green-400 text-base font-medium bg-transparent text-slate-900 dark:text-zinc-100 pr-8" : "border-b-2 border-b-slate-200 dark:border-b-zinc-700 text-base font-medium bg-transparent text-slate-900 dark:text-zinc-100 pr-8"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors bg-transparent border-0 outline-none p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-slate-900 dark:text-zinc-100" /> : <Eye className="h-4 w-4 text-slate-900 dark:text-zinc-100" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Login Button with LogIn icon */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-11 border border-slate-900 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer bg-white dark:bg-zinc-900 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center gap-1.5 h-4">
                  <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-zinc-100 animate-bounce [animation-delay:-0.3s]" style={{ animationDuration: '0.6s' }}></span>
                  <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-zinc-100 animate-bounce [animation-delay:-0.15s]" style={{ animationDuration: '0.6s' }}></span>
                  <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-zinc-100 animate-bounce" style={{ animationDuration: '0.6s' }}></span>
                </div>
              ) : (
                <>
                  <LogIn className="h-4 w-4 text-slate-900 dark:text-zinc-100" />
                  Login
                </>
              )}
            </button>
          </form>

          {rememberedUsers.length > 0 && (
            <button
              type="button"
              onClick={() => setIsChoosingAccount(true)}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-black flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer self-start transition-colors"
            >
              ← Back to accounts
            </button>
          )}

        </div>
      </div>

      {/* Centered Page Sub-text (System active,. continous secure rotation) spanning the bottom center of the page */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 tracking-[0.2em] font-mono select-none text-center whitespace-nowrap z-0">
        SYSTEM ACTIVE • CONTINUOUS SECURE ROTATION
      </div>

    </div>
  );
}
