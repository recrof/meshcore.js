class BufferUtils {

    static areBuffersEqual(byteArray1, byteArray2) {

        // ensure length is the same
        if(byteArray1.length !== byteArray2.length){
            return false;
        }

        // ensure each item is the same
        for(let i = 0; i < byteArray1.length; i++){
            if(byteArray1[i] !== byteArray2[i]){
                return false;
            }
        }

        // arrays are the same
        return true;

    }

}

export default BufferUtils;
