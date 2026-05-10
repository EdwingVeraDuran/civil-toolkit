using CivilToolkit.Core.Models;

namespace CivilToolkit.Core.DTOs;

public class VolumeOutputDto : BaseDto
{
    public double volume { get; set; }

    public override Dictionary<string, object> DataDict()
    {
        return new Dictionary<string, object> { { "volume", volume } };
    }
}
