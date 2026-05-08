import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const create = async (req, res) => { /* unchanged from earlier */ };

export const getApproved = async (req, res) => { /* unchanged */ };

export const getAll = async (req, res) => { /* unchanged */ };

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const allowedFields = [
      'title', 'offer_type', 'price_per_m2', 'surface', 'total_price',
      'commission', 'commission_amount', 'region', 'city', 'district',
      'description', 'featured', 'featured_duration', 'featured_price', 'status'
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Handle images
    const existingIds = req.body.existing_images
      ? req.body.existing_images.split(',').filter(id => id.trim())
      : [];

    // Get current images from DB
    const { data: currentImages, error: imgFetchError } = await supabase
      .from('property_images')
      .select('id, image_url')
      .eq('property_id', id);
    if (imgFetchError) throw new Error(`Failed to fetch images: ${imgFetchError.message}`);

    // Delete images that are not in the existingIds list
    const imagesToDelete = currentImages.filter(img => !existingIds.includes(img.id));
    for (const img of imagesToDelete) {
      const path = img.image_url.split('/').pop();
      await supabase.storage.from(process.env.BUCKET_NAME).remove([`properties/${path}`]);
      await supabase.from('property_images').delete().eq('id', img.id);
    }

    // Upload new images
    const newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = `${uuidv4()}-${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(process.env.BUCKET_NAME)
          .upload(`properties/${fileName}`, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        const { data: publicUrlData } = supabase.storage
          .from(process.env.BUCKET_NAME)
          .getPublicUrl(uploadData.path);
        newImageUrls.push(publicUrlData.publicUrl);
      }
      // Insert new image rows
      const imageRows = newImageUrls.map(url => ({ property_id: id, image_url: url }));
      const { error: insertError } = await supabase.from('property_images').insert(imageRows);
      if (insertError) throw new Error(`Image insert failed: ${insertError.message}`);
    }

    // Update property fields
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Update property error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approve = async (req, res) => { /* unchanged */ };

export const reject = async (req, res) => { /* unchanged */ };

export const markAsSold = async (req, res) => { /* unchanged */ };