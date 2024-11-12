import {runLoggedIn, showError} from './authentication.js';

document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    const uploadForm = document.getElementById('uploadForm');
    const submitButton = document.getElementById('submitButton');
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = 'Uploading...';

    try {
        const formData = new FormData(uploadForm);

        if (formData.get('beatmap').size > 20000000) {
            showError('ZIP size over 20MB limit.');
            submitButton.disabled = false;
            submitButton.textContent = 'Upload';
            return
        }

        await runLoggedIn(async function (idToken) {
            formData.set('firebaseToken', idToken);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.text();

            if (response.ok) {
                uploadForm.reset();
                window.location.href = 'search.html?' + result;
            } else {
                console.error('Error uploading: ', response)
                showError(result || 'An error occurred during upload.');
            }
        })
    } catch (error) {
        // Network or other errors
        console.error('Upload error:', error);
        showError('Failed to upload BeatMap. Please try again later.');
    } finally {
        // Re-enable the submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Upload BeatMap';
    }
});