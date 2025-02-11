import BufferWriter from "../buffer_writer.js";
import BufferReader from "../buffer_reader.js";
import Constants from "../constants.js";
import Connection from "./connection.js";

class SerialConnection extends Connection {

    constructor(serialPort) {

        super();

        this.serialPort = serialPort;
        this.reader = serialPort.readable.getReader();
        this.writable = serialPort.writable;
        this.readBuffer = [];
        this.readLoop();

        // listen for disconnect
        this.serialPort.addEventListener("disconnect", () => {
            this.emit("disconnected");
        });

        // fire connected callback after constructor has returned
        setTimeout(() => {
            this.onConnected();
        }, 0);

    }

    static async open() {

        // ensure browser supports web serial
        if(!navigator.serial){
            alert("Web Serial is not supported in this browser");
            return null;
        }

        // ask user to select device
        const serialPort = await navigator.serial.requestPort({
            filters: [],
        });

        // open port
        await serialPort.open({
            baudRate: 115200,
        });

        return new SerialConnection(serialPort);

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
        this.emit("tx", data);
        await this.writeFrame(0x3c, data);
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

}

export default SerialConnection;
