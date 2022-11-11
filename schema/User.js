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
        lastActiveChannel: String,
        xp: Number
    },
    weekly: {
        missions: Number,
        reports: Number
    },
    server_specific_stats: {
        server1: {
            id: String,
            name: String,
            missions: Number,
            reports: Number
        },
        server2: {
            id: String,
            name: String,
            missions: Number,
            reports: Number
        }
    },
    channelOverride: {
        id: String,
        channelName: String,
        serverName: String
    },
});

const User = mongoose.model("user", userSchema);

export default User;