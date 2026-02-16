const router = require('express').Router();
const { User, operatorMap } = require('../models/index');

// RUGALMAS import: kezeli a default és a named exportot is
const authMw = require('../middlewares/auth.middleware');

const generateToken =
  authMw.generateToken ||
  authMw.signToken ||
  authMw.jwtSign ||
  authMw.token ||
  null;

const authenticateRaw =
  authMw.authenticate ||
  authMw.auth ||
  authMw.verifyToken ||
  (typeof authMw === 'function' ? authMw : null);

// Ha nem function, ne crasheljen induláskor: adjon normális hibát requestnél
const authenticate = (typeof authenticateRaw === 'function')
  ? authenticateRaw
  : (_req, res) => res.status(500).json({
      message: 'authenticate middleware nincs jól exportálva (nem function)',
      hint: 'Ellenőrizd: Backend/middlewares/auth.middleware.js exportját',
      gotType: typeof authenticateRaw,
    });

/**
 * USERS - list
 */
router.get('/', async (_req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * USERS - get by id
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) return res.status(200).json(user);
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * USERS - search (külön útvonal, hogy ne ütközzön /:id-vel)
 * GET /search/:field/:op/:value
 */
router.get('/search/:field/:op/:value', authenticate, async (req, res) => {
  try {
    const { field, op, value } = req.params;

    if (!operatorMap || !operatorMap[op]) {
      return res.status(400).json({ error: 'Invalid operator' });
    }

    const where = {
      [field]: { [operatorMap[op]]: op === 'lk' ? `%${value}%` : value },
    };

    const users = await User.findAll({ where });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * USERS - update
 */
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedUser = await user.update(req.body);
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AUTH - register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirm } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password kötelező' });
    }
    if (confirm != null && password !== confirm) {
      return res.status(400).json({ message: 'A jelszavak nem egyeznek' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Ezzel az emaillel már létezik felhasználó' });
    }

    // Feltételezzük, hogy a model hookolja/hash-eli (ha nem, szólj és megírom a user.model.js-t is)
    const user = await User.create({ name, email, password });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AUTH - login
 */
router.post('/login', async (req, res) => {
  try {
    if (typeof generateToken !== 'function') {
      return res.status(500).json({
        message: 'generateToken nincs jól exportálva (nem function)',
        hint: 'Ellenőrizd: Backend/middlewares/auth.middleware.js',
        gotType: typeof generateToken,
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email és password kötelező' });
    }

    // ne keress password-del a where-ben
    const user = User.scope
      ? await User.scope('withPassword').findOne({ where: { email } })
      : await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (typeof user.comparePassword !== 'function') {
      return res.status(500).json({ message: 'comparePassword nincs implementálva a User modellen' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    await user.update({ last: new Date() });

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AUTH - me
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const userId = req.user.id || req.user.userId || req.user.sub;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * USERS - delete
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    return res.status(200).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
