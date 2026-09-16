const express = require("express");

const {
    createTicket,
    useTicket,
    getTickets,
    deleteTicket
} = require("../controllers/ticketController");

const router = express.Router();

router.post("/", createTicket);

router.post("/use", useTicket);

router.get("/", getTickets);

router.delete("/:id", deleteTicket);

module.exports = router;