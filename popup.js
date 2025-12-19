document.addEventListener('DOMContentLoaded', function() {
  const copyJsonBtn = document.getElementById('copyJson');
  const clearJsonBtn = document.getElementById('clearJson');
  const segmentListDiv = document.getElementById('segmentList');
  
  // Update segment list display
  async function updateSegmentDisplay() {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs[0] && tabs[0].url.includes('youtube.com')) {
        const results = await chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: getJsonData
        });
        
        if (results && results[0] && results[0].result) {
          const segments = results[0].result;
          displaySegmentList(segments);
        } else {
          displaySegmentList([]);
        }
      } else {
        displaySegmentList([]);
      }
    } catch (error) {
      displaySegmentList([]);
    }
  }
  
  // Display the list of segments
  function displaySegmentList(segments) {
    segmentListDiv.innerHTML = '';
    
    if (segments.length === 0) {
      segmentListDiv.innerHTML = '<div class="no-segments">No segments saved</div>';
      return;
    }
    
    segments.forEach((segment, index) => {
      const segmentDiv = document.createElement('div');
      segmentDiv.className = 'segment-item';
      
      // Create delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.title = 'Delete segment';
      deleteBtn.addEventListener('click', () => deleteSegment(index));
      
      // Calculate duration
      const durationMs = segment.endMs - segment.startMs;
      const durationSeconds = Math.floor(durationMs / 1000);
      const durationText = formatTime(durationSeconds);
      
      // Create duration span
      const durationSpan = document.createElement('span');
      durationSpan.className = 'segment-duration';
      durationSpan.textContent = `[${durationText}]`;
      
      // Create link
      const link = document.createElement('a');
      link.className = 'segment-link';
      
      // Convert startMs to seconds for the URL parameter
      const startSeconds = Math.floor(segment.startMs / 1000);
      const url = new URL(segment.url);
      url.searchParams.set('t', `${startSeconds}s`);
      
      link.href = url.toString();
      link.target = '_blank';
      link.textContent = segment.name;
      
      segmentDiv.appendChild(deleteBtn);
      segmentDiv.appendChild(durationSpan);
      segmentDiv.appendChild(link);
      segmentListDiv.appendChild(segmentDiv);
    });
  }
  
  // Delete a specific segment
  async function deleteSegment(index) {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs[0] && tabs[0].url.includes('youtube.com')) {
        const results = await chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: deleteSegmentByIndex,
          args: [index]
        });
        
        if (results && results[0] && results[0].result) {
          updateSegmentDisplay();
        }
      }
    } catch (error) {
      console.error('Error deleting segment:', error);
    }
  }
  
  // Format seconds to MM:SS or HH:MM:SS
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }
  
  // Copy JSON data to clipboard
  copyJsonBtn.addEventListener('click', async function() {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs[0] && tabs[0].url.includes('youtube.com')) {
        // Get the data from the page
        const results = await chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: getJsonData
        });
        
        if (results && results[0] && results[0].result) {
          const jsonData = results[0].result;
          const prettyJson = JSON.stringify(jsonData, null, 2);
          
          // Copy using popup's clipboard access
          await navigator.clipboard.writeText(prettyJson);
          showFeedback(copyJsonBtn, 'Copied!', 'success');
        } else {
          showFeedback(copyJsonBtn, 'No data found', 'error');
        }
      } else {
        showFeedback(copyJsonBtn, 'Not on YouTube', 'error');
      }
    } catch (error) {
      console.error('Error copying JSON:', error);
      showFeedback(copyJsonBtn, 'Error copying', 'error');
    }
  });
  
  // Clear all data
  clearJsonBtn.addEventListener('click', async function() {
    if (confirm('Are you sure you want to clear all saved segments?')) {
      try {
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        if (tabs[0] && tabs[0].url.includes('youtube.com')) {
          const results = await chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: clearJsonData
          });
          
          if (results && results[0] && results[0].result) {
            showFeedback(clearJsonBtn, 'Cleared!', 'success');
            updateSegmentDisplay();
          } else {
            showFeedback(clearJsonBtn, 'Error clearing', 'error');
          }
        } else {
          showFeedback(clearJsonBtn, 'Not on YouTube', 'error');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        showFeedback(clearJsonBtn, 'Error clearing', 'error');
      }
    }
  });
  
  // Show feedback on button
  function showFeedback(button, message, type) {
    const originalText = button.textContent;
    button.textContent = message;
    button.className = type;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.className = '';
    }, 2000);
  }
  
  // Initialize
  updateSegmentDisplay();
});

// Functions to be injected into the page
function getJsonData() {
  try {
    const data = localStorage.getItem('copy-youtube-link');
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
}

function clearJsonData() {
  try {
    localStorage.setItem('copy-youtube-link', JSON.stringify([]));
    return true;
  } catch (error) {
    return false;
  }
}

function deleteSegmentByIndex(index) {
  try {
    const data = localStorage.getItem('copy-youtube-link');
    if (data) {
      const segments = JSON.parse(data);
      if (index >= 0 && index < segments.length) {
        segments.splice(index, 1);
        localStorage.setItem('copy-youtube-link', JSON.stringify(segments));
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error deleting segment:', error);
    return false;
  }
}