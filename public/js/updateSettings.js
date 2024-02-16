/* eslint-disable */

import { showAlert } from './alert';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  const devBaseUrl = 'http://127.0.0.1:3000';
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/update-my-password/'
        : '/api/v1/users/update-me';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`,
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
