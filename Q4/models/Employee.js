const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        empid: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        department: {
            type: String,
            required: true
        },

        designation: {
            type: String,
            required: true
        },

        basicSalary: {
            type: Number,
            required: true
        },

        hra: {
            type: Number,
            default: 0
        },

        da: {
            type: Number,
            default: 0
        },

        pf: {
            type: Number,
            default: 0
        },

        grossSalary: {
            type: Number,
            default: 0
        },

        netSalary: {
            type: Number,
            default: 0
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);
