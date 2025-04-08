# MeshCore.js

A Javascript library for interacting with a [MeshCore](https://github.com/ripplebiz/MeshCore) device running the [Companion Radio Firmware](https://github.com/ripplebiz/MeshCore/blob/main/examples/companion_radio/main.cpp).

This library can be used in a Web Browser to connect to MeshCore Companion devices over BLE or USB Serial.

It can also be used in NodeJS to connect to MeshCore Companion devices over TCP/WiFi or USB Serial.

## Install

```
npm install @liamcottle/meshcore.js
```

## Simple Example

```
import { TCPConnection } from "@liamcottle/meshcore.js";

// create tcp connection
// tcp connections are supported by "Heltec_v3_companion_radio_wifi"
const connection = new TCPConnection("10.1.0.226", 5000);

// wait until connected
connection.on("connected", async () => {

    // we are now connected
    console.log("connected!");

    // log contacts
    const contacts = await connection.getContacts();
    for(const contact of contacts) {
        console.log(`Contact: ${contact.advName}`);
    }

    // disconnect
    connection.close();

});

// connect to meshcore device
await connection.connect();
```

## Examples

There's a few other examples scripts in the [examples](./examples) folder.

## License

MIT
