/**
 * Favicon links
 *
 * Based on work done by:
 *  - Petko Yotov (extlink-favicons.js), pmwiki.org/petko
 *
 * In one big 'ol file for simplicity.
 */

/**
 * The expected ID of the script tag providing this script.
 */
const SCRIPT_ID = 'favicon-links';

/**
 * Utilize a proxy to get around CORS errors.
 */
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

/**
 * Time delay, in ms, between requests for favicons.
 */
const THROTTLE_MS = 50;

/**
 * Favicon providers of which the script is aware.
 */
enum FaviconProvider {
  DUCKDUCKGO = 'duckduckgo',
  GOOGLE = 'google',
  YANDEX = 'yandex',
}

/**
 * The "null" value returned by favicon provider services when theycannot find
 * the favicon.
 *
 * These were discovered manually and I'm mostly-confident they're correct.
 */
const FaviconProviderDefault: {[key in FaviconProvider]: string} = {
  [FaviconProvider.DUCKDUCKGO]: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACSElEQVRoQ+2avU7DMBCAfc7IC/QxYKc73XmBzrHMXma64zpzd8ReZspeHqAP0AeAMT50VVylIX9N7QRXRIoqNbF9n+/Hd3aAObiUUjcAcA0A9DtijNFddu0Qke4NIn5KKTfnDg9dOyChOecTxtgYAK669IOI34yxtTFm1RXmZIBM8CnNeBehq9qQRowxy1NBWgMkSTJCRAkAty4FL/aFiB8AoOI43rUZpxWAUmrMOZ91NZU2guTfIdMyxsyllOumto0AWmua9fumjnw8R8RXIYSq67sWQGtNs37nQ7i2fSLimxBiXvV+JcBfEN4KXQdRCjCk2dREqVJz+gVADhtF0VNbFff5Xpqmj0XHPgLIQuWyr2hzKjxFJwCY5kPsEYDWeu47zp8qdNk6IYSY2f8PALTCRlH0fO4A1B4Rt4yxra8Ilqbpg12xDwBaa+UiPSDhAUDGcfzlK5JR2iGEkDRZewBXs58X3mrSF4TVwh7AxSBlwvuEsGuDBVidG3maVkwXk1TMl4QQE3BlPpnz1i77riHIjGCxWEw551MX0advCKofwFX0Kai3F01QNIIkSV5qatjOiunJJ3YE8N5ZyoaGfUB4BejDJ7wD+Ib4B2jyH99+4FUDvoXfJ3PBh9HgF7LgU4ngk7msHgg3nb6IgsaVGQ1WUmZaCLeod1nYD7atkmkh3I0tAgh+azEzpXA3d3P7OIOdylRlt1WnNZd5wOFzR62pfig+b0rJL/uQz85G0MesFiLog+68XQb7qUHRuYL92KMsigz5uc0PwApGxRM8pM8AAAAASUVORK5CYII=",
  [FaviconProvider.GOOGLE]: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACqklEQVQ4T2NkoBAwwvSHhq7ifPnrtYi1iZLp719/st9/+G7y8dMPHpA8Hy/HF0EBzjNs7CxTj565d1qcTfTN6tVh30FyYANAmr/8fi+loiae+uXrTz8VRWExOSUh4V+//zKwsTIzKMoJM+zefePtg0fvX/Hxsm26c+v1bB5WwWcgQ8AG2PlPldVXl87+9v1PlJaOmKyivDADNxcbg5GuDMPXb78Y5KX4GJ6//sZw+cYzhmXLzz7m42ZbdvH286mHNmY/BhtQ2bw96Nnzjy2pSZaar958AfuKlZUZTOtqSIIN+PuPgeHQqftgJ89fdPK6tJRATXut5zqwAcU1m/fycLPp15a5CW/afQ0lWJ1t1Bj4uFkYPn39w7D3yC0GJTkhhjXrLr79+v3Xxf5WP2ewAUk5qz4mJZjz6WpIgRXBAEwziA9ywc17bxhu3n3FICbCwzBn3olPC6aF84MNCI5b+LejyY9JRV6AYdfhOwwykgJgDLIZGew/cZ/hw8fvDCCLyms2/lu3JIEZbsDknhAmSVEusFNPnHsADkARAQ4MA0CBqqEszlBWs/HfepgBidkrPyYnWvBZG8vBNRw9+wjOVpITYQAZDgJvPvwAe2P23OOfFk6PgHgBFogNFW7CMF2wQIPxpSUFGMz0pMDciobtb3/9+nOxvx0aiBWN2wOfv/jYmppsqQlzBboBII1+rloMJ84/Ypg559h1aUmB6o56z/VICUky+9OXX1GpSZayMEPuPPwATjyQ9CDF8PLNJ4aZs489FuBlR01IiKQsmvrx808/GUl+MS8vbeHfv/8y3Hv0luHXr78Mj++/f/v42YdXAjzsm+7cQUvKsPwAykxWRkomP3/9znn//rvJp88/eP7//w/OTMJCXKe5OFimnDpz/yw/emZCiSsSOQBeSzog3zDfJwAAAABJRU5ErkJggg==",
  [FaviconProvider.YANDEX]: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=",
};

