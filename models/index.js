import Usuario from './Usuario.js';
import Rol from './Rol.js';
import Seccion from './Seccion.js';
import EstudiantesSecciones from './EstudiantesSecciones.js';

Usuario.belongsTo(Rol, { as: 'rolUsuario', foreignKey: 'id_rol' });
Rol.hasMany(Usuario, { as: 'usuariosRol', foreignKey: 'id_rol' });

Seccion.belongsTo(Usuario, {
  as: 'profesorSeccion', 
  foreignKey: 'id_profesor',
});


Usuario.hasMany(Seccion, {
  as: 'seccionesAsignadas',
  foreignKey: 'id_profesor',
});

Usuario.belongsToMany(Seccion, {
  through: EstudiantesSecciones,
  as: 'seccionesEstudiante',
  foreignKey: 'id_estudiante',
});

Seccion.belongsToMany(Usuario, {
  through: EstudiantesSecciones,
  as: 'estudiantesSeccion', 
  foreignKey: 'id_seccion',
});

export { Usuario, Rol, Seccion, EstudiantesSecciones };
