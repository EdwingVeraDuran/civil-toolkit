using CivilToolkit.Core.Enums;

namespace CivilToolkit.Core.Models;

public class BaseResult<T>
{
    public ResultStatus Status { get; set; }

    public string ToolName { get; set; } = string.Empty;

    public T? Data { get; set; }

    public string? Error { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
