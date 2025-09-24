
// controllers/admin.slider.controller.js
import Slider from '../models/slider.model.js';
import { put, del } from '@vercel/blob';

// Add Slider
export const addSlider = async (req, res) => {
  try {
    const { text, order } = req.body;
    const file = req.files?.image?.[0];

    if (!text || !file) {
      return res.status(400).json({ message: 'Text and image are required' });
    }

    const blobFile = new File([file.buffer], file.originalname, { type: file.mimetype });
    const blob = await put(`sliders/${Date.now()}-${file.originalname}`, blobFile, {
      access: 'public',
    });

    const slider = new Slider({
      text,
      image: blob.url,
      order: order || 0,
    });

    await slider.save();
    res.status(201).json(slider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Sliders
export const getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Slider by ID
export const getSliderById = async (req, res) => {
  try {
    const { id } = req.params;
    const slider = await Slider.findById(id);
    if (!slider) return res.status(404).json({ message: 'Slider not found' });
    res.json(slider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Slider
export const updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, order } = req.body;
    const file = req.files?.image?.[0];
    let image = req.body.image;

    if (!text && !order && !file) {
      return res.status(400).json({ message: 'At least one field (text, order, or image) is required' });
    }

    const slider = await Slider.findById(id);
    if (!slider) return res.status(404).json({ message: 'Slider not found' });

    if (file) {
      if (slider.image) await del(slider.image);
      const blobFile = new File([file.buffer], file.originalname, { type: file.mimetype });
      const blob = await put(`sliders/${Date.now()}-${file.originalname}`, blobFile, {
        access: 'public',
      });
      image = blob.url;
    }

    const updatedData = {
      text: text || slider.text,
      order: order !== undefined ? order : slider.order,
      image: image || slider.image,
    };

    const updatedSlider = await Slider.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
    res.json(updatedSlider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Slider
export const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const slider = await Slider.findById(id);
    if (!slider) return res.status(404).json({ message: 'Slider not found' });

    if (slider.image) await del(slider.image);
    await Slider.findByIdAndDelete(id);
    res.json({ message: 'Slider deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
