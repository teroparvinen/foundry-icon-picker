import { moduleId } from "./const.js";
import { IconPicker } from './app.js';

async function pickImage(img, shouldCallSubmit) {
    const picker = new IconPicker();

    try {
        let result = await picker.pick();
        $(img).attr('src', result);
        if (shouldCallSubmit) {
            $(img).closest('form').submit();
        }
    } catch { }
}

Hooks.on('renderItemSheet', (app, html) => {
    if (!game.user.can("FILES_BROWSE")) {
        if (app.isEditable) html.find('img[data-edit]').click(function (ev) { pickImage(this, app.options.submitOnChange); });
    } else {
        if (app.isEditable) html.find('img[data-edit]').on("contextmenu", function (ev) { pickImage(this, app.options.submitOnChange); });
    }
});
Hooks.on('renderMacroConfig', (app, html) => {
    if (!game.user.can("FILES_BROWSE")) {
        if (app.isEditable) html.find('img[data-edit]').click(function (ev) { pickImage(this, app.options.submitOnChange); });
    } else {
        if (app.isEditable) html.find('img[data-edit]').on("contextmenu", function (ev) { pickImage(this, app.options.submitOnChange); });
    }
});

Hooks.on('init', () => {
    game.modules.get(moduleId).api = IconPicker
});
