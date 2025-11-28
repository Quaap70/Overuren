import validator from 'validator';

/**
 * Validate login input
 */
export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push({ field: 'username', message: 'Gebruikersnaam is verplicht' });
  }

  if (!password || password.length === 0) {
    errors.push({ field: 'password', message: 'Wachtwoord is verplicht' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate user creation
 */
export const validateUserCreation = (req, res, next) => {
  const { username, password, email, voornaam, achternaam, role } = req.body;
  const errors = [];

  // Username
  if (!username || username.trim().length < 3) {
    errors.push({ field: 'username', message: 'Gebruikersnaam moet minimaal 3 karakters zijn' });
  }

  // Password
  if (!password || password.length < 8) {
    errors.push({ field: 'password', message: 'Wachtwoord moet minimaal 8 karakters zijn' });
  } else {
    if (!/\d/.test(password)) {
      errors.push({ field: 'password', message: 'Wachtwoord moet minimaal 1 cijfer bevatten' });
    }
    if (!/[A-Z]/.test(password)) {
      errors.push({ field: 'password', message: 'Wachtwoord moet minimaal 1 hoofdletter bevatten' });
    }
  }

  // Email
  if (!email || !validator.isEmail(email)) {
    errors.push({ field: 'email', message: 'Ongeldig e-mailadres' });
  }

  // Voornaam
  if (!voornaam || voornaam.trim().length === 0) {
    errors.push({ field: 'voornaam', message: 'Voornaam is verplicht' });
  }

  // Achternaam
  if (!achternaam || achternaam.trim().length === 0) {
    errors.push({ field: 'achternaam', message: 'Achternaam is verplicht' });
  }

  // Role
  if (role && !['HR', 'MEDEWERKER'].includes(role)) {
    errors.push({ field: 'role', message: 'Ongeldige rol' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate overuren input
 */
export const validateOveruren = (req, res, next) => {
  const { datum, minuten, reden } = req.body;
  const errors = [];

  // Datum
  if (!datum) {
    errors.push({ field: 'datum', message: 'Datum is verplicht' });
  } else {
    const datumDate = new Date(datum);
    if (isNaN(datumDate.getTime())) {
      errors.push({ field: 'datum', message: 'Ongeldige datum' });
    }
  }

  // Minuten
  if (minuten === undefined || minuten === null) {
    errors.push({ field: 'minuten', message: 'Minuten is verplicht' });
  } else {
    if (minuten % 10 !== 0) {
      errors.push({ field: 'minuten', message: 'Minuten moeten in stappen van 10 zijn' });
    }
    if (Math.abs(minuten) > 720) {
      errors.push({ field: 'minuten', message: 'Maximaal 12 uur per dag toegestaan' });
    }
  }

  // Reden (verplicht bij meer dan 2 uur)
  if (Math.abs(minuten) > 120 && (!reden || reden.trim().length === 0)) {
    errors.push({ field: 'reden', message: 'Reden is verplicht bij meer dan 2 uur' });
  }

  // Sanitize reden
  if (reden) {
    req.body.reden = validator.escape(reden.trim());
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate saldo adjustment
 */
export const validateSaldoAdjustment = (req, res, next) => {
  const { minuten, reden } = req.body;
  const errors = [];

  if (minuten === undefined || minuten === null) {
    errors.push({ field: 'minuten', message: 'Minuten is verplicht' });
  }

  if (!reden || reden.trim().length === 0) {
    errors.push({ field: 'reden', message: 'Reden is verplicht voor saldo aanpassing' });
  }

  // Sanitize reden
  if (reden) {
    req.body.reden = validator.escape(reden.trim());
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
