const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

app.post('/kick', async (req, res) => {
  const { userId, reason } = req.body;
  try {
    const guild = await client.guilds.fetch(SERVER_ID);
    const member = await guild.members.fetch(userId);

    if (member) {
      await member.kick(reason || 'Sin motivo especificado');
      res.send(`Usuario ${userId} expulsado.`);
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (error) {
    res.status(500).send(`Error expulsando usuario: ${error.message}`);
  }
});

// OPCIONAL: Autenticación simple
// app.use((req, res, next) => {
//   if (req.headers['x-api-key'] !== 'TU_API_KEY_SECRETA') {
//     return res.status(403).send('No autorizado');
//   }
//   next();
// });

client.login(BOT_TOKEN);
app.listen(3000, () => console.log('Servidor API escuchando en puerto 3000'));
 