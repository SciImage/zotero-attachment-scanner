const elmId_Nosource   = "attachmentscanner_nosource";
const elmId_Broken     = "attachmentscanner_broken";
const elmId_Duplicate  = "attachmentscanner_duplicate";
const elmId_Nonfile    = "attachmentscanner_nonfile";
const prefs_Nosource   = "tag_nosource";
const prefs_Broken     = "tag_broken";
const prefs_Duplicate  = "tag_duplicate";
const prefs_Nonfile    = "tag_nonfile";
const prefs_ScanNosource       = "scan_nosource";
const prefs_ScanDuplicate      = "scan_duplicates";
const prefs_ScanNonfile        = "scan_nonfiles";
const prefs_RemovePubMedEntry  = "remove_pubmed_entry";
const prefs_MonitorAttachments = "monitor_attachments";
const prefs_IgnoredFileMasks   = "ignored_file_masks";
const prefs_ShowRemoveSameFile = "show_remove_same_file";

const zssTag_Nosource  = "#nosource";
const zssTag_Broken    = "#broken_attachments";
const zssTag_Duplicate = "#multiple_attachments_of_same_type";
const zssTag_Nonfile   = "#non_file_attachments";
const simTag_Nosource  = "#nosource";
const simTag_Broken    = "#broken";
const simTag_Duplicate = "#duplicate";
const simTag_Nonfile   = "#nonfile";
const emoTag_Nosource  = "❌ nosource";
const emoTag_Broken    = "🚫 broken";
const emoTag_Duplicate = "‼️ duplicate";
const emoTag_Nonfile   = "❓ nonfile";

useLog = false;

// === Setting up

function getRegExFromText(regExps) {
    const ss = regExps.split(";");
    let regExs = [];
    for (let i=0; i < ss.length; i++) {
        let s = ss[i].trim();
        if (s.startsWith("/")) s = s.substring(1);
        const l = s.lastIndexOf("/");
        if (l > 0)      // l == 0 --> empty text
            regExs.push(new RegExp(s.substring(0, l - 1), s.substring(l + 1)));
        else if (l < 0)
            regExs.push(new RegExp(s));
    }
    return regExs;
}

AttachmentScanner.init = function({ id, version, rootURI }) {
    this.scanningState = 0;     // 0: no; 1: renaming tags; 2: scaning

    this.scanNosource       = this.getPref(prefs_ScanNosource);
    this.scanDuplicate      = this.getPref(prefs_ScanDuplicate);
    this.scanNonfile        = this.getPref(prefs_ScanNonfile);
    this.removePubmedEntry  = this.getPref(prefs_RemovePubMedEntry);
    this.monitorAttachments = this.getPref(prefs_MonitorAttachments);
    this.regExs             = getRegExFromText(this.getPref("ignored_file_masks"));
    this.setItemMonitor(this.monitorAttachments);

    this.tagNosource  = this.getPrefNonEmpty (prefs_Nosource,  simTag_Nosource);
    this.tagBroken    = this.getPrefNonEmpty (prefs_Broken,    simTag_Broken);
    this.tagDuplicate = this.getPrefNonEmpty (prefs_Duplicate, simTag_Duplicate);
    this.tagNonfile   = this.getPrefNonEmpty (prefs_Nonfile,   simTag_Nonfile);

    this.hiddenTypeIDs = [];
    this.hiddenTypeIDs.push(Zotero.ItemTypes.getID("webpage"));
    this.hiddenTypeIDs.push(Zotero.ItemTypes.getID("attachment"));
    this.hiddenTypeIDs.push(Zotero.ItemTypes.getID("note"));
    this.hiddenTypeIDs.push(Zotero.ItemTypes.getID("annotation"));
    this.sqlAllItems = `SELECT itemID FROM items WHERE itemTypeID NOT IN (${this.hiddenTypeIDs.toString()})`;

    // Zotero.Prefs.registerObserver(`extensions.${prefScope}.${prefs_ShowRemoveSameFile}`, this.prefObserver);
}

