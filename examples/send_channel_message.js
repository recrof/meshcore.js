import TCPConnection from "../src/connection/tcp_connection.js";
import NodeJSSerialConnection from "../src/connection/nodejs_serial_connection.js";

// create connection
// const connection = new TCPConnection("10.1.0.226", 5000);
const connection = new NodeJSSerialConnection("/dev/cu.usbmodem14401");

// wait until connected
connection.on("connected", async () => {

    // we are now connected
    console.log("Connected");

    // update clock on meshcore device
    await connection.syncDeviceTime();

    // send message to channel 0
    console.log("Sending message...");
    await connection.sendChannelTextMessage(0, "Hello from MeshCore.js");

    // disconnect
    await connection.close();

});

// connect to meshcore device
await connection.connect();
