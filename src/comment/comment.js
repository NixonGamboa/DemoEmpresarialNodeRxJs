export default function buildMakeComment ({ Id, md5, sanitize, makeSource }) {
  return function makeComment ({
    author,
    createdOn = Date.now(),
    id = Id.makeId(),
    source,
    modifiedOn = Date.now(),
    postId,
    published = false,
    replyToId,
    text
  } = {}) {
    if (!Id.isValidId(id)) {
      throw new Error('El comentario debe tener un id valido.')
    }
    if (!author) {
      throw new Error('El comentario debe teneer un autor.')
    }
    if (author.length < 2) {
      throw new Error("El autor del comentario debe tener una longitud de al menos 2 caracteres.")
    }
    if (!postId) {
      throw new Error('El comentario debe contener un Id de Post.')
    }
    if (!text || text.length < 1) {
      throw new Error('El comentario debe incluir al menos un caracter de texto.')
    }
    if (!source) {
      throw new Error('El comentario debe tener una fuente.')
    }
    if (replyToId && !Id.isValidId(replyToId)) {
      throw new Error('Si se provee, el Comentario debe contener un id de respuesta valido.')
    }

    let sanitizedText = sanitize(text).trim()
    if (sanitizedText.length < 1) {
      throw new Error('El comentario contiene texto no usable.')
    }

    const validSource = makeSource(source)
    const deletedText = '.xX Este comentario ha sido eliminado Xx.'
    let hash

    return Object.freeze({
      getAuthor: () => author,
      getCreatedOn: () => createdOn,
      getHash: () => hash || (hash = makeHash()),
      getId: () => id,
      getModifiedOn: () => modifiedOn,
      getPostId: () => postId,
      getReplyToId: () => replyToId,
      getSource: () => validSource,
      getText: () => sanitizedText,
      isDeleted: () => sanitizedText === deletedText,
      isPublished: () => published,
      markDeleted: () => {
        sanitizedText = deletedText
        author = 'deleted'
      },
      publish: () => {
        published = true
      },
      unPublish: () => {
        published = false
      }
    })

    function makeHash () {
      return md5(
        sanitizedText +
          published +
          (author || '') +
          (postId || '') +
          (replyToId || '')
      )
    }
  }
}
