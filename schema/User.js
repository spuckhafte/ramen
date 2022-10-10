import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String,
    id: String,
    reminder: {
        mission: Number,//0
        report: Number,//1
        tower: Number,//2
        train: Number,//3
        adventure: Number,//4
        daily: Number,//5
        vote: Number,//6
        weekly: Number,//7
        challenge: Number,//8
    },
    stats: {
        missions: Number,
        reports: Number,
        towers: Number,
        adventures: Number,
        challenges: Number
    },
    extras: {
        hide: Boolean,
        lastCsv: Number,
        lastOnline: Number,
        lastActiveChannel: String
    },
    weekly: {
        missions: Number,
        reports: Number
    }
});

const User = mongoose.model("user", userSchema);

export default User;