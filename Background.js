"use strict";

// Things responded to in the platform of Hammer.
//
// chrome.windows.onRemoved.addListener(saveSites);
// chrome.windows.onCreated.addListener(windowRemove);
// chrome.management.onUninstalled.addListener(handleUninstall);
// chrome.management.onDisabled.addListener(handleDisable);
// chrome.webRequest.onErrorOccurred.addListener(onRequestError,
//                                               { urls: ["<all_urls>"] });
chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders,
                                                  { urls: ["<all_urls>"] },
                                                  ["blocking", "requestHeaders"]);
// chrome.webRequest.onCompleted.addListener(onRequestCompleted,
//                                           { urls: ["<all_urls>"] },
//                                           ["responseHeaders"]);
// chrome.webNavigation.onCompleted.addListener(onNavigationCompleted);
// chrome.webNavigation.onErrorOccurred.addListener(onNavigationError);



console.log('Background page of Rewriting History Defense is loaded.');

class Counts {
  constructor() {
    this.waybackMachineMetaRequest = 0;
    this.archiveRequest = 0;
    this.archiveEscape = 0;
    this.notOnArchive = 0;
    this.unclassifiedRequest = 0;
  }
}

class Visit {
  constructor(tabId, url) {
    this.tabId = tabId;
    this.url = url;

    this.counts = new Counts();
    this.requestURLs = [];
  }
}

const globalCounts = new Counts();

// This is keyed on visitID, which can be obtained using getVisitIDFromTab(tab),
// which uses tab.url and tab.tabId to compute a unique key.
const visits = {};

initializeMessageListeners();

// Input: requestDetails, an object containing information about the request.
// Output: An object blocking/not blocking the request.
function onBeforeSendHeaders(requestDetails) {
  if (typeof requestDetails.tabId !== 'number' && requestDetails.tabId < 0) {
    console.log('tabid is', requestDetails.tabId);
    console.log(tab);

  } else {
    chrome.tabs.get(requestDetails.tabId, function(tab) {
      let requestType = classifyRequest(requestDetails, tab);

      let visit = getVisitForTab(tab);
      visit.counts[requestType] += 1
      visit.requestURLs.push(requestDetails.url);
      // console.log('visitID: ' + visitIDFromTab(tab))
      // console.log(visit);

      globalCounts[requestType] += 1;
    });
  }

  let willBlock = shouldBlock(requestDetails);
  return {
    cancel: willBlock
  };
}

function shouldBlock(requestDetails) {
  // TODO: Blocking logic.
  return false;
}


// This is a little bit hacky (endsWith instead of some reliable tld/domain extracting)
// but it should mostly work. 
//
// Returns true for WBM meta requests (e.g., WBM analytics, time-browsing bar, etc.)
// and for archive requests (requests for actual archived URLs).
//
// Returns false for all requests to domains other than archive.org.
function isToArchiveDotOrg(requestDetails) {
  return getHostnameFromUrl(requestDetails.url).endsWith('archive.org');
}

// Checks whether the URL of the request is (roughly) of the form:
// web.archive.org/web/<timestamp>/<url>
function isArchiveRequest(requestDetails) {
  const archiveRequestURLRegex = new RegExp('^(https?://)?web.archive.org/web/\\d+', 'i');
  return archiveRequestURLRegex.test(requestDetails.url);
}

// Get the entire hostname portion of the URL, which is everything that's not
// the scheme, port or path. Inclues subdomains as part of what's returned.
function getHostnameFromUrl(fullUrl) {
  // If there's no scheme, we need to prepend a scheme, since relative URLs will
  // be interpreted as relative to the current page. We'll prepend http://, since
  // it doesn't really matter what it is.
  if (!hasScheme(fullUrl)) {
    fullUrl = 'http://' + fullUrl;
  }
  return (new URL(fullUrl)).hostname;
}

function hasScheme(url) {
  const hasSchemeRE = new RegExp('^\\w+://');
  return hasSchemeRE.test(url);
}

// Returns true if the request is to a site outside of the Wayback Machine.
function isArchiveEscape(requestDetails) {
  return !isToArchiveDotOrg(requestDetails);

  // Example:
  // http://www.google.com  (TRUE)
  // but not
  // https://web.archive.org/web/20150324001529/http://www.google.com/ (FALSE)
}

// Get the page stats object for 
function getVisitForTab(tab) {
  let visitID = visitIDFromTab(tab);
  if (visits[visitID] === undefined) {
    visits[visitID] = new Visit(tab.id, tab.url);
  }
  return visits[visitID];

}

// Could be improved to compute a more complicated function, though human 
// readable is highly desirable. tabId comes before tab.url because URLs can't
// start with numbers.
//
// This version uses `>` to delimit the tabId and tab.url because `>` can't appear
// in URLs -- I think this guarantees that if tabId is unique, all tabId/URL pairs
// produce unique visitIDs.
function visitIDFromTab(tab) {
  return `${tab.id}>${tab.url}`;
}

function classifyRequest(requestDetails, tab) {
  if (!getHostnameFromUrl(tab.url).endsWith('archive.org')) {
    return 'notOnArchive';
  }

  let url = requestDetails.url;
  if (!isArchiveRequest(requestDetails) && isToArchiveDotOrg(requestDetails)) {
    return 'waybackMachineMetaRequest';
  } else if (isArchiveRequest(requestDetails)) {
    return 'archiveRequest';
  } else if (isArchiveEscape(requestDetails)) {
    return 'archiveEscape';
  } else {
    return 'unclassifiedRequest';
  }
}

function initializeMessageListeners() {
  // Listen for messages from the content script and popup pages
  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === 'getGlobalCounts') {
        sendResponse(globalCounts);
      }
    }
  );
}