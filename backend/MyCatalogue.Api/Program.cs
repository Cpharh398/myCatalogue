using System.Text.Json;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5182");

var app = builder.Build();
var sitesDirectory = Path.Combine(builder.Environment.ContentRootPath, "data", "sites");
Directory.CreateDirectory(sitesDirectory);

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

async Task<IResult> Publish(PublishRequest request, CancellationToken cancellationToken)
{
    if (string.IsNullOrWhiteSpace(request.Name))
        return Results.BadRequest(new { error = "Give your website a name before publishing." });
    if (request.Pages.ValueKind != JsonValueKind.Array || request.Pages.GetArrayLength() == 0)
        return Results.BadRequest(new { error = "Add at least one page before publishing." });

    var slug = Regex.Replace(request.Name.Trim().ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');
    if (string.IsNullOrEmpty(slug)) slug = "my-site";
    if (slug.Length > 64) slug = slug[..64].TrimEnd('-');
    if (slug is "editor" or "myworkspace" or "api") slug += "-site";

    var document = JsonSerializer.Serialize(new
    {
        name = request.Name.Trim(),
        slug,
        templateId = request.TemplateId,
        publishedAt = DateTimeOffset.UtcNow,
        pages = request.Pages,
    }, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true });

    var destination = Path.Combine(sitesDirectory, slug + ".json");
    var temporary = destination + ".tmp";
    await File.WriteAllTextAsync(temporary, document, cancellationToken);
    File.Move(temporary, destination, overwrite: true);

    return Results.Ok(new { name = request.Name.Trim(), slug, url = $"/{slug}" });
}

app.MapPost("/api/publish", Publish);

IResult LoadSite(string slug)
{
    if (!Regex.IsMatch(slug, "^[a-z0-9]+(?:-[a-z0-9]+)*$")) return Results.NotFound();
    var file = Path.Combine(sitesDirectory, slug + ".json");
    if (!File.Exists(file)) return Results.NotFound();
    return Results.File(file, "application/json");
}

app.MapGet("/api/sites/{slug}", LoadSite);

app.Run();

record PublishRequest(string Name, JsonElement Pages, string? TemplateId);
