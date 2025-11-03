using Ext;

public static class Program {
    public static void Main(string[] Args) {
        string CSVString = File.ReadAllText("./poemwords.csv");
        Table table = Table.Parse(CSVParse(CSVString));
        File.WriteAllText("./output.txt", table.Stringify("C"));
    }
    
    public static List<List<string>> CSVParse(string CSVString) {
        return [.. CSVString.Split("\n").Select(Row => Row.Trim().Split(",").ToList())];
    }
}