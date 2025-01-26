import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const EstudiantesSecciones = db.define('EstudiantesSecciones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_seccion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_estudiante: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

export default EstudiantesSecciones;
