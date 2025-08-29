AttachmentScanner.defineConsts = function() {
    this.zssTag_Nosource  = "#nosource";
    this.zssTag_Broken    = "#broken_attachments";
    this.zssTag_Nonfile   = "#non_file_attachments";
    this.zssTag_Duplicate = "#multiple_attachments_of_same_type";
    this.simTag_Nosource  = "#nosource";
    this.simTag_Broken    = "#broken";
    this.simTag_Nonfile   = "#nonfile";
    this.simTag_Duplicate = "#duplicate";
    this.emoTag_Nosource  = "❌ nosource";
    this.emoTag_Broken    = "🚫 broken";
    this.emoTag_Nonfile   = "❓ nonfile";
    this.emoTag_Duplicate = "‼️ duplicate";
    this.appIcon          = `${this.rootURI}skin/attachscan${(Zotero.hiDPI ? "@2x" : "")}.png`;
}

// === Helper functions ===

AttachmentScanner.getRegExFromText = function (regExps) {
    // regExps is a string containing RegExs separated by ";""
    const ss = regExps.split(";");
    let regExs = [];
    for (let i = 0; i < ss.length; i++) {
        let s = ss[i].trim();
        if (!s) continue;
        if (s.startsWith("/")) s = s.substring(1);
        const l = s.lastIndexOf("/");
        if (l > 0)      // l == 0 --> empty text
            regExs.push(new RegExp(s.substring(0, l - 1), s.substring(l + 1)));
        else if (l < 0)
            regExs.push(new RegExp(s));
    }
    return regExs;
}

AttachmentScanner.getFileSize = function(filename) {
    if (!filename) return 0;
    let file = Components.classes["@mozilla.org/file/local;1"]
       .createInstance(Components.interfaces.nsIFile);
    file.initWithPath(filename);
    return file.fileSize;
}

AttachmentScanner.readPref = function() {
    // Because checking can be fired whenever an item is changed (due to  monitorAttachments),
    // These settings are stored as variables to avoid frequent reading of the preferences.
    this.scanNosource       = this.getPref("scan_nosource");
    this.scanNonfile        = this.getPref("scan_nonfiles");
    this.scanDuplicate      = this.getPref("scan_duplicates");
    this.removePubmedEntry  = this.getPref("remove_pubmed_entry");
    this.removeSnapshot     = this.getPref("remove_snapshot");
    this.removeBroken       = this.getPref("remove_broken");
    this.monitorAttachments = this.getPref("monitor_attachments");
    this.monospaceFont      = this.getPref("monospace_font");

    this.regExs             = this.getRegExFromText(this.getPref("ignored_file_masks"));
    this.tagNosource        = this.getPrefDefault("tag_nosource",  this.simTag_Nosource);
    this.tagBroken          = this.getPrefDefault("tag_broken",    this.simTag_Broken);
    this.tagDuplicate       = this.getPrefDefault("tag_duplicate", this.simTag_Duplicate);
    this.tagNonfile         = this.getPrefDefault("tag_nonfile",   this.simTag_Nonfile);
}

// === Change UI elements based on state/settings ===

AttachmentScanner.toggleMenuItems = function() {
    const scanning = this.scanningState >= 2;
    this.setItemStateAllWin("attachment-scanner-scan", scanning);
    this.setItemStateAllWin("attachment-scanner-scan-selected", scanning);
    this.setItemStateAllWin("attachment-scanner-cancel", false, !scanning);
    this.setItemStateAllWin("attachment-scanner-cancel2", false, !scanning);
    this.setItemStateAllWin("attachment-scanner-scan-orphans", scanning);
    this.setItemStateAllWin("attachment-remove-same-file", scanning);
}

AttachmentScanner.updateHiddenMenuItem = function (window) {
    this.setItemStateAllWin("attachment-remove-same-file", this.scanningState >= 2, !this.getPref("show_remove_same_file"));
    this.setItemStateAllWin("attachment-scanner-scan-orphans", this.scanningState >= 2, Zotero.Prefs.get("extensions.zotero.baseAttachmentPath", true) == "");
}

