import BufferReader from "./buffer_reader.js";

class Packet {

    // Packet::header values
    static PH_ROUTE_MASK = 0x03;   // 2-bits
    static PH_TYPE_SHIFT = 2;
    static PH_TYPE_MASK = 0x0F;   // 4-bits
    static PH_VER_SHIFT = 6;
    static PH_VER_MASK = 0x03;   // 2-bits

    static ROUTE_TYPE_RESERVED1 = 0x00;    // FUTURE
    static ROUTE_TYPE_FLOOD = 0x01;    // flood mode, needs 'path' to be built up (max 64 bytes)
    static ROUTE_TYPE_DIRECT = 0x02;    // direct route, 'path' is supplied
    static ROUTE_TYPE_RESERVED2 = 0x03;    // FUTURE

    static PAYLOAD_TYPE_REQ = 0x00;    // request (prefixed with dest/src hashes, MAC) (enc data: timestamp, blob)
    static PAYLOAD_TYPE_RESPONSE = 0x01;    // response to REQ or ANON_REQ (prefixed with dest/src hashes, MAC) (enc data: timestamp, blob)
    static PAYLOAD_TYPE_TXT_MSG = 0x02;    // a plain text message (prefixed with dest/src hashes, MAC) (enc data: timestamp, text)
    static PAYLOAD_TYPE_ACK = 0x03;    // a simple ack
    static PAYLOAD_TYPE_ADVERT = 0x04;    // a node advertising its Identity
    static PAYLOAD_TYPE_GRP_TXT = 0x05;    // an (unverified) group text message (prefixed with channel hash, MAC) (enc data: timestamp, "name: msg")
    static PAYLOAD_TYPE_GRP_DATA = 0x06;    // an (unverified) group datagram (prefixed with channel hash, MAC) (enc data: timestamp, blob)
    static PAYLOAD_TYPE_ANON_REQ = 0x07;    // generic request (prefixed with dest_hash, ephemeral pub_key, MAC) (enc data: ...)
    static PAYLOAD_TYPE_PATH = 0x08;    // returned path (prefixed with dest/src hashes, MAC) (enc data: path, extra)
    static PAYLOAD_TYPE_RESERVEDM = 0x0F;    // FUTURE

    constructor(header, path, payload) {


        this.header = header;
        this.path = path;
        this.payload = payload;

        // parsed info
        this.route_type = this.getRouteType();
        this.route_type_string = this.getRouteTypeString();
        this.payload_type = this.getPayloadType();
        this.payload_type_string = this.getPayloadTypeString();
        this.payload_version = this.getPayloadVer();
        this.is_marked_do_not_retransmit = this.isMarkedDoNotRetransmit();

    }

    static fromBytes(bytes) {
        const bufferReader = new BufferReader(bytes);
        const header = bufferReader.readByte();
        const pathLen = bufferReader.readInt8();
        const path = bufferReader.readBytes(pathLen);
        const payload = bufferReader.readRemainingBytes();
        return new Packet(header, path, payload);
    }

    getRouteType() {
        return this.header & Packet.PH_ROUTE_MASK;
    }

    getRouteTypeString() {
        switch(this.getRouteType()){
            case Packet.ROUTE_TYPE_FLOOD: return "ROUTE_TYPE_FLOOD";
            case Packet.ROUTE_TYPE_DIRECT: return "ROUTE_TYPE_DIRECT";
            default: return null;
        }
    }

    isRouteFlood() {
        return this.getRouteType() === Packet.ROUTE_TYPE_FLOOD;
    }

    isRouteDirect() {
        return this.getRouteType() === Packet.ROUTE_TYPE_DIRECT;
    }

    getPayloadType() {
        return (this.header >> Packet.PH_TYPE_SHIFT) & Packet.PH_TYPE_MASK;
    }

    getPayloadTypeString() {
        switch(this.getPayloadType()){
            case Packet.PAYLOAD_TYPE_REQ: return "PAYLOAD_TYPE_REQ";
            case Packet.PAYLOAD_TYPE_RESPONSE: return "PAYLOAD_TYPE_RESPONSE";
            case Packet.PAYLOAD_TYPE_TXT_MSG: return "PAYLOAD_TYPE_TXT_MSG";
            case Packet.PAYLOAD_TYPE_ACK: return "PAYLOAD_TYPE_ACK";
            case Packet.PAYLOAD_TYPE_ADVERT: return "PAYLOAD_TYPE_ADVERT";
            case Packet.PAYLOAD_TYPE_GRP_TXT: return "PAYLOAD_TYPE_GRP_TXT";
            case Packet.PAYLOAD_TYPE_GRP_DATA: return "PAYLOAD_TYPE_GRP_DATA";
            case Packet.PAYLOAD_TYPE_ANON_REQ: return "PAYLOAD_TYPE_ANON_REQ";
            case Packet.PAYLOAD_TYPE_PATH: return "PAYLOAD_TYPE_PATH";
            case Packet.PAYLOAD_TYPE_RESERVEDM: return "PAYLOAD_TYPE_RESERVEDM";
            default: return null;
        }
    }

    getPayloadVer() {
        return (this.header >> Packet.PH_VER_SHIFT) & Packet.PH_VER_MASK;
    }

    markDoNotRetransmit() {
        this.header = 0xFF;
    }

    isMarkedDoNotRetransmit() {
        return this.header === 0xFF;
    }

}

export default Packet;
