export function lastPathComponent(path) {
    const components = path.split('/');
    return components[components.length - 1];
}

export function parentPath(path) {
    const components = path.split('/');
    return components.slice(0, components.length-1).join('/');
}

export function uniqueBy(a, key) {
    let seen = new Set();
    return a.filter(item => {
        let k = key(item);
        return seen.has(k) ? false : seen.add(k);
    });
}
