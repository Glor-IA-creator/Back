import Usuario from '../models/Usuario.js';
import Seccion from '../models/Seccion.js';
import Thread from '../models/Thread.js';
import EstudiantesSecciones from '../models/EstudiantesSecciones.js';

// Asignar un estudiante a una sección
export const asignarEstudiante = async (req, res) => {
  const { id } = req.params;
  const { id_estudiante } = req.body;

  try {
    const asignacion = await EstudiantesSecciones.create({
      id_estudiante,
      id_seccion: id,
    });
    res.status(201).json(asignacion);
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar estudiante', error });
  }
};

// Obtener estudiantes de una sección
export const obtenerEstudiantes = async (req, res) => {
  const { id } = req.params;

  try {
    const seccion = await Seccion.findByPk(id, {
      include: {
        model: Usuario,
        as: 'usuarios',
        through: { attributes: [] },
        where: { id_rol: 3 },
        attributes: ['id_usuario', 'nombre', 'email'],
      },
    });

    if (!seccion) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    res.status(200).json(seccion.usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estudiantes', error });
  }
};

// Eliminar un estudiante de una sección
export const eliminarEstudiante = async (req, res) => {
  const { id, id_estudiante } = req.params;

  try {
    await EstudiantesSecciones.destroy({
      where: { id_seccion: id, id_estudiante },
    });
    res.status(200).json({ message: 'Estudiante eliminado de la sección' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar estudiante', error });
  }
};

// Obtener todas las secciones a las que pertenece un estudiante
export const obtenerSeccionesPorEstudiante = async (req, res) => {
  const { id_estudiante } = req.params;

  try {
    const estudiante = await Usuario.findByPk(id_estudiante, {
      include: {
        model: Seccion,
        as: 'secciones',
        through: { attributes: [] },
        attributes: ['id_seccion', 'nombre', 'año', 'semestre'],
      },
    });

    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.status(200).json(estudiante.secciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener secciones del estudiante', error });
  }
};

// Obtener lista de estudiantes con sus estadísticas (N° Sesiones, N° Pacientes)
export const obtenerListaEstudiantes = async (req, res) => {
  try {
    const { year, section } = req.query;

    const whereSeccion = {};
    if (year) whereSeccion.año = year;
    if (section) whereSeccion.nombre = section;

    const estudiantes = await Usuario.findAll({
      where: { id_rol: 3 },
      attributes: ['id_usuario', 'nombre', 'email'],
      include: [
        {
          model: Seccion,
          as: 'seccionesEstudiante',
          through: { attributes: [] },
          attributes: ['id_seccion', 'nombre', 'año', 'semestre'],
          where: Object.keys(whereSeccion).length ? whereSeccion : undefined,
        },
        {
          model: Thread,
          as: 'threads',
          attributes: ['id_thread', 'id_asistente'],
        },
      ],
    });

    const estudiantesProcesados = estudiantes.map((estudiante) => {
      const totalSesiones = estudiante.threads.length;
      const pacientesUnicos = new Set(estudiante.threads.map((t) => t.id_asistente)).size;

      return {
        id_usuario: estudiante.id_usuario,
        nombre: estudiante.nombre,
        email: estudiante.email,
        sesiones: totalSesiones,
        pacientes: pacientesUnicos,
        secciones: estudiante.seccionesEstudiante.map((s) => ({
          nombre: s.nombre,
          año: s.año,
          semestre: s.semestre,
        })),
      };
    });

    res.status(200).json(estudiantesProcesados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estudiantes', error });
  }
};

// Obtener detalles de un estudiante por ID
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
    res.status(500).json({ message: 'Error al obtener detalles del estudiante', error });
  }
};

// Obtener estudiantes de una sección específica
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
    res.status(500).json({ message: 'Error al obtener estudiantes de la sección', error });
  }
};
