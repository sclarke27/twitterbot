class QuotesPage extends BasePage {
    constructor(parentDiv, routeName, botName) {
        super(parentDiv, routeName, botName);

        this.quotesList = [];

        this.quotesDiv = null;
        this.formDiv = null;
        this.form = null;
        this.authorInput = null;
        this.contentInput = null;
        this.canUseToggle = null;

    }

    start() {
        console.info('start page');

        this.quotesDiv = document.createElement('div');
        this.quotesDiv.id = 'quotesContainer';
        this.quotesDiv.className = 'container';
        this.quotesDiv.innerHTML = this.loadingText('Quotes');
        this.parentDiv.appendChild(this.quotesDiv);

        this.usedQuotesDiv = document.createElement('div');
        this.usedQuotesDiv.id = 'usedQuotesContainer';
        this.usedQuotesDiv.className = 'container';
        this.usedQuotesDiv.innerHTML = this.loadingText('Used Quotes');
        this.parentDiv.appendChild(this.usedQuotesDiv);

        this.formDiv = document.createElement('div');
        this.formDiv.id = 'quoteFormContainer';
        this.formDiv.className = 'container modalContainer';
        this.parentDiv.appendChild(this.formDiv);

        this.form = document.createElement('form');
        this.form.style.display = 'flex'
        this.form.style.flexDirection = 'column';

        this.quoteIdInput = document.createElement('input');
        this.quoteIdInput.type = 'hidden'
        this.form.appendChild(this.quoteIdInput);

        this.authorInput = document.createElement('input');
        this.authorInput.className = 'formInput';
        this.authorInput.setAttribute('placeholder', 'Author Name');
        this.form.appendChild(this.authorInput);

        this.contentInput = document.createElement('textarea');
        this.contentInput.className = 'formInput';
        this.contentInput.setAttribute('placeholder', 'Quote Content');
        this.form.appendChild(this.contentInput);
        this.formDiv.appendChild(this.form);

        const rowDiv = document.createElement('div');
        rowDiv.className = 'formRow';
        this.formDiv.appendChild(rowDiv);

        const labelDiv = document.createElement('div');
        labelDiv.innerHTML = 'Can Use'
        rowDiv.appendChild(labelDiv);

        const checkDiv = document.createElement('div');
        rowDiv.appendChild(checkDiv);

        this.canUseCheckbox = document.createElement('input');
        this.canUseCheckbox.setAttribute('type', 'checkbox')
        checkDiv.appendChild(this.canUseCheckbox);

        this.submitButton = document.createElement('input');
        this.submitButton.setAttribute('type', 'button');
        this.submitButton.value = "submit"
        this.submitButton.onclick = () => {

            const url = `/quote/update/${this.quoteIdInput.value}?author=${this.authorInput.value}&content=${this.contentInput.value}&canUse=${this.canUseCheckbox.checked}`
            // console.info(url)
            this.fetchData(url)
                .then((err, docs) => {
                    // console.info(err, docs);

                })
            this.refreshPageData();
            this.hideForm();
        };
        this.formDiv.appendChild(this.submitButton);

        this.cancelButton = document.createElement('input');
        this.cancelButton.setAttribute('type', 'button');
        this.cancelButton.value = "Cancel";
        this.cancelButton.onclick = this.hideForm.bind(this);
        this.formDiv.appendChild(this.cancelButton);

        super.start();
    }

    hideForm() {
        this.formDiv.style.opacity = '0';
        setTimeout(() => {
            this.formDiv.style.display = 'none';
        }, 300);
    }

    deleteQuote(quoteId) {
        if (confirm(`Delete ${quoteId}`)) {
            this.fetchData(`/quote/delete/${quoteId}`);
            this.refreshPageData();
        }
    }

    showForm(quoteId) {
        if (!quoteId) {
            this.quoteIdInput.value = 0;
            this.authorInput.value = '';
            this.contentInput.value = '';
            this.canUseCheckbox.checked = true;
        } else {
            this.fetchData(`/quote/${quoteId}`)
                .then((results) => {
                    const quoteData = results.quoteData[0];
                    this.quoteIdInput.value = quoteId;
                    this.authorInput.value = quoteData.author;
                    this.contentInput.value = quoteData.content;
                    this.canUseCheckbox.checked = quoteData.canUse;
                })
        }
        this.formDiv.style.display = 'flex';
        setTimeout(() => {
            this.formDiv.style.opacity = '1';
        }, 10);

    }

    newFromWikiQuote() {
        console.info('new wikiquote')

        return this.fetchData('/quotes/randomWikiQuote')
            .then((results) => {
                if (results.data.content.indexOf(0) == "\r\n") {
                    return this.newFromWikiQuote();
                } else {
                    console.info(results);
                    this.showForm();
                    const quoteData = results.data;
                    this.authorInput.value = quoteData.author;
                    this.contentInput.value = quoteData.content;
                    this.canUseCheckbox.checked = false;
                    return true;
                }
            })
    }

    refreshPageData() {
        this.fetchQuotesListData(this.botName)
            .then((results) => {
                console.info('[home] - quotes -', results);
                if (results.data) {
                    this.quotesList = results.data;
                    const filteredList = [];
                    for (const listItem of this.quotesList) {
                        filteredList.push({
                            '_id': listItem['_id'],
                            'Author': listItem.author,
                            'Quote': listItem.content,
                            'Edit': this.showForm.bind(this),
                            'Delete': this.deleteQuote.bind(this)
                        })
                    }
                    this.refreshList('Quotes', this.quotesDiv, filteredList);
                }
            });
        this.fetchData('/quotes/used')
            .then((results) => {
                console.info('[home] - used quotes -', results);
                if (results.data) {
                    this.quotesList = results.data;
                    const filteredList = [];
                    for (const listItem of this.quotesList) {
                        filteredList.push({
                            '_id': listItem['_id'],
                            'Author': listItem.author,
                            'Quote': listItem.content,
                            'Used Timestamp': listItem.lastUsed,
                            'Edit': this.showForm.bind(this)
                        })
                    }
                    this.refreshList('Used Quotes', this.usedQuotesDiv, filteredList);
                }
            });
        super.refreshPageData();
    }

    fetchQuotesListData(quoteIs) {
        const url = `/quotes`;
        return this.fetchData(url);
    }



}