import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

router.get('/supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('properties').select('id').limit(1);
    if (error) throw error;
    return res.json({ success: true, message: 'Supabase connection OK', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
