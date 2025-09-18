import jwt from 'jsonwebtoken';
import 'dotenv/config';

class AuthTokenJwt {
  static #secret = process.env.JWT_SECRET;

  static generate({ id, username }) {
    if (!this.#secret) {
      throw new Error('JWT_SECRET environment variable not set');
    }

    return jwt.sign({ id, username }, this.#secret, {
      expiresIn: '1h'
    });
  }

  static verify(token) {
    if (!this.#secret) {
      throw new Error('JWT_SECRET environment variable not set');
    }
    return jwt.verify(token, this.#secret);
  }

  static parseFromCookie(cookieHeader) {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(";").map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  static async authTokenVerifier(request, reply) {
    try {
      const token = AuthTokenJwt.parseFromCookie(request.headers.cookie);
      
      if (!token) {
        throw new Error('No Token');
      }
      
      await request.jwtVerify(token);
    } catch (error) {
      reply.code(401).send({ message: "Invalid or missing token" });
      return;
    }
  }

  static async optionalAuthTokenVerifier(request, reply) {
    const token = AuthTokenJwt.parseFromCookie(request.headers.cookie);
    
    if (!token) {
      request.user = null;
      return;
    }
    
    try {
      request.user = await request.jwtVerify(token);
    } catch {
      request.user = null;
    }
  }
}

export default AuthTokenJwt;