using System;
using Microsoft.AspNetCore.Identity;

namespace WorkTime.BoardRecords.Web.models
{
    public class AppRole : IdentityRole<Guid>
    {
        public string Description { get; set; }
    }
}