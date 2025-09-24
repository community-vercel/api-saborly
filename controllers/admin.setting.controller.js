
// controllers/admin.setting.controller.js
import Setting from '../models/admin.setting.model.js';

// Create or Update Settings
export const createOrUpdateSetting = async (req, res) => {
  try {
    const { restaurantName, contactPhone, address, openingHours, paymentGateway } = req.body;

    if (!restaurantName || !contactPhone || !address || !openingHours) {
      return res.status(400).json({ message: 'Restaurant name, contact phone, address, and opening hours are required' });
    }

    if (paymentGateway && !['stripe', 'paypal', 'none'].includes(paymentGateway.type)) {
      return res.status(400).json({ message: 'Invalid payment gateway type' });
    }

    const settingData = {
      restaurantName,
      contactPhone,
      address,
      openingHours,
      paymentGateway: paymentGateway || { type: 'none', apiKey: '', secretKey: '' },
    };

    let setting = await Setting.findOne();
    if (setting) {
      setting = await Setting.findByIdAndUpdate(setting._id, { $set: settingData }, { new: true });
    } else {
      setting = await Setting.create(settingData);
    }

    res.status(201).json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Settings
export const getSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne().select('-paymentGateway');
    if (!setting) return res.status(404).json({ message: 'Settings not found' });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Settings
export const updateSettings = async (req, res) => {
  try {
    const { restaurantName, contactPhone, address, openingHours, paymentGateway } = req.body;

    if (!restaurantName && !contactPhone && !address && !openingHours && !paymentGateway) {
      return res.status(400).json({ message: 'At least one field is required for update' });
    }

    if (paymentGateway && !['stripe', 'paypal', 'none'].includes(paymentGateway.type)) {
      return res.status(400).json({ message: 'Invalid payment gateway type' });
    }

    const setting = await Setting.findOne();
    if (!setting) return res.status(404).json({ message: 'Settings not found' });

    const updatedData = {
      restaurantName: restaurantName || setting.restaurantName,
      contactPhone: contactPhone || setting.contactPhone,
      address: address || setting.address,
      openingHours: openingHours || setting.openingHours,
      paymentGateway: paymentGateway
        ? {
            type: paymentGateway.type || setting.paymentGateway.type,
            apiKey: paymentGateway.apiKey || setting.paymentGateway.apiKey,
            secretKey: paymentGateway.secretKey || setting.paymentGateway.secretKey,
          }
        : setting.paymentGateway,
    };

    const updatedSetting = await Setting.findByIdAndUpdate(setting._id, { $set: updatedData }, { new: true });
    res.json(updatedSetting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Settings (Reset to Default)
export const deleteSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) return res.status(404).json({ message: 'Settings not found' });

    await Setting.findByIdAndDelete(setting._id);
    res.json({ message: 'Settings reset' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
