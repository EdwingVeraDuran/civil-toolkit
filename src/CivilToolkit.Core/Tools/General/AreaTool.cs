using CivilToolkit.Core.DTOs;
using CivilToolkit.Core.Enums;
using CivilToolkit.Core.Models;

namespace CivilToolkit.Core.Tools;

public class AreaTool : Tool<AreaCalculationInputDto, AreaCalculationResultDto>
{
    public AreaTool()
        : base("area", "Area Calculator", "Calculates area", ToolCategory.General, "1.0") { }

    public override bool Validate(AreaCalculationInputDto inputData)
    {
      return inputData is not null;
    }

    public override BaseResult<AreaCalculationResultDto> Calculate(
        AreaCalculationInputDto inputData
    )
    {
      try
      {
          Validate(inputData);

          float area = inputData.height * inputData * inputData.width


      }
      catch (System.Exception)
      {
          
          throw;
      }
    }
}
