import {ed25519} from "@noble/curves/ed25519";
import BufferReader from "./buffer_reader.js";
import BufferWriter from "./buffer_writer.js";
import Packet from "./packet.js";

class Advert {

    constructor(publicKey, timestamp, signature, appData) {
        this.publicKey = publicKey;
        this.timestamp = timestamp;
        this.signature = signature;
        this.appData = appData;
    }

    isVerified() {

        // build signed data
        const bufferWriter = new BufferWriter();
        bufferWriter.writeBytes(this.publicKey);
        bufferWriter.writeUInt32LE(this.timestamp);
        bufferWriter.writeBytes(this.appData);

        // verify signature
        return ed25519.verify(this.signature, bufferWriter.toBytes(), this.publicKey);

    }

    static fromPacketBytes(bytes) {

        // parse packet from bytes
        const packet = Packet.fromBytes(bytes);

        // read packet payload
        const bufferReader = new BufferReader(packet.payload);
        const publicKey = bufferReader.readBytes(32);
        const timestamp = bufferReader.readUInt32LE();
        const signature = bufferReader.readBytes(64);
        const appData = bufferReader.readRemainingBytes();

        return new Advert(publicKey, timestamp, signature, appData);

    }

}

export default Advert;
