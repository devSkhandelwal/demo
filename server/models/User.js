const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ['Admin', 'User']
        }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.checkPassword = async function (
    enteredPassword,
    userPassword
) {
    return await bcrypt.compare(enteredPassword, userPassword);
};



module.exports = mongoose.model("User", userSchema);
