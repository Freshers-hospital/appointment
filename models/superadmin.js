const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const superAdminSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        encryptedPassword: { type: String },
        role: { type: Number, required: true, default: 0 },
        contact: { type: String, required: true },
        status: { type: String, required: true, default: "inactive", enum: ["active", "inactive"] },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

superAdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

superAdminSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("superAdmin", superAdminSchema);
