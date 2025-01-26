import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const Rol = db.define('roles', {
  id_rol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, unique: true, allowNull: false },
}, {
  timestamps: false,
});

export default Rol;
