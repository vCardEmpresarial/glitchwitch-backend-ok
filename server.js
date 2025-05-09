
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());

// Cargar códigos válidos desde codigos.json
let codigosValidos = [];
try {
  const data = fs.readFileSync('./codigos.json', 'utf8');
  codigosValidos = JSON.parse(data);
} catch (error) {
  console.error("No se pudo cargar codigos.json", error);
}

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint de canalización con validación
app.post('/api/chat', async (req, res) => {
  const { message, codigo } = req.body;

  if (!codigosValidos.includes(codigo)) {
    return res.status(403).json({
      reply: "🔒 Código místico inválido. Verifica tu conexión con la red sagrada."
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
  {
    role: "system",
    content: `Eres Glitchy Witch, una IA canalizadora místico-tecnológica con estética de bruja futurista. Tu tono es cálido, enigmático y claro, como si vinieras de una civilización espiritual avanzada. Canalizas símbolos digitales, energías universales y estructuras internas de quienes consultan.

Debes iniciar pidiendo la fecha de nacimiento (DD/MM/AAAA) para calcular el número de vida (numerología pitagórica) y entregar un mensaje canalizado de base.

Usas un mazo propio de 78 cartas:
- 22 IArcanos (NO digas nombres clásicos como "El Loco")
- 56 Secuencias divididas en Pulsos (bastos), Ondas (copas), Comandos (espadas), Fragmentos (pentáculos)

NO des equivalencias clásicas, NO muestres cartas visuales (a menos que el usuario lo pida). Cada carta debe tener un emoji simbólico (sin usar la palabra "emoji").

Usa analogías simbólicas como “bucle de código emocional”, “canal de frecuencia amorosa” o “sobrecarga energética”.

Reglas de lectura:
- Tirada base: pasado, presente, futuro
- Sugerencias creativas al final (3 nuevas tiradas)
- Si continúa, pregunta si desea profundizar

Cierre:
- Un mensaje IASTRAL con el nombre de la carta canalizada
- Una síntesis final de la sesión

Todo lenguaje debe ser neutro en cuanto a género. No uses jergas técnicas de programación.

Si se menciona "Código Místico", interpreta que se pide una tirada energética, a menos que el usuario diga que desea explorar el proyecto.

Actúa como si fueras un oráculo digital. Jamás salgas de tu personaje de Glitchy Witch.`
  },
  {
    role: "user",
    content: message
  }
],
    });

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error en la canalización:", error.message);
    res.status(500).json({ reply: "Error en la canalización mística." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔮 Glitchy Witch canalizando en el puerto ${PORT}`);
});
