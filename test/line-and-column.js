import assert from "assert";
import { lineAndColumn } from "../src/anglerfish";

describe("Line and column position", () => {
    it("is correctly deduced from position in the whole string", () => {
        function deindent(string) {
            return string.trim().split("\n").map((line) => line.trim()).join("\n");
        }

        let content = deindent(`
            line 1
            line 2
            line 3
        `);

        assert.equal(lineAndColumn(content, 0), "line 1, column 1");
        assert.equal(lineAndColumn(content, 4), "line 1, column 5");
        assert.equal(lineAndColumn(content, 6), "line 2, column 1");
        assert.equal(lineAndColumn(content, 15), "line 3, column 3");
    });
});
