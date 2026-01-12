import moongoose from 'mongoose';

const userSchema = new moongoose.Schema({

    username:{
        type: String,
        unique:true,
        saparse:true, // Allows null/undefined   values while enforcing uniqueness   
    },
    fullname:{
        type:String,
        required:true,

    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minLength:8,
    },
    verifyOtp:{
        type:String,
        default:'',
    },
    verifyOtpExpiry:{
        type:Number,
        default:0,

    },
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
    resetOtp:{
        type:String,
        default:'',
    },
    reSetOtpExpireAT: {
      type: Number,
      default: 0,
    },


},
{
    timestamps: true,
  }
);

 const User = moongoose.model('User', userSchema);

 export default User;

