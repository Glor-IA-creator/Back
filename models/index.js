import Usuario from './Usuario.js';
import Rol from './Rol.js';
import Seccion from './Seccion.js';
import EstudiantesSecciones from './EstudiantesSecciones.js';
import Thread from './Thread.js';

// ✅ Relación de Usuario con Rol
Usuario.belongsTo(Rol, { as: 'rol', foreignKey: 'id_rol' });
Rol.hasMany(Usuario, { as: 'usuarios', foreignKey: 'id_rol' });

// ✅ Un profesor puede tener muchas secciones
Seccion.belongsTo(Usuario, { as: 'profesor', foreignKey: 'id_profesor' });
Usuario.hasMany(Seccion, { as: 'seccionesDocente', foreignKey: 'id_profesor' });

// ✅ Relación de Estudiantes con Secciones (Muchos a Muchos)
Usuario.belongsToMany(Seccion, {
  through: EstudiantesSecciones,
  as: 'seccionesEstudiante',
  foreignKey: 'id_estudiante',
});

Seccion.belongsToMany(Usuario, {
  through: EstudiantesSecciones,
  as: 'estudiantes',
  foreignKey: 'id_seccion',
});

// ✅ Relación de Usuario con Threads (Sesiones de Chat)
Thread.belongsTo(Usuario, { as: 'usuarioThread', foreignKey: 'id_usuario' }); // 🔹 Cambio de alias
Usuario.hasMany(Thread, { as: 'threads', foreignKey: 'id_usuario' });

// ✅ Exportar modelos corregidos
export { Usuario, Rol, Seccion, EstudiantesSecciones, Thread };
