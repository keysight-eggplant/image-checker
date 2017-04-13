(function(){
  const OVERLAY = 'ncc-image-checker-overlay';
  const URL = 'ncc-image-checker-url';
  const COMPACT ='ncc-image-checker-compact';

  function buildImagesOverlay(images) {
    let body = document.getElementsByTagName('body')[0];
    findImages(images).map(image => {
      let div = document.createElement('div');
      div.classList.add(OVERLAY);
      div.style.width = image.width + 'px';
      div.style.height = image.height + 'px';
      div.style.top = image.position.top;
      div.style.left = image.position.left;

      //if element small or medium
      div.setAttribute('title', image.url);

      if (image.width > 150 && image.height > 50) {
        let url = document.createElement('a');
        url.innerHTML = processUrl(image);
        url.setAttribute('href', image.url);
        url.setAttribute('target', '_blank');
        url.classList.add(URL);
        div.appendChild(url);

        let renderedP = document.createElement('p');
        renderedP.innerHTML = `Display: ${ image.width } x ${ image.height }`;
        div.appendChild(renderedP);

        if (image.naturalWidth) {
          let naturalP = document.createElement('p');
          naturalP.innerHTML = `Natural: ${ image.naturalWidth } x ${ image.naturalHeight }`;
          div.appendChild(naturalP);

          let optimalP = document.createElement('p');
          let naturalArea = image.naturalWidth * image.naturalHeight;
          let renderArea = image.width * image.height * window.devicePixelRatio;
          optimalP.innerHTML = `Image coverage: ${ (naturalArea / renderArea * 100).toFixed(2) }%`;
          div.appendChild(optimalP);
        }

        let sizeP = document.createElement('p');
        sizeP.innerHTML = `File Size: ${ image.size } KB`;
        div.appendChild(sizeP);
      } else {
        // some files listed here must be excluded
        div.classList.add(COMPACT);
      }

      //the end
      body.appendChild(div);
    });
  }

  function processUrl (image) {
    let safeSize = (image.width - 10) * 0.1;
    return image.url.length < safeSize * 2 ? image.url : image.url.substring(0, safeSize - 3) + '.....' + image.url.substring(image.url.length - safeSize + 3, image.url.length);
  }

  // this is the last point element is a DOM element
  function findImages(domNodes) {
    let images = haveImages(domNodes);
    return images.map(element => {
      return {
        url: getUrl(element),
        size: (getSize(element) / 1024).toFixed(3),
        position: getElementTopLeft(element),
        height: element.offsetHeight,
        width: element.offsetWidth,
        //TODO build a function to fetch natural sizes if they are not defined
        naturalHeight: element.naturalHeight,
        naturalWidth: element.naturalWidth
      };
    }).filter(image => !(!image.height || !image.width || (!image.position.top && !image.position.left)));
  }

  function haveImages(elementsArray) {
    return elementsArray.filter(elem => {
      let style = window.getComputedStyle(elem);

      if (style.visibility === "hidden") {
        return false;
      }

      if (elem.tagName === 'IMG') {
        return true;
      }

      if (style.backgroundImage) {
        let urlMatcher = /url\(("?http.*"?)\)/ig.exec(style.backgroundImage);

        if (urlMatcher && urlMatcher.length > 1) {
          return true;
        }
      }

      return false;
    }).filter(element => getUrl(element));
  }

  function getElementTopLeft(elem) {
    let location = {
      top: 0,
      left: 0
    };
    if ( elem.x && elem.y) {
      location.top = elem.y + 'px';
      location.left = elem.x + 'px';
    } else if (elem.offsetParent) {
      do {
        location.top += elem.offsetTop;
        location.left += elem.offsetLeft;
        elem = elem.offsetParent;
      } while (elem);
    }
    return location;
  }

  function getSize(element) {
    return performance.getEntriesByName(getUrl(element))[0].encodedBodySize;
  }

  function getUrl(element) {
    let bkg = window.getComputedStyle(element).backgroundImage;
    // as part of style all urls are url("........")
    bkg = bkg.substring(5, bkg.length - 2);

    return element.src ||  bkg;
  }

  function collectionToArray(domCollection) {
    let array = [];

    for (let i = domCollection.length - 1; i >= 0; i--) {
      array[i] = domCollection[i];
    }

    return array;
  }

  window.NCC = window.NCC || {};

  window.NCC.imageChecker = {
      showImagesInfo: buildImagesOverlay,
      getImages: findImages,
      _collectionToArray: collectionToArray,
      _getUrl: getUrl,
      _getSize: getSize,
      _getElementTopLeft: getElementTopLeft,
      _haveImages: haveImages,
      _processUrl: processUrl
  };
}());
