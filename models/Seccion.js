import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const Seccion = db.define('secciones', {
  id_seccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_profesor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  enabled: {
    type: DataTypes.BOOLEAN, 
    allowNull: false,
    defaultValue: true, 
  },
}, {
  timestamps: false,
});

export default Seccion;
