const jwt = require("jsonwebtoken");

const User = require("../models/User");
const catchAsyncHandler = require("../config/catchAsyncHandler");
const AppError = require("../config/appError");

exports.protect = catchAsyncHandler(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        res.status(404);
        return next(new AppError("Please login to get access"));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decode.userId);
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role);
        console.log(roles);
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("You are not allowed to access this route", 400)
            );
        }
        next();
    };
};
