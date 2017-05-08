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
    let errors = [];

    let pos = 0;
    let tagStack = [];

    function registerError(message) {
        let [line, column] = lineAndColumn(content, pos);
        errors.push({ message, fileName, line, column });
    }

    while (pos < content.length) {
        let spaceCount = content.substring(pos).match(/^\s*/)[0].length;
        pos += spaceCount;

        if (pos >= content.length) {
            break;
        }

        let suffix = content.substring(pos);
        let openingTagMatch = suffix.match(/<(\w+)>/);
        let closingTagMatch = suffix.match(/<\/(\w+)>/);

        if (openingTagMatch) {
            let [{ length }, tagName] = openingTagMatch;
            tagStack.push(tagName);
            pos += length;
        } else if (closingTagMatch) {
            let [{ length }, tagName] = closingTagMatch;
            let expectedTagName = tagStack.pop();
            while (tagName !== expectedTagName) {
                registerError(`Got </${tagName}> before the expected </${expectedTagName}>`);
                expectedTagName = tagStack.pop();
            }
            pos += length;
        } else {
            throw new Error(`Don't know how to handle "${suffix}"`);
        }
    }

    if (tagStack.length) {
        let expectedTagName = tagStack.pop();
        registerError(`Got end of template before the expected </${expectedTagName}>`);
    }

    return errors;
}
