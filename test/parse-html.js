import assert from "assert";
import { parseTemplate } from "../src/anglerfish";

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

describe("Parsing a HTML template", () => {
    let fileName = "largely-irrelevant-for-this-test.html";

    it("accepts an empty template as input", () => {
        assert.deepEqual(parseTemplate("", fileName), []);
    });

    it("accepts matching opening and closing tags", () => {
        assert.deepEqual(parseTemplate("<div></div>", fileName), []);
        assert.deepEqual(parseTemplate("<div><p></p></div>", fileName), []);
    });

    it("rejects a closing tag when it expected another", () => {
        let content = deindent(`
            <div>
              <p>
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Got </div> before the expected </p>",
            hint: "Mismatched opening <p> at line 2, column 3",
            fileName,
            line: 3,
            column: 1,
        }]);
    });

    it("rejects a document that doesn't close all its opened elements", () => {
        let content = deindent(`
            <div>
              <p></p>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Got end of template before the expected </div>",
            hint: "Mismatched opening <div> at line 1, column 1",
            fileName,
            line: 2,
            column: 10,
        }]);
    });

    it("rejects a closing tag without an opening tag", () => {
        let content = deindent(`
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [
            { message: "Got </div> without <div>", fileName, line: 1, column: 1 },
        ]);
    });

    it("rejects a closing tag without an opening tag, redux", () => {
        let content = deindent(`
            <div>
              </p>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Got </p> before the expected </div>",
            hint: "Mismatched opening <div> at line 1, column 1",
            fileName,
            line: 2,
            column: 3,
        }, {
            message: "Got </p> without <p>",
            fileName,
            line: 2,
            column: 3,
        }]);
    });

    it("accepts a directive", () => {
        let content = deindent(`
            <!DOCTYPE html>
        `);

        assert.deepEqual(parseTemplate(content, fileName), []);
    });

    it("accepts a HTML comment", () => {
        assert.deepEqual(parseTemplate("<!-- foo -->", fileName), []);
        assert.deepEqual(parseTemplate(deindent(`
            <div>
              <!-- foo -->
            </div>
        `), fileName), []);
    });

    it("accepts text", () => {
        assert.deepEqual(parseTemplate("this is just some text", fileName), []);
        assert.deepEqual(parseTemplate(deindent(`
            <div>
              So is this.
            </div>
        `), fileName), []);
    });

    it("accepts the '{' character in text", () => {
        assert.deepEqual(parseTemplate("this is just a '{' character in some text", fileName), []);
        assert.deepEqual(parseTemplate(deindent(`
            <div>
              So is '{' this.
            </div>
        `), fileName), []);
    });
});
