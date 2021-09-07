using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

namespace WorkTime.BoardRecords.Web.models
{
    public class WorkedTimes
    {
        public Guid Id { get; set; }
        [Required]
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        [Required]
        public AppUser User { get; set; }
    }
}
