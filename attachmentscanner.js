const elmId_Nosource   = "attachmentscanner_nosource";
const elmId_Broken     = "attachmentscanner_broken";
const elmId_Duplicate  = "attachmentscanner_duplicate";
const elmId_Nonfile    = "attachmentscanner_nonfile";
const prefs_Nosource   = "tag_nosource";
const prefs_Broken     = "tag_broken";
const prefs_Duplicate  = "tag_duplicate";
const prefs_Nonfile    = "tag_nonfile";
const prefs_ScanDuplicate      = "scan_duplicates";
const prefs_ScanNonfile        = "scan_nonfiles";
const prefs_RemovePubMedEntry  = "remove_pubmed_entry";

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

useLog = true;

AttachmentScanner.init = function({ id, version, rootURI }) {
    this.scanningState = 0;     // 0: no; 1: renaming tags; 2: scaning

    this.scanDuplicate     = this.getPref(prefs_ScanDuplicate);
    this.scanNonfile       = this.getPref(prefs_ScanNonfile);
    this.removePubmedEntry = this.getPref(prefs_RemovePubMedEntry);

    this.tagNosource = this.getPref(prefs_Nosource)?.trim();
    if (!this.tagNosource) {
        this.tagNosource = simTag_Nosource;
        this.setPref(prefs_Nosource, this.tagNosource);
    }
    this.tagBroken = this.getPref(prefs_Broken)?.trim();
    if (!this.tagBroken) {
        this.tagBroken = simTag_Broken;
        this.setPref(prefs_Broken, this.tagBroken);
    }
    this.tagDuplicate = this.getPref(prefs_Duplicate)?.trim();
    if (!this.tagDuplicate) {
        this.tagDuplicate = simTag_Duplicate;
        this.setPref(zssTag_Duplicate, this.tagDuplicate);
    }
    this.tagNonfile = this.getPref(prefs_Nonfile)?.trim();
    if (!this.tagNonfile) {
        this.tagNonfile = simTag_Nonfile;
        this.setPref(zssTag_Nonfile, this.tagNonfile);
    }

    // type info from xpcom/data/cachedTypes.js
    this.hiddenTypeIDs = [];
    this.hiddenTypeIDs.push(Zotero.ItemTypes.getID("webpage"));
    this.hiddenTypeIDs.push(Zotero.ItemTypes.getID("attachment"));
    this.hiddenTypeIDs.push(Zotero.ItemTypes.getID("note"));
    this.hiddenTypeIDs.push(Zotero.ItemTypes.getID("annotation"));

    this.sqlAllItems = "SELECT itemID FROM items WHERE itemTypeID NOT IN (" + this.hiddenTypeIDs.toString() + ")";
}

AttachmentScanner.addToWindow = function(window) {
    let doc = window.document;

    // Add menu option
    let menuitem = doc.createXULElement("menuitem");
    menuitem.id = "attachment-scanner-scan";
    menuitem.setAttribute("data-l10n-id", "attachmentscanner-start-scan");
    menuitem.addEventListener("command", () => {
        AttachmentScanner.startScan(window);
    });
    doc.getElementById("menu_ToolsPopup").appendChild(menuitem);
    this.storeCreatedElement(menuitem);
    // doc.getElementById("zotero-itemmenu").appendChild(menuitem);
}

// Handling the preference window; prevent changing when scanning/renaming is ongoing

AttachmentScanner.onPreferenceWindowClose = function(doc) {
    log("Preference window closed");
    const [_tagNosource, _tagBroken, _tagDuplicate, _tagNonfile] = this.updatePreferences(doc);
    this.renameTagsTo(_tagNosource, _tagBroken, _tagDuplicate, _tagNonfile);
}

AttachmentScanner.onPreferenceWindowOpen = function(doc) {
    this.setPreferenceWindowReadonly(doc, this.scanningState > 0);
}

AttachmentScanner.onPreferenceWindowFocus = function(doc) {
    this.setPreferenceWindowReadonly(doc, this.scanningState > 0);
}

