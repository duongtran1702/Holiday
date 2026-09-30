package atmin.core.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
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

    private Claims extractClaimsJws(String token) {
        return Jwts
                .parser()
                .verifyWith((SecretKey) signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public void validateAccessToken(String token) {
        try {
            String type = extractClaimsJws(token).get("type", String.class);
            if (!"access_token".equals(type)) {
                throw new JwtException("Invalid token type. Expected access_token");
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

    public String getUsernameFromToken(String token) {
        return extractClaimsJws(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return extractClaimsJws(token).get("roles", List.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> getPermissionsFromToken(String token) {
        List<String> permissions = extractClaimsJws(token).get("permissions", List.class);
        return permissions == null ? List.of() : permissions;
    }

    public Date getExpirationDateFromToken(String token) {
        return extractClaimsJws(token).getExpiration();
    }

    public Date getIssuedAtFromToken(String token) {
        return extractClaimsJws(token).getIssuedAt();
    }
}
