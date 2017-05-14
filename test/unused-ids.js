import assert from "assert";
import { parseTemplate } from "../src/anglerfish";

describe("Parsing a template hunting for unused IDs", () => {
    let fileName = "largely-irrelevant-for-this-test.html";

    it("accepts a template devoid of IDs", () => {
        assert.deepEqual(parseTemplate("<div style='font-weight: bold'></div>", fileName), []);
    });

    it("rejects an ID if it isn't also used somewhere", () => {
        assert.deepEqual(parseTemplate("<div id='blah'></div>", fileName, {
            controllerSource: `
                console.log("Not using the ID here anywhere");
            `,
        }), [{
            message: "Unused ID 'blah'",
            fileName,
            line: 1,
            column: 6,
        }]);
    });
});
