module.exports = (db) => {
  return {
    findByUsername: (username, callback) => {
      const sql = "SELECT * FROM users WHERE username = ?";
      db.query(sql, [username], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      });
    },

    create: (user, callback) => {
      const { username, email, password } = user;
      const sql =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      db.query(sql, [username, email, password], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    },
  };
};
