Attachment Scanner Settings
=======

Options
-------
Turn on/off specific functions.
### Tag items without file attachment
When enabled, the plugin tags items with the “No attachment” tag if they lack file attachments, even if they have non-file attachments.

### Scan items for duplicate same-type attachments
When enabled, the plugin tags items with the “Duplicate attachments” tag if they have two or more attachments of the same content type. The content type, similar to a [MIME type](https://en.wikipedia.org/wiki/Media_type), is mainly determined by the file’s extension. For instance, items with two PDF attachments are considered duplicates, whereas an item with a PDF and a .xlsx attachment is not.

#### Ignore files whose names contain
Attachments with file names matching these masks will be ignored during duplicate checking. Separate multiple masks with a semicolon (;).". Internally, these masks are trimed and converted to RegEx. Examples,
- `abc; [dD]ef `: matches names with either “abc”, “def” or "Def", case-sensitive.
- `abc/i; def `: matches names with either “abc” (case-insensitive) or “def” (case-sensitive).
- `/ abc; def `: matches names with either “ abc” or “def”, case-sensitive.

### Scan items for non-file attachments
When enabled, the plugin tags items with non-file attachments with the “Non-file attachments” tag. Zotero items can have non-file attachments that contain meta-data.

### Remove all “PubMed entry” attachments
When enabled, the plugin removes all non-file attachments whose names are “PubMed entry”. These attachements are added by Zotero to items from PubMed and some journals.

### Monitor attachments and update tags
When enabled, the plugin will perform all checking operations whenever an item or attachment is added or deleted from the library.


Tags for items with unusual attachments
-------
Customize the tags used. After changing the tags, items with the old tags will be updated once this settings window loses focus or when a scan is initiated.

Click one of the three buttons to use the preset tags.

|                       | “Zotero Storage Scanner” tags      | Simple tags | Emoji tags   |
| --------------------: | ---------------------------------- | ----------- | ------------ |
| No attachment         | #nosource                          | #nosource   | ❌ nosource  |
| Missing attachments   | #broken_attachments                | #broken     | 🚫 broken    |
| Duplicate attachments | #multiple_attachments_of_same_type | #duplicate  | ‼️ duplicate |
| Non-file attachments  | #non_file_attachments              | #nonfile    | ❓ nonfile   |
