const { Box, operatorMap } = require('../models/index');
const router = require('express').Router();const { generateToken, authenticate } = require('../middlewares/auth.middleware');

router.get('/', async (_req, res) => {
    const boxes = await Box.findAll();
    res.status(200).json(boxes);
});


router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const box = await Box.create({ name, description });
        res.status(201).json(box);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:id', async (req, res) =>  {
    const id = req.params.id;
    const box = await Box.findByPk(id);
    if (box) {
        res.status(200).json(box);
    } else {
        res.status(404).json({ message: 'Box not found' });
    }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const { name, description } = req.body;
    const box = await Box.findByPk(id);
    if (box) {
        box.name = name;
        box.description = description;
        await box.save();
        res.status(200).json(box);
    } else {
        res.status(404).json({ message: 'Box not found' });
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const box = await Box.findByPk(id);
    if (box) {
        await box.destroy();
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Box not found' });
    }
});

router.post('/:id/empty', async (req, res) => {
    const id = req.params.id;
    const box = await Box.findByPk(id);
    if (box) {
        box.name = '';
        box.description = '';
        await box.save();
        res.status(200).json(box);
    } else {
        res.status(404).json({ message: 'Box not found' });
    }
});

router.get('/:id/contents', async (req, res) => {
    const id = req.params.id;
    const box = await Box.findByPk(id);
    if (box) {
        const contents = await box.getContents();
        res.status(200).json(contents);
    } else {
        res.status(404).json({ message: 'Box not found' });
    }
});


module.exports = router;