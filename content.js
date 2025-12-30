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

  // Handle 's' key press for saving video segment
  if (event.key === 's' && !isInputFocused && !event.metaKey && !event.ctrlKey) {
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
      
      // Show custom modal for segment name
      showSegmentNameModal(video.currentTime, wasPlaying);
    }
  }

  // Handle 'd' key press for updating segment end time
  if (event.key === 'd' && !isInputFocused && !event.metaKey && !event.ctrlKey) {
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

  .segment-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .segment-modal {
    background: #1f1f1f;
    border: 2px solid #065fd4;
    border-radius: 8px;
    padding: 24px;
    min-width: 400px;
    max-width: 500px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    font-family: 'Roboto', Arial, sans-serif;
  }

  .segment-modal h3 {
    color: #fff;
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 500;
  }

  .segment-modal input {
    width: 100%;
    padding: 12px;
    border: 1px solid #333;
    border-radius: 4px;
    background: #0f0f0f;
    color: #fff;
    font-size: 16px;
    font-family: inherit;
    box-sizing: border-box;
  }

  .segment-modal input:focus {
    outline: none;
    border-color: #065fd4;
    box-shadow: 0 0 0 2px rgba(6, 95, 212, 0.2);
  }

  .segment-modal-buttons {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
  }

  .segment-modal-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
  }

  .segment-modal-button.primary {
    background: #065fd4;
    color: #fff;
  }

  .segment-modal-button.primary:hover {
    background: #0856c7;
  }

  .segment-modal-button.secondary {
    background: #333;
    color: #fff;
  }

  .segment-modal-button.secondary:hover {
    background: #444;
  }

  .segment-modal-hint {
    color: #aaa;
    font-size: 12px;
    margin-top: 8px;
  }
`;
document.head.appendChild(style);

// Show custom modal for segment name input
function showSegmentNameModal(currentTime, wasPlaying) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'segment-modal-overlay';
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'segment-modal';
  
  // Create modal content
  modal.innerHTML = `
    <h3>Save Video Segment</h3>
    <input type="text" id="segmentNameInput" placeholder="Enter segment name..." maxlength="100">
    <div class="segment-modal-hint">Press Enter to save or Esc to cancel</div>
    <div class="segment-modal-buttons">
      <button class="segment-modal-button secondary" id="cancelBtn">Cancel</button>
      <button class="segment-modal-button primary" id="saveBtn">Save</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Get elements
  const input = modal.querySelector('#segmentNameInput');
  const saveBtn = modal.querySelector('#saveBtn');
  const cancelBtn = modal.querySelector('#cancelBtn');
  
  // Focus input
  input.focus();
  
  // Handle save
  function handleSave() {
    const name = input.value.trim();
    if (name) {
      saveVideoSegment(name, currentTime, wasPlaying);
      closeModal();
    } else {
      input.focus();
    }
  }
  
  // Handle cancel
  function handleCancel() {
    if (wasPlaying) {
      const video = document.querySelector('video');
      if (video) {
        video.play();
      }
    }
    closeModal();
  }
  
  // Close modal
  function closeModal() {
    document.body.removeChild(overlay);
  }
  
  // Event listeners
  saveBtn.addEventListener('click', handleSave);
  cancelBtn.addEventListener('click', handleCancel);
  
  // Keyboard handling
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      handleCancel();
    }
  });
}
