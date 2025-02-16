class Constants {

    static SerialFrameTypes = {
        Incoming: 0x3e, // ">"
        Outgoing: 0x3c, // "<"
    }

    static Ble = {
        ServiceUuid: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
        CharacteristicUuidRx: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
        CharacteristicUuidTx: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
    }

    static CommandCodes = {
        AppStart: 1,
        SendTxtMsg: 2,
        SendChannelTxtMsg: 3,
        GetContacts: 4,
        GetDeviceTime: 5,
        SetDeviceTime: 6,
        SendSelfAdvert: 7,
        SetAdvertName: 8,
        AddUpdateContact: 9,
        SyncNextMessage: 10,
        SetRadioParams: 11,
        SetTxPower: 12,
        ResetPath: 13,
        SetAdvertLatLon: 14,
        RemoveContact: 15,
        ShareContact: 16,
        ExportContact: 17,
        ImportContact: 18,
        Reboot: 19,
        GetBatteryVoltage: 20,
    }

    static ResponseCodes = {
        Ok: 0, // todo
        Err: 1, // todo
        ContactsStart: 2,
        Contact: 3,
        EndOfContacts: 4,
        SelfInfo: 5,
        Sent: 6,
        ContactMsgRecv: 7,
        ChannelMsgRecv: 8,
        CurrTime: 9,
        NoMoreMessages: 10,
        ExportContact: 11,
        BatteryVoltage: 12,
    }

    static PushCodes = {
        Advert: 0x80,
        PathUpdated: 0x81,
        SendConfirmed: 0x82,
        MsgWaiting: 0x83,
    }

    static AdvType = {
        None: 0,
        Chat: 1,
        Repeater: 2,
        Room: 3,
    }

    static SelfAdvertTypes = {
        ZeroHop: 0,
        Flood: 1,
    }

    static TxtTypes = {
        Plain: 0,
        CliData: 1,
        SignedPlain: 2,
    }

}

export default Constants;
