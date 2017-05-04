describe('imageChecker', function() {
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

  beforeEach(function(done) {
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

  afterEach(function() {
    // cleanup
    document.body.style = '';

    images = window.document.getElementById('images');
    if (images) {
      images.parentElement.removeChild(images);
    }

    let overlays = document.querySelectorAll('.ncc-image-checker-overlay');
    overlays = [].slice.call(overlays);
    overlays.map(function(overlay) {
      overlay.parentElement.removeChild(overlay);
    });
  });

  it('should expose public api', function() {
    expect(window.NCC).toBeDefined();
    expect(window.NCC.imageChecker).toBeDefined();
    expect(window.NCC.imageChecker.showImagesInfo).toEqual(jasmine.any(Function));
    expect(window.NCC.imageChecker.hideImagesInfo).toEqual(jasmine.any(Function));
    expect(window.NCC.imageChecker.isImagesInfoActive).toEqual(jasmine.any(Function));
  });

  describe('showImagesInfo()', function() {
    it('should show image overlays only for available images', function() {
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

    describe('big images overlays', function() {
      beforeEach(function() {
        createDomNodes([
          createBigImg()
        ]);
        window.NCC.imageChecker.showImagesInfo();
      });

      it('should show all info', function() {
        let textLines = getImageOverlayTextLines(0);

        expect(textLines).toContain(jasmine.stringMatching('...holder-100x80.png'));
        expect(textLines).toContain('Display: 200 x 160');
        expect(textLines).toContain('Natural: 100 x 80');
        expect(textLines).toContain('Image coverage: 0.5x');
        expect(textLines).toContain('File Size: 4.464 KB');
      });

      it('should have url link to new tab', function() {
        let imageOverlay = getImageOverlay(0);
        let urlLink = imageOverlay.getElementsByTagName('a')[0];

        expect(urlLink.href).toEqual(jasmine.stringMatching('test/assets/placeholder-100x80.png'));
        expect(urlLink.target).toEqual('_blank');
        expect(urlLink.innerText).toEqual(jasmine.stringMatching('...holder-100x80.png'));
      });
    });

    describe('medium images overlays', function() {
      beforeEach(function() {
        createDomNodes([
          createMediumImg()
        ]);
        window.NCC.imageChecker.showImagesInfo();
      });

      it('should not show url info', function() {
        let imageOverlay = getImageOverlay(0);
        let urlLink = imageOverlay.getElementsByTagName('a')[0];

        expect(urlLink).toBeUndefined();
      });

      it('should show other info', function() {
        let textLines = getImageOverlayTextLines(0);

        expect(textLines).toContain('Display: 151 x 71');
        expect(textLines).toContain('Natural: 100 x 80');
        expect(textLines).toContain('Image coverage: 1.1x');
        expect(textLines).toContain('File Size: 4.464 KB');
      });

      it('should click to new tab', function() {
        let urlLink = getImageOverlay(0);

        expect(urlLink.href).toEqual(jasmine.stringMatching('test/assets/placeholder-100x80.png'));
        expect(urlLink.target).toEqual('_blank');
      });
    });

    describe('small images overlays', function() {
      beforeEach(function() {
        createDomNodes([
          createSmallImg()
        ]);
        window.NCC.imageChecker.showImagesInfo();
      });

      it('should only have title', function() {
        let imageOverlay = getImageOverlay(0);
        let titleParts = imageOverlay.title.split(',');
        expect(titleParts[0].trim()).toEqual('Coverage: 1.60x');
        expect(titleParts[1].trim()).toEqual('File Size: 4.464 KB');
        expect(titleParts[2].trim()).toEqual(jasmine.stringMatching('URL: .*test/assets/placeholder-100x80.png'));
      });

      it('should not have any content', function() {
        let textLines = getImageOverlayTextLines(0);
        expect(textLines).toEqual(['']);
      });
    });

    describe('cross domain images overlays', function() {
      beforeEach(function(done) {
        createDomNodes([
          createCrossDomainImg()
        ]);
        spyOn(window.performance, 'getEntriesByName');
        crossDomainImg.onload = function() {
          done();
        };
      });

      it('should not show file size', function() {
        window.performance.getEntriesByName.and.returnValue([{encodedBodySize: 0}]);

        window.NCC.imageChecker.showImagesInfo();

        let textLines = getImageOverlayTextLines(0);
        expect(textLines).toContain('File size unavailable');
      });
    });
  });

  describe('hideImagesInfo()', function() {
    it('should remove all image overlays', function() {
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

  describe('isImagesInfoActive()', function() {
    it('should return true', function() {
      createDomNodes([
        createImg()
      ]);
      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(false);

      window.NCC.imageChecker.showImagesInfo();

      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(true);
    });

    it('should return false when hidden after shown', function() {
      createDomNodes([
        createImg()
      ]);
      window.NCC.imageChecker.showImagesInfo();

      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(true);

      window.NCC.imageChecker.hideImagesInfo();

      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(false);
    });

    it('should return false when no images are found', function() {
      createDomNodes();
      window.NCC.imageChecker.showImagesInfo();

      expect(window.NCC.imageChecker.isImagesInfoActive()).toEqual(false);
    });
  });

  describe('_getElementTopLeft()', function() {
    it('should use x y if available', function() {
      createDomNodes([
        createImg()
      ]);
      document.body.style = 'margin: 4px;';

      expect(window.NCC.imageChecker._getElementTopLeft(img)).toEqual({top: 4, left: 4});
    });

    it('should use parent offset as fallback', function() {
      createDomNodes([
        createBackgroundImg()
      ]);
      document.body.style = 'margin: 2px;';

      expect(window.NCC.imageChecker._getElementTopLeft(backgroundImg)).toEqual({top: 2, left: 2});
    });
  });

  describe('_getImageCoverage()', function() {
    it('should calculate natural size percentage of rendered size', function() {
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

  describe('_getNaturalSize()', function() {
    it('should use natural size if available', function() {
      createDomNodes([
        createImg()
      ]);

      expect(window.NCC.imageChecker._getNaturalSize(img)).toEqual({width: 100, height: 80});
    });

    it('should use image natural size as fallback', function() {
      createDomNodes([
        createBackgroundImg()
      ]);

      expect(window.NCC.imageChecker._getNaturalSize(backgroundImg)).toEqual({width: 100, height: 80});
    });
  });

  describe('_getBackgroundColor', function() {
    it('should return high coverage color', function() {
      expect(window.NCC.imageChecker._getBackgroundColor(300)).toEqual('hsla(0, 100%, 50%, .8)');
    });

    it('should return medium coverage color', function() {
      expect(window.NCC.imageChecker._getBackgroundColor(150)).toEqual('hsla(90, 100%, 50%, .8)');
    });

    it('should return low coverage color', function() {
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
    domNodes.forEach(function(domNode) {
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
