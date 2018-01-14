const Utils = require('../modules/utils');
const fetch = require("node-fetch");

class WikiQuote {

    constructor(wikiUrl, authorList, showDebug = false) {
        this.wikiUrl = wikiUrl;
        this.showDebug = showDebug;
        this.authorList = authorList;
        if (this.showDebug) {
            console.info(`[wikiQuote] constructed: ${wikiUrl}`);
        }
    }

    getRandomQuote() {
        const searchQuery = Utils.randomFromArray(this.authorList);
        if (this.showDebug) {
            console.info(`[wikiQuote] using: ${searchQuery}`);
        }

        let currPageId = -1;
        return this.getPageIdForTitle(searchQuery)
            .then((pageId) => {
                currPageId = pageId;
                return this.getSectionsForPageId(pageId);
            })
            .then((sections) => {
                const randomSection = Utils.randomFromArray(sections);
                const randomSectionId = randomSection.index || 0;
                return this.getSectionContent(currPageId, randomSectionId);
            });
    }

    getPageIdForTitle(searchQuery) {
        const newUrl = `${this.wikiUrl}/w/api.php?format=json&action=query&titles=${searchQuery}`;

        if (this.showDebug) {
            console.info('[wikiQuote] getPageIdForTitle url:', newUrl);
        }
        return fetch(newUrl)
            .then(response => {
                return response.json();
            })
            .then((response) => {
                const pageId = Object.keys(response.query.pages)[0];
                if (pageId > 0) {
                    // this.getPageSectionId(pageId);
                    if (this.showDebug) {
                        console.info('[wikiQuote] return page ID:', pageId);
                    }
                    return pageId;
                }
            })
            .catch((error) => {
                console.error('[wikiQuote][FETCH ERROR]', error);
            })
    }

    getSectionsForPageId(pageId) {
        const newUrl = `${this.wikiUrl}/w/api.php?format=json&action=parse&prop=sections&pageid=${pageId}`;

        if (this.showDebug) {
            console.info('[wikiQuote] getRandomSectionId url:', newUrl);
        }

        return fetch(newUrl)
            .then(response => {
                return response.json();
            })
            .then((response) => {
                return response.parse.sections;
            })
            .catch((error) => {
                console.error('[wikiQuote] [FETCH ERROR]', error);
            })
    }

    getRandomSectionForPage(pageId) {
        if (this.showDebug) {
            console.info('[wikiQuote] getRandomSectionId pageId:', pageId);
        }

        this.getSectionsForPageId(pageID)
            .then((sections) => {
                const randomSection = Utils.randomFromArray(sections);
                const randomSectionId = randomSection.index;
                if (this.showDebug) {
                    console.info(randomSectionId);
                }
                // this.getSectionContent(pageId, randomSectionId);
                return randomSectionId;
            })
            .catch((error) => {
                console.error('[FETCH ERROR]', error);
            })
    }

    getSectionContent(pageId, sectionId) {
        const newUrl = `${this.wikiUrl}/w/api.php?format=json&action=parse&noimages=&pageid=${pageId}&section=${sectionId}`;

        if (this.showDebug) {
            console.info('[wikiQuote]', newUrl);
        }
        return fetch(newUrl)
            .then(response => {
                return response.json();
            })
            .then((response) => {
                const regex = new RegExp(/(<([^>]+)>)/ig);
                const title = response.parse.title;
                const text = response.parse.text['*'];
                const rawText = text.replace(regex, '');
                const quoteList = text.split('</li>');

                const selectedQuote = quoteList[Utils.randomFromArray(Object.keys(quoteList))];
                let parsedQuote = selectedQuote.substring(selectedQuote.indexOf('<li>'), selectedQuote.length).replace(regex, '');
                if (parsedQuote.indexOf('\n') > 0) {
                    parsedQuote = parsedQuote.substring(0, parsedQuote.indexOf('\n'));
                }
                const spaceRegex = new RegExp("[ ]+", "g");
                const dotRegex = new RegExp("[.]+", "g")
                const signature = `\n#${title.replace(spaceRegex,'').replace(dotRegex,'')}`;
                parsedQuote = `${parsedQuote}${signature}`;
                if (parsedQuote.length < 280 && parsedQuote.length > (15 + signature.length)) {
                    if (this.showDebug) {
                        console.info('[wikiQuote]', parsedQuote.length);
                        console.info('[wikiQuote]', parsedQuote);
                    }
                    return parsedQuote;
                } else {
                    if (this.showDebug) {
                        console.error('[wikiQuote] bad format');
                        // console.info('[wikiQuote]', parsedQuote);
                        // console.error('[wikiQuote] raw');
                        // console.info('[wikiQuote]', rawText);
                    }
                    return '';
                }
            })
            .catch((error) => {
                console.error('[wikiQuote][FETCH ERROR]', error);
            })
    }
}

module.exports = WikiQuote;