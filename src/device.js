import BufferWriter from "./buffer_writer.js";
import BufferReader from "./buffer_reader.js";
import Constants from "./constants.js";

class Device {

    constructor(serialPort) {
        this.serialPort = serialPort;
        this.reader = serialPort.readable.getReader();
        this.writable = serialPort.writable;
        this.readBuffer = [];
        this.readLoop();
    }

    static async fromSerialPort(serialPort) {

        // open port
        await serialPort.open({
            baudRate: 115200,
        });

        return new Device(serialPort);

    }

    async close() {

        // release reader lock
        try {
            this.reader.releaseLock();
        } catch(e) {
            // console.log("failed to release lock on serial port readable, ignoring...", e);
        }

        // close serial port
        try {
            await this.serialPort.close();
        } catch(e) {
            // console.log("failed to close serial port, ignoring...", e);
        }

    }

    async write(bytes) {
        const writer = this.writable.getWriter();
        try {
            await writer.write(new Uint8Array(bytes));
        } finally {
            writer.releaseLock();
        }
    }

    async writeFrame(frameType, frameData) {

        // create frame
        const frame = new BufferWriter();

        // add frame header
        frame.writeByte(frameType);
        frame.writeUInt16LE(frameData.length);

        // add frame data
        frame.writeBytes(frameData);

        // write frame to device
        await this.write(frame.toBytes());

    }

    async sendToRadioFrame(data) {
        // write "app to radio" frame 0x3c "<"
        await this.writeFrame(0x3c, data);
    }

