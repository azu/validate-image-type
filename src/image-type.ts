import { fromBuffer } from "file-type";

const imageExts = new Set([
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
    "dcm"
]);

export const imageType = async (buffer: Buffer | Uint8Array | ArrayBuffer) => {
    const ret = await fromBuffer(buffer);
    if (!ret) {
        return null;
    }
    return imageExts.has(ret.ext) ? ret : null;
};
