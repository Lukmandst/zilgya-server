const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { register, getPassByUserEmail } = require("../models/auth");
const { successResponse, errorResponse } = require("../helpers/response");

const auth = {};

auth.register = (req, res) => {
  // expect sebuah body dengan
  // property email dan pass
  const {
    body: { email, password, roles_id, created_at },
  } = req;
  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      register( email, hashedPassword, roles_id, created_at)
        .then(() => {
          successResponse(res, 201, { msg: "Register Success" }, null);
        })
        .catch((error) => {
          //console.log(error);
          const { status, err } = error;
          errorResponse(res, status, err);
        });
    })
    .catch((err) => {
      console.log(err)
      errorResponse(res, 500, err);
    });
};

auth.signIn = async (req, res) => {
  try {
    // mendapatkan body email dan pass
    const {
      body: { email, password },
    } = req;
    // cek kecocokan email dan pass di db
    const data = await getPassByUserEmail(email);
    const result = await bcrypt.compare(password, data.password);
    if (!result)
      return errorResponse(res, 400, { msg: "Email or Password wrong !" });
    // generate jwt
    const payload = {
      id: data.id,
      email,
      roles_id: data.roles_id
    };

    const jwtOptions = {
      issuer: process.env.JWT_ISSUER ,
      expiresIn: "12h", // expired in 10000s
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, jwtOptions);
    // return
    successResponse(res, 200, { email, token, roles_id: data.roles_id }, null);
  } catch (error) {
    //console.log(error);
    const { status = 500 ,err } = error;
    errorResponse(res, status, err);
  }
};

module.exports = auth;