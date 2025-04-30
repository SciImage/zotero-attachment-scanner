const pluginName  = "Attachment Scanner";
const pluginId    = "attachmentscanner@changlab.um.edu.mo";
const version     = "0.3.2";
const mainJS      = "attachmentscanner.js";
const mainFTL     = "attachmentscanner.ftl";
const prefXHTML   = "preferences.xhtml";
const prefJS      = "";
const prefNameFTD = "attachmentscanner-prefs-title";
const prefHelpURL = 'https://github.com/SciImage/zotero-attachment-scanner/blob/main/others/preference_help.md';
const prefScope   = "attachmentscanner";

var useLog      = false;

function onStartup() {
    Zotero.AttachmentScanner = AttachmentScanner; // so that it can be used by other objects, including in prefXHTML and prefJS
    return AttachmentScanner;
}

function onShutdown() {
    AttachmentScanner = undefined;
    Zotero.AttachmentScanner = undefined;
}

var AttachmentScanner = {
    id: null,
    version: null,
    rootURI: null,
    // IDs of created elements; the IDs are pooled and removeFromWindow() will remove all
    //    elements with one of the IDs even if those not created by this plugin
    addedElementIDs: [],
    // preferenceDocument is set if the preference window is opened
    preferenceDocument: undefined,

    // =====  Preference and initialization =====

    getPref(pref) {
        return Zotero.Prefs.get(`extensions.${prefScope}.${pref}`, true);
    },

    getPrefNonEmpty(pref, defaultValue) {
        let value = Zotero.Prefs.get(`extensions.${prefScope}.${pref}`, true)?.trim();
        if (value) return value;
        Zotero.Prefs.set(`extensions.${prefScope}.${pref}`, defaultValue, true);
        return defaultValue;
    },

    setPref(pref, value) {
        return Zotero.Prefs.set(`extensions.${prefScope}.${pref}`, value, true);
    },

    _init({ id, version, rootURI } = {}) {
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;

        if (mainFTL)
            this.localization = new Localization([mainFTL]);
        if (this.init) this.init({ id, version, rootURI });
        if (this.onItemChange && !this.itemNotifierID)
            this.itemNotifierID = Zotero.Notifier.registerObserver(this.onItemChange, ['item']);
    },

    // ===== Adding to/removing from windows =====

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
            doc.querySelector(`[href='${mainFTL}']`).remove();
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

    getString(l10nID) {
        if (this.localization)
            return this.localization.formatValue(l10nID);
        else return l10nID;
    },

    getStringDef(l10nID, defaultValue) {
        if (this.localization)
            return this.localization.formatValue(l10nID);
        else return defaultValue;
    },

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

    async addMenuItem(window, menuID, itemId, l10nID, icon, options, command) {
        let doc = window.document;
        let menuitem = doc.createXULElement("menuitem");
        menuitem.id = itemId;
        // Zotero has a bug handling labels of menu items, popup menu mostly use 'en' and main menu randomly use 'en' or others
        // menuitem.setAttribute("data-l10n-id", l10nID);
        let s = await this.getString(l10nID);
        menuitem.setAttribute("label", s);
        menuitem.addEventListener("command", command);
        if (icon) menuitem.style.listStyleImage = `url(${icon})`;
        if (options.hidden) menuitem.hidden = true;
        if (options.disabled) menuitem.disabled = true;
        doc.getElementById(menuID).appendChild(menuitem);
        this.storeCreatedElement(menuitem);
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
        if (prefHelpURL) Object.assign(args, {helpURL: prefHelpURL});
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
    if (pluginObj.itemNotifierID)       Zotero.Notifier.unregisterObserver(pluginObj.itemNotifierID);
    onShutdown();
}