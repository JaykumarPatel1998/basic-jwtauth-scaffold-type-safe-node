import { Response, Request } from "express"
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import * as express from "express"
import { RegisterDto } from "./dto/request/register.dto"
import { Database } from "./database"
import { PasswordHash } from "./security/passwordHash"
import { AuthenticationDto } from "./dto/response/authentication.dto"
import { JWT } from "./security/jwt"
import { LoginDto } from "./dto/request/login.dto"
import { EntityDtoMapper } from "./entityDtoMapper/entityDtoMapper"
import { RefreshToken } from "./entity/RefreshToken"
import { RefreshTokenDto } from "./dto/request/refreshToken.dto"

const app = express()
const port = 4000

//middleware goes here
app.use(express.json())



AppDataSource.initialize().then(async () => {

    Database.initialize()

    app.get('/', (req: Request, res: Response) => {
        res.json({
            message: "Hello there"
        })
    })

    app.post('/register', async (req: Request, res: Response) => {

        try {
            const body: RegisterDto = req.body
            //validate the body
            if (body.password != body.repeatPassword)
                throw new Error("Passwords do not match")

            if (await Database.userRepository.findOneBy({email: body.email}))
                throw new Error("Email already in use!")

            //store the user
            const user = new User(body.username, body.email, await PasswordHash.hashPassword(body.password), body.age);

            const savedUser = await Database.userRepository.save(user)

            const authenticationDto = new AuthenticationDto();
            const userDto = EntityDtoMapper.userToDto(savedUser);

            authenticationDto.user = userDto;

            const tokenAndRefreshToken = await JWT.generateToken(user);
            authenticationDto.token = tokenAndRefreshToken.token;
            authenticationDto.refreshToken = tokenAndRefreshToken.refreshToken;

            //{TODO: add token generation logic}

            res.status(201).json(authenticationDto)
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    })

    app.post('/login', async (req: Request, res: Response) => {

        try {
            const body: LoginDto = req.body

            //validate if email exists in database
            const userFromDB: User = await Database.userRepository.findOneBy({email: body.email})
            if (!userFromDB)
                throw new Error("Email not registered in database. please sign up for a new account")


            //verify the password
            if (!await PasswordHash.isPasswordValid(body.password, userFromDB.password))
                throw new Error("Incorrect password. please try again!")

            const {token, refreshToken} = await JWT.generateToken(userFromDB);
            //store the user
            const authenticationDto = new AuthenticationDto();
            const userDto = EntityDtoMapper.userToDto(userFromDB);
            authenticationDto.user = userDto;
            authenticationDto.token = token;
            authenticationDto.refreshToken = refreshToken;

            //{TODO: add token generation logic}

            res.status(201).json(authenticationDto)
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    })

    app.post('/refresh/token', async (req: Request, res: Response) => {

        try {

            //following steps are to be followed for verifying jwt and refresh token:


            const {token, refreshToken}:RefreshTokenDto = req.body

            //check if the jwt token is valid (this method will also check for expiry of the token)
            if(!JWT.isTokenValid(token)) throw new Error("Invalid token")

            //fetching refresh Token From The DB
            const refreshTokenFromDb = await Database.refershTokenRepository.findOneBy({id: refreshToken}) // at this point refresh token may be undefined as the db may not contain refresh token
            
            //decoding jwt id from the token
            const jwtID = JWT.getJwtId(token)

            //check if the refresh token exists and is linked to the jwt token
            if(!JWT.isRefreshTokenLinkedToToken(jwtID, refreshTokenFromDb)) throw new Error("Token does not match with refresh token")

            //check if the refresh token has expired
            if(JWT.isRefershTokenExpired(refreshTokenFromDb)) throw new Error("refresh token has expired")

            // check if the refresh token was used
            //check if the refresh token was invalidated
            if(JWT.isRefreshTokenUsedOrInvalidated(refreshTokenFromDb)) throw new Error("refresh token has been used or invalidated")


            refreshTokenFromDb.used = true;

            await Database.refershTokenRepository.save(refreshTokenFromDb)


            const user = await Database.userRepository.findOneBy({id: JWT.getTokenPayloadValueByKey("id", token)})

            if(!user) throw new Error("no user found")
            //generate a fresh pair of token and refresh token
            const tokenResults = await JWT.generateToken(user)

            //generate an authentication result
            const authenticationDto = new AuthenticationDto();
            authenticationDto.user = EntityDtoMapper.userToDto(user);
            authenticationDto.token = tokenResults.token;
            authenticationDto.refreshToken = tokenResults.refreshToken;

            res.status(201).send({
                authenticationDto
            })

        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    })

    app.listen(port, () => {
        console.log(`listening on URL: http://localhost:${port}`)
    })

}).catch(error => console.log(error))
