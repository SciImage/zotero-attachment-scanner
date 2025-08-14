Attachment Scanner (for Zotero v.7.0+)
=====
**Attachment Scanner** is a **[Zotero](https://www.zotero.org/)** plugin designed to scan attachments and add tags to items with no, missing, or duplicate attachments. It functions similarly to the **[Zotero Storage Scanner](https://github.com/retorquere/zotero-storage-scanner)** plugin but is compatible with Zotero v.7.0. Several attachment-related features have been introduced through updates, including real-time monitoring, orphan file scanning, snapshot removal, and customizable columns.

Plugin Functions and Features
-----
- Scan attachments of all items or those of the selected items, and:
  - Add tags to items with any missing attachments
  - Optionally, add tags to items with no attachment
  - Optionally, add tags to items with duplicate attachments of the same type
  - Optionally, add tags to items with non-file attachments
  - Optionally, remove all “PubMed entry” attachments
  - Optionally, remove snapshots from items that have PDF/EPUB attachments
  - Optionally, remove missing attachments (*Use with caution*)
- Scan Attachment Base Directory for files that are not linked to Zotero's items
- Add customized columns to the item table
  - Attachement Number
  - Total Attachement Size
- Identical file removal (hidden, see Technical Notes): delete attachments linking to the same file.

### Features
- Customizable tags: You can use any tags; three predefined sets of tags are available with a click.
- Tag updating: Customization applies to all existing tags without rescanning.
- Progress tracking: The scanning progress is displayed in a window.
- Job cancelling: The scanning can be cancelled.
- Real-time monitoring: Adding or deleting attachments triggers automatic tag updates.

> [!CAUTION]
> Although the **Remove Missing Attachments** feature does not delete any files and the broken attachments can be restored from the trash, this can lead to significant issues if file syncing lags behind library synchronization.</br>
> This option resets upon every Zotero startup.

Installation
-----
### New Installation
   1. Download the .xpi file from [the latest release](https://github.com/SciImage/zotero-attachment-scanner/releases/latest) (Firefox users: Right click and save the file).
   2. Open the Zotero plugins screen (Menu --> Tools --> Plugins).
   3. Click the gear icon (⚙) in the top-right corner and select “Install Plugin From File…”.
   4. Choose the downloaded .xpi file.

### Update
   1. Open the Zotero plugins screen (Menu --> Tools --> Plugins).
   2. Click the gear icon (⚙) in the top-right corner and select “Check for updates”.

Usage
-----
### Check Attachment Integrity
1. Start scanning all items by selecting the “Scan All Attachments” menu item in the “Tools” menu, or
2. Select some items and start scanning by selecting the “Scan Attachments of Selected Items” menu item in the right-click menu.
3. Click “Cancel Attachment Scanning” menu item in the “Tools” menu to cancel a scan.

### Check files in the Attachment Base Directory
1. Select “Scan Attachment Base Directory for Orphaned Files” menu item in the “Tools” menu. The menu item is only available when the Attachment Base Directory is set.
2. Click “Cancel Attachment Scanning” menu item in the “Tools” menu to cancel.
> [!NOTE]
> The function only scans and copies the list of files to the clipboard. It does not delete any files. I have *no plans* to add file removal functionality, as it results in irreversible data loss.

### Add columns
1. Right-click on the header of the item table, select “Attachment Size (SLOW)” or “Attachment Number” from the popup menu.
> [!NOTE]
> “Attachment Size (SLOW)” is for managing attachments. Because attachment size isn't stored in the library and must be read from disk each time an item is displayed, showing the column or using it for sorting could lead to significant performance issues. For that reason, users should *hide the column* and *use other fields for sorting* once they're done managing attachments.<br/>
> “Attachment Number” does not have performance issue.

### Settings
See [here](https://github.com/SciImage/zotero-attachment-scanner/blob/main/others/preference_help.md)  for more details.
![Preference window](/others/preference.png?raw=true "Preference window")

Technical Notes
-----
1. Zotero can have regular file attachments and non-file attachements. The “PubMed entry” attachments are a type of non-file attachements.
2. Each file attachment has a “content type”, similar to a [MIME type](https://en.wikipedia.org/wiki/Media_type), which is primarily determined by the file's extension. “Duplicate attachments of the same type” refer to multiple files with the same content type, such as two PDF files or three .xlsx files. However, a PDF file and a .xlsx file are not considered duplicates because they have different content types.
3. Zotero has a bug where the icons in the context menu do not appear the first time the menu is displayed. It can't be fixed by a plugin.
4. Zotero has a bug on Mac: where the main window is closed and reopened, some main menu items disappear or lose their icons. This is fixed by the plugin.
5. Zotero has a setting that allows “Automatically take snapshots when creating items from web pages”. Turning it off can prevent the creation of snapshots.
6. Some library items have multiple attachments linking to the same file. The plugin includes a menu command to delete these duplicates. By default, this command is hidden because it can cause **FILE LOSS** if **[ZotMoov](https://github.com/wileyyugioh/zotmoov)** is installed and its “Auto Delete External Linked Files” feature is enabled. To display the menu command, set `extensions.attachmentscanner.show_remove_same_file` to `true` in Zotero's [Config Editor](https://www.zotero.org/support/preferences/hidden_preferences). It is strongly recommended that users set this option back to `false` after using it.
> [!CAUTION]
> **Identical file removal** should never be used alongside any plugins with automatic file-deleting functions. During scanning, this plugin only moves the duplicated attachments to the Trash, so no files are lost initially. However, when the Trash is emptied, **ZotMoov** will delete the file from the disk, leading to unexpected file loss.
