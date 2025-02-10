class Constants {

    static SerialFrameTypes = {
        Incoming: 0x3e, // ">"
        Outgoing: 0x3c, // "<"
    };

    static CommandCodes = {
        AppStart: 1, // done
        SendTxtMsg: 2,
        SendChannelTxtMsg: 3,
        GetContacts: 4, // done
        GetDeviceTime: 5, // done
        SetDeviceTime: 6, // done
        SendSelfAdvert: 7, // done
        SetAdvertName: 8, // done
        AddUpdateContact: 9,
        SyncNextMessage: 10, // done
        SetRadioParams: 11,
        SetTxPower: 12,
    }

    static ResponseCodes = {
        Ok: 0,
        Err: 1,
        ContactsStart: 2, // done
        Contact: 3, // done
        EndOfContacts: 4, // done
        SelfInfo: 5, // done
        Sent: 6,
        ContactMsgRecv: 7, // done
        ChannelMsgRecv: 8,
        CurrTime: 9, // done
        NoMoreMessages: 10,
    }

    static PushCodes = {
        Advert: 0x80,
        PathUpdated: 0x81,
        SendConfirmed: 0x82,
        MsgWaiting: 0x83,
    }

    static SelfAdvertTypes = {
        ZeroHop: 0,
        Flood: 1,
    }

}

export default Constants;
