import { getRequiredUrl } from '../config'
import type { Pet } from './petSchemas'

const getBaseUrl = (): string => getRequiredUrl('petstoreUrl', 'PETSTORE_URL')

export function createPet(pet: Pet) {
  return cy.request({
    method: 'POST',
    url: `${getBaseUrl()}/pet`,
    body: pet,
  })
}

export type InvalidPetPayload = Omit<Pet, 'id'> & { id: string }

export function createPetWithInvalidPayload(body: InvalidPetPayload) {
  return cy.request({
    method: 'POST',
    url: `${getBaseUrl()}/pet`,
    body,
    failOnStatusCode: false,
  })
}

export function getPetById(id: number) {
  return cy.request({
    method: 'GET',
    url: `${getBaseUrl()}/pet/${id}`,
    failOnStatusCode: false,
  })
}

export function getPetByInvalidId(id: string) {
  return cy.request({
    method: 'GET',
    url: `${getBaseUrl()}/pet/${id}`,
    failOnStatusCode: false,
  })
}

export function getPetByInvalidStatus(invalidStatus: string) {
  return cy.request({
    method: 'GET',
    url: `${getBaseUrl()}/pet/findByStatus`,
    qs: { status: invalidStatus },
  })
}

export function updatePet(pet: Pet) {
  return cy.request({
    method: 'PUT',
    url: `${getBaseUrl()}/pet`,
    body: pet,
    headers: { 'Content-Type': 'application/json' },
    failOnStatusCode: false,
  })
}

export function deletePet(id: string | number) {
  return cy.request({
    method: 'DELETE',
    url: `${getBaseUrl()}/pet/${id}`,
    failOnStatusCode: false,
  })
}
