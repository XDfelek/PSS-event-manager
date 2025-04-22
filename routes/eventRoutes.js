const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");

module.exports = (eventService) => {
  // Lista wydarzeń z paginacją
  router.get("/", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "date";
    const order = req.query.order || "asc";

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

  // Dodawanie nowego wydarzenia - protected by auth middleware
  router.post("/add", isAuthenticated, (req, res) => {
    eventService.addEvent(req.body, (err) => {
      if (err) return res.status(500).send("Błąd dodawania wydarzenia");
      res.redirect("/events");
    });
  });

  return router;
};
