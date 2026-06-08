const jwt = require('jsonwebtoken');

// A valid 24-character hex string representing our mock "Test User"
const testUserId = "507f1f77bcf86cd799439011"; 

// This must exactly match the secret in your auth.ts middleware
const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';

// Sign the token with the payload our middleware expects: { id: string }
const token = jwt.sign({ id: testUserId }, secret, { expiresIn: '7d' });

console.log('\n=== YOUR POSTMAN TEST TOKEN ===\n');
console.log(token);
console.log('\n===============================\n');