AttachmentScanner.togglePreferenceItems = function() {
    const doc = this.preferenceDocument;
    const disabled = this.scanningState == 2;
    const disabledmore = disabled || this.scanningState == 1;
    if (doc) {
        doc.getElementById("attachmentscanner_checkbox1").disabled = disabled;  // disabled of groupbox and vbox applied to inner elements
        doc.getElementById("attachmentscanner_checkbox2").disabled = disabled;
        doc.getElementById("attachmentscanner_checkbox3").disabled = disabled;
        doc.getElementById("attachmentscanner_checkbox4").disabled = disabled;
        doc.getElementById("attachmentscanner_checkbox5").disabled = disabled;
        doc.getElementById("attachmentscanner_checkbox6").disabled = disabled;
        doc.getElementById("attachmentscanner_file_masks").disabled = disabled || !this.scanDuplicate;

        doc.getElementById("attachmentscanner_junk_file").disabled = this.scanningState == 3;

        doc.getElementById("attachmentscanner_nosource").disabled  = disabledmore;
        doc.getElementById("attachmentscanner_broken").disabled    = disabledmore;
        doc.getElementById("attachmentscanner_duplicate").disabled = disabledmore;
        doc.getElementById("attachmentscanner_nonfile").disabled   = disabledmore;
        doc.getElementById("attachmentscanner_tags1").disabled = disabledmore;
        doc.getElementById("attachmentscanner_tags2").disabled = disabledmore;
        doc.getElementById("attachmentscanner_tags3").disabled = disabledmore;
    }
}

AttachmentScanner.setState = function(state) {
    this.scanningState = state;
    this.toggleMenuItems();
    this.togglePreferenceItems();
}

// === Disable preference items during scanning and update tags and UI after preference is changed ===

AttachmentScanner.onPreferenceWindowOpen = function(doc) {
    this.togglePreferenceItems();
}

AttachmentScanner.onPreferenceWindowFocus = function(doc) {
    this.togglePreferenceItems();
}

AttachmentScanner.onPreferenceWindowLoseFocus = function(doc) {
    this.preferencesChanged();
}

AttachmentScanner.preferencesChanged = function() {
    // Don't rely on items in preference windows, the user can use config editor to change the settings
    let old_tagNosource  = this.tagNosource;
    let old_tagBroken    = this.tagBroken;
    let old_tagDuplicate = this.tagDuplicate;
    let old_tagNonfile   = this.tagNonfile;
    this.readPref();

    // Quick update tags if changed
    if (this.scanningState == 0 &&
        (this.tagNosource  != old_tagNosource  || this.tagBroken  != old_tagBroken ||
         this.tagDuplicate != old_tagDuplicate || this.tagNonfile != old_tagNonfile)) {
        log("Renaming changed tags...");
        this.setState(1);

        try {
            if (this.tagNosource  != old_tagNosource  && Zotero.Tags.getID(old_tagNosource))
                Zotero.Tags.rename(Zotero.Libraries.userLibraryID, old_tagNosource, this.tagNosource);
            if (this.tagBroken    != old_tagBroken    && Zotero.Tags.getID(old_tagBroken))
                Zotero.Tags.rename(Zotero.Libraries.userLibraryID, old_tagBroken, this.tagBroken);
            if (this.tagDuplicate != old_tagDuplicate && Zotero.Tags.getID(old_tagDuplicate))
                Zotero.Tags.rename(Zotero.Libraries.userLibraryID, old_tagDuplicate, this.tagDuplicate);
            if (this.tagNonfile   != old_tagNonfile   && Zotero.Tags.getID(old_tagNonfile))
                Zotero.Tags.rename(Zotero.Libraries.userLibraryID, old_tagNonfile, this.tagNonfile);
        } finally {
            this.setState(0);
        }
        log("Tags renamed");
    }

    // Update menu items
    this.updateHiddenMenuItem(Zotero.getMainWindow());
};

AttachmentScanner.fontChanged = function() {
    this.monospaceFont = this.getPref("monospace_font");
    const windows = Zotero.getMainWindows();
    for (let win of windows) {
        const itemTable = win.document.getElementById("item-tree-main-default");
        if (!itemTable) continue;
        const cells = itemTable.getElementsByClassName("attachSize");
        for (let i = 0; i<cells.length; i++)
            cells[i].style = (this.monospaceFont) ? "text-Align: right; font-Family: monospace;" : "text-Align: right; ";
    }
}

