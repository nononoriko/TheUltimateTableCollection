namespace Ext;

public class Table {
    Table(uint Row = 1, uint Column = 1) {
        if(Row == 0 && Column == 0)
            throw new ArgumentOutOfRangeException(nameof(Row), "Cannot create a table with 0 cells.");

        if(Row > 0 && Column == 0)
            Column = 1;
        else if(Row == 0 && Column > 0)
            Row = 1;

        while(this.TableList.Count < Row)
            TableList.Add([]);

        for(int i = 0; i < this.TableList.Count; ++i) {
            while(this.TableList[i].Count < Column) {
                this.TableList[i].Add("");
            }
        }
    }

    public static Table Parse(List<List<string>> Table) {
        if(Table.Count == 0) {
            return new Table();
        }

        int NumberOfColumns = Table[0].Count;
        foreach(var (Row, Index) in Table.Select((value, i) => (value, i))) {
            if(Row.Count != NumberOfColumns) {
                throw new IndexOutOfRangeException($"Row {Index} has {Row.Count} columns, expected ${NumberOfColumns}.");
            }
        }

        if(NumberOfColumns == 0) {
            return new Table((uint)Table.Count);
        }

        return new() {
            TableList = Table
        };
    }

    public void Add(string Where, uint Count = 1) {
        if(Count == 0)
            throw new IndexOutOfRangeException("count must be greater than 0.");

        for(uint _ = 0; _ < Count; ++_) {
            switch(Where) {
                case "T":
                case "Top":
                    this.TableList.Insert(0, []);
                    break;

                case "B":
                case "Bottom":
                    this.TableList.Add([]);
                    break;

                case "L":
                case "Left":
                    for(int i = 0; i < TableList.Count; ++i) {
                        TableList[i].Insert(0, "");
                    }
                    break;

                case "R":
                case "Right":
                    for(int i = 0; i < TableList.Count; ++i) {
                        TableList[i].Add("");
                    }
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(Where), $"Unknown direction: {Where}");
            }
        }
    }

    public void Set(string Value, uint Row, uint Column) {
        if(Row >= this.TableList.Count || Column >= this.TableList[0].Count)
            throw new ArgumentOutOfRangeException(nameof(Row), "Table index out of range.");

        this.TableList[(int)Row][(int)Column] = Value;
    }

    public void Delete(string Type, uint Index) {
        string[] AllowedTypes = ["Row", "Column", "R", "C"];
        if(!AllowedTypes.Contains(Type))
            throw new ArgumentOutOfRangeException(nameof(Type), $"Unknown type: {Type}.");

        if(Type.StartsWith('R') && Index >= this.TableList.Count || Type.StartsWith('C') && Index >= this.TableList[0].Count)
            throw new ArgumentOutOfRangeException(nameof(Index), "Table index out of range.");

        if(Type.StartsWith('R') && this.TableList.Count == 1 || Type.StartsWith('C') && this.TableList[0].Count == 1)
            throw new ArgumentOutOfRangeException(nameof(Index), "Cannot remove the last row/column of the table.");

        switch(Type) {
            case "R":
            case "Row":
                this.TableList.RemoveAt((int)Index);
                break;

            default:
                for(int i = 0; i < this.TableList.Count; ++i)
                    this.TableList[i].RemoveAt((int)Index);
                break;
        }
    }

    public List<string> GetLine(string Type, uint Index) {
        string[] AllowedTypes = ["Row", "Column", "R", "C"];
        if(!AllowedTypes.Contains(Type))
            throw new ArgumentOutOfRangeException(nameof(Type), $"Unknown type: {Type}.");

        if(Type.StartsWith('R') && Index >= this.TableList.Count || Type.StartsWith('C') && Index >= this.TableList[0].Count)
            throw new ArgumentOutOfRangeException(nameof(Index), "Table index out of range.");

        return Type switch {
            "R" or "Row" => TableList[(int)Index],
            _ => Ext.Zip(TableList)[(int)Index]
        };
    }

    public string Get(uint Row, uint Column) {
        if(Row >= this.TableList.Count || Column >= this.TableList[0].Count)
            throw new ArgumentOutOfRangeException(nameof(Row), "Table index out of range.");

        return this.TableList[(int)Row][(int)Column];
    }

    public string Stringify(string Alignment = "L") {
        string[] AllowedAlignments = ["Left", "Right", "Center", "L", "R", "C"];
        if(!AllowedAlignments.Contains(Alignment))
            throw new ArgumentOutOfRangeException(nameof(Alignment), $"Unknown alignment: {Alignment}.");


        List<int> LongestPerColumn = [.. Ext.Zip(this.TableList).Select(Column => Column.Select(Cell => Cell.Length).Max())];
        string Seperator = $"+{string.Join("+", LongestPerColumn.Select(Width => new string('-', Width + 2)))}+";
        List<string> Output = [Seperator];

        foreach(List<string> Row in this.TableList) {
            List<string> CellStrings = [.. Row.Select((Cell, Column) => (Cell, Column)).ToList().Select((Row) =>
                Alignment[0] switch {
                    'R' => Row.Cell.PadLeft(LongestPerColumn[Row.Column]),
                    'L' => Row.Cell.PadRight(LongestPerColumn[Row.Column]),
                    _ => Ext.Center(Row.Cell, (uint)LongestPerColumn[Row.Column])
                }
            )];
            string RowString = $"| {string.Join(" | ", CellStrings)} |";
            Output.Add(RowString);
            Output.Add(Seperator);
        }
        return string.Join("\n", Output);
    }

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