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

  beforeEach((done) => {
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
    document.body.style = '';

    images = window.document.getElementById('images');
    if (images) {
      images.parentElement.removeChild(images);
    }

    let overlays = document.querySelectorAll('.ncc-image-checker-overlay');
    overlays = [].slice.call(overlays);
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
    it('should show image overlays only for available images', () => {
      createDomNodes([
        createMissingImg(),
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

      let imageOverlays = document.querySelectorAll('.ncc-image-checker-overlay');
      expect(imageOverlays.length).toEqual(5);
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
        expect(textLines).toContain('Display: 200 x 160');
        expect(textLines).toContain('Natural: 100 x 80');
        expect(textLines).toContain('Image coverage: 0.5x');
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
      document.body.style = 'margin: 4px;';

      expect(window.NCC.imageChecker._getElementTopLeft(img)).toEqual({top: 4, left: 4});
    });

    it('should use parent offset as fallback', () => {
      createDomNodes([
        createBackgroundImg()
      ]);
      document.body.style = 'margin: 2px;';

      expect(window.NCC.imageChecker._getElementTopLeft(backgroundImg)).toEqual({top: 2, left: 2});
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

      expect(window.NCC.imageChecker._getNaturalSize(img)).toEqual({width: 100, height: 80});
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
  });

  function createBackgroundImg() {
    backgroundImg = document.createElement('div');
    backgroundImg.style = 'display: block;width: 200px;height: 160px; background: url("base/test/assets/placeholder-100x80.png");';
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

  function createBigImg() {
    bigImg = document.createElement('img');
    bigImg.src = 'base/test/assets/placeholder-100x80.png';
    bigImg.style = 'display: block;width: 200px;height: 160px;';
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
    let imageOverlays = document.querySelectorAll('.ncc-image-checker-overlay');
    return imageOverlays[index];
  }
});
