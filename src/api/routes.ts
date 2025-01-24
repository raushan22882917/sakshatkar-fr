import express from 'express';
import { createPayPalOrder, capturePayPalOrder } from './paypal';

const router = express.Router();

router.post('/api/create-paypal-order', async (req, res) => {
  try {
    const { plan, price } = req.body;
    const order = await createPayPalOrder(plan, price);
    res.json(order);
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

router.post('/api/capture-paypal-order', async (req, res) => {
  try {
    const { orderID } = req.body;
    const captureData = await capturePayPalOrder(orderID);
    res.json(captureData);
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
});

export default router;
