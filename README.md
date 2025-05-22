# Chrome History Deleter Extension

A simple and powerful Chrome extension that allows you to delete browser history by domain or keyword with bulk operations and domain trash list management.

## Features

- **🔍 Search & Delete**: Find and delete history entries by domain or keyword
- **📋 Domain Trash List**: Add frequently deleted domains to a list for quick bulk deletion
- **👀 Preview Before Delete**: Use the "Find" feature to preview URLs before deletion
- **🔄 Batch Processing**: Automatically deletes history in batches of 100 until all matches are removed
- **💾 Persistent Storage**: Domain trash list is saved between browser sessions

## Installation

### From Chrome Web Store
*Coming soon - extension is pending review*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your toolbar

## How to Use

### Search & Delete
1. Click the extension icon in your Chrome toolbar
2. Enter a domain (e.g., `facebook.com`) or keyword (e.g., `maps`) in the search box
3. Click **"Find"** to preview matching URLs (up to 100 shown)
4. Click **"Delete"** to remove all matching history entries

### Domain Trash List
1. Enter a domain in the "Add domain to list..." field
2. Click **"Add"** to add it to your trash list
3. Repeat for multiple domains
4. Click **"TRASH LISTED DOMAINS"** to delete history for all domains in the list
5. Use **"Remove"** next to any domain to remove it from the list

## Permissions

This extension requires the following permissions:
- **History**: To search and delete browser history entries
- **Storage**: To save your domain trash list between sessions

## Privacy

- No data is collected or transmitted to external servers
- All operations are performed locally in your browser
- Domain trash list is stored locally using Chrome's storage API

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Batch Size**: 100 items per batch (Chrome API limitation)
- **History Range**: Searches entire browser history (up to 20 years back)
- **Storage**: Uses Chrome's local storage API for persistence

## Development

### Project Structure
```
├── manifest.json          # Extension configuration
├── popup.html             # Main UI interface
├── popup.js               # Core functionality
├── icon16.png             # 16x16 icon
├── icon32.png             # 32x32 icon
├── icon48.png             # 48x48 icon
├── icon128.png            # 128x128 icon
├── LICENSE                # MIT License
└── README.md              # This file
```

### Local Development
1. Make changes to the code
2. Go to `chrome://extensions/`
3. Find the extension and click the refresh icon
4. Test your changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**delucasso** - [@DeLucasso](https://x.com/DeLucasso)

## Support

If you encounter any issues or have suggestions, please:
1. Check the [Issues](../../issues) page
2. Create a new issue if your problem isn't already reported
3. Follow [@DeLucasso](https://x.com/DeLucasso) for updates

---

⚠️ **Warning**: This extension permanently deletes browser history. Use with caution and make sure you want to remove the selected history entries before proceeding.