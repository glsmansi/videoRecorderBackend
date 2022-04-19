const User = require("../models/User");
const UserVideo = require("../models/UserVideo");
const Video = require("../models/Video");
const ExpressError = require("../../utils/ExpressError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const sequelize = require("sequelize");
// var ncp = require("copy-paste");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { Op } = require("sequelize");
// const alert = require("alert");

// Video.belongsTo(User, {
//   as: "videos",
//   foreignKey: "userEmail",
// });

var err = "";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "198561696099-flasriqkqqlkn2db9ttq6ellso1g6kdn.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

module.exports.home = async (req, res) => {
  if (req.session.userId) {
    res.redirect("/home");
  } else {
    res.render("home", { title: "ATG MEET" });
  }
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
        userId: req.session.userId,
      });
      await videoLink.save();

      const userVideo = await UserVideo.create({
        userEmail: req.session.email,
        videoId: videoLink.id,
      });
      // console.log(req.user.email);
      const details = {
        watchableLink: `videorecorderbackend.herokuapp.com/${videoLink.id}/watch`,
        downloadableLink: data.Location,
        file: fileName,
      };
      console.log(userVideo);
      console.log(videoLink);
      res.status(200).json(details);
    });
  } catch (e) {
    return new ExpressError(e);
  }
};

module.exports.addVideo = async (req, res) => {
  res.render("user/addVideo", { title: "Add Video" });
};

module.exports.getRegister = async (req, res) => {
  // if (req.cookies["loginkey"]) {
  //   res.redirect("/home");
  // } else {
  if (!req.session.userId) {
    res.render("user/register", {
      err: false,
      success: false,
      title: "Register",
    });
  } else {
    res.redirect("/");
  }
};

module.exports.postRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const oldUser = await User.findOne({ where: { email: email } });
    console.log(oldUser);
    if (oldUser) {
      //return next(new ExpressError("User Already Exist", 409));
      return res.render("user/register", {
        err: "User Already Exists",
        success: false,
        title: "Register",
      });
    }

    // if (password.search(/(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{8,}/) == -1) {
    //   console.log(password);
    //   return res.render("user/register", { loginErr: false, passErr: true });
    // }
    if (
      password < 8 ||
      password.search(/[0-9]/) == -1 ||
      password.search(/[a-z]/) == -1 ||
      password.search(/[A-Z]/) == -1 ||
      password.search(/[!/@/#/$/%/^/&/(/)/_/+/./,/:/;/*/]/) == -1
    ) {
      return res.render("user/register", {
        err:
          " password should contain at least one lowercase character, at least one uppercase character, at least one numeric value,  at least one special character,  minimum 8 characters",
        success: false,
        title: "Register",
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(encryptedPassword);
    const user = await User.create({
      raw: true,
      username,
      email,
      password: encryptedPassword,
      loginType: "login",
    });
    // console.log("user verify", user);
    const token = jwt.sign({ userId: user._id, email }, process.env.TOKEN_KEY);
    const url = `${process.env.EMAILHOSTLINK}/emailToken/${token}`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      // secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_ID, // generated ethereal user
        pass: process.env.GMAIL_PASSWORD, // generated ethereal password
      },
    });
    let mailOptions = {
      from: "gl.sai.mansi8@gmail.com", // sender address
      to: email, // list of receivers
      subject: "ATG-MEET email verification", // Subject line
      // text: `To verify you email please click the following url: ${url} `, // plain text
      html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      } else {
        console.log(info);
        res.render("user/register", {
          err: false,
          success: `email has been sent to ${email}`,
          title: "Register",
        });
      }
    });
  } catch (e) {
    console.log(e);
    return next(new ExpressError(e));
  }
};

module.exports.getEmailToken = async (req, res) => {
  const { token } = req.params;
  res.render("user/emailToken", {
    err: false,
    token,
    title: "Email Verification",
  });
};