AttachmentScanner.addToWindow = function(window) {
    this.setItemMonitor(this.monitorAttachments);
    const appIcon = `${this.rootURI}skin/attachscan${(Zotero.hiDPI ? "@2x" : "")}.png`;
    this.addMenuItem(window, "menu_ToolsPopup", "attachment-scanner-scan",
        "attachmentscanner-start-scan", appIcon, {}, () => {
            AttachmentScanner.startScan(window);
        });
    this.addMenuItem(window, "menu_ToolsPopup", "attachment-scanner-cancel",
        "attachmentscanner-cancel-scan", appIcon, {hidden: true}, () => {
            AttachmentScanner.cancelScan(window);
        });
    this.addMenuItem(window, "zotero-itemmenu", "attachment-scanner-scan-selected",
        "attachmentscanner-start-scan-selected", appIcon, {}, () => {
            AttachmentScanner.startScanSelected(window);
        });
    this.toggleHiddenMenuItem(window);
    // On Mac, when the Zotero window is close and reopen, some main menu items lose icons (or disappear)
    // This fixes it
    setTimeout(() => {
      this.toggleMenuItems(window, this.scanningState < 2);
      this.toggleMenuItems(window, this.scanningState >= 2);
    }, "200");
}

// === Handling the preference window; prevent changing when scanning/renaming is ongoing

AttachmentScanner.onPreferenceWindowOpen = function(doc) {
    this.disablePreferenceItems(this.scanningState > 0);
}

AttachmentScanner.onPreferenceWindowFocus = function(doc) {
    this.disablePreferenceItems(this.scanningState > 0);
}

AttachmentScanner.onPreferenceWindowLoseFocus = function(doc) {
    this.preferencesChanged();
}

AttachmentScanner.disablePreferenceItems = function(disabled) {
    const doc = this.preferenceDocument;
    if (doc) {
        doc.getElementById("attachmentscanner_checkbox1").disabled = disabled;
        doc.getElementById("attachmentscanner_checkbox2").disabled = disabled;
        doc.getElementById("attachmentscanner_checkbox3").disabled = disabled;
        doc.getElementById("attachmentscanner_checkbox4").disabled = disabled;
        doc.getElementById("attachmentscanner_checkbox5").disabled = disabled;
        doc.getElementById("attachmentscanner_file_masks").disabled = disabled || !this.scanDuplicate;
        doc.getElementById(elmId_Nosource).disabled  = disabled;
        doc.getElementById(elmId_Broken).disabled    = disabled;
        doc.getElementById(elmId_Duplicate).disabled = disabled;
        doc.getElementById(elmId_Nonfile).disabled   = disabled;

        doc.getElementById("attachmentscanner_tags1").disabled = disabled;
        doc.getElementById("attachmentscanner_tags2").disabled = disabled;
        doc.getElementById("attachmentscanner_tags3").disabled = disabled;
    }
}

// === Button click in the preference window

AttachmentScanner.useTags = function(doc, tagNosource, tagBroken, tagDuplicate, tagNonfile) {
    doc.getElementById(elmId_Nosource).value  = tagNosource;
    doc.getElementById(elmId_Broken).value    = tagBroken;
    doc.getElementById(elmId_Duplicate).value = tagDuplicate;
    doc.getElementById(elmId_Nonfile).value   = tagNonfile;
    this.setPref(prefs_Nosource,  tagNosource);
    this.setPref(prefs_Broken,    tagBroken);
    this.setPref(prefs_Duplicate, tagDuplicate);
    this.setPref(prefs_Nonfile,   tagNonfile);
}

AttachmentScanner.useZssTags = function(doc) {
    this.useTags(doc, zssTag_Nosource, zssTag_Broken, zssTag_Duplicate, zssTag_Nonfile);
}

AttachmentScanner.useSimpleTags = function(doc) {
    this.useTags(doc, simTag_Nosource, simTag_Broken, simTag_Duplicate, simTag_Nonfile);
}

