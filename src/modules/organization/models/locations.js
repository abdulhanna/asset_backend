import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    locationName: {
      type: String,
      required: true,
    },
    address: {
        type: {
            address1: {
              type: String
            },
            address2: {
              type: String
            },
            city: {
              type: String
            },
            state: {
              type: String
            },
            country:{
                type: String
              },
            pinCode: {
              type: String
            },
          },
    },
  },{new:true});


  export default mongoose.model('locations', locationSchema);