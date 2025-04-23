const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (userDao) => {
  return {
    register: async (userData, callback) => {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user with hashed password
        const user = {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
        };

        userDao.create(user, callback);
      } catch (err) {
        callback(err);
      }
    },

    login: (username, password, callback) => {
      userDao.findByUsername(username, async (err, user) => {
        if (err) return callback(err);
        if (!user)
          return callback(null, false, {
            message: "Nieprawidłowa nazwa użytkownika lub hasło",
          });

        try {
          // Compare provided password with stored hash
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return callback(null, false, {
              message: "Nieprawidłowa nazwa użytkownika lub hasło",
            });
          }

          // Create a JWT token
          const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          return callback(null, { user, token });
        } catch (err) {
          return callback(err);
        }
      });
    },
  };
};
