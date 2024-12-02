// Function to handle upvoting
import {sendRequest, showError} from "./authentication.js";
import {
    updateSongData,
    getUser,
    updateSongCard
} from "./songdata.js";

// Function to display search results
async function displayUserdata() {
    const resultsContainer = document.getElementById('song-results');
    const template = document.getElementById('search-result-template');

    try {
        // Show a loading indicator (optional)
        resultsContainer.innerHTML = '<p>Loading songs...</p>';

        let user = await getUser();

        if (user == null) {
            showError("You must be signed in to view this page.")
            return
        }

        if (user.links.some(link => link.hasOwnProperty('google'))) {
            document.getElementById('googleSignInBtn').textContent = `Account Sync'd`;
        } else {
            document.getElementById('googleSignInBtn').classList.remove('disabled');
        }

        if (user.links.some(link => link.hasOwnProperty('discord'))) {
            document.getElementById('discordSignInBtn').textContent = `Account Sync'd`;
        }

        // Fetch data from the /api/usersongs endpoint
        let searchResult = await sendRequest(`/api/usersongs/${user.id}`, null);
        resultsContainer.innerHTML = '';
        if (!searchResult) {
            return
        }
        const beatMaps = searchResult.results;

        if (beatMaps.length > 0) {
            beatMaps.forEach(map => {
                const clone = template.content.cloneNode(true);
                updateSongCard(clone, map)
                resultsContainer.appendChild(clone);
            });
        } else {
            // No results found
            resultsContainer.innerHTML = '';
        }

        //if (ADMINS.includes(user.id) || user_id === id) {
            document.querySelectorAll('.delete-button').forEach((element) => element.classList.remove('invisible'));
        //}

        updateSongData(user)
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