/**
 * Parse and format pet images from database
 * @param {string|array} images - Images from database (base64 data URLs or array)
 * @param {string} defaultImage - Default image URL if no images available
 * @returns {array} Array of formatted image URLs
 */
export const parsePetImages = (images, defaultImage = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') => {
  try {
    if (!images) {
      return [defaultImage];
    }

    // Parse JSON string if needed
    const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
    
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      return [defaultImage];
    }

    // Return base64 data URLs directly (they start with 'data:')
    return parsedImages.map(imageData => {
      if (imageData.startsWith('data:')) {
        return imageData; // Base64 data URL
      }
      if (imageData.startsWith('http')) {
        return imageData; // External URL
      }
      // Fallback for old file path format
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageData}`;
    });
  } catch (error) {
    console.error('Error parsing pet images:', error);
    return [defaultImage];
  }
};

/**
 * Get the first image from pet images
 * @param {string|array} images - Images from database
 * @param {string} defaultImage - Default image URL if no images available
 * @returns {string} First image URL
 */
export const getPetMainImage = (images, defaultImage) => {
  const imageArray = parsePetImages(images, defaultImage);
  return imageArray[0];
};

/**
 * Format image URL for display
 * @param {string} imageUrl - Raw image URL from database (base64 or URL)
 * @returns {string} Formatted image URL
 */
export const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('data:')) {
    return imageUrl; // Base64 data URL
  }
  
  if (imageUrl.startsWith('http')) {
    return imageUrl; // External URL
  }
  
  // Fallback for old file path format
  return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`;
};
