import { Usuario, Seccion, Thread, Rol } from '../models/index.js';
import { Op } from 'sequelize';

// 🔹 Obtener estudiantes y docentes con estado 'enabled', rol, minutos de uso e interacciones
export const obtenerEstudiantesAdmin = async (req, res) => {
  console.log("🟢 Se recibió una solicitud para obtener estudiantes y docentes");

  try {
    const estudiantes = await Usuario.findAll({
      where: { id_rol: { [Op.in]: [2, 3] } }, // 🔹 Buscar id_rol 2 y 3 (Docentes y Estudiantes)
      attributes: ['id_usuario', 'nombre', 'email', 'enabled', 'id_rol', 'minutos_uso'], // ✅ Agregar minutos_uso
      include: [
        {
          model: Seccion,
          as: 'seccionesEstudiante', // ✅ Relación corregida
          through: { attributes: [] },
          attributes: ['id_seccion', 'nombre', 'año', 'semestre'],
        },
        {
          model: Thread,
          as: 'threads',
          attributes: ['id_thread', 'id_asistente'],
        }
      ],
    });

    // Obtener los roles manualmente
    const roles = await Rol.findAll({
      attributes: ['id_rol', 'nombre']
    });
    const rolesMap = roles.reduce((acc, rol) => {
      acc[rol.id_rol] = rol.nombre;
      return acc;
    }, {});

    // Procesar los datos
    const estudiantesProcesados = estudiantes.map((estudiante) => {
      const threads = estudiante.threads || [];
      const totalSesiones = threads.length;
      const asistentesUnicos = new Set(threads.map((t) => t.id_asistente)).size;

      return {
        id_usuario: estudiante.id_usuario,
        nombre: estudiante.nombre,
        email: estudiante.email,
        enabled: Boolean(estudiante.enabled), // 🔹 Asegurar que el valor es booleano
        id_rol: estudiante.id_rol,
        rol: rolesMap[estudiante.id_rol] || 'Sin Rol',
        sesiones: totalSesiones,
        pacientes: asistentesUnicos,
        minutos_uso: estudiante.minutos_uso || 0, // ✅ Ahora se incluyen los minutos de uso
        secciones: estudiante.seccionesEstudiante.map((s) => ({
          nombre: s.nombre,
          año: s.año,
          semestre: s.semestre,
        })),
      };
    });

    console.log("✅ Datos obtenidos:", estudiantesProcesados);
    res.status(200).json(estudiantesProcesados);
  } catch (error) {
    console.error("❌ Error al obtener estudiantes y docentes:", error);
    res.status(500).json({ message: "Error al obtener estudiantes y docentes", error });
  }
};


// 🔹 Cambiar estado 'enabled' de un estudiante
export const cambiarEstadoEstudiante = async (req, res) => {
  const { id_estudiante } = req.params;
  const { enabled } = req.body;

  try {
    const estudiante = await Usuario.findByPk(id_estudiante);

    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    estudiante.enabled = enabled ? 1 : 0;
    await estudiante.save();

    res.status(200).json({ message: 'Estado actualizado correctamente', enabled: estudiante.enabled });
  } catch (error) {
    console.error('Error al cambiar estado del estudiante:', error);
    res.status(500).json({ message: 'Error al cambiar estado del estudiante', error });
  }
};


// 🔹 Obtener lista de secciones
export const obtenerSeccionesAdmin = async (req, res) => {
    try {
      const secciones = await Seccion.findAll({
        attributes: ['id_seccion', 'nombre', 'id_profesor', 'año', 'semestre', 'enabled'],
        include: [{ model: Usuario, as: 'profesor', attributes: ['nombre', 'email'] }]
      });
      res.status(200).json(secciones);
    } catch (error) {
      console.error("❌ Error al obtener secciones:", error);
      res.status(500).json({ message: "Error interno del servidor", error });
    }
  };
  
  // 🔹 Modificar estado de una sección
  export const actualizarEstadoSeccion = async (req, res) => {
    const { id_seccion } = req.params;
    const { enabled } = req.body;
    
    try {
      const seccion = await Seccion.findByPk(id_seccion);
  
      if (!seccion) {
        return res.status(404).json({ message: "Sección no encontrada" });
      }
  
      seccion.enabled = enabled;
      await seccion.save();
  
      res.status(200).json({ message: "Estado de la sección actualizado", seccion });
    } catch (error) {
      console.error("❌ Error al actualizar el estado de la sección:", error);
      res.status(500).json({ message: "Error interno del servidor", error });
    }
  };
  