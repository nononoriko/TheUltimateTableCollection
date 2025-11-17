import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class Table {
    public Table(int Row, int Column) {
        if(Row <= 0 && Column <= 0) 
            throw new Illegal­Argument­Exception("Cannot create a table with 0 cells.");
        else if(Column <= 0)
            throw new Illegal­Argument­Exception("Cannot create a table with 0 columns.");
        else if(Row <= 0) 
            throw new Illegal­Argument­Exception("Cannot create a table with 0 rows.");
        
        this.TableList = new ArrayList<>(Collections.nCopies(Row, new ArrayList<>(Collections.nCopies(Column, ""))));
    }

    public Table(int Row) {
        this(Row, 1);
    }

    public Table() {
        this(1);
    }

    public static Table Parse(List<List<String>> Table) {
        if(Table.isEmpty())
            throw new Illegal­Argument­Exception("Cannot create a table with 0 rows.");
        
        int NumberOfColumns = Table.get(0).size();
        if(NumberOfColumns == 0)
            throw new Illegal­Argument­Exception("Cannot create a table with 0 columns.");

        Ext.Enumerate(Table).forEach((Index, Row) -> {
            if(Row.size() != NumberOfColumns) {
                throw new Illegal­Argument­Exception(
                    String.format("Row %d has %d columns, expected %d.", Index, Row.size(), NumberOfColumns)
                );
            }
        });

        Table New = new Table();
        New.TableList = Table;

        return New;
    }

    public void AddRow(int Index, int Count) {
        for(int i = 0; i < Count; i++) {
            this.TableList.add(new ArrayList<>(Collections.nCopies(this.GetLength(), "")));
        }
    }

    public void AddColumn(int Index, int Count) {
        for(List<String> Row : this.TableList) {
            for(int i = 0; i < Count; i++) {
                Row.add("");
            }
        }
    }

    public void AddRow(int Index) {
        this.AddRow(Index, 1);
    }

    public void AddColumn(int Index) {
        this.AddColumn(Index, 1);
    }

    public void Set(String Value, int Row, int Column) {
        this.TableList.get(Row).set(Column, Value);
    }

    public void DeleteRow(int Index) {
        this.TableList.remove(Index);
    }

    public void DeleteColumn(int Index) {
        for(List<String> Row : this.TableList) {
            Row.remove(Index);
        }
    }

    public int GetLength() {
        return this.TableList.size();
    }

    public int GetWidth() {
        return Ext.Zip(this.TableList).size();
    }

    public List<String> GetRow(int Index) {
        return this.TableList.get(Index);
    }

    public List<String> GetColumn(int Index) {
        return Ext.Zip(this.TableList).get(Index);
    }

    public String Get(int Row, int Column) {
        return this.TableList.get(Row).get(Column);
    }

    public String Stringify(String Alignment) {
        List<String> AllowedAlignments = Arrays.asList(new String[] { "Left", "Right", "Center", "L", "R", "C" });
        if(!AllowedAlignments.contains(Alignment))
            throw new Illegal­Argument­Exception(String.format("Unknown alignment: %s.", Alignment));

        List<Integer> LongestPerColumn = Ext.Zip(this.TableList).stream().map(Column -> Collections.max(Column.stream().map(Cell -> Cell.length()).collect(Collectors.toList()))).collect(Collectors.toList());

        String FirstSeparator = String.format("┌%s┐", String.join("┬", LongestPerColumn.stream().map(Width -> "─".repeat(Width + 2)).collect(Collectors.toList())));
        String Separator = String.format("├%s┤", String.join("┼", LongestPerColumn.stream().map(Width -> "─".repeat(Width + 2)).collect(Collectors.toList())));
        String LastSeparator = String.format("└%s┘", String.join("┴", LongestPerColumn.stream().map(Width -> "─".repeat(Width + 2)).collect(Collectors.toList())));

        List<String> Output = new ArrayList<>();
        Output.add(FirstSeparator);

        int Iteration = 0;
        for(List<String> Row : this.TableList) {
            List<String> CellStrings = new ArrayList<>();
            for(int i = 0; i < Row.size(); ++i) {
                String Cell = Row.get(i);
                int Width = LongestPerColumn.get(i);
                String Formatted = switch(Alignment.charAt(0)) {
                    case 'R' -> Ext.RJust(Cell, Width);
                    case 'L' -> Ext.LJust(Cell, Width);
                    default -> Ext.Center(Cell, Width);
                };
                CellStrings.add(Formatted);
            }
            Output.add(String.format("│ %s │", String.join(" │ ", CellStrings)));

            if(Iteration == this.GetLength() - 1)
                Output.add(LastSeparator);
            else Output.add(Separator);
            Iteration += 1;
        }
        return String.join("\n", Output);
    }

    public String Stringify() {
        return this.Stringify("L");
    }

    public String CSVify() {
        return String.join("\n", this.TableList.stream().map(Row -> String.join(",", Row)).collect(Collectors.toList()));
    }

    /* /*For testing purpose
    public static void main(String[] Args) {
        Table table;
        try {
            List<String> Lines = Files.readAllLines(Paths.get("./poemwords.csv"));
            List<List<String>> CSVList = Lines.stream().map(Line -> Arrays.asList(Line.split(","))).collect(Collectors.toList());

            table = Table.Parse(CSVList);
        }
        catch(IOException e) {
            System.err.println("Error reading file: " + e.getMessage());
            return;
        }

        try {
            Files.write(Paths.get("./output.txt"), table.Stringify().getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } 
        catch(IOException e) {
            System.err.println("Error writing to file: " + e.getMessage());
        }
    }*/

    private List<List<String>> TableList;
}

class Ext {
    public static <T> Map<Integer, T> Enumerate(List<T> Iterable) {
        Map<Integer, T> Output = new HashMap<>();
        for(int i = 0; i < Iterable.size(); ++i)
            Output.put(i, Iterable.get(i));

        return Output;
    }

    public static <T> List<List<T>> Zip(List<List<T>> Lists) {
        if(Lists == null || Lists.isEmpty()) 
            return List.of();

        int MinSize = Lists.stream().mapToInt(List::size).min().orElse(0);
        return IntStream.range(0, MinSize).mapToObj(Index -> Lists.stream().map(List -> List.get(Index)).collect(Collectors.toList())).collect(Collectors.toList());
    }

    public static String LJust(String Str, int Width, char Padding) {
        if(Str.length() >= Width)
            return Str;
        return String.format("%s%s", Str, String.valueOf(Padding).repeat(Width - Str.length()));
    }

    public static String LJust(String Str, int Width) {
        return LJust(Str, Width, ' ');
    }

    public static String RJust(String Str, int Width, char Padding) {
        if(Str.length() >= Width)
            return Str;
        return String.format("%s%s", String.valueOf(Padding).repeat(Width - Str.length()), Str);
    }

    public static String RJust(String Str, int Width) {
        return RJust(Str, Width, ' ');
    }

    public static String Center(String Str, int Width, char Padding) {
        if(Str.length() >= Width)
            return Str;
        
        int TotalPadding = Width - Str.length();
        int Left = TotalPadding / 2;
        int Right = TotalPadding - Left;
        return String.format("%s%s%s", String.valueOf(Padding).repeat(Left), Str, String.valueOf(Padding).repeat(Right));
    }

    public static String Center(String Str, int Width) {
        return Center(Str, Width, ' ');
    }
}