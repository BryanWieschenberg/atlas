import autocannon from "autocannon";

const requests = [];
for (let i = 0; i < 1000; i++) {
    if (Math.random() > 0.25) {
        requests.push({ method: "GET", path: "/api/graph?limit=1000&keyword=neural" });
    } else {
        requests.push({
            method: "GET",
            path: `/api/graph?limit=1000&keyword=biology&random=${Math.random()}`,
        });
    }
}

// eslint-disable-next-line no-console
console.log("Starting Autocannon Load Test...");

const instance = autocannon(
    {
        url: "http://localhost:3000",
        connections: 10,
        duration: 30,
        requests: requests,
    },
    (err) => {
        if (err) {
            console.error("Test failed:", err);
            return;
        }
    },
);

autocannon.track(instance, { renderProgressBar: true });
