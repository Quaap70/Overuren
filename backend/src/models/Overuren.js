import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Overuren = sequelize.define('Overuren', {
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
  datum: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  minuten: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isMultipleOfTen(value) {
        if (value % 10 !== 0) {
          throw new Error('Minuten moeten een veelvoud van 10 zijn');
        }
      },
      isValidRange(value) {
        if (Math.abs(value) > 720) { // max 12 uur
          throw new Error('Maximaal 12 uur per dag toegestaan');
        }
      }
    }
  },
  reden: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  week_nummer: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  jaar: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('CONCEPT', 'INGEDIEND', 'GOEDGEKEURD', 'AFGEKEURD'),
    allowNull: false,
    defaultValue: 'CONCEPT'
  },
  afkeur_reden: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ingediend_op: {
    type: DataTypes.DATE,
    allowNull: true
  },
  goedgekeurd_op: {
    type: DataTypes.DATE,
    allowNull: true
  },
  goedgekeurd_door: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'overuren',
  indexes: [
    {
      fields: ['user_id', 'datum']
    },
    {
      fields: ['status']
    },
    {
      fields: ['week_nummer', 'jaar']
    }
  ]
});

/**
 * Get formatted time string (e.g., "2u 30m")
 * @returns {string}
 */
Overuren.prototype.getFormattedTime = function() {
  const absMinuten = Math.abs(this.minuten);
  const uren = Math.floor(absMinuten / 60);
  const minuten = absMinuten % 60;
  const prefix = this.minuten < 0 ? '-' : '+';

  if (uren === 0) {
    return `${prefix}${minuten}m`;
  } else if (minuten === 0) {
    return `${prefix}${uren}u`;
  } else {
    return `${prefix}${uren}u ${minuten}m`;
  }
};

/**
 * Check if entry can be modified
 * @returns {boolean}
 */
Overuren.prototype.canBeModified = function() {
  return this.status === 'CONCEPT' || this.status === 'AFGEKEURD';
};

export default Overuren;
