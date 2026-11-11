const crypto = require("crypto");
const db = require("../database");

const CODE_PATTERN = /^[0-9A-F]{8}$/;

function newCode() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// CREATE TICKET: a random 8-character code. A clash with an existing code is retried.
const createTicket = (req, res) => {
    const insert = (attemptsLeft) => {
        const code = newCode();
        db.run("INSERT INTO tickets (code, used) VALUES (?, 0)", [code], function (err) {
            if (err && err.code === "SQLITE_CONSTRAINT" && attemptsLeft > 0) {
                return insert(attemptsLeft - 1);
            }
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Could not create ticket" });
            }
            res.status(201).json({ id: this.lastID, code, used: false });
        });
    };
    insert(3);
};

// USE TICKET: one atomic UPDATE, so the same ticket can never be used twice,
// even when two requests arrive at the same moment.
const useTicket = (req, res) => {
    const code = typeof req.body?.code === "string" ? req.body.code.trim().toUpperCase() : "";

    if (!code) {
        return res.status(400).json({ error: "Ticket code is required" });
    }
    if (!CODE_PATTERN.test(code)) {
        return res.status(400).json({ error: "A ticket code has 8 characters (0-9, A-F)" });
    }

    db.run("UPDATE tickets SET used = 1 WHERE code = ? AND used = 0", [code], function (err) {
        if (err) {
            return res.status(500).json({ error: "Could not use ticket" });
        }
        if (this.changes === 1) {
            return res.json({ message: "Ticket successfully used" });
        }

        // Nothing changed: the code does not exist, or it was used already.
        db.get("SELECT used FROM tickets WHERE code = ?", [code], (err, ticket) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }
            if (!ticket) {
                return res.status(404).json({ error: "Ticket not found" });
            }
            res.status(409).json({ error: "Ticket has already been used" });
        });
    });
};

// GET ALL TICKETS, newest first.
const getTickets = (req, res) => {
    db.all("SELECT id, code, used FROM tickets ORDER BY id DESC", [], (err, tickets) => {
        if (err) {
            return res.status(500).json({ error: "Could not get tickets" });
        }
        res.json(tickets.map((ticket) => ({
            id: ticket.id,
            code: ticket.code,
            used: ticket.used === 1,
        })));
    });
};

// DELETE an unused ticket. Used tickets are kept as a record.
const deleteTicket = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Ticket id must be a positive whole number" });
    }

    db.run("DELETE FROM tickets WHERE id = ? AND used = 0", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: "Could not delete ticket" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Ticket not found or already used" });
        }
        res.json({ message: "Ticket deleted" });
    });
};

module.exports = {
    createTicket,
    useTicket,
    getTickets,
    deleteTicket,
};