AttachmentScanner.useEmojiTags = function(doc) {
    this.useTags(doc, emoTag_Nosource, emoTag_Broken, emoTag_Duplicate, emoTag_Nonfile);
}

// === Preferences are changed

AttachmentScanner.getTagFromPreferenceWindow = function(elmID, prefID, defaulTag) {
    let elm = this.preferenceDocument.getElementById(elmID);
    let value = elm.value.trim();
    if (value == "") value = defaulTag;
    if (value != elm.value) {
        elm.value = value;
        this.setPref(prefID, value);
    }
    return value;
}

AttachmentScanner.preferencesChanged = function() {
    // Don't rely on items in preference windows, the user can use config editor to change the settings
    this.scanNosource       = this.getPref(prefs_ScanNosource);
    this.scanDuplicate      = this.getPref(prefs_ScanDuplicate);
    this.scanNonfile        = this.getPref(prefs_ScanNonfile);
    this.removePubmedEntry  = this.getPref(prefs_RemovePubMedEntry);
    this.monitorAttachments = this.getPref(prefs_MonitorAttachments);
    this.regExs             = getRegExFromText(this.getPref("ignored_file_masks"));
    this.setItemMonitor(this.monitorAttachments);

    _tagNosource  = this.getTagFromPreferenceWindow(elmId_Nosource,  prefs_Nosource,  simTag_Nosource);
    _tagBroken    = this.getTagFromPreferenceWindow(elmId_Broken,    prefs_Broken,    simTag_Broken);
    _tagDuplicate = this.getTagFromPreferenceWindow(elmId_Duplicate, prefs_Duplicate, simTag_Duplicate);
    _tagNonfile   = this.getTagFromPreferenceWindow(elmId_Nonfile,   prefs_Nonfile,   simTag_Nonfile);
    this.toggleHiddenMenuItem(Zotero.getMainWindow());

    if (this.scanningState != 0) return;
    if (this.tagNosource == _tagNosource   && this.tagBroken == _tagBroken &&
        this.tagDuplicate == _tagDuplicate && this.tagNonfile == _tagNonfile) return;
    log("Renaming tags if different");
    this.scanningState = 1;

    try {
        if (this.tagNosource  != _tagNosource) {
            if (Zotero.Tags.getID(this.tagNosource))
                Zotero.Tags.rename(Zotero.Libraries.userLibraryID, this.tagNosource, _tagNosource);
            this.tagNosource = _tagNosource;
        }
        if (this.tagBroken  != _tagBroken) {
            if (Zotero.Tags.getID(this.tagBroken))
                Zotero.Tags.rename(Zotero.Libraries.userLibraryID, this.tagBroken, _tagBroken);
            this.tagBroken = _tagBroken;
        }
        if (this.tagDuplicate  != _tagDuplicate) {
            if (Zotero.Tags.getID(this.tagDuplicate))
                Zotero.Tags.rename(Zotero.Libraries.userLibraryID, this.tagDuplicate, _tagDuplicate);
            this.tagDuplicate = _tagDuplicate;
        }
        if (this.tagNonfile  != _tagNonfile) {
            if (Zotero.Tags.getID(this.tagNonfile))
                Zotero.Tags.rename(Zotero.Libraries.userLibraryID, this.tagNonfile, _tagNonfile);
            this.tagNonfile = _tagNonfile;
        }
    } finally {
        this.scanningState = 0;
    }

    log("Tags renamed");
};

AttachmentScanner.toggleHiddenMenuItem = function (window) {
    showRemoveSame = this.getPref(prefs_ShowRemoveSameFile);
    let elm = window.document.getElementById("attachment-remove-same-file");
    if (showRemoveSame && !elm) {
        this.addMenuItem(window, "zotero-itemmenu", "attachment-remove-same-file",
        "attachmentscanner-remove-same-link", `${this.rootURI}skin/removedup${(Zotero.hiDPI ? "@2x" : "")}.png`,
            {disabled: this.scanningState >= 2}, () => {
            AttachmentScanner.startRemovSameFile(window);
        });
    } else if (!showRemoveSame && elm) elm.remove();
}

