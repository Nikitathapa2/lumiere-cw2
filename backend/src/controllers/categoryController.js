import { Category } from '../models/Category.js';

export async function getCategories(req, res, next) {
  try {
    const visibleOnly = req.query.visible !== 'false';
    const query = visibleOnly ? { visible: true } : {};
    const items = await Category.find(query).sort({ priority: -1, title: 1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export default { getCategories };
