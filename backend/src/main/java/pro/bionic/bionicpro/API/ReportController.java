package pro.bionic.bionicpro.API;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
public class ReportController {

    @GetMapping
    public ResponseEntity<?> findReportsForUser(JwtAuthenticationToken authentication) {
        // Получаем роли из аутентификационного токена
        List<String> realmRoles = extractRealmRoles(authentication);

        // Логика выбора отчетов в зависимости от роли
        return ResponseEntity.ok(getReportsBasedOnRoles(realmRoles));
    }

    private List<String> extractRealmRoles(JwtAuthenticationToken authentication) {
        if (authentication == null || authentication.getToken() == null) {
            return List.of();
        }

        // Получаем claims из токена
        Map<String, Object> claims = authentication.getToken().getClaims();

        // Извлекаем realm_access.roles
        if (claims.containsKey("realm_access")) {
            Object realmAccess = claims.get("realm_access");
            if (realmAccess instanceof Map<?, ?> realmAccessMap) {
                Object roles = realmAccessMap.get("roles");
                if (roles instanceof List<?> roleList) {
                    return roleList.stream()
                            .filter(String.class::isInstance)
                            .map(String.class::cast)
                            .toList();
                }
            }
        }
        return List.of();
    }

    private List<String> getReportsBasedOnRoles(List<String> roles) {
        if (roles.contains("administrator")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Доступ запрещен для роли 'administrator'");
        } else if (roles.contains("prothetic_user")) {
            return List.of(
                    "Отчет 1", "Отчет 2", "Отчет 3",
                    "Отчет 4", "Отчет 5", "Специальный отчет для prothetic");
        } else if (roles.contains("user")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Доступ запрещен для роли 'user'");
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Недостаточно прав для доступа");
    }
}