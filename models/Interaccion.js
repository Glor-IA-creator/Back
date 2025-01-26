import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const Interaccion = db.define('interacciones', {
  id_interaccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_estudiante: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_seccion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('inicio', 'mensaje', 'fin'),
    allowNull: false,
  },
  contenido: {
    type: DataTypes.TEXT, // Modificado para soportar chats extensos
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

export default Interaccion;