// === Handle button click in the preference window ===

AttachmentScanner.useTags = function(doc, tagNosource, tagBroken, tagDuplicate, tagNonfile) {
    doc.getElementById("attachmentscanner_nosource").value  = tagNosource;
    doc.getElementById("attachmentscanner_broken").value    = tagBroken;
    doc.getElementById("attachmentscanner_duplicate").value = tagDuplicate;
    doc.getElementById("attachmentscanner_nonfile").value   = tagNonfile;
    this.setPref("tag_nosource",  tagNosource);
    this.setPref("tag_broken",    tagBroken);
    this.setPref("tag_duplicate", tagDuplicate);
    this.setPref("tag_nonfile",   tagNonfile);
}

AttachmentScanner.useZssTags = function(doc) {
    this.useTags(doc, this.zssTag_Nosource, this.zssTag_Broken, this.zssTag_Duplicate, this.zssTag_Nonfile);
}

AttachmentScanner.useSimpleTags = function(doc) {
    this.useTags(doc, this.simTag_Nosource, this.simTag_Broken, this.simTag_Duplicate, this.simTag_Nonfile);
}

AttachmentScanner.useEmojiTags = function(doc) {
    this.useTags(doc, this.emoTag_Nosource, this.emoTag_Broken, this.emoTag_Duplicate, this.emoTag_Nonfile);
}

// === Init ===

AttachmentScanner.init = function({ id, version, rootURI }) {
    this.defineConsts();
    this.setPref("remove_broken", false);   // To be safe
    this.scanningState = 0;     // 0: no; 1: renaming tags; 2: scaning attachments; 3: scanning orphan files
    this.readPref();
    this.setItemMonitor(this.monitorAttachments);
    Services.prefs.addObserver(`extensions.${prefScope}.monospace_font`, this.fontChanged.bind(this));
    Services.prefs.addObserver(`extensions.zotero.baseAttachmentPath`, this.updateHiddenMenuItem.bind(this));
    Services.prefs.addObserver(`extensions.${prefScope}.show_remove_same_file`, this.updateHiddenMenuItem.bind(this));
    // addObserver for showRemoveSameFile because changes using config editor may not be fired

    this.registeredAttachmentNumber = Zotero.ItemTreeManager.registerColumn(
    {
        dataKey: 'asNumAttachment',
        label: this.getLocalizedString("attachmentscanner-attachment-number"),
        htmlLabel: this.getLocalizedString("attachmentscanner-attachment-number"),
        staticWidth: true,
        showInColumnPicker: true,
        pluginID: pluginId,
        sortReverse: true,
        dataProvider: (item, dataKey) => {
            return (item.isRegularItem()) ? item.numAttachments(false) : 0;
        },
        zoteroPersist: ['width', 'hidden', 'sortDirection'],
    });

    this.registeredAttachmentSize = Zotero.ItemTreeManager.registerColumn(
    {
        dataKey: 'asAttachmentSize',
        label: this.getLocalizedString("attachmentscanner-attachment-size"),
        htmlLabel: this.getLocalizedString("attachmentscanner-attachment-size"),
        staticWidth: true,
        showInColumnPicker: true,
        pluginID: pluginId,
        sortReverse: true,
        dataProvider: (item, dataKey) => {
            let totalSize = 0;
            if (item.isFileAttachment()) {
                let parent = Zotero.Items.get(item.parentID);
                if (parent.numAttachments(false) > 1)
                    try {
                        totalSize = this.getFileSize(item.getFilePath());
                    } catch {
                        totalSize = -1;
                    }
            } else if (item.isRegularItem()) {
                let attachmentIDs = item.getAttachments();
                for (attachmentID of attachmentIDs) {
                    let attachment = Zotero.Items.get(attachmentID);
                    if (attachment.isFileAttachment())
                        try {
                            totalSize += this.getFileSize(attachment.getFilePath());
                        } catch { }
                }
            }
            return totalSize;
        },
        renderCell: (index, data, column, isFirstColumn, doc) => {
            const cell = doc.createElement('span');
            cell.className = `cell ${column.className} attachSize`;
            if (data < 0)
                cell.innerHTML = '???';
            else cell.innerHTML = (data == 0) ? "" : data.toLocaleString();
            if (this.monospaceFont)
              cell.style = "text-Align: right; font-Family: monospace;";
            else cell.style = "text-Align: right; ";
            return cell;
        },
        zoteroPersist: ['width', 'hidden', 'sortDirection'],
    });
}

