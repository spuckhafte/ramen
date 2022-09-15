import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String,
    id: String,
    reminder: {
        mission: Number,
        report: Number,
        tower: Number,
        adventure: Number,
        daily: Number,
        weekly: Number,
        challenge: Number
    },
    stats: {
        missions: Number,
        reports: Number,
        towers: Number,
        adventures: Number
    },
    extras: {
        hide: Boolean,
        lastCsv: Number,
        lastOnline: Number
    }
});

const User = mongoose.model("user", userSchema);

export default User;