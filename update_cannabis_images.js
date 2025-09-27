// Cannabis strain images - organized by tier quality
// Higher tier strains get higher quality, more detailed images

const cannabisImages = {
  // Za tier - Premium images with best detail and color
  za: [
    'https://images.unsplash.com/photo-1604953669129-4dd694ba16d3?w=400&h=400&fit=crop', // Cannabis flower close-up
    'https://images.unsplash.com/photo-1604953753353-42128ad7cfbd?w=400&h=400&fit=crop', // Cannabis flower macro
    'https://images.unsplash.com/photo-1597266028950-1c782e8b23c2?w=400&h=400&fit=crop', // Green kush in clear glass jar
    'https://images.unsplash.com/photo-1623279360174-0a09a34388bc?w=400&h=400&fit=crop'  // Close-up on white background
  ],
  
  // Deps tier - Mid-quality images with good detail
  deps: [
    'https://images.unsplash.com/photo-1559558260-dfa522cfd57c?w=400&h=400&fit=crop', // Green kush
    'https://images.unsplash.com/photo-1518465444133-93542d08fdd9?w=400&h=400&fit=crop', // Green and brown kush
    'https://images.unsplash.com/photo-1630678691613-0ee767e22250?w=400&h=400&fit=crop', // Green kush in pink bucket
    'https://images.unsplash.com/photo-1630678692476-acf8b341003d?w=400&h=400&fit=crop', // Green kush in pink cup
    'https://images.unsplash.com/photo-1598973728789-755b8338900f?w=400&h=400&fit=crop', // Green and brown plant on water
    'https://images.unsplash.com/photo-1589141986943-5578615fdef2?w=400&h=400&fit=crop', // Green and brown plant on white
    'https://images.unsplash.com/photo-1534347768767-8fe3fea1295e?w=400&h=400&fit=crop', // Green cannabis plant
    'https://images.unsplash.com/photo-1630627204934-ee42a8e9b9fb?w=400&h=400&fit=crop'  // Dried leaves in jar
  ],
  
  // Lows tier - Standard quality images
  lows: [
    'https://images.unsplash.com/photo-1652054647785-7e33ab510110?w=400&h=400&fit=crop', // Pile of marijuana
    'https://images.unsplash.com/photo-1609443934742-3e2383f9423f?w=400&h=400&fit=crop', // Green and brown plant close up
    'https://images.unsplash.com/photo-1616690002554-b53821496f45?w=400&h=400&fit=crop', // Green and white plant close up
    'https://images.unsplash.com/photo-1600753231295-90b5d5b87a5a?w=400&h=400&fit=crop', // Green kush on hand
    'https://images.unsplash.com/photo-1629851047755-818331c3cc08?w=400&h=400&fit=crop', // Brown and green plant
    'https://images.unsplash.com/photo-1617101814633-c8a6cfd159cc?w=400&h=400&fit=crop', // Green plant black background
    'https://images.unsplash.com/photo-1641932431629-2536f291b274?w=400&h=400&fit=crop', // Close up green plant
    'https://images.unsplash.com/photo-1636142220754-201f7c7b14f2?w=400&h=400&fit=crop'  // Close up leafy plant
  ]
};

// Function to get random image for tier
function getImageForTier(tier, index = 0) {
  const images = cannabisImages[tier] || cannabisImages.lows;
  return images[index % images.length];
}

module.exports = { cannabisImages, getImageForTier };