AttachmentScanner.addToWindow = function(window) {
    // Add monitor and menu items
    this.setItemMonitor(this.monitorAttachments);
    this.addMenuItem(window, "menu_ToolsPopup", "attachment-scanner-scan",
        "attachmentscanner-start-scan", this.appIcon, {}, () => {
            AttachmentScanner.startScan(window);
        });
    this.addMenuItem(window, "menu_ToolsPopup", "attachment-scanner-scan-orphans",
        "attachmentscanner-scan-orphans", this.appIcon, {}, () => {
            AttachmentScanner.scanOrphans(window);
        });
    this.addMenuItem(window, "menu_ToolsPopup", "attachment-scanner-cancel",
        "attachmentscanner-cancel-scan", this.appIcon, {hidden: true}, () => {
            AttachmentScanner.cancelScan(window);
        });
    this.addMenuItem(window, "zotero-itemmenu", "attachment-scanner-scan-selected",
        "attachmentscanner-start-scan-selected", this.appIcon, {}, () => {
            AttachmentScanner.startScanSelected(window);
        });
    this.addMenuItem(window, "zotero-itemmenu", "attachment-remove-same-file",
        "attachmentscanner-remove-same-link", this.appIcon, {hidden: true}, () => {
            AttachmentScanner.startRemovSameFile(window);
        });
    this.addMenuItem(window, "zotero-itemmenu", "attachment-scanner-cancel2",
        "attachmentscanner-cancel-scan", this.appIcon, {hidden: true}, () => {
            AttachmentScanner.cancelScan(window);
        });
    this.updateHiddenMenuItem(window);

    // Zotero bug fix: On Mac, when the Zotero window is close and reopen, some main menu items lose icons (or disappear)
    setTimeout(() => {
        this.setItemStateAllWin("attachment-scanner-scan", this.scanningState < 2);
        this.setItemStateAllWin("attachment-scanner-scan", this.scanningState >= 2);
    }, "200");
}

// === Attachment monitor ===

AttachmentScanner.setItemMonitor = function(enabled) {
    log('Set attachment monitor to ' + enabled);
    if (enabled && !this.itemNotifierID)
        this.itemNotifierID = Zotero.Notifier.registerObserver(this.onItemChange, ['item']);
    else if (!enabled && this.itemNotifierID) {
        Zotero.Notifier.unregisterObserver(pluginObj.itemNotifierID);
        this.itemNotifierID = undefined;
    }
}

AttachmentScanner.onItemChange = {
    notify: async function(event, type, ids, extraData) { // string, string, Array<string>, ibject
        if (event == "modify") {
            // log("Checking " + event + " with " + ids.length + " items");
            for (id of ids) {
                let item = await Zotero.Items.getAsync(id);
                await Zotero.AttachmentScanner.checkAttachements(item, true);
            }
        }
    }
}

// === Actual item checking

