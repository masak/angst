import assert from "assert";
import { parseTemplate } from "../src/anglerfish";

describe("Parsing a template looking for broken naming conventions", () => {
    let fileName = "largely-irrelevant-for-this-test.html";

    it("suggests dashes instead of underscores", () => {
        assert.deepEqual(parseTemplate("<div id='foo_bar'></div>", fileName, {
            controllerSource: `
                console.log("$('#foo_bar').hide();");
            `,
        }), [{
            message: "The ID 'foo_bar' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'foo-bar' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div id='foo_bar_baz'></div>", fileName, {
            controllerSource: `
                console.log("$('#foo_bar_baz').hide();");
            `,
        }), [{
            message: "The ID 'foo_bar_baz' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'foo-bar-baz' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
    });
});
