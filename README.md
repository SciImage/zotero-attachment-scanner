# Attachment Scanner (for Zotero v.7.0+)
**Attachment Scanner** is a **[Zotero](https://www.zotero.org/)** plugin designed to scan attachments and add tags to items with no, missing, or duplicate attachments. It functions similarly to the **[Zotero Storage Scanner](https://github.com/retorquere/zotero-storage-scanner)** plugin but is compatible with Zotero v.7.0.

## Plugin Functions and Features
- Scan all attachments and:
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
1. Start scanning by selecting the “Scan attachments” menu item in the “Tools” menu.
2. Change options and tags in Zotero’s settings window. These settings become read-only during scanning but revert to normal once scanning is complete.
![Preference window](/preference.png?raw=true "Preference window")