AttachmentScanner.checkAttachements = async function(item, skipSomeActions) { // return true if tags are changed
    if (!item.isRegularItem()) {    // isRegularItem = !(this.isNote() || this.isAttachment() || this.isAnnotation())
        if (item.parentID)
           item = await Zotero.Items.getAsync(item.parentID);
        if (!item.isRegularItem()) return;
    }

    await item.loadAllData();
    // Get all attachments
    let attachmentIDs = item.getAttachments();
    let attachTypes = [];
    let hasFile = hasBroken = hasDuplicates = hasNonfiles = changed = hasPDF = false;
    let pubmedEntryID = null;
    let snapshotID = null;

    // Zotero attachements have five link modes, although it seems that type 0 is NOT used and type 1 is also for PDF and other files
    // I haven't seen any type 4 files. Images in notes are not stored as LINK_MODE_EMBEDDED_IMAGE
    //   LINK_MODE_IMPORTED_FILE = 0;  // The file is copied into Zotero's storage.
    //   LINK_MODE_IMPORTED_URL = 1;   // A snapshot of a webpage is saved and stored in Zotero.
    //   LINK_MODE_LINKED_FILE = 2;    // The file is linked from its original location on your computer.
    //   LINK_MODE_LINKED_URL = 3;     // Zotero links to a web URL, not a local file.
    //   LINK_MODE_EMBEDDED_IMAGE = 4; // The attachment is an embedded image, typically used in notes or other internal Zotero content.

    // Zotero provide these function to test attachment types
    //   isImportedAttachment: for 0,1; isStoredFileAttachment: for 0,1,4; isWebAttachment: for 1,3,4;
    //   isFileAttachment: for 0,1,2,4; isLinkedFileAttachment: for 2l     isEmbeddedImageAttachment: for 4;
    //   isSnapshotAttachment: for 1 and HTML
    //   numAttachments/numFileAttachments/numNonHTMLFileAttachments

    for (attachmentID of attachmentIDs) {
        let attachment = await Zotero.Items.getAsync(attachmentID);
        if (attachment.isEmbeddedImageAttachment()) continue;   // skip EmbeddedImage
        if (attachment.isSnapshotAttachment()) {
            snapshotID = attachmentID;
            continue;
        }
        if (attachment.isFileAttachment()) {
            // sets hasFile, hasBroken
            hasFile = true;
            let filename = "";

            // On Linux, when the path (attachment.attachmentPath) is in DOS format, getFilePathAsync will fail
            try {
                filename = await attachment.getFilePathAsync();
                if (filename) {
                    if (attachment.isPDFAttachment() || attachment.isEPUBAttachment()) hasPDF = true;
                } else hasBroken = true;
            } catch {
                hasBroken = true;
            }
            if (hasBroken && !skipSomeActions && this.removeBroken) {
                Zotero.Items.trashTx(attachmentID);
                hasBroken = false;
                continue;
            }

            if (filename && !hasDuplicates && this.scanDuplicate) {
                let skip = false;
                if (this.regExs.length > 0) {
                    filename = filename.replace(/^.*[\\/]/, '');
                    for (regex of this.regExs)
                        if (regex.test(filename)) {
                            skip = true;
                            break;
                        }
                }
                if (!skip)
                    if (attachTypes.includes(attachment.attachmentContentType))
                        hasDuplicates = true;
                    else attachTypes.push(attachment.attachmentContentType);
            }
        } else {
            // sets hasNonfiles, pubmedEntryID
            //log(item.getDisplayTitle(false) + " has non-file attachment: '" + attachment.getDisplayTitle(false) +
            //     "' of mode " + attachment.attachmentLinkMode + " and type " + attachment.attachmentContentType);
            if (this.removePubmedEntry && attachment.getDisplayTitle(false) == "PubMed entry")
                pubmedEntryID = attachmentID;
            else hasNonfiles = true;
        }
    }
    if (pubmedEntryID) {
        log('Trash ' + Zotero.Items.get(pubmedEntryID).getDisplayTitle(false));
        Zotero.Items.trashTx(pubmedEntryID);
        changed = true;
    }
    if (snapshotID && this.removeSnapshot && hasPDF) {
        log('Trash ' + Zotero.Items.get(snapshotID).getDisplayTitle(false));
        Zotero.Items.trashTx(snapshotID);
        changed = true;
    }

    if (!hasBroken && item.hasTag(this.tagBroken))  { changed = true; item.removeTag(this.tagBroken); }
    if (hasBroken && !item.hasTag(this.tagBroken))  { changed = true; item.addTag(this.tagBroken); }
    if (this.scanNosource) {
        if (hasFile && item.hasTag(this.tagNosource))   { changed = true; item.removeTag(this.tagNosource); }
        if (!hasFile && !item.hasTag(this.tagNosource)) { changed = true; item.addTag(this.tagNosource); }
    }
    if (this.scanDuplicate) {
        if (!hasDuplicates && item.hasTag(this.tagDuplicate)) { changed = true; item.removeTag(this.tagDuplicate); }
        if (hasDuplicates && !item.hasTag(this.tagDuplicate)) { changed = true; item.addTag(this.tagDuplicate); }
    }
    if (this.scanNonfile) {
        if (!hasNonfiles && item.hasTag(this.tagNonfile)) { changed = true; item.removeTag(this.tagNonfile); }
        if (hasNonfiles && !item.hasTag(this.tagNonfile)) { changed = true; item.addTag(this.tagNonfile); }
    }

    if (changed) item.saveTx();
}

