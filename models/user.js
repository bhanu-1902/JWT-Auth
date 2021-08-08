const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password should contain atleast 6 characters"],
  },
});

//Mongoose Hook - Fire a fn after an event has happened
//Ex- fire a fn after doc has been saved to db
// userSchema.post("save", function (doc, next) {
//   //fires post doc has been saved
//   console.log("New user created and saved", doc);
//   next();
// });

//Ex- fire a fn before doc has been saved to db
userSchema.pre("save", async function (next) {
  //fires before doc has been saved
  // console.log("New user about to be created and saved", this);
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect Password");
  }
  throw Error("Incorrect Email");
};

const User = mongoose.model("user", userSchema);

module.exports = User;
