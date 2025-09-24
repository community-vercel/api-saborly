// controllers/admin.controller.js
import Category from '../models/category.model.js';
import { put, del } from '@vercel/blob';
import Item from '../models/item.model.js';
import Order from '../models/order.model.js';
import Offer from '../models/offer.model.js';
import User from '../models/user.model.js'

// Add Category
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.files?.image?.[0];

    if (!name || !file) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    const blobFile = new File([file.buffer], file.originalname, { type: file.mimetype });
    const blob = await put(`categories/${Date.now()}-${file.originalname}`, blobFile, {
      access: 'public',
    });

    const category = new Category({ name, image: blob.url });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const file = req.files?.image?.[0];
    let image = req.body.image;

    if (!name && !file) {
      return res.status(400).json({ message: 'At least one field (name or image) is required' });
    }

    if (file) {
      const category = await Category.findById(id);
      if (category && category.image) {
        await del(category.image);
      }
      const blobFile = new File([file.buffer], file.originalname, { type: file.mimetype });
      const blob = await put(`categories/${Date.now()}-${file.originalname}`, blobFile, {
        access: 'public',
      });
      image = blob.url;
    }

    const updatedData = {
      name: name || undefined,
      image: image || undefined,
    };

    const category = await Category.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Check if category is used by any items
    // const itemCount = await Item.countDocuments({ category: id });
    // if (itemCount > 0) {
    //   return res.status(400).json({ message: 'Cannot delete category with associated items' });
    // }

    if (category.image) await del(category.image);
    await Category.findByIdAndDelete(id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add Item
export const addItem = async (req, res) => {
  try {
    const { name, description, price, category, sizes, temperatures, addons, isFeatured, type } = req.body;
    const imageFile = req.files?.image?.[0];
    const addonImageFile = req.files?.addonImage?.[0];

    if (!name || !description || !price || !category || !imageFile || !type) {
      return res.status(400).json({ message: 'Required fields missing (name, description, price, category, image, type)' });
    }

    if (!['veg', 'non-veg'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either veg or non-veg' });
    }

    // Parse arrays with error handling
    let parsedSizes = [];
    let parsedTemperatures = [];
    let parsedAddons = [];

    try {
      parsedSizes = sizes ? JSON.parse(sizes) : [];
      if (!Array.isArray(parsedSizes)) {
        return res.status(400).json({ message: 'Sizes must be a valid JSON array' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid JSON format for sizes' });
    }

    try {
      parsedTemperatures = temperatures ? JSON.parse(temperatures) : [];
      if (!Array.isArray(parsedTemperatures)) {
        return res.status(400).json({ message: 'Temperatures must be a valid JSON array' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid JSON format for temperatures' });
    }

    try {
      parsedAddons = addons ? JSON.parse(addons) : [];
      if (!Array.isArray(parsedAddons)) {
        return res.status(400).json({ message: 'Addons must be a valid JSON array' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid JSON format for addons' });
    }

    // Upload main item image
    const imageBlob = await put(`items/${Date.now()}-${imageFile.originalname}`, new File([imageFile.buffer], imageFile.originalname, { type: imageFile.mimetype }), {
      access: 'public',
    });

    // Upload single addon image if provided
    let addonImageUrl = null;
    if (addonImageFile) {
      const blob = await put(`addons/${Date.now()}-${addonImageFile.originalname}`, new File([addonImageFile.buffer], addonImageFile.originalname, { type: addonImageFile.mimetype }), {
        access: 'public',
      });
      addonImageUrl = blob.url;
    }

    // Update addons with uploaded image URL
    parsedAddons = parsedAddons.map(addon => ({
      ...addon,
      image: addon.imageName === (addonImageFile?.originalname || '') ? addonImageUrl : addon.image,
    }));

    // Check featured limit
    if (isFeatured === 'true') {
      const featuredCount = await Item.countDocuments({ isFeatured: true });
      if (featuredCount >= 4) {
        return res.status(400).json({ message: 'Maximum 4 featured items allowed' });
      }
    }

    const item = new Item({
      name,
      image: imageBlob.url,
      description,
      price: parseFloat(price),
      category,
      sizes: parsedSizes,
      temperatures: parsedTemperatures,
      addons: parsedAddons,
      isFeatured: isFeatured === 'true',
      sellCount: 0,
      type, // Add type field
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Items
export const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('category');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Items by Category
export const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = await Item.find({ category: categoryId }).populate('category');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, sizes, temperatures, addons, isFeatured, type } = req.body;
    const imageFile = req.files?.image?.[0];
    const addonImageFile = req.files?.addonImage?.[0];
    let image = req.body.image;

    if (imageFile) {
      const item = await Item.findById(id);
      if (item && item.image) {
        await del(item.image);
      }
      const blob = await put(`items/${Date.now()}-${imageFile.originalname}`, new File([imageFile.buffer], imageFile.originalname, { type: imageFile.mimetype }), {
        access: 'public',
      });
      image = blob.url;
    }

    const parsedSizes = sizes ? JSON.parse(sizes) : undefined;
    const parsedTemperatures = temperatures ? JSON.parse(temperatures) : undefined;
    let parsedAddons = addons ? JSON.parse(addons) : undefined;

    let addonImageUrl = null;
    if (addonImageFile) {
      const item = await Item.findById(id);
      if (item && item.addons) {
        const addonToUpdate = item.addons.find(a => a.imageName === addonImageFile.originalname);
        if (addonToUpdate && addonToUpdate.image) {
          await del(addonToUpdate.image);
        }
      }
      const blob = await put(`addons/${Date.now()}-${addonImageFile.originalname}`, new File([addonImageFile.buffer], addonImageFile.originalname, { type: addonImageFile.mimetype }), {
        access: 'public',
      });
      addonImageUrl = blob.url;
    }

    if (parsedAddons) {
      parsedAddons = parsedAddons.map(addon => ({
        ...addon,
        image: addon.imageName === (addonImageFile?.originalname || '') ? addonImageUrl : addon.image,
      }));
    }

    if (isFeatured === 'true') {
      const item = await Item.findById(id);
      if (!item.isFeatured) {
        const featuredCount = await Item.countDocuments({ isFeatured: true });
        if (featuredCount >= 4) {
          return res.status(400).json({ message: 'Maximum 4 featured items allowed' });
        }
      }
    }

    if (type && !['veg', 'non-veg'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either veg or non-veg' });
    }

    const updatedData = {
      name,
      image,
      description,
      price: price ? parseFloat(price) : undefined,
      sizes: parsedSizes,
      temperatures: parsedTemperatures,
      addons: parsedAddons,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      type: type || undefined, // Add type field
    };

    const item = await Item.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.image) await del(item.image);
    if (item.addons) {
      for (const addon of item.addons) {
        if (addon.image) await del(addon.image);
      }
    }

    await Item.findByIdAndDelete(id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Featured Items
export const getFeaturedItems = async (req, res) => {
  try {
    const items = await Item.find({ isFeatured: true }).limit(4).populate('category');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add Offer
export const addOffer = async (req, res) => {
  try {
    const { title, description, itemIds } = req.body;
    console.log('itemIds:', itemIds, 'Type:', typeof itemIds);
    const file = req.files?.image?.[0];

    if (!title || !description || !file) {
      return res.status(400).json({ message: 'Title, description, and image are required' });
    }

    const blob = await put(`offers/${Date.now()}-${file.originalname}`, new File([file.buffer], file.originalname, { type: file.mimetype }), {
      access: 'public',
    });

    let parsedItemIds = [];
    try {
      parsedItemIds = itemIds ? JSON.parse(itemIds) : [];
      if (!Array.isArray(parsedItemIds)) {
        return res.status(400).json({ message: 'Item IDs must be a valid JSON array' });
      }
    } catch (err) {
      console.error('JSON parsing error for itemIds:', itemIds, 'Error:', err.message);
      return res.status(400).json({ message: `Invalid JSON format for itemIds: ${err.message}` });
    }

    if (parsedItemIds.length > 0) {
      const items = await Item.find({ _id: { $in: parsedItemIds } });
      if (items.length !== parsedItemIds.length) {
        return res.status(400).json({ message: 'One or more item IDs are invalid' });
      }
    }

    const offer = new Offer({
      title,
      description,
      image: blob.url,
      items: parsedItemIds,
    });

    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    console.error('Error in addOffer:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get All Offers
export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().populate('items');
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Offer by ID
export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id).populate('items');
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Offer
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, itemIds } = req.body;
    const file = req.files?.image?.[0];
    let image = req.body.image;

    if (!title && !description && !itemIds && !file) {
      return res.status(400).json({ message: 'At least one field (title, description, itemIds, or image) is required' });
    }

    if (file) {
      const offer = await Offer.findById(id);
      if (offer && offer.image) {
        await del(offer.image);
      }
      const blob = await put(`offers/${Date.now()}-${file.originalname}`, new File([file.buffer], file.originalname, { type: file.mimetype }), {
        access: 'public',
      });
      image = blob.url;
    }

    let parsedItemIds;
    try {
      parsedItemIds = itemIds ? JSON.parse(itemIds) : undefined;
      if (parsedItemIds && !Array.isArray(parsedItemIds)) {
        return res.status(400).json({ message: 'Item IDs must be a valid JSON array' });
      }
    } catch (err) {
      return res.status(400).json({ message: `Invalid JSON format for itemIds: ${err.message}` });
    }

    if (parsedItemIds && parsedItemIds.length > 0) {
      const items = await Item.find({ _id: { $in: parsedItemIds } });
      if (items.length !== parsedItemIds.length) {
        return res.status(400).json({ message: 'One or more item IDs are invalid' });
      }
    }

    const updatedData = {
      title: title || undefined,
      description: description || undefined,
      image: image || undefined,
      items: parsedItemIds,
    };

    const offer = await Offer.findByIdAndUpdate(id, { $set: updatedData }, { new: true }).populate('items');
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Offer
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    if (offer.image) await del(offer.image);
    await Offer.findByIdAndDelete(id);
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Items by Offer
export const getOfferItems = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId).populate({
      path: 'items',
      populate: { path: 'category' },
    });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Popular Items
export const getPopularItems = async (req, res) => {
  try {
    const items = await Item.find()
      .sort({ sellCount: -1 })
      .limit(5)
      .populate('category');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, userEmail, deliveryType } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || !totalPrice || !userEmail || !deliveryType) {
      return res.status(400).json({ message: 'Items, totalPrice, userEmail, and deliveryType are required' });
    }
    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
      return res.status(400).json({ message: 'totalPrice must be a positive number' });
    }
    if (!['delivery', 'takeaway'].includes(deliveryType)) {
      return res.status(400).json({ message: 'deliveryType must be either delivery or takeaway' });
    }

    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate and update items
    for (const orderItem of items) {
      const item = await Item.findById(orderItem.item);
      if (!item) {
        return res.status(404).json({ message: `Item ${orderItem.item} not found` });
      }
      if (orderItem.size && !item.sizes.some(s => s.name === orderItem.size)) {
        return res.status(400).json({ message: `Invalid size for item ${orderItem.item}` });
      }
      if (orderItem.temperature && !item.temperatures.some(t => t.name === orderItem.temperature)) {
        return res.status(400).json({ message: `Invalid temperature for item ${orderItem.item}` });
      }
      await Item.findByIdAndUpdate(orderItem.item, {
        $inc: { sellCount: orderItem.quantity },
      });
    }

    const order = new Order({
      items: items.map(item => ({
        item: item.item,
        quantity: item.quantity,
        size: item.size,
        temperature: item.temperature,
        addons: item.addons,
        specialInstructions: item.specialInstructions || '',
      })),
      totalPrice,
      user: user._id,
      deliveryType, // Add deliveryType to order
    });
    console.log('Creating order:', order);

    await order.save();
    // Populate item details including category
    const populatedOrder = await Order.findById(order._id).populate({
      path: 'items.item',
      populate: { path: 'category' },
    });

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: err.message });
  }
};
// Get All Orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: 'items.item',
      populate: { path: 'category' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate({
      path: 'items.item',
      populate: { path: 'category' },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, totalPrice, status, userEmail } = req.body;

    if (!items && !totalPrice && !status && !userEmail) {
      return res.status(400).json({ message: 'At least one field (items, totalPrice, status, or userEmail) is required' });
    }

    if (items && !Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    if (items) {
      for (const orderItem of items) {
        const item = await Item.findById(orderItem.item);
        if (!item) {
          return res.status(404).json({ message: `Item ${orderItem.item} not found` });
        }
        if (orderItem.size && !item.sizes.some(s => s.name === orderItem.size)) {
          return res.status(400).json({ message: `Invalid size for item ${orderItem.item}` });
        }
        if (orderItem.temperature && !item.temperatures.some(t => t.name === orderItem.temperature)) {
          return res.status(400).json({ message: `Invalid temperature for item ${orderItem.item}` });
        }
      }
    }

    const updatedData = {
      items: items
        ? items.map(item => ({
            item: item.item,
            quantity: item.quantity,
            size: item.size,
            temperature: item.temperature,
            addons: item.addons,
            specialInstructions: item.specialInstructions || '',
          }))
        : undefined,
      totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
      status: status || undefined,
      userEmail: userEmail || undefined,
    };

    const order = await Order.findByIdAndUpdate(id, { $set: updatedData }, { new: true }).populate({
      path: 'items.item',
      populate: { path: 'category' },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await Order.findByIdAndDelete(id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};