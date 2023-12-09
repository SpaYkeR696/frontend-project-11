import onChange from 'on-change';
import i18next from 'i18next';
import watch from './viewer.js';
import ru from './locales/ru.js';
import { initialState, elements } from './modules.js';
import initiateControl from './initiate.js';

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: 'ru',
      debug: true,
      resources: {
        ru,
      },
    })
    .then(() => {
      const state = onChange(initialState, (path, value, _, applyData) => {
        watch(path, value, applyData, elements, state, i18nextInstance);
      });

      initiateControl(elements, state);
    });
};

export default app;