// === Scanning ==

AttachmentScanner.waitUntilfinishRename = async function() {
    // if there is a renaming operation, wait until it finishes, it should be done quickly
    while (this.scanningState == 1)
        await new Promise(r => setTimeout(r, 20));
}

AttachmentScanner.scanItems = async function(win, items, proc) {
    progressInfo  = this.getLocalizedString("attachmentscanner-scan-progreess");
    this.createProgressWindow(this.getLocalizedString("attachmentscanner-scan-title"));

    // Check if renaming is needed, this happens if the preference window is opened
    if (this.preferenceDocument) this.preferencesChanged();
    await this.waitUntilfinishRename();  // even without preference window open, there is a slight chance that renaming is ongonig

    // Disable/enable some functions
    log("Start scan");
    this.setState(2);
    this.shouldCancelScan = false;

    try {
        let index = 0;
        this.progressWindow.refreshRate = Math.max(1, Math.round(items.length / 400));
        // Check each items
        for (const aItem of items) {
            if (this.shouldCancelScan) break;

            // Update the progress window, less frequently
            if (index % this.progressWindow.realRate == 0) {
                let s = progressInfo.replaceAll("{$total}", items.length).replaceAll("{$index}", index + 1);
                this.setProgress(s, index / items.length);
            }
            index++;

            await proc(aItem);
        }
    } finally {
        log("Clean up scan");
        this.closeProgressWindow();
        this.setState(0);
    }
}

AttachmentScanner.checkAttachmentByID = async function(aItem) {
    try {
        const item = await Zotero.Items.getAsync(aItem.itemID);
        await this.checkAttachements(item, false);
    } catch (error) {
        log(`Error scanning item ${aItem.itemID}: ${error}`);
    }
}

AttachmentScanner.startScan = async function(win) {
    if (this.scanningState > 1) {
        log("Scanning is ongoing. Cannot start a new scan.")
        return;
    }

    let hiddenTypeIDs = [];
    hiddenTypeIDs.push(Zotero.ItemTypes.getID("webpage"));
    hiddenTypeIDs.push(Zotero.ItemTypes.getID("attachment"));
    hiddenTypeIDs.push(Zotero.ItemTypes.getID("note"));
    hiddenTypeIDs.push(Zotero.ItemTypes.getID("annotation"));
    const sqlAllItems = `SELECT itemID FROM items WHERE itemTypeID NOT IN (${hiddenTypeIDs.toString()})`;
    const items = await Zotero.DB.queryAsync(sqlAllItems) || [];
    this.scanItems(win, items, this.checkAttachmentByID.bind(this));
}

AttachmentScanner.startScanSelected = async function(win) {
    if (this.scanningState > 1) {
        log("Scanning is ongoing. Cannot start a new scan.")
        return;
    }
    const items = Zotero.getActiveZoteroPane().getSelectedItems();
    this.scanItems(win, items, this.checkAttachmentByID.bind(this));
}

AttachmentScanner.checkSameFile = async function(aItem) {
    try {
        const item = await Zotero.Items.getAsync(aItem.itemID);
        if (!item.isRegularItem()) return;
        await item.loadAllData();

        let attachmentIDs = item.getAttachments();
        let fileNames = [];

        for (attachmentID of attachmentIDs) {
            let attachment = await Zotero.Items.getAsync(attachmentID);
            if (attachment.isFileAttachment()) {
                let filename;
                try {
                     filename = await attachment.getFilePathAsync();
                } catch {
                }
                if (!filename) continue;

                if (fileNames.includes(filename)) {
                    try {
                        await Zotero.Items.trashTx(attachmentID);
                        log(`Attachment ${attachmentID} deleted successfully.`);
                    } catch (error) {
                        log(`Error deleting attachment ${attachmentID}: ${error}`);
                    }
                    continue;
                } else fileNames.push(filename);
            }
        }
    } catch (error) {
        log(`Error scanning item ${aItem.itemID}: ${error}`);
    }
}

