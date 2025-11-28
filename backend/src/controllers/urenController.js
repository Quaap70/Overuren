import { Overuren, Saldo, User, Notificatie } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Get week number from date
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Get or create saldo for user and year
 */
const getOrCreateSaldo = async (userId, jaar) => {
  let [saldo, created] = await Saldo.findOrCreate({
    where: { user_id: userId, jaar },
    defaults: {
      user_id: userId,
      jaar,
      overgedragen_saldo: 0,
      gebruikt_saldo: 0,
      huidig_saldo: 0
    }
  });
  return saldo;
};

/**
 * Recalculate saldo for user
 */
const recalculateSaldo = async (userId, jaar) => {
  const goedgekeurdeUren = await Overuren.findAll({
    where: {
      user_id: userId,
      jaar,
      status: 'GOEDGEKEURD'
    }
  });

  const totaalMinuten = goedgekeurdeUren.reduce((sum, entry) => sum + entry.minuten, 0);

  const saldo = await getOrCreateSaldo(userId, jaar);
  saldo.huidig_saldo = saldo.overgedragen_saldo + totaalMinuten - saldo.gebruikt_saldo;
  saldo.laatst_bijgewerkt = new Date();
  await saldo.save();

  return saldo;
};

/**
 * Get current user's saldo
 * GET /api/uren/mijn-saldo
 */
