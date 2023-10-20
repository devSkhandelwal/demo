const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const catchAsyncHandler = require("../config/catchAsyncHandler");
const { default: mongoose } = require("mongoose");
const AppError = require("../config/appError");

const signToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};


exports.signIn = catchAsyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email && !password) {
        res.status(400);
        return next(new AppError("Email or password not provided"));
    }

    const user = await User.findOne({
        email,
    }).select("+password");
    if (!user) {
        res.status(404);
        return next(new AppError("User Not found"));
    }


    if (!(await user.checkPassword(password, user.password))) {
        res.status(404);
        return next(new AppError("Password does not match"));
    }


    res.status(200).json({
        token: signToken(user._id),
        user: {
            fullName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email,
            _id: user._id,
        },
    });
});


exports.addUser = catchAsyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
    } = req.body;

    if (!firstName && !email && !password) {
        res.status(400);
        return next(new AppError("Please provide all fields"));
    }

    const user = await User.findOne({ email });
    if (user) {
        res.status(403);
        return next(new AppError("User already exists with this email"));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newObj = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'User',
    };


    const newUser = new User(newObj);

    await newUser.save();

    res.status(200).json({
        status: true,
        message: "User Created Successfully.",
    });
});


const { default: mongoose } = require("mongoose");
const Permission = require("../models/Permission");
const User = require("../models/User");
const catchAsyncHandler = require("../utils/catchAsyncHandler");
const Features = require("../utils/features");

exports.findMe = catchAsyncHandler(async (req, res) => {
    const currentUserEmail = req.user.email;

    const currentUser = await User.aggregate([
        {
            $match: {
                email: currentUserEmail,
            },
        },
        {
            $lookup: {
                from: "permissions",
                localField: "_id",
                foreignField: "userId",
                as: "permissions",
            },
        },
    ]);

    if (!currentUser && !currentUser[0]) {
        res.status(404);
        throw new Error("This user no longer exists");
    }

    res.status(200).json({
        user: {
            fullName: currentUser && currentUser[0].fullName,
            userName: currentUser && currentUser[0].userName,
            briefIntro: currentUser && currentUser[0].briefIntro,
            website: currentUser && currentUser[0].website,
            role: currentUser && currentUser[0].role,
            email: currentUser && currentUser[0].email,
            mobile: currentUser && currentUser[0].mobile,
            status: currentUser && currentUser[0].status,
            _id: currentUser && currentUser[0]._id,
            image: currentUser && currentUser[0].image,
            permissions:
                currentUser &&
                currentUser[0].permissions &&
                currentUser[0].permissions[0],
        },
    });
});

exports.getUser = catchAsyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId);


    const { password, ...rest } = user

    if (!user) {
        res.status(404).json({
            message: "This user not found",
        });
    }
    res.status(200).json({
        user: rest,
    });
});

exports.getUsers = catchAsyncHandler(async (req, res) => {

});

exports.updateUser = catchAsyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
    } = req.body;

    const updateFields = {
        fullName,
        userName,
    };


    const updateUser = await User.findByIdAndUpdate(req.params.id, updateFields, {
        new: true,
        runValidators: true,
    });



    if (!updateUser) {
        res.status(400);
        throw new Error("User not updated");
    }

    res.status(200).json({
        message: "User updated",
    });
});

exports.deleteUser = catchAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    await Permission.findOneAndRemove({ userId: mongoose.Types.ObjectId(id) });

    if (!deletedUser) {
        res.status(401);
        throw new Error("User Not deleted");
    }
    res.status(200).json({
        message: "User deleted",
    });
});
