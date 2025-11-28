// Listen for Cmd+C (Mac) or Ctrl+C (Windows/Linux) keyboard shortcut
document.addEventListener('keydown', (event) => {
  // Check if Cmd+C (Mac) or Ctrl+C (Windows/Linux) is pressed
  if ((event.metaKey || event.ctrlKey) && (event.key === 'c' || event.key === 'C')) {
    // Check if there is any text selected
    const selection = window.getSelection();
    const hasTextSelected = selection && selection.toString().length > 0;
    
    // Only intercept if no text is selected
    if (!hasTextSelected) {
      event.preventDefault();
      event.stopPropagation();
      
      // Get current page URL
      let currentUrl = window.location.href;
      
      // Try to get the current video time
      const video = document.querySelector('video');
      if (video && !isNaN(video.currentTime)) {
        const currentTime = Math.floor(video.currentTime);
        
        // Parse the URL
        const url = new URL(currentUrl);
        
        // Add or update the t parameter
        url.searchParams.set('t', `${currentTime}s`);
        
        currentUrl = url.toString();
      }
      
      // Copy to clipboard
      navigator.clipboard.writeText(currentUrl).then(() => {
        // Show visual feedback
        showCopyFeedback();
      }).catch(err => {
        console.error('Failed to copy URL:', err);
      });
    }
  }
}, true);

// Show visual feedback when URL is copied
function showCopyFeedback() {
  const feedback = document.createElement('div');
  feedback.textContent = 'URL copied to clipboard!';
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #065fd4;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease-out;
  `;
  
  document.body.appendChild(feedback);
  
  // Remove feedback after 2 seconds
  setTimeout(() => {
    feedback.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(-100px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
