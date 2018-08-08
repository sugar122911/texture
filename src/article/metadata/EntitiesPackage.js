import EntityDatabase, {
  BibliographicEntry, JournalArticle, Book, Chapter, Person, Group, Organisation, Award,
  ConferencePaper, Report, DataPublication, MagazineArticle, NewspaperArticle, Patent,
  Software, Thesis, Webpage, Keyword, Subject, RefContrib, ArticleRecord
} from './EntityDatabase'

import EntityLabelsPackage from './EntityLabelsPackage'

export default {
  name: 'entities',
  configure(config, options = {}) {
    // ATTENTION: we started with this being used as an independent document model
    // until we found out that it is better to have it merged into the article model.
    // ATM, our JATS converters rely on this being still available.
    // TODO: refactor converters so that we can get rid of this
    if (options.standalone) {
      config.defineSchema({
        name: 'entities-database',
        version: '1.0.0',
        DocumentClass: EntityDatabase,
        defaultTextType: 'paragraph'
      })
    }
    config.addNode(ArticleRecord)
    config.addNode(BibliographicEntry)
    config.addNode(JournalArticle)
    config.addNode(ConferencePaper)
    config.addNode(DataPublication)
    config.addNode(MagazineArticle)
    config.addNode(NewspaperArticle)
    config.addNode(Patent)
    config.addNode(Software)
    config.addNode(Thesis)
    config.addNode(Webpage)
    config.addNode(Report)
    config.addNode(Book)
    config.addNode(Chapter)
    config.addNode(Person)
    config.addNode(Group)
    config.addNode(Organisation)
    config.addNode(Award)
    config.addNode(Keyword)
    config.addNode(Subject)
    config.addNode(RefContrib)
    config.import(EntityLabelsPackage)
  }
}