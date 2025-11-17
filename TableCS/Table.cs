using System.Data;

namespace Ext;

public class Table {
    Table(uint Row = 1, uint Column = 1) {
        if(Row == 0 && Column == 0)
            throw new DataException("Cannot create a table with 0 cells.");
        else if(Column == 0)
            throw new ArgumentOutOfRangeException(nameof(Column), "Cannot create a table with 0 columns.");
        else if(Row == 0)
            throw new ArgumentOutOfRangeException(nameof(Row), "Cannot create a table with 0 rows.");

        TableList = [.. Enumerable.Repeat<List<string>>([.. Enumerable.Repeat("", (int)Column)], (int)Row)];
    }

    public static Table Parse(List<List<string>> Table) {
        if(Table.Count == 0)
            throw new ArgumentOutOfRangeException(nameof(Table), "Cannot create a table with 0 rows.");

        int NumberOfColumns = Table[0].Count;
        if(NumberOfColumns == 0)
            throw new ArgumentOutOfRangeException(nameof(Table), "Cannot create a table with 0 columns.");
        
        foreach(var (Row, Index) in Table.Select((value, i) => (value, i))) {
            if(Row.Count != NumberOfColumns) {
                throw new IndexOutOfRangeException($"Row {Index} has {Row.Count} columns, expected {NumberOfColumns}.");
            }
        }

        return new() {
            TableList = Table
        };
    }

    public void AddRow(uint Index, uint Count = 1) {
        if(Count == 0)
            throw new IndexOutOfRangeException("count must be greater than 0.");

        for(int _ = 0; _ < Count; _++) {
            this.TableList.Insert((int)Index, [.. Enumerable.Repeat("", this.GetLength())]);
        }
    }

    public void AddColumn(uint Index, uint Count = 1) {
        if(Count == 0)
            throw new IndexOutOfRangeException("count must be greater than 0.");

        foreach(List<string> Row in this.TableList) {
            for(uint _ = 0; _ < Count; ++_) {
                Row.Insert((int)Index, "");
            }
        }
    }

    public void Set(string Value, uint Row, uint Column) => this.TableList[(int)Row][(int)Column] = Value;
    
    public void DeleteRow(uint Index) {
        if(this.GetLength() == 1)
            throw new ArgumentOutOfRangeException(nameof(Index), "Cannot remove the last row of the table.");

        this.TableList.RemoveAt((int)Index);
    }

    public void DeleteColumn(uint Index) {
        if(this.GetWidth() == 1)
            throw new ArgumentOutOfRangeException(nameof(Index), "Cannot remove the last column of the table.");

        foreach(List<string> Row in this.TableList)
            Row.RemoveAt((int)Index);
    }

    public string Get(uint Row, uint Column) => this.TableList[(int)Row][(int)Column];

    public int GetLength() => this.TableList.Count;

    public int GetWidth() => Ext.Zip(this.TableList).Count;

    public List<string> GetRow(uint Index) => this.TableList[(int)Index];
    
    public List<string> GetColumn(uint Index) => Ext.Zip(TableList)[(int)Index];

    public string Stringify(string Alignment = "L") {
        string[] AllowedAlignments = ["Left", "Right", "Center", "L", "R", "C"];
        if(!AllowedAlignments.Contains(Alignment))
            throw new ArgumentOutOfRangeException(nameof(Alignment), $"Unknown alignment: {Alignment}.");

        List<int> LongestPerColumn = [.. Ext.Zip(this.TableList).Select(Column => Column.Select(Cell => Cell.Length).Max())];

        string FirstSeparator = $"┌{string.Join("┬", LongestPerColumn.Select(Width => new string('─', Width + 2)))}┐";
        string Separator = $"├{string.Join("┼", LongestPerColumn.Select(Width => new string('─', Width + 2)))}┤";
        string LastSeparator = $"└{string.Join("┴", LongestPerColumn.Select(Width => new string('─', Width + 2)))}┘";

        List<string> Output = [FirstSeparator];
        int Iteration = 0;
        foreach(List<string> Row in this.TableList) {
            List<string> CellStrings = [.. Row.Select((Cell, Column) => (Cell, Column)).ToList().Select((Row) =>
                Alignment[0] switch {
                    'R' => Row.Cell.PadLeft(LongestPerColumn[Row.Column]),
                    'L' => Row.Cell.PadRight(LongestPerColumn[Row.Column]),
                    _ => Ext.Center(Row.Cell, (uint)LongestPerColumn[Row.Column])
                }
            )];
            string RowString = $"│ {string.Join(" │ ", CellStrings)} │";
            Output.Add(RowString);

            if(Iteration == this.GetLength() - 1)
                Output.Add(LastSeparator);
            else Output.Add(Separator);
            Iteration += 1;
        }
        return string.Join("\n", Output);
    }

    public string CSVify() => string.Join("\n", this.TableList.Select((Row) => string.Join(",", Row)));

    private List<List<string>> TableList = [];
}

public static class Ext {
    public static List<List<T>> Zip<T>(List<List<T>> Data) {
        if(Data == null || Data.Count == 0)
            return [];

        int MinLength = Data.Min(L => L.Count);
        List<List<T>> Output = [];

        for(int i = 0; i < MinLength; ++i) {
            List<T> ZippedItem = [];
            foreach(List<T> L in Data) {
                ZippedItem.Add(L[i]);
            }
            Output.Add(ZippedItem);
        }

        return Output;
    }

    public static string Center(string String, uint Width, char Padding = ' ') {
        if(String.Length >= Width)
            return String;

        int TotalPadding = (int)Width - String.Length;
        int Left = TotalPadding / 2;
        int Right = TotalPadding - Left;
        return $"{new string(Padding, Left)}{String}{new string(Padding, Right)}";
    }
}