module.exports.postEmailToken = async (req, res) => {
  const { token } = req.params;
  const { email, password } = req.body;
  var tokenData = jwt.verify(token, process.env.TOKEN_KEY);
  if (email == tokenData.email) {
    const user = await User.findOne({ where: { email: tokenData.email } });
    console.log(user.isVerified);
    if (user && user.isVerified === false) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        user.isVerified = true;
        await user.save();
        res.redirect("/login");
      } else {
        res.render("user/emailToken", {
          err: "Password doesn't match",
          token,
          title: "Email Verification",
        });
      }
    } else {
      if (!user) {
        err = "User Doesn't Exist";
        console.log(err);
      } else if (user.isVerified == true) {
        err = `Email Already Verified Please Login from ${process.env.EMAILHOSTLINK}/login`;
        console.log(err);
      }
      res.render("user/register", {
        success: false,
        err,
        title: "Register",
      });
    }
  } else {
    res.render("user/emailToken", {
      err: "Email Doesn't Match",
      token,
      title: "Email Verification",
    });
  }
};

module.exports.getLogin = async (req, res) => {
  if (!req.session.userId) {
    res.render("user/login", {
      err: false,
      title: "Login",
    });
  } else {
    res.redirect("/");
  }
};

module.exports.postLogin = async (req, res, next) => {
  try {
    console.log("req.body");
    const { email, password } = req.body;
    const user = await User.findOne({ raw: true, where: { email: email } });
    if (user && user.isVerified) {
      const match = await bcrypt.compare(password, user.password);
      console.log("user");

      if (match) {
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.isAuth = true;

        console.log("user", user);

        res.redirect("/home");
      } else {
        //return next(new ExpressError("Invalid Password"));
        err = "Invalid Password";
        res.render("user/login", { err, title: "Login" });
      }
    } else {
      // return next(new ExpressError("User doesnot exist "));
      if (user.isVerified == false) {
        err = `Email Not Verified. Please Check your mail with name: ${process.env.GMAIL_ID}`;
      } else {
        err = "User Doesn't Exist";
      }
      res.render("user/login", { err, title: "Login" });
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
      idToken: req.body.token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    console.log(payload);
    const user = await User.findOne({ where: { email: payload.email } });

    if (!user) {
      const newUser = await User.create({
        username: payload.name,
        email: payload.email,
        loginType: "googleLogin",
        isVerified: true,
      });
      await newUser.save();
    }
    console.log(req.session);
    req.session.userId = user.id;
    req.session.email = payload.email;
    req.session.isAuth = true;
  }
  verify()
    .then(() => {
      res.send("success");
    })

    .catch(console.error);
  //   res.redirect("chrome:extensions");
};

module.exports.settings = async (req, res) => {
  // var photo = false;
  const user = await User.findOne({ where: { email: req.session.email } });
  // var path = `public/profilepic/${user.username}.jpg`;
  // if (fs.existsSync(path)) {
  // path exists
  // photo = true;
  // console.log("exists:", path);
  // }
  res.render("user/setting", {
    user,
    err: false,
    success: false,
    title: "Settings",
  });
};

module.exports.loginSuccess = async (req, res) => {
  // if (req.cookies["loginkey"]) {
  res.render("user/myVideo", { title: "ATG MEET" });
};

module.exports.sharedWithMe = async (req, res) => {
  const userEmail = req.session.email;
  const user = await User.findOne({ where: { id: req.session.userId } });
  const uservideos = await UserVideo.findAll({
    where: { teamMembers: userEmail },
  });

  var arr = [];
  var sharedvideos = [];
  for (let i = 0; i < uservideos.length; i++) {
    if (arr.includes(uservideos[i].videoId)) {
      console.log("sdfdsf");
      continue;
    }
    arr.push(uservideos[i].videoId);
  }
  console.log(arr);
  // for (let i = 0; i < arr.length; i++) {
  const videos = await Video.findOne({
    where: {
      id: { [Op.in]: arr },
    },
  });
  sharedvideos.push(videos);
  console.log(sharedvideos.length);
  // }

  res.render("user/me", { sharedvideos, title: "Shared Videos" });
};
module.exports.sharedWithOthers = async (req, res) => {
  // const userEmail = req.user.email;
  const user = await User.findOne({ where: { id: req.session.userId } });
  // console.log(user);
  const uservideos = await Video.findAll({ where: { userId: user.id } });
  let arr = [];
  for (let i = 0; i < uservideos.length; i++) {
    console.log(uservideos[i].id);
    const userVideos = await UserVideo.findAll({
      where: {
        userEmail: user.email,
        videoId: uservideos[i].id,
        teamMembers: { [Op.ne]: null },
      },
    });
    if (userVideos.length) {
      arr.push(userVideos[i].videoId);
    }
  }
  console.log(arr);

  const videos = await Video.findAll({
    where: { id: { [Op.in]: arr } },
  });
  // videos;
  console.log(videos);
  res.render("user/team", { videos, user, title: "Shared with Team" });
};

module.exports.personal = async (req, res) => {
  console.log("user deatils", req.session);
  const userEmail = req.session.email;
  const user = await User.findOne({ where: { id: req.session.userId } });
  const uservideos = await Video.findAll({
    where: { userId: user.id },
  });
  console.log("uservideos");
  res.render("user/myVideo", {
    uservideos,
    user,
    userEmail,
    title: "ATG MEET",
  });
};

module.exports.userVideoLink = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findOne({ where: { id: id } });
  const user = await User.findOne({ where: { id: video.userId } });

  const uservideo = await UserVideo.findAll({
    where: { userEmail: user.email, videoId: video.id },
  });

  var userData;

  if (video.status == "public") {
    if (req.session) {
      // const token = req.cookies.loginkey;
      // const data = await jwt.verify(token, process.env.TOKEN_KEY);
      userData = req.session;
      console.log(userData);
      return res.render("user/publicVideoPage", {
        video,
        user,
        uservideo,
        userData,
        title: "Public Video",
      });
    } else {
      console.log(uservideo);
      res.render("user/publicVideoPage", { video, uservideo });
    }
  } else if (video.status == "private") {
    if (req.session) {
      // const token = req.cookies.loginkey;
      // const data = await jwt.verify(token, process.env.TOKEN_KEY);
      const userData = req.session;
      console.log(userData);

      res.render("user/video", {
        video,
        user,
        uservideo,
        userData,
        title: "Privated Video",
      });
    } else {
      res.redirect("/login");
    }
  }
};

