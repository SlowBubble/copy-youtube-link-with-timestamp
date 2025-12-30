# copy-youtube-link

Chrome extension for managing YouTube video timestamps and segments. The extension runs only on `youtube.com` pages.

## Installation (developer mode):

1. Open Chrome and go to chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked" and select this repository folder

## Features:

### Copy URL with Timestamp
- Press **Cmd+C** (Mac) or **Ctrl+C** (Windows/Linux) with no text selected
- Copies the current YouTube URL with timestamp to clipboard
- If text is selected, normal copy behavior is preserved

### Save Video Segments
- Press **s** when not focused on an input field
- Pauses the video if playing
- Opens a prompt to enter a name for the segment
- Saves the segment with current timestamp to local storage

### Update Segment End Time
- Press **d** when not focused on an input field
- Updates the end time of the last saved segment for the current video
- Only works if there's a matching segment for the current video URL

### Extension Menu
Click the extension icon to access:
- **Copy JSON Data**: Copies all saved segments as formatted JSON (2-space indentation)
- **Clear All Data**: Removes all saved segments after confirmation

## Data Format

Segments are stored in localStorage with key `"copy-youtube-link"` as a JSON array:

```json
[
  {
    "name": "Introduction",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "startMs": 15000,
    "endMs": 22000
  }
]
```

- `name`: User-provided name for the segment
- `url`: Clean YouTube URL without timestamp parameters
- `startMs`: Start time in milliseconds
- `endMs`: End time in milliseconds (initially startMs + 7000ms)

## Permissions

The extension requires the following permissions:

- **`clipboardWrite`**: Allows copying URLs and JSON data to the clipboard when using Cmd+C or the "Copy All" button
- **`storage`**: Enables access to localStorage for saving and retrieving video segments on YouTube pages
- **`scripting`**: Required for the popup to execute scripts on the active YouTube tab to read/modify segment data
- **`activeTab`**: Grants access to the currently active tab to interact with YouTube videos and localStorage
