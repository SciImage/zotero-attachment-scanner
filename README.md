Attachment Scanner (for Zotero v.7.0+)
=====
**Attachment Scanner** is a **[Zotero](https://www.zotero.org/)** plugin designed to scan attachments and add tags to items with no, missing, or duplicate attachments. It functions similarly to the **[Zotero Storage Scanner](https://github.com/retorquere/zotero-storage-scanner)** plugin but is compatible with Zotero v.7.0.

Plugin Functions and Features
-----
- Scan attachments of all items or those of the selected items, and:
  - Add tags to items with any missing attachments
  - Optionally, add tags to items with no attachment
  - Optionally, add tags to items with duplicate attachments of the same type
  - Optionally, add tags to items with non-file attachments
  - Optionally, remove all “PubMed entry” attachments
- Customizable tags: You can use any tags; three predefined sets of tags are available with a click.
- Tag updating: Customization applies to all existing tags without rescanning.
- Progress tracking: The scanning progress is displayed in a window.
- Real-time monitoring: Adding or deleting attachments triggers automatic tag updates.
- Identical file removal (hidden, see Technical Notes): delete attachments linking to the same file.

Installation
-----
### New Installation
   1. Download the latest release.
   2. Open the Zotero plugins screen (Menu --> Tools --> Plugins).
   3. Click the gear icon (⚙) in the top-right corner and select “Install Plugin From File…”.
   4. Choose the downloaded .xpi file.

### Update
   1. Open the Zotero plugins screen (Menu --> Tools --> Plugins).
   2. Click the gear icon (⚙) in the top-right corner and select “Check for updates”.

Usage
-----
1. Start scanning all items by selecting the “Scan All Attachments” menu item in the “Tools” menu.
2. After selecting items, start scanning by selecting the “Scan Attachments of Selected Items” menu item in the right-click menu.
3. Click “Cancel Attachment Scanning” menu item in the “Tools” menu to cancel a scan.
4. Change options and tags in Zotero’s settings window. These settings become read-only during scanning but revert to normal once scanning is complete.
![Preference window](/others/preference.png?raw=true "Preference window")

Technical Notes
-----
1. Zotero can have regular file attachments and non-file attachements. The “PubMed entry” attachments are a type of non-file attachements.
2. Each file attachment has a “content type”, similar to a [MIME type](https://en.wikipedia.org/wiki/Media_type), which is primarily determined by the file's extension. “Duplicate attachments of the same type” refer to multiple files with the same content type, such as two PDF files or three .xlsx files. However, a PDF file and a .xlsx file are not considered duplicates because they have different content types.
3. Zotero has a bug where the icons in the context menu do not appear the first time the menu is displayed. It can't be fixed by a plugin.
4. Zotero has a bug on Mac: where the main window is closed and reopened, some main menu items disappear or lose their icons. This is fixed by the plugin.
5. Some library items have multiple attachments linking to the same file. The plugin includes a menu command to delete these duplicates. By default, this command is hidden because it can cause **FILE LOSS** if **[ZotMoov](https://github.com/wileyyugioh/zotmoov)** is installed and its “Auto Delete External Linked Files” feature is enabled. To display the menu command, set `extensions.attachmentscanner.show_remove_same_file` to `true` in Zotero's [Config Editor](https://www.zotero.org/support/preferences/hidden_preferences). It is strongly recommended that users set this option back to `false` after using it.
> [!CAUTION]
> **Identical file removal** should never be used alongside any plugins with automatic file-deleting functions. During scanning, this plugin only moves the duplicated attachments to the Trash, so no files are lost initially. However, when the Trash is emptied, **ZotMoov** will delete the file from the disk, leading to unexpected file loss.