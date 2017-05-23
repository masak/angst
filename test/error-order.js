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

    it("returns errors ordered by file position", () => {
        let content = deindent(`
            <div id="floof_flaaf">
              <p>
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "The ID 'floof_flaaf' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'floof-flaaf' instead",
            fileName: "largely-irrelevant-for-this-test.html",
            line: 1,
            column: 6,
        }, {
            message: "Unused ID 'floof_flaaf'",
            fileName: "largely-irrelevant-for-this-test.html",
            line: 1,
            column: 6,
        }, {
            message: "Got </div> before the expected </p>",
            hint: "Mismatched opening <p> at line 2, column 3",
            fileName,
            line: 3,
            column: 1,
        }]);
    });
});
