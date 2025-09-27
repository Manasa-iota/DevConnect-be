import validator from "validator";

export const validateSignupData = (req) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("Invalid Name");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Invalid email");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error("Weak password");
    }
};

const fieldValidators = {
    firstName: (value) => typeof value === "string" && value.trim().length >= 2,
    lastName: (value) => typeof value === "string" && value.trim().length >= 2,
    age: (value) => typeof value === "number" && value >= 0 && value <= 120,
    gender: (value) => ["male", "female", "others"].includes(value),
    photoUrl: (value) => typeof value === "string" && validator.isURL(value),
    about: (value) => typeof value === "string" && value.length <= 500,
    skills: (value) => Array.isArray(value) && value.every((v) => typeof v === "string"),
};


export const validateProfileUpdate = (req) => {
    const allowedFields = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills"];

    const isValid = Object.keys(req.body).every((field) =>
        allowedFields.includes(field)
    );


    if (!isValid) {
        throw new Error("Invalid fields to update");
    }
    for (const [key, value] of Object.entries(body)) {
        const isValid = fieldValidators[key](value);
        if (!isValid) {
            throw new Error(`Invalid value for ${key}`);
        }
    }
};
