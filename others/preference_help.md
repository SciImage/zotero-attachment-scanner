Attachment Scanner Settings
=======

Scanning Options
-------
Turn on/off specific functions.
### Tag items without file attachment
When enabled, the plugin tags items with the “No attachment” tag if they lack file attachments, even if they have non-file attachments.

### Scan items for non-file attachments
When enabled, the plugin tags items with non-file attachments with the “Non-file attachments” tag. Zotero items can have non-file attachments that contain meta-data.

### Scan items for duplicate same-type attachments
When enabled, the plugin tags items with the “Duplicate attachments” tag if they have two or more attachments of the same content type. The content type, similar to a [MIME type](https://en.wikipedia.org/wiki/Media_type), is mainly determined by the file’s extension. For instance, items with two PDF attachments are considered duplicates, whereas an item with a PDF and a .xlsx attachment is not.

#### Ignore files whose names contain
Attachments with file names matching these masks will be ignored during duplicate checking. Separate multiple masks with a semicolon (`;`). Internally, these masks are trimmed and converted to RegEx. Examples,
- `abc; [dD]ef `: matches names with either “abc”, “def” or “Def”, case-sensitive.
- `abc/i; def `: matches names with either “abc” (case-insensitive) or “def” (case-sensitive).
- `/ abc; def `: matches names with either “ abc” or “def”, case-sensitive.

### Remove all “PubMed entry” attachments
When enabled, the plugin removes all non-file attachments whose names are “PubMed entry”. These attachments are added by Zotero to items from PubMed and some journals.

### Remove snapshots from items that have PDF attachments
When creating an item from a web page, Zotero may automatically save a snapshot—based on a setting in the General section—even if a PDF is detected. If enabled, this option will remove snapshots from items that include PDF attachments.

### Remove missing attachments
When enabled, missing attachments will be removed from items. This will not be make any changes to the file system.
> [!CAUTION]
> Although the **Remove Missing Attachments** feature does not delete any files and the broken attachments can be restored from the trash, this can lead to significant issues if file syncing lags behind library synchronization.</br>
> This option resets upon every Zotero startup.

Other Options
-------
### Monitor attachments and update tags
When enabled, the plugin will perform all selected checking operations, except “Remove missing attachments”, whenever an item or attachment is added or deleted from the library.

### Use a monospace font for the “Attachement Size” column
The default font used in the item table is proportional, which causes numbers to be misaligned and harder to compare. This option changes the font in the “Attachement Size” column to a fixed-width (monospace) font for better alignment and readability.

### Ignore/report/delete junk files
When scanning the “Attachment Base Directory” for orphan files—those not linked to any Zotero library item—the scanner must decide how to handle junk files. It can either ignore them, include them in the list of orphan files, or delete them from the file system.

Tags for items with unusual attachments
-------
Customize the tags used. After changing the tags, items with the old tags will be updated once this settings window loses focus or when a scan is initiated.

Click one of the three buttons to use the preset tags.

|                       | “Zotero Storage Scanner” tags      | Simple tags | Emoji tags   |
| --------------------: | ---------------------------------- | ----------- | ------------ |
| No attachment         | #nosource                          | #nosource   | ❌ nosource  |
| Missing attachments   | #broken_attachments                | #broken     | 🚫 broken    |
| Non-file attachments  | #non_file_attachments              | #nonfile    | ❓ nonfile   |
| Duplicate attachments | #multiple_attachments_of_same_type | #duplicate  | ‼️ duplicate |
