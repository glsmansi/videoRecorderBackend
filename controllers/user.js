const User = require("../models/User");
const UserVideo = require("../models/UserVideo");
const ExpressError = require("../utils/ExpressError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

// const { InstallProvider } = require("@slack/oauth");

// const installer = new InstallProvider({
//   clientId: process.env.SLACK_CLIENT_ID,
//   clientSecret: process.env.SLACK_CLIENT_SECRET,
//   stateSecret: "my-state-secret",
//   installationStore: {
//     // takes in an installation object as an argument
//     // returns nothing
//     storeInstallation: async (installation) => {
//       // replace myDB.set with your own database or OEM setter
//       if (installation.isEnterpriseInstall) {
//         // support for org wide app installation
//         return myDB.set(installation.enterprise.id, installation);
//       } else {
//         // single team app installation
//         return myDB.set(installation.team.id, installation);
//       }
//       throw new Error("Failed saving installation data to installationStore");
//     },
//     // takes in an installQuery as an argument
//     // installQuery = {teamId: 'string', enterpriseId: 'string', userId: 'string', conversationId: 'string', isEnterpriseInstall: boolean};
//     // returns installation object from database
//     fetchInstallation: async (installQuery) => {
//       // replace myDB.get with your own database or OEM getter
//       if (
//         installQuery.isEnterpriseInstall &&
//         installQuery.enterpriseId !== undefined
//       ) {
//         // org wide app installation lookup
//         return await myDB.get(installQuery.enterpriseId);
//       }
//       if (installQuery.teamId !== undefined) {
//         // single team app installation lookup
//         return await myDB.get(installQuery.teamId);
//       }
//       throw new Error("Failed fetching installation");
//     },
//     // takes in an installQuery as an argument
//     // installQuery = {teamId: 'string', enterpriseId: 'string', userId: 'string', conversationId: 'string', isEnterpriseInstall: boolean};
//     // returns nothing
//     deleteInstallation: async (installQuery) => {
//       // replace myDB.get with your own database or OEM getter
//       if (
//         installQuery.isEnterpriseInstall &&
//         installQuery.enterpriseId !== undefined
//       ) {
//         // org wide app installation deletion
//         return await myDB.delete(installQuery.enterpriseId);
//       }
//       if (installQuery.teamId !== undefined) {
//         // single team app installation deletion
//         return await myDB.delete(installQuery.teamId);
//       }
//       throw new Error("Failed to delete installation");
//     },
//   },
//   stateStore: {
//     // generateStateParam's first argument is the entire InstallUrlOptions object which was passed into generateInstallUrl method
//     // the second argument is a date object
//     // the method is expected to return a string representing the state
//     generateStateParam: (installUrlOptions, date) => {
//       // generate a random string to use as state in the URL
//       const randomState = randomStringGenerator();
//       // save installOptions to cache/db
//       myDB.set(randomState, installUrlOptions);
//       // return a state string that references saved options in DB
//       return randomState;
//     },
//     // verifyStateParam's first argument is a date object and the second argument is a string representing the state
//     // verifyStateParam is expected to return an object representing installUrlOptions
//     verifyStateParam: (date, state) => {
//       // fetch saved installOptions from DB using state reference
//       const installUrlOptions = myDB.get(randomState);
//       return installUrlOptions;
//     },
//   },
//   stateVerification: false,
//   logLevel: LogLevel.DEBUG,
// });

// const result = installer.authorize({ teamId: "my-team-ID" });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "198561696099-flasriqkqqlkn2db9ttq6ellso1g6kdn.apps.googleusercontent.com";
// const CLIENT_SECRET = OAuth2Data.web.client_secret;

const client = new OAuth2Client(CLIENT_ID);

// const oAuth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   )

module.exports.home = async (req, res) => {
  if (req.cookies["cookietokenkey"]) {
    res.redirect("/loginSuccess");
  } else {
    res.render("home");
  }
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
      // res.status(200).json(data.Location);

      // const drive = google.drive({ version: "v3",auth:oAuth2Client  });
      // const fileMetadata = {
      //   name: req.file.filename,
      // };
      // const media = {
      //   mimeType: req.file.mimetype,
      //   body: fs.createReadStream(req.file.path),
      // };
      // drive.files.create(
      //   {
      //     resource: fileMetadata,
      //     media: media,
      //     fields: "id",
      //   },
      //   (err, file) => {
      //     if (err) {
      //       // Handle error
      //       console.error(err);
      //     } else {
      //       fs.unlinkSync(req.file.path)
      //       // res.render("success",{name:name,pic:pic,success:true})
      //     }

      //   }
      // );
    });
  } catch (e) {
    return new ExpressError(e);
  }
};

module.exports.getRegister = async (req, res) => {
  if (req.cookies["cookietokenkey"]) {
    res.redirect("/loginSuccess");
  } else {
    res.redirect("/login");
  }
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
  if (req.cookies["cookietokenkey"]) {
    res.redirect("/loginSuccess");
  } else {
    res.redirect("/login");
  }
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
  if (req.cookies["cookietokenkey"]) {
    return res.redirect("/loginSuccess");
  }
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

module.exports.setting = async (req, res) => {
  res.render("setting");
};

// module.exports.slackInstall = async (req, res) => {
//   await installer.handleInstallPath(req, res, {
//     scopes: ["chat:write"],
//     userScopes: ["channels:read"],
//     metadata: "some_metadata",
//     renderHtmlForInstallPath: (url) =>
//       `<html><body><a href="${url}">Install my app!</a></body></html>`,
//   });
// };

// // module.exports.slackLogin = async (req, res) => {};
// const callbackOptions = {
//   success: (installation, installOptions, req, res) => {
//     // Do custom success logic here
//     // Tips:
//     // - Inspect the metadata with `installOptions.metadata`
//     // - Add javascript and css in the htmlResponse using the <script> and <style> tags
//     const htmlResponse = `<html><body>Success!</body></html>`;
//     res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
//     res.end(htmlResponse);
//   },
//   failure: (error, installOptions, req, res) => {
//     // Do custom failure logic here
//     res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
//     res.end(
//       "<html><body><h1>Oops, Something Went Wrong! Please Try Again or Contact the App Owner</h1></body></html>"
//     );
//   },
// };

// module.exports.oauthRedirect = async (req, res) => {
//   installer.handleCallback(req, res, callbackOptions);
// };

module.exports.loginSuccess = async (req, res) => {
  if (req.cookies["cookietokenkey"]) {
    res.render("user/loginSuccess");
  } else {
    res.redirect("/");
  }
};

module.exports.userDetails = async (req, res) => {
  // const user = req.user;
  res.json(req.user);
};

module.exports.logout = (req, res) => {
  res.clearCookie("cookietokenkey");
  res.redirect("/");
};