    async sendCommandAppStart() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.AppStart);
        data.writeByte(1); // appVer
        data.writeBytes(new Uint8Array(6)); // reserved
        data.writeString("test"); // appName
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendTxtMsg(txtType, attempt, senderTimestamp, pubKeyPrefix, text) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendTxtMsg);
        data.writeByte(txtType);
        data.writeByte(attempt);
        data.writeUInt32LE(senderTimestamp);
        data.writeBytes(pubKeyPrefix.slice(0, 6)); // only the first 6 bytes of pubKey are sent
        data.writeString(text);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetContacts(since) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetContacts);
        if(since){
            data.writeUInt32LE(since);
        }
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetDeviceTime() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetDeviceTime);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetDeviceTime(epochSecs) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetDeviceTime);
        data.writeUInt32LE(epochSecs);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendSelfAdvert(type) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendSelfAdvert);
        data.writeByte(type);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetAdvertName(name) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetAdvertName);
        data.writeString(name);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandAddUpdateContact(publicKey, type, flags, outPathLen, outPath, advName, lastAdvert, advLat, advLon) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.AddUpdateContact);
        data.writeBytes(publicKey);
        data.writeByte(type);
        data.writeByte(flags);
        data.writeByte(outPathLen);
        data.writeBytes(outPath); // 64 bytes
        data.writeCString(advName, 32); // 32 bytes
        data.writeUInt32LE(lastAdvert);
        data.writeUInt32LE(advLat);
        data.writeUInt32LE(advLon);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSyncNextMessage() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SyncNextMessage);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetRadioParams(radioFreq, radioBw, radioSf, radioCr) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetRadioParams);
        data.writeUInt32LE(radioFreq);
        data.writeUInt32LE(radioBw);
        data.writeByte(radioSf);
        data.writeByte(radioCr);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetTxPower(txPower) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetTxPower);
        data.writeByte(txPower);
        await this.sendToRadioFrame(data.toBytes());
    }

    async readLoop() {
        try {
            while(true){

                // read bytes until reader indicates it's done
                const { value, done } = await this.reader.read();
                if(done){
                    break;
                }

                // append received bytes to read buffer
                this.readBuffer = [
                    ...this.readBuffer,
                    ...value,
                ];

                // process read buffer while there is enough bytes for a frame header
                // 3 bytes frame header = (1 byte frame type) + (2 bytes frame length as unsigned 16-bit little endian)
                const frameHeaderLength = 3;
                while(this.readBuffer.length >= frameHeaderLength){
                    try {

                        // extract frame header
                        const frameHeader = new BufferReader(this.readBuffer.slice(0, frameHeaderLength));

                        // ensure frame type supported
                        const frameType = frameHeader.readByte();
                        if(frameType !== Constants.SerialFrameTypes.Incoming && frameType !== Constants.SerialFrameTypes.Outgoing){
                            // unexpected byte, lets skip it and try again
                            this.readBuffer = this.readBuffer.slice(1);
                            continue;
                        }

                        // ensure frame length valid
                        const frameLength = frameHeader.readUInt16LE();
                        if(!frameLength){
                            // unexpected byte, lets skip it and try again
                            this.readBuffer = this.readBuffer.slice(1);
                            continue;
                        }

                        // check if we have received enough bytes for this frame, otherwise wait until more bytes received
                        const requiredLength = frameHeaderLength + frameLength;
                        if(this.readBuffer.length < requiredLength){
                            break;
                        }

                        // get frame data, and remove it and its frame header from the read buffer
                        const frameData = this.readBuffer.slice(frameHeaderLength, requiredLength);
                        this.readBuffer = this.readBuffer.slice(requiredLength);

                        // handle received frame
                        this.onFrameReceived(frameData);

                    } catch(e) {
                        console.error("Failed to process frame", e);
                        break;
                    }
                }

            }
        } catch(error) {

            // ignore error if reader was released
            if(error instanceof TypeError){
                return;
            }

            console.error('Error reading from serial port: ', error);

        } finally {
            this.reader.releaseLock();
        }
    }

    onFrameReceived(frame) {

        // console.log("onFrameReceived", frame);

        const bufferReader = new BufferReader(frame);
        const responseCode = bufferReader.readByte();

        if(responseCode === Constants.ResponseCodes.SelfInfo){
            this.onSelfInfoResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.CurrTime){
            this.onCurrTimeResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.NoMoreMessages){
            this.onNoMoreMessagesResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactMsgRecv){
            this.onContactMsgRecvResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactsStart){
            this.onContactsStartResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Contact){
            this.onContactResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.EndOfContacts){
            this.onEndOfContactsResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Sent){
            this.onSentResponse(bufferReader);
        } else if(responseCode === Constants.PushCodes.Advert){
            this.onAdvertPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.SendConfirmed){
            this.onSendConfirmedPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.MsgWaiting){
            this.onMsgWaitingPush(bufferReader);
        } else {
            console.log("unhandled frame", frame);
        }

    }

    onAdvertPush(bufferReader) {
        console.log("onAdvertPush", {
            publicKey: bufferReader.readBytes(32),
        });
    }

    onSendConfirmedPush(bufferReader) {
        console.log("onSendConfirmedPush", {
            ackCode: bufferReader.readBytes(4),
            roundTrip: bufferReader.readUInt32LE(),
        });
    }

    onMsgWaitingPush(bufferReader) {
        console.log("onMsgWaitingPush", {

        });
    }

    onContactsStartResponse(bufferReader) {
        console.log("onContactsStartResponse", {
            count: bufferReader.readUInt32LE(),
        });
    }

    onContactResponse(bufferReader) {
        console.log("onContactResponse", {
            publicKey: bufferReader.readBytes(32),
            type: bufferReader.readByte(),
            flags: bufferReader.readByte(),
            outPathLen: bufferReader.readByte(),
            outPath: bufferReader.readBytes(64),
            advName: bufferReader.readCString(32),
            lastAdvert: bufferReader.readUInt32LE(),
            advLat: bufferReader.readUInt32LE(),
            advLon: bufferReader.readUInt32LE(),
            lastMod: bufferReader.readUInt32LE(),
        });
    }

    onEndOfContactsResponse(bufferReader) {
        console.log("onEndOfContactsResponse", {
            mostRecentLastmod: bufferReader.readUInt32LE(),
        });
    }

    onSentResponse(bufferReader) {
        console.log("onSentResponse", {

        });
    }

    onSelfInfoResponse(bufferReader) {
        console.log("onSelfInfoResponse", {
            type: bufferReader.readByte(),
            txPower: bufferReader.readByte(),
            maxTxPower: bufferReader.readByte(),
            publicKey: bufferReader.readBytes(32),
            deviceLoc: bufferReader.readBytes(12),
            radioFreq: bufferReader.readUInt32LE(),
            radioBw: bufferReader.readUInt32LE(),
            radioSf: bufferReader.readByte(),
            radioCr: bufferReader.readByte(),
            name: bufferReader.readString(),
        });
    }

    onCurrTimeResponse(bufferReader) {
        console.log("onCurrTimeResponse", {
            epochSecs: bufferReader.readUInt32LE(),
        });
    }

    onNoMoreMessagesResponse(bufferReader) {
        console.log("onNoMoreMessagesResponse", {

        });
    }

    onContactMsgRecvResponse(bufferReader) {
        console.log("onContactMsgRecvResponse", {
            pubKeyPrefix: bufferReader.readBytes(6),
            pathLen: bufferReader.readByte(),
            txtType: bufferReader.readByte(),
            senderTimestamp: bufferReader.readUInt32LE(),
            text: bufferReader.readString(),
        });
    }

}

export default Device;
