// Listen for keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Check if focus is on an input element
  const activeElement = document.activeElement;
  const isInputFocused = activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.contentEditable === 'true'
  );

  // Handle Cmd+C (Mac) or Ctrl+C (Windows/Linux)
  if ((event.metaKey || event.ctrlKey) && (event.key === 'c' || event.key === 'C')) {
    // Check if there is any text selected
    const selection = window.getSelection();
    const hasTextSelected = selection && selection.toString().length > 0;
    
    // Only intercept if no text is selected and not focused on input
    if (!hasTextSelected && !isInputFocused) {
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
        showCopyFeedback('URL copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy URL:', err);
      });
    }
  }

  // Handle Cmd+V (Mac) or Ctrl+V (Windows/Linux)
  if ((event.metaKey || event.ctrlKey) && (event.key === 'v' || event.key === 'V') && !isInputFocused) {
    event.preventDefault();
    event.stopPropagation();
    
    const video = document.querySelector('video');
    if (video) {
      // Remember if the video was playing
      const wasPlaying = !video.paused;
      
      // Pause the video if it's playing
      if (wasPlaying) {
        video.pause();
      }
      
      // Open text prompt to enter a name
      const name = prompt('Enter a name for this video segment:');
      if (name && name.trim()) {
        saveVideoSegment(name.trim(), video.currentTime, wasPlaying);
      } else if (wasPlaying) {
        // Resume playing if user cancelled and video was playing
        video.play();
      }
    }
    return; // Important: return here to prevent 'v' key handler from running
  }

  // Handle 'v' key press (only if not Cmd+V or Ctrl+V)
  if (event.key === 'v' && !isInputFocused && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    event.stopPropagation();
    
    const video = document.querySelector('video');
    if (video) {
      updateLastSegmentEndTime(video.currentTime);
    }
  }
}, true);

// Show visual feedback
function showCopyFeedback(message) {
  const feedback = document.createElement('div');
  feedback.textContent = message;
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

// Save video segment to local storage
function saveVideoSegment(name, currentTimeSeconds, wasPlaying = false) {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  
  // Remove timestamp parameters to get clean URL
  url.searchParams.delete('t');
  url.searchParams.delete('start');
  const cleanUrl = url.toString();
  
  const startMs = Math.floor(currentTimeSeconds * 1000);
  const endMs = startMs + 7000; // 7 seconds later
  
  const segment = {
    name: name,
    url: cleanUrl,
    startMs: startMs,
    endMs: endMs
  };
  
  // Get existing data from localStorage
  let segments = [];
  try {
    const existingData = localStorage.getItem('copy-youtube-link');
    if (existingData) {
      segments = JSON.parse(existingData);
    }
  } catch (error) {
    console.error('Error parsing existing segments:', error);
    segments = [];
  }
  
  // Add new segment
  segments.push(segment);
  
  // Save back to localStorage
  try {
    localStorage.setItem('copy-youtube-link', JSON.stringify(segments));
    showCopyFeedback(`Segment "${name}" saved!`);
    
    // Resume playing if the video was playing before
    if (wasPlaying) {
      const video = document.querySelector('video');
      if (video) {
        video.play();
      }
    }
  } catch (error) {
    console.error('Error saving segment:', error);
    showCopyFeedback('Error saving segment');
  }
}

// Update the end time of the last segment
function updateLastSegmentEndTime(currentTimeSeconds) {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  
  // Remove timestamp parameters to get clean URL
  url.searchParams.delete('t');
  url.searchParams.delete('start');
  const cleanUrl = url.toString();
  
  try {
    const existingData = localStorage.getItem('copy-youtube-link');
    if (!existingData) {
      showCopyFeedback('No segments found');
      return;
    }
    
    const segments = JSON.parse(existingData);
    if (segments.length === 0) {
      showCopyFeedback('No segments found');
      return;
    }
    
    // Find the last segment with matching URL
    let lastMatchingIndex = -1;
    for (let i = segments.length - 1; i >= 0; i--) {
      if (segments[i].url === cleanUrl) {
        lastMatchingIndex = i;
        break;
      }
    }
    
    if (lastMatchingIndex === -1) {
      showCopyFeedback('No matching segment found for this video');
      return;
    }
    
    // Update the end time
    const endMs = Math.floor(currentTimeSeconds * 1000);
    segments[lastMatchingIndex].endMs = endMs;
    
    // Save back to localStorage
    localStorage.setItem('copy-youtube-link', JSON.stringify(segments));
    showCopyFeedback(`End time updated for "${segments[lastMatchingIndex].name}"`);
    
  } catch (error) {
    console.error('Error updating segment end time:', error);
    showCopyFeedback('Error updating segment');
  }
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
