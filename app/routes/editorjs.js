const express = require('express')
const router = express.Router()

// Store data in session
const storeData = (req, key, value) => {
  if (!req.session.data) {
    req.session.data = {}
  }
  req.session.data[key] = value
}

// Get data from session
const getData = (req, key) => {
  if (!req.session.data) {
    return null
  }
  return req.session.data[key]
}

// Default content for each issue type
const getDefaultContent = (issue) => {
  const defaultContent = {
    'financial': {
      time: Date.now(),
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'Please provide details about any financial issues affecting your business.'
          }
        }
      ]
    },
    'adverts': {
      time: Date.now(),
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'Please provide details about any advertising issues affecting your business.'
          }
        }
      ]
    },
    'operating-centers': {
      time: Date.now(),
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'Please provide details about any issues with your operating centers.'
          }
        }
      ]
    },
    'directors': {
      time: Date.now(),
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'Please provide details about any issues concerning company directors.'
          }
        }
      ]
    }
  }

  return defaultContent[issue] || {
    time: Date.now(),
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Please provide details about this issue.'
        }
      }
    ]
  }
}

// Home page - redirect to select issues
router.get('/', (req, res) => {
  res.redirect('/editorjs/select-issues')
})

// Select issues page
router.get('/select-issues', (req, res) => {
  res.render('editorjs/select-issues.html', {
    error: null
  })
})

router.post('/select-issues', (req, res) => {
  // Store selected issues in session
  let selectedIssues = Array.isArray(req.body.issues) ? req.body.issues : [req.body.issues].filter(Boolean)
  
  // Filter out any "_unchecked" values or other invalid entries
  selectedIssues = selectedIssues.filter(issue => issue !== '_unchecked')
  
  if (!selectedIssues || selectedIssues.length === 0) {
    return res.render('editorjs/select-issues.html', {
      error: 'Please select at least one issue'
    })
  }
  
  storeData(req, 'selectedIssues', selectedIssues)
  
  // Create default content for each issue
  const issueContent = {}
  selectedIssues.forEach(issue => {
    issueContent[issue] = getDefaultContent(issue)
  })
  
  storeData(req, 'issueContent', issueContent)
  
  res.redirect('/editorjs/editor')
})

// Editor page
router.get('/editor', (req, res) => {
  const selectedIssues = getData(req, 'selectedIssues')
  
  if (!selectedIssues || selectedIssues.length === 0) {
    return res.redirect('/editorjs/select-issues')
  }
  
  res.render('editorjs/editor.html', {
    selectedIssues: selectedIssues,
    issueContent: getData(req, 'issueContent')
  })
})

router.post('/editor', (req, res) => {
  // Store the edited content from Editor.js
  const editedContent = {}
  
  // Parse the JSON strings from the form
  if (req.body.content) {
    Object.keys(req.body.content).forEach(issue => {
      try {
        editedContent[issue] = JSON.parse(req.body.content[issue])
      } catch (error) {
        console.error(`Error parsing content for ${issue}:`, error)
        editedContent[issue] = null
      }
    })
  }
  
  storeData(req, 'editedContent', editedContent)
  
  res.redirect('/editorjs/summary')
})

// Summary page
router.get('/summary', (req, res) => {
  const editedContent = getData(req, 'editedContent')
  
  if (!editedContent) {
    return res.redirect('/editorjs/select-issues')
  }
  
  res.render('editorjs/summary.html', {
    selectedIssues: getData(req, 'selectedIssues'),
    editedContent: editedContent
  })
})

module.exports = router
