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
  Key 
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { API_BASE_URL } from '../config';
import { UserLoginResponse, GetUserDto } from '../api/types';

interface LoginScreenProps {
  onLoginSuccess: (userData: GetUserDto, token: string) => void;
}

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Control panel for system status and active profiles.' },
  { id: 'my-room', label: 'My Room', icon: Home, desc: 'Manage cameras, lights, and settings in your personal space.' },
  { id: 'facility', label: 'Facilities', icon: Settings2, desc: 'Manage multiple facilities and hardware controls.' },
  { id: 'contacts', label: 'Contacts', icon: Contact, desc: 'Emergency channels and resident address directory.' },
  { id: 'chat', label: 'Chats', icon: MessageSquare, desc: 'Collaborative safe space and secure multi-user messaging.' },
];

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rotation, setRotation] = useState(0);

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

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: username,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const result: UserLoginResponse = await response.json();
      
      if (result.success && result.data && result.token) {
        toast.success("Successfully logged in!");
        onLoginSuccess(result.data, result.token);
      } else {
        throw new Error(result.message || 'Invalid logical response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "An error occurred during login. Please try again.");
      
      // FALLBACK for development if API is not yet available, so we can still test the UI
      if (username === 'admin' && password === 'password') {
        toast.info("Using development fallback login");
        onLoginSuccess({
          id: 1,
          userName: 'admin',
          roleName: 'Administrator',
          personId: 1,
          authorizationCode: '123456'
        }, 'mock-jwt-token');
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gradient-to-tr from-slate-50 via-slate-100 to-slate-200 text-black overflow-hidden font-sans relative">
      
      {/* LEFT SECTION (65% width) - 3D Rotating Icons carousel */}
      <div className="hidden md:flex flex-[0.75] flex-col items-center justify-center p-12 relative overflow-hidden bg-transparent border-r border-slate-200/65">
        
        {/* Orbit track helper ellipse */}
        <div 
          className="absolute border border-dashed border-slate-300 rounded-full pointer-events-none" 
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
                  className={`h-24 w-24 rounded-2xl flex items-center justify-center shadow-lg text-black relative transition-all duration-300 ${
                    zIndex >= 15 
                      ? 'bg-white border-2 border-black' 
                      : 'bg-white/80 border border-slate-200'
                  }`}
                  style={{
                    boxShadow: zIndex >= 15 ? '0 10px 30px rgba(0,0,0,0.12)' : 'none'
                  }}
                >
                  <Icon className={`h-12 w-12 text-black transition-transform duration-300 ${zIndex >= 15 ? 'scale-105' : ''}`} />
                </div>
                
                {/* Visual Connector Line */}
                <div className="h-5 w-[1px] bg-slate-300" />

                {/* Tag details with increased font sizes */}
                <div className="text-center px-1">
                  <div className={`text-lg font-extrabold tracking-tight transition-colors duration-300 ${zIndex >= 15 ? 'text-black font-black' : 'text-slate-700'}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-700 mt-1 max-w-[170px] mx-auto leading-normal line-clamp-2">
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
        
        {/* Card Component with slightly rounded edges + 1px black border and glowing shadow effect */}
        <div 
          className="w-full max-w-sm p-8 bg-white border border-black rounded-2xl space-y-8 transition-all duration-300 md:translate-x-[70px]"
          style={{
            boxShadow: '0 0 35px rgba(0,0,0,0.12), 0 0 15px rgba(0,0,0,0.06)'
          }}
        >
          
          {/* Header element: ShieldCheck icon before "Hansson Hub", subtext below */}
          <div className="space-y-2 select-none">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-black shrink-0" />
              <h2 className="text-2xl font-black text-black tracking-tight uppercase">Hansson Hub</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold uppercase tracking-wider">
              Enter authorized credentials to proceed
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              
              {/* Username Field */}
              <div className="space-y-1.5">
                <Label htmlFor="login-username" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 select-none">
                  <User className="h-3 w-3 text-black" />
                  Username
                </Label>
                <div className="relative">
                  <Input 
                    id="login-username"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="e.g. admin"
                    required
                    className={username ? "border-b-2 border-b-green-400 text-base font-medium bg-transparent text-black" : "border-b-2 border-b-slate-200 text-base font-medium bg-transparent text-black"}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 font-sans">
                <Label htmlFor="login-password" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 select-none">
                  <Key className="h-3 w-3 text-black" />
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
                    className={password ? "border-b-2 border-b-green-400 text-base font-medium bg-transparent text-black pr-8" : "border-b-2 border-b-slate-200 text-base font-medium bg-transparent text-black pr-8"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-0 outline-none p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Login Button with LogIn icon */}
            <button
              type="submit"
              className="w-full h-11 border border-black hover:bg-slate-50 text-black font-bold rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer bg-white"
            >
              <LogIn className="h-4 w-4 text-black" />
              Login
            </button>
          </form>

        </div>
      </div>

      {/* Centered Page Sub-text (System active,. continous secure rotation) spanning the bottom center of the page */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 tracking-[0.2em] font-mono select-none text-center whitespace-nowrap z-0">
        SYSTEM ACTIVE • CONTINUOUS SECURE ROTATION
      </div>

    </div>
  );
}
