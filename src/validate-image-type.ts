import fs from "fs";

import path from "path";
import assert from "assert";
import imageType from "image-type";
import readChunk from "read-chunk";
import isSvg from "is-svg";

export type ValidateImageTypeOptions = {
    /**
     * Allow mime-type lists
     * Example ['image/jpeg', 'image/gif', 'image/png', 'image/svg+xml']
     */
    allowMimeTypes: string[];
};

export type ValidateImageResult = {
    ok: boolean;
    error?: Error;
};

/**
 * Detect the image type of a Buffer or Uint8Array
 * This check is based on https://github.com/sindresorhus/image-type
 */
export function validateBufferMIMEType(
    buffer: Buffer | Uint8Array,
    options: ValidateImageTypeOptions
): ValidateImageResult {
    const mimeTypes = options.allowMimeTypes;
    assert.ok(
        Array.isArray(mimeTypes) && mimeTypes.every((mimeType) => mimeType.includes("/")),
        `Should be set an array of mimeType. e.g.) ['image/jpeg']`
    );
    const result = imageType(buffer);
    if (!result) {
        return {
            ok: false,
            error: new Error("This buffer is not image"),
        };
    }
    const isAllowed = mimeTypes.includes(result.mime);
    if (!isAllowed) {
        return {
            ok: false,
            error: new Error(`This buffer is disallowed image: ${result.mime}`),
        };
    }
    return {
        ok: true,
        error: undefined,
    };
}

/**
 * Detect the image type of a filePath
 * @example
 *
 * ```
 * const validationResult = validateMIMEType("test.png", {
 *     allowMimeTypes: ['image/jpeg', 'image/gif', 'image/png', 'image/svg+xml']
 * });
 * if(validationResult) {
 *   console.error(validationResult)
 * }
 * ```
 */
export function validateMIMEType(filePath: string, options: ValidateImageTypeOptions): ValidateImageResult {
    const mimeTypes = options.allowMimeTypes;
    // Handle SVG as special case
    // https://github.com/sindresorhus/is-svg
    const allowSVG = mimeTypes.includes("image/svg+xml");
    const fileExt = path.extname(filePath);
    if (allowSVG && fileExt === ".svg") {
        const content = fs.readFileSync(filePath, "utf-8");
        if (!isSvg(content)) {
            return {
                ok: false,
                error: new Error(`This file is not svg`),
            };
        }
        return {
            ok: true,
        };
    }
    // Use head buffer for performance reason
    const buffer = readChunk.sync(filePath, 0, 12);
    return validateBufferMIMEType(buffer, options);
}
