import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { triggerSOS, getActiveSOS, updateSOSStatus, updateSOSLocation } from '../store/slices/sosSlice';
import { getContacts } from '../store/slices/contactSlice';
import { logout } from '../store/slices/authSlice';
import useGeolocation from '../hooks/useGeolocation';
import LiveMap from '../components/LiveMap';
import ChatModal from '../components/ChatModal';
import { Shield, Users, History, AlertTriangle, MapPin, PhoneCall, LogOut, Navigation, Heart, Sun, Moon, Settings, Bell, Zap, MessageSquare } from 'lucide-react';

const Dashboard = ({ toggleTheme, isDarkMode }) => {
  const [countdown, setCountdown] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { location, getLocation } = useGeolocation();

  const { user } = useSelector((state) => state.auth);
  const { activeSOS, isLoading } = useSelector((state) => state.sos);
  const { contacts } = useSelector((state) => state.contacts);

  useEffect(() => {
    dispatch(getActiveSOS());
    dispatch(getContacts());
    getLocation();
  }, [dispatch]);

  useEffect(() => {
    let interval;
    if (activeSOS) {
      interval = setInterval(() => {
        getLocation();
        if (location.loaded && !location.error) {
          dispatch(updateSOSLocation({
            id: activeSOS._id,
            location: {
              latitude: location.coordinates.lat,
              longitude: location.coordinates.lng,
              accuracy: location.accuracy
            }
          }));
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [activeSOS, location.loaded, dispatch]);

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      const sosLocation = location.loaded && !location.error
        ? { latitude: location.coordinates.lat, longitude: location.coordinates.lng, accuracy: location.accuracy }
        : null;
      dispatch(triggerSOS(sosLocation));
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="page-shell relative flex min-h-screen flex-col transition-colors duration-300">
      <div className="wave-bg" />

      {/* Real-time WebSocket Chat Modal */}
      <ChatModal isOpen={showChat} onClose={() => setShowChat(false)} />

      <header className="theme-header sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 p-2.5 shadow-[0_15px_30px_-18px_rgba(214,120,172,0.9)]">
              <Heart className="fill-white text-white" size={20} />
            </div>
            <span className="text-xl font-black tracking-[-0.08em] text-gradient-pink">Safety app</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChat(true)}
              className="relative rounded-2xl border border-pink-100 bg-white/80 p-3 text-pink-500 shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Open Real-Time Chat"
            >
              <MessageSquare size={20} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="rounded-2xl border border-pink-100 bg-white/80 p-3 text-pink-500 shadow-sm transition-all hover:scale-105 active:scale-95">
              <Settings size={20} />
            </button>
            <button onClick={() => dispatch(logout())} className="rounded-2xl border border-pink-100 bg-white/80 p-3 text-pink-500 shadow-sm transition-all hover:scale-105 hover:text-rose-500 active:scale-95">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6 pb-32">
        {/* User Card */}
        <div className="theme-card flex items-center justify-between p-5 animate-fade-in rounded-[2rem]">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-pink-300 to-pink-500 text-2xl font-black text-white shadow-[0_18px_35px_-20px_rgba(216,109,164,0.9)]">
              {user?.name?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-[-0.06em] text-[color:var(--ink)]">Hi, {user?.name?.split(' ')[0]} ✨</h1>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-pink-500 ring-1 ring-pink-100">
                <Zap size={10} fill="currentColor" /> Account protected
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 px-4 py-3 text-xs font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare size={16} /> Chat
          </button>
        </div>

        {/* Settings Overlay */}
        {showSettings && (
          <div className="theme-card animate-slide-up rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-[-0.05em] text-[color:var(--ink)]">Appearance</h3>
              <button onClick={() => setShowSettings(false)} className="rounded-full bg-pink-50 p-2 text-pink-500 transition-colors hover:bg-pink-100">✕</button>
            </div>

            <div className="flex items-center justify-between rounded-[1.5rem] bg-pink-50/60 p-4 ring-1 ring-pink-100">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-pink-500 shadow-sm">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[color:var(--ink)]">Dark mode</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">Night-friendly</span>
                </div>
              </div>
              <button onClick={toggleTheme} className={`h-9 w-16 rounded-full p-1 transition-all ${isDarkMode ? 'bg-pink-500' : 'bg-pink-100'}`}>
                <div className={`h-7 w-7 rounded-full bg-white shadow-md transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}

        {/* SOS Interaction Area */}
        <div className="relative flex flex-col items-center justify-center py-8">
          {countdown !== null ? (
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-pink-200/70" />
              <div className="relative flex h-64 w-64 flex-col items-center justify-center overflow-hidden rounded-full border-[12px] border-pink-100 bg-white/80 shadow-[0_25px_60px_-30px_rgba(216,109,164,0.7)]">
                <span className="text-7xl font-black tracking-[-0.08em] text-pink-500 tabular-nums">{countdown}</span>
                <button onClick={() => setCountdown(null)} className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-pink-400 underline decoration-2 underline-offset-4">Stop now</button>
              </div>
            </div>
          ) : activeSOS ? (
            <div className="w-full space-y-6 animate-slide-up">
              <div className="flex flex-col items-center gap-6 rounded-[2.4rem] bg-gradient-to-br from-rose-500 to-pink-500 p-10 text-center text-white shadow-[0_20px_50px_-20px_rgba(236,72,153,0.9)] sos-pulse-vibrant">
                <div className="rounded-full border border-white/30 bg-white/15 p-4 backdrop-blur-sm">
                  <AlertTriangle size={64} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-[-0.08em]">SOS active</h2>
                  <p className="mt-3 inline-block rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em]">Police & circle notified</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => dispatch(updateSOSStatus({ id: activeSOS._id, status: 'CLOSED' }))} className="rounded-[1.8rem] border border-emerald-200 bg-emerald-50 py-6 text-lg font-black text-emerald-600 transition-all hover:scale-[1.02] active:scale-95">
                  I’m safe
                </button>
                <button onClick={() => dispatch(updateSOSStatus({ id: activeSOS._id, status: 'CANCELLED' }))} className="rounded-[1.8rem] border border-rose-200 bg-rose-50 py-6 text-lg font-black text-rose-500 transition-all hover:scale-[1.02] active:scale-95">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <div className="absolute inset-[-28px] rounded-full bg-pink-200/35 blur-[72px] transition-all duration-700 group-hover:bg-pink-200/50" />
              <button
                onClick={() => setCountdown(3)}
                disabled={isLoading}
                className="relative flex h-64 w-64 flex-col items-center justify-center rounded-full border-[12px] border-white bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 text-white shadow-[0_30px_60px_-20px_rgba(216,109,164,0.8)] transition-all hover:scale-[1.02] active:scale-95"
              >
                <span className="text-6xl font-black tracking-[-0.08em]">SOS</span>
                <span className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] opacity-90">Emergency tap</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Map Area */}
        {activeSOS && (
          <div className="animate-slide-up space-y-4">
            <div className="theme-card rounded-[2rem] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 animate-ping rounded-full bg-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">Live tracker active</span>
                </div>
                <div className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-rose-500">Broadcasting</div>
              </div>

              <div className="h-[280px] overflow-hidden rounded-[1.6rem] border border-pink-100">
                <LiveMap location={location.loaded && !location.error ? { latitude: location.coordinates.lat, longitude: location.coordinates.lng, accuracy: location.accuracy } : activeSOS.location} />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: 'Circle', path: '/contacts', c: 'bg-pink-50 text-pink-500 ring-1 ring-pink-100' },
            { icon: Navigation, label: 'Zones', path: '/safe-zones', c: 'bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100' },
            { icon: History, label: 'Logs', path: '/history', c: 'bg-violet-50 text-violet-500 ring-1 ring-violet-100' }
          ].map((item, i) => (
            <Link key={i} to={item.path} className="theme-card flex flex-col items-center justify-center rounded-[1.5rem] p-4 text-center transition-all hover:scale-[1.02]">
              <div className={`mb-3 rounded-[1.2rem] p-3 ${item.c}`}>
                <item.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="theme-card rounded-[2rem] p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-[1.2rem] bg-pink-50 p-3 text-pink-500 ring-1 ring-pink-100">
              <Shield size={24} />
            </div>
            <p className="text-base font-semibold italic leading-relaxed text-[color:var(--ink)]">“You are courageous, capable, and never alone.”</p>
          </div>
        </div>
      </main>

      <nav className="pointer-events-none fixed bottom-8 left-6 right-6 z-50 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-10 rounded-[2rem] border border-pink-200/90 bg-gradient-to-r from-pink-50/95 via-pink-100/90 to-pink-50/95 px-6 py-4 shadow-[0_20px_45px_-22px_rgba(214,120,172,0.9)] backdrop-blur-xl">
          <Link to="/" className="text-pink-500 transition-transform hover:scale-110"><Heart size={28} fill="currentColor" /></Link>
          <Link to="/contacts" className="text-[color:var(--muted)] transition-all hover:scale-110 hover:text-pink-500"><Users size={26} /></Link>
          <Link to="/history" className="text-[color:var(--muted)] transition-all hover:scale-110 hover:text-pink-500"><History size={26} /></Link>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