// === Attachment monitor

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
            log("Checking " + event + " with " + ids.length + " items");
            for (id of ids) {
                let item = await Zotero.Items.getAsync(id);
                await item.loadAllData();
                if (item.isAttachment()) {
                    item = await Zotero.Items.getAsync(item.parentID);
                    await item.loadAllData();
                }
                if (item.isFileAttachment() && await Zotero.AttachmentScanner.checkAttachements(item))
                    await item.saveTx();
            }
        }
    }
}

// === Scanning commands

AttachmentScanner.toggleMenuItems = function(win, scanning) {
    let doc = win.document;
    doc.getElementById("attachment-scanner-scan").disabled = scanning;
    doc.getElementById("attachment-scanner-scan-selected").disabled = scanning;
    doc.getElementById("attachment-scanner-cancel").hidden = !scanning;
    let elm = doc.getElementById("attachment-remove-same-file");
    if (elm) elm.disabled = scanning;
}

AttachmentScanner.startScan = async function(win) {
    if (this.scanningState > 1) {
        log("Scanning is ongoing")
        return;
    }
    const items = await Zotero.DB.queryAsync(this.sqlAllItems) || [];
    this.scanItems(win, items, false);
}

AttachmentScanner.startScanSelected = async function(win) {
    if (this.scanningState > 1) {
        log("Scanning is ongoing")
        return;
    }
    const items = Zotero.getActiveZoteroPane().getSelectedItems();
    this.scanItems(win, items, false);
}

AttachmentScanner.startRemovSameFile = async function(win) {
    if (this.scanningState > 1) {
        log("Scanning is ongoing");
        return;
    }
    const zotMoovAutoDelete = Zotero.Prefs.get(`extensions.zotmoov.delete_files`, true);
    if (zotMoovAutoDelete)
        Services.prompt.alert(win, pluginName, await this.getString("attachmentscanner-error-auto-delete"));
    else if (Services.prompt.confirm(win, pluginName, await this.getString("attachmentscanner-warning-auto-delete")))
        this.scanItems(win, Zotero.getActiveZoteroPane().getSelectedItems(), true, true);
}

AttachmentScanner.cancelScan = async function(win) {
    this.shouldCancelScan = true;
}

// === Actual Scanning

