const {default: mongoose} = required('mongoose');

const categorySchema = mongoose.Schema({
    title : {
        type: String,
        required: true
    }, 
    slug: {
        type: String,
        required: true
    }
})