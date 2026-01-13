
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import MarkdownRenderer from './components/MarkdownRenderer';
import { generateCourse } from './services/geminiService';
import { GenerationStatus } from './types';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStatus(GenerationStatus.LOADING);
    setError(null);
    setResult('');

    try {
      const courseText = await generateCourse(topic);
      setResult(courseText || '');
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error("App layer error:", err);
      setError(err.message || "Hubo un error al generar el curso. Por favor, intenta de nuevo.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="no-print">
        <Header />
      </div>
      
      <main className="flex-grow max-w-5xl mx-auto px-4 py-12 w-full">
        <section className="text-center mb-12 no-print">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Crea Cursos <span className="gradient-text">Virales en Segundos</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ingresa un nicho o idea y nuestra IA generará toda la arquitectura de tu próximo éxito en Hotmart.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-10 mb-12 border border-gray-100 no-print">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="relative">
              <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
                Nicho o Idea de Curso
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-lightbulb text-gray-400 group-focus-within:text-hotmart transition-colors"></i>
                </div>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej: Yoga para programadores, Inversiones en Cripto para principiantes..."
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hotmart focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={status === GenerationStatus.LOADING}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-hotmart/20 transition-all flex items-center justify-center space-x-2 ${
                status === GenerationStatus.LOADING 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-hotmart hover:bg-[#e84e10] active:scale-[0.98]'
              }`}
            >
              {status === GenerationStatus.LOADING ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generando Arquitectura Viral...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i>
                  <span>Generar Curso Completo</span>
                </>
              )}
            </button>
          </form>

          {status === GenerationStatus.LOADING && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-3 text-gray-500 animate-pulse">
                <i className="fas fa-check-circle text-green-500"></i>
                <span className="text-sm">Analizando tendencias de mercado...</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-500 animate-pulse delay-700">
                <i className="fas fa-check-circle text-green-500"></i>
                <span className="text-sm">Diseñando estructura pedagógica...</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-500 animate-pulse delay-1000">
                <i className="fas fa-check-circle text-green-500"></i>
                <span className="text-sm">Redactando copys persuasivos de venta...</span>
              </div>
            </div>
          )}
        </section>

        {status === GenerationStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-start space-x-4 mb-12 no-print">
            <i className="fas fa-exclamation-circle text-xl mt-1"></i>
            <div>
              <p className="font-bold">¡Vaya! Algo salió mal.</p>
              <p className="text-sm opacity-90">{error}</p>
              <button 
                onClick={() => setStatus(GenerationStatus.IDLE)}
                className="mt-2 text-xs font-bold underline uppercase tracking-wider"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )}

        {status === GenerationStatus.SUCCESS && result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-2 no-print">
              <h2 className="text-2xl font-bold text-gray-900">Resultado de tu Curso</h2>
              <button 
                onClick={() => window.print()}
                className="text-hotmart font-semibold hover:underline flex items-center space-x-2"
              >
                <i className="fas fa-file-pdf"></i>
                <span>Exportar como PDF</span>
              </button>
            </div>
            {/* Show a heading only when printing */}
            <div className="hidden print:block mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900">Guía Completa del Curso</h1>
              <p className="text-gray-500">Generado por Viral Course Architect</p>
            </div>
            <MarkdownRenderer content={result} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Viral Course Architect. Diseñado para creadores de contenido y emprendedores digitales.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-hotmart"><i className="fab fa-instagram"></i></a>
            <a href="#" className="text-gray-400 hover:text-hotmart"><i className="fab fa-tiktok"></i></a>
            <a href="#" className="text-gray-400 hover:text-hotmart"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
