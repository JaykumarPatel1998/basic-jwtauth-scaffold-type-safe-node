import * as bcrypt from "bcrypt"

export class PasswordHash {

    /**
     * 
     * @param plainPassword plain original password entered by the user
     * @returns hashed password
     */
    public static async hashPassword(plainPassword: string): Promise<string>{
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        return hashedPassword
    }

    public static async isPasswordValid(toBeVerifiedPlainPassword: string, hashedPasswordFromDB: string): Promise<boolean> {
        return await bcrypt.compare(toBeVerifiedPlainPassword, hashedPasswordFromDB);
    }
}