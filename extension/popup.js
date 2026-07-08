// DOM elements
const loadingEl = document.getElementById('loading')
const notLoggedInEl = document.getElementById('not-logged-in')
const loggedInEl = document.getElementById('logged-in')
const pageTitleEl = document.getElementById('page-title')
const saveBtnEl = document.getElementById('save-btn')
const statusEl = document.getElementById('status')
const openSynapseEl = document.getElementById('open-synapse')

// backend URL
const SYNAPSE_URL = 'https://synapse-project-pi.vercel.app'

// show the required UI state
const showState = (state) => {
    // dide all sections first
    loadingEl.style.display = 'none'
    notLoggedInEl.style.display = 'none'
    loggedInEl.style.display = 'none'

    // display the requested section
    if (state === 'loading') loadingEl.style.display = 'block'
    if (state === 'not-logged-in') notLoggedInEl.style.display = 'block'
    if (state === 'logged-in') loggedInEl.style.display = 'block'
}

// display a status message
const showStatus = (message, type) => {
    statusEl.textContent = message
    statusEl.className = `status ${type}` // Apply success or error styling
}

// get the currently active browser tab
const getCurrentTab = async () => {
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    })
    return tabs[0]
}

// open Synapse in a new tab
openSynapseEl.addEventListener('click', () => {
    chrome.tabs.create({ url: SYNAPSE_URL })
})

// handle Save button click
saveBtnEl.addEventListener('click', async () => {
    saveBtnEl.disabled = true
    showStatus('Saving...', '')

    try {
        // get the current tab
        const tab = await getCurrentTab()

        // request page content from the content script
        const content = await chrome.tabs.sendMessage(tab.id, {
            type: 'GET_CONTENT'
        })

        // ask the background script to save the content
        const result = await chrome.runtime.sendMessage({
            type: 'SAVE_PAGE',
            data: content
        })

        if (result.success) {
            showStatus('Saved to Synapse!', 'success')
        } else {
            showStatus(result.message, 'error')
        }

    } catch (err) {
        // handle unexpected errors
        showStatus('Something went wrong', 'error')
    } finally {
        // re-enable the Save button
        saveBtnEl.disabled = false
    }
})

// initialize the popup
const init = async () => {
    // show loading state
    showState('loading')

    // check whether the user is authenticated
    const auth = await chrome.runtime.sendMessage({
        type: 'CHECK_AUTH'
    })

    if (!auth.loggedIn) {
        showState('not-logged-in')
        return
    }

    // display the current page title
    const tab = await getCurrentTab()
    pageTitleEl.textContent = tab.title || 'Current page'

    showState('logged-in')
}

// initialize the popup when it loads
init()