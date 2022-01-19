import { moduleId } from "./const.js";
import { IconPicker } from './app.js';

async function pickImage(img) {
	const picker = new IconPicker();

	try {
		let result = await picker.pick();
		$(img).attr('src', result);
		$(img).closest('form').submit();
	} catch { }
}

Hooks.on('renderItemSheet', (app, html) => {
	if (!game.user.can("FILES_BROWSE")) {
		if (app.isEditable) html.find('img[data-edit]').click(function (ev) { pickImage(this); });
	}
});

Hooks.on('init', () => {
	game.modules.set(moduleId, {
		api: IconPicker
	})
});