/**
 * Adds listener for DOMContentLoaded which then triggers the favicon-ization.
 */
function initialize(): void {
  document.addEventListener('DOMContentLoaded', () => {
    const scriptElement = document.getElementById(SCRIPT_ID);
    if (!scriptElement) {
      console.error(`FaviconLinks ERROR: Could not find script tag. Please add \`id="${SCRIPT_ID}"\` to the script element.`);
      return;
    }

    const selector = scriptElement.getAttribute('data-selector');
    if (!selector) {
      console.error(`FaviconLinks ERROR: Could not find selector. Please add \`data-selector="<your selector>"\` to the script element.`);
      return;
    }

    setFavicons(selector);

    const stylesheet = (() => {
      const style = document.createElement("style");
      style.appendChild(document.createTextNode(""));
      document.head.appendChild(style);
      return style.sheet;
    })();

    const setFaviconsVisible = () => {
      stylesheet.insertRule('a[data-favicon]::after {'
        + 'background-position: 0 center;'
        + 'background-repeat: no-repeat;'
        + 'background-size: 16px 16px !important;'
        + 'content: "";'
        + 'height: 16px;'
        + 'margin-left: 2px;'
        + 'padding-left: 16px;'
        + 'vertical-align: middle;'
        + 'width: 16px;'
        + '}', 0);
    };

    const faviconLinks = document.querySelectorAll(`${selector}[data-favicon]`);
    let numComplete = 0;
    faviconLinks.forEach((linkElement: Element) => {
      const hostname = (linkElement as HTMLAnchorElement).hostname;
      setDataUrlForFavicon(
        hostname,
        stylesheet,
        [
          FaviconProvider.DUCKDUCKGO,
          FaviconProvider.GOOGLE,
          FaviconProvider.YANDEX,
        ],
        () => {
          numComplete += 1;
          if (numComplete === faviconLinks.length) {
            setFaviconsVisible();
          }
        },
        THROTTLE_MS,
      );
    });
  });
}

/**
 * Sets favicons to all <a> matching the provided selector.
 */
function setFavicons(
  selector: string,
  externalOnly = true
): void {
  Array.prototype.slice.call(document.querySelectorAll(selector))
    .filter((linkElement: Element) => {
      // (Optional) Remove non-external links.
      const hostname = (linkElement as HTMLAnchorElement).hostname;
      return !(externalOnly && hostname === location.hostname);
    })
    .forEach((linkElement: Element) => {
      setFavicon(
        linkElement as HTMLAnchorElement,
      );
    });
}

/**
 * Sets the favicon url for the provided link element.
 */
function setFavicon(
  linkElement: HTMLAnchorElement,
): void {
  linkElement.setAttribute('data-favicon', linkElement.hostname);
}

