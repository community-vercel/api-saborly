import { NewsletterSubscriber, NewsletterCampaign } from '../models/newsletter.model.js';
import { NewsletterService } from '../services/newsletter.service.js';

// Get all subscribers for admin panel
export const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const subscribers = await NewsletterSubscriber.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await NewsletterSubscriber.countDocuments(query);

    res.json({
      success: true,
      subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
};

// Send newsletter to all subscribers
export const sendNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body;
    const adminId = req.user.id; // From your auth middleware

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // Get all active subscribers
    const subscribers = await NewsletterSubscriber.find({ isActive: true });
    
    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    // Create campaign record
    const campaign = await NewsletterCampaign.create({
      subject,
      content,
      sentBy: adminId,
      totalRecipients: subscribers.length,
      status: 'sending'
    });

    // Send emails in background
    NewsletterService.sendBulkCampaign(subscribers, subject, content, campaign._id)
      .then(async (results) => {
        // Update campaign with results
        campaign.sentCount = results.successful;
        campaign.failedCount = results.failed;
        campaign.status = results.successful > 0 ? 'sent' : 'failed';
        campaign.sentAt = new Date();
        await campaign.save();
        
        console.log(`Campaign ${campaign._id} completed:`, results);
      })
      .catch(async (error) => {
        campaign.status = 'failed';
        await campaign.save();
        console.error('Campaign failed:', error);
      });

    res.json({
      success: true,
      message: `Newsletter is being sent to ${subscribers.length} subscribers`,
      campaignId: campaign._id,
      totalRecipients: subscribers.length
    });

  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter'
    });
  }
};

// Get newsletter statistics
export const getNewsletterStats = async (req, res) => {
  try {
    const totalSubscribers = await NewsletterSubscriber.countDocuments({ isActive: true });
    const totalCampaigns = await NewsletterCampaign.countDocuments();
    const recentCampaigns = await NewsletterCampaign.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('subject sentCount totalRecipients status sentAt');

    res.json({
      success: true,
      stats: {
        totalSubscribers,
        totalCampaigns,
        recentCampaigns
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};