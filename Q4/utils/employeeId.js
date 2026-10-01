const Employee = require("../models/Employee");

async function generateEmployeeId() {
    const lastEmployee = await Employee.findOne()
        .sort({ createdAt: -1 })
        .lean();

    let number = 1;

    if (lastEmployee && lastEmployee.empid) {
        const lastNumber = parseInt(
            lastEmployee.empid.replace("EMP", "")
        );

        if (!isNaN(lastNumber)) {
            number = lastNumber + 1;
        }
    }

    return `EMP${String(number).padStart(4, "0")}`;
}

module.exports = generateEmployeeId;
