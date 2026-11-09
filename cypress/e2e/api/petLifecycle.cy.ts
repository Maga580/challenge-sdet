import { createPet, deletePet, getPetById, updatePet } from '../../support/api/petApi'
import { createPetData } from '../../support/api/petData'
import { apiResponseSchema, petSchema } from '../../support/api/petSchemas'

describe('Petstore pet lifecycle', () => {
  let petId: number | undefined

  beforeEach(() => {
    petId = undefined
  })

  afterEach(() => {
    if (petId !== undefined) {
      deletePet(petId)
    }
  })

  it('creates, reads, updates, and deletes an isolated pet', () => {
    const pet = createPetData('available')
    petId = pet.id

    createPet(pet).then((response) => {
      expect(response.status).to.eq(200)
      expect(petSchema.parse(response.body)).to.deep.include(pet)
    })

    getPetById(pet.id).then((response) => {
      expect(response.status).to.eq(200)
      expect(petSchema.parse(response.body)).to.deep.include(pet)
    })

    updatePet({ ...pet, status: 'sold' }).then((response) => {
      expect(response.status).to.eq(200)
      expect(petSchema.parse(response.body)).to.deep.include({ ...pet, status: 'sold' })
    })

    getPetById(pet.id).then((response) => {
      expect(response.status).to.eq(200)
      expect(petSchema.parse(response.body)).to.deep.include({ ...pet, status: 'sold' })
    })

    deletePet(pet.id).then((response) => {
      expect(response.status).to.eq(200)
      expect(apiResponseSchema.parse(response.body)).to.deep.include({
        code: 200,
        message: String(pet.id),
      })
    })

    getPetById(pet.id).then((response) => {
      expect(response.status).to.eq(404)
      apiResponseSchema.parse(response.body)
    })
  })
})