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
  UserPlus,
  Key,
  Trash2,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { API_BASE_URL } from '../config';
import { GetUserDto } from '../api/types';
import { cn } from '../lib/utils';
import { DynamicParticleSphere } from './DynamicParticleSphere';

import api from '../api/client';
import { RememberedUsersManager, RememberedUser } from '../utils/rememberedUsers';

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
}

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Control panel for system status and active profiles.' },
  { id: 'my-room', label: 'My Room', icon: Home, desc: 'Manage cameras, lights, and settings in your personal space.' },
  { id: 'facility', label: 'Facilities', icon: Settings2, desc: 'Manage multiple facilities and hardware controls.' },
  { id: 'contacts', label: 'Contacts', icon: Contact, desc: 'Emergency channels and resident address directory.' },
  { id: 'chat', label: 'Chats', icon: MessageSquare, desc: 'Collaborative safe space and secure multi-user messaging.' },
  { id: 'friday', label: 'Friday AI Assistant', icon: null, desc: 'Voice-controlled smart assistant with real-time feedback.', isSphere: true },
];

export function LoginScreen({ onLoginSuccess, theme, toggleTheme }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberedUsers, setRememberedUsers] = useState<RememberedUser[]>([]);
  const [isChoosingAccount, setIsChoosingAccount] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Single active item carousel index & transition state (5s duration per item)
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isItemVisible, setIsItemVisible] = useState(true);

  useEffect(() => {
    const list = RememberedUsersManager.getUsers();
    setRememberedUsers(list);
    if (list.length > 0) {
      setIsChoosingAccount(true);
    }
  }, []);

  // 5s Per Item Cycle: 1s entrance, 3s hold, 1s exit in opposite direction
  useEffect(() => {
    setIsItemVisible(true);

    const exitTimer = setTimeout(() => {
      setIsItemVisible(false);
    }, 4000);

    const nextTimer = setTimeout(() => {
      setCurrentPageIndex(prev => (prev + 1) % PAGES.length);
    }, 5000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(nextTimer);
    };
  }, [currentPageIndex]);

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

          {/* Horizontal Scroll Div of Cards */}
          <div 
            className="w-full max-w-5xl flex flex-row items-center gap-7 overflow-x-auto py-6 px-4 no-scrollbar z-10 justify-center"
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
                className="relative flex flex-col items-center bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 hover:bg-white/95 dark:hover:bg-zinc-800 rounded-2xl p-7 w-56 shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
              >
                {/* Delete icon */}
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
                <div className="h-32 w-32 rounded-full border-4 border-slate-900 dark:border-zinc-100 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {user.imageUrl?.trim() ? (
                    <img
                      src={getFullImageUrl(user.imageUrl) || undefined}
                      alt={user.name}
                      className="h-full w-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-14 w-14 text-slate-400 dark:text-zinc-500" />
                  )}
                </div>

                {/* Name & username stacked below the image */}
                <div className="mt-5 text-center w-full">
                  <span className="block text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-wide truncate group-hover:text-black dark:group-hover:text-white transition-colors">
                    {user.name}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-zinc-400 font-semibold tracking-wider mt-1 truncate">
                    @{user.username}
                  </span>
                </div>
              </div>
            ))}

            {/* Use another account card at the end of the user cards list */}
            <div
              onClick={() => {
                setUsername('');
                setIsChoosingAccount(false);
              }}
              className="relative flex flex-col items-center bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-slate-900 dark:hover:border-zinc-100 hover:bg-white/95 dark:hover:bg-zinc-800 rounded-2xl p-7 w-56 shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
            >
              <div className="h-32 w-32 rounded-full border-4 border-dashed border-slate-400 dark:border-zinc-600 group-hover:border-slate-900 dark:group-hover:border-zinc-100 flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/60 shadow-inner group-hover:scale-105 transition-all duration-300">
                <UserPlus className="h-12 w-12 text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-zinc-100 transition-colors" />
              </div>

              <div className="mt-5 text-center w-full">
                <span className="block text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-wide truncate group-hover:text-black dark:group-hover:text-white transition-colors">
                  Use Another Account
                </span>
                <span className="block text-xs text-slate-500 dark:text-zinc-400 font-semibold tracking-wider mt-1 truncate">
                  Log in with new user
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SECTION - Single Item Display Carousel with 5s transitions */}
      <div className="hidden md:flex flex-[0.75] flex-col items-center justify-center p-12 relative overflow-hidden bg-transparent border-r-0 select-none">
        
        {/* Container for single item display */}
        <div className="relative w-full max-w-md flex flex-col items-center justify-center min-h-[420px]">
          {(() => {
            const currentItem = PAGES[currentPageIndex];
            const IconComponent = currentItem.icon;

            return (
              <div className="flex flex-col items-center justify-center w-full relative">
                
                {/* 1. Div holding the icon - slides from LEFT */}
                <div 
                  className={cn(
                    "relative h-48 w-48 rounded-[2.25rem] flex items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out bg-white dark:bg-zinc-900",
                    isItemVisible 
                      ? "translate-x-0 border-2 border-slate-900 dark:border-zinc-100 opacity-100 shadow-2xl shadow-slate-900/10 dark:shadow-zinc-100/10" 
                      : "-translate-x-36 border-2 border-transparent opacity-0 shadow-none"
                  )}
                  style={{
                    boxShadow: isItemVisible ? '0 25px 50px -12px rgba(0,0,0,0.18), 0 0 25px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {/* 2. Icon - slides from RIGHT into the div */}
                  <div 
                    className={cn(
                      "flex items-center justify-center transition-all duration-1000 ease-in-out",
                      isItemVisible ? "translate-x-0 opacity-100" : "translate-x-36 opacity-0"
                    )}
                  >
                    {currentItem.isSphere ? (
                      <DynamicParticleSphere 
                        size={150} 
                        audioLevel={65} 
                        isIcon={true} 
                        isGreyscale={true} 
                        className="scale-110"
                      />
                    ) : IconComponent ? (
                      <IconComponent className="h-24 w-24 text-slate-900 dark:text-zinc-100" />
                    ) : null}
                  </div>
                </div>

                {/* Visual subtle connector gap */}
                <div className="h-7 w-[1px] bg-transparent" />

                {/* 3. Name of the item & Text beneath it - transitions to full brightness within 1s beneath the div */}
                <div 
                  className={cn(
                    "text-center px-4 space-y-2.5 transition-all duration-1000 ease-in-out max-w-sm",
                    isItemVisible ? "opacity-100 filter-none translate-y-0" : "opacity-0 brightness-0 translate-y-3"
                  )}
                >
                  {/* Name of the item */}
                  <div className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                    {currentItem.label}
                  </div>
                  
                  {/* Text beneath it (description) */}
                  <div className="text-sm font-medium text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {currentItem.desc}
                  </div>
                </div>

              </div>
            );
          })()}
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
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-black dark:hover:text-white flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer self-start transition-colors"
            >
              ← Back to accounts
            </button>
          )}

        </div>
      </div>

    </div>
  );
}

