import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Newspaper, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  Menu, 
  X,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Info,
  LogIn,
  LogOut,
  User as UserIcon,
  Plus,
  Trash2,
  FileText,
  Play,
  Image as ImageIcon
} from 'lucide-react';
import { NewsItem, EventItem, RegistrationData, User, RegistrationFormData } from './types';

// --- Components ---

const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (user: User, token: string) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user, data.token);
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-akkfg-blue p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-white/70 text-sm">{isRegister ? 'Join the AKKFG community' : 'Sign in to access your dashboard'}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{error}</div>}
          
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <input 
              required
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-akkfg-orange text-white py-4 rounded-xl font-bold shadow-lg hover:bg-akkfg-orange/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-slate-500 hover:text-akkfg-blue font-medium"
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </form>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <X size={24} />
        </button>
      </motion.div>
    </div>
  );
};

const Navbar = ({ activeTab, setActiveTab, user, onLogout, onOpenLogin }: { 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  user: User | null,
  onLogout: () => void,
  onOpenLogin: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'events', label: 'Events' },
    { id: 'register', label: 'Registrations' },
    { id: 'media', label: 'Media & News' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-12 h-12 bg-akkfg-orange rounded-full flex items-center justify-center text-white shadow-lg">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-akkfg-blue leading-tight">AKKFG</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Gujarat Kho-Kho</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-link relative py-2 ${activeTab === item.id ? 'text-akkfg-orange' : ''}`}
              >
                {item.label}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-akkfg-orange"
                  />
                )}
              </button>
            ))}
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-bold text-akkfg-blue hover:bg-slate-200 transition-colors"
                >
                  <UserIcon size={16} />
                  {user.name}
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-akkfg-blue truncate">{user.email}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShieldCheck size={16} /> Dashboard
                      </button>
                      {user.role === 'Admin' && (
                        <button 
                          onClick={() => {
                            setActiveTab('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-akkfg-orange hover:bg-akkfg-orange/5 flex items-center gap-2 font-bold"
                        >
                          <ShieldCheck size={16} /> Admin Panel
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="bg-akkfg-blue text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-akkfg-blue/90 transition-all shadow-md flex items-center gap-2"
              >
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  {item.label}
                </button>
              ))}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Dashboard
                  </button>
                  {user.role === 'Admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-3 text-base font-medium text-akkfg-orange hover:bg-akkfg-orange/5 rounded-lg"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full mt-4 bg-red-50 text-red-600 px-5 py-3 rounded-lg text-center font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    onOpenLogin();
                    setIsOpen(false);
                  }}
                  className="w-full mt-4 bg-akkfg-blue text-white px-5 py-3 rounded-lg text-center font-semibold flex items-center justify-center gap-2"
                >
                  <LogIn size={18} /> Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-akkfg-dark text-slate-300 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-akkfg-orange rounded-full flex items-center justify-center text-white">
              <Trophy size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">AKKFG</h2>
          </div>
          <p className="text-sm leading-relaxed">
            Amateur Kho-Kho Federation Gujarat is the governing body for Kho-Kho in the state of Gujarat, dedicated to promoting and developing the sport at all levels.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-akkfg-orange transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-akkfg-orange transition-colors">Upcoming Events</a></li>
            <li><a href="#" className="hover:text-akkfg-orange transition-colors">Player Registration</a></li>
            <li><a href="#" className="hover:text-akkfg-orange transition-colors">Rules & Regulations</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6">Contact Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-akkfg-orange shrink-0" />
              <span>Sports Complex, Stadium Road, Ahmedabad, Gujarat 380009</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-akkfg-orange shrink-0" />
              <span>+91 79 1234 5678</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-akkfg-orange shrink-0" />
              <span>info@akkfgujarat.in</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6">Newsletter</h3>
          <p className="text-sm mb-4">Stay updated with the latest news and events.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-1 focus:ring-akkfg-orange"
            />
            <button className="bg-akkfg-orange text-white p-2 rounded-lg hover:bg-akkfg-orange/90">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>© 2026 Amateur Kho-Kho Federation Gujarat. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Sitemap</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const Home = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch('/api/news').then(res => res.json()).then(setNews);
    fetch('/api/events').then(res => res.json()).then(setEvents);
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-akkfg-blue">
        <div className="absolute inset-0 z-0">

<img 
            src="https://i.ibb.co/TDRxm07w/Kho-Kho-Ground-Measurement-1024x614-1.webp" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-akkfg-blue via-akkfg-blue/90 to-transparent" />

        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 bg-akkfg-orange/20 text-akkfg-orange text-xs font-bold rounded-full mb-6 tracking-widest uppercase">
              Official State Federation
            </span>
            <h1 className="text-5xl md:text-7xl text-white mb-6 leading-tight">
Reviving the Spirit of <span className="text-akkfg-orange">Kho-Kho</span> in Gujarat

            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed">
              Empowering athletes, fostering sportsmanship, and building a world-class ecosystem for the traditional sport of Kho-Kho across every district of Gujarat.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTab('register')}
                className="bg-akkfg-orange text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center gap-2"
              >
                Register as Player <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => setActiveTab('events')}
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
              >
                View Tournaments
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Registered Players', value: '12,450+', icon: Users },
            { label: 'Active Coaches', value: '450+', icon: ShieldCheck },
            { label: 'Districts Covered', value: '33', icon: MapPin },
            { label: 'Annual Events', value: '80+', icon: Calendar },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl text-center"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-akkfg-blue">
                <stat.icon size={24} />
              </div>
              <h3 className="text-2xl font-bold text-akkfg-blue mb-1">{stat.value}</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* News & Updates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl text-akkfg-blue mb-2">Latest News & Updates</h2>
            <p className="text-slate-500">Stay informed with the latest happenings in Gujarat Kho-Kho.</p>
          </div>
          <button className="text-akkfg-orange font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View All News <ChevronRight size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-akkfg-orange text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Announcement
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                  <Calendar size={14} />
                  {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h3 className="text-xl mb-3 group-hover:text-akkfg-orange transition-colors leading-snug">{item.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-6">{item.summary}</p>
                <button className="text-akkfg-blue font-bold text-sm flex items-center gap-1">
                  Read More <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-akkfg-blue mb-4">Upcoming Tournaments</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Check out the upcoming state and district level competitions. Register your team today!</p>
          </div>
          
          <div className="space-y-4">
            {events.map((event, i) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-akkfg-orange/30 transition-colors"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="bg-slate-50 p-4 rounded-xl text-center min-w-[80px]">
                    <span className="block text-2xl font-bold text-akkfg-orange">{new Date(event.date).getDate()}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div>
                    <h3 className="text-xl text-akkfg-blue mb-1">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.location}</span>
                      <span className="flex items-center gap-1.5"><Trophy size={14} /> {event.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {event.status}
                  </span>
                  <button className="bg-akkfg-blue text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-akkfg-blue/90 transition-all whitespace-nowrap">
                    Register Team
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-akkfg-orange rounded-3xl p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-3xl mb-4">Player Registration</h3>
              <p className="text-white/80 mb-8 max-w-md">Join the official database of Gujarat Kho-Kho players. Get your digital ID and eligibility for state tournaments.</p>
              <button 
                onClick={() => setActiveTab('register')}
                className="bg-white text-akkfg-orange px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Start Registration
              </button>
            </div>
            <Users size={200} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          </div>
          
          <div className="bg-akkfg-blue rounded-3xl p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-3xl mb-4">Download Center</h3>
              <p className="text-white/80 mb-8 max-w-md">Access official forms, circulars, rulebooks, and tournament guidelines directly from the federation.</p>
              <button 
                onClick={() => setActiveTab('downloads')}
                className="bg-white text-akkfg-blue px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Browse Documents
              </button>
            </div>
            <Download size={200} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </section>
    </div>
  );
};

const About = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
    <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h2 className="text-4xl text-akkfg-blue mb-6">Our Mission & Vision</h2>
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="w-14 h-14 bg-akkfg-orange/10 rounded-2xl flex items-center justify-center text-akkfg-orange shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-xl mb-2">Mission</h3>
              <p className="text-slate-600 leading-relaxed">To identify, nurture and promote Kho-Kho talent across Gujarat by providing professional training, infrastructure, and competitive platforms at district and state levels.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-14 h-14 bg-akkfg-blue/10 rounded-2xl flex items-center justify-center text-akkfg-blue shrink-0">
              <Trophy size={28} />
            </div>
            <div>
              <h3 className="text-xl mb-2">Vision</h3>
              <p className="text-slate-600 leading-relaxed">To make Gujarat a powerhouse of Kho-Kho in India and ensure the sport is played with modern standards while preserving its traditional roots.</p>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-3xl overflow-hidden shadow-2xl"
      >
        <img src="https://picsum.photos/seed/about-khokho/800/600" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </motion.div>
    </section>

    <section>
      <h2 className="text-3xl text-akkfg-blue text-center mb-12">Office Bearers</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { name: 'Shri Rajesh Patel', role: 'President', image: 'https://i.pravatar.cc/150?u=1' },
          { name: 'Shri Amit Shah', role: 'General Secretary', image: 'https://i.pravatar.cc/150?u=2' },
          { name: 'Smt. Meena Desai', role: 'Treasurer', image: 'https://i.pravatar.cc/150?u=3' },
          { name: 'Shri Vijay Rathod', role: 'Vice President', image: 'https://i.pravatar.cc/150?u=4' },
        ].map((person, i) => (
          <div key={i} className="text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white shadow-lg">
              <img src={person.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h4 className="text-lg font-bold text-akkfg-blue">{person.name}</h4>
            <p className="text-sm text-akkfg-orange font-semibold">{person.role}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const IDCard = ({ data }: { data: RegistrationData }) => (
  <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-akkfg-blue relative">
    <div className="bg-akkfg-blue p-4 text-white text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-akkfg-orange rotate-45 translate-x-10 -translate-y-10" />
      <h3 className="text-lg font-bold">AKKFG</h3>
      <p className="text-[10px] uppercase tracking-widest opacity-80">Gujarat Kho-Kho Federation</p>
    </div>
    
    <div className="p-6 flex flex-col items-center">
      <div className="w-32 h-32 bg-slate-100 rounded-xl border-4 border-white shadow-md overflow-hidden mb-4">
        <img 
          src={data.doc_photo || `https://i.pravatar.cc/150?u=${data.name}`} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="text-center space-y-1 mb-6">
        <h4 className="text-xl font-bold text-akkfg-blue uppercase">{data.name}</h4>
        <p className="text-akkfg-orange font-bold text-sm tracking-widest uppercase">{data.role === 'Student' ? 'Player' : data.role}</p>
        <p className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-600">{data.unique_id}</p>
      </div>
      
      <div className="w-full grid grid-cols-2 gap-4 text-[10px] border-t border-slate-100 pt-4">
        <div>
          <p className="text-slate-400 uppercase font-bold">DOB</p>
          <p className="font-bold text-slate-700">{data.dob}</p>
        </div>
        <div>
          <p className="text-slate-400 uppercase font-bold">Gender</p>
          <p className="font-bold text-slate-700">{data.gender}</p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-400 uppercase font-bold">Address</p>
          <p className="font-bold text-slate-700">{data.address_city}, {data.address_country}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Authorized by Amateur Kho-Kho Federation Gujarat</p>
    </div>
  </div>
);

const Registration = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    dob: '',
    address_city: '',
    address_country: 'India',
    gender: 'Male',
    email: '',
    mobile: '',
    experience: '',
    role: 'Student',
    doc_photo: '',
    doc_aadhar: '',
    doc_pan: '',
    doc_birth: '',
    level_passing: '',
    year_passing: '',
    coaching_cert: '',
    edu_qualification: '',
    referee_cert: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<RegistrationData | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof RegistrationFormData) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        [field]: file
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Please accept the terms and conditions");
      return;
    }
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      const value = (formData as any)[key];
      if (value instanceof File) {
        formDataToSend.append(key, value);
      } else {
        formDataToSend.append(key, value as string);
      }
    });

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        body: formDataToSend
      });
      if (res.ok) {
        const data = await res.json();
        // Convert File to URL strings for display
        const resultData: RegistrationData = {
          ...formData,
          doc_photo: (formData.doc_photo as File)?.name || '',
          doc_aadhar: (formData.doc_aadhar as File)?.name || '',
          doc_pan: (formData.doc_pan as File)?.name || '',
          doc_birth: (formData.doc_birth as File)?.name || '',
          unique_id: data.id
        };
        setResult(resultData);
        setSubmitted(true);
      } else {
        const errData = await res.text();
        alert(errData || "Registration failed. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please check your connection.");
    }
  };


  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl text-akkfg-blue mb-4">Registration Submitted!</h2>
          <p className="text-slate-600 mb-8">Your application has been successfully submitted to the Amateur Kho-Kho Federation Gujarat. Our administrators will review your documents and details.</p>
          
          <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 max-w-2xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-amber-800 mb-2">What happens next?</h3>
            <ul className="text-left text-amber-700 space-y-3 text-sm">
              <li className="flex gap-2"><span>1.</span> <span>Admin will verify your uploaded documents (Aadhar, PAN, etc.).</span></li>
              <li className="flex gap-2"><span>2.</span> <span>Once approved, your unique Federation ID will be generated.</span></li>
              <li className="flex gap-2"><span>3.</span> <span>You can then log in to your dashboard to download your official ID card.</span></li>
            </ul>
          </div>

          <button 
            onClick={() => {
              setSubmitted(false);
              setActiveTab('home');
            }}
            className="bg-akkfg-blue text-white px-12 py-4 rounded-full font-bold shadow-lg hover:bg-akkfg-blue/90 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-20 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-akkfg-blue p-8 text-white">
          <h2 className="text-3xl mb-2">Federation Registration</h2>
          <p className="text-white/70">Official registration for Coaches and Students of AKKFG.</p>
        </div>
        
        <div className="flex border-b border-slate-100">
          {['Student', 'Coach'].map(role => (
            <button
              key={role}
              onClick={() => setFormData({...formData, role: role as any})}
              className={`flex-1 py-6 font-bold text-lg transition-all ${formData.role === role ? 'text-akkfg-orange bg-akkfg-orange/5 border-b-2 border-akkfg-orange' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {role === 'Student' ? 'Player' : role} Registration
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* Basic Info */}
          <div className="space-y-6">
            <h3 className="text-xl text-akkfg-blue font-bold border-l-4 border-akkfg-orange pl-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Date of Birth</label>
                <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Gender</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                <input required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">City</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.address_city} onChange={e => setFormData({...formData, address_city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Country</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.address_country} onChange={e => setFormData({...formData, address_country: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Years of Experience</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
              </div>
            </div>
          </div>

          
          {/* Professional Info for Students */}
          {formData.role === 'Student' && (
            <div className="space-y-6">
              <h3 className="text-xl text-akkfg-blue font-bold border-l-4 border-akkfg-orange pl-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Level of Passing (Kho-Kho Site)</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.level_passing} onChange={e => setFormData({...formData, level_passing: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Year of Passing</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={formData.year_passing} onChange={e => setFormData({...formData, year_passing: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Coaching Certificate</label>
                  <input type="file" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20" onChange={e => handleFileUpload(e, 'coaching_cert')} />
                  {formData.coaching_cert && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ File uploaded</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Education Qualification Document</label>
                  <input type="file" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20" onChange={e => handleFileUpload(e, 'edu_qualification')} />
                  {formData.edu_qualification && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ File uploaded</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">All India Referee Exam Passing Certificate</label>
                  <input type="file" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20" onChange={e => handleFileUpload(e, 'referee_cert')} />
                  {formData.referee_cert && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ File uploaded</p>}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="space-y-6">
            <h3 className="text-xl text-akkfg-blue font-bold border-l-4 border-akkfg-orange pl-4">Documents Upload</h3>
            <p className="text-xs text-slate-400 italic">Please upload the following documents (Max 1MB each).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Photograph</label>
                <input required type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20" onChange={e => handleFileUpload(e, 'doc_photo')} />
                {formData.doc_photo && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ File uploaded</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Aadhar Card</label>
                <input required type="file" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20" onChange={e => handleFileUpload(e, 'doc_aadhar')} />
                {formData.doc_aadhar && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ File uploaded</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">PAN Card</label>
                <input required type="file" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20" onChange={e => handleFileUpload(e, 'doc_pan')} />
                {formData.doc_pan && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ File uploaded</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Birth Certificate</label>
                <input required type="file" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20" onChange={e => handleFileUpload(e, 'doc_birth')} />
                {formData.doc_birth && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ File uploaded</p>}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-4">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 w-5 h-5 rounded border-slate-300 text-akkfg-orange focus:ring-akkfg-orange"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                I hereby declare that all the information provided above is true to the best of my knowledge. I agree to abide by the rules and regulations of the Amateur Kho-Kho Federation Gujarat (AKKFG). I understand that any false information may lead to the cancellation of my registration.
              </label>
            </div>
          </div>

          <button type="submit" className="w-full bg-akkfg-orange text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-akkfg-orange/90 transition-all">
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  useEffect(() => {
    fetch('/api/events').then(res => res.json()).then(setEvents);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-12">
        <h2 className="text-4xl text-akkfg-blue mb-4">Tournament Calendar</h2>
        <p className="text-slate-500">Explore and participate in upcoming Kho-Kho events across Gujarat.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-akkfg-blue text-white p-6 rounded-2xl text-center min-w-[120px]">
              <span className="block text-4xl font-bold">{new Date(event.date).getDate()}</span>
              <span className="block text-sm uppercase font-bold tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'long' })}</span>
              <span className="block text-xs mt-1 opacity-60">{new Date(event.date).getFullYear()}</span>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-akkfg-orange/10 text-akkfg-orange text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {event.category}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {event.status}
                </span>
              </div>
              <h3 className="text-2xl text-akkfg-blue">{event.title}</h3>
              <div className="flex flex-wrap gap-6 text-slate-500">
                <span className="flex items-center gap-2"><MapPin size={18} /> {event.location}</span>
                <span className="flex items-center gap-2"><Users size={18} /> Open for Registration</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button className="bg-akkfg-blue text-white px-8 py-3 rounded-full font-bold hover:bg-akkfg-blue/90 transition-all">
                Register Now
              </button>
              <button className="text-akkfg-blue font-bold text-sm hover:underline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MediaNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching news:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-12">
        <h2 className="text-4xl text-akkfg-blue mb-4">Media & News</h2>
        <p className="text-slate-500">Stay updated with the latest news, highlights, and media coverage from AKKFG.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-akkfg-orange/20 border-t-akkfg-orange rounded-full"></div>
          </div>
          <p className="text-slate-500 mt-4">Loading news...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No news articles at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              {article.image && (
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Newspaper size={16} className="text-akkfg-orange" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-akkfg-blue mb-3 group-hover:text-akkfg-orange transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                  {article.summary}
                </p>
                <button className="flex items-center gap-2 text-akkfg-orange font-bold text-sm hover:gap-3 transition-all">
                  Read More <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Gallery Section */}
      <div className="mt-20 pt-16 border-t border-slate-200">
        <h3 className="text-3xl text-akkfg-blue mb-10">Photo Gallery</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 1, title: 'Tournament 2026', img: 'https://via.placeholder.com/300x200?text=Tournament' },
            { id: 2, title: 'Training Camp', img: 'https://via.placeholder.com/300x200?text=Training' },
            { id: 3, title: 'Championship', img: 'https://via.placeholder.com/300x200?text=Championship' },
            { id: 4, title: 'District Meet', img: 'https://via.placeholder.com/300x200?text=District' },
          ].map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img 
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-bold">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Section */}
      <div className="mt-16">
        <h3 className="text-3xl text-akkfg-blue mb-10">Featured Videos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { id: 1, title: 'How to Play Kho-Kho', thumbnail: 'https://via.placeholder.com/500x280?text=Video+1' },
            { id: 2, title: 'State Championship Highlights', thumbnail: 'https://via.placeholder.com/500x280?text=Video+2' },
          ].map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ scale: 1.02 }}
              className="relative h-64 rounded-2xl overflow-hidden cursor-pointer group bg-slate-200"
            >
              <img 
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-akkfg-orange rounded-full flex items-center justify-center text-white shadow-lg"
                >
                  <Play size={28} className="ml-1" />
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4">
                <p className="text-white font-bold text-lg">{video.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Downloads = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <h2 className="text-4xl text-akkfg-blue mb-12">Download Center</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        { title: 'Registration Forms', items: ['Player Registration Form', 'Coach Certification Form', 'District Association Form'] },
        { title: 'Rules & Regulations', items: ['Official Kho-Kho Rulebook 2026', 'Tournament Guidelines', 'Anti-Doping Policy'] },
        { title: 'Circulars & Notices', items: ['Annual General Meeting Notice', 'State Championship Circular', 'Election Notification'] },
        { title: 'Results & Archives', items: ['State Championship 2025 Results', 'Annual Report 2024-25', 'Hall of Fame'] },
      ].map((section, i) => (
        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200">
          <h3 className="text-xl text-akkfg-blue mb-6 border-b border-slate-100 pb-4">{section.title}</h3>
          <ul className="space-y-4">
            {section.items.map((item, j) => (
              <li key={j} className="flex items-center justify-between group cursor-pointer">
                <span className="text-slate-600 group-hover:text-akkfg-orange transition-colors">{item}</span>
                <Download size={18} className="text-slate-400 group-hover:text-akkfg-orange transition-colors" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const Contact = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      <div>
        <h2 className="text-4xl text-akkfg-blue mb-6">Get in Touch</h2>
        <p className="text-slate-500 mb-10">Have questions about registrations or upcoming events? Our team is here to help you.</p>
        
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="w-12 h-12 bg-akkfg-orange/10 rounded-xl flex items-center justify-center text-akkfg-orange shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold text-akkfg-blue mb-1">Office Address</h4>
              <p className="text-slate-600">Sports Complex, Stadium Road, Ahmedabad, Gujarat 380009</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 bg-akkfg-blue/10 rounded-xl flex items-center justify-center text-akkfg-blue shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="font-bold text-akkfg-blue mb-1">Phone Number</h4>
              <p className="text-slate-600">+91 79 1234 5678</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="font-bold text-akkfg-blue mb-1">Email Address</h4>
              <p className="text-slate-600">info@akkfgujarat.in</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">First Name</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Last Name</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Message</label>
            <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange resize-none"></textarea>
          </div>
          <button className="w-full bg-akkfg-blue text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-akkfg-blue/90 transition-all">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
);

const Dashboard = ({ user, onCompleteRegistration }: { user: User, onCompleteRegistration: () => void }) => {
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === 'Admin') {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('akkfg_token');
    fetch('/api/registrations/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setRegistration(data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl text-akkfg-blue mb-2">User Dashboard</h2>
        <p className="text-slate-500">Manage your profile and view your federation status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-akkfg-blue mb-6">Profile Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</p>
                <p className="font-bold text-slate-700 break-words">{user.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="font-bold text-slate-700 break-words">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Role</p>
                <p className="font-bold text-akkfg-orange">{user.role}</p>
              </div>
            </div>
          </div>

          {user.role !== 'Admin' && (
            loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-akkfg-orange border-t-transparent rounded-full mx-auto" />
              </div>
            ) : registration ? (
              <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
                  <h3 className="text-xl font-bold text-akkfg-blue">Federation Status</h3>
                  <span className={`self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${registration.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {registration.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Unique ID</p>
                    <p className="font-mono font-bold text-akkfg-blue break-all">{registration.unique_id}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Registered Role</p>
                    <p className="font-bold text-akkfg-blue">{registration.role === 'Student' ? 'Player' : registration.role}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 p-5 sm:p-8 rounded-3xl border border-amber-100 text-center">
                <Info className="mx-auto text-amber-500 mb-4" size={40} />
                <h3 className="text-xl font-bold text-amber-800 mb-2">Not Registered with Federation</h3>
                <p className="text-amber-700 mb-6">You haven't completed your federation registration yet. Register now to get your unique ID and ID card.</p>
                <button 
                  onClick={onCompleteRegistration}
                  className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-700 transition-colors"
                >
                  Complete Registration
                </button>
              </div>
            )
          )}
        </div>

        {user.role !== 'Admin' && (
          <div>
            <h3 className="text-xl font-bold text-akkfg-blue mb-6">Your ID Card</h3>
            {registration && registration.status === 'Approved' ? (
              <IDCard data={registration} />
            ) : (
              <div className="aspect-[3/4] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-center p-8">
                <p>Your official ID card will be generated once your registration is approved by the federation.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDocumentActions = ({ url, label }: { url?: string | null, label: string }) => {
  if (!url) {
    return <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>;
  }

  const handleDownload = async () => {
    const token = localStorage.getItem('akkfg_token');
    if (!token) {
      alert('Admin session expired. Please log in again.');
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/documents/download?source=${encodeURIComponent(url)}&label=${encodeURIComponent(label)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const contentDisposition = response.headers.get('content-disposition');
      const suggestedName = contentDisposition?.match(/filename="(.+)"/)?.[1] || label;

      link.href = objectUrl;
      link.download = suggestedName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Document download error:', error);
      alert('Unable to download document. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-[10px] bg-akkfg-blue text-white px-3 py-1 rounded-full hover:bg-akkfg-blue/90 transition-all"
      >
        View Document
      </a>
      <button
        type="button"
        onClick={handleDownload}
        aria-label={`Download ${label}`}
        title={`Download ${label}`}
        className="w-8 h-8 rounded-full bg-white border border-slate-200 text-akkfg-orange flex items-center justify-center hover:bg-akkfg-orange hover:text-white transition-all"
      >
        <Download size={14} />
      </button>
    </div>
  );
};

type AdminPhotoForm = {
  title: string;
  file: File | null;
  category: string;
};

type AdminVideoForm = {
  title: string;
  file: File | null;
};

const AdminPanel = () => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState('registrations');
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [newTournament, setNewTournament] = useState({
    title: '',
    date: '',
    location: '',
    category: 'Senior',
    status: 'Upcoming'
  });
  const [newNews, setNewNews] = useState({
    title: '',
    summary: '',
    date: new Date().toISOString().split('T')[0],
    image: ''
  });
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    file: null as File | null,
    category: 'Tournament'
  } satisfies AdminPhotoForm);
  const [newVideo, setNewVideo] = useState({
    title: '',
    file: null as File | null
  } satisfies AdminVideoForm);

  const fetchData = async () => {
    console.log("AdminPanel: Fetching fresh data...");
    try {
      const token = localStorage.getItem('akkfg_token');
      const timestamp = Date.now();
      const [regsRes, statsRes, eventsRes, newsRes, photosRes, videosRes] = await Promise.all([
        fetch(`/api/admin/registrations?t=${timestamp}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/admin/stats?t=${timestamp}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/events?t=${timestamp}`),
        fetch(`/api/news?t=${timestamp}`),
        fetch(`/api/admin/photos?t=${timestamp}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/admin/videos?t=${timestamp}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!regsRes.ok || !statsRes.ok || !eventsRes.ok) {
        throw new Error(`Fetch failed: Regs:${regsRes.status} Stats:${statsRes.status} Events:${eventsRes.status}`);
      }

      const regsData = await regsRes.json();
      const statsData = await statsRes.json();
      const eventsData = await eventsRes.json();
      const newsData = await newsRes.json();
      const photosData = photosRes.ok ? await photosRes.json() : [];
      const videosData = videosRes.ok ? await videosRes.json() : [];
      
      console.log("AdminPanel: Data fetched successfully", { regs: regsData.length, events: eventsData.length });
      
      setRegistrations(regsData);
      setStats(statsData);
      setEvents(eventsData);
      setNews(Array.isArray(newsData) ? newsData : []);
      setPhotos(Array.isArray(photosData) ? photosData : []);
      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch (err) {
      console.error("AdminPanel: Fetch data error:", err);
      alert("Failed to refresh data. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('akkfg_token');
    await fetch(`/api/admin/registrations/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const handleDeletePlayer = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this player registration? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('akkfg_token');
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert("Player registration removed successfully!");
        fetchData();
      } else {
        const result = await response.json();
        alert(`Error: ${result.error || 'Failed to remove player'}`);
      }
    } catch (err) {
      console.error("Delete player error:", err);
      alert("Failed to remove player. Please check your connection.");
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('akkfg_token');
    await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTournament)
    });
    setNewTournament({ title: '', date: '', location: '', category: 'Senior', status: 'Upcoming' });
    setShowTournamentForm(false);
    fetchData();
  };

  const handleDeleteTournament = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      console.log(`Attempting to delete tournament with ID: ${id}`);
      const token = localStorage.getItem('akkfg_token');
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      console.log('Delete response:', result);

      if (response.ok) {
        alert("Tournament deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${result.error || 'Failed to delete tournament'}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete tournament. Please check your connection.");
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('akkfg_token');
    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNews)
      });
      if (response.ok) {
        alert('News article created successfully!');
        setNewNews({ title: '', summary: '', date: new Date().toISOString().split('T')[0], image: '' });
        setShowNewsForm(false);
        fetchData();
      } else {
        alert('Failed to create news article');
      }
    } catch (err) {
      console.error('Create news error:', err);
      alert('Error creating news article');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Delete this news article?')) return;
    const token = localStorage.getItem('akkfg_token');
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('News deleted successfully!');
        fetchData();
      } else {
        alert('Failed to delete news');
      }
    } catch (err) {
      console.error('Delete news error:', err);
      alert('Error deleting news');
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.file) {
      alert('Please choose a photo file.');
      return;
    }

    try {
      const token = localStorage.getItem('akkfg_token');
      const formData = new FormData();
      formData.append('title', newPhoto.title);
      formData.append('category', newPhoto.category);
      formData.append('file', newPhoto.file);

      const response = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload photo');
      }

      setNewPhoto({ title: '', file: null, category: 'Tournament' });
      setShowPhotoForm(false);
      fetchData();
    } catch (err: any) {
      console.error('Add photo error:', err);
      alert(err.message || 'Failed to upload photo');
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('Delete this photo?')) return;

    try {
      const token = localStorage.getItem('akkfg_token');
      const response = await fetch(`/api/admin/photos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete photo');
      }

      fetchData();
    } catch (err: any) {
      console.error('Delete photo error:', err);
      alert(err.message || 'Failed to delete photo');
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.file) {
      alert('Please choose a video file.');
      return;
    }

    try {
      const token = localStorage.getItem('akkfg_token');
      const formData = new FormData();
      formData.append('title', newVideo.title);
      formData.append('file', newVideo.file);

      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload video');
      }

      setNewVideo({ title: '', file: null });
      setShowVideoForm(false);
      fetchData();
    } catch (err: any) {
      console.error('Add video error:', err);
      alert(err.message || 'Failed to upload video');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('Delete this video?')) return;

    try {
      const token = localStorage.getItem('akkfg_token');
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete video');
      }

      fetchData();
    } catch (err: any) {
      console.error('Delete video error:', err);
      alert(err.message || 'Failed to delete video');
    }
  };

  if (loading) return <div className="p-20 text-center">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl text-akkfg-blue mb-2">Admin Panel</h2>
          <p className="text-slate-500">Manage federation registrations, events, news, photos and videos.</p>
        </div>
        <div className="flex gap-4">
          {(adminTab === 'tournaments' || adminTab === 'news' || adminTab === 'photos' || adminTab === 'videos') && (
            <button 
              onClick={() => {
                if (adminTab === 'tournaments') setShowTournamentForm(true);
                else if (adminTab === 'news') setShowNewsForm(true);
                else if (adminTab === 'photos') setShowPhotoForm(true);
                else if (adminTab === 'videos') setShowVideoForm(true);
              }}
              className="bg-akkfg-orange text-white px-6 py-3 rounded-2xl font-bold hover:bg-akkfg-orange/90 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> {adminTab === 'tournaments' ? 'Create Tournament' : adminTab === 'news' ? 'Create News' : adminTab === 'photos' ? 'Add Photo' : 'Add Video'}
            </button>
          )}
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Users</p>
            <p className="text-xl font-bold text-akkfg-blue">{stats?.users}</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Regs</p>
            <p className="text-xl font-bold text-akkfg-blue">{stats?.registrations}</p>
          </div>
          <div className="bg-akkfg-orange/10 px-6 py-3 rounded-2xl border border-akkfg-orange/20 text-center">
            <p className="text-[10px] uppercase font-bold text-akkfg-orange">Pending</p>
            <p className="text-xl font-bold text-akkfg-orange">{stats?.pending}</p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'registrations', label: 'Registrations', icon: Users },
          { id: 'tournaments', label: 'Tournaments', icon: Trophy },
          { id: 'news', label: 'News', icon: Newspaper },
          { id: 'photos', label: 'Photos', icon: ImageIcon },
          { id: 'videos', label: 'Videos', icon: Play }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`px-4 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              adminTab === tab.id 
                ? 'border-akkfg-orange text-akkfg-orange' 
                : 'border-transparent text-slate-500 hover:text-akkfg-blue'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* News Form Modal */}
      {showNewsForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-akkfg-blue">Create News</h3>
              <button onClick={() => setShowNewsForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateNews} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">News Title</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} placeholder="News headline" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Summary</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newNews.summary} onChange={e => setNewNews({...newNews, summary: e.target.value})} placeholder="Brief summary" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                  <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newNews.date} onChange={e => setNewNews({...newNews, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Image URL</label>
                  <input type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newNews.image} onChange={e => setNewNews({...newNews, image: e.target.value})} placeholder="https://..." />
                </div>
              </div>
              <button type="submit" className="w-full bg-akkfg-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-akkfg-blue/90 transition-all mt-4">
                Create News
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Photo Form Modal */}
      {showPhotoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-akkfg-blue">Add Photo</h3>
              <button onClick={() => setShowPhotoForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Photo Title</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newPhoto.title} onChange={e => setNewPhoto({...newPhoto, title: e.target.value})} placeholder="Photo title" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Upload Photo</label>
                <input
                  required
                  type="file"
                  accept="image/*"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20"
                  onChange={e => setNewPhoto({ ...newPhoto, file: e.target.files?.[0] || null })}
                />
                {newPhoto.file && <p className="text-xs text-emerald-600 font-semibold mt-1">{newPhoto.file.name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newPhoto.category} onChange={e => setNewPhoto({...newPhoto, category: e.target.value})}>
                  <option>Tournament</option>
                  <option>Training</option>
                  <option>Championship</option>
                  <option>District Meet</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-akkfg-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-akkfg-blue/90 transition-all mt-4">
                Add Photo
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Video Form Modal */}
      {showVideoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-akkfg-blue">Add Video</h3>
              <button onClick={() => setShowVideoForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Video Title</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} placeholder="Video title" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Upload Video</label>
                <input
                  required
                  type="file"
                  accept="video/*"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-akkfg-orange/10 file:text-akkfg-orange hover:file:bg-akkfg-orange/20"
                  onChange={e => setNewVideo({ ...newVideo, file: e.target.files?.[0] || null })}
                />
                {newVideo.file && <p className="text-xs text-emerald-600 font-semibold mt-1">{newVideo.file.name}</p>}
              </div>
              <button type="submit" className="w-full bg-akkfg-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-akkfg-blue/90 transition-all mt-4">
                Add Video
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {showTournamentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-akkfg-blue">Create Tournament</h3>
              <button onClick={() => setShowTournamentForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tournament Title</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newTournament.title} onChange={e => setNewTournament({...newTournament, title: e.target.value})} placeholder="e.g. Gujarat State Senior Championship" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                  <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newTournament.date} onChange={e => setNewTournament({...newTournament, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newTournament.location} onChange={e => setNewTournament({...newTournament, location: e.target.value})} placeholder="City" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newTournament.category} onChange={e => setNewTournament({...newTournament, category: e.target.value})}>
                    <option>Senior</option>
                    <option>U-17</option>
                    <option>U-14</option>
                    <option>Open</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-akkfg-orange" value={newTournament.status} onChange={e => setNewTournament({...newTournament, status: e.target.value})}>
                    <option>Upcoming</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-akkfg-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-akkfg-blue/90 transition-all mt-4">
                Create Event
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-4 sm:p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 mb-6 sticky top-0 bg-white pb-4 border-b border-slate-100">
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-akkfg-blue break-words">{selectedPlayer.name}</h3>
                <p className="text-slate-500 font-mono text-sm break-all">{selectedPlayer.unique_id || 'Pending Approval'}</p>
              </div>
              <button onClick={() => setSelectedPlayer(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Role</p>
                      <p className="font-bold text-akkfg-blue">{selectedPlayer.role === 'Student' ? 'Player' : selectedPlayer.role}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Gender</p>
                      <p className="font-bold text-akkfg-blue">{selectedPlayer.gender}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Date of Birth</p>
                      <p className="font-bold text-akkfg-blue">{selectedPlayer.dob}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Experience</p>
                      <p className="font-bold text-akkfg-blue">{selectedPlayer.experience} Years</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Details</h4>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                      <Mail size={16} className="text-akkfg-orange" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
                        <p className="font-bold text-akkfg-blue break-all">{selectedPlayer.email}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                      <Phone size={16} className="text-akkfg-orange" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Mobile</p>
                        <p className="font-bold text-akkfg-blue">{selectedPlayer.mobile}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                      <MapPin size={16} className="text-akkfg-orange" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Location</p>
                        <p className="font-bold text-akkfg-blue break-words">{selectedPlayer.address_city}, {selectedPlayer.address_country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPlayer.role === 'Student' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Education Info</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Level Passing</p>
                        <p className="font-bold text-akkfg-blue">{selectedPlayer.level_passing || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Year of Passing</p>
                        <p className="font-bold text-akkfg-blue">{selectedPlayer.year_passing || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlayer.role === 'Coach' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Professional Info</h4>
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Coaching Certificate</p>
                        <div className="mt-2">
                          <AdminDocumentActions url={selectedPlayer.coaching_cert} label="Coaching Certificate" />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Educational Qualification</p>
                        <div className="mt-2">
                          <AdminDocumentActions url={selectedPlayer.edu_qualification} label="Educational Qualification" />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Referee Certificate</p>
                        <div className="mt-2">
                          <AdminDocumentActions url={selectedPlayer.referee_cert} label="Referee Certificate" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Photo', key: 'doc_photo' },
                    { label: 'Aadhar Card', key: 'doc_aadhar' },
                    { label: 'PAN Card', key: 'doc_pan' },
                    { label: 'Birth Certificate', key: 'doc_birth' }
                  ].map(doc => (
                    <div key={doc.key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <FileText size={20} className="text-akkfg-orange" />
                      </div>
                      <p className="text-xs font-bold text-akkfg-blue">{doc.label}</p>
                      <AdminDocumentActions url={selectedPlayer[doc.key]} label={doc.label} />
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Registration Status</h4>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className={`self-start px-4 py-2 rounded-xl text-xs font-bold uppercase ${selectedPlayer.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : selectedPlayer.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {selectedPlayer.status}
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {selectedPlayer.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => { updateStatus(selectedPlayer.id, 'Approved'); setSelectedPlayer(null); }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => { updateStatus(selectedPlayer.id, 'Rejected'); setSelectedPlayer(null); }}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => { handleDeletePlayer(selectedPlayer.id); setSelectedPlayer(null); }}
                        className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-12">
        {adminTab === 'registrations' && (
          <>
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-akkfg-blue">Federation Registrations</h3>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{registrations.length}</span>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="md:hidden divide-y divide-slate-100">
              {registrations.map((reg: any) => (
                <div key={reg.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-akkfg-blue break-words">{reg.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 break-all">{reg.unique_id || 'Pending Approval'}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold uppercase ${reg.role === 'Coach' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {reg.role === 'Student' ? 'Player' : reg.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="text-slate-600">{reg.address_city}</p>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${reg.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : reg.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {reg.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setSelectedPlayer(reg)}
                      className="text-xs font-bold text-akkfg-blue hover:underline"
                    >
                      View Profile
                    </button>
                    {reg.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(reg.id, 'Approved')}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(reg.id, 'Rejected')}
                          className="text-xs font-bold text-red-600 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDeletePlayer(reg.id)}
                      className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove Registration"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ID / Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">District</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {registrations.map((reg: any) => (
                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-akkfg-blue">{reg.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{reg.unique_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${reg.role === 'Coach' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {reg.role === 'Student' ? 'Player' : reg.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{reg.address_city}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${reg.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : reg.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          onClick={() => setSelectedPlayer(reg)}
                          className="text-xs font-bold text-akkfg-blue hover:underline"
                        >
                          View
                        </button>
                        {reg.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(reg.id, 'Approved')}
                              className="text-xs font-bold text-emerald-600 hover:underline"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => updateStatus(reg.id, 'Rejected')}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeletePlayer(reg.id)}
                          className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                          title="Remove Registration"
                        >
                          <Trash2 size={14} className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
          </>
        )}

        {adminTab === 'tournaments' && (
          <>
        <section className="mt-16">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-akkfg-blue">Manage Tournaments</h3>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{events.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div key={event.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${event.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : event.status === 'Ongoing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {event.status}
                  </span>
                  <button 
                    onClick={() => handleDeleteTournament(event.id)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Tournament"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <h4 className="text-xl font-bold text-akkfg-blue mb-2 group-hover:text-akkfg-orange transition-colors">{event.title}</h4>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-akkfg-orange" />
                    <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-akkfg-orange" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-akkfg-orange" />
                    <span>{event.category} Category</span>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                No tournaments created yet.
              </div>
            )}
          </div>
        </section>
          </>
        )}

        {adminTab === 'news' && (
          <>
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-akkfg-blue">News Management</h3>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{news.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article: any) => (
              <div key={article.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                {article.image && <img src={article.image} alt={article.title} className="w-full h-40 object-cover rounded-2xl mb-4" />}
                <h4 className="text-lg font-bold text-akkfg-blue mb-2 group-hover:text-akkfg-orange transition-colors">{article.title}</h4>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{article.summary}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                  <button 
                    onClick={() => handleDeleteNews(article.id)}
                    className="text-red-600 hover:text-red-700 font-bold"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {news.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                No news articles yet.
              </div>
            )}
          </div>
        </section>
          </>
        )}

        {adminTab === 'photos' && (
          <>
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-akkfg-blue">Photo Gallery</h3>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{photos.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {photos.map((photo: any) => (
              <div key={photo.id} className="relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all h-48 bg-slate-100">
                <img src={photo.image} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{photo.title}</p>
                    <p className="text-white/70 text-xs">{photo.category}</p>
                  </div>
                  <button 
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {photos.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                No photos yet.
              </div>
            )}
          </div>
        </section>
          </>
        )}

        {adminTab === 'videos' && (
          <>
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-akkfg-blue">Video Management</h3>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{videos.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video: any) => (
              <div key={video.id} className="relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 bg-slate-100">
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{video.title}</p>
                    <a href={video.url} target="_blank" rel="noreferrer" className="text-akkfg-orange text-xs font-bold hover:underline">
                      Open Video
                    </a>
                  </div>
                  <button 
                    onClick={() => handleDeleteVideo(video.id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {videos.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                No videos yet.
              </div>
            )}
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('akkfg_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        if (userData) setUser(userData);
        else localStorage.removeItem('akkfg_token');
      })
      .catch(() => localStorage.removeItem('akkfg_token'));
    }
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('akkfg_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('akkfg_token');
    setActiveTab('home');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
            {activeTab === 'about' && <About />}
            {activeTab === 'events' && <Events />}
            {activeTab === 'register' && <Registration setActiveTab={setActiveTab} />}
            {activeTab === 'media' && <MediaNews />}
            {activeTab === 'downloads' && <Downloads />}
            {activeTab === 'contact' && <Contact />}
            {activeTab === 'dashboard' && user && (
              <Dashboard 
                user={user} 
                onCompleteRegistration={() => setActiveTab('register')} 
              />
            )}
            {activeTab === 'admin' && user?.role === 'Admin' && <AdminPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin}
      />

      <Footer />
    </div>
  );
}
