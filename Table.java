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
        if(Row <= 0)
            throw new Illegal­Argument­Exception("Cannot create a table with 0 rows.");
        
        this.TableList = new ArrayList<>(Collections.nCopies(Row, new ArrayList<>(Collections.nCopies(1, ""))));
    }

    public Table() {
        this.TableList = new ArrayList<>(Collections.nCopies(1, new ArrayList<>(Collections.nCopies(1, ""))));
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

    public void Add(String Where, int Count) {
        if(Count <= 0)
            throw new Illegal­Argument­Exception("Count cannot be less than 0.");

        for(int i = 0; i < Count; ++i) {
            switch(Where.charAt(0)) {
                case 'T' -> this.TableList.add(0, new ArrayList<>(Collections.nCopies(this.TableList.get(0).size(), "")));
                case 'B' -> this.TableList.add(new ArrayList<>(Collections.nCopies(this.TableList.get(0).size(), "")));
                
                case 'L' -> {
                    for(List<String> Row : this.TableList)
                        Row.add(0, "");
                }
                case 'R' -> {
                    for(List<String> Row : this.TableList)
                        Row.add("");
                }
                
                default -> throw new Illegal­Argument­Exception(String.format("Unknown direction: %s.", Where));
            }
        }
    }

    public void Add(String Where) {
        this.Add(Where, 1);
    }

    public void Set(String Value, int Row, int Column) {
        if(Row >= this.TableList.size() && Row < 0 || Column >= this.TableList.size() && Column < 0)
            throw new Array­Index­Out­Of­Bounds­Exception("Table index out of range.");
        
        this.TableList.get(Row).set(Column, Value);
    }

    public void Delete(String Type, int Index) {
        List<String> AllowedTypes = Arrays.asList(new String[] { "Row", "Column", "R", "C" });
        if(!AllowedTypes.contains(Type))
            throw new Illegal­Argument­Exception(String.format("Unknown type: %s.", Type));

        if((Type.startsWith("R") && Index >= this.TableList.size() || Type.startsWith("C") && Index >= this.TableList.get(0).size()) || Index < 0)
            throw new Array­Index­Out­Of­Bounds­Exception("Table index out of range.");

        if(Type.startsWith("R") && this.TableList.size() == 1 || Type.startsWith("C") && this.TableList.get(0).size() == 1)
            throw new Illegal­Argument­Exception("Cannot remove the last row/column of the table.");

        switch(Type.charAt(0)) {
            case 'R' -> this.TableList.remove(Index);
            default -> {
                for(List<String> Row : this.TableList) {
                    Row.remove(Index);
                }
            }
        }
    }

    public List<String> GetLine(String Type, int Index) {
        List<String> AllowedTypes = Arrays.asList(new String[] { "Row", "Column", "R", "C" });
        if(!AllowedTypes.contains(Type))
            throw new Illegal­Argument­Exception(String.format("Unknown type: %s.", Type));

        if((Type.startsWith("R") && Index >= this.TableList.size() || Type.startsWith("C") && Index >= this.TableList.get(0).size()) || Index < 0)
            throw new Array­Index­Out­Of­Bounds­Exception("Table index out of range.");
        
        return switch(Type.charAt(0)) {
            case 'R' -> this.TableList.get(Index);
            default -> Ext.Zip(this.TableList).get(Index);
        };
    }

    public String Get(int Row, int Column) {
        if(Row >= this.TableList.size() || Row < 0 || Column >= this.TableList.get(0).size() || Column < 0)
            throw new Array­Index­Out­Of­Bounds­Exception("Table index out of range.");

        return this.TableList.get(Row).get(Column);
    }

    
    public String Stringify(String Alignment) {
        List<String> AllowedAlignments = Arrays.asList(new String[] { "Left", "Right", "Center", "L", "R", "C" });
        if(!AllowedAlignments.contains(Alignment))
            throw new Illegal­Argument­Exception(String.format("Unknown alignment: %s.", Alignment));

        List<Integer> LongestPerColumn = Ext.Zip(this.TableList).stream().map(Column -> Collections.max(Column.stream().map(Cell -> Cell.length()).collect(Collectors.toList()))).collect(Collectors.toList());
        String Seperator = String.format("+%s+", String.join("+", LongestPerColumn.stream().map(Width -> "-".repeat(Width + 2)).collect(Collectors.toList())));
        List<String> Output = new ArrayList<>();
        Output.add(Seperator);
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
            Output.add(String.format("| %s |", String.join(" | ", CellStrings)));
            Output.add(Seperator);
        }
        return String.join("\n", Output);
    }

    public String Stringify() {
        return this.Stringify("L");
    }

    /* For testing purpose
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

        int minSize = Lists.stream().mapToInt(List::size).min().orElse(0);
        return IntStream.range(0, minSize).mapToObj(Index -> Lists.stream().map(List -> List.get(Index)).collect(Collectors.toList())).collect(Collectors.toList());
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