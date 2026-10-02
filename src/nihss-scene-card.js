// Switch between landscape and portrait images based on window aspect ratio
function updateCardImage() {
  const img = document.querySelector('.popover-content img');
  if (!img) return;

  // Define the image dimensions (landscape version)
  const landscapeWidth = 2024;
  const landscapeHeight = 1404;
  const imageAspectRatio = landscapeWidth / landscapeHeight;

  // Calculate window aspect ratio
  const windowAspectRatio = window.innerWidth / window.innerHeight;

  // If window is narrower (more portrait) than the image, use mobile landscape version
  const isMobile = windowAspectRatio < imageAspectRatio;

  const landscapeSrc = '../../images/Cards/2024-NIHSS-Card-Scene-Landscape.png';
  const desktopSrc = '../../images/Cards/2024-NIHSS-Card-Scene.png';

  img.src = isMobile ? landscapeSrc : desktopSrc;
}

// Update on load and on window resize
document.addEventListener('DOMContentLoaded', updateCardImage);
window.addEventListener('resize', updateCardImage);
