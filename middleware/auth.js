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

  isAdmin: (req, res, next) => {
    if (req.session.isAuthenticated && req.session.user.role === "admin") {
      return next();
    }
    req.flash("error", "Nie masz uprawnień administratora");
    res.redirect("/events");
  },
};
