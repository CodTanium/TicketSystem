// API tests with Node's built-in test runner: npm test
process.env.DB_PATH = ":memory:";
process.env.NODE_ENV = "test";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../app");

let server;
let base;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => server.close());

const post = (path, body) =>
    fetch(base + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

test("health check answers ok", async () => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "ok" });
});

test("a new ticket gets an 8-character code and is unused", async () => {
    const res = await post("/tickets");
    assert.equal(res.status, 201);
    const ticket = await res.json();
    assert.match(ticket.code, /^[0-9A-F]{8}$/);
    assert.equal(ticket.used, false);
});

test("a ticket can be used once, the second time is refused", async () => {
    const { code } = await (await post("/tickets")).json();

    const first = await post("/tickets/use", { code });
    assert.equal(first.status, 200);

    const second = await post("/tickets/use", { code });
    assert.equal(second.status, 409);
    assert.equal((await second.json()).error, "Ticket has already been used");
});

test("using the same ticket at the same time succeeds exactly once", async () => {
    const { code } = await (await post("/tickets")).json();
    const results = await Promise.all(Array.from({ length: 10 }, () => post("/tickets/use", { code })));
    const ok = results.filter((r) => r.status === 200).length;
    assert.equal(ok, 1);
});

test("codes are case-insensitive and trimmed", async () => {
    const { code } = await (await post("/tickets")).json();
    const res = await post("/tickets/use", { code: `  ${code.toLowerCase()}  ` });
    assert.equal(res.status, 200);
});

test("bad input is refused with a clear error", async () => {
    assert.equal((await post("/tickets/use", {})).status, 400);
    assert.equal((await post("/tickets/use", { code: "nope" })).status, 400);
    assert.equal((await post("/tickets/use", { code: "ABCDEF12" })).status, 404);
    assert.equal((await fetch(`${base}/tickets/abc`, { method: "DELETE" })).status, 400);
});

test("unused tickets can be deleted, used ones are kept", async () => {
    const unused = await (await post("/tickets")).json();
    const del = await fetch(`${base}/tickets/${unused.id}`, { method: "DELETE" });
    assert.equal(del.status, 200);

    const used = await (await post("/tickets")).json();
    await post("/tickets/use", { code: used.code });
    const keep = await fetch(`${base}/tickets/${used.id}`, { method: "DELETE" });
    assert.equal(keep.status, 404);
});

test("the list shows newest first", async () => {
    const a = await (await post("/tickets")).json();
    const b = await (await post("/tickets")).json();
    const list = await (await fetch(`${base}/tickets`)).json();
    const ids = list.map((t) => t.id);
    assert.ok(ids.indexOf(b.id) < ids.indexOf(a.id));
});
