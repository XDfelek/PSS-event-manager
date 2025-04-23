const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");

module.exports = (adminService) => {
  // Admin dashboard - list all users with optional search
  router.get("/", isAdmin, (req, res) => {
    const search = req.query.search || "";
    adminService.listUsers(search, (err, users) => {
      if (err) {
        req.flash("error", "Błąd pobierania listy użytkowników");
        return res.redirect("/events");
      }
      res.render("admin-dashboard", { users, search });
    });
  });

  // Make user an admin
  router.post("/make-admin/:id", isAdmin, (req, res) => {
    adminService.makeAdmin(req.params.id, (err) => {
      if (err) {
        req.flash("error", "Błąd nadawania uprawnień administratora");
      } else {
        req.flash("success", "Pomyślnie nadano uprawnienia administratora");
      }
      res.redirect(
        "/admin" + (req.query.search ? `?search=${req.query.search}` : "")
      );
    });
  });

  // Remove admin privileges
  router.post("/remove-admin/:id", isAdmin, (req, res) => {
    adminService.removeAdmin(req.params.id, (err) => {
      if (err) {
        req.flash("error", "Błąd odbierania uprawnień administratora");
      } else {
        req.flash("success", "Pomyślnie odebrano uprawnienia administratora");
      }
      res.redirect(
        "/admin" + (req.query.search ? `?search=${req.query.search}` : "")
      );
    });
  });

  // Make user a moderator
  router.post("/make-moderator/:id", isAdmin, (req, res) => {
    adminService.makeModerator(req.params.id, (err) => {
      if (err) {
        req.flash("error", "Błąd nadawania uprawnień administratora");
      } else {
        req.flash("success", "Pomyślnie nadano uprawnienia administratora");
      }
      res.redirect(
        "/admin" + (req.query.search ? `?search=${req.query.search}` : "")
      );
    });
  });

  // Remove moderator privileges
  router.post("/remove-moderator/:id", isAdmin, (req, res) => {
    adminService.removeModerator(req.params.id, (err) => {
      if (err) {
        req.flash("error", "Błąd odbierania uprawnień administratora");
      } else {
        req.flash("success", "Pomyślnie odebrano uprawnienia administratora");
      }
      res.redirect(
        "/admin" + (req.query.search ? `?search=${req.query.search}` : "")
      );
    });
  });

  // Reset user deletion counter
  router.post("/reset-deletions/:id", isAdmin, (req, res) => {
    adminService.resetUserDeletions(req.params.id, (err) => {
      if (err) {
        req.flash("error", "Błąd resetowania licznika usuniętych wydarzeń");
      } else {
        req.flash(
          "success",
          "Pomyślnie zresetowano licznik usuniętych wydarzeń"
        );
      }
      res.redirect(
        "/admin" + (req.query.search ? `?search=${req.query.search}` : "")
      );
    });
  });

  return router;
};
