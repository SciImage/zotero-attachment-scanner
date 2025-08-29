# Attachment Scanner Change log

## 0.4.1, 2025-08-29
- Check relative paths when scanning the Attachment Base Directory
- Bug fix: Prevent 'Attchement not loaded for ..." error messages in the logs
- Bug fix: Fix Simplified Chinese translation

## 0.4.0, 2025-08-14
- Add an option to remove Snapshots
- Add an option to remove missing attachments (Use with caution)
- Add a column to show numbers of attachements
- Add a column to show total sizes of attachements
- Add a menu item to scan and report orphan files in the Attachment Base Directory.
- Make significant changes to the bootloader
- Bug fix: Reenabling the plugin is not possible after it has been disabled.

## 0.3.2, 2025-04-30
- Bug fix: Restore the function of Change Monitor.

## 0.3.1, 2025-04-12
- Bug fix: When Change Monitor is on, the "No source" tag is added to modifided notes.

## 0.3.0, 2024-12-18
- Allow to ignore attachments with certain filenames when checking for duplicates
- Introduce an option to delete attachments linking to the same file
- Change the default setting of Real-time monitoring to off
- Add a help link to the settings screen
- Bug fix: Setting of Real-time monitoring is not effective before restarting Zotero

## 0.2.1, 2024-12-12
- Introduce an option to disable tagging items with no attachments
- Correct the display of menu items that are shown in the wrong locale due to Zotero bugs
- Resolve the issue of scanning hanging due to unexpected errors on Linux

## 0.2.0, 2024-12-11
- Add an option to disable real-time monitoring
- Add a popup menu item to scan only selected items
- Add a menu item to cancel a scan
- Add an icon to menu items and the progress window

## 0.1.0 (first release), 2024-12-06
- Scan all attachments and:
  - Add tags to items with no attachment
  - Add tags to items with any missing attachments
  - Optionally, add tags to items with duplicate attachments of the same type
  - Optionally, add tags to items with non-file attachments
  - Optionally, remove all ¡°PubMed entry¡± attachments
- Customizable tags: You can use any tags; three predefined sets of tags are available with a click.
- Tag updating: Customization applies to all existing tags without rescanning.
- Progress tracking: The scanning progress is displayed in a window.
- Real-time monitoring: Adding or deleting attachments triggers automatic tag updates.
