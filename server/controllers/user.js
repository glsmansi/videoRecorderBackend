const User = require("../models/User");
const UserVideo = require("../models/UserVideo");
const Video = require("../models/Video");
const ExpressError = require("../../utils/ExpressError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const sequelize = require("sequelize");

// Video.belongsTo(User, {
//   as: "videos",
//   foreignKey: "userEmail",
// });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "198561696099-flasriqkqqlkn2db9ttq6ellso1g6kdn.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

module.exports.home = async (req, res) => {
  res.render("home");
};

module.exports.uploadVideo = async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    // console.log(myFile);
    const fileName = `${Date.now()}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: "public-read",
      Key: `${Date.now()}.${fileType}`,
      Body: req.file.buffer,
    };
    console.log(myFile);

    s3.upload(params, async (error, data) => {
      if (error) {
        res.status(500).json(error);
      }
      // console.log(params[Key]);

      const videoLink = await Video.create({
        fileName: fileName,
        url: data.Location,
        userEmail: req.user.email,
      });
      await videoLink.save();

      const userVideo = await UserVideo.create({
        userEmail: req.user.email,
        videoId: videoLink.id,
      });
      console.log(req.user.email);

      console.log(userVideo);
      console.log(videoLink);
      res.status(200).json(`localhost:5000/${videoLink.id}/watch`);
    });
  } catch (e) {
    return new ExpressError(e);
  }
};

module.exports.getRegister = async (req, res) => {
  res.render("user/register");
};

module.exports.postRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const oldUser = await User.findOne({ where: { email: email } });
    console.log(oldUser);
    if (oldUser) {
      return next(new ExpressError("User Already Exist", 409));
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(encryptedPassword);

    const user = await User.create({
      username,
      email,
      password: encryptedPassword,
      loginType: "login",
    });

    res.redirect("/login");
  } catch (e) {
    console.log(e);
    return next(new ExpressError(e));
  }
};

module.exports.getLogin = async (req, res) => {
  res.render("user/login");
};

module.exports.postLogin = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      console.log(user);

      if (match) {
        const token = jwt.sign(
          { user_id: user.id, email },
          process.env.TOKEN_KEY
        );
        // save user token
        user.token = token;

        user.save();
        console.log(token);
        res.cookie("cookietokenkey", token, {
          httpOnly: false,
          secure: true,
          maxAge: 3600 * 60 * 60 * 24,
        });
        res.redirect("/home");
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
};

module.exports.googleLogin = async (req, res) => {
  let token = req.body.token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    console.log(payload);
    const user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      const newUser = await User.create({
        email: payload.email,
        token,
        loginType: "googleLogin",
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
};

module.exports.settings = async (req, res) => {
  const user = await User.findOne({ where: { email: req.user.email } });
  res.render("user/setting", { user });
};

module.exports.loginSuccess = async (req, res) => {
  if (req.cookies["cookietokenkey"]) {
    res.render("user/myVideo");
  } else {
    res.redirect("/login");
  }
};

// module.exports.getSharedWithMe = async (req, res) => {
//   // res.render("users/sharedWithMe")
// };
module.exports.sharedWithMe = async (req, res) => {
  const userEmail = req.user.email;
  const user = await User.findOne({ where: { email: userEmail } });
  const userVideos = await UserVideo.findAll({
    where: { userEmail: user.email },
  });
  const uservideos = await Video.findAll({
    where: {
      userEmail: {
        [sequelize.Op.not]: userVideos.email,
      },
    },
  });
  res.render("user/me", { uservideos });
};

module.exports.sharedWithOthers = async (req, res) => {
  const userEmail = req.user.email;
  const user = await User.findOne({ where: { email: userEmail } });
  console.log(user);
  const userVideos = await UserVideo.findAll({
    where: { userEmail: user.email },
  });
  console.log(userVideos);
  const videos = await Video.findAll({
    where: { userEmail: userEmail },
  });

  res.render("user/team", { videos, user });
};

module.exports.personal = async (req, res) => {
  const userEmail = req.user.email;
  const user = await User.findOne({ where: { email: userEmail } });
  const uservideos = await Video.findAll({
    where: { userEmail: user.email },
  });

  res.render("user/myVideo", { uservideos });
};

module.exports.userVideoLink = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const video = await Video.findOne({ where: { id: id } });
  res.render("user/video", { video, user });
};

module.exports.download = async (req, res) => {
  const email = req.user.email;
  const videoLink = await Video.findOne({
    where: { userEmail: email },
    order: [["id", "DESC"]],
  });
  console.log(videoLink);
  res.json(videoLink.url);
};

module.exports.logout = (req, res) => {
  res.clearCookie("cookietokenkey");
  res.redirect("/");
};
