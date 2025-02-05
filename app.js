import express from 'express';
import cors from 'cors';
import db from './database/db.js';
import 'dotenv/config';
import { Usuario, Seccion, EstudiantesSecciones, Thread } from './models/index.js';
import estudiantesRoutes from './routes/estudiantesRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import seccionRoutes from './routes/seccionRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { validarJWT } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Registrar rutas protegidas
app.use('/api/secciones', validarJWT, seccionRoutes);
app.use('/api/estudiantes', validarJWT, estudiantesRoutes);
app.use('/api/chat', validarJWT, chatRoutes);
app.use('/api/admin', (req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.originalUrl}`);
  next();
}, adminRoutes); // Se eliminó validarJWT para permitir acceso correcto y agregado console.log

// Rutas públicas
app.use('/api/usuarios', usuarioRoutes);

(async () => {
  try {
    // Conexión a la base de datos
    await db.authenticate();
    console.log('✅ Conexión a la base de datos exitosa.');

    // 🔹 Solo sincronizar modelos sin recrear tablas
    await db.sync();
    console.log('✅ Modelos sincronizados con la base de datos.');

    // Iniciar servidor
    const PORT = process.env.PORT ;
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
})();
