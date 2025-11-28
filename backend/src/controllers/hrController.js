import { User, Overuren, Saldo, Notificatie } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

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
 * Get HR dashboard statistics
 * GET /api/hr/dashboard
 */
export const getDashboard = async (req, res, next) => {
  try {
    const huidigJaar = new Date().getFullYear();

    // Count pending approvals
    const teBeoordelenCount = await Overuren.count({
      where: { status: 'INGEDIEND' }
    });

    // This week submissions
    const dezeWeekStart = new Date();
    dezeWeekStart.setDate(dezeWeekStart.getDate() - dezeWeekStart.getDay() + 1);
    dezeWeekStart.setHours(0, 0, 0, 0);

    const dezeWeekCount = await Overuren.count({
      where: {
        ingediend_op: {
          [Op.gte]: dezeWeekStart
        }
      }
    });

    // Active employees
    const medewerkersCount = await User.count({
      where: {
        role: 'MEDEWERKER',
        is_active: true
      }
    });

    // Total hours in system
    const totaalUren = await Overuren.findAll({
      where: {
        status: 'GOEDGEKEURD',
        jaar: huidigJaar
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('minuten')), 'totaal']
      ]
    });

    const totaalMinuten = totaalUren[0]?.dataValues?.totaal || 0;

    // Recent submissions (last 10)
    const recenteIndieningen = await Overuren.findAll({
      where: { status: 'INGEDIEND' },
      include: [
        {
          model: User,
          as: 'medewerker',
          attributes: ['id', 'voornaam', 'achternaam']
        }
      ],
      order: [['ingediend_op', 'DESC']],
      limit: 10
    });

    // Last 12 weeks trend
    const twaalfWekenGeleden = new Date();
    twaalfWekenGeleden.setDate(twaalfWekenGeleden.getDate() - 84);

    const trendData = await Overuren.findAll({
      where: {
        status: 'GOEDGEKEURD',
        datum: {
          [Op.gte]: twaalfWekenGeleden
        }
      },
      attributes: [
        'week_nummer',
        'jaar',
        [sequelize.fn('SUM', sequelize.col('minuten')), 'totaal']
      ],
      group: ['week_nummer', 'jaar'],
      order: [['jaar', 'ASC'], ['week_nummer', 'ASC']]
    });

    res.json({
      statistieken: {
        te_beoordelen: teBeoordelenCount,
        deze_week: dezeWeekCount,
        medewerkers: medewerkersCount,
        totaal_uren: Math.round(totaalMinuten / 60)
      },
      recente_indieningen: recenteIndieningen.map(o => ({
        id: o.id,
        medewerker: o.medewerker.getFullName(),
        medewerker_id: o.medewerker.id,
        datum: o.datum,
        minuten: o.minuten,
        formatted: o.getFormattedTime(),
        reden: o.reden,
        ingediend_op: o.ingediend_op
      })),
      trend: trendData.map(t => ({
        week: t.week_nummer,
        jaar: t.jaar,
        uren: Math.round(t.dataValues.totaal / 60)
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all employees
 * GET /api/hr/medewerkers
 */
export const getMedewerkers = async (req, res, next) => {
  try {
    const { actief, zoek } = req.query;
    const huidigJaar = new Date().getFullYear();

    const where = { role: 'MEDEWERKER' };

    if (actief !== undefined) {
      where.is_active = actief === 'true';
    }

    if (zoek) {
      where[Op.or] = [
        { voornaam: { [Op.like]: `%${zoek}%` } },
        { achternaam: { [Op.like]: `%${zoek}%` } },
        { email: { [Op.like]: `%${zoek}%` } }
      ];
    }

    const medewerkers = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Saldo,
          as: 'saldi',
          where: { jaar: huidigJaar },
          required: false
        }
      ],
      order: [['achternaam', 'ASC'], ['voornaam', 'ASC']]
    });

    res.json({
      medewerkers: medewerkers.map(m => ({
        id: m.id,
        username: m.username,
        email: m.email,
        voornaam: m.voornaam,
        achternaam: m.achternaam,
        naam: m.getFullName(),
        afdeling: m.afdeling,
        startdatum: m.startdatum,
        is_active: m.is_active,
        saldo: m.saldi[0] ? {
          minuten: m.saldi[0].huidig_saldo,
          formatted: m.saldi[0].getFormattedSaldo()
        } : null
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new employee
 * POST /api/hr/medewerker
 */
export const createMedewerker = async (req, res, next) => {
  try {
    const { username, password, email, voornaam, achternaam, afdeling, startdatum } = req.body;

    const medewerker = await User.create({
      username,
      password,
      email,
      voornaam,
      achternaam,
      afdeling,
      startdatum,
      role: 'MEDEWERKER',
      is_active: true
    });

    // Create initial saldo for current year
    const huidigJaar = new Date().getFullYear();
    await getOrCreateSaldo(medewerker.id, huidigJaar);

    res.status(201).json({
      message: 'Medewerker succesvol aangemaakt',
      medewerker: medewerker.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee
 * PUT /api/hr/medewerker/:id
 */
export const updateMedewerker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, voornaam, achternaam, afdeling, startdatum, is_active } = req.body;

    const medewerker = await User.findByPk(id);

    if (!medewerker || medewerker.role !== 'MEDEWERKER') {
      return res.status(404).json({ error: 'Medewerker niet gevonden' });
    }

    // Update fields
    if (email) medewerker.email = email;
    if (voornaam) medewerker.voornaam = voornaam;
    if (achternaam) medewerker.achternaam = achternaam;
    if (afdeling !== undefined) medewerker.afdeling = afdeling;
    if (startdatum !== undefined) medewerker.startdatum = startdatum;
    if (is_active !== undefined) medewerker.is_active = is_active;

    await medewerker.save();

    res.json({
      message: 'Medewerker succesvol bijgewerkt',
      medewerker: medewerker.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get entries to review
 * GET /api/hr/te-beoordelen
 */
export const getTeBeoordelen = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { count, rows } = await Overuren.findAndCountAll({
      where: { status: 'INGEDIEND' },
      include: [
        {
          model: User,
          as: 'medewerker',
          attributes: ['id', 'voornaam', 'achternaam', 'afdeling']
        }
      ],
      order: [['ingediend_op', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      indieningen: rows.map(o => ({
        id: o.id,
        medewerker: {
          id: o.medewerker.id,
          naam: o.medewerker.getFullName(),
          afdeling: o.medewerker.afdeling
        },
        datum: o.datum,
        minuten: o.minuten,
        formatted: o.getFormattedTime(),
        reden: o.reden,
        week_nummer: o.week_nummer,
        jaar: o.jaar,
        ingediend_op: o.ingediend_op
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve overuren entry
 * POST /api/hr/uren/:id/goedkeuren
 */
export const goedkeuren = async (req, res, next) => {
  try {
    const { id } = req.params;

    const overuren = await Overuren.findByPk(id, {
      include: [
        {
          model: User,
          as: 'medewerker',
          attributes: ['id', 'voornaam', 'achternaam']
        }
      ]
    });

    if (!overuren) {
      return res.status(404).json({ error: 'Overuren niet gevonden' });
    }

    if (overuren.status !== 'INGEDIEND') {
      return res.status(400).json({
        error: 'Alleen ingediende uren kunnen worden goedgekeurd'
      });
    }

    // Update status
    overuren.status = 'GOEDGEKEURD';
    overuren.goedgekeurd_op = new Date();
    overuren.goedgekeurd_door = req.user.id;
    overuren.afkeur_reden = null;
    await overuren.save();

    // Recalculate saldo
    const saldo = await recalculateSaldo(overuren.user_id, overuren.jaar);

    // Notify employee
    await Notificatie.create({
      user_id: overuren.user_id,
      type: 'GOEDKEURING',
      titel: 'Overuren goedgekeurd',
      bericht: `Je overuren van ${overuren.datum} (${overuren.getFormattedTime()}) zijn goedgekeurd. Je nieuwe saldo is ${saldo.getFormattedSaldo()}.`,
      gerelateerd_id: overuren.id
    });

    res.json({
      message: 'Uren succesvol goedgekeurd',
      overuren: {
        id: overuren.id,
        status: overuren.status
      },
      nieuw_saldo: {
        minuten: saldo.huidig_saldo,
        formatted: saldo.getFormattedSaldo()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject overuren entry
 * POST /api/hr/uren/:id/afkeuren
 */
export const afkeuren = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reden } = req.body;

    if (!reden || reden.trim().length === 0) {
      return res.status(400).json({
        error: 'Reden voor afkeuring is verplicht'
      });
    }

    const overuren = await Overuren.findByPk(id, {
      include: [
        {
          model: User,
          as: 'medewerker',
          attributes: ['id', 'voornaam', 'achternaam']
        }
      ]
    });

    if (!overuren) {
      return res.status(404).json({ error: 'Overuren niet gevonden' });
    }

    if (overuren.status !== 'INGEDIEND') {
      return res.status(400).json({
        error: 'Alleen ingediende uren kunnen worden afgekeurd'
      });
    }

    // Update status
    overuren.status = 'AFGEKEURD';
    overuren.afkeur_reden = reden;
    await overuren.save();

    // Notify employee
    await Notificatie.create({
      user_id: overuren.user_id,
      type: 'AFKEURING',
      titel: 'Overuren afgekeurd',
      bericht: `Je overuren van ${overuren.datum} (${overuren.getFormattedTime()}) zijn afgekeurd. Reden: ${reden}`,
      gerelateerd_id: overuren.id
    });

    res.json({
      message: 'Uren afgekeurd',
      overuren: {
        id: overuren.id,
        status: overuren.status,
        afkeur_reden: overuren.afkeur_reden
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust employee saldo manually
 * POST /api/hr/saldo/:userId/aanpassen
 */
export const saldoAanpassen = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { minuten, reden } = req.body;
    const huidigJaar = new Date().getFullYear();

    const medewerker = await User.findByPk(userId);

    if (!medewerker || medewerker.role !== 'MEDEWERKER') {
      return res.status(404).json({ error: 'Medewerker niet gevonden' });
    }

    const saldo = await getOrCreateSaldo(userId, huidigJaar);

    // Adjust saldo
    saldo.huidig_saldo += minuten;
    saldo.laatst_bijgewerkt = new Date();
    await saldo.save();

    // Notify employee
    const prefix = minuten > 0 ? '+' : '';
    await Notificatie.create({
      user_id: userId,
      type: 'SALDO_WIJZIGING',
      titel: 'Saldo aangepast door HR',
      bericht: `Je saldo is met ${prefix}${Math.floor(Math.abs(minuten) / 60)}u ${Math.abs(minuten) % 60}m aangepast. Reden: ${reden}. Je nieuwe saldo is ${saldo.getFormattedSaldo()}.`,
      gerelateerd_id: null
    });

    res.json({
      message: 'Saldo succesvol aangepast',
      saldo: {
        minuten: saldo.huidig_saldo,
        formatted: saldo.getFormattedSaldo()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee details with history
 * GET /api/hr/medewerker/:id
 */
export const getMedewerkerDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const huidigJaar = new Date().getFullYear();

    const medewerker = await User.findOne({
      where: { id, role: 'MEDEWERKER' },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Saldo,
          as: 'saldi',
          where: { jaar: huidigJaar },
          required: false
        },
        {
          model: Overuren,
          as: 'overuren',
          where: { jaar: huidigJaar },
          required: false,
          order: [['datum', 'DESC']],
          limit: 20
        }
      ]
    });

    if (!medewerker) {
      return res.status(404).json({ error: 'Medewerker niet gevonden' });
    }

    res.json({
      medewerker: {
        ...medewerker.toSafeObject(),
        saldo: medewerker.saldi[0] ? {
          minuten: medewerker.saldi[0].huidig_saldo,
          formatted: medewerker.saldi[0].getFormattedSaldo(),
          overgedragen: medewerker.saldi[0].overgedragen_saldo,
          gebruikt: medewerker.saldi[0].gebruikt_saldo
        } : null
      },
      recente_uren: medewerker.overuren.map(o => ({
        id: o.id,
        datum: o.datum,
        minuten: o.minuten,
        formatted: o.getFormattedTime(),
        reden: o.reden,
        status: o.status
      }))
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboard,
  getMedewerkers,
  createMedewerker,
  updateMedewerker,
  getTeBeoordelen,
  goedkeuren,
  afkeuren,
  saldoAanpassen,
  getMedewerkerDetail
};
