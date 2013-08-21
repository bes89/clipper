const Meta = imports.gi.Meta;
const Main = imports.ui.main;
const St = imports.gi.St;
const Lang = imports.lang;
const Tweener = imports.ui.tweener;
const Shell = imports.gi.Shell;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

// TODO: get this value from metadata.json
const KEYBINDING_BASE = 'org.gnome.shell.extensions.clipper';


const ClipperExtension = new Lang.Class({
    Name: 'ClipperExtension',

    _init: function() {
        // do nothing
    },

    _from_clipboard: function() {
        this.open();
    },

    _add_keybindings: function() {
        Main.wm.addKeybinding(
            "open-clipper-dialog-keybinding",
            Utils.SETTINGS,
            Meta.KeyBindingFlags.NONE,
            Shell.KeyBindingMode.NORMAL |
                Shell.KeyBindingMode.MESSAGE_TRAY |
                Shell.KeyBindingMode.OVERVIEW,
            Lang.bind(this, function() {
                this.open();
            })
        );
    },

    _remove_keybindings: function() {
        Main.wm.removeKeybinding("open-clipper-dialog-keybinding");
    },

    open: function() {
        let text = new St.Label({
            style_class: 'helloworld-label',
            text: "TEST"
        });

        Main.uiGroup.add_actor(text);

        text.opacity = 255;

        let monitor = Main.layoutManager.primaryMonitor;

        text.set_position(
            Math.floor(monitor.width / 2 - text.width / 2),
            Math.floor(monitor.height / 2 - text.height / 2)
        );

        Tweener.addTween(text, {
            opacity: 0,
            time: 1,
            transition: 'easeOutQuad',
            onComplete: function () {}
        });
    },

    close: function() {
        // do nothing
    },

    enable: function() {
        this._add_keybindings();
    },

    disable: function() {
        this.close();
        this._remove_keybindings();
    }
});