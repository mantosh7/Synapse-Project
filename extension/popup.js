// DOM elements
const loadingEl = document.getElementById('loading')
const notLoggedInEl = document.getElementById('not-logged-in')
const loggedInEl = document.getElementById('logged-in')
const pageTitleEl = document.getElementById('page-title')
const saveBtnEl = document.getElementById('save-btn')
const statusEl = document.getElementById('status')
const openSynapseEl = document.getElementById('open-synapse')
const loginBtnEl = document.getElementById('login-btn')
const emailEl = document.getElementById('email')
const passwordEl = document.getElementById('password')
const loginStatusEl = document.getElementById('login-status')

const SYNAPSE_URL = 'https://synapse-project-pi.vercel.app'

// Show one state at a time — loading, not-logged-in, logged-in
const showState = (state) => {
    loadingEl.style.display = 'none'
    notLoggedInEl.style.display = 'none'
    loggedInEl.style.display = 'none'

    if (state === 'loading') loadingEl.style.display = 'block'
    if (state === 'not-logged-in') notLoggedInEl.style.display = 'block'
    if (state === 'logged-in') loggedInEl.style.display = 'block'
}

// Show status message with type — success or error
const showStatus = (message, type) => {
    statusEl.textContent = message
    statusEl.className = `status ${type}`
}

// Get the current active tab
const getCurrentTab = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    return tabs[0]
}

// Open Synapse website in new tab
openSynapseEl.addEventListener('click', () => {
    chrome.tabs.create({ url: SYNAPSE_URL })
})

// Login button click — send credentials to background
loginBtnEl.addEventListener('click', async () => {
    const email = emailEl.value.trim()
    const password = passwordEl.value.trim()

    if (!email || !password) {
        loginStatusEl.textContent = 'Please fill all fields'
        loginStatusEl.className = 'status error'
        return
    }

    loginBtnEl.disabled = true
    loginStatusEl.textContent = 'Logging in...'
    loginStatusEl.className = 'status'

    const result = await chrome.runtime.sendMessage({
        type: 'LOGIN',
        data: { email, password }
    })

    if (result.success) {
        init() // Refresh popup after login
    } else {
        loginStatusEl.textContent = result.message
        loginStatusEl.className = 'status error'
        loginBtnEl.disabled = false
    }
})

// Save button click — get page content and send to backend
saveBtnEl.addEventListener('click', async () => {
    saveBtnEl.disabled = true
    showStatus('Saving...', '')

    try {
        const tab = await getCurrentTab()

        // Ask content script for page content
        const content = await chrome.tabs.sendMessage(tab.id, {
            type: 'GET_CONTENT'
        })

        // Send content to background to save
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
        showStatus('Something went wrong', 'error')
    } finally {
        saveBtnEl.disabled = false
    }
})

// Init — check auth and show correct state
const init = async () => {
    showState('loading')

    const auth = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' })

    if (!auth.loggedIn) {
        showState('not-logged-in')
        return
    }

    // Show current page title
    const tab = await getCurrentTab()
    pageTitleEl.textContent = tab.title || 'Current page'

    showState('logged-in')
}

init()