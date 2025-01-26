import express from 'express';
import {
  crearSeccion,
  obtenerSeccionesPorAnio,
  obtenerSecciones,
  obtenerSeccionPorId,
  asignarEstudiante,
  obtenerEstudiantesDeSeccion,
  eliminarEstudianteDeSeccion,
} from '../controllers/seccionController.js';
import { validarJWT, verificarRol } from '../middleware/auth.js';

const router = express.Router();

/**
 * Definición de rutas para manejo de secciones con roles:
 * - 'profesor': Acceso restringido a profesores.
 * - 'estudiante': Acceso restringido a estudiantes.
 */

// Crear una nueva sección (solo profesores)
router.post('/', validarJWT, verificarRol(['profesor']), crearSeccion);

// Obtener todas las secciones (acceso para profesores y estudiantes)
router.get('/', validarJWT, verificarRol(['profesor', 'estudiante']), obtenerSecciones);

// Obtener sección específica por ID (acceso para profesores y estudiantes)
router.get('/:id', validarJWT, verificarRol(['profesor', 'estudiante']), obtenerSeccionPorId);

// Asignar estudiante a una sección (solo profesores)
router.post('/:id/estudiantes', validarJWT, verificarRol(['profesor']), asignarEstudiante);

// Obtener lista de estudiantes en una sección (acceso para profesores y estudiantes)
router.get('/:id/estudiantes', validarJWT, verificarRol(['profesor', 'estudiante']), obtenerEstudiantesDeSeccion);

// Eliminar estudiante de una sección (solo profesores)
router.delete('/:id/estudiantes/:id_estudiante', validarJWT, verificarRol(['profesor']), eliminarEstudianteDeSeccion);

// Obtener secciones por año (acceso para profesores y estudiantes)
router.get('/anio/:anio', validarJWT, verificarRol(['profesor', 'estudiante']), obtenerSeccionesPorAnio);

export default router;
