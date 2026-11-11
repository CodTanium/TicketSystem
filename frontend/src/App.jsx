import { useCallback, useEffect, useState } from "react";
import "./App.css";

// Set VITE_API_URL in frontend/.env.local to use a local backend, e.g.
// VITE_API_URL=http://localhost:3000/api/tickets
const API_URL = import.meta.env.VITE_API_URL || "https://ticketsystem-c4my.onrender.com/api/tickets";

// Calls the API and returns the JSON body; throws with the server's error text on failure.
async function request(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
}

function App() {
    const [tickets, setTickets] = useState([]);
    const [code, setCode] = useState("");
    const [status, setStatus] = useState({ text: "", kind: "info" });
    const [busy, setBusy] = useState(false);

    const show = (text, kind = "info") => setStatus({ text, kind });

    const getTickets = useCallback(async () => {
        try {
            setTickets(await request(API_URL));
        } catch {
            show("Could not connect to the server. It may be waking up; try Refresh in a moment.", "error");
        }
    }, []);

    // Runs one action at a time, shows its result and reloads the list.
    const run = async (action) => {
        setBusy(true);
        try {
            show(await action(), "success");
        } catch (error) {
            show(error.message, "error");
        } finally {
            setBusy(false);
            getTickets();
        }
    };

    const createTicket = () =>
        run(async () => {
            const data = await request(API_URL, { method: "POST" });
            return `New ticket: ${data.code}`;
        });

    const useTicket = (event) => {
        event.preventDefault();
        if (!code.trim()) return;
        run(async () => {
            const data = await request(`${API_URL}/use`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim() }),
            });
            setCode("");
            return data.message;
        });
    };

    const deleteTicket = (id) =>
        run(async () => (await request(`${API_URL}/${id}`, { method: "DELETE" })).message);

    useEffect(() => {
        getTickets();
    }, [getTickets]);

    const unused = tickets.filter((t) => !t.used).length;

    return (
        <main className="container">
            <header>
                <h1>Ticket System</h1>
                <p className="muted">Create one-time ticket codes and check them in at the door.</p>
            </header>

            <section className="card">
                <h2>Create a ticket</h2>
                <button className="primary" onClick={createTicket} disabled={busy}>
                    Create ticket
                </button>
            </section>

            <section className="card">
                <h2>Use a ticket</h2>
                <form onSubmit={useTicket} className="row">
                    <label htmlFor="code" className="sr-only">Ticket code</label>
                    <input
                        id="code"
                        type="text"
                        placeholder="Ticket code, e.g. 3FA9C2B1"
                        value={code}
                        maxLength={8}
                        autoComplete="off"
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                    <button className="primary" type="submit" disabled={busy || !code.trim()}>
                        Use ticket
                    </button>
                </form>
            </section>

            {status.text && (
                <p className={`status ${status.kind}`} role="status">
                    {status.text}
                </p>
            )}

            <section className="card">
                <div className="row spread">
                    <h2>
                        Tickets <span className="muted">({tickets.length} total, {unused} unused)</span>
                    </h2>
                    <button onClick={getTickets} disabled={busy}>Refresh</button>
                </div>

                {tickets.length === 0 ? (
                    <p className="muted">No tickets yet. Create the first one above.</p>
                ) : (
                    <ul className="tickets">
                        {tickets.map((ticket) => (
                            <li key={ticket.id}>
                                <code>{ticket.code}</code>
                                <span className={`badge ${ticket.used ? "used" : "unused"}`}>
                                    {ticket.used ? "Used" : "Not used"}
                                </span>
                                {!ticket.used && (
                                    <button
                                        className="danger"
                                        onClick={() => deleteTicket(ticket.id)}
                                        disabled={busy}
                                        aria-label={`Delete ticket ${ticket.code}`}
                                    >
                                        Delete
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}

export default App;
