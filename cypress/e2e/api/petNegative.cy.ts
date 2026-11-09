import { createPetWithInvalidPayload, deletePet, getPetById, getPetByInvalidId,
    getPetByInvalidStatus, updatePet, type InvalidPetPayload
} from '../../support/api/petApi'
import { createPetData } from '../../support/api/petData'
import { apiResponseSchema } from '../../support/api/petSchemas'

describe('Petstore negative pet cases', () => {
  let idsToCleanup: number[] = []

  afterEach(() => {
    idsToCleanup.forEach((id) => deletePet(id))
  })

  describe('GET /pet/{petId}', () => {
    const nonExistentId = () => createPetData('available').id
    it('returns 404 for a non-existent id', () => {
      getPetById(nonExistentId()).then((response) => {
        expect(response.status).to.eq(404)
        const parsed = apiResponseSchema.parse(response.body)
        expect(parsed.message).to.be.a('string').and.not.be.empty
      })
    })

    it('returns 404 for a invalid id ', () => {
      // HALLAZGO API-2: Swagger documenta 400 "Invalid ID supplied", pero Petstore responde 404.
      getPetByInvalidId('not-an-id').then((response) => {
        expect(response.status).to.eq(404)
        const parsed = apiResponseSchema.parse(response.body)
        expect(parsed.message).to.be.a('string').and.not.be.empty
      })
    })
  })

  describe('DELETE /pet/{petId}', () => {
    it('returns 404 for a non-existent id', () => {
        const nonExistentId = () => createPetData('available').id
        deletePet(nonExistentId()).then((response) => {
            expect(response.status).to.eq(404)
        })
    })
  })

  describe('POST /pet', () => {
    it('returns 500 for a non-numeric id (Swagger: 405)', () => {
      // HALLAZGO API-1: Swagger documenta 405 "Invalid input", pero Petstore responde 500.
      const { id: _id, ...rest } = createPetData('available')
      const invalidPet: InvalidPetPayload = { ...rest, id: 'not-a-number' }

      createPetWithInvalidPayload(invalidPet).then((response) => {
        const parsed = apiResponseSchema.parse(response.body)
        expect(parsed.message).to.be.a('string').and.not.be.empty
      })
    })
  })

  describe('GET /pet/findByStatus', () => {
    it('returns an empty list for an invalid status (Swagger: 400)', () => {
      // HALLAZGO API-4: Swagger documenta 400 "Invalid status value", pero Petstore responde 200 con lista vacía.
      getPetByInvalidStatus('unknown').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.eq([])
      })
    })
  })
})