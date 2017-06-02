import assert from "assert";
import { lineAndColumn } from "../src/angst";

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

describe("Line and column position", () => {
    it("is correctly deduced from position in the whole string", () => {
        let content = deindent(`
            line 1
            line 2
            line 3
        `);

        assert.deepEqual(lineAndColumn(content, 0), [1, 1]);
        assert.deepEqual(lineAndColumn(content, 4), [1, 5]);
        assert.deepEqual(lineAndColumn(content, 7), [2, 1]);
        assert.deepEqual(lineAndColumn(content, 16), [3, 3]);
    });

    it("correctly points out the first column of some HTML", () => {
        let content = deindent(`
            <div>
              <p>
            </div>
        `);

        assert.deepEqual(lineAndColumn(content, 12), [3, 1]);
    });
});
