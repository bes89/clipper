const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Clipper = Me.imports.clipper;

let clipper = null;

function init() {
    // do nothing
}

function enable() {
    clipper = new Clipper.ClipperExtension();
    clipper.enable();
}

function disable() {
    clipper.disable();
}
