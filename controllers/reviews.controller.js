import Item from '../models/item.model.js';
import Order from '../models/order.model.js';

// Add Review
export const addReview = async (req, res) => {
  try {
 
    const { itemId } = req.params;
    const { rating, comment } = req.body;
const userId = req.user.id; 
    console.log('Review request:', { itemId, userId, rating, comment });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user has ordered this item (optional business logic)
    const userOrders = await Order.find({ 
      user: userId, 
      'items.item': itemId,
    });
    
    if (userOrders.length === 0) {
      return res.status(403).json({ 
        message: 'You must order and receive this item to review it' 
      });
    }

    // Check if user has already reviewed this item
    const existingReview = item.reviews.find(
      review => review.user.toString() === userId.toString()
    );
    
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this item' 
      });
    }

    // Add review
    item.reviews.push({ 
      user: userId, 
      rating, 
      comment: comment || '' 
    });

    // Recalculate averages
    item.reviewCount = item.reviews.length;
    item.averageRating = item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviewCount;

    await item.save();

    // Populate the user info in the response
    await item.populate('reviews.user', 'firstName lastName email');

    res.status(201).json({ 
      message: 'Review added successfully',
      review: item.reviews[item.reviews.length - 1], // Return the new review
      averageRating: item.averageRating,
      reviewCount: item.reviewCount
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get All Reviews for Admin Panel
export const getAllReviews = async (req, res) => {
  try {
    const items = await Item.find({ 'reviews.0': { $exists: true } }) // Only items with reviews
      .populate({
        path: 'reviews.user',
        select: 'email firstName lastName profileImage',
      })
      .select('name reviews averageRating reviewCount');

    const reviews = items.flatMap(item => 
      item.reviews.map(review => ({
        _id: review._id,
        itemId: item._id,
        itemName: item.name,
        user: review.user,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        averageRating: item.averageRating,
        reviewCount: item.reviewCount
      }))
    );

    // Sort by latest first
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      totalReviews: reviews.length,
      reviews
    });
  } catch (err) {
    console.error('Get all reviews error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get Public Reviews
export const getPublicReviews = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await Item.find({ 'reviews.0': { $exists: true } })
      .populate({
        path: 'reviews.user',
        select: 'firstName lastName profileImage',
      })
      .select('name image reviews averageRating reviewCount')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'reviews.createdAt': -1 });

    const reviews = items.flatMap(item => 
      item.reviews.map(review => ({
        _id: review._id,
        itemId: item._id,
        itemName: item.name,
        itemImage: item.image,
        userName: `${review.user.firstName} ${review.user.lastName || ''}`.trim() || 'Anonymous',
        userImage: review.user.profileImage,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        averageRating: item.averageRating,
        reviewCount: item.reviewCount
      }))
    );

    // Sort by latest first and apply pagination
    const sortedReviews = reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));

    res.json({
      totalReviews: sortedReviews.length,
      page: parseInt(page),
      limit: parseInt(limit),
      reviews: sortedReviews
    });
  } catch (err) {
    console.error('Get public reviews error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get Reviews for Specific Item
export const getItemReviews = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const item = await Item.findById(itemId)
      .populate({
        path: 'reviews.user',
        select: 'firstName lastName profileImage',
      })
      .select('name reviews averageRating reviewCount');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Paginate reviews
    const paginatedReviews = item.reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit))
      .map(review => ({
        _id: review._id,
        user: {
          name: `${review.user.firstName} ${review.user.lastName || ''}`.trim() || 'Anonymous',
          image: review.user.profileImage
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }));

    res.json({
      itemId: item._id,
      itemName: item.name,
      averageRating: item.averageRating,
      totalReviews: item.reviewCount,
      page: parseInt(page),
      limit: parseInt(limit),
      reviews: paginatedReviews
    });
  } catch (err) {
    console.error('Get item reviews error:', err);
    res.status(500).json({ message: err.message });
  }
};