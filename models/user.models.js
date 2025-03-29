import mongoose, {Schema} from "mongoose";
// import { type } from "os";

const userSchema = new Schema (
    {   
      profilePictureUrl: {
            type: String,
            required: true,
        },
        username:{
            type:String,
            unique: true,
            required: true,
            trim: true,
            min:[3, "Min Should Be of 3 Char"],
            max:[32, "Max Should Be of 32 Char"],
        },
        email:{
            type:String,
            unique: true,
            required: true,
            trim: true,
        },
        password:{
            type:String,
            required: true,
            trim: true,
            select:false,
            min:[6, "Min Should Be of 6 Char"],

        },
        favorites: {
            type: [Schema.Types.ObjectId],
            ref: 'Book', // Reference to a Book model, assuming you have a Book schema to track books
          },
          otp:{
            type: String,
            // length: 6,
            select: false,
          },
          otpExpiry:{
            type: Date,
            select: false,
          },
          isVerified:{
            type: Boolean,
            default: false,
          },
          role: {
            type: String,
            enum: ['user', 'admin'],  // Admin or User role
            default: 'user',  // Default role is 'user'
        },
    },

    {timestamps: true}
    
);

const user = mongoose.model("user", userSchema );

export default user;