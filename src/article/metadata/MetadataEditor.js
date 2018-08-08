import { Component } from 'substance'
import { Managed, createEditorContext } from '../../kit'
import ArticleEditorSession from '../ArticleEditorSession'
import ArticleAPI from '../ArticleAPI'
import MetadataSection from './MetadataSection'
import ExperimentalArticleValidator from '../ExperimentalArticleValidator'

const SECTIONS = [
  { label: 'Article', modelType: 'article-record' },
  { label: 'Authors', modelType: 'authors' },
  { label: 'Translations', modelType: 'translatables' },
  { label: 'Editors', modelType: 'editors' },
  { label: 'Groups', modelType: 'groups' },
  { label: 'Affiliations', modelType: 'organisations' },
  { label: 'Awards', modelType: 'awards' },
  { label: 'Figures', modelType: 'figures' },
  { label: 'Footnotes', modelType: 'footnotes' },
  { label: 'References', modelType: 'references' },
  { label: 'Keywords', modelType: 'keywords' },
  { label: 'Subjects', modelType: 'subjects' }
]

export default class MetadataEditor extends Component {
  constructor (...args) {
    super(...args)

    this.handleActions({
      executeCommand: this._executeCommand,
      toggleOverlay: this._toggleOverlay,
      startWorkflow: this._startWorkflow,
      closeModal: this._closeModal
    })

    this._initialize(this.props)
  }

  // TODO: shouldn't we react on willReceiveProps?
  _initialize (props) {
    const { articleSession, config, archive } = props
    const editorSession = new ArticleEditorSession(
      articleSession.getDocument(), config, this, {
        workflowId: null,
        viewName: this.props.viewName
      }
    )
    const api = new ArticleAPI(editorSession, config.getModelRegistry())
    this.api = api
    this.editorSession = editorSession
    this.context = Object.assign(createEditorContext(config, editorSession), {
      editor: this,
      api,
      urlResolver: archive
    })
    this.articleValidator = new ExperimentalArticleValidator(articleSession, editorSession.editorState)

    // initial reduce etc.
    this.editorSession.initialize()
    this.articleValidator.initialize()

    this.context.appState.addObserver(['workflowId'], this.rerender, this, { stage: 'render' })
    this.context.appState.addObserver(['viewName'], this._updateViewName, this, { stage: 'render' })
  }

  _updateViewName () {
    let appState = this.context.appState
    this.send('updateViewName', appState.viewName)
  }

  dispose () {
    const appState = this.context.appState
    const articleSession = this.props.articleSession
    const editorSession = this.editorSession
    const articleValidator = this.articleValidator
    articleSession.off(this)
    editorSession.dispose()
    articleValidator.dispose()
    appState.removeObserver(this)
    // TODO: do we really need to clear here?
    this.empty()
  }

  render ($$) {
    let el = $$('div').addClass('sc-metadata-editor')
    el.append(
      this._renderMainSection($$),
      this._renderContextPane($$)
    )
    return el
  }

  _renderMainSection ($$) {
    const appState = this.context.appState
    let mainSection = $$('div').addClass('se-main-section')
    mainSection.append(
      this._renderToolbar($$),
      $$('div').addClass('se-content-section').append(
        this._renderTOCPane($$),
        this._renderContentPanel($$)
      )
    )
    if (appState.workflowId) {
      let Modal = this.getComponent('modal')
      let WorkflowComponent = this.getComponent(appState.workflowId)
      let workflowModal = $$(Modal).addClass('se-workflow-modal').append(
        $$(WorkflowComponent).ref('workflow')
      )
      mainSection.append(workflowModal)
    }
    return mainSection
  }

  _renderToolbar ($$) {
    const Toolbar = this.getComponent('toolbar')
    let config = this.props.config
    return $$('div').addClass('se-toolbar-wrapper').append(
      $$(Managed(Toolbar), {
        toolPanel: config.getToolPanel('toolbar'),
        bindings: ['commandStates']
      }).ref('toolbar')
    )
  }

  _renderTOCPane ($$) {
    const api = this.api
    let el = $$('div').addClass('se-toc-pane').ref('tocPane')
    let tocEl = $$('div').addClass('se-toc')
    SECTIONS.forEach(section => {
      let model = api.getModel(section.modelType)
      if (model.isCollection) {
        const items = model.getItems()
        tocEl.append(
          $$('a').addClass('se-toc-item')
            .attr({ href: '#' + model.id })
            .append(section.label + ' (' + items.length + ')')
        )
      } else {
        tocEl.append(
          $$('a').addClass('se-toc-item')
            .attr({ href: '#' + model.id })
            .append(section.label)
        )
      }
    })
    el.append(tocEl)
    return el
  }

  _renderContentPanel ($$) {
    const api = this.api
    const ScrollPane = this.getComponent('scroll-pane')

    let contentPanel = $$(ScrollPane, {
      scrollbarPosition: 'right'
    }).ref('contentPanel')

    let sectionsEl = $$('div').addClass('se-sections')
    SECTIONS.forEach(section => {
      const model = api.getModel(section.modelType)
      const id = model.id
      let content = $$(MetadataSection, { model }).attr({id}).ref(id)
      sectionsEl.append(content)
    })

    contentPanel.append(sectionsEl)

    return contentPanel
  }

  _renderContextPane ($$) { // eslint-disable-line no-unused-vars
    // TODO: here we would instanstiate the issue panel for instance
  }

  _executeCommand (name, params) {
    this.editorSession.executeCommand(name, params)
  }

  _toggleOverlay (overlayId) {
    const appState = this.context.appState
    if (appState.overlayId === overlayId) {
      appState.overlayId = null
    } else {
      appState.overlayId = overlayId
    }
    appState.propagateUpdates()
  }

  _startWorkflow (workflowId) {
    const appState = this.context.appState
    appState.workflowId = workflowId
    appState.overlayId = workflowId
    appState.propagateUpdates()
  }

  _closeModal () {
    const appState = this.context.appState
    appState.workflowId = null
    appState.overlayId = null
    appState.propagateUpdates()
  }
}