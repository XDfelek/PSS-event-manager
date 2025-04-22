module.exports = (eventDao) => {
  return {
    listEvents: (page, pageSize, search, sortBy, order, callback) => {
      const offset = (page - 1) * pageSize;
      eventDao.getAll(pageSize, offset, search, sortBy, order, callback);
    },

    getTotalPages: (pageSize, search, callback) => {
      eventDao.getCount(search, (err, results) => {
        if (err) return callback(err);
        const total = results[0].count;
        const pages = Math.ceil(total / pageSize);
        callback(null, pages);
      });
    },

    addEvent: (event, userId, callback) => {
      const eventWithUser = { ...event, created_by: userId };
      eventDao.create(eventWithUser, callback);
    },

    getEvent: (id, callback) => {
      eventDao.getById(id, callback);
    },

    updateEvent: (id, event, callback) => {
      eventDao.update(id, event, callback);
    },

    deleteEvent: (id, callback) => {
      eventDao.delete(id, callback);
    },
  };
};
