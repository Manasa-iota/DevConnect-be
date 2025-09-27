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

export const validateProfileUpdate = (req) => {
    const allowedFields = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills"];

    const isValid = Object.keys(req.body).every((field) =>
        allowedFields.includes(field)
    );

    if (!isValid) {
        throw new Error("Invalid fields to update");
    }
};
