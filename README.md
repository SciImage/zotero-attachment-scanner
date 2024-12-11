# Attachment Scanner (for Zotero v.7.0+)
**Attachment Scanner** is a **[Zotero](https://www.zotero.org/)** plugin designed to scan attachments and add tags to items with no, missing, or duplicate attachments. It functions similarly to the **[Zotero Storage Scanner](https://github.com/retorquere/zotero-storage-scanner)** plugin but is compatible with Zotero v.7.0.

## Plugin Functions and Features
- Scan attachments of all items or those of the selected items, and:
  - Add tags to items with no attachment
  - Add tags to items with any missing attachments
  - Optionally, add tags to items with duplicate attachments of the same type
  - Optionally, add tags to items with non-file attachments
  - Optionally, remove all “PubMed entry” attachments
- Customizable tags: You can use any tags; three predefined sets of tags are available with a click.
- Tag updating: Customization applies to all existing tags without rescanning.
- Progress tracking: The scanning progress is displayed in a window.
- Real-time monitoring: Adding or deleting attachments triggers automatic tag updates.

## Installation
1. Download the latest release.
2. Open the Zotero plugins screen (Menu --> Tools --> Plugins).
3. Click the gear icon (⚙) in the top-right corner and select “Install Plugin From File…”.
4. Choose the downloaded .xpi file.

## Usage
1. Start scanning all items by selecting the “Scan All Attachments” menu item in the “Tools” menu.
2. After selecting items, start scanning by selecting the “Scan Attachments of Selected Items” menu item in the right-click menu.
3. Click "Cancel Attachment Scanning" menu item in the “Tools” menu to cancel a scan.
4. Change options and tags in Zotero’s settings window. These settings become read-only during scanning but revert to normal once scanning is complete.
![Preference window](/others/preference.png?raw=true "Preference window")

## Technical Notes
1. Zotero can have regular file attachments and non-file attachements. The “PubMed entry” attachments are a type of non-file attachements.
2. Each file attachment has a "content type," similar to a [MIME type](https://en.wikipedia.org/wiki/Media_type), which is primarily determined by the file's extension. "Duplicate attachments of the same type" refer to multiple files with the same content type, such as two PDF files or three .xlsx files. However, a PDF file and a .xlsx file are not considered duplicates because they have different content types.
3. Zotero has a bug where the icons in the context menu do not appear the first time the menu is displayed. It can't be fixed by a plugin.
4. Zotero has a bug on Mac: where the main window is closed and reopened, some main menu items disappear or lose their icons. This is fixed by the plugin.