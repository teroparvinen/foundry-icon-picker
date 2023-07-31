import { moduleId, localizationID } from "./const.js";
import { getContents, getRoots, performSearch } from "./remote-browser.js";
import { lastPathComponent, parentPath } from "./utils.js";

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

    _roots = null;
    
    _resolve = null;
    _reject = null;
    _contents = {};
    _isSearching = false;
    _searchTerm = null;

    async getData(options) {
        if (this._roots === null) {
            this._roots = await getRoots();
        }

        const storage = this._contents.storage;
        const path = this._contents.path;
        const root = this._roots.find(r => path?.startsWith(r.path) && storage == r.storage);

        const isRoot = !path;
        const isRootNode = this._roots.find(r => r.path === path);

        const isSearch = this._isSearching;

        if (isSearch) {
            return foundry.utils.mergeObject({ isSearch: true, searchTerm: this._searchTerm }, this._contents);
        } else if (isRoot) {
            const dirs = this._roots.map(r => { return { storage: r.storage, path: r.path, name: r.name }});
            return { dirs, isRoot: true };
        } else {
            const previousPath = isRootNode ? "" : parentPath(path);
            const files = this._contents.files.map(f => { return { storage, path: f, name: lastPathComponent(f) }});
            const dirs = this._contents.dirs.map(d => { return { storage, path: d, name: lastPathComponent(d) }});

            const selectedPath = path.slice(root.path.length);
            const displayPath = root.name + selectedPath;
    
            return { storage, path, previousPath, files, dirs, displayPath };
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
        });
        html.find('.file').on('click', function(event) {
            const storage = this.dataset.storage;
            const path = this.dataset.path;

            self._resolve(path);
            self._reject = () => {};
            self.close();
        });
        html.find('.search-input').on('change', function(event) {
            if (!event.target.value) {
                self._searchTerm = null;
                self._contents = {};
                self.render(true);
            } else {
                self._performSearch(event.target.value);
            }
        });
        html.find('.toggle-search').on('click', function(event) {
            self._isSearching = !self._isSearching;
            if (self._isSearching && self._searchTerm) {
                self._performSearch(self._searchTerm);
            } else {
                self._contents = {};
                self.render(true);
            }
        });
        if (self._isSearching) { html.find('.search-input').focus(); }
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
        this._isSearching = false;
        this.render(true);
    }

    async _performSearch(query) {
        this._searchTerm = query;

        const result = await performSearch(query);
        this._contents = result;
        this.render(true);
    }

    _fetchRoots() {
        this._contents = {};
        this.render(true);
    }
}
