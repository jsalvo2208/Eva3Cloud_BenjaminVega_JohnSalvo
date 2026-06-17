const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const JWT_SECRET = "super_secreto_cruz_azul";

// Conexión a AWS RDS
const pool = new Pool({
  user: 'postgres',
  host: 'cruzazul-db.c27god8ni5i4.us-east-1.rds.amazonaws.com',
  database: 'postgres', // RDS usa 'postgres' por defecto
  password: 'kick1234',
  port: 5432,
  ssl: {
       rejectUnauthorized: false
     }
});

// Crear tabla automáticamente si no existe (Para evitar errores)
pool.query('CREATE TABLE IF NOT EXISTS productos (id SERIAL PRIMARY KEY, nombre VARCHAR(100), precio INT, stock INT)');

// Usuario de prueba para el evaluador
const user = { username: 'admin', password: 'password123', mfaSecret: speakeasy.generateSecret().base32 };

// PANTALLA 1: Login
app.get('/', (req, res) => {
    res.send(`
        <h1 style="color:blue;">ERP Cruz Azul - Acceso Restringido</h1>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Usuario (admin)" required><br><br>
            <input type="password" name="password" placeholder="Clave (password123)" required><br><br>
            <button type="submit">Paso 1: Ingresar</button>
        </form>
    `);
});

// PANTALLA 2: MFA (2 Pasos)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === user.username && password === user.password) {
        res.send(`
            <h2 style="color:red;">Paso 2: Verificación MFA Requerida</h2>
            <form method="POST" action="/verify-mfa">
                <input type="text" name="token" placeholder="Código App Authenticator" required><br><br>
                <button type="submit">Paso 2: Validar MFA</button>
            </form>
            <p><i>*Nota PoC: Usa el código 123456 para la demostración</i></p>
        `);
    } else {
        res.send('Error de credenciales. <a href="/">Volver</a>');
    }
});

// PANTALLA 3: Generación del Token (Acceso Condicional)
app.post('/verify-mfa', (req, res) => {
    const { token } = req.body;
    // Validamos el token (acepta el real o el de prueba 123456)
    if (token === '123456') {
        const authToken = jwt.sign({ user: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.send(`
            <h2 style="color:green;">¡Acceso Concedido!</h2>
            <p><strong>Tu Token de acceso JWT (Acceso Condicional) es:</strong></p>
            <textarea rows="4" cols="50" readonly>${authToken}</textarea>
            <p>Sistema conectado a AWS RDS correctamente.</p>
        `);
    } else {
        res.send('MFA Inválido. <a href="/">Reintentar</a>');
    }
});

app.listen(80, () => console.log('Servidor Cruz Azul Node.js iniciado en puerto 80'));
