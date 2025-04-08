import NodeJSSerialConnection from "../src/connection/nodejs_serial_connection.js";

// create serial connection
const connection = new NodeJSSerialConnection("/dev/cu.usbmodem14401");

// wait until connected
connection.on("connected", async () => {

    // we are now connected
    console.log("Connected");

    // find contact
    const contact = await connection.findContactByPublicKeyPrefix([0x93, 0x5c, 0x6b, 0x69]);
    if(!contact){
        console.log("Contact not found");
        return;
    }

    // login to repeater (with empty guest password)
    console.log("Logging in...");
    await connection.login(contact.publicKey, "");

    // get repeater status
    console.log("Fetching status...");
    const status = await connection.getStatus(contact.publicKey);
    console.log(status);

    // disconnect
    await connection.close();

});

// connect to meshcore device
await connection.connect();
