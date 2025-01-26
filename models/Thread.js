import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import Usuario from './Usuario.js';

const Thread = db.define('Thread', {
  id_thread: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios', 
      key: 'id_usuario',
    },
  },
  id_asistente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

Thread.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

export default Thread;
