class BufferWriter {

    constructor() {
        this.buffer = [];
    }

    toBytes() {
        return new Uint8Array(this.buffer);
    }

    writeBytes(bytes) {
        this.buffer = [
            ...this.buffer,
            ...bytes,
        ];
    }

    writeByte(byte) {
        this.writeBytes([
            byte,
        ]);
    }

    writeUInt16LE(num) {
        const bytes = new Uint8Array(2);
        const view = new DataView(bytes.buffer);
        view.setUint16(0, num, true);
        this.writeBytes(bytes);
    }

    writeUInt32LE(num) {
        const bytes = new Uint8Array(4);
        const view = new DataView(bytes.buffer);
        view.setUint32(0, num, true);
        this.writeBytes(bytes);
    }

    writeString(string) {
        this.writeBytes(new TextEncoder().encode(string));
    }

}

export default BufferWriter;
