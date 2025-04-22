module.exports = (db) => {
  return {
    findByUsername: (username, callback) => {
      const sql = "SELECT * FROM users WHERE username = ?";
      db.query(sql, [username], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      });
    },

    findById: (id, callback) => {
      const sql = "SELECT * FROM users WHERE id = ?";
      db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      });
    },

    create: (user, callback) => {
      const { username, email, password } = user;
      const sql =
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')";
      db.query(sql, [username, email, password], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    },

    updateRole: (userId, role, callback) => {
      const sql = "UPDATE users SET role = ? WHERE id = ?";
      db.query(sql, [role, userId], callback);
    },

    getAll: (callback) => {
      const sql = "SELECT id, username, email, role, created_at FROM users";
      db.query(sql, callback);
    },

    getAllWithSearch: (search, callback) => {
      let sql =
        "SELECT id, username, email, role, created_at, deleted_posts_count FROM users";
      const params = [];

      if (search && search.trim() !== "") {
        sql += " WHERE username LIKE ? OR email LIKE ?";
        params.push(`%${search}%`, `%${search}%`);
      }

      sql += " ORDER BY id ASC";
      db.query(sql, params, callback);
    },

    incrementDeletedPostsCount: (userId, callback) => {
      const sql =
        "UPDATE users SET deleted_posts_count = deleted_posts_count + 1 WHERE id = ?";
      db.query(sql, [userId], callback);
    },

    getDeletedPostsCount: (userId, callback) => {
      const sql = "SELECT deleted_posts_count FROM users WHERE id = ?";
      db.query(sql, [userId], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0] ? results[0].deleted_posts_count : 0);
      });
    },

    resetDeletedPostsCount: (userId, callback) => {
      const sql = "UPDATE users SET deleted_posts_count = 0 WHERE id = ?";
      db.query(sql, [userId], callback);
    },
  };
};
