class Constants {

    static SerialFrameTypes = {
        Incoming: 0x3e, // ">"
        Outgoing: 0x3c, // "<"
    };

    static CommandCodes = {
        AppStart: 1, // done
        SendTxtMsg: 2, // done
        SendChannelTxtMsg: 3,
        GetContacts: 4, // done
        GetDeviceTime: 5, // done
        SetDeviceTime: 6, // done
        SendSelfAdvert: 7, // done
        SetAdvertName: 8, // done
        AddUpdateContact: 9, // done
        SyncNextMessage: 10, // done
        SetRadioParams: 11, // done
        SetTxPower: 12, // done
        SetAdvertLatLon: 14, // done
        RemoveContact: 15, // done
    }

    static ResponseCodes = {
        Ok: 0,
        Err: 1,
        ContactsStart: 2, // done
        Contact: 3, // done
        EndOfContacts: 4, // done
        SelfInfo: 5, // done
        Sent: 6, // done
        ContactMsgRecv: 7, // done
        ChannelMsgRecv: 8,
        CurrTime: 9, // done
        NoMoreMessages: 10, // done
    }

    static PushCodes = {
        Advert: 0x80, // done
        PathUpdated: 0x81,
        SendConfirmed: 0x82, // done
        MsgWaiting: 0x83, // done
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
