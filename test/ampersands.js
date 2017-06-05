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
});
