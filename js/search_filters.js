$(document).ready(function() {
    // Define filter categories and options
    const filters = {
        genre: ['Jump','Stream','Stamina','Tech'], 
        difficulty: ['Easy', 'Hard','Apocrypha'], 
        popular: ['5 Likes+', "10 Likes+", "etc"]
    };

    // Dynamically create genre label and checkboxes
    const genreContainer = $('#genre-filters');
    genreContainer.append('<label>Genre:</label>'); // Add label for genre
    const genreList = $('<div></div>').addClass('scrollable-list'); // Use the scrollable-list class
    filters.genre.forEach(function(genre) {
        genreList.append(`
            <div>
                <input type="checkbox" class="filter-checkbox" value="${genre}">
                <label>${genre}</label>
            </div>
        `);
    });
    genreContainer.append(genreList); // Append genre list to the genre container

    // Dynamically create difficulty checkboxes and labels
    const difficultyContainer = $('#difficulty-filters');
    difficultyContainer.append('<label>Difficulty:</label>'); // Add label for difficulty
    difficultyContainer.addClass('scrollable-list'); // Use the scrollable-list class
    filters.difficulty.forEach(function(difficulty) {
        difficultyContainer.append(`
            <div>
                <input type="checkbox" class="filter-checkbox" value="${difficulty}">
                <label>${difficulty}</label>
            </div>
        `);
    });

    const popularContainer = $('#popular-filters');
    popularContainer.append('<label>Popularity:</label>'); // Add label for difficulty
    popularContainer.addClass('scrollable-list'); // Use the scrollable-list class
    filters.popular.forEach(function(popular) {
        popularContainer.append(`
            <div>
                <input type="checkbox" class="filter-checkbox" value="${popular}">
                <label>${popular}</label>
            </div>
        `);
    });

    // Toggle filters container visibility
    $('#filter-button').click(function() {
        $('#filters-container').toggle(); // Show/hide filters
        updateFilterCount(); // Update filter count when filters are shown/hidden
    });

    // Update filter count when any checkbox is changed
    $('.filter-checkbox').change(function() {
        updateFilterCount();
    });

    // Function to update the filter count
    function updateFilterCount() {
        const selectedCount = $('.filter-checkbox:checked').length; // Count checked checkboxes
        $('#filter-count').text("[" + selectedCount + "]"); // Update the filter count
    }

    // Collect and pass filters when the form is submitted
    $('#search-form').submit(function(event) {
        event.preventDefault();  // Prevent form from submitting immediately
        
        const selectedGenres = [];
        const selectedDifficulties = [];
        const selectedPopular = [];

        // Collect selected filter values
        $('.filter-checkbox:checked').each(function() {
            const value = $(this).val();
            if (filters.genre.includes(value)) {
                selectedGenres.push(value);
            } else if (filters.difficulty.includes(value)) {
                selectedDifficulties.push(value);
            } else if (filters.popular.includes(value)) {
                selectedPopular.push(value);
            }
        });

        // Prepare the query string with separate parameters for each filter category
        const queryParams = new URLSearchParams();
        queryParams.set('query', $('input[name="query"]').val()); // Keep the search query
        if (selectedGenres.length) queryParams.set('genre', selectedGenres.join(','));
        if (selectedDifficulties.length) queryParams.set('difficulty', selectedDifficulties.join(','));
        if (selectedPopular.length) queryParams.set('popular', selectedPopular.join(','));

        // Update the form action with the new query string
        window.location.href = `../search.html?${queryParams.toString()}`;

    });


});
