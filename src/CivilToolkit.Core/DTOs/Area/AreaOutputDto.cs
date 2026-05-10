using CivilToolkit.Core.Models;

namespace CivilToolkit.Core.DTOs;

public class AreaOutputDto : BaseDto
{
    public double Area { get; set; }

    public override Dictionary<string, object> DataDict()
    {
        return new Dictionary<string, object> { { "area", Area } };
    }
}
