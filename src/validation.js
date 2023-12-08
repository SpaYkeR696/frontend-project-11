import * as yup from 'yup';

yup.setLocale({
  string: {
    url: () => ({ key: 'errors.validation.validUrl'}),
  },
});

const shema = yup.object().shape({
  url: yup.string().url().required(),
});

const validateUniqueness = (state) => {
  const urls = state.urls.map(({ url }) => url);

  if (urls.includes(state.form.fields.url)){
    const error = new Error();
    error.inner = [
      {
        path: 'url',
        message: { key: 'errors.validation.duplicateUrl'},
      },
    ];
    throw error;
  }
};

const validate = (state) => shema.validate(state.form.fields, { abortErly: false })
  .then(() => validateUniqueness(state))
  .catch((error) => {
    const validationErrors = error.inner.reduce((acc, item) => {
      const { path, message } = item;
      return ({ ...acc, [path]: message.key });
    }, {});
    const newError = new Error();
    newError.errors = validationErrors

    throw newError;
  });

  export default validate;
