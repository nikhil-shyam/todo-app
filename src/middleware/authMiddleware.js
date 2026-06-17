import jwt from 'jsonwebtoken';

function authMiddleware(request, response, next) {
  const token = request.headers['authorization']

  if (!token) return response.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) return response.status(401).json({ message: "Invalid token" });

    request.userId = decoded.id;

    next();
  });
}

export default authMiddleware;
