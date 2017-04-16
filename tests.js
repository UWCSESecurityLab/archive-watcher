mocha.setup('tdd');

let expect = chai.expect;
const wbURL = 'http://web.archive.org/web/20170101000000/http://example.com';
const nonWBURL = 'http://example.com';
const wbTab = {url: wbURL};
const nonWBTab = {url: nonWBURL};

// Tests for some methods in Measure.js.
suite('Background.js', function() {
  setup(function() {});

  test('classifyRequest()', function() {
    let urls = {
      archiveRequest: [
        'http://web.archive.org/web/20110901233330/reuters.com',
        'web.archive.org/web/20110901233330/reuters.com',
        'web.archive.org/web/20000901000000/http://example.com',
        'web.archive.org/web/20000901000000/http://example.com?query=thing&another=baz',
        'http://web.archive.org/web/20110901231830im_/http://www.google.com/intl/en_ALL/images/srpr/logo1w.png',
      ],
      archiveEscape: [
        'example.com',
        'example.com/path',
        'example.com/path?query=thing',
        'http://example.com',
        'https://example.com',
      ],
      waybackMachineMetaRequest: [
        'https://archive.org/includes/fonts/Iconochive-Regular.woff?-ccsheb',
        'http://web.archive.org/static/css/banner-styles.css?v=1492119409.0',
        'http://web.archive.org/images/srpr/nav_logo80.png',
        
      ],
      unclassifiedRequest: [ ],  // I can't think of anything that should be unclassified.

    }
    Object.keys(urls).forEach((urlType) => {
      let urlSet = urls[urlType];
      urlSet.forEach((url) => {
        let requestType = classifyRequest({'url': url}, wbTab);
        expect(requestType, url).to.be.a('string');
        expect(requestType, url).to.equal(urlType);
      });
    });
  });
});

mocha.run();
