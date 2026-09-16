import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [tickets, setTickets] = useState([]);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");

    const API_URL = "http://localhost:3000/api/tickets";


    // GET TICKETS
    const getTickets = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            setTickets(data);
        } catch (error) {
            setMessage("Could not connect to server");
        }
    };


    // CREATE TICKET
    const createTicket = async () => {
        try {
            const response = await fetch(API_URL, {
                method: "POST"
            });

            const data = await response.json();

            setMessage(`New ticket: ${data.code}`);

            getTickets();
        } catch (error) {
            setMessage("Could not create ticket");
        }
    };


    // USE TICKET
    const useTicket = async () => {
        try {
            const response = await fetch(`${API_URL}/use`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: code
                })
            });

            const data = await response.json();

            setMessage(data.message || data.error);

            setCode("");

            getTickets();
        } catch (error) {
            setMessage("Could not use ticket");
        }
    };


    // DELETE TICKET
    const deleteTicket = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            setMessage(data.message || data.error);

            getTickets();
        } catch (error) {
            setMessage("Could not delete ticket");
        }
    };


    useEffect(() => {
        getTickets();
    }, []);


    return (
        <div className="container">

            <h1>Ticket System</h1>

            <section>
                <h2>Create Ticket</h2>

                <button onClick={createTicket}>
                    Create ticket
                </button>
            </section>


            <section>
                <h2>Use Ticket</h2>

                <input
                    type="text"
                    placeholder="Enter ticket code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <button onClick={useTicket}>
                    Use ticket
                </button>
            </section>


            <p>{message}</p>


            <section>
                <h2>Tickets</h2>

                <button onClick={getTickets}>
                    Refresh
                </button>

                <ul>
                    {tickets.map(ticket => (
                        <li key={ticket.id}>

                            {ticket.code} -

                            {ticket.used
                                ? " Used"
                                : " Not used"
                            }

                            {!ticket.used && (
                                <button
                                    onClick={() => deleteTicket(ticket.id)}
                                >
                                    Delete
                                </button>
                            )}

                        </li>
                    ))}
                </ul>
            </section>

        </div>
    );
}

export default App;