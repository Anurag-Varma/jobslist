import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    });

    res.cookie('jwt', token, {
        domain: '.jobslist.live', // Ensure the cookie is available to all subdomains
        path: '/',                // Make the cookie available across the entire domain
        secure: true,             // Ensure the cookie is sent over HTTPS
        sameSite: 'None',         // Allow cross-origin requests to include the cookie
        maxAge: 1000 * 60 * 60 * 24 * 3 // Cookie expiration time
    });

    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export { generateTokenAndSetCookie }
