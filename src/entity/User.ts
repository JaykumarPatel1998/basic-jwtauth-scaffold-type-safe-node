import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { RefreshToken } from "./RefreshToken"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    age: number

    @OneToMany(type => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: any

    constructor(username: string, email:string, password: string, age:number) {
        this.username = username
        this.email = email
        this.password = password
        this.age = age
    }
}
