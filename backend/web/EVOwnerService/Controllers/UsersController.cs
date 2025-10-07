using EVChargingStationWeb.Server.Models;
using EVChargingStationWeb.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace EVChargingStationWeb.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _userService.GetByIdAsync(id);
            return user != null ? Ok(user) : NotFound();
        }

        [HttpGet("station-operators")]
        public async Task<IActionResult> GetStationOperators()
        {
            var operators = await _userService.GetStationOperatorsAsync();
            return Ok(operators);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            try
            {
                var user = await _userService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                await _userService.UpdateAsync(id, request);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> Activate(string id)
        {
            try
            {
                await _userService.ActivateAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(string id)
        {
            try
            {
                await _userService.DeactivateAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                await _userService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userService.AuthenticateAsync(request);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials or account is inactive" });
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.Role,
                user.LastLogin
            });
        }
    }
}