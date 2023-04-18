// var mongoose = require('mongoose');
import mongoose from "mongoose";
var Schema = mongoose.Schema;

const sectorsSchema = new Schema({
    
    id :{
        type :  Number,
        unique: true
    },
    name :{
        type :  String,
        required: true,
    },
    created_at :{
        type : Date, 
    },
    updated_at :{
        type :  Date,
    },
});
export default mongoose.models.sectors_dse || mongoose.model('sectors_dse', sectorsSchema);
// export default db.model('idx', idxSchema);