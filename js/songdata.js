import {sendRequest, showError} from "./authentication.js";
import {downloadMap, removeMap} from "./oneclick_communicator.js";

export const ADMINS = ["gfde6dkqtey5trmfya8h"];

export function updateSongCard(clone, map) {
    clone.querySelector('.card').classList.add("map-" + map.id);
    // Populate the clone with actual data
    clone.querySelector('.card-title').textContent = map.song;
    clone.querySelectorAll('.card-text')[0].textContent = map.artist;
    clone.querySelectorAll('.card-text')[1].textContent = map.charter;
    clone.querySelectorAll('.card-text')[2].textContent = map.difficulties.map(d => d.display).join(", ");
    if (map.image) {
        clone.querySelector('img').src = 'https://beatmap-browser.s3.amazonaws.com/' + map.id + '.png';
    } else {
        clone.querySelector('img').src = 'beatblocks.jpg';
    }
    clone.querySelector('a.btn').href = 'https://beatmap-browser.s3.amazonaws.com/' + map.id + '.zip';
    makeDownloadButton(clone.querySelector('.oneclick'), map.id);
    clone.querySelector('.oneclick').disabled = true;

    clone.querySelector('.upvote-count').textContent = map.upvotes;
    makeUpvoteButton(clone.querySelector('.upvote-button'), map.id);
    clone.querySelector('.upvote-button').disabled = true;
    clone.querySelector('.delete-button').onclick = async () => await deleteMap(map.id);
}

export function makeUpvoteButton(button, map_id) {
    button.classList.remove('btn-success');
    button.classList.add('btn-outline-light');

    button.onclick = async function () {
        let count = button.querySelector('.upvote-count')
        count.textContent = parseInt(count.textContent, 10) + 1;

        button.disabled = true;
        if (await sendRequest('/api/upvote', {'mapId': map_id})) {
            makeUnvoteButton(button, map_id);
        }
    };
    button.disabled = false;
}

export function makeUnvoteButton(button, map_id) {
    button.classList.remove('btn-outline-light');
    button.classList.add('btn-success');

    button.onclick = async () => {
        let count = button.querySelector('.upvote-count')
        count.textContent = parseInt(count.textContent, 10) - 1;

        button.disabled = true;
        if (await sendRequest('/api/unvote', {'mapId': map_id})) {
            makeUpvoteButton(button, map_id);
        }
    }
    button.disabled = false;
}

export function makeDownloadButton(button, map_id) {
    button.textContent = 'Oneclick';
    button.classList.remove('btn-danger');
    button.classList.add('btn-primary');
    button.onclick = async () => {
        button.disabled = true;
        if (await sendRequest('/api/download', {'mapId': map_id})) {
            await downloadMap(button, map_id);
            makeRemoveButton(button, map_id);
        }
    }
    button.disabled = false;
}

export function makeRemoveButton(button, map_id) {
    button.textContent = 'Remove';
    button.classList.remove('btn-primary');
    button.classList.add('btn-danger');

    button.onclick = async function () {
        button.disabled = true;
        if (await sendRequest('/api/remove', {'mapId': map_id})) {
            await removeMap(button, map_id)
            makeDownloadButton(button, map_id);
        }
    }
    button.disabled = false;
}

let user;

export async function getUser() {
    let token = localStorage.getItem('authToken');
    if (user == null && token != null) {
        user = await sendRequest(`/api/account_data`, {}, () => {});
    }
    return user;
}

export function updateSongData(user) {
    let upvotes = user.upvoted;
    for (let i = 0; i < upvotes.length; i++) {
        let element = upvotes[i];
        let map = document.querySelector(`.map-${element}`);
        if (map != null) {
            makeUnvoteButton(map.querySelector('.upvote-button'), element);
        }
    }

    let downloaded = user.downloaded;
    for (let i = 0; i < downloaded.length; i++) {
        let element = downloaded[i];
        let map = document.querySelector(`.map-${element}`);
        if (map != null) {
            makeRemoveButton(map.querySelector('.oneclick'), element);
        }
    }

    document.querySelectorAll('.slow-loader').forEach((element) => element.disabled = false);
}

export async function deleteMap(id) {
    let shouldDelete;
    let deleting = false;

    // Create a Promise that Function A will await
    const waitForConfirm = new Promise((resolve) => {
        shouldDelete = resolve;
    });

    document.getElementById('cancelDeleteButton').onclick = async function () {
        await shouldDelete();
    }

    document.getElementById('confirmDeleteButton').onclick = async function () {
        deleting = true;
        await shouldDelete();
    }

    await waitForConfirm;

    if (!deleting) {
        return;
    }

    if (await sendRequest('/api/delete', {'mapId': id})) {
        document.querySelector(`.map-${id}`).remove();
    }
}