const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configurar el transporte de nodemailer con las opciones de Hostinger
let transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: 'confirmaciones@reumacaribe.com', // Tu correo electrónico completo de Hostinger
        pass: '@V1g@1l250822' // Tu contraseña de correo electrónico de Hostinger
    }
});
// Función para conectar a la base de datos y manejar reconexiones
function conectarABaseDeDatos() {
    const db = mysql.createConnection({
        host: '151.106.99.5',
        user: 'u948052382_reumacaribe',
        password: '@V1g@1l25',
        database: 'u948052382_reumacaribe'
    });

    db.connect(err => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            setTimeout(conectarABaseDeDatos, 2000); // Reintentar después de 2 segundos
        } else {
            console.log('Conectado a la base de datos MySQL');
        }
    });

    db.on('error', err => {
        console.error('Error en la base de datos:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            conectarABaseDeDatos(); // Reconexion en caso de perdida de conexion
        }
    });

    return db;
}

const db = conectarABaseDeDatos();

// Endpoint para guardar perfiles
app.post('/saveProfile', (req, res) => {
    const { nombre, apellido, documento } = req.body;
    const query = 'INSERT INTO Usuarios (nombre, apellido, documento) VALUES (?, ?, ?)';

    db.query(query, [nombre, apellido, documento], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: 'Perfil guardado con éxito' });
        }
    });
});

// Endpoint para actualizar perfiles
app.post('/updateProfile', (req, res) => {
    const { nombre, apellido, documento } = req.body;
    const query = 'UPDATE Usuarios SET nombre = ?, apellido = ? WHERE documento = ?';

    db.query(query, [nombre, apellido, documento], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: 'Perfil actualizado con éxito' });
        }
    });
});


// Endpoint para obtener todos los perfiles
app.get('/getProfiles', (req, res) => {
    const query = 'SELECT * FROM Usuarios';

    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json('Error en el servidor: ' + err.message);
        } else {
            res.status(200).json(results);
        }
    });
});

app.post('/sendEmail', (req, res) => {
  const { nombre, apellido, documento,ticketNumber, email  } = req.body;

  // Configura el contenido del correo electrónico
  const mailOptions = {
    from: '"Reumacaribe" <confirmaciones@reumacaribe.com>', // dirección del remitente
    to: email, // lista de destinatarios
    subject: 'Confirmación de Inscripción', // Línea de asunto
    html: `
        <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <img src="URL_DE_TU_BANNER_AQUI" alt="Banner Reumacaribe" style="width: 100%; height: auto; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            <h1 style="color: #f40; text-align: center;">Confirmación de Inscripción</h1>
            <p>Hola ${nombre} ${apellido},</p>
            <p>Estamos emocionados de confirmar tu inscripción. Aquí están los detalles:</p>
            <div style="background-color: #f2f2f2; padding: 20px; margin: 20px 0; border-radius: 10px;">
                <h2 style="color: #f40; margin-bottom: 10px;">Detalles del Ticket</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Apellido:</strong> ${apellido}</p>
                <p><strong>Documento:</strong> ${documento}</p>
                <p style="background-color: #fff; padding: 10px; text-align: center; border-radius: 5px; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
                    <strong>Número de Ticket:</strong> ${ticketNumber}
                </p>
            </div>
            <p style="text-align: center;">¡Estamos ansiosos por verte en Reumacaribe!</p>
            <p style="font-size: 12px; text-align: center; color: #666;">Si tienes alguna pregunta, no dudes en responder a este correo electrónico.</p>
        </div>
    `
};


  // Enviar el correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error al enviar correo electrónico:', error);
          res.status(500).json({ error: error.message });
      } else {
          console.log('Correo electrónico enviado: ' + info.response);
          res.status(200).json({ message: 'Correo electrónico enviado con éxito' });
      }
  });
});


const port = 3000;
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});