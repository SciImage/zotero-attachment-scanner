// This is writen as a reusable template for Zotero plugins. Only the first lines should be modified.
// To implement the preference, add "onload='Zotero.AttachmentScanner.initPreference(document);'" to the root element in prefXHTML
// Implement these functions if needed:
//      init({ id, version, rootURI }), main(), addToWindow(window), removeFromWindow(window),
//      onPreferenceWindowFocus(doc), onPreferenceWindowLoseFocus(doc),
//      onPreferenceWindowClose(doc), onPreferenceWindowOpen(doc),
//      onCollectionChange(event, type, ids, extraData), onItemChange, onFileChange, onTagChange
// helper functions:
//      getPref(pref), setPref(pref, value), storeCreatedElement(elm), getString(ftdID), getStringDef(ftdID, def)

const pluginName  = "Attachment Scanner";
const pluginId    = "attachmentscanner@changlab.um.edu.mo";
const version     = "0.1.0";
const mainJS      = "attachmentscanner.js";
const mainFTL     = "attachmentscanner.ftl";
const prefXHTML   = "preferences.xhtml";
const prefJS      = "";
const prefNameFTD = "attachmentscanner-prefs-title";
const prefScope   = "attachmentscanner";

// log(xxx) can use either Zotero.log() or Zotero.debug(), set useLog to true for the former;
//     debug output appears in the console only when "Debug output logging" is enabled.
var   useLog      = false;

function onStartup() {
    Zotero.AttachmentScanner = AttachmentScanner; // so that it can be used by other objects, including in prefXHTML and prefJS
    return AttachmentScanner;
}

function onShutdown() {
    AttachmentScanner = undefined;
    Zotero.AttachmentScanner = undefined;
}

var AttachmentScanner = {
// This is writen as a reusable template for Zotero plugins. Only lines above should be modified.

    id: null,
    version: null,
    rootURI: null,
    // IDs of created elements; the IDs are pooled and removeFromWindow() will remove all
    //    elements with one of the IDs even if those not created by this plugin
    addedElementIDs: [],
    // Set if the preference window is opened
    preferenceDocument: undefined,

    // =====  Preference and initialization =====

    getPref(pref) {
        return Zotero.Prefs.get("extensions." + prefScope + "." + pref, true);
    },

    setPref(pref, value) {
        return Zotero.Prefs.set("extensions." + prefScope + "." + pref, value, true);
    },

    _init({ id, version, rootURI } = {}) {
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;

        if (this.init) this.init({ id, version, rootURI });
        if (mainFTL)
            this.localization = new Localization([mainFTL]);

        // "collection", "search", "share", "share-items", "item", "file", "collection-item", "item-tag", "tag",
        // "setting", "group", "trash", "bucket", "relation", "feed", "feedItem", "sync", "api-key", "tab";
        if (this.onCollectionChange)
            this.itemNotifierID = Zotero.Notifier.registerObserver(this.onCollectionChange, ['collection']);
        if (this.onItemChange)
            this.itemNotifierID = Zotero.Notifier.registerObserver(this.onItemChange, ['item']);
        if (this.onFileChange)
            this.fileNotifierID = Zotero.Notifier.registerObserver(this.onFileChange, ['file']);
        if (this.onTagChange)
            this.tagNotifierID = Zotero.Notifier.registerObserver(this.onTagChange, ['tag']);
    },

    // ===== Adding to/removing from windows =====

    // All created elements should be stored by call this for auto release
    storeCreatedElement(elm) {
        if (elm.id || !this.addedElementIDs.includes(elm.id))
            this.addedElementIDs.push(elm.id);
    },

    freeCreatedElements(doc) {
        for (let id of this.addedElementIDs)
            doc.getElementById(id)?.remove();
    },

    _addToWindow(window) {
        log("Add to a window");
        if (mainFTL)
            window.MozXULElement.insertFTLIfNeeded(mainFTL);
        if (this.addToWindow) this.addToWindow(window);
    },

    _removeFromWindow(window) {
        log("Remove from a window");
        if (this.removeFromWindow) this.removeFromWindow(window);
        var doc = window.document;
        this.freeCreatedElements(doc);
        if (mainFTL)
            doc.querySelector("[href='" + mainFTL + "']").remove();
    },

    addToAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (win.ZoteroPane) this._addToWindow(win);
        }
    },

    removeFromAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (win.ZoteroPane) this._removeFromWindow(win);
        }
        this.addedElementIDs = [];
    },

    getString(ftdID) {
        if (this.localization)
            return this.localization.formatValue(ftdID);
        else return ftdID;
    },

    getStringDef(ftdID, defaultValue) {
        if (this.localization)
            return this.localization.formatValue(ftdID);
        else return defaultValue;
    },

    // Add "onload='Zotero.AttachmentScanner.initPreference(document);'" to the root element in prefXHTML
    initPreference(doc) {
        log("Open the preference window");
        this.preferenceDocument = doc;

        // This is called after onPreferenceWindowOpen AND after the first mouse click on the window
        // And each time the window is activated
        // Clicking alternatively on the left/right panels fires multiple focusin/focusout
        if (this.onPreferenceWindowFocus)
            doc.addEventListener("focusin", (event) => {
                this.onPreferenceWindowFocus(doc);
            });

        // This is called before the FIRST onPreferenceWindowLoseFocus call
        // And each time the window is deactivated
        // Clicking alternatively on the left/right panels fires multiple focusin/focusout
        if (this.onPreferenceWindowLoseFocus)
            doc.addEventListener("focusout", (event) => {
                this.onPreferenceWindowLoseFocus(doc);
            });

        // This is called when the window is closed, after focusout
        if (this.onPreferenceWindowClose)
            doc.addEventListener('visibilitychange', () => {
                if (doc.visibilityState == 'hidden') this.onPreferenceWindowClose(doc);
                this.preferenceDocument = undefined;
            });

        // This is called before each time the window is open, not immediately though
        if (this.onPreferenceWindowOpen)
            this.onPreferenceWindowOpen(doc);
    },
}

