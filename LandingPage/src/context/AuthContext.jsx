// import React, { createContext, useReducer } from 'react';

// // Initial state
// const initialState = {
//   photo: '',
//   photoId: '',
//   seedPhrase: '',
//   error: null,
// };

// // Action types
// const SET_PHOTO = 'SET_PHOTO';
// const SET_PHOTO_ID = 'SET_PHOTO_ID';
// const VERIFY_SEED_PHRASE = 'VERIFY_SEED_PHRASE';
// const SET_ERROR = 'SET_ERROR';

// // Reducer function
// function authReducer(state, action) {
//   switch (action.type) {
//     case SET_PHOTO:
//       return { ...state, photo: action.payload };
//     case SET_PHOTO_ID:
//       return { ...state, photoId: action.payload };
//     case VERIFY_SEED_PHRASE:
//       // Verify seed phrase logic
//       if (action.payload === 'expected_seed_phrase') {
//         return { ...state, seedPhrase: action.payload, error: null };
//       } else {
//         return { ...state, error: { message: 'Invalid seed phrase.' } };
//       }
//     case SET_ERROR:
//       return { ...state, error: action.payload };
//     default:
//       return state;
//   }
// }

// // Context creation
// export const AuthContext = createContext();

// // Provider component
// export const AuthProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   const setPhoto = (photo) => {
//     dispatch({ type: SET_PHOTO, payload: photo });
//   };

//   const setPhotoId = (photoId) => {
//     dispatch({ type: SET_PHOTO_ID, payload: photoId });
//   };

//   const verifySeedPhrase = (seedPhrase) => {
//     dispatch({ type: VERIFY_SEED_PHRASE, payload: seedPhrase });
//   };

//   return (
//     <AuthContext.Provider value={{ state, setPhoto, setPhotoId, verifySeedPhrase }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
const [state, setState] = useState({
    photo: null,
    seedPhrase: '',
    photoId: '',
    // Add other state variables as needed
  });

  const setPhoto = (photo) => {
    setState((prevState) => ({
      ...prevState,
      photo,
    }));
  };

  const setPhotoId = (photoId) => {
    setState((prevState) => ({
      ...prevState,
      photoId,
    }));
  };

  const verifySeedPhrase = (seedPhrase) => {
    if (seedPhrase === 'valid-seed-phrase') {
      setState((prevState) => ({
        ...prevState,
        seedPhrase,
        error: null,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        error: { message: 'Invalid seed phrase.' },
      }));
    }
  };

  const setSource = (newUrl) => {
    setState((prevState) => ({
      ...prevState,
      photoId: newUrl,
    }));
  };

  return (
    <AuthContext.Provider value={{ state, setPhoto, setPhotoId, verifySeedPhrase, setSource }}>
      {children}
    </AuthContext.Provider>
  );
};

