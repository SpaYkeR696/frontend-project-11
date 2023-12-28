import { object, string, setLocale } from 'yup';

setLocale({
  string: {
    url: () => ({ key: 'errors.validation.validUrl' }),
  },
});

const schema = object().shape({
  url: string().url().required(),
});

const validateUniqueness = (fields, urls) => {
  const urlStrings = urls.map(({ url }) => url);

  if (urlStrings.includes(fields.url)) {
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

const validate = (fields, urls) => schema.validate(fields, { abortEarly: false })
  .then(() => validateUniqueness(fields, urls));

export default validate;
