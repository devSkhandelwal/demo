const express = require("express");

const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/login").post(userController.signIn);



router.use(protect);



// router.route("/findMe").post(userController.findMe);

router.route("/add/user").post(userController.addUser);

router.route("/getUsers").get(userController.getUsers);

router.route("/getUser/:id").get(userController.getUser);

router.route("/delete/user/:id").delete(userController.deleteUser);

router
    .route("/updateUser/:id")
    .patch(upload.single("image"), userController.updateUser);

module.exports = router;
