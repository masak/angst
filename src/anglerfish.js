export function lineAndColumn(content, index) {
    let prefix = content.substring(0, index);
    let line = prefix.split(/\n/).length;
    let column = prefix.length - prefix.lastIndexOf("\n");

    return [line, column];
}

function selfClosing(tagName) {
    return ["br", "hr", "input", "img", "link", "meta"].includes(tagName);
}

let OPENING_TAG_PATTERN = `
    ^<
    ([\\w\\-]+)         # tag name
    (?:                 # attributes (zero or more)
        \\s+ [\\w\\-]+  # attribute name
        (?:             # attribute value
            (?: =" [^"]* " ) |
            (?: =' [^']* ' )
        )?
    )*
    \\s*
    >
`.replace(/\s*#[^\n]*/g, "").replace(/\s+/g, "");

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
        let commentMatch = suffix.match(/^<!--(?:(?!-->).)*-->/);
        let textMatch = suffix.match(/^(?:(?!<)(?!\{\{).)+/);
        let angularExpressionMatch = suffix.match(/^\{\{((?:(?!\}\}).)*)\}\}/);
        let skipMatch = whitespaceMatch || directiveMatch || commentMatch || textMatch || angularExpressionMatch;

        let openingTagMatch = suffix.match(new RegExp(OPENING_TAG_PATTERN));
        let closingTagMatch = suffix.match(/^<\/(\w+)>/);

        if (skipMatch) {
            let [{ length }] = skipMatch;
            pos += length;
        } else if (openingTagMatch) {
            let [{ length }, tagName] = openingTagMatch;
            let [line, column] = lineAndColumn(content, pos);
            if (!selfClosing(tagName)) {
                tagStack.push({ expectedTagName: tagName, line, column });
            }
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
