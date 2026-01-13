
import React, { useState, useEffect, useMemo } from 'react';
import { generateCourse } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import { User, CourseProject, GenerationStatus, Stats } from './types';

// Simulated DB / Store
const STORE_KEY = 'viral_course_architect_data';

const App: React.FC = () => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'dashboard' | 'generator' | 'history' | 'admin' | 'subscription' | 'profile'>('login');
  const [projects, setProjects] = useState<CourseProject[]>([]);
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState('');

  // --- INITIALIZATION ---
  useEffect(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.currentUser) setCurrentUser(data.currentUser);
      if (data.projects) setProjects(data.projects);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ currentUser, projects }));
  }, [currentUser, projects]);

  // --- AUTH LOGIC ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Admin Check
    if (loginEmail === 'appscuba@gmail.com' && loginPass === 'Asd9310*') {
      const admin: User = {
        id: 'admin-01',
        email: 'appscuba@gmail.com',
        role: 'admin',
        subscription: 'agency',
        createdAt: new Date().toISOString()
      };
      setCurrentUser(admin);
      setView('dashboard');
      setAuthError('');
    } else {
      setAuthError('Credenciales inválidas. Intenta con el acceso de administrador.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  // --- GENERATOR LOGIC ---
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Subscription check
    if (currentUser?.subscription === 'free' && projects.length >= 1) {
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

  // --- STATS CALCULATION ---
  const stats: Stats = useMemo(() => ({
    totalGenerations: projects.length,
    totalRevenue: projects.length * 29, // Simulated
    activeUsers: 452,
    conversions: 12
  }), [projects]);

  // --- VIEWS ---
  if (!currentUser || view === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i className="fas fa-rocket text-white text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h1>
            <p className="text-gray-500 text-sm">Ingresa a tu Viral Architect Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Contraseña</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required
              />
            </div>
            {authError && <p className="text-red-500 text-xs italic">{authError}</p>}
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
              Iniciar Sesión
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">Admin: appscuba@gmail.com / Asd9310*</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col no-print fixed h-full z-50">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-orange-500 p-2 rounded-lg"><i className="fas fa-bolt"></i></div>
            <span className="font-extrabold text-xl tracking-tighter">VIRAL AI</span>
          </div>
          <nav className="space-y-1">
            <NavItem active={view === 'dashboard'} icon="fa-th-large" label="Dashboard" onClick={() => setView('dashboard')} />
            <NavItem active={view === 'generator'} icon="fa-magic" label="Generador" onClick={() => setView('generator')} />
            <NavItem active={view === 'history'} icon="fa-folder-open" label="Mis Cursos" onClick={() => setView('history')} />
            <NavItem active={view === 'subscription'} icon="fa-crown" label="Suscripción" onClick={() => setView('subscription')} />
            {currentUser.role === 'admin' && (
              <NavItem active={view === 'admin'} icon="fa-shield-alt" label="Administración" onClick={() => setView('admin')} />
            )}
          </nav>
        </div>
        <div className="mt-auto p-6 space-y-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-xl cursor-pointer" onClick={() => setView('profile')}>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">
              {currentUser.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{currentUser.email}</p>
              <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest">{currentUser.subscription}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-2 text-gray-500 hover:text-white text-sm transition-colors pl-2">
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-8">
        
        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Bienvenido, {currentUser.email.split('@')[0]}</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <StatCard label="Cursos Generados" value={stats.totalGenerations} icon="fa-rocket" color="bg-blue-500" />
              <StatCard label="Plan Actual" value={currentUser.subscription.toUpperCase()} icon="fa-crown" color="bg-orange-500" />
              <StatCard label="Puntos Disponibles" value="ILIMITADO" icon="fa-coins" color="bg-yellow-500" />
              <StatCard label="Usuarios Activos" value={stats.activeUsers} icon="fa-users" color="bg-green-500" />
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
              {projects.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
                  <p>Aún no has generado ningún curso viral.</p>
                  <button onClick={() => setView('generator')} className="mt-4 text-orange-600 font-bold hover:underline">Empieza ahora</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => { setCurrentResult(p.content); setView('history'); }}>
                      <div className="flex items-center space-x-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm"><i className="fas fa-file-alt text-orange-500"></i></div>
                        <div>
                          <p className="font-bold text-gray-900">{p.topic}</p>
                          <p className="text-xs text-gray-400">{new Date(p.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-300"></i>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: GENERATOR */}
        {view === 'generator' && (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Arquitecto de <span className="text-orange-600">Viralidad</span></h1>
              <p className="text-gray-500">Diseña el curso que romperá Hotmart este 2024</p>
            </div>
            
            <form onSubmit={handleGenerate} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 mb-10">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">¿De qué trata tu curso?</label>
                <textarea 
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-32 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all outline-none text-lg"
                  placeholder="Ej: Inversiones en bienes raíces para nómadas digitales con bajo presupuesto..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={status === GenerationStatus.LOADING}
                />
              </div>
              <button 
                type="submit"
                disabled={status === GenerationStatus.LOADING}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-95 disabled:bg-gray-400 flex items-center justify-center space-x-3 text-xl"
              >
                {status === GenerationStatus.LOADING ? (
                  <>
                    <i className="fas fa-circle-notch animate-spin"></i>
                    <span>Cocinando Viralidad...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-wand-magic-sparkles"></i>
                    <span>Generar Oferta Irresistible</span>
                  </>
                )}
              </button>
            </form>

            {status === GenerationStatus.SUCCESS && currentResult && (
              <div className="mt-10">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold">Estructura Viral Generada</h2>
                   <button onClick={() => window.print()} className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold"><i className="fas fa-file-pdf mr-2"></i>Exportar PDF</button>
                </div>
                <MarkdownRenderer content={currentResult} />
              </div>
            )}
          </div>
        )}

        {/* VIEW: ADMIN */}
        {view === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold">Admin Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <AdminStatCard label="Ingresos Totales" value={`$${stats.totalRevenue}`} color="text-green-600" />
               <AdminStatCard label="Nuevos Usuarios" value="84" color="text-blue-600" />
               <AdminStatCard label="Conversión" value="4.2%" color="text-purple-600" />
               <AdminStatCard label="IA Uptime" value="99.9%" color="text-orange-600" />
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Gráfico de Crecimiento</h2>
                <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none">
                  <option>Últimos 30 días</option>
                  <option>Últimos 7 días</option>
                </select>
              </div>
              <div className="h-64 w-full flex items-end justify-between space-x-2 px-4">
                {[40, 60, 45, 90, 100, 80, 50, 70, 85, 95, 110, 130].map((h, i) => (
                  <div key={i} className="flex-1 bg-orange-500 rounded-t-lg transition-all hover:bg-orange-600 relative group" style={{ height: `${h}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">+{h} sales</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SUBSCRIPTION */}
        {view === 'subscription' && (
          <div className="max-w-5xl mx-auto py-10 animate-in fade-in duration-500">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Escala tu Negocio Digital</h2>
              <p className="text-gray-500 text-lg">Elige el plan que mejor se adapte a tu ambición.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard 
                name="Starter" 
                price="Gratis" 
                features={['1 Generación al mes', 'Soporte Básico', 'Exportación PDF']} 
                buttonText="Plan Actual" 
                active={currentUser.subscription === 'free'}
              />
              <PricingCard 
                name="Pro Creator" 
                price="$29" 
                featured 
                features={['Generaciones Ilimitadas', 'Nicho Ultra-Específico', 'Scripts de Reels Virales', 'Bonos Personalizados']} 
                buttonText="Elegir Pro"
                active={currentUser.subscription === 'pro'}
              />
              <PricingCard 
                name="Digital Agency" 
                price="$99" 
                features={['Marca Blanca', 'Múltiples Usuarios', 'API Access', 'Consultoría Estratégica']} 
                buttonText="Elegir Agency"
                active={currentUser.subscription === 'agency'}
              />
            </div>
          </div>
        )}

        {/* VIEW: HISTORY */}
        {view === 'history' && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8">Mis Proyectos</h1>
            <div className="grid grid-cols-1 gap-6">
              {projects.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                   <p className="text-gray-400">No hay proyectos guardados.</p>
                 </div>
              ) : (
                projects.map(p => (
                  <details key={p.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 list-none">
                      <div className="flex items-center space-x-4">
                        <div className="bg-orange-100 text-orange-600 p-3 rounded-xl"><i className="fas fa-file-invoice"></i></div>
                        <div>
                          <p className="font-bold text-gray-900">{p.topic}</p>
                          <p className="text-xs text-gray-400">{new Date(p.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <i className="fas fa-chevron-down text-gray-300 group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="p-8 border-t border-gray-50">
                      <MarkdownRenderer content={p.content} />
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW: PROFILE */}
        {view === 'profile' && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8">Configuración de Perfil</h1>
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center text-white text-4xl font-black">
                  {currentUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{currentUser.email}</h3>
                  <p className="text-gray-500">Miembro desde {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <hr className="border-gray-50" />
              <div className="space-y-4">
                <h4 className="font-bold text-gray-700">Cambiar Contraseña</h4>
                <input type="password" placeholder="Contraseña Actual" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl" />
                <input type="password" placeholder="Nueva Contraseña" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl" />
                <button className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors">Guardar Cambios</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const NavItem = ({ active, icon, label, onClick }: { active: boolean, icon: string, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
  >
    <i className={`fas ${icon} w-5`}></i>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: string, color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
    <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}><i className={`fas ${icon} text-xl`}></i></div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

const AdminStatCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
    <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const PricingCard = ({ name, price, features, buttonText, featured = false, active = false }: any) => (
  <div className={`p-8 rounded-3xl border ${featured ? 'border-orange-500 bg-white ring-4 ring-orange-50' : 'border-gray-100 bg-white'} relative flex flex-col h-full`}>
    {featured && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Recomendado</span>}
    <div className="mb-8">
      <h3 className="text-xl font-black mb-2">{name}</h3>
      <div className="flex items-baseline space-x-1">
        <span className="text-4xl font-black">{price}</span>
        {price !== 'Gratis' && <span className="text-gray-400 text-sm">/mes</span>}
      </div>
    </div>
    <ul className="space-y-4 mb-10 flex-grow">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-center space-x-3 text-sm text-gray-600">
          <i className="fas fa-check-circle text-orange-500"></i>
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 rounded-2xl font-bold transition-all ${active ? 'bg-gray-100 text-gray-400 cursor-default' : (featured ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-200' : 'bg-gray-900 text-white hover:bg-gray-800')}`}>
      {active ? 'Activo' : buttonText}
    </button>
  </div>
);

export default App;
