import Seccion from '../models/Seccion.js';
import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import EstudiantesSecciones from '../models/EstudiantesSecciones.js';

// Cambiar el estado de una sección (habilitar/deshabilitar)
export const cambiarEstadoSeccion = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar la sección por ID
    const seccion = await Seccion.findByPk(id);
    if (!seccion) {
      return res.status(404).json({ message: "Sección no encontrada" });
    }

    // Invertir el estado actual (enabled)
    seccion.enabled = !seccion.enabled;
    await seccion.save();

    res.status(200).json({ message: "Estado de la sección actualizado correctamente", seccion });
  } catch (error) {
    console.error("Error al cambiar el estado de la sección:", error);
    res.status(500).json({ message: "Error interno al cambiar el estado de la sección" });
  }
};


// Eliminar una sección por ID
export const eliminarSeccion = async (req, res) => {
  const { id } = req.params;

  try {
    const seccion = await Seccion.findByPk(id);
    if (!seccion) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    await seccion.destroy();
    res.status(200).json({ message: 'Sección eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la sección:', error);
    res.status(500).json({ message: 'Error al eliminar la sección', error });
  }
};


// Crear una nueva sección
export const crearSeccion = async (req, res) => {
  console.log("📥 Datos recibidos en el backend:", req.body); // 👀 Verifica los datos
  console.log("👤 Usuario autenticado:", req.usuario);

  const { nombre, año, semestre } = req.body;

  if (!nombre || !año || !semestre) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const id_profesor = req.usuario.id;
    const nuevaSeccion = await Seccion.create({
      nombre,
      año,
      semestre,
      id_profesor,
      enabled: true
    });

    res.status(201).json(nuevaSeccion);
  } catch (error) {
    console.error('❌ Error al crear sección:', error);
    res.status(500).json({ message: 'Error al crear la sección', error });
  }
};



// Obtener todas las secciones
export const obtenerSecciones = async (req, res) => {
  try {
    const secciones = await Seccion.findAll({
      include: { model: Usuario, as: 'profesor', attributes: ['nombre', 'email'] },
    });
    res.json(secciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las secciones', error });
  }
};

// Obtener una sección por ID
export const obtenerSeccionPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const seccion = await Seccion.findByPk(id, {
      include: { model: Usuario, as: 'profesor', attributes: ['nombre', 'email'] },
    });
    if (!seccion) return res.status(404).json({ message: 'Sección no encontrada' });

    res.json(seccion);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la sección', error });
  }
};

export const asignarEstudiante = async (req, res) => {
  const { id } = req.params; // ID de la sección
  const { id_estudiante } = req.body; // ID del estudiante a asignar

  if (!id_estudiante) {
    return res.status(400).json({ message: 'El ID del estudiante es obligatorio' });
  }

  try {
    // Verifica si la sección existe
    const seccion = await Seccion.findByPk(id);
    if (!seccion) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    // Asignar el estudiante a la sección
    const asignacion = await EstudiantesSecciones.create({
      id_seccion: id,
      id_estudiante,
      fecha_asignacion: new Date(),
    });

    res.status(201).json(asignacion);
  } catch (error) {
    console.error('Error al asignar estudiante a la sección:', error);
    res.status(500).json({ message: 'Error al asignar estudiante a la sección', error });
  }
};

export const obtenerEstudiantesDeSeccion = async (req, res) => {
  const { id } = req.params;

  try {
    const seccion = await Seccion.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'estudiantes', // El alias debe coincidir con el definido en el modelo
          through: { attributes: [] }, // Excluir columnas intermedias
          attributes: ['id_usuario', 'nombre', 'email'],
        },
      ],
    });

    if (!seccion) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    res.json(seccion.estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes de la sección:', error);
    res.status(500).json({ message: 'Error al obtener estudiantes de la sección', error });
  }
};

export const eliminarEstudianteDeSeccion = async (req, res) => {
  const { id, id_estudiante } = req.params;

  try {
    const result = await EstudiantesSecciones.destroy({
      where: {
        id_seccion: id,
        id_estudiante,
      },
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado en la sección' });
    }

    res.json({ message: 'Estudiante eliminado de la sección' });
  } catch (error) {
    console.error('Error al eliminar estudiante de la sección:', error);
    res.status(500).json({ message: 'Error al eliminar estudiante de la sección', error });
  }
};

export const obtenerSeccionesPorAnio = async (req, res) => {
  const { anio } = req.params;

  if (isNaN(anio)) {
    return res.status(400).json({ message: 'El año debe ser un número válido' });
  }

  const inicioAnio = `${anio}-01-01 00:00:00`;
  const finAnio = `${anio}-12-31 23:59:59`;

  try {
    const secciones = await Seccion.findAll({
      where: {
        fecha_creacion: {
          [Op.between]: [inicioAnio, finAnio],
        },
      },
      include: [
        {
          model: Usuario,
          as: 'profesor', // Alias actualizado
          attributes: ['id_usuario', 'nombre', 'email'],
        },
      ],
    });

    if (secciones.length === 0) {
      return res.status(404).json({ message: `No se encontraron secciones para el año ${anio}` });
    }

    res.json(secciones);
  } catch (error) {
    console.error('Error al obtener secciones por año:', error);
    res.status(500).json({ message: 'Error al obtener secciones por año', error });
  }
};
