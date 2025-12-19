import { createLead } from '../services/lead.service.js';

export async function postLead(req, res) {
  try {
    const lead = req.body;
    console.log('Received lead:', lead);
    
    const result = await createLead(lead);
    console.log('Lead processed:', result);
    
    res.json(result);
  } catch (err) {
    console.error('Lead error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
}