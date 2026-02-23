const { Box, Item, BoxItem } = require('../models');

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function volumeCm3({ lengthCm, widthCm, heightCm }) {
  return num(lengthCm) * num(widthCm) * num(heightCm);
}

function rotationsFit(item, box) {
  const dims = [num(item.lengthCm), num(item.widthCm), num(item.heightCm)];
  const boxDims = [num(box.lengthCm), num(box.widthCm), num(box.heightCm)];

  const perms = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2],
    [1, 2, 0], [2, 0, 1], [2, 1, 0],
  ];

  return perms.some(([a, b, c]) =>
    dims[a] <= boxDims[0] && dims[b] <= boxDims[1] && dims[c] <= boxDims[2]
  );
}

async function computeBoxStats(boxId) {
  const box = await Box.findByPk(boxId);
  if (!box) return null;

  const rows = await BoxItem.findAll({
    where: { boxId },
    include: [{ model: Item }]
  });

  const boxVolume = volumeCm3(box);
  let usedVolume = 0;
  let usedWeight = 0;

  for (const r of rows) {
    const q = num(r.quantity);
    const item = r.Item;
    if (item) {
      usedVolume += volumeCm3(item) * q;
      usedWeight += num(item.weightKg) * q;
    }
  }

  const volumeFillPercent = boxVolume > 0 ? Math.round((usedVolume / boxVolume) * 100) : 0;
  const weightFillPercent = num(box.maxWeightKg) > 0 ? Math.round((usedWeight / num(box.maxWeightKg)) * 100) : 0;

  return { boxVolume, usedVolume, usedWeight, volumeFillPercent, weightFillPercent };
}

async function canFit({ boxId, itemId, quantity }) {
  const q = Math.max(1, Math.floor(num(quantity) || 1));
  const [box, item] = await Promise.all([Box.findByPk(boxId), Item.findByPk(itemId)]);
  if (!box) return { ok: false, reasons: ['BOX_NOT_FOUND'] };
  if (!item) return { ok: false, reasons: ['ITEM_NOT_FOUND'] };

  const stats = await computeBoxStats(boxId);
  const addVol = volumeCm3(item) * q;
  const addW = num(item.weightKg) * q;

  const weightOk = stats.usedWeight + addW <= num(box.maxWeightKg);
  const volOk = stats.usedVolume + addVol <= stats.boxVolume;
  const sizeOk = rotationsFit(item, box);

  const reasons = [];
  if (!weightOk) reasons.push('WEIGHT');
  if (!volOk) reasons.push('VOLUME');
  if (!sizeOk) reasons.push('SIZE');

  return {
    ok: reasons.length === 0,
    reasons,
    statsAfter: {
      ...stats,
      usedVolume: stats.usedVolume + addVol,
      usedWeight: stats.usedWeight + addW,
      volumeFillPercent: stats.boxVolume > 0 ? Math.round(((stats.usedVolume + addVol) / stats.boxVolume) * 100) : 0,
      weightFillPercent: num(box.maxWeightKg) > 0 ? Math.round(((stats.usedWeight + addW) / num(box.maxWeightKg)) * 100) : 0,
    },
  };
}

module.exports = { volumeCm3, rotationsFit, computeBoxStats, canFit };