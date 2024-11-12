/**
 * Automatically replaces the header id with the header navbar,
 * and the footer id with the footer.
 * Prevents me having to write the same code on a bunch of pages.
 */
const event = new Event("FinishInline");
$(document).ready(function () {
    load_if_real('#navbar', 'navbar.html');
    load_if_real('#searchbar', 'searchbar.html');
    load_if_real('#footer', 'footer.html');
    load_if_real('#delete-confirm', 'delete_confirm.html');
    load_if_real('#search-result-template', 'search_result.html', function () {
        document.dispatchEvent(event);
    });
    if ($('#search-result-template').length == 0) {
        document.dispatchEvent(event);
    }
    load_if_real('#search-result-template-long', 'search_result.html', function () {
        $(this).children()[0].classList.remove('col-md-6');
    });
});

function load_if_real(name, file, callback = function () {}) {
    const element = $(name);
    if (element.length > 0) {
        element.load("templates/" + file, callback);
    }
}