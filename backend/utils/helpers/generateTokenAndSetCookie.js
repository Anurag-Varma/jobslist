import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 3
    });

    res.setHeader('Access-Control-Allow-Credentials', 'true');

}

export { generateTokenAndSetCookie }
