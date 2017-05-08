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

        assert.deepEqual(lineAndColumn(content, 0), [1, 1]);
        assert.deepEqual(lineAndColumn(content, 4), [1, 5]);
        assert.deepEqual(lineAndColumn(content, 6), [2, 1]);
        assert.deepEqual(lineAndColumn(content, 15), [3, 3]);
    });
});
