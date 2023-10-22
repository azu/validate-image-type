import assert from "assert";
import * as fs from "fs/promises";
import { imageType } from "./image-type";
import { BINARY_READ_LENGTH, isBinary } from "./isBinary";

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
 * Detect the image type of Buffer or Uint8Array
 * This check is based on https://github.com/sindresorhus/image-type
 */
export async function validateBufferMIMEType(
    buffer: Buffer,
    options: ValidateImageTypeOptions
): Promise<ValidateImageResult> {
    const mimeTypes = options.allowMimeTypes;
    assert.ok(
        Array.isArray(mimeTypes) && mimeTypes.every((mimeType) => mimeType.includes("/")),
        `Should be set an array of mimeType. e.g.) ['image/jpeg']`
    );
    const allowSVG = mimeTypes.includes("image/svg+xml");
    if (allowSVG) {
        const { default: isSvg } = await import("is-svg");
        if (isSvg(String(buffer))) {
            return {
                ok: true,
                error: undefined
            };
        }
    }
    const imageTypeMime = await imageType(buffer);
    if (!imageTypeMime) {
        return {
            ok: false,
            error: new Error(
                `This buffer is not supported image. allowMimeTypes: ${JSON.stringify(mimeTypes)}` +
                    (options.originalFilename ? `, filename: ${options.originalFilename}` : "")
            )
        };
    }
    const isAllowed = mimeTypes.includes(imageTypeMime);
    if (!isAllowed) {
        return {
            ok: false,
            error: new Error(
                `This buffer is disallowed image MimeType: ${imageTypeMime}, allowMimeTypes: ${JSON.stringify(
                    mimeTypes
                )}` + (options.originalFilename ? `,filename: ${options.originalFilename}` : "")
            )
        };
    }
    return {
        ok: true,
        error: undefined
    };
}

/**
 * Detect the image type of filePath
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
export async function validateMIMEType(
    filePath: string,
    options: ValidateImageTypeOptions
): Promise<ValidateImageResult> {
    const { readChunk } = await import("read-chunk");
    // Use head buffer for performance reason
    const buffer = await readChunk(filePath, {
        startPosition: 0,
        length: BINARY_READ_LENGTH
    });
    if (!isBinary(buffer)) {
        const mimeTypes = options.allowMimeTypes;
        // Handle SVG as special case
        // https://github.com/sindresorhus/is-svg
        const allowSVG = mimeTypes.includes("image/svg+xml");
        if (allowSVG) {
            const { default: isSvg } = await import("is-svg");
            // if the content is not binary, read all content and check it
            // Note: Require 128 bytes at least one
            const content = await fs.readFile(filePath, "utf-8");
            if (!isSvg(content)) {
                return {
                    ok: false,
                    error: new Error(
                        `This file is not svg. allowMimeTypes: ${JSON.stringify(mimeTypes)}` +
                            (options.originalFilename ? `, filename: ${options.originalFilename}` : "")
                    )
                };
            }
            return {
                ok: true
            };
        }
    }
    return validateBufferMIMEType(buffer, options);
}
