import {runLoggedIn, showError} from "./authentication.js";

export const ADMINS = ["gfde6dkqtey5trmfya8h"];

export function makeUpvoteButton(button, map_id) {
    button.classList.remove('btn-success');
    button.classList.add('btn-outline-light');

    button.onclick = async function() {
        let count = button.querySelector('.upvote-count')
        count.textContent = parseInt(count.textContent, 10)+1;

        button.disabled = true;
        await runLoggedIn(async function (idToken) {
            const response = await fetch('/api/upvote', {
                method: 'POST',
                body: JSON.stringify({
                    'firebaseToken': idToken,
                    'mapId': map_id
                })
            });
            const result = await response.text();

            if (response.ok) {
                makeUnvoteButton(button, map_id);
            } else {
                console.error('Error upvoting: ', response)
                showError(result || 'An error occurred when upvoting.');
            }
        });
    };
    button.disabled = false;
}

export function makeUnvoteButton(button, map_id) {
    button.classList.remove('btn-outline-light');
    button.classList.add('btn-success');

    button.onclick = async () => {
        let count = button.querySelector('.upvote-count')
        count.textContent = parseInt(count.textContent, 10)-1;

        button.disabled = true;
        await runLoggedIn(async function (idToken) {
            const response = await fetch('/api/unvote', {
                method: 'POST',
                body: JSON.stringify({
                    'firebaseToken': idToken,
                    'mapId': map_id
                })
            });
            const result = await response.text();

            if (response.ok) {
                makeUpvoteButton(button, map_id);
            } else {
                console.error('Error unvoting: ', response)
                showError(result || 'An error occurred when removing your upvote.');
            }
        });
    }
    button.disabled = false;
}

export function makeDownloadButton(button, map_id) {
    button.textContent = 'Oneclick';
    button.classList.remove('btn-danger');
    button.classList.add('btn-primary');
    button.onclick = async () => {
        button.disabled = true;
        await runLoggedIn(async function (idToken) {
            const response = await fetch('/api/download', {
                method: 'POST',
                body: JSON.stringify({
                    'firebaseToken': idToken,
                    'mapId': map_id
                })
            });
            const result = await response.text();

            if (response.ok) {
                makeRemoveButton(button, map_id);
            } else {
                console.error('Error syncing downloading: ', response)
                showError(result || 'An error occurred when syncing downloading.');
            }
        });
        await downloadMap(button, map_id);
    }
    button.disabled = false;
}

export function makeRemoveButton(button, map_id) {
    button.textContent = 'Remove';
    button.classList.remove('btn-primary');
    button.classList.add('btn-danger');

    button.onclick = async function() {
        button.disabled = true;
        await runLoggedIn(async function (idToken) {
            const response = await fetch('/api/remove', {
                method: 'POST',
                body: JSON.stringify({
                    'firebaseToken': idToken,
                    'mapId': map_id
                })
            });
            const result = await response.text();

            if (response.ok) {
                makeDownloadButton(button, map_id);
            } else {
                console.error('Error syncing removing: ', response)
                showError(result || 'An error occurred when syncing removing.');
            }
        });
        await removeMap(button, map_id)
    }
    button.disabled = false;
}

var user;

function errorSignin() {
    console.log("Not signed in!");
    showError('This action requires being signed in!');
}

export async function getUser(errorCallback = errorSignin) {
    if (user == null) {
        try {
            await runLoggedIn(async function (idToken) {
                let temp = await fetch(`/api/account_data`, {
                    method: 'POST',
                    body: JSON.stringify({
                        'firebaseToken': idToken,
                    })
                });
                user = await temp.json();
                console.log("Loaded user ", user.id);
            }, errorCallback);
        } catch (e) {
            errorCallback(e);
            console.log("Error fetching user data: ", e);
        }
    }
    return user;
}

export async function updateSongData(idToken, finishedLoad) {
    try {
        await finishedLoad;

        let user = await getUser();
        let upvotes = user.upvoted;
        for (let i = 0; i < upvotes.length; i++) {
            let element = upvotes[i];
            let map = document.querySelector(`.map-${element.id['String']}`);
            if (map != null) {
                makeUnvoteButton(map.querySelector('.upvote-button'), element);
            }
        }

        let downloaded = user.downloaded;
        for (let i = 0; i < downloaded.length; i++) {
            let element = downloaded[i];
            let map = document.querySelector(`.map-${element.id['String']}`);
            if (map != null) {
                makeRemoveButton(map.querySelector('.oneclick'), element.id['String']);
            }
        }

        document.querySelectorAll('.slow-loader').forEach((element) => element.disabled = false);
    } catch (e) {
        showError('An error occurred while fetching user data. Please report this!');
        console.log("Error fetching userd data: ", e);
    }
}



export async function deleteMap(id) {
    let shouldDelete;
    let deleting = false;

    // Create a Promise that Function A will await
    const waitForConfirm = new Promise((resolve) => {
        shouldDelete = resolve;
    });

    document.getElementById('cancelDeleteButton').onclick = async function() {
        await shouldDelete();
    }

    document.getElementById('confirmDeleteButton').onclick = async function() {
        deleting = true;
        await shouldDelete();
    }

    await waitForConfirm;

    if (!deleting) {
        return;
    }


    await runLoggedIn(async function (idToken) {
        let deleted = await fetch(`/api/delete`, {
            method: 'POST',
            body: JSON.stringify({
                'firebaseToken': idToken,
                'mapId': id
            })
        });
        let result = await deleted.text();
        if (deleted.ok) {
            document.querySelector(`.map-${id}`).remove();
        } else {
            console.error('Error deleting map: ', deleted);
            showError(result || 'An error occurred when deleting the map.');
        }
    });
}