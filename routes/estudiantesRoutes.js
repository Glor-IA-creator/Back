import express from 'express';
import {
  asignarEstudiante,
  obtenerEstudiantes,
  eliminarEstudiante,
} from '../controllers/estudiantesController.js';
import { validarJWT, verificarRol } from '../middleware/auth.js';

const router = express.Router();

router.post('/:id/estudiantes', validarJWT, verificarRol([2]), asignarEstudiante); // Asignar estudiante
router.get('/:id/estudiantes', validarJWT, verificarRol([2]), obtenerEstudiantes); // Obtener estudiantes
router.delete('/:id/estudiantes/:id_estudiante', validarJWT, verificarRol([2]), eliminarEstudiante); // Eliminar estudiante

export default router;
