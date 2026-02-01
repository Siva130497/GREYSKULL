const Staff = require("../models/Staff.model");

async function seedStaff(shells) {
  const names = ["staff1", "staff2", "staff3", "staff4", "staff5"];

  for (const shell of shells) {
    for (const name of names) {
      await Staff.updateOne(
        { shellId: shell._id, name },
        { $set: { shellId: shell._id, name, isActive: true } },
        { upsert: true }
      );
    }
  }

  return true;
}

module.exports = { seedStaff };