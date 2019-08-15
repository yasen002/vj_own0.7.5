const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ItemSchema = new Schema({
  item:{
    type: String,
    required: true
  },
  bcode:{
    type:Number,
    required: true
  },
  number:{ type : Array ,
           default : [] 
          },
  itemDate:{
    type:Array,
    default : [] 
  },   
  date:{
    type: Date,
    default: Date.now
  }
});

mongoose.model('items', ItemSchema);