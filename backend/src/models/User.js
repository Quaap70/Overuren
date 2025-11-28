import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 255]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  role: {
    type: DataTypes.ENUM('HR', 'MEDEWERKER'),
    allowNull: false,
    defaultValue: 'MEDEWERKER'
  },
  voornaam: {
    type: DataTypes.STRING,
    allowNull: false
  },
  achternaam: {
    type: DataTypes.STRING,
    allowNull: false
  },
  afdeling: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startdatum: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Plain text password
 * @returns {Promise<boolean>}
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get user's full name
 * @returns {string}
 */
User.prototype.getFullName = function() {
  return `${this.voornaam} ${this.achternaam}`;
};

/**
 * Get safe user object (without password)
 * @returns {Object}
 */
User.prototype.toSafeObject = function() {
  const { password, ...safeUser } = this.toJSON();
  return safeUser;
};

export default User;
