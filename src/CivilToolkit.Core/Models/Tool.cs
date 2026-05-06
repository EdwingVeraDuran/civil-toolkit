using CivilToolkit.Core.Enums;

namespace CivilToolkit.Core.Models;

public abstract class Tool<TInput, TOutput>
{
    public string Key { get; }
    public string Name { get; }
    public string Description { get; }
    public ToolCategory Category { get; }
    public string Version { get; }

    protected Tool(
        string key,
        string name,
        string description,
        ToolCategory category,
        string version
    )
    {
        Key = key;
        Name = name;
        Description = description;
        Category = category;
        Version = version;
    }

    public abstract bool Validate(TInput inputData);

    public abstract BaseResult<TOutput> Calculate(TInput inputData);
}
