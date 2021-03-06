import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormGroup,
  TextField,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ApolloError } from 'apollo-boost';
import { useFormik } from 'formik';
import { ExecutionResult } from 'graphql';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { object, string } from 'yup';
import { AppContext } from '../components/AppProvider';
import { AuthContext } from '../components/AuthProvider';
import Layout from '../components/Layout';
import { RegisterUserMutation, useRegisterUserMutation } from '../graphql';

type RegisterValues = {
  username: string;
  email: string;
  password: string;
};

const validationSchema = object().shape<RegisterValues>({
  email: string().label('Email').email().min(11).max(254).required(),
  password: string().label('Password').min(8).max(35).required(),
  username: string().label('Username').max(35).required(),
});

const Register: NextPage = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [showAlertBar, setShowAlertBar] = useState(true);
  const router = useRouter();
  const [registerUser, { loading }] = useRegisterUserMutation();
  const { authenticated } = useContext(AuthContext);
  const { addAlert } = useContext(AppContext);

  /** Hide the Status bar on cross button click. */
  const handleCloseButtonClick = () => {
    setErrorMessage(undefined);
    setShowAlertBar(false);
  };

  /**
   * Handle registration success.
   *
   * @param result Result received
   */
  const handleRegisterUserSuccess = (result: ExecutionResult<RegisterUserMutation>) => {
    if (result.data?.registerUser?.user?.email != null) {
      localStorage.setItem('registration-success', 'yes');

      // Set form field values to empty.
      setErrorMessage(undefined);

      // Add a message.
      setSuccessMessage('Registration Successful! You will be redirected to login page now...');

      setTimeout(() => {
        // Send the user to Login page.
        router.push('/login?registered=true');
      }, 3000);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: ({ username, email, password }) => {
      if (process.browser) {
        registerUser({
          variables: { username, email, password },
        })
          .then((response) => response && handleRegisterUserSuccess(response))
          .catch((error: ApolloError) =>
            addAlert(error.graphQLErrors[0].message, { severity: 'error' }),
          );
      }
    },
  });

  useEffect(() => {
    // Redirect the user to My Account page if user is already authenticated.
    if (authenticated) {
      router.push('/my-account');
    }
  }, [authenticated, router]);

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box mt={6} pt={6}>
          {/* Title */}
          <Typography gutterBottom variant="h2">
            Register
          </Typography>

          {/* Error Message */}
          {errorMessage != null && showAlertBar && (
            <Alert severity="error" onClose={handleCloseButtonClick}>
              {errorMessage}
            </Alert>
          )}

          {/* Success Message */}
          {successMessage != null && showAlertBar && (
            <Alert severity="success" onClose={handleCloseButtonClick}>
              {successMessage}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={formik.handleSubmit}>
            {/* Username */}
            <FormGroup>
              <TextField
                required
                label="Username"
                value={formik.values.username}
                type="text"
                name="username"
                error={'username' in formik.errors}
                helperText={formik.errors.username}
                onChange={formik.handleChange}
              />
            </FormGroup>

            {/* Email */}
            <FormGroup>
              <TextField
                required
                label="Email"
                value={formik.values.email}
                type="email"
                name="email"
                error={'email' in formik.errors}
                helperText={formik.errors.email}
                onChange={formik.handleChange}
              />
            </FormGroup>

            {/* Password */}
            <FormGroup>
              <TextField
                required
                label="Password"
                value={formik.values.password}
                type="password"
                name="password"
                error={'password' in formik.errors}
                helperText={formik.errors.password}
                onChange={formik.handleChange}
              />
            </FormGroup>

            {/* Submit Button */}
            <FormGroup>
              <Button color="primary" disabled={loading} type="submit">
                Register
              </Button>
              <Box ml={1}>
                <Link passHref href="/login">
                  <Button color="default">Login</Button>
                </Link>
              </Box>
            </FormGroup>

            {/* Loading */}
            {loading && <CircularProgress />}
          </form>
        </Box>
      </Container>
    </Layout>
  );
};

export default Register;
