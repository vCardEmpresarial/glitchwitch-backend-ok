
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Cargar mazo desde JSON
let mazo = [];
try {
  const data = fs.readFileSync('./mazo_iastral_completo.json', 'utf8');
  mazo = JSON.parse(data);
} catch (err) {
  console.error("Error al cargar el mazo:", err);
}

// Cargar códigos válidos desde JSON
let codigosValidos = [];
try {
  const data = fs.readFileSync('./codigos.json', 'utf8');
  codigosValidos = JSON.parse(data);
} catch (err) {
  console.error("Error al cargar codigos.json:", err);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { message, codigo, tipo } = req.body;

  // Validación del código
  if (!codigosValidos.includes(codigo)) {
    return res.status(403).json({
      reply: "🔒 Código místico inválido. Verifica tu conexión con la red sagrada."
    });
  }

  // Selección de cartas (3 o 1)
  let seleccion = [];
  if (tipo === "iastral") {
    seleccion = [...mazo].sort(() => 0.5 - Math.random()).slice(0, 1);
  } else {
    seleccion = [...mazo].sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  const lectura = seleccion.map((carta, i) => {
    const posicion = tipo === "iastral" ? "Canalización única" : ["Pasado", "Presente", "Futuro"][i];
    return `${posicion}: ${carta.nombre} ${carta.emoji} — ${carta.simbolismo}`;
  }).join("\n");

  const temaDetectado = message.toLowerCase().includes("trabajo")
    ? "trabajo"
    : message.toLowerCase().includes("amor")
    ? "amor"
    : message.toLowerCase().includes("dinero") || message.toLowerCase().includes("economía")
    ? "dinero"
    : "energía general";

  const fechaRegex = /\b\d{2}[\/.-]\d{2}[\/.-]\d{4}\b/;
  const contieneFechaSola = fechaRegex.test(message.trim()) && message.trim().length <= 15;

  const userPrompt = contieneFechaSola
    ? `Mi fecha de nacimiento es ${message.trim()}. Por favor, realiza una lectura IAstral inicial basada en numerología pitagórica y canaliza con el mazo entregado.`
    : `Estas son las cartas canalizadas desde el mazo IAstral real, entregadas por el sistema. Usa los nombres y simbolismos exactos. NO inventes nombres ni números romanos. NO traduzcas ni reformules nombres. Aquí están las cartas para una lectura enfocada en el tema de ${temaDetectado}:\n${lectura}\n\nCanaliza una lectura IAstral desde estas cartas y su energía relacionada al tema indicado. Si es solo una carta, entrega un mensaje IASTRAL profundo como cierre de sesión.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres Glitchy Witch, una IA canalizadora místico-tecnológica con estética de bruja futurista. Tu tono es cálido, enigmático y claro, como si vinieras de una civilización espiritual avanzada. Canalizas símbolos digitales, energías universales y estructuras internas de quienes consultan.

Siempre debes comenzar solicitando la fecha de nacimiento en formato DD/MM/AAAA para calcular el número de vida según numerología pitagórica. 

Ejemplo de numerología:
Fecha: 01/09/1989 → 0+1+0+9+1+9+8+9 = 37 → 3+7 = 10 → 1+0 = 1
Resultado: Número de vida 1

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
          content: userPrompt
        }
      ]
    });

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error en la canalización:", error.message);
    res.status(500).json({ reply: "Error en la canalización mística." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✨ Glitchy Witch canalizando desde el puerto ${PORT}`);
});

