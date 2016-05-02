const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Lang = imports.lang;
const Main = imports.ui.main;
const Gtk = imports.gi.Gtk;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;
const Settings = Utils._getSettingsSchema();
const Clipboard = St.Clipboard.get_default();
const CLIPBOARD_TYPE = St.ClipboardType.CLIPBOARD;

const OPEN_KEY = 'open-keybinding';
const UP_KEY = 'up-keybinding';
const DOWN_KEY = 'down-keybinding';
const SELECT_KEY = 'select-keybinding';
const CLOSE_KEY = 'close-keybinding';

const LIMIT = 25;
const TIMEOUT_MS = 1000;


function Clipper() {
    this.init();
}

Clipper.prototype = {
    _shortcutsBindingIds: [],
    _timeoutId: null,
    _entries: [],
    _isopen: false,
    _label: null,
    _index: 0,

    destroy: function () {
        this._unbindShortcuts();
        this._clearTimeout();
    },

    init: function() {
        this._shortcutsBindingIds = [];

        this._bindShortcuts();
        this._setupTimeout();
    },

    _setupTimeout: function() {
        let that = this;

        this._timeoutId = Mainloop.timeout_add(TIMEOUT_MS, function () {
            Clipboard.get_text(CLIPBOARD_TYPE, function (clipBoard, text) {
                if (text && that._entries.indexOf(text) < 0) {
                    that._entries.unshift(text);

                    if (that._entries.length > LIMIT) {
                        that._entries.pop();
                    }
                }

                that._setupTimeout();
            });
        });
    },

    _clearTimeout: function () {
        if (!this._timeoutId) {
            return;
        }

        Mainloop.source_remove(this._timeoutId);
        this._timeoutId = null;
    },

    _bindShortcuts: function () {
        this._unbindShortcuts();
        this._bindShortcut(OPEN_KEY, this.open);
    },

    _bindNavigationShortcuts: function() {
        this._bindShortcut(UP_KEY, this.up);
        this._bindShortcut(DOWN_KEY, this.down);
        this._bindShortcut(SELECT_KEY, this.select);
        this._bindShortcut(CLOSE_KEY, this.close);
    },

    _unbindShortcuts: function () {
        this._shortcutsBindingIds.forEach(
            (id) => Main.wm.removeKeybinding(id)
        );
        this._shortcutsBindingIds = [];
    },

    _bindShortcut: function(id, kallback) {
        return Main.wm.addKeybinding(
            id,
            Settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL |
            Shell.ActionMode.MESSAGE_TRAY |
            Shell.ActionMode.OVERVIEW,
            Lang.bind(this, kallback)
        );
    },

    _unbindShortcut: function(id) {
        Main.wm.removeKeybinding(id);
    },

    _unbindNavigationShortcuts: function() {
        this._unbindShortcut(UP_KEY);
        this._unbindShortcut(DOWN_KEY);
        this._unbindShortcut(SELECT_KEY, this._select);
        this._unbindShortcut(CLOSE_KEY);
    },

    _setSizing: function() {
        let monitor = Main.layoutManager.primaryMonitor;
        let label = this._label;

        const MAX_WIDTH = 60;
        const MAX_HEIGHT = 50;

        let maxWidthPx = (monitor.width / 100) * MAX_WIDTH;
        let maxHeightPx = (monitor.height / 100) * MAX_HEIGHT;

        // reset style
        // todo: it works but produces error log entries
        label.style = '';
        let style = [];

        if (label.width > maxWidthPx) {
            style.push('width:'+maxWidthPx+'px');
        }

        if (label.height > maxHeightPx) {
            style.push('height:'+maxHeightPx+'px');
        }

        label.style = style.join(';');
    },

    _setPosition: function() {
        let monitor = Main.layoutManager.primaryMonitor;

        this._label.set_position(
            Math.floor(monitor.width / 2 - this._label.width / 2),
            Math.floor(monitor.height / 2 - this._label.height / 2)
        );
    },

    updateLabel: function() {
        this._setSizing();
        this._setPosition();
    },

    open: function() {
        if (this._isopen) {
            return false;
        }

        this._index = 0;
        this._bindNavigationShortcuts();

        this._label = new St.Label({
            style_class: 'label',
            text: ''
        });
        let label = this._label;

        global.stage.add_actor(label);

        if (this._entries.length === 0) {
            this._label.text = 'Clipboard is empty';
            let that = this;
            Mainloop.timeout_add(750, function () {
                that.close();
            });
        } else {
            label.text = this._entries[0];
        }

        this.updateLabel();

        return true;
    },

    up: function() {
        if (this._index > 0) {
            this._index--;
            this._label.text = this._entries[this._index];

            this.updateLabel();
        }
    },

    down: function() {
        if (this._index < this._entries.length - 1) {
            this._index++;
            this._label.text = this._entries[this._index];

            this.updateLabel();
        }
    },

    select: function() {
        let text = this._entries[this._index];
        text && Clipboard.set_text(CLIPBOARD_TYPE, text);

        this.close();
    },

    close: function() {
        this._isopen = false;
        this._label.destroy();
        this._unbindNavigationShortcuts();
    }
};





let clipper;

function init(metadata) {
    clipper = new Clipper();
}

function enable() {
    clipper.init();
}

function disable() {
    clipper.destroy();
}




