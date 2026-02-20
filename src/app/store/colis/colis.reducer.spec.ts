import { colisReducer, initialState } from './colis.reducer';
import { ColisActions } from './colis.actions';
import { Colis } from '../../core/models/colis.model';

describe('Colis Reducer', () => {
  const mockColis: Colis = {
    id: '1',
    description: 'Test Package',
    poids: 5,
    priorite: 'NORMALE' as any,
    statut: 'CREE' as any,
    clientExpediteurId: 'client1',
    destinataireId: 'dest1',
    villeDestination: 'Casablanca'
  };

  it('should set loading on load colis', () => {
    const action = ColisActions.loadColis({
      pageRequest: { page: 0, size: 20 }
    });
    const state = colisReducer(initialState, action);

    expect(state.loading).toBe(true);
  });

  it('should add colis on load success', () => {
    const response = {
      content: [mockColis],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
      empty: false
    };

    const action = ColisActions.loadColisSuccess({ response });
    const state = colisReducer(initialState, action);

    expect(state.ids.length).toBe(1);
    expect(state.entities['1']).toEqual(mockColis);
    expect(state.loading).toBe(false);
  });

  it('should update status optimistically', () => {
    const stateWithColis = colisReducer(
      initialState,
      ColisActions.loadColisSuccess({
        response: {
          content: [mockColis],
          totalElements: 1,
          totalPages: 1,
          size: 20,
          number: 0,
          first: true,
          last: true,
          empty: false
        }
      })
    );

    const action = ColisActions.updateStatus({
      id: '1',
      statut: 'EN_TRANSIT' as any
    });
    const state = colisReducer(stateWithColis, action);

    expect(state.entities['1']?.statut).toBe('EN_TRANSIT');
  });
});
