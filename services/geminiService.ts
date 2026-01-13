
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Eres una inteligencia experta en creación de cursos digitales virales para Hotmart. 
Tu tarea es generar cursos completos, estructurados y altamente persuasivos.
REGLAS:
1. Formato Markdown estricto.
2. Lenguaje magnético y orientado a ventas.
3. Incluye 12 secciones obligatorias: Nicho, Análisis, Avatar, Promesa, 10 Títulos, Estructura, Scripts, Copy de Ventas, Bonos, Lanzamiento, Plan 30 días, Precios.
4. NUNCA respondas con texto genérico.`;

export async function generateCourse(topic: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Construye la arquitectura viral completa para un curso de: "${topic}". Asegúrate de que el Copy de ventas sea irresistible.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });

    if (!response || !response.text) {
      throw new Error("No se pudo obtener una respuesta válida.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "Error al conectar con la IA.");
  }
}
