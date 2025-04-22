module.exports = (db) => {
  return {
    getAll: (limit, offset, search, sortBy, order, callback) => {
      let query = `
        SELECT e.*, u.username as creator_username
        FROM events e
        JOIN users u ON e.created_by = u.id
      `;
      const params = [];

      if (search) {
        query += " WHERE e.title LIKE ?";
        params.push(`%${search}%`);
      }

      if (sortBy) {
        query += ` ORDER BY e.${sortBy} ${order === "desc" ? "DESC" : "ASC"}`;
      }

      query += " LIMIT ? OFFSET ?";
      params.push(limit, offset);

      db.query(query, params, callback);
    },

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

    create: (event, callback) => {
      const {
        title,
        description,
        date,
        location,
        created_by,
        link,
        photo_url,
      } = event;
      const sql = `
        INSERT INTO events
        (title, description, date, location, created_by, link, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        sql,
        [title, description, date, location, created_by, link, photo_url],
        callback
      );
    },

    getById: (id, callback) => {
      const sql = `
        SELECT e.*, u.username as creator_username, u.id as creator_id, u.role as creator_role
        FROM events e
        JOIN users u ON e.created_by = u.id
        WHERE e.id = ?
      `;
      db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      });
    },

    update: (id, event, callback) => {
      const { title, description, date, location, link, photo_url } = event;
      const sql = `
        UPDATE events
        SET title = ?, description = ?, date = ?, location = ?, link = ?, photo_url = ?
        WHERE id = ?
      `;
      db.query(
        sql,
        [title, description, date, location, link, photo_url, id],
        callback
      );
    },

    delete: (id, callback) => {
      const sql = "DELETE FROM events WHERE id = ?";
      db.query(sql, [id], callback);
    },
  };
};
