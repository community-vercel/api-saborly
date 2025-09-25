import Item from '../models/item.model.js';
import Order from '../models/order.model.js';
import Offer from '../models/offer.model.js';
import Category from '../models/category.model.js';

export const searchItems = async (req, res) => {
  try {
    const { query, categoryId, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Escape regex for safety
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexQuery = new RegExp(escapedQuery, 'i'); // Case-insensitive partial match

    // Search for exact matches first (full match)
    const exactItems = await Item.find({
      $or: [
        { name: { $eq: query } },
        { description: { $eq: query } },
      ],
      ...(categoryId && { category: categoryId }),
    })
    .populate('category', 'name')
    .sort({ sellCount: -1 });

    // Search for partial matches
    const partialItems = await Item.find({
      $or: [
        { name: regexQuery },
        { description: regexQuery },
      ],
      ...(categoryId && { category: categoryId }),
      _id: { $nin: exactItems.map(item => item._id) }, // Exclude exact matches
    })
    .populate('category', 'name')
    .sort({ sellCount: -1 })
    .limit(parseInt(limit) - exactItems.length); // Adjust limit based on exact matches

    // Combine exact and partial matches
    const items = [...exactItems, ...partialItems].slice(0, parseInt(limit));

    // Search for categories (both exact and partial)
    const categories = await Category.find({
      name: regexQuery,
    }).limit(5);

    res.json({
      items,
      categories,
      totalResults: items.length + categories.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};