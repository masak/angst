export function lineAndColumn(content, index) {
    let prefix = content.substring(0, index);
    let line = prefix.split(/\n/).length;

    let indexOfLastNewline = prefix.lastIndexOf("\n");
    let column = indexOfLastNewline === -1
        ? prefix.length + 1
        : prefix.length - indexOfLastNewline;

    return [line, column];
}

export function parseTemplate(content, fileName) {
    return [];
}
