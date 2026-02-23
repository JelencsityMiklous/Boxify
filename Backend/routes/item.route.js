const { Item } = require('../models/index');
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, async (req, res) => {
    try {
        const items = await Item.findAll({ where: { userId: req.user.id } });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const { name, description, category, lengthCm, widthCm, heightCm, weightKg, note } = req.body;
        const item = await Item.create({
            userId: req.user.id,
            name,
            description,
            category,
            lengthCm,
            widthCm,
            heightCm,
            weightKg,
            note
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const item = await Item.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (item) res.status(200).json(item);
        else res.status(404).json({ message: 'Item not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', authenticate, async (req, res) => {
    try {
        const item = await Item.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const { name, description, category, lengthCm, widthCm, heightCm, weightKg, note } = req.body;
        await item.update({ name, description, category, lengthCm, widthCm, heightCm, weightKg, note });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const item = await Item.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!item) return res.status(404).json({ message: 'Item not found' });

        await item.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/upload-image', authenticate, async (req, res) => {
    try {
        const item = await Item.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        // TODO: image upload logika
        res.status(200).json({ message: 'OK' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;