import assert from "assert";
import { parseTemplate } from "../src/anglerfish";

describe("Parsing a template hunting for unused class names", () => {
    let fileName = "largely-irrelevant-for-this-test.html";

    it("accepts a template devoid of class names", () => {
        assert.deepEqual(parseTemplate("<div style='font-weight: bold'></div>", fileName), []);
    });

    it("rejects a class name if it isn't also used somewhere", () => {
        assert.deepEqual(parseTemplate("<div class='muffin'></div>", fileName, {
            controllerSource: `
                console.log("Not using the class name here anywhere");
            `,
        }), [{
            message: "Unused class 'muffin'",
            fileName,
            line: 1,
            column: 6,
        }]);
    });
});
