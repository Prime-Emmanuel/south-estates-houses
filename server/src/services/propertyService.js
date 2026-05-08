import { supabase, BUCKET_NAME } from '../config/supabase.js';

// ------------------ Storage Helpers ------------------
export const uploadImageToStorage = async (fileBuffer, fileName, mimeType) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(`properties/${fileName}`, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

// ------------------ Database CRUD ------------------
export const createProperty = async (propertyData, features, images) => {
  // 1. Insert property
  const { data: property, error: propError } = await supabase
    .from('properties')
    .insert(propertyData)
    .select()
    .single();

  if (propError) throw new Error(`Property insert failed: ${propError.message}`);

  // 2. Insert features
  if (features) {
    const { error: featError } = await supabase
      .from('property_features')
      .insert({ property_id: property.id, ...features });
    if (featError) throw new Error(`Features insert failed: ${featError.message}`);
  }

  // 3. Insert images (URLs already uploaded)
  if (images && images.length > 0) {
    const imageRows = images.map(url => ({
      property_id: property.id,
      image_url: url,
    }));
    const { error: imgError } = await supabase
      .from('property_images')
      .insert(imageRows);
    if (imgError) throw new Error(`Images insert failed: ${imgError.message}`);
  }

  return property;
};

export const getPropertyById = async (id) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_features(*), property_images(*)')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Property not found: ${error.message}`);
  return data;
};

export const getApprovedProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_features(*), property_images(*)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return data || [];
};

export const getAllProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_features(*), property_images(*)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return data || [];
};

export const updateProperty = async (id, updates) => {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Update failed: ${error.message}`);
  return data;
};

export const approveProperty = async (id) => {
  // Generate reference number: SE-XXX-MM-YY
  // XXX = incremental count of approved properties, MM = month, YY = year
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);

  // Get count of already approved (including this one? we'll count existing)
  const { count, error: countError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  if (countError) throw new Error(`Count failed: ${countError.message}`);

  const nextNumber = String((count || 0) + 1).padStart(3, '0');
  const reference = `SE-${nextNumber}-${month}-${year}`;

  const { data, error } = await supabase
    .from('properties')
    .update({ status: 'approved', reference_number: reference })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Approval failed: ${error.message}`);
  return data;
};

export const rejectProperty = async (id) => {
  const { data, error } = await supabase
    .from('properties')
    .update({ status: 'rejected' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Rejection failed: ${error.message}`);
  return data;
};

export const deleteProperty = async (id) => {
  // Deletion is cascaded (images, features), but we don't expose a deletion route now.
  // Still useful for admin.
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw new Error(`Delete failed: ${error.message}`);
  return true;
};