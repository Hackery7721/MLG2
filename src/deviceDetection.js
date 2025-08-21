export function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
    // Combined regex for mobile and tablet devices
    const deviceRegex = /Mobi|Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile|Mobile Safari|UCWEB|Tablet|PlayBook|Silk/i;
  
    // Check for touch capability
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  
    // Screen size filters for mobile and tablet
    const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches; // Mobile and tablet
    const isMediumScreen = window.matchMedia("(min-width: 600px) and (max-width: 1024px)").matches; // Tablet
  
    // Mobile or tablet detection
    const isMobile = /Mobi|Android|iPhone|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile|Mobile Safari|UCWEB/i.test(userAgent);
    const isTablet = /Tablet|iPad|PlayBook|Silk/i.test(userAgent);
  
    return (
      deviceRegex.test(userAgent) ||
      (isTouchDevice && (isSmallScreen || isMediumScreen)) ||
      isMobile ||
      isTablet
    );
  }
  
  // Utility function to detect desktop devices
  export function isDesktopDevice() {
    return !isMobileDevice();
  }
  