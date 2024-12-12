# Attachment Scanner Change log

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
