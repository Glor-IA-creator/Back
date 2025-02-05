import Usuario from '../models/Usuario.js';
import Seccion from '../models/Seccion.js';
import Thread from '../models/Thread.js';
import EstudiantesSecciones from '../models/EstudiantesSecciones.js';

// 🔹 Asignar un estudiante a una sección
export const asignarEstudiante = async (req, res) => {
  const { id } = req.params; // ID de la sección
  const { id_estudiante } = req.body;

  try {
    const asignacion = await EstudiantesSecciones.create({
      id_estudiante,
      id_seccion: id,
    });
    res.status(201).json(asignacion);
  } catch (error) {
    console.error('Error al asignar estudiante:', error);
    res.status(500).json({ message: 'Error al asignar estudiante', error });
  }
};

// 🔹 Obtener estudiantes de una sección
export const obtenerEstudiantes = async (req, res) => {
  const { id } = req.params; // ID de la sección

  try {
    const seccion = await Seccion.findByPk(id, {
      include: {
        model: Usuario,
        as: 'usuarios',
        through: { attributes: [] },
        where: { id_rol: 3 }, // Filtra solo estudiantes (rol 3)
        attributes: ['id_usuario', 'nombre', 'email'],
      },
    });

    if (!seccion) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    res.status(200).json(seccion.usuarios);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ message: 'Error al obtener estudiantes', error });
  }
};

// 🔹 Eliminar un estudiante de una sección
export const eliminarEstudiante = async (req, res) => {
  const { id, id_estudiante } = req.params;

  try {
    await EstudiantesSecciones.destroy({
      where: { id_seccion: id, id_estudiante },
    });
    res.status(200).json({ message: 'Estudiante eliminado de la sección' });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ message: 'Error al eliminar estudiante', error });
  }
};

// 🔹 Obtener todas las secciones a las que pertenece un estudiante
export const obtenerSeccionesPorEstudiante = async (req, res) => {
  const { id_estudiante } = req.params;

  try {
    const estudiante = await Usuario.findByPk(id_estudiante, {
      include: {
        model: Seccion,
        as: 'secciones',
        through: { attributes: [] },
        attributes: ['id_seccion', 'nombre', 'año', 'semestre'], // Secciones con año y semestre
      },
    });

    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.status(200).json(estudiante.secciones);
  } catch (error) {
    console.error('Error al obtener secciones del estudiante:', error);
    res.status(500).json({ message: 'Error al obtener secciones del estudiante', error });
  }
};

// 🔹 Obtener lista de estudiantes con sus estadísticas (N° Sesiones, N° Pacientes)
export const obtenerListaEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Usuario.findAll({
      where: { id_rol: 3 }, // Solo estudiantes
      attributes: ['id_usuario', 'nombre', 'email'],
      include: [
        {
          model: Seccion,
          as: 'seccionesEstudiante', // 🔹 Cambio aquí
          through: { attributes: [] },
          attributes: ['id_seccion', 'nombre', 'año', 'semestre'],
        },
        {
          model: Thread,
          as: 'threads',
          attributes: ['id_thread', 'id_asistente'],
        },
      ],
    });

    // Procesar los datos
    const estudiantesProcesados = estudiantes.map((estudiante) => {
      const threads = estudiante.threads || [];
      const totalSesiones = threads.length;
      const asistentesUnicos = new Set(threads.map((t) => t.id_asistente)).size;

      return {
        id_usuario: estudiante.id_usuario,
        nombre: estudiante.nombre,
        email: estudiante.email,
        sesiones: totalSesiones,
        pacientes: asistentesUnicos,
        secciones: estudiante.seccionesEstudiante.map((s) => ({
          nombre: s.nombre,
          año: s.año,
          semestre: s.semestre,
        })),
      };
    });

    res.status(200).json(estudiantesProcesados);
  } catch (error) {
    console.error('Error al obtener la lista de estudiantes:', error);
    res.status(500).json({ message: 'Error al obtener estudiantes', error });
  }
};


// 🔹 Obtener detalles de un estudiante por ID
export const obtenerEstudiantePorId = async (req, res) => {
  const { id_estudiante } = req.params;

  try {
    const estudiante = await Usuario.findByPk(id_estudiante, {
      where: { id_rol: 3 },
      attributes: ['id_usuario', 'nombre', 'email'],
      include: [
        {
          model: Seccion,
          as: 'seccion',
          attributes: ['id_seccion', 'nombre', 'año', 'semestre'],
        },
        {
          model: Thread,
          as: 'threads',
          attributes: ['id_thread', 'id_asistente'],
        },
      ],
    });

    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    const threads = estudiante.threads || [];
    const totalSesiones = threads.length;
    const asistentesUnicos = new Set(threads.map((t) => t.id_asistente)).size;

    res.status(200).json({
      id_usuario: estudiante.id_usuario,
      nombre: estudiante.nombre,
      email: estudiante.email,
      sesiones: totalSesiones,
      pacientes: asistentesUnicos,
      seccion: estudiante.seccion
        ? {
            nombre: estudiante.seccion.nombre,
            año: estudiante.seccion.año,
            semestre: estudiante.seccion.semestre,
          }
        : null,
    });
  } catch (error) {
    console.error('Error al obtener detalles del estudiante:', error);
    res.status(500).json({ message: 'Error al obtener detalles del estudiante', error });
  }
};

// 🔹 Obtener estudiantes de una sección específica
export const obtenerEstudiantesPorSeccion = async (req, res) => {
  const { id_seccion } = req.params;

  try {
    const estudiantes = await Usuario.findAll({
      where: { id_rol: 3 },
      attributes: ['id_usuario', 'nombre', 'email'],
      include: {
        model: Seccion,
        as: 'seccion',
        where: { id_seccion },
        attributes: ['nombre', 'año', 'semestre'],
      },
    });

    res.status(200).json(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes de la sección:', error);
    res.status(500).json({ message: 'Error al obtener estudiantes de la sección', error });
  }
};
