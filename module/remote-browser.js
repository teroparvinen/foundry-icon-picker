import { moduleId } from './const.js';
import { roots } from './config.js';
import { lastPathComponent, parentPath, uniqueBy } from './utils.js';

let contentCache = {};
let fileSearchables = [];
let dirSearchables = [];
let requests = [];
let searchRequest = null;

function makePathKey(storage, path) {
    return `${path}@${storage}`;
}

// public or data
export async function getContents(storage, path) {
    if (game.user.can("FILES_BROWSE")) {
        const result = await FilePicker.browse(storage, path);
        return { dirs: result.dirs, files: result.files, storage, path };
    } else {
        const key = makePathKey(storage, path);
        if (contentCache[key]) {
            return contentCache[key];
        } else {
            return new Promise((resolve) => {
                socket.emit(
                    `module.${moduleId}`,
                    { request: { storage, path	}}
                );
                requests.push({
                    key: makePathKey(storage, path),
                    handler: resolve
                })
            });
        }
    }
}

export async function performSearch(query) {
    if (game.user.can("FILES_BROWSE")) {
        return searchFor(query);
    } else {
        return new Promise((resolve) => {
            socket.emit(
                `module.${moduleId}`,
                { search: query }
            );
            if (searchRequest) searchRequest(false);
            searchRequest = resolve;
        });
    }
}

async function indexContents(storage, path) {
    const result = await FilePicker.browse(storage, path);
    await Promise.all(result.dirs.map(d => indexContents(storage, d)));
    result.files.forEach(f => fileSearchables.push({ storage, path: f, name: lastPathComponent(f) }));
    result.dirs.forEach(d => dirSearchables.push({ storage, path: d, name: lastPathComponent(d) }));
}

function searchFor(query) {
    const terms = query
        .split(' ')
        .filter(t => t);

    const files = fileSearchables.filter(i => {
        return terms.every(t => i.path.toLowerCase().includes(t.toLowerCase()));
    });
    const directDirs = dirSearchables.filter(i => {
        return terms.every(t => i.path.toLowerCase().includes(t.toLowerCase()));
    });

    const fileDirs = files
        .map(f => {
            const path = parentPath(f.path);
            return { storage: f.storage, path, name: lastPathComponent(path) };
        });

    const dirs = uniqueBy([...directDirs, ...fileDirs], d => d.path);
    dirs.sort((a, b) => a.name.localeCompare(b.name));

    return { dirs, files };
}

Hooks.on('setup', () => {
    socket.on(`module.${moduleId}`, async (op) => {
        if (game.user.can("FILES_BROWSE")) {
            if (op.request) {
                const result = await FilePicker.browse(op.request.storage, op.request.path);
                socket.emit(`module.${moduleId}`, { 
                    result: { dirs: result.dirs, files: result.files, storage: op.request.storage, path: op.request.path },
                    originalRequest: op.request
                });
            } else if (op.search) {
                socket.emit(`module.${moduleId}`, {
                    result: searchFor(op.search),
                    originalSearch: op.search
                });
            }
        }
        
        if (op.result && !game.user.can("FILES_BROWSE")) {
            if (op.originalRequest) {
                const requestKey = makePathKey(op.originalRequest.storage, op.originalRequest.path);
                requests
                    .filter(r => r.key == requestKey)
                    .forEach(r => r.handler(op.result));
                requests = requests.filter(r => r.key != requestKey);
                contentCache[requestKey] = op.result;
            } else if (op.originalSearch) {
                if (searchRequest) {
                    searchRequest(op.result);
                    searchRequest = null;
                }
            }
        }
    });
});

Hooks.on('ready', () => {
    if (game.user.can("FILES_BROWSE")) {
        setTimeout(async () => {
            await Promise.all(roots.map(r => indexContents(r.storage, r.path)));
        }, 250);
    }
});
