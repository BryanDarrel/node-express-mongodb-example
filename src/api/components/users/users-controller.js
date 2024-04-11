const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}
const { hashPassword } = require('../../../utils/password');
/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm; // Tambahkan ini

    // Memeriksa apakah password dan passwordConfirm sama
    if (password !== password_confirm) {
      return response.status(403).json({
        statusCode: 403,
        error: 'INVALID_PASSWORD',
        message: 'Password confirmation does not match',
      });
    }

    // Memeriksa apakah email sudah digunakan sebelumnya
    const emailTaken = await usersService.isEmailTaken(email);

    if (emailTaken) {
      return response.status(409).json({
        statusCode: 409,
        error: 'EMAIL_ALREADY_TAKEN',
        message: 'Email is already taken',
      });
    }

    // Jika email belum digunakan dan password_confirmation sesuai, lanjutkan dengan pembuatan pengguna baru
    const success = await usersService.createUser(name, email, password);

    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changeUserPassword(request, response, next) {
  try {
    const id = request.params.id;
    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;
    const confirmPassword = request.body.confirmPassword;

    if (newPassword.length < 6 || newPassword.length > 32) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password length must be between 6 and 32 characters'
      );
    }

    if (newPassword !== confirmPassword) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'New password and confirmation do not match'
      );
    }

    const success = await usersService.changeUserPassword(
      id,
      oldPassword,
      newPassword
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json('Password Changed Succesfuly');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
};
