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

# m2a
- Cmd+V is pressed when the focus is on the body and not on an input: instead of copying the url to the clipboard,
  - Pause the video if it is playing
  - Open a text prompt to enter a name
  - After getting the text, store the data into local storage (the format is documented below)
- The local storage will store the data in the following format:
  - key is "copy-youtube-link"
  - value is a JSON string consisting of a list that you append objects to. The object will have
    - `name`: the name you entered
    - `url`: the url (without the timestamp info)
    - `startMs`: the current time of the video in whole number in milliseconds unit
    - `endMs`: set it to 7000ms + startMs initially
- `v` is pressed when the focus is on the body and not on an input: update the endMs of the last object to the current video time but only if the object's url matches with the url of the current video.
- Add the following to the extension menu
  - Copy the JSON list string (pretty format, indented 2 spaces)
  - Clear the JSON (setting it to an empty list)
