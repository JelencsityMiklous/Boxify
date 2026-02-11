const { Items } = require('../models/index');
const router = require('express').Router();const { generateToken, authenticate } = require('../middlewares/auth.middleware');

router.get('/', async (_req, res) => {
    const items = await Items.findAll();
    res.status(200).json(items);
});


router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const item = await Items.create({ name, description });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:id', async (req, res) =>  {
    const id = req.params.id;
    const item = await Items.findByPk(id);
    if (item) {
        res.status(200).json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const { name, description } = req.body;
    const item = await Items.findByPk(id);
    if (item) {
        item.name = name;
        item.description = description;
        await item.save();
        res.status(200).json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const item = await Items.findByPk(id);
    if (item) {
        await item.destroy();
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

router.post('/:id/upload_image', async (req, res) => {
})


module.exports = router;