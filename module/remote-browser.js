import { moduleId } from './const.js';

let contentCache = {};
let requests = [];

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


Hooks.on('setup', () => {
    socket.on(`module.${moduleId}`, async (op) => {
        if (op.request && game.user.can("FILES_BROWSE")) {
            const result = await FilePicker.browse(op.request.storage, op.request.path);
            socket.emit(`module.${moduleId}`, { 
                result: { dirs: result.dirs, files: result.files, storage: op.request.storage, path: op.request.path },
                originalRequest: op.request
            });
        }
        
        if (op.result && !game.user.can("FILES_BROWSE")) {
            const requestKey = makePathKey(op.originalRequest.storage, op.originalRequest.path);
            requests
                .filter(r => r.key == requestKey)
                .forEach(r => r.handler(op.result));
            requests = requests.filter(r => r.key != requestKey);
            contentCache[requestKey] = op.result;
        }
    })
});
