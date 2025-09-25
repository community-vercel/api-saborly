import Item from '../models/item.model.js';
import Category from '../models/category.model.js';
import Offer from '../models/offer.model.js';

export const searchItems = async (req, res) => {
  try {
    const { query, categoryId, limit = 10 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = query.trim();
    
    // Escape regex for safety
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexQuery = new RegExp(escapedQuery, 'i');

    // Search Items with exact and partial matching
    const baseItemMatch = categoryId ? { category: categoryId } : {};

    // Exact matches first for items
    const exactItems = await Item.find({
      ...baseItemMatch,
      $or: [
        { name: { $eq: searchQuery } },
        { description: { $eq: searchQuery } },
      ],
    })
    .populate('category', 'name image')
    .sort({ sellCount: -1, createdAt: -1 });

    // Partial matches for items (excluding exact matches)
    const partialItems = await Item.find({
      ...baseItemMatch,
      $or: [
        { name: regexQuery },
        { description: regexQuery },
      ],
      _id: { $nin: exactItems.map(item => item._id) },
    })
    .populate('category', 'name image')
    .sort({ sellCount: -1, createdAt: -1 })
    .limit(parseInt(limit) - exactItems.length);

    const items = [...exactItems, ...partialItems].slice(0, parseInt(limit));

    // Search Categories with exact and partial matching
    const exactCategories = await Category.find({
      name: { $eq: searchQuery },
    }).limit(5);

    const partialCategories = await Category.find({
      name: regexQuery,
      _id: { $nin: exactCategories.map(cat => cat._id) },
    }).limit(5 - exactCategories.length);

    const categories = [...exactCategories, ...partialCategories].slice(0, 5);

    // Search Offers with exact and partial matching
    const exactOffers = await Offer.find({
      $or: [
        { title: { $eq: searchQuery } },
        { description: { $eq: searchQuery } },
      ],
    })
    .populate({
      path: 'items',
      populate: {
        path: 'category',
        select: 'name image'
      }
    })
    .sort({ createdAt: -1 });

    const partialOffers = await Offer.find({
      $or: [
        { title: regexQuery },
        { description: regexQuery },
      ],
      _id: { $nin: exactOffers.map(offer => offer._id) },
    })
    .populate({
      path: 'items',
      populate: {
        path: 'category',
        select: 'name image'
      }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) - exactOffers.length);

    const offers = [...exactOffers, ...partialOffers].slice(0, parseInt(limit));

    res.json({
      items,
      categories,
      offers,
      totalResults: items.length + categories.length + offers.length,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};