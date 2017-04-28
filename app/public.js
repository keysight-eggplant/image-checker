/**
 Copyright 2017 NCC Group PLC http://www.nccgroup.trust/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function() {
  const OVERLAY_CLASS = 'ncc-image-checker-overlay';
  const URL_CLASS = 'ncc-image-checker-url';
  const BACKGROUND_IMAGE_URL_REGEX = /url\((.*)\)/i;

  /**
   * Appends an overlay with images details over the whole web page
   *
   * @param {NodeList} [images=All nodes in the DOM] - The Node List to be analysed
   */
  function showImagesInfo(images) {
    images = images || document.getElementsByTagName('*');
    images = nodeListToArray(images);
    let body = document.getElementsByTagName('body')[0];
    getImages(images).map(image => {
      let div = document.createElement('div');

      const MIN_IMAGE_CONTENT_WIDTH = 150;
      const MIN_IMAGE_CONTENT_HEIGHT = 70;
      const MIN_IMAGE_URL_HEIGHT = 120;

      if (image.width > MIN_IMAGE_CONTENT_WIDTH && image.height > MIN_IMAGE_CONTENT_HEIGHT) {
        div.setAttribute('title', image.url);

        if (image.height > MIN_IMAGE_URL_HEIGHT) {
          let url = document.createElement('a');
          url.innerHTML = getTruncatedImageUrl(image);
          url.setAttribute('href', image.url);
          url.setAttribute('target', '_blank');
          url.classList.add(URL_CLASS);
          div.appendChild(url);
          styleElement(div, image);
          appendInfoToElement(div, image);
          body.appendChild(div);
        } else {
          appendInfoToElement(div, image);
          appendAnchorToBody(div, image);
        }
      } else {
        let info = `Coverage: ${ getImageCoverage(image).toFixed(2) }%`;

        if (image.size && image.size > 0) {
          info += `, File Size: ${ image.size } KB`;
        }

        info += `, URL: ${ image.url }`;

        appendAnchorToBody(div, image, info);
      }
    });
  }

  /**
   * Remove all overlays
   */
  function hideImagesInfo() {
    nodeListToArray(document.querySelectorAll('.ncc-image-checker-overlay')).map(o => o.remove());
  }

  /**
   * Are there images overlays?
   *
   * @returns {boolean}
   */
  function isImagesInfoActive() {
    return document.querySelectorAll('.ncc-image-checker-overlay').length > 0;
  }

  function appendInfoToElement(div, image) {
    div.setAttribute('title', image.url);
    let renderedP = document.createElement('p');
    renderedP.innerHTML = `Display: ${ image.width } x ${ image.height }`;
    div.appendChild(renderedP);

    let naturalP = document.createElement('p');
    naturalP.innerHTML = `Natural: ${ image.naturalSize.width } x ${ image.naturalSize.height }`;
    div.appendChild(naturalP);

    let optimalP = document.createElement('p');
    optimalP.innerHTML = `Image coverage: ${ getImageCoverage(image).toFixed(2) }%`;
    div.appendChild(optimalP);

    if (image.size) {
      let sizeP = document.createElement('p');
      sizeP.innerHTML = image.size > 0 ? `File Size: ${ image.size } KB` : `File size unavailable`;
      div.appendChild(sizeP);
    }
  }

  function appendAnchorToBody(element, image, info) {
    let anchor = document.createElement('a');
    let title = info ? info : element.title;
    styleElement(anchor, image);
    anchor.setAttribute('href', image.url);
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('title', title);
    anchor.appendChild(element);
    document.getElementsByTagName('body')[0].appendChild(anchor);
  }

  function styleElement(element, image) {
    element.style.width = image.width + 'px';
    element.style.height = image.height + 'px';
    element.style.top = image.position.top + 'px';
    element.style.left = image.position.left + 'px';
    element.style.backgroundColor = getBackgroundColor(getImageCoverage(image));
    element.classList.add(OVERLAY_CLASS);
  }

  function getBackgroundColor(percentage) {
    let col = percentage;
    if (percentage < 0) col = 0;
    if (percentage > 240) col = 240;
    col = 240 - col;
    console.log(percentage,'-',col);
    return `hsla(${col}, 100%, 50%, .8)`;

  }

  function getImageCoverage(image) {
    let naturalArea = image.naturalSize.width * image.naturalSize.height;
    let renderArea = image.width * image.height;
    return (naturalArea / renderArea * 100);
  }

  function getTruncatedImageUrl(image) {
    const BOUNDING_BOX_PADDING = 10;
    const CHARACTER_WIDTH = 10;
    let limit = 2 * (image.width - BOUNDING_BOX_PADDING) / CHARACTER_WIDTH;
    let replace = '...';
    let partialLeft = Math.ceil((limit - replace.length) / 2);
    let partialRight = Math.floor((limit - replace.length) / 2);
    if (image.url.length > limit) {
      return image.url.substr(0, partialLeft) + replace + image.url.substr(-partialRight);
    }
    else {
      return image.url;
    }
  }

  // this is the last point element is a DOM element
  function getImages(domNodes) {
    let images = getAvailableImages(domNodes);
    return images.map(element => {
      let size = getSize(element);
      if (typeof size === 'number') {
        size = (size / 1024).toFixed(3);
      }
      return {
        url: getUrl(element),
        size: size,
        position: getElementTopLeft(element),
        height: element.offsetHeight,
        width: element.offsetWidth,
        naturalSize: getNaturalSize(element)
      };
    }).filter(byVisibleImage);
  }

  function getAvailableImages(elementsArray) {
    return elementsArray
      .filter(byProbableImage)
      .filter(byHasUrl);
  }

  function byVisibleImage(image) {
    return (image.height && image.width &&
    typeof image.position.top === 'number' &&
    typeof image.position.left === 'number');
  }

  function byProbableImage(element) {
    let style = window.getComputedStyle(element);

    if (style.visibility === 'hidden') {
      return false;
    }

    if (element.tagName.toLowerCase() === 'img') {
      return true;
    }

    if (style.backgroundImage) {
      let urlMatcher = BACKGROUND_IMAGE_URL_REGEX.exec(style.backgroundImage);

      if (urlMatcher && urlMatcher.length > 1) {
        return true;
      }
    }

    return false;
  }

  function byHasUrl(element) {
    return !!getUrl(element);
  }

  function getElementTopLeft(elem) {
    let location = {
      top: 0,
      left: 0
    };
    if (elem.x && elem.y) {
      location.top = elem.y;
      location.left = elem.x;
    } else if (elem.offsetParent) {
      do {
        location.top += elem.offsetTop;
        location.left += elem.offsetLeft;
        elem = elem.offsetParent;
      } while (elem);
    }
    location.left+=1;
    return location;
  }

  function getNaturalSize(element) {
    if (element.naturalWidth) {
      return {
        width: element.naturalWidth,
        height: element.naturalHeight
      };
    } else {
      let image = new Image();
      image.src = getUrl(element);

      return {
        width: image.naturalWidth,
        height: image.naturalHeight
      };
    }
  }

  function getSize(element) {
    let performanceEntry = performance.getEntriesByName(getUrl(element))[0];
    if (performanceEntry) {
      return performanceEntry.encodedBodySize;
    }
  }

  function getUrl(element) {
    if (element.currentSrc) {
      return element.currentSrc;
    }
    else if (element.src) {
      return element.src;
    }
    else {
      let bkg = window.getComputedStyle(element).backgroundImage;
      let url = BACKGROUND_IMAGE_URL_REGEX.exec(bkg);
      if (url) {
        return url[1].replace(/["]/g, '');
      }
    }
  }

  function nodeListToArray(nodeList) {
    let array = [];

    for (let i = 0; i < nodeList.length; i += 1) {
      array[i] = nodeList[i];
    }

    return array;
  }

  window.NCC = window.NCC || {};

  window.NCC.imageChecker = {
    showImagesInfo: showImagesInfo,
    hideImagesInfo: hideImagesInfo,
    isImagesInfoActive: isImagesInfoActive,
    _getImages: getImages,
    _nodeListToArray: nodeListToArray,
    _getUrl: getUrl,
    _getSize: getSize,
    _getNaturalSize: getNaturalSize,
    _getImageCoverage: getImageCoverage,
    _getElementTopLeft: getElementTopLeft,
    _getAvailableImages: getAvailableImages,
    _getTruncatedImageUrl: getTruncatedImageUrl,
    _getBackgroundColor: getBackgroundColor
  };
}());