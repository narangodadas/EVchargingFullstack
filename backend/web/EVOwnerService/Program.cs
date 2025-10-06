using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration; // for IConfiguration
using System.Threading.Tasks;              // for async Task
using System.Collections.Generic;
using EVChargingStationWeb.Server.Services;// for List<T>

var builder = WebApplication.CreateBuilder(args);

// Configure MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDb"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

// Register EVOwnerService
builder.Services.AddSingleton<EVOwnerService>();

// after registering IMongoClient and MongoDbSettings
builder.Services.AddSingleton<BookingService>();

// existing AddControllers(), AddCors(), etc.


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
