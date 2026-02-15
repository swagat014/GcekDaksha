import { supabase } from "../supabaseClient";

export async function uploadFile(documentType, file, personName = null, collegeName = null, sport = null) {
  // Map document types to appropriate buckets
  const bucketMap = {
    'captain_aadhaar': 'captain-docs',
    'captain_id': 'captain-docs',
    'player_aadhaar': 'player-docs',
    'player_id': 'player-docs',
    'payment_screenshot': 'captain-docs'
  };
  
  const bucket = bucketMap[documentType] || 'documents';
  
  // Create descriptive filename with college name, person name and document type
  const timestamp = Date.now();
  let fileName = '';
  
  // Clean college name for filename
  const cleanCollegeName = collegeName ? collegeName.toLowerCase().replace(/\s+/g, '_') : 'unknown_college';
  const cleanSport = sport ? sport.toLowerCase().replace(/\s+/g, '_') : 'unknown_sport';
  
  if (documentType === 'payment_screenshot') {
    // For payment screenshots - include college name and sport
    fileName = `${cleanCollegeName}_${cleanSport}_payment_${timestamp}_${file.name}`;
  } else if (personName) {
    // For player documents - include college name and player name
    const cleanName = personName.toLowerCase().replace(/\s+/g, '_');
    const docType = documentType.includes('aadhaar') ? 'aadhaar' : 'college_id';
    fileName = `${cleanCollegeName}_${cleanName}_${docType}_${timestamp}_${file.name}`;
  } else {
    // For captain documents - include college name and captain identifier
    const docType = documentType.includes('aadhaar') ? 'aadhaar' : 'college_id';
    fileName = `${cleanCollegeName}_captain_${docType}_${timestamp}_${file.name}`;
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    url: data.publicUrl,
    fileName: fileName,
    documentType: documentType,
    personName: personName || 'captain',
    bucket: bucket
  };
}