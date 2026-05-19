import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// -----------------------------------------------------------------
// CREATE – temporarily skips image upload to diagnose the crash
// -----------------------------------------------------------------
export const create = async (req, res) => {
  try {
    const {
      title, offerType, pricePerM2, surface, commission,
      region, city, district, description, featured,
      fullName, phone, email,
      titreFoncier, viabilise, cloture, accesFacile, eauElectricite,
      featuredDuration, featuredPrice,
    } = req.body;

    const pricePerM2Num = parseFloat(pricePerM2);
    const surfaceNum = parseFloat(surface);
    const commissionNum = parseFloat(commission);
    const totalPrice = pricePerM2Num * surfaceNum;
    const commissionAmount = totalPrice * (commissionNum / 100);

    const propertyData = {
      title,
      offer_type: offerType,
      price_per_m2: pricePerM2Num,
      surface: surfaceNum,
      total_price: totalPrice,
      commission: commissionNum,
      commission_amount: commissionAmount,
      region,
      city,
      district: district || '',
      description: description || '',
      featured: featured === 'true',
      featured_duration: featuredDuration || null,
      featured_price: featuredPrice ? parseFloat(featuredPrice) : null,
      status: 'pending',
    };

    const features = {
      titre_foncier: titreFoncier === 'true',
      viabilise: viabilise === 'true',
      cloture: cloture === 'true',
      acces_facile: accesFacile === 'true',
      eau_electricite: eauElectricite === 'true',
    };

    // TEMPORARY: skip image upload for debugging
    const imageUrls = [];
    // (The original upload code is commented out below – uncomment it later)

    // if (req.files && req.files.length > 0) {
    //   for (const file of req.files) {
    //     const fileName = `${uuidv4()}-${file.originalname}`;
    //     const { data: uploadData, error: uploadError } = await supabase.storage
    //       .from(process.env.BUCKET_NAME)
    //       .upload(`properties/${fileName}`, file.buffer, {
    //         contentType: file.mimetype,
    //         cacheControl: '3600',
    //         upsert: false,
    //       });
    //     if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    //     const { data: publicUrlData } = supabase.storage
    //       .from(process.env.BUCKET_NAME)
    //       .getPublicUrl(uploadData.path);
    //     imageUrls.push(publicUrlData.publicUrl);
    //   }
    // }

    // Insert property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();
    if (propError) throw new Error(`Insert failed: ${propError.message}`);

    // Insert features
    const { error: featError } = await supabase
      .from('property_features')
      .insert({ property_id: property.id, ...features });
    if (featError) throw new Error(`Features insert failed: ${featError.message}`);

    // Insert images (currently empty, so nothing is inserted)
    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map(url => ({ property_id: property.id, image_url: url }));
      const { error: imgError } = await supabase.from('property_images').insert(imageRows);
      if (imgError) throw new Error(`Images insert failed: ${imgError.message}`);
    }

    return res.status(201).json({ success: true, data: property });
  } catch (error) {
    console.error('Create property error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------
// GET APPROVED (public)
// -----------------------------------------------------------------
export const getApproved = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, property_features(*), property_images(*)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Get approved error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------
// GET ALL (admin)
// -----------------------------------------------------------------
export const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, property_features(*), property_images(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Get all error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------
// UPDATE (full, with image handling)
// -----------------------------------------------------------------
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

    const existingIds = req.body.existing_images
      ? req.body.existing_images.split(',').filter(id => id.trim())
      : [];

    const { data: currentImages, error: imgFetchError } = await supabase
      .from('property_images')
      .select('id, image_url')
      .eq('property_id', id);
    if (imgFetchError) throw new Error(`Failed to fetch images: ${imgFetchError.message}`);

    const imagesToDelete = currentImages.filter(img => !existingIds.includes(img.id));
    for (const img of imagesToDelete) {
      const path = img.image_url.split('/').pop();
      await supabase.storage.from(process.env.BUCKET_NAME).remove([`properties/${path}`]);
      await supabase.from('property_images').delete().eq('id', img.id);
    }

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
      const imageRows = newImageUrls.map(url => ({ property_id: id, image_url: url }));
      const { error: insertError } = await supabase.from('property_images').insert(imageRows);
      if (insertError) throw new Error(`Image insert failed: ${insertError.message}`);
    }

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

// -----------------------------------------------------------------
// APPROVE
// -----------------------------------------------------------------
export const approve = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    const nextNumber = String((count || 0) + 1).padStart(3, '0');
    const reference = `SE-${nextNumber}-${month}-${year}`;
    const { data, error } = await supabase
      .from('properties')
      .update({ status: 'approved', reference_number: reference })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Approve error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------
// REJECT
// -----------------------------------------------------------------
export const reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('properties')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Reject error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------
// MARK AS SOLD
// -----------------------------------------------------------------
export const markAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('properties')
      .update({ status: 'sold', sold_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Mark as sold error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
