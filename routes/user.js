const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ExpressError = require("../utils/ExpressError");
const dotenv = require("dotenv");
const { response } = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid/v4");
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "198561696099-flasriqkqqlkn2db9ttq6ellso1g6kdn.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const videoStorage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const videoUpload = multer({
  storage: videoStorage,
  // limits: {
  //   fileSize: 10000000, // 10000000 Bytes = 10 MB
  // },
  // fileFilter(req, file, cb) {
  //   // upload only mp4 and mkv format
  //   if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
  //     return cb(new Error("Please upload a video"));
  //   }
  //   cb(undefined, true);
  // },
});

router.post("/uploadVideo", videoUpload.single("video"), (req, res) => {
  // console.log(req.file);
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  // console.log(myFile);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    ACL: "public-read",
    Key: `${uuid()}.${fileType}`,
    Body: req.file.buffer,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    }
    console.log(data.Location);
    res.status(200).send(data.Location);
  });
});

router.get(
  "/register",
  catchAsync(async (req, res) => {
    res.render("user/register");
  })
);

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const oldUser = await User.findOne({ email });
      console.log(oldUser);
      if (oldUser) {
        return next(new ExpressError("User Already Exist", 409));
      }
      const encryptedPassword = await bcrypt.hash(password, 10);
      console.log(encryptedPassword);

      const user = await User.create({
        email,
        password: encryptedPassword,
      });

      res.redirect("/login");
    } catch (e) {
      console.log(e);
      return next(new ExpressError(e));
    }
  })
);

router.get(
  "/login",
  catchAsync(async (req, res) => {
    res.render("user/login");
  })
);

router.post(
  "/login",
  catchAsync(async (req, res, next) => {
    try {
      console.log(req.body);
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY
          );
          // save user token
          user.token = token;
          user.save();
          // console.log(token);
          res.cookie("cookietokenkey", token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600 * 60 * 60 * 24,
          });
          res.redirect("/loginSuccess");
        } else {
          return next(new ExpressError("Invalid Password"));
        }
      } else {
        return next(new ExpressError("User doesnot exist "));
      }
    } catch (e) {
      console.log(e);
      return next(new ExpressError(e));
    }
  })
);

router.post(
  "/googleLogin",
  catchAsync(async (req, res) => {
    let token = req.body.token;
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const userid = payload["sub"];
      console.log(payload);
      const user = await User.findOne({ email: payload.email });
      if (!user) {
        const newUser = await User.create({
          email: payload.email,
          token,
        });
      }
    }
    verify()
      .then(() => {
        res.cookie("cookietokenkey", token, {
          httpOnly: true,
          secure: true,
          // maxAge: 1,
          maxAge: 3600 * 60 * 60 * 24,
        });

        res.send("success");
      })

      .catch(console.error);
    //   res.redirect("chrome:extensions");
  })
);

router.get(
  "/loginSuccess",
  catchAsync(async (req, res) => {
    if (req.cookies["cookietokenkey"]) {
      res.render("user/loginSuccess");
    } else {
      res.redirect("/");
    }
  })
);

router.get("/logout", (req, res) => {
  res.clearCookie("cookietokenkey");
  res.redirect("/");
});

module.exports = router;

// let myFile = req.file.originalname.split(".")
//     const fileType = myFile[myFile.length - 1]

//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `${uuid()}.${fileType}`,
//         Body: req.file.buffer
//     }

//     s3.upload(params, (error, data) => {
//         if(error){
//             res.status(500).send(error)
//         }

//         res.status(200).send(data)
//     })
