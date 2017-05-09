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

    function registerError(message, /* optional */ hint) {
        let [line, column] = lineAndColumn(content, pos);
        errors.push(hint
            ? { message, fileName, line, column, hint }
            : { message, fileName, line, column });
    }

    while (pos < content.length) {
        let suffix = content.substring(pos);
        let whitespaceMatch = suffix.match(/^\s+/);
        let directiveMatch = suffix.match(/^<!\w+\s(?:[^>]*)>/);
        let openingTagMatch = suffix.match(/^<(\w+)>/);
        let closingTagMatch = suffix.match(/^<\/(\w+)>/);
        let commentMatch = suffix.match(/^<!--(?:(?!-->).)*-->/);
        let textMatch = suffix.match(/^(?:(?!<)(?!\{\{).)+/);
        let angularExpressionMatch = suffix.match(/^\{\{((?:(?!\}\}).)*)\}\}/);

        if (whitespaceMatch) {
            let [{ length }] = whitespaceMatch;
            pos += length;
        } else if (directiveMatch) {
            let [{ length }] = directiveMatch;
            pos += length;
        } else if (openingTagMatch) {
            let [{ length }, tagName] = openingTagMatch;
            let [line, column] = lineAndColumn(content, pos);
            tagStack.push({ expectedTagName: tagName, line, column });
            pos += length;
        } else if (closingTagMatch) {
            let [{ length }, tagName] = closingTagMatch;
            if (!tagStack.length) {
                registerError(`Got </${tagName}> without <${tagName}>`);
            } else {
                let { expectedTagName, line, column } = tagStack.pop();
                while (tagName !== expectedTagName) {
                    let hint = `Mismatched opening <${expectedTagName}> at line ${line}, column ${column}`;
                    registerError(`Got </${tagName}> before the expected </${expectedTagName}>`, hint);
                    if (!tagStack.length) {
                        registerError(`Got </${tagName}> without <${tagName}>`);
                        break;
                    } else {
                        ({ expectedTagName, line, column } = tagStack.pop());
                    }
                }
            }
            pos += length;
        } else if (commentMatch) {
            let [{ length }] = commentMatch;
            pos += length;
        } else if (textMatch) {
            let [{ length }] = textMatch;
            pos += length;
        } else if (angularExpressionMatch) {
            let [{ length }] = angularExpressionMatch;
            pos += length;
        } else {
            let unknown = suffix.substring(0, 15).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
            let [line, column] = lineAndColumn(content, pos);
            let message = `Unknown thing "${unknown}"` + "\n" +
                `Don't know how to proceed at line ${line}, column ${column} of file ${fileName}`;
            throw new Error(message);
        }
    }

    if (tagStack.length) {
        let { expectedTagName, line, column } = tagStack.pop();
        let hint = `Mismatched opening <${expectedTagName}> at line ${line}, column ${column}`;
        registerError(`Got end of template before the expected </${expectedTagName}>`, hint);
    }

    return errors;
}
