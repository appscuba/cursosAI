
import React, { useState, useEffect, useMemo } from 'react';
import { generateCourse } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import { User, CourseProject, GenerationStatus, Stats, SiteConfig } from './types';

const STORE_KEY = 'viral_ai_pro_saas_data_v4';

const DEFAULT_CONFIG: SiteConfig = {
  heroTitle: "Crea Cursos Virales en Segundos",
  heroSubtitle: "Diseña estructuras irresistibles, copys millonarios y planes de contenido que dominan Hotmart. No pierdas tiempo planificando, empieza a vender.",
  accentColor: "#ea580c", 
  features: [
    { icon: "fa-wand-sparkles", title: "Arquitectura IA", desc: "Genera módulos, lecciones y tareas optimizadas para la retención del alumno." },
    { icon: "fa-bullhorn", title: "Copywriting Viral", desc: "Scripts y páginas de venta con gatillos mentales de alta conversión para Hotmart." },
    { icon: "fa-calendar-check", title: "Plan de 30 Días", desc: "No más bloqueos creativos. Recibe un plan de contenido diario para tus redes." }
  ],
  pricing: {
    free: { name: "Starter", price: "Free", features: ["1 Proyecto al mes", "Nicho General", "PDF Estándar"] },
    pro: { name: "Elite Creator", price: "$29", features: ["Ilimitado", "Marketing Viral", "Scripts", "Bonos IA"] },
    agency: { name: "Agency Master", price: "$99", features: ["White Label", "5 Usuarios", "API Priority", "Funnels Pro"] }
  }
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<CourseProject[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'generator' | 'history' | 'admin' | 'subscription' | 'profile'>('landing');
  const [adminSubView, setAdminSubView] = useState<'users' | 'settings'>('users');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // App State
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<string>('');
  
  // Profile State
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  // --- PERSISTENCE & INITIALIZATION ---
  useEffect(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.users) setUsers(data.users);
      if (data.projects) setProjects(data.projects);
      if (data.siteConfig) setSiteConfig(data.siteConfig);
      if (data.activeUserId) {
        const found = data.users.find((u: User) => u.id === data.activeUserId);
        if (found) {
          setCurrentUser(found);
          setView('dashboard');
        }
      }
    } else {
      // Seed Admin
      const admin: User = {
        id: 'admin-001',
        email: 'appscuba@gmail.com',
        password: 'Asd9310*', 
        role: 'admin',
        subscription: 'agency',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      setUsers([admin]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ 
      users, 
      projects, 
      siteConfig,
      activeUserId: currentUser?.id || null 
    }));
  }, [users, projects, siteConfig, currentUser]);

  // --- ACTIONS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (user.status === 'blocked') {
        setAuthError('Tu cuenta ha sido suspendida.');
        return;
      }
      setCurrentUser(user);
      setView('dashboard');
      setAuthError('');
      resetAuthFields();
    } else {
      setAuthError('Credenciales inválidas.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError('Las contraseñas no coinciden.');
      return;
    }
    if (users.find(u => u.email === email)) {
      setAuthError('El email ya está registrado.');
      return;
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password,
      role: 'user',
      subscription: 'free',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setView('dashboard');
    resetAuthFields();
  };

  const resetAuthFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('landing');
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setProfileMessage('Ingresa una contraseña válida.');
      return;
    }
    if (currentUser) {
      handleUpdateUser(currentUser.id, { password: newPassword });
      setProfileMessage('Actualizada con éxito.');
      setNewPassword('');
      setTimeout(() => setProfileMessage(''), 3000);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const userGens = projects.filter(p => p.userId === currentUser?.id).length;
    if (currentUser?.subscription === 'free' && userGens >= 1) {
      setView('subscription');
      return;
    }

    setStatus(GenerationStatus.LOADING);
    try {
      const result = await generateCourse(topic);
      setCurrentResult(result);
      const newProject: CourseProject = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser?.id || 'guest',
        topic,
        content: result,
        timestamp: Date.now()
      };
      setProjects([newProject, ...projects]);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      setStatus(GenerationStatus.ERROR);
    }
  };

  // --- COMPUTED DATA ---
  const myProjects = useMemo(() => projects.filter(p => p.userId === currentUser?.id), [projects, currentUser]);
  
  // --- SUB-COMPONENTS ---

  const LandingPage = () => (
    <div className="bg-white text-gray-900 font-sans">
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div style={{ backgroundColor: siteConfig.accentColor }} className="p-2 rounded-xl text-white shadow-lg">
            <i className="fas fa-bolt-lightning"></i>
          </div>
          <span className="font-black text-2xl tracking-tighter">VIRAL AI</span>
        </div>
        <div className="hidden md:flex space-x-8 font-bold text-sm uppercase tracking-widest text-gray-500">
          <a href="#features" className="hover:text-orange-600 transition-colors">Funciones</a>
          <a href="#pricing" className="hover:text-orange-600 transition-colors">Precios</a>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => setView('login')} className="font-bold text-sm px-6 py-2 hover:text-orange-600 transition-all">Acceder</button>
          <button onClick={() => setView('register')} className="bg-[#0f172a] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-orange-600 transition-all">Regístrate</button>
        </div>
      </nav>

      <header className="px-8 py-20 text-center max-w-5xl mx-auto animate-in">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-[#0f172a] leading-[0.9] mb-8 whitespace-pre-line">
          {siteConfig.heroTitle}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          {siteConfig.heroSubtitle}
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
          <button onClick={() => setView('register')} style={{ backgroundColor: siteConfig.accentColor }} className="text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all hover:scale-105">Empezar Gratis</button>
          <button className="bg-white border-2 border-gray-100 px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-3">
            <i style={{ color: siteConfig.accentColor }} className="fas fa-play text-sm"></i>
            <span>Ver Demo</span>
          </button>
        </div>
      </header>

      <section id="features" className="bg-[#f8fafc] py-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {siteConfig.features.map((f, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-gray-50 group">
              <div style={{ backgroundColor: siteConfig.accentColor + '10' }} className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <i style={{ color: siteConfig.accentColor }} className={`fas ${f.icon} text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-black mb-3 text-[#0f172a]">{f.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="py-24 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
           <SimplePricingCard tier={siteConfig.pricing.free.name} price={siteConfig.pricing.free.price} features={siteConfig.pricing.free.features} color={siteConfig.accentColor} />
           <SimplePricingCard tier={siteConfig.pricing.pro.name} price={siteConfig.pricing.pro.price} featured features={siteConfig.pricing.pro.features} color={siteConfig.accentColor} />
           <SimplePricingCard tier={siteConfig.pricing.agency.name} price={siteConfig.pricing.agency.price} features={siteConfig.pricing.agency.features} color={siteConfig.accentColor} />
        </div>
      </section>
    </div>
  );

  const SimplePricingCard = ({ tier, price, features, color, featured = false }: any) => (
    <div className={`p-10 rounded-[2.5rem] border-2 flex flex-col items-center text-center transition-all ${featured ? 'bg-white shadow-2xl scale-105 z-10' : 'border-gray-50 bg-white shadow-sm'}`} style={featured ? { borderColor: color } : {}}>
      <h4 className="text-xl font-black text-[#0f172a] mb-2">{tier}</h4>
      <div className="text-4xl font-black mb-8">{price}</div>
      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((f: string, i: number) => (
          <li key={i} className="text-sm font-bold text-gray-500 flex items-center space-x-2">
            <i style={{ color }} className="fas fa-check text-[10px]"></i>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button onClick={() => setView('register')} style={featured ? { backgroundColor: color } : {}} className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${featured ? 'text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white'}`}>
        Seleccionar
      </button>
    </div>
  );

  // --- RENDERING ROUTER ---

  if (view === 'landing') return <LandingPage />;

  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
          <div style={{ backgroundColor: siteConfig.accentColor }} className="p-10 text-center text-white relative">
            <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <i className="fas fa-rocket text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold">{view === 'login' ? 'Bienvenido' : 'Nueva Cuenta'}</h1>
          </div>
          <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="p-8 space-y-5">
            <input type="email" placeholder="Email" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {view === 'register' && <input type="password" placeholder="Confirmar" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />}
            {authError && <p className="text-red-500 text-[10px] font-bold text-center uppercase">{authError}</p>}
            <button style={{ backgroundColor: siteConfig.accentColor }} className="w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest">
              {view === 'login' ? 'Entrar' : 'Registrar'}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-xs font-bold text-gray-400 hover:text-orange-600">
                {view === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col no-print fixed h-full z-50">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-12">
            <div style={{ backgroundColor: siteConfig.accentColor }} className="p-2.5 rounded-xl shadow-lg">
              <i className="fas fa-bolt-lightning text-white"></i>
            </div>
            <span className="font-black text-2xl tracking-tighter italic">VIRAL AI</span>
          </div>
          <nav className="space-y-2">
            <NavItem active={view === 'dashboard'} icon="fa-chart-pie" label="Dashboard" onClick={() => setView('dashboard')} />
            <NavItem active={view === 'generator'} icon="fa-wand-magic-sparkles" label="Generador" onClick={() => setView('generator')} />
            <NavItem active={view === 'history'} icon="fa-book-bookmark" label="Galería" onClick={() => setView('history')} />
            <NavItem active={view === 'subscription'} icon="fa-gem" label="Planes" onClick={() => setView('subscription')} />
            {currentUser?.role === 'admin' && (
              <NavItem active={view === 'admin'} icon="fa-user-shield" label="Admin" onClick={() => setView('admin')} />
            )}
          </nav>
        </div>
        
        <div className="mt-auto p-6 space-y-4">
          <div onClick={() => setView('profile')} className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-all border border-white/5">
            <div style={{ backgroundColor: siteConfig.accentColor }} className="w-10 h-10 rounded-full flex items-center justify-center font-black">
              {currentUser?.email.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-bold truncate flex-1">{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} className="w-full text-gray-500 hover:text-red-400 py-2 text-xs font-black uppercase tracking-widest transition-all">
            <i className="fas fa-power-off mr-2"></i>Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-grow ml-72 p-10 max-w-7xl mx-auto w-full">
        {view === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
             <h1 className="text-4xl font-black text-[#0f172a] tracking-tight mb-10">¡Hola, {currentUser?.email.split('@')[0]}!</h1>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <StatCard label="Mis Cursos" value={myProjects.length} icon="fa-layer-group" color="bg-blue-600" />
              <StatCard label="Plan Actual" value={currentUser?.subscription.toUpperCase()} icon="fa-crown" color="bg-orange-600" />
              <StatCard label="Estatus" value={currentUser?.status.toUpperCase()} icon="fa-check-circle" color="bg-green-600" />
            </div>
          </div>
        )}

        {view === 'generator' && (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700">
            <h1 className="text-4xl font-black text-center mb-10 text-[#0f172a]">Arquitecto de <span style={{ color: siteConfig.accentColor }}>Viralidad</span></h1>
            <form onSubmit={handleGenerate} className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 mb-12">
              <textarea className="w-full p-8 bg-gray-50 border border-gray-100 rounded-[2rem] h-44 outline-none text-xl font-bold mb-8" placeholder="Tu nicho..." value={topic} onChange={(e) => setTopic(e.target.value)} disabled={status === GenerationStatus.LOADING} required />
              <button type="submit" disabled={status === GenerationStatus.LOADING} style={{ backgroundColor: siteConfig.accentColor }} className="w-full text-white font-black py-6 rounded-2xl shadow-2xl transition-all active:scale-95 disabled:bg-gray-400 text-xl">
                {status === GenerationStatus.LOADING ? 'Generando...' : 'Generar Oferta'}
              </button>
            </form>
            {status === GenerationStatus.SUCCESS && currentResult && <MarkdownRenderer content={currentResult} />}
          </div>
        )}

        {view === 'admin' && currentUser?.role === 'admin' && (
          <div className="animate-in fade-in duration-700 space-y-12">
            <div className="flex space-x-4 border-b border-gray-100 pb-4">
              <button onClick={() => setAdminSubView('users')} className={`px-6 py-2 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${adminSubView === 'users' ? 'bg-[#0f172a] text-white' : 'text-gray-400'}`}>Usuarios</button>
              <button onClick={() => setAdminSubView('settings')} className={`px-6 py-2 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${adminSubView === 'settings' ? 'bg-[#0f172a] text-white' : 'text-gray-400'}`}>Sitio Web</button>
            </div>

            {adminSubView === 'users' ? (
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                      <th className="pb-6">Email</th>
                      <th className="pb-6">Plan</th>
                      <th className="pb-6">Rol</th>
                      <th className="pb-6">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-6 font-bold">{u.email}</td>
                        <td className="py-6">
                          <select value={u.subscription} onChange={(e) => handleUpdateUser(u.id, { subscription: e.target.value as any })} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="agency">Agency</option>
                          </select>
                        </td>
                        <td className="py-6">
                          <select value={u.role} onChange={(e) => handleUpdateUser(u.id, { role: e.target.value as any })} className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-6">
                          <button onClick={() => handleUpdateUser(u.id, { status: u.status === 'active' ? 'blocked' : 'active' })} className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {u.status}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8 animate-in">
                <h2 className="text-2xl font-black">Personalización del Sitio</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Color de Acento</label>
                    <input type="color" value={siteConfig.accentColor} onChange={(e) => setSiteConfig({...siteConfig, accentColor: e.target.value})} className="h-10 w-20 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Título Hero</label>
                    <input type="text" value={siteConfig.heroTitle} onChange={(e) => setSiteConfig({...siteConfig, heroTitle: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Subtítulo Hero</label>
                    <textarea value={siteConfig.heroSubtitle} onChange={(e) => setSiteConfig({...siteConfig, heroSubtitle: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl h-24" />
                  </div>

                  <div className="pt-6">
                    <h3 className="text-lg font-bold mb-4">Configuración de Planes</h3>
                    <div className="grid grid-cols-3 gap-6">
                      {['free', 'pro', 'agency'].map((key) => (
                        <div key={key} className="space-y-4 p-4 border rounded-2xl">
                          <p className="font-bold uppercase text-xs">{key}</p>
                          <input 
                            type="text" 
                            placeholder="Nombre"
                            value={(siteConfig.pricing as any)[key].name} 
                            onChange={(e) => setSiteConfig({
                              ...siteConfig, 
                              pricing: {
                                ...siteConfig.pricing,
                                [key]: { ...(siteConfig.pricing as any)[key], name: e.target.value }
                              }
                            })} 
                            className="w-full p-2 text-sm border rounded"
                          />
                          <input 
                            type="text" 
                            placeholder="Precio"
                            value={(siteConfig.pricing as any)[key].price} 
                            onChange={(e) => setSiteConfig({
                              ...siteConfig, 
                              pricing: {
                                ...siteConfig.pricing,
                                [key]: { ...(siteConfig.pricing as any)[key], price: e.target.value }
                              }
                            })} 
                            className="w-full p-2 text-sm border rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => alert('Cambios guardados localmente')} style={{ backgroundColor: siteConfig.accentColor }} className="text-white px-8 py-3 rounded-xl font-bold">
                    Guardar Configuración
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="animate-in fade-in duration-700">
             <h1 className="text-4xl font-black text-[#0f172a] tracking-tight mb-10">Mi Galería</h1>
             {myProjects.length === 0 ? (
               <p className="text-gray-400 font-bold">Sin proyectos.</p>
             ) : (
               <div className="space-y-8">
                 {myProjects.map(p => (
                   <div key={p.id} className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                     <h2 className="text-2xl font-black mb-6">{p.topic}</h2>
                     <MarkdownRenderer content={p.content} />
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {view === 'subscription' && (
          <div className="animate-in fade-in duration-700">
             <h2 className="text-3xl font-black text-center mb-10">Mejora tu cuenta</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SimplePricingCard tier={siteConfig.pricing.free.name} price={siteConfig.pricing.free.price} features={siteConfig.pricing.free.features} color={siteConfig.accentColor} />
                <SimplePricingCard tier={siteConfig.pricing.pro.name} price={siteConfig.pricing.pro.price} featured features={siteConfig.pricing.pro.features} color={siteConfig.accentColor} />
                <SimplePricingCard tier={siteConfig.pricing.agency.name} price={siteConfig.pricing.agency.price} features={siteConfig.pricing.agency.features} color={siteConfig.accentColor} />
             </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-700">
            <h1 className="text-3xl font-black mb-8">Perfil</h1>
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
               <div className="flex items-center space-x-6">
                 <div style={{ backgroundColor: siteConfig.accentColor }} className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black">
                   {currentUser?.email.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold">{currentUser?.email}</h3>
                   <span style={{ color: siteConfig.accentColor, backgroundColor: siteConfig.accentColor + '10' }} className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{currentUser?.subscription}</span>
                 </div>
               </div>
               <hr />
               <form onSubmit={handleChangePassword} className="space-y-4">
                 <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400">Seguridad</h4>
                 <input type="password" placeholder="Nueva Contraseña" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                 {profileMessage && <p className="text-xs font-bold text-green-500">{profileMessage}</p>}
                 <button style={{ backgroundColor: siteConfig.accentColor }} className="bg-[#0f172a] text-white px-8 py-4 rounded-xl font-bold">Guardar</button>
               </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- HELPERS ---

const NavItem = ({ active, icon, label, onClick }: { active: boolean, icon: string, label: string, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    <i className={`fas ${icon} w-5 text-sm`}></i>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-6">
    <div className={`${color} w-16 h-16 rounded-[1.2rem] text-white shadow-lg flex items-center justify-center`}>
      <i className={`fas ${icon} text-2xl`}></i>
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-[#0f172a] tracking-tighter">{value}</p>
    </div>
  </div>
);

export default App;
