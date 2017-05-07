export function lineAndColumn(content, index) {
    let prefix = content.substring(0, index + 1);
    let line = prefix.split(/\n/).length;

    let indexOfLastNewline = prefix.lastIndexOf("\n");
    let column = indexOfLastNewline === -1
        ? prefix.length
        : prefix.length - indexOfLastNewline;

    return `line ${line}, column ${column}`;
}
