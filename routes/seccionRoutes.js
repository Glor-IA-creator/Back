import express from 'express';
import {
  crearSeccion,
  obtenerSeccionesPorAnio,
  obtenerSecciones,
  obtenerSeccionPorId,
  asignarEstudiante,
  obtenerEstudiantesDeSeccion,
  eliminarEstudianteDeSeccion,
  eliminarSeccion,
  cambiarEstadoSeccion,
} from '../controllers/seccionController.js';
import { validarJWT, verificarRol } from '../middleware/auth.js';

const router = express.Router();

/**
 * Definición de rutas para manejo de secciones con roles:
 * - 'profesor': Acceso restringido a profesores.
 * - 'estudiante': Acceso restringido a estudiantes.
 */


// 📌 Cambiar el estado de una sección (habilitar/deshabilitar)
router.put('/:id/estado', validarJWT, verificarRol(['admin', 'profesor']), cambiarEstadoSeccion);

// Eliminar una sección (solo profesores y administradores)
router.delete('/:id', validarJWT, verificarRol(['profesor', 'admin']), eliminarSeccion);

// Crear una nueva sección (solo profesores)
router.post('/', validarJWT, verificarRol(['profesor', 'admin']), crearSeccion);

// Obtener todas las secciones (acceso para profesores y estudiantes)
router.get('/', validarJWT, verificarRol(['profesor', 'estudiante', 'admin']), obtenerSecciones);

// Obtener sección específica por ID (acceso para profesores y estudiantes)
router.get('/:id', validarJWT, verificarRol(['profesor', 'estudiante', 'admin']), obtenerSeccionPorId);

// Asignar estudiante a una sección (solo profesores)
router.post('/:id/estudiantes', validarJWT, verificarRol(['profesor', 'admin']), asignarEstudiante);

// Obtener lista de estudiantes en una sección (acceso para profesores y estudiantes)
router.get('/:id/estudiantes', validarJWT, verificarRol(['profesor', 'estudiante']), obtenerEstudiantesDeSeccion);

// Eliminar estudiante de una sección (solo profesores)
router.delete('/:id/estudiantes/:id_estudiante', validarJWT, verificarRol(['profesor', 'admin']), eliminarEstudianteDeSeccion);

// Obtener secciones por año (acceso para profesores y estudiantes)
router.get('/anio/:anio', validarJWT, verificarRol(['profesor', 'estudiante']), obtenerSeccionesPorAnio);

export default router;
