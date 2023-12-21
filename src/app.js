import i18next from 'i18next';
import ru from './locales/ru.js';
import { elements } from './modules.js';
import initState from './viewer.js';
import initControl from './initiate.js';

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
      const state = initState(i18nextInstance);

      initControl(elements, state);
    });
};

export default app;
