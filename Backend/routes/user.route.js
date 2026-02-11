const { User, operatorMap } = require('../models/index');
const router = require('express').Router();const { generateToken, authenticate } = require('../middlewares/auth.middleware');
router.get('/', async (_req, res) => {
    const users = await User.findAll();
    res.status(200).json(users);
});

router.get('/:id', async (req, res) =>  {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

router.get('/:field/:op/:value',authenticate, async (req, res) => {

    try {
        const { field, op, value } = req.params;
        
        if(!operatorMap[op]){
            return res.status(400).json({ error: 'Invalid operator' });
        }

        const where = {
            [field]: { [operatorMap[op]]: op ==='lk' ? `%${value}%` : value }
        };

        const users = await User.findAll({ where });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
    } else {
        const updatedUser = await user.update(req.body);
        res.status(200).json(updatedUser);
    }
});

router.post('/register', async (req, res) => {
    try {


    const { name, email, password, confirm } = req.body;
    const user = await User.create({ name, email, password, confirm });
    res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.scope('withPassword').findOne({ where: { email, password } });
        
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
        } 

        const ok = await user.comparePassword(password);
        
        if (!ok) {
            res.status(401).json({ message: 'Invalid credentials' });
        }

        await user.update({ last: new Date() });

        const token = generateToken(user);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
    } else {

        await user.destroy();
        res.status(200).send();
    }
});



module.exports = router;
