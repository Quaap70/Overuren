import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Saldo = sequelize.define('Saldo', {
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
  jaar: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  overgedragen_saldo: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Saldo in minuten overgedragen van vorig jaar'
  },
  gebruikt_saldo: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Gebruikt saldo in minuten (bijv. voor vakantie)'
  },
  huidig_saldo: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Huidig totaal saldo in minuten'
  },
  laatst_bijgewerkt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'saldo',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'jaar']
    }
  ]
});

/**
 * Get formatted saldo string (e.g., "24u 30m")
 * @returns {string}
 */
Saldo.prototype.getFormattedSaldo = function() {
  const absMinuten = Math.abs(this.huidig_saldo);
  const uren = Math.floor(absMinuten / 60);
  const minuten = absMinuten % 60;
  const prefix = this.huidig_saldo < 0 ? '-' : '';

  if (uren === 0) {
    return `${prefix}${minuten}m`;
  } else if (minuten === 0) {
    return `${prefix}${uren}u`;
  } else {
    return `${prefix}${uren}u ${minuten}m`;
  }
};

/**
 * Update saldo based on approved hours
 * @param {number} minuten - Minutes to add/subtract
 */
Saldo.prototype.updateSaldo = async function(minuten) {
  this.huidig_saldo += minuten;
  this.laatst_bijgewerkt = new Date();
  await this.save();
};

export default Saldo;
