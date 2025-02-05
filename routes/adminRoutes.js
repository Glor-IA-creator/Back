import express from 'express';
import { obtenerEstudiantesAdmin, cambiarEstadoEstudiante } from '../controllers/adminController.js';
import { obtenerSeccionesAdmin, actualizarEstadoSeccion } from '../controllers/adminController.js';


const router = express.Router();

//✅  Ruta para obtener estudiantes
router.get('/estudiantes', obtenerEstudiantesAdmin);

//✅  Ruta para cambiar el estado de un estudiante
router.put('/estudiantes/:id_estudiante/estado', cambiarEstadoEstudiante);

// ✅ Agregar ruta para obtener todas las secciones
router.get('/secciones', obtenerSeccionesAdmin);

// ✅ Ruta para modificar el estado de una sección
router.put('/secciones/:id_seccion/estado', actualizarEstadoSeccion);


export default router;
