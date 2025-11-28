import User from './User.js';
import Overuren from './Overuren.js';
import Saldo from './Saldo.js';
import Notificatie from './Notificatie.js';

// Define relationships

// User heeft vele Overuren
User.hasMany(Overuren, {
  foreignKey: 'user_id',
  as: 'overuren'
});
Overuren.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'medewerker'
});

// User heeft vele Saldi (per jaar)
User.hasMany(Saldo, {
  foreignKey: 'user_id',
  as: 'saldi'
});
Saldo.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'medewerker'
});

// User heeft vele Notificaties
User.hasMany(Notificatie, {
  foreignKey: 'user_id',
  as: 'notificaties'
});
Notificatie.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'ontvanger'
});

// Overuren goedgekeurd door User (HR)
Overuren.belongsTo(User, {
  foreignKey: 'goedgekeurd_door',
  as: 'goedkeurder'
});

export {
  User,
  Overuren,
  Saldo,
  Notificatie
};
