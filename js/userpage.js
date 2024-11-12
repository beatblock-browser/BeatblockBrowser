// Function to handle upvoting
import {runLoggedIn, showError} from "./authentication.js";
import {downloadMap, removeMap} from "./oneclick_communicator.js";
import {updateSongData, makeDownloadButton, makeUpvoteButton, getUser, deleteMap, ADMINS} from "./songdata.js";

// Function to display search results
async function displayUserdata() {
    const resultsContainer = document.getElementById('song-results');
    const template = document.getElementById('search-result-template');

    try {
        // Show a loading indicator (optional)
        resultsContainer.innerHTML = '<p>Loading songs...</p>';

        // Initialize the resolver outside the functions to make it accessible to both
        let finishUserLoad;

        // Create a Promise that Function A will await
        const finishedSearch = new Promise((resolve) => {
            finishUserLoad = resolve;
        });

        let user_id = window.location.user;
        if (user_id == null) {
            user_id = (await getUser()).id.id['String'];
        }
        let upvoted_list = runLoggedIn((id) => updateSongData(id, finishedSearch), () => {})
        // Fetch data from the /api/usersongs endpoint
        let response;
        try {
            response = await fetch(`/api/usersongs?user=${user_id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
        } catch (e) {
            console.log(e);
        }

        if (response != null && response.status === 429) {
            resultsContainer.innerHTML = '';
            showError('Please stop spamming page reloads!');
            return
        }

        if (response == null || !response.ok) {
            resultsContainer.innerHTML = '';
            showError('Failed to find user songs, see console log');
            return
        }

        const searchResult = await response.json();
        const beatMaps = searchResult.results;

        // Clear previous results
        resultsContainer.innerHTML = '';

        if (beatMaps.length > 0) {
            beatMaps.forEach(map => {
                // Clone the template
                const clone = template.content.cloneNode(true);
                clone.querySelector('.card').classList.add("map-" + map.id.id['String']);
                // Populate the clone with actual data
                clone.querySelector('.card-title').textContent = map.song;
                clone.querySelectorAll('.card-text')[0].textContent = map.artist;
                clone.querySelectorAll('.card-text')[1].textContent = map.charter;
                clone.querySelectorAll('.card-text')[2].textContent = map.difficulties.map(d => d.display).join(", ");
                if (map.image != null) {
                    clone.querySelector('img').src = 'output/' + map.image;
                } else {
                    clone.querySelector('img').src = 'beatblocks.jpg';
                }
                clone.querySelector('a.btn').href = 'output/' + map.download;
                makeDownloadButton(clone.querySelector('.oneclick'), map.id.id['String']);
                clone.querySelector('.oneclick').disabled = true;

                clone.querySelector('.upvote-count').textContent = map.upvotes;
                makeUpvoteButton(clone.querySelector('.upvote-button'), map.id.id['String']);
                clone.querySelector('.upvote-button').disabled = true;
                let deleteButton = clone.querySelector('.delete-button');
                deleteButton.classList.remove('invisible');
                deleteButton.onclick = async () => await deleteMap(map.id.id['String']);

                // Append the clone to the results container
                resultsContainer.appendChild(clone);
            });
        } else {
            // No results found
            resultsContainer.innerHTML = '';
        }

        const id = (await getUser()).id.id['String'];
        if (ADMINS.includes(id) || user_id == id) {
            document.querySelectorAll('.delete-button').forEach((element) => element.classList.remove('invisible'));
        }

        finishUserLoad()
        await upvoted_list;
    } catch (error) {
        console.error('Error fetching user songs:', error);
        resultsContainer.innerHTML = '';
        showError('An error occurred while fetching user data. Please try again later.');
    }
}

// Initialize search results on page load
document.addEventListener('FinishInline', async function () {
    await displayUserdata();
});