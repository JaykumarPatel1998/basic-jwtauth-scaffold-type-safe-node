import * as jwt from 'jsonwebtoken'
import { User } from '../entity/User';
import {v4 as uuidV4} from 'uuid';
import { RefreshToken } from '../entity/RefreshToken';
import * as moment from 'moment';
import { Database } from '../database';

export class JWT {
    public static readonly SECRET_KEY: string = '<your-jwt-secret-goes-here>'; // replace this with your own secret
    public static async generateToken(user: User){
        //specify a payload that in our case will hold the user id and email
        const payload = {
            id: user.id,
            email: user.email
        }

        const jwtID = uuidV4();
        //in order to generate a token, we will need to call sign() method from the jwt library
        const token = jwt.sign(payload, this.SECRET_KEY, {
            expiresIn: '1h',
            jwtid: jwtID,
            subject: user.id.toString()
        })

        //create a refresh Token
        const refreshToken = await this.generateRefreshTokenForUserAndToken(user, jwtID)

        return {token, refreshToken};
    }

    private static async generateRefreshTokenForUserAndToken(user: User, jwtId: string): Promise<string> {
        // create a new record of refreshToken
        const refreshToken = new RefreshToken();
        refreshToken.user = user;
        refreshToken.jwtId = jwtId;

        //set the expirt date of the refresh token (for eg, 10days)
        refreshToken.expiryDate = moment().add(10, "d").toDate();

        //store the refresh token
        await Database.refershTokenRepository.save(refreshToken);

        return refreshToken.id;

    }

    public static isTokenValid(token: string) {
        try {
            if(jwt.verify(token, this.SECRET_KEY, {
                ignoreExpiration: false,
            }))
                return true;
        } catch (error) {
            return false;
        }
    }

    public static getJwtId(token: string){
        const decodedToken = jwt.decode(token);
        return decodedToken['jti']
    }

    public static getTokenPayloadValueByKey(key: string, token: string){
        const decodedToken = jwt.decode(token);
        return decodedToken[key]
    }

    public static isRefreshTokenLinkedToToken(jwtId: string, refreshToken: RefreshToken){
        if(!refreshToken) return false;

        if(refreshToken.jwtId != jwtId) return false;

        return true;
    }

    public static isRefershTokenExpired(refreshToken: RefreshToken){
        if (moment().isAfter(refreshToken.expiryDate)) return true;
        return false;
    }

    public static isRefreshTokenUsedOrInvalidated(refreshToken: RefreshToken) {
        return refreshToken.used || refreshToken.invalidated;
    }
}