import TCPConnection from "../src/connection/tcp_connection.js";

// create tcp connection
const connection = new TCPConnection("10.1.0.226", 5000);

// wait until connected
connection.on("connected", async () => {

    // we are now connected
    console.log(`Connected to: [${connection.host}:${connection.port}]`);

    // log contacts
    const contacts = await connection.getContacts();
    for(const contact of contacts) {
        console.log(`Contact: ${contact.advName}`);
    }

    // send message to public channel
    // await connection.sendChannelTextMessage(0, "test");

    // disconnect
    connection.close();

});

// connect to meshcore device
await connection.connect();
