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
    it("accepts an empty template as input", () => {
        assert.deepEqual(parseTemplate("", "x.html"), []);
    });

    it("accepts matching opening and closing tags", () => {
        assert.deepEqual(parseTemplate("<div></div>", "x.html"), []);
        assert.deepEqual(parseTemplate("<div><p></p></div>", "x.html"), []);
    });

    it("rejects a closing tag when it expected another", () => {
        let content = deindent(`
            <div>
              <p>
            </div>
        `);

        assert.deepEqual(parseTemplate(content, "x.html"), [
            { message: "Got </div> before the expected </p>", fileName: "x.html", line: 3, column: 1 },
        ]);
    });

    it("rejects a document that doesn't close all its opened elements", () => {
        let content = deindent(`
            <div>
              <p></p>
        `);

        assert.deepEqual(parseTemplate(content, "x.html"), [
            { message: "Got end of template before the expected </div>", fileName: "x.html", line: 2, column: 10 },
        ]);
    });

    it("rejects a closing tag without an opening tag", () => {
        let content = deindent(`
            </div>
        `);

        assert.deepEqual(parseTemplate(content, "x.html"), [
            { message: "Got </div> without <div>", fileName: "x.html", line: 1, column: 1 },
        ]);
    });

    it("rejects a closing tag without an opening tag, redux", () => {
        let content = deindent(`
            <div>
              </p>
        `);

        assert.deepEqual(parseTemplate(content, "x.html"), [
            { message: "Got </p> before the expected </div>", fileName: "x.html", line: 2, column: 3 },
            { message: "Got </p> without <p>", fileName: "x.html", line: 2, column: 3 },
        ]);
    });
});
