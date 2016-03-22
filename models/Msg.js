var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Msg = new Schema(
    {
        to: [Number],
        from: {
            type: Number,
            index: true
        },
        text: String
    }
);