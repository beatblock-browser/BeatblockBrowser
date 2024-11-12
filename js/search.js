// Function to handle upvoting
import {runLoggedIn, showError} from "./authentication.js";
import {downloadMap, removeMap} from "./oneclick_communicator.js";
import {updateSongData, makeDownloadButton, makeUpvoteButton, deleteMap, getUser, ADMINS} from "./songdata.js";

// Function to display search results
async function displaySearchResults() {
    const resultsContainer = document.getElementById('search-results');
    const noResultsContainer = document.getElementById('no-results');
    const template = document.getElementById('search-result-template');

    try {
        // Show a loading indicator (optional)
        resultsContainer.innerHTML = '<p>Loading results...</p>';

        // Initialize the resolver outside the functions to make it accessible to both
        let finishSearchResolve;

        // Create a Promise that Function A will await
        const finishedSearch = new Promise((resolve) => {
            finishSearchResolve = resolve;
        });

        let upvoted_list = runLoggedIn((id) => updateSongData(id, finishedSearch), () => {})

        // Fetch data from the /api/search endpoint
        let response;
        try {
            response = await fetch(`/api/search${window.location.search}`, {
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
            showError('Please stop spamming search requests!');
            return
        }

        if (response == null || !response.ok) {
            resultsContainer.innerHTML = '';
            showError('Failed to search, see console log');
            return
        }

        const searchResult = await response.json();
        document.getElementById('search-query').textContent = searchResult.query;
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
                clone.querySelector('.delete-button').onclick = async () => await deleteMap(map.id.id['String']);

                // Append the clone to the results container
                resultsContainer.appendChild(clone);
            });
        } else {
            // No results found
            noResultsContainer.classList.remove('invisible');
            resultsContainer.innerHTML = '';
        }

        finishSearchResolve()
        await upvoted_list;
        if (ADMINS.includes((await getUser()).id.id['String'])) {
            document.querySelectorAll('.delete-button').forEach((element) => element.classList.remove('invisible'));
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
        resultsContainer.innerHTML = '';
        showError('An error occurred while fetching search results. Please try again later.');
    }
}

// Initialize search results on page load
document.addEventListener('FinishInline', async function () {
    await displaySearchResults();
});