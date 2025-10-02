export const resError= (status=400,message)=>{
    return {
        "success":false,
        "message":message,
        "status":status
    }
}