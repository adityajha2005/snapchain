import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
	username: string;
	email: string;
	github?: string;
	password: string;
	comparePassword(plainPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			minlength: 4,
			unique: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
			trim: true,
		},
		github: {
			type: String,
			lowercase: true,
			match: [
				/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+$/,
				"Please use a valid GitHub URL",
			],
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
	},
	{ timestamps: true },
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

//pass comparison method
UserSchema.methods.comparePassword = async function (
	plainPassword: string,
): Promise<boolean> {
	return await bcrypt.compare(plainPassword, this.password);
};

//remove password from JSON output
UserSchema.set("toJSON", {
	transform: function (_doc, ret) {
		delete ret.password;
		return ret;
	},
});

// Message model definition
export interface IMessage extends Document {
	user: mongoose.Types.ObjectId;
	content: string;
	timestamp: Date;
}

const messageSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	content: {
		type: String,
		required: true,
		trim: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Use the same pattern as the User model to prevent redefinition errors
export const Message: Model<IMessage> = 
	mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
