using CivilToolkit.Core.DTOs;
using CivilToolkit.Core.Enums;
using CivilToolkit.Core.Tools;

void Welcome()
{
    Console.WriteLine("----- Bienvenido a Civil Toolkit -----");

    Console.WriteLine();

    Console.WriteLine("Que tipo de herramienta desea usar:");
    Console.WriteLine("1. General");
    Console.WriteLine("0. Salir");

    var input = Console.ReadLine();

    switch (input)
    {
        case "0":
            Greeting();
            break;
        case "1":
            GeneralTools();
            break;
        case "2":
            GeneralTools();
            break;
        default:
            break;
    }
}

void Greeting()
{
    Console.WriteLine("Gracias por usar nuestra herramienta.");
}

Welcome();

void GeneralTools()
{
    Console.WriteLine("Categoría General");
    Console.WriteLine("1. Área");
    Console.WriteLine("2. Volumen");
    Console.WriteLine("0. Volver");

    var input = Console.ReadLine();

    switch (input)
    {
        case "0":
            Welcome();
            break;
        case "1":
            AreaTool();
            break;
        case "2":
            break;
        default:
            break;
    }
}

void AreaTool()
{
    Console.WriteLine("Seleccione el tipo de area:");
    Console.WriteLine("1. Cuadrada / Rectangular");
    Console.WriteLine("2. Circular");
    Console.WriteLine("3. Triangular");
    Console.WriteLine("0. Volver");

    var input = Console.ReadLine();

    GeometricShapes shape;
    AreaInputDto inputDto;

    switch (input)
    {
        case "1":
            shape = GeometricShapes.Square;

            Console.WriteLine("Ingrese ancho:");
            var width = Convert.ToDouble(Console.ReadLine());

            Console.WriteLine("Ingrese altura:");
            var height = Convert.ToDouble(Console.ReadLine());

            inputDto = new AreaRectangleInputDto { Width = width, Height = height };

            var result = inputDto.CalculateArea();

            Console.WriteLine($"El área es de: {result}");

            break;
        case "2":
            shape = GeometricShapes.Circle;
            break;
        case "3":
            shape = GeometricShapes.Triangle;
            break;
        default:
            break;
    }

    if (input is null)
    {
        return;
    }
}
