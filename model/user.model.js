const { text } = require("express");

// userProfile.model.js
class UserProfile {
  constructor({ account_id, name, surname, user_age, user_birthdate, user_img, address,role_name,sys_name,role_id,sys_role ,email}) {
    this.account_id = account_id;
    this.name = name;
    this.surname = surname;
    this.user_age = user_age;
    this.user_birthdate = user_birthdate;
    // แก้ path ของ user_img เป็นแบบ URL-friendly
    this.user_img = user_img ? user_img.replace(/\\/g, '/') : null;
    this.address = address;
    this.rolename = role_name;
    this.sysname = sys_name;
    this.roleid = role_id;
    this.sysrole = sys_role;
    this.email = email;
    
  }
}

module.exports = UserProfile;
