package atmin.core.security.jwt;

import atmin.modules.user.entity.Role;
import atmin.modules.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtProvider {
    private final JwtProperties jwtProperties;

    private Key signingKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecretKey());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(User user) {
        long nowMillis = System.currentTimeMillis();
        Date issuedDate = new Date(nowMillis);
        Date expirationDate = new Date(nowMillis + jwtProperties.getAccessExpiration());

        List<String> roles = user.getRoles() == null ? List.of() : user.getRoles().stream()
                .map(Role::getName).toList();

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("roles", roles)
                .claim("type", "access_token")
                .signWith(signingKey())
                .issuedAt(issuedDate)
                .expiration(expirationDate)
                .compact();
    }

    private Claims extractClaimsJws(String token) {
        return Jwts
                .parser()
                .verifyWith((SecretKey) signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private void validateTokenWithType(String token) {
        try {
            String type = extractClaimsJws(token).get("type", String.class);
            if (!type.equals("access_token")) {
                throw new JwtException("Invalid token type. Expected " + "access_token");
            }
        } catch (ExpiredJwtException e) {
            throw new JwtException("Token has expired");
        } catch (SignatureException | MalformedJwtException e) {
            throw new JwtException("Signature or structure not valid");
        } catch (UnsupportedJwtException e) {
            throw new JwtException("Unsupported token type");
        } catch (IllegalArgumentException e) {
            throw new JwtException("Invalid token argument");
        }
    }

    public void validateAccessToken(String token) {
        validateTokenWithType(token);
    }

    public String getUsernameFromToken(String token) {
        return extractClaimsJws(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return extractClaimsJws(token).get("roles", List.class);
    }

    public Date getExpirationDateFromToken(String token) {
        return extractClaimsJws(token).getExpiration();
    }

    public Date getIssuedAtFromToken(String token) {
        return extractClaimsJws(token).getIssuedAt();
    }

}
