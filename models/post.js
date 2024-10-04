const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    user: String,
    date: {
        type: Date,
        default: Date.now
    },
    content: String,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
})

module.exports = mongoose.model('post', postSchema)