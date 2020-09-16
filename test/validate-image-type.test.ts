import { validateMIMEType } from "../src/validate-image-type";
import * as path from "path";
import * as assert from "assert";

describe("validate-image-type", function () {
    it("validate valid images", () => {
        const result = validateMIMEType(path.join(__dirname, "fixtures/valid.png"), {
            allowMimeTypes: ["image/png"],
        });
        assert.ok(result.ok);
    });
    it("validate svg images", () => {
        const result = validateMIMEType(path.join(__dirname, "fixtures/valid.svg"), {
            allowMimeTypes: ["image/svg+xml"],
        });
        assert.ok(result.ok);
    });
    it("validate svg images with originalFilename", () => {
        const result = validateMIMEType(path.join(__dirname, "fixtures/svg-but-non-svg-ext"), {
            originalFilename: "test.svg",
            allowMimeTypes: ["image/svg+xml"],
        });
        assert.ok(result.ok);
    });
    it("return an error if the images is invalid", () => {
        const result = validateMIMEType(path.join(__dirname, "fixtures/invalid.png"), {
            allowMimeTypes: ["image/png"],
        });
        assert.strictEqual(result.ok, false);
        assert.strictEqual(result.error?.message, "This buffer is not image");
    });
    it("return an error if the images is not svg", () => {
        const result = validateMIMEType(path.join(__dirname, "fixtures/invalid.svg"), {
            allowMimeTypes: ["image/svg+xml"],
        });
        assert.strictEqual(result.ok, false);
        assert.strictEqual(result.error?.message, "This file is not svg");
    });
    it("return an error when the images is not allowed", () => {
        const result = validateMIMEType(path.join(__dirname, "fixtures/valid.png"), {
            allowMimeTypes: [],
        });
        assert.strictEqual(result.ok, false);
        assert.strictEqual(result.error?.message, "This buffer is disallowed image: image/png");
    });
});
