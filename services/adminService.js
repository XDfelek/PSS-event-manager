module.exports = (userDao) => {
  return {
    listUsers: (search, callback) => {
      userDao.getAllWithSearch(search, callback);
    },

    makeAdmin: (userId, callback) => {
      userDao.updateRole(userId, "admin", callback);
    },

    removeAdmin: (userId, callback) => {
      userDao.updateRole(userId, "user", callback);
    },

    resetUserDeletions: (userId, callback) => {
      userDao.resetDeletedPostsCount(userId, callback);
    },
  };
};
