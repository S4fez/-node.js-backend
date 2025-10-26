const { text } = require("express");

// userProfile.model.js
class UserProfile {
  constructor({ account_id, name, surname, user_age, user_birthdate, user_img, address }) {
    this.account_id = account_id;
    this.name = name;
    this.surname = surname;
    this.user_age = user_age;
    this.user_birthdate = user_birthdate;
    // แก้ path ของ user_img เป็นแบบ URL-friendly
    this.user_img = user_img ? user_img.replace(/\\/g, '/') : null;
    this.address = address;
  }
}

module.exports = UserProfile;
