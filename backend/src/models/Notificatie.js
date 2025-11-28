import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notificatie = sequelize.define('Notificatie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('GOEDKEURING', 'AFKEURING', 'SALDO_WIJZIGING', 'HERINNERING', 'INFO'),
    allowNull: false
  },
  titel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bericht: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  gelezen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gerelateerd_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID van gerelateerde overuren entry of andere entity'
  }
}, {
  tableName: 'notificaties',
  indexes: [
    {
      fields: ['user_id', 'gelezen']
    },
    {
      fields: ['created_at']
    }
  ]
});

/**
 * Mark notification as read
 */
Notificatie.prototype.markAsRead = async function() {
  this.gelezen = true;
  await this.save();
};

/**
 * Get icon based on notification type
 * @returns {string}
 */
Notificatie.prototype.getIcon = function() {
  const icons = {
    'GOEDKEURING': '✅',
    'AFKEURING': '❌',
    'SALDO_WIJZIGING': '💰',
    'HERINNERING': '⏰',
    'INFO': 'ℹ️'
  };
  return icons[this.type] || 'ℹ️';
};

export default Notificatie;
