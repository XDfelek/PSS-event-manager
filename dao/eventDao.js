module.exports = (db) => {
  return {
    // Pobieranie wydarzeń z paginacją
    getAll: (limit, offset, search, sortBy, order, callback) => {
      let query = "SELECT * FROM events";
      const params = [];

      if (search) {
        query += " WHERE title LIKE ?";
        params.push(`%${search}%`);
      }

      if (sortBy) {
        query += ` ORDER BY ${sortBy} ${order === "desc" ? "DESC" : "ASC"}`;
      }

      query += " LIMIT ? OFFSET ?";
      params.push(limit, offset);

      db.query(query, params, callback);
    },

    // Pobieranie liczby wszystkich wydarzeń
    getCount: (search, callback) => {
      let sql = "SELECT COUNT(*) as count FROM events";
      const params = [];

      if (search) {
        sql += " WHERE title LIKE ?";
        params.push(`%${search}%`);
      }

      db.query(sql, params, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      });
    },

    // Tworzenie nowego wydarzenia
    create: (event, callback) => {
      const { title, description, date, location } = event;
      const sql =
        "INSERT INTO events (title, description, date, location) VALUES (?, ?, ?, ?)";
      db.query(sql, [title, description, date, location], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    },
  };
};
