const { ObjectId } = require('mongodb');

// Generate a new ObjectId
const validObjectId = new ObjectId();
console.log("Generated ObjectId:", validObjectId.toString());