module.exports.downloadVideo = async (req, res) => {
  // const email = req.user.email;
  const videoLink = await Video.findOne({
    where: { userId: req.session.userId },
    order: [["id", "DESC"]],
  });
  console.log(videoLink);
  res.json(videoLink.url);
};

module.exports.userDetails = async (req, res) => {
  // const user = req.user;
  res.json(req.session);
};

module.exports.publicOrPrivate = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  console.log(status);
  const video = await Video.findOne({ where: { id: id } });
  console.log(video);
  if (status != video.status) {
    video.status = status;
    await video.save();
    res.redirect(`/${id}/watch`);
  } else {
    console.log("no change");
    res.redirect(`/${id}/watch`);
  }
};

module.exports.AddteamMembers = async (req, res) => {
  const { id } = req.params;
  const { teamMembers } = req.body;
  console.log(teamMembers);
  const uservideo = await UserVideo.create({
    userEmail: req.session.email,
    videoId: id,
    teamMembers: teamMembers,
  });
  await uservideo.save();

  res.redirect(`/${id}/watch`);
};

module.exports.DeleteteamMembers = async (req, res) => {
  const { id } = req.params;
  const { teamMembers } = req.body;
  const uservideo = await UserVideo.destroy({
    where: { videoId: id, teamMembers: teamMembers },
  });
  // video.teamMembers = NULL;
  await uservideo.save();
  res.redirect(`${id}/watch`);
};

module.exports.meetingNotes = async (req, res) => {
  const { id } = req.params;
  const { meetingNotes } = req.body;
  const video = await Video.findOne({ where: { id: id } });
  console.log(meetingNotes);
  video.meetingNotes = meetingNotes;
  await video.save();
  res.redirect(`/${id}/watch`);
};

