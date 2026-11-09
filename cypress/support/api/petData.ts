import type { Pet } from './petSchemas'

export function createPetData(status: Pet['status'] = 'available'): Pet {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const unique = Array.from({ length: 6 }, () =>
    letters.charAt(Cypress._.random(0, letters.length - 1)),
  ).join('')

  const sequence: number = (Cypress._.random(0, 999) + 1) % 1000
  const id = Date.now() * 1000 + sequence

  return {
    id,
    category: {
      id: 0,
      name: 'Pet',
    },
    name: unique,
    photoUrls: [],
    tags: [{ id, name: unique }],
    status,
  }
}