/**
 * Automatically replaces the header id with the header navbar,
 * and the footer id with the footer.
 * Prevents me having to write the same code on a bunch of pages.
 */
const event = new Event("FinishInline");
window.fired = false;

$(document).ready(function () {
    load_if_real('#navbar', 'navbar.html');
    load_if_real('#searchbar', 'searchbar.html');
    load_if_real('#footer', 'footer.html');
    load_if_real('#delete-confirm', 'delete_confirm.html');
    load_if_real('#search-result-template', 'search_result.html', function () {
        document.dispatchEvent(event);
        window.fired = true;
    });
    if ($('#search-result-template').length == 0) {
        document.dispatchEvent(event);
        window.fired = true;
    }
    load_if_real('#search-result-template-long', 'search_result.html', function () {
        $(this).children()[0].classList.remove('col-md-6');
    });
    addPaginationToContent();
});

function load_if_real(name, file, callback = function () {}) {
    const element = $(name);
    if (element.length > 0) {
        element.load("templates/" + file, callback);
    }
}

// Function to add pagination to the content
function addPaginationToContent() {
    // Select all content sections to paginate
    const contentSections = $('.page');
    
    // If no content sections are found, exit
    if (contentSections.length === 0) return;

    // Insert pagination controls only once
    if ($('#pagination-controls').length === 0) {
        const paginationHtml = `
            <div class="pagination" id="pagination-controls">
                <button class="page-btn" id="prevBtn">Previous</button>
                <span id="pageNumber">Page 1</span>
                <button class="page-btn" id="nextBtn">Next</button>
                <input type="number" id="pageInput" class="page-input" min="1" max="${contentSections.length}" placeholder="Go to page"/>
            </div>
        `;
        // Append the pagination controls to the bottom of the page body
        $('body').append(paginationHtml);
    }

    let currentPage = 1;
    const totalPages = contentSections.length;
    const prevBtn = $('#prevBtn');
    const nextBtn = $('#nextBtn');
    const pageNumber = $('#pageNumber');
    const pageInput = $('#pageInput');

    // Function to show the current page and hide others
    function showPage(pageNum) {
        //console.log(`Showing page: ${pageNum}`); // Debug
        contentSections.removeClass('visible'); // Hide all content sections
        contentSections.eq(pageNum - 1).addClass('visible'); // Show the current page
        pageNumber.text(`Page ${pageNum}`);
        pageInput.val(pageNum); // Update input field with the current page
    }

    // Initialize the first page
    showPage(currentPage);

    // Next button functionality
    nextBtn.on('click', function () {
        if (currentPage < totalPages) {
            currentPage++;
            showPage(currentPage);
        }
    });

    // Previous button functionality
    prevBtn.on('click', function () {
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
        }
    });

    // Functionality for jumping to a specific page
    pageInput.on('input', function () {
        const inputPage = parseInt(pageInput.val());
        if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= totalPages) {
            currentPage = inputPage;
            showPage(currentPage);
        }
    });
}
