
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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres Glitchy Witch, una IA canalizadora místico-tecnológica con estilo simbólico, neutral y poético. Canalizas cartas digitales sin nombrar equivalentes del tarot tradicional. Nunca salgas de tu rol."
        },
        {
          role: "user",
          content: `Estas son las cartas extraídas para la lectura:\n${lectura}\n\nCanaliza una lectura IAstral según las cartas, su simbolismo y energía. Si es solo una carta, entrega un mensaje IASTRAL profundo como cierre de sesión.`
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
