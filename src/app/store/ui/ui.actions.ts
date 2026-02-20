import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const UIActions = createActionGroup({
  source: 'UI',
  events: {
    'Show Loading': props<{ message?: string }>(),
    'Hide Loading': emptyProps(),
    'Show Error': props<{ message: string }>(),
    'Clear Error': emptyProps(),
    'Show Success': props<{ message: string }>(),
    'Clear Success': emptyProps()
  }
});
