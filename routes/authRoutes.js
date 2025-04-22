const express = require("express");
const router = express.Router();

module.exports = (authService) => {
  // Login page
  router.get("/login", (req, res) => {
    res.render("login", {
      message: req.flash("error"),
      success: req.flash("success"),
    });
  });

  // Register page
  router.get("/register", (req, res) => {
    res.render("register", {
      message: req.flash("error"),
    });
  });

  // Login process
  router.post("/login", (req, res) => {
    const { username, password } = req.body;

    authService.login(username, password, (err, result, info) => {
      if (err) {
        req.flash("error", "Wystąpił błąd podczas logowania");
        return res.redirect("/auth/login");
      }

      if (!result) {
        req.flash("error", info.message);
        return res.redirect("/auth/login");
      }

      // Store user info in session
      req.session.user = result.user;
      req.session.isAuthenticated = true;
      req.session.token = result.token;

      req.flash("success", "Zalogowano pomyślnie");
      res.redirect("/events");
    });
  });

  // Register process
  router.post("/register", (req, res) => {
    const { username, email, password, password2 } = req.body;

    // Validation
    if (password !== password2) {
      req.flash("error", "Hasła nie są zgodne");
      return res.redirect("/auth/register");
    }

    authService.register({ username, email, password }, (err) => {
      if (err) {
        req.flash("error", "Wystąpił błąd podczas rejestracji");
        return res.redirect("/auth/register");
      }

      req.flash(
        "success",
        "Rejestracja zakończona pomyślnie. Możesz się teraz zalogować."
      );
      res.redirect("/auth/login");
    });
  });

  // Logout
  router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/auth/login");
  });

  return router;
};
