const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const app = express();
app.use(express.json());

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ruta para generar una invitación y enviarla por correo
app.post('/enviar-invitacion', async (req, res) => {
  const { email } = req.body;

  try {
    const guild = await client.guilds.fetch(process.env.SERVER_ID);
    const channel = guild.channels.cache.find(c =>
      c.isTextBased() &&
      c.permissionsFor(guild.members.me).has('CreateInstantInvite')
    );

    if (!channel) return res.status(500).send('No se encontró un canal válido para crear la invitación.');

    const invite = await channel.createInvite({
      maxAge: 3600, // 1 hora
      maxUses: 1,
      unique: true
    });

    const emailPrefix = email.split('@')[0];

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Invitación a nuestro servidor de Discord',
      text: `¡Hola ${emailPrefix}! Aquí tienes tu invitación: https://discord.gg/${invite.code} (válida por 1 hora)`,
    };

    await transporter.sendMail(mailOptions);
    res.send('Invitación enviada al correo');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error enviando la invitación');
  }
});

// Ruta para expulsar a un usuario del servidor por nombre de usuario
app.post('/kick', async (req, res) => {
    const { username, reason } = req.body;
  
    try {
      const guild = await client.guilds.fetch(process.env.SERVER_ID);
  
      // Asegúrate de cargar todos los miembros del servidor
      await guild.members.fetch();
  
      // Busca el primer miembro con ese username
      const member = guild.members.cache.find(m => m.user.username === username);
  
      if (member) {
        await member.kick(reason || 'Sin motivo especificado');
        res.send(`Usuario ${member.user.tag} expulsado.`);
      } else {
        res.status(404).send(`No se encontró un usuario con el nombre "${username}".`);
      }
    } catch (error) {
      res.status(500).send(`Error expulsando usuario: ${error.message}`);
    }
  });
  

client.login(process.env.BOT_TOKEN);
app.listen(3000, () => console.log('Servidor API escuchando en puerto 3000'));
