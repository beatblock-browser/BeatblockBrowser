export async function downloadMap(button, map) {
    console.log("Starting server to download!")
    const socket = try_or_redirect(function () {
        socket.send(`{"Download":"${map}"}`);
    });

    socket.onmessage = function (event) {
        alert(event.data);
    }
}

export async function removeMap(button, map) {
    console.log("Starting server to download!")
    const socket = try_or_redirect(function () {
        socket.send(`{"Remove":"${map}"}`);
    });

    socket.onmessage = function (event) {
        alert(event.data);
    }
}

async function try_or_redirect(onopen) {
    window.open("beatblockbrowser://launch", "_self")
    const socket = new WebSocket("ws://127.0.0.1:61523");

    const connectionTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
            socket.close(); // Close the WebSocket connection if not already closed
            window.location.href = "../oneclick.html"; // Redirect the user
        }
    }, 2000);

    socket.onopen = function () {
        clearTimeout(connectionTimeout);
        onopen();
    }

    return socket
}