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

    it("accepts a multiline Angular expression", () => {
        assert.deepEqual(parseTemplate(deindent(`
            <div>
              {{ x +
                    y
                * z }}
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


    it("doesn't report other errors on attribute values delimited by {{ }} by not quotes", () => {
        assert.deepEqual(parseTemplate(deindent(`
            <div>
              <span class={{BLAH_BLIH_BLOH[sick.burn].terribleWizard}}></span>
            </div>
        `), fileName), [{
            message: "Unquoted template expression in attribute value: {{BLAH_BLIH_BLOH[sick.burn].terribleWizard}}",
            fileName,
            line: 2,
            column: 15,
        }]);
    });

    it("understands a custom element (with dashes in it)", () => {
        assert.deepEqual(parseTemplate(deindent(`
            <custom-element>
                Here, have some content
            </custom-element>
        `), fileName), []);
    });
});
