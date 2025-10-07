using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace EVChargingStationWeb.Server.Models
{
    public enum UserRole
    {
        Backoffice,
        StationOperator
    }

    public class ApplicationUser
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string Id { get; set; }

        [Required]
        [BsonElement("username")]
        public string Username { get; set; }

        [Required]
        [BsonElement("email")]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; }

        [BsonElement("fullName")]
        public string FullName { get; set; }

        [BsonElement("role")]
        public UserRole Role { get; set; }

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("lastLogin")]
        public DateTime? LastLogin { get; set; }
    }

    public class CreateUserRequest
    {
        [Required]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        public UserRole Role { get; set; }
    }

    public class UpdateUserRequest
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public UserRole? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class LoginRequest
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }
}