/**
 * Specifies the background-image for favicons as data urls.
 */
function setDataUrlForFavicon(
    hostname: string,
    stylesheet: CSSStyleSheet,
    providerPrecedence: FaviconProvider[] = [],
    onComplete = () => {},
    throttleMs = 0,
): void {
  if (!providerPrecedence.length) {
    return;
  }

  /**
   * Conditionally invokes callback methods based on dataUrl found for provided
   * imageUrl.
   */
  const testDataUrl = (
    imageUrl: string,
    test: (dataUrl: string) => boolean,
    onPass: (dataUrl: string) => void,
    onFail: (dataUrl: string) => void,
  ) => {
    // Use a timeout as a courtesy to the proxy server.
    window.setTimeout(() => {
      toDataUrl(imageUrl, (dataUrl: string) => {
        test(dataUrl) ? onPass(dataUrl) : onFail(dataUrl);
      });
    }, throttleMs);
  };

  /**
   * Recurses through specified providerPrecedence and sets background-image
   * when a dataUrl is found which doesn't match the associated provider's
   * default.
   */
  const inner = (providerIndex: number) => {
    if (providerIndex >= providerPrecedence.length) {
      onComplete();
      return;
    }

    const provider = providerPrecedence[providerIndex];
    let faviconUrl = getFaviconUrl(hostname, provider);
    if (!faviconUrl) {
      console.error(`FaviconLinks ERROR: No favicon URL found for hostname "${hostname}" and provider "${provider}".`);
      return;
    }

    testDataUrl(
      PROXY_URL + faviconUrl,
      (dataUrl) => dataUrl !== FaviconProviderDefault[provider],
      (dataUrl) => {
        stylesheet.insertRule(`a[data-favicon="${hostname}"]::after {`
          + `background-image: url("${dataUrl}");`
          + `}`, 0);
        onComplete();
      },
      (dataUrl) => {
        inner(providerIndex + 1);
      },
    );
  };

  inner(/* providerIndex= */ 0);
}

/**
 * Returns the formatted favicon URL for the specified provider.
 */
function getFaviconUrl(hostname: string, provider: FaviconProvider): string|null {
  if (provider === FaviconProvider.GOOGLE) {
    return `https://www.google.com/s2/favicons?domain=${hostname}`;
  } else if (provider === FaviconProvider.YANDEX) {
    return `https://favicon.yandex.net/favicon/${hostname}`;
  } else if (provider === FaviconProvider.DUCKDUCKGO) {
    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
  }

  return null;
}

/**
 * Converts an image to a dataURL
 * @url   https://gist.github.com/HaNdTriX/7704632/
 * @docs  https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement#Methods
 * @author HaNdTriX
 * @example
 *
 *   toDataUrl('http://goo.gl/AOxHAL', function(base64Img){
 *     console.log('IMAGE:',base64Img);
 *   })
 *
 */
function toDataUrl(imageUrl: string, callback = (dataUrl: string) => {}, outputFormat = 'image/png'): void {
  // Create an Image object
  const img = new Image();
  // Add CORS approval to prevent a tainted canvas
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    // Create an html canvas element
    let canvas = document.createElement('canvas') as HTMLCanvasElement;
    // Create a 2d context
    const ctx = canvas.getContext('2d');
    // Resize the canavas to the original image dimensions
    canvas.height = img.naturalHeight;
    canvas.width = img.naturalWidth;
    // Draw the image to a canvas
    ctx.drawImage(img, 0, 0);
    // Convert the canvas to a data url
    const dataURL = canvas.toDataURL(outputFormat);
    // Return the data url via callback
    callback(dataURL);
    // Mark the canvas to be ready for garbage
    // collection
    canvas = null;
  };

  // Load the image
  img.src = imageUrl;

  // Make sure the load event fires for cached images too
  if (img.complete || img.complete === undefined) {
    // Flush cache
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    // Try again
    img.src = imageUrl;
  }
}

initialize();
