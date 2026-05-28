using CivilToolkit.Core.Models;

namespace CivilToolkit.Core.DTOs;

public abstract class AreaInputDto : BaseDto
{
    public abstract double CalculateArea();
}

public class AreaRectangleInputDto : AreaInputDto
{
    public double Width { get; set; }
    public double Height { get; set; }

    public override double CalculateArea()
    {
        return Width * Height;
    }

    public override Dictionary<string, object> DataDict()
    {
        return new Dictionary<string, object> { { "width", Width }, { "height", Height } };
    }
}

public class AreaCircleInputDto : AreaInputDto
{
    public double Radius { get; set; }

    public override double CalculateArea()
    {
        return Math.PI * Radius * Radius;
    }

    public override Dictionary<string, object> DataDict()
    {
        return new Dictionary<string, object> { { "radius", Radius } };
    }
}

public class AreaTriangleInputDto : AreaInputDto
{
    public double Width { get; set; }
    public double Height { get; set; }

    public override double CalculateArea()
    {
        return Width * Height / 2;
    }

    public override Dictionary<string, object> DataDict()
    {
        return new Dictionary<string, object> { { "width", Width }, { "height", Height } };
    }
}
