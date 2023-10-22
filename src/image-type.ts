const supportedImageTypes = [
    "jpg",
    "png",
    "gif",
    "webp",
    "flif",
    "cr2",
    "tif",
    "bmp",
    "jxr",
    "psd",
    "ico",
    "bpg",
    "jp2",
    "jpm",
    "jpx",
    "heic",
    "cur",
    "dcm",
    "avif"
];
export type SupportedImageTypes = (typeof supportedImageTypes)[number];
const imageExts = new Set(supportedImageTypes);

export const imageType = async (buffer: Buffer | Uint8Array | ArrayBuffer): Promise<SupportedImageTypes | null> => {
    const { fileTypeFromBuffer } = await import("file-type");
    const ret = await fileTypeFromBuffer(buffer);
    if (!ret) {
        return null;
    }
    return imageExts.has(ret.ext) ? ret.mime : null;
};
