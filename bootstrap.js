// This is a loader for general use.
// Only a few changes (mostly the object/plugin names) are needed to create a loader for another plugin.
// To implement the preference, add "onload='Zotero.AttachmentScanner.initPreference(document);'" to the root element in prefXHTML
// Implement these functions if needed:
//      init({ id, version, rootURI }), main(), addToWindow(window), removeFromWindow(window),
//      onPreferenceWindowFocus(doc), onPreferenceWindowLoseFocus(doc),
//      onPreferenceWindowClose(doc), onPreferenceWindowOpen(doc),
//      onCollectionChange(event, type, ids, extraData), onCollectionItemChange, onItemChange, onFileChange, onTagChange

const pluginName  = "Attachment Scanner";
const pluginId    = "attachmentscanner@changlab.um.edu.mo";
const version     = "0.4.1";
const mainJS      = "attachmentscanner.js";             // This is the actual plugin code
const mainFTL     = "attachmentscanner.ftl";            // Localization file
const prefXHTML   = "preferences.xhtml";                // Document for the pref window
const prefJS      = "";                                 // .js file for prefXHTML
const prefNameFTD = "attachmentscanner-prefs-title";    // Localized title shown in Zotero's pref window
const prefDefName = "Attachment";                       // Incase if no localized title is provided, use this or pluginName
const prefHelpURL = 'https://github.com/SciImage/zotero-attachment-scanner/blob/main/others/preference_help.md';    // Url of external help shown in Zotero's pref window
const prefScope   = "attachmentscanner";                // Prefix of all entries in Zotero's global prefs.ini

function onStartup() {
    // Store a reference in the global Zotero object, so that it can be used by prefXHTML, prefJS, and other objects
    return Zotero.AttachmentScanner = AttachmentScanner;
}

function onShutdown() {
    Zotero.AttachmentScanner = undefined;
}

