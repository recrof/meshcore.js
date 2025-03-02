import { ed25519 } from "@noble/curves/ed25519";
import BufferReader from "./buffer_reader.js";
import Packet from "./packet.js";

class Advert {

    constructor(publicKey, timestamp, signature, appData) {
        this.publicKey = publicKey;
        this.timestamp = timestamp;
        this.signature = signature;
        this.appData = appData;
    }

    getTimestamp() {
        return (new BufferReader(this.timestamp)).readUInt32LE();
    }

    isVerified() {
        return ed25519.verify(this.signature, Buffer.concat([
            this.publicKey,
            this.timestamp,
            this.appData,
        ]), this.publicKey);
    }

    static fromPacketBytes(bytes) {

        // parse packet from bytes
        const packet = Packet.fromBytes(bytes);

        // read packet payload
        const bufferedReader = new BufferReader(packet.payload);
        const publicKey = bufferedReader.readBytes(32);
        const timestamp = bufferedReader.readBytes(4); // read as bytes for signature
        const signature = bufferedReader.readBytes(64);
        const appData = bufferedReader.readRemainingBytes();

        return new Advert(publicKey, timestamp, signature, appData);

    }

}

export default Advert;
