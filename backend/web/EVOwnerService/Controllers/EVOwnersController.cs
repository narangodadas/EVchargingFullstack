using EVChargingStationWeb.Server.Models;
using EVChargingStationWeb.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/evowners")]
//[Authorize(Roles = "Backoffice")] // Optional: use later when auth is implemented
public class EVOwnersController : ControllerBase
{
    private readonly EVOwnerService _service;
    public EVOwnersController(EVOwnerService service) => _service = service;

    // 1. GET all EV owners
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    // 2. GET by NIC
    [HttpGet("{nic}")]
    public async Task<IActionResult> Get(string nic)
    {
        var owner = await _service.GetByNicAsync(nic);
        return owner != null ? Ok(owner) : NotFound();
    }

    // 3. POST - create
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EVOwner owner)
    {
        try
        {
            await _service.CreateAsync(owner);
            return CreatedAtAction(nameof(Get), new { nic = owner.NIC }, owner);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // 4. PUT - update
    [HttpPut("{nic}")]
    public async Task<IActionResult> Update(string nic, [FromBody] EVOwner owner)
    {
        await _service.UpdateAsync(nic, owner);
        return NoContent();
    }

    // 5. PATCH - activate
    [HttpPatch("{nic}/activate")]
    public async Task<IActionResult> Activate(string nic)
    {
        await _service.ActivateAsync(nic);
        return NoContent();
    }

    // 6. PATCH - deactivate
    [HttpPatch("{nic}/deactivate")]
    public async Task<IActionResult> Deactivate(string nic)
    {
        await _service.DeactivateAsync(nic);
        return NoContent();
    }

    // 7. DELETE
    [HttpDelete("{nic}")]
    public async Task<IActionResult> Delete(string nic)
    {
        await _service.DeleteAsync(nic);
        return NoContent();
    }
}