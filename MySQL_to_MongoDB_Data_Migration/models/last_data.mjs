// var mongoose = require('mongoose');
import mongoose from "mongoose";
var Schema = mongoose.Schema;

const lastDataSchema = new Schema({
    companyLastData:{
        type: String,
    },
    circuit_breakerLastData:{
        type: String,
    },
    idxLastData:{
        type: String,
    },
    manLastData:{
        type: String,
    },
    mkistatLastData:{
        type: String,
    },
    sectorsLastData:{
        type: String,
    },
    trdLastData:{      
        type: String,
    },
    peLastData:{
        type: String,
    }

});
export default mongoose.models.lastData || mongoose.model('lastData', lastDataSchema);