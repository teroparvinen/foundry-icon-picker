import { moduleId, localizationID } from "./const.js";
import { getContents } from "./remote-browser.js";

export class IconPicker extends Application {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            classes: ['dnd5e'],
            height: 400,
            width: 372,
            resizable: true,
            id: moduleId,
            template: `modules/${moduleId}/templates/icon-picker.hbs`,
            title: `${localizationID}.window-title`,
            userId: game.userId,
            scrollY: ['.icon-list'],
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;
    }

    _roots = [
        { storage: 'public', path: 'icons/commodities', name: 'commodities@system' },
        { storage: 'public', path: 'icons/consumables', name: 'consumables@system' },
        { storage: 'public', path: 'icons/containers', name: 'containers@system' },
        { storage: 'public', path: 'icons/creatures', name: 'creatures@system' },
        { storage: 'public', path: 'icons/environment', name: 'environment@system' },
        { storage: 'public', path: 'icons/equipment', name: 'equipment@system' },
        { storage: 'public', path: 'icons/magic', name: 'magic@system' },
        { storage: 'public', path: 'icons/skills', name: 'skills@system' },
        { storage: 'public', path: 'icons/sundries', name: 'sundries@system' },
        { storage: 'public', path: 'icons/tools', name: 'tools@system' },
        { storage: 'public', path: 'icons/weapons', name: 'weapons@system' },
        { storage: 'data', path: 'systems/dnd5e/icons/items', name: 'items@dnd5e' },
        { storage: 'data', path: 'systems/dnd5e/icons/skills', name: 'skills@dnd5e' },
        { storage: 'data', path: 'systems/dnd5e/icons/spells', name: 'spells@dnd5e' }
    ]
    
    _resolve = null;
    _reject = null;
    _contents = {}

    lastPathComponent(path) {
        const components = path.split('/');
        return components[components.length - 1];
    }

    previousPath(path) {
        const components = path.split('/');
        return components.slice(0, components.length-1).join('/');
    }

    getData(options) {
        const storage = this._contents.storage;
        const path = this._contents.path;

        const isRoot = !path;
        const isRootNode = this._roots.find(r => r.path === path);

        if (isRoot) {
            const dirs = this._roots.map(r => { return { storage: r.storage, path: r.path, name: r.name }});
            return { dirs, isRoot: true };
        } else {
            const previousPath = isRootNode ? "" : this.previousPath(path);
            const files = this._contents.files.map(f => { return { storage, path: f, name: this.lastPathComponent(f) }});
            const dirs = this._contents.dirs.map(d => { return { storage, path: d, name: this.lastPathComponent(d) }});
    
            return { storage, path, previousPath, files, dirs };
        }
    }

    activateListeners(html) {
        const self = this;
        html.find('.dir, .dir-up').on('click', function(event) {
            const storage = this.dataset.storage;
            const path = this.dataset.path;

            if (path) {
                self._fetchContents(storage, path);
            } else {
                self._fetchRoots();
            }
        })
        html.find('.file').on('click', function(event) {
            const storage = this.dataset.storage;
            const path = this.dataset.path;

            self._resolve(path);
            self._reject = () => {};
            self.close();
        });
    }

    close() {
        this._reject();
        super.close();
    }

    async pick(storage, path) {
        return new Promise(async (resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            if (storage && path) {
                this._fetchContents(storage, path);
            } else {
                this._fetchRoots();
            }
        });
    }

    async _fetchContents(storage, path) {
        const contents = await getContents(storage, path)
        this._contents = contents
        this.render(true);
    }

    _fetchRoots() {
        this._contents = {};
        this.render(true);
    }
}