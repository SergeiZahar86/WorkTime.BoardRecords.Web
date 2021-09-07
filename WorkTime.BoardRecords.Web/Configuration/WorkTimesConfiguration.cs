using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkTime.BoardRecords.Web.models;

namespace WorkTime.BoardRecords.Web.Configuration
{
    public class WorkTimesConfiguration : IEntityTypeConfiguration<WorkedTimes>
    {
        public void Configure(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<WorkedTimes> builder)
        {
            builder.HasKey(x => x.Id);
        }
    }
}
