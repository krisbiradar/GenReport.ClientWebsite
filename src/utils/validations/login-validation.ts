import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

export const validateWithZod = (schema: z.ZodSchema) => (values: any) => {
    try {
        schema.parse(values);
        return {};
    } catch (error: any) {
        return error.errors.reduce((acc: any, curr: any) => {
            acc[curr.path[0]] = curr.message;
            return acc;
        }, {});
    }
};
