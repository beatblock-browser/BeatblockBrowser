// Function to handle upvoting
import {runLoggedIn, sendRequest, showError} from "./authentication.js";
import {downloadMap, removeMap} from "./oneclick_communicator.js";
import {updateSongData, updateSongCard, getUser, ADMINS} from "./songdata.js";

// Function to display search results
async function displaySearchResults() {
    const resultsContainer = document.getElementById('search-results');
    const noResultsContainer = document.getElementById('no-results');
    const template = document.getElementById('search-result-template');

    try {
        // Show a loading indicator (optional)
        resultsContainer.innerHTML = '<p>Loading results...</p>';

        const searchResult = await sendRequest(`/api/search/${new URLSearchParams(window.location.search).get('query')}`, null);
        if (!searchResult) {
            return;
        }

        document.getElementById('search-query').textContent = decodeURIComponent(searchResult.query);
        const beatMaps = searchResult.results;

        // Clear previous results
        resultsContainer.innerHTML = '';

        if (beatMaps.length > 0) {
            beatMaps.forEach(map => {
                // Clone the template
                const clone = template.content.cloneNode(true);
                updateSongCard(clone, map);
                // Append the clone to the results container
                resultsContainer.appendChild(clone);
            });
        } else {
            // No results found
            noResultsContainer.classList.remove('invisible');
            resultsContainer.innerHTML = '';
        }

        let user = await getUser();
        if (user == null) {
            return;
        }
        updateSongData(user)
        if (ADMINS.includes(user.id)) {
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