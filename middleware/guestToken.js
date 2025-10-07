const { v4: uuidv4 } = require("uuid");

const guestTokenMiddleware = (req, res, next) => {
  let token = req.cookies?.guestToken;

  if (!token) {
    token = uuidv4();
    res.cookie("guestToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7* 24 * 60 * 60 * 1000, // 7 day
    });
  }

  req.guestToken = token;
  next();
};

module.exports = guestTokenMiddleware;
