using CivilToolkit.Core.DTOs;
using CivilToolkit.Core.Enums;
using CivilToolkit.Core.Models;

namespace CivilToolkit.Core.Tools;

public class VolumeTool : Tool<VolumeInputDto, VolumeOutputDto>
{
    public VolumeTool()
        : base("volume", "Volume Tool", "Calculates volume", ToolCategory.General, "1.0") { }

    public override bool Validate(VolumeInputDto inputData)
    {
        return inputData is not null;
    }

    public override BaseResult<VolumeOutputDto> Calculate(VolumeInputDto inputData)
    {
        Validate(inputData);

        double volume = inputData.height * inputData.width * inputData.prof;

        return new BaseResult<VolumeOutputDto>
        {
            Status = ResultStatus.Ok,
            ToolName = Name,
            Data = new VolumeOutputDto { volume = volume },
        };
    }
}
