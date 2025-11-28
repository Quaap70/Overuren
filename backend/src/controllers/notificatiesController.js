import { Notificatie } from '../models/index.js';

/**
 * Get user's notifications
 * GET /api/notificaties
 */
export const getNotificaties = async (req, res, next) => {
  try {
    const { gelezen, limit = 20, offset = 0 } = req.query;

    const where = { user_id: req.user.id };

    if (gelezen !== undefined) {
      where.gelezen = gelezen === 'true';
    }

    const { count, rows } = await Notificatie.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      ongelezen: await Notificatie.count({
        where: { user_id: req.user.id, gelezen: false }
      }),
      notificaties: rows.map(n => ({
        id: n.id,
        type: n.type,
        titel: n.titel,
        bericht: n.bericht,
        icon: n.getIcon(),
        gelezen: n.gelezen,
        gerelateerd_id: n.gerelateerd_id,
        created_at: n.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PUT /api/notificaties/:id/gelezen
 */
export const markeerGelezen = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificatie = await Notificatie.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!notificatie) {
      return res.status(404).json({ error: 'Notificatie niet gevonden' });
    }

    await notificatie.markAsRead();

    res.json({
      message: 'Notificatie gemarkeerd als gelezen',
      notificatie: {
        id: notificatie.id,
        gelezen: notificatie.gelezen
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notificaties/alle-gelezen
 */
export const markeerAlleGelezen = async (req, res, next) => {
  try {
    await Notificatie.update(
      { gelezen: true },
      {
        where: {
          user_id: req.user.id,
          gelezen: false
        }
      }
    );

    res.json({ message: 'Alle notificaties gemarkeerd als gelezen' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/notificaties/:id
 */
export const verwijderen = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificatie = await Notificatie.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!notificatie) {
      return res.status(404).json({ error: 'Notificatie niet gevonden' });
    }

    await notificatie.destroy();

    res.json({ message: 'Notificatie verwijderd' });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotificaties,
  markeerGelezen,
  markeerAlleGelezen,
  verwijderen
};
