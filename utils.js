const Gio = imports.gi.Gio;
const Config = imports.misc.config;
const Me = imports.misc.extensionUtils.getCurrentExtension();

function _getSettingsSchema(setschema) {
    const GioSSS = Gio.SettingsSchemaSource;

    let schema = setschema || Me.metadata['settings-schema'];
    let source = GioSSS.new_from_directory(Me.dir.get_child('schemas').get_path(),
        GioSSS.get_default(),
        false);

    return new Gio.Settings({
        settings_schema : source.lookup(schema, true)
    });
}