// listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // return page data when requested
    if (message.type === 'GET_CONTENT') {
        const content = extractPageContent()
        sendResponse(content)
    }

})

const extractPageContent = () => {
    const title = document.title
    const url = window.location.href

    // extract only the readable page content
    const content = extractMainContent()

    return { title, url, content }
}

const extractMainContent = () => {

    // ignore elements that don't contain useful content
    const skipTags = ['script', 'style', 'nav', 'footer', 'header', 'iframe']

    // clone the page to avoid modifying the original DOM
    const clone = document.body.cloneNode(true)

    // remove unwanted elements
    skipTags.forEach(tag => {
        const elements = clone.querySelectorAll(tag)
        elements.forEach(el => el.remove())
    })

    // clean up extracted text
    const text = clone.innerText
        .replace(/\s+/g, ' ')  // replace multiple whitespaces with a single space
        .trim()

    // limit content to the first 5000 words
    const words = text.split(' ')
    if (words.length > 5000) {
        return words.slice(0, 5000).join(' ')
    }

    return text
}