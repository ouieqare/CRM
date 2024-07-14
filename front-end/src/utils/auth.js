// utils/auth.js
export const saveToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  export const saveUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  export const getUser = () => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  };
  