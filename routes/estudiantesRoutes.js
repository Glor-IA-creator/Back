import express from 'express';
import {
  asignarEstudiante,
  obtenerEstudiantes,
  eliminarEstudiante,
  obtenerSeccionesPorEstudiante,
  obtenerListaEstudiantes,
  obtenerEstudiantePorId,
  obtenerEstudiantesPorSeccion,
  obtenerHistorialChats,  
} from '../controllers/estudiantesController.js';
import { validarJWT, verificarRol } from '../middleware/auth.js';

const router = express.Router();

router.post('/:id/asignar', validarJWT, verificarRol(['admin']), asignarEstudiante);
router.get('/:id/estudiantes', validarJWT, obtenerEstudiantes);
router.delete('/:id/eliminar/:id_estudiante', validarJWT, verificarRol(['admin']), eliminarEstudiante);

// 🔹 Nuevas rutas
router.get('/secciones/:id_estudiante', validarJWT, obtenerSeccionesPorEstudiante);
router.get('/listado', validarJWT, obtenerListaEstudiantes);
router.get('/:id_estudiante', validarJWT, obtenerEstudiantePorId);
router.get('/seccion/:id_seccion', validarJWT, obtenerEstudiantesPorSeccion);
router.get('/:id_estudiante/chats', validarJWT, obtenerHistorialChats);


export default router;
