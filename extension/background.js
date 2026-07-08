const BACKEND_URL = 'https://synapse-project-x04n.onrender.com'

// listen for messages coming from popup / content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // popup wants to know if user is logged in
    if (message.type === 'CHECK_AUTH') {
        checkAuth().then(sendResponse)
        return true   // keep channel open for async response
    }

    // popup wants to save the current page
    if (message.type === 'SAVE_PAGE') {
        savePage(message.data).then(sendResponse)
        return true
    }

})

// Check if a token exists
const checkAuth = async () => {
    const result = await chrome.storage.local.get('token')

    if (!result.token) {
        return { loggedIn: false }
    }

    // Token exists — verify it with the backend
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${result.token}`
            }
        })

        if (response.ok) {
            const data = await response.json()
            return { loggedIn: true, user: data.data.user }
        }

        // Token is invalid — remove it
        await chrome.storage.local.remove('token')
        return { loggedIn: false }

    } catch (err) {
        return { loggedIn: false }
    }
}

// Save page content to the backend
const savePage = async (data) => {
    const result = await chrome.storage.local.get('token')

    if (!result.token) {
        return { success: false, message: 'Not logged in' }
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/documents/web`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${result.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: data.title,
                content: data.content,
                url: data.url
            })
        })

        if (response.ok) {
            return { success: true, message: 'Saved to Synapse!' }
        }

        return { success: false, message: 'Failed to save' }

    } catch (err) {
        return { success: false, message: 'Connection error' }
    }
}