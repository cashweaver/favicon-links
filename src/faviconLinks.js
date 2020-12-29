var DEFAULT_SELECTOR = 'a.extlink';
function initialize() {
    document.addEventListener('DOMContentLoaded', function () {
        var scriptElement = document.getElementById('favicon-links');
        if (!scriptElement) {
            addFavicons(DEFAULT_SELECTOR, {});
            return;
        }
        var selector = scriptElement.getAttribute('data-selector') || DEFAULT_SELECTOR;
        addFavicons(selector, {});
    });
}
function addFavicons(selector, linkCache) {
    document.querySelectorAll(selector).forEach(function (linkElement) {
        addFavicon(linkElement, linkCache);
    });
}
function addFavicon(linkElement, linkCache) {
    console.log('Adding favicon to', linkElement);
}
//# sourceMappingURL=faviconLinks.js.map