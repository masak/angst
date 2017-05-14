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

describe("Parsing an Angular template", () => {
    let fileName = "largely-irrelevant-for-this-test.html";

    it("accepts an Angular expression", () => {
        assert.deepEqual(parseTemplate("{{ x }}", fileName), []);
        assert.deepEqual(parseTemplate(deindent(`
            <div>
              {{x + y * z}}
            </div>
        `), fileName), []);
    });

    it("rejects an attribute value delimited by {{ }} but not quotes", () => {
        assert.deepEqual(parseTemplate(deindent(`
            <div>
              <input value={{x}}>
            </div>
        `), fileName), [{
            message: "Unquoted template expression in attribute value: {{x}}",
            fileName,
            line: 2,
            column: 16,
        }]);
    });
});
