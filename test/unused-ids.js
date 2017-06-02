import assert from "assert";
import { parseTemplate } from "../src/angst";

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

    it("accepts the ID if it is used by various means", () => {
        assert.deepEqual(parseTemplate("<div id='blah'></div>", fileName, {
            controllerSource: `
                console.log("$('#blah').hide();");
            `,
        }), []);
        assert.deepEqual(parseTemplate("<div id='blah'></div>", fileName, {
            controllerSource: `
                console.log("getElementById('blah').value;");
            `,
        }), []);
        assert.deepEqual(parseTemplate("<input id='blah'><label for='blah'>yeah</label>", fileName), []);
        assert.deepEqual(parseTemplate("<div id='glurgh'></div>", fileName, {
            ambientSource: `
                console.log("$('#glurgh').hide();");
            `,
        }), []);
        assert.deepEqual(parseTemplate("<div id='glurgh'></div>", fileName, {
            ambientSource: `
                console.log("getElementById('glurgh').value;");
            `,
        }), []);
        assert.deepEqual(parseTemplate("<div id='fnaaafl'></div>", fileName, {
            ambientSource: `
                // this would happen in a test
                by.id('fnaaafl');
            `,
        }), []);
    });
});
