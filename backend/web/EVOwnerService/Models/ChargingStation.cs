using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace EVChargingStationWeb.Server.Models
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
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string Id { get; set; }

        [Required]
        [BsonElement("name")]
        public string Name { get; set; }

        [Required]
        [BsonElement("location")]
        public StationLocation Location { get; set; }

        [BsonElement("type")]
        public StationType Type { get; set; }

        [BsonElement("totalSlots")]
        [Range(1, 50)]
        public int TotalSlots { get; set; }

        [BsonElement("availableSlots")]
        public int AvailableSlots { get; set; }

        [BsonElement("operatingHours")]
        public OperatingHours OperatingHours { get; set; }

        [BsonElement("status")]
        public StationStatus Status { get; set; } = StationStatus.Active;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("operatorId")]
        public string? OperatorId { get; set; }
    }

    public class StationLocation
    {
        [BsonElement("address")]
        public string Address { get; set; }

        [BsonElement("city")]
        public string City { get; set; }

        [BsonElement("district")]
        public string District { get; set; }

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
        public string Name { get; set; }

        [Required]
        public StationLocation Location { get; set; }

        [Required]
        public StationType Type { get; set; }

        [Required]
        [Range(1, 50)]
        public int TotalSlots { get; set; }

        public OperatingHours OperatingHours { get; set; }
    }

    public class UpdateStationRequest
    {
        public string Name { get; set; }
        public StationLocation Location { get; set; }
        public StationType? Type { get; set; }
        public int? TotalSlots { get; set; }
        public OperatingHours OperatingHours { get; set; }
        public StationStatus? Status { get; set; }
    }

    public class UpdateSlotsRequest
    {
        [Required]
        [Range(0, int.MaxValue)]
        public int OccupiedSlots { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int AvailableSlots { get; set; }
    }
}