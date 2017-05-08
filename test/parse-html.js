import assert from "assert";
import { parseTemplate } from "../src/anglerfish";

describe("Parsing a HTML template", () => {
    it("accepts an empty template as input", () => {
        assert.deepEqual(parseTemplate("", "x.html"), []);
    });
});
