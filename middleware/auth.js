module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.isAuthenticated) {
      return next();
    }
    req.flash(
      "error",
      "Musisz być zalogowany, aby uzyskać dostęp do tej strony"
    );
    res.redirect("/auth/login");
  },
};
