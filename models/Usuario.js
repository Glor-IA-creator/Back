import { DataTypes } from 'sequelize';
import db from '../database/db.js';


const Usuario = db.define('usuarios', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  id_rol: { type: DataTypes.INTEGER, allowNull: false },
  id_seccion: { type: DataTypes.INTEGER, allowNull: true }, // 🔹 Relación directa con Sección
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  timestamps: false,
});

export default Usuario;
