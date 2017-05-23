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

describe("Parsing malformed comments", () => {
    let fileName = "largely-irrelevant-for-this-test.html";

    it("rejects an HTML comment opener without a closer", () => {
        let content = deindent(`
            <div>
              <!--p>
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Mismatched HTML comment opener (`<!--`)",
            fileName,
            line: 2,
            column: 3,
        }]);
    });

    it("rejects an HTML comment closer without an opener", () => {
        let content = deindent(`
            <div>
              Well this was random: -->
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Mismatched HTML comment closer (`-->`)",
            fileName,
            line: 2,
            column: 25,
        }]);
    });

    it("rejects an HTML comment closer accidentally left in a closing tag", () => {
        let content = deindent(`
            <div>
              <p>Text, as if everything is still OK</p-->
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "Mismatched HTML comment closer in closing tag ('</p -->')",
            fileName,
            line: 2,
            column: 43,
        }]);
    });

    it("rejects an HTML comment opener inside an HTML comment", () => {
        let content = deindent(`
            <div>
              <!-- Look, a comment opener: <!-- oops, that wasn't good -->
            </div>
        `);

        assert.deepEqual(parseTemplate(content, fileName), [{
            message: "HTML comment opener (`<!--`) inside HTML comment",
            fileName,
            line: 2,
            column: 32,
        }]);
    });
});
