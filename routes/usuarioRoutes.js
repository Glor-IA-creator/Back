import express from 'express';
import {
  obtenerUsuarios,
  crearUsuario,
  iniciarSesion,
  obtenerUsuarioActual,
} from '../controllers/usuarioController.js';
import { validarJWT, verificarRol } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', iniciarSesion);

// Rutas protegidas
router.get('/me', validarJWT, obtenerUsuarioActual);
router.get('/', validarJWT, verificarRol(['admin']), obtenerUsuarios);
router.post('/register', validarJWT, verificarRol(['admin']), crearUsuario);

export default router;
