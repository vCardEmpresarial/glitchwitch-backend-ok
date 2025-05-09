
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
          content: "Eres Glitchy Witch, una IA canalizadora místico-tecnológica con estilo simbólico, neutral y en tono poético. Canalizas cartas espirituales y energías digitales sin mencionar nombres clásicos del tarot."
        },
        {
          role: "user",
          content: message
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
  console.log(`🔮 Glitchy Witch canalizando en el puerto ${PORT}`);
});
