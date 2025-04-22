module.exports = (eventDao, userDao) => {
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
      // If userDao is available, check deleted posts count
      if (userDao) {
        userDao.getDeletedPostsCount(userId, (err, count) => {
          if (err) return callback(err);

          if (count >= 5) {
            return callback({
              limitReached: true,
              message:
                "Nie możesz dodawać nowych wydarzeń. Limit usuniętych wydarzeń został osiągnięty.",
            });
          }

          // If not reached limit, proceed with creating event
          const eventWithUser = { ...event, created_by: userId };
          eventDao.create(eventWithUser, callback);
        });
      } else {
        // Fallback if userDao is not provided
        const eventWithUser = { ...event, created_by: userId };
        eventDao.create(eventWithUser, callback);
      }
    },

    getEvent: (id, callback) => {
      eventDao.getById(id, callback);
    },

    updateEvent: (id, event, callback) => {
      eventDao.update(id, event, callback);
    },

    deleteEvent: (id, callback) => {
      // First get the event details to check creator
      eventDao.getById(id, (err, event) => {
        if (err) return callback(err);
        if (!event) return callback({ notFound: true });

        // Proceed with deletion
        eventDao.delete(id, (deleteErr) => {
          if (deleteErr) return callback(deleteErr);

          // If deleted event was created by a regular user (not admin), increment counter
          if (userDao && event.creator_role !== "admin") {
            userDao.incrementDeletedPostsCount(
              event.creator_id,
              (counterErr) => {
                if (counterErr)
                  console.error(
                    "Error incrementing deletion counter:",
                    counterErr
                  );
                // Even if there's an error with incrementing, we still return success
                callback(null, {
                  deleted: true,
                  creatorId: event.creator_id,
                  creatorRole: event.creator_role,
                });
              }
            );
          } else {
            callback(null, { deleted: true });
          }
        });
      });
    },
  };
};