var AttachmentScanner = {
// Any changes below this point is unncessary and not recommended.

    id: null,
    version: null,
    rootURI: null,

    // IDs of created elements; removeFromWindow() will remove all elements with one of the IDs even if those not created by this plugin
    addedElementIDs: [],
    // preferenceDocument is set if the preference window is opened
    preferenceDocument: undefined,

    // =====  Preference I/O and string localization =====
    getPref(pref) {
        return Zotero.Prefs.get(`extensions.${prefScope}.${pref}`, true);
    },

    getPrefDefault(pref, defaultValue) {
        let value = Zotero.Prefs.get(`extensions.${prefScope}.${pref}`, true)?.trim();
        if (value) return value;
        Zotero.Prefs.set(`extensions.${prefScope}.${pref}`, defaultValue, true);
        return defaultValue;
    },

    setPref(pref, value) {
        return Zotero.Prefs.set(`extensions.${prefScope}.${pref}`, value, true);
    },

    getLocalizedString(l10nID) {
        return (this.localization) ? this.localization.formatValueSync(l10nID) : l10nID;
    },

    getLocalizedStringDefault(l10nID, defaultValue) {
        return (this.localization) ? this.localization.formatValueSync(l10nID) : defaultValue;
    },

    // ===== Handling created elemetns/menuitem =====
    storeCreatedElement(elm) {
        if (elm.id || !this.addedElementIDs.includes(elm.id))
            this.addedElementIDs.push(elm.id);
    },

    freeCreatedElements(doc) {
        for (let id of this.addedElementIDs)
            doc.getElementById(id)?.remove();
    },

    // menuID: DOM ID of the parent, like "menu_ToolsPopup", "zotero-itemmenu", "menu_FilePopup", "menu_NewItemPopup", "menu_EditPopup", etc
    // menuItemId: DOM ID of the created menu item
    // l10nID: ID for localization
    // icon: Url to the icon file, like: `${this.rootURI}skin/scan.png`;
    // options: {hidden: Boolean; disabled: Boolean}
    // command: function to execute when selected
    async addMenuItem(window, menuID, menuItemId, l10nID, icon, options, command) {
        let doc = window.document;
        let menuitem = doc.createXULElement("menuitem");
        menuitem.id = menuItemId;
        // Not using menuitem.setAttribute because of it has bugs handling localization (at least on Macs)
        // Popup menu mostly use 'en' and main menu randomly use 'en' or others
        // menuitem.setAttribute("data-l10n-id", l10nID);
        let s = this.getLocalizedString(l10nID);
        menuitem.setAttribute("label", s);
        if (command) menuitem.addEventListener("command", command);
        // Another Zotero's bug: Icon is not shown correctly on Windows....
        if (icon) menuitem.style.listStyleImage = `url(${icon})`;
        if (options.hidden) menuitem.hidden = true;
        if (options.disabled) menuitem.disabled = true;
        doc.getElementById(menuID).appendChild(menuitem);
        // so that it can be freed
        this.storeCreatedElement(menuitem);
    },

    async setItemStateAllWin(id, disabled, hidden) {
        let windows = Zotero.getMainWindows();
        for (let win of windows)
            this.setItemState(win, id, disabled, hidden);
    },

    async setItemState(win, id, disabled, hidden) {
        let item = win?.document?.getElementById(id);
        if (item) {
            // log(`${id}: (${item.disabled}, ${item.hidden}) --> (${disabled}, ${hidden})`);
            if (hidden !== undefined) item.hidden = hidden;
            if (disabled !== undefined) item.disabled = disabled;
        }
    },

    createProgressWindow(title, desc, hideImage, hackWithTimer) {
        this.progressWindow = new Zotero.ProgressWindow({closeOnClick: false});
        this.progressWindow.changeHeadline("", "headline", title); // the second is the CSS key
        this.progressWindow.progress = new this.progressWindow.ItemProgress("", "Scanning");
        this.progressWindow.progress.setProgress(0.1);  // to avoid position moving
        this.progressWindow.show();
        this.progressWindow.styleInjected = false;
        this.progressWindow.refreshRate   = 10;
        this.progressWindow.realRate      = 1;
        this.hideImage = hideImage;
        if (desc !== undefined)
            this.progressWindow.addDescription(desc);
        if (hackWithTimer)
            setTimeout(this._hackProgressWindow.bind(this), 20);
    },

    setProgress(text, progress) {
        if (progress !== undefined)
            this.progressWindow.progress.setProgress(Math.round(97.4 * progress)); // not 100, just 97.4
        this.progressWindow.progress.setText(text);
        this.hackProgressWindow();
    },

    closeProgressWindow() {
        this.progressWindow.close();
        this.progressWindow = undefined;
    },

    _hackProgressWindow() {
        this.hackProgressWindow(false);
        if (this.progressWindow && !this.progressWindowstyleInjected)
            setTimeout(this._hackProgressWindow.bind(this), 20);
    },

    hackProgressWindow() {
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
        //   3: Make the progress be between [0, 97.5)

        let pwin = this.progressWindow;
        if (!pwin || pwin.styleInjected) return;
        // The testing is necessary because creation of element is async
        if (!pwin.styleInjected && pwin.progress._image) {
            pwin.styleInjected = true;

            const doc = pwin.progress._image.ownerDocument;
            //const styleText = `.icon-attachmentScanner {background: url("${this.appIcon}") no-repeat content-box; background-size: 16px;}`;
            //const sheet = doc.styleSheets[0];
            //sheet.insertRule(styleText, sheet.cssRules.length);
            const headLine = doc.getElementById("zotero-progress-text-headline");
            if (headLine) {
                if (headLine.children[0] && headLine.children[0].tagName == "label" && headLine.children[0].innerHTML == "")
                    headLine.children[0].hidden = true;
                const icons = headLine.getElementsByClassName("icon-headline");
                log(icons.length);
                if (icons.length > 0) {
                    icons[0].style.background = `url("${this.appIcon}") no-repeat content-box`;
                    icons[0].style.backgroundSize = "16px";
                }
            }
            pwin.realRate = pwin.refreshRate;

            let elm = pwin.progress._itemText;
            if (elm) elm.style.width = "100%";
            if (this.hideImage) pwin.progress._image.hidden = true;
        } else if (pwin.realRate < pwin.refreshRate) pwin.realRate ++;
    },

    // =====  Initialization and finalization =====
    _init({ id, version, rootURI } = {}) {
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;

        if (mainFTL)
            this.localization = new Localization([mainFTL], true);
        if (this.init) this.init({ id, version, rootURI });

        // "collection", "search", "share", "share-items", "item", "file", "collection-item", "item-tag", "tag",
        // "setting", "group", "trash", "bucket", "relation", "feed", "feedItem", "sync", "api-key", "tab";
        if (this.onCollectionChange && !this.collectionNotifierID)
            this.collectionNotifierID = Zotero.Notifier.registerObserver(this.onCollectionChange, ['collection']);
        if (this.onCollectionItemChange && !this.collectionItemNotifierID)
            this.collectionItemNotifierID = Zotero.Notifier.registerObserver(this.onCollectionItemChange, ['collection-item']);
        if (this.onItemChange && !this.itemNotifierID)
            this.itemNotifierID = Zotero.Notifier.registerObserver(this.onItemChange, ['item']);
        if (this.onFileChange && !this.fileNotifierID)
            this.fileNotifierID = Zotero.Notifier.registerObserver(this.onFileChange, ['file']);
        if (this.onTagChange && this.tagNotifierID)
            this.tagNotifierID = Zotero.Notifier.registerObserver(this.onTagChange, ['tag']);
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

    // ==== This is called by prefXHTML to set up event notifications
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

var pluginObj = undefined;      // The is only to store the object so that the below code doesn't need to change for another plugin
// log(Message) log a message using different methods.
//   0: Hide the message;
//   1: Use Zotero.debug (won't show in the Error Console unless "Debug output logging" is enabled);
//   2: Use Zotero.log (Show as Warning in the Error Console)
var useLog = (Components.stack.filename.startsWith("jar:")) ? 1 : 2;  // use Zotero.log when it is not in a .xpi (jar:file:///XXX.xpi!/bootstrap.js)

function log(msg) {
    if (useLog == 2)
        Zotero.log(pluginName + ": " + msg);
    else if (useLog == 1)
        Zotero.debug(pluginName + ": " + msg);
}

// These are required for bootstrap.js
function install() {
    log("Installed version " + version);
}

function uninstall() {
    log("Uninstalled version " + version);
}

async function startup({ id, version, rootURI }) {
    log("Starting up...");
    pluginObj = onStartup();
    Services.scriptloader.loadSubScript(rootURI + mainJS);
    pluginObj._init({ id, version, rootURI });

    if (prefXHTML) {
        let args = {pluginID: pluginId, src: rootURI + prefXHTML};
        if (prefJS) Object.assign(args, {scripts: [rootURI + prefJS]});
        if (prefNameFTD) Object.assign(args, {label: pluginObj.getLocalizedStringDefault(prefNameFTD, prefDefName || pluginName)});
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
    if (pluginObj.collectionNotifierID)     Zotero.Notifier.unregisterObserver(pluginObj.collectionNotifierID);
    if (pluginObj.collectionItemNotifierID) Zotero.Notifier.unregisterObserver(pluginObj.collectionItemNotifierID);
    if (pluginObj.itemNotifierID)           Zotero.Notifier.unregisterObserver(pluginObj.itemNotifierID);
    if (pluginObj.fileNotifierID)           Zotero.Notifier.unregisterObserver(pluginObj.fileNotifierID);
    if (pluginObj.tagNotifierID)            Zotero.Notifier.unregisterObserver(pluginObj.tagNotifierID);
    onShutdown();
}