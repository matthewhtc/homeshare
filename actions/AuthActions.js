import firebase from 'firebase';
import {
  EMAIL_CHANGED,
  PASSWORD_CHANGED,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_USER,
  FNAME_CHANGED,
  LNAME_CHANGED,
  USERNAME_CHANGED,
  SIGNUP_USER,
  SIGNUP_USER_FAIL,
  SIGNUP_USER_SUCCESS,
  GET_USER_GROUP,
  CLEAR_ERRORS
} from './types';

const insertNewUser = async (firstName, lastName, username, email, uid) => {
  firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .set({
      email,
      username,
      name: {
        firstName,
        lastName
      }
    });
};

export const emailChanged = text => {
  return {
    type: EMAIL_CHANGED,
    payload: text
  };
};

export const passwordChanged = text => {
  return {
    type: PASSWORD_CHANGED,
    payload: text
  };
};

export const fnameChanged = text => {
  return {
    type: FNAME_CHANGED,
    payload: text
  };
};

export const lnameChanged = text => {
  return {
    type: LNAME_CHANGED,
    payload: text
  };
};

export const usernameChanged = text => {
  return {
    type: USERNAME_CHANGED,
    payload: text
  };
};

export const clearErrors = () => {
  return {
    type: CLEAR_ERRORS
  };
};

export const loginUser = ({ email, password }) => {
  // async req
  return async dispatch => {
    // dispatch login_user for "user loading" part (starts the spinner)
    dispatch({ type: LOGIN_USER });

    try {
      const response = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      dispatch({ type: LOGIN_USER_SUCCESS, payload: response.user.uid });
    } catch (error) {
      console.log(error);
      dispatch({ type: LOGIN_USER_FAIL });
    }
  };
};

export const signupUser = ({
  firstName,
  lastName,
  username,
  email,
  password
}) => {
  return async dispatch => {
    dispatch({ type: SIGNUP_USER });

    try {
      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      insertNewUser(firstName, lastName, username, email, response.user.uid);
      dispatch({ type: SIGNUP_USER_SUCCESS, payload: response.user.uid });
    } catch (error) {
      console.log(error);
      dispatch({ type: SIGNUP_USER_FAIL, payload: error });
    }
  };
};

export const getUserGroup = userId => {
  return async dispatch => {
    try {
      const response = await firebase
        .firestore()
        .collection('users')
        .doc(userId)
        .get()
        .then(doc => {
          return doc.data().group;
        });

      dispatch({ type: GET_USER_GROUP, payload: response });
    } catch (error) {
      console.log(error);
      // TODO: Handle case where user is not in a group yet
    }
  };
};
