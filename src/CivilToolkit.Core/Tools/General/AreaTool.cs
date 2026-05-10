using CivilToolkit.Core.DTOs;
using CivilToolkit.Core.Enums;
using CivilToolkit.Core.Models;

namespace CivilToolkit.Core.Tools;

public class AreaTool : Tool<AreaInputDto, AreaOutputDto>
{
    public AreaTool()
        : base("area", "Area Calculator", "Calculates area", ToolCategory.General, "1.0") { }

    public override bool Validate(AreaInputDto inputData)
    {
        return inputData is not null;
    }

    public override BaseResult<AreaOutputDto> Calculate(AreaInputDto input)
    {
        try
        {
            Validate(input);

            double area = input.CalculateArea();

            return new BaseResult<AreaOutputDto>
            {
                Status = ResultStatus.Ok,
                ToolName = Name,
                Data = new AreaOutputDto { Area = area },
            };
        }
        catch (System.Exception e)
        {
            return new BaseResult<AreaOutputDto>
            {
                Status = ResultStatus.Error,
                ToolName = Name,
                Error = e.ToString(),
            };
            throw;
        }
    }
}
