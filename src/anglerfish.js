export function lineAndColumn(content, index) {
    let prefix = content.substring(0, index);
    let line = prefix.split(/\n/).length;
    let column = prefix.length - prefix.lastIndexOf("\n");

    return [line, column];
}

function selfClosing(tagName) {
    return ["br", "hr", "input", "img", "link", "meta"].includes(tagName);
}

function rx(text) {
    return text.replace(/\s*#[^\n]*/g, "").replace(/\s+/g, "");
}

let ATTRIBUTE = rx(`
    \\s+ ([\\w\\-]+)    # attribute name
    (?:                 # attribute value
        (?: =' ([^']*) ' ) |
        (?: =" ([^"]*) " ) |
        (?: =\\{\\{ ((?:(?!\\}\\}).)*) \\}\\} )
    )?
`);

let OPENING_TAG_PATTERN = rx(`
    ^<
    ([\\w\\-]+)         # tag name
    (
        (?: ${ATTRIBUTE} )*
    )
    \\s*
    >
`);

export function parseTemplate(content, fileName, options = {}) {
    let idMentionedInController = {};
    let idRegExp = /#([\w\-]+)/g;

    let idMatch;
    while ((idMatch = idRegExp.exec(options.controllerSource))) {
        let id = idMatch[1];
        idMentionedInController[id] = true;
    }

    let errors = [];

    let pos = 0;
    let tagStack = [];
    let seenId = {};

    function registerError(message, hint = "", customPos = pos) {
        let [line, column] = lineAndColumn(content, customPos);
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
            let [{ length }, tagName, attributes] = openingTagMatch;
            let [line, column] = lineAndColumn(content, pos);
            if (!selfClosing(tagName)) {
                tagStack.push({ expectedTagName: tagName, line, column });
            }
            let tagPrefixMatch = suffix.match(/^<[\w\-]+/);
            let tagPrefixLength = tagPrefixMatch[0].length;
            let attributeRegExp = new RegExp(ATTRIBUTE, "g");
            let attributeMatch;
            while ((attributeMatch = attributeRegExp.exec(attributes))) {
                let [attribute, attributeName, singleQuote, doubleQuote, doubleCurly] = attributeMatch;
                let attributeValue = singleQuote || doubleQuote || doubleCurly || "";
                let attributeOffset = attributeMatch.index + attribute.match(/^\s*/)[0].length;
                let attributePos = pos + tagPrefixLength + attributeOffset;
                if (doubleCurly) {
                    registerError(
                        `Unquoted template expression in attribute value: {{${doubleCurly}}}`,
                        "",
                        attributePos + attributeName.length + 1
                    );
                }

                if (attributeName === "id") {
                    let id = attributeValue;
                    if (seenId.hasOwnProperty(id)) {
                        let { line, column } = seenId[id];
                        let hint = `First occurrence at line ${line}, column ${column}`;
                        registerError(`Duplicate ID '${id}'`, hint, attributePos);
                    } else {
                        let [line, column] = lineAndColumn(content, attributePos);
                        seenId[id] = { line, column };
                        if (!idMentionedInController[id]) {
                            registerError(`Unused ID '${id}'`, "", attributePos);
                        }
                    }
                }
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