AttachmentScanner.setPreferenceWindowReadonly = function(doc, readOnly) {
    let elm;
    elm = doc.getElementById("attachmentscanner_checkbox1");
    if (elm) elm.disabled = readOnly;
    elm = doc.getElementById("attachmentscanner_checkbox2");
    if (elm) elm.disabled = readOnly;
    elm = doc.getElementById("attachmentscanner_checkbox3");
    if (elm) elm.disabled = readOnly;

    elm = doc.getElementById(elmId_Nosource);
    if (elm) elm.readOnly = readOnly;
    elm = doc.getElementById(elmId_Broken);
    if (elm) elm.readOnly = readOnly;
    elm = doc.getElementById(elmId_Duplicate);
    if (elm) elm.readOnly = readOnly;
    elm = doc.getElementById(elmId_Nonfile);
    if (elm) elm.readOnly = readOnly;

    elm = doc.getElementById("attachmentscanner_tags1");
    if (elm) elm.disabled = readOnly;
    elm = doc.getElementById("attachmentscanner_tags2");
    if (elm) elm.disabled = readOnly;
    elm = doc.getElementById("attachmentscanner_tags3");
    if (elm) elm.disabled = readOnly;
}

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
    log("Use tags in the Zotero Attachment Scanner Plugin");
    this.useTags(doc, zssTag_Nosource, zssTag_Broken, zssTag_Duplicate, zssTag_Nonfile);
};

AttachmentScanner.useSimpleTags = function(doc) {
    log("Use simple tags");
    this.useTags(doc, simTag_Nosource, simTag_Broken, simTag_Duplicate, simTag_Nonfile);
};

AttachmentScanner.useEmojiTags = function(doc) {
    log("Use Emoji tags");
    this.useTags(doc, emoTag_Nosource, emoTag_Broken, emoTag_Duplicate, emoTag_Nonfile);
};

AttachmentScanner.updatePreferences = function(doc) {
    log(`This: Nosource: ${this.tagNosource}; Broken: ${this.tagBroken}; Duplicate: ${this.tagDuplicate}; Nonfile: ${this.tagNonfile}`);
    log(`Pref: Nosource: ${this.getPref(prefs_Nosource)}; Broken: ${this.getPref(prefs_Broken)}; Duplicate: ${this.getPref(prefs_Duplicate)}; Nonfile: ${this.getPref(prefs_Nonfile)}`);
    log(`Elms: Nosource: ${doc.getElementById(elmId_Nosource).value}; Broken: ${doc.getElementById(elmId_Broken).value}; Duplicate: ${doc.getElementById(elmId_Duplicate).value}; Nonfile: ${doc.getElementById(elmId_Nonfile).value}`);
    this.scanDuplicate     = this.getPref(prefs_ScanDuplicate);
    this.scanNonfile       = this.getPref(prefs_ScanNonfile);
    this.removePubmedEntry = this.getPref(prefs_RemovePubMedEntry);

    let elm = doc.getElementById(elmId_Nosource);
    let _tagNosource  = elm.value.trim();
    if (_tagNosource == "") _tagNosource = simTag_Nosource;
    if (_tagNosource  != elm.value) {
        elm.value = _tagNosource;
        this.setPref(prefs_Nosource, _tagNosource);
    }

    elm = doc.getElementById(elmId_Broken);
    let _tagBroken    = elm.value.trim();
    if (_tagBroken == "") _tagBroken = simTag_Broken;
    if (_tagBroken    != elm.value) {
        elm.value = _tagBroken;
        this.setPref(prefs_Broken, _tagBroken);
    }

    elm = doc.getElementById(elmId_Duplicate);
    let _tagDuplicate = elm.value.trim();
    if (_tagDuplicate == "") _tagDuplicate = simTag_Duplicate;
    if (_tagDuplicate != elm.value) {
        elm.value = _tagDuplicate;
        this.setPref(prefs_Duplicate, _tagDuplicate);
    }

    elm = doc.getElementById(elmId_Nonfile);
    let _tagNonfile = elm.value.trim();
    if (_tagNonfile == "") _tagNonfile = simTag_Nonfile;
    if (_tagNonfile != elm.value) {
        elm.value = _tagNonfile;
        this.setPref(prefs_Nonfile, _tagNonfile);
    }
    return [_tagNosource, _tagBroken, _tagDuplicate, _tagNonfile];
}

AttachmentScanner.renameTagsTo = async function(_tagNosource, _tagBroken, _tagDuplicate, _tagNonfile) {
    if (this.scanningState != 0) return;
    this.scanningState = 1;
    log("Renaming tags");

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

    this.scanningState = 0;
    log("Tags renamed");
};

