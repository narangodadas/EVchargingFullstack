/*******************************************************
*file :         ChargingStation.cs
*Author:        IT22278180 - Narangoda D.A.S.
********************************************************/

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace EVChargingAPI.Models
{
    public enum StationType
    {
        AC,
        DC
    }

    public enum StationStatus
    {
        Active,
        Inactive,
        Maintenance
    }

    public class ChargingStation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [BsonElement("name")]
        public string Name { get; set; } = null!;

        [Required]
        [BsonElement("location")]
        public StationLocation Location { get; set; } = null!;

        [BsonElement("type")]
        public StationType Type { get; set; }

        [BsonElement("totalSlots")]
        [Range(1, 50)]
        public int TotalSlots { get; set; }

        [BsonElement("availableSlots")]
        public int AvailableSlots { get; set; }

        [BsonElement("operatingHours")]
        public OperatingHours OperatingHours { get; set; } = null!;

        [BsonElement("status")]
        public StationStatus Status { get; set; } = StationStatus.Active;

        [BsonElement("operatorId")]
        public string OperatorId { get; set; } = null!; // Station Operator responsible

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Additional properties to maintain compatibility with existing code
        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("rating")]
        public double Rating { get; set; } = 4.5;

        [BsonElement("reviewsCount")]
        public int ReviewsCount { get; set; } = 0;

        [BsonElement("pricePerHour")]
        public string PricePerHour { get; set; } = "₹20/hr";
    }

    public class StationLocation
    {
        [BsonElement("address")]
        public string Address { get; set; } = null!;

        [BsonElement("city")]
        public string City { get; set; } = null!;

        [BsonElement("district")]
        public string District { get; set; } = null!;

        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }
    }

    public class OperatingHours
    {
        [BsonElement("openTime")]
        public TimeSpan OpenTime { get; set; }

        [BsonElement("closeTime")]
        public TimeSpan CloseTime { get; set; }

        [BsonElement("isOpen24Hours")]
        public bool IsOpen24Hours { get; set; } = false;
    }

    public class CreateStationRequest
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public StationLocation Location { get; set; } = null!;

        [Required]
        public StationType Type { get; set; }

        [Required]
        [Range(1, 50)]
        public int TotalSlots { get; set; }

        public OperatingHours OperatingHours { get; set; } = null!;

        public string OperatorId { get; set; } = null!;
    }

    public class UpdateStationRequest
    {
        public string? Name { get; set; }
        public StationLocation? Location { get; set; }
        public StationType? Type { get; set; }
        public int? TotalSlots { get; set; }
        public OperatingHours? OperatingHours { get; set; }
        public StationStatus? Status { get; set; }
        public string? OperatorId { get; set; }
    }
}