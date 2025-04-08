import SerialConnection from "./serial_connection.js";

class NodeJSSerialConnection extends SerialConnection {

    constructor() {
        super();
    }

    /**
     * Connect to Serial Port at the provided path
     * @param path serial port to connect to, e.g: "/dev/ttyACM0" or "/dev/cu.usbmodem14401"
     * @returns {Promise<void>}
     */
    async connect(path) {

        // note: serialport module is only available in NodeJS, you shouldn't use NodeJSSerialConnection from a web browser
        const { SerialPort } = await import('serialport');

        // create new serial port
        this.serialPort = new SerialPort({
            autoOpen: false, // don't auto open, we want to control this manually
            path: path, // e.g: "/dev/ttyACM0" or "/dev/cu.usbmodem14401"
            baudRate: 115200,
        });

        this.serialPort.on("open", () => {
           this.onConnected();
        });

        this.serialPort.on("close", () => {
            this.onDisconnected();
        });

        this.serialPort.on("error", function(err) {
            console.log("SerialPort Error: ", err.message)
        });

        this.serialPort.on("data", async (data) => {
            await this.onDataReceived(data);
        });

        // open serial connection
        this.serialPort.open();

    }

    async close() {
        try {
            await this.serialPort.close();
        } catch(e) {
            console.log("failed to close serial port, ignoring...", e);
        }
    }

    /* override */ async write(bytes) {
        this.serialPort.write(bytes);
    }

}

export default NodeJSSerialConnection;
