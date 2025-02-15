import BufferReader from "./buffer_reader.js";

class Packet {

    constructor(header, path, payload) {
        this.header = header;
        this.path = path;
        this.payload = payload;
    }

    static fromBytes(bytes) {
        const bufferReader = new BufferReader(bytes);
        const header = bufferReader.readByte();
        const pathLen = bufferReader.readInt8();
        const path = bufferReader.readBytes(pathLen);
        const payload = bufferReader.readRemainingBytes();
        return new Packet(header, path, payload);
    }

}

export default Packet;
