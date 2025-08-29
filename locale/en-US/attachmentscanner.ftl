## Menu items
attachmentscanner-start-scan = Scan All Attachments
attachmentscanner-start-scan-selected = Scan Attachments of Selected Items
attachmentscanner-cancel-scan = Cancel Attachment Scanning
attachmentscanner-scan-orphans = Scan Attachment Base Directory for Orphaned Files
attachmentscanner-remove-same-link = Delete attachements linked to the same file
attachmentscanner-attachment-number = Attachement Number
attachmentscanner-attachment-size = Attachment Size (SLOW)

## Message
attachmentscanner-scan-title = Scanning attachements
attachmentscanner-scan-progreess = Scanning {$index} of {$total} items...
attachmentscanner-error-auto-delete = Stop!!! ZotMoov is installed and its "Automatically Delete External Linked Files in the ZotMoov Directory" is on.
attachmentscanner-warning-auto-delete = This may lead to file loss if ZotMoov-like plugins are installed and their auto file delete function is on. Do you want to continue?

attachmentscanner-orphan-1 = 1 orphaned file
attachmentscanner-orphan-n = {$orphan} orphaned files
attachmentscanner-junk-1 = 1 system junk file
attachmentscanner-junk-n = {$junk} system junk files
attachmentscanner-empty-dir-1 = 1 directory with no attachments
attachmentscanner-empty-dir-n = {$empty-dir} directories with no attachments
attachmentscanner-separator = {", "}
attachmentscanner-last-separator = {" and "}
attachmentscanner-no-orphan = Your Attachment Base Directory is well organized!!!
attachmentscanner-no-orphan-with-abs-1 = Your Attachment Base Directory is well organized but 1 file uses absolute file path.
attachmentscanner-no-orphan-with-abs-n = Your Attachment Base Directory is well organized but {$abs} files use absolute file path.
attachmentscanner-abs-warning-1 = !!! 1 file in your Attachment Base Directory uses absolute file path and may be detected as an orphan file.
attachmentscanner-abs-warning-n = !!! {$abs} files in your Attachment Base Directory use absolute file path and may be detected as orphan files.
attachmentscanner-orphan-found-1 = {$found} is found in the Attachment Base Directory.
attachmentscanner-orphan-found-n = {$found} are found in the Attachment Base Directory.
attachmentscanner-prmopt-copy-close = Copy and close

## Settings
attachmentscanner-prefs-title = Attachments

## Settings - Options
attachmentscanner-section-scanning = Scanning options
attachmentscanner-scan-nosource =
    .label = Tag items without file attachment
attachmentscanner-scan-nonfiles =
    .label = Tag items with non-file attachments
attachmentscanner-scan-duplicates =
    .label = Tag items with duplicate same-type attachments
attachmentscanner-ignore-file-masks = Ignore files whose names contain
attachmentscanner-masks-hint =
    .placeholder = Allows multiple Regex: abc; [Dd]ef; /si/i
attachmentscanner-remove-pubmed-entry =
    .label = Remove all "PubMed entry" attachments
attachmentscanner-remove-snapshot =
    .label = Remove snapshots from items that have PDF/EPUB attachments
attachmentscanner-remove-broken =
    .label = Remove missing attachments (Use with caution; ignored by the attachment monitor)

attachmentscanner-section-more = Other options
attachmentscanner-monitor-change =
    .label = Monitor attachments and update tags
attachmentscanner-monospace-font =
    .label = Use a monospace font for the “Attachement Size” column
attachmentscanner-orphan-ignore =
    .label = Ignore
attachmentscanner-orphan-report =
    .label = Report
attachmentscanner-orphan-delete =
    .label = Delete
attachmentscanner-orphan-files = junk files (<code>desktop.ini</code>, <code>thumbs.db</code>, and <code>.ds_store</code>) when scanning for orphan files

## Settings - Tags
attachmentscanner-section-tags = Tags for items with unusual attachments
attachmentscanner-section-tags-desc = If modified, items with the old tags will be updated after you leave this window or start a scan.
attachmentscanner-tag-nosource = No attachment:
attachmentscanner-tag-broken = Missing attachments:
attachmentscanner-tag-duplicate = Duplicate attachments:
attachmentscanner-tag-nonfile = Non-file attachments:
attachmentscanner-use-zss-tags = Use tags in "Zotero Storage Scanner"
attachmentscanner-use-simple-tags = Use simple tags
attachmentscanner-use-emoji-tags = Use Emoji tags