export const getMijnSaldo = async (req, res, next) => {
  try {
    const huidigJaar = new Date().getFullYear();
    const saldo = await getOrCreateSaldo(req.user.id, huidigJaar);

    res.json({
      jaar: huidigJaar,
      saldo_minuten: saldo.huidig_saldo,
      formatted: saldo.getFormattedSaldo(),
      overgedragen: saldo.overgedragen_saldo,
      gebruikt: saldo.gebruikt_saldo,
      laatst_bijgewerkt: saldo.laatst_bijgewerkt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's overuren history
 * GET /api/uren/mijn-geschiedenis
 */
export const getMijnGeschiedenis = async (req, res, next) => {
  try {
    const { jaar, maand, status, limit = 50, offset = 0 } = req.query;

    const where = { user_id: req.user.id };

    if (jaar) {
      where.jaar = jaar;
    }

    if (maand) {
      // Filter by month (1-12)
      where.datum = {
        [Op.and]: [
          sequelize.where(sequelize.fn('strftime', '%m', sequelize.col('datum')), maand.toString().padStart(2, '0'))
        ]
      };
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Overuren.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'goedkeurder',
          attributes: ['id', 'voornaam', 'achternaam']
        }
      ],
      order: [['datum', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      uren: rows.map(u => ({
        id: u.id,
        datum: u.datum,
        minuten: u.minuten,
        formatted: u.getFormattedTime(),
        reden: u.reden,
        status: u.status,
        kan_wijzigen: u.canBeModified(),
        afkeur_reden: u.afkeur_reden,
        goedgekeurd_op: u.goedgekeurd_op,
        goedgekeurd_door: u.goedkeurder ? u.goedkeurder.getFullName() : null
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit new overuren entry
 * POST /api/uren/indienen
 */
export const indienen = async (req, res, next) => {
  try {
    const { datum, minuten, reden, status = 'INGEDIEND' } = req.body;

    const date = new Date(datum);
    const weekNummer = getWeekNumber(date);
    const jaar = date.getFullYear();

    // Check if entry already exists for this date
    const bestaand = await Overuren.findOne({
      where: {
        user_id: req.user.id,
        datum
      }
    });

    if (bestaand) {
      return res.status(409).json({
        error: 'Je hebt al een invoer voor deze datum'
      });
    }

    // Create entry
    const overuren = await Overuren.create({
      user_id: req.user.id,
      datum,
      minuten,
      reden,
      week_nummer: weekNummer,
      jaar,
      status,
      ingediend_op: status === 'INGEDIEND' ? new Date() : null
    });

    // If ingediend, notify HR
    if (status === 'INGEDIEND') {
      // Find all HR users
      const hrUsers = await User.findAll({
        where: { role: 'HR', is_active: true }
      });

      // Create notifications for HR
      for (const hr of hrUsers) {
        await Notificatie.create({
          user_id: hr.id,
          type: 'INFO',
          titel: 'Nieuwe overuren ingediend',
          bericht: `${req.user.voornaam} ${req.user.achternaam} heeft overuren ingediend voor ${datum}`,
          gerelateerd_id: overuren.id
        });
      }
    }

    res.status(201).json({
      message: status === 'INGEDIEND' ? 'Uren succesvol ingediend' : 'Uren opgeslagen als concept',
      overuren: {
        id: overuren.id,
        datum: overuren.datum,
        minuten: overuren.minuten,
        formatted: overuren.getFormattedTime(),
        reden: overuren.reden,
        status: overuren.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update overuren entry (only CONCEPT or AFGEKEURD)
 * PUT /api/uren/:id
 */
export const wijzigen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { minuten, reden, status } = req.body;

    const overuren = await Overuren.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!overuren) {
      return res.status(404).json({ error: 'Overuren niet gevonden' });
    }

    if (!overuren.canBeModified()) {
      return res.status(403).json({
        error: 'Alleen concept of afgekeurde uren kunnen worden gewijzigd'
      });
    }

    // Update fields
    if (minuten !== undefined) overuren.minuten = minuten;
    if (reden !== undefined) overuren.reden = reden;
    if (status !== undefined) {
      overuren.status = status;
      if (status === 'INGEDIEND') {
        overuren.ingediend_op = new Date();

        // Notify HR
        const hrUsers = await User.findAll({
          where: { role: 'HR', is_active: true }
        });

        for (const hr of hrUsers) {
          await Notificatie.create({
            user_id: hr.id,
            type: 'INFO',
            titel: 'Overuren opnieuw ingediend',
            bericht: `${req.user.voornaam} ${req.user.achternaam} heeft overuren opnieuw ingediend voor ${overuren.datum}`,
            gerelateerd_id: overuren.id
          });
        }
      }
    }

    await overuren.save();

    res.json({
      message: 'Uren succesvol bijgewerkt',
      overuren: {
        id: overuren.id,
        datum: overuren.datum,
        minuten: overuren.minuten,
        formatted: overuren.getFormattedTime(),
        reden: overuren.reden,
        status: overuren.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete overuren entry (only CONCEPT)
 * DELETE /api/uren/:id
 */
export const verwijderen = async (req, res, next) => {
  try {
    const { id } = req.params;

    const overuren = await Overuren.findOne({
      where: {
        id,
        user_id: req.user.id,
        status: 'CONCEPT'
      }
    });

    if (!overuren) {
      return res.status(404).json({
        error: 'Overuren niet gevonden of kan niet worden verwijderd'
      });
    }

    await overuren.destroy();

    res.json({ message: 'Uren succesvol verwijderd' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get week overview
 * GET /api/uren/week/:jaar/:weeknummer
 */
export const getWeekOverzicht = async (req, res, next) => {
  try {
    const { jaar, weeknummer } = req.params;

    const uren = await Overuren.findAll({
      where: {
        user_id: req.user.id,
        jaar: parseInt(jaar),
        week_nummer: parseInt(weeknummer)
      },
      order: [['datum', 'ASC']]
    });

    res.json({
      jaar: parseInt(jaar),
      week: parseInt(weeknummer),
      uren: uren.map(u => ({
        id: u.id,
        datum: u.datum,
        minuten: u.minuten,
        formatted: u.getFormattedTime(),
        reden: u.reden,
        status: u.status,
        kan_wijzigen: u.canBeModified()
      })),
      totaal_minuten: uren.reduce((sum, u) => sum + u.minuten, 0)
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMijnSaldo,
  getMijnGeschiedenis,
  indienen,
  wijzigen,
  verwijderen,
  getWeekOverzicht
};
