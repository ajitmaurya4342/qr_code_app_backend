const express = require("express");
const router = express.Router();

const login_controller = require("@/controllers/login_controller");
const fileMulter = require("@/controllers/FileMulterController.js");
router.post("/login", login_controller.loginUser);
router.get("/getUserList/:qr_user_id", login_controller.getUserList);
router.get("/getUserList", login_controller.getUserList);
router.post("/addEditUsers", login_controller.addEditUsers);

router.route("/uploadimage").post(fileMulter.uploadImageController);
module.exports = router;
