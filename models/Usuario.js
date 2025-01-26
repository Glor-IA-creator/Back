import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import Rol from './Rol.js';

const Usuario = db.define('usuarios', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  id_rol: { type: DataTypes.INTEGER, allowNull: false },
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, // Nuevo campo
}, {
  timestamps: false,
});

// Asociación: Un usuario tiene un rol
Usuario.belongsTo(Rol, { as: 'rol', foreignKey: 'id_rol' });

export default Usuario;
