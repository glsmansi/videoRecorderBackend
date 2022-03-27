const User = require("../models/User");
const UserVideo = require("../models/UserVideo");
const ExpressError = require("../utils/ExpressError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

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
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: "public-read",
      Key: `${uuid()}.${fileType}`,
      Body: req.file.buffer,
    };
    console.log(myFile);

    s3.upload(params, async (error, data) => {
      if (error) {
        res.status(500).json(error);
      }
      // console.log(req.user);

      const videoLink = await UserVideo.create({
        // video: data.Location,
        user: req.user.user_id,
      });
      videoLink.video.push({ url: data.Location });
      await videoLink.save();
      console.log(data.Location);
      res.status(200).json(data.Location);
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
};

module.exports.getLogin = async (req, res) => {
  res.render("user/login");
};

module.exports.postLogin = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      console.log(match);

      if (match) {
        const token = jwt.sign(
          { user_id: user._id, email },
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
};

module.exports.loginSuccess = async (req, res) => {
  res.render("user/loginSuccess");
};

module.exports.userDetails = async (req, res) => {
  // const user = req.user;
  res.json(req.user);
};

module.exports.logout = (req, res) => {
  res.clearCookie("cookietokenkey");
  res.redirect("/");
};
