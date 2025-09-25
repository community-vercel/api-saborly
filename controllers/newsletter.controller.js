import { NewsletterSubscriber } from '../models/newsletter.model.js';
import { NewsletterService } from '../services/newsletter.service.js';

// Subscribe to newsletter
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    });
    
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter'
      });
    }

    // Create or reactivate subscription
    let subscriber;
    const previousSubscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (previousSubscriber) {
      previousSubscriber.isActive = true;
      previousSubscriber.unsubscribedAt = null;
      previousSubscriber.subscribedAt = new Date();
      previousSubscriber.firstName = firstName || previousSubscriber.firstName;
      previousSubscriber.lastName = lastName || previousSubscriber.lastName;
      subscriber = await previousSubscriber.save();
    } else {
      subscriber = await NewsletterSubscriber.create({ 
        email: email.toLowerCase(), 
        firstName, 
        lastName 
      });
    }

    // Send welcome email (don't block response)
    NewsletterService.sendWelcomeEmail(subscriber, firstName, lastName)
      .catch(error => console.error('Welcome email failed:', error));

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter!'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter'
    });
  }
};

// Unsubscribe from newsletter
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter list'
      });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from our newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe'
    });
  }
};