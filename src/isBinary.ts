export const BINARY_READ_LENGTH = 24;
export const isBinary = (buffer: Buffer): boolean => {
    for (let i = 0; i < BINARY_READ_LENGTH; i++) {
        const characterCode = buffer[i];
        if (characterCode === 65533 || characterCode <= 8) {
            return true;
        }
    }
    return false;
};
