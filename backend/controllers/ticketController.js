const crypto = require("crypto");
const db = require("../database");

// CREATE TICKET
const createTicket = (req, res) => {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();

    const sql = `
        INSERT INTO tickets (code, used)
        VALUES (?, 0)
    `;

    db.run(sql, [code], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({
                error: "Could not create ticket"
            });
        }

        res.status(201).json({
            id: this.lastID,
            code: code,
            used: false
        });
    });
};


// USE TICKET
const useTicket = (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            error: "Ticket code is required"
        });
    }

    db.get(
        "SELECT * FROM tickets WHERE code = ?",
        [code],
        (err, ticket) => {
            if (err) {
                return res.status(500).json({
                    error: "Database error"
                });
            }

            if (!ticket) {
                return res.status(404).json({
                    error: "Ticket not found"
                });
            }

            if (ticket.used === 1) {
                return res.status(400).json({
                    error: "Ticket has already been used"
                });
            }

            db.run(
                "UPDATE tickets SET used = 1 WHERE id = ?",
                [ticket.id],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            error: "Could not use ticket"
                        });
                    }

                    res.json({
                        message: "Ticket successfully used"
                    });
                }
            );
        }
    );
};


// GET ALL TICKETS
const getTickets = (req, res) => {
    db.all(
        "SELECT * FROM tickets ORDER BY id DESC",
        [],
        (err, tickets) => {
            if (err) {
                return res.status(500).json({
                    error: "Could not get tickets"
                });
            }

            const result = tickets.map(ticket => ({
                id: ticket.id,
                code: ticket.code,
                used: ticket.used === 1
            }));

            res.json(result);
        }
    );
};


// DELETE UNUSED TICKET
const deleteTicket = (req, res) => {
    const { id } = req.params;

    db.run(
        "DELETE FROM tickets WHERE id = ? AND used = 0",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: "Could not delete ticket"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Ticket not found or already used"
                });
            }

            res.json({
                message: "Ticket deleted"
            });
        }
    );
};


module.exports = {
    createTicket,
    useTicket,
    getTickets,
    deleteTicket
};