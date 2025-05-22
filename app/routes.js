//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Import and register the editorjs routes
const editorjsRoutes = require('./routes/editorjs')
router.use('/editorjs', editorjsRoutes)

// Add a redirect from the home page to the editorjs demo
router.get('/', function(req, res) {
  res.redirect('/editorjs/select-issues')
})
