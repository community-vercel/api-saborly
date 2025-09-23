import bcrypt from 'bcryptjs';

async function hashPassword() {
  const password = 'admin123'; // Replace with your desired password
  
  try {
    const hash = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hash);
  } catch (err) {
    console.error('Error hashing password:', err);
  }
}

hashPassword();