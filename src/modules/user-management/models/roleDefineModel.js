import mongoose from "mongoose"
const roleDefineSchema = new mongoose.Schema({
  rolename:{
    type:String
  },
  permissions:{
    type: [{
        moduleName: {
        type: String                  
      },
      read: {
        type: Boolean                  
      },
      read_write: {
        type: Boolean
      },
      actions: {
        type: Boolean
      },
    }],
    default: null
  },
  added_by_userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  is_deleted: {
    type: Boolean,
    default: false,
},
 is_deactivated: {
    type: Boolean,
    default: false,
},
deleted_at: {
    type : Date,
    default : null,
},
created_at: { 
    type: Date,
    default: null,
},
updated_at: {
    type: Date,
    default: null,
}
},{new:true})
export default mongoose.model('roleDefineModel', roleDefineSchema);