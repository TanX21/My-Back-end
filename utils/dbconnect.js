import mongoose from "mongoose";

const dbconnect = async () => {
    try {
       await mongoose.connect(`${process.env.MONGO_URI}`)

        console.log("MongoDb Connected Successfully", mongoose.connection.host);
        

    } catch (error) {
        console.log("MongoDb Connection Failed", error);
        
    }
    
}
export default dbconnect