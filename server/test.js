const bcrypt = require('bcryptjs');

const createHashedPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Hashed Password: ${hashedPassword}`);
};

createHashedPassword('@Superadmin123321!'); // Replace with the desired password
