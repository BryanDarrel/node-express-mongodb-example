const { User } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
// Pseudocode for service function to check email

async function getUserByEmail(email) {
  return User.findOne({ email });
}
module.exports = {
  getUserByEmail,
};
