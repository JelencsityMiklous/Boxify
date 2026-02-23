const router = require('express').Router();
const { User } = require('../models/index');
const { generateToken, authenticate } = require('../middlewares/auth.middleware');

// AUTH - register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirm } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email, password kötelező' });

    if (confirm != null && password !== confirm)
      return res.status(400).json({ message: 'A jelszavak nem egyeznek' });

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(409).json({ message: 'Ezzel az emaillel már létezik felhasználó' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// AUTH - login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'email és password kötelező' });

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: 'Hibás email vagy jelszó' });

    const ok = await user.comparePassword(password);
    if (!ok)
      return res.status(401).json({ message: 'Hibás email vagy jelszó' });

    await user.update({ lastLoginAt: new Date() });

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// AUTH - me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;