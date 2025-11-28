# copy-youtube-link

Chrome extension that copies the current YouTube page URL to the clipboard when you press Alt+C. The extension runs only on `youtube.com` pages.

Installation (developer mode):

1. Open Chrome and go to chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked" and select this repository folder

Usage:
- Navigate to any page on `youtube.com`.
- Press Cmd+C (Mac) or Ctrl+C (Windows/Linux) with no text selected. The current page URL (with timestamp if video is playing) will be copied to your clipboard.
- If you have text selected, Cmd+C/Ctrl+C will copy the selected text as normal.