module.exports.changeFileName = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const video = await Video.findOne({ where: { id: id } });
  video.fileName = name;
  await video.save();
  res.redirect(`/${id}/watch`);
};

module.exports.changeUserName = async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ where: { id: req.session.userId } });
  user.username = username;
  await user.save();
  res.redirect("/settings");
};

module.exports.changePassword = async (req, res) => {
  const { password, newPassword, confirmPassword } = req.body;
  const user = await User.findOne({ where: { id: req.session.userId } });
  if (user.loginType == "googleLogin") {
    if (
      newPassword < 8 ||
      newPassword.search(/[0-9]/) == -1 ||
      newPassword.search(/[a-z]/) == -1 ||
      newPassword.search(/[A-Z]/) == -1 ||
      newPassword.search(/[!/@/#/$/%/^/&/(/)/_/+/./,/:/;/*/]/) == -1
    ) {
      return res.render("user/setting", {
        user,
        success: false,
        err:
          "password should contain minimum 8 characters, at least one lowercase,at least one uppercase, at least one numeric value, at least one special character",
        title: "Settings",
      });
    }
    if (newPassword == confirmPassword) {
      newEncryptedPassword = await bcrypt.hash(newPassword, 10);
      console.log(newEncryptedPassword);
      user.password = newEncryptedPassword;
      await user.save();
      res.render("user/setting", {
        user,
        err: false,
        success: "Password Changed",
        title: "Settings",
      });
    } else {
      res.render("user/setting", {
        user,
        success: false,
        err: "New password and confirm password must match",
        title: "Settings",
      });
      console.log("no MATCH");
    }
  } else {
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      if (
        newPassword < 8 ||
        newPassword.search(/[0-9]/) == -1 ||
        newPassword.search(/[a-z]/) == -1 ||
        newPassword.search(/[A-Z]/) == -1 ||
        newPassword.search(/[!/@/#/$/%/^/&/(/)/_/+/./,/:/;/*/]/) == -1
      ) {
        return res.render("user/setting", {
          user,
          success: false,
          err:
            "password should contain minimum 8 characters, at least one lowercase,at least one uppercase, at least one numeric value, at least one special character",
          title: "Settings",
        });
      }
      if (newPassword == confirmPassword) {
        newEncryptedPassword = await bcrypt.hash(newPassword, 10);
        console.log(newEncryptedPassword);
        user.password = newEncryptedPassword;
        await user.save();
        res.render("user/setting", {
          user,
          err: false,
          success: "Password Changed",
          title: "Settings",
        });
      } else {
        res.render("user/setting", {
          user,
          success: false,
          err: "New password and confirm password must match",
          title: "Settings",
        });
        console.log("no MATCH");
      }
    } else {
      res.render("user/setting", {
        user,
        success: false,
        err: "Current password doesn't match",
        title: "Settings",
      });
      console.log("Wrong password");
    }
  }
};

module.exports.uploadPhoto = async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  try {
    myFile = req.file.originalname.split(".");
    fileType = myFile[myFile.length - 1];
    // console.log(myFile);
    const profilePicName = `${req.body.username}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME_TWO,
      ACL: "public-read",
      Key: profilePicName,
      Body: req.file.buffer,
    };
    console.log(myFile);

    s3.upload(params, async (error, data) => {
      if (error) {
        res.status(500).json(error);
      }
      // console.log(params[Key]);
      const user = await User.findOne({ where: { id: req.session.userId } });
      user.profilePicture = data.Location;
      await user.save();
      console.log(data.Location);
      res.status(200).redirect("/settings");
    });
  } catch (e) {
    return new ExpressError(e);
  }
};

module.exports.removeProfilePic = async (req, res) => {
  const user = await User.findOne({ where: { id: req.session.userId } });
  user.profilePicture = null;
  await user.save();
  res.redirect("/settings");
};

module.exports.logout = (req, res) => {
  // res.clearCookie("loginkey");
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
};
