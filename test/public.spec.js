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

describe('imageChecker', () => {
  let images;
  let img;
  let bigImg;
  let backgroundImg;
  let noBackgroundImg;
  let noSrcImg;
  let noDimensionsImg;
  let hiddenImg;
  let invisibleImg;
  let smallWidthImg;
  let smallWidthUrlImg;
  let missingImg;
  let crossDomainImg;
  let svgImg;
  let video;

  beforeAll((done) => {
    let stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'base/app/styles/content.css';
    stylesheet.onload = function() {
      done();
    };
    document.head.appendChild(stylesheet);
  });

  beforeAll(() => {
    spyOn(window, 'setInterval');
    spyOn(window, 'clearInterval');
  });

  beforeEach(() => {
    window.setInterval.calls.reset();
    window.clearInterval.calls.reset();
  });

  beforeEach((done) => {
    window.document.body.style.margin = '0px';

    images = document.createElement('div');
    images.id = 'images';
    window.document.body.append(images);

    let preloaded = new Image();
    preloaded.src = 'base/test/assets/placeholder-100x80.png';
    preloaded.onload = function() {
      preloaded.parentElement.removeChild(preloaded);
      done();
    };
    window.document.body.appendChild(preloaded);
  });

  afterEach(() => {
    // cleanup
    window.document.body.style = null;

    images = window.document.getElementById('images');
    if (images) {
      images.parentElement.removeChild(images);
    }

    let overlays = [].slice.call(getImageOverlays());
    overlays.forEach((overlay) => {
      overlay.parentElement.removeChild(overlay);
    });
  });

  it('should expose public api', () => {
    expect(window.NCC).toBeDefined();
    expect(window.NCC.imageChecker).toBeDefined();
    expect(window.NCC.imageChecker.showImagesInfo).toEqual(jasmine.any(Function));
    expect(window.NCC.imageChecker.hideImagesInfo).toEqual(jasmine.any(Function));
    expect(window.NCC.imageChecker.isImagesInfoActive).toEqual(jasmine.any(Function));
  });

  describe('showImagesInfo()', () => {
    it('should show image overlays for valid images', () => {
      createDomNodes([
        createVideoPosterImg(),
        createBackgroundImg(),
        createSmallImg(),
        createMediumImg(),
        createBigImg(),
        createImg()
      ]);

      window.NCC.imageChecker.showImagesInfo();

      let imageOverlays = document.querySelectorAll('.ncc-image-checker-overlay');
      expect(imageOverlays.length).toEqual(6);
    });

    it('should not show image overlays for invalid images', () => {
      createDomNodes([
        createVideoPosterImg({poster: false}),
        createMissingImg(),
        createNoBackgroundImg(),
        createHiddenImg(),
        createInvisibleImg(),
        createNoSrcImg(),
        createNoDimensionImg()
      ]);

      window.NCC.imageChecker.showImagesInfo();

      let imageOverlays = document.querySelectorAll('.ncc-image-checker-overlay');
      expect(imageOverlays.length).toEqual(0);
    });

    it('should ignore query parameters', (done) => {
      createDomNodes([
        createBigImg({queryParams: 'mock=true'})
      ]);

      bigImg.addEventListener('load', () => {
        window.NCC.imageChecker.showImagesInfo();

        let textLines = getImageOverlayTextLines(0);

        expect(textLines).toContain('placeholder-100x80.png');
        expect(textLines).not.toContain(jasmine.stringMatching(/placeholder-100x80.png\?mock=true/));

        done();
      }, false);
    });

    describe('refreshImages', () => {
      let mockIntervalId;
      let intervalFn;
      beforeEach(() => {
        createDomNodes([
          createImg()
        ]);
        mockIntervalId = /mockIntervalId/;
        window.setInterval.and.returnValue(mockIntervalId);
        window.NCC.imageChecker.showImagesInfo();
        intervalFn = window.setInterval.calls.mostRecent().args[0];
      });

      it('should not refresh any images if nothing significant changes', () => {
        expect(getImageOverlays().length).toEqual(1);

        intervalFn();

        expect(getImageOverlays().length).toEqual(1);
      });

      it('should refresh images if the window height changes', () => {
        expect(getImageOverlays().length).toEqual(1);
        createDomNodes([
          createImg()
        ]);
        window.innerHeight += 1;

        intervalFn();

        expect(getImageOverlays().length).toEqual(2);
      });

      it('should refresh images if the window width changes', () => {
        expect(getImageOverlays().length).toEqual(1);
        createDomNodes([
          createImg()
        ]);
        window.innerWidth += 1;

        intervalFn();

        expect(getImageOverlays().length).toEqual(2);
      });

      it('should refresh images if the window scrollX changes', () => {
        expect(getImageOverlays().length).toEqual(1);
        createDomNodes([
          createImg()
        ]);
        window.scrollX += 1;

        intervalFn();

        expect(getImageOverlays().length).toEqual(2);

        // revert
        window.scrollX -= 1;
      });

      it('should refresh images if the window scrollY changes', () => {
        expect(getImageOverlays().length).toEqual(1);
        createDomNodes([
          createImg()
        ]);
        window.scrollY += 1;

        intervalFn();

        expect(getImageOverlays().length).toEqual(2);

        // revert
        window.scrollY -= 1;
      });

      it('should create an interval of 500ms', () => {
        expect(window.setInterval.calls.mostRecent().args[1]).toEqual(500);
      });

      it('should clear existing interval before creating a new one', () => {
        window.NCC.imageChecker.showImagesInfo();
        expect(window.clearInterval).toHaveBeenCalledWith(mockIntervalId);
      });
    });

    describe('big images overlays', () => {
      beforeEach(() => {
        createDomNodes([
          createBigImg()
        ]);
        window.NCC.imageChecker.showImagesInfo();
      });

      it('should show all info', () => {
        let textLines = getImageOverlayTextLines(0);

        expect(textLines).toContain(jasmine.stringMatching('...holder-100x80.png'));
        expect(textLines).toContain('Display: 300 x 240');
        expect(textLines).toContain('Natural: 100 x 80');
        expect(textLines).toContain('Image coverage: 0.3x');
        expect(textLines).toContain('File Size: 4.464 KB');
      });

      it('should have url link to new tab', () => {
        let imageOverlay = getImageOverlay(0);
        let urlLink = imageOverlay.getElementsByTagName('a')[0];

        expect(urlLink.href).toEqual(jasmine.stringMatching('test/assets/placeholder-100x80.png'));
        expect(urlLink.target).toEqual('_blank');
        expect(urlLink.innerText).toEqual(jasmine.stringMatching('...holder-100x80.png'));
      });
    });

    describe('medium images overlays', () => {
      beforeEach(() => {
        createDomNodes([
          createMediumImg()
        ]);
        window.NCC.imageChecker.showImagesInfo();
      });

      it('should not show url info', () => {
        let imageOverlay = getImageOverlay(0);
        let urlLink = imageOverlay.getElementsByTagName('a')[0];

        expect(urlLink).toBeUndefined();
      });

      it('should show other info', () => {
        let textLines = getImageOverlayTextLines(0);

        expect(textLines).toContain('Display: 151 x 71');
        expect(textLines).toContain('Natural: 100 x 80');
        expect(textLines).toContain('Image coverage: 1.1x');
        expect(textLines).toContain('File Size: 4.464 KB');
      });

      it('should click to new tab', () => {
        let urlLink = getImageOverlay(0);

        expect(urlLink.href).toEqual(jasmine.stringMatching('test/assets/placeholder-100x80.png'));
        expect(urlLink.target).toEqual('_blank');
      });
    });

    describe('small images overlays', () => {
      beforeEach(() => {
        createDomNodes([
          createSmallImg()
        ]);
        window.NCC.imageChecker.showImagesInfo();
      });

      it('should only have title', () => {
        let imageOverlay = getImageOverlay(0);
        let titleParts = imageOverlay.title.split(',');
        expect(titleParts[0].trim()).toEqual('Coverage: 1.60x');
        expect(titleParts[1].trim()).toEqual('File Size: 4.464 KB');
        expect(titleParts[2].trim()).toEqual(jasmine.stringMatching('URL: .*test/assets/placeholder-100x80.png'));
      });

      it('should not have any content', () => {
        let textLines = getImageOverlayTextLines(0);
        expect(textLines).toEqual(['']);
      });
    });

    describe('cross domain images overlays', () => {
      beforeEach((done) => {
        createDomNodes([
          createCrossDomainImg()
        ]);
        spyOn(window.performance, 'getEntriesByName');
        crossDomainImg.onload = function() {
          done();
        };
      });

      it('should not show file size', () => {
        window.performance.getEntriesByName.and.returnValue([{encodedBodySize: 0}]);

        window.NCC.imageChecker.showImagesInfo();

        let textLines = getImageOverlayTextLines(0);
        expect(textLines).toContain('File size unavailable');
      });
    });

    describe('svg image overlays', () => {
      beforeEach(() => {
        createDomNodes([
          createSvgImg(),
          createSvgImg({dataUri: true}),
          createSvgImg({queryParams: 'mock=true'})
        ]);
      });

      it('should not show any overlay', () => {
        window.NCC.imageChecker.showImagesInfo();

        expect(getImageOverlays().length).toEqual(0);
      });
    });

    describe('relative body with margins', () => {
      let div;

      beforeEach(() => {
        createDomNodes([
          createBigImg()
        ]);
        window.document.body.style.marginTop = '10px';
        window.document.body.style.marginLeft = '10px';
        images.style.marginTop = '20px';
        images.style.marginLeft = '20px';

        div = document.createElement('div');
        div.style.width = '10px';
        div.style.height = '10px';
        div.style.display = 'block';

        images.prepend(div);
      });

      afterEach(() => {
        window.document.body.style.margin = null;
      });

      it('should subtract parent position', () => {
        window.document.body.style.position = 'relative';

        window.NCC.imageChecker.showImagesInfo();
        let imageOverlay = getImageOverlay(0);

        expect(imageOverlay.style.top).toEqual('10px');
        expect(imageOverlay.style.left).toEqual('20px');
      });
    });
  });

  describe('hideImagesInfo()', () => {
    it('should remove all image overlays', () => {
      createDomNodes([
        createBackgroundImg(),
        createNoBackgroundImg(),
        createHiddenImg(),
        createInvisibleImg(),
        createNoSrcImg(),
        createNoDimensionImg(),
        createSmallImg(),
        createMediumImg(),
        createBigImg(),
        createImg()
      ]);
      window.NCC.imageChecker.showImagesInfo();

      window.NCC.imageChecker.hideImagesInfo();

      let imageOverlays = document.querySelectorAll('.ncc-image-checker-overlay');
      expect(imageOverlays.length).toEqual(0);
    });
  });

  describe('isImagesInfoActive()', () => {
    it('should return true', () => {
      createDomNodes([
        createImg()
      ]);
      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(false);

      window.NCC.imageChecker.showImagesInfo();

      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(true);
    });

    it('should return false when hidden after shown', () => {
      createDomNodes([
        createImg()
      ]);
      window.NCC.imageChecker.showImagesInfo();

      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(true);

      window.NCC.imageChecker.hideImagesInfo();

      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(false);
    });

    it('should return false when no images are found', () => {
      createDomNodes();
      window.NCC.imageChecker.showImagesInfo();

      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(false);
    });
  });

  describe('_getElementTopLeft()', () => {
    it('should use x y if available', () => {
      createDomNodes([
        createImg()
      ]);
      window.document.body.style.margin = '4px';

      expect(window.NCC.imageChecker._getElementTopLeft(img)).toEqual({
        top: 4,
        left: 4
      });

      window.document.body.style.margin = null;
    });

    it('should use parent offset as fallback', () => {
      createDomNodes([
        createBackgroundImg()
      ]);
      window.document.body.style.margin = '2px';

      expect(window.NCC.imageChecker._getElementTopLeft(backgroundImg)).toEqual({
        top: 2,
        left: 2
      });
    });
  });

  describe('_getImageCoverage()', () => {
    it('should calculate natural size percentage of rendered size', () => {
      expect(window.NCC.imageChecker._getImageCoverage({
        naturalSize: {
          width: 200,
          height: 200
        },
        width: 100,
        height: 100
      })).toEqual(400);
    });
  });

  describe('_getNaturalSize()', () => {
    it('should use natural size if available', () => {
      createDomNodes([
        createImg()
      ]);

      expect(window.NCC.imageChecker._getNaturalSize(img)).toEqual({
        width: 100,
        height: 80
      });
    });

    it('should use image natural size as fallback', () => {
      createDomNodes([
        createBackgroundImg()
      ]);

      expect(window.NCC.imageChecker._getNaturalSize(backgroundImg)).toEqual({
        width: 100,
        height: 80
      });
    });
  });

  describe('_getBackgroundColor', () => {
    it('should return high coverage color', () => {
      expect(window.NCC.imageChecker._getBackgroundColor(300)).toEqual('hsla(0, 100%, 50%, .8)');
    });

    it('should return medium coverage color', () => {
      expect(window.NCC.imageChecker._getBackgroundColor(150)).toEqual('hsla(90, 100%, 50%, .8)');
    });

    it('should return low coverage color', () => {
      expect(window.NCC.imageChecker._getBackgroundColor(75)).toEqual('hsla(165, 100%, 50%, .8)');
    });

    it('should return low coverage color for negative percentage', () => {
      expect(window.NCC.imageChecker._getBackgroundColor(-1)).toEqual('hsla(240, 100%, 50%, .8)');
    });
  });

  describe('_getImagesInfoParent', () => {
    it('should return correct values for body', () => {
      window.document.body.style.margin = '10px';

      expect(window.NCC.imageChecker._getImagesInfoParent()).toEqual({
        position: {
          top: 10,
          left: 10
        }
      });

      window.document.body.style.margin = null;
    });
  });

  function createBackgroundImg() {
    backgroundImg = document.createElement('div');
    backgroundImg.style = 'display: block;width: 200px;height: 160px;' +
      'background: url("base/test/assets/placeholder-100x80.png");';
    return backgroundImg;
  }

  function createNoBackgroundImg() {
    noBackgroundImg = document.createElement('div');
    return noBackgroundImg;
  }

  function createHiddenImg() {
    hiddenImg = document.createElement('img');
    hiddenImg.src = 'base/test/assets/placeholder-100x80.png';
    hiddenImg.style = 'display: none;';
    return hiddenImg;
  }

  function createInvisibleImg() {
    invisibleImg = document.createElement('img');
    invisibleImg.src = 'base/test/assets/placeholder-100x80.png';
    invisibleImg.style = 'visibility: hidden;';
    return invisibleImg;
  }

  function createNoSrcImg() {
    noSrcImg = document.createElement('img');
    return noSrcImg;
  }

  function createNoDimensionImg() {
    noDimensionsImg = document.createElement('img');
    noDimensionsImg.src = 'base/test/assets/placeholder-100x80.png';
    noDimensionsImg.style = 'display: block; width: 0px; height: 0px;';
    return noDimensionsImg;
  }

  function createSmallImg() {
    smallWidthImg = document.createElement('img');
    smallWidthImg.src = 'base/test/assets/placeholder-100x80.png';
    smallWidthImg.style = 'display: block; width: 150px; height: 50px;';
    return smallWidthImg;
  }

  function createMediumImg() {
    smallWidthUrlImg = document.createElement('img');
    smallWidthUrlImg.src = 'base/test/assets/placeholder-100x80.png';
    smallWidthUrlImg.style = 'display: block; width: 151px; height: 71px;';
    return smallWidthUrlImg;
  }

  function createImg() {
    img = document.createElement('img');
    img.src = 'base/test/assets/placeholder-100x80.png';
    return img;
  }

  function createBigImg(options) {
    options = options || {};
    bigImg = document.createElement('img');
    let src = 'base/test/assets/placeholder-100x80.png';
    if (options.queryParams) {
      src += `?${options.queryParams}`;
    }
    bigImg.src = src;
    bigImg.style = 'display: block;width: 300px;height: 240px;';
    return bigImg;
  }

  function createMissingImg() {
    missingImg = document.createElement('img');
    missingImg.src = 'not-found.png';
    return missingImg;
  }

  function createCrossDomainImg() {
    crossDomainImg = document.createElement('img');
    // if it changes, find another image that we own and host
    crossDomainImg.src = 'https://portal.siteconfidence.co.uk/common/image/ncc/ncc-logo.png';
    crossDomainImg.style = 'display: block;width: 200px;height: 160px;';
    return crossDomainImg;
  }

  function createSvgImg(options) {
    options = options || {};
    svgImg = document.createElement('img');
    if (options.dataUri) {
      svgImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My' +
        '5vcmcvMjAwMC9zdmciPgogICAgPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijc2IiBzdHlsZT0iZmlsbDojREVER' +
        'URFO3N0cm9rZTojNTU1NTU1O3N0cm9rZS13aWR0aDoyIi8+CiAgICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxOCIg' +
        'dGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiCiAgICAgICAgICBmb250LWZhbWlseT0ibW9ub3N' +
        'wYWNlLCBzYW5zLXNlcmlmIiBmaWxsPSIjNTU1NTU1Ij4xMDAmIzIxNTs4MAogICAgPC90ZXh0Pgo8L3N2Zz4K';
    } else {
      svgImg.src = 'base/test/assets/placeholder-100x80.svg';
    }
    if (options.queryParams) {
      svgImg.src += `?${options.queryParams}`;
    }
    svgImg.style = 'display: block;width: 200px;height: 160px;';
    return svgImg;
  }

  function createVideoPosterImg(options) {
    options = options || {};
    video = document.createElement('video');
    if (options.poster !== false) {
      video.poster = 'base/test/assets/placeholder-100x80.png';
    }
    video.style = 'display: block;width: 200px;height: 160px;';
    return video;
  }

  function createDomNodes(domNodes) {
    domNodes = domNodes || [];
    domNodes.forEach((domNode) => {
      images.appendChild(domNode);
    });
  }

  function getImageOverlayTextLines(index) {
    let imageOverlay = getImageOverlay(index);
    return imageOverlay.innerText.split(/[\r\n]+/g);
  }

  function getImageOverlay(index) {
    let imageOverlays = getImageOverlays();
    return imageOverlays[index];
  }

  function getImageOverlays() {
    return document.querySelectorAll('.ncc-image-checker-overlay');
  }
});
