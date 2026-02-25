const router = require('express').Router();
const { User } = require('../models/index');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

const adminOnly = [authenticate, requireAdmin];

router.get('/', ...adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt', 'lastLoginAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Szerver hiba' });
  }
});

router.delete('/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Nem található' });

    if (user.id === req.user.id) {
      return res.status(403).json({ error: 'Nem törölheted magad' });
    }

    await user.destroy();
    res.json({ message: 'Törölve' });
  } catch (err) {
    res.status(500).json({ error: 'Törlés sikertelen' });
  }
});

router.put('/:id/role', ...adminOnly, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Csak user vagy admin lehet' });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Nem található' });

    if (user.id === req.user.id) {
      return res.status(403).json({ error: 'Nem módosíthatod a saját szerepkörödet' });
    }

    user.role = role;
    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Módosítás sikertelen' });
  }
});

module.exports = router;