AttachmentScanner.startRemovSameFile = async function(win) {
    if (this.scanningState > 1) {
        log("Scanning is ongoing. Cannot start a new scan.")
        return;
    }
    const zotMoovAutoDelete = Zotero.Prefs.get(`extensions.zotmoov.delete_files`, true);
    if (zotMoovAutoDelete)
        Services.prompt.alert(win, pluginName, this.getLocalizedString("attachmentscanner-error-auto-delete"));
    else if (Services.prompt.confirm(win, pluginName, this.getLocalizedString("attachmentscanner-warning-auto-delete")))
        this.scanItems(win, Zotero.getActiveZoteroPane().getSelectedItems(), this.checkSameFile);
}

AttachmentScanner.cancelScan = async function(win) {
    this.shouldCancelScan = true;
}

// === Scan Orphan files ===

AttachmentScanner.scanOrphans = async function(window) {
    let orphanFiles = [];
    let junkFiles = [];
    let emptyDirs = [];
    let attachmentFiles = [];
    let op = this.getPref("junk_orphan_files");
    const osJunkFiles = ['desktop.ini', 'thumbs.db', '.ds_store'];

    async function checkDirectory(dir) {
        let hasFiles = false;
        if (this.shouldCancelScan) return;
        let entries = await IOUtils.getChildren(dir);
        // log(`Scanning ${entries.length} items in ${dir} ...`);
        AttachmentScanner.setProgress("Checking ." + dir.substring(AttachmentScanner.lenBaseDir));

        for (let entry of entries) {
            if ((await IOUtils.stat(entry)).type == 'directory') {
                if (await checkDirectory(entry))
                    hasFiles = true;
                else emptyDirs.push(entry);
            } else {
                if (this.shouldCancelScan) return;
                if (attachmentFiles.includes(entry.normalize('NFC').toLowerCase()))
                    hasFiles = true;
                else if (osJunkFiles.includes(entry.split('\\').pop().split('/').pop().toLowerCase())) {
                        if (op == 1)
                            junkFiles.push(entry);
                        else if (op == 2)
                            IOUtils.remove(entry);
                    } else orphanFiles.push(entry);
            }
        }
        return hasFiles;
    }

    // Check if renaming is needed, this happens if the preference window is opened
    progressInfo  = this.getLocalizedString("attachmentscanner-scan-progreess");
    this.createProgressWindow(this.getLocalizedString("attachmentscanner-scan-title"), "", true, true);
    this.shouldCancelScan = false;
    if (this.preferenceDocument) this.preferencesChanged();
    await this.waitUntilfinishRename();  // even without preference window open, there is a slight chance that renaming is ongonig

    let absFiles = 2;
    try {
        let baseDir = Zotero.Prefs.get("extensions.zotero.baseAttachmentPath", true);
        this.lenBaseDir = baseDir.length;
        if (!baseDir) return;
        this.setState(3);
        this.setProgress("Reading attachments from Zotero library.")

        let sqlAllAttachments = `SELECT itemID FROM items WHERE itemTypeID='${Zotero.ItemTypes.getID("attachment")}'`;
        const items = await Zotero.DB.queryAsync(sqlAllAttachments) || [];
        for (item of items) {
            let attachment = await Zotero.Items.getAsync(item.itemID);
            if (attachment.isFileAttachment()) {
                let path = await attachment.getFilePathAsync();
                if (!path) continue;
                attachmentFiles.push(path.normalize('NFC').toLowerCase());

                if (attachment.attachmentLinkMode == Zotero.Attachments.LINK_MODE_LINKED_FILE &&
                    attachment.attachmentPath.indexOf(Zotero.Attachments.BASE_PATH_PLACEHOLDER) != 0 &&
                    attachment.attachmentPath.startsWith(baseDir))
                        absFiles++;
            }
        }
        log(`${attachmentFiles.length} attachment files are found.`);

        await checkDirectory(baseDir);
    } finally {
        this.closeProgressWindow();
        this.setState(0);
        log(`Found ${orphanFiles.length} orphaned files, ${junkFiles.length} system junk files, and ${emptyDirs.length} empty directories.`)
    }

    if (this.shouldCancelScan) return;
    if (orphanFiles.length + junkFiles.length + emptyDirs.length == 0) {
        if (absFiles == 0)
            Services.prompt.alert(window, pluginName, this.getLocalizedString("attachmentscanner-no-orphan"));
        else if (absFiles == 1)
            Services.prompt.alert(window, pluginName, this.getLocalizedString("attachmentscanner-no-orphan-with-abs-1").replaceAll("{$abs}", absFiles));
        else
            Services.prompt.alert(window, pluginName, this.getLocalizedString("attachmentscanner-no-orphan-with-abs-n").replaceAll("{$abs}", absFiles));
    } else {
        let s1 = (orphanFiles.length == 0) ? "" : (this.getLocalizedString("attachmentscanner-orphan-" +  ((orphanFiles.length == 1) ? "1" : "n")));
        let s2 = (junkFiles.length == 0)   ? "" : (this.getLocalizedString("attachmentscanner-junk-" +      ((junkFiles.length == 1) ? "1" : "n")));
        let s3 = (emptyDirs.length == 0)   ? "" : (this.getLocalizedString("attachmentscanner-empty-dir-" + ((emptyDirs.length == 1) ? "1" : "n")));
        s1 = s1.replaceAll("{$orphan}", orphanFiles.length).replaceAll("{$junk}", junkFiles.length).replaceAll("{$empty-dir}", emptyDirs.length);
        s2 = s2.replaceAll("{$orphan}", orphanFiles.length).replaceAll("{$junk}", junkFiles.length).replaceAll("{$empty-dir}", emptyDirs.length);
        s3 = s3.replaceAll("{$orphan}", orphanFiles.length).replaceAll("{$junk}", junkFiles.length).replaceAll("{$empty-dir}", emptyDirs.length);

        let sAll;
        if (s2 != "" && s3 != "")
            sAll = ((s1 != "") ? (s1 + this.getLocalizedString("attachmentscanner-separator")) : "") + s2 + this.getLocalizedString("attachmentscanner-last-separator") + s3;
        else
            sAll = s1 + ((s1 != "" && s2 + s3 != "") ? this.getLocalizedString("attachmentscanner-last-separator") : "") + s2 + s3;

        let s = (orphanFiles.length + junkFiles.length + emptyDirs.length == 1) ?
                  (this.getLocalizedString("attachmentscanner-orphan-found-1")) :
                  (this.getLocalizedString("attachmentscanner-orphan-found-n"));
        s = s.replaceAll("{$found}", sAll).replaceAll("{$orphan}", orphanFiles.length).replaceAll("{$junk}", junkFiles.length).replaceAll("{$empty-dir}", emptyDirs.length);

        Services.prompt.confirmEx(window, pluginName, s,
            Services.prompt.BUTTON_POS_0 * Services.prompt.BUTTON_TITLE_IS_STRING,
            this.getLocalizedString("attachmentscanner-prmopt-copy-close"),
            "", "", "", {});

        s = (orphanFiles.length == 0) ? "" : s1 + ":\n  " + orphanFiles.join("\n  ");
        if (junkFiles.length > 0) s += ((s == "") ? "" : "\n\n") + s2 + ":\n  " + junkFiles.join("\n  ");
        if (emptyDirs.length > 0) s += ((s == "") ? "" : "\n\n") + s3 + ":\n  " + emptyDirs.join("\n  ");
        if (absFiles == 1)
            s = this.getLocalizedString("attachmentscanner-abs-warning-1").replaceAll("{$abs}", absFiles) + "\n\n" + s;
        else if (absFiles > 1)
            s = this.getLocalizedString("attachmentscanner-abs-warning-n").replaceAll("{$abs}", absFiles) + "\n\n" + s;

        Components.classes["@mozilla.org/widget/clipboardhelper;1"]
            .getService(Components.interfaces.nsIClipboardHelper)
            .copyString(s);
    }
}