import express from 'express';
import { validarJWT } from '../middleware/auth.js'; // Middleware para validar JWT
import { crearHilo } from '../controllers/chatController.js';
import { agregarMensaje } from '../controllers/chatController.js';
import { ejecutarAsistente } from '../controllers/chatController.js';
import { obtenerMensajes } from '../controllers/chatController.js';
import { obtenerHistorialDeHilos } from '../controllers/chatController.js';
import { obtenerUltimoHilo } from '../controllers/chatController.js';
import { obtenerFechasDeHilosPorUsuarioYAsistente } from '../controllers/chatController.js';
import { registrarTiempoDeUsoChat } from '../controllers/chatController.js';
import { obtenerUltimoHiloPorAsistente } from '../controllers/chatController.js';


const router = express.Router();

// Ruta para crear un hilo
router.post('/crear-hilo', validarJWT, crearHilo);

// Ruta para agregar un mensaje a un hilo
router.post('/agregar-mensaje', validarJWT, agregarMensaje);

router.post('/ejecutar-asistente', validarJWT, ejecutarAsistente);

// Ruta para obtener los mensajes de un hilo
router.get('/obtener-mensajes', validarJWT, obtenerMensajes);

router.get('/obtener-fechas', validarJWT, obtenerFechasDeHilosPorUsuarioYAsistente);


// Ruta para obtener obtenerUltimoHilo
router.get('/ultimo-hilo', validarJWT, obtenerUltimoHilo);

router.get('/historial', validarJWT, obtenerHistorialDeHilos);


router.post('/registrar-tiempo', validarJWT, registrarTiempoDeUsoChat);


// Ruta para obtener el último hilo según el asistente
router.get('/ultimo-hilo-asistente', validarJWT, obtenerUltimoHiloPorAsistente);



export default router;
