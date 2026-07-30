import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address.')
    .required('Email address is required.'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters.')
    .required('Password is required.'),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters.')
    .required('Full name is required.'),
  email: Yup.string()
    .email('Please enter a valid email address.')
    .required('Email address is required.'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters.')
    .required('Password is required.'),
});
