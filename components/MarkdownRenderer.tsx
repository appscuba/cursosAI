
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple regex-based markdown parser for structured display
  // In a real app, use react-markdown, but we'll manually format for better control over the 12 sections
  
  const sections = content.split(/#\s+\d+\.\s+/).filter(s => s.trim() !== "");
  const sectionTitles = [
    "Idea del Curso & Nicho",
    "Análisis de Mercado",
    "Avatar del Cliente",
    "Promesa Transformadora",
    "Títulos Virales",
    "Estructura del Curso",
    "Scripts de Video",
    "Copy de Ventas",
    "Bonos Irresistibles",
    "Estrategia de Lanzamiento",
    "Plan de Contenido Viral",
    "Precios y Oferta"
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {sections.map((section, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="bg-hotmart text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">
                {idx + 1}
              </span>
              {sectionTitles[idx] || "Sección Adicional"}
            </h3>
            <button 
              onClick={() => navigator.clipboard.writeText(section)}
              className="text-gray-400 hover:text-hotmart transition-colors"
              title="Copiar sección"
            >
              <i className="far fa-copy"></i>
            </button>
          </div>
          <div className="p-6 prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">
            {section.split('\n').map((line, lIdx) => {
              if (line.startsWith('## ')) return <h4 key={lIdx} className="text-xl font-bold mt-4 mb-2 text-gray-800">{line.replace('## ', '')}</h4>;
              if (line.startsWith('- ')) return <li key={lIdx} className="ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
              if (line.trim() === '') return <br key={lIdx} />;
              return <p key={lIdx} className="mb-2">{line}</p>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarkdownRenderer;
