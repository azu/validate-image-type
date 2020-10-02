import assert from "assert";
import imageType from "image-type";
import readChunk from "read-chunk";
import isSvg from "is-svg";
import * as fs from "fs";
const BINARY_READ_LENGTH = 24;
const isBinary = (buffer: Buffer): boolean => {
    for (let i = 0; i < BINARY_READ_LENGTH; i++) {
        const characterCode = buffer[i];
        if (characterCode === 65533 || characterCode <= 8) {
            return true;
        }
    }
    return false;
};

export type ValidateImageTypeOptions = {
    /**
     * Original file name
     * if the `filePath` is temporary random file path, validator use the `originalFilename` instead of `filePath`
     */
    originalFilename?: string;
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
export function validateBufferMIMEType(buffer: Buffer, options: ValidateImageTypeOptions): ValidateImageResult {
    const mimeTypes = options.allowMimeTypes;
    assert.ok(
        Array.isArray(mimeTypes) && mimeTypes.every((mimeType) => mimeType.includes("/")),
        `Should be set an array of mimeType. e.g.) ['image/jpeg']`
    );
    const imageTypeResult = imageType(buffer);
    if (!imageTypeResult) {
        return {
            ok: false,
            error: new Error(
                `This buffer is not supported image. allowMimeTypes: ${JSON.stringify(mimeTypes)}` +
                    (options.originalFilename ? `, filename: ${options.originalFilename}` : "")
            ),
        };
    }
    const isAllowed = mimeTypes.includes(imageTypeResult.mime);
    if (!isAllowed) {
        return {
            ok: false,
            error: new Error(
                `This buffer is disallowed image MimeType: ${imageTypeResult.mime}, allowMimeTypes: ${JSON.stringify(
                    mimeTypes
                )}` + (options.originalFilename ? `,filename: ${options.originalFilename}` : "")
            ),
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
    // Use head buffer for performance reason
    const buffer = readChunk.sync(filePath, 0, BINARY_READ_LENGTH);
    if (!isBinary(buffer)) {
        const mimeTypes = options.allowMimeTypes;
        // Handle SVG as special case
        // https://github.com/sindresorhus/is-svg
        const allowSVG = mimeTypes.includes("image/svg+xml");
        if (allowSVG) {
            // if the content is not binary, read all content and check it
            // Note: Require 128 bytes at least one
            const content = fs.readFileSync(filePath, "utf-8");
            if (!isSvg(content)) {
                return {
                    ok: false,
                    error: new Error(
                        `This file is not svg. allowMimeTypes: ${JSON.stringify(mimeTypes)}` +
                            (options.originalFilename ? `, filename: ${options.originalFilename}` : "")
                    ),
                };
            }
            return {
                ok: true,
            };
        }
    }
    return validateBufferMIMEType(buffer, options);
}
