const { User, operatorMap } = require('../models/index');
const router = require('express').Router();const { generateToken, authenticate } = require('../middlewares/auth.middleware');
const { Item, Box } = require('../models/index');
const { Op } = require('sequelize');
router.get('/', async (_req, res) => {
    const users = await User.findAll();
    res.status(200).json(users);
});

router.get('/items', async (req, res) => {
    try {
        const q = (req.query.query || '').trim();
        if (!q) return res.status(400).json({ message: 'query parameter is required' });
        const items = await Item.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.substring]: q } },
                    { description: { [Op.substring]: q } }
                ]
            },
            include: [{ model: Box, required: false }]
        });
        res.status(200).json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
