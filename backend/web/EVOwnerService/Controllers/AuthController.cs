using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Replace with your real user validation (DB check)
        if (request.Username == "backoffice" && request.Password == "1234")
        {
            var token = GenerateJwtToken("Backoffice");
            return Ok(new { token, role = "Backoffice" });
        }
        else if (request.Username == "operator" && request.Password == "1234")
        {
            var token = GenerateJwtToken("StationOperator");
            return Ok(new { token, role = "StationOperator" });
        }

        return Unauthorized(new { message = "Invalid credentials" });
    }

    private string GenerateJwtToken(string role)
    {
        var key = Encoding.ASCII.GetBytes("7d66e76f-12d8-4947-8d1a-da7cf47905c4");
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.Role, role)
            }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

// Login request DTO
public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}
