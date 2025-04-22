const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");

module.exports = (eventService, userDao) => {
  // Lista wydarzeń z paginacją
  router.get("/", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 9;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "date";
    const order = req.query.order || "desc";

    let deletedPostsCount = 0;

    // Only check deleted posts if the user is authenticated and not an admin
    if (
      req.session.isAuthenticated &&
      req.session.user &&
      req.session.user.role !== "admin"
    ) {
      if (userDao) {
        userDao.getDeletedPostsCount(req.session.user.id, (err, count) => {
          if (err) {
            console.error("Error getting deleted posts count:", err);
            renderEventsPage(0);
          } else {
            renderEventsPage(count || 0);
          }
        });
      } else {
        // If userDao is not available, proceed with count 0
        renderEventsPage(0);
      }
    } else {
      // If user is not authenticated or is admin, proceed with count 0
      renderEventsPage(0);
    }

    function renderEventsPage(deletedPostsCount) {
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
              deletedPostsCount,
            });
          });
        }
      );
    }
  });

  // Dodawanie nowego wydarzenia
  router.post("/add", isAuthenticated, (req, res) => {
    eventService.addEvent(req.body, req.session.user.id, (err) => {
      if (err) {
        if (err.limitReached) {
          req.flash("error", err.message);
        } else if (err.code === "ER_DUP_ENTRY") {
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

  // Delete event (admin only)
  router.post("/:id/delete", isAdmin, (req, res) => {
    eventService.deleteEvent(req.params.id, (err, result) => {
      if (err) {
        req.flash("error", "Błąd usuwania wydarzenia");
        return res.redirect("/events");
      }

      // If we deleted a non-admin user's post, check their count
      if (result && result.creatorRole !== "admin") {
        // Add a check for userDao before using it
        if (userDao) {
          userDao.getDeletedPostsCount(result.creatorId, (countErr, count) => {
            if (!countErr && count === 5) {
              // Optionally notify admin that user has reached limit
              req.flash(
                "warning",
                `Użytkownik osiągnął limit usuniętych wydarzeń (5).`
              );
            }

            req.flash("success", "Wydarzenie zostało usunięte pomyślnie");
            res.redirect("/events");
          });
        } else {
          // If userDao is not available, just show success message and redirect
          req.flash("success", "Wydarzenie zostało usunięte pomyślnie");
          res.redirect("/events");
        }
      } else {
        req.flash("success", "Wydarzenie zostało usunięte pomyślnie");
        res.redirect("/events");
      }
    });
  });

  return router;
};
