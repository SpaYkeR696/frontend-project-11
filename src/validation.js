import * as yup from 'yup';

export default (existingReferences, value) => {
    yup.setLocale({
        mixed: {
            notOneOf: 'existingRssError',
        },
        string: {
            url: 'ivalidRssError',
        },
    });

    const schema = yup.string().url().notOneOf(existingReferences);
    return schema.validate(value);
};