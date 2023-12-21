import { object, string, setLocale } from 'yup';

setLocale({
  string: {
    url: () => ({ key: 'errors.validation.validUrl' }),
  },
});

const schema = object().shape({
  url: string().url().required(),
});

const validateUniqueness = (state) => {
  const urls = state.urls.map(({ url }) => url);

  if (urls.includes(state.form.fields.url)) {
    const error = new Error();
    error.inner = [
      {
        path: 'url',
        message: { key: 'errors.validation.duplicateUrl' },
      },
    ];

    throw error;
  }
};

const validate = (state) => schema.validate(state.form.fields, { abortEarly: false })
  .then(() => validateUniqueness(state))
  .catch((error) => {
    const validationErrors = error.inner.reduce((accumulator, item) => {
      const { path, message } = item;
      return ({ ...accumulator, [path]: message.key });
    }, {});

    const newError = new Error();
    newError.errors = validationErrors;

    throw newError;
  });

export default validate;