AttachmentScanner.startScan = async function(win) {
    if (this.scanningState > 1) {
        log("Scanning is ongoing")
        return;
    }

    // prepare and create the progress window
    progressTitle = await this.getString("attachmentscanner-scan-title");
    progressInfo  = await this.getString("attachmentscanner-scan-progreess");
    progressWait  = await this.getString("attachmentscanner-scan-renamewait");

    this.progressWindow = new Zotero.ProgressWindow({closeOnClick: false});
    let winIcon = "chrome://zotero/skin/toolbar-advanced-search" + (Zotero.hiDPI ? "@2x" : "") + ".png";
    this.progressWindow.changeHeadline(progressTitle, winIcon);
    let appIcon = this.rootURI + "skin/attachscan" + (Zotero.hiDPI ? "@2x" : "") + ".png";
    this.progressWindow.progress = new this.progressWindow.ItemProgress(appIcon, "Scanning");
    this.progressWindow.show();

    // if there is a renaming operation, wait until it finishes
    if (this.scanningState == 1) {
        this.progressWindow.progress.setText(progressWait);
        while (this.scanningState == 1)
            await new Promise(r => setTimeout(r, 50));
    }

    // Check if renaming is needed, this happens if the preference window is not closed
    if (this.preferenceDocument) {
        this.setPreferenceWindowReadonly(this.preferenceDocument, true);
        const [_tagNosource, _tagBroken, _tagDuplicate, _tagNonfile] = this.updatePreferences(this.preferenceDocument);
        this.progressWindow.progress.setText(progressWait);
        this.renameTagsTo(_tagNosource, _tagBroken, _tagDuplicate, _tagNonfile);
    }

    // Now, scanning starts
    this.scanningState = 2;
    log("Start scan");

    // Get all items
    const items = await Zotero.DB.queryAsync(this.sqlAllItems) || [];
    let index = 0;
    let rate = Math.max(1, Math.round(items.length / 400));

    // Check each items
    for (const aItem of items) {
        // Update the progress window, less frequently
        if (index % rate == 0) {
            let s = progressInfo.replaceAll("${total}", items.length).replaceAll("${index}", index + 1);
            this.progressWindow.progress.setProgress(Math.round(100 * index / items.length));
            this.progressWindow.progress.setText(s);
        }
        index++;

        // Get item information
        const item = await Zotero.Items.getAsync(aItem.itemID);
        await item.loadAllData();
        if (await this.checkAttachements(item))
           await item.saveTx();
    }

    log("Clean up scan");
    this.progressWindow.close();
    this.scanningState = 0;
    if (this.preferenceDocument)
        this.setPreferenceWindowReadonly(this.preferenceDocument, false);
}

AttachmentScanner.checkAttachements = async function(item) {
    // Get all
    let attachmentIDs = item.getAttachments();
    let attachTypes = [];
    let hasFile = hasBroken = hasDuplicates = hasNonfiles = changed = false;
    let pubmedEntryID = null;

    for (attachmentID of attachmentIDs) {
        let attachment = await Zotero.Items.getAsync(attachmentID);
        if (attachment.isFileAttachment()) {
            hasFile = true;
            if (!await attachment.getFilePathAsync()) hasBroken = true;
            if (!hasDuplicates && this.scanDuplicate) {
                if (attachTypes.includes(attachment.attachmentContentType))
                    hasDuplicates = true;
                else attachTypes.push(attachment.attachmentContentType);
            }
        } else {
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

    if (hasFile && item.hasTag(this.tagNosource))   { changed = true; item.removeTag(this.tagNosource); }
    if (!hasFile && !item.hasTag(this.tagNosource)) { changed = true; item.addTag(this.tagNosource); }
    if (!hasBroken && item.hasTag(this.tagBroken))  { changed = true; item.removeTag(this.tagBroken); }
    if (hasBroken && !item.hasTag(this.tagBroken))  { changed = true; item.addTag(this.tagBroken); }
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

AttachmentScanner.onItemChange = {
    notify: async function(event, type, ids, extraData) { // string, string, Array<string>, ibject
        if (event == "modify") {
            log("Checking " + event + " with " + ids.length + " items");
            for (id of ids) {
                let item = await Zotero.Items.getAsync(id);
                await item.loadAllData();
                if (item.isAttachment()) { //isRegularItem
                    item = await Zotero.Items.getAsync(item.parentID);
                    await item.loadAllData();
                }
                if (await Zotero.AttachmentScanner.checkAttachements(item))
                    await item.saveTx();
            }
        }
    }
}







