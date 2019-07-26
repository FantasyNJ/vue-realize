export function query(el) {
    if (typeof el === 'string') {
        return document.querySelector(el)
    } else {
        return el
    }
}
