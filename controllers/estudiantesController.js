import EstudiantesSecciones from '../models/EstudiantesSecciones.js';
import Usuario from '../models/Usuario.js';
import Seccion from '../models/Seccion.js';

// Asignar un estudiante a una sección
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
    res.status(500).json({ message: 'Error al asignar estudiante', error });
  }
};

// Obtener estudiantes de una sección
export const obtenerEstudiantes = async (req, res) => {
  const { id } = req.params; // ID de la sección

  try {
    const seccion = await Seccion.findByPk(id, {
      include: {
        model: Usuario,
        as: 'usuarios', // Alias genérico para todos los usuarios de la sección
        through: { attributes: [] }, // Excluir datos de la tabla intermedia
        where: { id_rol: 3 }, // Filtra solo estudiantes (rol 3)
        attributes: ['id_usuario', 'nombre', 'email'], // Campos deseados
      },
    });

    if (!seccion) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    res.status(200).json(seccion.usuarios); // Devuelve solo los estudiantes
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
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
