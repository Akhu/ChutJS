module.exports = function(mongoose){

var userSchema = new mongoose.Schema({
    username : String,
    status : String,
    mood: String,
    chutCount: Number,
    picture: String,
    connected: Boolean,
    waitingList: [{type: mongoose.Schema.Types.ObjectId, ref : "User"}]
})

//
// var teamSchema = new mongoose.Schema({
//    users : [{type: mongoose.Schema.Types.ObjectId, ref : "User"}]
// })

//var team = mongoose.model('Team', teamSchema);
var user = mongoose.model('User', userSchema);

var models = {

   User : user
}

return models;
}