AttachmentScanner.scanItems = async function(win, items, removeSame) {
    // if there is a renaming operation, wait until it finishes
    if (this.scanningState == 1) {
        this.progressWindow.progress.setText(progressWait);
        while (this.scanningState == 1)
            await new Promise(r => setTimeout(r, 50));
    }

    // Check if renaming is needed, this happens if the preference window is not closed
    if (this.preferenceDocument) this.preferencesChanged();

    progressTitle = await this.getString("attachmentscanner-scan-title");
    progressInfo  = await this.getString("attachmentscanner-scan-progreess");
    progressWait  = await this.getString("attachmentscanner-scan-renamewait");

    // prepare and create the progress window
    this.progressWindow = new Zotero.ProgressWindow({closeOnClick: false});
    this.progressWindow.changeHeadline("", "attachmentScanner", progressTitle);
    // The first icon argument is important, or no progression will be shown.
    this.progressWindow.progress = new this.progressWindow.ItemProgress("", "Scanning"); // note is a csskey that exist
    this.progressWindow.progress.setProgress(0.1);  // to avoid position moving
    this.progressWindow.show();

    // Disable/enable some functions
    log("Start scan");
    this.scanningState = 2;
    this.shouldCancelScan = false;

    try {
        this.disablePreferenceItems(true);
        this.toggleMenuItems(win, true);
        let index = 0;
        let rate = Math.max(1, Math.round(items.length / 400));

        // ******** HACK ********
        // The implementation of the ProgressWindow has many issues, a few are listed here:
        //   1: The icon parameters of both changeHeadline() and ItemProgress are cssIconKey, making it impossible to use
        //      custom icons and sensitive to changes in Zotero's css definitions
        //   2: The cssIconKeys used by changeHeadline() and ItemProgress are different!!!!
        //   3: When the first parameter of changeHeadline() is empty, an ugly space is added.
        //   4: ItemProgress shouldn't accept an icon, because the graph is used to shown the progress.
        //      When the progress is abour 100, the progrssion disappear and become the icon. It is weired.
        //   5: When the progress is [97.5, 100) the progrssion image is same as progress is 0.
        // Here, I
        //   1: Injected a style to make the icon show in the headline
        //   2: Remove the empty node before the icon
        //   3: Make the progress is between [0, 97.5)
        let styleInjected = false;
        let realRate = rate;        // to refresh more
        rate = 1;
        // ******** HACK ********

        // Check each items
        for (const aItem of items) {
            if (this.shouldCancelScan) break;

            // Update the progress window, less frequently
            if (index % rate == 0) {
                let s = progressInfo.replaceAll("${total}", items.length).replaceAll("${index}", index + 1);
                // when the percentage is close to 100%,
                this.progressWindow.progress.setProgress(Math.round(97.4 * index / items.length)); // not 100, just 97.4
                this.progressWindow.progress.setText(s);

                // ******** HACK ********
                if (!styleInjected && this.progressWindow.progress._image) {
                    const styleText = (Zotero.hiDPI) ? `.icon-attachmentScanner {background: url("${this.rootURI}skin/attachscan@2x.png") no-repeat content-box; background-size: 16px;}`
                                                     : `.icon-attachmentScanner {background: url("${this.rootURI}skin/attachscan.png") no-repeat content-box;}`;
                    const doc = this.progressWindow.progress._image.ownerDocument;
                    const sheet = doc.styleSheets[0];
                    sheet.insertRule(styleText, sheet.cssRules.length);
                    const headLine = doc.getElementById("zotero-progress-text-headline");
                    if (headLine && headLine.children[0] && headLine.children[0].tagName == "label" &&
                        headLine.children[0].innerHTML == "")
                      headLine.children[0].hidden = true;
                    styleInjected = true;
                    rate = realRate;
                } else if (rate < realRate) rate ++;
                // ******** HACK ********
            }
            index++;

            // Get item information
            try {
                const item = await Zotero.Items.getAsync(aItem.itemID);
                if (!item.isRegularItem()) continue;
                await item.loadAllData();
                if (removeSame)
                    await this.checkSameFile(item);
                else if (await this.checkAttachements(item))
                    await item.saveTx();
            } catch (error) {
                log(`Error scanning item ${aItem.itemID}: ${error}`);
            }
        }
    } finally {
        log("Clean up scan");
        this.progressWindow.close();
        this.scanningState = 0;
        this.toggleMenuItems(win, false);
        this.disablePreferenceItems(false);
    }
}

// === Actual item checking

AttachmentScanner.checkAttachements = async function(item) {
    // Get all
    let attachmentIDs = item.getAttachments();
    let attachTypes = [];
    let hasFile = hasBroken = hasDuplicates = hasNonfiles = changed = false;
    let pubmedEntryID = null;

    for (attachmentID of attachmentIDs) {
        let attachment = await Zotero.Items.getAsync(attachmentID);
        if (attachment.isFileAttachment()) {
            // sets hasFile, hasBroken
            hasFile = true;
            let filename = "";

            // On Linux, when the path (attachment.attachmentPath) is in DOS format, getFilePathAsync will fail
            try {
                 filename = await attachment.getFilePathAsync();
                if (!filename) hasBroken = true;
            } catch {
                hasBroken = true;
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
        Zotero.Items.trashTx(pubmedEntryID);  //setDeleted
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

    if (!hasFile || hasBroken || hasDuplicates || hasNonfiles || pubmedEntryID) log(item.getDisplayTitle(false) + " has unusual attachments");
    return changed;
}

AttachmentScanner.checkSameFile = async function(item) {
    // Get all
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
}