function log(msg) {
    if (useLog)
        Zotero.log(pluginName + ": " + msg);
    else Zotero.debug(pluginName + ": " + msg);
}

function install() {
    log("Installed version " + version);
}

function uninstall() {
    log("Uninstalled version " + version);
}

var pluginObj = undefined;

async function startup({ id, version, rootURI }) {
    log("Starting up...");
    pluginObj = onStartup();
    Services.scriptloader.loadSubScript(rootURI + mainJS);
    pluginObj._init({ id, version, rootURI });

    if (prefXHTML) {
        let args = {pluginID: pluginId, src: rootURI + prefXHTML};
        if (prefJS) Object.assign(args, {scripts: [rootURI + prefJS]});
        if (prefNameFTD) Object.assign(args, {label: await pluginObj.getStringDef(prefNameFTD, "Attachments")});
        Zotero.PreferencePanes.register(args);
    }
    pluginObj.addToAllWindows();
    if (pluginObj.main)
      await pluginObj.main();
}

function onMainWindowLoad({ window }) {
    pluginObj._addToWindow(window);
}

function onMainWindowUnload({ window }) {
    pluginObj._removeFromWindow(window);
}

function shutdown() {
    log("Shutting down...");
    pluginObj.removeFromAllWindows();
    if (pluginObj.collectionNotifierID) Zotero.Notifier.unregisterObserver(pluginObj.collectionNotifierID);
    if (pluginObj.itemNotifierID)       Zotero.Notifier.unregisterObserver(pluginObj.itemNotifierID);
    if (pluginObj.fileNotifierID)       Zotero.Notifier.unregisterObserver(pluginObj.fileNotifierID);
    if (pluginObj.tagNotifierID)        Zotero.Notifier.unregisterObserver(pluginObj.tagNotifierID);
    onShutdown();
}