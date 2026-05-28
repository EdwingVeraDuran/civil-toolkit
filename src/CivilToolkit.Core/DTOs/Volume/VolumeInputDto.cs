using CivilToolkit.Core.Models;

namespace CivilToolkit.Core.DTOs;

public class VolumeInputDto : BaseDto
{
    public double height { get; set; }
    public double width { get; set; }
    public double prof { get; set; }

    public override Dictionary<string, object> DataDict()
    {
        return new Dictionary<string, object>
        {
            { "width", width },
            { "height", height },
            { "prof", prof },
        };
    }
}
