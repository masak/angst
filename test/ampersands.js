import assert from "assert";
import { parseTemplate } from "../src/angst";

function deindent(string) {
    string = string.replace(/^\n+/, "").replace(/\s+$/, "");
    let firstLineIndent = string.match(/[ ]*/)[0].length;
    return string.split(/\n/).map((line) => {
        let indent = line.match(/[ ]*/)[0].length;
        if (indent < firstLineIndent) {
            throw new Error("Subsequent line is indented less than first line");
        }
        return line.substring(firstLineIndent);
    }).join("\n");
}

describe("Parsing HTML with bare ampersands", () => {
    let fileName = "largely-irrelevant-for-this-test.html";

    it("flags up a bare ampersand in text", () => {
        let content = deindent(`
            <div>
              Punch & Judy
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Got bare ampersand ('&') in text",
            hint: "Need to escape ampersands as '&amp;'",
            fileName,
            line: 2,
            column: 9,
        }]);
    });

    it("does not flag up an ampersand that has already been escaped", () => {
        let content = deindent(`
            <div>
              Pepsi &amp; Mentos
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), []);
    });

    it("reports several bare ampersands if there are many", () => {
        let content = deindent(`
            <div>
              Mac & Cheese
              Not this one: &amp; because it is escaped
              Bonnie & Clyde
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Got bare ampersand ('&') in text",
            hint: "Need to escape ampersands as '&amp;'",
            fileName,
            line: 2,
            column: 7,
        }, {
            message: "Got bare ampersand ('&') in text",
            hint: "Need to escape ampersands as '&amp;'",
            fileName,
            line: 4,
            column: 10,
        }]);
    });

    it("flags up a bare ampersand in an attribute", () => {
        let content = deindent(`
            <div onclick="1 & 2">
              Not necessarily great code, but a definitely still valid HTML.
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Got bare ampersand ('&') in attribute value",
            hint: "Need to escape ampersands as '&amp;'",
            fileName,
            line: 1,
            column: 17,
        }]);
    });

    it("does not flag up an ampersand that has already been escaped in an attribute", () => {
        let content = deindent(`
            <div onclick="3 &amp; 4">
              Go on, sue me. Do it. I'm waiting.
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), []);
    });

    it("reports several bare ampersands if there are many", () => {
        let content = deindent(`
            <div onclick="5 & 6; 7 &amp; 8; 9 & 10">
              I regret nothing. Least of all my 'onclick' attributes.
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Got bare ampersand ('&') in attribute value",
            hint: "Need to escape ampersands as '&amp;'",
            fileName,
            line: 1,
            column: 17,
        }, {
            message: "Got bare ampersand ('&') in attribute value",
            hint: "Need to escape ampersands as '&amp;'",
            fileName,
            line: 1,
            column: 35,
        }]);
    });
});
