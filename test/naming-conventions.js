import assert from "assert";
import { parseTemplate } from "../src/angst";

describe("Parsing a template looking for broken naming conventions", () => {
    let fileName = "largely-irrelevant-for-this-test.html";

    it("suggests dashes instead of underscores in IDs", () => {
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

    it("suggests initial letter be lower-case in IDs", () => {
        assert.deepEqual(parseTemplate("<div id='Foo'></div>", fileName, {
            controllerSource: `
                console.log("$('#Foo').hide();");
            `,
        }), [{
            message: "The ID 'Foo' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'foo' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div id='Bar-baz'></div>", fileName, {
            controllerSource: `
                console.log("$('#Bar-baz').hide();");
            `,
        }), [{
            message: "The ID 'Bar-baz' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'bar-baz' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
    });

    it("suggests letters after hyphen be lower-case in IDs", () => {
        assert.deepEqual(parseTemplate("<div id='foo-Blub'></div>", fileName, {
            controllerSource: `
                console.log("$('#foo-Blub').hide();");
            `,
        }), [{
            message: "The ID 'foo-Blub' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'foo-blub' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div id='hasz_Grib'></div>", fileName, {
            controllerSource: `
                console.log("$('#hasz_Grib').hide();");
            `,
        }), [{
            message: "The ID 'hasz_Grib' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'hasz-grib' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div id='sib-Sob-Sub'></div>", fileName, {
            controllerSource: `
                console.log("$('#sib-Sob-Sub').hide();");
            `,
        }), [{
            message: "The ID 'sib-Sob-Sub' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'sib-sob-sub' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div id='blebMon'></div>", fileName, {
            controllerSource: `
                console.log("$('#blebMon').hide();");
            `,
        }), [{
            message: "The ID 'blebMon' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'bleb-mon' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div id='feeFieFoe'></div>", fileName, {
            controllerSource: `
                console.log("$('#feeFieFoe').hide();");
            `,
        }), [{
            message: "The ID 'feeFieFoe' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'fee-fie-foe' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
    });

    it("suggests dashes instead of underscores in class names", () => {
        assert.deepEqual(parseTemplate("<div class='foo_bar'></div>", fileName, {
            controllerSource: `
                console.log("$('.foo_bar').hide();");
            `,
        }), [{
            message: "The class 'foo_bar' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'foo-bar' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div class='foo_bar_baz'></div>", fileName, {
            controllerSource: `
                console.log("$('.foo_bar_baz').hide();");
            `,
        }), [{
            message: "The class 'foo_bar_baz' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'foo-bar-baz' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
    });

    it("suggests initial letter be lower-case in class names", () => {
        assert.deepEqual(parseTemplate("<div class='Foo'></div>", fileName, {
            controllerSource: `
                console.log("$('.Foo').hide();");
            `,
        }), [{
            message: "The class 'Foo' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'foo' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div class='Bar-baz'></div>", fileName, {
            controllerSource: `
                console.log("$('.Bar-baz').hide();");
            `,
        }), [{
            message: "The class 'Bar-baz' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'bar-baz' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
    });

    it("suggests letters after hyphen be lower-case in class names", () => {
        assert.deepEqual(parseTemplate("<div class='foo-Blub'></div>", fileName, {
            controllerSource: `
                console.log("$('.foo-Blub').hide();");
            `,
        }), [{
            message: "The class 'foo-Blub' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'foo-blub' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div class='hasz_Grib'></div>", fileName, {
            controllerSource: `
                console.log("$('.hasz_Grib').hide();");
            `,
        }), [{
            message: "The class 'hasz_Grib' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'hasz-grib' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div class='sib-Sob-Sub'></div>", fileName, {
            controllerSource: `
                console.log("$('.sib-Sob-Sub').hide();");
            `,
        }), [{
            message: "The class 'sib-Sob-Sub' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'sib-sob-sub' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div class='blebMon'></div>", fileName, {
            controllerSource: `
                console.log("$('.blebMon').hide();");
            `,
        }), [{
            message: "The class 'blebMon' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'bleb-mon' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
        assert.deepEqual(parseTemplate("<div class='feeFieFoe'></div>", fileName, {
            controllerSource: `
                console.log("$('.feeFieFoe').hide();");
            `,
        }), [{
            message: "The class 'feeFieFoe' does not conform to naming guidelines (all-lowercase, hyphens)",
            hint: "Suggest writing it as 'fee-fie-foe' instead",
            fileName,
            line: 1,
            column: 6,
        }]);
    });

    it("doesn't suggest name change if a thing is used in ambient source", () => {
        assert.deepEqual(parseTemplate("<div id='gleb_hocht'></div>", fileName, {
            ambientSource: `
                console.log("$('#gleb_hocht').hide();");
            `,
        }), []);
        assert.deepEqual(parseTemplate("<div class='bribg_mmuw'></div>", fileName, {
            ambientSource: `
                console.log("$('.bribg_mmuw').hide();");
            `,
        }), []);
    });
});
