const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");

module.exports = (eventService) => {
  router.get("/", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 9;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "date";
    const order = req.query.order || "desc";

    eventService.listEvents(
      page,
      pageSize,
      search,
      sortBy,
      order,
      (err, events) => {
        if (err) return res.status(500).send("Błąd pobierania wydarzeń");

        eventService.getTotalPages(pageSize, search, (err, totalPages) => {
          if (err) return res.status(500).send("Błąd stronicowania");

          res.render("events", {
            events,
            currentPage: page,
            totalPages,
            search,
            sortBy,
            order,
          });
        });
      }
    );
  });

  router.post("/add", isAuthenticated, (req, res) => {
    eventService.addEvent(req.body, req.session.user.id, (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          req.flash("error", "Wydarzenie o tym tytule lub linku już istnieje");
        } else {
          req.flash("error", "Błąd dodawania wydarzenia");
        }
        return res.redirect("/events");
      }
      req.flash("success", "Wydarzenie zostało dodane pomyślnie");
      res.redirect("/events");
    });
  });

  router.get("/:id", (req, res) => {
    eventService.getEvent(req.params.id, (err, event) => {
      if (err) return res.status(500).send("Błąd pobierania wydarzenia");
      if (!event)
        return res.status(404).send("Wydarzenie nie zostało znalezione");

      res.render("event-details", { event });
    });
  });

  router.get("/:id/edit", isAdmin, (req, res) => {
    eventService.getEvent(req.params.id, (err, event) => {
      if (err) return res.status(500).send("Błąd pobierania wydarzenia");
      if (!event)
        return res.status(404).send("Wydarzenie nie zostało znalezione");

      res.render("edit-event", { event });
    });
  });

  router.post("/:id/edit", isAdmin, (req, res) => {
    eventService.updateEvent(req.params.id, req.body, (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          req.flash("error", "Wydarzenie o tym tytule lub linku już istnieje");
        } else {
          req.flash("error", "Błąd aktualizacji wydarzenia");
        }
        return res.redirect(`/events/${req.params.id}/edit`);
      }
      req.flash("success", "Wydarzenie zostało zaktualizowane pomyślnie");
      res.redirect("/events");
    });
  });

  router.post("/:id/delete", isAdmin, (req, res) => {
    eventService.deleteEvent(req.params.id, (err) => {
      if (err) {
        req.flash("error", "Błąd usuwania wydarzenia");
        return res.redirect("/events");
      }
      req.flash("success", "Wydarzenie zostało usunięte pomyślnie");
      res.redirect("/events");
    });
  });

  return router;
};
